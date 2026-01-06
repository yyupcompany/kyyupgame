/**
 * 🏫 移动端状态管理
 * 
 * 基于 02-技术栈详解.md 的状态管理设计
 * 管理设备信息、触摸手势、PWA状态等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import mobileConfig from '../config/mobile.config'

export interface DeviceInfo {
  userAgent: string
  platform: string
  screenWidth: number
  screenHeight: number
  devicePixelRatio: number
  orientation: 'portrait' | 'landscape'
  isTouch: boolean
  isOnline: boolean
}

export interface GestureState {
  isSwipeEnabled: boolean
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null
  lastSwipeTime: number
}

export interface PWAState {
  isInstalled: boolean
  canInstall: boolean
  installPrompt: any
  isStandalone: boolean
}

export const useMobileStore = defineStore('mobile', () => {
  // ==================== 状态数据 ====================
  
  // 设备信息
  const deviceInfo = ref<DeviceInfo>({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio || 1,
    orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    isTouch: 'ontouchstart' in window,
    isOnline: navigator.onLine
  })

  // 手势状态
  const gestureState = ref<GestureState>({
    isSwipeEnabled: true,
    swipeDirection: null,
    lastSwipeTime: 0
  })

  // PWA状态
  const pwaState = ref<PWAState>({
    isInstalled: false,
    canInstall: false,
    installPrompt: null,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches
  })

  // UI状态
  const isKeyboardVisible = ref(false)
  const safeAreaInsets = ref({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  })

  // 应用状态
  const isAppFocused = ref(true)
  const isAppVisible = ref(true)
  const lastActiveTime = ref(Date.now())

  // 扫描器状态
  const scannerVisible = ref(false)
  const voiceAssistantVisible = ref(false)

  // ==================== 计算属性 ====================

  // 设备类型判断
  const isMobile = computed(() => 
    deviceInfo.value.screenWidth <= mobileConfig.breakpoints.mobile
  )

  const isTablet = computed(() => 
    deviceInfo.value.screenWidth > mobileConfig.breakpoints.mobile &&
    deviceInfo.value.screenWidth <= mobileConfig.breakpoints.tablet
  )

  const isDesktop = computed(() => 
    deviceInfo.value.screenWidth > mobileConfig.breakpoints.tablet
  )

  // 操作系统判断
  const isIOS = computed(() => 
    /iPad|iPhone|iPod/.test(deviceInfo.value.userAgent)
  )

  const isAndroid = computed(() => 
    /Android/.test(deviceInfo.value.userAgent)
  )

  const isSafari = computed(() => 
    /Safari/.test(deviceInfo.value.userAgent) && 
    !/Chrome/.test(deviceInfo.value.userAgent)
  )

  const isChrome = computed(() => 
    /Chrome/.test(deviceInfo.value.userAgent)
  )

  // 屏幕相关
  const isPortrait = computed(() => 
    deviceInfo.value.orientation === 'portrait'
  )

  const isLandscape = computed(() => 
    deviceInfo.value.orientation === 'landscape'
  )

  const isRetina = computed(() => 
    deviceInfo.value.devicePixelRatio >= 2
  )

  // 安全区域
  const hasSafeArea = computed(() => 
    isIOS.value && pwaState.value.isStandalone
  )

  const hasNotch = computed(() => 
    isIOS.value && 
    deviceInfo.value.screenHeight >= 812 && // iPhone X系列及以后
    deviceInfo.value.screenWidth >= 375
  )

  // 触摸能力
  const supportsTouchGestures = computed(() => 
    deviceInfo.value.isTouch && gestureState.value.isSwipeEnabled
  )

  // PWA能力
  const canInstallPWA = computed(() => 
    pwaState.value.canInstall && !pwaState.value.isInstalled
  )

  const isRunningStandalone = computed(() => 
    pwaState.value.isStandalone
  )

  // 网络状态
  const isOnline = computed(() => 
    deviceInfo.value.isOnline
  )

  const isOffline = computed(() => 
    !deviceInfo.value.isOnline
  )

  // ==================== 方法 ====================

  // 初始化设备信息
  const initializeDevice = () => {
    // 更新设备信息
    updateDeviceInfo()
    
    // 初始化安全区域
    updateSafeAreaInsets()
    
    // 设置事件监听器
    setupEventListeners()
    
    // 初始化PWA
    initializePWA()
  }

  // 更新设备信息
  const updateDeviceInfo = () => {
    deviceInfo.value = {
      ...deviceInfo.value,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      isOnline: navigator.onLine
    }
  }

  // 更新安全区域
  const updateSafeAreaInsets = () => {
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement)
      safeAreaInsets.value = {
        top: parseInt(style.getPropertyValue('--sat') || '0'),
        bottom: parseInt(style.getPropertyValue('--sab') || '0'),
        left: parseInt(style.getPropertyValue('--sal') || '0'),
        right: parseInt(style.getPropertyValue('--sar') || '0')
      }
    }
  }

  // 设置事件监听器
  const setupEventListeners = () => {
    // 屏幕方向变化
    window.addEventListener('orientationchange', () => {
      setTimeout(updateDeviceInfo, 100)
    })

    // 窗口大小变化
    window.addEventListener('resize', updateDeviceInfo)

    // 网络状态变化
    window.addEventListener('online', () => {
      deviceInfo.value.isOnline = true
    })

    window.addEventListener('offline', () => {
      deviceInfo.value.isOnline = false
    })

    // 键盘显示/隐藏检测
    if (isIOS.value) {
      setupIOSKeyboardDetection()
    } else if (isAndroid.value) {
      setupAndroidKeyboardDetection()
    }

    // 应用焦点状态
    window.addEventListener('focus', () => {
      isAppFocused.value = true
      lastActiveTime.value = Date.now()
    })

    window.addEventListener('blur', () => {
      isAppFocused.value = false
    })

    // 应用可见性
    document.addEventListener('visibilitychange', () => {
      isAppVisible.value = !document.hidden
      if (isAppVisible.value) {
        lastActiveTime.value = Date.now()
      }
    })
  }

  // iOS键盘检测
  const setupIOSKeyboardDetection = () => {
    let initialViewportHeight = window.visualViewport?.height || window.innerHeight

    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight
      const heightDiff = initialViewportHeight - currentHeight
      
      isKeyboardVisible.value = heightDiff > 150 // 键盘高度阈值
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
    } else {
      window.addEventListener('resize', handleViewportChange)
    }
  }

  // Android键盘检测
  const setupAndroidKeyboardDetection = () => {
    let initialHeight = window.innerHeight

    const handleResize = () => {
      const currentHeight = window.innerHeight
      const heightDiff = initialHeight - currentHeight
      
      isKeyboardVisible.value = heightDiff > 150
    }

    window.addEventListener('resize', handleResize)
  }

  // 初始化PWA
  const initializePWA = () => {
    // 检测PWA安装状态
    pwaState.value.isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    // 监听PWA安装提示
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault()
      pwaState.value.installPrompt = event
      pwaState.value.canInstall = true
    })

    // 监听PWA安装完成
    window.addEventListener('appinstalled', () => {
      pwaState.value.isInstalled = true
      pwaState.value.canInstall = false
      pwaState.value.installPrompt = null
    })
  }

  // PWA安装
  const installPWA = async () => {
    if (pwaState.value.installPrompt) {
      const result = await pwaState.value.installPrompt.prompt()
      if (result.outcome === 'accepted') {
        pwaState.value.isInstalled = true
        pwaState.value.canInstall = false
      }
      pwaState.value.installPrompt = null
    }
  }

  // 触摸手势处理
  const handleSwipeGesture = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!gestureState.value.isSwipeEnabled) return

    const now = Date.now()
    if (now - gestureState.value.lastSwipeTime < mobileConfig.gesture.swipeThreshold) return

    gestureState.value.swipeDirection = direction
    gestureState.value.lastSwipeTime = now

    // 触发相应的手势事件
    emitSwipeEvent(direction)
  }

  // 发射手势事件
  const emitSwipeEvent = (direction: string) => {
    const event = new CustomEvent('mobile-swipe', {
      detail: { direction }
    })
    window.dispatchEvent(event)
  }

  // 震动反馈
  const vibrate = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  // 触觉反馈
  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    // iOS触觉反馈
    if (isIOS.value && 'Taptic' in window) {
      const intensity = type === 'light' ? 1 : type === 'medium' ? 2 : 3;
      (window as any).Taptic.impact(intensity)
    } else {
      // 通用震动反馈
      const patterns = {
        light: 10,
        medium: [10, 10, 10],
        heavy: [20, 10, 20]
      }
      vibrate(patterns[type])
    }
  }

  // 打开扫描器
  const openScanner = () => {
    scannerVisible.value = true
    hapticFeedback('light')
  }

  // 关闭扫描器
  const closeScanner = () => {
    scannerVisible.value = false
  }

  // 打开语音助手
  const openVoiceAssistant = () => {
    voiceAssistantVisible.value = true
    hapticFeedback('light')
  }

  // 关闭语音助手
  const closeVoiceAssistant = () => {
    voiceAssistantVisible.value = false
  }

  // 打开AI助手
  const openAiAssistant = () => {
    // 这里可以触发AI助手显示
    hapticFeedback('medium')
    
    const event = new CustomEvent('open-ai-assistant')
    window.dispatchEvent(event)
  }

  // 获取设备性能信息
  const getPerformanceInfo = () => {
    return {
      memory: (performance as any).memory?.usedJSHeapSize || 0,
      timing: performance.timing,
      isHighPerformance: deviceInfo.value.devicePixelRatio <= 2 && 
                        deviceInfo.value.screenWidth <= 1920,
      batteryLevel: (navigator as any).battery?.level || 1
    }
  }

  // 优化性能设置
  const optimizePerformance = () => {
    const performanceInfo = getPerformanceInfo()
    
    // 根据设备性能调整设置
    if (!performanceInfo.isHighPerformance) {
      // 降低动画质量
      document.documentElement.style.setProperty('--animation-duration', '0.1s')
      
      // 禁用复杂效果
      document.documentElement.classList.add('low-performance')
    }
  }

  // 清理资源
  const cleanup = () => {
    // 清理事件监听器和定时器
    window.removeEventListener('orientationchange', updateDeviceInfo)
    window.removeEventListener('resize', updateDeviceInfo)
    window.removeEventListener('online', () => deviceInfo.value.isOnline = true)
    window.removeEventListener('offline', () => deviceInfo.value.isOnline = false)
  }

  // ==================== 返回 ====================

  return {
    // 状态
    deviceInfo,
    gestureState,
    pwaState,
    isKeyboardVisible,
    safeAreaInsets,
    isAppFocused,
    isAppVisible,
    lastActiveTime,
    scannerVisible,
    voiceAssistantVisible,

    // 计算属性
    isMobile,
    isTablet,
    isDesktop,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isPortrait,
    isLandscape,
    isRetina,
    hasSafeArea,
    hasNotch,
    supportsTouchGestures,
    canInstallPWA,
    isRunningStandalone,
    isOnline,
    isOffline,

    // 方法
    initializeDevice,
    updateDeviceInfo,
    updateSafeAreaInsets,
    installPWA,
    handleSwipeGesture,
    vibrate,
    hapticFeedback,
    openScanner,
    closeScanner,
    openVoiceAssistant,
    closeVoiceAssistant,
    openAiAssistant,
    getPerformanceInfo,
    optimizePerformance,
    cleanup
  }
})

export default useMobileStore