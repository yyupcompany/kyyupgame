/**
* @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Group ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Group 名称
 *           example: "示例Group"
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
 *     CreateGroupRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Group 名称
 *           example: "新Group"
 *     UpdateGroupRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Group 名称
 *           example: "更新后的Group"
 *     GroupListResponse:
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
 *                 $ref: '#/components/schemas/Group'
 *         message:
 *           type: string
 *           example: "获取group列表成功"
 *     GroupResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Group'
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
 * group管理路由文件
 * 提供group的基础CRUD操作
*
 * 功能包括：
 * - 获取group列表
 * - 创建新group
 * - 获取group详情
 * - 更新group信息
 * - 删除group
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import groupController from '../controllers/group.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
 * 集团管理路由
 * 基础路径: /api/groups
*/

// ==================== 集团基础管理 ====================

/**
* @swagger
 * /api/groups:
 *   get:
 *     summary: 获取集团列表
 *     description: 获取所有幼儿园集团的列表，支持分页和条件筛选
 *     tags:
 *       - 集团管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 20
 *         description: 每页数量
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *           example: "阳光教育"
 *         description: 搜索关键词
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           example: "active"
 *         description: 集团状态
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [chain, franchise, independent]
 *           example: "chain"
 *         description: 集团类型
 *       - in: query
 *         name: investorId
 *         schema:
 *           type: integer
 *           example: 123
 *         description: 投资者ID
 *     responses:
 *       200:
 *         description: 成功获取集团列表
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Group'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/', groupController.getGroupList);

/**
* @swagger
 * /api/groups/my:
 *   get:
 *     summary: 获取当前用户的集团列表
 *     description: 获取当前用户所属的所有集团信息
 *     tags:
 *       - 集团管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户集团列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                         description: 集团ID
 *                       name:
 *                         type: string
 *                         example: "阳光教育集团"
 *                         description: 集团名称
 *                       role:
 *                         type: string
 *                         enum: [admin, manager, teacher, parent]
 *                         example: "admin"
 *                         description: 用户在集团中的角色
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["group:read", "group:write", "member:manage"]
 *                         description: 用户权限列表
 *                       joinDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-15T10:30:00Z"
 *                         description: 加入集团时间
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/my', groupController.getUserGroups);

/**
* @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: 获取集团详情
 *     description: 获取指定幼儿园集团的详细信息
 *     tags:
 *       - 集团管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 集团ID
 *     responses:
 *       200:
 *         description: 成功获取集团详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/GroupDetail'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/:id', groupController.getGroupDetail);

/**
* @swagger
 * /api/groups:
 *   post:
 *     summary: 创建幼儿园集团
 *     description: 创建新的幼儿园集团，支持连锁、加盟、独立等多种类型，提供完整的集团信息管理功能
 *     tags:
 *       - 集团管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - type
 *               - legalPerson
 *             properties:
 *               name:
 *                 type: string
 *                 example: "阳光教育集团"
 *                 description: 集团名称（必填）
 *               code:
 *                 type: string
 *                 example: "YGJY2023"
 *                 description: 集团编码，唯一标识（必填）
 *               type:
 *                 type: string
 *                 enum: [chain, franchise, independent]
 *                 example: "chain"
 *                 description: 集团类型（必填）：chain-连锁，franchise-加盟，independent-独立
 *               legalPerson:
 *                 type: string
 *                 example: "张三"
 *                 description: 法人代表（必填）
 *               description:
 *                 type: string
 *                 example: "专注于幼儿教育的综合性教育集团"
 *                 description: 集团描述（可选）
 *               address:
 *                 type: string
 *                 example: "北京市朝阳区建国路88号"
 *                 description: 集团地址（可选）
 *               phone:
 *                 type: string
 *                 example: "010-12345678"
 *                 description: 联系电话（可选）
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contact@yangguangedu.com"
 *                 description: 邮箱地址（可选）
 *               website:
 *                 type: string
 *                 example: "https://www.yangguangedu.com"
 *                 description: 官方网站（可选）
 *               logoUrl:
 *                 type: string
 *                 example: "https://example.com/logo.png"
 *                 description: 集团Logo URL（可选）
 *               businessLicense:
 *                 type: string
 *                 example: "91110000123456789X"
 *                 description: 营业执照号（可选）
 *               establishedDate:
 *                 type: string
 *                 format: date
 *                 example: "2020-01-15"
 *                 description: 成立日期（可选）
 *               registeredCapital:
 *                 type: number
 *                 example: 5000000
 *                 description: 注册资本（可选）
 *               investorId:
 *                 type: integer
 *                 example: 1
 *                 description: 投资者ID（可选）
 *               settings:
 *                 type: object
 *                 properties:
 *                   maxKindergartens:
 *                     type: integer
 *                     example: 50
 *                     description: 最大幼儿园数量限制
 *                   enableMultiSite:
 *                     type: boolean
 *                     example: true
 *                     description: 是否启用多园区管理
 *                   enableCentralizedProcurement:
 *                     type: boolean
 *                     example: true
 *                     description: 是否启用集中采购
 *     responses:
 *       201:
 *         description: 成功创建集团
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                       description: 集团ID
 *                     name:
 *                       type: string
 *                       example: "阳光教育集团"
 *                     code:
 *                       type: string
 *                       example: "YGJY2023"
 *                     type:
 *                       type: string
 *                       example: "chain"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T14:30:00Z"
 *                     createdBy:
 *                       type: string
 *                       example: "管理员"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: 集团编码已存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "集团编码已存在"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.post('/', groupController.createGroup);

/**
* @swagger
 * /api/groups/{id}:
 *   put:
 *     summary: 更新集团信息
 *     description: 更新指定集团的基本信息，需要集团管理员权限，支持部分更新和完整信息修改
 *     tags:
 *       - 集团管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 集团ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "阳光教育集团（更新）"
 *                 description: 集团名称
 *               description:
 *                 type: string
 *                 example: "专注于幼儿教育的综合性教育集团，提供高品质教育服务"
 *                 description: 集团描述
 *               address:
 *                 type: string
 *                 example: "北京市朝阳区建国路88号SOHO现代城"
 *                 description: 集团地址
 *               phone:
 *                 type: string
 *                 example: "010-87654321"
 *                 description: 联系电话
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "info@yangguangedu.com"
 *                 description: 邮箱地址
 *               website:
 *                 type: string
 *                 example: "https://www.yangguangedu.com.cn"
 *                 description: 官方网站
 *               logoUrl:
 *                 type: string
 *                 example: "https://example.com/new-logo.png"
 *                 description: 集团Logo URL
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 example: "active"
 *                 description: 集团状态
 *               settings:
 *                 type: object
 *                 properties:
 *                   maxKindergartens:
 *                     type: integer
 *                     example: 100
 *                     description: 最大幼儿园数量限制
 *                   enableMultiSite:
 *                     type: boolean
 *                     example: true
 *                     description: 是否启用多园区管理
 *                   enableCentralizedProcurement:
 *                     type: boolean
 *                     example: true
 *                     description: 是否启用集中采购
 *                   enableUnifiedCurriculum:
 *                     type: boolean
 *                     example: true
 *                     description: 是否启用统一课程
 *               changeReason:
 *                 type: string
 *                 required: true
 *                 example: "更新集团联系信息和Logo"
 *                 description: 修改原因（必填）
 *     responses:
 *       200:
 *         description: 成功更新集团信息
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "阳光教育集团（更新）"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T15:30:00Z"
 *                     updatedBy:
 *                       type: string
 *                       example: "集团管理员"
 *                     changeReason:
 *                       type: string
 *                       example: "更新集团联系信息和Logo"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 无权限修改该集团信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "无权限修改该集团信息"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.put('/:id', groupController.updateGroup);

/**
* @swagger
 * /api/groups/{id}:
 *   delete:
 *     summary: 删除集团
 *     description: 删除指定的幼儿园集团，仅投资人权限，删除操作不可恢复，将同时删除相关联的所有数据
 *     tags:
 *       - 集团管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 集团ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deleteReason
 *               - confirmation
 *             properties:
 *               deleteReason:
 *                 type: string
 *                 example: "业务调整，停止运营"
 *                 description: 删除原因（必填）
 *               confirmation:
 *                 type: string
 *                 example: "DELETE_GROUP_1"
 *                 description: 删除确认码，格式：DELETE_GROUP_{集团ID}（必填）
 *               transferData:
 *                 type: object
 *                 properties:
 *                   transferToGroupId:
 *                     type: integer
 *                     example: 2
 *                     description: 数据转移到的目标集团ID（可选）
 *                   keepKindergartens:
 *                     type: boolean
 *                     example: false
 *                     description: 是否保留幼儿园独立运营（可选）
 *     responses:
 *       200:
 *         description: 成功删除集团
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
 *                     deletedGroupId:
 *                       type: integer
 *                       example: 1
 *                     groupName:
 *                       type: string
 *                       example: "阳光教育集团"
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T16:30:00Z"
 *                     deletedBy:
 *                       type: string
 *                       example: "投资人"
 *                     deleteReason:
 *                       type: string
 *                       example: "业务调整，停止运营"
 *                     affectedResources:
 *                       type: object
 *                       properties:
 *                         kindergartens:
 *                           type: integer
 *                           example: 5
 *                         users:
 *                           type: integer
 *                           example: 120
 *                         records:
 *                           type: integer
 *                           example: 5000
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 无权限删除该集团或确认码错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "无权限删除该集团或确认码错误"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: 集团下还有幼儿园，无法删除
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "请先处理集团下的幼儿园，然后再删除集团"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.delete('/:id', groupController.deleteGroup);

// ==================== 集团用户管理 ====================

/**
* @swagger
 * /api/groups/{groupId}/users:
 *   get:
 *     summary: 获取集团用户列表
 *     description: 获取指定集团的所有用户列表，支持分页查询和角色筛选，显示用户在集团中的角色和权限信息
 *     tags:
 *       - 集团管理
 *       - 集团用户管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 集团ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *           minimum: 1
 *         description: 页码（可选，默认1）
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 20
 *           minimum: 1
 *           maximum: 100
 *         description: 每页数量（可选，默认20）
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, manager, teacher, parent]
 *           example: "teacher"
 *         description: 角色筛选（可选）
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           example: "active"
 *         description: 用户状态筛选（可选）
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *           example: "张老师"
 *         description: 搜索关键词（可选）
 *     responses:
 *       200:
 *         description: 成功获取集团用户列表
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
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: integer
 *                             example: 123
 *                             description: 用户ID
 *                           username:
 *                             type: string
 *                             example: "teacher001"
 *                             description: 用户名
 *                           realName:
 *                             type: string
 *                             example: "张老师"
 *                             description: 真实姓名
 *                           email:
 *                             type: string
 *                             example: "zhang@kindergarten.com"
 *                             description: 邮箱
 *                           phone:
 *                             type: string
 *                             example: "13800138000"
 *                             description: 手机号
 *                           role:
 *                             type: string
 *                             enum: [admin, manager, teacher, parent]
 *                             example: "teacher"
 *                             description: 集团角色
 *                           roleName:
 *                             type: string
 *                             example: "教师"
 *                             description: 角色名称
 *                           permissions:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["group:read", "member:view"]
 *                             description: 用户权限列表
 *                           status:
 *                             type: string
 *                             enum: [active, inactive, suspended]
 *                             example: "active"
 *                             description: 用户状态
 *                           joinDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-01-15T10:30:00Z"
 *                             description: 加入集团时间
 *                           lastLoginAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-12-01T09:15:00Z"
 *                             description: 最后登录时间
 *                           kindergartenNames:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["阳光幼儿园", "希望幼儿园"]
 *                             description: 可访问的幼儿园列表
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 20
 *                         totalItems:
 *                           type: integer
 *                           example: 85
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                           example: 85
 *                         activeUsers:
 *                           type: integer
 *                           example: 78
 *                         roleDistribution:
 *                           type: object
 *                           properties:
 *                             admin:
 *                               type: integer
 *                               example: 3
 *                             manager:
 *                               type: integer
 *                               example: 8
 *                             teacher:
 *                               type: integer
 *                               example: 45
 *                             parent:
 *                               type: integer
 *                               example: 29
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 无权限查看该集团用户
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "无权限查看该集团用户"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/:groupId/users', groupController.getGroupUsers);

/**
* @route   POST /api/groups/:groupId/users
* @desc    添加集团用户
* @access  Private (需要集团管理员权限)
* @param   groupId - 集团ID
* @body    userId, role, canViewAllKindergartens, canManageKindergartens, etc.
*/
router.post('/:groupId/users', groupController.addGroupUser);

