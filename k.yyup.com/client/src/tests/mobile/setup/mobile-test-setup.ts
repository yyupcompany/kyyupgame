/**
 * 移动端测试全局设置文件
 * 提供移动端测试所需的全局配置和工具函数
 */

import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// 全局测试常量
export const TEST_CONFIG = {
  // 超时配置
  TIMEOUTS: {
    ELEMENT_WAIT: 5000,
    PAGE_LOAD: 3000,
    API_RESPONSE: 5000,
    NETWORK_TIMEOUT: 10000
  },

  // 移动设备配置
  MOBILE_VIEWPORT: {
    WIDTH: 375,
    HEIGHT: 812,
    DEVICE_PIXEL_RATIO: 2
  },

  TABLET_VIEWPORT: {
    WIDTH: 768,
    HEIGHT: 1024,
    DEVICE_PIXEL_RATIO: 2
  },

  // 测试用户数据
  TEST_USERS: {
    PARENT: {
      username: 'test_parent',
      password: 'password123',
      role: 'parent',
      id: 'parent_123',
      email: 'parent@example.com'
    },
    TEACHER: {
      username: 'test_teacher',
      password: 'password123',
      role: 'teacher',
      id: 'teacher_123',
      email: 'teacher@example.com'
    },
    ADMIN: {
      username: 'test_admin',
      password: 'password123',
      role: 'admin',
      id: 'admin_123',
      email: 'admin@example.com'
    }
  },

  // API端点
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh'
    },
    PERMISSIONS: {
      USER_PERMISSIONS: '/api/dynamic-permissions/user-permissions',
      CHECK_PERMISSION: '/api/dynamic-permissions/check-permission'
    },
    PARENT: {
      DASHBOARD: '/api/parent/dashboard',
      CHILDREN: '/api/parent/children',
      SCHEDULE: '/api/parent/schedule',
      NOTIFICATIONS: '/api/parent/notifications'
    },
    AI: {
      CHAT: '/api/ai/chat',
      RECOMMENDATIONS: '/api/ai/recommendations'
    }
  }
};

// 移动设备User-Agent列表
export const MOBILE_USER_AGENTS = {
  IPHONE: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  ANDROID: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
  IPAD: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
};

// 全局测试工具函数
export class MobileTestUtils {
  /**
   * 设置移动设备环境
   */
  static setMobileEnvironment(userAgent: string = MOBILE_USER_AGENTS.IPHONE) {
    Object.defineProperty(navigator, 'userAgent', {
      value: userAgent,
      configurable: true
    });

    Object.defineProperty(window, 'innerWidth', {
      value: TEST_CONFIG.MOBILE_VIEWPORT.WIDTH,
      configurable: true
    });

    Object.defineProperty(window, 'innerHeight', {
      value: TEST_CONFIG.MOBILE_VIEWPORT.HEIGHT,
      configurable: true
    });

    Object.defineProperty(window, 'devicePixelRatio', {
      value: TEST_CONFIG.MOBILE_VIEWPORT.DEVICE_PIXEL_RATIO,
      configurable: true
    });

    // 添加触摸支持
    Object.defineProperty(window, 'ontouchstart', {
      value: () => {},
      configurable: true
    });

    Object.defineProperty(window, 'ontouchend', {
      value: () => {},
      configurable: true
    });

    Object.defineProperty(window, 'ontouchmove', {
      value: () => {},
      configurable: true
    });
  }

  /**
   * 设置平板设备环境
   */
  static setTabletEnvironment() {
    this.setMobileEnvironment(MOBILE_USER_AGENTS.IPAD);

    Object.defineProperty(window, 'innerWidth', {
      value: TEST_CONFIG.TABLET_VIEWPORT.WIDTH,
      configurable: true
    });

    Object.defineProperty(window, 'innerHeight', {
      value: TEST_CONFIG.TABLET_VIEWPORT.HEIGHT,
      configurable: true
    });
  }

