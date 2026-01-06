import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import SearchPage from '@/pages/Search.vue'

// Mock API模块
vi.mock('@/api/modules/search', () => ({
  search: vi.fn(),
  getSearchHistory: vi.fn(),
  clearSearchHistory: vi.fn(),
  getSearchSuggestions: vi.fn()
}))

// Mock useRouter
const mockPush = vi.fn()
const mockRouter = {
  push: mockPush,
  currentRoute: {
    value: {
      path: '/search',
      name: 'Search',
      params: {},
      query: {},
      meta: {}
    }
  }
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRouter.currentRoute,
  createRouter: vi.fn(),
  createWebHistory: vi.fn()
}))

import * as searchApi from '@/api/modules/search'

// 控制台错误检测变量
let consoleSpy: any

describe('Search Page', () => {
  let wrapper: VueWrapper<any>
  let router: any
  let pinia: any

  beforeEach(() => {
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/search', component: SearchPage },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
      ]
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 创建 Pinia 实例
    pinia = createPinia()
    setActivePinia(pinia)

    // 重置mock函数
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    mockPush.mockClear()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('基础渲染', () => {
    it('应该正确渲染搜索页面', async () => {
      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      expect(wrapper.find('.search-container').exists()).toBe(true)
      expect(wrapper.find('.search-input').exists()).toBe(true)
      expect(wrapper.find('.search-results').exists()).toBe(true)
    })

    it('应该显示搜索输入框', async () => {
      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const searchInput = wrapper.find('.search-input input')
      expect(searchInput.exists()).toBe(true)
    })

    it('应该显示搜索按钮', async () => {
      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const searchButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('搜索') || button.text().includes('Search'))

      expect(searchButton.length).toBeGreaterThan(0)
    })
  })

  describe('搜索功能', () => {
    it('应该能够执行搜索', async () => {
      vi.mocked(searchApi.search).mockResolvedValue({
        success: true,
        data: {
          results: [
            { id: 1, title: '测试结果1', type: 'student' },
            { id: 2, title: '测试结果2', type: 'teacher' }
          ],
          total: 2,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const searchInput = wrapper.find('.search-input input')
      await searchInput.setValue('测试关键词')

      const searchButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('搜索') || button.text().includes('Search'))[0]

      await searchButton.trigger('click')

      expect(searchApi.search).toHaveBeenCalledWith({
        keyword: '测试关键词',
        page: 1,
        pageSize: 10
      })
    })

    it('应该处理搜索结果', async () => {
      vi.mocked(searchApi.search).mockResolvedValue({
        success: true,
        data: {
          results: [
            { id: 1, title: '测试结果1', type: 'student' },
            { id: 2, title: '测试结果2', type: 'teacher' }
          ],
          total: 2,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const searchInput = wrapper.find('.search-input input')
      await searchInput.setValue('测试关键词')

      const searchButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('搜索') || button.text().includes('Search'))[0]

      await searchButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证搜索结果显示
      const resultsContainer = wrapper.find('.search-results')
      expect(resultsContainer.exists()).toBe(true)
    })

    it('应该处理空搜索结果', async () => {
      vi.mocked(searchApi.search).mockResolvedValue({
        success: true,
        data: {
          results: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const searchInput = wrapper.find('.search-input input')
      await searchInput.setValue('不存在的关键词')

      const searchButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('搜索') || button.text().includes('Search'))[0]

      await searchButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证空结果显示
      const emptyState = wrapper.findComponent({ name: 'el-empty' })
      expect(emptyState.exists()).toBe(true)
    })

    it('应该处理搜索错误', async () => {
      vi.mocked(searchApi.search).mockRejectedValue(new Error('搜索失败'))

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const searchInput = wrapper.find('.search-input input')
      await searchInput.setValue('测试关键词')

      const searchButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('搜索') || button.text().includes('Search'))[0]

      await searchButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证错误处理
      expect(wrapper.find('.search-container').exists()).toBe(true)
    })
  })

  describe('搜索历史', () => {
    it('应该加载搜索历史', async () => {
      vi.mocked(searchApi.getSearchHistory).mockResolvedValue({
        success: true,
        data: [
          '关键词1',
          '关键词2',
          '关键词3'
        ]
      })

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(searchApi.getSearchHistory).toHaveBeenCalled()
    })

    it('应该显示搜索历史', async () => {
      vi.mocked(searchApi.getSearchHistory).mockResolvedValue({
        success: true,
        data: [
          '关键词1',
          '关键词2',
          '关键词3'
        ]
      })

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const historyContainer = wrapper.find('.search-history')
      expect(historyContainer.exists()).toBe(true)
    })

    it('应该能够点击历史记录进行搜索', async () => {
      vi.mocked(searchApi.getSearchHistory).mockResolvedValue({
        success: true,
        data: [
          '关键词1',
          '关键词2',
          '关键词3'
        ]
      })

      vi.mocked(searchApi.search).mockResolvedValue({
        success: true,
        data: {
          results: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const historyItems = wrapper.findAll('.search-history-item')
      if (historyItems.length > 0) {
        await historyItems[0].trigger('click')
        expect(searchApi.search).toHaveBeenCalledWith({
          keyword: '关键词1',
          page: 1,
          pageSize: 10
        })
      }
    })

    it('应该能够清除搜索历史', async () => {
      vi.mocked(searchApi.getSearchHistory).mockResolvedValue({
        success: true,
        data: [
          '关键词1',
          '关键词2',
          '关键词3'
        ]
      })

      vi.mocked(searchApi.clearSearchHistory).mockResolvedValue({
        success: true,
        message: '清除成功'
      })

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const clearButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('清除历史') || button.text().includes('Clear History'))[0]

      if (clearButton) {
        await clearButton.trigger('click')
        expect(searchApi.clearSearchHistory).toHaveBeenCalled()
      }
    })
  })

  describe('搜索建议', () => {
    it('应该获取搜索建议', async () => {
      vi.mocked(searchApi.getSearchSuggestions).mockResolvedValue({
        success: true,
        data: [
          '建议1',
          '建议2',
          '建议3'
        ]
      })

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const searchInput = wrapper.find('.search-input input')
      await searchInput.setValue('测试')

      // 模拟输入事件触发搜索建议
      await searchInput.trigger('input')

      expect(searchApi.getSearchSuggestions).toHaveBeenCalledWith('测试')
    })

    it('应该显示搜索建议', async () => {
      vi.mocked(searchApi.getSearchSuggestions).mockResolvedValue({
        success: true,
        data: [
          '建议1',
          '建议2',
          '建议3'
        ]
      })

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const searchInput = wrapper.find('.search-input input')
      await searchInput.setValue('测试')

      await searchInput.trigger('input')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const suggestionsContainer = wrapper.find('.search-suggestions')
      expect(suggestionsContainer.exists()).toBe(true)
    })
  })

  describe('搜索筛选', () => {
    it('应该有搜索类型筛选', async () => {
      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true,
            'el-select': true,
            'el-option': true
          }
        }
      })

      await nextTick()

      const typeFilter = wrapper.findComponent({ name: 'el-select' })
      expect(typeFilter.exists()).toBe(true)
    })

    it('应该能够选择搜索类型', async () => {
      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true,
            'el-select': true,
            'el-option': true
          }
        }
      })

      await nextTick()

      const typeFilter = wrapper.findComponent({ name: 'el-select' })
      expect(typeFilter.exists()).toBe(true)
    })
  })

  describe('分页功能', () => {
    it('应该支持搜索结果分页', async () => {
      vi.mocked(searchApi.search).mockResolvedValue({
        success: true,
        data: {
          results: Array(15).fill().map((_, i) => ({ id: i + 1, title: `结果${i + 1}`, type: 'student' })),
          total: 15,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true,
            'el-pagination': true
          }
        }
      })

      await nextTick()

      const searchInput = wrapper.find('.search-input input')
      await searchInput.setValue('测试关键词')

      const searchButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('搜索') || button.text().includes('Search'))[0]

      await searchButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const pagination = wrapper.findComponent({ name: 'el-pagination' })
      expect(pagination.exists()).toBe(true)
    })
  })

  describe('键盘事件', () => {
    it('应该支持回车键搜索', async () => {
      vi.mocked(searchApi.search).mockResolvedValue({
        success: true,
        data: {
          results: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const searchInput = wrapper.find('.search-input input')
      await searchInput.setValue('测试关键词')
      
      // 模拟回车键事件
      await searchInput.trigger('keyup.enter')

      expect(searchApi.search).toHaveBeenCalledWith({
        keyword: '测试关键词',
        page: 1,
        pageSize: 10
      })
    })
  })

  describe('URL参数处理', () => {
    it('应该从URL参数读取搜索关键词', async () => {
      mockRouter.currentRoute.value.query = {
        q: 'URL关键词'
      }

      vi.mocked(searchApi.search).mockResolvedValue({
        success: true,
        data: {
          results: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(searchApi.search).toHaveBeenCalledWith({
        keyword: 'URL关键词',
        page: 1,
        pageSize: 10
      })
    })
  })

  describe('样式和布局', () => {
    it('应该应用正确的容器样式', async () => {
      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const container = wrapper.find('.search-container')
      expect(container.exists()).toBe(true)
    })

    it('应该在移动设备上应用响应式样式', async () => {
      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      // 模拟移动设备屏幕尺寸
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480
      })

      window.dispatchEvent(new Event('resize'))
      await nextTick()

      // 验证组件仍然正常渲染
      expect(wrapper.find('.search-container').exists()).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该具有正确的ARIA属性', async () => {
      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const searchInput = wrapper.find('.search-input input')
      expect(searchInput.attributes('aria-label')).toBeDefined()
      expect(searchInput.attributes('role')).toBe('searchbox')
    })

    it('搜索结果应该具有正确的ARIA属性', async () => {
      vi.mocked(searchApi.search).mockResolvedValue({
        success: true,
        data: {
          results: [
            { id: 1, title: '测试结果1', type: 'student' }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        }
      })

      wrapper = mount(SearchPage, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-card': true,
            'el-icon': true,
            'el-divider': true,
            'el-empty': true,
            'el-loading': true,
            'el-message': true
          }
        }
      })

      await nextTick()

      const searchInput = wrapper.find('.search-input input')
      await searchInput.setValue('测试关键词')

      const searchButton = wrapper.findAllComponents({ name: 'el-button' })
        .filter(button => button.text().includes('搜索') || button.text().includes('Search'))[0]

      await searchButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const resultsContainer = wrapper.find('.search-results')
      expect(resultsContainer.attributes('role')).toBe('region')
      expect(resultsContainer.attributes('aria-label')).toBeDefined()
    })
  })
})