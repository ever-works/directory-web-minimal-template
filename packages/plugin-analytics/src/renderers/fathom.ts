import type { FathomConfig } from '../types';
import { escapeAttr } from './escape';

export function renderFathomScript(config: FathomConfig): string {
    const host = config.scriptHost ?? 'https://cdn.usefathom.com';
    return `<script src="${escapeAttr(host)}/script.js" data-site="${escapeAttr(config.siteId)}" defer></script>`;
}
