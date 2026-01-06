/**
* @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Student ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Student 名称
 *           example: "示例Student"
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
 *     CreateStudentRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Student 名称
 *           example: "新Student"
 *     UpdateStudentRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Student 名称
 *           example: "更新后的Student"
 *     StudentListResponse:
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
 *                 $ref: '#/components/schemas/Student'
 *         message:
 *           type: string
 *           example: "获取student列表成功"
 *     StudentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Student'
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
 * student管理路由文件
 * 提供student的基础CRUD操作
*
 * 功能包括：
 * - 获取student列表
 * - 创建新student
 * - 获取student详情
 * - 更新student信息
 * - 删除student
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * students 路由文件
 * 自动生成 - 2025-07-20T21:41:14.890Z
*/

import * as express from 'express';
import { Request, Response } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { Student } from '../models/student.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/students:
 *   get:
 *     summary: 获取students列表
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req: Request, res: Response) => {
  try {
    // 🔧 添加分页支持
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    // 🔧 构建查询条件
    const where: any = {};

    // 支持status过滤
    if (req.query.status) {
      where.status = req.query.status;
    }

    // 🔧 执行分页查询
    const { count, rows } = await Student.findAndCountAll({
      where,
      limit: pageSize,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    // 🔧 返回标准分页格式
    return ApiResponse.success(res, {
      items: rows,
      total: count,
      page: page,
      pageSize: pageSize
    }, '获取students列表成功');
  } catch (error) {
    console.error('[STUDENT]: 获取students列表失败:', error);
    return ApiResponse.error(res, '获取students列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/students:
 *   post:
 *     summary: 创建students
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req: Request, res: Response) => {
  try {
    // 自动填充kindergartenId和creatorId
    const studentData = {
      ...req.body,
      kindergartenId: (req.user as any)?.kindergartenId || req.body.kindergartenId,
      creatorId: (req.user as any)?.id || req.body.creatorId,
      status: req.body.status !== undefined ? req.body.status : 1, // 默认为在读状态
    };

    console.log('[STUDENT]: 📝 创建学生:', studentData);

    const item = await Student.create(studentData);
    return ApiResponse.success(res, item, '创建学生成功');
  } catch (error) {
    console.error('[STUDENT]: 创建学生失败:', error);
    return ApiResponse.error(res, '创建学生失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/students/count:
 *   get:
 *     summary: 获取学生总数
 *     description: 返回学生的统计数量
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 学生总数
 *                       example: 150
 *                     active:
 *                       type: integer
 *                       description: 在读学生数
 *                       example: 120
 *                     graduated:
 *                       type: integer
 *                       description: 已毕业学生数
 *                       example: 30
*/
router.get('/count', async (req: Request, res: Response) => {
  try {
    // 获取学生总数
    const total = await Student.count();
    
    // 获取在读学生数 (status = 1)
    const active = await Student.count({ where: { status: 1 } });
    
    // 获取其他状态学生数
    const graduated = total - active;
    
    return ApiResponse.success(res, {
      total,
      active,
      graduated
    }, '获取学生统计成功');
  } catch (error) {
    console.error('[STUDENT]: 获取学生统计失败:', error);
    return ApiResponse.error(res, '获取学生统计失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/students/{id}:
 *   get:
 *     summary: 获取students详情
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await Student.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'students不存在');
    }
    
    return ApiResponse.success(res, item, '获取students详情成功');
  } catch (error) {
    console.error('[STUDENT]: 获取students详情失败:', error);
    return ApiResponse.error(res, '获取students详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/students/{id}:
 *   put:
 *     summary: 更新students
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 更新成功
*/
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await Student.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'students不存在');
    }
    
    const updatedItem = await Student.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新students成功');
  } catch (error) {
    console.error('[STUDENT]: 更新students失败:', error);
    return ApiResponse.error(res, '更新students失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: 删除students
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
*/
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Student.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'students不存在');
    }
    
    return ApiResponse.success(res, null, '删除students成功');
  } catch (error) {
    console.error('[STUDENT]: 删除students失败:', error);
    return ApiResponse.error(res, '删除students失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
