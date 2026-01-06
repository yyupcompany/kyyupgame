/**
* @swagger
* components:
*   schemas:
*     Field-template:
*       type: object
*       properties:
*         id:
*           type: integer
*           description: Field-template ID
*           example: 1
*         name:
*           type: string
*           description: Field-template 名称
*           example: "示例Field-template"
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
*     CreateField-templateRequest:
*       type: object
*       required:
*         - name
*       properties:
*         name:
*           type: string
*           description: Field-template 名称
*           example: "新Field-template"
*     UpdateField-templateRequest:
*       type: object
*       properties:
*         name:
*           type: string
*           description: Field-template 名称
*           example: "更新后的Field-template"
*     Field-templateListResponse:
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
*                 $ref: '#/components/schemas/Field-template'
*         message:
*           type: string
*           example: "获取field-template列表成功"
*     Field-templateResponse:
*       type: object
*       properties:
*         success:
*           type: boolean
*           example: true
*         data:
*           $ref: '#/components/schemas/Field-template'
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
* field-template管理路由文件
* 提供field-template的基础CRUD操作
*
* 功能包括：
* - 获取field-template列表
* - 创建新field-template
* - 获取field-template详情
* - 更新field-template信息
* - 删除field-template
*
* 权限要求：需要有效的JWT Token认证
*/

/**
* 字段模板路由
*/

import express from 'express';
import { fieldTemplateController } from '../controllers/field-template.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

/**
* @swagger
* /field-templates/popular/{entityType}:
*   get:
*     summary: 获取热门字段模板
*     description: 根据实体类型获取热门的字段模板列表，按使用频率和评分排序。热门模板通常是经过验证的高质量模板，推荐给用户使用。
*     tags: [字段模板管理]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: entityType
*         required: true
*         schema:
*           type: string
*           enum: [student, teacher, class, activity, enrollment, course, parent, staff]
*         description: 实体类型
*       - in: query
*         name: limit
*         schema:
*           type: integer
*           minimum: 1
*           maximum: 50
*           default: 10
*         description: 返回数量限制
*       - in: query
*         name: category
*         schema:
*           type: string
*           enum: [basic, detailed, custom, system]
*         description: 模板分类筛选
*       - in: query
*         name: includePublic
*         schema:
*           type: boolean
*           default: true
*         description: 是否包含公共模板
*     responses:
*       200:
*         description: 获取热门模板成功
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
*                   example: "获取热门字段模板成功"
*                 data:
*                   type: object
*                   properties:
*                     entityType:
*                       type: string
*                       example: "student"
*                     templates:
*                       type: array
*                       items:
*                         $ref: '#/components/schemas/FieldTemplateSummary'
*                     total:
*                       type: integer
*                       example: 10
*                     hasMore:
*                       type: boolean
*                       example: false
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
*       500:
*         $ref: '#/components/responses/InternalError'
*/
router.get(
  '/popular/:entityType',
  verifyToken,
  fieldTemplateController.getPopularTemplates.bind(fieldTemplateController)
);

/**
* @swagger
* /field-templates/recent:
*   get:
*     summary: 获取最近使用的字段模板
*     description: 获取当前用户最近使用的字段模板列表，按最后使用时间排序。方便用户快速访问和重复使用最近创建或应用过的模板。
*     tags: [字段模板管理]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: limit
*         schema:
*           type: integer
*           minimum: 1
*           maximum: 20
*           default: 5
*         description: 返回数量限制
*       - in: query
*         name: entityType
*         schema:
*           type: string
*           enum: [student, teacher, class, activity, enrollment, course, parent, staff]
*         description: 按实体类型筛选
*       - in: query
*         name: days
*         schema:
*           type: integer
*           minimum: 1
*           maximum: 365
*           default: 30
*         description: 最近天数筛选
*     responses:
*       200:
*         description: 获取最近使用的模板成功
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
*                   example: "获取最近使用的模板成功"
*                 data:
*                   type: object
*                   properties:
*                     templates:
*                       type: array
*                       items:
*                         $ref: '#/components/schemas/FieldTemplateSummary'
*                     total:
*                       type: integer
*                       example: 5
*                     timeRange:
*                       type: object
*                       properties:
*                         days:
*                           type: integer
*                           example: 30
*                         fromDate:
*                           type: string
*                           format: date-time
*                         toDate:
*                           type: string
*                           format: date-time
*       401:
*         $ref: '#/components/responses/Unauthorized'
*       403:
*         $ref: '#/components/responses/Forbidden'
*       500:
*         $ref: '#/components/responses/InternalError'
*/
router.get(
  '/recent',
  verifyToken,
  fieldTemplateController.getRecentTemplates.bind(fieldTemplateController)
);

