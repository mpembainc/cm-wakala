import React, { useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import FormInput from '@/components/forms/form-input';
import FormNumber from '@/components/forms/form-number-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatNumber } from '@/utils';
import FormSelect from '@/components/forms/form-select';
import { SaveIcon } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/table/data-table';
import BalanceBanner from '@/components/ui/balance-banner';

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

    const columns = useMemo<ColumnDef<Commission>[]>(() => [
        {
            accessorKey: 'id',
            header: 'Ref No.',
        },
        {
            accessorKey: 'network',
            header: 'Mtandao / Benki',
        },
        {
            header: 'Kiasi (TZS)',
            accessorFn: (row) => formatNumber(Number(row.amount)),
        },
        {
            accessorKey: 'remark',
            header: 'Maelezo',
        },
        {
            header: 'Tarehe',
            accessorFn: (row) => new Date(row.createdAt).toLocaleDateString('sw-TZ', { dateStyle: 'medium' }),
        },
        {
            accessorKey: 'createdBy',
            header: 'Aliyesajili',
        },
    ], []);

    return (
        <AppLayout user={user} title="Commissions Management">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 font-sans">
                        Usimamizi wa Commission
                    </h2>
                    <p className="text-sm text-gray-500">
                        Sajili na ufuatilie malipo ya kamisheni kutoka mitandao
                        na benki zote.
                    </p>
                </div>

                <BalanceBanner label="Commission ya mwezi huu" balance={balance} />
            </div>

            {/* Form to add commission */}
            {canAddCommission && (
                <div className="mb-6">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-md border border-gray-200/80 p-5 shadow-xs"
                    >
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider font-sans select-none border-b border-gray-100 pb-2">
                            Sajili Commission Mpya
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="md:col-span-3">
                                <FormSelect
                                    label="Chagua Mtandao / Benki"
                                    options={networks.map((n) => ({
                                        value: n.id,
                                        label: n.name,
                                    }))}
                                    value={data.networkId}
                                    onValueChange={(val) =>
                                        setData("networkId", val)
                                    }
                                    error={errors.networkId}
                                />
                            </div>

                            <div className="md:col-span-3">
                                <FormNumber
                                    label="Kiasi cha Kamisheni"
                                    placeholder="Ingiza Kiasi"
                                    value={data.amount}
                                    onChange={(val) =>
                                        setData(
                                            "amount",
                                            val ? String(val) : "",
                                        )
                                    }
                                    error={errors.amount}
                                />
                            </div>

                            <div className="md:col-span-3">
                                <FormInput
                                    label="Maelezo (Remark)"
                                    placeholder="Mfano: Kamisheni ya M-Pesa"
                                    value={data.remark}
                                    onChange={(e) =>
                                        setData("remark", e.target.value)
                                    }
                                    error={errors.remark}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Button
                                    type="submit"
                                    className="rounded-lg"
                                    disabled={processing}
                                >
                                    <SaveIcon />
                                    {processing ? "Inahifadhi..." : "Hifadhi"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* List and search block */}
            <div className="bg-white rounded-lg border border-gray-200/80 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="w-full sm:max-w-xs">
                        <FormInput
                            type="month"
                            value={getMonthInputValue(filters.month)}
                            onChange={(e) => handleMonthChange(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table Data */}
                <DataTable columns={columns} data={commissions.data} />
            </div>
        </AppLayout>
    );
}
