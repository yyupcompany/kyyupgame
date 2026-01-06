import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// 导入Mock系统
import { initAuthMock, setCurrentTestUser, clearAuth } from './mocks/auth.mock'
import { initApiMock, resetApiMocks } from './mocks/api.mock'
import { initDomMock, resetDomMock } from './mocks/dom.mock'
import { setupRequestMock } from './mocks/request.mock'

// 导入控制台监控（可选启用）
// import { setupConsoleMonitoring } from './setup/console-monitoring'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(() => ({
    global: {
      t: vi.fn((key) => key),
      locale: 'zh-CN'
    }
  })),
  useI18n: vi.fn(() => ({
    t: vi.fn((key) => key),
    locale: { value: 'zh-CN' }
  }))
}))

// 全局表单引用Mock
global.mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn(() => Promise.resolve(true)),
  scrollToField: vi.fn(),
  clearValidation: vi.fn()
}

global.mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn(),
  clear: vi.fn()
}

// Mock Element Plus 全局
vi.mock('element-plus', () => {
  // 创建ElMessage Mock函数
  const mockElMessage = vi.fn()
  mockElMessage.success = vi.fn()
  mockElMessage.error = vi.fn()
  mockElMessage.warning = vi.fn()
  mockElMessage.info = vi.fn()

  return {
    default: {
      install: vi.fn()
    },
    // 消息组件 - 修复Mock函数
    ElMessage: mockElMessage,
    ElMessageBox: {
      alert: vi.fn().mockResolvedValue('confirm'),
      confirm: vi.fn().mockResolvedValue('confirm'),
      prompt: vi.fn().mockResolvedValue({ value: 'test' })
    },
    ElNotification: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    // 表单组件Mock - 移除重复定义，使用下面更完整的版本
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag" :class="[`el-tag--${type}`, `el-tag--${size}`]"><slot /></span>',
      props: ['type', 'size', 'effect', 'closable', 'disableTransitions', 'hit', 'color', 'round'],
      emits: ['close', 'click']
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div class="el-dialog" v-if="modelValue"><div class="el-dialog__header"><slot name="header" /></div><div class="el-dialog__body"><slot /></div><div class="el-dialog__footer"><slot name="footer" /></div></div>',
      props: ['modelValue', 'title', 'width', 'fullscreen', 'top', 'modal', 'modalClass', 'appendToBody', 'lockScroll', 'customClass', 'openDelay', 'closeDelay', 'closeOnClickModal', 'closeOnPressEscape', 'showClose', 'beforeClose', 'center', 'destroyOnClose'],
      emits: ['update:modelValue', 'open', 'opened', 'close', 'closed']
    },
    ElDrawer: {
      name: 'ElDrawer',
      template: '<div class="el-drawer" v-if="modelValue"><div class="el-drawer__header"><slot name="header" /></div><div class="el-drawer__body"><slot /></div></div>',
      props: ['modelValue', 'title', 'size', 'direction', 'modal', 'appendToBody', 'lockScroll', 'closeOnClickModal', 'closeOnPressEscape', 'showClose', 'beforeClose'],
      emits: ['update:modelValue', 'open', 'opened', 'close', 'closed']
    },
    ElForm: {
      name: 'ElForm',
      template: '<form class="el-form"><slot /></form>',
      props: ['model', 'rules', 'inline', 'labelPosition', 'labelWidth', 'labelSuffix', 'hideRequiredAsterisk', 'showMessage', 'inlineMessage', 'statusIcon', 'validateOnRuleChange', 'size', 'disabled'],
      setup() {
        const validate = vi.fn((callback) => {
          if (callback) {
            callback(true)
          }
          return Promise.resolve(true)
        })
        const validateField = vi.fn(() => Promise.resolve(true))
        const resetFields = vi.fn()
        const clearValidate = vi.fn()

        return {
          validate,
          validateField,
          resetFields,
          clearValidate
        }
      }
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><label class="el-form-item__label" v-if="label">{{ label }}</label><div class="el-form-item__content"><slot /></div></div>',
      props: ['prop', 'label', 'labelWidth', 'required', 'rules', 'error', 'showMessage', 'inlineMessage', 'size']
    },
    ElInput: {
      name: 'ElInput',
      template: '<div class="el-input"><input class="el-input__inner" :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" @change="$emit(\'change\', $event.target.value)" @blur="$emit(\'blur\', $event)" @focus="$emit(\'focus\', $event)" /></div>',
      props: ['modelValue', 'type', 'placeholder', 'disabled', 'size', 'clearable', 'showPassword', 'showWordLimit', 'prefixIcon', 'suffixIcon', 'rows', 'autosize', 'autocomplete', 'name', 'readonly', 'max', 'min', 'step', 'resize', 'autofocus', 'form', 'label', 'tabindex', 'validateEvent'],
      emits: ['update:modelValue', 'change', 'blur', 'focus', 'clear', 'input'],
      setup() {
        const focus = vi.fn()
        const blur = vi.fn()
        const select = vi.fn()
        const clear = vi.fn()

        return {
          focus,
          blur,
          select,
          clear
        }
      }
    },
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button" :class="[`el-button--${type}`, `el-button--${size}`]" :disabled="disabled || loading" @click="$emit(\'click\', $event)"><slot /></button>',
      props: ['type', 'size', 'plain', 'round', 'circle', 'loading', 'disabled', 'icon', 'autofocus', 'nativeType', 'autoInsertSpace'],
      emits: ['click']
    },

    ElTable: {
      name: 'ElTable',
      template: '<div class="el-table"><table><thead><tr><slot name="header" /></tr></thead><tbody><tr v-for="(row, index) in data" :key="index"><slot :row="row" :index="index" /></tr></tbody></table></div>',
      props: ['data', 'height', 'maxHeight', 'stripe', 'border', 'size', 'fit', 'showHeader', 'highlightCurrentRow', 'currentRowKey', 'rowClassName', 'rowStyle', 'cellClassName', 'cellStyle', 'headerRowClassName', 'headerRowStyle', 'headerCellClassName', 'headerCellStyle', 'rowKey', 'emptyText', 'defaultExpandAll', 'expandRowKeys', 'defaultSort', 'tooltipEffect', 'showSummary', 'sumText', 'summaryMethod', 'spanMethod', 'selectOnIndeterminate', 'indent', 'lazy', 'load', 'treeProps', 'tableLayout', 'scrollbarAlwaysOn', 'flexible']
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<td class="el-table__cell"><slot /></td>',
      props: ['type', 'index', 'columnKey', 'label', 'prop', 'width', 'minWidth', 'fixed', 'renderHeader', 'sortable', 'sortMethod', 'sortBy', 'sortOrders', 'resizable', 'formatter', 'showOverflowTooltip', 'align', 'headerAlign', 'className', 'labelClassName', 'selectable', 'reserveSelection', 'filters', 'filterPlacement', 'filterMultiple', 'filterMethod', 'filteredValue']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<div class="el-select"><div class="el-input"><input class="el-input__inner" :value="modelValue" :placeholder="placeholder" readonly /><span class="el-input__suffix"><i class="el-select__caret el-input__icon"></i></span></div><div class="el-select-dropdown"><div class="el-scrollbar"><div class="el-select-dropdown__wrap"><ul class="el-scrollbar__view el-select-dropdown__list"><slot /></ul></div></div></div></div>',
      props: ['modelValue', 'multiple', 'disabled', 'valueKey', 'size', 'clearable', 'collapseTags', 'collapseTagsTooltip', 'multipleLimit', 'name', 'autocomplete', 'placeholder', 'filterable', 'allowCreate', 'filterMethod', 'remote', 'remoteMethod', 'loading', 'loadingText', 'noMatchText', 'noDataText', 'popperClass', 'reserveKeyword', 'defaultFirstOption', 'popperAppendToBody', 'automaticDropdown', 'clearIcon', 'fitInputWidth', 'suffixIcon', 'tagType', 'validateEvent'],
      emits: ['update:modelValue', 'change', 'remove-tag', 'clear', 'visible-change', 'focus', 'blur']
    },
    ElOption: {
      name: 'ElOption',
      template: '<li class="el-select-dropdown__item" :class="{ \'selected\': selected, \'is-disabled\': disabled }" @click="$emit(\'click\')"><slot>{{ label }}</slot></li>',
      props: ['value', 'label', 'disabled'],
      emits: ['click']
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<div class="el-date-editor"><input class="el-input__inner" :type="type === \'date\' ? \'date\' : \'text\'" :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" @change="$emit(\'change\', $event.target.value)" /></div>',
      props: ['modelValue', 'type', 'placeholder', 'format', 'valueFormat', 'disabled', 'size', 'editable', 'clearable', 'startPlaceholder', 'endPlaceholder', 'rangeSeparator', 'defaultValue', 'defaultTime', 'name', 'unlinkPanels', 'prefixIcon', 'clearIcon', 'validateEvent', 'disabledDate', 'shortcuts', 'cellClassName', 'teleported'],
      emits: ['update:modelValue', 'change', 'blur', 'focus', 'calendar-change', 'panel-change', 'visible-change']
    },
    ElInputNumber: {
      name: 'ElInputNumber',
      template: '<div class="el-input-number"><span class="el-input-number__decrease" @click="decrease"><i class="el-icon-minus"></i></span><span class="el-input-number__increase" @click="increase"><i class="el-icon-plus"></i></span><div class="el-input"><input class="el-input__inner" type="number" :value="modelValue" :min="min" :max="max" :step="step" :disabled="disabled" @input="handleInput" @change="$emit(\'change\', Number($event.target.value))" /></div></div>',
      props: ['modelValue', 'min', 'max', 'step', 'stepStrictly', 'precision', 'size', 'disabled', 'controls', 'controlsPosition', 'name', 'label', 'placeholder', 'id', 'validateEvent'],
      emits: ['update:modelValue', 'change', 'blur', 'focus'],
      methods: {
        decrease: vi.fn(),
        increase: vi.fn(),
        handleInput: vi.fn((e) => {
          const value = Number(e.target.value)
          this.$emit('update:modelValue', value)
        })
      }
    },
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card" :class="{ \'is-always-shadow\': shadow === \'always\', \'is-hover-shadow\': shadow === \'hover\', \'is-never-shadow\': shadow === \'never\' }"><div class="el-card__header" v-if="$slots.header || header"><slot name="header">{{ header }}</slot></div><div class="el-card__body"><slot /></div></div>',
      props: ['header', 'bodyStyle', 'shadow']
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<i class="el-icon" :style="{ fontSize: size + \'px\', color }"><slot /></i>',
      props: ['size', 'color']
    },
    ElDescriptions: {
      name: 'ElDescriptions',
      template: '<div class="el-descriptions"><div class="el-descriptions__header" v-if="title || extra || $slots.title || $slots.extra"><div class="el-descriptions__title" v-if="title || $slots.title"><slot name="title">{{ title }}</slot></div><div class="el-descriptions__extra" v-if="extra || $slots.extra"><slot name="extra">{{ extra }}</slot></div></div><div class="el-descriptions__body"><table class="el-descriptions__table" :class="{ \'is-bordered\': border }"><tbody><slot /></tbody></table></div></div>',
      props: ['border', 'column', 'direction', 'size', 'title', 'extra']
    },
    ElDescriptionsItem: {
      name: 'ElDescriptionsItem',
      template: '<tr><td class="el-descriptions__cell el-descriptions__label" :class="{ \'is-bordered-label\': border }"><slot name="label">{{ label }}</slot></td><td class="el-descriptions__cell el-descriptions__content" :class="{ \'is-bordered-content\': border }"><slot /></td></tr>',
      props: ['label', 'span', 'width', 'minWidth', 'align', 'labelAlign', 'className', 'labelClassName']
    },
    // 新增常用组件
    ElLoading: {
      name: 'ElLoading',
      template: '<div class="el-loading-mask"><div class="el-loading-spinner"><slot /></div></div>',
      props: ['text', 'spinner', 'background']
    },
    ElTooltip: {
      name: 'ElTooltip',
      template: '<span><slot /></span>',
      props: ['content', 'placement', 'disabled', 'offset', 'transition', 'visibleArrow', 'popperOptions', 'showAfter', 'hideAfter', 'autoClose', 'manual', 'popperClass', 'enterable', 'tabindex']
    },
    ElPopover: {
      name: 'ElPopover',
      template: '<span><slot name="reference" /><div v-if="visible"><slot /></div></span>',
      props: ['trigger', 'title', 'content', 'width', 'placement', 'disabled', 'visible', 'offset', 'transition', 'showArrow', 'popperOptions', 'popperClass', 'showAfter', 'hideAfter', 'autoClose', 'tabindex'],
      emits: ['show', 'hide', 'after-enter', 'after-leave']
    }
  }
})

