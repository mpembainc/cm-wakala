import AppLayout from '../../layouts/AppLayout';
import Table, { Column } from '../../components/Table';
import { Card } from '../../components/ui/card';
import { router } from '@inertiajs/react';
import Currency from '../../components/currency';
import { useMemo } from 'react';

interface NetworkCommissionData {
    network: string;
    amount: number;
}

interface Props {
    reportData: NetworkCommissionData[];
    selectedMonth: string;
    user: { name: string; permissions: string[] };
}

export default function NetworkCommissions({ reportData, selectedMonth, user }: Props) {
    
    const totalCommissions = useMemo(() => {
        return reportData.reduce((acc, curr) => acc + (parseFloat(curr.amount as any) || 0), 0);
    }, [reportData]);

    const columns: Column<NetworkCommissionData>[] = [
        {
            header: 'Na.',
            className: 'w-16 text-center text-gray-400 font-semibold select-none',
            render: (_, index) => <span className="text-gray-400 font-semibold">#{index + 1}</span>,
        },
        {
            header: 'Mtandao / Benki',
            className: 'font-semibold text-gray-900 uppercase',
            render: (row) => <span>{row.network}</span>
        },
        {
            header: 'Kiasi cha Commission',
            className: 'text-right font-medium text-gray-600',
            render: (row) => <Currency value={row.amount} />
        }
    ];

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(window.location.pathname, { month: e.target.value }, { preserveState: true });
    };

    return (
        <AppLayout user={user} title="Network Commissions Report">
            <div className="space-y-6">
                <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Commission kwa Mtandao</h2>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">Ripoti ya commission kwa kila mtandao au benki</p>
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
                        emptyMessage="Hakuna taarifa za commission kwa mwezi huu."
                    />

                    {reportData.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-100">
                            <span className="text-sm font-bold text-gray-700">JUMLA KUU</span>
                            <span className="text-base font-extrabold text-blue-600">
                                <Currency value={totalCommissions} />
                            </span>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
