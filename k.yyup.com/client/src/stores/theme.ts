import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { setTheme, getThemeName, isDarkMode, type ThemeType, currentTheme as themeRef } from '@/utils/theme'

export interface ThemeConfig {
  name: string
  displayName: string
  icon: string
  colors: {
    primary: string
    background: string
    surface: string
    text: string
  }
}

export const themeConfigs: Record<string, ThemeConfig> = {
  default: {
    name: 'default',
    displayName: '明亮主题',
    icon: 'sun',
    colors: {
      primary: '#6366f1',
      background: '#ffffff',
      surface: '#f5f7fa',
      text: '#303133'
    }
  },
  dark: {
    name: 'dark',
    displayName: '暗黑主题',
    icon: 'moon',
    colors: {
      primary: '#8b5cf6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc'
    }
  },
  'glass-light': {
    name: 'glass-light',
    displayName: '明亮玻璃台',
    icon: 'panel',
    colors: {
      primary: '#06b6d4',
      background: 'rgba(255, 255, 255, 0.95)',
      surface: 'rgba(255, 255, 255, 0.92)',
      text: '#1e293b'
    }
  },
  'glass-dark': {
    name: 'glass-dark',
    displayName: '暗黑玻璃台',
    icon: 'panel',
    colors: {
      primary: '#8b5cf6',
      background: 'rgba(15, 23, 42, 0.95)',
      surface: 'rgba(30, 41, 59, 0.92)',
      text: '#f1f5f9'
    }
  }
}

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const currentTheme = ref<ThemeType>('default')
  const isThemeTransitioning = ref(false)
  const autoTheme = ref(false)
  const systemPrefersDark = ref(false)

  // 计算属性
  const themeConfig = computed(() => themeConfigs[currentTheme.value])

  const availableThemes = computed(() => Object.values(themeConfigs))

  const themeDisplayName = computed(() => getThemeName(currentTheme.value))

  // 检测系统主题偏好
  const detectSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemPrefersDark.value = mediaQuery.matches

      // 监听系统主题变化
      const handleChange = (e: MediaQueryListEvent) => {
        systemPrefersDark.value = e.matches
        if (autoTheme.value) {
          applySystemTheme()
        }
      }

      mediaQuery.addEventListener('change', handleChange)

      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
    return () => {}
  }

  // 应用系统主题
  const applySystemTheme = () => {
    const systemTheme = systemPrefersDark.value ? 'dark' : 'default'
    setTheme(systemTheme)
  }

  // 切换主题
  const changeTheme = async (theme: ThemeType) => {
    if (theme === currentTheme.value) return

    isThemeTransitioning.value = true

    try {
      // 添加过渡动画类
      document.documentElement.classList.add('theme-transitioning')

      // 设置新主题
      setTheme(theme)
      currentTheme.value = theme

      // 等待DOM更新
      await new Promise(resolve => setTimeout(resolve, 50))

      // 移除过渡动画类
      document.documentElement.classList.remove('theme-transitioning')

      // 发送主题变化事件
      window.dispatchEvent(new CustomEvent('theme-changed', {
        detail: { theme, config: themeConfig.value }
      }))
    } finally {
      isThemeTransitioning.value = false
    }
  }

  // 切换自动主题
  const toggleAutoTheme = (enabled?: boolean) => {
    autoTheme.value = enabled ?? !autoTheme.value

    if (autoTheme.value) {
      applySystemTheme()
    }
  }

  // 切换明暗主题
  const toggleDarkMode = () => {
    const newTheme = isDark.value ? 'default' : 'dark'
    changeTheme(newTheme)
  }

  // 获取当前主题是否为暗黑模式
  const isDark = computed(() => {
    return currentTheme.value === 'dark'
  })

  // 获取主题变量
  const getThemeVariable = (variable: string): string => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable).trim()
  }

  // 设置主题变量
  const setThemeVariable = (variable: string, value: string) => {
    document.documentElement.style.setProperty(variable, value)
  }

  // 重置主题变量
  const resetThemeVariables = () => {
    const root = document.documentElement
    const style = getComputedStyle(root)

    // 重置所有CSS变量
    Array.from(style).forEach(property => {
      if (property.startsWith('--')) {
        root.style.removeProperty(property)
      }
    })
  }

  // 获取当前主题的对比色
  const getContrastColor = (backgroundColor: string): string => {
    // 简单的对比度计算
    const rgb = backgroundColor.replace(/\D/g, '').split(',')
    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }

  // 初始化
  const init = () => {
    // 从本地存储读取主题
    const savedTheme = localStorage.getItem('app-theme') as ThemeType || 'default'
    currentTheme.value = savedTheme

    // 检测系统主题
    const cleanup = detectSystemTheme()

    // 应用保存的主题
    setTheme(savedTheme)

    // 监听主题变化
    watch(
      () => currentTheme.value,
      (newTheme) => {
        localStorage.setItem('app-theme', newTheme)
      }
    )

    return cleanup
  }

  return {
    // 状态
    currentTheme,
    isThemeTransitioning,
    autoTheme,
    systemPrefersDark,

    // 计算属性
    isDark,
    themeConfig,
    availableThemes,
    themeDisplayName,

    // 方法
    changeTheme,
    toggleAutoTheme,
    toggleDarkMode,
    getThemeVariable,
    setThemeVariable,
    resetThemeVariables,
    getContrastColor,
    init
  }
})