/**
 * 组件测试辅助工具
 * 统一处理Vue组件测试中的Pinia、Router等依赖
 */

import { mount, VueWrapper, MountingOptions } from '@vue/test-utils'
import { createPinia, setActivePinia, Pinia } from 'pinia'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { Component, App } from 'vue'
import { vi } from 'vitest'

// 创建测试用的路由实例
function createTestRouter(): Router {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/test', component: { template: '<div>Test</div>' } }
    ]
  })
}

// 创建测试用的Pinia实例
function createTestPinia(): Pinia {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

// 组件测试包装器配置
interface ComponentTestOptions extends Omit<MountingOptions<any>, 'global'> {
  global?: {
    plugins?: any[]
    provide?: Record<string, any>
    mocks?: Record<string, any>
    stubs?: Record<string, any>
    components?: Record<string, Component>
    directives?: Record<string, any>
  }
  withPinia?: boolean
  withRouter?: boolean
  piniaOptions?: {
    initialState?: Record<string, any>
    stubActions?: boolean
  }
}

/**
 * 创建组件测试包装器
 * 自动处理Pinia和Router的集成
 */
export function createComponentWrapper<T extends Component>(
  component: T,
  options: ComponentTestOptions = {}
): VueWrapper<any> {
  const {
    withPinia = true,
    withRouter = false,
    piniaOptions = {},
    global = {},
    ...mountOptions
  } = options

  const plugins: any[] = global.plugins || []
  const provide: Record<string, any> = global.provide || {}

  // 添加Pinia支持
  if (withPinia) {
    const pinia = createTestPinia()
    plugins.push(pinia)

    // 如果有初始状态，设置到store中
    if (piniaOptions.initialState) {
      Object.entries(piniaOptions.initialState).forEach(([storeId, state]) => {
        const store = pinia._s.get(storeId)
        if (store) {
          Object.assign(store.$state, state)
        }
      })
    }
  }

  // 添加Router支持
  if (withRouter) {
    const router = createTestRouter()
    plugins.push(router)
  }

  // 合并全局配置
  const globalConfig = {
    ...global,
    plugins,
    provide,
    // 默认的全局组件stubs
    stubs: {
      'el-button': true,
      'el-dialog': true,
      'el-form': true,
      'el-form-item': true,
      'el-input': true,
      'el-select': true,
      'el-option': true,
      'el-transfer': true,
      'el-loading': true,
      'router-link': true,
      'router-view': true,
      ...global.stubs
    }
  }

  return mount(component, {
    global: globalConfig,
    ...mountOptions
  })
}

/**
 * 创建Store测试辅助工具
 */
export function createStoreTestHelper() {
  const pinia = createTestPinia()
  
  return {
    pinia,
    /**
     * 获取Store实例
     */
    getStore: <T>(useStore: () => T): T => {
      return useStore()
    },
    /**
     * 重置所有Store
     */
    resetStores: () => {
      pinia._s.forEach(store => {
        if (store.$reset) {
          store.$reset()
        }
      })
    },
    /**
     * 设置Store状态
     */
    setStoreState: (storeId: string, state: Record<string, any>) => {
      const store = pinia._s.get(storeId)
      if (store) {
        Object.assign(store.$state, state)
      }
    }
  }
}

/**
 * Mock用户权限辅助工具
 */
export function createPermissionMockHelper() {
  const mockPermissions = {
    roles: ['admin'],
    permissions: ['TEST_PERMISSION', 'USER_MANAGEMENT', 'SYSTEM_ADMIN'],
    isAdmin: true
  }

  return {
    mockPermissions,
    /**
     * 设置用户权限
     */
    setUserPermissions: (permissions: Partial<typeof mockPermissions>) => {
      Object.assign(mockPermissions, permissions)
    },
    /**
     * 重置权限为默认值
     */
    resetPermissions: () => {
      mockPermissions.roles = ['admin']
      mockPermissions.permissions = ['TEST_PERMISSION', 'USER_MANAGEMENT', 'SYSTEM_ADMIN']
      mockPermissions.isAdmin = true
    },
    /**
     * Mock权限检查函数
     */
    mockHasPermission: vi.fn((permission: string) => {
      return mockPermissions.permissions.includes(permission) || mockPermissions.isAdmin
    }),
    mockHasRole: vi.fn((role: string) => {
      return mockPermissions.roles.includes(role)
    })
  }
}

/**
 * 等待Vue组件更新
 */
export async function waitForUpdate(wrapper: VueWrapper<any>, timeout = 100): Promise<void> {
  await wrapper.vm.$nextTick()
  await new Promise(resolve => setTimeout(resolve, timeout))
}

/**
 * 触发组件事件并等待更新
 */
export async function triggerAndWait(
  wrapper: VueWrapper<any>, 
  selector: string, 
  event: string, 
  payload?: any
): Promise<void> {
  const element = wrapper.find(selector)
  await element.trigger(event, payload)
  await waitForUpdate(wrapper)
}

/**
 * 设置组件props并等待更新
 */
export async function setPropsAndWait(
  wrapper: VueWrapper<any>, 
  props: Record<string, any>
): Promise<void> {
  await wrapper.setProps(props)
  await waitForUpdate(wrapper)
}

/**
 * 模拟API响应
 */
export function createApiMockHelper() {
  return {
    /**
     * 创建成功响应
     */
    createSuccessResponse: (data: any = null) => ({
      success: true,
      data,
      message: 'Success'
    }),
    /**
     * 创建错误响应
     */
    createErrorResponse: (message = 'Error', code = 500) => ({
      success: false,
      data: null,
      message,
      code
    }),
    /**
     * 创建分页响应
     */
    createPaginatedResponse: (items: any[], total = items.length, page = 1, pageSize = 10) => ({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  }
}

/**
 * 测试环境清理工具
 */
export function createTestCleanup() {
  const cleanupTasks: (() => void)[] = []

  return {
    /**
     * 添加清理任务
     */
    addCleanup: (task: () => void) => {
      cleanupTasks.push(task)
    },
    /**
     * 执行所有清理任务
     */
    cleanup: () => {
      cleanupTasks.forEach(task => {
        try {
          task()
        } catch (error) {
          console.warn('Cleanup task failed:', error)
        }
      })
      cleanupTasks.length = 0
    }
  }
}

// 导出常用的测试工具
export {
  createTestPinia,
  createTestRouter
}