// Vue Test Utils 全局配置
const pinia = createPinia()
config.global.plugins = [pinia]
config.global.stubs = {
  // 路由组件
  'router-link': {
    template: '<a v-bind="$attrs"><slot /></a>',
    props: ['to']
  },
  'router-view': {
    template: '<div class="router-view-stub"><slot /></div>'
  }
}

// Mock Vue Router
const mockRoute = {
  path: '/',
  params: {},
  query: {},
  meta: {},
  name: 'home',
  fullPath: '/',
  matched: [],
  hash: '',
  redirectedFrom: undefined
}

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: { value: mockRoute },
  resolve: vi.fn(),
  addRoute: vi.fn(),
  removeRoute: vi.fn(),
  hasRoute: vi.fn(),
  getRoutes: vi.fn(() => [])
}

// Global mocks
config.global.mocks = {
  $t: (key: string) => key,
  $route: mockRoute,
  $router: mockRouter
}

// 设置测试环境
process.env.NODE_ENV = 'test';

// 设置测试环境的API配置 - 确保使用localhost而不是生产域名
process.env.VITE_API_BASE_URL = 'http://localhost:3000/api';
process.env.VITE_API_PROXY_TARGET = 'http://localhost:3000';
process.env.VITE_DEV_HOST = 'localhost';
process.env.VITE_HMR_HOST = 'localhost';

