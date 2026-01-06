/**
* @swagger
 * components:
 *   schemas:
 *     Page-guide:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Page-guide ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Page-guide 名称
 *           example: "示例Page-guide"
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
 *     CreatePage-guideRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Page-guide 名称
 *           example: "新Page-guide"
 *     UpdatePage-guideRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Page-guide 名称
 *           example: "更新后的Page-guide"
 *     Page-guideListResponse:
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
 *                 $ref: '#/components/schemas/Page-guide'
 *         message:
 *           type: string
 *           example: "获取page-guide列表成功"
 *     Page-guideResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Page-guide'
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
 * page-guide管理路由文件
 * 提供page-guide的基础CRUD操作
*
 * 功能包括：
 * - 获取page-guide列表
 * - 创建新page-guide
 * - 获取page-guide详情
 * - 更新page-guide信息
 * - 删除page-guide
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { PageGuideController } from '../controllers/page-guide.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
 * 页面说明文档路由
*/

/**
* @summary 根据页面路径获取页面引导文档
* @description 根据页面路径获取对应的页面引导说明文档，用于在前端展示页面功能介绍、
 * 操作指引、注意事项等信息。支持精确路径匹配和模糊匹配。
*
* @tags 页面引导管理
* @param {string} pagePath.path.required 页面路径，支持前端路由路径
*
* @responses {200} {object} 成功响应
* @responses {200} {object} description:获取页面引导文档成功
* @responses {200} {object} schema: {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "pagePath": "/dashboard",
 *     "pageTitle": "仪表板",
 *     "description": "系统概览和关键指标展示",
 *     "content": {
 *       "overview": "页面功能概述",
 *       "features": ["功能1", "功能2"],
 *       "steps": ["步骤1", "步骤2"]
 *     },
 *     "isActive": true,
 *     "createdAt": "2024-01-01T12:00:00.000Z"
 *   }
 * }
*
* @responses {404} {object} 未找到
* @responses {404} {object} description:页面引导文档不存在
* @responses {404} {object} schema: {"success": false, "message": "页面引导文档不存在"}
*/
router.get('/by-path/:pagePath', PageGuideController.getPageGuide);

/**
* @summary 获取页面引导文档列表
* @description 获取系统中所有页面引导文档的列表，支持分页查询、状态筛选、
 * 关键词搜索等功能。用于管理后台查看和维护页面引导文档。
*
* @tags 页面引导管理
* @param {integer} query.page.optional 页码，从1开始，默认1
* @param {integer} query.pageSize.optional 每页记录数，默认20，最大100
* @param {string} query.pagePath.optional 页面路径筛选，支持模糊匹配
* @param {string} query.pageTitle.optional 页面标题筛选，支持模糊匹配
* @param {boolean} query.isActive.optional 状态筛选，true-启用，false-禁用
* @param {string} query.keyword.optional 关键词搜索，搜索标题、描述、内容
*
* @responses {200} {object} 成功响应
* @responses {200} {object} description:获取页面引导文档列表成功
* @responses {200} {object} schema: {
 *   "success": true,
 *   "data": {
 *     "guides": [
 *       {
 *         "id": 1,
 *         "pagePath": "/dashboard",
 *         "pageTitle": "仪表板",
 *         "description": "系统概览和关键指标展示",
 *         "isActive": true,
 *         "viewCount": 156,
 *         "createdAt": "2024-01-01T12:00:00.000Z"
 *       }
 *     ],
 *     "pagination": {
 *       "current": 1,
 *       "pageSize": 20,
 *       "total": 45,
 *       "totalPages": 3
 *     }
 *   }
 * }
*/
router.get('/', PageGuideController.getPageGuideList);

