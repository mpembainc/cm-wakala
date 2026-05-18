import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import FormInput from '../../../components/forms/form-input';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string | null;
    createdAt?: string;
}

interface Props {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UpdateUserModal({ user, open, onOpenChange }: Props) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        username: '',
        email: '',
        isAdmin: false,
    });

    // Populate data when user changes
    useEffect(() => {
        if (user) {
            setData({
                name: user.name,
                username: user.username,
                email: user.email || '',
                isAdmin: user.role === 'admin',
            });
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        put(`/users/${user.id}`, {
            onSuccess: () => {
                reset();
                clearErrors();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Hariri Mtumiaji (Update User Details)</DialogTitle>
                        <DialogDescription>
                            Sasisha taarifa za mtumiaji aliyechaguliwa kwa usahihi.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3.5">
                        <FormInput
                            label="Jina Kamili (Full Name)"
                            placeholder="Jina Kamili"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                        />

                        <FormInput
                            label="Jina la Kuingilia (Username)"
                            placeholder="Username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            error={errors.username}
                        />

                        <FormInput
                            label="Barua Pepe (Email)"
                            type="email"
                            placeholder="Email Address"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                        />

                        <div className="flex items-center gap-2 pt-2 pl-1 select-none">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.isAdmin}
                                    onChange={(e) => setData('isAdmin', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded-sm focus:ring-blue-500"
                                />
                                <span className="text-xs font-bold text-gray-600 uppercase">Msimamizi Mkuu (Is Admin)</span>
                            </label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="font-semibold cursor-pointer"
                        >
                            Ghairi
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                        >
                            {processing ? 'Inahifadhi...' : 'Hifadhi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
