import request from '@/utils/request'

/**
 * 统一智能系统API
 * 
 * @deprecated 此文件已被统一智能系统替代
 * 新的API请使用: @/api/endpoints/function-tools 中的统一智能函数
 * 
 * 迁移指南:
 * - functionToolsApi.smartChat() -> callUnifiedIntelligence()
 * - functionToolsApi.getAvailableTools() -> getUnifiedSystemCapabilities()
 * - functionToolsApi.executeTool() -> callUnifiedIntelligence() (自动工具调用)
 */
export const functionToolsApi = {
  /**
   * @deprecated 使用 callUnifiedIntelligence() 替代
   * 智能聊天 - 支持工具调用
   */
  smartChat(messages) {
    console.warn('⚠️ functionToolsApi.smartChat() 已废弃，请使用 callUnifiedIntelligence()')
    
    // 临时兼容性包装，转换为统一智能系统格式
    const lastMessage = messages[messages.length - 1]
    return request.post('/api/ai/unified/unified-chat', {
      message: lastMessage?.content || '',
      userId: localStorage.getItem('userId') || '121',
      conversationId: `legacy_${Date.now()}`,
      context: {
        history: messages.slice(0, -1)
      }
    })
  },

  /**
   * @deprecated 使用 getUnifiedSystemCapabilities() 替代
   * 获取可用工具列表
   */
  getAvailableTools() {
    console.warn('⚠️ functionToolsApi.getAvailableTools() 已废弃，请使用 getUnifiedSystemCapabilities()')
    return request.get('/api/ai/unified/capabilities')
  },

  /**
   * @deprecated 使用 callUnifiedIntelligence() 替代
   * 执行单个工具调用
   */
  executeTool(toolName, args) {
    console.warn('⚠️ functionToolsApi.executeTool() 已废弃，请使用 callUnifiedIntelligence() 进行智能工具调用')
    
    // 转换为统一智能系统格式
    return request.post('/api/ai/unified/unified-chat', {
      message: `请执行工具: ${toolName}，参数: ${JSON.stringify(args)}`,
      userId: localStorage.getItem('userId') || '121',
      conversationId: `tool_execution_${Date.now()}`
    })
  },

  /**
   * @deprecated 统一智能系统不再支持历史记录查询
   * 获取工具执行历史
   */
  getExecutionHistory(params = {}) {
    console.warn('⚠️ functionToolsApi.getExecutionHistory() 已废弃，统一智能系统自动管理执行历史')
    return Promise.resolve({ success: true, data: [], message: '功能已迁移到统一智能系统' })
  },

  /**
   * @deprecated 使用 getUnifiedSystemStatus() 替代
   * 获取工具统计信息
   */
  getToolStats() {
    console.warn('⚠️ functionToolsApi.getToolStats() 已废弃，请使用 getUnifiedSystemStatus()')
    return request.get('/api/ai/unified/status')
  }
}

export default functionToolsApi
