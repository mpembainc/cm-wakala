import AppLayout from '@/layouts/AppLayout';
import { formatNumber } from '@/utils';
import React, { useState, useMemo } from 'react';
import NetworkForm from './components/networkform';
import { router } from '@inertiajs/react';
import { Network } from '@/types';
import DataTable from '@/components/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Search } from 'lucide-react';
import BalanceBanner from '@/components/ui/balance-banner';

interface Props {
    networks: Network[];
    user: { name: string; permissions: string[] };
}

export default function Networks({ networks, user }: Props) {
    const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const totalFloat = useMemo(() => networks.reduce((sum, n) => sum + Number(n.balance), 0), [networks]);

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
                accessorFn: (_, index) => index + 1
            },
            {
                header: 'Jina la Mtandao / Bank',
                accessorKey: 'name',
            },
            {
                header: 'Salio la Float',
                accessorFn: (row) => formatNumber(row.balance)
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Usimamizi wa Mitandao na Banks</h2>
                    <p className="text-sm text-gray-500">Sajili au hariri salio na taarifa za mitandao au benki zinazotumika kwenye mfumo.</p>
                </div>
                <BalanceBanner label="Jumla ya Float (Mitandao)" balance={totalFloat} variant="indigo" />
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
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Tafuta mtandao..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
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
