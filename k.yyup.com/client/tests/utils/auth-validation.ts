/**
 * 认证模块专用验证工具
 * 用于JWT令牌、权限、会话等认证相关的严格验证
 */

import { validateRequiredFields, validateFieldTypes, validateEmailFormat, validateIdFormat } from './data-validation';

/**
 * JWT令牌结构接口
 */
export interface JWTTokenStructure {
  header: {
    alg: string;
    typ: string;
  };
  payload: {
    sub: string; // 用户ID
    iat: number; // 签发时间
    exp: number; // 过期时间
    iss?: string; // 签发者
    aud?: string; // 受众
    jti?: string; // JWT ID
    [key: string]: any; // 其他自定义字段
  };
  signature: string;
}

/**
 * 用户角色接口
 */
export interface UserRole {
  id: string;
  name: string;
  code: string;
  description?: string;
}

/**
 * 权限接口
 */
export interface Permission {
  id: string;
  name: string;
  code: string;
  resource?: string;
  action?: string;
}

/**
 * 认证响应接口
 */
export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: UserInfo;
  message?: string;
  code?: number;
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  realName?: string;
  roles?: UserRole[];
  permissions?: Permission[];
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

/**
 * 验证JWT令牌格式
 * @param token JWT令牌字符串
 * @returns 验证结果
 */
