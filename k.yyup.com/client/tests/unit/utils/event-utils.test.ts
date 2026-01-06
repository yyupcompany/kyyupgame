import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import * as eventUtils from '../../../src/utils/event-utils'

// Mock EventTarget
const mockEventTarget = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}

// Mock Event
class MockEvent {
  type: string
  bubbles: boolean
  cancelable: boolean
  defaultPrevented: boolean
  target: EventTarget | null
  currentTarget: EventTarget | null
  eventPhase: number
  timeStamp: number
  composed: boolean
  isTrusted: boolean

  constructor(type: string, eventInitDict?: EventInit) {
    this.type = type
    this.bubbles = eventInitDict?.bubbles ?? false
    this.cancelable = eventInitDict?.cancelable ?? false
    this.defaultPrevented = false
    this.target = null
    this.currentTarget = null
    this.eventPhase = 0
    this.timeStamp = Date.now()
    this.composed = eventInitDict?.composed ?? false
    this.isTrusted = false
  }

  preventDefault(): void {
    if (this.cancelable) {
      this.defaultPrevented = true
    }
  }

  stopPropagation(): void {
    // Mock implementation
  }

  stopImmediatePropagation(): void {
    // Mock implementation
  }

  composedPath(): EventTarget[] {
    return []
  }
}

// Mock CustomEvent
class MockCustomEvent extends MockEvent {
  detail: any

  constructor(type: string, eventInitDict?: CustomEventInit) {
    super(type, eventInitDict)
    this.detail = eventInitDict?.detail
  }
}

// Mock KeyboardEvent
class MockKeyboardEvent extends MockEvent {
  key: string
  code: string
  location: number
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  metaKey: boolean
  repeat: boolean
  isComposing: boolean
  charCode: number
  keyCode: number

  constructor(type: string, eventInitDict?: KeyboardEventInit) {
    super(type, eventInitDict)
    this.key = eventInitDict?.key || ''
    this.code = eventInitDict?.code || ''
    this.location = eventInitDict?.location || 0
    this.ctrlKey = eventInitDict?.ctrlKey || false
    this.shiftKey = eventInitDict?.shiftKey || false
    this.altKey = eventInitDict?.altKey || false
    this.metaKey = eventInitDict?.metaKey || false
    this.repeat = eventInitDict?.repeat || false
    this.isComposing = eventInitDict?.isComposing || false
    this.charCode = eventInitDict?.charCode || 0
    this.keyCode = eventInitDict?.keyCode || 0
  }
}

// Mock MouseEvent
class MockMouseEvent extends MockEvent {
  clientX: number
  clientY: number
  screenX: number
  screenY: number
  pageX: number
  pageY: number
  button: number
  buttons: number
  relatedTarget: EventTarget | null
  movementX: number
  movementY: number

  constructor(type: string, eventInitDict?: MouseEventInit) {
    super(type, eventInitDict)
    this.clientX = eventInitDict?.clientX || 0
    this.clientY = eventInitDict?.clientY || 0
    this.screenX = eventInitDict?.screenX || 0
    this.screenY = eventInitDict?.screenY || 0
    this.pageX = eventInitDict?.pageX || 0
    this.pageY = eventInitDict?.pageY || 0
    this.button = eventInitDict?.button || 0
    this.buttons = eventInitDict?.buttons || 0
    this.relatedTarget = eventInitDict?.relatedTarget || null
    this.movementX = 0
    this.movementY = 0
  }
}

// 控制台错误检测变量
let consoleSpy: any

