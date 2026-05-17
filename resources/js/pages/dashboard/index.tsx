import AppLayout from '../../layouts/AppLayout';
import { formatCurrency, formatDate } from '../../utils';
import Table, { Column } from '../../components/Table';

interface Summary {
    transactionCount: number;
    floatBalance: number;
    networkCount: number;
    cashBalance: number;
}

interface Transaction {
    id: number;
    network: { id: number; name: string } | null;
    account_number: string;
    account_name: string;
    amount: number;
    customer: string | null;
    commission: number | null;
    fee: number | null;
    user: { id: number; name: string } | null;
    created_at: string;
}

interface Props {
    summary: Summary;
    user: { name: string; permissions: string[] };
    filter: string;
    latestTransactions: Transaction[];
}

export default function Dashboard({ summary, user, filter, latestTransactions }: Props) {
    const canShowSummary = user.permissions.includes('show_summary');
    const canShowCash = user.permissions.includes('show_cash_balance');
    const canShowNetworks = user.permissions.includes('list_networks');

    const cards = [
        ...(canShowSummary
            ? [
                  {
                      label: 'Jumla ya Miamala',
                      value: summary.transactionCount,
                      type: 'count' as const,
                      color: 'yellow',
                      icon: TransactionIcon,
                  },
                  {
                      label: 'Salio la Float',
                      value: summary.floatBalance,
                      type: 'currency' as const,
                      color: 'green',
                      icon: FloatIcon,
                  },
              ]
            : []),
        ...(canShowCash
            ? [
                  {
                      label: 'Salio la Cash',
                      value: summary.cashBalance,
                      type: 'currency' as const,
                      color: 'blue',
                      icon: CashIcon,
                  },
              ]
            : []),
        ...(canShowNetworks
            ? [
                  {
                      label: 'Mitandao na Banks',
                      value: summary.networkCount,
                      type: 'count' as const,
                      color: 'purple',
                      icon: NetworkIcon,
                  },
              ]
            : []),
    ];

    const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
        yellow: {
            bg: 'bg-yellow-50 border-yellow-200',
            icon: 'bg-yellow-100 text-yellow-600',
            badge: 'text-yellow-700',
        },
        green: {
            bg: 'bg-emerald-50 border-emerald-200',
            icon: 'bg-emerald-100 text-emerald-600',
            badge: 'text-emerald-700',
        },
        blue: {
            bg: 'bg-blue-50 border-blue-200',
            icon: 'bg-blue-100 text-blue-600',
            badge: 'text-blue-700',
        },
        purple: {
            bg: 'bg-purple-50 border-purple-200',
            icon: 'bg-purple-100 text-purple-600',
            badge: 'text-purple-700',
        },
    };

    const columns: Column<Transaction>[] = [
        {
            header: 'Na.',
            className: 'w-16 text-center text-gray-400 font-semibold',
            render: (_, index) => <span className="text-gray-400 font-semibold">#{index + 1}</span>,
        },
        {
            header: 'Tarehe',
            className: 'whitespace-nowrap text-gray-600 font-medium',
            render: (tx) => <span>{formatDate(tx.created_at)}</span>,
        },
        {
            header: 'Mtandao',
            className: 'whitespace-nowrap font-semibold',
            render: (tx) => {
                const networkName = tx.network?.name || 'N/A';
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                        {networkName}
                    </span>
                );
            },
        },
        {
            header: 'Aina',
            className: 'whitespace-nowrap',
            render: (tx) => {
                const isDeposit = tx.amount < 0;
                return (
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                            isDeposit
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                    >
                        {isDeposit ? 'Kuweka' : 'Kutoa'}
                    </span>
                );
            },
        },
        {
            header: 'Akaunti',
            className: 'min-w-[150px]',
            render: (tx) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{tx.account_number}</span>
                    <span className="text-xs text-gray-400">{tx.account_name}</span>
                </div>
            ),
        },
        {
            header: 'Kiasi',
            className: 'text-right font-bold whitespace-nowrap',
            render: (tx) => {
                const isDeposit = tx.amount < 0;
                const val = isDeposit ? Math.abs(tx.amount) : -tx.amount;
                return (
                    <span className={isDeposit ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {isDeposit ? '+' : ''}
                        {formatCurrency(val)}
                    </span>
                );
            },
        },
        {
            header: 'Ada',
            className: 'text-right whitespace-nowrap font-medium text-gray-500',
            render: (tx) => <span>{formatCurrency(tx.fee || 0)}</span>,
        },
        {
            header: 'Mrejea',
            className: 'text-right whitespace-nowrap font-medium text-gray-500',
            render: (tx) => <span>{formatCurrency(tx.commission || 0)}</span>,
        },
        {
            header: 'Mteja',
            className: 'whitespace-nowrap text-gray-600',
            render: (tx) => <span>{tx.customer || tx.account_name}</span>,
        },
        {
            header: 'Mtumiaji',
            className: 'whitespace-nowrap font-bold text-gray-700 text-xs tracking-wider uppercase',
            render: (tx) => <span>{tx.user?.name ? tx.user.name.toUpperCase() : 'N/A'}</span>,
        },
    ];

    return (
        <AppLayout user={user} title="Dashboard">
            {/* Header bar with Greeting and Filters */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Habari, {user.name}!</h2>
                    <p className="text-sm text-gray-500">Hapa kuna muhtasari wa biashara yako leo.</p>
                </div>

                {canShowSummary && (
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: 'Today', value: '' },
                            { label: 'This Week', value: 'week' },
                            { label: 'This Month', value: 'month' },
                            { label: 'This Year', value: 'year' },
                        ].map(({ label, value }) => (
                            <a
                                key={value}
                                href={value ? `/dashboard?filter=${value}` : '/dashboard'}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
                                    ${filter === value
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                                    }`}
                            >
                                {label}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {cards.map(({ label, value, type, color, icon: Icon }) => {
                    const c = colorMap[color];
                    return (
                        <div
                            key={label}
                            className={`rounded-2xl border p-5 flex items-center gap-4 ${c.bg}`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
                                <p className={`text-xl font-bold truncate ${c.badge}`}>
                                    {type === 'currency' ? formatCurrency(value) : value.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Latest 20 Transactions */}
            <div className="mt-8">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Miamala 20 ya Hivi Karibuni</h3>
                    <p className="text-sm text-gray-500">Orodha ya miamala ya mwisho kufanyika kwenye mfumo.</p>
                </div>
                <Table
                    data={latestTransactions || []}
                    columns={columns}
                    emptyMessage="Hakuna miamala iliyopatikana kwenye mfumo."
                />
            </div>
        </AppLayout>
    );
}

// ---- inline icons ----
function TransactionIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
    );
}
function FloatIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}
function CashIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );
}
function NetworkIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="2" y="2" width="20" height="8" rx="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" strokeLinecap="round" strokeWidth={3} />
            <line x1="6" y1="18" x2="6.01" y2="18" strokeLinecap="round" strokeWidth={3} />
        </svg>
    );
}
