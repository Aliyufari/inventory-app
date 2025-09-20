import type { PageProps } from '@inertiajs/core';
import type { LucideIcon } from 'lucide-vue-next';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon;
    isActive?: boolean;
}

export interface SharedData extends PageProps {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
}

export interface Role {
    id: number;
    name: string;
}

export interface User {
    id: string;
    avatar?: string;
    name: string;
    email: string;
    gender: string;
    role_id: Role.id;
    email_verified_at: string | null;
    created_at: date;
    updated_at: date;
}

export interface Store {
    id: string;
    name: string;
    description: string;
    created_at: date;
    updated_at: date;
}

export interface Category {
    id: string;
    name: string;
    description: string;
    created_at: date;
    updated_at: date;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    brand: string;
    description: string;
    created_at: date;
    updated_at: date;
}

export type BreadcrumbItemType = BreadcrumbItem;
