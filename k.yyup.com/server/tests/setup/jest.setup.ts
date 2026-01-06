/**
 * Jest测试环境设置
 */

import { config } from 'dotenv';

// 加载测试环境变量
config({ path: '.env.test' });

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.TEST_DATABASE_NAME = 'kindergarten_test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.TEST_JWT_SECRET = 'test-jwt-secret-key';

// 设置测试超时
jest.setTimeout(30000);

// 全局测试钩子
beforeAll(async () => {
  console.log('🚀 开始API集成测试...');
});

afterAll(async () => {
  console.log('✅ API集成测试完成');
});

// 每个测试前的清理
beforeEach(() => {
  // 清理控制台输出（可选）
  if (process.env.SILENT_TESTS === 'true') {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  }
});

afterEach(() => {
  // 恢复控制台输出
  if (process.env.SILENT_TESTS === 'true') {
    jest.restoreAllMocks();
  }
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// 扩展Jest匹配器
expect.extend({
  toBeValidApiResponse(received) {
    const pass = received && 
                 typeof received === 'object' &&
                 received.hasOwnProperty('success') &&
                 typeof received.success === 'boolean';

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid API response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid API response with 'success' property`,
        pass: false,
      };
    }
  },

  toHaveValidTimestamp(received) {
    const pass = received && 
                 typeof received === 'string' &&
                 !isNaN(Date.parse(received));

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid timestamp`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid timestamp`,
        pass: false,
      };
    }
  },

  toHaveValidPagination(received) {
    const pass = received &&
                 typeof received === 'object' &&
                 received.hasOwnProperty('page') &&
                 received.hasOwnProperty('limit') &&
                 received.hasOwnProperty('total') &&
                 typeof received.page === 'number' &&
                 typeof received.limit === 'number' &&
                 typeof received.total === 'number' &&
                 received.page > 0 &&
                 received.limit > 0 &&
                 received.total >= 0;

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to have valid pagination`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to have valid pagination (page, limit, total)`,
        pass: false,
      };
    }
  },

  toBeValidJWT(received) {
    const pass = received &&
                 typeof received === 'string' &&
                 received.split('.').length === 3;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid JWT token`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid JWT token`,
        pass: false,
      };
    }
  },

  toHaveValidUserStructure(received) {
    const requiredFields = ['id', 'username', 'email', 'role'];
    const forbiddenFields = ['password', 'password_hash'];
    
    const hasRequiredFields = requiredFields.every(field => received.hasOwnProperty(field));
    const hasForbiddenFields = forbiddenFields.some(field => received.hasOwnProperty(field));
    
    const pass = received &&
                 typeof received === 'object' &&
                 hasRequiredFields &&
                 !hasForbiddenFields;

    if (pass) {
      return {
        message: () => `expected user object not to have valid structure`,
        pass: true,
      };
    } else {
      const missingFields = requiredFields.filter(field => !received.hasOwnProperty(field));
      const presentForbiddenFields = forbiddenFields.filter(field => received.hasOwnProperty(field));
      
      let message = `expected user object to have valid structure.`;
      if (missingFields.length > 0) {
        message += ` Missing fields: ${missingFields.join(', ')}.`;
      }
      if (presentForbiddenFields.length > 0) {
        message += ` Should not contain: ${presentForbiddenFields.join(', ')}.`;
      }
      
      return {
        message: () => message,
        pass: false,
      };
    }
  }
});

// 声明自定义匹配器类型
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidApiResponse(): R;
      toHaveValidTimestamp(): R;
      toHaveValidPagination(): R;
      toBeValidJWT(): R;
      toHaveValidUserStructure(): R;
    }
  }
}

export {};
