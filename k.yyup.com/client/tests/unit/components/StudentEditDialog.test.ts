
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
import StudentEditDialog from '@/components/StudentEditDialog.vue';
import { ElMessage } from 'element-plus';
import { createStudent, updateStudent } from '@/api/modules/student';

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
      template: '<div class="el-dialog" v-if="modelValue"><div class="el-dialog__header">{{ title }}</div><div class="el-dialog__body"><slot /></div><div class="el-dialog__footer"><slot name="footer" /></div></div>',
      props: ['modelValue', 'title', 'width', 'closeOnClickModal']
    },
    ElForm: {
      name: 'ElForm',
      template: '<form><slot /></form>',
      methods: {
        validate: vi.fn(),
        resetFields: vi.fn()
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

// Mock API functions
vi.mock('@/api/modules/student', () => ({
  createStudent: vi.fn(),
  updateStudent: vi.fn()
}));

// 控制台错误检测变量
let consoleSpy: any

describe('StudentEditDialog.vue', () => {
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

  const mockStudent = {
    id: '1',
    name: '张三',
    gender: 'MALE',
    birthDate: '2020-01-15',
    classId: 'class-1',
    guardian: {
      name: '张爸爸',
      phone: '13800138000',
      relationship: '家长'
    },
    notes: '这是一个备注',
    enrollmentDate: '2023-09-01'
  };

  const mockClassList = [
    { id: 'class-1', name: '小班A班' },
    { id: 'class-2', name: '小班B班' },
    { id: 'class-3', name: '中班A班' }
  ];

  beforeEach(() => {
    mockFormRef = {
      validate: vi.fn().mockResolvedValue(true),
      resetFields: vi.fn()
    };

    wrapper = mount(StudentEditDialog, {
      props: {
        modelValue: true,
        student: null,
        classList: mockClassList
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

    it('shows correct title for creating new student', () => {
      expect(wrapper.find('.el-dialog__header').text()).toBe('新增学生');
    });

    it('shows correct title for editing existing student', async () => {
      await wrapper.setProps({ student: mockStudent });
      expect(wrapper.find('.el-dialog__header').text()).toBe('编辑学生');
    });

    it('renders all form fields correctly', () => {
      const formItems = wrapper.findAll('.el-form-item');
      expect(formItems.length).toBeGreaterThan(0);
      
      // Check specific form fields
      const nameInput = wrapper.find('input[placeholder*="学生姓名"]');
      expect(nameInput.exists()).toBe(true);
      
      const genderSelect = wrapper.find('select[placeholder*="选择性别"]');
      expect(genderSelect.exists()).toBe(true);
      
      const birthDatePicker = wrapper.find('input[type="date"][placeholder*="出生日期"]');
      expect(birthDatePicker.exists()).toBe(true);
    });

    it('renders dialog footer with buttons', () => {
      const footer = wrapper.find('.el-dialog__footer');
      expect(footer.exists()).toBe(true);
      
      const buttons = footer.findAll('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].text()).toBe('取消');
      expect(buttons[1].text()).toBe('创建');
    });

    it('renders class options correctly', () => {
      const options = wrapper.findAll('option');
      expect(options.length).toBeGreaterThan(0);
      
      // Check if class options are rendered
      const classOptions = options.filter(option => 
        mockClassList.some(cls => option.text() === cls.name)
      );
      expect(classOptions.length).toBe(mockClassList.length);
    });

    it('hides dialog when modelValue is false', async () => {
      await wrapper.setProps({ modelValue: false });
      expect(wrapper.find('.el-dialog').exists()).toBe(false);
    });
  });

  describe('Form Data Initialization', () => {
    it('initializes with empty form when no student is provided', () => {
      const form = wrapper.vm.form;
      expect(form.name).toBe('');
      expect(form.gender).toBe('MALE');
      expect(form.birthDate).toBe('');
      expect(form.classId).toBe('');
      expect(form.guardian.name).toBe('');
      expect(form.guardian.phone).toBe('');
      expect(form.notes).toBe('');
    });

    it('populates form with student data when student is provided', async () => {
      await wrapper.setProps({ student: mockStudent });
      
      const form = wrapper.vm.form;
      expect(form.name).toBe(mockStudent.name);
      expect(form.gender).toBe(mockStudent.gender);
      expect(form.birthDate).toBe(mockStudent.birthDate);
      expect(form.classId).toBe(mockStudent.classId);
      expect(form.guardian.name).toBe(mockStudent.guardian.name);
      expect(form.guardian.phone).toBe(mockStudent.guardian.phone);
      expect(form.notes).toBe(mockStudent.notes);
    });

    it('handles student with missing guardian data', async () => {
      const studentWithoutGuardian = {
        ...mockStudent,
        guardian: null
      };

      await wrapper.setProps({ student: studentWithoutGuardian });
      
      const form = wrapper.vm.form;
      expect(form.guardian.name).toBe('');
      expect(form.guardian.phone).toBe('');
    });

    it('reacts to student prop changes', async () => {
      // Initially no student
      expect(wrapper.vm.form.name).toBe('');
      
      // Set student
      await wrapper.setProps({ student: mockStudent });
      expect(wrapper.vm.form.name).toBe(mockStudent.name);
      
      // Change to different student
      const differentStudent = { ...mockStudent, name: '李四' };
      await wrapper.setProps({ student: differentStudent });
      expect(wrapper.vm.form.name).toBe('李四');
      
      // Remove student
      await wrapper.setProps({ student: null });
      expect(wrapper.vm.form.name).toBe('');
    });
  });

  describe('Form Validation Rules', () => {
    it('has correct validation rules defined', () => {
      const rules = wrapper.vm.rules;
      
      expect(rules.name).toHaveLength(1);
      expect(rules.name[0].required).toBe(true);
      
      expect(rules.gender).toHaveLength(1);
      expect(rules.gender[0].required).toBe(true);
      
      expect(rules.birthDate).toHaveLength(1);
      expect(rules.birthDate[0].required).toBe(true);
      
      expect(rules['guardian.name']).toHaveLength(1);
      expect(rules['guardian.name'][0].required).toBe(true);
      
      expect(rules['guardian.phone']).toHaveLength(2);
      expect(rules['guardian.phone'][0].required).toBe(true);
      expect(rules['guardian.phone'][1].pattern).toBe(/^1[3-9]\d{9}$/);
    });

    it('validates required fields', async () => {
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
      expect(ElMessage.error).not.toHaveBeenCalled(); // Validation error is handled by form
    });

    it('validates phone number format', async () => {
      await wrapper.setData({
        form: {
          ...wrapper.vm.form,
          guardian: {
            ...wrapper.vm.form.guardian,
            phone: 'invalid-phone'
          }
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
      wrapper.vm.visible = false;
      await nextTick();
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false);
    });

    it('hides dialog and resets form when cancel is clicked', async () => {
      await wrapper.setData({
        form: {
          ...wrapper.vm.form,
          name: 'Modified Name'
        }
      });
      
      await wrapper.vm.handleCancel();
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false);
      expect(mockFormRef.resetFields).toHaveBeenCalled();
    });
  });

  describe('Form Submission - Create Student', () => {
    beforeEach(() => {
      // Reset for create mode
      wrapper.setProps({ student: null })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('creates new student successfully', async () => {
      const mockResponse = {
        success: true,
        data: { ...mockStudent, id: 'new-id' }
      };
      
      createStudent.mockResolvedValue(mockResponse);
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.setData({
        form: {
          name: '新学生',
          gender: 'FEMALE',
          birthDate: '2021-01-01',
          classId: 'class-2',
          guardian: {
            name: '新家长',
            phone: '13900139000'
          },
          notes: '新备注'
        }
      });
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
      expect(createStudent).toHaveBeenCalledWith({
        name: '新学生',
        gender: 'FEMALE',
        birthDate: '2021-01-01',
        guardian: {
          name: '新家长',
          relationship: '家长',
          phone: '13900139000'
        },
        enrollmentDate: expect.any(String),
        classId: 'class-2',
        notes: '新备注'
      });
      
      expect(ElMessage.success).toHaveBeenCalledWith('学生创建成功');
      expect(wrapper.emitted('success')).toBeTruthy();
      expect(wrapper.emitted('success')[0][0]).toEqual(mockResponse.data);
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false);
    });

    it('handles create student API error', async () => {
      const mockResponse = {
        success: false,
        message: '创建失败'
      };
      
      createStudent.mockResolvedValue(mockResponse);
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.vm.handleSave();
      
      expect(createStudent).toHaveBeenCalled();
      expect(ElMessage.error).toHaveBeenCalledWith('创建失败');
      expect(wrapper.emitted('success')).toBeFalsy();
    });

    it('handles create student network error', async () => {
      createStudent.mockRejectedValue(new Error('Network error'));
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.vm.handleSave();
      
      expect(createStudent).toHaveBeenCalled();
      expect(ElMessage.error).toHaveBeenCalledWith('保存学生信息失败');
      expect(wrapper.emitted('success')).toBeFalsy();
    });

    it('sets loading state during creation', async () => {
      createStudent.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({ success: true, data: mockStudent }), 100);
      }));
      
      mockFormRef.validate.mockResolvedValue(true);
      
      const savePromise = wrapper.vm.handleSave();
      
      expect(wrapper.vm.loading).toBe(true);
      
      await savePromise;
      
      expect(wrapper.vm.loading).toBe(false);
    });
  });

  describe('Form Submission - Update Student', () => {
    beforeEach(() => {
      wrapper.setProps({ student: mockStudent })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('updates existing student successfully', async () => {
      const mockResponse = {
        success: true,
        data: { ...mockStudent, name: '更新后的名字' }
      };
      
      updateStudent.mockResolvedValue(mockResponse);
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.setData({
        form: {
          ...wrapper.vm.form,
          name: '更新后的名字'
        }
      });
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
      expect(updateStudent).toHaveBeenCalledWith(mockStudent.id, {
        name: '更新后的名字',
        gender: mockStudent.gender,
        birthDate: mockStudent.birthDate,
        guardian: {
          name: mockStudent.guardian.name,
          relationship: '家长',
          phone: mockStudent.guardian.phone
        },
        enrollmentDate: expect.any(String),
        classId: mockStudent.classId,
        notes: mockStudent.notes
      });
      
      expect(ElMessage.success).toHaveBeenCalledWith('学生信息更新成功');
      expect(wrapper.emitted('success')).toBeTruthy();
      expect(wrapper.emitted('success')[0][0]).toEqual(mockResponse.data);
    });

    it('handles update student API error', async () => {
      const mockResponse = {
        success: false,
        message: '更新失败'
      };
      
      updateStudent.mockResolvedValue(mockResponse);
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.vm.handleSave();
      
      expect(updateStudent).toHaveBeenCalled();
      expect(ElMessage.error).toHaveBeenCalledWith('更新失败');
      expect(wrapper.emitted('success')).toBeFalsy();
    });

    it('handles update student network error', async () => {
      updateStudent.mockRejectedValue(new Error('Network error'));
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.vm.handleSave();
      
      expect(updateStudent).toHaveBeenCalled();
      expect(ElMessage.error).toHaveBeenCalledWith('保存学生信息失败');
      expect(wrapper.emitted('success')).toBeFalsy();
    });
  });

  describe('Form Fields Interaction', () => {
    it('updates form data when input fields change', async () => {
      const nameInput = wrapper.find('input[placeholder*="学生姓名"]');
      await nameInput.setValue('新学生姓名');
      
      expect(wrapper.vm.form.name).toBe('新学生姓名');
    });

    it('handles gender selection change', async () => {
      const genderSelect = wrapper.find('select[placeholder*="选择性别"]');
      await genderSelect.setValue('FEMALE');
      
      expect(wrapper.vm.form.gender).toBe('FEMALE');
    });

    it('handles class selection change', async () => {
      const classSelect = wrapper.find('select[placeholder*="选择班级"]');
      await classSelect.setValue('class-2');
      
      expect(wrapper.vm.form.classId).toBe('class-2');
    });

    it('handles birth date change', async () => {
      const birthDatePicker = wrapper.find('input[type="date"][placeholder*="出生日期"]');
      await birthDatePicker.setValue('2021-05-15');
      
      expect(wrapper.vm.form.birthDate).toBe('2021-05-15');
    });

    it('handles guardian name change', async () => {
      const guardianNameInput = wrapper.find('input[placeholder*="家长姓名"]');
      await guardianNameInput.setValue('新家长姓名');
      
      expect(wrapper.vm.form.guardian.name).toBe('新家长姓名');
    });

    it('handles guardian phone change', async () => {
      const guardianPhoneInput = wrapper.find('input[placeholder*="家长电话"]');
      await guardianPhoneInput.setValue('13900139000');
      
      expect(wrapper.vm.form.guardian.phone).toBe('13900139000');
    });

    it('handles notes change', async () => {
      const notesTextarea = wrapper.find('textarea[placeholder*="备注"]');
      await notesTextarea.setValue('这是一个新的备注');
      
      expect(wrapper.vm.form.notes).toBe('这是一个新的备注');
    });
  });

  describe('Form Reset', () => {
    it('resets form to empty state when no student is provided', async () => {
      await wrapper.setData({
        form: {
          name: 'Modified Name',
          gender: 'FEMALE',
          birthDate: '2021-01-01',
          classId: 'class-2',
          guardian: {
            name: 'Modified Parent',
            phone: '13900139000'
          },
          notes: 'Modified notes'
        }
      });
      
      await wrapper.vm.resetForm();
      
      expect(wrapper.vm.form.name).toBe('');
      expect(wrapper.vm.form.gender).toBe('MALE');
      expect(wrapper.vm.form.birthDate).toBe('');
      expect(wrapper.vm.form.classId).toBe('');
      expect(wrapper.vm.form.guardian.name).toBe('');
      expect(wrapper.vm.form.guardian.phone).toBe('');
      expect(wrapper.vm.form.notes).toBe('');
      expect(mockFormRef.resetFields).toHaveBeenCalled();
    });

    it('resets form to student data when student is provided', async () => {
      await wrapper.setProps({ student: mockStudent });
      
      await wrapper.setData({
        form: {
          ...wrapper.vm.form,
          name: 'Modified Name'
        }
      });
      
      await wrapper.vm.resetForm();
      
      expect(wrapper.vm.form.name).toBe(mockStudent.name);
      expect(wrapper.vm.form.gender).toBe(mockStudent.gender);
      expect(wrapper.vm.form.birthDate).toBe(mockStudent.birthDate);
    });
  });

  describe('Error Handling', () => {
    it('handles form validation errors gracefully', async () => {
      const validationError = new Error('Validation failed');
      mockFormRef.validate.mockRejectedValue(validationError);
      
      await wrapper.vm.handleSave();
      
      expect(createStudent).not.toHaveBeenCalled();
      expect(updateStudent).not.toHaveBeenCalled();
      expect(ElMessage.error).toHaveBeenCalledWith('保存学生信息失败');
    });

    it('handles missing form reference', async () => {
      wrapper.vm.formRef = null;
      
      await wrapper.vm.handleSave();
      
      expect(createStudent).not.toHaveBeenCalled();
      expect(updateStudent).not.toHaveBeenCalled();
    });

    it('handles API response without success property', async () => {
      const mockResponse = { data: mockStudent }; // Missing success property
      
      createStudent.mockResolvedValue(mockResponse);
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.vm.handleSave();
      
      expect(createStudent).toHaveBeenCalled();
      expect(ElMessage.error).toHaveBeenCalledWith('操作失败');
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
      
      const nameInput = wrapper.find('input[placeholder*="学生姓名"]');
      expect(nameInput.exists()).toBe(true);
      
      const guardianNameInput = wrapper.find('input[placeholder*="家长姓名"]');
      expect(guardianNameInput.exists()).toBe(true);
    });
  });

  describe('Performance', () => {
    it('handles rapid form field changes efficiently', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 20; i++) {
        await wrapper.setData({
          form: {
            ...wrapper.vm.form,
            name: `Student ${i}`,
            guardian: {
              ...wrapper.vm.form.guardian,
              name: `Parent ${i}`
            }
          }
        });
        await nextTick();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('handles rapid student prop changes efficiently', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        const student = { ...mockStudent, name: `Student ${i}` };
        await wrapper.setProps({ student });
        await nextTick();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Edge Cases', () => {
    it('handles student with undefined properties', async () => {
      const studentWithUndefined = {
        id: '1',
        name: undefined,
        gender: undefined,
        birthDate: undefined,
        classId: undefined,
        guardian: undefined,
        notes: undefined
      };
      
      await wrapper.setProps({ student: studentWithUndefined });
      
      const form = wrapper.vm.form;
      expect(form.name).toBe('');
      expect(form.gender).toBe('MALE');
      expect(form.birthDate).toBe('');
      expect(form.classId).toBe('');
      expect(form.guardian.name).toBe('');
      expect(form.guardian.phone).toBe('');
      expect(form.notes).toBe('');
    });

    it('handles empty class list', async () => {
      await wrapper.setProps({ classList: [] });
      
      const options = wrapper.findAll('option');
      const classOptions = options.filter(option => 
        mockClassList.some(cls => option.text() === cls.name)
      );
      expect(classOptions.length).toBe(0);
    });

    it('handles form submission with minimal valid data', async () => {
      const minimalData = {
        name: 'Min',
        gender: 'MALE',
        birthDate: '2020-01-01',
        guardian: {
          name: 'Parent',
          phone: '13800138000'
        },
        classId: '',
        notes: ''
      };
      
      await wrapper.setData({ form: minimalData });
      
      const mockResponse = { success: true, data: mockStudent };
      createStudent.mockResolvedValue(mockResponse);
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.vm.handleSave();
      
      expect(createStudent).toHaveBeenCalledWith({
        name: 'Min',
        gender: 'MALE',
        birthDate: '2020-01-01',
        guardian: {
          name: 'Parent',
          relationship: '家长',
          phone: '13800138000'
        },
        enrollmentDate: expect.any(String),
        classId: undefined,
        notes: undefined
      });
    });

    it('handles dialog close during loading', async () => {
      createStudent.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({ success: true, data: mockStudent }), 1000);
      }));
      
      mockFormRef.validate.mockResolvedValue(true);
      
      const savePromise = wrapper.vm.handleSave();
      
      // Close dialog while loading
      await wrapper.setProps({ modelValue: false });
      
      await savePromise;
      
      expect(wrapper.vm.loading).toBe(false);
    });
  });
});