import AppLayout from '../../layouts/AppLayout';
import Table, { Column } from '../../components/Table';
import { Card } from '../../components/ui/card';
import { router } from '@inertiajs/react';
import { useMemo } from 'react';

interface NetworkTransactionData {
    network: string;
    deposit: number;
    withdrawal: number;
    total: number;
}

interface Props {
    reportData: NetworkTransactionData[];
    selectedMonth: string;
    user: { name: string; permissions: string[] };
}

export default function NetworkTransactions({ reportData, selectedMonth, user }: Props) {
    
    const totals = useMemo(() => {
        let totalDeposit = 0;
        let totalWithdrawal = 0;
        let totalAll = 0;

        reportData.forEach(row => {
            totalDeposit += row.deposit;
            totalWithdrawal += row.withdrawal;
            totalAll += row.total;
        });

        return {
            deposit: totalDeposit,
            withdrawal: totalWithdrawal,
            total: totalAll
        };
    }, [reportData]);

    const columns: Column<NetworkTransactionData>[] = [
        {
            header: 'Mtandao / Benki',
            className: 'font-semibold text-gray-900 uppercase',
            render: (row) => <span>{row.network}</span>
        },
        {
            header: 'Ya Kuweka (Deposit)',
            className: 'text-right font-medium text-gray-600',
            render: (row) => <span>{row.deposit}</span>
        },
        {
            header: 'Ya Kutoa (Withdrawal)',
            className: 'text-right font-medium text-gray-600',
            render: (row) => <span>{row.withdrawal}</span>
        },
        {
            header: 'Jumla (Total)',
            className: 'text-right font-bold text-gray-900',
            render: (row) => <span>{row.total}</span>
        }
    ];

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(window.location.pathname, { month: e.target.value }, { preserveState: true });
    };

    return (
        <AppLayout user={user} title="Network Transactions Report">
            <div className="space-y-6">
                <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Miamala kwa Mtandao</h2>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">Ripoti ya idadi ya miamala kwa kila mtandao</p>
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
                        emptyMessage="Hakuna taarifa za miamala kwa mwezi huu."
                    />

                    {reportData.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100 text-sm font-bold text-gray-700">
                            <div className="flex justify-between items-center">
                                <span>JUMLA YA KUWEKA</span>
                                <span className="text-gray-950">{totals.deposit}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>JUMLA YA KUTOA</span>
                                <span className="text-gray-950">{totals.withdrawal}</span>
                            </div>
                            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center text-base">
                                <span>JUMLA KUU YA MIAMALA</span>
                                <span className="text-blue-600">{totals.total}</span>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
