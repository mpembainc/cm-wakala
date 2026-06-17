import AppLayout from '../../layouts/AppLayout';
import Table, { Column } from '../../components/Table';
import { Card } from '../../components/ui/card';
import { router } from '@inertiajs/react';
import Currency from '../../components/currency';
import { useMemo } from 'react';
import dayjs from 'dayjs';

interface DepositWithdrawalData {
    date: string | number;
    deposit: number;
    withdrawal: number;
}

interface Props {
    reportData: DepositWithdrawalData[];
    selectedMonth: string;
    selectedYear: string;
    filterType: 'daily' | 'monthly';
    user: { name: string; permissions: string[] };
}

export default function DepositWithdrawal({ reportData, selectedMonth, selectedYear, filterType, user }: Props) {
    
    const totals = useMemo(() => {
        let totalDeposit = 0;
        let totalWithdrawal = 0;

        reportData.forEach(row => {
            totalDeposit += (parseFloat(row.deposit as any) || 0);
            totalWithdrawal += (parseFloat(row.withdrawal as any) || 0);
        });

        return {
            deposit: totalDeposit,
            withdrawal: totalWithdrawal
        };
    }, [reportData]);

    const formatLabel = (dateVal: string | number) => {
        if (filterType === 'monthly') {
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const mIndex = parseInt(dateVal as string) - 1;
            return months[mIndex] || dateVal;
        }
        return dayjs(dateVal as string).format('DD-MM-YYYY');
    };

    const columns: Column<DepositWithdrawalData>[] = [
        {
            header: filterType === 'daily' ? 'Tarehe' : 'Mwezi',
            className: 'font-semibold text-gray-900',
            render: (row) => <span>{formatLabel(row.date)}</span>
        },
        {
            header: 'Ya Kutoa (Withdrawal - TZS)',
            className: 'text-right font-medium text-rose-600',
            render: (row) => <Currency value={row.withdrawal} />
        },
        {
            header: 'Ya Kuweka (Deposit - TZS)',
            className: 'text-right font-medium text-emerald-600',
            render: (row) => <Currency value={row.deposit} />
        }
    ];

    const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(window.location.pathname, { 
            type: e.target.value,
            month: selectedMonth,
            year: selectedYear
        }, { preserveState: true });
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(window.location.pathname, { 
            type: filterType,
            month: e.target.value,
            year: selectedYear
        }, { preserveState: true });
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(window.location.pathname, { 
            type: filterType,
            month: selectedMonth,
            year: e.target.value
        }, { preserveState: true });
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <AppLayout user={user} title="Deposit & Withdrawal Summary">
            <div className="space-y-6">
                <Card className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Kuweka na Kutoa</h2>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">Ripoti ya jumla ya kiasi cha miamala ya kuweka na kutoa</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Aina:</label>
                            <select
                                value={filterType}
                                onChange={handleFilterTypeChange}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="daily">Kila Siku (Daily)</option>
                                <option value="monthly">Kila Mwezi (Monthly)</option>
                            </select>
                        </div>

                        {filterType === 'daily' ? (
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Chagua Mwezi:</label>
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={handleMonthChange}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                        ) : (
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
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <Table 
                        data={reportData} 
                        columns={columns} 
                        emptyMessage="Hakuna taarifa za miamala."
                    />

                    {reportData.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100 text-sm font-bold text-gray-700">
                            <div className="flex justify-between items-center text-rose-700">
                                <span>JUMLA YA KUTOA (WITHDRAWAL)</span>
                                <span><Currency value={totals.withdrawal} /></span>
                            </div>
                            <div className="flex justify-between items-center text-emerald-700">
                                <span>JUMLA YA KUWEKA (DEPOSIT)</span>
                                <span><Currency value={totals.deposit} /></span>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
