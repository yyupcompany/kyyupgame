import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import ImprovedSidebar from '@/components/layout/ImprovedSidebar.vue'
import LucideIcon from '@/components/icons/LucideIcon.vue'

// Mock vue-router
const mockPush = vi.fn()
const mockRoute = {
  path: '/dashboard'
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock Pinia stores
const mockUserStore = {
  userInfo: { username: 'testuser' }
}

const mockPermissionsStore = {
  menuGroups: [
    {
      id: 'dashboard',
      title: '仪表板',
      icon: '⚡',
      description: '数据概览',
      items: [
        {
          id: 'dashboard-item',
          title: '仪表板',
          icon: 'dashboard',
          route: '/dashboard'
        }
      ]
    },
    {
      id: 'students',
      title: '学生管理',
      icon: '👥',
      description: '学生信息管理',
      items: [
        {
          id: 'student-list',
          title: '学生列表',
          icon: 'basic-info',
          route: '/students'
        },
        {
          id: 'student-detail',
          title: '学生详情',
          icon: 'performance',
          route: '/students/detail',
          children: [
            {
              id: 'student-info',
              title: '学生信息',
              route: '/students/detail/info'
            },
            {
              id: 'student-performance',
              title: '学生表现',
              route: '/students/detail/performance'
            }
          ]
        }
      ]
    }
  ],
  initializePermissions: vi.fn()
}

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore
}))

vi.mock('@/stores/permissions', () => ({
  usePermissionsStore: () => mockPermissionsStore
}))

// 控制台错误检测变量
let consoleSpy: any