// 全局模拟
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ResizeObserver 和 IntersectionObserver 已在 DOM Mock 中处理

// 模拟 localStorage - 使用真实的存储功能
const localStorageData: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageData[key] || null),
  setItem: vi.fn((key: string, value: string) => { localStorageData[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageData[key]; }),
  clear: vi.fn(() => { Object.keys(localStorageData).forEach(key => delete localStorageData[key]); }),
  length: 0,
  key: vi.fn((index: number) => Object.keys(localStorageData)[index] || null)
} as Storage;
global.localStorage = localStorageMock;

// 模拟 sessionStorage - 使用真实的存储功能
const sessionStorageData: Record<string, string> = {};
const sessionStorageMock = {
  getItem: vi.fn((key: string) => sessionStorageData[key] || null),
  setItem: vi.fn((key: string, value: string) => { sessionStorageData[key] = value; }),
  removeItem: vi.fn((key: string) => { delete sessionStorageData[key]; }),
  clear: vi.fn(() => { Object.keys(sessionStorageData).forEach(key => delete sessionStorageData[key]); }),
  length: 0,
  key: vi.fn((index: number) => Object.keys(sessionStorageData)[index] || null)
} as Storage;
global.sessionStorage = sessionStorageMock;

// 模拟 fetch (将在initApiMock中重新设置)
global.fetch = vi.fn();

