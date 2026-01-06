/**
 * JWT配置文件
 * 集中管理所有JWT相关配置
 * 
 * 等保三级合规要求：
 * - 生产环境必须配置强JWT密钥（最小32字符）
 * - 禁止使用默认弱密钥
 */

import crypto from 'crypto';

// 最小密钥长度要求（等保三级要求128位 = 16字节，建议使用256位 = 32字节）
const MIN_SECRET_LENGTH = 32;

// 默认开发环境密钥（仅开发环境使用）
const DEV_DEFAULT_SECRET = crypto.randomBytes(32).toString('hex');

/**
 * 验证JWT密钥强度
 */
function validateJwtSecret(secret: string): void {
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `[等保三级] JWT密钥长度不足！当前: ${secret.length}字符，要求: 最少${MIN_SECRET_LENGTH}字符`
    );
  }
  
  // 检查是否为弱密钥
  const weakSecrets = [
    'kindergarten-enrollment-secret',
    'secret',
    'jwt_secret', 
    'your_secret_here',
    'change_me',
    'default_secret'
  ];
  
  if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
    throw new Error(
      '[等保三级] 检测到弱JWT密钥！请使用强随机密钥（建议: openssl rand -hex 32）'
    );
  }
}

/**
 * 获取JWT密钥
 * - 生产环境：强制从环境变量读取，必须满足强度要求
 * - 开发环境：可使用随机生成的临时密钥（仅当前进程有效）
 */
function getJwtSecret(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const envSecret = process.env.JWT_SECRET;
  
  if (isProduction) {
    // 生产环境：强制要求配置
    if (!envSecret) {
      throw new Error(
        '[等保三级] 生产环境必须配置 JWT_SECRET 环境变量！\n' +
        '生成方法: openssl rand -hex 32'
      );
    }
    validateJwtSecret(envSecret);
    return envSecret;
  }
  
  // 开发环境
  if (envSecret) {
    // 如果配置了，也要检查强度（但只警告不报错）
    if (envSecret.length < MIN_SECRET_LENGTH) {
      console.warn(
        `⚠️ [安全警告] JWT密钥长度不足（${envSecret.length}字符），建议至少${MIN_SECRET_LENGTH}字符`
      );
    }
    return envSecret;
  }
  
  // 开发环境未配置时，使用随机生成的临时密钥
  console.warn(
    '⚠️ [开发环境] JWT_SECRET 未配置，使用临时随机密钥（每次重启会变化）'
  );
  return DEV_DEFAULT_SECRET;
}

// JWT密钥
export const JWT_SECRET = getJwtSecret();

// 默认令牌过期时间 - 统一设置为24小时
export const DEFAULT_TOKEN_EXPIRE = '24h'; // 开发环境和生产环境都使用24小时
export const REFRESH_TOKEN_EXPIRE = '30d'; // 刷新令牌有效期30天

/**
 * 获取动态会话超时时间
 * @returns 会话超时时间字符串（如 "24h"）
 */
export async function getDynamicTokenExpire(): Promise<string> {
  try {
    // 尝试从数据库获取会话超时设置
    const { getSystemSetting } = await import('../scripts/init-system-settings');
    const sessionTimeout = await getSystemSetting('security', 'sessionTimeout');

    if (sessionTimeout && typeof sessionTimeout === 'number' && sessionTimeout > 0) {
      // 数据库存储的是分钟，需要转换为小时
      const hours = Math.round(sessionTimeout / 60);
      console.log(`🕐 使用数据库中的会话超时设置: ${sessionTimeout} 分钟 (${hours} 小时)`);
      return `${hours}h`;  // 转换为小时格式
    }
  } catch (error) {
    console.warn('获取动态会话超时设置失败，使用默认值:', error);
  }

  // 检查全局变量
  if (typeof global !== 'undefined' && (global as any).sessionTimeoutMinutes) {
    const timeout = (global as any).sessionTimeoutMinutes;
    const hours = Math.round(timeout / 60);
    console.log(`🕐 使用全局变量中的会话超时设置: ${timeout} 分钟 (${hours} 小时)`);
    return `${hours}h`;  // 转换为小时格式
  }

  // 返回默认值
  console.log('🕐 使用默认会话超时设置: 24小时');
  return DEFAULT_TOKEN_EXPIRE;
}

// 动态令牌过期时间（保持向后兼容）
export const TOKEN_EXPIRE = DEFAULT_TOKEN_EXPIRE;

// 令牌类型
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'reset-password'
};

export default {
  JWT_SECRET,
  TOKEN_EXPIRE,
  REFRESH_TOKEN_EXPIRE,
  TOKEN_TYPES
}; 