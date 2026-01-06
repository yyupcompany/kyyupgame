import { vi } from 'vitest'

/**
 * DOM API Mock系统
 * 解决测试环境中的DOM API兼容性问题
 */

/**
 * Mock MutationObserver
 */
export class MockMutationObserver {
  private callback: MutationCallback
  private isObserving = false
  
  constructor(callback: MutationCallback) {
    this.callback = callback
  }
  
  observe(target: Node, options?: MutationObserverInit) {
    this.isObserving = true
    console.log('🔍 MutationObserver.observe called')
  }
  
  disconnect() {
    this.isObserving = false
    console.log('🔍 MutationObserver.disconnect called')
  }
  
  takeRecords(): MutationRecord[] {
    return []
  }
}

/**
 * Mock ResizeObserver
 */
export class MockResizeObserver {
  private callback: ResizeObserverCallback
  private isObserving = false
  
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  
  observe(target: Element, options?: ResizeObserverOptions) {
    this.isObserving = true
    console.log('📏 ResizeObserver.observe called')
  }
  
  unobserve(target: Element) {
    console.log('📏 ResizeObserver.unobserve called')
  }
  
  disconnect() {
    this.isObserving = false
    console.log('📏 ResizeObserver.disconnect called')
  }
}

/**
 * Mock IntersectionObserver
 */
export class MockIntersectionObserver {
  private callback: IntersectionObserverCallback
  private isObserving = false
  
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
  }
  
  observe(target: Element) {
    this.isObserving = true
    console.log('👁️ IntersectionObserver.observe called')
  }
  
  unobserve(target: Element) {
    console.log('👁️ IntersectionObserver.unobserve called')
  }
  
  disconnect() {
    this.isObserving = false
    console.log('👁️ IntersectionObserver.disconnect called')
  }
  
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

/**
 * Mock PerformanceObserver
 */
export class MockPerformanceObserver {
  private callback: PerformanceObserverCallback
  
  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback
  }
  
  observe(options: PerformanceObserverInit) {
    console.log('⚡ PerformanceObserver.observe called')
  }
  
  disconnect() {
    console.log('⚡ PerformanceObserver.disconnect called')
  }
  
  takeRecords(): PerformanceEntryList {
    return []
  }
}

/**
 * Mock AsyncTaskManager相关API
 */
export class MockAsyncTaskManager {
  private tasks = new Set<string>()
  private isAborted = false
  
  startTask(taskId?: string): string {
    if (this.isAborted) {
      console.log('⚠️ AsyncTaskManager已中止，但在测试环境中继续执行')
      // 在测试环境中不抛出错误，而是返回一个mock任务ID
      const id = taskId || `mock-task-${Date.now()}`
      this.tasks.add(id)
      return id
    }
    
    const id = taskId || `task-${Date.now()}`
    this.tasks.add(id)
    console.log(`🚀 AsyncTaskManager.startTask: ${id}`)
    return id
  }
  
  endTask(taskId: string) {
    this.tasks.delete(taskId)
    console.log(`✅ AsyncTaskManager.endTask: ${taskId}`)
  }
  
  abort() {
    this.isAborted = true
    this.tasks.clear()
    console.log('🛑 AsyncTaskManager.abort called')
  }
  
  reset() {
    this.isAborted = false
    this.tasks.clear()
    console.log('🔄 AsyncTaskManager.reset called')
  }
}

/**
 * Mock XMLHttpRequest
 */
export class MockXMLHttpRequest {
  public readyState = 0
  public status = 200
  public statusText = 'OK'
  public responseText = ''
  public response = ''
  public responseType: XMLHttpRequestResponseType = ''
  public timeout = 0
  public withCredentials = false
  
  private _url = ''
  private _method = ''
  private _headers: Record<string, string> = {}
  
  // 事件处理器
  public onreadystatechange: ((this: XMLHttpRequest, ev: Event) => any) | null = null
  public onload: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null
  public onerror: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null
  public onabort: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null
  public ontimeout: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null
  
  open(method: string, url: string, async?: boolean, user?: string | null, password?: string | null) {
    this._method = method
    this._url = url
    this.readyState = 1
    console.log(`🌐 XMLHttpRequest.open: ${method} ${url}`)
  }
  
  send(body?: Document | XMLHttpRequestBodyInit | null) {
    this.readyState = 4
    this.status = 200
    this.statusText = 'OK'
    this.responseText = JSON.stringify({ success: true, data: null })
    this.response = this.responseText
    
    // 异步触发事件
    setTimeout(() => {
      if (this.onload) {
        this.onload.call(this as any, new ProgressEvent('load'))
      }
      if (this.onreadystatechange) {
        this.onreadystatechange.call(this as any, new Event('readystatechange'))
      }
    }, 0)
    
    console.log(`📤 XMLHttpRequest.send: ${this._method} ${this._url}`)
  }
  
  setRequestHeader(name: string, value: string) {
    this._headers[name] = value
  }
  
