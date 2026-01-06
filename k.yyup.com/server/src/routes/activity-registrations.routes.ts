/**
* @swagger
 * components:
 *   schemas:
 *     Activity-registration:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Activity-registration ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Activity-registration 名称
 *           example: "示例Activity-registration"
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
 *     CreateActivity-registrationRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-registration 名称
 *           example: "新Activity-registration"
 *     UpdateActivity-registrationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-registration 名称
 *           example: "更新后的Activity-registration"
 *     Activity-registrationListResponse:
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
 *                 $ref: '#/components/schemas/Activity-registration'
 *         message:
 *           type: string
 *           example: "获取activity-registration列表成功"
 *     Activity-registrationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Activity-registration'
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
 * activity-registration管理路由文件
 * 提供activity-registration的基础CRUD操作
*
 * 功能包括：
 * - 获取activity-registration列表
 * - 创建新activity-registration
 * - 获取activity-registration详情
 * - 更新activity-registration信息
 * - 删除activity-registration
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * activity_registrations 路由文件
 * 自动生成 - 2025-07-20T21:41:14.873Z
*/

import * as express from 'express';
import { checkParentStudentAccess, verifyToken } from '../middlewares/auth.middleware';
import { ActivityRegistration } from '../models/activity-registration.model';
import { Activity } from '../models/activity.model';
import { Student } from '../models/student.model';
import { ParentStudentRelation } from '../models/parent-student-relation.model';
import { ApiResponse } from '../utils/apiResponse';
import { permissionMiddleware } from '../middlewares/permission.middleware';

const router = express.Router();

// 全局认证中间件 - 所有路由都需要用户认证
router.use(verifyToken);

/**
* @swagger
 * /api/activity-registrations:
 *   get:
 *     summary: 获取activity_registrations列表
 *     tags: [ActivityRegistration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', permissionMiddleware(['ACTIVITY_REGISTRATION_MANAGE']), async (req, res) => {
  try {
    const { page = 1, limit = 10, orderBy = 'createdAt', orderDirection = 'DESC' } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    console.log('[ACTIVITY]: 🔍 开始查询报名数据，包含关联信息...');

    const { rows: list, count: total } = await ActivityRegistration.findAndCountAll({
      include: [
        {
          model: Activity,
          as: 'activity',
          attributes: ['id', 'title', 'description', 'startTime', 'endTime', 'status'],
          required: false,
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'gender', 'birthDate'],
          required: false,
        },
        {
          model: ParentStudentRelation,
          as: 'parent',
          attributes: ['id', 'parentName', 'parentPhone'],
          required: false,
        },
      ],
      order: [[orderBy as string, orderDirection as string]],
      limit: Number(limit),
      offset: offset,
      where: {
        deletedAt: null,
      },
    });

    console.log('📋 查询结果:', {
      total,
      listLength: list.length,
      firstItem: list[0] ? {
        id: list[0].id,
        contactName: list[0].contactName,
        childName: list[0].childName,
        activity: list[0].activity,
        student: list[0].student,
        parent: list[0].parent,
      } : null
    });

    return ApiResponse.success(res, {
      list,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }, '获取报名列表成功');
  } catch (error) {
    console.error('[ACTIVITY]: 获取报名列表失败:', error);
    return ApiResponse.error(res, '获取报名列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/activity-registrations:
 *   post:
 *     summary: 创建activity_registrations
 *     tags: [ActivityRegistration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    // 自动填充registrationDate和默认状态
    const registrationData = {
      ...req.body,
      registrationDate: new Date(), // 报名日期为当前时间
      status: req.body.status !== undefined ? req.body.status : 0, // 默认为待确认
    };

    console.log('[ACTIVITY]: 📝 创建活动报名:', registrationData);

    const item = await ActivityRegistration.create(registrationData);
    return ApiResponse.success(res, item, '创建活动报名成功');
  } catch (error) {
    console.error('[ACTIVITY]: 创建活动报名失败:', error);
    return ApiResponse.error(res, '创建活动报名失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/activity-registrations/{id}:
 *   get:
 *     summary: 获取activity_registrations详情
 *     tags: [ActivityRegistration]
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
    const item = await ActivityRegistration.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'activity_registrations不存在');
    }
    
    return ApiResponse.success(res, item, '获取activity_registrations详情成功');
  } catch (error) {
    console.error('[ACTIVITY]: 获取activity_registrations详情失败:', error);
    return ApiResponse.error(res, '获取activity_registrations详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/activity-registrations/{id}:
 *   put:
 *     summary: 更新activity_registrations
 *     tags: [ActivityRegistration]
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
    const [updatedRowsCount] = await ActivityRegistration.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'activity_registrations不存在');
    }
    
    const updatedItem = await ActivityRegistration.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新activity_registrations成功');
  } catch (error) {
    console.error('[ACTIVITY]: 更新activity_registrations失败:', error);
    return ApiResponse.error(res, '更新activity_registrations失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/activity-registrations/{id}:
 *   delete:
 *     summary: 删除activity_registrations
 *     tags: [ActivityRegistration]
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
    const deletedRowsCount = await ActivityRegistration.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'activity_registrations不存在');
    }
    
    return ApiResponse.success(res, null, '删除activity_registrations成功');
  } catch (error) {
    console.error('[ACTIVITY]: 删除activity_registrations失败:', error);
    return ApiResponse.error(res, '删除activity_registrations失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
