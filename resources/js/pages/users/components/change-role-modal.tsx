import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string | null;
    createdAt?: string;
}

interface Role {
    id: number;
    name: string;
}

interface Props {
    user: User | null;
    roles: Role[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ChangeRoleModal({ user, roles, open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        user: '',
        role: '',
    });

    // Populate data when user changes
    useEffect(() => {
        if (user) {
            const userRole = roles.find(r => r.name === user.role);
            setData({
                user: String(user.id),
                role: userRole ? String(userRole.id) : '',
            });
        }
    }, [user, roles]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        post('/users/assign-role', {
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
                        <DialogTitle>Badili Jukumu la Mtumiaji (Change User Role)</DialogTitle>
                        <DialogDescription>
                            Chagua jukumu jipya la kazi kwa ajili ya <strong>{user?.name.toUpperCase()}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3.5">
                        <div className="space-y-1">
                            <Label className="uppercase text-xs font-bold text-gray-600">Jukumu Jipya (New Role)</Label>
                            <Select
                                value={data.role}
                                onValueChange={(val) => setData('role', val)}
                            >
                                <SelectTrigger className="h-9.5 w-full bg-white rounded-lg border border-input hover:border-input-hover">
                                    <SelectValue placeholder="Chagua Jukumu" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={String(role.id)}>
                                            {role.name.toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                            )}
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
                            {processing ? 'Inabadilisha...' : 'Badili'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
