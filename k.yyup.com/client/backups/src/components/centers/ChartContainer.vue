<template>
  <div class="chart-container" :class="{ 'chart-container--loading': loading }">
    <!-- 图表头部 -->
    <div class="chart-header" v-if="title || $slots.header">
      <div class="header-left">
        <h4 class="chart-title">{{ title }}</h4>
        <span v-if="subtitle" class="chart-subtitle">{{ subtitle }}</span>
      </div>
      <div class="header-right">
        <slot name="header-actions">
          <!-- 图表工具栏 -->
          <div class="chart-tools">
            <el-tooltip content="刷新数据" placement="top">
              <el-button
                size="small"
                :icon="Refresh"
                @click="$emit('refresh')"
                :loading="loading"
              />
            </el-tooltip>

            <el-dropdown @command="handleToolCommand" v-if="showTools">
              <el-button size="small" :icon="MoreFilled" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="download" :icon="Download">
                    下载图片
                  </el-dropdown-item>
                  <el-dropdown-item command="fullscreen" :icon="FullScreen">
                    全屏查看
                  </el-dropdown-item>
                  <el-dropdown-item command="settings" :icon="Setting">
                    图表设置
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </slot>
      </div>
    </div>

    <!-- 图表内容 -->
    <div class="chart-content" :style="{ height: chartHeight }">
      <!-- 加载状态 -->
      <div v-if="loading" class="chart-loading">
        <el-skeleton animated>
          <template #template>
            <div class="skeleton-chart">
              <div class="skeleton-bars">
                <div v-for="i in 6" :key="i" class="skeleton-bar" :style="{ height: `${Math.random() * 80 + 20}%` }"></div>
              </div>
              <div class="skeleton-axis"></div>
            </div>
          </template>
        </el-skeleton>
      </div>

      <!-- 空数据状态 -->
      <div v-else-if="isEmpty" class="chart-empty">
        <EmptyState
          type="no-data"
          :title="emptyText || '暂无图表数据'"
          description="当前没有可显示的数据，请检查数据源或筛选条件"
          size="medium"
          :primary-action="{
            text: '刷新数据',
            handler: () => $emit('retry')
          }"
        >
          <template #icon>
            <el-icon size="60" color="var(--text-disabled)">
              <TrendCharts />
            </el-icon>
          </template>
        </EmptyState>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="chart-error">
        <EmptyState
          type="error"
          title="图表加载失败"
          :description="error || '图表数据加载时发生错误，请稍后重试'"
          size="medium"
          :primary-action="{
            text: '重试',
            type: 'primary',
            handler: () => $emit('retry')
          }"
          :suggestions="[
            '检查网络连接是否正常',
            '确认数据源是否可用',
            '稍后再试或联系技术支持'
          ]"
          :show-suggestions="true"
        />
      </div>

      <!-- 图表区域 -->
      <div v-else class="chart-wrapper">
        <div
          ref="chartRef"
          class="chart-instance"
          :style="{ width: '100%', height: '100%' }"
        ></div>

        <!-- 图表遮罩层 -->
        <div v-if="chartLoading" class="chart-mask">
          <el-loading
            :visible="chartLoading"
            text="图表渲染中..."
            background="var(--white-alpha-80)"
          />
        </div>
      </div>
    </div>

    <!-- 图表底部 -->
    <div class="chart-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>

    <!-- 全屏对话框 -->
    <el-dialog
      v-model="fullscreenVisible"
      title="图表全屏查看"
      width="90%"
      :fullscreen="true"
      :show-close="true"
      append-to-body
    >
      <div class="fullscreen-chart" :style="{ height: '80vh' }">
        <div ref="fullscreenChartRef" style="width: 100%; height: 100%;"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Refresh, MoreFilled, Download, FullScreen, Setting, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import EmptyState from '@/components/common/EmptyState.vue'

interface Props {
  title?: string
  subtitle?: string
  options: any
  loading?: boolean
  chartLoading?: boolean
  isEmpty?: boolean
  error?: string
  emptyText?: string
  height?: string
  showTools?: boolean
  theme?: string
  autoResize?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  chartLoading: false,
  isEmpty: false,
  emptyText: '暂无数据',
  height: '400px',
  showTools: true,
  theme: 'default',
  autoResize: true
})

const emit = defineEmits<{
  refresh: []
  retry: []
  'chart-ready': [chart: any]
  'chart-click': [params: any]
  'chart-brush': [params: any]
}>()

const chartRef = ref<HTMLElement>()
const fullscreenChartRef = ref<HTMLElement>()
const fullscreenVisible = ref(false)

let chartInstance: any = null
let fullscreenChartInstance: any = null
let resizeObserver: ResizeObserver | null = null

// 图表高度
const chartHeight = ref(props.height)

