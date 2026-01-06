/**
 * 🏫 PWA工具类
 * 
 * 基于 03-快速开始指南.md 的PWA功能实现
 * 提供PWA安装、Service Worker管理、离线检测等功能
 */

import pwaConfig from '../config/pwa.config'

export interface PWAInstallPrompt {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface PWAUpdateInfo {
  isAvailable: boolean
  version?: string
  skipWaiting?: () => Promise<void>
}

export interface PWANotificationOptions {
  title: string
  body?: string
  icon?: string
  badge?: string
  tag?: string
  renotify?: boolean
  requireInteraction?: boolean
  actions?: {
    action: string
    title: string
    icon?: string
  }[]
  data?: any
}

export class PWAManager {
  private static instance: PWAManager
  private installPrompt: PWAInstallPrompt | null = null
  private swRegistration: ServiceWorkerRegistration | null = null
  private updateCallbacks: Array<(info: PWAUpdateInfo) => void> = []
  private installCallbacks: Array<(canInstall: boolean) => void> = []
  private networkCallbacks: Array<(isOnline: boolean) => void> = []

  private constructor() {
    this.init()
  }

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager()
    }
    return PWAManager.instance
  }

  // ==================== 初始化 ====================

  private async init() {
    // 检查PWA支持
    if (!this.isPWASupported()) {
      console.warn('[PWA] 当前环境不支持PWA功能')
      return
    }

    // 注册Service Worker
    await this.registerServiceWorker()

    // 监听安装提示
    this.listenForInstallPrompt()

    // 监听网络状态
    this.listenForNetworkChanges()

    // 检查更新
    this.checkForUpdates()

    console.log('[PWA] PWA管理器初始化完成')
  }

  // 检查PWA支持
  private isPWASupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window
  }

  // ==================== Service Worker 管理 ====================

  // 注册Service Worker
  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/mobile/'
      })

      this.swRegistration = registration

      console.log('[PWA] Service Worker 注册成功:', registration.scope)

      // 监听Service Worker更新
      registration.addEventListener('updatefound', () => {
        this.handleServiceWorkerUpdate(registration)
      })

      // 监听Service Worker消息
      navigator.serviceWorker.addEventListener('message', event => {
        this.handleServiceWorkerMessage(event)
      })

      // 检查是否有等待中的Service Worker
      if (registration.waiting) {
        this.notifyUpdate({
          isAvailable: true,
          skipWaiting: () => this.skipWaiting()
        })
      }

    } catch (error) {
      console.error('[PWA] Service Worker 注册失败:', error)
    }
  }

  // 处理Service Worker更新
  private handleServiceWorkerUpdate(registration: ServiceWorkerRegistration) {
    const newWorker = registration.installing
    
    if (!newWorker) return

    console.log('[PWA] 发现新的 Service Worker')

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // 新的Service Worker已安装，等待激活
        this.notifyUpdate({
          isAvailable: true,
          skipWaiting: () => this.skipWaiting()
        })
      }
    })
  }

  // 处理Service Worker消息
  private handleServiceWorkerMessage(event: MessageEvent) {
    const { type, data } = event.data

    switch (type) {
      case 'SW_UPDATED':
        console.log('[PWA] Service Worker 已更新到版本:', data.version)
        break
      case 'SYNC_COMPLETED':
        console.log('[PWA] 后台同步完成，同步项目数:', data.count)
        this.showNotification({
          title: '数据同步完成',
          body: `成功同步 ${data.count} 条数据`,
          tag: 'sync-completed'
        })
        break
      case 'NOTIFICATION_CLICKED':
        console.log('[PWA] 通知被点击:', data)
        this.handleNotificationClick(data)
        break
    }
  }

  // 跳过等待，激活新的Service Worker
  private async skipWaiting(): Promise<void> {
    if (!this.swRegistration?.waiting) return

    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // 等待控制权转移
    return new Promise((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        resolve()
        window.location.reload()
      }, { once: true })
    })
  }

  // ==================== PWA 安装 ====================

  // 监听安装提示
  private listenForInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event: any) => {
      // 阻止默认的安装提示
      event.preventDefault()
      
      this.installPrompt = event
      console.log('[PWA] 检测到安装提示')
      
      // 通知可以安装
      this.notifyInstall(true)
    })

    // 监听安装完成
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] 应用已安装')
      this.installPrompt = null
      this.notifyInstall(false)
    })
  }

  // 检查是否可以安装
  canInstall(): boolean {
    return this.installPrompt !== null
  }

  // 检查是否已安装
  isInstalled(): boolean {
    // 检查显示模式
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    // 检查iOS Safari
    const isIOSStandalone = (window.navigator as any).standalone === true
    
    return isStandalone || isIOSStandalone
  }

  // 提示安装
  async promptInstall(): Promise<{ outcome: 'accepted' | 'dismissed' | 'not-available' }> {
    if (!this.installPrompt) {
      return { outcome: 'not-available' }
    }

    try {
      const result = await this.installPrompt.prompt()
      this.installPrompt = null
      
      console.log('[PWA] 安装提示结果:', result.outcome)
      return result

    } catch (error) {
      console.error('[PWA] 安装提示失败:', error)
      return { outcome: 'dismissed' }
    }
  }

  // ==================== 通知管理 ====================

  // 请求通知权限
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('[PWA] 浏览器不支持通知')
      return 'denied'
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      console.log('[PWA] 通知权限:', permission)
      return permission
    }

    return Notification.permission
  }

  // 显示通知
  async showNotification(options: PWANotificationOptions): Promise<void> {
    // 检查权限
    const permission = await this.requestNotificationPermission()
    if (permission !== 'granted') {
      console.warn('[PWA] 通知权限被拒绝')
      return
    }

    // 如果有Service Worker，使用Service Worker显示通知
    if (this.swRegistration) {
      await this.swRegistration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192.png',
        badge: options.badge || '/icons/badge-72.png',
        tag: options.tag,
        renotify: options.renotify,
        requireInteraction: options.requireInteraction,
        actions: options.actions,
        data: options.data
      })
    } else {
      // 降级到普通通知
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192.png',
        tag: options.tag,
        renotify: options.renotify,
        requireInteraction: options.requireInteraction,
        data: options.data
      })
    }
  }

  // 处理通知点击
  private handleNotificationClick(data: any) {
    // 根据通知数据执行相应操作
    if (data.url) {
      window.location.href = data.url
    } else if (data.action) {
      this.executeNotificationAction(data.action, data)
    }
  }

  // 执行通知操作
  private executeNotificationAction(action: string, data: any) {
    switch (action) {
      case 'open-messages':
        window.location.href = '/mobile/messages'
        break
      case 'open-activities':
        window.location.href = '/mobile/activities'
        break
      case 'open-ai-chat':
        window.location.href = '/mobile/ai'
        break
      default:
        console.log('[PWA] 未知的通知操作:', action)
    }
  }

  // ==================== 后台同步 ====================

  // 注册后台同步
  async registerBackgroundSync(tag: string = 'background-sync'): Promise<void> {
    if (!this.swRegistration || !this.swRegistration.sync) {
      console.warn('[PWA] 不支持后台同步')
      return
    }

    try {
      await this.swRegistration.sync.register(tag)
      console.log('[PWA] 后台同步已注册:', tag)
    } catch (error) {
      console.error('[PWA] 后台同步注册失败:', error)
    }
  }

  // 添加待同步数据
  async addPendingSyncData(data: any): Promise<void> {
    try {
      // 将数据存储到IndexedDB或localStorage
      const pendingData = this.getPendingSyncData()
      pendingData.push({
        id: Date.now().toString(),
        timestamp: Date.now(),
        ...data
      })
      
      localStorage.setItem('pwa-pending-sync', JSON.stringify(pendingData))
      
      // 注册后台同步
      await this.registerBackgroundSync()
      
    } catch (error) {
      console.error('[PWA] 添加待同步数据失败:', error)
    }
  }

  // 获取待同步数据
  private getPendingSyncData(): any[] {
    try {
      const data = localStorage.getItem('pwa-pending-sync')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  // ==================== 网络状态管理 ====================

  // 监听网络状态变化
  private listenForNetworkChanges() {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine
      console.log('[PWA] 网络状态:', isOnline ? '在线' : '离线')
      this.notifyNetworkChange(isOnline)
      
      if (!isOnline) {
        this.showNotification({
          title: '网络连接断开',
          body: '应用将在离线模式下运行，部分功能可能受限',
          tag: 'network-offline',
          icon: '/icons/offline.png'
        })
      } else {
        this.showNotification({
          title: '网络连接恢复',
          body: '应用已恢复正常功能',
          tag: 'network-online',
          icon: '/icons/online.png'
        })
      }
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  }

  // 检查网络状态
  isOnline(): boolean {
    return navigator.onLine
  }

  // ==================== 更新管理 ====================

  // 检查更新
  private async checkForUpdates() {
    if (!this.swRegistration) return

    try {
      const registration = await this.swRegistration.update()
      console.log('[PWA] 检查更新完成')
      
      if (registration.waiting) {
        this.notifyUpdate({
          isAvailable: true,
          skipWaiting: () => this.skipWaiting()
        })
      }
    } catch (error) {
      console.error('[PWA] 检查更新失败:', error)
    }
  }

  // ==================== 事件回调 ====================

  // 注册更新回调
  onUpdate(callback: (info: PWAUpdateInfo) => void) {
    this.updateCallbacks.push(callback)
  }

  // 注册安装回调
  onInstall(callback: (canInstall: boolean) => void) {
    this.installCallbacks.push(callback)
  }

  // 注册网络状态回调
  onNetworkChange(callback: (isOnline: boolean) => void) {
    this.networkCallbacks.push(callback)
  }

  // 通知更新可用
  private notifyUpdate(info: PWAUpdateInfo) {
    this.updateCallbacks.forEach(callback => callback(info))
  }

  // 通知安装状态变化
  private notifyInstall(canInstall: boolean) {
    this.installCallbacks.forEach(callback => callback(canInstall))
  }

  // 通知网络状态变化
  private notifyNetworkChange(isOnline: boolean) {
    this.networkCallbacks.forEach(callback => callback(isOnline))
  }

  // ==================== 实用方法 ====================

  // 获取PWA信息
  getPWAInfo() {
    return {
      isSupported: this.isPWASupported(),
      isInstalled: this.isInstalled(),
      canInstall: this.canInstall(),
      isOnline: this.isOnline(),
      hasServiceWorker: this.swRegistration !== null,
      manifestUrl: '/manifest.json'
    }
  }

  // 清理缓存
  async clearCache(): Promise<void> {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter(name => name.startsWith('kindergarten-'))
          .map(name => caches.delete(name))
      )
      console.log('[PWA] 缓存已清理')
    } catch (error) {
      console.error('[PWA] 清理缓存失败:', error)
    }
  }

  // 卸载PWA
  async uninstall(): Promise<void> {
    try {
      // 注销Service Worker
      if (this.swRegistration) {
        await this.swRegistration.unregister()
        this.swRegistration = null
      }

      // 清理缓存
      await this.clearCache()

      // 清理存储
      localStorage.removeItem('pwa-pending-sync')

      console.log('[PWA] PWA已卸载')
    } catch (error) {
      console.error('[PWA] 卸载PWA失败:', error)
    }
  }
}

// 创建全局PWA管理器实例
export const pwaManager = PWAManager.getInstance()

// Vue插件形式导出
export default {
  install(app: any) {
    app.config.globalProperties.$pwa = pwaManager
    app.provide('pwa', pwaManager)
  }
}