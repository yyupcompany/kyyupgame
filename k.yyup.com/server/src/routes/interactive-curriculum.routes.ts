/**
* @swagger
 * components:
 *   schemas:
 *     Interactive-curriculum:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Interactive-curriculum ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Interactive-curriculum 名称
 *           example: "示例Interactive-curriculum"
 *         status:
 *           type: string
 *           description: 状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-01T00:00:00.000Z"
 *     CreateInteractive-curriculumRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Interactive-curriculum 名称
 *           example: "新Interactive-curriculum"
 *     UpdateInteractive-curriculumRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Interactive-curriculum 名称
 *           example: "更新后的Interactive-curriculum"
 *     Interactive-curriculumListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Interactive-curriculum'
 *         message:
 *           type: string
 *           example: "获取interactive-curriculum列表成功"
 *     Interactive-curriculumResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Interactive-curriculum'
 *         message:
 *           type: string
 *           example: "操作成功"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "操作失败"
 *         code:
 *           type: string
 *           example: "INTERNAL_ERROR"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*/

/**
 * interactive-curriculum管理路由文件
 * 提供interactive-curriculum的基础CRUD操作
*
 * 功能包括：
 * - 获取interactive-curriculum列表
 * - 创建新interactive-curriculum
 * - 获取interactive-curriculum详情
 * - 更新interactive-curriculum信息
 * - 删除interactive-curriculum
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 互动多媒体课程生成路由
 * 支持两阶段提示词生成和并行资源生成
*/

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../middlewares/auth.middleware';
import { interactiveCurriculumService } from '../services/curriculum/interactive-curriculum.service';
import { a2uiCurriculumStreamService, SSEComponentMessage } from '../services/curriculum/a2ui-curriculum-stream.service';
import { CreativeCurriculum } from '../models/creative-curriculum.model';
import { unifiedAIBridge } from '../services/unified-ai-bridge.service';

const router = Router();

// 注意：认证中间件在 server/src/routes/index.ts 中处理
// 这里不需要再应用认证中间件

/**
* @summary 生成互动多媒体课程
* @description 使用AI两阶段生成模式创建互动多媒体课程，包含深度分析、资源并行生成、
 * 智能代码编写等全流程。系统会自动生成HTML/CSS/JS代码，并配备相应的图片和视频资源。
*
 * 生成流程：
 * 第一阶段：深度分析和提示词规划
 * - 使用Think模型进行深度需求分析
 * - 智能规划课程结构和互动方式
 * - 制定多媒体资源生成策略
*
 * 第二阶段：并行资源生成
 * - 同步生成课程代码（HTML/CSS/JS）
 * - 并行生成配套图片资源
 * - 智能生成教学视频内容
 * - 自动整合所有资源
*
* @tags 互动课程
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required 请求体
* @param {string} requestBody.body.prompt.required 课程需求描述，详细说明想要生成的课程内容、功能、互动方式等
* @param {string} requestBody.body.domain.required 课程领域，如"认知发展"、"语言学习"、"艺术创造"、"科学探索"等
* @param {string} requestBody.body.ageGroup.optional 目标年龄段，如"3-4岁"、"4-5岁"、"5-6岁"，不指定则由AI智能推荐
*
* @responses {200} {object} 成功响应
* @responses {200} {object} description:课程生成任务已启动
* @responses {200} {object} schema: {
 *   "success": true,
 *   "data": {
 *     "taskId": "uuid-task-id-123",
 *     "message": "课程生成已启动，请使用 taskId 查询进度"
 *   }
 * }
*
* @responses {400} {object} 参数错误
* @responses {400} {object} description:请求参数错误
* @responses {400} {object} schema: {"success": false, "message": "缺少必要参数: prompt 或 domain"}
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:用户未认证
* @responses {401} {object} schema: {"success": false, "message": "用户未认证"}
*
* @responses {500} {object} 服务器错误
* @responses {500} {object} description:生成请求失败
* @responses {500} {object} schema: {"success": false, "message": "生成请求失败", "error": "错误详情"}
*
* @example {json} 请求示例
 * {
 *   "prompt": "生成一个帮助4岁儿童学习数字1-10的互动游戏，包含拖拽功能和音效反馈",
 *   "domain": "认知发展",
 *   "ageGroup": "4-5岁"
 * }
*
* @example {json} 响应示例
 * {
 *   "success": true,
 *   "data": {
 *     "taskId": "550e8400-e29b-41d4-a716-446655440000",
 *     "message": "课程生成已启动，请使用 taskId 查询进度"
 *   }
 * }
*/

