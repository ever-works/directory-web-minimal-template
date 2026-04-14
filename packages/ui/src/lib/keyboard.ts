/**
 * Keyboard interaction utilities for accessible interactive elements.
 * Shared between FilterBar and ItemBrowser.
 */

/** Handle Enter/Space key activation for non-button interactive elements */
export function handleKeyActivation(callback: () => void) {
	return (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			callback();
		}
	};
}
