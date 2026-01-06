/**
 * 统一智能决策中心
 * 负责统一分析用户请求，智能选择最优工具，协调执行并整合结果
 */

import { Role, PermissionLevel, ROLE_PERMISSIONS, logSecurityViolation } from '../../middlewares/rbac.middleware';
import { unifiedAIBridge } from '../unified-ai-bridge.service';
import { MessageRole } from '../../models/ai-message.model';
import { getMemorySystem } from '../memory/six-dimension-memory.service';
import { directResponseService } from '../ai/direct-response.service';
import modelSelectorService from '../ai/model-selector.service';
import AIModelConfig, { ModelType } from '../../models/ai-model-config.model';
import { ToolManagerService } from '../ai/tools/core/tool-manager.service';
import { SmartModelRouterService, ExecutionPhase } from '../ai-smart-model-router.service';
import { TOOL_CATEGORIES } from '../../types/ai-model-types';

import { ToolLoaderService } from '../ai/tools/core/tool-loader.service';
import { buildToolPreDescription, getToolDescMode } from '../ai/tools/tool-description.util';
import { generateToolDescription, generateToolIntent } from '../ai/tools/tool-description-generator.service';
import { promptBuilderService } from './core/prompt-builder.service';
import { memoryIntegrationService } from './core/memory-integration.service';
import { intentRecognitionService } from './core/intent-recognition.service';
import { streamingService } from './core/streaming.service';
import { securityChecker } from './modules/security-checker.module';
import { toolExecutorModule } from './modules/tool-executor.module';
import { sseHandlerModule } from './modules/sse-handler.module';
import { responseIntegratorModule } from './modules/response-integrator.module';
import { PromptCacheService } from './core/prompt-cache.service';
import { ThinkingStream, AnswerStream, ToolCallStream, sendSSE, initSSE, sendComplete } from '../../utils/sse-helper';

// 意图类型枚举
export enum IntentType {
  PAGE_OPERATION = 'page_operation',
  DATA_VISUALIZATION = 'data_visualization',
  TASK_MANAGEMENT = 'task_management',
  EXPERT_CONSULTATION = 'expert_consultation',
  GENERAL_QUERY = 'general_query',
  INFORMATION_QUERY = 'information_query',
  COMPLEX_WORKFLOW = 'complex_workflow'
}

// 任务复杂度枚举
export enum TaskComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  VERY_COMPLEX = 'very_complex'
}

// 工具执行结果
export interface ToolExecution {
  toolName: string;
  params: any;
  result: any;
  success: boolean;
  executionTime: number;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}

// 请求分析结果
export interface RequestAnalysis {
  intent: IntentType;
  complexity: TaskComplexity;
  requiredTools: string[];
  context: any;
  confidence: number;
}

// UI组件
export interface UIComponent {
  type: string;
  props: any;
  data?: any;
  animation?: string;
  children?: UIComponent[];
}

// 推荐
export interface Recommendation {
  id?: string;
  title: string;
  description: string;
  priority: number | string;
  action?: string;
}

// 统一最大迭代次数配置（优先读取 AI_MAX_ITERATIONS，其次兼容 VITE_AI_MAX_ITERATIONS；默认 12）
const ENV_MAX_ITERS: number = Number(process.env.AI_MAX_ITERATIONS || process.env.VITE_AI_MAX_ITERATIONS || 12);

export interface UserRequest {
  content: string;
  userId: string;
  conversationId: string;
  context?: any;
}

export interface FormElement {
  id: string;
  action: string;
  method: string;
  fields: any[];
}

export interface ButtonElement {
  id: string;
  text: string;
  type: string;
}

export interface IntelligentResponse {
  success: boolean;
  data: {
    message: string;
    toolExecutions: any[];
    uiComponents: any[];
    recommendations: any[];
    todoList?: any;
    visualizations?: any[];
  };
  metadata: {
    executionTime: number;
    toolsUsed: string[];
    confidenceScore: number;
    nextSuggestedActions: string[];
    complexity: TaskComplexity;
    approach: string;
  };
  error?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  requiredTools: string[];
  estimatedTime: number;
  dependencies: string[];
}

/**
 * 统一智能决策服务
 */
export class UnifiedIntelligenceService {
  private memoryService: any;
  private toolLoader: ToolLoaderService;
  private smartModelRouter: SmartModelRouterService;
  private promptCache: PromptCacheService;
  private queryRouterService: any; // 查询路由服务

