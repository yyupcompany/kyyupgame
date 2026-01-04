/**
 * 统一智能系统路由
 * 提供新的统一AI智能处理接口
*/

import { Router, Request, Response } from 'express';
import { specs } from '../../config/swagger.config';
import { verifyToken } from '../../middlewares/auth.middleware';

import unifiedIntelligenceService from '../../services/ai-operator/unified-intelligence.service';
import { DirectResponseService } from '../../services/ai/direct-response.service';
import { QueryRouterService } from '../../services/ai/query-router.service';
import { MessageRole } from '../../models/ai-message.model';
import * as fs from 'fs';
import * as path from 'path';

// EventEmitter for SSE support
import { EventEmitter } from 'events';
class AIProgressEmitter extends EventEmitter {}
const aiProgressEmitter = new AIProgressEmitter();

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
// router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
 * 从消息中提取文件链接
*/
function extractFileLinks(message: string): Array<{type: 'file' | 'image', name: string, url: string}> {
  const fileLinks: Array<{type: 'file' | 'image', name: string, url: string}> = [];

  // 匹配文件链接格式: [📄 filename](url)
  const fileRegex = /\[📄\s*([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = fileRegex.exec(message)) !== null) {
    fileLinks.push({
      type: 'file',
      name: match[1].trim(),
      url: match[2].trim()
    });
  }

  // 匹配图片链接格式: ![filename](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  while ((match = imageRegex.exec(message)) !== null) {
    fileLinks.push({
      type: 'image',
      name: match[1].trim() || 'image',
      url: match[2].trim()
    });
  }

  return fileLinks;
}

/**
 * 处理多模态聊天（包含文件的消息）
*/
async function handleMultimodalChat(message: string, fileLinks: any[], modelConfig: any, userId: string, res: Response, context?: any) {
  try {
    console.log('🎭 [MultimodalChat] 开始处理多模态消息');

    // 读取文件内容
    const fileContents: string[] = [];
    for (const fileLink of fileLinks) {
      try {
        const filePath = path.join(process.cwd(), 'uploads', fileLink.url.replace('/uploads/', ''));
        console.log('📖 [MultimodalChat] 读取文件:', filePath);

        if (fs.existsSync(filePath)) {
          if (fileLink.type === 'image') {
            // 对于图片，我们添加描述而不是读取二进制内容
            fileContents.push(`[图片文件: ${fileLink.name}]`);
          } else {
            // 对于文档，读取文本内容
            const content = fs.readFileSync(filePath, 'utf-8');
            fileContents.push(`[文件: ${fileLink.name}]\n${content}`);
          }
        } else {
          console.warn('⚠️ [MultimodalChat] 文件不存在:', filePath);
          fileContents.push(`[文件不存在: ${fileLink.name}]`);
        }
      } catch (error) {
        console.error('❌ [MultimodalChat] 读取文件失败:', error);
        fileContents.push(`[文件读取失败: ${fileLink.name}]`);
      }
    }

    // 构建包含文件内容的完整消息
    const fullMessage = `${message}\n\n文件内容:\n${fileContents.join('\n\n')}`;

    console.log('📝 [MultimodalChat] 构建完整消息，长度:', fullMessage.length);

    // 调用AI模型
    const textModelService = (await import('../../services/ai/text-model.service')).default;
    const { MessageRole } = await import('../../services/ai/text-model.service');

    // 🏢 获取机构现状数据
    const { UnifiedIntelligenceService } = await import('../../services/ai-operator/unified-intelligence.service');
    const intelligenceService = new UnifiedIntelligenceService();
    const organizationStatusText = await intelligenceService.getOrganizationStatusText(context);

    const systemPrompt = `你是幼儿园管理系统的AI助手，具备文档分析和图片理解能力。

${organizationStatusText}

请仔细分析用户上传的文件内容，并提供专业、详细的分析和建议。
如果是文档，请分析其内容结构、关键信息和实用价值。
如果是图片，请描述图片内容并提供相关建议。
直接给出清晰、有用的回答，不要展示思考过程。`;

    const result = await textModelService.generateText(Number(userId) || 0, {
      model: modelConfig.name,
      messages: [
        { role: MessageRole.SYSTEM, content: systemPrompt },
        { role: MessageRole.USER, content: fullMessage }
      ],
      temperature: modelConfig.modelParameters?.temperature ?? 0.7,
      maxTokens: modelConfig.modelParameters?.maxTokens ?? modelConfig.maxTokens ?? 2000,  // 🚀 修复：使用数据库配置，不硬编码
      stream: false
    });

    const content = result.choices?.[0]?.message?.content || '';
    console.log('✅ [MultimodalChat] 多模态响应成功，Token消耗:', result.usage);

    res.json({
      success: true,
      data: { content },
      usage: result.usage,
      model: modelConfig.name,
      multimodal: true,
      filesProcessed: fileLinks.length
    });

  } catch (error) {
    console.error('❌ [MultimodalChat] 处理失败:', error);
    res.status(500).json({ success: false, error: '多模态聊天处理失败' });
  }
}

