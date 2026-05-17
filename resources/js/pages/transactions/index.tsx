import AppLayout from '../../layouts/AppLayout';
import Table, { Column } from '../../components/Table';
import { formatCurrency, formatDate } from '../../utils';
import React from 'react';
import { router } from '@inertiajs/react';
import TransactionForm from './components/transaction-form';
import TransactionFilterForm from './components/transaction-filter-form';

interface Transaction {
    id: number;
    network: string;
    networkId: number;
    accountNumber: string;
    accountName: string;
    amount: number;
    customer: string;
    commission: number;
    fee: number;
    createdAt: string;
    createdBy: string;
}

interface Network {
    id: number;
    name: string;
    balance: number;
}

interface User {
    id: number;
    name: string;
}

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

    const columns: Column<Transaction>[] = [
        {
            header: 'Na.',
            className: 'w-12 text-center text-gray-400 font-semibold select-none',
            render: (_, index) => <span className="text-gray-400 font-semibold">#{index + 1}</span>,
        },
        {
            header: 'Tarehe',
            className: 'text-gray-600 font-semibold text-xs whitespace-nowrap',
            render: (item) => <span>{formatDate(item.createdAt)}</span>,
        },
        {
            header: 'Mtandao',
            className: 'font-bold uppercase text-xs',
            render: (item) => (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700">
                    {item.network}
                </span>
            ),
        },
        {
            header: 'Akaunti',
            className: 'text-gray-800 text-sm font-medium',
            render: (item) => (
                <div className="flex flex-col">
                    <span className="font-extrabold uppercase text-gray-900">{item.accountName}</span>
                    <span className="font-mono text-xs text-gray-500 select-all">{item.accountNumber}</span>
                </div>
            ),
        },
        {
            header: 'Kiasi',
            className: 'font-extrabold text-sm whitespace-nowrap text-right pr-4',
            render: (item) => {
                const absAmount = Math.abs(item.amount);
                return (
                    <span className={item.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {item.amount > 0 ? '+' : '-'}
                        {formatCurrency(absAmount)}
                    </span>
                );
            },
        },
        {
            header: 'Ada',
            className: 'font-semibold text-gray-700 text-xs whitespace-nowrap text-right pr-4',
            render: (item) => <span>{formatCurrency(item.fee)}</span>,
        },
        {
            header: 'Mrejea',
            className: 'font-bold text-emerald-600 text-xs whitespace-nowrap text-right pr-4',
            render: (item) => <span>{formatCurrency(item.commission)}</span>,
        },
        {
            header: 'Mteja (By)',
            className: 'font-semibold uppercase text-xs text-gray-700',
            render: (item) => <span>{item.customer || item.accountName}</span>,
        },
        {
            header: 'Operator',
            className: 'font-extrabold uppercase text-xs text-gray-900',
            render: (item) => <span>{item.createdBy}</span>,
        },
        ...(canDeleteTransaction
            ? [
                  {
                      header: 'Vitendo',
                      className: 'w-24 text-right select-none',
                      render: (item: Transaction) => (
                          <button
                              onClick={() => handleDelete(item.id, item.customer || item.accountName)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 transition-colors select-none cursor-pointer"
                          >
                              Futa
                          </button>
                      ),
                  },
              ]
            : []),
    ];

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

                <Table
                    data={transactions}
                    columns={columns}
                    emptyMessage="Hakuna miamala iliyosajiliwa inayolingana na utafutaji wako leo au kwa tarehe zilizochaguliwa."
                />
            </div>
        </AppLayout>
    );
}
