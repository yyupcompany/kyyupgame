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

describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PermissionSystemDemo from '@/components/examples/PermissionSystemDemo.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot name="header" /><slot /></div>'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot /></button>'
  },
  ElDivider: {
    name: 'ElDivider',
    template: '<div class="el-divider"><slot name="default" /></div>'
  },
  ElTag: {
    name: 'ElTag',
    template: '<span class="el-tag"><slot /></span>'
  },
  ElSpace: {
    name: 'ElSpace',
    template: '<div class="el-space"><slot /></div>'
  },
  ElDescriptions: {
    name: 'ElDescriptions',
    template: '<div class="el-descriptions"><slot /></div>'
  },
  ElDescriptionsItem: {
    name: 'ElDescriptionsItem',
    template: '<div class="el-descriptions-item"><slot /></div>'
  },
  ElMessage: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  }
}))

// Mock stores and composables
vi.mock('@/stores/permissions', () => ({
  usePermissionsStore: vi.fn()
}))

vi.mock('@/composables/usePagePermissions', () => ({
  usePagePermissions: vi.fn()
}))

describe('PermissionSystemDemo.vue', () => {
  let wrapper: any
  let mockPermissionsStore: any
  let mockPagePermissions: any

  const createMockPermissionsStore = (overrides = {}) => ({
    menuItems: [],
    userRoles: ['admin'],
    isAdmin: true,
    hasMenuItems: false,
    initializePermissions: vi.fn(),
    checkPagePermission: vi.fn(),
    ...overrides
  })

  const createMockPagePermissions = (overrides = {}) => ({
    hasPagePermissions: false,
    pagePermissions: null,
    actionPermissions: [],
    loadPagePermissions: vi.fn(),
    batchCheckPermissions: vi.fn(),
    ...overrides
  })

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockPermissionsStore = createMockPermissionsStore()
    mockPagePermissions = createMockPagePermissions()
    
    // @ts-ignore
    const { usePermissionsStore } = require('@/stores/permissions')
    // @ts-ignore
    const { usePagePermissions } = require('@/composables/usePagePermissions')
    
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    usePagePermissions.mockReturnValue(mockPagePermissions)
  })

  const createWrapper = () => {
    return mount(PermissionSystemDemo, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-card': true,
          'el-button': true,
          'el-divider': true,
          'el-tag': true,
          'el-space': true,
          'el-descriptions': true,
          'el-descriptions-item': true
        }
      }
    })
  }

  it('renders correctly', () => {
    wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-card').exists()).toBe(true)
  })

  it('initializes with correct default values', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.currentPath).toBe('/permission-demo')
    expect(wrapper.vm.pageId).toBe('2010')
    expect(wrapper.vm.pagePermissionLoading).toBe(false)
    expect(wrapper.vm.pagePermissionResult).toBe(null)
    expect(wrapper.vm.batchPermissionLoading).toBe(false)
    expect(wrapper.vm.batchPermissionResults).toBe(null)
  })

  it('sets up permissions store correctly', () => {
    wrapper = createWrapper()
    
    const { usePermissionsStore } = require('@/stores/permissions')
    expect(usePermissionsStore).toHaveBeenCalled()
  })

  it('sets up page permissions correctly', () => {
    wrapper = createWrapper()
    
    const { usePagePermissions } = require('@/composables/usePagePermissions')
    expect(usePagePermissions).toHaveBeenCalledWith('2010', '/permission-demo')
  })

  it('displays Level 1 menu permissions section', () => {
    wrapper = createWrapper()
    
    const level1Section = wrapper.findAll('.el-divider')[0]
    expect(level1Section.exists()).toBe(true)
    expect(level1Section.text()).toContain('Level 1: 菜单权限')
  })

  it('displays Level 2 page permissions section', () => {
    wrapper = createWrapper()
    
    const level2Section = wrapper.findAll('.el-divider')[1]
    expect(level2Section.exists()).toBe(true)
    expect(level2Section.text()).toContain('Level 2: 页面权限')
  })

  it('displays Level 3 page operation permissions section', () => {
    wrapper = createWrapper()
    
    const level3Section = wrapper.findAll('.el-divider')[2]
    expect(level3Section.exists()).toBe(true)
    expect(level3Section.text()).toContain('Level 3: 页面操作权限')
  })

  it('displays Level 4 button permissions section', () => {
    wrapper = createWrapper()
    
    const level4Section = wrapper.findAll('.el-divider')[3]
    expect(level4Section.exists()).toBe(true)
    expect(level4Section.text()).toContain('Level 4: 按钮权限')
  })

  it('shows menu items count in Level 1 section', () => {
    mockPermissionsStore = createMockPermissionsStore({
      menuItems: [{ id: 1 }, { id: 2 }],
      hasMenuItems: true
    })
    
    const { usePermissionsStore } = require('@/stores/permissions')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const level1Content = wrapper.findAll('.el-space')[0]
    expect(level1Content.text()).toContain('菜单项数量: 2')
  })

  it('shows user roles in Level 1 section', () => {
    mockPermissionsStore = createMockPermissionsStore({
      userRoles: ['admin', 'teacher']
    })
    
    const { usePermissionsStore } = require('@/stores/permissions')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const level1Content = wrapper.findAll('.el-space')[0]
    expect(level1Content.text()).toContain('用户角色: admin, teacher')
  })

  it('shows admin status in Level 1 section', () => {
    mockPermissionsStore = createMockPermissionsStore({
      isAdmin: true
    })
    
    const { usePermissionsStore } = require('@/stores/permissions')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const level1Content = wrapper.findAll('.el-space')[0]
    expect(level1Content.text()).toContain('管理员')
  })

  it('calls testPagePermission when test button is clicked', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      checkPagePermission: vi.fn().mockResolvedValue(true)
    })
    
    const { usePermissionsStore } = require('@/stores/permissions')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const testButton = wrapper.findAllComponents({ name: 'ElButton' })[0]
    await testButton.trigger('click')
    
    expect(mockPermissionsStore.checkPagePermission).toHaveBeenCalledWith(
      '/permission-demo',
      'STUDENT_MANAGEMENT'
    )
  })

  it('updates pagePermissionResult after test', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      checkPagePermission: vi.fn().mockResolvedValue(true)
    })
    
    const { usePermissionsStore } = require('@/stores/permissions')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const testButton = wrapper.findAllComponents({ name: 'ElButton' })[0]
    await testButton.trigger('click')
    
    expect(wrapper.vm.pagePermissionResult).toBe(true)
  })

  it('shows loading state during page permission test', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      checkPagePermission: vi.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve(true), 100))
      })
    })
    
    const { usePermissionsStore } = require('@/stores/permissions')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const testButton = wrapper.findAllComponents({ name: 'ElButton' })[0]
    await testButton.trigger('click')
    
    expect(wrapper.vm.pagePermissionLoading).toBe(true)
  })

  it('calls loadPagePermissions when load button is clicked', async () => {
    mockPagePermissions = createMockPagePermissions({
      loadPagePermissions: vi.fn().mockResolvedValue(undefined)
    })
    
    const { usePagePermissions } = require('@/composables/usePagePermissions')
    usePagePermissions.mockReturnValue(mockPagePermissions)
    
    wrapper = createWrapper()
    
    const loadButton = wrapper.findAllComponents({ name: 'ElButton' })[1]
    await loadButton.trigger('click')
    
    expect(mockPagePermissions.loadPagePermissions).toHaveBeenCalled()
  })

  it('calls batchCheckPermissions when batch test button is clicked', async () => {
    mockPagePermissions = createMockPagePermissions({
      batchCheckPermissions: vi.fn().mockResolvedValue({
        'EDIT_STUDENT': true,
        'DELETE_STUDENT': false
      })
    })
    
    const { usePagePermissions } = require('@/composables/usePagePermissions')
    usePagePermissions.mockReturnValue(mockPagePermissions)
    
    wrapper = createWrapper()
    
    const batchTestButton = wrapper.findAllComponents({ name: 'ElButton' })[5]
    await batchTestButton.trigger('click')
    
    expect(mockPagePermissions.batchCheckPermissions).toHaveBeenCalledWith([
      'EDIT_STUDENT',
      'DELETE_STUDENT',
      'VIEW_STUDENT',
      'EDIT_TEACHER',
      'DELETE_TEACHER',
      'ADMIN_ACCESS',
      'SYSTEM_CONFIG'
    ])
  })

  it('updates batchPermissionResults after batch test', async () => {
    const mockResults = {
      'EDIT_STUDENT': true,
      'DELETE_STUDENT': false
    }
    
    mockPagePermissions = createMockPagePermissions({
      batchCheckPermissions: vi.fn().mockResolvedValue(mockResults)
    })
    
    const { usePagePermissions } = require('@/composables/usePagePermissions')
    usePagePermissions.mockReturnValue(mockPagePermissions)
    
    wrapper = createWrapper()
    
    const batchTestButton = wrapper.findAllComponents({ name: 'ElButton' })[5]
    await batchTestButton.trigger('click')
    
    expect(wrapper.vm.batchPermissionResults).toEqual(mockResults)
  })

  it('displays page operation permissions when loaded', () => {
    mockPagePermissions = createMockPagePermissions({
      hasPagePermissions: true,
      pagePermissions: {
        summary: {
          total: 10,
          actions: 5,
          navigation: 3,
          operations: 2
        }
      },
      actionPermissions: [
        { id: 1, name: 'edit_student', chinese_name: '编辑学生' },
        { id: 2, name: 'delete_student', chinese_name: '删除学生' }
      ]
    })
    
    const { usePagePermissions } = require('@/composables/usePagePermissions')
    usePagePermissions.mockReturnValue(mockPagePermissions)
    
    wrapper = createWrapper()
    
    const level3Content = wrapper.findAll('.el-space')[1]
    expect(level3Content.text()).toContain('页面操作权限加载成功')
    expect(level3Content.text()).toContain('总计: 10')
    expect(level3Content.text()).toContain('操作: 5')
    expect(level3Content.text()).toContain('编辑学生')
    expect(level3Content.text()).toContain('删除学生')
  })

  it('shows empty state when page permissions not loaded', () => {
    mockPagePermissions = createMockPagePermissions({
      hasPagePermissions: false
    })
    
    const { usePagePermissions } = require('@/composables/usePagePermissions')
    usePagePermissions.mockReturnValue(mockPagePermissions)
    
    wrapper = createWrapper()
    
    const level3Content = wrapper.findAll('.el-space')[1]
    expect(level3Content.text()).toContain('点击上方按钮加载页面操作权限')
  })

  it('displays permission examples for different directive types', () => {
    wrapper = createWrapper()
    
    const permissionExamples = wrapper.find('.permission-examples')
    expect(permissionExamples.exists()).toBe(true)
    
    const exampleGroups = permissionExamples.findAll('.example-group')
    expect(exampleGroups.length).toBeGreaterThan(0)
  })

  it('shows real-time permission status', () => {
    mockPermissionsStore = createMockPermissionsStore({
      menuItems: [{ id: 1 }, { id: 2 }],
      userRoles: ['admin'],
      isAdmin: true,
      hasMenuItems: true
    })
    
    mockPagePermissions = createMockPagePermissions({
      hasPagePermissions: true,
      pagePermissions: {
        summary: { total: 10 }
      }
    })
    
    const { usePermissionsStore } = require('@/stores/permissions')
    const { usePagePermissions } = require('@/composables/usePagePermissions')
    
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    usePagePermissions.mockReturnValue(mockPagePermissions)
    
    wrapper = createWrapper()
    
    const statusCard = wrapper.findAll('.el-card')[1]
    expect(statusCard.text()).toContain('实时权限状态')
    expect(statusCard.text()).toContain('2个')
    expect(statusCard.text()).toContain('admin')
    expect(statusCard.text()).toContain('是')
    expect(statusCard.text()).toContain('10个')
  })

  it('initializes permissions on mount', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      initializePermissions: vi.fn().mockResolvedValue(undefined)
    })
    
    const { usePermissionsStore } = require('@/stores/permissions')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    await wrapper.vm.$nextTick()
    
    expect(mockPermissionsStore.initializePermissions).toHaveBeenCalled()
  })

  it('handles permission initialization error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockPermissionsStore = createMockPermissionsStore({
      initializePermissions: vi.fn().mockRejectedValue(new Error('Init error'))
    })
    
    const { usePermissionsStore } = require('@/stores/permissions')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    await wrapper.vm.$nextTick()
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '权限初始化失败:',
      expect.any(Error)
    )
    consoleSpy.mockRestore()
  })
})