/**
* @summary 创建页面引导文档
* @description 创建新的页面引导文档，用于为系统页面添加功能介绍、操作指引等内容。
 * 支持富文本内容、多媒体嵌入、步骤说明等多种格式。
*
* @tags 页面引导管理
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required 请求体
* @param {string} requestBody.body.pagePath.required 页面路径，必须是有效的系统页面路径
* @param {string} requestBody.body.pageTitle.required 页面标题，用于显示和搜索
* @param {string} requestBody.body.description.optional 页面描述，简要说明页面功能和用途
* @param {object} requestBody.body.content.required 页面引导内容，支持JSON格式的结构化数据
* @param {boolean} requestBody.body.isActive.optional 是否启用状态，默认true
* @param {integer} requestBody.body.sortOrder.optional 排序序号，数值越小越靠前
*
* @responses {201} {object} 成功响应
* @responses {201} {object} description:页面引导文档创建成功
* @responses {201} {object} schema: {
 *   "success": true,
 *   "message": "页面引导文档创建成功",
 *   "data": {
 *     "id": 46,
 *     "pagePath": "/new-page",
 *     "pageTitle": "新功能页面",
 *     "description": "新功能页面的使用说明",
 *     "content": {
 *       "overview": "页面功能介绍",
 *       "sections": ["功能模块说明"]
 *     },
 *     "isActive": true,
 *     "sortOrder": 0,
 *     "createdBy": "admin_user",
 *     "createdAt": "2024-01-01T12:00:00.000Z"
 *   }
 * }
*
* @responses {400} {object} 参数错误
* @responses {400} {object} description:请求参数错误或页面路径已存在
* @responses {400} {object} schema: {"success": false, "message": "页面路径已存在或参数无效"}
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:未授权访问
* @responses {401} {object} schema: {"success": false, "message": "未授权访问"}
*/
router.post('/', PageGuideController.createPageGuide);

/**
* @summary 更新页面引导文档
* @description 更新现有的页面引导文档内容，包括标题、描述、引导内容、状态等信息。
 * 支持部分更新和全量更新，会保留未指定的字段不变。
*
* @tags 页面引导管理
* @security [{"bearerAuth": []}]
* @param {integer} id.path.required 页面引导文档ID
* @param {object} requestBody.body.required 请求体
* @param {string} requestBody.body.pageTitle.optional 页面标题
* @param {string} requestBody.body.description.optional 页面描述
* @param {object} requestBody.body.content.optional 页面引导内容
* @param {boolean} requestBody.body.isActive.optional 是否启用状态
* @param {integer} requestBody.body.sortOrder.optional 排序序号
*
* @responses {200} {object} 成功响应
* @responses {200} {object} description:页面引导文档更新成功
* @responses {200} {object} schema: {
 *   "success": true,
 *   "message": "页面引导文档更新成功",
 *   "data": {
 *     "id": 1,
 *     "pagePath": "/dashboard",
 *     "pageTitle": "更新的仪表板标题",
 *     "description": "更新的描述内容",
 *     "content": {"updated": true},
 *     "isActive": true,
 *     "updatedAt": "2024-01-01T12:00:00.000Z"
 *   }
 * }
*
* @responses {404} {object} 未找到
* @responses {404} {object} description:页面引导文档不存在
* @responses {404} {object} schema: {"success": false, "message": "页面引导文档不存在"}
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:未授权访问
* @responses {401} {object} schema: {"success": false, "message": "未授权访问"}
*/
router.put('/:id', PageGuideController.updatePageGuide);

/**
* @summary 删除页面引导文档
* @description 删除指定的页面引导文档，删除后前端将不再显示该页面的引导内容。
 * 删除操作不可恢复，请谨慎操作。
*
* @tags 页面引导管理
* @security [{"bearerAuth": []}]
* @param {integer} id.path.required 页面引导文档ID
*
* @responses {200} {object} 成功响应
* @responses {200} {object} description:页面引导文档删除成功
* @responses {200} {object} schema: {
 *   "success": true,
 *   "message": "页面引导文档删除成功",
 *   "data": {
 *     "deletedId": 1,
 *     "deletedPagePath": "/dashboard"
 *   }
 * }
*
* @responses {404} {object} 未找到
* @responses {404} {object} description:页面引导文档不存在
* @responses {404} {object} schema: {"success": false, "message": "页面引导文档不存在"}
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:未授权访问
* @responses {401} {object} schema: {"success": false, "message": "未授权访问"}
*/
router.delete('/:id', PageGuideController.deletePageGuide);

// 批量创建营销中心页面感知配置（临时路由）
router.post('/create-marketing-guides', PageGuideController.createMarketingPageGuides);

// 快速创建剩余营销页面配置（临时路由）
router.post('/create-remaining-pages', PageGuideController.createRemainingMarketingPages);

export default router;
