"use strict";
/**
 * 招生中心路由配置
 * 提供招生中心页面的聚合API接口
 *
 * 路由结构:
 * - GET  /api/enrollment/overview                    获取概览数据
 * - GET  /api/enrollment/plans                       获取计划列表
 * - POST /api/enrollment/plans                       创建计划
 * - GET  /api/enrollment/plans/:id                   获取计划详情
 * - PUT  /api/enrollment/plans/:id                   更新计划
 * - DELETE /api/enrollment/plans/:id                 删除计划
 * - GET  /api/enrollment/applications                获取申请列表
 * - GET  /api/enrollment/applications/:id            获取申请详情
 * - PUT  /api/enrollment/applications/:id/status     更新申请状态
 * - GET  /api/enrollment/consultations               获取咨询列表
 * - GET  /api/enrollment/consultations/statistics    获取咨询统计
 * - GET  /api/enrollment/analytics/trends            获取趋势分析
 * - GET  /api/enrollment/analytics/funnel            获取漏斗分析
 * - GET  /api/enrollment/analytics/regions           获取地域分析
 * - GET  /api/enrollment/analytics/metrics           获取指标对比
 * - POST /api/enrollment/ai/predict                  AI预测分析
 * - POST /api/enrollment/ai/strategy                 AI策略建议
 * - POST /api/enrollment/ai/capacity                 AI容量分析
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
var express_1 = require("express");
var enrollment_center_controller_1 = require("../controllers/enrollment-center.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
var enrollmentCenterController = new enrollment_center_controller_1.EnrollmentCenterController();
var controller = new enrollment_center_controller_1.EnrollmentCenterController();
// 使用认证中间件
router.use(auth_middleware_1.verifyToken);
// ==================== 概览数据 ====================
/**
 * @swagger
 * /api/enrollment/overview:
 *   get:
 *     summary: 获取招生中心概览数据
 *     tags: [EnrollmentCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *         description: 时间范围
 *       - in: query
 *         name: kindergartenId
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     statistics:
 *                       type: object
 *                     charts:
 *                       type: object
 *                     quickStats:
 *                       type: object
 */
router.get('/overview', (0, auth_middleware_1.checkPermission)('enrollment:overview:view'), controller.getOverview.bind(controller));
// ==================== 计划管理 ====================
/**
 * @swagger
 * /api/enrollment/plans:
 *   get:
 *     summary: 获取招生计划列表
 *     tags: [EnrollmentCenter]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *           enum: [spring, autumn]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, inactive]
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/plans', (0, auth_middleware_1.checkPermission)('enrollment:plans:view'), controller.getPlans.bind(controller));
/**
 * @swagger
 * /api/enrollment/plans:
 *   post:
 *     summary: 创建招生计划
 *     tags: [EnrollmentCenter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - year
 *               - semester
 *               - targetCount
 *             properties:
 *               title:
 *                 type: string
 *               year:
 *                 type: integer
 *               semester:
 *                 type: string
 *                 enum: [spring, autumn]
 *               targetCount:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 创建成功
 */
router.post('/plans', (0, auth_middleware_1.checkPermission)('enrollment:plans:create'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // TODO: 实现创建计划逻辑
        res.json({ success: true, message: '创建计划功能待实现' });
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/enrollment/plans/{id}:
 *   get:
 *     summary: 获取招生计划详情
 *     tags: [EnrollmentCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/plans/:id', (0, auth_middleware_1.checkPermission)('enrollment:plans:view'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // TODO: 实现获取计划详情逻辑
        res.json({ success: true, message: '获取计划详情功能待实现' });
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/enrollment/plans/{id}:
 *   put:
 *     summary: 更新招生计划
 *     tags: [EnrollmentCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/plans/:id', (0, auth_middleware_1.checkPermission)('enrollment:plans:update'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // TODO: 实现更新计划逻辑
        res.json({ success: true, message: '更新计划功能待实现' });
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/enrollment/plans/{id}:
 *   delete:
 *     summary: 删除招生计划
 *     tags: [EnrollmentCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 */
router["delete"]('/plans/:id', (0, auth_middleware_1.checkPermission)('enrollment:plans:delete'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // TODO: 实现删除计划逻辑
        res.json({ success: true, message: '删除计划功能待实现' });
        return [2 /*return*/];
    });
}); });
// ==================== 申请管理 ====================
/**
 * @swagger
 * /api/enrollment/applications:
 *   get:
 *     summary: 获取申请列表
 *     tags: [EnrollmentCenter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/applications', (0, auth_middleware_1.checkPermission)('enrollment:applications:view'), controller.getApplications.bind(controller));
/**
 * @swagger
 * /api/enrollment/applications/{id}:
 *   get:
 *     summary: 获取申请详情
 *     tags: [EnrollmentCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/applications/:id', (0, auth_middleware_1.checkPermission)('enrollment:applications:view'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // TODO: 实现获取申请详情逻辑
        res.json({ success: true, message: '获取申请详情功能待实现' });
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/enrollment/applications/{id}/status:
 *   put:
 *     summary: 更新申请状态
 *     tags: [EnrollmentCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, interview]
 *               remarks:
 *                 type: string
 *               notifyParent:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/applications/:id/status', (0, auth_middleware_1.checkPermission)('enrollment:applications:approve'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // TODO: 实现更新申请状态逻辑
        res.json({ success: true, message: '更新申请状态功能待实现' });
        return [2 /*return*/];
    });
}); });
// ==================== 咨询管理 ====================
/**
 * @swagger
 * /api/enrollment/consultations:
 *   get:
 *     summary: 获取咨询列表
 *     tags: [EnrollmentCenter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/consultations', (0, auth_middleware_1.checkPermission)('enrollment:consultations:view'), function (req, res) { return enrollmentCenterController.getConsultations(req, res); });
/**
 * @swagger
 * /api/enrollment/consultations/statistics:
 *   get:
 *     summary: 获取咨询统计数据
 *     tags: [EnrollmentCenter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/consultations/statistics', (0, auth_middleware_1.checkPermission)('enrollment:consultations:view'), controller.getConsultationStatistics.bind(controller));
// ==================== 数据分析 ====================
/**
 * @swagger
 * /api/enrollment/analytics/trends:
 *   get:
 *     summary: 获取招生趋势分析
 *     tags: [EnrollmentCenter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/analytics/trends', (0, auth_middleware_1.checkPermission)('enrollment:analytics:view'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // TODO: 实现趋势分析逻辑
        res.json({ success: true, message: '趋势分析功能待实现' });
        return [2 /*return*/];
    });
}); });
// ==================== AI功能 ====================
/**
 * @swagger
 * /api/enrollment/ai/predict:
 *   post:
 *     summary: AI智能预测
 *     tags: [EnrollmentCenter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 预测成功
 */
router.post('/ai/predict', (0, auth_middleware_1.checkPermission)('enrollment:ai:use'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // TODO: 实现AI预测逻辑
        res.json({ success: true, message: 'AI预测功能待实现' });
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/enrollment/ai/strategy:
 *   post:
 *     summary: AI策略建议
 *     tags: [EnrollmentCenter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 策略建议成功
 */
router.post('/ai/strategy', (0, auth_middleware_1.checkPermission)('enrollment:ai:use'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // TODO: 实现AI策略建议逻辑
        res.json({ success: true, message: 'AI策略建议功能待实现' });
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
