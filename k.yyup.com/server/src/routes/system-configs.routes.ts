import { Router } from 'express';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import * as systemConfigController from '../controllers/system-configs.controller';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * components:
 *   schemas:
 *     SystemConfig:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 系统配置唯一标识符
 *         config_key:
 *           type: string
 *           description: 配置项键名
 *         config_value:
 *           type: string
 *           description: 配置项值
 *         config_type:
 *           type: string
 *           enum: [string, number, boolean, json]
 *           description: 配置值类型
 *         config_group:
 *           type: string
 *           description: 配置分组
 *         description:
 *           type: string
 *           description: 配置项描述
 *         is_encrypted:
 *           type: boolean
 *           description: 是否加密存储
 *         is_public:
 *           type: boolean
 *           description: 是否公开访问
 *         sort_order:
 *           type: integer
 *           description: 排序权重
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: 配置状态
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     SystemConfigCreate:
 *       type: object
 *       required:
 *         - config_key
 *         - config_value
 *         - config_type
 *       properties:
 *         config_key:
 *           type: string
 *           description: 配置项键名
 *         config_value:
 *           type: string
 *           description: 配置项值
 *         config_type:
 *           type: string
 *           enum: [string, number, boolean, json]
 *           description: 配置值类型
 *         config_group:
 *           type: string
 *           description: 配置分组
 *         description:
 *           type: string
 *           description: 配置项描述
 *         is_encrypted:
 *           type: boolean
 *           default: false
 *           description: 是否加密存储
 *         is_public:
 *           type: boolean
 *           default: false
 *           description: 是否公开访问
 *         sort_order:
 *           type: integer
 *           default: 0
 *           description: 排序权重
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *           description: 配置状态
 *     SystemConfigUpdate:
 *       type: object
 *       properties:
 *         config_value:
 *           type: string
 *           description: 配置项值
 *         config_type:
 *           type: string
 *           enum: [string, number, boolean, json]
 *           description: 配置值类型
 *         config_group:
 *           type: string
 *           description: 配置分组
 *         description:
 *           type: string
 *           description: 配置项描述
 *         is_encrypted:
 *           type: boolean
 *           description: 是否加密存储
 *         is_public:
 *           type: boolean
 *           description: 是否公开访问
 *         sort_order:
 *           type: integer
 *           description: 排序权重
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: 配置状态
*/

/**
* @swagger
 * /api/system-configs:
 *   get:
 *     summary: 获取系统配置列表
 *     description: |
 *       获取系统配置列表，支持分页、筛选和排序功能。系统配置管理是幼儿园管理系统的
 *       核心功能，用于动态控制各种业务参数和系统行为。
*
 *       **业务场景**：
 *       - 系统管理员查看和管理系统配置
 *       - 动态调整系统参数无需重启服务
 *       - 按业务分类管理配置项
 *       - 配置项的版本控制和审计
*
 *       **权限要求**：需要系统配置查看权限 (SYSTEM_CONFIG_VIEW)
*
 *       **主要功能**：
 *       - 支持按配置分组筛选（basic、upload、system、email等）
 *       - 支持按配置类型筛选（string、number、boolean、json）
 *       - 支持按状态筛选（active、inactive）
 *       - 支持关键词搜索（配置键名、描述）
 *       - 支持多字段排序
 *       - 敏感配置项加密存储
 *       - 支持公开配置项和非公开配置项
*
 *       **配置分组说明**：
 *       - `basic`: 基础配置（网站标题、描述等）
 *       - `upload`: 文件上传配置（大小限制、格式等）
 *       - `system`: 系统配置（维护模式、调试模式等）
 *       - `email`: 邮件配置（SMTP、模板等）
 *       - `security`: 安全配置（密码策略、会话超时等）
 *       - `notification`: 通知配置（短信、推送等）
*
 *       **安全特性**：
 *       - 敏感配置自动加密存储
 *       - 基于角色的访问控制
 *       - 配置变更审计日志
 *       - 防止配置项冲突
 *     tags: [系统配置管理]
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
 *         example: 20
 *       - in: query
 *         name: config_group
 *         schema:
 *           type: string
 *           enum: [basic, upload, system, email, security, notification, payment, ai]
 *         description: 配置分组筛选
 *         example: "basic"
 *       - in: query
 *         name: config_type
 *         schema:
 *           type: string
 *           enum: [string, number, boolean, json]
 *         description: 配置类型筛选
 *         example: "string"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: 状态筛选
 *         example: "active"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 关键词搜索（配置键名、描述）
 *         example: "网站"
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [config_key, config_group, sort_order, created_at, updated_at]
 *           default: sort_order
 *         description: 排序字段
 *         example: "sort_order"
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: 排序方向
 *         example: "asc"
 *     responses:
 *       200:
 *         description: 获取系统配置列表成功
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
 *                     configs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SystemConfig'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                           description: 当前页码
 *                           example: 1
 *                         per_page:
 *                           type: integer
 *                           description: 每页数量
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           description: 总记录数
 *                           example: 45
 *                         total_pages:
 *                           type: integer
 *                           description: 总页数
 *                           example: 3
 *                 message:
 *                   type: string
 *                   example: "获取系统配置列表成功"
 *             examples:
 *               success_response:
 *                 summary: 成功响应示例
 *                 value:
 *                   success: true
 *                   data:
 *                     configs:
 *                       - id: 1
 *                         config_key: "site_title"
 *                         config_value: "智慧幼儿园管理系统"
 *                         config_type: "string"
 *                         config_group: "basic"
 *                         description: "网站标题"
 *                         is_encrypted: false
 *                         is_public: true
 *                         sort_order: 1
 *                         status: "active"
 *                         created_at: "2025-01-01T00:00:00.000Z"
 *                         updated_at: "2025-01-15T10:30:00.000Z"
 *                       - id: 2
 *                         config_key: "max_upload_size"
 *                         config_value: "10485760"
 *                         config_type: "number"
 *                         config_group: "upload"
 *                         description: "最大上传文件大小（字节）"
 *                         is_encrypted: false
 *                         is_public: false
 *                         sort_order: 1
 *                         status: "active"
 *                         created_at: "2025-01-01T00:00:00.000Z"
 *                         updated_at: "2025-01-10T14:20:00.000Z"
 *                     pagination:
 *                       current_page: 1
 *                       per_page: 20
 *                       total: 45
 *                       total_pages: 3
 *                   message: "获取系统配置列表成功"
 *       401:
 *         description: 未授权访问
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
 *                   example: "未授权访问"
 *       403:
 *         description: 权限不足
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
 *                   example: "权限不足，需要系统配置查看权限"
 *       500:
 *         description: 服务器内部错误
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
 *                   example: "获取系统配置列表失败"
 *                 error:
 *                   type: string
 *                   example: "数据库连接错误"
*/
router.get(
  '/', checkPermission('SYSTEM_CONFIG_VIEW'),
  systemConfigController.getSystemConfigs
);

