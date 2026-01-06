/**
 * 工具加载服务
 * 动态加载和管理AI工具
 */

import { ToolDefinition, ToolCategory } from '../../../../types/ai-model-types';

class ToolLoaderService {
  // 使用 any 类型支持两种不同的 ToolDefinition 类型
  // 1. ai-model-types.ToolDefinition (有 handler 和 category)
  // 2. tools/types/tool.types.ToolDefinition (有 execute 方法)
  private tools: Map<string, any> = new Map();
  private loaded: boolean = false;

  /**
   * 加载工具
   * @param toolNames - 可选的工具名称列表，如果提供则只返回这些工具
   */
  async loadTools(toolNames?: string[]): Promise<any[]> {
    if (!this.loaded) {
      console.log('🔧 [工具加载器] 加载工具...');

    // ✅ 注册 any_query 工具
    try {
      const anyQueryModule = await import('../database-query/any-query.tool');
      const anyQueryTool = anyQueryModule.default;
      this.registerTool(anyQueryTool);
      console.log('✅ [工具加载器] 已注册 any_query 工具');
    } catch (error) {
      console.error('❌ [工具加载器] 注册 any_query 工具失败:', error);
    }

    // ✅ 注册 search_api_categories 工具（第1步）
    try {
      const searchApiCategoriesModule = await import('../api-discovery/search-api-categories.tool');
      const searchApiCategoriesTool = searchApiCategoriesModule.default;
      this.registerTool(searchApiCategoriesTool);
      console.log('✅ [工具加载器] 已注册 search_api_categories 工具');
    } catch (error) {
      console.error('❌ [工具加载器] 注册 search_api_categories 工具失败:', error);
    }

    // ✅ 注册 get_api_endpoints 工具（第2步）
    try {
      const getApiEndpointsModule = await import('../api-discovery/get-api-endpoints.tool');
      const getApiEndpointsTool = getApiEndpointsModule.default;
      this.registerTool(getApiEndpointsTool);
      console.log('✅ [工具加载器] 已注册 get_api_endpoints 工具');
    } catch (error) {
      console.error('❌ [工具加载器] 注册 get_api_endpoints 工具失败:', error);
    }

    // ✅ 注册 get_api_details 工具（第3步）
    try {
      const getApiDetailsModule = await import('../api-discovery/get-api-details.tool');
      const getApiDetailsTool = getApiDetailsModule.default;
      this.registerTool(getApiDetailsTool);
      console.log('✅ [工具加载器] 已注册 get_api_details 工具');
    } catch (error) {
      console.error('❌ [工具加载器] 注册 get_api_details 工具失败:', error);
    }

    // ✅ 注册 http_request 工具（第4步）
    try {
      const httpRequestModule = await import('../web-operation/http-request.tool');
      const httpRequestTool = httpRequestModule.default;
      this.registerTool(httpRequestTool);
      console.log('✅ [工具加载器] 已注册 http_request 工具');
    } catch (error) {
      console.error('❌ [工具加载器] 注册 http_request 工具失败:', error);
    }

    // ✅ 注册 execute_activity_workflow 工具（活动工作流）
    try {
      const executeActivityWorkflowModule = await import('../workflow/activity-workflow/execute-activity-workflow.tool');
      const executeActivityWorkflowTool = executeActivityWorkflowModule.default;
      this.registerTool(executeActivityWorkflowTool);
      console.log('✅ [工具加载器] 已注册 execute_activity_workflow 工具');
    } catch (error) {
      console.error('❌ [工具加载器] 注册 execute_activity_workflow 工具失败:', error);
    }

    // ✅ 注册 web_search 工具（网络搜索）
    try {
      const webSearchModule = await import('../web-operation/web-search.tool');
      const webSearchTool = webSearchModule.default;
      this.registerTool(webSearchTool);
      console.log('✅ [工具加载器] 已注册 web_search 工具');
    } catch (error) {
      console.error('❌ [工具加载器] 注册 web_search 工具失败:', error);
    }

    // ✅ 注册 analyze_task_complexity 工具（任务复杂度分析）
    try {
      const analyzeTaskComplexityModule = await import('../workflow/analyze-task-complexity.tool');
      const analyzeTaskComplexityTool = analyzeTaskComplexityModule.default;
      this.registerTool(analyzeTaskComplexityTool);
      console.log('✅ [工具加载器] 已注册 analyze_task_complexity 工具');
    } catch (error) {
      console.error('❌ [工具加载器] 注册 analyze_task_complexity 工具失败:', error);
    }

    // ✅ 注册 create_todo_list 工具（创建TodoList）
    try {
      const createTodoListModule = await import('../workflow/create-todo-list.tool');
      const createTodoListTool = createTodoListModule.default;
      this.registerTool(createTodoListTool);
      console.log('✅ [工具加载器] 已注册 create_todo_list 工具');
    } catch (error) {
      console.error('❌ [工具加载器] 注册 create_todo_list 工具失败:', error);
    }

    // ✅ 注册 update_todo_task 工具（更新任务状态）
    try {
      const updateTodoTaskModule = await import('../workflow/update-todo-task.tool');
      const updateTodoTaskTool = updateTodoTaskModule.default;
      this.registerTool(updateTodoTaskTool);
      console.log('✅ [工具加载器] 已注册 update_todo_task 工具');
    } catch (error) {
      console.error('❌ [工具加载器] 注册 update_todo_task 工具失败:', error);
    }

    // ✅ 注册 get_todo_list 工具（获取TodoList）
    try {
      const getTodoListModule = await import('../workflow/get-todo-list.tool');
      const getTodoListTool = getTodoListModule.default;
      this.registerTool(getTodoListTool);
      console.log('✅ [工具加载器] 已注册 get_todo_list 工具');
    } catch (error) {
      console.error('❌ [工具加载器] 注册 get_todo_list 工具失败:', error);
    }

    this.loaded = true;
    console.log(`✅ [工具加载器] 已加载 ${this.tools.size} 个工具`);
  }

    // 如果指定了工具名称，只返回这些工具
    if (toolNames && toolNames.length > 0) {
      return toolNames
        .map(name => this.tools.get(name))
        .filter((tool): tool is any => tool !== undefined);
    }

    return this.getAllTools();
  }

