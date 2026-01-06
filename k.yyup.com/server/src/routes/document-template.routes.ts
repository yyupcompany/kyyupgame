import { Router } from 'express';
import { DocumentTemplateController } from '../controllers/document-template.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

/**
* @swagger
 * components:
 *   schemas:
 *     DocumentTemplate:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 模板唯一标识符
 *           example: 1
 *         title:
 *           type: string
 *           description: 模板标题
 *           example: "幼儿园教学计划模板"
 *         description:
 *           type: string
 *           description: 模板描述
 *           example: "适用于幼儿园日常教学计划制定的标准化模板"
 *         category_id:
 *           type: integer
 *           description: 分类ID
 *           example: 1
 *         category:
 *           type: object
 *           description: 分类信息
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: "教学管理"
 *         type:
 *           type: string
 *           enum: ["official", "custom", "shared"]
 *           description: 模板类型
 *           example: "official"
 *         template_type:
 *           type: string
 *           description: 模板文件类型
 *           example: "word"
 *         content:
 *           type: string
 *           description: 模板内容（HTML或Markdown格式）
 *           example: "<h1>教学计划</h1><p>本周教学内容...</p>"
 *         file_url:
 *           type: string
 *           description: 模板文件URL
 *           example: "http://example.com/templates/teaching-plan.docx"
 *         thumbnail_url:
 *           type: string
 *           description: 缩略图URL
 *           example: "http://example.com/templates/teaching-plan-thumb.jpg"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 模板标签
 *           example: ["教学", "计划", "周计划"]
 *         usage_count:
 *           type: integer
 *           description: 使用次数
 *           example: 156
 *         download_count:
 *           type: integer
 *           description: 下载次数
 *           example: 89
 *         rating:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 5
 *           description: 平均评分
 *           example: 4.5
 *         rating_count:
 *           type: integer
 *           description: 评分人数
 *           example: 23
 *         is_public:
 *           type: boolean
 *           description: 是否公开
 *           example: true
 *         is_featured:
 *           type: boolean
 *           description: 是否推荐
 *           example: true
 *         creator_id:
 *           type: integer
 *           description: 创建人ID
 *           example: 123
 *         creator:
 *           type: object
 *           description: 创建人信息
 *           properties:
 *             id:
 *               type: integer
 *               example: 123
 *             name:
 *               type: string
 *               example: "张老师"
 *             avatar:
 *               type: string
 *               example: "avatar.jpg"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-01T09:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-01T15:30:00Z"
*
 *     TemplateCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 分类唯一标识符
 *           example: 1
 *         name:
 *           type: string
 *           description: 分类名称
 *           example: "教学管理"
 *         description:
 *           type: string
 *           description: 分类描述
 *           example: "教学相关文档模板"
 *         icon:
 *           type: string
 *           description: 分类图标
 *           example: "teaching"
 *         sort_order:
 *           type: integer
 *           description: 排序序号
 *           example: 1
 *         template_count:
 *           type: integer
 *           description: 分类下的模板数量
 *           example: 25
 *         is_active:
 *           type: boolean
 *           description: 是否启用
 *           example: true
*
 *     TemplateListResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DocumentTemplate'
 *         total:
 *           type: integer
 *           description: 总数量
 *           example: 50
 *         page:
 *           type: integer
 *           description: 当前页码
 *           example: 1
 *         pageSize:
 *           type: integer
 *           description: 每页数量
 *           example: 20
 *         totalPages:
 *           type: integer
 *           description: 总页数
 *           example: 3
*
 *     CreateTemplateRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category_id
 *         - type
 *       properties:
 *         title:
 *           type: string
 *           description: 模板标题
 *           example: "我的教学模板"
 *           minLength: 1
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: 模板描述
 *           example: "个性化的教学计划模板"
 *           maxLength: 500
 *         category_id:
 *           type: integer
 *           description: 分类ID
 *           example: 1
 *         type:
 *           type: string
 *           enum: ["official", "custom", "shared"]
 *           description: 模板类型
 *           example: "custom"
 *         content:
 *           type: string
 *           description: 模板内容
 *           example: "<h1>教学计划</h1><p>内容...</p>"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 模板标签
 *           example: ["教学", "个性化"]
 *         is_public:
 *           type: boolean
 *           description: 是否公开
 *           example: false
*
 *     UpdateTemplateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: 模板标题
 *           example: "更新后的模板标题"
 *           minLength: 1
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: 模板描述
 *           example: "更新后的模板描述"
 *           maxLength: 500
 *         category_id:
 *           type: integer
 *           description: 分类ID
 *           example: 2
 *         content:
 *           type: string
 *           description: 模板内容
 *           example: "<h1>更新内容</h1><p>新的内容...</p>"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 模板标签
 *           example: ["教学", "更新"]
 *         is_public:
 *           type: boolean
 *           description: 是否公开
 *           example: true
 *         is_featured:
 *           type: boolean
 *           description: 是否推荐
 *           example: true
*
 *     TemplateRecommendation:
 *       type: object
 *       properties:
 *         template:
 *           $ref: '#/components/schemas/DocumentTemplate'
 *         score:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 1
 *           description: 推荐分数
 *           example: 0.95
 *         reason:
 *           type: string
 *           description: 推荐理由
 *           example: "基于您的使用历史和偏好推荐"
*
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*
 *   responses:
 *     Unauthorized:
 *       description: 未授权访问
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "UNAUTHORIZED"
 *                   message:
 *                     type: string
 *                     example: "访问被拒绝，请提供有效的访问令牌"
 *     Forbidden:
 *       description: 权限不足
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "FORBIDDEN"
 *                   message:
 *                     type: string
 *                     example: "权限不足，无法访问该资源"
 *     NotFound:
 *       description: 资源不存在
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "NOT_FOUND"
 *                   message:
 *                     type: string
 *                     example: "请求的资源不存在"
 *     BadRequest:
 *       description: 请求参数错误
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "BAD_REQUEST"
 *                   message:
 *                     type: string
 *                     example: "请求参数格式错误或缺少必要参数"
 *     InternalServerError:
 *       description: 服务器内部错误
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "INTERNAL_ERROR"
 *                   message:
 *                     type: string
 *                     example: "服务器内部错误，请稍后重试"
*/

