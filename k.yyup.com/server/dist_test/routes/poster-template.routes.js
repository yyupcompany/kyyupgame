"use strict";
exports.__esModule = true;
var express_1 = require("express");
var poster_template_controller_1 = require("../controllers/poster-template.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: PosterTemplate
 *   description: 海报模板管理API
 *
 * components:
 *   schemas:
 *     PosterTemplate:
 *       type: object
 *       required:
 *         - name
 *         - category_id
 *         - design_data
 *       properties:
 *         id:
 *           type: integer
 *           description: 模板ID
 *         name:
 *           type: string
 *           description: 模板名称
 *         description:
 *           type: string
 *           description: 模板描述
 *         category_id:
 *           type: integer
 *           description: 分类ID
 *         thumbnail_url:
 *           type: string
 *           description: 缩略图URL
 *         design_data:
 *           type: object
 *           description: 设计数据JSON
 *         width:
 *           type: integer
 *           description: 模板宽度
 *         height:
 *           type: integer
 *           description: 模板高度
 *         is_active:
 *           type: boolean
 *           description: 是否激活
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *
 *     PosterTemplateElement:
 *       type: object
 *       required:
 *         - type
 *         - properties
 *       properties:
 *         id:
 *           type: integer
 *           description: 元素ID
 *         template_id:
 *           type: integer
 *           description: 模板ID
 *         type:
 *           type: string
 *           enum: [text, image, shape, background]
 *           description: 元素类型
 *         properties:
 *           type: object
 *           description: 元素属性JSON
 *         z_index:
 *           type: integer
 *           description: 层级索引
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *
 *     PosterTemplateCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 分类ID
 *         name:
 *           type: string
 *           description: 分类名称
 *         description:
 *           type: string
 *           description: 分类描述
 *         is_active:
 *           type: boolean
 *           description: 是否激活
 *
 *     CreateTemplateRequest:
 *       type: object
 *       required:
 *         - name
 *         - category_id
 *         - design_data
 *       properties:
 *         name:
 *           type: string
 *           description: 模板名称
 *         description:
 *           type: string
 *           description: 模板描述
 *         category_id:
 *           type: integer
 *           description: 分类ID
 *         thumbnail_url:
 *           type: string
 *           description: 缩略图URL
 *         design_data:
 *           type: object
 *           description: 设计数据JSON
 *         width:
 *           type: integer
 *           description: 模板宽度
 *         height:
 *           type: integer
 *           description: 模板高度
 *
 *     UpdateTemplateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 模板名称
 *         description:
 *           type: string
 *           description: 模板描述
 *         category_id:
 *           type: integer
 *           description: 分类ID
 *         thumbnail_url:
 *           type: string
 *           description: 缩略图URL
 *         design_data:
 *           type: object
 *           description: 设计数据JSON
 *         width:
 *           type: integer
 *           description: 模板宽度
 *         height:
 *           type: integer
 *           description: 模板高度
 *         is_active:
 *           type: boolean
 *           description: 是否激活
 *
 *     AddElementRequest:
 *       type: object
 *       required:
 *         - type
 *         - properties
 *       properties:
 *         type:
 *           type: string
 *           enum: [text, image, shape, background]
 *           description: 元素类型
 *         properties:
 *           type: object
 *           description: 元素属性JSON
 *         z_index:
 *           type: integer
 *           description: 层级索引
 *
 *     UpdateElementRequest:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [text, image, shape, background]
 *           description: 元素类型
 *         properties:
 *           type: object
 *           description: 元素属性JSON
 *         z_index:
 *           type: integer
 *           description: 层级索引
 *
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @swagger
 * /poster-template:
 *   post:
 *     summary: 创建海报模板
 *     tags: [PosterTemplate]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTemplateRequest'
 *     responses:
 *       '201':
 *         description: 海报模板创建成功
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
 *                   example: 海报模板创建成功
 *                 data:
 *                   $ref: '#/components/schemas/PosterTemplate'
 *       '400':
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('POSTER_TEMPLATE_MANAGE'), poster_template_controller_1.createTemplate);
/**
 * @swagger
 * /poster-template/{id}:
 *   get:
 *     summary: 根据ID获取海报模板
 *     tags: [PosterTemplate]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 模板ID
 *     responses:
 *       '200':
 *         description: 获取海报模板成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PosterTemplate'
 *       '404':
 *         description: 模板不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', auth_middleware_1.verifyToken, 
// 移除权限检查，允许所有登录用户查看模板详情
// checkPermission('POSTER_TEMPLATE_MANAGE'),
poster_template_controller_1.getTemplateById);
/**
 * @swagger
 * /poster-template/{id}:
 *   put:
 *     summary: 更新海报模板
 *     tags: [PosterTemplate]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 模板ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTemplateRequest'
 *     responses:
 *       '200':
 *         description: 海报模板更新成功
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
 *                   example: 海报模板更新成功
 *                 data:
 *                   $ref: '#/components/schemas/PosterTemplate'
 *       '400':
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: 模板不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('POSTER_TEMPLATE_MANAGE'), poster_template_controller_1.updateTemplate);
/**
 * @swagger
 * /poster-template/{id}:
 *   delete:
 *     summary: 删除海报模板
 *     tags: [PosterTemplate]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 模板ID
 *     responses:
 *       '200':
 *         description: 海报模板删除成功
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
 *                   example: 海报模板删除成功
 *       '404':
 *         description: 模板不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('POSTER_TEMPLATE_MANAGE'), poster_template_controller_1.deleteTemplate);
/**
 * @swagger
 * /poster-template:
 *   get:
 *     summary: 获取海报模板列表
 *     tags: [PosterTemplate]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: 分类ID筛选
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 关键词搜索
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: 是否激活筛选
 *     responses:
 *       '200':
 *         description: 获取海报模板列表成功
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
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PosterTemplate'
 *                     total:
 *                       type: integer
 *                       description: 总数量
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     page_size:
 *                       type: integer
 *                       description: 每页数量
 *       '401':
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', auth_middleware_1.verifyToken, 
// 移除权限检查，允许所有登录用户查看模板列表
// checkPermission('POSTER_TEMPLATE_MANAGE'),
poster_template_controller_1.getTemplates);
/**
 * @swagger
 * /poster-template/{id}/preview:
 *   get:
 *     summary: 预览海报模板
 *     tags: [PosterTemplate]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 模板ID
 *       - in: query
 *         name: width
 *         schema:
 *           type: integer
 *         description: 预览宽度
 *       - in: query
 *         name: height
 *         schema:
 *           type: integer
 *         description: 预览高度
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [png, jpg, svg]
 *           default: png
 *         description: 预览格式
 *     responses:
 *       '200':
 *         description: 海报模板预览成功
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
 *                     preview_url:
 *                       type: string
 *                       description: 预览图片URL
 *                     preview_data:
 *                       type: string
 *                       description: 预览数据（Base64编码）
 *       '404':
 *         description: 模板不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/preview', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('POSTER_TEMPLATE_MANAGE'), poster_template_controller_1.previewTemplate);
/**
 * @swagger
 * /poster-template/{id}/elements:
 *   post:
 *     summary: 向海报模板添加元素
 *     tags: [PosterTemplate]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 模板ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddElementRequest'
 *     responses:
 *       '201':
 *         description: 元素添加成功
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
 *                   example: 元素添加成功
 *                 data:
 *                   $ref: '#/components/schemas/PosterTemplateElement'
 *       '400':
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: 模板不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/elements', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('POSTER_TEMPLATE_MANAGE'), poster_template_controller_1.addElement);
/**
 * @swagger
 * /poster-template/{id}/elements/{elementId}:
 *   put:
 *     summary: 更新海报模板元素
 *     tags: [PosterTemplate]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 模板ID
 *       - in: path
 *         name: elementId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 元素ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateElementRequest'
 *     responses:
 *       '200':
 *         description: 元素更新成功
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
 *                   example: 元素更新成功
 *                 data:
 *                   $ref: '#/components/schemas/PosterTemplateElement'
 *       '400':
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: 模板或元素不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/elements/:elementId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('POSTER_TEMPLATE_MANAGE'), poster_template_controller_1.updateElement);
/**
 * @swagger
 * /poster-template/{id}/elements/{elementId}:
 *   delete:
 *     summary: 删除海报模板元素
 *     tags: [PosterTemplate]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 模板ID
 *       - in: path
 *         name: elementId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 元素ID
 *     responses:
 *       '200':
 *         description: 元素删除成功
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
 *                   example: 元素删除成功
 *       '404':
 *         description: 模板或元素不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router["delete"]('/:id/elements/:elementId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('POSTER_TEMPLATE_MANAGE'), poster_template_controller_1.deleteElement);
/**
 * @swagger
 * /poster-template/categories:
 *   get:
 *     summary: 获取海报模板分类列表
 *     tags: [PosterTemplate]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: 是否激活筛选
 *     responses:
 *       '200':
 *         description: 获取分类列表成功
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
 *                     $ref: '#/components/schemas/PosterTemplateCategory'
 *       '401':
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/categories', auth_middleware_1.verifyToken, 
// 移除权限检查，允许所有登录用户查看分类列表
// checkPermission('POSTER_TEMPLATE_MANAGE'),
poster_template_controller_1.getCategories);
exports["default"] = router;
