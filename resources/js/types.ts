export interface Network {
    id: number;
    name: string;
    balance: number;
}

export interface AccountSuggestion {
    number: string;
    name: string;
    networkId: number;
    networkName: string;
}

export interface Transaction {
    id: number;
    network: string;
    networkId: number;
    accountNumber: string;
    accountName: string;
    amount: number;
    customer: string;
    commission: number;
    fee: number;
    createdAt: string;
    createdBy: string;
}

export interface User {
    id: number;
    name: string;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
    email_verified_at?: string;
    is_active: boolean;
    should_change_password: boolean;
    is_super_admin: boolean;
    phone?: string;
}

type Link = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedResponse<T> = {
    data: T[];
    links: Link[];
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: Link[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
};