  constructor() {
    // 初始化六维记忆服务
    this.memoryService = getMemorySystem();
    // 初始化工具加载器（用于生成工具预说明）
    this.toolLoader = new ToolLoaderService();
    // 🚀 初始化智能模型路由器
    this.smartModelRouter = SmartModelRouterService.getInstance();
    // 🚀 初始化提示词缓存服务
    this.promptCache = PromptCacheService.getInstance();
    console.log('🧠 [UnifiedIntelligence] 六维记忆系统已初始化');
    console.log('🎯 [UnifiedIntelligence] 智能模型路由器已初始化');
    console.log('⚡ [UnifiedIntelligence] 提示词缓存服务已初始化');
  }

  /**
   * 从查询中提取动作 - 使用查询路由服务的统一匹配逻辑
   */
  private extractActionFromQuery(query: string): string | null {
    try {
      console.log('🎯 [extractActionFromQuery] 开始提取动作:', query);

      // 使用查询路由服务的智能识别
      const action = this.queryRouterService.identifyAction(query);

      console.log('✅ [extractActionFromQuery] 动作提取完成:', action);
      return action;
    } catch (error) {
      console.error('❌ [extractActionFromQuery] 动作提取失败:', error);
      return null;
    }
  }

  /**
   * 从查询中提取参数 - 使用查询路由服务的智能识别
   */
  private extractParametersFromQuery(query: string, action?: string): Record<string, any> {
    try {
      console.log('🔍 [extractParametersFromQuery] 开始提取参数:', { query, action });

      // 使用查询路由服务的智能识别
      const parameters = this.queryRouterService.identifyParameters(query, action);

      console.log('✅ [extractParametersFromQuery] 参数提取完成:', parameters);
      return parameters;
    } catch (error) {
      console.error('❌ [extractParametersFromQuery] 参数提取失败:', error);
      return {};
    }
  }

  /**
   * 构建系统提示词 (优化版本 - 使用缓存)
   */
  private async buildSystemPrompt(userRole: string, context?: any): Promise<string> {
    console.log('🔧 [buildSystemPrompt] 开始构建系统提示词...');

    // 🚀 优化：先尝试从缓存获取
    const cachedPrompt = await this.promptCache.getCachedPrompt(userRole, context);
    if (cachedPrompt) {
      console.log('⚡ [buildSystemPrompt] 使用缓存提示词，跳过重新构建');
      return cachedPrompt;
    }

    console.log('🔨 [buildSystemPrompt] 缓存未命中，开始重新构建...');

    // 🏢 获取机构现状数据（从缓存获取）
    const organizationData = await this.promptCache.getCachedOrganizationData(context);
    const organizationStatusText = this.promptCache.formatOrganizationStatusText(organizationData);

    // 🎯 获取工具选择决策树（从缓存获取）
    const toolSelectionDecisionTree = await this.promptCache.getCachedDecisionTree();

    // 检查模式类型
    const isDirectMode = context?.isDirectMode === true;
    const enableThinkOptimization = context?.enableThinkOptimization === true;

    let finalPrompt: string;

    if (isDirectMode && !enableThinkOptimization) {
      // 传统直连模式
      console.log('🎯 [buildSystemPrompt] 使用传统直连模式模板');
      finalPrompt = promptBuilderService.buildDirectModePrompt(
        organizationStatusText,
        toolSelectionDecisionTree
      );
    } else if (enableThinkOptimization) {
      // Think优化模式
      console.log('🧠 [buildSystemPrompt] 使用Think优化模式构建提示词');
      const thinkOptimizedContext = {
        userRole,
        memoryContext: context?.memoryContext || [],
        pageContext: context?.pageContext,
        tools: context?.tools || [],
        requiresIntentAnalysis: context?.requiresIntentAnalysis ?? true,
        enableCorrelatedQuery: context?.enableCorrelatedQuery ?? true,
        userQuery: context?.userQuery || '',
        selectedTools: context?.selectedTools || [],
        enableEnhancedResponse: context?.enableEnhancedResponse ?? true
      };
      finalPrompt = promptBuilderService.buildSystemPrompt(thinkOptimizedContext);
    } else {
      // 传统智能代理模式
      console.log('🎯 [buildSystemPrompt] 使用传统智能代理模式模板');
      finalPrompt = promptBuilderService.buildAgentModePrompt(
        userRole,
        organizationStatusText,
        toolSelectionDecisionTree
      );
    }

    // 🚀 缓存构建完成的提示词
    await this.promptCache.cachePrompt(userRole, finalPrompt, context);

    console.log('✅ [buildSystemPrompt] 提示词构建完成并已缓存，长度:', finalPrompt.length);
    return finalPrompt;
  }

