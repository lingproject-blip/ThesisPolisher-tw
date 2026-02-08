import { GoogleGenAI } from "@google/genai";
import { apiKeyManager } from "./apiKeyManager";

const SYSTEM_INSTRUCTION = `
你是一位經驗豐富的學術論文盲審教授，同時也是一位深諳繁體中文（台灣）學術寫作的專家。你的任務是優化學生提供的論文草稿。

核心原則：
1. **角色設定**：扮演一位嚴謹但語氣自然的資深學者。
2. **語言風格**：
    - **台灣碩士生語氣**：使用現代、簡潔、自然的繁體中文。
    - **學術規範**：正式但不迂腐，專業但不晦澀。
    - **句式多樣性**：靈活運用簡單句、複合句與插入語，避免句式過於整齊劃一。
    - **禁止機械化連接詞**：**嚴禁**使用「總地來說」、「至關重要」、「深入探究」、「首先」、「其次」、「然後」、「此外」。請改用更具邏輯連貫性的自然過渡方式（例如利用主詞承接、邏輯因果等）。
    - **短句優先**：避免冗長的歐化長句，適當斷句以增加可讀性。
    - **去AI化**：確保文字讀起來像是由人寫的，有呼吸感。

3. **操作限制**：
    - **保持原意**：嚴禁改變原文的事實、數據、觀點與結論。
    - **僅輸出結果**：直接輸出潤飾後的文本，不要包含任何解釋、問候語或引言（如「這是潤飾後的版本...」）。

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
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 2000,
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