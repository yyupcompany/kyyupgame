import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import RolePermission from '@/components/system/RolePermission.vue'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    },
    ElTree: {
      name: 'ElTree',
      template: '<div class="el-tree"></div>'
    }
  }
})

// Mock API endpoints
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    put: vi.fn()
  }
}))

vi.mock('@/api/endpoints', () => ({
  SYSTEM_ENDPOINTS: {
    PERMISSION_TREE: '/api/permissions/tree',
    ROLE_PERMISSIONS: (id: string) => `/api/roles/${id}/permissions`
  }
}))

describe('RolePermission.vue', () => {
  let wrapper: any

  const mockRole = {
    id: '1',
    name: '测试角色',
    description: '测试角色描述',
    status: 'active'
  }

  const mockPermissionTree = [
    {
      id: '1',
      name: '系统管理',
      code: 'system',
      type: 'menu',
      children: [
        {
          id: '1-1',
          name: '用户管理',
          code: 'system:user',
          type: 'menu',
          children: [
            {
              id: '1-1-1',
              name: '查看用户',
              code: 'system:user:view',
              type: 'button'
            },
            {
              id: '1-1-2',
              name: '新增用户',
              code: 'system:user:add',
              type: 'button'
            }
          ]
        }
      ]
    },
    {
      id: '2',
      name: '内容管理',
      code: 'content',
      type: 'menu',
      children: [
        {
          id: '2-1',
          name: '文章管理',
          code: 'content:article',
          type: 'menu',
          children: [
            {
              id: '2-1-1',
              name: '查看文章',
              code: 'content:article:view',
              type: 'button'
            }
          ]
        }
      ]
    }
  ]

  const createWrapper = (props = {}) => {
    return mount(RolePermission, {
      props: {
        visible: true,
        role: mockRole,
        ...props
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-dialog': true,
          'el-tree': true,
          'el-tag': true,
          'el-button': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders correctly with default props', () => {
      wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('displays role name in title', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.roleName).toBe(mockRole.name)
    })

    it('renders permission container', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.permission-container').exists()).toBe(true)
    })

    it('renders tree component', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.permissionTreeRef).toBeDefined()
    })

    it('renders bottom tip', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.bottom-tip').exists()).toBe(true)
    })

    it('renders dialog footer', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.dialog-footer').exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('watches visible prop changes', async () => {
      wrapper = createWrapper({ visible: false })
      
      expect(wrapper.vm.dialogVisible).toBe(false)
      
      await wrapper.setProps({ visible: true })
      await nextTick()
      
      expect(wrapper.vm.dialogVisible).toBe(true)
    })

    it('emits update:visible when dialogVisible changes', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ dialogVisible: false })
      
      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')[0]).toEqual([false])
    })

    it('loads permission tree when dialog becomes visible', async () => {
      wrapper = createWrapper({ visible: false })
      
      const loadPermissionTreeSpy = vi.spyOn(wrapper.vm, 'loadPermissionTree')
      
      await wrapper.setProps({ visible: true })
      await nextTick()
      
      expect(loadPermissionTreeSpy).toHaveBeenCalled()
    })

    it('loads role permissions when dialog becomes visible', async () => {
      wrapper = createWrapper({ visible: false })
      
      const loadRolePermissionsSpy = vi.spyOn(wrapper.vm, 'loadRolePermissions')
      
      await wrapper.setProps({ visible: true })
      await nextTick()
      
      expect(loadRolePermissionsSpy).toHaveBeenCalled()
    })
  })

  describe('Permission Tree Loading', () => {
    it('loads permission tree successfully', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.loadPermissionTree()
      
      expect(wrapper.vm.permissionTree).toHaveLength(2)
      expect(wrapper.vm.permissionTree[0].name).toBe('系统管理')
      expect(wrapper.vm.permissionTree[1].name).toBe('内容管理')
    })

    it('handles permission tree loading errors', async () => {
      wrapper = createWrapper()
      
      // Mock console.error to suppress error output during test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Simulate error in loadPermissionTree
      const originalLoadPermissionTree = wrapper.vm.loadPermissionTree
      wrapper.vm.loadPermissionTree = vi.fn().mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.loadPermissionTree()
      
      expect(consoleSpy).toHaveBeenCalledWith('加载权限树失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('加载权限树失败')
      
      // Restore original method
      wrapper.vm.loadPermissionTree = originalLoadPermissionTree
      consoleSpy.mockRestore()
    })

    it('has correct tree structure', () => {
      wrapper = createWrapper()
      
      // The component should have mock data by default
      const tree = wrapper.vm.permissionTree
      expect(tree).toHaveLength(2)
      
      const systemNode = tree[0]
      expect(systemNode.id).toBe('1')
      expect(systemNode.name).toBe('系统管理')
      expect(systemNode.children).toHaveLength(1)
      
      const userNode = systemNode.children[0]
      expect(userNode.id).toBe('1-1')
      expect(userNode.name).toBe('用户管理')
      expect(userNode.children).toHaveLength(2)
    })
  })

  describe('Role Permissions Loading', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('loads admin role permissions correctly', async () => {
      const adminRole = { ...mockRole, id: '1' }
      await wrapper.setProps({ role: adminRole })
      await wrapper.vm.loadRolePermissions()
      
      expect(wrapper.vm.checkedKeys).toHaveLength(15) // Admin should have all permissions
    })

    it('loads regular admin role permissions correctly', async () => {
      const regularAdminRole = { ...mockRole, id: '2' }
      await wrapper.setProps({ role: regularAdminRole })
      await wrapper.vm.loadRolePermissions()
      
      expect(wrapper.vm.checkedKeys).toHaveLength(11) // Regular admin should have partial permissions
    })

    it('loads teacher role permissions correctly', async () => {
      const teacherRole = { ...mockRole, id: '3' }
      await wrapper.setProps({ role: teacherRole })
      await wrapper.vm.loadRolePermissions()
      
      expect(wrapper.vm.checkedKeys).toHaveLength(4) // Teacher should have limited permissions
    })

    it('loads other role permissions correctly', async () => {
      const otherRole = { ...mockRole, id: '4' }
      await wrapper.setProps({ role: otherRole })
      await wrapper.vm.loadRolePermissions()
      
      expect(wrapper.vm.checkedKeys).toHaveLength(3) // Other roles should have minimal permissions
    })

    it('does not load permissions when role is null', async () => {
      await wrapper.setProps({ role: null })
      await wrapper.vm.loadRolePermissions()
      
      expect(wrapper.vm.checkedKeys).toHaveLength(0)
    })

    it('handles permission loading errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const originalLoadRolePermissions = wrapper.vm.loadRolePermissions
      wrapper.vm.loadRolePermissions = vi.fn().mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.loadRolePermissions()
      
      expect(consoleSpy).toHaveBeenCalledWith('加载角色权限失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('加载角色权限失败')
      
      wrapper.vm.loadRolePermissions = originalLoadRolePermissions
      consoleSpy.mockRestore()
    })
  })

  describe('Permission Type Handling', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('returns correct tag type for button permissions', () => {
      const tagType = wrapper.vm.getPermissionTypeTag('button')
      expect(tagType).toBe('success')
    })

    it('returns correct tag type for api permissions', () => {
      const tagType = wrapper.vm.getPermissionTypeTag('api')
      expect(tagType).toBe('info')
    })

    it('returns correct tag type for menu permissions', () => {
      const tagType = wrapper.vm.getPermissionTypeTag('menu')
      expect(tagType).toBe('primary')
    })

    it('returns default tag type for unknown permissions', () => {
      const tagType = wrapper.vm.getPermissionTypeTag('unknown')
      expect(tagType).toBe('info')
    })

    it('returns correct label for button permissions', () => {
      const label = wrapper.vm.getPermissionTypeLabel('button')
      expect(label).toBe('按钮')
    })

    it('returns correct label for api permissions', () => {
      const label = wrapper.vm.getPermissionTypeLabel('api')
      expect(label).toBe('接口')
    })

    it('returns correct label for menu permissions', () => {
      const label = wrapper.vm.getPermissionTypeLabel('menu')
      expect(label).toBe('菜单')
    })

    it('returns original type for unknown permissions', () => {
      const label = wrapper.vm.getPermissionTypeLabel('unknown')
      expect(label).toBe('unknown')
    })
  })

  describe('Tree Check Handling', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('handles check change events', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      wrapper.vm.handleCheckChange()
      
      expect(consoleSpy).toHaveBeenCalledWith('当前选中的权限:', [])
      
      consoleSpy.mockRestore()
    })

    it('works with null tree reference', () => {
      wrapper.vm.permissionTreeRef = null
      
      expect(() => {
        wrapper.vm.handleCheckChange()
      }).not.toThrow()
    })
  })

  describe('Form Submission', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('submits selected permissions successfully', async () => {
      // Mock tree reference
      wrapper.vm.permissionTreeRef = {
        getCheckedKeys: vi.fn().mockReturnValue(['1-1-1', '1-1-2']),
        getHalfCheckedKeys: vi.fn().mockReturnValue(['1-1', '1'])
      }
      
      await wrapper.vm.handleSubmit()
      
      expect(wrapper.emitted('success')).toBeTruthy()
      expect(wrapper.emitted('success')[0][0]).toEqual({
        ...mockRole,
        permissionIds: ['1-1-1', '1-1-2', '1-1', '1']
      })
      expect(wrapper.vm.dialogVisible).toBe(false)
      expect(ElMessage.success).toHaveBeenCalledWith('更新角色权限成功')
    })

    it('does not submit when role is null', async () => {
      await wrapper.setProps({ role: null })
      
      await wrapper.vm.handleSubmit()
      
      expect(wrapper.emitted('success')).toBeFalsy()
    })

    it('does not submit when tree reference is null', async () => {
      wrapper.vm.permissionTreeRef = null
      
      await wrapper.vm.handleSubmit()
      
      expect(wrapper.emitted('success')).toBeFalsy()
    })

    it('handles submission errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock tree reference
      wrapper.vm.permissionTreeRef = {
        getCheckedKeys: vi.fn().mockReturnValue(['1-1-1']),
        getHalfCheckedKeys: vi.fn().mockReturnValue(['1-1'])
      }
      
      // Mock Promise rejection
      const originalPromise = Promise
      vi.spyOn(global, 'Promise').mockImplementationOnce(() => {
        return originalPromise.reject(new Error('Network error'))
      })
      
      await wrapper.vm.handleSubmit()
      
      expect(consoleSpy).toHaveBeenCalledWith('更新角色权限失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('更新角色权限失败')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Dialog Close Handler', () => {
    it('closes dialog when handleClose is called', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleClose()
      
      expect(wrapper.vm.dialogVisible).toBe(false)
    })
  })

  describe('Tree Properties', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('has correct default props configuration', () => {
      expect(wrapper.vm.defaultProps).toEqual({
        children: 'children',
        label: 'name'
      })
    })

    it('configures tree with correct properties', () => {
      // The tree should be configured with the expected properties
      expect(wrapper.vm.permissionTree).toBeDefined()
      expect(wrapper.vm.checkedKeys).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined role gracefully', () => {
      wrapper = createWrapper({ role: undefined })
      expect(wrapper.vm.roleName).toBe('')
    })

    it('handles role without name gracefully', () => {
      const roleWithoutName = { ...mockRole, name: undefined }
      wrapper = createWrapper({ role: roleWithoutName })
      expect(wrapper.vm.roleName).toBe('')
    })

    it('handles immediate role change on mount', async () => {
      const loadPermissionTreeSpy = vi.spyOn(wrapper.vm, 'loadPermissionTree')
      const loadRolePermissionsSpy = vi.spyOn(wrapper.vm, 'loadRolePermissions')
      
      wrapper = createWrapper({ role: mockRole })
      await nextTick()
      
      expect(loadPermissionTreeSpy).toHaveBeenCalled()
      expect(loadRolePermissionsSpy).toHaveBeenCalled()
    })

    it('handles role change while dialog is open', async () => {
      const loadPermissionTreeSpy = vi.spyOn(wrapper.vm, 'loadPermissionTree')
      const loadRolePermissionsSpy = vi.spyOn(wrapper.vm, 'loadRolePermissions')
      
      const newRole = { ...mockRole, id: '2', name: '新角色' }
      await wrapper.setProps({ role: newRole })
      
      expect(loadPermissionTreeSpy).toHaveBeenCalled()
      expect(loadRolePermissionsSpy).toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('shows loading state during submission', async () => {
      wrapper = createWrapper()
      
      // Mock tree reference
      wrapper.vm.permissionTreeRef = {
        getCheckedKeys: vi.fn().mockReturnValue(['1-1-1']),
        getHalfCheckedKeys: vi.fn().mockReturnValue(['1-1'])
      }
      
      // Start submission
      const submitPromise = wrapper.vm.handleSubmit()
      
      // Check loading state
      expect(wrapper.vm.loading).toBe(true)
      
      // Wait for submission to complete
      await submitPromise
      
      // Check loading state is reset
      expect(wrapper.vm.loading).toBe(false)
    })
  })
})