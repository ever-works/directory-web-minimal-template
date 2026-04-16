import type { AnalyticsProviderConfig, ResolvedAnalyticsConfig } from './types';
import { renderPlausibleScript } from './renderers/plausible';
import { renderUmamiScript } from './renderers/umami';
import { renderFathomScript } from './renderers/fathom';
import { renderGa4Script } from './renderers/ga4';
import { renderCustomScript } from './renderers/custom';

function renderProvider(config: AnalyticsProviderConfig): string {
    switch (config.provider) {
        case 'plausible':
            return renderPlausibleScript(config);
        case 'umami':
            return renderUmamiScript(config);
        case 'fathom':
            return renderFathomScript(config);
        case 'ga4':
            return renderGa4Script(config);
        case 'custom':
            return renderCustomScript(config);
    }
}

export function renderAnalyticsScripts(
    resolved: ResolvedAnalyticsConfig,
): string {
    const scripts = resolved.providers.map(renderProvider);

    if (!resolved.respectDoNotTrack) {
        return scripts.join('\n');
    }

    const inner = scripts.join('\n');
    return [
        `<script>`,
        `(function(){if(navigator.doNotTrack==='1'){return;}`,
        `var d=document,f=d.createDocumentFragment(),t=d.createElement('div');`,
        `t.innerHTML=${JSON.stringify(inner)};`,
        `while(t.firstChild)f.appendChild(t.firstChild);`,
        `d.currentScript.parentNode.insertBefore(f,d.currentScript);`,
        `})();`,
        `</script>`,
    ].join('');
}
