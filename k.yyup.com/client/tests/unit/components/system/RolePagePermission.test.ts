import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import RolePagePermission from '@/components/system/RolePagePermission.vue'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    }
  }
})

// Mock usePermissions composable
vi.mock('@/composables/usePermissions', () => ({
  usePermissions: () => ({
    loading: false,
    rolePages: { pages: [] },
    fetchRolePagePermissions: vi.fn(),
    updateRolePages: vi.fn()
  })
}))

describe('RolePagePermission.vue', () => {
  let wrapper: any

  const mockRole = {
    id: '1',
    name: '测试角色',
    description: '测试角色描述',
    status: 'active'
  }

  const mockPagePermissions = {
    pages: [
      { id: 1, name: '系统概览', code: 'system:dashboard:view' },
      { id: 2, name: '用户管理', code: 'system:user:manage' },
      { id: 3, name: '角色管理', code: 'system:role:manage' }
    ]
  }

  const createWrapper = (props = {}) => {
    return mount(RolePagePermission, {
      props: {
        visible: true,
        role: mockRole,
        ...props
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-dialog': true,
          'el-alert': true,
          'el-checkbox-group': true,
          'el-checkbox': true
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

    it('renders permission header with alert', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.permission-header').exists()).toBe(true)
    })

    it('renders permission list container', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.permission-list').exists()).toBe(true)
    })

    it('renders dialog footer with buttons', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.dialog-footer').exists()).toBe(true)
    })
  })

  describe('Page Groups', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('displays system management group', () => {
      const systemGroup = wrapper.vm.pageGroups.find((group: any) => group.name === '系统管理')
      expect(systemGroup).toBeDefined()
      expect(systemGroup.pages.length).toBe(8)
    })

    it('displays kindergarten management group', () => {
      const kindergartenGroup = wrapper.vm.pageGroups.find((group: any) => group.name === '幼儿园管理')
      expect(kindergartenGroup).toBeDefined()
      expect(kindergartenGroup.pages.length).toBe(4)
    })

    it('displays enrollment management group', () => {
      const enrollmentGroup = wrapper.vm.pageGroups.find((group: any) => group.name === '招生管理')
      expect(enrollmentGroup).toBeDefined()
      expect(enrollmentGroup.pages.length).toBe(3)
    })

    it('has correct page structure in groups', () => {
      wrapper = createWrapper()
      
      const systemGroup = wrapper.vm.pageGroups[0]
      const firstPage = systemGroup.pages[0]
      
      expect(firstPage).toEqual({
        id: 1,
        name: '系统概览',
        code: 'system:dashboard:view'
      })
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

    it('loads role page permissions when dialog becomes visible', async () => {
      const { usePermissions } = require('@/composables/usePermissions')
      const { fetchRolePagePermissions } = usePermissions()
      
      wrapper = createWrapper({ visible: false })
      
      await wrapper.setProps({ visible: true })
      await nextTick()
      
      expect(fetchRolePagePermissions).toHaveBeenCalledWith(mockRole.id)
    })

    it('does not load permissions when role is null', async () => {
      const { usePermissions } = require('@/composables/usePermissions')
      const { fetchRolePagePermissions } = usePermissions()
      
      wrapper = createWrapper({ role: null, visible: false })
      
      await wrapper.setProps({ visible: true })
      await nextTick()
      
      expect(fetchRolePagePermissions).not.toHaveBeenCalled()
    })
  })

  describe('Permission Loading', () => {
    it('loads role page permissions successfully', async () => {
      const { usePermissions } = require('@/composables/usePermissions')
      const { fetchRolePagePermissions } = usePermissions()
      
      fetchRolePagePermissions.mockResolvedValue(mockPagePermissions)
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(fetchRolePagePermissions).toHaveBeenCalledWith(mockRole.id)
      expect(wrapper.vm.selectedPageIds).toEqual([1, 2, 3])
    })

    it('handles empty page permissions', async () => {
      const { usePermissions } = require('@/composables/usePermissions')
      const { fetchRolePagePermissions } = usePermissions()
      
      fetchRolePagePermissions.mockResolvedValue({ pages: [] })
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.selectedPageIds).toEqual([])
    })

    it('handles permission loading errors', async () => {
      const { usePermissions } = require('@/composables/usePermissions')
      const { fetchRolePagePermissions } = usePermissions()
      
      fetchRolePagePermissions.mockRejectedValue(new Error('Network error'))
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(console.error).toHaveBeenCalledWith('加载角色页面权限失败:', expect.any(Error))
    })
  })

  describe('Form Submission', () => {
    it('submits selected page permissions', async () => {
      const { usePermissions } = require('@/composables/usePermissions')
      const { updateRolePages } = usePermissions()
      
      updateRolePages.mockResolvedValue(true)
      
      wrapper = createWrapper()
      await nextTick()
      
      await wrapper.setData({ selectedPageIds: [1, 2, 3] })
      await wrapper.vm.handleSubmit()
      
      expect(updateRolePages).toHaveBeenCalledWith(mockRole.id, [1, 2, 3])
    })

    it('emits success event on successful submission', async () => {
      const { usePermissions } = require('@/composables/usePermissions')
      const { updateRolePages } = usePermissions()
      
      updateRolePages.mockResolvedValue(true)
      
      wrapper = createWrapper()
      await nextTick()
      
      await wrapper.vm.handleSubmit()
      
      expect(wrapper.emitted('success')).toBeTruthy()
    })

    it('closes dialog on successful submission', async () => {
      const { usePermissions } = require('@/composables/usePermissions')
      const { updateRolePages } = usePermissions()
      
      updateRolePages.mockResolvedValue(true)
      
      wrapper = createWrapper()
      await nextTick()
      
      await wrapper.vm.handleSubmit()
      
      expect(wrapper.vm.dialogVisible).toBe(false)
    })

    it('does not submit when role is null', async () => {
      const { usePermissions } = require('@/composables/usePermissions')
      const { updateRolePages } = usePermissions()
      
      wrapper = createWrapper({ role: null })
      
      await wrapper.vm.handleSubmit()
      
      expect(updateRolePages).not.toHaveBeenCalled()
    })

    it('handles submission errors gracefully', async () => {
      const { usePermissions } = require('@/composables/usePermissions')
      const { updateRolePages } = usePermissions()
      
      updateRolePages.mockRejectedValue(new Error('Network error'))
      
      wrapper = createWrapper()
      await nextTick()
      
      await wrapper.vm.handleSubmit()
      
      expect(console.error).toHaveBeenCalledWith('保存角色页面权限失败:', expect.any(Error))
    })
  })

  describe('Dialog Close Handler', () => {
    it('resets selected page IDs when dialog is closed', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      await wrapper.setData({ selectedPageIds: [1, 2, 3] })
      await wrapper.vm.handleClose()
      
      expect(wrapper.vm.selectedPageIds).toEqual([])
    })
  })

  describe('Checkbox Group Binding', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('binds selectedPageIds to checkbox group', () => {
      expect(wrapper.vm.selectedPageIds).toEqual([])
    })

    it('updates selectedPageIds when checkboxes are selected', async () => {
      await wrapper.setData({ selectedPageIds: [1, 2] })
      expect(wrapper.vm.selectedPageIds).toEqual([1, 2])
    })

    it('handles empty selection', async () => {
      await wrapper.setData({ selectedPageIds: [] })
      expect(wrapper.vm.selectedPageIds).toEqual([])
    })

    it('handles single selection', async () => {
      await wrapper.setData({ selectedPageIds: [1] })
      expect(wrapper.vm.selectedPageIds).toEqual([1])
    })

    it('handles multiple selections', async () => {
      await wrapper.setData({ selectedPageIds: [1, 2, 3, 4, 5] })
      expect(wrapper.vm.selectedPageIds).toEqual([1, 2, 3, 4, 5])
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

    it('handles immediate visible change on mount', async () => {
      const { usePermissions } = require('@/composables/usePermissions')
      const { fetchRolePagePermissions } = usePermissions()
      
      wrapper = createWrapper({ visible: true })
      await nextTick()
      
      expect(fetchRolePagePermissions).toHaveBeenCalledWith(mockRole.id)
    })

    it('handles loading state correctly', async () => {
      const { usePermissions } = require('@/composables/usePermissions')
      const mockUsePermissions = usePermissions
      
      // Simulate loading state
      mockUsePermissions.mockReturnValueOnce({
        loading: true,
        rolePages: { pages: [] },
        fetchRolePagePermissions: vi.fn(),
        updateRolePages: vi.fn()
      })
      
      wrapper = createWrapper()
      
      expect(wrapper.find('.permission-list').attributes('loading')).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('renders alert with proper attributes', () => {
      wrapper = createWrapper()
      
      const alert = wrapper.find('.permission-header .el-alert')
      expect(alert.exists()).toBe(true)
    })

    it('renders checkbox group with proper structure', () => {
      wrapper = createWrapper()
      
      const checkboxGroup = wrapper.find('.permission-list .el-checkbox-group')
      expect(checkboxGroup.exists()).toBe(true)
    })

    it('renders permission items with proper labels', () => {
      wrapper = createWrapper()
      
      const permissionItems = wrapper.findAll('.permission-item')
      expect(permissionItems.length).toBeGreaterThan(0)
    })
  })
})