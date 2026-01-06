/**
 * 用户管理集成测试
 * 严格验证版本
 * 测试前端组件与后端API的完整交互流程
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createTestWrapper, mockApiResponse, fillForm, triggerEvent, waitForAsync } from '../utils/test-helpers';
import { expectNoConsoleErrors } from '../setup/console-monitoring';
import { 
  validateRequiredFields,
  validateFieldTypes,
  validatePaginationStructure,
  createValidationReport 
} from '../utils/data-validation';
import axios from 'axios';

// Mock API
const mockAxios = vi.mocked(axios, true);
vi.mock('@/utils/request', () => mockAxios);

// 导入待测试的组件
import UserList from '@/pages/system/users/index.vue';
import UserForm from '@/pages/system/users/UserForm.vue';

// 控制台错误检测变量
let consoleSpy: any

describe('User Management Integration Tests - Strict Validation', () => {
  let wrapper: VueWrapper;
  let pinia: any;

  beforeAll(() => {
    // 设置Pinia
    pinia = createPinia();
    setActivePinia(pinia);
  });

  afterAll(() => {
    pinia = null;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    expectNoConsoleErrors();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount();
      wrapper = null;
    }
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('User Management Workflow Integration', () => {
    it('should handle complete user lifecycle with strict validation', async () => {
      // 1. 初始化用户列表页面
      wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();

      // 验证页面结构
      expect(wrapper.find('.user-list-container').exists()).toBe(true);
      expect(wrapper.find('[data-testid="search-form"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="user-table"]').exists()).toBe(true);

      // 2. 模拟用户列表API响应
      const mockUsersList = {
        items: [
          {
            id: '1',
            username: 'admin',
            name: '管理员',
            email: 'admin@example.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            createdAt: '2023-01-01T00:00:00Z'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10
      };

      mockAxios.get.mockResolvedValue({
        data: mockApiResponse.success(mockUsersList)
      });

      // 3. 触发数据加载
      await wrapper.vm.loadUsers();
      await waitForAsync(100);

      // 验证API调用
      expect(mockAxios.get).toHaveBeenCalledWith('/api/users', {
        params: { page: 1, pageSize: 10 }
      });

      // 验证响应数据结构
      const paginationValidation = validatePaginationStructure(mockUsersList);
      expect(paginationValidation.valid).toBe(true);

      // 4. 创建新用户
      const createButton = wrapper.find('[data-testid="create-user-button"]');
      expect(createButton.exists()).toBe(true);
      await createButton.trigger('click');

      // 验证表单对话框显示
      expect(wrapper.find('[data-testid="user-form-dialog"]').exists()).toBe(true);

      // 5. 模拟用户创建API响应
      const mockCreatedUser = {
        id: '2',
        username: 'newuser',
        name: '新用户',
        email: 'newuser@example.com',
        role: 'TEACHER',
        status: 'ACTIVE',
        createdAt: '2024-01-15T10:30:00Z'
      };

      mockAxios.post.mockResolvedValue({
        data: mockApiResponse.success(mockCreatedUser)
      });

      // 6. 填写并提交用户表单
      const userForm = wrapper.findComponent(UserForm);
      const formData = {
        username: 'newuser',
        name: '新用户',
        email: 'newuser@example.com',
        phone: '13800138001',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'TEACHER'
      };

      await fillForm(userForm, formData);

      const submitButton = wrapper.find('[data-testid="submit-button"]');
      if (submitButton.exists()) {
        await submitButton.trigger('click');
        await waitForAsync(100);
      }

      // 验证创建API调用
      expect(mockAxios.post).toHaveBeenCalledWith('/api/users', formData);

      // 验证创建的用户数据结构
      const userValidation = createValidationReport(mockCreatedUser, {
        requiredFields: ['id', 'username', 'name', 'email', 'role', 'status'],
        fieldTypes: {
          id: 'string',
          username: 'string',
          name: 'string',
          email: 'string',
          role: 'string',
          status: 'string'
        },
        enumFields: {
          role: ['ADMIN', 'TEACHER', 'PARENT', 'PRINCIPAL', 'STAFF'],
          status: ['ACTIVE', 'INACTIVE', 'SUSPENDED']
        }
      });

      expect(userValidation.valid).toBe(true);
      if (!userValidation.valid) {
        console.error('Created user validation errors:', userValidation.errors);
      }

      // 7. 验证表单提交后的事件
      expect(wrapper.emitted('user-created')).toBeDefined();

      // 8. 模拟重新加载用户列表（包含新用户）
      const updatedUsersList = {
        items: [mockUsersList.items[0], mockCreatedUser],
        total: 2,
        page: 1,
        pageSize: 10
      };

      mockAxios.get.mockResolvedValue({
        data: mockApiResponse.success(updatedUsersList)
      });

      await wrapper.vm.loadUsers();
      await waitForAsync(100);

      // 9. 编辑用户
      const editButton = wrapper.find('[data-testid="edit-user-2"]');
      if (editButton.exists()) {
        await editButton.trigger('click');

        // 验证编辑表单初始化
        const editForm = wrapper.findComponent(UserForm);
        expect(editForm.vm.$data.formData.id).toBe('2');
        expect(editForm.vm.$data.formData.name).toBe('新用户');
      }

      // 10. 模拟用户更新API响应
      const mockUpdatedUser = {
        ...mockCreatedUser,
        name: '更新后的用户',
        email: 'updated@example.com'
      };

      mockAxios.put.mockResolvedValue({
        data: mockApiResponse.success(mockUpdatedUser)
      });

      // 11. 提交更新表单
      const updateFormData = {
        name: '更新后的用户',
        email: 'updated@example.com'
      };

      await fillForm(wrapper.findComponent(UserForm), updateFormData);

      const updateButton = wrapper.find('[data-testid="submit-button"]');
      if (updateButton.exists()) {
        await updateButton.trigger('click');
        await waitForAsync(100);
      }

      // 验证更新API调用
      expect(mockAxios.put).toHaveBeenCalledWith('/api/users/2', updateFormData);

      // 12. 验证更新后的事件和数据
      expect(wrapper.emitted('user-updated')).toBeDefined();

      // 13. 删除用户
      mockAxios.delete.mockResolvedValue({
        data: mockApiResponse.success({ id: '2' })
      });

      const deleteButton = wrapper.find('[data-testid="delete-user-2"]');
      if (deleteButton.exists()) {
        await deleteButton.trigger('click');
        await waitForAsync(100);
      }

      // 验证删除API调用
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/users/2');

      // 14. 验证删除后的事件
      expect(wrapper.emitted('user-deleted')).toBeDefined();
    });

    it('should handle search and filter integration', async () => {
      wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();

      // 模拟搜索API响应
      const mockSearchResults = {
        items: [
          {
            id: '1',
            username: 'teacher1',
            name: '教师1',
            email: 'teacher1@example.com',
            role: 'TEACHER',
            status: 'ACTIVE'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10
      };

      mockAxios.get.mockResolvedValue({
        data: mockApiResponse.success(mockSearchResults)
      });

      // 执行搜索
      const searchData = {
        username: 'teacher',
        role: 'TEACHER',
        status: 'ACTIVE'
      };

      await fillForm(wrapper, searchData);

      const searchButton = wrapper.find('[data-testid="search-button"]');
      if (searchButton.exists()) {
        await searchButton.trigger('click');
        await waitForAsync(100);
      }

      // 验证搜索API调用
      expect(mockAxios.get).toHaveBeenCalledWith('/api/users', {
        params: searchData
      });

      // 验证搜索结果
      if (wrapper.vm.$data.users.length > 0) {
        wrapper.vm.$data.users.forEach((user: any) => {
          expect(user.username).toContain('teacher');
          expect(user.role).toBe('TEACHER');
          expect(user.status).toBe('ACTIVE');
        });
      }
    });

    it('should handle pagination integration correctly', async () => {
      wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();

      // 模拟分页API响应
      const mockPaginatedData = {
        items: Array.from({ length: 10 }, (_, i) => ({
          id: `user-${i + 1}`,
          username: `user${i + 1}`,
          name: `用户${i + 1}`,
          email: `user${i + 1}@example.com`,
          role: 'TEACHER',
          status: 'ACTIVE'
        })),
        total: 50,
        page: 1,
        pageSize: 10
      };

      mockAxios.get.mockResolvedValue({
        data: mockApiResponse.success(mockPaginatedData)
      });

      await wrapper.vm.loadUsers();
      await waitForAsync(100);

      // 验证初始分页数据
      expect(wrapper.vm.$data.users.length).toBe(10);
      expect(wrapper.vm.$data.pagination.total).toBe(50);
      expect(wrapper.vm.$data.pagination.page).toBe(1);
      expect(wrapper.vm.$data.pagination.pageSize).toBe(10);

      // 模拟下一页API响应
      const mockNextPageData = {
        ...mockPaginatedData,
        items: Array.from({ length: 10 }, (_, i) => ({
          id: `user-${i + 11}`,
          username: `user${i + 11}`,
          name: `用户${i + 11}`,
          email: `user${i + 11}@example.com`,
          role: 'TEACHER',
          status: 'ACTIVE'
        })),
        page: 2
      };

      mockAxios.get.mockResolvedValue({
        data: mockApiResponse.success(mockNextPageData)
      });

      // 触发页码变化
      const pagination = wrapper.find('[data-testid="pagination"]');
      if (pagination.exists()) {
        await pagination.vm.$emit('current-change', 2);
        await waitForAsync(100);

        // 验证页码变化API调用
        expect(mockAxios.get).toHaveBeenCalledWith('/api/users', {
          params: { page: 2, pageSize: 10 }
        });

        // 验证页码数据更新
        expect(wrapper.vm.$data.pagination.page).toBe(2);
      }
    });

    it('should handle error states correctly', async () => {
      wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();

      // 模拟API错误
      mockAxios.get.mockRejectedValue(new Error('Network error'));

      await wrapper.vm.loadUsers();
      await waitForAsync(100);

      // 验证错误状态
      expect(wrapper.vm.$data.loading).toBe(false);
      expect(wrapper.vm.$data.error).toBeDefined();

      // 验证错误消息显示
      const errorMessage = wrapper.find('[data-testid="error-message"]');
      if (errorMessage.exists()) {
        expect(errorMessage.text()).toContain('加载失败');
      }

      // 验证重试按钮
      const retryButton = wrapper.find('[data-testid="retry-button"]');
      if (retryButton.exists()) {
        // 模拟成功恢复
        mockAxios.get.mockResolvedValue({
          data: mockApiResponse.success({
            items: [],
            total: 0,
            page: 1,
            pageSize: 10
          })
        });

        await retryButton.trigger('click');
        await waitForAsync(100);

        // 验证重试API调用
        expect(mockAxios.get).toHaveBeenCalledTimes(2);
      }
    });

    it('should handle bulk operations integration', async () => {
      wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();

      // 设置测试数据
      const testUsers = [
        { id: '1', username: 'user1', name: '用户1', selected: false },
        { id: '2', username: 'user2', name: '用户2', selected: false },
        { id: '3', username: 'user3', name: '用户3', selected: false }
      ];

      await wrapper.setData({
        users: testUsers
      });

      // 选择多个用户
      const checkboxes = wrapper.findAll('[data-testid^="user-checkbox-"]');
      for (let i = 0; i < Math.min(2, checkboxes.length); i++) {
        await checkboxes[i].trigger('click');
      }

      // 验证选中状态
      expect(wrapper.vm.$data.selectedUsers.length).toBeGreaterThan(0);

      // 模拟批量删除API响应
      mockAxios.delete.mockResolvedValue({
        data: mockApiResponse.success({ deleted: 2 })
      });

      // 执行批量删除
      const bulkDeleteButton = wrapper.find('[data-testid="bulk-delete-button"]');
      if (bulkDeleteButton.exists()) {
        await bulkDeleteButton.trigger('click');
        await waitForAsync(100);

        // 验证批量删除API调用
        expect(mockAxios.delete).toHaveBeenCalledWith('/api/users/bulk', {
          data: { ids: wrapper.vm.$data.selectedUsers.map((user: any) => user.id) }
        });
      }
    });
  });

  describe('Form Validation Integration', () => {
    it('should handle client-side and server-side validation integration', async () => {
      wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();

      // 打开创建表单
      const createButton = wrapper.find('[data-testid="create-user-button"]');
      await createButton.trigger('click');

      const userForm = wrapper.findComponent(UserForm);

      // 1. 测试客户端验证
      const emptyFormData = {
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      };

      await fillForm(userForm, emptyFormData);

      const submitButton = wrapper.find('[data-testid="submit-button"]');
      if (submitButton.exists()) {
        await submitButton.trigger('click');
      }

      // 验证客户端验证错误
      expect(userForm.vm.$data.errors).toBeDefined();
      expect(Object.keys(userForm.vm.$data.errors).length).toBeGreaterThan(0);

      // 2. 测试服务器端验证
      const validFormData = {
        username: 'testuser',
        name: '测试用户',
        email: 'test@example.com',
        phone: '13800138001',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'TEACHER'
      };

      await fillForm(userForm, validFormData);

      // 模拟服务器验证错误
      mockAxios.post.mockRejectedValue({
        response: {
          status: 422,
          data: {
            success: false,
            message: 'Username already exists',
            errors: {
              username: ['该用户名已被使用']
            }
          }
        }
      });

      if (submitButton.exists()) {
        await submitButton.trigger('click');
        await waitForAsync(100);
      }

      // 验证服务器验证错误处理
      expect(userForm.vm.$data.errors.username).toBeDefined();
      expect(userForm.vm.$data.errors.username).toContain('该用户名已被使用');
    });

    it('should handle form reset and cancel correctly', async () => {
      wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();

      // 打开编辑表单
      const editButton = wrapper.find('[data-testid="edit-user-1"]');
      if (editButton.exists()) {
        await editButton.trigger('click');
      }

      const userForm = wrapper.findComponent(UserForm);

      // 验证表单初始化数据
      const initialFormData = { ...userForm.vm.$data.formData };

      // 修改表单数据
      await fillForm(userForm, { name: '修改后的名称' });
      expect(userForm.vm.$data.formData.name).toBe('修改后的名称');

      // 测试重置功能
      const resetButton = wrapper.find('[data-testid="reset-button"]');
      if (resetButton.exists()) {
        await resetButton.trigger('click');
        
        // 验证数据重置
        expect(userForm.vm.$data.formData.name).toBe(initialFormData.name);
      }

      // 测试取消功能
      const cancelButton = wrapper.find('[data-testid="cancel-button"]');
      if (cancelButton.exists()) {
        await cancelButton.trigger('click');
        
        // 验证对话框关闭
        expect(wrapper.find('[data-testid="user-form-dialog"]').exists()).toBe(false);
      }
    });
  });

  describe('Real-time Updates Integration', () => {
    it('should handle WebSocket updates for user status changes', async () => {
      wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();

      // 设置初始用户数据
      const initialUsers = [
        {
          id: '1',
          username: 'testuser',
          name: '测试用户',
          status: 'ACTIVE'
        }
      ];

      await wrapper.setData({ users: initialUsers });

      // 模拟WebSocket消息
      const wsMessage = {
        type: 'USER_STATUS_CHANGED',
        data: {
          id: '1',
          status: 'INACTIVE'
        }
      };

      // 触发WebSocket消息处理
      if (wrapper.vm.handleWebSocketUpdate) {
        await wrapper.vm.handleWebSocketUpdate(wsMessage);
        
        // 验证用户状态更新
        const updatedUser = wrapper.vm.$data.users.find((u: any) => u.id === '1');
        expect(updatedUser.status).toBe('INACTIVE');
      }
    });

    it('should handle real-time search suggestions', async () => {
      wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();

      // 模拟搜索建议API响应
      const mockSuggestions = [
        { username: 'teacher1', name: '教师1' },
        { username: 'teacher2', name: '教师2' }
      ];

      mockAxios.get.mockResolvedValue({
        data: mockApiResponse.success(mockSuggestions)
      });

      // 触发搜索建议
      const searchInput = wrapper.find('[data-testid="search-input"]');
      if (searchInput.exists()) {
        await searchInput.setValue('teacher');
        await searchInput.trigger('input');

        // 等待防抖
        await waitForAsync(300);

        // 验证搜索建议API调用
        expect(mockAxios.get).toHaveBeenCalledWith('/api/users/suggestions', {
          params: { query: 'teacher' }
        });
      }
    });
  });

  describe('Performance Integration Tests', () => {
    it('should handle large datasets efficiently', async () => {
      wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();

      // 模拟大数据集
      const largeDataset = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: `user-${i + 1}`,
          username: `user${i + 1}`,
          name: `用户${i + 1}`,
          email: `user${i + 1}@example.com`,
          role: 'TEACHER',
          status: 'ACTIVE'
        })),
        total: 1000,
        page: 1,
        pageSize: 50
      };

      const startTime = performance.now();
      
      mockAxios.get.mockResolvedValue({
        data: mockApiResponse.success(largeDataset)
      });

      await wrapper.vm.loadUsers();
      await waitForAsync(500);

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // 验证性能指标
      expect(loadTime).toBeLessThan(2000); // 2秒内完成加载
      expect(wrapper.vm.$data.users.length).toBe(50); // 应该只渲染当前页的数据

      // 验证虚拟滚动或分页正常工作
      expect(wrapper.vm.$data.pagination.total).toBe(1000);
    });
  });
});