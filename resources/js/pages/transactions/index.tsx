import AppLayout from '@/layouts/AppLayout';
// import Table, { Column } from '@/components/Table';
import { formatCurrency, formatDate, formatNumber } from '@/utils';
import { router } from '@inertiajs/react';
import TransactionForm from './components/transaction-form';
import TransactionFilterForm from './components/transaction-filter-form';
import { Network, Transaction, User } from '@/types';
import DataTable from '@/components/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

interface Props {
    transactions: Transaction[];
    networks: Network[];
    cashBalance: number;
    users: User[];
    filters: {
        startDate: string;
        endDate: string;
        networkId: string | number;
        userId: string | number;
        search: string;
    };
    user: { name: string; permissions: string[] };
}

export default function TransactionsIndex({ transactions, networks, cashBalance, users, filters, user }: Props) {
    const canAddTransaction = user.permissions.includes('add_transaction');
    const canDeleteTransaction = user.permissions.includes('delete_transaction');
    const canListUsers = user.permissions.includes('list_users');

    const handleFilterChange = (newFilters: typeof filters) => {
        router.get('/transactions', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleDelete = (id: number, customer: string) => {
        if (confirm(`Je, una uhakika unataka kufuta muamala wa "${customer}"?`)) {
            router.delete(`/transactions/${id}`);
        }
    };

    const columns = useMemo<ColumnDef<Transaction>[]>(
        () => [
            { header: "REF", accessorKey: "id" },
            { header: "MTANDAO", accessorKey: "network" },
            { header: "JINA", accessorKey: "accountName" },
            { header: "NAMBARI", accessorKey: "accountNumber" },
            { header: "KIASI (Tsh)", accessorFn: row => formatNumber(row.amount)},
            { header: "ADA (Tsh)", accessorFn: row => formatNumber(row.fee) },
            { header: "MTEJA", accessorKey: "customer" },
            { header: "OPERATOR", accessorKey: "createdBy" },
            { header: 'TAREHE', accessorFn: (row) => formatDate(row.createdAt) },
        ],
        [],
    );

    return (
        <AppLayout user={user} title="Transactions">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 font-sans">Usimamizi wa Miamala</h2>
                    <p className="text-sm text-gray-500">Sajili miamala mipya ya wateja na ufuatilie mtiririko wa float na ada za huduma.</p>
                </div>
            </div>

            {canAddTransaction && (
                <div className="mb-6 animate-fade-in">
                    <TransactionForm networks={networks} cashBalance={cashBalance} />
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
                <TransactionFilterForm
                    filters={filters}
                    networks={networks}
                    users={users}
                    canListUsers={canListUsers}
                    onChange={handleFilterChange}
                />

                <DataTable data={transactions} columns={columns} textSize='text-xs' />
            </div>
        </AppLayout>
    );
}
