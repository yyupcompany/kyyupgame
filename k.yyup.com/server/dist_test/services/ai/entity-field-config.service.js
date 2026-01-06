"use strict";
/**
 * 实体字段配置服务
 *
 * 功能：
 * 1. 定义每个实体的字段配置
 * 2. 区分自动填充字段、必填字段、可选字段
 * 3. 提供字段验证和提示信息
 */
exports.__esModule = true;
exports.entityFieldConfigService = void 0;
var EntityFieldConfigService = /** @class */ (function () {
    function EntityFieldConfigService() {
        this.configs = new Map();
        this.initializeConfigs();
    }
    /**
     * 初始化所有实体的字段配置
     */
    EntityFieldConfigService.prototype.initializeConfigs = function () {
        // 学生实体
        this.configs.set('students', {
            entityName: 'students',
            displayName: '学生',
            fields: [
                { name: 'name', label: '姓名', type: 'string', required: true, autoFill: false, placeholder: '请输入学生姓名' },
                { name: 'gender', label: '性别', type: 'enum', required: true, autoFill: false, enumValues: [
                        { value: 'male', label: '男' },
                        { value: 'female', label: '女' }
                    ] },
                { name: 'birth_date', label: '出生日期', type: 'date', required: true, autoFill: false },
                { name: 'class_id', label: '班级', type: 'number', required: false, autoFill: false, description: '可选，可以稍后分配' },
                { name: 'parent_id', label: '家长', type: 'number', required: false, autoFill: false },
                { name: 'kindergarten_id', label: '幼儿园ID', type: 'number', required: true, autoFill: true },
                { name: 'enrollment_officer_id', label: '录入人', type: 'number', required: true, autoFill: true },
                { name: 'created_by', label: '创建人', type: 'number', required: true, autoFill: true },
                { name: 'updated_by', label: '更新人', type: 'number', required: true, autoFill: true }
            ]
        });
        // 教师实体
        this.configs.set('teachers', {
            entityName: 'teachers',
            displayName: '教师',
            fields: [
                { name: 'name', label: '姓名', type: 'string', required: true, autoFill: false, placeholder: '请输入教师姓名' },
                { name: 'gender', label: '性别', type: 'enum', required: true, autoFill: false, enumValues: [
                        { value: 'male', label: '男' },
                        { value: 'female', label: '女' }
                    ] },
                { name: 'phone', label: '手机号', type: 'string', required: true, autoFill: false, placeholder: '请输入手机号' },
                { name: 'email', label: '邮箱', type: 'string', required: false, autoFill: false },
                { name: 'subject', label: '任教科目', type: 'string', required: false, autoFill: false },
                { name: 'kindergarten_id', label: '幼儿园ID', type: 'number', required: true, autoFill: true },
                { name: 'created_by', label: '创建人', type: 'number', required: true, autoFill: true },
                { name: 'updated_by', label: '更新人', type: 'number', required: true, autoFill: true }
            ]
        });
        // 班级实体
        this.configs.set('classes', {
            entityName: 'classes',
            displayName: '班级',
            fields: [
                { name: 'name', label: '班级名称', type: 'string', required: true, autoFill: false, placeholder: '例如：小班A' },
                { name: 'code', label: '班级编号', type: 'string', required: false, autoFill: false, placeholder: '例如：XB-001' },
                { name: 'type', label: '班级类型', type: 'enum', required: true, autoFill: false, enumValues: [
                        { value: 1, label: '小班' },
                        { value: 2, label: '中班' },
                        { value: 3, label: '大班' }
                    ] },
                { name: 'grade', label: '年级', type: 'string', required: true, autoFill: false, enumValues: [
                        { value: '小班', label: '小班' },
                        { value: '中班', label: '中班' },
                        { value: '大班', label: '大班' }
                    ] },
                { name: 'head_teacher_id', label: '班主任', type: 'number', required: true, autoFill: false, description: '请选择班主任' },
                { name: 'capacity', label: '班级容量', type: 'number', required: false, autoFill: false, placeholder: '例如：30' },
                { name: 'kindergarten_id', label: '幼儿园ID', type: 'number', required: true, autoFill: true },
                { name: 'created_by', label: '创建人', type: 'number', required: true, autoFill: true },
                { name: 'updated_by', label: '更新人', type: 'number', required: true, autoFill: true }
            ]
        });
        // 活动实体
        this.configs.set('activities', {
            entityName: 'activities',
            displayName: '活动',
            fields: [
                { name: 'title', label: '活动标题', type: 'string', required: true, autoFill: false, placeholder: '请输入活动标题' },
                { name: 'description', label: '活动描述', type: 'string', required: false, autoFill: false },
                { name: 'start_time', label: '开始时间', type: 'date', required: true, autoFill: false },
                { name: 'end_time', label: '结束时间', type: 'date', required: true, autoFill: false },
                { name: 'location', label: '活动地点', type: 'string', required: false, autoFill: false },
                { name: 'organizer_id', label: '组织者', type: 'number', required: true, autoFill: true },
                { name: 'status', label: '状态', type: 'string', required: true, autoFill: true },
                { name: 'kindergarten_id', label: '幼儿园ID', type: 'number', required: true, autoFill: true },
                { name: 'created_by', label: '创建人', type: 'number', required: true, autoFill: true },
                { name: 'updated_by', label: '更新人', type: 'number', required: true, autoFill: true }
            ]
        });
        // 待办事项实体
        this.configs.set('todos', {
            entityName: 'todos',
            displayName: '待办事项',
            fields: [
                { name: 'title', label: '标题', type: 'string', required: true, autoFill: false, placeholder: '请输入待办事项标题' },
                { name: 'description', label: '描述', type: 'string', required: false, autoFill: false },
                { name: 'due_date', label: '截止日期', type: 'date', required: false, autoFill: false },
                { name: 'priority', label: '优先级', type: 'enum', required: false, autoFill: false, enumValues: [
                        { value: 'low', label: '低' },
                        { value: 'medium', label: '中' },
                        { value: 'high', label: '高' }
                    ] },
                { name: 'assignee_id', label: '负责人', type: 'number', required: true, autoFill: true },
                { name: 'status', label: '状态', type: 'string', required: true, autoFill: true },
                { name: 'kindergarten_id', label: '幼儿园ID', type: 'number', required: true, autoFill: true },
                { name: 'created_by', label: '创建人', type: 'number', required: true, autoFill: true },
                { name: 'updated_by', label: '更新人', type: 'number', required: true, autoFill: true }
            ]
        });
        // 用户实体
        this.configs.set('users', {
            entityName: 'users',
            displayName: '用户',
            fields: [
                { name: 'username', label: '用户名', type: 'string', required: true, autoFill: false, placeholder: '请输入用户名' },
                { name: 'password', label: '密码', type: 'string', required: true, autoFill: false, placeholder: '请输入密码' },
                { name: 'email', label: '邮箱', type: 'string', required: true, autoFill: false, placeholder: '请输入邮箱' },
                { name: 'real_name', label: '真实姓名', type: 'string', required: true, autoFill: false },
                { name: 'phone', label: '手机号', type: 'string', required: false, autoFill: false },
                { name: 'status', label: '状态', type: 'string', required: true, autoFill: true },
                { name: 'kindergarten_id', label: '幼儿园ID', type: 'number', required: true, autoFill: true },
                { name: 'created_by', label: '创建人', type: 'number', required: true, autoFill: true },
                { name: 'updated_by', label: '更新人', type: 'number', required: true, autoFill: true }
            ]
        });
    };
    /**
     * 获取实体的字段配置
     */
    EntityFieldConfigService.prototype.getEntityConfig = function (entityName) {
        return this.configs.get(entityName) || null;
    };
    /**
     * 获取必填字段列表
     */
    EntityFieldConfigService.prototype.getRequiredFields = function (entityName) {
        var config = this.configs.get(entityName);
        if (!config)
            return [];
        return config.fields.filter(function (f) { return f.required && !f.autoFill; });
    };
    /**
     * 获取自动填充字段列表
     */
    EntityFieldConfigService.prototype.getAutoFillFields = function (entityName) {
        var config = this.configs.get(entityName);
        if (!config)
            return [];
        return config.fields.filter(function (f) { return f.autoFill; });
    };
    /**
     * 检测缺失的必填字段
     */
    EntityFieldConfigService.prototype.getMissingRequiredFields = function (entityName, data) {
        var requiredFields = this.getRequiredFields(entityName);
        return requiredFields.filter(function (field) {
            var value = data[field.name];
            return value === undefined || value === null || value === '';
        });
    };
    /**
     * 验证字段值
     */
    EntityFieldConfigService.prototype.validateField = function (field, value) {
        if (field.required && (value === undefined || value === null || value === '')) {
            return { valid: false, message: "".concat(field.label, "\u662F\u5FC5\u586B\u9879") };
        }
        if (field.validation) {
            var _a = field.validation, min = _a.min, max = _a.max, pattern = _a.pattern, message = _a.message;
            if (min !== undefined && typeof value === 'number' && value < min) {
                return { valid: false, message: message || "".concat(field.label, "\u4E0D\u80FD\u5C0F\u4E8E").concat(min) };
            }
            if (max !== undefined && typeof value === 'number' && value > max) {
                return { valid: false, message: message || "".concat(field.label, "\u4E0D\u80FD\u5927\u4E8E").concat(max) };
            }
            if (pattern && typeof value === 'string' && !new RegExp(pattern).test(value)) {
                return { valid: false, message: message || "".concat(field.label, "\u683C\u5F0F\u4E0D\u6B63\u786E") };
            }
        }
        return { valid: true };
    };
    /**
     * 获取所有支持的实体名称
     */
    EntityFieldConfigService.prototype.getSupportedEntities = function () {
        return Array.from(this.configs.keys());
    };
    return EntityFieldConfigService;
}());
exports.entityFieldConfigService = new EntityFieldConfigService();
