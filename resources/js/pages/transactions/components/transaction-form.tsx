import { useForm } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '@/utils';
import { AccountSuggestion, Network } from '@/types';
import FormInput from '@/components/forms/form-input';
import FormNumber from '@/components/forms/form-number-input';
import { FormReactSelect } from '@/components/forms/form-react-select';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface Props {
    networks: Network[];
    cashBalance: number;
}

export interface SelectOption {
    label: string | number;
    value: any;
}

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
    const [suggestions, setSuggestions] = useState<AccountSuggestion[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searching, setSearching] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
    const [selected, setSelected] = useState<SelectOption | null>(null);

    // Dynamic split-amount controls
    const [transactionType, setTransactionType] = useState<'KUWEKA' | 'KUTOA' | 'FLOAT' | ''>('');
    const [displayAmount, setDisplayAmount] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);

    const amountInputRef = useRef<HTMLInputElement>(null);
    const isSuggestionSelected = useRef(false);

    // Sync selected network balance display
    useEffect(() => {
        if (data.networkId) {
            const net = networks.find((n) => n.id === Number(data.networkId));
            setSelectedNetwork(net || null);
        } else {
            setSelectedNetwork(null);
        }
    }, [data.networkId, networks]);

    // Handle account suggestions autocomplete query
    useEffect(() => {
        if (isSuggestionSelected.current) {
            isSuggestionSelected.current = false;
            return;
        }

        if (searchQuery.length < 2) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                setSearching(true);
                const res = await fetch(`/accounts/search?q=${searchQuery}`);
                if (res.ok) {
                    const results = await res.json();
                    setSuggestions(results);
                    setShowDropdown(true);
                }
            } catch (err) {
                console.error('Error fetching suggestions:', err);
            } finally {
                setSearching(false);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 200);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

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
        isSuggestionSelected.current = true;
        setData((prev) => ({
            ...prev,
            accountNumber: suggestion.number,
            accountName: suggestion.name,
            customer: suggestion.name,
            networkId: String(suggestion.networkId),
        }));
        setSearchQuery(suggestion.number);
        setShowDropdown(false);

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

    const handleFinalSubmit = () => {
        setConfirmOpen(false);
        post('/transactions', {
            onSuccess: () => {
                reset();
                setDisplayAmount('');
                setSearchQuery('');
                clearErrors();
                setTransactionType('');
            },
        });
    };

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-gray-200/85 p-5 shadow-xs mb-6"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-3 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider select-none">
                        Sajili Muamala Mpya
                    </h3>

                    {/* Real-time cash & select float balances */}
                    <div className="flex flex-wrap items-center gap-3 select-none">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            CASH:{" "}
                            <span className="font-bold text-gray-900">
                                {formatCurrency(cashBalance)}
                            </span>
                        </div>
                        {selectedNetwork && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                FLOAT ({selectedNetwork.name}):{" "}
                                <span className="font-bold">
                                    {formatCurrency(selectedNetwork.balance)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Search Account / Number Input */}
                    <div className="relative w-full">
                        <div className="relative">
                            <FormInput
                                id="accountNumber"
                                label='Nambari ya Account'
                                type="text"
                                placeholder="E.g., 07XXXXXXXX au akaunti"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setData("accountNumber", e.target.value);
                                }}
                                disabled={processing}
                                autoComplete="off"
                                error={errors.accountNumber}
                            />
                            {searching && (
                                <span className="absolute right-3 top-9 flex h-4 w-4">
                                    <svg
                                        className="animate-spin h-4 w-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                </span>
                            )}
                        </div>

                        {/* Autocomplete Dropdown suggestions list */}
                        {showDropdown && suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                                {suggestions.map((s, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectSuggestion(s)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0 cursor-pointer"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-900">
                                                {s.name}
                                            </span>
                                            <span className="text-xs text-gray-500 font-mono">
                                                {s.number}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                                            {s.networkName}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {errors.accountNumber && (
                            <p className="mt-1.5 text-xs font-semibold text-red-600">
                                {errors.accountNumber}
                            </p>
                        )}
                    </div>

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
                    <div className="w-full">
                        <label className="block uppercase text-xs font-bold text-gray-600 mb-1 select-none">
                            Aina ya Muamala
                        </label>
                        <Select
                            value={transactionType}
                            onValueChange={(val: 'KUWEKA' | 'KUTOA' | 'FLOAT') => setTransactionType(val)}
                            disabled={processing}
                        >
                            <SelectTrigger className="w-full h-9.5 rounded-sm border border-input hover:border-input-hover px-3 bg-transparent text-sm transition-colors focus:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/90">
                                <SelectValue placeholder="Chagua aina" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="KUWEKA">KUWEKA (DEPOSIT)</SelectItem>
                                <SelectItem value="KUTOA">KUTOA (WITHDRAWAL)</SelectItem>
                                <SelectItem value="FLOAT">FLOAT PURCHASE</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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
                        onClick={() => {
                            reset();
                            setDisplayAmount('');
                            setSearchQuery("");
                            clearErrors();
                            setTransactionType('');
                        }}
                        disabled={processing}
                    >
                        Futa Zote (Clear)
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                    >
                        <SaveIcon />
                        Hifadhi Muamala
                    </Button>
                </div>
            </form>

            {/* Custom Premium AlertDialog Confirmation Dialogue */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
                            Thibitisha Maelezo ya Muamala
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 pt-2 space-y-3 ">
                            <p className="text-xs text-gray-500 font-semibold tracking-wider">
                                Hakikisha taarifa zote zifuatazo ni sahihi kabla ya kusajili muamala:
                            </p>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/80 text-sm space-y-2.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-semibold">Aina ya Muamala:</span>
                                    <span className={`font-bold px-2.5 py-0.5 rounded-md text-[11px] uppercase tracking-wider ${
                                        transactionType === 'KUWEKA' 
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                                            : transactionType === 'KUTOA'
                                            ? 'bg-rose-50 text-rose-700 border border-rose-200/50'
                                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                                    }`}>
                                        {transactionType === 'KUWEKA' && 'KUWEKA (DEPOSIT)'}
                                        {transactionType === 'KUTOA' && 'KUTOA (WITHDRAWAL)'}
                                        {transactionType === 'FLOAT' && 'FLOAT PURCHASE'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-t border-gray-100 pt-2.5">
                                    <span className="text-gray-500 font-semibold">Nambari ya Akaunti:</span>
                                    <span className="font-bold text-gray-900">{data.accountNumber}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-semibold">Jina la Akaunti:</span>
                                    <span className="font-bold text-gray-900">{data.accountName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-semibold">Mtandao (Network):</span>
                                    <span className="font-bold text-gray-900">{selectedNetwork?.name.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-gray-100">
                                    <span className="text-gray-500 font-semibold">Kiasi (Amount):</span>
                                    <span className="font-extrabold text-base text-gray-900">
                                        {formatCurrency(Number(displayAmount || 0))}
                                    </span>
                                </div>
                                {Number(data.fee) > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-semibold">Ada ya Huduma (Fee):</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(Number(data.fee))}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center border-t border-gray-100">
                                    <span className="text-gray-500 font-semibold">Aliyefanya Muamala:</span>
                                    <span className="font-bold text-gray-900">{data.customer || data.accountName}</span>
                                </div>
                            </div>
                            <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100/50 p-2.5 rounded-lg">
                                {transactionType === 'KUWEKA' 
                                    ? '* Hakikisha umepokea kiasi cha float kutoka kwa mteja kabla ya kuthibitisha.'
                                    : '* Hakikisha umetoa kiasi cha fedha taslimu kwa mteja kabla ya kuthibitisha.'
                                }
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel>Ghairi (Cancel)</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFinalSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs">
                            Thibitisha (Confirm)
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function SaveIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
    );
}
