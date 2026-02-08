import React, { useState, useEffect } from 'react';
import { apiKeyManager } from '../services/apiKeyManager';

export const ApiKeyStatusIndicator: React.FC = () => {
    const [stats, setStats] = useState(apiKeyManager.getStats());
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Update stats periodically
        const interval = setInterval(() => {
            setStats(apiKeyManager.getStats());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (stats.total === 0) {
        return null;
    }

    const getOverallStatus = () => {
        if (stats.available > 0) return 'available';
        if (stats.warning > 0) return 'warning';
        return 'failed';
    };

    const status = getOverallStatus();
    const statusColors = {
        available: 'bg-green-500',
        warning: 'bg-yellow-500',
        failed: 'bg-red-500',
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-gray-300 transition-colors"
                title="API 密鑰狀態"
            >
                <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`}></div>
                <span className="text-xs font-medium text-gray-700">
                    {stats.available}/{stats.total}
                </span>
            </button>

            {isExpanded && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
                    <div className="text-xs font-semibold text-gray-700 mb-2">API 密鑰狀態</div>
                    <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                可用
                            </span>
                            <span className="font-medium">{stats.available}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                警告
                            </span>
                            <span className="font-medium">{stats.warning}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                失效
                            </span>
                            <span className="font-medium">{stats.failed}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
