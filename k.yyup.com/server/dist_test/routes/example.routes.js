"use strict";
/**
 * 示例API路由
 * 提供API使用示例和测试端点
 */
exports.__esModule = true;
var express_1 = require("express");
var apiResponse_1 = require("../utils/apiResponse");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /example:
 *   get:
 *     summary: 基本示例端点
 *     tags: [Example]
 *     responses:
 *       200:
 *         description: 成功返回示例数据
 */
router.get('/', function (req, res) {
    var exampleData = {
        message: 'Hello from Kindergarten Management System API',
        timestamp: new Date().toISOString(),
        examples: {
            authentication: '/api/auth/login',
            users: '/api/users',
            students: '/api/students',
            teachers: '/api/teachers',
            classes: '/api/classes',
            activities: '/api/activities',
            enrollment: '/api/enrollment-plans'
        },
        documentation: '/api-docs'
    };
    apiResponse_1.ApiResponse.success(res, exampleData, '示例API响应');
});
/**
 * @swagger
 * /example/{id}:
 *   get:
 *     summary: 获取指定ID的示例数据
 *     tags: [Example]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 示例数据ID
 *     responses:
 *       200:
 *         description: 成功返回示例数据
 *       404:
 *         description: 示例数据不存在
 */
router.get('/:id', function (req, res) {
    var id = parseInt(req.params.id);
    if (isNaN(id)) {
        return apiResponse_1.ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
    }
    var exampleData = {
        id: id,
        name: "\u793A\u4F8B\u9879\u76EE ".concat(id),
        description: "\u8FD9\u662F\u7B2C".concat(id, "\u4E2A\u793A\u4F8B\u9879\u76EE"),
        type: 'example',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    apiResponse_1.ApiResponse.success(res, exampleData, '示例数据获取成功');
});
/**
 * @swagger
 * /example:
 *   post:
 *     summary: 创建示例数据
 *     tags: [Example]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: 示例数据创建成功
 *       400:
 *         description: 请求参数错误
 */
router.post('/', function (req, res) {
    var _a = req.body, name = _a.name, description = _a.description;
    if (!name || !description) {
        return apiResponse_1.ApiResponse.error(res, 'MISSING_REQUIRED_FIELDS', 'name和description是必需的', 400);
    }
    var newExample = {
        id: Math.floor(Math.random() * 10000),
        name: name,
        description: description,
        type: 'example',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    apiResponse_1.ApiResponse.success(res, newExample, '示例数据创建成功', 201);
});
exports["default"] = router;
