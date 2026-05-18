import React from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import FormInput from '../../components/forms/form-input';
import FormNumber from '../../components/forms/form-number-input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import Table, { Column } from '../../components/Table';
import { formatCurrency } from '../../utils';

interface Commission {
    id: number;
    network: string;
    amount: number;
    remark: string;
    createdAt: string;
    createdBy: string;
}

interface Network {
    id: number;
    name: string;
}

interface Props {
    commissions: { data: Commission[] };
    networks: Network[];
    balance: number;
    filters: {
        month: string;
    };
    user: { name: string; permissions: string[] };
}

export default function CommissionsIndex({ commissions, networks, balance, filters, user }: Props) {
    const canAddCommission = user.permissions.includes('add_commission');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        networkId: '',
        amount: '',
        remark: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/commissions', {
            onSuccess: () => {
                reset();
                clearErrors();
            },
        });
    };

    const getMonthInputValue = (mY: string) => {
        if (!mY) return '';
        const parts = mY.split('-');
        if (parts.length !== 2) return '';
        const month = parts[0].padStart(2, '0');
        const year = parts[1];
        return `${year}-${month}`;
    };

    const handleMonthChange = (val: string) => {
        if (!val) return;
        const parts = val.split('-');
        if (parts.length !== 2) return;
        const year = parts[0];
        const month = parseInt(parts[1], 10).toString();
        router.get('/commissions', { month: `${month}-${year}` }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const columns: Column<Commission>[] = [
        {
            header: 'Ref No.',
            className: 'w-20 text-center text-gray-400 font-semibold select-none',
            render: (item) => <span className="text-gray-400 font-semibold">#{item.id}</span>,
        },
        {
            header: 'Mtandao / Benki',
            className: 'text-gray-900 font-bold uppercase text-xs whitespace-nowrap',
            render: (item) => <span>{item.network}</span>,
        },
        {
            header: 'Kiasi (Amount)',
            className: 'font-extrabold text-sm text-emerald-600 whitespace-nowrap',
            render: (item) => <span>{formatCurrency(item.amount)}</span>,
        },
        {
            header: 'Maelezo',
            className: 'text-gray-600 font-semibold text-sm uppercase',
            render: (item) => <span>{item.remark || 'N/A'}</span>,
        },
        {
            header: 'Tarehe',
            className: 'text-gray-600 font-semibold text-xs whitespace-nowrap',
            render: (item) => <span>{new Date(item.createdAt).toLocaleDateString('sw-TZ', { dateStyle: 'medium' })}</span>,
        },
        {
            header: 'Aliyesajili',
            className: 'font-bold text-gray-900 uppercase text-xs whitespace-nowrap',
            render: (item) => <span>{item.createdBy}</span>,
        },
    ];

    return (
        <AppLayout user={user} title="Commissions Management">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 font-sans">Usimamizi wa Tume (Commissions)</h2>
                    <p className="text-sm text-gray-500">
                        Sajili na ufuatilie malipo ya kamisheni kutoka mitandao na benki zote.
                    </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 flex flex-col items-end shadow-xs shrink-0 select-none">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider font-sans">TUME YA MWEZI HAU</span>
                    <span className="text-xl font-extrabold text-emerald-700 font-mono">{formatCurrency(balance)}</span>
                </div>
            </div>

            {/* Form to add commission */}
            {canAddCommission && (
                <div className="mb-6">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider font-sans select-none border-b border-gray-100 pb-2">
                            Sajili Tume Mpya (Add Commission)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="md:col-span-4 space-y-1.5">
                                <Label className="uppercase text-xs font-bold text-gray-600">Mtandao au Bank</Label>
                                <Select
                                    value={data.networkId}
                                    onValueChange={(val) => setData('networkId', val)}
                                >
                                    <SelectTrigger className="h-9.5 w-full bg-white rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                                        <SelectValue placeholder="Chagua Mtandao" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {networks.map((net) => (
                                            <SelectItem key={net.id} value={String(net.id)}>
                                                {net.name.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.networkId && <p className="text-xs text-red-500 font-semibold">{errors.networkId}</p>}
                            </div>

                            <div className="md:col-span-3">
                                <FormNumber
                                    label="Kiasi cha Kamisheni"
                                    placeholder="Ingiza Kiasi"
                                    value={data.amount}
                                    onChange={(val) => setData('amount', val ? String(val) : '')}
                                    error={errors.amount}
                                />
                            </div>

                            <div className="md:col-span-3">
                                <FormInput
                                    label="Maelezo (Remark)"
                                    placeholder="Mfano: Kamisheni ya M-Pesa"
                                    value={data.remark}
                                    onChange={(e) => setData('remark', e.target.value)}
                                    error={errors.remark}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-9.5 rounded-lg transition-colors cursor-pointer"
                                >
                                    {processing ? 'Inahifadhi...' : 'Hifadhi'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* List and search block */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                        <FormInput
                            label="Chagua Mwezi"
                            type="month"
                            value={getMonthInputValue(filters.month)}
                            onChange={(e) => handleMonthChange(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table Data */}
                <Table
                    data={commissions.data}
                    columns={columns}
                    emptyMessage="Hakuna kamisheni zilizopatikana kwa mwezi uliochaguliwa."
                />

                {/* Footer Totals */}
                <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4 border border-gray-200 select-none">
                    <span className="text-sm font-bold text-gray-700">JUMLA KUU YA MWEZI HUU:</span>
                    <span className="text-base font-extrabold text-emerald-600 font-mono">
                        {formatCurrency(balance)}
                    </span>
                </div>
            </div>
        </AppLayout>
    );
}
