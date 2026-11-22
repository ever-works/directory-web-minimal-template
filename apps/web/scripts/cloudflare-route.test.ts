import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    ROUTE_RECORD_CONTENT,
    ROUTE_RECORD_MARKER,
    assertHostname,
    cloudflareApi,
    ensureProxiedRecord,
    findZone,
    hasRouteRecord,
    isCustomDomainLimitError,
    main,
    withRoute,
    zoneCandidates,
    type CloudflareApi,
    type FetchLike
} from './cloudflare-route';

const ESC = String.fromCharCode(27);

/** The error wrangler 4 printed on awesome-rmm-website (run 44992340328, 2026-11-22), ANSI codes included. */
const LIMIT_LOG = [
    `${ESC}[31m✘ ${ESC}[41;31m[${ESC}[41;97mERROR${ESC}[41;31m]${ESC}[0m ${ESC}[1mTrigger configuration for "***" was only partially updated:${ESC}[0m`,
    '    Custom domains:',
    '      - A request to the Cloudflare API (/accounts/***/workers/scripts/***/domains/records) failed.',
    `        - You have exceeded the limit of 100 Workers custom domains on zone 'ever.works'. Please refer to the Workers documentation: ${ESC}[4mhttps://developers.cloudflare.com/workers/platform/limits/#number-of-custom-domains-per-zone${ESC}[0m for more details. [code: 100122]`
].join('\n');

interface Call {
    method: string;
    path: string;
    body?: unknown;
}

/** Fake API over an in-memory zone list and DNS table. */
function fakeApi(
    zones: { id: string; name: string }[],
    records: Record<string, unknown>[] = []
): { api: CloudflareApi; calls: Call[] } {
    const calls: Call[] = [];
    const api: CloudflareApi = async (method, path, body) => {
        calls.push({ method, path, body });
        const url = new URL(`https://x${path}`);
        if (method === 'GET' && url.pathname === '/zones') {
            return zones.filter((z) => z.name === url.searchParams.get('name'));
        }
        if (method === 'GET' && url.pathname.endsWith('/dns_records')) {
            return records.filter((r) => r.name === url.searchParams.get('name'));
        }
        if (method === 'POST' && url.pathname.endsWith('/dns_records')) {
            records.push(body as Record<string, unknown>);
            return body;
        }
        throw new Error(`unexpected ${method} ${path}`);
    };
    return { api, calls };
}

describe('isCustomDomainLimitError', () => {
    it('matches the real wrangler error for the per-zone custom-domain limit', () => {
        expect(isCustomDomainLimitError(LIMIT_LOG)).toBe(true);
    });

    it('does not match other deploy failures', () => {
        expect(isCustomDomainLimitError('Authentication error [code: 10000]')).toBe(false);
        expect(
            isCustomDomainLimitError('Custom domains:\n - hostname already has externally managed DNS records')
        ).toBe(false);
    });
});

describe('hostnames and zones', () => {
    it('accepts lowercase hostnames and rejects anything else', () => {
        expect(assertHostname('crm.ever.works')).toBe('crm.ever.works');
        for (const bad of [
            'CRM.ever.works',
            'ever',
            'a..b',
            'crm.ever.works/x',
            'x.ever.works&name=evil',
            '',
            undefined
        ]) {
            expect(() => assertHostname(bad)).toThrow(/CLOUDFLARE_HOSTNAME/);
        }
    });

    it('lists parent domains longest first, down to two labels', () => {
        expect(zoneCandidates('a.b.example.com')).toEqual(['a.b.example.com', 'b.example.com', 'example.com']);
        expect(zoneCandidates('example.com')).toEqual(['example.com']);
    });

    it('finds the longest zone the token can read, scoped to the account', async () => {
        const { api, calls } = fakeApi([{ id: 'z1', name: 'ever.works' }]);
        await expect(findZone(api, 'rmm.ever.works', { accountId: 'acc' })).resolves.toEqual({
            id: 'z1',
            name: 'ever.works'
        });
        expect(calls.map((c) => c.path)).toEqual([
            '/zones?name=rmm.ever.works&account.id=acc',
            '/zones?name=ever.works&account.id=acc'
        ]);
    });

    it('uses CLOUDFLARE_ZONE_NAME only when it contains the hostname', async () => {
        const { api, calls } = fakeApi([{ id: 'z2', name: 'b.example.com' }]);
        await expect(findZone(api, 'a.b.example.com', { zoneName: 'b.example.com' })).resolves.toEqual({
            id: 'z2',
            name: 'b.example.com'
        });
        expect(calls).toHaveLength(1);
        await expect(findZone(api, 'a.b.example.com', { zoneName: 'other.com' })).rejects.toThrow(/does not contain/);
    });

    it('fails clearly when no zone is readable', async () => {
        const { api } = fakeApi([]);
        await expect(findZone(api, 'rmm.ever.works')).rejects.toThrow(/tried rmm.ever.works, ever.works/);
    });
});

