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
exports.auditLogPresets = exports.auditLog = void 0;
var operation_log_model_1 = require("../models/operation-log.model");
var logger_1 = require("../utils/logger");
/**
 * 从HTTP方法映射到操作类型
 */
var mapMethodToOperationType = function (method) {
    switch (method.toUpperCase()) {
        case 'POST':
            return operation_log_model_1.OperationType.CREATE;
        case 'GET':
            return operation_log_model_1.OperationType.READ;
        case 'PUT':
        case 'PATCH':
            return operation_log_model_1.OperationType.UPDATE;
        case 'DELETE':
            return operation_log_model_1.OperationType.DELETE;
        default:
            return operation_log_model_1.OperationType.OTHER;
    }
};
/**
 * 从路径提取资源ID
 */
var extractResourceId = function (path) {
    var matches = path.match(/\/(\d+)(?:\/|$)/);
    return matches ? matches[1] : null;
};
/**
 * 生成操作描述
 */
var generateDescription = function (method, path, module) {
    var _a;
    var operationType = mapMethodToOperationType(method);
    var resourceId = extractResourceId(path);
    var actionMap = (_a = {},
        _a[operation_log_model_1.OperationType.CREATE] = '创建',
        _a[operation_log_model_1.OperationType.READ] = '查询',
        _a[operation_log_model_1.OperationType.UPDATE] = '更新',
        _a[operation_log_model_1.OperationType.DELETE] = '删除',
        _a[operation_log_model_1.OperationType.OTHER] = '操作',
        _a);
    var action = actionMap[operationType];
    var resource = resourceId ? "ID\u4E3A".concat(resourceId, "\u7684") : '';
    return "".concat(action).concat(resource).concat(module);
};
/**
 * 审计日志中间件工厂函数
 */
var auditLog = function (options) {
    return function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var startTime, originalSend, originalJson, responseData, operationResult, resultMessage;
        return __generator(this, function (_a) {
            if (options.skipLogging) {
                return [2 /*return*/, next()];
            }
            startTime = Date.now();
            originalSend = res.send;
            originalJson = res.json;
            responseData = null;
            operationResult = operation_log_model_1.OperationResult.SUCCESS;
            resultMessage = null;
            // 拦截响应数据
            res.send = function (data) {
                responseData = data;
                if (res.statusCode >= 400) {
                    operationResult = operation_log_model_1.OperationResult.FAILED;
                    try {
                        var parsed = JSON.parse(data);
                        resultMessage = parsed.message || '操作失败';
                    }
                    catch (_a) {
                        resultMessage = '操作失败';
                    }
                }
                return originalSend.call(this, data);
            };
            res.json = function (data) {
                responseData = data;
                if (res.statusCode >= 400) {
                    operationResult = operation_log_model_1.OperationResult.FAILED;
                    resultMessage = data.message || '操作失败';
                }
                return originalJson.call(this, data);
            };
            // 继续处理请求
            next();
            // 请求完成后记录日志
            res.on('finish', function () { return __awaiter(void 0, void 0, void 0, function () {
                var executionTime_1, userId_1, operationType_1, resourceId_1, action_1, description_1;
                var _a;
                return __generator(this, function (_b) {
                    try {
                        executionTime_1 = Date.now() - startTime;
                        userId_1 = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null;
                        operationType_1 = mapMethodToOperationType(req.method);
                        resourceId_1 = extractResourceId(req.path);
                        action_1 = options.action || req.method.toLowerCase();
                        description_1 = generateDescription(req.method, req.path, options.module);
                        // 异步记录审计日志
                        setImmediate(function () { return __awaiter(void 0, void 0, void 0, function () {
                            var error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, operation_log_model_1.OperationLog.create({
                                                userId: userId_1,
                                                module: options.module,
                                                action: action_1,
                                                operationType: operationType_1,
                                                resourceType: options.resourceType || options.module,
                                                resourceId: resourceId_1,
                                                description: description_1,
                                                requestMethod: req.method,
                                                requestUrl: req.originalUrl,
                                                requestParams: JSON.stringify({
                                                    query: req.query,
                                                    body: req.body,
                                                    params: req.params
                                                }),
                                                requestIp: req.ip || req.connection.remoteAddress || null,
                                                userAgent: req.get('User-Agent') || null,
                                                deviceInfo: req.get('User-Agent') || null,
                                                operationResult: operationResult,
                                                resultMessage: resultMessage,
                                                executionTime: executionTime_1
                                            })];
                                    case 1:
                                        _a.sent();
                                        logger_1.logger.info('审计日志记录成功', {
                                            userId: userId_1,
                                            module: options.module,
                                            action: action_1,
                                            operationType: operationType_1,
                                            executionTime: executionTime_1
                                        });
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_1 = _a.sent();
                                        logger_1.logger.error('审计日志记录失败', {
                                            error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                                            userId: userId_1,
                                            module: options.module,
                                            action: action_1
                                        });
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                    }
                    catch (error) {
                        logger_1.logger.error('审计日志中间件错误', {
                            error: error instanceof Error ? error.message : 'Unknown error'
                        });
                    }
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); };
};
exports.auditLog = auditLog;
/**
 * 常用模块的审计日志中间件
 */
exports.auditLogPresets = {
    student: (0, exports.auditLog)({ module: '学生管理', resourceType: 'student' }),
    parent: (0, exports.auditLog)({ module: '家长管理', resourceType: 'parent' }),
    teacher: (0, exports.auditLog)({ module: '教师管理', resourceType: 'teacher' }),
    user: (0, exports.auditLog)({ module: '用户管理', resourceType: 'user' }),
    role: (0, exports.auditLog)({ module: '角色管理', resourceType: 'role' }),
    permission: (0, exports.auditLog)({ module: '权限管理', resourceType: 'permission' }),
    enrollment: (0, exports.auditLog)({ module: '招生管理', resourceType: 'enrollment' }),
    activity: (0, exports.auditLog)({ module: '活动管理', resourceType: 'activity' }),
    "class": (0, exports.auditLog)({ module: '班级管理', resourceType: 'class' }),
    system: (0, exports.auditLog)({ module: '系统管理', resourceType: 'system' }),
    dataImport: (0, exports.auditLog)({ module: '数据导入', resourceType: 'data_import' })
};
