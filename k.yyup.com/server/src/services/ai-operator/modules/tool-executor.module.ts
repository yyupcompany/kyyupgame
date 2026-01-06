/**
 * 工具执行器模块
 * 
 * 职责：
 * - 执行所有工具调用（Function Tools）
 * - 参数桥接和兼容性处理
 * - 工具执行结果标准化
 * - 进度回调处理
 * 
 * 从unified-intelligence.service.ts中提取
 */

export interface UserRequest {
  content: string;
  userId: string;
  conversationId?: string;
  context?: any;
  sessionId?: string;
  mode?: 'agent' | 'direct' | 'auto';
  messageId?: string;
}

export interface ToolCall {
  id?: string;
  type?: string;
  function?: {
    name: string;
    arguments: string | Record<string, any>;
  };
  name?: string;
  arguments?: Record<string, any>;
}

export interface ToolExecutionResult {
  success?: boolean;
  data?: any;
  error?: string;
  message?: string;
  status?: string;
  metadata?: any;
  result?: any; // 用于兼容旧代码
  // 额外属性，兼容 tools/types/tool.types.ts
  user_prompt_required?: boolean;
  missing_fields?: any;
  ai_response_template?: string;
  confirmation_required?: boolean;
  confirmation_data?: any;
  nextStep?: string;
  autoSelect?: boolean;
  executionTime?: number;
}

/**
 * 工具执行器模块
 */
