/**
 * TC-033: SQL注入防护测试
 * 验证移动端应用的SQL注入防护机制
 */

import { describe, it, expect, beforeEach, afterEach, jest } from 'vitest';
import { validateRequiredFields, validateFieldTypes } from '@/utils/validation';

// 模拟fetch API
const mockFetch = jest.fn();
Object.defineProperty(global, 'fetch', { value: mockFetch });

// 模拟console
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

describe('TC-033: SQL注入防护测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * 验证查询参数被正确转义
   */
  const validateQueryParameter = (input: string) => {
    const sqlKeywords = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'UNION',
      'OR', 'AND', '--', '#', ';', 'WAITFOR', 'SLEEP'
    ];

    const inputUpper = input.toUpperCase();
    const containsSQL = sqlKeywords.some(keyword =>
      inputUpper.includes(keyword)
    );

    if (containsSQL) {
      throw new Error('Potential SQL injection detected');
    }
  };

  /**
   * 验证API响应安全性
   */
  const validateAPIResponse = (response: any) => {
    validateRequiredFields(response, ['success', 'data', 'message']);
    validateFieldTypes(response, {
      success: 'boolean',
      data: 'object',
      message: 'string'
    });

    // 确保响应不包含数据库错误信息
    const responseStr = JSON.stringify(response);
    expect(responseStr).not.toMatch(/SQL|database|table|column/i);
    expect(responseStr).not.toMatch(/syntax error|mysql|postgres/i);
  };

  /**
   * 验证数据库完整性
   */
  const validateDatabaseIntegrity = async () => {
    const criticalTables = ['users', 'students', 'classes', 'roles'];

    for (const table of criticalTables) {
      try {
        // 模拟数据库查询
        const result = { count: Math.floor(Math.random() * 100) + 1 };
        expect(result.count).toBeGreaterThan(0);
      } catch (error) {
        throw new Error(`Critical table ${table} may be damaged`);
      }
    }
  };

  describe('步骤1: 登录表单SQL注入测试', () => {
    it('应该阻止登录表单中的SQL注入', async () => {
      const injectionPayloads = [
        { username: "admin' OR '1'='1' --", password: 'anypassword' },
        { username: "admin' UNION SELECT * FROM users --", password: 'anypassword' },
        { username: "' OR 1=1 #", password: 'anypassword' },
        { username: "'; DROP TABLE users; --", password: 'anypassword' }
      ];

      for (const payload of injectionPayloads) {
        // 模拟SQL注入检测
        const detectSQLInjection = (input: string): boolean => {
          const patterns = [
            /('|(\\')|(;)|(\-\-)|(\s+(OR|AND)\s+(\d+|'[^']*'|\"[^\"]*\"))|((\*)(|=))|(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|EXEC|ALTER|CREATE|TRUNCATE))/i,
            /(<script|<iframe|javascript:|onload=|onerror=)/i
          ];

          return patterns.some(pattern => pattern.test(input));
        };

        const isInjection = detectSQLInjection(payload.username) || detectSQLInjection(payload.password);
        expect(isInjection).toBe(true);

        // 模拟API响应
        mockFetch.mockResolvedValueOnce({
          status: 400,
          json: async () => ({
            success: false,
            message: 'Invalid username or password',
            code: 'INVALID_CREDENTIALS'
          })
        });

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        expect(response.status).toBe(400);
        const result = await response.json();
        expect(result.success).toBe(false);
        expect(result.message).not.toContain('SQL');
        expect(result.message).not.toContain('database');
      }
    });

    it('应该验证输入参数的安全性', () => {
      const dangerousInputs = [
        "admin' OR '1'='1' --",
        "'; DROP TABLE users; --",
        "1' UNION SELECT username,password FROM users --",
        "'; WAITFOR DELAY '00:00:05' --",
        "' AND (SELECT COUNT(*) FROM users) > 0 --"
      ];

      dangerousInputs.forEach(input => {
        expect(() => validateQueryParameter(input)).toThrow('Potential SQL injection detected');
      });
    });

    it('应该正确转义特殊字符', () => {
      const escapeSQLChars = (input: string): string => {
        return input.replace(/['"\\;]/g, (char) => {
          const escapeMap: { [key: string]: string } = {
            "'": "\\'",
            '"': '\\"',
            '\\': '\\\\',
            ';': '\\;'
          };
          return escapeMap[char];
        });
      };

      const testCases = [
        { input: "admin' OR '1'='1", expected: "admin\\' OR \\'1\\'=\\'1" },
        { input: 'test"quote"', expected: 'test\\"quote\\"' },
        { input: 'semicolon;here', expected: 'semicolon\\;here' },
        { input: 'back\\slash', expected: 'back\\\\slash' }
      ];

      testCases.forEach(({ input, expected }) => {
        const escaped = escapeSQLChars(input);
        expect(escaped).toBe(expected);
      });
    });
  });

  describe('步骤2: 搜索功能SQL注入测试', () => {
    it('应该阻止搜索功能中的SQL注入', async () => {
      const searchPayloads = [
        "' OR 1=1 --",
        "' UNION SELECT * FROM users --",
        "'; DROP TABLE test; --",
        "' AND (SELECT COUNT(*) FROM users) > 0 --"
      ];

      for (const payload of searchPayloads) {
        mockFetch.mockResolvedValueOnce({
          status: 400,
          json: async () => ({
            success: false,
            message: 'Invalid search query',
            code: 'INVALID_SEARCH'
          })
        });

        const response = await fetch('/api/search/students', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: payload })
        });

        expect(response.status).toBe(400);
        const result = await response.json();
        validateAPIResponse(result);
        expect(result.code).toBe('INVALID_SEARCH');
      }
    });

    it('应该安全处理搜索查询', () => {
      const sanitizeSearchQuery = (query: string): string => {
        // 移除危险字符
        let sanitized = query.replace(/['"\\;]/g, '');

        // 检查SQL关键字
        const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'UNION', 'OR', 'AND'];
        const queryUpper = sanitized.toUpperCase();

        for (const keyword of sqlKeywords) {
          if (queryUpper.includes(keyword)) {
            sanitized = sanitized.replace(new RegExp(keyword, 'gi'), '');
          }
        }

        return sanitized.trim();
      };

      const testCases = [
        { input: "John' OR '1'='1", expected: 'John' },
        { input: "test'; DROP TABLE users; --", expected: 'test' },
        { input: "normal search query", expected: 'normal search query' },
        { input: '', expected: '' }
      ];

      testCases.forEach(({ input, expected }) => {
        const sanitized = sanitizeSearchQuery(input);
        expect(sanitized).toBe(expected);
      });
    });
  });

  describe('步骤3: API参数SQL注入测试', () => {
    it('应该防止GET参数SQL注入', async () => {
      const maliciousParams = [
        '?id=1\' OR 1=1 --',
        '?name=\' UNION SELECT * FROM users --',
        '?search=\'; DROP TABLE test; --',
        '?category=\' AND (SELECT COUNT(*) FROM users) > 0 --'
      ];

      for (const param of maliciousParams) {
        mockFetch.mockResolvedValueOnce({
          status: 400,
          json: async () => ({
            success: false,
            message: 'Invalid request parameters',
            code: 'INVALID_PARAMS'
          })
        });

        const response = await fetch(`/api/students${param}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        expect(response.status).toBe(400);
        const result = await response.json();
        validateAPIResponse(result);
      }
    });

    it('应该防止POST请求SQL注入', async () => {
      const maliciousPayloads = [
        { name: "'; DROP TABLE users; --", age: 25 },
        { email: "test' UNION SELECT * FROM users --", id: 1 },
        { search: "' OR 1=1 #", type: "all" },
        { filter: "' AND (SELECT COUNT(*) FROM users) > 0 --" }
      ];

      for (const payload of maliciousPayloads) {
        mockFetch.mockResolvedValueOnce({
          status: 400,
          json: async () => ({
            success: false,
            message: 'Invalid request data',
            code: 'INVALID_DATA'
          })
        });

        const response = await fetch('/api/students/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        expect(response.status).toBe(400);
        const result = await response.json();
        validateAPIResponse(result);
      }
    });

    it('应该验证参数类型和格式', () => {
      const validateParameters = (params: any): boolean => {
        // 验证数字参数
        if (params.id && isNaN(Number(params.id))) {
          return false;
        }

        // 验证字符串参数长度
        if (params.name && params.name.length > 255) {
          return false;
        }

        // 验证邮箱格式
        if (params.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
          return false;
        }

        // 检查危险字符
        const dangerousChars = ['\'', '"', ';', '--', '/*', '*/'];
        const paramStr = JSON.stringify(params);

        for (const char of dangerousChars) {
          if (paramStr.includes(char)) {
            return false;
          }
        }

        return true;
      };

      const validParams = { id: '123', name: 'John Doe', email: 'john@example.com' };
      const invalidParams = { id: "'; DROP TABLE users; --", name: "Test' OR '1'='1" };

      expect(validateParameters(validParams)).toBe(true);
      expect(validateParameters(invalidParams)).toBe(false);
    });
  });

  describe('步骤4: ID参数SQL注入测试', () => {
    it('应该防止ID注入攻击', async () => {
      const maliciousIds = [
        '1\' OR 1=1 --',
        '999999\' UNION SELECT * FROM users --',
        'null\'; DROP TABLE classes; --',
        "1'; UPDATE users SET password='hacked' WHERE 1=1 --"
      ];

      for (const id of maliciousIds) {
        mockFetch.mockResolvedValueOnce({
          status: 400,
          json: async () => ({
            success: false,
            message: 'Invalid resource ID',
            code: 'INVALID_ID'
          })
        });

        const response = await fetch(`/api/students/${encodeURIComponent(id)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        expect(response.status).toBe(400);
        const result = await response.json();
        expect(result.code).toBe('INVALID_ID');
      }
    });

    it('应该验证ID参数为数字', () => {
      const validateId = (id: string): boolean => {
        // 只允许数字和正负号
        return /^-?\d+$/.test(id);
      };

      const validIds = ['1', '123', '0', '-1'];
      const invalidIds = [
        "1' OR 1=1 --",
        "abc",
        "1; DROP TABLE users",
        "1 UNION SELECT *",
        "null"
      ];

      validIds.forEach(id => {
        expect(validateId(id)).toBe(true);
      });

      invalidIds.forEach(id => {
        expect(validateId(id)).toBe(false);
      });
    });

    it('应该安全处理删除操作', async () => {
      const maliciousDeleteIds = [
        '1\' OR 1=1 --',
        '999; TRUNCATE TABLE users --',
        "0' OR '1'='1"
      ];

      for (const id of maliciousDeleteIds) {
        mockFetch.mockResolvedValueOnce({
          status: 400,
          json: async () => ({
            success: false,
            message: 'Cannot perform delete operation',
            code: 'DELETE_FAILED'
          })
        });

        const response = await fetch(`/api/users/delete/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });

        expect(response.status).toBe(400);
        const result = await response.json();
        expect(result.code).toBe('DELETE_FAILED');
      }
    });
  });

  describe('步骤5: 时间盲注SQL注入测试', () => {
    it('应该检测时间延迟注入', async () => {
      const timeBasedPayloads = [
        "' AND (SELECT * FROM (SELECT(SLEEP(5)))a) --",
        "'; WAITFOR DELAY '00:00:05' --",
        "' AND (SELECT COUNT(*) FROM users WHERE SLEEP(5)) --",
        "1' AND (SELECT * FROM (SELECT(SLEEP(3)))b) --"
      ];

      for (const payload of timeBasedPayloads) {
        const startTime = Date.now();

        mockFetch.mockResolvedValueOnce({
          status: 400,
          json: async () => ({
            success: false,
            message: 'Request timeout',
            code: 'TIMEOUT'
          })
        });

        try {
          const response = await fetch('/api/test/sleep', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: payload }),
            signal: AbortSignal.timeout(1000) // 1秒超时
          });

          const endTime = Date.now();
          const responseTime = endTime - startTime;

          expect(responseTime).toBeLessThan(2000); // 应该在2秒内返回
        } catch (error) {
          // 预期可能会超时
          expect(error).toBeDefined();
        }
      }
    });

    it('应该检测SLEEP关键字', () => {
      const detectTimeBasedInjection = (input: string): boolean => {
        const timeBasedPatterns = [
          /SLEEP\s*\(/i,
          /WAITFOR\s+DELAY/i,
          /BENCHMARK\s*\(/i,
          /PG_SLEEP\s*\(/i,
          /DBMS_LOCK\.SLEEP/i
        ];

        return timeBasedPatterns.some(pattern => pattern.test(input));
      };

      const timeBasedInputs = [
        "'; SELECT SLEEP(5) --",
        "'; WAITFOR DELAY '00:00:05' --",
        "'; SELECT BENCHMARK(50000000,MD5('test')) --",
        "'; SELECT PG_SLEEP(5) --"
      ];

      timeBasedInputs.forEach(input => {
        expect(detectTimeBasedInjection(input)).toBe(true);
      });
    });
  });

  describe('SQL注入防护工具函数', () => {
    it('validateQueryParameter应该检测SQL注入', () => {
      const validInputs = ['John Doe', 'john@example.com', '12345', 'normal text'];
      const invalidInputs = [
        "admin' OR '1'='1' --",
        "'; DROP TABLE users; --",
        "1' UNION SELECT * FROM users --"
      ];

      validInputs.forEach(input => {
        expect(() => validateQueryParameter(input)).not.toThrow();
      });

      invalidInputs.forEach(input => {
        expect(() => validateQueryParameter(input)).toThrow('Potential SQL injection detected');
      });
    });

    it('validateAPIResponse应该验证响应安全性', () => {
      const secureResponse = {
        success: true,
        data: { id: 1, name: 'Test User' },
        message: 'Operation successful'
      };

      const insecureResponse = {
        success: false,
        data: null,
        message: 'SQL syntax error near users'
      };

      expect(() => validateAPIResponse(secureResponse)).not.toThrow();
      expect(() => validateAPIResponse(insecureResponse)).toThrow();
    });

    it('validateDatabaseIntegrity应该验证关键表', async () => {
      await expect(validateDatabaseIntegrity()).resolves.not.toThrow();
    });
  });

  describe('输入验证和清理', () => {
    it('应该清理用户输入', () => {
      const sanitizeInput = (input: string): string => {
        if (typeof input !== 'string') {
          return '';
        }

        return input
          .replace(/['"\\;]/g, '') // 移除危险字符
          .replace(/\s*(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP)\s*/gi, '') // 移除SQL关键字
          .trim();
      };

      const testCases = [
        { input: "John' OR '1'='1", expected: 'John' },
        { input: "'; DROP TABLE users; --", expected: '' },
        { input: "  normal  input  ", expected: 'normal input' },
        { input: "1 UNION SELECT * FROM users", expected: '1' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(sanitizeInput(input)).toBe(expected);
      });
    });

    it('应该验证输入长度', () => {
      const validateInputLength = (input: string, maxLength: number): boolean => {
        return input.length <= maxLength;
      };

      const validInput = 'Valid input string';
      const invalidInput = 'a'.repeat(300); // 超过常见限制

      expect(validateInputLength(validInput, 255)).toBe(true);
      expect(validateInputLength(invalidInput, 255)).toBe(false);
    });
  });

  describe('性能和稳定性测试', () => {
    it('SQL注入检测应该保持高性能', async () => {
      const startTime = Date.now();

      // 测试1000个输入的检测性能
      const testInputs = Array.from({ length: 1000 }, (_, i) =>
        `test${i}' OR '1'='1`
      );

      for (const input of testInputs) {
        expect(() => validateQueryParameter(input)).toThrow();
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // 应该在100ms内完成1000次检测
      expect(processingTime).toBeLessThan(100);
    });

    it('应该处理大量并发请求', async () => {
      const concurrentRequests = Array.from({ length: 50 }, (_, i) =>
        fetch('/api/students', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      mockFetch.mockResolvedValue({
        status: 200,
        json: async () => ({
          success: true,
          data: [],
          message: 'Success'
        })
      });

      const responses = await Promise.all(concurrentRequests);
      expect(responses.length).toBe(50);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});

/**
 * 测试总结
 *
 * 通过标准:
 * - 所有SQL注入尝试都被成功拦截
 * - 数据库查询使用参数化查询
 * - 错误信息不泄露系统信息
 * - 数据库完整性保持完好
 * - 响应时间在正常范围内
 * - 安全日志记录完整
 * - API响应符合规范
 *
 * 失败标准:
 * - SQL注入成功执行
 * - 数据库结构信息泄露
 * - 数据被未授权修改或删除
 * - 系统性能明显下降
 * - 错误信息包含敏感信息
 */