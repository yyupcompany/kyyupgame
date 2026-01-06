/**
* @swagger
 * components:
 *   schemas:
 *     Ai-assistant-optimized:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Ai-assistant-optimized ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Ai-assistant-optimized 名称
 *           example: "示例Ai-assistant-optimized"
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
 *     CreateAi-assistant-optimizedRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-assistant-optimized 名称
 *           example: "新Ai-assistant-optimized"
 *     UpdateAi-assistant-optimizedRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-assistant-optimized 名称
 *           example: "更新后的Ai-assistant-optimized"
 *     Ai-assistant-optimizedListResponse:
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
 *                 $ref: '#/components/schemas/Ai-assistant-optimized'
 *         message:
 *           type: string
 *           example: "获取ai-assistant-optimized列表成功"
 *     Ai-assistant-optimizedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Ai-assistant-optimized'
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
 * ai-assistant-optimized管理路由文件
 * 提供ai-assistant-optimized的基础CRUD操作
*
 * 功能包括：
 * - 获取ai-assistant-optimized列表
 * - 创建新ai-assistant-optimized
 * - 获取ai-assistant-optimized详情
 * - 更新ai-assistant-optimized信息
 * - 删除ai-assistant-optimized
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 优化后的AI助手路由配置
 * 提供三级分层处理的API接口
*/

import { Router, Request, Response, NextFunction } from 'express';
import { aiAssistantOptimizedController } from '../controllers/ai-assistant-optimized.controller';
import { checkPermission, verifyToken } from '../middlewares/auth.middleware';
import { body, validationResult } from 'express-validator';
import { directResponseService } from '../services/ai/direct-response.service';
import { queryRouterService } from '../services/ai/query-router.service';

const router = Router();

// 应用认证中间件
router.use(verifyToken);

// 验证中间件
const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: '请求参数验证失败',
      errors: errors.array()
    });
    return;
  }
  next();
};

