"use strict";
/**
 * 用户上下文提供者服务
 *
 * 功能：
 * 1. 自动注入用户上下文字段（user_id, kindergarten_id等）
 * 2. 提供当前登录用户的完整信息
 * 3. 支持不同实体的上下文字段映射
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
exports.userContextProviderService = void 0;
var UserContextProviderService = /** @class */ (function () {
    function UserContextProviderService() {
    }
    /**
     * 获取自动填充字段
     * @param userData 用户数据
     * @param entityName 实体名称
     * @returns 自动填充的字段对象
     */
    UserContextProviderService.prototype.getAutoFillFields = function (userData, entityName) {
        var baseFields = {
            created_by: userData.userId,
            updated_by: userData.userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        // 根据实体类型添加特定字段
        var entitySpecificFields = this.getEntitySpecificFields(userData, entityName);
        return __assign(__assign({}, baseFields), entitySpecificFields);
    };
    /**
     * 获取实体特定的自动填充字段
     * @param userData 用户数据
     * @param entityName 实体名称
     * @returns 实体特定的字段
     */
    UserContextProviderService.prototype.getEntitySpecificFields = function (userData, entityName) {
        var fields = {};
        // 大部分实体都需要 kindergarten_id
        var entitiesNeedingKindergarten = [
            'students', 'teachers', 'classes', 'activities',
            'parents', 'enrollments', 'todos'
        ];
        if (entitiesNeedingKindergarten.includes(entityName)) {
            fields.kindergarten_id = userData.kindergartenId;
        }
        // 特定实体的额外字段
        switch (entityName) {
            case 'students':
                // 学生记录可能需要录入人信息
                fields.enrollment_officer_id = userData.userId;
                break;
            case 'teachers':
                // 教师记录
                break;
            case 'classes':
                // 班级记录
                break;
            case 'activities':
                // 活动记录 - 创建者作为负责人
                fields.organizer_id = userData.userId;
                fields.status = 'draft'; // 默认草稿状态
                break;
            case 'todos':
                // 待办事项 - 创建者作为负责人
                fields.assignee_id = userData.userId;
                fields.status = 'pending'; // 默认待处理状态
                break;
            case 'enrollments':
                // 招生申请 - 录入人
                fields.enrollment_officer_id = userData.userId;
                fields.status = 'pending'; // 默认待处理状态
                break;
            case 'users':
                // 用户记录 - 继承创建者的幼儿园
                fields.kindergarten_id = userData.kindergartenId;
                fields.status = 'active'; // 默认激活状态
                break;
        }
        return fields;
    };
    /**
     * 合并用户数据和自动填充字段
     * @param userData 用户数据
     * @param entityName 实体名称
     * @param inputData 用户输入的数据
     * @returns 合并后的完整数据
     */
    UserContextProviderService.prototype.mergeWithAutoFillFields = function (userData, entityName, inputData) {
        var autoFillFields = this.getAutoFillFields(userData, entityName);
        // 用户输入的数据优先级更高，不覆盖用户明确提供的字段
        return __assign(__assign({}, autoFillFields), inputData);
    };
    /**
     * 获取自动填充字段列表（用于前端显示）
     * @param entityName 实体名称
     * @returns 自动填充字段名称列表
     */
    UserContextProviderService.prototype.getAutoFillFieldNames = function (entityName) {
        var baseFields = ['created_by', 'updated_by', 'created_at', 'updated_at'];
        var entitiesNeedingKindergarten = [
            'students', 'teachers', 'classes', 'activities',
            'parents', 'enrollments', 'todos'
        ];
        var fields = __spreadArray([], baseFields, true);
        if (entitiesNeedingKindergarten.includes(entityName)) {
            fields.push('kindergarten_id');
        }
        // 特定实体的额外字段
        switch (entityName) {
            case 'students':
                fields.push('enrollment_officer_id');
                break;
            case 'activities':
                fields.push('organizer_id', 'status');
                break;
            case 'todos':
                fields.push('assignee_id', 'status');
                break;
            case 'enrollments':
                fields.push('enrollment_officer_id', 'status');
                break;
            case 'users':
                fields.push('status');
                break;
        }
        return fields;
    };
    /**
     * 从请求对象中提取用户上下文
     * @param req Express请求对象
     * @returns 用户上下文数据
     */
    UserContextProviderService.prototype.extractUserContextFromRequest = function (req) {
        if (!req.user) {
            console.warn('⚠️ [用户上下文] 请求中没有用户信息');
            return null;
        }
        return {
            userId: req.user.id,
            username: req.user.username,
            kindergartenId: req.user.kindergartenId || 1,
            role: req.user.role,
            isAdmin: req.user.isAdmin || false,
            email: req.user.email,
            realName: req.user.realName
        };
    };
    /**
     * 验证用户上下文是否完整
     * @param userData 用户上下文数据
     * @returns 是否有效
     */
    UserContextProviderService.prototype.isValidUserContext = function (userData) {
        if (!userData)
            return false;
        return !!(userData.userId &&
            userData.username &&
            userData.kindergartenId);
    };
    return UserContextProviderService;
}());
exports.userContextProviderService = new UserContextProviderService();
