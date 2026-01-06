
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) => {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import * as domUtils from '../../../src/utils/dom-utils'

// Mock DOM elements
const mockElement = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  insertBefore: vi.fn(),
  replaceChild: vi.fn(),
  cloneNode: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(),
  getAttribute: vi.fn(),
  setAttribute: vi.fn(),
  removeAttribute: vi.fn(),
  hasAttribute: vi.fn(),
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
    toggle: vi.fn(),
    replace: vi.fn()
  },
  style: {
    setProperty: vi.fn(),
    removeProperty: vi.fn(),
    getPropertyValue: vi.fn()
  },
  getBoundingClientRect: vi.fn(),
  offsetTop: 100,
  offsetLeft: 200,
  offsetWidth: 300,
  offsetHeight: 400,
  scrollTop: 0,
  scrollLeft: 0,
  scrollWidth: 500,
  scrollHeight: 600,
  clientWidth: 300,
  clientHeight: 400,
  parentElement: null,
  children: [],
  firstChild: null,
  lastChild: null,
  nextSibling: null,
  previousSibling: null,
  nodeName: 'DIV',
  nodeType: 1,
  textContent: 'test content',
  innerHTML: '<span>test</span>',
  outerHTML: '<div><span>test</span></div>',
  id: 'test-id',
  className: 'test-class',
  tagName: 'DIV',
  getElementsByClassName: vi.fn(),
  getElementsByTagName: vi.fn(),
  focus: vi.fn(),
  blur: vi.fn(),
  click: vi.fn(),
  dispatchEvent: vi.fn()
}

const mockDocument = {
  createElement: vi.fn(),
  createTextNode: vi.fn(),
  createDocumentFragment: vi.fn(),
  getElementById: vi.fn(),
  getElementsByClassName: vi.fn(),
  getElementsByTagName: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(),
  createEvent: vi.fn(),
  createRange: vi.fn(),
  body: mockElement,
  documentElement: mockElement,
  activeElement: null,
  defaultView: {
    getComputedStyle: vi.fn(),
    getSelection: vi.fn()
  }
}

// 控制台错误检测变量
let consoleSpy: any

