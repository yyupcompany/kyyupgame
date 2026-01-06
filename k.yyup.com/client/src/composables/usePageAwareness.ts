import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { PageAwarenessService } from '../services/page-awareness.service'

/**
 * 页面感知组合式函数
 */
export function usePageAwareness() {
  const route = useRoute()
  const pageAwarenessService = PageAwarenessService.getInstance()

  onMounted(() => {
    // 在组件挂载时初始化路由监听器
    pageAwarenessService.initRouteWatcher(route)
  })

  onUnmounted(() => {
    // 组件卸载时清理资源
    pageAwarenessService.cleanup()
  })

  return {
    currentPageGuide: pageAwarenessService.currentPageGuide,
    loadPageGuide: pageAwarenessService.loadPageGuide.bind(pageAwarenessService),
    onPageChange: pageAwarenessService.onPageChange.bind(pageAwarenessService),
    offPageChange: pageAwarenessService.offPageChange.bind(pageAwarenessService),
    generatePageIntroduction: pageAwarenessService.generatePageIntroduction.bind(pageAwarenessService),
    getCurrentPageContext: pageAwarenessService.getCurrentPageContext.bind(pageAwarenessService),
    // 🎯 新增用户控制方法
    setUserEnabled: pageAwarenessService.setUserEnabled.bind(pageAwarenessService),
    setWorkflowSuppressed: pageAwarenessService.setWorkflowSuppressed.bind(pageAwarenessService),
    getStatus: pageAwarenessService.getStatus.bind(pageAwarenessService)
  }
}