/**
* @swagger
* /field-templates:
*   post:
*     summary: 创建字段模板
*     description: 创建新的字段模板，定义特定实体类型的字段结构和配置。模板可以被用户重复使用，提高数据录入的效率和一致性。
*     tags: [字段模板管理]
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
*               - entityType
*               - fields
*             properties:
*               name:
*                 type: string
*                 maxLength: 100
*                 example: "学生基本信息模板"
*                 description: 模板名称
*               description:
*                 type: string
*                 maxLength: 500
*                 example: "包含学生基本信息的标准字段模板"
*                 description: 模板描述
*               entityType:
*                 type: string
*                 enum: [student, teacher, class, activity, enrollment, course, parent, staff]
*                 example: "student"
*                 description: 适用实体类型
*               category:
*                 type: string
*                 enum: [basic, detailed, custom, system]
*                 default: "custom"
*                 description: 模板分类
*               isPublic:
*                 type: boolean
*                 default: false
*                 description: 是否为公共模板（其他用户可见）
*               tags:
*                 type: array
*                 items:
*                   type: string
*                   maxLength: 30
*                 maxItems: 5
*                 example: ["基础", "入学", "标准"]
*                 description: 模板标签
*               fields:
*                 type: array
*                 minItems: 1
*                 maxItems: 100
*                 items:
*                   type: object
*                   required:
*                     - name
*                     - type
*                   properties:
*                     name:
*                       type: string
*                       maxLength: 50
*                       example: "studentName"
*                       description: 字段名称
*                     label:
*                       type: string
*                       maxLength: 100
*                       example: "学生姓名"
*                       description: 字段显示标签
*                     type:
*                       type: string
*                       enum:
*                         - text
*                         - number
*                         - email
*                         - phone
*                         - date
*                         - select
*                         - multiselect
*                         - textarea
*                         - boolean
*                         - file
*                       example: "text"
*                       description: 字段类型
*                     required:
*                       type: boolean
*                       default: false
*                       description: 是否必填
*                     defaultValue:
*                       oneOf:
*                         - type: string
*                         - type: number
*                         - type: boolean
*                         - type: array
*                         - type: object
*                       description: 默认值
*                     placeholder:
*                       type: string
*                       maxLength: 200
*                       example: "请输入学生姓名"
*                       description: 输入提示
*                     validation:
*                       type: object
*                       properties:
*                         minLength:
*                           type: integer
*                           minimum: 0
*                           example: 2
*                         maxLength:
*                           type: integer
*                           minimum: 1
*                           maximum: 1000
*                           example: 50
*                         pattern:
*                           type: string
*                           example: "^[\\u4e00-\\u9fa5a-zA-Z]+$"
*                         min:
*                           type: number
*                         max:
*                           type: number
*                         required:
*                           type: boolean
*                       description: 验证规则
*                     options:
*                       type: array
*                       items:
*                         type: object
*                         properties:
*                           value:
*                             type: string
*                             example: "male"
*                           label:
*                             type: string
*                             example: "男"
*                         description: 选项配置（用于select/multiselect类型）
*                       description: 字段选项配置
*                     order:
*                       type: integer
*                       minimum: 0
*                       default: 0
*                       description: 字段排序顺序
*                     description:
*                       type: string
*                       maxLength: 300
*                       example: "学生真实姓名，与身份证一致"
*                       description: 字段说明
*                     isVisible:
*                       type: boolean
*                       default: true
*                       description: 是否可见
*                     isEditable:
*                       type: boolean
*                       default: true
*                       description: 是否可编辑
*                 description: 字段配置列表
*               metadata:
*                 type: object
*                 properties:
*                   version:
*                     type: string
*                     example: "1.0.0"
*                     description: 模板版本
*                   author:
*                     type: string
*                     example: "系统管理员"
*                     description: 模板作者
*                   department:
*                     type: string
*                     example: "教务处"
*                     description: 所属部门
*                   notes:
*                     type: string
*                     example: "适用于新生入学场景"
*                     description: 备注信息
*                 description: 模板元数据
*     responses:
*       201:
*         description: 创建字段模板成功
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
*                   example: "创建字段模板成功"
*                 data:
*                   $ref: '#/components/schemas/FieldTemplate'
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
*         description: 模板名称已存在
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
*                   example: "模板名称已存在"
*                 data:
*                   type: object
*                   properties:
*                     field:
*                       type: string
*                       example: "name"
*                     value:
*                       type: string
*                       example: "学生基本信息模板"
*       500:
*         $ref: '#/components/responses/InternalError'
*/
router.post(
  '/',
  verifyToken,
  fieldTemplateController.createTemplate.bind(fieldTemplateController)
);

