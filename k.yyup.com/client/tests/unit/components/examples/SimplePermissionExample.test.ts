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
import SimplePermissionExample from '@/components/examples/SimplePermissionExample.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot /></div>'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot /></button>'
  },
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock permissions store
vi.mock('@/stores/permissions-simple', () => ({
  usePermissionsStore: vi.fn()
}))

describe('SimplePermissionExample.vue', () => {
  let wrapper: any
  let mockPermissionsStore: any

  const createMockPermissionsStore = (overrides = {}) => ({
    hasPermission: vi.fn(),
    hasPermissions: vi.fn(),
    hasRole: vi.fn(),
    ...overrides
  })

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockPermissionsStore = createMockPermissionsStore()
    
    // @ts-ignore
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
  })

  const createWrapper = () => {
    return mount(SimplePermissionExample, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-card': true,
          'el-button': true
        }
      }
    })
  }

  it('renders correctly', () => {
    wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-card').exists()).toBe(true)
  })

  it('initializes with empty check results', () => {
    wrapper = createWrapper()
    expect(wrapper.vm.checkResults).toEqual([])
  })

  it('sets up permissions store correctly', () => {
    wrapper = createWrapper()
    
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    expect(usePermissionsStore).toHaveBeenCalled()
  })

  it('displays permission directive usage section', () => {
    wrapper = createWrapper()
    
    const directiveSection = wrapper.findAll('.permission-section')[0]
    expect(directiveSection.exists()).toBe(true)
    expect(directiveSection.find('h3').text()).toBe('📋 权限指令使用')
  })

  it('displays programmatic permission check section', () => {
    wrapper = createWrapper()
    
    const programmaticSection = wrapper.findAll('.permission-section')[1]
    expect(programmaticSection.exists()).toBe(true)
    expect(programmaticSection.find('h3').text()).toBe('💻 编程式权限检查')
  })

  it('displays permission code reference section', () => {
    wrapper = createWrapper()
    
    const referenceSection = wrapper.findAll('.permission-section')[2]
    expect(referenceSection.exists()).toBe(true)
    expect(referenceSection.find('h3').text()).toBe('📚 常用权限代码参考')
  })

  it('calls checkSinglePermission when single permission button is clicked', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      hasPermission: vi.fn().mockResolvedValue(true)
    })
    
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const singlePermissionButton = wrapper.findAllComponents({ name: 'ElButton' })[0]
    await singlePermissionButton.trigger('click')
    
    expect(mockPermissionsStore.hasPermission).toHaveBeenCalledWith('EDIT_STUDENT')
  })

  it('adds result for single permission check', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      hasPermission: vi.fn().mockResolvedValue(true)
    })
    
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const singlePermissionButton = wrapper.findAllComponents({ name: 'ElButton' })[0]
    await singlePermissionButton.trigger('click')
    
    expect(wrapper.vm.checkResults.length).toBe(1)
    expect(wrapper.vm.checkResults[0].message).toBe('EDIT_STUDENT 权限: ✅ 有权限')
    expect(wrapper.vm.checkResults[0].success).toBe(true)
  })

  it('handles single permission check failure', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      hasPermission: vi.fn().mockResolvedValue(false)
    })
    
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const singlePermissionButton = wrapper.findAllComponents({ name: 'ElButton' })[0]
    await singlePermissionButton.trigger('click')
    
    expect(wrapper.vm.checkResults[0].message).toBe('EDIT_STUDENT 权限: ❌ 无权限')
    expect(wrapper.vm.checkResults[0].success).toBe(false)
  })

  it('calls checkMultiplePermissions when multiple permissions button is clicked', async () => {
    const mockResults = {
      'EDIT_STUDENT': true,
      'DELETE_STUDENT': false,
      'VIEW_TEACHER': true
    }
    
    mockPermissionsStore = createMockPermissionsStore({
      hasPermissions: vi.fn().mockResolvedValue(mockResults)
    })
    
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const multiplePermissionsButton = wrapper.findAllComponents({ name: 'ElButton' })[1]
    await multiplePermissionsButton.trigger('click')
    
    expect(mockPermissionsStore.hasPermissions).toHaveBeenCalledWith([
      'EDIT_STUDENT',
      'DELETE_STUDENT',
      'VIEW_TEACHER'
    ])
  })

  it('adds results for multiple permission check', async () => {
    const mockResults = {
      'EDIT_STUDENT': true,
      'DELETE_STUDENT': false,
      'VIEW_TEACHER': true
    }
    
    mockPermissionsStore = createMockPermissionsStore({
      hasPermissions: vi.fn().mockResolvedValue(mockResults)
    })
    
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const multiplePermissionsButton = wrapper.findAllComponents({ name: 'ElButton' })[1]
    await multiplePermissionsButton.trigger('click')
    
    expect(wrapper.vm.checkResults.length).toBe(3)
    expect(wrapper.vm.checkResults[0].message).toBe('EDIT_STUDENT: ✅ 有权限')
    expect(wrapper.vm.checkResults[1].message).toBe('DELETE_STUDENT: ❌ 无权限')
    expect(wrapper.vm.checkResults[2].message).toBe('VIEW_TEACHER: ✅ 有权限')
  })

  it('calls checkRolePermission when role permission button is clicked', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      hasRole: vi.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
    })
    
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const rolePermissionButton = wrapper.findAllComponents({ name: 'ElButton' })[2]
    await rolePermissionButton.trigger('click')
    
    expect(mockPermissionsStore.hasRole).toHaveBeenCalledWith('admin')
    expect(mockPermissionsStore.hasRole).toHaveBeenCalledWith('teacher')
  })

  it('adds results for role permission check', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      hasRole: vi.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
    })
    
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const rolePermissionButton = wrapper.findAllComponents({ name: 'ElButton' })[2]
    await rolePermissionButton.trigger('click')
    
    expect(wrapper.vm.checkResults.length).toBe(2)
    expect(wrapper.vm.checkResults[0].message).toBe('管理员角色: ✅ 是')
    expect(wrapper.vm.checkResults[0].success).toBe(true)
    expect(wrapper.vm.checkResults[1].message).toBe('教师角色: ❌ 否')
    expect(wrapper.vm.checkResults[1].success).toBe(false)
  })

  it('displays check results when available', () => {
    wrapper = createWrapper()
    wrapper.vm.checkResults = [
      {
        id: 1,
        message: 'EDIT_STUDENT: ✅ 有权限',
        success: true
      },
      {
        id: 2,
        message: 'DELETE_STUDENT: ❌ 无权限',
        success: false
      }
    ]
    
    const resultsDiv = wrapper.find('.results')
    expect(resultsDiv.exists()).toBe(true)
    
    const tags = resultsDiv.findAll('.el-tag')
    expect(tags.length).toBe(2)
    expect(tags[0].text()).toBe('EDIT_STUDENT: ✅ 有权限')
    expect(tags[1].text()).toBe('DELETE_STUDENT: ❌ 无权限')
  })

  it('shows permission code reference tables', () => {
    wrapper = createWrapper()
    
    const referenceSection = wrapper.findAll('.permission-section')[2]
    const columns = referenceSection.findAll('.el-col')
    
    expect(columns.length).toBe(3)
    
    // Check student management permissions
    const studentColumn = columns[0]
    expect(studentColumn.find('h4').text()).toBe('学生管理')
    expect(studentColumn.text()).toContain('EDIT_STUDENT')
    expect(studentColumn.text()).toContain('DELETE_STUDENT')
    expect(studentColumn.text()).toContain('VIEW_STUDENT')
    expect(studentColumn.text()).toContain('EXPORT_STUDENT')
    
    // Check teacher management permissions
    const teacherColumn = columns[1]
    expect(teacherColumn.find('h4').text()).toBe('教师管理')
    expect(teacherColumn.text()).toContain('EDIT_TEACHER')
    expect(teacherColumn.text()).toContain('DELETE_TEACHER')
    expect(teacherColumn.text()).toContain('VIEW_TEACHER')
    expect(teacherColumn.text()).toContain('MANAGE_PERFORMANCE')
    
    // Check system management permissions
    const systemColumn = columns[2]
    expect(systemColumn.find('h4').text()).toBe('系统管理')
    expect(systemColumn.text()).toContain('ADMIN_ACCESS')
    expect(systemColumn.text()).toContain('SYSTEM_CONFIG')
    expect(systemColumn.text()).toContain('USER_MANAGEMENT')
    expect(systemColumn.text()).toContain('BACKUP_DATA')
  })

  it('shows success message for single permission check', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      hasPermission: vi.fn().mockResolvedValue(true)
    })
    
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const singlePermissionButton = wrapper.findAllComponents({ name: 'ElButton' })[0]
    await singlePermissionButton.trigger('click')
    
    const { ElMessage } = require('element-plus')
    expect(ElMessage.success).toHaveBeenCalledWith('单个权限检查完成')
  })

  it('shows success message for multiple permission check', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      hasPermissions: vi.fn().mockResolvedValue({
        'EDIT_STUDENT': true,
        'DELETE_STUDENT': false
      })
    })
    
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const multiplePermissionsButton = wrapper.findAllComponents({ name: 'ElButton' })[1]
    await multiplePermissionsButton.trigger('click')
    
    const { ElMessage } = require('element-plus')
    expect(ElMessage.success).toHaveBeenCalledWith('批量权限检查完成')
  })

  it('shows success message for role permission check', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      hasRole: vi.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
    })
    
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const rolePermissionButton = wrapper.findAllComponents({ name: 'ElButton' })[2]
    await rolePermissionButton.trigger('click')
    
    const { ElMessage } = require('element-plus')
    expect(ElMessage.success).toHaveBeenCalledWith('角色权限检查完成')
  })

  it('handles permission check errors gracefully', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      hasPermission: vi.fn().mockRejectedValue(new Error('Permission check failed'))
    })
    
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const singlePermissionButton = wrapper.findAllComponents({ name: 'ElButton' })[0]
    await singlePermissionButton.trigger('click')
    
    const { ElMessage } = require('element-plus')
    expect(ElMessage.error).toHaveBeenCalledWith('权限检查失败')
  })

  it('has unique IDs for check results', async () => {
    mockPermissionsStore = createMockPermissionsStore({
      hasPermission: vi.fn().mockResolvedValue(true)
    })
    
    const { usePermissionsStore } = require('@/stores/permissions-simple')
    usePermissionsStore.mockReturnValue(mockPermissionsStore)
    
    wrapper = createWrapper()
    
    const singlePermissionButton = wrapper.findAllComponents({ name: 'ElButton' })[0]
    await singlePermissionButton.trigger('click')
    
    const rolePermissionButton = wrapper.findAllComponents({ name: 'ElButton' })[2]
    await rolePermissionButton.trigger('click')
    
    expect(wrapper.vm.checkResults.length).toBe(3)
    const ids = wrapper.vm.checkResults.map((result: any) => result.id)
    expect(new Set(ids).size).toBe(3) // All IDs should be unique
  })
})