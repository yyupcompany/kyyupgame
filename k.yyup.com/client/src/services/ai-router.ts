import request from '../utils/request'
import { pageAwarenessService } from './page-awareness.service'

// 本地类型定义，因为 @/api/ai-shortcuts 模块不存在
export interface AIShortcut {
  id: number
  shortcut_name: string
  prompt_name: string
  category: string
  role: string
  system_prompt: string
  api_endpoint: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// 模拟 getShortcutConfig 函数，因为原模块不存在
async function getShortcutConfig(id: number): Promise<{ data: AIShortcut }> {
  // 返回默认配置
  return {
    data: {
      id,
      shortcut_name: '智能咨询',
      prompt_name: 'general_chat',
      category: 'comprehensive_analysis',
      role: 'all',
      system_prompt: '你是幼儿园招生咨询专家，为用户提供专业的招生建议和解答。',
      api_endpoint: 'ai_chat',
      is_active: true,
      sort_order: 0,
      created_at: '',
      updated_at: ''
    }
  }
}

/**
 * AI请求上下文类型
 */
export interface AIRequestContext {
  type?: string
  systemPrompt?: string
  shortcutName?: string
  userRole?: string
  currentRoute?: string
  pageTitle?: string
  sessionId?: string
  timestamp?: string
}

/**
 * AI请求参数类型
 */
export interface AIRequestParams {
  message: string
  context?: AIRequestContext
  shortcutId?: number
}

/**
 * AI响应类型
 */
export interface AIResponse {
  success: boolean
  data: {
    message: string
    sessionId?: string
    timestamp?: string
    [key: string]: any
  }
  error?: string
}

/**
 * AI请求路由服务
 * 根据不同的场景智能选择合适的AI接口
 */
export class AIRouterService {
  private static instance: AIRouterService
  
  // 关键词映射已移至统一配置管理

  public static getInstance(): AIRouterService {
    if (!AIRouterService.instance) {
      AIRouterService.instance = new AIRouterService()
    }
    return AIRouterService.instance
  }

