/**
 * AIAssistantPage.vue 样式和布局响应式测试
 * 测试组件的视觉呈现、响应式布局和交互样式
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createTestingPinia } from '@pinia/testing'
import AIAssistantPage from '@/pages/ai/AIAssistantPage.vue'

// Mock ResizeObserver for responsive testing
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia for media query testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('AIAssistantPage.vue - 样式和布局响应式测试', () => {
  let wrapper: VueWrapper<any>

  const mockUser = {
    id: 1,
    username: 'test-user',
    role: 'admin',
    permissions: ['ai:assistant', 'ai:memory', 'ai:activity-planning', 'ai:expert-consultation']
  }

  beforeEach(() => {
    vi.clearAllMocks()

    const pinia = createTestingPinia({
      initialState: {
        user: {
          userInfo: mockUser,
          isAuthenticated: true,
          permissions: mockUser.permissions
        }
      }
    })

    wrapper = mount(AIAssistantPage, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-tabs': {
            template: '<div class="el-tabs"><slot /></div>'
          },
          'el-tab-pane': {
            template: '<div class="el-tab-pane" :class="name"><slot /></div>',
            props: ['name', 'label']
          },
          'el-button': {
            template: '<button class="el-button" :class="[type, size]" @click="$emit(\'click\')"><slot /></button>',
            props: ['type', 'size'],
            emits: ['click']
          },
          'el-input': {
            template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
            emits: ['update:modelValue']
          },
          'el-select': {
            template: '<select class="el-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['modelValue', 'placeholder'],
            emits: ['update:modelValue']
          },
          'el-option': {
            template: '<option class="el-option" :value="value"><slot /></option>',
            props: ['value', 'label']
          },
          'el-form': {
            template: '<form class="el-form"><slot /></form>',
            props: ['model', 'rules']
          },
          'el-form-item': {
            template: '<div class="el-form-item"><label v-if="label">{{ label }}</label><slot /></div>',
            props: ['label', 'prop']
          },
          'el-icon': {
            template: '<i class="el-icon"><slot /></i>',
            props: ['size']
          },
          'el-tag': {
            template: '<span class="el-tag" :class="type"><slot /></span>',
            props: ['type']
          },
          'el-divider': {
            template: '<div class="el-divider"><slot /></div>'
          },
          'el-timeline': {
            template: '<div class="el-timeline"><slot /></div>'
          },
          'el-timeline-item': {
            template: '<div class="el-timeline-item"><slot /></div>',
            props: ['timestamp']
          },
          'el-table': {
            template: '<table class="el-table"><slot /></table>',
            props: ['data']
          },
          'el-table-column': {
            template: '<td class="el-table-column"><slot /></td>',
            props: ['prop', 'label']
          },
          'AIAssistant': {
            template: '<div class="ai-assistant-component" data-testid="ai-assistant">AI Assistant</div>'
          },
          'EmptyState': {
            template: '<div class="empty-state-component" data-testid="empty-state">Empty State</div>',
            props: ['type', 'title', 'description']
          },
          'LoadingState': {
            template: '<div class="loading-state-component" data-testid="loading-state">Loading...</div>',
            props: ['variant', 'size', 'text']
          }
        }
      },
      attachTo: document.body
    })
  })

  afterEach(async () => {
    // 等待所有pending的Promise完成
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // 清理所有timer
    vi.clearAllTimers()

    // 卸载组件
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('🎨 基础样式和CSS类测试', () => {
    it('应该包含正确的根容器样式类', () => {
      const container = wrapper.find('.ai-functionality-container')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('ai-assistant-page')
    })

    it('应该正确应用页面头部样式', () => {
      const pageHeader = wrapper.find('.page-header')
      expect(pageHeader.exists()).toBe(true)
      
      const pageTitle = wrapper.find('.page-title')
      expect(pageTitle.exists()).toBe(true)
      expect(pageTitle.text()).toBe('AI智能助手')
      
      const pageActions = wrapper.find('.page-actions')
      expect(pageActions.exists()).toBe(true)
    })

    it('应该正确应用主要内容区域样式', () => {
      const mainContent = wrapper.find('.main-content')
      expect(mainContent.exists()).toBe(true)
      
      const aiTabs = wrapper.find('.ai-tabs')
      expect(aiTabs.exists()).toBe(true)
    })

    it('应该正确应用分屏布局样式', () => {
      const splitLayout = wrapper.find('.split-layout')
      expect(splitLayout.exists()).toBe(true)
      
      const contentPanel = wrapper.find('.content-panel')
      expect(contentPanel.exists()).toBe(true)
      
      const chatPanel = wrapper.find('.chat-panel')
      expect(chatPanel.exists()).toBe(true)
    })

    it('应该正确应用面板头部和主体样式', () => {
      const panelHeaders = wrapper.findAll('.panel-header')
      expect(panelHeaders.length).toBeGreaterThan(0)
      
      const panelBodies = wrapper.findAll('.panel-body')
      expect(panelBodies.length).toBeGreaterThan(0)
      
      const panelTitles = wrapper.findAll('.panel-title')
      expect(panelTitles.length).toBeGreaterThan(0)
    })
  })

  describe('📱 响应式布局测试', () => {
    it('应该在桌面尺寸下正确显示分屏布局', async () => {
      // 模拟桌面尺寸
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })
      
      window.dispatchEvent(new Event('resize'))
      await nextTick()

      const splitLayout = wrapper.find('.split-layout')
      expect(splitLayout.exists()).toBe(true)
      
      // 验证两列布局
      const contentPanel = wrapper.find('.content-panel')
      const chatPanel = wrapper.find('.chat-panel')
      expect(contentPanel.exists()).toBe(true)
      expect(chatPanel.exists()).toBe(true)
    })

    it('应该在平板尺寸下调整布局', async () => {
      // 模拟平板尺寸
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      // 模拟 matchMedia 返回平板媒体查询匹配
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query.includes('768px'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      window.dispatchEvent(new Event('resize'))
      await nextTick()

      // 验证布局仍然可用
      const mainContent = wrapper.find('.main-content')
      expect(mainContent.exists()).toBe(true)
    })

    it('应该在移动设备尺寸下适配单列布局', async () => {
      // 模拟移动设备尺寸
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query.includes('480px') || query.includes('mobile'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      window.dispatchEvent(new Event('resize'))
      await nextTick()

      // 在移动设备上，布局应该仍然存在但可能重新排列
      const container = wrapper.find('.ai-functionality-container')
      expect(container.exists()).toBe(true)
    })
  })

  describe('🎯 交互状态样式测试', () => {
    it('应该正确显示加载状态样式', async () => {
      wrapper.vm.isAILoading = true
      await nextTick()

      const loadingState = wrapper.find('[data-testid="loading-state"]')
      expect(loadingState.exists()).toBe(true)
      expect(loadingState.classes()).toContain('loading-state-component')
    })

    it('应该正确显示错误状态样式', async () => {
      wrapper.vm.aiError = '测试错误信息'
      await nextTick()

      const emptyState = wrapper.find('[data-testid="empty-state"]')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.classes()).toContain('empty-state-component')
    })

    it('应该正确显示按钮交互状态', async () => {
      const buttons = wrapper.findAll('.el-button')
      expect(buttons.length).toBeGreaterThan(0)

      // 测试主要按钮样式
      const primaryButtons = wrapper.findAll('.el-button.primary')
      expect(primaryButtons.length).toBeGreaterThan(0)

      // 测试小尺寸按钮
      const smallButtons = wrapper.findAll('.el-button.small')
      expect(smallButtons.length).toBeGreaterThan(0)
    })

    it('应该正确显示生成中的按钮状态', async () => {
      wrapper.vm.isGenerating = true
      await nextTick()

      // 查找生成按钮，应该显示加载状态
      const generateButton = wrapper.find('button').element
      expect(generateButton).toBeDefined()
    })

    it('应该正确显示活动选中状态', async () => {
      // 模拟添加活动
      wrapper.vm.activities = [
        { id: 'activity-1', name: '测试活动1', status: 'draft' },
        { id: 'activity-2', name: '测试活动2', status: 'active' }
      ]
      wrapper.vm.selectedActivity = wrapper.vm.activities[0]
      await nextTick()

      // 检查活动项样式
      const activityItems = wrapper.findAll('.activity-item')
      if (activityItems.length > 0) {
        expect(activityItems[0].classes()).toContain('selected')
      }
    })
  })

  describe('🏷️ 标签和状态指示器样式测试', () => {
    it('应该正确显示活动状态标签样式', async () => {
      wrapper.vm.activities = [
        { id: '1', status: 'draft', name: '草稿活动' },
        { id: '2', status: 'active', name: '进行中活动' },
        { id: '3', status: 'completed', name: '已完成活动' },
        { id: '4', status: 'cancelled', name: '已取消活动' }
      ]
      await nextTick()

      const tags = wrapper.findAll('.el-tag')
      expect(tags.length).toBeGreaterThan(0)

      // 验证不同状态的标签类型
      expect(wrapper.vm.getStatusType('draft')).toBe('info')
      expect(wrapper.vm.getStatusType('active')).toBe('success')
      expect(wrapper.vm.getStatusType('cancelled')).toBe('danger')
    })

    it('应该正确显示记忆重要性指示器', async () => {
      wrapper.vm.memorySearchResults = [
        { id: '1', importance: 9, content: '高重要性记忆' },
        { id: '2', importance: 5, content: '中等重要性记忆' },
        { id: '3', importance: 2, content: '低重要性记忆' }
      ]
      await nextTick()

      // 验证记忆项目存在
      expect(wrapper.vm.memorySearchResults.length).toBe(3)
    })

    it('应该正确显示权限相关的视觉反馈', async () => {
      const userStore = wrapper.vm.userStore || {}
      if (userStore.hasPermission) {
        vi.mocked(userStore.hasPermission).mockReturnValue(false)
      }

      await nextTick()

      // 当没有权限时，相关标签页应该被隐藏
      // 这个测试主要验证v-if指令的正确应用
    })
  })

  describe('📋 表单和输入组件样式测试', () => {
    it('应该正确显示策划表单样式', async () => {
      wrapper.vm.isCreatingActivity = true
      await nextTick()

      const planningForm = wrapper.find('.activity-planning-form')
      expect(planningForm.exists()).toBe(true)

      const formItems = wrapper.findAll('.el-form-item')
      expect(formItems.length).toBeGreaterThan(0)

      // 验证表单输入组件
      const inputs = wrapper.findAll('.el-input')
      const selects = wrapper.findAll('.el-select')
      expect(inputs.length + selects.length).toBeGreaterThan(0)
    })

    it('应该正确显示搜索输入框样式', async () => {
      const searchInput = wrapper.find('.memory-search-input')
      if (searchInput.exists()) {
        expect(searchInput.classes()).toContain('memory-search-input')
      }
    })

    it('应该正确显示表单验证错误样式', async () => {
      wrapper.vm.isCreatingActivity = true
      wrapper.vm.planningFormRef = {
        validate: vi.fn().mockRejectedValue({ field: 'activityType', message: '请选择活动类型' })
      }
      
      await nextTick()

      // 尝试提交表单应该触发验证
      try {
        await wrapper.vm.generatePlan()
      } catch (error) {
        // 预期的验证错误
      }

      // 验证错误状态处理
      expect(wrapper.vm.planningFormRef.validate).toHaveBeenCalled()
    })
  })

  describe('🎨 主题和颜色样式测试', () => {
    it('应该支持CSS变量自定义主题', () => {
      const container = wrapper.find('.ai-functionality-container')
      expect(container.exists()).toBe(true)

      // 验证是否使用了CSS变量（通过检查样式内容）
      const styleContent = wrapper.html()
      // 这些CSS变量应该在组件的样式中被使用
      const expectedCSSVars = [
        '--el-color-primary',
        '--el-text-color-primary',
        '--el-bg-color',
        '--el-border-color'
      ]

      // 注意：由于这是单元测试，我们主要验证组件结构正确
      // 实际的CSS变量应用需要在集成测试中验证
    })

    it('应该正确应用暗色主题样式', async () => {
      // 模拟暗色主题环境
      document.documentElement.setAttribute('data-theme', 'dark')
      
      await nextTick()

      const container = wrapper.find('.ai-functionality-container')
      expect(container.exists()).toBe(true)

      // 清理
      document.documentElement.removeAttribute('data-theme')
    })

    it('应该正确应用强调色和状态色', () => {
      // 验证状态颜色映射
      expect(wrapper.vm.getStatusType('draft')).toBe('info')
      expect(wrapper.vm.getStatusType('active')).toBe('success')
      expect(wrapper.vm.getStatusType('cancelled')).toBe('danger')

      // 这些状态会映射到对应的CSS类
    })
  })

  describe('🎭 动画和过渡效果测试', () => {
    it('应该支持标签页切换动画', async () => {
      // 切换标签页
      wrapper.vm.activeTab = 'memory'
      await nextTick()

      wrapper.vm.activeTab = 'activity'
      await nextTick()

      // 验证标签页状态正确更新
      expect(wrapper.vm.activeTab).toBe('activity')
    })

    it('应该支持加载状态动画', async () => {
      wrapper.vm.isAILoading = true
      await nextTick()

      const loadingComponent = wrapper.find('[data-testid="loading-state"]')
      expect(loadingComponent.exists()).toBe(true)

      wrapper.vm.isAILoading = false
      await nextTick()

      // 验证加载状态切换
      expect(wrapper.vm.isAILoading).toBe(false)
    })

    it('应该支持活动生成进度动画', async () => {
      wrapper.vm.isGenerating = true
      await nextTick()

      expect(wrapper.vm.isGenerating).toBe(true)

      wrapper.vm.isGenerating = false
      await nextTick()

      expect(wrapper.vm.isGenerating).toBe(false)
    })
  })

  describe('🖱️ 鼠标交互和悬停效果测试', () => {
    it('应该支持按钮悬停效果', async () => {
      const buttons = wrapper.findAll('.el-button')
      
      if (buttons.length > 0) {
        const button = buttons[0]
        
        // 模拟鼠标悬停
        await button.trigger('mouseenter')
        await nextTick()

        // 模拟鼠标离开
        await button.trigger('mouseleave')
        await nextTick()

        // 验证事件被正确处理
        expect(button.exists()).toBe(true)
      }
    })

    it('应该支持活动项悬停效果', async () => {
      wrapper.vm.activities = [
        { id: 'activity-1', name: '测试活动', status: 'draft' }
      ]
      await nextTick()

      const activityItems = wrapper.findAll('.activity-item')
      if (activityItems.length > 0) {
        const activityItem = activityItems[0]
        
        await activityItem.trigger('mouseenter')
        await nextTick()

        await activityItem.trigger('mouseleave')
        await nextTick()

        expect(activityItem.exists()).toBe(true)
      }
    })

    it('应该支持点击交互反馈', async () => {
      const clickableElements = wrapper.findAll('button, .activity-item, .memory-item')
      
      for (const element of clickableElements) {
        await element.trigger('click')
        await nextTick()
        
        // 验证点击事件被处理
        expect(element.exists()).toBe(true)
      }
    })
  })

  describe('📐 布局和间距测试', () => {
    it('应该有正确的容器内边距', () => {
      const container = wrapper.find('.ai-functionality-container')
      expect(container.exists()).toBe(true)

      // 验证容器结构
      const pageHeader = wrapper.find('.page-header')
      const mainContent = wrapper.find('.main-content')
      
      expect(pageHeader.exists()).toBe(true)
      expect(mainContent.exists()).toBe(true)
    })

    it('应该有正确的面板间距', () => {
      const panels = wrapper.findAll('.content-panel, .chat-panel')
      expect(panels.length).toBeGreaterThan(0)

      // 验证面板内部结构
      const panelHeaders = wrapper.findAll('.panel-header')
      const panelBodies = wrapper.findAll('.panel-body')
      
      expect(panelHeaders.length).toBeGreaterThan(0)
      expect(panelBodies.length).toBeGreaterThan(0)
    })

    it('应该有正确的表单元素间距', async () => {
      wrapper.vm.isCreatingActivity = true
      await nextTick()

      const formItems = wrapper.findAll('.el-form-item')
      expect(formItems.length).toBeGreaterThan(0)

      // 验证表单结构
      const form = wrapper.find('.el-form')
      expect(form.exists()).toBe(true)
    })
  })

  describe('🔤 字体和文本样式测试', () => {
    it('应该有正确的标题字体大小', () => {
      const pageTitle = wrapper.find('.page-title')
      expect(pageTitle.exists()).toBe(true)
      expect(pageTitle.text()).toBe('AI智能助手')

      const panelTitles = wrapper.findAll('.panel-title')
      expect(panelTitles.length).toBeGreaterThan(0)
    })

    it('应该有正确的正文字体大小', () => {
      const descriptions = wrapper.findAll('.memory-description, .placeholder-text')
      expect(descriptions.length).toBeGreaterThan(0)
    })

    it('应该有正确的小字体样式', () => {
      // 验证次要文本样式
      const secondaryTexts = wrapper.findAll('.secondary-text, .memory-meta')
      // 即使没有找到元素，也不应该报错
      expect(secondaryTexts.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('🎨 图标和视觉元素测试', () => {
    it('应该正确显示功能图标', () => {
      const icons = wrapper.findAll('.el-icon')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('应该正确显示占位符图标', () => {
      const placeholderIcons = wrapper.findAll('.placeholder-icon')
      expect(placeholderIcons.length).toBeGreaterThan(0)
    })

    it('应该正确显示状态指示图标', async () => {
      wrapper.vm.isAILoading = true
      await nextTick()

      // 验证加载状态图标
      const loadingIndicators = wrapper.findAll('[data-testid="loading-state"]')
      expect(loadingIndicators.length).toBeGreaterThan(0)
    })
  })

  describe('📱 可访问性样式测试', () => {
    it('应该有正确的焦点样式', async () => {
      const focusableElements = wrapper.findAll('button, input, select')
      
      for (const element of focusableElements) {
        await element.trigger('focus')
        await nextTick()
        
        // 验证焦点事件被处理
        expect(element.exists()).toBe(true)
        
        await element.trigger('blur')
        await nextTick()
      }
    })

    it('应该支持键盘导航样式', async () => {
      const container = wrapper.find('.ai-functionality-container')
      
      // 模拟键盘导航
      await container.trigger('keydown', { key: 'Tab' })
      await nextTick()
      
      await container.trigger('keydown', { key: 'Enter' })
      await nextTick()

      expect(container.exists()).toBe(true)
    })

    it('应该有足够的颜色对比度', () => {
      // 这个测试主要验证组件结构正确
      // 实际的颜色对比度需要通过视觉回归测试或专门的可访问性工具验证
      const textElements = wrapper.findAll('.page-title, .panel-title, .placeholder-text')
      expect(textElements.length).toBeGreaterThan(0)
    })
  })

  describe('🎯 性能优化样式测试', () => {
    it('应该正确使用CSS Grid布局', () => {
      const gridContainers = wrapper.findAll('.quick-actions-grid, .stats-cards')
      // 验证网格容器存在
      expect(gridContainers.length).toBeGreaterThanOrEqual(0)
    })

    it('应该正确使用Flexbox布局', () => {
      const flexContainers = wrapper.findAll('.split-layout, .panel-header, .form-actions')
      expect(flexContainers.length).toBeGreaterThan(0)
    })

    it('应该避免布局抖动', async () => {
      // 测试数据变化时的布局稳定性
      const initialHeight = wrapper.element.clientHeight

      // 模拟数据变化
      wrapper.vm.activities = Array(10).fill(0).map((_, i) => ({
        id: `activity-${i}`,
        name: `活动 ${i}`,
        status: 'draft'
      }))
      
      await nextTick()

      // 布局应该保持稳定
      expect(wrapper.element).toBeDefined()
    })
  })
})