  /**
   * 设置桌面设备环境
   */
  static setDesktopEnvironment() {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      configurable: true
    });

    Object.defineProperty(window, 'innerWidth', {
      value: 1920,
      configurable: true
    });

    Object.defineProperty(window, 'innerHeight', {
      value: 1080,
      configurable: true
    });

    // 移除触摸支持
    Object.defineProperty(window, 'ontouchstart', {
      value: undefined,
      configurable: true
    });
  }

  /**
   * 创建Mock API响应
   */
  static createMockAPIResponse<T>(success: boolean, data?: T, message?: string) {
    return {
      success,
      data,
      message: message || (success ? '操作成功' : '操作失败'),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 创建Mock用户对象
   */
  static createMockUser(userType: keyof typeof TEST_CONFIG.TEST_USERS) {
    const userConfig = TEST_CONFIG.TEST_USERS[userType.toUpperCase() as keyof typeof TEST_CONFIG.TEST_USERS];
    return {
      ...userConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
  }

  /**
   * 等待指定时间
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清理DOM
   */
  static cleanupDOM() {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  }

  /**
   * 重置所有mocks
   */
  static resetAllMocks() {
    vi.clearAllMocks();
    vi.resetModules();
  }
}

// 全局测试钩子
beforeAll(() => {
  // 设置默认移动环境
  MobileTestUtils.setMobileEnvironment();

  // 全局console拦截
  const originalConsole = {
    ...console
  };

  // 存储原始console方法用于清理
  (global as any).originalConsole = originalConsole;
});

afterAll(() => {
  // 清理全局状态
  MobileTestUtils.cleanupDOM();
  MobileTestUtils.resetAllMocks();
});

beforeEach(() => {
  // 每个测试前重置DOM
  MobileTestUtils.cleanupDOM();

  // 重置localStorage
  localStorage.clear();
  sessionStorage.clear();

  // 重置mocks
  vi.clearAllMocks();
});

afterEach(() => {
  // 每个测试后清理
  MobileTestUtils.cleanupDOM();

  // 检查是否有未清理的定时器
  vi.clearAllTimers();
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// 扩展Vitest匹配器
expect.extend({
  /**
   * 检查元素是否可见
   */
  toBeVisible(element: Element) {
    const isVisible = element.offsetParent !== null;
    return {
      message: () => `expected element ${isVisible ? 'not ' : ''}to be visible`,
      pass: isVisible
    };
  },

  /**
   * 检查元素是否可点击
   */
  toBeClickable(element: HTMLElement) {
    const isVisible = element.offsetParent !== null;
    const isEnabled = !element.disabled;
    const hasClickListener = element.onclick !== null || element.hasAttribute('onclick');

    return {
      message: () => `expected element ${isVisible && isEnabled && hasClickListener ? 'not ' : ''}to be clickable`,
      pass: isVisible && isEnabled && hasClickListener
    };
  },

  /**
   * 检查API响应是否有效
   */
  toBeValidAPIResponse(response: any) {
    const hasSuccess = typeof response.success === 'boolean';
    const hasData = response.success ? response.data !== undefined : true;

    return {
      message: () => `expected response ${hasSuccess && hasData ? '' : 'not '}to be a valid API response`,
      pass: hasSuccess && hasData
    };
  },

  /**
   * 检查JWT令牌是否有效
   */
  toBeValidJWT(token: string) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return {
          message: () => 'expected token to have 3 parts',
          pass: false
        };
      }

      const payload = JSON.parse(atob(parts[1]));
      const hasRequiredClaims = payload.exp && payload.iat && payload.userId;

      return {
        message: () => `expected token ${hasRequiredClaims ? '' : 'not '}to be a valid JWT`,
        pass: hasRequiredClaims
      };
    } catch (error) {
      return {
        message: () => 'expected token to be a valid JWT format',
        pass: false
      };
    }
  }
});

// 导出全局变量供测试使用
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeVisible(): T;
      toBeClickable(): T;
      toBeValidAPIResponse(): T;
      toBeValidJWT(): T;
    }
  }
}

// 性能监控
export const PerformanceMonitor = {
  startTime: 0,
  measurements: new Map<string, number>(),

  start(name: string) {
    this.startTime = performance.now();
  },

  end(name: string): number {
    const duration = performance.now() - this.startTime;
    this.measurements.set(name, duration);
    return duration;
  },

  getMeasurement(name: string): number | undefined {
    return this.measurements.get(name);
  },

  getAllMeasurements(): Record<string, number> {
    return Object.fromEntries(this.measurements);
  },

  clear() {
    this.measurements.clear();
  }
};

// 网络状态模拟
export const NetworkSimulator = {
  /**
   * 模拟网络延迟
   */
  async simulateLatency(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 模拟网络错误
   */
  simulateNetworkError(): Error {
    return new Error('Network Error: Failed to connect to server');
  },

  /**
   * 模拟慢速网络
   */
  async simulateSlowNetwork<T>(data: T, delay: number): Promise<T> {
    await this.simulateLatency(delay);
    return data;
  }
};

// 控制台错误收集器
export class ConsoleErrorCollector {
  private errors: string[] = [];
  private warnings: string[] = [];
  private originalConsole = { ...console };

  start() {
    console.error = (...args: any[]) => {
      this.errors.push(args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '));
      this.originalConsole.error.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      this.warnings.push(args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '));
      this.originalConsole.warn.apply(console, args);
    };
  }

  stop() {
    Object.assign(console, this.originalConsole);
  }

  getErrors(): string[] {
    return this.errors;
  }

  getWarnings(): string[] {
    return this.warnings;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  clear() {
    this.errors = [];
    this.warnings = [];
  }
}

export default {
  TEST_CONFIG,
  MOBILE_USER_AGENTS,
  MobileTestUtils,
  PerformanceMonitor,
  NetworkSimulator,
  ConsoleErrorCollector
};