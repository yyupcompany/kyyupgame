<!--
  AI助手独立页面 - 头部组件
  显示标题、状态、Token用量等信息
  支持鼠标悬停延迟展开/缩小
-->

<template>
  <el-card
    class="full-page-header"
    :class="{ 'is-expanded': isExpanded }"
    shadow="never"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="header-content">
      <!-- 左侧信息 -->
      <div class="header-left">
        <img src="/logo.png" alt="Logo" class="header-logo" :title="'AI 园长助理'" />
        <div class="header-title-row">
          <span class="header-title">AI园长助理</span>
          <!-- 绿色呼吸灯 -->
          <div class="breathing-light" />
        </div>
        <div class="header-text">
          <div class="title-row">
            <h2 class="page-title">AI 智能助手</h2>
            <el-tag type="success" size="small" effect="plain">24小时在线</el-tag>
          </div>
          <p class="page-subtitle">{{ subtitle }}</p>
          <div class="status-meta">
            <span>{{ mode }}</span>
            <span class="status-dot" />
            <span>{{ features }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧操作 -->
      <div class="header-right">
        <!-- 功能按钮组 -->
        <div class="function-buttons">
          <!-- 天气组件 -->
          <WeatherWidget @click="handleWeatherClick" />

          <!-- 动态时间组件 -->
          <DynamicTime @click="handleTimeClick" />

          <!-- 主题切换按钮 -->
          <el-button
            circle
            @click="toggleTheme"
            :title="currentTheme === 'dark' ? '切换到明亮主题' : '切换到暗黑主题'"
            class="action-btn theme-btn"
          >
            <UnifiedIcon :name="currentTheme === 'dark' ? 'sun' : 'moon'" :size="16" />
          </el-button>

          <!-- 浏览器全屏按钮 -->
          <el-button
            circle
            @click="toggleBrowserFullscreen"
            :title="isBrowserFullscreen ? '退出浏览器全屏' : '进入浏览器全屏'"
            class="action-btn fullscreen-btn"
          >
            <UnifiedIcon :name="isBrowserFullscreen ? 'compress' : 'expand'" :size="16" />
          </el-button>

          <!-- 关闭按钮 -->
          <el-button
            circle
            @click="handleClose"
            title="关闭全屏页面 (ESC)"
            class="action-btn close-btn"
          >
            <UnifiedIcon name="close" :size="16" />
          </el-button>

          <!-- 折叠侧边栏按钮 -->
          <el-button
            circle
            @click="emit('toggle-sidebar')"
            title="切换侧边栏"
            class="toggle-btn"
          >
            <UnifiedIcon :name="sidebarCollapsed ? 'expand' : 'compress'" :size="18" />
          </el-button>
        </div>

        <!-- Token用量显示 - 只在展开时显示 -->
        <div class="usage-progress" v-show="isExpanded">
          <TokenUsageCircle
            :size="32"
            :stroke-width="3"
            :fontSize="10"
            :animate-on-change="true"
            :update-interval="30000"
          />
          <div class="usage-detail">
            <span class="usage-label">今日用量</span>
            <span class="usage-value">{{ usageLabel }}</span>
            <el-progress class="usage-bar" :percentage="usagePercent" :show-text="false" />
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import TokenUsageCircle from '../../components/TokenUsageCircle.vue'
import WeatherWidget from '../../components/WeatherWidget.vue'
import DynamicTime from '../../components/DynamicTime.vue'
import { currentTheme as globalTheme, toggleTheme as toggleAppTheme } from '@/utils/theme'


interface Props {
  subtitle?: string
  mode?: string
  features?: string
  usageLabel?: string
  usagePercent?: number
  sidebarCollapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '智能管理,让幼儿园运营更轻松',
  mode: '服务100+幼儿园',
  features: '累计分析10万+数据',
  usageLabel: '0 / 100,000',
  usagePercent: 0,
  sidebarCollapsed: false
})

interface Emits {
  'toggle-sidebar': []
  'close-fullpage': []
  'toggle-theme': []
}

const emit = defineEmits<Emits>()
const router = useRouter()

// 头部展开状态
const isExpanded = ref(false)

// 浏览器全屏状态
const isBrowserFullscreen = ref(false)

// 当前主题（使用全局主题系统）
const currentTheme = ref(globalTheme.value)

// 延迟计时器
let expandTimer: number | null = null

// 处理鼠标进入 - 延迟500ms展开（原2秒太慢）
const handleMouseEnter = () => {
  if (expandTimer !== null) {
    clearTimeout(expandTimer)
  }

  expandTimer = window.setTimeout(() => {
    isExpanded.value = true
  }, 500)
}

// 处理鼠标离开 - 延迟800ms缩小（原2秒太慢）
const handleMouseLeave = () => {
  if (expandTimer !== null) {
    clearTimeout(expandTimer)
  }

  expandTimer = window.setTimeout(() => {
    isExpanded.value = false
  }, 800)
}

// 处理关闭按钮点击
const handleClose = () => {
  emit('close-fullpage')
  // 也可以使用路由导航回到上一页或主页
  router.back()
}

// 切换浏览器全屏
const toggleBrowserFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isBrowserFullscreen.value = true
    }).catch((err) => {
      console.error('无法进入全屏模式:', err)
    })
  } else {
    document.exitFullscreen().then(() => {
      isBrowserFullscreen.value = false
    }).catch((err) => {
      console.error('无法退出全屏模式:', err)
    })
  }
}

