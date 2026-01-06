"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var systemConfigController = __importStar(require("../controllers/system-configs.controller"));
var router = (0, express_1.Router)();
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
 *     description: 获取系统配置列表，支持分页、筛选和排序
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: config_group
 *         schema:
 *           type: string
 *         description: 配置分组筛选
 *       - in: query
 *         name: config_type
 *         schema:
 *           type: string
 *           enum: [string, number, boolean, json]
 *         description: 配置类型筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: 状态筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 关键词搜索（配置键名、描述）
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [config_key, config_group, sort_order, created_at, updated_at]
 *           default: sort_order
 *         description: 排序字段
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: 排序方向
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
 *                         per_page:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         total_pages:
 *                           type: integer
 *                 message:
 *                   type: string
 *                   example: 获取系统配置列表成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('SYSTEM_CONFIG_VIEW'), systemConfigController.getSystemConfigs);
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
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('SYSTEM_CONFIG_MANAGE'), systemConfigController.createSystemConfig);
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
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('SYSTEM_CONFIG_VIEW'), systemConfigController.getSystemConfig);
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
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('SYSTEM_CONFIG_MANAGE'), systemConfigController.updateSystemConfig);
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
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('SYSTEM_CONFIG_MANAGE'), systemConfigController.deleteSystemConfig);
exports["default"] = router;
