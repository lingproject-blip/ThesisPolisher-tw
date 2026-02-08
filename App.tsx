import React, { useState, useCallback, useRef, useEffect } from 'react';
import { polishThesis } from './services/geminiService';
import { Header } from './components/Header';
import { TextArea } from './components/TextArea';
import { ActionButton } from './components/ActionButton';
import { ApiKeyManager } from './components/ApiKeyManager';
import { StyleLearningButton } from './components/StyleLearningButton';
import { StyleExamplesPanel } from './components/StyleExamplesPanel';
import { PolishResult } from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [result, setResult] = useState<PolishResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyManager, setShowApiKeyManager] = useState<boolean>(false);
  const [finalText, setFinalText] = useState<string>(''); // 用戶最終確定版
  const [isEditingFinal, setIsEditingFinal] = useState<boolean>(false);

  // Ref to auto-scroll output into view on mobile
  const outputRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (error) setError(null);
  }, [error]);

  const handlePolish = useCallback(async () => {
    if (!inputText.trim()) {
      setError('請輸入需要潤飾的論文段落');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const responseText = await polishThesis(inputText);
      setResult({
        original: inputText,
        polished: responseText,
        timestamp: Date.now()
      });

      // On mobile, smooth scroll to output after a short delay
      setTimeout(() => {
        if (outputRef.current && window.innerWidth < 768) {
          outputRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  const handleClear = useCallback(() => {
    setInputText('');
    setResult(null);
    setError(null);
  }, []);

  const handleCopy = useCallback(() => {
    if (result?.polished) {
      navigator.clipboard.writeText(result.polished);
    }
  }, [result]);

  return (
    <div className="min-h-screen flex flex-col text-academic-800 font-sans">
      <Header onOpenSettings={() => setShowApiKeyManager(true)} />

      <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6 flex flex-col lg:flex-row">

        {/* Input Section */}
        <section className="flex-1 flex flex-col h-[70vh] lg:h-[80vh] bg-white rounded-2xl shadow-sm border border-academic-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-academic-100 bg-academic-50/50 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-academic-600 uppercase tracking-wider">
              原始草稿 (Original)
            </h2>
            <div className="text-xs text-academic-400">
              {inputText.length} 字元
            </div>
          </div>

          <div className="flex-grow relative">
            <TextArea
              value={inputText}
              onChange={handleInputChange}
              placeholder="請在此貼上您的論文段落（建議一次貼上一至兩段）..."
              disabled={isLoading}
              className="font-serif text-lg leading-relaxed text-gray-700"
            />
          </div>

          <div className="p-4 border-t border-academic-100 bg-white flex items-center justify-between gap-3">
            <button
              onClick={handleClear}
              disabled={isLoading || !inputText}
              className="px-4 py-2 text-academic-500 hover:text-academic-700 disabled:opacity-30 transition-colors text-sm font-medium"
            >
              清空
            </button>
            <ActionButton
              onClick={handlePolish}
              isLoading={isLoading}
              disabled={!inputText.trim()}
            >
              開始潤飾
            </ActionButton>
          </div>
        </section>

        {/* Output Section */}
        <section
          ref={outputRef}
          className={`flex-1 flex flex-col h-[70vh] lg:h-[80vh] rounded-2xl shadow-sm border transition-all duration-500 ease-in-out overflow-hidden
            ${result ? 'bg-white border-primary-100 ring-4 ring-primary-50/50' : 'bg-academic-50 border-dashed border-academic-300'}
          `}
        >
          <div className="px-5 py-4 border-b border-academic-100 bg-academic-50/50 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-primary-600 uppercase tracking-wider flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
              潤飾結果 (Polished)
            </h2>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors bg-primary-50 px-3 py-1.5 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                複製
              </button>
            )}
          </div>

          <div className="flex-grow relative overflow-hidden flex flex-col">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 animate-fade-in">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 border-4 border-primary-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-academic-600 font-medium animate-pulse">教授正在審閱您的論文...</p>
                <p className="text-xs text-academic-400 mt-2">正在優化語氣與邏輯連貫性</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-academic-800 mb-2">發生錯誤</h3>
                <p className="text-academic-500 max-w-xs mb-4">{error}</p>
                {error.includes('尚未設置') || error.includes('所有 API 密鑰') ? (
                  <button
                    onClick={() => setShowApiKeyManager(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    設置 API 密鑰
                  </button>
                ) : null}
              </div>
            ) : result ? (
              <div className="flex-grow flex flex-col min-h-0">
                <div className="flex-1 p-6 overflow-y-auto min-h-0">
                  {isEditingFinal ? (
                    <textarea
                      value={finalText}
                      onChange={(e) => setFinalText(e.target.value)}
                      className="w-full h-full font-serif text-lg leading-relaxed text-academic-800 p-4 border border-academic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="在此編輯您的最終版本..."
                    />
                  ) : (
                    <div className="prose prose-slate max-w-none">
                      <p className="font-serif text-lg leading-relaxed text-academic-800 whitespace-pre-wrap">
                        {finalText || result.polished}
                      </p>
                    </div>
                  )}
                </div>

                {/* Style Learning Controls */}
                <div className="flex-shrink-0 p-4 bg-amber-50/50 border-t border-amber-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex gap-2 items-center flex-wrap">
                    {!isEditingFinal ? (
                      <button
                        onClick={() => {
                          setFinalText(result.polished);
                          setIsEditingFinal(true);
                        }}
                        className="text-sm px-3 py-1.5 bg-white border border-academic-300 text-academic-700 rounded-lg hover:bg-academic-50 transition-colors"
                      >
                        ✏️ 編輯最終版
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditingFinal(false)}
                        className="text-sm px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        ✓ 完成編輯
                      </button>
                    )}

                    {(finalText || !isEditingFinal) && (
                      <StyleLearningButton
                        original={result.original}
                        polished={result.polished}
                        final={finalText || result.polished}
                        onSaved={() => {
                          // Optional: show success message
                        }}
                      />
                    )}
                  </div>

                  <StyleExamplesPanel />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-academic-400">
                <div className="w-16 h-16 bg-academic-100 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="m9 15 3 3 3-3" /><path d="M12 18v-6" /></svg>
                </div>
                <p className="text-lg font-medium text-academic-600 mb-2">尚未開始</p>
                <p className="max-w-xs text-sm">請在左側輸入您的論文草稿，右側將會顯示潤飾後的版本。</p>
              </div>
            )}
          </div>

          {/* Info Footer for Output */}
          {result && !isLoading && (
            <div className="p-3 bg-primary-50 border-t border-primary-100 text-xs text-primary-700 flex justify-center text-center">
              已優化語氣並移除機械連接詞，保持自然流暢。
            </div>
          )}
        </section>
      </main>

      {/* API Key Manager Modal */}
      {showApiKeyManager && (
        <ApiKeyManager onClose={() => setShowApiKeyManager(false)} />
      )}
    </div>
  );
};

export default App;