import React from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import FormInput from '../../../components/forms/form-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';

interface Role {
    id: number;
    name: string;
}

interface Props {
    roles: Role[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UserFormModal({ roles, open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        username: '',
        email: '',
        role: '',
        password: '',
        isAdmin: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/users', {
            onSuccess: () => {
                reset();
                clearErrors();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Sajili Mtumiaji Mpya (Add New User)</DialogTitle>
                        <DialogDescription>
                            Jaza fomu hii kwa uangalifu ili kuunda akaunti ya mfanyakazi au meneja.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        <div className="space-y-1">
                            <Label className="uppercase text-xs font-bold text-gray-600">Jukumu (Role)</Label>
                            <Select
                                value={data.role}
                                onValueChange={(val) => setData('role', val)}
                            >
                                <SelectTrigger className="h-9 w-full bg-white rounded-lg border border-input hover:border-input-hover">
                                    <SelectValue placeholder="Chagua Jukumu" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            {role.name.toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                            )}
                        </div>

                        <FormInput
                            label="Nenosiri (Password)"
                            type="password"
                            placeholder="Nenosiri"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                        />

                        <div className="flex items-center gap-2 pt-6 pl-1 select-none">
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
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                        >
                            {processing ? 'Inasajili...' : 'Sajili'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
