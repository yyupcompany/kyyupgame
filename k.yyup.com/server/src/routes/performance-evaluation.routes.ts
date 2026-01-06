/**
* @swagger
 * components:
 *   schemas:
 *     Performance-evaluation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Performance-evaluation ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Performance-evaluation 名称
 *           example: "示例Performance-evaluation"
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
 *     CreatePerformance-evaluationRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Performance-evaluation 名称
 *           example: "新Performance-evaluation"
 *     UpdatePerformance-evaluationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Performance-evaluation 名称
 *           example: "更新后的Performance-evaluation"
 *     Performance-evaluationListResponse:
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
 *                 $ref: '#/components/schemas/Performance-evaluation'
 *         message:
 *           type: string
 *           example: "获取performance-evaluation列表成功"
 *     Performance-evaluationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Performance-evaluation'
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
 * performance-evaluation管理路由文件
 * 提供performance-evaluation的基础CRUD操作
*
 * 功能包括：
 * - 获取performance-evaluation列表
 * - 创建新performance-evaluation
 * - 获取performance-evaluation详情
 * - 更新performance-evaluation信息
 * - 删除performance-evaluation
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 绩效评估API路由
 * 处理教师和员工的绩效评估相关功能
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
 * /performance-evaluations:
 *   get:
 *     summary: 获取绩效评估列表
 *     tags: [Performance Evaluation]
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
 *         name: employeeId
 *         schema:
 *           type: integer
 *         description: 员工ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: 评估期间
 *     responses:
 *       200:
 *         description: 成功返回绩效评估列表
*/
router.get('/', 
  validateInput([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('employeeId').optional().isInt({ min: 1 }),
    query('period').optional().isString()
  ]),
  (req: Request, res: Response) => {
    const { page = 1, limit = 10, employeeId, period } = req.query;
    
    // 模拟数据
    const evaluations = [
      {
        id: 1,
        employeeId: 1,
        employeeName: '张教师',
        position: '主班老师',
        period: '2025-Q1',
        score: 92,
        level: '优秀',
        evaluatorId: 1,
        evaluatorName: '王园长',
        evaluationDate: '2025-01-15',
        comments: '工作认真负责，与家长沟通良好',
        goals: ['提高课堂互动性', '加强家园沟通'],
        achievements: ['获得家长满意度95%', '班级无安全事故'],
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        employeeId: 2,
        employeeName: '李教师',
        position: '副班老师',
        period: '2025-Q1',
        score: 88,
        level: '良好',
        evaluatorId: 1,
        evaluatorName: '王园长',
        evaluationDate: '2025-01-15',
        comments: '有上进心，需要加强专业技能',
        goals: ['提升教学技能', '增强团队协作'],
        achievements: ['完成专业培训', '协助主班老师完成教学任务'],
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z'
      }
    ];

    const total = evaluations.length;
    const totalPages = Math.ceil(total / Number(limit));
    
    ApiResponse.success(res, {
      evaluations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    }, '绩效评估列表获取成功');
  }
);

/**
* @swagger
 * /performance-evaluations/{id}:
 *   get:
 *     summary: 获取特定绩效评估详情
 *     tags: [Performance Evaluation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 评估ID
 *     responses:
 *       200:
 *         description: 成功返回绩效评估详情
 *       404:
 *         description: 评估不存在
*/
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
  }
  
  // 模拟数据
  const evaluation = {
    id,
    employeeId: 1,
    employeeName: '张教师',
    position: '主班老师',
    period: '2025-Q1',
    score: 92,
    level: '优秀',
    evaluatorId: 1,
    evaluatorName: '王园长',
    evaluationDate: '2025-01-15',
    comments: '工作认真负责，与家长沟通良好',
    goals: ['提高课堂互动性', '加强家园沟通'],
    achievements: ['获得家长满意度95%', '班级无安全事故'],
    strengths: ['教学能力强', '责任心强', '团队协作好'],
    improvements: ['可以更多创新教学方法', '继续提升专业技能'],
    nextGoals: ['参加高级培训', '指导新教师'],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  };

  ApiResponse.success(res, evaluation, '绩效评估详情获取成功');
});