  getResponseHeader(name: string): string | null {
    return this._headers[name] || null
  }
  
  getAllResponseHeaders(): string {
    return Object.entries(this._headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\r\n')
  }
  
  abort() {
    this.readyState = 0
    if (this.onabort) {
      this.onabort.call(this as any, new ProgressEvent('abort'))
    }
    console.log('🛑 XMLHttpRequest.abort called')
  }
}

/**
 * 初始化DOM Mock
 */
export function initDomMock() {
  // Mock Observers
  global.MutationObserver = MockMutationObserver as any
  global.ResizeObserver = MockResizeObserver as any
  global.IntersectionObserver = MockIntersectionObserver as any
  global.PerformanceObserver = MockPerformanceObserver as any
  
  // Mock XMLHttpRequest
  global.XMLHttpRequest = MockXMLHttpRequest as any
  
  // Mock AsyncTaskManager (如果存在)
  const mockTaskManager = new MockAsyncTaskManager()
  
  // 在window对象上添加mock
  if (typeof window !== 'undefined') {
    (window as any).AsyncTaskManager = mockTaskManager
  }
  
  // Mock其他可能缺失的API
  global.requestAnimationFrame = vi.fn((callback) => {
    return setTimeout(callback, 16) // 模拟60fps
  })

  global.cancelAnimationFrame = vi.fn((id) => {
    clearTimeout(id)
  })

  // Mock window.location for test environment
  Object.defineProperty(window, 'location', {
    value: {
      hostname: 'localhost',
      host: 'localhost:5173',
      origin: 'http://localhost:5173',
      protocol: 'http:',
      port: '5173',
      pathname: '/',
      search: '',
      hash: '',
      href: 'http://localhost:5173/',
      reload: vi.fn(),
      assign: vi.fn(),
      replace: vi.fn()
    },
    writable: true,
    configurable: true
  })

  // Mock additional browser APIs
  global.requestIdleCallback = vi.fn((callback) => {
    return setTimeout(callback, 1)
  })

  global.cancelIdleCallback = vi.fn((id) => {
    clearTimeout(id)
  })

  // Mock HTMLElement methods
  if (typeof HTMLElement !== 'undefined') {
    HTMLElement.prototype.focus = vi.fn()
    HTMLElement.prototype.blur = vi.fn()
    HTMLElement.prototype.click = vi.fn()
    HTMLElement.prototype.scrollIntoView = vi.fn()
    HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: vi.fn()
    }))
  }

  // Mock Element methods - 保留原生DOM方法，只Mock必要的API
  if (typeof Element !== 'undefined') {
    // 只Mock那些在测试环境中不存在或需要特殊行为的方法
    // 不要覆盖基础的DOM属性操作方法
    if (!Element.prototype.closest) {
      Element.prototype.closest = vi.fn()
    }
    if (!Element.prototype.matches) {
      Element.prototype.matches = vi.fn(() => false)
    }

    // 保留原生的属性操作方法，这些对Vue组件渲染至关重要
    // Element.prototype.getAttribute - 保持原生
    // Element.prototype.setAttribute - 保持原生
    // Element.prototype.removeAttribute - 保持原生
    // Element.prototype.hasAttribute - 保持原生
    // Element.prototype.classList - 保持原生
  }

  // Mock Web APIs
  global.fetch = vi.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    statusText: 'OK'
  }))

  // Mock MediaQuery
  global.matchMedia = vi.fn((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))

  // Mock Clipboard API
  global.navigator = {
    ...global.navigator,
    clipboard: {
      writeText: vi.fn(() => Promise.resolve()),
      readText: vi.fn(() => Promise.resolve(''))
    }
  }
  
  global.requestIdleCallback = vi.fn((callback) => {
    return setTimeout(() => callback({
      didTimeout: false,
      timeRemaining: () => 50
    }), 0)
  })
  
  global.cancelIdleCallback = vi.fn((id) => {
    clearTimeout(id)
  })
  
  console.log('✅ DOM Mock系统已初始化')
  
  return {
    mutationObserver: MockMutationObserver,
    resizeObserver: MockResizeObserver,
    intersectionObserver: MockIntersectionObserver,
    performanceObserver: MockPerformanceObserver,
    asyncTaskManager: mockTaskManager,
    xmlHttpRequest: MockXMLHttpRequest
  }
}

/**
 * 重置DOM Mock
 */
export function resetDomMock() {
  // 重置AsyncTaskManager
  if (typeof window !== 'undefined' && (window as any).AsyncTaskManager) {
    (window as any).AsyncTaskManager.reset()
  }
  
  console.log('🔄 DOM Mock已重置')
}

// 导出默认配置
export default {
  MockMutationObserver,
  MockResizeObserver,
  MockIntersectionObserver,
  MockPerformanceObserver,
  MockAsyncTaskManager,
  MockXMLHttpRequest,
  initDomMock,
  resetDomMock
}
