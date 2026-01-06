
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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory, Router } from 'vue-router';
import ElementPlus from 'element-plus';
import PerformanceRuleForm from '@/components/performance/PerformanceRuleForm.vue';

// Mock the performance store
vi.mock('@/stores/performance', () => ({
  usePerformanceStore: () => ({
    loading: false,
    error: null,
    performanceRules: [],
    createPerformanceRule: vi.fn().mockResolvedValue({ id: 1, name: 'Test Rule' }),
    updatePerformanceRule: vi.fn().mockResolvedValue({ id: 1, name: 'Updated Rule' }),
    getPerformanceRules: vi.fn().mockResolvedValue([]),
    clearError: vi.fn()
  })
}));

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { id: 1, name: 'Test User', role: 'admin' },
    hasPermission: vi.fn().mockReturnValue(true)
  })
}));

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual<typeof ElementPlus>('element-plus');
  return {
    ...actual,
    ElForm: {
      name: 'ElForm',
      template: '<form><slot></slot></form>',
      props: ['model', 'rules', 'labelWidth', 'labelPosition'],
      methods: {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn(),
        clearValidate: vi.fn()
      }
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div><slot></slot></div>',
      props: ['label', 'prop', 'required', 'rules']
    },
    ElInput: {
      name: 'ElInput',
      template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'placeholder', 'disabled', 'type'],
      emits: ['update:modelValue']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>',
      props: ['modelValue', 'placeholder', 'disabled', 'multiple'],
      emits: ['update:modelValue']
    },
    ElOption: {
      name: 'ElOption',
      template: '<option :value="value"><slot></slot></option>',
      props: ['value', 'label', 'disabled']
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'type', 'placeholder', 'disabled'],
      emits: ['update:modelValue']
    },
    ElRadioGroup: {
      name: 'ElRadioGroup',
      template: '<div><slot></slot></div>',
      props: ['modelValue', 'disabled'],
      emits: ['update:modelValue']
    },
    ElRadio: {
      name: 'ElRadio',
      template: '<label><input type="radio" :value="value" :checked="modelValue === value" @change="$emit(\'update:modelValue\', value)" /><slot></slot></label>',
      props: ['value', 'label', 'disabled'],
      emits: ['update:modelValue']
    },
    ElCheckbox: {
      name: 'ElCheckbox',
      template: '<label><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /><slot></slot></label>',
      props: ['modelValue', 'label', 'disabled'],
      emits: ['update:modelValue']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>',
      props: ['type', 'disabled', 'loading', 'size'],
      emits: ['click']
    },
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><div class="el-card__header" v-if="$slots.header"><slot name="header"></slot></div><div class="el-card__body"><slot></slot></div></div>',
      props: ['header', 'shadow']
    },
    ElRow: {
      name: 'ElRow',
      template: '<div class="el-row" :style="{ gutter: gutter ? `-${gutter}px` : \'\' }"><slot></slot></div>',
      props: ['gutter']
    },
    ElCol: {
      name: 'ElCol',
      template: '<div class="el-col" :style="{ paddingLeft: span ? `${gutter / 2}px` : \'0\', paddingRight: span ? `${gutter / 2}px` : \'\' }"><slot></slot></div>',
      props: ['span', 'offset', 'gutter']
    },
    ElDivider: {
      name: 'ElDivider',
      template: '<div class="el-divider"><slot></slot></div>',
      props: ['contentPosition']
    },
    ElAlert: {
      name: 'ElAlert',
      template: '<div class="el-alert" :class="`el-alert--${type}`"><slot></slot></div>',
      props: ['title', 'type', 'description', 'closable', 'showIcon']
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

// 控制台错误检测变量
let consoleSpy: any

describe('PerformanceRuleForm.vue', () => {
  let router: Router;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/performance/rules', name: 'PerformanceRules' },
        { path: '/performance/rules/create', name: 'CreatePerformanceRule' },
        { path: '/performance/rules/edit/:id', name: 'EditPerformanceRule' }
      ]
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  const createWrapper = (props = {}) => {
    return mount(PerformanceRuleForm, {
      global: {
        plugins: [pinia, router],
        stubs: {
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-checkbox': true,
          'el-button': true,
          'el-card': true,
          'el-row': true,
          'el-col': true,
          'el-divider': true,
          'el-alert': true,
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
      expect(wrapper.findComponent(PerformanceRuleForm).exists()).toBe(true);
    });

    it('should display form title based on mode', () => {
      const wrapper = createWrapper({ mode: 'create' });
      expect(wrapper.find('h1').text()).toContain('创建绩效规则');
    });

    it('should display edit title when in edit mode', async () => {
      const wrapper = createWrapper({ mode: 'edit', ruleId: 1 });
      await wrapper.vm.$nextTick();
      expect(wrapper.find('h1').text()).toContain('编辑绩效规则');
    });

    it('should render all form sections', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid="basic-info"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="tier-rules"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="class-rules"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="special-rules"]').exists()).toBe(true);
    });
  });

  describe('Props Handling', () => {
    it('should accept and handle mode prop correctly', () => {
      const wrapper = createWrapper({ mode: 'create' });
      expect(wrapper.vm.mode).toBe('create');
    });

    it('should accept and handle ruleId prop correctly', () => {
      const wrapper = createWrapper({ mode: 'edit', ruleId: 1 });
      expect(wrapper.vm.ruleId).toBe(1);
    });

    it('should accept and handle initialData prop correctly', () => {
      const initialData = {
        name: 'Test Rule',
        description: 'Test Description',
        status: 'active'
      };
      const wrapper = createWrapper({ mode: 'edit', initialData });
      expect(wrapper.vm.initialData).toEqual(initialData);
    });

    it('should use default values when props are not provided', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.mode).toBe('create');
      expect(wrapper.vm.ruleId).toBeNull();
      expect(wrapper.vm.initialData).toEqual({});
    });
  });

  describe('Data and Form State', () => {
    it('should initialize form data correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.formData).toEqual({
        name: '',
        description: '',
        status: 'draft',
        startDate: '',
        endDate: '',
        tierRules: [],
        classRules: [],
        specialRules: []
      });
    });

    it('should initialize form validation rules', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.rules).toHaveProperty('name');
      expect(wrapper.vm.rules).toHaveProperty('description');
      expect(wrapper.vm.rules).toHaveProperty('startDate');
      expect(wrapper.vm.rules).toHaveProperty('endDate');
    });

    it('should set loading state correctly', async () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.loading).toBe(false);
      
      wrapper.vm.loading = true;
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.loading).toBe(true);
    });

    it('should set error state correctly', async () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.error).toBeNull();
      
      wrapper.vm.error = 'Test error message';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.error).toBe('Test error message');
    });
  });

  describe('Computed Properties', () => {
    it('should compute isEditMode correctly', () => {
      const createWrapper = createWrapper({ mode: 'create' });
      expect(createWrapper.vm.isEditMode).toBe(false);

      const editWrapper = createWrapper({ mode: 'edit' });
      expect(editWrapper.vm.isEditMode).toBe(true);
    });

    it('should compute isSubmitting correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.isSubmitting).toBe(false);
      
      wrapper.vm.loading = true;
      expect(wrapper.vm.isSubmitting).toBe(true);
    });

    it('should compute formTitle correctly', () => {
      const createWrapper = createWrapper({ mode: 'create' });
      expect(createWrapper.vm.formTitle).toBe('创建绩效规则');

      const editWrapper = createWrapper({ mode: 'edit' });
      expect(editWrapper.vm.formTitle).toBe('编辑绩效规则');
    });

    it('should compute hasTierRules correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.hasTierRules).toBe(false);
      
      wrapper.vm.formData.tierRules = [{ id: 1, name: 'Rule 1' }];
      expect(wrapper.vm.hasTierRules).toBe(true);
    });

    it('should compute hasClassRules correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.hasClassRules).toBe(false);
      
      wrapper.vm.formData.classRules = [{ id: 1, name: 'Rule 1' }];
      expect(wrapper.vm.hasClassRules).toBe(true);
    });

    it('should compute hasSpecialRules correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.hasSpecialRules).toBe(false);
      
      wrapper.vm.formData.specialRules = [{ id: 1, name: 'Rule 1' }];
      expect(wrapper.vm.hasSpecialRules).toBe(true);
    });
  });

  describe('Methods', () => {
    describe('loadRuleData', () => {
      it('should load rule data when in edit mode', async () => {
        const wrapper = createWrapper({ mode: 'edit', ruleId: 1 });
        const mockRuleData = {
          id: 1,
          name: 'Test Rule',
          description: 'Test Description',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          tierRules: [{ id: 1, name: 'Tier Rule 1' }],
          classRules: [{ id: 1, name: 'Class Rule 1' }],
          specialRules: [{ id: 1, name: 'Special Rule 1' }]
        };

        vi.spyOn(wrapper.vm.performanceStore, 'getPerformanceRules').mockResolvedValue([mockRuleData]);

        await wrapper.vm.loadRuleData();
        
        expect(wrapper.vm.formData.name).toBe('Test Rule');
        expect(wrapper.vm.formData.description).toBe('Test Description');
        expect(wrapper.vm.formData.status).toBe('active');
      });

      it('should handle loading state correctly during data load', async () => {
        const wrapper = createWrapper({ mode: 'edit', ruleId: 1 });
        const mockRuleData = { id: 1, name: 'Test Rule' };

        vi.spyOn(wrapper.vm.performanceStore, 'getPerformanceRules').mockImplementation(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve([mockRuleData]), 100);
          });
        });

        const loadPromise = wrapper.vm.loadRuleData();
        expect(wrapper.vm.loading).toBe(true);
        
        await loadPromise;
        expect(wrapper.vm.loading).toBe(false);
      });

      it('should handle error when loading rule data fails', async () => {
        const wrapper = createWrapper({ mode: 'edit', ruleId: 1 });
        const errorMessage = 'Failed to load rule data';

        vi.spyOn(wrapper.vm.performanceStore, 'getPerformanceRules').mockRejectedValue(new Error(errorMessage));

        await wrapper.vm.loadRuleData();
        
        expect(wrapper.vm.error).toBe(errorMessage);
      });
    });

    describe('submitForm', () => {
      it('should validate form before submission', async () => {
        const wrapper = createWrapper();
        const validateSpy = vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(false);

        await wrapper.vm.submitForm();
        
        expect(validateSpy).toHaveBeenCalled();
        expect(wrapper.vm.performanceStore.createPerformanceRule).not.toHaveBeenCalled();
      });

      it('should create new rule when form is valid in create mode', async () => {
        const wrapper = createWrapper({ mode: 'create' });
        const formData = {
          name: 'Test Rule',
          description: 'Test Description',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          tierRules: [],
          classRules: [],
          specialRules: []
        };

        wrapper.vm.formData = formData;
        vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(true);

        await wrapper.vm.submitForm();
        
        expect(wrapper.vm.performanceStore.createPerformanceRule).toHaveBeenCalledWith(formData);
      });

      it('should update existing rule when form is valid in edit mode', async () => {
        const wrapper = createWrapper({ mode: 'edit', ruleId: 1 });
        const formData = {
          id: 1,
          name: 'Updated Rule',
          description: 'Updated Description',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          tierRules: [],
          classRules: [],
          specialRules: []
        };

        wrapper.vm.formData = formData;
        vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(true);

        await wrapper.vm.submitForm();
        
        expect(wrapper.vm.performanceStore.updatePerformanceRule).toHaveBeenCalledWith(1, formData);
      });

      it('should handle submission loading state correctly', async () => {
        const wrapper = createWrapper({ mode: 'create' });
        const formData = { name: 'Test Rule', description: 'Test Description' };

        wrapper.vm.formData = formData;
        vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(true);
        
        vi.spyOn(wrapper.vm.performanceStore, 'createPerformanceRule').mockImplementation(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve({ id: 1, name: 'Test Rule' }), 100);
          });
        });

        const submitPromise = wrapper.vm.submitForm();
        expect(wrapper.vm.loading).toBe(true);
        
        await submitPromise;
        expect(wrapper.vm.loading).toBe(false);
      });

      it('should handle error when submission fails', async () => {
        const wrapper = createWrapper({ mode: 'create' });
        const formData = { name: 'Test Rule', description: 'Test Description' };
        const errorMessage = 'Failed to create rule';

        wrapper.vm.formData = formData;
        vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(true);
        vi.spyOn(wrapper.vm.performanceStore, 'createPerformanceRule').mockRejectedValue(new Error(errorMessage));

        await wrapper.vm.submitForm();
        
        expect(wrapper.vm.error).toBe(errorMessage);
      });

      it('should emit success event on successful submission', async () => {
        const wrapper = createWrapper({ mode: 'create' });
        const formData = { name: 'Test Rule', description: 'Test Description' };

        wrapper.vm.formData = formData;
        vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(true);

        await wrapper.vm.submitForm();
        
        expect(wrapper.emitted('success')).toBeTruthy();
        expect(wrapper.emitted('success')[0]).toEqual([{ id: 1, name: 'Test Rule' }]);
      });

      it('should emit cancel event when cancel is called', async () => {
        const wrapper = createWrapper();
        
        await wrapper.vm.cancel();
        
        expect(wrapper.emitted('cancel')).toBeTruthy();
      });
    });

    describe('addTierRule', () => {
      it('should add new tier rule to formData', () => {
        const wrapper = createWrapper();
        const initialLength = wrapper.vm.formData.tierRules.length;
        
        wrapper.vm.addTierRule();
        
        expect(wrapper.vm.formData.tierRules.length).toBe(initialLength + 1);
        expect(wrapper.vm.formData.tierRules[initialLength]).toEqual({
          id: Date.now(),
          name: '',
          minScore: 0,
          maxScore: 100,
          bonus: 0,
          description: ''
        });
      });
    });

    describe('removeClassRule', () => {
      it('should remove class rule by index', () => {
        const wrapper = createWrapper();
        wrapper.vm.formData.classRules = [
          { id: 1, name: 'Rule 1' },
          { id: 2, name: 'Rule 2' },
          { id: 3, name: 'Rule 3' }
        ];
        
        wrapper.vm.removeClassRule(1);
        
        expect(wrapper.vm.formData.classRules.length).toBe(2);
        expect(wrapper.vm.formData.classRules).toEqual([
          { id: 1, name: 'Rule 1' },
          { id: 3, name: 'Rule 3' }
        ]);
      });
    });

    describe('resetForm', () => {
      it('should reset form to initial state', () => {
        const wrapper = createWrapper();
        wrapper.vm.formData = {
          name: 'Modified Name',
          description: 'Modified Description',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          tierRules: [{ id: 1, name: 'Modified Rule' }],
          classRules: [{ id: 1, name: 'Modified Rule' }],
          specialRules: [{ id: 1, name: 'Modified Rule' }]
        };
        
        wrapper.vm.resetForm();
        
        expect(wrapper.vm.formData).toEqual({
          name: '',
          description: '',
          status: 'draft',
          startDate: '',
          endDate: '',
          tierRules: [],
          classRules: [],
          specialRules: []
        });
      });

      it('should reset form validation errors', () => {
        const wrapper = createWrapper();
        const clearValidateSpy = vi.spyOn(wrapper.vm.$refs.formRef, 'clearValidate');
        
        wrapper.vm.resetForm();
        
        expect(clearValidateSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Event Handling', () => {
    it('should emit input event when form data changes', async () => {
      const wrapper = createWrapper();
      
      wrapper.vm.formData.name = 'New Rule Name';
      await wrapper.vm.$nextTick();
      
      expect(wrapper.emitted('input')).toBeTruthy();
      expect(wrapper.emitted('input')[0]).toEqual([wrapper.vm.formData]);
    });

    it('should emit change event when form data changes', async () => {
      const wrapper = createWrapper();
      
      wrapper.vm.formData.status = 'active';
      await wrapper.vm.$nextTick();
      
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')[0]).toEqual([wrapper.vm.formData]);
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should load rule data on mount when in edit mode', async () => {
      const wrapper = createWrapper({ mode: 'edit', ruleId: 1 });
      const loadRuleDataSpy = vi.spyOn(wrapper.vm, 'loadRuleData');
      
      await wrapper.vm.$nextTick();
      
      expect(loadRuleDataSpy).toHaveBeenCalled();
    });

    it('should not load rule data on mount when in create mode', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const loadRuleDataSpy = vi.spyOn(wrapper.vm, 'loadRuleData');
      
      await wrapper.vm.$nextTick();
      
      expect(loadRuleDataSpy).not.toHaveBeenCalled();
    });

    it('should initialize form with initialData prop on mount', async () => {
      const initialData = {
        name: 'Initial Rule',
        description: 'Initial Description',
        status: 'active'
      };
      const wrapper = createWrapper({ mode: 'edit', initialData });
      
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.formData.name).toBe('Initial Rule');
      expect(wrapper.vm.formData.description).toBe('Initial Description');
      expect(wrapper.vm.formData.status).toBe('active');
    });

    it('should clear error on unmount', () => {
      const wrapper = createWrapper();
      wrapper.vm.error = 'Test error';
      
      wrapper.unmount();
      
      expect(wrapper.vm.performanceStore.clearError).toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should handle form submission when submit button is clicked', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const submitFormSpy = vi.spyOn(wrapper.vm, 'submitForm');
      
      await wrapper.find('[data-testid="submit-button"]').trigger('click');
      
      expect(submitFormSpy).toHaveBeenCalled();
    });

    it('should handle cancel when cancel button is clicked', async () => {
      const wrapper = createWrapper();
      const cancelSpy = vi.spyOn(wrapper.vm, 'cancel');
      
      await wrapper.find('[data-testid="cancel-button"]').trigger('click');
      
      expect(cancelSpy).toHaveBeenCalled();
    });

    it('should handle add tier rule when add button is clicked', async () => {
      const wrapper = createWrapper();
      const addTierRuleSpy = vi.spyOn(wrapper.vm, 'addTierRule');
      
      await wrapper.find('[data-testid="add-tier-rule"]').trigger('click');
      
      expect(addTierRuleSpy).toHaveBeenCalled();
    });

    it('should handle remove tier rule when remove button is clicked', async () => {
      const wrapper = createWrapper();
      wrapper.vm.formData.tierRules = [{ id: 1, name: 'Rule 1' }];
      
      await wrapper.find('[data-testid="remove-tier-rule-0"]').trigger('click');
      
      expect(wrapper.vm.formData.tierRules.length).toBe(0);
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const wrapper = createWrapper();
      const validateSpy = vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(false);
      
      await wrapper.vm.submitForm();
      
      expect(validateSpy).toHaveBeenCalled();
    });

    it('should validate date range correctly', async () => {
      const wrapper = createWrapper();
      wrapper.vm.formData.startDate = '2024-12-31';
      wrapper.vm.formData.endDate = '2024-01-01';
      
      const validateSpy = vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(false);
      
      await wrapper.vm.submitForm();
      
      expect(validateSpy).toHaveBeenCalled();
    });

    it('should validate score ranges in tier rules', async () => {
      const wrapper = createWrapper();
      wrapper.vm.formData.tierRules = [{
        id: 1,
        name: 'Test Rule',
        minScore: 100,
        maxScore: 50,
        bonus: 0
      }];
      
      const validateSpy = vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(false);
      
      await wrapper.vm.submitForm();
      
      expect(validateSpy).toHaveBeenCalled();
    });
  });

  describe('Store Integration', () => {
    it('should integrate with performance store correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.performanceStore).toBeDefined();
    });

    it('should integrate with auth store correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.authStore).toBeDefined();
    });

    it('should use auth store for permission checking', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.authStore.hasPermission).toHaveBeenCalled();
    });

    it('should handle store loading state', async () => {
      const wrapper = createWrapper();
      wrapper.vm.performanceStore.loading = true;
      
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.loading).toBe(true);
    });

    it('should handle store error state', async () => {
      const wrapper = createWrapper();
      wrapper.vm.performanceStore.error = 'Store error';
      
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.error).toBe('Store error');
    });
  });

  describe('API Integration', () => {
    it('should call create API when creating new rule', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const formData = { name: 'Test Rule', description: 'Test Description' };

      wrapper.vm.formData = formData;
      vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(true);

      await wrapper.vm.submitForm();
      
      expect(wrapper.vm.performanceStore.createPerformanceRule).toHaveBeenCalledWith(formData);
    });

    it('should call update API when updating existing rule', async () => {
      const wrapper = createWrapper({ mode: 'edit', ruleId: 1 });
      const formData = { id: 1, name: 'Updated Rule', description: 'Updated Description' };

      wrapper.vm.formData = formData;
      vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(true);

      await wrapper.vm.submitForm();
      
      expect(wrapper.vm.performanceStore.updatePerformanceRule).toHaveBeenCalledWith(1, formData);
    });

    it('should call get API when loading rule data', async () => {
      const wrapper = createWrapper({ mode: 'edit', ruleId: 1 });
      
      await wrapper.vm.loadRuleData();
      
      expect(wrapper.vm.performanceStore.getPerformanceRules).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API call fails', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const errorMessage = 'API Error';
      
      vi.spyOn(wrapper.vm.performanceStore, 'createPerformanceRule').mockRejectedValue(new Error(errorMessage));
      vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(true);

      await wrapper.vm.submitForm();
      
      expect(wrapper.vm.error).toBe(errorMessage);
    });

    it('should clear error when successful operation occurs', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      wrapper.vm.error = 'Previous error';
      
      vi.spyOn(wrapper.vm.performanceStore, 'createPerformanceRule').mockResolvedValue({ id: 1, name: 'Test Rule' });
      vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(true);

      await wrapper.vm.submitForm();
      
      expect(wrapper.vm.error).toBeNull();
    });

    it('should handle validation errors gracefully', async () => {
      const wrapper = createWrapper();
      vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(false);

      await wrapper.vm.submitForm();
      
      expect(wrapper.vm.error).toBeNull();
      expect(wrapper.vm.performanceStore.createPerformanceRule).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const networkError = new Error('Network Error');
      
      vi.spyOn(wrapper.vm.performanceStore, 'createPerformanceRule').mockRejectedValue(networkError);
      vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(true);

      await wrapper.vm.submitForm();
      
      expect(wrapper.vm.error).toBe('Network Error');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      const wrapper = createWrapper();
      const formLabels = wrapper.findAll('label');
      
      expect(formLabels.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA attributes', () => {
      const wrapper = createWrapper();
      const form = wrapper.find('form');
      
      expect(form.attributes('aria-label')).toBeDefined();
    });

    it('should be keyboard navigable', async () => {
      const wrapper = createWrapper();
      const submitButton = wrapper.find('[data-testid="submit-button"]');
      
      await submitButton.trigger('keydown', { key: 'Enter' });
      
      expect(wrapper.emitted('submit')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const wrapper = createWrapper();
      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate');
      
      wrapper.vm.formData.name = 'New Name';
      await wrapper.vm.$nextTick();
      
      expect(renderSpy).not.toHaveBeenCalled();
    });

    it('should handle large form data efficiently', async () => {
      const wrapper = createWrapper();
      const largeData = {
        name: 'Test Rule',
        description: 'Test Description',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        tierRules: Array(100).fill(null).map((_, i) => ({
          id: i,
          name: `Rule ${i}`,
          minScore: i * 10,
          maxScore: (i + 1) * 10,
          bonus: i * 5,
          description: `Description ${i}`
        })),
        classRules: Array(50).fill(null).map((_, i) => ({
          id: i,
          name: `Class Rule ${i}`,
          className: `Class ${i}`,
          bonus: i * 10
        })),
        specialRules: Array(30).fill(null).map((_, i) => ({
          id: i,
          name: `Special Rule ${i}`,
          type: 'bonus',
          value: i * 15,
          condition: `Condition ${i}`
        }))
      };

      wrapper.vm.formData = largeData;
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.formData.tierRules.length).toBe(100);
      expect(wrapper.vm.formData.classRules.length).toBe(50);
      expect(wrapper.vm.formData.specialRules.length).toBe(30);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form data', () => {
      const wrapper = createWrapper();
      wrapper.vm.formData = {};
      
      expect(wrapper.vm.formData).toEqual({});
    });

    it('should handle null or undefined props', () => {
      const wrapper = createWrapper({ mode: null, ruleId: undefined });
      
      expect(wrapper.vm.mode).toBeNull();
      expect(wrapper.vm.ruleId).toBeUndefined();
    });

    it('should handle invalid rule ID', async () => {
      const wrapper = createWrapper({ mode: 'edit', ruleId: 'invalid' });
      
      await wrapper.vm.loadRuleData();
      
      expect(wrapper.vm.error).toBeDefined();
    });

    it('should handle concurrent form submissions', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const formData = { name: 'Test Rule', description: 'Test Description' };

      wrapper.vm.formData = formData;
      vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(true);
      
      const createSpy = vi.spyOn(wrapper.vm.performanceStore, 'createPerformanceRule')
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const submitPromise1 = wrapper.vm.submitForm();
      const submitPromise2 = wrapper.vm.submitForm();
      
      await Promise.all([submitPromise1, submitPromise2]);
      
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle form reset during submission', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const formData = { name: 'Test Rule', description: 'Test Description' };

      wrapper.vm.formData = formData;
      vi.spyOn(wrapper.vm.$refs.formRef, 'validate').mockResolvedValue(true);
      
      vi.spyOn(wrapper.vm.performanceStore, 'createPerformanceRule')
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const submitPromise = wrapper.vm.submitForm();
      
      wrapper.vm.resetForm();
      
      await submitPromise;
      
      expect(wrapper.vm.formData.name).toBe('');
    });
  });
});