/**
* @swagger
 * components:
 *   schemas:
 *     Voice-config:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Voice-config ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Voice-config 名称
 *           example: "示例Voice-config"
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
 *     CreateVoice-configRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Voice-config 名称
 *           example: "新Voice-config"
 *     UpdateVoice-configRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Voice-config 名称
 *           example: "更新后的Voice-config"
 *     Voice-configListResponse:
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
 *                 $ref: '#/components/schemas/Voice-config'
 *         message:
 *           type: string
 *           example: "获取voice-config列表成功"
 *     Voice-configResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Voice-config'
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
 * voice-config管理路由文件
 * 提供voice-config的基础CRUD操作
*
 * 功能包括：
 * - 获取voice-config列表
 * - 创建新voice-config
 * - 获取voice-config详情
 * - 更新voice-config信息
 * - 删除voice-config
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 语音配置管理路由
 * 统一管理VOS和SIP两种配置模式
*/

import { Router } from 'express';
import {
  getVoiceConfigs,
  getActiveVoiceConfig,
  getVoiceConfigById,
  createVoiceConfig,
  updateVoiceConfig,
  deleteVoiceConfig,
  toggleVoiceConfig,
  testVoiceConfig,
  getVoiceConfigStats,
  validateVoiceConfig
} from '../controllers/voice-config.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(verifyToken);

// ========== 语音配置管理 ==========

