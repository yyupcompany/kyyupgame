"use strict";
/**
 * 安全服务类
 * 提供系统安全监控、威胁检测、漏洞扫描等功能
 */
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
exports.SecurityService = void 0;
var sequelize_1 = require("sequelize");
var SecurityThreat_1 = require("../models/SecurityThreat");
var SecurityVulnerability_1 = require("../models/SecurityVulnerability");
var SecurityConfig_1 = require("../models/SecurityConfig");
var SecurityScanLog_1 = require("../models/SecurityScanLog");
var system_monitor_service_1 = require("./system-monitor.service");
var SecurityService = /** @class */ (function () {
    function SecurityService() {
        this.systemMonitor = system_monitor_service_1.SystemMonitorService.getInstance();
    }
    /**
     * 获取安全概览
     */
    SecurityService.prototype.getSecurityOverview = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var activeThreats, vulnerabilities, securityScore, threatLevel, riskLevel, lastScan, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, SecurityThreat_1.SecurityThreat.count({
                                where: { status: 'active' }
                            })];
                    case 1:
                        activeThreats = _c.sent();
                        return [4 /*yield*/, SecurityVulnerability_1.SecurityVulnerability.count({
                                where: { status: (_b = {}, _b[sequelize_1.Op["in"]] = ['open', 'confirmed'], _b) }
                            })];
                    case 2:
                        vulnerabilities = _c.sent();
                        securityScore = this.calculateSecurityScore(activeThreats, vulnerabilities);
                        threatLevel = this.determineThreatLevel(activeThreats, vulnerabilities);
                        riskLevel = this.calculateRiskLevel(securityScore);
                        return [4 /*yield*/, SecurityScanLog_1.SecurityScanLog.findOne({
                                order: [['createdAt', 'DESC']]
                            })];
                    case 3:
                        lastScan = _c.sent();
                        return [2 /*return*/, {
                                securityScore: securityScore,
                                threatLevel: threatLevel,
                                activeThreats: activeThreats,
                                vulnerabilities: vulnerabilities,
                                riskLevel: riskLevel,
                                lastScanTime: (_a = lastScan === null || lastScan === void 0 ? void 0 : lastScan.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                                connectionStatus: 'connected'
                            }];
                    case 4:
                        error_1 = _c.sent();
                        console.error('获取安全概览失败:', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取威胁列表
     */
    SecurityService.prototype.getThreats = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var page, pageSize, severity, _a, status_1, offset, whereClause, _b, threats, total, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        page = query.page, pageSize = query.pageSize, severity = query.severity, _a = query.status, status_1 = _a === void 0 ? 'active' : _a;
                        offset = (page - 1) * pageSize;
                        whereClause = { status: status_1 };
                        if (severity) {
                            whereClause.severity = severity;
                        }
                        return [4 /*yield*/, SecurityThreat_1.SecurityThreat.findAndCountAll({
                                where: whereClause,
                                order: [['createdAt', 'DESC']],
                                limit: pageSize,
                                offset: offset,
                                attributes: [
                                    'id', 'threatType', 'severity', 'status', 'sourceIp',
                                    'targetResource', 'description', 'detectionMethod', 'riskScore',
                                    'handledBy', 'handledAt', 'notes', 'metadata', 'createdAt', 'updatedAt'
                                ]
                            })];
                    case 1:
                        _b = _c.sent(), threats = _b.rows, total = _b.count;
                        return [2 /*return*/, {
                                threats: threats,
                                total: total,
                                page: page,
                                pageSize: pageSize,
                                totalPages: Math.ceil(total / pageSize)
                            }];
                    case 2:
                        error_2 = _c.sent();
                        console.error('获取威胁列表失败:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理威胁
     */
    SecurityService.prototype.handleThreat = function (threatId, action, notes, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var threat, newStatus, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, SecurityThreat_1.SecurityThreat.findByPk(threatId)];
                    case 1:
                        threat = _a.sent();
                        if (!threat) {
                            throw new Error('威胁不存在');
                        }
                        newStatus = 'active';
                        switch (action) {
                            case 'resolve':
                                newStatus = 'resolved';
                                break;
                            case 'ignore':
                                newStatus = 'ignored';
                                break;
                            case 'block':
                                newStatus = 'blocked';
                                // 这里可以添加实际的阻止逻辑，比如添加到防火墙黑名单
                                break;
                            default:
                                throw new Error('无效的处理动作');
                        }
                        return [4 /*yield*/, threat.update({
                                status: newStatus,
                                handledBy: userId,
                                handledAt: new Date(),
                                notes: notes
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { success: true, message: '威胁处理成功' }];
                    case 3:
                        error_3 = _a.sent();
                        console.error('处理威胁失败:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行安全扫描
     */
    SecurityService.prototype.performSecurityScan = function (scanType, targets, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var scanLog, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, SecurityScanLog_1.SecurityScanLog.create({
                                scanType: scanType,
                                targets: JSON.stringify(targets),
                                status: 'running',
                                startedBy: userId,
                                startedAt: new Date()
                            })];
                    case 1:
                        scanLog = _a.sent();
                        // 异步执行扫描
                        this.executeScan(scanLog.id, scanType, targets)["catch"](function (error) {
                            console.error('扫描执行失败:', error);
                        });
                        return [2 /*return*/, {
                                scanId: scanLog.id,
                                status: 'started',
                                message: '安全扫描已启动'
                            }];
                    case 2:
                        error_4 = _a.sent();
                        console.error('启动安全扫描失败:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取漏洞列表
     */
    SecurityService.prototype.getVulnerabilities = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var page, pageSize, severity, status_2, offset, whereClause, _a, vulnerabilities, total, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        page = query.page, pageSize = query.pageSize, severity = query.severity, status_2 = query.status;
                        offset = (page - 1) * pageSize;
                        whereClause = {};
                        if (severity) {
                            whereClause.severity = severity;
                        }
                        if (status_2) {
                            whereClause.status = status_2;
                        }
                        return [4 /*yield*/, SecurityVulnerability_1.SecurityVulnerability.findAndCountAll({
                                where: whereClause,
                                order: [['createdAt', 'DESC']],
                                limit: pageSize,
                                offset: offset
                            })];
                    case 1:
                        _a = _b.sent(), vulnerabilities = _a.rows, total = _a.count;
                        return [2 /*return*/, {
                                vulnerabilities: vulnerabilities,
                                total: total,
                                page: page,
                                pageSize: pageSize,
                                totalPages: Math.ceil(total / pageSize)
                            }];
                    case 2:
                        error_5 = _b.sent();
                        console.error('获取漏洞列表失败:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取安全建议
     */
    SecurityService.prototype.getSecurityRecommendations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var overview, recommendations, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getSecurityOverview()];
                    case 1:
                        overview = _a.sent();
                        recommendations = [];
                        if (overview.activeThreats > 0) {
                            recommendations.push({
                                id: 'threat-handling',
                                title: '处理活跃威胁',
                                description: "\u7CFB\u7EDF\u68C0\u6D4B\u5230 ".concat(overview.activeThreats, " \u4E2A\u6D3B\u8DC3\u5A01\u80C1\uFF0C\u5EFA\u8BAE\u7ACB\u5373\u5904\u7406"),
                                priority: 'critical',
                                expectedImprovement: '消除当前安全威胁，提升系统安全性',
                                effortLevel: 2
                            });
                        }
                        if (overview.vulnerabilities > 5) {
                            recommendations.push({
                                id: 'vulnerability-patching',
                                title: '修复系统漏洞',
                                description: "\u53D1\u73B0 ".concat(overview.vulnerabilities, " \u4E2A\u5B89\u5168\u6F0F\u6D1E\uFF0C\u5EFA\u8BAE\u53CA\u65F6\u4FEE\u590D"),
                                priority: 'high',
                                expectedImprovement: '修复已知漏洞，减少攻击面',
                                effortLevel: 3
                            });
                        }
                        if (overview.securityScore < 80) {
                            recommendations.push({
                                id: 'security-hardening',
                                title: '加强安全配置',
                                description: '当前安全评分较低，建议加强系统安全配置',
                                priority: 'medium',
                                expectedImprovement: '提升整体安全防护能力',
                                effortLevel: 4
                            });
                        }
                        // 添加常规安全建议
                        recommendations.push({
                            id: 'mfa-enable',
                            title: '启用多因素认证',
                            description: '为管理员账户启用多因素认证，提高账户安全性',
                            priority: 'high',
                            expectedImprovement: '账户安全性提升80%，降低密码攻击风险',
                            effortLevel: 3
                        }, {
                            id: 'password-policy',
                            title: '加强密码策略',
                            description: '实施更严格的密码复杂度要求和定期更换策略',
                            priority: 'medium',
                            expectedImprovement: '密码强度提升60%，降低暴力破解风险',
                            effortLevel: 2
                        });
                        return [2 /*return*/, recommendations];
                    case 2:
                        error_6 = _a.sent();
                        console.error('获取安全建议失败:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成AI安全建议
     */
    SecurityService.prototype.generateAIRecommendations = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getSecurityRecommendations()];
                    case 1: 
                    // 这里可以集成AI服务来生成个性化建议
                    // 目前返回基础建议
                    return [2 /*return*/, _a.sent()];
                    case 2:
                        error_7 = _a.sent();
                        console.error('生成AI安全建议失败:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取安全配置
     */
    SecurityService.prototype.getSecurityConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configs, configMap_1, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, SecurityConfig_1.SecurityConfig.findAll()];
                    case 1:
                        configs = _a.sent();
                        configMap_1 = {};
                        configs.forEach(function (config) {
                            configMap_1[config.configKey] = {
                                value: config.configValue,
                                description: config.description,
                                lastUpdated: config.updatedAt
                            };
                        });
                        return [2 /*return*/, configMap_1];
                    case 2:
                        error_8 = _a.sent();
                        console.error('获取安全配置失败:', error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新安全配置
     */
    SecurityService.prototype.updateSecurityConfig = function (configData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var updates, _i, _a, _b, key, value, config, error_9;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        updates = [];
                        _i = 0, _a = Object.entries(configData);
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], key = _b[0], value = _b[1];
                        return [4 /*yield*/, SecurityConfig_1.SecurityConfig.findOrCreate({
                                where: { configKey: key },
                                defaults: {
                                    configKey: key,
                                    configValue: JSON.stringify(value),
                                    updatedBy: userId
                                }
                            })];
                    case 2:
                        config = (_c.sent())[0];
                        if (!config) return [3 /*break*/, 4];
                        return [4 /*yield*/, config.update({
                                configValue: JSON.stringify(value),
                                updatedBy: userId
                            })];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        updates.push({ key: key, value: value });
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, { success: true, updates: updates }];
                    case 7:
                        error_9 = _c.sent();
                        console.error('更新安全配置失败:', error_9);
                        throw error_9;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 计算安全评分
     */
    SecurityService.prototype.calculateSecurityScore = function (threats, vulnerabilities) {
        var score = 100;
        score -= threats * 10; // 每个威胁扣10分
        score -= vulnerabilities * 2; // 每个漏洞扣2分
        return Math.max(0, Math.min(100, score));
    };
    /**
     * 确定威胁等级
     */
    SecurityService.prototype.determineThreatLevel = function (threats, vulnerabilities) {
        if (threats >= 5 || vulnerabilities >= 20)
            return 'critical';
        if (threats >= 3 || vulnerabilities >= 10)
            return 'high';
        if (threats >= 1 || vulnerabilities >= 5)
            return 'medium';
        return 'low';
    };
    /**
     * 计算风险等级
     */
    SecurityService.prototype.calculateRiskLevel = function (securityScore) {
        return Math.max(0, 100 - securityScore);
    };
    /**
     * 执行扫描（异步）
     */
    SecurityService.prototype.executeScan = function (scanId, scanType, targets) {
        return __awaiter(this, void 0, void 0, function () {
            var foundThreats, foundVulnerabilities, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 5]);
                        // 模拟扫描过程
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                    case 1:
                        // 模拟扫描过程
                        _a.sent();
                        foundThreats = Math.floor(Math.random() * 3);
                        foundVulnerabilities = Math.floor(Math.random() * 5);
                        // 更新扫描日志
                        return [4 /*yield*/, SecurityScanLog_1.SecurityScanLog.update({
                                status: 'completed',
                                completedAt: new Date(),
                                threatsFound: foundThreats,
                                vulnerabilitiesFound: foundVulnerabilities,
                                results: JSON.stringify({
                                    summary: "\u626B\u63CF\u5B8C\u6210\uFF0C\u53D1\u73B0 ".concat(foundThreats, " \u4E2A\u5A01\u80C1\uFF0C").concat(foundVulnerabilities, " \u4E2A\u6F0F\u6D1E"),
                                    details: {
                                        scanType: scanType,
                                        targets: targets,
                                        duration: '5秒'
                                    }
                                })
                            }, {
                                where: { id: scanId }
                            })];
                    case 2:
                        // 更新扫描日志
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        error_10 = _a.sent();
                        console.error('扫描执行失败:', error_10);
                        return [4 /*yield*/, SecurityScanLog_1.SecurityScanLog.update({
                                status: 'failed',
                                completedAt: new Date(),
                                results: JSON.stringify({ error: error_10.message || '未知错误' })
                            }, {
                                where: { id: scanId }
                            })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return SecurityService;
}());
exports.SecurityService = SecurityService;
