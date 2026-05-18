import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import FormInput from '../../components/forms/form-input';
import { Button } from '../../components/ui/button';
import Table, { Column } from '../../components/Table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ShieldAlert, Plus, Edit2, ShieldCheck } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface Props {
    roles: Role[];
    user: { name: string; permissions: string[] };
}

export default function RolesIndex({ roles, user }: Props) {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const createForm = useForm({
        name: '',
    });

    const editForm = useForm({
        name: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/roles', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;
        editForm.put(`/roles/${selectedRole.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedRole(null);
                editForm.reset();
            },
        });
    };

    const openEditModal = (role: Role) => {
        setSelectedRole(role);
        editForm.setData('name', role.name);
        setIsEditOpen(true);
    };

    const columns: Column<Role>[] = [
        {
            header: 'ID',
            className: 'w-20 text-center text-gray-400 font-semibold select-none',
            render: (item) => <span className="text-gray-400 font-semibold">#{item.id}</span>,
        },
        {
            header: 'Jukumu (Role Name)',
            className: 'text-gray-900 font-bold uppercase text-xs whitespace-nowrap',
            render: (item) => <span>{item.name}</span>,
        },
        {
            header: 'Vitendo (Actions)',
            className: 'text-right whitespace-nowrap w-48',
            render: (item) => (
                <div className="flex justify-end gap-2">
                    <Link
                        href={`/roles/${item.id}/permissions`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-150 cursor-pointer"
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Ruhusa (Permissions)
                    </Link>
                    <button
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors duration-150 cursor-pointer"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        Badili
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout user={user} title="Role & Permissions Management">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 font-sans">Majukumu na Ruhusa (Roles)</h2>
                    <p className="text-sm text-gray-500">
                        Sanidi majukumu na ugawanye ruhusa za ufikiaji kwa watumiaji wa mfumo.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors duration-150 cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Sajili Jukumu Mpya
                </button>
            </div>

            {/* List block */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
                <Table
                    data={roles}
                    columns={columns}
                    emptyMessage="Hakuna majukumu yoyote yaliyosajiliwa bado."
                />
            </div>

            {/* Add Role Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <form onSubmit={handleCreateSubmit}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-blue-600" />
                                Sajili Jukumu Mpya (Add New Role)
                            </DialogTitle>
                            <DialogDescription>
                                Unda jukumu jipya katika mfumo ili kuweka mipaka ya kazi na kuruhusu ufikiaji.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <FormInput
                                label="Jina la Jukumu"
                                placeholder="Mfano: wakala, mhasibu"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                error={createForm.errors.name}
                                required
                            />
                        </div>

                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                            >
                                Ghairi
                            </button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors duration-150 cursor-pointer"
                            >
                                {createForm.processing ? 'Inahifadhi...' : 'Hifadhi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Role Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <form onSubmit={handleEditSubmit}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-amber-600" />
                                Badili Jina la Jukumu (Edit Role)
                            </DialogTitle>
                            <DialogDescription>
                                Hariri jina la jukumu lililochaguliwa katika mfumo.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <FormInput
                                label="Jina la Jukumu"
                                placeholder="Mfano: wakala, mhasibu"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                error={editForm.errors.name}
                                required
                            />
                        </div>

                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setIsEditOpen(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                            >
                                Ghairi
                            </button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors duration-150 cursor-pointer"
                            >
                                {editForm.processing ? 'Inahifadhi...' : 'Hifadhi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
