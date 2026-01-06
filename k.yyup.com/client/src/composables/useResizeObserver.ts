/**
 * Vue组合式函数：安全的resize监听器
 * 自动处理组件卸载时的清理，避免ResizeObserver循环错误
 */

import { onUnmounted } from 'vue'
import { globalResizeHandler } from '../utils/resize-handler'

export function useResizeObserver(callback: () => void) {
  const cleanup = globalResizeHandler.addListener(callback)
  
  // 组件卸载时自动清理
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    cleanup
  }
}

/**
 * 用于ECharts图表的resize处理
 */
export function useEChartsResize(chartRefs: Array<{ value: HTMLElement | null }>) {
  const resizeCharts = () => {
    chartRefs.forEach(ref => {
      if (ref.value) {
        const instance = (window as any).echarts?.getInstanceByDom(ref.value)
        if (instance) {
          instance.resize()
        }
      }
    })
  }
  
  const { cleanup } = useResizeObserver(resizeCharts)
  
  return {
    resizeCharts,
    cleanup
  }
}