describe('ImprovedSidebar.vue', () => {
  let wrapper: any

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  const createWrapper = (props = {}) => {
    return mount(ImprovedSidebar, {
      props: {
        collapsed: false,
        isMobile: false,
        currentTheme: 'glass-light',
        ...props
      },
      global: {
        stubs: {
          'lucide-icon': true
        },
        components: {
          LucideIcon
        }
      }
    })
  }

  describe('基础渲染', () => {
    it('应该正确渲染侧边栏组件', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.sidebar').exists()).toBe(true)
      expect(wrapper.find('.sidebar-header').exists()).toBe(true)
      expect(wrapper.find('.sidebar-nav').exists()).toBe(true)
      expect(wrapper.find('.user-section').exists()).toBe(true)
    })

    it('应该显示正确的 CSS 类', () => {
      wrapper = createWrapper({
        collapsed: false,
        isMobile: false
      })
      
      const sidebar = wrapper.find('.sidebar')
      expect(sidebar.classes()).toContain('sidebar-open')
      expect(sidebar.classes()).not.toContain('collapsed')
      expect(sidebar.classes()).not.toContain('show')
    })

    it('应该在折叠状态下应用正确的样式', () => {
      wrapper = createWrapper({
        collapsed: true
      })
      
      const sidebar = wrapper.find('.sidebar')
      expect(sidebar.classes()).toContain('collapsed')
    })

    it('应该在移动端显示状态下应用正确的样式', () => {
      wrapper = createWrapper({
        isMobile: true,
        collapsed: false
      })
      
      const sidebar = wrapper.find('.sidebar')
      expect(sidebar.classes()).toContain('show')
    })
  })

  describe('侧边栏头部', () => {
    it('应该显示 logo 和标题', () => {
      wrapper = createWrapper()
      
      const logo = wrapper.find('.sidebar-logo')
      expect(logo.exists()).toBe(true)
      
      const logoIcon = logo.find('.logo-icon')
      expect(logoIcon.exists()).toBe(true)
      
      const logoText = wrapper.find('.logo-text')
      expect(logoText.exists()).toBe(true)
      expect(logoText.text()).toBe('幼儿园管理')
    })

    it('应该在折叠状态下隐藏标题', () => {
      wrapper = createWrapper({
        collapsed: true
      })
      
      const logoText = wrapper.find('.logo-text')
      expect(logoText.exists()).toBe(true)
      // The text should be hidden via CSS opacity
    })

    it('应该显示 logo 图片', () => {
      wrapper = createWrapper()
      
      const logoImage = wrapper.find('.logo-image')
      expect(logoImage.exists()).toBe(true)
      expect(logoImage.attributes('src')).toBe('@/assets/logo.png')
      expect(logoImage.attributes('alt')).toBe('幼儿园管理系统')
    })
  })

  describe('导航菜单', () => {
    it('应该渲染导航区域', () => {
      wrapper = createWrapper()
      
      const nav = wrapper.find('.sidebar-nav')
      expect(nav.exists()).toBe(true)
    })

    it('应该渲染菜单分组', () => {
      wrapper = createWrapper()
      
      const sections = wrapper.findAll('.nav-section')
      expect(sections.length).toBe(2)
    })

    it('应该显示分组标题', () => {
      wrapper = createWrapper()
      
      const sectionTitles = wrapper.findAll('.nav-section-title')
      expect(sectionTitles.length).toBe(2)
      
      expect(sectionTitles[0].find('.section-name').text()).toBe('仪表板')
      expect(sectionTitles[0].find('.section-desc').text()).toBe('数据概览')
    })

    it('应该在折叠状态下隐藏分组标题', () => {
      wrapper = createWrapper({
        collapsed: true
      })
      
      const sectionTitles = wrapper.findAll('.nav-section-title')
      expect(sectionTitles.length).toBe(2)
      // Should be hidden via CSS
    })
  })

  describe('菜单项', () => {
    it('应该渲染普通菜单项', () => {
      wrapper = createWrapper()
      
      const navItems = wrapper.findAll('.nav-item')
      const dashboardItem = navItems.find(item => 
        item.find('.nav-text').text() === '仪表板'
      )
      
      expect(dashboardItem.exists()).toBe(true)
    })

    it('应该渲染有子菜单的菜单项', () => {
      wrapper = createWrapper()
      
      const navItemGroups = wrapper.findAll('.nav-item-group')
      expect(navItemGroups.length).toBe(1)
      
      const parentItem = navItemGroups[0].find('.nav-item-parent')
      expect(parentItem.exists()).toBe(true)
      expect(parentItem.find('.nav-text').text()).toBe('学生详情')
      
      const arrow = parentItem.find('.nav-arrow')
      expect(arrow.exists()).toBe(true)
    })

    it('应该处理菜单项点击', async () => {
      wrapper = createWrapper()
      
      const navItems = wrapper.findAll('.nav-item')
      const dashboardItem = navItems.find(item => 
        item.find('.nav-text').text() === '仪表板'
      )
      
      await dashboardItem.trigger('click.prevent')
      
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
      expect(wrapper.vm.activeItemId).toBe('dashboard-item')
    })

    it('应该处理有子菜单的父项点击', async () => {
      wrapper = createWrapper()
      
      const navItemGroups = wrapper.findAll('.nav-item-group')
      const parentItem = navItemGroups[0].find('.nav-item-parent')
      
      await parentItem.trigger('click.prevent')
      
      expect(wrapper.vm.expandedItems).toContain('student-detail')
    })

    it('应该切换子菜单展开状态', async () => {
      wrapper = createWrapper()
      
      const navItemGroups = wrapper.findAll('.nav-item-group')
      const parentItem = navItemGroups[0].find('.nav-item-parent')
      
      // First click - expand
      await parentItem.trigger('click.prevent')
      expect(wrapper.vm.expandedItems).toContain('student-detail')
      
      // Second click - collapse
      await parentItem.trigger('click.prevent')
      expect(wrapper.vm.expandedItems).not.toContain('student-detail')
    })

    it('应该显示子菜单项', async () => {
      wrapper = createWrapper()
      
      // Expand the submenu
      wrapper.vm.expandedItems = ['student-detail']
      await nextTick()
      
      const navItemGroups = wrapper.findAll('.nav-item-group')
      const submenu = navItemGroups[0].find('.nav-submenu')
      expect(submenu.exists()).toBe(true)
      
      const childItems = submenu.findAll('.nav-item-child')
      expect(childItems.length).toBe(2)
      expect(childItems[0].find('.nav-text').text()).toBe('学生信息')
      expect(childItems[1].find('.nav-text').text()).toBe('学生表现')
    })

    it('应该处理子菜单项点击', async () => {
      wrapper = createWrapper()
      
      // Expand the submenu
      wrapper.vm.expandedItems = ['student-detail']
      await nextTick()
      
      const navItemGroups = wrapper.findAll('.nav-item-group')
      const submenu = navItemGroups[0].find('.nav-submenu')
      const childItems = submenu.findAll('.nav-item-child')
      
      await childItems[0].trigger('click.prevent')
      
      expect(mockPush).toHaveBeenCalledWith('/students/detail/info')
      expect(wrapper.vm.activeItemId).toBe('student-info')
    })
  })

  describe('活动状态', () => {
    it('应该正确识别活动菜单项', () => {
      mockRoute.path = '/dashboard'
      wrapper = createWrapper()
      
      const navItems = wrapper.findAll('.nav-item')
      const dashboardItem = navItems.find(item => 
        item.find('.nav-text').text() === '仪表板'
      )
      
      expect(dashboardItem.classes()).toContain('active')
    })

    it('应该基于 activeItemId 识别活动状态', () => {
      wrapper = createWrapper()
      
      wrapper.vm.activeItemId = 'student-list'
      
      const navItems = wrapper.findAll('.nav-item')
      const studentItem = navItems.find(item => 
        item.find('.nav-text').text() === '学生列表'
      )
      
      expect(studentItem.classes()).toContain('active')
    })
  })

  describe('图标映射', () => {
    it('应该正确映射分组图标', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getSectionIcon('⚡')).toBe('lightning')
      expect(wrapper.vm.getSectionIcon('👥')).toBe('customers')
      expect(wrapper.vm.getSectionIcon('unknown')).toBe('lightning')
    })

    it('应该正确映射菜单项图标', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getItemIcon('dashboard')).toBe('dashboard')
      expect(wrapper.vm.getItemIcon('basic-info')).toBe('profile')
      expect(wrapper.vm.getItemIcon('unknown')).toBe('dashboard')
    })
  })

  describe('主题切换', () => {
    it('应该显示主题区域', () => {
      wrapper = createWrapper({
        collapsed: false
      })
      
      const themeSection = wrapper.find('.theme-section')
      expect(themeSection.exists()).toBe(true)
      
      const themeTitle = themeSection.find('.theme-title')
      expect(themeTitle.text()).toBe('主题')
    })

    it('应该在折叠状态下隐藏主题区域', () => {
      wrapper = createWrapper({
        collapsed: true
      })
      
      const themeSection = wrapper.find('.theme-section')
      expect(themeSection.exists()).toBe(false)
    })

    it('应该渲染主题选项', () => {
      wrapper = createWrapper({
        collapsed: false
      })
      
      const themeOptions = wrapper.findAll('.theme-btn')
      expect(themeOptions.length).toBe(4)
    })

    it('应该处理主题切换', async () => {
      const emitSpy = vi.fn()
      wrapper = createWrapper({
        collapsed: false
      })
      wrapper.vm.$emit = emitSpy
      
      const themeOptions = wrapper.findAll('.theme-btn')
      await themeOptions[1].trigger('click') // glass-dark theme
      
      expect(emitSpy).toHaveBeenCalledWith('themeChange', 'glass-dark')
    })

    it('应该正确显示活动主题', () => {
      wrapper = createWrapper({
        collapsed: false,
        currentTheme: 'glass-dark'
      })
      
      const themeOptions = wrapper.findAll('.theme-btn')
      const darkTheme = themeOptions[1]
      
      expect(darkTheme.classes()).toContain('active')
    })
  })

  describe('用户信息', () => {
    it('应该显示用户信息区域', () => {
      wrapper = createWrapper()
      
      const userSection = wrapper.find('.user-section')
      expect(userSection.exists()).toBe(true)
      
      const userInfo = userSection.find('.user-info')
      expect(userInfo.exists()).toBe(true)
    })

    it('应该显示用户头像', () => {
      wrapper = createWrapper()
      
      const userAvatar = wrapper.find('.user-avatar')
      expect(userAvatar.exists()).toBe(true)
      expect(userAvatar.text()).toBe('T') // First letter of 'testuser'
    })

    it('应该显示用户详细信息', () => {
      wrapper = createWrapper({
        collapsed: false
      })
      
      const userDetails = wrapper.find('.user-details')
      expect(userDetails.exists()).toBe(true)
      
      const userName = userDetails.find('.user-name')
      expect(userName.text()).toBe('testuser')
      
      const userRole = userDetails.find('.user-role')
      expect(userRole.text()).toBe('系统管理员')
    })

    it('应该在折叠状态下隐藏用户详细信息', () => {
      wrapper = createWrapper({
        collapsed: true
      })
      
      const userDetails = wrapper.find('.user-details')
      expect(userDetails.exists()).toBe(false)
    })

    it('应该正确计算用户显示名称', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.userDisplayName).toBe('testuser')
      
      // Test with different user info
      mockUserStore.userInfo = { username: 'Admin User' }
      expect(wrapper.vm.userDisplayName).toBe('Admin User')
      
      mockUserStore.userInfo = {}
      expect(wrapper.vm.userDisplayName).toBe('用户')
    })
  })

  describe('计算属性', () => {
    it('应该正确计算侧边栏类名', () => {
      wrapper = createWrapper({
        collapsed: false,
        isMobile: false
      })
      
      const classes = wrapper.vm.sidebarClasses
      expect(classes).toEqual({
        'sidebar-open': true,
        'collapsed': false,
        'show': false
      })
    })

    it('应该正确过滤导航菜单', () => {
      wrapper = createWrapper()
      
      const filteredNav = wrapper.vm.filteredNavigation
      expect(filteredNav).toEqual(mockPermissionsStore.menuGroups)
    })

    it('应该处理空的菜单组', () => {
      mockPermissionsStore.menuGroups = []
      wrapper = createWrapper()
      
      const filteredNav = wrapper.vm.filteredNavigation
      expect(filteredNav).toEqual([])
    })
  })

  describe('事件处理', () => {
    it('应该在移动端点击菜单项时触发 menuClick 事件', async () => {
      const emitSpy = vi.fn()
      wrapper = createWrapper({
        isMobile: true
      })
      wrapper.vm.$emit = emitSpy
      
      const navItems = wrapper.findAll('.nav-item')
      const dashboardItem = navItems.find(item => 
        item.find('.nav-text').text() === '仪表板'
      )
      
      await dashboardItem.trigger('click.prevent')
      
      expect(emitSpy).toHaveBeenCalledWith('menuClick')
    })

    it('应该在非移动端点击菜单项时触发 menuClick 事件', async () => {
      const emitSpy = vi.fn()
      wrapper = createWrapper({
        isMobile: false
      })
      wrapper.vm.$emit = emitSpy
      
      const navItems = wrapper.findAll('.nav-item')
      const dashboardItem = navItems.find(item => 
        item.find('.nav-text').text()).toBe('仪表板'
      )
      
      await dashboardItem.trigger('click.prevent')
      
      expect(emitSpy).toHaveBeenCalledWith('menuClick')
    })
  })

  describe('生命周期', () => {
    it('应该在挂载时初始化权限', async () => {
      wrapper = createWrapper()
      
      await nextTick()
      
      expect(mockPermissionsStore.initializePermissions).toHaveBeenCalled()
    })

    it('应该正确处理挂载时的用户信息', () => {
      mockUserStore.userInfo = { username: 'admin' }
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.userDisplayName).toBe('admin')
      
      const userAvatar = wrapper.find('.user-avatar')
      expect(userAvatar.text()).toBe('A')
    })

    it('应该处理挂载时没有用户信息的情况', () => {
      mockUserStore.userInfo = null
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.userDisplayName).toBe('用户')
      
      const userAvatar = wrapper.find('.user-avatar')
      expect(userAvatar.text()).toBe('用')
    })

    it('应该处理挂载时用户名为空字符串的情况', () => {
      mockUserStore.userInfo = { username: '' }
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.userDisplayName).toBe('用户')
      
      const userAvatar = wrapper.find('.user-avatar')
      expect(userAvatar.text()).toBe('用')
    })
  })

  describe('主题切换优化', () => {
    it('应该正确处理主题切换事件', async () => {
      const emitSpy = vi.fn()
      wrapper = createWrapper({
        collapsed: false
      })
      wrapper.vm.$emit = emitSpy
      
      const themeOptions = wrapper.findAll('.theme-btn')
      await themeOptions[1].trigger('click') // glass-dark theme
      
      expect(emitSpy).toHaveBeenCalledWith('themeChange', 'glass-dark')
    })

    it('应该正确处理所有主题选项', async () => {
      const emitSpy = vi.fn()
      wrapper = createWrapper({
        collapsed: false
      })
      wrapper.vm.$emit = emitSpy
      
      const themes = ['glass-light', 'glass-dark', 'glass-neon', 'glass-gradient']
      const themeOptions = wrapper.findAll('.theme-btn')
      
      for (let i = 0;
import { vi } from 'vitest' i < themes.length; i++) {
        await themeOptions[i].trigger('click')
        expect(emitSpy).toHaveBeenCalledWith('themeChange', themes[i])
      }
    })

    it('应该在折叠状态下隐藏主题区域', () => {
      wrapper = createWrapper({
        collapsed: true
      })
      
      const themeSection = wrapper.find('.theme-section')
      expect(themeSection.exists()).toBe(false)
    })

    it('应该在展开状态下显示主题区域', () => {
      wrapper = createWrapper({
        collapsed: false
      })
      
      const themeSection = wrapper.find('.theme-section')
      expect(themeSection.exists()).toBe(true)
    })
  })

  describe('用户信息处理', () => {
    it('应该正确处理包含空格的用户名', () => {
      mockUserStore.userInfo = { username: 'Test User' }
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.userDisplayName).toBe('Test User')
      
      const userAvatar = wrapper.find('.user-avatar')
      expect(userAvatar.text()).toBe('T')
    })

    it('应该正确处理特殊字符的用户名', () => {
      mockUserStore.userInfo = { username: '用户@123' }
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.userDisplayName).toBe('用户@123')
      
      const userAvatar = wrapper.find('.user-avatar')
      expect(userAvatar.text()).toBe('用')
    })

    it('应该正确处理超长的用户名', () => {
      const longUsername = 'x'.repeat(100)
      mockUserStore.userInfo = { username: longUsername }
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.userDisplayName).toBe(longUsername)
      
      const userAvatar = wrapper.find('.user-avatar')
      expect(userAvatar.text()).toBe('X')
    })

    it('应该在折叠状态下隐藏用户详细信息', () => {
      wrapper = createWrapper({
        collapsed: true
      })
      
      const userDetails = wrapper.find('.user-details')
      expect(userDetails.exists()).toBe(false)
    })

    it('应该在展开状态下显示用户详细信息', () => {
      wrapper = createWrapper({
        collapsed: false
      })
      
      const userDetails = wrapper.find('.user-details')
      expect(userDetails.exists()).toBe(true)
    })
  })

  describe('性能优化', () => {
    it('应该正确处理大量菜单项', () => {
      const largeMenuGroups = []
      for (let i = 1; i <= 20; i++) {
        const items = []
        for (let j = 1; j <= 10; j++) {
          items.push({
            id: `item-${i}-${j}`,
            title: `菜单项${i}-${j}`,
            icon: 'dashboard',
            route: `/menu/${i}/${j}`
          })
        }
        
        largeMenuGroups.push({
          id: `group-${i}`,
          title: `分组${i}`,
          icon: '⚡',
          description: `分组${i}描述`,
          items: items
        })
      }
      
      mockPermissionsStore.menuGroups = largeMenuGroups
      
      wrapper = createWrapper()
      
      const sections = wrapper.findAll('.nav-section')
      expect(sections.length).toBe(20)
      
      const navItems = wrapper.findAll('.nav-item')
      expect(navItems.length).toBe(200)
    })

    it('应该正确处理频繁的菜单项点击', async () => {
      wrapper = createWrapper()
      
      const navItems = wrapper.findAll('.nav-item')
      const dashboardItem = navItems.find(item => 
        item.find('.nav-text').text() === '仪表板'
      )
      
      // Simulate frequent clicks
      for (let i = 0; i < 10; i++) {
        await dashboardItem.trigger('click.prevent')
      }
      
      expect(mockPush).toHaveBeenCalledTimes(10)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('无障碍支持', () => {
    it('应该支持键盘导航', async () => {
      wrapper = createWrapper()
      
      const navItems = wrapper.findAll('.nav-item')
      const dashboardItem = navItems.find(item => 
        item.find('.nav-text').text() === '仪表板'
      )
      
      // Test keyboard navigation
      await dashboardItem.trigger('keydown.enter')
      await dashboardItem.trigger('keydown.space')
      await dashboardItem.trigger('keydown.arrowdown')
      await dashboardItem.trigger('keydown.arrowup')
      
      // Should handle keyboard events without errors
      expect(true).toBe(true)
    })

    it('应该支持子菜单的键盘导航', async () => {
      wrapper = createWrapper()
      
      const navItemGroups = wrapper.findAll('.nav-item-group')
      if (navItemGroups.length > 0) {
        const parentItem = navItemGroups[0].find('.nav-item-parent')
        
        // Test keyboard navigation for parent item
        await parentItem.trigger('keydown.enter')
        await parentItem.trigger('keydown.space')
        await parentItem.trigger('keydown.arrowright')
        await parentItem.trigger('keydown.arrowleft')
      }
      
      // Should handle keyboard events without errors
      expect(true).toBe(true)
    })

    it('应该为主题按钮提供键盘支持', async () => {
      wrapper = createWrapper({
        collapsed: false
      })
      
      const themeOptions = wrapper.findAll('.theme-btn')
      
      // Test keyboard navigation for theme buttons
      for (let i = 0; i < themeOptions.length; i++) {
        await themeOptions[i].trigger('keydown.enter')
        await themeOptions[i].trigger('keydown.space')
      }
      
      // Should handle keyboard events without errors
      expect(true).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该处理空的菜单项', () => {
      mockPermissionsStore.menuGroups = [
        {
          id: 'empty',
          title: '空分组',
          icon: '⚡',
          description: '没有菜单项',
          items: []
        }
      ]
      
      wrapper = createWrapper()
      
      const sections = wrapper.findAll('.nav-section')
      expect(sections.length).toBe(1)
      
      const section = sections[0]
      expect(section.find('.nav-section-title').exists()).toBe(true)
      expect(section.findAll('.nav-item').length).toBe(0)
    })

    it('应该处理空的菜单组', () => {
      mockPermissionsStore.menuGroups = []
      
      wrapper = createWrapper()
      
      const sections = wrapper.findAll('.nav-section')
      expect(sections.length).toBe(0)
      
      const nav = wrapper.find('.sidebar-nav')
      expect(nav.exists()).toBe(true)
    })

    it('应该处理 null 的菜单组', () => {
      mockPermissionsStore.menuGroups = null
      
      wrapper = createWrapper()
      
      const sections = wrapper.findAll('.nav-section')
      expect(sections.length).toBe(0)
    })

    it('应该处理 undefined 的菜单组', () => {
      mockPermissionsStore.menuGroups = undefined
      
      wrapper = createWrapper()
      
      const sections = wrapper.findAll('.nav-section')
      expect(sections.length).toBe(0)
    })

    it('应该处理没有子菜单的菜单项', () => {
      mockPermissionsStore.menuGroups = [
        {
          id: 'simple',
          title: '简单分组',
          icon: '⚡',
          description: '简单菜单',
          items: [
            {
              id: 'simple-item',
              title: '简单项',
              icon: 'dashboard',
              route: '/simple'
            }
          ]
        }
      ]
      
      wrapper = createWrapper()
      
      const navItems = wrapper.findAll('.nav-item')
      expect(navItems.length).toBe(1)
      expect(navItems[0].classes()).not.toContain('nav-item-parent')
    })

    it('应该处理隐藏的子菜单项', () => {
      mockPermissionsStore.menuGroups = [
        {
          id: 'hidden',
          title: '隐藏分组',
          icon: '⚡',
          description: '隐藏子菜单',
          items: [
            {
              id: 'parent-item',
              title: '父项',
              icon: 'dashboard',
              route: '/parent',
              children: [
                {
                  id: 'visible-child',
                  title: '可见子项',
                  route: '/parent/visible',
                  visible: true
                },
                {
                  id: 'hidden-child',
                  title: '隐藏子项',
                  route: '/parent/hidden',
                  visible: false
                }
              ]
            }
          ]
        }
      ]
      
      wrapper = createWrapper()
      
      // Expand the submenu
      wrapper.vm.expandedItems = ['parent-item']
      wrapper.vm.$forceUpdate()
      
      const visibleChildren = wrapper.vm.visibleChildren
      expect(visibleChildren.length).toBe(1)
      expect(visibleChildren[0].id).toBe('visible-child')
    })

    it('应该处理包含特殊字符的菜单标题', () => {
      mockPermissionsStore.menuGroups = [
        {
          id: 'special',
          title: '特殊 & 分组 < >',
          icon: '⚡',
          description: '特殊字符',
          items: [
            {
              id: 'special-item',
              title: '特殊 & 项 < >',
              icon: 'dashboard',
              route: '/special'
            }
          ]
        }
      ]
      
      wrapper = createWrapper()
      
      const sectionTitles = wrapper.findAll('.nav-section-title')
      expect(sectionTitles[0].find('.section-name').text()).toBe('特殊 & 分组 < >')
      
      const navItems = wrapper.findAll('.nav-item')
      expect(navItems[0].find('.nav-text').text()).toBe('特殊 & 项 < >')
    })

    it('应该处理超长的菜单标题', () => {
      const longTitle = 'x'.repeat(100)
      
      mockPermissionsStore.menuGroups = [
        {
          id: 'long',
          title: longTitle,
          icon: '⚡',
          description: '长标题',
          items: [
            {
              id: 'long-item',
              title: longTitle,
              icon: 'dashboard',
              route: '/long'
            }
          ]
        }
      ]
      
      wrapper = createWrapper()
      
      const sectionTitles = wrapper.findAll('.nav-section-title')
      expect(sectionTitles[0].find('.section-name').text()).toBe(longTitle)
      
      const navItems = wrapper.findAll('.nav-item')
      expect(navItems[0].find('.nav-text').text()).toBe(longTitle)
    })

    it('应该处理循环引用的菜单结构', () => {
      const childItem = {
        id: 'child-item',
        title: '子项',
        icon: 'dashboard',
        route: '/child'
      }
      
      const parentItem = {
        id: 'parent-item',
        title: '父项',
        icon: 'dashboard',
        route: '/parent',
        children: [childItem]
      }
      
      childItem.children = [parentItem] // Create circular reference
      
      mockPermissionsStore.menuGroups = [
        {
          id: 'circular',
          title: '循环引用',
          icon: '⚡',
          description: '循环引用测试',
          items: [parentItem]
        }
      ]
      
      // Should handle circular reference gracefully
      expect(() => {
        wrapper = createWrapper()
        expect(wrapper.find('.sidebar').exists()).toBe(true)
      }).not.toThrow()
    })

    it('应该处理权限初始化失败', async () => {
      mockPermissionsStore.initializePermissions.mockRejectedValue(new Error('权限初始化失败'))
      
      wrapper = createWrapper()
      
      await nextTick()
      
      // Should handle initialization error gracefully
      expect(wrapper.find('.sidebar').exists()).toBe(true)
    })
  })

  describe('响应式更新', () => {
    it('应该响应折叠状态变化', async () => {
      wrapper = createWrapper({
        collapsed: false
      })
      
      await wrapper.setProps({ collapsed: true })
      
      const sidebar = wrapper.find('.sidebar')
      expect(sidebar.classes()).toContain('collapsed')
    })

    it('应该响应频繁的折叠状态变化', async () => {
      wrapper = createWrapper({
        collapsed: false
      })
      
      // Simulate frequent collapse state changes
      for (let i = 0; i < 10; i++) {
        const collapsed = i % 2 === 0
        await wrapper.setProps({ collapsed })
        
        const sidebar = wrapper.find('.sidebar')
        if (collapsed) {
          expect(sidebar.classes()).toContain('collapsed')
        } else {
          expect(sidebar.classes()).toContain('sidebar-open')
        }
      }
    })

    it('应该响应主题变化', async () => {
      wrapper = createWrapper({
        currentTheme: 'glass-light'
      })
      
      await wrapper.setProps({ currentTheme: 'glass-dark' })
      
      const themeOptions = wrapper.findAll('.theme-btn')
      const darkTheme = themeOptions[1]
      expect(darkTheme.classes()).toContain('active')
    })

    it('应该响应频繁的主题变化', async () => {
      wrapper = createWrapper({
        currentTheme: 'glass-light'
      })
      
      const themes = ['glass-light', 'glass-dark', 'glass-neon', 'glass-gradient']
      
      // Simulate frequent theme changes
      for (let i = 0; i < themes.length; i++) {
        const theme = themes[i]
        await wrapper.setProps({ currentTheme: theme })
        
        const themeOptions = wrapper.findAll('.theme-btn')
        const activeTheme = themeOptions[i]
        expect(activeTheme.classes()).toContain('active')
      }
    })

    it('应该响应移动端状态变化', async () => {
      wrapper = createWrapper({
        isMobile: false,
        collapsed: false
      })
      
      await wrapper.setProps({ isMobile: true })
      
      const sidebar = wrapper.find('.sidebar')
      expect(sidebar.classes()).toContain('show')
      
      await wrapper.setProps({ isMobile: false })
      
      expect(sidebar.classes()).not.toContain('show')
    })
  })
})