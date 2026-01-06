import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// 控制台错误检测变量
let consoleSpy: any

describe('App Store', () => {
  let appStore: ReturnType<typeof useAppStore>
  let pinia: any

  beforeEach(() => {
    vi.clearAllMocks()
    pinia = createPinia()
    setActivePinia(pinia)
    appStore = useAppStore()
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
      expect(appStore.isCollapse).toBe(false)
    })

    it('should initialize state from localStorage when available', () => {
      localStorageMock.getItem.mockReturnValue('true')
      
      const newAppStore = useAppStore()
      newAppStore.initAppState()
      
      expect(newAppStore.isCollapse).toBe(true)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('app-sidebar-collapsed')
    })

    it('should initialize with default state when localStorage has no value', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const newAppStore = useAppStore()
      newAppStore.initAppState()
      
      expect(newAppStore.isCollapse).toBe(false)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('app-sidebar-collapsed')
    })

    it('should initialize with false when localStorage has invalid value', () => {
      localStorageMock.getItem.mockReturnValue('invalid')
      
      const newAppStore = useAppStore()
      newAppStore.initAppState()
      
      expect(newAppStore.isCollapse).toBe(false)
    })
  })

  describe('toggleSidebar', () => {
    it('should toggle sidebar collapse state', () => {
      appStore.isCollapse = false
      appStore.toggleSidebar()
      
      expect(appStore.isCollapse).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app-sidebar-collapsed', 'true')
      
      appStore.toggleSidebar()
      
      expect(appStore.isCollapse).toBe(false)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app-sidebar-collapsed', 'false')
    })

    it('should persist state to localStorage when toggling', () => {
      appStore.toggleSidebar()
      
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app-sidebar-collapsed', 'true')
    })
  })

  describe('setSidebarCollapse', () => {
    it('should set sidebar collapse state to true', () => {
      appStore.setSidebarCollapse(true)
      
      expect(appStore.isCollapse).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app-sidebar-collapsed', 'true')
    })

    it('should set sidebar collapse state to false', () => {
      appStore.setSidebarCollapse(false)
      
      expect(appStore.isCollapse).toBe(false)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app-sidebar-collapsed', 'false')
    })

    it('should persist state to localStorage when setting', () => {
      appStore.setSidebarCollapse(true)
      
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('app-sidebar-collapsed', 'true')
    })

    it('should handle boolean values correctly', () => {
      appStore.setSidebarCollapse(true)
      expect(appStore.isCollapse).toBe(true)
      
      appStore.setSidebarCollapse(false)
      expect(appStore.isCollapse).toBe(false)
    })
  })

  describe('initAppState', () => {
    it('should restore state from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('true')
      
      appStore.initAppState()
      
      expect(appStore.isCollapse).toBe(true)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('app-sidebar-collapsed')
    })

    it('should handle localStorage value "true"', () => {
      localStorageMock.getItem.mockReturnValue('true')
      
      appStore.initAppState()
      
      expect(appStore.isCollapse).toBe(true)
    })

    it('should handle localStorage value "false"', () => {
      localStorageMock.getItem.mockReturnValue('false')
      
      appStore.initAppState()
      
      expect(appStore.isCollapse).toBe(false)
    })

    it('should handle null localStorage value', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      appStore.initAppState()
      
      expect(appStore.isCollapse).toBe(false)
    })

    it('should handle undefined localStorage value', () => {
      localStorageMock.getItem.mockReturnValue(undefined)
      
      appStore.initAppState()
      
      expect(appStore.isCollapse).toBe(false)
    })

    it('should handle empty string localStorage value', () => {
      localStorageMock.getItem.mockReturnValue('')
      
      appStore.initAppState()
      
      expect(appStore.isCollapse).toBe(false)
    })

    it('should handle invalid string localStorage value', () => {
      localStorageMock.getItem.mockReturnValue('invalid')
      
      appStore.initAppState()
      
      expect(appStore.isCollapse).toBe(false)
    })
  })

  describe('Integration', () => {
    it('should maintain state consistency across operations', () => {
      // Initial state
      expect(appStore.isCollapse).toBe(false)
      
      // Toggle to true
      appStore.toggleSidebar()
      expect(appStore.isCollapse).toBe(true)
      
      // Set to false
      appStore.setSidebarCollapse(false)
      expect(appStore.isCollapse).toBe(false)
      
      // Set to true
      appStore.setSidebarCollapse(true)
      expect(appStore.isCollapse).toBe(true)
      
      // Toggle to false
      appStore.toggleSidebar()
      expect(appStore.isCollapse).toBe(false)
    })

    it('should persist all state changes to localStorage', () => {
      const setSpy = vi.spyOn(localStorageMock, 'setItem')
      
      appStore.toggleSidebar()
      appStore.setSidebarCollapse(true)
      appStore.toggleSidebar()
      appStore.setSidebarCollapse(false)
      
      expect(setSpy).toHaveBeenCalledTimes(4)
      expect(setSpy).toHaveBeenNthCalledWith(1, 'app-sidebar-collapsed', 'true')
      expect(setSpy).toHaveBeenNthCalledWith(2, 'app-sidebar-collapsed', 'true')
      expect(setSpy).toHaveBeenNthCalledWith(3, 'app-sidebar-collapsed', 'false')
      expect(setSpy).toHaveBeenNthCalledWith(4, 'app-sidebar-collapsed', 'false')
    })

    it('should initialize correctly after multiple state changes', () => {
      // Change state multiple times
      appStore.toggleSidebar()
      appStore.setSidebarCollapse(true)
      appStore.toggleSidebar()
      
      // Reinitialize
      localStorageMock.getItem.mockReturnValue('false')
      appStore.initAppState()
      
      expect(appStore.isCollapse).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid toggle operations', () => {
      const originalState = appStore.isCollapse
      
      // Rapid toggles
      appStore.toggleSidebar()
      appStore.toggleSidebar()
      appStore.toggleSidebar()
      appStore.toggleSidebar()
      
      // Should be back to original state after even number of toggles
      expect(appStore.isCollapse).toBe(!originalState)
    })

    it('should handle repeated set operations with same value', () => {
      appStore.setSidebarCollapse(true)
      appStore.setSidebarCollapse(true)
      appStore.setSidebarCollapse(true)
      
      expect(appStore.isCollapse).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(3)
      expect(localStorageMock.setItem).toHaveBeenNthCalledWith(1, 'app-sidebar-collapsed', 'true')
      expect(localStorageMock.setItem).toHaveBeenNthCalledWith(2, 'app-sidebar-collapsed', 'true')
      expect(localStorageMock.setItem).toHaveBeenNthCalledWith(3, 'app-sidebar-collapsed', 'true')
    })

    it('should handle localStorage setItem failures gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available')
      })
      
      expect(() => {
        appStore.toggleSidebar()
      }).not.toThrow()
      
      // State should still change even if localStorage fails
      expect(appStore.isCollapse).toBe(true)
    })

    it('should handle localStorage getItem failures gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available')
      })
      
      expect(() => {
        appStore.initAppState()
      }).not.toThrow()
      
      // Should default to false when localStorage fails
      expect(appStore.isCollapse).toBe(false)
    })
  })
})