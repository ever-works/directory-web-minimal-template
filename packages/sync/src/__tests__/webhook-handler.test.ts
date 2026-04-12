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

	describe('validateSignature — edge cases', () => {
		it('should reject invalid HMAC from wrong secret', () => {
			const body = '{"ref":"refs/heads/main","commits":[]}';
			const correctSecret = 'correct-secret';
			const wrongSecret = 'wrong-secret';
			const signature = signPayload(body, wrongSecret);

			expect(WebhookHandler.validateSignature(body, signature, correctSecret)).toBe(false);
		});

		it('should reject empty body with valid signature format', () => {
			const secret = 'test-secret';
			// Sign empty string, but pass different body
			const signature = signPayload('', secret);

			// Signature for empty string should validate with empty body
			expect(WebhookHandler.validateSignature('', signature, secret)).toBe(true);

			// But should not validate with non-empty body
			expect(WebhookHandler.validateSignature('{"data":true}', signature, secret)).toBe(false);
		});

		it('should reject signature with non-hex characters', () => {
			expect(
				WebhookHandler.validateSignature('body', 'sha256=ZZZZZZZZZZZZ', 'secret'),
			).toBe(false);
		});
	});

	describe('parseGitHubPush — edge cases', () => {
		it('should parse GitHub push payload and extract branch correctly', () => {
			const payload = {
				ref: 'refs/heads/feature/my-branch',
				commits: [{ id: 'abc' }],
				pusher: { name: 'deployer' },
			};

			const result = WebhookHandler.parseGitHubPush(payload);

			expect(result).not.toBeNull();
			expect(result!.branch).toBe('feature/my-branch');
			expect(result!.commits).toBe(1);
			expect(result!.pusher).toBe('deployer');
		});

		it('should handle non-push events gracefully (ping event)', () => {
			const pingPayload = {
				zen: 'Keep it logically awesome.',
				hook_id: 12345,
				hook: { type: 'Repository' },
			};

			const result = WebhookHandler.parseGitHubPush(pingPayload);
			expect(result).toBeNull();
		});

		it('should handle non-push events gracefully (release event)', () => {
			const releasePayload = {
				action: 'published',
				release: { tag_name: 'v1.0.0', name: 'Release 1.0' },
			};

			const result = WebhookHandler.parseGitHubPush(releasePayload);
			expect(result).toBeNull();
		});

		it('should return null for undefined input', () => {
			expect(WebhookHandler.parseGitHubPush(undefined)).toBeNull();
		});

		it('should return null for string input', () => {
			expect(WebhookHandler.parseGitHubPush('not an object')).toBeNull();
		});

		it('should handle pusher without name field', () => {
			const payload = {
				ref: 'refs/heads/main',
				commits: [],
				pusher: { email: 'user@example.com' },
			};

			const result = WebhookHandler.parseGitHubPush(payload);
			expect(result).not.toBeNull();
			expect(result!.pusher).toBeUndefined();
		});

		it('should handle pusher as non-object', () => {
			const payload = {
				ref: 'refs/heads/main',
				commits: [{ id: '1' }],
				pusher: 'not-an-object',
			};

			const result = WebhookHandler.parseGitHubPush(payload);
			expect(result).not.toBeNull();
			expect(result!.pusher).toBeUndefined();
			expect(result!.commits).toBe(1);
		});
	});
});
