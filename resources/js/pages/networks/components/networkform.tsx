import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { Network } from '@/types';
import FormInput from '@/components/forms/form-input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

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
        <form onSubmit={handleSubmit} className="bg-white rounded-md border border-gray-200/80 p-5 shadow-xs transition-all">
            <div className="flex flex-col md:flex-row items-end gap-4">
                <FormInput
                    id="name"
                    label="Jina la Mtandao au Bank"
                    placeholder="E.g., M-PESA, HALOPESA, NMB, CRDB"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    disabled={processing}
                    required
                    containerClassName="flex-1 w-full"
                    className="w-full bg-gray-50/20 text-gray-800"
                />
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto mb-0.5">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="flex-1 md:flex-none justify-center font-bold flex items-center gap-2 select-none cursor-pointer"
                    >
                        <Save className="w-4 h-4 shrink-0" />
                        {selectedNetwork ? 'Hifadhi' : 'Sajili'}
                    </Button>
                    {selectedNetwork && (
                        <Button
                            type="button"
                            onClick={onCancel}
                            disabled={processing}
                            variant="destructive"
                            className="flex-1 md:flex-none justify-center font-bold flex items-center gap-1.5 select-none cursor-pointer"
                        >
                            Ghairi
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}
