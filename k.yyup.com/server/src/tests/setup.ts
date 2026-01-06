// 测试环境设置文件
import { config } from 'dotenv';

// 加载测试环境变量
config({ path: '.env.test' });

// 设置测试超时时间
jest.setTimeout(30000);

// 全局测试设置
beforeAll(async () => {
  // 在所有测试开始前的设置
  console.log('🧪 开始运行AI专家系统测试...');
});

afterAll(async () => {
  // 在所有测试结束后的清理
  console.log('✅ AI专家系统测试完成');
});

// 模拟环境变量
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test_user';
process.env.DB_PASS = 'test_pass';
