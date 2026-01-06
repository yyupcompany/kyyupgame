/**
* @swagger
 * components:
 *   schemas:
 *     Parent:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Parent ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Parent 名称
 *           example: "示例Parent"
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
 *     CreateParentRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Parent 名称
 *           example: "新Parent"
 *     UpdateParentRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Parent 名称
 *           example: "更新后的Parent"
 *     ParentListResponse:
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
 *                 $ref: '#/components/schemas/Parent'
 *         message:
 *           type: string
 *           example: "获取parent列表成功"
 *     ParentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Parent'
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
 * parent管理路由文件
 * 提供parent的基础CRUD操作
*
 * 功能包括：
 * - 获取parent列表
 * - 创建新parent
 * - 获取parent详情
 * - 更新parent信息
 * - 删除parent
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * parents 路由文件
 * 自动生成 - 2025-07-20T21:41:14.886Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { Parent } from '../models/parent.model';
import { User } from '../models/user.model';
import { ApiResponse } from '../utils/apiResponse';
import { sequelize } from '../init';
import * as bcrypt from 'bcrypt';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/parents:
 *   get:
 *     summary: 获取parents列表
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await Parent.findAll();
    return ApiResponse.success(res, { list }, '获取parents列表成功');
  } catch (error) {
    console.error('[PARENT]: 获取parents列表失败:', error);
    return ApiResponse.error(res, '获取parents列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/parents:
 *   post:
 *     summary: 创建parents
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { realName, phone, email, studentId, relationship, isPrimaryContact, occupation, workUnit } = req.body;
    const creatorId = (req.user as any)?.id;

    if (!studentId) {
      await transaction.rollback();
      return ApiResponse.error(res, '必须提供学生ID', 'BAD_REQUEST', 400);
    }

    console.log('[PARENT]: 📝 创建家长，使用事务处理...');

    // 1. 创建User记录
    const user = await User.create({
      username: phone, // 使用手机号作为用户名
      password: await bcrypt.hash('123456', 10), // 默认密码
      realName,
      phone,
      email,
      role: 'parent' as any,
      status: 'active' as any
    }, { transaction });

    console.log('[PARENT]: ✅ User创建成功, ID:', user.id);

    // 2. 创建Parent记录
    const parent = await Parent.create({
      userId: user.id,
      studentId,
      relationship,
      isPrimaryContact: isPrimaryContact !== undefined ? isPrimaryContact : 1,
      isLegalGuardian: 1, // 默认为法定监护人
      occupation,
      workUnit,
      creatorId,
      isPublic: true,
      followStatus: '待跟进',
      priority: 0
    }, { transaction });

    console.log('[PARENT]: ✅ Parent创建成功, ID:', parent.id);

    await transaction.commit();

    return ApiResponse.success(res, parent, '创建家长成功');
  } catch (error) {
    await transaction.rollback();
    console.error('[PARENT]: 创建家长失败:', error);
    return ApiResponse.error(res, '创建家长失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/parents/{id}:
 *   get:
 *     summary: 获取parents详情
 *     tags: [Parent]
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
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Parent.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'parents不存在');
    }
    
    return ApiResponse.success(res, item, '获取parents详情成功');
  } catch (error) {
    console.error('[PARENT]: 获取parents详情失败:', error);
    return ApiResponse.error(res, '获取parents详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/parents/{id}:
 *   put:
 *     summary: 更新parents
 *     tags: [Parent]
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await Parent.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'parents不存在');
    }
    
    const updatedItem = await Parent.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新parents成功');
  } catch (error) {
    console.error('[PARENT]: 更新parents失败:', error);
    return ApiResponse.error(res, '更新parents失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/parents/{id}:
 *   delete:
 *     summary: 删除parents
 *     tags: [Parent]
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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Parent.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'parents不存在');
    }
    
    return ApiResponse.success(res, null, '删除parents成功');
  } catch (error) {
    console.error('[PARENT]: 删除parents失败:', error);
    return ApiResponse.error(res, '删除parents失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
