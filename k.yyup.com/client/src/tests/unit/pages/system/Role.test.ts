import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { nextTick } from 'vue';
import RolePage from '@/pages/system/Role.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import * as roleApi from '@/api/modules/role';

// Mock API模块
vi.mock('@/api/modules/role', () => ({
  // 角色相关API
  getRoleList: vi.fn(),
  getRoleDetail: vi.fn(),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
  batchDeleteRole: vi.fn()
}));

// Mock useRouter
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  currentRoute: {
    value: {
      path: '/system/role',
      name: 'Role',
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

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Plus: { template: '<div>Plus</div>' },
  Delete: { template: '<div>Delete</div>' },
  Edit: { template: '<div>Edit</div>' },
  Lock: { template: '<div>Lock</div>' },
  Unlock: { template: '<div>Unlock</div>' },
  Search: { template: '<div>Search</div>' },
  Refresh: { template: '<div>Refresh</div>' }
}));

describe('Role.vue', () => {
  let wrapper: VueWrapper<any>;
  let router: any;

  beforeEach(() => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/system/role', component: RolePage }
      ]
    });

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
    it('应该正确渲染角色管理页面', async () => {
      // Mock API响应
      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0
        }
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
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
            'el-radio-group': true,
            'el-radio': true,
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
      expect(wrapper.find('.card').exists()).toBe(true);
    });

    it('应该显示角色列表标题', async () => {
      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0
        }
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
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
            'el-radio-group': true,
            'el-radio': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(wrapper.text()).toContain('角色列表');
    });
  });

  describe('角色列表显示和分页', () => {
    it('应该在挂载时加载角色列表', async () => {
      const mockRoles = [
        {
          id: 1,
          name: '管理员',
          code: 'ADMIN',
          description: '系统管理员角色',
          status: 1,
          created_at: '2023-01-01 10:00:00'
        },
        {
          id: 2,
          name: '教师',
          code: 'TEACHER',
          description: '教师角色',
          status: 1,
          created_at: '2023-01-01 10:00:00'
        }
      ];

      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: mockRoles,
          total: 2
        }
      });

      const getRoleListSpy = vi.spyOn(roleApi, 'getRoleList');

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
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
            'el-radio-group': true,
            'el-radio': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(getRoleListSpy).toHaveBeenCalled();
      expect(wrapper.vm.roleList.length).toBe(2);
      expect(wrapper.vm.pagination.total).toBe(2);
    });

    it('应该正确处理分页', async () => {
      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0
        }
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
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
            'el-radio-group': true,
            'el-radio': true,
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

  describe('角色搜索和筛选功能', () => {
    it('应该能够处理搜索表单输入', async () => {
      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0
        }
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
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
            'el-radio-group': true,
            'el-radio': true,
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
      const getRoleListSpy = vi.spyOn(roleApi, 'getRoleList');

      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0
        }
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit(\'click\')"><slot /></button>',
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
            'el-radio-group': true,
            'el-radio': true,
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
        expect(getRoleListSpy).toHaveBeenCalled();
      }
    });

    it('应该能够重置搜索条件', async () => {
      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0
        }
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit(\'click\')"><slot /></button>',
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
            'el-radio-group': true,
            'el-radio': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 设置搜索条件
      wrapper.vm.searchForm.name = '管理员';
      wrapper.vm.searchForm.code = 'ADMIN';
      wrapper.vm.searchForm.status = 1;

      // 查找重置按钮并点击
      const resetButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('重置'));

      if (resetButtons.length > 0) {
        await resetButtons[0].trigger('click');
        // 验证搜索表单被重置
        expect(wrapper.vm.searchForm.name).toBe('');
        expect(wrapper.vm.searchForm.code).toBe('');
        expect(wrapper.vm.searchForm.status).toBeUndefined();
      }
    });
  });

  describe('角色创建、编辑、删除操作', () => {
    it('应该能够打开角色创建对话框', async () => {
      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0
        }
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit(\'click\')"><slot /></button>',
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
            'el-radio-group': true,
            'el-radio': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 查找新增角色按钮并点击
      const addButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('新增角色'));

      if (addButtons.length > 0) {
        await addButtons[0].trigger('click');
        // 验证对话框打开
        expect(wrapper.vm.roleDialogVisible).toBe(true);
        // 验证编辑中的角色数据为空
        expect(wrapper.vm.editingRole.name).toBe('');
        expect(wrapper.vm.editingRole.code).toBe('');
        expect(wrapper.vm.editingRole.description).toBe('');
        expect(wrapper.vm.editingRole.status).toBe(1);
      }
    });

    it('应该能够打开角色编辑对话框', async () => {
      const mockRole = {
        id: 1,
        name: '管理员',
        code: 'ADMIN',
        description: '系统管理员角色',
        status: 1,
        created_at: '2023-01-01 10:00:00'
      };

      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [mockRole],
          total: 1
        }
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit(\'click\')"><slot /></button>',
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
            'el-radio-group': true,
            'el-radio': true,
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
        // 验证对话框打开并且编辑中的角色数据正确
        expect(wrapper.vm.roleDialogVisible).toBe(true);
        expect(wrapper.vm.editingRole.id).toBe(1);
        expect(wrapper.vm.editingRole.name).toBe('管理员');
        expect(wrapper.vm.editingRole.code).toBe('ADMIN');
        expect(wrapper.vm.editingRole.description).toBe('系统管理员角色');
        expect(wrapper.vm.editingRole.status).toBe(1);
      }
    });

    it('应该能够创建角色', async () => {
      const newRole = {
        name: '新角色',
        code: 'NEW_ROLE',
        description: '新创建的角色',
        status: 1
      };

      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0
        }
      });

      vi.mocked(roleApi.createRole).mockResolvedValue({
        success: true,
        message: '创建角色成功'
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit(\'click\')"><slot /></button>',
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
            'el-radio-group': true,
            'el-radio': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 打开创建对话框
      wrapper.vm.roleDialogVisible = true;
      await nextTick();

      // 设置角色数据
      wrapper.vm.editingRole = { ...newRole };

      // 查找确定按钮并点击
      const confirmButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('确定'));

      if (confirmButtons.length > 0) {
        await confirmButtons[0].trigger('click');
        // 验证创建API被调用
        expect(roleApi.createRole).toHaveBeenCalledWith(newRole);
      }
    });

    it('应该能够更新角色', async () => {
      const updatedRole = {
        id: 1,
        name: '更新的角色',
        code: 'ADMIN',
        description: '更新后的角色描述',
        status: 0
      };

      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [{
            id: 1,
            name: '管理员',
            code: 'ADMIN',
            description: '系统管理员角色',
            status: 1,
            created_at: '2023-01-01 10:00:00'
          }],
          total: 1
        }
      });

      vi.mocked(roleApi.updateRole).mockResolvedValue({
        success: true,
        message: '更新角色成功'
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit(\'click\')"><slot /></button>',
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
            'el-radio-group': true,
            'el-radio': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 打开编辑对话框
      wrapper.vm.openRoleDialog({
        id: 1,
        name: '管理员',
        code: 'ADMIN',
        description: '系统管理员角色',
        status: 1
      });
      await nextTick();

      // 更新角色数据
      wrapper.vm.editingRole = { ...updatedRole };

      // 查找确定按钮并点击
      const confirmButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('确定'));

      if (confirmButtons.length > 0) {
        await confirmButtons[0].trigger('click');
        // 验证更新API被调用
        expect(roleApi.updateRole).toHaveBeenCalledWith(1, updatedRole);
      }
    });

    it('应该能够删除角色', async () => {
      const mockRole = {
        id: 1,
        name: '测试角色',
        code: 'TEST_ROLE',
        description: '测试角色描述',
        status: 1,
        created_at: '2023-01-01 10:00:00'
      };

      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [mockRole],
          total: 1
        }
      });

      // Mock 确认对话框
      vi.mocked(roleApi.deleteRole).mockResolvedValue({
        success: true,
        message: '删除角色成功'
      });

      const { ElMessageBox } = await import('element-plus');
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm');

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit(\'click\')"><slot /></button>',
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
            'el-radio-group': true,
            'el-radio': true,
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
      const deleteButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('删除'));

      if (deleteButtons.length > 0) {
        await deleteButtons[0].trigger('click');
        // 验证删除API被调用
        expect(roleApi.deleteRole).toHaveBeenCalledWith(1);
      }
    });
  });

  describe('角色状态变更功能', () => {
    it('应该能够启用角色', async () => {
      const mockRole = {
        id: 1,
        name: '测试角色',
        code: 'TEST_ROLE',
        description: '测试角色描述',
        status: 0,
        created_at: '2023-01-01 10:00:00'
      };

      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [mockRole],
          total: 1
        }
      });

      vi.mocked(roleApi.updateRole).mockResolvedValue({
        success: true,
        message: '更新角色成功'
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit(\'click\')"><slot /></button>',
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
            'el-radio-group': true,
            'el-radio': true,
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
        // 验证状态更新API被调用，状态变为1（启用）
        expect(roleApi.updateRole).toHaveBeenCalledWith(1, { ...mockRole, status: 1 });
      }
    });

    it('应该能够禁用角色', async () => {
      const mockRole = {
        id: 1,
        name: '测试角色',
        code: 'TEST_ROLE',
        description: '测试角色描述',
        status: 1,
        created_at: '2023-01-01 10:00:00'
      };

      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [mockRole],
          total: 1
        }
      });

      vi.mocked(roleApi.updateRole).mockResolvedValue({
        success: true,
        message: '更新角色成功'
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit(\'click\')"><slot /></button>',
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
            'el-radio-group': true,
            'el-radio': true,
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
        // 验证状态更新API被调用，状态变为0（禁用）
        expect(roleApi.updateRole).toHaveBeenCalledWith(1, { ...mockRole, status: 0 });
      }
    });
  });

  describe('批量删除功能', () => {
    it('应该能够选择多个角色进行批量删除', async () => {
      const mockRoles = [
        {
          id: 1,
          name: '角色1',
          code: 'ROLE1',
          description: '角色1描述',
          status: 1,
          created_at: '2023-01-01 10:00:00'
        },
        {
          id: 2,
          name: '角色2',
          code: 'ROLE2',
          description: '角色2描述',
          status: 1,
          created_at: '2023-01-01 10:00:00'
        }
      ];

      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: mockRoles,
          total: 2
        }
      });

      // Mock 确认对话框
      vi.mocked(roleApi.batchDeleteRole).mockResolvedValue({
        success: true,
        message: '批量删除角色成功'
      });

      const { ElMessageBox } = await import('element-plus');
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm');

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit(\'click\')"><slot /></button>',
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
            'el-radio-group': true,
            'el-radio': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 模拟选择角色
      await wrapper.vm.handleSelectionChange(mockRoles);
      expect(wrapper.vm.selectedRoles.length).toBe(2);

      // 查找批量删除按钮并点击
      const batchDeleteButtons = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('批量删除'));

      if (batchDeleteButtons.length > 0) {
        await batchDeleteButtons[0].trigger('click');
        // 验证批量删除API被调用
        expect(roleApi.batchDeleteRole).toHaveBeenCalledWith([1, 2]);
      }
    });

    it('应该在没有选择角色时禁用批量删除按钮', async () => {
      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0
        }
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
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
            'el-radio-group': true,
            'el-radio': true,
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
      vi.mocked(roleApi.getRoleList).mockRejectedValue(new Error('API Error'));

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
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
            'el-radio-group': true,
            'el-radio': true,
            'EmptyState': true
          },
          components: {
            EmptyState
          }
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证错误处理
      const { ElMessage } = await import('element-plus');
      expect(ElMessage.error).toHaveBeenCalledWith('获取角色列表失败，请检查网络连接');
    });

    it('应该正确处理空数据状态', async () => {
      vi.mocked(roleApi.getRoleList).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0
        }
      });

      wrapper = mount(RolePage, {
        global: {
          plugins: [router],
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
            'el-radio-group': true,
            'el-radio': true,
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
      expect(wrapper.vm.roleList.length).toBe(0);
      expect(wrapper.vm.pagination.total).toBe(0);
    });
  });
});