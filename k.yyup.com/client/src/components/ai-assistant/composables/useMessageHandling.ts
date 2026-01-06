/**
 * 消息处理 Composable
 * 从 AIAssistant.vue 第1100-1800行提取消息处理逻辑
 *
 * 🎯 核心职责：
 * ├─ 消息生命周期管理 (创建、保存、刷新)
 * ├─ 会话管理 (创建、切换、删除)
 * ├─ 服务器交互 (API调用、错误处理)
 * ├─ 快捷操作处理 (执行、记录、反馈)
 * └─ 页面上下文感知 (路由、权限、标题)
 *
 * 📨 消息处理功能：
 * ├─ saveUserMessageToServer() - 保存用户消息到服务器
 * ├─ saveAIMessageToServer() - 保存AI消息到服务器
 * ├─ refreshMessagesFromServer() - 从服务器刷新消息
 * └─ 消息格式化和验证
 *
 * 💬 会话管理功能：
 * ├─ ensureConversation() - 确保会话存在
 * ├─ conversationId - 当前会话ID
 * └─ 会话状态管理
 *
 * ⚡ 快捷操作功能：
 * ├─ executeShortcut() - 执行快捷操作
 * ├─ recordInteractionMetadata() - 记录交互元数据
 * └─ 快捷操作生命周期管理
 *
 * 🔍 辅助功能：
 * ├─ countChineseChars() - 中文字符计数
 * ├─ isShortNavigationCommand() - 导航命令检测
 * ├─ isStatusReportQuery() - 状态报告查询检测
 * └─ handleStatusReportQuery() - 状态报告处理
 *
 * 💡 使用示例：
 * const {
 *   ensureConversation,
 *   saveUserMessageToServer,
 *   executeShortcut,
 *   currentPageContext
 * } = useMessageHandling()
 */

import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { request } from '@/utils/request'
import { AI_ENDPOINTS } from '@/api/endpoints/ai'
import { useUserStore } from '@/stores/user'
import { SmartRouterService } from '@/services/smart-router.service'
import type { ExtendedChatMessage } from '../types/aiAssistant'

// ==================== 单例模式 ====================
// 模块级变量，确保所有组件共享同一个状态实例
let messageHandlingInstance: ReturnType<typeof createMessageHandling> | null = null

