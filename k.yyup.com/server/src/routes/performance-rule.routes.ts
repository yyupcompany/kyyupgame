/**
* @swagger
 * components:
 *   schemas:
 *     Performance-rule:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Performance-rule ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Performance-rule 名称
 *           example: "示例Performance-rule"
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
 *     CreatePerformance-ruleRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Performance-rule 名称
 *           example: "新Performance-rule"
 *     UpdatePerformance-ruleRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Performance-rule 名称
 *           example: "更新后的Performance-rule"
 *     Performance-ruleListResponse:
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
 *                 $ref: '#/components/schemas/Performance-rule'
 *         message:
 *           type: string
 *           example: "获取performance-rule列表成功"
 *     Performance-ruleResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Performance-rule'
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
 * performance-rule管理路由文件
 * 提供performance-rule的基础CRUD操作
*
 * 功能包括：
 * - 获取performance-rule列表
 * - 创建新performance-rule
 * - 获取performance-rule详情
 * - 更新performance-rule信息
 * - 删除performance-rule
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 绩效规则API路由
 * 处理绩效评估规则的配置和管理功能
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
 * /performance-rule:
 *   get:
 *     summary: 获取绩效规则列表
 *     tags: [Performance Rule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功返回绩效规则列表
*/
router.get('/', (req: Request, res: Response) => {
  const { page = 1, limit = 10, category, status } = req.query;
  
  // 模拟数据
  const rules = [
    {
      id: 1,
      name: '教学质量评估规则',
      category: '教学类',
      description: '基于教学效果、学生反馈和家长满意度的评估规则',
      status: '启用',
      weight: 40,
      criteria: [
        { name: '教学效果', weight: 50, description: '基于学生学习成果评估' },
        { name: '学生反馈', weight: 30, description: '学生对教师的评价' },
        { name: '家长满意度', weight: 20, description: '家长对教学的满意程度' }
      ],
      scoreRanges: [
        { level: '优秀', minScore: 90, maxScore: 100, reward: '奖金+200元' },
        { level: '良好', minScore: 80, maxScore: 89, reward: '奖金+100元' },
        { level: '合格', minScore: 70, maxScore: 79, reward: '无奖励' },
        { level: '待改进', minScore: 0, maxScore: 69, reward: '需要培训' }
      ],
      applicableRoles: ['主班老师', '副班老师'],
      createdBy: '系统管理员',
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-01T10:00:00Z'
    }
  ];

  const total = rules.length;
  const totalPages = Math.ceil(total / Number(limit));
  
  ApiResponse.success(res, {
    rules,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  }, '绩效规则列表获取成功');
});

/**
* @swagger
 * /performance-rule/{id}:
 *   get:
 *     summary: 获取特定绩效规则详情
 *     tags: [Performance Rule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 规则ID
 *     responses:
 *       200:
 *         description: 成功返回绩效规则详情
 *       404:
 *         description: 规则不存在
*/
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
  }
  
  // 模拟数据
  const rule = {
    id,
    name: '教学质量评估规则',
    category: '教学类',
    description: '基于教学效果、学生反馈和家长满意度的评估规则',
    status: '启用',
    weight: 40,
    criteria: [
      { 
        name: '教学效果', 
        weight: 50, 
        description: '基于学生学习成果评估',
        evaluationMethod: '通过学生作业、测试和活动表现评估',
        dataSource: '学生成绩记录、作业完成情况'
      },
      { 
        name: '学生反馈', 
        weight: 30, 
        description: '学生对教师的评价',
        evaluationMethod: '通过学生问卷和日常观察评估',
        dataSource: '学生反馈问卷、日常观察记录'
      },
      { 
        name: '家长满意度', 
        weight: 20, 
        description: '家长对教学的满意程度',
        evaluationMethod: '通过家长问卷和家长会反馈评估',
        dataSource: '家长满意度调查、家长会记录'
      }
    ],
    scoreRanges: [
      { level: '优秀', minScore: 90, maxScore: 100, reward: '奖金+200元', color: '#52c41a' },
      { level: '良好', minScore: 80, maxScore: 89, reward: '奖金+100元', color: '#1890ff' },
      { level: '合格', minScore: 70, maxScore: 79, reward: '无奖励', color: '#faad14' },
      { level: '待改进', minScore: 0, maxScore: 69, reward: '需要培训', color: '#ff4d4f' }
    ],
    applicableRoles: ['主班老师', '副班老师'],
    evaluationFrequency: '季度',
    lastModified: '2025-01-01T10:00:00Z',
    createdBy: '系统管理员',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z'
  };

  ApiResponse.success(res, rule, '绩效规则详情获取成功');
});

/**
* @swagger
 * /performance-rule:
 *   post:
 *     summary: 创建绩效规则
 *     tags: [Performance Rule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               weight:
 *                 type: number
 *     responses:
 *       201:
 *         description: 绩效规则创建成功
 *       400:
 *         description: 请求参数错误
*/
router.post('/', (req: Request, res: Response) => {
  const { name, category, description, weight } = req.body;
  
  if (!name || !category) {
    return ApiResponse.error(res, 'MISSING_REQUIRED_FIELDS', '名称和类别是必需的', 400);
  }
  
  // 模拟创建规则
  const newRule = {
    id: Math.floor(Math.random() * 10000),
    name,
    category,
    description: description || '',
    status: '启用',
    weight: weight || 0,
    criteria: [],
    scoreRanges: [
      { level: '优秀', minScore: 90, maxScore: 100, reward: '奖金+200元' },
      { level: '良好', minScore: 80, maxScore: 89, reward: '奖金+100元' },
      { level: '合格', minScore: 70, maxScore: 79, reward: '无奖励' },
      { level: '待改进', minScore: 0, maxScore: 69, reward: '需要培训' }
    ],
    applicableRoles: [],
    evaluationFrequency: '季度',
    createdBy: (req.user as any)?.realName || (req.user as any)?.username || '系统管理员',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  ApiResponse.success(res, newRule, '绩效规则创建成功', 201);
});

export default router;