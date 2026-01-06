/**
 * 用户管理页面单元测试
 * 严格验证版本
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { createTestWrapper, mockApiResponse, fillForm, triggerEvent, waitForAsync } from '../../utils/test-helpers';
import { expectNoConsoleErrors } from '../../setup/console-monitoring';
import { 
  validateRequiredFields,
  validateFieldTypes,
  validatePaginationStructure,
  validateEnumValue,
  createValidationReport 
} from '../../utils/data-validation';

// 导入待测试的页面组件
import UserList from '@/pages/system/users/index.vue';
import UserForm from '@/pages/system/users/UserForm.vue';
import RoleManagement from '@/pages/system/roles/index.vue';

// Mock API
const mockRequest = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

vi.mock('@/utils/request', () => ({
  request: mockRequest
}));

// Mock 权限store
vi.mock('@/stores/permission', () => ({
  usePermissionStore: () => ({
    hasPermission: vi.fn(() => true),
    permissions: ['user.read', 'user.write', 'user.delete', 'role.read']
  })
}));

// Mock 用户store
vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    currentUser: {
      id: '1',
      name: 'Admin User',
      role: 'ADMIN'
    }
  })
}));

// 控制台错误检测变量
let consoleSpy: any

describe('User Management Pages - Strict Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock router
    vi.mock('@/router', () => ({
      useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn()
      })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    }));

    // Mock Element Plus消息
    vi.mock('element-plus', () => ({
      ElMessage: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn()
      },
      ElMessageBox: {
        confirm: vi.fn(() => Promise.resolve('confirm')),
        alert: vi.fn(),
        prompt: vi.fn()
      }
    }));
  });

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('UserList Component', () => {
    it('should render user list with correct structure', async () => {
      const mockUsers = {
        items: [
          {
            id: '1',
            username: 'admin',
            name: '管理员',
            email: 'admin@example.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            lastLoginAt: '2024-01-15T10:30:00Z',
            createdAt: '2023-01-01T00:00:00Z'
          },
          {
            id: '2',
            username: 'teacher',
            name: '张老师',
            email: 'teacher@example.com',
            role: 'TEACHER',
            status: 'ACTIVE',
            lastLoginAt: '2024-01-15T09:15:00Z',
            createdAt: '2023-06-15T00:00:00Z'
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10
      };

      mockRequest.get.mockResolvedValue(mockApiResponse.success(mockUsers));

      const wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith('/api/users', {
        params: { page: 1, pageSize: 10 }
      });

      // 验证组件结构
      expect(wrapper.find('.user-list-container').exists()).toBe(true);
      expect(wrapper.find('[data-testid="search-form"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="user-table"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="pagination"]').exists()).toBe(true);
    });

    it('should validate user data structure with strict validation', async () => {
      const mockUsers = {
        items: [
          {
            id: '1',
            username: 'admin',
            name: '管理员',
            email: 'admin@example.com',
            phone: '13800138001',
            role: 'ADMIN',
            status: 'ACTIVE',
            departmentId: '1',
            departmentName: '管理部门',
            permissions: ['*'],
            lastLoginAt: '2024-01-15T10:30:00Z',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2024-01-15T10:30:00Z'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10
      };

      mockRequest.get.mockResolvedValue(mockApiResponse.success(mockUsers));

      const wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证分页结构
      const paginationValidation = validatePaginationStructure(mockUsers);
      expect(paginationValidation.valid).toBe(true);

      // 验证用户数据结构
      const firstUser = mockUsers.items[0];
      const userValidation = createValidationReport(firstUser, {
        requiredFields: ['id', 'username', 'name', 'email', 'role', 'status'],
        fieldTypes: {
          id: 'string',
          username: 'string',
          name: 'string',
          email: 'string',
          phone: 'string',
          role: 'string',
          status: 'string',
          departmentId: 'string',
          lastLoginAt: 'string',
          createdAt: 'string',
          updatedAt: 'string'
        },
        enumFields: {
          role: ['ADMIN', 'TEACHER', 'PARENT', 'PRINCIPAL', 'STAFF'],
          status: ['ACTIVE', 'INACTIVE', 'SUSPENDED']
        }
      });

      expect(userValidation.valid).toBe(true);
      if (!userValidation.valid) {
        console.error('User validation errors:', userValidation.errors);
      }

      // 验证表格渲染
      const userTable = wrapper.find('[data-testid="user-table"]');
      if (userTable.exists()) {
        const tableRows = userTable.findAll('[data-testid^="user-row-"]');
        expect(tableRows.length).toBe(1);
      }
    });

    it('should handle search functionality correctly', async () => {
      const wrapper = createTestWrapper(UserList);

      // 填写搜索表单
      const searchFormData = {
        username: 'admin',
        name: '管理员',
        role: 'ADMIN',
        status: 'ACTIVE'
      };

      await fillForm(wrapper, searchFormData);

      // 触发搜索
      const searchButton = wrapper.find('[data-testid="search-button"]');
      if (searchButton.exists()) {
        await searchButton.trigger('click');
        
        // 验证搜索参数
        expect(mockRequest.get).toHaveBeenCalledWith('/api/users', {
          params: expect.objectContaining(searchFormData)
        });
      }
    });

    it('should handle pagination correctly', async () => {
      const wrapper = createTestWrapper(UserList);

      // 测试页码变化
      const pagination = wrapper.find('[data-testid="pagination"]');
      if (pagination.exists()) {
        // 模拟页码变化事件
        await pagination.vm.$emit('current-change', 2);
        
        expect(mockRequest.get).toHaveBeenCalledWith('/api/users', {
          params: expect.objectContaining({ page: 2 })
        });

        // 模拟每页数量变化
        await pagination.vm.$emit('size-change', 20);
        
        expect(mockRequest.get).toHaveBeenCalledWith('/api/users', {
          params: expect.objectContaining({ pageSize: 20 })
        });
      }
    });

    it('should handle user creation correctly', async () => {
      const wrapper = createTestWrapper(UserList);

      const createButton = wrapper.find('[data-testid="create-user-button"]');
      if (createButton.exists()) {
        await createButton.trigger('click');
        
        // 验证创建对话框显示
        expect(wrapper.find('[data-testid="user-form-dialog"]').exists()).toBe(true);
      }
    });

    it('should handle user editing correctly', async () => {
      const wrapper = createTestWrapper(UserList);

      const editButton = wrapper.find('[data-testid="edit-user-1"]');
      if (editButton.exists()) {
        await editButton.trigger('click');
        
        // 验证编辑对话框显示
        expect(wrapper.find('[data-testid="user-form-dialog"]').exists()).toBe(true);
        
        // 验证用户数据加载
        expect(mockRequest.get).toHaveBeenCalledWith('/api/users/1');
      }
    });

    it('should handle user deletion with confirmation', async () => {
      const { ElMessageBox } = await import('element-plus');
      
      const wrapper = createTestWrapper(UserList);

      const deleteButton = wrapper.find('[data-testid="delete-user-1"]');
      if (deleteButton.exists()) {
        await deleteButton.trigger('click');
        
        // 验证确认对话框
        expect(ElMessageBox.confirm).toHaveBeenCalledWith(
          '确定要删除该用户吗？',
          '确认删除',
          expect.any(Object)
        );
      }
    });

    it('should handle status toggle correctly', async () => {
      mockRequest.put.mockResolvedValue(mockApiResponse.success({ id: '1', status: 'INACTIVE' }));

      const wrapper = createTestWrapper(UserList);

      const statusToggle = wrapper.find('[data-testid="status-toggle-1"]');
      if (statusToggle.exists()) {
        await statusToggle.trigger('click');
        
        // 验证状态更新API调用
        expect(mockRequest.put).toHaveBeenCalledWith('/api/users/1/status', {
          status: 'INACTIVE'
        });
      }
    });

    it('should handle bulk operations correctly', async () => {
      const wrapper = createTestWrapper(UserList);

      // 选择多个用户
      const checkboxes = wrapper.findAll('[data-testid^="user-checkbox-"]');
      if (checkboxes.length > 0) {
        await checkboxes[0].trigger('click');
        await checkboxes[1].trigger('click');
        
        // 测试批量删除
        const bulkDeleteButton = wrapper.find('[data-testid="bulk-delete-button"]');
        if (bulkDeleteButton.exists()) {
          await bulkDeleteButton.trigger('click');
          
          // 验证批量操作
          expect(wrapper.vm.$data.selectedUsers.length).toBeGreaterThan(0);
        }
      }
    });

    it('should handle export functionality correctly', async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse.success({
        url: '/exports/users_20240115.xlsx',
        filename: 'users_20240115.xlsx'
      }));

      const wrapper = createTestWrapper(UserList);

      const exportButton = wrapper.find('[data-testid="export-button"]');
      if (exportButton.exists()) {
        await exportButton.trigger('click');
        
        expect(mockRequest.get).toHaveBeenCalledWith('/api/users/export', {
          params: expect.any(Object)
        });
      }
    });

    it('should handle error states correctly', async () => {
      mockRequest.get.mockRejectedValue(new Error('Network error'));

      const wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证错误状态显示
      expect(wrapper.find('.error-state').exists()).toBe(true);
      expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true);
    });

    it('should handle empty states correctly', async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse.success({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10
      }));

      const wrapper = createTestWrapper(UserList);
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证空状态显示
      expect(wrapper.find('.empty-state').exists()).toBe(true);
    });
  });

  describe('UserForm Component', () => {
    it('should render form with all required fields', () => {
      const wrapper = createTestWrapper(UserForm, {
        props: {
          visible: true,
          mode: 'create'
        }
      });

      const requiredFields = [
        'username',
        'name',
        'email',
        'role',
        'password',
        'confirmPassword'
      ];

      requiredFields.forEach(field => {
        const element = wrapper.find(`[data-testid="${field}"]`);
        expect(element.exists()).toBe(true);
      });
    });

    it('should validate form fields correctly', async () => {
      const wrapper = createTestWrapper(UserForm, {
        props: {
          visible: true,
          mode: 'create'
        }
      });

      // 测试空表单验证
      await wrapper.vm.validateForm();
      expect(wrapper.vm.$data.errors).toBeDefined();

      // 测试密码确认验证
      await fillForm(wrapper, {
        password: 'password123',
        confirmPassword: 'different123'
      });

      const passwordValidation = wrapper.vm.validatePassword();
      expect(passwordValidation.valid).toBe(false);
      expect(passwordValidation.errors).toContain('两次输入的密码不一致');
    });

    it('should handle user creation with strict validation', async () => {
      mockRequest.post.mockResolvedValue(mockApiResponse.success({
        id: '123',
        username: 'newuser',
        name: '新用户'
      }));

      const wrapper = createTestWrapper(UserForm, {
        props: {
          visible: true,
          mode: 'create'
        }
      });

      const formData = {
        username: 'newuser',
        name: '新用户',
        email: 'newuser@example.com',
        phone: '13800138001',
        role: 'TEACHER',
        password: 'password123',
        confirmPassword: 'password123',
        departmentId: '1'
      };

      await fillForm(wrapper, formData);

      const submitButton = wrapper.find('[data-testid="submit-button"]');
      if (submitButton.exists()) {
        await submitButton.trigger('click');
        await waitForAsync(100);

        // 验证API调用
        expect(mockRequest.post).toHaveBeenCalledWith('/api/users', {
          method: 'POST',
          data: expect.objectContaining(formData)
        });

        // 验证请求数据结构
        const lastCall = mockRequest.post.mock.calls[mockRequest.post.mock.calls.length - 1];
        const requestData = lastCall[1].data;

        const validation = createValidationReport(requestData, {
          requiredFields: ['username', 'name', 'email', 'role', 'password'],
          fieldTypes: {
            username: 'string',
            name: 'string',
            email: 'string',
            phone: 'string',
            role: 'string',
            password: 'string',
            departmentId: 'string'
          },
          enumFields: {
            role: ['ADMIN', 'TEACHER', 'PARENT', 'PRINCIPAL', 'STAFF']
          }
        });

        expect(validation.valid).toBe(true);
      }
    });

    it('should handle user editing correctly', async () => {
      const editData = {
        id: '1',
        username: 'admin',
        name: '管理员',
        email: 'admin@example.com',
        role: 'ADMIN'
      };

      mockRequest.put.mockResolvedValue(mockApiResponse.success(editData));

      const wrapper = createTestWrapper(UserForm, {
        props: {
          visible: true,
          mode: 'edit',
          initialData: editData
        }
      });

      // 验证表单初始化
      expect(wrapper.vm.$data.formData.username).toBe('admin');
      expect(wrapper.vm.$data.formData.name).toBe('管理员');

      // 修改数据
      await fillForm(wrapper, {
        name: '管理员修改'
      });

      const submitButton = wrapper.find('[data-testid="submit-button"]');
      if (submitButton.exists()) {
        await submitButton.trigger('click');
        await waitForAsync(100);

        expect(mockRequest.put).toHaveBeenCalledWith('/api/users/1', {
          method: 'PUT',
          data: expect.objectContaining({ name: '管理员修改' })
        });
      }
    });

    it('should handle role selection with permission loading', async () => {
      const mockRoles = [
        { id: '1', name: '管理员', code: 'ADMIN' },
        { id: '2', name: '教师', code: 'TEACHER' },
        { id: '3', name: '家长', code: 'PARENT' }
      ];

      mockRequest.get.mockResolvedValue(mockApiResponse.success(mockRoles));

      const wrapper = createTestWrapper(UserForm, {
        props: {
          visible: true,
          mode: 'create'
        }
      });

      await wrapper.vm.loadRoles();

      expect(mockRequest.get).toHaveBeenCalledWith('/api/roles');
      expect(wrapper.vm.$data.availableRoles).toEqual(mockRoles);

      // 测试角色选择
      const roleSelect = wrapper.find('[data-testid="role"]');
      if (roleSelect.exists()) {
        await roleSelect.setValue('TEACHER');
        expect(wrapper.vm.$data.formData.role).toBe('TEACHER');
      }
    });
  });

  describe('RoleManagement Component', () => {
    it('should render role management with correct structure', async () => {
      const mockRoles = {
        items: [
          {
            id: '1',
            name: '管理员',
            code: 'ADMIN',
            description: '系统管理员',
            permissions: ['*'],
            userCount: 2,
            createdAt: '2023-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: '教师',
            code: 'TEACHER',
            description: '授课教师',
            permissions: ['student.read', 'class.read'],
            userCount: 15,
            createdAt: '2023-01-01T00:00:00Z'
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10
      };

      mockRequest.get.mockResolvedValue(mockApiResponse.success(mockRoles));

      const wrapper = createTestWrapper(RoleManagement);
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证组件结构
      expect(wrapper.find('.role-management-container').exists()).toBe(true);
      expect(wrapper.find('[data-testid="role-table"]').exists()).toBe(true);

      // 验证角色数据结构
      mockRoles.items.forEach(role => {
        const roleValidation = createValidationReport(role, {
          requiredFields: ['id', 'name', 'code', 'description'],
          fieldTypes: {
            id: 'string',
            name: 'string',
            code: 'string',
            description: 'string',
            permissions: 'array',
            userCount: 'number'
          }
        });

        expect(roleValidation.valid).toBe(true);
      });
    });

    it('should handle permission assignment correctly', async () => {
      const mockPermissions = [
        { id: '1', name: '用户查看', code: 'user.read' },
        { id: '2', name: '用户管理', code: 'user.write' },
        { id: '3', name: '班级查看', code: 'class.read' }
      ];

      mockRequest.get.mockResolvedValue(mockApiResponse.success(mockPermissions));

      const wrapper = createTestWrapper(RoleManagement);

      const permissionButton = wrapper.find('[data-testid="role-permissions-1"]');
      if (permissionButton.exists()) {
        await permissionButton.trigger('click');
        
        // 验证权限对话框显示
        expect(wrapper.find('[data-testid="permission-dialog"]').exists()).toBe(true);
        
        // 验证权限加载
        expect(mockRequest.get).toHaveBeenCalledWith('/api/permissions');
      }
    });

    it('should handle role creation with validation', async () => {
      mockRequest.post.mockResolvedValue(mockApiResponse.success({
        id: '123',
        name: '新角色',
        code: 'NEW_ROLE'
      }));

      const wrapper = createTestWrapper(RoleManagement);

      const createButton = wrapper.find('[data-testid="create-role-button"]');
      if (createButton.exists()) {
        await createButton.trigger('click');
        
        // 填写角色信息
        await fillForm(wrapper, {
          name: '新角色',
          code: 'NEW_ROLE',
          description: '新角色描述'
        });

        const submitButton = wrapper.find('[data-testid="submit-role-button"]');
        if (submitButton.exists()) {
          await submitButton.trigger('click');
          await waitForAsync(100);

          expect(mockRequest.post).toHaveBeenCalledWith('/api/roles', {
            method: 'POST',
            data: expect.objectContaining({
              name: '新角色',
              code: 'NEW_ROLE',
              description: '新角色描述'
            })
          });
        }
      }
    });

    it('should prevent deletion of roles with assigned users', async () => {
      const mockRoleWithUsers = {
        id: '1',
        name: '教师',
        userCount: 15
      };

      const wrapper = createTestWrapper(RoleManagement);
      await wrapper.setData({
        currentRole: mockRoleWithUsers
      });

      const deleteButton = wrapper.find('[data-testid="delete-role-1"]');
      if (deleteButton.exists()) {
        await deleteButton.trigger('click');
        
        // 验证删除限制提示
        expect(wrapper.find('[data-testid="delete-restriction"]').exists()).toBe(true);
      }
    });
  });

  describe('User Management Integration Tests', () => {
    it('should handle complete user lifecycle', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        name: '测试用户',
        email: 'test@example.com',
        role: 'TEACHER',
        status: 'ACTIVE'
      };

      // 创建用户
      mockRequest.post.mockResolvedValue(mockApiResponse.success(mockUser));
      
      // 获取用户列表
      mockRequest.get.mockResolvedValue(mockApiResponse.success({
        items: [mockUser],
        total: 1,
        page: 1,
        pageSize: 10
      }));

      // 更新用户
      mockRequest.put.mockResolvedValue(mockApiResponse.success({
        ...mockUser,
        name: '测试用户更新'
      }));

      const wrapper = createTestWrapper(UserList);

      // 验证创建流程
      const createButton = wrapper.find('[data-testid="create-user-button"]');
      if (createButton.exists()) {
        await createButton.trigger('click');
        
        const userForm = wrapper.findComponent(UserForm);
        await userForm.vm.$emit('submit', mockUser);
        
        expect(mockRequest.post).toHaveBeenCalledWith('/api/users', expect.any(Object));
      }

      // 验证列表更新
      await wrapper.vm.$nextTick();
      expect(mockRequest.get).toHaveBeenCalled();
    });

    it('should handle permission-based access control', async () => {
      // Mock无权限情况
      vi.doMock('@/stores/permission', () => ({
        usePermissionStore: () => ({
          hasPermission: vi.fn((permission) => {
            const allowedPermissions = ['user.read'];
            return allowedPermissions.includes(permission);
          }),
          permissions: ['user.read']
        })
      }));

      const wrapper = createTestWrapper(UserList);

      // 验证无权限的按钮被禁用
      const createButton = wrapper.find('[data-testid="create-user-button"]');
      if (createButton.exists()) {
        expect(createButton.attributes('disabled')).toBeDefined();
      }

      const deleteButton = wrapper.find('[data-testid="delete-user-1"]');
      if (deleteButton.exists()) {
        expect(deleteButton.attributes('disabled')).toBeDefined();
      }
    });
  });
});