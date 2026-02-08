import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-academic-200 px-6 py-4 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-academic-800 rounded-lg flex items-center justify-center text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-academic-800 tracking-tight leading-none">ThesisPolisher TW</h1>
            <p className="text-xs text-academic-500 mt-1 font-medium">學術論文潤飾助手 (繁體中文)</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-academic-500">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-academic-50 rounded-full border border-academic-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><check/><path d="M4 12 9 17 20 6"/></svg>
            自然語氣
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-academic-50 rounded-full border border-academic-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
            去機械化
          </span>
        </div>
      </div>
    </header>
  );
};