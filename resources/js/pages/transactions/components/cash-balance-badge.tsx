import React from 'react';
import { formatCurrency } from '@/utils';

interface Props {
    balance: number;
}

export default function CashBalanceBadge({ balance }: Props) {
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            CASH:{" "}
            <span className="font-bold text-gray-900">
                {formatCurrency(balance)}
            </span>
        </div>
    );
}
