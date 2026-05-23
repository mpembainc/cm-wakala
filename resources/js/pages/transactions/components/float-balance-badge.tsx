import React from 'react';
import { formatCurrency } from '@/utils';

interface Props {
    networkName: string;
    balance: number;
}

export default function FloatBalanceBadge({ networkName, balance }: Props) {
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            FLOAT ({networkName}):{" "}
            <span className="font-bold">
                {formatCurrency(balance)}
            </span>
        </div>
    );
}
