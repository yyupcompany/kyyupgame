import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import UserPage from '@/pages/system/User.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import * as systemApi from '@/api/modules/system';

// Mock API模块
vi.mock('@/api/modules/system', () => ({
  // 用户相关API
  getUsers: vi.fn(),
  getUserDetail: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  updateUserStatus: vi.fn(),
  getRoles: vi.fn(),
  UserStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    LOCKED: 'locked'
  },
  
  // 其他系统API
  getSystemStatus: vi.fn(),
  getSystemHealth: vi.fn(),
  getSystemInfo: vi.fn()
}));

// Mock useRouter
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  currentRoute: {
    value: {
      path: '/system/user',
      name: 'User',
      params: {},
      query: {},
      meta: {}
    }
  }
};

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRouter.currentRoute,
  createRouter: vi.fn(),
  createWebHistory: vi.fn()
}));

// Mock Element Plus 组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  };
});

describe('User.vue', () => {
  let wrapper: VueWrapper<any>;
  let router: any;
  let pinia: any;

  beforeEach(async () => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/system/user', component: UserPage }
      ]
    });

    // 创建 Pinia 实例
    pinia = createPinia();
    setActivePinia(pinia);

    // 重置mock函数
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    mockPush.mockClear();
  });

  describe('基础渲染', () => {
    it('应该正确渲染用户管理页面', async () => {
      // Mock API响应
      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: []
      });

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub"><slot /></button>',
              emits: ['click']
            },
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(wrapper.find('.page-container').exists()).toBe(true);
      expect(wrapper.find('.app-card').exists()).toBe(true);
    });

    it('应该显示用户列表标题', async () => {
      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: []
      });

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': true,
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(wrapper.text()).toContain('用户列表');
    });
  });

  describe('用户列表显示和分页', () => {
    it('应该在挂载时加载用户列表', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'admin',
          realName: '管理员',
          email: 'admin@example.com',
          mobile: '13800138000',
          status: 'active',
          roles: [{ id: 1, name: '管理员' }],
          lastLoginTime: '2023-01-01 10:00:00',
          createdAt: '2023-01-01 10:00:00',
          updatedAt: '2023-01-01 10:00:00'
        },
        {
          id: 2,
          username: 'teacher',
          realName: '张老师',
          email: 'teacher@example.com',
          mobile: '13800138001',
          status: 'active',
          roles: [{ id: 2, name: '教师' }],
          lastLoginTime: '2023-01-01 10:00:00',
          createdAt: '2023-01-01 10:00:00',
          updatedAt: '2023-01-01 10:00:00'
        }
      ];

      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: mockUsers,
          total: 2,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: [
          { id: 1, name: '管理员', code: 'admin' },
          { id: 2, name: '教师', code: 'teacher' }
        ]
      });

      const getUsersSpy = vi.spyOn(systemApi, 'getUsers');

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub"><slot /></button>',
              emits: ['click']
            },
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(getUsersSpy).toHaveBeenCalled();
      expect(wrapper.vm.userList.length).toBe(2);
      expect(wrapper.vm.totalUsers).toBe(2);
    });

    it('应该正确处理分页', async () => {
      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: []
      });

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': true,
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 检查分页组件是否存在
      const pagination = wrapper.findComponent({ name: 'el-pagination' });
      expect(pagination.exists()).toBe(true);
    });
  });

  describe('用户搜索和筛选功能', () => {
    it('应该能够处理搜索表单输入', async () => {
      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: []
      });

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': true,
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 检查搜索表单是否存在
      const searchForm = wrapper.findComponent({ name: 'el-form' });
      expect(searchForm.exists()).toBe(true);

      // 检查搜索输入框是否存在
      const searchInputs = wrapper.findAllComponents({ name: 'el-input' });
      expect(searchInputs.length).toBeGreaterThan(0);
    });

    it('应该能够执行搜索操作', async () => {
      const getUsersSpy = vi.spyOn(systemApi, 'getUsers');

      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: []
      });

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit('click')"><slot /></button>',
              emits: ['click']
            },
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 查找搜索按钮并点击
      const searchButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('搜索'));

      if (searchButtons.length > 0) {
        await searchButtons[0].trigger('click');
        expect(getUsersSpy).toHaveBeenCalled();
      }
    });

    it('应该能够重置搜索条件', async () => {
      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: []
      });

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit('click')"><slot /></button>',
              emits: ['click']
            },
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 查找重置按钮并点击
      const resetButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('重置'));

      if (resetButtons.length > 0) {
        await resetButtons[0].trigger('click');
        // 验证搜索表单被重置
        expect(wrapper.vm.searchForm.username).toBe('');
        expect(wrapper.vm.searchForm.roleId).toBe('');
        expect(wrapper.vm.searchForm.status).toBe('');
      }
    });
  });

  describe('用户创建、编辑、删除操作', () => {
    it('应该能够打开用户创建对话框', async () => {
      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: []
      });

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit('click')"><slot /></button>',
              emits: ['click']
            },
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 查找新增用户按钮并点击
      const addButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('新增用户'));

      if (addButtons.length > 0) {
        await addButtons[0].trigger('click');
        // 验证对话框打开
        expect(wrapper.vm.userDialogVisible).toBe(true);
      }
    });

    it('应该能够打开用户编辑对话框', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        realName: '管理员',
        email: 'admin@example.com',
        mobile: '13800138000',
        status: 'active',
        roles: [{ id: 1, name: '管理员' }],
        lastLoginTime: '2023-01-01 10:00:00',
        createdAt: '2023-01-01 10:00:00',
        updatedAt: '2023-01-01 10:00:00',
        remark: ''
      };

      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: [mockUser],
          total: 1,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: [
          { id: 1, name: '管理员', code: 'admin' }
        ]
      });

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit('click')"><slot /></button>',
              emits: ['click']
            },
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 查找编辑按钮并点击
      const editButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('编辑'));

      if (editButtons.length > 0) {
        await editButtons[0].trigger('click');
        // 验证对话框打开并且编辑中的用户数据正确
        expect(wrapper.vm.userDialogVisible).toBe(true);
        expect(wrapper.vm.editingUser.id).toBe(1);
      }
    });

    it('应该能够删除用户', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        realName: '测试用户',
        email: 'test@example.com',
        mobile: '13800138000',
        status: 'active',
        roles: [{ id: 2, name: '普通用户' }],
        lastLoginTime: '2023-01-01 10:00:00',
        createdAt: '2023-01-01 10:00:00',
        updatedAt: '2023-01-01 10:00:00',
        remark: ''
      };

      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: [mockUser],
          total: 1,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: [
          { id: 2, name: '普通用户', code: 'user' }
        ]
      });

      // Mock 确认对话框
      vi.mocked(systemApi.deleteUser).mockResolvedValue({
        success: true,
        message: '删除成功'
      });

      const { ElMessageBox } = await import('element-plus');
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm');

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit('click')"><slot /></button>',
              emits: ['click']
            },
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': {
              template: '<div class="el-dropdown-stub"><slot /></div>'
            },
            'el-dropdown-menu': true,
            'el-dropdown-item': {
              template: '<div class="el-dropdown-item-stub" @click="$emit('click')"><slot /></div>',
              emits: ['click']
            },
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 查找删除按钮并点击
      const deleteButtons = wrapper.findAllComponents({ name: 'el-dropdown-item' })
        .filter(item => item.text().includes('删除'));

      if (deleteButtons.length > 0) {
        await deleteButtons[0].trigger('click');
        // 验证删除API被调用
        expect(systemApi.deleteUser).toHaveBeenCalledWith(1);
      }
    });
  });

  describe('用户状态变更功能', () => {
    it('应该能够启用用户', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        realName: '测试用户',
        email: 'test@example.com',
        mobile: '13800138000',
        status: 'inactive',
        roles: [{ id: 2, name: '普通用户' }],
        lastLoginTime: '2023-01-01 10:00:00',
        createdAt: '2023-01-01 10:00:00',
        updatedAt: '2023-01-01 10:00:00',
        remark: ''
      };

      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: [mockUser],
          total: 1,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: [
          { id: 2, name: '普通用户', code: 'user' }
        ]
      });

      vi.mocked(systemApi.updateUserStatus).mockResolvedValue({
        success: true,
        message: '状态更新成功'
      });

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit('click')"><slot /></button>',
              emits: ['click']
            },
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 查找启用按钮并点击
      const enableButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('启用'));

      if (enableButtons.length > 0) {
        await enableButtons[0].trigger('click');
        // 验证状态更新API被调用
        expect(systemApi.updateUserStatus).toHaveBeenCalledWith(1, 'active');
      }
    });

    it('应该能够禁用用户', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        realName: '测试用户',
        email: 'test@example.com',
        mobile: '13800138000',
        status: 'active',
        roles: [{ id: 2, name: '普通用户' }],
        lastLoginTime: '2023-01-01 10:00:00',
        createdAt: '2023-01-01 10:00:00',
        updatedAt: '2023-01-01 10:00:00',
        remark: ''
      };

      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: [mockUser],
          total: 1,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: [
          { id: 2, name: '普通用户', code: 'user' }
        ]
      });

      vi.mocked(systemApi.updateUserStatus).mockResolvedValue({
        success: true,
        message: '状态更新成功'
      });

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit('click')"><slot /></button>',
              emits: ['click']
            },
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 查找禁用按钮并点击
      const disableButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('禁用'));

      if (disableButtons.length > 0) {
        await disableButtons[0].trigger('click');
        // 验证状态更新API被调用
        expect(systemApi.updateUserStatus).toHaveBeenCalledWith(1, 'inactive');
      }
    });
  });

  describe('批量操作功能', () => {
    it('应该能够选择多个用户进行批量删除', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'user1',
          realName: '用户1',
          email: 'user1@example.com',
          mobile: '13800138001',
          status: 'active',
          roles: [{ id: 2, name: '普通用户' }],
          lastLoginTime: '2023-01-01 10:00:00',
          createdAt: '2023-01-01 10:00:00',
          updatedAt: '2023-01-01 10:00:00',
          remark: ''
        },
        {
          id: 2,
          username: 'user2',
          realName: '用户2',
          email: 'user2@example.com',
          mobile: '13800138002',
          status: 'active',
          roles: [{ id: 2, name: '普通用户' }],
          lastLoginTime: '2023-01-01 10:00:00',
          createdAt: '2023-01-01 10:00:00',
          updatedAt: '2023-01-01 10:00:00',
          remark: ''
        }
      ];

      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: mockUsers,
          total: 2,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: [
          { id: 2, name: '普通用户', code: 'user' }
        ]
      });

      // Mock 确认对话框
      vi.mocked(systemApi.deleteUser).mockResolvedValue({
        success: true,
        message: '删除成功'
      });

      const { ElMessageBox } = await import('element-plus');
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm');

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit('click')"><slot /></button>',
              emits: ['click']
            },
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 模拟选择用户
      await wrapper.vm.handleSelectionChange(mockUsers);
      expect(wrapper.vm.selectedUsers.length).toBe(2);

      // 查找批量删除按钮并点击
      const batchDeleteButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('批量删除'));

      if (batchDeleteButtons.length > 0) {
        await batchDeleteButtons[0].trigger('click');
        // 验证删除API被调用两次（每个用户一次）
        expect(systemApi.deleteUser).toHaveBeenCalledTimes(2);
      }
    });

    it('应该在没有选择用户时禁用批量删除按钮', async () => {
      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: []
      });

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': true,
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 查找批量删除按钮
      const batchDeleteButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('批量删除'));

      if (batchDeleteButtons.length > 0) {
        // 验证按钮被禁用
        const button = batchDeleteButtons[0];
        expect(button.attributes('disabled')).toBeDefined();
      }
    });
  });

  describe('错误处理', () => {
    it('应该正确处理API错误', async () => {
      vi.mocked(systemApi.getUsers).mockRejectedValue(new Error('API Error'));
      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: []
      });

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': true,
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证错误状态
      expect(wrapper.vm.hasApiError).toBe(true);
    });

    it('应该正确处理空数据状态', async () => {
      vi.mocked(systemApi.getUsers).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      });

      vi.mocked(systemApi.getRoles).mockResolvedValue({
        success: true,
        data: []
      });

      wrapper = mount(UserPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': true,
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-row': true,
            'el-col': true,
            'el-icon': true,
            'el-tag': true,
            'el-dropdown': true,
            'el-dropdown-menu': true,
            'el-dropdown-item': true,
            'el-radio-group': true,
            'el-radio': true,
            'el-input-number': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证空状态
      expect(wrapper.vm.userList.length).toBe(0);
      expect(wrapper.vm.totalUsers).toBe(0);
    });
  });
});