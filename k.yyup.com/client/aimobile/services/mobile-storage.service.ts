/**
 * 💾 移动端数据持久化服务
 * 
 * 专门为移动端设计的数据存储服务
 * 支持多层缓存、离线存储、数据同步等功能
 */

// 存储类型枚举
export enum StorageType {
  MEMORY = 'memory',           // 内存存储（临时）
  SESSION = 'session',         // 会话存储
  LOCAL = 'local',            // 本地存储
  INDEXED_DB = 'indexeddb',   // IndexedDB存储
  CACHE_API = 'cache'         // Cache API存储
}

// 存储配置接口
export interface StorageConfig {
  type: StorageType
  key: string
  ttl?: number              // 过期时间（毫秒）
  compress?: boolean        // 是否压缩
  encrypt?: boolean         // 是否加密
  sync?: boolean           // 是否同步到服务器
}

// 存储项接口
export interface StorageItem<T = any> {
  data: T
  timestamp: number
  ttl?: number
  version: string
  compressed?: boolean
  encrypted?: boolean
}

// 同步状态枚举
export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  FAILED = 'failed'
}

export class MobileStorageService {
  private memoryCache = new Map<string, StorageItem>()
  private dbName = 'MobileAIExpertDB'
  private dbVersion = 1
  private db: IDBDatabase | null = null
  private syncQueue: Array<{ key: string; data: any; action: 'set' | 'delete' }> = []
  private isOnline = navigator.onLine

  constructor() {
    this.initializeIndexedDB()
    this.setupNetworkListeners()
    this.startSyncWorker()
  }

