import React, { useState, useEffect } from 'react';
import { apiKeyManager } from '../services/apiKeyManager';
import { ApiKeyStatus } from '../types';

interface ApiKeyManagerProps {
    onClose: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onClose }) => {
    const [keys, setKeys] = useState<ApiKeyStatus[]>([]);
    const [newKey, setNewKey] = useState('');
    const [newKeyName, setNewKeyName] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const loadKeys = () => {
        setKeys(apiKeyManager.getAllKeys());
    };

    useEffect(() => {
        loadKeys();
    }, []);

    const handleAddKey = () => {
        if (newKey.trim()) {
            apiKeyManager.addKey(newKey.trim(), newKeyName.trim() || undefined);
            setNewKey('');
            setNewKeyName('');
            setShowAddForm(false);
            loadKeys();
        }
    };

    const handleRemoveKey = (id: string) => {
        if (confirm('確定要刪除這個 API 密鑰嗎？')) {
            apiKeyManager.removeKey(id);
            loadKeys();
        }
    };

    const handleResetKey = (id: string) => {
        apiKeyManager.resetKey(id);
        loadKeys();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'text-green-500';
            case 'warning': return 'text-yellow-500';
            case 'failed': return 'text-red-500';
            case 'untested': return 'text-gray-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available': return '🟢';
            case 'warning': return '🟡';
            case 'failed': return '🔴';
            case 'untested': return '⚪';
            default: return '⚪';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'available': return '可用';
            case 'warning': return '警告';
            case 'failed': return '失效';
            case 'untested': return '未測試';
            default: return '未知';
        }
    };

    const stats = apiKeyManager.getStats();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-primary-50 to-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">API 密鑰管理</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            總計: {stats.total} | 可用: {stats.available} | 警告: {stats.warning} | 失效: {stats.failed}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Keys List */}
                    <div className="space-y-3 mb-6">
                        {keys.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50">
                                    <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" /><path d="m21 2-9.6 9.6" /><circle cx="7.5" cy="15.5" r="5.5" />
                                </svg>
                                <p className="text-lg font-medium">尚未添加 API 密鑰</p>
                                <p className="text-sm mt-1">點擊下方按鈕添加您的第一個密鑰</p>
                            </div>
                        ) : (
                            keys.map((key) => (
                                <div
                                    key={key.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{getStatusIcon(key.status)}</span>
                                                <span className="font-semibold text-gray-800">{key.displayName}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(key.status)} bg-opacity-10`}>
                                                    {getStatusText(key.status)}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 font-mono mb-2">
                                                {key.key}
                                            </div>
                                            <div className="flex gap-4 text-xs text-gray-500">
                                                <span>✅ 成功: {key.successCount}</span>
                                                <span>❌ 失敗: {key.failCount}</span>
                                                {key.lastUsed > 0 && (
                                                    <span>🕒 最後使用: {new Date(key.lastUsed).toLocaleString('zh-TW')}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            {key.status === 'failed' && (
                                                <button
                                                    onClick={() => handleResetKey(key.id)}
                                                    className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                                                    title="重置密鑰狀態"
                                                >
                                                    重試
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleRemoveKey(key.id)}
                                                className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                title="刪除密鑰"
                                            >
                                                刪除
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Key Form */}
                    {showAddForm ? (
                        <div className="border border-primary-200 rounded-lg p-4 bg-primary-50/30">
                            <h3 className="font-semibold text-gray-800 mb-3">添加新的 API 密鑰</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        密鑰名稱（可選）
                                    </label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="例如：主要密鑰"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        API 密鑰 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value)}
                                        placeholder="輸入您的 Gemini API 密鑰"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setNewKey('');
                                            setNewKeyName('');
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleAddKey}
                                        disabled={!newKey.trim()}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        添加
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" /><path d="M12 5v14" />
                            </svg>
                            添加 API 密鑰
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-500">
                        💡 提示：添加多個 API 密鑰可以在一個密鑰配額用盡時自動切換到下一個，確保服務不中斷。
                    </p>
                </div>
            </div>
        </div>
    );
};
