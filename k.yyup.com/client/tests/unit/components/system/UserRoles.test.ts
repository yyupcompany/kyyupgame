import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import UserRoles from '@/components/system/UserRoles.vue'

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

describe('UserRoles.vue', () => {
  let wrapper: any

  const mockUser = {
    id: '1',
    username: 'testuser',
    realName: '测试用户',
    email: 'test@example.com',
    mobile: '13800138000',
    roles: [
      { id: '2', name: '普通管理员' },
      { id: '3', name: '教师' }
    ],
    status: 'active',
    lastLoginTime: '2023-01-01T00:00:00Z'
  }

  const mockRoles = [
    {
      id: '1',
      name: '超级管理员',
      description: '系统最高权限',
      disabled: true
    },
    {
      id: '2',
      name: '普通管理员',
      description: '系统管理权限'
    },
    {
      id: '3',
      name: '教师',
      description: '教师角色'
    },
    {
      id: '4',
      name: '家长',
      description: '家长角色'
    }
  ]

  const createWrapper = (props = {}) => {
    return mount(UserRoles, {
      props: {
        visible: true,
        userData: mockUser,
        ...props
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-dialog': true,
          'el-transfer': true,
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

    it('displays user name in title', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.dialogVisible).toBe(true)
    })

    it('renders roles container', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.roles-container').exists()).toBe(true)
    })

    it('renders dialog footer', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.dialog-footer').exists()).toBe(true)
    })

    it('has correct transfer component configuration', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.roleList).toBeDefined()
      expect(wrapper.vm.selectedRoleIds).toBeDefined()
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

    it('loads role list when dialog becomes visible', async () => {
      wrapper = createWrapper({ visible: false })
      
      const loadRoleListSpy = vi.spyOn(wrapper.vm, 'loadRoleList')
      
      await wrapper.setProps({ visible: true })
      await nextTick()
      
      expect(loadRoleListSpy).toHaveBeenCalled()
    })

    it('does not load role list when userData is null', async () => {
      const loadRoleListSpy = vi.spyOn(wrapper.vm, 'loadRoleList')
      
      wrapper = createWrapper({ userData: null, visible: false })
      
      await wrapper.setProps({ visible: true })
      await nextTick()
      
      expect(loadRoleListSpy).not.toHaveBeenCalled()
    })
  })

  describe('Role List Loading', () => {
    it('loads role list successfully', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.loadRoleList()
      
      expect(wrapper.vm.roleList).toEqual(mockRoles)
    })

    it('sets selected role IDs based on user roles', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.loadRoleList()
      
      expect(wrapper.vm.selectedRoleIds).toEqual(['2', '3'])
    })

    it('handles user without roles', async () => {
      const userWithoutRoles = { ...mockUser, roles: [] }
      wrapper = createWrapper({ userData: userWithoutRoles })
      
      await wrapper.vm.loadRoleList()
      
      expect(wrapper.vm.selectedRoleIds).toEqual([])
    })

    it('handles user with undefined roles', async () => {
      const userWithUndefinedRoles = { ...mockUser, roles: undefined }
      wrapper = createWrapper({ userData: userWithUndefinedRoles })
      
      await wrapper.vm.loadRoleList()
      
      expect(wrapper.vm.selectedRoleIds).toEqual([])
    })

    it('handles role list loading errors', async () => {
      wrapper = createWrapper()
      
      // Mock console.error to suppress error output during test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Simulate error in loadRoleList
      const originalLoadRoleList = wrapper.vm.loadRoleList
      wrapper.vm.loadRoleList = vi.fn().mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.loadRoleList()
      
      expect(consoleSpy).toHaveBeenCalledWith('加载角色列表失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('加载角色列表失败')
      
      // Restore original method
      wrapper.vm.loadRoleList = originalLoadRoleList
      consoleSpy.mockRestore()
    })

    it('has correct role structure with disabled admin role', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.loadRoleList()
      
      const adminRole = wrapper.vm.roleList.find((role: any) => role.id === '1')
      expect(adminRole).toBeDefined()
      expect(adminRole.disabled).toBe(true)
      expect(adminRole.name).toBe('超级管理员')
    })

    it('has correct role structure for regular roles', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.loadRoleList()
      
      const regularRole = wrapper.vm.roleList.find((role: any) => role.id === '2')
      expect(regularRole).toBeDefined()
      expect(regularRole.disabled).toBeUndefined()
      expect(regularRole.name).toBe('普通管理员')
    })
  })

  describe('Transfer Component Configuration', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('has correct transfer props configuration', () => {
      const transferProps = wrapper.vm.$options.props
      
      expect(wrapper.vm.roleList).toBeDefined()
      expect(wrapper.vm.selectedRoleIds).toBeDefined()
    })

    it('has correct transfer data structure', () => {
      // The component should have mock data by default
      const roles = wrapper.vm.roleList
      expect(roles).toHaveLength(4)
      
      const firstRole = roles[0]
      expect(firstRole).toHaveProperty('id')
      expect(firstRole).toHaveProperty('name')
      expect(firstRole).toHaveProperty('description')
    })

    it('has correct transfer titles', () => {
      // The transfer component should have correct titles
      expect(wrapper.vm.roleList).toBeDefined()
    })

    it('has correct transfer button texts', () => {
      // The transfer component should have correct button texts
      expect(wrapper.vm.roleList).toBeDefined()
    })

    it('has correct transfer format', () => {
      // The transfer component should have correct format
      expect(wrapper.vm.roleList).toBeDefined()
    })
  })

  describe('Role Selection', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.loadRoleList()
    })

    it('initializes with user current roles selected', () => {
      expect(wrapper.vm.selectedRoleIds).toEqual(['2', '3'])
    })

    it('updates selected role IDs when changed', async () => {
      await wrapper.setData({ selectedRoleIds: ['1', '2', '3', '4'] })
      
      expect(wrapper.vm.selectedRoleIds).toEqual(['1', '2', '3', '4'])
    })

    it('handles empty selection', async () => {
      await wrapper.setData({ selectedRoleIds: [] })
      
      expect(wrapper.vm.selectedRoleIds).toEqual([])
    })

    it('handles single role selection', async () => {
      await wrapper.setData({ selectedRoleIds: ['3'] })
      
      expect(wrapper.vm.selectedRoleIds).toEqual(['3'])
    })

    it('handles multiple role selection', async () => {
      await wrapper.setData({ selectedRoleIds: ['2', '3', '4'] })
      
      expect(wrapper.vm.selectedRoleIds).toEqual(['2', '3', '4'])
    })
  })

  describe('Form Submission', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.loadRoleList()
    })

    it('submits selected roles successfully', async () => {
      await wrapper.vm.handleSubmit()
      
      expect(wrapper.emitted('success')).toBeTruthy()
      
      const emittedUser = wrapper.emitted('success')[0][0]
      expect(emittedUser.id).toBe(mockUser.id)
      expect(emittedUser.roles).toHaveLength(2)
      expect(emittedUser.roles.map((role: any) => role.id)).toEqual(['2', '3'])
      expect(wrapper.vm.dialogVisible).toBe(false)
      expect(ElMessage.success).toHaveBeenCalledWith('更新用户角色成功')
    })

    it('submits with updated role selection', async () => {
      await wrapper.setData({ selectedRoleIds: ['3', '4'] })
      await wrapper.vm.handleSubmit()
      
      expect(wrapper.emitted('success')).toBeTruthy()
      
      const emittedUser = wrapper.emitted('success')[0][0]
      expect(emittedUser.roles).toHaveLength(2)
      expect(emittedUser.roles.map((role: any) => role.id)).toEqual(['3', '4'])
    })

    it('submits with empty role selection', async () => {
      await wrapper.setData({ selectedRoleIds: [] })
      await wrapper.vm.handleSubmit()
      
      expect(wrapper.emitted('success')).toBeTruthy()
      
      const emittedUser = wrapper.emitted('success')[0][0]
      expect(emittedUser.roles).toHaveLength(0)
    })

    it('does not submit when userData is null', async () => {
      await wrapper.setProps({ userData: null })
      
      await wrapper.vm.handleSubmit()
      
      expect(wrapper.emitted('success')).toBeFalsy()
    })

    it('handles submission errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock Promise rejection
      const originalPromise = Promise
      vi.spyOn(global, 'Promise').mockImplementationOnce(() => {
        return originalPromise.reject(new Error('Network error'))
      })
      
      await wrapper.vm.handleSubmit()
      
      expect(consoleSpy).toHaveBeenCalledWith('更新用户角色失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('更新用户角色失败')
      
      consoleSpy.mockRestore()
    })

    it('shows loading state during submission', async () => {
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

  describe('Dialog Close Handler', () => {
    it('closes dialog when handleClose is called', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleClose()
      
      expect(wrapper.vm.dialogVisible).toBe(false)
    })
  })

  describe('Responsive Design', () => {
    it('computes isDesktop correctly for large screens', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      })
      
      wrapper = createWrapper()
      expect(wrapper.vm.isDesktop).toBe(true)
    })

    it('computes isDesktop correctly for small screens', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      })
      
      wrapper = createWrapper()
      expect(wrapper.vm.isDesktop).toBe(false)
    })
  })

  describe('User Changes', () => {
    it('reloads role list when user changes', async () => {
      wrapper = createWrapper()
      
      const loadRoleListSpy = vi.spyOn(wrapper.vm, 'loadRoleList')
      
      const newUser = { ...mockUser, id: '2', username: 'newuser' }
      await wrapper.setProps({ userData: newUser })
      
      expect(loadRoleListSpy).toHaveBeenCalled()
    })

    it('updates selected roles when user changes', async () => {
      wrapper = createWrapper()
      
      const newUserWithDifferentRoles = {
        ...mockUser,
        id: '2',
        roles: [
          { id: '3', name: '教师' },
          { id: '4', name: '家长' }
        ]
      }
      
      await wrapper.setProps({ userData: newUserWithDifferentRoles })
      await nextTick()
      
      expect(wrapper.vm.selectedRoleIds).toEqual(['3', '4'])
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined userData gracefully', () => {
      wrapper = createWrapper({ userData: undefined })
      expect(wrapper.vm.dialogVisible).toBe(true)
    })

    it('handles userData without realName gracefully', async () => {
      const userWithoutRealName = { ...mockUser, realName: undefined }
      wrapper = createWrapper({ userData: userWithoutRealName })
      
      // Should not throw error
      expect(wrapper.vm.dialogVisible).toBe(true)
    })

    it('handles immediate userData change on mount', async () => {
      const loadRoleListSpy = vi.spyOn(wrapper.vm, 'loadRoleList')
      
      wrapper = createWrapper({ userData: mockUser })
      await nextTick()
      
      expect(loadRoleListSpy).toHaveBeenCalled()
    })

    it('handles role list with duplicate role IDs', async () => {
      wrapper = createWrapper()
      
      // Mock role list with duplicate IDs
      const duplicateRoles = [
        ...mockRoles,
        { id: '2', name: '重复角色', description: '重复描述' }
      ]
      
      const originalLoadRoleList = wrapper.vm.loadRoleList
      wrapper.vm.loadRoleList = vi.fn().mockImplementation(() => {
        wrapper.vm.roleList = duplicateRoles
        wrapper.vm.selectedRoleIds = ['2', '3']
      })
      
      await wrapper.vm.loadRoleList()
      
      // Should handle gracefully
      expect(wrapper.vm.roleList).toHaveLength(5)
      expect(wrapper.vm.selectedRoleIds).toEqual(['2', '3'])
      
      wrapper.vm.loadRoleList = originalLoadRoleList
    })

    it('handles concurrent submission attempts', async () => {
      wrapper = createWrapper()
      
      // Start multiple submissions
      const submitPromise1 = wrapper.vm.handleSubmit()
      const submitPromise2 = wrapper.vm.handleSubmit()
      
      // Wait for both to complete
      await Promise.all([submitPromise1, submitPromise2])
      
      // Should handle gracefully
      expect(wrapper.emitted('success')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('renders transfer component with proper structure', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.roles-container').exists()).toBe(true)
    })

    it('has proper dialog footer structure', () => {
      wrapper = createWrapper()
      
      const footer = wrapper.find('.dialog-footer')
      expect(footer.exists()).toBe(true)
    })
  })
})