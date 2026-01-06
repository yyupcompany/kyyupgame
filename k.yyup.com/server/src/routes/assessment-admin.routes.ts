import { Router } from 'express';
import * as assessmentAdminController from '../controllers/assessment-admin.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

/**
* @swagger
 * components:
 *   schemas:
 *     AssessmentConfig:
 *       type: object
 *       required:
 *         - name
 *         - minAge
 *         - maxAge
 *         - dimensions
 *       properties:
 *         id:
 *           type: integer
 *           description: 测评配置ID
 *           example: 1
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: 测评配置名称
 *           example: "幼儿发展综合测评"
 *         description:
 *           type: string
 *           description: 测评配置描述
 *           example: "针对3-6岁幼儿的综合发展能力测评"
 *         minAge:
 *           type: integer
 *           minimum: 0
 *           maximum: 18
 *           description: 最小年龄（月）
 *           example: 36
 *         maxAge:
 *           type: integer
 *           minimum: 0
 *           maximum: 18
 *           description: 最大年龄（月）
 *           example: 72
 *         dimensions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "注意力"
 *               code:
 *                 type: string
 *                 example: "attention"
 *               weight:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0.2
 *           description: 测评维度配置
 *           example:
 *             - name: "注意力"
 *               code: "attention"
 *               weight: 0.2
 *             - name: "记忆力"
 *               code: "memory"
 *               weight: 0.2
 *             - name: "逻辑思维"
 *               code: "logic"
 *               weight: 0.2
 *             - name: "语言能力"
 *               code: "language"
 *               weight: 0.2
 *             - name: "运动能力"
 *               code: "motor"
 *               weight: 0.1
 *             - name: "社交能力"
 *               code: "social"
 *               weight: 0.1
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: 配置状态
 *           example: "active"
 *         creatorId:
 *           type: integer
 *           description: 创建者ID
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
*
 *     AssessmentQuestion:
 *       type: object
 *       required:
 *         - configId
 *         - dimension
 *         - ageGroup
 *         - questionType
 *         - title
 *         - content
 *         - difficulty
 *         - score
 *         - sortOrder
 *       properties:
 *         id:
 *           type: integer
 *           description: 题目ID
 *           example: 1
 *         configId:
 *           type: integer
 *           description: 所属测评配置ID
 *           example: 1
 *         dimension:
 *           type: string
 *           enum: [attention, memory, logic, language, motor, social]
 *           description: 测评维度
 *           example: "attention"
 *         ageGroup:
 *           type: string
 *           maxLength: 20
 *           description: 年龄组
 *           example: "3-4岁"
 *         questionType:
 *           type: string
 *           enum: [qa, game, interactive]
 *           description: 题目类型
 *           example: "qa"
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: 题目标题
 *           example: "找出红色的苹果"
 *         content:
 *           type: object
 *           description: 题目内容（JSON格式）
 *           example:
 *             question: "请找出图片中的红色苹果"
 *             options:
 *               - id: 1
 *                 text: "红色苹果"
 *                 correct: true
 *               - id: 2
 *                 text: "黄色香蕉"
 *                 correct: false
 *               - id: 3
 *                 text: "绿色葡萄"
 *                 correct: false
 *         gameConfig:
 *           type: object
 *           description: 游戏配置（游戏类型题目）
 *           example:
 *             gameType: "drag_drop"
 *             timeLimit: 60
 *             maxAttempts: 3
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: 题目配图URL
 *           example: "https://example.com/images/apple-question.jpg"
 *         imagePrompt:
 *           type: string
 *           description: AI生成图片的提示词
 *           example: "卡通风格的红色苹果，适合幼儿认知"
 *         audioUrl:
 *           type: string
 *           format: uri
 *           description: 题目语音播报URL
 *           example: "https://example.com/audio/question-1.mp3"
 *         audioText:
 *           type: string
 *           description: 语音播报文本内容
 *           example: "请找出图片中的红色苹果"
 *         difficulty:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: 难度等级（1-5）
 *           example: 2
 *         score:
 *           type: number
 *           minimum: 0
 *           description: 题目分值
 *           example: 10
 *         sortOrder:
 *           type: integer
 *           minimum: 0
 *           description: 排序顺序
 *           example: 1
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: 题目状态
 *           example: "active"
 *         creatorId:
 *           type: integer
 *           description: 创建者ID
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         config:
 *           $ref: '#/components/schemas/AssessmentConfig'
 *           description: 关联的测评配置
*
 *     PhysicalItem:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - description
 *       properties:
 *         id:
 *           type: integer
 *           description: 体能项目ID
 *           example: 1
 *         name:
 *           type: string
 *           description: 项目名称
 *           example: "平衡木行走"
 *         category:
 *           type: string
 *           enum: [balance, strength, flexibility, coordination, endurance]
 *           description: 项目类别
 *           example: "balance"
 *         description:
 *           type: string
 *           description: 项目描述
 *           example: "在平衡木上保持平衡并行走"
 *         instructions:
 *           type: string
 *           description: 操作指导
 *           example: "双臂张开，一步一步向前行走"
 *         difficulty:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: 难度等级
 *           example: 3
 *         duration:
 *           type: integer
 *           description: 建议时长（秒）
 *           example: 30
 *         equipment:
 *           type: array
 *           items:
 *             type: string
 *           description: 所需器材
 *           example: ["平衡木", "防护垫"]
 *         ageRange:
 *           type: string
 *           description: 适合年龄范围
 *           example: "4-6岁"
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: 示例图片URL
 *           example: "https://example.com/images/balance-beam.jpg"
 *         videoUrl:
 *           type: string
 *           format: uri
 *           description: 示例视频URL
 *           example: "https://example.com/videos/balance-beam.mp4"
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: 项目状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
*
 *   parameters:
 *     AssessmentConfigId:
 *       name: id
 *       in: path
 *       required: true
 *       description: 测评配置ID
 *       schema:
 *         type: integer
 *         example: 1
 *     AssessmentQuestionId:
 *       name: id
 *       in: path
 *       required: true
 *       description: 题目ID
 *       schema:
 *         type: integer
 *         example: 1
*
 *   responses:
 *     AssessmentConfigNotFound:
 *       description: 测评配置不存在
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "测评配置不存在"
 *               code:
 *                 type: string
 *                 example: "CONFIG_NOT_FOUND"
 *     AssessmentQuestionNotFound:
 *       description: 题目不存在
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "题目不存在"
 *               code:
 *                 type: string
 *                 example: "QUESTION_NOT_FOUND"
 *     AdminOnlyError:
 *       description: 需要管理员权限
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "需要管理员权限"
 *               code:
 *                 type: string
 *                 example: "ADMIN_ONLY"
*
 * tags:
 *   - name: 测评系统管理
 *     description: 测评配置和题目的管理操作，需要管理员权限
*/

