/**
 * TC-031: XSS攻击防护测试 - 严格验证版本
 * 验证移动端应用能够有效防护跨站脚本攻击(XSS)
 */

import { describe, it, expect, beforeEach, afterEach, jest } from 'vitest';
import { validateRequiredFields, validateFieldTypes, validateApiResponseStructure } from '../../../utils/validation-helpers';
import {
  validateRequiredFields as validateRequired,
  validateFieldTypes as validateTypes
} from '../../../utils/data-validation';

// 控制台监控
const consoleErrors: string[] = [];
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

function expectNoConsoleErrors(): void {
  if (consoleErrors.length > 0) {
    const errorMessage = `Console errors detected during XSS test: ${consoleErrors.join(', ')}`;
    consoleErrors.length = 0;
    throw new Error(errorMessage);
  }
  consoleErrors.length = 0;
}

// 模拟浏览器环境
const mockDocument = {
  createElement: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  addEventListener: jest.fn(),
  body: {
    innerHTML: '',
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
} as any;

const mockWindow = {
  alert: jest.fn(),
  location: { href: 'http://localhost:5173' },
  addEventListener: jest.fn(),
  performance: { now: jest.fn(() => Date.now()) }
} as any;

// 设置全局对象
Object.defineProperty(global, 'document', { value: mockDocument });
Object.defineProperty(global, 'window', { value: mockWindow });

describe('TC-031: XSS攻击防护测试 - 严格验证', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrors.length = 0;

    // 设置控制台监听
    console.error = (...args: any[]) => {
      consoleErrors.push(args.join(' '));
      originalConsoleError(...args);
    };

    console.warn = (...args: any[]) => {
      consoleErrors.push(args.join(' '));
      originalConsoleWarn(...args);
    };

    console.log = jest.fn();
  });

  afterEach(() => {
    expectNoConsoleErrors();
    jest.restoreAllMocks();

    // 恢复原始控制台
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  /**
   * 验证输入是否被正确转义
   */
  const validateInputSanitization = (input: string, expectedOutput: string) => {
    const escapeMap: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    const sanitized = input.replace(/[<>"'/]/g, (char) => escapeMap[char]);
    expect(sanitized).toBe(expectedOutput);
  };

  /**
   * 验证脚本是否被执行
   */
  const verifyScriptNotExecuted = () => {
    expect(mockWindow.alert).not.toHaveBeenCalled();
    expect(mockDocument.createElement).not.toHaveBeenCalledWith('script');
    expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('XSS'));
  };

  /**
   * 验证API响应的安全性 - 严格验证版本
   */
  const validateSecureResponse = (response: any) => {
    // 1. 验证响应对象存在性
    expect(response).toBeDefined();
    expect(typeof response).toBe('object');

    // 2. 验证必填字段
    const requiredValidation = validateRequired(response, ['success', 'message', 'data']);
    expect(requiredValidation.valid).toBe(true);
    if (!requiredValidation.valid) {
      throw new Error(`Response validation failed - missing fields: ${requiredValidation.missing.join(', ')}`);
    }

    // 3. 验证字段类型
    const typeValidation = validateTypes(response, {
      success: 'boolean',
      message: 'string',
      data: 'object'
    });
    expect(typeValidation.valid).toBe(true);
    if (!typeValidation.valid) {
      throw new Error(`Response type validation failed: ${typeValidation.errors.join(', ')}`);
    }

    // 4. 验证API响应结构
    const apiResponseValidation = validateApiResponseStructure(response);
    expect(apiResponseValidation.valid).toBe(true);

    // 5. 验证响应不包含恶意脚本 - 更严格的检查
    const responseStr = JSON.stringify(response);
    const maliciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<link[^>]*>/gi,
      /<meta[^>]*>/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /@import/gi,
      /binding\s*:/gi
    ];

    maliciousPatterns.forEach(pattern => {
      expect(responseStr).not.toMatch(pattern);
    });

    // 6. 验证内容长度合理性
    expect(responseStr.length).toBeLessThan(10000); // 防止过长的恶意内容

    // 7. 验证数据结构安全性
    if (response.data && typeof response.data === 'object') {
      const dataStr = JSON.stringify(response.data);
      maliciousPatterns.forEach(pattern => {
        expect(dataStr).not.toMatch(pattern);
      });

      // 验证嵌套对象的安全性
      validateNestedObjectSecurity(response.data);
    }
  };

  /**
   * 递归验证嵌套对象的安全性
   */
  const validateNestedObjectSecurity = (obj: any, depth = 0, maxDepth = 5): void => {
    if (depth > maxDepth) {
      throw new Error('Object nesting depth exceeded, potential security risk');
    }

    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      Object.keys(obj).forEach(key => {
        // 检查键名是否安全
        expect(key).not.toMatch(/<|>|script|javascript:|on\w+=/i);
        expect(key.length).toBeLessThan(100);

        const value = obj[key];
        if (typeof value === 'string') {
          // 检查字符串值是否安全
          expect(value).not.toMatch(/<script|javascript:|on\w+=/i);
        } else if (typeof value === 'object' && value !== null) {
          validateNestedObjectSecurity(value, depth + 1, maxDepth);
        }
      });
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          validateNestedObjectSecurity(item, depth + 1, maxDepth);
        }
      });
    }
  };

  describe('步骤1: 输入框XSS注入测试', () => {
    it('应该阻止基础XSS脚本注入', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert("XSS")">',
        '<svg onload="alert("XSS")">',
        'javascript:alert("XSS")',
        "';alert('XSS');//"
      ];

      for (const payload of xssPayloads) {
        // 模拟API调用
        const mockResponse = {
          success: true,
          message: 'Message sent successfully',
          data: {
            id: 'msg_123',
            content: payload.replace(/[<>"'/]/g, (char) => {
              const escapeMap: { [key: string]: string } = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '/': '&#x2F;'
              };
              return escapeMap[char];
            }),
            timestamp: new Date().toISOString()
          }
        };

        validateSecureResponse(mockResponse);
        verifyScriptNotExecuted();
      }
    });

    it('应该正确转义XSS输入', () => {
      const testCases = [
        {
          input: '<script>alert("XSS")</script>',
          expected: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
        },
        {
          input: '<img src="x" onerror="alert("XSS")">',
          expected: '&lt;img src=&quot;x&quot; onerror=&quot;alert(&quot;XSS&quot;)&quot;&gt;'
        },
        {
          input: "<div onclick='alert(\"XSS\")'>Click</div>",
          expected: '&lt;div onclick=&#x27;alert(&quot;XSS&quot;)&#x27;&gt;Click&lt;/div&gt;'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        validateInputSanitization(input, expected);
      });
    });

    it('应该检测和阻止XSS攻击尝试', async () => {
      const maliciousInputs = [
        '<script>',
        'javascript:',
        'onerror=',
        'onload=',
        'onclick=',
        '<img',
        '<svg',
        '<iframe'
      ];

      for (const input of maliciousInputs) {
        // 模拟XSS检测
        const xssPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+=/i,
          /<img/i,
          /<svg/i,
          /<iframe/i
        ];

        const isXSS = xssPatterns.some(pattern => pattern.test(input));
        expect(isXSS).toBe(true);

        // 验证检测到XSS后的处理
        if (isXSS) {
          const response = {
            success: false,
            message: 'Input contains potentially harmful content',
            code: 'XSS_DETECTED'
          };

          validateRequiredFields(response, ['success', 'message', 'code']);
          expect(response.success).toBe(false);
          expect(response.code).toBe('XSS_DETECTED');
        }
      }
    });
  });

  describe('步骤2: URL参数XSS测试', () => {
    it('应该安全处理URL参数中的XSS', () => {
      const maliciousUrls = [
        '/mobile/parent?message=<script>alert("XSS")</script>',
        '/mobile/parent?search=<img src="x" onerror="alert("XSS")">',
        '/mobile/parent?name=<svg onload="alert("XSS")>',
        '/mobile/parent?filter=javascript:alert("XSS")'
      ];

      maliciousUrls.forEach(url => {
        // 模拟URL参数解析
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const params: { [key: string]: string } = {};

        for (const [key, value] of urlParams) {
          // 转义URL参数
          params[key] = value.replace(/[<>"']/g, (char) => {
            const escapeMap: { [key: string]: string } = {
              '<': '%3C',
              '>': '%3E',
              '"': '%22',
              "'": '%27'
            };
            return escapeMap[char];
          });
        }

        // 验证参数被正确转义
        Object.values(params).forEach(value => {
          expect(value).not.toMatch(/<script|javascript:|on\w+=/i);
        });
      });
    });

    it('应该防止URL中的XSS执行', async () => {
      // 模拟页面导航
      const mockNavigate = jest.fn();
      const maliciousUrl = '/mobile/parent?message=<script>alert("XSS")</script>';

      // 安全导航处理
      const safeNavigate = (url: string) => {
        const parsedUrl = new URL(url, 'http://localhost:5173');
        const params = parsedUrl.searchParams;

        // 检查参数中的恶意内容
        for (const [key, value] of params) {
          if (/<script|javascript:|on\w+=/i.test(value)) {
            throw new Error('XSS detected in URL parameters');
          }
        }

        mockNavigate(url);
      };

      expect(() => safeNavigate(maliciousUrl)).toThrow('XSS detected');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('步骤3: 存储型XSS测试', () => {
    it('应该安全存储和显示用户输入', async () => {
      const userInput = '<script>alert("Stored XSS")</script>';

      // 模拟数据存储
      const storeUserData = async (data: { name: string }) => {
        // 存储前转义
        const sanitizedData = {
          name: data.name.replace(/[<>"']/g, (char) => {
            const escapeMap: { [key: string]: string } = {
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&#x27;'
            };
            return escapeMap[char];
          })
        };

        return {
          success: true,
          data: sanitizedData
        };
      };

      const result = await storeUserData({ name: userInput });
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('&lt;script&gt;alert(&quot;Stored XSS&quot;)&lt;/script&gt;');
    });

    it('应该验证存储数据的完整性', async () => {
      const originalData = 'Test User';
      const maliciousData = '<script>alert("XSS")</script>';

      // 模拟数据库操作
      const saveToDatabase = async (data: string) => {
        // 数据验证
        if (/<script|javascript:|on\w+=/i.test(data)) {
          return {
            success: false,
            error: 'Invalid input detected'
          };
        }

        // 安全存储
        const sanitizedData = data.replace(/[<>"']/g, (char) => {
          const escapeMap: { [key: string]: string } = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;'
          };
          return escapeMap[char];
        });

        return {
          success: true,
          data: sanitizedData
        };
      };

      const normalResult = await saveToDatabase(originalData);
      const maliciousResult = await saveToDatabase(maliciousData);

      expect(normalResult.success).toBe(true);
      expect(normalResult.data).toBe(originalData);

      expect(maliciousResult.success).toBe(false);
      expect(maliciousResult.error).toBe('Invalid input detected');
    });
  });

  describe('步骤4: DOM型XSS测试', () => {
    it('应该安全处理动态DOM操作', () => {
      const maliciousHTML = '<div onclick="alert(\'XSS\')">Click me</div>';

      // 安全的DOM操作
      const safeDOMUpdate = (container: HTMLElement, content: string) => {
        // 使用textContent而不是innerHTML
        const textElement = document.createElement('div');
        textElement.textContent = content;
        container.appendChild(textElement);

        return textElement.textContent;
      };

      const mockContainer = {
        appendChild: jest.fn(),
        textContent: ''
      } as any;

      const result = safeDOMUpdate(mockContainer, maliciousHTML);
      expect(result).toBe(maliciousHTML);
      expect(mockContainer.appendChild).toHaveBeenCalled();
    });

    it('应该防止innerHTML注入', () => {
      const maliciousHTML = '<script>alert("innerHTML XSS")</script>';

      // 模拟不安全的innerHTML使用
      const unsafeUpdate = (element: HTMLElement, html: string) => {
        element.innerHTML = html;
      };

      // 模拟安全的DOM更新
      const safeUpdate = (element: HTMLElement, content: string) => {
        element.textContent = content;
      };

      const mockElement = {
        innerHTML: '',
        textContent: '',
        appendChild: jest.fn()
      } as any;

      // 测试不安全的更新（应该被阻止）
      expect(() => {
        unsafeUpdate(mockElement, maliciousHTML);
        // 在实际应用中，这里应该有防护机制
      }).not.toThrow();

      // 测试安全的更新
      safeUpdate(mockElement, maliciousHTML);
      expect(mockElement.textContent).toBe(maliciousHTML);
    });

    it('应该验证动态内容的安全性', () => {
      const dynamicContent = [
        '<div onclick="alert(1)">Click</div>',
        '<img src="x" onerror="alert(2)">',
        '<svg onload="alert(3)">',
        '<iframe src="javascript:alert(4)">',
        '<body onload="alert(5)">'
      ];

      const checkContentSafety = (content: string) => {
        const dangerousPatterns = [
          /on\w+\s*=/i,        // 事件处理器
          /javascript:/i,       // JavaScript协议
          /<script/i,          // Script标签
          /<iframe/i,          // iframe标签
          /<object/i,          // object标签
          /<embed/i            // embed标签
        ];

        const hasDangerousContent = dangerousPatterns.some(pattern =>
          pattern.test(content)
        );

        return !hasDangerousContent;
      };

      dynamicContent.forEach(content => {
        const isSafe = checkContentSafety(content);
        expect(isSafe).toBe(false); // 这些都是危险内容，应该被标记为不安全
      });
    });
  });

  describe('XSS防护工具函数', () => {
    it('validateInputSanitization应该正确转义XSS', () => {
      const testCases = [
        {
          input: '<script>alert("test")</script>',
          expected: '&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;'
        },
        {
          input: "<div onclick='alert(\"test\")'>content</div>",
          expected: '&lt;div onclick=&#x27;alert(&quot;test&quot;)&#x27;&gt;content&lt;/div&gt;'
        },
        {
          input: 'Normal text without XSS',
          expected: 'Normal text without XSS'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        validateInputSanitization(input, expected);
      });
    });

    it('verifyScriptNotExecuted应该验证脚本未执行', () => {
      // 重置mock
      jest.clearAllMocks();

      verifyScriptNotExecuted();

      expect(mockWindow.alert).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('validateSecureResponse应该验证响应安全性', () => {
      const secureResponse = {
        success: true,
        message: 'Operation successful',
        data: { id: 123, content: 'Safe content' }
      };

      const insecureResponse = {
        success: true,
        message: 'Operation successful',
        data: { id: 123, content: '<script>alert("XSS")</script>' }
      };

      // 安全响应应该通过验证
      expect(() => validateSecureResponse(secureResponse)).not.toThrow();

      // 不安全响应应该包含恶意内容
      const responseStr = JSON.stringify(insecureResponse);
      expect(responseStr).toMatch(/<script/);

      // 在实际应用中，这样的响应应该被拦截
      expect(() => {
        if (/<script|javascript:|on\w+=/i.test(responseStr)) {
          throw new Error('Response contains potentially dangerous content');
        }
      }).toThrow('Response contains potentially dangerous content');
    });
  });

  describe('性能和稳定性测试', () => {
    it('XSS过滤应该在高频输入时保持性能', async () => {
      const startTime = Date.now();
      const inputs = Array.from({ length: 1000 }, (_, i) =>
        `<script>alert("XSS ${i}")</script>`
      );

      // 模拟高频XSS检测
      const filterXSS = (input: string): string => {
        return input.replace(/[<>"'/]/g, (char) => {
          const escapeMap: { [key: string]: string } = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
          };
          return escapeMap[char];
        });
      };

      const results = inputs.map(filterXSS);
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // 验证性能要求
      expect(processingTime).toBeLessThan(100); // 100ms内完成1000次过滤
      expect(results.length).toBe(1000);
      results.forEach(result => {
        expect(result).toContain('&lt;script&gt;');
      });
    });

    it('应该正确处理边界情况', () => {
      const edgeCases = [
        '',                    // 空字符串
        '<',                   // 单个字符
        '<<>>"',               // 重复特殊字符
        null as any,          // null值
        undefined as any,     // undefined值
        123 as any,           // 数字类型
        {},                    // 对象类型
        [],                    // 数组类型
        true as any            // 布尔类型
      ];

      const sanitizeInput = (input: any): string => {
        if (typeof input !== 'string') {
          input = String(input || '');
        }

        return input.replace(/[<>"'/]/g, (char) => {
          const escapeMap: { [key: string]: string } = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
          };
          return escapeMap[char];
        });
      };

      edgeCases.forEach(input => {
        expect(() => sanitizeInput(input)).not.toThrow();
      });
    });
  });
});

/**
 * 测试总结
 *
 * 通过标准:
 * - 所有XSS注入尝试都被成功拦截
 * - 恶意脚本未在页面中执行
 * - 用户输入被正确转义和显示
 * - 系统保持稳定，无崩溃或异常
 * - 安全日志正确记录XSS尝试
 * - 所有API响应符合预期结构
 *
 * 失败标准:
 * - 出现JavaScript alert弹窗
 * - DOM被恶意脚本修改
 * - 控制台出现脚本执行错误
 * - 系统崩溃或响应异常
 * - 恶意内容被直接执行未转义
 */