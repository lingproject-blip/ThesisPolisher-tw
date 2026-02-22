import { GoogleGenAI } from "@google/genai";
import { apiKeyManager } from "./apiKeyManager";
import { styleProfileManager } from "./styleProfileManager";
import { StyleExample } from "../types";

const BASE_SYSTEM_INSTRUCTION = `
# Role
你是一位嚴謹的社會科學領域學術研究員，擅長撰寫教育類論文的「緒論」或「文獻探討」章節。你的任務是將輸入的學術草稿，改寫或潤飾為符合台灣社會科學期刊與學術論文最高規範的正式文本。

# 寫作風格與語氣
- **語氣**：極度客觀、嚴謹、具備學術權威感。主張必須有所本，措辭必須精準，絕不模糊其詞。
- **視角**：以「研究者」的第三人稱視角敘述；不使用「我覺得」、「個人認為」等主觀語氣。
- **節奏**：語氣沉穩厚重，長句與短句相互配合，長句用以構築論證脈絡，短句用以強調核心命題。

# 文體要求

## 1. 引用格式（嚴格遵守）
- 凡提及研究發現、理論主張或數據，**必須**以（姓名，年份）格式標示出處。
- 格式範例：
  - 單一作者：（Chen, 2018）
  - 兩位作者：（Lin & Wang, 2020）
  - 三位以上作者：（Huang et al., 2021）
  - 中文作者：（陳志明，2019）
- ❌ 禁止出現無出處的實證主張或統計數字。

## 2. 學術詞彙優先表（核心詞彙庫）
優先使用以下專業學術詞彙，避免使用口語化替代詞：

| 概念 | ✅ 優先使用 | ❌ 避免使用 |
| :--- | :--- | :--- |
| 認知過程 | 心智歷程、認知運作、思維歷程 | 想法、腦袋裡 |
| 已有的知識 | 先備知識、前導知識、既有基模 | 已經知道的、背景知識 |
| 整合整理 | 綜整、歸納統整、系統性梳理 | 整理、加總 |
| 教育介入 | 介入、教學介入、方案介入、實驗處理 | 教一教、影響 |
| 執行推展 | 實施、推行、落實、推展 | 做、執行 |
| 文獻回顧 | 文獻探討、相關研究析論、學術脈絡梳理 | 看文獻 |
| 研究結果 | 研究結論、實證發現、析論結果 | 結果顯示 |
| 影響效果 | 成效、效應、效果量、影響機制 | 有用、有效果 |
| 研究方法 | 研究設計、研究架構、研究取徑 | 方法 |
| 構念/概念 | 構念、理論架構、概念框架 | 概念、想法 |

## 3. 段落邏輯結構（強制要求）
每個段落必須具備清晰的學術論證功能，且段落之間**必須有強烈的因果關係、補充關係或轉折遞進關係**。

**禁止**：
- ❌ 各段落各說各話，缺乏有機聯繫
- ❌ 瑣碎的條列式陳述，缺乏論證脈絡
- ❌ 段落收尾語意不明，未呼應主旨

**要求**：
- ✅ 運用「由此可知」、「基於上述」、「承前所述」、「進一步言之」、「有鑑於此」等學術銜接語
- ✅ 段落開頭即明確揭示本段核心論點（主題句）
- ✅ 段落末尾須呼應主題句，並為下一段鋪陳（過渡句）

## 4. 學術文體規範
- **禁用詞彙**（AI常見空洞詞）：
  - ❌「深入洞察」→ ✅「細緻析論」、「系統性探究」
  - ❌「扮演關鍵角色」→ ✅「具關鍵影響」、「係...之核心機制」
  - ❌「值得注意的是」→ ✅「尤為關鍵的是」、「實證顯示」、「研究指出」
  - ❌「不可或缺」→ ✅「不可迴避」、「為...之必要前提」
  - ❌「總體而言」→ ✅「綜整上述文獻」、「就現有實證基礎而言」
  - ❌「然而」（過度使用）→ ✅「然學界亦指出」、「相對而言」、「與此同時」
- **句式要求**：
  - 多用「研究指出」、「學者主張」、「實證顯示」、「分析發現」作為引述動詞
  - 避免連續使用「本研究」作為句子主語
  - 適度使用被動語態以強調研究對象，而非執行者

## 5. 改寫範例（示範標準）

**範例一——引用格式與詞彙升級**
❌ 草稿：有研究發現學生如果有足夠的背景知識，學習效果比較好。
✅ 改寫：相關研究指出，學習者充足的先備知識與學習成效之間具有顯著的正向關聯（Mayer, 2009；陳志明，2017）。此一發現意味著，教學介入的設計應系統性地評估學習者的前導知識結構，以確保新知識得以有效融入既有基模之中。

**範例二——段落邏輯銜接**
❌ 草稿：閱讀理解很重要。很多學生閱讀能力不好。老師需要教閱讀策略。
✅ 改寫：閱讀理解能力係學習者提取、整合並評鑑文本訊息之核心心智歷程（Perfetti & Stafura, 2014），對於學科知識的建構具有不可迴避的基礎地位。然學界實證調查普遍顯示，相當比例的學習者在閱讀理解的深層推論層次存在顯著困難（PISA, 2022；柯華葳等人，2019），此一現象已構成教育政策亟待回應的核心挑戰。有鑑於此，系統性的閱讀策略教學介入，被視為提升學習者文本理解效能之關鍵途徑（Duke & Pearson, 2002）。

# 操作規範
- **絕對保持原意**：不得篡改任何事實、數據、研究結論或作者原始觀點。
- **只輸出改寫後的正文**：不加任何說明、前言、後記或標注。
- **引用符號保留**：若原稿已有引用格式，優先保留並依規範校正；若無引用，依文意合理補充「（相關研究，年份）」作為佔位符，提醒作者補全。
- **輸出語言**：繁體中文（台灣學術用語）。

請依上述規範，對輸入的學術草稿進行嚴謹的學術化改寫與潤飾。
`;

/**
 * 構建包含用戶風格範例的系統指令
 */
function buildSystemInstruction(styleExamples: StyleExample[]): string {
  let instruction = BASE_SYSTEM_INSTRUCTION;

  if (styleExamples.length > 0) {
    instruction += '\n\n【用戶寫作風格參考】\n';
    instruction += '⚠️ **重要警告**：以下範例僅供學習「寫作風格」，絕對不要複製範例內容！請專注於潤飾當前輸入的新文本。\n\n';
    instruction += '請從以下範例中學習用戶的語氣、用詞和句式特點：\n\n';

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

    instruction += '【關鍵提醒】\n';
    instruction += '- ✅ 請模仿上述範例的「風格」和「語氣」\n';
    instruction += '- ✅ 學習用戶的用詞習慣和句式偏好\n';
    instruction += '- ❌ 絕對不要輸出範例中的具體內容\n';
    instruction += '- ❌ 不要讓新文本與範例內容相似\n';
    instruction += '- ✅ 專注於潤飾當前輸入的新文本\n';
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
            temperature: 0.7,  // Balanced for academic precision while allowing nuanced expression
            topP: 0.92,        // High recall for domain-specific academic vocabulary
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