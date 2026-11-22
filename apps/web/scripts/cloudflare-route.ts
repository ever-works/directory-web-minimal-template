/**
 * Workers route fallback for `.github/workflows/deploy_cloudflare.yaml`.
 *
 * Each directory normally gets its hostname as a Workers Custom Domain, but Cloudflare allows only 100 custom
 * domains per zone (https://developers.cloudflare.com/workers/platform/limits/#routes-and-domains). Past that limit
 * the directory is attached as a plain Workers route `<host>/*` instead (1,000 routes per zone). A route only
 * receives traffic for a hostname that has a proxied DNS record, which wrangler does not create, so this script
 * creates one (`AAAA 100::`, the placeholder address Cloudflare documents for hostnames served only by a Worker) and
 * writes the route into the wrangler config. Spec: `.specify/features/cloudflare-deploy.md`.
 *
 * Commands (run from `apps/web` with `pnpm exec tsx scripts/cloudflare-route.ts <command>`):
 * - `is-limit-error <wrangler-log>`: exit 0 when the log shows the custom-domain limit (API error 100122), else 1.
 * - `has-route`: exit 0 when an earlier deploy already attached the host as a route, else 1 (also on API errors).
 * - `ensure --config <wrangler.json>`: create the proxied DNS record if needed, then write the route into the config.
 *
 * Environment variables:
 * - CLOUDFLARE_API_TOKEN: API token (Workers Scripts edit, Workers Routes edit and DNS edit on the zone)
 * - CLOUDFLARE_ACCOUNT_ID: account that owns the zone (narrows the zone lookup)
 * - CLOUDFLARE_HOSTNAME: public hostname, e.g. `crm.ever.works`
 * - CLOUDFLARE_WORKER_NAME: Worker name, written into the DNS record comment
 * - CLOUDFLARE_ZONE_NAME: optional zone name when the zone is not a parent domain the lookup can find
 * - CLOUDFLARE_ROUTE_ADOPT_EXISTING: `true` reuses a proxied record this script did not create (default: stop)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Placeholder address for a hostname that only a Worker route serves. */
export const ROUTE_RECORD_CONTENT = '100::';
/** Comment prefix on the DNS records this script creates, so later deploys know the host runs as a route. */
export const ROUTE_RECORD_MARKER = 'ever-works directory worker route';