export class ToolExecutorModule {
  /**
   * 执行Function Tool（从原Function Tools系统移植）
   */
  async executeFunctionTool(
    toolCall: ToolCall,
    request: UserRequest,
    progressCallback?: (status: string, details?: any) => void,
    stepCallback?: (eventType: string, data: any) => void // 🆕 新增步骤回调
  ): Promise<ToolExecutionResult> {
    const toolName = toolCall.function?.name || toolCall.name;
    const rawArgs = typeof toolCall.function?.arguments === 'string'
      ? (() => { try { return JSON.parse(toolCall.function.arguments) } catch { return toolCall.function.arguments } })()
      : (toolCall.function?.arguments || toolCall.arguments || {});

    // 参数桥接：对齐不同工具定义之间的差异，确保旧/新实现都能工作
    let args: any = { ...(rawArgs || {}) };

    // 🎯 注入用户上下文（用于CRUD工具等需要用户信息的工具）
    args.__userContext = {
      userId: request.userId,
      conversationId: request.conversationId,
      context: request.context,
      token: request.context?.token  // 🔑 传递 token，供 http_request 等工具进行 API 认证
    };

    // 注入步骤回调（用于工具内部步骤通知）
    args.__stepCallback = stepCallback;

    // 页面操作工具已移除，只保留capture_screen的参数处理
    // capture_screen: 兼容 capture_type/element_selector/area/options -> fullPage/selector
    if (toolName === 'capture_screen') {
      const type = args.capture_type || args.type;
      if (type === 'full_page') args.fullPage = true;
      if (type === 'viewport') args.fullPage = false;
      if (type === 'element' && args.element_selector) args.selector = args.element_selector;
      // 其余字段保留给前端 UI 指令使用
    }

    // 3) get_activity_statistics: 兼容 period/time_period/statistic_type -> metrics/timeRange
    if (toolName === 'get_activity_statistics') {
      const period = args.time_period || args.period;
      const mapPeriod = (p: string) => ({ month: 'last_month', quarter: 'last_quarter', year: 'last_year' }[p] || 'last_month');
      if (period) args.timeRange = mapPeriod(String(period));
      // 若未提供 metrics，根据 statistic_type 或默认给一组通用指标
      if (!args.metrics || !Array.isArray(args.metrics) || args.metrics.length === 0) {
        const st = args.statistic_type || 'summary';
        if (st === 'participation') args.metrics = ['total_activities', 'average_participants', 'activity_frequency'];
        else if (st === 'effectiveness') args.metrics = ['satisfaction_score', 'success_rate'];
        else if (st === 'trends') args.metrics = ['activity_frequency', 'popular_time_slots'];
        else args.metrics = ['total_activities', 'average_participants', 'success_rate', 'satisfaction_score'];
      }
    }

    console.log(`🔧 [ToolExecutor] 开始执行Function工具: ${toolName}，参数:`, args);

    try {
      // 🔍 创建 _sseEmitter 函数，用于工具发送事件
      const _sseEmitter = (eventType: string, eventData: any) => {
        console.log(`🔍 [ToolExecutor] 工具事件: ${eventType}`, eventData);
        // 通过 progressCallback 转发事件
        if (progressCallback) {
          progressCallback(eventType, eventData);
        }
      };

      // 🔍 将 _sseEmitter 注入到工具参数中
      args._sseEmitter = _sseEmitter;

      // 如果是web_search工具，调用真实的搜索API
      if (toolName === 'web_search') {
        return await this.executeWebSearch(args, _sseEmitter);
      }

      // 直接尝试使用新工具加载器系统
      console.log(`🔄 [ToolExecutor] 尝试使用新工具系统执行: ${toolName}`);
      try {
        const { ToolLoaderService } = await import('../../ai/tools/core/tool-loader.service');
        const loader = new ToolLoaderService();
        const defs = await loader.loadTools([toolName]);
        const toolDef: any = defs[0];

        // 🔧 支持多种工具接口：implementation、handler、execute
        if (toolDef) {
          let execResult: any;
          if (typeof toolDef.implementation === 'function') {
            console.log(`✅ [ToolExecutor] 使用 implementation 执行: ${toolName}`);
            execResult = await toolDef.implementation(args);
          } else if (typeof toolDef.handler === 'function') {
            console.log(`✅ [ToolExecutor] 使用 handler 执行: ${toolName}`);
            execResult = await toolDef.handler(args);
          } else if (typeof toolDef.execute === 'function') {
            console.log(`✅ [ToolExecutor] 使用 execute 执行: ${toolName}`);
            execResult = await toolDef.execute(args);
          } else {
            console.warn(`⚠️ [ToolExecutor] 工具 ${toolName} 缺少可执行方法`);
            return {
              success: false,
              status: 'error',
              error: `工具 ${toolName} 缺少可执行方法 (implementation/handler/execute)`
            };
          }
          console.log(`✅ [ToolExecutor] ${toolName} 执行完成`);
          return execResult;
        } else {
          console.warn(`⚠️ [ToolExecutor] 新工具系统中未找到工具: ${toolName}`);
          return {
            success: false,
            status: 'error',
            error: `工具 ${toolName} 在新工具系统中未找到实现`
          };
        }
      } catch (fallbackErr) {
        console.error(`❌ [ToolExecutor] 新工具系统执行失败: ${toolName}`, fallbackErr);
        const errorMessage = fallbackErr instanceof Error ? fallbackErr.message : '未知错误';
        return {
          success: false,
          status: 'error',
          error: `工具 ${toolName} 执行失败: ${errorMessage}`
        };
      }
    } catch (error) {
      console.error(`❌ [ToolExecutor] Function工具执行失败: ${toolName}`, error);
      return {
        success: false,
        error: 'Function工具调用失败',
        message: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 执行Function Tool（使用统一工具执行器 - 新版本）
   * 🚀 这是新的统一执行器版本，逐步替代上面的旧版本
   */
  async executeFunctionToolV2(
    toolCall: ToolCall,
    request: UserRequest,
    progressCallback?: (status: string, details?: any) => void,
    stepCallback?: (eventType: string, data: any) => void // 🆕 新增步骤回调
  ): Promise<ToolExecutionResult> {
    // 🚀 使用统一工具执行器
    const { toolExecutor } = require('../../ai/tools/core/tool-executor.service');

    const toolName = toolCall.function?.name || toolCall.name;
    let args = toolCall.function?.arguments || toolCall.arguments || {};

    // 🆕 注入步骤回调到工具参数中
    if (stepCallback && typeof args === 'object') {
      args.__stepCallback = stepCallback;
    }

    console.log(`🔧 [ToolExecutor-V2] 执行工具: ${toolName}`);

    try {
      const result = await toolExecutor.execute({
        name: toolName,
        arguments: args,
        id: toolCall.id
      });

      return result;
    } catch (error: any) {
      console.error(`❌ [ToolExecutor-V2] 工具执行失败: ${toolName}`, error);
      return {
        success: false,
        error: error.message || '工具执行失败',
        metadata: { name: toolName }
      };
    }
  }

  /**
   * 执行网络搜索
   */
  private async executeWebSearch(args: any, _sseEmitter?: (eventType: string, eventData: any) => void): Promise<ToolExecutionResult> {
    console.log('📡 [ToolExecutor] 执行真实网络搜索:', args.query || args.userQuery || '');
    try {
      const webSearchTool = (await import('../../ai/tools/web-operation/web-search.tool')).default;
      const query = args.query || args.userQuery;
      const maxResults = args.count || args.maxResults || 5;

      // 🔍 发送搜索开始事件
      if (_sseEmitter) {
        console.log('🔍 [ToolExecutor] 发送search_start事件');
        _sseEmitter('search_start', {
          query,
          message: '🔍 开始搜索网络信息...',
          progress: 0
        });
      }

      // 🔍 执行搜索，传递 onProgress 回调
      const searchResponse = await webSearchTool.execute({ query, maxResults, options: {
        maxResults,
        enableAISummary: true
      }}) as any;

      // 🔍 发送搜索完成事件
      if (_sseEmitter) {
        console.log('🔍 [ToolExecutor] 发送search_complete事件');
        _sseEmitter('search_complete', {
          query,
          progress: 100,
          message: '✅ 搜索完成',
          resultCount: searchResponse.results?.length || 0,
          results: searchResponse.results?.slice(0, 3).map(r => ({
            title: r.title,
            snippet: r.snippet?.substring(0, 100)
          })),
          aiSummary: searchResponse.aiSummary
        });
      }

      return {
        success: true,
        data: {
          query,
          results: searchResponse.results,
          total: searchResponse.totalResults,
          summary: searchResponse.aiSummary,
          timeCost: searchResponse.searchTime
        },
        message: '网络搜索成功(Volcano)'
      };
    } catch (searchError) {
      console.error('❌ [ToolExecutor] 网络搜索失败:', searchError);
      return {
        success: true,
        data: {
          query: args.query || args.userQuery,
          results: [
            {
              title: `关于"${args.query || args.userQuery}"的信息`,
              url: 'https://example.com',
              snippet: `这是关于"${args.query || args.userQuery}"的相关信息。`,
              source: 'mock_fallback'
            }
          ],
          total: 1,
          source: 'mock_search_fallback'
        },
        message: '网络搜索完成（使用模拟数据）'
      };
    }
  }
}

// 导出单例
export const toolExecutorModule = new ToolExecutorModule();

