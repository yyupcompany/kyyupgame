import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import * as storageUtils from '../../../src/utils/storage-utils'

// Mock localStorage
const mockLocalStorage = {
  length: 0,
  clear: vi.fn(),
  getItem: vi.fn(),
  key: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn()
}

// Mock sessionStorage
const mockSessionStorage = {
  length: 0,
  clear: vi.fn(),
  getItem: vi.fn(),
  key: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn()
}

// 控制台错误检测变量
let consoleSpy: any

describe('Storage Utils', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  beforeEach(() => {
    vi.stubGlobal('localStorage', mockLocalStorage)
    vi.stubGlobal('sessionStorage', mockSessionStorage)
    
    // Reset all mock functions
    Object.values(mockLocalStorage).forEach(value => {
      if (typeof value === 'function') => {
        value.mockReset()
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    Object.values(mockSessionStorage).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('localStorage functions', () => {
    describe('setLocalStorage', () => {
      it('should set item in localStorage', () => {
        storageUtils.setLocalStorage('key', 'value')
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key', 'value')
      })

      it('should handle object values', () => {
        const obj = { name: 'test', age: 25 }
        storageUtils.setLocalStorage('key', obj)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key', JSON.stringify(obj))
      })

      it('should handle array values', () => {
        const arr = [1, 2, 3]
        storageUtils.setLocalStorage('key', arr)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key', JSON.stringify(arr))
      })

      it('should handle number values', () => {
        storageUtils.setLocalStorage('key', 123)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key', '123')
      })

      it('should handle boolean values', () => {
        storageUtils.setLocalStorage('key', true)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key', 'true')
      })

      it('should handle null values', () => {
        storageUtils.setLocalStorage('key', null)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key', 'null')
      })

      it('should handle undefined values', () => {
        storageUtils.setLocalStorage('key', undefined)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key', 'undefined')
      })
    })

    describe('getLocalStorage', () => {
      it('should get string value from localStorage', () => {
        mockLocalStorage.getItem.mockReturnValue('value')
        
        const result = storageUtils.getLocalStorage('key')
        
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('key')
        expect(result).toBe('value')
      })

      it('should get JSON object from localStorage', () => {
        const obj = { name: 'test', age: 25 }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(obj))
        
        const result = storageUtils.getLocalStorage('key')
        
        expect(result).toEqual(obj)
      })

      it('should get JSON array from localStorage', () => {
        const arr = [1, 2, 3]
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(arr))
        
        const result = storageUtils.getLocalStorage('key')
        
        expect(result).toEqual(arr)
      })

      it('should get number value from localStorage', () => {
        mockLocalStorage.getItem.mockReturnValue('123')
        
        const result = storageUtils.getLocalStorage('key')
        
        expect(result).toBe(123)
      })

      it('should get boolean true from localStorage', () => {
        mockLocalStorage.getItem.mockReturnValue('true')
        
        const result = storageUtils.getLocalStorage('key')
        
        expect(result).toBe(true)
      })

      it('should get boolean false from localStorage', () => {
        mockLocalStorage.getItem.mockReturnValue('false')
        
        const result = storageUtils.getLocalStorage('key')
        
        expect(result).toBe(false)
      })

      it('should get null from localStorage', () => {
        mockLocalStorage.getItem.mockReturnValue('null')
        
        const result = storageUtils.getLocalStorage('key')
        
        expect(result).toBeNull()
      })

      it('should return null if key does not exist', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = storageUtils.getLocalStorage('key')
        
        expect(result).toBeNull()
      })

      it('should handle invalid JSON', () => {
        mockLocalStorage.getItem.mockReturnValue('invalid json')
        
        const result = storageUtils.getLocalStorage('key')
        
        expect(result).toBe('invalid json')
      })
    })

    describe('removeLocalStorage', () => {
      it('should remove item from localStorage', () => {
        storageUtils.removeLocalStorage('key')
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('key')
      })
    })

    describe('clearLocalStorage', () => {
      it('should clear all items from localStorage', () => {
        storageUtils.clearLocalStorage()
        
        expect(mockLocalStorage.clear).toHaveBeenCalled()
      })
    })

    describe('getLocalStorageKeys', () => {
      it('should get all keys from localStorage', () => {
        mockLocalStorage.length = 2
        mockLocalStorage.key.mockImplementation((index) => {
          return index === 0 ? 'key1' : 'key2'
        })
        
        const result = storageUtils.getLocalStorageKeys()
        
        expect(mockLocalStorage.key).toHaveBeenCalledWith(0)
        expect(mockLocalStorage.key).toHaveBeenCalledWith(1)
        expect(result).toEqual(['key1', 'key2'])
      })

      it('should return empty array if localStorage is empty', () => {
        mockLocalStorage.length = 0
        
        const result = storageUtils.getLocalStorageKeys()
        
        expect(result).toEqual([])
      })
    })

    describe('getLocalStorageSize', () => {
      it('should get localStorage size', () => {
        mockLocalStorage.length = 5
        
        const result = storageUtils.getLocalStorageSize()
        
        expect(result).toBe(5)
      })
    })

    describe('hasLocalStorage', () => {
      it('should return true if key exists in localStorage', () => {
        mockLocalStorage.getItem.mockReturnValue('value')
        
        const result = storageUtils.hasLocalStorage('key')
        
        expect(result).toBe(true)
      })

      it('should return false if key does not exist in localStorage', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = storageUtils.hasLocalStorage('key')
        
        expect(result).toBe(false)
      })
    })
  })

  describe('sessionStorage functions', () => {
    describe('setSessionStorage', () => {
      it('should set item in sessionStorage', () => {
        storageUtils.setSessionStorage('key', 'value')
        
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('key', 'value')
      })

      it('should handle object values', () => {
        const obj = { name: 'test', age: 25 }
        storageUtils.setSessionStorage('key', obj)
        
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('key', JSON.stringify(obj))
      })
    })

    describe('getSessionStorage', () => {
      it('should get string value from sessionStorage', () => {
        mockSessionStorage.getItem.mockReturnValue('value')
        
        const result = storageUtils.getSessionStorage('key')
        
        expect(mockSessionStorage.getItem).toHaveBeenCalledWith('key')
        expect(result).toBe('value')
      })

      it('should get JSON object from sessionStorage', () => {
        const obj = { name: 'test', age: 25 }
        mockSessionStorage.getItem.mockReturnValue(JSON.stringify(obj))
        
        const result = storageUtils.getSessionStorage('key')
        
        expect(result).toEqual(obj)
      })
    })

    describe('removeSessionStorage', () => {
      it('should remove item from sessionStorage', () => {
        storageUtils.removeSessionStorage('key')
        
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('key')
      })
    })

    describe('clearSessionStorage', () => {
      it('should clear all items from sessionStorage', () => {
        storageUtils.clearSessionStorage()
        
        expect(mockSessionStorage.clear).toHaveBeenCalled()
      })
    })

    describe('getSessionStorageKeys', () => {
      it('should get all keys from sessionStorage', () => {
        mockSessionStorage.length = 2
        mockSessionStorage.key.mockImplementation((index) => {
          return index === 0 ? 'key1' : 'key2'
        })
        
        const result = storageUtils.getSessionStorageKeys()
        
        expect(result).toEqual(['key1', 'key2'])
      })
    })

    describe('getSessionStorageSize', () => {
      it('should get sessionStorage size', () => {
        mockSessionStorage.length = 3
        
        const result = storageUtils.getSessionStorageSize()
        
        expect(result).toBe(3)
      })
    })

    describe('hasSessionStorage', () => {
      it('should return true if key exists in sessionStorage', () => {
        mockSessionStorage.getItem.mockReturnValue('value')
        
        const result = storageUtils.hasSessionStorage('key')
        
        expect(result).toBe(true)
      })

      it('should return false if key does not exist in sessionStorage', () => {
        mockSessionStorage.getItem.mockReturnValue(null)
        
        const result = storageUtils.hasSessionStorage('key')
        
        expect(result).toBe(false)
      })
    })
  })

  describe('storage utility functions', () => {
    describe('isStorageAvailable', () => {
      it('should return true if localStorage is available', () => {
        const result = storageUtils.isStorageAvailable('localStorage')
        
        expect(result).toBe(true)
      })

      it('should return true if sessionStorage is available', () => {
        const result = storageUtils.isStorageAvailable('sessionStorage')
        
        expect(result).toBe(true)
      })

      it('should return false for invalid storage type', () => {
        const result = storageUtils.isStorageAvailable('invalidStorage')
        
        expect(result).toBe(false)
      })

      it('should handle localStorage not available', () => {
        vi.stubGlobal('localStorage', null)
        
        const result = storageUtils.isStorageAvailable('localStorage')
        
        expect(result).toBe(false)
      })

      it('should handle sessionStorage not available', () => {
        vi.stubGlobal('sessionStorage', null)
        
        const result = storageUtils.isStorageAvailable('sessionStorage')
        
        expect(result).toBe(false)
      })
    })

    describe('getStorageInfo', () => {
      it('should get localStorage info', () => {
        mockLocalStorage.length = 3
        mockLocalStorage.key.mockImplementation((index) => `key${index}`)
        
        const result = storageUtils.getStorageInfo('localStorage')
        
        expect(result).toEqual({
          type: 'localStorage',
          size: 3,
          keys: ['key0', 'key1', 'key2'],
          available: true
        })
      })

      it('should get sessionStorage info', () => {
        mockSessionStorage.length = 2
        mockSessionStorage.key.mockImplementation((index) => `key${index}`)
        
        const result = storageUtils.getStorageInfo('sessionStorage')
        
        expect(result).toEqual({
          type: 'sessionStorage',
          size: 2,
          keys: ['key0', 'key1'],
          available: true
        })
      })

      it('should handle unavailable storage', () => {
        vi.stubGlobal('localStorage', null)
        
        const result = storageUtils.getStorageInfo('localStorage')
        
        expect(result).toEqual({
          type: 'localStorage',
          size: 0,
          keys: [],
          available: false
        })
      })
    })

    describe('copyStorage', () => {
      it('should copy from localStorage to sessionStorage', () => {
        mockLocalStorage.length = 2
        mockLocalStorage.key.mockImplementation((index) => `key${index}`)
        mockLocalStorage.getItem.mockImplementation((key) => `value${key}`)
        
        storageUtils.copyStorage('localStorage', 'sessionStorage')
        
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('key0', 'valuekey0')
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('key1', 'valuekey1')
      })

      it('should copy from sessionStorage to localStorage', () => {
        mockSessionStorage.length = 2
        mockSessionStorage.key.mockImplementation((index) => `key${index}`)
        mockSessionStorage.getItem.mockImplementation((key) => `value${key}`)
        
        storageUtils.copyStorage('sessionStorage', 'localStorage')
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key0', 'valuekey0')
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key1', 'valuekey1')
      })
    })

    describe('mergeStorage', () => {
      it('should merge sessionStorage into localStorage', () => {
        mockSessionStorage.length = 2
        mockSessionStorage.key.mockImplementation((index) => `key${index}`)
        mockSessionStorage.getItem.mockImplementation((key) => `session${key}`)
        
        mockLocalStorage.length = 1
        mockLocalStorage.key.mockReturnValue('existing')
        mockLocalStorage.getItem.mockReturnValue('existingValue')
        
        storageUtils.mergeStorage('sessionStorage', 'localStorage')
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key0', 'sessionkey0')
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key1', 'sessionkey1')
      })
    })

    describe('exportStorage', () => {
      it('should export localStorage to JSON', () => {
        mockLocalStorage.length = 2
        mockLocalStorage.key.mockImplementation((index) => `key${index}`)
        mockLocalStorage.getItem.mockImplementation((key) => `value${key}`)
        
        const result = storageUtils.exportStorage('localStorage')
        
        expect(result).toEqual({
          key0: 'valuekey0',
          key1: 'valuekey1'
        })
      })

      it('should export sessionStorage to JSON', () => {
        mockSessionStorage.length = 2
        mockSessionStorage.key.mockImplementation((index) => `key${index}`)
        mockSessionStorage.getItem.mockImplementation((key) => `value${key}`)
        
        const result = storageUtils.exportStorage('sessionStorage')
        
        expect(result).toEqual({
          key0: 'valuekey0',
          key1: 'valuekey1'
        })
      })

      it('should return empty object for empty storage', () => {
        mockLocalStorage.length = 0
        
        const result = storageUtils.exportStorage('localStorage')
        
        expect(result).toEqual({})
      })
    })

    describe('importStorage', () => {
      it('should import data to localStorage', () => {
        const data = {
          key1: 'value1',
          key2: { name: 'test' },
          key3: [1, 2, 3]
        }
        
        storageUtils.importStorage('localStorage', data)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key1', 'value1')
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key2', JSON.stringify({ name: 'test' }))
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key3', JSON.stringify([1, 2, 3]))
      })

      it('should import data to sessionStorage', () => {
        const data = { key1: 'value1' }
        
        storageUtils.importStorage('sessionStorage', data)
        
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('key1', 'value1')
      })

      it('should handle empty data', () => {
        storageUtils.importStorage('localStorage', {})
        
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
      })
    })

    describe('clearExpiredStorage', () => {
      it('should clear expired items from localStorage', () => {
        const now = Date.now()
        const expiredItem = JSON.stringify({
          value: 'test',
          expiry: now - 1000 // expired 1 second ago
        })
        const validItem = JSON.stringify({
          value: 'test',
          expiry: now + 1000 // expires in 1 second
        })
        
        mockLocalStorage.length = 2
        mockLocalStorage.key.mockImplementation((index) => index === 0 ? 'expired' : 'valid')
        mockLocalStorage.getItem.mockImplementation((key) => {
          return key === 'expired' ? expiredItem : validItem
        })
        
        storageUtils.clearExpiredStorage('localStorage')
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('expired')
        expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('valid')
      })
    })

    describe('setStorageWithExpiry', () => {
      it('should set item with expiry in localStorage', () => {
        const ttl = 3600000 // 1 hour
        
        storageUtils.setStorageWithExpiry('localStorage', 'key', 'value', ttl)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalled()
        const callArg = mockLocalStorage.setItem.mock.calls[0][1]
        const parsed = JSON.parse(callArg)
        expect(parsed.value).toBe('value')
        expect(parsed.expiry).toBeGreaterThan(Date.now())
      })

      it('should set item with expiry in sessionStorage', () => {
        const ttl = 1800000 // 30 minutes
        
        storageUtils.setStorageWithExpiry('sessionStorage', 'key', 'value', ttl)
        
        expect(mockSessionStorage.setItem).toHaveBeenCalled()
        const callArg = mockSessionStorage.setItem.mock.calls[0][1]
        const parsed = JSON.parse(callArg)
        expect(parsed.value).toBe('value')
        expect(parsed.expiry).toBeGreaterThan(Date.now())
      })
    })

    describe('getStorageWithExpiry', () => {
      it('should get valid item with expiry from localStorage', () => {
        const now = Date.now()
        const item = JSON.stringify({
          value: 'test',
          expiry: now + 1000 // expires in 1 second
        })
        
        mockLocalStorage.getItem.mockReturnValue(item)
        
        const result = storageUtils.getStorageWithExpiry('localStorage', 'key')
        
        expect(result).toBe('test')
      })

      it('should remove expired item and return null', () => {
        const now = Date.now()
        const expiredItem = JSON.stringify({
          value: 'test',
          expiry: now - 1000 // expired 1 second ago
        })
        
        mockLocalStorage.getItem.mockReturnValue(expiredItem)
        
        const result = storageUtils.getStorageWithExpiry('localStorage', 'key')
        
        expect(result).toBeNull()
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('key')
      })

      it('should return null if item does not exist', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = storageUtils.getStorageWithExpiry('localStorage', 'key')
        
        expect(result).toBeNull()
      })

      it('should handle invalid JSON', () => {
        mockLocalStorage.getItem.mockReturnValue('invalid json')
        
        const result = storageUtils.getStorageWithExpiry('localStorage', 'key')
        
        expect(result).toBeNull()
      })
    })

    describe('getStorageUsage', () => {
      it('should get localStorage usage', () => {
        mockLocalStorage.length = 2
        mockLocalStorage.key.mockImplementation((index) => `key${index}`)
        mockLocalStorage.getItem.mockImplementation((key) => `value${key}`)
        
        const result = storageUtils.getStorageUsage('localStorage')
        
        expect(result).toEqual({
          totalItems: 2,
          totalSize: 12, // 'valuekey0' + 'valuekey1' = 12 characters
          items: [
            { key: 'key0', size: 8 },
            { key: 'key1', size: 8 }
          ]
        })
      })
    })

    describe('compressStorage', () => {
      it('should compress localStorage data', () => {
        mockLocalStorage.length = 2
        mockLocalStorage.key.mockImplementation((index) => `key${index}`)
        mockLocalStorage.getItem.mockImplementation((key) => `value${key}`)
        
        storageUtils.compressStorage('localStorage')
        
        expect(mockLocalStorage.setItem).toHaveBeenCalled()
      })
    })
  })
})