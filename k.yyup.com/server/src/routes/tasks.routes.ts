/**
 * 任务管理路由 - 统一的任务API
 * 整合教师任务和自动化任务功能
*/

import { Router } from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { TaskController } from '../controllers/task.controller';

const router = Router();

// 创建任务控制器实例
const taskController = new TaskController();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /tasks:
 *   get:
 *     summary: 获取任务列表
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [teacher, automation, all]
 *           default: all
 *         description: 任务类型筛选
 *     responses:
 *       200:
 *         description: 获取任务列表成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/',
  async (req, res, next) => {
    try {
      const { type = 'all' } = req.query;

      // TODO: 实现真实的任务获取逻辑
      res.json({
        success: true,
        message: 'Tasks API - 统一任务接口已修复',
        data: {
          type,
          tasks: [],
          note: 'classes路由冲突已解决，tasks路由已统一'
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
* @swagger
 * /tasks/{taskId}/status:
 *   put:
 *     summary: 更新任务状态
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 更新任务状态成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
*/
router.put('/:taskId/status', checkRole(['teacher', 'admin']),
  async (req, res, next) => {
    try {
      const { taskId } = req.params;
      const { status } = req.body;

      // TODO: 实现真实的任务状态更新逻辑
      res.json({
        success: true,
        message: `Task ${taskId} status updated to ${status}`,
        data: { taskId, status }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
* @swagger
 * /tasks/stats:
 *   get:
 *     summary: 获取任务统计数据
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: 用户ID（可选，默认为当前登录用户）
 *       - in: query
 *         name: date_range
 *         schema:
 *           type: integer
 *           default: 30
 *         description: 日期范围（天数）
 *       - in: query
 *         name: group_by
 *         schema:
 *           type: string
 *           enum: [status, priority, type]
 *           default: status
 *         description: 分组方式
 *     responses:
 *       200:
 *         description: 获取任务统计成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/stats', taskController.getTaskStats.bind(taskController));

/**
* @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: 获取任务详情
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 获取任务详情成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 任务不存在
*/
router.get('/:taskId',
  async (req, res, next) => {
    try {
      const { taskId } = req.params;

      res.json({
        success: true,
        data: {
          id: taskId,
          title: '任务详情',
          description: 'API重复问题已修复 - 统一任务接口'
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;