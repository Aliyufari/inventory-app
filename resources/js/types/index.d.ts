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
    created_at: date;
    updated_at: date;
}

export interface User {
    id: string;
    avatar?: string;
    name: string;
    email: string;
    gender: string;
    role_id: Role.id;
    email_verified_at: string | null;
    status: boolean;
    created_at: date;
    updated_at: date;
}

export interface Customer {
  id: string | number
  name: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  created_at?: string
  updated_at?: string
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
    id: string
    name: string
    wholesale_price: number
    retail_price: number
    quantity: number
    brand: string
    barcode: string
    description: string
    image?: string | null
    unit?: string | null
    units_per_packet?: number | null
    packets_per_carton?: number | null
    min_stock_level?: number | null
    allow_wholesale: boolean
    status: boolean
    categories: {
        id: string
        name: string
    }[]
    store?: {
        id: string
        name: string
    } | null
    creator?: {
        id: string
        name: string
    } | null
    created_at: Date
    updated_at: Date
}

export interface InventoryItem {
  id: string
  product_id: string
  product_name?: string
  name?: string
  product?: { name: string }
  quantity: number
  unit_price: number
  price?: number
  total: number
}

export interface Inventory {
  id: string
  invoice_number: string
  type: string
  user?: { name: string }
  payment_method: string
  status: string
  subtotal: number
  discount: number
  tax: number
  total: number
  items?: InventoryItem[]
  inventory_items?: InventoryItem[]
  created_at?: string
}

export interface InvoiceState {
  invoicePDFDataURL: string | null
  isGenerating: boolean
  showPreview: boolean
}

export type BreadcrumbItemType = BreadcrumbItem;
