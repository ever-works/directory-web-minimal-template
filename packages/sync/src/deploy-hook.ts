/**
 * DeployHookTrigger — Triggers Vercel deploy hooks for static site rebuilds.
 * Used in static mode (ENABLE_ISR=false) when a webhook indicates content changed.
 */

/** Result of triggering a deploy hook */
export interface DeployHookResult {
    success: boolean;
    message: string;
    statusCode?: number;
}

export class DeployHookTrigger {
    /**
     * Trigger a Vercel deploy hook by sending a POST request.
     * @param hookUrl - The Vercel deploy hook URL
     * @returns Result indicating success or failure
     */
    static async trigger(hookUrl: string): Promise<DeployHookResult> {
        if (!hookUrl) {
            return { success: false, message: 'No deploy hook URL configured' };
        }

        try {
            const response = await fetch(hookUrl, { method: 'POST' });

            if (response.ok) {
                return {
                    success: true,
                    message: `Deploy hook triggered successfully (${response.status})`,
                    statusCode: response.status,
                };
            }

            return {
                success: false,
                message: `Deploy hook failed: HTTP ${response.status} ${response.statusText}`,
                statusCode: response.status,
            };
        } catch (error) {
            return {
                success: false,
                message: `Deploy hook request failed: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
}