// 所有路由都需要认证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/assessment-admin/configs:
 *   get:
 *     summary: 获取测评配置列表
 *     tags:
 *       - 测评系统管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: 页码
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         required: false
 *         description: 每页数量
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: status
 *         in: query
 *         required: false
 *         description: 配置状态过滤
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *           example: "active"
 *       - name: keyword
 *         in: query
 *         required: false
 *         description: 关键词搜索（名称、描述）
 *         schema:
 *           type: string
 *           example: "综合测评"
 *       - name: sortBy
 *         in: query
 *         required: false
 *         description: 排序字段
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, name]
 *           default: createdAt
 *       - name: sortOrder
 *         in: query
 *         required: false
 *         description: 排序方向
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: DESC
 *     responses:
 *       '200':
 *         description: 获取测评配置列表成功
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
 *                         $ref: '#/components/schemas/AssessmentConfig'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 15
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 *       '401':
 *         description: 未授权
 *       '403':
 *         $ref: '#/components/responses/AdminOnlyError'
 *   post:
 *     summary: 创建测评配置
 *     tags:
 *       - 测评系统管理
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
 *               - minAge
 *               - maxAge
 *               - dimensions
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: 测评配置名称
 *                 example: "幼儿发展综合测评"
 *               description:
 *                 type: string
 *                 description: 测评配置描述
 *                 example: "针对3-6岁幼儿的综合发展能力测评，包含六大维度"
 *               minAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 216
 *                 description: 最小年龄（月）
 *                 example: 36
 *               maxAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 216
 *                 description: 最大年龄（月）
 *                 example: 72
 *               dimensions:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 10
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - code
 *                     - weight
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: 维度名称
 *                       example: "注意力"
 *                     code:
 *                       type: string
 *                       pattern: '^[a-z_]+$'
 *                       description: 维度代码
 *                       example: "attention"
 *                     weight:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 1
 *                       description: 权重（0-1）
 *                       example: 0.2
 *                     description:
 *                       type: string
 *                       description: 维度描述
 *                       example: "测试幼儿的注意力和集中能力"
 *                 description: 测评维度配置
 *                 example:
 *                   - name: "注意力"
 *                     code: "attention"
 *                     weight: 0.2
 *                     description: "测试幼儿的注意力和集中能力"
 *                   - name: "记忆力"
 *                     code: "memory"
 *                     weight: 0.2
 *                     description: "测试幼儿的记忆和回想能力"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: 配置状态
 *                 default: active
 *                 example: "active"
 *     responses:
 *       '201':
 *         description: 创建测评配置成功
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
 *                   example: "测评配置创建成功"
 *                 data:
 *                   $ref: '#/components/schemas/AssessmentConfig'
 *       '400':
 *         description: 请求参数错误
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
 *                   example: "配置名称不能为空，维度权重总和必须等于1"
 *       '401':
 *         description: 未授权
 *       '403':
 *         $ref: '#/components/responses/AdminOnlyError'
