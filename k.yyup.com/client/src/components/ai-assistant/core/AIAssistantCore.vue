<!--
  AI助手核心逻辑组件
  从 AIAssistant.vue 提取核心业务逻辑

  🧠 核心职责：
  ├─ 多轮工具调用处理 (原文件第1500-3000行逻辑)
  ├─ AI响应流程管理 (思考→工具调用→答案)
  ├─ 状态协调和事件处理
  ├─ 业务逻辑集中处理
  └─ 不渲染UI，专注逻辑处理

  🔧 主要功能：
  ├─ handleMultiRoundToolCalling - 多轮工具调用核心方法
  ├─ 集成 useAIAssistantState - 状态管理
  ├─ 集成 useMessageHandling - 消息处理
  ├─ 集成 useAIResponse - AI响应处理
  └─ 事件协调和状态同步

  📊 性能优化：
  ├─ 不渲染DOM，纯逻辑处理
  ├─ 状态管理优化
  ├─ 事件防抖和节流
  └─ 内存管理和清理
-->

<template>
  <div class="ai-assistant-core">
    <!-- 核心逻辑组件不渲染UI，只处理业务逻辑 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useChatHistory } from '@/composables/useChatHistory'
import { useMultiRoundToolCalling } from '@/composables/useMultiRoundToolCalling'
import { usePageAwareness } from '@/composables/usePageAwareness'
import { useWorkflowSteps } from '@/composables/useWorkflowSteps'
import { useAIAssistantState } from '../composables/useAIAssistantState'
import { useMessageHandling } from '../composables/useMessageHandling'
import { useAIResponse } from '../composables/useAIResponse'
import type { AIAssistantProps, AIAssistantEmits } from '../types/aiAssistant'

// ==================== Props & Emits ====================
const props = defineProps<AIAssistantProps>()
const emit = defineEmits<AIAssistantEmits>()

console.log('✅ [AIAssistantCore] Script block loaded')

// ==================== 核心依赖 ====================
const route = useRoute()
const userStore = useUserStore()

// ==================== Composables ====================
const chatHistory = useChatHistory()
const multiRound = useMultiRoundToolCalling()
const currentPageContext = usePageAwareness()
const workflowSteps = useWorkflowSteps({ autoCleanup: true })

// 🆕 临时存储thinking内容，用于下一个工具调用
const pendingThinkingContent = ref<string>('')

// 🎯 标志：是否已经显示过思考过程（每次查询只显示一次）
const hasShownThinking = ref<boolean>(false)

// 🔍 搜索消息ID，用于更新搜索进度
const currentSearchMessageId = ref<string>('')

// 使用拆分的状态管理
const {
  // 布局状态
  leftSidebarCollapsed,
  fullscreenState,
  
  // Token状态
  tokenUsage,
  tokenLoading,
  
  // 工具和组件状态
  toolCalls,
  renderedComponents,
  
  // 思考状态（保留用于对话框显示）
  isThinking,
  currentThinkingMessage,
  
  // 会话状态
  conversationId,
  conversations,
  conversationsLoading,
  
  // 工作流状态
  activeStepQueues,
  
  // 输入状态
  inputMessage,
  sending,
  
  // 对话框状态
  statisticsVisible,
  quickQueryGroupsVisible,

  // 移动端预览状态
  mobilePreviewVisible,
  mobilePreviewData,

  // 缺失字段对话框状态
  missingFieldsDialogVisible,
  missingFieldsData,

  // 状态操作方法
  toggleLeftSidebar,
  resetState
} = useAIAssistantState()

// 使用消息处理
const {
  ensureConversation,
  refreshMessagesFromServer
} = useMessageHandling()

// 使用AI响应处理
const aiResponse = useAIResponse()
const {
  currentAIResponse,
  startContextOptimization,
  updateOptimizationProgress,
  completeContextOptimization
} = aiResponse

// ==================== 计算属性 ====================
const role = computed(() => userStore.userInfo?.role || 'user')

// ==================== 核心业务方法 ====================

/**
 * 检测消息是否是搜索查询
 */
function isSearchQuery(message: string): boolean {
  const searchKeywords = [
    '搜索', '查找', '搜一下', '找一下', '网上', '最新', '新闻', '政策',
    '资讯', '信息', '了解', '什么是', '如何', '怎么', '为什么',
    '最近', '今天', '昨天', '本周', '本月', '今年', '趋势', '动态',
    '网页', '互联网', '在线', '百度', '谷歌'
  ]

  const lowerMessage = message.toLowerCase()
  const hasSearchKeyword = searchKeywords.some(keyword => lowerMessage.includes(keyword))
  const hasQuestionMark = message.includes('?') || message.includes('？')
  const isLongQuery = message.length > 20

  const result = hasSearchKeyword || hasQuestionMark || isLongQuery
  console.log(`🔍 [isSearchQuery] 消息: "${message.substring(0, 30)}..." → 搜索查询=${result}`)

  return result
}

