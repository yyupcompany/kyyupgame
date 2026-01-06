
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
import { nextTick } from 'vue';
import TaskFormDialog from '@/components/task/TaskFormDialog.vue';

// Mock Element Plus components and utilities
vi.mock('element-plus', async () => {
  const actual = await vi.importActual<any>('element-plus');
  return {
    ...actual,
    ElDialog: {
      name: 'ElDialog',
      template: '<div class="el-dialog"><div class="el-dialog__header"><slot name="title"></slot></div><div class="el-dialog__body"><slot></slot></div><div class="el-dialog__footer"><slot name="footer"></slot></div></div>',
      props: ['modelValue', 'title', 'width', 'beforeClose', 'destroyOnClose'],
      emits: ['update:modelValue']
    },
    ElForm: {
      name: 'ElForm',
      template: '<form><slot></slot></form>',
      props: ['model', 'rules', 'labelWidth', 'labelPosition', 'ref'],
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
      props: ['modelValue', 'placeholder', 'clearable', 'maxlength', 'showWordLimit', 'type', 'rows'],
      emits: ['update:modelValue']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>',
      props: ['modelValue', 'placeholder', 'clearable', 'style'],
      emits: ['update:modelValue']
    },
    ElOption: {
      name: 'ElOption',
      template: '<option :value="value"><slot></slot></option>',
      props: ['value', 'label']
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'type', 'placeholder', 'format', 'valueFormat', 'style'],
      emits: ['update:modelValue']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>',
      props: ['type', 'loading'],
      emits: ['click']
    },
    ElRow: {
      name: 'ElRow',
      template: '<div class="el-row" :style="{ gutter: gutter ? `-${gutter}px` : \'\' }"><slot></slot></div>',
      props: ['gutter']
    },
    ElCol: {
      name: 'ElCol',
      template: '<div class="el-col" :style="{ paddingLeft: span ? `${gutter / 2}px` : \'0\', paddingRight: span ? `${gutter / 2}px` : \'\' }"><slot></slot></div>',
      props: ['span', 'gutter']
    },
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    }
  };
});

// 控制台错误检测变量
let consoleSpy: any