describe('ensureProxiedRecord', () => {
    it('creates a proxied AAAA 100:: record with the marker comment when the host has none', async () => {
        const { api, calls } = fakeApi([], [{ type: 'TXT', name: 'rmm.ever.works', content: 'v=x' }]);
        await expect(ensureProxiedRecord(api, 'z1', 'rmm.ever.works', { workerName: 'ew-rmm' })).resolves.toEqual({
            status: 'created',
            type: 'AAAA',
            content: ROUTE_RECORD_CONTENT
        });
        const post = calls.find((c) => c.method === 'POST');
        expect(post?.path).toBe('/zones/z1/dns_records');
        expect(post?.body).toEqual({
            type: 'AAAA',
            name: 'rmm.ever.works',
            content: '100::',
            proxied: true,
            ttl: 1,
            comment: `${ROUTE_RECORD_MARKER}: ew-rmm`
        });
    });

    it('keeps an existing proxied record and creates nothing', async () => {
        const { api, calls } = fakeApi(
            [],
            [{ type: 'CNAME', name: 'rmm.ever.works', content: 'x.example.net', proxied: true }]
        );
        await expect(ensureProxiedRecord(api, 'z1', 'rmm.ever.works')).resolves.toMatchObject({
            status: 'existing',
            type: 'CNAME'
        });
        expect(calls.some((c) => c.method === 'POST')).toBe(false);
    });

    it('refuses to touch unproxied records', async () => {
        const { api, calls } = fakeApi(
            [],
            [{ type: 'A', name: 'rmm.ever.works', content: '192.0.2.1', proxied: false }]
        );
        await expect(ensureProxiedRecord(api, 'z1', 'rmm.ever.works')).rejects.toThrow(/not proxied \(A 192.0.2.1\)/);
        expect(calls.some((c) => c.method === 'POST')).toBe(false);
    });

    it('ignores records of other names returned by the API', async () => {
        const { api } = fakeApi([], []);
        const wrapped: CloudflareApi = async (method, path, body) =>
            method === 'GET' && path.includes('dns_records')
                ? [{ type: 'AAAA', name: 'other.ever.works', content: '100::', proxied: true }]
                : api(method, path, body);
        await expect(ensureProxiedRecord(wrapped, 'z1', 'rmm.ever.works')).resolves.toMatchObject({
            status: 'created'
        });
    });
});

describe('hasRouteRecord and withRoute', () => {
    it('recognises only proxied records this script created', async () => {
        const ours = fakeApi(
            [],
            [
                {
                    type: 'AAAA',
                    name: 'a.ever.works',
                    content: '100::',
                    proxied: true,
                    comment: `${ROUTE_RECORD_MARKER}: ew-a`
                }
            ]
        );
        const foreign = fakeApi(
            [],
            [{ type: 'AAAA', name: 'a.ever.works', content: '100::', proxied: true, comment: 'manual' }]
        );
        await expect(hasRouteRecord(ours.api, 'z1', 'a.ever.works')).resolves.toBe(true);
        await expect(hasRouteRecord(foreign.api, 'z1', 'a.ever.works')).resolves.toBe(false);
    });

    it('replaces the custom-domain route with a zone route and keeps the rest', () => {
        const config = {
            name: 'ew-rmm',
            routes: [{ pattern: 'rmm.ever.works', custom_domain: true }],
            workers_dev: false
        };
        expect(withRoute(config, 'rmm.ever.works', 'z1')).toEqual({
            name: 'ew-rmm',
            routes: [{ pattern: 'rmm.ever.works/*', zone_id: 'z1' }],
            workers_dev: false
        });
    });
});

