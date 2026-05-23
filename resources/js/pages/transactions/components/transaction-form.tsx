import { useForm } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '@/utils';
import { AccountSuggestion, Network } from '@/types';
import FormInput from '@/components/forms/form-input';
import FormNumber from '@/components/forms/form-number-input';
import { FormReactSelect } from '@/components/forms/form-react-select';
import FormSelect from '@/components/forms/form-select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import TransactionConfirmModal from './transaction-confirm-modal';
import AccountAutocomplete from './account-autocomplete';
import CashBalanceBadge from './cash-balance-badge';
import FloatBalanceBadge from './float-balance-badge';
import { Save } from 'lucide-react';

export interface Props {
    networks: Network[];
    cashBalance: number;
}

export interface SelectOption {
    label: string | number;
    value: any;
}

const TRANSACTION_TYPE_OPTIONS: SelectOption[] = [
    { label: 'KUWEKA (DEPOSIT)', value: 'KUWEKA' },
    { label: 'KUTOA (WITHDRAWAL)', value: 'KUTOA' },
    { label: 'FLOAT PURCHASE', value: 'FLOAT' },
];

export default function TransactionForm({ networks, cashBalance }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        networkId: '',
        accountNumber: '',
        accountName: '',
        amount: '',
        fee: '',
        commission: '',
        customer: '',
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
    const [selected, setSelected] = useState<SelectOption | null>(null);

    // Dynamic split-amount controls
    const [transactionType, setTransactionType] = useState<'KUWEKA' | 'KUTOA' | 'FLOAT' | ''>('');
    const [displayAmount, setDisplayAmount] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);

    const amountInputRef = useRef<HTMLInputElement>(null);

    // Sync selected network balance display
    useEffect(() => {
        if (data.networkId) {
            const net = networks.find((n) => n.id === Number(data.networkId));
            setSelectedNetwork(net || null);
        } else {
            setSelectedNetwork(null);
        }
    }, [data.networkId, networks]);

    // Synchronize display amount & transaction type to negative/positive signed value for backend
    useEffect(() => {
        const num = Number(displayAmount);
        if (!isNaN(num) && num > 0 && transactionType) {
            // KUWEKA -> Negative under the hood (controller turns it positive)
            // KUTOA & FLOAT -> Positive under the hood (controller turns it negative)
            const signed = transactionType === 'KUWEKA' ? -num : num;
            setData('amount', String(signed));
        } else {
            setData('amount', '');
        }
    }, [displayAmount, transactionType]);

    const handleSelectSuggestion = (suggestion: AccountSuggestion) => {
        setData((prev) => ({
            ...prev,
            accountNumber: suggestion.number,
            accountName: suggestion.name,
            customer: suggestion.name,
            networkId: String(suggestion.networkId),
        }));
        setSearchQuery(suggestion.number);

        // Autofill and sync the selected network option
        const net = networks.find((n) => n.id === suggestion.networkId);
        if (net) {
            setSelected({
                value: net.id,
                label: `${net.name.toUpperCase()} (Float: ${formatCurrency(net.balance)})`,
            });
        }

        // Autofocus amount
        setTimeout(() => {
            amountInputRef.current?.focus();
        }, 50);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!transactionType) {
            alert("Tafadhali chagua aina ya muamala kabla ya kuendelea.");
            return;
        }

        if (!data.accountNumber || !data.networkId || !data.accountName || !displayAmount) {
            alert("Tafadhali jaza taarifa zote za muamala kabla ya kuendelea.");
            return;
        }

        const amountNum = Number(displayAmount);
        if (isNaN(amountNum) || amountNum <= 0) {
            alert("Kiasi lazima kiwe kikubwa kuliko 0.");
            return;
        }

        // Float validation: Only KUTOA and FLOAT can deplete selected network float balance
        if (transactionType !== 'KUWEKA' && selectedNetwork && selectedNetwork.balance < amountNum) {
            alert(`Salio la float kwenye ${selectedNetwork.name} halitoshi! Salio lililopo: ${formatCurrency(selectedNetwork.balance)}`);
            return;
        }

        // Trigger confirmation modal
        setConfirmOpen(true);
    };

    const handleClear = () => {
        reset();
        setDisplayAmount('');
        setSearchQuery('');
        clearErrors();
        setTransactionType('');
    };

    const handleFinalSubmit = () => {
        setConfirmOpen(false);
        post('/transactions', {
            onSuccess: handleClear,
        });
    };

    return (
        <>
            <Card
                as="form"
                onSubmit={handleSubmit}
                className="mb-6"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-3 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider select-none">
                        Sajili Muamala Mpya
                    </h3>

                    {/* Real-time cash & select float balances */}
                    <div className="flex flex-wrap items-center gap-3 select-none">
                        <CashBalanceBadge balance={cashBalance} />
                        {selectedNetwork && (
                            <FloatBalanceBadge
                                networkName={selectedNetwork.name}
                                balance={selectedNetwork.balance}
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Search Account / Number Input */}
                    <AccountAutocomplete
                        value={searchQuery}
                        onChange={(val) => {
                            setSearchQuery(val);
                            setData("accountNumber", val);
                        }}
                        onSelectSuggestion={handleSelectSuggestion}
                        disabled={processing}
                        error={errors.accountNumber}
                    />

                    {/* Network Selection */}
                    <div className="w-full">
                        <FormReactSelect
                            value={selected}
                            onChange={(op) => {
                                console.log("Selected network ID:", op);
                                setData("networkId", op?.value);
                                setSelected(op);
                            }}
                            label='Chagua Mtandao (Network)'
                            options={networks.map((n) => ({
                                value: n.id,
                                label: `${n.name.toUpperCase()} (Float: ${formatCurrency(n.balance)})`,
                            }))}
                        />
                    </div>

                    {/* Account Name */}
                    <div className="w-full">
                        <FormInput
                            label='Jina la Akaunti'
                            placeholder="Jina la Mteja kwenye akaunti"
                            value={data.accountName}
                            onChange={(e) => setData("accountName", e.target.value)}
                            error={errors.accountName}
                            disabled={processing}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                    {/* Transaction Type */}
                    <FormSelect
                        label="Aina ya Muamala"
                        placeholder="aina"
                        value={transactionType}
                        onValueChange={(val) => setTransactionType(val as 'KUWEKA' | 'KUTOA' | 'FLOAT')}
                        disabled={processing}
                        options={TRANSACTION_TYPE_OPTIONS}
                        containerClassname="w-full"
                    />

                    {/* Amount */}
                    <FormNumber
                        label="Kiasi (Amount)"
                        placeholder="Ingiza Kiasi"
                        value={displayAmount}
                        onChange={(value) => setDisplayAmount(value?.toString() || "")}
                        disabled={processing}
                        getInputRef={amountInputRef}
                    />

                    {/* Fee */}
                    <FormNumber
                        placeholder="Ada ya Muamala"
                        value={data.fee}
                        onChange={(value) => setData("fee", value?.toString() || "")}
                        label='Ada (Fee)'
                        disabled={processing}
                        error={errors.fee}
                    />

                    {/* Customer */}
                    <FormInput
                        label='Aliyefanya Muamala'
                        placeholder="Jina la aliyekuja ofisini"
                        value={data.customer}
                        onChange={(e) => setData("customer", e.target.value)}
                        disabled={processing}
                        error={errors.customer}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <Button
                        type="button"
                        variant='destructive'
                        onClick={handleClear}
                        disabled={processing}
                    >
                        Futa Zote (Clear)
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                    >
                        <Save />
                        Hifadhi Muamala
                    </Button>
                </div>
            </Card>

            {/* Custom Premium AlertDialog Confirmation Dialogue */}
            <TransactionConfirmModal
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                data={data}
                transactionType={transactionType}
                displayAmount={displayAmount}
                networkName={selectedNetwork?.name}
                onConfirm={handleFinalSubmit}
            />
        </>
    );
}