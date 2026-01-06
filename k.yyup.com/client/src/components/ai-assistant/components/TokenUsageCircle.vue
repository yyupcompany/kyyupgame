<template>
  <div
    class="token-usage-circle"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <!-- SVG 用量圆圈 -->
    <svg
      :width="size"
      :height="size"
      class="usage-circle"
      :class="{ 'pulse-animation': isAnimating }"
    >
      <!-- 背景圆圈（空心） -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="backgroundColor"
        :stroke-width="strokeWidth"
      />

      <!-- 用量圆圈（实心部分） -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="usageColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        class="usage-progress"
        :style="progressStyle"
      />

      <!-- 中心文字 -->
      <text
        :x="size / 2"
        :y="size / 2"
        text-anchor="middle"
        dominant-baseline="middle"
        :font-size="fontSize"
        :fill="textColor"
        class="usage-text"
      >
        {{ Math.round(usagePercentage) }}%
      </text>
    </svg>

    <!-- 悬停提示框 -->
    <transition name="tooltip-fade">
      <div
        v-if="showTooltip && tooltipData"
        class="usage-tooltip"
        :class="{ 'tooltip-left': tooltipPosition === 'left', 'tooltip-right': tooltipPosition === 'right' }"
      >
        <div class="tooltip-header">
          <h4>Token 使用情况</h4>
        </div>
        <div class="tooltip-content">
          <div class="usage-item">
            <span class="label">总计限制:</span>
            <span class="value">{{ formatNumber(tooltipData.totalLimit) }} tokens</span>
          </div>
          <div class="usage-item">
            <span class="label">已使用:</span>
            <span class="value used">{{ formatNumber(tooltipData.used) }} tokens</span>
          </div>
          <div class="usage-item">
            <span class="label">使用率:</span>
            <span class="value percentage">{{ usagePercentage }}%</span>
          </div>
          <div class="usage-item">
            <span class="label">预估成本:</span>
            <span class="value cost">¥{{ tooltipData.estimatedCost }}</span>
          </div>
        </div>
        <div class="tooltip-footer">
          <div class="status-indicator" :class="getStatusClass()">
            {{ getStatusText() }}
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface TokenUsageData {
  totalLimit: number
  used: number
  estimatedCost: number
  lastUpdated: string
}

interface Props {
  size?: number
  strokeWidth?: number
  fontSize?: number
  backgroundColor?: string
  usageColor?: string
  textColor?: string
  tooltipPosition?: 'left' | 'right' | 'top' | 'bottom'
  animateOnChange?: boolean
  updateInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 60,
  strokeWidth: 4,
  fontSize: 12,
  backgroundColor: 'var(--border-color)',
  usageColor: 'var(--primary-color)',
  textColor: 'var(--color-gray-700)',
  tooltipPosition: 'right',
  animateOnChange: true,
  updateInterval: 30000 // 30秒更新一次
})

// 响应式数据
const showTooltip = ref(false)
const isAnimating = ref(false)
const tooltipData = ref<TokenUsageData | null>(null)
const usagePercentage = ref(0)

// 计算属性
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => {
  const progress = usagePercentage.value / 100
  return circumference.value * (1 - progress)
})

const progressStyle = computed(() => ({
  transition: props.animateOnChange ? 'stroke-dashoffset 0.5s ease-in-out' : 'none',
  transform: 'rotate(-90deg)',
  transformOrigin: '50% 50%'
}))

const usageColor = computed(() => {
  const percentage = usagePercentage.value
  if (percentage >= 90) return 'var(--danger-color)' // 红色
  if (percentage >= 70) return 'var(--warning-color)' // 橙色
  if (percentage >= 50) return '#eab308' // 黄色
  return props.usageColor // 默认蓝色
})

// 定时器
let updateTimer: NodeJS.Timeout | null = null

// 方法
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const getStatusClass = (): string => {
  const percentage = usagePercentage.value
  if (percentage >= 90) return 'status-danger'
  if (percentage >= 70) return 'status-warning'
  if (percentage >= 50) return 'status-caution'
  return 'status-normal'
}

const getStatusText = (): string => {
  const percentage = usagePercentage.value
  if (percentage >= 90) return '使用量过高'
  if (percentage >= 70) return '使用量较高'
  if (percentage >= 50) return '使用正常'
  return '使用量较低'
}

