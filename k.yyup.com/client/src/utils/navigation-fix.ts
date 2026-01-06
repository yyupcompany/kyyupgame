/**
 * 导航修复工具
 * Navigation Fix Utilities
 * 
 * 修复移动端导航和路由加载问题
 */

import { nextTick } from 'vue'

/**
 * 移动端导航菜单状态管理
 */
export class MobileNavigationManager {
  private sidebarElement: HTMLElement | null = null
  private overlayElement: HTMLElement | null = null
  private isOpen = false

  constructor() {
    this.init()
  }

  private init() {
    // 查找侧边栏和遮罩层元素
    this.sidebarElement = document.querySelector('.sidebar')
    this.overlayElement = document.querySelector('.mobile-overlay')
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this))
    
    // 监听触摸事件，实现滑动关闭
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true })
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true })
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true })
  }

  private touchStartX = 0
  private touchCurrentX = 0
  private isDragging = false

  private handleTouchStart(e: TouchEvent) {
    if (!this.isMobile() || !this.isOpen) return
    
    this.touchStartX = e.touches[0].clientX
    this.isDragging = true
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.isDragging) return
    
    this.touchCurrentX = e.touches[0].clientX
    const deltaX = this.touchCurrentX - this.touchStartX
    
    // 只处理向左滑动（关闭侧边栏）
    if (deltaX < -50 && this.isOpen) {
      this.closeSidebar()
    }
  }

  private handleTouchEnd() {
    this.isDragging = false
  }

  private handleResize() {
    // 桌面端自动关闭移动端侧边栏
    if (!this.isMobile() && this.isOpen) {
      this.closeSidebar()
    }
  }

  private isMobile(): boolean {
    return window.innerWidth <= 768
  }

  public toggleSidebar() {
    if (this.isOpen) {
      this.closeSidebar()
    } else {
      this.openSidebar()
    }
  }

  public openSidebar() {
    if (!this.isMobile()) return
    
    this.isOpen = true
    
    // 添加侧边栏显示类
    if (this.sidebarElement) {
      this.sidebarElement.classList.add('show')
      this.sidebarElement.classList.remove('collapsed')
    }
    
    // 显示遮罩层
    this.showOverlay()
    
    // 禁止页面滚动
    document.body.style.overflow = 'hidden'
  }

  public closeSidebar() {
    this.isOpen = false
    
    // 移除侧边栏显示类
    if (this.sidebarElement) {
      this.sidebarElement.classList.remove('show')
      this.sidebarElement.classList.add('collapsed')
    }
    
    // 隐藏遮罩层
    this.hideOverlay()
    
    // 恢复页面滚动
    document.body.style.overflow = ''
  }

  private showOverlay() {
    if (this.overlayElement) {
      this.overlayElement.style.display = 'block'
      nextTick(() => {
        if (this.overlayElement) {
          this.overlayElement.style.opacity = '1'
        }
      })
    } else {
      // 动态创建遮罩层
      this.createOverlay()
    }
  }

  private hideOverlay() {
    if (this.overlayElement) {
      this.overlayElement.style.opacity = '0'
      setTimeout(() => {
        if (this.overlayElement) {
          this.overlayElement.style.display = 'none'
        }
      }, 300)
    }
  }

  private createOverlay() {
    const overlay = document.createElement('div')
    overlay.className = 'mobile-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1040;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(4px);
    `
    
    // 点击遮罩层关闭侧边栏
    overlay.addEventListener('click', () => this.closeSidebar())
    
    document.body.appendChild(overlay)
    this.overlayElement = overlay
    
    nextTick(() => {
      overlay.style.opacity = '1'
    })
  }

  public destroy() {
    window.removeEventListener('resize', this.handleResize.bind(this))
    document.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    document.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    document.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    
    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement)
    }
  }
}

/**
 * 路由加载超时处理
 */
export class RouteLoadingTimeoutHandler {
  private timeouts: Map<string, NodeJS.Timeout> = new Map()
  private readonly DEFAULT_TIMEOUT = 10000 // 10秒超时

  public setLoadingTimeout(routePath: string, callback: () => void, timeout = this.DEFAULT_TIMEOUT) {
    // 清除之前的超时
    this.clearTimeout(routePath)
    
    const timeoutId = setTimeout(() => {
      console.warn(`⏰ 路由加载超时: ${routePath}`)
      callback()
      this.timeouts.delete(routePath)
    }, timeout)
    
    this.timeouts.set(routePath, timeoutId)
  }

  public clearTimeout(routePath: string) {
    const timeoutId = this.timeouts.get(routePath)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.timeouts.delete(routePath)
    }
  }

  public clearAllTimeouts() {
    this.timeouts.forEach(timeoutId => clearTimeout(timeoutId))
    this.timeouts.clear()
  }
}

/**
 * 权限检查缓存管理
 */
export class PermissionCacheManager {
  private cache: Map<string, { result: boolean; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

  public set(permission: string, result: boolean) {
    this.cache.set(permission, {
      result,
      timestamp: Date.now()
    })
  }

  public get(permission: string): boolean | null {
    const cached = this.cache.get(permission)
    if (!cached) return null
    
    // 检查缓存是否过期
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(permission)
      return null
    }
    
    return cached.result
  }

  public clear() {
    this.cache.clear()
  }

  public cleanExpired() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key)
      }
    }
  }
}

/**
 * 移动端触摸优化
 */
export class TouchOptimizer {
  private lastTouchTime = 0
  private readonly DOUBLE_TAP_DELAY = 300

  public preventDoubleTap(element: HTMLElement) {
    element.addEventListener('touchend', (e) => {
      const now = Date.now()
      if (now - this.lastTouchTime < this.DOUBLE_TAP_DELAY) {
        e.preventDefault()
        return false
      }
      this.lastTouchTime = now
    }, { passive: false })
  }

  public addTouchFeedback(element: HTMLElement) {
    let touchTimeout: NodeJS.Timeout
    
    element.addEventListener('touchstart', () => {
      element.classList.add('touch-active')
      clearTimeout(touchTimeout)
    }, { passive: true })
    
    element.addEventListener('touchend', () => {
      touchTimeout = setTimeout(() => {
        element.classList.remove('touch-active')
      }, 150)
    }, { passive: true })
    
    element.addEventListener('touchcancel', () => {
      element.classList.remove('touch-active')
      clearTimeout(touchTimeout)
    }, { passive: true })
  }
}

// 导出单例实例
export const mobileNavigationManager = new MobileNavigationManager()
export const routeLoadingTimeoutHandler = new RouteLoadingTimeoutHandler()
export const permissionCacheManager = new PermissionCacheManager()
export const touchOptimizer = new TouchOptimizer()

// CSS类添加到全局样式
if (typeof window !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    .touch-active {
      background-color: rgba(0, 0, 0, 0.1) !important;
      transform: scale(0.98) !important;
      transition: all 0.1s ease !important;
    }
    
    @media (hover: none) and (pointer: coarse) {
      .touch-active:hover {
        background-color: rgba(0, 0, 0, 0.1) !important;
      }
    }
  `
  document.head.appendChild(style)
}