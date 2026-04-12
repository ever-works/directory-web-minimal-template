import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DeployHookTrigger } from '../deploy-hook.js';

describe('DeployHookTrigger', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('should trigger deploy hook successfully', async () => {
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
			new Response(null, { status: 200 }),
		);

		const result = await DeployHookTrigger.trigger('https://api.vercel.com/v1/hook/123');

		expect(result.success).toBe(true);
		expect(result.statusCode).toBe(200);
		expect(globalThis.fetch).toHaveBeenCalledWith(
			'https://api.vercel.com/v1/hook/123',
			{ method: 'POST' },
		);
	});

	it('should handle HTTP error', async () => {
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
			new Response(null, { status: 404, statusText: 'Not Found' }),
		);

		const result = await DeployHookTrigger.trigger('https://api.vercel.com/v1/hook/bad');

		expect(result.success).toBe(false);
		expect(result.statusCode).toBe(404);
	});

	it('should handle network error', async () => {
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
			new Error('fetch failed'),
		);

		const result = await DeployHookTrigger.trigger('https://api.vercel.com/v1/hook/123');

		expect(result.success).toBe(false);
		expect(result.message).toContain('fetch failed');
	});

	it('should return error for empty hook URL', async () => {
		const result = await DeployHookTrigger.trigger('');

		expect(result.success).toBe(false);
		expect(result.message).toContain('No deploy hook URL');
	});

	it('should handle network errors with non-Error thrown values', async () => {
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue('string error');

		const result = await DeployHookTrigger.trigger('https://api.vercel.com/v1/hook/123');

		expect(result.success).toBe(false);
		expect(result.message).toContain('string error');
	});

	it('should handle TypeError from fetch (DNS failure)', async () => {
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
			new TypeError('Failed to resolve host'),
		);

		const result = await DeployHookTrigger.trigger('https://api.vercel.com/v1/hook/123');

		expect(result.success).toBe(false);
		expect(result.message).toContain('Failed to resolve host');
		expect(result.statusCode).toBeUndefined();
	});

	it('should not trigger when URL is empty string', async () => {
		const result = await DeployHookTrigger.trigger('');

		expect(result.success).toBe(false);
		expect(result.message).toBe('No deploy hook URL configured');
		// fetch should NOT have been called
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('should send POST request with correct method', async () => {
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
			new Response(null, { status: 201 }),
		);

		const hookUrl = 'https://api.vercel.com/v1/integrations/deploy/hook-id/token';
		const result = await DeployHookTrigger.trigger(hookUrl);

		expect(result.success).toBe(true);
		expect(globalThis.fetch).toHaveBeenCalledWith(hookUrl, { method: 'POST' });
	});

	it('should handle server error (500) response', async () => {
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
			new Response(null, { status: 500, statusText: 'Internal Server Error' }),
		);

		const result = await DeployHookTrigger.trigger('https://api.vercel.com/v1/hook/123');

		expect(result.success).toBe(false);
		expect(result.statusCode).toBe(500);
		expect(result.message).toContain('500');
		expect(result.message).toContain('Internal Server Error');
	});

	it('should handle rate limit (429) response', async () => {
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
			new Response(null, { status: 429, statusText: 'Too Many Requests' }),
		);

		const result = await DeployHookTrigger.trigger('https://api.vercel.com/v1/hook/123');

		expect(result.success).toBe(false);
		expect(result.statusCode).toBe(429);
		expect(result.message).toContain('429');
	});
});
