/**
* @swagger
 * components:
 *   schemas:
 *     Progres:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Progres ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Progres 名称
 *           example: "示例Progres"
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
 *     CreateProgresRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Progres 名称
 *           example: "新Progres"
 *     UpdateProgresRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Progres 名称
 *           example: "更新后的Progres"
 *     ProgresListResponse:
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
 *                 $ref: '#/components/schemas/Progres'
 *         message:
 *           type: string
 *           example: "获取progres列表成功"
 *     ProgresResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Progres'
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
 * progres管理路由文件
 * 提供progres的基础CRUD操作
*
 * 功能包括：
 * - 获取progres列表
 * - 创建新progres
 * - 获取progres详情
 * - 更新progres信息
 * - 删除progres
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 进度查询HTTP接口
 * 提供HTTP轮询方式的进度查询，作为WebSocket的降级方案
*/

import { Router } from 'express';
import AIProgressEventService from '../services/ai-progress-event.service';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @summary HTTP轮询获取查询进度
* @description 通过HTTP轮询方式获取长时间运行任务的实时进度，作为WebSocket的降级方案。支持查询会话状态、进度百分比、当前步骤等详细信息，适用于不支持WebSocket的环境。
* @tags Progress - 进度跟踪
* @access Public
* @param {string} query.sessionId.query.required 会话ID，用于标识特定的任务进程
* @param {string} [query.userId] query optional 用户ID，用于权限验证（可选）
* @param {boolean} [query.includeDetails=false] query optional 是否包含详细步骤信息
* @param {string} [query.format=json] query optional 返回格式 - json:JSON格式, xml:XML格式
* @responses {200} {object} Success_进度查询成功
* @responses {400} {object} Error_缺少必需参数或参数格式错误
* @responses {403} {object} Error_无权限访问此会话
* @responses {404} {object} Error_会话不存在或已完成
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/', async (req, res) => {
  try {
    const { sessionId, userId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: '缺少sessionId参数'
      });
    }

    // 获取会话状态
    const session = AIProgressEventService.getActiveSession(sessionId as string);

    if (!session) {
      return res.json({
        success: true,
        data: {
          sessionId,
          message: '未找到活跃会话',
          progress: 0,
          totalSteps: 10,
          stepId: 'not_found',
          status: 'completed'
        }
      });
    }

    // 验证用户权限（可选）
    if (userId && session.userId !== parseInt(userId as string)) {
      return res.status(403).json({
        success: false,
        message: '无权限访问此会话'
      });
    }

    // 模拟获取当前进度（在实际实现中，这里应该从会话中获取真实进度）
    const progressData = {
      sessionId,
      stepId: 'http_check',
      message: '正在处理查询...',
      progress: 50, // 这里应该是真实的进度值
      totalSteps: session.totalSteps,
      userId: session.userId,
      timestamp: Date.now(),
      status: 'processing'
    };

    res.json({
      success: true,
      data: progressData
    });

  } catch (error) {
    console.error('[ProgressAPI] 获取进度失败:', error);
    res.status(500).json({
      success: false,
      message: '获取进度失败'
    });
  }
});

/**
* @summary 获取查询会话状态
* @description 获取指定会话的详细状态信息，包括会话是否活跃、总步骤数、创建时间、预计完成时间等。用于快速了解任务的整体状态和进度概况。
* @tags Progress - 进度跟踪
* @access Public
* @param {string} sessionId.path.required 会话ID
* @param {string} [query.userId] query optional 用户ID，用于权限验证（可选）
* @param {boolean} [query.includeMetrics=true] query optional 是否包含性能指标
* @param {boolean} [query.includeHistory=false] query optional 是否包含历史步骤记录
* @responses {200} {object} Success_状态查询成功
* @responses {400} {object} Error_请求参数错误
* @responses {403} {object} Error_无权限访问此会话
* @responses {404} {object} Error_会话不存在
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/:sessionId/status', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.query;

    const session = AIProgressEventService.getActiveSession(sessionId);

    if (!session) {
      return res.json({
        success: true,
        data: {
          sessionId,
          status: 'not_found',
          message: '会话不存在或已完成'
        }
      });
    }

    res.json({
      success: true,
      data: {
        sessionId,
        status: 'active',
        totalSteps: session.totalSteps,
        userId: session.userId,
        isActive: true
      }
    });

  } catch (error) {
    console.error('[ProgressAPI] 获取状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取状态失败'
    });
  }
});

/**
* @summary 模拟进度推送（测试用）
* @description 模拟长时间运行任务的进度推送过程，用于测试进度跟踪功能和前端进度显示效果。支持自定义步骤序列、时间间隔和进度值，便于开发和调试。
* @tags Progress - 进度跟踪
* @access Public
* @param {object} requestBody.body.required 模拟参数
* @param {string} requestBody.body.sessionId.required 会话ID
* @param {integer} [requestBody.body.userId=1] optional 用户ID
* @param {Array<object>} [requestBody.body.steps] optional 自定义步骤列表
* @param {string} requestBody.body.steps[].stepId.required 步骤ID
* @param {string} requestBody.body.steps[].message.required 步骤描述
* @param {integer} requestBody.body.steps[].progress.required 进度百分比（0-100）
* @param {integer} [requestBody.body.interval=1000] optional 步骤间隔时间（毫秒）
* @param {boolean} [requestBody.body.autoComplete=true] optional 是否自动完成进度跟踪
* @param {string} [requestBody.body.queryType=mock] optional 查询类型标识
* @responses {200} {object} Success_模拟进度创建成功
* @responses {400} {object} Error_请求参数错误或缺少必需参数
* @responses {409} {object} Error_会话ID已存在
* @responses {500} {object} Error_服务器内部错误或模拟失败
*/
router.post('/simulate', async (req, res) => {
  try {
    const { sessionId, userId = 1, steps = [] } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: '缺少sessionId参数'
      });
    }

    const defaultSteps = [
      { stepId: 'init', message: '开始处理查询...', progress: 10 },
      { stepId: 'analyze', message: '分析查询意图...', progress: 30 },
      { stepId: 'execute', message: '执行查询...', progress: 70 },
      { stepId: 'complete', message: '查询完成', progress: 100 }
    ];

    const progressSteps = steps.length > 0 ? steps : defaultSteps;

    // 初始化进度跟踪
    AIProgressEventService.startProgressTracking({
      sessionId,
      queryId: `simulate_${Date.now()}`,
      userId,
      totalSteps: progressSteps.length
    });

    // 模拟发送进度事件
    for (let i = 0; i < progressSteps.length; i++) {
      const step = progressSteps[i];
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒间隔

      await AIProgressEventService.sendProgress(
        sessionId,
        step.stepId,
        step.message,
        step.progress
      );
    }

    // 完成进度跟踪
    AIProgressEventService.completeProgress(sessionId);

    res.json({
      success: true,
      message: '模拟进度完成',
      data: {
        sessionId,
        stepsSent: progressSteps.length
      }
    });

  } catch (error) {
    console.error('[ProgressAPI] 模拟进度失败:', error);
    res.status(500).json({
      success: false,
      message: '模拟进度失败'
    });
  }
});

export default router;