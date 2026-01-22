/**
 * 移动端无障碍性 Composable
 * Mobile Accessibility Composable
 *
 * 提供无障碍性相关的工具函数和状态管理
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
// 导入新的日志系统
import { CallingLogger } from '../utils/CallingLogger'

// 无障碍性配置
export interface AccessibilityConfig {
  // 字体大小
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  // 高对比度
  highContrast: boolean
  // 减少动画
  reduceMotion: boolean
  // 屏幕阅读器模式
  screenReader: boolean
  // 键盘导航
  keyboardNavigation: boolean
  // 触摸反馈
  touchFeedback: boolean
  // 焦点可见性
  focusVisible: boolean
  // 语音提示
  voiceAnnouncements: boolean
}

// 语音提示消息
interface VoiceMessage {
  text: string
  priority: 'low' | 'medium' | 'high'
  delay?: number
}

/**
 * 无障碍性管理 Composable
 */
export function useAccessibility(initialConfig: Partial<AccessibilityConfig> = {}) {
  // 创建日志上下文
  const logContext = CallingLogger.createComponentContext('useAccessibility', {
    composable: 'useAccessibility'
  })
  // 配置状态
  const config = ref<AccessibilityConfig>({
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    keyboardNavigation: false,
    touchFeedback: true,
    focusVisible: true,
    voiceAnnouncements: false,
    ...initialConfig
  })

  // 系统偏好检测
  const prefersReducedMotion = ref(false)
  const prefersHighContrast = ref(false)
  const prefersDarkMode = ref(false)

  // 语音合成
  let speechSynthesis: SpeechSynthesis | null = null
  let speechQueue: VoiceMessage[] = []
  let isSpeaking = ref(false)

  // 焦点管理
  const focusableElements = ref<HTMLElement[]>([])
  const currentFocusIndex = ref(-1)

  // 计算属性
  const fontSizeClass = computed(() => {
    const sizeMap = {
      small: 'font-size-small',
      medium: 'font-size-medium',
      large: 'font-size-large',
      'extra-large': 'font-size-extra-large'
    }
    return sizeMap[config.value.fontSize]
  })

  const accessibilityClasses = computed(() => [
    fontSizeClass.value,
    {
      'high-contrast': config.value.highContrast,
      'reduce-motion': config.value.reduceMotion || prefersReducedMotion.value,
      'screen-reader': config.value.screenReader,
      'keyboard-navigation': config.value.keyboardNavigation,
      'touch-feedback': config.value.touchFeedback,
      'focus-visible': config.value.focusVisible
    }
  ])

  const systemPreferences = computed(() => ({
    prefersReducedMotion: prefersReducedMotion.value,
    prefersHighContrast: prefersHighContrast.value,
    prefersDarkMode: prefersDarkMode.value
  }))

  // 检测系统偏好
  const detectSystemPreferences = () => {
    // 减少动画偏好
    const mediaQueryMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQueryMotion.matches

    // 高对比度偏好
    const mediaQueryContrast = window.matchMedia('(prefers-contrast: high)')
    prefersHighContrast.value = mediaQueryContrast.matches

    // 暗黑模式偏好
    const mediaQueryDark = window.matchMedia('(prefers-color-scheme: dark)')
    prefersDarkMode.value = mediaQueryDark.matches

    // 监听变化
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }

    const handleContrastChange = (e: MediaQueryListEvent) => {
      prefersHighContrast.value = e.matches
    }

    const handleDarkChange = (e: MediaQueryListEvent) => {
      prefersDarkMode.value = e.matches
    }

    mediaQueryMotion.addEventListener('change', handleMotionChange)
    mediaQueryContrast.addEventListener('change', handleContrastChange)
    mediaQueryDark.addEventListener('change', handleDarkChange)

    // 返回清理函数
    return () => {
      mediaQueryMotion.removeEventListener('change', handleMotionChange)
      mediaQueryContrast.removeEventListener('change', handleContrastChange)
      mediaQueryDark.removeEventListener('change', handleDarkChange)
    }
  }

  // 初始化语音合成
  const initSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis = window.speechSynthesis
      return true
    }
    return false
  }

  // 语音提示
  const speak = (text: string, options: { priority?: 'low' | 'medium' | 'high'; delay?: number } = {}) => {
    if (!config.value.voiceAnnouncements || !speechSynthesis) {
      return
    }

    const message: VoiceMessage = {
      text,
      priority: options.priority || 'medium',
      delay: options.delay || 0
    }

    if (message.priority === 'high') {
      // 高优先级消息立即播放
      speechSynthesis.cancel()
      speakNow(message)
    } else {
      // 其他消息加入队列
      speechQueue.push(message)
      processSpeechQueue()
    }
  }

  const speakNow = (message: VoiceMessage) => {
    if (!speechSynthesis) return

    try {
      const utterance = new SpeechSynthesisUtterance(message.text)
      utterance.lang = 'zh-CN'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 0.8

      utterance.onstart = () => {
        isSpeaking.value = true
      }

      utterance.onend = () => {
        isSpeaking.value = false
        processSpeechQueue()
      }

      utterance.onerror = () => {
        isSpeaking.value = false
        processSpeechQueue()
      }

      if (message.delay && message.delay > 0) {
        setTimeout(() => {
          speechSynthesis?.speak(utterance)
        }, message.delay)
      } else {
        speechSynthesis?.speak(utterance)
      }
    } catch (error) {
      CallingLogger.logError(logContext, 'Speech synthesis error', error as Error, { messageText: message.text })
      isSpeaking.value = false
      processSpeechQueue()
    }
  }

  const processSpeechQueue = () => {
    if (isSpeaking.value || speechQueue.length === 0 || !speechSynthesis) {
      return
    }

    const message = speechQueue.shift()
    if (message) {
      speakNow(message)
    }
  }

  // 停止语音
  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel()
      speechQueue = []
      isSpeaking.value = false
    }
  }

  // 焦点管理
  const trapFocus = (container: HTMLElement) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    focusableElements.value = Array.from(focusable)

    const firstElement = focusableElements.value[0]
    const lastElement = focusableElements.value[focusableElements.value.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    // 返回清理函数
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }

  // 设置焦点
  const setFocus = (element: HTMLElement, options: { preventScroll?: boolean } = {}) => {
    element.focus({
      preventScroll: options.preventScroll || false
    })

    // 为屏幕阅读器宣布焦点变化
    if (config.value.screenReader && element.textContent) {
      speak(`聚焦到 ${element.textContent.trim()}`, { priority: 'low' })
    }
  }

  // 获取焦点元素
  const getFocusableElements = (container: HTMLElement) => {
    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(selector)) as HTMLElement[]
  }

  // 键盘导航
  const handleKeyboardNavigation = (container: HTMLElement) => {
    const elements = getFocusableElements(container)
    focusableElements.value = elements

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault()
          navigateFocus(1)
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault()
          navigateFocus(-1)
          break
        case 'Home':
          e.preventDefault()
          navigateToIndex(0)
          break
        case 'End':
          e.preventDefault()
          navigateToIndex(elements.length - 1)
          break
        case 'Enter':
        case ' ':
          if (e.target instanceof HTMLElement) {
            e.target.click()
          }
          break
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }

  const navigateFocus = (direction: number) => {
    const elements = focusableElements.value
    if (elements.length === 0) return

    let newIndex = currentFocusIndex.value + direction

    if (newIndex < 0) {
      newIndex = elements.length - 1
    } else if (newIndex >= elements.length) {
      newIndex = 0
    }

    navigateToIndex(newIndex)
  }

  const navigateToIndex = (index: number) => {
    const elements = focusableElements.value
    if (index >= 0 && index < elements.length) {
      currentFocusIndex.value = index
      setFocus(elements[index])
    }
  }

  // 触摸反馈
  const provideTouchFeedback = (element: HTMLElement) => {
    if (!config.value.touchFeedback) return

    // 震动反馈
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    // 视觉反馈
    element.style.transform = 'scale(0.95)'
    setTimeout(() => {
      element.style.transform = 'scale(1)'
    }, 100)

    // 声音反馈
    if (config.value.voiceAnnouncements) {
      speak('已选择', { priority: 'low' })
    }
  }

  // ARIA 标签管理
  const setAriaLabel = (element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label)
  }

  const setAriaDescribedBy = (element: HTMLElement, describedById: string) => {
    element.setAttribute('aria-describedby', describedById)
  }

  const setAriaExpanded = (element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString())
  }

  const setAriaSelected = (element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString())
  }

  const setAriaDisabled = (element: HTMLElement, disabled: boolean) => {
    element.setAttribute('aria-disabled', disabled.toString())
  }

  // 状态变化通知
  const announceStateChange = (state: string, value: any) => {
    if (config.value.screenReader || config.value.voiceAnnouncements) {
      const message = `${state}：${typeof value === 'boolean' ? (value ? '已启用' : '已禁用') : value}`
      speak(message, { priority: 'medium' })
    }
  }

  // 保存和加载配置
  const saveConfig = () => {
    try {
      localStorage.setItem('accessibility-config', JSON.stringify(config.value))
      CallingLogger.logDebug(logContext, '无障碍性配置保存成功', { config: config.value })
    } catch (error) {
      CallingLogger.logError(logContext, 'Failed to save accessibility config', error as Error)
    }
  }

  const loadConfig = () => {
    try {
      const saved = localStorage.getItem('accessibility-config')
      if (saved) {
        const parsedConfig = JSON.parse(saved)
        config.value = { ...config.value, ...parsedConfig }
        CallingLogger.logDebug(logContext, '无障碍性配置加载成功', { savedConfig: parsedConfig })
      }
    } catch (error) {
      CallingLogger.logError(logContext, 'Failed to load accessibility config', error as Error)
    }
  }

  // 重置配置
  const resetConfig = () => {
    config.value = {
      fontSize: 'medium',
      highContrast: false,
      reduceMotion: false,
      screenReader: false,
      keyboardNavigation: false,
      touchFeedback: true,
      focusVisible: true,
      voiceAnnouncements: false,
      ...initialConfig
    }
    localStorage.removeItem('accessibility-config')
  }

  // 应用配置到文档
  const applyConfigToDocument = () => {
    const root = document.documentElement

    // 应用字体大小
    root.className = root.className.replace(/font-size-\w+/g, '')
    root.classList.add(fontSizeClass.value)

    // 应用高对比度
    if (config.value.highContrast || prefersHighContrast.value) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // 应用减少动画
    if (config.value.reduceMotion || prefersReducedMotion.value) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // 应用其他类
    if (config.value.screenReader) {
      root.setAttribute('role', 'application')
    } else {
      root.removeAttribute('role')
    }

    root.classList.toggle('keyboard-navigation', config.value.keyboardNavigation)
    root.classList.toggle('touch-feedback', config.value.touchFeedback)
    root.classList.toggle('focus-visible', config.value.focusVisible)
  }

  // 监听配置变化
  watch(config, (newConfig, oldConfig) => {
    applyConfigToDocument()
    saveConfig()

    // 通知变化
    Object.keys(newConfig).forEach(key => {
      if (newConfig[key as keyof AccessibilityConfig] !== oldConfig[key as keyof AccessibilityConfig]) {
        announceStateChange(key, newConfig[key as keyof AccessibilityConfig])
      }
    })
  }, { deep: true })

  // 生命周期
  onMounted(() => {
    loadConfig()
    applyConfigToDocument()

    const cleanupSystemPrefs = detectSystemPreferences()
    initSpeechSynthesis()

    onUnmounted(() => {
      cleanupSystemPrefs()
      stopSpeaking()
    })
  })

  return {
    // 状态
    config,
    fontSizeClass,
    accessibilityClasses,
    systemPreferences,
    isSpeaking,

    // 方法
    speak,
    stopSpeaking,
    trapFocus,
    setFocus,
    getFocusableElements,
    handleKeyboardNavigation,
    provideTouchFeedback,
    announceStateChange,

    // ARIA 管理
    setAriaLabel,
    setAriaDescribedBy,
    setAriaExpanded,
    setAriaSelected,
    setAriaDisabled,

    // 配置管理
    saveConfig,
    loadConfig,
    resetConfig,
    applyConfigToDocument
  }
}

