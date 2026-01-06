"use strict";
exports.__esModule = true;
var express_1 = require("express");
var kindergarten_controller_1 = require("../controllers/kindergarten.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     Kindergarten:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - principal_id
 *       properties:
 *         id:
 *           type: integer
 *           description: 幼儿园唯一标识符
 *           example: 1
 *         name:
 *           type: string
 *           description: 幼儿园名称
 *           maxLength: 100
 *           example: "阳光幼儿园"
 *         address:
 *           type: string
 *           description: 幼儿园地址
 *           maxLength: 255
 *           example: "北京市朝阳区xxx街道xxx号"
 *         phone:
 *           type: string
 *           description: 联系电话
 *           maxLength: 20
 *           example: "010-12345678"
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *           maxLength: 100
 *           example: "sunshine@kindergarten.com"
 *         principal_id:
 *           type: integer
 *           description: 园长用户ID
 *           example: 5
 *         capacity:
 *           type: integer
 *           description: 幼儿园容量（学生人数）
 *           minimum: 1
 *           example: 200
 *         description:
 *           type: string
 *           description: 幼儿园描述
 *           example: "专注于儿童全面发展的优质幼儿园"
 *         established_date:
 *           type: string
 *           format: date
 *           description: 建园日期
 *           example: "2020-01-01"
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *           description: 幼儿园状态
 *           example: "active"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     KindergartenCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - principal_id
 *       properties:
 *         name:
 *           type: string
 *           description: 幼儿园名称
 *           maxLength: 100
 *           example: "阳光幼儿园"
 *         address:
 *           type: string
 *           description: 幼儿园地址
 *           maxLength: 255
 *           example: "北京市朝阳区xxx街道xxx号"
 *         phone:
 *           type: string
 *           description: 联系电话
 *           maxLength: 20
 *           example: "010-12345678"
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *           maxLength: 100
 *           example: "sunshine@kindergarten.com"
 *         principal_id:
 *           type: integer
 *           description: 园长用户ID
 *           example: 5
 *         capacity:
 *           type: integer
 *           description: 幼儿园容量
 *           minimum: 1
 *           example: 200
 *         description:
 *           type: string
 *           description: 幼儿园描述
 *           example: "专注于儿童全面发展的优质幼儿园"
 *         established_date:
 *           type: string
 *           format: date
 *           description: 建园日期
 *           example: "2020-01-01"
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *           description: 幼儿园状态
 *           default: active
 *           example: "active"
 *     KindergartenUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 幼儿园名称
 *           maxLength: 100
 *           example: "阳光幼儿园"
 *         address:
 *           type: string
 *           description: 幼儿园地址
 *           maxLength: 255
 *           example: "北京市朝阳区xxx街道xxx号"
 *         phone:
 *           type: string
 *           description: 联系电话
 *           maxLength: 20
 *           example: "010-12345678"
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *           maxLength: 100
 *           example: "sunshine@kindergarten.com"
 *         principal_id:
 *           type: integer
 *           description: 园长用户ID
 *           example: 5
 *         capacity:
 *           type: integer
 *           description: 幼儿园容量
 *           minimum: 1
 *           example: 200
 *         description:
 *           type: string
 *           description: 幼儿园描述
 *           example: "专注于儿童全面发展的优质幼儿园"
 *         established_date:
 *           type: string
 *           format: date
 *           description: 建园日期
 *           example: "2020-01-01"
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *           description: 幼儿园状态
 *           example: "active"
 */
/**
 * @swagger
 * /api/kindergarten:
 *   post:
 *     summary: 创建幼儿园
 *     description: 创建新的幼儿园记录，需要幼儿园管理权限
 *     tags: [Kindergarten Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KindergartenCreateRequest'
 *           examples:
 *             basic:
 *               summary: 基本幼儿园信息
 *               value:
 *                 name: "阳光幼儿园"
 *                 address: "北京市朝阳区阳光街道123号"
 *                 phone: "010-12345678"
 *                 email: "sunshine@kindergarten.com"
 *                 principal_id: 5
 *                 capacity: 200
 *                 description: "专注于儿童全面发展的优质幼儿园"
 *                 established_date: "2020-01-01"
 *                 status: "active"
 *             minimal:
 *               summary: 最小必填信息
 *               value:
 *                 name: "希望幼儿园"
 *                 address: "上海市浦东新区希望路456号"
 *                 principal_id: 8
 *     responses:
 *       201:
 *         description: 幼儿园创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "幼儿园创建成功"
 *                 data:
 *                   $ref: '#/components/schemas/Kindergarten'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_required:
 *                 summary: 缺少必填字段
 *                 value:
 *                   success: false
 *                   message: "缺少必填字段"
 *                   errors: ["幼儿园名称不能为空", "地址不能为空", "园长ID不能为空"]
 *               invalid_email:
 *                 summary: 邮箱格式错误
 *                 value:
 *                   success: false
 *                   message: "邮箱格式不正确"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: 数据冲突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "幼儿园名称已存在"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   get:
 *     summary: 获取幼儿园列表
 *     description: 获取所有幼儿园的列表，支持分页和筛选，需要幼儿园管理权限
 *     tags: [Kindergarten Management]
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
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *         description: 按状态筛选
 *         example: active
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（匹配幼儿园名称）
 *         example: "阳光"
 *       - in: query
 *         name: principal_id
 *         schema:
 *           type: integer
 *         description: 按园长ID筛选
 *         example: 5
 *     responses:
 *       200:
 *         description: 幼儿园列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "幼儿园列表获取成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     kindergartens:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Kindergarten'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                           example: 1
 *                         total_pages:
 *                           type: integer
 *                           example: 5
 *                         total_count:
 *                           type: integer
 *                           example: 42
 *                         limit:
 *                           type: integer
 *                           example: 10
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('KINDERGARTEN_MANAGE'), kindergarten_controller_1.KindergartenController.create);
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('KINDERGARTEN_MANAGE'), kindergarten_controller_1.KindergartenController.list);
/**
 * @swagger
 * /api/kindergarten/{id}:
 *   get:
 *     summary: 获取单个幼儿园详情
 *     description: 根据ID获取特定幼儿园的详细信息，需要幼儿园管理权限
 *     tags: [Kindergarten Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 幼儿园ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 幼儿园详情获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "幼儿园详情获取成功"
 *                 data:
 *                   $ref: '#/components/schemas/Kindergarten'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "无效的幼儿园ID"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 幼儿园未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "幼儿园不存在"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   put:
 *     summary: 更新幼儿园信息
 *     description: 更新指定幼儿园的信息，需要幼儿园管理权限
 *     tags: [Kindergarten Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 幼儿园ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KindergartenUpdateRequest'
 *           examples:
 *             partial_update:
 *               summary: 部分字段更新
 *               value:
 *                 name: "新阳光幼儿园"
 *                 phone: "010-87654321"
 *                 capacity: 250
 *             status_update:
 *               summary: 状态更新
 *               value:
 *                 status: "inactive"
 *             full_update:
 *               summary: 完整信息更新
 *               value:
 *                 name: "更新后的幼儿园"
 *                 address: "北京市海淀区新地址789号"
 *                 phone: "010-99999999"
 *                 email: "new@kindergarten.com"
 *                 capacity: 300
 *                 description: "更新后的幼儿园描述"
 *                 status: "active"
 *     responses:
 *       200:
 *         description: 幼儿园信息更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "幼儿园信息更新成功"
 *                 data:
 *                   $ref: '#/components/schemas/Kindergarten'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_id:
 *                 summary: 无效ID
 *                 value:
 *                   success: false
 *                   message: "无效的幼儿园ID"
 *               invalid_data:
 *                 summary: 数据验证失败
 *                 value:
 *                   success: false
 *                   message: "数据验证失败"
 *                   errors: ["邮箱格式不正确", "容量必须大于0"]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 幼儿园未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "幼儿园不存在"
 *       409:
 *         description: 数据冲突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "幼儿园名称已存在"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     summary: 删除幼儿园
 *     description: 删除指定的幼儿园记录，需要幼儿园管理权限
 *     tags: [Kindergarten Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 幼儿园ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 幼儿园删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "幼儿园删除成功"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "无效的幼儿园ID"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 幼儿园未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "幼儿园不存在"
 *       409:
 *         description: 删除冲突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               has_students:
 *                 summary: 存在关联学生
 *                 value:
 *                   success: false
 *                   message: "无法删除，该幼儿园仍有学生"
 *               has_teachers:
 *                 summary: 存在关联教师
 *                 value:
 *                   success: false
 *                   message: "无法删除，该幼儿园仍有教师"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('KINDERGARTEN_MANAGE'), kindergarten_controller_1.KindergartenController.getById);
/**
 * @swagger
 * /api/kindergarten/{id}:
 *   put:
 *     summary: 更新幼儿园信息
 *     tags: [幼儿园管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KindergartenInput'
 *     responses:
 *       200:
 *         description: 幼儿园更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KindergartenResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('KINDERGARTEN_MANAGE'), kindergarten_controller_1.KindergartenController.update);
/**
 * @swagger
 * /api/kindergarten/{id}:
 *   delete:
 *     summary: 删除幼儿园
 *     tags: [幼儿园管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
 *     responses:
 *       200:
 *         description: 幼儿园删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "幼儿园删除成功"
 *       400:
 *         description: 删除失败，存在关联数据
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
 *                   example: "无法删除，该幼儿园仍有教师"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('KINDERGARTEN_MANAGE'), kindergarten_controller_1.KindergartenController["delete"]);
exports["default"] = router;
