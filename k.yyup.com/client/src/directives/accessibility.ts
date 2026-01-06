/**
 * 无障碍性指令
 * Accessibility Directives
 *
 * 提供用于增强无障碍性的 Vue 3 指令
 */

import type { App, Directive, DirectiveBinding } from 'vue'
import { useAccessibility } from '@/composables/useAccessibility'

// 获取无障碍性实例
let accessibilityInstance: ReturnType<typeof useAccessibility> | null = null

/**
 * 焦点管理指令
 * v-focus
 */
export const vFocus: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value = {} } = binding
    const { delay = 0, preventScroll = false } = value as any

    if (delay > 0) {
      setTimeout(() => {
        accessibilityInstance?.setFocus(el, { preventScroll })
      }, delay)
    } else {
      accessibilityInstance?.setFocus(el, { preventScroll })
    }
  }
}

/**
 * 焦点可见性指令
 * v-focus-visible
 */
export const vFocusVisible: Directive = {
  mounted(el: HTMLElement) {
    el.classList.add('focus-visible')
  }
}

/**
 * 触摸反馈指令
 * v-touch-feedback
 */
export const vTouchFeedback: Directive = {
  mounted(el: HTMLElement) {
    const handleTouchStart = () => {
      accessibilityInstance?.provideTouchFeedback(el)
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('mousedown', handleTouchStart)

    // 清理函数
    const cleanup = () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('mousedown', handleTouchStart)
    }

    // 存储清理函数
    (el as any)._cleanup = cleanup
  },

  unmounted(el: HTMLElement) {
    const cleanup = (el as any)._cleanup
    if (cleanup) {
      cleanup()
    }
  }
}

/**
 * ARIA 标签指令
 * v-aria-label
 */
export const vAriaLabel: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    accessibilityInstance?.setAriaLabel(el, binding.value as string)
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    accessibilityInstance?.setAriaLabel(el, binding.value as string)
  }
}

/**
 * ARIA 描述指令
 * v-aria-describedby
 */
export const vAriaDescribedBy: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    accessibilityInstance?.setAriaDescribedBy(el, binding.value as string)
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    accessibilityInstance?.setAriaDescribedBy(el, binding.value as string)
  }
}

/**
 * ARIA 展开状态指令
 * v-aria-expanded
 */
export const vAriaExpanded: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    accessibilityInstance?.setAriaExpanded(el, binding.value as boolean)
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    accessibilityInstance?.setAriaExpanded(el, binding.value as boolean)
  }
}

/**
 * ARIA 选中状态指令
 * v-aria-selected
 */
export const vAriaSelected: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    accessibilityInstance?.setAriaSelected(el, binding.value as boolean)
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    accessibilityInstance?.setAriaSelected(el, binding.value as boolean)
  }
}

/**
 * ARIA 禁用状态指令
 * v-aria-disabled
 */
export const vAriaDisabled: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    accessibilityInstance?.setAriaDisabled(el, binding.value as boolean)
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    accessibilityInstance?.setAriaDisabled(el, binding.value as boolean)
  }
}

/**
 * 语音提示指令
 * v-voice
 */
export const vVoice: Directive = {
  mounted(_el: HTMLElement, binding: DirectiveBinding) {
    const { value = {} } = binding
    const { text, priority = 'medium', delay = 0 } = value as any

    if (text) {
      accessibilityInstance?.speak(text, { priority, delay })
    }
  },

  updated(_el: HTMLElement, binding: DirectiveBinding) {
    const { value = {} } = binding
    const { text, priority = 'medium', delay = 0 } = value as any

    if (text) {
      accessibilityInstance?.speak(text, { priority, delay })
    }
  }
}

/**
 * 焦点陷阱指令
 * v-focus-trap
 */
export const vFocusTrap: Directive = {
  mounted(el: HTMLElement) {
    const cleanup = accessibilityInstance?.trapFocus(el)
    ;(el as any)._focusTrapCleanup = cleanup
  },

  unmounted(el: HTMLElement) {
    const cleanup = (el as any)._focusTrapCleanup
    if (cleanup) {
      cleanup()
    }
  }
}

/**
 * 键盘导航指令
 * v-keyboard-nav
 */
export const vKeyboardNav: Directive = {
  mounted(el: HTMLElement) {
    const cleanup = accessibilityInstance?.handleKeyboardNavigation(el)
    ;(el as any)._keyboardNavCleanup = cleanup
  },

  unmounted(el: HTMLElement) {
    const cleanup = (el as any)._keyboardNavCleanup
    if (cleanup) {
      cleanup()
    }
  }
}

/**
 * 跳过链接指令
 * v-skip-link
 */
export const vSkipLink: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value = '#main-content' } = binding
    const href = value as string

    el.setAttribute('href', href)
    el.setAttribute('aria-label', '跳转到主内容')
    el.classList.add('skip-link')
  }
}

