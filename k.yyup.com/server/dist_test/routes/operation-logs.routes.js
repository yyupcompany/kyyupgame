"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var apiResponse_1 = require("../utils/apiResponse");
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     OperationLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 操作日志ID
 *         action:
 *           type: string
 *           description: "操作类型 (如: create, update, delete, login, logout等)"
 *         module:
 *           type: string
 *           description: "操作模块 (如: user, student, teacher等)"
 *         targetType:
 *           type: string
 *           nullable: true
 *           description: 操作目标类型
 *         targetId:
 *           type: integer
 *           nullable: true
 *           description: 操作目标ID
 *         details:
 *           type: string
 *           nullable: true
 *           description: 操作详情 (JSON格式)
 *         result:
 *           type: string
 *           description: 操作结果 (success, failed等)
 *           default: success
 *         userId:
 *           type: integer
 *           nullable: true
 *           description: 操作用户ID
 *         ip:
 *           type: string
 *           nullable: true
 *           description: 操作者IP地址
 *         userAgent:
 *           type: string
 *           nullable: true
 *           description: 用户代理信息
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     CreateOperationLogRequest:
 *       type: object
 *       required:
 *         - action
 *         - module
 *       properties:
 *         action:
 *           type: string
 *           description: 操作类型
 *           example: "create"
 *         module:
 *           type: string
 *           description: 操作模块
 *           example: "user"
 *         targetType:
 *           type: string
 *           description: 操作目标类型
 *           example: "User"
 *         targetId:
 *           type: integer
 *           description: 操作目标ID
 *           example: 123
 *         details:
 *           type: string
 *           description: 操作详情 (JSON格式)
 *           example: '{"name": "新用户", "role": "teacher"}'
 *         result:
 *           type: string
 *           description: 操作结果
 *           example: "success"
 *         userId:
 *           type: integer
 *           description: 操作用户ID
 *           example: 1
 *         ip:
 *           type: string
 *           description: 操作者IP地址
 *           example: "192.168.1.100"
 *         userAgent:
 *           type: string
 *           description: 用户代理信息
 *           example: "Mozilla/5.0..."
 *     OperationLogsResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OperationLog'
 *         total:
 *           type: integer
 *           description: 总记录数
 *         page:
 *           type: integer
 *           description: 当前页码
 *         pageSize:
 *           type: integer
 *           description: 每页记录数
 *         totalPages:
 *           type: integer
 *           description: 总页数
 *   tags:
 *     - name: 操作日志
 *       description: 系统操作日志管理
 */
