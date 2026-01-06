
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
import TeacherEditDialog from '@/components/TeacherEditDialog.vue';
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
      props: ['modelValue', 'placeholder']
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
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag"><slot />{{ closable ? \'×\' : \'\' }}</span>',
      props: ['closable'],
      emits: ['close']
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

describe('TeacherEditDialog.vue', () => {
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

  const mockTeacher = {
    id: '1',
    name: '张老师',
    gender: 'MALE',
    phone: '13800138000',
    email: 'zhang@example.com',
    employeeId: 'EMP001',
    title: '高级教师',
    type: 'FULL_TIME',
    department: '教学部',
    hireDate: '2020-09-01',
    status: 'ACTIVE',
    skills: ['教学', '管理', '沟通']
  };

  beforeEach(() => {
    mockFormRef = {
      validate: vi.fn().mockResolvedValue(true),
      resetFields: vi.fn()
    };

    wrapper = mount(TeacherEditDialog, {
      props: {
        modelValue: true,
        teacher: null
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

    it('shows correct title for creating new teacher', () => {
      expect(wrapper.find('.el-dialog__header').text()).toBe('新增教师');
    });

    it('shows correct title for editing existing teacher', async () => {
      await wrapper.setProps({ teacher: mockTeacher });
      expect(wrapper.find('.el-dialog__header').text()).toBe('编辑教师');
    });

    it('renders all form fields correctly', () => {
      const formItems = wrapper.findAll('.el-form-item');
      expect(formItems.length).toBeGreaterThan(0);
      
      // Check specific form fields
      const nameInput = wrapper.find('input[placeholder*="教师姓名"]');
      expect(nameInput.exists()).toBe(true);
      
      const phoneInput = wrapper.find('input[placeholder*="联系电话"]');
      expect(phoneInput.exists()).toBe(true);
      
      const genderSelect = wrapper.find('select[placeholder*="选择性别"]');
      expect(genderSelect.exists()).toBe(true);
      
      const typeSelect = wrapper.find('select[placeholder*="选择类型"]');
      expect(typeSelect.exists()).toBe(true);
      
      const skillsInput = wrapper.find('input[placeholder*="技能，用逗号分隔"]');
      expect(skillsInput.exists()).toBe(true);
    });

    it('renders dialog footer with buttons', () => {
      const footer = wrapper.find('.el-dialog__footer');
      expect(footer.exists()).toBe(true);
      
      const buttons = footer.findAll('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].text()).toBe('取消');
      expect(buttons[1].text()).toBe('创建');
    });

    it('renders gender options correctly', () => {
      const options = wrapper.findAll('option');
      const genderOptions = options.filter(option => 
        ['男', '女'].includes(option.text())
      );
      expect(genderOptions.length).toBe(2);
    });

    it('renders type options correctly', () => {
      const options = wrapper.findAll('option');
      const typeOptions = options.filter(option => 
        ['全职', '兼职', '合同工', '实习生'].includes(option.text())
      );
      expect(typeOptions.length).toBe(4);
    });

    it('renders department options correctly', () => {
      const options = wrapper.findAll('option');
      const departmentOptions = options.filter(option => 
        ['教学部', '保育部', '后勤部', '行政部'].includes(option.text())
      );
      expect(departmentOptions.length).toBe(4);
    });

    it('renders status options correctly', () => {
      const options = wrapper.findAll('option');
      const statusOptions = options.filter(option => 
        ['在职', '请假', '离职', '停职'].includes(option.text())
      );
      expect(statusOptions.length).toBe(4);
    });

    it('hides dialog when modelValue is false', async () => {
      await wrapper.setProps({ modelValue: false });
      expect(wrapper.find('.el-dialog').exists()).toBe(false);
    });
  });

  describe('Form Data Initialization', () => {
    it('initializes with default form data when no teacher is provided', () => {
      const form = wrapper.vm.form;
      expect(form.name).toBe('');
      expect(form.gender).toBe('MALE');
      expect(form.phone).toBe('');
      expect(form.email).toBe('');
      expect(form.employeeId).toBe('');
      expect(form.title).toBe('');
      expect(form.type).toBe('FULL_TIME');
      expect(form.department).toBe('');
      expect(form.hireDate).toBe('');
      expect(form.status).toBe('ACTIVE');
      expect(form.skills).toEqual([]);
      expect(wrapper.vm.skillsInput).toBe('');
    });

    it('populates form with teacher data when teacher is provided', async () => {
      await wrapper.setProps({ teacher: mockTeacher });
      
      const form = wrapper.vm.form;
      expect(form.name).toBe(mockTeacher.name);
      expect(form.gender).toBe(mockTeacher.gender);
      expect(form.phone).toBe(mockTeacher.phone);
      expect(form.email).toBe(mockTeacher.email);
      expect(form.employeeId).toBe(mockTeacher.employeeId);
      expect(form.title).toBe(mockTeacher.title);
      expect(form.type).toBe(mockTeacher.type);
      expect(form.department).toBe(mockTeacher.department);
      expect(form.hireDate).toBe(mockTeacher.hireDate);
      expect(form.status).toBe(mockTeacher.status);
      expect(form.skills).toEqual(mockTeacher.skills);
      expect(wrapper.vm.skillsInput).toBe(mockTeacher.skills.join(','));
    });

    it('handles teacher with missing properties', async () => {
      const partialTeacher = {
        id: '1',
        name: '部分教师',
        phone: '13800138000'
      };

      await wrapper.setProps({ teacher: partialTeacher });
      
      const form = wrapper.vm.form;
      expect(form.name).toBe('部分教师');
      expect(form.phone).toBe('13800138000');
      expect(form.gender).toBe('MALE'); // Default value
      expect(form.type).toBe('FULL_TIME'); // Default value
      expect(form.status).toBe('ACTIVE'); // Default value
      expect(form.skills).toEqual([]); // Default value
    });

    it('reacts to teacher prop changes', async () => {
      // Initially no teacher
      expect(wrapper.vm.form.name).toBe('');
      
      // Set teacher
      await wrapper.setProps({ teacher: mockTeacher });
      expect(wrapper.vm.form.name).toBe(mockTeacher.name);
      
      // Change to different teacher
      const differentTeacher = { ...mockTeacher, name: '李老师' };
      await wrapper.setProps({ teacher: differentTeacher });
      expect(wrapper.vm.form.name).toBe('李老师');
      
      // Remove teacher
      await wrapper.setProps({ teacher: null });
      expect(wrapper.vm.form.name).toBe('');
      expect(wrapper.vm.skillsInput).toBe('');
    });
  });

  describe('Computed Properties', () => {
    it('computes dialog visibility correctly', async () => {
      // Initially visible
      expect(wrapper.vm.visible).toBe(true);
      
      // Hide dialog
      await wrapper.setProps({ modelValue: false });
      expect(wrapper.vm.visible).toBe(false);
      
      // Show dialog again
      await wrapper.setProps({ modelValue: true });
      expect(wrapper.vm.visible).toBe(true);
    });
  });

  describe('Form Validation Rules', () => {
    it('has correct validation rules defined', () => {
      const rules = wrapper.vm.rules;
      
      expect(rules.name).toHaveLength(1);
      expect(rules.name[0].required).toBe(true);
      
      expect(rules.gender).toHaveLength(1);
      expect(rules.gender[0].required).toBe(true);
      
      expect(rules.phone).toHaveLength(2);
      expect(rules.phone[0].required).toBe(true);
      expect(rules.phone[1].pattern).toBe(/^1[3-9]\d{9}$/);
      
      expect(rules.email).toHaveLength(1);
      expect(rules.email[0].type).toBe('email');
      
      expect(rules.type).toHaveLength(1);
      expect(rules.type[0].required).toBe(true);
      
      expect(rules.hireDate).toHaveLength(1);
      expect(rules.hireDate[0].required).toBe(true);
      
      expect(rules.status).toHaveLength(1);
      expect(rules.status[0].required).toBe(true);
      
      // Optional fields should not have validation rules
      expect(rules.employeeId).toBeUndefined();
      expect(rules.title).toBeUndefined();
      expect(rules.department).toBeUndefined();
    });

    it('validates required fields', async () => {
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
    });

    it('validates phone number format', async () => {
      await wrapper.setData({
        form: {
          ...wrapper.vm.form,
          phone: 'invalid-phone' // Invalid format
        }
      });
      
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
    });

    it('validates email format', async () => {
      await wrapper.setData({
        form: {
          ...wrapper.vm.form,
          email: 'invalid-email' // Invalid format
        }
      });
      
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
    });
  });

  describe('Skills Management', () => {
    it('updates skills when skillsInput changes', async () => {
      await wrapper.setData({ skillsInput: '教学,管理,沟通' });
      
      expect(wrapper.vm.form.skills).toEqual(['教学', '管理', '沟通']);
    });

    it('handles empty skills input', async () => {
      await wrapper.setData({ skillsInput: '' });
      
      expect(wrapper.vm.form.skills).toEqual([]);
    });

    it('trims whitespace from skills', async () => {
      await wrapper.setData({ skillsInput: ' 教学 , 管理 , 沟通 ' });
      
      expect(wrapper.vm.form.skills).toEqual(['教学', '管理', '沟通']);
    });

    it('filters empty skills', async () => {
      await wrapper.setData({ skillsInput: '教学,,管理,,沟通' });
      
      expect(wrapper.vm.form.skills).toEqual(['教学', '管理', '沟通']);
    });

    it('renders skill tags correctly', async () => {
      await wrapper.setData({
        form: {
          ...wrapper.vm.form,
          skills: ['教学', '管理', '沟通']
        }
      });
      
      const tags = wrapper.findAll('.el-tag');
      expect(tags.length).toBe(3);
      expect(tags[0].text()).toContain('教学');
      expect(tags[1].text()).toContain('管理');
      expect(tags[2].text()).toContain('沟通');
    });

    it('does not render skill tags when skills is empty', async () => {
      await wrapper.setData({
        form: {
          ...wrapper.vm.form,
          skills: []
        }
      });
      
      const tagsContainer = wrapper.find('.skills-tags');
      expect(tagsContainer.exists()).toBe(false);
    });

    it('removes skill correctly', async () => {
      await wrapper.setData({
        form: {
          ...wrapper.vm.form,
          skills: ['教学', '管理', '沟通']
        },
        skillsInput: '教学,管理,沟通'
      });
      
      await wrapper.vm.removeSkill('管理');
      
      expect(wrapper.vm.form.skills).toEqual(['教学', '沟通']);
      expect(wrapper.vm.skillsInput).toBe('教学,沟通');
    });

    it('does not remove non-existent skill', async () => {
      await wrapper.setData({
        form: {
          ...wrapper.vm.form,
          skills: ['教学', '管理']
        },
        skillsInput: '教学,管理'
      });
      
      await wrapper.vm.removeSkill('不存在的技能');
      
      expect(wrapper.vm.form.skills).toEqual(['教学', '管理']);
      expect(wrapper.vm.skillsInput).toBe('教学,管理');
    });

    it('updates skillsInput when teacher prop changes', async () => {
      await wrapper.setProps({ teacher: mockTeacher });
      
      expect(wrapper.vm.skillsInput).toBe(mockTeacher.skills.join(','));
      
      await wrapper.setProps({ teacher: null });
      
      expect(wrapper.vm.skillsInput).toBe('');
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
          name: 'Modified Name',
          skills: ['技能1', '技能2']
        },
        skillsInput: '技能1,技能2'
      });
      
      await wrapper.vm.handleCancel();
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false);
      expect(wrapper.vm.form.name).toBe('');
      expect(wrapper.vm.form.skills).toEqual([]);
      expect(wrapper.vm.skillsInput).toBe('');
      expect(mockFormRef.resetFields).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('saves new teacher successfully', async () => {
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.setData({
        form: {
          name: '新教师',
          gender: 'FEMALE',
          phone: '13900139000',
          email: 'newteacher@example.com',
          employeeId: 'EMP002',
          title: '中级教师',
          type: 'PART_TIME',
          department: '保育部',
          hireDate: '2024-09-01',
          status: 'ACTIVE',
          skills: ['教学', '护理']
        },
        skillsInput: '教学,护理'
      });
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
      
      const saveEmits = wrapper.emitted('save');
      expect(saveEmits).toBeTruthy();
      expect(saveEmits[0][0]).toEqual({
        name: '新教师',
        gender: 'FEMALE',
        phone: '13900139000',
        email: 'newteacher@example.com',
        employeeId: 'EMP002',
        title: '中级教师',
        type: 'PART_TIME',
        department: '保育部',
        hireDate: '2024-09-01',
        status: 'ACTIVE',
        skills: ['教学', '护理']
      });
      
      // Should not include ID for new teacher
      expect(saveEmits[0][0].id).toBeUndefined();
    });

    it('saves existing teacher with skills', async () => {
      await wrapper.setProps({ teacher: mockTeacher });
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.setData({
        form: {
          ...wrapper.vm.form,
          name: '更新后的教师'
        }
      });
      
      await wrapper.vm.handleSave();
      
      const saveEmits = wrapper.emitted('save');
      expect(saveEmits).toBeTruthy();
      expect(saveEmits[0][0]).toEqual({
        name: '更新后的教师',
        gender: mockTeacher.gender,
        phone: mockTeacher.phone,
        email: mockTeacher.email,
        employeeId: mockTeacher.employeeId,
        title: mockTeacher.title,
        type: mockTeacher.type,
        department: mockTeacher.department,
        hireDate: mockTeacher.hireDate,
        status: mockTeacher.status,
        skills: mockTeacher.skills
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
      
      expect(wrapper.vm.loading).toBe(true);
      
      await savePromise;
      
      expect(wrapper.vm.loading).toBe(false);
    });

    it('handles missing form reference', async () => {
      wrapper.vm.formRef = null;
      
      await wrapper.vm.handleSave();
      
      expect(wrapper.emitted('save')).toBeFalsy();
    });
  });

  describe('Form Fields Interaction', () => {
    it('updates form data when input fields change', async () => {
      const nameInput = wrapper.find('input[placeholder*="教师姓名"]');
      await nameInput.setValue('新教师姓名');
      
      expect(wrapper.vm.form.name).toBe('新教师姓名');
    });

    it('handles gender selection change', async () => {
      const genderSelect = wrapper.find('select[placeholder*="选择性别"]');
      await genderSelect.setValue('FEMALE');
      
      expect(wrapper.vm.form.gender).toBe('FEMALE');
    });

    it('handles phone change', async () => {
      const phoneInput = wrapper.find('input[placeholder*="联系电话"]');
      await phoneInput.setValue('13900139000');
      
      expect(wrapper.vm.form.phone).toBe('13900139000');
    });

    it('handles email change', async () => {
      const emailInput = wrapper.find('input[placeholder*="邮箱"]');
      await emailInput.setValue('teacher@example.com');
      
      expect(wrapper.vm.form.email).toBe('teacher@example.com');
    });

    it('handles employee ID change', async () => {
      const employeeIdInput = wrapper.find('input[placeholder*="工号"]');
      await employeeIdInput.setValue('EMP002');
      
      expect(wrapper.vm.form.employeeId).toBe('EMP002');
    });

    it('handles title change', async () => {
      const titleInput = wrapper.find('input[placeholder*="职称"]');
      await titleInput.setValue('高级教师');
      
      expect(wrapper.vm.form.title).toBe('高级教师');
    });

    it('handles type selection change', async () => {
      const typeSelect = wrapper.find('select[placeholder*="选择类型"]');
      await typeSelect.setValue('PART_TIME');
      
      expect(wrapper.vm.form.type).toBe('PART_TIME');
    });

    it('handles department selection change', async () => {
      const departmentSelect = wrapper.find('select[placeholder*="选择部门"]');
      await departmentSelect.setValue('保育部');
      
      expect(wrapper.vm.form.department).toBe('保育部');
    });

    it('handles hire date change', async () => {
      const hireDatePicker = wrapper.find('input[type="date"][placeholder*="选择入职时间"]');
      await hireDatePicker.setValue('2024-09-01');
      
      expect(wrapper.vm.form.hireDate).toBe('2024-09-01');
    });

    it('handles status selection change', async () => {
      const statusSelect = wrapper.find('select[placeholder*="选择状态"]');
      await statusSelect.setValue('LEAVE');
      expect(wrapper.vm.form.status).toBe('LEAVE');
    });
  });

  describe('Form Reset', () => {
    it('resets form to default values', async () => {
      await wrapper.setData({
        form: {
          name: 'Modified Name',
          gender: 'FEMALE',
          phone: '13900139000',
          skills: ['技能1', '技能2']
        },
        skillsInput: '技能1,技能2'
      });
      
      await wrapper.vm.resetForm();
      
      expect(wrapper.vm.form.name).toBe('');
      expect(wrapper.vm.form.gender).toBe('MALE');
      expect(wrapper.vm.form.phone).toBe('');
      expect(wrapper.vm.form.type).toBe('FULL_TIME');
      expect(wrapper.vm.form.status).toBe('ACTIVE');
      expect(wrapper.vm.form.skills).toEqual([]);
      expect(wrapper.vm.skillsInput).toBe('');
      expect(mockFormRef.resetFields).toHaveBeenCalled();
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
      expect(wrapper.vm.form.name).toBe('');
      expect(wrapper.vm.skillsInput).toBe('');
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
      
      const nameInput = wrapper.find('input[placeholder*="教师姓名"]');
      expect(nameInput.exists()).toBe(true);
      
      const phoneInput = wrapper.find('input[placeholder*="联系电话"]');
      expect(phoneInput.exists()).toBe(true);
    });
  });

  describe('Performance', () => {
    it('handles rapid form field changes efficiently', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 20; i++) {
        await wrapper.setData({
          form: {
            ...wrapper.vm.form,
            name: `教师 ${i}`,
            phone: `139${String(i).padStart(8, '0')}`
          }
        });
        await nextTick();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('handles rapid skills input changes efficiently', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 15; i++) {
        await wrapper.setData({ skillsInput: `技能${i},技能${i+1}` });
        await nextTick();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('handles rapid teacher prop changes efficiently', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        const teacher = { ...mockTeacher, name: `教师 ${i}` };
        await wrapper.setProps({ teacher });
        await nextTick();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Edge Cases', () => {
    it('handles teacher with undefined properties', async () => {
      const teacherWithUndefined = {
        id: '1',
        name: undefined,
        gender: undefined,
        phone: undefined,
        email: undefined,
        employeeId: undefined,
        title: undefined,
        type: undefined,
        department: undefined,
        hireDate: undefined,
        status: undefined,
        skills: undefined
      };
      
      await wrapper.setProps({ teacher: teacherWithUndefined });
      
      const form = wrapper.vm.form;
      expect(form.name).toBe('');
      expect(form.gender).toBe('MALE'); // Default value
      expect(form.phone).toBe('');
      expect(form.type).toBe('FULL_TIME'); // Default value
      expect(form.status).toBe('ACTIVE'); // Default value
      expect(form.skills).toEqual([]); // Default value
    });

    it('handles form submission with minimal valid data', async () => {
      const minimalData = {
        name: '最小教师',
        gender: 'MALE',
        phone: '13800138000',
        type: 'FULL_TIME',
        hireDate: '2024-09-01',
        status: 'ACTIVE'
        // Other fields are optional
      };
      
      await wrapper.setData({ form: minimalData });
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.vm.handleSave();
      
      const saveEmits = wrapper.emitted('save');
      expect(saveEmits).toBeTruthy();
      expect(saveEmits[0][0]).toEqual(minimalData);
    });

    it('handles skills with special characters', async () => {
      await wrapper.setData({ skillsInput: 'C++,Python,JavaScript,UI/UX' });
      
      expect(wrapper.vm.form.skills).toEqual(['C++', 'Python', 'JavaScript', 'UI/UX']);
    });

    it('handles very long skills input', async () => {
      const longSkills = Array.from({ length: 100 }, (_, i) => `技能${i}`).join(',');
      await wrapper.setData({ skillsInput: longSkills });
      
      expect(wrapper.vm.form.skills).toHaveLength(100);
      expect(wrapper.vm.form.skills[0]).toBe('技能0');
      expect(wrapper.vm.form.skills[99]).toBe('技能99');
    });

    it('handles skills input with only whitespace and commas', async () => {
      await wrapper.setData({ skillsInput: ' , , , ' });
      
      expect(wrapper.vm.form.skills).toEqual([]);
    });

    it('handles dialog close during loading', async () => {
      mockFormRef.validate.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(true), 1000);
      }));
      
      const savePromise = wrapper.vm.handleSave();
      
      // Close dialog while loading
      await wrapper.setProps({ modelValue: false });
      
      await savePromise;
      
      expect(wrapper.vm.loading).toBe(false);
    });

    it('handles removing skill from empty skills array', async () => {
      await wrapper.setData({
        form: {
          ...wrapper.vm.form,
          skills: []
        }
      });
      
      await wrapper.vm.removeSkill('不存在的技能');
      
      expect(wrapper.vm.form.skills).toEqual([]);
    });
  });
});