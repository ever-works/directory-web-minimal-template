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
});
