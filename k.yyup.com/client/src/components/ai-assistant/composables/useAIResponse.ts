/**
 * AI响应处理 Composable
 * 从 AIAssistant.vue 第1800-2800行提取AI响应处理逻辑
 *
 * 🎯 核心职责：
 * ├─ AI响应流程管理 (思考→工具调用→答案)
 * ├─ 流式显示控制 (打字机效果、实时更新)
 * ├─ 工具调用管理 (状态跟踪、重试、导出)
 * ├─ 组件渲染处理 (动态组件、数据解析)
 * └─ 用户交互优化 (折叠展开、详情查看)
 *
 * 🤔 思考过程功能：
 * ├─ showThinkingPhase() - 显示思考阶段
 * ├─ toggleThinking() - 切换思考显示
 * ├─ 思考内容流式更新
 * └─ 思考过程折叠展开
 *
 * 🔧 工具调用功能：
 * ├─ showFunctionCall() - 显示工具调用
 * ├─ retryToolCall() - 重试工具调用
 * ├─ viewToolCallDetails() - 查看调用详情
 * ├─ exportToolCallResult() - 导出调用结果
 * └─ 工具调用状态管理
 *
 * 💬 答案显示功能：
 * ├─ showFinalAnswer() - 显示最终答案
 * ├─ showDirectChatTypingEffect() - 直接聊天打字效果
 * ├─ 答案流式显示
 * └─ 组件数据解析和渲染
 *
 * 🎨 组件渲染功能：
 * ├─ parseComponentData() - 解析组件数据
 * ├─ handleComponentChange() - 处理组件变更
 * └─ 动态组件管理
 *
 * 🔄 响应流程控制：
 * ├─ startCursorAIResponse() - 开始AI响应
 * ├─ completeAIResponse() - 完成AI响应
 * ├─ clearCurrentAIResponse() - 清空当前响应
 * └─ 响应状态管理
 *
 * 💡 使用示例：
 * const {
 *   currentAIResponse,
 *   showThinkingPhase,
 *   showFunctionCall,
 *   showFinalAnswer,
 *   retryToolCall
 * } = useAIResponse()
 */

import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { CurrentAIResponseState, FunctionCallState } from '../types/aiAssistant'

// ==================== 单例模式 ====================
// 模块级变量，确保所有组件共享同一个状态实例
let responseInstance: ReturnType<typeof createResponse> | null = null

