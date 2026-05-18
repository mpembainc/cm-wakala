import { useForm } from '@inertiajs/react';
import React from 'react';
import FormInput from '@/components/forms/form-input';

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
        <form onSubmit={handleSubmit} className="bg-white rounded-md border border-gray-200/85 p-5 shadow-xs transition-all mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 select-none">
                Sajili Muamala wa Cash (Kuingiza / Kutoa)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormInput
                    id="amount"
                    label="Kiasi (TZS)"
                    type="number"
                    step="0.01"
                    placeholder="E.g., 50000"
                    value={data.amount}
                    onChange={(e) => setData('amount', e.target.value)}
                    error={errors.amount}
                    disabled={processing}
                    required
                    containerClassName="w-full"
                />
                <div className="w-full md:col-span-2 flex flex-col md:flex-row gap-4 items-end">
                    <FormInput
                        id="description"
                        label="Maelezo / Remark"
                        type="text"
                        placeholder="E.g., Mtaji wa Kuanzia au Matumizi ya Ofisi"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        error={errors.description}
                        disabled={processing}
                        required
                        containerClassName="flex-1 w-full"
                    />
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
