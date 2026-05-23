import React from 'react';
import { formatCurrency } from '@/utils';

interface BalanceBannerProps {
    label: string;
    balance: number;
    variant?: 'emerald' | 'indigo' | 'blue' | 'amber';
}

const variantStyles = {
    emerald: {
        container: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-400',
        label: 'text-emerald-600 dark:text-emerald-400',
        value: 'text-emerald-700 dark:text-emerald-300',
    },
    indigo: {
        container: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-800/30 dark:text-indigo-400',
        label: 'text-indigo-600 dark:text-indigo-400',
        value: 'text-indigo-700 dark:text-indigo-300',
    },
    blue: {
        container: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-800/30 dark:text-blue-400',
        label: 'text-blue-600 dark:text-blue-400',
        value: 'text-blue-700 dark:text-blue-300',
    },
    amber: {
        container: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800/30 dark:text-amber-400',
        label: 'text-amber-600 dark:text-amber-400',
        value: 'text-amber-700 dark:text-amber-300',
    },
};

export default function BalanceBanner({ label, balance, variant = 'emerald' }: BalanceBannerProps) {
    const styles = variantStyles[variant];
    return (
        <div className={`border rounded-xl px-5 py-3 flex flex-col items-end shadow-xs shrink-0 select-none ${styles.container}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider font-sans ${styles.label}`}>
                {label}
            </span>
            <span className={`text-xl font-extrabold font-mono ${styles.value}`}>
                {formatCurrency(balance)}
            </span>
        </div>
    );
}
