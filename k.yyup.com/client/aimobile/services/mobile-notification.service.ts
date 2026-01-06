/**
 * 🔔 移动端推送通知服务
 * 
 * 专门为移动端设计的通知系统
 * 支持本地通知、推送通知、应用内通知等多种形式
 */

import { mobileStorageService, StorageType } from './mobile-storage.service'

// 通知类型枚举
export enum NotificationType {
  WORKFLOW_COMPLETE = 'workflow_complete',
  EXPERT_RESPONSE = 'expert_response',
  SYSTEM_UPDATE = 'system_update',
  REMINDER = 'reminder',
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning'
}

// 通知优先级
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 通知配置接口
export interface NotificationConfig {
  id?: string
  type: NotificationType
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  priority?: NotificationPriority
  silent?: boolean
  vibrate?: number[]
  actions?: NotificationAction[]
  data?: any
  tag?: string
  requireInteraction?: boolean
  timestamp?: number
  ttl?: number
}

// 通知动作接口
export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

// 通知权限状态
export enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  DEFAULT = 'default'
}

// 应用内通知接口
export interface InAppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  closable?: boolean
  actions?: Array<{
    text: string
    action: () => void
    style?: 'primary' | 'secondary' | 'danger'
  }>
  timestamp: number
}

export class MobileNotificationService {
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null
  private inAppNotifications: InAppNotification[] = []
  private notificationQueue: NotificationConfig[] = []
  private isInitialized = false
  private permissionStatus: PermissionStatus = PermissionStatus.DEFAULT

  constructor() {
    this.initialize()
  }

  // ==================== 初始化 ====================