/**
 * 文档模板相关路由
 * 基础路径: /api/document-templates
*/

// 所有路由都需要认证
router.use(verifyToken);

/**
* @swagger
 * /api/document-templates/categories:
 *   get:
 *     summary: 获取模板分类列表
 *     description: 获取所有文档模板的分类信息，包括每个分类下的模板数量
 *     tags:
 *       - Document Templates
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取分类列表
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
 *                     $ref: '#/components/schemas/TemplateCategory'
 *                 message:
 *                   type: string
 *                   example: "获取分类列表成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/categories', DocumentTemplateController.getCategories);

/**
* @swagger
 * /api/document-templates/recommend:
 *   get:
 *     summary: 获取智能推荐模板
 *     description: 基于用户的使用历史、偏好和当前场景智能推荐合适的文档模板
 *     tags:
 *       - Document Templates
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
 *         description: 推荐数量限制
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: 指定分类ID进行推荐
 *       - in: query
 *         name: context
 *         schema:
 *           type: string
 *           enum: ["teaching", "admin", "parent", "activity"]
 *         description: 使用场景上下文
 *     responses:
 *       200:
 *         description: 成功获取推荐模板
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
 *                     $ref: '#/components/schemas/TemplateRecommendation'
 *                 message:
 *                   type: string
 *                   example: "获取推荐模板成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/recommend', DocumentTemplateController.recommendTemplates);

/**
* @swagger
 * /api/document-templates/search:
 *   get:
 *     summary: 搜索文档模板
 *     description: 根据关键词、分类、标签等条件搜索文档模板
 *     tags:
 *       - Document Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词（标题、描述、标签）
 *         example: "教学计划"
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: 分类ID筛选
 *         example: 1
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["official", "custom", "shared"]
 *         description: 模板类型筛选
 *         example: "official"
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: 标签筛选（多个标签用逗号分隔）
 *         example: "教学,计划"
 *       - in: query
 *         name: is_public
 *         schema:
 *           type: boolean
 *         description: 是否公开模板
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: ["created_at", "usage_count", "rating", "download_count"]
 *           default: "created_at"
 *         description: 排序字段
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "desc"
 *         description: 排序顺序
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
 *           maximum: 50
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功搜索到模板
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TemplateListResponse'
 *                 message:
 *                   type: string
 *                   example: "搜索模板成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/search', DocumentTemplateController.searchTemplates);

/**
* @swagger
 * /api/document-templates/{id}:
 *   get:
 *     summary: 获取模板详情
 *     description: 根据模板ID获取指定模板的详细信息，包括内容和使用统计
 *     tags:
 *       - Document Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 模板ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功获取模板详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DocumentTemplate'
 *                 message:
 *                   type: string
 *                   example: "获取模板详情成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/:id', DocumentTemplateController.getTemplateById);

/**
* @swagger
 * /api/document-templates:
 *   get:
 *     summary: 获取模板列表
 *     description: 分页获取文档模板列表，支持分类筛选和排序
 *     tags:
 *       - Document Templates
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
 *           maximum: 50
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: 分类ID筛选
 *         example: 1
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["official", "custom", "shared"]
 *         description: 模板类型筛选
 *         example: "official"
 *       - in: query
 *         name: is_featured
 *         schema:
 *           type: boolean
 *         description: 是否只显示推荐模板
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: ["created_at", "usage_count", "rating", "download_count"]
 *           default: "created_at"
 *         description: 排序字段
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "desc"
 *         description: 排序顺序
 *     responses:
 *       200:
 *         description: 成功获取模板列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TemplateListResponse'
 *                 message:
 *                   type: string
 *                   example: "获取模板列表成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/', DocumentTemplateController.getTemplates);

export default router;

