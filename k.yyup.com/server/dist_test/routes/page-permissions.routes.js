"use strict";
/**
 * 页面权限路由 - Level 3: 页面操作权限
 * Page Permissions Routes - Level 3: Page Action Permissions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var page_permissions_controller_1 = require("../controllers/page-permissions.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1["default"].Router();
/**
 * @swagger
 * /permissions/page-actions:
 *   get:
 *     summary: Level 3 - 获取页面操作权限
 *     description: 获取指定页面的操作权限（button类型），支持按pageId或pagePath查询
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageId
 *         schema:
 *           type: string
 *         description: 页面权限ID
 *       - in: query
 *         name: pagePath
 *         schema:
 *           type: string
 *         description: 页面路径（支持模糊匹配）
 *     responses:
 *       200:
 *         description: 成功获取页面权限
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
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           name:
 *                             type: string
 *                           code:
 *                             type: string
 *                           type:
 *                             type: string
 *                             example: button
 *                           permission:
 *                             type: string
 *                     grouped:
 *                       type: object
 *                       description: 按功能分组的权限
 *                     summary:
 *                       type: object
 *                       description: 权限统计信息
 *                 meta:
 *                   type: object
 *                   properties:
 *                     fromCache:
 *                       type: boolean
 *                     responseTime:
 *                       type: number
 *                     level:
 *                       type: number
 *                       example: 3
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器错误
 */
router.get('/page-actions', auth_middleware_1.verifyToken, page_permissions_controller_1.getPageActions);
/**
 * @swagger
 * /permissions/batch-check:
 *   post:
 *     summary: Level 3 - 批量权限验证
 *     description: 批量验证多个权限，提高验证效率
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["EDIT_STUDENT", "DELETE_STUDENT", "VIEW_STUDENT"]
 *                 description: 要验证的权限代码列表
 *             required:
 *               - permissions
 *     responses:
 *       200:
 *         description: 批量权限验证结果
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
 *                     results:
 *                       type: object
 *                       additionalProperties:
 *                         type: boolean
 *                       example:
 *                         "EDIT_STUDENT": true
 *                         "DELETE_STUDENT": false
 *                         "VIEW_STUDENT": true
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 3
 *                         granted:
 *                           type: number
 *                           example: 2
 *                         denied:
 *                           type: number
 *                           example: 1
 *                 meta:
 *                   type: object
 *                   properties:
 *                     responseTime:
 *                       type: number
 *                     level:
 *                       type: number
 *                       example: 3
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器错误
 */
router.post('/batch-check', auth_middleware_1.verifyToken, page_permissions_controller_1.batchCheckPermissions);
exports["default"] = router;
