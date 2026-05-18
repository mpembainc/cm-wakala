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