export function validateJWTToken(token: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!token || typeof token !== 'string') {
    errors.push('Token is required and must be a string');
    return { valid: false, errors };
  }

  // 检查JWT格式（三部分用点分隔）
  const parts = token.split('.');
  if (parts.length !== 3) {
    errors.push('JWT token must have 3 parts separated by dots');
    return { valid: false, errors };
  }

  try {
    // 验证header部分
    const header = JSON.parse(atob(parts[0]));
    const headerValidation = validateFieldTypes(header, {
      alg: 'string',
      typ: 'string'
    });
    if (!headerValidation.valid) {
      errors.push(`Header validation failed: ${headerValidation.errors.join(', ')}`);
    }

    // 验证payload部分
    const payload = JSON.parse(atob(parts[1]));
    const payloadValidation = validateFieldTypes(payload, {
      sub: 'string',
      iat: 'number',
      exp: 'number'
    });
    if (!payloadValidation.valid) {
      errors.push(`Payload validation failed: ${payloadValidation.errors.join(', ')}`);
    }

    // 验证时间戳的合理性
    if (payload.iat && payload.exp) {
      const now = Math.floor(Date.now() / 1000);

      // 检查签发时间不能是未来时间
      if (payload.iat > now + 60) { // 允许60秒的时钟偏差
        errors.push('Token issued date is in the future');
      }

      // 检查过期时间不能是过去时间
      if (payload.exp <= now) {
        errors.push('Token has expired');
      }

      // 检查过期时间必须晚于签发时间
      if (payload.exp <= payload.iat) {
        errors.push('Token expiration time must be after issued time');
      }

      // 检查token有效期是否合理（不超过24小时）
      const maxLifetime = 24 * 60 * 60; // 24小时
      if (payload.exp - payload.iat > maxLifetime) {
        errors.push('Token lifetime exceeds maximum allowed duration');
      }
    }

  } catch (error) {
    errors.push(`Failed to parse JWT token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证刷新令牌格式
 * @param refreshToken 刷新令牌
 * @returns 验证结果
 */
export function validateRefreshToken(refreshToken: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!refreshToken || typeof refreshToken !== 'string') {
    errors.push('Refresh token is required and must be a string');
    return { valid: false, errors };
  }

  // 刷新令牌应该比JWT令牌长
  if (refreshToken.length < 32) {
    errors.push('Refresh token is too short (minimum 32 characters)');
  }

  // 检查是否包含安全的字符（只允许字母数字和特定符号）
  const validRefreshTokenRegex = /^[a-zA-Z0-9\-_\.]+$/;
  if (!validRefreshTokenRegex.test(refreshToken)) {
    errors.push('Refresh token contains invalid characters');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证用户角色结构
 * @param role 用户角色对象
 * @returns 验证结果
 */
export function validateUserRole(role: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证必填字段
  const requiredValidation = validateRequiredFields(role, ['id', 'name', 'code']);
  if (!requiredValidation.valid) {
    errors.push(`Missing required fields: ${requiredValidation.missing.join(', ')}`);
  }

  // 验证字段类型
  const typeValidation = validateFieldTypes(role, {
    id: 'string',
    name: 'string',
    code: 'string',
    description: 'string'
  });
  if (!typeValidation.valid) {
    errors.push(...typeValidation.errors);
  }

  // 验证ID格式
  if (role.id && !validateIdFormat(role.id)) {
    errors.push('Role ID format is invalid');
  }

  // 验证角色代码格式（应该是小写字母、数字和下划线）
  if (role.code && !/^[a-z0-9_]+$/.test(role.code)) {
    errors.push('Role code should contain only lowercase letters, numbers and underscores');
  }

  // 验证角色名称长度
  if (role.name && (role.name.length < 2 || role.name.length > 50)) {
    errors.push('Role name should be between 2 and 50 characters');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证权限结构
 * @param permission 权限对象
 * @returns 验证结果
 */
export function validatePermission(permission: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证必填字段
  const requiredValidation = validateRequiredFields(permission, ['id', 'name', 'code']);
  if (!requiredValidation.valid) {
    errors.push(`Missing required fields: ${requiredValidation.missing.join(', ')}`);
  }

  // 验证字段类型
  const typeValidation = validateFieldTypes(permission, {
    id: 'string',
    name: 'string',
    code: 'string',
    resource: 'string',
    action: 'string'
  });
  if (!typeValidation.valid) {
    errors.push(...typeValidation.errors);
  }

  // 验证ID格式
  if (permission.id && !validateIdFormat(permission.id)) {
    errors.push('Permission ID format is invalid');
  }

  // 验证权限代码格式（推荐格式：resource_action）
  if (permission.code && !/^[a-z0-9_]+$/.test(permission.code)) {
    errors.push('Permission code should contain only lowercase letters, numbers and underscores');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证用户信息结构
 * @param user 用户信息对象
 * @returns 验证结果
 */
export function validateUserInfo(user: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证必填字段
  const requiredValidation = validateRequiredFields(user, ['id', 'username', 'email']);
  if (!requiredValidation.valid) {
    errors.push(`Missing required fields: ${requiredValidation.missing.join(', ')}`);
  }

  // 验证字段类型
  const typeValidation = validateFieldTypes(user, {
    id: 'string',
    username: 'string',
    email: 'string',
    realName: 'string',
    createdAt: 'string',
    updatedAt: 'string',
    lastLoginAt: 'string'
  });
  if (!typeValidation.valid) {
    errors.push(...typeValidation.errors);
  }

  // 验证ID格式
  if (user.id && !validateIdFormat(user.id)) {
    errors.push('User ID format is invalid');
  }

  // 验证用户名格式
  if (user.username && !/^[a-zA-Z0-9_-]{3,20}$/.test(user.username)) {
    errors.push('Username should be 3-20 characters, containing only letters, numbers, underscore and hyphen');
  }

  // 验证邮箱格式
  if (user.email && !validateEmailFormat(user.email)) {
    errors.push('Email format is invalid');
  }

  // 验证真实姓名长度
  if (user.realName && (user.realName.length < 2 || user.realName.length > 50)) {
    errors.push('Real name should be between 2 and 50 characters');
  }

  // 验证角色数组
  if (user.roles !== undefined) {
    if (!Array.isArray(user.roles)) {
      errors.push('Roles must be an array');
    } else {
      user.roles.forEach((role: any, index: number) => {
        const roleValidation = validateUserRole(role);
        if (!roleValidation.valid) {
          errors.push(`Role at index ${index}: ${roleValidation.errors.join(', ')}`);
        }
      });
    }
  }

  // 验证权限数组
  if (user.permissions !== undefined) {
    if (!Array.isArray(user.permissions)) {
      errors.push('Permissions must be an array');
    } else {
      user.permissions.forEach((permission: any, index: number) => {
        const permissionValidation = validatePermission(permission);
        if (!permissionValidation.valid) {
          errors.push(`Permission at index ${index}: ${permissionValidation.errors.join(', ')}`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证认证响应结构
 * @param response API响应对象
 * @param options 验证选项
 * @returns 验证结果
 */
export function validateAuthResponse(
  response: any,
  options: {
    requireToken?: boolean;
    requireRefreshToken?: boolean;
    requireUser?: boolean;
    requireMessage?: boolean;
  } = {}
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const {
    requireToken = false,
    requireRefreshToken = false,
    requireUser = false,
    requireMessage = false
  } = options;

  // 验证基本响应结构
  if (!response || typeof response !== 'object') {
    errors.push('Response must be an object');
    return { valid: false, errors };
  }

  // 验证success字段
  if (response.success !== undefined && typeof response.success !== 'boolean') {
    errors.push('success field must be boolean');
  }

  // 根据选项验证必填字段
  const requiredFields: string[] = [];
  if (requireToken) requiredFields.push('token');
  if (requireRefreshToken) requiredFields.push('refreshToken');
  if (requireUser) requiredFields.push('user');
  if (requireMessage) requiredFields.push('message');

  if (requiredFields.length > 0) {
    const requiredValidation = validateRequiredFields(response, requiredFields);
    if (!requiredValidation.valid) {
      errors.push(`Missing required fields: ${requiredValidation.missing.join(', ')}`);
    }
  }

  // 验证token格式
  if (response.token !== undefined) {
    const tokenValidation = validateJWTToken(response.token);
    if (!tokenValidation.valid) {
      errors.push(`Token validation failed: ${tokenValidation.errors.join(', ')}`);
    }
  }

  // 验证refreshToken格式
  if (response.refreshToken !== undefined) {
    const refreshTokenValidation = validateRefreshToken(response.refreshToken);
    if (!refreshTokenValidation.valid) {
      errors.push(`Refresh token validation failed: ${refreshTokenValidation.errors.join(', ')}`);
    }
  }

  // 验证user结构
  if (response.user !== undefined) {
    const userValidation = validateUserInfo(response.user);
    if (!userValidation.valid) {
      errors.push(`User validation failed: ${userValidation.errors.join(', ')}`);
    }
  }

  // 验证message类型
  if (response.message !== undefined && typeof response.message !== 'string') {
    errors.push('message field must be string');
  }

  // 验证code类型（如果存在）
  if (response.code !== undefined && typeof response.code !== 'number') {
    errors.push('code field must be number');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证登录请求数据
 * @param loginData 登录请求数据
 * @returns 验证结果
 */
export function validateLoginRequest(loginData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证必填字段
  const requiredValidation = validateRequiredFields(loginData, ['username', 'password']);
  if (!requiredValidation.valid) {
    errors.push(`Missing required fields: ${requiredValidation.missing.join(', ')}`);
  }

  // 验证字段类型
  const typeValidation = validateFieldTypes(loginData, {
    username: 'string',
    password: 'string'
  });
  if (!typeValidation.valid) {
    errors.push(...typeValidation.errors);
  }

  // 验证用户名长度和格式
  if (loginData.username) {
    if (loginData.username.length < 3 || loginData.username.length > 50) {
      errors.push('Username must be between 3 and 50 characters');
    }
  }

  // 验证密码强度
  if (loginData.password) {
    if (loginData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    // 可以根据需要添加更多密码强度检查
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证密码重置请求
 * @param resetData 密码重置请求数据
 * @returns 验证结果
 */
export function validatePasswordResetRequest(resetData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证必填字段
  const requiredValidation = validateRequiredFields(resetData, ['email']);
  if (!requiredValidation.valid) {
    errors.push(`Missing required fields: ${requiredValidation.missing.join(', ')}`);
  }

  // 验证邮箱格式
  if (resetData.email && !validateEmailFormat(resetData.email)) {
    errors.push('Email format is invalid');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证密码更新请求
 * @param updateData 密码更新请求数据
 * @returns 验证结果
 */
export function validatePasswordUpdateRequest(updateData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证必填字段
  const requiredValidation = validateRequiredFields(updateData, ['currentPassword', 'newPassword']);
  if (!requiredValidation.valid) {
    errors.push(`Missing required fields: ${requiredValidation.missing.join(', ')}`);
  }

  // 验证字段类型
  const typeValidation = validateFieldTypes(updateData, {
    currentPassword: 'string',
    newPassword: 'string',
    confirmPassword: 'string'
  });
  if (!typeValidation.valid) {
    errors.push(...typeValidation.errors);
  }

  // 验证新密码强度
  if (updateData.newPassword) {
    if (updateData.newPassword.length < 6) {
      errors.push('New password must be at least 6 characters long');
    }
  }

  // 验证密码确认
  if (updateData.newPassword && updateData.confirmPassword &&
      updateData.newPassword !== updateData.confirmPassword) {
    errors.push('New password and confirm password do not match');
  }

  // 验证新旧密码不能相同
  if (updateData.currentPassword && updateData.newPassword &&
      updateData.currentPassword === updateData.newPassword) {
    errors.push('New password must be different from current password');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 创建认证验证报告
 * @param data 待验证的数据
 * @param type 验证类型
 * @returns 验证报告
 */
export function createAuthValidationReport(
  data: any,
  type: 'login' | 'register' | 'token' | 'user' | 'authResponse'
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    switch (type) {
      case 'login':
        const loginValidation = validateLoginRequest(data);
        if (!loginValidation.valid) {
          errors.push(...loginValidation.errors);
        }
        break;

      case 'token':
        const tokenValidation = validateJWTToken(data);
        if (!tokenValidation.valid) {
          errors.push(...tokenValidation.errors);
        }
        break;

      case 'user':
        const userValidation = validateUserInfo(data);
        if (!userValidation.valid) {
          errors.push(...userValidation.errors);
        }
        break;

      case 'authResponse':
        const authResponseValidation = validateAuthResponse(data, {
          requireToken: true,
          requireUser: true
        });
        if (!authResponseValidation.valid) {
          errors.push(...authResponseValidation.errors);
        }
        break;

      case 'register':
        // 注册验证（可以扩展）
        if (!data.username || !data.email || !data.password) {
          errors.push('Username, email and password are required for registration');
        }
        break;

      default:
        warnings.push(`Unknown validation type: ${type}`);
    }
  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}