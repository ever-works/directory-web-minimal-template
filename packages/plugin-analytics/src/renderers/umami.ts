import type { UmamiConfig } from '../types';
import { escapeAttr } from './escape';

export function renderUmamiScript(config: UmamiConfig): string {
    return `<script defer src="${escapeAttr(config.scriptUrl)}" data-website-id="${escapeAttr(config.websiteId)}"></script>`;
}
