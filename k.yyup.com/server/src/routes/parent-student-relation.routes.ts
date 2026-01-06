import { Router } from 'express';
import { ParentStudentRelationController } from '../controllers/parent-student-relation.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

const parentStudentRelationController = new ParentStudentRelationController();

/**
* @swagger
 * tags:
 *   name: Parent-Student Relations
 *   description: 家长-学生关系管理API
*/

/**
* @swagger
 * components:
 *   schemas:
 *     ParentStudentRelation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 关系ID
 *         parentId:
 *           type: integer
 *           description: 家长ID
 *         studentId:
 *           type: integer
 *           description: 学生ID
 *         relationshipType:
 *           type: string
 *           enum: [father, mother, guardian, other]
 *           description: 关系类型
 *         isEmergencyContact:
 *           type: boolean
 *           description: 是否为紧急联系人
 *         isPickupAuthorized:
 *           type: boolean
 *           description: 是否有接送权限
 *         notes:
 *           type: string
 *           description: 备注信息
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - parentId
 *         - studentId
 *         - relationshipType
*     
 *     UpdateParentStudentRelationRequest:
 *       type: object
 *       properties:
 *         relationshipType:
 *           type: string
 *           enum: [father, mother, guardian, other]
 *           description: 关系类型
 *         isEmergencyContact:
 *           type: boolean
 *           description: 是否为紧急联系人
 *         isPickupAuthorized:
 *           type: boolean
 *           description: 是否有接送权限
 *         notes:
 *           type: string
 *           description: 备注信息
*     
 *     AddParentStudentRequest:
 *       type: object
 *       properties:
 *         studentId:
 *           type: integer
 *           description: 学生ID
 *         relationshipType:
 *           type: string
 *           enum: [father, mother, guardian, other]
 *           description: 关系类型
 *         isEmergencyContact:
 *           type: boolean
 *           description: 是否为紧急联系人
 *           default: false
 *         isPickupAuthorized:
 *           type: boolean
 *           description: 是否有接送权限
 *           default: true
 *         notes:
 *           type: string
 *           description: 备注信息
 *       required:
 *         - studentId
 *         - relationshipType
*/

/**
* @swagger
 * /api/parent-student-relations:
 *   get:
 *     tags: [Parent-Student Relations]
 *     summary: 获取所有亲子关系
 *     description: 获取系统中所有的家长-学生关系记录
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页记录数
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: 筛选指定家长的关系
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: 筛选指定学生的关系
 *       - in: query
 *         name: relationshipType
 *         schema:
 *           type: string
 *           enum: [father, mother, guardian, other]
 *         description: 筛选关系类型
 *     responses:
 *       200:
 *         description: 成功获取亲子关系列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     relations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ParentStudentRelation'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                     currentPage:
 *                       type: integer
 *                       description: 当前页码
 *                     totalPages:
 *                       type: integer
 *                       description: 总页数
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
*/
router.get('/', checkPermission('parent:manage'), parentStudentRelationController.getAllRelations);

/**
* @swagger
 * /api/parent-student-relations/{id}:
 *   put:
 *     tags: [Parent-Student Relations]
 *     summary: 更新亲子关系信息
 *     description: 更新指定ID的家长-学生关系信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 关系ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateParentStudentRelationRequest'
 *     responses:
 *       200:
 *         description: 成功更新亲子关系
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "更新成功"
 *                 data:
 *                   $ref: '#/components/schemas/ParentStudentRelation'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 关系不存在
 *       500:
 *         description: 服务器错误
*/
router.put('/:id', checkPermission('parent:manage'), parentStudentRelationController.updateRelation);

/**
* @swagger
 * /api/parent-student-relations/parents/{id}/students:
 *   get:
 *     tags: [Parent-Student Relations]
 *     summary: 获取指定家长的所有学生
 *     description: 获取指定家长关联的所有学生信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含非活跃状态的学生
 *     responses:
 *       200:
 *         description: 成功获取家长的学生列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     parentId:
 *                       type: integer
 *                       description: 家长ID
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           student:
 *                             type: object
 *                             description: 学生基本信息
 *                           relationshipType:
 *                             type: string
 *                             description: 关系类型
 *                           isEmergencyContact:
 *                             type: boolean
 *                             description: 是否为紧急联系人
 *                           isPickupAuthorized:
 *                             type: boolean
 *                             description: 是否有接送权限
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长不存在
 *       500:
 *         description: 服务器错误
*/
router.get('/parents/:id/students', checkPermission('parent:manage'), parentStudentRelationController.getParentStudents);

/**
* @swagger
 * /api/parent-student-relations/parents/{id}/students:
 *   post:
 *     tags: [Parent-Student Relations]
 *     summary: 为指定家长添加学生关系
 *     description: 为指定家长建立与学生的关系
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddParentStudentRequest'
 *     responses:
 *       201:
 *         description: 成功添加家长-学生关系
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "添加成功"
 *                 data:
 *                   $ref: '#/components/schemas/ParentStudentRelation'
 *       400:
 *         description: 请求参数错误或关系已存在
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长或学生不存在
 *       500:
 *         description: 服务器错误
*/
router.post('/parents/:id/students', checkPermission('parent:manage'), parentStudentRelationController.addParentStudent);

/**
* @swagger
 * /api/parent-student-relations/parents/{parentId}/students/{studentId}:
 *   delete:
 *     tags: [Parent-Student Relations]
 *     summary: 删除指定家长的学生关系
 *     description: 删除指定家长与学生之间的关系
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
 *     responses:
 *       200:
 *         description: 成功删除家长-学生关系
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "删除成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedRelationId:
 *                       type: integer
 *                       description: 被删除的关系ID
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 关系不存在
 *       500:
 *         description: 服务器错误
*/
router.delete('/parents/:parentId/students/:studentId', checkPermission('parent:manage'), parentStudentRelationController.removeParentStudent);

/**
* @swagger
 * /api/parent-student-relations/students/{id}/parents:
 *   get:
 *     tags: [Parent-Student Relations]
 *     summary: 获取指定学生的所有家长
 *     description: 获取指定学生关联的所有家长信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含非活跃状态的家长
 *       - in: query
 *         name: emergencyOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 仅获取紧急联系人
 *     responses:
 *       200:
 *         description: 成功获取学生的家长列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: integer
 *                       description: 学生ID
 *                     parents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           parent:
 *                             type: object
 *                             description: 家长基本信息
 *                           relationshipType:
 *                             type: string
 *                             description: 关系类型
 *                           isEmergencyContact:
 *                             type: boolean
 *                             description: 是否为紧急联系人
 *                           isPickupAuthorized:
 *                             type: boolean
 *                             description: 是否有接送权限
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生不存在
 *       500:
 *         description: 服务器错误
*/
router.get('/students/:id/parents', checkPermission('parent:manage'), parentStudentRelationController.getStudentParents);

export default router;