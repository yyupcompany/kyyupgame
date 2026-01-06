# 📱 移动端特性文档

## 🎯 移动端特性概述

移动端AI专家工作流系统专门为移动设备优化，提供原生应用级别的用户体验。系统集成了PWA、触觉反馈、手势导航、性能优化等现代移动端技术。

## 🔋 性能优化

### 电池管理
系统智能监控设备电池状态，根据电量自动调整性能模式。

```typescript
// 电池状态监控
const updateBatteryStatus = async () => {
  if ('getBattery' in navigator) {
    const battery = await (navigator as any).getBattery()
    batteryLevel.value = Math.round(battery.level * 100)
    
    // 低电量模式
    if (battery.level < 0.2) {
      enablePowerSavingMode()
    }
  }
}

const enablePowerSavingMode = () => {
  // 减少动画
  document.documentElement.style.setProperty('--animation-duration', '0.1s')
  // 降低刷新频率
  reducedRefreshRate.value = true
  // 暂停非关键后台任务
  pauseBackgroundTasks()
}
```

### 内存优化
- **智能缓存** - 基于使用频率的LRU缓存策略
- **内存监控** - 实时监控内存使用情况
- **垃圾回收** - 主动清理不需要的数据
- **组件懒加载** - 按需加载组件减少内存占用

```typescript
// 内存使用监控
const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    const usage = {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    }
    
    // 内存使用过高时清理
    if (usage.percentage > 80) {
      cleanupMemory()
    }
  }
}
```

### 网络优化
- **离线队列** - 网络断开时自动排队请求
- **智能重试** - 指数退避重试策略
- **请求合并** - 合并相似请求减少网络调用
- **数据压缩** - 自动压缩传输数据

```typescript
// 网络状态管理
class NetworkManager {
  private offlineQueue: Request[] = []
  
  async makeRequest(request: Request): Promise<Response> {
    if (!navigator.onLine) {
      this.offlineQueue.push(request)
      throw new Error('网络离线，请求已加入队列')
    }
    
    return this.executeWithRetry(request)
  }
  
  private async executeWithRetry(request: Request, attempt = 1): Promise<Response> {
    try {
      return await fetch(request)
    } catch (error) {
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000 // 指数退避
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.executeWithRetry(request, attempt + 1)
      }
      throw error
    }
  }
}
```

## 📶 PWA功能

### Service Worker
提供完整的离线支持和缓存管理。

```javascript
// sw.js - Service Worker
const CACHE_NAME = 'mobile-ai-expert-v1'
const urlsToCache = [
  '/aimobile/',
  '/aimobile/manifest.json',
  '/aimobile/icons/icon-192x192.png',
  '/aimobile/icons/icon-512x512.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中则返回缓存，否则网络请求
        return response || fetch(event.request)
      })
  )
})
```

### 应用安装
支持添加到主屏幕，提供原生应用体验。

```typescript
// 安装提示管理
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  showInstallPrompt()
})

const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('用户接受了安装')
    }
    
    deferredPrompt = null
  }
}
```

### 离线支持
- **离线页面** - 网络断开时显示离线页面
- **数据同步** - 网络恢复时自动同步数据
- **离线通知** - 离线状态下的本地通知

## 👆 触觉反馈

### 振动反馈
为用户操作提供触觉反馈，增强交互体验。

```typescript
class HapticFeedback {
  // 轻微振动 - 按钮点击
  static light() {
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }
  
  // 中等振动 - 重要操作
  static medium() {
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }
  
  // 强烈振动 - 错误或警告
  static heavy() {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  }
  
  // 成功反馈
  static success() {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 50])
    }
  }
  
  // 错误反馈
  static error() {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  }
}

// 使用示例
const handleButtonClick = () => {
  HapticFeedback.light()
  // 执行按钮逻辑
}
```

### 触觉模式
- **轻触模式** - 普通按钮点击
- **确认模式** - 重要操作确认
- **警告模式** - 错误或警告提示
- **成功模式** - 操作成功反馈

## 🤏 手势导航

### 滑动手势
支持各种滑动手势操作，提供直观的导航体验。

```typescript
class GestureHandler {
  private startX = 0
  private startY = 0
  private startTime = 0
  
  constructor(element: HTMLElement) {
    this.setupGestureListeners(element)
  }
  
  private setupGestureListeners(element: HTMLElement) {
    element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true })
    element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true })
  }
  
  private handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    this.startX = touch.clientX
    this.startY = touch.clientY
    this.startTime = Date.now()
  }
  
  private handleTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - this.startX
    const deltaY = touch.clientY - this.startY
    const deltaTime = Date.now() - this.startTime
    
    // 检测滑动手势
    if (Math.abs(deltaX) > 50 && deltaTime < 300) {
      if (deltaX > 0) {
        this.onSwipeRight()
      } else {
        this.onSwipeLeft()
      }
    }
    
    if (Math.abs(deltaY) > 50 && deltaTime < 300) {
      if (deltaY > 0) {
        this.onSwipeDown()
      } else {
        this.onSwipeUp()
      }
    }
  }
  
  private onSwipeRight() {
    // 右滑返回
    if (window.history.length > 1) {
      router.back()
    }
  }
  
  private onSwipeLeft() {
    // 左滑前进
    router.forward()
  }
  
  private onSwipeDown() {
    // 下拉刷新
    if (window.scrollY === 0) {
      location.reload()
    }
  }
  
  private onSwipeUp() {
    // 上滑操作
    // 可以自定义功能
  }
}
```

