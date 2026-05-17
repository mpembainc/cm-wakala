import { useForm } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../../../utils';

interface Network {
    id: number;
    name: string;
    balance: number;
}

interface Props {
    networks: Network[];
    cashBalance: number;
}

interface AccountSuggestion {
    number: string;
    name: string;
    networkId: number;
    networkName: string;
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

    // Handle account suggestions autocomplete query
    useEffect(() => {
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

    const handleSelectSuggestion = (suggestion: AccountSuggestion) => {
        setData((prev) => ({
            ...prev,
            accountNumber: suggestion.number,
            accountName: suggestion.name,
            customer: suggestion.name,
            networkId: String(suggestion.networkId),
        }));
        setSearchQuery(suggestion.number);
        setShowDropdown(false);

        // Autofocus amount
        setTimeout(() => {
            amountInputRef.current?.focus();
        }, 50);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const amountNum = Number(data.amount);
        // if (amountNum <= 0) {
        //     alert('Kiasi cha muamala lazima kiwe kikubwa kuliko 0.');
        //     return;
        // }

        if (selectedNetwork && selectedNetwork.balance < amountNum) {
            alert(`Salio la float kwenye ${selectedNetwork.name} halitoshi! Salio lililopo: ${formatCurrency(selectedNetwork.balance)}`);
            return;
        }

        const msg = `Hakikisha umepokea kiasi cha ${formatCurrency(amountNum)} kutoka kwa mteja kabla ya kuendelea.\n\nJe, umepokea pesa hii?`;
        if (confirm(msg)) {
            post('/transactions', {
                onSuccess: () => {
                    reset();
                    setSearchQuery('');
                    clearErrors();
                },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/85 p-5 shadow-xs mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider select-none">
                    Sajili Muamala Mpya
                </h3>

                {/* Real-time cash & select float balances */}
                <div className="flex flex-wrap items-center gap-3 select-none">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        CASH: <span className="font-bold text-gray-900">{formatCurrency(cashBalance)}</span>
                    </div>
                    {selectedNetwork && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            FLOAT ({selectedNetwork.name}): <span className="font-bold">{formatCurrency(selectedNetwork.balance)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Search Account / Number Input */}
                <div className="relative w-full">
                    <label htmlFor="accountNumber" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">
                        Nambari ya Akaunti
                    </label>
                    <div className="relative">
                        <input
                            id="accountNumber"
                            type="text"
                            placeholder="E.g., 07XXXXXXXX au akaunti"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setData('accountNumber', e.target.value);
                            }}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                                errors.accountNumber ? 'border-red-300 bg-red-50/50 text-red-900' : 'border-gray-200 focus:border-gray-900 bg-gray-50/20'
                            }`}
                            disabled={processing}
                            autoComplete="off"
                            required
                        />
                        {searching && (
                            <span className="absolute right-3.5 top-3 text-xs text-gray-400 select-none">
                                <svg className="animate-spin h-4.5 w-4.5 text-gray-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
                                        <span className="text-xs font-bold text-gray-900">{s.name}</span>
                                        <span className="text-xs text-gray-500 font-mono">{s.number}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                                        {s.networkName}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                    {errors.accountNumber && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.accountNumber}</p>}
                </div>

                {/* Network Selection */}
                <div className="w-full">
                    <label htmlFor="networkId" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">
                        Mtandao / Bank
                    </label>
                    <select
                        id="networkId"
                        value={data.networkId}
                        onChange={(e) => setData('networkId', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white ${
                            errors.networkId ? 'border-red-300 bg-red-50/50 text-red-900' : 'border-gray-200 focus:border-gray-900 bg-gray-50/20'
                        }`}
                        disabled={processing}
                        required
                    >
                        <option value="">Chagua Mtandao...</option>
                        {networks.map((n) => (
                            <option key={n.id} value={n.id}>
                                {n.name.toUpperCase()} (Float: {formatCurrency(n.balance)})
                            </option>
                        ))}
                    </select>
                    {errors.networkId && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.networkId}</p>}
                </div>

                {/* Account Name */}
                <div className="w-full">
                    <label htmlFor="accountName" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">
                        Jina la Akaunti
                    </label>
                    <input
                        id="accountName"
                        type="text"
                        placeholder="Jina la Mteja kwenye akaunti"
                        value={data.accountName}
                        onChange={(e) => setData('accountName', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                            errors.accountName ? 'border-red-300 bg-red-50/50 text-red-900' : 'border-gray-200 focus:border-gray-900 bg-gray-50/20'
                        }`}
                        disabled={processing}
                        required
                    />
                    {errors.accountName && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.accountName}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                {/* Amount */}
                <div className="w-full">
                    <label htmlFor="amount" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">
                        Kiasi (Amount)
                    </label>
                    <input
                        id="amount"
                        type="number"
                        placeholder="Ingiza Kiasi"
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        ref={amountInputRef}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                            errors.amount ? 'border-red-300 bg-red-50/50 text-red-900' : 'border-gray-200 focus:border-gray-900 bg-gray-50/20'
                        }`}
                        disabled={processing}
                        required
                    />
                    {errors.amount && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.amount}</p>}
                </div>

                {/* Fee */}
                <div className="w-full">
                    <label htmlFor="fee" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">
                        Ada
                    </label>
                    <input
                        id="fee"
                        type="number"
                        placeholder="Ada ya Muamala"
                        value={data.fee}
                        onChange={(e) => setData('fee', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                            errors.fee ? 'border-red-300 bg-red-50/50 text-red-900' : 'border-gray-200 focus:border-gray-900 bg-gray-50/20'
                        }`}
                        disabled={processing}
                    />
                    {errors.fee && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.fee}</p>}
                </div>

                {/* Commission */}
                <div className="w-full">
                    <label htmlFor="commission" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">
                        Mrejea (Commission)
                    </label>
                    <input
                        id="commission"
                        type="number"
                        placeholder="Mrejea uliopatikana"
                        value={data.commission}
                        onChange={(e) => setData('commission', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                            errors.commission ? 'border-red-300 bg-red-50/50 text-red-900' : 'border-gray-200 focus:border-gray-900 bg-gray-50/20'
                        }`}
                        disabled={processing}
                    />
                    {errors.commission && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.commission}</p>}
                </div>

                {/* Customer */}
                <div className="w-full">
                    <label htmlFor="customer" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">
                        Muamala Umefanywa na
                    </label>
                    <input
                        id="customer"
                        type="text"
                        placeholder="Jina la aliyekuja ofisini"
                        value={data.customer}
                        onChange={(e) => setData('customer', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                            errors.customer ? 'border-red-300 bg-red-50/50 text-red-900' : 'border-gray-200 focus:border-gray-900 bg-gray-50/20'
                        }`}
                        disabled={processing}
                    />
                    {errors.customer && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.customer}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => {
                        reset();
                        setSearchQuery('');
                        clearErrors();
                    }}
                    disabled={processing}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors select-none cursor-pointer disabled:opacity-50"
                >
                    Futa Zote (Clear)
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center gap-2 select-none cursor-pointer disabled:opacity-50"
                >
                    <SaveIcon className="w-4 h-4 shrink-0" />
                    Hifadhi Muamala
                </button>
            </div>
        </form>
    );
}

function SaveIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
    );
}