// 处理多轮工具调用
async function handleMultiRoundToolCalling(message: string) {
  console.log('🟠 [AIAssistantCore] handleMultiRoundToolCalling 被调用', {
    message,
    messageLength: message.length,
    currentlySending: sending.value,
    hasMultiRound: !!multiRound
  })
  
  try {
    console.log('🚀 [AIAssistantCore] 开始执行 multiRound.executeMultiRound')
    
    // ✅ 检测是否是搜索查询
    const isSearch = isSearchQuery(message)
    console.log('🔍 [AIAssistantCore] 搜索检测完成:', { isSearch, message: message.substring(0, 20) })
    
    await multiRound.executeMultiRound(message, {
      userId: userStore.userInfo?.id?.toString() || undefined,
      conversationId: conversationId.value || undefined,
      maxRounds: 20,
      context: {
        currentPage: route.path,
        pageTitle: currentPageContext.currentPageGuide?.value?.pageName || route.meta?.title as string || 'AI助手',
        userRole: role.value,
        role: role.value,
        // 🔧 启用网络搜索：检测消息中是否包含搜索关键词
        enableWebSearch: isSearch  // ✅ 修复：直接调用函数，不用 this.
      },

      // 进度回调
      onProgress: (event) => {
        console.log(`[多轮调用] ${event.type}:`, event.message)

  switch (event.type) {
    case 'context_optimization_start':
            // 🧠 开始上下文优化
      startContextOptimization()
      break

    case 'context_optimization_progress':
            // 🧠 更新优化进度
      if (event.data?.percentage !== undefined && event.data?.text) {
        updateOptimizationProgress(event.data.percentage, event.data.text)
      }
      break

    case 'context_optimization_complete':
            // 🧠 完成上下文优化
      if (event.data) {
        completeContextOptimization(event.data)
      }
      break

    case 'thinking_start':
            // 🆕 处理thinking_start事件 - 关闭加载状态
            console.log('🤔 [AIAssistantCore] thinking_start 事件触发，关闭加载状态')
      emit('loading-complete')
      break

    case 'thinking':
            // 🔍 [修复] 使用真实的reasoning_content而不是硬编码的message
            console.log('🔍 [AIAssistantCore] thinking event:', event);

            // 提取真实的思考内容
      const thinkingContent = typeof event.data === 'string'
        ? event.data
              : (event.data?.content || event.data?.message || event.message || '');

            console.log('🔍 [AIAssistantCore] thinkingContent:', thinkingContent.substring(0, 100));

      if (thinkingContent) {
              currentThinkingMessage.value = thinkingContent;
              // 🆕 存储thinking内容，用于下一个工具调用
              pendingThinkingContent.value = thinkingContent;
              console.log('💭 [Thinking] 已存储thinking内容，等待工具调用');

              // 🆕 创建thinking消息，显示在聊天历史中
              if (!hasShownThinking.value) {
                chatHistory.addMessage({
                  id: `thinking-${Date.now()}`,
                  role: 'assistant' as const,
                  type: 'thinking' as const,
                  content: thinkingContent,
                  timestamp: new Date()
                })
                hasShownThinking.value = true
                console.log('✅ [Thinking] 已添加thinking消息到聊天历史')
              }

              // 同时更新AI响应显示
              aiResponse.showThinkingPhase(thinkingContent);
      }
      break

    case 'thinking_update':
            // 🔍 处理thinking_update事件（来自后端的reasoning_content）
            console.log('🔍 [AIAssistantCore] thinking_update event:', event);

            // 提取思考内容
      const thinkingUpdateContent = typeof event.data === 'string'
        ? event.data
              : (event.data?.content || event.data?.message || event.message || '');

            console.log('🔍 [AIAssistantCore] thinkingUpdateContent:', thinkingUpdateContent.substring(0, 100));

      if (thinkingUpdateContent) {
              currentThinkingMessage.value = thinkingUpdateContent;

              // 🎯 只在第一次显示思考过程
              if (!hasShownThinking.value) {
                // 🎯 新架构：直接添加思考消息到聊天历史
                // 检查最后一条消息是否是思考消息，如果是则更新，否则添加新消息
                const lastMsg = chatHistory.currentMessages.value[chatHistory.currentMessages.value.length - 1]
        if (lastMsg && lastMsg.type === 'thinking' && lastMsg.role === 'assistant') {
                  // 更新现有思考消息
                  lastMsg.content = thinkingUpdateContent
                  lastMsg.timestamp = new Date()
                  console.log('✅ [thinking_update] 更新现有思考消息')
          } else {
                  // 添加新的思考消息
                  const thinkingMsg = {
                    id: `thinking-${Date.now()}`,
                    role: 'assistant' as const,
                    type: 'thinking' as const,
                    content: thinkingUpdateContent,
                    timestamp: new Date()
                  }
                  chatHistory.currentMessages.value.push(thinkingMsg)
                  console.log('✅ [thinking_update] 添加新思考消息到聊天历史')

                  // 🔧 修复：当思考消息被添加时，立即触发加载完成事件
                  // 这样思考消息就能立即显示，而不是被加载消息覆盖
                  emit('loading-complete')
                  console.log('✅ [thinking_update] 触发加载完成事件，显示思考消息')

                  // 标记已经显示过思考过程
                  hasShownThinking.value = true
                  console.log('✅ [thinking_update] 已标记显示过思考过程')
                }
        } else {
                console.log('⏭️ [thinking_update] 跳过重复的思考过程显示')
        }
      }
      break

    case 'thinking_complete':
            // 🆕 处理thinking_complete事件
            console.log('🤔 [AIAssistantCore] thinking_complete 事件触发')
            // 思考完成，可以在这里做一些UI更新
            break

    case 'tool_intent':
            // 🎯 流式显示：立即创建工具意图消息
            console.log('💡 [工具意图] tool_intent 事件:', event.data)
      const intentMessage = event.data?.message || event.message || ''
      const intentToolName = event.data?.toolName || ''

      if (intentMessage) {
              // 🎯 立即创建工具意图消息并添加到聊天历史
        chatHistory.addMessage({
          id: `tool-intent-${Date.now()}`,
          role: 'assistant' as const,
          type: 'tool_intent' as const,
          content: intentMessage,
          toolName: intentToolName,
          timestamp: new Date()
        })
              console.log('✅ [工具意图] 已添加到聊天历史:', intentMessage)

              // 存储意图信息供后续使用
        aiResponse.pendingToolIntent.value = intentMessage
        aiResponse.pendingToolName.value = intentToolName
      }
      break

  
    case 'tool_call_start':
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.log('🔧 [工具调用开始] tool_call_start 事件触发')
            console.log('📊 [事件数据]:', JSON.stringify(event, null, 2))
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

            // 🎯 确保AI响应容器可见
            if (!currentAIResponse.value.visible) {
              currentAIResponse.value.visible = true
              console.log('✅ [工具调用] 已激活AI响应容器')
            }

            const toolId = `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            const toolDisplayName = event.data?.name || ''
            // 🎯 优先使用事件中的意图，如果没有则使用之前存储的意图
            const toolIntent = event.data?.intent || aiResponse.pendingToolIntent.value || ''
            const toolDescription = event.message || event.data?.description || ''

            console.log('🔍 [工具信息]:', {
              toolId,
              toolDisplayName,
              toolIntent,
              toolDescription
            })

            // 🎯 创建增强的工具调用对象，包含意图信息
            // 🔧 修复：执行步骤逐步添加，而不是一次性创建
            const startTimestamp = Date.now()
            const toolCallData = {
              callId: toolId,
              name: toolDisplayName,
              description: toolDisplayName,
              details: toolDescription,
              status: 'running' as const,
              params: event.data?.arguments || {},
              result: null,
              executionSteps: [] as string[], // 🎯 初始为空，逐步添加
              startTime: startTimestamp,
              duration: 0,
              // 🎯 新增字段
              intent: toolIntent,
              friendlyName: toolDisplayName
            }
            
            // 🎯 逐步添加初始步骤
            if (toolIntent) {
              toolCallData.executionSteps.push(`💭 意图：${toolIntent}`)
            }
            if (toolDescription) {
              toolCallData.executionSteps.push(`🔧 描述：${toolDescription}`)
            }
            toolCallData.executionSteps.push(`⚙️ 开始执行：${toolDisplayName}`)

            // 🎯 流式显示：立即创建工具调用消息并添加到聊天历史
            chatHistory.addMessage({
              id: toolId,
              role: 'assistant' as const,
              type: 'tool_call_start' as const,
              content: toolDisplayName,
              toolName: toolDisplayName,
              toolIntent: toolIntent,
              toolDescription: toolDescription,
              toolStatus: 'running' as const,
              timestamp: new Date(),
              startTimestamp,
              duration: 0
            })
            console.log('✅ [工具调用] 已立即添加到聊天历史:', toolId, toolDisplayName)

            // 添加到AI响应的函数调用列表
            currentAIResponse.value.functionCalls.push(toolCallData)
            console.log('✅ [工具调用] 已添加工具到functionCalls列表，当前数量:', currentAIResponse.value.functionCalls.length)

            // 🔧 [修复] 手动触发 ref 更新，确保 Vue 检测到变化
            currentAIResponse.value = { ...currentAIResponse.value }

            // 同时添加到工具调用列表（保持兼容性）
            const toolCallState = {
              id: toolId,
              name: toolDisplayName,
              intent: toolIntent,
              description: toolDescription,
              thinking: pendingThinkingContent.value, // 🆕 添加thinking内容
              status: 'calling' as const,
              progress: 0
            }

            toolCalls.value.push(toolCallState)

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.log('✅ [工具调用] 已添加到toolCalls列表')
            console.log('📊 [toolCalls当前数量]:', toolCalls.value.length)
            console.log('💭 [Thinking内容]:', pendingThinkingContent.value.substring(0, 100))
            console.log('📋 [toolCalls内容]:', JSON.stringify(toolCalls.value, null, 2))
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

            // 清理已使用的意图信息和thinking内容
            aiResponse.clearPendingToolInfo()
            pendingThinkingContent.value = '' // 🆕 清空thinking内容
      break

    case 'tool_call_complete':
            // 🔧 修复：如果找不到对应的工具调用，创建一个新的
      const completedToolName = event.data?.name || '未知工具'
      const completedToolIntent = event.data?.intent || ''
      const completedToolDescription = event.message || event.data?.description || ''

            // 🎯 检测缺失字段状态（修复：数据结构是嵌套的）
      if (event.data?.result?.result?.type === 'missing_fields') {
        console.log('⚠️ [缺失字段] 检测到缺失字段，显示补充对话框')
              console.log('📝 [缺失字段] 缺失字段数据:', event.data.result.result)

              // 🎯 通过emit事件通知父组件显示对话框
        emit('missing-fields-detected', event.data.result.result)

              // 不继续处理工具完成逻辑
              break
            }

            // 🎯 更新 toolCalls（用于RightSidebar）
      let completedTool = toolCalls.value.find(t =>
          (t.status === 'calling' || t.status === 'processing') &&
          (t.name === completedToolName || t.intent === completedToolIntent)
        )

      if (completedTool) {
              // 更新现有工具调用
              completedTool.status = 'completed'
              completedTool.progress = 100
              console.log('✅ [工具完成] 更新现有工具调用:', completedToolName)
      } else {
              // 创建新的工具调用记录（用于直接收到tool_call_complete的情况）
        const newToolId = `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newToolCall = {
          id: newToolId,
          name: completedToolName,
          intent: completedToolIntent,
          description: completedToolDescription,
                status: 'completed' as const,
                progress: 100
        }
        toolCalls.value.push(newToolCall)
              console.log('✅ [工具完成] 创建新的工具调用记录:', completedToolName)
      }

            // 🎯 同时更新 currentAIResponse.functionCalls（用于MessageList）
      const completedFunctionCall = currentAIResponse.value.functionCalls.find(fc =>
        fc.status === 'running' &&
        (fc.name === completedToolName || fc.friendlyName === completedToolName)
      )

      if (completedFunctionCall) {
              // 更新现有函数调用状态
              completedFunctionCall.status = 'completed'
        completedFunctionCall.result = event.data?.result?.result || event.data?.result || null
        completedFunctionCall.duration = Date.now() - (completedFunctionCall.startTime || Date.now())
        
              // 🎯 添加完成步骤
        if (completedFunctionCall.executionSteps) {
            completedFunctionCall.executionSteps.push(`✅ 执行完成：${completedToolName}`)
          }
              
              console.log('✅ [工具完成] 更新currentAIResponse.functionCalls中的工具调用:', completedToolName)
      }

            // 🎯 流式显示：立即更新聊天历史中的工具调用消息状态
      const messages = chatHistory.currentMessages.value
            const toolCallMsg = messages.find(m =>
              (m.type === 'tool_call_start' || m.type === 'tool_call') &&
              m.toolName === completedToolName &&
              (m.toolStatus === 'running' || !m.toolStatus)
            )

      if (toolCallMsg) {
              // 更新消息状态与耗时
        const isSuccess = event.data?.result?.status === 'success'
        const endTime = Date.now()
        const startTime = toolCallMsg.startTimestamp || endTime

              toolCallMsg.toolStatus = isSuccess ? 'completed' : 'failed'
        toolCallMsg.duration = toolCallMsg.duration || (endTime - startTime)
              console.log('✅ [工具调用] 聊天历史状态已更新:', toolCallMsg.toolName, '→', toolCallMsg.toolStatus, `，耗时: ${toolCallMsg.duration}ms`)
            }

      // 🔧 手动触发响应式更新
      currentAIResponse.value = { ...currentAIResponse.value }
            console.log('✅ [工具完成] 已触发currentAIResponse响应式更新，当前functionCalls数量:', currentAIResponse.value.functionCalls.length)

            // 🎯 处理preview_instruction - 显示HTML预览
            // 注意：后端返回的数据结构是 event.data.result.result.preview_instruction
            const resultData = event.data?.result?.result || event.data?.result || {}
            const uiInstruction = resultData.preview_instruction || resultData.ui_instruction

            console.log('🔍 [工具完成] 检查preview_instruction:', {
              hasResult: !!resultData,
              hasUiInstruction: !!uiInstruction,
              instructionType: uiInstruction?.type,
              resultKeys: Object.keys(resultData),
              eventDataKeys: Object.keys(event.data || {}),
              eventDataResultKeys: Object.keys(event.data?.result || {})
            })

            if (uiInstruction?.type === 'html_preview') {
              console.log('🎨 [HTML预览] 检测到preview_instruction，准备显示HTML预览')

              // 提取HTML代码和元数据
              const htmlCode = uiInstruction.code || resultData.html_code || ''
              const htmlTitle = uiInstruction.title || resultData.title || 'HTML预览'
              const htmlContentType = resultData.content_type || 'course'

              console.log('🎨 [HTML预览] 预览数据:', {
                codeLength: htmlCode.length,
                title: htmlTitle,
                contentType: htmlContentType
              })

              // 通过emit通知父组件显示HTML预览
              emit('show-html-preview', {
                code: htmlCode,
                title: htmlTitle,
                contentType: htmlContentType
              })

              // 🎯 右侧面板已移除

              console.log('✅ [HTML预览] 已发送show-html-preview事件')
            }
      break

    case 'tool_narration':
      // 🎯 工具解说事件：区分【通用工具解说】与【工作流步骤解说】
      console.log('💬 [工具解说] tool_narration 事件:', event.data)
      const narrationToolName = event.data?.toolName || event.data?.name || event.message || ''
      const narration = event.data?.narration || event.data?.message || event.message || ''
      const queueId = event.data?.queueId as string | undefined

      // 🧭 是否为活动工作流的步骤解说（execute_activity_workflow）
      const isActivityWorkflowNarration =
        narrationToolName === 'execute_activity_workflow' && !!queueId

      if (!narration) {
        console.warn('⚠️ [工具解说] 缺少解说内容')
        break
      }

      if (isActivityWorkflowNarration) {
        // 🧩 工作流专用：将解说写入当前步骤 details，走「步骤时间线」组件展示
        try {
          workflowSteps.updateCurrentStep(queueId, {
            details: narration
          })
          console.log(
            '✅ [工作流解说] 已更新步骤详情到工作流队列:',
            queueId,
            narration.substring(0, 80)
          )
        } catch (err) {
          console.warn('⚠️ [工作流解说] 更新步骤详情失败，回退为普通工具解说:', err)

          // 如果更新失败，退回普通工具解说逻辑
          chatHistory.addMessage({
            id: `narration-${Date.now()}`,
            role: 'assistant' as const,
            type: 'tool_narration' as const,
            content: narration,
            toolName: narrationToolName,
            timestamp: new Date().toISOString()
          })
        }

        // 无论是否成功写入时间线，仍然尝试记录到 functionCalls，便于调试/回放
      } else {
        // 📌 普通工具解说：保持原有行为，直接作为一条工具解说消息插入对话
        chatHistory.addMessage({
          id: `narration-${Date.now()}`,
          role: 'assistant' as const,
          type: 'tool_narration' as const,
          content: narration,
          toolName: narrationToolName,
          timestamp: new Date().toISOString()
        })
        console.log(
          '✅ [工具解说] 已创建工具解说消息:',
          narrationToolName,
          narration.substring(0, 50)
        )
      }

      // 🎯 同时保存到工具调用的 narration 字段（用于最终消息汇总 / 调试）
      let narrationFunctionCall = currentAIResponse.value.functionCalls.find(fc =>
        (fc.name === narrationToolName ||
          fc.friendlyName === narrationToolName ||
          fc.name?.includes(narrationToolName) ||
          narrationToolName.includes(fc.name || '')) &&
        (fc.status === 'completed' || fc.status === 'running')
      )

      // 如果没找到，尝试匹配最后一个运行中或已完成的工具
      if (!narrationFunctionCall) {
        const lastToolCall = currentAIResponse.value.functionCalls
          .filter(fc => fc.status === 'completed' || fc.status === 'running')
          .slice(-1)[0]
        if (lastToolCall) {
          narrationFunctionCall = lastToolCall
          console.log('🔍 [工具解说] 使用最后一个工具调用:', lastToolCall.name)
        }
      }

      if (narrationFunctionCall) {
        narrationFunctionCall.narration = narration
        console.log('✅ [工具解说] 已添加解说到工具调用:', narrationFunctionCall.name)
        // 触发响应式更新
        currentAIResponse.value = { ...currentAIResponse.value }
      }
      break

          case 'progress':
            // 🎯 处理进度事件，逐步更新执行步骤
            console.log('📊 [进度更新] progress 事件:', event.data)
            const progressToolName = event.data?.name || event.data?.toolName || ''
            const progressMessage = event.data?.message || event.data?.status || ''
            const progressDetails = event.data?.details || ''
            
            if (progressToolName && progressMessage) {
              // 找到对应的工具调用
              const progressFunctionCall = currentAIResponse.value.functionCalls.find(fc =>
                (fc.name === progressToolName || fc.friendlyName === progressToolName) &&
                fc.status === 'running'
              )
              
              if (progressFunctionCall && progressFunctionCall.executionSteps) {
                // 🎯 逐步添加执行步骤
                const stepText = progressDetails 
                  ? `${progressMessage}: ${progressDetails}`
                  : progressMessage
                
                // 避免重复添加相同的步骤
                if (!progressFunctionCall.executionSteps.includes(stepText)) {
                  progressFunctionCall.executionSteps.push(stepText)
                  console.log('✅ [进度更新] 已添加执行步骤:', stepText)
                  // 触发响应式更新
                  currentAIResponse.value = { ...currentAIResponse.value }
                }
              }
              
              // 同时更新 toolCalls 列表的进度
              const progressToolCall = toolCalls.value.find(t =>
                t.name === progressToolName && (t.status === 'calling' || t.status === 'processing')
              )
              if (progressToolCall) {
                progressToolCall.progress = event.data?.progress || progressToolCall.progress || 0
              }
      }
      break

    case 'tool_call_error':
            const failedTool = toolCalls.value.find(t => t.status === 'calling' || t.status === 'processing')
            if (failedTool) {
              failedTool.status = 'error'
              failedTool.progress = 0
            }
            
            // 🎯 同时更新 functionCalls 中的工具状态
            const failedToolName = event.data?.name || ''
            if (failedToolName) {
              const failedFunctionCall = currentAIResponse.value.functionCalls.find(fc =>
                (fc.name === failedToolName || fc.friendlyName === failedToolName) &&
                fc.status === 'running'
              )
              if (failedFunctionCall) {
                failedFunctionCall.status = 'failed'
                failedFunctionCall.result = event.data?.error || event.data?.result || '执行失败'
                // 添加错误步骤
                if (failedFunctionCall.executionSteps) {
                  failedFunctionCall.executionSteps.push(`❌ 执行失败: ${event.data?.error || '未知错误'}`)
                }
                // 触发响应式更新
                currentAIResponse.value = { ...currentAIResponse.value }
              }
            }
      break

          case 'workflow_step_start':
            // 🔄 工作流步骤开始
            console.log('🔄 [工作流] 步骤开始:', event.data)
            if (event.data?.queueId && event.data?.step) {
              const { queueId, step } = event.data

              // 如果队列不存在，创建新队列
              const existingQueue = workflowSteps.getWorkflow(queueId)
              if (!existingQueue) {
                workflowSteps.createWorkflow(
                  queueId,
                  event.data.title || '工作流执行',
                  event.data.description || '正在执行工作流步骤',
                  [step]
                )
                workflowSteps.startWorkflow(queueId)
              } else {
                // 队列已存在，使用composable方法添加步骤
                workflowSteps.addStep(queueId, step)
              }

              // 开始下一个步骤
              workflowSteps.startNextStep(queueId)

              // 更新活动队列列表
              if (!activeStepQueues.value.includes(queueId)) {
                activeStepQueues.value.push(queueId)
              }
            }
      break

          case 'workflow_step_complete':
            // ✅ 工作流步骤完成
            console.log('✅ [工作流] 步骤完成:', event.data)
            if (event.data?.queueId) {
              const { queueId } = event.data

              // 完成当前步骤
              workflowSteps.completeCurrentStep(queueId)

              // 如果有更多步骤，继续执行
              if (event.data?.hasMoreSteps) {
                workflowSteps.startNextStep(queueId)
              } else {
                // 完成整个工作流
                workflowSteps.completeWorkflow(queueId)

                // 5秒后从活动队列中移除
                setTimeout(() => {
                  const index = activeStepQueues.value.indexOf(queueId)
                  if (index > -1) {
                    activeStepQueues.value.splice(index, 1)
                  }
                }, 5000)
              }
            }
      break

    case 'workflow_step_failed':
            // ❌ 工作流步骤失败
            console.error('❌ [工作流] 步骤失败:', event.data)
            if (event.data?.queueId && event.data?.error) {
              const { queueId, error } = event.data
              workflowSteps.failCurrentStep(queueId, error)
            }
      break

      case 'workflow_step_instructions':
            console.log('📋 [工作流] 指令更新:', event.data)
      break

      case 'workflow_user_confirmation_required':
            console.log('📝 [工作流] 等待用户确认活动方案:', event.data)
            if (event.data?.message) {
              chatHistory.addMessage({
                role: 'assistant',
                content: event.data.message,
                type: 'answer',
                toolName: 'execute_activity_workflow'
              })
            }
            if (event.data?.markdownContent) {
              chatHistory.addMessage({
                role: 'assistant',
                content: event.data.markdownContent,
                type: 'answer',
                toolName: 'execute_activity_workflow',
                format: 'markdown'
              })
            }
      break

      case 'workflow_mobile_preview':
            console.log('📱 [工作流] 收到移动端预览数据:', event.data)
            if (event.data?.previewData) {
              const preview = event.data.previewData
              const previewMessage = [
                '📱 移动端预览已生成：',
                preview.activity?.title ? `- 活动：${preview.activity.title}` : '',
                preview.shareUrl ? `- 分享链接：${preview.shareUrl}` : '',
                preview.registrationUrl ? `- 报名链接：${preview.registrationUrl}` : '',
                preview.qrCodeUrl ? `- 二维码：${preview.qrCodeUrl}` : ''
              ].filter(Boolean).join('\n')

              chatHistory.addMessage({
                role: 'assistant',
                content: previewMessage || '📱 移动端预览已生成，可在右侧查看详情。',
                type: 'tool_narration',
                toolName: 'execute_activity_workflow'
              })
            }
      break

      case 'workflow_complete':
            console.log('🎉 [工作流] 执行完成:', event.data)
            chatHistory.addMessage({
              role: 'assistant',
              content: event.data?.message || '🎉 工作流执行完成！',
              type: 'tool_narration',
              toolName: 'execute_activity_workflow'
            })
      break

      // 🔍 搜索事件处理
      case 'search_start':
            console.log('🔍 [搜索] 开始搜索:', event.data)
            const searchStartMsg = {
              id: `search-${Date.now()}`,
              role: 'assistant' as const,
              type: 'search' as const,
              content: event.message || '🔍 正在搜索网络信息...',
              timestamp: new Date(),
              searchStatus: 'start' as const,
              searchQuery: event.data?.query || ''
            }
            chatHistory.addMessage(searchStartMsg)
            // 保存搜索消息ID，用于后续更新
            currentSearchMessageId.value = searchStartMsg.id
      break

      case 'search_progress':
            console.log('🔍 [搜索] 搜索进度:', event.data)
            // 更新最后一条搜索消息
            const lastSearchMsg = chatHistory.currentMessages.value.find(
              m => m.id === currentSearchMessageId.value
            )
            if (lastSearchMsg) {
              lastSearchMsg.searchStatus = 'progress'
              lastSearchMsg.searchPercentage = event.data?.progress || 0
              lastSearchMsg.content = event.message || '搜索中...'
              lastSearchMsg.timestamp = new Date()
              console.log('✅ [搜索] 已更新搜索进度:', event.data?.progress)
            }
      break

      case 'search_complete':
            console.log('✅ [搜索] 搜索完成:', event.data)
            // 更新搜索消息为完成状态
            const completeSearchMsg = chatHistory.currentMessages.value.find(
              m => m.id === currentSearchMessageId.value
            )
            if (completeSearchMsg) {
              completeSearchMsg.searchStatus = 'complete'
              completeSearchMsg.searchPercentage = 100
              completeSearchMsg.searchResultCount = event.data?.resultCount || 0
              completeSearchMsg.searchResults = event.data?.results || []
              completeSearchMsg.content = event.message || `✅ 搜索完成，找到 ${event.data?.resultCount || 0} 个结果`
              completeSearchMsg.timestamp = new Date()
              console.log('✅ [搜索] 已更新搜索完成状态')
            }
            currentSearchMessageId.value = ''
      break

          case 'answer_chunk':
          case 'content_update':
            if (!currentAIResponse.value.answer.visible) {
              currentAIResponse.value.answer.visible = true
              currentAIResponse.value.answer.streaming = true
              currentAIResponse.value.answer.content = ''
            }
            if (event.data?.chunk) {
              currentAIResponse.value.answer.content += event.data.chunk
            } else if (event.data?.content) {
              currentAIResponse.value.answer.content = event.data.content
            }
            break

          case 'answer_complete':
          case 'final_answer':
            currentAIResponse.value.answer.streaming = false
            if (event.data?.content) {
              currentAIResponse.value.answer.content = event.data.content
            }
            // 工具执行已完成或答案已生成，停止右侧Loading
  // 🎯 右侧面板已移除
            break

          case 'complete':
            // 结束时停止右侧加载指示
  // 🎯 右侧面板已移除
            console.log('🎯 [complete事件] 处理完成事件')
            // 🔧 发出AI完成事件，通知父组件重置sending状态
            emit('ai-response-complete')

            // 🎯 新架构：直接添加答案到聊天历史，不使用临时状态
            try {
              const needsContinue = event.data?.needsContinue === true || event.data?.isComplete === false
              if (needsContinue) {
                console.log('⏸️ [complete事件] 当前轮次需要继续，暂不渲染最终答案')
                break
              }
              // 🎯 提取组件数据：优先提取render_component工具的组件数据
              let componentData = null

              // 第一步：优先查找render_component工具的结果
              for (const fc of currentAIResponse.value.functionCalls || []) {
                if (fc.name === 'render_component' && fc.result) {
                  const uiInstruction = fc.result.ui_instruction ||
                                       fc.result.result?.ui_instruction ||
                                       fc.result.preview_instruction ||
                                       fc.result.result?.preview_instruction

                  if (uiInstruction?.type === 'render_component' && uiInstruction.component) {
                    componentData = uiInstruction.component
                    console.log('✅ [complete事件] 提取到render_component组件数据:', {
                      toolName: fc.name,
                      componentType: componentData.type,
                      componentTitle: componentData.title
                    })
                    break
                  }
                }
              }

              // 第二步：如果没有render_component，再查找其他工具的ui_instruction
              if (!componentData) {
                for (const fc of currentAIResponse.value.functionCalls || []) {
                  if (fc.result) {
                    const uiInstruction = fc.result.ui_instruction ||
                                         fc.result.result?.ui_instruction ||
                                         fc.result.preview_instruction ||
                                         fc.result.result?.preview_instruction

                    if (uiInstruction?.type === 'render_component' && uiInstruction.component) {
                      componentData = uiInstruction.component
                      console.log('✅ [complete事件] 提取到其他工具的组件数据:', {
                        toolName: fc.name,
                        componentType: componentData.type,
                        componentTitle: componentData.title
                      })
                      break
                    }
                  }
                }
              }

              // 🎯 修复：如果有组件数据，不生成总结文本，只显示组件
              // 如果没有组件数据，才生成总结文本
              let answerContent = currentAIResponse.value?.answer?.content?.trim() || ''

              if (!answerContent) {
                if (componentData) {
                  // 🎯 有组件数据：不显示总结文本，让组件自己说话
                  answerContent = '' // 空内容，只显示组件
                  console.log('✅ [complete事件] 有组件数据，不生成总结文本')
        } else {
                  // 🎯 没有组件数据：生成总结文本
                  const executed = (toolCalls.value || []).map(t => t.description || t.intent || t.name).filter(Boolean)
                  answerContent = executed.length
                    ? `已完成本次请求的自动执行：\n- ${executed.join('\n- ')}\n\n结果已在右侧"执行步骤"或预览中展示。`
                    : '已完成本次工具执行。结果已在右侧"执行步骤"或预览中展示。'
                  console.log('✅ [complete事件] 无组件数据，生成总结性回答:', answerContent)
                }
      } else {
                console.log('✅ [complete事件] 使用已有答案内容:', answerContent)
              }

              // 🎯 关键修复：立即将答案添加到聊天历史中
              // 检查最后一条消息，避免重复添加
              const lastMessage = chatHistory.currentMessages.value[chatHistory.currentMessages.value.length - 1]
              const isAlreadyAdded = lastMessage?.role === 'assistant' &&
                                    lastMessage?.type !== 'thinking' &&
                                    lastMessage?.content === answerContent

              if (!isAlreadyAdded && answerContent) {
                const thinkingContent = currentAIResponse.value.thinking.content || ''
                const aiMessage = {
                  id: `answer-${Date.now()}`,
                  role: 'assistant' as const,
                  type: 'answer' as const,
                  content: answerContent,
                  timestamp: new Date(),
                  hasEnhancedData: true,
                  // 🎯 思考过程：默认折叠，点击后展开
                  thinkingProcess: thinkingContent ? {
                    content: thinkingContent,
                    collapsed: true  // 答案完成后默认折叠思考过程
                  } : null,
                  functionCalls: (currentAIResponse.value.functionCalls || []).map(fc => ({
                    name: fc.name,
                    description: fc.description,
                    status: fc.status,
                    result: fc.result
                  })),
                  // 🎯 新增：添加组件数据字段
                  ...(componentData ? { componentData } : {})
                }

                console.log('✅ [complete事件] 立即添加答案消息到聊天历史:', aiMessage)
                if (componentData) {
                  console.log('🎨 [complete事件] 消息包含组件数据，将渲染ComponentRenderer')
                  console.log('📊 [complete事件] componentData:', componentData)
                  console.log('📊 [complete事件] renderedComponents.value 当前长度:', renderedComponents.value.length)

                  // 🆕 添加组件到renderedComponents数组
                  const renderedComponent = {
                    id: `component-${Date.now()}`,
                    name: componentData.title || '查询结果',
                    type: componentData.type || 'data-table',
                    icon: '📊',
                    component: componentData,
                    props: componentData,
                    active: true
                  }
                  renderedComponents.value.push(renderedComponent)
                  console.log('✅ [complete事件] 添加组件到renderedComponents:', renderedComponent)
                  console.log('📊 [complete事件] renderedComponents.value 添加后长度:', renderedComponents.value.length)
                  console.log('📊 [complete事件] renderedComponents.value 完整内容:', JSON.stringify(renderedComponents.value, null, 2))
                }
                chatHistory.currentMessages.value.push(aiMessage)
                console.log('📊 [complete事件] 当前聊天历史消息数:', chatHistory.currentMessages.value.length)
              } else {
                console.log('⚠️ [complete事件] 答案已存在或为空，跳过添加')
              }
            } catch (e) {
              console.warn('⚠️ [complete事件] 处理答案失败：', e)
            }

            // 不自动清空工具历史，保留供用户回溯；将在下次发送消息时清理
            break

          case 'error':
            const errorMsg = event.message || '工具调用失败'
            ElMessage.error({
              message: `工具调用失败：${errorMsg}\n\n请尝试重新登录后再次尝试。如果问题仍然存在，请联系客服解决。`,
              duration: 5000,
              showClose: true
            })
            break
        }
      },

      // 完成回调
      onComplete: async (finalResult) => {
        console.log('[多轮调用完成]', finalResult)
        console.log('🔍 [onComplete] currentAIResponse.value.answer:', currentAIResponse.value.answer)

        // 🔧 修复：不在这里添加消息，因为 complete 事件处理已经添加了答案消息
        // 这里只负责从后端刷新消息，避免重复添加
        console.log('⚠️ [onComplete] 消息已在 complete 事件处理中添加，跳过重复添加')

        // 🔧 修复：移除消息刷新逻辑，避免显示历史重复消息
        // 用户消息已经在前端添加，AI响应也已经在complete事件中添加
        // 不需要从后端刷新，避免显示所有历史消息
        console.log('✅ [onComplete] 跳过后端消息刷新，使用本地消息历史')

        // try {
        //   await refreshMessagesFromServer(chatHistory)
        // } catch (error) {
        //   console.warn('⚠️ [警告] 刷新后端消息失败，使用本地消息', error)
        // }
      },

      // 错误回调
      onError: (error) => {
        console.error('[多轮调用失败]', error)
        const errorMsg = error.message || '多轮调用失败'
        ElMessage.error({
          message: `工具调用失败：${errorMsg}\n\n请尝试重新登录后再次尝试。如果问题仍然存在，请联系客服解决。`,
          duration: 5000,
          showClose: true
        })
      }
    })

  } catch (error: any) {
    console.error('多轮工具调用失败:', error)
    const errorMsg = error.message || '工具调用失败'
    ElMessage.error({
      message: `工具调用失败：${errorMsg}\n\n请尝试重新登录后再次尝试。如果问题仍然存在，请联系客服解决。`,
      duration: 5000,
      showClose: true
    })
  }
}