// 切换主题（使用全局主题系统）
const toggleTheme = () => {
  toggleAppTheme()
  currentTheme.value = globalTheme.value

  emit('toggle-theme')
  ElMessage.success(
    currentTheme.value === 'dark'
      ? '已切换到暗黑主题'
      : '已切换到明亮主题'
  )
}

// 处理天气组件点击
const handleWeatherClick = () => {
  console.log('🌤️ [FullPageHeader] 点击天气组件')
  // 可以添加打开天气详情的功能
  ElMessage.info('天气详情功能开发中...')
}

// 处理时间组件点击
const handleTimeClick = () => {
  console.log('🕐 [FullPageHeader] 点击时间组件')
  // 可以添加打开时钟或日程的功能
  ElMessage.info('时钟和日程功能开发中...')
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isBrowserFullscreen.value = !!document.fullscreenElement
}

// 监听ESC键
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    handleClose()
  }
}

// 组件挂载时添加事件监听
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('keydown', handleKeyDown)
})

// 组件卸载时清理
onUnmounted(() => {
  if (expandTimer !== null) {
    clearTimeout(expandTimer)
  }

  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入

.full-page-header {
  border: none;
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  /* 移除模糊效果，确保暗黑主题下清晰 */
  border: 1px solid var(--border-color-light);

  // 未展开时高度20px，展开后自动扩展
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: padding, min-height;

  :deep(.el-card__body) {
    // ✨ 修复：默认状态最小高度 48px，符合可点击区域标准
    padding: var(--spacing-sm) var(--spacing-md);
    min-height: 48px;
    transition: padding 0.4s cubic-bezier(0.4, 0, 0.2, 1), min-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  // 展开状态
  &.is-expanded {
    :deep(.el-card__body) {
      padding: var(--spacing-md) var(--spacing-xl);
      min-height: 80px;
      background: var(--bg-card);
    }
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-light);
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  /* ✨ 修复：默认最小高度 48px，展开后 72px */
  min-height: 48px;
  transition: min-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  .full-page-header.is-expanded & {
    min-height: 72px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  min-width: 0;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  .full-page-header.is-expanded & {
    width: 32px;
    height: 32px;
    transform: scale(1.05);
  }
}

// Logo旁边的标题行
.header-title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  overflow: hidden;
}

.header-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  transition: font-size 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  .full-page-header.is-expanded & {
    font-size: var(--text-base);
  }
}

// 状态呼吸灯
.breathing-light {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success-color);
  flex-shrink: 0;
  animation: breathingPulse 2s ease-in-out infinite;
  box-shadow: 0 0 8px var(--success-color-rgb, rgba(34, 197, 94, 0.6));
}

.header-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.header-text {
  flex: 1;
  min-width: 0;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 200px;
  overflow: hidden;

  .full-page-header:not(.is-expanded) & {
    max-height: 0;
    opacity: 0;
    visibility: hidden;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }

  .page-title {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    transition: font-size 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .page-subtitle {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .status-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    animation: slideDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .status-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--primary-color);
    display: inline-flex;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.function-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color-light);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  transition: all 0.3s var(--ai-transition-bounce);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--primary-light);
    color: var(--primary-color);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 12px var(--ai-primary-glow);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  // 特殊按钮样式
  &.theme-btn:hover {
    background: var(--primary-color-light);
    border-color: var(--primary-color);
    color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  }

  &.fullscreen-btn:hover {
    background: var(--success-color-light);
    border-color: var(--success-color);
    color: var(--success-color);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
  }

  &.close-btn:hover {
    background: var(--danger-color-light);
    border-color: var(--danger-color);
    color: var(--danger-color);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  }
}

.toggle-btn {
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-color-light);
  background: var(--bg-card);
  color: var(--primary-color);
  /* ✨ 优化：增强过渡动画 */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    background: var(--primary-color-light);
    border-color: var(--primary-color);
    /* ✨ 优化：轻微上浮和发光效果 */
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
}

.usage-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  min-width: 240px;
}

.usage-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.usage-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.usage-value {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.usage-bar {
  width: 100%;

  :deep(.el-progress-bar__inner) {
    border-radius: var(--radius-full);
  }
}

.toggle-btn {
  flex-shrink: 0;

  :deep(.el-button) {
    padding: 0;
  }
}

// 动画
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 状态呼吸灯动画 - 脉冲效果
@keyframes breathingPulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 8px var(--success-color-rgb, rgba(34, 197, 94, 0.6));
  }
  50% {
    opacity: 0.4;
    box-shadow: 0 0 12px var(--success-color-rgb-light, rgba(34, 197, 94, 0.2));
  }
}

/* 响应式 */
@media (max-width: var(--breakpoint-md)) {
  :global([data-theme="dark"]) .full-page-header,
  :global(.theme-dark) .full-page-header {
    background: var(--bg-card-dark);
  }

  .header-content {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .header-right {
    gap: var(--spacing-sm);
  }

  .function-buttons {
    gap: var(--spacing-xs);
  }

  /* ✨ 修复：移动端按钮最小尺寸 44px，符合 iOS/Android 触摸标准 */
  .action-btn {
    width: 44px;
    height: 44px;

    :deep(.el-icon) {
      font-size: var(--text-base);
    }
  }

  .toggle-btn {
    width: 44px;
    height: 44px;
  }

  .usage-progress {
    min-width: auto;
  }

  // 在移动端隐藏部分组件以节省空间
  .weather-widget,
  .dynamic-time {
    :deep(.weather-info .location),
    :deep(.time-display) {
      display: none;
    }
  }
}
</style>

