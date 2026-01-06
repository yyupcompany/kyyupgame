/**
 * 日志脱敏工具
 *
 * 在日志输出前对敏感信息进行脱敏处理
 * 不修改logger.ts，而是在调用logger前进行脱敏
 */

/**
 * 判断是否为开发环境
 */
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

/**
 * 是否启用脱敏
 * 生产环境强制启用，开发环境可通过环境变量控制
 */
const ENABLE_SANITIZATION = process.env.ENABLE_LOG_SANITIZATION !== 'false' || !isDevelopment;

/**
 * 脱敏配置
 */
interface SanitizeConfig {
  phone?: boolean;
  email?: boolean;
  idCard?: boolean;
  token?: boolean;
  password?: boolean;
  apiKey?: boolean;
  address?: boolean;
}

/**
 * 默认脱敏配置
 */
const DEFAULT_CONFIG: SanitizeConfig = {
  phone: true,
  email: true,
  idCard: true,
  token: true,
  password: true,
  apiKey: true,
  address: false // 地址默认不脱敏
};

/**
 * 脱敏手机号
 * 保留前3位和后4位，中间用****代替
 * @example 13800138000 -> 138****8000
 */
export function sanitizePhone(phone: string | undefined | null): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // 移除所有非数字字符
  const cleaned = phone.replace(/\D/g, '');

  // 检查是否为有效手机号（11位，1开头）
  if (!/^1\d{10}$/.test(cleaned)) {
    return phone; // 不是标准手机号格式，返回原值
  }

  return cleaned.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 脱敏邮箱
 * 只保留第一个字符和@后面的域名
 * @example user@example.com -> u***@example.com
 */
export function sanitizeEmail(email: string | undefined | null): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return email; // 不是标准邮箱格式
  }

  const [username, domain] = parts;
  if (username.length <= 1) {
    return `${username}@${domain}`;
  }

  return `${username[0]}***@${domain}`;
}

/**
 * 脱敏身份证号
 * 保留前6位和后4位，中间用****代替
 * @example 110101199001011234 -> 110101********1234
 */
export function sanitizeIdCard(idCard: string | undefined | null): string {
  if (!idCard || typeof idCard !== 'string') {
    return '';
  }

  const cleaned = idCard.replace(/\s/g, '');

  // 检查是否为15位或18位身份证号
  if (!/^\d{15}$/.test(cleaned) && !/^\d{17}[\dXx]$/.test(cleaned)) {
    return idCard; // 不是标准身份证格式
  }

  if (cleaned.length === 15) {
    return cleaned.replace(/(\d{6})\d{5}(\d{4})/, '$1*****$2');
  }

  return cleaned.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
}

/**
 * 脱敏Token
 * 只保留前8位和后4位，中间用****代替
 * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... -> eyJhbGc****MTIz
 */
export function sanitizeToken(token: string | undefined | null): string {
  if (!token || typeof token !== 'string') {
    return '';
  }

  if (token.length <= 12) {
    return '***'; // Token太短，全部隐藏
  }

  return `${token.substring(0, 8)}****${token.substring(token.length - 4)}`;
}

/**
 * 脱敏密码
 * 全部替换为固定长度的*
 */
export function sanitizePassword(password: string | undefined | null): string {
  if (!password || typeof password !== 'string') {
    return '';
  }

  return '******';
}

/**
 * 脱敏API密钥
 * 只保留前4位和后4位
 * @example AKIAIOSFODNN7EXAMPLE -> AKIA****XAMPLE
 */
export function sanitizeApiKey(apiKey: string | undefined | null): string {
  if (!apiKey || typeof apiKey !== 'string') {
    return '';
  }

  if (apiKey.length <= 8) {
    return '***';
  }

  return `${apiKey.substring(0, 4)}****${apiKey.substring(apiKey.length - 4)}`;
}

/**
 * 脱敏地址
 * 保留省市区，具体地址用****代替
 * @example 北京市朝阳区xxx街道1号 -> 北京市朝阳区****1号
 */
export function sanitizeAddress(address: string | undefined | null): string {
  if (!address || typeof address !== 'string') {
    return '';
  }

  // 简单处理：保留前10个字符
  if (address.length <= 10) {
    return address;
  }

  return `${address.substring(0, 10)}****`;
}

/**
 * 脱敏对象中的敏感字段
 */
