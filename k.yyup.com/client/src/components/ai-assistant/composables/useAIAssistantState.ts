/**
 * AI助手状态管理 Composable
 * 从 AIAssistant.vue 第290-900行提取核心状态定义
 *
 * 🎯 核心职责：
 * ├─ 统一管理AI助手所有状态变量
 * ├─ 提供状态操作方法
 * ├─ 状态持久化和恢复
 * └─ 状态变更通知和同步
 *
 * 📦 状态分类：
 * ├─ 布局状态：侧边栏、全屏、主题等
 * ├─ Token状态：使用量、加载状态等
 * ├─ 工具状态：工具调用、组件渲染等
 * ├─ 思考状态：思考过程、当前消息等
 * ├─ 会话状态：对话ID、对话列表等
 * ├─ 工作流状态：队列管理、透明度等
 * ├─ 输入状态：消息内容、发送状态等
 * └─ 对话框状态：统计、快速查询等
 *
 * 🔧 主要方法：
 * ├─ toggleLeftSidebar() - 切换左侧栏
 * ├─ toggleRightSidebar() - 切换右侧栏
 * ├─ resetState() - 重置所有状态
 * └─ 各种状态的getter/setter
 *
 * 💡 使用示例：
 * const {
 *   isFullscreen,
 *   leftSidebarCollapsed,
 *   toggleLeftSidebar,
 *   resetState
 * } = useAIAssistantState()
 */

import { ref, watch } from 'vue'
import type {
  ToolCallState,
  RenderedComponent,
  TokenUsage,
  FullscreenState,
  ConversationInfo,
  CurrentAIResponseState,
  AIShortcut,
  WorkflowStepQueueType
} from '../types/aiAssistant'

// ==================== 单例模式 ====================
// 模块级变量，确保所有组件共享同一个状态实例
let stateInstance: ReturnType<typeof createState> | null = null

