import React from 'react';

export interface ApiKeyStatus {
  id: string;
  key: string;
  status: 'available' | 'warning' | 'failed' | 'untested';
  lastUsed: number;
  failCount: number;
  successCount: number;
  displayName?: string;
}

export interface PolishResult {
  original: string;
  polished: string;
  timestamp: number;
  apiKeyId?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export interface StyleExample {
  id: string;
  original: string;      // 原始文本
  polished: string;      // AI 潤飾版
  final: string;         // 用戶最終確定版
  timestamp: number;
  tags?: string[];       // 可選：論文章節標籤
}

export interface UserStyleProfile {
  examples: StyleExample[];
  maxExamples: number;   // 最多保存幾個範例
  createdAt: number;
  updatedAt: number;
}