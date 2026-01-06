"use strict";
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 请求是否成功
 *         message:
 *           type: string
 *           description: 响应消息
 *         data:
 *           type: object
 *           description: 响应数据
 *         error:
 *           type: string
 *           description: 错误信息（失败时返回）
 *     Parent:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 家长ID
 *         name:
 *           type: string
 *           description: 家长姓名
 *         phone:
 *           type: string
 *           description: 联系电话
 *         relationship:
 *           type: string
 *           description: 与学生关系
 *         studentId:
 *           type: integer
 *           description: 关联学生ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Application:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 申请ID
 *         studentName:
 *           type: string
 *           description: 学生姓名
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: 性别
 *         birthDate:
 *           type: string
 *           format: date
 *           description: 出生日期
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: 申请状态
 *         applyDate:
 *           type: string
 *           format: date-time
 *           description: 申请日期
 *         parent:
 *           type: object
 *           description: 家长信息
 *     CampusOverview:
 *       type: object
 *       properties:
 *         totalStudents:
 *           type: integer
 *           description: 学生总数
 *         totalTeachers:
 *           type: integer
 *           description: 教师总数
 *         totalClasses:
 *           type: integer
 *           description: 班级总数
 *         totalActivities:
 *           type: integer
 *           description: 活动总数
 *         campusArea:
 *           type: string
 *           description: 校园面积
 *         buildingCount:
 *           type: integer
 *           description: 建筑数量
 *         playgroundCount:
 *           type: integer
 *           description: 操场数量
 *         libraryCount:
 *           type: integer
 *           description: 图书馆数量
 *         lastUpdateTime:
 *           type: string
 *           format: date-time
 *           description: 最后更新时间
 *     MarketingAnalysis:
 *       type: object
 *       properties:
 *         overview:
 *           type: object
 *           description: 营销概览
 *         channelAnalysis:
 *           type: object
 *           description: 渠道分析
 *         monthlyTrends:
 *           type: array
 *           items:
 *             type: object
 *           description: 月度趋势
 *         topPerformingCampaigns:
 *           type: array
 *           items:
 *             type: object
 *           description: 顶级营销活动
 *
 * tags:
 *   - name: 路由管理
 *     description: 系统路由管理和配置
 *   - name: 家长管理
 *     description: 家长信息管理
 *   - name: 申请管理
 *     description: 入学申请管理
 *   - name: 校园管理
 *     description: 校园概览和统计
 *   - name: 营销分析
 *     description: 营销数据分析
 *   - name: 系统设置
 *     description: 系统配置和设置
 *   - name: AI功能
 *     description: AI相关功能
 *   - name: 活动分析
 *     description: 活动数据分析
 *   - name: 园长工作台
 *     description: 园长专用功能
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var express_1 = require("express");
var auth_routes_1 = __importDefault(require("./auth.routes"));
var user_routes_1 = __importDefault(require("./user.routes"));
var role_routes_1 = __importDefault(require("./role.routes"));
var permission_routes_1 = __importDefault(require("./permission.routes"));
var permissions_routes_1 = __importDefault(require("./permissions.routes"));
var page_permissions_routes_1 = __importDefault(require("./page-permissions.routes"));
var user_role_routes_1 = __importDefault(require("./user-role.routes"));
var role_permission_routes_1 = __importDefault(require("./role-permission.routes"));
var kindergarten_routes_1 = __importDefault(require("./kindergarten.routes"));
var kindergarten_basic_info_routes_1 = __importDefault(require("./kindergarten-basic-info.routes"));
var class_routes_1 = __importDefault(require("./class.routes"));
var teacher_routes_1 = __importDefault(require("./teacher.routes"));
var teacher_customers_routes_1 = __importDefault(require("./teacher-customers.routes"));
var student_routes_1 = __importDefault(require("./student.routes"));
var parent_routes_1 = __importDefault(require("./parent.routes"));
var parent_student_relation_routes_1 = __importDefault(require("./parent-student-relation.routes"));
var game_routes_1 = __importDefault(require("./game.routes"));
var enrollment_plan_routes_1 = __importDefault(require("./enrollment-plan.routes"));
var enrollment_quota_routes_1 = __importDefault(require("./enrollment-quota.routes"));
var enrollment_application_routes_1 = __importDefault(require("./enrollment-application.routes"));
var enrollment_interview_routes_1 = __importDefault(require("./enrollment-interview.routes"));
var enrollment_consultation_routes_1 = __importDefault(require("./enrollment-consultation.routes"));
var enrollment_routes_1 = __importDefault(require("./enrollment.routes"));
var activity_plan_routes_1 = __importDefault(require("./activity-plan.routes"));
var activity_template_routes_1 = __importDefault(require("./activity-template.routes"));
var activity_registration_routes_1 = __importDefault(require("./activity-registration.routes"));
var activity_checkin_routes_1 = __importDefault(require("./activity-checkin.routes"));
var activity_evaluation_routes_1 = __importDefault(require("./activity-evaluation.routes"));
var advertisement_routes_1 = __importDefault(require("./advertisement.routes"));
var marketing_campaign_routes_1 = __importDefault(require("./marketing-campaign.routes"));
var marketing_center_routes_1 = __importDefault(require("./marketing-center.routes"));
var channel_tracking_routes_1 = __importDefault(require("./channel-tracking.routes"));
var conversion_tracking_routes_1 = __importDefault(require("./conversion-tracking.routes"));
var admission_result_routes_1 = __importDefault(require("./admission-result.routes"));
var admission_notification_routes_1 = __importDefault(require("./admission-notification.routes"));
var poster_template_routes_1 = __importDefault(require("./poster-template.routes"));
var poster_generation_routes_1 = __importDefault(require("./poster-generation.routes"));
var customer_pool_routes_1 = __importDefault(require("./customer-pool.routes"));
var api_routes_1 = __importDefault(require("./api.routes"));
var example_routes_1 = __importDefault(require("./example.routes"));
var api_list_routes_1 = __importDefault(require("./api-list.routes"));
var dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
var principal_routes_1 = __importDefault(require("./principal.routes"));
var debug_log_middleware_1 = __importDefault(require("../middlewares/debug-log.middleware"));
var enrollment_statistics_routes_1 = __importDefault(require("./enrollment-statistics.routes"));
var statistics_routes_1 = __importDefault(require("./statistics.routes"));
var centers_1 = __importDefault(require("./centers"));
// 安全地导入绩效规则路由
var performance_rule_routes_1 = __importDefault(require("./performance-rule.routes"));
var script_routes_1 = __importDefault(require("./script.routes"));
var script_category_routes_1 = __importDefault(require("./script-category.routes"));
// 导入系统配置路由
var system_configs_routes_1 = __importDefault(require("./system-configs.routes"));
// 导入通知管理路由
var notifications_routes_1 = __importDefault(require("./notifications.routes"));
// 导入日程管理路由
var schedules_routes_1 = __importDefault(require("./schedules.routes"));
// 导入文件存储路由
var files_routes_1 = __importDefault(require("./files.routes"));
// 导入待办事项路由
var todos_routes_1 = __importDefault(require("./todos.routes"));
// 导入任务管理路由
var task_routes_1 = __importDefault(require("./task.routes"));
// 导入任务附件路由
var task_attachments_routes_1 = __importDefault(require("./task-attachments.routes"));
// 导入客户申请路由
var customer_applications_routes_1 = __importDefault(require("./customer-applications.routes"));
// 导入系统日志路由
var system_logs_routes_1 = __importDefault(require("./system-logs.routes"));
// 导入操作日志路由
var operation_logs_routes_1 = __importDefault(require("./operation-logs.routes"));
// 导入系统功能路由
var system_routes_1 = __importDefault(require("./system.routes"));
// 导入统一统计路由
var unified_statistics_routes_1 = __importDefault(require("./unified-statistics.routes"));
// 导入招生任务路由
var enrollment_tasks_routes_1 = __importDefault(require("./enrollment-tasks.routes"));
// 导入消息模板路由
var message_templates_routes_1 = __importDefault(require("./message-templates.routes"));
// 导入性能监控路由
var performance_routes_1 = __importDefault(require("./performance.routes"));
// 导入性能评估路由
var performance_evaluations_routes_1 = __importDefault(require("./performance-evaluations.routes"));
// 导入性能报告路由
var performance_reports_routes_1 = __importDefault(require("./performance-reports.routes"));
// 导入管理员路由
var admin_routes_1 = __importDefault(require("./admin.routes"));
// 导入新的AI路由（包含RAG功能）
var index_1 = __importDefault(require("./ai/index"));
// 导入AI招生功能路由
var enrollment_ai_routes_1 = __importDefault(require("./enrollment-ai.routes"));
// 导入招生中心聚合路由
var enrollment_center_routes_1 = __importDefault(require("./enrollment-center.routes"));
// 导入人员中心聚合路由
var personnel_center_routes_1 = __importDefault(require("./personnel-center.routes"));
// 导入系统AI模型路由
var system_ai_models_routes_1 = __importDefault(require("./system-ai-models.routes"));
// 导入活动路由
var activities_routes_1 = __importDefault(require("./activities.routes"));
// 导入园长绩效路由
var principal_performance_routes_1 = __importDefault(require("./principal-performance.routes"));
// 导入活动策划路由
var activity_planner_1 = __importDefault(require("./activity-planner"));
// 导入专家咨询路由
var expert_consultation_1 = __importDefault(require("./expert-consultation"));
// 导入在线咨询路由
var chat_routes_1 = __importDefault(require("./chat.routes"));
// 导入系统备份路由
var system_backup_routes_1 = __importDefault(require("./system-backup.routes"));
// 导入示例路由 - 用于测试（已在上面导入）
// 导入错误收集路由
var errors_routes_1 = __importDefault(require("./errors.routes"));
// 导入AI查询功能路由 - 重新启用
var ai_query_routes_1 = __importDefault(require("./ai-query.routes"));
// 导入AI性能监控路由
var ai_performance_routes_1 = __importDefault(require("./ai-performance.routes"));
// 导入AI快捷操作路由
var ai_shortcuts_routes_1 = __importDefault(require("./ai-shortcuts.routes"));
// 导入AI自动配图路由
var auto_image_routes_1 = __importDefault(require("./auto-image.routes"));
// 导入页面说明文档路由
var page_guide_routes_1 = __importDefault(require("./page-guide.routes"));
var page_guide_section_routes_1 = __importDefault(require("./page-guide-section.routes"));
var ai_knowledge_routes_1 = __importDefault(require("./ai-knowledge.routes"));
// 导入AI统计数据路由
var ai_stats_routes_1 = __importDefault(require("./ai-stats.routes"));
// 导入安全监控路由
var security_routes_1 = __importDefault(require("./security.routes"));
// 导入文档导入路由
var document_import_routes_1 = __importDefault(require("./document-import.routes"));
// 导入AI视频生成路由
var video_routes_1 = __importDefault(require("./ai/video.routes"));
// 导入智能专家咨询路由
var smart_expert_routes_1 = __importDefault(require("./ai/smart-expert.routes"));
// 导入网站自动化路由
var websiteAutomation_1 = require("./websiteAutomation");
// 导入财务路由
var finance_routes_1 = __importDefault(require("./finance.routes"));
// 导入招生财务联动路由
var enrollment_finance_routes_1 = __importDefault(require("./enrollment-finance.routes"));
// 导入AI助手优化路由
var ai_assistant_optimized_routes_1 = __importDefault(require("./ai-assistant-optimized.routes"));
// 导入AI分析路由
var ai_analysis_routes_1 = __importDefault(require("./ai-analysis.routes"));
// 导入数据导入路由
var data_import_routes_1 = __importDefault(require("./data-import.routes"));
// 导入批量导入路由
var batch_import_routes_1 = __importDefault(require("./batch-import.routes"));
// 导入字段模板路由
var field_template_routes_1 = __importDefault(require("./field-template.routes"));
// 导入快捷查询分组路由
var quick_query_groups_routes_1 = __importDefault(require("./quick-query-groups.routes"));
// 导入教学中心路由
var teaching_center_routes_1 = __importDefault(require("./teaching-center.routes"));
// 导入业务中心路由
var business_center_routes_1 = __importDefault(require("./business-center.routes"));
// 导入教师工作台路由
var teacher_dashboard_routes_1 = __importDefault(require("./teacher-dashboard.routes"));
// 导入客户跟进增强版路由
var customer_follow_enhanced_routes_1 = __importDefault(require("./customer-follow-enhanced.routes"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var principal_controller_1 = require("../controllers/principal.controller");
// AI路由
// import aiMemoryRoutes from './ai/memory.routes';
var router = (0, express_1.Router)();
// 使用调试日志中间件
if (process.env.NODE_ENV !== 'production') {
    router.use(debug_log_middleware_1["default"]);
    console.log('已启用API调试日志中间件');
}
// 所有环境都使用authMiddleware，因为我们已经修改了verifyToken在开发环境中自动通过
// 不再使用mockAuthMiddleware
// router.use(mockAuthMiddleware);
// 替换真实权限检查为模拟权限检查
// 修复: 不直接修改permissionMiddleware，而是在使用时使用mockPermissionMiddleware
// (permissionMiddleware as any) = mockPermissionMiddleware;
// API信息路由
router.use('/', api_routes_1["default"]);
// API列表路由
router.use('/list', api_list_routes_1["default"]);
// 认证相关路由
router.use('/auth', auth_routes_1["default"]);
// 权限相关路由
var auth_permissions_routes_1 = __importDefault(require("./auth-permissions.routes"));
router.use('/auth-permissions', auth_permissions_routes_1["default"]);
// 基础API路由 (已在上面注册过，删除重复)
// router.use('/api', apiRoutes); // 重复注册，已删除
router.use('/example', example_routes_1["default"]);
// 系统管理路由
router.use('/users', user_routes_1["default"]);
router.use('/roles', role_routes_1["default"]);
router.use('/permissions', permission_routes_1["default"]);
router.use('/permissions', page_permissions_routes_1["default"]); // Level 3: 页面操作权限API
router.use('/dynamic-permissions', permissions_routes_1["default"]);
router.use('/user-roles', user_role_routes_1["default"]);
router.use('/role-permissions', role_permission_routes_1["default"]);
// 添加管理员路由
router.use('/admin', admin_routes_1["default"]);
// 仪表盘路由
router.use('/dashboard', dashboard_routes_1["default"]);
// 园长专属路由
router.use('/principal', principal_routes_1["default"]);
// 园长功能路由
var principalController = new principal_controller_1.PrincipalController();
/**
 * @swagger
 * /principal/dashboard-stats:
 *   get:
 *     tags: [园长工作台]
 *     summary: 获取园长仪表盘统计数据
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取统计数据成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: 仪表盘统计数据
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/principal/dashboard-stats', auth_middleware_1.verifyToken, function (req, res) { return principalController.getDashboardStats(req, res); });
/**
 * @swagger
 * /principal/activities:
 *   get:
 *     tags: [园长工作台]
 *     summary: 获取园长活动列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取活动列表成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: 活动信息
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/principal/activities', auth_middleware_1.verifyToken, function (req, res) { return principalController.getActivities(req, res); });
/**
 * @swagger
 * /campus/overview:
 *   get:
 *     tags: [校园管理]
 *     summary: 获取校园概览信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取校园概览成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CampusOverview'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/campus/overview', auth_middleware_1.verifyToken, function (req, res) {
    res.json({
        success: true,
        message: '获取校园概览成功',
        data: {
            totalStudents: 1200,
            totalTeachers: 80,
            totalClasses: 24,
            totalActivities: 15,
            campusArea: '5000平方米',
            buildingCount: 3,
            playgroundCount: 2,
            libraryCount: 1,
            lastUpdateTime: new Date().toISOString()
        }
    });
});
// 客户池路由
router.use('/principal/customer-pool', customer_pool_routes_1["default"]);
router.use('/customer-pool', customer_pool_routes_1["default"]);
// 客户管理路由别名，解决前端API路径不匹配问题 (保留，不同路径)
// 测试路由已删除 - API优化
// 测试路由已删除 - API优化，使用标准 /parents 端点
/**
 * @swagger
 * /parents:
 *   post:
 *     tags: [家长管理]
 *     summary: 创建家长信息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - relationship
 *             properties:
 *               name:
 *                 type: string
 *                 description: 家长姓名
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *               relationship:
 *                 type: string
 *                 description: 与学生关系
 *               studentId:
 *                 type: integer
 *                 description: 关联学生ID
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Parent'
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 创建失败
 */
router.post('/parents', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('PARENT_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, phone, relationship, studentId, parent_1;
    return __generator(this, function (_b) {
        try {
            _a = req.body, name_1 = _a.name, phone = _a.phone, relationship = _a.relationship, studentId = _a.studentId;
            parent_1 = {
                id: Math.floor(Math.random() * 1000) + 1,
                name: name_1,
                phone: phone,
                relationship: relationship,
                studentId: studentId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            res.status(201).json({
                success: true,
                message: '家长创建成功',
                data: parent_1
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: '创建家长失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /parents/{id}:
 *   put:
 *     tags: [家长管理]
 *     summary: 更新家长信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 家长姓名
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *               relationship:
 *                 type: string
 *                 description: 与学生关系
 *               studentId:
 *                 type: integer
 *                 description: 关联学生ID
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Parent'
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 更新失败
 */
router.put('/parents/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('PARENT_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, updateData, updatedParent;
    return __generator(this, function (_a) {
        try {
            id = parseInt(req.params.id);
            updateData = req.body;
            updatedParent = __assign(__assign({ id: id }, updateData), { updatedAt: new Date().toISOString() });
            res.json({
                success: true,
                message: '更新家长信息成功',
                data: updatedParent
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: '更新家长信息失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /parents/{id}:
 *   delete:
 *     tags: [家长管理]
 *     summary: 删除家长信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     responses:
 *       200:
 *         description: 删除成功
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
 *                         deletedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 删除失败
 */
router["delete"]('/parents/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('PARENT_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id;
    return __generator(this, function (_a) {
        try {
            id = parseInt(req.params.id);
            res.json({
                success: true,
                message: '删除家长成功',
                data: { id: id, deletedAt: new Date().toISOString() }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: '删除家长失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); });
// 幼儿园管理路由
router.use('/kindergartens', kindergarten_routes_1["default"]);
router.use('/kindergarten', kindergarten_basic_info_routes_1["default"]);
router.use('/classes', class_routes_1["default"]);
router.use('/teachers', teacher_routes_1["default"]);
router.use('/teacher/customers', teacher_customers_routes_1["default"]);
router.use('/customer-follow-enhanced', customer_follow_enhanced_routes_1["default"]);
router.use('/students', student_routes_1["default"]);
router.use('/parents', parent_routes_1["default"]);
// 亲子关系管理路由
router.use('/parent-student-relations', parent_student_relation_routes_1["default"]);
// 招生管理路由
router.use('/enrollment-plans', enrollment_plan_routes_1["default"]);
router.use('/enrollment-quotas', enrollment_quota_routes_1["default"]);
router.use('/enrollment-applications', enrollment_application_routes_1["default"]);
router.use('/enrollment-interviews', enrollment_interview_routes_1["default"]);
router.use('/enrollment-consultations', enrollment_consultation_routes_1["default"]);
router.use('/enrollment', enrollment_routes_1["default"]);
// AI招生功能路由
router.use('/enrollment-ai', enrollment_ai_routes_1["default"]);
// 招生中心聚合路由
router.use('/enrollment-center', enrollment_center_routes_1["default"]);
// 人员中心聚合路由
router.use('/personnel-center', auth_middleware_1.verifyToken, personnel_center_routes_1["default"]);
// 教学中心路由
router.use('/teaching-center', teaching_center_routes_1["default"]);
// 业务中心路由
router.use('/business-center', business_center_routes_1["default"]);
// 教师工作台路由
router.use('/teacher', teacher_dashboard_routes_1["default"]);
/**
 * @swagger
 * /applications:
 *   get:
 *     tags: [申请管理]
 *     summary: 获取申请列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: 申请状态
 *     responses:
 *       200:
 *         description: 获取申请列表成功
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
 *                         total:
 *                           type: integer
 *                           description: 总数量
 *                         items:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Application'
 *                         page:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/applications', auth_middleware_1.verifyToken, function (req, res) {
    res.json({
        success: true,
        message: '获取申请列表成功',
        data: {
            total: 5,
            items: [
                {
                    id: 1,
                    studentName: '测试学生1',
                    gender: 'male',
                    birthDate: '2020-01-01',
                    status: 'pending',
                    applyDate: new Date(),
                    parent: { name: '测试家长1', phone: '13800000001' }
                },
                {
                    id: 2,
                    studentName: '测试学生2',
                    gender: 'female',
                    birthDate: '2020-02-01',
                    status: 'approved',
                    applyDate: new Date(),
                    parent: { name: '测试家长2', phone: '13800000002' }
                }
            ],
            page: 1,
            pageSize: 10
        }
    });
});
/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     tags: [申请管理]
 *     summary: 获取申请详情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 申请ID
 *     responses:
 *       200:
 *         description: 获取申请详情成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Application'
 *                         - type: object
 *                           properties:
 *                             documents:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   type:
 *                                     type: string
 *                                   status:
 *                                     type: string
 *       401:
 *         description: 未授权访问
 *       404:
 *         description: 申请不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/applications/:id', auth_middleware_1.verifyToken, function (req, res) {
    var id = parseInt(req.params.id);
    res.json({
        success: true,
        message: '获取申请详情成功',
        data: {
            id: id,
            studentName: "\u6D4B\u8BD5\u5B66\u751F".concat(id),
            gender: id % 2 === 0 ? 'female' : 'male',
            birthDate: '2020-01-01',
            status: id === 1 ? 'pending' : 'approved',
            applyDate: new Date(),
            parent: {
                name: "\u6D4B\u8BD5\u5BB6\u957F".concat(id),
                phone: "1380000000".concat(id),
                relationship: 'father'
            },
            documents: [
                { type: '户口本', status: 'submitted' },
                { type: '疫苗接种证明', status: 'pending' }
            ]
        }
    });
});
/**
 * @swagger
 * /quotas:
 *   get:
 *     tags: [申请管理]
 *     summary: 获取招生名额列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: planId
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *     responses:
 *       200:
 *         description: 获取招生名额列表成功
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
 *                         total:
 *                           type: integer
 *                         items:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               planId:
 *                                 type: integer
 *                               classId:
 *                                 type: integer
 *                               totalQuota:
 *                                 type: integer
 *                               usedQuota:
 *                                 type: integer
 *                               reservedQuota:
 *                                 type: integer
 *                               availableQuota:
 *                                 type: integer
 *                               class:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   name:
 *                                     type: string
 *                                   grade:
 *                                     type: string
 *                         page:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/quotas', auth_middleware_1.verifyToken, function (req, res) {
    res.json({
        success: true,
        message: '获取招生名额列表成功',
        data: {
            total: 3,
            items: [
                {
                    id: 1,
                    planId: 1,
                    classId: 1,
                    totalQuota: 30,
                    usedQuota: 5,
                    reservedQuota: 2,
                    availableQuota: 23,
                    "class": { id: 1, name: '小一班', grade: 'junior' }
                },
                {
                    id: 2,
                    planId: 1,
                    classId: 2,
                    totalQuota: 30,
                    usedQuota: 8,
                    reservedQuota: 3,
                    availableQuota: 19,
                    "class": { id: 2, name: '小二班', grade: 'junior' }
                }
            ],
            page: 1,
            pageSize: 10
        }
    });
});
// 添加consultations路由别名，兼容前端调用
router.use('/consultations', enrollment_consultation_routes_1["default"]);
// 招生统计路由
router.use('/enrollment-statistics', enrollment_statistics_routes_1["default"]);
// 统一统计路由 - 整合所有统计功能
router.use('/statistics', unified_statistics_routes_1["default"]);
// 通用统计路由 - 保留兼容性（标记为废弃）
// TODO: 后续版本移除，使用统一统计API替代
router.use('/statistics-legacy', statistics_routes_1["default"]);
// 活动管理路由
router.use('/activities', activities_routes_1["default"]);
router.use('/activity-plans', activity_plan_routes_1["default"]);
router.use('/activity-templates', activity_template_routes_1["default"]);
router.use('/activity-registrations', activity_registration_routes_1["default"]);
router.use('/activity-checkins', activity_checkin_routes_1["default"]);
router.use('/activity-evaluations', activity_evaluation_routes_1["default"]);
// 游戏系统路由
router.use('/games', game_routes_1["default"]);
// 活动海报管理路由
var activity_poster_routes_1 = __importDefault(require("./activity-poster.routes"));
router.use('/activity-posters', activity_poster_routes_1["default"]);
// 数据库迁移路由
var migration_routes_1 = __importDefault(require("./migration.routes"));
router.use('/migration', migration_routes_1["default"]);
// 新营销中心路由（四大页面服务）
var marketing_routes_1 = __importDefault(require("./marketing.routes"));
router.use('/marketing', marketing_routes_1["default"]);
// 营销管理路由
router.use('/advertisements', advertisement_routes_1["default"]);
router.use('/marketing-campaigns', marketing_campaign_routes_1["default"]);
router.use('/marketing-center', marketing_center_routes_1["default"]);
router.use('/channel-trackings', channel_tracking_routes_1["default"]);
router.use('/conversion-trackings', conversion_tracking_routes_1["default"]);
/**
 * @swagger
 * /marketing/analysis:
 *   get:
 *     tags: [营销分析]
 *     summary: 获取营销分析数据
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *         description: 分析周期
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *     responses:
 *       200:
 *         description: 获取营销分析数据成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MarketingAnalysis'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/marketing/analysis', auth_middleware_1.verifyToken, function (req, res) {
    res.json({
        success: true,
        message: '获取营销分析数据成功',
        data: {
            overview: {
                totalCampaigns: 12,
                activeCampaigns: 5,
                totalLeads: 1280,
                conversionRate: 0.186
            },
            channelAnalysis: {
                online: { leads: 680, conversions: 128, rate: 0.188 },
                offline: { leads: 420, conversions: 85, rate: 0.202 },
                referral: { leads: 180, conversions: 25, rate: 0.139 }
            },
            monthlyTrends: [
                { month: '2024-01', leads: 95, conversions: 18 },
                { month: '2024-02', leads: 110, conversions: 22 },
                { month: '2024-03', leads: 125, conversions: 28 }
            ],
            topPerformingCampaigns: [
                { id: 1, name: '春季招生活动', leads: 285, conversions: 52 },
                { id: 2, name: '在线开放日', leads: 195, conversions: 38 }
            ]
        }
    });
});
// 录取管理路由
router.use('/admission-results', admission_result_routes_1["default"]);
router.use('/admission-notifications', admission_notification_routes_1["default"]);
// 海报管理路由
router.use('/poster-templates', poster_template_routes_1["default"]);
router.use('/poster-generations', poster_generation_routes_1["default"]);
// 绩效规则路由
router.use('/performance/rules', performance_rule_routes_1["default"]);
// 话术管理路由
router.use('/scripts', script_routes_1["default"]);
router.use('/script-categories', script_category_routes_1["default"]);
// 系统配置路由
router.use('/system-configs', system_configs_routes_1["default"]);
// 通知管理路由
router.use('/notifications', notifications_routes_1["default"]);
// 日程管理路由
router.use('/schedules', schedules_routes_1["default"]);
// 添加路由别名，确保单复数兼容
router.use('/schedule', schedules_routes_1["default"]);
// 文件存储路由
router.use('/files', files_routes_1["default"]);
// 待办事项路由
router.use('/todos', todos_routes_1["default"]);
// 任务管理路由
router.use('/tasks', task_routes_1["default"]);
// 任务附件路由（必须在任务路由之后注册）
router.use('/api', task_attachments_routes_1["default"]);
// 客户申请路由
router.use('/api', customer_applications_routes_1["default"]);
// 系统日志路由
router.use('/logs', system_logs_routes_1["default"]);
router.use('/system-logs', system_logs_routes_1["default"]);
// 系统备份路由
router.use('/system-backup', system_backup_routes_1["default"]);
// 操作日志路由
router.use('/operation-logs', operation_logs_routes_1["default"]);
// 系统AI模型路由 - 必须在通用/system路由之前注册
router.use('/system/ai-models', system_ai_models_routes_1["default"]);
// 系统权限路由（兼容前端API调用）
router.use('/system/permissions', permission_routes_1["default"]);
// 系统角色路由（兼容前端API调用）
router.use('/system/roles', role_routes_1["default"]);
/**
 * @swagger
 * /system/backups:
 *   get:
 *     tags: [系统管理]
 *     summary: 获取系统备份列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取备份列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取系统备份列表成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 备份文件总数
 *                     items:
 *                       type: array
 *                       description: 备份文件列表
 *       401:
 *         description: 未授权
 */
// 系统备份和设置路由 - 必须在通用/system路由之前
router.get('/system/backups', auth_middleware_1.verifyToken, function (req, res) {
    res.json({
        success: true,
        message: '获取系统备份列表成功',
        data: {
            total: 3,
            items: [
                {
                    id: 1,
                    fileName: 'backup_20240712_001.sql',
                    fileSize: '156.8MB',
                    backupDate: '2024-07-12',
                    status: 'completed',
                    type: 'full'
                },
                {
                    id: 2,
                    fileName: 'backup_20240711_001.sql',
                    fileSize: '142.3MB',
                    backupDate: '2024-07-11',
                    status: 'completed',
                    type: 'incremental'
                }
            ]
        }
    });
});
/**
 * @swagger
 * /system/settings:
 *   get:
 *     tags: [系统管理]
 *     summary: 获取系统设置
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取系统设置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取系统设置成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     siteName:
 *                       type: string
 *                       description: 站点名称
 *                     version:
 *                       type: string
 *                       description: 系统版本
 *                     timezone:
 *                       type: string
 *                       description: 时区
 *                     language:
 *                       type: string
 *                       description: 语言
 *       401:
 *         description: 未授权
 */
router.get('/system/settings', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var getSystemSettingsByGroup, basicSettings, securitySettings, emailSettings, storageSettings, allSettings, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../scripts/init-system-settings')); })];
            case 1:
                getSystemSettingsByGroup = (_a.sent()).getSystemSettingsByGroup;
                return [4 /*yield*/, getSystemSettingsByGroup('basic')];
            case 2:
                basicSettings = _a.sent();
                return [4 /*yield*/, getSystemSettingsByGroup('security')];
            case 3:
                securitySettings = _a.sent();
                return [4 /*yield*/, getSystemSettingsByGroup('email')];
            case 4:
                emailSettings = _a.sent();
                return [4 /*yield*/, getSystemSettingsByGroup('storage')];
            case 5:
                storageSettings = _a.sent();
                allSettings = __assign(__assign(__assign(__assign({}, basicSettings), securitySettings), emailSettings), storageSettings);
                console.log('📖 获取系统设置:', allSettings);
                res.json({
                    success: true,
                    message: '获取系统设置成功',
                    data: allSettings
                });
                return [3 /*break*/, 7];
            case 6:
                error_1 = _a.sent();
                console.error('获取系统设置失败:', error_1);
                res.status(500).json({
                    success: false,
                    message: '获取系统设置失败',
                    error: error_1 instanceof Error ? error_1.message : '未知错误'
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system/settings:
 *   put:
 *     summary: 更新系统设置
 *     description: 更新系统配置设置，包括会话超时、密码策略等
 *     tags: [系统管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group:
 *                 type: string
 *                 description: 设置组名
 *                 example: "security"
 *               settings:
 *                 type: object
 *                 description: 设置数据
 *                 properties:
 *                   sessionTimeout:
 *                     type: number
 *                     description: 会话超时时间（分钟）
 *                   passwordComplexity:
 *                     type: object
 *                     properties:
 *                       requireUppercase:
 *                         type: boolean
 *                       requireLowercase:
 *                         type: boolean
 *                       requireNumbers:
 *                         type: boolean
 *                       requireSpecialChars:
 *                         type: boolean
 *                   minPasswordLength:
 *                     type: number
 *                     description: 最短密码长度
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: 未授权
 */
router.put('/system/settings', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, group, settings, userId, _b, setSystemSetting, getSystemSettingsByGroup, updatePromises, updatedSettings, _i, _c, _d, key, value, results, failedUpdates, updatedGroupSettings, error_2;
    var _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 4, , 5]);
                _a = req.body, group = _a.group, settings = _a.settings;
                userId = ((_e = req.user) === null || _e === void 0 ? void 0 : _e.id) || 1;
                // 记录设置更新日志
                console.log("\uD83D\uDD27 \u7CFB\u7EDF\u8BBE\u7F6E\u66F4\u65B0 - \u7EC4: ".concat(group), settings);
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../scripts/init-system-settings')); })];
            case 1:
                _b = _f.sent(), setSystemSetting = _b.setSystemSetting, getSystemSettingsByGroup = _b.getSystemSettingsByGroup;
                updatePromises = [];
                updatedSettings = {};
                for (_i = 0, _c = Object.entries(settings); _i < _c.length; _i++) {
                    _d = _c[_i], key = _d[0], value = _d[1];
                    updatePromises.push(setSystemSetting(group, key, value, userId));
                    updatedSettings[key] = value;
                }
                return [4 /*yield*/, Promise.all(updatePromises)];
            case 2:
                results = _f.sent();
                failedUpdates = results.filter(function (result) { return !result; }).length;
                if (failedUpdates > 0) {
                    console.warn("\u26A0\uFE0F  \u6709 ".concat(failedUpdates, " \u4E2A\u8BBE\u7F6E\u66F4\u65B0\u5931\u8D25"));
                }
                // 特殊处理：如果更新了会话超时时间，需要更新JWT配置
                if (group === 'security' && settings.sessionTimeout) {
                    console.log("\u23F0 \u4F1A\u8BDD\u8D85\u65F6\u65F6\u95F4\u66F4\u65B0\u4E3A: ".concat(settings.sessionTimeout, " \u5206\u949F"));
                    // 这里可以触发JWT配置更新或缓存刷新
                    global.sessionTimeoutMinutes = Number(settings.sessionTimeout);
                }
                return [4 /*yield*/, getSystemSettingsByGroup(group)];
            case 3:
                updatedGroupSettings = _f.sent();
                res.json({
                    success: true,
                    message: '系统设置更新成功',
                    data: {
                        group: group,
                        settings: updatedGroupSettings,
                        updatedAt: new Date().toISOString(),
                        updatedCount: results.filter(function (result) { return result; }).length,
                        failedCount: failedUpdates
                    }
                });
                return [3 /*break*/, 5];
            case 4:
                error_2 = _f.sent();
                console.error('系统设置更新失败:', error_2);
                res.status(500).json({
                    success: false,
                    message: '系统设置更新失败',
                    error: error_2 instanceof Error ? error_2.message : '未知错误'
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// 安全监控路由
router.use('/security', security_routes_1["default"]);
// 系统功能路由
router.use('/system', system_routes_1["default"]);
// 招生任务路由
router.use('/enrollment-tasks', enrollment_tasks_routes_1["default"]);
// 消息模板路由
router.use('/message-templates', message_templates_routes_1["default"]);
// 性能监控路由
router.use('/performance', performance_routes_1["default"]);
// 性能评估路由
router.use('/performance/evaluations', performance_evaluations_routes_1["default"]);
// 性能报告路由
router.use('/performance/reports', performance_reports_routes_1["default"]);
// AI 相关路由 - 使用新的RAG功能路由，需要权限验证
router.use('/ai', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('/ai'), index_1["default"]);
// AI助手优化路由 - 三级分层处理，降低Token消耗
router.use('/ai-assistant-optimized', ai_assistant_optimized_routes_1["default"]);
// 六维记忆系统路由
var six_dimension_memory_routes_1 = __importDefault(require("./six-dimension-memory.routes"));
router.use('/ai/memory', six_dimension_memory_routes_1["default"]);
// AI视频生成路由
router.use('/ai/video', video_routes_1["default"]);
// 智能专家咨询路由
router.use('/ai/intelligent-consultation', smart_expert_routes_1["default"]);
// AI统计数据路由
router.use('/ai-stats', ai_stats_routes_1["default"]);
// AI查询功能路由 - 重新启用
router.use('/ai-query', ai_query_routes_1["default"]);
// AI分析功能路由 - 智能分析功能
router.use('/ai/analysis', ai_analysis_routes_1["default"]);
// AI快捷操作路由
router.use('/ai-shortcuts', ai_shortcuts_routes_1["default"]);
// AI自动配图路由
router.use('/auto-image', auto_image_routes_1["default"]);
// AI性能监控路由
router.use('/ai/performance', ai_performance_routes_1["default"]);
// 快捷查询分组路由
router.use('/quick-query-groups', quick_query_groups_routes_1["default"]);
// 文档导入功能路由
router.use('/document-import', document_import_routes_1["default"]);
// 数据导入路由
router.use('/data-import', data_import_routes_1["default"]);
// 批量导入路由
router.use('/batch-import', batch_import_routes_1["default"]);
// 字段模板路由
router.use('/field-templates', field_template_routes_1["default"]);
// 页面说明文档路由
router.use('/page-guides', page_guide_routes_1["default"]);
router.use('/page-guide-sections', page_guide_section_routes_1["default"]);
router.use('/ai-knowledge', ai_knowledge_routes_1["default"]);
// 网站自动化路由
router.use('/website-automation', websiteAutomation_1.websiteAutomationRouter);
// 旧AI路由（兼容性，使用不同路径）
// AI遗留路由已删除 - API优化，使用 /ai 替代
// 园长绩效路由
router.use('/principal/performance', principal_performance_routes_1["default"]);
// 活动策划路由
router.use('/activity-planner', activity_planner_1["default"]);
// 专家咨询路由
router.use('/expert-consultation', expert_consultation_1["default"]);
// 在线咨询路由
router.use('/chat', chat_routes_1["default"]);
// 重复的系统备份路由已删除 - API优化，使用 /system-backup 替代
// 示例路由 - 用于测试
router.use('/examples', example_routes_1["default"]);
// 错误收集路由
router.use('/errors', errors_routes_1["default"]);
// 财务管理路由
router.use('/finance', finance_routes_1["default"]);
// 招生财务联动路由
router.use('/enrollment-finance', enrollment_finance_routes_1["default"]);
// 注册AI路由 - 移除重复注册
// router.use('/api/v1/ai', aiMemoryRoutes);
// 扩展功能路径映射
router.use('/docs', system_routes_1["default"]);
// 测试路由挂载已删除 - API优化
router.use('/cache', system_routes_1["default"]);
router.use('/health', system_routes_1["default"]);
router.use('/version', system_routes_1["default"]);
// 注意：已移除模拟待办事项API，请使用 /todos 路由获取真实数据
// 客户管理路由已在上面注册，移除重复注册
// 仪表盘统计数据 - 使用不同前缀避免冲突
router.use('/dashboard-stats', dashboard_routes_1["default"]);
/**
 * @swagger
 * /enrollment-statistics:
 *   get:
 *     tags: [招生管理]
 *     summary: 获取招生统计数据（别名）
 *     description: 路径别名，转发到 enrollment/stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取招生统计数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: 未授权
 */
// 添加enrollment-statistics到enrollment/stats的路径别名
router.get('/enrollment-statistics', function (req, res, next) {
    // 将请求转发到enrollment/stats路由
    req.url = '/enrollment/stats';
    next();
});
// 添加 /enrollment/statistics 路由别名 - 为测试兼容性
router.use('/enrollment/statistics', enrollment_statistics_routes_1["default"]);
// API路径兼容性别名（解决前端调用路径不一致问题）
// 海报生成路由别名（兼容单数形式）
router.use('/poster-generation', poster_generation_routes_1["default"]);
// 海报管理路由别名（兼容前端 POSTER_ENDPOINTS）
router.use('/posters', poster_generation_routes_1["default"]);
// AI模型配置路由别名（兼容横线格式） - 重复注册，已删除
// router.use('/system-ai-models', systemAiModelsRoutes); // 已在第1101行注册
// 绩效管理路由别名（兼容横线格式）
router.use('/principal-performance', principal_performance_routes_1["default"]);
/**
 * @swagger
 * /principal/dashboard/overview:
 *   get:
 *     tags: [园长工作台]
 *     summary: 获取园长工作台概览
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取园长工作台概览
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取园长工作台概览成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: integer
 *                       description: 学生总数
 *                     totalTeachers:
 *                       type: integer
 *                       description: 教师总数
 *                     totalClasses:
 *                       type: integer
 *                       description: 班级总数
 *                     pendingApplications:
 *                       type: integer
 *                       description: 待处理申请数
 *       401:
 *         description: 未授权
 */
// 园长工作台概览
router.get('/principal/dashboard/overview', auth_middleware_1.verifyToken, function (req, res) {
    res.json({
        success: true,
        message: '获取园长工作台概览成功',
        data: {
            totalStudents: 1200,
            totalTeachers: 80,
            totalClasses: 24,
            pendingApplications: 15,
            monthlyRevenue: 2850000,
            occupancyRate: 0.92,
            satisfactionScore: 4.7,
            upcomingEvents: 8,
            urgentTasks: 3,
            recentAlerts: [
                { type: 'info', message: '新入学申请需要审批', time: '2小时前' },
                { type: 'warning', message: '班级人数即将达到上限', time: '1天前' }
            ]
        }
    });
});
/**
 * @swagger
 * /ai/memories/search:
 *   get:
 *     tags: [AI管理]
 *     summary: 搜索AI记忆
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: 用户ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 返回结果数量限制
 *     responses:
 *       200:
 *         description: 成功搜索AI记忆
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 搜索AI记忆成功
 *                 data:
 *                   type: array
 *                   description: 搜索结果列表
 *       401:
 *         description: 未授权
 */
// AI记忆搜索
router.get('/ai/memories/search', auth_middleware_1.verifyToken, function (req, res) {
    var _a = req.query, keyword = _a.keyword, userId = _a.userId, _b = _a.limit, limit = _b === void 0 ? 10 : _b;
    res.json({
        success: true,
        message: 'AI记忆搜索成功',
        data: {
            keyword: keyword,
            results: [
                {
                    id: 1,
                    content: "\u5173\u4E8E".concat(keyword, "\u7684\u5B66\u4E60\u8BB0\u5F55"),
                    similarity: 0.95,
                    timestamp: '2024-07-10',
                    source: 'conversation',
                    context: '教学讨论'
                },
                {
                    id: 2,
                    content: "".concat(keyword, "\u76F8\u5173\u7684\u7ECF\u9A8C\u5206\u4EAB"),
                    similarity: 0.87,
                    timestamp: '2024-07-08',
                    source: 'knowledge_base',
                    context: '知识库'
                }
            ],
            total: 2,
            searchTime: '0.05s'
        }
    });
});
/**
 * @swagger
 * /activity-evaluations/summary/{id}:
 *   get:
 *     tags: [活动管理]
 *     summary: 获取活动评估摘要
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 活动ID
 *     responses:
 *       200:
 *         description: 成功获取评估摘要
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取评估摘要成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     activityId:
 *                       type: integer
 *                       description: 活动ID
 *                     overallRating:
 *                       type: number
 *                       description: 总体评分
 *                     totalEvaluations:
 *                       type: integer
 *                       description: 评估总数
 *       401:
 *         description: 未授权
 */
// 活动计划系统缺失端点
router.get('/activity-evaluations/summary/:id', auth_middleware_1.verifyToken, function (req, res) {
    var id = req.params.id;
    res.json({
        success: true,
        message: '获取评估摘要成功',
        data: {
            activityId: parseInt(id),
            overallRating: 4.5,
            totalEvaluations: 25,
            satisfaction: {
                excellent: 15,
                good: 8,
                average: 2,
                poor: 0
            },
            keyInsights: [
                '活动组织有序，学生参与度高',
                '建议增加互动环节',
                '场地布置需要改进'
            ],
            recommendations: '继续保持高质量活动标准'
        }
    });
});
/**
 * @swagger
 * /activity-resources/availability:
 *   get:
 *     tags: [活动管理]
 *     summary: 获取活动资源可用性
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: 查询日期
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 资源类型
 *     responses:
 *       200:
 *         description: 成功获取资源可用性
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取资源可用性成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     availableResources:
 *                       type: array
 *                       description: 可用资源列表
 *       401:
 *         description: 未授权
 */
router.get('/activity-resources/availability', auth_middleware_1.verifyToken, function (req, res) {
    var _a = req.query, date = _a.date, type = _a.type;
    res.json({
        success: true,
        message: '获取资源可用性成功',
        data: {
            date: date,
            type: type,
            availableResources: [
                {
                    id: 1,
                    name: '多功能厅',
                    type: 'venue',
                    capacity: 100,
                    available: true,
                    timeSlots: ['09:00-11:00', '14:00-16:00']
                },
                {
                    id: 2,
                    name: '户外操场',
                    type: 'venue',
                    capacity: 200,
                    available: true,
                    timeSlots: ['全天']
                }
            ]
        }
    });
});
/**
 * @swagger
 * /activity-analytics/participation:
 *   get:
 *     tags: [活动管理]
 *     summary: 获取活动参与度分析
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: 统计周期
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: 年份
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         description: 月份
 *     responses:
 *       200:
 *         description: 成功获取参与度分析
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取参与度分析成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalActivities:
 *                       type: integer
 *                       description: 活动总数
 *                     averageParticipation:
 *                       type: number
 *                       description: 平均参与率
 *       401:
 *         description: 未授权
 */
router.get('/activity-analytics/participation', auth_middleware_1.verifyToken, function (req, res) {
    var _a = req.query, period = _a.period, year = _a.year, month = _a.month;
    res.json({
        success: true,
        message: '获取参与度分析成功',
        data: {
            period: period,
            totalActivities: 45,
            averageParticipation: 0.78,
            trends: [
                { date: '2024-07-01', rate: 0.75 },
                { date: '2024-07-08', rate: 0.82 },
                { date: '2024-07-15', rate: 0.79 }
            ],
            topActivities: [
                { name: '户外探索', participation: 0.95 },
                { name: '手工制作', participation: 0.88 }
            ]
        }
    });
});
/**
 * @swagger
 * /activity-analytics/effectiveness:
 *   get:
 *     tags: [活动管理]
 *     summary: 获取活动效果分析
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activityType
 *         schema:
 *           type: string
 *         description: 活动类型
 *     responses:
 *       200:
 *         description: 成功获取活动效果分析
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取活动效果分析成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     activityType:
 *                       type: string
 *                       description: 活动类型
 *                     effectiveness:
 *                       type: object
 *                       description: 效果评分
 *                     improvements:
 *                       type: array
 *                       description: 改进建议
 *       401:
 *         description: 未授权
 */
router.get('/activity-analytics/effectiveness', auth_middleware_1.verifyToken, function (req, res) {
    var activityType = req.query.activityType;
    res.json({
        success: true,
        message: '获取活动效果分析成功',
        data: {
            activityType: activityType,
            effectiveness: {
                engagement: 4.2,
                learning: 4.1,
                enjoyment: 4.6,
                overall: 4.3
            },
            improvements: [
                '增加动手实践环节',
                '优化活动时长',
                '加强师生互动'
            ],
            successFactors: [
                '活动内容丰富',
                '教师指导到位',
                '学生积极参与'
            ]
        }
    });
});
// 中心聚合API路由
router.use('/centers', centers_1["default"]);
// 权限设置路由
var setup_permissions_routes_1 = require("./setup-permissions.routes");
router.use('/setup', setup_permissions_routes_1.setupPermissionsRoutes);
// 视频制作路由 - 暂时注释掉，文件不存在
// import videoCreationRoutes from './video-creation.routes';
// router.use('/video-creation', videoCreationRoutes);
// AI智能分配路由
var ai_smart_assign_routes_1 = __importDefault(require("./ai-smart-assign.routes"));
router.use('/ai', ai_smart_assign_routes_1["default"]);
// 跟进质量分析路由
var followup_analysis_routes_1 = __importDefault(require("./followup-analysis.routes"));
router.use('/followup', followup_analysis_routes_1["default"]);
// 检查中心路由
var inspection_routes_1 = __importDefault(require("./inspection.routes"));
router.use('/inspection', inspection_routes_1["default"]);
// 机构现状路由
var organization_status_routes_1 = __importDefault(require("./organization-status.routes"));
router.use('/organization-status', organization_status_routes_1["default"]);
// 数据库元数据路由
var database_metadata_routes_1 = __importDefault(require("./database-metadata.routes"));
router.use('/database', database_metadata_routes_1["default"]);
exports["default"] = router; // Trigger reload
