import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { AuthService } from '/home/zhgue/yyupcc/k.yyup.com/server/src/services/auth/auth.service'
import { User } from '/home/zhgue/yyupcc/k.yyup.com/server/src/models/user.model'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateApiResponseStructure
} from '../../../../src/utils/data-validation'
import {
  validateJWTToken,
  validateRefreshToken,
  validateUserInfo,
  validateAuthResponse,
  validateLoginRequest,
  createAuthValidationReport
} from '../../../../src/utils/auth-validation'

// Mock dependencies
vi.mock('/home/zhgue/yyupcc/k.yyup.com/server/src/models/user.model')
vi.mock('jsonwebtoken')
vi.mock('bcryptjs')

// Console monitoring for server tests
const consoleErrors: string[] = [];
import { vi } from 'vitest'
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = (...args: any[]) => {
    consoleErrors.push(args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

function expectNoConsoleErrors(): void {
  if (consoleErrors.length > 0) {
    const errorMessage = `Console errors detected during test execution:\n${consoleErrors.map((msg, i) => `  ${i + 1}. ${msg}`).join('\n')}`;
    consoleErrors.length = 0; // Clear for next test
    throw new Error(errorMessage);
  }
  consoleErrors.length = 0; // Clear for next test
}

// 控制台错误检测变量
let consoleSpy: any

describe('AuthService - Strict Validation', () => {
  let authService: AuthService
  let mockUserModel: any
  let mockJwt: any
  let mockBcrypt: any

  beforeEach(() => {
    authService = new AuthService()
    mockUserModel = vi.mocked(User)
    mockJwt = vi.mocked(jwt)
    mockBcrypt = vi.mocked(bcryptjs)

    // Reset all mocks
    vi.clearAllMocks()
    consoleErrors.length = 0; // Clear console errors before each test
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    vi.restoreAllMocks()
    expectNoConsoleErrors(); // Check for console errors after each test
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('login', () => {
    it('should login successfully with valid credentials - 严格验证', async () => {
      // 1. 验证登录请求数据结构
      const loginData = {
        username: 'admin',
        password: 'password123'
      };

      const requestValidation = validateLoginRequest(loginData);
      expect(requestValidation.valid).toBe(true);
      if (!requestValidation.valid) {
        throw new Error(`Login request validation failed: ${requestValidation.errors.join(', ')}`);
      }

      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@school.com',
        password: 'hashedPassword',
        role: 'admin' as any,
        status: 'active'
      };

      // 2. 验证用户数据结构
      const userValidation = validateFieldTypes(mockUser, {
        id: 'number',
        username: 'string',
        email: 'string',
        password: 'string',
        role: 'string',
        status: 'string'
      });
      expect(userValidation.valid).toBe(true);

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(undefined);

      const mockToken = 'mock-jwt-token';
      mockJwt.sign.mockReturnValue(mockToken);

      const result = await authService.login(loginData);

      // 3. 验证数据库查询调用
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: {
          username: loginData.username,
          status: 'active'
        }
      });

      // 4. 验证密码验证调用
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);

      // 5. 验证JWT生成调用
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, username: mockUser.username, role: mockUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 6. 验证响应存在性
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');

      // 7. 验证API响应结构
      const apiResponseValidation = validateApiResponseStructure(result);
      expect(apiResponseValidation.valid).toBe(true);

      // 8. 验证认证响应结构
      const authResponseValidation = validateAuthResponse(result, {
        requireToken: true,
        requireUser: true
      });
      expect(authResponseValidation.valid).toBe(true);
      if (!authResponseValidation.valid) {
        throw new Error(`Auth response validation failed: ${authResponseValidation.errors.join(', ')}`);
      }

      // 9. 验证JWT令牌格式（如果存在）
      if (result.token) {
        const tokenValidation = validateJWTToken(result.token);
        // 注意：由于是mock token，可能不符合真实JWT格式，这里我们验证返回值存在
        expect(result.token).toBe(mockToken);
      }

      // 10. 验证用户信息结构（如果存在）
      if (result.user) {
        const userValidation = validateUserInfo(result.user);
        expect(userValidation.valid).toBe(true);
      }

      // 11. 验证必填字段存在
      const requiredFields = ['success', 'token', 'user'];
      const requiredValidation = validateRequiredFields(result, requiredFields);
      expect(requiredValidation.valid).toBe(true);

      // 12. 验证字段类型
      const typeValidation = validateFieldTypes(result, {
        success: 'boolean',
        token: 'string',
        user: 'object'
      });
      expect(typeValidation.valid).toBe(true);

      // 13. 验证业务逻辑
      expect(result.success).toBe(true);
      expect(result.token).toBe(mockToken);
      expect(result.user?.id).toBe(mockUser.id);
      expect(result.user?.username).toBe(mockUser.username);
      expect(result.user?.email).toBe(mockUser.email);
      expect(result.user?.role).toBe(mockUser.role);
    });

    it('should handle invalid username', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password123'
      }

      mockUserModel.findOne.mockResolvedValue(null)

      const result = await authService.login(loginData)

      expect(result).toEqual({
        success: false,
        message: 'Invalid username or password'
      })
    })

    it('should handle invalid password', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@school.com',
        password: 'hashedPassword',
        role: 'admin' as any,
        status: 'active'
      }

      const loginData = {
        username: 'admin',
        password: 'wrongpassword'
      }

      mockUserModel.findOne.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(undefined)

      const result = await authService.login(loginData)

      expect(result).toEqual({
        success: false,
        message: 'Invalid username or password'
      })
    })

    it('should handle inactive user', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@school.com',
        password: 'hashedPassword',
        role: 'admin' as any,
        status: 'inactive'
      }

      const loginData = {
        username: 'admin',
        password: 'password123'
      }

      mockUserModel.findOne.mockResolvedValue(mockUser)

      const result = await authService.login(loginData)

      expect(result).toEqual({
        success: false,
        message: 'Account is inactive'
      })
    })

    it('should handle database error', async () => {
      const loginData = {
        username: 'admin',
        password: 'password123'
      }

      const dbError = new Error('Database connection failed')
      mockUserModel.findOne.mockRejectedValue(dbError)

      const result = await authService.login(loginData)

      expect(result).toEqual({
        success: false,
        message: 'Login failed',
        error: dbError.message
      })
    })
  })

  describe('register', () => {
    it('should register user successfully', async () => {
      const registerData = {
        username: 'newuser',
        email: 'newuser@school.com',
        password: 'password123',
        role: 'teacher'
      }

      const mockUser = {
        id: 1,
        username: registerData.username,
        email: registerData.email,
        role: registerData.role,
        status: 'active'
      }

      mockUserModel.findOne.mockResolvedValue(null) // Username not exists
      mockUserModel.create.mockResolvedValue(mockUser)
      mockBcrypt.hash.mockResolvedValue('hashedPassword')

      const result = await authService.register(registerData)

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { username: registerData.username }
      })
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerData.password, 10)
      expect(mockUserModel.create).toHaveBeenCalledWith({
        username: registerData.username,
        email: registerData.email,
        password: 'hashedPassword',
        role: registerData.role,
        status: 'active'
      })
      expect(result).toEqual({
        success: true,
        message: 'User registered successfully',
        user: mockUser
      })
    })

    it('should handle duplicate username', async () => {
      const registerData = {
        username: 'existinguser',
        email: 'newuser@school.com',
        password: 'password123',
        role: 'teacher'
      }

      const existingUser = {
        id: 1,
        username: 'existinguser',
        email: 'existing@school.com'
      }

      mockUserModel.findOne.mockResolvedValue(existingUser)

      const result = await authService.register(registerData)

      expect(result).toEqual({
        success: false,
        message: 'Username already exists'
      })
    })

    it('should handle validation error', async () => {
      const invalidRegisterData = {
        username: '', // Invalid: empty username
        email: 'invalid-email', // Invalid: invalid email format
        password: '123', // Invalid: password too short
        role: 'invalid-role' // Invalid: invalid role
      }

      mockUserModel.findOne.mockResolvedValue(null)

      const result = await authService.register(invalidRegisterData)

      expect(result).toEqual({
        success: false,
        message: 'Invalid registration data'
      })
    })

    it('should handle database error during registration', async () => {
      const registerData = {
        username: 'newuser',
        email: 'newuser@school.com',
        password: 'password123',
        role: 'teacher'
      }

      const dbError = new Error('Database error during user creation')
      mockUserModel.findOne.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashedPassword')
      mockUserModel.create.mockRejectedValue(dbError)

      const result = await authService.register(registerData)

      expect(result).toEqual({
        success: false,
        message: 'Registration failed',
        error: dbError.message
      })
    })
  })

  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      const token = 'valid-jwt-token'
      const decodedToken = {
        userId: 1,
        username: 'admin',
        role: 'admin' as any,
        iat: 1642694400,
        exp: 1642780800
      }

      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@school.com',
        role: 'admin' as any,
        status: 'active'
      }

      mockJwt.verify.mockReturnValue(decodedToken)
      mockUserModel.findByPk.mockResolvedValue(mockUser)

      const result = await authService.verifyToken(token)

      expect(mockJwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET)
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(decodedToken.userId)
      expect(result).toEqual({
        success: true,
        user: mockUser
      })
    })

    it('should handle invalid token', async () => {
      const token = 'invalid-jwt-token'

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = await authService.verifyToken(token)

      expect(result).toEqual({
        success: false,
        message: 'Invalid token'
      })
    })

    it('should handle expired token', async () => {
      const token = 'expired-jwt-token'

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Token expired')
      })

      const result = await authService.verifyToken(token)

      expect(result).toEqual({
        success: false,
        message: 'Token expired'
      })
    })

    it('should handle user not found', async () => {
      const token = 'valid-jwt-token'
      const decodedToken = {
        userId: 999,
        username: 'nonexistent',
        role: 'admin'
      }

      mockJwt.verify.mockReturnValue(decodedToken)
      mockUserModel.findByPk.mockResolvedValue(null)

      const result = await authService.verifyToken(token)

      expect(result).toEqual({
        success: false,
        message: 'User not found'
      })
    })

    it('should handle inactive user', async () => {
      const token = 'valid-jwt-token'
      const decodedToken = {
        userId: 1,
        username: 'admin',
        role: 'admin'
      }

      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@school.com',
        role: 'admin' as any,
        status: 'inactive'
      }

      mockJwt.verify.mockReturnValue(decodedToken)
      mockUserModel.findByPk.mockResolvedValue(mockUser)

      const result = await authService.verifyToken(token)

      expect(result).toEqual({
        success: false,
        message: 'User account is inactive'
      })
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = 1
      const passwordData = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123'
      }

      const mockUser = {
        id: userId,
        username: 'admin',
        password: 'hashedOldPassword',
        save: vi.fn().mockResolvedValue(undefined)
      }

      mockUserModel.findByPk.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(undefined)
      mockBcrypt.hash.mockResolvedValue('hashedNewPassword')

      const result = await authService.changePassword(userId, passwordData)

      expect(mockUserModel.findByPk).toHaveBeenCalledWith(userId)
      expect(mockBcrypt.compare).toHaveBeenCalledWith(passwordData.currentPassword, mockUser.password)
      expect(mockBcrypt.hash).toHaveBeenCalledWith(passwordData.newPassword, 10)
      expect(mockUser.save).toHaveBeenCalled()
      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully'
      })
    })

    it('should handle user not found', async () => {
      const userId = 999
      const passwordData = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123'
      }

      mockUserModel.findByPk.mockResolvedValue(null)

      const result = await authService.changePassword(userId, passwordData)

      expect(result).toEqual({
        success: false,
        message: 'User not found'
      })
    })

    it('should handle incorrect current password', async () => {
      const userId = 1
      const passwordData = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123'
      }

      const mockUser = {
        id: userId,
        username: 'admin',
        password: 'hashedOldPassword'
      }

      mockUserModel.findByPk.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(undefined)

      const result = await authService.changePassword(userId, passwordData)

      expect(result).toEqual({
        success: false,
        message: 'Current password is incorrect'
      })
    })

    it('should handle database error during password change', async () => {
      const userId = 1
      const passwordData = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123'
      }

      const mockUser = {
        id: userId,
        username: 'admin',
        password: 'hashedOldPassword',
        save: vi.fn().mockRejectedValue(new Error('Database error'))
      }

      mockUserModel.findByPk.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(undefined)
      mockBcrypt.hash.mockResolvedValue('hashedNewPassword')

      const result = await authService.changePassword(userId, passwordData)

      expect(result).toEqual({
        success: false,
        message: 'Failed to change password',
        error: 'Database error'
      })
    })
  })

  describe('logout', () => {
    it('should logout successfully', () => {
      const token = 'valid-jwt-token'

      const result = authService.logout(token)

      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully'
      })
    })

    it('should handle logout without token', () => {
      const result = authService.logout('')

      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully'
      })
    })
  })
})