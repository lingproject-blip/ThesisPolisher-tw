# ThesisPolisher TW 📝

<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

一個專為台灣學術寫作設計的論文潤飾工具，使用 Google Gemini AI 協助優化論文語氣與流暢度。

## ✨ 特色功能

- 🎯 **台灣學術語氣**：專門針對繁體中文（台灣）學術寫作優化
- 🚀 **即時潤飾**：快速獲得自然流暢的論文改寫建議
- 🔄 **智能重試**：自動處理網絡錯誤，提供穩定服務
- 📱 **響應式設計**：支援桌面和移動設備
- 🎨 **現代化介面**：簡潔優雅的使用體驗

## 🚀 線上體驗

訪問 [https://catherinetseng.github.io/thesispolisher-tw](https://catherinetseng.github.io/thesispolisher-tw) 立即使用

## 🛠️ 本地開發

### 前置需求

- Node.js 18 或更高版本
- Gemini API 密鑰（從 [Google AI Studio](https://aistudio.google.com/app/apikey) 獲取）

### 安裝步驟

1. **克隆倉庫**
   ```bash
   git clone https://github.com/catherinetseng/thesispolisher-tw.git
   cd thesispolisher-tw
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **設置環境變量**
   
   複製 `.env.example` 並重命名為 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```
   
   編輯 `.env.local` 並填入您的 Gemini API 密鑰：
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **啟動開發服務器**
   ```bash
   npm run dev
   ```
   
   應用將在 `http://localhost:3000` 運行

## 📦 構建與部署

### 本地構建

```bash
npm run build
```

構建產物將生成在 `dist` 目錄中。

### 預覽構建結果

```bash
npm run preview
```

### 部署到 GitHub Pages

本項目已配置 GitHub Actions 自動部署。每次推送到 `main` 分支時，會自動構建並部署到 GitHub Pages。

#### 設置步驟：

1. **在 GitHub 倉庫中添加 Secret**
   - 前往倉庫的 Settings → Secrets and variables → Actions
   - 點擊 "New repository secret"
   - 名稱：`VITE_GEMINI_API_KEY`
   - 值：您的 Gemini API 密鑰

2. **啟用 GitHub Pages**
   - 前往倉庫的 Settings → Pages
   - Source 選擇：GitHub Actions

3. **推送代碼**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

部署完成後，您的應用將在 `https://yourusername.github.io/thesispolisher-tw` 可用。

## 🎯 使用方式

1. 在左側文本框中貼上您的論文段落
2. 點擊「開始潤飾」按鈕
3. 等待 AI 處理（通常需要幾秒鐘）
4. 在右側查看潤飾後的結果
5. 點擊「複製」按鈕將結果複製到剪貼板

## 🔧 技術棧

- **前端框架**：React 19
- **構建工具**：Vite 6
- **語言**：TypeScript
- **樣式**：Tailwind CSS
- **AI 服務**：Google Gemini API
- **部署**：GitHub Pages + GitHub Actions

## 📝 環境變量說明

| 變量名 | 說明 | 必需 |
|--------|------|------|
| `VITE_GEMINI_API_KEY` | Google Gemini API 密鑰 | ✅ |

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 🙏 致謝

- 使用 [Google Gemini](https://ai.google.dev/) 提供 AI 能力
- UI 設計靈感來自現代學術工具