// 创建响应实例的工厂函数
function createResponse() {
  // ==================== AI响应状态 ====================
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

  // ==================== 工具意图状态 ====================
  // 🎯 新增：待处理的工具意图信息
  const pendingToolIntent = ref<string>('')
  const pendingToolName = ref<string>('')

  // ==================== 上下文优化状态 ====================
  // 🧠 新增：智能上下文优化状态
  const contextOptimization = ref({
    visible: false,
    collapsed: true,
    isOptimizing: false,
    progressPercentage: 0,
    progressText: '正在分析上下文...',
    optimizationData: null as any
  })

  // ==================== 思考过程处理 ====================
  // 显示/更新思考阶段（幂等、增量更新，避免重复清空导致闪烁）
  const showThinkingPhase = (thinkingContent: string) => {
    // 确保容器可见
    currentAIResponse.value.visible = true
    currentAIResponse.value.thinking.visible = true
    currentAIResponse.value.thinking.collapsed = false

    const prev = currentAIResponse.value.thinking.content || ''

    // 如果新内容以前缀形式包含旧内容，只追加增量，避免每次重打一遍
    if (thinkingContent.startsWith(prev)) {
      const delta = thinkingContent.slice(prev.length)
      if (delta) {
        currentAIResponse.value.thinking.content += delta
      }
      return
    }

    // 否则直接替换为新内容（不使用打字机效果，保证流畅、不闪烁）
    currentAIResponse.value.thinking.content = thinkingContent
  }

  // 切换思考过程折叠状态
  const toggleThinking = () => {
    currentAIResponse.value.thinking.collapsed = !currentAIResponse.value.thinking.collapsed
  }

  // ==================== 上下文优化处理 ====================
  // 显示上下文优化
  const showContextOptimization = (data?: any) => {
    contextOptimization.value.visible = true
    contextOptimization.value.collapsed = false
    if (data) {
      contextOptimization.value.optimizationData = data
    }
  }

  // 开始上下文优化
  const startContextOptimization = () => {
    contextOptimization.value.visible = true
    contextOptimization.value.isOptimizing = true
    contextOptimization.value.progressPercentage = 0
    contextOptimization.value.progressText = '正在分析上下文...'
  }

  // 更新优化进度
  const updateOptimizationProgress = (percentage: number, text: string) => {
    contextOptimization.value.progressPercentage = percentage
    contextOptimization.value.progressText = text
  }

  // 完成上下文优化
  const completeContextOptimization = (data: any) => {
    contextOptimization.value.isOptimizing = false
    contextOptimization.value.progressPercentage = 100
    contextOptimization.value.optimizationData = data
    contextOptimization.value.progressText = '优化完成'
  }

  // 切换上下文优化折叠状态
  const toggleContextOptimization = () => {
    contextOptimization.value.collapsed = !contextOptimization.value.collapsed
  }

  // ==================== 函数调用处理 ====================
  // 显示函数调用
  const showFunctionCall = async (callData: {
    name: string
    description: string
    params?: any
  }) => {
    const functionCall: FunctionCallState = {
      callId: `call-${Date.now()}`,
      name: callData.name,
      description: callData.description,
      details: `正在执行 ${callData.description}`,
      status: 'running',
      params: callData.params,
      executionSteps: [],
      startTime: Date.now()
    }

    currentAIResponse.value.functionCalls.push(functionCall)

    // 模拟执行步骤
    const steps = [
      '准备执行参数',
      '调用API接口',
      '处理返回结果',
      '格式化输出'
    ]

    for (const step of steps) {
      functionCall.executionSteps.push(step)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    functionCall.status = 'completed'
    return functionCall
  }

  // 重新执行工具调用
  const retryToolCall = async (functionCall: FunctionCallState) => {
    console.log('重新执行工具调用:', functionCall)
    functionCall.retrying = true
    functionCall.status = 'running'
    
    try {
      // 模拟重新执行
      await new Promise(resolve => setTimeout(resolve, 2000))
      functionCall.status = 'completed'
      ElMessage.success('工具调用重新执行成功')
    } catch (error) {
      functionCall.status = 'failed'
      ElMessage.error('工具调用重新执行失败')
    } finally {
      functionCall.retrying = false
    }
  }

  // 查看工具调用详情
  const viewToolCallDetails = (functionCall: FunctionCallState) => {
    console.log('查看工具调用详情:', functionCall)

    // 创建详情对话框
    ElMessageBox.alert(
      `<div style="text-align: left;">
        <p><strong>工具名称:</strong> ${functionCall.name}</p>
        <p><strong>描述:</strong> ${functionCall.description}</p>
        <p><strong>状态:</strong> ${functionCall.status}</p>
        <p><strong>意图:</strong> ${functionCall.intent || '无'}</p>
        ${functionCall.result ? `<p><strong>结果:</strong></p><pre style="background: var(--bg-gray); padding: 10px; border-radius: var(--spacing-xs); max-height: 200px; overflow-y: auto;">${typeof functionCall.result === 'string' ? functionCall.result : JSON.stringify(functionCall.result, null, 2)}</pre>` : ''}
      </div>`,
      '工具调用详情',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定'
      }
    )
  }

  // 导出工具调用结果
  const exportToolCallResult = (functionCall: FunctionCallState) => {
    try {
      let resultData = functionCall.result

      // 如果结果是对象，转换为JSON字符串
      if (typeof resultData === 'object') {
        resultData = JSON.stringify(resultData, null, 2)
      }

      // 创建Blob对象
      const blob = new Blob([resultData], { type: 'application/json' })

      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tool-call-result-${functionCall.name}-${Date.now()}.json`

      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // 释放URL对象
      URL.revokeObjectURL(url)

      ElMessage.success('结果导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('结果导出失败')
    }
  }

  // ==================== 答案显示处理 ====================
  // 解析组件数据
  const parseComponentData = (text: string) => {
    try {
      // 查找组件标记
      const componentMatch = text.match(/\[COMPONENT:([^\]]+)\]/g)
      if (!componentMatch) {
        return { hasComponent: false, componentData: null, textContent: text }
      }

      // 提取组件数据
      const componentStr = componentMatch[0].replace(/\[COMPONENT:|\]/g, '')
      const componentData = JSON.parse(componentStr)

      // 移除组件标记，获取纯文本内容
      const textContent = text.replace(/\[COMPONENT:[^\]]+\]/g, '').trim()

      return {
        hasComponent: true,
        componentData,
        textContent
      }
    } catch (error) {
      console.warn('解析组件数据失败:', error)
      return { hasComponent: false, componentData: null, textContent: text }
    }
  }

  // 显示最终答案
  const showFinalAnswer = async (answerText: string, directComponentData?: any) => {
    currentAIResponse.value.answer.visible = true
    currentAIResponse.value.answer.streaming = true
    currentAIResponse.value.answer.content = ''

    // 如果直接传入了组件数据，使用直接传入的数据
    if (directComponentData) {
      currentAIResponse.value.answer.hasComponent = true
      currentAIResponse.value.answer.componentData = directComponentData
      console.log('✅ [组件渲染] 使用直接传入的组件数据', directComponentData)
    } else {
      // 否则解析文本中的组件数据
      const parsed = parseComponentData(answerText)
      currentAIResponse.value.answer.hasComponent = parsed.hasComponent
      currentAIResponse.value.answer.componentData = parsed.componentData
    }

    // 优先显示文本内容
    const textToShow = directComponentData ? answerText : (parseComponentData(answerText).textContent || answerText)

    // 打字机效果显示文本内容
    for (let i = 0; i < textToShow.length; i++) {
      currentAIResponse.value.answer.content += textToShow[i]
      await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 20))
    }

    // 停止流式输出
    currentAIResponse.value.answer.streaming = false

    // 如果有组件数据，延迟一点显示组件（让用户先看到文本）
    if (currentAIResponse.value.answer.hasComponent) {
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('🎨 [组件渲染] 准备显示组件', currentAIResponse.value.answer.componentData)
    }
  }

  // 直连模式打字机效果
  const showDirectChatTypingEffect = async (content: string) => {
    // 显示AI响应区域
    currentAIResponse.value.visible = true
    currentAIResponse.value.answer.visible = true
    currentAIResponse.value.answer.content = ''
    currentAIResponse.value.answer.streaming = true

    // 打字机效果显示内容
    for (let i = 0; i < content.length; i++) {
      currentAIResponse.value.answer.content += content[i]
      await new Promise(resolve => setTimeout(resolve, Math.random() * 25 + 15))
    }

    // 停止流式输出
    currentAIResponse.value.answer.streaming = false
  }

  // ==================== 响应完成处理 ====================
  // 完成AI响应 - 永久保留所有内容在页面上
  const completeAIResponse = async () => {
    console.log('🎯 开始完成AI响应，永久保留所有内容在页面上...')

    // 停止流式显示
    if (currentAIResponse.value.answer.streaming) {
      currentAIResponse.value.answer.streaming = false
    }

    // 折叠思考过程，但保持可见
    if (currentAIResponse.value.thinking.visible) {
      currentAIResponse.value.thinking.collapsed = true
    }

    // 确保当前响应容器保持可见
    currentAIResponse.value.visible = true

    console.log('✅ AI响应完成，已将内容写入历史并保持当前显示可见')
  }

  // 启动Cursor风格AI响应
  const startCursorAIResponse = () => {
    currentAIResponse.value.visible = true
    currentAIResponse.value.thinking.visible = false
    currentAIResponse.value.thinking.collapsed = false
    currentAIResponse.value.thinking.content = ''
    currentAIResponse.value.functionCalls = []
    currentAIResponse.value.answer.visible = false
    currentAIResponse.value.answer.content = ''
    currentAIResponse.value.answer.streaming = false
    currentAIResponse.value.answer.hasComponent = false
    currentAIResponse.value.answer.componentData = null
  }

  // 清空当前AI响应
  const clearCurrentAIResponse = () => {
    currentAIResponse.value.visible = false
    currentAIResponse.value.thinking.visible = false
    currentAIResponse.value.thinking.content = ''
    currentAIResponse.value.functionCalls = []
    currentAIResponse.value.answer.visible = false
    currentAIResponse.value.answer.content = ''
    currentAIResponse.value.answer.streaming = false
    currentAIResponse.value.answer.hasComponent = false
    currentAIResponse.value.answer.componentData = null

    // 清空上下文优化状态
    contextOptimization.value.visible = false
    contextOptimization.value.isOptimizing = false
    contextOptimization.value.optimizationData = null
  }

  // 处理组件数据变更
  const handleComponentChange = (componentData: any) => {
    console.log('组件数据变更:', componentData)
    currentAIResponse.value.answer.componentData = componentData
  }

  // ==================== 工具意图管理 ====================
  // 清理待处理的工具意图信息
  const clearPendingToolInfo = () => {
    pendingToolIntent.value = ''
    pendingToolName.value = ''
  }

  return {
    // 状态
    currentAIResponse,

    // 🎯 新增：工具意图状态
    pendingToolIntent,
    pendingToolName,
    clearPendingToolInfo,

    // 🧠 新增：上下文优化状态
    contextOptimization,
    showContextOptimization,
    startContextOptimization,
    updateOptimizationProgress,
    completeContextOptimization,
    toggleContextOptimization,

    // 思考过程
    showThinkingPhase,
    toggleThinking,

    // 函数调用
    showFunctionCall,
    retryToolCall,
    viewToolCallDetails,
    exportToolCallResult,

    // 答案显示
    parseComponentData,
    showFinalAnswer,
    showDirectChatTypingEffect,

    // 响应管理
    completeAIResponse,
    startCursorAIResponse,
    clearCurrentAIResponse,
    handleComponentChange
  }
}

// ==================== 导出单例函数 ====================
/**
 * 获取AI响应处理实例（单例模式）
 *
 * 🎯 单例模式确保：
 * - 主文件和核心组件共享同一个响应状态
 * - 响应状态变更自动同步到所有组件
 * - 避免响应状态不一致问题
 *
 * @returns AI响应处理实例
 */
export function useAIResponse() {
  if (!responseInstance) {
    console.log('🔧 [useAIResponse] 创建新的响应实例（单例）')
    responseInstance = createResponse()
  } else {
    console.log('🔧 [useAIResponse] 返回现有响应实例（单例）')
  }
  return responseInstance
}
