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
// 默认表单数据
var defaultFormData = {
    name: '',
    description: '',
    status: 'active'
};
exports.default = (0, vue_1.defineComponent)({
    name: 'RoleForm',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        roleData: {
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
        // 表单引用
        var formRef = (0, vue_1.ref)();
        // 加载状态
        var loading = (0, vue_1.ref)(false);
        // 表单数据
        var formData = (0, vue_1.reactive)(__assign({}, defaultFormData));
        // 表单验证规则
        var formRules = (0, vue_1.reactive)({
            name: [
                { required: true, message: '请输入角色名称', trigger: 'blur' },
                { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
            ],
            description: [
                { required: true, message: '请输入角色描述', trigger: 'blur' }
            ]
        });
        // 监听visible属性变化
        (0, vue_1.watch)(function () { return props.visible; }, function (val) {
            dialogVisible.value = val;
        });
        // 监听dialogVisible变化
        (0, vue_1.watch)(dialogVisible, function (val) {
            emit('update:visible', val);
            if (!val) {
                resetForm();
            }
        });
        // 监听roleData变化
        (0, vue_1.watch)(function () { return props.roleData; }, function (val) {
            if (val) {
                (0, vue_1.nextTick)(function () {
                    // 设置表单数据
                    Object.assign(formData, {
                        id: val.id,
                        name: val.name,
                        description: val.description || '',
                        status: val.status || 'active'
                    });
                });
            }
            else {
                resetForm();
            }
        }, { immediate: true });
        // 重置表单
        var resetForm = function () {
            if (formRef.value) {
                formRef.value.resetFields();
            }
            Object.assign(formData, __assign({}, defaultFormData));
        };
        // 关闭对话框
        var handleClose = function () {
            dialogVisible.value = false;
        };
        // 提交表单
        var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!formRef.value)
                            return [2 /*return*/];
                        return [4 /*yield*/, formRef.value.validate(function (valid, fields) { return __awaiter(_this, void 0, void 0, function () {
                                var result, error_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!valid) return [3 /*break*/, 6];
                                            loading.value = true;
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, 4, 5]);
                                            // 这里应该调用实际的API
                                            // const result = formData.id 
                                            //   ? await updateRole(formData.id, formData)
                                            //   : await createRole(formData);
                                            // 模拟API调用
                                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                                        case 2:
                                            // 这里应该调用实际的API
                                            // const result = formData.id 
                                            //   ? await updateRole(formData.id, formData)
                                            //   : await createRole(formData);
                                            // 模拟API调用
                                            _a.sent();
                                            result = __assign(__assign({}, formData), { id: formData.id || Date.now().toString(), createdAt: formData.id ? undefined : new Date().toISOString(), updatedAt: new Date().toISOString() });
                                            emit('success', result);
                                            // 显示成功消息
                                            element_plus_1.ElMessage.success(formData.id ? '编辑角色成功' : '创建角色成功');
                                            // 关闭对话框
                                            dialogVisible.value = false;
                                            return [3 /*break*/, 5];
                                        case 3:
                                            error_1 = _a.sent();
                                            console.error(formData.id ? '编辑角色失败:' : '创建角色失败:', error_1);
                                            element_plus_1.ElMessage.error(formData.id ? '编辑角色失败' : '创建角色失败');
                                            return [3 /*break*/, 5];
                                        case 4:
                                            loading.value = false;
                                            return [7 /*endfinally*/];
                                        case 5: return [3 /*break*/, 7];
                                        case 6:
                                            console.error('表单验证失败:', fields);
                                            _a.label = 7;
                                        case 7: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        return {
            dialogVisible: dialogVisible,
            formRef: formRef,
            formData: formData,
            formRules: formRules,
            loading: loading,
            handleClose: handleClose,
            handleSubmit: handleSubmit,
            resetForm: resetForm
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
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ 'onClose': {} }, { modelValue: (__VLS_ctx.dialogVisible), title: (__VLS_ctx.formData.id ? '编辑角色' : '新增角色'), width: "40%" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClose': {} }, { modelValue: (__VLS_ctx.dialogVisible), title: (__VLS_ctx.formData.id ? '编辑角色' : '新增角色'), width: "40%" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_4;
var __VLS_5;
var __VLS_6;
var __VLS_7 = {
    onClose: (__VLS_ctx.handleClose)
};
var __VLS_8 = {};
__VLS_3.slots.default;
var __VLS_9 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.formRules),
    labelWidth: "100px",
}));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{
        ref: "formRef",
        model: (__VLS_ctx.formData),
        rules: (__VLS_ctx.formRules),
        labelWidth: "100px",
    }], __VLS_functionalComponentArgsRest(__VLS_10), false));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_13 = {};
