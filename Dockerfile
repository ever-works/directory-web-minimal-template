# syntax=docker/dockerfile:1.7
# Multi-stage Dockerfile for the Ever Works minimal website template
# (Astro + pnpm monorepo). Produces a small nginx-based image suitable
# for Kubernetes deployment via the `@ever-works/k8s-plugin`.
#
# Layout:
#   - `deps`     → install workspace dependencies (with build deps).
#   - `builder`  → run `pnpm --filter @ever-works/web-minimal run build`
#                  to produce the static `apps/web/dist` output.
#   - `runner`   → minimal nginx image serving `apps/web/dist` on :80.
#
# The platform's k8s plugin Service maps port 80 → containerPort 3000;
# we override the nginx port to 3000 to match that contract (no need to
# special-case the Astro template in the plugin).

ARG NODE_VERSION=22-alpine
ARG NGINX_VERSION=1.27-alpine

# ---- deps ------------------------------------------------------------------

FROM node:${NODE_VERSION} AS deps
WORKDIR /work
RUN corepack enable
RUN apk add --no-cache libc6-compat

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages ./packages

# Configure the npm/pnpm registry: prefer the internal Verdaccio cache
# (VERDACCIO_REGISTRY build-arg, anonymous), else public npm. Empty (e.g. a
# fork build, or the github-hosted platform deploy workflow that can't reach
# the internal VIP) -> public npm, so this is backward-compatible and fork-safe.
# The pnpm-lock.yaml rewrite is best-effort (non-fatal): a host mismatch
# degrades to public downloads rather than breaking the build.
ARG VERDACCIO_REGISTRY=""
RUN if [ -n "$VERDACCIO_REGISTRY" ]; then \
        echo "registry=${VERDACCIO_REGISTRY}" >> /work/.npmrc && \
        { sed -i "s|https://registry.npmjs.org|${VERDACCIO_REGISTRY%/}|g" /work/pnpm-lock.yaml 2>/dev/null || true; }; \
    fi

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter "@ever-works/web-minimal..."

# ---- builder ---------------------------------------------------------------

FROM node:${NODE_VERSION} AS builder
WORKDIR /work
RUN corepack enable
RUN apk add --no-cache git

COPY --from=deps /work/node_modules ./node_modules
COPY --from=deps /work/apps/web/node_modules ./apps/web/node_modules
# Workspace packages' node_modules carry the per-package symlinks into the pnpm
# virtual store (e.g. packages/adapters/node_modules/isomorphic-git -> ../../../
# node_modules/.pnpm/...). isomorphic-git is a runtime dep of @ever-works/adapters
# and is `ssr.external` in apps/web/astro.config.ts, so the SSR prerender resolves
# it from packages/adapters/node_modules at build time — NOT root node_modules
# (pnpm does not hoist it there, even with shamefully-hoist). Without this copy
# `astro build` fails: "Cannot find module 'isomorphic-git'". `COPY . .` below
# refreshes the source; node_modules are excluded from the context (.dockerignore)
# so these persist.
COPY --from=deps /work/packages ./packages

COPY . .

ARG DATA_REPOSITORY=""
ENV DATA_REPOSITORY=${DATA_REPOSITORY}
ENV NODE_OPTIONS="--max-old-space-size=4096"
# Vercel is decommissioned; this image serves as static nginx on k8s. Force the
# pure-static Astro build so the @astrojs/vercel adapter is never constructed and
# the output is always `apps/web/dist` (not `.vercel/output`). Without this, if a
# WEBHOOK_SECRET is ever injected at build time astro.config flips buildOutput to
# 'server' and the `COPY dist` runner stage would break. (adapter dep is kept.)
ENV ENABLE_ISR=false

RUN --mount=type=secret,id=gh_token \
    sh -c 'if [ -s /run/secrets/gh_token ]; then export GH_TOKEN=$(cat /run/secrets/gh_token); fi; \
           pnpm --filter @ever-works/web-minimal run build'

# ---- runner ----------------------------------------------------------------

FROM nginx:${NGINX_VERSION} AS runner

ARG GITHUB_REPOSITORY=""
ARG GITHUB_SHA=""

LABEL org.opencontainers.image.source="https://github.com/${GITHUB_REPOSITORY}"
LABEL org.opencontainers.image.revision="${GITHUB_SHA}"
LABEL org.opencontainers.image.title="${GITHUB_REPOSITORY}"

# Listen on 3000 so the Service's targetPort: 3000 from the k8s plugin
# matches the Astro static template without special-casing.
RUN sed -i 's|listen\s\+80;|listen 3000;|' /etc/nginx/conf.d/default.conf

# Serve the Astro static output. Default `try_files` falls through to
# /index.html so the SPA-style routes (404.html etc.) work as expected.
RUN cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
    listen 3000;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Long-cache hashed static assets.
    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri.html $uri/index.html /index.html =404;
    }

    # Health endpoint for the readiness/liveness probes (the k8s plugin
    # probes GET /).
    location = /healthz {
        access_log off;
        return 200 "ok\n";
        add_header Content-Type text/plain;
    }
}
EOF

COPY --from=builder /work/apps/web/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