/**
* @route   PUT /api/groups/:groupId/users/:userId
* @desc    更新集团用户权限
* @access  Private (需要集团管理员权限)
* @param   groupId - 集团ID
* @param   userId - 用户ID
* @body    role, canViewAllKindergartens, canManageKindergartens, etc.
*/
router.put('/:groupId/users/:userId', groupController.updateGroupUser);

/**
* @route   DELETE /api/groups/:groupId/users/:userId
* @desc    移除集团用户
* @access  Private (需要集团管理员权限)
* @param   groupId - 集团ID
* @param   userId - 用户ID
*/
router.delete('/:groupId/users/:userId', groupController.removeGroupUser);

// ==================== 集团统计数据 ====================

/**
* @route   GET /api/groups/:id/statistics
* @desc    获取集团统计数据
* @access  Private
* @param   id - 集团ID
*/
router.get('/:id/statistics', groupController.getGroupStatistics);

/**
* @route   GET /api/groups/:id/activities
* @desc    获取集团活动数据
* @access  Private
* @param   id - 集团ID
* @query   startDate, endDate
*/
router.get('/:id/activities', groupController.getGroupActivities);

/**
* @route   GET /api/groups/:id/enrollment
* @desc    获取集团招生数据
* @access  Private
* @param   id - 集团ID
* @query   year
*/
router.get('/:id/enrollment', groupController.getGroupEnrollment);

// ==================== 集团升级管理 ====================

/**
* @route   GET /api/groups/check-upgrade
* @desc    检测升级资格
* @access  Private
*/
router.get('/check-upgrade', groupController.checkUpgradeEligibility);

/**
* @route   POST /api/groups/upgrade
* @desc    单园所升级为集团
* @access  Private
* @body    groupName, groupCode, kindergartenIds, headquartersId, brandName, slogan, description
*/
router.post('/upgrade', groupController.upgradeToGroup);

/**
* @route   POST /api/groups/:id/add-kindergarten
* @desc    园所加入集团
* @access  Private (需要集团管理员权限)
* @param   id - 集团ID
* @body    kindergartenId, groupRole
*/
router.post('/:id/add-kindergarten', groupController.addKindergartenToGroup);

/**
* @route   POST /api/groups/:id/remove-kindergarten
* @desc    园所退出集团
* @access  Private (需要集团管理员权限)
* @param   id - 集团ID
* @body    kindergartenId
*/
router.post('/:id/remove-kindergarten', groupController.removeKindergartenFromGroup);

export default router;