// 创建消息处理实例的工厂函数
function createMessageHandling() {
  const route = useRoute()
  const userStore = useUserStore()

  // ==================== 页面上下文 ====================
  // 获取页面标题
  const getPageTitle = (path: string): string => {
    const titleMap: Record<string, string> = {
      '/dashboard': '数据概览',
      '/centers/personnel': '人员中心',
      '/centers/marketing': '营销中心',
      '/centers/system': '系统中心',
      '/centers/finance': '财务中心',
      '/centers/inspection': '检查中心',
      '/centers/script': '话术中心',
      '/centers/media': '媒体中心'
    }
    return titleMap[path] || '未知页面'
  }

  // 当前页面上下文
  const currentPageContext = computed(() => {
    return {
      route: route.path,
      title: getPageTitle(route.path),
      userRole: userStore.userInfo?.role || 'user'
    }
  })

  // ==================== 会话管理 ====================
  const conversationId = ref<string | null>(null)

  // 🔧 会话持久化：localStorage键名
  const CONVERSATION_STORAGE_KEY = 'ai_assistant_conversation_id'
  const CONVERSATION_TIMESTAMP_KEY = 'ai_assistant_conversation_timestamp'
  const CONVERSATION_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24小时过期

  // ==================== SSE请求控制 ====================
  let currentAbortController: AbortController | null = null
  let currentReader: ReadableStreamDefaultReader<Uint8Array> | null = null

  // 🔧 从localStorage恢复会话ID
  function restoreConversationFromStorage(): string | null {
    try {
      const storedId = localStorage.getItem(CONVERSATION_STORAGE_KEY)
      const storedTimestamp = localStorage.getItem(CONVERSATION_TIMESTAMP_KEY)

      if (!storedId || !storedTimestamp) {
        console.log('📦 [会话恢复] 没有找到存储的会话ID')
        return null
      }

      const timestamp = parseInt(storedTimestamp, 10)
      const now = Date.now()

      // 检查是否过期
      if (now - timestamp > CONVERSATION_EXPIRY_MS) {
        console.log('⏰ [会话恢复] 会话已过期，清除存储')
        localStorage.removeItem(CONVERSATION_STORAGE_KEY)
        localStorage.removeItem(CONVERSATION_TIMESTAMP_KEY)
        return null
      }

      console.log('✅ [会话恢复] 从localStorage恢复会话ID:', storedId)
      return storedId
    } catch (error) {
      console.error('❌ [会话恢复] 恢复失败:', error)
      return null
    }
  }

  // 🔧 保存会话ID到localStorage
  function saveConversationToStorage(id: string) {
    try {
      localStorage.setItem(CONVERSATION_STORAGE_KEY, id)
      localStorage.setItem(CONVERSATION_TIMESTAMP_KEY, Date.now().toString())
      console.log('💾 [会话持久化] 会话ID已保存到localStorage:', id)
    } catch (error) {
      console.error('❌ [会话持久化] 保存失败:', error)
    }
  }

  // 🔧 清除存储的会话ID
  function clearConversationStorage() {
    try {
      localStorage.removeItem(CONVERSATION_STORAGE_KEY)
      localStorage.removeItem(CONVERSATION_TIMESTAMP_KEY)
      console.log('🗑️ [会话持久化] 已清除存储的会话ID')
    } catch (error) {
      console.error('❌ [会话持久化] 清除失败:', error)
    }
  }

  // 确保会话存在
  async function ensureConversation() {
    if (conversationId.value) return conversationId.value

    // 🔧 优先从localStorage恢复会话ID
    const restoredId = restoreConversationFromStorage()
    if (restoredId) {
      conversationId.value = restoredId
      console.log('✅ [会话恢复] 使用恢复的会话ID:', restoredId)
      return conversationId.value
    }

    // 优先从URL读取 ?conv= 会话ID
    const urlConv = (route.query.conv as string) || ''
    if (urlConv) {
      conversationId.value = urlConv
      saveConversationToStorage(urlConv) // 保存到localStorage
      return conversationId.value
    }

    try {
      const res: any = await request.post(AI_ENDPOINTS.CONVERSATIONS, { title: 'AI 助手对话' })
      console.log('🔍 会话创建响应:', res)
      console.log('🔍 响应类型:', typeof res, '是否有data:', !!res?.data)
      console.log('🔍 res.data:', res?.data)
      console.log('🔍 res.id:', res?.id)

      // 🔧 修复：后端直接返回对象，不包装在data中
      // 尝试多种可能的ID位置：res.id > res.data.id > res.data.data.id
      const id = res?.id || res?.data?.id || res?.data?.data?.id
      if (id) {
        conversationId.value = id
        saveConversationToStorage(id) // 🔧 保存到localStorage
        console.log('✅ 会话创建成功:', id)
      } else {
        console.warn('⚠️ 会话创建响应中没有找到ID:', res)
        // 抛出错误，让调用方知道创建失败
        throw new Error('会话创建响应中没有找到ID')
      }
    } catch (e: any) {
      console.error('❌ 创建会话失败:', e)
      // 显示用户友好的错误提示
      ElMessage.error('创建对话失败，请稍后重试')
      // 使用临时会话ID作为降级方案
      conversationId.value = `temp_${Date.now()}`
      console.warn('⚠️ 使用临时会话ID（仅前端）:', conversationId.value)
    }

    return conversationId.value
  }

  // ==================== 消息保存 ====================
  // 保存用户消息到服务器
  async function saveUserMessageToServer(content: string, currentPageContext?: any) {
    try {
      const convId = await ensureConversation()
      if (!convId) return
      
      await request.post(AI_ENDPOINTS.CONVERSATION_MESSAGES(convId), {
        content,
        metadata: { source: 'ai-assistant', pageContext: currentPageContext?.title },
        pagePath: route.fullPath,
        stream: false
      })
    } catch (e) {
      console.warn('保存用户消息到后端失败', e)
    }
  }

  // 保存AI回复到数据库
  async function saveAIMessageToServer(content: string, metadata?: any, currentPageContext?: any) {
    try {
      const convId = await ensureConversation()
      if (!convId) return

      // 构建AI消息的元数据
      const aiMetadata = {
        source: 'ai-assistant',
        pageContext: currentPageContext?.title,
        aiEnhanced: metadata?.aiEnhanced || null,
        ...metadata
      }

      await request.post(AI_ENDPOINTS.CONVERSATION_MESSAGES(convId), {
        content,
        role: 'assistant',  // 明确指定为AI回复
        metadata: aiMetadata,
        pagePath: route.fullPath,
        stream: false
      })
      console.log('✅ [Function Calling] AI回复保存成功')
    } catch (e) {
      console.warn('❌ [Function Calling] 保存AI回复到后端失败', e)
    }
  }

  // ==================== 消息刷新 ====================
  // 从服务器刷新消息
  async function refreshMessagesFromServer(chatHistory: any) {
    try {
      const convId = conversationId.value
      if (!convId) return

      console.log('🔄 [刷新] 开始从后端拉取消息...')
      const res: any = await request.get(AI_ENDPOINTS.CONVERSATION_MESSAGES(convId))
      const items = res?.data?.data || res?.data?.items || res?.data || []
      const mapped = (Array.isArray(items) ? items : []).map((m: any) => {
        // 🔍 调试：检查原始消息的role字段
        console.log(`🔍 [原始消息] id=${m.id}, role=${m.role}, senderType=${m.senderType}, sender=${m.sender}`)

        // 确保role字段被正确设置
        let finalRole = m.role
        if (!finalRole && m.senderType) {
          finalRole = m.senderType === 'user' ? 'user' : 'assistant'
        }
        if (!finalRole && m.sender) {
          finalRole = m.sender === 'user' ? 'user' : 'assistant'
        }

        return {
          id: (m.id ?? '').toString(),
          role: finalRole || 'user', // 默认为user
          content: m.content,
          timestamp: m.createdAt || new Date().toISOString(),
          pageContext: m.metadata?.pageContext,
          hasEnhancedData: !!m.metadata?.aiEnhanced,
          thinkingProcess: m.metadata?.aiEnhanced?.thinkingProcess || null,
          functionCalls: m.metadata?.aiEnhanced?.toolResults || null
        }
      })

      console.log('🔄 [刷新] 后端返回消息数:', mapped.length)
      console.log('🔄 [刷新] 本地消息数:', chatHistory.currentMessages.value.length)

      // 🔍 调试：打印所有后端返回的消息
      console.log('🔍 [刷新] 后端返回的原始消息:', items)
      console.log('🔍 [刷新] 映射后的消息:', mapped)

      // 🔍 调试：检查每条消息的role字段
      mapped.forEach((m: any, i: number) => {
        console.log(`🔍 [刷新] 消息${i}: id=${m.id}, role=${m.role}, content=${m.content?.substring(0, 50)}...`)
      })

      // 智能合并本地消息和后端消息，而不是直接覆盖
      if ((mapped as any[]).length > 0) {
        // 🎯 修复：获取本地消息中的临时消息（包括思考消息和答案消息）
        // ID以 'ai-', 'msg_', 'thinking-', 'answer-' 开头的都是临时消息
        const localTempMessages = chatHistory.currentMessages.value.filter((m: any) =>
          m.id.startsWith('ai-') ||
          m.id.startsWith('msg_') ||
          m.id.startsWith('thinking-') ||
          m.id.startsWith('answer-')
        )

        console.log('🔄 [刷新] 本地临时消息数:', localTempMessages.length)

        // 如果有本地临时消息，合并到后端消息中
        if (localTempMessages.length > 0) {
          // 找出后端消息中最新的时间戳
          const latestBackendTimestamp = mapped.length > 0
            ? new Date(mapped[mapped.length - 1].timestamp).getTime()
            : 0

          // 只保留时间戳晚于后端最新消息的本地临时消息
          const newLocalMessages = localTempMessages.filter((m: any) =>
            new Date(m.timestamp).getTime() > latestBackendTimestamp
          )

          console.log('🔄 [刷新] 需要保留的本地临时消息数:', newLocalMessages.length)

          // 🔧 修复：使用 splice 而不是直接赋值，以保持 ref 的响应性
          const mergedMessages = [...mapped, ...newLocalMessages] as any
          console.log('🔍 [刷新] 合并前消息数:', chatHistory.currentMessages.value.length)
          console.log('🔍 [刷新] 后端消息数:', mapped.length)
          console.log('🔍 [刷新] 本地消息数:', newLocalMessages.length)
          console.log('🔍 [刷新] 合并后消息数:', mergedMessages.length)

          // 清空原数组并重新填充
          chatHistory.currentMessages.value.splice(0, chatHistory.currentMessages.value.length, ...mergedMessages)
          console.log('✅ [刷新] 消息已合并，总数:', chatHistory.currentMessages.value.length)
        } else {
          // 没有本地临时消息，直接使用后端消息
          console.log('🔍 [刷新] 合并前消息数:', chatHistory.currentMessages.value.length)
          console.log('🔍 [刷新] 后端消息数:', mapped.length)

          // 清空原数组并重新填充
          chatHistory.currentMessages.value.splice(0, chatHistory.currentMessages.value.length, ...mapped)
          console.log('✅ [刷新] 消息已更新（无本地临时消息），总数:', chatHistory.currentMessages.value.length)
        }
      } else {
        console.warn('⚠️ [刷新] 后端返回空消息，跳过覆盖以保留本地显示')
      }
    } catch (e: any) {
      console.warn('❌ [刷新] 从后端拉取消息失败', e)
      // 如果是数据库字段缺失错误，不影响前端正常使用
      if (e?.response?.status === 500) {
        console.warn('⚠️ [刷新] 后端数据库字段缺失，使用本地消息历史')
        // 保持当前的本地消息历史，不清空
      }
    }
  }

  // ==================== 辅助函数 ====================
  // 统计中文字符数
  const countChineseChars = (s: string): number => {
    const m = (s || '').match(/[\u4e00-\u9fa5]/g)
    return m ? m.length : 0
  }

  // 判断是否为短导航命令
  const isShortNavigationCommand = (input: string): boolean => {
    const cnLen = countChineseChars(input.trim())
    return cnLen > 0 && cnLen < 10 && SmartRouterService.isNavigationRequest(input)
  }

  // 检测是否为现状报表查询
  const isStatusReportQuery = (input: string): boolean => {
    const query = input.trim().toLowerCase()
    const statusKeywords = ['现状', '状态', '情况', '概况']
    const reportKeywords = ['报表', '图表', '统计', '数据', '显示', '展示']

    const hasStatusKeyword = statusKeywords.some(keyword => query.includes(keyword))
    const hasReportKeyword = reportKeywords.some(keyword => query.includes(keyword))

    return hasStatusKeyword && hasReportKeyword
  }

  // 处理现状报表查询
  const handleStatusReportQuery = async (query: string): Promise<{
    success: boolean;
    response: string;
    componentData?: any;
    error?: string;
  }> => {
    try {
      console.log('🔍 [现状报表] 开始获取机构现状数据')

      // 调用机构现状API
      const response = await request.get('/organization-status/1/ai-format')

      if (!response.data || response.data.code !== 200) {
        throw new Error('机构现状API返回异常')
      }

      const statusData = response.data.data
      console.log('✅ [现状报表] 机构现状数据获取成功', {
        hasText: !!statusData.text,
        hasRawData: !!statusData.rawData,
        textLength: statusData.text?.length || 0
      })

      // 构造组件数据
      const componentData = {
        type: 'stat-card',
        title: '机构现状报表',
        data: {
          totalClasses: statusData.rawData?.totalClasses || 0,
          totalStudents: statusData.rawData?.totalStudents || 0,
          totalTeachers: statusData.rawData?.totalTeachers || 0,
          enrollmentRate: parseFloat(statusData.rawData?.enrollmentRate || '0'),
          activeStudents: statusData.rawData?.totalStudents || 0,
          teacherStudentRatio: statusData.rawData?.totalTeachers && statusData.rawData?.totalStudents
            ? (statusData.rawData.totalStudents / statusData.rawData.totalTeachers).toFixed(1)
            : '0',
          capacityUtilization: statusData.rawData?.enrollmentRate || '0'
        }
      }

      return {
        success: true,
        response: '为您展示机构现状报表，包含班级、学生、教师等关键指标数据：',
        componentData
      }
    } catch (error: any) {
      console.error('❌ [现状报表] 获取机构现状数据失败:', error)
      return {
        success: false,
        response: '抱歉，获取机构现状数据失败，请稍后重试。',
        error: error.message
      }
    }
  }

  // 记录交互元数据
  const recordInteractionMetadata = async (meta: any) => {
    try {
      const convId = await ensureConversation()
      if (!convId) return

      await request.post(AI_ENDPOINTS.CONVERSATION_MESSAGES(convId), {
        content: '[metadata]',
        metadata: { interaction: meta },
        pagePath: route.fullPath,
        stream: false
      })
    } catch (e) {
      console.warn('记录交互元数据失败', e)
    }
  }

  // 执行快捷操作（模拟实现）
  const executeShortcut = async (shortcutId: number, shortcutName: string) => {
    // 这里应该调用实际的快捷操作API
    // 暂时返回模拟结果
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      success: true,
      data: {
        message: `快捷操作"${shortcutName}"执行成功！`
      }
    }
  }

  // ==================== 智能流式聊天SSE ====================
  /**
   * 智能流式聊天SSE函数
   * 具备复杂度评估、智能路由和工具调用能力
   * @param message 用户消息
   * @param chatHistory 聊天历史对象
   */
  const callDirectChatSSE = async (message: string, chatHistory: any) => {
    try {
      console.log('🤖 [智能流式聊天] 开始调用智能路由SSE接口')

      // 构建请求参数
      const requestData = {
        message: message,
        userId: userStore.userInfo?.id?.toString() || '121',
        conversationId: conversationId.value,
        context: {
          currentPage: route.path,
          pageTitle: document.title,
          userRole: userStore.userInfo?.role || (userStore.isAdmin ? 'admin' : 'user'),
          enableTools: false, // 直连模式禁用工具调用
          enableWebSearch: false, // 直连模式禁用网络搜索
          role: userStore.userInfo?.role || (userStore.isAdmin ? 'admin' : 'user')
        }
      }

      console.log('🔗 [直连聊天] 请求参数:', requestData)

      // 创建新的AbortController
      currentAbortController = new AbortController()

      // 调用智能流式聊天SSE接口
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/unified/stream-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(requestData),
        signal: currentAbortController.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log('🤖 [智能流式聊天] SSE连接已建立')

      // 处理SSE流
      const reader = response.body?.getReader()
      currentReader = reader || null
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      // 创建AI响应消息
      const aiMessage = {
        role: 'assistant' as const,
        content: '',
        timestamp: Date.now()
      }
      chatHistory.addMessage(aiMessage)

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              console.log('🔗 [直连聊天] 流式响应完成')
              break
            }

            try {
              const parsed = JSON.parse(data)

              // 🔧 过滤掉系统连接消息，避免显示在聊天记录中
              if (parsed.type === 'connected') {
                console.log('🔗 [直连聊天] 收到连接确认消息，跳过显示')
                continue
              }

              if (parsed.content) {
                fullContent += parsed.content
                // 更新最后一条AI消息的内容
                const messages = chatHistory.currentMessages.value
                const lastMessage = messages[messages.length - 1]
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.content = fullContent
                }
              }
            } catch (e) {
              console.warn('🤖 [智能流式聊天] 解析SSE数据失败:', e)
            }
          }
        }
      }

      console.log('🔗 [直连聊天] 响应完成，最终内容长度:', fullContent.length)

    } catch (error) {
      console.error('🔗 [直连聊天] 调用失败:', error)

      // 添加错误消息
      chatHistory.addMessage({
        role: 'assistant',
        content: '抱歉，直连聊天服务暂时不可用，请稍后重试。',
        timestamp: Date.now()
      })
    }
  }

  return {
    // 页面上下文
    currentPageContext,

    // 会话管理
    conversationId,
    ensureConversation,

    // 消息保存
    saveUserMessageToServer,
    saveAIMessageToServer,

    // 消息刷新
    refreshMessagesFromServer,

    // 快捷操作
    recordInteractionMetadata,
    executeShortcut,

    // 辅助函数
    countChineseChars,
    isShortNavigationCommand,
    isStatusReportQuery,
    handleStatusReportQuery,

    // 🆕 智能流式聊天
    callDirectChatSSE,

    // 🛑 中止当前请求
    abortCurrentRequest: () => {
      console.log('🛑 [中止请求] 开始中止当前智能路由SSE请求')

      // 取消reader
      if (currentReader) {
        try {
          currentReader.cancel()
          console.log('✅ [中止请求] Reader已取消')
        } catch (error) {
          console.error('❌ [中止请求] Reader取消失败:', error)
        }
        currentReader = null
      }

      // 中止fetch请求
      if (currentAbortController) {
        try {
          currentAbortController.abort()
          console.log('✅ [中止请求] AbortController已中止')
        } catch (error) {
          console.error('❌ [中止请求] AbortController中止失败:', error)
        }
        currentAbortController = null
      }

      console.log('✅ [中止请求] 所有请求已中止')
    }
  }
}

// ==================== 导出单例函数 ====================
/**
 * 获取消息处理实例（单例模式）
 *
 * 🎯 单例模式确保：
 * - 主文件和核心组件共享同一个消息处理状态
 * - 会话ID和消息状态自动同步到所有组件
 * - 避免消息状态不一致问题
 *
 * @returns 消息处理实例
 */
export function useMessageHandling() {
  if (!messageHandlingInstance) {
    console.log('🔧 [useMessageHandling] 创建新的消息处理实例（单例）')
    messageHandlingInstance = createMessageHandling()
  } else {
    console.log('🔧 [useMessageHandling] 返回现有消息处理实例（单例）')
  }
  return messageHandlingInstance
}