/**
* @swagger
 * /api/ai-assistant-optimized/query:
 *   post:
 *     summary: 优化后的AI查询接口
 *     description: 提供三级分层处理的AI查询功能
 *     tags:
 *       - AI助手优化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - conversationId
 *             properties:
 *               query:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: 查询内容
 *               conversationId:
 *                 type: string
 *                 description: 会话ID
 *               userId:
 *                 type: integer
 *                 description: 用户ID（可选）
 *     responses:
 *       200:
 *         description: 查询成功
 *       400:
 *         description: 请求参数验证失败
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/query', [
  // 权限检查
  checkPermission('AI_ASSISTANT_OPTIMIZED_QUERY'),
  // 请求验证
  body('query')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('查询内容必须是1-1000字符的字符串'),
  body('conversationId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('会话ID不能为空'),
  // userId 由认证中间件提供，不再从body强制校验
  body('userId').optional().isInt({ min: 1 }).withMessage('用户ID必须是正整数'),
  validateRequest
], async (req, res) => {
  await aiAssistantOptimizedController.handleOptimizedQuery(req, res);
});

/**
* @swagger
 * /api/ai-assistant-optimized/stats:
 *   get:
 *     summary: 获取性能统计
 *     description: 获取AI助手的性能统计数据
 *     tags:
 *       - AI助手优化
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/stats', [
  checkPermission('AI_ASSISTANT_OPTIMIZED_PERFORMANCE')
], async (req, res) => {
  await aiAssistantOptimizedController.getPerformanceStats(req, res);
});

/**
* @swagger
 * /api/ai-assistant-optimized/test-direct:
 *   post:
 *     summary: 测试直接响应功能
 *     description: 测试AI助手的直接响应功能
 *     tags:
 *       - AI助手优化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 description: 操作类型
 *     responses:
 *       200:
 *         description: 测试成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/test-direct', [
  checkPermission('AI_ASSISTANT_OPTIMIZED_TEST'),
  body('action')
    .isString()
    .isIn([
      // 原有功能
      'count_students',
      'count_teachers',
      'get_today_activities',
      'navigate_to_student_create',
      'navigate_to_student_list',
      'navigate_to_class_management',
      'get_attendance_stats',
      'get_fee_stats',
      'get_activity_list',

      // 家长管理
      'count_parents',
      'navigate_to_parent_list',
      'navigate_to_parent_create',

      // 班级管理扩展
      'count_classes',
      'navigate_to_class_list',
      'navigate_to_class_create',

      // 招生管理
      'get_enrollment_stats',
      'navigate_to_enrollment_plans',
      'navigate_to_enrollment_applications',
      'navigate_to_enrollment_consultations',

      // 用户权限管理
      'count_users',
      'navigate_to_user_list',
      'navigate_to_role_management',
      'navigate_to_permission_settings',

      // 营销管理
      'get_customer_stats',
      'navigate_to_marketing_campaigns',
      'navigate_to_customer_pool',

      // 系统管理
      'navigate_to_system_settings',
      'navigate_to_operation_logs',
      'get_system_status',

      // 绩效管理
      'get_performance_stats',
      'get_performance_report',
      'navigate_to_performance_evaluation',
      'navigate_to_performance_rules',
      'get_teacher_performance',
      'navigate_to_performance_management',

      // 通知消息
      'navigate_to_messages',
      'navigate_to_send_notification',
      'navigate_to_message_templates',
      'get_notification_stats',
      'get_unread_messages',
      'navigate_to_message_center',

      // 文件管理
      'navigate_to_files',
      'navigate_to_file_upload',
      'get_file_stats',
      'navigate_to_file_management',
      'get_storage_stats',
      'navigate_to_file_categories',

      // 任务管理
      'navigate_to_tasks',
      'navigate_to_create_task',
      'get_task_stats',
      'get_my_tasks',
      'navigate_to_task_templates',
      'navigate_to_task_management',

      // 测试扩展词汇 - 数据统计类
      'get_monthly_enrollment_data',
      'get_student_count_stats',
      'get_teacher_workload_stats',
      'get_activity_participation_stats',
      'get_fee_statistics',
      'get_class_size_distribution',
      'get_annual_enrollment_trends',
      'get_teacher_satisfaction_stats',
      'get_parent_feedback_stats',
      'get_system_usage_stats',

      // 测试扩展词汇 - 导航类
      'navigate_to_finance_center',
      'navigate_to_data_analytics',
      'navigate_to_report_center',
      'navigate_to_attendance_management',
      'navigate_to_course_schedule',
      'navigate_to_parent_communication',
      'navigate_to_security_management',
      'navigate_to_equipment_management',

      // 测试扩展词汇 - 操作类
      'batch_import_students',
      'generate_monthly_report',
      'send_parent_notifications',
      'backup_system_data',
      'clear_system_cache',
      'export_student_list',
      'reset_user_passwords',

      // 测试扩展词汇 - 查询类
      'get_today_schedule',
      'get_leave_applications',
      'get_pending_approvals',
      'get_latest_announcements',
      'get_system_update_logs',

      // 新增扩展词汇 - 招生相关
      'get_daily_enrollment_data',
      'get_weekly_enrollment_data',
      'get_yearly_enrollment_data',
      'get_enrollment_application_count',
      'get_pending_enrollment_data',
      'get_approved_enrollment_data',
      'get_enrollment_conversion_rate',
      'get_successful_enrollment_count',

      // 新增扩展词汇 - 活动相关
      'get_daily_activity_count',
      'get_weekly_activity_schedule',
      'get_monthly_activity_stats',
      'get_activity_registration_count',
      'get_activity_checkin_count',
      'get_ongoing_activities',
      'get_upcoming_activities',
      'get_activity_completion_rate',

      // 新增扩展词汇 - 学生相关
      'get_total_student_count',
      'get_active_student_count',
      'get_male_student_count',
      'get_female_student_count',
      'get_new_student_count',
      'get_graduate_count',

      // 新增扩展词汇 - 时间维度
      'get_daily_summary',
      'get_weekly_summary',
      'get_monthly_summary',
      'get_yearly_summary',

      // 新增扩展词汇 - 教师相关
      'get_teacher_count',
      'get_active_teacher_count',
      'get_teacher_attendance_rate',

      // 新增扩展词汇 - 班级相关
      'get_class_count',
      'get_class_capacity',
      'get_available_seats',

      // 新增扩展词汇 - 财务相关
      'get_total_revenue',
      'get_monthly_revenue',
      'get_payment_rate',

      // 新增扩展词汇 - 综合查询
      'get_data_overview',
      'get_operation_metrics',
      'get_key_metrics'
    ])
    .withMessage('无效的动作类型'),
  body('query')
    .isString()
    .isLength({ min: 1 })
    .withMessage('查询内容不能为空'),
  validateRequest
], async (req, res) => {
  try {
    const { action, query } = req.body;
    // 使用文件顶部静态导入的 directResponseService
    
    const result = await directResponseService.executeDirectAction(action, query);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '测试直接响应失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /api/ai-assistant-optimized/test-route:
 *   post:
 *     summary: 测试查询路由功能
 *     description: 测试AI查询路由功能
 *     tags:
 *       - AI助手优化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: 测试成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/test-route', [
  checkPermission('AI_ASSISTANT_OPTIMIZED_TEST'),
  body('query')
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('查询内容必须是1-500字符的字符串'),
  validateRequest
], async (req, res) => {
  try {
    const { query } = req.body;
    // 使用文件顶部静态导入的 queryRouterService
    
    const routeResult = await queryRouterService.routeQuery(query);
    
    res.json({
      success: true,
      data: routeResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '测试查询路由失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /api/ai-assistant-optimized/keywords:
 *   get:
 *     summary: 获取关键词词典
 *     description: 获取AI助手的关键词词典统计信息
 *     tags:
 *       - AI助手优化
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/keywords', [
  checkPermission('AI_ASSISTANT_OPTIMIZED_CONFIG')
], async (req, res) => {
  try {
    // 使用文件顶部静态导入的 queryRouterService
    const stats = queryRouterService.getStats();
    
    res.json({
      success: true,
      data: {
        message: '关键词词典统计信息',
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取关键词词典失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /api/ai-assistant-optimized/health:
 *   get:
 *     summary: 健康检查
 *     description: 检查AI助手服务的健康状态
 *     tags:
 *       - AI助手优化
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 服务健康
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     version:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/health', [
  checkPermission('AI_ASSISTANT_OPTIMIZED_VIEW')
], (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      features: {
        directResponse: true,
        semanticRouting: true,
        complexAnalysis: true,
        performanceTracking: true
      }
    }
  });
});

export default router;
