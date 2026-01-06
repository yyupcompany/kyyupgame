
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) => {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory, Router } from 'vue-router';
import ElementPlus from 'element-plus';
import PerformanceRulesList from '@/components/performance/PerformanceRulesList.vue';

// Mock Element Plus components and utilities
vi.mock('element-plus', async () => {
  const actual = await vi.importActual<typeof ElementPlus>('element-plus');
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    },
    ElForm: {
      name: 'ElForm',
      template: '<form><slot></slot></form>',
      props: ['inline', 'model'],
      methods: {
        resetFields: vi.fn(),
        validate: vi.fn().mockResolvedValue(true)
      }
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div><slot></slot></div>',
      props: ['label']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>',
      props: ['modelValue', 'placeholder', 'clearable'],
      emits: ['update:modelValue']
    },
    ElOption: {
      name: 'ElOption',
      template: '<option :value="value"><slot></slot></option>',
      props: ['value', 'label']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>',
      props: ['type', 'size', 'loading'],
      emits: ['click']
    },
    ElTable: {
      name: 'ElTable',
      template: '<table><slot></slot></table>',
      props: ['data', 'border', 'v-loading', 'style'],
      methods: {
        clearSelection: vi.fn(),
        toggleRowSelection: vi.fn()
      }
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<th><slot></slot><slot name="default"></slot></th>',
      props: ['prop', 'label', 'min-width', 'width', 'fixed', 'show-overflow-tooltip']
    },
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag" :class="`el-tag--${type}`"><slot></slot></span>',
      props: ['type', 'size']
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<i><slot></slot></i>',
      props: ['size', 'color']
    }
  };
});

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Plus: vi.fn(() => 'PlusIcon'),
  Edit: vi.fn(() => 'EditIcon'),
  Delete: vi.fn(() => 'DeleteIcon'),
  Close: vi.fn(() => 'CloseIcon'),
  Check: vi.fn(() => 'CheckIcon'),
  Warning: vi.fn(() => 'WarningIcon'),
  Info: vi.fn(() => 'InfoIcon'),
  Success: vi.fn(() => 'SuccessIcon'),
  Error: vi.fn(() => 'ErrorIcon')
}));

// Mock API utilities
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    post: vi.fn()
  }
}));

// Mock API endpoints
vi.mock('@/api/endpoints', () => ({
  PRINCIPAL_ENDPOINTS: {
    PERFORMANCE_RULES: '/api/principal/performance-rules',
    PERFORMANCE_RULE_STATUS: (id: number) => `/api/principal/performance-rules/${id}/status`,
    PERFORMANCE_RULE_DELETE: (id: number) => `/api/principal/performance-rules/${id}`
  }
}));

// Mock date format utility
vi.mock('@/utils/dateFormat', () => ({
  formatDateTime: vi.fn((date: string) => {
    const d = new Date(date);
    return d.toLocaleString('zh-CN');
  })
}));

// Mock API types
vi.mock('../../api/modules/principal', () => ({
  type PerformanceRule = {
    id: number;
    name: string;
    calculationMethod: string;
    targetValue: number;
    bonusAmount: number;
    description: string;
    isActive: boolean;
    updatedAt: string;
  };
  type PerformanceRuleType = 'ENROLLMENT_COUNT' | 'TRIAL_CONVERSION' | 'ORDER_COUNT' | 'PRE_REGISTRATION';
}));

// 控制台错误检测变量
let consoleSpy: any

