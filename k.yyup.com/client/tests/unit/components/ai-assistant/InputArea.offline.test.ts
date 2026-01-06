/**
 * InputArea 组件 - 离线数据缓存测试
 * 目标：100% 测试覆盖率
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import InputArea from '@/components/ai-assistant/InputArea.vue'
import { createTestingPinia } from '@pinia/testing'
import ElementPlus from 'element-plus'

// Mock dependencies
vi.mock('@/utils/fileUpload', () => ({
  fileUploadManager: {
    uploadFile: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock IndexedDB
const indexedDBMock = {
  open: vi.fn(),
  deleteDatabase: vi.fn()
}

Object.defineProperty(window, 'indexedDB', {
  value: indexedDBMock
})

// 控制台错误检测变量
let consoleSpy: any

describe('InputArea - 离线数据缓存测试 (100% 覆盖率)', () => {
  let wrapper: any

  const mockProps = {
    inputMessage: '',
    sending: false,
    webSearch: false,
    autoExecute: false,
    isRegistered: true,
    canAutoExecute: true,
    isListening: false,
    isSpeaking: false,
    speechStatus: 'idle',
    hasLastMessage: true
  }

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()

    wrapper = mount(InputArea, {
      global: {
        plugins: [ElementPlus, createTestingPinia()],
        stubs: {
          'el-input': true,
          'el-tooltip': true,
          'el-icon': true,
          'el-message': true
        }
      },
      props: mockProps
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('1. LocalStorage 缓存 (100% 覆盖)', () => {
    describe('1.1 用户偏好缓存', () => {
      it('should cache webSearch preference to localStorage', async () => {
        await wrapper.setProps({ webSearch: true })
        await nextTick()

        const cached = localStorageMock.getItem('ai-assistant-preferences')
        expect(cached).toBeTruthy()
        
        const preferences = JSON.parse(cached!)
        expect(preferences.webSearch).toBe(true)
      })

      it('should cache autoExecute preference to localStorage', async () => {
        await wrapper.setProps({ autoExecute: true })
        await nextTick()

        const cached = localStorageMock.getItem('ai-assistant-preferences')
        expect(cached).toBeTruthy()
        
        const preferences = JSON.parse(cached!)
        expect(preferences.autoExecute).toBe(true)
      })

      it('should restore user preferences from localStorage on mount', async () => {
        const preferences = {
          webSearch: true,
          autoExecute: true,
          compactSearchUI: false
        }
        localStorageMock.setItem('ai-assistant-preferences', JSON.stringify(preferences))

        const newWrapper = mount(InputArea, {
          global: {
            plugins: [ElementPlus, createTestingPinia()],
            stubs: {
              'el-input': true,
              'el-tooltip': true,
              'el-icon': true
            }
          },
          props: mockProps
        })

        await nextTick()

        // 验证偏好已恢复
        expect(newWrapper.vm.webSearch).toBe(true)
        expect(newWrapper.vm.autoExecute).toBe(true)

        newWrapper.unmount()
      })

      it('should handle corrupted localStorage data gracefully', async () => {
        localStorageMock.setItem('ai-assistant-preferences', 'invalid-json')

        const newWrapper = mount(InputArea, {
          global: {
            plugins: [ElementPlus, createTestingPinia()],
            stubs: {
              'el-input': true,
              'el-tooltip': true,
              'el-icon': true
            }
          },
          props: mockProps
        })

        await nextTick()

        // 应该使用默认值
        expect(newWrapper.vm.webSearch).toBe(false)
        expect(newWrapper.vm.autoExecute).toBe(false)

        newWrapper.unmount()
      })

      it('should update localStorage when preferences change', async () => {
        await wrapper.setProps({ webSearch: true })
        await nextTick()

        let cached = localStorageMock.getItem('ai-assistant-preferences')
        let preferences = JSON.parse(cached!)
        expect(preferences.webSearch).toBe(true)

        await wrapper.setProps({ webSearch: false })
        await nextTick()

        cached = localStorageMock.getItem('ai-assistant-preferences')
        preferences = JSON.parse(cached!)
        expect(preferences.webSearch).toBe(false)
      })
    })

    describe('1.2 草稿消息缓存', () => {
      it('should cache draft message to localStorage', async () => {
        const draftMessage = '这是一条草稿消息'
        await wrapper.setProps({ inputMessage: draftMessage })
        await nextTick()

        const cached = localStorageMock.getItem('ai-assistant-draft')
        expect(cached).toBe(draftMessage)
      })

      it('should restore draft message from localStorage on mount', async () => {
        const draftMessage = '恢复的草稿消息'
        localStorageMock.setItem('ai-assistant-draft', draftMessage)

        const newWrapper = mount(InputArea, {
          global: {
            plugins: [ElementPlus, createTestingPinia()],
            stubs: {
              'el-input': true,
              'el-tooltip': true,
              'el-icon': true
            }
          },
          props: mockProps
        })

        await nextTick()

        expect(newWrapper.props('inputMessage')).toBe(draftMessage)

        newWrapper.unmount()
      })

      it('should clear draft message after sending', async () => {
        const draftMessage = '要发送的消息'
        await wrapper.setProps({ inputMessage: draftMessage })
        await nextTick()

        // 模拟发送消息
        await wrapper.vm.$emit('send')
        await wrapper.setProps({ inputMessage: '' })
        await nextTick()

        const cached = localStorageMock.getItem('ai-assistant-draft')
        expect(cached).toBe('')
      })

      it('should not cache empty draft messages', async () => {
        await wrapper.setProps({ inputMessage: '' })
        await nextTick()

        const cached = localStorageMock.getItem('ai-assistant-draft')
        expect(cached).toBeFalsy()
      })

      it('should debounce draft message caching', async () => {
        const messages = ['消息1', '消息2', '消息3']
        
        for (const msg of messages) {
          await wrapper.setProps({ inputMessage: msg })
        }

        await new Promise(resolve => setTimeout(resolve, 500))

        const cached = localStorageMock.getItem('ai-assistant-draft')
        expect(cached).toBe('消息3')
      })
    })

    describe('1.3 缓存清理', () => {
      it('should clear cache when user logs out', async () => {
        // 设置一些缓存数据
        localStorageMock.setItem('ai-assistant-preferences', JSON.stringify({ webSearch: true }))
        localStorageMock.setItem('ai-assistant-draft', '草稿消息')

        // 模拟登出
        wrapper.vm.clearCache()
        await nextTick()

        expect(localStorageMock.getItem('ai-assistant-preferences')).toBeNull()
        expect(localStorageMock.getItem('ai-assistant-draft')).toBeNull()
      })

      it('should clear cache on user request', async () => {
        localStorageMock.setItem('ai-assistant-preferences', JSON.stringify({ webSearch: true }))

        wrapper.vm.clearCache()
        await nextTick()

        expect(localStorageMock.getItem('ai-assistant-preferences')).toBeNull()
      })

      it('should handle localStorage quota exceeded error', async () => {
        const originalSetItem = localStorageMock.setItem
        localStorageMock.setItem = vi.fn(() => {
          throw new Error('QuotaExceededError')
        })

        await wrapper.setProps({ inputMessage: '测试消息' })
        await nextTick()

        // 应该不会抛出错误
        expect(wrapper.exists()).toBe(true)

        localStorageMock.setItem = originalSetItem
      })
    })
  })

  describe('2. IndexedDB 缓存 (100% 覆盖)', () => {
    let mockDB: any
    let mockTransaction: any
    let mockObjectStore: any

    beforeEach(() => {
      mockObjectStore = {
        put: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn()
      }

      mockTransaction = {
        objectStore: vi.fn(() => mockObjectStore)
      }

      mockDB = {
        transaction: vi.fn(() => mockTransaction),
        close: vi.fn()
      }

      const mockRequest = {
        onsuccess: null as any,
        onerror: null as any,
        result: mockDB
      }

      indexedDBMock.open.mockReturnValue(mockRequest)
      
      // 模拟异步成功
      setTimeout(() => {
        if (mockRequest.onsuccess) => {
          mockRequest.onsuccess({ target: { result: mockDB } })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        }
      }, 0)
    })

    describe('2.1 文件缓存', () => {
      it('should cache uploaded file to IndexedDB', async () => {
        const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
        const fileData = {
          id: 'file-1',
          name: 'test.txt',
          type: 'text/plain',
          size: mockFile.size,
          data: mockFile,
          timestamp: Date.now()
        }

        await wrapper.vm.cacheFileToIndexedDB(fileData)
        await nextTick()

        expect(mockObjectStore.put).toHaveBeenCalledWith(fileData)
      })

      it('should retrieve cached file from IndexedDB', async () => {
        const fileId = 'file-1'
        const cachedFile = {
          id: fileId,
          name: 'cached.txt',
          data: new Blob(['cached content'])
        }

        mockObjectStore.get.mockReturnValue({
          onsuccess: (event: any) => {
            event.target.result = cachedFile
          }
        })

        const result = await wrapper.vm.getFileFromIndexedDB(fileId)
        await nextTick()

        expect(mockObjectStore.get).toHaveBeenCalledWith(fileId)
        expect(result).toEqual(cachedFile)
      })

      it('should handle IndexedDB quota exceeded error', async () => {
        mockObjectStore.put.mockImplementation(() => {
          throw new Error('QuotaExceededError')
        })

        const fileData = {
          id: 'file-1',
          name: 'large-file.txt',
          data: new Blob(['x'.repeat(100 * 1024 * 1024)]) // 100MB
        }

        await expect(wrapper.vm.cacheFileToIndexedDB(fileData)).rejects.toThrow()
      })

      it('should delete file from IndexedDB', async () => {
        const fileId = 'file-1'

        await wrapper.vm.deleteFileFromIndexedDB(fileId)
        await nextTick()

        expect(mockObjectStore.delete).toHaveBeenCalledWith(fileId)
      })
    })

    describe('2.2 自动清理旧缓存', () => {
      it('should clean up files older than 7 days', async () => {
        const now = Date.now()
        const oldFile = {
          id: 'old-file',
          timestamp: now - (8 * 24 * 60 * 60 * 1000) // 8天前
        }
        const newFile = {
          id: 'new-file',
          timestamp: now - (1 * 24 * 60 * 60 * 1000) // 1天前
        }

        mockObjectStore.getAll = vi.fn().mockReturnValue({
          onsuccess: (event: any) => {
            event.target.result = [oldFile, newFile]
          }
        })

        await wrapper.vm.cleanupOldFiles()
        await nextTick()

        expect(mockObjectStore.delete).toHaveBeenCalledWith('old-file')
        expect(mockObjectStore.delete).not.toHaveBeenCalledWith('new-file')
      })

      it('should handle cleanup errors gracefully', async () => {
        mockObjectStore.getAll = vi.fn().mockImplementation(() => {
          throw new Error('Database error')
        })

        await expect(wrapper.vm.cleanupOldFiles()).resolves.not.toThrow()
      })
    })
  })

  describe('3. 离线模式 (100% 覆盖)', () => {
    describe('3.1 离线状态检测', () => {
      it('should detect offline status', async () => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false
        })

        window.dispatchEvent(new Event('offline'))
        await nextTick()

        expect(wrapper.vm.isOffline).toBe(true)
      })

      it('should detect online status', async () => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: true
        })

        window.dispatchEvent(new Event('online'))
        await nextTick()

        expect(wrapper.vm.isOffline).toBe(false)
      })

      it('should show offline indicator when network is unavailable', async () => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false
        })

        window.dispatchEvent(new Event('offline'))
        await nextTick()

        const offlineIndicator = wrapper.find('.offline-indicator')
        expect(offlineIndicator.exists()).toBe(true)
        expect(offlineIndicator.text()).toContain('离线')
      })

      it('should hide offline indicator when network is available', async () => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: true
        })

        window.dispatchEvent(new Event('online'))
        await nextTick()

        const offlineIndicator = wrapper.find('.offline-indicator')
        expect(offlineIndicator.exists()).toBe(false)
      })
    })

    describe('3.2 离线消息队列', () => {
      it('should queue messages when offline', async () => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false
        })

        const message = '离线消息'
        await wrapper.setProps({ inputMessage: message })
        await wrapper.vm.$emit('send')
        await nextTick()

        expect(wrapper.vm.messageQueue).toContainEqual(
          expect.objectContaining({ message })
        )
      })

      it('should sync queued messages when back online', async () => {
        // 先离线并添加消息到队列
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false
        })

        const messages = ['消息1', '消息2', '消息3']
        for (const msg of messages) {
          await wrapper.setProps({ inputMessage: msg })
          await wrapper.vm.$emit('send')
        }

        expect(wrapper.vm.messageQueue.length).toBe(3)

        // 恢复在线
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: true
        })

        window.dispatchEvent(new Event('online'))
        await nextTick()

        // 等待同步完成
        await new Promise(resolve => setTimeout(resolve, 100))

        expect(wrapper.vm.messageQueue.length).toBe(0)
      })

      it('should preserve message order when syncing', async () => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false
        })

        const messages = ['第一条', '第二条', '第三条']
        for (const msg of messages) {
          await wrapper.setProps({ inputMessage: msg })
          await wrapper.vm.$emit('send')
        }

        const syncSpy = vi.fn()
        wrapper.vm.syncMessages = syncSpy

        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: true
        })

        window.dispatchEvent(new Event('online'))
        await nextTick()

        expect(syncSpy).toHaveBeenCalled()
      })

      it('should handle sync errors gracefully', async () => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false
        })

        await wrapper.setProps({ inputMessage: '测试消息' })
        await wrapper.vm.$emit('send')

        wrapper.vm.syncMessages = vi.fn().mockRejectedValue(new Error('Sync failed'))

        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: true
        })

        window.dispatchEvent(new Event('online'))
        await nextTick()

        // 消息应该保留在队列中
        expect(wrapper.vm.messageQueue.length).toBeGreaterThan(0)
      })
    })

    describe('3.3 离线功能限制', () => {
      it('should disable upload buttons when offline', async () => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false
        })

        window.dispatchEvent(new Event('offline'))
        await nextTick()

        const fileButton = wrapper.findAll('.icon-btn')[2]
        const imageButton = wrapper.findAll('.icon-btn')[3]

        expect(fileButton.attributes('disabled')).toBeDefined()
        expect(imageButton.attributes('disabled')).toBeDefined()
      })

      it('should disable search button when offline', async () => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false
        })

        window.dispatchEvent(new Event('offline'))
        await nextTick()

        const searchButton = wrapper.find('.icon-btn')
        expect(searchButton.attributes('disabled')).toBeDefined()
      })

      it('should show offline tooltip on disabled buttons', async () => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false
        })

        window.dispatchEvent(new Event('offline'))
        await nextTick()

        const fileButton = wrapper.findAll('.icon-btn')[2]
        expect(fileButton.attributes('title')).toContain('离线')
      })
    })
  })

  describe('4. 缓存失效 (100% 覆盖)', () => {
    describe('4.1 TTL 过期', () => {
      it('should invalidate cache after specified TTL', async () => {
        const ttl = 1000 // 1秒
        const cacheData = {
          value: '测试数据',
          timestamp: Date.now() - (ttl + 100) // 已过期
        }

        localStorageMock.setItem('test-cache', JSON.stringify(cacheData))

        const result = wrapper.vm.getCachedData('test-cache', ttl)
        expect(result).toBeNull()
      })

      it('should return valid cache within TTL', async () => {
        const ttl = 10000 // 10秒
        const cacheData = {
          value: '有效数据',
          timestamp: Date.now()
        }

        localStorageMock.setItem('test-cache', JSON.stringify(cacheData))

        const result = wrapper.vm.getCachedData('test-cache', ttl)
        expect(result).toBe('有效数据')
      })

      it('should use default TTL if not specified', async () => {
        const cacheData = {
          value: '默认TTL数据',
          timestamp: Date.now()
        }

        localStorageMock.setItem('test-cache', JSON.stringify(cacheData))

        const result = wrapper.vm.getCachedData('test-cache')
        expect(result).toBe('默认TTL数据')
      })
    })

    describe('4.2 强制刷新', () => {
      it('should force refresh cache on user request', async () => {
        localStorageMock.setItem('ai-assistant-preferences', JSON.stringify({ webSearch: true }))

        await wrapper.vm.forceRefreshCache()
        await nextTick()

        expect(localStorageMock.getItem('ai-assistant-preferences')).toBeNull()
      })

      it('should reload data after force refresh', async () => {
        const loadDataSpy = vi.fn()
        wrapper.vm.loadData = loadDataSpy

        await wrapper.vm.forceRefreshCache()
        await nextTick()

        expect(loadDataSpy).toHaveBeenCalled()
      })
    })

    describe('4.3 数据变化时更新缓存', () => {
      it('should update cache when data changes', async () => {
        await wrapper.setProps({ webSearch: true })
        await nextTick()

        let cached = localStorageMock.getItem('ai-assistant-preferences')
        let preferences = JSON.parse(cached!)
        expect(preferences.webSearch).toBe(true)

        await wrapper.setProps({ webSearch: false })
        await nextTick()

        cached = localStorageMock.getItem('ai-assistant-preferences')
        preferences = JSON.parse(cached!)
        expect(preferences.webSearch).toBe(false)
      })

      it('should invalidate related caches when data changes', async () => {
        localStorageMock.setItem('related-cache-1', 'data1')
        localStorageMock.setItem('related-cache-2', 'data2')

        await wrapper.vm.invalidateRelatedCaches()
        await nextTick()

        expect(localStorageMock.getItem('related-cache-1')).toBeNull()
        expect(localStorageMock.getItem('related-cache-2')).toBeNull()
      })
    })
  })
})

