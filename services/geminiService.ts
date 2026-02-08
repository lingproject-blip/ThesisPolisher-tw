import { GoogleGenAI } from "@google/genai";

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

export const polishThesis = async (text: string): Promise<string> => {
  // Validate API key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("API 密鑰未設置。請在 .env.local 文件中設置 VITE_GEMINI_API_KEY。");
  }

  let lastError: Error | null = null;

  // Retry logic for transient errors
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Using gemini-1.5-flash for reliable text generation
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: text,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7, // Slightly creative to ensure natural flow
          topP: 0.95,
          maxOutputTokens: 2000,
        }
      });

      const polishedText = response.text;

      if (!polishedText) {
        throw new Error("模型未返回任何內容，請稍後再試。");
      }

      return polishedText.trim();
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Gemini API Error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, error);

      // Parse specific error types
      const errorMessage = lastError.message.toLowerCase();
      
      // Don't retry on authentication errors
      if (errorMessage.includes('api key') || errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
        throw new Error("API 密鑰無效或已過期。請檢查您的 Gemini API 密鑰設置。");
      }
      
      // Don't retry on quota errors
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        throw new Error("API 配額已用盡或超出速率限制。請稍後再試或檢查您的 API 配額。");
      }

      // Don't retry on invalid input
      if (errorMessage.includes('invalid') && errorMessage.includes('input')) {
        throw new Error("輸入內容格式有誤，請檢查後重試。");
      }

      // Retry on network errors or temporary issues
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY * (attempt + 1)); // Exponential backoff
        continue;
      }
    }
  }

  // If all retries failed, throw the last error
  throw new Error(`潤飾過程中發生錯誤：${lastError?.message || '未知錯誤'}。請檢查網路連線或稍後再試。`);
};