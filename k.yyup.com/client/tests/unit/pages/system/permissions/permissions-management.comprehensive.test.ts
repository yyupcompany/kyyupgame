/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ElMessage, ElMessageBox } from 'element-plus';
import PermissionsManagement from '@/pages/system/permissions/index.vue';
import {
  getPermissionList,
  createPermission,
  updatePermission,
  deletePermission
} from '@/api/modules/permission';
import { expectNoConsoleErrors } from '../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue,
  validateDateFormat
} from '../../utils/data-validation';

// Mock API
vi.mock('@/api/modules/permission', () => ({
  getPermissionList: vi.fn(),
  createPermission: vi.fn(),
  updatePermission: vi.fn(),
  deletePermission: vi.fn()
}));

// Mock Element Plus 图标
vi.mock('@element-plus/icons-vue', () => ({
  Plus: { name: 'Plus' }
}));

// Mock UnifiedIcon
vi.mock('@/components/UnifiedIcon.vue', () => ({
  default: {
    name: 'UnifiedIcon',
    props: ['name'],
    template: '<i :class="`icon-${name}`"></i>'
  }
}));

describe('权限管理系统 - 100%完整测试覆盖', () => {
  let wrapper: any;

  // 权限数据接口定义
  interface Permission {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
    status?: 'active' | 'inactive';
  }

  interface PermissionListResponse {
    success: boolean;
    data: {
      items: Permission[];
      total: number;
      page: number;
      pageSize: number;
    } | Permission[];
    message?: string;
  }

  const mockPermissionData: Permission[] = [
    {
      id: '1',
      name: '用户管理',
      description: '管理系统用户',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'active'
    },
    {
      id: '2',
      name: '角色管理',
      description: '管理系统角色',
      createdAt: '2024-01-02T00:00:00Z',
      status: 'active'
    },
    {
      id: '3',
      name: '权限管理',
      description: '管理系统权限',
      createdAt: '2024-01-03T00:00:00Z',
      status: 'inactive'
    }
  ];

  const mockListResponse: PermissionListResponse = {
    success: true,
    data: {
      items: mockPermissionData,
      total: 3,
      page: 1,
      pageSize: 10
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // 默认成功的API响应
    vi.mocked(getPermissionList).mockResolvedValue(mockListResponse);
    vi.mocked(createPermission).mockResolvedValue({ success: true, data: mockPermissionData[0] });
    vi.mocked(updatePermission).mockResolvedValue({ success: true, data: mockPermissionData[0] });
    vi.mocked(deletePermission).mockResolvedValue({ success: true });
  });

  afterEach(() => {
    expectNoConsoleErrors();

    if (wrapper) {
      wrapper.unmount();
    }

    vi.restoreAllMocks();
  });

  describe('组件初始化和数据加载', () => {
    it('应该正确初始化组件并加载权限列表', async () => {
      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();

      // 验证API调用
      expect(getPermissionList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        keyword: ''
      });

      // 验证数据加载
      expect(wrapper.vm.tableData).toEqual(mockPermissionData);
      expect(wrapper.vm.total).toBe(3);
      expect(wrapper.vm.currentPage).toBe(1);
      expect(wrapper.vm.pageSize).toBe(10);
      expect(wrapper.vm.loading).toBe(false);

      // 验证响应数据结构
      const response = await getPermissionList({ page: 1, pageSize: 10 });
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();

      if (Array.isArray(response.data)) {
        // 处理直接数组响应
        expect(response.data.length).toBeGreaterThan(0);
      } else {
        // 处理分页响应
        const paginationValidation = validateRequiredFields(response.data, ['items', 'total', 'page', 'pageSize']);
        expect(paginationValidation.valid).toBe(true);

        const paginationTypeValidation = validateFieldTypes(response.data, {
          items: 'object',
          total: 'number',
          page: 'number',
          pageSize: 'number'
        });
        expect(paginationTypeValidation.valid).toBe(true);
      }
    });

    it('应该处理API加载失败的情况', async () => {
      const errorMessage = '网络连接失败';
      vi.mocked(getPermissionList).mockRejectedValue(new Error(errorMessage));

      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证错误处理
      expect(wrapper.vm.loading).toBe(false);
      expect(ElMessage.error).toHaveBeenCalledWith('获取数据失败');

      // 验证控制台错误记录
      expect(console.error).toHaveBeenCalledWith('获取数据失败:', expect.any(Error));
    });

    it('应该处理API返回失败响应的情况', async () => {
      const errorResponse = {
        success: false,
        message: '权限不足'
      };
      vi.mocked(getPermissionList).mockResolvedValue(errorResponse);

      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.loading).toBe(false);
      expect(ElMessage.error).toHaveBeenCalledWith('权限不足');
    });

    it('应该处理空数据响应', async () => {
      const emptyResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      };
      vi.mocked(getPermissionList).mockResolvedValue(emptyResponse);

      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.tableData).toEqual([]);
      expect(wrapper.vm.total).toBe(0);
    });
  });

  describe('搜索功能', () => {
    beforeEach(async () => {
      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();
    });

    it('应该执行搜索并重置页码', async () => {
      const searchQuery = '用户';
      await wrapper.setData({ searchQuery });
      await wrapper.find('.search-input input').setValue(searchQuery);
      await wrapper.find('button').trigger('click');

      expect(getPermissionList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        keyword: searchQuery
      });
      expect(wrapper.vm.currentPage).toBe(1);
    });

    it('应该在回车时触发搜索', async () => {
      const searchInput = wrapper.find('.search-input input');
      await searchInput.setValue('测试权限');
      await searchInput.trigger('keyup.enter');

      expect(getPermissionList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        keyword: '测试权限'
      });
    });

    it('应该重置搜索条件', async () => {
      // 先设置搜索条件
      await wrapper.setData({ searchQuery: '测试' });
      await wrapper.vm.handleSearch();

      // 清空搜索条件
      await wrapper.vm.handleReset();

      expect(wrapper.vm.searchQuery).toBe('');
      expect(wrapper.vm.currentPage).toBe(1);
      expect(getPermissionList).toHaveBeenCalledTimes(2); // 搜索 + 重置
    });

    it('应该处理搜索过程中的异常', async () => {
      vi.mocked(getPermissionList).mockRejectedValueOnce(new Error('搜索失败'));

      await wrapper.setData({ searchQuery: '测试' });
      await wrapper.vm.handleSearch();

      expect(ElMessage.error).toHaveBeenCalledWith('获取数据失败');
    });
  });

  describe('分页功能', () => {
    beforeEach(async () => {
      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();
    });

    it('应该处理页码变化', async () => {
      await wrapper.vm.handleCurrentChange(2);

      expect(wrapper.vm.currentPage).toBe(2);
      expect(getPermissionList).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        keyword: ''
      });
    });

    it('应该处理页面大小变化', async () => {
      await wrapper.vm.handleSizeChange(20);

      expect(wrapper.vm.pageSize).toBe(20);
      expect(getPermissionList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        keyword: ''
      });
    });

    it('应该在页码变化时保持搜索条件', async () => {
      await wrapper.setData({ searchQuery: '权限' });
      await wrapper.vm.handleCurrentChange(3);

      expect(getPermissionList).toHaveBeenCalledWith({
        page: 3,
        pageSize: 10,
        keyword: '权限'
      });
    });
  });

  describe('CRUD操作 - 创建权限', () => {
    beforeEach(async () => {
      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();
    });

    it('应该打开创建对话框并初始化表单', async () => {
      await wrapper.vm.handleCreate();

      expect(wrapper.vm.dialogVisible).toBe(true);
      expect(wrapper.vm.dialogTitle).toBe('新增权限管理');
      expect(wrapper.vm.isEdit).toBe(false);
      expect(wrapper.vm.form.name).toBe('');
      expect(wrapper.vm.form.description).toBe('');
    });

    it('应该验证必填字段', async () => {
      await wrapper.vm.handleCreate();

      // 尝试提交空表单
      const formRef = {
        validate: vi.fn((callback) => {
          callback(false, { name: '请输入名称' });
        })
      };
      wrapper.vm.$refs.formRef = formRef;

      await wrapper.vm.handleSubmit();

      expect(formRef.validate).toHaveBeenCalled();
      expect(createPermission).not.toHaveBeenCalled();
    });

    it('应该成功创建新权限', async () => {
      const newPermission = {
        name: '新权限',
        description: '权限描述'
      };

      await wrapper.vm.handleCreate();
      await wrapper.setData({ form: newPermission });

      // Mock 表单验证成功
      const formRef = {
        validate: vi.fn((callback) => {
          callback(true, {});
        })
      };
      wrapper.vm.$refs.formRef = formRef;

      await wrapper.vm.handleSubmit();

      expect(createPermission).toHaveBeenCalledWith(newPermission);
      expect(ElMessage.success).toHaveBeenCalledWith('创建成功');
      expect(wrapper.vm.dialogVisible).toBe(false);

      // 验证列表刷新
      expect(getPermissionList).toHaveBeenCalledTimes(2);
    });

    it('应该处理创建失败的情况', async () => {
      vi.mocked(createPermission).mockResolvedValue({
        success: false,
        message: '创建失败，权限名称已存在'
      });

      await wrapper.vm.handleCreate();
      await wrapper.setData({
        form: { name: '重复权限', description: '' }
      });

      const formRef = {
        validate: vi.fn((callback) => callback(true, {}))
      };
      wrapper.vm.$refs.formRef = formRef;

      await wrapper.vm.handleSubmit();

      expect(ElMessage.error).toHaveBeenCalledWith('创建失败，权限名称已存在');
      expect(wrapper.vm.dialogVisible).toBe(true);
    });

    it('应该处理创建时的网络异常', async () => {
      vi.mocked(createPermission).mockRejectedValue(new Error('网络异常'));

      await wrapper.vm.handleCreate();
      await wrapper.setData({
        form: { name: '测试权限', description: '' }
      });

      const formRef = {
        validate: vi.fn((callback) => callback(true, {}))
      };
      wrapper.vm.$refs.formRef = formRef;

      await wrapper.vm.handleSubmit();

      expect(ElMessage.error).toHaveBeenCalledWith('操作失败');
      expect(console.error).toHaveBeenCalledWith('操作失败:', expect.any(Error));
    });
  });

  describe('CRUD操作 - 编辑权限', () => {
    const mockEditPermission: Permission = {
      id: '1',
      name: '用户管理',
      description: '管理系统用户',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'active'
    };

    beforeEach(async () => {
      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();
    });

    it('应该打开编辑对话框并填充表单数据', async () => {
      await wrapper.vm.handleEdit(mockEditPermission);

      expect(wrapper.vm.dialogVisible).toBe(true);
      expect(wrapper.vm.dialogTitle).toBe('编辑权限管理');
      expect(wrapper.vm.isEdit).toBe(true);
      expect(wrapper.vm.currentId).toBe('1');
      expect(wrapper.vm.form.name).toBe('用户管理');
      expect(wrapper.vm.form.description).toBe('管理系统用户');
    });

    it('应该成功更新权限', async () => {
      const updatedPermission = {
        ...mockEditPermission,
        name: '更新后的用户管理',
        description: '更新后的描述'
      };

      await wrapper.vm.handleEdit(mockEditPermission);
      await wrapper.setData({ form: updatedPermission });

      const formRef = {
        validate: vi.fn((callback) => callback(true, {}))
      };
      wrapper.vm.$refs.formRef = formRef;

      await wrapper.vm.handleSubmit();

      expect(updatePermission).toHaveBeenCalledWith('1', updatedPermission);
      expect(ElMessage.success).toHaveBeenCalledWith('更新成功');
      expect(wrapper.vm.dialogVisible).toBe(false);
    });

    it('应该处理更新失败的情况', async () => {
      vi.mocked(updatePermission).mockResolvedValue({
        success: false,
        message: '更新失败，权限不存在'
      });

      await wrapper.vm.handleEdit(mockEditPermission);
      await wrapper.setData({
        form: { name: '更新名称', description: '更新描述' }
      });

      const formRef = {
        validate: vi.fn((callback) => callback(true, {}))
      };
      wrapper.vm.$refs.formRef = formRef;

      await wrapper.vm.handleSubmit();

      expect(ElMessage.error).toHaveBeenCalledWith('更新失败，权限不存在');
    });
  });

  describe('CRUD操作 - 删除权限', () => {
    const mockDeletePermission: Permission = {
      id: '1',
      name: '用户管理',
      description: '管理系统用户',
      createdAt: '2024-01-01T00:00:00Z'
    };

    beforeEach(async () => {
      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();
    });

    it('应该显示删除确认对话框', async () => {
      // Mock MessageBox.confirm
      const mockConfirm = vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm');

      await wrapper.vm.handleDelete(mockDeletePermission);

      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '此操作将永久删除该记录, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
      expect(deletePermission).toHaveBeenCalledWith('1');
      expect(ElMessage.success).toHaveBeenCalledWith('删除成功');

      mockConfirm.mockRestore();
    });

    it('应该在用户取消删除时不执行删除', async () => {
      const mockConfirm = vi.spyOn(ElMessageBox, 'confirm').mockRejectedValue('cancel');

      await wrapper.vm.handleDelete(mockDeletePermission);

      expect(deletePermission).not.toHaveBeenCalled();
      expect(ElMessage.success).not.toHaveBeenCalled();

      mockConfirm.mockRestore();
    });

    it('应该处理删除失败的情况', async () => {
      vi.mocked(deletePermission).mockResolvedValue({
        success: false,
        message: '删除失败，权限正在使用中'
      });

      const mockConfirm = vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm');

      await wrapper.vm.handleDelete(mockDeletePermission);

      expect(ElMessage.error).toHaveBeenCalledWith('删除失败，权限正在使用中');

      mockConfirm.mockRestore();
    });

    it('应该处理删除时的网络异常', async () => {
      vi.mocked(deletePermission).mockRejectedValue(new Error('网络连接失败'));

      const mockConfirm = vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm');

      await wrapper.vm.handleDelete(mockDeletePermission);

      expect(ElMessage.error).toHaveBeenCalledWith('删除失败');
      expect(console.error).toHaveBeenCalledWith('删除失败:', expect.any(Error));

      mockConfirm.mockRestore();
    });
  });

  describe('表格选择和批量操作', () => {
    beforeEach(async () => {
      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();
    });

    it('应该处理选择变化', async () => {
      const selectedData = [mockPermissionData[0], mockPermissionData[1]];
      await wrapper.vm.handleSelectionChange(selectedData);

      expect(wrapper.vm.selectedRows).toEqual(selectedData);
    });

    it('应该在表格中正确显示数据', () => {
      const table = wrapper.find('.el-table');
      const rows = wrapper.findAll('.el-table__row');

      expect(table.exists()).toBe(true);
      expect(rows.length).toBe(mockPermissionData.length);

      // 验证第一行数据
      const firstRow = rows[0];
      expect(firstRow.text()).toContain(mockPermissionData[0].id);
      expect(firstRow.text()).toContain(mockPermissionData[0].name);
      expect(firstRow.text()).toContain(mockPermissionData[0].description);
    });

    it('应该在加载时显示加载状态', async () => {
      vi.mocked(getPermissionList).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockListResponse), 100))
      );

      wrapper = mount(PermissionsManagement);

      expect(wrapper.vm.loading).toBe(true);
      expect(wrapper.find('.el-table').attributes('loading')).toBeDefined();
    });
  });

  describe('数据验证和类型安全', () => {
    it('应该验证权限数据的必填字段', async () => {
      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();

      wrapper.vm.tableData.forEach((permission: Permission) => {
        const validation = validateRequiredFields(permission, ['id', 'name', 'createdAt']);
        expect(validation.valid).toBe(true);

        if (!validation.valid) {
          throw new Error(`Permission missing required fields: ${validation.missing.join(', ')}`);
        }
      });
    });

    it('应该验证权限数据的字段类型', async () => {
      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();

      wrapper.vm.tableData.forEach((permission: Permission) => {
        const typeValidation = validateFieldTypes(permission, {
          id: 'string',
          name: 'string',
          description: 'string',
          createdAt: 'string',
          status: 'string'
        });

        if (!typeValidation.valid) {
          console.warn(`Type validation issues: ${typeValidation.errors.join(', ')}`);
        }

        // 验证基本字段类型
        expect(typeof permission.id).toBe('string');
        expect(typeof permission.name).toBe('string');
        expect(typeof permission.createdAt).toBe('string');
      });
    });

    it('应该验证日期格式', async () => {
      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();

      wrapper.vm.tableData.forEach((permission: Permission) => {
        if (permission.createdAt) {
          expect(validateDateFormat(permission.createdAt)).toBe(true);
        }
      });
    });
  });

  describe('错误边界和异常处理', () => {
    it('应该处理API返回的数据结构异常', async () => {
      const malformedResponse = {
        success: true,
        data: null
      };
      vi.mocked(getPermissionList).mockResolvedValue(malformedResponse);

      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.tableData).toEqual([]);
      expect(wrapper.vm.total).toBe(0);
    });

    it('应该处理权限数据字段缺失的情况', async () => {
      const incompleteData = [{
        id: '1',
        name: '权限1'
        // 缺少其他字段
      }];

      vi.mocked(getPermissionList).mockResolvedValue({
        success: true,
        data: {
          items: incompleteData,
          total: 1,
          page: 1,
          pageSize: 10
        }
      });

      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.tableData).toEqual(incompleteData);
    });

    it('应该处理表单引用不存在的情况', async () => {
      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();

      // 不设置 formRef，直接调用提交
      await wrapper.vm.handleSubmit();

      expect(createPermission).not.toHaveBeenCalled();
    });
  });

  describe('性能和内存管理', () => {
    it('应该正确清理组件状态', async () => {
      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();

      // 设置一些状态
      await wrapper.setData({
        selectedRows: mockPermissionData,
        searchQuery: '测试',
        dialogVisible: true
      });

      // 卸载组件
      wrapper.unmount();

      // 验证组件已卸载
      expect(wrapper.exists()).toBe(false);
    });

    it('应该处理大量数据的性能', async () => {
      // 创建大量权限数据
      const largePermissionData = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i + 1}`,
        name: `权限${i + 1}`,
        description: `权限描述${i + 1}`,
        createdAt: '2024-01-01T00:00:00Z'
      }));

      vi.mocked(getPermissionList).mockResolvedValue({
        success: true,
        data: {
          items: largePermissionData,
          total: 1000,
          page: 1,
          pageSize: 10
        }
      });

      const startTime = Date.now();
      wrapper = mount(PermissionsManagement);
      await wrapper.vm.$nextTick();
      const endTime = Date.now();

      // 验证渲染时间在合理范围内
      expect(endTime - startTime).toBeLessThan(1000);
      expect(wrapper.vm.tableData.length).toBe(1000);
    });
  });
});