// ==================== 监听器 ====================
// 监听面板显示状态（已移除侧边栏模式，只有全屏模式）
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    // 打开时显示进入动画
    fullscreenState.value.entering = true
    nextTick(() => {
      setTimeout(() => {
        fullscreenState.value.entering = false
      }, 400)
    })
  } else {
    // 关闭时重置动画状态
    fullscreenState.value.exiting = false
    fullscreenState.value.entering = false
  }
})

// ==================== 搜索事件处理方法 ====================
// 这些方法由AIAssistant.vue调用，用于处理搜索事件
const handleSearchStart = (event: any) => {
  console.log('🔍 [搜索] 开始搜索事件:', event)
}

const handleSearchProgress = (event: any) => {
  console.log('🔍 [搜索] 搜索进度事件:', event)
}

const handleSearchComplete = (event: any) => {
  console.log('🔍 [搜索] 搜索完成事件:', event)
}

// ==================== 生命周期 ====================
onMounted(() => {
  console.log('AI助手核心组件已挂载（全屏模式）')
})

// ==================== 暴露给父组件的方法和状态 ====================
defineExpose({
  // AI响应状态
  currentAIResponse,

  // 布局状态
  fullscreenState,
  leftSidebarCollapsed,

  // 工具和组件状态
  toolCalls,
  renderedComponents,

  // 思考状态
  isThinking,
  currentThinkingMessage,

  // 会话状态
  conversationId,
  conversations,
  conversationsLoading,

  // 工作流状态
  activeStepQueues,

  // Token状态
  tokenUsage,
  tokenLoading,

  // 输入状态
  inputMessage,
  sending,

  // 对话框状态
  statisticsVisible,
  quickQueryGroupsVisible,
  mobilePreviewVisible,
  mobilePreviewData,
  missingFieldsDialogVisible,
  missingFieldsData,

  // ✅ 新增：暴露消息列表 - 解决消息无法在页面显示的问题
  messages: chatHistory.currentMessages,

  // 方法
  handleMultiRoundToolCalling,
  toggleLeftSidebar,
  resetState,
  ensureConversation,
  refreshMessagesFromServer,

  // 🔍 搜索事件处理方法
  handleSearchStart,
  handleSearchProgress,
  handleSearchComplete,

  // 🛑 中止方法
  abortToolCalling: () => {
    console.log('🛑 [AIAssistantCore] 中止工具调用')
    multiRound.cancel()
    sending.value = false
  }
})
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入
.ai-assistant-core {
  display: none; /* 核心逻辑组件不显示UI */
}
</style>