describe('Event Utils', () => {
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
    vi.stubGlobal('Event', MockEvent)
    vi.stubGlobal('CustomEvent', MockCustomEvent)
    vi.stubGlobal('KeyboardEvent', MockKeyboardEvent)
    vi.stubGlobal('MouseEvent', MockMouseEvent)
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('document', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('addEventListener', () => {
    it('should add event listener to element', () => {
      const element = { ...mockEventTarget }
      const handler = vi.fn()
      
      eventUtils.addEventListener(element, 'click', handler)
      
      expect(element.addEventListener).toHaveBeenCalledWith('click', handler, undefined)
    })

    it('should add event listener with options', () => {
      const element = { ...mockEventTarget }
      const handler = vi.fn()
      const options = { capture: true, once: true }
      
      eventUtils.addEventListener(element, 'click', handler, options)
      
      expect(element.addEventListener).toHaveBeenCalledWith('click', handler, options)
    })

    it('should add event listener to window', () => {
      const handler = vi.fn()
      
      eventUtils.addEventListener(window, 'resize', handler)
      
      expect(window.addEventListener).toHaveBeenCalledWith('resize', handler, undefined)
    })

    it('should add event listener to document', () => {
      const handler = vi.fn()
      
      eventUtils.addEventListener(document, 'DOMContentLoaded', handler)
      
      expect(document.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', handler, undefined)
    })
  })

  describe('removeEventListener', () => {
    it('should remove event listener from element', () => {
      const element = { ...mockEventTarget }
      const handler = vi.fn()
      
      eventUtils.removeEventListener(element, 'click', handler)
      
      expect(element.removeEventListener).toHaveBeenCalledWith('click', handler, undefined)
    })

    it('should remove event listener with options', () => {
      const element = { ...mockEventTarget }
      const handler = vi.fn()
      const options = { capture: true }
      
      eventUtils.removeEventListener(element, 'click', handler, options)
      
      expect(element.removeEventListener).toHaveBeenCalledWith('click', handler, options)
    })

    it('should remove event listener from window', () => {
      const handler = vi.fn()
      
      eventUtils.removeEventListener(window, 'resize', handler)
      
      expect(window.removeEventListener).toHaveBeenCalledWith('resize', handler, undefined)
    })

    it('should remove event listener from document', () => {
      const handler = vi.fn()
      
      eventUtils.removeEventListener(document, 'DOMContentLoaded', handler)
      
      expect(document.removeEventListener).toHaveBeenCalledWith('DOMContentLoaded', handler, undefined)
    })
  })

  describe('dispatchEvent', () => {
    it('should dispatch event on element', () => {
      const element = { ...mockEventTarget }
      const event = new MockEvent('click')
      
      element.dispatchEvent.mockReturnValue(true)
      
      const result = eventUtils.dispatchEvent(element, event)
      
      expect(element.dispatchEvent).toHaveBeenCalledWith(event)
      expect(result).toBe(true)
    })

    it('should dispatch event on window', () => {
      const event = new MockEvent('resize')
      
      window.dispatchEvent.mockReturnValue(true)
      
      const result = eventUtils.dispatchEvent(window, event)
      
      expect(window.dispatchEvent).toHaveBeenCalledWith(event)
      expect(result).toBe(true)
    })

    it('should dispatch event on document', () => {
      const event = new MockEvent('DOMContentLoaded')
      
      document.dispatchEvent.mockReturnValue(true)
      
      const result = eventUtils.dispatchEvent(document, event)
      
      expect(document.dispatchEvent).toHaveBeenCalledWith(event)
      expect(result).toBe(true)
    })
  })

  describe('createEvent', () => {
    it('should create basic event', () => {
      const event = eventUtils.createEvent('click')
      
      expect(event).toBeInstanceOf(MockEvent)
      expect(event.type).toBe('click')
    })

    it('should create event with options', () => {
      const options = { bubbles: true, cancelable: true }
      const event = eventUtils.createEvent('click', options)
      
      expect(event).toBeInstanceOf(MockEvent)
      expect(event.type).toBe('click')
      expect(event.bubbles).toBe(true)
      expect(event.cancelable).toBe(true)
    })
  })

  describe('createCustomEvent', () => {
    it('should create custom event', () => {
      const detail = { message: 'test' }
      const event = eventUtils.createCustomEvent('custom', { detail })
      
      expect(event).toBeInstanceOf(MockCustomEvent)
      expect(event.type).toBe('custom')
      expect(event.detail).toEqual(detail)
    })

    it('should create custom event with options', () => {
      const options = {
        detail: { message: 'test' },
        bubbles: true,
        cancelable: true
      }
      const event = eventUtils.createCustomEvent('custom', options)
      
      expect(event).toBeInstanceOf(MockCustomEvent)
      expect(event.type).toBe('custom')
      expect(event.detail).toEqual({ message: 'test' })
      expect(event.bubbles).toBe(true)
      expect(event.cancelable).toBe(true)
    })
  })

  describe('createKeyboardEvent', () => {
    it('should create keyboard event', () => {
      const event = eventUtils.createKeyboardEvent('keydown', { key: 'Enter' })
      
      expect(event).toBeInstanceOf(MockKeyboardEvent)
      expect(event.type).toBe('keydown')
      expect(event.key).toBe('Enter')
    })

    it('should create keyboard event with options', () => {
      const options = {
        key: 'Enter',
        code: 'Enter',
        ctrlKey: true,
        shiftKey: false
      }
      const event = eventUtils.createKeyboardEvent('keydown', options)
      
      expect(event).toBeInstanceOf(MockKeyboardEvent)
      expect(event.type).toBe('keydown')
      expect(event.key).toBe('Enter')
      expect(event.code).toBe('Enter')
      expect(event.ctrlKey).toBe(true)
      expect(event.shiftKey).toBe(false)
    })
  })

  describe('createMouseEvent', () => {
    it('should create mouse event', () => {
      const event = eventUtils.createMouseEvent('click', { clientX: 100, clientY: 200 })
      
      expect(event).toBeInstanceOf(MockMouseEvent)
      expect(event.type).toBe('click')
      expect(event.clientX).toBe(100)
      expect(event.clientY).toBe(200)
    })

    it('should create mouse event with options', () => {
      const options = {
        clientX: 100,
        clientY: 200,
        button: 0,
        bubbles: true
      }
      const event = eventUtils.createMouseEvent('click', options)
      
      expect(event).toBeInstanceOf(MockMouseEvent)
      expect(event.type).toBe('click')
      expect(event.clientX).toBe(100)
      expect(event.clientY).toBe(200)
      expect(event.button).toBe(0)
      expect(event.bubbles).toBe(true)
    })
  })

  describe('preventDefault', () => {
    it('should prevent default behavior', () => {
      const event = new MockEvent('click', { cancelable: true })
      
      eventUtils.preventDefault(event)
      
      expect(event.defaultPrevented).toBe(true)
    })

    it('should not prevent default if event is not cancelable', () => {
      const event = new MockEvent('click', { cancelable: false })
      
      eventUtils.preventDefault(event)
      
      expect(event.defaultPrevented).toBe(false)
    })
  })

  describe('stopPropagation', () => {
    it('should stop event propagation', () => {
      const event = new MockEvent('click')
      const spy = vi.spyOn(event, 'stopPropagation')
      
      eventUtils.stopPropagation(event)
      
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('stopImmediatePropagation', () => {
    it('should stop immediate event propagation', () => {
      const event = new MockEvent('click')
      const spy = vi.spyOn(event, 'stopImmediatePropagation')
      
      eventUtils.stopImmediatePropagation(event)
      
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('once', () => {
    it('should add event listener that runs once', () => {
      const element = { ...mockEventTarget }
      const handler = vi.fn()
      
      eventUtils.once(element, 'click', handler)
      
      expect(element.addEventListener).toHaveBeenCalled()
      const callArg = element.addEventListener.mock.calls[0][1]
      
      // Simulate event
      callArg(new MockEvent('click'))
      
      expect(handler).toHaveBeenCalled()
      expect(element.removeEventListener).toHaveBeenCalled()
    })

    it('should handle once with options', () => {
      const element = { ...mockEventTarget }
      const handler = vi.fn()
      const options = { capture: true }
      
      eventUtils.once(element, 'click', handler, options)
      
      expect(element.addEventListener).toHaveBeenCalled()
    })
  })

  describe('on', () => {
    it('should add event listener with selector', () => {
      const element = { ...mockEventTarget }
      const handler = vi.fn()
      
      eventUtils.on(element, 'click', '.button', handler)
      
      expect(element.addEventListener).toHaveBeenCalled()
    })

    it('should add event listener without selector', () => {
      const element = { ...mockEventTarget }
      const handler = vi.fn()
      
      eventUtils.on(element, 'click', handler)
      
      expect(element.addEventListener).toHaveBeenCalledWith('click', handler, undefined)
    })
  })

  describe('off', () => {
    it('should remove event listener with selector', () => {
      const element = { ...mockEventTarget }
      const handler = vi.fn()
      
      eventUtils.off(element, 'click', '.button', handler)
      
      expect(element.removeEventListener).toHaveBeenCalled()
    })

    it('should remove event listener without selector', () => {
      const element = { ...mockEventTarget }
      const handler = vi.fn()
      
      eventUtils.off(element, 'click', handler)
      
      expect(element.removeEventListener).toHaveBeenCalledWith('click', handler, undefined)
    })
  })

  describe('delegate', () => {
    it('should delegate event to child elements', () => {
      const element = { ...mockEventTarget }
      const handler = vi.fn()
      
      eventUtils.delegate(element, 'click', '.button', handler)
      
      expect(element.addEventListener).toHaveBeenCalled()
    })
  })

  describe('trigger', () => {
    it('should trigger event on element', () => {
      const element = { ...mockEventTarget }
      
      eventUtils.trigger(element, 'click')
      
      expect(element.dispatchEvent).toHaveBeenCalled()
    })

    it('should trigger custom event with data', () => {
      const element = { ...mockEventTarget }
      const data = { message: 'test' }
      
      eventUtils.trigger(element, 'custom', data)
      
      expect(element.dispatchEvent).toHaveBeenCalled()
    })
  })

  describe('isEventTarget', () => {
    it('should return true for EventTarget', () => {
      const element = { ...mockEventTarget }
      
      const result = eventUtils.isEventTarget(element)
      
      expect(result).toBe(true)
    })

    it('should return true for window', () => {
      const result = eventUtils.isEventTarget(window)
      
      expect(result).toBe(true)
    })

    it('should return true for document', () => {
      const result = eventUtils.isEventTarget(document)
      
      expect(result).toBe(true)
    })

    it('should return false for non-EventTarget', () => {
      const result = eventUtils.isEventTarget({})
      
      expect(result).toBe(false)
    })
  })

  describe('getEventTarget', () => {
    it('should get event target', () => {
      const target = { ...mockEventTarget }
      const event = new MockEvent('click')
      ;(event as any).target = target
      
      const result = eventUtils.getEventTarget(event)
      
      expect(result).toBe(target)
    })

    it('should get current target if target is null', () => {
      const currentTarget = { ...mockEventTarget }
      const event = new MockEvent('click')
      ;(event as any).target = null
      ;(event as any).currentTarget = currentTarget
      
      const result = eventUtils.getEventTarget(event)
      
      expect(result).toBe(currentTarget)
    })
  })

  describe('getEventPath', () => {
    it('should get event path', () => {
      const event = new MockEvent('click')
      const path = [{}, {}, {}]
      
      vi.spyOn(event, 'composedPath').mockReturnValue(path)
      
      const result = eventUtils.getEventPath(event)
      
      expect(result).toBe(path)
    })
  })

  describe('isMouseEvent', () => {
    it('should return true for MouseEvent', () => {
      const event = new MockMouseEvent('click')
      
      const result = eventUtils.isMouseEvent(event)
      
      expect(result).toBe(true)
    })

    it('should return false for non-MouseEvent', () => {
      const event = new MockEvent('click')
      
      const result = eventUtils.isMouseEvent(event)
      
      expect(result).toBe(false)
    })
  })

  describe('isKeyboardEvent', () => {
    it('should return true for KeyboardEvent', () => {
      const event = new MockKeyboardEvent('keydown')
      
      const result = eventUtils.isKeyboardEvent(event)
      
      expect(result).toBe(true)
    })

    it('should return false for non-KeyboardEvent', () => {
      const event = new MockEvent('click')
      
      const result = eventUtils.isKeyboardEvent(event)
      
      expect(result).toBe(false)
    })
  })

  describe('isCustomEvent', () => {
    it('should return true for CustomEvent', () => {
      const event = new MockCustomEvent('custom')
      
      const result = eventUtils.isCustomEvent(event)
      
      expect(result).toBe(true)
    })

    it('should return false for non-CustomEvent', () => {
      const event = new MockEvent('click')
      
      const result = eventUtils.isCustomEvent(event)
      
      expect(result).toBe(false)
    })
  })

  describe('getMouseButton', () => {
    it('should get mouse button', () => {
      const event = new MockMouseEvent('click', { button: 1 })
      
      const result = eventUtils.getMouseButton(event)
      
      expect(result).toBe(1)
    })
  })

  describe('isLeftClick', () => {
    it('should return true for left click', () => {
      const event = new MockMouseEvent('click', { button: 0 })
      
      const result = eventUtils.isLeftClick(event)
      
      expect(result).toBe(true)
    })

    it('should return false for non-left click', () => {
      const event = new MockMouseEvent('click', { button: 1 })
      
      const result = eventUtils.isLeftClick(event)
      
      expect(result).toBe(false)
    })
  })

  describe('isRightClick', () => {
    it('should return true for right click', () => {
      const event = new MockMouseEvent('click', { button: 2 })
      
      const result = eventUtils.isRightClick(event)
      
      expect(result).toBe(true)
    })

    it('should return false for non-right click', () => {
      const event = new MockMouseEvent('click', { button: 0 })
      
      const result = eventUtils.isRightClick(event)
      
      expect(result).toBe(false)
    })
  })

  describe('isMiddleClick', () => {
    it('should return true for middle click', () => {
      const event = new MockMouseEvent('click', { button: 1 })
      
      const result = eventUtils.isMiddleClick(event)
      
      expect(result).toBe(true)
    })

    it('should return false for non-middle click', () => {
      const event = new MockMouseEvent('click', { button: 0 })
      
      const result = eventUtils.isMiddleClick(event)
      
      expect(result).toBe(false)
    })
  })

  describe('getKey', () => {
    it('should get key from keyboard event', () => {
      const event = new MockKeyboardEvent('keydown', { key: 'Enter' })
      
      const result = eventUtils.getKey(event)
      
      expect(result).toBe('Enter')
    })
  })

  describe('getCode', () => {
    it('should get code from keyboard event', () => {
      const event = new MockKeyboardEvent('keydown', { code: 'Enter' })
      
      const result = eventUtils.getCode(event)
      
      expect(result).toBe('Enter')
    })
  })

  describe('isModifierKey', () => {
    it('should return true for modifier key', () => {
      const event = new MockKeyboardEvent('keydown', { ctrlKey: true })
      
      const result = eventUtils.isModifierKey(event)
      
      expect(result).toBe(true)
    })

    it('should return false for non-modifier key', () => {
      const event = new MockKeyboardEvent('keydown', { ctrlKey: false })
      
      const result = eventUtils.isModifierKey(event)
      
      expect(result).toBe(false)
    })
  })

  describe('isEnterKey', () => {
    it('should return true for Enter key', () => {
      const event = new MockKeyboardEvent('keydown', { key: 'Enter' })
      
      const result = eventUtils.isEnterKey(event)
      
      expect(result).toBe(true)
    })

    it('should return false for non-Enter key', () => {
      const event = new MockKeyboardEvent('keydown', { key: 'Escape' })
      
      const result = eventUtils.isEnterKey(event)
      
      expect(result).toBe(false)
    })
  })

  describe('isEscapeKey', () => {
    it('should return true for Escape key', () => {
      const event = new MockKeyboardEvent('keydown', { key: 'Escape' })
      
      const result = eventUtils.isEscapeKey(event)
      
      expect(result).toBe(true)
    })

    it('should return false for non-Escape key', () => {
      const event = new MockKeyboardEvent('keydown', { key: 'Enter' })
      
      const result = eventUtils.isEscapeKey(event)
      
      expect(result).toBe(false)
    })
  })

  describe('isSpaceKey', () => {
    it('should return true for Space key', () => {
      const event = new MockKeyboardEvent('keydown', { key: ' ' })
      
      const result = eventUtils.isSpaceKey(event)
      
      expect(result).toBe(true)
    })

    it('should return false for non-Space key', () => {
      const event = new MockKeyboardEvent('keydown', { key: 'Enter' })
      
      const result = eventUtils.isSpaceKey(event)
      
      expect(result).toBe(false)
    })
  })

  describe('isTabKey', () => {
    it('should return true for Tab key', () => {
      const event = new MockKeyboardEvent('keydown', { key: 'Tab' })
      
      const result = eventUtils.isTabKey(event)
      
      expect(result).toBe(true)
    })

    it('should return false for non-Tab key', () => {
      const event = new MockKeyboardEvent('keydown', { key: 'Enter' })
      
      const result = eventUtils.isTabKey(event)
      
      expect(result).toBe(false)
    })
  })

  describe('isArrowKey', () => {
    it('should return true for arrow keys', () => {
      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      
      arrowKeys.forEach(key => {
        const event = new MockKeyboardEvent('keydown', { key })
        const result = eventUtils.isArrowKey(event)
        expect(result).toBe(true)
      })
    })

    it('should return false for non-arrow keys', () => {
      const event = new MockKeyboardEvent('keydown', { key: 'Enter' })
      
      const result = eventUtils.isArrowKey(event)
      
      expect(result).toBe(false)
    })
  })

  describe('getMousePosition', () => {
    it('should get mouse position', () => {
      const event = new MockMouseEvent('click', { clientX: 100, clientY: 200 })
      
      const result = eventUtils.getMousePosition(event)
      
      expect(result).toEqual({ x: 100, y: 200 })
    })
  })

  describe('getMouseScreenPosition', () => {
    it('should get mouse screen position', () => {
      const event = new MockMouseEvent('click', { screenX: 100, screenY: 200 })
      
      const result = eventUtils.getMouseScreenPosition(event)
      
      expect(result).toEqual({ x: 100, y: 200 })
    })
  })

  describe('getMousePagePosition', () => {
    it('should get mouse page position', () => {
      const event = new MockMouseEvent('click', { pageX: 100, pageY: 200 })
      
      const result = eventUtils.getMousePagePosition(event)
      
      expect(result).toEqual({ x: 100, y: 200 })
    })
  })
})