export function sanitizeObject(obj: any, config: SanitizeConfig = DEFAULT_CONFIG): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // 如果是数组，递归处理每个元素
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, config));
  }

  const result: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    const value = obj[key];
    const lowerKey = key.toLowerCase();

    // 根据字段名和配置决定是否脱敏
    if (config.phone && (lowerKey.includes('phone') || lowerKey.includes('mobile') || lowerKey.includes('联系电话') || lowerKey.includes('手机'))) {
      result[key] = sanitizePhone(value);
    } else if (config.email && (lowerKey.includes('email') || lowerKey.includes('mail') || lowerKey.includes('邮箱'))) {
      result[key] = sanitizeEmail(value);
    } else if (config.idCard && (lowerKey.includes('idcard') || lowerKey.includes('id_card') || lowerKey.includes('身份证'))) {
      result[key] = sanitizeIdCard(value);
    } else if (config.token && (lowerKey.includes('token') || lowerKey.includes('authorization') || lowerKey.includes('jwt'))) {
      result[key] = sanitizeToken(value);
    } else if (config.password && (lowerKey.includes('password') || lowerKey.includes('passwd') || lowerKey.includes('pwd') || lowerKey.includes('密码'))) {
      result[key] = sanitizePassword(value);
    } else if (config.apiKey && (lowerKey.includes('key') || lowerKey.includes('secret') || lowerKey.includes('accesskey'))) {
      result[key] = sanitizeApiKey(value);
    } else if (config.address && (lowerKey.includes('address') || lowerKey.includes('addr') || lowerKey.includes('地址'))) {
      result[key] = sanitizeAddress(value);
    } else if (typeof value === 'object') {
      // 递归处理嵌套对象
      result[key] = sanitizeObject(value, config);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * 脱敏日志消息
 * 支持字符串和对象
 */
export function sanitizeLog(data: any, config: SanitizeConfig = DEFAULT_CONFIG): any {
  // 如果未启用脱敏，直接返回
  if (!ENABLE_SANITIZATION) {
    return data;
  }

  // 处理字符串类型
  if (typeof data === 'string') {
    return data;
  }

  // 处理对象类型
  if (typeof data === 'object' && data !== null) {
    return sanitizeObject(data, config);
  }

  // 其他类型直接返回
  return data;
}

/**
 * 创建带有上下文的日志脱敏器
 */
export function createLogSanitizer(context?: string, config: SanitizeConfig = DEFAULT_CONFIG) {
  return {
    /**
     * 脱敏并记录日志
     */
    sanitize: (data: any) => {
      const sanitized = sanitizeLog(data, config);

      // 如果有上下文，包装一下
      if (context) {
        return { context, data: sanitized };
      }

      return sanitized;
    },

    /**
     * 脱敏手机号
     */
    phone: (phone: string) => sanitizePhone(phone),

    /**
     * 脱敏邮箱
     */
    email: (email: string) => sanitizeEmail(email),

    /**
     * 脱敏Token
     */
    token: (token: string) => sanitizeToken(token),

    /**
     * 脱敏密码
     */
    password: (pwd: string) => sanitizePassword(pwd)
  };
}

/**
 * 预定义的上下文脱敏器
 */
export const authLogSanitizer = createLogSanitizer('[认证]', {
  phone: true,
  email: true,
  token: true,
  password: true,
  apiKey: false
});

export const userLogSanitizer = createLogSanitizer('[用户]', {
  phone: true,
  email: true,
  idCard: true,
  address: true,
  password: false
});

export const apiLogSanitizer = createLogSanitizer('[API]', {
  token: true,
  apiKey: true,
  password: true,
  phone: false,
  email: false
});

/**
 * 快捷函数：脱敏并打印日志
 */
export function logSanitized(logger: any, data: any, config?: SanitizeConfig): void {
  const sanitized = sanitizeLog(data, config);
  logger(sanitized);
}

/**
 * 导出默认配置
 */
export const sanitizeConfig = {
  DEFAULT: DEFAULT_CONFIG,
  ENABLE_SANITIZATION,
  isDevelopment,

  // 环境检查
  shouldSanitize: () => ENABLE_SANITIZATION
};

/**
 * 导出所有脱敏函数
 */
export default {
  sanitizePhone,
  sanitizeEmail,
  sanitizeIdCard,
  sanitizeToken,
  sanitizePassword,
  sanitizeApiKey,
  sanitizeAddress,
  sanitizeObject,
  sanitizeLog,
  createLogSanitizer,
  authLogSanitizer,
  userLogSanitizer,
  apiLogSanitizer,
  logSanitized,
  config: sanitizeConfig
};
