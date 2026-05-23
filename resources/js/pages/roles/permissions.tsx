import React, { useState, useMemo } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui/button';
import { ShieldCheck, Search, ArrowLeft, CheckSquare } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
}

interface Props {
    role: Role;
    assigned: Permission[];
    unassigned: Permission[];
    user: { name: string; permissions: string[] };
}

export default function RolePermissions({ role, assigned, unassigned, user }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const allPermissions = useMemo(() => {
        const list = [...assigned, ...unassigned];
        return list.sort((a, b) => a.name.localeCompare(b.name));
    }, [assigned, unassigned]);

    const originalIds = useMemo(() => assigned.map((p) => p.id), [assigned]);

    const { data, setData, post, processing } = useForm({
        role: role.id,
        permissions: originalIds,
    });

    const handleToggle = (id: number) => {
        const isChecked = data.permissions.includes(id);
        if (isChecked) {
            setData('permissions', data.permissions.filter((pId) => pId !== id));
        } else {
            setData('permissions', [...data.permissions, id]);
        }
    };

    const filteredPermissions = useMemo(() => {
        if (!searchQuery.trim()) return allPermissions;
        const norm = searchQuery.toLowerCase().replace(/\s+/g, '_');
        return allPermissions.filter((p) => p.name.toLowerCase().includes(norm));
    }, [allPermissions, searchQuery]);

    const allFilteredIds = useMemo(() => filteredPermissions.map((p) => p.id), [filteredPermissions]);
    const isAllFilteredSelected = useMemo(() => {
        if (allFilteredIds.length === 0) return false;
        return allFilteredIds.every((id) => data.permissions.includes(id));
    }, [allFilteredIds, data.permissions]);

    const handleSelectAllFiltered = () => {
        if (isAllFilteredSelected) {
            setData('permissions', data.permissions.filter((id) => !allFilteredIds.includes(id)));
        } else {
            const union = Array.from(new Set([...data.permissions, ...allFilteredIds]));
            setData('permissions', union);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/roles/assign-permissions');
    };

    const hasChanges = useMemo(() => {
        if (data.permissions.length !== originalIds.length) return true;
        const sortedData = [...data.permissions].sort();
        const sortedOrig = [...originalIds].sort();
        return JSON.stringify(sortedData) !== JSON.stringify(sortedOrig);
    }, [data.permissions, originalIds]);

    return (
        <AppLayout user={user} title={`Assign Permissions to ${role.name.toUpperCase()}`}>
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link
                            href="/roles"
                            className="inline-flex items-center justify-center w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <h2 className="text-xl font-bold text-gray-900 font-sans uppercase">
                            RUHUSA ZA {role.name.toUpperCase()}
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500 ml-9">
                        Chagua na uhifadhi ruhusa zilizoruhusiwa kufikiwa na watumiaji wa jukumu hili.
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-2.5 flex flex-col items-end shadow-xs shrink-0 select-none">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider font-sans">RUHUSA ZILIZOCHAGULIWA</span>
                    <span className="text-base font-extrabold text-blue-700 font-mono">
                        {data.permissions.length} / {allPermissions.length}
                    </span>
                </div>
            </div>

            {/* Main Action Block */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-5">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    {/* Search filter input */}
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 select-none pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Tafuta Ruhusa (Search)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-input hover:border-input-hover rounded-xl focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                        />
                    </div>

                    {/* Check All Toggle & Save Button */}
                    <div className="flex items-center gap-3 justify-end shrink-0">
                        {filteredPermissions.length > 0 && (
                            <button
                                type="button"
                                onClick={handleSelectAllFiltered}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors duration-150 cursor-pointer"
                            >
                                <CheckSquare className="w-4 h-4 text-gray-500" />
                                {isAllFilteredSelected ? 'Ondoa Zote' : 'Chagua Zote Zilizochujwa'}
                            </button>
                        )}

                        <Button
                            type="submit"
                            disabled={!hasChanges || processing}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors duration-150 cursor-pointer shrink-0"
                        >
                            {processing ? 'Inahifadhi...' : 'Hifadhi Ruhusa'}
                        </Button>
                    </div>
                </div>

                {/* Grid List */}
                {filteredPermissions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 py-2">
                        {filteredPermissions.map((permission) => {
                            const id = permission.id;
                            const isChecked = data.permissions.includes(id);
                            const wasOriginally = originalIds.includes(id);

                            let badgeLabel = '';
                            let badgeClass = '';

                            if (isChecked && !wasOriginally) {
                                badgeLabel = 'NEW';
                                badgeClass = 'bg-emerald-50 text-emerald-600 border border-emerald-200';
                            } else if (!isChecked && wasOriginally) {
                                badgeLabel = 'REM';
                                badgeClass = 'bg-amber-50 text-amber-600 border border-amber-200';
                            }

                            return (
                                <div
                                    key={id}
                                    onClick={() => handleToggle(id)}
                                    className={`
                                        flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none
                                        ${isChecked
                                            ? 'bg-blue-50/40 border-blue-200 hover:bg-blue-50/60'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`
                                                w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150
                                                ${isChecked
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'border-gray-300 bg-white'
                                                }
                                            `}
                                        >
                                            {isChecked && <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />}
                                        </div>

                                        <span className={`text-xs font-bold uppercase tracking-wide transition-colors ${isChecked ? 'text-blue-900' : 'text-gray-700'}`}>
                                            {permission.name.split('_').join(' ')}
                                        </span>
                                    </div>

                                    {badgeLabel && (
                                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${badgeClass}`}>
                                            {badgeLabel}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl select-none">
                        <p className="text-sm font-semibold text-gray-500">
                            Hakuna ruhusa iliyotambuliwa kwa jina: <strong className="text-gray-700">"{searchQuery}"</strong>
                        </p>
                    </div>
                )}
            </form>
        </AppLayout>
    );
}