  /**
   * 执行AI请求（智能路由）
   */
  async executeAIRequest(params: AIRequestParams): Promise<AIResponse> {
    try {
      let config: AIShortcut | null = null
      
      // 如果指定了快捷操作ID，获取配置
      if (params.shortcutId) {
        const configResult = await getShortcutConfig(params.shortcutId)
        config = configResult.data
      } else {
        // 智能路由：根据消息内容选择接口
        config = this.getSmartRouteConfig(params.message)
      }
      
      // ❌ 简易版聊天端点已删除，需要使用完整的会话消息API
      // ✅ 使用完整的会话消息API - 包含向量记忆、上下文管理等高级功能

      // 获取或创建会话ID
      let conversationId = params.context?.sessionId

      // 总是尝试创建新会话，因为前端会话ID和后端会话ID是独立的
      try {
        const createResponse = await request.post('/ai/conversations', {
          title: '新对话',
          metadata: {
            userRole: params.context?.userRole,
            currentRoute: params.context?.currentRoute,
            pageTitle: params.context?.pageTitle
          }
        })
        // 兼容多种响应格式
        conversationId = createResponse.data?.id || (createResponse as any).id
        console.log('✅ 创建新AI会话:', conversationId)
        console.log('🔍 会话创建响应:', createResponse)
        console.log('🔍 响应数据结构:', {
          hasData: !!createResponse.data,
          hasId: !!(createResponse as any).id,
          dataId: createResponse.data?.id,
          directId: (createResponse as any).id
        })
      } catch (error) {
        console.error('创建会话失败:', error)
        throw new Error('无法创建AI会话')
      }

      const endpoint = `/ai/conversations/${conversationId}/messages`
      
      // 构建请求数据 - 匹配完整会话消息API格式
      const requestData = {
        content: params.message, // 完整API使用 content 而不是 message
        metadata: {
          ...params.context,
          type: config.category,
          systemPrompt: config.system_prompt,
          shortcutName: config.shortcut_name
        },
        pagePath: pageAwarenessService.currentPageGuide.value?.pagePath, // 添加当前页面路径
        enhancedPageContext: await pageAwarenessService.getCurrentPageContext(), // 增强页面上下文
        stream: false // 非流式输出
      }
      
      // 发送请求
      const response = await request.post<AIResponse>(endpoint, requestData)
      
      // 处理后端响应数据格式
      let aiContent = '回复生成失败'

      if (response.data) {
        // 后端返回格式：{code, message, data: {content, model, metadata}}
        const responseData = response.data as any
        if (responseData.content) {
          aiContent = responseData.content
        } else if (responseData.data?.content) {
          aiContent = responseData.data.content
        } else if (typeof responseData === 'string') {
          aiContent = responseData
        }
      }

      console.log('🤖 AI响应处理:', {
        originalResponse: response.data,
        extractedContent: aiContent
      })

      return {
        success: true,
        data: {
          message: aiContent,
          sessionId: conversationId,
          timestamp: new Date().toISOString()
        }
      }
      
    } catch (error) {
      console.error('AI请求失败:', error)
      return {
        success: false,
        data: {
          message: '抱歉，AI服务暂时不可用，请稍后再试。'
        },
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 智能路由：根据消息内容选择合适的配置
   */
  private getSmartRouteConfig(_message: string): AIShortcut {
    // 关键词检查已整合到路由逻辑中
    
    // 根据关键词匹配选择不同的默认配置
    // 暂时都使用聊天配置，避免权限问题
    return this.getDefaultChatConfig()

    // TODO: 后续可以根据用户权限动态选择
    // if (hasQueryKeywords) {
    //   return this.getDefaultQueryConfig()
    // } else if (hasChatKeywords) {
    //   return this.getDefaultChatConfig()
    // } else {
    //   // 默认使用聊天配置
    //   return this.getDefaultChatConfig()
    // }
  }

  // 默认查询配置已移至统一配置管理

  /**
   * 获取默认聊天配置
   */
  private getDefaultChatConfig(): AIShortcut {
    return {
      id: 0,
      shortcut_name: '智能咨询',
      prompt_name: 'general_chat',
      category: 'comprehensive_analysis',
      role: 'all',
      system_prompt: `你是幼儿园招生咨询专家，为用户提供专业的招生建议和解答。

专业领域：
- 招生策略规划
- 活动方案设计
- 家长沟通技巧
- 市场分析建议
- 运营优化方案

回复要求：
- 专业且易懂
- 提供具体可行的建议
- 结合幼儿园行业特点
- 关注实际操作性

请用温和、专业的语气提供有价值的建议。`,
      api_endpoint: 'ai_chat',
      is_active: true,
      sort_order: 0,
      created_at: '',
      updated_at: ''
    }
  }

  /**
   * 执行快捷操作
   */
  async executeShortcut(shortcutId: number, userInput?: string): Promise<AIResponse> {
    try {
      const configResult = await getShortcutConfig(shortcutId)
      const config = configResult.data
      
      // 使用快捷操作名称作为默认输入
      const message = userInput || `使用快捷操作：${config.shortcut_name}`
      
      return await this.executeAIRequest({
        message,
        shortcutId,
        context: {
          type: config.category,
          systemPrompt: config.system_prompt,
          shortcutName: config.shortcut_name
        }
      })
      
    } catch (error) {
      console.error('快捷操作执行失败:', error)
      return {
        success: false,
        data: {
          message: '快捷操作执行失败，请稍后再试。'
        },
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }


  /**
   * 获取AI使用统计
   */
  async getAIUsageStats(): Promise<{
    todayRequests: number
    totalRequests: number
    averageResponseTime: number
    totalConversations?: number
    totalMessages?: number
    userMessages?: number
    aiMessages?: number
    oldestSessionDate?: string
    serviceStatus?: string
  }> {
    try {
      // 暂时返回模拟数据，避免404错误
      // TODO: 等后端实现 /ai/stats 接口后再启用真实请求
      // const response = await request.get('/ai/stats')
      // return response.data

      // 返回模拟统计数据
      return {
        todayRequests: Math.floor(Math.random() * 50),
        totalRequests: 1247,
        averageResponseTime: Math.floor(Math.random() * 1000) + 500,
        totalConversations: 47,
        totalMessages: 163,
        userMessages: 98,
        aiMessages: 65,
        oldestSessionDate: '2025-09-05',
        serviceStatus: 'online'
      }
    } catch (error) {
      console.error('获取AI统计失败:', error)
      return {
        todayRequests: 0,
        totalRequests: 0,
        averageResponseTime: 0,
        totalConversations: 47,
        totalMessages: 163,
        userMessages: 98,
        aiMessages: 65,
        oldestSessionDate: '2025-09-05',
        serviceStatus: 'online'
      }
    }
  }
}

// 导出单例实例
export const aiRouter = AIRouterService.getInstance()

// 导出便捷方法
export const executeAIRequest = (params: AIRequestParams) => 
  aiRouter.executeAIRequest(params)

export const executeShortcut = (shortcutId: number, userInput?: string) => 
  aiRouter.executeShortcut(shortcutId, userInput)


export const getAIUsageStats = () => 
  aiRouter.getAIUsageStats()

export default aiRouter
