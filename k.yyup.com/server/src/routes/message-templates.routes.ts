import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * components:
 *   schemas:
 *     MessageTemplate:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 消息模板ID
 *         name:
 *           type: string
 *           description: 模板名称
 *         type:
 *           type: string
 *           enum: [SMS, EMAIL, PUSH, WECHAT]
 *           description: 消息类型
 *         subject:
 *           type: string
 *           description: 消息主题（邮件标题等）
 *         content:
 *           type: string
 *           description: 消息内容模板
 *         variables:
 *           type: array
 *           items:
 *             type: string
 *           description: 模板变量列表
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           description: 模板状态
 *         category:
 *           type: string
 *           description: 消息分类
 *         description:
 *           type: string
 *           description: 模板描述
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *       required:
 *         - name
 *         - type
 *         - content
*
 *     MessageTemplateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 模板名称
 *           maxLength: 100
 *         type:
 *           type: string
 *           enum: [SMS, EMAIL, PUSH, WECHAT]
 *           description: 消息类型
 *         subject:
 *           type: string
 *           description: 消息主题
 *           maxLength: 200
 *         content:
 *           type: string
 *           description: 消息内容模板
 *         variables:
 *           type: array
 *           items:
 *             type: string
 *           description: 模板变量列表
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           description: 模板状态
 *           default: ACTIVE
 *         category:
 *           type: string
 *           description: 消息分类
 *           maxLength: 50
 *         description:
 *           type: string
 *           description: 模板描述
 *           maxLength: 500
 *       required:
 *         - name
 *         - type
 *         - content
*
 *     MessageTemplateList:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MessageTemplate'
 *         total:
 *           type: integer
 *           description: 总记录数
 *         page:
 *           type: integer
 *           description: 当前页码
 *         pageSize:
 *           type: integer
 *           description: 每页大小
 *         totalPages:
 *           type: integer
 *           description: 总页数
*/

/**
* @swagger
 * /api/message-templates:
 *   get:
 *     summary: 获取消息模板列表
 *     description: 获取消息模板列表，支持分页和过滤
 *     tags: [消息模板管理]
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
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [SMS, EMAIL, PUSH, WECHAT]
 *         description: 消息类型过滤
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: 状态过滤
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 分类过滤
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 关键词搜索（模板名称、内容）
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MessageTemplateList'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/', async (req, res) => {
  try {
    // 模拟消息模板数据
    const templates = [];

    return ApiResponse.success(res, {
      items: templates,
      total: templates.length,
      page: 1,
      pageSize: templates.length,
      totalPages: 1
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取消息模板列表失败');
  }
});

/**
* @swagger
 * /api/message-templates:
 *   post:
 *     summary: 创建消息模板
 *     description: 创建新的消息模板
 *     tags: [消息模板管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessageTemplateInput'
 *           example:
 *             name: "注册成功通知"
 *             type: "SMS"
 *             subject: "欢迎注册"
 *             content: "尊敬的{name}，欢迎注册我们的服务！您的账号：{account}"
 *             variables: ["name", "account"]
 *             category: "用户通知"
 *             description: "用户注册成功后发送的短信通知模板"
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MessageTemplate'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: 模板名称已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "模板名称已存在"
 *               code: "TEMPLATE_EXISTS"
 *       501:
 *         description: 功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "创建消息模板功能暂未实现"
 *               code: "NOT_IMPLEMENTED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.post('/', async (req, res) => {
  try {
    return ApiResponse.error(res, '创建消息模板功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '创建消息模板失败');
  }
});

/**
* @swagger
 * /api/message-templates/{id}:
 *   get:
 *     summary: 获取消息模板详情
 *     description: 根据ID获取特定消息模板的详细信息
 *     tags: [消息模板管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 消息模板ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MessageTemplate'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 消息模板不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "消息模板不存在"
 *               code: "TEMPLATE_NOT_FOUND"
 *       501:
 *         description: 功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "消息模板详情功能暂未实现"
 *               code: "NOT_IMPLEMENTED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/:id', async (req, res) => {
  try {
    return ApiResponse.error(res, '消息模板详情功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取消息模板详情失败');
  }
});

/**
* @swagger
 * /api/message-templates/{id}:
 *   put:
 *     summary: 更新消息模板
 *     description: 根据ID更新特定消息模板的信息
 *     tags: [消息模板管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 消息模板ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessageTemplateInput'
 *           example:
 *             name: "注册成功通知（更新版）"
 *             type: "EMAIL"
 *             subject: "欢迎注册我们的服务"
 *             content: "尊敬的{name}，感谢您注册我们的服务！您的账号：{account}，登录密码已发送至您的邮箱。"
 *             variables: ["name", "account"]
 *             status: "ACTIVE"
 *             category: "用户通知"
 *             description: "用户注册成功后发送的邮件通知模板（更新版）"
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MessageTemplate'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 消息模板不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "消息模板不存在"
 *               code: "TEMPLATE_NOT_FOUND"
 *       409:
 *         description: 模板名称已存在（当修改名称时）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "模板名称已存在"
 *               code: "TEMPLATE_EXISTS"
 *       501:
 *         description: 功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "更新消息模板功能暂未实现"
 *               code: "NOT_IMPLEMENTED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.put('/:id', async (req, res) => {
  try {
    return ApiResponse.error(res, '更新消息模板功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '更新消息模板失败');
  }
});

/**
* @swagger
 * /api/message-templates/{id}:
 *   delete:
 *     summary: 删除消息模板
 *     description: 根据ID删除特定的消息模板
 *     tags: [消息模板管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 消息模板ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "消息模板删除成功"
 *               data: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 消息模板不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "消息模板不存在"
 *               code: "TEMPLATE_NOT_FOUND"
 *       409:
 *         description: 模板正在使用中，无法删除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "模板正在使用中，无法删除"
 *               code: "TEMPLATE_IN_USE"
 *       501:
 *         description: 功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "删除消息模板功能暂未实现"
 *               code: "NOT_IMPLEMENTED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.delete('/:id', async (req, res) => {
  try {
    return ApiResponse.error(res, '删除消息模板功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '删除消息模板失败');
  }
});

export default router; 