/**
 * 处理多模态聊天（SSE版本）
*/
async function handleMultimodalChatSSE(message: string, fileLinks: any[], modelSelector: any, userId: string, res: Response, context?: any) {
  try {
    console.log('🎭 [MultimodalChatSSE] 开始处理多模态消息');

    // 读取文件内容
    res.write(`data: ${JSON.stringify({
      type: 'file_reading',
      content: '📖 正在读取文件内容...',
      timestamp: new Date().toISOString()
    })}\n\n`);

    const fileContents: string[] = [];
    for (const fileLink of fileLinks) {
      try {
        const filePath = path.join(process.cwd(), 'uploads', fileLink.url.replace('/uploads/', ''));
        console.log('📖 [MultimodalChatSSE] 读取文件:', filePath);

        if (fs.existsSync(filePath)) {
          if (fileLink.type === 'image') {
            // 对于图片，我们添加描述而不是读取二进制内容
            fileContents.push(`[图片文件: ${fileLink.name}]`);
          } else {
            // 对于文档，读取文本内容
            const content = fs.readFileSync(filePath, 'utf-8');
            fileContents.push(`[文件: ${fileLink.name}]\n${content}`);
          }
        } else {
          console.warn('⚠️ [MultimodalChatSSE] 文件不存在:', filePath);
          fileContents.push(`[文件不存在: ${fileLink.name}]`);
        }
      } catch (error) {
        console.error('❌ [MultimodalChatSSE] 读取文件失败:', error);
        fileContents.push(`[文件读取失败: ${fileLink.name}]`);
      }
    }

    // 构建包含文件内容的完整消息
    const fullMessage = `${message}\n\n文件内容:\n${fileContents.join('\n\n')}`;

    console.log('📝 [MultimodalChatSSE] 构建完整消息，长度:', fullMessage.length);

    // 发送分析开始状态
    res.write(`data: ${JSON.stringify({
      type: 'analyzing',
      content: '🤖 正在分析文件内容...',
      timestamp: new Date().toISOString()
    })}\n\n`);

    // 选择模型并调用AI
    const { ModelType } = await import('../../models/ai-model-config.model');
    const selection = await modelSelector.selectModel({
      modelType: ModelType.TEXT
    });
    const modelConfig = selection.model;

    const textModelService = (await import('../../services/ai/text-model.service')).default;
    const { MessageRole } = await import('../../services/ai/text-model.service');

    // 🏢 获取机构现状数据
    const { UnifiedIntelligenceService } = await import('../../services/ai-operator/unified-intelligence.service');
    const intelligenceService = new UnifiedIntelligenceService();
    const organizationStatusText = await intelligenceService.getOrganizationStatusText(context);

    const systemPrompt = `你是幼儿园管理系统的AI助手，具备文档分析和图片理解能力。

${organizationStatusText}

请仔细分析用户上传的文件内容，并提供专业、详细的分析和建议。
如果是文档，请分析其内容结构、关键信息和实用价值。
如果是图片，请描述图片内容并提供相关建议。
直接给出清晰、有用的回答，不要展示思考过程。`;

    const result = await textModelService.generateText(Number(userId) || 0, {
      model: modelConfig.name,
      messages: [
        { role: MessageRole.SYSTEM, content: systemPrompt },
        { role: MessageRole.USER, content: fullMessage }
      ],
      temperature: modelConfig.modelParameters?.temperature ?? 0.7,
      maxTokens: modelConfig.modelParameters?.maxTokens ?? modelConfig.maxTokens ?? 2000,  // 🚀 修复：使用数据库配置，不硬编码
      stream: false
    });

    const content = result.choices?.[0]?.message?.content || '';
    console.log('✅ [MultimodalChatSSE] 多模态响应成功，Token消耗:', result.usage);

    // 发送分析结果
    res.write(`data: ${JSON.stringify({
      type: 'message',
      content: content,
      timestamp: new Date().toISOString()
    })}\n\n`);

  } catch (error) {
    console.error('❌ [MultimodalChatSSE] 处理失败:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      content: '❌ 文件分析失败，请稍后重试',
      timestamp: new Date().toISOString()
    })}\n\n`);
  }
}

/**
 * 简化AI处理器 - 直接使用完整AI处理，让AI智能选择工具
 * 从三级架构简化为单级架构，AI自动选择read_data_record或any_query工具
*
* @param userRequest 用户请求
* @param progressCallback 进度回调函数（可选）- 用于实时发送工具调用事件
*/
async function processWithTieredRetrieval(
  userRequest: any,
  progressCallback?: (status: string, details?: any) => void
): Promise<any> {
  const startTime = Date.now();

  try {
    console.log('🚀 [架构简化] 直接使用完整AI处理，让AI智能选择工具');
    console.log('🎯 [简化架构] 查询内容:', userRequest.content);

    // 检查特殊情况的覆盖设置（保持兼容性）
    if (userRequest?.context?.levelOverride === 'level-3' || userRequest?.context?.levelOverride === 'complex') {
      console.log('⏭️ [Override] 特殊情况覆盖，继续使用Level-3处理');
    }

    // 检查网页搜索标志（保持兼容性）
    if (userRequest?.context?.enableWebSearch === true) {
      console.log('🔍 [WebSearch] 检测到网页搜索请求，使用完整AI处理');
    }

    // 直接进入完整AI处理，让AI智能选择合适的工具
    // AI会根据查询内容自动选择：
    // - 简单查询 → read_data_record工具 (<1秒)
    // - 复杂查询 → any_query工具 (~18秒)
    // - CRUD操作 → create/update/delete_data_record工具
    console.log('🧠 [智能处理] 开始AI智能工具选择和执行...');

    // @deprecated 此路由已废弃，请使用流式接口：/api/ai/unified/stream-chat-single
    // 🔧 修复：使用带进度回调的处理方法，实时发送工具调用事件
    // 已废弃：processUserRequestWithProgress 和 processUserRequest 已移除
    // 请使用流式接口替代
    throw new Error('此路由已废弃，请使用流式接口：/api/ai/unified/stream-chat-single');

  } catch (error) {
    console.error('❌ [TieredRetrieval] 分级检索处理失败:', error);

    // 发送错误进度事件
    if (progressCallback) {
      progressCallback('❌ 处理失败: ' + (error as Error).message);
    }

    return {
      success: false,
      error: (error as Error).message,
      data: {
        message: `处理失败: ${(error as Error).message}`,
        toolExecutions: [],
        uiComponents: [],
        recommendations: []
      },
      metadata: {
        executionTime: Date.now() - startTime,
        toolsUsed: [],
        confidenceScore: 0,
        nextSuggestedActions: [],
        complexity: 'simple' as any,
        approach: 'error_fallback',
        level: 'error'
      }
    };
  }
}

/**
 * 评估查询复杂度
*/
function isActionIntent(query: string): boolean {
  const q = query.toLowerCase()
  const patterns = [
    /策划|生成|创建|预览|海报|团购|报名|推广/,
    /导航|跳转|打开|进入/,
    /表单|填写|提交/,
    /截图|截屏|抓图/,
    /工作流|分解任务|执行步骤/
  ]
  return patterns.some(p => p.test(q))
}

async function evaluateQueryComplexity(query: string): Promise<{level: string, score: number, reasoning: string}> {
  const queryLower = query.toLowerCase();

  // 简单查询模式
  const simplePatterns = [
    /^(学生|教师|家长|客户)总数$/,
    /^(招生|活动|通知|文件|任务)统计$/,
    /^(系统状态|健康检查)$/,
    /^(绩效|通知|存储|我的任务)$/
  ];

  // 中等复杂度模式
  const mediumPatterns = [
    /查询.*统计/,
    /分析.*数据/,
    /生成.*报告/,
    /比较.*情况/
  ];

  // 复杂查询模式 - 修复版本，支持更多触发Level-3的场景
  const complexPatterns = [
    // 原有模式
    /创建|生成.*活动/,
    /制定.*计划/,
    /设计.*方案/,
    /分析.*趋势.*预测/,

    // 多步骤操作模式 - 更灵活的匹配
    /(查询|搜索).*(然后|接着|再).*(分析|总结|处理)/,
    /(获取|查找).*(数据|信息).*(分析|处理)/,
    /(数据库|搜索).*(结果|数据).*(分析|搜索)/,

    // 工具调用组合模式 - 降低匹配门槛
    /工具.*调用/,
    /多个.*步骤/,
    /(综合|全面|深度).*(处理|分析)/,

    // 复杂业务场景
    /策划.*执行/,
    /优化.*建议/,
    /完整.*流程/,
    /系统.*分析/,
    /专业.*建议/,

    // 英文复杂模式 - 重新设计更宽松的匹配
    /(query|search).*(then|and).*(search|analyze|provide)/i,
    /(database|data).*(search|query).*(analysis|analyze)/i,
    /(comprehensive|detailed|complete).*(analysis|report)/i,
    /(multi|multiple).*(step|stage|phase)/i,
    /(complex|advanced).*(workflow|process)/i,
    /provide.*(comprehensive|detailed|complete)/i
  ];

  // 检查简单模式
  for (const pattern of simplePatterns) {
    if (pattern.test(queryLower)) {
      return {
        level: 'simple',
        score: 0.2,
        reasoning: '匹配简单查询模式，可用轻量级处理'
      };
    }
  }

  // 检查中等模式
  for (const pattern of mediumPatterns) {
    if (pattern.test(queryLower)) {
      return {
        level: 'medium',
        score: 0.5,
        reasoning: '匹配中等复杂度模式，需要数据分析'
      };
    }
  }

  // 检查复杂模式
  for (const pattern of complexPatterns) {
    if (pattern.test(queryLower)) {
      console.log(`🎯 [复杂度评估] 匹配到复杂模式: ${pattern.source}`);
      return {
        level: 'complex',
        score: 0.8,
        reasoning: '匹配复杂查询模式，需要大模型处理'
      };
    }
  }

  // 动态复杂度评估 - 基于关键词和特征
  const dynamicScore = calculateDynamicComplexity(query);
  console.log(`📊 [复杂度评估] 动态评分: ${dynamicScore}, 查询: "${query.substring(0, 50)}..."`);

  if (dynamicScore >= 0.7) {
    console.log(`🚀 [复杂度评估] 动态评估触发Level-3: ${dynamicScore}`);
    return {
      level: 'complex',
      score: dynamicScore,
      reasoning: `动态评估为高复杂度(${dynamicScore})，需要大模型处理`
    };
  }

  // 默认中等复杂度
  console.log(`⚡ [复杂度评估] 使用轻量级处理: ${Math.max(dynamicScore, 0.4)}`);
  return {
    level: 'medium',
    score: Math.max(dynamicScore, 0.4),
    reasoning: `动态评估复杂度(${dynamicScore})，使用轻量级处理`
  };
}

/**
 * 动态复杂度评估
*/
function calculateDynamicComplexity(query: string): number {
  let score = 0;
  const queryLower = query.toLowerCase();

  // 1. 查询长度评分 (最大0.2分)
  if (query.length > 50) score += 0.1;
  if (query.length > 100) score += 0.1;

  // 2. 多步骤操作关键词 (每个0.15分)
  const multiStepKeywords = ['然后', '接着', '之后', '再', '并且', '同时', 'then', 'and then', 'after'];
  const multiStepCount = multiStepKeywords.filter(keyword => queryLower.includes(keyword)).length;
  score += Math.min(multiStepCount * 0.15, 0.3);

  // 3. 工具调用关键词 (每个0.1分)
  const toolKeywords = ['查询', '搜索', '分析', '生成', '创建', '导航', '截图', '填写', 'search', 'analyze', 'create', 'navigate'];
  const toolCount = toolKeywords.filter(keyword => queryLower.includes(keyword)).length;
  score += Math.min(toolCount * 0.1, 0.4);

  // 4. 复杂分析关键词 (每个0.2分)
  const analysisKeywords = ['全面', '深度', '综合', '详细', '完整', '系统', 'comprehensive', 'detailed', 'complete'];
  const analysisCount = analysisKeywords.filter(keyword => queryLower.includes(keyword)).length;
  score += Math.min(analysisCount * 0.2, 0.4);

  // 5. 业务复杂度关键词 (每个0.15分)
  const businessKeywords = ['策划', '优化', '建议', '方案', '流程', '策略', 'strategy', 'optimize', 'workflow'];
  const businessCount = businessKeywords.filter(keyword => queryLower.includes(keyword)).length;
  score += Math.min(businessCount * 0.15, 0.3);

  // 6. 多目标操作 (0.2分)
  const multiTargetKeywords = ['多个', '各种', '所有', '全部', 'multiple', 'various', 'all'];
  if (multiTargetKeywords.some(keyword => queryLower.includes(keyword))) {
    score += 0.2;
  }

  return Math.min(score, 1.0); // 最大1.0分
}

/**
 * 轻量级模型处理
*/
async function processWithLightModel(request: any, complexityResult: any): Promise<any> {
  try {
    console.log('⚡ [LightModel] 使用轻量级模型处理...');

    if (isActionIntent(request.content)) {
      return { success: false, data: { message: '检测到行动意图，升级到深度处理', uiComponents: [], toolExecutions: [], recommendations: [], todoList: [], visualizations: [] }, metadata: { executionTime: 200, toolsUsed: ['classifier'], confidenceScore: 0.9, level: 'level-2', approach: 'escalate_to_level_3', complexity: complexityResult.level } };
    }

    // 🚀 修复：对于简单查询，直接跳过轻量级处理，进入第三级大模型处理
    // 这样可以确保用户得到真正的AI回复而不是调试信息
    console.log('⚠️ [LightModel] 轻量级处理暂时禁用，升级到第三级大模型处理');
    return {
      success: false,
      data: {
        message: '轻量级处理跳过，升级到大模型处理',
        uiComponents: [],
        toolExecutions: [],
        recommendations: [],
        todoList: [],
        visualizations: []
      },
      metadata: {
        executionTime: 100,
        toolsUsed: ['classifier'],
        confidenceScore: 0.9,
        level: 'level-2',
        approach: 'escalate_to_level_3',
        complexity: complexityResult.level
      }
    };
  } catch (error) {
    console.error('❌ [LightModel] 轻量级处理失败:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
* @swagger
* tags:
*   - name: "AI统一智能系统"
*     description: "幼儿园管理系统AI统一智能接口"
*/

/**
* @swagger
* /api/ai/unified/stream/{sessionId}:
*   get:
*     tags: [AI统一智能系统]
*     summary: "SSE实时状态推送接口"
*     description: "建立Server-Sent Events连接，实时获取AI处理状态"
*     parameters:
*       - in: path
*         name: sessionId
*         required: true
*         schema:
*           type: string
*         description: "会话ID"
*     responses:
*       200:
*         description: "SSE连接建立成功"
*         content:
*           text/event-stream:
*             schema:
*               type: string
*               format: "SSE流数据"
*       500:
*         description: "服务器错误"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: false
*                 error:
*                   type: string
*                   example: "服务器错误"
*/
// SSE实时状态推送路由
router.get('/stream/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;

  // 设置SSE头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  console.log(`🌊 [SSE] 客户端连接：sessionId=${sessionId}`);

  // 发送连接确认
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    sessionId,
    timestamp: new Date().toISOString(),
    message: '已建立实时连接，等待AI处理状态...'
  })}\n\n`);

  // 监听该session的进度事件
  const progressListener = (data: any) => {
    if (data.sessionId === sessionId) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  // 监听完成事件
  const completeListener = (data: any) => {
    if (data.sessionId === sessionId) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      res.end();
    }
  };

  // 注册事件监听器
  aiProgressEmitter.on('ai-progress', progressListener);
  aiProgressEmitter.on('ai-complete', completeListener);

  // 客户端断开连接时清理
  req.on('close', () => {
    console.log(`🌊 [SSE] 客户端断开：sessionId=${sessionId}`);
    aiProgressEmitter.removeListener('ai-progress', progressListener);
    aiProgressEmitter.removeListener('ai-complete', completeListener);
  });

  // 定期心跳
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({
      type: 'heartbeat',
      timestamp: new Date().toISOString()
    })}\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

