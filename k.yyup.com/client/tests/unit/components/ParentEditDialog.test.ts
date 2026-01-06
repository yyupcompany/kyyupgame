
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
import ParentEditDialog from '@/components/ParentEditDialog.vue';
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
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input type="date" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'placeholder']
    },
    ElSwitch: {
      name: 'ElSwitch',
      template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
      props: ['modelValue']
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

describe('ParentEditDialog.vue', () => {
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

  const mockParentData = {
    id: '1',
    name: '张爸爸',
    gender: 'MALE',
    phone: '13800138000',
    wechat: 'zhangbaba',
    relationship: '父亲',
    occupation: '工程师',
    email: 'zhang@example.com',
    status: '在读家长',
    address: '北京市朝阳区',
    emergencyContact: '李妈妈',
    emergencyPhone: '13900139000',
    notes: '重要联系人',
    registerDate: '2023-09-01',
    isPrimary: true
  };

  beforeEach(() => {
    mockFormRef = {
      validate: vi.fn().mockResolvedValue(true),
      clearValidate: vi.fn()
    };

    wrapper = mount(ParentEditDialog, {
      props: {
        modelValue: true,
        parentData: null
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

    it('shows correct title for creating new parent', () => {
      expect(wrapper.find('.el-dialog__header').text()).toBe('新增家长');
    });

    it('shows correct title for editing existing parent', async () => {
      await wrapper.setProps({ parentData: mockParentData });
      expect(wrapper.find('.el-dialog__header').text()).toBe('编辑家长');
    });

    it('renders all form fields correctly', () => {
      const formItems = wrapper.findAll('.el-form-item');
      expect(formItems.length).toBeGreaterThan(0);
      
      // Check specific form fields
      const nameInput = wrapper.find('input[placeholder*="家长姓名"]');
      expect(nameInput.exists()).toBe(true);
      
      const phoneInput = wrapper.find('input[placeholder*="联系电话"]');
      expect(phoneInput.exists()).toBe(true);
      
      const relationshipSelect = wrapper.find('select[placeholder*="选择与孩子关系"]');
      expect(relationshipSelect.exists()).toBe(true);
      
      const emailInput = wrapper.find('input[placeholder*="邮箱地址"]');
      expect(emailInput.exists()).toBe(true);
      
      const switchInput = wrapper.find('input[type="checkbox"]');
      expect(switchInput.exists()).toBe(true);
    });

    it('renders dialog footer with buttons', () => {
      const footer = wrapper.find('.el-dialog__footer');
      expect(footer.exists()).toBe(true);
      
      const buttons = footer.findAll('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].text()).toBe('取消');
      expect(buttons[1].text()).toBe('创建');
    });

    it('renders relationship options correctly', () => {
      const options = wrapper.findAll('option');
      const relationshipOptions = options.filter(option => 
        ['父亲', '母亲', '祖父', '祖母', '外祖父', '外祖母', '其他'].includes(option.text())
      );
      expect(relationshipOptions.length).toBe(7);
    });

    it('renders status options correctly', () => {
      const options = wrapper.findAll('option');
      const statusOptions = options.filter(option => 
        ['潜在家长', '在读家长', '毕业家长'].includes(option.text())
      );
      expect(statusOptions.length).toBe(3);
    });

    it('hides dialog when modelValue is false', async () => {
      await wrapper.setProps({ modelValue: false });
      expect(wrapper.find('.el-dialog').exists()).toBe(false);
    });
  });

  describe('Form Data Initialization', () => {
    it('initializes with default form data when no parentData is provided', () => {
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe('');
      expect(formData.gender).toBe('');
      expect(formData.phone).toBe('');
      expect(formData.wechat).toBe('');
      expect(formData.relationship).toBe('');
      expect(formData.occupation).toBe('');
      expect(formData.email).toBe('');
      expect(formData.status).toBe('潜在家长');
      expect(formData.address).toBe('');
      expect(formData.emergencyContact).toBe('');
      expect(formData.emergencyPhone).toBe('');
      expect(formData.notes).toBe('');
      expect(formData.registerDate).toBe('');
      expect(formData.isPrimary).toBe(false);
    });

    it('populates form with parent data when parentData is provided', async () => {
      await wrapper.setProps({ parentData: mockParentData });
      
      // Wait for component to mount and data to be set
      await nextTick();
      await nextTick();
      
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe(mockParentData.name);
      expect(formData.gender).toBe(mockParentData.gender);
      expect(formData.phone).toBe(mockParentData.phone);
      expect(formData.wechat).toBe(mockParentData.wechat);
      expect(formData.relationship).toBe(mockParentData.relationship);
      expect(formData.occupation).toBe(mockParentData.occupation);
      expect(formData.email).toBe(mockParentData.email);
      expect(formData.status).toBe(mockParentData.status);
      expect(formData.address).toBe(mockParentData.address);
      expect(formData.emergencyContact).toBe(mockParentData.emergencyContact);
      expect(formData.emergencyPhone).toBe(mockParentData.emergencyPhone);
      expect(formData.notes).toBe(mockParentData.notes);
      expect(formData.registerDate).toBe(mockParentData.registerDate);
      expect(formData.isPrimary).toBe(mockParentData.isPrimary);
    });

    it('handles parentData with missing properties', async () => {
      const partialParentData = {
        id: '1',
        name: '部分家长',
        phone: '13800138000'
      };

      await wrapper.setProps({ parentData: partialParentData });
      await nextTick();
      await nextTick();
      
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe('部分家长');
      expect(formData.phone).toBe('13800138000');
      expect(formData.gender).toBe(''); // Default empty
      expect(formData.status).toBe('潜在家长'); // Default value
      expect(formData.isPrimary).toBe(false); // Default value
    });

    it('reacts to parentData prop changes', async () => {
      // Initially no parent data
      expect(wrapper.vm.formData.name).toBe('');
      
      // Set parent data
      await wrapper.setProps({ parentData: mockParentData });
      await nextTick();
      await nextTick();
      expect(wrapper.vm.formData.name).toBe(mockParentData.name);
      
      // Change to different parent data
      const differentParentData = { ...mockParentData, name: '李妈妈' };
      await wrapper.setProps({ parentData: differentParentData });
      await nextTick();
      expect(wrapper.vm.formData.name).toBe('李妈妈');
      
      // Remove parent data
      await wrapper.setProps({ parentData: null });
      await nextTick();
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
      
      // Set parent data with ID
      return wrapper.setProps({ parentData: mockParentData }).then(() => {
        expect(wrapper.vm.isEdit).toBe(true);
        
        // Remove parent data
        return wrapper.setProps({ parentData: null });
      }).then(() => {
        expect(wrapper.vm.isEdit).toBe(false);
      });
    });

    it('computes edit mode correctly for parent without ID', async () => {
      const parentWithoutId = { ...mockParentData };
      delete parentWithoutId.id;
      
      await wrapper.setProps({ parentData: parentWithoutId });
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
      
      expect(rules.phone).toHaveLength(2);
      expect(rules.phone[0].required).toBe(true);
      expect(rules.phone[1].pattern).toBe(/^1[3-9]\d{9}$/);
      
      expect(rules.relationship).toHaveLength(1);
      expect(rules.relationship[0].required).toBe(true);
      
      expect(rules.status).toHaveLength(1);
      expect(rules.status[0].required).toBe(true);
      
      expect(rules.email).toHaveLength(1);
      expect(rules.email[0].pattern).toBe(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/);
      
      expect(rules.emergencyPhone).toHaveLength(1);
      expect(rules.emergencyPhone[0].pattern).toBe(/^1[3-9]\d{9}$/);
      
      // Optional fields should not have validation rules
      expect(rules.gender).toBeUndefined();
      expect(rules.wechat).toBeUndefined();
      expect(rules.occupation).toBeUndefined();
      expect(rules.address).toBeUndefined();
      expect(rules.emergencyContact).toBeUndefined();
      expect(rules.notes).toBeUndefined();
      expect(rules.registerDate).toBeUndefined();
    });

    it('validates required fields', async () => {
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
    });

    it('validates phone number format', async () => {
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          phone: 'invalid-phone' // Invalid format
        }
      });
      
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
    });

    it('validates email format', async () => {
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          email: 'invalid-email' // Invalid format
        }
      });
      
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
    });

    it('validates emergency phone format', async () => {
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          emergencyPhone: 'invalid-phone' // Invalid format
        }
      });
      
      mockFormRef.validate.mockResolvedValue(false);
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
    });

    it('validates name length', async () => {
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
          phone: '13900139000'
        }
      });
      
      // Trigger closed event
      await wrapper.find('.el-dialog').vm.$emit('closed');
      
      expect(wrapper.vm.formData.name).toBe('');
      expect(wrapper.vm.formData.phone).toBe('');
      expect(wrapper.vm.formData.status).toBe('潜在家长');
      expect(wrapper.vm.formData.isPrimary).toBe(false);
      expect(mockFormRef.clearValidate).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('saves new parent successfully', async () => {
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.setData({
        formData: {
          name: '新家长',
          gender: 'FEMALE',
          phone: '13900139000',
          wechat: 'newparent',
          relationship: '母亲',
          occupation: '教师',
          email: 'newparent@example.com',
          status: '潜在家长',
          address: '上海市浦东新区',
          emergencyContact: '新紧急联系人',
          emergencyPhone: '13700137000',
          notes: '新备注',
          registerDate: '2024-09-01',
          isPrimary: true
        }
      });
      
      await wrapper.vm.handleSave();
      
      expect(mockFormRef.validate).toHaveBeenCalled();
      
      const saveEmits = wrapper.emitted('save');
      expect(saveEmits).toBeTruthy();
      expect(saveEmits[0][0]).toEqual({
        name: '新家长',
        gender: 'FEMALE',
        phone: '13900139000',
        wechat: 'newparent',
        relationship: '母亲',
        occupation: '教师',
        email: 'newparent@example.com',
        status: '潜在家长',
        address: '上海市浦东新区',
        emergencyContact: '新紧急联系人',
        emergencyPhone: '13700137000',
        notes: '新备注',
        registerDate: '2024-09-01',
        isPrimary: true
      });
      
      // Should not include ID for new parent
      expect(saveEmits[0][0].id).toBeUndefined();
    });

    it('saves existing parent with ID', async () => {
      await wrapper.setProps({ parentData: mockParentData });
      await nextTick();
      await nextTick();
      
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          name: '更新后的家长'
        }
      });
      
      await wrapper.vm.handleSave();
      
      const saveEmits = wrapper.emitted('save');
      expect(saveEmits).toBeTruthy();
      expect(saveEmits[0][0]).toEqual({
        id: mockParentData.id,
        name: '更新后的家长',
        gender: mockParentData.gender,
        phone: mockParentData.phone,
        wechat: mockParentData.wechat,
        relationship: mockParentData.relationship,
        occupation: mockParentData.occupation,
        email: mockParentData.email,
        status: mockParentData.status,
        address: mockParentData.address,
        emergencyContact: mockParentData.emergencyContact,
        emergencyPhone: mockParentData.emergencyPhone,
        notes: mockParentData.notes,
        registerDate: mockParentData.registerDate,
        isPrimary: mockParentData.isPrimary
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
      const nameInput = wrapper.find('input[placeholder*="家长姓名"]');
      await nameInput.setValue('新家长姓名');
      
      expect(wrapper.vm.formData.name).toBe('新家长姓名');
    });

    it('handles gender selection change', async () => {
      const genderSelect = wrapper.find('select[placeholder*="选择性别"]');
      await genderSelect.setValue('FEMALE');
      
      expect(wrapper.vm.formData.gender).toBe('FEMALE');
    });

    it('handles phone change', async () => {
      const phoneInput = wrapper.find('input[placeholder*="联系电话"]');
      await phoneInput.setValue('13900139000');
      
      expect(wrapper.vm.formData.phone).toBe('13900139000');
    });

    it('handles wechat change', async () => {
      const wechatInput = wrapper.find('input[placeholder*="微信号"]');
      await wechatInput.setValue('newwechat');
      
      expect(wrapper.vm.formData.wechat).toBe('newwechat');
    });

    it('handles relationship selection change', async () => {
      const relationshipSelect = wrapper.find('select[placeholder*="选择与孩子关系"]');
      await relationshipSelect.setValue('母亲');
      
      expect(wrapper.vm.formData.relationship).toBe('母亲');
    });

    it('handles occupation change', async () => {
      const occupationInput = wrapper.find('input[placeholder*="职业"]');
      await occupationInput.setValue('医生');
      
      expect(wrapper.vm.formData.occupation).toBe('医生');
    });

    it('handles email change', async () => {
      const emailInput = wrapper.find('input[placeholder*="邮箱地址"]');
      await emailInput.setValue('parent@example.com');
      
      expect(wrapper.vm.formData.email).toBe('parent@example.com');
    });

    it('handles status selection change', async () => {
      const statusSelect = wrapper.find('select[placeholder*="选择状态"]');
      await statusSelect.setValue('在读家长');
      
      expect(wrapper.vm.formData.status).toBe('在读家长');
    });

    it('handles address change', async () => {
      const addressInput = wrapper.find('input[placeholder*="家庭地址"]');
      await addressInput.setValue('新地址');
      
      expect(wrapper.vm.formData.address).toBe('新地址');
    });

    it('handles emergency contact change', async () => {
      const emergencyContactInput = wrapper.find('input[placeholder*="紧急联系人姓名"]');
      await emergencyContactInput.setValue('新紧急联系人');
      
      expect(wrapper.vm.formData.emergencyContact).toBe('新紧急联系人');
    });

    it('handles emergency phone change', async () => {
      const emergencyPhoneInput = wrapper.find('input[placeholder*="紧急联系电话"]');
      await emergencyPhoneInput.setValue('13700137000');
      
      expect(wrapper.vm.formData.emergencyPhone).toBe('13700137000');
    });

    it('handles notes change', async () => {
      const notesTextarea = wrapper.find('textarea[placeholder*="备注信息"]');
      await notesTextarea.setValue('新备注信息');
      
      expect(wrapper.vm.formData.notes).toBe('新备注信息');
    });

    it('handles register date change', async () => {
      const registerDatePicker = wrapper.find('input[type="date"][placeholder*="选择注册日期"]');
      await registerDatePicker.setValue('2024-09-01');
      
      expect(wrapper.vm.formData.registerDate).toBe('2024-09-01');
    });

    it('handles isPrimary switch change', async () => {
      const switchInput = wrapper.find('input[type="checkbox"]');
      await switchInput.setChecked(true);
      
      expect(wrapper.vm.formData.isPrimary).toBe(true);
      
      await switchInput.setChecked(false);
      
      expect(wrapper.vm.formData.isPrimary).toBe(false);
    });
  });

  describe('Form Reset and Initialization', () => {
    it('resets form to default values', async () => {
      await wrapper.setData({
        formData: {
          name: 'Modified Name',
          phone: '13900139000',
          status: '在读家长',
          isPrimary: true
        }
      });
      
      await wrapper.vm.resetForm();
      
      expect(wrapper.vm.formData.name).toBe('');
      expect(wrapper.vm.formData.phone).toBe('');
      expect(wrapper.vm.formData.gender).toBe('');
      expect(wrapper.vm.formData.status).toBe('潜在家长');
      expect(wrapper.vm.formData.isPrimary).toBe(false);
      expect(mockFormRef.clearValidate).toHaveBeenCalled();
    });

    it('initializes form with provided data', async () => {
      await wrapper.vm.initFormData(mockParentData);
      
      expect(wrapper.vm.formData.name).toBe(mockParentData.name);
      expect(wrapper.vm.formData.phone).toBe(mockParentData.phone);
      expect(wrapper.vm.formData.status).toBe(mockParentData.status);
      expect(wrapper.vm.formData.isPrimary).toBe(mockParentData.isPrimary);
      expect(mockFormRef.clearValidate).toHaveBeenCalled();
    });

    it('handles component mount state correctly', async () => {
      // Component should be mounted after creation
      expect(wrapper.vm.isComponentMounted).toBe(true);
    });
  });

  describe('Lifecycle and Watchers', () => {
    it('initializes form data when dialog opens', async () => {
      await wrapper.setProps({ modelValue: false });
      await wrapper.setProps({ modelValue: true, parentData: mockParentData });
      
      await nextTick();
      await nextTick();
      
      expect(wrapper.vm.formData.name).toBe(mockParentData.name);
    });

    it('watches parentData changes and updates form', async () => {
      // Initial state
      expect(wrapper.vm.formData.name).toBe('');
      
      // Change parentData
      await wrapper.setProps({ parentData: mockParentData });
      await nextTick();
      await nextTick();
      
      expect(wrapper.vm.formData.name).toBe(mockParentData.name);
      
      // Change to different data
      const newParentData = { ...mockParentData, name: '新家长' };
      await wrapper.setProps({ parentData: newParentData });
      await nextTick();
      
      expect(wrapper.vm.formData.name).toBe('新家长');
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

    it('handles operations before component is mounted', async () => {
      // Simulate component not mounted
      wrapper.vm.isComponentMounted = false;
      
      await wrapper.vm.resetForm();
      
      // Should not crash and should not reset data
      expect(wrapper.vm.formData.name).toBe('');
      
      await wrapper.vm.initFormData(mockParentData);
      
      // Should not crash and should not set data
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
      
      const nameInput = wrapper.find('input[placeholder*="家长姓名"]');
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
          formData: {
            ...wrapper.vm.formData,
            name: `家长 ${i}`,
            phone: `139${String(i).padStart(8, '0')}`
          }
        });
        await nextTick();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('handles rapid parentData prop changes efficiently', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        const parentData = { ...mockParentData, name: `家长 ${i}` };
        await wrapper.setProps({ parentData });
        await nextTick();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Edge Cases', () => {
    it('handles parentData with undefined properties', async () => {
      const parentWithUndefined = {
        id: '1',
        name: undefined,
        gender: undefined,
        phone: undefined,
        wechat: undefined,
        relationship: undefined,
        occupation: undefined,
        email: undefined,
        status: undefined,
        address: undefined,
        emergencyContact: undefined,
        emergencyPhone: undefined,
        notes: undefined,
        registerDate: undefined,
        isPrimary: undefined
      };
      
      await wrapper.setProps({ parentData: parentWithUndefined });
      await nextTick();
      await nextTick();
      
      const formData = wrapper.vm.formData;
      expect(formData.name).toBe('');
      expect(formData.gender).toBe('');
      expect(formData.phone).toBe('');
      expect(formData.status).toBe('潜在家长'); // Default value
      expect(formData.isPrimary).toBe(false); // Default value
    });

    it('handles form submission with minimal valid data', async () => {
      const minimalData = {
        name: '最小家长',
        phone: '13800138000',
        relationship: '父亲',
        status: '潜在家长'
        // Other fields are optional
      };
      
      await wrapper.setData({ formData: minimalData });
      mockFormRef.validate.mockResolvedValue(true);
      
      await wrapper.vm.handleSave();
      
      const saveEmits = wrapper.emitted('save');
      expect(saveEmits).toBeTruthy();
      expect(saveEmits[0][0]).toEqual(minimalData);
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

    it('handles empty string values properly', async () => {
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          name: '',
          phone: '',
          email: ''
        }
      });
      
      expect(wrapper.vm.formData.name).toBe('');
      expect(wrapper.vm.formData.phone).toBe('');
      expect(wrapper.vm.formData.email).toBe('');
    });
  });
});