// 创建状态实例的工厂函数
function createState() {
  // ==================== 三栏布局相关状态 ====================
  // 左侧栏折叠状态（🆕 默认折叠，减少对话区域压缩）
  const leftSidebarCollapsed = ref(true)  // 从false改为true

  // 右侧栏显示状态
  const rightSidebarVisible = ref(false)
  const rightSidebarLoading = ref(false)

  // 🆕 右侧栏自动打开配置
  const autoOpenToolPanel = ref(true)  // 默认自动打开
  const toolPanelOpenDelay = ref(500)  // 延迟500ms打开

  // 全屏状态管理
  const fullscreenState = ref<FullscreenState>({
    entering: false,
    exiting: false
  })

  // Token使用统计
  const tokenUsage = ref<TokenUsage>({
    total: 50000,
    today: 2500,
    remaining: 47500,
    limit: 100000,
    weeklyTrend: [1200, 1800, 2200, 2500, 2100, 2800, 2500]
  })
  const tokenLoading = ref(false)

  // 工具调用列表（默认为空，只在有工具调用时才显示）
  const toolCalls = ref<ToolCallState[]>([])

  // 渲染组件列表（默认为空，只在有组件渲染时才显示）
  const renderedComponents = ref<RenderedComponent[]>([])

  // 思考状态
  const isThinking = ref(false)
  const thinkingText = ref('AI正在思考')
  const currentThinkingMessage = ref('') // 当前正在做什么的消息

  // ==================== 会话相关状态 ====================
  // 会话ID
  const conversationId = ref<string | null>(null)

  // 会话抽屉 & 列表
  const conversationDrawerVisible = ref(false)
  const conversations = ref<ConversationInfo[]>([])
  const conversationsLoading = ref(false)

  // ==================== 工作流相关状态 ====================
  // 工作流队列管理
  const currentWorkflowQueue = ref<WorkflowStepQueueType | null>(null)
  const workflowQueueVisible = ref(false)

  // 工作流透明度控制
  const isWorkflowTransparent = ref(false)
  const workflowTimeoutId = ref<number | null>(null)

  // 工作流步骤队列
  const activeStepQueues = ref<string[]>([])
  const stepQueueUpdateTimer = ref<number | null>(null)

  // ==================== 输入和消息相关状态 ====================
  const inputMessage = ref('')
  const sending = ref(false)
  const loadingShortcut = ref<number | null>(null)
  const shortcuts = ref<AIShortcut[]>([])

  // ==================== 对话框状态 ====================
  const statisticsVisible = ref(false)
  const quickQueryGroupsVisible = ref(false)

  // ==================== 全屏功能 ====================
  const isFullscreen = ref(false)

  // ==================== 移动端预览状态 ====================
  const mobilePreviewVisible = ref(false)
  const mobilePreviewData = ref<any>(null)

  // ==================== HTML预览状态 ====================
  const htmlPreviewVisible = ref(false)
  const htmlPreviewData = ref<{
    code: string
    title: string
    contentType: string
  } | null>(null)

  // ==================== 缺失字段对话框状态 ====================
  const missingFieldsDialogVisible = ref(false)
  const missingFieldsData = ref<any>(null)

  // ==================== AI响应状态管理 ====================
  const currentAIResponse = ref<CurrentAIResponseState>({
    visible: false,
    thinking: {
      visible: false,
      collapsed: false,
      content: ''
    },
    functionCalls: [],
    answer: {
      visible: false,
      content: '',
      streaming: false,
      hasComponent: false,
      componentData: null
    }
  })

  // ==================== 专家管理状态 ====================
  const selectedExperts = ref<string[]>([])
  const customExperts = ref<any[]>([])

  // ==================== 监听器 ====================
  // 🆕 优化：监听工具调用，延迟自动展开右侧栏
  let toolPanelTimer: number | null = null
  watch(() => toolCalls.value.length, (newLength, oldLength) => {
    // 清除之前的定时器
    if (toolPanelTimer) {
      clearTimeout(toolPanelTimer)
      toolPanelTimer = null
    }

    // 只在全屏模式下且启用自动打开时才展开
    if (isFullscreen.value && autoOpenToolPanel.value && newLength > 0 && oldLength === 0) {
      // 🆕 延迟打开，避免立即打开造成的布局跳动
      toolPanelTimer = window.setTimeout(() => {
        // 再次检查是否还有工具调用（避免快速完成的工具调用）
        if (toolCalls.value.length > 0) {
          rightSidebarVisible.value = true
          console.log('🔧 自动打开工具面板（延迟' + toolPanelOpenDelay.value + 'ms）')
        }
      }, toolPanelOpenDelay.value)
    }
  })

  // ==================== 状态操作方法 ====================
  // 切换左侧栏折叠状态
  const toggleLeftSidebar = () => {
    leftSidebarCollapsed.value = !leftSidebarCollapsed.value
    // 🆕 保存用户偏好
    try {
      localStorage.setItem('ai-left-sidebar-collapsed', leftSidebarCollapsed.value.toString())
    } catch (error) {
      console.error('❌ 保存左侧栏状态失败:', error)
    }
  }

  // 切换右侧栏显示状态
  const toggleRightSidebar = () => {
    rightSidebarVisible.value = !rightSidebarVisible.value
    // 🆕 保存用户偏好
    try {
      localStorage.setItem('ai-right-sidebar-visible', rightSidebarVisible.value.toString())
    } catch (error) {
      console.error('❌ 保存右侧栏状态失败:', error)
    }
  }

  // 🆕 设置自动打开工具面板
  const setAutoOpenToolPanel = (enabled: boolean) => {
    autoOpenToolPanel.value = enabled
    try {
      localStorage.setItem('ai-auto-open-tool-panel', enabled.toString())
      console.log('✅ 已' + (enabled ? '启用' : '禁用') + '工具面板自动打开')
    } catch (error) {
      console.error('❌ 保存工具面板自动打开设置失败:', error)
    }
  }

  // 重置状态
  const resetState = () => {
    leftSidebarCollapsed.value = false
    rightSidebarVisible.value = false
    fullscreenState.value = { entering: false, exiting: false }
    toolCalls.value = []
    renderedComponents.value = []
    isThinking.value = false
    currentThinkingMessage.value = ''
    conversationDrawerVisible.value = false
    workflowQueueVisible.value = false
    isWorkflowTransparent.value = false
    inputMessage.value = ''
    sending.value = false
    statisticsVisible.value = false
    quickQueryGroupsVisible.value = false
    mobilePreviewVisible.value = false
    mobilePreviewData.value = null
    htmlPreviewVisible.value = false
    htmlPreviewData.value = null
    currentAIResponse.value = {
      visible: false,
      thinking: { visible: false, collapsed: false, content: '' },
      functionCalls: [],
      answer: { visible: false, content: '', streaming: false, hasComponent: false, componentData: null }
    }
  }

  // ==================== 专家管理方法 ====================
  /**
   * 更新选中的专家
   * @param expertIds 专家ID数组
   */
  const updateSelectedExperts = (expertIds: string[]) => {
    selectedExperts.value = expertIds
    console.log('✅ 已选择专家:', expertIds)
    try {
      localStorage.setItem('ai-selected-experts', JSON.stringify(expertIds))
    } catch (error) {
      console.error('❌ 保存专家选择失败:', error)
    }
  }

  /**
   * 添加自定义专家
   * @param expert 专家信息
   * @param userId 用户ID
   */
  const addCustomExpert = (expert: any, userId?: string) => {
    const newExpert = {
      ...expert,
      id: `custom_${Date.now()}`,
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'custom'
    }
    customExperts.value.push(newExpert)
    console.log('✅ 已添加自定义专家:', newExpert)
    try {
      localStorage.setItem('ai-custom-experts', JSON.stringify(customExperts.value))
    } catch (error) {
      console.error('❌ 保存自定义专家失败:', error)
    }
  }

  /**
   * 更新自定义专家
   * @param expert 专家信息
   */
  const updateCustomExpert = (expert: any) => {
    const index = customExperts.value.findIndex(e => e.id === expert.id)
    if (index > -1) {
      customExperts.value[index] = {
        ...expert,
        updatedAt: new Date().toISOString()
      }
      console.log('✅ 已更新自定义专家:', expert)
      try {
        localStorage.setItem('ai-custom-experts', JSON.stringify(customExperts.value))
      } catch (error) {
        console.error('❌ 保存自定义专家失败:', error)
      }
    }
  }

  /**
   * 删除自定义专家
   * @param expertId 专家ID
   */
  const deleteCustomExpert = (expertId: string) => {
    const index = customExperts.value.findIndex(e => e.id === expertId)
    if (index > -1) {
      customExperts.value.splice(index, 1)
      // 如果该专家被选中，也要取消选择
      const selectedIndex = selectedExperts.value.indexOf(expertId)
      if (selectedIndex > -1) {
        selectedExperts.value.splice(selectedIndex, 1)
      }
      console.log('✅ 已删除自定义专家:', expertId)
      try {
        localStorage.setItem('ai-custom-experts', JSON.stringify(customExperts.value))
        localStorage.setItem('ai-selected-experts', JSON.stringify(selectedExperts.value))
      } catch (error) {
        console.error('❌ 保存自定义专家失败:', error)
      }
    }
  }

  /**
   * 从localStorage加载专家数据
   */
  const loadExpertsFromStorage = () => {
    try {
      const savedExperts = localStorage.getItem('ai-selected-experts')
      if (savedExperts) {
        selectedExperts.value = JSON.parse(savedExperts)
        console.log('📖 已从localStorage加载专家选择:', selectedExperts.value)
      }

      const savedCustomExperts = localStorage.getItem('ai-custom-experts')
      if (savedCustomExperts) {
        customExperts.value = JSON.parse(savedCustomExperts)
        console.log('📖 已从localStorage加载自定义专家:', customExperts.value)
      }

      // 🆕 加载左侧栏折叠状态
      const savedLeftSidebarState = localStorage.getItem('ai-left-sidebar-collapsed')
      if (savedLeftSidebarState !== null) {
        leftSidebarCollapsed.value = savedLeftSidebarState === 'true'
        console.log('📖 已从localStorage加载左侧栏状态:', leftSidebarCollapsed.value)
      }

      // 🆕 加载右侧栏显示状态
      const savedRightSidebarState = localStorage.getItem('ai-right-sidebar-visible')
      if (savedRightSidebarState !== null) {
        rightSidebarVisible.value = savedRightSidebarState === 'true'
        console.log('📖 已从localStorage加载右侧栏状态:', rightSidebarVisible.value)
      }

      // 🆕 加载工具面板自动打开设置
      const savedAutoOpenSetting = localStorage.getItem('ai-auto-open-tool-panel')
      if (savedAutoOpenSetting !== null) {
        autoOpenToolPanel.value = savedAutoOpenSetting === 'true'
        console.log('📖 已从localStorage加载工具面板自动打开设置:', autoOpenToolPanel.value)
      }
    } catch (error) {
      console.error('❌ 读取专家选择数据失败:', error)
    }
  }

  return {
    // 布局状态
    leftSidebarCollapsed,
    rightSidebarVisible,
    rightSidebarLoading,
    fullscreenState,
    isFullscreen,

    // Token状态
    tokenUsage,
    tokenLoading,

    // 工具和组件状态
    toolCalls,
    renderedComponents,

    // 思考状态
    isThinking,
    thinkingText,
    currentThinkingMessage,

    // 会话状态
    conversationId,
    conversationDrawerVisible,
    conversations,
    conversationsLoading,

    // 工作流状态
    currentWorkflowQueue,
    workflowQueueVisible,
    isWorkflowTransparent,
    workflowTimeoutId,
    activeStepQueues,
    stepQueueUpdateTimer,

    // 输入状态
    inputMessage,
    sending,
    loadingShortcut,
    shortcuts,

    // 对话框状态
    statisticsVisible,
    quickQueryGroupsVisible,

    // 移动端预览状态
    mobilePreviewVisible,
    mobilePreviewData,

    // HTML预览状态
    htmlPreviewVisible,
    htmlPreviewData,

    // 缺失字段对话框状态
    missingFieldsDialogVisible,
    missingFieldsData,

    // AI响应状态
    currentAIResponse,

    // 🆕 专家管理状态
    selectedExperts,
    customExperts,

    // 状态操作方法
    toggleLeftSidebar,
    toggleRightSidebar,
    resetState,

    // 🆕 专家管理方法
    updateSelectedExperts,
    addCustomExpert,
    updateCustomExpert,
    deleteCustomExpert,
    loadExpertsFromStorage,

    // 🆕 工具面板配置方法
    autoOpenToolPanel,
    toolPanelOpenDelay,
    setAutoOpenToolPanel
  }
}

// ==================== 导出单例函数 ====================
/**
 * 获取AI助手状态管理实例（单例模式）
 *
 * 🎯 单例模式确保：
 * - 主文件和核心组件共享同一个状态
 * - 状态变更自动同步到所有组件
 * - 避免状态不一致问题
 *
 * @returns AI助手状态管理实例
 */
export function useAIAssistantState() {
  if (!stateInstance) {
    console.log('🔧 [useAIAssistantState] 创建新的状态实例（单例）')
    stateInstance = createState()
  } else {
    console.log('🔧 [useAIAssistantState] 返回现有状态实例（单例）')
  }
  return stateInstance
}