// 带实时推送的统一智能聊天接口 (已注释，使用stream-chat替代)
/* 注释：使用stream-chat接口替代
router.post('/unified-chat-stream', async (req, res) => {
  try {
    const { message, userId = '121', conversationId } = req.body;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }
    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: '单次消息长度不得超过1000字'
      });
    }

    console.log('🧠 [UnifiedIntelligence-Stream] 收到请求:', {
      message: Buffer.isBuffer(message) ? message.toString('utf8') : message,
      userId,
      sessionId,
      messageLength: message?.length || 0
    });

    // 立即返回session ID，让前端建立SSE连接
    res.json({
      success: true,
      sessionId,
      message: '处理中，请通过SSE流获取实时状态...'
    });

    // 🔧 修复：创建进度推送函数，支持工具调用事件
    const pushProgress = (status: string, details?: any) => {
      // 🎯 检测工具调用相关事件，使用特殊的事件类型
      if (status === 'tool_intent' || status === 'tool_call_start' || status === 'tool_call_complete' || status === 'tool_call_error') {
        aiProgressEmitter.emit('ai-progress', {
          sessionId,
          type: status,  // 使用原始事件类型
          data: details,  // 工具调用数据
          timestamp: new Date().toISOString()
        });
      } else if (status === 'thinking') {
        // thinking事件
        aiProgressEmitter.emit('ai-progress', {
          sessionId,
          type: 'thinking',
          content: details,  // thinking内容
          timestamp: new Date().toISOString()
        });
      } else {
        // 普通进度事件
        aiProgressEmitter.emit('ai-progress', {
          sessionId,
          type: 'progress',
          status,
          details,
          timestamp: new Date().toISOString()
        });
      }
    };

    // 异步处理用户请求
    setImmediate(async () => {
      try {
        // 🔧 移除"正在连接AI服务..."提示，避免前端显示不必要的连接状态
        // pushProgress('正在连接AI服务...');

        // 构建用户请求
        const userRequest = {
          content: message,
          userId,
          conversationId: conversationId || `unified_${Date.now()}`,
          context: {
            timestamp: new Date().toISOString(),
            source: 'unified-chat-stream-api',
            sessionId,
            enableTools: req.body?.context?.enableTools === true,  // 🔧 修复：从context中读取enableTools
            levelOverride: req.body?.levelOverride,
            role: req.body?.context?.role || (req as any).user?.role || 'parent',  // 🔧 修复：传递角色信息
            pagePath: req.body?.context?.pagePath
          }
        };

        pushProgress('正在分析用户意图...');

        // 🔧 修复：调用三级分级检索处理器，并传入进度回调
        const response = await processWithTieredRetrieval(userRequest, pushProgress);

        // 推送完成事件
        aiProgressEmitter.emit('ai-complete', {
          sessionId,
          type: 'complete',
          success: response.success,
          data: {
            message: response.data.message,
            ui_components: response.data.uiComponents,
            tool_executions: response.data.toolExecutions,
            recommendations: response.data.recommendations,
            todo_list: response.data.todoList,
            visualizations: response.data.visualizations
          },
          metadata: {
            execution_time: response.metadata.executionTime,
            tools_used: response.metadata.toolsUsed,
            confidence_score: response.metadata.confidenceScore,
            next_actions: response.metadata.nextSuggestedActions,
            complexity: response.metadata.complexity,
            approach: response.metadata.approach,
            system_version: 'unified-intelligence-v1.0'
          },
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ [UnifiedIntelligence-Stream] 处理失败:', error);

        // 推送错误事件
        aiProgressEmitter.emit('ai-complete', {
          sessionId,
          type: 'error',
          success: false,
          error: '智能处理失败',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
          timestamp: new Date().toISOString()
        });
      }
    });

  } catch (error) {
    console.error('❌ [UnifiedIntelligence-Stream] 初始化失败:', error);

    res.status(500).json({
      success: false,
      error: '智能处理初始化失败'
    });
  }
});
*/

