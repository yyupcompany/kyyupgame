// Jest 测试环境设置
process.env.NODE_ENV = 'test';

// 设置测试超时时间
jest.setTimeout(30000);

// 禁用axios的序列化警告，避免循环引用问题
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && args[0].includes && args[0].includes('circular')) {
    return; // 忽略循环引用警告
  }
  originalConsoleWarn(...args);
};

// 全局测试配置
global.testConfig = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  testUsers: {
    admin: {
      username: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    },
    teacher: {
      username: 'teacher@test.com',
      password: 'teacher123',
      role: 'teacher'
    },
    parent: {
      username: 'parent@test.com',
      password: 'parent123',
      role: 'parent'
    }
  }
};

// 测试数据清理
afterEach(async () => {
  // 每个测试后的清理逻辑
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

// 模拟控制台输出，避免测试时过多输出
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: originalConsole.error // 保留错误输出
};