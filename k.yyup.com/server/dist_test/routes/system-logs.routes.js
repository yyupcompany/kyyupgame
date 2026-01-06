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
 *     SystemLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 系统日志ID
 *         level:
 *           type: string
 *           enum: [info, warn, error, debug]
 *           description: 日志级别
 *         message:
 *           type: string
 *           description: 日志消息内容
 *         module:
 *           type: string
 *           description: 模块名称
 *         user_id:
 *           type: integer
 *           nullable: true
 *           description: 用户ID
 *         ip:
 *           type: string
 *           nullable: true
 *           description: IP地址
 *         user_agent:
 *           type: string
 *           nullable: true
 *           description: 用户代理
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     SystemLogCreate:
 *       type: object
 *       required:
 *         - level
 *         - message
 *       properties:
 *         level:
 *           type: string
 *           enum: [info, warn, error, debug]
 *           description: 日志级别
 *         message:
 *           type: string
 *           description: 日志消息内容
 *         module:
 *           type: string
 *           description: 模块名称
 *         userId:
 *           type: integer
 *           description: 用户ID
 *         ip:
 *           type: string
 *           description: IP地址
 *         userAgent:
 *           type: string
 *           description: 用户代理
 *     OperationLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 操作日志ID
 *         action:
 *           type: string
 *           description: 操作类型
 *         resource:
 *           type: string
 *           description: 操作资源
 *         user_id:
 *           type: integer
 *           description: 操作用户ID
 *         details:
 *           type: string
 *           description: 操作详情
 *         ip:
 *           type: string
 *           description: IP地址
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *     LogStatistics:
 *       type: object
 *       properties:
 *         system_logs:
 *           type: integer
 *           description: 系统日志总数
 *         operation_logs:
 *           type: integer
 *           description: 操作日志总数
 *         total:
 *           type: integer
 *           description: 总日志数量
 *   tags:
 *     - name: SystemLogs
 *       description: 系统日志管理
 */
