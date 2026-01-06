"use strict";
/**
 * 优化后的AI助手路由配置
 * 提供三级分层处理的API接口
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
var ai_assistant_optimized_controller_1 = require("../controllers/ai-assistant-optimized.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var express_validator_1 = require("express-validator");
var direct_response_service_1 = require("../services/ai/direct-response.service");
var query_router_service_1 = require("../services/ai/query-router.service");
var router = (0, express_1.Router)();
// 应用认证中间件
router.use(auth_middleware_1.authMiddleware);
// 验证中间件
var validateRequest = function (req, res, next) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: '请求参数验证失败',
            errors: errors.array()
        });
        return;
    }
    next();
};
/**
 * @swagger
 * /api/ai-assistant-optimized/query:
 *   post:
 *     summary: 优化后的AI查询接口
 *     description: 提供三级分层处理的AI查询功能
 *     tags:
 *       - AI助手优化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - conversationId
 *             properties:
 *               query:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: 查询内容
 *               conversationId:
 *                 type: string
 *                 description: 会话ID
 *               userId:
 *                 type: integer
 *                 description: 用户ID（可选）
 *     responses:
 *       200:
 *         description: 查询成功
 *       400:
 *         description: 请求参数验证失败
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/query', [
    // 权限检查
    (0, auth_middleware_1.checkPermission)('AI_ASSISTANT_OPTIMIZED_QUERY'),
    // 请求验证
    (0, express_validator_1.body)('query')
        .isString()
        .isLength({ min: 1, max: 1000 })
        .withMessage('查询内容必须是1-1000字符的字符串'),
    (0, express_validator_1.body)('conversationId')
        .isString()
        .isLength({ min: 1 })
        .withMessage('会话ID不能为空'),
    // userId 由认证中间件提供，不再从body强制校验
    (0, express_validator_1.body)('userId').optional().isInt({ min: 1 }).withMessage('用户ID必须是正整数'),
    validateRequest
], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ai_assistant_optimized_controller_1.aiAssistantOptimizedController.handleOptimizedQuery(req, res)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/ai-assistant-optimized/stats:
 *   get:
 *     summary: 获取性能统计
 *     description: 获取AI助手的性能统计数据
 *     tags:
 *       - AI助手优化
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', [
    (0, auth_middleware_1.checkPermission)('AI_ASSISTANT_OPTIMIZED_PERFORMANCE')
], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ai_assistant_optimized_controller_1.aiAssistantOptimizedController.getPerformanceStats(req, res)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/ai-assistant-optimized/test-direct:
 *   post:
 *     summary: 测试直接响应功能
 *     description: 测试AI助手的直接响应功能
 *     tags:
 *       - AI助手优化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 description: 操作类型
 *     responses:
 *       200:
 *         description: 测试成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/test-direct', [
    (0, auth_middleware_1.checkPermission)('AI_ASSISTANT_OPTIMIZED_TEST'),
    (0, express_validator_1.body)('action')
        .isString()
        .isIn([
        // 原有功能
        'count_students',
        'count_teachers',
        'get_today_activities',
        'navigate_to_student_create',
        'navigate_to_student_list',
        'navigate_to_class_management',
        'get_attendance_stats',
        'get_fee_stats',
        'get_activity_list',
        // 家长管理
        'count_parents',
        'navigate_to_parent_list',
        'navigate_to_parent_create',
        // 班级管理扩展
        'count_classes',
        'navigate_to_class_list',
        'navigate_to_class_create',
        // 招生管理
        'get_enrollment_stats',
        'navigate_to_enrollment_plans',
        'navigate_to_enrollment_applications',
        'navigate_to_enrollment_consultations',
        // 用户权限管理
        'count_users',
        'navigate_to_user_list',
        'navigate_to_role_management',
        'navigate_to_permission_settings',
        // 营销管理
        'get_customer_stats',
        'navigate_to_marketing_campaigns',
        'navigate_to_customer_pool',
        // 系统管理
        'navigate_to_system_settings',
        'navigate_to_operation_logs',
        'get_system_status',
        // 绩效管理
        'get_performance_stats',
        'get_performance_report',
        'navigate_to_performance_evaluation',
        'navigate_to_performance_rules',
        'get_teacher_performance',
        'navigate_to_performance_management',
        // 通知消息
        'navigate_to_messages',
        'navigate_to_send_notification',
        'navigate_to_message_templates',
        'get_notification_stats',
        'get_unread_messages',
        'navigate_to_message_center',
        // 文件管理
        'navigate_to_files',
        'navigate_to_file_upload',
        'get_file_stats',
        'navigate_to_file_management',
        'get_storage_stats',
        'navigate_to_file_categories',
        // 任务管理
        'navigate_to_tasks',
        'navigate_to_create_task',
        'get_task_stats',
        'get_my_tasks',
        'navigate_to_task_templates',
        'navigate_to_task_management',
        // 测试扩展词汇 - 数据统计类
        'get_monthly_enrollment_data',
        'get_student_count_stats',
        'get_teacher_workload_stats',
        'get_activity_participation_stats',
        'get_fee_statistics',
        'get_class_size_distribution',
        'get_annual_enrollment_trends',
        'get_teacher_satisfaction_stats',
        'get_parent_feedback_stats',
        'get_system_usage_stats',
        // 测试扩展词汇 - 导航类
        'navigate_to_finance_center',
        'navigate_to_data_analytics',
        'navigate_to_report_center',
        'navigate_to_attendance_management',
        'navigate_to_course_schedule',
        'navigate_to_parent_communication',
        'navigate_to_security_management',
        'navigate_to_equipment_management',
        // 测试扩展词汇 - 操作类
        'batch_import_students',
        'generate_monthly_report',
        'send_parent_notifications',
        'backup_system_data',
        'clear_system_cache',
        'export_student_list',
        'reset_user_passwords',
        // 测试扩展词汇 - 查询类
        'get_today_schedule',
        'get_leave_applications',
        'get_pending_approvals',
        'get_latest_announcements',
        'get_system_update_logs',
        // 新增扩展词汇 - 招生相关
        'get_daily_enrollment_data',
        'get_weekly_enrollment_data',
        'get_yearly_enrollment_data',
        'get_enrollment_application_count',
        'get_pending_enrollment_data',
        'get_approved_enrollment_data',
        'get_enrollment_conversion_rate',
        'get_successful_enrollment_count',
        // 新增扩展词汇 - 活动相关
        'get_daily_activity_count',
        'get_weekly_activity_schedule',
        'get_monthly_activity_stats',
        'get_activity_registration_count',
        'get_activity_checkin_count',
        'get_ongoing_activities',
        'get_upcoming_activities',
        'get_activity_completion_rate',
        // 新增扩展词汇 - 学生相关
        'get_total_student_count',
        'get_active_student_count',
        'get_male_student_count',
        'get_female_student_count',
        'get_new_student_count',
        'get_graduate_count',
        // 新增扩展词汇 - 时间维度
        'get_daily_summary',
        'get_weekly_summary',
        'get_monthly_summary',
        'get_yearly_summary',
        // 新增扩展词汇 - 教师相关
        'get_teacher_count',
        'get_active_teacher_count',
        'get_teacher_attendance_rate',
        // 新增扩展词汇 - 班级相关
        'get_class_count',
        'get_class_capacity',
        'get_available_seats',
        // 新增扩展词汇 - 财务相关
        'get_total_revenue',
        'get_monthly_revenue',
        'get_payment_rate',
        // 新增扩展词汇 - 综合查询
        'get_data_overview',
        'get_operation_metrics',
        'get_key_metrics'
    ])
        .withMessage('无效的动作类型'),
    (0, express_validator_1.body)('query')
        .isString()
        .isLength({ min: 1 })
        .withMessage('查询内容不能为空'),
    validateRequest
], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, action, query, result, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, action = _a.action, query = _a.query;
                return [4 /*yield*/, direct_response_service_1.directResponseService.executeDirectAction(action, query)];
            case 1:
                result = _b.sent();
                res.json({
                    success: true,
                    data: result
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                res.status(500).json({
                    success: false,
                    error: '测试直接响应失败',
                    message: error_1 instanceof Error ? error_1.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/ai-assistant-optimized/test-route:
 *   post:
 *     summary: 测试查询路由功能
 *     description: 测试AI查询路由功能
 *     tags:
 *       - AI助手优化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: 测试成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/test-route', [
    (0, auth_middleware_1.checkPermission)('AI_ASSISTANT_OPTIMIZED_TEST'),
    (0, express_validator_1.body)('query')
        .isString()
        .isLength({ min: 1, max: 500 })
        .withMessage('查询内容必须是1-500字符的字符串'),
    validateRequest
], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, routeResult, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                query = req.body.query;
                return [4 /*yield*/, query_router_service_1.queryRouterService.routeQuery(query)];
            case 1:
                routeResult = _a.sent();
                res.json({
                    success: true,
                    data: routeResult
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res.status(500).json({
                    success: false,
                    error: '测试查询路由失败',
                    message: error_2 instanceof Error ? error_2.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/ai-assistant-optimized/keywords:
 *   get:
 *     summary: 获取关键词词典
 *     description: 获取AI助手的关键词词典统计信息
 *     tags:
 *       - AI助手优化
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/keywords', [
    (0, auth_middleware_1.checkPermission)('AI_ASSISTANT_OPTIMIZED_CONFIG')
], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stats;
    return __generator(this, function (_a) {
        try {
            stats = query_router_service_1.queryRouterService.getStats();
            res.json({
                success: true,
                data: {
                    message: '关键词词典统计信息',
                    stats: stats
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '获取关键词词典失败',
                message: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/ai-assistant-optimized/health:
 *   get:
 *     summary: 健康检查
 *     description: 检查AI助手服务的健康状态
 *     tags:
 *       - AI助手优化
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 服务健康
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
 *                     status:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     version:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/health', [
    (0, auth_middleware_1.checkPermission)('AI_ASSISTANT_OPTIMIZED_VIEW')
], function (req, res) {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            features: {
                directResponse: true,
                semanticRouting: true,
                complexAnalysis: true,
                performanceTracking: true
            }
        }
    });
});
exports["default"] = router;