  /**
   * 🏢 获取机构现状数据文本 (优化版本 - 使用缓存)
   * @deprecated 使用 PromptCacheService.getCachedOrganizationData 替代
   */
  public async getOrganizationStatusText(context?: any): Promise<string> {
    try {
      console.warn('⚠️ [getOrganizationStatusText] 此方法已废弃，使用缓存服务替代');

      const orgData = await this.promptCache.getCachedOrganizationData(context);
      return this.promptCache.formatOrganizationStatusText(orgData);

    } catch (error) {
      console.error('❌ [getOrganizationStatusText] 加载机构现状失败:', error);
      return '\n\n## 📊 机构现状数据暂时无法加载\n\n';
    }
  }

  /**
   * 创建成功响应
   */
  private createSuccessResponse(aiResponse: any, processingTime: number): IntelligentResponse {
    // 从AI响应中提取工具执行信息
    const toolExecutions = aiResponse.tool_executions || [];
    const toolsUsed = toolExecutions.map((tool: any) => tool.name || 'unknown').filter((name: string) => name !== 'unknown');

    return {
      success: true,
      data: {
        message: aiResponse.content || aiResponse.message || '处理完成',
        toolExecutions: toolExecutions.map((tool: any) => ({
          name: tool.name,
          description: tool.description || `执行 ${tool.name}`,
          params: tool.arguments || tool.params || {},
          result: tool.result,
          success: tool.success !== false,
          timestamp: tool.timestamp || new Date().toISOString()
        })),
        uiComponents: [],
        recommendations: []
      },
      metadata: {
        executionTime: processingTime,
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : ['ai_processing'],
        confidenceScore: aiResponse.confidence || 0.8,
        nextSuggestedActions: [],
        complexity: toolExecutions.length > 3 ? TaskComplexity.COMPLEX :
                   toolExecutions.length > 1 ? TaskComplexity.MODERATE :
                   TaskComplexity.SIMPLE,
        approach: toolExecutions.length > 0 ? 'multi_round_with_tools' : 'simplified_processing'
      }
    };
  }

  /**
   * 创建安全检查被拒绝的响应
   */
  private createSecurityDeniedResponse(securityCheck: any, executionTime: number): IntelligentResponse {
    return {
      success: false,
      data: {
        message: securityCheck.reason || '权限不足，无法执行此操作',
        toolExecutions: [],
        uiComponents: [],
        recommendations: [
          {
            title: '权限说明',
            description: '请检查您的账户权限或联系管理员',
            action: 'contact_admin',
            priority: 'high'
          }
        ]
      },
      metadata: {
        executionTime,
        toolsUsed: [],
        confidenceScore: 1.0,
        nextSuggestedActions: ['联系管理员申请权限', '使用有权限的功能'],
        complexity: TaskComplexity.SIMPLE,
        approach: 'security_denied'
      },
      error: securityCheck.reason || '权限不足'
    };
  }

