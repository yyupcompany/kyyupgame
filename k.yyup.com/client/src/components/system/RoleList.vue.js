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
var element_plus_1 = require("element-plus");
var system_1 = require("../../api/modules/system");
exports.default = (0, vue_1.defineComponent)({
    name: 'RoleList',
    emits: ['add', 'edit', 'permission', 'delete'],
    setup: function (props, _a) {
        var _this = this;
        var emit = _a.emit;
        // 角色列表数据
        var roleList = (0, vue_1.ref)([]);
        var loading = (0, vue_1.ref)(false);
        // 搜索表单
        var searchForm = (0, vue_1.reactive)({
            name: '',
            status: ''
        });
        // 分页信息
        var pagination = (0, vue_1.reactive)({
            currentPage: 1,
            pageSize: 10,
            total: 0
        });
        // 初始化加载数据
        (0, vue_1.onMounted)(function () {
            loadRoleList();
        });
        // 监听搜索条件变化
        (0, vue_1.watch)([function () { return pagination.currentPage; }, function () { return pagination.pageSize; }], function () {
            loadRoleList();
        });
        // 加载角色列表
        var loadRoleList = function () { return __awaiter(_this, void 0, void 0, function () {
            var params, res, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loading.value = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        params = {
                            page: pagination.currentPage,
                            pageSize: pagination.pageSize,
                            name: searchForm.name || undefined,
                            status: searchForm.status || undefined
                        };
                        return [4 /*yield*/, (0, system_1.getRoles)(params)];
                    case 2:
                        res = _a.sent();
                        if (res.code === 200 || res.success) {
                            // 检查响应数据格式
                            if (Array.isArray(res.data)) {
                                roleList.value = res.data;
                                pagination.total = res.data.length || 0;
                            }
                            else if (res.data && typeof res.data === 'object' && 'items' in res.data) {
                                roleList.value = res.data.items || [];
                                pagination.total = res.data.total || 0;
                            }
                            else {
                                roleList.value = [];
                                pagination.total = 0;
                                console.error('角色列表数据格式不正确:', res.data);
                            }
                        }
                        else {
                            element_plus_1.ElMessage.error(res.message || '获取角色列表失败');
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error('加载角色列表失败:', error_1);
                        element_plus_1.ElMessage.error('加载角色列表失败');
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        // 搜索
        var handleSearch = function () {
            pagination.currentPage = 1;
            loadRoleList();
        };
        // 重置搜索
        var resetSearch = function () {
            searchForm.name = '';
            searchForm.status = '';
            handleSearch();
        };
        // 分页大小变化
        var handleSizeChange = function (size) {
            pagination.pageSize = size;
            pagination.currentPage = 1;
        };
        // 当前页变化
        var handleCurrentChange = function (page) {
            pagination.currentPage = page;
        };
        // 新增角色
        var handleAdd = function () {
            emit('add');
        };
        // 编辑角色
        var handleEdit = function (role) {
            emit('edit', role);
        };
        // 管理角色权限
        var handlePermission = function (role) {
            emit('permission', role);
        };
        // 改变角色状态
        var handleStatusChange = function (role, status) { return __awaiter(_this, void 0, void 0, function () {
            var res, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, system_1.updateRoleStatus)(role.id, status)];
                    case 1:
                        res = _a.sent();
                        if (res.code === 200) {
                            element_plus_1.ElMessage.success("\u89D2\u8272".concat(status === 'active' ? '启用' : '禁用', "\u6210\u529F"));
                            loadRoleList();
                        }
                        else {
                            element_plus_1.ElMessage.error(res.message || "\u89D2\u8272".concat(status === 'active' ? '启用' : '禁用', "\u5931\u8D25"));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('更新角色状态失败:', error_2);
                        element_plus_1.ElMessage.error('更新角色状态失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // 删除角色
        var handleDelete = function (role) {
            element_plus_1.ElMessageBox.confirm("\u786E\u5B9A\u8981\u5220\u9664\u89D2\u8272\"".concat(role.name, "\"\u5417\uFF1F\u5220\u9664\u540E\u4E0D\u53EF\u6062\u590D\u3002"), '删除确认', {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(function () { return __awaiter(_this, void 0, void 0, function () {
                var res, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, (0, system_1.deleteRole)(role.id)];
                        case 1:
                            res = _a.sent();
                            if (res.code === 200) {
                                element_plus_1.ElMessage.success('角色删除成功');
                                loadRoleList();
                            }
                            else {
                                element_plus_1.ElMessage.error(res.message || '删除角色失败');
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            console.error('删除角色失败:', error_3);
                            element_plus_1.ElMessage.error('删除角色失败');
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); }).catch(function () {
                // 用户取消删除，不做处理
            });
        };
        return {
            roleList: roleList,
            loading: loading,
            searchForm: searchForm,
            pagination: pagination,
            handleSearch: handleSearch,
            resetSearch: resetSearch,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            handleAdd: handleAdd,
            handleEdit: handleEdit,
            handlePermission: handlePermission,
            handleStatusChange: handleStatusChange,
            handleDelete: handleDelete,
            loadRoleList: loadRoleList
        };
    }
});
debugger; /* PartiallyEnd: #3632/script.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "role-list-container" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "app-card" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "search-container" }));
var __VLS_0 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    model: (__VLS_ctx.searchForm),
    labelWidth: "80px",
    inline: true,
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        model: (__VLS_ctx.searchForm),
        labelWidth: "80px",
        inline: true,
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
__VLS_3.slots.default;
var __VLS_4 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
var __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    label: "角色名称",
}));
var __VLS_6 = __VLS_5.apply(void 0, __spreadArray([{
        label: "角色名称",
    }], __VLS_functionalComponentArgsRest(__VLS_5), false));
__VLS_7.slots.default;
var __VLS_8 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.searchForm.name),
    placeholder: "请输入角色名称",
    clearable: true,
}));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.searchForm.name),
        placeholder: "请输入角色名称",
        clearable: true,
    }], __VLS_functionalComponentArgsRest(__VLS_9), false));
var __VLS_7;
var __VLS_12 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    label: "状态",
}));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([{
        label: "状态",
    }], __VLS_functionalComponentArgsRest(__VLS_13), false));
__VLS_15.slots.default;
var __VLS_16 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
var __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.searchForm.status),
    placeholder: "请选择状态",
    clearable: true,
}));
var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.searchForm.status),
        placeholder: "请选择状态",
        clearable: true,
    }], __VLS_functionalComponentArgsRest(__VLS_17), false));
__VLS_19.slots.default;
var __VLS_20 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "启用",
    value: "active",
}));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
        label: "启用",
        value: "active",
    }], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_24 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "禁用",
    value: "inactive",
}));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{
        label: "禁用",
        value: "inactive",
    }], __VLS_functionalComponentArgsRest(__VLS_25), false));
var __VLS_19;
var __VLS_15;
var __VLS_28 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
var __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_29), false));
__VLS_31.slots.default;
var __VLS_32 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
var __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32(__assign({ 'onClick': {} }, { type: "primary" })));
var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "primary" })], __VLS_functionalComponentArgsRest(__VLS_33), false));
var __VLS_36;
var __VLS_37;
var __VLS_38;
var __VLS_39 = {
    onClick: (__VLS_ctx.handleSearch)
};
__VLS_35.slots.default;
var __VLS_35;
var __VLS_40 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
var __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40(__assign({ 'onClick': {} })));
var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_41), false));
var __VLS_44;
var __VLS_45;
var __VLS_46;
var __VLS_47 = {
    onClick: (__VLS_ctx.resetSearch)
};
__VLS_43.slots.default;
var __VLS_43;
var __VLS_31;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "app-card" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "app-card-header" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "app-card-title" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "card-actions" }));
var __VLS_48 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
var __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48(__assign({ 'onClick': {} }, { type: "primary" })));
var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "primary" })], __VLS_functionalComponentArgsRest(__VLS_49), false));
var __VLS_52;
var __VLS_53;
var __VLS_54;
var __VLS_55 = {
    onClick: (__VLS_ctx.handleAdd)
};
__VLS_51.slots.default;
var __VLS_51;
var __VLS_56 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
var __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56(__assign(__assign({ data: (__VLS_ctx.roleList) }, { style: {} }), { border: true, stripe: true })));
var __VLS_58 = __VLS_57.apply(void 0, __spreadArray([__assign(__assign({ data: (__VLS_ctx.roleList) }, { style: {} }), { border: true, stripe: true })], __VLS_functionalComponentArgsRest(__VLS_57), false));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.loading) }), null, null);
__VLS_59.slots.default;
var __VLS_60 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
var __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    prop: "name",
    label: "角色名称",
    minWidth: "120",
}));
var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([{
        prop: "name",
        label: "角色名称",
        minWidth: "120",
    }], __VLS_functionalComponentArgsRest(__VLS_61), false));
var __VLS_64 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
var __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    prop: "description",
    label: "角色描述",
    minWidth: "200",
}));
var __VLS_66 = __VLS_65.apply(void 0, __spreadArray([{
        prop: "description",
        label: "角色描述",
        minWidth: "200",
    }], __VLS_functionalComponentArgsRest(__VLS_65), false));
var __VLS_68 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
var __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    prop: "createdAt",
    label: "创建时间",
    width: "180",
}));
var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([{
        prop: "createdAt",
        label: "创建时间",
        width: "180",
    }], __VLS_functionalComponentArgsRest(__VLS_69), false));
var __VLS_72 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
var __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    prop: "updatedAt",
    label: "更新时间",
    width: "180",
}));
var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([{
        prop: "updatedAt",
        label: "更新时间",
        width: "180",
    }], __VLS_functionalComponentArgsRest(__VLS_73), false));
var __VLS_76 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
var __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    prop: "status",
    label: "状态",
    width: "100",
    align: "center",
}));
var __VLS_78 = __VLS_77.apply(void 0, __spreadArray([{
        prop: "status",
        label: "状态",
        width: "100",
        align: "center",
    }], __VLS_functionalComponentArgsRest(__VLS_77), false));
__VLS_79.slots.default;
{
    var __VLS_thisSlot = __VLS_79.slots.default;
    var scope = __VLS_getSlotParams(__VLS_thisSlot)[0];
    var __VLS_80 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    var __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        type: (scope.row.status === 'active' ? 'success' : 'danger'),
    }));
    var __VLS_82 = __VLS_81.apply(void 0, __spreadArray([{
            type: (scope.row.status === 'active' ? 'success' : 'danger'),
        }], __VLS_functionalComponentArgsRest(__VLS_81), false));
    __VLS_83.slots.default;
    (scope.row.status === 'active' ? '启用' : '禁用');
    var __VLS_83;
}
var __VLS_79;
var __VLS_84 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
var __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "操作",
    width: "280",
    align: "center",
}));
var __VLS_86 = __VLS_85.apply(void 0, __spreadArray([{
        label: "操作",
        width: "280",
        align: "center",
    }], __VLS_functionalComponentArgsRest(__VLS_85), false));
__VLS_87.slots.default;
{
    var __VLS_thisSlot = __VLS_87.slots.default;
    var scope_1 = __VLS_getSlotParams(__VLS_thisSlot)[0];
    if (scope_1.row.status === 'active') {
        var __VLS_88 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        var __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88(__assign({ 'onClick': {} }, { type: "warning", size: "small", text: true })));
        var __VLS_90 = __VLS_89.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "warning", size: "small", text: true })], __VLS_functionalComponentArgsRest(__VLS_89), false));
        var __VLS_92 = void 0;
        var __VLS_93 = void 0;
        var __VLS_94 = void 0;
        var __VLS_95 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(scope_1.row.status === 'active'))
                    return;
                __VLS_ctx.handleStatusChange(scope_1.row, 'inactive');
            }
        };
        __VLS_91.slots.default;
        var __VLS_91;
    }
    else {
        var __VLS_96 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        var __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96(__assign({ 'onClick': {} }, { type: "success", size: "small", text: true })));
        var __VLS_98 = __VLS_97.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "success", size: "small", text: true })], __VLS_functionalComponentArgsRest(__VLS_97), false));
        var __VLS_100 = void 0;
        var __VLS_101 = void 0;
        var __VLS_102 = void 0;
        var __VLS_103 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(scope_1.row.status === 'active'))
                    return;
                __VLS_ctx.handleStatusChange(scope_1.row, 'active');
            }
        };
        __VLS_99.slots.default;
        var __VLS_99;
    }
    var __VLS_104 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    var __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104(__assign({ 'onClick': {} }, { type: "primary", size: "small", text: true })));
    var __VLS_106 = __VLS_105.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "primary", size: "small", text: true })], __VLS_functionalComponentArgsRest(__VLS_105), false));
    var __VLS_108 = void 0;
    var __VLS_109 = void 0;
    var __VLS_110 = void 0;
    var __VLS_111 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.handleEdit(scope_1.row);
        }
    };
    __VLS_107.slots.default;
    var __VLS_107;
    var __VLS_112 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    var __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112(__assign({ 'onClick': {} }, { type: "info", size: "small", text: true })));
    var __VLS_114 = __VLS_113.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "info", size: "small", text: true })], __VLS_functionalComponentArgsRest(__VLS_113), false));
    var __VLS_116 = void 0;
    var __VLS_117 = void 0;
    var __VLS_118 = void 0;
    var __VLS_119 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.handlePermission(scope_1.row);
        }
    };
    __VLS_115.slots.default;
    var __VLS_115;
    var __VLS_120 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    var __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120(__assign({ 'onClick': {} }, { type: "danger", size: "small", text: true })));
    var __VLS_122 = __VLS_121.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "danger", size: "small", text: true })], __VLS_functionalComponentArgsRest(__VLS_121), false));
    var __VLS_124 = void 0;
    var __VLS_125 = void 0;
    var __VLS_126 = void 0;
    var __VLS_127 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.handleDelete(scope_1.row);
        }
    };
    __VLS_123.slots.default;
    var __VLS_123;
}
var __VLS_87;
var __VLS_59;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "pagination-container" }));
var __VLS_128 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
var __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128(__assign(__assign({ 'onSizeChange': {} }, { 'onCurrentChange': {} }), { currentPage: (__VLS_ctx.pagination.currentPage), pageSize: (__VLS_ctx.pagination.pageSize), pageSizes: ([10, 20, 50, 100]), layout: "total, sizes, prev, pager, next, jumper", total: (__VLS_ctx.pagination.total) })));
var __VLS_130 = __VLS_129.apply(void 0, __spreadArray([__assign(__assign({ 'onSizeChange': {} }, { 'onCurrentChange': {} }), { currentPage: (__VLS_ctx.pagination.currentPage), pageSize: (__VLS_ctx.pagination.pageSize), pageSizes: ([10, 20, 50, 100]), layout: "total, sizes, prev, pager, next, jumper", total: (__VLS_ctx.pagination.total) })], __VLS_functionalComponentArgsRest(__VLS_129), false));
var __VLS_132;
var __VLS_133;
var __VLS_134;
var __VLS_135 = {
    onSizeChange: (__VLS_ctx.handleSizeChange)
};
var __VLS_136 = {
    onCurrentChange: (__VLS_ctx.handleCurrentChange)
};
var __VLS_131;
/** @type {__VLS_StyleScopedClasses['role-list-container']} */ ;
/** @type {__VLS_StyleScopedClasses['app-card']} */ ;
/** @type {__VLS_StyleScopedClasses['search-container']} */ ;
/** @type {__VLS_StyleScopedClasses['app-card']} */ ;
/** @type {__VLS_StyleScopedClasses['app-card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['app-card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
var __VLS_dollars;
var __VLS_self;
