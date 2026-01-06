/**
 * 工具编排服务
 * 负责工具的选择、编排和执行
 * 支持超时控制、性能监控、工具链优化
 */

import { IntentAnalysisResult, ToolCapability } from './intent-recognition.service';
import { logger } from '../../../utils/logger';
import { ToolDefinition as AIToolDefinition } from '../../../types/ai-model-types';

// 页面操作工具已移除，保留文件操作工具
import captureScreenTool from '../../ai/tools/web-operation/capture-screen.tool';

import anyQueryTool from '../../ai/tools/database-query/any-query.tool';

import renderComponentTool from '../../ai/tools/ui-display/render-component.tool';

import generatePdfReportTool from '../../ai/tools/document-generation/generate-pdf-report.tool';
import generateExcelReportTool from '../../ai/tools/document-generation/generate-excel-report.tool';
import generateWordDocumentTool from '../../ai/tools/document-generation/generate-word-document.tool';
import generatePptPresentationTool from '../../ai/tools/document-generation/generate-ppt-presentation.tool';

// 🔍 API 发现工具（四步流程）
import searchApiCategoriesTool from '../../ai/tools/api-discovery/search-api-categories.tool';
import getApiEndpointsTool from '../../ai/tools/api-discovery/get-api-endpoints.tool';
import getApiDetailsTool from '../../ai/tools/api-discovery/get-api-details.tool';
import httpRequestTool from '../../ai/tools/web-operation/http-request.tool';

// 🚀 工作流工具
import executeActivityWorkflowTool from '../../ai/tools/workflow/activity-workflow/execute-activity-workflow.tool';

// 📋 任务管理工具
import analyzeTaskComplexityTool from '../../ai/tools/workflow/analyze-task-complexity.tool';
import createTodoListTool from '../../ai/tools/workflow/create-todo-list.tool';
import updateTodoTaskTool from '../../ai/tools/workflow/update-todo-task.tool';
import getTodoListTool from '../../ai/tools/workflow/get-todo-list.tool';

export interface Tool {
  name: string;
  description: string;
  parameters: any;
  execute: (params: any) => Promise<any>;
  timeout?: number; // 超时时间（毫秒）
  retryable?: boolean; // 是否可重试
  critical?: boolean; // 是否关键工具
}

export interface ToolExecutionPlan {
  tools: Tool[];
  executionOrder: string[];
  estimatedSteps: number;
  requiresMultiRound: boolean;
}

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  data: any;
  error?: Error;
  duration: number;
  retries?: number;
  timedOut?: boolean;
  // 兼容 tools/types/tool.types.ts 的额外属性
  status?: string;
  user_prompt_required?: boolean;
  missing_fields?: any;
  ai_response_template?: string;
  confirmation_required?: boolean;
  confirmation_data?: any;
  nextStep?: string;
  autoSelect?: boolean;
  executionTime?: number;  // 别名，兼容不同类型定义
}

export interface ToolMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalDuration: number;
  averageDuration: number;
  timeouts: number;
  retries: number;
}

export interface ExecutionOptions {
  timeout?: number;
  maxRetries?: number;
  stopOnError?: boolean;
  parallel?: boolean;
}

/**
 * 工具编排服务类
 */
export class ToolOrchestratorService {
  private static instance: ToolOrchestratorService;
  private availableTools: Map<string, Tool> = new Map();
  private toolMetrics: Map<string, ToolMetrics> = new Map();
  private readonly DEFAULT_TIMEOUT = 30000; // 30秒
  private readonly DEFAULT_MAX_RETRIES = 2;
  private defaultToolsRegistered = false;

