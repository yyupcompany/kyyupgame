/**
 * 全局Loading状态管理
 * 用于协调应用中的各种loading状态，避免与入场动画冲突
 */

import { ref, computed } from 'vue'

// 全局loading状态
const globalLoading = ref(false)

// 入场动画状态 - 由EntranceAnimationWrapper或相关组件管理
const entranceAnimationActive = ref(false)

/**
 * 是否应该显示loading遮罩
 * 当入场动画播放时，不显示普通的loading遮罩
 */
export const shouldShowLoading = computed(() => {
  return globalLoading.value && !entranceAnimationActive.value
})

/**
 * 设置全局loading状态
 */
export const setGlobalLoading = (loading: boolean) => {
  globalLoading.value = loading
  console.log(`🔄 全局loading状态: ${loading ? '开启' : '关闭'}`)
}

/**
 * 设置入场动画状态
 */
export const setEntranceAnimationActive = (active: boolean) => {
  entranceAnimationActive.value = active
  console.log(`🎬 入场动画状态: ${active ? '开始' : '结束'}`)
}

/**
 * 获取当前loading状态
 */
export const getLoadingState = () => ({
  globalLoading: globalLoading.value,
  entranceAnimationActive: entranceAnimationActive.value,
  shouldShowLoading: shouldShowLoading.value
})

/**
 * 组合式函数 - 用于组件中
 */
export const useGlobalLoading = () => {
  return {
    shouldShowLoading,
    setGlobalLoading,
    setEntranceAnimationActive,
    getLoadingState
  }
}

// 导出响应式引用，用于直接访问
export { globalLoading, entranceAnimationActive }