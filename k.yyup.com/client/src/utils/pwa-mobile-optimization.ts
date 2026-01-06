/**
 * PWA移动端优化
 * Progressive Web App Mobile Optimizations
 * 
 * 提供PWA相关的移动端优化功能
 */

/**
 * PWA安装提示管理器
 */
export class PWAInstallManager {
  private deferredPrompt: any = null
  private installButton: HTMLElement | null = null

  constructor() {
    this.init()
  }

  private init() {
    // 监听PWA安装提示事件
    window.addEventListener('beforeinstallprompt', (e) => {
      // 阻止Chrome 67及更早版本自动显示安装提示
      e.preventDefault()
      this.deferredPrompt = e
      this.showInstallButton()
    })

    // 监听PWA安装完成事件
    window.addEventListener('appinstalled', () => {
      console.log('📱 PWA安装成功')
      this.hideInstallButton()
      this.deferredPrompt = null
    })
  }

  private showInstallButton() {
    // 创建安装按钮（如果不存在）
    if (!this.installButton) {
      this.installButton = document.createElement('button')
      this.installButton.className = 'pwa-install-btn'
      this.installButton.innerHTML = '📱 安装应用'
      this.installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        padding: 12px 16px;
        background: var(--primary-color, #2563eb);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        transform: translateY(100px);
        opacity: 0;
      `
      
      this.installButton.addEventListener('click', () => this.promptInstall())
      document.body.appendChild(this.installButton)
    }

    // 动画显示按钮
    setTimeout(() => {
      if (this.installButton) {
        this.installButton.style.transform = 'translateY(0)'
        this.installButton.style.opacity = '1'
      }
    }, 100)
  }

  private hideInstallButton() {
    if (this.installButton) {
      this.installButton.style.transform = 'translateY(100px)'
      this.installButton.style.opacity = '0'
      
      setTimeout(() => {
        if (this.installButton && this.installButton.parentNode) {
          this.installButton.parentNode.removeChild(this.installButton)
          this.installButton = null
        }
      }, 300)
    }
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('PWA安装提示不可用')
      return false
    }

    // 显示安装提示
    this.deferredPrompt.prompt()

    // 等待用户响应
    const { outcome } = await this.deferredPrompt.userChoice

    console.log('PWA安装提示结果:', outcome)

    // 清理
    this.deferredPrompt = null
    this.hideInstallButton()

    return outcome === 'accepted'
  }

  public isInstallable(): boolean {
    return this.deferredPrompt !== null
  }
}

/**
 * 移动端网络状态管理器
 */
export class MobileNetworkManager {
  private callbacks: Map<string, (online: boolean, connectionType?: string) => void> = new Map()
  private lastConnectionType: string | undefined

  constructor() {
    this.init()
  }

  private init() {
    // 监听网络状态变化
    window.addEventListener('online', () => this.handleNetworkChange(true))
    window.addEventListener('offline', () => this.handleNetworkChange(false))

    // 监听连接类型变化（如果支持）
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', () => {
        this.handleNetworkChange(navigator.onLine, connection.effectiveType)
      })
      this.lastConnectionType = connection.effectiveType
    }
  }

  private handleNetworkChange(online: boolean, connectionType?: string) {
    if (connectionType) {
      this.lastConnectionType = connectionType
    }

    console.log('📶 网络状态变化:', {
      online,
      connectionType: connectionType || this.lastConnectionType
    })

    // 通知所有监听器
    this.callbacks.forEach(callback => {
      callback(online, connectionType || this.lastConnectionType)
    })

    // 显示网络状态通知
    this.showNetworkNotification(online, connectionType || this.lastConnectionType)
  }

  private showNetworkNotification(online: boolean, connectionType?: string) {
    const message = online 
      ? `网络已连接${connectionType ? ` (${connectionType})` : ''}`
      : '网络连接已断开'
    
    const notification = document.createElement('div')
    notification.className = 'network-notification'
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      z-index: 2000;
      padding: 12px 20px;
      background: ${online ? '#10b981' : '#ef4444'};
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      transition: transform 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `

    document.body.appendChild(notification)

    // 显示动画
    setTimeout(() => {
      notification.style.transform = 'translateX(-50%) translateY(0)'
    }, 100)

    // 3秒后隐藏
    setTimeout(() => {
      notification.style.transform = 'translateX(-50%) translateY(-100px)'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  public addNetworkListener(key: string, callback: (online: boolean, connectionType?: string) => void) {
    this.callbacks.set(key, callback)
  }

  public removeNetworkListener(key: string) {
    this.callbacks.delete(key)
  }

  public isOnline(): boolean {
    return navigator.onLine
  }

  public getConnectionType(): string | undefined {
    if ('connection' in navigator) {
      return (navigator as any).connection?.effectiveType
    }
    return undefined
  }
}

/**
 * 移动端存储管理器
 */
export class MobileStorageManager {
  private quotaWarningThreshold = 0.8 // 80%使用率时警告

  public async estimateQuota(): Promise<{ usage: number; quota: number; usagePercent: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        const usage = estimate.usage || 0
        const quota = estimate.quota || 0
        const usagePercent = quota > 0 ? usage / quota : 0

        return { usage, quota, usagePercent }
      } catch (error) {
        console.warn('无法估算存储配额:', error)
      }
    }

    return { usage: 0, quota: 0, usagePercent: 0 }
  }

  public async checkStorageQuota(): Promise<void> {
    const { usage, quota, usagePercent } = await this.estimateQuota()

    if (usagePercent > this.quotaWarningThreshold) {
      console.warn('⚠️ 存储空间不足:', {
        used: `${(usage / 1024 / 1024).toFixed(2)} MB`,
        total: `${(quota / 1024 / 1024).toFixed(2)} MB`,
        percent: `${(usagePercent * 100).toFixed(1)}%`
      })

      this.showStorageWarning(usagePercent)
    }
  }

  private showStorageWarning(usagePercent: number) {
    const warning = document.createElement('div')
    warning.className = 'storage-warning'
    warning.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>⚠️</span>
        <div>
          <div style="font-weight: 600;">存储空间不足</div>
          <div style="font-size: 12px; opacity: 0.8;">
            已使用 ${(usagePercent * 100).toFixed(1)}% 的存储空间
          </div>
        </div>
      </div>
    `
    warning.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 20px;
      right: 20px;
      z-index: 2000;
      padding: 16px;
      background: #f59e0b;
      color: white;
      border-radius: 12px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
    `

    document.body.appendChild(warning)

    // 显示动画
    setTimeout(() => {
      warning.style.transform = 'translateY(0)'
      warning.style.opacity = '1'
    }, 100)

    // 5秒后隐藏
    setTimeout(() => {
      warning.style.transform = 'translateY(100px)'
      warning.style.opacity = '0'
      setTimeout(() => {
        if (warning.parentNode) {
          warning.parentNode.removeChild(warning)
        }
      }, 300)
    }, 5000)
  }

  public clearUnusedCache(): void {
    // 清理localStorage中的过期数据
    const keys = Object.keys(localStorage)
    let clearedCount = 0

    keys.forEach(key => {
      try {
        const data = localStorage.getItem(key)
        if (data && data.startsWith('{') && data.includes('"timestamp"')) {
          const parsed = JSON.parse(data)
          const maxAge = parsed.maxAge || 24 * 60 * 60 * 1000 // 默认24小时
          if (Date.now() - parsed.timestamp > maxAge) {
            localStorage.removeItem(key)
            clearedCount++
          }
        }
      } catch (error) {
        // 忽略解析错误
      }
    })

    if (clearedCount > 0) {
      console.log(`🧹 已清理 ${clearedCount} 个过期缓存项`)
    }
  }
}

/**
 * 移动端振动反馈管理器
 */
export class MobileVibrationManager {
  public vibrate(pattern: number | number[]): boolean {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern)
        return true
      } catch (error) {
        console.warn('振动反馈失败:', error)
      }
    }
    return false
  }

