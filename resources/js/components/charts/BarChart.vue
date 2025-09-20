<template>
  <div class="pharmacy-inventory-chart">
    <div class="chart-header">
      <h3 class="chart-title">Medication Inventory Status</h3>
      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-dot bg-teal-500"></span>
          <span>In Stock</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot bg-amber-400"></span>
          <span>Low Stock</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot bg-red-500"></span>
          <span>Critical</span>
        </div>
      </div>
    </div>

    <VueApexCharts
      type="bar"
      height="350"
      :options="chartOptions"
      :series="series"
      class="mt-4"
    />
  </div>
</template>

<script setup>
import VueApexCharts from 'vue3-apexcharts'
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => [
      { medication: 'Amoxicillin 500mg', current: 120, threshold: 50, status: 'safe' },
      { medication: 'Insulin Glargine', current: 45, threshold: 30, status: 'safe' },
      { medication: 'Ventolin Inhaler', current: 89, threshold: 40, status: 'safe' },
      { medication: 'Atorvastatin 20mg', current: 32, threshold: 25, status: 'warning' },
      { medication: 'Omeprazole 20mg', current: 15, threshold: 20, status: 'critical' }
    ]
  }
})

const series = computed(() => [{
  name: 'Current Stock',
  data: props.data.map(item => item.current)
}, {
  name: 'Reorder Threshold',
  data: props.data.map(item => item.threshold)
}])

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    background: '#fff'
  },
  colors: props.data.map(item => 
    item.status === 'critical' ? '#F0483E' :
    item.status === 'warning' ? '#FED600' :
    '#009099'
  ),
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '75%',
      borderRadius: 4,
      dataLabels: {
        position: 'top'
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => val.toString(),
    style: {
      fontSize: '12px',
      colors: ['#1F2937']
    },
    offsetX: 10
  },
  stroke: {
    show: true,
    width: 1,
    colors: ['#fff']
  },
  grid: {
    borderColor: '#E5E7EB',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } }
  },
  xaxis: {
    categories: props.data.map(item => item.medication),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: {
        fontSize: '12px',
        fontWeight: 500,
        colors: '#4B5563'
      }
    }
  },
  yaxis: {
    min: 0,
    forceNiceScale: true,
    labels: {
      style: {
        fontSize: '12px',
        colors: '#6B7280'
      }
    }
  },
  tooltip: {
    custom: ({ dataPointIndex }) => {
      const item = props.data[dataPointIndex]
      return `
        <div class="bg-white shadow-lg rounded-lg p-3 border border-gray-200 text-sm">
          <div class="font-semibold text-gray-900 mb-2">${item.medication}</div>
          <div class="flex justify-between py-1 border-b border-gray-100">
            <span class="text-gray-600">Current Stock</span>
            <span class="font-medium ${item.status === 'critical' ? 'text-red-600' : item.status === 'warning' ? 'text-amber-600' : 'text-teal-600'}">
              ${item.current} units
            </span>
          </div>
          <div class="flex justify-between py-1">
            <span class="text-gray-600">Reorder Level</span>
            <span class="font-medium">${item.threshold} units</span>
          </div>
        </div>
      `
    }
  },
  annotations: {
    xaxis: props.data.map(item => ({
      x: item.threshold,
      borderColor: '#9CA3AF',
      strokeDashArray: 4,
      label: {
        borderColor: '#9CA3AF',
        style: {
          color: '#4B5563',
          background: '#F9FAFB',
          fontSize: '10px'
        },
        text: `Reorder at ${item.threshold}`
      }
    }))
  }
}))
</script>

<style scoped>
.pharmacy-inventory-chart {
  @apply bg-white rounded-xl border border-gray-200 p-6 shadow-sm;
}

.chart-header {
  @apply flex flex-col md:flex-row md:items-center md:justify-between mb-4;
}

.chart-title {
  @apply text-lg font-semibold text-gray-900 mb-2 md:mb-0;
}

.chart-legend {
  @apply flex flex-wrap gap-4;
}

.legend-item {
  @apply flex items-center space-x-2 text-sm text-gray-600;
}

.legend-dot {
  @apply w-3 h-3 rounded-full;
}
</style>