// 检查图表配置是否有效 - 基于网上最佳实践
const isValidOptions = (options: any) => {
  return options &&
         typeof options === 'object' &&
         Object.keys(options).length > 0 &&
         (options.series || options.xAxis || options.yAxis || options.data)
}

// 统一对传入option做安全处理，避免标题/图例与图表重叠
const sanitizeChartOptions = (opt: any) => {
  try {
    const option = opt ? JSON.parse(JSON.stringify(opt)) : {}

    // 如果有 title，并且外层已显示标题，则默认隐藏 ECharts 内置标题
    if (option.title && (option.title.text || option.title.subtext)) {
      option.title = { ...option.title, show: false }
    }

    // 对饼图应用合理的 label/legend 默认
    if (Array.isArray(option.series)) {
      option.series = option.series.map((s: any) => {
        if (s && s.type === 'pie') {
          s.label = {
            ...(s.label || {}),
            show: true,
            position: 'outside',
            overflow: 'truncate',
            fontSize: 16,
            fontWeight: 'bold',
            lineHeight: 20,
            color: 'var(--color-gray-200)',
            distanceToLabelLine: 12,
            formatter: (params: any) => `${params.name}\n${params.value}人\n${params.percent}%`
          }
          s.labelLine = {
            ...(s.labelLine || {}),
            length: 28,
            length2: 22,
            smooth: true,
            lineStyle: { color: 'var(--color-gray-400)' }
          }
          s.labelLayout = { hideOverlap: true, moveOverlap: 'shiftY', ...(s.labelLayout || {}) }
          s.minShowLabelAngle = s.minShowLabelAngle ?? 10
        }
        return s
      })
    }

    return option
  } catch {
    return opt
  }
}


// 初始化图表 - 增强错误处理和DOM检查
const initChart = async () => {
  if (!isValidOptions(props.options)) {
    return
  }

  await nextTick()

  // 等待chartRef可用，最多重试3次
  let retryCount = 0
  const maxRetries = 3

  while (!chartRef.value && retryCount < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 100))
    retryCount++
  }

  const element = chartRef.value

  // 多重检查确保元素可用
  if (!element) {
    console.warn('图表容器元素不存在，已重试', retryCount, '次')
    return
  }

  // 检查元素是否已连接到DOM
  if (!element.isConnected) {
    console.warn('图表容器未连接到DOM，延迟初始化')
    await new Promise(resolve => setTimeout(resolve, 300))

    // 重新获取元素引用
    const currentElement = chartRef.value
    if (!currentElement || !currentElement.isConnected) {
      console.warn('图表容器延迟检查仍未连接，尝试强制初始化')
      // 不放弃，继续尝试初始化
    }
  }

  // 检查元素是否可见
  const rect = element.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    console.warn('图表容器尺寸为0，延迟初始化')
    await new Promise(resolve => setTimeout(resolve, 200))
    const newRect = element.getBoundingClientRect()
    if (newRect.width === 0 || newRect.height === 0) {
      console.error('图表容器尺寸仍为0，使用默认尺寸')
      element.style.width = '100%'
      element.style.height = props.height || '400px'
    }
  }

  // 等待DOM布局完成
  await new Promise(resolve => setTimeout(resolve, 100))

  try {
    // 销毁已存在的图表实例
    if (chartInstance) {
      chartInstance.dispose()
    }

    // 创建新的图表实例
    chartInstance = echarts.init(element, props.theme)

    // 设置图表配置（统一做防重叠处理 + 暗色主题可读性）
    const sanitized = sanitizeChartOptions(props.options)
    // 若未设置全局颜色，在暗色模式下应用一套更明亮的配色
    // 强制高对比配色，确保深色背景下清晰
    sanitized.color = sanitized.color ?? ['#4C7EFF', '#6EE7B7', 'var(--status-warning)', 'var(--status-error)', 'var(--status-info)', 'var(--status-success)']
    chartInstance.setOption(sanitized, true)

    // 绑定事件
    chartInstance.on('click', (params: any) => {
      emit('chart-click', params)
    })

    chartInstance.on('brush', (params: any) => {
      emit('chart-brush', params)
    })

    // 触发图表就绪事件
    emit('chart-ready', chartInstance)

    console.log('✅ 图表初始化成功')
  } catch (error) {
    console.error('❌ 图表初始化失败:', error)
  }
}

// 初始化全屏图表 - 简化版本
const initFullscreenChart = async () => {
  if (!fullscreenChartRef.value || !isValidOptions(props.options)) {
    return
  }

  await nextTick()

  // 等待对话框完全打开
  await new Promise(resolve => setTimeout(resolve, 200))

  try {
    if (fullscreenChartInstance) {
      fullscreenChartInstance.dispose()
    }

    fullscreenChartInstance = echarts.init(fullscreenChartRef.value, props.theme)
    fullscreenChartInstance.setOption(props.options, true)
  } catch (error) {
    console.error('全屏图表初始化失败:', error)
  }
}

