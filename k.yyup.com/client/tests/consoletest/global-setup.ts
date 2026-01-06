/**
 * 控制台错误检测测试全局设置
 * 
 * 功能：
 * 1. 初始化测试环境
 * 2. 配置全局Mock
 * 3. 设置错误处理
 * 4. 准备测试数据
 */

import { vi } from 'vitest';

// Mock ECharts模块以避免环境检测问题
vi.mock('echarts', () => ({
  default: {
    init: vi.fn(() => ({
      setOption: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      getWidth: vi.fn(() => 400),
      getHeight: vi.fn(() => 300),
      clear: vi.fn(),
      showLoading: vi.fn(),
      hideLoading: vi.fn()
    })),
    dispose: vi.fn(),
    registerTheme: vi.fn(),
    registerMap: vi.fn(),
    graphic: {
      LinearGradient: vi.fn()
    }
  },
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    getWidth: vi.fn(() => 400),
    getHeight: vi.fn(() => 300),
    clear: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn()
  })),
  dispose: vi.fn(),
  registerTheme: vi.fn(),
  registerMap: vi.fn(),
  graphic: {
    LinearGradient: vi.fn()
  }
}));

// 全局变量声明
declare global {
  interface Window {
    __CONSOLE_TEST_MODE__: boolean;
    __TEST_START_TIME__: number;
  }
}

/**
 * 全局设置函数
 */
export async function setup() {
  console.log('🚀 初始化控制台错误检测测试环境...');
  
  // 设置测试模式标识
  if (typeof window !== 'undefined') {
    window.__CONSOLE_TEST_MODE__ = true;
    window.__TEST_START_TIME__ = Date.now();
  }

  // 设置全局环境变量
  process.env.NODE_ENV = 'test';
  process.env.CONSOLE_TEST_MODE = 'true';

  // Mock全局对象
  setupGlobalMocks();
  
  // 配置错误处理
  setupErrorHandling();
  
  // 初始化测试数据
  await initializeTestData();
  
  console.log('✅ 控制台错误检测测试环境初始化完成');
}

/**
 * 全局清理函数
 */
export async function teardown() {
  console.log('🧹 清理控制台错误检测测试环境...');
  
  // 清理全局Mock
  vi.clearAllMocks();
  vi.resetAllMocks();
  
  // 清理环境变量
  delete process.env.CONSOLE_TEST_MODE;
  
  // 清理全局变量
  if (typeof window !== 'undefined') {
    delete window.__CONSOLE_TEST_MODE__;
    delete window.__TEST_START_TIME__;
  }
  
  console.log('✅ 控制台错误检测测试环境清理完成');
}

/**
 * 设置全局Mock
 */
