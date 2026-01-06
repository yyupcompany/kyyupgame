<!--
  📊 统计数据结果展示组件
  用于展示统计分析的Function Tool结果
-->

<template>
  <div class="statistics-result">
    <div class="result-header">
      <div class="result-title">
        <span class="title-icon">📊</span>
        <h4>{{ metadata?.title || '统计数据' }}</h4>
      </div>
      <div v-if="metadata?.description" class="result-summary">
        {{ metadata.description }}
      </div>
    </div>

    <div class="statistics-content">
      <!-- 数字指标卡片 -->
      <div v-if="data?.metrics?.length > 0" class="metrics-grid">
        <div 
          v-for="metric in data.metrics" 
          :key="metric.key"
          class="metric-card"
          :class="getMetricClass(metric.trend)"
        >
          <div class="metric-value">
            {{ formatValue(metric.value) }}
            <span v-if="metric.unit" class="metric-unit">{{ metric.unit }}</span>
          </div>
          <div class="metric-label">{{ metric.label }}</div>
          <div v-if="metric.trend" class="metric-trend" :class="getTrendClass(metric.trend)">
            <span class="trend-icon">{{ getTrendIcon(metric.trend) }}</span>
            <span class="trend-text">{{ metric.change || '' }}</span>
          </div>
        </div>
      </div>

      <!-- 图表数据 -->
      <div v-if="data?.charts?.length > 0" class="charts-section">
        <div 
          v-for="chart in data.charts" 
          :key="chart.id"
          class="chart-container"
        >
          <div class="chart-title">{{ chart.title }}</div>
          
          <!-- 简单的文本图表 -->
          <div v-if="chart.type === 'bar'" class="text-chart">
            <div 
              v-for="item in chart.data" 
              :key="item.label"
              class="chart-bar"
            >
              <div class="bar-label">{{ item.label }}</div>
              <div class="bar-container">
                <div 
                  class="bar-fill" 
                  :style="{ width: getBarWidth(item.value, getMaxValue(chart.data)) }"
                ></div>
                <span class="bar-value">{{ formatValue(item.value) }}</span>
              </div>
            </div>
          </div>

          <!-- 数据列表 -->
          <div v-else-if="chart.type === 'list'" class="data-list">
            <div 
              v-for="item in chart.data" 
              :key="item.label"
              class="list-item"
            >
              <span class="item-label">{{ item.label }}</span>
              <span class="item-value">{{ formatValue(item.value) }}</span>
            </div>
          </div>

          <!-- 饼图数据 -->
          <div v-else-if="chart.type === 'pie'" class="pie-data">
            <div 
              v-for="(item, index) in chart.data" 
              :key="item.label"
              class="pie-item"
            >
              <div class="pie-color" :style="{ backgroundColor: getPieColor(index) }"></div>
              <span class="pie-label">{{ item.label }}</span>
              <span class="pie-value">{{ formatValue(item.value) }} ({{ getPercentage(item.value, getTotalValue(chart.data)) }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据表格 -->
      <div v-if="data?.table" class="table-section">
        <div class="table-title">{{ data.table.title }}</div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="column in data.table.columns" :key="column.key">
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in data.table.rows" :key="row.id">
                <td v-for="column in data.table.columns" :key="column.key">
                  {{ formatTableValue(row[column.key], column.type) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 总结文本 -->
      <div v-if="data?.summary" class="summary-section">
        <div class="summary-title">数据洞察</div>
        <div class="summary-content">{{ data.summary }}</div>
      </div>
    </div>

    <div v-if="metadata?.actions?.length > 0" class="result-actions">
      <button 
        v-for="action in metadata.actions"
        :key="action.action"
        @click="handleAction(action.action, action.params)"
        class="result-action-btn"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Metric {
  key: string
  label: string
  value: number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  change?: string
}

interface ChartItem {
  label: string
  value: number
}

interface Chart {
  id: string
  title: string
  type: 'bar' | 'pie' | 'list'
  data: ChartItem[]
}

interface TableColumn {
  key: string
  label: string
  type?: 'number' | 'date' | 'text'
}

interface Props {
  data: {
    metrics?: Metric[]
    charts?: Chart[]
    table?: {
      title: string
      columns: TableColumn[]
      rows: any[]
    }
    summary?: string
    message?: string
  }
  metadata?: {
    title?: string
    description?: string
    type?: string
    actions?: Array<{
      label: string
      action: string
      params?: any
    }>
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  action: [action: string, params?: any]
}>()

const handleAction = (action: string, params?: any) => {
  emit('action', action, params)
}

const formatValue = (value: number) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toLocaleString()
}

const getMetricClass = (trend?: string) => {
  return trend ? `trend-${trend}` : ''
}

const getTrendClass = (trend: string) => {
  const classMap = {
    'up': 'trend-positive',
    'down': 'trend-negative',
    'stable': 'trend-neutral'
  }
  return classMap[trend as keyof typeof classMap] || ''
}

const getTrendIcon = (trend: string) => {
  const iconMap = {
    'up': '📈',
    'down': '📉',
    'stable': '➡️'
  }
  return iconMap[trend as keyof typeof iconMap] || ''
}

const getBarWidth = (value: number, maxValue: number) => {
  return `${(value / maxValue) * 100}%`
}

const getMaxValue = (data: ChartItem[]) => {
  return Math.max(...data.map(item => item.value))
}

const getTotalValue = (data: ChartItem[]) => {
  return data.reduce((sum, item) => sum + item.value, 0)
}

const getPercentage = (value: number, total: number) => {
  return ((value / total) * 100).toFixed(1)
}

const getPieColor = (index: number) => {
  const colors = ['#667eea', '#f093fb', '#4ade80', '#fb7185', 'var(--warning-color)', '#a78bfa']
  return colors[index % colors.length]
}

const formatTableValue = (value: any, type?: string) => {
  if (type === 'number' && typeof value === 'number') {
    return formatValue(value)
  } else if (type === 'date' && value) {
    return new Date(value).toLocaleDateString('zh-CN')
  }
  return value
}
</script>

<style lang="scss" scoped>
.statistics-result {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.result-header {
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .result-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);

    .title-icon {
      font-size: 1var(--spacing-sm);
    }

    h4 {
      margin: 0;
      font-size: var(--spacing-md);
      font-weight: 600;
    }
  }

  .result-summary {
    font-size: 12px;
    opacity: 0.9;
  }
}

.statistics-content {
  padding: var(--spacing-md);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;

  .metric-card {
    background: #f8fafc;
    padding: 12px;
    border-radius: var(--spacing-sm);
    text-align: center;
    border: var(--border-width-base) solid var(--border-light-dark);

    &.trend-up {
      background: linear-gradient(135deg, #dcfce7, #f0fdf4);
      border-color: #bbf7d0;
    }

    &.trend-down {
      background: linear-gradient(135deg, #fee2e2, #fef2f2);
      border-color: #fecaca;
    }

    .metric-value {
      font-size: 1var(--spacing-sm);
      font-weight: 700;
      color: #1f2937;
      margin-bottom: var(--spacing-xs);

      .metric-unit {
        font-size: 12px;
        color: #6b7280;
        font-weight: 400;
      }
    }

    .metric-label {
      font-size: 1var(--border-width-base);
      color: #6b7280;
      margin-bottom: var(--spacing-xs);
    }

    .metric-trend {
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;

      &.trend-positive {
        color: #059669;
      }

      &.trend-negative {
        color: #dc2626;
      }

      &.trend-neutral {
        color: #6b7280;
      }

      .trend-icon {
        font-size: 10px;
      }
    }
  }
}

.charts-section {
  margin-bottom: 20px;

  .chart-container {
    background: #f8fafc;
    padding: 12px;
    border-radius: var(--spacing-sm);
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .chart-title {
      font-size: 1var(--spacing-xs);
      font-weight: 600;
      color: #374151;
      margin-bottom: 12px;
    }
  }

  .text-chart {
    .chart-bar {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-sm);

      &:last-child {
        margin-bottom: 0;
      }

      .bar-label {
        width: 60px;
        font-size: 1var(--border-width-base);
        color: #6b7280;
        flex-shrink: 0;
      }

      .bar-container {
        flex: 1;
        display: flex;
        align-items: center;
        background: #e5e7eb;
        height: var(--spacing-md);
        border-radius: var(--spacing-sm);
        position: relative;
        overflow: hidden;

        .bar-fill {
          background: linear-gradient(90deg, #667eea, #764ba2);
          height: 100%;
          border-radius: var(--spacing-sm);
          transition: width 0.3s ease;
        }

        .bar-value {
          position: absolute;
          right: var(--spacing-xs);
          font-size: 10px;
          color: #374151;
          font-weight: 500;
        }
      }
    }
  }

  .data-list {
    .list-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: var(--border-width-base) solid #e5e7eb;
      font-size: 12px;

      &:last-child {
        border-bottom: none;
      }

      .item-label {
        color: #6b7280;
      }

      .item-value {
        color: #374151;
        font-weight: 500;
      }
    }
  }

  .pie-data {
    .pie-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: 6px;
      font-size: 1var(--border-width-base);

      &:last-child {
        margin-bottom: 0;
      }

      .pie-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        flex-shrink: 0;
      }

      .pie-label {
        color: #6b7280;
        flex: 1;
      }

      .pie-value {
        color: #374151;
        font-weight: 500;
      }
    }
  }
}

.table-section {
  margin-bottom: 20px;

  .table-title {
    font-size: 1var(--spacing-xs);
    font-weight: 600;
    color: #374151;
    margin-bottom: var(--spacing-sm);
  }

  .table-container {
    overflow-x: auto;
    border-radius: 6px;
    border: var(--border-width-base) solid #e5e7eb;

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;

      th {
        background: #f9fafb;
        padding: var(--spacing-sm);
        text-align: left;
        font-weight: 600;
        color: #374151;
        border-bottom: var(--border-width-base) solid #e5e7eb;
      }

      td {
        padding: var(--spacing-sm);
        border-bottom: var(--border-width-base) solid #f3f4f6;
        color: #6b7280;

        &:last-child {
          border-bottom: none;
        }
      }

      tr:last-child td {
        border-bottom: none;
      }
    }
  }
}

.summary-section {
  background: #f0f9ff;
  padding: 12px;
  border-radius: var(--spacing-sm);
  border-left: var(--spacing-xs) solid #0ea5e9;

  .summary-title {
    font-size: 13px;
    font-weight: 600;
    color: #0369a1;
    margin-bottom: 6px;
  }

  .summary-content {
    font-size: 12px;
    color: #0f172a;
    line-height: 1.5;
  }
}

.result-actions {
  padding: 12px var(--spacing-md);
  background: #f9fafb;
  border-top: var(--border-width-base) solid #e5e7eb;
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;

  .result-action-btn {
    padding: 6px 12px;
    background: white;
    border: var(--border-width-base) solid #d1d5db;
    border-radius: 6px;
    font-size: 12px;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }
  }
}
</style>