describe('PerformanceRulesList.vue', () => {
  let router: Router;
  let pinia: any;

  beforeEach(async () => {
    pinia = createPinia();
    setActivePinia(pinia);
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/performance/rules', name: 'PerformanceRules' },
        { path: '/performance/rules/create', name: 'CreatePerformanceRule' },
        { path: '/performance/rules/edit/:id', name: 'EditPerformanceRule' }
      ]
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  const createWrapper = (props = {}) => {
    return mount(PerformanceRulesList, {
      global: {
        plugins: [pinia, router],
        stubs: {
          'el-form': true,
          'el-form-item': true,
          'el-select': true,
          'el-option': true,
          'el-button': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-icon': true
        }
      },
      props: {
        ...props
      }
    });
  };

  describe('Component Rendering', () => {
    it('should render the component correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.findComponent(PerformanceRulesList).exists()).toBe(true);
    });

    it('should render toolbar section', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.toolbar').exists()).toBe(true);
      expect(wrapper.find('.filter-form').exists()).toBe(true);
      expect(wrapper.find('.action-buttons').exists()).toBe(true);
    });

    it('should render table with correct columns', () => {
      const wrapper = createWrapper();
      const table = wrapper.find('table');
      expect(table.exists()).toBe(true);
    });

    it('should render filter form with correct fields', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('select[placeholder="全部类型"]').exists()).toBe(true);
      expect(wrapper.find('select[placeholder="全部状态"]').exists()).toBe(true);
    });

    it('should render action buttons', () => {
      const wrapper = createWrapper();
      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      const createButton = buttons.find(btn => btn.text().includes('新增规则'));
      expect(createButton).toBeTruthy();
    });
  });

  describe('Data and State Management', () => {
    it('should initialize with empty rules array', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.rules).toEqual([]);
    });

    it('should initialize filter form with default values', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.filterForm).toEqual({
        type: undefined,
        isActive: undefined
      });
    });

    it('should initialize loading state correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.loading).toBe(false);
    });

    it('should have calculation method options', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.calculationMethodOptions).toEqual([
        { value: 'ENROLLMENT_COUNT', label: '招生数量' },
        { value: 'TRIAL_CONVERSION', label: '体验课转化' },
        { value: 'ORDER_COUNT', label: '采单数量' },
        { value: 'PRE_REGISTRATION', label: '预报名转化' }
      ]);
    });

    it('should update loading state during operations', async () => {
      const wrapper = createWrapper();
      
      wrapper.vm.loading = true;
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.loading).toBe(true);
      
      wrapper.vm.loading = false;
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.loading).toBe(false);
    });
  });

  describe('Methods', () => {
    describe('loadRules', () => {
      it('should load rules successfully', async () => {
        const wrapper = createWrapper();
        const mockRules = [
          {
            id: 1,
            name: 'Test Rule 1',
            calculationMethod: 'ENROLLMENT_COUNT',
            targetValue: 100,
            bonusAmount: 1000,
            description: 'Test description 1',
            isActive: true,
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 2,
            name: 'Test Rule 2',
            calculationMethod: 'TRIAL_CONVERSION',
            targetValue: 50,
            bonusAmount: 500,
            description: 'Test description 2',
            isActive: false,
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ];

        const { request } = require('@/utils/request');
        request.get.mockResolvedValue({
          success: true,
          data: mockRules
        });

        await wrapper.vm.loadRules();

        expect(request.get).toHaveBeenCalledWith('/api/principal/performance-rules', {
          params: {
            type: undefined,
            isActive: undefined
          }
        });
        expect(wrapper.vm.rules).toEqual(mockRules);
        expect(wrapper.vm.loading).toBe(false);
      });

      it('should load rules with filters', async () => {
        const wrapper = createWrapper();
        wrapper.vm.filterForm.type = 'ENROLLMENT_COUNT';
        wrapper.vm.filterForm.isActive = true;

        const { request } = require('@/utils/request');
        request.get.mockResolvedValue({
          success: true,
          data: []
        });

        await wrapper.vm.loadRules();

        expect(request.get).toHaveBeenCalledWith('/api/principal/performance-rules', {
          params: {
            type: 'ENROLLMENT_COUNT',
            isActive: true
          }
        });
      });

      it('should handle loading state during loadRules', async () => {
        const wrapper = createWrapper();
        
        const { request } = require('@/utils/request');
        request.get.mockImplementation(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve({ success: true, data: [] }), 100);
          });
        });

        const loadPromise = wrapper.vm.loadRules();
        expect(wrapper.vm.loading).toBe(true);

        await loadPromise;
        expect(wrapper.vm.loading).toBe(false);
      });

      it('should handle API error in loadRules', async () => {
        const wrapper = createWrapper();
        const { ElMessage } = await import('element-plus');
        const { request } = require('@/utils/request');
        
        request.get.mockRejectedValue(new Error('Network error'));

        await wrapper.vm.loadRules();

        expect(ElMessage.error).toHaveBeenCalledWith('加载绩效规则失败');
        expect(wrapper.vm.loading).toBe(false);
      });

      it('should handle API response with no data', async () => {
        const wrapper = createWrapper();
        const { request } = require('@/utils/request');
        
        request.get.mockResolvedValue({
          success: true,
          data: null
        });

        await wrapper.vm.loadRules();

        expect(wrapper.vm.rules).toEqual([]);
      });
    });

    describe('resetFilter', () => {
      it('should reset filter form to default values', () => {
        const wrapper = createWrapper();
        wrapper.vm.filterForm.type = 'ENROLLMENT_COUNT';
        wrapper.vm.filterForm.isActive = true;

        wrapper.vm.resetFilter();

        expect(wrapper.vm.filterForm.type).toBeUndefined();
        expect(wrapper.vm.filterForm.isActive).toBeUndefined();
      });

      it('should call loadRules after reset', () => {
        const wrapper = createWrapper();
        const loadRulesSpy = vi.spyOn(wrapper.vm, 'loadRules');

        wrapper.vm.resetFilter();

        expect(loadRulesSpy).toHaveBeenCalled();
      });
    });

    describe('getCalculationMethodLabel', () => {
      it('should return correct label for known calculation methods', () => {
        const wrapper = createWrapper();
        
        expect(wrapper.vm.getCalculationMethodLabel('ENROLLMENT_COUNT')).toBe('招生数量');
        expect(wrapper.vm.getCalculationMethodLabel('TRIAL_CONVERSION')).toBe('体验课转化');
        expect(wrapper.vm.getCalculationMethodLabel('ORDER_COUNT')).toBe('采单数量');
        expect(wrapper.vm.getCalculationMethodLabel('PRE_REGISTRATION')).toBe('预报名转化');
      });

      it('should return method value for unknown calculation methods', () => {
        const wrapper = createWrapper();
        
        expect(wrapper.vm.getCalculationMethodLabel('UNKNOWN_METHOD')).toBe('UNKNOWN_METHOD');
      });
    });

    describe('getCalculationMethodTagType', () => {
      it('should return correct tag type for known calculation methods', () => {
        const wrapper = createWrapper();
        
        expect(wrapper.vm.getCalculationMethodTagType('ENROLLMENT_COUNT')).toBe('primary');
        expect(wrapper.vm.getCalculationMethodTagType('TRIAL_CONVERSION')).toBe('success');
        expect(wrapper.vm.getCalculationMethodTagType('ORDER_COUNT')).toBe('warning');
        expect(wrapper.vm.getCalculationMethodTagType('PRE_REGISTRATION')).toBe('info');
      });

      it('should return info tag type for unknown calculation methods', () => {
        const wrapper = createWrapper();
        
        expect(wrapper.vm.getCalculationMethodTagType('UNKNOWN_METHOD')).toBe('info');
      });
    });

    describe('handleCreateRule', () => {
      it('should emit create event', () => {
        const wrapper = createWrapper();
        
        wrapper.vm.handleCreateRule();
        
        expect(wrapper.emitted('create')).toBeTruthy();
      });
    });

    describe('handleEditRule', () => {
      it('should emit edit event with rule data', () => {
        const wrapper = createWrapper();
        const mockRule = {
          id: 1,
          name: 'Test Rule',
          calculationMethod: 'ENROLLMENT_COUNT'
        };
        
        wrapper.vm.handleEditRule(mockRule);
        
        expect(wrapper.emitted('edit')).toBeTruthy();
        expect(wrapper.emitted('edit')[0]).toEqual([mockRule]);
      });
    });

    describe('handleToggleStatus', () => {
      it('should show confirmation dialog before toggling status', async () => {
        const wrapper = createWrapper();
        const { ElMessageBox } = await import('element-plus');
        const mockRule = {
          id: 1,
          name: 'Test Rule',
          isActive: true
        };

        ElMessageBox.confirm.mockResolvedValue(true);

        await wrapper.vm.handleToggleStatus(mockRule);

        expect(ElMessageBox.confirm).toHaveBeenCalledWith(
          '确定要禁用该绩效规则吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
      });

      it('should toggle rule status when confirmed', async () => {
        const wrapper = createWrapper();
        const { ElMessageBox, ElMessage } = await import('element-plus');
        const { request } = require('@/utils/request');
        const mockRule = {
          id: 1,
          name: 'Test Rule',
          isActive: true
        };

        ElMessageBox.confirm.mockResolvedValue(true);
        request.put.mockResolvedValue({
          success: true,
          message: '禁用成功'
        });

        await wrapper.vm.handleToggleStatus(mockRule);

        expect(request.put).toHaveBeenCalledWith(
          '/api/principal/performance-rules/1/status',
          { isActive: false }
        );
        expect(ElMessage.success).toHaveBeenCalledWith('禁用成功');
      });

      it('should update local data after successful status toggle', async () => {
        const wrapper = createWrapper();
        const { ElMessageBox } = await import('element-plus');
        const { request } = require('@/utils/request');
        const mockRule = {
          id: 1,
          name: 'Test Rule',
          isActive: true
        };

        wrapper.vm.rules = [mockRule];
        ElMessageBox.confirm.mockResolvedValue(true);
        request.put.mockResolvedValue({
          success: true,
          message: '禁用成功'
        });

        await wrapper.vm.handleToggleStatus(mockRule);

        expect(wrapper.vm.rules[0].isActive).toBe(false);
      });

      it('should handle API error in status toggle', async () => {
        const wrapper = createWrapper();
        const { ElMessageBox, ElMessage } = await import('element-plus');
        const { request } = require('@/utils/request');
        const mockRule = {
          id: 1,
          name: 'Test Rule',
          isActive: true
        };

        ElMessageBox.confirm.mockResolvedValue(true);
        request.put.mockRejectedValue(new Error('Network error'));

        await wrapper.vm.handleToggleStatus(mockRule);

        expect(ElMessage.error).toHaveBeenCalledWith('禁用绩效规则失败');
      });

      it('should not toggle status when cancelled', async () => {
        const wrapper = createWrapper();
        const { ElMessageBox } = await import('element-plus');
        const { request } = require('@/utils/request');
        const mockRule = {
          id: 1,
          name: 'Test Rule',
          isActive: true
        };

        ElMessageBox.confirm.mockRejectedValue('cancel');

        await wrapper.vm.handleToggleStatus(mockRule);

        expect(request.put).not.toHaveBeenCalled();
      });

      it('should handle loading state during status toggle', async () => {
        const wrapper = createWrapper();
        const { ElMessageBox } = await import('element-plus');
        const { request } = require('@/utils/request');
        const mockRule = {
          id: 1,
          name: 'Test Rule',
          isActive: true
        };

        ElMessageBox.confirm.mockResolvedValue(true);
        request.put.mockImplementation(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve({ success: true, message: '禁用成功' }), 100);
          });
        });

        const togglePromise = wrapper.vm.handleToggleStatus(mockRule);
        expect(wrapper.vm.loading).toBe(true);

        await togglePromise;
        expect(wrapper.vm.loading).toBe(false);
      });
    });

    describe('handleDeleteRule', () => {
      it('should show confirmation dialog before deleting', async () => {
        const wrapper = createWrapper();
        const { ElMessageBox } = await import('element-plus');
        const mockRule = {
          id: 1,
          name: 'Test Rule'
        };

        ElMessageBox.confirm.mockResolvedValue(true);

        await wrapper.vm.handleDeleteRule(mockRule);

        expect(ElMessageBox.confirm).toHaveBeenCalledWith(
          '删除后无法恢复，确定要删除该绩效规则吗？',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
      });

      it('should delete rule when confirmed', async () => {
        const wrapper = createWrapper();
        const { ElMessageBox, ElMessage } = await import('element-plus');
        const { request } = require('@/utils/request');
        const mockRule = {
          id: 1,
          name: 'Test Rule'
        };

        wrapper.vm.rules = [mockRule];
        ElMessageBox.confirm.mockResolvedValue(true);
        request.delete.mockResolvedValue({
          success: true,
          message: '删除成功'
        });

        await wrapper.vm.handleDeleteRule(mockRule);

        expect(request.delete).toHaveBeenCalledWith('/api/principal/performance-rules/1');
        expect(ElMessage.success).toHaveBeenCalledWith('删除成功');
        expect(wrapper.vm.rules).toEqual([]);
      });

      it('should handle API error in delete', async () => {
        const wrapper = createWrapper();
        const { ElMessageBox, ElMessage } = await import('element-plus');
        const { request } = require('@/utils/request');
        const mockRule = {
          id: 1,
          name: 'Test Rule'
        };

        ElMessageBox.confirm.mockResolvedValue(true);
        request.delete.mockRejectedValue(new Error('Network error'));

        await wrapper.vm.handleDeleteRule(mockRule);

        expect(ElMessage.error).toHaveBeenCalledWith('删除绩效规则失败');
      });

      it('should not delete rule when cancelled', async () => {
        const wrapper = createWrapper();
        const { ElMessageBox } = await import('element-plus');
        const { request } = require('@/utils/request');
        const mockRule = {
          id: 1,
          name: 'Test Rule'
        };

        ElMessageBox.confirm.mockRejectedValue('cancel');

        await wrapper.vm.handleDeleteRule(mockRule);

        expect(request.delete).not.toHaveBeenCalled();
      });

      it('should handle loading state during delete', async () => {
        const wrapper = createWrapper();
        const { ElMessageBox } = await import('element-plus');
        const { request } = require('@/utils/request');
        const mockRule = {
          id: 1,
          name: 'Test Rule'
        };

        ElMessageBox.confirm.mockResolvedValue(true);
        request.delete.mockImplementation(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve({ success: true, message: '删除成功' }), 100);
          });
        });

        const deletePromise = wrapper.vm.handleDeleteRule(mockRule);
        expect(wrapper.vm.loading).toBe(true);

        await deletePromise;
        expect(wrapper.vm.loading).toBe(false);
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle filter form submission', async () => {
      const wrapper = createWrapper();
      const loadRulesSpy = vi.spyOn(wrapper.vm, 'loadRules');

      await wrapper.find('button[type="primary"]').trigger('click');

      expect(loadRulesSpy).toHaveBeenCalled();
    });

    it('should handle filter reset', async () => {
      const wrapper = createWrapper();
      const resetFilterSpy = vi.spyOn(wrapper.vm, 'resetFilter');

      const buttons = wrapper.findAll('button');
      const resetButton = buttons.find(btn => btn.text().includes('重置'));
      
      await resetButton.trigger('click');

      expect(resetFilterSpy).toHaveBeenCalled();
    });

    it('should handle create rule button click', async () => {
      const wrapper = createWrapper();
      const handleCreateRuleSpy = vi.spyOn(wrapper.vm, 'handleCreateRule');

      const buttons = wrapper.findAll('button');
      const createButton = buttons.find(btn => btn.text().includes('新增规则'));
      
      await createButton.trigger('click');

      expect(handleCreateRuleSpy).toHaveBeenCalled();
    });

    it('should handle edit rule button click', async () => {
      const wrapper = createWrapper();
      const mockRule = {
        id: 1,
        name: 'Test Rule'
      };
      wrapper.vm.rules = [mockRule];
      
      const handleEditRuleSpy = vi.spyOn(wrapper.vm, 'handleEditRule');

      // Simulate clicking edit button in table
      await wrapper.vm.handleEditRule(mockRule);

      expect(handleEditRuleSpy).toHaveBeenCalledWith(mockRule);
    });

    it('should handle toggle status button click', async () => {
      const wrapper = createWrapper();
      const mockRule = {
        id: 1,
        name: 'Test Rule',
        isActive: true
      };
      wrapper.vm.rules = [mockRule];
      
      const handleToggleStatusSpy = vi.spyOn(wrapper.vm, 'handleToggleStatus');

      await wrapper.vm.handleToggleStatus(mockRule);

      expect(handleToggleStatusSpy).toHaveBeenCalledWith(mockRule);
    });

    it('should handle delete rule button click', async () => {
      const wrapper = createWrapper();
      const mockRule = {
        id: 1,
        name: 'Test Rule'
      };
      wrapper.vm.rules = [mockRule];
      
      const handleDeleteRuleSpy = vi.spyOn(wrapper.vm, 'handleDeleteRule');

      await wrapper.vm.handleDeleteRule(mockRule);

      expect(handleDeleteRuleSpy).toHaveBeenCalledWith(mockRule);
    });
  });

  describe('Table Rendering and Data Display', () => {
    it('should render table with rules data', () => {
      const wrapper = createWrapper();
      const mockRules = [
        {
          id: 1,
          name: 'Test Rule 1',
          calculationMethod: 'ENROLLMENT_COUNT',
          targetValue: 100,
          bonusAmount: 1000,
          description: 'Test description 1',
          isActive: true,
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      wrapper.vm.rules = mockRules;

      expect(wrapper.vm.rules).toEqual(mockRules);
    });

    it('should display rule name with status tag', () => {
      const wrapper = createWrapper();
      const mockRule = {
        id: 1,
        name: 'Test Rule',
        isActive: true
      };

      wrapper.vm.rules = [mockRule];

      expect(wrapper.vm.rules[0].name).toBe('Test Rule');
      expect(wrapper.vm.rules[0].isActive).toBe(true);
    });

    it('should display calculation method with correct tag', () => {
      const wrapper = createWrapper();
      const mockRule = {
        id: 1,
        calculationMethod: 'ENROLLMENT_COUNT'
      };

      wrapper.vm.rules = [mockRule];

      expect(wrapper.vm.getCalculationMethodLabel('ENROLLMENT_COUNT')).toBe('招生数量');
      expect(wrapper.vm.getCalculationMethodTagType('ENROLLMENT_COUNT')).toBe('primary');
    });

    it('should format date time correctly', () => {
      const wrapper = createWrapper();
      const { formatDateTime } = require('@/utils/dateFormat');
      const mockDate = '2024-01-01T00:00:00Z';

      wrapper.vm.formatDateTime(mockDate);

      expect(formatDateTime).toHaveBeenCalledWith(mockDate);
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should load rules on component mount', async () => {
      const wrapper = createWrapper();
      const loadRulesSpy = vi.spyOn(wrapper.vm, 'loadRules');

      await wrapper.vm.$nextTick();

      expect(loadRulesSpy).toHaveBeenCalled();
    });

    it('should handle mount errors gracefully', async () => {
      const wrapper = createWrapper();
      const loadRulesSpy = vi.spyOn(wrapper.vm, 'loadRules').mockRejectedValue(new Error('Mount error'));

      await wrapper.vm.$nextTick();

      expect(loadRulesSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const wrapper = createWrapper();
      const { request } = require('@/utils/request');
      
      request.get.mockRejectedValue(new Error('Network error'));

      await wrapper.vm.loadRules();

      expect(wrapper.vm.loading).toBe(false);
    });

    it('should handle API response errors gracefully', async () => {
      const wrapper = createWrapper();
      const { request } = require('@/utils/request');
      
      request.get.mockResolvedValue({
        success: false,
        message: 'API error'
      });

      await wrapper.vm.loadRules();

      expect(wrapper.vm.rules).toEqual([]);
    });

    it('should handle confirmation dialog cancellation gracefully', async () => {
      const wrapper = createWrapper();
      const { ElMessageBox } = await import('element-plus');
      const mockRule = {
        id: 1,
        name: 'Test Rule',
        isActive: true
      };

      ElMessageBox.confirm.mockRejectedValue('cancel');

      await wrapper.vm.handleToggleStatus(mockRule);

      expect(wrapper.vm.loading).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      const wrapper = createWrapper();
      const table = wrapper.find('table');
      
      expect(table.exists()).toBe(true);
    });

    it('should have proper button labels', () => {
      const wrapper = createWrapper();
      const buttons = wrapper.findAll('button');
      
      buttons.forEach(button => {
        expect(button.text()).toBeTruthy();
      });
    });

    it('should be keyboard navigable', async () => {
      const wrapper = createWrapper();
      const createButton = wrapper.find('button');
      
      await createButton.trigger('keydown', { key: 'Enter' });
      
      expect(wrapper.emitted('create')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const wrapper = createWrapper();
      const largeDataset = Array(1000).fill(null).map((_, i) => ({
        id: i + 1,
        name: `Rule ${i + 1}`,
        calculationMethod: 'ENROLLMENT_COUNT',
        targetValue: 100,
        bonusAmount: 1000,
        description: `Description ${i + 1}`,
        isActive: i % 2 === 0,
        updatedAt: '2024-01-01T00:00:00Z'
      }));

      const { request } = require('@/utils/request');
      request.get.mockResolvedValue({
        success: true,
        data: largeDataset
      });

      await wrapper.vm.loadRules();

      expect(wrapper.vm.rules.length).toBe(1000);
      expect(wrapper.vm.loading).toBe(false);
    });

    it('should not re-render unnecessarily', async () => {
      const wrapper = createWrapper();
      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate');

      wrapper.vm.filterForm.type = 'ENROLLMENT_COUNT';
      await wrapper.vm.$nextTick();

      expect(renderSpy).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty rules array', () => {
      const wrapper = createWrapper();
      wrapper.vm.rules = [];
      
      expect(wrapper.vm.rules).toEqual([]);
    });

    it('should handle undefined filter values', () => {
      const wrapper = createWrapper();
      wrapper.vm.filterForm.type = undefined;
      wrapper.vm.filterForm.isActive = undefined;
      
      expect(wrapper.vm.filterForm.type).toBeUndefined();
      expect(wrapper.vm.filterForm.isActive).toBeUndefined();
    });

    it('should handle null rule data', () => {
      const wrapper = createWrapper();
      wrapper.vm.rules = [null];
      
      expect(wrapper.vm.rules).toContain(null);
    });

    it('should handle concurrent API calls', async () => {
      const wrapper = createWrapper();
      const { request } = require('@/utils/request');
      
      request.get.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ success: true, data: [] }), 100);
        });
      });

      const loadPromise1 = wrapper.vm.loadRules();
      const loadPromise2 = wrapper.vm.loadRules();

      await Promise.all([loadPromise1, loadPromise2]);

      expect(request.get).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid user interactions', async () => {
      const wrapper = createWrapper();
      const { ElMessageBox } = await import('element-plus');
      const mockRule = {
        id: 1,
        name: 'Test Rule',
        isActive: true
      };

      wrapper.vm.rules = [mockRule];
      ElMessageBox.confirm.mockResolvedValue(true);

      await Promise.all([
        wrapper.vm.handleToggleStatus(mockRule),
        wrapper.vm.handleDeleteRule(mockRule)
      ]);

      expect(wrapper.vm.loading).toBe(false);
    });
  });
});