// 🎯 新增：统一智能聊天接口（HTTP直接返回，不使用WebSocket/SSE） (已注释，使用stream-chat替代)
/* 注释：使用stream-chat接口替代
router.post('/unified-chat-direct', async (req, res) => {
  try {
    const { message, userId = '121', conversationId, context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }
    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: '单次消息长度不得超过1000字'
      });
    }

    console.log('🎯 [UnifiedIntelligence-Direct] 收到HTTP直接请求:', {
      message,
      userId,
      conversationId,
      context
    });

    // @deprecated 此路由已废弃，请使用流式接口：/api/ai/unified/stream-chat-single
    // 调用统一智能服务（带进度回调）
    // 已废弃：processUserRequestWithProgress 已移除
    // 请使用流式接口替代
    throw new Error('此路由已废弃，请使用流式接口：/api/ai/unified/stream-chat-single');

  } catch (error) {
    console.error('❌ [UnifiedIntelligence-Direct] 处理失败:', error);
    res.status(500).json({
      success: false,
      error: '处理失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});
*/

// 统一智能聊天接口 (已注释，使用stream-chat替代)
/* 注释：使用stream-chat接口替代
router.post('/unified-chat', async (req, res) => {
  try {
    const { message, userId = '121', conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }
    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: '单次消息长度不得超过1000字'
      });
    }

    console.log('🧠 [UnifiedIntelligence] 收到请求:', {
      message: Buffer.isBuffer(message) ? message.toString('utf8') : message,
      userId,
      conversationId,
      messageLength: message?.length || 0,
      messagePreview: message?.substring(0, 50) + (message?.length > 50 ? '...' : '')
    });

    // 💾 导入消息服务用于保存消息
    const { MessageService } = await import('../../services/ai/message.service');
    const { MessageRole } = await import('../../models/ai-message.model');
    const messageService = new MessageService();
    let savedUserMessage: any = null;
    let savedAIMessage: any = null;

    // 构建用户请求
    const userRequest = {
      content: message,
      userId,
      conversationId: conversationId || `unified_${Date.now()}`,
      context: {
        timestamp: new Date().toISOString(),
        source: 'unified-chat-api',
        enableTools: req.body?.enableTools === true || req.body?.context?.enableTools === true,
        enableWebSearch: req.body?.enableWebSearch === true || req.body?.context?.enableWebSearch === true,
        levelOverride: req.body?.levelOverride || req.body?.context?.levelOverride,
        role: req.body?.context?.role || (req as any).user?.role || 'parent',  // 🔧 修复：传递角色信息
        pagePath: req.body?.context?.pagePath
      }
    };

    // 💾 保存用户消息到数据库
    try {
      if (conversationId) {
        console.log('💾 [UnifiedIntelligence] 保存用户消息到数据库:', {
          conversationId,
          userId,
          contentLength: message.length
        });

        savedUserMessage = await messageService.createMessage({
          conversationId,
          userId: Number(userId),
          role: MessageRole.USER,
          content: message,
          messageType: 'text',
          tokens: Math.ceil(message.length / 4)
        });

        console.log('✅ [UnifiedIntelligence] 用户消息保存成功:', savedUserMessage.id);
      }
    } catch (saveError) {
      console.error('❌ [UnifiedIntelligence] 用户消息保存失败:', saveError);
      // 继续处理，不中断流程
    }

    // 调用三级分级检索处理器
    const response = await processWithTieredRetrieval(userRequest);

    // 💾 保存AI回复到数据库
    try {
      if (conversationId && response.success && response.data.message) {
        console.log('💾 [UnifiedIntelligence] 保存AI回复到数据库:', {
          conversationId,
          userId,
          contentLength: response.data.message.length
        });

        savedAIMessage = await messageService.createMessage({
          conversationId,
          userId: Number(userId),
          role: MessageRole.ASSISTANT,
          content: response.data.message,
          messageType: 'text',
          tokens: Math.ceil(response.data.message.length / 4),
          metadata: {
            toolExecutions: response.data.toolExecutions,
            approach: response.metadata.approach,
            complexity: response.metadata.complexity,
            confidenceScore: response.metadata.confidenceScore
          }
        });

        console.log('✅ [UnifiedIntelligence] AI回复保存成功:', savedAIMessage.id);
      }
    } catch (saveError) {
      console.error('❌ [UnifiedIntelligence] AI回复保存失败:', saveError);
      // 继续处理，不中断流程
    }

    // 返回统一格式的响应
    res.json({
      success: response.success,
      data: {
        message: response.data.message,
        ui_components: response.data.uiComponents,
        tool_executions: response.data.toolExecutions,
        recommendations: response.data.recommendations,
        todo_list: response.data.todoList,
        visualizations: response.data.visualizations
      },
      metadata: {
        execution_time: response.metadata.executionTime,
        tools_used: response.metadata.toolsUsed,
        confidence_score: response.metadata.confidenceScore,
        next_actions: response.metadata.nextSuggestedActions,
        complexity: response.metadata.complexity,
        approach: response.metadata.approach,
        system_version: 'unified-intelligence-v1.0'
      }

    });

  } catch (error) {
    console.error('❌ [UnifiedIntelligence] 处理失败:', error);

    res.status(500).json({
      success: false,
      error: '智能处理失败',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      metadata: {
        system_version: 'unified-intelligence-v1.0',
        error_type: 'internal_error'
      }
    });
  }
});

// 系统状态检查接口（已移到文件末尾，作为增强版本）
// router.get('/status', async (req, res) => { ... }); // 旧版本已移除

// 智能分析接口（调试用）
router.post('/analyze', async (req, res) => {
  try {
    const { message, userId = '121' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }

    // 创建临时请求用于分析
    const userRequest = {
      content: message,
      userId,
      conversationId: `analyze_${Date.now()}`,
      context: { analysis_only: true }
    };

    // 这里可以调用 unifiedIntelligenceService 的内部分析方法
    // 暂时返回模拟分析结果
    const mockAnalysis = {
      intent: message.includes('创建') ? 'PAGE_OPERATION' : 'INFORMATION_QUERY',
      complexity: message.length > 50 ? 'COMPLEX' : 'SIMPLE',
      confidence: 0.85,
      required_capabilities: ['page_awareness', 'dom_manipulation'],
      suggested_tools: ['get_page_structure', 'navigate_to_page'],
      estimated_time: 5
    };

    res.json({
      success: true,
      data: {
        original_message: message,
        analysis: mockAnalysis,
        explanation: '这是对用户请求的智能分析结果'
      },
      metadata: {
        analysis_time: Date.now(),
        version: 'unified-intelligence-v1.0'
      }
    });

  } catch (error) {
    console.error('❌ [Analysis] 分析失败:', error);

    res.status(500).json({
      success: false,
      error: '智能分析失败'
    });
  }
});

// 轻量直连聊天接口（不注入工具，不走统一智能链路）
router.post('/direct-chat', async (req: Request, res: Response) => {
  try {
    const { message, userId = '121', conversationId, context = {} } = req.body as any;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: '消息内容不能为空' });
    }

    console.log('🔗 [DirectChat] 收到直连请求:', { message, userId, conversationId, context });

    // 💾 导入消息服务用于保存消息
    const { MessageService } = await import('../../services/ai/message.service');
    const messageService = new MessageService();
    let savedUserMessage: any = null;
    let savedAIMessage: any = null;

    // 检测消息中是否包含文件链接
    const fileLinks = extractFileLinks(message);
    const hasFiles = fileLinks.length > 0;

    console.log('📁 [DirectChat] 检测到文件:', { hasFiles, fileCount: fileLinks.length, files: fileLinks });

    // 选择模型：如果有文件，选择支持多模态的模型；否则使用默认文本模型
    const modelSelector = (await import('../../services/ai/model-selector.service')).default;
    const { ModelType } = await import('../../models/ai-model-config.model');
    const selection = await modelSelector.selectModel({
      modelType: ModelType.TEXT,
      requireCapabilities: hasFiles ? ['multimodal', 'image_understanding'] : (context.enableWebSearch ? ['web_search'] : undefined)
    });
    const modelConfig = selection.model;

    console.log('🤖 [DirectChat] 选择模型:', {
      modelName: modelConfig.name,
      hasMultimodal: hasFiles,
      capabilities: modelConfig.capabilities
    });

    // 💾 保存用户消息到数据库
    try {
      if (conversationId) {
        const { MessageRole: DBMessageRole } = await import('../../models/ai-message.model');

        console.log('💾 [DirectChat] 保存用户消息到数据库:', {
          conversationId,
          userId,
          contentLength: message.length
        });

        savedUserMessage = await messageService.createMessage({
          conversationId,
          userId: Number(userId),
          role: DBMessageRole.USER,
          content: message,
          messageType: 'text',
          tokens: Math.ceil(message.length / 4)
        });

        console.log('✅ [DirectChat] 用户消息保存成功:', savedUserMessage.id);
      }
    } catch (saveError) {
      console.error('❌ [DirectChat] 用户消息保存失败:', saveError);
      // 继续处理，不中断流程
    }

    // 如果有文件，使用多模态处理
    if (hasFiles) {
      return await handleMultimodalChat(message, fileLinks, modelConfig, userId, res, context);
    }

    const textModelService = (await import('../../services/ai/text-model.service')).default;
    const { MessageRole } = await import('../../services/ai/text-model.service');

    // 🏢 获取机构现状数据
    const { UnifiedIntelligenceService } = await import('../../services/ai-operator/unified-intelligence.service');
    const intelligenceService = new UnifiedIntelligenceService();
    const organizationStatusText = await intelligenceService.getOrganizationStatusText(context);

    // 极简系统提示，避免“思考过程/工具调用”等冗余消耗
    const systemPrompt = `你是幼儿园管理系统的AI助手。

${organizationStatusText}

直接给出清晰、简洁、可执行的回答。不要展示思考过程、不要输出步骤列表或工具调用。`;

    const result = await textModelService.generateText(Number(userId) || 0, {
      model: modelConfig.name,
      messages: [
        { role: MessageRole.SYSTEM, content: systemPrompt },
        { role: MessageRole.USER, content: message }
      ],
      temperature: modelConfig.modelParameters?.temperature ?? 0.7,
      maxTokens: modelConfig.modelParameters?.maxTokens ?? modelConfig.maxTokens ?? 2000,  // 🚀 修复：使用数据库配置，不硬编码
      stream: false
    });

    const content = result.choices?.[0]?.message?.content || '';
    console.log('✅ [DirectChat] 直连响应成功，Token消耗:', result.usage);

    // 💾 保存AI回复到数据库
    try {
      if (conversationId && content) {
        const { MessageRole: DBMessageRole } = await import('../../models/ai-message.model');

        console.log('💾 [DirectChat] 保存AI回复到数据库:', {
          conversationId,
          userId,
          contentLength: content.length
        });

        savedAIMessage = await messageService.createMessage({
          conversationId,
          userId: Number(userId),
          role: DBMessageRole.ASSISTANT,
          content: content,
          messageType: 'text',
          tokens: result.usage?.totalTokens || Math.ceil(content.length / 4),  // 🔧 修复：使用totalTokens而不是total_tokens
          metadata: {
            model: modelConfig.name,
            usage: result.usage
          }
        });

        console.log('✅ [DirectChat] AI回复保存成功:', savedAIMessage.id);
      }
    } catch (saveError) {
      console.error('❌ [DirectChat] AI回复保存失败:', saveError);
      // 继续处理，不中断流程
    }

    res.json({ success: true, data: { content }, usage: result.usage, model: modelConfig.name });
  } catch (error) {
    console.error('❌ [DirectChat] 处理失败:', error);
    res.status(500).json({ success: false, error: '直连聊天失败' });
  }
});
*/


