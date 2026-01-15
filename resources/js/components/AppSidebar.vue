<script setup lang="ts">
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/vue3';
import { BookOpen, Folder, LayoutGrid, Store, Truck, Bell, Wrench, NotepadText, LocateFixed, Users, Section, Wallet, Package, ShoppingCart, Warehouse, PersonStanding, HandCoins } from 'lucide-vue-next';
import AppLogo from './AppLogo.vue';
import { computed } from 'vue';

const page = usePage();
const user = page.props.auth.user;

// Allowed roles that can see everything
const allowedRoles = ['super', 'owner', 'admin'];

// Original main nav
const allNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Stores',
        href: '/stores',
        icon: Store,
    },
    {
        title: 'Categories',
        href: '/categories',
        icon: Section,
    },
    {
        title: 'Products',
        href: '/products',
        icon: Package,
    },
    {
        title: 'Supply',
        href: '/supply',
        icon: Truck,
    },
    {
        title: 'Sales',
        href: '/sales',
        icon: ShoppingCart,
    },
    {
        title: 'Inventory',
        href: '/inventories',
        icon: Warehouse ,
    },
    {
        title: 'Customers',
        href: '/customers',
        icon: HandCoins,
    },
    {
        title: 'Supliers',
        href: '/supliers',
        icon: PersonStanding,
    },
    {
        title: 'Credits',
        href: '/credits',
        icon: Wallet,
    },
    {
        title: 'Reports',
        href: '/sales-reports',
        icon: NotepadText,
    },
    {
        title: 'Notifications',
        href: '/notifications',
        icon: Bell,
    },
    {
        title: 'Configurations',
        href: '/configurations',
        icon: Wrench,
    },
    {
        title: 'Contact',
        href: '/contact',
        icon: LocateFixed,
    }
];

const mainNavItems = computed(() => {
    if (!user || !allowedRoles.includes(user?.role?.name)) {
        return allNavItems.filter(item => ['Sales', 'Reports'].includes(item.title));
    }
    return allNavItems;
});

const footerNavItems: NavItem[] = [
    { title: 'Github Repo', href: 'https://github.com/laravel/vue-starter-kit', icon: Folder },
    { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits#vue', icon: BookOpen },
];
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="route('dashboard')">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
        </SidebarContent>

        <SidebarFooter>
            <NavFooter :items="footerNavItems" />
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
