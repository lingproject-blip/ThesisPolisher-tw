import { StyleExample, UserStyleProfile } from '../types';

class StyleProfileManager {
    private readonly STORAGE_KEY = 'user_style_profile';
    private readonly MAX_EXAMPLES = 5;

    private getProfile(): UserStyleProfile {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse style profile:', e);
            }
        }

        // Return default profile
        return {
            examples: [],
            maxExamples: this.MAX_EXAMPLES,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
    }

    saveExample(example: Omit<StyleExample, 'id' | 'timestamp'>): void {
        const profile = this.getProfile();

        const newExample: StyleExample = {
            ...example,
            id: this.generateId(),
            timestamp: Date.now(),
        };

        // Add to beginning of array (most recent first)
        profile.examples.unshift(newExample);

        // Keep only MAX_EXAMPLES
        if (profile.examples.length > this.MAX_EXAMPLES) {
            profile.examples = profile.examples.slice(0, this.MAX_EXAMPLES);
        }

        profile.updatedAt = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    }

    getExamples(): StyleExample[] {
        return this.getProfile().examples;
    }

    deleteExample(id: string): void {
        const profile = this.getProfile();
        profile.examples = profile.examples.filter(ex => ex.id !== id);
        profile.updatedAt = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    }

    clearAllExamples(): void {
        const profile = this.getProfile();
        profile.examples = [];
        profile.updatedAt = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    }

    getExampleCount(): number {
        return this.getProfile().examples.length;
    }

    private generateId(): string {
        return `style_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

export const styleProfileManager = new StyleProfileManager();