*/
router.get('/configs', assessmentAdminController.getConfigs);
router.post('/configs', assessmentAdminController.createConfig);

/**
* @swagger
 * /api/assessment-admin/configs/{id}:
 *   put:
 *     summary: 更新测评配置
 *     tags:
 *       - 测评系统管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AssessmentConfigId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: 测评配置名称
 *                 example: "更新后的幼儿发展综合测评"
 *               description:
 *                 type: string
 *                 description: 测评配置描述
 *                 example: "更新后的测评描述"
 *               minAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 216
 *                 description: 最小年龄（月）
 *                 example: 36
 *               maxAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 216
 *                 description: 最大年龄（月）
 *                 example: 72
 *               dimensions:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 10
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - code
 *                     - weight
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "注意力"
 *                     code:
 *                       type: string
 *                       pattern: '^[a-z_]+$'
 *                       example: "attention"
 *                     weight:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 1
 *                       example: 0.2
 *                     description:
 *                       type: string
 *                       example: "测试幼儿的注意力和集中能力"
 *                 description: 测评维度配置
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: 配置状态
 *                 example: "active"
 *     responses:
 *       '200':
 *         description: 更新测评配置成功
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
 *                   example: "测评配置更新成功"
 *                 data:
 *                   $ref: '#/components/schemas/AssessmentConfig'
 *       '400':
 *         description: 请求参数错误
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
 *                   example: "配置名称不能为空，维度权重总和必须等于1"
 *       '404':
 *         $ref: '#/components/responses/AssessmentConfigNotFound'
 *       '401':
 *         description: 未授权
 *       '403':
 *         $ref: '#/components/responses/AdminOnlyError'
*/
router.put('/configs/:id', assessmentAdminController.updateConfig);

