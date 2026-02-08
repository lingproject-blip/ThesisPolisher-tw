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