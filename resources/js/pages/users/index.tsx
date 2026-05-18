import AppLayout from '../../layouts/AppLayout';
import Table, { Column } from '../../components/Table';
import { formatDate } from '../../utils';
import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import UserFormModal from './components/user-form-modal';
import UpdateUserModal from './components/update-user-modal';
import ChangeRoleModal from './components/change-role-modal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Button } from '../../components/ui/button';
import { Settings2Icon, UserPlusIcon, Edit2Icon, ShieldAlertIcon, RotateCcwIcon, SearchIcon } from 'lucide-react';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string | null;
    createdAt: string;
}

interface Role {
    id: number;
    name: string;
}

interface Props {
    users: { data: User[] };
    roles: Role[];
    user: { name: string; permissions: string[] };
}

export default function UsersIndex({ users, roles, user }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);

    const canAddUser = user.permissions.includes('add_user');
    const canUpdateUser = user.permissions.includes('update_user');
    const canResetPassword = user.permissions.includes('reset_password');

    // Filter users locally by search query
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users.data;
        const query = searchQuery.toLowerCase();
        return users.data.filter(u => 
            u.name.toLowerCase().includes(query) || 
            u.username.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query)
        );
    }, [users.data, searchQuery]);

    const handleConfirmReset = () => {
        if (!selectedUser) return;
        setIsResetOpen(false);
        router.post('/users/reset-password', {
            user_id: selectedUser.id
        }, {
            onSuccess: () => {
                setSelectedUser(null);
            }
        });
    };

    const columns: Column<User>[] = [
        {
            header: 'Na.',
            className: 'w-16 text-center text-gray-400 font-semibold select-none',
            render: (_, index) => <span className="text-gray-400 font-semibold">#{index + 1}</span>,
        },
        {
            header: 'Jina Kamili',
            className: 'font-bold text-gray-900 text-sm whitespace-nowrap uppercase',
            render: (u) => <span>{u.name}</span>,
        },
        {
            header: 'Jukumu (Role)',
            className: 'whitespace-nowrap',
            render: (u) => {
                const role = u.role ? u.role.toLowerCase() : '';
                let badgeClass = 'bg-gray-100 text-gray-800 border-gray-200';
                
                if (role === 'admin') {
                    badgeClass = 'bg-red-50 text-red-700 border-red-200';
                } else if (role === 'manager') {
                    badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                } else if (role === 'user') {
                    badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                }

                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${badgeClass}`}>
                        {u.role || 'USER'}
                    </span>
                );
            }
        },
        {
            header: 'Username',
            className: 'font-mono text-xs font-bold text-gray-600',
            render: (u) => <span>{u.username}</span>,
        },
        {
            header: 'Barua Pepe (Email)',
            className: 'text-gray-600 text-sm whitespace-nowrap',
            render: (u) => <span>{u.email}</span>,
        },
        {
            header: 'Tarehe ya Usajili',
            className: 'text-gray-600 font-semibold text-xs whitespace-nowrap',
            render: (u) => <span>{formatDate(u.createdAt)}</span>,
        },
        ...(canUpdateUser || canResetPassword
            ? [
                  {
                      header: 'Vitendo',
                      className: 'w-24 text-right select-none',
                      render: (u: User) => (
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                                      <Settings2Icon className="h-4 w-4 text-gray-500" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white">
                                  {canUpdateUser && (
                                      <>
                                          <DropdownMenuItem
                                              onClick={() => {
                                                  setSelectedUser(u);
                                                  setIsEditOpen(true);
                                              }}
                                              className="cursor-pointer gap-2"
                                          >
                                              <Edit2Icon className="w-4 h-4 text-emerald-600" />
                                              <span>Hariri Taarifa</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                              onClick={() => {
                                                  setSelectedUser(u);
                                                  setIsRoleOpen(true);
                                              }}
                                              className="cursor-pointer gap-2"
                                          >
                                              <ShieldAlertIcon className="w-4 h-4 text-blue-600" />
                                              <span>Badili Role</span>
                                          </DropdownMenuItem>
                                      </>
                                  )}
                                  {canResetPassword && (
                                      <DropdownMenuItem
                                          onClick={() => {
                                              setSelectedUser(u);
                                              setIsResetOpen(true);
                                          }}
                                          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 gap-2"
                                      >
                                          <RotateCcwIcon className="w-4 h-4 text-red-500" />
                                          <span>Reset Password</span>
                                      </DropdownMenuItem>
                                  )}
                              </DropdownMenuContent>
                          </DropdownMenu>
                      ),
                  },
              ]
            : []),
    ];

    return (
        <AppLayout user={user} title="Users & Permissions">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 font-sans">Usimamizi wa Watumiaji (Users)</h2>
                    <p className="text-sm text-gray-500">
                        Sanidi watumiaji wapya, dhibiti majukumu (Spatie roles), au weka upya nenosiri zao kwa usalama.
                    </p>
                </div>

                {canAddUser && (
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                        <UserPlusIcon className="w-4 h-4 shrink-0" />
                        Sajili User Mpya
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-md w-full select-none">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <SearchIcon className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tafuta kwa Jina au Username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-850 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors bg-gray-50/20"
                    />
                </div>

                {/* Table Data */}
                <Table
                    data={filteredUsers}
                    columns={columns}
                    emptyMessage="Hakuna watumiaji waliopatikana kulingana na utafutaji wako."
                />
            </div>

            {/* Modals & Dialogs */}
            {canAddUser && (
                <UserFormModal
                    roles={roles}
                    open={isAddOpen}
                    onOpenChange={setIsAddOpen}
                />
            )}

            {canUpdateUser && (
                <UpdateUserModal
                    user={selectedUser}
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                />
            )}

            {canUpdateUser && (
                <ChangeRoleModal
                    user={selectedUser}
                    roles={roles}
                    open={isRoleOpen}
                    onOpenChange={setIsRoleOpen}
                />
            )}

            {/* Reset Password Confirmation Dialog */}
            <AlertDialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-bold text-gray-900">
                            Thibitisha Kuweka Upya Nenosiri (Reset Password)
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-gray-500 mt-2">
                            Je, una uhakika unataka kuweka upya nenosiri la mtumiaji{' '}
                            <strong>{selectedUser?.name.toUpperCase()}</strong>?
                            <br />
                            <span className="text-red-500 font-bold block mt-1.5 bg-red-50 p-2 rounded-md border border-red-150 text-[11px]">
                                Nenosiri jipya litakuwa jina lake la kwanza likifuatiwa na @1234 (Mfano: {selectedUser?.name.split(' ')[0].toLowerCase()}@1234).
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="font-semibold cursor-pointer">Ghairi</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmReset}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                        >
                            Thibitisha Reset
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
