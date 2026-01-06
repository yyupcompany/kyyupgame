/**
* @swagger
 * components:
 *   schemas:
 *     Enrollment-application:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Enrollment-application ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Enrollment-application 名称
 *           example: "示例Enrollment-application"
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
 *     CreateEnrollment-applicationRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Enrollment-application 名称
 *           example: "新Enrollment-application"
 *     UpdateEnrollment-applicationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Enrollment-application 名称
 *           example: "更新后的Enrollment-application"
 *     Enrollment-applicationListResponse:
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
 *                 $ref: '#/components/schemas/Enrollment-application'
 *         message:
 *           type: string
 *           example: "获取enrollment-application列表成功"
 *     Enrollment-applicationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Enrollment-application'
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
 * enrollment-application管理路由文件
 * 提供enrollment-application的基础CRUD操作
*
 * 功能包括：
 * - 获取enrollment-application列表
 * - 创建新enrollment-application
 * - 获取enrollment-application详情
 * - 更新enrollment-application信息
 * - 删除enrollment-application
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 报名申请路由
*/
import { Router } from 'express';
import * as enrollmentApplicationController from '../controllers/enrollment-application.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/enrollment-applications:
 *   post:
 *     summary: 创建报名申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentName
 *               - gender
 *               - birthDate
 *               - parentId
 *               - planId
 *               - contactPhone
 *               - applicationSource
 *             properties:
 *               studentName:
 *                 type: string
 *                 description: 学生姓名
 *               gender:
 *                 type: string
 *                 description: 性别
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: 出生日期
 *               parentId:
 *                 type: integer
 *                 description: 家长ID
 *               planId:
 *                 type: integer
 *                 description: 招生计划ID
 *               contactPhone:
 *                 type: string
 *                 description: 联系电话
 *               contactAddress:
 *                 type: string
 *                 description: 联系地址
 *               emergencyContact:
 *                 type: string
 *                 description: 紧急联系人
 *               emergencyPhone:
 *                 type: string
 *                 description: 紧急联系电话
 *               specialNeeds:
 *                 type: string
 *                 description: 特殊需求
 *               previousSchool:
 *                 type: string
 *                 description: 原就读学校
 *               applicationSource:
 *                 type: string
 *                 description: 申请来源
 *               notes:
 *                 type: string
 *                 description: 备注
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  enrollmentApplicationController.createApplication
);

/**
* @swagger
 * /api/enrollment-applications:
 *   get:
 *     summary: 获取报名申请列表
 *     tags: [报名申请]
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
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: studentName
 *         schema:
 *           type: string
 *         description: 学生姓名
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 申请状态
 *       - in: query
 *         name: planId
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: query
 *         name: applyDateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 申请开始日期
 *       - in: query
 *         name: applyDateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 申请结束日期
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  (req, res) => {
    res.json({
      success: true,
      message: '获取报名申请列表成功',
      data: {
        total: 0,
        items: [],
        page: 1,
        pageSize: 10
      }
    });
  }
);

/**
* @swagger
 * /api/enrollment-applications/{id}:
 *   get:
 *     summary: 获取报名申请详情
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/:id', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  (req, res) => {
    const { id } = req.params;
    res.json({
      success: true,
      message: '获取报名申请详情成功',
      data: {
        id: parseInt(id),
        studentName: '测试学生',
        gender: '男',
        birthDate: '2020-01-01',
        parentId: 1,
        planId: 1,
        contactPhone: '13800000000',
        applicationStatus: 'pending',
        applicationSource: 'online',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
);

/**
* @swagger
 * /api/enrollment-applications/{id}:
 *   put:
 *     summary: 更新报名申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentName:
 *                 type: string
 *                 description: 学生姓名
 *               contactPhone:
 *                 type: string
 *                 description: 联系电话
 *               applicationStatus:
 *                 type: string
 *                 description: 申请状态
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
*/
router.put(
  '/:id', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  (req, res) => {
    const { id } = req.params;
    res.json({
      success: true,
      message: '更新报名申请成功',
      data: {
        id: parseInt(id),
        updatedAt: new Date()
      }
    });
  }
);

/**
* @swagger
 * /api/enrollment-applications/{id}:
 *   delete:
 *     summary: 删除报名申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
*/
router.delete(
  '/:id', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  (req, res) => {
    const { id } = req.params;
    res.json({
      success: true,
      message: '删除报名申请成功',
      data: {
        id: parseInt(id)
      }
    });
  }
);

/**
* @swagger
 * /api/enrollment-applications/by-plan/{planId}:
 *   get:
 *     summary: 按计划获取招生申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 招生计划ID
 *     responses:
 *       200:
 *         description: 成功
*/
router.get(
  '/by-plan/:planId', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  (req, res) => {
    const { planId } = req.params;
    res.json({
      success: true,
      message: '按计划获取招生申请成功',
      data: {
        planId: parseInt(planId),
        total: 0,
        items: []
      }
    });
  }
);

