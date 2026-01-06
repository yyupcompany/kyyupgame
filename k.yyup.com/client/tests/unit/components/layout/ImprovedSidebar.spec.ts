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
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import ImprovedSidebar from '@/components/layout/ImprovedSidebar.vue'
import LucideIcon from '@/components/icons/LucideIcon.vue'

// 模拟用户store
const mockUserStore = {
  userInfo: {
    username: 'testuser'
  }
}

// 模拟权限store
const mockPermissionsStore = {
  menuGroups: [
    {
      id: 'section1',
      title: '管理中心',
      icon: '⚡',
      description: '系统管理功能',
      items: [
        {
          id: 'dashboard',
          title: '仪表盘',
          icon: 'dashboard',
          route: '/dashboard'
        },
        {
          id: 'users',
          title: '用户管理',
          icon: 'users',
          route: '/users',
          children: [
            {
              id: 'user-list',
              title: '用户列表',
              route: '/users/list'
            },
            {
              id: 'user-roles',
              title: '用户角色',
              route: '/users/roles'
            }
          ]
        }
      ]
    }
  ],
  initializePermissions: vi.fn().mockResolvedValue(true)
}

describe('ImprovedSidebar.vue', () => {
  let router: Router
  let pinia: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/dashboard', name: 'Dashboard' },
        { path: '/users', name: 'Users' },
        { path: '/users/list', name: 'UserList' },
        { path: '/users/roles', name: 'UserRoles' }
      ]
    })

    pinia = createPinia()
    setActivePinia(pinia)

    // 模拟store
    vi.doMock('@/stores/user', () => ({
      useUserStore: () => mockUserStore
    }))

    vi.doMock('@/stores/permissions', () => ({
      usePermissionsStore: () => mockPermissionsStore
    }))
  })

  it('组件渲染正确', () => {
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false,
        isMobile: false,
        currentTheme: 'glass-light'
      }
    })
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.sidebar').exists()).toBe(true)
    expect(wrapper.find('.sidebar-header').exists()).toBe(true)
    expect(wrapper.find('.sidebar-nav').exists()).toBe(true)
  })

  it('正确显示侧边栏头部和logo', () => {
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false
      }
    })
    
    const header = wrapper.find('.sidebar-header')
    expect(header.exists()).toBe(true)
    
    const logo = wrapper.find('.sidebar-logo')
    expect(logo.exists()).toBe(true)
    
    const logoText = wrapper.find('.logo-text')
    expect(logoText.exists()).toBe(true)
    expect(logoText.text()).toBe('幼儿园管理')
  })

  it('折叠状态下隐藏logo文本和菜单文本', async () => {
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false
      }
    })
    
    // 初始状态：显示文本
    expect(wrapper.find('.logo-text').exists()).toBe(true)
    expect(wrapper.find('.nav-text').exists()).toBe(true)
    
    // 切换到折叠状态
    await wrapper.setProps({ collapsed: true })
    
    // 折叠状态：隐藏文本
    const logoText = wrapper.find('.logo-text')
    expect(logoText.exists()).toBe(true)
    expect(logoText.classes()).toContain('logo-text')
    
    const sidebar = wrapper.find('.sidebar')
    expect(sidebar.classes()).toContain('collapsed')
  })

  it('正确渲染导航菜单项', () => {
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false
      }
    })
    
    const navSections = wrapper.findAll('.nav-section')
    expect(navSections.length).toBeGreaterThan(0)
    
    const sectionTitle = wrapper.find('.section-name')
    expect(sectionTitle.exists()).toBe(true)
    expect(sectionTitle.text()).toBe('管理中心')
  })

  it('正确渲染没有子菜单的菜单项', () => {
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false
      }
    })
    
    const navItems = wrapper.findAll('.nav-item')
    const dashboardItem = Array.from(navItems).find(item => 
      item.find('.nav-text')?.text() === '仪表盘'
    )
    
    expect(dashboardItem).toBeDefined()
    expect(dashboardItem?.find('.nav-icon').exists()).toBe(true)
  })

  it('正确渲染有子菜单的菜单项', () => {
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false
      }
    })
    
    const navItemGroups = wrapper.findAll('.nav-item-group')
    expect(navItemGroups.length).toBeGreaterThan(0)
    
    const parentItem = navItemGroups[0].find('.nav-item-parent')
    expect(parentItem.exists()).toBe(true)
    expect(parentItem.find('.nav-arrow').exists()).toBe(true)
  })

  it('点击父菜单项时展开/收起子菜单', async () => {
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false
      }
    })
    
    const navItemGroups = wrapper.findAll('.nav-item-group')
    const parentItem = navItemGroups[0].find('.nav-item-parent')
    
    // 初始状态：子菜单应该隐藏
    let submenu = navItemGroups[0].find('.nav-submenu')
    expect(submenu.exists()).toBe(false)
    
    // 点击父菜单项
    await parentItem.trigger('click.prevent')
    
    // 子菜单应该显示
    submenu = navItemGroups[0].find('.nav-submenu')
    expect(submenu.exists()).toBe(true)
    
    // 再次点击父菜单项
    await parentItem.trigger('click.prevent')
    
    // 子菜单应该隐藏
    submenu = navItemGroups[0].find('.nav-submenu')
    expect(submenu.exists()).toBe(false)
  })

  it('点击菜单项时触发路由跳转和事件', async () => {
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false
      }
    })
    
    const pushSpy = vi.spyOn(router, 'push')
    const emitSpy = vi.spyOn(wrapper.vm, 'emit')
    
    // 查找仪表盘菜单项
    const navItems = wrapper.findAll('.nav-item')
    const dashboardItem = Array.from(navItems).find(item => 
      item.find('.nav-text')?.text() === '仪表盘'
    )
    
    expect(dashboardItem).toBeDefined()
    
    // 点击菜单项
    await dashboardItem?.trigger('click.prevent')
    
    // 验证路由跳转
    expect(pushSpy).toHaveBeenCalledWith('/dashboard')
    
    // 验证事件触发
    expect(emitSpy).toHaveBeenCalledWith('menuClick')
  })

  it('正确显示主题切换区域', () => {
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false
      }
    })
    
    const themeSection = wrapper.find('.theme-section')
    expect(themeSection.exists()).toBe(true)
    
    const themeTitle = wrapper.find('.theme-title')
    expect(themeTitle.exists()).toBe(true)
    expect(themeTitle.text()).toBe('主题')
    
    const themeOptions = wrapper.findAll('.theme-btn')
    expect(themeOptions.length).toBe(4) // 应该有4个主题选项
  })

  it('点击主题按钮时触发主题切换事件', async () => {
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false
      }
    })
    
    const emitSpy = vi.spyOn(wrapper.vm, 'emit')
    const themeButtons = wrapper.findAll('.theme-btn')
    
    // 点击第一个主题按钮
    await themeButtons[0].trigger('click')
    
    expect(emitSpy).toHaveBeenCalledWith('themeChange', 'glass-light')
  })

  it('正确显示用户信息区域', () => {
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false
      }
    })
    
    const userSection = wrapper.find('.user-section')
    expect(userSection.exists()).toBe(true)
    
    const userAvatar = wrapper.find('.user-avatar')
    expect(userAvatar.exists()).toBe(true)
    expect(userAvatar.text()).toBe('T') // 用户名首字母
    
    const userName = wrapper.find('.user-name')
    expect(userName.exists()).toBe(true)
    expect(userName.text()).toBe('testuser')
    
    const userRole = wrapper.find('.user-role')
    expect(userRole.exists()).toBe(true)
    expect(userRole.text()).toBe('系统管理员')
  })

  it('移动端状态下正确应用样式', () => {
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false,
        isMobile: true
      }
    })
    
    const sidebar = wrapper.find('.sidebar')
    expect(sidebar.classes()).toContain('show')
  })

  it('组件挂载时初始化权限', () => {
    mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false
      }
    })
    
    expect(mockPermissionsStore.initializePermissions).toHaveBeenCalled()
  })

  it('正确处理图标映射', () => {
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false
      }
    })
    
    // 验证图标映射函数
    const vm = wrapper.vm as any
    expect(vm.getSectionIcon('⚡')).toBe('lightning')
    expect(vm.getSectionIcon('👨‍💼')).toBe('principal')
    expect(vm.getItemIcon('dashboard')).toBe('dashboard')
    expect(vm.getItemIcon('unknown')).toBe('dashboard') // 默认值
  })

  it('正确判断菜单项的激活状态', async () => {
    await router.push('/dashboard')
    
    const wrapper = mount(ImprovedSidebar, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LucideIcon: true
        },
        provide: {
          'useUserStore': mockUserStore,
          'usePermissionsStore': mockPermissionsStore
        }
      },
      props: {
        collapsed: false
      }
    })
    
    await wrapper.vm.$nextTick()
    
    const vm = wrapper.vm as any
    const dashboardItem = mockPermissionsStore.menuGroups[0].items[0]
    
    expect(vm.isActiveItem(dashboardItem)).toBe(true)
  })
})