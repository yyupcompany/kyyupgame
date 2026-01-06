"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var script_controller_1 = __importDefault(require("../controllers/script.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/scripts:
 *   get:
 *     summary: 获取脚本列表
 *     description: 获取所有脚本的列表
 *     tags:
 *       - 脚本管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', auth_middleware_1.verifyToken, script_controller_1["default"].getScripts);
/**
 * @swagger
 * /api/scripts/stats:
 *   get:
 *     summary: 获取脚本统计
 *     description: 获取脚本的统计信息
 *     tags:
 *       - 脚本管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', auth_middleware_1.verifyToken, script_controller_1["default"].getScriptStats);
/**
 * @swagger
 * /api/scripts/{id}:
 *   get:
 *     summary: 获取脚本详情
 *     description: 获取指定脚本的详细信息
 *     tags:
 *       - 脚本管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', auth_middleware_1.verifyToken, script_controller_1["default"].getScriptById);
/**
 * @swagger
 * /api/scripts:
 *   post:
 *     summary: 创建脚本
 *     description: 创建新的脚本
 *     tags:
 *       - 脚本管理
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
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *               content:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', auth_middleware_1.verifyToken, script_controller_1["default"].createScript);
/**
 * @swagger
 * /api/scripts/{id}:
 *   put:
 *     summary: 更新脚本
 *     description: 更新指定的脚本
 *     tags:
 *       - 脚本管理
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               name:
 *                 type: string
 *               content:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/:id', auth_middleware_1.verifyToken, script_controller_1["default"].updateScript);
/**
 * @swagger
 * /api/scripts/{id}:
 *   delete:
 *     summary: 删除脚本
 *     description: 删除指定的脚本
 *     tags:
 *       - 脚本管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, script_controller_1["default"].deleteScript);
/**
 * @swagger
 * /api/scripts/{id}/use:
 *   post:
 *     summary: 使用脚本
 *     description: 执行指定的脚本
 *     tags:
 *       - 脚本管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parameters:
 *                 type: object
 *     responses:
 *       200:
 *         description: 执行成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/use', auth_middleware_1.verifyToken, script_controller_1["default"].useScript);
exports["default"] = router;