/**
 * @swagger
 * /system-logs:
 *   get:
 *     summary: 获取系统日志列表
 *     description: 分页获取系统日志列表，支持查询参数
 *     tags: [SystemLogs]
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
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
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
 *                         $ref: '#/components/schemas/SystemLog'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *                     totalPages:
 *                       type: integer
 *                       description: 总页数
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var page, pageSize, offset, systemLogs, totalCountResult, total, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                page = parseInt(req.query.page) || 1;
                pageSize = parseInt(req.query.pageSize) || 10;
                offset = (page - 1) * pageSize;
                return [4 /*yield*/, init_1.sequelize.query('SELECT * FROM system_logs ORDER BY created_at DESC LIMIT :limit OFFSET :offset', {
                        replacements: { limit: pageSize, offset: offset },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                systemLogs = _a.sent();
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as total FROM system_logs', { type: sequelize_1.QueryTypes.SELECT })];
            case 2:
                totalCountResult = _a.sent();
                total = totalCountResult[0].total;
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        items: systemLogs,
                        total: total,
                        page: page,
                        pageSize: pageSize,
                        totalPages: Math.ceil(total / pageSize)
                    })];
            case 3:
                error_1 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_1, '获取系统日志失败')];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system-logs:
 *   post:
 *     summary: 创建系统日志
 *     description: 创建新的系统日志记录
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SystemLogCreate'
 *           example:
 *             level: "info"
 *             message: "用户登录成功"
 *             module: "auth"
 *             userId: 1
 *             ip: "192.168.1.1"
 *             userAgent: "Mozilla/5.0"
 *     responses:
 *       200:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SystemLog'
 *                 message:
 *                   type: string
 *                   example: "创建系统日志成功"
 *       400:
 *         description: 参数错误
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
 *                   example: "日志级别和消息内容不能为空"
 *                 error:
 *                   type: string
 *                   example: "INVALID_PARAMS"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, level, message, module_1, userId, ip, userAgent, result, insertId, error_2;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _a = req.body, level = _a.level, message = _a.message, module_1 = _a.module, userId = _a.userId, ip = _a.ip, userAgent = _a.userAgent;
                if (!level || !message) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '日志级别和消息内容不能为空', 'INVALID_PARAMS', 400)];
                }
                return [4 /*yield*/, init_1.sequelize.query("INSERT INTO system_logs (level, message, module, user_id, ip, user_agent, created_at, updated_at) \n       VALUES (:level, :message, :module, :userId, :ip, :userAgent, NOW(), NOW())", {
                        replacements: {
                            level: level,
                            message: message,
                            module: module_1 || 'system',
                            userId: userId || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || null,
                            ip: ip || req.ip || null,
                            userAgent: userAgent || req.get('User-Agent') || null
                        },
                        type: sequelize_1.QueryTypes.INSERT
                    })];
            case 1:
                result = _d.sent();
                insertId = result[0];
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        id: insertId,
                        level: level,
                        message: message,
                        module: module_1 || 'system',
                        userId: userId || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) || null,
                        ip: ip || req.ip || null,
                        userAgent: userAgent || req.get('User-Agent') || null,
                        createdAt: new Date().toISOString()
                    }, '创建系统日志成功')];
            case 2:
                error_2 = _d.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '创建系统日志失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system-logs/{id}:
 *   get:
 *     summary: 获取单条系统日志
 *     description: 根据ID获取特定的系统日志详情
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 系统日志ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SystemLog'
 *                 message:
 *                   type: string
 *                   example: "获取系统日志详情成功"
 *       404:
 *         description: 系统日志不存在
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
 *                   example: "系统日志不存在"
 *                 error:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, systemLogs, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query('SELECT * FROM system_logs WHERE id = :id', {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                systemLogs = _a.sent();
                if (systemLogs.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '系统日志不存在', 'NOT_FOUND', 404)];
                }
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, systemLogs[0], '获取系统日志详情成功')];
            case 2:
                error_3 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_3, '获取系统日志详情失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system-logs/{id}:
 *   delete:
 *     summary: 删除系统日志
 *     description: 根据ID删除特定的系统日志
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 系统日志ID
 *     responses:
 *       200:
 *         description: 删除成功
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
 *                     id:
 *                       type: integer
 *                       description: 删除的日志ID
 *                 message:
 *                   type: string
 *                   example: "删除系统日志成功"
 *       404:
 *         description: 系统日志不存在
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
 *                   example: "系统日志不存在"
 *                 error:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, existingLogs, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM system_logs WHERE id = :id', {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existingLogs = _a.sent();
                if (existingLogs.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '系统日志不存在', 'NOT_FOUND', 404)];
                }
                return [4 /*yield*/, init_1.sequelize.query('DELETE FROM system_logs WHERE id = :id', {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.DELETE
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { id: parseInt(id) }, '删除系统日志成功')];
            case 3:
                error_4 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_4, '删除系统日志失败')];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system-logs/cleanup:
 *   post:
 *     summary: 清理系统日志
 *     description: 清理历史系统日志记录（暂未实现）
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 功能暂未实现
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
 *                   example: "清理功能暂未实现"
 *                 error:
 *                   type: string
 *                   example: "NOT_IMPLEMENTED"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/cleanup', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '清理功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '清理系统日志失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /system-logs/system:
 *   get:
 *     summary: 获取系统日志
 *     description: 获取最近100条系统日志记录
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
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
 *                         $ref: '#/components/schemas/SystemLog'
 *                     total:
 *                       type: integer
 *                       description: 记录总数
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/system', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var systemLogs, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query('SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 100', { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                systemLogs = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        items: systemLogs,
                        total: systemLogs.length,
                        page: 1,
                        pageSize: systemLogs.length,
                        totalPages: 1
                    })];
            case 2:
                error_5 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_5, '获取系统日志失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system-logs/operations:
 *   get:
 *     summary: 获取操作日志
 *     description: 获取最近100条操作日志记录
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
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
 *                         $ref: '#/components/schemas/OperationLog'
 *                     total:
 *                       type: integer
 *                       description: 记录总数
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/operations', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var operationLogs, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query('SELECT * FROM operation_logs ORDER BY created_at DESC LIMIT 100', { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                operationLogs = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        items: operationLogs,
                        total: operationLogs.length,
                        page: 1,
                        pageSize: operationLogs.length,
                        totalPages: 1
                    })];
            case 2:
                error_6 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_6, '获取操作日志失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system-logs/system/cleanup:
 *   delete:
 *     summary: 清理系统日志
 *     description: 清理历史系统日志记录（暂未实现）
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 功能暂未实现
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
 *                   example: "清理功能暂未实现"
 *                 error:
 *                   type: string
 *                   example: "NOT_IMPLEMENTED"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router["delete"]('/system/cleanup', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '清理功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '清理系统日志失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /system-logs/statistics:
 *   get:
 *     summary: 获取日志统计
 *     description: 获取系统日志和操作日志的统计信息
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LogStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/statistics', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var systemLogCount, operationLogCount, error_7;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, , 4]);
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as count FROM system_logs', { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                systemLogCount = _e.sent();
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as count FROM operation_logs', { type: sequelize_1.QueryTypes.SELECT })];
            case 2:
                operationLogCount = _e.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        system_logs: ((_a = systemLogCount[0]) === null || _a === void 0 ? void 0 : _a.count) || 0,
                        operation_logs: ((_b = operationLogCount[0]) === null || _b === void 0 ? void 0 : _b.count) || 0,
                        total: (((_c = systemLogCount[0]) === null || _c === void 0 ? void 0 : _c.count) || 0) + (((_d = operationLogCount[0]) === null || _d === void 0 ? void 0 : _d.count) || 0)
                    })];
            case 3:
                error_7 = _e.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_7, '获取日志统计失败')];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
