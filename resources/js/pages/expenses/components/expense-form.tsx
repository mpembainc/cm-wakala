import React from 'react';
import { useForm } from '@inertiajs/react';
import FormInput from '../../../components/forms/form-input';
import FormNumber from '../../../components/forms/form-number-input';
import { Button } from '../../../components/ui/button';

export default function ExpenseForm() {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/expenses', {
            onSuccess: () => {
                reset('amount', 'name');
                clearErrors();
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider font-sans select-none border-b border-gray-100 pb-2">
                Sajili Matumizi Mpya (Add Expense)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-3">
                    <FormNumber
                        label="Kiasi (Amount)"
                        placeholder="Ingiza Kiasi"
                        value={data.amount}
                        onChange={(val) => setData('amount', val ? String(val) : '')}
                        error={errors.amount}
                    />
                </div>
                
                <div className="md:col-span-3">
                    <FormInput
                        label="Tarehe (Date)"
                        type="date"
                        value={data.expenseDate}
                        onChange={(e) => setData('expenseDate', e.target.value)}
                        error={errors.expenseDate}
                    />
                </div>
                
                <div className="md:col-span-4">
                    <FormInput
                        label="Maelezo ya Matumizi (Description)"
                        placeholder="Mfano: Umeme, Kodi, n.k."
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
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
    );
}