  /**
   * 注册工具
   * 支持两种类型的工具定义：
   * 1. AIToolDefinition (有 handler 属性)
   * 2. ToolDefinition (有 execute 方法)
   */
  registerTool(tool: any): void {
    if (!tool) {
      console.warn('⚠️ [工具加载器] 工具定义无效，跳过注册');
      return;
    }
    this.tools.set(tool.name, tool);
  }

  /**
   * 获取工具
   */
  getTool(name: string): any {
    return this.tools.get(name);
  }

  /**
   * 获取所有工具
   */
  getAllTools(): any[] {
    return Array.from(this.tools.values());
  }

  /**
   * 按类别获取工具
   */
  getToolsByCategory(category: ToolCategory): any[] {
    return this.getAllTools().filter(t => t.category === category);
  }

  /**
   * 获取工具名称列表
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * 执行工具
   * 支持两种类型：handler (AIToolDefinition) 和 execute (ToolDefinition)
   */
  async executeTool(name: string, params: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`工具 ${name} 不存在`);
    }
    // 优先使用 handler，如果没有则使用 execute
    if (tool.handler) {
      return await tool.handler(params);
    } else if (tool.execute) {
      return await tool.execute(params);
    } else {
      throw new Error(`工具 ${name} 缺少可执行方法 (handler 或 execute)`);
    }
  }

  /**
   * 获取工具描述
   */
  getToolDescriptions(): string {
    return this.getAllTools()
      .map(t => `- ${t.name}: ${t.description}`)
      .join('\n');
  }
}

export const toolLoaderService = new ToolLoaderService();
export { ToolLoaderService };

