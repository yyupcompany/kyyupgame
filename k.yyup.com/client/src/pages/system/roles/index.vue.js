"use strict";
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
/* placeholder */
var vue_1 = require("vue");
var RoleList_vue_1 = require("../../../components/system/RoleList.vue");
var RoleForm_vue_1 = require("../../../components/system/RoleForm.vue");
var RolePermission_vue_1 = require("../../../components/system/RolePermission.vue");
var element_plus_1 = require("element-plus");
var system_1 = require("../../../api/modules/system");
// 分离loadRoleList函数到setup外部，减少setup函数的复杂度
function useRoleList(loading) {
    var _this = this;
    var roleList = (0, vue_1.ref)([]);
    var loadRoleList = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loading.value = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, system_1.getRoles)()];
                case 2:
                    res = _a.sent();
                    if (res.code === 200 || res.success) {
                        // 检查响应数据格式
                        if (Array.isArray(res.data)) {
                            roleList.value = res.data;
                        }
                        else if (res.data && typeof res.data === 'object' && 'items' in res.data) {
                            roleList.value = res.data.items;
                        }
                        else {
                            roleList.value = [];
                            console.error('角色列表数据格式不正确:', res.data);
                        }
                    }
                    else {
                        element_plus_1.ElMessage.error(res.message || '获取角色列表失败');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('获取角色列表失败:', error_1);
                    element_plus_1.ElMessage.error('获取角色列表失败');
                    return [3 /*break*/, 5];
                case 4:
                    loading.value = false;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // 初始加载
    (0, vue_1.onMounted)(function () {
        loadRoleList();
    });
    return {
        roleList: roleList,
        loadRoleList: loadRoleList
    };
}
// 处理角色操作的功能模块
function useRoleOperations(roleFormVisible, rolePermissionVisible, currentRole, loadRoleList) {
    var _this = this;
    // 处理添加角色
    var handleAddRole = function () {
        currentRole.value = null;
        roleFormVisible.value = true;
    };
    // 处理编辑角色
    var handleEditRole = function (role) {
        currentRole.value = __assign({}, role);
        roleFormVisible.value = true;
    };
    // 处理角色权限
    var handleRolePermission = function (role) {
        currentRole.value = __assign({}, role);
        rolePermissionVisible.value = true;
    };
    // 处理角色表单提交成功
    var handleRoleFormSuccess = function (role) { return __awaiter(_this, void 0, void 0, function () {
        var isUpdate, data, res, _a, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    isUpdate = !!role.id;
                    data = {
                        name: role.name,
                        description: role.description,
                        status: role.status
                    };
                    if (!isUpdate) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, system_1.updateRole)(role.id, data)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, system_1.createRole)(data)];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4:
                    res = _a;
                    if (res.code === 200 || res.success) {
                        element_plus_1.ElMessage.success(isUpdate ? '角色更新成功' : '角色创建成功');
                        roleFormVisible.value = false;
                        loadRoleList();
                    }
                    else {
                        element_plus_1.ElMessage.error(res.message || (isUpdate ? '更新角色失败' : '创建角色失败'));
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _b.sent();
                    console.error('保存角色失败:', error_2);
                    element_plus_1.ElMessage.error('保存角色失败');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // 处理角色权限提交成功
    var handleRolePermissionSuccess = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var res, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, system_1.assignRolePermissions)(data.roleId, data.permissionIds)];
                case 1:
                    res = _a.sent();
                    if (res.code === 200 || res.success) {
                        element_plus_1.ElMessage.success('角色权限更新成功');
                        rolePermissionVisible.value = false;
                    }
                    else {
                        element_plus_1.ElMessage.error(res.message || '更新角色权限失败');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('更新角色权限失败:', error_3);
                    element_plus_1.ElMessage.error('更新角色权限失败');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // 处理删除角色
    var handleDeleteRole = function (roleId) { return __awaiter(_this, void 0, void 0, function () {
        var res, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, system_1.deleteRole)(roleId)];
                case 1:
                    res = _a.sent();
                    if (res.code === 200 || res.success) {
                        element_plus_1.ElMessage.success('角色删除成功');
                        loadRoleList();
                    }
                    else {
                        element_plus_1.ElMessage.error(res.message || '删除角色失败');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('删除角色失败:', error_4);
                    element_plus_1.ElMessage.error('删除角色失败');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return {
        handleAddRole: handleAddRole,
        handleEditRole: handleEditRole,
        handleRolePermission: handleRolePermission,
        handleRoleFormSuccess: handleRoleFormSuccess,
        handleRolePermissionSuccess: handleRolePermissionSuccess,
        handleDeleteRole: handleDeleteRole
    };
}
exports.default = (0, vue_1.defineComponent)({
    name: 'RoleManagement',
    components: {
        RoleList: RoleList_vue_1.default,
        RoleForm: RoleForm_vue_1.default,
        RolePermission: RolePermission_vue_1.default
    },
    setup: function () {
        // 状态变量
        var roleFormVisible = (0, vue_1.ref)(false);
        var rolePermissionVisible = (0, vue_1.ref)(false);
        var currentRole = (0, vue_1.ref)(null);
        var loading = (0, vue_1.ref)(false);
        // 使用提取的功能模块
        var _a = useRoleList(loading), roleList = _a.roleList, loadRoleList = _a.loadRoleList;
        var operations = useRoleOperations(roleFormVisible, rolePermissionVisible, currentRole, loadRoleList);
        return __assign({ roleFormVisible: roleFormVisible, rolePermissionVisible: rolePermissionVisible, currentRole: currentRole, roleList: roleList, loading: loading }, operations);
    }
});
debugger; /* PartiallyEnd: #3632/script.vue */
var __VLS_ctx = {};
var __VLS_componentsOption = {
    RoleList: RoleList_vue_1.default,
    RoleForm: RoleForm_vue_1.default,
    RolePermission: RolePermission_vue_1.default
};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "role-management-page" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)(__assign({ class: "page-title" }));
var __VLS_0 = {}.RoleList;
/** @type {[typeof __VLS_components.RoleList, typeof __VLS_components.roleList, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign(__assign({ 'onAdd': {} }, { 'onEdit': {} }), { 'onPermission': {} })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign({ 'onAdd': {} }, { 'onEdit': {} }), { 'onPermission': {} })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_4;
var __VLS_5;
var __VLS_6;
var __VLS_7 = {
    onAdd: (__VLS_ctx.handleAddRole)
};
var __VLS_8 = {
    onEdit: (__VLS_ctx.handleEditRole)
};
var __VLS_9 = {
    onPermission: (__VLS_ctx.handleRolePermission)
};
var __VLS_3;
var __VLS_10 = {}.RoleForm;
/** @type {[typeof __VLS_components.RoleForm, typeof __VLS_components.roleForm, ]} */ ;
// @ts-ignore
var __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10(__assign({ 'onSuccess': {} }, { visible: (__VLS_ctx.roleFormVisible), roleData: (__VLS_ctx.currentRole) })));
var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([__assign({ 'onSuccess': {} }, { visible: (__VLS_ctx.roleFormVisible), roleData: (__VLS_ctx.currentRole) })], __VLS_functionalComponentArgsRest(__VLS_11), false));
var __VLS_14;
var __VLS_15;
var __VLS_16;
var __VLS_17 = {
    onSuccess: (__VLS_ctx.handleRoleFormSuccess)
};
var __VLS_13;
var __VLS_18 = {}.RolePermission;
/** @type {[typeof __VLS_components.RolePermission, typeof __VLS_components.rolePermission, ]} */ ;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18(__assign({ 'onSuccess': {} }, { visible: (__VLS_ctx.rolePermissionVisible), role: (__VLS_ctx.currentRole) })));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign({ 'onSuccess': {} }, { visible: (__VLS_ctx.rolePermissionVisible), role: (__VLS_ctx.currentRole) })], __VLS_functionalComponentArgsRest(__VLS_19), false));
var __VLS_22;
var __VLS_23;
var __VLS_24;
var __VLS_25 = {
    onSuccess: (__VLS_ctx.handleRolePermissionSuccess)
};
var __VLS_21;
/** @type {__VLS_StyleScopedClasses['role-management-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
var __VLS_dollars;
var __VLS_self;
;
