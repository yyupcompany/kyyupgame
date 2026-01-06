/**
* @swagger
 * components:
 *   schemas:
 *     Performance-report:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Performance-report ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Performance-report 名称
 *           example: "示例Performance-report"
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
 *     CreatePerformance-reportRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Performance-report 名称
 *           example: "新Performance-report"
 *     UpdatePerformance-reportRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Performance-report 名称
 *           example: "更新后的Performance-report"
 *     Performance-reportListResponse:
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
 *                 $ref: '#/components/schemas/Performance-report'
 *         message:
 *           type: string
 *           example: "获取performance-report列表成功"
 *     Performance-reportResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Performance-report'
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
 * performance-report管理路由文件
 * 提供performance-report的基础CRUD操作
*
 * 功能包括：
 * - 获取performance-report列表
 * - 创建新performance-report
 * - 获取performance-report详情
 * - 更新performance-report信息
 * - 删除performance-report
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 绩效报告API路由
 * 处理绩效报告的生成、查看和管理功能
*/

import { Router, Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { verifyToken } from '../middlewares/auth.middleware';
import { validateInput } from '../middlewares/security.middleware';
import { body, query } from 'express-validator';

const router = Router();

// 应用认证中间件
router.use(verifyToken);

/**
* @swagger
 * /performance-reports:
 *   get:
 *     summary: 获取绩效报告列表
 *     tags: [Performance Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: 报告期间
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 报告类型
 *     responses:
 *       200:
 *         description: 成功返回绩效报告列表
*/
router.get('/',
  validateInput([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('period').optional().isString(),
    query('type').optional().isString()
  ]),
  (req: Request, res: Response) => {
    const { page = 1, limit = 10, period, type } = req.query;
    
    // 模拟数据
    const reports = [
      {
        id: 1,
        title: '2025年第一季度绩效报告',
        type: '季度报告',
        period: '2025-Q1',
        status: '已完成',
        generatedBy: '系统管理员',
        generatedAt: '2025-01-31T10:00:00Z',
        summary: {
          totalEmployees: 24,
          averageScore: 87.5,
          excellentCount: 8,
          goodCount: 12,
          satisfactoryCount: 4,
          improvementNeeded: 0
        },
        departments: [
          {
            name: '教学部',
            averageScore: 89.2,
            employeeCount: 18
          },
          {
            name: '行政部',
            averageScore: 84.3,
            employeeCount: 6
          }
        ],
        createdAt: '2025-01-31T10:00:00Z',
        updatedAt: '2025-01-31T10:00:00Z'
      },
      {
        id: 2,
        title: '2024年度绩效报告',
        type: '年度报告',
        period: '2024',
        status: '已完成',
        generatedBy: '系统管理员',
        generatedAt: '2024-12-31T10:00:00Z',
        summary: {
          totalEmployees: 22,
          averageScore: 86.8,
          excellentCount: 7,
          goodCount: 11,
          satisfactoryCount: 4,
          improvementNeeded: 0
        },
        departments: [
          {
            name: '教学部',
            averageScore: 88.5,
            employeeCount: 16
          },
          {
            name: '行政部',
            averageScore: 83.1,
            employeeCount: 6
          }
        ],
        createdAt: '2024-12-31T10:00:00Z',
        updatedAt: '2024-12-31T10:00:00Z'
      }
    ];

    const total = reports.length;
    const totalPages = Math.ceil(total / Number(limit));
    
    ApiResponse.success(res, {
      reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    }, '绩效报告列表获取成功');
  }
);

/**
* @swagger
 * /performance-reports/{id}:
 *   get:
 *     summary: 获取特定绩效报告详情
 *     tags: [Performance Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报告ID
 *     responses:
 *       200:
 *         description: 成功返回绩效报告详情
 *       404:
 *         description: 报告不存在
*/
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
  }
  
  // 模拟数据
  const report = {
    id,
    title: '2025年第一季度绩效报告',
    type: '季度报告',
    period: '2025-Q1',
    status: '已完成',
    generatedBy: '系统管理员',
    generatedAt: '2025-01-31T10:00:00Z',
    summary: {
      totalEmployees: 24,
      averageScore: 87.5,
      excellentCount: 8,
      goodCount: 12,
      satisfactoryCount: 4,
      improvementNeeded: 0
    },
    departments: [
      {
        name: '教学部',
        averageScore: 89.2,
        employeeCount: 18,
        employees: [
          { name: '张教师', position: '主班老师', score: 92 },
          { name: '李教师', position: '副班老师', score: 88 }
        ]
      },
      {
        name: '行政部',
        averageScore: 84.3,
        employeeCount: 6,
        employees: [
          { name: '王主任', position: '行政主任', score: 90 },
          { name: '赵助理', position: '行政助理', score: 85 }
        ]
      }
    ],
    trends: {
      scoreImprovement: '+2.3%',
      attendanceRate: '98.5%',
      parentSatisfaction: '94.2%'
    },
    recommendations: [
      '继续加强教师培训',
      '提升团队协作能力',
      '优化工作流程'
    ],
    createdAt: '2025-01-31T10:00:00Z',
    updatedAt: '2025-01-31T10:00:00Z'
  };

  ApiResponse.success(res, report, '绩效报告详情获取成功');
});