/**
* @swagger
* /field-templates:
*   get:
*     summary: 获取字段模板列表
*     description: 获取字段模板的完整列表，支持多种筛选、搜索和排序功能。可以按实体类型、分类、创建者等条件查找模板。
*     tags: [字段模板管理]
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
*         name: entityType
*         schema:
*           type: string
*           enum: [student, teacher, class, activity, enrollment, course, parent, staff]
*         description: 实体类型筛选
*       - in: query
*         name: category
*         schema:
*           type: string
*           enum: [basic, detailed, custom, system]
*         description: 模板分类筛选
*       - in: query
*         name: isPublic
*         schema:
*           type: boolean
*         description: 是否为公共模板
*       - in: query
*         name: search
*         schema:
*           type: string
*           maxLength: 100
*         description: 搜索关键词（模板名称或描述）
*       - in: query
*         name: tags
*         schema:
*           type: array
*           items:
*             type: string
*         description: 标签筛选
*       - in: query
*         name: createdBy
*         schema:
*           type: string
*         description: 创建者筛选
*       - in: query
*         name: sortBy
*         schema:
*           type: string
*           enum: [name, createdAt, updatedAt, usageCount, rating]
*           default: "createdAt"
*         description: 排序字段
*       - in: query
*         name: sortOrder
*         schema:
*           type: string
*           enum: [asc, desc]
*           default: "desc"
*         description: 排序方向
*       - in: query
*         name: includeStats
*         schema:
*           type: boolean
*           default: false
*         description: 是否包含统计信息
*     responses:
*       200:
*         description: 获取模板列表成功
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
*                   example: "获取模板列表成功"
*                 data:
*                   type: object
*                   properties:
*                     templates:
*                       type: array
*                       items:
*                         $ref: '#/components/schemas/FieldTemplateSummary'
*                     pagination:
*                       $ref: '#/components/schemas/Pagination'
*                     filters:
*                       type: object
*                       properties:
*                         entityTypes:
*                           type: array
*                           items:
*                             type: string
*                           example: ["student", "teacher"]
*                         categories:
*                           type: array
*                           items:
*                             type: string
*                           example: ["basic", "custom"]
*                     statistics:
*                       type: object
*                       properties:
*                         totalTemplates:
*                           type: integer
*                           example: 45
*                         publicTemplates:
*                           type: integer
*                           example: 18
*                         privateTemplates:
*                           type: integer
*                           example: 27
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
*       500:
*         $ref: '#/components/responses/InternalError'
*/
router.get(
  '/',
  verifyToken,
  fieldTemplateController.getTemplateList.bind(fieldTemplateController)
);

