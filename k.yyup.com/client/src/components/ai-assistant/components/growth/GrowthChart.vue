<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  GrowthChartDataPoint,
  GrowthChartResponse,
  growthRecordsApi,
  GrowthRecordType
} from '@/api/modules/growth-records'
import { useDesignStore } from '@/stores/design'

// Props
interface Props {
  studentId: number
  type?: GrowthRecordType
  height?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  type: GrowthRecordType.HEIGHT_WEIGHT,
  height: 300
})

// Design store for theming
const designStore = useDesignStore()
const isDark = computed(() => designStore.darkMode)

// Refs
const chartData = ref<GrowthChartDataPoint[]>([])
const studentInfo = ref<{ id: number; name: string; gender: number; birthDate: string } | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Chart dimensions
const chartHeight = ref(props.height as number)
const padding = { top: 30, right: 60, bottom: 50, left: 60 }

// Computed chart scales
const xLabels = computed(() => {
  return chartData.value.map(d => {
    const date = new Date(d.measurementDate)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
})

const heightValues = computed(() => chartData.value.filter(d => d.height != null).map(d => d.height!))
const weightValues = computed(() => chartData.value.filter(d => d.weight != null).map(d => d.weight!))

const heightExtent = computed(() => {
  if (heightValues.value.length === 0) return { min: 0, max: 150 }
  const min = Math.min(...heightValues.value)
  const max = Math.max(...heightValues.value)
  return { min: Math.floor(min * 0.9), max: Math.ceil(max * 1.05) }
})

const weightExtent = computed(() => {
  if (weightValues.value.length === 0) return { min: 0, max: 50 }
  const min = Math.min(...weightValues.value)
  const max = Math.max(...weightValues.value)
  return { min: Math.floor(min * 0.9), max: Math.ceil(max * 1.05) }
})

// Generate path for SVG polyline
const generatePath = (values: number[], extent: { min: number; max: number }) => {
  if (values.length === 0) return ''
  const totalPoints = chartData.value.length
  const chartWidth = 1000
  const widthStep = (chartWidth - padding.left - padding.right) / (totalPoints - 1 || 1)
  const heightRange = extent.max - extent.min
  const chartHeightInner = chartHeight.value - padding.top - padding.bottom

  const points = chartData.value.map((d, i) => {
    let value: number | null = null
    if (d.height != null && extent === heightExtent.value) value = d.height
    if (d.weight != null && extent === weightExtent.value) value = d.weight

    if (value == null) return null
    const x = padding.left + i * widthStep
    const y = padding.top + chartHeightInner - ((value - extent.min) / heightRange) * chartHeightInner
    return `${x},${y}`
  }).filter(Boolean) as string[]

  return points.join(' ')
}

// Paths
const heightPath = computed(() => generatePath(heightValues.value, heightExtent.value))
const weightPath = computed(() => generatePath(weightValues.value, weightExtent.value))

// Calculate point coordinates for tooltips
const getPointCoordinates = (dataPoint: GrowthChartDataPoint, type: 'height' | 'weight') => {
  const totalPoints = chartData.value.length
  const chartWidth = 1000
  const widthStep = (chartWidth - padding.left - padding.right) / (totalPoints - 1 || 1)
  const chartHeightInner = chartHeight.value - padding.top - padding.bottom

  const index = chartData.value.findIndex(d => d.id === dataPoint.id)
  const value = type === 'height' ? dataPoint.height : dataPoint.weight
  const extent = type === 'height' ? heightExtent.value : weightExtent.value

  if (value == null) return null

  const x = padding.left + index * widthStep
  const y = padding.top + chartHeightInner - ((value - extent.min) / (extent.max - extent.min)) * chartHeightInner

  return { x, y }
}

// Y-axis labels
const heightYLabels = computed(() => {
  const { min, max } = heightExtent.value
  const step = Math.ceil((max - min) / 5)
  return Array.from({ length: 6 }, (_, i) => min + i * step)
})

const weightYLabels = computed(() => {
  const { min, max } = weightExtent.value
  const step = Math.ceil((max - min) / 5)
  return Array.from({ length: 6 }, (_, i) => min + i * step)
})

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Fetch data
const fetchChartData = async () => {
  if (!props.studentId) return

  loading.value = true
  error.value = null

  try {
    const response = await growthRecordsApi.getGrowthChart({
      studentId: props.studentId,
      type: props.type
    })

    if (response.data?.data) {
      const data = response.data.data as GrowthChartResponse
      chartData.value = data.records || []
      studentInfo.value = data.student || null
    }
  } catch (err: any) {
    error.value = err.message || '获取成长曲线数据失败'
    console.error('Failed to fetch growth chart data:', err)
  } finally {
    loading.value = false
  }
}

// Hover state for tooltips
const hoveredPoint = ref<{ dataPoint: GrowthChartDataPoint; type: 'height' | 'weight'; x: number; y: number } | null>(null)

const handlePointHover = (dataPoint: GrowthChartDataPoint, type: 'height' | 'weight') => {
  const coords = getPointCoordinates(dataPoint, type)
  if (coords) {
    hoveredPoint.value = { dataPoint, type, x: coords.x, y: coords.y }
  }
}

const handlePointLeave = () => {
  hoveredPoint.value = null
}

// Watch for student ID changes
watch(() => props.studentId, () => {
  fetchChartData()
}, { immediate: false })

// Lifecycle
onMounted(() => {
  fetchChartData()
})

// Expose methods
defineExpose({
  refresh: fetchChartData
})
</script>

<template>
  <div class="growth-chart" :class="{ 'dark-mode': isDark }">
    <!-- Header -->
    <div class="chart-header">
      <div class="student-info" v-if="studentInfo">
        <span class="student-name">{{ studentInfo.name }}</span>
        <span class="student-age">月龄: {{ chartData[0]?.ageInMonths || '-' }}个月</span>
      </div>
      <div class="chart-title">成长曲线</div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="chart-loading">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="chart-error">
      <span class="error-icon">!</span>
      <span>{{ error }}</span>
      <button class="retry-btn" @click="fetchChartData">重试</button>
    </div>

    <!-- Chart content -->
    <div v-else-if="chartData.length > 0" class="chart-container">
      <!-- SVG Chart -->
      <svg
        class="chart-svg"
        :viewBox="`0 0 1000 ${chartHeight}`"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Grid lines -->
        <g class="grid-lines">
          <line
            v-for="label in heightYLabels"
            :key="`grid-${label}`"
            :x1="padding.left"
            :y1="padding.top + chartHeight - padding.bottom - ((label - heightExtent.min) / (heightExtent.max - heightExtent.min)) * (chartHeight - padding.top - padding.bottom)"
            :x2="1000 - padding.right"
            :y2="padding.top + chartHeight - padding.bottom - ((label - heightExtent.min) / (heightExtent.max - heightExtent.min)) * (chartHeight - padding.top - padding.bottom)"
            class="grid-line"
          />
        </g>

        <!-- Height line -->
        <path
          v-if="heightPath"
          :d="`M ${heightPath}`"
          class="chart-line height-line"
          fill="none"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Weight line -->
        <path
          v-if="weightPath"
          :d="`M ${weightPath}`"
          class="chart-line weight-line"
          fill="none"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Data points - Height -->
        <g
          v-for="dp in chartData.filter(d => d.height != null)"
          :key="`height-${dp.id}`"
          class="data-point-group"
        >
          <circle
            :cx="getPointCoordinates(dp, 'height')?.x"
            :cy="getPointCoordinates(dp, 'height')?.y"
            r="6"
            class="data-point height-point"
            @mouseenter="handlePointHover(dp, 'height')"
            @mouseleave="handlePointLeave"
          />
        </g>

        <!-- Data points - Weight -->
        <g
          v-for="dp in chartData.filter(d => d.weight != null)"
          :key="`weight-${dp.id}`"
          class="data-point-group"
        >
          <circle
            :cx="getPointCoordinates(dp, 'weight')?.x"
            :cy="getPointCoordinates(dp, 'weight')?.y"
            r="5"
            class="data-point weight-point"
            @mouseenter="handlePointHover(dp, 'weight')"
            @mouseleave="handlePointLeave"
          />
        </g>

        <!-- Tooltip -->
        <g v-if="hoveredPoint" class="chart-tooltip">
          <rect
            :x="hoveredPoint.x - 70"
            :y="hoveredPoint.y - 45"
            width="140"
            height="40"
            rx="6"
            class="tooltip-bg"
          />
          <text
            :x="hoveredPoint.x"
            :y="hoveredPoint.y - 30"
            text-anchor="middle"
            class="tooltip-date"
          >
            {{ formatDate(hoveredPoint.dataPoint.measurementDate) }}
          </text>
          <text
            :x="hoveredPoint.x"
            :y="hoveredPoint.y - 12"
            text-anchor="middle"
            :class="`tooltip-value ${hoveredPoint.type}`"
          >
            {{ hoveredPoint.type === 'height' ? '身高' : '体重' }}:
            {{ hoveredPoint.type === 'height' ? hoveredPoint.dataPoint.height : hoveredPoint.dataPoint.weight }}
            {{ hoveredPoint.type === 'height' ? 'cm' : 'kg' }}
          </text>
        </g>

        <!-- X-axis labels -->
        <g class="x-axis-labels">
          <text
            v-for="(label, i) in xLabels.filter((_, idx) => idx % Math.ceil(xLabels.length / 6) === 0)"
            :key="`x-label-${i}`"
            :x="padding.left + i * Math.ceil(xLabels.length / 6) * ((1000 - padding.left - padding.right) / (xLabels.length - 1 || 1))"
            :y="chartHeight - 15"
            text-anchor="middle"
            class="axis-label"
          >
            {{ label }}
          </text>
        </g>

        <!-- Y-axis labels -->
        <g class="y-axis-labels">
          <text
            v-for="label in heightYLabels"
            :key="`y-label-${label}`"
            :x="padding.left - 10"
            :y="padding.top + chartHeight - padding.bottom - ((label - heightExtent.min) / (heightExtent.max - heightExtent.min)) * (chartHeight - padding.top - padding.bottom) + 4"
            text-anchor="end"
            class="axis-label"
          >
            {{ label }}cm
          </text>
        </g>
      </svg>

      <!-- Legend -->
      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-dot height-dot"></span>
          <span>身高</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot weight-dot"></span>
          <span>体重</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="chart-empty">
      <span class="empty-icon">📊</span>
      <span>暂无成长数据</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.growth-chart {
  width: 100%;
  background: var(--ai-card-bg, #ffffff);
  border-radius: 12px;
  overflow: hidden;

  &.dark-mode {
    background: var(--ai-card-bg-dark, #1a1a2e);
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--ai-border-color, #e8e8e8);

  .student-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .student-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--ai-text-primary, #333);
  }

  .student-age {
    font-size: 13px;
    color: var(--ai-text-secondary, #666);
  }

  .chart-title {
    font-size: 14px;
    color: var(--ai-text-secondary, #666);
  }
}

.chart-loading,
.chart-error,
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  color: var(--ai-text-secondary, #666);
}

.chart-loading {
  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--ai-border-color, #e8e8e8);
    border-top-color: var(--ai-primary, #667eea);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.chart-error {
  .error-icon {
    width: 32px;
    height: 32px;
    background: var(--ai-danger, #ff6b6b);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  .retry-btn {
    margin-top: 8px;
    padding: 6px 16px;
    background: var(--ai-primary, #667eea);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;

    &:hover {
      opacity: 0.9;
    }
  }
}

.chart-empty {
  .empty-icon {
    font-size: 48px;
    opacity: 0.5;
  }
}

.chart-container {
  padding: 16px;
}

.chart-svg {
  width: 100%;
  height: auto;
}

.grid-line {
  stroke: var(--ai-border-color, #e8e8e8);
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.chart-line {
  transition: opacity 0.3s;

  &.height-line {
    stroke: var(--ai-primary, #667eea);
  }

  &.weight-line {
    stroke: var(--ai-secondary, #f093fb);
  }
}

.data-point {
  cursor: pointer;
  transition: r 0.2s, opacity 0.3s;

  &.height-point {
    fill: var(--ai-primary, #667eea);
  }

  &.weight-point {
    fill: var(--ai-secondary, #f093fb);
  }

  &:hover {
    r: 8;
  }
}

.data-point-group {
  &:hover .data-point {
    r: 8;
  }
}

.chart-tooltip {
  pointer-events: none;

  .tooltip-bg {
    fill: var(--ai-card-bg, #ffffff);
    stroke: var(--ai-border-color, #e8e8e8);
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  }

  .tooltip-date {
    font-size: 11px;
    fill: var(--ai-text-secondary, #666);
  }

  .tooltip-value {
    font-size: 12px;
    font-weight: 600;

    &.height {
      fill: var(--ai-primary, #667eea);
    }

    &.weight {
      fill: var(--ai-secondary, #f093fb);
    }
  }
}

.axis-label {
  font-size: 11px;
  fill: var(--ai-text-secondary, #666);
}

.x-axis-labels {
  .axis-label {
    font-size: 10px;
  }
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--ai-border-color, #e8e8e8);

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--ai-text-secondary, #666);
  }

  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;

    &.height-dot {
      background: var(--ai-primary, #667eea);
    }

    &.weight-dot {
      background: var(--ai-secondary, #f093fb);
    }
  }
}
</style>
