export * from './user';
export * from './network';
export * from './transaction';
export * from './cash';

export type Link = {
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