  private async initialize(): Promise<void> {
    try {
      // 检查浏览器支持
      if (!this.isNotificationSupported()) {
        console.warn('⚠️ 当前浏览器不支持通知功能')
        return
      }

      // 检查权限状态
      this.permissionStatus = Notification.permission as PermissionStatus

      // 注册Service Worker
      if ('serviceWorker' in navigator) {
        await this.registerServiceWorker()
      }

      // 加载本地通知历史
      await this.loadNotificationHistory()

      this.isInitialized = true
      console.log('🔔 移动端通知服务已初始化')

    } catch (error) {
      console.error('❌ 通知服务初始化失败:', error)
    }
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register(
        '/aimobile/sw.js',
        { scope: '/aimobile/' }
      )

      console.log('📱 Service Worker 注册成功')

      // 监听Service Worker消息
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this))

    } catch (error) {
      console.error('❌ Service Worker 注册失败:', error)
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data

    switch (type) {
      case 'NOTIFICATION_CLICK':
        this.handleNotificationClick(data)
        break
      case 'NOTIFICATION_CLOSE':
        this.handleNotificationClose(data)
        break
      default:
        console.log('📨 收到Service Worker消息:', event.data)
    }
  }

  // ==================== 权限管理 ====================

  /**
   * 请求通知权限
   */
  async requestPermission(): Promise<PermissionStatus> {
    if (!this.isNotificationSupported()) {
      return PermissionStatus.DENIED
    }

    try {
      const permission = await Notification.requestPermission()
      this.permissionStatus = permission as PermissionStatus

      // 保存权限状态
      await mobileStorageService.set('notification_permission', permission, {
        type: StorageType.LOCAL,
        ttl: 30 * 24 * 60 * 60 * 1000 // 30天
      })

      console.log(`🔔 通知权限状态: ${permission}`)
      return this.permissionStatus

    } catch (error) {
      console.error('❌ 请求通知权限失败:', error)
      return PermissionStatus.DENIED
    }
  }

  /**
   * 检查通知权限
   */
  getPermissionStatus(): PermissionStatus {
    return this.permissionStatus
  }

  /**
   * 检查是否有通知权限
   */
  hasPermission(): boolean {
    return this.permissionStatus === PermissionStatus.GRANTED
  }

  // ==================== 本地通知 ====================

  /**
   * 显示本地通知
   */
  async showNotification(config: NotificationConfig): Promise<void> {
    if (!this.hasPermission()) {
      console.warn('⚠️ 没有通知权限，无法显示通知')
      this.addToQueue(config)
      return
    }

    try {
      const notificationId = config.id || this.generateNotificationId()
      
      const options: NotificationOptions = {
        body: config.body,
        icon: config.icon || '/aimobile/icons/icon-192x192.png',
        badge: config.badge || '/aimobile/icons/badge-72x72.png',
        image: config.image,
        silent: config.silent || false,
        vibrate: config.vibrate || this.getDefaultVibration(config.priority),
        actions: config.actions,
        data: {
          ...config.data,
          id: notificationId,
          type: config.type,
          timestamp: Date.now()
        },
        tag: config.tag || config.type,
        requireInteraction: config.requireInteraction || config.priority === NotificationPriority.URGENT
      }

      // 使用Service Worker显示通知
      if (this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.showNotification(config.title, options)
      } else {
        // 降级到普通通知
        new Notification(config.title, options)
      }

      // 保存通知历史
      await this.saveNotificationHistory(notificationId, config)

      console.log(`🔔 通知已显示: ${config.title}`)

    } catch (error) {
      console.error('❌ 显示通知失败:', error)
    }
  }

  /**
   * 显示工作流完成通知
   */
  async showWorkflowCompleteNotification(workflowName: string, results: any): Promise<void> {
    await this.showNotification({
      type: NotificationType.WORKFLOW_COMPLETE,
      title: '🎉 工作流执行完成',
      body: `${workflowName} 已成功完成`,
      priority: NotificationPriority.HIGH,
      vibrate: [100, 50, 100, 50, 100],
      actions: [
        { action: 'view', title: '查看结果', icon: '/aimobile/icons/view.png' },
        { action: 'share', title: '分享', icon: '/aimobile/icons/share.png' }
      ],
      data: { workflowName, results }
    })
  }

  /**
   * 显示专家回复通知
   */
  async showExpertResponseNotification(expertName: string, message: string): Promise<void> {
    await this.showNotification({
      type: NotificationType.EXPERT_RESPONSE,
      title: `💬 ${expertName}回复了您`,
      body: message.length > 50 ? message.substring(0, 50) + '...' : message,
      priority: NotificationPriority.NORMAL,
      actions: [
        { action: 'reply', title: '回复', icon: '/aimobile/icons/reply.png' },
        { action: 'view', title: '查看', icon: '/aimobile/icons/view.png' }
      ],
      data: { expertName, message }
    })
  }

  /**
   * 显示系统通知
   */
  async showSystemNotification(title: string, message: string, type: NotificationType = NotificationType.INFO): Promise<void> {
    const icons = {
      [NotificationType.SUCCESS]: '✅',
      [NotificationType.ERROR]: '❌',
      [NotificationType.WARNING]: '⚠️',
      [NotificationType.INFO]: 'ℹ️'
    }

    await this.showNotification({
      type,
      title: `${icons[type] || '📢'} ${title}`,
      body: message,
      priority: type === NotificationType.ERROR ? NotificationPriority.HIGH : NotificationPriority.NORMAL
    })
  }

  // ==================== 应用内通知 ====================

  /**
   * 显示应用内通知
   */
  showInAppNotification(config: Omit<InAppNotification, 'id' | 'timestamp'>): string {
    const notification: InAppNotification = {
      ...config,
      id: this.generateNotificationId(),
      timestamp: Date.now(),
      duration: config.duration || 5000
    }

    this.inAppNotifications.push(notification)

    // 自动移除通知
    if (notification.duration > 0) {
      setTimeout(() => {
        this.removeInAppNotification(notification.id)
      }, notification.duration)
    }

    // 触觉反馈
    this.triggerHapticFeedback(config.type)

    console.log(`📱 应用内通知已显示: ${config.title}`)
    return notification.id
  }

  /**
   * 移除应用内通知
   */
  removeInAppNotification(id: string): void {
    const index = this.inAppNotifications.findIndex(n => n.id === id)
    if (index > -1) {
      this.inAppNotifications.splice(index, 1)
    }
  }

  /**
   * 获取应用内通知列表
   */
  getInAppNotifications(): InAppNotification[] {
    return [...this.inAppNotifications]
  }

  /**
   * 清空应用内通知
   */
  clearInAppNotifications(): void {
    this.inAppNotifications = []
  }

  // ==================== 定时提醒 ====================

  /**
   * 设置定时提醒
   */
  async scheduleReminder(
    title: string,
    message: string,
    delay: number,
    options?: Partial<NotificationConfig>
  ): Promise<string> {
    const reminderId = this.generateNotificationId()

    setTimeout(async () => {
      await this.showNotification({
        id: reminderId,
        type: NotificationType.REMINDER,
        title: `⏰ ${title}`,
        body: message,
        priority: NotificationPriority.NORMAL,
        ...options
      })
    }, delay)

    console.log(`⏰ 定时提醒已设置: ${title} (${delay}ms后)`)
    return reminderId
  }

  /**
   * 设置每日提醒
   */
  async setDailyReminder(
    title: string,
    message: string,
    time: string, // 格式: "HH:MM"
    options?: Partial<NotificationConfig>
  ): Promise<void> {
    const [hours, minutes] = time.split(':').map(Number)
    const now = new Date()
    const reminderTime = new Date()
    reminderTime.setHours(hours, minutes, 0, 0)

    // 如果今天的时间已过，设置为明天
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1)
    }

    const delay = reminderTime.getTime() - now.getTime()

    await this.scheduleReminder(title, message, delay, {
      ...options,
      tag: 'daily_reminder'
    })

    // 保存每日提醒配置
    await mobileStorageService.set('daily_reminder', {
      title,
      message,
      time,
      options
    }, {
      type: StorageType.LOCAL
    })
  }

  // ==================== 通知历史 ====================

  private async saveNotificationHistory(id: string, config: NotificationConfig): Promise<void> {
    const history = await this.getNotificationHistory()
    history.unshift({
      id,
      ...config,
      timestamp: Date.now()
    })

    // 只保留最近100条
    const trimmedHistory = history.slice(0, 100)

    await mobileStorageService.set('notification_history', trimmedHistory, {
      type: StorageType.LOCAL,
      ttl: 30 * 24 * 60 * 60 * 1000 // 30天
    })
  }

  private async loadNotificationHistory(): Promise<void> {
    // 加载通知历史，用于统计和分析
    const history = await this.getNotificationHistory()
    console.log(`📚 加载通知历史: ${history.length} 条`)
  }

  /**
   * 获取通知历史
   */
  async getNotificationHistory(): Promise<NotificationConfig[]> {
    const history = await mobileStorageService.get<NotificationConfig[]>('notification_history')
    return history || []
  }

  /**
   * 清空通知历史
   */
  async clearNotificationHistory(): Promise<void> {
    await mobileStorageService.remove('notification_history')
  }

  // ==================== 事件处理 ====================

  private handleNotificationClick(data: any): void {
    console.log('🔔 通知被点击:', data)

    // 根据通知类型执行相应操作
    switch (data.type) {
      case NotificationType.WORKFLOW_COMPLETE:
        // 跳转到工作流结果页面
        window.location.href = `/aimobile/workflow/${data.workflowId}`
        break
      case NotificationType.EXPERT_RESPONSE:
        // 跳转到专家聊天页面
        window.location.href = `/aimobile/chat/${data.expertId}`
        break
      default:
        // 默认跳转到首页
        window.location.href = '/aimobile/'
    }
  }

  private handleNotificationClose(data: any): void {
    console.log('🔔 通知被关闭:', data)
  }

  // ==================== 辅助方法 ====================

  private isNotificationSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator
  }

  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDefaultVibration(priority?: NotificationPriority): number[] {
    switch (priority) {
      case NotificationPriority.URGENT:
        return [200, 100, 200, 100, 200]
      case NotificationPriority.HIGH:
        return [100, 50, 100]
      case NotificationPriority.NORMAL:
        return [100]
      case NotificationPriority.LOW:
        return []
      default:
        return [100]
    }
  }

  private triggerHapticFeedback(type: NotificationType): void {
    if (!navigator.vibrate) return

    const patterns = {
      [NotificationType.SUCCESS]: [100],
      [NotificationType.ERROR]: [200, 100, 200],
      [NotificationType.WARNING]: [150],
      [NotificationType.INFO]: [50],
      [NotificationType.WORKFLOW_COMPLETE]: [100, 50, 100, 50, 100],
      [NotificationType.EXPERT_RESPONSE]: [100, 50, 100],
      [NotificationType.SYSTEM_UPDATE]: [100],
      [NotificationType.REMINDER]: [150]
    }

    const pattern = patterns[type] || [100]
    navigator.vibrate(pattern)
  }

  private addToQueue(config: NotificationConfig): void {
    this.notificationQueue.push(config)
  }

  /**
   * 处理队列中的通知
   */
  async processNotificationQueue(): Promise<void> {
    if (!this.hasPermission() || this.notificationQueue.length === 0) return

    const queue = [...this.notificationQueue]
    this.notificationQueue = []

    for (const config of queue) {
      await this.showNotification(config)
    }
  }

  /**
   * 获取通知统计
   */
  async getNotificationStats(): Promise<{
    total: number
    byType: Record<NotificationType, number>
    recent: number
  }> {
    const history = await this.getNotificationHistory()
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    const stats = {
      total: history.length,
      byType: {} as Record<NotificationType, number>,
      recent: history.filter(n => (n.timestamp || 0) > oneDayAgo).length
    }

    // 统计各类型通知数量
    for (const notification of history) {
      const type = notification.type
      stats.byType[type] = (stats.byType[type] || 0) + 1
    }

    return stats
  }
}

// 导出单例实例
export const mobileNotificationService = new MobileNotificationService()

export default mobileNotificationService
