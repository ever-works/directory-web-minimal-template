import type { PlausibleConfig } from '../types';
import { escapeAttr } from './escape';

export function renderPlausibleScript(config: PlausibleConfig): string {
    const host = config.scriptHost ?? 'https://plausible.io';
    const file = config.scriptFile ?? 'script.js';
    const src = `${escapeAttr(host)}/js/${escapeAttr(file)}`;
    return `<script defer data-domain="${escapeAttr(config.domain)}" src="${src}"></script>`;
}