const fetchTokenUsage = async () => {
  try {
    // 🔧 修复：检查用户是否已登录，未登录时不请求Token统计
    const token = localStorage.getItem('kindergarten_token') || localStorage.getItem('token')

    if (!token) {
      // 未登录时，设置默认值，不显示错误
      if (!tooltipData.value) {
        tooltipData.value = {
          totalLimit: 100000,
          used: 0,
          estimatedCost: 0,
          lastUpdated: new Date().toISOString()
        }
      }
      return
    }

    // 调用 Token 监控 API
    const response = await fetch('/api/ai/token-monitor/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      // 🔧 修复：401错误时静默处理，不在控制台显示错误
      if (response.status === 401) {
        console.log('⚠️ [Token圆圈] 未登录或Token已过期，使用默认值')
      } else {
        console.warn('⚠️ [Token圆圈] 获取用量数据失败:', response.status, response.statusText)
      }

      // 设置默认值
      if (!tooltipData.value) {
        tooltipData.value = {
          totalLimit: 100000,
          used: 0,
          estimatedCost: 0,
          lastUpdated: new Date().toISOString()
        }
      }
      return
    }

    const data = await response.json()

    if (data.success && data.data) {
      const stats = data.data
      const dailyUsage = stats.dailyUsage || []
      const totalToday = dailyUsage.reduce((sum: number, usage: any) => sum + usage.totalTokens, 0)

      // 假设每日限制为 100,000 tokens
      const totalLimit = 100000

      const newTooltipData: TokenUsageData = {
        totalLimit,
        used: totalToday,
        estimatedCost: stats.costEstimate?.daily || 0,
        lastUpdated: new Date().toISOString()
      }

      const newPercentage = (totalToday / totalLimit) * 100

      // 检查是否需要动画
      if (props.animateOnChange && Math.abs(newPercentage - usagePercentage.value) > 1) {
        isAnimating.value = true
        setTimeout(() => {
          isAnimating.value = false
        }, 500)
      }

      tooltipData.value = newTooltipData
      usagePercentage.value = Math.min(newPercentage, 100) // 不超过100%

      console.log('📊 [Token圆圈] 更新用量数据:', {
        used: totalToday,
        percentage: usagePercentage.value.toFixed(1),
        cost: newTooltipData.estimatedCost
      })
    }
  } catch (error) {
    // 🔧 修复：网络错误时静默处理，不在控制台显示错误
    console.log('⚠️ [Token圆圈] 获取用量数据失败，使用默认值')

    // 设置默认值以防API失败
    if (!tooltipData.value) {
      tooltipData.value = {
        totalLimit: 100000,
        used: 0,
        estimatedCost: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }
}

// 生命周期
onMounted(() => {
  // 初始化数据
  fetchTokenUsage()

  // 设置定时更新
  if (props.updateInterval > 0) {
    updateTimer = setInterval(fetchTokenUsage, props.updateInterval)
  }
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})

// 监听props变化
watch(() => props.updateInterval, (newInterval) => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }

  if (newInterval > 0) {
    updateTimer = setInterval(fetchTokenUsage, newInterval)
  }
})
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入
.token-usage-circle {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.usage-circle {
  filter: drop-shadow(0 var(--border-width-base) 2px var(--shadow-light));
  transition: transform 0.2s ease;
}

.usage-circle:hover {
  transform: scale(1.05);
}

.usage-progress {
  transition: stroke 0.3s ease;
}

.usage-text {
  font-weight: 600;
  font-family: 'Inter', system-ui, sans-serif;
  user-select: none;
}

.pulse-animation {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 提示框样式 */
.usage-tooltip {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 var(--spacing-xs) var(--spacing-xl) var(--shadow-medium);
  border: var(--border-width) solid var(--border-color);
  padding: 0;
  min-max-width: 200px; width: 100%;
  z-index: var(--z-index-dropdown)px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.tooltip-right {
  left: calc(100% + var(--text-sm));
}

.tooltip-left {
  right: calc(100% + var(--text-sm));
}

.tooltip-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%);
  color: var(--text-on-primary);
  padding: var(--text-sm) var(--text-lg);
  font-size: var(--text-base);
}

.tooltip-header h4 {
  margin: 0;
  font-weight: 600;
  font-size: var(--text-base);
}

.tooltip-content {
  padding: var(--text-lg);
}

.usage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-sm);
}

.usage-item:last-child {
  margin-bottom: 0;
}

.usage-item .label {
  color: var(--text-secondary);
  font-weight: 500;
}

.usage-item .value {
  font-weight: 600;
  color: var(--text-primary);
}

.usage-item .value.used {
  color: var(--primary-color);
}

.usage-item .value.percentage {
  color: var(--success-color);
}

.usage-item .value.cost {
  color: var(--danger-color);
}

.tooltip-footer {
  background: var(--bg-primary);
  padding: var(--text-sm) var(--text-lg);
  border-top: var(--z-index-dropdown) solid var(--border-color);
}

.status-indicator {
  font-size: var(--text-sm);
  font-weight: 600;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  text-align: center;
}

.status-normal {
  background: #dcfce7;
  color: var(--success-color);
}

.status-caution {
  background: #fef3c7;
  color: var(--warning-color);
}

.status-warning {
  background: #fed7aa;
  color: var(--warning-color);
}

.status-danger {
  background: #fee2e2;
  color: var(--danger-color);
}

/* 动画效果 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all var(--transition-fast) ease;
}

.tooltip-fade-enter-from {
  opacity: 0;
  transform: translateY(-50%) scale(0.9);
}

.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) scale(0.9);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .usage-tooltip {
    min-max-width: 180px; width: 100%;
    font-size: var(--text-sm);
  }

  .tooltip-header {
    padding: var(--spacing-2xl) var(--text-sm);
  }

  .tooltip-content {
    padding: var(--text-sm);
  }

  .usage-item {
    font-size: var(--text-sm);
    margin-bottom: var(--spacing-lg);
  }
}
</style>