/**
 * 🧪 AI Bridge 连接测试端点
 * 用于验证AI服务是否正常工作
 */
router.get('/test-ai-bridge', async (req: Request, res: Response) => {
  try {
    console.log('🧪 [AI测试] 开始测试AI Bridge连接...');
    
    const startTime = Date.now();
    
    // 发送一个简单的测试请求
    const response = await unifiedAIBridge.chat({
      model: 'doubao-seed-1-6-thinking-250615',
      messages: [
        { role: 'system', content: '你是一个测试助手。' },
        { role: 'user', content: '请用一句话回答：1+1等于几？' }
      ],
      temperature: 0.1,
      max_tokens: 50
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ [AI测试] AI Bridge 响应成功，耗时: ${duration}ms`);
    console.log(`✅ [AI测试] 响应内容:`, (response as any)?.choices?.[0]?.message?.content?.substring(0, 100));
    
    res.json({
      success: true,
      message: 'AI Bridge 连接正常',
      data: {
        duration: `${duration}ms`,
        response: (response as any)?.choices?.[0]?.message?.content || '无响应内容',
        model: (response as any)?.model || 'unknown'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [AI测试] AI Bridge 连接失败:', errorMessage);
    
    res.status(500).json({
      success: false,
      message: 'AI Bridge 连接失败',
      error: errorMessage
    });
  }
});

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { 
      prompt, 
      domain, 
      ageGroup,
      // 🎨 媒体生成选项
      enableImage = true,
      enableVoice = true,
      enableSoundEffect = true
    } = req.body;
    const userId = (req as any).user?.id;

    if (!prompt || !domain) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: prompt 或 domain'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    // 生成任务ID
    const taskId = uuidv4();
    console.log(`🚀 [互动课程] 开始生成课程，taskId: ${taskId}`);
    console.log(`🎨 [互动课程] 媒体选项: 图片=${enableImage}, 语音=${enableVoice}, 音效=${enableSoundEffect}`);

    // 异步执行生成任务，不阻塞响应
    (async () => {
      try {
        // 初始化进度
        await interactiveCurriculumService.initializeProgress(taskId);
        console.log(`📊 [互动课程] 进度已初始化，taskId: ${taskId}`);

        // 第一阶段：深度分析和提示词规划
        console.log(`🤔 [互动课程] 开始第一阶段：深度分析和提示词规划，taskId: ${taskId}`);
        const plan = await interactiveCurriculumService.analyzeAndPlanPrompts(prompt);
        console.log(`✅ [互动课程] 第一阶段完成，taskId: ${taskId}`);

        // 保存 Think 的思考过程到 Redis
        if (plan.thinkingProcess) {
          await interactiveCurriculumService.saveThinkingProcess(taskId, plan.thinkingProcess);
          console.log(`💭 [互动课程] Think 思考过程已保存，taskId: ${taskId}`);
        }

        // 第二阶段：并行生成资源
        console.log(`⚡ [互动课程] 开始第二阶段：并行生成资源，taskId: ${taskId}`);
        const assets = await interactiveCurriculumService.generateAssets(plan, taskId);
        console.log(`✅ [互动课程] 第二阶段完成，taskId: ${taskId}`);

        // 保存到数据库
        console.log(`💾 [互动课程] 开始保存到数据库，taskId: ${taskId}`);
        const curriculum = await CreativeCurriculum.create({
          creatorId: userId,
          kindergartenId: (req as any).user?.kindergartenId || null,
          name: plan.courseAnalysis.title,
          description: prompt,
          domain: domain,
          ageGroup: ageGroup || plan.courseAnalysis.ageGroup,
          htmlCode: assets.code.htmlCode || '',
          cssCode: assets.code.cssCode || '',
          jsCode: assets.code.jsCode || '',
          status: 'draft',
          curriculumType: 'interactive',
          media: {
            images: assets.images,
            video: assets.video
          },
          metadata: {
            generatedAt: new Date(),
            models: {
              text: 'doubao-seed-1-6-thinking-250615',
              image: 'doubao-seedream-3-0-t2i-250415',
              video: 'doubao-seedance-1-0-pro-250528'
            },
            status: 'completed',
            progress: 100
          },
          courseAnalysis: plan.courseAnalysis
        });

        console.log(`✅ [互动课程] 课程生成完成，ID: ${curriculum.id}，taskId: ${taskId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('INTERACTIVECURRICULUM:', `❌ [互动课程] 生成失败 (taskId: ${taskId}):`, errorMessage);
        console.error(`❌ [互动课程] 完整错误堆栈:`, error);

        // 更新进度为错误状态
        try {
          await interactiveCurriculumService.updateProgress(taskId, -1, `生成失败: ${errorMessage}`);
        } catch (updateError) {
          console.error(`❌ [互动课程] 更新错误状态失败:`, updateError);
        }
      }
    })();

    // 立即返回任务ID
    res.json({
      success: true,
      data: {
        taskId,
        message: '课程生成已启动，请使用 taskId 查询进度'
      }
    });
  } catch (error) {
    console.error('❌ [互动课程] 生成请求失败:', error);
    res.status(500).json({
      success: false,
      message: '生成请求失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @summary 查询课程生成进度
* @description 根据任务ID查询互动课程生成的实时进度，包括当前阶段、完成百分比、
 * 预计剩余时间等信息。支持实时状态更新和错误状态查询。
*
 * 进度阶段说明：
 * - 0-20%：初始化和需求分析
 * - 20-60%：深度分析和提示词规划
 * - 60-90%：并行资源生成阶段
 * - 90-100%：数据保存和整合
*
* @tags 互动课程
* @param {string} taskId.path.required 任务ID，由生成接口返回的唯一标识符
*
* @responses {200} {object} 成功响应
* @responses {200} {object} description:获取进度成功
* @responses {200} {object} schema: {
 *   "success": true,
 *   "data": {
 *     "progress": 65,
 *     "stage": "正在生成多媒体资源...",
 *     "status": "processing",
 *     "estimatedTimeRemaining": 120,
 *     "currentStep": "图片生成中",
 *     "totalSteps": 8,
 *     "completedSteps": 5,
 *     "message": "正在生成课程所需的图片和视频资源"
 *   }
 * }
*
* @responses {404} {object} 任务不存在
* @responses {404} {object} description:指定的任务ID不存在
* @responses {404} {object} schema: {"success": false, "message": "任务不存在"}
*
* @responses {500} {object} 服务器错误
* @responses {500} {object} description:查询进度失败
* @responses {500} {object} schema: {"success": false, "message": "查询进度失败"}
*
* @example {string} 请求示例
 * GET /api/interactive-curriculum/progress/550e8400-e29b-41d4-a716-446655440000
*
* @example {json} 进行中响应示例
 * {
 *   "success": true,
 *   "data": {
 *     "progress": 65,
 *     "stage": "正在生成多媒体资源...",
 *     "status": "processing",
 *     "estimatedTimeRemaining": 120,
 *     "message": "正在生成课程所需的图片和视频资源"
 *   }
 * }
*
* @example {json} 完成响应示例
 * {
 *   "success": true,
 *   "data": {
 *     "progress": 100,
 *     "stage": "课程生成完成",
 *     "status": "completed",
 *     "curriculumId": 12345,
 *     "message": "课程已成功生成并保存"
 *   }
 * }
*
* @example {json} 错误响应示例
 * {
 *   "success": true,
 *   "data": {
 *     "progress": -1,
 *     "stage": "生成失败",
 *     "status": "error",
 *     "message": "图片生成失败：服务器负载过高"
 *   }
 * }
*/
router.get('/progress/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const progress = await interactiveCurriculumService.getProgress(taskId);

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('❌ [互动课程] 查询进度失败:', error);
    res.status(500).json({
      success: false,
      message: '查询进度失败'
    });
  }
});

/**
 * GET /api/interactive-curriculum/thinking/:taskId
 * 获取 AI Think 的思考过程
*
 * 响应：
 * {
 *   success: true,
 *   data: {
 *     thinkingProcess: string  // AI 的思考过程
 *   }
 * }
*/
router.get('/thinking/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const thinkingProcess = await interactiveCurriculumService.getThinkingProcess(taskId);

    res.json({
      success: true,
      data: {
        thinkingProcess
      }
    });
  } catch (error) {
    console.error('❌ [互动课程] 查询 Think 思考过程失败:', error);
    res.status(500).json({
      success: false,
      message: '查询 Think 思考过程失败'
    });
  }
});

/**
* @summary 流式生成互动课程
* @description 使用Server-Sent Events技术实时流式生成互动多媒体课程，
 * 提供实时的生成进度和AI思考过程。用户可以实时查看课程生成的每个步骤，
 * 包括AI分析、代码编写、资源生成等全过程的实时输出。
*
 * 流式输出事件类型：
 * - connected: 连接建立确认
 * - progress: 进度更新事件
 * - thinking: AI思考过程输出
 * - content: 生成内容片段
 * - finished: 生成完成事件
 * - error: 错误事件
*
* @tags 互动课程
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required 请求体
* @param {string} requestBody.body.prompt.required 课程需求描述，详细说明想要生成的课程内容、功能、互动方式等
* @param {string} requestBody.body.domain.required 课程领域，如"认知发展"、"语言学习"、"艺术创造"、"科学探索"等
* @param {string} requestBody.body.ageGroup.optional 目标年龄段，如"3-4岁"、"4-5岁"、"5-6岁"，不指定则由AI智能推荐
*
* @responses {200} {object} 流式响应响应头
* @responses {200} {object} description:Server-Sent Events流，实时推送课程生成过程
* @responses {200} {object} headers: {
 *   "Content-Type": "text/event-stream; charset=utf-8",
 *   "Cache-Control": "no-cache",
 *   "Connection": "keep-alive",
 *   "Access-Control-Allow-Origin": "*"
 * }
*
* @responses {400} {object} 参数错误
* @responses {400} {object} description:请求参数错误
* @responses {400} {object} schema: {"success": false, "message": "缺少必要参数: prompt 或 domain"}
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:用户未认证
* @responses {401} {object} schema: {"success": false, "message": "用户未认证"}
*
* @responses {500} {object} 服务器错误
* @responses {500} {object} description:流式处理失败
* @responses {500} {object} schema: {"success": false, "message": "流式处理失败"}
*
* @example {json} 请求示例
 * {
 *   "prompt": "创建一个关于动物认知的互动游戏，包含声音识别和配对功能",
 *   "domain": "认知发展",
 *   "ageGroup": "3-4岁"
 * }
*
* @example {string} 流式响应示例
 * data: {"type": "connected", "taskId": "uuid-123", "message": "已建立实时连接，开始生成课程..."}
*
 * data: {"type": "progress", "message": "开始深度分析..."}
*
 * data: {"type": "thinking", "content": "正在分析3-4岁儿童的认知特点..."}
*
 * data: {"type": "progress", "message": "开始生成资源..."}
*
 * data: {"type": "finished", "curriculumId": 12345, "message": "课程生成完成"}
*/
router.post('/generate-stream', async (req: Request, res: Response) => {
  try {
    const { 
      prompt, 
      domain, 
      ageGroup,
      // 🎨 媒体生成选项
      enableImage = true,
      enableVoice = true,
      enableSoundEffect = true
    } = req.body;
    const userId = (req as any).user?.id;

    if (!prompt || !domain) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: prompt 或 domain'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    // 生成任务ID
    const taskId = uuidv4();
    console.log(`🚀 [互动课程-流式] 开始生成课程，taskId: ${taskId}`);
    console.log(`🎨 [互动课程-流式] 媒体选项: 图片=${enableImage}, 语音=${enableVoice}, 音效=${enableSoundEffect}`);

    // 设置 SSE 响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control, Authorization'
    });

    // 发送连接确认
    res.write(`data: ${JSON.stringify({
      type: 'connected',
      taskId,
      timestamp: new Date().toISOString(),
      message: '已建立实时连接，开始生成课程...'
    })}\n\n`);

    // SSE回调函数
    const sseCallback = (data: { type: string; content?: string; message?: string }) => {
      res.write(`data: ${JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      })}\n\n`);
    };

    // 异步执行生成任务
    (async () => {
      try {
        // 初始化进度
        await interactiveCurriculumService.initializeProgress(taskId);
        sseCallback({ type: 'progress', message: '初始化完成' });

        // 第一阶段：深度分析和提示词规划（流式）
        sseCallback({ type: 'progress', message: '开始深度分析...' });
        const plan = await interactiveCurriculumService.analyzeAndPlanPromptsStream(
          prompt,
          taskId,
          sseCallback
        );
        sseCallback({ type: 'progress', message: '深度分析完成' });

        // 第二阶段：并行生成资源
        sseCallback({ type: 'progress', message: '开始生成资源...' });
        const assets = await interactiveCurriculumService.generateAssets(plan, taskId);
        sseCallback({ type: 'progress', message: '资源生成完成' });

        // 保存到数据库
        sseCallback({ type: 'progress', message: '保存到数据库...' });
        const curriculum = await CreativeCurriculum.create({
          creatorId: userId,
          kindergartenId: (req as any).user?.kindergartenId || null,
          name: plan.courseAnalysis.title,
          description: prompt,
          domain: domain,
          ageGroup: ageGroup || plan.courseAnalysis.ageGroup,
          htmlCode: assets.code.htmlCode || '',
          cssCode: assets.code.cssCode || '',
          jsCode: assets.code.jsCode || '',
          status: 'draft',
          curriculumType: 'interactive',
          media: {
            images: assets.images,
            video: assets.video
          },
          metadata: {
            generatedAt: new Date(),
            models: {
              text: 'doubao-seed-1-6-thinking-250615',
              image: 'doubao-seedream-3-0-t2i-250415',
              video: 'doubao-seedance-1-0-pro-250528'
            },
            status: 'completed',
            progress: 100
          },
          courseAnalysis: plan.courseAnalysis
        });

        // 发送完成信号
        res.write(`data: ${JSON.stringify({
          type: 'finished',
          curriculumId: curriculum.id,
          message: '课程生成完成',
          timestamp: new Date().toISOString()
        })}\n\n`);

        console.log(`✅ [互动课程-流式] 课程生成完成，ID: ${curriculum.id}，taskId: ${taskId}`);
        res.end();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('INTERACTIVECURRICULUM:', `❌ [互动课程-流式] 生成失败 (taskId: ${taskId}):`, errorMessage);

        // 发送错误信号
        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: `生成失败: ${errorMessage}`,
          timestamp: new Date().toISOString()
        })}\n\n`);

        res.end();
      }
    })();

    // 处理客户端断开连接
    req.on('close', () => {
      console.log(`🌊 [互动课程-流式] 客户端断开连接：taskId=${taskId}`);
    });

  } catch (error) {
    console.error('❌ [互动课程-流式] 处理失败:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: '流式处理失败'
      });
    } else {
      res.end();
    }
  }
});

/**
 * POST /api/interactive-curriculum/generate-a2ui-stream
 * A2UI流式生成互动课程（搭积木模式）
 * 实时分段发送A2UI组件，前端可增量渲染
 * 
 * 支持的媒体选项：
 * - enableImage: 是否生成图片（默认true）
 * - enableVoice: 是否启用语音（默认true）
 * - enableSoundEffect: 是否启用音效（默认true）
 */
router.post('/generate-a2ui-stream', async (req: Request, res: Response) => {
  try {
    const { 
      prompt, 
      domain, 
      ageGroup,
      // 🎨 媒体生成选项
      enableImage = true,
      enableVoice = true,
      enableSoundEffect = true
    } = req.body;
    const userId = (req as any).user?.id;

    if (!prompt || !domain) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: prompt 或 domain'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    // 生成任务ID
    const taskId = uuidv4();
    console.log(`🧱 [A2UI搭积木] 开始流式生成，taskId: ${taskId}`);
    console.log(`🎨 [A2UI搭积木] 媒体选项: 图片=${enableImage}, 语音=${enableVoice}, 音效=${enableSoundEffect}`);

    // 设置 SSE 响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control, Authorization'
    });

    // 发送连接确认
    res.write(`data: ${JSON.stringify({
      type: 'connected',
      taskId,
      mode: 'a2ui-stream',
      timestamp: new Date().toISOString(),
      message: '🧱 已建立A2UI流式连接，开始搭建课程...'
    })}\n\n`);

    // SSE组件发送函数
    const sendComponent = (msg: SSEComponentMessage) => {
      res.write(`data: ${JSON.stringify({
        ...msg,
        timestamp: new Date().toISOString()
      })}\n\n`);
    };

    // 🎨 判断是否是demo模式（根据租户信息）
    const tenant = (req as any).tenant;
    const ossNamespace = tenant?.ossNamespace || tenant?.code || 'demo';
    const isDemo = ossNamespace === 'demo' || tenant?.code === 'k_tenant' || tenant?.code === 'dev';
    console.log(`🎨 [A2UI路由] 租户模式判断: ossNamespace=${ossNamespace}, isDemo=${isDemo}`);

    // 异步执行A2UI流式生成
    (async () => {
      try {
        const result = await a2uiCurriculumStreamService.generateCurriculumStream(
          prompt,
          domain,
          ageGroup || '4-5岁',
          taskId,
          sendComponent,
          // 🎨 传递媒体选项（包含isDemo标识）
          {
            enableImage,
            enableVoice,
            enableSoundEffect,
            isDemo  // demo模式使用本地AIBridge，租户模式使用统一认证
          }
        );

        console.log('📦 [A2UI调试] generateCurriculumStream返回结果类型:', typeof result);
        console.log('📦 [A2UI调试] result?.plan 存在:', !!result?.plan);
        console.log('📦 [A2UI调试] result?.images 存在:', !!result?.images);
        console.log('📦 [A2UI调试] result?.plan?.activities 存在:', !!result?.plan?.activities);
        
        if (!result) {
          throw new Error('generateCurriculumStream 返回了 undefined');
        }
        
        // 🔧 安全解构 - 更全面的空值处理
        console.log('🔍 [调试] 步骤 1: 安全解构');
        const plan = (result.plan || {}) as any;
        const images = Array.isArray(result.images) ? result.images : [];

        // 🔧 修复：确保 plan 对象的数组字段有效，防止 undefined.length 错误
        if (!Array.isArray(plan.activities)) {
          console.warn('⚠️ [A2UI路由] plan.activities 不是数组，设置为空数组');
          plan.activities = [];
        }
        if (!Array.isArray(plan.objectives)) {
          console.warn('⚠️ [A2UI路由] plan.objectives 不是数组，设置为空数组');
          plan.objectives = [];
        }
        if (!Array.isArray(plan.images)) {
          console.warn('⚠️ [A2UI路由] plan.images 不是数组，设置为空数组');
          plan.images = [];
        }

        // 保存到数据库 - 确保所有字段有值
        console.log('🔍 [调试] 步骤 2: 处理 plan 对象');
        try {
          console.log('🔍 [A2UI调试] plan对象:', JSON.stringify(plan || {}, null, 2).substring(0, 1000));
        } catch (jsonError) {
          console.log('🔍 [A2UI调试] plan对象无法序列化:', jsonError);
        }
        console.log('🔍 [A2UI调试] plan?.activities类型:', typeof plan?.activities, 'isArray:', Array.isArray(plan?.activities));
        console.log('🔍 [A2UI调试] plan?.objectives类型:', typeof plan?.objectives, 'isArray:', Array.isArray(plan?.objectives));
        
        // 🔧 安全提取字段，防止 undefined.length 错误
        console.log('🔍 [调试] 步骤 3: 安全提取字段');
        const planActivities = Array.isArray(plan?.activities) ? plan.activities : [];
        const planObjectives = Array.isArray(plan?.objectives) ? plan.objectives : [];
        const planImages = Array.isArray(plan?.images) ? plan.images : [];
        
        console.log('🔍 [调试] 步骤 4: 构建 safePlan');
        const safePlan = {
          title: plan?.title || '未命名课程',
          description: plan?.description || '',
          domain: plan?.domain || domain,
          ageGroup: plan?.ageGroup || ageGroup || '4-5岁',
          objectives: planObjectives,
          activities: planActivities,
          style: plan?.style || '',
          colorScheme: plan?.colorScheme || '',
          duration: plan?.duration || 15
        };
        
        console.log('🔍 [调试] 步骤 5: 计算 count');
        console.log('🔍 [A2UI调试] safePlan.activities类型:', typeof safePlan.activities, 'isArray:', Array.isArray(safePlan.activities), 'length:', safePlan.activities.length);
        console.log('🔍 [A2UI调试] safePlan.objectives类型:', typeof safePlan.objectives, 'isArray:', Array.isArray(safePlan.objectives), 'length:', safePlan.objectives.length);
        
        const activitiesCount = safePlan.activities.length;
        const objectivesCount = safePlan.objectives.length;
        const imagesCount = images.length;
        
        console.log('📝 [A2UI保存] 准备保存课程，safePlan:', JSON.stringify({
          title: safePlan.title,
          description: safePlan.description,
          domain: safePlan.domain,
          activities: activitiesCount,
          objectives: objectivesCount,
          images: imagesCount
        }));
        
        // 🔧 将中文领域名称映射为英文enum值
        const domainMap: Record<string, string> = {
          '科学领域': 'science',
          '健康领域': 'health',
          '语言领域': 'language',
          '社会领域': 'social',
          '艺术领域': 'art',
          'science': 'science',
          'health': 'health',
          'language': 'language',
          'social': 'social',
          'art': 'art'
        };
        const mappedDomain = domainMap[safePlan.domain] || 'science';
        
        console.log('📝 [A2UI保存] 使用 mappedDomain:', mappedDomain);
        
        // 🖼️ 将AI生成的图片转存到租户OSS
        const { aiImageStorageService } = await import('../services/ai-image-storage.service');
        const ossNamespace = aiImageStorageService.getOssNamespaceFromRequest(req);
        
        let storedImages: any[] = [];
        let thumbnailUrl: string | null = null;
        
        if (images && images.length > 0) {
          console.log(`🖼️ [A2UI保存] 开始转存 ${images.length} 张图片到 OSS (命名空间: ${ossNamespace})`);
          
          sendComponent({
            type: 'progress',
            message: '📤 正在将图片保存到云存储...'
          });
          
          const storageResult = await aiImageStorageService.storeCurriculumImages(
            images.map((img: any) => ({
              id: img.id || `img_${Math.random().toString(36).substring(7)}`,
              url: img.url,
              description: img.description,
              order: img.order
            })),
            ossNamespace
          );
          
          storedImages = storageResult.storedImages;
          thumbnailUrl = storageResult.thumbnailUrl || null;
          
          console.log(`✅ [A2UI保存] 图片转存完成, 缩略图: ${thumbnailUrl ? '已设置' : '未设置'}`);
          
          sendComponent({
            type: 'progress',
            message: `✅ ${storedImages.length} 张图片已保存到云存储`
          });
        }
        
        // 🔧 将数据转换为纯 JSON，避免 Sequelize 处理特殊对象时出错
        const cleanImages = Array.isArray(storedImages) && storedImages.length > 0 
          ? JSON.parse(JSON.stringify(storedImages)) 
          : (Array.isArray(images) ? JSON.parse(JSON.stringify(images)) : []);
        const cleanActivities = Array.isArray(safePlan.activities) ? JSON.parse(JSON.stringify(safePlan.activities)) : [];
        const cleanObjectives = Array.isArray(safePlan.objectives) ? JSON.parse(JSON.stringify(safePlan.objectives)) : [];
        
        // 🔧 修复：确保所有必需字段都有有效值，防止 Sequelize 模型初始化错误
        const courseName = safePlan.title || '未命名课程';
        const courseDescription = safePlan.description || '';
        const courseAgeGroup = safePlan.ageGroup || ageGroup || '4-5岁';
        const courseStyle = safePlan.style || '';
        const courseColorScheme = safePlan.colorScheme || '';
        
        console.log('📝 [A2UI保存] 课程名称:', courseName, ', 活动数:', cleanActivities.length, ', 目标数:', cleanObjectives.length);
        
        // 构建课程数据
        const createData = {
          creatorId: userId,
          kindergartenId: (req as any).user?.kindergartenId || null,
          name: String(courseName),
          description: String(courseDescription),
          domain: mappedDomain,
          ageGroup: String(courseAgeGroup),
          htmlCode: '',
          cssCode: '',
          jsCode: '',
          status: 'draft',
          curriculumType: 'a2ui',
          viewCount: 0,
          useCount: 0,
          isPublic: false,
          schedule: null,
          tags: null,
          thumbnail: thumbnailUrl,  // 使用转存后的缩略图URL
          remark: null,
          media: JSON.parse(JSON.stringify({
            images: cleanImages,  // 使用转存后的图片URL
            video: null
          })),
          metadata: JSON.parse(JSON.stringify({
            generatedAt: new Date().toISOString(),
            mode: 'a2ui-stream',
            models: {
              text: 'doubao-seed-1-6-thinking-250615',
              image: 'doubao-seedream-4-5-251128'
            },
            status: 'completed',
            progress: 100
          })),
          courseAnalysis: JSON.parse(JSON.stringify({
            title: courseName,
            objectives: cleanObjectives,
            style: courseStyle,
            colorScheme: courseColorScheme,
            activities: cleanActivities
          }))
        };
        
        // 使用 Repository 保存课程
        const { createCurriculumWithRawSQL } = await import('../repositories/creative-curriculum.repository');
        const finalCurriculumId = await createCurriculumWithRawSQL(createData);

        // 发送最终完成信号 - 不再依赖findByPk
        res.write(`data: ${JSON.stringify({
          type: 'finished',
          curriculumId: finalCurriculumId,
          plan: plan,
          message: '🎉 课程生成完成！',
          timestamp: new Date().toISOString()
        })}\n\n`);

        console.log(`✅ [A2UI搭积木] 课程生成完成，ID: ${finalCurriculumId}`);
        res.end();

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error && error.stack ? error.stack : '';
        console.error(`❌ [A2UI搭积木] 生成失败:`, errorMessage);
        console.error(`❌ [A2UI搭积木] 错误堆栈:`, errorStack);
        console.error(`❌ [A2UI搭积木] 完整错误对象:`, error);

        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: `[A2UI路由Catch] 生成失败: ${errorMessage}`,
          stack: errorStack ? errorStack.substring(0, 500) : '',
          timestamp: new Date().toISOString()
        })}\n\n`);

        res.end();
      }
    })();

    // 处理客户端断开连接
    req.on('close', () => {
      console.log(`🔌 [A2UI搭积木] 客户端断开：taskId=${taskId}`);
    });

  } catch (error) {
    console.error('❌ [A2UI搭积木] 处理失败:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'A2UI流式处理失败'
      });
    } else {
      res.end();
    }
  }
});

