import AppLayout from '@/layouts/AppLayout';
import { formatCurrency } from '@/utils';
import React, { useState, useMemo } from 'react';
import NetworkForm from './components/networkform';
import { router } from '@inertiajs/react';
import { Network } from '@/types';
import DataTable from '@/components/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Search } from 'lucide-react';

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

    const columns = useMemo<ColumnDef<Network>[]>(
        () => [
            {
                header: 'Na.',
                id: 'index',
                cell: ({ row }: { row: any }) => <span className="text-gray-400 font-semibold select-none">#{row.index + 1}</span>,
            },
            {
                header: 'Jina la Mtandao / Bank',
                accessorKey: 'name',
                cell: ({ row }: { row: any }) => <span className="font-bold text-gray-900 uppercase tracking-wide">{row.original.name}</span>,
            },
            {
                header: 'Salio la Float',
                accessorKey: 'balance',
                cell: ({ row }: { row: any }) => <span className="font-bold text-emerald-600 text-sm whitespace-nowrap">{formatCurrency(row.original.balance)}</span>,
            },
            ...(canUpdateNetwork || canDeleteNetwork
                ? [
                      {
                          header: 'Vitendo',
                          id: 'actions',
                          cell: ({ row }: { row: any }) => {
                              const network = row.original;
                              return (
                                  <div className="flex gap-2">
                                      {canUpdateNetwork && (
                                          <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => setSelectedNetwork(network)}>
                                              <Edit />
                                              Hariri
                                          </Button>
                                      )}
                                      {canDeleteNetwork && (
                                          <Button
                                              variant="destructive"
                                              size="sm"
                                              onClick={() => handleDelete(network.id, network.name)} >
                                              <Trash2/>
                                              Futa
                                          </Button>
                                      )}
                                  </div>
                              );
                          },
                      },
                  ]
                : []),
        ],
        [canUpdateNetwork, canDeleteNetwork],
    );

    return (
        <AppLayout user={user} title="Mitandao na Banks">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Usimamizi wa Mitandao na Banks</h2>
                <p className="text-sm text-gray-500">Sajili au hariri salio na taarifa za mitandao au benki zinazotumika kwenye mfumo.</p>
            </div>

            {canAddNetwork && (
                <div className="mb-4">
                    <NetworkForm
                        selectedNetwork={selectedNetwork}
                        onCancel={() => setSelectedNetwork(null)}
                    />
                </div>
            )}

            <div className="bg-white rounded-md border border-gray-200/80 p-5 shadow-xs space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Tafuta mtandao..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9.5 w-full text-sm font-semibold bg-gray-50/20 rounded-md border border-input hover:border-input-hover"
                    />
                </div>

                {/* Networks Table */}
                <DataTable
                    data={filteredNetworks}
                    columns={columns}
                />
            </div>
        </AppLayout>
    );
}
