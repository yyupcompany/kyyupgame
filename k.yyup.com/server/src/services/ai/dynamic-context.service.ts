/**
 * 动态上下文服务 - 简化版占位符
 */

export class DynamicContextService {
  private static instance: DynamicContextService;

  static getInstance(): DynamicContextService {
    if (!DynamicContextService.instance) {
      DynamicContextService.instance = new DynamicContextService();
    }
    return DynamicContextService.instance;
  }

  async getContext(userId: string): Promise<any> {
    console.log('📝 获取动态上下文:', userId);
    return {
      userId,
      context: 'default context',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 构建动态上下文
   * @param configOrQuery - 配置对象或查询字符串
   * @param queryOrUserId - 查询字符串或用户ID
   * @param userIdOrHistory - 用户ID或对话历史
   * @param conversationHistory - 对话历史
   * @param pageContext - 页面上下文
   * @param userMemory - 用户记忆
   */
  async buildDynamicContext(
    configOrQuery: any,
    queryOrUserId?: any,
    userIdOrHistory?: any,
    conversationHistory?: any[],
    pageContext?: any,
    userMemory?: any[]
  ): Promise<any> {
    // 支持两种调用方式
    let query: string;
    let userId: any;
    let config: any = {};

    if (typeof configOrQuery === 'object' && configOrQuery.size) {
      // 新调用方式: (config, query, userId, history, pageContext, memory)
      config = configOrQuery;
      query = queryOrUserId;
      userId = userIdOrHistory;
    } else {
      // 旧调用方式: (query, userId, options)
      query = configOrQuery;
      userId = queryOrUserId;
      config = userIdOrHistory || {};
    }

    console.log('🔧 构建动态上下文:', query);

    const systemPrompt = `你是一个智能助手，帮助用户处理幼儿园管理相关的问题。
当前用户ID: ${userId}
${conversationHistory?.length ? `最近对话: ${conversationHistory.length}条` : ''}
${pageContext?.currentPage ? `当前页面: ${pageContext.currentPage}` : ''}`;

    return {
      query,
      userId,
      systemPrompt,
      totalTokens: systemPrompt.length + (query?.length || 0),
      components: [
        { type: 'system', content: systemPrompt },
        { type: 'query', content: query }
      ],
      truncated: false,
      context: {
        userPreferences: {},
        recentHistory: conversationHistory || [],
        relevantData: userMemory || [],
        pageContext: pageContext || {}
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取上下文统计
   */
  getContextStats(): any {
    return {
      totalContexts: 0,
      activeContexts: 0,
      averageContextSize: 0
    };
  }
}

export const dynamicContextService = DynamicContextService.getInstance();
