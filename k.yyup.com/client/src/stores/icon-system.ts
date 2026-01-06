/**
 * 图标系统状态管理
 * 管理三套不同的图标风格切换
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export type IconSystem = 'modern' | 'colorful'

export interface IconSystemConfig {
  id: IconSystem
  name: string
  description: string
  preview: string
}

export const useIconSystemStore = defineStore('iconSystem', () => {
  // 当前图标系统
  const currentSystem = ref<IconSystem>('modern')

  // 可用的图标系统配置
  const iconSystems: IconSystemConfig[] = [
    {
      id: 'modern',
      name: '现代简约',
      description: '简洁线条图标，适合专业界面',
      preview: 'M3 12h18M3 6h18M3 18h18'
    },
    {
      id: 'colorful',
      name: '彩色扁平',
      description: '彩色填充图标，界面更加生动',
      preview: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'
    }
  ]

  // 切换图标系统
  const switchIconSystem = (system: IconSystem) => {
    currentSystem.value = system

    // 保存到本地存储
    localStorage.setItem('icon-system', system)

    // 触发全局事件，通知所有图标组件更新
    window.dispatchEvent(new CustomEvent('icon-system-changed', {
      detail: { system }
    }))
  }

  // 获取当前图标系统
  const getCurrentSystem = (): IconSystem => {
    return currentSystem.value
  }

  // 从本地存储恢复图标系统设置
  const restoreFromStorage = (): IconSystem => {
    const saved = localStorage.getItem('icon-system') as IconSystem
    if (saved && iconSystems.some(sys => sys.id === saved)) {
      currentSystem.value = saved
      return saved
    }
    return 'modern'
  }

  // 获取图标系统配置
  const getSystemConfig = (system: IconSystem): IconSystemConfig | undefined => {
    return iconSystems.find(config => config.id === system)
  }

  // 获取所有可用图标系统
  const getAllSystems = (): IconSystemConfig[] => {
    return iconSystems
  }

  // 初始化图标系统
  const initializeIconSystem = () => {
    currentSystem.value = restoreFromStorage()
    return currentSystem.value
  }

  return {
    // 状态
    currentSystem,

    // 方法
    switchIconSystem,
    getCurrentSystem,
    getSystemConfig,
    getAllSystems,
    initializeIconSystem,
    restoreFromStorage
  }
})