### 长按手势
```typescript
// 长按指令
app.directive('longpress', {
  mounted(el: HTMLElement, binding: any) {
    let timer: NodeJS.Timeout
    
    const start = () => {
      timer = setTimeout(() => {
        if (typeof binding.value === 'function') {
          binding.value()
          HapticFeedback.medium()
        }
      }, binding.arg || 500)
    }
    
    const cancel = () => {
      clearTimeout(timer)
    }
    
    el.addEventListener('touchstart', start)
    el.addEventListener('touchend', cancel)
    el.addEventListener('touchcancel', cancel)
  }
})
```

## 🎨 响应式设计

### 屏幕适配
支持各种移动设备屏幕尺寸和方向。

```css
/* 响应式断点 */
@media (max-width: 575.98px) {
  /* 小屏幕手机 */
  .container {
    padding: 0 12px;
  }
}

@media (min-width: 576px) and (max-width: 767.98px) {
  /* 大屏幕手机 */
  .container {
    max-width: 540px;
  }
}

@media (min-width: 768px) and (max-width: 991.98px) {
  /* 平板 */
  .container {
    max-width: 720px;
  }
}

/* 横屏适配 */
@media (orientation: landscape) {
  .mobile-layout {
    flex-direction: row;
  }
}
```

### 安全区域适配
支持刘海屏等特殊屏幕的安全区域适配。

```css
/* 安全区域变量 */
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-right: env(safe-area-inset-right);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
}

/* 安全区域适配 */
.safe-area-top {
  padding-top: var(--safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: var(--safe-area-inset-bottom);
}
```

## 🔔 通知系统

### 本地通知
```typescript
class LocalNotification {
  static async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }
  
  static show(title: string, options: NotificationOptions = {}) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/aimobile/icons/icon-192x192.png',
        badge: '/aimobile/icons/badge-72x72.png',
        ...options
      })
      
      // 点击通知处理
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
      
      return notification
    }
  }
}
```

### 推送通知
```typescript
// 推送通知订阅
const subscribeToPush = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    })
    
    // 发送订阅信息到服务器
    await sendSubscriptionToServer(subscription)
  }
}
```

## 🎯 用户体验优化

### 加载优化
- **骨架屏** - 内容加载时显示骨架屏
- **懒加载** - 图片和组件按需加载
- **预加载** - 预加载关键资源
- **代码分割** - 按路由分割代码

```vue
<template>
  <!-- 骨架屏 -->
  <div v-if="loading" class="skeleton">
    <div class="skeleton-header"></div>
    <div class="skeleton-content">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  </div>
  
  <!-- 实际内容 -->
  <div v-else class="content">
    <!-- 内容 -->
  </div>
</template>

<style>
.skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line {
  height: 16px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-line.short {
  width: 60%;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
```

### 错误处理
- **友好错误页面** - 用户友好的错误提示
- **错误恢复** - 自动重试和恢复机制
- **离线提示** - 网络断开时的提示
- **降级处理** - 功能不可用时的备选方案

### 无障碍支持
- **语义化HTML** - 使用语义化标签
- **ARIA标签** - 添加无障碍标签
- **键盘导航** - 支持键盘操作
- **屏幕阅读器** - 兼容屏幕阅读器

```vue
<template>
  <button 
    class="action-button"
    :aria-label="buttonLabel"
    :aria-pressed="isPressed"
    @click="handleClick"
  >
    <span class="sr-only">{{ screenReaderText }}</span>
    {{ buttonText }}
  </button>
</template>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
```

## 📊 性能监控

### 性能指标
- **首屏加载时间** - First Contentful Paint (FCP)
- **交互时间** - Time to Interactive (TTI)
- **累积布局偏移** - Cumulative Layout Shift (CLS)
- **最大内容绘制** - Largest Contentful Paint (LCP)

```typescript
// 性能监控
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'paint') {
      console.log(`${entry.name}: ${entry.startTime}ms`)
    }
  }
})

performanceObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
```

### 用户行为分析
- **页面访问统计** - 记录页面访问情况
- **功能使用统计** - 统计功能使用频率
- **错误统计** - 收集和分析错误信息
- **性能统计** - 监控应用性能指标

---

*移动端特性的设计和实现确保了应用在各种移动设备上都能提供优秀的用户体验，同时保持高性能和可靠性。*