/**
* @swagger
 * /api/assessment-admin/questions:
 *   get:
 *     summary: 获取题目列表
 *     tags:
 *       - 测评系统管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: 页码
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         required: false
 *         description: 每页数量
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: configId
 *         in: query
 *         required: false
 *         description: 测评配置ID过滤
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: dimension
 *         in: query
 *         required: false
 *         description: 维度过滤
 *         schema:
 *           type: string
 *           enum: [attention, memory, logic, language, motor, social]
 *           example: "attention"
 *       - name: questionType
 *         in: query
 *         required: false
 *         description: 题目类型过滤
 *         schema:
 *           type: string
 *           enum: [qa, game, interactive]
 *           example: "qa"
 *       - name: ageGroup
 *         in: query
 *         required: false
 *         description: 年龄组过滤
 *         schema:
 *           type: string
 *           example: "3-4岁"
 *       - name: status
 *         in: query
 *         required: false
 *         description: 题目状态过滤
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *           example: "active"
 *       - name: keyword
 *         in: query
 *         required: false
 *         description: 关键词搜索（标题、内容）
 *         schema:
 *           type: string
 *           example: "苹果"
 *       - name: sortBy
 *         in: query
 *         required: false
 *         description: 排序字段
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, sortOrder, difficulty, title]
 *           default: sortOrder
 *       - name: sortOrder
 *         in: query
 *         required: false
 *         description: 排序方向
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       '200':
 *         description: 获取题目列表成功
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
 *                     questions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AssessmentQuestion'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 156
 *                         totalPages:
 *                           type: integer
 *                           example: 8
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: integer
 *                           example: 156
 *                         dimensionCounts:
 *                           type: object
 *                           example:
 *                             attention: 45
 *                             memory: 38
 *                             logic: 32
 *                             language: 25
 *                             motor: 8
 *                             social: 8
 *                         typeCounts:
 *                           type: object
 *                           example:
 *                             qa: 120
 *                             game: 25
 *                             interactive: 11
 *       '401':
 *         description: 未授权
 *       '403':
 *         $ref: '#/components/responses/AdminOnlyError'
 *   post:
 *     summary: 创建题目
 *     tags:
 *       - 测评系统管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - configId
 *               - dimension
 *               - ageGroup
 *               - questionType
 *               - title
 *               - content
 *               - difficulty
 *               - score
 *               - sortOrder
 *             properties:
 *               configId:
 *                 type: integer
 *                 description: 所属测评配置ID
 *                 example: 1
 *               dimension:
 *                 type: string
 *                 enum: [attention, memory, logic, language, motor, social]
 *                 description: 测评维度
 *                 example: "attention"
 *               ageGroup:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 20
 *                 description: 年龄组
 *                 example: "3-4岁"
 *               questionType:
 *                 type: string
 *                 enum: [qa, game, interactive]
 *                 description: 题目类型
 *                 example: "qa"
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: 题目标题
 *                 example: "找出红色的苹果"
 *               content:
 *                 type: object
 *                 description: 题目内容（JSON格式）
 *                 example:
 *                   question: "请找出图片中的红色苹果"
 *                   options:
 *                     - id: 1
 *                       text: "红色苹果"
 *                       correct: true
 *                       imageUrl: "https://example.com/images/red-apple.jpg"
 *                     - id: 2
 *                       text: "黄色香蕉"
 *                       correct: false
 *                       imageUrl: "https://example.com/images/yellow-banana.jpg"
 *                     - id: 3
 *                       text: "绿色葡萄"
 *                       correct: false
 *                       imageUrl: "https://example.com/images/green-grapes.jpg"
 *                   instructions: "点击红色的苹果"
 *                 required:
 *                   - question
 *               gameConfig:
 *                 type: object
 *                 description: 游戏配置（游戏类型题目）
 *                 example:
 *                   gameType: "drag_drop"
 *                   timeLimit: 60
 *                   maxAttempts: 3
 *                   targetZones:
 *                     - x: 100
 *                       y: 100
 *                       width: 50
 *                       height: 50
 *                       correctItem: "red_apple"
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 description: 题目配图URL
 *                 example: "https://example.com/images/apple-question.jpg"
 *               imagePrompt:
 *                 type: string
 *                 description: AI生成图片的提示词
 *                 example: "卡通风格的红色苹果，适合幼儿认知，清晰的背景"
 *               audioUrl:
 *                 type: string
 *                 format: uri
 *                 description: 题目语音播报URL
 *                 example: "https://example.com/audio/question-1.mp3"
 *               audioText:
 *                 type: string
 *                 description: 语音播报文本内容
 *                 example: "请找出图片中的红色苹果"
 *               difficulty:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 难度等级（1-5）
 *                 example: 2
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 description: 题目分值
 *                 example: 10
 *               sortOrder:
 *                 type: integer
 *                 minimum: 0
 *                 description: 排序顺序
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: 题目状态
 *                 default: active
 *                 example: "active"
 *     responses:
 *       '201':
 *         description: 创建题目成功
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
 *                   example: "题目创建成功"
 *                 data:
 *                   $ref: '#/components/schemas/AssessmentQuestion'
 *       '400':
 *         description: 请求参数错误
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
 *                   example: "测评配置不存在或题目内容格式错误"
 *       '401':
 *         description: 未授权
 *       '403':
 *         $ref: '#/components/responses/AdminOnlyError'
*/
router.get('/questions', assessmentAdminController.getAdminQuestions);
router.post('/questions', assessmentAdminController.createQuestion);

