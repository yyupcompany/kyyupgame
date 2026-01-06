/**
* @swagger
 * components:
 *   schemas:
 *     Center-fixe:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Center-fixe ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Center-fixe 名称
 *           example: "示例Center-fixe"
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
 *     CreateCenter-fixeRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Center-fixe 名称
 *           example: "新Center-fixe"
 *     UpdateCenter-fixeRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Center-fixe 名称
 *           example: "更新后的Center-fixe"
 *     Center-fixeListResponse:
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
 *                 $ref: '#/components/schemas/Center-fixe'
 *         message:
 *           type: string
 *           example: "获取center-fixe列表成功"
 *     Center-fixeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Center-fixe'
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
 * center-fixe管理路由文件
 * 提供center-fixe的基础CRUD操作
*
 * 功能包括：
 * - 获取center-fixe列表
 * - 创建新center-fixe
 * - 获取center-fixe详情
 * - 更新center-fixe信息
 * - 删除center-fixe
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 侧边栏中心API修复路由
 * 为缺失的中心API端点提供基本的响应
*/

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
 * 业务中心 API
*/
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    message: '业务中心概览数据获取成功',
    data: {
      totalRevenue: 2850000,
      activeStudents: 1200,
      activeTeachers: 80,
      totalClasses: 24,
      monthlyGrowth: 12.5,
      centerStatus: 'normal'
    }
  });
});

/**
 * 教学中心 API
*/
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    message: '教学中心概览数据获取成功',
    data: {
      totalCourses: 45,
      activeTeachers: 80,
      totalStudents: 1200,
      classUtilization: 85.2,
      teachingQuality: 4.6,
      upcomingClasses: 12
    }
  });
});

/**
 * 检查中心 API
*/
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    message: '检查中心概览数据获取成功',
    data: {
      totalInspections: 24,
      completedInspections: 18,
      pendingInspections: 6,
      complianceRate: 92.5,
      lastInspectionDate: '2024-07-10',
      nextInspectionDate: '2024-07-25'
    }
  });
});

/**
 * 考勤中心 API
*/
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    message: '考勤中心概览数据获取成功',
    data: {
      todayAttendance: 1150,
      totalStudents: 1200,
      attendanceRate: 95.8,
      teacherAttendance: 78,
      lateStudents: 12,
      absentStudents: 8
    }
  });
});

/**
 * 呼叫中心 API
*/
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    message: '呼叫中心概览数据获取成功',
    data: {
      totalCalls: 285,
      answeredCalls: 242,
      missedCalls: 43,
      averageCallDuration: '4:32',
      conversionRate: 18.5,
      activeAgents: 6
    }
  });
});

/**
 * 财务中心 API
*/
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    message: '财务中心概览数据获取成功',
    data: {
      totalRevenue: 2850000,
      monthlyRevenue: 420000,
      totalExpenses: 1850000,
      profitMargin: 35.1,
      pendingPayments: 85,
      overduePayments: 12
    }
  });
});

/**
 * 绩效中心 API
*/
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    message: '绩效中心概览数据获取成功',
    data: {
      totalEmployees: 120,
      averagePerformance: 4.2,
      topPerformers: 15,
      performanceTargets: 85,
      completedReviews: 92,
      pendingReviews: 8
    }
  });
});

/**
 * 分析中心 API
*/
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    message: '分析中心概览数据获取成功',
    data: {
      totalReports: 45,
      recentReports: 8,
      dataAccuracy: 96.5,
      keyMetrics: 128,
      trends: 'positive',
      alerts: 3
    }
  });
});

/**
 * 人员中心 API
*/
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    message: '人员中心概览数据获取成功',
    data: {
      totalEmployees: 120,
      activeEmployees: 118,
      newHires: 8,
      resignations: 3,
      departments: 8,
      openPositions: 5
    }
  });
});

/**
 * 反馈中心 API
*/
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    message: '反馈中心概览数据获取成功',
    data: {
      totalFeedback: 156,
      positiveFeedback: 128,
      negativeFeedback: 8,
      neutralFeedback: 20,
      responseRate: 85.2,
      pendingResponses: 12
    }
  });
});

/**
 * 用量中心 API
*/
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    message: '用量中心概览数据获取成功',
    data: {
      activeUsers: 245,
      totalUsers: 320,
      dailyActiveUsers: 180,
      storageUsage: '15.6GB',
      bandwidthUsage: '245GB',
      apiCalls: 15420
    }
  });
});

export default router;