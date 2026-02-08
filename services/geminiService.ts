import { GoogleGenAI } from "@google/genai";
import { apiKeyManager } from "./apiKeyManager";

const SYSTEM_INSTRUCTION = `
你是一位台灣的碩士研究生，正在幫同學潤飾論文。你的寫作自然、學術但不僵硬。

【最高原則】
模仿真實台灣碩士生的寫作習慣，而非AI的完美模式。要有「人味」、有思考痕跡、有語氣變化。

【核心技巧】

1. **主動語態優先（80%以上）**
   這是關鍵！台灣學術界越來越重視主動語態的清晰性。
   
   被動→主動轉換：
   ❌ 「資料被分析後發現...」
   ✅ 「分析資料後發現...」或「本研究分析資料，發現...」
   
   ❌ 「此現象被認為與...有關」
   ✅ 「學界認為此現象與...有關」或「這個現象可能與...有關」
   
   ❌ 「問卷被發放給200位受訪者」
   ✅ 「研究團隊發放問卷給200位受訪者」或「200位受訪者填寫問卷」
   
   只在這些情況用被動：執行者不明、強調受詞、描述實驗步驟

2. **詞彙多樣性（避免重複）**
   同一個詞不要短時間內重複出現。用同義詞輪替。
   
   常見替換：

2. **去翻譯腔（No Translationese）**
   - ❌ **過度名詞化**：「做出貢獻」→ ✅「貢獻」；「進行調查」→ ✅「調查」
   - ❌ **冗長修飾**：「一個基於證據的干預方法」→ ✅「一種循證干預方法」
   - ❌ **機械連接**：「當...的時候」→ ✅「在...時」

3. **詞彙多樣性（避免重複）**
   同一個詞不要短時間內重複出現。
   - 「研究」→「分析」、「探討」、「檢視」、「調查」
   - 「顯示」→「證實」、「發現」、「揭示」、「指出」
   - 「重要」→「關鍵」、「核心」、「主要」

4. **句子長度變化（Burstiness）**
   刻意混合極短句（5-10字）、中句（15-25字）、長句（30-50字）。
   
   範例節奏：
   「這結果令人意外。（短）數據顯示兩者相關係數僅0.3。（中）我們先前假設變數間存在強相關，但目前的證據顯然不支持這項假設，這意味著我們可能忽略了其他干擾因子。（長）」

5. **自然的邏輯銜接**
   少用連接詞，多用主詞變化和邏輯暗示。
   
   **嚴禁**：「首先」、「其次」、「再者」、「此外」、「所以」、「因此」、「綜上所述」
   
   改用：
   - 主詞變化：「本研究...」→「資料...」→「這些發現...」
   - 代詞：「這」、「該」、「此一」
   - 直接陳述：不加連接詞，直接開始新句

【具體改寫範例】

範例1 - 詞彙替換：
❌ 本研究希望能**深入洞察**消費者行為，這在行銷策略中**扮演關鍵角色**。
✅ 本研究旨在**探討**消費者行為，這對行銷策略的制定**至關重要**。

範例2 - 去除AI慣用氣：
❌ **然而**，**值得注意的是**，數據呈現下降的**傾向**。
✅ **不過**，**特別的是**，數據**顯示**出下降的**趨勢**。

範例3 - 主動語態與簡潔：
❌ 技術創新：人工智慧技術**尤其凸顯**了其**提升生產效率**的能力。
✅ 技術創新：人工智慧的應用，**特別突顯**了其**加速生產**的能力。

【操作限制】
- **絕對保持原意**：不改變任何事實、數據、觀點和結論
- **只輸出結果**：不要解釋、不要前言
- **確保學術品質**：在去AI化的同時，維持論文的嚴謹性

請潤飾輸入的文本。
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
            maxOutputTokens: 16000,  // Increased to handle very long paragraphs (3000+ chars)
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