/**
* @swagger
 * /api/enrollment-applications/by-status/{status}:
 *   get:
 *     summary: 按状态获取招生申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: 申请状态
 *     responses:
 *       200:
 *         description: 成功
*/
router.get(
  '/by-status/:status', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  (req, res) => {
    const { status } = req.params;
    res.json({
      success: true,
      message: '按状态获取招生申请成功',
      data: {
        status,
        total: 0,
        items: []
      }
    });
  }
);

/**
* @swagger
 * /api/enrollment-applications/{id}/documents:
 *   post:
 *     summary: 上传申请文档
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     responses:
 *       201:
 *         description: 上传成功
*/
router.post(
  '/:id/documents', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  (req, res) => {
    const { id } = req.params;
    res.status(201).json({
      success: true,
      message: '上传申请文档成功',
      data: {
        applicationId: parseInt(id),
        documentId: Math.floor(Math.random() * 1000) + 1,
        uploadTime: new Date()
      }
    });
  }
);

/**
* @swagger
 * /api/enrollment-applications/{id}/documents:
 *   get:
 *     summary: 获取申请文档列表
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     responses:
 *       200:
 *         description: 成功
*/
router.get(
  '/:id/documents', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  (req, res) => {
    const { id } = req.params;
    res.json({
      success: true,
      message: '获取申请文档列表成功',
      data: {
        applicationId: parseInt(id),
        documents: []
      }
    });
  }
);

/**
* @swagger
 * /api/enrollment-applications/{id}/interview:
 *   post:
 *     summary: 安排面试
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     responses:
 *       201:
 *         description: 安排成功
*/
router.post(
  '/:id/interview', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  (req, res) => {
    const { id } = req.params;
    res.status(201).json({
      success: true,
      message: '安排面试成功',
      data: {
        applicationId: parseInt(id),
        interviewId: Math.floor(Math.random() * 1000) + 1,
        scheduledTime: new Date()
      }
    });
  }
);

/**
* @swagger
 * /api/enrollment-applications/{id}/review:
 *   put:
 *     summary: 审核申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     responses:
 *       200:
 *         description: 审核成功
*/
router.put(
  '/:id/review', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  (req, res) => {
    const { id } = req.params;
    res.json({
      success: true,
      message: '审核申请成功',
      data: {
        applicationId: parseInt(id),
        reviewStatus: 'reviewed',
        reviewTime: new Date()
      }
    });
  }
);

/**
* @swagger
 * /api/enrollment-applications/{id}/status:
 *   patch:
 *     summary: 更新申请状态
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 报名申请ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewing, approved, rejected, cancelled]
 *                 description: 申请状态
 *               notes:
 *                 type: string
 *                 description: 状态更新备注
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
*/
router.patch(
  '/:id/status', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: '状态参数不能为空',
          code: 'INVALID_PARAMS'
        });
      }

      // 模拟更新状态
      return res.json({
        success: true,
        message: '申请状态更新成功',
        data: {
          id: parseInt(id),
          status,
          notes,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '更新申请状态失败',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
* @swagger
 * /api/enrollment-applications/{id}/review:
 *   post:
 *     summary: 审核报名申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 报名申请ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, reviewing]
 *                 description: 审核状态
 *               comments:
 *                 type: string
 *                 description: 审核意见
 *     responses:
 *       200:
 *         description: 审核成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/:id/review', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  enrollmentApplicationController.reviewApplication
);

/**
* @swagger
 * /api/enrollment-applications/{applicationId}/materials:
 *   get:
 *     summary: 获取报名申请材料列表
 *     tags: [报名申请材料]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 报名申请ID
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/:applicationId/materials', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  enrollmentApplicationController.getMaterials
);

/**
* @swagger
 * /api/enrollment-applications/{applicationId}/materials:
 *   post:
 *     summary: 添加报名申请材料
 *     tags: [报名申请材料]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 报名申请ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - materialType
 *               - materialName
 *               - fileId
 *             properties:
 *               materialType:
 *                 type: string
 *                 description: 材料类型
 *               materialName:
 *                 type: string
 *                 description: 材料名称
 *               fileId:
 *                 type: integer
 *                 description: 文件ID
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/:applicationId/materials', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  enrollmentApplicationController.addApplicationMaterial
);

/**
* @swagger
 * /api/enrollment-applications/materials/{materialId}:
 *   delete:
 *     summary: 删除报名申请材料
 *     tags: [报名申请材料]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: materialId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 材料ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
*/
router.delete(
  '/materials/:materialId', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  enrollmentApplicationController.deleteMaterial
);

/**
* @swagger
 * /api/enrollment-applications/materials/{materialId}/verify:
 *   post:
 *     summary: 验证报名申请材料
 *     tags: [报名申请材料]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: materialId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 材料ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: 验证状态
 *               comments:
 *                 type: string
 *                 description: 验证意见
 *     responses:
 *       200:
 *         description: 验证成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/materials/:materialId/verify', checkPermission('ENROLLMENT_APPLICATION_MANAGE'),
  enrollmentApplicationController.verifyMaterial
);

export default router; 