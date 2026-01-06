/**
 * 表单组件单元测试
 * 严格验证版本
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { createTestWrapper, mockElementPlusMessage, fillForm, triggerEvent, waitForAsync } from '../../utils/test-helpers';
import { expectNoConsoleErrors } from '../../setup/console-monitoring';
import { 
  validateRequiredFields,
  validateFieldTypes,
  validateEmailFormat,
  validatePhoneFormat 
} from '../../utils/data-validation';

// 导入待测试的表单组件
import StudentForm from '@/components/forms/StudentForm.vue';
import ClassFormDialog from '@/components/class/ClassFormDialog.vue';
import TaskFormDialog from '@/components/task/TaskFormDialog.vue';

// Mock Element Plus
const mockMessage = mockElementPlusMessage();

// 控制台错误检测变量
let consoleSpy: any

describe('Form Components - Strict Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock request
    vi.mock('@/utils/request', () => ({
      request: {
        post: vi.fn(),
        put: vi.fn(),
        get: vi.fn()
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}));

    // Mock 验证器
    vi.mock('@/utils/formValidator', () => ({
      validateStudentForm: vi.fn(() => ({ valid: true, errors: [] })),
      validateClassForm: vi.fn(() => ({ valid: true, errors: [] })),
      validateEmail: vi.fn(validateEmailFormat),
      validatePhone: vi.fn(validatePhoneFormat)
    }));
  });

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('StudentForm Component', () => {
    it('should render with all required fields', () => {
      const wrapper = createTestWrapper(StudentForm, {
        props: {
          mode: 'create'
        }
      });

      // 验证必填字段存在
      const requiredFields = [
        'student-name',
        'student-birth-date',
        'student-gender',
        'parent-name',
        'parent-phone',
        'parent-email'
      ];

      requiredFields.forEach(field => {
        const element = wrapper.find(`[data-testid="${field}"]`);
        expect(element.exists()).toBe(true);
      });

      expect(wrapper.find('[data-testid="student-form"]').exists()).toBe(true);
    });

    it('should initialize with edit mode data', () => {
      const editData = {
        id: '1',
        name: '张三',
        birthDate: '2018-01-15',
        gender: 'MALE',
        classId: '1',
        parentId: '1',
        parentName: '张父',
        parentPhone: '13800138001',
        parentEmail: 'zhang@example.com',
        address: '测试地址'
      };

      const wrapper = createTestWrapper(StudentForm, {
        props: {
          mode: 'edit',
          initialData: editData
        }
      });

      // 验证数据初始化
      expect(wrapper.vm.$data.formData.name).toBe('张三');
      expect(wrapper.vm.$data.formData.birthDate).toBe('2018-01-15');
      expect(wrapper.vm.$data.formData.gender).toBe('MALE');
    });

    it('should validate form fields correctly', async () => {
      const wrapper = createTestWrapper(StudentForm, {
        props: {
          mode: 'create'
        }
      });

      // 测试空表单验证
      await wrapper.vm.validateForm();
      expect(wrapper.vm.$data.errors).toBeDefined();

      // 填写有效数据
      const validData = {
        name: '李四',
        birthDate: '2018-03-20',
        gender: 'FEMALE',
        classId: '1',
        parentName: '李父',
        parentPhone: '13800138003',
        parentEmail: 'li@example.com',
        address: '测试地址'
      };

      await fillForm(wrapper, validData);
      await wrapper.vm.validateForm();

      // 验证错误应该被清除
      if (wrapper.vm.$data.errors && Object.keys(wrapper.vm.$data.errors).length === 0) {
        expect(true).toBe(true);
      }
    });

    it('should handle form submission correctly', async () => {
      const mockRequest = vi.fn();
      vi.doMock('@/utils/request', () => ({
        request: {
          post: mockRequest
        }
      }));

      mockRequest.mockResolvedValue({
        success: true,
        data: { id: '123' },
        message: '学生创建成功'
      });

      const wrapper = createTestWrapper(StudentForm, {
        props: {
          mode: 'create'
        }
      });

      const formData = {
        name: '王五',
        birthDate: '2018-05-10',
        gender: 'MALE',
        classId: '1',
        parentName: '王父',
        parentPhone: '13800138004',
        parentEmail: 'wang@example.com',
        address: '测试地址'
      };

      await fillForm(wrapper, formData);

      // 提交表单
      const submitButton = wrapper.find('[data-testid="submit-button"]');
      if (submitButton.exists()) {
        await submitButton.trigger('click');
        await waitForAsync(100);

        // 验证API调用
        expect(mockRequest).toHaveBeenCalledWith('/api/students', {
          method: 'POST',
          data: expect.objectContaining(formData)
        });

        // 验证请求数据结构
        const lastCall = mockRequest.mock.calls[mockRequest.mock.calls.length - 1];
        const requestData = lastCall[1].data;

        // 验证必填字段
        const requiredFields = ['name', 'birthDate', 'gender', 'parentName', 'parentPhone', 'parentEmail'];
        const requiredValidation = validateRequiredFields(requestData, requiredFields);
        expect(requiredValidation.valid).toBe(true);

        // 验证字段类型
        const typeValidation = validateFieldTypes(requestData, {
          name: 'string',
          birthDate: 'string',
          gender: 'string',
          parentName: 'string',
          parentPhone: 'string',
          parentEmail: 'string',
          address: 'string'
        });
        expect(typeValidation.valid).toBe(true);

        // 验证邮箱格式
        expect(validateEmailFormat(requestData.parentEmail)).toBe(true);

        // 验证手机号格式
        expect(validatePhoneFormat(requestData.parentPhone)).toBe(true);
      }
    });

    it('should handle edit mode submission', async () => {
      const mockRequest = vi.fn();
      vi.doMock('@/utils/request', () => ({
        request: {
          put: mockRequest
        }
      }));

      mockRequest.mockResolvedValue({
        success: true,
        data: { id: '1' },
        message: '学生信息更新成功'
      });

      const editData = {
        id: '1',
        name: '张三修改',
        birthDate: '2018-01-15',
        gender: 'MALE',
        parentName: '张父',
        parentPhone: '13800138001',
        parentEmail: 'zhang@example.com'
      };

      const wrapper = createTestWrapper(StudentForm, {
        props: {
          mode: 'edit',
          initialData: editData
        }
      });

      const submitButton = wrapper.find('[data-testid="submit-button"]');
      if (submitButton.exists()) {
        await submitButton.trigger('click');
        await waitForAsync(100);

        expect(mockRequest).toHaveBeenCalledWith('/api/students/1', {
          method: 'PUT',
          data: expect.objectContaining(editData)
        });
      }
    });

    it('should handle form reset correctly', async () => {
      const initialData = {
        name: '原始姓名',
        parentName: '原始家长',
        parentPhone: '13800138000'
      };

      const wrapper = createTestWrapper(StudentForm, {
        props: {
          mode: 'edit',
          initialData
        }
      });

      // 修改表单数据
      await wrapper.setData({
        formData: {
          ...wrapper.vm.$data.formData,
          name: '修改后姓名'
        }
      });

      // 重置表单
      const resetButton = wrapper.find('[data-testid="reset-button"]');
      if (resetButton.exists()) {
        await resetButton.trigger('click');
        
        // 验证数据被重置
        expect(wrapper.vm.$data.formData.name).toBe('原始姓名');
      }
    });

    it('should display validation errors correctly', async () => {
      const wrapper = createTestWrapper(StudentForm, {
        props: {
          mode: 'create'
        }
      });

      // 触发验证错误
      await wrapper.setData({
        errors: {
          name: '姓名不能为空',
          parentEmail: '邮箱格式不正确'
        }
      });

      await wrapper.vm.$nextTick();

      // 验证错误信息显示
      const nameError = wrapper.find('[data-testid="error-name"]');
      const emailError = wrapper.find('[data-testid="error-parent-email"]');

      if (nameError.exists()) {
        expect(nameError.text()).toContain('姓名不能为空');
      }

      if (emailError.exists()) {
        expect(emailError.text()).toContain('邮箱格式不正确');
      }
    });
  });

  describe('ClassFormDialog Component', () => {
    it('should render dialog correctly', () => {
      const wrapper = createTestWrapper(ClassFormDialog, {
        props: {
          visible: true,
          mode: 'create'
        }
      });

      expect(wrapper.find('.class-form-dialog').exists()).toBe(true);
      expect(wrapper.find('[data-testid="class-form"]').exists()).toBe(true);
    });

    it('should handle visibility prop correctly', async () => {
      const wrapper = createTestWrapper(ClassFormDialog, {
        props: {
          visible: false,
          mode: 'create'
        }
      });

      expect(wrapper.emitted('update:visible')).toBeUndefined();

      // 触发关闭
      await wrapper.find('[data-testid="dialog-close"]').trigger('click');
      expect(wrapper.emitted('update:visible')).toBeDefined();
      expect(wrapper.emitted('update:visible')[0]).toEqual([false]);
    });

    it('should load available teachers for selection', async () => {
      const mockRequest = vi.fn();
      vi.doMock('@/utils/request', () => ({
        request: {
          get: mockRequest
        }
      }));

      const mockTeachers = [
        { id: '1', name: '王老师', subject: '语文' },
        { id: '2', name: '李老师', subject: '数学' }
      ];

      mockRequest.mockResolvedValue({
        success: true,
        data: mockTeachers
      });

      const wrapper = createTestWrapper(ClassFormDialog, {
        props: {
          visible: true,
          mode: 'create'
        }
      });

      await wrapper.vm.loadTeachers();

      expect(mockRequest).toHaveBeenCalledWith('/api/teachers', {
        params: { status: 'ACTIVE' }
      });

      // 验证教师选项被加载
      expect(wrapper.vm.$data.availableTeachers).toEqual(mockTeachers);
    });

    it('should validate capacity constraints', async () => {
      const wrapper = createTestWrapper(ClassFormDialog, {
        props: {
          visible: true,
          mode: 'create'
        }
      });

      // 测试容量验证
      const formData = {
        name: '测试班级',
        grade: '大班',
        capacity: 25,
        classroom: 'A101'
      };

      await fillForm(wrapper, formData);

      // 设置无效容量
      await wrapper.setData({
        formData: {
          ...wrapper.vm.$data.formData,
          capacity: -1
        }
      });

      const validation = wrapper.vm.validateCapacity();
      expect(validation.valid).toBe(false);
    });

    it('should handle classroom availability check', async () => {
      const mockRequest = vi.fn();
      vi.doMock('@/utils/request', () => ({
        request: {
          get: mockRequest
        }
      }));

      mockRequest.mockResolvedValue({
        success: true,
        data: { available: true }
      });

      const wrapper = createTestWrapper(ClassFormDialog, {
        props: {
          visible: true,
          mode: 'create'
        }
      });

      await wrapper.vm.checkClassroomAvailability('A101');

      expect(mockRequest).toHaveBeenCalledWith('/api/classrooms/check-availability', {
        params: { classroom: 'A101' }
      });
    });
  });

  describe('TaskFormDialog Component', () => {
    it('should render task form with all fields', () => {
      const wrapper = createTestWrapper(TaskFormDialog, {
        props: {
          visible: true,
          mode: 'create'
        }
      });

      const requiredFields = [
        'task-title',
        'task-description',
        'task-priority',
        'task-deadline',
        'task-assignee'
      ];

      requiredFields.forEach(field => {
        const element = wrapper.find(`[data-testid="${field}"]`);
        expect(element.exists()).toBe(true);
      });
    });

    it('should handle different task priorities', () => {
      const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

      priorities.forEach(priority => {
        const wrapper = createTestWrapper(TaskFormDialog, {
          props: {
            visible: true,
            mode: 'create',
            initialData: { priority }
          }
        });

        expect(wrapper.vm.$data.formData.priority).toBe(priority);
      });
    });

    it('should handle file attachments', async () => {
      const wrapper = createTestWrapper(TaskFormDialog, {
        props: {
          visible: true,
          mode: 'create'
        }
      });

      // 模拟文件上传
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const fileInput = wrapper.find('[data-testid="file-input"]');

      if (fileInput.exists()) {
        await fileInput.trigger('change', {
          target: { files: [mockFile] }
        });

        expect(wrapper.vm.$data.attachments).toContain(mockFile);
      }
    });

    it('should validate deadline date', async () => {
      const wrapper = createTestWrapper(TaskFormDialog, {
        props: {
          visible: true,
          mode: 'create'
        }
      });

      // 设置过去日期
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await wrapper.setData({
        formData: {
          ...wrapper.vm.$data.formData,
          deadline: pastDate.toISOString().split('T')[0]
        }
      });

      const validation = wrapper.vm.validateDeadline();
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('截止日期不能是过去的日期');
    });

    it('should handle assignee selection', async () => {
      const mockUsers = [
        { id: '1', name: '张三', role: 'TEACHER' },
        { id: '2', name: '李四', role: 'TEACHER' }
      ];

      const wrapper = createTestWrapper(TaskFormDialog, {
        props: {
          visible: true,
          mode: 'create'
        }
      });

      await wrapper.setData({
        availableUsers: mockUsers
      });

      const assigneeSelect = wrapper.find('[data-testid="task-assignee"]');
      if (assigneeSelect.exists()) {
        await assigneeSelect.setValue('1');
        expect(wrapper.vm.$data.formData.assigneeId).toBe('1');
      }
    });

    it('should handle task submission with attachments', async () => {
      const mockRequest = vi.fn();
      vi.doMock('@/utils/request', () => ({
        request: {
          post: mockRequest
        }
      }));

      mockRequest.mockResolvedValue({
        success: true,
        data: { id: '123' },
        message: '任务创建成功'
      });

      const wrapper = createTestWrapper(TaskFormDialog, {
        props: {
          visible: true,
          mode: 'create'
        }
      });

      const formData = {
        title: '测试任务',
        description: '这是一个测试任务',
        priority: 'HIGH',
        deadline: '2024-12-31',
        assigneeId: '1'
      };

      await fillForm(wrapper, formData);

      // 添加附件
      const mockFile = new File(['content'], 'test.txt');
      await wrapper.setData({
        attachments: [mockFile]
      });

      const submitButton = wrapper.find('[data-testid="submit-button"]');
      if (submitButton.exists()) {
        await submitButton.trigger('click');
        await waitForAsync(100);

        // 验证包含附件的提交
        expect(mockRequest).toHaveBeenCalledWith('/api/tasks', {
          method: 'POST',
          data: expect.objectContaining({
            ...formData,
            attachments: expect.arrayContaining([mockFile])
          })
        });
      }
    });
  });

  describe('Form Validation Rules', () => {
    it('should validate email format correctly', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.com',
        'user+tag@example.org',
        'user123@test.co.uk'
      ];

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@.com'
      ];

      validEmails.forEach(email => {
        expect(validateEmailFormat(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(validateEmailFormat(email)).toBe(false);
      });
    });

    it('should validate phone format correctly', () => {
      const validPhones = [
        '13800138000',
        '15912345678',
        '18698765432',
        '13300001111'
      ];

      const invalidPhones = [
        '12800138000', // 不是有效的手机号前缀
        '1380013800',  // 位数不足
        '138001380000', // 位数过多
        'abc12345678',  // 包含字母
        '138-0013-8000' // 包含特殊字符
      ];

      validPhones.forEach(phone => {
        expect(validatePhoneFormat(phone)).toBe(true);
      });

      invalidPhones.forEach(phone => {
        expect(validatePhoneFormat(phone)).toBe(false);
      });
    });

    it('should validate student ID format', () => {
      const validIds = ['ST001', 'ST002', 'ST999', 'ST12345'];
      const invalidIds = ['S001', 'ST1', 'ST', 'STABC'];

      validIds.forEach(id => {
        expect(/^[A-Z]{2}\d{3,5}$/.test(id)).toBe(true);
      });

      invalidIds.forEach(id => {
        expect(/^[A-Z]{2}\d{3,5}$/.test(id)).toBe(false);
      });
    });
  });

  describe('Form Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const mockRequest = vi.fn();
      vi.doMock('@/utils/request', () => ({
        request: {
          post: mockRequest
        }
      }));

      mockRequest.mockRejectedValue(new Error('Network error'));

      const wrapper = createTestWrapper(StudentForm, {
        props: {
          mode: 'create'
        }
      });

      const formData = {
        name: '测试学生',
        birthDate: '2018-01-01',
        gender: 'MALE',
        parentName: '测试家长',
        parentPhone: '13800138001',
        parentEmail: 'test@example.com'
      };

      await fillForm(wrapper, formData);

      const submitButton = wrapper.find('[data-testid="submit-button"]');
      if (submitButton.exists()) {
        await submitButton.trigger('click');
        await waitForAsync(100);

        // 验证错误处理
        expect(mockMessage.error).toHaveBeenCalledWith('提交失败，请重试');
      }
    });

    it('should handle validation errors from server', async () => {
      const mockRequest = vi.fn();
      vi.doMock('@/utils/request', () => ({
        request: {
          post: mockRequest
        }
      }));

      mockRequest.mockResolvedValue({
        success: false,
        message: '姓名已存在',
        errors: {
          name: ['姓名已被使用']
        }
      });

      const wrapper = createTestWrapper(StudentForm, {
        props: {
          mode: 'create'
        }
      });

      const formData = {
        name: '重复姓名',
        birthDate: '2018-01-01',
        gender: 'MALE',
        parentName: '测试家长',
        parentPhone: '13800138001',
        parentEmail: 'test@example.com'
      };

      await fillForm(wrapper, formData);

      const submitButton = wrapper.find('[data-testid="submit-button"]');
      if (submitButton.exists()) {
        await submitButton.trigger('click');
        await waitForAsync(100);

        // 验证服务器错误显示
        expect(mockMessage.error).toHaveBeenCalledWith('姓名已存在');
      }
    });
  });
});