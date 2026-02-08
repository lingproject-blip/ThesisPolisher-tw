import { GoogleGenAI } from "@google/genai";
import { apiKeyManager } from "./apiKeyManager";

const SYSTEM_INSTRUCTION = `
你是一位台灣的碩士研究生，正在幫助同學潤飾論文。你的寫作風格自然、學術但不迂腐。

【核心要求】
1. 模仿真實台灣碩士生的寫作習慣：
   - 句子長短不一，有節奏變化（避免所有句子長度相似）
   - 有些句子簡短有力，有些句子較長且包含補充說明
   - 段落內的句子結構要有變化，不要過於工整
   - 刻意打破規律性，讓文字有自然的起伏

2. 自然的邏輯銜接（這是關鍵！）：
   - 嚴格禁用這些機械化連接詞：「首先」、「其次」、「再者」、「此外」、「然而」、「因此」、「總地來說」、「綜上所述」、「至關重要」、「深入探究」、「顯著提升」
   - 改用自然過渡：主詞承接、代詞指涉、因果關係暗示、時間順序自然流動
   - 範例對比：
     ❌ 「此外，本研究發現...」
     ✅ 「研究也發現...」或「另一個值得注意的現象是...」或直接開始新句
     ❌ 「然而，結果顯示...」
     ✅ 「但結果顯示...」或「不過...」或「結果卻顯示...」

3. 詞彙選擇要平實：
   - 避免華麗空洞的詞彙：
     ❌ 「至關重要」→ ✅ 「重要」或「很重要」
     ❌ 「深入探究」→ ✅ 「探討」或「研究」
     ❌ 「顯著提升」→ ✅ 「提升」或「明顯提升」
     ❌ 「充分說明」→ ✅ 「說明」
   - 使用精確但平實的學術用語
   - 像是在跟同學解釋，而不是在寫正式報告

4. 語氣與風格：
   - 保持客觀但不過於正式
   - 允許適度的語氣變化，展現思考過程
   - 可以用「可以看出」、「值得注意的是」、「有趣的是」等自然表達
   - 避免每句話都用相同的句式開頭

5. 結構變化技巧：
   - 混合使用主動和被動語態（以主動為主，約70%主動）
   - 適當使用插入語、破折號、括號來補充說明
   - 不要讓每個段落都以相同方式開頭或結尾
   - 句子之間的連接要自然，不要過度依賴連接詞

【操作限制】
- 嚴格保持原文的事實、數據、觀點和結論
- 只輸出潤飾後的文本，不要任何解釋或前言
- 確保輸出讀起來像是人寫的，有自然的節奏和呼吸感
- 要像是一個真實的台灣學生在寫論文，而不是AI在模仿

請對輸入的文本進行潤飾。
`;

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Determine error type from error message
function getErrorType(errorMessage: string): 'quota' | 'auth' | 'network' | 'other' {
  const msg = errorMessage.toLowerCase();

  if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('429')) {
    return 'quota';
  }
  if (msg.includes('api key') || msg.includes('authentication') || msg.includes('unauthorized') || msg.includes('401') || msg.includes('403')) {
    return 'auth';
  }
  if (msg.includes('network') || msg.includes('timeout') || msg.includes('econnrefused')) {
    return 'network';
  }
  return 'other';
}

export const polishThesis = async (text: string): Promise<string> => {
  // Check if any API keys are configured
  if (!apiKeyManager.hasKeys()) {
    throw new Error("尚未設置 API 密鑰。請在設置中添加至少一個 Gemini API 密鑰。");
  }

  let lastError: Error | null = null;
  const maxKeyAttempts = apiKeyManager.getAvailableKeys().length;

  // Try with different API keys
  for (let keyAttempt = 0; keyAttempt < maxKeyAttempts; keyAttempt++) {
    const apiKey = apiKeyManager.getCurrentKey();

    if (!apiKey) {
      throw new Error("所有 API 密鑰都已失效。請檢查密鑰狀態或添加新的密鑰。");
    }

    // Retry logic for transient errors with current key
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        // Using gemini-1.5-flash for reliable text generation
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: text,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.9,  // Increased from 0.7 to add more variability
            topP: 0.9,         // Adjusted from 0.95 for more diverse word choices
            maxOutputTokens: 8000,  // Increased from 2000 to handle longer paragraphs
          }
        });

        const polishedText = response.text;

        if (!polishedText) {
          throw new Error("模型未返回任何內容，請稍後再試。");
        }

        // Mark success for current key
        apiKeyManager.markSuccess();

        return polishedText.trim();

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMessage = lastError.message.toLowerCase();
        const errorType = getErrorType(errorMessage);

        console.error(`Gemini API Error (key attempt ${keyAttempt + 1}, retry ${attempt + 1}/${MAX_RETRIES + 1}):`, error);

        // For quota or auth errors, don't retry with same key - switch immediately
        if (errorType === 'quota' || errorType === 'auth') {
          apiKeyManager.markFailure(errorType);

          if (errorType === 'quota') {
            console.log('Quota exceeded, switching to next API key...');
            break; // Break retry loop, try next key
          }
          if (errorType === 'auth') {
            console.log('Authentication failed, switching to next API key...');
            break; // Break retry loop, try next key
          }
        }

        // For network errors, retry with same key
        if (errorType === 'network' && attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY * (attempt + 1));
          continue;
        }

        // For other errors, mark and retry
        if (attempt >= MAX_RETRIES) {
          apiKeyManager.markFailure(errorType);
          break; // Break retry loop, try next key
        }
      }
    }
  }

  // If all keys failed, throw error with helpful message
  const stats = apiKeyManager.getStats();
  throw new Error(
    `所有 API 密鑰都無法使用。` +
    `可用: ${stats.available}/${stats.total}。` +
    `最後錯誤: ${lastError?.message || '未知錯誤'}。` +
    `請檢查密鑰狀態或添加新的密鑰。`
  );
};