  public shortVibration(): boolean {
    return this.vibrate(50) // 50ms短振动
  }

  public mediumVibration(): boolean {
    return this.vibrate([100, 50, 100]) // 振动-停止-振动
  }

  public successVibration(): boolean {
    return this.vibrate([50, 30, 50]) // 成功反馈
  }

  public errorVibration(): boolean {
    return this.vibrate([100, 30, 100, 30, 100]) // 错误反馈
  }

  public isSupported(): boolean {
    return 'vibrate' in navigator
  }
}

// 导出单例实例
export const pwaInstallManager = new PWAInstallManager()
export const mobileNetworkManager = new MobileNetworkManager()
export const mobileStorageManager = new MobileStorageManager()
export const mobileVibrationManager = new MobileVibrationManager()

// 初始化PWA移动端优化
export function initPWAMobileOptimizations() {
  // 检查存储配额
  mobileStorageManager.checkStorageQuota()

  // 添加网络状态监听
  mobileNetworkManager.addNetworkListener('main', (online, _connectionType) => {
    if (!online) {
      // 网络断开时，可以显示离线提示或切换到缓存模式
      console.log('切换到离线模式')
    } else {
      // 网络恢复时，可以同步数据
      console.log('网络恢复，开始同步数据')
    }
  })

  // 定期清理缓存
  setInterval(() => {
    mobileStorageManager.clearUnusedCache()
  }, 60000) // 每分钟清理一次

  console.log('📱 PWA移动端优化初始化完成')
}

// 如果在移动端浏览器环境中，自动初始化
if (typeof window !== 'undefined' && window.innerWidth <= 768) {
  initPWAMobileOptimizations()
}