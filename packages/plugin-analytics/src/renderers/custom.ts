import type { CustomConfig } from '../types';

export function renderCustomScript(config: CustomConfig): string {
    return config.html;
}
