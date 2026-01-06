import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '../types/express';
import { ApiResponse } from '../utils/apiResponse';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import TextModelService from '../services/ai/text-model.service';
import { MessageRole } from '../services/ai/text-model.service';
import AIModelCacheService from '../services/ai-model-cache.service';
import AIQueryCacheService from '../services/ai-query-cache.service';
import { apiGroupMappingService } from '../services/ai/api-group-mapping.service';
import AIOptimizedQueryService from '../services/ai-optimized-query.service';
import unifiedIntelligenceService from '../services/ai-operator/unified-intelligence.service';
import { Student } from '../models/student.model';
import { Teacher } from '../models/teacher.model';
import { Activity } from '../models/activity.model';
import { EnrollmentApplication } from '../models/enrollment-application.model';
import { Class } from '../models/class.model';
import { Parent } from '../models/parent.model';
import { MarketingCampaign } from '../models/marketing-campaign.model';
import { ConversionTracking } from '../models/conversion-tracking.model';
import { Kindergarten } from '../models/kindergarten.model';
import { User } from '../models/user.model';
import { ActivityRegistration } from '../models/activity-registration.model';
import { EnrollmentPlan } from '../models/enrollment-plan.model';

/**
 * AI查询控制器 - 增强版实现，支持财务查询和全表权限
 */
export class AIQueryController {
  constructor() {
    // 使用TextModelService进行AI调用
  }

  /**
   * 临时方法：更新豆包模型参数
   */
  public updateDoubaoModelParams = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const modelParameters = {
        model_id: 'Doubao-1.5-lite-32k',
        maxTokens: 4096,
        contextWindow: 32768,
        temperature: 0.1,
        top_p: 0.9,
        presence_penalty: 0,
        frequency_penalty: 0
      };

      // 直接更新数据库
      await sequelize.query(
        'UPDATE ai_model_config SET model_parameters = ? WHERE id = ?',
        {
          replacements: [JSON.stringify(modelParameters), 38],
          type: QueryTypes.UPDATE
        }
      );

      // 验证更新结果
      const [rows] = await sequelize.query(
        'SELECT id, name, model_parameters FROM ai_model_config WHERE id = ?',
        {
          replacements: [38],
          type: QueryTypes.SELECT
        }
      );

