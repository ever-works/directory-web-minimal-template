/**
 * Webhook API Endpoint — Handles incoming GitHub webhook requests.
 *
 * This file is injected as an Astro API route at /api/webhook
 * by the Ever Works integration when `sync.webhook` is enabled.
 *
 * Flow:
 * 1. Validates X-Hub-Signature-256 using the configured secret
 * 2. Parses the GitHub push payload
 * 3. Checks if the push targets our tracked branch
 * 4. ISR mode: calls syncManager.sync() + cache.invalidate()
 * 5. Static mode: triggers Vercel deploy hook
 */

import type { APIRoute } from 'astro';
import {
	getSyncManager,
	getContentCache,
	getWebhookSecret,
	getDeployHookUrl,
	getTargetBranch,
} from './sync-registry.js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	try {
		const secret = getWebhookSecret();
		if (!secret) {
			return jsonResponse(500, { error: 'Webhook secret not configured' });
		}

		// Read raw body for signature validation
		const rawBody = await request.text();
		const signature = request.headers.get('x-hub-signature-256') ?? '';

		// Dynamic import to avoid bundling @ever-works/sync when not used
		const { WebhookHandler } = await import('@ever-works/sync');

		// Validate signature
		if (!WebhookHandler.validateSignature(rawBody, signature, secret)) {
			return jsonResponse(401, { error: 'Invalid webhook signature' });
		}

		// Parse push payload
		const body: unknown = JSON.parse(rawBody);
		const pushData = WebhookHandler.parseGitHubPush(body);

		if (!pushData) {
			return jsonResponse(200, { message: 'Not a push event, ignoring' });
		}

		// Check if push targets our branch only when a branch was explicitly configured.
		const targetBranch = getTargetBranch();
		if (targetBranch && !WebhookHandler.isRelevantPush(pushData.branch, targetBranch)) {
			return jsonResponse(200, {
				message: `Push to ${pushData.branch}, ignoring (tracking ${targetBranch})`,
			});
		}

		// Try ISR mode: sync + invalidate cache
		const syncManager = getSyncManager();
		const contentCache = getContentCache();

		if (syncManager) {
			const result = await syncManager.sync();

			if (result.contentChanged && contentCache) {
				contentCache.invalidate();
			}

			return jsonResponse(200, {
				message: result.message,
				contentChanged: result.contentChanged,
				branch: pushData.branch,
				commits: pushData.commits,
			});
		}

		// Fallback: static mode — trigger deploy hook
		const deployHookUrl = getDeployHookUrl();
		if (deployHookUrl) {
			const { DeployHookTrigger } = await import('@ever-works/sync');
			const hookResult = await DeployHookTrigger.trigger(deployHookUrl);

			return jsonResponse(hookResult.success ? 200 : 502, {
				message: hookResult.message,
				mode: 'deploy-hook',
				branch: pushData.branch,
			});
		}

		return jsonResponse(200, {
			message: 'Webhook received but no sync manager or deploy hook configured',
			branch: pushData.branch,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error('[webhook] Error processing webhook:', message);
		return jsonResponse(500, { error: 'Internal webhook processing error' });
	}
};

/** GET handler for health check */
export const GET: APIRoute = async () => {
	const syncManager = getSyncManager();
	const status = syncManager?.getStatus() ?? { isRunning: false, lastSyncTime: null };

	return jsonResponse(200, {
		status: 'ok',
		sync: status,
	});
};

function jsonResponse(status: number, data: Record<string, unknown>): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}
