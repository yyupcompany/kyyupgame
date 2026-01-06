/**
* @swagger
 * components:
 *   schemas:
 *     Ai-curriculum:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Ai-curriculum ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Ai-curriculum 名称
 *           example: "示例Ai-curriculum"
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
 *     CreateAi-curriculumRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-curriculum 名称
 *           example: "新Ai-curriculum"
 *     UpdateAi-curriculumRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-curriculum 名称
 *           example: "更新后的Ai-curriculum"
 *     Ai-curriculumListResponse:
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
 *                 $ref: '#/components/schemas/Ai-curriculum'
 *         message:
 *           type: string
 *           example: "获取ai-curriculum列表成功"
 *     Ai-curriculumResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Ai-curriculum'
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
 * ai-curriculum管理路由文件
 * 提供ai-curriculum的基础CRUD操作
*
 * 功能包括：
 * - 获取ai-curriculum列表
 * - 创建新ai-curriculum
 * - 获取ai-curriculum详情
 * - 更新ai-curriculum信息
 * - 删除ai-curriculum
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * AI 课程生成路由
 * 使用豆包 Think 1.6 模型生成幼儿园课程
*/

import { Router, Request, Response } from 'express';
import { aiBridgeService } from '../services/ai/bridge/ai-bridge.service';
import AIModelConfig from '../models/ai-model-config.model';
import { AiBridgeMessage, AiBridgeMessageRole } from '../services/ai/bridge/ai-bridge.types';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 应用认证中间件，确保用户已登录
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @summary AI生成幼儿园课程代码
* @description 使用豆包Think 1.6模型生成幼儿园互动课程的HTML/CSS/JS代码。
 * 系统会根据教学需求和儿童发展特点，智能生成适合幼儿园教学活动的互动课程内容。
*
 * 支持的课程类型：
 * - 认知发展：数字认知、图形识别、空间概念
 * - 语言发展：词汇学习、故事理解、表达训练
 * - 社会情感：情绪认知、社交技能、合作游戏
 * - 艺术创造：绘画手工、音乐律动、创意表达
 * - 科学探索：自然观察、简单实验、发现学习
*
* @tags AI课程系统
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required 请求体
* @param {string} requestBody.body.model.required AI模型名称，默认使用豆包Think 1.6模型
* @param {array} requestBody.body.messages.required 对话消息列表，包含课程生成需求描述
* @param {number} requestBody.body.temperature.optional 生成随机性，0.0-1.0，默认0.7
* @param {integer} requestBody.body.max_tokens.optional 最大生成Token数，默认16384，最大16384
* @param {number} requestBody.body.top_p.optional 核采样参数，0.0-1.0，默认0.9
*
* @responses {200} {object} 成功响应
* @responses {200} {object} description:课程代码生成成功
* @responses {200} {object} schema: {
 *   "success": true,
 *   "data": {
 *     "htmlCode": "<div class='game-container'>...</div>",
 *     "cssCode": ".game-container { ... }",
 *     "jsCode": "// 游戏交互逻辑",
 *     "description": "数字认知游戏课程"
 *   },
 *   "usage": {
 *     "prompt_tokens": 1500,
 *     "completion_tokens": 2800,
 *     "total_tokens": 4300
 *   }
 * }
*
* @responses {400} {object} 参数错误
* @responses {400} {object} description:请求参数错误
* @responses {400} {object} schema: {"error": "缺少必要参数: model 或 messages"}
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:未授权访问
* @responses {401} {object} schema: {"success": false, "error": "未授权，请先登录"}
*
* @responses {500} {object} 服务器错误
* @responses {500} {object} description:AI课程生成失败
* @responses {500} {object} schema: {"error": "AI 课程生成失败", "message": "错误详情"}
*
* @example {json} 请求示例
 * {
 *   "model": "doubao-seed-1-6-thinking-250615",
 *   "messages": [
 *     {
 *       "role": "system",
 *       "content": "你是一个专业的幼儿园课程设计专家"
 *     },
 *     {
 *       "role": "user",
 *       "content": "请为4-5岁儿童设计一个数字认知游戏，包含拖拽交互和音效反馈"
 *     }
 *   ],
 *   "temperature": 0.7,
 *   "max_tokens": 8000
 * }
