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
var vue_1 = require("vue");
var element_plus_1 = require("element-plus");
exports.default = (0, vue_1.defineComponent)({
    name: 'RolePermission',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        role: {
            type: Object,
            default: null
        }
    },
    emits: ['update:visible', 'success'],
    setup: function (props, _a) {
        var _this = this;
        var emit = _a.emit;
        // 对话框可见性
        var dialogVisible = (0, vue_1.ref)(props.visible);
        // 树形控件引用
        var permissionTreeRef = (0, vue_1.ref)();
        // 加载状态
        var loading = (0, vue_1.ref)(false);
        // 权限树形数据
        var permissionTree = (0, vue_1.ref)([]);
        // 已选中的权限ID
        var checkedKeys = (0, vue_1.ref)([]);
        // 角色名称
        var roleName = (0, vue_1.computed)(function () { var _a; return ((_a = props.role) === null || _a === void 0 ? void 0 : _a.name) || ''; });
        // 树形控件属性
        var defaultProps = {
            children: 'children',
            label: 'name'
        };
        // 监听visible属性变化
        (0, vue_1.watch)(function () { return props.visible; }, function (val) {
            dialogVisible.value = val;
            if (val && props.role) {
                loadPermissionTree();
                loadRolePermissions();
            }
        });
        // 监听dialogVisible变化
        (0, vue_1.watch)(dialogVisible, function (val) {
            emit('update:visible', val);
        });
        // 监听role变化
        (0, vue_1.watch)(function () { return props.role; }, function (val) {
            if (val && dialogVisible.value) {
                loadPermissionTree();
                loadRolePermissions();
            }
        });
        // 加载权限树
        var loadPermissionTree = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 这里应该调用实际的API
                    // const { data } = await getPermissionTree();
                    // permissionTree.value = data;
                    // 模拟数据
                    permissionTree.value = [
                        {
                            id: '1',
                            name: '系统管理',
                            code: 'system',
                            type: 'menu',
                            children: [
                                {
                                    id: '1-1',
                                    name: '用户管理',
                                    code: 'system:user',
                                    type: 'menu',
                                    children: [
                                        {
                                            id: '1-1-1',
                                            name: '查看用户',
                                            code: 'system:user:view',
                                            type: 'button'
                                        },
                                        {
                                            id: '1-1-2',
                                            name: '新增用户',
                                            code: 'system:user:add',
                                            type: 'button'
                                        },
                                        {
                                            id: '1-1-3',
                                            name: '编辑用户',
                                            code: 'system:user:edit',
                                            type: 'button'
                                        },
                                        {
                                            id: '1-1-4',
                                            name: '删除用户',
                                            code: 'system:user:delete',
                                            type: 'button'
                                        }
                                    ]
                                },
                                {
                                    id: '1-2',
                                    name: '角色管理',
                                    code: 'system:role',
                                    type: 'menu',
                                    children: [
                                        {
                                            id: '1-2-1',
                                            name: '查看角色',
                                            code: 'system:role:view',
                                            type: 'button'
                                        },
                                        {
                                            id: '1-2-2',
                                            name: '新增角色',
                                            code: 'system:role:add',
                                            type: 'button'
                                        },
                                        {
                                            id: '1-2-3',
                                            name: '编辑角色',
                                            code: 'system:role:edit',
                                            type: 'button'
                                        },
                                        {
                                            id: '1-2-4',
                                            name: '删除角色',
                                            code: 'system:role:delete',
                                            type: 'button'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: '2',
                            name: '内容管理',
                            code: 'content',
                            type: 'menu',
                            children: [
                                {
                                    id: '2-1',
                                    name: '文章管理',
                                    code: 'content:article',
                                    type: 'menu',
                                    children: [
                                        {
                                            id: '2-1-1',
                                            name: '查看文章',
                                            code: 'content:article:view',
                                            type: 'button'
                                        },
                                        {
                                            id: '2-1-2',
                                            name: '新增文章',
                                            code: 'content:article:add',
                                            type: 'button'
                                        },
                                        {
                                            id: '2-1-3',
                                            name: '编辑文章',
                                            code: 'content:article:edit',
                                            type: 'button'
                                        },
                                        {
                                            id: '2-1-4',
                                            name: '删除文章',
                                            code: 'content:article:delete',
                                            type: 'button'
                                        }
                                    ]
                                }
                            ]
                        }
                    ];
                }
                catch (error) {
                    console.error('加载权限树失败:', error);
                    element_plus_1.ElMessage.error('加载权限树失败');
                }
                return [2 /*return*/];
            });
        }); };
        // 加载角色权限
        var loadRolePermissions = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!props.role)
                    return [2 /*return*/];
                try {
                    // 这里应该调用实际的API
                    // const { data } = await getRolePermissions(props.role.id);
                    // checkedKeys.value = data.map(permission => permission.id);
                    // 模拟数据
                    if (props.role.id === '1') { // 超级管理员拥有所有权限
                        checkedKeys.value = ['1', '1-1', '1-1-1', '1-1-2', '1-1-3', '1-1-4', '1-2', '1-2-1', '1-2-2', '1-2-3', '1-2-4', '2', '2-1', '2-1-1', '2-1-2', '2-1-3', '2-1-4'];
                    }
                    else if (props.role.id === '2') { // 普通管理员拥有部分权限
                        checkedKeys.value = ['1', '1-1', '1-1-1', '1-1-2', '1-1-3', '1-2', '1-2-1', '2', '2-1', '2-1-1', '2-1-2', '2-1-3'];
                    }
                    else if (props.role.id === '3') { // 教师
                        checkedKeys.value = ['2', '2-1', '2-1-1', '2-1-2'];
                    }
                    else { // 其他角色
                        checkedKeys.value = ['2', '2-1', '2-1-1'];
                    }
                }
                catch (error) {
                    console.error('加载角色权限失败:', error);
                    element_plus_1.ElMessage.error('加载角色权限失败');
                }
                return [2 /*return*/];
            });
        }); };
        // 权限类型标签样式
        var getPermissionTypeTag = function (type) {
            var typeMap = {
                button: 'success',
                api: 'info'
            };
            return typeMap[type] || 'info';
        };
        // 权限类型标签文本
        var getPermissionTypeLabel = function (type) {
            var labelMap = {
                menu: '菜单',
                button: '按钮',
                api: '接口'
            };
            return labelMap[type] || type;
        };
        // 处理权限选中变化
        var handleCheckChange = function () {
            if (!permissionTreeRef.value)
                return;
            // 获取当前选中的节点ID
            var selectedKeys = permissionTreeRef.value.getCheckedKeys(false);
            console.log('当前选中的权限:', selectedKeys);
        };
        // 关闭对话框
        var handleClose = function () {
            dialogVisible.value = false;
        };
        // 提交表单
        var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
            var selectedKeys, halfCheckedKeys, allCheckedKeys, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!permissionTreeRef.value || !props.role)
                            return [2 /*return*/];
                        selectedKeys = permissionTreeRef.value.getCheckedKeys(false);
                        halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys();
                        allCheckedKeys = __spreadArray(__spreadArray([], selectedKeys, true), halfCheckedKeys, true);
                        loading.value = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        // 这里应该调用实际的API
                        // await updateRolePermissions(props.role.id, allCheckedKeys);
                        // 模拟API调用
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 2:
                        // 这里应该调用实际的API
                        // await updateRolePermissions(props.role.id, allCheckedKeys);
                        // 模拟API调用
                        _a.sent();
                        // 触发成功事件
                        emit('success', __assign(__assign({}, props.role), { permissionIds: allCheckedKeys }));
                        // 显示成功消息
                        element_plus_1.ElMessage.success('更新角色权限成功');
                        // 关闭对话框
                        dialogVisible.value = false;
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error('更新角色权限失败:', error_1);
                        element_plus_1.ElMessage.error('更新角色权限失败');
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        return {
            dialogVisible: dialogVisible,
            permissionTreeRef: permissionTreeRef,
            permissionTree: permissionTree,
            checkedKeys: checkedKeys,
            roleName: roleName,
            defaultProps: defaultProps,
            loading: loading,
            handleCheckChange: handleCheckChange,
            handleClose: handleClose,
            handleSubmit: handleSubmit,
            getPermissionTypeTag: getPermissionTypeTag,
            getPermissionTypeLabel: getPermissionTypeLabel
        };
    }
});
debugger; /* PartiallyEnd: #3632/script.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
var __VLS_0 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ 'onClose': {} }, { modelValue: (__VLS_ctx.dialogVisible), title: ("\u5206\u914D\u6743\u9650 - ".concat(__VLS_ctx.roleName)), width: "60%" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClose': {} }, { modelValue: (__VLS_ctx.dialogVisible), title: ("\u5206\u914D\u6743\u9650 - ".concat(__VLS_ctx.roleName)), width: "60%" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_4;
var __VLS_5;
var __VLS_6;
var __VLS_7 = {
    onClose: (__VLS_ctx.handleClose)
};
var __VLS_8 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-container" }));
var __VLS_9 = {}.ElTree;
/** @type {[typeof __VLS_components.ElTree, typeof __VLS_components.elTree, typeof __VLS_components.ElTree, typeof __VLS_components.elTree, ]} */ ;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9(__assign({ 'onCheck': {} }, { ref: "permissionTreeRef", data: (__VLS_ctx.permissionTree), showCheckbox: true, nodeKey: "id", props: (__VLS_ctx.defaultProps), defaultCheckedKeys: (__VLS_ctx.checkedKeys), checkStrictly: (false), highlightCurrent: (true), expandOnClickNode: (false) })));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([__assign({ 'onCheck': {} }, { ref: "permissionTreeRef", data: (__VLS_ctx.permissionTree), showCheckbox: true, nodeKey: "id", props: (__VLS_ctx.defaultProps), defaultCheckedKeys: (__VLS_ctx.checkedKeys), checkStrictly: (false), highlightCurrent: (true), expandOnClickNode: (false) })], __VLS_functionalComponentArgsRest(__VLS_10), false));
var __VLS_13;
var __VLS_14;
var __VLS_15;
var __VLS_16 = {
    onCheck: (__VLS_ctx.handleCheckChange)
};
/** @type {typeof __VLS_ctx.permissionTreeRef} */ ;
var __VLS_17 = {};
__VLS_12.slots.default;
{
    var __VLS_thisSlot = __VLS_12.slots.default;
    var _a = __VLS_getSlotParams(__VLS_thisSlot)[0], node = _a.node, data = _a.data;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "custom-tree-node" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (node.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "permission-type" }));
    if (data.type !== 'menu') {
        var __VLS_19 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        var __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
            size: "small",
            type: (__VLS_ctx.getPermissionTypeTag(data.type)),
        }));
        var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{
                size: "small",
                type: (__VLS_ctx.getPermissionTypeTag(data.type)),
            }], __VLS_functionalComponentArgsRest(__VLS_20), false));
        __VLS_22.slots.default;
        (__VLS_ctx.getPermissionTypeLabel(data.type));
        var __VLS_22;
    }
    else {
        var __VLS_23 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        var __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
            size: "small",
            type: "primary",
        }));
        var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([{
                size: "small",
                type: "primary",
            }], __VLS_functionalComponentArgsRest(__VLS_24), false));
        __VLS_26.slots.default;
        (__VLS_ctx.getPermissionTypeLabel(data.type));
        var __VLS_26;
    }
}
var __VLS_12;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "bottom-tip" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
{
    var __VLS_thisSlot = __VLS_3.slots.footer;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "dialog-footer" }));
    var __VLS_27 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    var __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27(__assign({ 'onClick': {} })));
    var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_28), false));
    var __VLS_31 = void 0;
    var __VLS_32 = void 0;
    var __VLS_33 = void 0;
    var __VLS_34 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.dialogVisible = false;
        }
    };
    __VLS_30.slots.default;
    var __VLS_30;
    var __VLS_35 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    var __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35(__assign({ 'onClick': {} }, { type: "primary", loading: (__VLS_ctx.loading) })));
    var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "primary", loading: (__VLS_ctx.loading) })], __VLS_functionalComponentArgsRest(__VLS_36), false));
    var __VLS_39 = void 0;
    var __VLS_40 = void 0;
    var __VLS_41 = void 0;
    var __VLS_42 = {
        onClick: (__VLS_ctx.handleSubmit)
    };
    __VLS_38.slots.default;
    var __VLS_38;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['permission-container']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-tree-node']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-type']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_18 = __VLS_17;
var __VLS_dollars;
var __VLS_self;
