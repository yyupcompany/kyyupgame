"use strict";
/**
 * 快捷查询分组服务
 * 提供分组的查询关键词，支持 /查询 命令的快捷选择功能
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
exports.__esModule = true;
exports.quickQueryGroupsService = exports.QuickQueryGroupsService = void 0;
var logger_1 = require("../../utils/logger");
var QuickQueryGroupsService = /** @class */ (function () {
    function QuickQueryGroupsService() {
        this.queryGroups = [];
        this.initializeQueryGroups();
    }
    QuickQueryGroupsService.getInstance = function () {
        if (!QuickQueryGroupsService.instance) {
            QuickQueryGroupsService.instance = new QuickQueryGroupsService();
        }
        return QuickQueryGroupsService.instance;
    };
    /**
     * 初始化查询分组
     */
    QuickQueryGroupsService.prototype.initializeQueryGroups = function () {
        this.queryGroups = [
            {
                id: 'personnel',
                name: '👥 人员管理',
                icon: 'user',
                description: '学生、教师、家长相关查询',
                queries: [
                    { keyword: '学生总数', description: '查询当前在校学生总数', tokens: 10, category: 'count' },
                    { keyword: '教师总数', description: '查询在职教师总数', tokens: 10, category: 'count' },
                    { keyword: '家长总数', description: '查询注册家长总数', tokens: 10, category: 'count' },
                    { keyword: '班级总数', description: '查询活跃班级总数', tokens: 10, category: 'count' },
                    { keyword: '男女学生比例', description: '统计男女学生比例分布', tokens: 25, category: 'analysis' },
                    { keyword: '各班级学生人数分布', description: '查看各班级学生人数分布情况', tokens: 30, category: 'analysis' },
                    { keyword: '新生人数', description: '统计新入学学生数量', tokens: 15, category: 'count' },
                    { keyword: '在职教师', description: '查询在职教师信息', tokens: 15, category: 'list' },
                    { keyword: '教师出勤率', description: '分析教师出勤率统计', tokens: 20, category: 'analysis' },
                    { keyword: '学生列表', description: '跳转到学生管理页面', tokens: 5, category: 'navigation' }
                ]
            },
            {
                id: 'activities',
                name: '🎯 活动管理',
                icon: 'calendar',
                description: '活动安排、参与、评价相关查询',
                queries: [
                    { keyword: '今日活动', description: '查询今天的活动安排', tokens: 15, category: 'schedule' },
                    { keyword: '活动列表', description: '查看所有活动列表', tokens: 15, category: 'list' },
                    { keyword: '本周活动安排', description: '查询本周活动安排', tokens: 25, category: 'schedule' },
                    { keyword: '本月活动统计', description: '统计本月活动数据', tokens: 25, category: 'analysis' },
                    { keyword: '活动参与率', description: '统计活动参与率', tokens: 25, category: 'analysis' },
                    { keyword: '活动报名人数', description: '统计活动报名人数', tokens: 20, category: 'count' },
                    { keyword: '进行中活动', description: '查询正在进行的活动', tokens: 20, category: 'list' },
                    { keyword: '即将开始活动', description: '查询即将开始的活动', tokens: 20, category: 'list' },
                    { keyword: '活动完成率', description: '分析活动完成率', tokens: 25, category: 'analysis' },
                    { keyword: '哪些班级的出勤率最高', description: '查询出勤率最高的班级', tokens: 25, category: 'ranking' }
                ]
            },
            {
                id: 'enrollment',
                name: '📝 招生管理',
                icon: 'document',
                description: '招生计划、申请、统计相关查询',
                queries: [
                    { keyword: '招生统计', description: '查询招生统计数据', tokens: 20, category: 'analysis' },
                    { keyword: '本月招生人数', description: '查询本月招生人数', tokens: 25, category: 'count' },
                    { keyword: '今日招生人数', description: '查询今日招生人数', tokens: 20, category: 'count' },
                    { keyword: '本年招生总数', description: '查询本年招生总数', tokens: 25, category: 'count' },
                    { keyword: '招生申请数量', description: '统计招生申请数量', tokens: 20, category: 'count' },
                    { keyword: '待审核招生', description: '查询待审核招生申请', tokens: 20, category: 'list' },
                    { keyword: '已通过招生', description: '统计已通过招生数量', tokens: 20, category: 'count' },
                    { keyword: '招生转化率', description: '分析招生转化率', tokens: 25, category: 'analysis' },
                    { keyword: '年度招生趋势', description: '分析年度招生趋势', tokens: 30, category: 'trend' },
                    { keyword: '招生计划', description: '跳转到招生计划页面', tokens: 5, category: 'navigation' }
                ]
            },
            {
                id: 'finance',
                name: '💰 财务管理',
                icon: 'money',
                description: '收费、支出、财务统计相关查询',
                queries: [
                    { keyword: '费用统计', description: '查询费用统计数据', tokens: 20, category: 'analysis' },
                    { keyword: '收费总额', description: '统计收费总额', tokens: 20, category: 'count' },
                    { keyword: '本月收入', description: '查询本月收入情况', tokens: 20, category: 'count' },
                    { keyword: '缴费率', description: '分析缴费率统计', tokens: 20, category: 'analysis' },
                    { keyword: '收费统计', description: '查询收费统计数据', tokens: 20, category: 'analysis' },
                    { keyword: '班级容量', description: '查询班级容量信息', tokens: 20, category: 'info' },
                    { keyword: '空余学位', description: '统计空余学位数量', tokens: 20, category: 'count' },
                    { keyword: '财务中心', description: '跳转到财务中心', tokens: 5, category: 'navigation' },
                    { keyword: '本月报告', description: '生成本月数据报告', tokens: 30, category: 'report' },
                    { keyword: '年度总结', description: '生成年度总结报告', tokens: 35, category: 'report' }
                ]
            },
            {
                id: 'system',
                name: '⚙️ 系统管理',
                icon: 'setting',
                description: '系统状态、用户、权限相关查询',
                queries: [
                    { keyword: '系统状态', description: '查询系统运行状态', tokens: 15, category: 'status' },
                    { keyword: '用户总数', description: '查询系统用户总数', tokens: 10, category: 'count' },
                    { keyword: '用户列表', description: '跳转到用户管理页面', tokens: 5, category: 'navigation' },
                    { keyword: '角色管理', description: '跳转到角色管理页面', tokens: 5, category: 'navigation' },
                    { keyword: '权限设置', description: '跳转到权限设置页面', tokens: 5, category: 'navigation' },
                    { keyword: '操作日志', description: '跳转到操作日志页面', tokens: 5, category: 'navigation' },
                    { keyword: '系统设置', description: '跳转到系统设置页面', tokens: 5, category: 'navigation' },
                    { keyword: '文件统计', description: '查询文件统计信息', tokens: 15, category: 'analysis' },
                    { keyword: '存储空间', description: '查询存储空间使用情况', tokens: 15, category: 'status' },
                    { keyword: '系统使用率', description: '分析系统使用率', tokens: 20, category: 'analysis' }
                ]
            },
            {
                id: 'reports',
                name: '📊 数据报表',
                icon: 'chart',
                description: '各类数据分析和报表生成',
                queries: [
                    { keyword: '数据概览', description: '生成数据概览报告', tokens: 30, category: 'overview' },
                    { keyword: '运营指标', description: '分析运营指标', tokens: 30, category: 'analysis' },
                    { keyword: '关键数据', description: '汇总关键数据', tokens: 25, category: 'summary' },
                    { keyword: '绩效统计', description: '查询绩效统计', tokens: 15, category: 'analysis' },
                    { keyword: '绩效报告', description: '生成绩效报告', tokens: 15, category: 'report' },
                    { keyword: '教师工作量', description: '分析教师工作量', tokens: 25, category: 'analysis' },
                    { keyword: '家长反馈统计', description: '统计家长反馈数据', tokens: 25, category: 'analysis' },
                    { keyword: '教师满意度', description: '查询教师满意度调查', tokens: 25, category: 'analysis' },
                    { keyword: '报表中心', description: '跳转到报表中心', tokens: 5, category: 'navigation' },
                    { keyword: '数据分析', description: '跳转到数据分析页面', tokens: 5, category: 'navigation' }
                ]
            }
        ];
        logger_1.logger.info("[\u5FEB\u6377\u67E5\u8BE2\u5206\u7EC4] \u521D\u59CB\u5316\u5B8C\u6210\uFF0C\u5171 ".concat(this.queryGroups.length, " \u4E2A\u5206\u7EC4\uFF0C").concat(this.getTotalQueriesCount(), " \u4E2A\u67E5\u8BE2"));
    };
    /**
     * 获取所有查询分组
     */
    QuickQueryGroupsService.prototype.getAllGroups = function () {
        return this.queryGroups;
    };
    /**
     * 根据分组ID获取查询分组
     */
    QuickQueryGroupsService.prototype.getGroupById = function (groupId) {
        return this.queryGroups.find(function (group) { return group.id === groupId; }) || null;
    };
    /**
     * 搜索查询关键词
     */
    QuickQueryGroupsService.prototype.searchQueries = function (keyword) {
        var results = [];
        var searchTerm = keyword.toLowerCase();
        this.queryGroups.forEach(function (group) {
            group.queries.forEach(function (query) {
                if (query.keyword.toLowerCase().includes(searchTerm) ||
                    query.description.toLowerCase().includes(searchTerm)) {
                    results.push(__assign(__assign({}, query), { category: group.name }));
                }
            });
        });
        return results;
    };
    /**
     * 获取分组概览信息
     */
    QuickQueryGroupsService.prototype.getGroupsOverview = function () {
        return this.queryGroups.map(function (group) { return ({
            id: group.id,
            name: group.name,
            icon: group.icon,
            description: group.description,
            queryCount: group.queries.length
        }); });
    };
    /**
     * 获取总查询数量
     */
    QuickQueryGroupsService.prototype.getTotalQueriesCount = function () {
        return this.queryGroups.reduce(function (total, group) { return total + group.queries.length; }, 0);
    };
    /**
     * 根据类别筛选查询
     */
    QuickQueryGroupsService.prototype.getQueriesByCategory = function (category) {
        var results = [];
        this.queryGroups.forEach(function (group) {
            group.queries.forEach(function (query) {
                if (query.category === category) {
                    results.push(__assign(__assign({}, query), { category: group.name }));
                }
            });
        });
        return results;
    };
    return QuickQueryGroupsService;
}());
exports.QuickQueryGroupsService = QuickQueryGroupsService;
// 导出单例实例
exports.quickQueryGroupsService = QuickQueryGroupsService.getInstance();
