/**
 * 用户偏好管理 Composable
 * 从 AIAssistant.vue 第905-921行 + 第418-430行提取
 *
 * 🎯 核心职责：
 * ├─ 管理用户偏好设置（webSearch、messageFontSize）
 * ├─ 从localStorage加载用户偏好
 * ├─ 自动保存用户偏好到localStorage
 * └─ 监听偏好变化自动持久化
 *
 * 📦 偏好设置：
 * ├─ webSearch - 是否开启网络搜索
 * └─ messageFontSize - 消息字体大小
 *
 * 💡 使用示例：
 * const {
 *   webSearch,
 *   messageFontSize,
 *   loadPreferences
 * } = useUserPreferences()
 *
 * // 在组件挂载时加载偏好
 * onMounted(() => {
 *   loadPreferences()
 * })
 */

import { ref, watch } from 'vue'

// ==================== 单例模式 ====================
// 模块级变量，确保所有组件共享同一个偏好实例
let preferencesInstance: ReturnType<typeof createPreferences> | null = null

// 创建偏好实例的工厂函数
function createPreferences() {
  // ==================== 偏好设置状态 ====================
  const webSearch = ref(false)   // 默认关闭网络搜索
  const messageFontSize = ref(14) // 默认字体大小var(--text-base)

  // ==================== 加载用户偏好 ====================
  /**
   * 从localStorage加载用户偏好设置
   */
  const loadPreferences = () => {
    try {
      const savedSettings = localStorage.getItem('ai-assistant-settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        webSearch.value = settings.webSearch ?? false
        messageFontSize.value = settings.messageFontSize ?? 14
        console.log('📖 已从localStorage加载用户偏好:', settings)
      } else {
        console.log('📖 未找到保存的用户偏好，使用默认值')
      }
    } catch (error) {
      console.error('❌ 读取用户偏好失败:', error)
    }
  }

  // ==================== 保存用户偏好 ====================
  /**
   * 保存用户偏好设置到localStorage
   */
  const savePreferences = () => {
    try {
      const settings = {
        webSearch: webSearch.value,
        messageFontSize: messageFontSize.value
      }
      localStorage.setItem('ai-assistant-settings', JSON.stringify(settings))
      console.log('💾 用户偏好已保存到localStorage:', settings)
    } catch (error) {
      console.error('❌ 保存用户偏好失败:', error)
    }
  }

  // ==================== 监听偏好变化自动保存 ====================
  // 🔧 修复：延迟监听，避免初始化时触发保存
  // 使用 nextTick 确保在组件挂载后才开始监听
  let isInitialized = false

  // 监听用户偏好变化，自动保存到localStorage
  watch([webSearch, messageFontSize], () => {
    // 🎯 只有在初始化完成后才保存
    if (isInitialized) {
      console.log('🔄 [偏好变化] 检测到偏好变化，准备保存')
      savePreferences()
    } else {
      console.log('⏭️ [偏好变化] 初始化阶段，跳过保存')
    }
  }, { deep: true })

  // 🎯 标记初始化完成的方法
  const markInitialized = () => {
    isInitialized = true
    console.log('✅ [偏好初始化] 偏好系统初始化完成，开始监听变化')
  }

  return {
    // 偏好设置状态
    webSearch,
    messageFontSize,

    // 偏好管理方法
    loadPreferences,
    savePreferences,
    markInitialized
  }
}

// ==================== 导出单例函数 ====================
/**
 * 获取用户偏好管理实例（单例模式）
 * 
 * 🎯 单例模式确保：
 * - 所有组件共享同一个偏好设置
 * - 偏好变更自动同步到所有组件
 * - 避免偏好设置不一致问题
 * 
 * @returns 用户偏好管理实例
 */
export function useUserPreferences() {
  if (!preferencesInstance) {
    console.log('🔧 [useUserPreferences] 创建新的偏好实例（单例）')
    preferencesInstance = createPreferences()
  } else {
    console.log('🔧 [useUserPreferences] 返回现有偏好实例（单例）')
  }
  return preferencesInstance
}

