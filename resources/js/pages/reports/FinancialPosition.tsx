import AppLayout from '../../layouts/AppLayout';
import Table, { Column } from '../../components/Table';
import { Card } from '../../components/ui/card';
import { router } from '@inertiajs/react';
import Currency from '../../components/currency';
import dayjs from 'dayjs';

interface DailyFinancialPosition {
    date: string;
    float: number;
    cash: number;
    total: number;
    diff: number;
    percentage: number;
}

interface Props {
    reportData: DailyFinancialPosition[];
    selectedMonth: string;
    user: { name: string; permissions: string[] };
}

export default function FinancialPosition({ reportData, selectedMonth, user }: Props) {
    
    const formatDateOnly = (dateStr: string) => {
        return dayjs(dateStr).format('DD-MM-YYYY');
    };

    const columns: Column<DailyFinancialPosition>[] = [
        {
            header: 'Tarehe',
            className: 'font-semibold text-gray-900',
            render: (row) => <span>{formatDateOnly(row.date)}</span>
        },
        {
            header: 'Float',
            className: 'text-right',
            render: (row) => <Currency value={row.float} />
        },
        {
            header: 'Cash',
            className: 'text-right',
            render: (row) => <Currency value={row.cash} />
        },
        {
            header: 'Jumla (Total)',
            className: 'text-right font-bold text-gray-900',
            render: (row) => <Currency value={row.total} />
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

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(window.location.pathname, { month: e.target.value }, { preserveState: true });
    };

    return (
        <AppLayout user={user} title="Financial Position">
            <div className="space-y-6">
                <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Hali ya Kifedha</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Ripoti ya mabadiliko ya float na cash kila siku</p>
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
                        emptyMessage="Hakuna taarifa za hali ya kifedha kwa mwezi huu."
                    />
                </Card>
            </div>
        </AppLayout>
    );
}