/**
* @swagger
 * /api/assessment-admin/questions/{id}:
 *   put:
 *     summary: 更新题目
 *     tags:
 *       - 测评系统管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AssessmentQuestionId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: 题目标题
 *                 example: "更新后的题目标题"
 *               content:
 *                 type: object
 *                 description: 题目内容（JSON格式）
 *                 example:
 *                   question: "更新后的题目内容"
 *                   options:
 *                     - id: 1
 *                       text: "更新的选项1"
 *                       correct: true
 *                     - id: 2
 *                       text: "更新的选项2"
 *                       correct: false
 *               gameConfig:
 *                 type: object
 *                 description: 游戏配置
 *                 example:
 *                   gameType: "matching"
 *                   timeLimit: 90
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 description: 题目配图URL
 *                 example: "https://example.com/images/updated-question.jpg"
 *               audioUrl:
 *                 type: string
 *                 format: uri
 *                 description: 题目语音播报URL
 *                 example: "https://example.com/audio/updated-question.mp3"
 *               difficulty:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 难度等级
 *                 example: 3
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 description: 题目分值
 *                 example: 15
 *               sortOrder:
 *                 type: integer
 *                 minimum: 0
 *                 description: 排序顺序
 *                 example: 2
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: 题目状态
 *                 example: "active"
 *     responses:
 *       '200':
 *         description: 更新题目成功
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
 *                   example: "题目更新成功"
 *                 data:
 *                   $ref: '#/components/schemas/AssessmentQuestion'
 *       '400':
 *         description: 请求参数错误
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
 *                   example: "题目内容格式错误"
 *       '404':
 *         $ref: '#/components/responses/AssessmentQuestionNotFound'
 *       '401':
 *         description: 未授权
 *       '403':
 *         $ref: '#/components/responses/AdminOnlyError'
 *   delete:
 *     summary: 删除题目
 *     tags:
 *       - 测评系统管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AssessmentQuestionId'
 *     responses:
 *       '200':
 *         description: 删除题目成功
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
 *                   example: "题目删除成功"
 *       '400':
 *         description: 题目已被使用，无法删除
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
 *                   example: "该题目已被测评记录使用，无法删除"
 *       '404':
 *         $ref: '#/components/responses/AssessmentQuestionNotFound'
 *       '401':
 *         description: 未授权
 *       '403':
 *         $ref: '#/components/responses/AdminOnlyError'
*/
router.put('/questions/:id', assessmentAdminController.updateQuestion);
router.delete('/questions/:id', assessmentAdminController.deleteQuestion);

