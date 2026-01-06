#!/usr/bin/env node

/**
 * 运行API测试（无数据库依赖）
 * 这个脚本会跳过所有需要数据库连接的测试
 */

const { execSync } = require('child_process');
const path = require('path');

// 设置环境变量跳过数据库测试
process.env.SKIP_DATABASE_TESTS = 'true';
process.env.NODE_ENV = 'test';

console.log('🚀 Starting API Tests (Database-Free Mode)...\n');

try {
  // 运行非数据库相关的测试
  const testCommand = 'npx jest unit/auth.test.ts unit/services.test.ts unit/controllers.test.ts unit/middleware.test.ts e2e/swagger-validation.test.ts --verbose';
  
  console.log('Running command:', testCommand);
  
  execSync(testCommand, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      SKIP_DATABASE_TESTS: 'true',
      NODE_ENV: 'test'
    }
  });
  
  console.log('\n✅ API Tests completed successfully!');
  
} catch (error) {
  console.error('\n❌ Tests failed:', error.message);
  process.exit(1);
}