/**
 * 创建跳转到主内容的链接
 */
export function createSkipToMainLink() {
  const link = document.createElement('a')
  link.href = '#main-content'
  link.className = 'skip-to-main'
  link.textContent = '跳转到主内容'
  link.setAttribute('aria-label', '跳转到主内容')

  document.body.insertBefore(link, document.body.firstChild)

  return link
}

/**
 * 为动态内容添加无障碍性支持
 */
export function setupDynamicAccessibility(container: HTMLElement) {
  // 监听内容变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // 为新添加的交互元素添加必要的 ARIA 属性
            enhanceAccessibilityForNode(node)
          }
        })
      }
    })
  })

  observer.observe(container, {
    childList: true,
    subtree: true
  })

  return observer
}

/**
 * 增强节点的无障碍性
 */
function enhanceAccessibilityForNode(node: HTMLElement) {
  const tagName = node.tagName.toLowerCase()

  switch (tagName) {
    case 'button':
      if (!node.getAttribute('aria-label') && !node.textContent?.trim()) {
        node.setAttribute('aria-label', '按钮')
      }
      break

    case 'input':
      if (!node.getAttribute('aria-label') && !node.getAttribute('aria-labelledby')) {
        const label = node.getAttribute('placeholder') || node.getAttribute('title')
        if (label) {
          node.setAttribute('aria-label', label)
        }
      }
      break

    case 'img':
      if (!node.getAttribute('alt') && !node.getAttribute('aria-label')) {
        node.setAttribute('role', 'img')
        node.setAttribute('aria-label', '图片')
      }
      break

    case 'a':
      if (!node.textContent?.trim() && !node.getAttribute('aria-label')) {
        const href = node.getAttribute('href')
        if (href) {
          node.setAttribute('aria-label', `链接 ${href}`)
        }
      }
      break
  }
}

export default useAccessibility