/**
* @swagger
 * /api/assessment-admin/physical-items:
 *   get:
 *     summary: 获取体能训练项目列表
 *     tags:
 *       - 测评系统管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: 页码
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         required: false
 *         description: 每页数量
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: category
 *         in: query
 *         required: false
 *         description: 项目类别过滤
 *         schema:
 *           type: string
 *           enum: [balance, strength, flexibility, coordination, endurance]
 *           example: "balance"
 *       - name: difficulty
 *         in: query
 *         required: false
 *         description: 难度等级过滤
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 3
 *       - name: ageRange
 *         in: query
 *         required: false
 *         description: 年龄范围过滤
 *         schema:
 *           type: string
 *           example: "4-6岁"
 *       - name: status
 *         in: query
 *         required: false
 *         description: 项目状态过滤
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *           example: "active"
 *       - name: keyword
 *         in: query
 *         required: false
 *         description: 关键词搜索（名称、描述）
 *         schema:
 *           type: string
 *           example: "平衡"
 *     responses:
 *       '200':
 *         description: 获取体能训练项目列表成功
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
 *                         $ref: '#/components/schemas/PhysicalItem'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 45
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: integer
 *                           example: 45
 *                         categoryCounts:
 *                           type: object
 *                           example:
 *                             balance: 12
 *                             strength: 10
 *                             flexibility: 8
 *                             coordination: 9
 *                             endurance: 6
 *       '401':
 *         description: 未授权
 *       '403':
 *         $ref: '#/components/responses/AdminOnlyError'
*/

/**
* @swagger
 * /api/assessment-admin/generate-image:
 *   post:
 *     summary: AI生成题目配图
 *     tags:
 *       - 测评系统管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 description: 图片生成提示词
 *                 example: "卡通风格的红色苹果，适合幼儿认知，清晰的白色背景，色彩鲜艳"
 *               style:
 *                 type: string
 *                 enum: [cartoon, realistic, watercolor, sketch, 3d_render]
 *                 description: 图片风格
 *                 default: cartoon
 *                 example: "cartoon"
 *               size:
 *                 type: string
 *                 enum: [256x256, 512x512, 1024x1024]
 *                 description: 图片尺寸
 *                 default: 512x512
 *                 example: "512x512"
 *               ageGroup:
 *                 type: string
 *                 description: 目标年龄组，用于优化图片内容
 *                 example: "3-4岁"
 *               questionType:
 *                 type: string
 *                 enum: [qa, game, interactive]
 *                 description: 题目类型，用于优化图片风格
 *                 example: "qa"
 *               dimension:
 *                 type: string
 *                 enum: [attention, memory, logic, language, motor, social]
 *                 description: 测评维度，用于优化图片内容
 *                 example: "attention"
 *     responses:
 *       '200':
 *         description: AI图片生成成功
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
 *                   example: "图片生成成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       format: uri
 *                       description: 生成的图片URL
 *                       example: "https://example.com/ai-images/generated-123456.jpg"
 *                     thumbnailUrl:
 *                       type: string
 *                       format: uri
 *                       description: 缩略图URL
 *                       example: "https://example.com/ai-images/thumbs/generated-123456.jpg"
 *                     imageId:
 *                       type: string
 *                       description: 图片ID
 *                       example: "img_123456"
 *                     prompt:
 *                       type: string
 *                       description: 使用的提示词
 *                       example: "卡通风格的红色苹果，适合幼儿认知"
 *                     style:
 *                       type: string
 *                       description: 使用的风格
 *                       example: "cartoon"
 *                     size:
 *                       type: string
 *                       description: 图片尺寸
 *                       example: "512x512"
 *                     generationTime:
 *                       type: number
 *                       description: 生成耗时（秒）
 *                       example: 2.5
 *       '400':
 *         description: 请求参数错误
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
 *                   example: "提示词不能为空或格式错误"
 *       '401':
 *         description: 未授权
 *       '402':
 *         description: AI配额不足
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
 *                   example: "AI图片生成配额不足"
 *                 code:
 *                   type: string
 *                   example: "QUOTA_EXCEEDED"
 *       '429':
 *         description: 请求过于频繁
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
 *                   example: "请求过于频繁，请稍后再试"
 *                 retryAfter:
 *                   type: integer
 *                   example: 30
 *       '500':
 *         description: AI服务错误
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
 *                   example: "AI图片生成服务暂时不可用"
 *                 code:
 *                   type: string
 *                   example: "AI_SERVICE_ERROR"
*/
router.get('/physical-items', assessmentAdminController.getPhysicalItems);
router.get('/stats', assessmentAdminController.getStats);
router.post('/generate-image', assessmentAdminController.generateQuestionImage);

export default router;

