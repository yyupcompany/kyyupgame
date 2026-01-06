/**
* @swagger
 * components:
 *   schemas:
 *     Kindergarten-basic-info:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Kindergarten-basic-info ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Kindergarten-basic-info 名称
 *           example: "示例Kindergarten-basic-info"
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
 *     CreateKindergarten-basic-infoRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Kindergarten-basic-info 名称
 *           example: "新Kindergarten-basic-info"
 *     UpdateKindergarten-basic-infoRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Kindergarten-basic-info 名称
 *           example: "更新后的Kindergarten-basic-info"
 *     Kindergarten-basic-infoListResponse:
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
 *                 $ref: '#/components/schemas/Kindergarten-basic-info'
 *         message:
 *           type: string
 *           example: "获取kindergarten-basic-info列表成功"
 *     Kindergarten-basic-infoResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Kindergarten-basic-info'
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
 * kindergarten-basic-info管理路由文件
 * 提供kindergarten-basic-info的基础CRUD操作
*
 * 功能包括：
 * - 获取kindergarten-basic-info列表
 * - 创建新kindergarten-basic-info
 * - 获取kindergarten-basic-info详情
 * - 更新kindergarten-basic-info信息
 * - 删除kindergarten-basic-info
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { KindergartenBasicInfoController } from '../controllers/kindergarten-basic-info.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/kindergarten/basic-info:
 *   get:
 *     summary: 获取幼儿园基本资料
 *     tags: [幼儿园基本资料]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取基本资料
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
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                       description: 幼儿园名称
 *                     description:
 *                       type: string
 *                       description: 园区介绍
 *                     studentCount:
 *                       type: integer
 *                       description: 学生人数
 *                     teacherCount:
 *                       type: integer
 *                       description: 教师人数
 *                     classCount:
 *                       type: integer
 *                       description: 班级数量
 *                     logoUrl:
 *                       type: string
 *                       description: logo图片URL
 *                     coverImages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 园区配图URLs
 *                     contactPerson:
 *                       type: string
 *                       description: 联系人
 *                     consultationPhone:
 *                       type: string
 *                       description: 咨询电话
 *                     address:
 *                       type: string
 *                       description: 园区地址
*/
router.get('/basic-info', KindergartenBasicInfoController.getBasicInfo);

/**
* @swagger
 * /api/kindergarten/basic-info:
 *   put:
 *     summary: 更新幼儿园基本资料
 *     tags: [幼儿园基本资料]
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
 *                 description: 幼儿园名称
 *               description:
 *                 type: string
 *                 description: 园区介绍
 *               studentCount:
 *                 type: integer
 *                 description: 学生人数
 *               teacherCount:
 *                 type: integer
 *                 description: 教师人数
 *               classCount:
 *                 type: integer
 *                 description: 班级数量
 *               logoUrl:
 *                 type: string
 *                 description: logo图片URL
 *               coverImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 园区配图URLs
 *               contactPerson:
 *                 type: string
 *                 description: 联系人
 *               consultationPhone:
 *                 type: string
 *                 description: 咨询电话
 *               address:
 *                 type: string
 *                 description: 园区地址
 *     responses:
 *       200:
 *         description: 更新成功
*/
router.put('/basic-info', KindergartenBasicInfoController.updateBasicInfo);

/**
* @swagger
 * /api/kindergarten/upload-image:
 *   post:
 *     summary: 上传单张图片（logo）
 *     tags: [幼儿园基本资料]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 图片文件
 *     responses:
 *       200:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: 图片URL
 *                     filename:
 *                       type: string
 *                       description: 文件名
*/
router.post('/upload-image', KindergartenBasicInfoController.uploadSingle, KindergartenBasicInfoController.uploadImage);

/**
* @swagger
 * /api/kindergarten/upload-images:
 *   post:
 *     summary: 上传多张图片（园区配图）
 *     tags: [幼儿园基本资料]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 图片文件数组（最多10张）
 *     responses:
 *       200:
 *         description: 上传成功
*/
router.post('/upload-images', KindergartenBasicInfoController.uploadMultiple, KindergartenBasicInfoController.uploadImages);

export default router;
