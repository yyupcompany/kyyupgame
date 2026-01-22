import { ref, computed } from 'vue'
import { callUnifiedIntelligenceStreamSingleRound } from '../api/endpoints/function-tools'

/**
 * 多轮工具调用 Composable
 * 实现前端Loop机制，支持工具持续调用直到任务完成
 */

export interface ToolCall {
  name: string
  arguments: any
  result?: any
  narration?: string // 🆕 工具调用解说
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  toolCalls?: ToolCall[]
  toolCallId?: string
  tool_call_id?: string
  name?: string
}

export interface MultiRoundState {
  currentRound: number
  maxRounds: number
  isRunning: boolean
  isComplete: boolean
  conversationHistory: ConversationMessage[]
  toolCallHistory: ToolCall[]
  error: string | null
  pendingToolNarrations: Map<string, string> // 🆕 存储待关联的工具意图（工具名 -> 意图文本）
}

export interface ProgressEvent {
  type: string
  data?: any
  message?: string
  round?: number
}

export function useMultiRoundToolCalling() {
  // 🔧 AbortController用于取消请求
  let abortController: AbortController | null = null

  // 🆕 超时控制：2分钟自动停止
  let timeoutId: NodeJS.Timeout | null = null
  const EXECUTION_TIMEOUT = 2 * 60 * 1000 // 2分钟

  // 🔧 第一阶段优化：限制历史长度，防止无限累积
  const MAX_HISTORY_LENGTH = 8 // 最大保留8轮历史，优化token使用

  // 🔧 第二阶段优化：动态历史长度管理
  const MAX_TOKEN_ESTIMATE = 6000 // 最大估算token数
  const MIN_HISTORY_LENGTH = 4 // 最小保留历史长度

  // 状态管理
  const state = ref<MultiRoundState>({
    currentRound: 0,
    maxRounds: 20, // 默认20轮，可以从环境变量读取
    isRunning: false,
    isComplete: false,
    conversationHistory: [],
    toolCallHistory: [],
    error: null,
    pendingToolNarrations: new Map() // 🆕 初始化待关联的工具意图
  })

  // 计算属性
  const progress = computed(() => {
    if (state.value.maxRounds === 0) return 0
    return Math.round((state.value.currentRound / state.value.maxRounds) * 100)
  })

  const canContinue = computed(() => {
    return (
      state.value.isRunning &&
      !state.value.isComplete &&
      state.value.currentRound < state.value.maxRounds &&
      !state.value.error
    )
  })

  /**
   * 🔧 第一阶段优化：智能历史长度限制
   * 🔧 第二阶段优化：基于Token估算的动态历史管理
   * 防止conversationHistory无限增长，减少token使用
   */
  function limitConversationHistory() {
    // 估算当前历史的token使用量
    const currentTokenEstimate = estimateHistoryTokens(state.value.conversationHistory)

    console.log(`📊 [第二阶段优化] 历史Token估算: ${currentTokenEstimate} tokens`)

    let targetLength = state.value.conversationHistory.length

    // 如果超过最大token限制，减少历史长度
    if (currentTokenEstimate > MAX_TOKEN_ESTIMATE) {
      // 计算需要保留的历史长度
      const reductionRatio = MAX_TOKEN_ESTIMATE / currentTokenEstimate
      targetLength = Math.max(
        Math.floor(state.value.conversationHistory.length * reductionRatio),
        MIN_HISTORY_LENGTH
      )

      console.log(`🗑️ [第二阶段优化] Token超限，动态调整历史长度: ${state.value.conversationHistory.length} → ${targetLength}`)
    } else if (state.value.conversationHistory.length > MAX_HISTORY_LENGTH) {
      // 如果没有超token限制但超过消息数量限制
      targetLength = MAX_HISTORY_LENGTH
      console.log(`🗑️ [历史优化] 消息数量超限: ${state.value.conversationHistory.length} → ${MAX_HISTORY_LENGTH}`)
    }

    // 执行历史清理
    if (targetLength < state.value.conversationHistory.length) {
      const excess = state.value.conversationHistory.length - targetLength
      state.value.conversationHistory.splice(0, excess)

      console.log(`✅ [历史优化] 已清理 ${excess} 条历史消息，当前长度: ${state.value.conversationHistory.length}`)
      console.log(`📊 [历史优化] 清理后Token估算: ${estimateHistoryTokens(state.value.conversationHistory)} tokens`)
    }

    // 同时限制工具调用历史
    if (state.value.toolCallHistory.length > targetLength) {
      const excess = state.value.toolCallHistory.length - targetLength
      state.value.toolCallHistory.splice(0, excess)
      console.log(`🗑️ [工具历史] 已清理 ${excess} 条工具调用历史`)
    }
  }

  /**
   * 🔧 第二阶段优化：估算历史消息的Token使用量
   * 使用简化的估算方法，快速计算
   */
  function estimateHistoryTokens(history: ConversationMessage[]): number {
    let totalTokens = 0

    history.forEach(msg => {
      if (msg.content && typeof msg.content === 'string') {
        // 简化估算：中文字符按1.5 tokens，英文按4字符1 token
        const chineseChars = (msg.content.match(/[\u4e00-\u9fa5]/g) || []).length
        const englishChars = msg.content.length - chineseChars
        totalTokens += Math.ceil(chineseChars * 1.5 + englishChars / 4)
      }

      // 工具调用和结果的token开销
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        totalTokens += msg.toolCalls.length * 50 // 每个工具调用约50 tokens
      }
      if (msg.role === 'tool') {
        totalTokens += 30 // 工具结果约30 tokens
      }

      // 角色标识开销
      totalTokens += 5
    })

    // 系统提示词开销（估算）
    totalTokens += 200

    return totalTokens
  }

  /**
   * 重置状态
   */
  function reset() {
    // 🔧 修复：先清理之前的资源（超时计时器和AbortController）
    // 这样可以避免旧的超时计时器继续运行导致超时机制失效
    // 同时中止前一个请求，确保新请求不会与旧请求冲突
    cleanup()

    state.value = {
      currentRound: 0,
      maxRounds: 20,
      isRunning: false,
      isComplete: false,
      conversationHistory: [],
      toolCallHistory: [],
      error: null,
      pendingToolNarrations: new Map() // 🆕 重置待关联的工具意图
    }
  }

  /**
   * 格式化工具调用结果为消息
   */
  function formatToolCallResults(toolCalls: ToolCall[]): string {
    if (!toolCalls || toolCalls.length === 0) {
      return ''
    }

    const results = toolCalls.map(tc => {
      const resultStr = typeof tc.result === 'string' 
        ? tc.result 
        : JSON.stringify(tc.result, null, 2)
      return `工具 ${tc.name} 执行结果:\n${resultStr}`
    })

    return results.join('\n\n')
  }

  /**
   * 检查是否需要继续调用
   * 🔧 优化：添加更严格的循环退出条件，避免无限循环浪费token
   */
  function shouldContinue(result: any): boolean {
    // 🚨 安全检查：防止result为null或undefined
    if (!result) {
      console.log('🎯 [多轮调用] 结果为空，停止循环')
      return false
    }

    // 🚨 安全检查：检查数据结构完整性
    const data = result.data || result
    if (!data || typeof data !== 'object') {
      console.log('🎯 [多轮调用] 数据结构异常，停止循环:', data)
      return false
    }

    // 🔧 优先级1：检查明确完成标记
    if (data.isComplete === true || result.isComplete === true) {
      console.log('🎯 [多轮调用] 检测到明确完成标记，停止循环')
      return false
    }

    // 🔧 优先级2：检查明确的停止标记
    if (data.needsContinue === false || result.needsContinue === false) {
      console.log('🎯 [多轮调用] 检测到明确停止标记，停止循环')
      return false
    }

    // 🔧 优先级3：检查是否明确需要继续（优先级提升，在检查答案之前）
    if (data.needsContinue === true || result.needsContinue === true) {
      console.log('🔄 [多轮调用] 检测到明确继续标记，继续循环')
      return true
    }

    // 🔧 优先级4：检查最终答案存在（说明任务已完成）
    // ⚠️ 注意：只有在没有明确继续标记时才检查答案
    if (data.finalAnswer || data.answer || data.message) {
      console.log('🎯 [多轮调用] 检测到最终答案且无继续标记，停止循环')
      return false
    }

    // 🔧 优先级5：检查未完成任务（但必须有工具调用）
    const hasToolCalls = data.toolCalls && Array.isArray(data.toolCalls) && data.toolCalls.length > 0
    const hasMoreTasks = data.hasMoreTasks === true || result.hasMoreTasks === true

    // ✅ 兜底：若已执行渲染类工具且未显式要求继续，则视为完成，避免空转
    if (hasToolCalls) {
      const hasRenderComponent = data.toolCalls.some((t: any) =>
        t?.name === 'render_component' || t?.functionName === 'render_component'
      )
      if (hasRenderComponent && data.needsContinue !== true && result.needsContinue !== true) {
        console.log('🎯 [多轮调用] 检测到渲染完成且无继续标记，停止循环')
        return false
      }
    }

    if (hasToolCalls && hasMoreTasks) {
      console.log('🔄 [多轮调用] 有工具调用且存在未完成任务，继续循环')
      return true
    }

    // 🔧 优先级6：检查工具调用结果但需要处理
    if (hasToolCalls && !data.finalAnswer && !data.answer) {
      console.log('🔄 [多轮调用] 有工具调用但无最终答案，继续循环')
      return true
    }

    // 🚨 默认停止：任何不符合条件的情况都停止循环
    console.log('🎯 [多轮调用] 不满足继续条件，默认停止循环:', {
      hasToolCalls,
      hasMoreTasks,
      hasFinalAnswer: !!(data.finalAnswer || data.answer),
      needsContinue: data.needsContinue,
      isComplete: data.isComplete
    })

    return false
  }

  /**
   * 执行多轮工具调用
   */
  async function executeMultiRound(
    initialMessage: string,
    options: {
      userId?: string
      conversationId?: string
      context?: any
      maxRounds?: number
      onProgress?: (event: ProgressEvent) => void
      onRoundComplete?: (round: number, result: any) => void
      onToolCall?: (toolCall: ToolCall) => void
      onComplete?: (finalResult: any) => void
      onError?: (error: Error) => void
    } = {}
  ): Promise<any> {
    try {
      // 初始化
      reset()
      // 🔧 创建新的AbortController
      abortController = new AbortController()
      state.value.isRunning = true
      state.value.maxRounds = options.maxRounds || 20

      // 🆕 启动超时计时器（2分钟）
      console.log('⏱️ [超时控制] 启动2分钟超时计时器')
      timeoutId = setTimeout(() => {
        console.log('⏰ [超时控制] 执行超时，自动停止')
        cancel()
        options.onProgress?.({
          type: 'error',
          message: '执行超时：已超过2分钟，自动停止以防止卡死',
          round: state.value.currentRound
        })
        options.onError?.(new Error('执行超时：已超过2分钟'))
      }, EXECUTION_TIMEOUT)

      // 🔐 认证前置检查，避免在未登录状态下进入循环空转
      try {
        const token = localStorage.getItem('kindergarten_token') || localStorage.getItem('token') || localStorage.getItem('auth_token')
        if (!token) {
          const authErr = new Error('未登录或会话已过期，请先登录后再使用智能代理')
          state.value.error = authErr.message
          state.value.isRunning = false
          options.onProgress?.({ type: 'error', message: authErr.message, round: 0 })
          options.onError?.(authErr)
          throw authErr
        }
      } catch (e) {
        throw e
      }

      // 添加用户消息到历史
      state.value.conversationHistory.push({
        role: 'user',
        content: initialMessage
      })

      let currentMessage = initialMessage
      let finalResult: any = null
      let totalTokenUsage = 0
      let roundsWithoutProgress = 0
      let lastResultHash = ''

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🚀 [多轮调用] 开始执行（带安全监控）')
      console.log('📝 [多轮调用] 初始消息:', initialMessage)
      console.log('🔢 [多轮调用] 最大轮数:', state.value.maxRounds)
      console.log('👤 [多轮调用] 用户ID:', options.userId)
      console.log('💬 [多轮调用] 会话ID:', options.conversationId)
      console.log('🔧 [多轮调用] 上下文:', JSON.stringify(options.context, null, 2))
      console.log('🛡️ [多轮调用] 安全监控已启用')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      options.onProgress?.({
        type: 'start',
        message: `开始多轮工具调用，最大轮数: ${state.value.maxRounds}`,
        round: 0
      })

      // 主循环 - 带安全监控
      while (canContinue.value) {
        state.value.currentRound++
        const currentRound = state.value.currentRound

        // 🛡️ 安全检查：防止过多轮次无进度
        if (roundsWithoutProgress >= 3) {
          console.warn(`🚨 [安全中断] 连续${roundsWithoutProgress}轮无进度，强制停止循环`)
          state.value.error = `连续${roundsWithoutProgress}轮无进度，已自动停止`
          break
        }

        // 🛡️ 安全检查：轮数限制（除了最大轮数外再添加硬限制）
        if (currentRound > Math.min(state.value.maxRounds, 50)) {
          console.warn(`🚨 [安全中断] 达到硬性轮数限制(${currentRound})，强制停止循环`)
          state.value.error = `达到硬性轮数限制(${currentRound})，已自动停止`
          break
        }

        console.log(`🔄 [多轮调用] 第 ${currentRound}/${state.value.maxRounds} 轮 (无进度轮数: ${roundsWithoutProgress})`)
        options.onProgress?.({
          type: 'round_start',
          message: `第 ${currentRound}/${state.value.maxRounds} 轮`,
          round: currentRound,
          data: {
            progress: progress.value,
            totalTokenUsage,
            roundsWithoutProgress
          }
        })

        try {
          // 🆕 为每个请求创建独立的AbortController（避免新请求中止旧请求）
          const roundAbortController = new AbortController()

          // 🆕 使用单次调用接口（前端多轮调用架构）
          const result = await callUnifiedIntelligenceStreamSingleRound(
            {
              message: currentMessage,
              userId: options.userId,
              conversationId: options.conversationId,
              context: {
                ...options.context,
                messages: state.value.conversationHistory, // 🔧 传递完整消息历史
                currentRound: currentRound,
                maxRounds: state.value.maxRounds
              }
            },
            (event: any) => {
              // 转发进度事件，添加轮数信息
              options.onProgress?.({
                ...event,
                round: currentRound
              })

              // 🎯 处理工具意图事件
              if (event.type === 'tool_intent') {
                console.log(`💭 [多轮调用] 工具意图 (第${currentRound}轮):`, event.data?.message)
                // 直接转发工具意图事件，让上层处理
              }

              // 🆕 处理工具解说事件
              if (event.type === 'tool_narration') {
                console.log(`💬 [多轮调用] 工具解说 (第${currentRound}轮):`, event.data?.narration)
                const narrationToolName = event.data?.toolName || event.data?.name || ''
                const narration = event.data?.narration || ''
                const narrationType = event.data?.type || 'intent' // 'intent' 或 'result'
                
                if (narration && narrationToolName) {
                  // 如果是意图类型（intent），先存储到待关联列表
                  if (narrationType === 'intent') {
                    state.value.pendingToolNarrations.set(narrationToolName, narration)
                    console.log(`📝 [多轮调用] 已存储工具意图到待关联列表: ${narrationToolName}`, narration.substring(0, 50))
                  }
                  
                  // 查找对应的工具调用并更新解说
                  const toolCall = state.value.toolCallHistory.find(tc => 
                    tc.name === narrationToolName || 
                    tc.name?.includes(narrationToolName) ||
                    narrationToolName.includes(tc.name || '')
                  )
                  
                  if (toolCall) {
                    toolCall.narration = narration
                    console.log(`✅ [多轮调用] 已更新工具解说: ${toolCall.name}`, narration.substring(0, 50))
                  } else {
                    // 如果没找到，尝试匹配最后一个工具调用
                    const lastToolCall = state.value.toolCallHistory.slice(-1)[0]
                    if (lastToolCall) {
                      lastToolCall.narration = narration
                      console.log(`✅ [多轮调用] 已更新最后一个工具调用的解说: ${lastToolCall.name}`, narration.substring(0, 50))
                    } else if (narrationType === 'intent') {
                      // 如果是意图类型且没找到工具调用，这是正常的（工具调用还没开始）
                      // 意图已经存储到 pendingToolNarrations，会在 tool_call_start 时关联
                      console.log(`📋 [多轮调用] 工具意图已存储，等待工具调用开始: ${narrationToolName}`)
                    } else {
                      console.warn(`⚠️ [多轮调用] 未找到对应的工具调用来添加解说: ${narrationToolName}`)
                    }
                  }
                }
              }

              // 处理工具调用事件
              if (event.type === 'tool_call' || event.type === 'tool_call_start' || event.type === 'tool_call_complete') {
                const toolName = event.data?.name || ''
                
                // 🆕 检查是否有待关联的工具意图
                if (toolName && state.value.pendingToolNarrations.has(toolName)) {
                  const pendingNarration = state.value.pendingToolNarrations.get(toolName)!
                  // 查找或创建工具调用并关联意图
                  let toolCall = state.value.toolCallHistory.find(tc => tc.name === toolName)
                  
                  if (!toolCall) {
                    // 如果工具调用还不存在，创建一个新的
                    toolCall = {
                      name: toolName,
                      arguments: event.data?.arguments || {},
                      result: event.data?.result,
                      narration: pendingNarration
                    }
                    state.value.toolCallHistory.push(toolCall)
                    console.log(`✅ [多轮调用] 已创建工具调用并关联意图: ${toolName}`, pendingNarration.substring(0, 50))
                  } else {
                    // 如果已存在，更新意图
                    toolCall.narration = pendingNarration
                    console.log(`✅ [多轮调用] 已关联工具意图: ${toolName}`, pendingNarration.substring(0, 50))
                  }
                  
                  // 从待关联列表中移除
                  state.value.pendingToolNarrations.delete(toolName)
                }
                
                // 处理 tool_call_complete 事件
                if (event.type === 'tool_call_complete') {
                  // 🆕 优先从 pendingToolNarrations 获取意图，然后从 event.data，最后从 toolCallHistory
                  const narration = 
                    (toolName && state.value.pendingToolNarrations.get(toolName)) ||
                    event.data?.narration ||
                    state.value.toolCallHistory.find(tc => tc.name === toolName)?.narration
                  
                  // 如果从 pendingToolNarrations 获取到了，移除它
                  if (toolName && state.value.pendingToolNarrations.has(toolName)) {
                    state.value.pendingToolNarrations.delete(toolName)
                  }
                  
                  const toolCall: ToolCall = {
                    name: toolName,
                    arguments: event.data?.arguments || {},
                    result: event.data?.result,
                    narration: narration
                  }

                  // 更新或添加工具调用记录
                  const existingToolCall = state.value.toolCallHistory.find(tc => tc.name === toolName)
                  if (existingToolCall) {
                    Object.assign(existingToolCall, toolCall)
                  } else {
                    state.value.toolCallHistory.push(toolCall)
                  }

                  // 通知工具调用
                  options.onToolCall?.(toolCall)
                }
              }
            },
            roundAbortController.signal // 🔧 传递独立的AbortSignal用于中止当前请求
          )

          finalResult = result

          // 🛡️ 安全监控：计算结果哈希，检测进度
          const resultStr = JSON.stringify(result?.data || result)
          const currentResultHash = resultStr.substring(0, 200) // 只取前200字符作为哈希

          if (currentResultHash === lastResultHash) {
            roundsWithoutProgress++
            console.warn(`⚠️ [进度检测] 第${currentRound}轮结果与上一轮相同，无进度+1 (总计: ${roundsWithoutProgress})`)
          } else {
            roundsWithoutProgress = 0
            console.log(`✅ [进度检测] 第${currentRound}轮有新进度，重置无进度计数`)
          }
          lastResultHash = currentResultHash

          // 🛡️ Token使用监控
          const tokenUsage = result?.data?.tokenUsage || result?.tokenUsage || 0
          totalTokenUsage += tokenUsage
          console.log(`💰 [Token监控] 第${currentRound}轮使用: ${tokenUsage}, 累计: ${totalTokenUsage}`)

          // 🆕 添加助手消息到历史（符合OpenAI格式）
          // 🔧 Token优化：只保留finalAnswer，不保留thinking内容
          // thinking内容仅供前端展示，不应传递给后续轮次的AI
          const assistantMessage: ConversationMessage = {
            role: 'assistant',
            // 🔧 优先使用finalAnswer字段，如果没有则使用content
            // finalAnswer是后端明确标记的最终回复，不包含thinking内容
            content: result?.finalAnswer || result?.data?.finalAnswer || result?.content || result?.data?.message || result?.message || '',
            toolCalls: result?.toolCalls || []
          }

          // 🔧 Token优化日志
          const thinkingLength = result?.thinking?.length || result?.data?.thinking?.length || 0
          const finalAnswerLength = assistantMessage.content?.length || 0
          console.log(`💰 [Token优化] 第${currentRound}轮 - thinking长度: ${thinkingLength}, finalAnswer长度: ${finalAnswerLength}`)
          if (thinkingLength > 0) {
            console.log(`✅ [Token优化] 已过滤thinking内容，节省约 ${Math.ceil(thinkingLength * 1.5)} tokens`)
          }

          state.value.conversationHistory.push(assistantMessage)

          // 🔧 第一阶段优化：限制历史长度，防止无限累积
          limitConversationHistory()

          console.log(`✅ [多轮调用] 第 ${currentRound} 轮完成 (累计Token: ${totalTokenUsage})`)
          console.log(`🔍 [多轮调用] 返回结果:`, {
            content: assistantMessage.content?.substring(0, 100),
            toolCallsCount: assistantMessage.toolCalls?.length || 0,
            needsContinue: result?.needsContinue,
            isComplete: result?.isComplete
          })
          options.onRoundComplete?.(currentRound, result)

          // 🆕 添加工具结果到历史（符合OpenAI格式）
          if (result?.toolResults && result.toolResults.length > 0) {
            console.log(`🔧 [多轮调用] 添加 ${result.toolResults.length} 个工具结果到历史`)
            for (const toolResult of result.toolResults) {
              state.value.conversationHistory.push({
                role: 'tool',
                toolCallId: toolResult.toolCallId,  // ✅ 修复：使用 toolCallId
                tool_call_id: toolResult.toolCallId,
                name: toolResult.name,
                content: JSON.stringify(toolResult.result)
              })
            }
            // 🔧 第一阶段优化：添加工具结果后也要限制历史长度
            limitConversationHistory()
          }

          // 检查是否需要继续
          if (!shouldContinue(result)) {
            console.log(`🎯 [多轮调用] 任务完成，共执行 ${currentRound} 轮，总Token使用: ${totalTokenUsage}`)
            state.value.isComplete = true
            break
          }

          // 🆕 准备下一轮消息（必须提供非空message，后端才会受理下一轮请求）
          const autoContinueMessage =
            result?.nextUserMessage ||
            result?.data?.nextUserMessage ||
            (result?.needsContinue ? '继续执行剩余任务' : '请继续完成未完成任务')

          currentMessage = (autoContinueMessage || '').trim() || '请继续执行上一轮未完成的步骤'
          console.log(`🔧 [多轮调用] 准备第 ${currentRound + 1} 轮，消息历史长度: ${state.value.conversationHistory.length}`, {
            autoContinueMessage: currentMessage
          })

        } catch (roundError: any) {
          console.error(`❌ [多轮调用] 第 ${currentRound} 轮失败:`, roundError)

          const msg: string = String(roundError?.message || roundError || '')

          // ✅ 修复：处理 AbortError（请求被中止）
          if (roundError?.name === 'AbortError') {
            console.log(`🛑 [多轮调用] 第 ${currentRound} 轮被中止，停止循环`)
            state.value.isRunning = false
            state.value.isComplete = true
            break
          }

          const isAuthError = /401|403|未提供认证令牌|Unauthorized|身份验证|认证失败/.test(msg)
          const isNetworkError = /Failed to fetch|NetworkError|网络错误|TypeError/.test(msg)
          const isServerError = /HTTP error! status:\s*(5\d\d)/.test(msg)

          // 对致命错误直接停止，避免空转浪费token
          if (isAuthError || isNetworkError || isServerError) {
            const friendly = isAuthError
              ? '认证失败或未登录，请先登录后再试'
              : isNetworkError
                ? '网络异常，请检查网络后重试'
                : '服务器异常，请稍后再试'

            state.value.error = friendly
            state.value.isRunning = false
            state.value.isComplete = true

            options.onProgress?.({
              type: 'error',
              message: `第 ${currentRound} 轮失败：${friendly}`,
              round: currentRound,
              data: { error: msg }
            })

            // 记录错误到会话历史
            state.value.conversationHistory.push({
              role: 'system',
              content: `第 ${currentRound} 轮执行失败：${friendly}`
            })

            // 终止循环
            break
          }

          // 非致命错误：仅在未到达最大轮数时尝试下一轮
          if (currentRound < state.value.maxRounds) {
            options.onProgress?.({
              type: 'round_error',
              message: `第 ${currentRound} 轮失败，尝试继续: ${msg}`,
              round: currentRound,
              data: { error: msg }
            })

            state.value.conversationHistory.push({
              role: 'system',
              content: `第 ${currentRound} 轮执行失败: ${msg}`
            })

            continue
          } else {
            throw roundError
          }
        }
      }

      // 检查是否达到最大轮数
      if (state.value.currentRound >= state.value.maxRounds && !state.value.isComplete) {
        console.log(`⚠️ [多轮调用] 达到最大轮数 ${state.value.maxRounds}`)
        options.onProgress?.({
          type: 'max_rounds_reached',
          message: `已达到最大轮数 ${state.value.maxRounds}，任务可能未完全完成`,
          round: state.value.currentRound
        })
      }

      state.value.isRunning = false
      
      console.log(`🎉 [多轮调用] 执行完成，共 ${state.value.currentRound} 轮`)

      // 🆕 执行完成，清理资源
      cleanup()

      options.onProgress?.({
        type: 'complete',
        message: `多轮调用完成，共执行 ${state.value.currentRound} 轮`,
        round: state.value.currentRound,
        data: finalResult
      })

      options.onComplete?.(finalResult)

      return finalResult

    } catch (error: any) {
      console.error('❌ [多轮调用] 执行失败:', error)

      // 🆕 执行失败，清理资源
      cleanup()

      state.value.error = error.message || '多轮调用失败'
      state.value.isRunning = false

      options.onProgress?.({
        type: 'error',
        message: `多轮调用失败: ${error.message}`,
        round: state.value.currentRound
      })

      options.onError?.(error)

      throw error
    }
  }

  /**
   * 🆕 清理资源函数
   */
  function cleanup() {
    // 🔧 中止所有正在进行的请求
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    // 🆕 清理超时计时器
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
      console.log('⏱️ [超时控制] 已清理超时计时器')
    }
  }

  /**
   * 取消执行
   */
  function cancel() {
    if (state.value.isRunning) {
      console.log('🛑 [多轮调用] 取消执行')
      cleanup()
      state.value.isRunning = false
      state.value.isComplete = true
      state.value.error = '执行已取消'
    }
  }

  return {
    // 状态
    state,
    progress,
    canContinue,
    
    // 方法
    executeMultiRound,
    cancel,
    reset
  }
}

