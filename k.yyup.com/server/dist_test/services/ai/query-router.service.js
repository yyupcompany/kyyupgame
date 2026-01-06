"use strict";
/**
 * AI助手查询路由器服务
 * 使用任务复杂度分析工具智能路由查询到合适的处理级别
 * 目标：降低Token消耗，提升响应速度和准确性
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.queryRouterService = exports.QueryRouterService = exports.ProcessingLevel = void 0;
var logger_1 = require("../../utils/logger");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var analyze_task_complexity_tool_1 = __importDefault(require("./tools/workflow/analyze-task-complexity.tool"));
// 处理级别枚举
var ProcessingLevel;
(function (ProcessingLevel) {
    ProcessingLevel["DIRECT"] = "direct";
    ProcessingLevel["SEMANTIC"] = "semantic";
    ProcessingLevel["COMPLEX"] = "complex"; // 第三级：大模型深度分析 (500-2000 tokens, 3-10秒)
})(ProcessingLevel = exports.ProcessingLevel || (exports.ProcessingLevel = {}));
/**
 * 查询路由器服务
 */
var QueryRouterService = /** @class */ (function () {
    function QueryRouterService() {
        this.complexityThreshold = 0.5; // 复杂度阈值
        // 工具调用关键词 - 这些关键词表示需要调用工具的查询
        // 注意：不包含"查询"、"查看"等可能与快速查询冲突的词汇
        this.toolCallKeywords = [
            '导航', '跳转', '打开', '进入', '访问', '切换',
            '页面', '界面', '菜单', '模块', '功能',
            '设置', '配置', '管理', '操作', '执行',
            '显示', '展示', '列表', '详情'
        ];
        this.initializeKeywordDictionary();
        this.loadExternalDictionary();
    }
    /**
     * 初始化关键词词典
     */
    QueryRouterService.prototype.initializeKeywordDictionary = function () {
        this.keywordDictionary = {
            // 动作词典
            actions: {
                create: ['添加', '新增', '创建', '新建', '录入', '注册'],
                read: ['查询', '查看', '显示', '列表', '查找', '搜索', '获取'],
                update: ['修改', '更新', '编辑', '变更', '调整'],
                "delete": ['删除', '移除', '清除', '取消'],
                count: ['统计', '总数', '数量', '多少', '计算', '汇总'],
                analyze: ['分析', '评估', '报告', '趋势', '预测'],
                navigate: ['跳转', '打开', '进入', '访问', '导航']
            },
            // 实体词典
            entities: {
                student: ['学生', '小朋友', '孩子', '幼儿', '儿童'],
                teacher: ['教师', '老师', '班主任', '教职工', '员工'],
                "class": ['班级', '班', '年级', '小班', '中班', '大班'],
                activity: ['活动', '课程', '游戏', '项目', '课堂'],
                parent: ['家长', '父母', '监护人'],
                attendance: ['考勤', '出勤', '签到', '到校'],
                fee: ['费用', '学费', '收费', '缴费', '账单'],
                schedule: ['课表', '时间表', '安排', '计划'],
                health: ['健康', '体检', '疫苗', '身高', '体重'],
                enrollment: ['招生', '报名', '入学', '注册']
            },
            // 修饰词典
            modifiers: {
                time: ['今天', '昨天', '明天', '本周', '本月', '今年'],
                status: ['已完成', '进行中', '未开始', '已取消'],
                age: ['3岁', '4岁', '5岁', '6岁'],
                gender: ['男', '女', '男孩', '女孩']
            },
            // 直接匹配词典 - 高频简单查询
            directMatches: {
                '学生总数': {
                    response: '正在查询学生总数...',
                    action: 'count_students',
                    tokens: 10
                },
                '多少学生': {
                    response: '正在查询学生总数...',
                    action: 'count_students',
                    tokens: 10
                },
                '学生数量': {
                    response: '正在查询学生总数...',
                    action: 'count_students',
                    tokens: 10
                },
                '当前学生': {
                    response: '正在查询学生总数...',
                    action: 'count_students',
                    tokens: 10
                },
                '今天有多少学生': {
                    response: '正在查询今日在校学生数...',
                    action: 'get_attendance_stats',
                    tokens: 15
                },
                '学生在校': {
                    response: '正在查询在校学生数...',
                    action: 'count_students',
                    tokens: 10
                },
                '在校学生': {
                    response: '正在查询在校学生数...',
                    action: 'count_students',
                    tokens: 10
                },
                '教师总数': {
                    response: '正在查询教师总数...',
                    action: 'count_teachers',
                    tokens: 10
                },
                '今日活动': {
                    response: '正在查询今日活动安排...',
                    action: 'get_today_activities',
                    tokens: 15
                },
                // 🎯 新增：活动创建工作流关键词
                '策划一个活动': {
                    response: '正在启动活动创建工作流...',
                    action: 'create_activity_workflow',
                    tokens: 50
                },
                '创建活动': {
                    response: '正在启动活动创建工作流...',
                    action: 'create_activity_workflow',
                    tokens: 50
                },
                '新建活动': {
                    response: '正在启动活动创建工作流...',
                    action: 'create_activity_workflow',
                    tokens: 50
                },
                '活动策划': {
                    response: '正在启动活动创建工作流...',
                    action: 'create_activity_workflow',
                    tokens: 50
                },
                '考勤统计': {
                    response: '正在查询考勤统计数据...',
                    action: 'get_attendance_stats',
                    tokens: 20
                },
                '费用统计': {
                    response: '正在查询费用统计数据...',
                    action: 'get_fee_stats',
                    tokens: 20
                },
                '活动列表': {
                    response: '正在查询活动列表...',
                    action: 'get_activity_list',
                    tokens: 15
                },
                // === 数据统计查询（已移除所有导航功能，只保留数据查询）===
                '家长总数': {
                    response: '正在查询家长总数...',
                    action: 'count_parents',
                    tokens: 10
                },
                '班级总数': {
                    response: '正在查询班级总数...',
                    action: 'count_classes',
                    tokens: 10
                },
                '招生统计': {
                    response: '正在查询招生统计数据...',
                    action: 'get_enrollment_stats',
                    tokens: 20
                },
                '用户总数': {
                    response: '正在查询用户总数...',
                    action: 'count_users',
                    tokens: 10
                },
                '客户统计': {
                    response: '正在查询客户统计数据...',
                    action: 'get_customer_stats',
                    tokens: 15
                },
                '系统状态': {
                    response: '正在查询系统状态...',
                    action: 'get_system_status',
                    tokens: 15
                },
                '绩效统计': {
                    response: '正在查询绩效统计...',
                    action: 'get_performance_stats',
                    tokens: 15
                },
                '绩效报告': {
                    response: '正在生成绩效报告...',
                    action: 'get_performance_report',
                    tokens: 15
                },
                '教师绩效': {
                    response: '正在查询教师绩效...',
                    action: 'get_teacher_performance',
                    tokens: 15
                },
                // === 通知消息模块（已移除导航功能）===
                '通知统计': {
                    response: '正在查询通知统计...',
                    action: 'get_notification_stats',
                    tokens: 15
                },
                '未读消息': {
                    response: '正在查询未读消息...',
                    action: 'get_unread_messages',
                    tokens: 15
                },
                // === 文件管理模块（已移除导航功能）===
                '文件统计': {
                    response: '正在查询文件统计...',
                    action: 'get_file_stats',
                    tokens: 15
                },
                '存储空间': {
                    response: '正在查询存储空间...',
                    action: 'get_storage_stats',
                    tokens: 15
                },
                // === 任务管理模块（已移除导航功能）===
                '任务统计': {
                    response: '正在查询任务统计...',
                    action: 'get_task_stats',
                    tokens: 15
                },
                '我的任务': {
                    response: '正在查询我的任务...',
                    action: 'get_my_tasks',
                    tokens: 15
                },
                // === 测试扩展词汇 - 数据统计类 ===
                '本月招生数据': {
                    response: '正在查询本月招生数据...',
                    action: 'get_monthly_enrollment_data',
                    tokens: 25
                },
                '本月招生人数': {
                    response: '正在查询本月招生人数...',
                    action: 'get_monthly_enrollment_data',
                    tokens: 25
                },
                '学生人数统计': {
                    response: '正在统计学生人数分布...',
                    action: 'get_student_count_stats',
                    tokens: 20
                },
                '教师工作量': {
                    response: '正在分析教师工作量...',
                    action: 'get_teacher_workload_stats',
                    tokens: 25
                },
                '活动参与率': {
                    response: '正在统计活动参与率...',
                    action: 'get_activity_participation_stats',
                    tokens: 25
                },
                '收费统计': {
                    response: '正在查询收费统计数据...',
                    action: 'get_fee_statistics',
                    tokens: 20
                },
                '班级人数分布': {
                    response: '正在分析班级人数分布...',
                    action: 'get_class_size_distribution',
                    tokens: 25
                },
                '年度招生趋势': {
                    response: '正在分析年度招生趋势...',
                    action: 'get_annual_enrollment_trends',
                    tokens: 30
                },
                '教师满意度': {
                    response: '正在查询教师满意度调查...',
                    action: 'get_teacher_satisfaction_stats',
                    tokens: 25
                },
                '家长反馈统计': {
                    response: '正在统计家长反馈数据...',
                    action: 'get_parent_feedback_stats',
                    tokens: 25
                },
                '系统使用率': {
                    response: '正在分析系统使用率...',
                    action: 'get_system_usage_stats',
                    tokens: 20
                },
                // === 扩展词汇 - 招生相关（时间+数量组合）===
                '今日招生人数': {
                    response: '正在查询今日招生人数...',
                    action: 'get_daily_enrollment_data',
                    tokens: 20
                },
                '本周招生数量': {
                    response: '正在统计本周招生数量...',
                    action: 'get_weekly_enrollment_data',
                    tokens: 25
                },
                '本年招生总数': {
                    response: '正在查询本年招生总数...',
                    action: 'get_yearly_enrollment_data',
                    tokens: 25
                },
                '招生申请数量': {
                    response: '正在统计招生申请数量...',
                    action: 'get_enrollment_application_count',
                    tokens: 20
                },
                '待审核招生': {
                    response: '正在查询待审核招生申请...',
                    action: 'get_pending_enrollment_data',
                    tokens: 20
                },
                '已通过招生': {
                    response: '正在统计已通过招生数量...',
                    action: 'get_approved_enrollment_data',
                    tokens: 20
                },
                '招生转化率': {
                    response: '正在分析招生转化率...',
                    action: 'get_enrollment_conversion_rate',
                    tokens: 25
                },
                '报名成功数': {
                    response: '正在统计报名成功数量...',
                    action: 'get_successful_enrollment_count',
                    tokens: 20
                },
                // === 扩展词汇 - 活动相关（时间+数量组合）===
                '今日活动数量': {
                    response: '正在查询今日活动数量...',
                    action: 'get_daily_activity_count',
                    tokens: 20
                },
                '本周活动安排': {
                    response: '正在查询本周活动安排...',
                    action: 'get_weekly_activity_schedule',
                    tokens: 25
                },
                '本月活动统计': {
                    response: '正在统计本月活动数据...',
                    action: 'get_monthly_activity_stats',
                    tokens: 25
                },
                '活动报名人数': {
                    response: '正在统计活动报名人数...',
                    action: 'get_activity_registration_count',
                    tokens: 20
                },
                '活动签到数量': {
                    response: '正在查询活动签到数量...',
                    action: 'get_activity_checkin_count',
                    tokens: 20
                },
                '进行中活动': {
                    response: '正在查询进行中的活动...',
                    action: 'get_ongoing_activities',
                    tokens: 20
                },
                '即将开始活动': {
                    response: '正在查询即将开始的活动...',
                    action: 'get_upcoming_activities',
                    tokens: 20
                },
                '活动完成率': {
                    response: '正在分析活动完成率...',
                    action: 'get_activity_completion_rate',
                    tokens: 25
                },
                // === 扩展词汇 - 学生相关（数量统计）===
                '在校学生数': {
                    response: '正在查询在校学生数量...',
                    action: 'get_active_student_count',
                    tokens: 15
                },
                '在校生多少': {
                    response: '正在查询在校学生数量...',
                    action: 'get_active_student_count',
                    tokens: 15
                },
                '在校生数量': {
                    response: '正在查询在校学生数量...',
                    action: 'get_active_student_count',
                    tokens: 15
                },
                '在院学生': {
                    response: '正在查询在院学生数量...',
                    action: 'get_active_student_count',
                    tokens: 15
                },
                '在院生多少': {
                    response: '正在查询在院学生数量...',
                    action: 'get_active_student_count',
                    tokens: 15
                },
                '在园学生': {
                    response: '正在查询在园学生数量...',
                    action: 'get_active_student_count',
                    tokens: 15
                },
                '在园生多少': {
                    response: '正在查询在园学生数量...',
                    action: 'get_active_student_count',
                    tokens: 15
                },
                '在园幼儿': {
                    response: '正在查询在园幼儿数量...',
                    action: 'get_active_student_count',
                    tokens: 15
                },
                '在园幼儿数': {
                    response: '正在查询在园幼儿数量...',
                    action: 'get_active_student_count',
                    tokens: 15
                },
                '男生人数': {
                    response: '正在统计男生人数...',
                    action: 'get_male_student_count',
                    tokens: 15
                },
                '女生人数': {
                    response: '正在统计女生人数...',
                    action: 'get_female_student_count',
                    tokens: 15
                },
                '新生人数': {
                    response: '正在统计新生人数...',
                    action: 'get_new_student_count',
                    tokens: 15
                },
                '毕业生数量': {
                    response: '正在统计毕业生数量...',
                    action: 'get_graduate_count',
                    tokens: 15
                },
                // === 扩展词汇 - 时间维度查询 ===
                '今日数据': {
                    response: '正在汇总今日数据...',
                    action: 'get_daily_summary',
                    tokens: 20
                },
                '本周统计': {
                    response: '正在生成本周统计报告...',
                    action: 'get_weekly_summary',
                    tokens: 25
                },
                '本月报告': {
                    response: '正在生成本月数据报告...',
                    action: 'get_monthly_summary',
                    tokens: 30
                },
                '年度总结': {
                    response: '正在生成年度总结报告...',
                    action: 'get_yearly_summary',
                    tokens: 35
                },
                // === 扩展词汇 - 教师相关 ===
                '在职教师': {
                    response: '正在查询在职教师数量...',
                    action: 'get_active_teacher_count',
                    tokens: 15
                },
                '教师出勤率': {
                    response: '正在分析教师出勤率...',
                    action: 'get_teacher_attendance_rate',
                    tokens: 20
                },
                // === 扩展词汇 - 班级相关 ===
                '班级容量': {
                    response: '正在查询班级容量信息...',
                    action: 'get_class_capacity',
                    tokens: 20
                },
                '空余学位': {
                    response: '正在统计空余学位数量...',
                    action: 'get_available_seats',
                    tokens: 20
                },
                // === 扩展词汇 - 财务相关 ===
                '收费总额': {
                    response: '正在统计收费总额...',
                    action: 'get_total_revenue',
                    tokens: 20
                },
                '本月收入': {
                    response: '正在查询本月收入情况...',
                    action: 'get_monthly_revenue',
                    tokens: 20
                },
                '缴费率': {
                    response: '正在分析缴费率...',
                    action: 'get_payment_rate',
                    tokens: 20
                },
                // === 扩展词汇 - 综合查询 ===
                '数据概览': {
                    response: '正在生成数据概览...',
                    action: 'get_data_overview',
                    tokens: 30
                },
                '运营指标': {
                    response: '正在分析运营指标...',
                    action: 'get_operation_metrics',
                    tokens: 30
                },
                '关键数据': {
                    response: '正在汇总关键数据...',
                    action: 'get_key_metrics',
                    tokens: 25
                },
                // === 测试扩展词汇 - 操作类（已移除所有导航功能）===
                '批量导入学生': {
                    response: '正在准备学生信息批量导入...',
                    action: 'batch_import_students',
                    tokens: 15
                },
                '生成月度报告': {
                    response: '正在生成月度报告...',
                    action: 'generate_monthly_report',
                    tokens: 20
                },
                '发送家长通知': {
                    response: '正在准备发送家长通知...',
                    action: 'send_parent_notifications',
                    tokens: 15
                },
                '备份数据': {
                    response: '正在执行数据备份...',
                    action: 'backup_system_data',
                    tokens: 15
                },
                '清理缓存': {
                    response: '正在清理系统缓存...',
                    action: 'clear_system_cache',
                    tokens: 10
                },
                '导出学生名单': {
                    response: '正在导出学生名单...',
                    action: 'export_student_list',
                    tokens: 15
                },
                '重置密码': {
                    response: '正在准备密码重置操作...',
                    action: 'reset_user_passwords',
                    tokens: 15
                },
                // === 测试扩展词汇 - 查询类 ===
                '今日课程安排': {
                    response: '正在查询今日课程安排...',
                    action: 'get_today_schedule',
                    tokens: 15
                },
                '请假申请列表': {
                    response: '正在查询请假申请列表...',
                    action: 'get_leave_applications',
                    tokens: 15
                },
                '待审核事项': {
                    response: '正在查询待审核事项...',
                    action: 'get_pending_approvals',
                    tokens: 15
                },
                '最新公告': {
                    response: '正在查询最新公告...',
                    action: 'get_latest_announcements',
                    tokens: 15
                },
                '系统更新日志': {
                    response: '正在查询系统更新日志...',
                    action: 'get_system_update_logs',
                    tokens: 15
                }
            }
        };
    };
    /**
     * 加载外部字典文件
     */
    QueryRouterService.prototype.loadExternalDictionary = function () {
        try {
            var dictionariesPath = path.join(__dirname, '../../config/ai-dictionaries');
            // 加载所有字典文件
            var dictionaryFiles = [
                '01-basic-queries.json',
                '01-time-params.json',
                '02-activity-attendance.json',
                '02-table-fields.json',
                '03-operations.json',
                '04-aggregations.json',
                '05-query-templates.json'
            ];
            var totalRules = 0;
            for (var _i = 0, dictionaryFiles_1 = dictionaryFiles; _i < dictionaryFiles_1.length; _i++) {
                var fileName = dictionaryFiles_1[_i];
                var filePath = path.join(dictionariesPath, fileName);
                if (fs.existsSync(filePath)) {
                    var dictionary = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    // 根据文件类型处理不同的字典结构
                    if (fileName === '05-query-templates.json' && dictionary.queryTemplates) {
                        // 查询模板字典 - 直接合并到directMatches
                        var filteredTemplates = Object.entries(dictionary.queryTemplates)
                            .filter(function (_a) {
                            var key = _a[0];
                            return !key.startsWith('//');
                        })
                            .reduce(function (acc, _a) {
                            var key = _a[0], value = _a[1];
                            var valueObj = value;
                            // 🔧 [Fix] 尊重已设置的动作，如果没有设置则默认为execute_sql_query
                            var action = valueObj.action || 'execute_sql_query';
                            var response = valueObj.response || "\u6B63\u5728\u6267\u884C\u67E5\u8BE2: ".concat(key, "...");
                            acc[key] = {
                                response: response,
                                action: action,
                                tokens: valueObj.tokens || 20,
                                sql: valueObj.sql,
                                description: valueObj.description
                            };
                            return acc;
                        }, {});
                        this.keywordDictionary.directMatches = __assign(__assign({}, this.keywordDictionary.directMatches), filteredTemplates);
                        totalRules += Object.keys(filteredTemplates).length;
                        logger_1.logger.info("[AI\u67E5\u8BE2\u8DEF\u7531] \u52A0\u8F7D\u67E5\u8BE2\u6A21\u677F\u5B57\u5178: ".concat(Object.keys(filteredTemplates).length, " \u4E2A\u89C4\u5219"));
                    }
                    // 🔧 [Fix] 处理基础查询和活动考勤字典
                    else if ((fileName === '01-basic-queries.json' || fileName === '02-activity-attendance.json') && dictionary.directMatches) {
                        // 基础查询字典 - 直接合并到directMatches
                        var filteredMatches = Object.entries(dictionary.directMatches)
                            .filter(function (_a) {
                            var key = _a[0];
                            return !key.startsWith('//');
                        })
                            .reduce(function (acc, _a) {
                            var key = _a[0], value = _a[1];
                            acc[key] = value;
                            return acc;
                        }, {});
                        this.keywordDictionary.directMatches = __assign(__assign({}, this.keywordDictionary.directMatches), filteredMatches);
                        totalRules += Object.keys(filteredMatches).length;
                        logger_1.logger.info("[AI\u67E5\u8BE2\u8DEF\u7531] \u52A0\u8F7D".concat(dictionary.name || fileName, ": ").concat(Object.keys(filteredMatches).length, " \u4E2A\u89C4\u5219"));
                    }
                    // 其他字典文件可以在这里扩展处理
                    // 例如时间参数、表字段映射等
                }
                else {
                    logger_1.logger.warn("[AI\u67E5\u8BE2\u8DEF\u7531] \u5B57\u5178\u6587\u4EF6\u4E0D\u5B58\u5728: ".concat(filePath));
                }
            }
            logger_1.logger.info("[AI\u67E5\u8BE2\u8DEF\u7531] \u6210\u529F\u52A0\u8F7D\u5916\u90E8\u5B57\u5178\uFF0C\u5171 ".concat(Object.keys(this.keywordDictionary.directMatches).length, " \u4E2A\u76F4\u63A5\u5339\u914D\u89C4\u5219 (\u65B0\u589E ").concat(totalRules, " \u4E2A)"));
        }
        catch (error) {
            logger_1.logger.error("[AI\u67E5\u8BE2\u8DEF\u7531] \u52A0\u8F7D\u5916\u90E8\u5B57\u5178\u5931\u8D25:", error);
        }
    };
    /**
     * 路由查询到合适的处理级别
     * 使用任务复杂度分析工具智能判断
     * @param query 用户查询
     * @returns 路由结果
     */
    QueryRouterService.prototype.routeQuery = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, complexityResult, level, estimatedTokens, processingTime, error_1, processingTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        logger_1.logger.info('🔍 [查询路由] 开始分析查询', { query: query });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, analyze_task_complexity_tool_1["default"].implementation({
                                userInput: query,
                                context: ''
                            })];
                    case 2:
                        complexityResult = _a.sent();
                        logger_1.logger.info('🧠 [任务复杂度分析] 分析结果', {
                            complexityLevel: complexityResult.result.complexityLevel,
                            complexityScore: complexityResult.result.complexityScore,
                            suggestedApproach: complexityResult.result.suggestedApproach,
                            estimatedSteps: complexityResult.result.estimatedSteps
                        });
                        level = void 0;
                        estimatedTokens = void 0;
                        if (complexityResult.result.suggestedApproach === 'direct') {
                            // 简单查询 → DIRECT级别（快速响应）
                            level = ProcessingLevel.DIRECT;
                            estimatedTokens = 0;
                            logger_1.logger.info('📍 [查询路由] 路由到DIRECT级别（简单查询）', { query: query });
                        }
                        else {
                            // guided_steps, workflow, workflow_with_subtasks → COMPLEX级别（完整AI）
                            level = ProcessingLevel.COMPLEX;
                            estimatedTokens = 2000;
                            logger_1.logger.info('📍 [查询路由] 路由到COMPLEX级别（复杂查询）', {
                                query: query,
                                approach: complexityResult.result.suggestedApproach
                            });
                        }
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                level: level,
                                confidence: Math.min(complexityResult.result.complexityScore / 5.0, 1.0),
                                matchedKeywords: [],
                                estimatedTokens: estimatedTokens,
                                processingTime: processingTime
                            }];
                    case 3:
                        error_1 = _a.sent();
                        // 兜底：如果分析失败，默认路由到COMPLEX级别
                        logger_1.logger.error('❌ [查询路由] 任务复杂度分析失败，默认路由到COMPLEX级别', { error: error_1 });
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                level: ProcessingLevel.COMPLEX,
                                confidence: 1.0,
                                matchedKeywords: [],
                                estimatedTokens: 2000,
                                processingTime: processingTime
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查直接匹配
     */
    QueryRouterService.prototype.checkDirectMatch = function (query) {
        var normalizedQuery = query.trim().toLowerCase();
        // 🎯 优先检测UI渲染关键词 - 如果包含UI渲染关键词，返回null，让查询路由到工具调用级别
        // 这个检测必须在精确匹配和模糊匹配之前执行，否则会被"班级列表"等规则拦截
        var uiRenderKeywords = ['用表格', '用图表', '用柱状图', '用折线图', '用饼图', '用卡片', '表格显示', '图表显示', '卡片显示'];
        if (this.containsKeywords(normalizedQuery, uiRenderKeywords)) {
            logger_1.logger.info('🎨 [直接匹配] 检测到UI渲染关键词，跳过直接匹配，路由到工具调用级别', { query: normalizedQuery });
            return null; // 返回null，让查询继续路由到工具调用级别
        }
        // 🎯 检测数据查询关键词 - 如果包含"查询"+"数据实体"，返回null，让查询路由到工具调用级别
        // 例如："查询所有班级信息"、"查询学生数据"等
        var queryKeywords = ['查询', '查看', '获取', '统计', '分析'];
        var entityKeywords = ['班级', '学生', '教师', '家长', '活动', '招生', '考勤', '费用'];
        if (this.containsKeywords(normalizedQuery, queryKeywords) && this.containsKeywords(normalizedQuery, entityKeywords)) {
            logger_1.logger.info('🔍 [直接匹配] 检测到数据查询关键词，跳过直接匹配，路由到工具调用级别', { query: normalizedQuery });
            return null; // 返回null，让查询继续路由到工具调用级别
        }
        // 精确匹配
        for (var _i = 0, _a = Object.entries(this.keywordDictionary.directMatches); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (normalizedQuery === key.toLowerCase()) {
                return value;
            }
        }
        // 模糊匹配
        for (var _c = 0, _d = Object.entries(this.keywordDictionary.directMatches); _c < _d.length; _c++) {
            var _e = _d[_c], key = _e[0], value = _e[1];
            if (normalizedQuery.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedQuery)) {
                return value;
            }
        }
        // 🎯 智能关键词匹配 - 基于业务领域的关键词组合
        var smartMatches = this.checkSmartKeywordMatch(normalizedQuery);
        if (smartMatches) {
            return smartMatches;
        }
        return null;
    };
    // 智能关键词匹配 - 基于业务领域识别
    QueryRouterService.prototype.checkSmartKeywordMatch = function (query) {
        // 🎯 优先检测UI渲染关键词 - 如果包含UI渲染关键词，返回null，让查询路由到工具调用级别
        // UI渲染关键词来自工具组配置：tool-groups.config.ts -> uiDisplay.keywords
        var uiRenderKeywords = ['用表格', '用图表', '用柱状图', '用折线图', '用饼图', '用卡片', '表格显示', '图表显示', '卡片显示'];
        if (this.containsKeywords(query, uiRenderKeywords)) {
            logger_1.logger.info('🎨 [智能匹配] 检测到UI渲染关键词，跳过直接匹配，路由到工具调用级别', { query: query });
            return null; // 返回null，让查询继续路由到工具调用级别
        }
        // 招生相关查询
        if (this.containsKeywords(query, ['招生']) &&
            this.containsKeywords(query, ['查询', '查看', '统计', '数据', '情况', '人数', '多少'])) {
            return {
                response: '正在查询招生统计数据...',
                action: 'get_enrollment_stats',
                tokens: 20
            };
        }
        // 学生相关查询 - 修复：确保响应包含"学生"和"总数"关键词
        if (this.containsKeywords(query, ['学生']) &&
            this.containsKeywords(query, ['查询', '查看', '统计', '数据', '情况', '人数', '多少', '总数'])) {
            return {
                response: '正在查询学生总数...',
                action: 'get_student_stats',
                tokens: 20
            };
        }
        // 活动相关查询
        if (this.containsKeywords(query, ['活动']) &&
            this.containsKeywords(query, ['查询', '查看', '统计', '数据', '情况', '列表'])) {
            return {
                response: '正在查询活动统计数据...',
                action: 'get_activity_stats',
                tokens: 20
            };
        }
        return null;
    };
    /**
     * 检查查询是否包含指定关键词组中的任意一个
     */
    QueryRouterService.prototype.containsKeywords = function (query, keywords) {
        return keywords.some(function (keyword) { return query.includes(keyword); });
    };
    /**
     * 分析语义复杂度
     */
    QueryRouterService.prototype.analyzeSemanticComplexity = function (query) {
        var words = query.toLowerCase().split(/\s+/);
        var matchedKeywords = [];
        var actionCount = 0;
        var entityCount = 0;
        var modifierCount = 0;
        var _loop_1 = function (word) {
            // 检查动作词
            for (var _a = 0, _b = Object.entries(this_1.keywordDictionary.actions); _a < _b.length; _a++) {
                var _c = _b[_a], actionType = _c[0], keywords = _c[1];
                if (keywords.some(function (keyword) { return word.includes(keyword) || keyword.includes(word); })) {
                    matchedKeywords.push("action:".concat(actionType));
                    actionCount++;
                    break;
                }
            }
            // 检查实体词
            for (var _d = 0, _e = Object.entries(this_1.keywordDictionary.entities); _d < _e.length; _d++) {
                var _f = _e[_d], entityType = _f[0], keywords = _f[1];
                if (keywords.some(function (keyword) { return word.includes(keyword) || keyword.includes(word); })) {
                    matchedKeywords.push("entity:".concat(entityType));
                    entityCount++;
                    break;
                }
            }
            // 检查修饰词
            for (var _g = 0, _h = Object.entries(this_1.keywordDictionary.modifiers); _g < _h.length; _g++) {
                var _j = _h[_g], modifierType = _j[0], keywords = _j[1];
                if (keywords.some(function (keyword) { return word.includes(keyword) || keyword.includes(word); })) {
                    matchedKeywords.push("modifier:".concat(modifierType));
                    modifierCount++;
                    break;
                }
            }
        };
        var this_1 = this;
        // 统计匹配的关键词
        for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
            var word = words_1[_i];
            _loop_1(word);
        }
        // 计算复杂度
        var complexity = 0;
        // 基础复杂度：查询长度
        complexity += Math.min(words.length / 20, 0.3);
        // 动作复杂度
        if (actionCount === 0)
            complexity += 0.3; // 没有明确动作
        if (actionCount > 1)
            complexity += 0.2; // 多个动作
        // 实体复杂度
        if (entityCount === 0)
            complexity += 0.2; // 没有明确实体
        if (entityCount > 2)
            complexity += 0.2; // 多个实体
        // 修饰词复杂度
        if (modifierCount > 2)
            complexity += 0.1; // 过多修饰
        // 特殊复杂度指标
        if (query.includes('分析') || query.includes('报告') || query.includes('建议')) {
            complexity += 0.4;
        }
        if (query.includes('比较') || query.includes('对比') || query.includes('趋势')) {
            complexity += 0.3;
        }
        if (query.includes('为什么') || query.includes('如何') || query.includes('怎么')) {
            complexity += 0.2;
        }
        // 估算Token消耗
        var estimatedTokens = 100; // 基础Token
        estimatedTokens += words.length * 5; // 查询长度
        estimatedTokens += matchedKeywords.length * 20; // 匹配关键词
        estimatedTokens += complexity * 500; // 复杂度影响
        return {
            complexity: Math.min(complexity, 1.0),
            matchedKeywords: __spreadArray([], new Set(matchedKeywords), true),
            estimatedTokens: Math.round(estimatedTokens)
        };
    };
    /**
     * 获取统计信息
     */
    QueryRouterService.prototype.getStats = function () {
        return {
            directMatchCount: Object.keys(this.keywordDictionary.directMatches).length,
            keywordCount: Object.values(this.keywordDictionary.actions).flat().length +
                Object.values(this.keywordDictionary.entities).flat().length +
                Object.values(this.keywordDictionary.modifiers).flat().length,
            complexityThreshold: this.complexityThreshold
        };
    };
    return QueryRouterService;
}());
exports.QueryRouterService = QueryRouterService;
// 导出服务实例
exports.queryRouterService = new QueryRouterService();