const HOSTNAME_RE = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:[.][a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const LIMIT_ERROR_RE = /code: 100122|limit of [0-9]+ Workers custom domains|number-of-custom-domains-per-zone/i;
const ADDRESS_TYPES = new Set(['A', 'AAAA', 'CNAME']);

/** One Cloudflare v4 call: resolves to the response's `result`, throws with Cloudflare's error messages. */
export type CloudflareApi = (method: 'GET' | 'POST', path: string, body?: unknown) => Promise<unknown>;

/** The subset of `fetch` the client needs, so tests can pass a fake. */
export type FetchLike = (
    url: string,
    init: { method: string; headers: Record<string, string>; body?: string }
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export interface CloudflareZone {
    id: string;
    name: string;
}

export interface DnsRecord {
    type: string;
    name: string;
    content: string;
    proxied?: boolean;
    comment?: string | null;
}

export interface RecordResult {
    status: 'created' | 'existing';
    type: string;
    content: string;
}

/** A wrangler route entry: a custom domain, or a route pattern on a zone. */
export type WranglerRoute = { pattern: string; custom_domain: true } | { pattern: string; zone_id: string };

export interface RouteEnv {
    token: string | undefined;
    accountId: string | undefined;
    host: string;
    workerName: string | undefined;
    zoneName: string | undefined;
    adoptExisting: boolean;
}

/** Throws unless `host` is a lowercase DNS hostname with at least two labels. */
export function assertHostname(host: string | undefined): string {
    if (typeof host !== 'string' || !HOSTNAME_RE.test(host)) {
        throw new Error(`CLOUDFLARE_HOSTNAME must be a lowercase hostname such as crm.ever.works, got "${host ?? ''}"`);
    }
    return host;
}

/** True when a wrangler deploy log failed on the per-zone Workers custom-domain limit. */
export function isCustomDomainLimitError(log: string): boolean {
    return LIMIT_ERROR_RE.test(log);
}

/** Candidate zone names for a hostname, longest first: `a.b.example.com` → `a.b.example.com`, `b.example.com`, `example.com`. */
export function zoneCandidates(host: string): string[] {
    const labels = assertHostname(host).split('.');
    const out: string[] = [];
    for (let i = 0; i <= labels.length - 2; i++) out.push(labels.slice(i).join('.'));
    return out;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

/** Minimal Cloudflare v4 client. */
export function cloudflareApi(
    token: string | undefined,
    fetchImpl: FetchLike = globalThis.fetch as FetchLike
): CloudflareApi {
    if (!token) throw new Error('CLOUDFLARE_API_TOKEN is not set');
    return async (method, path, body) => {
        const res = await fetchImpl(`https://api.cloudflare.com/client/v4${path}`, {
            method,
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body)
        });
        const json: unknown = await res.json().catch(() => ({}));
        const payload = isRecord(json) ? json : {};
        if (!res.ok || payload.success === false) {
            const errors = Array.isArray(payload.errors)
                ? payload.errors
                      .filter(isRecord)
                      .map((e) => `${String(e.message)} [code: ${String(e.code)}]`)
                      .join('; ')
                : '';
            throw new Error(`Cloudflare API ${method} ${path.split('?')[0]} failed: ${errors || `HTTP ${res.status}`}`);
        }
        return payload.result;
    };
}

/** Find the zone that holds `host`: `zoneName` when given, otherwise the longest parent domain the token can read. */
export async function findZone(
    api: CloudflareApi,
    host: string,
    { accountId, zoneName }: { accountId?: string; zoneName?: string } = {}
): Promise<CloudflareZone> {
    let candidates = zoneCandidates(host);
    if (zoneName) {
        if (host !== zoneName && !host.endsWith(`.${zoneName}`)) {
            throw new Error(`CLOUDFLARE_ZONE_NAME "${zoneName}" does not contain the hostname ${host}`);
        }
        candidates = [zoneName];
    }
    for (const name of candidates) {
        const query = new URLSearchParams({ name });
        if (accountId) query.set('account.id', accountId);
        const zones = await api('GET', `/zones?${query.toString()}`);
        const first = Array.isArray(zones) ? zones.find(isRecord) : undefined;
        if (first && typeof first.id === 'string') return { id: first.id, name: String(first.name ?? name) };
    }
    throw new Error(
        `no Cloudflare zone for ${host} that this token can read (tried ${candidates.join(', ')}); set the CLOUDFLARE_ZONE_NAME variable`
    );
}

/** A, AAAA and CNAME records whose name is exactly `host`. */
export async function listAddressRecords(api: CloudflareApi, zoneId: string, host: string): Promise<DnsRecord[]> {
    const query = new URLSearchParams({ name: host, per_page: '100' });
    const records = await api('GET', `/zones/${zoneId}/dns_records?${query.toString()}`);
    if (!Array.isArray(records)) return [];
    return records
        .filter(isRecord)
        .map((r) => ({
            type: String(r.type),
            name: String(r.name),
            content: String(r.content),
            proxied: r.proxied === true,
            comment: typeof r.comment === 'string' ? r.comment : null
        }))
        .filter((r) => ADDRESS_TYPES.has(r.type) && r.name === host);
}

/** The comment this script writes on the DNS record it creates for `workerName`'s route. */
export function routeRecordComment(workerName?: string): string {
    return `${ROUTE_RECORD_MARKER}${workerName ? `: ${workerName}` : ''}`.slice(0, 100);
}

/**
 * Make sure `host` has a proxied address record, which a Workers route needs to receive traffic.
 *
 * Only a record this script created for the same Worker is reused. Any other record means the hostname already
 * serves something (another site, or another Worker's custom domain or route), and a `<host>/*` route on top of it
 * would silently take that traffic over, so the deploy stops instead. With `adoptExisting`, an existing proxied
 * record is reused anyway (for a placeholder the zone owner added for this Worker). Records are never edited.
 */
export async function ensureProxiedRecord(
    api: CloudflareApi,
    zoneId: string,
    host: string,
    { workerName, adoptExisting = false }: { workerName?: string; adoptExisting?: boolean } = {}
): Promise<RecordResult> {
    const records = await listAddressRecords(api, zoneId, host);
    const ours = records.find((r) => r.proxied === true && r.comment === routeRecordComment(workerName));
    if (ours) return { status: 'existing', type: ours.type, content: ours.content };
    const adoptable = adoptExisting ? records.find((r) => r.proxied === true) : undefined;
    if (adoptable) return { status: 'existing', type: adoptable.type, content: adoptable.content };
    if (records.length > 0) {
        const list = records
            .map((r) => `${r.type} ${r.content}${r.proxied ? ' (proxied)' : ''}${r.comment ? ` "${r.comment}"` : ''}`)
            .join(', ');
        throw new Error(
            `${host} already has DNS records that this workflow did not create for ${workerName ?? 'this Worker'}: ${list}. ` +
                'A Workers route on top of them would take over whatever they serve. Remove them in Cloudflare, or set ' +
                'the repository variable CLOUDFLARE_ROUTE_ADOPT_EXISTING=true if they are placeholders for this Worker.'
        );
    }
    await api('POST', `/zones/${zoneId}/dns_records`, {
        type: 'AAAA',
        name: host,
        content: ROUTE_RECORD_CONTENT,
        proxied: true,
        ttl: 1,
        comment: routeRecordComment(workerName)
    });
    return { status: 'created', type: 'AAAA', content: ROUTE_RECORD_CONTENT };
}

/** True when an earlier deploy already attached `host` to this Worker as a route (it left our marker record). */
export async function hasRouteRecord(
    api: CloudflareApi,
    zoneId: string,
    host: string,
    workerName?: string
): Promise<boolean> {
    const records = await listAddressRecords(api, zoneId, host);
    return records.some((r) => r.proxied === true && r.comment === routeRecordComment(workerName));
}

/** The config with its routes replaced by one Workers route for `host` on `zoneId`. */
export function withRoute<T extends object>(config: T, host: string, zoneId: string): T & { routes: WranglerRoute[] } {
    return { ...config, routes: [{ pattern: `${host}/*`, zone_id: zoneId }] };
}

export function readRouteEnv(env: NodeJS.ProcessEnv): RouteEnv {
    return {
        token: env.CLOUDFLARE_API_TOKEN,
        accountId: env.CLOUDFLARE_ACCOUNT_ID || undefined,
        host: assertHostname(env.CLOUDFLARE_HOSTNAME),
        workerName: env.CLOUDFLARE_WORKER_NAME || undefined,
        zoneName: env.CLOUDFLARE_ZONE_NAME || undefined,
        adoptExisting: env.CLOUDFLARE_ROUTE_ADOPT_EXISTING === 'true'
    };
}

/** CLI entry point; resolves to the process exit code. */
export async function main(
    argv: string[],
    env: NodeJS.ProcessEnv = process.env,
    { fetchImpl, log = console.log }: { fetchImpl?: FetchLike; log?: (line: string) => void } = {}
): Promise<number> {
    const [command, ...rest] = argv;
    if (command === 'is-limit-error') {
        if (!rest[0]) throw new Error('usage: is-limit-error <wrangler-log>');
        return isCustomDomainLimitError(readFileSync(rest[0], 'utf8')) ? 0 : 1;
    }
    if (command === 'has-route') {
        const e = readRouteEnv(env);
        try {
            const api = cloudflareApi(e.token, fetchImpl);
            const zone = await findZone(api, e.host, e);
            const found = await hasRouteRecord(api, zone.id, e.host, e.workerName);
            if (found) log(`${e.host} already runs as a Workers route on zone ${zone.name}`);
            return found ? 0 : 1;
        } catch (err) {
            // Unknown means "try the custom domain first", which is the normal path.
            log(`could not check for an existing route (${(err as Error).message}); trying the custom domain first`);
            return 1;
        }
    }
    if (command === 'ensure') {
        const i = rest.indexOf('--config');
        const configPath = i >= 0 ? rest[i + 1] : undefined;
        if (!configPath) throw new Error('usage: ensure --config <wrangler.json>');
        const e = readRouteEnv(env);
        const api = cloudflareApi(e.token, fetchImpl);
        const zone = await findZone(api, e.host, e);
        const record = await ensureProxiedRecord(api, zone.id, e.host, e);
        log(
            record.status === 'created'
                ? `created proxied DNS record ${e.host} AAAA ${ROUTE_RECORD_CONTENT} on zone ${zone.name}`
                : `kept the existing proxied ${record.type} record of ${e.host} on zone ${zone.name}`
        );
        const config = withRoute(JSON.parse(readFileSync(configPath, 'utf8')) as object, e.host, zone.id);
        writeFileSync(configPath, JSON.stringify(config, null, 2));
        log(`wrangler routes: ${JSON.stringify(config.routes)}`);
        return 0;
    }
    throw new Error(`unknown command "${command ?? ''}" (is-limit-error, has-route, ensure)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    // exitCode, not process.exit(): exiting while fetch sockets close trips a libuv assertion on Windows.
    main(process.argv.slice(2)).then(
        (code) => {
            process.exitCode = code;
        },
        (err: unknown) => {
            console.error(`::error title=Cloudflare route fallback::${(err as Error).message}`);
            process.exitCode = 2;
        }
    );
}