__VLS_12.slots.default;
var __VLS_15 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
var __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    label: "角色名称",
    prop: "name",
}));
var __VLS_17 = __VLS_16.apply(void 0, __spreadArray([{
        label: "角色名称",
        prop: "name",
    }], __VLS_functionalComponentArgsRest(__VLS_16), false));
__VLS_18.slots.default;
var __VLS_19 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入角色名称",
    disabled: (__VLS_ctx.formData.id === '1'),
}));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.formData.name),
        placeholder: "请输入角色名称",
        disabled: (__VLS_ctx.formData.id === '1'),
    }], __VLS_functionalComponentArgsRest(__VLS_20), false));
var __VLS_18;
var __VLS_23 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
var __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
    label: "角色描述",
    prop: "description",
}));
var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([{
        label: "角色描述",
        prop: "description",
    }], __VLS_functionalComponentArgsRest(__VLS_24), false));
__VLS_26.slots.default;
var __VLS_27 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
var __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    modelValue: (__VLS_ctx.formData.description),
    type: "textarea",
    rows: (3),
    placeholder: "请输入角色描述",
}));
var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.formData.description),
        type: "textarea",
        rows: (3),
        placeholder: "请输入角色描述",
    }], __VLS_functionalComponentArgsRest(__VLS_28), false));
var __VLS_26;
var __VLS_31 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
var __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    label: "状态",
}));
var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([{
        label: "状态",
    }], __VLS_functionalComponentArgsRest(__VLS_32), false));
__VLS_34.slots.default;
var __VLS_35 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    modelValue: (__VLS_ctx.formData.status),
    disabled: (__VLS_ctx.formData.id === '1'),
}));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.formData.status),
        disabled: (__VLS_ctx.formData.id === '1'),
    }], __VLS_functionalComponentArgsRest(__VLS_36), false));
__VLS_38.slots.default;
var __VLS_39 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
var __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    label: "active",
}));
var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([{
        label: "active",
    }], __VLS_functionalComponentArgsRest(__VLS_40), false));
__VLS_42.slots.default;
var __VLS_42;
var __VLS_43 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
var __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    label: "inactive",
}));
var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([{
        label: "inactive",
    }], __VLS_functionalComponentArgsRest(__VLS_44), false));
__VLS_46.slots.default;
var __VLS_46;
var __VLS_38;
var __VLS_34;
var __VLS_12;
{
    var __VLS_thisSlot = __VLS_3.slots.footer;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "dialog-footer" }));
    var __VLS_47 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    var __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47(__assign({ 'onClick': {} })));
    var __VLS_49 = __VLS_48.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_48), false));
    var __VLS_51 = void 0;
    var __VLS_52 = void 0;
    var __VLS_53 = void 0;
    var __VLS_54 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.dialogVisible = false;
        }
    };
    __VLS_50.slots.default;
    var __VLS_50;
    var __VLS_55 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    var __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55(__assign({ 'onClick': {} }, { type: "primary", loading: (__VLS_ctx.loading) })));
    var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { type: "primary", loading: (__VLS_ctx.loading) })], __VLS_functionalComponentArgsRest(__VLS_56), false));
    var __VLS_59 = void 0;
    var __VLS_60 = void 0;
    var __VLS_61 = void 0;
    var __VLS_62 = {
        onClick: (__VLS_ctx.handleSubmit)
    };
    __VLS_58.slots.default;
    var __VLS_58;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_14 = __VLS_13;
var __VLS_dollars;
var __VLS_self;
