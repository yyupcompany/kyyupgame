/**
 * 环境变量验证配置
 *
 * 验证所有必需的环境变量是否已正确设置
 */

/**
 * 环境变量定义
 */
interface EnvVarSchema {
  name: string;
  required: boolean;
  defaultValue?: string | number | boolean;
  validator?: (value: string) => boolean;
  errorMessage?: string;
}

/**
 * 环境变量验证错误
 */
export class EnvValidationError extends Error {
  constructor(public missingVars: string[], public invalidVars: string[]) {
    const messages = [];
    if (missingVars.length > 0) {
      messages.push(`缺少必需的环境变量: ${missingVars.join(', ')}`);
    }
    if (invalidVars.length > 0) {
      messages.push(`环境变量值无效: ${invalidVars.join(', ')}`);
    }
    super(messages.join('\n'));
    this.name = 'EnvValidationError';
  }
}

/**
 * 环境变量配置
 */
const ENV_VARS: EnvVarSchema[] = [
  // 数据库配置
  {
    name: 'DB_HOST',
    required: true,
    defaultValue: 'localhost',
    validator: (val) => val.length > 0,
    errorMessage: 'DB_HOST不能为空'
  },
  {
    name: 'DB_PORT',
    required: false,
    defaultValue: 3306,
    validator: (val) => {
      const port = parseInt(val);
      return !isNaN(port) && port > 0 && port < 65536;
    },
    errorMessage: 'DB_PORT必须是有效的端口号(1-65535)'
  },
  {
    name: 'DB_USER',
    required: true,
    validator: (val) => val.length > 0,
    errorMessage: 'DB_USER不能为空'
  },
  {
    name: 'DB_PASSWORD',
    required: true,
    validator: (val) => val.length >= 8,
    errorMessage: 'DB_PASSWORD长度至少为8个字符'
  },
  {
    name: 'DB_NAME',
    required: true,
    validator: (val) => val.length > 0,
    errorMessage: 'DB_NAME不能为空'
  },
  {
    name: 'DB_DIALECT',
    required: false,
    defaultValue: 'mysql',
    validator: (val) => ['mysql', 'postgres', 'sqlite', 'mariadb'].includes(val),
    errorMessage: 'DB_DIALECT必须是 mysql, postgres, sqlite 或 mariadb'
  },

  // JWT配置
  {
    name: 'JWT_SECRET',
    required: true,
    validator: (val) => val.length >= 32,
    errorMessage: 'JWT_SECRET长度至少为32个字符'
  },
  {
    name: 'JWT_EXPIRES_IN',
    required: false,
    defaultValue: '7d',
    validator: (val) => /^\d+[smhd]$/.test(val),
    errorMessage: 'JWT_EXPIRES_IN格式不正确，应为: 数字+单位(s/m/h/d)'
  },

  // 服务器配置
  {
    name: 'PORT',
    required: false,
    defaultValue: 3000,
    validator: (val) => {
      const port = parseInt(val);
      return !isNaN(port) && port > 0 && port < 65536;
    },
    errorMessage: 'PORT必须是有效的端口号(1-65535)'
  },
  {
    name: 'NODE_ENV',
    required: false,
    defaultValue: 'development',
    validator: (val) => ['development', 'production', 'test'].includes(val),
    errorMessage: 'NODE_ENV必须是 development, production 或 test'
  },

  // CORS配置
  {
    name: 'CORS_ORIGIN',
    required: false,
    defaultValue: '*',
    validator: () => true,
    errorMessage: ''
  },

  // OSS配置
  {
    name: 'OSS_REGION',
    required: false,
    defaultValue: 'oss-cn-hangzhou',
    validator: () => true,
    errorMessage: ''
  },
  {
    name: 'OSS_ACCESS_KEY_ID',
    required: false,
    validator: () => true,
    errorMessage: ''
  },
  {
    name: 'OSS_ACCESS_KEY_SECRET',
    required: false,
    validator: () => true,
    errorMessage: ''
  },
  {
    name: 'OSS_BUCKET',
    required: false,
    validator: () => true,
    errorMessage: ''
  },

  // Redis配置（可选）
  {
    name: 'REDIS_HOST',
    required: false,
    validator: () => true,
    errorMessage: ''
  },
  {
    name: 'REDIS_PORT',
    required: false,
    defaultValue: 6379,
    validator: (val) => {
      const port = parseInt(val);
      return !isNaN(port) && port > 0 && port < 65536;
    },
    errorMessage: 'REDIS_PORT必须是有效的端口号'
  },

  // 统一租户系统配置
  {
    name: 'UNIFIED_TENANT_API_URL',
    required: false,
    defaultValue: 'http://localhost:4001',
    validator: (val) => {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    errorMessage: 'UNIFIED_TENANT_API_URL必须是有效的URL'
  },

  // AI配置
  {
    name: 'AI_API_KEY',
    required: false,
    validator: () => true,
    errorMessage: ''
  },

  // 安全配置
  {
    name: 'ENABLE_CSRF',
    required: false,
    defaultValue: 'false',
    validator: (val) => ['true', 'false'].includes(val),
    errorMessage: 'ENABLE_CSRF必须是 true 或 false'
  },
  {
    name: 'CSP_REPORT_ONLY',
    required: false,
    defaultValue: 'false',
    validator: (val) => ['true', 'false'].includes(val),
    errorMessage: 'CSP_REPORT_ONLY必须是 true 或 false'
  }
];

/**
 * 验证单个环境变量
 */
function validateEnvVar(schema: EnvVarSchema): { valid: boolean; error?: string } {
  const value = process.env[schema.name];

  // 检查必需变量
  if (schema.required && !value) {
    return {
      valid: false,
      error: `环境变量 ${schema.name} 是必需的`
    };
  }

  // 使用默认值
  if (!value && schema.defaultValue !== undefined) {
    process.env[schema.name] = String(schema.defaultValue);
    return { valid: true };
  }

  // 跳过可选的空值
  if (!value && !schema.required) {
    return { valid: true };
  }

  // 验证值
  if (value && schema.validator && !schema.validator(value)) {
    return {
      valid: false,
      error: schema.errorMessage || `环境变量 ${schema.name} 的值无效`
    };
  }

  return { valid: true };
}

/**
 * 验证所有环境变量
 */
export function validateEnvironmentVars(): void {
  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  for (const schema of ENV_VARS) {
    const result = validateEnvVar(schema);

    if (!result.valid) {
      if (result.error?.includes('是必需的')) {
        missingVars.push(schema.name);
      } else {
        invalidVars.push(`${schema.name}: ${result.error}`);
      }
    }
  }

  if (missingVars.length > 0 || invalidVars.length > 0) {
    throw new EnvValidationError(missingVars, invalidVars);
  }
}

/**
 * 获取环境变量（带类型转换）
 */
export function getEnvVar<T = string>(
  name: string,
  defaultValue?: T,
  converter?: (value: string) => T
): T | undefined {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  if (converter) {
    return converter(value);
  }

  return value as T;
}

/**
 * 获取布尔环境变量
 */
export function getBooleanEnvVar(name: string, defaultValue: boolean = false): boolean {
  const value = process.env[name];
  if (!value) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
}

/**
 * 获取数字环境变量
 */
export function getNumberEnvVar(name: string, defaultValue: number = 0): number {
  const value = process.env[name];
  if (!value) {
    return defaultValue;
  }
  const num = parseInt(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 导出配置
 */
export default {
  ENV_VARS,
  validateEnvironmentVars,
  getEnvVar,
  getBooleanEnvVar,
  getNumberEnvVar,
  EnvValidationError
};
