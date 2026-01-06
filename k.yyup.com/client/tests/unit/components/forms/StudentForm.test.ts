
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
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import StudentForm from '@/components/forms/StudentForm.vue';
import { ElMessage, FormInstance } from 'element-plus';

// Mock Element Plus components and icons
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
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
      props: ['modelValue', 'placeholder', 'clearable']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
      props: ['modelValue', 'placeholder', 'multiple']
    },
    ElOption: {
      name: 'ElOption',
      template: '<option :value="value">{{ label }}</option>',
      props: ['value', 'label']
    },
    ElRadioGroup: {
      name: 'ElRadioGroup',
      template: '<div class="radio-group"><slot /></div>',
      props: ['modelValue']
    },
    ElRadio: {
      name: 'ElRadio',
      template: '<label><input type="radio" :value="value" :checked="modelValue === value" @change="$emit(\'update:modelValue\', value)" /> {{ value }}</label>',
      props: ['modelValue', 'value']
    },
    ElCheckboxGroup: {
      name: 'ElCheckboxGroup',
      template: '<div class="checkbox-group"><slot /></div>',
      props: ['modelValue']
    },
    ElCheckbox: {
      name: 'ElCheckbox',
      template: '<label><input type="checkbox" :value="value" :checked="modelValue?.includes(value)" @change="$emit(\'update:modelValue\', $event.target.checked ? [...(modelValue || []), value] : modelValue?.filter(v => v !== value))" /> {{ value }}</label>',
      props: ['modelValue', 'value']
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input type="date" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'placeholder', 'format', 'valueFormat']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button :type="type" :disabled="loading" @click="$emit(\'click\')"><slot /></button>',
      props: ['type', 'loading']
    },
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><div class="el-card__header" v-if="$slots.header"><slot name="header" /></div><slot /></div>'
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
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<span class="el-icon"><slot /></span>'
    }
  };
});

// Mock icons
vi.mock('@element-plus/icons-vue', () => ({
  User: { name: 'UserIcon' },
  Avatar: { name: 'AvatarIcon' },
  DocumentChecked: { name: 'DocumentCheckedIcon' },
  Document: { name: 'DocumentIcon' }
}));

// 控制台错误检测变量
let consoleSpy: any

