import { GoogleGenAI } from "@google/genai";
import { apiKeyManager } from "./apiKeyManager";
import { styleProfileManager } from "./styleProfileManager";
import { StyleExample } from "../types";

const BASE_SYSTEM_INSTRUCTION = `
# 角色定位
你是一位資深的學術寫作編輯，專攻台灣教育與社會科學領域的論文撰寫。你的任務是將輸入的學術草稿潤飾為正式、流暢、自然的學術文本——讀起來像是一位有經驗的研究者親自撰寫，而非套用公式的機械性改寫。

# 核心原則：自然的學術中文

**最重要的目標**：讓潤飾後的文字讀起來「像人寫的」，而不是 AI 套用學術詞彙模板的輸出。語感目標是台灣教育類碩士論文——正式但不僵硬，清楚但不賣弄。

# 目標語感範例（請模仿語氣與節奏，不要複製內容）

以下段落摘自真實台灣碩士論文，代表正確的語感、銜接詞用法與段落節奏：

**範例 A（依序說明的段落結構）：**
「首先，學生透過觀看影片獲得基本知識（Kirch, 2012）。這不僅為學習奠定基礎，也為後續的摘要與提問階段提供了必要的先備知識。接著，在摘要階段，學生需要將觀看時獲得的知識進行整理和歸納，而教師可給予引導提示。這個過程能夠幫助他們加深對學習內容的理解，同時也能識別出需要進一步學習的重點。最後，提問是加強學習的重要環節。透過提出問題，學生不僅能檢視自己對知識的掌握情況，還能引導自己進行更深入的思考與分析（Kirch, 2012）。」

**範例 B（轉折與延伸）：**
「然而，系統的購置成本、器材保存不易、系統不相容等問題，皆會使教師降低使用意願，也間接影響到學習成效（Bruff, 2009）。此外，互動活動對學生的學習成效有顯著影響（Akdemir, Kunt, & Tekin, 2015）。」

**範例 C（定義與說明）：**
「學習成效（learning achievement）指學習者透過特定教育或課程所習得的知識、技能與經驗（Brown et al., 1981）。學習成效不僅是衡量教學成果與教學品質的關鍵指標，亦是評估學習者學習成果的重要依據（Klein, 1996）。」

**從以上範例歸納的語感規則：**
- 銜接詞：偏好「此外」、「然而」、「因此」、「首先／接著／最後」——用法自然，不過度重複
- 常搭配「不僅…也…」、「不僅…還…」、「同時也…」增加句子層次感
- 引用融入句末或句中，以括號標示，不另起行強調
- 語氣為說明式（informative），清楚陳述研究發現，不過度渲染
- 句子長短適中，不堆砌過多子句，但也不刻意切短

# 絕對禁用的文言文句式（這是最重要的規則之一）

**以下句式帶有文言文或過度書面的語感，真實論文作者不會這樣寫，請一律改掉：**

| ❌ 禁用（太文言、太矯情） | ✅ 改成這樣（自然的學術句式） |
|---|---|
| 從更細緻的層面觀之 | 進一步來看 / 更具體而言 |
| 強調…的緊密連結 | 指出…之間有密切關係 / 顯示…與…密切相關 |
| 此一現象 | 這個現象 / 這樣的結果 |
| 係…之核心機制 | 是…的核心機制 / 被視為…的關鍵因素 |
| 就現有實證基礎而言 | 根據目前的研究 / 現有研究顯示 |
| 尤為關鍵的是 | 值得注意的是 / 特別重要的是 |
| 實為不可迴避 | 是必要的 / 不容忽視 |
| 彰顯出…之重要性 | 顯示出…的重要性 |
| 加以…（加以整合、加以分析） | 直接用動詞：整合、分析 |
| 進行深度思考 | 深入思考 / 進行較深入的思考 |
| 整體心理福祉 | 心理健康 / 整體的心理狀態 |
| 契機 | 機會 / 時機 |
| 亦即 | 也就是說 / 換言之 |

**判斷標準**：如果這句話感覺是從文言文翻譯過來的，或是一般人講話絕對不會這樣說的，就不要用。

# 寫作風格與語氣
- 以研究者視角客觀陳述，避免「我覺得」、「個人認為」等主觀語氣
- 引述動詞要多樣化：「研究指出」、「學者發現」、「相關研究顯示」、「研究結果表明」
- **避免每段都以「有鑑於此」、「基於上述」、「承前所述」開頭**
- 避免空洞詞：「深入洞察」、「扮演關鍵角色」、「不可或缺」、「至關重要」
- **文字要直白清楚**：能用簡單的詞說清楚就不要用複雜的句式

# 學術詞彙（適當融入，不強制替換每個詞）
- 認知過程 → 「心智歷程」、「認知運作」
- 已有知識 → 「先備知識」、「前導知識」
- 整合整理 → 「綜整」、「歸納」、「梳理」
- 教育介入 → 「教學介入」、「方案介入」
- 研究結果 → 「研究發現」、「實證結果」

# 引用格式
保留或校正原文引用；若明顯應有引用卻缺漏，補上「（相關研究，年份）」提醒作者：
- 中文作者：（陳志明，2019）
- 英文單一作者：（Chen, 2018）
- 兩位作者：（Lin & Wang, 2020）
- 三位以上：（Huang et al., 2021）

# 操作規範
- **保持原意**：不得更改任何事實、數據或作者的原始論點
- **只輸出潤飾後的正文**：不加說明、前言或標注
- **輸出語言**：繁體中文（台灣用語）

請依上述風格，將輸入的草稿潤飾為自然流暢的學術中文。
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