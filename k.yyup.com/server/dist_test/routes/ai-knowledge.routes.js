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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var express_1 = require("express");
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/ai-knowledge/by-page/{pagePath}:
 *   get:
 *     summary: 根据页面路径获取AI知识库文档
 *     description: 根据页面路径获取对应的AI知识库文档
 *     tags:
 *       - AI知识库
 *     parameters:
 *       - in: path
 *         name: pagePath
 *         required: true
 *         schema:
 *           type: string
 *         description: 页面路径
 *     responses:
 *       200:
 *         description: 获取成功
 *       400:
 *         description: 请求参数错误
 */
router.get('/by-page/:pagePath', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var pagePath, decodedPath_1, pathToCategoryMap, categories, placeholders, query, rows, pageGuide, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                pagePath = req.params.pagePath;
                if (!pagePath) {
                    res.status(400).json({
                        success: false,
                        message: '页面路径不能为空'
                    });
                    return [2 /*return*/];
                }
                decodedPath_1 = decodeURIComponent(pagePath);
                console.log('🔍 查找AI知识库文档，页面路径:', decodedPath_1);
                pathToCategoryMap = {
                    // 原有的 /centers/ 路径映射
                    '/centers/finance': ['finance_center', 'finance_operations', 'finance_reports', 'finance_data_structure'],
                    '/centers/script': ['script_center', 'script_templates', 'script_statistics', 'script_scenarios'],
                    '/centers/personnel': ['personnel_management', 'employee_records', 'payroll_management', 'attendance_system'],
                    '/centers/activity': ['activity_management', 'activity_planning', 'activity_execution', 'activity_evaluation'],
                    '/centers/enrollment': ['enrollment_management', 'application_processing', 'interview_assessment', 'admission_decision'],
                    '/centers/marketing': ['marketing_management', 'campaign_marketing', 'advertising_promotion', 'brand_building'],
                    '/centers/ai': ['ai_center_management', 'ai_model_management', 'ai_data_analytics', 'intelligent_dialogue'],
                    '/principal/media-center': ['media_center', 'content_creation', 'media_templates', 'media_management'],
                    '/centers/customer-pool': ['customer_pool_center', 'customer_management', 'followup_system', 'customer_analytics'],
                    '/dashboard': ['dashboard_overview', 'dashboard_statistics', 'dashboard_navigation', 'dashboard_management'],
                    '/centers/task': ['task_center_management', 'task_planning', 'task_execution', 'task_tracking'],
                    '/centers/system': ['system_center_management', 'system_configuration', 'system_monitoring', 'system_maintenance'],
                    '/centers/business': ['business_center_management', 'business_operations', 'business_analytics', 'business_optimization'],
                    '/centers/teaching': ['teaching_center_management', 'curriculum_planning', 'teaching_resources', 'learning_assessment'],
                    '/centers/media': ['media_center', 'content_creation', 'media_templates', 'media_management'],
                    '/centers/inspection': ['inspection_center_management', 'inspection_planning', 'inspection_execution', 'document_management'],
                    // 新增：前端实际使用的中心页面路径映射
                    '/teacher-center': ['personnel_management', 'employee_records', 'payroll_management', 'attendance_system', 'teaching_center_management', 'curriculum_planning', 'teaching_resources', 'learning_assessment'],
                    '/teacher-center/dashboard': ['personnel_management', 'teaching_center_management'],
                    '/teacher-center/creative-curriculum': ['curriculum_planning', 'teaching_resources'],
                    '/teacher-center/teaching-plan': ['curriculum_planning', 'teaching_resources'],
                    '/teacher-center/class-management': ['teaching_center_management', 'learning_assessment'],
                    '/teacher-center/student-management': ['learning_assessment', 'teaching_resources'],
                    '/teacher-center/performance': ['personnel_management', 'employee_records'],
                    '/teacher-center/enrollment': ['enrollment_management', 'application_processing'],
                    '/teacher-center/customers': ['customer_pool_center', 'customer_management'],
                    '/teacher-center/workspace': ['teaching_center_management', 'teaching_resources'],
                    '/teacher-center/communication': ['teaching_center_management'],
                    '/teacher-center/resources': ['teaching_resources', 'media_center'],
                    '/teacher-center/schedule': ['teaching_center_management', 'curriculum_planning'],
                    '/inspection-center': ['inspection_center_management', 'inspection_planning', 'inspection_execution', 'document_management'],
                    '/inspection-center/document-templates': ['document_management', 'inspection_planning'],
                    '/inspection-center/document-instances': ['document_management', 'inspection_execution'],
                    '/inspection-center/inspection-types': ['inspection_center_management'],
                    '/inspection-center/inspection-plans': ['inspection_planning'],
                    '/inspection-center/inspection-tasks': ['inspection_execution'],
                    '/inspection-center/document-statistics': ['inspection_center_management', 'document_management'],
                    '/activity-center': ['activity_management', 'activity_planning', 'activity_execution', 'activity_evaluation'],
                    '/activity-center/list': ['activity_management'],
                    '/activity-center/create': ['activity_planning'],
                    '/activity-center/calendar': ['activity_execution'],
                    '/activity-center/registration': ['activity_execution'],
                    '/activity-center/evaluation': ['activity_evaluation'],
                    '/activity-center/reports': ['activity_management', 'activity_evaluation'],
                    '/activity-center/analysis': ['activity_management', 'activity_evaluation'],
                    '/enrollment-center': ['enrollment_management', 'application_processing', 'interview_assessment', 'admission_decision'],
                    '/enrollment-center/plans': ['enrollment_management'],
                    '/enrollment-center/applications': ['application_processing'],
                    '/enrollment-center/interviews': ['interview_assessment'],
                    '/enrollment-center/admissions': ['admission_decision'],
                    '/enrollment-center/statistics': ['enrollment_management'],
                    '/enrollment-center/reports': ['enrollment_management', 'admission_decision'],
                    '/marketing-center': ['marketing_management', 'campaign_marketing', 'advertising_promotion', 'brand_building'],
                    '/marketing-center/campaigns': ['campaign_marketing'],
                    '/marketing-center/advertisements': ['advertising_promotion'],
                    '/marketing-center/referrals': ['marketing_management'],
                    '/marketing-center/analytics': ['marketing_management', 'campaign_marketing'],
                    '/marketing-center/social-media': ['advertising_promotion', 'brand_building'],
                    '/marketing-center/promotions': ['campaign_marketing', 'brand_building'],
                    '/parent-center': ['customer_pool_center', 'customer_management', 'followup_system', 'customer_analytics'],
                    '/parent-center/dashboard': ['customer_pool_center'],
                    '/parent-center/students': ['customer_management'],
                    '/parent-center/communication': ['followup_system'],
                    '/parent-center/activities': ['activity_management'],
                    '/parent-center/fees': ['finance_center', 'finance_operations'],
                    '/parent-center/schedule': ['teaching_center_management'],
                    '/parent-center/reports': ['customer_analytics', 'followup_system'],
                    '/finance-center': ['finance_center', 'finance_operations', 'finance_reports', 'finance_data_structure'],
                    '/finance-center/overview': ['finance_center', 'finance_reports'],
                    '/finance-center/tuition': ['finance_operations'],
                    '/finance-center/payments': ['finance_operations'],
                    '/finance-center/refunds': ['finance_operations'],
                    '/finance-center/scholarships': ['finance_operations'],
                    '/finance-center/invoicing': ['finance_operations', 'finance_reports'],
                    '/finance-center/reports': ['finance_reports'],
                    '/finance-center/analytics': ['finance_center', 'finance_analytics']
                };
                categories = pathToCategoryMap[decodedPath_1];
                if (!categories || categories.length === 0) {
                    console.log('📝 页面暂无AI知识库文档:', decodedPath_1);
                    // 返回成功响应但无数据，避免前端404错误
                    res.json({
                        success: true,
                        data: {
                            id: "ai-empty-".concat(decodedPath_1.replace(/\//g, '-')),
                            pagePath: decodedPath_1,
                            pageName: getPageName(decodedPath_1),
                            pageDescription: "".concat(getPageName(decodedPath_1), "\u7684AI\u667A\u80FD\u52A9\u624B\u77E5\u8BC6\u5E93\uFF0C\u6B63\u5728\u5EFA\u8BBE\u4E2D"),
                            category: 'ai_knowledge',
                            importance: 0,
                            relatedTables: [],
                            contextPrompt: "\u5F53\u524D\u9875\u9762\u662F".concat(getPageName(decodedPath_1), "\uFF0C\u76F8\u5173AI\u77E5\u8BC6\u5E93\u6B63\u5728\u5EFA\u8BBE\u4E2D"),
                            sections: [],
                            isActive: false,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            message: '该页面的AI知识库正在建设中，请稍后再试'
                        }
                    });
                    return [2 /*return*/];
                }
                placeholders = categories.map(function () { return '?'; }).join(',');
                query = "\n      SELECT id, category, title, content, metadata, created_at, updated_at\n      FROM ai_knowledge_base \n      WHERE category IN (".concat(placeholders, ")\n      ORDER BY \n        FIELD(category, ").concat(categories.map(function () { return '?'; }).join(','), "),\n        created_at ASC\n    ");
                return [4 /*yield*/, init_1.sequelize.query(query, {
                        replacements: __spreadArray(__spreadArray([], categories, true), categories, true),
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                rows = _a.sent();
                if (Array.isArray(rows) && rows.length > 0) {
                    pageGuide = {
                        id: "ai-".concat(decodedPath_1.replace(/\//g, '-')),
                        pagePath: decodedPath_1,
                        pageName: getPageName(decodedPath_1),
                        pageDescription: "".concat(getPageName(decodedPath_1), "\u7684AI\u667A\u80FD\u52A9\u624B\u77E5\u8BC6\u5E93\uFF0C\u63D0\u4F9B\u4E13\u4E1A\u7684\u529F\u80FD\u6307\u5BFC\u548C\u64CD\u4F5C\u5EFA\u8BAE"),
                        category: 'ai_knowledge',
                        importance: 1,
                        relatedTables: [],
                        contextPrompt: "\u5F53\u524D\u9875\u9762\u662F".concat(getPageName(decodedPath_1), "\uFF0C\u7528\u6237\u53EF\u4EE5\u5728\u8FD9\u91CC\u8FDB\u884C\u76F8\u5173\u7684\u7BA1\u7406\u64CD\u4F5C"),
                        sections: rows.map(function (row, index) { return ({
                            id: "section-".concat(row.id),
                            sectionName: row.title,
                            sectionDescription: row.content,
                            sectionPath: decodedPath_1,
                            features: [],
                            sortOrder: index + 1,
                            category: row.category,
                            metadata: row.metadata,
                            // 兼容AI知识库格式
                            title: row.title,
                            content: row.content
                        }); }),
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    console.log('✅ AI知识库文档查询成功:', pageGuide.pageName, "(".concat(rows.length, "\u4E2A\u6587\u6863)"));
                    res.json({
                        success: true,
                        data: pageGuide
                    });
                }
                else {
                    console.log('📝 未找到对应的AI知识库文档:', decodedPath_1);
                    res.status(404).json({
                        success: false,
                        message: '未找到对应的AI知识库文档'
                    });
                }
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('❌ 查询AI知识库文档失败:', error_1);
                res.status(500).json({
                    success: false,
                    message: '查询AI知识库文档失败',
                    error: error_1.message
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/ai-knowledge:
 *   get:
 *     summary: 获取所有AI知识库文档
 *     description: 获取所有AI知识库文档列表
 *     tags:
 *       - AI知识库
 *     responses:
 *       200:
 *         description: 获取成功
 *       500:
 *         description: 服务器错误
 */
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT id, category, title, LENGTH(content) as content_length, \n             JSON_EXTRACT(metadata, '$.keywords') as keywords,\n             created_at, updated_at\n      FROM ai_knowledge_base \n      ORDER BY category, created_at ASC\n    ", { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                rows = _a.sent();
                res.json({
                    success: true,
                    data: rows
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('❌ 获取AI知识库文档列表失败:', error_2);
                res.status(500).json({
                    success: false,
                    message: '获取AI知识库文档列表失败',
                    error: error_2.message
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/ai-knowledge/category/{category}:
 *   get:
 *     summary: 根据分类获取AI知识库文档
 *     description: 根据分类获取对应的AI知识库文档列表
 *     tags:
 *       - AI知识库
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: 知识库分类
 *     responses:
 *       200:
 *         description: 获取成功
 *       500:
 *         description: 服务器错误
 */
router.get('/category/:category', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var category, rows, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                category = req.params.category;
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT id, category, title, content, metadata, created_at, updated_at\n      FROM ai_knowledge_base \n      WHERE category = ?\n      ORDER BY created_at ASC\n    ", {
                        replacements: [category],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                rows = _a.sent();
                res.json({
                    success: true,
                    data: rows
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('❌ 根据分类查询AI知识库文档失败:', error_3);
                res.status(500).json({
                    success: false,
                    message: '根据分类查询AI知识库文档失败',
                    error: error_3.message
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * 根据页面路径获取页面名称
 */
function getPageName(path) {
    var pathNameMap = {
        '/centers/finance': '财务中心',
        '/centers/script': '话术中心',
        '/centers/personnel': '人事中心',
        '/centers/activity': '活动中心',
        '/centers/enrollment': '招生中心',
        '/centers/marketing': '营销中心',
        '/centers/ai': 'AI中心',
        '/principal/media-center': '媒体中心',
        '/centers/customer-pool': '客户池中心',
        '/dashboard': 'Dashboard综合工作台',
        '/centers/inspection': '督查中心'
    };
    return pathNameMap[path] || path;
}
exports["default"] = router;
