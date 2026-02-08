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
   - 「研究」→「分析」、「探討」、「檢視」、「調查」
   - 「顯示」→「證實」、「發現」、「揭示」、「指出」
   - 「重要」→「關鍵」、「核心」、「主要」
   - 「影響」→「作用」、「效應」、「衝擊」
   - 「提升」→「改善」、「增進」、「強化」
   
   ❌ 「研究發現...研究顯示...研究證實...」（重複「研究」）
   ✅ 「資料顯示...分析發現...實驗證實...」

3. **句子長度變化（Burstiness）**
   刻意混合極短句（5-10字）、中句（15-25字）、長句（30-50字）
   
   範例節奏：
   「這值得深思。（短）資料顯示兩者之間存在正相關，且相關係數達0.75。（中）進一步分析發現，當控制變數X後，這種相關性依然顯著，這暗示Y可能是影響Z的獨立因素。（長）」

4. **自然的邏輯銜接**
   少用連接詞，多用主詞變化和邏輯暗示。
   
   **嚴禁**：「首先」、「其次」、「再者」、「此外」、「然而」、「因此」、「總地來說」、「綜上所述」
   
   改用：
   - 主詞變化：「本研究...」→「資料...」→「這些發現...」
   - 代詞：「這」、「該」、「此一」
   - 直接陳述：不加連接詞，直接開始新句
   - 動詞暗示因果：「促使」、「導致」、「影響」而非「因此」
   
   ❌ 「首先，我們分析了...。其次，我們發現...。」
   ✅ 「我們首先分析了...。資料顯示...。」

5. **展現思考過程**
   不要只陳述結論，要有思考軌跡。
   
   ❌ 「結果顯示X與Y有關。」（太直接，像AI）
   ✅ 「從結果來看，X似乎與Y存在關聯。這可能反映了...」（有思考）
   
   ❌ 「方法有效。」
   ✅ 「實驗數據證實了這種方法的有效性。值得注意的是...」
   
   用這些表達：
   - 「從...來看」、「可以觀察到」、「值得注意的是」
   - 「似乎」、「可能」、「傾向於」、「在某種程度上」
   - 「進一步來看」、「換個角度」、「有趣的是」

6. **刪除冗詞贅字**
   台灣學生寫作追求簡潔，不要過度使用：
   - 減少「被」字句（改用主動）
   - 簡化「的」字結構：「研究的結果」→「研究結果」
   - 避免名詞化：「進行分析」→「分析」、「具有重要性」→「重要」

7. **段落結構變化**
   不要每段都是「觀點→證據→結論」的固定模式。
   
   可以：
   - 先給證據再提觀點
   - 直接陳述發現
   - 用問題開頭
   - 不同段落用不同開頭方式

【具體改寫範例】

範例1 - 主動語態：
❌ 首先，企業的流動資產狀況需要被分析。
✅ 我們首先需要分析企業的流動資產狀況。

範例2 - 自然敘述：
❌ 技術創新：人工智慧技術推動了生產效率的提升。
✅ 另一個推動生產效率提升的因素是技術創新，特別是人工智慧的應用。

範例3 - 合併短句，變化主詞：
❌ 企業應重視人才培養。人才是企業發展的核心。企業需建立完善的培訓體系。
✅ 企業應重視人才這一發展核心，並透過建立完善的培訓體系來保障人才質量。

範例4 - 詞彙多樣性：
❌ 研究表明該方法有效。研究結果顯示成功率提高了15%。研究者認為這是重大突破。
✅ 實驗數據證實了這種方法的有效性，測試顯示其成功率提升了15%，專家們認為這是領域內的一個重大進展。

【操作限制】
- **絕對保持原意**：不改變任何事實、數據、觀點和結論
- **只輸出結果**：不要解釋、不要前言
- **確保學術品質**：在去AI化的同時，維持論文的嚴謹性
- **目標**：讀起來像真實的台灣碩士生，經過多次修改後的論文

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