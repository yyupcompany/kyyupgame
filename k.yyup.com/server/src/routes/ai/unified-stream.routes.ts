import express, { Request, Response } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import unifiedIntelligenceService from '../../services/ai-operator/unified-intelligence.service';

const router = express.Router();

/**
* @swagger
* /api/ai/unified-stream/chat:
*   post:
*     summary: SSE流式AI聊天接口
*     description: |
*       智能路由AI聊天接口，支持Server-Sent Events流式响应，系统会根据查询复杂度自动选择最适合的AI模型和处理策略。
*       支持简单问答、数据库查询、复杂任务和超复杂任务的智能路由处理。
*     tags:
*       - AI统一流处理
*     security:
*       - bearerAuth: []
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
*                 example: "请帮我分析一下幼儿园最近一个月的招生情况"
*                 description: 用户消息内容
*               userId:
*                 type: string
*                 example: "user123"
*                 description: 用户ID，默认从JWT token获取
*               conversationId:
*                 type: string
*                 example: "conv_456"
*                 description: 会话ID，默认为'default'
*               context:
*                 type: object
*                 properties:
*                   role:
*                     type: string
*                     enum: [parent, teacher, admin, principal]
*                     example: "admin"
*                     description: 用户角色
*                   enableTools:
*                     type: boolean
*                     example: true
*                     description: 是否启用工具调用，默认true
*                   kindergartenId:
*                     type: string
*                     example: "kg_001"
*                     description: 幼儿园ID
*     responses:
*       200:
*         description: 成功建立SSE连接，开始流式响应
*         content:
*           text/event-stream:
*             schema:
*               type: string
*               example: "data: {\"type\":\"thinking\",\"content\":\"正在分析您的请求...\"}\n\n"
*       400:
*         $ref: '#/components/responses/BadRequest'
*       401:
*         $ref: '#/components/responses/Unauthorized'
*       500:
*         $ref: '#/components/responses/InternalServerError'
*/
router.post('/stream-chat', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { message, userId, conversationId, context } = req.body;

    // 验证必要参数
    if (!message) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: message'
      });
    }

    // 🔑 从请求头中提取 token（用于工具调用时的API认证）
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    // 构建用户请求对象
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

    // 🧠 加载用户记忆上下文
    try {
      const { getMemorySystem } = await import('../../services/memory/six-dimension-memory.service');
      const memorySystem = getMemorySystem();
      
      console.log('📚 [Memory] 开始加载用户记忆上下文...');
      const memoryContext = await memorySystem.getStructuredMemoryContext(
        userRequest.userId.toString(),
        message,
        {
          timeWindow: 24,        // 最近24小时
          maxConversations: 10,  // 最近10条对话
          conceptLimit: 20,      // 最多20个概念
          relevanceThreshold: 0.5
        }
      );
      console.log(`✅ [Memory] 记忆加载完成: ${memoryContext.recentConversations.length}条对话, ${memoryContext.relevantConcepts.length}个概念`);
      
      // 🧠 记录用户消息到情节记忆
      await memorySystem.recordConversation(
        'user',
        message,
        {
          userId: userRequest.userId.toString(),
          conversationId: userRequest.conversationId,
          timestamp: new Date(),
          role: 'user'
        }
      );
      console.log('✅ [Memory] 用户消息已记录到情节记忆');
      
      // 将记忆上下文添加到请求中
      userRequest.context.memoryContext = memoryContext;
    } catch (memoryError) {
      console.error('❌ [Memory] 记忆加载失败:', memoryError);
      // 记忆加载失败不应阻塞对话，继续处理
      userRequest.context.memoryContext = null;
    }

    // Flash模型路由决策
    const finalEnableTools = context?.enableTools ?? true;
    const modelName = 'doubao-seed-1-6-flash-250715';

    // 构建完整的上下文
    userRequest.context = {
      ...userRequest.context,
      flashRouting: {
        modelName,
        enableTools: finalEnableTools,
        reasoning: 'Flash模型直接判断'
      },
      modelName,
      enableTools: finalEnableTools
    };

    // 调用流式处理服务
    await unifiedIntelligenceService.processUserRequestStreamSingleRound(userRequest, res);
    
  } catch (error: any) {
    console.error('❌ [SSE Route] 流式处理路由错误:', error);
    
    // 如果响应还没有开始，发送错误响应
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: error.message
      });
    } else {
      // 如果已经开始SSE响应，发送错误事件
      const errorData = `event: error\ndata: ${JSON.stringify({
        message: '处理过程中出现错误: ' + error.message,
        error: error.toString()
      })}\n\n`;
      res.write(errorData);
      res.end();
    }
  }
});

/**
* @swagger
* /api/ai/unified-stream/stream-health:
*   get:
*     summary: SSE流式服务健康检查
*     description: 检查AI统一流处理服务的运行状态，用于服务监控和健康检查
*     tags:
*       - AI统一流处理
*     responses:
*       200:
*         description: 服务运行正常
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 message:
*                   type: string
*                   example: "SSE流式服务运行正常"
*                 timestamp:
*                   type: string
*                   format: date-time
*                   example: "2024-01-01T12:00:00.000Z"
*                 service:
*                   type: string
*                   example: "unified-intelligence-stream"
*/
router.get('/stream-health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'SSE流式服务运行正常',
    timestamp: new Date().toISOString(),
    service: 'unified-intelligence-stream'
  });
});

export default router;