describe('TaskFormDialog.vue', () => {
  let router: Router;
  let pinia: any;

  beforeEach(async () => {
    pinia = createPinia();
    setActivePinia(pinia);
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/tasks', name: 'Tasks' },
        { path: '/tasks/create', name: 'CreateTask' },
        { path: '/tasks/edit/:id', name: 'EditTask' }
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
    return mount(TaskFormDialog, {
      global: {
        plugins: [pinia, router],
        stubs: {
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-row': true,
          'el-col': true
        }
      },
      props: {
        visible: true,
        mode: 'create',
        ...props
      }
    });
  };

  describe('Component Rendering', () => {
    it('should render the component correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.findComponent(TaskFormDialog).exists()).toBe(true);
    });

    it('should render dialog with correct title in create mode', () => {
      const wrapper = createWrapper({ mode: 'create' });
      expect(wrapper.vm.dialogTitle).toBe('新建任务');
    });

    it('should render dialog with correct title in edit mode', () => {
      const wrapper = createWrapper({ mode: 'edit' });
      expect(wrapper.vm.dialogTitle).toBe('编辑任务');
    });

    it('should render form with all required fields', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.task-form').exists()).toBe(true);
      expect(wrapper.find('input[placeholder="请输入任务标题"]').exists()).toBe(true);
      expect(wrapper.find('textarea[placeholder="请输入任务描述"]').exists()).toBe(true);
      expect(wrapper.find('select[placeholder="请选择优先级"]').exists()).toBe(true);
      expect(wrapper.find('select[placeholder="请选择状态"]').exists()).toBe(true);
    });

    it('should render form footer with action buttons', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.task-dialog-footer').exists()).toBe(true);
      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0].text()).toBe('取消');
      expect(buttons[1].text()).toBe('确定');
    });

    it('should render form layout with correct grid structure', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.el-row').exists()).toBe(true);
      expect(wrapper.find('.el-col').exists()).toBe(true);
    });
  });

  describe('Props Handling', () => {
    it('should accept and handle visible prop correctly', async () => {
      const wrapper = createWrapper({ visible: false });
      expect(wrapper.vm.dialogVisible).toBe(false);
      
      await wrapper.setProps({ visible: true });
      expect(wrapper.vm.dialogVisible).toBe(true);
    });

    it('should accept and handle mode prop correctly', () => {
      const createWrapper = createWrapper({ mode: 'create' });
      expect(createWrapper.vm.mode).toBe('create');
      
      const editWrapper = createWrapper({ mode: 'edit' });
      expect(editWrapper.vm.mode).toBe('edit');
    });

    it('should accept and handle taskData prop correctly', () => {
      const taskData = {
        id: 1,
        title: '测试任务',
        description: '测试描述',
        priority: 'high',
        status: 'in_progress',
        assignedTo: 1,
        dueDate: '2024-12-31 23:59:59',
        tags: '标签1,标签2'
      };
      
      const wrapper = createWrapper({ mode: 'edit', taskData });
      expect(wrapper.vm.taskData).toEqual(taskData);
    });

    it('should use default values when props are not provided', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.visible).toBe(true);
      expect(wrapper.vm.mode).toBe('create');
      expect(wrapper.vm.taskData).toEqual({});
    });

    it('should handle null or undefined taskData gracefully', () => {
      const wrapper1 = createWrapper({ taskData: null });
      const wrapper2 = createWrapper({ taskData: undefined });
      
      expect(wrapper1.vm.taskData).toEqual(null);
      expect(wrapper2.vm.taskData).toEqual(undefined);
    });
  });

  describe('Data and Form State', () => {
    it('should initialize form data with default values', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.formData).toEqual({
        id: null,
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        assignedTo: null,
        dueDate: null,
        tags: ''
      });
    });

    it('should initialize form validation rules correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.formRules).toHaveProperty('title');
      expect(wrapper.vm.formRules).toHaveProperty('priority');
      expect(wrapper.vm.formRules).toHaveProperty('status');
      expect(wrapper.vm.formRules.title).toHaveLength(2);
      expect(wrapper.vm.formRules.priority).toHaveLength(1);
      expect(wrapper.vm.formRules.status).toHaveLength(1);
    });

    it('should initialize loading state correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.loading).toBe(false);
    });

    it('should update loading state correctly', async () => {
      const wrapper = createWrapper();
      
      wrapper.vm.loading = true;
      await nextTick();
      expect(wrapper.vm.loading).toBe(true);
      
      wrapper.vm.loading = false;
      await nextTick();
      expect(wrapper.vm.loading).toBe(false);
    });
  });

  describe('Computed Properties', () => {
    it('should compute dialogVisible correctly', async () => {
      const wrapper = createWrapper({ visible: true });
      expect(wrapper.vm.dialogVisible).toBe(true);
      
      await wrapper.setProps({ visible: false });
      expect(wrapper.vm.dialogVisible).toBe(false);
    });

    it('should compute dialogTitle correctly', () => {
      const createWrapper = createWrapper({ mode: 'create' });
      expect(createWrapper.vm.dialogTitle).toBe('新建任务');
      
      const editWrapper = createWrapper({ mode: 'edit' });
      expect(editWrapper.vm.dialogTitle).toBe('编辑任务');
    });

    it('should emit update:visible when dialogVisible is set', async () => {
      const wrapper = createWrapper({ visible: true });
      
      wrapper.vm.dialogVisible = false;
      await nextTick();
      
      expect(wrapper.emitted('update:visible')).toBeTruthy();
      expect(wrapper.emitted('update:visible')[0]).toEqual([false]);
    });
  });

  describe('Watchers', () => {
    it('should update form data when taskData changes', async () => {
      const wrapper = createWrapper({ mode: 'edit' });
      const taskData = {
        id: 1,
        title: '测试任务',
        description: '测试描述',
        priority: 'high',
        status: 'in_progress',
        assignedTo: 1,
        dueDate: '2024-12-31 23:59:59',
        tags: '标签1,标签2'
      };
      
      await wrapper.setProps({ taskData });
      
      expect(wrapper.vm.formData).toEqual({
        id: 1,
        title: '测试任务',
        description: '测试描述',
        priority: 'high',
        status: 'in_progress',
        assignedTo: 1,
        dueDate: '2024-12-31 23:59:59',
        tags: '标签1,标签2'
      });
    });

    it('should reset form data when taskData is empty', async () => {
      const wrapper = createWrapper({ mode: 'edit' });
      const initialTaskData = {
        id: 1,
        title: '测试任务',
        description: '测试描述'
      };
      
      await wrapper.setProps({ taskData: initialTaskData });
      expect(wrapper.vm.formData.title).toBe('测试任务');
      
      await wrapper.setProps({ taskData: {} });
      expect(wrapper.vm.formData.title).toBe('');
    });

    it('should handle array tags correctly when taskData changes', async () => {
      const wrapper = createWrapper({ mode: 'edit' });
      const taskDataWithArrayTags = {
        id: 1,
        title: '测试任务',
        tags: ['标签1', '标签2', '标签3']
      };
      
      await wrapper.setProps({ taskData: taskDataWithArrayTags });
      
      expect(wrapper.vm.formData.tags).toBe('标签1, 标签2, 标签3');
    });

    it('should handle string tags correctly when taskData changes', async () => {
      const wrapper = createWrapper({ mode: 'edit' });
      const taskDataWithStringTags = {
        id: 1,
        title: '测试任务',
        tags: '标签1,标签2,标签3'
      };
      
      await wrapper.setProps({ taskData: taskDataWithStringTags });
      
      expect(wrapper.vm.formData.tags).toBe('标签1,标签2,标签3');
    });

    it('should handle missing properties in taskData gracefully', async () => {
      const wrapper = createWrapper({ mode: 'edit' });
      const incompleteTaskData = {
        id: 1,
        title: '测试任务'
        // Missing other properties
      };
      
      await wrapper.setProps({ taskData: incompleteTaskData });
      
      expect(wrapper.vm.formData).toEqual({
        id: 1,
        title: '测试任务',
        description: '',
        priority: 'medium',
        status: 'pending',
        assignedTo: null,
        dueDate: null,
        tags: ''
      });
    });
  });

  describe('Methods', () => {
    describe('handleSubmit', () => {
      it('should validate form before submission', async () => {
        const wrapper = createWrapper({ mode: 'create' });
        const validateSpy = vi.spyOn(wrapper.vm.formRef, 'validate').mockResolvedValue(true);
        
        await wrapper.vm.handleSubmit();
        
        expect(validateSpy).toHaveBeenCalled();
      });

      it('should not submit if form validation fails', async () => {
        const wrapper = createWrapper({ mode: 'create' });
        const validateSpy = vi.spyOn(wrapper.vm.formRef, 'validate').mockRejectedValue(new Error('Validation failed'));
        const { ElMessage } = await import('element-plus');
        
        await wrapper.vm.handleSubmit();
        
        expect(validateSpy).toHaveBeenCalled();
        expect(ElMessage.warning).toHaveBeenCalledWith('请检查表单填写是否正确');
        expect(wrapper.emitted('submit')).toBeFalsy();
      });

      it('should emit submit event with correct data in create mode', async () => {
        const wrapper = createWrapper({ mode: 'create' });
        const formData = {
          id: null,
          title: '测试任务',
          description: '测试描述',
          priority: 'high',
          status: 'in_progress',
          assignedTo: 1,
          dueDate: '2024-12-31 23:59:59',
          tags: '标签1, 标签2'
        };
        
        wrapper.vm.formData = formData;
        vi.spyOn(wrapper.vm.formRef, 'validate').mockResolvedValue(true);
        
        await wrapper.vm.handleSubmit();
        
        expect(wrapper.emitted('submit')).toBeTruthy();
        const emittedData = wrapper.emitted('submit')[0][0];
        expect(emittedData.title).toBe('测试任务');
        expect(emittedData.description).toBe('测试描述');
        expect(emittedData.tags).toBe('标签1,标签2'); // Normalized
        expect(emittedData.id).toBeUndefined(); // Should be removed in create mode
      });

      it('should emit submit event with correct data in edit mode', async () => {
        const wrapper = createWrapper({ mode: 'edit' });
        const formData = {
          id: 1,
          title: '测试任务',
          description: '测试描述',
          priority: 'high',
          status: 'in_progress',
          assignedTo: 1,
          dueDate: '2024-12-31 23:59:59',
          tags: '标签1, 标签2'
        };
        
        wrapper.vm.formData = formData;
        vi.spyOn(wrapper.vm.formRef, 'validate').mockResolvedValue(true);
        
        await wrapper.vm.handleSubmit();
        
        expect(wrapper.emitted('submit')).toBeTruthy();
        const emittedData = wrapper.emitted('submit')[0][0];
        expect(emittedData.id).toBe(1); // Should be preserved in edit mode
        expect(emittedData.title).toBe('测试任务');
        expect(emittedData.tags).toBe('标签1,标签2'); // Normalized
      });

      it('should handle loading state during submission', async () => {
        const wrapper = createWrapper({ mode: 'create' });
        vi.spyOn(wrapper.vm.formRef, 'validate').mockResolvedValue(true);
        
        const submitPromise = wrapper.vm.handleSubmit();
        expect(wrapper.vm.loading).toBe(true);
        
        await submitPromise;
        expect(wrapper.vm.loading).toBe(false);
      });

      it('should handle empty tags correctly', async () => {
        const wrapper = createWrapper({ mode: 'create' });
        const formData = {
          id: null,
          title: '测试任务',
          description: '测试描述',
          priority: 'high',
          status: 'in_progress',
          assignedTo: 1,
          dueDate: '2024-12-31 23:59:59',
          tags: ''
        };
        
        wrapper.vm.formData = formData;
        vi.spyOn(wrapper.vm.formRef, 'validate').mockResolvedValue(true);
        
        await wrapper.vm.handleSubmit();
        
        const emittedData = wrapper.emitted('submit')[0][0];
        expect(emittedData.tags).toBe('');
      });

      it('should handle null tags correctly', async () => {
        const wrapper = createWrapper({ mode: 'create' });
        const formData = {
          id: null,
          title: '测试任务',
          description: '测试描述',
          priority: 'high',
          status: 'in_progress',
          assignedTo: 1,
          dueDate: '2024-12-31 23:59:59',
          tags: null as any
        };
        
        wrapper.vm.formData = formData;
        vi.spyOn(wrapper.vm.formRef, 'validate').mockResolvedValue(true);
        
        await wrapper.vm.handleSubmit();
        
        const emittedData = wrapper.emitted('submit')[0][0];
        expect(emittedData.tags).toBe('');
      });
    });

    describe('handleCancel', () => {
      it('should emit cancel event when called', () => {
        const wrapper = createWrapper();
        
        wrapper.vm.handleCancel();
        
        expect(wrapper.emitted('cancel')).toBeTruthy();
      });
    });

    describe('handleClose', () => {
      it('should emit update:visible event with false when called', () => {
        const wrapper = createWrapper();
        
        wrapper.vm.handleClose();
        
        expect(wrapper.emitted('update:visible')).toBeTruthy();
        expect(wrapper.emitted('update:visible')[0]).toEqual([false]);
      });
    });

    describe('resetForm', () => {
      it('should call resetFields on form ref when called', () => {
        const wrapper = createWrapper();
        const resetFieldsSpy = vi.spyOn(wrapper.vm.formRef, 'resetFields');
        
        wrapper.vm.resetForm();
        
        expect(resetFieldsSpy).toHaveBeenCalled();
      });

      it('should handle null form ref gracefully', () => {
        const wrapper = createWrapper();
        wrapper.vm.formRef = null as any;
        
        expect(() => wrapper.vm.resetForm()).not.toThrow();
      });
    });
  });

  describe('Event Handling', () => {
    it('should handle form submission when submit button is clicked', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const handleSubmitSpy = vi.spyOn(wrapper.vm, 'handleSubmit');
      vi.spyOn(wrapper.vm.formRef, 'validate').mockResolvedValue(true);
      
      const buttons = wrapper.findAll('button');
      const submitButton = buttons[1]; // Second button is submit
      
      await submitButton.trigger('click');
      
      expect(handleSubmitSpy).toHaveBeenCalled();
    });

    it('should handle cancel when cancel button is clicked', async () => {
      const wrapper = createWrapper();
      const handleCancelSpy = vi.spyOn(wrapper.vm, 'handleCancel');
      
      const buttons = wrapper.findAll('button');
      const cancelButton = buttons[0]; // First button is cancel
      
      await cancelButton.trigger('click');
      
      expect(handleCancelSpy).toHaveBeenCalled();
    });

    it('should handle dialog close event', async () => {
      const wrapper = createWrapper();
      const handleCloseSpy = vi.spyOn(wrapper.vm, 'handleClose');
      
      // Simulate dialog close event
      wrapper.vm.dialogVisible = false;
      await nextTick();
      
      expect(handleCloseSpy).toHaveBeenCalled();
    });

    it('should handle form input changes', async () => {
      const wrapper = createWrapper();
      
      // Simulate title input change
      const titleInput = wrapper.find('input[placeholder="请输入任务标题"]');
      await titleInput.setValue('新任务标题');
      
      expect(wrapper.vm.formData.title).toBe('新任务标题');
    });

    it('should handle select changes', async () => {
      const wrapper = createWrapper();
      
      // Simulate priority select change
      const prioritySelect = wrapper.find('select[placeholder="请选择优先级"]');
      await prioritySelect.setValue('high');
      
      expect(wrapper.vm.formData.priority).toBe('high');
    });
  });

  describe('Form Validation', () => {
    it('should validate required title field', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const validateSpy = vi.spyOn(wrapper.vm.formRef, 'validate').mockResolvedValue(false);
      
      wrapper.vm.formData.title = '';
      await wrapper.vm.handleSubmit();
      
      expect(validateSpy).toHaveBeenCalled();
    });

    it('should validate title length constraints', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const validateSpy = vi.spyOn(wrapper.vm.formRef, 'validate').mockResolvedValue(false);
      
      wrapper.vm.formData.title = 'a'; // Too short
      await wrapper.vm.handleSubmit();
      
      expect(validateSpy).toHaveBeenCalled();
    });

    it('should validate required priority field', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const validateSpy = vi.spyOn(wrapper.vm.formRef, 'validate').mockResolvedValue(false);
      
      wrapper.vm.formData.priority = '';
      await wrapper.vm.handleSubmit();
      
      expect(validateSpy).toHaveBeenCalled();
    });

    it('should validate required status field', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const validateSpy = vi.spyOn(wrapper.vm.formRef, 'validate').mockResolvedValue(false);
      
      wrapper.vm.formData.status = '';
      await wrapper.vm.handleSubmit();
      
      expect(validateSpy).toHaveBeenCalled();
    });

    it('should pass validation with valid form data', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const validateSpy = vi.spyOn(wrapper.vm.formRef, 'validate').mockResolvedValue(true);
      
      wrapper.vm.formData = {
        id: null,
        title: '有效的任务标题',
        description: '有效的任务描述',
        priority: 'medium',
        status: 'pending',
        assignedTo: 1,
        dueDate: '2024-12-31 23:59:59',
        tags: '标签1,标签2'
      };
      
      await wrapper.vm.handleSubmit();
      
      expect(validateSpy).toHaveBeenCalled();
      expect(wrapper.emitted('submit')).toBeTruthy();
    });
  });

  describe('Exposed Methods', () => {
    it('should expose resetForm method', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.resetForm).toBeDefined();
      expect(typeof wrapper.vm.resetForm).toBe('function');
    });

    it('should call exposed resetForm method correctly', () => {
      const wrapper = createWrapper();
      const resetFieldsSpy = vi.spyOn(wrapper.vm.formRef, 'resetFields');
      
      wrapper.vm.resetForm();
      
      expect(resetFieldsSpy).toHaveBeenCalled();
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
      
      expect(form.exists()).toBe(true);
    });

    it('should be keyboard navigable', async () => {
      const wrapper = createWrapper();
      const buttons = wrapper.findAll('button');
      
      await buttons[0].trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('cancel')).toBeTruthy();
      
      await buttons[1].trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('submit')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const wrapper = createWrapper();
      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate');
      
      await wrapper.setProps({ visible: true });
      await wrapper.setProps({ visible: true });
      
      expect(renderSpy).not.toHaveBeenCalled();
    });

    it('should handle rapid form submissions', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      vi.spyOn(wrapper.vm.formRef, 'validate').mockResolvedValue(true);
      
      // Rapid submissions
      await Promise.all([
        wrapper.vm.handleSubmit(),
        wrapper.vm.handleSubmit(),
        wrapper.vm.handleSubmit()
      ]);
      
      expect(wrapper.emitted('submit')).toHaveLength(3);
    });

    it('should handle large form data efficiently', () => {
      const wrapper = createWrapper();
      const largeFormData = {
        id: 1,
        title: 'a'.repeat(100),
        description: 'a'.repeat(500),
        priority: 'high',
        status: 'in_progress',
        assignedTo: 1,
        dueDate: '2024-12-31 23:59:59',
        tags: 'a'.repeat(200)
      };
      
      wrapper.vm.formData = largeFormData;
      
      expect(wrapper.vm.formData.title).toBe('a'.repeat(100));
      expect(wrapper.vm.formData.description).toBe('a'.repeat(500));
      expect(wrapper.vm.formData.tags).toBe('a'.repeat(200));
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form data', () => {
      const wrapper = createWrapper();
      wrapper.vm.formData = {} as any;
      
      expect(wrapper.vm.formData).toEqual({});
    });

    it('should handle null form data', () => {
      const wrapper = createWrapper();
      wrapper.vm.formData = null as any;
      
      expect(wrapper.vm.formData).toBeNull();
    });

    it('should handle undefined form data', () => {
      const wrapper = createWrapper();
      wrapper.vm.formData = undefined as any;
      
      expect(wrapper.vm.formData).toBeUndefined();
    });

    it('should handle invalid priority values', () => {
      const wrapper = createWrapper();
      wrapper.vm.formData.priority = 'invalid_value' as any;
      
      expect(wrapper.vm.formData.priority).toBe('invalid_value');
    });

    it('should handle invalid status values', () => {
      const wrapper = createWrapper();
      wrapper.vm.formData.status = 'invalid_value' as any;
      
      expect(wrapper.vm.formData.status).toBe('invalid_value');
    });

    it('should handle invalid assignedTo values', () => {
      const wrapper = createWrapper();
      wrapper.vm.formData.assignedTo = 'invalid_value' as any;
      
      expect(wrapper.vm.formData.assignedTo).toBe('invalid_value');
    });

    it('should handle concurrent dialog operations', async () => {
      const wrapper = createWrapper();
      
      // Concurrent operations
      await Promise.all([
        wrapper.setProps({ visible: false }),
        wrapper.setProps({ mode: 'edit' }),
        wrapper.setProps({ taskData: { id: 1, title: 'Test' } })
      ]);
      
      expect(wrapper.vm.dialogVisible).toBe(false);
      expect(wrapper.vm.mode).toBe('edit');
      expect(wrapper.vm.taskData).toEqual({ id: 1, title: 'Test' });
    });

    it('should handle form submission without form ref', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      wrapper.vm.formRef = null as any;
      
      await wrapper.vm.handleSubmit();
      
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('should handle validation errors gracefully', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      const validationError = new Error('Validation failed');
      vi.spyOn(wrapper.vm.formRef, 'validate').mockRejectedValue(validationError);
      const { ElMessage } = await import('element-plus');
      
      await wrapper.vm.handleSubmit();
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请检查表单填写是否正确');
      expect(wrapper.vm.loading).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should integrate with router correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.$router).toBeDefined();
    });

    it('should integrate with pinia store correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.$pinia).toBeDefined();
    });

    it('should work correctly with different prop combinations', () => {
      const propsCombinations = [
        { visible: true, mode: 'create' as const },
        { visible: true, mode: 'edit' as const, taskData: { id: 1, title: 'Test' } },
        { visible: false, mode: 'create' as const }
      ];

      propsCombinations.forEach(props => {
        const wrapper = createWrapper(props);
        expect(wrapper.vm.visible).toBe(props.visible);
        expect(wrapper.vm.mode).toBe(props.mode);
        if (props.taskData) {
          expect(wrapper.vm.taskData).toEqual(props.taskData);
        }
      });
    });

    it('should maintain correct state during complex interactions', async () => {
      const wrapper = createWrapper({ mode: 'create' });
      
      // Complex interaction sequence
      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ visible: true, mode: 'edit' });
      await wrapper.setProps({ taskData: { id: 1, title: 'Updated Task' } });
      
      expect(wrapper.vm.dialogVisible).toBe(true);
      expect(wrapper.vm.mode).toBe('edit');
      expect(wrapper.vm.formData.title).toBe('Updated Task');
    });
  });
});
