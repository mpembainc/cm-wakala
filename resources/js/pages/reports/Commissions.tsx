import AppLayout from '../../layouts/AppLayout';
import Table, { Column } from '../../components/Table';
import { Card } from '../../components/ui/card';
import { router } from '@inertiajs/react';
import Currency from '../../components/currency';
import { useMemo } from 'react';

interface CommissionMonthData {
    month_number: number;
    month: string;
    amount: number;
    diff: number;
    percentage: number;
}

interface Props {
    reportData: CommissionMonthData[];
    selectedYear: string;
    user: { name: string; permissions: string[] };
}

export default function Commissions({ reportData, selectedYear, user }: Props) {
    
    const totalCommissions = useMemo(() => {
        return reportData.reduce((acc, curr) => acc + curr.amount, 0);
    }, [reportData]);

    const columns: Column<CommissionMonthData>[] = [
        {
            header: 'Mwezi',
            className: 'font-semibold text-gray-900',
            render: (row) => <span>{row.month}</span>
        },
        {
            header: 'Kiasi',
            className: 'text-right',
            render: (row) => <Currency value={row.amount} />
        },
        {
            header: 'Tofauti (Diff)',
            className: 'text-right',
            render: (row) => {
                const isPositive = row.diff > 0;
                const isZero = row.diff === 0;
                return (
                    <div className="flex items-center justify-end gap-1.5">
                        <Currency value={row.diff} />
                        {!isZero && (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                                isPositive 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {Math.abs(row.percentage)}%
                                <i className={`ml-1 fa fa-caret-${isPositive ? 'up' : 'down'}`}></i>
                            </span>
                        )}
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
        <AppLayout user={user} title="Commissions Report">
            <div className="space-y-6">
                <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Commission Jumla</h2>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">Ripoti ya mabadiliko ya commission kwa kila mwezi</p>
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
                        emptyMessage="Hakuna taarifa za commission kwa mwaka huu."
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