/**
* @swagger
* /field-templates/{id}:
*   get:
*     summary: 获取字段模板详情
*     description: 根据模板ID获取字段模板的完整详细信息，包括所有字段配置、使用统计、应用历史等。
*     tags: [字段模板管理]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*         description: 模板ID
*       - in: query
*         name: includeUsage
*         schema:
*           type: boolean
*           default: false
*         description: 是否包含使用统计
*       - in: query
*         name: includeHistory
*         schema:
*           type: boolean
*           default: false
*         description: 是否包含修改历史
*       - in: query
*         name: version
*         schema:
*           type: string
*         description: 获取指定版本的模板（可选）
*     responses:
*       200:
*         description: 获取模板详情成功
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
*                   example: "获取模板详情成功"
*                 data:
*                   allOf:
*                     - $ref: '#/components/schemas/FieldTemplate'
*                     - type: object
*                       properties:
*                         usageStatistics:
*                           type: object
*                           properties:
*                             totalApplications:
*                               type: integer
*                               example: 156
*                             activeApplications:
*                               type: integer
*                               example: 23
*                             lastUsedAt:
*                               type: string
*                               format: date-time
*                             usageByUsers:
*                               type: integer
*                               example: 12
*                         versionHistory:
*                           type: array
*                           items:
*                             type: object
*                             properties:
*                               version:
*                                 type: string
*                                 example: "1.1.0"
*                               changeDescription:
*                                 type: string
*                                 example: "添加了联系电话字段"
*                               createdBy:
*                                 type: string
*                                 example: "张三"
*                               createdAt:
*                                 type: string
*                                 format: date-time
*                         relatedTemplates:
*                           type: array
*                           items:
*                             $ref: '#/components/schemas/FieldTemplateSummary'
*       401:
*         $ref: '#/components/responses/Unauthorized'
*       403:
*         $ref: '#/components/responses/Forbidden'
*       404:
*         $ref: '#/components/responses/NotFound'
*       500:
*         $ref: '#/components/responses/InternalError'
*/
router.get(
  '/:id',
  verifyToken,
  fieldTemplateController.getTemplateById.bind(fieldTemplateController)
);

/**
* @swagger
* /field-templates/{id}/apply:
*   post:
*     summary: 应用字段模板
*     description: 将指定的字段模板应用到具体的实体对象上，根据模板配置初始化实体的字段结构。应用时会根据实体类型创建相应的数据记录。
*     tags: [字段模板管理]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*         description: 模板ID
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - targetId
*               - targetType
*             properties:
*               targetId:
*                 type: string
*                 example: "12345"
*                 description: 目标实体ID
*               targetType:
*                 type: string
*                 enum: [class, activity, enrollment]
*                 example: "class"
*                 description: 目标实体类型
*               overrideExisting:
*                 type: boolean
*                 default: false
*                 description: 是否覆盖现有字段配置
*               customizations:
*                 type: object
*                 properties:
*                   fieldOverrides:
*                     type: object
*                     additionalProperties:
*                       type: object
*                       properties:
*                         required:
*                           type: boolean
*                         defaultValue:
*                           oneOf:
*                             - type: string
*                             - type: number
*                             - type: boolean
*                             - type: array
*                         options:
*                           type: array
*                           items:
*                             type: object
*                       description: 字段覆盖配置
*                   fieldAdditions:
*                     type: array
*                     items:
*                       type: object
*                       properties:
*                         name:
*                           type: string
*                         type:
*                           type: string
*                         required:
*                           type: boolean
*                     description: 额外添加的字段
*                   fieldRemovals:
*                     type: array
*                     items:
*                       type: string
*                     description: 要移除的字段名称列表
*                 description: 模板自定义配置
*               applyMode:
*                 type: string
*                 enum: [full, partial, preview]
*                 default: "full"
*                 description: 应用模式：完整应用、部分应用或预览
*     responses:
*       200:
*         description: 应用模板成功
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
*                   example: "应用字段模板成功"
*                 data:
*                   type: object
*                   properties:
*                     applicationId:
*                       type: string
*                       example: "app_123456"
*                     templateId:
*                       type: integer
*                       example: 1
*                     templateName:
*                       type: string
*                       example: "学生基本信息模板"
*                     targetInfo:
*                       type: object
*                       properties:
*                         targetId:
*                           type: string
*                           example: "12345"
*                         targetType:
*                           type: string
*                           example: "class"
*                         targetName:
*                           type: string
*                           example: "大一1班"
*                     appliedFields:
*                       type: integer
*                       example: 15
*                     overriddenFields:
*                       type: integer
*                       example: 3
*                     skippedFields:
*                       type: integer
*                       example: 2
*                     applicationTime:
*                       type: string
*                       format: date-time
*                     previewData:
*                       type: object
*                       properties:
*                         fieldStructure:
*                           type: array
*                           items:
*                             type: object
*                             properties:
*                               name:
*                                 type: string
*                               type:
*                                 type: string
*                               required:
*                                 type: boolean
*                               status:
*                                 type: string
*                                 enum: [applied, overridden, skipped, custom]
*                       description: 预览模式的字段结构（当applyMode为preview时）
*       400:
*         description: 请求参数错误或模板不兼容
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
*                   example: "模板类型与目标实体不兼容"
*                 data:
*                   type: object
*                   properties:
*                     templateEntityType:
*                       type: string
*                       example: "student"
*                     targetEntityType:
*                       type: string
*                       example: "activity"
*       401:
*         $ref: '#/components/responses/Unauthorized'
*       403:
*         $ref: '#/components/responses/Forbidden'
*       404:
*         $ref: '#/components/responses/NotFound'
*       409:
*         description: 目标对象已存在字段配置
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
*                   example: "目标对象已存在字段配置"
*                 data:
*                   type: object
*                   properties:
*                     targetId:
*                       type: string
*                       example: "12345"
*                     existingFields:
*                       type: integer
*                       example: 8
*                     suggestion:
*                       type: string
*                       example: "设置overrideExisting为true可覆盖现有配置"
*       500:
*         $ref: '#/components/responses/InternalError'
*/
router.post(
  '/:id/apply',
  verifyToken,
  fieldTemplateController.applyTemplate.bind(fieldTemplateController)
);