function setupGlobalMocks() {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  };
  
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true
  });

  // Mock location
  const locationMock = {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn()
  };
  
  Object.defineProperty(window, 'location', {
    value: locationMock,
    writable: true
  });

  // Mock navigator - 增强ECharts兼容性
  const navigatorMock = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    language: 'zh-CN',
    languages: ['zh-CN', 'en'],
    platform: 'Win32',
    cookieEnabled: true,
    onLine: true,
    // 添加更多ECharts/zrender需要的属性
    vendor: 'Google Inc.',
    vendorSub: '',
    productSub: '20030107',
    appCodeName: 'Mozilla',
    appName: 'Netscape',
    appVersion: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    product: 'Gecko',
    hardwareConcurrency: 4,
    deviceMemory: 8,
    maxTouchPoints: 0,
    doNotTrack: null,
    connection: {
      effectiveType: '4g',
      downlink: 10,
      rtt: 100
    },
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue('')
    },
    // 确保toString返回userAgent
    toString: function() { return this.userAgent; }
  };
  
  Object.defineProperty(window, 'navigator', {
    value: navigatorMock,
    writable: true
  });

  // Mock fetch
  global.fetch = vi.fn().mockImplementation((url: string) => {
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({
        success: true,
        data: {},
        message: 'Mock response'
      }),
      text: () => Promise.resolve('Mock response'),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      headers: new Headers(),
      url,
      redirected: false,
      type: 'basic',
      clone: vi.fn()
    });
  });

  // Mock XMLHttpRequest
  const XMLHttpRequestMock = vi.fn(() => ({
    open: vi.fn(),
    send: vi.fn(),
    setRequestHeader: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    abort: vi.fn(),
    readyState: 4,
    status: 200,
    statusText: 'OK',
    responseText: '{"success": true, "data": {}}',
    response: '{"success": true, "data": {}}',
    responseXML: null,
    timeout: 0,
    withCredentials: false,
    upload: {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
  }));
  
  global.XMLHttpRequest = XMLHttpRequestMock as any;

  // Mock WebSocket
  const WebSocketMock = vi.fn(() => ({
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 1,
    url: '',
    protocol: '',
    extensions: '',
    bufferedAmount: 0,
    binaryType: 'blob' as BinaryType,
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null
  }));
  
  global.WebSocket = WebSocketMock as any;

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: []
  })) as any;

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  })) as any;

  // Mock MutationObserver
  global.MutationObserver = vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => [])
  })) as any;

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((callback) => {
    return setTimeout(callback, 16);
  });

  global.cancelAnimationFrame = vi.fn((id) => {
    clearTimeout(id);
  });

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });

  // Mock document for ECharts
  if (typeof document !== 'undefined') {
    // Mock createElement for canvas
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        const canvas = originalCreateElement.call(document, 'canvas');
        const context = {
          fillRect: vi.fn(),
          clearRect: vi.fn(),
          getImageData: vi.fn(() => ({ data: new Array(4) })),
          putImageData: vi.fn(),
          createImageData: vi.fn(() => ({ data: new Array(4) })),
          setTransform: vi.fn(),
          drawImage: vi.fn(),
          save: vi.fn(),
          fillText: vi.fn(),
          restore: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          stroke: vi.fn(),
          translate: vi.fn(),
          scale: vi.fn(),
          rotate: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          measureText: vi.fn(() => ({ width: 0 })),
          transform: vi.fn(),
          rect: vi.fn(),
          clip: vi.fn()
        };
        canvas.getContext = vi.fn(() => context);
        canvas.width = 300;
        canvas.height = 150;
        return canvas;
      }
      return originalCreateElement.call(document, tagName);
    });
  }

  // Mock global for ECharts environment detection
  if (typeof global !== 'undefined') {
    global.navigator = navigatorMock;
    global.window = window;
    global.document = document;
  }



  console.log('✅ 全局Mock设置完成');
}

/**
 * 设置错误处理
 */
function setupErrorHandling() {
  // 捕获未处理的Promise拒绝
  process.on('unhandledRejection', (reason, promise) => {
    console.warn('未处理的Promise拒绝:', reason);
  });

  // 捕获未捕获的异常
  process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
  });

  console.log('✅ 错误处理设置完成');
}

/**
 * 初始化测试数据
 */
async function initializeTestData() {
  // 设置默认的用户数据
  const mockUserData = {
    id: 'test-user-001',
    name: '测试用户',
    email: 'test@example.com',
    role: 'admin',
    permissions: ['read', 'write', 'delete']
  };

  // 设置默认的系统配置
  const mockSystemConfig = {
    appName: '幼儿园管理系统',
    version: '1.0.0',
    environment: 'test',
    features: {
      ai: true,
      analytics: true,
      notifications: true
    }
  };

  // 模拟API响应数据
  const mockApiData = {
    dashboard: {
      stats: {
        userCount: 150,
        studentCount: 1200,
        teacherCount: 80,
        classCount: 40
      }
    },
    activities: [],
    students: [],
    teachers: [],
    classes: []
  };

  // 存储到全局变量中供测试使用
  (global as any).__TEST_DATA__ = {
    user: mockUserData,
    system: mockSystemConfig,
    api: mockApiData
  };

  console.log('✅ 测试数据初始化完成');
}

export default { setup, teardown };