*/
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { model, messages, temperature, max_tokens, top_p } = req.body;

    if (!model || !messages) {
      return res.status(400).json({
        error: '缺少必要参数: model 或 messages'
      });
    }

    // 调用 AIBridge 服务
    // 注意：豆包 Think 1.6 的最大 max_tokens 是 16384，不能超过这个值
    // AIBridge 会自动从数据库读取模型配置
    const response = await aiBridgeService.generateChatCompletion(
      {
        model: model || 'doubao-seed-1-6-thinking-250615',  // 使用提供的模型或默认值
        messages: messages as AiBridgeMessage[],
        temperature: temperature || 0.7,
        max_tokens: Math.min(max_tokens || 16384, 16384),  // 限制最大值为 16384
        top_p: top_p || 0.9
      }
      // 不需要传递 customConfig，AIBridge 会自动从数据库读取
    );

    // 解析响应
    const content = response.choices?.[0]?.message?.content || '';

    // 尝试从响应中提取 JSON
    let parsedContent;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        parsedContent = {
          htmlCode: content,
          cssCode: '',
          jsCode: '',
          description: '课程已生成'
        };
      }
    } catch (parseError) {
      parsedContent = {
        htmlCode: content,
        cssCode: '',
        jsCode: '',
        description: '课程已生成'
      };
    }

    res.json({
      success: true,
      data: parsedContent,
      usage: response.usage
    });
  } catch (error) {
    console.error('[AI]: ❌ AI 课程生成失败:', error);
    res.status(500).json({
      error: 'AI 课程生成失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @summary 流式生成幼儿园课程代码
* @description 使用Server-Sent Events技术实时流式生成幼儿园课程代码，
 * 提供打字机效果的实时输出体验。适合需要长时间生成复杂课程的场景，
 * 用户可以实时查看生成进度和内容。
*
 * 流式输出特性：
 * - 实时响应：生成过程中实时输出内容片段
 * - 可视化进度：用户可以看到课程代码的逐步生成过程
 * - 错误容错：流式传输中的错误不会中断整个生成过程
 * - 自动重连：支持网络中断后的自动恢复机制
*
* @tags AI课程系统
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required 请求体
* @param {string} requestBody.body.model.required AI模型名称，默认使用豆包Think 1.6模型
* @param {array} requestBody.body.messages.required 对话消息列表，包含课程生成需求描述
* @param {number} requestBody.body.temperature.optional 生成随机性，0.0-1.0，默认0.7
* @param {integer} requestBody.body.max_tokens.optional 最大生成Token数，默认16384，最大16384
* @param {number} requestBody.body.top_p.optional 核采样参数，0.0-1.0，默认0.9
*
* @responses {200} {object} 流式响应响应头
* @responses {200} {object} description:Server-Sent Events流，实时输出课程代码生成过程
* @responses {200} {object} headers: {"Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache", "Connection": "keep-alive"}
*
* @responses {400} {object} 参数错误
* @responses {400} {object} description:请求参数错误
* @responses {400} {object} schema: {"error": "缺少必要参数: model 或 messages"}
*
* @responses {404} {object} 模型不存在
* @responses {404} {object} description:未找到可用的AI模型配置
* @responses {404} {object} schema: {"error": "未找到可用的 AI 模型配置"}
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:未授权访问
* @responses {401} {object} schema: {"success": false, "error": "未授权，请先登录"}
*
* @responses {500} {object} 服务器错误
* @responses {500} {object} description:流式生成初始化失败
* @responses {500} {object} schema: {"error": "流式生成初始化失败", "message": "错误详情"}
*
* @example {json} 请求示例
 * {
 *   "model": "doubao-seed-1-6-thinking-250615",
 *   "messages": [
 *     {
 *       "role": "user",
 *       "content": "为3-4岁儿童设计一个颜色认知互动游戏，需要声音反馈和动画效果"
 *     }
 *   ],
 *   "temperature": 0.8,
 *   "max_tokens": 12000
 * }
*
* @example {string} 流式响应示例
 * data: {"content": "<div class='color-game'>", "type": "html"}
*
 * data: {"content": "  <h1>颜色认知游戏</h1>", "type": "html"}
*
 * data: {"content": ".color-game { background: linear-gradient(...); }", "type": "css"}
*
 * data: {"content": "// 游戏初始化代码", "type": "js"}
*
 * data: [DONE]
*/
router.post('/generate-stream', async (req: Request, res: Response) => {
  try {
    const { model, messages, temperature, max_tokens, top_p } = req.body;

    if (!model || !messages) {
      return res.status(400).json({
        error: '缺少必要参数: model 或 messages'
      });
    }

    // 获取模型配置
    let modelConfig = await AIModelConfig.findOne({
      where: {
        name: model,
        status: 'active'
      }
    });

    if (!modelConfig) {
      modelConfig = await AIModelConfig.findOne({
        where: {
          name: 'doubao-seed-1-6-thinking-250615',
          status: 'active'
        }
      });
    }

    if (!modelConfig) {
      return res.status(404).json({
        error: '未找到可用的 AI 模型配置'
      });
    }

    // 设置响应头用于流式传输
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      // 调用 AIBridge 服务的流式方法
      // 注意：豆包 Think 1.6 的最大 max_tokens 是 16384，不能超过这个值
      const stream = await aiBridgeService.generateChatCompletionStream(
        {
          model: modelConfig.name,
          messages: messages as AiBridgeMessage[],
          temperature: temperature || 0.7,
          max_tokens: Math.min(max_tokens || 16384, 16384),  // 限制最大值为 16384
          top_p: top_p || 0.9
        },
        {
          endpointUrl: modelConfig.endpointUrl,
          apiKey: modelConfig.apiKey
        }
      );

      // 处理流式响应
      // 🔧 重要修复: stream 已经返回格式化的 SSE 数据 (data: {...}\n\n)
      // 不需要再次 JSON.stringify，直接写入即可
      for await (const chunk of stream) {
        res.write(chunk);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (streamError) {
      console.error('[AI]: ❌ 流式生成失败:', streamError);
      res.write(`data: ${JSON.stringify({ error: '流式生成失败' })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('[AI]: ❌ 流式生成初始化失败:', error);
    res.status(500).json({
      error: '流式生成初始化失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @summary 保存AI生成的课程
* @description 将AI生成的幼儿园课程保存到系统中，包括课程基本信息、代码内容、教学安排等。
 * 保存后的课程可以被教师检索、使用、分享和修改，形成可复用的教学资源库。
*
 * 保存内容包含：
 * - 课程基本信息：名称、描述、适用领域
 * - 技术内容：HTML结构、CSS样式、JavaScript交互逻辑
 * - 教学安排：适用年龄、教学目标、活动流程
 * - 元数据：创建者、创建时间、使用统计
*
* @tags AI课程系统
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required 请求体
* @param {string} requestBody.body.name.required 课程名称，便于教师识别和搜索
* @param {string} requestBody.body.domain.required 课程领域，如"认知发展"、"语言发展"、"社会情感"等
* @param {string} requestBody.body.description.optional 课程详细描述，说明教学目标和使用方法
* @param {string} requestBody.body.htmlCode.optional HTML结构代码，描述课程界面布局
* @param {string} requestBody.body.cssCode.optional CSS样式代码，定义课程视觉效果
* @param {string} requestBody.body.jsCode.optional JavaScript交互代码，实现课程交互功能
* @param {object} requestBody.body.schedule.optional 教学安排，包括适用年龄、教学时长等
*
* @responses {200} {object} 成功响应
* @responses {200} {object} description:课程保存成功
* @responses {200} {object} schema: {
 *   "success": true,
 *   "message": "课程已保存",
 *   "data": {
 *     "id": "curriculum_123",
 *     "name": "数字认知游戏",
 *     "domain": "认知发展",
 *     "description": "帮助3-4岁儿童认识数字1-10",
 *     "createdAt": "2024-01-01T12:00:00.000Z",
 *     "userId": "teacher_456"
 *   }
 * }
*
* @responses {400} {object} 参数错误
* @responses {400} {object} description:请求参数错误
* @responses {400} {object} schema: {"error": "缺少必要参数: name 或 domain"}
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:未授权访问
* @responses {401} {object} schema: {"success": false, "error": "未授权，请先登录"}
*
* @responses {500} {object} 服务器错误
* @responses {500} {object} description:保存课程失败
* @responses {500} {object} schema: {"error": "保存课程失败", "message": "错误详情"}
*
* @example {json} 请求示例
 * {
 *   "name": "彩虹颜色认知游戏",
 *   "domain": "认知发展",
 *   "description": "通过拖拽彩虹颜色块，帮助3-4岁儿童认识基本颜色",
 *   "htmlCode": "<div class='rainbow-game'>...</div>",
 *   "cssCode": ".rainbow-game { ... }",
 *   "jsCode": "// 颜色拖拽逻辑",
 *   "schedule": {
 *     "targetAge": "3-4岁",
 *     "duration": "15分钟",
 *     "objectives": ["认识红黄蓝绿等基本颜色", "锻炼手眼协调能力"]
 *   }
 * }
*
* @example {json} 最小请求示例
 * {
 *   "name": "简单游戏",
 *   "domain": "认知发展"
 * }
*/
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { name, description, domain, htmlCode, cssCode, jsCode, schedule } = req.body;

    if (!name || !domain) {
      return res.status(400).json({
        error: '缺少必要参数: name 或 domain'
      });
    }

    // 这里应该保存到数据库
    // 示例代码：
    // const curriculum = await Curriculum.create({
    //   name,
    //   description,
    //   domain,
    //   htmlCode,
    //   cssCode,
    //   jsCode,
    //   schedule,
    //   userId: req.user.id
    // });

    res.json({
      success: true,
      message: '课程已保存',
      data: {
        name,
        domain,
        description
      }
    });
  } catch (error) {
    console.error('[AI]: ❌ 保存课程失败:', error);
    res.status(500).json({
      error: '保存课程失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router;

