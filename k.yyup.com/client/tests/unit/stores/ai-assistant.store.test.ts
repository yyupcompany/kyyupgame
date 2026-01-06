import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAIAssistantStore } from '@/stores/ai-assistant'
import type { RouteLocationNormalized } from 'vue-router'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// Mock window dispatchEvent
const mockDispatchEvent = vi.fn()
global.window = Object.create(window)
global.window.dispatchEvent = mockDispatchEvent

// 控制台错误检测变量
let consoleSpy: any

describe('AI Assistant Store', () => {
  let aiAssistantStore: ReturnType<typeof useAIAssistantStore>
  let pinia: any

  beforeEach(() => {
    vi.clearAllMocks()
    pinia = createPinia()
    setActivePinia(pinia)
    aiAssistantStore = useAIAssistantStore()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    vi.resetAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('State Initialization', () => {
    it('should initialize with default state', () => {
      expect(aiAssistantStore.panelVisible).toBe(false)
      expect(aiAssistantStore.panelWidth).toBe(400)
      expect(aiAssistantStore.isFullscreen).toBe(false)
      expect(aiAssistantStore.currentSessionId).toBe(null)
      expect(aiAssistantStore.sending).toBe(false)
      expect(aiAssistantStore.currentPageContext).toBe(null)
      expect(aiAssistantStore.userPermissions).toEqual([])
      expect(aiAssistantStore.memoryEnabled).toBe(true)
      expect(aiAssistantStore.maxMemoryLines).toBe(500)
      expect(aiAssistantStore.shortcutsCache).toEqual([])
      expect(aiAssistantStore.shortcutsCacheTime).toBe(0)
    })
  })

  describe('Computed Properties', () => {
    it('should compute context summary correctly when context exists', () => {
      aiAssistantStore.currentPageContext = {
        route: '/dashboard',
        title: '仪表板',
        permissions: ['DASHBOARD_VIEW'],
        timestamp: '2023-01-01T00:00:00.000Z'
      }

      expect(aiAssistantStore.contextSummary).toBe('仪表板 - /dashboard')
    })

    it('should return default context summary when no context exists', () => {
      expect(aiAssistantStore.contextSummary).toBe('无上下文')
    })

    it('should compute permissions summary correctly', () => {
      aiAssistantStore.userPermissions = ['DASHBOARD_VIEW', 'USER_VIEW', 'ADMIN_VIEW', 'SYSTEM_VIEW']
      
      expect(aiAssistantStore.permissionsSummary).toBe('DASHBOARD_VIEW, USER_VIEW, ADMIN_VIEW...')
    })

    it('should compute permissions summary with less than 3 permissions', () => {
      aiAssistantStore.userPermissions = ['DASHBOARD_VIEW', 'USER_VIEW']
      
      expect(aiAssistantStore.permissionsSummary).toBe('DASHBOARD_VIEW, USER_VIEW')
    })

    it('should check if shortcuts cache is valid', () => {
      aiAssistantStore.shortcutsCacheTime = Date.now() - 1000 * 60 // 1 minute ago
      expect(aiAssistantStore.isShortcutsCacheValid).toBe(true)

      aiAssistantStore.shortcutsCacheTime = Date.now() - 10 * 60 * 1000 // 10 minutes ago
      expect(aiAssistantStore.isShortcutsCacheValid).toBe(false)
    })
  })

  describe('Panel Actions', () => {
    it('should toggle panel visibility', () => {
      aiAssistantStore.panelVisible = false
      aiAssistantStore.togglePanel()
      
      expect(aiAssistantStore.panelVisible).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-panel-visible', 'true')
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ai-panel-toggle',
          detail: { visible: true }
        })
      )

      aiAssistantStore.togglePanel()
      
      expect(aiAssistantStore.panelVisible).toBe(false)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-panel-visible', 'false')
    })

    it('should show panel', () => {
      aiAssistantStore.panelVisible = false
      aiAssistantStore.showPanel()
      
      expect(aiAssistantStore.panelVisible).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-panel-visible', 'true')
    })

    it('should hide panel', () => {
      aiAssistantStore.panelVisible = true
      aiAssistantStore.hidePanel()
      
      expect(aiAssistantStore.panelVisible).toBe(false)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-panel-visible', 'false')
    })

    it('should set panel width within bounds', () => {
      aiAssistantStore.setPanelWidth(350)
      expect(aiAssistantStore.panelWidth).toBe(350)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-panel-width', '350')

      aiAssistantStore.setPanelWidth(250) // Below minimum
      expect(aiAssistantStore.panelWidth).toBe(300)
      
      aiAssistantStore.setPanelWidth(700) // Above maximum
      expect(aiAssistantStore.panelWidth).toBe(600)
    })

    it('should set fullscreen state', () => {
      aiAssistantStore.setFullscreen(true)
      expect(aiAssistantStore.isFullscreen).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-fullscreen', 'true')

      aiAssistantStore.setFullscreen(false)
      expect(aiAssistantStore.isFullscreen).toBe(false)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-fullscreen', 'false')
    })
  })

  describe('Context Management', () => {
    it('should update page context', () => {
      const mockRoute: RouteLocationNormalized = {
        path: '/dashboard',
        fullPath: '/dashboard',
        params: {},
        query: {},
        hash: '',
        name: 'Dashboard',
        meta: {},
        matched: []
      }

      const mockUserStore = {
        userPermissions: ['DASHBOARD_VIEW', 'USER_VIEW'],
        userInfo: {
          role: 'admin'
        }
      }

      aiAssistantStore.updatePageContext(mockRoute, mockUserStore)

      expect(aiAssistantStore.currentPageContext).toEqual({
        route: '/dashboard',
        title: '工作台',
        permissions: ['DASHBOARD_VIEW', 'USER_VIEW'],
        timestamp: expect.any(String),
        userRole: 'admin'
      })
      expect(aiAssistantStore.userPermissions).toEqual(['DASHBOARD_VIEW', 'USER_VIEW'])
    })

    it('should get page title for known routes', () => {
      expect(aiAssistantStore.getPageTitle('/dashboard')).toBe('工作台')
      expect(aiAssistantStore.getPageTitle('/student')).toBe('学生管理')
      expect(aiAssistantStore.getPageTitle('/teacher')).toBe('教师管理')
    })

    it('should get page title for center routes', () => {
      expect(aiAssistantStore.getPageTitle('/centers/dashboard')).toBe('仪表板中心')
      expect(aiAssistantStore.getPageTitle('/centers/personnel')).toBe('人事中心')
      expect(aiAssistantStore.getPageTitle('/centers/activity')).toBe('活动中心')
    })

    it('should return default title for unknown routes', () => {
      expect(aiAssistantStore.getPageTitle('/unknown/route')).toBe('当前页面')
    })

    it('should get current context', () => {
      aiAssistantStore.currentPageContext = {
        route: '/dashboard',
        title: '工作台',
        permissions: ['DASHBOARD_VIEW'],
        timestamp: '2023-01-01T00:00:00.000Z',
        userRole: 'admin'
      }
      aiAssistantStore.userPermissions = ['DASHBOARD_VIEW']
      aiAssistantStore.currentSessionId = 'test_session_123'

      const context = aiAssistantStore.getCurrentContext()

      expect(context).toEqual({
        route: '/dashboard',
        title: '工作台',
        userRole: 'admin',
        permissions: ['DASHBOARD_VIEW'],
        sessionId: 'test_session_123',
        timestamp: expect.any(String)
      })
    })
  })

  describe('Session Management', () => {
    it('should generate unique session IDs', () => {
      const sessionId1 = aiAssistantStore.generateSessionId()
      const sessionId2 = aiAssistantStore.generateSessionId()

      expect(sessionId1).toMatch(/^session_\d+_[a-z0-9]+$/)
      expect(sessionId2).toMatch(/^session_\d+_[a-z0-9]+$/)
      expect(sessionId1).not.toBe(sessionId2)
    })

    it('should start new session', () => {
      aiAssistantStore.currentSessionId = null
      aiAssistantStore.startNewSession()

      expect(aiAssistantStore.currentSessionId).toMatch(/^session_\d+_[a-z0-9]+$/)
    })

    it('should set sending status', () => {
      aiAssistantStore.setSending(true)
      expect(aiAssistantStore.sending).toBe(true)

      aiAssistantStore.setSending(false)
      expect(aiAssistantStore.sending).toBe(false)
    })
  })

  describe('Shortcuts Cache Management', () => {
    it('should cache shortcuts', () => {
      const shortcuts = [
        { id: '1', title: 'Test Shortcut 1' },
        { id: '2', title: 'Test Shortcut 2' }
      ]

      aiAssistantStore.cacheShortcuts(shortcuts)

      expect(aiAssistantStore.shortcutsCache).toEqual(shortcuts)
      expect(aiAssistantStore.shortcutsCacheTime).toBeGreaterThan(0)
    })

    it('should get cached shortcuts when valid', () => {
      const shortcuts = [
        { id: '1', title: 'Test Shortcut 1' }
      ]

      aiAssistantStore.shortcutsCache = shortcuts
      aiAssistantStore.shortcutsCacheTime = Date.now() - 1000 * 60 // 1 minute ago

      const result = aiAssistantStore.getCachedShortcuts()
      expect(result).toEqual(shortcuts)
    })

    it('should return null when cache is invalid', () => {
      const shortcuts = [
        { id: '1', title: 'Test Shortcut 1' }
      ]

      aiAssistantStore.shortcutsCache = shortcuts
      aiAssistantStore.shortcutsCacheTime = Date.now() - 10 * 60 * 1000 // 10 minutes ago

      const result = aiAssistantStore.getCachedShortcuts()
      expect(result).toBeNull()
    })

    it('should clear shortcuts cache', () => {
      aiAssistantStore.shortcutsCache = [
        { id: '1', title: 'Test Shortcut 1' }
      ]
      aiAssistantStore.shortcutsCacheTime = Date.now()

      aiAssistantStore.clearShortcutsCache()

      expect(aiAssistantStore.shortcutsCache).toEqual([])
      expect(aiAssistantStore.shortcutsCacheTime).toBe(0)
    })
  })

  describe('Memory Management', () => {
    it('should toggle memory enabled state', () => {
      aiAssistantStore.memoryEnabled = true
      aiAssistantStore.toggleMemory()

      expect(aiAssistantStore.memoryEnabled).toBe(false)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-memory-enabled', 'false')

      aiAssistantStore.toggleMemory()
      expect(aiAssistantStore.memoryEnabled).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-memory-enabled', 'true')
    })
  })

  describe('State Management', () => {
    it('should reset state', () => {
      aiAssistantStore.panelVisible = true
      aiAssistantStore.currentSessionId = 'test_session'
      aiAssistantStore.sending = true
      aiAssistantStore.currentPageContext = {
        route: '/dashboard',
        title: '工作台',
        permissions: ['DASHBOARD_VIEW'],
        timestamp: '2023-01-01T00:00:00.000Z'
      }
      aiAssistantStore.userPermissions = ['DASHBOARD_VIEW']
      aiAssistantStore.shortcutsCache = [{ id: '1', title: 'Test' }]

      aiAssistantStore.resetState()

      expect(aiAssistantStore.panelVisible).toBe(false)
      expect(aiAssistantStore.currentSessionId).toBe(null)
      expect(aiAssistantStore.sending).toBe(false)
      expect(aiAssistantStore.currentPageContext).toBe(null)
      expect(aiAssistantStore.userPermissions).toEqual([])
      expect(aiAssistantStore.shortcutsCache).toEqual([])
    })

    it('should initialize state from localStorage', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        switch (key) {
          case 'ai-panel-visible': return 'true'
          case 'ai-panel-width': return '450'
          case 'ai-memory-enabled': return 'false'
          default: return null
        }
      })

      // Mock user store with admin role
      vi.doMock('@/stores/user', () => ({
        useUserStore: () => ({
          userInfo: { role: 'admin' },
          userPermissions: ['ADMIN_VIEW']
        })
      }))

      await aiAssistantStore.initializeState()

      expect(aiAssistantStore.panelVisible).toBe(true)
      expect(aiAssistantStore.panelWidth).toBe(450)
      expect(aiAssistantStore.memoryEnabled).toBe(false)
      expect(aiAssistantStore.currentSessionId).toMatch(/^session_\d+_[a-z0-9]+$/)
    })

    it('should hide panel when user has no AI permission', async () => {
      localStorageMock.getItem.mockReturnValue('true')

      // Mock user store with non-admin role
      vi.doMock('@/stores/user', () => ({
        useUserStore: () => ({
          userInfo: { role: 'user' },
          userPermissions: ['USER_VIEW']
        })
      }))

      await aiAssistantStore.initializeState()

      expect(aiAssistantStore.panelVisible).toBe(false)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-panel-visible', 'false')
    })

    it('should hide panel when user store check fails', async () => {
      localStorageMock.getItem.mockReturnValue('true')

      // Mock user store to throw error
      vi.doMock('@/stores/user', () => ({
        useUserStore: () => {
          throw new Error('Failed to load user store')
        }
      }))

      await aiAssistantStore.initializeState()

      expect(aiAssistantStore.panelVisible).toBe(false)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-panel-visible', 'false')
    })
  })
})