/**
* @swagger
 * /api/system-configs:
 *   post:
 *     summary: 创建系统配置
 *     description: 创建新的系统配置项
 *     tags: [系统配置管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SystemConfigCreate'
 *           examples:
 *             string_config:
 *               summary: 字符串配置示例
 *               value:
 *                 config_key: "site_title"
 *                 config_value: "幼儿园管理系统"
 *                 config_type: "string"
 *                 config_group: "basic"
 *                 description: "网站标题"
 *                 is_public: true
 *                 sort_order: 1
 *             number_config:
 *               summary: 数字配置示例
 *               value:
 *                 config_key: "max_upload_size"
 *                 config_value: "10485760"
 *                 config_type: "number"
 *                 config_group: "upload"
 *                 description: "最大上传文件大小（字节）"
 *                 sort_order: 1
 *             boolean_config:
 *               summary: 布尔配置示例
 *               value:
 *                 config_key: "maintenance_mode"
 *                 config_value: "false"
 *                 config_type: "boolean"
 *                 config_group: "system"
 *                 description: "维护模式开关"
 *                 sort_order: 1
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SystemConfig'
 *                 message:
 *                   type: string
 *                   example: 系统配置创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       409:
 *         description: 配置键名已存在
 *       500:
 *         description: 服务器内部错误
*/
router.post(
  '/', checkPermission('SYSTEM_CONFIG_MANAGE'),
  systemConfigController.createSystemConfig
);

/**
* @swagger
 * /api/system-configs/{id}:
 *   get:
 *     summary: 获取单个系统配置
 *     description: 根据ID获取特定的系统配置详情
 *     tags: [系统配置管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 系统配置ID
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
 *                   $ref: '#/components/schemas/SystemConfig'
 *                 message:
 *                   type: string
 *                   example: 获取系统配置详情成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 系统配置不存在
 *       500:
 *         description: 服务器内部错误
*/
router.get(
  '/:id', checkPermission('SYSTEM_CONFIG_VIEW'),
  systemConfigController.getSystemConfig
);

/**
* @swagger
 * /api/system-configs/{id}:
 *   put:
 *     summary: 更新系统配置
 *     description: 更新指定ID的系统配置信息
 *     tags: [系统配置管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 系统配置ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SystemConfigUpdate'
 *           examples:
 *             update_value:
 *               summary: 更新配置值
 *               value:
 *                 config_value: "新的配置值"
 *                 description: "更新后的描述"
 *             update_status:
 *               summary: 更新状态
 *               value:
 *                 status: "inactive"
 *                 description: "暂时禁用此配置"
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SystemConfig'
 *                 message:
 *                   type: string
 *                   example: 系统配置更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 系统配置不存在
 *       500:
 *         description: 服务器内部错误
*/
router.put(
  '/:id', checkPermission('SYSTEM_CONFIG_MANAGE'),
  systemConfigController.updateSystemConfig
);

/**
* @swagger
 * /api/system-configs/{id}:
 *   delete:
 *     summary: 删除系统配置
 *     description: 删除指定ID的系统配置（软删除）
 *     tags: [系统配置管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 系统配置ID
 *     responses:
 *       200:
 *         description: 删除成功
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
 *                   example: 系统配置删除成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 系统配置不存在
 *       500:
 *         description: 服务器内部错误
*/
router.delete(
  '/:id', checkPermission('SYSTEM_CONFIG_MANAGE'),
  systemConfigController.deleteSystemConfig
);

export default router; 