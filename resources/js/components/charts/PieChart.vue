<template>
  <div class="pharmacy-pie-chart">
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <div class="time-filter">
        <select v-model="selectedTimeRange" @change="updateChartData">
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>
    </div>
    
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <div class="chart-legend">
      <div 
        v-for="(item, index) in chartData" 
        :key="item.label" 
        class="legend-item"
        @mouseover="highlightSegment(index)"
        @mouseleave="resetHighlight()"
      >
        <span class="legend-color" :style="{ backgroundColor: item.backgroundColor }"></span>
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-value">{{ item.value }} ({{ item.percentage }}%)</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ChartDataItem {
  label: string;
  value: number;
  percentage: number;
  backgroundColor: string;
  hoverBackgroundColor: string;
}

export default defineComponent({
  name: 'PharmacyPieChart',
  props: {
    title: {
      type: String,
      default: 'Medication Distribution by Category'
    },
    initialData: {
      type: Array as () => ChartDataItem[],
      required: true
    }
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    const chartInstance = ref<Chart | null>(null);
    const selectedTimeRange = ref<string>('month');
    const chartData = ref<ChartDataItem[]>([]);

    // Process initial data to calculate percentages
    const processData = (data: ChartDataItem[]) => {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      return data.map(item => ({
        ...item,
        percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
      }));
    };

    // Initialize with processed data
    chartData.value = processData(props.initialData);

    // Update chart when time range changes
    const updateChartData = () => {
      // In a real app, you would fetch new data based on the time range
      // For this example, we'll just simulate some data changes
      const multiplier = selectedTimeRange.value === 'week' ? 1 : 
                       selectedTimeRange.value === 'month' ? 3 : 9;
      
      const updatedData = props.initialData.map(item => ({
        ...item,
        value: item.value * multiplier
      }));
      
      chartData.value = processData(updatedData);
      updateChart();
    };

    // Highlight segment on legend hover
    const highlightSegment = (index: number) => {
      if (chartInstance.value) {
        chartInstance.value.setActiveElements([{ datasetIndex: 0, index }]);
        chartInstance.value.update();
      }
    };

    // Reset highlight
    const resetHighlight = () => {
      if (chartInstance.value) {
        chartInstance.value.setActiveElements([]);
        chartInstance.value.update();
      }
    };

    // Initialize or update the chart
    const updateChart = () => {
      if (!chartCanvas.value) return;

      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;

      // Destroy previous chart instance if exists
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }

      chartInstance.value = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: chartData.value.map(item => item.label),
          datasets: [{
            data: chartData.value.map(item => item.value),
            backgroundColor: chartData.value.map(item => item.backgroundColor),
            hoverBackgroundColor: chartData.value.map(item => item.hoverBackgroundColor),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false // We're using custom legend
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw as number;
                  const percentage = chartData.value[context.dataIndex].percentage;
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          animation: {
            animateScale: true,
            animateRotate: true
          },
          cutout: '65%' // Makes it a donut chart if you prefer
        }
      });
    };

    // Watch for changes in chartData
    watch(chartData, updateChart, { deep: true });

    // Initialize on mount
    onMounted(() => {
      updateChart();
    });

    return {
      chartCanvas,
      chartData,
      selectedTimeRange,
      updateChartData,
      highlightSegment,
      resetHighlight
    };
  }
});
</script>

<style scoped>
.pharmacy-pie-chart {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
}

.time-filter select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  font-size: 0.9rem;
  cursor: pointer;
}

.chart-container {
  position: relative;
  height: 250px;
  margin-bottom: 20px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.legend-item:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.legend-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.legend-label {
  font-size: 0.85rem;
  color: #495057;
  margin-right: 8px;
  font-weight: 500;
}

.legend-value {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 400;
}
</style>