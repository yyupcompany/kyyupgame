
vi.mock('../../../src/utils/animation-utils', () => ({
  default: {},
  getDeviceInfo: vi.fn(() => ({ type: 'pc', os: 'windows' })),
  getDeviceType: vi.fn(() => 'pc')
}))

vi.mock('@/utils/animation-utils', () => ({
  default: {},
  getDeviceInfo: vi.fn(() => ({ type: 'pc', os: 'windows' })),
  getDeviceType: vi.fn(() => 'pc')
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import * as animationUtils from '../../../src/utils/animation-utils'

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRequestAnimationFrame = vi.fn()
const mockCancelAnimationFrame = vi.fn()

// Mock performance
const mockPerformance = {
  now: vi.fn()
}

// Mock CSSStyleDeclaration
const mockStyle = {
  opacity: '',
  transform: '',
  transition: '',
  animation: '',
  setProperty: vi.fn(),
  removeProperty: vi.fn(),
  getPropertyValue: vi.fn()
}

// Mock DOM element
const mockElement = {
  style: mockStyle,
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
    toggle: vi.fn()
  },
  getBoundingClientRect: vi.fn(),
  offsetWidth: 100,
  offsetHeight: 100,
  clientWidth: 100,
  clientHeight: 100,
  scrollWidth: 100,
  scrollHeight: 100,
  parentElement: null,
  children: [],
  appendChild: vi.fn(),
  removeChild: vi.fn()
}

// 控制台错误检测变量
let consoleSpy: any

describe('Animation Utils', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame)
    vi.stubGlobal('cancelAnimationFrame', mockCancelAnimationFrame)
    vi.stubGlobal('performance', mockPerformance)
    
    // Reset all mock functions
    mockRequestAnimationFrame.mockReset()
    mockCancelAnimationFrame.mockReset()
    mockPerformance.now.mockReset()
    
    Object.values(mockStyle).forEach(value => {
      if (typeof value === 'function') => {
        value.mockReset()
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    Object.values(mockElement.classList).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
    
    mockElement.getBoundingClientRect.mockReset()
    mockElement.appendChild.mockReset()
    mockElement.removeChild.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Basic Animations', () => {
    describe('fadeIn', () => {
      it('should fade in element', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        mockPerformance.now.mockReturnValue(0)
        
        const promise = animationUtils.fadeIn(mockElement, 1000)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('opacity', '0')
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transition', 'opacity 1000ms ease-in-out')
        
        vi.advanceTimersByTime(16)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('opacity', '1')
        
        await promise
        
        vi.useRealTimers()
      })

      it('should fade in with custom duration', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const promise = animationUtils.fadeIn(mockElement, 500)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transition', 'opacity 500ms ease-in-out')
        
        vi.advanceTimersByTime(16)
        
        await promise
        
        vi.useRealTimers()
      })

      it('should fade in with custom easing', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const promise = animationUtils.fadeIn(mockElement, 1000, 'linear')
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transition', 'opacity 1000ms linear')
        
        vi.advanceTimersByTime(16)
        
        await promise
        
        vi.useRealTimers()
      })
    })

    describe('fadeOut', () => {
      it('should fade out element', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        mockElement.style.getPropertyValue.mockReturnValue('1')
        
        const promise = animationUtils.fadeOut(mockElement, 1000)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('opacity', '1')
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transition', 'opacity 1000ms ease-in-out')
        
        vi.advanceTimersByTime(16)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('opacity', '0')
        
        await promise
        
        vi.useRealTimers()
      })
    })

    describe('slideIn', () => {
      it('should slide in element from left', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        mockElement.getBoundingClientRect.mockReturnValue({
          width: 100,
          height: 100,
          top: 0,
          left: 0,
          right: 100,
          bottom: 100,
          x: 0,
          y: 0,
          toJSON: vi.fn()
        })
        
        const promise = animationUtils.slideIn(mockElement, 'left', 1000)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'translateX(-100%)')
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transition', 'transform 1000ms ease-in-out')
        
        vi.advanceTimersByTime(16)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'translateX(0)')
        
        await promise
        
        vi.useRealTimers()
      })

      it('should slide in element from right', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const promise = animationUtils.slideIn(mockElement, 'right', 1000)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'translateX(100%)')
        
        vi.advanceTimersByTime(16)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'translateX(0)')
        
        await promise
        
        vi.useRealTimers()
      })

      it('should slide in element from top', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const promise = animationUtils.slideIn(mockElement, 'top', 1000)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'translateY(-100%)')
        
        vi.advanceTimersByTime(16)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'translateY(0)')
        
        await promise
        
        vi.useRealTimers()
      })

      it('should slide in element from bottom', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const promise = animationUtils.slideIn(mockElement, 'bottom', 1000)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'translateY(100%)')
        
        vi.advanceTimersByTime(16)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'translateY(0)')
        
        await promise
        
        vi.useRealTimers()
      })
    })

    describe('slideOut', () => {
      it('should slide out element to left', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const promise = animationUtils.slideOut(mockElement, 'left', 1000)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'translateX(0)')
        
        vi.advanceTimersByTime(16)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'translateX(-100%)')
        
        await promise
        
        vi.useRealTimers()
      })
    })

    describe('scaleIn', () => {
      it('should scale in element', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const promise = animationUtils.scaleIn(mockElement, 1000)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'scale(0)')
        
        vi.advanceTimersByTime(16)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'scale(1)')
        
        await promise
        
        vi.useRealTimers()
      })

      it('should scale in element with custom scale', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const promise = animationUtils.scaleIn(mockElement, 1000, 0.5)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'scale(0.5)')
        
        vi.advanceTimersByTime(16)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'scale(1)')
        
        await promise
        
        vi.useRealTimers()
      })
    })

    describe('scaleOut', () => {
      it('should scale out element', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        mockElement.style.getPropertyValue.mockReturnValue('scale(1)')
        
        const promise = animationUtils.scaleOut(mockElement, 1000)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'scale(1)')
        
        vi.advanceTimersByTime(16)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'scale(0)')
        
        await promise
        
        vi.useRealTimers()
      })
    })

    describe('rotate', () => {
      it('should rotate element', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const promise = animationUtils.rotate(mockElement, 90, 1000)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'rotate(0deg)')
        
        vi.advanceTimersByTime(16)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('transform', 'rotate(90deg)')
        
        await promise
        
        vi.useRealTimers()
      })
    })
  })

  describe('Animation Control', () => {
    describe('pauseAnimation', () => {
      it('should pause animation', () => {
        animationUtils.pauseAnimation(mockElement)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('animation-play-state', 'paused')
      })
    })

    describe('resumeAnimation', () => {
      it('should resume animation', () => {
        animationUtils.resumeAnimation(mockElement)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('animation-play-state', 'running')
      })
    })

    describe('stopAnimation', () => {
      it('should stop animation', () => {
        animationUtils.stopAnimation(mockElement)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('animation', 'none')
      })
    })

    describe('isAnimating', () => {
      it('should return true if element is animating', () => {
        mockElement.style.getPropertyValue.mockReturnValue('fade-in 1s ease-in-out')
        
        const result = animationUtils.isAnimating(mockElement)
        
        expect(result).toBe(true)
      })

      it('should return false if element is not animating', () => {
        mockElement.style.getPropertyValue.mockReturnValue('none')
        
        const result = animationUtils.isAnimating(mockElement)
        
        expect(result).toBe(false)
      })
    })
  })

  describe('Animation Classes', () => {
    describe('addAnimationClass', () => {
      it('should add animation class', () => {
        animationUtils.addAnimationClass(mockElement, 'fade-in')
        
        expect(mockElement.classList.add).toHaveBeenCalledWith('fade-in')
      })
    })

    describe('removeAnimationClass', () => {
      it('should remove animation class', () => {
        animationUtils.removeAnimationClass(mockElement, 'fade-in')
        
        expect(mockElement.classList.remove).toHaveBeenCalledWith('fade-in')
      })
    })

    describe('toggleAnimationClass', () => {
      it('should toggle animation class', () => {
        animationUtils.toggleAnimationClass(mockElement, 'fade-in')
        
        expect(mockElement.classList.toggle).toHaveBeenCalledWith('fade-in')
      })

      it('should toggle animation class with force', () => {
        animationUtils.toggleAnimationClass(mockElement, 'fade-in', true)
        
        expect(mockElement.classList.toggle).toHaveBeenCalledWith('fade-in', true)
      })
    })

    describe('hasAnimationClass', () => {
      it('should return true if element has animation class', () => {
        mockElement.classList.contains.mockReturnValue(true)
        
        const result = animationUtils.hasAnimationClass(mockElement, 'fade-in')
        
        expect(result).toBe(true)
      })

      it('should return false if element does not have animation class', () => {
        mockElement.classList.contains.mockReturnValue(false)
        
        const result = animationUtils.hasAnimationClass(mockElement, 'fade-in')
        
        expect(result).toBe(false)
      })
    })
  })

  describe('Animation Timing', () => {
    describe('setAnimationDuration', () => {
      it('should set animation duration', () => {
        animationUtils.setAnimationDuration(mockElement, 1000)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('animation-duration', '1000ms')
      })
    })

    describe('getAnimationDuration', () => {
      it('should get animation duration', () => {
        mockElement.style.getPropertyValue.mockReturnValue('1000ms')
        
        const result = animationUtils.getAnimationDuration(mockElement)
        
        expect(result).toBe(1000)
      })

      it('should return default duration if not set', () => {
        mockElement.style.getPropertyValue.mockReturnValue('')
        
        const result = animationUtils.getAnimationDuration(mockElement, 500)
        
        expect(result).toBe(500)
      })
    })

    describe('setAnimationDelay', () => {
      it('should set animation delay', () => {
        animationUtils.setAnimationDelay(mockElement, 500)
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('animation-delay', '500ms')
      })
    })

    describe('getAnimationDelay', () => {
      it('should get animation delay', () => {
        mockElement.style.getPropertyValue.mockReturnValue('500ms')
        
        const result = animationUtils.getAnimationDelay(mockElement)
        
        expect(result).toBe(500)
      })
    })

    describe('setAnimationTimingFunction', () => {
      it('should set animation timing function', () => {
        animationUtils.setAnimationTimingFunction(mockElement, 'ease-in-out')
        
        expect(mockElement.style.setProperty).toHaveBeenCalledWith('animation-timing-function', 'ease-in-out')
      })
    })

    describe('getAnimationTimingFunction', () => {
      it('should get animation timing function', () => {
        mockElement.style.getPropertyValue.mockReturnValue('ease-in-out')
        
        const result = animationUtils.getAnimationTimingFunction(mockElement)
        
        expect(result).toBe('ease-in-out')
      })
    })
  })

  describe('Animation Events', () => {
    describe('onAnimationStart', () => {
      it('should add animation start listener', () => {
        const callback = vi.fn()
        
        animationUtils.onAnimationStart(mockElement, callback)
        
        expect(mockElement.addEventListener).toHaveBeenCalledWith('animationstart', callback)
      })
    })

    describe('onAnimationEnd', () => {
      it('should add animation end listener', () => {
        const callback = vi.fn()
        
        animationUtils.onAnimationEnd(mockElement, callback)
        
        expect(mockElement.addEventListener).toHaveBeenCalledWith('animationend', callback)
      })
    })

    describe('onAnimationIteration', () => {
      it('should add animation iteration listener', () => {
        const callback = vi.fn()
        
        animationUtils.onAnimationIteration(mockElement, callback)
        
        expect(mockElement.addEventListener).toHaveBeenCalledWith('animationiteration', callback)
      })
    })

    describe('offAnimationStart', () => {
      it('should remove animation start listener', () => {
        const callback = vi.fn()
        
        animationUtils.offAnimationStart(mockElement, callback)
        
        expect(mockElement.removeEventListener).toHaveBeenCalledWith('animationstart', callback)
      })
    })

    describe('offAnimationEnd', () => {
      it('should remove animation end listener', () => {
        const callback = vi.fn()
        
        animationUtils.offAnimationEnd(mockElement, callback)
        
        expect(mockElement.removeEventListener).toHaveBeenCalledWith('animationend', callback)
      })
    })

    describe('offAnimationIteration', () => {
      it('should remove animation iteration listener', () => {
        const callback = vi.fn()
        
        animationUtils.offAnimationIteration(mockElement, callback)
        
        expect(mockElement.removeEventListener).toHaveBeenCalledWith('animationiteration', callback)
      })
    })
  })

  describe('Animation Utilities', () => {
    describe('waitForAnimation', () => {
      it('should wait for animation to complete', async () => {
        const callback = vi.fn()
        
        const promise = animationUtils.waitForAnimation(mockElement, callback)
        
        // Simulate animation end event
        const event = new Event('animationend')
        mockElement.addEventListener.mock.calls[0][1](event)
        
        await promise
        
        expect(callback).toHaveBeenCalledWith(event)
      })
    })

    describe('animate', () => {
      it('should create custom animation', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        mockPerformance.now.mockReturnValue(0)
        
        const keyframes = [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ]
        
        const options = {
          duration: 1000,
          easing: 'ease-in-out'
        }
        
        const promise = animationUtils.animate(mockElement, keyframes, options)
        
        vi.advanceTimersByTime(16)
        
        await promise
        
        vi.useRealTimers()
      })
    })

    describe('staggerAnimation', () => {
      it('should stagger animation of multiple elements', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const elements = [mockElement, { ...mockElement }, { ...mockElement }]
        
        const promise = animationUtils.staggerAnimation(elements, 'fadeIn', 100)
        
        vi.advanceTimersByTime(16)
        
        await promise
        
        vi.useRealTimers()
      })
    })

    describe('sequenceAnimation', () => {
      it('should sequence multiple animations', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const animations = [
          { element: mockElement, type: 'fadeIn', duration: 500 },
          { element: mockElement, type: 'slideIn', duration: 500, direction: 'left' }
        ]
        
        const promise = animationUtils.sequenceAnimation(animations)
        
        vi.advanceTimersByTime(16)
        
        await promise
        
        vi.useRealTimers()
      })
    })

    describe('parallelAnimation', () => {
      it('should run multiple animations in parallel', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const animations = [
          { element: mockElement, type: 'fadeIn', duration: 500 },
          { element: mockElement, type: 'slideIn', duration: 500, direction: 'left' }
        ]
        
        const promise = animationUtils.parallelAnimation(animations)
        
        vi.advanceTimersByTime(16)
        
        await promise
        
        vi.useRealTimers()
      })
    })

    describe('cancelAnimation', () => {
      it('should cancel animation', () => {
        const animationId = 123
        
        animationUtils.cancelAnimation(animationId)
        
        expect(mockCancelAnimationFrame).toHaveBeenCalledWith(animationId)
      })
    })

    describe('getAnimationState', () => {
      it('should get animation state', () => {
        mockElement.style.getPropertyValue.mockReturnValue('running')
        
        const result = animationUtils.getAnimationState(mockElement)
        
        expect(result).toBe('running')
      })

      it('should return idle if no animation state', () => {
        mockElement.style.getPropertyValue.mockReturnValue('')
        
        const result = animationUtils.getAnimationState(mockElement)
        
        expect(result).toBe('idle')
      })
    })
  })

  describe('Animation Presets', () => {
    describe('bounce', () => {
      it('should create bounce animation', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const promise = animationUtils.bounce(mockElement)
        
        vi.advanceTimersByTime(16)
        
        await promise
        
        vi.useRealTimers()
      })
    })

    describe('shake', () => {
      it('should create shake animation', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const promise = animationUtils.shake(mockElement)
        
        vi.advanceTimersByTime(16)
        
        await promise
        
        vi.useRealTimers()
      })
    })

    describe('pulse', () => {
      it('should create pulse animation', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const promise = animationUtils.pulse(mockElement)
        
        vi.advanceTimersByTime(16)
        
        await promise
        
        vi.useRealTimers()
      })
    })

    describe('flip', () => {
      it('should create flip animation', async () => {
        vi.useFakeTimers()
        
        mockRequestAnimationFrame.mockImplementation((callback) => {
          setTimeout(callback, 16)
        })
        
        const promise = animationUtils.flip(mockElement)
        
        vi.advanceTimersByTime(16)
        
        await promise
        
        vi.useRealTimers()
      })
    })
  })
})