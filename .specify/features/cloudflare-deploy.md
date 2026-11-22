# Feature: Cloudflare deploy (Workers Static Assets, custom domain or route)

> Status: implemented 2026-11-22 (minimal template). Workflow: `.github/workflows/deploy_cloudflare.yaml`. Route
> fallback: `apps/web/scripts/cloudflare-route.ts` (tests next to it, `pnpm --filter @ever-works/web-minimal test`).

## Goal

Every directory is a pure static build (`ENABLE_ISR=false`) published as one Cloudflare Worker with static assets,
reachable at its own hostname (e.g. `crm.ever.works`). A directory deploy must keep working however many directories
share a zone.

## How a hostname is attached

Cloudflare offers two ways to put a Worker on a hostname
([limits](https://developers.cloudflare.com/workers/platform/limits/#routes-and-domains)):

|                | Workers Custom Domain             | Workers route `<host>/*`                   |
| -------------- | --------------------------------- | ------------------------------------------ |
| Per-zone limit | **100**                           | 1,000                                      |
| DNS record     | created and managed by Cloudflare | must already exist and be proxied          |
| Certificate    | its own edge certificate          | the zone's (Universal SSL covers `*.zone`) |

The workflow prefers the custom domain, which needs no DNS work. Once a zone holds 100 of them, Cloudflare refuses
the next one (wrangler: "You have exceeded the limit of 100 Workers custom domains on zone …", API error
`100122`), and the workflow falls back to a route.

## Behaviour

The repository variable `CLOUDFLARE_ROUTE_MODE` picks the strategy:

- **`auto`** (default)
    1. If an earlier deploy attached this hostname as a route, deploy it as a route again (step 3).
    2. Otherwise deploy with `routes: [{ pattern: <host>, custom_domain: true }]`. Success ends here. Any failure
       other than the custom-domain limit fails the job as before.
    3. On the limit error, emit a `::warning::`, make sure the hostname has a proxied DNS record, rewrite the wrangler
       config to `routes: [{ pattern: "<host>/*", zone_id }]` and deploy again.
- **`custom_domain`**: step 2 only (the behaviour before 2026-11-22).
- **`route`**: step 3 only, for a hostname that has no custom domain yet. Custom Domains take precedence over
  routes, so forcing `route` on a hostname that already has a custom domain changes nothing until that custom
  domain is removed in Cloudflare.

`CLOUDFLARE_ZONE_NAME` (optional variable) names the zone when it is not a parent domain of the hostname that the
token can read.

### DNS record rules (`cloudflare-route.ts ensure`)

- Zone lookup: `GET /zones?name=<candidate>&account.id=<CLOUDFLARE_ACCOUNT_ID>` for the hostname and each parent
  domain down to two labels, longest first; or only `CLOUDFLARE_ZONE_NAME`.
- Only A, AAAA and CNAME records named exactly like the hostname count.
- No record: create `AAAA <host> 100::`, proxied, TTL auto, comment `ever-works directory worker route: <worker>`.
  `100::` is the discard prefix Cloudflare documents for hostnames served only by Workers.
- The record this script created for the same Worker (same comment, worker name included) is reused.
- **Any other record stops the deploy** with an error that lists it. A route intercepts every proxied request for
  `<host>/*`, so reusing another record would silently take over whatever it serves: another site behind a proxied
  CNAME, another Worker's route (marker with another worker name), or a custom domain (Cloudflare shows those as a
  proxied `AAAA 100::` with no comment). The workflow never edits or deletes a record.
- `CLOUDFLARE_ROUTE_ADOPT_EXISTING=true` (repository variable) reuses an existing proxied record anyway, for a
  placeholder the zone owner made for this Worker. Unproxied records still stop the deploy.
- `has-route` returns true only for the record with this Worker's exact comment, so a hostname moved to a route
  stays a route on later deploys, without a failed custom-domain attempt first.

### Token permissions

The `CLOUDFLARE_TOKEN` secret already needs Workers Scripts edit plus Workers Routes and DNS edit on the zone for
custom domains. The route fallback uses the same permissions: zone read (implied), DNS read/edit, Workers Routes
edit. If `has-route` cannot read the zone, it answers "no" and the custom domain is tried first.

## Not in scope

- Moving existing custom-domain hostnames to routes. They keep working and stay where they are.
- Wildcard DNS records or one dispatcher Worker for many hostnames (Workers for Platforms). Both are zone-wide
  changes for the zone owner to decide (`docs/questions.md` Q31).
- Removing a route-mode hostname. To take one back to a custom domain, delete its route and the DNS record with the
  marker comment, then deploy with `CLOUDFLARE_ROUTE_MODE=custom_domain`.

## Acceptance

- Unit tests cover the limit-error match (on the real wrangler 4 output, ANSI codes included), zone lookup, every
  DNS case, the config rewrite and the CLI exit codes.
- The deploy step's shell logic was run under `bash -e` with stub `wrangler`/`pnpm` for all seven paths: custom
  domain ok, limit error → route, other error, `custom_domain` + limit error, forced route, existing route, invalid
  mode.
- A real deploy past the limit (`awesome-rmm-website`, first refused 2026-11-22 06:12Z) answers 200 on `/` and
  `/mcp` after the fallback.
