import { vi, type MockedFunction } from 'vitest'

/**
 * 移动端交互模拟工具函数
 * 用于测试移动端特有的交互行为
 */

export interface TouchEvent {
  type: string
  touches: Array<{
    clientX: number
    clientY: number
  }>
  changedTouches: Array<{
    clientX: number
    clientY: number
  }>
}

/**
 * 模拟触摸点击事件
 */
export const simulateTouch = (element: HTMLElement, x: number, y: number) => {
  const touchStart = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true,
    touches: [{ clientX: x, clientY: y }],
    changedTouches: [{ clientX: x, clientY: y }]
  } as any)

  const touchEnd = new TouchEvent('touchend', {
    bubbles: true,
    cancelable: true,
    touches: [],
    changedTouches: [{ clientX: x, clientY: y }]
  } as any)

  element.dispatchEvent(touchStart)
  element.dispatchEvent(touchEnd)
}

/**
 * 模拟滑动操作
 */
export const simulateSwipe = (
  element: HTMLElement,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  duration: number = 300
) => {
  const touchStart = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true,
    touches: [{ clientX: startX, clientY: startY }],
    changedTouches: [{ clientX: startX, clientY: startY }]
  } as any)

  const touchMove = new TouchEvent('touchmove', {
    bubbles: true,
    cancelable: true,
    touches: [{ clientX: endX, clientY: endY }],
    changedTouches: [{ clientX: endX, clientY: endY }]
  } as any)

  const touchEnd = new TouchEvent('touchend', {
    bubbles: true,
    cancelable: true,
    touches: [],
    changedTouches: [{ clientX: endX, clientY: endY }]
  } as any)

  element.dispatchEvent(touchStart)

  // 模拟滑动过程中的移动事件
  setTimeout(() => {
    element.dispatchEvent(touchMove)
  }, duration / 2)

  setTimeout(() => {
    element.dispatchEvent(touchEnd)
  }, duration)
}

/**
 * 模拟双指缩放
 */
export const simulatePinch = (
  element: HTMLElement,
  initialDistance: number,
  finalDistance: number
) => {
  const centerX = element.offsetWidth / 2
  const centerY = element.offsetHeight / 2

  // 计算两个触摸点的初始位置
  const halfInitial = initialDistance / 2
  const touch1StartX = centerX - halfInitial
  const touch1StartY = centerY
  const touch2StartX = centerX + halfInitial
  const touch2StartY = centerY

  // 计算两个触摸点的最终位置
  const halfFinal = finalDistance / 2
  const touch1EndX = centerX - halfFinal
  const touch1EndY = centerY
  const touch2EndX = centerX + halfFinal
  const touch2EndY = centerY

  const touchStart = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true,
    touches: [
      { clientX: touch1StartX, clientY: touch1StartY },
      { clientX: touch2StartX, clientY: touch2StartY }
    ],
    changedTouches: [
      { clientX: touch1StartX, clientY: touch1StartY },
      { clientX: touch2StartX, clientY: touch2StartY }
    ]
  } as any)

  const touchMove = new TouchEvent('touchmove', {
    bubbles: true,
    cancelable: true,
    touches: [
      { clientX: touch1EndX, clientY: touch1EndY },
      { clientX: touch2EndX, clientY: touch2EndY }
    ],
    changedTouches: [
      { clientX: touch1EndX, clientY: touch1EndY },
      { clientX: touch2EndX, clientY: touch2EndY }
    ]
  } as any)

  const touchEnd = new TouchEvent('touchend', {
    bubbles: true,
    cancelable: true,
    touches: [],
    changedTouches: [
      { clientX: touch1EndX, clientY: touch1EndY },
      { clientX: touch2EndX, clientY: touch2EndY }
    ]
  } as any)

  element.dispatchEvent(touchStart)
  element.dispatchEvent(touchMove)
  element.dispatchEvent(touchEnd)
}

/**
 * 模拟设备方向变化
 */
export const simulateOrientationChange = (orientation: 'portrait' | 'landscape') => {
  const orientationChangeEvent = new Event('orientationchange')

  // 模拟屏幕尺寸变化
  if (orientation === 'landscape') {
    Object.defineProperty(window.screen, 'width', {
      writable: true,
      configurable: true,
      value: 812
    })
    Object.defineProperty(window.screen, 'height', {
      writable: true,
      configurable: true,
      value: 375
    })
    Object.defineProperty(window, 'orientation', {
      writable: true,
      configurable: true,
      value: 90
    })
  } else {
    Object.defineProperty(window.screen, 'width', {
      writable: true,
      configurable: true,
      value: 375
    })
    Object.defineProperty(window.screen, 'height', {
      writable: true,
      configurable: true,
      value: 812
    })
    Object.defineProperty(window, 'orientation', {
      writable: true,
      configurable: true,
      value: 0
    })
  }

  window.dispatchEvent(orientationChangeEvent)
}

