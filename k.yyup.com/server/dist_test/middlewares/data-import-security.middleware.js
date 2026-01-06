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
exports.DataImportSecurityMiddleware = void 0;
var logger_1 = require("../utils/logger");
var DataImportSecurityMiddleware = /** @class */ (function () {
    function DataImportSecurityMiddleware() {
    }
    /**
     * 🔒 导入前安全检查
     */
    DataImportSecurityMiddleware.preImportSecurityCheck = function (req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var _c, importType, data, userId, userRole, riskLevel, hasPermission, rateLimitCheck, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        _c = req.body, importType = _c.importType, data = _c.data;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                        if (!userId || !userRole) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户身份验证失败',
                                    code: 'AUTHENTICATION_FAILED'
                                })];
                        }
                        riskLevel = DataImportSecurityMiddleware.assessRiskLevel(data, importType);
                        return [4 /*yield*/, DataImportSecurityMiddleware.checkImportPermission(userId, userRole, importType, riskLevel)];
                    case 1:
                        hasPermission = _d.sent();
                        if (!hasPermission.allowed) {
                            return [2 /*return*/, res.status(403).json({
                                    success: false,
                                    message: hasPermission.reason,
                                    code: 'IMPORT_PERMISSION_DENIED'
                                })];
                        }
                        return [4 /*yield*/, DataImportSecurityMiddleware.checkRateLimit(userId, importType)];
                    case 2:
                        rateLimitCheck = _d.sent();
                        if (!rateLimitCheck.allowed) {
                            return [2 /*return*/, res.status(429).json({
                                    success: false,
                                    message: rateLimitCheck.reason,
                                    code: 'RATE_LIMIT_EXCEEDED'
                                })];
                        }
                        // 4. 记录安全上下文
                        req.importSecurity = {
                            userId: userId,
                            userRole: userRole,
                            importType: importType,
                            recordCount: Array.isArray(data) ? data.length : 1,
                            riskLevel: riskLevel
                        };
                        logger_1.logger.info('数据导入安全检查通过', {
                            userId: userId,
                            importType: importType,
                            riskLevel: riskLevel,
                            recordCount: req.importSecurity.recordCount
                        });
                        next();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _d.sent();
                        logger_1.logger.error('数据导入安全检查失败', { error: error_1 });
                        res.status(500).json({
                            success: false,
                            message: '安全检查失败',
                            code: 'SECURITY_CHECK_FAILED'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🔒 评估导入风险等级
     */
    DataImportSecurityMiddleware.assessRiskLevel = function (data, importType) {
        var recordCount = Array.isArray(data) ? data.length : 1;
        // 基于记录数量评估
        if (recordCount > 1000)
            return 'CRITICAL';
        if (recordCount > 100)
            return 'HIGH';
        if (recordCount > 10)
            return 'MEDIUM';
        // 基于数据类型评估
        if (importType === 'teacher')
            return 'HIGH'; // 教师数据敏感度高
        if (importType === 'parent')
            return 'MEDIUM'; // 家长数据包含个人信息
        return 'LOW';
    };
    /**
     * 🔒 检查导入权限
     */
    DataImportSecurityMiddleware.checkImportPermission = function (userId, userRole, importType, riskLevel) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 超级管理员拥有所有权限
                if (userRole === 'super_admin') {
                    return [2 /*return*/, { allowed: true }];
                }
                // 高风险操作需要管理员权限
                if (riskLevel === 'CRITICAL' && userRole !== 'admin') {
                    return [2 /*return*/, {
                            allowed: false,
                            reason: '批量导入超过1000条记录需要管理员权限'
                        }];
                }
                // 教师数据导入需要特殊权限
                if (importType === 'teacher' && !['admin', 'hr_manager'].includes(userRole)) {
                    return [2 /*return*/, {
                            allowed: false,
                            reason: '教师数据导入需要管理员或人事经理权限'
                        }];
                }
                // TODO: 实现更细粒度的权限检查
                // 例如：检查用户是否有权限操作特定班级、部门等
                return [2 /*return*/, { allowed: true }];
            });
        });
    };
    /**
     * 🔒 检查频率限制
     */
    DataImportSecurityMiddleware.checkRateLimit = function (userId, importType) {
        return __awaiter(this, void 0, void 0, function () {
            var hourlyLimit, dailyLimit, hourlyCount, dailyCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hourlyLimit = 5;
                        dailyLimit = 20;
                        return [4 /*yield*/, this.getImportCount(userId, importType, 'hour')];
                    case 1:
                        hourlyCount = _a.sent();
                        return [4 /*yield*/, this.getImportCount(userId, importType, 'day')];
                    case 2:
                        dailyCount = _a.sent();
                        if (hourlyCount >= hourlyLimit) {
                            return [2 /*return*/, {
                                    allowed: false,
                                    reason: "\u6BCF\u5C0F\u65F6\u6700\u591A\u5BFC\u5165".concat(hourlyLimit, "\u6B21\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5")
                                }];
                        }
                        if (dailyCount >= dailyLimit) {
                            return [2 /*return*/, {
                                    allowed: false,
                                    reason: "\u6BCF\u5929\u6700\u591A\u5BFC\u5165".concat(dailyLimit, "\u6B21\uFF0C\u5DF2\u8FBE\u5230\u9650\u5236")
                                }];
                        }
                        return [2 /*return*/, { allowed: true }];
                }
            });
        });
    };
    /**
     * 获取导入次数统计
     */
    DataImportSecurityMiddleware.getImportCount = function (userId, importType, period) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: 实现实际的统计查询
                logger_1.logger.info('检查导入频率', { userId: userId, importType: importType, period: period });
                return [2 /*return*/, 0]; // 模拟返回
            });
        });
    };
    /**
     * 🔒 导入后安全审计
     */
    DataImportSecurityMiddleware.postImportSecurityAudit = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var security, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        security = req.importSecurity;
                        result = res.locals.importResult;
                        if (!(security && result)) return [3 /*break*/, 3];
                        // 记录详细的审计日志
                        return [4 /*yield*/, DataImportSecurityMiddleware.logSecurityAudit({
                                userId: security.userId,
                                importType: security.importType,
                                riskLevel: security.riskLevel,
                                recordCount: security.recordCount,
                                successCount: result.successCount,
                                failureCount: result.failureCount,
                                timestamp: new Date(),
                                ipAddress: req.ip,
                                userAgent: req.get('User-Agent')
                            })];
                    case 1:
                        // 记录详细的审计日志
                        _a.sent();
                        if (!(security.riskLevel === 'CRITICAL' || security.riskLevel === 'HIGH')) return [3 /*break*/, 3];
                        return [4 /*yield*/, DataImportSecurityMiddleware.notifyHighRiskImport(security, result)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        next();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        logger_1.logger.error('导入后安全审计失败', { error: error_2 });
                        // 不阻断响应，但记录错误
                        next();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录安全审计日志
     */
    DataImportSecurityMiddleware.logSecurityAudit = function (auditData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger_1.logger.info('数据导入安全审计', auditData);
                return [2 /*return*/];
            });
        });
    };
    /**
     * 高风险导入通知
     */
    DataImportSecurityMiddleware.notifyHighRiskImport = function (security, result) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger_1.logger.warn('高风险数据导入操作', {
                    userId: security.userId,
                    importType: security.importType,
                    riskLevel: security.riskLevel,
                    recordCount: security.recordCount,
                    result: result
                });
                return [2 /*return*/];
            });
        });
    };
    return DataImportSecurityMiddleware;
}());
exports.DataImportSecurityMiddleware = DataImportSecurityMiddleware;
exports["default"] = DataImportSecurityMiddleware;