/**
 * GET /api/interactive-curriculum/thinking-stream/:taskId
 * SSE 流式获取 AI Think 的思考过程（兼容旧版本）
 * 实时推送 Think 模型的思考内容
 * 注意：SSE 连接不需要认证中间件，因为 EventSource 无法传递自定义 headers
*/
router.get('/thinking-stream/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    // 设置 SSE 响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    console.log(`🌊 [Think SSE] 客户端连接：taskId=${taskId}`);

    // 发送连接确认
    res.write(`data: ${JSON.stringify({
      type: 'connected',
      taskId,
      timestamp: new Date().toISOString(),
      message: '已建立实时连接，等待 Think 思考过程...'
    })}\n\n`);

    // 从 Redis 获取已保存的 Think 思考过程
    const savedThinking = await interactiveCurriculumService.getThinkingProcess(taskId);
    if (savedThinking) {
      res.write(`data: ${JSON.stringify({
        type: 'thinking',
        content: savedThinking,
        timestamp: new Date().toISOString()
      })}\n\n`);
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        message: 'Think 思考过程已完成',
        timestamp: new Date().toISOString()
      })}\n\n`);
      res.end();
      return;
    }

    // 如果还没有保存，定期检查 Redis 中的数据
    let checkCount = 0;
    const maxChecks = 120; // 最多检查 120 次（2 分钟，每次 1 秒）

    const checkInterval = setInterval(async () => {
      checkCount++;

      try {
        const thinkingProcess = await interactiveCurriculumService.getThinkingProcess(taskId);

        if (thinkingProcess) {
          // 发送思考过程
          res.write(`data: ${JSON.stringify({
            type: 'thinking',
            content: thinkingProcess,
            timestamp: new Date().toISOString()
          })}\n\n`);

          // 发送完成事件
          res.write(`data: ${JSON.stringify({
            type: 'complete',
            message: 'Think 思考过程已完成',
            timestamp: new Date().toISOString()
          })}\n\n`);

          clearInterval(checkInterval);
          res.end();
        } else if (checkCount >= maxChecks) {
          // 超时
          res.write(`data: ${JSON.stringify({
            type: 'timeout',
            message: 'Think 思考过程获取超时',
            timestamp: new Date().toISOString()
          })}\n\n`);

          clearInterval(checkInterval);
          res.end();
        }
      } catch (error) {
        console.error('❌ [Think SSE] 检查思考过程失败:', error);
        clearInterval(checkInterval);
        res.end();
      }
    }, 1000); // 每 1 秒检查一次

    // 处理客户端断开连接
    req.on('close', () => {
      console.log(`🌊 [Think SSE] 客户端断开连接：taskId=${taskId}`);
      clearInterval(checkInterval);
    });

  } catch (error) {
    console.error('❌ [互动课程] Think SSE 流式处理失败:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Think SSE 流式处理失败'
      });
    } else {
      res.end();
    }
  }
});

/**
 * GET /api/interactive-curriculum/:id
 * 获取课程详情
*/
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    // 使用 Repository 获取课程
    const { findCurriculumById, incrementViewCount } = await import('../repositories/creative-curriculum.repository');
    const curriculum = await findCurriculumById(Number(id));
    if (!curriculum) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 权限检查
    if (!curriculum.isPublic && curriculum.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权限查看此课程'
      });
    }

    // 增加浏览次数
    await incrementViewCount(Number(id));

    res.json({
      success: true,
      data: curriculum
    });
  } catch (error) {
    console.error('❌ [互动课程] 获取课程失败:', error);
    res.status(500).json({
      success: false,
      message: '获取课程失败'
    });
  }
});

/**
 * POST /api/interactive-curriculum/:id/save
 * 保存课程（更新）
*/
router.post('/:id/save', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { name, description, domain, ageGroup, htmlCode, cssCode, jsCode, status, isPublic } = req.body;

    // 使用 Repository 获取和更新课程
    const { findCurriculumById, updateCurriculumById } = await import('../repositories/creative-curriculum.repository');
    const curriculum = await findCurriculumById(Number(id));
    if (!curriculum) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 权限检查
    if (curriculum.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权限修改此课程'
      });
    }

    // 更新课程
    await updateCurriculumById(Number(id), {
      name,
      description,
      domain,
      ageGroup,
      htmlCode,
      cssCode,
      jsCode,
      status,
      isPublic
    } as any);

    // 获取更新后的课程
    const updatedCurriculum = await findCurriculumById(Number(id));

    res.json({
      success: true,
      message: '课程已保存',
      data: updatedCurriculum
    });
  } catch (error) {
    console.error('❌ [互动课程] 保存课程失败:', error);
    res.status(500).json({
      success: false,
      message: '保存课程失败'
    });
  }
});

export default router;

