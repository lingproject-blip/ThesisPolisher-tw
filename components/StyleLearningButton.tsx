import React from 'react';
import { styleProfileManager } from '../services/styleProfileManager';

interface StyleLearningButtonProps {
    original: string;
    polished: string;
    final: string;
    onSaved?: () => void;
}

export const StyleLearningButton: React.FC<StyleLearningButtonProps> = ({
    original,
    polished,
    final,
    onSaved,
}) => {
    const [saved, setSaved] = React.useState(false);

    const handleSave = () => {
        styleProfileManager.saveExample({
            original,
            polished,
            final,
        });

        setSaved(true);
        onSaved?.();

        // Reset after 2 seconds
        setTimeout(() => setSaved(false), 2000);
    };

    const exampleCount = styleProfileManager.getExampleCount();
    const maxExamples = 5;
    const canSave = exampleCount < maxExamples;

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleSave}
                disabled={!canSave || saved}
                className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          transition-all duration-200
          ${saved
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : canSave
                            ? 'bg-amber-50 text-amber-700 border-2 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                            : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                    }
        `}
                title={!canSave ? `已達上限（${maxExamples}個範例）` : '保存為我的寫作風格參考'}
            >
                {saved ? (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        已保存！
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        這是我的風格
                    </>
                )}
            </button>

            {canSave && (
                <span className="text-xs text-gray-500">
                    {exampleCount}/{maxExamples} 個範例
                </span>
            )}
        </div>
    );
};