  private constructor() {
    logger.info('✅ [工具编排] 工具编排服务初始化完成');
    this.registerDefaultTools();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ToolOrchestratorService {
    if (!ToolOrchestratorService.instance) {
      ToolOrchestratorService.instance = new ToolOrchestratorService();
    }
    return ToolOrchestratorService.instance;
  }

  /**
   * 注册工具
   */
  registerTool(tool: Tool): void {
    if (this.availableTools.has(tool.name)) {
      logger.debug(`ℹ️ [工具编排] 工具已存在，跳过注册: ${tool.name}`);
      return;
    }

    this.availableTools.set(tool.name, tool);

    // 初始化工具指标
    this.toolMetrics.set(tool.name, {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalDuration: 0,
      averageDuration: 0,
      timeouts: 0,
      retries: 0
    });

    logger.info(`✅ [工具编排] 注册工具: ${tool.name}`);
  }

  /**
   * 从工具定义注册工具
   * 支持两种类型的工具定义：
   * 1. AIToolDefinition (有 handler 属性)
   * 2. ToolDefinition (有 execute 方法)
   */
  private registerToolFromDefinition(definition: any): void {
    if (!definition) {
      logger.warn(`⚠️ [工具编排] 工具定义无效，跳过注册`);
      return;
    }

    // 检查是否有 handler (AIToolDefinition)
    if (definition.handler) {
      this.registerTool({
        name: definition.name,
        description: definition.description,
        parameters: definition.parameters,
        execute: async (params: any) => {
          const result = await definition.handler(params);
          return result;
        }
      });
    }
    // 检查是否有 execute 方法 (ToolDefinition)
    else if (definition.execute) {
      this.registerTool({
        name: definition.name,
        description: definition.description,
        parameters: definition.parameters,
        execute: definition.execute
      });
    }
    // 如果都没有，记录警告
    else {
      logger.warn(`⚠️ [工具编排] 工具缺少实现，跳过注册: ${definition?.name}`);
    }
  }

  /**
   * 注册系统默认工具
   */
  private registerDefaultTools(): void {
    if (this.defaultToolsRegistered) {
      return;
    }

    const defaultToolDefinitions: any[] = [
      // 页面操作工具已移除，只保留核心工具
      captureScreenTool,          // 文件操作：截图
      anyQueryTool,               // 数据库：复杂查询（替代read_data_record）
      renderComponentTool,        // UI显示：组件渲染
      generatePdfReportTool,      // 文档生成：PDF
      generateExcelReportTool,    // 文档生成：Excel
      generateWordDocumentTool,   // 文档生成：Word
      generatePptPresentationTool, // 文档生成：PPT

      // 🔍 API 发现工具（四步流程）
      searchApiCategoriesTool,    // 第1步：搜索 API 分类
      getApiEndpointsTool,        // 第2步：获取分类下的端点
      getApiDetailsTool,          // 第3步：获取 API 详情
      httpRequestTool,            // 第4步：执行 HTTP 请求

      // 🚀 工作流工具
      executeActivityWorkflowTool, // 活动创建工作流

      // 📋 任务管理工具（TodoList）
      analyzeTaskComplexityTool,  // 任务复杂度分析
      createTodoListTool,         // 创建待办列表
      getTodoListTool,            // 获取待办列表
      updateTodoTaskTool          // 更新任务状态
    ];

    defaultToolDefinitions.forEach(def => this.registerToolFromDefinition(def));

    this.defaultToolsRegistered = true;
    logger.info(`✅ [工具编排] 默认工具注册完成，共 ${this.availableTools.size} 个`);
  }

  /**
   * 执行单个工具（带超时和重试）
   */
  private async executeToolWithTimeout(
    tool: Tool,
    params: any,
    options: ExecutionOptions = {}
  ): Promise<ToolExecutionResult> {
    const timeout = options.timeout || tool.timeout || this.DEFAULT_TIMEOUT;
    const maxRetries = options.maxRetries || this.DEFAULT_MAX_RETRIES;
    let retries = 0;
    let lastError: Error | undefined;

    while (retries <= maxRetries) {
      try {
        const startTime = Date.now();

        // 创建超时Promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Tool execution timeout: ${tool.name}`)), timeout);
        });

        // 执行工具
        const executePromise = tool.execute(params);

        // 竞速执行
        const data = await Promise.race([executePromise, timeoutPromise]);
        const duration = Date.now() - startTime;

        // 更新指标
        this.updateToolMetrics(tool.name, true, duration, retries);

        return {
          toolName: tool.name,
          success: true,
          data,
          duration,
          retries
        };
      } catch (error) {
        lastError = error as Error;
        const isTimeout = lastError.message.includes('timeout');

        // 如果是超时或工具不可重试，不再重试
        if (isTimeout || !tool.retryable) {
          this.updateToolMetrics(tool.name, false, 0, retries, isTimeout);

          return {
            toolName: tool.name,
            success: false,
            data: null,
            error: lastError,
            duration: 0,
            retries,
            timedOut: isTimeout
          };
        }

        // 重试
        retries++;
        if (retries <= maxRetries) {
          logger.warn(`⚠️ [工具编排] ${tool.name} 执行失败，重试 ${retries}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // 指数退避
        }
      }
    }

    // 所有重试都失败
    this.updateToolMetrics(tool.name, false, 0, retries);

    return {
      toolName: tool.name,
      success: false,
      data: null,
      error: lastError,
      duration: 0,
      retries
    };
  }

  /**
   * 更新工具指标
   */
  private updateToolMetrics(
    toolName: string,
    success: boolean,
    duration: number,
    retries: number = 0,
    timedOut: boolean = false
  ): void {
    const metrics = this.toolMetrics.get(toolName);
    if (!metrics) return;

    metrics.totalExecutions++;
    if (success) {
      metrics.successfulExecutions++;
      metrics.totalDuration += duration;
      metrics.averageDuration = metrics.totalDuration / metrics.successfulExecutions;
    } else {
      metrics.failedExecutions++;
    }

    if (timedOut) {
      metrics.timeouts++;
    }

    if (retries > 0) {
      metrics.retries += retries;
    }
  }

  /**
   * 批量注册工具
   */
  registerTools(tools: Tool[]): void {
    tools.forEach(tool => this.registerTool(tool));
  }

  /**
   * 获取所有可用工具
   */
  getAvailableTools(): Tool[] {
    return Array.from(this.availableTools.values());
  }

  /**
   * 根据意图分析编排工具
   */
  async orchestrateTools(
    intentAnalysis: IntentAnalysisResult,
    query: string
  ): Promise<ToolExecutionPlan> {
    console.log(`🔧 [工具编排] 开始编排工具...`);
    console.log(`   意图: ${intentAnalysis.intent}`);
    console.log(`   复杂度: ${intentAnalysis.complexity}`);
    console.log(`   所需能力: ${intentAnalysis.requiredCapabilities.join(', ')}`);

    // 1. 根据所需能力选择工具
    const selectedTools = this.selectToolsByCapabilities(
      intentAnalysis.requiredCapabilities
    );

    // 2. 确定执行顺序
    const executionOrder = this.determineExecutionOrder(
      selectedTools,
      intentAnalysis
    );

    // 3. 评估是否需要多轮执行
    const requiresMultiRound = this.requiresMultiRound(
      selectedTools,
      intentAnalysis
    );

    const plan: ToolExecutionPlan = {
      tools: selectedTools,
      executionOrder,
      estimatedSteps: executionOrder.length,
      requiresMultiRound
    };

    console.log(`✅ [工具编排] 编排完成: ${executionOrder.length} 个步骤`);
    return plan;
  }

  /**
   * 根据能力选择工具
   */
  private selectToolsByCapabilities(capabilities: ToolCapability[]): Tool[] {
    const tools: Tool[] = [];
    const capabilityToolMap: Record<ToolCapability, string[]> = {
      [ToolCapability.DATABASE_QUERY]: [
        'any_query'
      ],
      [ToolCapability.DATA_ANALYSIS]: ['any_query'],
      [ToolCapability.CHART_GENERATION]: ['render_component'],
      // 页面操作能力已移除，专注于数据库和工作流
      [ToolCapability.NAVIGATION]: [],
      [ToolCapability.FORM_FILLING]: [],
      [ToolCapability.FILE_OPERATION]: ['capture_screen'],
      [ToolCapability.CALCULATION]: ['generate_excel_report'],
      [ToolCapability.TEXT_PROCESSING]: ['generate_word_document'],
      // 📋 任务管理能力
      [ToolCapability.TASK_MANAGEMENT]: [
        'analyze_task_complexity',
        'create_todo_list',
        'get_todo_list',
        'update_todo_task'
      ],
      // 🚀 工作流能力
      [ToolCapability.WORKFLOW]: [
        'execute_activity_workflow',
        'analyze_task_complexity',
        'create_todo_list'
      ]
    };

    capabilities.forEach(capability => {
      const toolNames = capabilityToolMap[capability] || [];
      toolNames.forEach(toolName => {
        const tool = this.availableTools.get(toolName);
        if (tool && !tools.includes(tool)) {
          tools.push(tool);
        }
      });
    });

    return tools;
  }

  /**
   * 确定执行顺序
   */
  private determineExecutionOrder(
    tools: Tool[],
    intentAnalysis: IntentAnalysisResult
  ): string[] {
    // 简单的依赖排序
    const order: string[] = [];
    const toolNames = tools.map(t => t.name);

    // 数据查询通常在前
    if (toolNames.includes('database_query')) {
      order.push('database_query');
    }

    // 数据分析在查询之后
    if (toolNames.includes('data_analyzer')) {
      order.push('data_analyzer');
    }

    // 图表生成在分析之后
    if (toolNames.includes('chart_generator')) {
      order.push('chart_generator');
    }

    // 导航通常在最后
    if (toolNames.includes('page_navigator')) {
      order.push('page_navigator');
    }

    // 添加其他工具
    toolNames.forEach(name => {
      if (!order.includes(name)) {
        order.push(name);
      }
    });

    return order;
  }

  /**
   * 判断是否需要多轮执行
   */
  private requiresMultiRound(
    tools: Tool[],
    intentAnalysis: IntentAnalysisResult
  ): boolean {
    // 复杂任务需要多轮
    if (intentAnalysis.complexity === 'complex') {
      return true;
    }

    // 多个工具需要多轮
    if (tools.length > 2) {
      return true;
    }

    return false;
  }

  /**
   * 执行工具链
   *
   * 🚨 重要：强制使用串行执行，禁用并行执行
   * 原因：
   * 1. 避免前端显示错误（消息顺序混乱）
   * 2. 避免队列问题（多个工具同时执行）
   * 3. 避免数据竞争（多个工具访问同一资源）
   * 4. 确保工具调用的顺序性和可预测性
   */
  async executeToolChain(
    plan: ToolExecutionPlan,
    context: any,
    options: ExecutionOptions = {}
  ): Promise<ToolExecutionResult[]> {
    logger.info(`🚀 [工具编排] 开始执行工具链: ${plan.executionOrder.length} 个步骤`);

    // 🚨 强制禁用并行执行，始终使用串行执行
    // 即使 options.parallel 为 true，也忽略该选项
    if (options.parallel) {
      logger.warn(`⚠️ [工具编排] 检测到并行执行请求，但已强制禁用并行执行，将使用串行执行`);
      options.parallel = false; // 强制设置为 false
    }

    // 串行执行（单步骤执行）
    const results: ToolExecutionResult[] = [];
    let previousResult: any = null;

    for (const toolName of plan.executionOrder) {
      const tool = this.availableTools.get(toolName);
      if (!tool) {
        logger.error(`❌ [工具编排] 工具未找到: ${toolName}`);
        results.push({
          toolName,
          success: false,
          data: null,
          error: new Error(`Tool not found: ${toolName}`),
          duration: 0
        });
        continue;
      }

      logger.info(`🔧 [工具编排] 执行工具: ${toolName}`);

      // 准备参数（可以使用上一步的结果）
      const params = this.prepareToolParameters(
        tool,
        context,
        previousResult
      );

      // 使用超时和重试机制执行
      const result = await this.executeToolWithTimeout(tool, params, options);
      results.push(result);

      if (result.success) {
        previousResult = result.data;
        logger.info(`✅ [工具编排] ${toolName} 执行成功 (${result.duration}ms)`);
      } else {
        logger.error(`❌ [工具编排] ${toolName} 执行失败:`, result.error);

        // 决定是否继续执行
        if (options.stopOnError || tool.critical) {
          logger.warn(`⚠️ [工具编排] 因错误停止执行`);
          break;
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    logger.info(`✅ [工具编排] 工具链执行完成: ${successCount}/${results.length} 成功`);

    return results;
  }

  /**
   * 并行执行工具链
   */
  private async executeToolChainParallel(
    plan: ToolExecutionPlan,
    context: any,
    options: ExecutionOptions = {}
  ): Promise<ToolExecutionResult[]> {
    logger.info(`🚀 [工具编排] 并行执行工具链: ${plan.tools.length} 个工具`);

    const executePromises = plan.tools.map(async (tool) => {
      const params = this.prepareToolParameters(tool, context, null);
      return this.executeToolWithTimeout(tool, params, options);
    });

    const results = await Promise.all(executePromises);

    const successCount = results.filter(r => r.success).length;
    logger.info(`✅ [工具编排] 并行执行完成: ${successCount}/${results.length} 成功`);

    return results;
  }

  /**
   * 准备工具参数
   */
  private prepareToolParameters(
    tool: Tool,
    context: any,
    previousResult: any
  ): any {
    const params: any = { ...context };

    // 如果有上一步的结果，添加到参数中
    if (previousResult) {
      params.previousResult = previousResult;
    }

    return params;
  }

  /**
   * 判断是否应该在错误时停止
   */
  private shouldStopOnError(tool: Tool, error: Error): boolean {
    // 关键工具失败时停止
    const criticalTools = ['database_query', 'authentication'];
    if (criticalTools.includes(tool.name)) {
      return true;
    }

    // 其他工具失败时继续
    return false;
  }

  /**
   * 获取工具执行统计
   */
  getExecutionStats(results: ToolExecutionResult[]): any {
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      total: results.length,
      success: successCount,
      failure: failureCount,
      successRate: (successCount / results.length) * 100,
      totalDuration,
      averageDuration: totalDuration / results.length
    };
  }

  /**
   * 格式化执行结果
   */
  formatResults(results: ToolExecutionResult[]): string {
    let output = '## 工具执行结果\n\n';

    results.forEach((result, index) => {
      output += `### ${index + 1}. ${result.toolName}\n`;
      output += `- 状态: ${result.success ? '✅ 成功' : '❌ 失败'}\n`;
      output += `- 耗时: ${result.duration}ms\n`;

      if (result.retries && result.retries > 0) {
        output += `- 重试次数: ${result.retries}\n`;
      }

      if (result.timedOut) {
        output += `- ⚠️ 超时\n`;
      }

      if (result.success && result.data) {
        output += `- 结果: ${JSON.stringify(result.data).substring(0, 200)}...\n`;
      }

      if (!result.success && result.error) {
        output += `- 错误: ${result.error.message}\n`;
      }

      output += '\n';
    });

    const stats = this.getExecutionStats(results);
    output += `## 统计信息\n`;
    output += `- 总计: ${stats.total} 个工具\n`;
    output += `- 成功: ${stats.success} 个\n`;
    output += `- 失败: ${stats.failure} 个\n`;
    output += `- 成功率: ${stats.successRate.toFixed(1)}%\n`;
    output += `- 总耗时: ${stats.totalDuration}ms\n`;

    return output;
  }

  /**
   * 获取工具性能指标
   */
  getToolMetrics(toolName: string): ToolMetrics | null {
    return this.toolMetrics.get(toolName) || null;
  }

  /**
   * 获取所有工具性能指标
   */
  getAllToolMetrics(): Map<string, ToolMetrics> {
    return new Map(this.toolMetrics);
  }

  /**
   * 重置工具指标
   */
  resetToolMetrics(toolName?: string): void {
    if (toolName) {
      const metrics = this.toolMetrics.get(toolName);
      if (metrics) {
        Object.assign(metrics, {
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          totalDuration: 0,
          averageDuration: 0,
          timeouts: 0,
          retries: 0
        });
        logger.info(`🔄 [工具编排] 重置工具指标: ${toolName}`);
      }
    } else {
      this.toolMetrics.forEach((_, name) => this.resetToolMetrics(name));
      logger.info('🔄 [工具编排] 重置所有工具指标');
    }
  }

  /**
   * 获取服务统计
   */
  getStats(): {
    totalTools: number;
    totalExecutions: number;
    totalSuccesses: number;
    totalFailures: number;
    totalTimeouts: number;
    totalRetries: number;
    overallSuccessRate: number;
  } {
    let totalExecutions = 0;
    let totalSuccesses = 0;
    let totalFailures = 0;
    let totalTimeouts = 0;
    let totalRetries = 0;

    this.toolMetrics.forEach(metrics => {
      totalExecutions += metrics.totalExecutions;
      totalSuccesses += metrics.successfulExecutions;
      totalFailures += metrics.failedExecutions;
      totalTimeouts += metrics.timeouts;
      totalRetries += metrics.retries;
    });

    return {
      totalTools: this.availableTools.size,
      totalExecutions,
      totalSuccesses,
      totalFailures,
      totalTimeouts,
      totalRetries,
      overallSuccessRate: totalExecutions > 0 ? (totalSuccesses / totalExecutions) * 100 : 0
    };
  }

  /**
   * 获取性能最差的工具
   */
  getWorstPerformingTools(limit: number = 5): Array<{ name: string; metrics: ToolMetrics }> {
    const tools = Array.from(this.toolMetrics.entries())
      .map(([name, metrics]) => ({ name, metrics }))
      .filter(t => t.metrics.totalExecutions > 0)
      .sort((a, b) => {
        // 按失败率和平均耗时排序
        const aFailureRate = a.metrics.failedExecutions / a.metrics.totalExecutions;
        const bFailureRate = b.metrics.failedExecutions / b.metrics.totalExecutions;

        if (aFailureRate !== bFailureRate) {
          return bFailureRate - aFailureRate;
        }

        return b.metrics.averageDuration - a.metrics.averageDuration;
      });

    return tools.slice(0, limit);
  }

  /**
   * 注销工具
   */
  unregisterTool(toolName: string): boolean {
    const deleted = this.availableTools.delete(toolName);
    if (deleted) {
      this.toolMetrics.delete(toolName);
      logger.info(`🗑️ [工具编排] 注销工具: ${toolName}`);
    }
    return deleted;
  }

  /**
   * 清空所有工具
   */
  clearAllTools(): void {
    const count = this.availableTools.size;
    this.availableTools.clear();
    this.toolMetrics.clear();
    logger.info(`🗑️ [工具编排] 清空所有工具: ${count} 个`);
  }
}

// 导出单例
export const toolOrchestratorService = ToolOrchestratorService.getInstance();