// 导入SSE流式聊天路由
import unifiedStreamRoutes from './unified-stream.routes';
router.use(unifiedStreamRoutes);

// ========================================
// 🔧 新增：修复前端缺失的AI端点
// ========================================

/**
* @swagger
* /api/ai/unified/capabilities:
*   get:
*     tags: [AI统一智能系统]
*     summary: "获取AI能力列表"
*     description: "返回系统支持的AI模型、工具和功能能力"
*     responses:
*       200:
*         description: "成功获取能力列表"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   type: object
*                   properties:
*                     models:
*                       type: array
*                       items:
*                         type: string
*                       example: ["doubao-seed-1-6-flash-250715"]
*                     tools:
*                       type: array
*                       items:
*                         type: string
*                       example: ["database_query", "page_operation", "business_operation"]
*                     features:
*                       type: array
*                       items:
*                         type: string
*                       example: ["streaming", "memory", "workflow"]
*/
router.get('/capabilities', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        models: [
          'doubao-seed-1-6-flash-250715',
          'doubao-pro-32k',
          'doubao-lite-4k'
        ],
        tools: {
          database_query: [
            'read_data_record',
            'create_data_record',
            'update_data_record',
            'delete_data_record',
            'any_query'
          ],
          page_operation: [
            'navigate_to_page',
            'get_page_structure',
            'take_screenshot',
            'fill_form',
            'click_element'
          ],
          business_operation: [
            'create_activity_plan',
            'generate_article',
            'generate_copywriting',
            'generate_video_script'
          ]
        },
        features: [
          'streaming',
          'memory',
          'workflow',
          'multimodal',
          'web_search'
        ],
        system: {
          version: '1.0.0',
          name: 'Unified Intelligence System',
          status: 'operational'
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Capabilities] 获取能力列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取能力列表失败'
    });
  }
});

