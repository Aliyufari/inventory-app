<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import DashboardCard from '../components/DashboardCard.vue';
import { Users, ShieldAlert, Section, BriefcaseMedical } from 'lucide-vue-next';
import PieChart from '@/components/charts/PieChart.vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const stats = [
  {
    value: '05',
    description: 'Users',
    icon: Users,
    iconBgColor: '#FFF8E1', 
    iconColor: '#FED600',  
    borderColor: '#FFEE58'
  },
  {
    value: '367',
    description: 'Products',
    icon: BriefcaseMedical,
    iconBgColor: '#E0F7FA', 
    iconColor: '#009099',   
    borderColor: '#80DEEA' 
  },
  {
    value: '112',
    description: 'Categories',
    icon: Section,
    iconBgColor: '#E1F5FE', 
    iconColor: '#03A9F5',   
    borderColor: '#4FC3F7'  
  },
  {
    value: '03',
    description: 'Shortage',
    icon: ShieldAlert,
    iconBgColor: '#FFEBEE', 
    iconColor: '#F0483E',   
    borderColor: '#EF9A9A'  
  }
];

const medicationData = [
    {
    label: 'Antibiotics',
    value: 120,
    backgroundColor: '#4e79a7',
    hoverBackgroundColor: '#3a5f8a'
    },
    {
    label: 'Pain Relief',
    value: 85,
    backgroundColor: '#f28e2b',
    hoverBackgroundColor: '#d97b1f'
    },
    {
    label: 'Cardiovascular',
    value: 65,
    backgroundColor: '#e15759',
    hoverBackgroundColor: '#c94547'
    },
    {
    label: 'Antidepressants',
    value: 45,
    backgroundColor: '#76b7b2',
    hoverBackgroundColor: '#5d9d98'
    },
    {
    label: 'Diabetes',
    value: 38,
    backgroundColor: '#59a14f',
    hoverBackgroundColor: '#47873e'
    },
    {
    label: 'Other',
    value: 27,
    backgroundColor: '#edc948',
    hoverBackgroundColor: '#dbb532'
    }
];
</script>

<template>
    <Head title="Dashboard" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard
                    v-for="(stat, index) in stats"
                    :key="index"
                    :="stat"
                />
            </div>
            <div class="relative min-h-[100vh] flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border md:min-h-min">
                <PieChart
                 title="Prescription Categories Distribution"
                :initial-data="medicationData" 
                />
            </div>
        </div>
    </AppLayout>
</template>