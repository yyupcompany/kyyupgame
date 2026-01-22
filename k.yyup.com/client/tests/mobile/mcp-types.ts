/**
 * MCP移动端测试类型定义
 */

/**
 * 测试角色枚举
 */
export type TestRole = 'parent' | 'teacher' | 'admin' | 'principal';

/**
 * API响应数据结构
 */
export interface ApiResponse {
  success: boolean;
  data: any;
  message?: string;
  code?: string;
}

/**
 * 页面检测指标接口
 */
export interface PageDetectionMetrics {
  summary: {
    url: string;
    title: string;
    loadTime: number;
    domReady: number;
  };
  components: {
    statsCards: {
      count: number;
      texts: string[];
    };
    contentCards: {
      count: number;
      titles: string[];
    };
    buttons: {
      primary: number;
      disabled: number;
    };
    lists: {
      itemCount: number;
      hasData: boolean;
    };
    emptyStates?: {
      count: number;
      messages: string[];
    };
  };
  apiData: {
    responses: Array<{
      url: string;
      status: number;
      latency: number;
      hasData: boolean;
    }>;
    errors: string[];
  };
  errors: {
    has404: boolean;
    has500: boolean;
    consoleErrors: string[];
    networkErrors: string[];
  };
}

/**
 * 测试配置接口
 */
export interface MCPTestConfig {
  browser: {
    type: 'chromium' | 'firefox' | 'webkit';
    headless: boolean;
    viewport: { width: number; height: number };
    isMobile: boolean;
    hasTouch: boolean;
    deviceScaleFactor: number;
    userAgent: string;
  };
  roles: Record<
    TestRole,
    {
      loginButton: string;
      expectedPath: string;
      navItems: string[];
    }
  >;
  selectors: {
    loginButton: string;
    navBar: string;
    navItem: string;
    statsCard: string;
    contentCard: string;
    listItem: string;
    emptyState: string;
    primaryButton: string;
  };
}

/**
 * 测试结果接口
 */
export interface TestResult {
  success: boolean;
  description: string;
  error?: string;
  duration?: number;
  data?: any;
}

/**
 * API性能指标
 */
export interface ApiPerformance {
  averageLatency: number;
  slowest: { url: string; latency: number };
  fastest: { url: string; latency: number };
  totalRequests: number;
  failedRequests: number;
}

/**
 * 链接遍历结果
 */
export interface LinkCrawlResult {
  totalLinks: number;
  success: number;
  failed: number;
  notFound: number;
  visited: Set<string>;
  errors: Array<{
    url: string;
    error: string;
  }>;
}

/**
 * 角色测试结果
 */
export interface RoleTestResults {
  role: TestRole;
  pages: Array<{
    url: string;
    navItem: string;
    data: PageDetectionMetrics;
    apiCalls: number;
    errors: string[];
  }>;
}

/**
 * MCP测试报告接口
 */
export interface MCPTesntReport {
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    successRate: number;
    duration: number;
  };
  roles: Record<TestRole, RoleTestResults>;
  linkCrawl: LinkCrawlResult;
  apiPerformance: ApiPerformance;
  environment: {
    url: string;
    browser: string;
    viewport: string;
    timestamp: string;
  };
}

/**
 * 可点击元素接口
 */
export interface ClickableElement {
  tag: string;
  type?: string;
  href?: string;
  text?: string;
  className: string;
  disabled?: boolean;
  clickable: boolean;
}

/**
 * API验证结果
 */
export interface ApiValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 数据渲染验证结果
 */
export interface DataRenderingResult {
  consistent: boolean;
  domCount: number;
  apiCount: number;
  missing: number;
  message: string;
}