/**
* @swagger
* /api/ai/unified/unified-chat:
*   post:
*     tags: [AI统一智能系统]
*     summary: "统一智能对话接口（非流式）"
*     description: "提供非流式的AI对话接口，用于一次性获取完整响应"
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - message
*             properties:
*               message:
*                 type: string
*                 description: "用户消息内容"
*                 example: "请帮我查询学生总数"
*               userId:
*                 type: string
*                 description: "用户ID"
*                 example: "121"
*               conversationId:
*                 type: string
*                 description: "会话ID"
*                 example: "conv_123"
*               context:
*                 type: object
*                 description: "上下文信息"
*                 properties:
*                   role:
*                     type: string
*                     example: "parent"
*                   enableTools:
*                     type: boolean
*                     example: true
*     responses:
*       200:
*         description: "处理成功"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   type: object
*                   properties:
*                     content:
*                       type: string
*                       example: "当前系统中共有200名学生"
*       500:
*         description: "服务器错误"
*/
router.post('/unified-chat', verifyToken, async (req: Request, res: Response) => {
  try {
    const { message, userId, conversationId, context = {} } = req.body;

    // 验证必要参数
    if (!message) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: message'
      });
    }

    console.log('📨 [UnifiedChat] 收到请求:', {
      message: message.substring(0, 100),
      userId: userId || (req as any).user?.id,
      conversationId
    });

    // 🔑 从请求头中提取 token（用于工具调用时的API认证）
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    // 构建用户请求对象，复用stream-chat的逻辑
    const userRequest = {
      content: message,
      userId: userId || (req as any).user?.id || 'anonymous',
      conversationId: conversationId || 'default',
      context: {
        ...(context || {}),
        role: context?.role || (req as any).user?.role || 'parent',
        token: token  // 🔑 传递 token 到上下文，供 http_request 等工具使用
      }
    };

    // 调用流式处理服务，但由于我们需要非流式响应，所以使用processUserRequestStreamSingleRound
    // 但需要将其包装为Promise来等待完成
    // 这里我们直接调用非流式的direct-chat服务
    const directResponseService = new DirectResponseService();
    const response = await directResponseService.processDirectChat(userRequest);

    console.log('✅ [UnifiedChat] 处理完成');

    res.json({
      success: true,
      data: {
        content: response.content || response.message,
        ...response
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [UnifiedChat] 处理失败:', error);

    res.status(500).json({
      success: false,
      message: '处理失败',
      error: error.message
    });
  }
});