/**
 * @swagger
 * /operation-logs:
 *   get:
 *     summary: 获取操作日志列表
 *     description: 分页获取系统操作日志列表
 *     tags: [操作日志]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: 每页记录数
 *     responses:
 *       200:
 *         description: 成功获取操作日志列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OperationLogsResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var page, pageSize, offset, operationLogs, totalCountResult, total, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                page = parseInt(req.query.page) || 1;
                pageSize = parseInt(req.query.pageSize) || 10;
                offset = (page - 1) * pageSize;
                return [4 /*yield*/, init_1.sequelize.query('SELECT * FROM operation_logs ORDER BY created_at DESC LIMIT :limit OFFSET :offset', {
                        replacements: { limit: pageSize, offset: offset },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                operationLogs = _a.sent();
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as total FROM operation_logs', { type: sequelize_1.QueryTypes.SELECT })];
            case 2:
                totalCountResult = _a.sent();
                total = totalCountResult[0].total;
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        items: operationLogs,
                        total: total,
                        page: page,
                        pageSize: pageSize,
                        totalPages: Math.ceil(total / pageSize)
                    })];
            case 3:
                error_1 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_1, '获取操作日志失败')];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /operation-logs:
 *   post:
 *     summary: 创建操作日志
 *     description: 创建新的系统操作日志记录
 *     tags: [操作日志]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOperationLogRequest'
 *           examples:
 *             创建用户:
 *               value:
 *                 action: "create"
 *                 module: "user"
 *                 targetType: "User"
 *                 targetId: 123
 *                 details: '{"name": "张三", "role": "teacher"}'
 *                 result: "success"
 *             登录操作:
 *               value:
 *                 action: "login"
 *                 module: "auth"
 *                 result: "success"
 *     responses:
 *       200:
 *         description: 成功创建操作日志
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OperationLog'
 *       400:
 *         description: "请求参数错误 (操作类型和模块不能为空)"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "操作类型和模块不能为空"
 *               code: "INVALID_PARAMS"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, action, module_1, targetType, targetId, details, operationResult, userId, ip, userAgent, insertResult, insertId, error_2;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _a = req.body, action = _a.action, module_1 = _a.module, targetType = _a.targetType, targetId = _a.targetId, details = _a.details, operationResult = _a.result, userId = _a.userId, ip = _a.ip, userAgent = _a.userAgent;
                if (!action || !module_1) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '操作类型和模块不能为空', 'INVALID_PARAMS', 400)];
                }
                return [4 /*yield*/, init_1.sequelize.query("INSERT INTO operation_logs (action, module, target_type, target_id, details, result, user_id, ip, user_agent, created_at, updated_at) \n       VALUES (:action, :module, :targetType, :targetId, :details, :result, :userId, :ip, :userAgent, NOW(), NOW())", {
                        replacements: {
                            action: action,
                            module: module_1,
                            targetType: targetType || null,
                            targetId: targetId || null,
                            details: details || null,
                            result: operationResult || 'success',
                            userId: userId || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || null,
                            ip: ip || req.ip || null,
                            userAgent: userAgent || req.get('User-Agent') || null
                        },
                        type: sequelize_1.QueryTypes.INSERT
                    })];
            case 1:
                insertResult = _d.sent();
                insertId = insertResult[0];
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        id: insertId,
                        action: action,
                        module: module_1,
                        targetType: targetType || null,
                        targetId: targetId || null,
                        details: details || null,
                        result: operationResult || 'success',
                        userId: userId || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) || null,
                        ip: ip || req.ip || null,
                        userAgent: userAgent || req.get('User-Agent') || null,
                        createdAt: new Date().toISOString()
                    }, '创建操作日志成功')];
            case 2:
                error_2 = _d.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '创建操作日志失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /operation-logs/{id}:
 *   get:
 *     summary: 获取操作日志详情
 *     description: 根据ID获取特定操作日志的详细信息
 *     tags: [操作日志]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 操作日志ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功获取操作日志详情
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OperationLog'
 *             example:
 *               success: true
 *               message: "获取操作日志详情成功"
 *               data:
 *                 id: 1
 *                 action: "create"
 *                 module: "user"
 *                 targetType: "User"
 *                 targetId: 123
 *                 details: '{"name": "张三", "role": "teacher"}'
 *                 result: "success"
 *                 userId: 1
 *                 ip: "192.168.1.100"
 *                 userAgent: "Mozilla/5.0..."
 *                 createdAt: "2024-01-01T10:00:00.000Z"
 *                 updatedAt: "2024-01-01T10:00:00.000Z"
 *       404:
 *         description: 操作日志不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "操作日志不存在"
 *               code: "NOT_FOUND"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, operationLogs, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query('SELECT * FROM operation_logs WHERE id = :id LIMIT 1', {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                operationLogs = _a.sent();
                if (operationLogs.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '操作日志不存在', 'NOT_FOUND', 404)];
                }
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, operationLogs[0], '获取操作日志详情成功')];
            case 2:
                error_3 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_3, '获取操作日志详情失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /operation-logs/{id}:
 *   delete:
 *     summary: 删除操作日志
 *     description: 根据ID删除特定的操作日志记录
 *     tags: [操作日志]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 操作日志ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功删除操作日志
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: 被删除的操作日志ID
 *             example:
 *               success: true
 *               message: "删除操作日志成功"
 *               data:
 *                 id: 1
 *       404:
 *         description: 操作日志不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "操作日志不存在"
 *               code: "NOT_FOUND"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, existingLogs, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM operation_logs WHERE id = :id', {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existingLogs = _a.sent();
                if (existingLogs.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '操作日志不存在', 'NOT_FOUND', 404)];
                }
                return [4 /*yield*/, init_1.sequelize.query('DELETE FROM operation_logs WHERE id = :id', {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.DELETE
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { id: parseInt(id) }, '删除操作日志成功')];
            case 3:
                error_4 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_4, '删除操作日志失败')];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /operation-logs/cleanup:
 *   delete:
 *     summary: 清理操作日志
 *     description: 批量清理过期或满足条件的操作日志记录 (当前暂未实现)
 *     tags: [操作日志]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "清理功能暂未实现"
 *               code: "NOT_IMPLEMENTED"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router["delete"]('/cleanup', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '清理功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '清理操作日志失败')];
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
