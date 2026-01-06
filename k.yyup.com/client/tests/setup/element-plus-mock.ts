/**
 * Element Plus 全局Mock配置
 * 解决表单验证、组件引用等问题
 */

import { vi } from 'vitest'

// 创建Mock的表单引用
export const createMockFormRef = () => ({
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn(() => Promise.resolve(true)),
  scrollToField: vi.fn(),
  clearValidation: vi.fn()
})

// 创建Mock的输入框引用
export const createMockInputRef = () => ({
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn(),
  clear: vi.fn()
})

// 创建Mock的表格引用
export const createMockTableRef = () => ({
  clearSelection: vi.fn(),
  toggleRowSelection: vi.fn(),
  toggleAllSelection: vi.fn(),
  toggleRowExpansion: vi.fn(),
  setCurrentRow: vi.fn(),
  clearSort: vi.fn(),
  clearFilter: vi.fn(),
  doLayout: vi.fn(),
  sort: vi.fn()
})

// Element Plus 组件Mock
export const ElementPlusMocks = {
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>',
    props: ['model', 'rules', 'labelWidth', 'labelPosition'],
    emits: ['validate']
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div class="el-form-item"><slot /></div>',
    props: ['label', 'prop', 'required', 'rules']
  },
  ElInput: {
    name: 'ElInput',
    template: '<input class="el-input" />',
    props: ['modelValue', 'placeholder', 'disabled', 'type'],
    emits: ['update:modelValue', 'input', 'change', 'focus', 'blur']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot /></button>',
    props: ['type', 'size', 'disabled', 'loading'],
    emits: ['click']
  },
  ElDialog: {
    name: 'ElDialog',
    template: '<div class="el-dialog"><slot /></div>',
    props: ['modelValue', 'title', 'width', 'beforeClose'],
    emits: ['update:modelValue', 'close']
  },
  ElTable: {
    name: 'ElTable',
    template: '<table class="el-table"><slot /></table>',
    props: ['data', 'stripe', 'border', 'size'],
    emits: ['selection-change', 'current-change']
  },
  ElTableColumn: {
    name: 'ElTableColumn',
    template: '<td class="el-table-column"><slot /></td>',
    props: ['prop', 'label', 'width', 'type']
  },
  ElPagination: {
    name: 'ElPagination',
    template: '<div class="el-pagination"></div>',
    props: ['currentPage', 'pageSize', 'total'],
    emits: ['current-change', 'size-change']
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select class="el-select"><slot /></select>',
    props: ['modelValue', 'placeholder', 'disabled'],
    emits: ['update:modelValue', 'change']
  },
  ElOption: {
    name: 'ElOption',
    template: '<option class="el-option"><slot /></option>',
    props: ['value', 'label', 'disabled']
  },
  ElDatePicker: {
    name: 'ElDatePicker',
    template: '<input class="el-date-picker" />',
    props: ['modelValue', 'type', 'placeholder'],
    emits: ['update:modelValue', 'change']
  },
  ElSwitch: {
    name: 'ElSwitch',
    template: '<div class="el-switch"></div>',
    props: ['modelValue', 'disabled'],
    emits: ['update:modelValue', 'change']
  },
  ElCheckbox: {
    name: 'ElCheckbox',
    template: '<input type="checkbox" class="el-checkbox" />',
    props: ['modelValue', 'label', 'disabled'],
    emits: ['update:modelValue', 'change']
  },
  ElRadio: {
    name: 'ElRadio',
    template: '<input type="radio" class="el-radio" />',
    props: ['modelValue', 'label', 'disabled'],
    emits: ['update:modelValue', 'change']
  },
  ElTree: {
    name: 'ElTree',
    template: '<div class="el-tree"><slot /></div>',
    props: ['data', 'nodeKey', 'showCheckbox'],
    emits: ['check-change', 'node-click']
  },
  ElUpload: {
    name: 'ElUpload',
    template: '<div class="el-upload"><slot /></div>',
    props: ['action', 'fileList', 'autoUpload'],
    emits: ['change', 'success', 'error']
  },
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot /></div>',
    props: ['header', 'bodyStyle']
  },
  ElTabs: {
    name: 'ElTabs',
    template: '<div class="el-tabs"><slot /></div>',
    props: ['modelValue', 'type'],
    emits: ['update:modelValue', 'tab-click']
  },
  ElTabPane: {
    name: 'ElTabPane',
    template: '<div class="el-tab-pane"><slot /></div>',
    props: ['label', 'name', 'disabled']
  },
  ElCollapse: {
    name: 'ElCollapse',
    template: '<div class="el-collapse"><slot /></div>',
    props: ['modelValue'],
    emits: ['update:modelValue', 'change']
  },
  ElCollapseItem: {
    name: 'ElCollapseItem',
    template: '<div class="el-collapse-item"><slot /></div>',
    props: ['title', 'name', 'disabled']
  },
  ElDropdown: {
    name: 'ElDropdown',
    template: '<div class="el-dropdown"><slot /></div>',
    props: ['trigger', 'placement'],
    emits: ['command']
  },
  ElDropdownMenu: {
    name: 'ElDropdownMenu',
    template: '<ul class="el-dropdown-menu"><slot /></ul>'
  },
  ElDropdownItem: {
    name: 'ElDropdownItem',
    template: '<li class="el-dropdown-item"><slot /></li>',
    props: ['command', 'disabled']
  },
  ElTooltip: {
    name: 'ElTooltip',
    template: '<div class="el-tooltip"><slot /></div>',
    props: ['content', 'placement', 'disabled']
  },
  ElPopover: {
    name: 'ElPopover',
    template: '<div class="el-popover"><slot /></div>',
    props: ['content', 'title', 'trigger', 'placement']
  },
  ElAlert: {
    name: 'ElAlert',
    template: '<div class="el-alert"><slot /></div>',
    props: ['type', 'title', 'description', 'closable']
  },
  ElLoading: {
    name: 'ElLoading',
    template: '<div class="el-loading"><slot /></div>'
  },
  ElMessage: vi.fn(),
  ElMessageBox: {
    confirm: vi.fn(() => Promise.resolve()),
    alert: vi.fn(() => Promise.resolve()),
    prompt: vi.fn(() => Promise.resolve({ value: 'test' }))
  },
  ElNotification: vi.fn()
}

// 全局Mock Element Plus
vi.mock('element-plus', () => ElementPlusMocks)

// 导出工具函数
export {
  createMockFormRef,
  createMockInputRef,
  createMockTableRef,
  ElementPlusMocks
}
