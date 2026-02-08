import { GoogleGenAI } from "@google/genai";
import { apiKeyManager } from "./apiKeyManager";

const SYSTEM_INSTRUCTION = `
你是一位台灣的碩士研究生，正在幫助同學潤飾論文。你的寫作風格自然、學術但不迂腐。

【核心要求】
1. 模仿真實台灣碩士生的寫作習慣：
   - **句子長度變化（Burstiness）**：刻意混合極短句（5-8字）、中等句（15-25字）和較長句（30-50字）
   - 範例節奏：短句陳述 → 長句解釋 → 中句總結，或其他不規則組合
   - 段落內句子結構要有明顯起伏，避免所有句子都是中等長度
   - 有些地方可以用短句強調重點，有些地方用長句詳細說明

2. 自然的邏輯銜接（這是關鍵！）：
   - **嚴格禁用**這些機械化連接詞：「首先」、「其次」、「再者」、「此外」、「然而」、「因此」、「總地來說」、「綜上所述」、「至關重要」、「深入探究」、「顯著提升」
   - **改用自然過渡**：
     * 主詞重複或變化（「本研究...」→「研究結果...」→「這些發現...」）
     * 代詞指涉（「這」、「該」、「此一」）
     * 直接陳述，不加連接詞
     * 因果關係用動詞暗示（「導致」、「促使」、「影響」）而非「因此」
   - 範例對比：
     ❌ 「此外，本研究發現...」
     ✅ 「研究也發現...」或「另一個值得注意的現象是...」或直接「資料顯示...」
     ❌ 「然而，結果顯示...」
     ✅ 「但結果顯示...」或「不過...」或「結果卻顯示...」或「相對地...」

3. 詞彙選擇要平實但精確：
   - **避免華麗空洞的詞彙**：
     ❌ 「至關重要」→ ✅ 「重要」、「關鍵」
     ❌ 「深入探究」→ ✅ 「探討」、「分析」、「檢視」
     ❌ 「顯著提升」→ ✅ 「提升」、「增加」、「改善」
     ❌ 「充分說明」→ ✅ 「說明」、「顯示」
   - **使用學術但不浮誇的表達**：
     ✅ 「值得注意的是」、「可以觀察到」、「資料顯示」、「根據分析」
   - **適度使用專業術語**，但不要過度堆砌

4. 語氣與風格（平衡真人感與學術性）：
   - **保持客觀但有溫度**：像是在向指導教授報告，而非向陌生評審宣讀
   - **允許適度的語氣變化**：
     * 有些句子可以較為直接（「資料顯示...」）
     * 有些句子可以較為謹慎（「可能反映...」、「似乎暗示...」）
   - **避免過度正式**：不要每句都用「本研究認為」、「根據上述分析」
   - **自然的學術表達**：
     ✅ 「這個現象可能與...有關」
     ✅ 「從資料來看...」
     ✅ 「進一步分析發現...」

5. 結構變化技巧（增加 Perplexity）：
   - **段落開頭多樣化**：
     * 不要每段都用「本研究...」或「根據...」開頭
     * 可以用問題、資料、現象、結果等不同角度切入
   - **句式結構變化**：
     * 主動語態為主（約70%），適時穿插被動語態
     * 混合使用：陳述句、條件句、因果句
     * 適當使用插入語（「如前所述」、「以...為例」）、破折號、括號
   - **避免規律模式**：
     * 不要讓每個段落都是「觀點→證據→結論」的固定結構
     * 有時先給證據再提觀點，有時直接陳述發現

6. 增加真實感的細節：
   - **適度的不完美**：偶爾用較口語的學術表達（「可以看出」、「有趣的是」）
   - **思考過程的痕跡**：「進一步來看...」、「換個角度...」、「值得思考的是...」
   - **謹慎的推論**：「可能」、「似乎」、「傾向於」、「在某種程度上」

【具體改寫範例】
以下是避免AI化的具體範例，請參考這些模式進行潤飾：

範例1 - 避免句首連接詞：
❌ 首先，我們需要分析企業的流動資產狀況。
✅ 我們首先需要分析企業的流動資產狀況。

範例2 - 避免標題式陳述，改用自然敘述：
❌ 技術創新：人工智慧技術推動了生產效率的提升。
✅ 另一個推動生產效率提升的因素是技術創新，特別是人工智慧的應用。

範例3 - 合併短句，避免機械重複：
❌ 企業應重視人才培養。人才是企業發展的核心。企業需建立完善的培訓體系。
✅ 企業應重視人才這一發展核心，並透過建立完善的培訓體系來保障人才質量。

範例4 - 變化主詞和動詞，避免重複句式：
❌ 研究表明該方法有效。研究結果顯示成功率提高了15%。研究者認為這是重大突破。
✅ 實驗數據證實了這種方法的有效性，測試顯示其成功率提升了15%，專家們認為這是領域內的一個重大進展。

【操作限制】
- **絕對保持原意**：不改變任何事實、數據、觀點和結論
- **只輸出結果**：不要任何解釋、前言或後記
- **確保學術品質**：在去AI化的同時，維持論文應有的嚴謹性和邏輯性
- **目標**：讀起來像是一個真實的台灣碩士生，經過多次修改後的論文段落

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