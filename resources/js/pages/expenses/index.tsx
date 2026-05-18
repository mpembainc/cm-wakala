import AppLayout from '../../layouts/AppLayout';
import Table, { Column } from '../../components/Table';
import { formatCurrency, formatDate } from '../../utils';
import React from 'react';
import { router } from '@inertiajs/react';
import ExpenseForm from './components/expense-form';
import ExpenseFilterForm from './components/expense-filter-form';

interface Expense {
    id: number;
    name: string;
    amount: number;
    createdAt: string;
    expenseDate: string;
    createdBy: string;
}

interface Props {
    expenses: { data: Expense[] };
    filters: {
        search: string;
        month: string;
    };
    user: { name: string; permissions: string[] };
}

export default function ExpensesIndex({ expenses, filters, user }: Props) {
    const canAddExpense = user.permissions.includes('add_expense');

    const handleFilterChange = (newFilters: typeof filters) => {
        router.get('/expenses', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Calculate total of current displayed expenses list
    const displayedTotal = expenses.data.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const columns: Column<Expense>[] = [
        {
            header: 'Ref No.',
            className: 'w-20 text-center text-gray-400 font-semibold select-none',
            render: (item) => <span className="text-gray-400 font-semibold">#{item.id}</span>,
        },
        {
            header: 'Tarehe ya Matumizi',
            className: 'text-gray-600 font-semibold text-xs whitespace-nowrap',
            render: (item) => <span>{item.expenseDate}</span>,
        },
        {
            header: 'Maelezo ya Matumizi',
            className: 'text-gray-700 font-semibold text-sm uppercase',
            render: (item) => <span>{item.name}</span>,
        },
        {
            header: 'Kiasi (Amount)',
            className: 'font-extrabold text-sm whitespace-nowrap text-red-600',
            render: (item) => <span>{formatCurrency(item.amount)}</span>,
        },
        {
            header: 'Aliyesajili',
            className: 'font-bold text-gray-900 uppercase text-xs whitespace-nowrap',
            render: (item) => <span>{item.createdBy}</span>,
        },
    ];

    return (
        <AppLayout user={user} title="Expenses Management">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 font-sans">Usimamizi wa Matumizi (Expenses)</h2>
                    <p className="text-sm text-gray-500">
                        Rekodi na udhibiti matumizi yote ya ofisi kuu kwa urahisi.
                    </p>
                </div>
            </div>

            {canAddExpense && (
                <div className="mb-6">
                    <ExpenseForm />
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
                <ExpenseFilterForm
                    filters={filters}
                    onChange={handleFilterChange}
                />

                {/* Table Data */}
                <Table
                    data={expenses.data}
                    columns={columns}
                    emptyMessage="Hakuna matumizi yaliyopatikana kwa mwezi au utafutaji uliochaguliwa."
                />

                {/* Footer Totals */}
                <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4 border border-gray-200 select-none">
                    <span className="text-sm font-bold text-gray-700">JUMLA KUU YA ORODHA:</span>
                    <span className="text-base font-extrabold text-red-600 font-mono">
                        {formatCurrency(displayedTotal)}
                    </span>
                </div>
            </div>
        </AppLayout>
    );
}
