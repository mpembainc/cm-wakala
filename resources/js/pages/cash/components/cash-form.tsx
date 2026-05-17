import { useForm } from '@inertiajs/react';
import React from 'react';

interface Props {
    onSuccess?: () => void;
}

export default function CashForm({ onSuccess }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/cash', {
            onSuccess: () => {
                reset();
                if (onSuccess) onSuccess();
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/85 p-5 shadow-xs transition-all mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 select-none">
                Sajili Muamala wa Cash (Kuingiza / Kutoa)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="w-full">
                    <label htmlFor="amount" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">
                        Kiasi (TZS)
                    </label>
                    <input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="E.g., 50000"
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-gray-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                            errors.amount ? 'border-red-300 bg-red-50/50 text-red-900' : 'border-gray-200 focus:border-gray-900 bg-gray-50/20'
                        }`}
                        disabled={processing}
                        required
                    />
                    {errors.amount && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.amount}</p>}
                </div>
                <div className="w-full md:col-span-2 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label htmlFor="description" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">
                            Maelezo / Remark
                        </label>
                        <input
                            id="description"
                            type="text"
                            placeholder="E.g., Mtaji wa Kuanzia au Matumizi ya Ofisi"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-gray-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                                errors.description ? 'border-red-300 bg-red-50/50 text-red-900' : 'border-gray-200 focus:border-gray-900 bg-gray-50/20'
                            }`}
                            disabled={processing}
                            required
                        />
                        {errors.description && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.description}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full md:w-auto px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 select-none cursor-pointer h-[42px]"
                    >
                        <SaveIcon className="w-4 h-4 shrink-0" />
                        Hifadhi
                    </button>
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
