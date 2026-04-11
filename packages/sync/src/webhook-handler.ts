/**
 * WebhookHandler — Validates and parses GitHub webhook payloads.
 * Uses HMAC-SHA256 for signature verification.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/** Parsed GitHub push event data */
export interface GitHubPushData {
    /** Branch that was pushed to (e.g., 'main') */
    branch: string;
    /** Number of commits in the push */
    commits: number;
    /** Pusher username */
    pusher?: string;
}

export class WebhookHandler {
    /**
     * Validate a GitHub webhook signature using HMAC-SHA256.
     * @param rawBody - Raw request body as string
     * @param signature - Value of X-Hub-Signature-256 header (format: sha256=...)
     * @param secret - Webhook secret configured in GitHub
     * @returns true if signature is valid
     */
    static validateSignature(rawBody: string, signature: string, secret: string): boolean {
        if (!signature || !secret) return false;

        const expectedPrefix = 'sha256=';
        if (!signature.startsWith(expectedPrefix)) return false;

        const sigHex = signature.slice(expectedPrefix.length);
        const expected = createHmac('sha256', secret)
            .update(rawBody, 'utf-8')
            .digest('hex');

        // Use timing-safe comparison to prevent timing attacks
        try {
            const sigBuffer = Buffer.from(sigHex, 'hex');
            const expectedBuffer = Buffer.from(expected, 'hex');
            return sigBuffer.length === expectedBuffer.length
                && timingSafeEqual(sigBuffer, expectedBuffer);
        } catch {
            return false;
        }
    }

    /**
     * Parse a GitHub push webhook payload.
     * @param body - Parsed JSON body from the webhook request
     * @returns Parsed push data, or null if not a valid push payload
     */
    static parseGitHubPush(body: unknown): GitHubPushData | null {
        if (!body || typeof body !== 'object') return null;

        const data = body as Record<string, unknown>;
        const ref = data['ref'];
        const commits = data['commits'];
        const pusher = data['pusher'];

        if (typeof ref !== 'string') return null;

        // ref format: refs/heads/<branch>
        const branchPrefix = 'refs/heads/';
        if (!ref.startsWith(branchPrefix)) return null;

        const branch = ref.slice(branchPrefix.length);

        return {
            branch,
            commits: Array.isArray(commits) ? commits.length : 0,
            pusher: pusher && typeof pusher === 'object' && 'name' in pusher
                ? String((pusher as Record<string, unknown>)['name'])
                : undefined,
        };
    }

    /**
     * Check if a push event targets the configured branch.
     * @param pushBranch - Branch from the push event
     * @param targetBranch - Branch we're tracking
     */
    static isRelevantPush(pushBranch: string, targetBranch: string): boolean {
        return pushBranch === targetBranch;
    }
}