/**
* @swagger
 * /performance-reports:
 *   post:
 *     summary: 生成绩效报告
 *     tags: [Performance Report]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *               period:
 *                 type: string
 *               departmentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: 绩效报告生成成功
 *       400:
 *         description: 请求参数错误
*/
router.post('/',
  validateInput([
    body('title').isString().notEmpty().withMessage('报告标题不能为空'),
    body('type').isString().notEmpty().withMessage('报告类型不能为空'),
    body('period').isString().notEmpty().withMessage('报告期间不能为空'),
    body('departmentIds').optional().isArray()
  ]),
  (req: Request, res: Response) => {
    const { title, type, period, departmentIds } = req.body;
    
    // 模拟生成报告
    const newReport = {
      id: Math.floor(Math.random() * 10000),
      title,
      type,
      period,
      status: '生成中',
      generatedBy: (req.user as any)?.realName || (req.user as any)?.username || '系统管理员',
      generatedAt: new Date().toISOString(),
      summary: {
        totalEmployees: 24,
        averageScore: 87.5,
        excellentCount: 8,
        goodCount: 12,
        satisfactoryCount: 4,
        improvementNeeded: 0
      },
      departments: [
        {
          name: '教学部',
          averageScore: 89.2,
          employeeCount: 18
        },
        {
          name: '行政部',
          averageScore: 84.3,
          employeeCount: 6
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    ApiResponse.success(res, newReport, '绩效报告生成成功', 201);
  }
);

/**
* @swagger
 * /performance-reports/{id}/export:
 *   get:
 *     summary: 导出绩效报告
 *     tags: [Performance Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报告ID
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel, word]
 *           default: pdf
 *         description: 导出格式
 *     responses:
 *       200:
 *         description: 导出成功
 *       404:
 *         description: 报告不存在
*/
router.get('/:id/export', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const format = req.query.format || 'pdf';
  
  if (isNaN(id)) {
    return ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
  }
  
  // 模拟导出
  const exportResult = {
    reportId: id,
    format,
    fileName: `performance_report_${id}.${format}`,
    downloadUrl: `/downloads/performance_report_${id}.${format}`,
    fileSize: '2.5MB',
    exportedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
  };

  ApiResponse.success(res, exportResult, '绩效报告导出成功');
});

/**
* @swagger
 * /performance-reports/{id}:
 *   delete:
 *     summary: 删除绩效报告
 *     tags: [Performance Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报告ID
 *     responses:
 *       200:
 *         description: 绩效报告删除成功
 *       404:
 *         description: 报告不存在
*/
router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
  }
  
  // 模拟删除报告
  const deletedReport = {
    id,
    title: '2025年第一季度绩效报告',
    period: '2025-Q1',
    deletedAt: new Date().toISOString()
  };

  ApiResponse.success(res, deletedReport, '绩效报告删除成功');
});

export default router;