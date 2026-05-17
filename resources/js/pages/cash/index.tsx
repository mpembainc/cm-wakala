import AppLayout from '../../layouts/AppLayout';
import Table, { Column } from '../../components/Table';
import { formatCurrency } from '../../utils';
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import CashForm from './components/cash-form';
import CashFilterForm from './components/cash-filter-form';
import { formatDate } from '../../utils';

interface CashTransaction {
    id: number;
    amount: number;
    transactionId: number | null;
    reference: string | null;
    remark: string;
    createdAt: string;
    createdBy: string;
}

interface User {
    id: number;
    name: string;
}

interface Props {
    transactions: CashTransaction[];
    balance: number;
    users: User[];
    filters: {
        startDate: string;
        endDate: string;
        userId: string | number;
    };
    user: { name: string; permissions: string[] };
}

export default function CashIndex({ transactions, balance, users, filters, user }: Props) {
    const canAddCashTransaction = user.permissions.includes('add_cash_transaction');
    const canListUsers = user.permissions.includes('list_users');

    const handleFilterChange = (newFilters: typeof filters) => {
        router.get('/cash', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const columns: Column<CashTransaction>[] = [
        {
            header: 'Na.',
            className: 'w-16 text-center text-gray-400 font-semibold select-none',
            render: (_, index) => <span className="text-gray-400 font-semibold">#{index + 1}</span>,
        },
        {
            header: 'Tarehe',
            className: 'text-gray-600 font-semibold text-xs whitespace-nowrap',
            render: (item) => <span>{formatDate(item.createdAt)}</span>,
        },
        {
            header: 'Muamala Ref / Maelezo',
            className: 'text-gray-700 font-medium',
            render: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-sm uppercase">
                        {item.remark || 'CASH FLOW'}
                    </span>
                    {item.transactionId && (
                        <span className="text-xs text-gray-400 font-semibold select-none">
                            TX ID: #{item.transactionId}
                        </span>
                    )}
                    {item.reference && (
                        <span className="text-xs text-gray-400 font-semibold select-none">
                            REF: {item.reference}
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Kiasi',
            className: 'font-bold text-sm whitespace-nowrap',
            render: (item) => (
                <span className={item.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {item.amount >= 0 ? '+' : ''}
                    {formatCurrency(item.amount)}
                </span>
            ),
        },
        {
            header: 'Mtumiaji',
            className: 'font-bold text-gray-900 uppercase text-xs whitespace-nowrap',
            render: (item) => <span>{item.createdBy}</span>,
        },
    ];

    return (
        <AppLayout user={user} title="Cash Transactions">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 font-sans">Miamala ya Cash (Cash Flow)</h2>
                    <p className="text-sm text-gray-500">Fuatilia na urekodi miamala yote ya fedha taslimu (cash) na salio lililopo ofisini.</p>
                </div>

                {/* Total Cash Balance Badge */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 flex flex-col items-end shadow-xs shrink-0 select-none">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider font-sans">Salio la Cash (Office)</span>
                    <span className="text-xl font-extrabold text-emerald-700 font-mono">{formatCurrency(balance)}</span>
                </div>
            </div>

            {canAddCashTransaction && (
                <div className="mb-6">
                    <CashForm />
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
                {/* Filter Section */}
                <CashFilterForm
                    filters={filters}
                    users={users}
                    canListUsers={canListUsers}
                    onChange={handleFilterChange}
                />

                {/* Table Data */}
                <Table
                    data={transactions}
                    columns={columns}
                    emptyMessage="Hakuna miamala ya cash inayolingana na utafutaji wako kwa tarehe zilizochaguliwa."
                />
            </div>
        </AppLayout>
    );
}
