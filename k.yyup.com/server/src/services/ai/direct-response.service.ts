/**
 * AI直接响应服务 - 简化版占位符
 */

export class DirectResponseService {
  private static instance: DirectResponseService;

  static getInstance(): DirectResponseService {
    if (!DirectResponseService.instance) {
      DirectResponseService.instance = new DirectResponseService();
    }
    return DirectResponseService.instance;
  }

  /**
   * 生成直接响应
   */
  async generateResponse(query: string, context?: any): Promise<any> {
    console.log('💬 生成直接响应:', query);

    return {
      response: '这是直接响应（简化版）',
      query,
      type: 'direct',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 兼容旧接口：处理直接聊天请求
   */
  async processDirectChat(userRequest: { query?: string; context?: any }): Promise<any> {
    const query = userRequest?.query || '';
    return this.generateResponse(query, userRequest?.context);
  }

  /**
   * 检查是否可以使用直接响应
   */
  async canUseDirectResponse(query: string): Promise<boolean> {
    return true;
  }

  /**
   * 执行直接操作
   */
  async executeDirectAction(action: string, params?: any): Promise<any> {
    console.log('⚡ 执行直接操作:', action);
    return {
      success: true,
      action,
      result: '操作已执行',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取服务统计
   */
  getServiceStats(): any {
    return {
      totalResponses: 0,
      directActions: 0,
      averageResponseTime: 0
    };
  }
}

export const directResponseService = DirectResponseService.getInstance();