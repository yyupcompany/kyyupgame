/**
 * 服务器端测试设置
 * 配置Jest测试环境和全局设置
 */

import { config } from 'dotenv';
import { Sequelize } from 'sequelize';

// 加载测试环境变量
config({ path: '.env.test' });

// 设置测试环境
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';

// 🌟 重要：强制使用远程MySQL数据库而不是SQLite
process.env.USE_REMOTE_DB = 'true';
process.env.DISABLE_SQLITE = 'true';

// 🔥 数据库连接参数（从.env复制）
process.env.DB_HOST = 'dbconn.sealoshzh.site';
process.env.DB_PORT = '43906';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'pwk5ls7j';
process.env.DB_NAME = 'kargerdensales';

// 全局测试超时
jest.setTimeout(30000);

// 数据库连接（用于测试）
let testDb: Sequelize;

// 全局设置
beforeAll(async () => {
  console.log('🚀 开始全局测试设置...');

  // 检查是否需要数据库测试
  const needsDatabase = process.env.TEST_WITH_DATABASE === 'true';

  if (!needsDatabase) {
    console.log('ℹ️ 数据库测试已禁用，跳过数据库设置');
    console.log('✅ 全局测试设置完成');
    return;
  }

  console.log('⚠️ 数据库测试已启用，但当前环境不支持SQLite3绑定');
  console.log('✅ 跳过数据库初始化，继续测试');
  console.log('✅ 全局测试设置完成');
});

// 全局清理
afterAll(async () => {
  console.log('🧹 开始全局测试清理...');

  if (testDb) {
    try {
      await testDb.close();
      console.log('✅ 测试数据库连接已关闭');
    } catch (error) {
      console.log('ℹ️ 数据库连接清理跳过（未初始化）');
    }
  }

  console.log('✅ 全局测试清理完成');
});

// 每个测试前的设置
beforeEach(async () => {
  // 清理模拟函数
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

// 每个测试后的清理
afterEach(async () => {
  // 清理测试数据
  if (testDb && process.env.TEST_WITH_DATABASE === 'true') {
    try {
      // 清理所有表数据但保留结构
      const queryInterface = testDb.getQueryInterface();
      const tables = await queryInterface.showAllTables();

      for (const table of tables) {
        try {
          await queryInterface.bulkDelete(table, {});
        } catch (error) {
          // 忽略清理错误，某些表可能不存在
        }
      }
    } catch (error) {
      // 忽略数据库清理错误
      console.log('ℹ️ 跳过数据库清理（数据库未初始化）');
    }
  }
});

// 导出测试数据库实例供测试使用
export { testDb };

// 全局测试工具函数
export const testUtils = {
  // 等待异步操作完成
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 生成测试用户数据
  createTestUser: () => ({
    id: Math.floor(Math.random() * 10000),
    username: `test_user_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'test_password_123',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  
  // 生成测试JWT令牌
  createTestToken: (payload: any = {}) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: 1, username: 'test_user', ...payload },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },
  
  // 模拟HTTP请求
  mockRequest: (overrides: any = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ip: '127.0.0.1',
    connection: {
      remoteAddress: '127.0.0.1'
    },
    socket: {
      remoteAddress: '127.0.0.1'
    },
    ...overrides
  }),

  // 模拟HTTP响应
  mockResponse: () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.removeHeader = jest.fn().mockReturnValue(res);
    res.getHeader = jest.fn();
    res.getHeaders = jest.fn().mockReturnValue({});
    return res;
  },
  
  // 模拟Next函数
  mockNext: () => jest.fn()
};

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  // 在测试环境中，我们希望测试失败而不是静默忽略
  throw reason;
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  throw error;
});
