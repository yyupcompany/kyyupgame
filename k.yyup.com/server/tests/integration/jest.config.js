/**
 * Jest配置 - API集成测试
 */

module.exports = {
  // 基础配置
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/**/*.test.ts',
    '<rootDir>/**/*.spec.ts'
  ],
  
  // 忽略的文件和目录
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // TypeScript配置
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // 模块解析
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // 设置文件
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.ts'
  ],
  
  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/types/**',
    '!src/config/**',
    '!src/migrations/**'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // 核心模块要求更高覆盖率
    'src/controllers/**/*.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'src/services/**/*.ts': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  
  // 覆盖率报告
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  // 覆盖率输出目录
  coverageDirectory: '<rootDir>/coverage/integration',
  
  // 测试超时
  testTimeout: 30000, // 30秒
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: {
        compilerOptions: {
          module: 'commonjs',
          target: 'es2018',
          lib: ['es2018'],
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true
        }
      }
    }
  },
  
  // 环境变量
  setupFiles: [
    '<rootDir>/tests/setup/env.setup.ts'
  ],
  
  // 测试结果报告
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/integration/html-report',
        filename: 'integration-test-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'API集成测试报告',
        logoImgPath: undefined,
        inlineSource: false
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: './coverage/integration',
        outputName: 'junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}'
      }
    ]
  ],
  
  // 详细输出
  verbose: true,
  
  // 错误时停止
  bail: false,
  
  // 并行测试
  maxWorkers: '50%',
  
  // 缓存
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // 清理模拟
  clearMocks: true,
  restoreMocks: true,
  
  // 错误处理
  errorOnDeprecated: true,
  
  // 监视模式配置
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/'
  ],
  
  // 自定义匹配器
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.ts',
    '<rootDir>/tests/setup/custom-matchers.ts'
  ],
  
  // 模拟配置
  modulePathIgnorePatterns: [
    '<rootDir>/dist/'
  ],
  
  // 测试序列化
  snapshotSerializers: [],
  
  // 全局设置和清理
  globalSetup: '<rootDir>/tests/setup/global-setup.ts',
  globalTeardown: '<rootDir>/tests/setup/global-teardown.ts',
  
  // 测试结果处理器
  testResultsProcessor: undefined,
  
  // 自定义解析器
  resolver: undefined,
  
  // 运行器
  runner: 'jest-runner',
  
  // 测试环境选项
  testEnvironmentOptions: {},
  
  // 转换忽略模式
  transformIgnorePatterns: [
    '/node_modules/(?!(supertest|@jest/transform|@babel/runtime)/)'
  ],
  
  // 未覆盖文件阈值
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/coverage/',
    '/dist/',
    '/build/',
    'src/types/',
    'src/config/database.ts', // 数据库配置文件
    'src/app.ts', // 应用入口文件
    'src/server.ts' // 服务器启动文件
  ],
  
  // 强制退出
  forceExit: false,
  
  // 检测打开的句柄
  detectOpenHandles: true,
  
  // 检测泄漏
  detectLeaks: false,
  
  // 最大并发数
  maxConcurrency: 5,
  
  // 通知配置
  notify: false,
  notifyMode: 'failure-change',
  
  // 静默模式
  silent: false,
  
  // 更新快照
  updateSnapshot: false,
  
  // 使用stderr
  useStderr: false,
  
  // 监视
  watch: false,
  watchAll: false,
  
  // 监视插件
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
};