// 更新图表 - 简化版本
const updateChart = () => {
  if (!chartInstance) {
    if (isValidOptions(props.options) && !props.loading) {
      nextTick(() => initChart())
    }
    return
  }

  if (isValidOptions(props.options)) {
    chartInstance.setOption(props.options, true)
  }
}

// 调整图表大小
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
  if (fullscreenChartInstance) {
    fullscreenChartInstance.resize()
  }
}

// 下载图表
const downloadChart = () => {
  if (!chartInstance) return

  try {
    const url = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: 'var(--bg-card)'
    })

    const link = document.createElement('a')
    link.href = url
    link.download = `${props.title || 'chart'}.png`
    link.click()

    ElMessage.success('图表下载成功')
  } catch (error) {
    ElMessage.error('图表下载失败')
  }
}

// 工具栏命令处理
const handleToolCommand = (command: string) => {
  switch (command) {
    case 'download':
      downloadChart()
      break
    case 'fullscreen':
      fullscreenVisible.value = true
      nextTick(() => {
        initFullscreenChart()
      })
      break
    case 'settings':
      ElMessage.info('图表设置功能开发中...')
      break
  }
}

// 设置自动调整大小 - 简化版本
const setupAutoResize = () => {
  if (!props.autoResize) return

  // 只监听窗口大小变化，避免ResizeObserver的复杂性
  window.addEventListener('resize', resizeChart)
}

// 清理资源
const cleanup = () => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

  if (fullscreenChartInstance) {
    fullscreenChartInstance.dispose()
    fullscreenChartInstance = null
  }

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  window.removeEventListener('resize', resizeChart)
}

// 监听配置变化 - 简化版本
watch(() => props.options, (newOptions) => {
  if (!props.loading && isValidOptions(newOptions)) {
    updateChart()
  }
}, { deep: true })

// 监听加载状态 - 简化版本
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

// 监听高度变化
watch(() => props.height, (newVal) => {
  chartHeight.value = newVal
  nextTick(() => {
    resizeChart()
  })
})

onMounted(async () => {
  // 等待DOM完全渲染
  await nextTick()

  // 额外等待确保元素完全可用
  await new Promise(resolve => setTimeout(resolve, 50))

  if (!props.loading && isValidOptions(props.options)) {
    initChart()
  }
  setupAutoResize()
})

onUnmounted(() => {
  cleanup()
})

// 暴露方法
defineExpose({
  getChartInstance: () => chartInstance,
  resize: resizeChart,
  refresh: initChart,
  download: downloadChart
})
</script>

<style scoped lang="scss">
// 导入全局样式变量
@import '@/styles/design-tokens.scss';

.chart-container {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden; /* 恢复容器边界控制 */

  &--loading {
    pointer-events: none;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-lg) var(--text-2xl);
  border-bottom: var(--border-width-base) solid var(--border-color);
  background: var(--bg-tertiary);

  .header-left {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .chart-title {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
  }

  .chart-subtitle {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .header-right {
    .chart-tools {
      display: flex;
      gap: var(--spacing-sm);
    }
  }
}

.chart-content {
  flex: 1;
  position: relative;
  overflow: hidden; /* 恢复正常溢出控制 */
  min-height: 600px; /* 增加最小高度以显示更完整的图表 */
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl); /* 减少内边距 */
}

.chart-loading {
  padding: var(--text-2xl);

  .skeleton-chart {
    height: 100%;
    display: flex;
    flex-direction: column;

    .skeleton-bars {
      flex: 1;
      display: flex;
      align-items: flex-end;
      gap: var(--spacing-sm);
      padding: var(--text-2xl) 0;

      .skeleton-bar {
        flex: 1;
        background: var(--bg-tertiary);
        border-radius: var(--radius-xs);
        animation: skeleton-loading 1.5s ease-in-out infinite;
      }
    }

    .skeleton-axis {
      height: var(--border-width-base);
      background: var(--border-color);
    }
  }
}

.chart-empty,
.chart-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.chart-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 600px;

  .chart-instance {
    position: relative;
    z-index: 1;
    width: 100% !important;
    height: 100% !important;
    min-height: 600px !important;
    min-width: 500px !important;
  }

  .chart-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
  }
}

.chart-footer {
  padding: var(--text-lg) var(--text-2xl);
  border-top: var(--border-width-base) solid var(--border-color);
  background: var(--bg-tertiary);
}

.fullscreen-chart {
  width: 100%;
}

@keyframes skeleton-loading {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .chart-header {
    flex-direction: column;
    gap: var(--text-sm);
    align-items: flex-start;

    .header-right {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
