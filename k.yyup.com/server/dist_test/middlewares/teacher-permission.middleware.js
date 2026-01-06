"use strict";
/**
 * 教师权限过滤中间件
 * 为教师角色提供数据访问权限控制
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
exports.getTeacherParticipatingActivities = exports.getTeacherAssignedCustomers = exports.canTeacherManageActivity = exports.canTeacherEditCustomer = exports.filterActivitiesForTeacher = exports.filterCustomerPoolForTeacher = exports.checkTeacherRole = void 0;
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
/**
 * 检查用户是否为教师角色，并获取教师ID
 */
var checkTeacherRole = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userRole, teacherQuery, teacherId, error_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                if (!userId) {
                    return [2 /*return*/, next()];
                }
                console.log('🏫 检查教师权限:', { userId: userId, userRole: userRole });
                // 初始化教师过滤器
                req.teacherFilter = {
                    isTeacher: false,
                    userId: userId,
                    canViewAll: false
                };
                if (!(userRole === 'teacher')) return [3 /*break*/, 2];
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM teachers WHERE user_id = ? AND deleted_at IS NULL', {
                        replacements: [userId],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                teacherQuery = _c.sent();
                if (teacherQuery && teacherQuery.length > 0) {
                    teacherId = teacherQuery[0].id;
                    req.teacherFilter = {
                        isTeacher: true,
                        teacherId: teacherId,
                        userId: userId,
                        canViewAll: false
                    };
                    console.log('✅ 确认教师身份:', { teacherId: teacherId, userId: userId });
                }
                else {
                    console.log('⚠️ 教师角色但未找到教师记录:', userId);
                }
                return [3 /*break*/, 3];
            case 2:
                if (userRole === 'admin' || userRole === 'super_admin') {
                    // 管理员可以查看所有数据
                    req.teacherFilter.canViewAll = true;
                    console.log('✅ 管理员权限，可查看所有数据');
                }
                _c.label = 3;
            case 3:
                next();
                return [3 /*break*/, 5];
            case 4:
                error_1 = _c.sent();
                console.error('❌ 教师权限检查失败:', error_1);
                next();
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.checkTeacherRole = checkTeacherRole;
/**
 * 为客户池查询添加教师权限过滤
 */
var filterCustomerPoolForTeacher = function (req) {
    var filter = req.teacherFilter;
    var whereConditions = 'WHERE p.deleted_at IS NULL';
    var queryParams = [];
    if ((filter === null || filter === void 0 ? void 0 : filter.isTeacher) && filter.teacherId && !filter.canViewAll) {
        // 教师只能看到分配给自己的客户 + 公开的客户
        whereConditions += " AND (\n      pf.created_by = ? OR\n      pf.created_by IS NULL OR\n      p.is_public = 1\n    )";
        queryParams.push(filter.teacherId);
        console.log('🔒 应用教师客户池过滤:', filter.teacherId);
    }
    return { whereConditions: whereConditions, queryParams: queryParams };
};
exports.filterCustomerPoolForTeacher = filterCustomerPoolForTeacher;
/**
 * 为活动查询添加教师权限过滤
 */
var filterActivitiesForTeacher = function (req) {
    var filter = req.teacherFilter;
    var whereConditions = 'WHERE a.deleted_at IS NULL';
    var joinClause = '';
    var queryParams = [];
    if ((filter === null || filter === void 0 ? void 0 : filter.isTeacher) && filter.teacherId && !filter.canViewAll) {
        // 教师可以看到：1. 自己参与的活动 2. 公开的活动
        joinClause = "\n      LEFT JOIN activity_participants ap ON a.id = ap.activity_id\n      AND ap.teacher_id = ? AND ap.deleted_at IS NULL\n    ";
        whereConditions += " AND (\n      ap.teacher_id IS NOT NULL OR\n      a.is_public = 1\n    )";
        queryParams.push(filter.teacherId);
        console.log('🔒 应用教师活动过滤:', filter.teacherId);
    }
    return { whereConditions: whereConditions, queryParams: queryParams, joinClause: joinClause };
};
exports.filterActivitiesForTeacher = filterActivitiesForTeacher;
/**
 * 检查教师是否可以编辑指定客户
 */
var canTeacherEditCustomer = function (teacherId, customerId) { return __awaiter(void 0, void 0, void 0, function () {
    var result, count, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as count FROM parent_followups pf\n       WHERE pf.parent_id = ? AND pf.created_by = ? AND pf.deleted_at IS NULL", {
                        replacements: [customerId, teacherId],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                result = _b.sent();
                count = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                return [2 /*return*/, count > 0];
            case 2:
                error_2 = _b.sent();
                console.error('❌ 检查教师编辑权限失败:', error_2);
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.canTeacherEditCustomer = canTeacherEditCustomer;
/**
 * 检查教师是否可以管理指定活动
 */
var canTeacherManageActivity = function (teacherId, activityId) { return __awaiter(void 0, void 0, void 0, function () {
    var result, count, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as count FROM activity_participants ap\n       WHERE ap.activity_id = ? AND ap.teacher_id = ?\n       AND ap.role = 'organizer' AND ap.deleted_at IS NULL", {
                        replacements: [activityId, teacherId],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                result = _b.sent();
                count = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                return [2 /*return*/, count > 0];
            case 2:
                error_3 = _b.sent();
                console.error('❌ 检查教师活动管理权限失败:', error_3);
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.canTeacherManageActivity = canTeacherManageActivity;
/**
 * 获取教师分配的客户列表
 */
var getTeacherAssignedCustomers = function (teacherId) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT DISTINCT pf.parent_id FROM parent_followups pf\n       WHERE pf.created_by = ? AND pf.deleted_at IS NULL", {
                        replacements: [teacherId],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result.map(function (row) { return row.parent_id; })];
            case 2:
                error_4 = _a.sent();
                console.error('❌ 获取教师客户列表失败:', error_4);
                return [2 /*return*/, []];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getTeacherAssignedCustomers = getTeacherAssignedCustomers;
/**
 * 获取教师参与的活动列表
 */
var getTeacherParticipatingActivities = function (teacherId) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT DISTINCT ap.activity_id FROM activity_participants ap\n       WHERE ap.teacher_id = ? AND ap.deleted_at IS NULL", {
                        replacements: [teacherId],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result.map(function (row) { return row.activity_id; })];
            case 2:
                error_5 = _a.sent();
                console.error('❌ 获取教师活动列表失败:', error_5);
                return [2 /*return*/, []];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getTeacherParticipatingActivities = getTeacherParticipatingActivities;
