<template>
  <div class="header-actions">
    <!-- 企业仪表盘按钮 -->
    <button
      class="header-action-btn dashboard-btn"
      @click="openEnterpriseDashboard"
      title="企业仪表盘"
    >
      <el-icon>
        <DataAnalysis />
      </el-icon>
      <span class="dashboard-badge">仪表盘</span>
    </button>

    <!-- AI助手按钮 -->
    <button
      class="header-action-btn ai-assistant-btn"
      @click="openAIAssistant"
      title="AI助手"
    >
      <el-icon>
        <ChatDotRound />
      </el-icon>
      <span class="ai-badge">AI</span>
    </button>

    <!-- 全屏按钮 -->
    <button
      class="header-action-btn"
      @click="toggleFullscreen"
      title="全屏切换"
      :disabled="!supportsFullscreen"
    >
      <el-icon>
        <component :is="isFullscreen ? 'Aim' : 'FullScreen'" />
      </el-icon>
    </button>
    
    <!-- 主题切换按钮 -->
    <div class="theme-selector">
      <button 
        class="header-action-btn" 
        @click="toggleThemeDropdown" 
        title="主题切换"
      >
        <el-icon><Sunny /></el-icon>
      </button>
      
      <!-- 主题下拉菜单 - 懒加载 -->
      <div v-if="showThemeDropdown" class="theme-dropdown">
        <div 
          v-for="theme in themes" 
          :key="theme.value"
          class="theme-option"
          :class="{ active: currentTheme === theme.value }"
          @click="changeTheme(theme.value)"
        >
          <div class="theme-color" :style="{ backgroundColor: theme.color }"></div>
          <span class="theme-name">{{ theme.name }}</span>
        </div>
      </div>
    </div>

    <!-- 性能指示器（开发环境） -->
    <div v-if="isDev" class="performance-indicator" :class="performanceLevel">
      <el-icon><Odometer /></el-icon>
      <span class="performance-text">{{ performanceScore }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Sunny, FullScreen, Aim, Odometer, ChatDotRound, DataAnalysis } from '@element-plus/icons-vue'
import { performanceMonitor } from '../../utils/performance-monitor'
import { useRouter } from 'vue-router'

// 路由
const router = useRouter()

// 响应式状态
const isFullscreen = ref(false)
const showThemeDropdown = ref(false)
const currentTheme = ref('dark')
const performanceScore = ref(100)

// 配置
const isDev = process.env.NODE_ENV === 'development'
const supportsFullscreen = 'requestFullscreen' in document.documentElement

// 主题配置
const themes = ref([
  { name: '明亮', value: 'light', color: 'var(--primary-color)' },
  { name: '暗黑', value: 'dark', color: 'var(--primary-color)' }
])

// 计算属性
const performanceLevel = computed(() => {
  if (performanceScore.value >= 90) return 'excellent'
  if (performanceScore.value >= 70) return 'good'
  if (performanceScore.value >= 50) return 'fair'
  return 'poor'
})

/**
 * 企业仪表盘功能
 */
const openEnterpriseDashboard = (): void => {
  router.push('/dashboard/enterprise')
}

/**
 * AI助手功能
 */
const openAIAssistant = (): void => {
  router.push('/ai/AIAssistantPage')
}

/**
 * 全屏功能
 */
const toggleFullscreen = async (): Promise<void> => {
  if (!supportsFullscreen) return
  
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      isFullscreen.value = true
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  } catch (error) {
    console.error('全屏切换失败:', error)
  }
}

/**
 * 监听全屏状态变化
 */
const handleFullscreenChange = (): void => {
  isFullscreen.value = !!document.fullscreenElement
}

/**
 * 主题切换功能
 */
const toggleThemeDropdown = (): void => {
  showThemeDropdown.value = !showThemeDropdown.value
}