// Mock date-fns format function
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr = 'yyyy-MM-dd') => {
    const d = new Date(date)
    if (formatStr === 'yyyy-MM-dd') {
      return d.toISOString().split('T')[0]
    }
    if (formatStr === 'yyyy-MM-dd HH:mm:ss') {
      return d.toISOString().replace('T', ' ').split('.')[0]
    }
    if (formatStr === 'YYYY年MM月DD日') {
      return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`
    }
    return d.toISOString().split('T')[0]
  })
}));

// 模拟 URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn()
}

// 全局测试工具函数
export const testUtils = {
  // 等待Vue更新
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),

  // 等待指定时间
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // 创建测试用户数据
  createTestUser: () => ({
    id: Math.floor(Math.random() * 10000),
    username: `test_user_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    role: 'user',
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),

  // 模拟API响应
  mockApiResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Headers(),
  }),

  // 模拟路由
  mockRoute: (overrides: any = {}) => ({
    path: '/',
    name: 'home',
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: [],
    meta: {},
    redirectedFrom: undefined,
    ...overrides
  }),

  // 清理所有模拟
  clearAllMocks: () => {
    vi.clearAllMocks();
    (localStorageMock.getItem as any).mockClear?.();
    (localStorageMock.setItem as any).mockClear?.();
    (localStorageMock.removeItem as any).mockClear?.();
    (localStorageMock.clear as any).mockClear?.();
    (sessionStorageMock.getItem as any).mockClear?.();
    (sessionStorageMock.setItem as any).mockClear?.();
    (sessionStorageMock.removeItem as any).mockClear?.();
    (sessionStorageMock.clear as any).mockClear?.();
    resetApiMocks();
    resetDomMock();
  }
}

// 全局设置
beforeAll(() => {
  // 初始化Mock系统
  console.log('🚀 初始化测试Mock系统...')

  // 初始化DOM Mock (必须最先初始化)
  initDomMock()

  // 初始化认证Mock
  initAuthMock()

  // 初始化API Mock
  initApiMock()

  // 设置Request Mock（解决aiService导出问题）
  setupRequestMock()

  // 启用控制台监控（可选）
  // setupConsoleMonitoring()

  console.log('✅ 测试Mock系统初始化完成')
});

afterAll(() => {
  // 测试结束后的全局清理
});

// 每个测试前的设置
beforeEach(() => {
  // 重新创建并设置Pinia实例
  const pinia = createPinia()
  setActivePinia(pinia)
  config.global.plugins = [pinia]

  // 重置认证状态
  setCurrentTestUser('admin')

  // 清理所有模拟
  testUtils.clearAllMocks();

  // 重置DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

// 每个测试后的清理
afterEach(() => {
  // 清理定时器
  vi.clearAllTimers();

  // 清理所有模拟
  testUtils.clearAllMocks();
});

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);
});;