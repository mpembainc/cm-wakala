import AppLayout from '@/layouts/AppLayout';
import Table, { Column } from '@/components/Table';
import { formatCurrency, formatNumber } from '@/utils';
import { router } from '@inertiajs/react';
import ExpenseForm from './components/expense-form';
import ExpenseFilterForm from './components/expense-filter-form';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/table/data-table';

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

    const columns = useMemo<ColumnDef<Expense>[]>(() => [
        {
            accessorKey: 'id',
            header: 'Ref No.',
        },
        {
            accessorKey: 'expenseDate',
            header: 'Tarehe ya Matumizi',
        },
        {
            accessorKey: 'name',
            header: 'Maelezo ya Matumizi',
        },
        {
            header: 'Kiasi (TZS)',
            accessorFn: (row) => formatNumber(Number(row.amount)),
        },
        {
            accessorKey: 'createdBy',
            header: 'Aliyesajili',
        },
    ], []);

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

            <div className="bg-white rounded-lg border border-gray-200/80 p-5 shadow-xs space-y-2">
                <div className='flex justify-between items-center'>
                    <ExpenseFilterForm
                        filters={filters}
                        onChange={handleFilterChange}
                    />
                    <div className='flex justify-end items-center gap-1'>
                        <span className='text-sm font-bold text-gray-700'>JUMLA KUU:</span>
                        <span className='text-lg font-bold text-gray-800'>
                            {formatCurrency(displayedTotal)}
                        </span>
                    </div>
                </div>

                {/* Table Data */}
                <DataTable
                    columns={columns}
                    data={expenses.data}
                />

                {/* Footer Totals */}
                {/* <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4 border border-gray-200 select-none">
                    <span className="text-sm font-bold text-gray-700">JUMLA KUU YA ORODHA:</span>
                    <span className="text-base font-extrabold text-red-600 font-mono">
                        {formatCurrency(displayedTotal)}
                    </span>
                </div> */}
            </div>
        </AppLayout>
    );
}
