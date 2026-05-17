import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';

interface Network {
    id: number;
    name: string;
    balance: number;
}

interface Props {
    selectedNetwork: Network | null;
    onCancel: () => void;
}

export default function NetworkForm({ selectedNetwork, onCancel }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
    });

    useEffect(() => {
        if (selectedNetwork) {
            setData('name', selectedNetwork.name);
        } else {
            setData('name', '');
        }
        clearErrors();
    }, [selectedNetwork]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedNetwork) {
            put(`/networks/${selectedNetwork.id}`, {
                onSuccess: () => {
                    reset();
                    onCancel();
                },
            });
        } else {
            post('/networks', {
                onSuccess: () => {
                    reset();
                    onCancel();
                },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs transition-all">
            <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                    <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">
                        Jina la Mtandao au Bank
                    </label>
                    <input
                        id="name"
                        type="text"
                        placeholder="E.g., M-PESA, HALOPESA, NMB, CRDB"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-gray-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                            errors.name ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-900 bg-gray-50/20'
                        }`}
                        disabled={processing}
                        required
                    />
                    {errors.name && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.name}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 md:flex-none justify-center px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 select-none cursor-pointer"
                    >
                        <SaveIcon className="w-4 h-4 shrink-0" />
                        {selectedNetwork ? 'Hifadhi' : 'Sajili'}
                    </button>
                    {selectedNetwork && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={processing}
                            className="flex-1 md:flex-none justify-center px-4 py-2.5 rounded-xl text-sm font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 disabled:opacity-50 select-none cursor-pointer"
                        >
                            Ghairi
                        </button>
                    )}
                </div>
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