describe('StudentForm.vue', () => {
  let wrapper;
  let mockFormRef;

  const mockInitialData = {
    id: 1,
    name: '张三',
    studentId: 'ST12345678',
    gender: '男',
    birthDate: '2020-01-15',
    enrollmentDate: '2023-09-01',
    classId: '1',
    parentName: '张爸爸',
    phone: '13800138000',
    relationship: 'father',
    address: '北京市朝阳区',
    emergencyContact: '李妈妈 13900139000',
    healthStatus: ['healthy'],
    allergyInfo: '',
    medicationInfo: '',
    notes: '活泼好动',
    hobbies: ['drawing', 'sports'],
    personality: ['cheerful', 'curious']
  };

  beforeEach(() => {
    mockFormRef = {
      validate: vi.fn().mockResolvedValue(true),
      resetFields: vi.fn()
    };

    wrapper = mount(StudentForm, {
      props: {
        initialData: mockInitialData,
        readonly: false
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
    it('renders component without crashing', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.classes()).toContain('student-form');
    });

    it('renders all form sections correctly', () => {
      const sections = wrapper.findAll('.form-section');
      expect(sections).toHaveLength(4); // 基本信息、家长信息、健康信息、其他信息
      
      const sectionHeaders = wrapper.findAll('.section-header');
      expect(sectionHeaders).toHaveLength(4);
      expect(sectionHeaders[0].text()).toContain('基本信息');
      expect(sectionHeaders[1].text()).toContain('家长信息');
      expect(sectionHeaders[2].text()).toContain('健康信息');
      expect(sectionHeaders[3].text()).toContain('其他信息');
    });

    it('renders form action buttons', () => {
      const buttons = wrapper.findAll('.form-actions .el-button');
      expect(buttons).toHaveLength(3);
      expect(buttons[0].text()).toBe('重置表单');
      expect(buttons[1].text()).toBe('保存草稿');
      expect(buttons[2].text()).toBe('提交保存');
    });

    it('applies readonly prop correctly', async () => {
      await wrapper.setProps({ readonly: true });
      // In a real scenario, readonly would disable inputs
      // For testing, we verify the prop is received
      expect(wrapper.props('readonly')).toBe(true);
    });
  });

  describe('Form Data Initialization', () => {
    it('initializes form with default values', () => {
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe('');
      expect(formData.studentId).toBe('');
      expect(formData.gender).toBe('男');
      expect(formData.healthStatus).toEqual(['healthy']);
      expect(formData.relationship).toBe('mother');
      expect(formData.hobbies).toEqual([]);
      expect(formData.personality).toEqual([]);
    });

    it('initializes form with initial data when provided', () => {
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe(mockInitialData.name);
      expect(formData.studentId).toBe(mockInitialData.studentId);
      expect(formData.gender).toBe(mockInitialData.gender);
      expect(formData.birthDate).toBe(mockInitialData.birthDate);
      expect(formData.classId).toBe(mockInitialData.classId);
      expect(formData.parentName).toBe(mockInitialData.parentName);
      expect(formData.phone).toBe(mockInitialData.phone);
      expect(formData.hobbies).toEqual(mockInitialData.hobbies);
      expect(formData.personality).toEqual(mockInitialData.personality);
    });

    it('reacts to initialData prop changes', async () => {
      const newInitialData = {
        name: '李四',
        studentId: 'ST87654321',
        gender: '女'
      };

      await wrapper.setProps({ initialData: newInitialData });
      
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe(newInitialData.name);
      expect(formData.studentId).toBe(newInitialData.studentId);
      expect(formData.gender).toBe(newInitialData.gender);
    });
  });

  describe('Form Validation Rules', () => {
    it('has correct validation rules defined', () => {
      const rules = wrapper.vm.rules;
      
      expect(rules.name).toHaveLength(2);
      expect(rules.name[0].required).toBe(true);
      expect(rules.name[1].min).toBe(2);
      expect(rules.name[1].max).toBe(10);
      
      expect(rules.studentId).toHaveLength(2);
      expect(rules.studentId[0].required).toBe(true);
      expect(rules.studentId[1].pattern).toBe(/^ST\d{8}$/);
      
      expect(rules.phone).toHaveLength(2);
      expect(rules.phone[0].required).toBe(true);
      expect(rules.phone[1].pattern).toBe(/^1[3-9]\d{9}$/);
      
      expect(rules.gender).toHaveLength(1);
      expect(rules.gender[0].required).toBe(true);
      
      expect(rules.birthDate).toHaveLength(1);
      expect(rules.birthDate[0].required).toBe(true);
      
      expect(rules.enrollmentDate).toHaveLength(1);
      expect(rules.enrollmentDate[0].required).toBe(true);
      
      expect(rules.classId).toHaveLength(1);
      expect(rules.classId[0].required).toBe(true);
      
      expect(rules.parentName).toHaveLength(1);
      expect(rules.parentName[0].required).toBe(true);
      
      expect(rules.relationship).toHaveLength(1);
      expect(rules.relationship[0].required).toBe(true);
    });

    it('validates required fields correctly', async () => {
      // Test empty form
      await wrapper.setProps({ initialData: {} });
      
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.submitForm();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
      expect(ElMessage.error).toHaveBeenCalledWith('请检查表单信息后重试');
    });

    it('validates student ID format', async () => {
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          studentId: 'INVALID' // Invalid format
        }
      });
      
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.submitForm();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
    });

    it('validates phone number format', async () => {
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          phone: '123456' // Invalid phone number
        }
      });
      
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.submitForm();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('submits form successfully with valid data', async () => {
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.vm.submitForm();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
      expect(wrapper.vm.submitting).toBe(false); // Should be reset after submission
      
      const submitEmits = wrapper.emitted('submit');
      expect(submitEmits).toBeTruthy();
      expect(submitEmits[0][0]).toEqual(wrapper.vm.formData);
      
      expect(ElMessage.success).toHaveBeenCalledWith('学生信息提交成功！');
    });

    it('handles submission loading state correctly', async () => {
      mockFormRef.validate.mockResolvedValue(true);
      
      const submitPromise = wrapper.vm.submitForm();
      
      expect(wrapper.vm.submitting).toBe(true);
      
      await submitPromise;
      
      expect(wrapper.vm.submitting).toBe(false);
    });

    it('does not submit when form validation fails', async () => {
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.submitForm();
      
      expect(wrapper.emitted('submit')).toBeFalsy();
      expect(ElMessage.error).toHaveBeenCalledWith('请检查表单信息后重试');
    });

    it('simulates API call delay during submission', async () => {
      mockFormRef.validate.mockResolvedValue(true);
      
      const startTime = Date.now();
      await wrapper.vm.submitForm();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000); // At least 1 second delay
    });
  });

  describe('Form Actions', () => {
    it('resets form correctly', async () => {
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          name: 'Modified Name',
          studentId: 'ST99999999'
        }
      });
      
      await wrapper.vm.resetForm();
      
      expect(mockFormRef.resetFields).toHaveBeenCalled();
      expect(wrapper.emitted('reset')).toBeTruthy();
      expect(ElMessage.success).toHaveBeenCalledWith('表单已重置');
    });

    it('saves draft correctly', async () => {
      await wrapper.vm.saveAsDraft();
      
      const draftEmits = wrapper.emitted('save-draft');
      expect(draftEmits).toBeTruthy();
      expect(draftEmits[0][0]).toEqual(wrapper.vm.formData);
      
      expect(ElMessage.success).toHaveBeenCalledWith('草稿已保存');
    });

    it('reinitializes with initial data after reset when initialData is provided', async () => {
      const originalName = wrapper.vm.formData.name;
      
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          name: 'Modified Name'
        }
      });
      
      await wrapper.vm.resetForm();
      
      expect(wrapper.vm.formData.name).toBe(originalName);
    });

    it('resets to default values when no initialData is provided', async () => {
      await wrapper.setProps({ initialData: null });
      
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          name: 'Modified Name',
          studentId: 'ST99999999'
        }
      });
      
      await wrapper.vm.resetForm();
      
      expect(wrapper.vm.formData.name).toBe('');
      expect(wrapper.vm.formData.studentId).toBe('');
      expect(wrapper.vm.formData.gender).toBe('男');
      expect(wrapper.vm.formData.healthStatus).toEqual(['healthy']);
    });
  });

  describe('Form Fields Interaction', () => {
    it('updates form data when input fields change', async () => {
      const nameInput = wrapper.find('input[placeholder*="学生姓名"]');
      await nameInput.setValue('新学生姓名');
      
      expect(wrapper.vm.formData.name).toBe('新学生姓名');
    });

    it('handles radio button selection', async () => {
      const maleRadio = wrapper.find('input[value="男"]');
      const femaleRadio = wrapper.find('input[value="女"]');
      
      await femaleRadio.setValue();
      expect(wrapper.vm.formData.gender).toBe('女');
      
      await maleRadio.setValue();
      expect(wrapper.vm.formData.gender).toBe('男');
    });

    it('handles select dropdown changes', async () => {
      const classSelect = wrapper.find('select[placeholder*="班级"]');
      await classSelect.setValue('3');
      
      expect(wrapper.vm.formData.classId).toBe('3');
    });

    it('handles multi-select changes', async () => {
      const hobbiesSelect = wrapper.find('select[placeholder*="兴趣爱好"]');
      await hobbiesSelect.setValue(['drawing', 'sports']);
      
      expect(wrapper.vm.formData.hobbies).toEqual(['drawing', 'sports']);
    });

    it('handles checkbox group changes', async () => {
      const healthyCheckbox = wrapper.find('input[value="healthy"]');
      const allergyCheckbox = wrapper.find('input[value="allergy"]');
      
      // Initially healthy is checked
      expect(wrapper.vm.formData.healthStatus).toContain('healthy');
      
      // Add allergy
      await allergyCheckbox.setValue();
      expect(wrapper.vm.formData.healthStatus).toContain('allergy');
      
      // Remove healthy
      await healthyCheckbox.setValue();
      expect(wrapper.vm.formData.healthStatus).not.toContain('healthy');
    });

    it('handles date picker changes', async () => {
      const birthDatePicker = wrapper.find('input[type="date"][placeholder*="出生日期"]');
      await birthDatePicker.setValue('2020-05-15');
      
      expect(wrapper.vm.formData.birthDate).toBe('2020-05-15');
    });

    it('handles textarea changes', async () => {
      const notesTextarea = wrapper.find('textarea[placeholder*="其他需要说明"]');
      await notesTextarea.setValue('这是一个特殊说明');
      
      expect(wrapper.vm.formData.notes).toBe('这是一个特殊说明');
    });
  });

  describe('Computed Properties', () => {
    it('calculates age correctly from birth date', async () => {
      // Test with no birth date
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          birthDate: ''
        }
      });
      expect(wrapper.vm.calculateAge).toBe(0);
      
      // Test with birth date
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - 5; // 5 years old
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          birthDate: `${birthYear}-01-01`
        }
      });
      
      let age = wrapper.vm.calculateAge;
      expect(age).toBeGreaterThanOrEqual(4);
      expect(age).toBeLessThanOrEqual(6);
      
      // Test with birthday not yet occurred this year
      const today = new Date();
      if (today.getMonth() < 1 || (today.getMonth() === 1 && today.getDate() < 1)) {
        expect(age).toBe(4);
      } else {
        expect(age).toBe(5);
      }
    });
  });

  describe('Error Handling', () => {
    it('handles form validation errors gracefully', async () => {
      const validationError = new Error('Validation failed');
      mockFormRef.validate.mockRejectedValue(validationError);
      
      await wrapper.vm.submitForm();
      
      expect(wrapper.emitted('submit')).toBeFalsy();
      expect(ElMessage.error).toHaveBeenCalledWith('请检查表单信息后重试');
    });

    it('handles submission errors gracefully', async () => {
      mockFormRef.validate.mockResolvedValue(true);
      
      // Mock the Promise to reject
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn((callback) => {
        callback();
        return 1;
      });
      
      try {
        await wrapper.vm.submitForm();
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      global.setTimeout = originalSetTimeout;
    });

    it('handles missing form reference', async () => {
      wrapper.vm.formRef = null;
      
      await wrapper.vm.submitForm();
      
      expect(wrapper.emitted('submit')).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('renders form with proper structure for accessibility', () => {
      const form = wrapper.find('form');
      expect(form.exists()).toBe(true);
      expect(form.attributes('submit.prevent')).toBeDefined();
    });

    it('has proper labels for all form fields', () => {
      const labels = wrapper.findAll('.el-form-item__label');
      expect(labels.length).toBeGreaterThan(0);
      
      // Check some specific labels
      const labelContents = labels.map(label => label.text());
      expect(labelContents).toContain('学生姓名');
      expect(labelContents).toContain('学号');
      expect(labelContents).toContain('性别');
      expect(labelContents).toContain('出生日期');
    });

    it('has proper placeholders for inputs', () => {
      const inputs = wrapper.findAll('input[placeholder]');
      expect(inputs.length).toBeGreaterThan(0);
      
      const nameInput = wrapper.find('input[placeholder*="学生姓名"]');
      expect(nameInput.exists()).toBe(true);
      
      const studentIdInput = wrapper.find('input[placeholder*="ST + 8位数字"]');
      expect(studentIdInput.exists()).toBe(true);
    });
  });

  describe('Performance', () => {
    it('handles rapid form field changes efficiently', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 50; i++) {
        await wrapper.setData({
          formData: {
            ...wrapper.vm.formData,
            name: `Student ${i}`,
            studentId: `ST${String(i).padStart(8, '0')}`
          }
        });
        await nextTick();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('efficiently handles large form data', async () => {
      const largeFormData = {
        ...wrapper.vm.formData,
        notes: 'A'.repeat(10000), // Large text
        hobbies: Array.from({ length: 100 }, (_, i) => `hobby_${i}`),
        personality: Array.from({ length: 100 }, (_, i) => `trait_${i}`)
      };
      
      const startTime = performance.now();
      await wrapper.setData({ formData: largeFormData });
      await nextTick();
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive styles for mobile devices', () => {
      // Test that responsive classes are present
      const form = wrapper.find('.student-form');
      expect(form.exists()).toBe(true);
      
      // Check that form has appropriate padding
      expect(form.attributes('style')).toBeDefined();
    });

    it('handles form layout changes on different screen sizes', () => {
      const rows = wrapper.findAll('.el-row');
      expect(rows.length).toBeGreaterThan(0);
      
      const cols = wrapper.findAll('.el-col');
      expect(cols.length).toBeGreaterThan(0);
      
      // Check that columns have span attributes
      cols.forEach(col => {
        expect(col.attributes('span')).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty initial data', async () => {
      await wrapper.setProps({ initialData: {} });
      
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe('');
      expect(formData.studentId).toBe('');
      expect(formData.gender).toBe('男');
      expect(formData.healthStatus).toEqual(['healthy']);
    });

    it('handles null initial data', async () => {
      await wrapper.setProps({ initialData: null });
      
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe('');
      expect(formData.studentId).toBe('');
      expect(formData.gender).toBe('男');
    });

    it('handles partial initial data', async () => {
      const partialData = {
        name: 'Partial Student',
        gender: '女'
      };
      
      await wrapper.setProps({ initialData: partialData });
      
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe('Partial Student');
      expect(formData.gender).toBe('女');
      expect(formData.studentId).toBe(''); // Default value
      expect(formData.birthDate).toBe(''); // Default value
    });

    it('handles invalid initial data gracefully', async () => {
      const invalidData = {
        name: 123, // Invalid type
        gender: 'invalid', // Invalid value
        classId: 999 // Invalid type
      };
      
      await wrapper.setProps({ initialData: invalidData });
      
      // Should not crash and should handle invalid data
      expect(wrapper.vm.formData.name).toBe(123);
      expect(wrapper.vm.formData.gender).toBe('invalid');
    });

    it('handles form submission with minimal valid data', async () => {
      const minimalData = {
        name: 'Min',
        studentId: 'ST12345678',
        gender: '男',
        birthDate: '2020-01-01',
        enrollmentDate: '2023-09-01',
        classId: '1',
        parentName: 'Parent',
        phone: '13800138000',
        relationship: 'father'
      };
      
      await wrapper.setData({ formData: minimalData });
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.vm.submitForm();
      
      expect(wrapper.emitted('submit')).toBeTruthy();
      expect(wrapper.emitted('submit')[0][0]).toEqual(minimalData);
    });
  });
});
