<!--
  动态时间组件
  显示当前系统时间，精确到分钟，实时更新
-->

<template>
  <div class="dynamic-time" :title="timeTooltip">
    <div class="time-content">
      <!-- 时间图标 -->
      <div class="time-icon">
        <UnifiedIcon name="clock" :size="14" />
      </div>

      <!-- 时间显示 -->
      <div class="time-display">
        <span class="current-time">{{ formattedTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

const currentTime = ref(new Date())

// 更新间隔（每分钟更新一次）
const UPDATE_INTERVAL = 60 * 1000
let updateTimer: number | null = null

// 格式化时间显示
const formattedTime = computed(() => {
  const time = currentTime.value
  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
})

// 时间提示文本（包含完整日期和星期）
const timeTooltip = computed(() => {
  const time = currentTime.value

  // 星期几
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekDay = weekDays[time.getDay()]

  // 格式化日期
  const year = time.getFullYear()
  const month = (time.getMonth() + 1).toString().padStart(2, '0')
  const day = time.getDate().toString().padStart(2, '0')
  const fullDate = `${year}-${month}-${day}`

  return `${fullDate} ${weekDay} ${formattedTime.value}`
})

// 更新时间
const updateTime = () => {
  currentTime.value = new Date()
}

// 组件挂载时启动定时器
onMounted(() => {
  // 立即更新一次时间
  updateTime()

  // 计算下一分钟的开始时间
  const now = new Date()
  const nextMinute = new Date(now)
  nextMinute.setSeconds(0)
  nextMinute.setMilliseconds(0)
  nextMinute.setMinutes(now.getMinutes() + 1)

  // 计算到下一分钟的延迟时间
  const delay = nextMinute.getTime() - now.getTime()

  // 延迟到下一分钟开始定时更新
  setTimeout(() => {
    updateTime()
    updateTimer = window.setInterval(updateTime, UPDATE_INTERVAL)
  }, delay)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
})
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入

.dynamic-time {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px; // 🔧 与右侧按钮高度保持一致
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color-light);
  cursor: pointer;
  transition: all var(--transition-base);
  min-width: 90px; // 🔧 增加最小宽度
  max-width: 120px; // 🔧 增加最大宽度
  flex-shrink: 0;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.time-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
}

.time-icon {
  flex-shrink: 0;
  color: var(--primary-color);
}

.time-display {
  flex: 1;
  min-width: 0;
}

.current-time {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .dynamic-time {
    min-width: 60px;
    max-width: 80px;
    padding: var(--spacing-xs);
  }

  .current-time {
    font-size: var(--text-xs);
  }
}
</style>