import { ApiKeyStatus } from '../types';

const STORAGE_KEY = 'thesis_polisher_api_keys';
const MAX_FAIL_COUNT = 3;

class ApiKeyManager {
    private keys: ApiKeyStatus[] = [];
    private currentKeyIndex: number = 0;

    constructor() {
        this.loadKeys();
    }

    // Load keys from localStorage
    private loadKeys(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.keys = JSON.parse(stored);
            } else {
                // Initialize with environment variable if available
                const envKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (envKey) {
                    this.addKey(envKey, 'Default Key');
                }
            }
        } catch (error) {
            console.error('Failed to load API keys:', error);
            this.keys = [];
        }
    }

    // Save keys to localStorage
    private saveKeys(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.keys));
        } catch (error) {
            console.error('Failed to save API keys:', error);
        }
    }

    // Add a new API key
    addKey(key: string, displayName?: string): string {
        const id = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newKey: ApiKeyStatus = {
            id,
            key,
            status: 'untested',
            lastUsed: 0,
            failCount: 0,
            successCount: 0,
            displayName: displayName || `Key ${this.keys.length + 1}`,
        };
        this.keys.push(newKey);
        this.saveKeys();
        return id;
    }

    // Remove an API key
    removeKey(id: string): boolean {
        const index = this.keys.findIndex(k => k.id === id);
        if (index !== -1) {
            this.keys.splice(index, 1);
            this.saveKeys();
            // Reset current index if needed
            if (this.currentKeyIndex >= this.keys.length) {
                this.currentKeyIndex = 0;
            }
            return true;
        }
        return false;
    }

    // Get current API key
    getCurrentKey(): string | null {
        const availableKeys = this.getAvailableKeys();
        if (availableKeys.length === 0) {
            return null;
        }

        // Find the next available key starting from current index
        for (let i = 0; i < this.keys.length; i++) {
            const index = (this.currentKeyIndex + i) % this.keys.length;
            const key = this.keys[index];
            if (key.status === 'available' || key.status === 'untested' || key.status === 'warning') {
                this.currentKeyIndex = index;
                return key.key;
            }
        }

        return null;
    }

    // Get current key ID
    getCurrentKeyId(): string | null {
        if (this.keys.length === 0) return null;
        return this.keys[this.currentKeyIndex]?.id || null;
    }

    // Mark current key as successful
    markSuccess(): void {
        if (this.keys.length === 0) return;

        const key = this.keys[this.currentKeyIndex];
        if (key) {
            key.successCount++;
            key.lastUsed = Date.now();
            key.status = 'available';
            key.failCount = 0; // Reset fail count on success
            this.saveKeys();
        }
    }

    // Mark current key as failed and try to switch
    markFailure(errorType: 'quota' | 'auth' | 'network' | 'other'): boolean {
        if (this.keys.length === 0) return false;

        const key = this.keys[this.currentKeyIndex];
        if (key) {
            key.failCount++;
            key.lastUsed = Date.now();

            // Determine status based on error type
            if (errorType === 'quota' || errorType === 'auth') {
                key.status = 'failed';
            } else if (key.failCount >= MAX_FAIL_COUNT) {
                key.status = 'failed';
            } else {
                key.status = 'warning';
            }

            this.saveKeys();

            // Try to switch to next available key
            return this.switchToNextKey();
        }

        return false;
    }

    // Switch to next available key
    private switchToNextKey(): boolean {
        const startIndex = this.currentKeyIndex;

        for (let i = 1; i < this.keys.length; i++) {
            const nextIndex = (startIndex + i) % this.keys.length;
            const nextKey = this.keys[nextIndex];

            if (nextKey.status === 'available' || nextKey.status === 'untested' || nextKey.status === 'warning') {
                this.currentKeyIndex = nextIndex;
                return true;
            }
        }

        return false;
    }

    // Get all keys with their status
    getAllKeys(): ApiKeyStatus[] {
        return this.keys.map(key => ({
            ...key,
            key: this.maskKey(key.key), // Mask the key for display
        }));
    }

    // Get available keys count
    getAvailableKeys(): ApiKeyStatus[] {
        return this.keys.filter(k =>
            k.status === 'available' || k.status === 'untested' || k.status === 'warning'
        );
    }

    // Mask API key for display (show only last 6 characters)
    private maskKey(key: string): string {
        if (key.length <= 10) return '••••••';
        return '••••••' + key.slice(-6);
    }

    // Update key display name
    updateKeyName(id: string, displayName: string): boolean {
        const key = this.keys.find(k => k.id === id);
        if (key) {
            key.displayName = displayName;
            this.saveKeys();
            return true;
        }
        return false;
    }

    // Reset a failed key (allow retry)
    resetKey(id: string): boolean {
        const key = this.keys.find(k => k.id === id);
        if (key) {
            key.status = 'untested';
            key.failCount = 0;
            this.saveKeys();
            return true;
        }
        return false;
    }

    // Check if there are any keys configured
    hasKeys(): boolean {
        return this.keys.length > 0;
    }

    // Get statistics
    getStats() {
        const total = this.keys.length;
        const available = this.keys.filter(k => k.status === 'available' || k.status === 'untested').length;
        const warning = this.keys.filter(k => k.status === 'warning').length;
        const failed = this.keys.filter(k => k.status === 'failed').length;

        return { total, available, warning, failed };
    }
}

// Export singleton instance
export const apiKeyManager = new ApiKeyManager();
