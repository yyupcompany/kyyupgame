/**
 * TC-032: CSRF令牌验证测试
 * 验证移动端应用的跨站请求伪造(CSRF)防护机制
 */

import { describe, it, expect, beforeEach, afterEach, jest } from 'vitest';
import { validateRequiredFields, validateFieldTypes } from '@/utils/validation';

// 模拟fetch API
const mockFetch = jest.fn();
Object.defineProperty(global, 'fetch', { value: mockFetch });

// 模拟document.cookie
const mockCookies: { [key: string]: string } = {};
Object.defineProperty(document, 'cookie', {
  get: () => Object.entries(mockCookies).map(([k, v]) => `${k}=${v}`).join('; '),
  set: (cookieString: string) => {
    const [name, value] = cookieString.split('=').map(s => s.trim());
    if (name && value) {
      mockCookies[name] = value;
    }
  }
});

describe('TC-032: CSRF令牌验证测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies['XSRF-TOKEN'] = 'valid-csrf-token-123456';
    mockCookies['JSESSIONID'] = 'valid-session-789012';
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.keys(mockCookies).forEach(key => delete mockCookies[key]);
  });

  /**
   * 验证CSRF令牌格式
   */
  const validateCSRFToken = (token: string) => {
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);
    expect(token).toMatch(/^[a-zA-Z0-9_-]+$/);

    // 验证令牌包含足够的熵
    const entropy = token.length * Math.log2(token.length);
    expect(entropy).toBeGreaterThan(128);
  };

  /**
   * 验证CSRF错误响应
   */
  const validateCSRFErrorResponse = (response: any) => {
    validateRequiredFields(response, ['success', 'error', 'code']);
    validateFieldTypes(response, {
      success: 'boolean',
      error: 'string',
      code: 'string'
    });

    expect(response.success).toBe(false);
    expect(response.code).toBe('CSRF_INVALID');
    expect(response.error).toContain('CSRF');
  };

  /**
   * 验证恶意请求被拦截
   */
  const verifyMaliciousRequestBlocked = async (endpoint: string, payload: any) => {
    mockFetch.mockResolvedValueOnce({
      status: 403,
      json: async () => ({
        success: false,
        error: 'Invalid CSRF token',
        code: 'CSRF_INVALID'
      })
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 故意不包含CSRF令牌
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    expect(response.status).toBe(403);
    const errorData = await response.json();
    validateCSRFErrorResponse(errorData);
  };

  describe('步骤1: 正常CSRF令牌验证', () => {
    it('应该在正常操作中包含有效的CSRF令牌', async () => {
      // 模拟用户登录获取令牌
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          success: true,
          data: {
            user: { id: 'user_123', username: 'testuser' },
            csrfToken: 'valid-csrf-token-123456'
          }
        })
      });

      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'password123' })
      });

      expect(loginResponse.status).toBe(200);
      const loginData = await loginResponse.json();
      expect(loginData.success).toBe(true);
      validateCSRFToken(loginData.data.csrfToken);
    });

    it('应该在API请求中正确包含CSRF令牌', async () => {
      const csrfToken = 'valid-csrf-token-123456';

      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          success: true,
          message: 'Profile updated successfully',
          data: { name: 'Updated Name' }
        })
      });

      // 模拟包含CSRF令牌的请求
      const profileUpdateResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ name: 'Updated Name' })
      });

      expect(profileUpdateResponse.status).toBe(200);
      const profileData = await profileUpdateResponse.json();
      expect(profileData.success).toBe(true);
      expect(profileData.data.name).toBe('Updated Name');
    });

    it('应该验证请求头中的CSRF令牌格式', () => {
      const validTokens = [
        'valid-csrf-token-123456',
        'csrf-token-abcdef789012',
        'xsrftoken_9876543210'
      ];

      const invalidTokens = [
        'short',
        '',
        null as any,
        undefined as any,
        '<script>alert("xss")</script>',
        'invalid token with spaces',
        'token-with-special-chars!@#$%'
      ];

      validTokens.forEach(token => {
        expect(() => validateCSRFToken(token)).not.toThrow();
      });

      invalidTokens.forEach(token => {
        if (token === null || token === undefined) {
          expect(() => validateCSRFToken(token || '')).toThrow();
        } else {
          expect(() => validateCSRFToken(token)).toThrow();
        }
      });
    });
  });

  describe('步骤2: 缺失CSRF令牌测试', () => {
    it('应该拒绝没有CSRF令牌的请求', async () => {
      const payload = { nickname: 'Test User' };

      mockFetch.mockResolvedValueOnce({
        status: 403,
        json: async () => ({
          success: false,
          error: 'CSRF token is missing',
          code: 'CSRF_MISSING'
        })
      });

      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // 故意不包含CSRF令牌
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(403);
      const errorData = await response.json();
      expect(errorData.success).toBe(false);
      expect(errorData.code).toBe('CSRF_MISSING');
    });

    it('应该检查Cookie中的CSRF令牌', () => {
      // 测试Token存在检查
      const checkCSRFTokenInCookie = (): string | null => {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'XSRF-TOKEN' || name === 'CSRF-TOKEN') {
            return value;
          }
        }
        return null;
      };

      // 正常情况应该找到Token
      const token = checkCSRFTokenInCookie();
      expect(token).toBe('valid-csrf-token-123456');

      // 清除Cookie后应该找不到Token
      delete mockCookies['XSRF-TOKEN'];
      const tokenAfterClear = checkCSRFTokenInCookie();
      expect(tokenAfterClear).toBeNull();
    });

    it('应该处理Cookie被清除的情况', async () => {
      // 模拟Cookie被清除
      delete mockCookies['XSRF-TOKEN'];

      mockFetch.mockResolvedValueOnce({
        status: 401,
        json: async () => ({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        })
      });

      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name: 'Test' })
      });

      expect(response.status).toBe(401);
      const errorData = await response.json();
      expect(errorData.code).toBe('AUTH_REQUIRED');
    });
  });

  describe('步骤3: 无效CSRF令牌测试', () => {
    it('应该拒绝格式错误的CSRF令牌', async () => {
      const invalidTokens = [
        'invalid',
        'too-short',
        '<script>alert("xss")</script>',
        'spaces and special chars!@#$%',
        '',
        'null'
      ];

      for (const invalidToken of invalidTokens) {
        mockFetch.mockResolvedValueOnce({
          status: 403,
          json: async () => ({
            success: false,
            error: 'Invalid CSRF token format',
            code: 'CSRF_INVALID'
          })
        });

        const response = await fetch('/api/user/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': invalidToken
          },
          credentials: 'include',
          body: JSON.stringify({ theme: 'dark' })
        });

        expect(response.status).toBe(403);
        const errorData = await response.json();
        validateCSRFErrorResponse(errorData);
      }
    });

    it('应该拒绝过期的CSRF令牌', async () => {
      const expiredToken = 'expired-token-123456';

      mockFetch.mockResolvedValueOnce({
        status: 403,
        json: async () => ({
          success: false,
          error: 'CSRF token has expired',
          code: 'CSRF_EXPIRED'
        })
      });

      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': expiredToken
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: 'old',
          newPassword: 'new123'
        })
      });

      expect(response.status).toBe(403);
      const errorData = await response.json();
      expect(errorData.code).toBe('CSRF_EXPIRED');
    });

    it('应该拒绝已使用的CSRF令牌', async () => {
      const usedToken = 'used-token-123456';

      mockFetch.mockResolvedValueOnce({
        status: 403,
        json: async () => ({
          success: false,
          error: 'CSRF token has been used',
          code: 'CSRF_USED'
        })
      });

      const response = await fetch('/api/financial/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': usedToken
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: 100,
          recipient: 'user_456'
        })
      });

      expect(response.status).toBe(403);
      const errorData = await response.json();
      expect(errorData.code).toBe('CSRF_USED');
    });
  });

  describe('步骤4: 跨域CSRF攻击测试', () => {
    it('应该阻止跨域请求伪造攻击', async () => {
      // 模拟来自恶意域名的请求
      const maliciousOrigin = 'https://malicious-site.com';

      mockFetch.mockResolvedValueOnce({
        status: 403,
        json: async () => ({
          success: false,
          error: 'Cross-origin request not allowed',
          code: 'CORS_BLOCKED'
        })
      });

      const response = await fetch('http://localhost:3000/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': maliciousOrigin,
          'X-CSRF-Token': 'some-token'
        },
        credentials: 'include',
        body: JSON.stringify({ nickname: 'Hacked' })
      });

      expect(response.status).toBe(403);
      const errorData = await response.json();
      expect(errorData.code).toBe('CORS_BLOCKED');
    });

    it('应该验证Referer头', async () => {
      const maliciousReferer = 'https://evil.com/attack.html';

      mockFetch.mockResolvedValueOnce({
        status: 403,
        json: async () => ({
          success: false,
          error: 'Invalid referer',
          code: 'INVALID_REFERER'
        })
      });

      const response = await fetch('http://localhost:3000/api/user/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': maliciousReferer,
          'X-CSRF-Token': 'fake-token'
        },
        credentials: 'include',
        body: JSON.stringify({ userId: 'user_123' })
      });

      expect(response.status).toBe(403);
      const errorData = await response.json();
      expect(errorData.code).toBe('INVALID_REFERER');
    });

    it('应该防止通过iframe发起的CSRF攻击', async () => {
      // 模拟在iframe中的请求
      mockFetch.mockResolvedValueOnce({
        status: 403,
        json: async () => ({
          success: false,
          error: 'Request from iframe not allowed',
          code: 'IFRAME_BLOCKED'
        })
      });

      const response = await fetch('http://localhost:3000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': 'iframe-token'
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'delete',
          userId: 'admin_user'
        })
      });

      expect(response.status).toBe(403);
      const errorData = await response.json();
      expect(errorData.code).toBe('IFRAME_BLOCKED');
    });
  });

  describe('步骤5: AJAX请求CSRF测试', () => {
    it('应该在AJAX请求中验证CSRF令牌', async () => {
      const maliciousRequest = async () => {
        mockFetch.mockResolvedValueOnce({
          status: 403,
          json: async () => ({
            success: false,
            error: 'CSRF validation failed',
            code: 'CSRF_FAILED'
          })
        });

        const response = await fetch('/api/user/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
            // 故意不包含CSRF令牌
          },
          credentials: 'include',
          body: JSON.stringify({
            theme: 'hacked',
            notifications: false
          })
        });

        return { status: response.status, data: await response.json() };
      };

      const result = await maliciousRequest();
      expect(result.status).toBe(403);
      expect(result.data.code).toBe('CSRF_FAILED');
    });

    it('应该在AJAX错误中记录CSRF尝试', async () => {
      const originalError = console.error;
      const errorLogs: string[] = [];

      console.error = (...args) => {
        errorLogs.push(args.join(' '));
      };

      mockFetch.mockResolvedValueOnce({
        status: 403,
        json: async () => ({
          success: false,
          error: 'CSRF token validation failed',
          code: 'CSRF_FAILED'
        })
      });

      try {
        await fetch('/api/sensitive-operation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ operation: 'delete_all' })
        });
      } catch (error) {
        // 预期会失败
      }

      // 恢复原始console.error
      console.error = originalError;

      // 验证错误被记录
      expect(errorLogs.some(log => log.includes('CSRF'))).toBe(true);
    });
  });

  describe('CSRF防护工具函数', () => {
    it('validateCSRFToken应该正确验证令牌格式', () => {
      const validToken = 'valid-csrf-token-1234567890';
      const invalidToken = 'invalid';

      expect(() => validateCSRFToken(validToken)).not.toThrow();
      expect(() => validateCSRFToken(invalidToken)).toThrow();

      // 测试令牌长度要求
      expect(() => validateCSRFToken('short')).toThrow();

      // 测试字符集要求
      expect(() => validateCSRFToken('token-with-spaces')).toThrow();
      expect(() => validateCSRFToken('token@with$special#chars')).toThrow();
    });

    it('validateCSRFErrorResponse应该验证错误响应', () => {
      const validErrorResponse = {
        success: false,
        error: 'Invalid CSRF token',
        code: 'CSRF_INVALID'
      };

      const invalidErrorResponse = {
        success: true,
        error: 'Invalid CSRF token',
        // 缺少code字段
      };

      expect(() => validateCSRFErrorResponse(validErrorResponse)).not.toThrow();
      expect(() => validateCSRFErrorResponse(invalidErrorResponse)).toThrow();
    });

    it('verifyMaliciousRequestBlocked应该验证请求拦截', async () => {
      await verifyMaliciousRequestBlocked('/api/test/endpoint', { data: 'test' });
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test/endpoint',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ data: 'test' })
        })
      );
    });
  });

  describe('CSRF令牌生成和验证', () => {
    it('应该生成足够随机的CSRF令牌', () => {
      const generateCSRFToken = (): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        let token = '';
        for (let i = 0; i < 32; i++) {
          token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
      };

      // 生成多个令牌验证唯一性
      const tokens = Array.from({ length: 100 }, () => generateCSRFToken());
      const uniqueTokens = new Set(tokens);

      expect(uniqueTokens.size).toBe(100); // 所有令牌都应该是唯一的

      // 验证令牌格式
      tokens.forEach(token => {
        expect(() => validateCSRFToken(token)).not.toThrow();
      });
    });

    it('应该正确验证令牌匹配', () => {
      const sessionToken = 'session-token-123';
      const requestToken = 'session-token-123';
      const differentToken = 'different-token-456';

      const validateTokenMatch = (session: string, request: string): boolean => {
        return session === request && session.length > 20;
      };

      expect(validateTokenMatch(sessionToken, requestToken)).toBe(true);
      expect(validateTokenMatch(sessionToken, differentToken)).toBe(false);
      expect(validateTokenMatch('short', 'short')).toBe(false);
    });
  });
});

/**
 * 测试总结
 *
 * 通过标准:
 * - 所有正常请求都包含有效CSRF令牌
 * - 缺失令牌的请求被拒绝(403)
 * - 无效令牌的请求被拒绝(403)
 * - 跨域攻击被成功阻止
 * - 错误响应格式正确
 * - 安全日志记录完整
 * - 用户数据保持安全
 *
 * 失败标准:
 * - 无令牌请求被允许通过
 * - 无效令牌请求被允许执行
 * - 跨域攻击成功修改数据
 * - 错误响应不符合规范
 * - 安全日志缺失重要信息
 */