  /**
   * SSE流式处理用户请求 - 单次调用版本（用于前端多轮调用架构）
   * @param request 用户请求
   * @param res Express Response对象，用于SSE流式推送
   */
  async processUserRequestStreamSingleRound(request: UserRequest, res: any): Promise<void> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 [单次调用] 开始流式处理用户请求（单次调用模式）');
    console.log('📝 [单次调用] 请求内容:', request.content);
    console.log('👤 [单次调用] 用户ID:', request.userId);
    console.log('💬 [单次调用] 会话ID:', request.conversationId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // ✨ 使用新的 SSE 辅助工具初始化响应头
    initSSE(res);

    try {
      // 1. 安全检查（仅第一轮）
      const isFirstRound = !request?.context?.currentRound || request.context.currentRound === 1;
      if (isFirstRound) {
        const securityCheck = await securityChecker.performSecurityCheck(request);
        if (!securityCheck.allowed) {
          sendSSE(res, 'error', {
            message: '🚨 权限检查失败: ' + securityCheck.reason,
            error: securityCheck
          });
          res.end();
          return;
        }
      }

      // 2. ✨ 创建 ThinkingStream 实例（带进度）
      const thinkingStream = new ThinkingStream(res, 4);
      thinkingStream.start();
      
      // 模拟思考阶段
      thinkingStream.update('security_check', '🔒 验证用户权限...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      thinkingStream.update('intent_analysis', '🎯 分析用户意图...');
      await new Promise(resolve => setTimeout(resolve, 150));
      
      thinkingStream.update('context_building', '📚 构建上下文...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      thinkingStream.update('ai_processing', '🤖 准备AI处理...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      thinkingStream.complete();

      // 3. 调用单次AI调用 + 工具执行（带流式输出）
      await this.callDoubaoSingleRoundSSE(request, res);

      // 4. 发送完成事件
      console.log('✅ [单次调用] 所有处理完成，发送complete事件');
      sendComplete(res, {
        message: '✅ 处理完成',
        isComplete: true,
        needsContinue: false
      });

    } catch (error: any) {
      console.error('❌ [单次调用] 流式处理错误:', error);
      sendSSE(res, 'error', {
        message: '❌ 处理过程中出现错误: ' + error.message,
        error: error.toString()
      });
      res.end();
    } finally {
      // 确保SSE流被关闭
      if (!res.writableEnded) {
        console.log('🔚 [单次调用] finally块关闭SSE流');
        res.end();
      }
    }
  }

 /**
   * 调用豆包单次AI + 工具执行 (SSE版本)
   * 通过 AI 桥接服务调用统一租户系统的 AI 服务
   * ✨ 支持工具调用、数据分析、解说生成
   */
  private async callDoubaoSingleRoundSSE(request: UserRequest, res: any): Promise<void> {
    const startTime = Date.now();

    try {
      // 构建系统提示词（使用缓存）
      const systemPrompt = await this.buildSystemPrompt(request.context?.role || 'user', request.context);

      // ✨ 1. 加载可用工具
      console.log('🔧 [callDoubaoSingleRoundSSE] 加载可用工具...');
      // 加载已注册的AI工具
      const toolNames = [
        'any_query',                 // 通用数据库查询工具（复杂统计和多表JOIN）
        'search_api_categories',     // API工具链(1): 搜索API分类
        'get_api_endpoints',         // API工具链(2): 获取API端点列表
        'get_api_details',           // API工具链(3): 获取API详细信息
        'http_request',              // API工具链(4): 发起HTTP请求
        'web_search',                // 网络搜索工具（火山引擎融合搜索）
        'execute_activity_workflow'  // 活动工作流工具
      ];
      const availableTools = await this.toolLoader.loadTools(toolNames);
      const toolDefinitions = availableTools.map(tool => ({
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      }));
      console.log(`✅ [callDoubaoSingleRoundSSE] 已加载 ${toolDefinitions.length} 个工具`);

      console.log('🚀 [callDoubaoSingleRoundSSE] 通过 AI 桥接服务调用统一租户系统（带工具支持）');

      // ✨ 2. 调用 AI（带工具定义）
      // 🔧 修复：使用豆包 1.6 flash 模型（快速决策模型）
      const chatRequest: any = {
        model: 'doubao-seed-1-6-flash-250715',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.content }
        ],
        tools: toolDefinitions,          // ✨ 传递工具定义
        tool_choice: 'auto',             // ✨ 让 AI 自动决定是否调用工具
        temperature: 0.7,
        max_tokens: 2000
      };
      const aiResponse = await unifiedAIBridge.chat(chatRequest) as any;

      // 🔧 修复: 检查 AI 调用是否成功
      if (!aiResponse.success || aiResponse.error) {
        console.error(`❌ [callDoubaoSingleRoundSSE] AI调用失败: ${aiResponse.error}`);
        throw new Error(aiResponse.error || 'AI调用失败');
      }

      // 🔧 修复: 从正确位置提取 tool_calls 和 content
      // aiResponse.data 结构: { content, message (string), reasoning_content, tool_calls }
      const content = aiResponse.data?.content || '';
      const toolCalls = (aiResponse.data as any)?.tool_calls;

      console.log(`🔍 [callDoubaoSingleRoundSSE] AI响应分析:`);
      console.log(`  - content 长度: ${content?.length || 0}`);
      console.log(`  - tool_calls: ${toolCalls ? `${toolCalls.length} 个` : '无'}`);
      console.log(`  - reasoning_content: ${aiResponse.data?.reasoning_content?.substring(0, 50) || 'none'}...`);

      // ✨ 2.5 检查 content 中是否包含 placeholder 格式的工具调用
      // 豆包模型有时会将工具调用嵌入到 content 中，格式为:
      // <[PLHD20_never_used_...]>[{"name":"...","parameters":{...}}]<[PLHD21_never_used_...]>
      let parsedToolCalls = toolCalls;
      if (!parsedToolCalls || parsedToolCalls.length === 0) {
        const placeholderPattern = /<\[PLHD\d+_never_used_[a-f0-9]+\]>\s*\[?\{[\s\S]*?"name"\s*:\s*"([^"]+)"[\s\S]*?\}\]?\s*<\[PLHD\d+_never_used_[a-f0-9]+\]>/g;
        const jsonPattern = /<\[PLHD\d+_never_used_[a-f0-9]+\]>\s*(\[?\{[\s\S]*?\}\]?)\s*<\[PLHD\d+_never_used_[a-f0-9]+\]>/g;
        
        const matches = [...content.matchAll(jsonPattern)];
        if (matches.length > 0) {
          console.log(`🔍 [callDoubaoSingleRoundSSE] 在 content 中检测到 ${matches.length} 个 placeholder 格式的工具调用`);
          parsedToolCalls = [];
          
          for (const match of matches) {
            try {
              let jsonStr = match[1].trim();
              // 处理数组格式 [{...}] 或单个对象格式 {...}
              let toolCallObjs = jsonStr.startsWith('[') ? JSON.parse(jsonStr) : [JSON.parse(jsonStr)];
              
              for (const toolCallObj of toolCallObjs) {
                const toolName = toolCallObj.name;
                const args = toolCallObj.parameters || toolCallObj.arguments || {};
                
                if (toolName) {
                  // 转换为标准 tool_call 格式
                  parsedToolCalls.push({
                    id: `placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'function',
                    function: {
                      name: toolName,
                      arguments: JSON.stringify(args)
                    }
                  });
                  console.log(`  ✅ 解析出工具调用: ${toolName}`);
                }
              }
            } catch (parseError) {
              console.warn(`⚠️ [callDoubaoSingleRoundSSE] 解析 placeholder 工具调用失败:`, parseError);
            }
          }
          
          console.log(`📋 [callDoubaoSingleRoundSSE] 共解析出 ${parsedToolCalls.length} 个工具调用`);
        }
      }

      // ✨ 3. 检查并执行工具调用
      if (parsedToolCalls && parsedToolCalls.length > 0) {
        console.log(`🔧 [callDoubaoSingleRoundSSE] AI 请求调用 ${toolCalls.length} 个工具`);
        
        const toolResults: any[] = [];

        for (const toolCall of toolCalls) {
          const toolName = toolCall.function?.name || '';
          const startToolTime = Date.now();

          // 发送工具调用开始事件
          sendSSE(res, 'tool_call_start', {
            name: toolName,
            description: `🔧 正在执行: ${toolName}`,
            startTimestamp: startToolTime
          });

          try {
            // 执行工具
            console.log(`▶️  [callDoubaoSingleRoundSSE] 执行工具: ${toolName}`);
            const toolResult = await toolExecutorModule.executeFunctionTool(
              toolCall,
              request,
              (status, details) => {
                // 工具执行进度回调
                console.log(`📊 [工具进度] ${toolName}: ${status}`, details);
              }
            );

            const toolDuration = Date.now() - startToolTime;
            toolResults.push({
              toolName,
              result: toolResult,
              duration: toolDuration
            });

            // 发送工具调用完成事件
            sendSSE(res, 'tool_call_complete', {
              name: toolName,
              status: 'completed',
              duration: toolDuration
            });

            // ✨ 4. 生成工具解说（narration）
            console.log(`💬 [callDoubaoSingleRoundSSE] 生成工具解说: ${toolName}`);
            // 🔧 修复：正确处理工具返回数据结构
            // 工具直接返回的对象可能是 { success, message, categories } 而不是包装在 data/result 中
            const actualToolResult = toolResult.data || toolResult.result || toolResult;
            const narration = await this.generateToolNarration(
              request.content,
              toolName,
              actualToolResult
            );

            // 发送工具解说事件
            sendSSE(res, 'tool_narration', {
              toolName,
              narration,
              type: 'result'
            });

            console.log(`✅ [callDoubaoSingleRoundSSE] 工具执行完成: ${toolName}，耗时: ${toolDuration}ms`);
          } catch (toolError: any) {
            console.error(`❌ [callDoubaoSingleRoundSSE] 工具执行失败: ${toolName}`, toolError);
            
            sendSSE(res, 'tool_call_error', {
              name: toolName,
              error: toolError.message || '工具执行失败'
            });

            toolResults.push({
              toolName,
              result: { success: false, error: toolError.message },
              duration: Date.now() - startToolTime
            });
          }
        }

        // ✨ 5. 基于工具结果生成最终答案
        console.log('🤖 [callDoubaoSingleRoundSSE] 基于工具结果生成最终答案...');
        const finalAnswer = await this.generateFinalAnswerWithToolResults(
          request,
          systemPrompt,
          toolResults
        );

        // 逐字输出最终答案
        const answerStream = new AnswerStream(res);
        sendSSE(res, 'answer_start', {
          message: '💬 开始生成回答...',
          totalLength: finalAnswer.length
        });
        await answerStream.writeWithTyping(finalAnswer, 1);
        answerStream.complete();

        console.log(`✅ [callDoubaoSingleRoundSSE] 完整流程完成，总耗时: ${Date.now() - startTime}ms`);
      } else {
        // ✨ 6. 无工具调用，直接返回 AI 答案
        console.log('💬 [callDoubaoSingleRoundSSE] 无需工具调用，直接返回答案');
        console.log('🔍 [调试] content 长度:', content?.length || 0, ', 前100字符:', content?.substring(0, 100) || 'empty');

        // 使用之前提取的 content 变量（来自 aiResponse.data.content）
        const finalContent = content || '抱歉，我暂时无法回答这个问题。请稍后再试。';

        if (!finalContent || finalContent === '处理完成') {
          console.warn('⚠️ [callDoubaoSingleRoundSSE] AI 返回内容为空或为默认值，使用后备消息');
        }

        const processingTime = Date.now() - startTime;

        console.log(`✅ [callDoubaoSingleRoundSSE] AI 响应成功，耗时: ${processingTime}ms`);

        // 使用 AnswerStream 实现逐字流式输出
        const answerStream = new AnswerStream(res);
        
        // 发送开始答案事件
        sendSSE(res, 'answer_start', {
          message: '💬 开始生成回答...',
          totalLength: finalContent.length
        });

        // 逐字输出（模拟打字效果）
        await answerStream.writeWithTyping(finalContent, 1);
        
        // 完成答案输出
        answerStream.complete();

        console.log(`⏱️ [callDoubaoSingleRoundSSE] 流式输出完成，总耗时: ${Date.now() - startTime}ms`);
      }

    } catch (error: any) {
      console.error('❌ [callDoubaoSingleRoundSSE] AI调用失败:', error);
      sendSSE(res, 'error', {
        message: 'AI调用失败: ' + error.message,
        error: error.toString()
      });
    }
  }

  /**
   * 生成工具解说（narration）
   * 让 AI 分析工具返回的数据，生成人性化的解说
   */
  private async generateToolNarration(
    userQuery: string,
    toolName: string,
    toolResult: any
  ): Promise<string> {
    try {
      console.log(`🎨 [generateToolNarration] 为工具 ${toolName} 生成解说`);

      // 构建解说生成的提示词
      const narrationPrompt = `你是一个数据分析专家。用户查询了："${userQuery}"。

我刚刚调用了工具 "${toolName}" 并获得了以下数据：

${JSON.stringify(toolResult, null, 2)}

请用简洁、专业、人性化的语言解释这个查询结果，重点说明：
1. 查询到了什么数据
2. 数据的关键特征（如数量、分布、趋势等）
3. 对用户有价值的洞察

要求：
- 1-3句话，简洁明了
- 突出重点数据
- 不要重复用户的问题
- 直接说结果，不要说"根据查询结果"之类的开头`;

      // 🔧 修复：使用豆包 1.6 flash 模型（快速决策模型）
      const narrationResponse = await unifiedAIBridge.chat({
        model: 'doubao-seed-1-6-flash-250715',
        messages: [
          { role: 'user', content: narrationPrompt }
        ],
        temperature: 0.5,
        max_tokens: 200
      });

      const narration = narrationResponse.data?.content || narrationResponse.data?.message || '数据查询完成';
      console.log(`✅ [generateToolNarration] 解说生成完成: ${narration.substring(0, 50)}...`);
      
      return narration;
    } catch (error: any) {
      console.error('❌ [generateToolNarration] 解说生成失败:', error);
      return `工具 ${toolName} 执行完成，已获取数据。`;
    }
  }

  /**
   * 基于工具结果生成最终答案
   */
  private async generateFinalAnswerWithToolResults(
    request: UserRequest,
    systemPrompt: string,
    toolResults: any[]
  ): Promise<string> {
    try {
      console.log('🎯 [generateFinalAnswerWithToolResults] 生成基于工具结果的最终答案');

      // 构建包含工具结果的消息
      const toolResultsText = toolResults.map(tr => {
        const resultData = tr.result?.data || tr.result?.result || tr.result;
        return `工具 ${tr.toolName} 返回结果：\n${JSON.stringify(resultData, null, 2)}`;
      }).join('\n\n');

      const finalPrompt = `用户查询: ${request.content}

我已经调用了工具并获取了以下数据：

${toolResultsText}

请基于这些真实数据，用自然、专业的语言回答用户的问题。要求：
1. 直接回答，不要说"根据工具返回的数据"
2. 突出关键数据和洞察
3. 如果有数字统计，明确说明
4. 语言简洁、专业`;

      // 🔧 修复：使用豆包 1.6 flash 模型（快速决策模型）
      const finalResponse = await unifiedAIBridge.chat({
        model: 'doubao-seed-1-6-flash-250715',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: finalPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const finalAnswer = finalResponse.data?.content || finalResponse.data?.message || '已完成数据查询和分析。';
      console.log(`✅ [generateFinalAnswerWithToolResults] 最终答案生成完成`);
      
      return finalAnswer;
    } catch (error: any) {
      console.error('❌ [generateFinalAnswerWithToolResults] 最终答案生成失败:', error);
      // 降级：返回工具结果的简单总结
      return `已完成查询，共调用了 ${toolResults.length} 个工具。`;
    }
  }

  /**
   * 检测用户意图
   */
  private detectIntent(content: string): IntentType {
    // 页面操作类关键词
    const pageOperationKeywords = [
      '导航', '跳转', '打开', '去到', '访问', '截图', '点击', '填写', '提交', '扫描', '页面', '结构'
    ];

    // 数据可视化关键词（细分组件类型）
    const chartKeywords = ['图表', '柱状图', '折线图', '饼图', '散点图', '趋势图', '统计图', '图形'];
    const tableKeywords = ['表格', '列表', '数据表', '信息表', '显示学生', '显示教师', '显示活动'];
    const visualizationKeywords = [
      ...chartKeywords, ...tableKeywords, '统计', '可视化', '图像', '报告', '趋势', '生成', '制作', '创建图', '创建表',
      '参与度', '活动参与度', '学生信息', '年龄分布', '活动数量', '数据', '显示', '展示'
    ];

    // 任务管理关键词
    const taskManagementKeywords = [
      '任务', '清单', '计划', '分解', '管理', 'todo', '待办', '安排', '创建', '策划'
    ];

    // 专家咨询关键词
    const expertKeywords = [
      '咨询', '建议', '分析', '评估', '方案', '策略', '专家', '顾问', '指导', '建议'
    ];

    // 检查是否包含各类关键词
    const lowerContent = content.toLowerCase();

    if (pageOperationKeywords.some(keyword => lowerContent.includes(keyword))) {
      return IntentType.PAGE_OPERATION;
    }

    if (visualizationKeywords.some(keyword => lowerContent.includes(keyword))) {
      return IntentType.DATA_VISUALIZATION;
    }

    if (taskManagementKeywords.some(keyword => lowerContent.includes(keyword))) {
      return IntentType.TASK_MANAGEMENT;
    }

    if (expertKeywords.some(keyword => lowerContent.includes(keyword))) {
      return IntentType.EXPERT_CONSULTATION;
    }

    // 默认返回通用查询意图
    return IntentType.GENERAL_QUERY;
  }
}

// 导出服务实例
export default new UnifiedIntelligenceService();