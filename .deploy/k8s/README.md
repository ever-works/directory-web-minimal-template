# Standalone Kubernetes deployment

These manifests deploy this minimal (Astro) template to a Kubernetes cluster **without the Ever Works platform** — straight from a clone of the template repo. Use them if you've forked the repo, want to host the site yourself, and don't want or need the SaaS plumbing.

> **Heads-up.** A separate folder, [`.deploy/k8s-platform/`](../k8s-platform/README.md), holds the manifests the Ever Works SaaS platform applies via its own deploy workflow. Those use `${VAR}` placeholders that the platform substitutes at deploy time. The files here are the manual, self-contained equivalent.

## What you get

- `namespace.yaml` — a dedicated namespace (`ever-works`) for the workloads.
- `deployment.yaml` — the Astro static container (nginx serving `apps/web/dist` on port 3000) with rolling updates, probes, and resource limits.
- `service.yaml` — `ClusterIP` Service on port 80 → containerPort 3000.
- `ingress.yaml` — example Ingress with cert-manager / nginx annotations.
- `kustomization.yaml` — convenience wrapper so you can `kubectl apply -k .deploy/k8s`.

## Prerequisites

1. A Kubernetes cluster (kind / k3s / EKS / GKE / AKS / on-prem — anything ≥ 1.27).
2. `kubectl` configured to talk to that cluster.
3. A built and pushed container image of this repo. There's a `Dockerfile` at the repo root that produces an nginx-based image serving the Astro static output:

   ```bash
   docker build -t ghcr.io/your-user/my-site:v1 .
   docker push ghcr.io/your-user/my-site:v1
   ```

4. *(Optional)* An Ingress controller — ingress-nginx is what the example annotations target.
5. *(Optional)* `cert-manager` with a `ClusterIssuer` for TLS.

## Quick start

1. Edit [`deployment.yaml`](deployment.yaml) — replace `IMAGE_PLACEHOLDER` with your pushed image.
2. *(Optional)* Edit [`ingress.yaml`](ingress.yaml) — replace `example.com` with your domain and `letsencrypt-prod` with your `ClusterIssuer`.
3. Apply everything:

   ```bash
   kubectl apply -k .deploy/k8s
   ```

4. Watch the rollout:

   ```bash
   kubectl -n ever-works rollout status deployment/web
   ```

5. Once `Available`, point your DNS at the cluster's ingress load balancer:

   ```bash
   kubectl -n ever-works get ingress web
   ```

## Notes specific to this template

- The Astro build output is **static HTML/CSS/JS** served by nginx — there's no runtime Node.js process, so the container is small and lightweight.
- Health probes hit `GET /` (the static `index.html`); a dedicated `/healthz` endpoint is also exposed by the nginx config in the Dockerfile.
- The `DATABASE_URL` / `GH_TOKEN` env-var pattern from the Next.js template doesn't apply here — Astro's static output has no server-side runtime config.

## Pulling private images

If your registry is private, create a `docker-registry` Secret and uncomment `imagePullSecrets` in `deployment.yaml`:

```bash
kubectl -n ever-works create secret docker-registry regcred \
    --docker-server=ghcr.io \
    --docker-username=YOUR_USER \
    --docker-password=YOUR_TOKEN
```

## Customising

| What | Where |
| ---- | ----- |
| Replicas | `deployment.yaml` → `spec.replicas` |
| Resources | `deployment.yaml` → `containers[0].resources` |
| Ingress class | `ingress.yaml` → `spec.ingressClassName` |
| Domain | `ingress.yaml` → `spec.rules[0].host` and `spec.tls[0].hosts` |
| Namespace | `namespace.yaml` + `kustomization.yaml.namespace` |

## Differences from `.deploy/k8s-platform/`

| | This folder (`.deploy/k8s/`) | Platform folder (`.deploy/k8s-platform/`) |
| - | --- | --- |
| Audience | Manual users / self-hosters | Ever Works SaaS platform |
| Image tag | Hard-coded by you | Substituted by the deploy workflow |
| Apply | `kubectl apply -k .deploy/k8s` | `.github/workflows/deploy_k8s.yaml` |
| Placeholders | None | `${WORK_SLUG}`, `${IMAGE}`, `${NAMESPACE}`, etc. |
| Customisation | Edit the YAML | Set platform plugin settings |