describe('cloudflareApi', () => {
    it('sends the bearer token and returns result', async () => {
        let seen: Parameters<FetchLike> | undefined;
        const fetchImpl: FetchLike = async (...args) => {
            seen = args;
            return { ok: true, status: 200, json: async () => ({ success: true, result: [1] }) };
        };
        await expect(cloudflareApi('t0k', fetchImpl)('GET', '/zones?name=a.b')).resolves.toEqual([1]);
        expect(seen?.[0]).toBe('https://api.cloudflare.com/client/v4/zones?name=a.b');
        expect(seen?.[1].headers.Authorization).toBe('Bearer t0k');
    });

    it('throws with Cloudflare error codes and without the query string', async () => {
        const fetchImpl: FetchLike = async () => ({
            ok: false,
            status: 403,
            json: async () => ({ success: false, errors: [{ code: 10000, message: 'Authentication error' }] })
        });
        await expect(cloudflareApi('t', fetchImpl)('GET', '/zones?name=secret')).rejects.toThrow(
            'Cloudflare API GET /zones failed: Authentication error [code: 10000]'
        );
    });

    it('requires a token', () => {
        expect(() => cloudflareApi(undefined)).toThrow(/CLOUDFLARE_API_TOKEN/);
    });
});

describe('main', () => {
    /** Fake fetch backed by the same in-memory tables as fakeApi. */
    function fakeFetch(zones: { id: string; name: string }[], records: Record<string, unknown>[]): FetchLike {
        const { api } = fakeApi(zones, records);
        return async (url, init) => {
            const path = url.replace('https://api.cloudflare.com/client/v4', '');
            const result = await api(
                init.method as 'GET' | 'POST',
                path,
                init.body ? JSON.parse(init.body) : undefined
            );
            return { ok: true, status: 200, json: async () => ({ success: true, result }) };
        };
    }
    const env = {
        CLOUDFLARE_API_TOKEN: 't',
        CLOUDFLARE_ACCOUNT_ID: 'acc',
        CLOUDFLARE_HOSTNAME: 'rmm.ever.works',
        CLOUDFLARE_WORKER_NAME: 'ew-rmm'
    };

    it('ensure creates the record and rewrites the wrangler config', async () => {
        const dir = mkdtempSync(join(tmpdir(), 'cf-route-'));
        const configPath = join(dir, 'wrangler.deploy.json');
        writeFileSync(
            configPath,
            JSON.stringify({ name: 'ew-rmm', routes: [{ pattern: 'rmm.ever.works', custom_domain: true }] })
        );
        const records: Record<string, unknown>[] = [];
        const lines: string[] = [];
        const code = await main(['ensure', '--config', configPath], env, {
            fetchImpl: fakeFetch([{ id: 'z1', name: 'ever.works' }], records),
            log: (l) => lines.push(l)
        });
        expect(code).toBe(0);
        expect(JSON.parse(readFileSync(configPath, 'utf8')).routes).toEqual([
            { pattern: 'rmm.ever.works/*', zone_id: 'z1' }
        ]);
        expect(records).toHaveLength(1);
        expect(lines[0]).toBe('created proxied DNS record rmm.ever.works AAAA 100:: on zone ever.works');

        // A second deploy keeps the record it made and recognises the host as a route.
        lines.length = 0;
        await main(['ensure', '--config', configPath], env, {
            fetchImpl: fakeFetch([{ id: 'z1', name: 'ever.works' }], records),
            log: (l) => lines.push(l)
        });
        expect(records).toHaveLength(1);
        expect(lines[0]).toBe('kept the existing proxied AAAA record of rmm.ever.works on zone ever.works');
        await expect(
            main(['has-route'], env, {
                fetchImpl: fakeFetch([{ id: 'z1', name: 'ever.works' }], records),
                log: () => {}
            })
        ).resolves.toBe(0);
    });

    it('has-route answers 1 (try the custom domain) when the API fails', async () => {
        const failing: FetchLike = async () => ({ ok: false, status: 500, json: async () => ({}) });
        const lines: string[] = [];
        await expect(main(['has-route'], env, { fetchImpl: failing, log: (l) => lines.push(l) })).resolves.toBe(1);
        expect(lines[0]).toMatch(/could not check for an existing route/);
    });

    it('is-limit-error reads a log file', async () => {
        const dir = mkdtempSync(join(tmpdir(), 'cf-route-'));
        writeFileSync(join(dir, 'limit.log'), LIMIT_LOG);
        writeFileSync(join(dir, 'other.log'), 'Authentication error [code: 10000]');
        await expect(main(['is-limit-error', join(dir, 'limit.log')], env)).resolves.toBe(0);
        await expect(main(['is-limit-error', join(dir, 'other.log')], env)).resolves.toBe(1);
    });

    it('rejects unknown commands', async () => {
        await expect(main(['deploy'], env)).rejects.toThrow(/unknown command/);
    });
});
