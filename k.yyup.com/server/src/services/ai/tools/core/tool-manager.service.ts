/**
 * 工具管理器服务 - 简化版占位符
 */

export interface Tool {
  id: string;
  name: string;
  description: string;
  category?: string;
}

export class ToolManagerService {
  private static instance: ToolManagerService;
  private tools: Map<string, Tool> = new Map();

  static getInstance(): ToolManagerService {
    if (!ToolManagerService.instance) {
      ToolManagerService.instance = new ToolManagerService();
    }
    return ToolManagerService.instance;
  }

  async getAvailableTools(): Promise<Tool[]> {
    console.log('🔧 获取可用工具');
    return Array.from(this.tools.values());
  }

  async executeTool(toolId: string, params: any): Promise<any> {
    console.log('⚡ 执行工具:', toolId, params);
    return { executed: true, toolId, params };
  }

  /**
   * 根据查询获取相关工具
   * @param queryOrContext - 查询字符串或上下文对象
   */
  async getToolsForQuery(queryOrContext: string | { query: string; userRole?: string; userId?: number; conversationId?: string; maxTools?: number }): Promise<Tool[]> {
    const query = typeof queryOrContext === 'string' ? queryOrContext : queryOrContext.query;
    const maxTools = typeof queryOrContext === 'object' ? queryOrContext.maxTools : undefined;

    console.log('🔍 根据查询获取工具:', query);
    // 简单的关键词匹配
    const allTools = await this.getAvailableTools();
    let matchedTools = allTools.filter(tool =>
      query.toLowerCase().includes(tool.name.toLowerCase()) ||
      tool.description.toLowerCase().includes(query.toLowerCase())
    );

    // 限制返回数量
    if (maxTools && matchedTools.length > maxTools) {
      matchedTools = matchedTools.slice(0, maxTools);
    }

    return matchedTools;
  }

  /**
   * 注册工具
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.id, tool);
  }
}

export const toolManagerService = ToolManagerService.getInstance();
