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
exports.importPermissionPresets = exports.smartImportPermissionCheck = exports.requireAnyImportPermission = exports.requireImportPermission = exports.checkImportPermission = exports.detectImportIntent = exports.DataImportPermissionMiddleware = void 0;
var data_import_service_1 = require("../services/data-import.service");
var logger_1 = require("../utils/logger");
var apiError_1 = require("../utils/apiError");
var DataImportPermissionMiddleware = /** @class */ (function () {
    function DataImportPermissionMiddleware() {
        var _this = this;
        /**
         * 检测数据导入意图的中间件
         */
        this.detectImportIntent = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, query, message, content, userQuery, importType;
            var _b;
            return __generator(this, function (_c) {
                try {
                    _a = req.body, query = _a.query, message = _a.message, content = _a.content;
                    userQuery = query || message || content || '';
                    if (!userQuery) {
                        return [2 /*return*/, next()];
                    }
                    importType = this.dataImportService.detectImportIntent(userQuery);
                    if (importType) {
                        req.importType = importType;
                        logger_1.logger.info('检测到数据导入意图', {
                            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                            importType: importType,
                            query: userQuery
                        });
                    }
                    next();
                }
                catch (error) {
                    logger_1.logger.error('导入意图检测失败', { error: error });
                    next(error);
                }
                return [2 /*return*/];
            });
        }); };
        /**
         * 权限预检中间件
         */
        this.checkImportPermission = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId, hasPermission, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        // 如果没有检测到导入意图，直接通过
                        if (!req.importType) {
                            return [2 /*return*/, next()];
                        }
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        return [4 /*yield*/, this.dataImportService.checkImportPermission(userId, req.importType)];
                    case 1:
                        hasPermission = _b.sent();
                        if (!hasPermission) {
                            logger_1.logger.warn('用户无数据导入权限', {
                                userId: userId,
                                importType: req.importType
                            });
                            res.status(403).json({
                                success: false,
                                message: "\u60A8\u6CA1\u6709".concat(req.importType, "\u6570\u636E\u5BFC\u5165\u6743\u9650\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458"),
                                code: 'INSUFFICIENT_PERMISSION',
                                data: {
                                    importType: req.importType,
                                    requiredPermission: this.getRequiredPermission(req.importType)
                                }
                            });
                            return [2 /*return*/];
                        }
                        req.hasImportPermission = true;
                        logger_1.logger.info('数据导入权限验证通过', {
                            userId: userId,
                            importType: req.importType
                        });
                        next();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        logger_1.logger.error('导入权限检查失败', { error: error_1 });
                        next(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 数据导入专用权限检查中间件
         * 用于数据导入相关的API路由
         */
        this.requireImportPermission = function (importType) {
            return function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                var userId, hasPermission, error_2;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                            if (!userId) {
                                throw apiError_1.ApiError.unauthorized('用户未登录');
                            }
                            return [4 /*yield*/, this.dataImportService.checkImportPermission(userId, importType)];
                        case 1:
                            hasPermission = _b.sent();
                            if (!hasPermission) {
                                throw apiError_1.ApiError.forbidden("\u9700\u8981".concat(importType, "\u6570\u636E\u5BFC\u5165\u6743\u9650"), 'INSUFFICIENT_IMPORT_PERMISSION');
                            }
                            next();
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _b.sent();
                            next(error_2);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); };
        };
        /**
         * 批量权限检查中间件
         * 检查用户是否有任意一种数据导入权限
         */
        this.requireAnyImportPermission = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId_1, importTypes, permissions_1, hasAnyPermission, error_3;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId_1 = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId_1) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        importTypes = ['student', 'parent', 'teacher'];
                        return [4 /*yield*/, Promise.all(importTypes.map(function (type) {
                                return _this.dataImportService.checkImportPermission(userId_1, type);
                            }))];
                    case 1:
                        permissions_1 = _b.sent();
                        hasAnyPermission = permissions_1.some(function (permission) { return permission; });
                        if (!hasAnyPermission) {
                            throw apiError_1.ApiError.forbidden('需要数据导入权限', 'NO_IMPORT_PERMISSION');
                        }
                        // 将用户拥有的导入权限添加到请求对象
                        req.availableImportTypes = importTypes.filter(function (_, index) { return permissions_1[index]; });
                        next();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        next(error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.dataImportService = new data_import_service_1.DataImportService();
    }
    /**
     * 获取所需权限名称
     */
    DataImportPermissionMiddleware.prototype.getRequiredPermission = function (importType) {
        var permissionMap = {
            student: 'STUDENT_CREATE',
            parent: 'PARENT_MANAGE',
            teacher: 'TEACHER_MANAGE'
        };
        return permissionMap[importType] || 'UNKNOWN';
    };
    return DataImportPermissionMiddleware;
}());
exports.DataImportPermissionMiddleware = DataImportPermissionMiddleware;
// 创建中间件实例
var dataImportPermissionMiddleware = new DataImportPermissionMiddleware();
// 导出中间件方法
exports.detectImportIntent = dataImportPermissionMiddleware.detectImportIntent, exports.checkImportPermission = dataImportPermissionMiddleware.checkImportPermission, exports.requireImportPermission = dataImportPermissionMiddleware.requireImportPermission, exports.requireAnyImportPermission = dataImportPermissionMiddleware.requireAnyImportPermission;
// 导出完整的中间件类
exports["default"] = DataImportPermissionMiddleware;
/**
 * 组合中间件：检测意图 + 权限验证
 * 用于AI助手等需要智能检测的场景
 */
exports.smartImportPermissionCheck = [
    exports.detectImportIntent,
    exports.checkImportPermission
];
/**
 * 数据导入权限预设
 */
exports.importPermissionPresets = {
    student: (0, exports.requireImportPermission)('student'),
    parent: (0, exports.requireImportPermission)('parent'),
    teacher: (0, exports.requireImportPermission)('teacher'),
    any: exports.requireAnyImportPermission
};