/**
* @swagger
 * /performance-evaluations:
 *   post:
 *     summary: 创建绩效评估
 *     tags: [Performance Evaluation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: integer
 *               period:
 *                 type: string
 *               score:
 *                 type: number
 *               comments:
 *                 type: string
 *               goals:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: 绩效评估创建成功
 *       400:
 *         description: 请求参数错误
*/
router.post('/',
  validateInput([
    body('employeeId').isInt({ min: 1 }).withMessage('员工ID必须是正整数'),
    body('period').isString().notEmpty().withMessage('评估期间不能为空'),
    body('score').isFloat({ min: 0, max: 100 }).withMessage('分数必须在0-100之间'),
    body('comments').optional().isString(),
    body('goals').optional().isArray()
  ]),
  (req: Request, res: Response) => {
    const { employeeId, period, score, comments, goals } = req.body;
    
    // 模拟创建评估
    const newEvaluation = {
      id: Math.floor(Math.random() * 10000),
      employeeId,
      employeeName: '张教师',
      position: '主班老师',
      period,
      score,
      level: score >= 90 ? '优秀' : score >= 80 ? '良好' : score >= 70 ? '合格' : '待改进',
      evaluatorId: req.user?.id || 1,
      evaluatorName: (req.user as any)?.realName || (req.user as any)?.username || '系统管理员',
      evaluationDate: new Date().toISOString().split('T')[0],
      comments: comments || '',
      goals: goals || [],
      achievements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    ApiResponse.success(res, newEvaluation, '绩效评估创建成功', 201);
  }
);

/**
* @swagger
 * /performance-evaluations/{id}:
 *   put:
 *     summary: 更新绩效评估
 *     tags: [Performance Evaluation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 评估ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *               comments:
 *                 type: string
 *               goals:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 绩效评估更新成功
 *       404:
 *         description: 评估不存在
*/
router.put('/:id',
  validateInput([
    body('score').optional().isFloat({ min: 0, max: 100 }),
    body('comments').optional().isString(),
    body('goals').optional().isArray()
  ]),
  (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { score, comments, goals } = req.body;
    
    if (isNaN(id)) {
      return ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
    }
    
    // 模拟更新评估
    const updatedEvaluation = {
      id,
      employeeId: 1,
      employeeName: '张教师',
      position: '主班老师',
      period: '2025-Q1',
      score: score || 92,
      level: (score || 92) >= 90 ? '优秀' : (score || 92) >= 80 ? '良好' : (score || 92) >= 70 ? '合格' : '待改进',
      evaluatorId: req.user?.id || 1,
      evaluatorName: (req.user as any)?.realName || (req.user as any)?.username || '系统管理员',
      evaluationDate: '2025-01-15',
      comments: comments || '工作认真负责，与家长沟通良好',
      goals: goals || ['提高课堂互动性', '加强家园沟通'],
      achievements: ['获得家长满意度95%', '班级无安全事故'],
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    };

    ApiResponse.success(res, updatedEvaluation, '绩效评估更新成功');
  }
);

/**
* @swagger
 * /performance-evaluations/{id}:
 *   delete:
 *     summary: 删除绩效评估
 *     tags: [Performance Evaluation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 评估ID
 *     responses:
 *       200:
 *         description: 绩效评估删除成功
 *       404:
 *         description: 评估不存在
*/
router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
  }
  
  // 模拟删除评估
  const deletedEvaluation = {
    id,
    employeeName: '张教师',
    period: '2025-Q1',
    deletedAt: new Date().toISOString()
  };

  ApiResponse.success(res, deletedEvaluation, '绩效评估删除成功');
});

export default router;