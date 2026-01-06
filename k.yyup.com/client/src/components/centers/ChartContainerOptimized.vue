<template>
  <div class="chart-container-optimized" :class="{ 'chart-container--loading': loading }">
    <!-- 图表头部 - 简化版本 -->
    <div class="chart-header" v-if="title">
      <div class="header-left">
        <h4 class="chart-title">{{ title }}</h4>
        <span v-if="subtitle" class="chart-subtitle">{{ subtitle }}</span>
      </div>
      <div class="header-right">
        <el-button
          v-if="showRefresh"
          size="small"
          :icon="Refresh"
          @click="handleRefresh"
          :loading="loading"
          title="刷新数据"
        />
      </div>
    </div>

    <!-- 图表内容 - 优化版本 -->
    <div class="chart-content" :style="{ height: chartHeight }">
      <!-- 加载状态 -->
      <div v-if="loading" class="chart-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>

      <!-- 空数据状态 -->
      <div v-else-if="isEmpty" class="chart-empty">
        <div class="empty-icon">📊</div>
        <div class="empty-text">{{ emptyText || '暂无数据' }}</div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="chart-error">
        <div class="error-icon">⚠️</div>
        <div class="error-text">{{ error || '加载失败' }}</div>
        <el-button size="small" @click="handleRetry">重试</el-button>
      </div>

      <!-- 图表区域 -->
      <div v-else class="chart-wrapper">
        <div
          ref="chartRef"
          class="chart-instance"
          :style="{ width: '100%', height: '100%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

interface Props {
  title?: string
  subtitle?: string
  options: any
  loading?: boolean
  isEmpty?: boolean
  error?: string
  emptyText?: string
  height?: string
  showRefresh?: boolean
  theme?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  isEmpty: false,
  emptyText: '暂无数据',
  height: '350px',
  showRefresh: true,
  theme: 'default'
})

const emit = defineEmits<{
  refresh: []
  retry: []
  'chart-ready': [chart: any]
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: any = null

// 图表高度
const chartHeight = computed(() => props.height)

// 检查图表配置是否有效
const isValidOptions = (options: any) => {
  return options &&
         typeof options === 'object' &&
         Object.keys(options).length > 0 &&
         (options.series || options.xAxis || options.yAxis || options.data)
}

// 优化版图表初始化 - 减少重试和等待时间
const initChart = async () => {
  if (!isValidOptions(props.options) || !chartRef.value) {
    return
  }

  await nextTick()

  try {
    // 如果已有实例，先销毁
    if (chartInstance) {
      chartInstance.dispose()
    }

    // 创建新实例
    chartInstance = echarts.init(chartRef.value, props.theme)

    // 设置图表配置
    chartInstance.setOption(props.options, true)

    // 触发就绪事件
    emit('chart-ready', chartInstance)

  } catch (error) {
    console.error('图表初始化失败:', error)
  }
}

// 更新图表
const updateChart = () => {
  if (!chartInstance || !isValidOptions(props.options)) {
    return
  }

  try {
    chartInstance.setOption(props.options, true)
  } catch (error) {
    console.error('图表更新失败:', error)
  }
}

// 调整大小
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 清理资源
const cleanup = () => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}

// 处理刷新
const handleRefresh = () => {
  emit('refresh')
}

// 处理重试
const handleRetry = () => {
  emit('retry')
}

// 监听配置变化 - 使用防抖
let updateTimer: number | null = null
watch(() => props.options, () => {
  if (updateTimer) {
    clearTimeout(updateTimer)
  }
  updateTimer = window.setTimeout(() => {
    updateChart()
  }, 100)
}, { deep: true })

// 监听加载状态
watch(() => props.loading, (newVal) => {
  if (!newVal && isValidOptions(props.options)) {
    nextTick(() => {
      if (!chartInstance) {
        initChart()
      } else {
        updateChart()
      }
    })
  }
})

onMounted(() => {
  nextTick(() => {
    if (!props.loading && isValidOptions(props.options)) {
      initChart()
    }
  })

  // 监听窗口大小变化
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  cleanup()
  window.removeEventListener('resize', resizeChart)
  if (updateTimer) {
    clearTimeout(updateTimer)
  }
})

// 暴露方法
defineExpose({
  getChartInstance: () => chartInstance,
  resize: resizeChart,
  refresh: initChart
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.chart-container-optimized {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;

  &--loading {
    pointer-events: none;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);

  .header-left {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .chart-title {
    margin: 0;
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }

  .chart-subtitle {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }

  .header-right {
    display: flex;
    gap: var(--spacing-sm);
  }
}

.chart-content {
  flex: 1;
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: 40px;

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border-color);
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
}

.chart-empty,
.chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: 40px;

  .empty-icon,
  .error-icon {
    font-size: var(--text-5xl);
    opacity: 0.6;
  }

  .empty-text,
  .error-text {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
}

.chart-wrapper {
  width: 100%;
  height: 100%;

  .chart-instance {
    width: 100% !important;
    height: 100% !important;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .chart-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;

    .header-right {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }
  }

  .chart-content {
    min-height: 150px;
  }
}
</style>