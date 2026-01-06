"use strict";
/**
 * 安全监控路由
 * 提供系统安全监控、威胁检测、安全配置等API
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var permission_middleware_1 = require("../middlewares/permission.middleware");
var apiResponse_1 = require("../utils/apiResponse");
var security_service_1 = require("../services/security.service");
var system_monitor_service_1 = require("../services/system-monitor.service");
var router = express_1["default"].Router();
var securityService = new security_service_1.SecurityService();
var systemMonitor = system_monitor_service_1.SystemMonitorService.getInstance();
/**
 * @swagger
 * /api/security/overview:
 *   get:
 *     tags: [安全监控]
 *     summary: 获取安全概览
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取安全概览
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 securityScore:
 *                   type: number
 *                   description: 安全评分 (0-100)
 *                 threatLevel:
 *                   type: string
 *                   enum: [low, medium, high, critical]
 *                 activeThreats:
 *                   type: number
 *                   description: 活跃威胁数量
 *                 vulnerabilities:
 *                   type: number
 *                   description: 漏洞数量
 *                 riskLevel:
 *                   type: number
 *                   description: 风险等级百分比
 */
router.get('/overview', auth_middleware_1.verifyToken, (0, permission_middleware_1.permissionMiddleware)(['SECURITY_VIEW']), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var overview, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, securityService.getSecurityOverview()];
            case 1:
                overview = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, overview, '获取安全概览成功')];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_1, '获取安全概览失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/security/threats:
 *   get:
 *     tags: [安全监控]
 *     summary: 获取威胁列表
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
 *           default: 20
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *     responses:
 *       200:
 *         description: 成功获取威胁列表
 */
router.get('/threats', auth_middleware_1.verifyToken, (0, permission_middleware_1.permissionMiddleware)(['SECURITY_VIEW']), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, pageSize, severity, threats, error_2;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 20 : _c, severity = _a.severity;
                return [4 /*yield*/, securityService.getThreats({
                        page: Number(page),
                        pageSize: Number(pageSize),
                        severity: severity
                    })];
            case 1:
                threats = _d.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, threats, '获取威胁列表成功')];
            case 2:
                error_2 = _d.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '获取威胁列表失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/security/threats/{id}/handle:
 *   post:
 *     tags: [安全监控]
 *     summary: 处理威胁
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
 *               action:
 *                 type: string
 *                 enum: [resolve, ignore, block]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: 威胁处理成功
 */
router.post('/threats/:id/handle', auth_middleware_1.verifyToken, (0, permission_middleware_1.permissionMiddleware)(['SECURITY_MANAGE']), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, action, notes, userId, result, error_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, action = _a.action, notes = _a.notes;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                return [4 /*yield*/, securityService.handleThreat(id, action, notes, userId)];
            case 1:
                result = _c.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, result, '威胁处理成功')];
            case 2:
                error_3 = _c.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_3, '威胁处理失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/security/scan:
 *   post:
 *     tags: [安全监控]
 *     summary: 执行安全扫描
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scanType:
 *                 type: string
 *                 enum: [quick, full, custom]
 *                 default: quick
 *               targets:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 安全扫描启动成功
 */
router.post('/scan', auth_middleware_1.verifyToken, (0, permission_middleware_1.permissionMiddleware)(['SECURITY_SCAN']), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, scanType, _c, targets, userId, scanResult, error_4;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 2, , 3]);
                _a = req.body, _b = _a.scanType, scanType = _b === void 0 ? 'quick' : _b, _c = _a.targets, targets = _c === void 0 ? [] : _c;
                userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.id;
                return [4 /*yield*/, securityService.performSecurityScan(scanType, targets, userId)];
            case 1:
                scanResult = _e.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, scanResult, '安全扫描启动成功')];
            case 2:
                error_4 = _e.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_4, '安全扫描失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/security/vulnerabilities:
 *   get:
 *     tags: [安全监控]
 *     summary: 获取漏洞列表
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
 *           default: 20
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, fixed, ignored]
 *     responses:
 *       200:
 *         description: 成功获取漏洞列表
 */
router.get('/vulnerabilities', auth_middleware_1.verifyToken, (0, permission_middleware_1.permissionMiddleware)(['SECURITY_VIEW']), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, pageSize, severity, status_1, vulnerabilities, error_5;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 20 : _c, severity = _a.severity, status_1 = _a.status;
                return [4 /*yield*/, securityService.getVulnerabilities({
                        page: Number(page),
                        pageSize: Number(pageSize),
                        severity: severity,
                        status: status_1
                    })];
            case 1:
                vulnerabilities = _d.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, vulnerabilities, '获取漏洞列表成功')];
            case 2:
                error_5 = _d.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_5, '获取漏洞列表失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/security/recommendations:
 *   get:
 *     tags: [安全监控]
 *     summary: 获取安全建议
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取安全建议
 */
router.get('/recommendations', auth_middleware_1.verifyToken, (0, permission_middleware_1.permissionMiddleware)(['SECURITY_VIEW']), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var recommendations, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, securityService.getSecurityRecommendations()];
            case 1:
                recommendations = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, recommendations, '获取安全建议成功')];
            case 2:
                error_6 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_6, '获取安全建议失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/security/recommendations/generate:
 *   post:
 *     tags: [安全监控]
 *     summary: 生成AI安全建议
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI安全建议生成成功
 */
router.post('/recommendations/generate', auth_middleware_1.verifyToken, (0, permission_middleware_1.permissionMiddleware)(['SECURITY_MANAGE']), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, recommendations, error_7;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                return [4 /*yield*/, securityService.generateAIRecommendations(userId)];
            case 1:
                recommendations = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, recommendations, 'AI安全建议生成成功')];
            case 2:
                error_7 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_7, 'AI安全建议生成失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/security/config:
 *   get:
 *     tags: [安全监控]
 *     summary: 获取安全配置
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取安全配置
 */
router.get('/config', auth_middleware_1.verifyToken, (0, permission_middleware_1.permissionMiddleware)(['SECURITY_CONFIG']), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var config, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, securityService.getSecurityConfig()];
            case 1:
                config = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, config, '获取安全配置成功')];
            case 2:
                error_8 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_8, '获取安全配置失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/security/config:
 *   put:
 *     tags: [安全监控]
 *     summary: 更新安全配置
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passwordPolicy:
 *                 type: object
 *               sessionTimeout:
 *                 type: number
 *               loginAttempts:
 *                 type: number
 *               enableMFA:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 安全配置更新成功
 */
router.put('/config', auth_middleware_1.verifyToken, (0, permission_middleware_1.permissionMiddleware)(['SECURITY_CONFIG']), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, config, error_9;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                return [4 /*yield*/, securityService.updateSecurityConfig(req.body, userId)];
            case 1:
                config = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, config, '安全配置更新成功')];
            case 2:
                error_9 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_9, '安全配置更新失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