// ========================================
// 🔧 修复：确保 /status 端点正常工作
// ========================================

/**
* @swagger
* /api/ai/unified/status:
*   get:
*     tags: [AI统一智能系统]
*     summary: "获取AI系统状态"
*     description: "返回AI系统的运行状态和健康检查信息"
*     responses:
*       200:
*         description: "系统运行正常"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   type: object
*                   properties:
*                     status:
*                       type: string
*                       example: "healthy"
*                     version:
*                       type: string
*                       example: "1.0.0"
*                     uptime:
*                       type: number
*                       example: 3600
*/
router.get('/status', (req: Request, res: Response) => {
  try {
    const uptime = process.uptime();

    res.json({
      success: true,
      data: {
        status: 'healthy',
        version: '1.0.0',
        uptime: Math.floor(uptime),
        system: 'Unified Intelligence System',
        capabilities: [
          'page_awareness',
          'intelligent_tool_selection',
          'task_decomposition',
          'data_visualization',
          'expert_consultation',
          'unified_response'
        ],
        features: {
          multi_intent_recognition: true,
          context_aware_analysis: true,
          smart_tool_selection: true,
          fallback_strategies: true,
          unified_response_format: true
        },
        endpoints: {
          stream_chat: '/api/ai/unified/stream-chat',
          unified_chat: '/api/ai/unified/unified-chat',
          capabilities: '/api/ai/unified/capabilities',
          status: '/api/ai/unified/status'
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Status] 状态检查失败:', error);
    res.status(500).json({
      success: false,
      error: '状态检查失败'
    });
  }
});

/**
* @swagger
* /api/ai/unified/unified-intelligence:
*   post:
*     tags: [AI统一智能系统]
*     summary: "兼容性统一智能处理接口"
*     description: "为兼容旧测试脚本提供的统一智能处理接口"
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - message
*             properties:
*               message:
*                 type: string
*                 description: "用户消息内容"
*                 example: "查询学生总数"
*               context:
*                 type: object
*                 properties:
*                   userId:
*                     type: string
*                     description: "用户ID"
*                     example: "121"
*                   role:
*                     type: string
*                     description: "用户角色"
*                     example: "parent"
*             example:
*               message: "查询学生总数"
*               context:
*                 userId: "121"
*                 role: "parent"
*     responses:
*       200:
*         description: "处理成功"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   type: object
*                   properties:
*                     message:
*                       type: string
*                       description: "AI回复内容"
*                       example: "当前系统中共有200名学生"
*                     analysis:
*                       type: object
*                       properties:
*                         intent:
*                           type: string
*                           example: "general_assistance"
*                         complexity:
*                           type: string
*                           example: "simple"
*                         complexityScore:
*                           type: number
*                           example: 0.8
*                 metadata:
*                   type: object
*                   properties:
*                     executionTime:
*                       type: number
*                       example: 1500
*                     toolsUsed:
*                       type: array
*                       items:
*                         type: string
*                       example: ["database_query"]
*                     confidenceScore:
*                       type: number
*                       example: 0.9
*       400:
*         description: "请求参数错误"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: false
*                 error:
*                   type: string
*                   example: "消息内容不能为空"
*       500:
*         description: "服务器错误"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: false
*                 error:
*                   type: string
*                   example: "智能处理失败"
*                 details:
*                   type: string
*                   description: "错误详情（开发环境）"
*                   example: "连接超时"
*/
// 兼容旧测试脚本的路由
router.post('/unified-intelligence', async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = context?.userId || '121';

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }

    console.log('🧠 [UnifiedIntelligence] 收到兼容请求:', { message, userId });

    // 构建用户请求
    const userRequest = {
      content: message,
      userId,
      conversationId: `test_${Date.now()}`,
      context: {
        timestamp: new Date().toISOString(),
        source: 'compatibility-test',
        role: context?.role || (req as any).user?.role || 'parent',  // 🔧 修复：传递角色信息
        ...context
      }
    };

    // 调用三级分级检索处理器
    const response = await processWithTieredRetrieval(userRequest);

    // 返回兼容格式的响应（保持测试脚本期望的结构）
    res.json({
      success: response.success,
      data: {
        message: response.data.message,
        analysis: {
          intent: 'general_assistance', // 简化意图
          complexity: response.metadata.complexity,
          complexityScore: response.metadata.confidenceScore
        }
      },
      metadata: response.metadata
    });

  } catch (error) {
    console.error('❌ [UnifiedIntelligence] 兼容处理失败:', error);

    res.status(500).json({
      success: false,
      error: '智能处理失败',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;


