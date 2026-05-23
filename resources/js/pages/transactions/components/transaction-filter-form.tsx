import React from 'react';

interface Network {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface Props {
    filters: {
        startDate: string;
        endDate: string;
        networkId: string | number;
        userId: string | number;
        search: string;
    };
    networks: Network[];
    users: User[];
    canListUsers: boolean;
    onChange: (filters: {
        startDate: string;
        endDate: string;
        networkId: string | number;
        userId: string | number;
        search: string;
    }) => void;
}

export default function TransactionFilterForm({ filters, networks, users, canListUsers, onChange }: Props) {
    const handleFilterChange = (key: string, value: any) => {
        onChange({
            ...filters,
            [key]: value,
        });
    };

    return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-end bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-4">
            {/* Search Input */}
            <div className="w-full sm:w-52">
                <label htmlFor="search" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 select-none">
                    Tafuta Muamala
                </label>
                <input
                    id="search"
                    type="text"
                    placeholder="Jina, Namba, Kiasi..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-input hover:border-input-hover text-xs font-semibold text-gray-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                />
            </div>

            {/* Network Filter */}
            <div className="w-full sm:w-44">
                <label htmlFor="networkId" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 select-none">
                    Chuja kwa Mtandao
                </label>
                <select
                    id="networkId"
                    value={filters.networkId}
                    onChange={(e) => handleFilterChange('networkId', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-input hover:border-input-hover text-xs font-semibold text-gray-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                >
                    <option value="">Mitandao yote</option>
                    {networks.map((n) => (
                        <option key={n.id} value={n.id}>
                            {n.name.toUpperCase()}
                        </option>
                    ))}
                </select>
            </div>

            {/* Start Date */}
            <div className="w-full sm:w-40">
                <label htmlFor="startDate" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 select-none">
                    Kuanzia
                </label>
                <input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-input hover:border-input-hover text-xs font-semibold text-gray-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                />
            </div>

            {/* End Date */}
            <div className="w-full sm:w-40">
                <label htmlFor="endDate" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 select-none">
                    Mpaka
                </label>
                <input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-input hover:border-input-hover text-xs font-semibold text-gray-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                />
            </div>

            {/* User Select */}
            {canListUsers && users.length > 0 && (
                <div className="w-full sm:w-48">
                    <label htmlFor="userId" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 select-none">
                        Operator
                    </label>
                    <select
                        id="userId"
                        value={filters.userId}
                        onChange={(e) => handleFilterChange('userId', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-input hover:border-input-hover text-xs font-semibold text-gray-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                    >
                        <option value="">Wote</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <button
                type="button"
                onClick={() => onChange({ startDate: '', endDate: '', networkId: '', userId: '', search: '' })}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors select-none cursor-pointer h-[38px] flex items-center justify-center gap-1 bg-white"
            >
                Safi (Reset)
            </button>
        </div>
    );
}