  // ==================== 初始化 ====================

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // 创建对象存储
        if (!db.objectStoreNames.contains('storage')) {
          const store = db.createObjectStore('storage', { keyPath: 'key' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('ttl', 'ttl', { unique: false })
        }
        
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true })
        }
      }
    })
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processSyncQueue()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  private startSyncWorker(): void {
    // 每30秒尝试同步一次
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue()
      }
    }, 30000)
  }

  // ==================== 核心存储方法 ====================

  /**
   * 设置数据
   */
  async set<T>(key: string, data: T, config: Partial<StorageConfig> = {}): Promise<void> {
    const finalConfig: StorageConfig = {
      type: StorageType.LOCAL,
      key,
      ttl: 24 * 60 * 60 * 1000, // 默认24小时
      compress: false,
      encrypt: false,
      sync: false,
      ...config
    }

    const item: StorageItem<T> = {
      data: finalConfig.compress ? this.compress(data) : data,
      timestamp: Date.now(),
      ttl: finalConfig.ttl,
      version: '1.0.0',
      compressed: finalConfig.compress,
      encrypted: finalConfig.encrypt
    }

    // 加密处理
    if (finalConfig.encrypt) {
      item.data = this.encrypt(item.data)
    }

    try {
      switch (finalConfig.type) {
        case StorageType.MEMORY:
          this.memoryCache.set(key, item)
          break
          
        case StorageType.SESSION:
          sessionStorage.setItem(key, JSON.stringify(item))
          break
          
        case StorageType.LOCAL:
          localStorage.setItem(key, JSON.stringify(item))
          break
          
        case StorageType.INDEXED_DB:
          await this.setIndexedDB(key, item)
          break
          
        case StorageType.CACHE_API:
          await this.setCacheAPI(key, item)
          break
      }

      // 添加到同步队列
      if (finalConfig.sync && this.isOnline) {
        this.addToSyncQueue(key, data, 'set')
      }

      console.log(`💾 数据已存储: ${key} (${finalConfig.type})`)
      
    } catch (error) {
      console.error(`❌ 存储失败: ${key}`, error)
      throw error
    }
  }

  /**
   * 获取数据
   */
  async get<T>(key: string, type: StorageType = StorageType.LOCAL): Promise<T | null> {
    try {
      let item: StorageItem<T> | null = null

      switch (type) {
        case StorageType.MEMORY:
          item = this.memoryCache.get(key) || null
          break
          
        case StorageType.SESSION:
          const sessionData = sessionStorage.getItem(key)
          item = sessionData ? JSON.parse(sessionData) : null
          break
          
        case StorageType.LOCAL:
          const localData = localStorage.getItem(key)
          item = localData ? JSON.parse(localData) : null
          break
          
        case StorageType.INDEXED_DB:
          item = await this.getIndexedDB<T>(key)
          break
          
        case StorageType.CACHE_API:
          item = await this.getCacheAPI<T>(key)
          break
      }

      if (!item) return null

      // 检查过期时间
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        await this.remove(key, type)
        return null
      }

      // 解密处理
      let data = item.data
      if (item.encrypted) {
        data = this.decrypt(data)
      }

      // 解压缩处理
      if (item.compressed) {
        data = this.decompress(data)
      }

      return data

    } catch (error) {
      console.error(`❌ 获取数据失败: ${key}`, error)
      return null
    }
  }

  /**
   * 删除数据
   */
  async remove(key: string, type: StorageType = StorageType.LOCAL): Promise<void> {
    try {
      switch (type) {
        case StorageType.MEMORY:
          this.memoryCache.delete(key)
          break
          
        case StorageType.SESSION:
          sessionStorage.removeItem(key)
          break
          
        case StorageType.LOCAL:
          localStorage.removeItem(key)
          break
          
        case StorageType.INDEXED_DB:
          await this.removeIndexedDB(key)
          break
          
        case StorageType.CACHE_API:
          await this.removeCacheAPI(key)
          break
      }

      console.log(`🗑️ 数据已删除: ${key} (${type})`)
      
    } catch (error) {
      console.error(`❌ 删除数据失败: ${key}`, error)
      throw error
    }
  }

  /**
   * 清空存储
   */
  async clear(type: StorageType = StorageType.LOCAL): Promise<void> {
    try {
      switch (type) {
        case StorageType.MEMORY:
          this.memoryCache.clear()
          break
          
        case StorageType.SESSION:
          sessionStorage.clear()
          break
          
        case StorageType.LOCAL:
          localStorage.clear()
          break
          
        case StorageType.INDEXED_DB:
          await this.clearIndexedDB()
          break
          
        case StorageType.CACHE_API:
          await this.clearCacheAPI()
          break
      }

      console.log(`🧹 存储已清空: ${type}`)
      
    } catch (error) {
      console.error(`❌ 清空存储失败: ${type}`, error)
      throw error
    }
  }

  // ==================== IndexedDB 操作 ====================

  private async setIndexedDB(key: string, item: StorageItem): Promise<void> {
    if (!this.db) throw new Error('IndexedDB未初始化')
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['storage'], 'readwrite')
      const store = transaction.objectStore('storage')
      const request = store.put({ key, ...item })
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async getIndexedDB<T>(key: string): Promise<StorageItem<T> | null> {
    if (!this.db) throw new Error('IndexedDB未初始化')
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['storage'], 'readonly')
      const store = transaction.objectStore('storage')
      const request = store.get(key)
      
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? { ...result } : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  private async removeIndexedDB(key: string): Promise<void> {
    if (!this.db) throw new Error('IndexedDB未初始化')
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['storage'], 'readwrite')
      const store = transaction.objectStore('storage')
      const request = store.delete(key)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async clearIndexedDB(): Promise<void> {
    if (!this.db) throw new Error('IndexedDB未初始化')
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['storage'], 'readwrite')
      const store = transaction.objectStore('storage')
      const request = store.clear()
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== Cache API 操作 ====================

  private async setCacheAPI(key: string, item: StorageItem): Promise<void> {
    const cache = await caches.open('mobile-ai-expert-cache')
    const response = new Response(JSON.stringify(item))
    await cache.put(key, response)
  }

  private async getCacheAPI<T>(key: string): Promise<StorageItem<T> | null> {
    const cache = await caches.open('mobile-ai-expert-cache')
    const response = await cache.match(key)
    
    if (response) {
      const data = await response.json()
      return data
    }
    
    return null
  }

  private async removeCacheAPI(key: string): Promise<void> {
    const cache = await caches.open('mobile-ai-expert-cache')
    await cache.delete(key)
  }

  private async clearCacheAPI(): Promise<void> {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
  }

  // ==================== 数据同步 ====================

  private addToSyncQueue(key: string, data: any, action: 'set' | 'delete'): void {
    this.syncQueue.push({ key, data, action })
  }

  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return

    console.log(`🔄 开始同步数据: ${this.syncQueue.length} 项`)

    const queue = [...this.syncQueue]
    this.syncQueue = []

    for (const item of queue) {
      try {
        await this.syncToServer(item)
      } catch (error) {
        console.error('同步失败，重新加入队列:', error)
        this.syncQueue.push(item)
      }
    }
  }

  private async syncToServer(item: { key: string; data: any; action: 'set' | 'delete' }): Promise<void> {
    // 这里实现与服务器的同步逻辑
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    })

    if (!response.ok) {
      throw new Error(`同步失败: ${response.status}`)
    }
  }

  // ==================== 数据压缩和加密 ====================

  private compress(data: any): string {
    // 简单的JSON压缩（实际项目中可以使用更高效的压缩算法）
    return JSON.stringify(data)
  }

  private decompress(data: string): any {
    return JSON.parse(data)
  }

  private encrypt(data: any): string {
    // 简单的Base64编码（实际项目中应使用更安全的加密算法）
    return btoa(JSON.stringify(data))
  }

  private decrypt(data: string): any {
    return JSON.parse(atob(data))
  }

  // ==================== 存储统计 ====================

  /**
   * 获取存储使用情况
   */
  async getStorageUsage(): Promise<{
    localStorage: number
    sessionStorage: number
    indexedDB: number
    total: number
  }> {
    const usage = {
      localStorage: this.getLocalStorageSize(),
      sessionStorage: this.getSessionStorageSize(),
      indexedDB: await this.getIndexedDBSize(),
      total: 0
    }

    usage.total = usage.localStorage + usage.sessionStorage + usage.indexedDB

    return usage
  }

  private getLocalStorageSize(): number {
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  }

  private getSessionStorageSize(): number {
    let total = 0
    for (const key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        total += sessionStorage[key].length + key.length
      }
    }
    return total
  }

  private async getIndexedDBSize(): Promise<number> {
    if (!this.db) return 0
    
    // 估算IndexedDB大小（实际实现可能更复杂）
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['storage'], 'readonly')
      const store = transaction.objectStore('storage')
      const request = store.getAll()
      
      request.onsuccess = () => {
        const items = request.result
        const size = JSON.stringify(items).length
        resolve(size)
      }
      
      request.onerror = () => resolve(0)
    })
  }

  /**
   * 清理过期数据
   */
  async cleanupExpiredData(): Promise<void> {
    console.log('🧹 开始清理过期数据')
    
    // 清理localStorage
    for (const key in localStorage) {
      try {
        const item = JSON.parse(localStorage[key])
        if (item.ttl && Date.now() - item.timestamp > item.ttl) {
          localStorage.removeItem(key)
        }
      } catch (error) {
        // 忽略解析错误
      }
    }

    // 清理sessionStorage
    for (const key in sessionStorage) {
      try {
        const item = JSON.parse(sessionStorage[key])
        if (item.ttl && Date.now() - item.timestamp > item.ttl) {
          sessionStorage.removeItem(key)
        }
      } catch (error) {
        // 忽略解析错误
      }
    }

    // 清理IndexedDB
    await this.cleanupIndexedDBExpired()
  }

  private async cleanupIndexedDBExpired(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['storage'], 'readwrite')
      const store = transaction.objectStore('storage')
      const request = store.openCursor()
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const item = cursor.value
          if (item.ttl && Date.now() - item.timestamp > item.ttl) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }
}

// 导出单例实例
export const mobileStorageService = new MobileStorageService()

// 定期清理过期数据
setInterval(() => {
  mobileStorageService.cleanupExpiredData()
}, 60 * 60 * 1000) // 每小时清理一次

export default mobileStorageService
