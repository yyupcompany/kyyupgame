/**
 * AI Assistant Store 单元测试
 * 测试AI助手状态管理的核心功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAIAssistantStore } from '@/stores/ai-assistant'

// 控制台错误检测变量
let consoleSpy: any

describe('useAIAssistantStore', () => {
  let store: ReturnType<typeof useAIAssistantStore>

  beforeEach(() => {
    // Clear all mocks first
    vi.clearAllMocks()

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock window.dispatchEvent
    Object.defineProperty(window, 'dispatchEvent', {
      value: vi.fn(),
      configurable: true
    })

    setActivePinia(createPinia())
    store = useAIAssistantStore()

    // Mock Date.now for cache testing
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      expect(store.panelVisible.value).toBe(false)
      expect(store.panelWidth.value).toBe(400)
      expect(store.isFullscreen.value).toBe(false)
      expect(store.currentSessionId.value).toBeNull()
      expect(store.sending.value).toBe(false)
      expect(store.currentPageContext.value).toBeNull()
      expect(store.userPermissions.value).toEqual([])
      expect(store.memoryEnabled.value).toBe(true)
      expect(store.maxMemoryLines.value).toBe(500)
      expect(store.shortcutsCache.value).toEqual([])
    })
  })

  describe('panel visibility actions', () => {
    it('should show panel', () => {
      store.showPanel()
      expect(store.panelVisible.value).toBe(true)
    })

    it('should hide panel', () => {
      store.panelVisible.value = true
      store.hidePanel()
      expect(store.panelVisible.value).toBe(false)
    })

    it('should toggle panel visibility', () => {
      expect(store.panelVisible.value).toBe(false)

      store.togglePanel()
      expect(store.panelVisible.value).toBe(true)

      store.togglePanel()
      expect(store.panelVisible.value).toBe(false)
    })
  })

  describe('panel size actions', () => {
    it('should set panel width', () => {
      store.setPanelWidth(500)
      expect(store.panelWidth.value).toBe(500)
    })

    it('should handle invalid panel width', () => {
      store.setPanelWidth(-100)
      expect(store.panelWidth.value).toBe(300) // Should use minimum width

      store.setPanelWidth(2000)
      expect(store.panelWidth.value).toBe(600) // Should use maximum width (from actual implementation)
    })

    it('should toggle fullscreen mode', () => {
      expect(store.isFullscreen.value).toBe(false)

      // The actual store doesn't have toggleFullscreen, only setFullscreen
      store.setFullscreen(true)
      expect(store.isFullscreen.value).toBe(true)

      store.setFullscreen(false)
      expect(store.isFullscreen.value).toBe(false)
    })

    it('should set fullscreen mode', () => {
      store.setFullscreen(true)
      expect(store.isFullscreen.value).toBe(true)

      store.setFullscreen(false)
      expect(store.isFullscreen.value).toBe(false)
    })
  })

  describe('session management', () => {
    it('should start new session', () => {
      store.startNewSession()
      expect(store.currentSessionId.value).not.toBeNull()
      expect(typeof store.currentSessionId.value).toBe('string')
      expect(store.currentSessionId.value).toMatch(/^session_\d+_[a-z0-9]+$/)
    })

    it('should reset session in resetState', () => {
      store.startNewSession()
      expect(store.currentSessionId.value).not.toBeNull()

      store.resetState()
      expect(store.currentSessionId.value).toBeNull()
    })

    it('should set sending state', () => {
      store.setSending(true)
      expect(store.sending.value).toBe(true)

      store.setSending(false)
      expect(store.sending.value).toBe(false)
    })
  })

  describe('context management', () => {
    it('should update page context', () => {
      const mockRoute = { path: '/users' }
      const mockUserStore = {
        userPermissions: ['users:read', 'users:write'],
        userInfo: { role: 'admin' }
      }

      store.updatePageContext(mockRoute, mockUserStore)

      expect(store.currentPageContext.value).toEqual({
        route: '/users',
        title: '当前页面', // Default title from getPageTitle
        permissions: ['users:read', 'users:write'],
        timestamp: expect.any(String),
        userRole: 'admin'
      })
      expect(store.userPermissions.value).toEqual(['users:read', 'users:write'])
    })

    it('should clear context in resetState', () => {
      store.currentPageContext.value = { route: '/test' } as any
      store.resetState()
      expect(store.currentPageContext.value).toBeNull()
    })

    it('should get current context', () => {
      const mockRoute = { path: '/dashboard' }
      const mockUserStore = {
        userPermissions: ['dashboard:read'],
        userInfo: { role: 'user' }
      }

      store.updatePageContext(mockRoute, mockUserStore)
      store.startNewSession()

      const context = store.getCurrentContext()
      expect(context).toEqual({
        route: '/dashboard',
        title: '工作台',
        userRole: 'user',
        permissions: ['dashboard:read'],
        sessionId: expect.any(String),
        timestamp: expect.any(String)
      })
    })

    it('should handle page title mapping', () => {
      expect(store.getPageTitle('/dashboard')).toBe('工作台')
      expect(store.getPageTitle('/student')).toBe('学生管理')
      expect(store.getPageTitle('/unknown-path')).toBe('当前页面')
    })
  })

  describe('memory management', () => {
    it('should toggle memory enabled state', () => {
      expect(store.memoryEnabled.value).toBe(true)

      store.toggleMemory()
      expect(store.memoryEnabled.value).toBe(false)

      store.toggleMemory()
      expect(store.memoryEnabled.value).toBe(true)
    })

    it('should have default max memory lines', () => {
      expect(store.maxMemoryLines.value).toBe(500)
    })

  })

  describe('shortcuts cache management', () => {
    it('should cache shortcuts', () => {
      const shortcuts = [
        { id: '1', title: '快捷操作1', action: 'action1' },
        { id: '2', title: '快捷操作2', action: 'action2' }
      ]

      const now = Date.now()
      vi.setSystemTime(now)

      store.cacheShortcuts(shortcuts)

      expect(store.shortcutsCache.value).toEqual(shortcuts)
    })

    it('should check if shortcuts cache is valid', () => {
      const shortcuts = [{ id: '1', title: '快捷操作1' }]
      const now = 1000000

      vi.setSystemTime(now)
      store.cacheShortcuts(shortcuts)

      // Cache should be valid immediately after caching
      expect(store.isShortcutsCacheValid.value).toBe(true)

      // Move time forward by 4 minutes (less than 5 minute cache duration)
      vi.setSystemTime(now + 4 * 60 * 1000)
      expect(store.isShortcutsCacheValid.value).toBe(true)

      // Move time forward by 6 minutes (more than 5 minute cache duration)
      vi.setSystemTime(now + 6 * 60 * 1000)
      expect(store.isShortcutsCacheValid.value).toBe(false)
    })

    it('should get cached shortcuts when valid', () => {
      const shortcuts = [{ id: '1', title: '快捷操作1' }]
      const now = 1000000

      vi.setSystemTime(now)
      store.cacheShortcuts(shortcuts)

      // Should return cached shortcuts when valid
      expect(store.getCachedShortcuts()).toEqual(shortcuts)

      // Should return null when cache is invalid
      vi.setSystemTime(now + 6 * 60 * 1000)
      expect(store.getCachedShortcuts()).toBeNull()
    })

    it('should clear shortcuts cache', () => {
      store.shortcutsCache.value = [{ id: '1', title: '快捷操作1' }] as any

      store.clearShortcutsCache()

      expect(store.shortcutsCache.value).toEqual([])
    })
  })

  describe('computed properties', () => {
    it('should compute context summary', () => {
      // No context
      expect(store.contextSummary.value).toBe('无上下文')

      // With context - set the context directly since updatePageContext sets it
      store.currentPageContext.value = {
        route: '/dashboard',
        title: '工作台',
        permissions: [],
        timestamp: new Date().toISOString(),
        userRole: 'user'
      }

      expect(store.contextSummary.value).toBe('工作台 - /dashboard')
    })

    it('should compute permissions summary', () => {
      const permissions = ['users:read', 'users:write', 'admin:*', 'system:config']
      store.userPermissions.value = permissions

      expect(store.permissionsSummary.value).toBe('users:read, users:write, admin:*...')
    })
  })

  describe('state management', () => {
    it('should reset all state', () => {
      // Set up some state
      store.showPanel()
      store.setPanelWidth(600)
      store.setFullscreen(true)
      store.startNewSession()
      store.setSending(true)
      const mockRoute = { path: '/test' }
      const mockUserStore = { userPermissions: ['test:read'], userInfo: { role: 'user' } }
      store.updatePageContext(mockRoute, mockUserStore)
      store.cacheShortcuts([{ id: '1' }] as any)

      // Reset all state
      store.resetState()

      // Verify all state is reset to defaults
      expect(store.panelVisible.value).toBe(false)
      expect(store.currentSessionId.value).toBeNull()
      expect(store.sending.value).toBe(false)
      expect(store.currentPageContext.value).toBeNull()
      expect(store.userPermissions.value).toEqual([])
      expect(store.shortcutsCache.value).toEqual([])
    })
  })
});
import { vi } from 'vitest'
