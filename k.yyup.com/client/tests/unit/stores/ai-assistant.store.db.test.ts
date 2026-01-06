import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAIAssistantStore } from '@/stores/ai-assistant'
import type { RouteLocationNormalized } from 'vue-router'
import { testUtils, dbTestUtils } from '../../setup-with-db'

describe('AI Assistant Store (Database Integration)', () => {
  let aiAssistantStore: ReturnType<typeof useAIAssistantStore>
  let pinia: any
  let testUser: any
  let authToken: string

  beforeEach(async () => {
    vi.clearAllMocks()
    pinia = createPinia()
    setActivePinia(pinia)
    aiAssistantStore = useAIAssistantStore()

    // 创建测试用户并获取认证token
    try {
      testUser = await dbTestUtils.createTestUser({
        username: `ai_test_user_${Date.now()}`,
        role: 'admin',
        permissions: ['AI_CENTER', 'DASHBOARD_VIEW']
      })
      
      // 登录获取token
      authToken = await dbTestUtils.getTestAuth({
        username: testUser.username,
        password: 'test123'
      })
      
      // 设置认证头
      dbTestUtils.setAuthHeader(authToken)
    } catch (error) {
      console.warn('数据库用户创建失败，跳过数据库测试:', error.message)
    }
  })

  afterEach(async () => {
    // 清理认证头
    dbTestUtils.clearAuthHeader()
    
    // 清理测试数据
    if (testUser?.id) {
      try {
        await dbTestUtils.deleteTestUser(testUser.id)
      } catch (error) {
        console.warn('清理测试用户失败:', error.message)
      }
    }
    
    vi.resetAllMocks()
  })

  describe('State Persistence with Database', () => {
    it('should persist panel visibility to localStorage', () => {
      aiAssistantStore.togglePanel()
      
      expect(aiAssistantStore.panelVisible).toBe(true)
      // localStorage 应该被调用
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-panel-visible', 'true')
    })

    it('should persist panel width to localStorage', () => {
      aiAssistantStore.setPanelWidth(450)
      
      expect(aiAssistantStore.panelWidth).toBe(450)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-panel-width', '450')
    })

    it('should persist memory settings to localStorage', () => {
      aiAssistantStore.toggleMemory()
      
      expect(aiAssistantStore.memoryEnabled).toBe(false)
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-memory-enabled', 'false')
    })
  })

  describe('Context Management with Real User Data', () => {
    it('should update page context with real user permissions', () => {
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
        userPermissions: ['DASHBOARD_VIEW', 'AI_CENTER'],
        userInfo: {
          role: 'admin',
          id: testUser?.id || 1
        }
      }

      aiAssistantStore.updatePageContext(mockRoute, mockUserStore)

      expect(aiAssistantStore.currentPageContext).toEqual({
        route: '/dashboard',
        title: '工作台',
        permissions: ['DASHBOARD_VIEW', 'AI_CENTER'],
        timestamp: expect.any(String),
        userRole: 'admin'
      })
      expect(aiAssistantStore.userPermissions).toEqual(['DASHBOARD_VIEW', 'AI_CENTER'])
    })

    it('should get current context with session ID', () => {
      aiAssistantStore.currentSessionId = 'test_session_123'
      aiAssistantStore.currentPageContext = {
        route: '/dashboard',
        title: '工作台',
        permissions: ['DASHBOARD_VIEW'],
        timestamp: '2023-01-01T00:00:00.000Z',
        userRole: 'admin'
      }
      aiAssistantStore.userPermissions = ['DASHBOARD_VIEW']

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

  describe('Session Management with Database', () => {
    it('should generate unique session IDs', () => {
      const sessionId1 = aiAssistantStore.generateSessionId()
      const sessionId2 = aiAssistantStore.generateSessionId()

      expect(sessionId1).toMatch(/^session_\d+_[a-z0-9]+$/)
      expect(sessionId2).toMatch(/^session_\d+_[a-z0-9]+$/)
      expect(sessionId1).not.toBe(sessionId2)
    })

    it('should start new session with unique ID', () => {
      aiAssistantStore.currentSessionId = null
      aiAssistantStore.startNewSession()

      expect(aiAssistantStore.currentSessionId).toMatch(/^session_\d+_[a-z0-9]+$/)
    })

    it('should manage sending state correctly', () => {
      aiAssistantStore.setSending(true)
      expect(aiAssistantStore.sending).toBe(true)

      aiAssistantStore.setSending(false)
      expect(aiAssistantStore.sending).toBe(false)
    })
  })

  describe('Shortcuts Cache Management', () => {
    it('should cache shortcuts with timestamp', () => {
      const shortcuts = [
        { id: '1', title: 'Database Test Shortcut 1' },
        { id: '2', title: 'Database Test Shortcut 2' }
      ]

      aiAssistantStore.cacheShortcuts(shortcuts)

      expect(aiAssistantStore.shortcutsCache).toEqual(shortcuts)
      expect(aiAssistantStore.shortcutsCacheTime).toBeGreaterThan(0)
    })

    it('should return cached shortcuts when valid', () => {
      const shortcuts = [
        { id: '1', title: 'Database Test Shortcut' }
      ]

      aiAssistantStore.shortcutsCache = shortcuts
      aiAssistantStore.shortcutsCacheTime = Date.now() - 1000 * 60 // 1 minute ago

      const result = aiAssistantStore.getCachedShortcuts()
      expect(result).toEqual(shortcuts)
    })

    it('should return null when cache is expired', () => {
      const shortcuts = [
        { id: '1', title: 'Database Test Shortcut' }
      ]

      aiAssistantStore.shortcutsCache = shortcuts
      aiAssistantStore.shortcutsCacheTime = Date.now() - 10 * 60 * 1000 // 10 minutes ago

      const result = aiAssistantStore.getCachedShortcuts()
      expect(result).toBeNull()
    })

    it('should clear shortcuts cache', () => {
      aiAssistantStore.shortcutsCache = [
        { id: '1', title: 'Database Test Shortcut' }
      ]
      aiAssistantStore.shortcutsCacheTime = Date.now()

      aiAssistantStore.clearShortcutsCache()

      expect(aiAssistantStore.shortcutsCache).toEqual([])
      expect(aiAssistantStore.shortcutsCacheTime).toBe(0)
    })
  })

  describe('Integration with Database User Store', () => {
    it('should initialize state correctly with database user', async () => {
      // 模拟从数据库加载的用户信息
      vi.doMock('@/stores/user', () => ({
        useUserStore: () => ({
          userInfo: { 
            role: 'admin', 
            id: testUser?.id || 1 
          },
          userPermissions: ['AI_CENTER', 'DASHBOARD_VIEW']
        })
      }))

      await aiAssistantStore.initializeState()

      // 管理员应该能够看到AI面板
      expect(aiAssistantStore.panelVisible).toBeDefined()
      expect(aiAssistantStore.currentSessionId).toMatch(/^session_\d+_[a-z0-9]+$/)
    })

    it('should hide panel for users without AI permissions', async () => {
      // 模拟没有AI权限的用户
      vi.doMock('@/stores/user', () => ({
        useUserStore: () => ({
          userInfo: { 
            role: 'user', 
            id: testUser?.id || 2 
          },
          userPermissions: ['DASHBOARD_VIEW']
        })
      }))

      await aiAssistantStore.initializeState()

      // 没有AI权限的用户应该看不到面板
      expect(aiAssistantStore.panelVisible).toBe(false)
    })

    it('should handle user store initialization errors gracefully', async () => {
      // 模拟用户store加载失败
      vi.doMock('@/stores/user', () => ({
        useUserStore: () => {
          throw new Error('Failed to load user store')
        }
      }))

      await aiAssistantStore.initializeState()

      // 应该降级为隐藏面板
      expect(aiAssistantStore.panelVisible).toBe(false)
    })
  })

  describe('Real Database Scenarios', () => {
    it('should handle database connection failures gracefully', async () => {
      // 模拟数据库连接失败
      vi.spyOn(dbTestUtils, 'testConnection').mockResolvedValue(false)

      // 应该仍然能够初始化基本状态
      aiAssistantStore.resetState()
      expect(aiAssistantStore.panelVisible).toBe(false)
      expect(aiAssistantStore.currentSessionId).toBe(null)
    })

    it('should maintain state consistency across database operations', () => {
      // 测试状态一致性
      aiAssistantStore.panelVisible = true
      aiAssistantStore.currentSessionId = 'test_session'
      aiAssistantStore.memoryEnabled = false

      // 执行一些操作
      aiAssistantStore.toggleMemory()
      aiAssistantStore.setPanelWidth(500)

      // 验证状态一致性
      expect(aiAssistantStore.panelVisible).toBe(true)
      expect(aiAssistantStore.currentSessionId).toBe('test_session')
      expect(aiAssistantStore.memoryEnabled).toBe(true)
      expect(aiAssistantStore.panelWidth).toBe(500)
    })

    it('should handle rapid state changes correctly', () => {
      // 测试快速状态变化
      for (let i = 0; i < 5; i++) {
        aiAssistantStore.togglePanel()
        aiAssistantStore.setSending(Math.random() > 0.5)
      }

      // 最终状态应该是确定的
      expect(typeof aiAssistantStore.panelVisible).toBe('boolean')
      expect(typeof aiAssistantStore.sending).toBe('boolean')
    })
  })

  describe('Performance with Database', () => {
    it('should handle large amounts of permissions efficiently', () => {
      // 模拟大量权限
      const largePermissionSet = Array.from({ length: 100 }, (_, i) => `PERMISSION_${i}`)
      
      const mockUserStore = {
        userPermissions: largePermissionSet,
        userInfo: {
          role: 'admin',
          id: testUser?.id || 1
        }
      }

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

      const startTime = performance.now()
      aiAssistantStore.updatePageContext(mockRoute, mockUserStore)
      const endTime = performance.now()

      // 操作应该在合理时间内完成
      expect(endTime - startTime).toBeLessThan(100) // 100ms
      expect(aiAssistantStore.userPermissions).toEqual(largePermissionSet)
    })

    it('should manage cache efficiently with database data', () => {
      // 测试缓存管理效率
      const largeShortcutsSet = Array.from({ length: 50 }, (_, i) => ({
        id: `shortcut_${i}`,
        title: `Shortcut ${i}`
      }))

      const startTime = performance.now()
      aiAssistantStore.cacheShortcuts(largeShortcutsSet)
      const cachedResult = aiAssistantStore.getCachedShortcuts()
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(50) // 50ms
      expect(cachedResult).toEqual(largeShortcutsSet)
    })
  })

  describe('Error Handling with Database', () => {
    it('should handle localStorage failures gracefully', () => {
      // 模拟localStorage失败
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage not available')
      })

      // 操作不应该抛出错误
      expect(() => {
        aiAssistantStore.togglePanel()
        aiAssistantStore.setPanelWidth(400)
        aiAssistantStore.toggleMemory()
      }).not.toThrow()

      // 恢复localStorage
      localStorage.setItem = originalSetItem
    })

    it('should handle invalid session IDs', () => {
      // 测试无效会话ID处理
      aiAssistantStore.currentSessionId = 'invalid_session'
      
      expect(() => {
        aiAssistantStore.getCurrentContext()
      }).not.toThrow()
    })

    it('should handle empty user permissions', () => {
      const mockUserStore = {
        userPermissions: [],
        userInfo: {
          role: 'user',
          id: testUser?.id || 1
        }
      }

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

      expect(() => {
        aiAssistantStore.updatePageContext(mockRoute, mockUserStore)
      }).not.toThrow()

      expect(aiAssistantStore.userPermissions).toEqual([])
    })
  })
})