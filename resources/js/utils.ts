/**
 * Formats a numeric value into Tanzania Shillings (TZS) currency format.
 * E.g., 100000 -> TZS 100,000 or TSh 100,000 depending on environment support.
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-TZ', {
        style: 'currency',
        currency: 'TZS',
        maximumFractionDigits: 0,
    }).format(value);
}
