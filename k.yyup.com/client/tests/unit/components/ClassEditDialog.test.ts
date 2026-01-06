
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

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { vi } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ClassEditDialog from '@/components/ClassEditDialog.vue';
import { ElMessage } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div class="el-dialog" v-if="modelValue" @closed="$emit(\'closed\')"><div class="el-dialog__header">{{ title }}</div><div class="el-dialog__body"><slot /></div><div class="el-dialog__footer"><slot name="footer" /></div></div>',
      props: ['modelValue', 'title', 'width', 'closeOnClickModal']
    },
    ElForm: {
      name: 'ElForm',
      template: '<form><slot /></form>',
      methods: {
        validate: vi.fn(),
        clearValidate: vi.fn()
      }
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><slot /></div>'
    },
    ElInput: {
      name: 'ElInput',
      template: '<input type="text" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'placeholder', 'type', 'rows']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
      props: ['modelValue', 'placeholder']
    },
    ElOption: {
      name: 'ElOption',
      template: '<option :value="value">{{ label }}</option>',
      props: ['value', 'label']
    },
    ElInputNumber: {
      name: 'ElInputNumber',
      template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" :min="min" :max="max" />',
      props: ['modelValue', 'min', 'max', 'placeholder']
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input type="date" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'placeholder']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button :type="type" :disabled="loading" @click="$emit(\'click\')"><slot /></button>',
      props: ['type', 'loading']
    },
    ElRow: {
      name: 'ElRow',
      template: '<div class="el-row" :style="{ gap: gutter + \'px\' }"><slot /></div>',
      props: ['gutter']
    },
    ElCol: {
      name: 'ElCol',
      template: '<div class="el-col" :style="{ span: span }"><slot /></div>',
      props: ['span']
    }
  };
});

// 控制台错误检测变量
let consoleSpy: any

