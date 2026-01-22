/**
 * Design Store - 用于主题和设计系统
 * 替代不存在的 design store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDesignStore = defineStore('design', () => {
  // 主题状态
  const darkMode = ref(false)

  // 颜色变量映射
  const colors = ref({
    primary: '#6366f1',
    background: '#ffffff',
    surface: '#f5f7fa',
    text: '#303133'
  })

  // 间距变量
  const spacing = ref({
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  })

  // 计算属性
  const isDark = computed(() => darkMode.value)

  // 方法
  function toggleDarkMode() {
    darkMode.value = !darkMode.value
  }

  function setDarkMode(value: boolean) {
    darkMode.value = value
  }

  return {
    // 状态
    darkMode,
    colors,
    spacing,
    // 计算属性
    isDark,
    // 方法
    toggleDarkMode,
    setDarkMode
  }
})
