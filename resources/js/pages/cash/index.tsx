import AppLayout from '@/layouts/AppLayout';
import { formatCurrency, formatDate } from '@/utils';
import React, { useMemo } from 'react';
import { router } from '@inertiajs/react';
import CashForm from './components/cash-form';
import CashFilterForm from './components/cash-filter-form';
import { CashTransaction, User } from '@/types';
import DataTable from '@/components/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import BalanceBanner from '@/components/ui/balance-banner';

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

    const columns = useMemo<ColumnDef<CashTransaction>[]>(
        () => [
            {
                header: 'Na.',
                accessorFn: (_, index) => index + 1,
            },
            {
                header: 'Tarehe',
                accessorFn: (row) => formatDate(row.createdAt),
            },
            {
                header: 'Muamala Ref',
                accessorFn: (row) => row.transactionId ?? row.remark,
            },
            {
                header: 'Kiasi',
                accessorKey: 'amount',
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <span className={`font-semibold whitespace-nowrap ${item.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {item.amount >= 0 ? '+' : ''}
                            {formatCurrency(item.amount)}
                        </span>
                    );
                },
            },
            {
                header: 'Mtumiaji',
                accessorFn: (row) => row.createdBy?.toUpperCase() || 'N/A',
            },
        ],
        [],
    );

    return (
        <AppLayout user={user} title="Cash Transactions">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 font-sans">Miamala ya Cash (Cash Flow)</h2>
                    <p className="text-sm text-gray-500">Fuatilia na urekodi miamala yote ya fedha taslimu (cash) na salio lililopo ofisini.</p>
                </div>

                <BalanceBanner label="Salio la Cash (Office)" balance={balance} />
            </div>

            {canAddCashTransaction && (
                <div className="mb-4">
                    <CashForm />
                </div>
            )}

            <div className="bg-white rounded-md border border-gray-200/80 p-5 shadow-xs space-y-4">
                {/* Filter Section */}
                <CashFilterForm
                    filters={filters}
                    users={users}
                    canListUsers={canListUsers}
                    onChange={handleFilterChange}
                />

                {/* Table Data */}
                <DataTable
                    data={transactions}
                    columns={columns}
                    textSize="text-xs"
                />
            </div>
        </AppLayout>
    );
}
