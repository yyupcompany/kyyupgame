/**
 * 测试环境变量设置
 */

// 设置Node环境为测试模式
process.env.NODE_ENV = 'test';

// 数据库配置
process.env.TEST_DATABASE_NAME = 'kindergarten_test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/kindergarten_test';
process.env.DB_HOST = process.env.TEST_DB_HOST || 'localhost';
process.env.DB_PORT = process.env.TEST_DB_PORT || '5432';
process.env.DB_NAME = process.env.TEST_DATABASE_NAME;
process.env.DB_USER = process.env.TEST_DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD || 'password';

// JWT配置
process.env.JWT_SECRET = 'test-jwt-secret-key-for-integration-tests';
process.env.JWT_EXPIRES_IN = '24h';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';

// API配置
process.env.API_PORT = '0'; // 让系统自动分配端口
process.env.API_HOST = 'localhost';
process.env.API_PREFIX = '/api';

// AI服务配置
process.env.AI_SERVICE_URL = 'http://localhost:8080';
process.env.AI_SERVICE_API_KEY = 'test-ai-api-key';
process.env.AI_MODEL_DEFAULT = 'gpt-3.5-turbo';
process.env.AI_MAX_TOKENS = '2000';
process.env.AI_TEMPERATURE = '0.7';

// Redis配置（如果使用）
process.env.REDIS_URL = 'redis://localhost:6379/1'; // 使用数据库1避免冲突
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_DB = '1';

// 文件上传配置
process.env.UPLOAD_DIR = './tests/temp/uploads';
process.env.MAX_FILE_SIZE = '10485760'; // 10MB
process.env.ALLOWED_FILE_TYPES = 'jpg,jpeg,png,gif,pdf,doc,docx';

// 邮件服务配置（测试模式）
process.env.MAIL_SERVICE = 'test';
process.env.MAIL_HOST = 'localhost';
process.env.MAIL_PORT = '587';
process.env.MAIL_USER = 'test@example.com';
process.env.MAIL_PASSWORD = 'test-password';
process.env.MAIL_FROM = 'test@example.com';

// 短信服务配置（测试模式）
process.env.SMS_SERVICE = 'test';
process.env.SMS_API_KEY = 'test-sms-api-key';
process.env.SMS_API_SECRET = 'test-sms-api-secret';

// 日志配置
process.env.LOG_LEVEL = 'error'; // 测试时只显示错误日志
process.env.LOG_FILE = './tests/temp/logs/test.log';
process.env.LOG_MAX_SIZE = '10m';
process.env.LOG_MAX_FILES = '3';

// 安全配置
process.env.BCRYPT_ROUNDS = '4'; // 测试时使用较少的轮数以提高速度
process.env.RATE_LIMIT_WINDOW = '60000'; // 1分钟
process.env.RATE_LIMIT_MAX = '1000'; // 测试时放宽限制
process.env.CORS_ORIGIN = '*';

// 会话配置
process.env.SESSION_SECRET = 'test-session-secret';
process.env.SESSION_MAX_AGE = '86400000'; // 24小时

// 缓存配置
process.env.CACHE_TTL = '300'; // 5分钟
process.env.CACHE_MAX_SIZE = '100';

// 队列配置（如果使用）
process.env.QUEUE_REDIS_URL = 'redis://localhost:6379/2';
process.env.QUEUE_CONCURRENCY = '1';

// 监控配置
process.env.METRICS_ENABLED = 'false';
process.env.HEALTH_CHECK_ENABLED = 'true';

// 第三方服务配置
process.env.WECHAT_APP_ID = 'test-wechat-app-id';
process.env.WECHAT_APP_SECRET = 'test-wechat-app-secret';
process.env.ALIPAY_APP_ID = 'test-alipay-app-id';
process.env.ALIPAY_PRIVATE_KEY = 'test-alipay-private-key';

// 测试特定配置
process.env.TEST_TIMEOUT = '30000';
process.env.TEST_PARALLEL = 'true';
process.env.TEST_COVERAGE = 'true';
process.env.TEST_VERBOSE = 'true';
process.env.SILENT_TESTS = 'false'; // 设为true可以静默测试输出

// 开发工具配置
process.env.DEBUG = 'false';
process.env.MOCK_EXTERNAL_SERVICES = 'true';

// 确保测试目录存在
import fs from 'fs';
import path from 'path';

const testDirs = [
  './tests/temp',
  './tests/temp/uploads',
  './tests/temp/logs',
  './coverage',
  './coverage/integration'
];

testDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 清理测试临时文件
const cleanupTestFiles = () => {
  const tempDir = './tests/temp';
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'uploads'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'logs'), { recursive: true });
  }
};

// 在测试开始前清理
cleanupTestFiles();

// 导出清理函数供测试使用
export { cleanupTestFiles };

console.log('✅ 测试环境变量设置完成');
console.log(`   数据库: ${process.env.DB_NAME}`);
console.log(`   日志级别: ${process.env.LOG_LEVEL}`);
console.log(`   模拟外部服务: ${process.env.MOCK_EXTERNAL_SERVICES}`);
