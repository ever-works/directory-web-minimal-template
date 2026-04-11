import { describe, it, expect } from 'vitest';
import { WebhookHandler } from '../webhook-handler.js';
import { createHmac } from 'node:crypto';

function signPayload(body: string, secret: string): string {
	const hmac = createHmac('sha256', secret).update(body, 'utf-8').digest('hex');
	return `sha256=${hmac}`;
}

describe('WebhookHandler', () => {
	describe('validateSignature', () => {
		it('should validate correct signature', () => {
			const body = '{"ref":"refs/heads/main"}';
			const secret = 'test-secret';
			const signature = signPayload(body, secret);

			expect(WebhookHandler.validateSignature(body, signature, secret)).toBe(true);
		});

		it('should reject invalid signature', () => {
			const body = '{"ref":"refs/heads/main"}';
			const secret = 'test-secret';

			expect(WebhookHandler.validateSignature(body, 'sha256=invalid', secret)).toBe(false);
		});

		it('should reject missing signature', () => {
			expect(WebhookHandler.validateSignature('body', '', 'secret')).toBe(false);
		});

		it('should reject missing secret', () => {
			expect(WebhookHandler.validateSignature('body', 'sha256=abc', '')).toBe(false);
		});

		it('should reject signature without sha256= prefix', () => {
			expect(WebhookHandler.validateSignature('body', 'abcdef', 'secret')).toBe(false);
		});
	});

	describe('parseGitHubPush', () => {
		it('should parse a valid push payload', () => {
			const payload = {
				ref: 'refs/heads/main',
				commits: [{ id: '1' }, { id: '2' }],
				pusher: { name: 'testuser' },
			};

			const result = WebhookHandler.parseGitHubPush(payload);

			expect(result).toEqual({
				branch: 'main',
				commits: 2,
				pusher: 'testuser',
			});
		});

		it('should return null for non-push payload', () => {
			expect(WebhookHandler.parseGitHubPush({ action: 'opened' })).toBeNull();
		});

		it('should return null for tag push', () => {
			expect(WebhookHandler.parseGitHubPush({ ref: 'refs/tags/v1.0' })).toBeNull();
		});

		it('should return null for null input', () => {
			expect(WebhookHandler.parseGitHubPush(null)).toBeNull();
		});

		it('should handle missing commits array', () => {
			const result = WebhookHandler.parseGitHubPush({ ref: 'refs/heads/main' });
			expect(result?.commits).toBe(0);
		});
	});

	describe('isRelevantPush', () => {
		it('should match same branch', () => {
			expect(WebhookHandler.isRelevantPush('main', 'main')).toBe(true);
		});

		it('should not match different branch', () => {
			expect(WebhookHandler.isRelevantPush('develop', 'main')).toBe(false);
		});
	});
});
