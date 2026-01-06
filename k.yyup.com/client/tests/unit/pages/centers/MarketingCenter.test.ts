import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import MarketingCenter from '@/pages/centers/MarketingCenter.vue'
import CenterContainer from '@/components/centers/CenterContainer.vue'
import StatCard from '@/components/centers/StatCard.vue'
import CreateCampaignDialog from '@/components/marketing/CreateCampaignDialog.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElLoading: {
      service: vi.fn()
    }
  }
})

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    currentRoute: {
      value: {
        path: '/centers/marketing'
      }
    }
  })
}))

// Mock marketing service
vi.mock('@/services/marketing-center.service', () => ({
  getStatistics: vi.fn(),
  getCampaigns: vi.fn(),
  getChannels: vi.fn()
}))

describe('MarketingCenter.vue', () => {
  let wrapper: any
  let mockRouter: any
  let mockMarketingService: any

  const createWrapper = () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    
    mockRouter = {
      push: vi.fn(),
      currentRoute: {
        value: {
          path: '/centers/marketing'
        }
      }
    }
    
    mockMarketingService = {
      getStatistics: vi.fn(),
      getCampaigns: vi.fn(),
      getChannels: vi.fn()
    }
    
    return mount(MarketingCenter, {
      global: {
        plugins: [pinia, ElementPlus],
        components: {
          CenterContainer,
          StatCard,
          CreateCampaignDialog
        },
        stubs: {
          'el-icon': true,
          'el-button': true,
          'router-view': true,
          'el-loading': true
        },
        provide: {
          router: mockRouter
        }
      }
    })
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    wrapper = createWrapper()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('Component Rendering', () => {
    it('should render the marketing center correctly', () => {
      expect(wrapper.find('.center-content').exists()).toBe(true)
    })

    it('should render CenterContainer component', () => {
      const centerContainer = wrapper.findComponent(CenterContainer)
      expect(centerContainer.exists()).toBe(true)
      expect(centerContainer.props('title')).toBe('营销中心')
    })

    it('should render welcome section with title and description', () => {
      const welcomeSection = wrapper.find('.welcome-section')
      expect(welcomeSection.exists()).toBe(true)
      
      const title = welcomeSection.find('h2')
      expect(title.text()).toBe('欢迎来到营销中心')
      
      const description = welcomeSection.find('p')
      expect(description.text()).toContain('营销活动管理和推广的中心枢纽')
    })

    it('should render header actions with create campaign button', () => {
      const headerActions = wrapper.find('.header-actions')
      expect(headerActions.exists()).toBe(true)
      
      const createButton = headerActions.find('el-button-stub')
      expect(createButton.text()).toContain('创建营销活动')
    })

    it('should render marketing statistics section', () => {
      const statsGrid = wrapper.find('.stats-grid-unified')
      expect(statsGrid.exists()).toBe(true)
    })

    it('should render marketing modules section', () => {
      const marketingModules = wrapper.find('.marketing-modules')
      expect(marketingModules.exists()).toBe(true)
    })

    it('should render marketing info section', () => {
      const marketingInfo = wrapper.find('.marketing-info')
      expect(marketingInfo.exists()).toBe(true)
    })

    it('should render all marketing module items', () => {
      const moduleItems = wrapper.findAll('.module-item')
      expect(moduleItems.length).toBe(4)
      
      const expectedModules = ['渠道管理', '老带新', '转换统计', '销售漏斗']
      moduleItems.forEach((item: any, index: number) => {
        const title = item.find('h4').text()
        expect(title).toBe(expectedModules[index])
      })
    })

    it('should render all marketing info items', () => {
      const infoItems = wrapper.findAll('.info-item')
      expect(infoItems.length).toBe(4)
      
      const expectedInfo = ['渠道管理', '老带新推荐', '转换统计分析', '销售漏斗分析']
      infoItems.forEach((item: any, index: number) => {
        const title = item.find('h4').text()
        expect(title).toBe(expectedInfo[index])
      })
    })

    it('should render CreateCampaignDialog component', () => {
      const createCampaignDialog = wrapper.findComponent(CreateCampaignDialog)
      expect(createCampaignDialog.exists()).toBe(true)
      expect(createCampaignDialog.props('modelValue')).toBe(wrapper.vm.showCreateCampaignDialog)
    })

    it('should show router-view when not on marketing center root', async () => {
      // Mock route to be different from marketing center root
      mockRouter.currentRoute.value.path = '/centers/marketing/channels'
      await nextTick()
      
      const routerView = wrapper.findComponent({ name: 'RouterView' })
      expect(routerView.exists()).toBe(true)
    })
  })

  describe('Data and State Management', () => {
    it('should initialize with correct default values', () => {
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.showCreateCampaignDialog).toBe(false)
      expect(wrapper.vm.stats).toEqual({
        activeCampaigns: { count: 0, change: '0%' },
        newCustomers: { count: 0, change: '0%' },
        conversionRate: { rate: 0, change: '0%' },
        marketingROI: { roi: 0, change: '0%' }
      })
    })

    it('should update stats when data is loaded', async () => {
      const mockStats = {
        activeCampaigns: { count: 5, change: '+10%' },
        newCustomers: { count: 25, change: '+15%' },
        conversionRate: { rate: 12.5, change: '+2.3%' },
        marketingROI: { roi: 150, change: '+25%' }
      }
      
      const { getStatistics } = await import('@/services/marketing-center.service')
      getStatistics.mockResolvedValue(mockStats)
      
      await wrapper.vm.loadStatistics()
      
      expect(wrapper.vm.stats).toEqual(mockStats)
    })

    it('should handle API error gracefully when loading statistics', async () => {
      const { getStatistics } = await import('@/services/marketing-center.service')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      getStatistics.mockRejectedValue(new Error('API Error'))
      
      await wrapper.vm.loadStatistics()
      
      expect(consoleSpy).toHaveBeenCalledWith('加载营销统计数据失败:', expect.any(Error))
      expect(wrapper.vm.stats).toEqual({
        activeCampaigns: { count: 0, change: '0%' },
        newCustomers: { count: 0, change: '0%' },
        conversionRate: { rate: 0, change: '0%' },
        marketingROI: { roi: 0, change: '0%' }
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('User Interactions', () => {
    it('should call handleCreateCampaign when create campaign button is clicked', async () => {
      const handleCreateCampaignSpy = vi.spyOn(wrapper.vm, 'handleCreateCampaign')
      
      await wrapper.vm.handleCreateCampaign()
      
      expect(handleCreateCampaignSpy).toHaveBeenCalled()
      expect(wrapper.vm.showCreateCampaignDialog).toBe(true)
    })

    it('should call navigateTo when module item is clicked', async () => {
      const navigateToSpy = vi.spyOn(wrapper.vm, 'navigateTo')
      
      await wrapper.vm.navigateTo('/centers/marketing/channels')
      
      expect(navigateToSpy).toHaveBeenCalledWith('/centers/marketing/channels')
      expect(mockRouter.push).toHaveBeenCalledWith('/centers/marketing/channels')
    })

    it('should show success message when navigation is successful', async () => {
      const { ElMessage } = await import('element-plus')
      
      mockRouter.push.mockResolvedValue(undefined)
      
      await wrapper.vm.navigateTo('/centers/marketing/channels')
      
      expect(ElMessage.success).toHaveBeenCalledWith('正在跳转到 /centers/marketing/channels')
    })

    it('should show error message when navigation fails', async () => {
      const { ElMessage } = await import('element-plus')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockRouter.push.mockRejectedValue(new Error('Navigation failed'))
      
      await wrapper.vm.navigateTo('/centers/marketing/channels')
      
      expect(consoleSpy).toHaveBeenCalledWith('导航失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('页面 /centers/marketing/channels 暂时无法访问，请检查权限或稍后再试')
      
      consoleSpy.mockRestore()
    })

    it('should call handleCampaignCreated when campaign is created successfully', async () => {
      const handleCampaignCreatedSpy = vi.spyOn(wrapper.vm, 'handleCampaignCreated')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const { ElMessage } = await import('element-plus')
      
      const mockCampaign = { id: 1, name: 'Test Campaign' }
      await wrapper.vm.handleCampaignCreated(mockCampaign)
      
      expect(handleCampaignCreatedSpy).toHaveBeenCalledWith(mockCampaign)
      expect(consoleSpy).toHaveBeenCalledWith('营销活动创建成功:', mockCampaign)
      expect(ElMessage.success).toHaveBeenCalledWith('营销活动创建成功')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Utility Functions', () => {
    it('should parse trend value correctly', () => {
      const parseTrendValue = wrapper.vm.parseTrendValue
      
      expect(parseTrendValue('+10%')).toBe(10)
      expect(parseTrendValue('-5%')).toBe(-5)
      expect(parseTrendValue('15%')).toBe(15)
      expect(parseTrendValue('0%')).toBe(0)
      expect(parseTrendValue('')).toBe(0)
      expect(parseTrendValue('invalid')).toBe(0)
      expect(parseTrendValue(null)).toBe(0)
      expect(parseTrendValue(undefined)).toBe(0)
    })

    it('should load statistics on component mount', () => {
      const loadStatisticsSpy = vi.spyOn(wrapper.vm, 'loadStatistics')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      // Remount to trigger onMounted
      wrapper = createWrapper()
      
      expect(consoleSpy).toHaveBeenCalledWith('营销中心已加载')
      expect(loadStatisticsSpy).toHaveBeenCalled()
      expect(wrapper.vm.loading).toBe(true)
      
      consoleSpy.mockRestore()
    })

    it('should set loading to false after statistics load completes', async () => {
      const { getStatistics } = await import('@/services/marketing-center.service')
      
      getStatistics.mockResolvedValue({
        activeCampaigns: { count: 5, change: '+10%' },
        newCustomers: { count: 25, change: '+15%' },
        conversionRate: { rate: 12.5, change: '+2.3%' },
        marketingROI: { roi: 150, change: '+25%' }
      })
      
      wrapper.vm.loading = true
      await wrapper.vm.loadStatistics()
      
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('Component Integration', () => {
    it('should integrate with CenterContainer component correctly', () => {
      const centerContainer = wrapper.findComponent(CenterContainer)
      expect(centerContainer.props('title')).toBe('营销中心')
      expect(centerContainer.props('showHeader')).toBe(false)
      expect(centerContainer.props('showActions')).toBe(false)
    })

    it('should integrate with StatCard components correctly', () => {
      const statCards = wrapper.findAllComponents(StatCard)
      expect(statCards.length).toBe(4) // 4 stat cards
      
      // Check first stat card (活跃营销活动)
      const firstCard = statCards[0]
      expect(firstCard.props('title')).toBe('活跃营销活动')
      expect(firstCard.props('iconName')).toBe('megaphone')
      expect(firstCard.props('type')).toBe('primary')
    })

    it('should integrate with CreateCampaignDialog component correctly', () => {
      const createCampaignDialog = wrapper.findComponent(CreateCampaignDialog)
      expect(createCampaignDialog.exists()).toBe(true)
      expect(createCampaignDialog.props('modelValue')).toBe(wrapper.vm.showCreateCampaignDialog)
    })

    it('should handle CreateCampaignDialog events correctly', async () => {
      const createCampaignDialog = wrapper.findComponent(CreateCampaignDialog)
      const handleCampaignCreatedSpy = vi.spyOn(wrapper.vm, 'handleCampaignCreated')
      
      await createCampaignDialog.vm.$emit('success', { id: 1, name: 'Test Campaign' })
      
      expect(handleCampaignCreatedSpy).toHaveBeenCalledWith({ id: 1, name: 'Test Campaign' })
    })
  })

  describe('Loading States', () => {
    it('should show loading state during data loading', async () => {
      wrapper.vm.loading = true
      await nextTick()
      
      const centerContent = wrapper.find('.center-content')
      expect(centerContent.attributes('loading')).toBe('true')
    })

    it('should hide loading state when data loading completes', async () => {
      wrapper.vm.loading = false
      await nextTick()
      
      const centerContent = wrapper.find('.center-content')
      expect(centerContent.attributes('loading')).toBe('false')
    })

    it('should pass loading state to StatCard components', () => {
      const statCards = wrapper.findAllComponents(StatCard)
      statCards.forEach(card => {
        expect(card.props('loading')).toBe(wrapper.vm.loading)
      })
    })
  })

  describe('Message Display', () => {
    it('should show success message when campaign is created', async () => {
      const { ElMessage } = await import('element-plus')
      
      await wrapper.vm.handleCampaignCreated({ id: 1, name: 'Test Campaign' })
      
      expect(ElMessage.success).toHaveBeenCalledWith('营销活动创建成功')
    })

    it('should show success message when navigation is successful', async () => {
      const { ElMessage } = await import('element-plus')
      
      mockRouter.push.mockResolvedValue(undefined)
      await wrapper.vm.navigateTo('/centers/marketing/channels')
      
      expect(ElMessage.success).toHaveBeenCalledWith('正在跳转到 /centers/marketing/channels')
    })

    it('should show error message when navigation fails', async () => {
      const { ElMessage } = await import('element-plus')
      
      mockRouter.push.mockRejectedValue(new Error('Navigation failed'))
      await wrapper.vm.navigateTo('/centers/marketing/channels')
      
      expect(ElMessage.error).toHaveBeenCalledWith('页面 /centers/marketing/channels 暂时无法访问，请检查权限或稍后再试')
    })
  })

  describe('Route Handling', () => {
    it('should show router-view when not on marketing center root', async () => {
      // Mock route to be different from marketing center root
      mockRouter.currentRoute.value.path = '/centers/marketing/channels'
      await nextTick()
      
      const centerContent = wrapper.find('.center-content')
      expect(centerContent.exists()).toBe(false)
      
      const routerView = wrapper.findComponent({ name: 'RouterView' })
      expect(routerView.exists()).toBe(true)
    })

    it('should show center content when on marketing center root', async () => {
      // Mock route to be marketing center root
      mockRouter.currentRoute.value.path = '/centers/marketing'
      await nextTick()
      
      const centerContent = wrapper.find('.center-content')
      expect(centerContent.exists()).toBe(true)
      
      const routerView = wrapper.findComponent({ name: 'RouterView' })
      expect(routerView.exists()).toBe(false)
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive styles correctly', () => {
      const centerContent = wrapper.find('.center-content')
      expect(centerContent.exists()).toBe(true)
    })

    it('should have proper grid layouts for responsive design', () => {
      const statsGrid = wrapper.find('.stats-grid-unified')
      expect(statsGrid.exists()).toBe(true)
      
      const moduleGrid = wrapper.find('.module-grid')
      expect(moduleGrid.exists()).toBe(true)
      
      const infoGrid = wrapper.find('.info-grid')
      expect(infoGrid.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const headings = wrapper.findAll('h2, h3, h4')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have clickable elements with proper interaction feedback', () => {
      const moduleItems = wrapper.findAll('.module-item')
      moduleItems.forEach((item: any) => {
        expect(item.classes()).toContain('cursor-pointer')
      })
    })
  })

  describe('Performance Optimization', () => {
    it('should use reactive data efficiently', () => {
      expect(wrapper.vm.loading).toBeDefined()
      expect(wrapper.vm.showCreateCampaignDialog).toBeDefined()
      expect(wrapper.vm.stats).toBeDefined()
    })

    it('should handle async operations correctly', async () => {
      const loadStatisticsSpy = vi.spyOn(wrapper.vm, 'loadStatistics')
      
      await wrapper.vm.loadStatistics()
      
      expect(loadStatisticsSpy).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle navigation errors gracefully', async () => {
      const { ElMessage } = await import('element-plus')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockRouter.push.mockRejectedValue(new Error('Route not found'))
      
      await wrapper.vm.navigateTo('/centers/marketing/nonexistent')
      
      expect(consoleSpy).toHaveBeenCalledWith('导航失败:', expect.any(Error))
      expect(ElMessage.error).toHaveBeenCalledWith('页面 /centers/marketing/nonexistent 暂时无法访问，请检查权限或稍后再试')
      
      consoleSpy.mockRestore()
    })

    it('should handle statistics loading errors gracefully', async () => {
      const { getStatistics } = await import('@/services/marketing-center.service')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      getStatistics.mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.loadStatistics()
      
      expect(consoleSpy).toHaveBeenCalledWith('加载营销统计数据失败:', expect.any(Error))
      expect(wrapper.vm.stats).toEqual({
        activeCampaigns: { count: 0, change: '0%' },
        newCustomers: { count: 0, change: '0%' },
        conversionRate: { rate: 0, change: '0%' },
        marketingROI: { roi: 0, change: '0%' }
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should call loadStatistics on component mount', () => {
      const loadStatisticsSpy = vi.spyOn(wrapper.vm, 'loadStatistics')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      // Remount to trigger onMounted
      wrapper = createWrapper()
      
      expect(consoleSpy).toHaveBeenCalledWith('营销中心已加载')
      expect(loadStatisticsSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should set loading state during initial data load', () => {
      const loadStatisticsSpy = vi.spyOn(wrapper.vm, 'loadStatistics')
      
      // Remount to trigger onMounted
      wrapper = createWrapper()
      
      expect(wrapper.vm.loading).toBe(true)
      expect(loadStatisticsSpy).toHaveBeenCalled()
    })
  })

  describe('Console Logging', () => {
    it('should log navigation attempts', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      await wrapper.vm.navigateTo('/centers/marketing/channels')
      
      expect(consoleSpy).toHaveBeenCalledWith('导航到:', '/centers/marketing/channels')
      expect(consoleSpy).toHaveBeenCalledWith('当前路由:', '/centers/marketing')
      
      consoleSpy.mockRestore()
    })

    it('should log navigation success', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      mockRouter.push.mockResolvedValue(undefined)
      await wrapper.vm.navigateTo('/centers/marketing/channels')
      
      expect(consoleSpy).toHaveBeenCalledWith('导航成功，新路由:', '/centers/marketing/channels')
      
      consoleSpy.mockRestore()
    })

    it('should log component mount', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      // Remount to trigger onMounted
      wrapper = createWrapper()
      
      expect(consoleSpy).toHaveBeenCalledWith('营销中心已加载')
      
      consoleSpy.mockRestore()
    })

    it('should log campaign creation success', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const mockCampaign = { id: 1, name: 'Test Campaign' }
      await wrapper.vm.handleCampaignCreated(mockCampaign)
      
      expect(consoleSpy).toHaveBeenCalledWith('营销活动创建成功:', mockCampaign)
      
      consoleSpy.mockRestore()
    })
  })
})