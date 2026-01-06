/**
* @swagger
 * components:
 *   schemas:
 *     Page-guide-section:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Page-guide-section ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Page-guide-section 名称
 *           example: "示例Page-guide-section"
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
 *     CreatePage-guide-sectionRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Page-guide-section 名称
 *           example: "新Page-guide-section"
 *     UpdatePage-guide-sectionRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Page-guide-section 名称
 *           example: "更新后的Page-guide-section"
 *     Page-guide-sectionListResponse:
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
 *                 $ref: '#/components/schemas/Page-guide-section'
 *         message:
 *           type: string
 *           example: "获取page-guide-section列表成功"
 *     Page-guide-sectionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Page-guide-section'
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
 * page-guide-section管理路由文件
 * 提供page-guide-section的基础CRUD操作
*
 * 功能包括：
 * - 获取page-guide-section列表
 * - 创建新page-guide-section
 * - 获取page-guide-section详情
 * - 更新page-guide-section信息
 * - 删除page-guide-section
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { PageGuideSectionController } from '../controllers/page-guide-section.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/page-guide-sections:
 *   get:
 *     summary: 获取页面功能板块列表
 *     description: 获取所有页面功能板块
 *     tags:
 *       - 页面功能板块
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', PageGuideSectionController.getPageGuideSections);

/**
* @swagger
 * /api/page-guide-sections:
 *   post:
 *     summary: 创建页面功能板块
 *     description: 创建新的页面功能板块
 *     tags:
 *       - 页面功能板块
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 创建成功
*/
router.post('/', PageGuideSectionController.createPageGuideSection);

/**
* @swagger
 * /api/page-guide-sections/{id}:
 *   put:
 *     summary: 更新页面功能板块
 *     description: 更新指定的页面功能板块
 *     tags:
 *       - 页面功能板块
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 更新成功
*/
router.put('/:id', PageGuideSectionController.updatePageGuideSection);

/**
* @swagger
 * /api/page-guide-sections/{id}:
 *   delete:
 *     summary: 删除页面功能板块
 *     description: 删除指定的页面功能板块
 *     tags:
 *       - 页面功能板块
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
*/
router.delete('/:id', PageGuideSectionController.deletePageGuideSection);

export default router;
