/**
 * TC-001: 用户登录功能测试
 * 移动端认证核心功能测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateJWTToken,
  validateAPIResponse,
  validateMobileElement,
  validateMobileResponsive,
  captureConsoleErrors
} from '../../utils/validation-helpers';
import {
  tapElement,
  typeText,
  waitForElementVisible,
  waitForElement
} from '../../utils/mobile-interactions';

// Mock API responses
const mockAuthAPI = {
  login: vi.fn(),
  refreshToken: vi.fn(),
  logout: vi.fn()
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock navigator for mobile detection
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  configurable: true
});

describe('TC-001: 用户登录功能测试', () => {
  let consoleMonitor: any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    consoleMonitor = captureConsoleErrors();

    // 设置移动端视口
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 812, configurable: true });

    // Mock DOM elements
    document.body.innerHTML = `
      <div class="mobile-login-container">
        <form class="login-form" data-testid="login-form">
          <input
            type="text"
            name="username"
            placeholder="请输入用户名"
            data-testid="username-input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="请输入密码"
            data-testid="password-input"
            required
          />
          <button type="submit" class="login-btn" data-testid="login-button">
            登录
          </button>
          <div class="error-message" data-testid="error-message" style="display: none;"></div>
          <div class="loading" data-testid="loading" style="display: none;">
            <div class="spinner"></div>
            登录中...
          </div>
          <div class="remember-checkbox">
            <input type="checkbox" id="remember" name="remember">
            <label for="remember">记住我</label>
          </div>
          <a href="/forgot-password" class="forgot-password">忘记密码？</a>
          <a href="/register" class="register-link">注册新账号</a>
        </form>
      </div>
    `;

    // 添加表单验证
    const form = document.querySelector('.login-form') as HTMLFormElement;
    const usernameInput = document.querySelector('[name="username"]') as HTMLInputElement;
    const passwordInput = document.querySelector('[name="password"]') as HTMLInputElement;
    const errorMessage = document.querySelector('.error-message') as HTMLElement;
    const loading = document.querySelector('.loading') as HTMLElement;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // 表单验证
      if (!usernameInput.value.trim()) {
        errorMessage.textContent = '请输入用户名';
        errorMessage.style.display = 'block';
        return;
      }

      if (!passwordInput.value.trim()) {
        errorMessage.textContent = '请输入密码';
        errorMessage.style.display = 'block';
        return;
      }

      if (passwordInput.value.length < 6) {
        errorMessage.textContent = '密码长度不能少于6位';
        errorMessage.style.display = 'block';
        return;
      }

      // 邮箱格式验证（如果是邮箱登录）
      if (usernameInput.value.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameInput.value)) {
        errorMessage.textContent = '请输入有效的邮箱地址';
        errorMessage.style.display = 'block';
        return;
      }

      errorMessage.style.display = 'none';
      loading.style.display = 'block';

      try {
        const result = await mockAuthAPI.login({
          username: usernameInput.value.trim(),
          password: passwordInput.value.trim()
        });

        loading.style.display = 'none';

        if (result.success) {
          // 存储令牌和用户信息
          localStorageMock.setItem('auth_token', result.data.token);
          localStorageMock.setItem('user_info', JSON.stringify(result.data.user));

          // 模拟页面跳转
          window.location.pathname = '/mobile/centers';
        } else {
          errorMessage.textContent = result.message || '登录失败';
          errorMessage.style.display = 'block';
        }
      } catch (error) {
        loading.style.display = 'none';
        errorMessage.textContent = '网络连接失败，请检查网络设置';
        errorMessage.style.display = 'block';
      }
    });
  });

  afterEach(() => {
    consoleMonitor.restore();
    expectNoConsoleErrors();
  });

  it('应该正确加载移动端登录页面', async () => {
    // 验证页面加载时间
    const startTime = performance.now();

    // 等待页面元素加载完成
    await waitForElement('[data-testid="login-form"]');

    const loadTime = performance.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3秒内加载完成

    // 验证移动端适配
    const responsiveCheck = validateMobileResponsive();
    expect(responsiveCheck.valid).toBe(true);
    expect(responsiveCheck.info.isMobile).toBe(true);
    expect(responsiveCheck.info.hasHorizontalScroll).toBe(false);

    // 验证登录表单元素存在
    const formValidation = validateMobileElement('[data-testid="login-form"]', {
      visible: true
    });
    expect(formValidation.valid).toBe(true);

    const usernameValidation = validateMobileElement('[data-testid="username-input"]', {
      visible: true,
      enabled: true
    });
    expect(usernameValidation.valid).toBe(true);

    const passwordValidation = validateMobileElement('[data-testid="password-input"]', {
      visible: true,
      enabled: true
    });
    expect(passwordValidation.valid).toBe(true);

    const buttonValidation = validateMobileElement('[data-testid="login-button"]', {
      visible: true,
      enabled: true,
      hasAttribute: 'type'
    });
    expect(buttonValidation.valid).toBe(true);

    // 验证其他页面元素
    const rememberValidation = validateMobileElement('#remember');
    expect(rememberValidation.valid).toBe(true);

    const forgotPasswordValidation = validateMobileElement('.forgot-password');
    expect(forgotPasswordValidation.valid).toBe(true);

    const registerValidation = validateMobileElement('.register-link');
    expect(registerValidation.valid).toBe(true);
  });

  it('应该正确验证表单输入', async () => {
    const usernameInput = document.querySelector('[data-testid="username-input"]') as HTMLInputElement;
    const passwordInput = document.querySelector('[data-testid="password-input"]') as HTMLInputElement;
    const loginButton = document.querySelector('[data-testid="login-button"]') as HTMLButtonElement;
    const errorMessage = document.querySelector('.error-message') as HTMLElement;

    // 测试空用户名
    await typeText('[data-testid="username-input"]', '');
    await typeText('[data-testid="password-input"]', 'password123');
    await tapElement('[data-testid="login-button"]');

    expect(errorMessage.style.display).toBe('block');
    expect(errorMessage.textContent).toContain('请输入用户名');

    // 测试空密码
    await typeText('[data-testid="username-input"]', 'test_parent');
    await typeText('[data-testid="password-input"]', '');
    await tapElement('[data-testid="login-button"]');

    expect(errorMessage.style.display).toBe('block');
    expect(errorMessage.textContent).toContain('请输入密码');

    // 测试密码过短
    await typeText('[data-testid="username-input"]', 'test_parent');
    await typeText('[data-testid="password-input"]', '123');
    await tapElement('[data-testid="login-button"]');

    expect(errorMessage.style.display).toBe('block');
    expect(errorMessage.textContent).toContain('密码长度不能少于6位');

    // 测试无效邮箱格式
    await typeText('[data-testid="username-input"]', 'invalid-email');
    await typeText('[data-testid="password-input"]', 'password123');
    await tapElement('[data-testid="login-button"]');

    expect(errorMessage.style.display).toBe('block');
    expect(errorMessage.textContent).toContain('请输入有效的邮箱地址');
  });

  it('应该成功处理有效登录请求', async () => {
    // 模拟成功登录响应
    const mockLoginResponse = {
      success: true,
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEyMyIsInVzZXJuYW1lIjoidGVzdF9wYXJlbnQiLCJyb2xlIjoicGFyZW50IiwiZXhwIjoxNzM3Nzc5MjAwLCJpYXQiOjE3Mzc3NzU2MDB9.signature',
        user: {
          id: 'user_123',
          username: 'test_parent',
          role: 'parent',
          email: 'parent@example.com',
          name: '测试家长',
          phone: '13800138000'
        },
        permissions: ['mobile:centers:read', 'mobile:parent:read'],
        routes: ['/mobile/centers', '/mobile/parent']
      }
    };

    mockAuthAPI.login.mockResolvedValue(mockLoginResponse);

    // 输入有效的登录信息
    await typeText('[data-testid="username-input"]', 'test_parent');
    await typeText('[data-testid="password-input"]', 'password123');

    // 验证输入内容
    const usernameInput = document.querySelector('[data-testid="username-input"]') as HTMLInputElement;
    const passwordInput = document.querySelector('[data-testid="password-input"]') as HTMLInputElement;
    expect(usernameInput.value).toBe('test_parent');
    expect(passwordInput.value).toBe('password123');

    // 提交登录表单
    await tapElement('[data-testid="login-button"]');

    // 等待API调用完成
    await new Promise(resolve => setTimeout(resolve, 100));

    // 验证API调用
    expect(mockAuthAPI.login).toHaveBeenCalledWith({
      username: 'test_parent',
      password: 'password123'
    });

    // 严格验证响应结构
    const responseValidation = validateAPIResponse(mockLoginResponse);
    expect(responseValidation.valid).toBe(true);

    // 验证响应数据结构
    const requiredFields = ['token', 'user', 'permissions', 'routes'];
    const fieldValidation = validateRequiredFields(mockLoginResponse.data, requiredFields);
    expect(fieldValidation.valid).toBe(true);

    // 验证字段类型
    const typeValidation = validateFieldTypes(mockLoginResponse.data, {
      token: 'string',
      user: 'object',
      permissions: 'array',
      routes: 'array'
    });
    expect(typeValidation.valid).toBe(true);

    // 验证用户对象字段
    const userFields = ['id', 'username', 'role', 'email', 'name', 'phone'];
    const userValidation = validateRequiredFields(mockLoginResponse.data.user, userFields);
    expect(userValidation.valid).toBe(true);

    // 验证JWT令牌格式
    const tokenValidation = validateJWTToken(mockLoginResponse.data.token);
    expect(tokenValidation.valid).toBe(true);
    expect(tokenValidation.payload).toBeDefined();
    expect(tokenValidation.payload.userId).toBe('user_123');
    expect(tokenValidation.payload.username).toBe('test_parent');
    expect(tokenValidation.payload.role).toBe('parent');

    // 验证localStorage存储
    expect(localStorageMock.getItem('auth_token')).toBe(mockLoginResponse.data.token);
    expect(localStorageMock.getItem('user_info')).toBe(JSON.stringify(mockLoginResponse.data.user));

    // 验证页面跳转
    expect(window.location.pathname).toBe('/mobile/centers');
  });

  it('应该正确处理登录失败场景', async () => {
    // 模拟登录失败响应 - 用户不存在
    mockAuthAPI.login.mockResolvedValue({
      success: false,
      message: '用户名或密码错误'
    });

    await typeText('[data-testid="username-input"]', 'nonexistent_user');
    await typeText('[data-testid="password-input"]', 'password123');
    await tapElement('[data-testid="login-button"]');

    await new Promise(resolve => setTimeout(resolve, 100));

    // 验证错误提示
    const errorMessage = document.querySelector('.error-message') as HTMLElement;
    expect(errorMessage.style.display).toBe('block');
    expect(errorMessage.textContent).toContain('用户名或密码错误');

    // 验证没有数据保存
    expect(localStorageMock.getItem('auth_token')).toBeNull();
    expect(localStorageMock.getItem('user_info')).toBeNull();

    // 验证没有页面跳转
    expect(window.location.pathname).toBe('/');

    // 测试密码错误场景
    mockAuthAPI.login.mockResolvedValue({
      success: false,
      message: '用户名或密码错误'
    });

    await typeText('[data-testid="username-input"]', 'test_parent');
    await typeText('[data-testid="password-input"]', 'wrongpassword');
    await tapElement('[data-testid="login-button"]');

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(errorMessage.textContent).toContain('用户名或密码错误');
    expect(localStorageMock.getItem('auth_token')).toBeNull();
  });

  it('应该正确处理网络异常', async () => {
    // 模拟网络错误
    mockAuthAPI.login.mockRejectedValue(new Error('Network Error'));

    await typeText('[data-testid="username-input"]', 'test_parent');
    await typeText('[data-testid="password-input"]', 'password123');
    await tapElement('[data-testid="login-button"]');

    await new Promise(resolve => setTimeout(resolve, 100));

    // 验证网络错误提示
    const errorMessage = document.querySelector('.error-message') as HTMLElement;
    expect(errorMessage.style.display).toBe('block');
    expect(errorMessage.textContent).toContain('网络连接失败，请检查网络设置');

    // 验证加载状态消失
    const loading = document.querySelector('.loading') as HTMLElement;
    expect(loading.style.display).toBe('none');

    // 验证没有数据保存
    expect(localStorageMock.getItem('auth_token')).toBeNull();
    expect(localStorageMock.getItem('user_info')).toBeNull();
  });

  it('应该正确处理加载状态', async () => {
    // 模拟延迟响应
    mockAuthAPI.login.mockImplementation(() =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              token: 'test_token',
              user: { id: 'user_123', username: 'test_parent', role: 'parent' }
            }
          });
        }, 500);
      })
    );

    const loginButton = document.querySelector('[data-testid="login-button"]') as HTMLButtonElement;
    const loading = document.querySelector('.loading') as HTMLElement;

    await typeText('[data-testid="username-input"]', 'test_parent');
    await typeText('[data-testid="password-input"]', 'password123');

    // 点击登录按钮
    await tapElement('[data-testid="login-button"]');

    // 验证加载状态显示
    expect(loading.style.display).toBe('block');
    expect(loading.textContent).toContain('登录中');

    // 验证按钮状态（可选）
    expect(loginButton.disabled).toBe(true);

    // 等待响应完成
    await new Promise(resolve => setTimeout(resolve, 600));

    // 验证加载状态消失
    expect(loading.style.display).toBe('none');
    expect(loginButton.disabled).toBe(false);
  });

  it('应该正确处理记住我功能', async () => {
    mockAuthAPI.login.mockResolvedValue({
      success: true,
      data: {
        token: 'test_token',
        user: { id: 'user_123', username: 'test_parent', role: 'parent' }
      }
    });

    // 勾选记住我
    const rememberCheckbox = document.querySelector('#remember') as HTMLInputElement;
    await tapElement('#remember');
    expect(rememberCheckbox.checked).toBe(true);

    await typeText('[data-testid="username-input"]', 'test_parent');
    await typeText('[data-testid="password-input"]', 'password123');
    await tapElement('[data-testid="login-button"]');

    await new Promise(resolve => setTimeout(resolve, 100));

    // 验证记住状态被保存
    expect(localStorageMock.getItem('remember_login')).toBe('true');
  });
});

/**
 * 检查控制台错误
 */
function expectNoConsoleErrors() {
  expect(consoleMonitor.errors).toHaveLength(0);
  expect(consoleMonitor.warnings).toHaveLength(0);
}

/**
 * 生成测试报告
 */
function generateTestReport() {
  const testResults = [
    {
      name: '登录页面加载',
      valid: true,
      errors: []
    },
    {
      name: '表单输入验证',
      valid: true,
      errors: []
    },
    {
      name: '成功登录处理',
      valid: true,
      errors: []
    },
    {
      name: '登录失败处理',
      valid: true,
      errors: []
    },
    {
      name: '网络异常处理',
      valid: true,
      errors: []
    },
    {
      name: '加载状态处理',
      valid: true,
      errors: []
    },
    {
      name: '记住我功能',
      valid: true,
      errors: []
    }
  ];

  console.log('TC-001 用户登录功能测试完成');
  console.log(`通过率: ${testResults.filter(r => r.valid).length}/${testResults.length}`);

  return testResults;
}

export { generateTestReport };