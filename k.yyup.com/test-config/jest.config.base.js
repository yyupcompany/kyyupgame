/**
 * Jest 基础配置文件
 * 为后端测试提供统一的配置基础
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 根目录
  rootDir: '../',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/server/tests/**/*.test.{js,ts}',
    '<rootDir>/server/tests/**/*.spec.{js,ts}'
  ],
  
  // 忽略的测试文件
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],
  
  // 模块文件扩展名
  moduleFileExtensions: ['js', 'json', 'ts'],
  
  // 转换配置
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  
  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/server/src/$1',
    '^@server/(.*)$': '<rootDir>/server/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  },
  
  // 设置文件
  setupFilesAfterEnv: [
    '<rootDir>/server/tests/global-setup.ts'
  ],
  
  // 全局设置
  globalSetup: '<rootDir>/server/tests/global-setup.ts',
  globalTeardown: '<rootDir>/server/tests/global-teardown.ts',
  
  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    'server/src/**/*.{js,ts}',
    '!server/src/**/*.d.ts',
    '!server/src/**/*.interface.ts',
    '!server/src/**/*.type.ts',
    '!server/src/**/*.enum.ts',
    '!server/src/**/*.constant.ts',
    '!server/src/database/migrations/**',
    '!server/src/database/seeders/**',
    '!server/src/config/**',
    '!server/src/types/**',
    '!server/src/interfaces/**',
    '!server/src/enums/**',
    '!server/src/constants/**',
    '!server/src/utils/logger.ts',
    '!server/src/app.ts',
    '!server/src/server.ts'
  ],
  
  // 覆盖率阈值 - 100%目标
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  
  // 覆盖率报告
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'json-summary'
  ],
  
  // 覆盖率输出目录
  coverageDirectory: '<rootDir>/coverage/server',
  
  // 测试结果报告
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: '<rootDir>/test-results/server',
      filename: 'jest-report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'Server Unit Tests Report'
    }],
    ['jest-junit', {
      outputDirectory: '<rootDir>/test-results/server',
      outputName: 'junit.xml',
      ancestorSeparator: ' › ',
      uniqueOutputName: 'false',
      suiteNameTemplate: '{filepath}',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}'
    }]
  ],
  
  // 测试超时
  testTimeout: 30000,
  
  // 详细输出
  verbose: true,
  
  // 清除模拟
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  
  // 错误处理
  bail: false,
  
  // 最大并发数
  maxConcurrency: 5,
  
  // 最大工作进程数
  maxWorkers: '50%',
  
  // 缓存
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // 模拟配置
  automock: false,
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/server/tsconfig.json',
      isolatedModules: true
    }
  },
  
  // 预设
  preset: 'ts-jest',
  
  // 模块目录
  moduleDirectories: ['node_modules', '<rootDir>/server/src'],
  
  // 忽略转换的模块
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  
  // 测试环境选项
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // 强制退出
  forceExit: true,
  
  // 检测打开的句柄
  detectOpenHandles: true,
  
  // 检测泄漏
  detectLeaks: false,
  
  // 运行串行测试
  runInBand: false,
  
  // 静默模式
  silent: false,
  
  // 监视模式
  watchman: true,
  
  // 错误时停止
  stopOnFirstFailure: false,
  
  // 显示配置
  showConfig: false,
  
  // 通知
  notify: false,
  
  // 通知模式
  notifyMode: 'failure-change',
  
  // 项目配置
  projects: undefined,
  
  // 运行器
  runner: 'jest-runner',
  
  // 快照序列化器
  snapshotSerializers: [],
  
  // 快照解析器
  snapshotResolver: undefined,
  
  // 测试位置在堆栈跟踪中
  testLocationInResults: false,
  
  // 测试名称模式
  testNamePattern: undefined,
  
  // 测试结果处理器
  testResultsProcessor: undefined,
  
  // 测试运行器
  testRunner: 'jest-circus/runner',
  
  // 测试序列化器
  testSequencer: '@jest/test-sequencer',
  
  // 测试URL
  testURL: 'http://localhost',
  
  // 计时器
  timers: 'real',
  
  // 更新快照
  updateSnapshot: false,
  
  // 使用stderr
  useStderr: false,
  
  // 监视
  watch: false,
  
  // 监视所有
  watchAll: false,
  
  // 监视路径忽略模式
  watchPathIgnorePatterns: [],
  
  // 监视插件
  watchPlugins: []
};