/**
* @swagger
* /field-templates/{id}:
*   put:
*     summary: 更新字段模板
*     description: 更新指定的字段模板配置。更新操作会创建新版本，保留历史版本记录。如果模板已被应用到实际对象，需要谨慎修改核心字段。
*     tags: [字段模板管理]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*         description: 模板ID
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
*                 example: "更新后的学生信息模板"
*                 description: 模板名称
*               description:
*                 type: string
*                 maxLength: 500
*                 example: "更新后的模板描述"
*                 description: 模板描述
*               category:
*                 type: string
*                 enum: [basic, detailed, custom, system]
*                 description: 模板分类
*               isPublic:
*                 type: boolean
*                 description: 是否为公共模板
*               tags:
*                 type: array
*                 items:
*                   type: string
*                   maxLength: 30
*                 maxItems: 5
*                 description: 模板标签
*               fields:
*                 type: array
*                 items:
*                   type: object
*                   required:
*                     - name
*                     - type
*                   properties:
*                     name:
*                       type: string
*                       maxLength: 50
*                     label:
*                       type: string
*                       maxLength: 100
*                     type:
*                       type: string
*                       enum: [text, number, email, phone, date, select, multiselect, textarea, boolean, file]
*                     required:
*                       type: boolean
*                     defaultValue:
*                       oneOf:
*                         - type: string
*                         - type: number
*                         - type: boolean
*                         - type: array
*                         - type: object
*                     placeholder:
*                       type: string
*                       maxLength: 200
*                     validation:
*                       type: object
*                       properties:
*                         minLength:
*                           type: integer
*                           minimum: 0
*                         maxLength:
*                           type: integer
*                           minimum: 1
*                           maximum: 1000
*                         pattern:
*                           type: string
*                         min:
*                           type: number
*                         max:
*                           type: number
*                         required:
*                           type: boolean
*                     options:
*                       type: array
*                       items:
*                         type: object
*                         properties:
*                           value:
*                             type: string
*                           label:
*                             type: string
*                     order:
*                       type: integer
*                       minimum: 0
*                     description:
*                       type: string
*                       maxLength: 300
*                     isVisible:
*                       type: boolean
*                     isEditable:
*                       type: boolean
*                 description: 更新的字段配置列表
*               metadata:
*                 type: object
*                 properties:
*                   version:
*                     type: string
*                     example: "1.1.0"
*                   notes:
*                     type: string
*                     example: "添加了紧急联系人字段"
*                 description: 更新的模板元数据
*               updateMode:
*                 type: string
*                 enum: [full, partial, safe]
*                 default: "safe"
*                 description: 更新模式：完整替换、部分更新或安全更新（不影响已应用的实例）
*               changeDescription:
*                 type: string
*                 maxLength: 500
*                 example: "添加家长联系电话字段，调整出生日期验证规则"
*                 description: 更新变更说明
*     responses:
*       200:
*         description: 更新模板成功
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
*                   example: "更新字段模板成功"
*                 data:
*                   allOf:
*                     - $ref: '#/components/schemas/FieldTemplate'
*                     - type: object
*                       properties:
*                         updateInfo:
*                           type: object
*                           properties:
*                             previousVersion:
*                               type: string
*                               example: "1.0.0"
*                             currentVersion:
*                               type: string
*                               example: "1.1.0"
*                             changedFields:
*                               type: array
*                               items:
*                                 type: string
*                               example: ["parentPhone", "birthDate"]
*                             addedFields:
*                               type: array
*                               items:
*                                 type: string
*                               example: ["emergencyContact"]
*                             removedFields:
*                               type: array
*                               items:
*                               type: string
*                               example: []
*                             affectedApplications:
*                               type: integer
*                               example: 23
*                             updateMode:
*                               type: string
*                               example: "safe"
*       400:
*         description: 请求参数错误或不安全的更新
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
*                   example: "不能删除已被使用的必填字段"
*                 data:
*                   type: object
*                   properties:
*                     restrictedFields:
*                       type: array
*                       items:
*                         type: string
*                       example: ["studentName", "studentId"]
*                     suggestion:
*                       type: string
*                       example: "使用安全更新模式或标记字段为不可见"
*       401:
*         $ref: '#/components/responses/Unauthorized'
*       403:
*         $ref: '#/components/responses/Forbidden'
*       404:
*         $ref: '#/components/responses/NotFound'
*       409:
*         description: 模板名称已存在
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
*                   example: "模板名称已存在"
*       500:
*         $ref: '#/components/responses/InternalError'
*/
router.put(
  '/:id',
  verifyToken,
  fieldTemplateController.updateTemplate.bind(fieldTemplateController)
);

