import type { GA4Config } from '../types';
import { escapeAttr } from './escape';

export function renderGa4Script(config: GA4Config): string {
    const id = escapeAttr(config.measurementId);
    const anonymize = config.anonymizeIp !== false;
    const configObj = anonymize
        ? `{ anonymize_ip: true }`
        : `{}`;
    return [
        `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>`,
        `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}',${configObj});</script>`,
    ].join('\n');
}
