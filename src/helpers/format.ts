/**
 * Format a number with comma-separated thousands
 * @param num The number to format
 * @returns The formatted number as a string
 */
export function formatNumber(num: number): string {
	return num.toLocaleString();
}