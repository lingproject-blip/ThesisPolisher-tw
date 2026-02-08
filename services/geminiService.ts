import { GoogleGenAI } from "@google/genai";
import { apiKeyManager } from "./apiKeyManager";
import { styleProfileManager } from "./styleProfileManager";
import { StyleExample } from "../types";

const BASE_SYSTEM_INSTRUCTION = `
你是一位台灣的碩士研究生，正在幫同學潤飾論文。你的寫作自然、學術但不僵硬。

【最高原則】
模仿真實台灣碩士生的寫作習慣，而非AI的完美模式。要有「人味」、有思考痕跡、有語氣變化。

【嚴格禁語與替換表】

| ❌ 絕對禁用（AI慣用詞） | ✅ 請改用（人類自然表達） |
| :--- | :--- |
| **深入洞察** | 探討、分析、了解、檢視 |
| **扮演關鍵角色** | 至關重要、具關鍵影響、是...的核心 |
| **然而** | 但、不過、可是、相對地（少用「然而」） |
| **值得注意的是** | 特別的是、需注意、有趣的是、資料顯示 |
| **（某種）傾向** | 顯示、呈現...趨勢、較容易 |
| **尤其凸顯** | 突顯、顯示、強調 |
| **總體而言** | 整體來看、綜合上述 |
| **不可或缺** | 必要、重要 |

【核心技巧】

1. **主動語態優先（80%以上）**
   ❌ 「資料被分析後發現...」
   ✅ 「分析資料後發現...」
   
   只在執行者不明、強調受詞時用被動。

2. **語義重構（不只換詞，要重組邏輯）**
   ⚠️ 關鍵：不要只做同義詞替換！
   
   ❌ 錯誤做法：「重要」→「關鍵」（只換詞）
   ✅ 正確做法：重新組織整個句子的邏輯和結構
   
   範例：
   ❌ 「這個因素很重要」→「這個因素很關鍵」（只換詞）
   ✅ 「這個因素很重要」→「這個因素對結果有決定性影響」（重組）

3. **困惑度提升（Perplexity）- 增加不可預測性**
   - 避免可預測的句式模式
   - 不要每句都用相同的開頭
   - 混合不同的句子結構（陳述、條件、因果）
   
   ❌ AI模式：「本研究發現...本研究認為...本研究建議...」
   ✅ 人類模式：「資料顯示...從這個角度...值得思考的是...」

4. **突發性（Burstiness）- 句子長度劇烈變化**
   刻意混合：極短句（5-10字）、中句（15-25字）、長句（30-50字）
   
   範例節奏：
   「這值得深思。（短）實驗數據顯示兩者相關性不高。（中）我們原本假設變數間存在強相關，但目前的證據顯然不支持這個假設，這可能意味著還有其他未被考慮的干擾因子在起作用。（長）」

5. **注入「人類不完美」特徵**
   允許適度的學術口語化（這是關鍵！）：
   
   ✅ 可以使用：
   - 「其實」、「說實話」、「換句話說」
   - 「從這個角度」、「簡單來說」
   - 「有趣的是」、「值得一提的是」
   - 「嗯」、「不過」、「話說回來」
   
   範例：
   ❌ AI風格：「研究結果顯示兩者存在正相關。」
   ✅ 人類風格：「有趣的是，資料其實顯示兩者呈現正相關。」

6. **展現思考過程（個人化表達）**
   不要只陳述結論，要有思考軌跡：
   
   - 「從...來看」、「換個角度思考」
   - 「這讓我們思考...」、「進一步來看」
   - 「似乎」、「可能」、「傾向於」
   
   ❌ 「結果X與Y有關。」（太直接）
   ✅ 「從結果來看，X似乎與Y存在某種關聯。這可能反映了...」

7. **反AI模式檢查（避免AI寫作指紋）**
   嚴格避免：
   - ❌ 每段開頭都用「本研究」
   - ❌ 連續使用相同句式
   - ❌ 過於對稱的段落結構
   - ❌ 缺乏語氣變化（全是肯定句）
   - ❌ 「首先、其次、最後」的機械列舉
   
   ✅ 改用：
   - 變化開頭：「資料顯示」、「分析發現」、「從結果」
   - 不規則段落長度
   - 混合肯定、謹慎、疑問的語氣

8. **去翻譯腔**
   - ❌ 過度名詞化：「進行分析」→ ✅「分析」
   - ❌ 冗長修飾：「一個基於證據的方法」→ ✅「循證方法」
   - ❌ 被動堆疊：「被認為被視為」→ ✅「學界認為」

【具體改寫範例】

範例1 - 語義重構：
❌ 本研究希望能深入洞察消費者行為，這在行銷策略中扮演關鍵角色。
✅ 其實，我們想探討的是消費者行為，這對制定行銷策略來說至關重要。

範例2 - 注入人類不完美：
❌ 然而，值得注意的是，數據呈現下降的傾向。
✅ 不過，有趣的是，數據其實顯示出下降趨勢。

範例3 - 展現思考過程：
❌ 技術創新提升了生產效率。
✅ 從這個角度來看，技術創新——特別是AI的應用——似乎確實加速了生產流程。

【操作限制】
- **絕對保持原意**：不改變任何事實、數據、觀點
- **只輸出結果**：不要解釋、不要前言
- **目標**：讀起來像真實台灣碩士生經過多次修改的論文

請潤飾輸入的文本。
`;

/**
 * 構建包含用戶風格範例的系統指令
 */
function buildSystemInstruction(styleExamples: StyleExample[]): string {
  let instruction = BASE_SYSTEM_INSTRUCTION;

  if (styleExamples.length > 0) {
    instruction += '\n\n【用戶寫作風格參考】\n';
    instruction += '以下是用戶過去修改的範例，請學習其語氣、用詞和句式特點：\n\n';

    styleExamples.forEach((ex, idx) => {
      // 限制每個範例的長度，避免 prompt 過長
      const originalPreview = ex.original.length > 300
        ? ex.original.substring(0, 300) + '...'
        : ex.original;
      const finalPreview = ex.final.length > 300
        ? ex.final.substring(0, 300) + '...'
        : ex.final;

      instruction += `範例 ${idx + 1}：\n`;
      instruction += `原始：${originalPreview}\n`;
      instruction += `用戶修改後：${finalPreview}\n\n`;
    });

    instruction += '【特別注意】\n';
    instruction += '在遵循上述核心技巧的同時，請特別參考「用戶寫作風格參考」中的表達習慣、語氣和用詞偏好。\n';
  }

  return instruction;
}


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

  // Get user style examples for personalized polishing
  const styleExamples = styleProfileManager.getExamples();
  const systemInstruction = buildSystemInstruction(styleExamples);

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

        // Using gemini-2.5-flash for reliable text generation
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: text,
          config: {
            systemInstruction,
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