describe('DOM Utils', () => {
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
    vi.stubGlobal('document', mockDocument)
    vi.stubGlobal('window', {
      innerWidth: 1024,
      innerHeight: 768,
      outerWidth: 1024,
      outerHeight: 768,
      screenX: 0,
      screenY: 0,
      screen: {
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1080,
        colorDepth: 24,
        pixelDepth: 24
      },
      devicePixelRatio: 1,
      pageXOffset: 0,
      pageYOffset: 0,
      scrollX: 0,
      scrollY: 0,
      getComputedStyle: vi.fn(),
      scrollTo: vi.fn(),
      scroll: vi.fn(),
      scrollBy: vi.fn(),
      focus: vi.fn(),
      blur: vi.fn(),
      open: vi.fn(),
      close: vi.fn(),
      print: vi.fn(),
      stop: vi.fn(),
      alert: vi.fn(),
      confirm: vi.fn(),
      prompt: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      setInterval: vi.fn(),
      clearInterval: vi.fn(),
      requestAnimationFrame: vi.fn(),
      cancelAnimationFrame: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Reset all mock functions
    Object.values(mockElement).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
    
    Object.values(mockDocument).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('createElement', () => {
    it('should create element with tag name', () => {
      mockDocument.createElement.mockReturnValue(mockElement)
      
      const element = domUtils.createElement('div')
      
      expect(mockDocument.createElement).toHaveBeenCalledWith('div')
      expect(element).toBe(mockElement)
    })

    it('should create element with attributes', () => {
      mockDocument.createElement.mockReturnValue(mockElement)
      
      const attributes = { id: 'test', class: 'test-class' }
      const element = domUtils.createElement('div', attributes)
      
      expect(mockDocument.createElement).toHaveBeenCalledWith('div')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('id', 'test')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('class', 'test-class')
    })

    it('should create element with children', () => {
      mockDocument.createElement.mockReturnValue(mockElement)
      const childElement = { ...mockElement }
      
      const element = domUtils.createElement('div', {}, [childElement])
      
      expect(mockElement.appendChild).toHaveBeenCalledWith(childElement)
    })

    it('should handle text content', () => {
      mockDocument.createElement.mockReturnValue(mockElement)
      
      const element = domUtils.createElement('div', {}, 'test content')
      
      expect(mockElement.textContent).toBe('test content')
    })
  })

  describe('getElementById', () => {
    it('should get element by id', () => {
      mockDocument.getElementById.mockReturnValue(mockElement)
      
      const element = domUtils.getElementById('test-id')
      
      expect(mockDocument.getElementById).toHaveBeenCalledWith('test-id')
      expect(element).toBe(mockElement)
    })

    it('should return null if element not found', () => {
      mockDocument.getElementById.mockReturnValue(null)
      
      const element = domUtils.getElementById('non-existent')
      
      expect(element).toBeNull()
    })
  })

  describe('querySelector', () => {
    it('should query element by selector', () => {
      mockDocument.querySelector.mockReturnValue(mockElement)
      
      const element = domUtils.querySelector('.test-class')
      
      expect(mockDocument.querySelector).toHaveBeenCalledWith('.test-class')
      expect(element).toBe(mockElement)
    })

    it('should return null if no element matches', () => {
      mockDocument.querySelector.mockReturnValue(null)
      
      const element = domUtils.querySelector('.non-existent')
      
      expect(element).toBeNull()
    })
  })

  describe('querySelectorAll', () => {
    it('should query all elements by selector', () => {
      const elements = [mockElement, { ...mockElement }]
      mockDocument.querySelectorAll.mockReturnValue(elements)
      
      const result = domUtils.querySelectorAll('.test-class')
      
      expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('.test-class')
      expect(result).toEqual(elements)
    })

    it('should return empty array if no elements match', () => {
      mockDocument.querySelectorAll.mockReturnValue([])
      
      const result = domUtils.querySelectorAll('.non-existent')
      
      expect(result).toEqual([])
    })
  })

  describe('addClass', () => {
    it('should add class to element', () => {
      domUtils.addClass(mockElement, 'test-class')
      
      expect(mockElement.classList.add).toHaveBeenCalledWith('test-class')
    })

    it('should add multiple classes', () => {
      domUtils.addClass(mockElement, ['class1', 'class2'])
      
      expect(mockElement.classList.add).toHaveBeenCalledWith('class1', 'class2')
    })
  })

  describe('removeClass', () => {
    it('should remove class from element', () => {
      domUtils.removeClass(mockElement, 'test-class')
      
      expect(mockElement.classList.remove).toHaveBeenCalledWith('test-class')
    })

    it('should remove multiple classes', () => {
      domUtils.removeClass(mockElement, ['class1', 'class2'])
      
      expect(mockElement.classList.remove).toHaveBeenCalledWith('class1', 'class2')
    })
  })

  describe('hasClass', () => {
    it('should return true if element has class', () => {
      mockElement.classList.contains.mockReturnValue(true)
      
      const result = domUtils.hasClass(mockElement, 'test-class')
      
      expect(mockElement.classList.contains).toHaveBeenCalledWith('test-class')
      expect(result).toBe(true)
    })

    it('should return false if element does not have class', () => {
      mockElement.classList.contains.mockReturnValue(false)
      
      const result = domUtils.hasClass(mockElement, 'test-class')
      
      expect(result).toBe(false)
    })
  })

  describe('toggleClass', () => {
    it('should toggle class on element', () => {
      domUtils.toggleClass(mockElement, 'test-class')
      
      expect(mockElement.classList.toggle).toHaveBeenCalledWith('test-class')
    })

    it('should toggle class with force parameter', () => {
      domUtils.toggleClass(mockElement, 'test-class', true)
      
      expect(mockElement.classList.toggle).toHaveBeenCalledWith('test-class', true)
    })
  })

  describe('setAttribute', () => {
    it('should set attribute on element', () => {
      domUtils.setAttribute(mockElement, 'data-test', 'value')
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('data-test', 'value')
    })

    it('should handle boolean attributes', () => {
      domUtils.setAttribute(mockElement, 'disabled', true)
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('disabled', '')
    })

    it('should remove attribute if value is null', () => {
      domUtils.setAttribute(mockElement, 'data-test', null)
      
      expect(mockElement.removeAttribute).toHaveBeenCalledWith('data-test')
    })
  })

  describe('getAttribute', () => {
    it('should get attribute from element', () => {
      mockElement.getAttribute.mockReturnValue('value')
      
      const result = domUtils.getAttribute(mockElement, 'data-test')
      
      expect(mockElement.getAttribute).toHaveBeenCalledWith('data-test')
      expect(result).toBe('value')
    })

    it('should return null if attribute does not exist', () => {
      mockElement.getAttribute.mockReturnValue(null)
      
      const result = domUtils.getAttribute(mockElement, 'non-existent')
      
      expect(result).toBeNull()
    })
  })

  describe('removeAttribute', () => {
    it('should remove attribute from element', () => {
      domUtils.removeAttribute(mockElement, 'data-test')
      
      expect(mockElement.removeAttribute).toHaveBeenCalledWith('data-test')
    })
  })

  describe('getStyle', () => {
    it('should get computed style', () => {
      const mockComputedStyle = {
        getPropertyValue: vi.fn().mockReturnValue('10px')
      }
      
      ;(window.getComputedStyle as any).mockReturnValue(mockComputedStyle)
      
      const result = domUtils.getStyle(mockElement, 'width')
      
      expect(window.getComputedStyle).toHaveBeenCalledWith(mockElement)
      expect(mockComputedStyle.getPropertyValue).toHaveBeenCalledWith('width')
      expect(result).toBe('10px')
    })
  })

  describe('setStyle', () => {
    it('should set style property', () => {
      domUtils.setStyle(mockElement, 'width', '100px')
      
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('width', '100px')
    })

    it('should set multiple style properties', () => {
      const styles = {
        width: '100px',
        height: '200px',
        color: 'red'
      }
      
      domUtils.setStyle(mockElement, styles)
      
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('width', '100px')
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('height', '200px')
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('color', 'red')
    })
  })

  describe('removeStyle', () => {
    it('should remove style property', () => {
      domUtils.removeStyle(mockElement, 'width')
      
      expect(mockElement.style.removeProperty).toHaveBeenCalledWith('width')
    })
  })

  describe('append', () => {
    it('should append child to parent', () => {
      const childElement = { ...mockElement }
      
      domUtils.append(mockElement, childElement)
      
      expect(mockElement.appendChild).toHaveBeenCalledWith(childElement)
    })

    it('should append multiple children', () => {
      const children = [{ ...mockElement }, { ...mockElement }]
      
      domUtils.append(mockElement, children)
      
      expect(mockElement.appendChild).toHaveBeenCalledTimes(2)
    })
  })

  describe('prepend', () => {
    it('should prepend child to parent', () => {
      const childElement = { ...mockElement }
      const firstChild = { ...mockElement }
      
      mockElement.firstChild = firstChild
      
      domUtils.prepend(mockElement, childElement)
      
      expect(mockElement.insertBefore).toHaveBeenCalledWith(childElement, firstChild)
    })

    it('should append if no first child', () => {
      const childElement = { ...mockElement }
      
      mockElement.firstChild = null
      
      domUtils.prepend(mockElement, childElement)
      
      expect(mockElement.appendChild).toHaveBeenCalledWith(childElement)
    })
  })

  describe('remove', () => {
    it('should remove element from parent', () => {
      const parentElement = { ...mockElement }
      
      mockElement.parentElement = parentElement
      
      domUtils.remove(mockElement)
      
      expect(parentElement.removeChild).toHaveBeenCalledWith(mockElement)
    })

    it('should handle element without parent', () => {
      mockElement.parentElement = null
      
      expect(() => domUtils.remove(mockElement)).not.toThrow()
    })
  })

  describe('empty', () => {
    it('should remove all children from element', () => {
      const children = [{ ...mockElement }, { ...mockElement }]
      
      mockElement.childNodes = children
      
      domUtils.empty(mockElement)
      
      expect(mockElement.removeChild).toHaveBeenCalledTimes(2)
    })

    it('should handle element without children', () => {
      mockElement.childNodes = []
      
      domUtils.empty(mockElement)
      
      expect(mockElement.removeChild).not.toHaveBeenCalled()
    })
  })

  describe('clone', () => {
    it('should clone element', () => {
      const clonedElement = { ...mockElement }
      
      mockElement.cloneNode.mockReturnValue(clonedElement)
      
      const result = domUtils.clone(mockElement)
      
      expect(mockElement.cloneNode).toHaveBeenCalledWith(false)
      expect(result).toBe(clonedElement)
    })

    it('should clone element with children', () => {
      const clonedElement = { ...mockElement }
      
      mockElement.cloneNode.mockReturnValue(clonedElement)
      
      const result = domUtils.clone(mockElement, true)
      
      expect(mockElement.cloneNode).toHaveBeenCalledWith(true)
      expect(result).toBe(clonedElement)
    })
  })

  describe('isVisible', () => {
    it('should return true if element is visible', () => {
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
      
      const mockComputedStyle = {
        getPropertyValue: vi.fn().mockReturnValue('block')
      }
      
      ;(window.getComputedStyle as any).mockReturnValue(mockComputedStyle)
      
      const result = domUtils.isVisible(mockElement)
      
      expect(result).toBe(true)
    })

    it('should return false if element is hidden', () => {
      mockElement.getBoundingClientRect.mockReturnValue({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
        toJSON: vi.fn()
      })
      
      const mockComputedStyle = {
        getPropertyValue: vi.fn().mockReturnValue('none')
      }
      
      ;(window.getComputedStyle as any).mockReturnValue(mockComputedStyle)
      
      const result = domUtils.isVisible(mockElement)
      
      expect(result).toBe(false)
    })
  })

  describe('isInViewport', () => {
    it('should return true if element is in viewport', () => {
      mockElement.getBoundingClientRect.mockReturnValue({
        width: 100,
        height: 100,
        top: 50,
        left: 50,
        right: 150,
        bottom: 150,
        x: 50,
        y: 50,
        toJSON: vi.fn()
      })
      
      const result = domUtils.isInViewport(mockElement)
      
      expect(result).toBe(true)
    })

    it('should return false if element is outside viewport', () => {
      mockElement.getBoundingClientRect.mockReturnValue({
        width: 100,
        height: 100,
        top: -200,
        left: 50,
        right: 150,
        bottom: -100,
        x: 50,
        y: -200,
        toJSON: vi.fn()
      })
      
      const result = domUtils.isInViewport(mockElement)
      
      expect(result).toBe(false)
    })
  })

  describe('scrollTo', () => {
    it('should scroll to element', () => {
      mockElement.getBoundingClientRect.mockReturnValue({
        width: 100,
        height: 100,
        top: 100,
        left: 100,
        right: 200,
        bottom: 200,
        x: 100,
        y: 100,
        toJSON: vi.fn()
      })
      
      domUtils.scrollTo(mockElement)
      
      expect(window.scrollTo).toHaveBeenCalledWith(100, 100)
    })

    it('should scroll with offset', () => {
      mockElement.getBoundingClientRect.mockReturnValue({
        width: 100,
        height: 100,
        top: 100,
        left: 100,
        right: 200,
        bottom: 200,
        x: 100,
        y: 100,
        toJSON: vi.fn()
      })
      
      domUtils.scrollTo(mockElement, 20, 30)
      
      expect(window.scrollTo).toHaveBeenCalledWith(120, 130)
    })
  })

  describe('focus', () => {
    it('should focus element', () => {
      domUtils.focus(mockElement)
      
      expect(mockElement.focus).toHaveBeenCalled()
    })
  })

  describe('blur', () => {
    it('should blur element', () => {
      domUtils.blur(mockElement)
      
      expect(mockElement.blur).toHaveBeenCalled()
    })
  })

  describe('click', () => {
    it('should click element', () => {
      domUtils.click(mockElement)
      
      expect(mockElement.click).toHaveBeenCalled()
    })
  })

  describe('addEventListener', () => {
    it('should add event listener to element', () => {
      const handler = vi.fn()
      
      domUtils.addEventListener(mockElement, 'click', handler)
      
      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', handler)
    })

    it('should add event listener with options', () => {
      const handler = vi.fn()
      const options = { capture: true, once: true }
      
      domUtils.addEventListener(mockElement, 'click', handler, options)
      
      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', handler, options)
    })
  })

  describe('removeEventListener', () => {
    it('should remove event listener from element', () => {
      const handler = vi.fn()
      
      domUtils.removeEventListener(mockElement, 'click', handler)
      
      expect(mockElement.removeEventListener).toHaveBeenCalledWith('click', handler)
    })

    it('should remove event listener with options', () => {
      const handler = vi.fn()
      const options = { capture: true }
      
      domUtils.removeEventListener(mockElement, 'click', handler, options)
      
      expect(mockElement.removeEventListener).toHaveBeenCalledWith('click', handler, options)
    })
  })

  describe('dispatchEvent', () => {
    it('should dispatch event on element', () => {
      const mockEvent = new Event('click')
      
      mockElement.dispatchEvent.mockReturnValue(true)
      
      const result = domUtils.dispatchEvent(mockElement, mockEvent)
      
      expect(mockElement.dispatchEvent).toHaveBeenCalledWith(mockEvent)
      expect(result).toBe(true)
    })
  })

  describe('getOffset', () => {
    it('should get element offset', () => {
      const result = domUtils.getOffset(mockElement)
      
      expect(result).toEqual({
        top: 100,
        left: 200
      })
    })
  })

  describe('getPosition', () => {
    it('should get element position', () => {
      mockElement.getBoundingClientRect.mockReturnValue({
        width: 100,
        height: 100,
        top: 100,
        left: 100,
        right: 200,
        bottom: 200,
        x: 100,
        y: 100,
        toJSON: vi.fn()
      })
      
      const result = domUtils.getPosition(mockElement)
      
      expect(result).toEqual({
        top: 100,
        left: 100,
        right: 200,
        bottom: 200,
        width: 100,
        height: 100
      })
    })
  })

  describe('getSize', () => {
    it('should get element size', () => {
      const result = domUtils.getSize(mockElement)
      
      expect(result).toEqual({
        width: 300,
        height: 400
      })
    })
  })

  describe('getScrollSize', () => {
    it('should get element scroll size', () => {
      const result = domUtils.getScrollSize(mockElement)
      
      expect(result).toEqual({
        width: 500,
        height: 600
      })
    })
  })

  describe('getClientSize', () => {
    it('should get element client size', () => {
      const result = domUtils.getClientSize(mockElement)
      
      expect(result).toEqual({
        width: 300,
        height: 400
      })
    })
  })

  describe('getScrollPosition', () => {
    it('should get element scroll position', () => {
      const result = domUtils.getScrollPosition(mockElement)
      
      expect(result).toEqual({
        top: 0,
        left: 0
      })
    })
  })

  describe('setScrollPosition', () => {
    it('should set element scroll position', () => {
      domUtils.setScrollPosition(mockElement, 100, 200)
      
      expect(mockElement.scrollTop).toBe(100)
      expect(mockElement.scrollLeft).toBe(200)
    })
  })

  describe('isScrollable', () => {
    it('should return true if element is scrollable', () => {
      mockElement.scrollHeight = 800
      mockElement.clientHeight = 400
      
      const result = domUtils.isScrollable(mockElement)
      
      expect(result).toBe(true)
    })

    it('should return false if element is not scrollable', () => {
      mockElement.scrollHeight = 400
      mockElement.clientHeight = 400
      
      const result = domUtils.isScrollable(mockElement)
      
      expect(result).toBe(false)
    })
  })

  describe('scrollToTop', () => {
    it('should scroll element to top', () => {
      domUtils.scrollToTop(mockElement)
      
      expect(mockElement.scrollTop).toBe(0)
    })
  })

  describe('scrollToBottom', () => {
    it('should scroll element to bottom', () => {
      mockElement.scrollHeight = 800
      mockElement.clientHeight = 400
      
      domUtils.scrollToBottom(mockElement)
      
      expect(mockElement.scrollTop).toBe(400)
    })
  })

  describe('getParent', () => {
    it('should get parent element', () => {
      const parentElement = { ...mockElement }
      mockElement.parentElement = parentElement
      
      const result = domUtils.getParent(mockElement)
      
      expect(result).toBe(parentElement)
    })

    it('should return null if no parent', () => {
      mockElement.parentElement = null
      
      const result = domUtils.getParent(mockElement)
      
      expect(result).toBeNull()
    })
  })

  describe('getChildren', () => {
    it('should get children elements', () => {
      const children = [{ ...mockElement }, { ...mockElement }]
      mockElement.children = children
      
      const result = domUtils.getChildren(mockElement)
      
      expect(result).toEqual(children)
    })

    it('should return empty array if no children', () => {
      mockElement.children = []
      
      const result = domUtils.getChildren(mockElement)
      
      expect(result).toEqual([])
    })
  })

  describe('getSiblings', () => {
    it('should get sibling elements', () => {
      const parentElement = { ...mockElement }
      const siblings = [{ ...mockElement }, { ...mockElement }]
      
      mockElement.parentElement = parentElement
      mockElement.children = siblings
      
      const result = domUtils.getSiblings(mockElement)
      
      expect(result).toEqual(siblings)
    })

    it('should return empty array if no siblings', () => {
      mockElement.parentElement = null
      
      const result = domUtils.getSiblings(mockElement)
      
      expect(result).toEqual([])
    })
  })

  describe('getNextSibling', () => {
    it('should get next sibling', () => {
      const nextSibling = { ...mockElement }
      mockElement.nextSibling = nextSibling
      
      const result = domUtils.getNextSibling(mockElement)
      
      expect(result).toBe(nextSibling)
    })

    it('should return null if no next sibling', () => {
      mockElement.nextSibling = null
      
      const result = domUtils.getNextSibling(mockElement)
      
      expect(result).toBeNull()
    })
  })

  describe('getPreviousSibling', () => {
    it('should get previous sibling', () => {
      const previousSibling = { ...mockElement }
      mockElement.previousSibling = previousSibling
      
      const result = domUtils.getPreviousSibling(mockElement)
      
      expect(result).toBe(previousSibling)
    })

    it('should return null if no previous sibling', () => {
      mockElement.previousSibling = null
      
      const result = domUtils.getPreviousSibling(mockElement)
      
      expect(result).toBeNull()
    })
  })

  describe('insertBefore', () => {
    it('should insert element before reference', () => {
      const newElement = { ...mockElement }
      const referenceElement = { ...mockElement }
      
      domUtils.insertBefore(mockElement, newElement, referenceElement)
      
      expect(mockElement.insertBefore).toHaveBeenCalledWith(newElement, referenceElement)
    })
  })

  describe('insertAfter', () => {
    it('should insert element after reference', () => {
      const newElement = { ...mockElement }
      const referenceElement = { ...mockElement }
      const nextSibling = { ...mockElement }
      
      referenceElement.nextSibling = nextSibling
      
      domUtils.insertAfter(mockElement, newElement, referenceElement)
      
      expect(mockElement.insertBefore).toHaveBeenCalledWith(newElement, nextSibling)
    })

    it('should append if no next sibling', () => {
      const newElement = { ...mockElement }
      const referenceElement = { ...mockElement }
      
      referenceElement.nextSibling = null
      
      domUtils.insertAfter(mockElement, newElement, referenceElement)
      
      expect(mockElement.appendChild).toHaveBeenCalledWith(newElement)
    })
  })

  describe('replace', () => {
    it('should replace old element with new element', () => {
      const newElement = { ...mockElement }
      const oldElement = { ...mockElement }
      
      domUtils.replace(mockElement, newElement, oldElement)
      
      expect(mockElement.replaceChild).toHaveBeenCalledWith(newElement, oldElement)
    })
  })

  describe('wrap', () => {
    it('should wrap element with wrapper', () => {
      const wrapperElement = { ...mockElement }
      
      mockElement.parentElement = wrapperElement
      
      domUtils.wrap(mockElement, wrapperElement)
      
      expect(wrapperElement.appendChild).toHaveBeenCalledWith(mockElement)
    })
  })

  describe('unwrap', () => {
    it('should unwrap element from parent', () => {
      const parentElement = { ...mockElement }
      const grandParentElement = { ...mockElement }
      
      mockElement.parentElement = parentElement
      parentElement.parentElement = grandParentElement
      
      domUtils.unwrap(mockElement)
      
      expect(grandParentElement.replaceChild).toHaveBeenCalled()
    })
  })
})