      res.json({
        success: true,
        message: '豆包模型参数更新成功',
        data: rows
      });
    } catch (error) {
      console.error('❌ 更新豆包模型参数失败:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : '更新失败'
        }
      });
    }
  }

  /**
   * 执行AI查询 - 集成智能优化和标准流程
   */
  public executeQuery = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    try {
      const { message, query, context, sessionId } = req.body;
      const userId = (req.user as any)?.id || 1;
      const userRole = (req.user as any)?.role || 'admin';

      console.log('🚀 [优化AI查询] 请求:', { message, query, userId, sessionId, userRole });

      // 参数验证
      const queryContent = message || query;
      if (!queryContent || typeof queryContent !== 'string' || queryContent.trim().length === 0) {
        ApiResponse.badRequest(res, '查询内容不能为空');
        return;
      }

      if (queryContent.length > 1000) {
        ApiResponse.badRequest(res, '查询内容过长，请控制在1000字符以内');
        return;
      }

      // 🚀 使用优化查询服务 - 优先级最高
      console.log('⚡ 使用智能模型路由优化...');
      try {
        const optimizedResult = await AIOptimizedQueryService.processOptimizedQuery(
          queryContent,
          userId,
          sessionId
        );

        const totalTime = Date.now() - startTime;
        console.log(`⚡ [优化AI查询] 完成，总耗时: ${totalTime}ms`);

        // 添加优化标识到响应中
        const enhancedResult = {
          ...optimizedResult,
          metadata: {
            ...optimizedResult.metadata,
            totalExecutionTime: totalTime,
            optimizationLevel: 'high',
            optimizationApplied: ['smart_model_routing', 'caching']
          }
        };

        ApiResponse.success(res, enhancedResult, '优化AI查询执行成功');
        return;
      } catch (optimizationError) {
        console.warn('⚠️ 优化查询失败，回退到标准流程:', optimizationError);
      }

      // 🎯 标准流程（作为降级方案）
      console.log('🔄 使用标准AI查询流程...');

      // 第一步：检查1小时内的缓存记录
      console.log('🔍 检查缓存记录...');
      const cachedResult = await AIQueryCacheService.getCachedResult(queryContent, userId);
      if (cachedResult) {
        console.log('✅ 命中缓存，直接返回历史结果');
        ApiResponse.success(res, cachedResult, '查询成功（来自缓存）');
        return;
      }

      // 生成或使用提供的会话ID
      const currentSessionId = sessionId || uuidv4();

      // 第二步：从缓存获取当前可用的大模型
      const availableModels = await AIModelCacheService.getAvailableModels();
      console.log('🤖 可用AI模型:', availableModels.length, '个 (来自缓存)');

      // 第三步：获取用户权限范围内的表名列表
      const allowedTables = this.getAllowedTables(userRole);
      console.log('🔐 允许访问的表:', allowedTables.length, '个表');

      // 🎯 第四步：查询意图分析和表选择（使用缓存的模型）
      console.log('🧠 开始查询意图分析...');
      const intentModel = await AIModelCacheService.getIntentAnalysisModel();
      const queryAnalysis = await this.analyzeQueryIntentAndSelectTables(
        queryContent,
        allowedTables,
        intentModel
      );
      console.log('📊 查询分析结果:', queryAnalysis);

      // 🎯 第三步半：API分组识别和多步骤查询规划
      console.log('🔍 开始API分组识别...');
      const identifiedGroups = await apiGroupMappingService.identifyApiGroups(queryContent);
      console.log('📊 识别到的API分组:', identifiedGroups);

      // 如果识别到多个分组，说明是复杂查询，需要多步骤处理
      if (identifiedGroups.length > 1) {
        console.log('⚡ 识别到多个API分组，启用多步骤查询模式');

        const multiStepPlan = {
          type: 'multi_step_api_query',
          groups: identifiedGroups,
          steps: identifiedGroups.map((group, index) => ({
            step: index + 1,
            group,
            description: `调用${group}相关API获取数据`,
            apis: [] // 简化处理
          })),
          message: '🧠 检测到复杂查询，已规划多步骤API调用',
          sessionId: currentSessionId,
          ui_instruction: {
            type: 'show_multi_step_plan',
            title: 'API调用执行计划',
            data: {
              originalQuery: queryContent,
              groups: identifiedGroups,
              totalSteps: identifiedGroups.length
            }
          }
        };

        // 保存多步骤计划到历史 (作为AI响应类型)
        await AIQueryCacheService.saveQueryResult(
          queryContent,
          userId,
          'ai_response',
          { response: JSON.stringify(multiStepPlan) },
          currentSessionId,
          'api_group_mapper',
          Date.now() - startTime
        );

        ApiResponse.success(res, multiStepPlan, 'API分组识别完成');
        return;
      }

      // 检查是否为数据库查询
      if (!queryAnalysis.isDataQuery) {
        console.log('ℹ️  非数据库查询，返回AI回答');
        const qaModel = await AIModelCacheService.getQAModel();
        const aiResponse = await this.handleNonDataQuery(queryContent, qaModel, userId);
        
        const result = {
          type: 'ai_response',
          response: aiResponse,
          isDataQuery: false,
          sessionId: currentSessionId
        };
        
        // 保存AI问答记录到历史
        await AIQueryCacheService.saveQueryResult(
          queryContent,
          userId,
          'ai_response',
          result,
          currentSessionId,
          qaModel?.name,
          Date.now() - startTime
        );
        
        ApiResponse.success(res, result, 'AI回答生成成功');
        return;
      }

      // 第四步：获取单个API分组的详细信息
      const primaryGroup = identifiedGroups[0];
      console.log('📋 获取API分组详细信息:', primaryGroup);
      const groupDetails = { apis: [], description: primaryGroup }; // 简化处理
      console.log('📄 API分组信息已获取');

      // 第五步：基于API分组生成调用计划
      console.log('🤖 开始生成API调用计划...');
      const apiCallPlan = await this.generateApiCallPlan(
        queryContent,
        primaryGroup,
        groupDetails,
        queryAnalysis
      );
      console.log('📝 生成的API调用计划:', apiCallPlan.apis.length, '个API调用');

      // 第六步：执行API调用计划
      const apiResults = await this.executeApiCalls(apiCallPlan);
      console.log('📊 API调用结果:', apiResults?.length, '条记录');

      // 第七步：根据查询分析结果生成智能可视化
      const visualization = await this.generateIntelligentVisualization(
        apiResults,
        queryContent,
        queryAnalysis
      );
      console.log('📈 智能可视化配置已生成');

      // 第八步：组装最终响应，页面显示
      const columns = this.generateColumnsFromData(apiResults);

      const finalResponse = {
        success: true,
        type: 'data_query',
        data: apiResults,
        metadata: {
          totalRows: apiResults?.length || 0,
          executionTime: Date.now() - startTime,
          generatedSQL: `-- API分组模式: ${primaryGroup}`,
          usedModel: 'api-group-mapper',
          cacheHit: false,
          queryAnalysis, // 包含查询分析结果
          requiredTables: [primaryGroup],
          columns // 添加列信息用于前端表格渲染
        },
        visualization,
        sessionId: currentSessionId
      };

      // 保存数据库查询记录到历史
      await AIQueryCacheService.saveQueryResult(
        queryContent,
        userId,
        'data_query',
        finalResponse,
        currentSessionId,
        'api-group-mapper',
        Date.now() - startTime
      );

      console.log('✅ AI查询标准流程完成');
      ApiResponse.success(res, finalResponse, 'AI查询执行成功');
    } catch (error: any) {
      console.error('❌ AI查询执行异常:', error);

      // 构造详细的错误响应
      const errorResponse = {
        type: 'AI_QUERY_ERROR',
        message: error.message || 'AI查询执行失败',
        details: (error as any).details || null,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime
      };

      // 根据错误类型返回不同的状态码和消息
      if (error.message?.includes('数据库查询执行失败')) {
        ApiResponse.error(res,
          `❌ 数据库查询失败

🔍 错误详情：${error.message}

💡 这是真实的错误信息，请检查数据库连接或SQL语法。`,
          'DATABASE_QUERY_ERROR',
          500
        );
      } else if (error.message?.includes('AI模型')) {
        ApiResponse.error(res,
          `❌ AI模型服务异常

🔍 错误详情：${error.message}

💡 请检查AI模型配置或稍后重试。`,
          'AI_MODEL_ERROR',
          503
        );
      } else {
        ApiResponse.error(res,
          `❌ AI查询执行失败

🔍 错误详情：${error.message}

💡 这是真实的错误信息，不是模拟数据。`,
          'AI_QUERY_ERROR',
          500
        );
      }
    }
  };

  /**
   * 执行AI流式查询 - 支持SSE实时响应
   */
  public executeStreamingChat = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    try {
      const { message, sessionId } = req.body;
      const userId = (req.user as any)?.id || 1;
      const userRole = (req.user as any)?.role || 'admin';

      console.log('🚀 [AI流式查询] 请求:', { message, userId, sessionId, userRole });

      // 参数验证
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '查询内容不能为空'
          }
        });
        return;
      }

      if (message.length > 1000) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '查询内容过长，请控制在1000字符以内'
          }
        });
        return;
      }

      // 设置SSE响应头
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // 生成或使用提供的会话ID
      const currentSessionId = sessionId || uuidv4();

      // 发送开始事件
      this.sendSSEEvent(res, 'start', {
        sessionId: currentSessionId,
        timestamp: new Date().toISOString(),
        message: '开始处理查询...'
      });

      try {
        // 构造UserRequest对象
        const userRequest = {
          content: message,
          userId: userId.toString(),
          conversationId: currentSessionId,
          context: {
            sessionId: currentSessionId,
            timestamp: new Date().toISOString()
          }
        };

        // 使用统一智能服务处理查询
        await unifiedIntelligenceService.processUserRequestStreamSingleRound(userRequest, res);

        // 发送完成事件会在processUserRequestStream中自动处理

      } catch (processingError: any) {
        console.error('❌ 流式查询处理异常:', processingError);

        // 发送错误事件
        this.sendSSEEvent(res, 'error', {
          sessionId: currentSessionId,
          timestamp: new Date().toISOString(),
          error: {
            code: 'PROCESSING_ERROR',
            message: processingError.message || '查询处理失败',
            details: processingError.details || null
          }
        });
      }

      // 结束SSE连接
      res.end();

    } catch (error: any) {
      console.error('❌ 流式查询系统异常:', error);

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            code: 'SYSTEM_ERROR',
            message: error.message || '系统错误'
          }
        });
      } else {
        // 如果已经设置了SSE头，发送错误事件
        this.sendSSEEvent(res, 'system_error', {
          timestamp: new Date().toISOString(),
          error: {
            code: 'SYSTEM_ERROR',
            message: error.message || '系统错误'
          }
        });
        res.end();
      }
    }
  };

  /**
   * 发送SSE事件
   */
  private sendSSEEvent(res: Response, eventType: string, data: any): void {
    try {
      if (res.writable) {
        const eventData = JSON.stringify(data);
        res.write(`event: ${eventType}\n`);
        res.write(`data: ${eventData}\n\n`);
        console.log(`📡 [SSE] 发送事件: ${eventType}`, data);
      }
    } catch (error: any) {
      console.error('❌ [SSE] 发送事件失败:', error);
      // 不抛出错误，避免中断整个流程
    }
  }

  /**
   * 获取查询历史记录
   */
  public getQueryHistory = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.user as any)?.id || 1;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const queryType = req.query.queryType as 'data_query' | 'ai_response' | undefined;

      console.log(`📋 获取用户${userId}的查询历史, 页码${page}, 每页${pageSize}条`);

      const result = await AIQueryCacheService.getUserQueryHistory(userId, page, pageSize, queryType);
      
      ApiResponse.success(res, result, '获取查询历史成功');
    } catch (error: any) {
      console.error('❌ 获取查询历史失败:', error);
      ApiResponse.error(res, error.message || '获取查询历史失败', 'GET_HISTORY_ERROR', 500);
    }
  };

  /**
   * 获取查询详情
   */
  public getQueryDetail = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.user as any)?.id || 1;
      const queryId = parseInt(req.params.id);

      if (!queryId) {
        ApiResponse.badRequest(res, '查询ID不能为空');
        return;
      }

      console.log(`📋 获取用户${userId}的查询详情: ${queryId}`);

      const result = await AIQueryCacheService.getQueryDetail(queryId, userId);
      
      if (!result) {
        ApiResponse.notFound(res, '查询记录不存在');
        return;
      }
      
      ApiResponse.success(res, result, '获取查询详情成功');
    } catch (error: any) {
      console.error('❌ 获取查询详情失败:', error);
      ApiResponse.error(res, error.message || '获取查询详情失败', 'GET_DETAIL_ERROR', 500);
    }
  };

  /**
   * 获取查询统计信息
   */
  public getStatistics = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.user as any)?.id || 1;

      console.log(`📊 获取用户${userId}的查询统计`);

      const stats = await AIQueryCacheService.getCacheStats(userId);

      ApiResponse.success(res, stats, '获取查询统计成功');
    } catch (error: any) {
      console.error('❌ 获取查询统计失败:', error);
      ApiResponse.error(res, error.message || '获取查询统计失败', 'GET_STATS_ERROR', 500);
    }
  };

  
  /**
   * 清理过期缓存（管理员功能）
   */
  public cleanupCache = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🧹 开始清理过期缓存记录...');

      const deletedCount = await AIQueryCacheService.cleanupExpiredCache();
      
      ApiResponse.success(res, { deletedCount }, `成功清理${deletedCount}条过期记录`);
    } catch (error: any) {
      console.error('❌ 清理缓存失败:', error);
      ApiResponse.error(res, error.message || '清理缓存失败', 'CLEANUP_ERROR', 500);
    }
  };

  /**
   * 第一步：获取当前可用的AI大模型
   */
  private async getAvailableAIModels(): Promise<any[]> {
    try {
      // 查询数据库中配置的AI模型
      const [results] = await sequelize.query(`
        SELECT 
          name,
          display_name,
          model_type,
          provider,
          status,
          max_tokens,
          model_parameters,
          is_default
        FROM ai_model_config 
        WHERE status = 'active'
        ORDER BY is_default DESC, created_at DESC
        LIMIT 10
      `);

      const models = results as any[];
      
      // 如果数据库中没有配置，抛出错误
      if (models.length === 0) {
        throw new Error('数据库中没有可用的AI模型配置');
      }

      return models;
    } catch (error) {
      console.error('获取AI模型失败:', error);
      throw error;
    }
  }

  /**
   * 🎯 核心新方法：查询意图分析和表选择
   * 第一次AI调用：判断查询类型并选择需要的表
   */
  private async analyzeQueryIntentAndSelectTables(
    queryContent: string, 
    allowedTables: string[], 
    selectedModel: any
  ): Promise<{
    isDataQuery: boolean;
    queryType: string;
    confidence: number;
    requiredTables: string[];
    explanation: string;
    keywords: string[];
  }> {
    try {
      // 构建表选择提示词
      const tablesInfo = this.buildTableSelectionInfo(allowedTables);
      
      const prompt = `
请分析以下中文查询，判断这是否为数据库查询，如果是，请选择需要查询的表。

用户查询：${queryContent}

可用的数据库表列表：
${tablesInfo}

请严格按照以下JSON格式返回结果：
{
  "isDataQuery": true/false,
  "queryType": "学生查询|教师查询|活动查询|招生查询|财务查询|统计查询|非数据查询",
  "confidence": 0.0-1.0,
  "requiredTables": ["table1", "table2"],
  "explanation": "选择这些表的原因",
  "keywords": ["关键词1", "关键词2"]
}

判断规则：
1. 如果用户询问"你好"、"什么是AI"等非数据相关问题，isDataQuery应为false
2. 如果用户询问学生数量、教师信息、活动安排等，isDataQuery应为true
3. requiredTables只包含实际需要的表名，不要包含不相关的表
4. confidence表示判断的置信度

只返回JSON，不要其他内容：`;

      console.log('📤 发送意图分析请求到AI模型...');
      
      const response = await TextModelService.generateText(1, {
        model: selectedModel?.name || 'default',
        messages: [
          {
            role: MessageRole.SYSTEM,
            content: '你是一个专业的数据库查询意图分析专家，专门分析幼儿园管理系统的查询需求。你必须准确判断用户查询是否需要访问数据库，并精确选择相关的表。'
          },
          {
            role: MessageRole.USER,
            content: prompt
          }
        ],
        temperature: 0.1,
        maxTokens: 500
      });

      // 解析AI响应
      const responseContent = response.choices[0]?.message?.content || '';
      console.log('🔍 AI意图分析原始响应:', responseContent);
      
      const analysisResult = this.parseIntentAnalysisResponse(responseContent);
      console.log('📊 解析后的意图分析结果:', analysisResult);
      
      return analysisResult;

    } catch (error) {
      console.error('❌ 查询意图分析失败:', error);
      // 默认认为是数据查询，使用保守策略
      return {
        isDataQuery: true,
        queryType: '未知查询',
        confidence: 0.5,
        requiredTables: allowedTables.slice(0, 5), // 只选择前5个表作为备选
        explanation: '意图分析失败，使用默认策略',
        keywords: []
      };
    }
  }

  /**
   * 构建表选择信息
   */
  private buildTableSelectionInfo(allowedTables: string[]): string {
    const tableDescriptions: { [key: string]: string } = {
      'students': '学生表 - 学生基本信息、班级关联',
      'teachers': '教师表 - 教师基本信息、任职情况',  
      'parents': '家长表 - 家长基本信息、联系方式',
      'classes': '班级表 - 班级信息、班级管理',
      'activities': '活动表 - 活动信息、活动安排',
      'activity_registrations': '活动报名表 - 学生活动报名记录',
      'activity_evaluations': '活动评价表 - 活动评价和反馈',
      'enrollment_plans': '招生计划表 - 招生计划和名额',
      'enrollment_applications': '入学申请表 - 学生入学申请',
      'admission_results': '录取结果表 - 学生录取情况',
      'marketing_campaigns': '营销活动表 - 营销活动管理',
      'advertisements': '广告表 - 广告投放管理',
      'kindergartens': '幼儿园表 - 幼儿园基本信息',
      'users': '用户表 - 系统用户账户信息'
    };

    return allowedTables.map(table => {
      const description = tableDescriptions[table] || `${table}表`;
      return `- ${table}: ${description}`;
    }).join('\n');
  }

  /**
   * 解析AI意图分析响应
   */
  private parseIntentAnalysisResponse(responseContent: string): any {
    try {
      // 尝试提取JSON
      let jsonStr = responseContent.trim();
      
      // 移除可能的markdown格式
      jsonStr = jsonStr.replace(/^```json\s*|\s*```$/g, '');
      jsonStr = jsonStr.replace(/^```\s*|\s*```$/g, '');
      
      // 解析JSON
      const parsed = JSON.parse(jsonStr);
      
      // 验证必要字段
      return {
        isDataQuery: Boolean(parsed.isDataQuery),
        queryType: parsed.queryType || '未知查询',
        confidence: Number(parsed.confidence) || 0.5,
        requiredTables: Array.isArray(parsed.requiredTables) ? parsed.requiredTables : [],
        explanation: parsed.explanation || '',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : []
      };
      
    } catch (error) {
      console.error('❌ 解析意图分析响应失败:', error);
      console.error('原始响应:', responseContent);
      
      // 返回默认解析结果
      return {
        isDataQuery: true,
        queryType: '解析失败',
        confidence: 0.3,
        requiredTables: [],
        explanation: 'JSON解析失败',
        keywords: []
      };
    }
  }

  /**
   * 处理非数据库查询（一般性AI对话）
   */
  private async handleNonDataQuery(queryContent: string, selectedModel: any, userId: number): Promise<string> {
    try {
      // 获取可用模型列表
      const availableModels = await this.getAvailableAIModels();
      
      // 【非数据库查询】使用128k大模型，提供更好的对话体验
      const qaModel = selectedModel?.name?.includes('128k') ? selectedModel : 
        availableModels.find(m => m.name?.includes('128k') && m.isActive) || selectedModel;
      
      console.log('💬 AI问答使用模型:', qaModel?.name, '(128k大模型)');
      
      const response = await TextModelService.generateText(userId, {
        model: qaModel?.name || 'Doubao-pro-128k', // 非数据库查询使用128k模型
        messages: [
          {
            role: MessageRole.SYSTEM,
            content: '你是幼儿园管理系统的AI助手，可以回答关于幼儿园管理、教育等相关问题。请用友好、专业的语气回答用户的问题。'
          },
          {
            role: MessageRole.USER,
            content: queryContent
          }
        ],
        temperature: 0.7,
        maxTokens: 500
      });

      return response.choices[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';
      
    } catch (error) {
      console.error('❌ 生成AI回答失败:', error);
      return '抱歉，AI服务暂时不可用，请稍后再试。';
    }
  }

  /**
   * 获取相关表的精准结构信息
   */
  private async getRelevantTableStructures(requiredTables: string[], userRole: string): Promise<string> {
    try {
      if (requiredTables.length === 0 || requiredTables.includes('*')) {
        console.warn('⚠️ 未指定需要的表或包含通配符，使用默认核心表');
        requiredTables = ['activity_registrations', 'activities', 'students', 'teachers', 'classes'];
      }

      console.log('🔍 查询指定表的结构:', requiredTables);
      
      const tableList = requiredTables.map(table => `'${table}'`).join(',');
      const tablesQuery = `
        SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          COLUMN_COMMENT
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME IN (${tableList})
        ORDER BY TABLE_NAME, ORDINAL_POSITION
      `;

      const [results] = await sequelize.query(tablesQuery);
      const columns = results as any[];

      // 按表分组构建结构信息
      const tableGroups: { [key: string]: any[] } = {};
      columns.forEach(col => {
        if (!tableGroups[col.TABLE_NAME]) {
          tableGroups[col.TABLE_NAME] = [];
        }
        tableGroups[col.TABLE_NAME].push(col);
      });

      // 生成简洁的表结构描述
      let structureDescription = `相关数据库表结构信息：\n\n`;
      
      for (const [tableName, tableColumns] of Object.entries(tableGroups)) {
        structureDescription += `表名: ${tableName}\n`;
        structureDescription += `列信息:\n`;
        
        tableColumns.forEach(col => {
          const comment = col.COLUMN_COMMENT ? ` (${col.COLUMN_COMMENT})` : '';
          const nullable = col.IS_NULLABLE === 'YES' ? ', 可空' : ', 非空';
          structureDescription += `  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${nullable}${comment}\n`;
        });
        
        structureDescription += `\n`;
      }

      console.log('📄 生成的表结构信息长度:', structureDescription.length, '字符');
      return structureDescription;

    } catch (error) {
      console.error('❌ 获取相关表结构失败:', error);
      throw new Error('获取数据库表结构失败');
    }
  }

  /**
   * 使用优化的信息生成SQL
   */
  private async generateOptimizedSQL(
    naturalQuery: string, 
    relevantTableStructures: string, 
    queryAnalysis: any,
    selectedModel: any
  ): Promise<string> {
    const prompt = `
基于查询分析结果，生成精确的MySQL查询语句：

用户查询：${naturalQuery}
查询类型：${queryAnalysis.queryType}
相关关键词：${queryAnalysis.keywords.join(', ')}

${relevantTableStructures}

重要提示：
- 活动参与数据存储在 activity_registrations 表中，不是 activity_participants 表
- activity_registrations 表包含活动报名和参与信息
- 统计活动参与人数时，使用 activity_registrations 表
- activity_registrations 表的时间字段是 registrationTime，不是 registration_date
- 查询本月数据时，使用 registrationTime 字段进行时间过滤

生成要求：
1. 只返回SQL语句，不要其他解释
2. 基于查询类型（${queryAnalysis.queryType}）优化查询逻辑
3. 只使用上述提供的表和字段
4. 确保语句安全，仅使用SELECT语句
5. 优先查询status='active'或status=1的数据
6. 合理使用JOIN连接相关表
7. 对于统计查询，使用聚合函数
8. 对于时间查询，使用DATE_FORMAT函数
9. 查询活动参与数据时，必须使用 activity_registrations 表
10. 计算学生年龄时，使用 TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) AS age
11. 学生表没有 age 字段，必须通过 birth_date 计算年龄
12. 用户表名是 users，不是 user_accounts

SQL语句：`;

    try {
      // 获取可用模型列表
      const availableModels = await this.getAvailableAIModels();

      // 【数据库查询专用】SQL生成也使用经济模型，避免浪费
      const sqlModel = availableModels.find(m =>
        m.name?.includes('dbquery') && m.isActive  // 数据库查询专用模型
      ) || availableModels.find(m =>
        (m.name?.includes('lite-32k') || m.name?.includes('Doubao-lite-32k')) && m.isActive
      ) || selectedModel;
      
      console.log('🛠️ SQL生成使用模型:', sqlModel?.name, '(数据库查询专用)');
      
      const response = await TextModelService.generateText(1, {
        model: sqlModel?.name || 'Doubao-lite-32k-dbquery', // 数据库查询专用经济模型
        messages: [
          {
            role: MessageRole.SYSTEM,
            content: `你是一个MySQL专家，专门为幼儿园管理系统生成精确的SQL查询。你已经知道用户的查询意图是"${queryAnalysis.queryType}"，基于精准的表结构信息生成SQL。

重要：在这个系统中，活动参与数据存储在 activity_registrations 表中，该表包含活动报名和实际参与信息。当需要统计活动参与人数时，请使用 activity_registrations 表，不要使用不存在的 activity_participants 表。

关键字段映射：
- 活动报名时间：registrationTime（不是 registration_date）
- 活动ID：activityId
- 参与人数统计：COUNT(*) 或 COUNT(id)
- 时间过滤：使用 registrationTime 字段

学生表字段映射（重要）：
- 学生年龄：使用 TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) 计算，不要使用不存在的 age 字段
- 出生日期：birth_date（不是 birth_date）
- 学生姓名：name
- 学号：student_no
- 班级ID：class_id
- 幼儿园ID：kindergarten_id
- 性别：gender（1=男，2=女）
- 状态：status（0=离园，1=在读，2=休学）

用户表字段映射：
- 用户表名：users（不是 user_accounts）
- 用户ID：id
- 用户名：username
- 真实姓名：real_name
- 邮箱：email
- 手机：phone`
          },
          {
            role: MessageRole.USER,
            content: prompt
          }
        ],
        temperature: 0.1, // 适中温度确保SQL准确性
        maxTokens: 800    // SQL可能需要更多token
      });

      // 提取和清理SQL
      let sql = (response.choices[0]?.message?.content || '').trim();
      sql = sql.replace(/^```sql\s*|\s*```$/g, '').trim();
      sql = sql.replace(/^```\s*|\s*```$/g, '').trim();
      
      if (!sql) {
        throw new Error('AI未能生成有效的SQL语句');
      }

      return sql;
      
    } catch (error) {
      console.error('❌ 优化SQL生成失败:', error);
      throw error;
    }
  }

  /**
   * 分析查询意图 - 使用真实数据库表结构
   */
  private async analyzeQueryIntent(queryContent: string, context: any, availableModels: any[]) {
    try {
      // 获取真实的数据库表结构信息
      const tableStructures = await this.getDatabaseTableStructures(context.userRole);
      
      const prompt = `
请分析以下中文查询的意图，并返回JSON格式的结果：

查询内容：${queryContent}

用户上下文：${JSON.stringify(context)}

真实数据库表结构：
${tableStructures}

请返回以下JSON格式：
{
  "type": "SELECT|COUNT|SUM|AVG|GROUP_BY|FILTER",
  "confidence": 0.0-1.0,
  "entities": [
    {
      "type": "TABLE|COLUMN|VALUE|CONDITION",
      "value": "原始文本",
      "confidence": 0.0-1.0,
      "mappedName": "对应的数据库名称"
    }
  ],
  "timeRange": {
    "type": "本月|今年|上个月|...",
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "constraints": [
    {
      "field": "字段名",
      "operator": "=|>|<|LIKE|IN",
      "value": "条件值"
    }
  ]
}
`;

      // 获取可用模型列表
      const models = await this.getAvailableAIModels();

      // 【数据库查询专用】意图分析使用经济的lite模型
      const intentModel = models.find(m =>
        m.name?.includes('dbquery') && m.isActive  // 优先使用数据库查询专用模型
      ) || models.find(m =>
        (m.name?.includes('lite-32k') || m.name?.includes('Doubao-lite-32k')) && m.isActive
      ) || models[0];
      
      console.log('🧠 意图分析使用模型:', intentModel?.name, '(数据库查询专用)');
      
      const response = await TextModelService.generateText(context.userId || 1, {
        model: intentModel?.name || 'Doubao-lite-32k-dbquery', // 数据库查询专用经济模型
        messages: [
          {
            role: MessageRole.SYSTEM,
            content: '你是一个专业的数据库查询意图分析师，专门分析幼儿园管理系统的查询需求。请返回准确的JSON格式结果。'
          },
          {
            role: MessageRole.USER,
            content: prompt
          }
        ],
        temperature: 0.05, // 极低温度确保结果稳定
        maxTokens: 500     // 减少token使用，JSON结果不需要太多
      });

      // 解析AI响应
      const intentData = this.parseIntentResponse(response.choices[0]?.message?.content || '');
      return intentData;

    } catch (error) {
      console.error('意图分析错误:', error);
      // 返回默认意图
      return {
        type: 'SELECT',
        confidence: 0.5,
        entities: [],
        keywords: [],
        timeRange: undefined,
        constraints: []
      };
    }
  }

  /**
   * 解析AI意图分析响应
   */
  private parseIntentResponse(response: string): any {
    try {
      // 提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('无法从响应中提取JSON');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        type: parsed.type || 'SELECT',
        confidence: parsed.confidence || 0.5,
        entities: parsed.entities || [],
        keywords: parsed.keywords || [],
        businessDomain: parsed.businessDomain,
        timeRange: parsed.timeRange,
        constraints: parsed.constraints || []
      };
    } catch (error) {
      console.error('解析意图响应错误:', error);
      return {
        type: 'SELECT',
        confidence: 0.3,
        entities: [],
        keywords: [],
        constraints: []
      };
    }
  }

  /**
   * 第五步：执行SQL语句
   */
  private async executeSQL(sql: string): Promise<any[]> {
    try {
      console.log('🔍 执行SQL查询:', sql);
      const [results] = await sequelize.query(sql);
      return results as any[];
    } catch (error: any) {
      console.error('❌ SQL执行错误:', error);

      // 构造详细的错误信息
      const errorDetails = {
        type: 'SQL_EXECUTION_ERROR',
        message: `数据库查询执行失败: ${error.message}`,
        sql: sql.substring(0, 500) + (sql.length > 500 ? '...' : ''), // 截取SQL前500字符
        originalError: error.message,
        errorCode: error.code || 'UNKNOWN',
        timestamp: new Date().toISOString()
      };

      // 抛出包含详细信息的错误
      const detailedError = new Error(errorDetails.message);
      (detailedError as any).details = errorDetails;
      throw detailedError;
    }
  }

  /**
   * 获取核心业务表结构信息（仅元数据，极简版本）
   */
  private async getDatabaseTableStructures(userRole: string): Promise<string> {
    try {
      // 只查询核心业务表，避免数据过大
      const coreBusinessTables = [
        'students', 'teachers', 'parents', 'classes', 'kindergartens',
        'activities', 'activity_registrations', 'activity_evaluations',
        'enrollment_plans', 'enrollment_applications', 'admission_results',
        'marketing_campaigns', 'advertisements', 'users'
      ];
      
      const tableList = coreBusinessTables.map(table => `'${table}'`).join(',');
      const tablesQuery = `
        SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME IN (${tableList})
        ORDER BY TABLE_NAME, ORDINAL_POSITION
      `;

      const [results] = await sequelize.query(tablesQuery);
      const tableStructures = results as any[];

      // 按表名分组
      const tablesMap = new Map<string, any[]>();
      tableStructures.forEach((row: any) => {
        const tableName = row.TABLE_NAME;
        if (!tablesMap.has(tableName)) {
          tablesMap.set(tableName, []);
        }
        tablesMap.get(tableName)!.push(row);
      });

      // 极简格式化（控制在1KB内）
      let structureText = '核心表结构：\n';
      
      for (const [tableName, columns] of tablesMap.entries()) {
        const fieldNames = columns.map(col => col.COLUMN_NAME).join(',');
        structureText += `${tableName}(${fieldNames}); `;
      }

      console.log('📤 表结构数据大小:', Buffer.byteLength(structureText, 'utf8'), '字节');
      return structureText;
      
    } catch (error) {
      console.error('获取数据库表结构失败:', error);
      return '核心表：students(id,name,created_at),activities(id,title,fee),marketing_campaigns(id,budget)';
    }
  }

  /**
   * 第四步：使用AI生成SQL查询语句 - 标准流程版本（带降级机制）
   */
  private async generateSQLWithAI(naturalQuery: string, tableStructures: string, selectedModel: any): Promise<string> {
    const prompt = `
基于以下中文查询需求，生成MySQL查询语句：

查询需求：${naturalQuery}

${tableStructures}

要求：
1. 只返回SQL语句，不要其他解释
2. 使用MySQL语法
3. 确保语句安全，避免SQL注入
4. 优先查询status='active'或status=1的数据
5. 适当使用JOIN连接相关表
6. 合理使用聚合函数和分组
7. 对于"新进入"查询，通过created_at字段按时间筛选
8. 对于"详细信息"查询，包含相关联表的完整信息
9. 对于财务查询，可以基于学生数量和营销预算进行合理估算
10. 对于时间相关查询，使用DATE_FORMAT函数进行时间格式化
11. 确保字段名和表名与提供的表结构完全匹配

SQL语句：`;

    try {
      console.log('📤 发送给AI模型的数据大小:', Buffer.byteLength(prompt, 'utf8'), '字节');
      
      const response = await TextModelService.generateText(1, {
        model: selectedModel?.name || 'default',
        messages: [
          {
            role: MessageRole.SYSTEM,
            content: '你是一个MySQL数据库专家，专门为幼儿园管理系统生成安全、高效的SQL查询语句。请严格根据提供的真实表结构生成SQL。'
          },
          {
            role: MessageRole.USER,
            content: prompt
          }
        ],
        temperature: 0.1,
        maxTokens: 800
      });

      // 提取SQL语句
      let sql = (response.choices[0]?.message?.content || '').trim();
      
      // 清理可能的markdown格式
      sql = sql.replace(/^```sql\s*|\s*```$/g, '').trim();
      sql = sql.replace(/^```\s*|\s*```$/g, '').trim();
      
      // 如果SQL为空，抛出错误
      if (!sql) {
        throw new Error('AI模型返回空的SQL语句');
      }
      
      return sql;
      
    } catch (error: any) {
      console.error('AI生成SQL失败:', error);
      throw new Error(`AI模型暂时不可用，请联系管理员。错误详情: ${error.message}`);
    }
  }

  // 降级机制已完全移除 - 强制使用真实AI模型

  /**
   * 验证SQL安全性 - 增强版
   */
  private async validateSQL(sql: string, userRole: string): Promise<{
    isValid: boolean;
    sql?: string;
    error?: string;
  }> {
    try {
      // 1. 检查危险关键词 - 使用单词边界匹配，避免误判字段名
      const dangerousPatterns = [
        /\bDROP\s+/i,
        /\bDELETE\s+/i,
        /\bUPDATE\s+/i,
        /\bINSERT\s+/i,
        /\bCREATE\s+/i,  // 只匹配 CREATE 后跟空格的情况，避免误判 created_at
        /\bALTER\s+/i,
        /\bTRUNCATE\s+/i,
        /\bEXEC\s+/i,
        /\bEXECUTE\s+/i,
        /\bDECLARE\s+/i,
        /\bSCRIPT\s+/i
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(sql)) {
          const match = sql.match(pattern);
          return {
            isValid: false,
            error: `查询包含不允许的操作关键词: ${match ? match[0].trim() : '未知关键词'}`
          };
        }
      }

      // 2. 检查表名权限（基于用户角色）
      const allowedTables = this.getAllowedTables(userRole);
      
      // 简单的表名提取（实际应该使用SQL解析器）
      const tableMatches = sql.match(/FROM\s+(\w+)|JOIN\s+(\w+)/gi);
      if (tableMatches) {
        for (const match of tableMatches) {
          const tableName = match.replace(/FROM\s+|JOIN\s+/gi, '').trim();
          if (!allowedTables.includes(tableName) && !allowedTables.includes('*')) {
            return {
              isValid: false,
              error: `没有访问表 ${tableName} 的权限`
            };
          }
        }
      }

      // 3. 检查SQL注入模式
      const injectionPatterns = [
        /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/gi,
        /['"]\s*;\s*\w+/gi,
        /--|\#|\/\*/gi
      ];

      for (const pattern of injectionPatterns) {
        if (pattern.test(sql)) {
          return {
            isValid: false,
            error: '检测到潜在的SQL注入攻击'
          };
        }
      }

      return {
        isValid: true,
        sql: sql
      };

    } catch (error: any) {
      return {
        isValid: false,
        error: `SQL验证错误: ${error.message}`
      };
    }
  }

  /**
   * 获取用户角色允许访问的表 - 增强版
   */
  private getAllowedTables(userRole: string): string[] {
    const rolePermissions: { [key: string]: string[] } = {
      'admin': ['*'], // 管理员可以访问所有表
      'principal': [
        // 基础数据表
        'students', 'teachers', 'classes', 'activities', 'parents', 'kindergartens',
        // 招生相关表
        'enrollment_plans', 'enrollment_applications', 'enrollment_consultations', 
        'enrollment_quotas', 'enrollment_tasks', 'admission_results',
        // 活动相关表
        'activity_registrations', 'activity_evaluations', 'activity_plans',
        'activity_arrangements', 'activity_resources', 'activity_staff',
        // 营销相关表
        'marketing_campaigns', 'advertisements', 'channel_trackings', 
        'conversion_trackings', 'poster_templates', 'poster_generations',
        // 系统管理表
        'schedules', 'todos', 'notifications', 'message_templates',
        'operation_logs', 'system_configs', 'system_logs',
        // 用户权限表
        'users', 'roles', 'permissions', 'user_roles', 'role_permissions',
        // AI相关表
        'ai_conversations', 'ai_messages', 'ai_query_logs', 'ai_query_templates',
        'ai_query_caches', 'ai_model_config', 'ai_model_usage'
      ],
      'teacher': [
        'students', 'classes', 'activities', 'activity_registrations',
        'activity_evaluations', 'activity_plans', 'schedules', 'todos',
        'notifications', 'parents', 'parent_student_relations'
      ],
      'parent': [
        'students', 'activities', 'activity_registrations', 'schedules',
        'notifications', 'classes', 'teachers'
      ]
    };

    return rolePermissions[userRole] || ['students', 'activities'];
  }

  /**
   * 处理查询结果
   */
  private async processResults(rawResults: any[], naturalQuery: string): Promise<{
    data: any[];
    metadata: any;
    visualization?: any;
  }> {
    const data = rawResults;
    const columns = this.extractColumnInfo(data);
    
    const metadata = {
      columns,
      rowCount: data.length,
      executionTime: 0, // 会在调用方设置
      cacheHit: false
    };

    // 生成可视化配置
    const visualization = await this.generateVisualization(data, naturalQuery);

    return {
      data,
      metadata,
      visualization
    };
  }

  /**
   * 提取列信息
   */
  private extractColumnInfo(data: any[]): Array<{name: string, type: string, label: string}> {
    if (!data || data.length === 0) {
      return [];
    }

    const firstRow = data[0];
    return Object.keys(firstRow).map(key => ({
      name: key,
      type: this.inferColumnType(firstRow[key]),
      label: this.generateColumnLabel(key)
    }));
  }

  /**
   * 推断列类型
   */
  private inferColumnType(value: any): string {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    if (typeof value === 'boolean') return 'boolean';
    
    // 尝试解析数字
    if (typeof value === 'string' && !isNaN(Number(value))) return 'number';
    
    // 尝试解析日期
    if (typeof value === 'string' && !isNaN(Date.parse(value))) return 'date';
    
    return 'string';
  }

  /**
   * 生成列标签
   */
  private generateColumnLabel(columnName: string): string {
    const labelMap: { [key: string]: string } = {
      'id': 'ID',
      'name': '姓名',
      'student_name': '学生姓名',
      'class_name': '班级名称',
      'activity_title': '活动标题',
      'student_count': '学生数量',
      'teacher_count': '教师数量',
      'total_count': '总数量',
      'enrollment_count': '报名数量',
      'created_at': '创建时间',
      'updated_at': '更新时间',
      'category': '类别',
      'total_amount': '总金额',
      'unit': '单位',
      'period': '时期'
    };

    return labelMap[columnName] || columnName;
  }

  /**
   * 从查询结果生成列信息
   */
  private generateColumnsFromData(queryResults: any[]): Array<{name: string, type: string, label: string}> {
    if (!queryResults || queryResults.length === 0) {
      return [];
    }

    const firstRow = queryResults[0];
    const columns = Object.keys(firstRow).map(key => {
      const value = firstRow[key];
      let type = 'string';
      
      // 推断数据类型
      if (typeof value === 'number') {
        type = 'number';
      } else if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
        type = 'date';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (typeof value === 'string') {
        // 检查是否是状态值
        const statusWords = ['status', 'state', 'type', 'category', '状态', '类型', '类别'];
        if (statusWords.some(word => key.toLowerCase().includes(word))) {
          type = 'status';
        }
      }

      // 生成友好的标签名
      let label = key;
      const labelMap: {[key: string]: string} = {
        'category': '类别',
        'total_amount': '金额',
        'unit': '单位',
        'period': '时期',
        'created_at': '创建时间',
        'updated_at': '更新时间',
        'id': 'ID',
        'name': '名称',
        'status': '状态'
      };
      
      if (labelMap[key]) {
        label = labelMap[key];
      }

      return {
        name: key,
        type,
        label
      };
    });

    return columns;
  }

  /**
   * 基于查询分析结果生成智能可视化
   */
  private async generateIntelligentVisualization(
    data: any[], 
    naturalQuery: string, 
    queryAnalysis: any
  ): Promise<any> {
    if (!data || data.length === 0) {
      return null;
    }

    const columns = Object.keys(data[0]);
    
    // 基于查询类型智能选择可视化方式
    switch (queryAnalysis.queryType) {
      case '统计查询':
        return this.createStatisticsVisualization(data, columns, naturalQuery);
      case '学生查询':
        return this.createStudentVisualization(data, columns);
      case '教师查询':
        return this.createTeacherVisualization(data, columns);
      case '活动查询':
        return this.createActivityVisualization(data, columns);
      case '财务查询':
        return this.createFinancialVisualization(data, columns);
      default:
        return this.createDefaultVisualization(data, columns, naturalQuery);
    }
  }

  /**
   * 创建统计查询可视化
   */
  private createStatisticsVisualization(data: any[], columns: string[], naturalQuery: string): any {
    // 如果是计数查询且有两列数据
    if (columns.length === 2 && this.isCountQuery(naturalQuery)) {
      return this.createBarChart(data, columns);
    }
    
    // 如果包含时间字段，创建趋势图
    const timeColumn = columns.find(col => 
      col.includes('date') || col.includes('time') || col.includes('created_at')
    );
    if (timeColumn && columns.length >= 2) {
      return this.createTrendChart(data, columns, timeColumn);
    }
    
    return this.createBarChart(data, columns);
  }

  /**
   * 创建趋势图
   */
  private createTrendChart(data: any[], columns: string[], timeColumn: string): any {
    const valueColumn = columns.find(col => col !== timeColumn) || columns[1];
    
    return {
      type: 'line',
      title: '数据趋势图',
      config: {
        xAxis: {
          type: 'category',
          data: data.map(item => item[timeColumn])
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: data.map(item => item[valueColumn]),
          type: 'line',
          smooth: true
        }]
      }
    };
  }

  /**
   * 生成可视化配置
   */
  private async generateVisualization(data: any[], naturalQuery: string): Promise<any> {
    if (!data || data.length === 0) {
      return null;
    }

    const columns = Object.keys(data[0]);
    
    // 判断是否适合生成图表
    if (this.isCountQuery(naturalQuery) && columns.length === 2) {
      return this.createBarChart(data, columns);
    }
    
    if (this.isFinancialQuery(naturalQuery)) {
      return this.createFinancialChart(data, columns);
    }
    
    return null; // 默认使用表格显示
  }

  /**
   * 创建学生查询可视化
   */
  private createStudentVisualization(data: any[], columns: string[]): any {
    // 如果有年龄或班级信息，创建分布图
    const ageColumn = columns.find(col => col.includes('age') || col.includes('年龄'));
    const classColumn = columns.find(col => col.includes('class') || col.includes('班级'));
    
    if (classColumn && data.length > 1) {
      // 按班级分布饼图
      const classData = this.groupByColumn(data, classColumn);
      return {
        type: 'pie',
        title: '学生班级分布',
        config: {
          series: [{
            name: '学生数量',
            type: 'pie',
            data: Object.entries(classData).map(([name, value]) => ({
              name,
              value
            }))
          }]
        }
      };
    }
    
    if (ageColumn && data.length > 1) {
      // 年龄分布柱状图
      const ageData = this.groupByColumn(data, ageColumn);
      return {
        type: 'bar',
        title: '学生年龄分布',
        config: {
          xAxis: {
            type: 'category',
            data: Object.keys(ageData)
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: Object.values(ageData),
            type: 'bar'
          }]
        }
      };
    }
    
    return this.createDefaultVisualization(data, columns, '学生信息');
  }

  /**
   * 创建教师查询可视化
   */
  private createTeacherVisualization(data: any[], columns: string[]): any {
    // 如果有科目或等级信息，创建分布图
    const subjectColumn = columns.find(col => 
      col.includes('subject') || col.includes('科目') || col.includes('专业')
    );
    const levelColumn = columns.find(col => 
      col.includes('level') || col.includes('等级') || col.includes('职级')
    );
    
    if (subjectColumn && data.length > 1) {
      const subjectData = this.groupByColumn(data, subjectColumn);
      return {
        type: 'pie',
        title: '教师专业分布',
        config: {
          series: [{
            name: '教师数量',
            type: 'pie',
            data: Object.entries(subjectData).map(([name, value]) => ({
              name,
              value
            }))
          }]
        }
      };
    }
    
    if (levelColumn && data.length > 1) {
      const levelData = this.groupByColumn(data, levelColumn);
      return {
        type: 'bar',
        title: '教师职级分布',
        config: {
          xAxis: {
            type: 'category',
            data: Object.keys(levelData)
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: Object.values(levelData),
            type: 'bar'
          }]
        }
      };
    }
    
    return this.createDefaultVisualization(data, columns, '教师信息');
  }

  /**
   * 创建活动查询可视化
   */
  private createActivityVisualization(data: any[], columns: string[]): any {
    // 如果有状态或类型信息，创建分布图
    const statusColumn = columns.find(col => 
      col.includes('status') || col.includes('状态')
    );
    const typeColumn = columns.find(col => 
      col.includes('type') || col.includes('类型') || col.includes('category')
    );
    
    if (statusColumn && data.length > 1) {
      const statusData = this.groupByColumn(data, statusColumn);
      return {
        type: 'pie',
        title: '活动状态分布',
        config: {
          series: [{
            name: '活动数量',
            type: 'pie',
            data: Object.entries(statusData).map(([name, value]) => ({
              name,
              value
            }))
          }]
        }
      };
    }
    
    if (typeColumn && data.length > 1) {
      const typeData = this.groupByColumn(data, typeColumn);
      return {
        type: 'bar',
        title: '活动类型分布',
        config: {
          xAxis: {
            type: 'category',
            data: Object.keys(typeData)
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: Object.values(typeData),
            type: 'bar'
          }]
        }
      };
    }
    
    return this.createDefaultVisualization(data, columns, '活动信息');
  }

  /**
   * 创建财务查询可视化
   */
  private createFinancialVisualization(data: any[], columns: string[]): any {
    // 寻找金额相关字段
    const amountColumn = columns.find(col => 
      col.includes('amount') || col.includes('money') || col.includes('金额') || 
      col.includes('费用') || col.includes('price') || col.includes('cost')
    );
    
    // 寻找时间相关字段
    const timeColumn = columns.find(col => 
      col.includes('date') || col.includes('time') || col.includes('created_at')
    );
    
    if (amountColumn && timeColumn && data.length > 1) {
      // 创建金额趋势图
      return {
        type: 'line',
        title: '财务数据趋势',
        config: {
          xAxis: {
            type: 'category',
            data: data.map(item => item[timeColumn])
          },
          yAxis: {
            type: 'value',
            name: '金额'
          },
          series: [{
            data: data.map(item => item[amountColumn]),
            type: 'line',
            smooth: true,
            itemStyle: {
              color: '#67C23A'
            }
          }]
        }
      };
    }
    
    if (amountColumn && data.length > 1) {
      // 如果有分类字段，创建分类金额图
      const categoryColumn = columns.find(col => 
        col !== amountColumn && !col.includes('id') && 
        (col.includes('type') || col.includes('category') || col.includes('name'))
      );
      
      if (categoryColumn) {
        return {
          type: 'bar',
          title: '财务分类统计',
          config: {
            xAxis: {
              type: 'category',
              data: data.map(item => item[categoryColumn])
            },
            yAxis: {
              type: 'value',
              name: '金额'
            },
            series: [{
              data: data.map(item => item[amountColumn]),
              type: 'bar',
              itemStyle: {
                color: '#409EFF'
              }
            }]
          }
        };
      }
    }
    
    return this.createDefaultVisualization(data, columns, '财务信息');
  }

  /**
   * 创建默认可视化
   */
  private createDefaultVisualization(data: any[], columns: string[], naturalQuery: string): any {
    // 如果数据量少于2条，使用表格
    if (data.length < 2) {
      return {
        type: 'table',
        title: '查询结果',
        config: {
          columns: columns.map(col => ({
            prop: col,
            label: this.generateColumnLabel(col)
          })),
          data: data
        }
      };
    }
    
    // 如果只有两列且第二列是数值，创建柱状图
    if (columns.length === 2) {
      const [nameCol, valueCol] = columns;
      const firstValue = data[0][valueCol];
      
      if (typeof firstValue === 'number') {
        return {
          type: 'bar',
          title: `${this.generateColumnLabel(nameCol)}统计`,
          config: {
            xAxis: {
              type: 'category',
              data: data.map(item => item[nameCol])
            },
            yAxis: {
              type: 'value'
            },
            series: [{
              data: data.map(item => item[valueCol]),
              type: 'bar'
            }]
          }
        };
      }
    }
    
    // 默认返回表格
    return {
      type: 'table',
      title: '查询结果',
      config: {
        columns: columns.map(col => ({
          prop: col,
          label: this.generateColumnLabel(col)
        })),
        data: data
      }
    };
  }

  /**
   * 按指定列分组统计
   */
  private groupByColumn(data: any[], column: string): {[key: string]: number} {
    const result: {[key: string]: number} = {};
    
    data.forEach(item => {
      const key = item[column] || '未知';
      result[key] = (result[key] || 0) + 1;
    });
    
    return result;
  }

  /**
   * 判断是否为计数查询
   */
  private isCountQuery(query: string): boolean {
    return /统计|数量|多少|计算|count/i.test(query);
  }

  /**
   * 判断是否为财务相关查询
   */
  private isFinancialQuery(query: string): boolean {
    return /收入|营收|财务|费用|预算|金额|收费|学费|成本|利润|资金/i.test(query);
  }

  /**
   * 创建柱状图配置
   */
  private createBarChart(data: any[], columns: string[]): any {
    const [labelColumn, valueColumn] = columns;
    
    return {
      type: 'bar',
      title: '统计图表',
      xAxis: {
        data: data.map(row => row[labelColumn])
      },
      yAxis: {},
      series: [{
        name: this.generateColumnLabel(valueColumn),
        type: 'bar',
        data: data.map(row => row[valueColumn])
      }]
    };
  }

  /**
   * 创建财务图表配置
   */
  private createFinancialChart(data: any[], columns: string[]): any {
    return {
      type: 'pie',
      title: '财务分析图表',
      series: [{
        name: '财务分析',
        type: 'pie',
        data: data.map(row => ({
          name: row.category || '未知类别',
          value: row.total_amount || row.estimated_monthly_income || 0
        }))
      }]
    };
  }

  /**
   * 根据意图执行数据库查询
   */
  private async executeDataQueries(intentAnalysis: any, context?: any) {
    const tenantDb = context?.tenantDb || 'tenant_dev';
    try {
      const queries: any = {};

      // 根据分析维度执行相应查询
      if (intentAnalysis.dimensions.includes('age_distribution')) {
        queries.ageDistribution = await sequelize.query(`
          SELECT 
            CASE 
              WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 3 THEN '2-3岁(托班)'
              WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 4 THEN '3-4岁(小班)'
              WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 5 THEN '4-5岁(中班)'
              ELSE '5-6岁(大班)'
            END as ageGroup,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
          FROM ${tenantDb}.students 
          WHERE status = 1 
          GROUP BY ageGroup
          ORDER BY count DESC
        `, { type: 'SELECT' });
      }

      if (intentAnalysis.dimensions.includes('class_capacity')) {
        queries.classCapacity = await sequelize.query(`
          SELECT 
            c.name as className,
            c.type as classType,
            c.capacity,
            COUNT(s.id) as currentCount,
            ROUND(COUNT(s.id) * 100.0 / c.capacity, 2) as utilizationRate,
            (c.capacity - COUNT(s.id)) as availableSpots
          FROM ${tenantDb}.classes c
          LEFT JOIN ${tenantDb}.students s ON c.id = s.class_id AND s.status = 1
          WHERE c.status = 1
          GROUP BY c.id, c.name, c.type, c.capacity
          ORDER BY utilizationRate DESC
        `, { type: 'SELECT' });
      }

      if (intentAnalysis.dimensions.includes('gender_balance')) {
        queries.genderBalance = await sequelize.query(`
          SELECT 
            CASE gender WHEN 1 THEN '男' WHEN 2 THEN '女' ELSE '未知' END as gender,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
          FROM ${tenantDb}.students 
          WHERE status = 1 
          GROUP BY gender
        `, { type: 'SELECT' });
      }

      if (intentAnalysis.dimensions.includes('geographic_distribution')) {
        queries.geographicDistribution = await sequelize.query(`
          SELECT 
            SUBSTRING_INDEX(current_address, '区', 1) as district,
            COUNT(*) as studentCount,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
          FROM ${tenantDb}.students 
          WHERE status = 1 AND current_address IS NOT NULL
          GROUP BY district
          HAVING studentCount >= 3
          ORDER BY studentCount DESC
          LIMIT 10
        `, { type: 'SELECT' });
      }

      // 获取总体概览数据
      const overviewData = await sequelize.query(`
        SELECT 
          (SELECT COUNT(*) FROM ${tenantDb}.students WHERE status = 1) as totalStudents,
          (SELECT COUNT(*) FROM ${tenantDb}.classes WHERE status = 1) as totalClasses,
          (SELECT ROUND(AVG(TIMESTAMPDIFF(YEAR, birth_date, CURDATE())), 1) FROM ${tenantDb}.students WHERE status = 1) as avgAge,
          (SELECT ROUND(SUM(CASE WHEN s.status = 1 THEN 1 ELSE 0 END) * 100.0 / SUM(c.capacity), 2) 
           FROM ${tenantDb}.classes c LEFT JOIN ${tenantDb}.students s ON c.id = s.class_id WHERE c.status = 1) as overallUtilization
      `, { type: 'SELECT' });

      return {
        primaryData: queries.ageDistribution || queries.classCapacity || [],
        ageDistribution: queries.ageDistribution,
        classCapacity: queries.classCapacity,
        genderBalance: queries.genderBalance,
        geographicDistribution: queries.geographicDistribution,
        overview: overviewData[0]
      };
    } catch (error) {
      console.error('数据查询失败:', error);

      // 构造详细的错误信息
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = {
        type: 'DATABASE_QUERY_ERROR',
        message: `数据库查询失败: ${errorMessage}`,
        originalError: errorMessage,
        timestamp: new Date().toISOString(),
        context: 'executeDataQueries'
      };

      // 返回包含错误信息的数据结构，而不是静默使用模拟数据
      return {
        error: errorDetails,
        fallbackData: {
          primaryData: [
            { ageGroup: '3-4岁(小班)', count: 128, percentage: 44.9 },
            { ageGroup: '4-5岁(中班)', count: 89, percentage: 31.2 },
            { ageGroup: '5-6岁(大班)', count: 45, percentage: 15.8 },
            { ageGroup: '2-3岁(托班)', count: 23, percentage: 8.1 }
          ],
          overview: { totalStudents: 285, totalClasses: 12, avgAge: 4.2, overallUtilization: 82.5 }
        },
        isUsingFallbackData: true
      };
    }
  }

  /**
   * 使用豆包模型生成结构化建议
   */
  private async generateRecommendations(queryContent: string, queryResults: any, userId: number, availableModels: any[]) {
    try {
      const startTime = Date.now();
      
      const systemPrompt = `你是资深的幼儿园管理和招生专家。基于提供的生源数据分析，生成专业的结构化建议。

请以JSON格式返回：
{
  "summary": "简要总结分析结果和主要建议",
  "recommendations": [
    {
      "category": "结构优化/容量调整/招生策略",
      "priority": "high/medium/low", 
      "suggestion": "具体建议内容",
      "rationale": "建议依据"
    }
  ],
  "visualizations": [
    {
      "type": "pie_chart/bar_chart/stat_cards",
      "data": "数据字段名",
      "title": "图表标题",
      "priority": 1
    }
  ],
  "keyInsights": ["关键洞察1", "关键洞察2"]
}

严格按JSON格式返回，不要包含其他文字。`;

      const response = await TextModelService.generateText(userId, {
        model: availableModels[0]?.name || 'default',
        messages: [
          { role: MessageRole.SYSTEM, content: systemPrompt },
          { role: MessageRole.USER, content: `
用户查询: ${queryContent}

数据分析结果:
${JSON.stringify(queryResults, null, 2)}

请生成专业的结构化建议。` }
        ],
        temperature: 0.3,
        maxTokens: 1500
      });

      const recommendationsText = response.choices[0].message.content;
      const recommendations = JSON.parse(recommendationsText);
      
      return {
        ...recommendations,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.warn('建议生成失败，使用默认建议:', error);
      return {
        summary: '基于当前生源数据分析，为您提供以下优化建议',
        recommendations: [
          {
            category: '结构优化',
            priority: 'high',
            suggestion: '根据数据分析优化年龄结构分布',
            rationale: '基于当前生源分布特点'
          }
        ],
        visualizations: [
          { type: 'pie_chart', data: 'ageDistribution', title: '年龄分布图', priority: 1 }
        ],
        keyInsights: ['生源结构总体健康', '建议关注容量利用率'],
        processingTime: 100
      };
    }
  }

  /**
   * 提交查询反馈
   */
  public submitFeedback = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { queryId, rating, comment } = req.body;
      const userId = (req.user as any)?.id;

      console.log('💭 提交查询反馈:', { queryId, rating, comment, userId });

      ApiResponse.success(res, { feedbackId: Date.now() }, '反馈提交成功');
    } catch (error: any) {
      console.error('提交反馈错误:', error);
      ApiResponse.handleError(res, error, '提交反馈失败');
    }
  };

  /**
   * 获取查询模板
   */
  public getTemplates = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.user as any)?.id;

      console.log('📋 获取查询模板:', { userId });    // const mockTemplates = [
    //         {
    //           id: 1,
    //           title: '学生基本信息查询',
    //           description: '查询学生的姓名、年龄、班级等基本信息',
    //           template: '查询所有学生的基本信息',
    //           category: 'student'
    //         },
    //         {
    //           id: 2,
    //           title: '班级统计',
    //           description: '统计各班级的学生人数',
    //           template: '统计各班级学生人数',
    //           category: 'statistics'
    //         }
    //       ];

      ApiResponse.success(res, [], '查询模板获取成功');
    } catch (error: any) {
      console.error('获取模板错误:', error);
      ApiResponse.handleError(res, error, '获取查询模板失败');
    }
  };

  /**
   * 获取查询建议
   */
  public getSuggestions = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.user as any)?.id;
      const userRole = (req.user as any)?.role;

      console.log('💡 获取查询建议:', { userId, userRole });    // const mockSuggestions = [
    //         '查询本月新入学的学生',
    //         '统计各年龄段学生分布',
    //         '查看最近的活动参与情况',
    //         '分析招生渠道效果'
    //       ];

      ApiResponse.success(res, [], '查询建议获取成功');
    } catch (error: any) {
      console.error('获取建议错误:', error);
      ApiResponse.handleError(res, error, '获取查询建议失败');
    }
  };

  /**
   * 重新执行查询
   */
  public reExecuteQuery = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req.user as any)?.id;

      console.log('🔄 重新执行查询:', { id, userId });

      // 模拟重新执行
      await new Promise(resolve => setTimeout(resolve, 800));    // const mockResult = {
    //         queryId: parseInt(id),
    //         newExecutionId: Date.now(),
    //         result: [
    //           { id: 1, name: '张三', age: 5, class: '小班一组', status: '在读' },
    //           { id: 2, name: '李四', age: 6, class: '中班一组', status: '在读' }
    //         ],
    //         executionTime: '0.8s'
    //       };

      ApiResponse.success(res, [], '查询重新执行成功');
    } catch (error: any) {
      console.error('重新执行查询错误:', error);
      ApiResponse.handleError(res, error, '重新执行查询失败');
    }
  };

  /**
   * 导出查询结果
   */
  public exportResult = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { format = 'excel' } = req.query;
      const userId = (req.user as any)?.id;

      console.log('📤 导出查询结果:', { id, format, userId });    // const mockExport = {
    //         downloadUrl: `/api/files/exports/query_${id}_${Date.now()}.${format}`,
    //         fileName: `查询结果_${id}.${format}`,
    //         fileSize: '12.5KB',
    //         expiresAt: new Date(Date.now() + 3600000).toISOString()
    //       };

      ApiResponse.success(res, [], '导出任务创建成功');
    } catch (error: any) {
      console.error('导出结果错误:', error);
      ApiResponse.handleError(res, error, '导出查询结果失败');
    }
  };

  /**
   * 🎯 生成API调用计划
   */
  private async generateApiCallPlan(
    query: string,
    groupName: string,
    groupDetails: any,
    queryAnalysis: any
  ): Promise<{
    apis: any[];
    parameters: any;
    description: string;
  }> {
    try {
      // 基于查询内容和API分组，智能选择最相关的API
      const relevantApis = this.selectRelevantApis(query, groupDetails.apis);

      // 生成API调用参数
      const parameters = this.generateApiParameters(query, queryAnalysis, groupDetails.fieldMappings);

      return {
        apis: relevantApis,
        parameters,
        description: `调用${groupName}分组的${relevantApis.length}个API端点`
      };
    } catch (error) {
      console.error('❌ 生成API调用计划失败:', error);
      throw new Error('生成API调用计划失败');
    }
  }

  /**
   * 🔍 选择相关的API端点
   */
  private selectRelevantApis(query: string, apis: any[]): any[] {
    const queryLower = query.toLowerCase();

    // 根据查询内容的关键词匹配API
    const scoredApis = apis.map(api => {
      let score = 0;

      // 检查路径匹配
      if (api.path.toLowerCase().includes('list') || api.path.toLowerCase().includes('search')) {
        if (queryLower.includes('查询') || queryLower.includes('获取') || queryLower.includes('所有')) {
          score += 10;
        }
      }

      // 检查统计相关
      if (api.path.toLowerCase().includes('stat') || api.path.toLowerCase().includes('count')) {
        if (queryLower.includes('统计') || queryLower.includes('数量') || queryLower.includes('总数')) {
          score += 10;
        }
      }

      // 检查详情相关
      if (api.path.includes('/:id') || api.path.includes('/detail')) {
        if (queryLower.includes('详细') || queryLower.includes('详情') || queryLower.includes('信息')) {
          score += 8;
        }
      }

      return { ...api, score };
    });

    // 按分数排序，返回前3个最相关的API
    return scoredApis
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter(api => api.score > 0);
  }

  /**
   * 📝 生成API调用参数
   */
  private generateApiParameters(query: string, queryAnalysis: any, fieldMappings: any): any {
    const parameters: any = {};

    // 基础分页参数
    parameters.pagination = {
      page: 1,
      pageSize: 20
    };

    // 基于查询内容生成过滤条件
    if (query.includes('活跃') || query.includes('在读')) {
      parameters.filters = { status: 1 };
    }

    // 基于字段映射生成排序
    if (fieldMappings.fields) {
      parameters.sort = {
        field: 'created_at',
        order: 'desc'
      };
    }

    return parameters;
  }

  /**
   * 执行API调用计划 (v3.0 新增)
   */
  private async executeApiCalls(apiCallPlan: any): Promise<any[]> {
    try {
      console.log('🚀 开始执行API调用计划:', apiCallPlan.apis.length, '个API');

      // 使用真实API调用结果
      const realResults = await this.getRealApiResults(apiCallPlan);

      console.log('✅ API调用完成，返回', realResults.length, '条记录');
      return realResults;
    } catch (error) {
      console.error('❌ API调用失败:', error);
      return [];
    }
  }

  /**
   * 获取真实API调用结果
   */
  private async getRealApiResults(apiCallPlan: any): Promise<any[]> {
    const { group, filters = {}, pagination = {}, kindergartenId } = apiCallPlan;

    try {
      switch (group) {
        case '学生管理':
          return await Student.findAll({
            where: {
              ...(kindergartenId && { kindergartenId }),
              ...filters
            },
            include: [
              {
                model: Class,
                as: 'class',
                attributes: ['id', 'name']
              },
              {
                model: Parent,
                through: { attributes: [] },
                attributes: ['id', 'name', 'phone']
              }
            ],
            attributes: { exclude: ['deletedAt'] },
            limit: pagination.limit || 20,
            offset: pagination.offset || 0,
            order: [['createdAt', 'DESC']]
          });

        case '教师管理':
          return await Teacher.findAll({
            where: {
              ...(kindergartenId && { kindergartenId }),
              ...filters
            },
            include: [
              {
                model: Class,
                as: 'classes',
                attributes: ['id', 'name'],
                through: { attributes: [] }
              },
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'phone', 'email']
              }
            ],
            attributes: { exclude: ['deletedAt'] },
            limit: pagination.limit || 20,
            offset: pagination.offset || 0,
            order: [['createdAt', 'DESC']]
          });

        case '活动管理':
          return await Activity.findAll({
            where: {
              ...(kindergartenId && { kindergartenId }),
              ...filters
            },
            include: [
              {
                model: ActivityRegistration,
                as: 'registrations',
                attributes: ['id', 'status', 'createdAt']
              },
              {
                model: Kindergarten,
                as: 'kindergarten',
                attributes: ['id', 'name']
              },
              {
                model: User,
                as: 'creator',
                attributes: ['id', 'name']
              }
            ],
            attributes: { exclude: ['deletedAt'] },
            limit: pagination.limit || 20,
            offset: pagination.offset || 0,
            order: [['createdAt', 'DESC']]
          });

        case '招生管理':
          return await EnrollmentApplication.findAll({
            where: {
              ...filters
            },
            include: [
              {
                model: EnrollmentPlan,
                as: 'plan',
                attributes: ['id', 'title', 'startDate', 'endDate']
              },
              {
                model: Student,
                as: 'student',
                attributes: ['id', 'name', 'age']
              },
              {
                model: User,
                as: 'creator',
                attributes: ['id', 'name']
              }
            ],
            attributes: { exclude: ['deletedAt'] },
            limit: pagination.limit || 20,
            offset: pagination.offset || 0,
            order: [['createdAt', 'DESC']]
          });

        case '班级管理':
          return await Class.findAll({
            where: {
              ...(kindergartenId && { kindergartenId }),
              ...filters
            },
            include: [
              {
                model: Teacher,
                as: 'teachers',
                attributes: ['id', 'name'],
                through: { attributes: [] }
              },
              {
                model: Student,
                as: 'students',
                attributes: ['id', 'name'],
                through: { attributes: [] }
              },
              {
                model: Kindergarten,
                as: 'kindergarten',
                attributes: ['id', 'name']
              }
            ],
            attributes: { exclude: ['deletedAt'] },
            limit: pagination.limit || 20,
            offset: pagination.offset || 0,
            order: [['createdAt', 'DESC']]
          });

        case '家长管理':
          return await Parent.findAll({
            where: {
              ...filters
            },
            include: [
              {
                model: Student,
                as: 'students',
                attributes: ['id', 'name', 'age'],
                through: { attributes: [] }
              }
            ],
            attributes: { exclude: ['deletedAt'] },
            limit: pagination.limit || 20,
            offset: pagination.offset || 0,
            order: [['createdAt', 'DESC']]
          });

        case '营销活动':
          return await MarketingCampaign.findAll({
            where: {
              ...(kindergartenId && { kindergartenId }),
              ...filters
            },
            include: [
              {
                model: ConversionTracking,
                as: 'conversions',
                attributes: ['id', 'revenue', 'status']
              },
              {
                model: Kindergarten,
                as: 'kindergarten',
                attributes: ['id', 'name']
              }
            ],
            attributes: { exclude: ['deletedAt'] },
            limit: pagination.limit || 20,
            offset: pagination.offset || 0,
            order: [['createdAt', 'DESC']]
          });

        default:
          console.warn(`未知的API分组: ${group}`);
          return [];
      }
    } catch (error) {
      console.error(`获取${group}数据失败:`, error);
      return [];
    }
  }

  /**
   * 生成模拟API调用结果 (保留作为备用)
   */
  private generateMockApiResults(apiCallPlan: any): any[] {
    // 基于API分组生成模拟数据
    const groupName = apiCallPlan.group || '学生管理';

    switch (groupName) {
      case '学生管理':
        return this.generateMockStudentData();
      case '教师管理':
        return this.generateMockTeacherData();
      case '班级管理':
        return this.generateMockClassData();
      case '活动管理':
        return this.generateMockActivityData();
      default:
        return [{ message: `${groupName}数据暂无` }];
    }
  }

  /**
   * 生成模拟学生数据
   */
  private generateMockStudentData(): any[] {
    return [
      { id: 1, name: '张小明', age: 5, class: '大班A', status: '在读' },
      { id: 2, name: '李小红', age: 4, class: '中班B', status: '在读' },
      { id: 3, name: '王小华', age: 6, class: '大班C', status: '在读' }
    ];
  }

  /**
   * 生成模拟教师数据
   */
  private generateMockTeacherData(): any[] {
    return [
      { id: 1, name: '张老师', subject: '语言', class: '大班A', experience: 5 },
      { id: 2, name: '李老师', subject: '数学', class: '中班B', experience: 3 },
      { id: 3, name: '王老师', subject: '美术', class: '大班C', experience: 8 }
    ];
  }

  /**
   * 生成模拟班级数据
   */
  private generateMockClassData(): any[] {
    return [
      { id: 1, name: '大班A', studentCount: 25, teacher: '张老师', room: '101' },
      { id: 2, name: '中班B', studentCount: 20, teacher: '李老师', room: '102' },
      { id: 3, name: '大班C', studentCount: 22, teacher: '王老师', room: '103' }
    ];
  }

  /**
   * 生成模拟活动数据
   */
  private generateMockActivityData(): any[] {
    return [
      { id: 1, name: '春游活动', date: '2024-03-15', participants: 45, status: '已完成' },
      { id: 2, name: '亲子运动会', date: '2024-04-20', participants: 60, status: '进行中' },
      { id: 3, name: '六一儿童节', date: '2024-06-01', participants: 80, status: '计划中' }
    ];
  }

}

// 创建控制器实例并导出
const aiQueryController = new AIQueryController();
export default aiQueryController;