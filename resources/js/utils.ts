import dayjs from 'dayjs';

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

/**
 * Formats a ISO date string into DD-MM-YYYY hh:mm A.
 */
export function formatDate(date: string): string {
    if (!date) return '';
    return dayjs(date).format('DD-MM-YYYY hh:mm A');
}

