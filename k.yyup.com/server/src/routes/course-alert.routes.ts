/**
 * 课程告警路由
 * 提供告警查询、处理和统计API
 */

import { Router, Request, Response } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { CourseAlertService } from '../services/course-alert.service';

const router = Router();

// 应用认证中间件
router.use(verifyToken);

/**
 * @route   GET /api/course-alerts/stats
 * @desc    获取告警统计数据
 * @access  Admin, Principal
 */
router.get('/stats',
  requireRole(['admin', 'principal']),
  async (req: Request, res: Response) => {
    try {
      const stats = await CourseAlertService.getAlertStats();
      res.json({
        success: true,
        message: '获取告警统计成功',
        data: stats
      });
    } catch (error) {
      console.error('获取告警统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取告警统计失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

/**
 * @route   POST /api/course-alerts/check
 * @desc    手动触发告警检查
 * @access  Admin
 */
router.post('/check',
  requireRole(['admin']),
  async (req: Request, res: Response) => {
    try {
      const result = await CourseAlertService.checkAllDelayedCourses();
      res.json({
        success: true,
        message: '告警检查完成',
        data: result
      });
    } catch (error) {
      console.error('告警检查失败:', error);
      res.status(500).json({
        success: false,
        message: '告警检查失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

/**
 * @route   PUT /api/course-alerts/:scheduleId/dismiss
 * @desc    标记告警已处理
 * @access  Admin, Principal, Teacher
 */
router.put('/:scheduleId/dismiss',
  requireRole(['admin', 'principal', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      const { scheduleId } = req.params;
      const { notes } = req.body;

      const result = await CourseAlertService.dismissAlert(parseInt(scheduleId), notes);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: '排期不存在'
        });
      }

      res.json({
        success: true,
        message: '告警已处理'
      });
    } catch (error) {
      console.error('处理告警失败:', error);
      res.status(500).json({
        success: false,
        message: '处理告警失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

/**
 * @route   GET /api/course-alerts/my-count
 * @desc    获取当前教师的待处理告警数量
 * @access  Teacher
 */
router.get('/my-count',
  requireRole(['teacher', 'admin', 'principal']),
  async (req: Request, res: Response) => {
    try {
      const teacherId = req.user?.id;

      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const count = await CourseAlertService.getTeacherAlertCount(teacherId);

      res.json({
        success: true,
        message: '获取告警数量成功',
        data: { count }
      });
    } catch (error) {
      console.error('获取告警数量失败:', error);
      res.status(500).json({
        success: false,
        message: '获取告警数量失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

export default router;


