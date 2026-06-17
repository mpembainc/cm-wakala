import AppLayout from '../../layouts/AppLayout';
import Table, { Column } from '../../components/Table';
import { Card } from '../../components/ui/card';
import { useMemo } from 'react';
import { router } from '@inertiajs/react';

interface UserTransactionCount {
    userId: number;
    username: string;
    total: number;
}

interface Props {
    reportData: UserTransactionCount[];
    selectedMonth: string;
    user: { name: string; permissions: string[] };
}

export default function UserTransactions({ reportData, selectedMonth, user }: Props) {
    const totalTransactions = useMemo(() => {
        return reportData.reduce((acc, curr) => acc + curr.total, 0);
    }, [reportData]);

    const columns: Column<UserTransactionCount>[] = [
        {
            header: 'Mtumiaji (User)',
            className: 'font-semibold text-gray-900',
            render: (row) => <span>{row.username.toUpperCase()}</span>
        },
        {
            header: 'Jumla ya Miamala',
            className: 'text-right font-medium text-gray-600',
            render: (row) => <span>{row.total}</span>
        }
    ];

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(window.location.pathname, { month: e.target.value }, { preserveState: true });
    };

    return (
        <AppLayout user={user} title="Miamala kwa Mtumiaji">
            <div className="space-y-6">
                <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Ripoti ya Miamala</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Jumla ya miamala waliyofanya watumiaji kwa mwezi husika</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Chagua Mwezi:</label>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                </Card>

                <Card className="p-6">
                    <Table 
                        data={reportData} 
                        columns={columns} 
                        emptyMessage="Hakuna data ya miamala kwa mwezi huu."
                    />
                    
                    {reportData.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-100">
                            <span className="text-sm font-bold text-gray-700">JUMLA KUU</span>
                            <span className="text-base font-extrabold text-blue-600">{totalTransactions}</span>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