/**
* @swagger
 * /voice-config:
 *   get:
 *     summary: 获取语音配置列表
 *     description: 获取所有语音配置的列表，支持分页、筛选和排序功能。返回包含VOS和SIP两种配置模式的完整信息。
 *     tags: [语音配置管理]
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
 *           minimum: 10
 *           maximum: 100
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: configType
 *         schema:
 *           type: string
 *           enum: [VOS, SIP, ALL]
 *           default: ALL
 *         description: 配置类型筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: all
 *         description: 状态筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: 搜索关键词（配置名称或描述）
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, configType, status, createdAt, updatedAt]
 *           default: createdAt
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 排序方向
 *     responses:
 *       200:
 *         description: 获取语音配置列表成功
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
 *                   example: "获取语音配置列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     voiceConfigs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/VoiceConfig'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalConfigs:
 *                           type: integer
 *                           example: 15
 *                         activeConfigs:
 *                           type: integer
 *                           example: 3
 *                         vosConfigs:
 *                           type: integer
 *                           example: 8
 *                         sipConfigs:
 *                           type: integer
 *                           example: 7
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.get('/', getVoiceConfigs);

/**
* @swagger
 * /voice-config/stats:
 *   get:
 *     summary: 获取语音配置统计信息
 *     description: 获取语音配置系统的统计信息，包括配置数量、使用状态、类型分布等统计数据，用于仪表板展示和系统监控。
 *     tags: [语音配置管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取语音配置统计信息成功
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
 *                   example: "获取语音配置统计信息成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalConfigs:
 *                       type: integer
 *                       example: 15
 *                       description: 总配置数量
 *                     activeConfigs:
 *                       type: integer
 *                       example: 3
 *                       description: 激活的配置数量
 *                     inactiveConfigs:
 *                       type: integer
 *                       example: 12
 *                       description: 未激活的配置数量
 *                     configTypes:
 *                       type: object
 *                       properties:
 *                         VOS:
 *                           type: integer
 *                           example: 8
 *                         SIP:
 *                           type: integer
 *                           example: 7
 *                       description: 按类型分组的配置数量
 *                     recentActivity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           action:
 *                             type: string
 *                             example: "created"
 *                           configName:
 *                             type: string
 *                             example: "VOS主服务器配置"
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           userId:
 *                             type: string
 *                           userName:
 *                             type: string
 *                       description: 最近的活动记录
 *                     healthStatus:
 *                       type: object
 *                       properties:
 *                         healthyConfigs:
 *                           type: integer
 *                           example: 2
 *                         unhealthyConfigs:
 *                           type: integer
 *                           example: 1
 *                         unknownConfigs:
 *                           type: integer
 *                           example: 0
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.get('/stats', getVoiceConfigStats);

/**
* @swagger
 * /voice-config/active:
 *   get:
 *     summary: 获取当前激活的语音配置
 *     description: 获取当前系统激活使用的语音配置信息，用于实时语音通话功能的配置读取。
 *     tags: [语音配置管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取当前激活配置成功
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
 *                   example: "获取当前激活配置成功"
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/VoiceConfig'
 *                     - type: object
 *                       properties:
 *                         config:
 *                           type: object
 *                           example: null
 *                         message:
 *                           type: string
 *                           example: "当前没有激活的语音配置"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 未找到激活的配置
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
 *                   example: "未找到激活的语音配置"
 *                 data:
 *                   type: object
 *                   example: null
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.get('/active', getActiveVoiceConfig);

/**
* @swagger
 * /voice-config/{id}:
 *   get:
 *     summary: 获取语音配置详情
 *     description: 根据配置ID获取指定语音配置的详细信息，包括完整的配置参数、连接状态和使用统计。
 *     tags: [语音配置管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 语音配置ID
 *       - in: query
 *         name: includeUsage
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含使用统计信息
 *       - in: query
 *         name: includeHealth
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含健康检查信息
 *     responses:
 *       200:
 *         description: 获取语音配置详情成功
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
 *                   example: "获取语音配置详情成功"
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/VoiceConfig'
 *                     - type: object
 *                       properties:
 *                         usageStatistics:
 *                           type: object
 *                           properties:
 *                             totalCalls:
 *                               type: integer
 *                               example: 1245
 *                             successfulCalls:
 *                               type: integer
 *                               example: 1198
 *                             failedCalls:
 *                               type: integer
 *                               example: 47
 *                             averageCallDuration:
 *                               type: number
 *                               format: float
 *                               example: 185.5
 *                             lastUsedAt:
 *                               type: string
 *                               format: date-time
 *                         healthStatus:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [healthy, unhealthy, unknown]
 *                               example: "healthy"
 *                             lastCheckAt:
 *                               type: string
 *                               format: date-time
 *                             responseTime:
 *                               type: number
 *                               format: float
 *                               example: 45.2
 *                             errorMessage:
 *                               type: string
 *                               example: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.get('/:id', getVoiceConfigById);

/**
* @swagger
 * /voice-config:
 *   post:
 *     summary: 创建语音配置
 *     description: 创建新的语音配置，支持VOS和SIP两种配置模式。创建后配置处于未激活状态，需要手动激活才能使用。
 *     tags: [语音配置管理]
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
 *               - configType
 *               - serverConfig
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "VOS主服务器配置"
 *                 description: 配置名称（唯一）
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "主要VOS服务器的语音配置，用于日常通话功能"
 *                 description: 配置描述
 *               configType:
 *                 type: string
 *                 enum: [VOS, SIP]
 *                 example: "VOS"
 *                 description: 配置类型
 *               serverConfig:
 *                 type: object
 *                 required:
 *                   - serverUrl
 *                   - serverPort
 *                   - username
 *                   - password
 *                 properties:
 *                   serverUrl:
 *                     type: string
 *                     format: uri
 *                     example: "https://vos.example.com"
 *                     description: 服务器地址
 *                   serverPort:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 65535
 *                     example: 8080
 *                     description: 服务器端口
 *                   username:
 *                     type: string
 *                     maxLength: 50
 *                     example: "admin"
 *                     description: 服务器用户名
 *                   password:
 *                     type: string
 *                     maxLength: 100
 *                     example: "secure_password"
 *                     description: 服务器密码
 *                   domain:
 *                     type: string
 *                     maxLength: 100
 *                     example: "sip.example.com"
 *                     description: SIP域名（SIP配置时需要）
 *                   realm:
 *                     type: string
 *                     maxLength: 100
 *                     example: "example.com"
 *                     description: 认证域
 *                   transport:
 *                     type: string
 *                     enum: [UDP, TCP, TLS]
 *                     default: "UDP"
 *                     description: 传输协议
 *                   timeout:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 300
 *                     default: 30
 *                     description: 连接超时时间（秒）
 *                   retryCount:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 10
 *                     default: 3
 *                     description: 重试次数
 *               audioConfig:
 *                 type: object
 *                 properties:
 *                   codec:
 *                     type: string
 *                     enum: [G.711, G.722, G.729, Opus]
 *                     default: "G.711"
 *                     description: 音频编码格式
 *                   sampleRate:
 *                     type: integer
 *                     enum: [8000, 16000, 48000]
 *                     default: 8000
 *                     description: 采样率
 *                   bitrate:
 *                     type: integer
 *                     minimum: 8
 *                     maximum: 128
 *                     default: 64
 *                     description: 比特率
 *                   echoCancellation:
 *                     type: boolean
 *                     default: true
 *                     description: 回声消除
 *                   noiseReduction:
 *                     type: boolean
 *                     default: true
 *                     description: 噪声抑制
 *                 description: 音频配置
 *               isActive:
 *                 type: boolean
 *                 default: false
 *                 description: 是否激活（创建时通常为false）
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 5
 *                 description: 配置优先级
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 30
 *                 maxItems: 5
 *                 example: ["primary", "production"]
 *                 description: 配置标签
 *     responses:
 *       201:
 *         description: 创建语音配置成功
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
 *                   example: "创建语音配置成功"
 *                 data:
 *                   $ref: '#/components/schemas/VoiceConfig'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: 配置名称已存在
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
 *                   example: "配置名称已存在"
 *                 data:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       example: "name"
 *                     value:
 *                       type: string
 *                       example: "VOS主服务器配置"
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.post('/', createVoiceConfig);

/**
* @swagger
 * /voice-config/{id}:
 *   put:
 *     summary: 更新语音配置
 *     description: 更新指定ID的语音配置信息。如果配置当前处于激活状态，更新后会自动重新加载配置。
 *     tags: [语音配置管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 语音配置ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "更新后的配置名称"
 *                 description: 配置名称
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "更新后的配置描述"
 *                 description: 配置描述
 *               serverConfig:
 *                 type: object
 *                 properties:
 *                   serverUrl:
 *                     type: string
 *                     format: uri
 *                     example: "https://new-vos.example.com"
 *                   serverPort:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 65535
 *                     example: 9080
 *                   username:
 *                     type: string
 *                     maxLength: 50
 *                     example: "new_admin"
 *                   password:
 *                     type: string
 *                     maxLength: 100
 *                     example: "new_secure_password"
 *                   domain:
 *                     type: string
 *                     maxLength: 100
 *                     example: "new-sip.example.com"
 *                   realm:
 *                     type: string
 *                     maxLength: 100
 *                     example: "new-example.com"
 *                   transport:
 *                     type: string
 *                     enum: [UDP, TCP, TLS]
 *                   timeout:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 300
 *                     example: 60
 *                   retryCount:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 10
 *                     example: 5
 *                 description: 服务器配置
 *               audioConfig:
 *                 type: object
 *                 properties:
 *                   codec:
 *                     type: string
 *                     enum: [G.711, G.722, G.729, Opus]
 *                   sampleRate:
 *                     type: integer
 *                     enum: [8000, 16000, 48000]
 *                   bitrate:
 *                     type: integer
 *                     minimum: 8
 *                     maximum: 128
 *                   echoCancellation:
 *                     type: boolean
 *                   noiseReduction:
 *                     type: boolean
 *                 description: 音频配置
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 8
 *                 description: 配置优先级
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 30
 *                 maxItems: 5
 *                 example: ["updated", "test"]
 *                 description: 配置标签
 *     responses:
 *       200:
 *         description: 更新语音配置成功
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
 *                   example: "更新语音配置成功"
 *                 data:
 *                   $ref: '#/components/schemas/VoiceConfig'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: 配置名称已存在
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
 *                   example: "配置名称已存在"
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.put('/:id', updateVoiceConfig);

/**
* @swagger
 * /voice-config/{id}:
 *   delete:
 *     summary: 删除语音配置
 *     description: 删除指定的语音配置。如果配置当前处于激活状态，需要先停用才能删除。删除操作不可逆，请谨慎操作。
 *     tags: [语音配置管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 语音配置ID
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否强制删除（即使配置正在使用中）
 *     responses:
 *       200:
 *         description: 删除语音配置成功
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
 *                   example: "删除语音配置成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedConfigId:
 *                       type: integer
 *                       example: 1
 *                     deletedConfigName:
 *                       type: string
 *                       example: "测试配置"
 *       400:
 *         description: 配置正在使用中，无法删除
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
 *                   example: "配置当前激活，无法删除。请先停用配置。"
 *                 data:
 *                   type: object
 *                   properties:
 *                     configId:
 *                       type: integer
 *                       example: 1
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     suggestion:
 *                       type: string
 *                       example: "请先调用停用接口"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.delete('/:id', deleteVoiceConfig);

/**
* @swagger
 * /voice-config/{id}/toggle:
 *   post:
 *     summary: 激活/停用语音配置
 *     description: 切换语音配置的激活状态。激活配置时，系统会验证配置的可用性；停用配置时，会影响正在进行的通话。
 *     tags: [语音配置管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 语音配置ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               force:
 *                 type: boolean
 *                 default: false
 *                 description: 是否强制切换（可能影响正在进行的通话）
 *               reason:
 *                 type: string
 *                 maxLength: 200
 *                 example: "系统维护需要切换配置"
 *                 description: 切换原因
 *     responses:
 *       200:
 *         description: 切换配置状态成功
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
 *                   example: "语音配置已激活"
 *                 data:
 *                   type: object
 *                   properties:
 *                     configId:
 *                       type: integer
 *                       example: 1
 *                     configName:
 *                       type: string
 *                       example: "VOS主服务器配置"
 *                     oldStatus:
 *                       type: string
 *                       enum: [active, inactive]
 *                       example: "inactive"
 *                     newStatus:
 *                       type: string
 *                       enum: [active, inactive]
 *                       example: "active"
 *                     affectedCalls:
 *                       type: integer
 *                       example: 0
 *                       description: 受影响的通话数量
 *                     switchTime:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 配置切换失败
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
 *                   example: "配置验证失败，无法激活"
 *                 data:
 *                   type: object
 *                   properties:
 *                     configId:
 *                       type: integer
 *                       example: 1
 *                     validationErrors:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "服务器连接超时"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: 存在其他激活的配置
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
 *                   example: "已存在激活的配置，请先停用其他配置"
 *                 data:
 *                   type: object
 *                   properties:
 *                     activeConfigId:
 *                       type: integer
 *                       example: 2
 *                     activeConfigName:
 *                       type: string
 *                       example: "当前激活的配置"
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.post('/:id/toggle', toggleVoiceConfig);

/**
* @swagger
 * /voice-config/{id}/test:
 *   post:
 *     summary: 测试语音配置连接
 *     description: 测试指定语音配置的连接性和可用性。包括服务器连通性测试、认证验证、音频质量测试等。
 *     tags: [语音配置管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 语音配置ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               testType:
 *                 type: string
 *                 enum: [connectivity, authentication, audio, full]
 *                 default: "full"
 *                 description: 测试类型
 *               timeout:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 120
 *                 default: 30
 *                 description: 测试超时时间（秒）
 *               testNumber:
 *                 type: string
 *                 maxLength: 20
 *                 example: "13800138000"
 *                 description: 测试电话号码（音频测试时使用）
 *     responses:
 *       200:
 *         description: 测试完成
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
 *                   example: "配置测试完成"
 *                 data:
 *                   type: object
 *                   properties:
 *                     configId:
 *                       type: integer
 *                       example: 1
 *                     testType:
 *                       type: string
 *                       example: "full"
 *                     overallStatus:
 *                       type: string
 *                       enum: [success, failure, partial]
 *                       example: "success"
 *                     testResults:
 *                       type: object
 *                       properties:
 *                         connectivity:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [success, failure]
 *                               example: "success"
 *                             responseTime:
 *                               type: number
 *                               format: float
 *                               example: 45.2
 *                             message:
 *                               type: string
 *                               example: "服务器连接成功"
 *                         authentication:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [success, failure]
 *                               example: "success"
 *                             message:
 *                               type: string
 *                               example: "认证验证成功"
 *                         audio:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [success, failure, skipped]
 *                               example: "success"
 *                             quality:
 *                               type: string
 *                               enum: [excellent, good, fair, poor]
 *                               example: "good"
 *                             delay:
 *                               type: number
 *                               format: float
 *                               example: 25.3
 *                             packetLoss:
 *                               type: number
 *                               format: float
 *                               example: 0.1
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "建议将连接超时时间调整为60秒"
 *                     testDuration:
 *                       type: number
 *                       format: float
 *                       example: 12.5
 *                       description: 测试耗时（秒）
 *       400:
 *         description: 测试参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       408:
 *         description: 测试超时
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
 *                   example: "测试超时，请检查网络连接"
 *                 data:
 *                   type: object
 *                   properties:
 *                     timeout:
 *                       type: integer
 *                       example: 30
 *                     elapsed:
 *                       type: number
 *                       format: float
 *                       example: 30.1
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.post('/:id/test', testVoiceConfig);

/**
* @swagger
 * /voice-config/{id}/validate:
 *   post:
 *     summary: 验证语音配置
 *     description: 验证语音配置的参数有效性和完整性。检查服务器地址、端口、认证信息等配置是否正确，不进行实际连接测试。
 *     tags: [语音配置管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 语音配置ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               validateDeep:
 *                 type: boolean
 *                 default: false
 *                 description: 是否进行深度验证（包括格式检查、参数范围等）
 *               skipConnectivity:
 *                 type: boolean
 *                 default: true
 *                 description: 是否跳过连接性检查
 *     responses:
 *       200:
 *         description: 验证完成
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
 *                   example: "配置验证通过"
 *                 data:
 *                   type: object
 *                   properties:
 *                     configId:
 *                       type: integer
 *                       example: 1
 *                     validationStatus:
 *                       type: string
 *                       enum: [valid, invalid, warning]
 *                       example: "valid"
 *                     validationResults:
 *                       type: object
 *                       properties:
 *                         serverConfig:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [valid, invalid, warning]
 *                               example: "valid"
 *                             checks:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   field:
 *                                     type: string
 *                                     example: "serverUrl"
 *                                   status:
 *                                     type: string
 *                                     enum: [valid, invalid, warning]
 *                                     example: "valid"
 *                                   message:
 *                                     type: string
 *                                     example: "URL格式正确"
 *                         audioConfig:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [valid, invalid, warning]
 *                               example: "valid"
 *                             checks:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   field:
 *                                     type: string
 *                                     example: "codec"
 *                                   status:
 *                                     type: string
 *                                     enum: [valid, invalid, warning]
 *                                     example: "valid"
 *                                   message:
 *                                     type: string
 *                                     example: "编码格式支持"
 *                     warnings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                             example: "timeout"
 *                           message:
 *                             type: string
 *                             example: "超时时间较短，可能影响稳定性"
 *                           suggestion:
 *                             type: string
 *                             example: "建议设置为60秒以上"
 *                       example: []
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                             example: "password"
 *                           message:
 *                             type: string
 *                             example: "密码不能为空"
 *                           suggestion:
 *                             type: string
 *                             example: "请提供有效的认证密码"
 *                       example: []
 *       400:
 *         description: 验证参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.post('/:id/validate', validateVoiceConfig);

export default router;