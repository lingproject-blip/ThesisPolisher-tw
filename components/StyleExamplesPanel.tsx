import React from 'react';
import { styleProfileManager } from '../services/styleProfileManager';
import { StyleExample } from '../types';

export const StyleExamplesPanel: React.FC = () => {
    const [examples, setExamples] = React.useState<StyleExample[]>([]);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setExamples(styleProfileManager.getExamples());
        }
    }, [isOpen]);

    const handleDelete = (id: string) => {
        styleProfileManager.deleteExample(id);
        setExamples(styleProfileManager.getExamples());
    };

    const handleClearAll = () => {
        if (confirm('確定要清除所有風格範例嗎？')) {
            styleProfileManager.clearAllExamples();
            setExamples([]);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-sm text-academic-600 hover:text-academic-800 underline"
            >
                管理我的寫作風格範例 ({examples.length})
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">我的寫作風格範例</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            系統會參考這些範例來學習您的寫作習慣（最多 5 個）
                        </p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {examples.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium">尚無風格範例</p>
                            <p className="text-sm mt-2">潤飾文本後，點擊「⭐ 這是我的風格」來保存範例</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {examples.map((example, idx) => (
                                <div key={example.id} className="border border-gray-200 rounded-lg p-4 hover:border-academic-300 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-academic-700">範例 {idx + 1}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(example.timestamp).toLocaleDateString('zh-TW')}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(example.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                            title="刪除此範例"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">原始文本：</p>
                                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                {example.original.substring(0, 200)}
                                                {example.original.length > 200 && '...'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-academic-600 mb-1">您的修改版：</p>
                                            <p className="text-sm text-gray-800 bg-academic-50 p-2 rounded">
                                                {example.final.substring(0, 200)}
                                                {example.final.length > 200 && '...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {examples.length > 0 && (
                    <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            共 {examples.length} 個範例
                        </p>
                        <button
                            onClick={handleClearAll}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                            清除所有範例
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