describe('ClassEditDialog.vue', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  let wrapper;
  let mockFormRef;

  const mockClassData = {
    id: '1',
    name: '小班A班',
    code: 'CLASS001',
    ageGroup: 'SMALL',
    capacity: 25,
    teacherId: 'teacher1',
    status: 'ACTIVE',
    startDate: '2023-09-01',
    endDate: '2024-06-30',
    description: '这是一个小班'
  };

  const mockTeacherList = [
    { id: 'teacher1', name: '张老师' },
    { id: 'teacher2', name: '李老师' },
    { id: 'teacher3', name: '王老师' }
  ];

  beforeEach(() => {
    mockFormRef = {
      validate: vi.fn().mockResolvedValue(true),
      clearValidate: vi.fn()
    };

    wrapper = mount(ClassEditDialog, {
      props: {
        modelValue: true,
        classData: null,
        teacherList: mockTeacherList
      },
      global: {
        mocks: {
          $refs: {
            formRef: mockFormRef
          }
        }
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount();
    }
    vi.clearAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Component Rendering', () => {
    it('renders dialog without crashing', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.el-dialog').exists()).toBe(true);
    });

    it('shows correct title for creating new class', () => {
      expect(wrapper.find('.el-dialog__header').text()).toBe('新建班级');
    });

    it('shows correct title for editing existing class', async () => {
      await wrapper.setProps({ classData: mockClassData });
      expect(wrapper.find('.el-dialog__header').text()).toBe('编辑班级');
    });

    it('renders all form fields correctly', () => {
      const formItems = wrapper.findAll('.el-form-item');
      expect(formItems.length).toBeGreaterThan(0);
      
      // Check specific form fields
      const nameInput = wrapper.find('input[placeholder*="班级名称"]');
      expect(nameInput.exists()).toBe(true);
      
      const codeInput = wrapper.find('input[placeholder*="班级编号"]');
      expect(codeInput.exists()).toBe(true);
      
      const ageGroupSelect = wrapper.find('select[placeholder*="选择年龄组"]');
      expect(ageGroupSelect.exists()).toBe(true);
      
      const capacityInput = wrapper.find('input[type="number"][placeholder*="班级容量"]');
      expect(capacityInput.exists()).toBe(true);
    });

    it('renders dialog footer with buttons', () => {
      const footer = wrapper.find('.el-dialog__footer');
      expect(footer.exists()).toBe(true);
      
      const buttons = footer.findAll('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].text()).toBe('取消');
      expect(buttons[1].text()).toBe('创建');
    });

    it('renders teacher options correctly', () => {
      const options = wrapper.findAll('option');
      expect(options.length).toBeGreaterThan(0);
      
      // Check if teacher options are rendered
      const teacherOptions = options.filter(option => 
        mockTeacherList.some(teacher => option.text() === teacher.name)
      );
      expect(teacherOptions.length).toBe(mockTeacherList.length);
    });

    it('renders age group options correctly', () => {
      const options = wrapper.findAll('option');
      const ageGroupOptions = options.filter(option => 
        ['小班 (3-4岁)', '中班 (4-5岁)', '大班 (5-6岁)'].includes(option.text())
      );
      expect(ageGroupOptions.length).toBe(3);
    });

    it('renders status options correctly', () => {
      const options = wrapper.findAll('option');
      const statusOptions = options.filter(option => 
        ['正常', '暂停', '毕业'].includes(option.text())
      );
      expect(statusOptions.length).toBe(3);
    });

    it('hides dialog when modelValue is false', async () => {
      await wrapper.setProps({ modelValue: false });
      expect(wrapper.find('.el-dialog').exists()).toBe(false);
    });
  });

  describe('Form Data Initialization', () => {
    it('initializes with default form data when no classData is provided', () => {
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe('');
      expect(formData.code).toBe('');
      expect(formData.ageGroup).toBe('');
      expect(formData.capacity).toBe(25);
      expect(formData.teacherId).toBe('');
      expect(formData.status).toBe('ACTIVE');
      expect(formData.startDate).toBe('');
      expect(formData.endDate).toBe('');
      expect(formData.description).toBe('');
    });

    it('populates form with class data when classData is provided', async () => {
      await wrapper.setProps({ classData: mockClassData });
      
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe(mockClassData.name);
      expect(formData.code).toBe(mockClassData.code);
      expect(formData.ageGroup).toBe(mockClassData.ageGroup);
      expect(formData.capacity).toBe(mockClassData.capacity);
      expect(formData.teacherId).toBe(mockClassData.teacherId);
      expect(formData.status).toBe(mockClassData.status);
      expect(formData.startDate).toBe(mockClassData.startDate);
      expect(formData.endDate).toBe(mockClassData.endDate);
      expect(formData.description).toBe(mockClassData.description);
    });

    it('handles classData with missing properties', async () => {
      const partialClassData = {
        id: '1',
        name: '部分班级'
      };

      await wrapper.setProps({ classData: partialClassData });
      
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe('部分班级');
      expect(formData.code).toBe('');
      expect(formData.ageGroup).toBe('');
      expect(formData.capacity).toBe(25); // Default value
      expect(formData.status).toBe('ACTIVE'); // Default value
    });

    it('reacts to classData prop changes', async () => {
      // Initially no class data
      expect(wrapper.vm.formData.name).toBe('');
      
      // Set class data
      await wrapper.setProps({ classData: mockClassData });
      expect(wrapper.vm.formData.name).toBe(mockClassData.name);
      
      // Change to different class data
      const differentClassData = { ...mockClassData, name: '中班A班' };
      await wrapper.setProps({ classData: differentClassData });
      expect(wrapper.vm.formData.name).toBe('中班A班');
      
      // Remove class data
      await wrapper.setProps({ classData: null });
      expect(wrapper.vm.formData.name).toBe('');
    });
  });

  describe('Computed Properties', () => {
    it('computes dialog visibility correctly', async () => {
      // Initially visible
      expect(wrapper.vm.dialogVisible).toBe(true);
      
      // Hide dialog
      await wrapper.setProps({ modelValue: false });
      expect(wrapper.vm.dialogVisible).toBe(false);
      
      // Show dialog again
      await wrapper.setProps({ modelValue: true });
      expect(wrapper.vm.dialogVisible).toBe(true);
    });

    it('computes edit mode correctly', () => {
      // Initially create mode
      expect(wrapper.vm.isEdit).toBe(false);
      
      // Set class data with ID
      return wrapper.setProps({ classData: mockClassData }).then(() => {
        expect(wrapper.vm.isEdit).toBe(true);
        
        // Remove class data
        return wrapper.setProps({ classData: null });
      }).then(() => {
        expect(wrapper.vm.isEdit).toBe(false);
      });
    });

    it('computes edit mode correctly for class without ID', async () => {
      const classWithoutId = { ...mockClassData };
      delete classWithoutId.id;
      
      await wrapper.setProps({ classData: classWithoutId });
      expect(wrapper.vm.isEdit).toBe(false);
    });
  });

  describe('Form Validation Rules', () => {
    it('has correct validation rules defined', () => {
      const rules = wrapper.vm.formRules;
      
      expect(rules.name).toHaveLength(2);
      expect(rules.name[0].required).toBe(true);
      expect(rules.name[1].min).toBe(2);
      expect(rules.name[1].max).toBe(20);
      
      expect(rules.code).toHaveLength(2);
      expect(rules.code[0].required).toBe(true);
      expect(rules.code[1].pattern).toBe(/^[A-Z0-9]+$/);
      
      expect(rules.ageGroup).toHaveLength(1);
      expect(rules.ageGroup[0].required).toBe(true);
      
      expect(rules.capacity).toHaveLength(1);
      expect(rules.capacity[0].required).toBe(true);
      
      expect(rules.teacherId).toHaveLength(1);
      expect(rules.teacherId[0].required).toBe(true);
      
      expect(rules.status).toHaveLength(1);
      expect(rules.status[0].required).toBe(true);
      
      expect(rules.startDate).toHaveLength(1);
      expect(rules.startDate[0].required).toBe(true);
      
      // endDate should not have required rule
      expect(rules.endDate).toBeUndefined();
    });

    it('validates required fields', async () => {
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
    });

    it('validates class code format', async () => {
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          code: 'invalid-code' // Contains lowercase and hyphen
        }
      });
      
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
    });

    it('validates class name length', async () => {
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          name: 'A' // Too short
        }
      });
      
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
    });
  });

  describe('Dialog Visibility', () => {
    it('controls visibility through modelValue prop', async () => {
      // Initially visible
      expect(wrapper.find('.el-dialog').exists()).toBe(true);
      
      // Hide dialog
      await wrapper.setProps({ modelValue: false });
      expect(wrapper.find('.el-dialog').exists()).toBe(false);
      
      // Show dialog again
      await wrapper.setProps({ modelValue: true });
      expect(wrapper.find('.el-dialog').exists()).toBe(true);
    });

    it('emits update:modelValue when visibility changes', async () => {
      // Test computed setter
      wrapper.vm.dialogVisible = false;
      await nextTick();
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false);
    });

    it('hides dialog when cancel is clicked', async () => {
      await wrapper.vm.handleCancel();
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false);
    });

    it('resets form when dialog is closed', async () => {
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          name: 'Modified Name',
          code: 'MODIFIED'
        }
      });
      
      // Trigger closed event
      await wrapper.find('.el-dialog').vm.$emit('closed');
      
      expect(wrapper.vm.formData.name).toBe('');
      expect(wrapper.vm.formData.code).toBe('');
      expect(wrapper.vm.formData.capacity).toBe(25);
      expect(wrapper.vm.formData.status).toBe('ACTIVE');
      expect(mockFormRef.clearValidate).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('saves new class successfully', async () => {
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.setData({
        formData: {
          name: '新班级',
          code: 'NEW001',
          ageGroup: 'MEDIUM',
          capacity: 30,
          teacherId: 'teacher2',
          status: 'ACTIVE',
          startDate: '2024-09-01',
          endDate: '2025-06-30',
          description: '这是一个新班级'
        }
      });
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
      
      const saveEmits = wrapper.emitted('save');
      expect(saveEmits).toBeTruthy();
      expect(saveEmits[0][0]).toEqual({
        name: '新班级',
        code: 'NEW001',
        ageGroup: 'MEDIUM',
        capacity: 30,
        teacherId: 'teacher2',
        status: 'ACTIVE',
        startDate: '2024-09-01',
        endDate: '2025-06-30',
        description: '这是一个新班级'
      });
      
      // Should not include ID for new class
      expect(saveEmits[0][0].id).toBeUndefined();
    });

    it('saves existing class with ID', async () => {
      await wrapper.setProps({ classData: mockClassData });
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          name: '更新后的班级'
        }
      });
      
      await wrapper.vm.handleSave();
      
      const saveEmits = wrapper.emitted('save');
      expect(saveEmits).toBeTruthy();
      expect(saveEmits[0][0]).toEqual({
        id: mockClassData.id,
        name: '更新后的班级',
        code: mockClassData.code,
        ageGroup: mockClassData.ageGroup,
        capacity: mockClassData.capacity,
        teacherId: mockClassData.teacherId,
        status: mockClassData.status,
        startDate: mockClassData.startDate,
        endDate: mockClassData.endDate,
        description: mockClassData.description
      });
    });

    it('handles form validation errors gracefully', async () => {
      const validationError = new Error('Validation failed');
      mockFormRef.validate.mockRejectedValue(validationError);
      
      await wrapper.vm.handleSave();
      
      expect(wrapper.emitted('save')).toBeFalsy();
    });

    it('does not save when form validation fails', async () => {
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.handleSave();
      
      expect(wrapper.emitted('save')).toBeFalsy();
    });

    it('sets loading state during save', async () => {
      mockFormRef.validate.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(true), 100);
      }));
      
      const savePromise = wrapper.vm.handleSave();
      
      expect(wrapper.vm.saving).toBe(true);
      
      await savePromise;
      
      expect(wrapper.vm.saving).toBe(false);
    });

    it('handles missing form reference', async () => {
      wrapper.vm.formRef = null;
      
      await wrapper.vm.handleSave();
      
      expect(wrapper.emitted('save')).toBeFalsy();
    });
  });

  describe('Form Fields Interaction', () => {
    it('updates form data when input fields change', async () => {
      const nameInput = wrapper.find('input[placeholder*="班级名称"]');
      await nameInput.setValue('新班级名称');
      
      expect(wrapper.vm.formData.name).toBe('新班级名称');
    });

    it('handles class code change', async () => {
      const codeInput = wrapper.find('input[placeholder*="班级编号"]');
      await codeInput.setValue('CLASS002');
      
      expect(wrapper.vm.formData.code).toBe('CLASS002');
    });

    it('handles age group selection change', async () => {
      const ageGroupSelect = wrapper.find('select[placeholder*="选择年龄组"]');
      await ageGroupSelect.setValue('LARGE');
      
      expect(wrapper.vm.formData.ageGroup).toBe('LARGE');
    });

    it('handles capacity change', async () => {
      const capacityInput = wrapper.find('input[type="number"][placeholder*="班级容量"]');
      await capacityInput.setValue(30);
      
      expect(wrapper.vm.formData.capacity).toBe(30);
    });

    it('handles teacher selection change', async () => {
      const teacherSelect = wrapper.find('select[placeholder*="选择主班教师"]');
      await teacherSelect.setValue('teacher2');
      
      expect(wrapper.vm.formData.teacherId).toBe('teacher2');
    });

    it('handles status selection change', async () => {
      const statusSelect = wrapper.find('select[placeholder*="选择状态"]');
      await statusSelect.setValue('INACTIVE');
      
      expect(wrapper.vm.formData.status).toBe('INACTIVE');
    });

    it('handles start date change', async () => {
      const startDatePicker = wrapper.find('input[type="date"][placeholder*="开班日期"]');
      await startDatePicker.setValue('2024-09-01');
      
      expect(wrapper.vm.formData.startDate).toBe('2024-09-01');
    });

    it('handles end date change', async () => {
      const endDatePicker = wrapper.find('input[type="date"][placeholder*="结班日期"]');
      await endDatePicker.setValue('2025-06-30');
      
      expect(wrapper.vm.formData.endDate).toBe('2025-06-30');
    });

    it('handles description change', async () => {
      const descriptionTextarea = wrapper.find('textarea[placeholder*="班级描述"]');
      await descriptionTextarea.setValue('这是一个新的班级描述');
      
      expect(wrapper.vm.formData.description).toBe('这是一个新的班级描述');
    });
  });

  describe('Form Reset', () => {
    it('resets form to default values', async () => {
      await wrapper.setData({
        formData: {
          name: 'Modified Name',
          code: 'MODIFIED',
          ageGroup: 'LARGE',
          capacity: 40,
          teacherId: 'teacher3',
          status: 'INACTIVE',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          description: 'Modified description'
        }
      });
      
      await wrapper.vm.resetForm();
      
      expect(wrapper.vm.formData.name).toBe('');
      expect(wrapper.vm.formData.code).toBe('');
      expect(wrapper.vm.formData.ageGroup).toBe('');
      expect(wrapper.vm.formData.capacity).toBe(25);
      expect(wrapper.vm.formData.teacherId).toBe('');
      expect(wrapper.vm.formData.status).toBe('ACTIVE');
      expect(wrapper.vm.formData.startDate).toBe('');
      expect(wrapper.vm.formData.endDate).toBe('');
      expect(wrapper.vm.formData.description).toBe('');
      expect(mockFormRef.clearValidate).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles form validation errors gracefully', async () => {
      const validationError = new Error('Validation failed');
      mockFormRef.validate.mockRejectedValue(validationError);
      
      await wrapper.vm.handleSave();
      
      expect(wrapper.emitted('save')).toBeFalsy();
    });

    it('handles missing form reference during save', async () => {
      wrapper.vm.formRef = null;
      
      await wrapper.vm.handleSave();
      
      expect(wrapper.emitted('save')).toBeFalsy();
    });

    it('handles missing form reference during reset', async () => {
      wrapper.vm.formRef = null;
      
      await wrapper.vm.resetForm();
      
      // Should not crash
      expect(wrapper.vm.formData.name).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('renders dialog with proper structure', () => {
      const dialog = wrapper.find('.el-dialog');
      expect(dialog.exists()).toBe(true);
      expect(dialog.find('.el-dialog__header').exists()).toBe(true);
      expect(dialog.find('.el-dialog__body').exists()).toBe(true);
      expect(dialog.find('.el-dialog__footer').exists()).toBe(true);
    });

    it('has proper labels for form fields', () => {
      const formItems = wrapper.findAll('.el-form-item');
      expect(formItems.length).toBeGreaterThan(0);
      
      // Check that form items have proper labels
      const labels = wrapper.findAll('.el-form-item');
      labels.forEach(item => {
        expect(item.exists()).toBe(true);
      });
    });

    it('has proper placeholders for inputs', () => {
      const inputs = wrapper.findAll('input[placeholder]');
      expect(inputs.length).toBeGreaterThan(0);
      
      const nameInput = wrapper.find('input[placeholder*="班级名称"]');
      expect(nameInput.exists()).toBe(true);
      
      const codeInput = wrapper.find('input[placeholder*="班级编号"]');
      expect(codeInput.exists()).toBe(true);
    });
  });

  describe('Performance', () => {
    it('handles rapid form field changes efficiently', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 20; i++) {
        await wrapper.setData({
          formData: {
            ...wrapper.vm.formData,
            name: `班级 ${i}`,
            code: `CLASS${String(i).padStart(3, '0')}`
          }
        });
        await nextTick();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('handles rapid classData prop changes efficiently', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        const classData = { ...mockClassData, name: `班级 ${i}` };
        await wrapper.setProps({ classData });
        await nextTick();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Edge Cases', () => {
    it('handles empty teacher list', async () => {
      await wrapper.setProps({ teacherList: [] });
      
      const options = wrapper.findAll('option');
      const teacherOptions = options.filter(option => 
        mockTeacherList.some(teacher => option.text() === teacher.name)
      );
      expect(teacherOptions.length).toBe(0);
    });

    it('handles classData with undefined properties', async () => {
      const classWithUndefined = {
        id: '1',
        name: undefined,
        code: undefined,
        ageGroup: undefined,
        capacity: undefined,
        teacherId: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined,
        description: undefined
      };
      
      await wrapper.setProps({ classData: classWithUndefined });
      
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe('');
      expect(formData.code).toBe('');
      expect(formData.ageGroup).toBe('');
      expect(formData.capacity).toBe(25); // Default value
      expect(formData.teacherId).toBe('');
      expect(formData.status).toBe('ACTIVE'); // Default value
    });

    it('handles form submission with minimal valid data', async () => {
      const minimalData = {
        name: '最小班级',
        code: 'MIN',
        ageGroup: 'SMALL',
        capacity: 20,
        teacherId: 'teacher1',
        status: 'ACTIVE',
        startDate: '2024-09-01'
        // endDate and description are optional
      };
      
      await wrapper.setData({ formData: minimalData });
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.vm.handleSave();
      
      const saveEmits = wrapper.emitted('save');
      expect(saveEmits).toBeTruthy();
      expect(saveEmits[0][0]).toEqual(minimalData);
    });

    it('handles capacity input within bounds', async () => {
      const capacityInput = wrapper.find('input[type="number"][placeholder*="班级容量"]');
      
      // Test minimum value
      await capacityInput.setValue(10);
      expect(wrapper.vm.formData.capacity).toBe(10);
      
      // Test maximum value
      await capacityInput.setValue(50);
      expect(wrapper.vm.formData.capacity).toBe(50);
    });

    it('handles dialog close during loading', async () => {
      mockFormRef.validate.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(true), 1000);
      }));
      
      const savePromise = wrapper.vm.handleSave();
      
      // Close dialog while loading
      await wrapper.setProps({ modelValue: false });
      
      await savePromise;
      
      expect(wrapper.vm.saving).toBe(false);
    });
  });
});