/**
 * 实时区域指令
 * v-live-region
 */
export const vLiveRegion: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value = 'polite' } = binding
    const politeness = value as 'off' | 'polite' | 'assertive'

    el.setAttribute('aria-live', politeness)
    el.setAttribute('aria-atomic', 'true')
    el.classList.add('sr-only')

    // 存储原始内容
    ;(el as any)._originalContent = el.textContent
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { value, oldValue } = binding

    // 只有内容变化时才通知
    if (value !== oldValue && value !== undefined) {
      const originalContent = (el as any)._originalContent || ''
      const newContent = typeof value === 'string' ? value : String(value)

      if (newContent !== originalContent) {
        el.textContent = newContent
        ;(el as any)._originalContent = newContent
      }
    }
  }
}

/**
 * 角色指令
 * v-role
 */
export const vRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    el.setAttribute('role', binding.value as string)
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    el.setAttribute('role', binding.value as string)
  }
}

/**
 * 标签指令
 * v-label
 */
export const vLabel: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const labelId = `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // 创建隐藏的标签元素
    const labelElement = document.createElement('div')
    labelElement.id = labelId
    labelElement.className = 'sr-only'
    labelElement.textContent = value as string
    document.body.appendChild(labelElement)

    // 设置 aria-labelledby
    el.setAttribute('aria-labelledby', labelId)

    // 存储清理函数
    ;(el as any)._labelCleanup = () => {
      document.body.removeChild(labelElement)
    }
  },

  unmounted(el: HTMLElement) {
    const cleanup = (el as any)._labelCleanup
    if (cleanup) {
      cleanup()
    }
  }
}

/**
 * 无障碍性增强指令集合
 */
export const accessibilityDirectives = {
  focus: vFocus,
  focusVisible: vFocusVisible,
  touchFeedback: vTouchFeedback,
  ariaLabel: vAriaLabel,
  ariaDescribedBy: vAriaDescribedBy,
  ariaExpanded: vAriaExpanded,
  ariaSelected: vAriaSelected,
  ariaDisabled: vAriaDisabled,
  voice: vVoice,
  focusTrap: vFocusTrap,
  keyboardNav: vKeyboardNav,
  skipLink: vSkipLink,
  liveRegion: vLiveRegion,
  role: vRole,
  label: vLabel
}

/**
 * 无障碍性插件
 */
export const AccessibilityPlugin = {
  install(app: App) {
    // 初始化无障碍性实例
    accessibilityInstance = useAccessibility()

    // 注册所有指令
    Object.entries(accessibilityDirectives).forEach(([name, directive]) => {
      app.directive(name, directive)
    })

    // 提供全局属性
    app.config.globalProperties.$accessibility = accessibilityInstance
    app.provide('accessibility', accessibilityInstance)

    // 创建跳转到主内容的链接
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const skipLink = document.createElement('a')
        skipLink.href = '#main-content'
        skipLink.className = 'skip-to-main'
        skipLink.textContent = '跳转到主内容'
        skipLink.setAttribute('aria-label', '跳转到主内容')
        document.body.insertBefore(skipLink, document.body.firstChild)
      }, 0)
    }
  }
}

/**
 * 自动增强无障碍性的混入
 */
export const accessibilityMixin = {
  mounted(this: any) {
    // 为组件添加无障碍性增强
    this.$nextTick(() => {
      this.enhanceAccessibility()
    })
  },

  updated(this: any) {
    // 更新时重新增强
    this.$nextTick(() => {
      this.enhanceAccessibility()
    })
  },

  methods: {
    enhanceAccessibility(this: any) {
      const el = this.$el as HTMLElement
      if (!el) return

      // 为可交互元素添加必要的 ARIA 属性
      const interactiveElements = el.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      interactiveElements.forEach((element) => {
        const htmlElement = element as HTMLElement
        // 添加焦点样式
        if (!htmlElement.classList.contains('focus-visible')) {
          htmlElement.classList.add('focus-visible')
        }

        // 添加触摸反馈
        if (!htmlElement.classList.contains('touch-enhanced')) {
          htmlElement.classList.add('touch-enhanced')
        }

        // 确保有足够的触摸目标
        const computedStyle = window.getComputedStyle(htmlElement)
        const width = parseFloat(computedStyle.width)
        const height = parseFloat(computedStyle.height)

        if (width < 44 || height < 44) {
          htmlElement.style.minWidth = '44px'
          htmlElement.style.minHeight = '44px'
          htmlElement.style.display = 'flex'
          htmlElement.style.alignItems = 'center'
          htmlElement.style.justifyContent = 'center'
        }
      })
    }
  }
}

export default AccessibilityPlugin