const changeTheme = (theme: string): void => {
  currentTheme.value = theme
  showThemeDropdown.value = false

  // 统一：清理并设置 html/body 的主题类
  document.documentElement.classList.remove('theme-light', 'theme-dark')
  document.body.classList.remove('theme-light', 'theme-dark')

  // 统一：添加作用域类并切换明暗
  document.body.classList.add('theme-workbench')
  if (theme === 'dark') {
    document.documentElement.classList.add('theme-dark')
    document.body.classList.add('theme-dark')
  } else {
    document.documentElement.classList.add(`theme-${theme}`)
    document.body.classList.add('theme-light')
  }

  // 持久化主题设置（兼容两个key）
  localStorage.setItem('theme', theme)
  localStorage.setItem('app_theme', theme === 'dark' ? 'dark' : 'light')

  console.log(`🎨 主题已切换: ${theme}`)
}

/**
 * 点击外部关闭主题下拉菜单
 */
const handleClickOutside = (event: Event): void => {
  const target = event.target as Element
  if (!target.closest('.theme-selector')) {
    showThemeDropdown.value = false
  }
}

/**
 * 更新性能分数
 */
const updatePerformanceScore = (): void => {
  if (!isDev) return
  
  const report = performanceMonitor.getPerformanceReport()
  performanceScore.value = report.currentScore
}

// 生命周期
onMounted(() => {
  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && themes.value.some(t => t.value === savedTheme)) {
    changeTheme(savedTheme)
  } else {
    changeTheme('dark')
  }
  
  // 初始化全屏状态
  isFullscreen.value = !!document.fullscreenElement
  
  // 监听全屏状态变化
  if (supportsFullscreen) {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
  }
  
  // 监听点击外部关闭下拉菜单
  document.addEventListener('click', handleClickOutside)
  
  // 开发环境：监听性能变化
  if (isDev) {
    const performanceTimer = setInterval(updatePerformanceScore, 5000)
    
    onUnmounted(() => {
      clearInterval(performanceTimer)
    })
  }
})

onUnmounted(() => {
  if (supportsFullscreen) {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--spacing-2xl);
  height: var(--spacing-2xl);
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;

  &:hover:not(:disabled) {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.dashboard-btn {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color) 100%);
    color: white;
    width: auto;
    padding: 0 var(--text-sm);
    gap: var(--spacing-lg);

    &:hover {
      background: linear-gradient(135deg, #3b8ff7 0%, #2563eb 100%);
      transform: translateY(-var(--border-width-base));
      box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(64, 158, 255, 0.4);
    }
  }

  &.ai-assistant-btn {
    background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-var(--border-width-base));
      box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(102, 126, 234, 0.4);
    }
  }
}

.dashboard-badge {
  font-size: var(--text-sm);
  font-weight: 500;
  white-space: nowrap;
}

.ai-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  color: white;
  font-size: var(--spacing-sm);
  font-weight: bold;
  padding: var(--spacing-xs) 3px;
  border-radius: var(--radius-md);
  line-height: 1;
  box-shadow: 0 var(--border-width-base) 3px var(--shadow-heavy);
}

.theme-selector {
  position: relative;
}

.theme-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-sm);
  background-color: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-sm);
  min-width: 120px;
  z-index: 1000;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-primary);
  
  &:hover {
    background-color: var(--bg-hover);
  }
  
  &.active {
    background-color: var(--primary-color);
    color: white;
  }
}

.theme-color {
  width: var(--spacing-md);
  height: var(--spacing-md);
  border-radius: var(--radius-full);
  border: 2px solid var(--border-color);
}

.theme-name {
  font-size: var(--text-sm);
}

.performance-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 600;
  
  &.excellent {
    background-color: var(--success-color);
    color: white;
  }
  
  &.good {
    background-color: var(--warning-color);
    color: white;
  }
  
  &.fair {
    background-color: var(--info-color);
    color: white;
  }
  
  &.poor {
    background-color: var(--danger-color);
    color: white;
  }
}

.performance-text {
  font-size: var(--text-xs);
}
</style>