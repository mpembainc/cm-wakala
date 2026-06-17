import AppLayout from '../../layouts/AppLayout';
import Table, { Column } from '../../components/Table';
import { Card } from '../../components/ui/card';
import { router } from '@inertiajs/react';
import Currency from '../../components/currency';
import { useMemo } from 'react';

interface ProfitMonthData {
    month_number: number;
    month: string;
    commission: number;
    expenses: number;
    profit: number;
}

interface Props {
    reportData: ProfitMonthData[];
    selectedYear: string;
    user: { name: string; permissions: string[] };
}

export default function Profit({ reportData, selectedYear, user }: Props) {
    
    const totals = useMemo(() => {
        let totalCommission = 0;
        let totalExpenses = 0;
        let totalProfit = 0;

        reportData.forEach(row => {
            totalCommission += row.commission;
            totalExpenses += row.expenses;
            totalProfit += row.profit;
        });

        return {
            commission: totalCommission,
            expenses: totalExpenses,
            profit: totalProfit,
        };
    }, [reportData]);

    const columns: Column<ProfitMonthData>[] = [
        {
            header: 'Mwezi',
            className: 'font-semibold text-gray-900',
            render: (row) => <span>{row.month}</span>
        },
        {
            header: 'Commission (TZS)',
            className: 'text-right',
            render: (row) => <Currency value={row.commission} />
        },
        {
            header: 'Gharama (TZS)',
            className: 'text-right',
            render: (row) => <Currency value={row.expenses} />
        },
        {
            header: 'Faida/Hasara (TZS)',
            className: 'text-right font-bold',
            render: (row) => {
                const isProfit = row.profit >= 0;
                return (
                    <div className="flex items-center justify-end gap-2">
                        <span className={`w-2 h-2 rounded-full ${isProfit ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className={isProfit ? 'text-emerald-700' : 'text-rose-700'}>
                            <Currency value={row.profit} />
                        </span>
                    </div>
                );
            }
        }
    ];

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(window.location.pathname, { year: e.target.value }, { preserveState: true });
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <AppLayout user={user} title="Profit & Loss Report">
            <div className="space-y-6">
                <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Faida na Hasara</h2>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">Ripoti ya faida na hasara kwa mwezi</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Chagua Mwaka:</label>
                        <select
                            value={selectedYear}
                            onChange={handleYearChange}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </Card>

                <Card className="p-6">
                    <Table 
                        data={reportData} 
                        columns={columns} 
                        emptyMessage="Hakuna taarifa za faida na hasara kwa mwaka huu."
                    />

                    {reportData.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100 text-sm font-bold text-gray-700">
                            <div className="flex justify-between items-center">
                                <span>JUMLA YA COMMISSION</span>
                                <span className="text-gray-950"><Currency value={totals.commission} /></span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>JUMLA YA GHARAMA</span>
                                <span className="text-gray-950"><Currency value={totals.expenses} /></span>
                            </div>
                            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center text-base">
                                <span>JUMLA YA FAIDA/HASARA</span>
                                <span className={totals.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                                    <Currency value={totals.profit} />
                                </span>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
