import AppLayout from '../../layouts/AppLayout';
import Table, { Column } from '../../components/Table';
import { formatCurrency } from '../../utils';
import React, { useState, useMemo } from 'react';
import NetworkForm from './components/networkform';
import { router } from '@inertiajs/react';

interface Network {
    id: number;
    name: string;
    balance: number;
    createdAt?: string;
}

interface Props {
    networks: Network[];
    user: { name: string; permissions: string[] };
}

export default function Networks({ networks, user }: Props) {
    const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const canAddNetwork = user.permissions.includes('add_network');
    const canUpdateNetwork = user.permissions.includes('update_network');
    const canDeleteNetwork = user.permissions.includes('delete_network');

    const filteredNetworks = useMemo(() => {
        if (!searchQuery.trim()) return networks;
        return networks.filter((n) =>
            n.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [networks, searchQuery]);

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Je, una uhakika unataka kufuta mtandao wa "${name}"?`)) {
            router.delete(`/networks/${id}`);
        }
    };

    const columns: Column<Network>[] = [
        {
            header: 'Na.',
            className: 'w-16 text-center text-gray-400 font-semibold select-none',
            render: (_, index) => <span className="text-gray-400 font-semibold">#{index + 1}</span>,
        },
        {
            header: 'Jina la Mtandao / Bank',
            className: 'font-bold text-gray-900',
            render: (network) => <span className="uppercase tracking-wide">{network.name}</span>,
        },
        {
            header: 'Salio la Float',
            className: 'font-bold text-emerald-600 text-sm whitespace-nowrap',
            render: (network) => <span>{formatCurrency(network.balance)}</span>,
        },
        ...(canUpdateNetwork || canDeleteNetwork
            ? [
                  {
                      header: 'Vitendo',
                      className: 'w-48 text-right select-none',
                      render: (network: Network) => (
                          <div className="flex justify-end gap-2">
                              {canUpdateNetwork && (
                                  <button
                                      onClick={() => setSelectedNetwork(network)}
                                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200/80 text-gray-700 transition-colors select-none cursor-pointer"
                                  >
                                      <EditIcon className="w-3.5 h-3.5 shrink-0" />
                                      Hariri
                                  </button>
                              )}
                              {canDeleteNetwork && (
                                  <button
                                      onClick={() => handleDelete(network.id, network.name)}
                                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 transition-colors select-none cursor-pointer"
                                  >
                                      <TrashIcon className="w-3.5 h-3.5 shrink-0" />
                                      Futa
                                  </button>
                              )}
                          </div>
                      ),
                  },
              ]
            : []),
    ];

    return (
        <AppLayout user={user} title="Mitandao na Banks">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Usimamizi wa Mitandao na Banks</h2>
                <p className="text-sm text-gray-500">Sajili au hariri salio na taarifa za mitandao au benki zinazotumika kwenye mfumo.</p>
            </div>

            {canAddNetwork && (
                <div className="mb-6">
                    <NetworkForm
                        selectedNetwork={selectedNetwork}
                        onCancel={() => setSelectedNetwork(null)}
                    />
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <SearchIcon className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tafuta mtandao..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors bg-gray-50/20"
                    />
                </div>

                {/* Networks Table */}
                <Table
                    data={filteredNetworks}
                    columns={columns}
                    emptyMessage="Hakuna mitandao iliyosajiliwa inayolingana na utafutaji wako."
                />
            </div>
        </AppLayout>
    );
}

function EditIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    );
}

function TrashIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );
}

function SearchIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );
}
