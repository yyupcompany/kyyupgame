/**
 * 全屏模式管理 Composable
 * 从 AIAssistant.vue 第940-1009行提取
 *
 * 🎯 核心职责：
 * ├─ 全屏模式初始化（隐藏主应用侧边栏、调整布局）
 * ├─ 全屏模式清理（恢复主应用侧边栏、恢复布局）
 * ├─ 页面标题管理
 * └─ 页面样式类管理
 * 
 * 🔧 初始化操作：
 * ├─ 设置页面标题为"AI助手 - 幼儿园管理系统"
 * ├─ 添加body样式类"ai-chat-interface-active"
 * ├─ 隐藏主应用侧边栏
 * ├─ 调整主容器位置和宽度
 * └─ 移除页面内容padding
 * 
 * 🔧 清理操作：
 * ├─ 恢复页面标题为"幼儿园管理系统"
 * ├─ 移除body样式类"ai-chat-interface-active"
 * ├─ 恢复主应用侧边栏
 * ├─ 恢复主容器位置和宽度
 * └─ 恢复页面内容padding
 * 
 * 💡 使用示例：
 * const { setupFullscreenMode, cleanupFullscreenMode } = useFullscreenMode()
 * 
 * onMounted(() => {
 *   if (props.isFullscreen) {
 *     setupFullscreenMode()
 *   }
 * })
 * 
 * onUnmounted(() => {
 *   if (props.isFullscreen) {
 *     cleanupFullscreenMode()
 *   }
 * })
 */

/**
 * 全屏模式管理
 */
export function useFullscreenMode() {
  /**
   * 初始化全屏模式
   * 隐藏主应用的侧边栏和导航，让AI助手占满全屏
   */
  const setupFullscreenMode = () => {
    console.log('✅ 全屏模式已启用')

    // 设置页面标题
    document.title = 'AI助手 - 幼儿园管理系统'

    // 添加页面样式类
    document.body.classList.add('ai-chat-interface-active')

    // 隐藏主应用的侧边栏，确保AI助手占满全屏
    const mainSidebar = document.querySelector('.sidebar, .main-sidebar, #improved-sidebar')
    if (mainSidebar) {
      ;(mainSidebar as HTMLElement).style.display = 'none'
      console.log('✅ 已隐藏主应用侧边栏')
    }

    // 调整主容器位置
    const mainContainer = document.querySelector('.main-container')
    if (mainContainer) {
      ;(mainContainer as HTMLElement).style.setProperty('left', '0px', 'important')
      ;(mainContainer as HTMLElement).style.setProperty('width', '100vw', 'important')
      console.log('✅ 已调整主容器位置')
    }

    // 🔧 移除 .page-content 的 padding，确保全屏弹窗铺满整个窗口
    const pageContent = document.querySelector('.page-content')
    if (pageContent) {
      ;(pageContent as HTMLElement).style.setProperty('padding', '0px', 'important')
      console.log('✅ 已移除页面内容的padding')
    }
  }

  /**
   * 清理全屏模式
   * 恢复主应用的侧边栏和导航
   */
  const cleanupFullscreenMode = () => {
    console.log('AI助手页面已卸载')

    // 移除页面样式类
    document.body.classList.remove('ai-chat-interface-active')

    // 恢复页面标题
    document.title = '幼儿园管理系统'

    // 恢复主应用的侧边栏
    const mainSidebar = document.querySelector('.sidebar, .main-sidebar, #improved-sidebar')
    if (mainSidebar) {
      ;(mainSidebar as HTMLElement).style.display = ''
      console.log('✅ 已恢复主应用侧边栏')
    }

    // 恢复主容器位置
    const mainContainer = document.querySelector('.main-container')
    if (mainContainer) {
      ;(mainContainer as HTMLElement).style.left = ''
      ;(mainContainer as HTMLElement).style.width = ''
      console.log('✅ 已恢复主容器位置')
    }

    // 🔧 恢复 .page-content 的 padding
    const pageContent = document.querySelector('.page-content')
    if (pageContent) {
      ;(pageContent as HTMLElement).style.padding = ''
      console.log('✅ 已恢复页面内容的padding')
    }
  }

  return {
    setupFullscreenMode,
    cleanupFullscreenMode
  }
}