/**
 * 等待元素出现
 */
export const waitForElement = async (
  selector: string,
  timeout: number = 5000
): Promise<HTMLElement | null> => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element as HTMLElement)
      return
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLElement) {
            const foundElement = node.matches(selector) ? node : node.querySelector(selector)
            if (foundElement) {
              observer.disconnect()
              resolve(foundElement as HTMLElement)
              return
            }
          }
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    setTimeout(() => {
      observer.disconnect()
      resolve(null)
    }, timeout)
  })
}

/**
 * 输入文本到输入框
 */
export const typeText = async (
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  delay: number = 50
) => {
  element.focus()

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const inputEvent = new Event('input', { bubbles: true })
    element.value += char
    element.dispatchEvent(inputEvent)

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // 触发change事件
  const changeEvent = new Event('change', { bubbles: true })
  element.dispatchEvent(changeEvent)
}

/**
 * 模拟键盘按键
 */
export const pressKey = (
  element: HTMLElement,
  key: string,
  options: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {}
) => {
  const keydownEvent = new KeyboardEvent('keydown', {
    key,
    code: key,
    bubbles: true,
    cancelable: true,
    ...options
  })

  const keyupEvent = new KeyboardEvent('keyup', {
    key,
    code: key,
    bubbles: true,
    cancelable: true,
    ...options
  })

  element.dispatchEvent(keydownEvent)
  element.dispatchEvent(keyupEvent)
}

/**
 * 模拟滚动操作
 */
export const scrollTo = (
  element: HTMLElement,
  x: number,
  y: number,
  behavior: 'smooth' | 'auto' = 'smooth'
) => {
  element.scrollTo({
    left: x,
    top: y,
    behavior
  })
}

/**
 * 等待网络空闲
 */
export const waitForNetworkIdle = async (timeout: number = 5000): Promise<void> => {
  return new Promise((resolve) => {
    let pendingRequests = 0
    let timeoutId: NodeJS.Timeout

    const originalFetch = window.fetch
    window.fetch = (...args) => {
      pendingRequests++
      return originalFetch(...args).finally(() => {
        pendingRequests--
        if (pendingRequests === 0 && timeoutId) {
          clearTimeout(timeoutId)
          setTimeout(resolve, 100) // 额外等待确保所有微任务完成
        }
      })
    }

    timeoutId = setTimeout(() => {
      window.fetch = originalFetch
      resolve()
    }, timeout)

    // 如果没有请求在进行中，直接resolve
    if (pendingRequests === 0) {
      clearTimeout(timeoutId)
      window.fetch = originalFetch
      resolve()
    }
  })
}

/**
 * 模拟网络延迟
 */
export const simulateNetworkLatency = (delay: number) => {
  return new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * 创建Mock地理位置
 */
export const mockGeolocation = (latitude: number, longitude: number) => {
  const mockPosition = {
    coords: {
      latitude,
      longitude,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null
    },
    timestamp: Date.now()
  }

  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: (success: Function) => {
        setTimeout(() => success(mockPosition), 100)
      },
      watchPosition: (success: Function) => {
        setTimeout(() => success(mockPosition), 100)
        return Math.random()
      },
      clearWatch: vi.fn()
    },
    writable: true
  })
}

/**
 * 模拟设备信息
 */
export const mockDeviceInfo = (deviceInfo: Partial<any> = {}) => {
  const defaultDeviceInfo = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    platform: 'iPhone',
    vendor: 'Apple Computer, Inc.',
    hardwareConcurrency: 6,
    deviceMemory: 6,
    maxTouchPoints: 5,
    width: 375,
    height: 812,
    pixelRatio: 3,
    colorDepth: 24,
    orientation: 'portrait'
  }

  const mockDevice = { ...defaultDeviceInfo, ...deviceInfo }

  // Mock navigator properties
  Object.defineProperty(navigator, 'userAgent', {
    value: mockDevice.userAgent,
    writable: true
  })

  Object.defineProperty(navigator, 'platform', {
    value: mockDevice.platform,
    writable: true
  })

  Object.defineProperty(navigator, 'hardwareConcurrency', {
    value: mockDevice.hardwareConcurrency,
    writable: true
  })

  // Mock screen properties
  Object.defineProperty(window.screen, 'width', {
    value: mockDevice.width,
    writable: true
  })

  Object.defineProperty(window.screen, 'height', {
    value: mockDevice.height,
    writable: true
  })

  Object.defineProperty(window.screen, 'pixelDepth', {
    value: mockDevice.colorDepth,
    writable: true
  })

  return mockDevice
}

export default {
  simulateTouch,
  simulateSwipe,
  simulatePinch,
  simulateOrientationChange,
  waitForElement,
  typeText,
  pressKey,
  scrollTo,
  waitForNetworkIdle,
  simulateNetworkLatency,
  mockGeolocation,
  mockDeviceInfo
}