/**
* @swagger
* /field-templates/{id}:
*   delete:
*     summary: 删除字段模板
*     description: 删除指定的字段模板。如果模板已被应用到实际对象，需要先解除应用关系或强制删除。删除操作不可逆，请谨慎操作。
*     tags: [字段模板管理]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*         description: 模板ID
*       - in: query
*         name: force
*         schema:
*           type: boolean
*           default: false
*         description: 是否强制删除（即使模板正在使用中）
*       - in: query
*         name: cascade
*         schema:
*           type: boolean
*           default: false
*         description: 是否级联删除相关的应用记录
*     responses:
*       200:
*         description: 删除模板成功
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
*                   example: "删除字段模板成功"
*                 data:
*                   type: object
*                   properties:
*                     deletedTemplateId:
*                       type: integer
*                       example: 1
*                     deletedTemplateName:
*                       type: string
*                       example: "测试模板"
*                     affectedApplications:
*                       type: integer
*                       example: 0
*                     deletionTime:
*                       type: string
*                       format: date-time
*       400:
*         description: 模板正在使用中，无法删除
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
*                   example: "模板正在使用中，无法删除"
*                 data:
*                   type: object
*                   properties:
*                     templateId:
*                       type: integer
*                       example: 1
*                     activeApplications:
*                       type: integer
*                       example: 15
*                     affectedEntities:
*                       type: array
*                       items:
*                         type: object
*                         properties:
*                           entityType:
*                             type: string
*                             example: "class"
*                           entityId:
*                             type: string
*                             example: "12345"
*                           entityName:
*                             type: string
*                             example: "大一1班"
*                     suggestions:
*                       type: array
*                       items:
*                         type: string
*                       example: ["先解除所有应用关系", "使用force参数强制删除"]
*       401:
*         $ref: '#/components/responses/Unauthorized'
*       403:
*         $ref: '#/components/responses/Forbidden'
*       404:
*         $ref: '#/components/responses/NotFound'
*       500:
*         $ref: '#/components/responses/InternalError'
*/
router.delete(
  '/:id',
  verifyToken,
  fieldTemplateController.deleteTemplate.bind(fieldTemplateController)
);

export default router;

