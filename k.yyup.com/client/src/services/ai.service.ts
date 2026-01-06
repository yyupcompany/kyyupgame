import { aiService } from '@/utils/request'

/**
 * AI助手相关服务
 */
export interface AIFeedbackData {
  messageId: string
  conversationId: string
  feedback: 'like' | 'dislike'
  comment?: string
  issueTypes?: string[]
  timestamp: string
}

/**
 * 提交AI消息反馈
 * @param data 反馈数据
 */
export const submitFeedback = async (data: AIFeedbackData) => {
  try {
    const response = await aiService.post('/ai/feedback/submit', data)
    return response.data
  } catch (error) {
    console.error('提交AI反馈失败:', error)
    throw error
  }
}

/**
 * 获取消息的反馈信息
 * @param messageId 消息ID
 * @param conversationId 对话ID
 */
export const getMessageFeedback = async (messageId: string, conversationId: string) => {
  try {
    const response = await aiService.get('/ai/feedback/message', {
      params: { messageId, conversationId }
    })
    return response.data
  } catch (error) {
    console.error('获取消息反馈失败:', error)
    throw error
  }
}

/**
 * 获取对话的反馈统计
 * @param conversationId 对话ID
 */
export const getConversationFeedbackStats = async (conversationId: string) => {
  try {
    const response = await aiService.get('/ai/feedback/conversation', {
      params: { conversationId }
    })
    return response.data
  } catch (error) {
    console.error('获取对话反馈统计失败:', error)
    throw error
  }
}

/**
 * AI服务导出
 */
export const aiService = {
  submitFeedback,
  getMessageFeedback,
  getConversationFeedbackStats
}