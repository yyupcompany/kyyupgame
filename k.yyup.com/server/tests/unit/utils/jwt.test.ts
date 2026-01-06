/**
 * JWT工具函数测试
 */
import jwt from 'jsonwebtoken';
import { vi } from 'vitest'
import { generateToken, generateDynamicToken, verifyToken, extractTokenFromHeader } from '../../../src/utils/jwt';
import { JWT_SECRET, TOKEN_EXPIRE, REFRESH_TOKEN_EXPIRE, getDynamicTokenExpire } from '../../../src/config/jwt.config';

// Mock jwt.config
jest.mock('../../../src/config/jwt.config', () => ({
  JWT_SECRET: 'test-secret-key',
  TOKEN_EXPIRE: '1h',
  REFRESH_TOKEN_EXPIRE: '7d',
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh'
  },
  getDynamicTokenExpire: jest.fn()
}));


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('JWT Utils', () => {
  const mockPayload = { userId: 123, username: 'testuser' };
  const mockRefreshPayload = { userId: 123, username: 'testuser', isRefreshToken: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('应该生成访问令牌', () => {
      const token = generateToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // 验证token是否可以被解码
      const decoded = jwt.verify(token, 'test-secret-key') as any;
      expect(decoded.userId).toBe(123);
      expect(decoded.username).toBe('testuser');
    });

    it('应该生成刷新令牌', () => {
      const token = generateToken(mockRefreshPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // 验证token是否可以被解码
      const decoded = jwt.verify(token, 'test-secret-key') as any;
      expect(decoded.userId).toBe(123);
      expect(decoded.isRefreshToken).toBe(true);
    });

    it('应该使用正确的过期时间', () => {
      // 测试访问令牌过期时间
      const accessToken = generateToken(mockPayload);
      const decodedAccess = jwt.verify(accessToken, 'test-secret-key') as any;
      expect(decodedAccess.exp - decodedAccess.iat).toBe(3600); // 1小时 = 3600秒

      // 测试刷新令牌过期时间
      const refreshToken = generateToken(mockRefreshPayload);
      const decodedRefresh = jwt.verify(refreshToken, 'test-secret-key') as any;
      expect(decodedRefresh.exp - decodedRefresh.iat).toBe(604800); // 7天 = 604800秒
    });
  });

  describe('generateDynamicToken', () => {
    it('应该生成动态访问令牌', async () => {
      const mockDynamicExpire = '2h';
      (getDynamicTokenExpire as jest.Mock).mockResolvedValue(mockDynamicExpire);

      const token = await generateDynamicToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(getDynamicTokenExpire).toHaveBeenCalled();
      
      // 验证token是否可以被解码
      const decoded = jwt.verify(token, 'test-secret-key') as any;
      expect(decoded.userId).toBe(123);
    });

    it('应该为刷新令牌使用固定过期时间', async () => {
      const token = await generateDynamicToken(mockRefreshPayload);
      
      expect(token).toBeDefined();
      expect(getDynamicTokenExpire).not.toHaveBeenCalled();
      
      // 验证token是否可以被解码
      const decoded = jwt.verify(token, 'test-secret-key') as any;
      expect(decoded.isRefreshToken).toBe(true);
    });

    it('应该处理getDynamicTokenExpire的异常', async () => {
      (getDynamicTokenExpire as jest.Mock).mockRejectedValue(new Error('Config error'));

      await expect(generateDynamicToken(mockPayload)).rejects.toThrow('Config error');
    });
  });

  describe('verifyToken', () => {
    it('应该验证有效的令牌', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(123);
      expect(decoded.username).toBe('testuser');
    });

    it('应该拒绝无效的令牌', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('应该拒绝过期的令牌', () => {
      // 创建一个已过期的token
      const expiredToken = jwt.sign(mockPayload, 'test-secret-key', { expiresIn: '-1s' });
      
      expect(() => verifyToken(expiredToken)).toThrow();
    });

    it('应该拒绝使用错误密钥签名的令牌', () => {
      const wrongKeyToken = jwt.sign(mockPayload, 'wrong-secret-key');
      
      expect(() => verifyToken(wrongKeyToken)).toThrow();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('应该从有效的Authorization头中提取令牌', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const authHeader = `Bearer ${token}`;
      
      const extracted = extractTokenFromHeader(authHeader);
      expect(extracted).toBe(token);
    });

    it('应该处理undefined的Authorization头', () => {
      const extracted = extractTokenFromHeader(undefined);
      expect(extracted).toBeNull();
    });

    it('应该处理空的Authorization头', () => {
      const extracted = extractTokenFromHeader('');
      expect(extracted).toBeNull();
    });

    it('应该拒绝格式错误的Authorization头', () => {
      // 缺少Bearer前缀
      expect(extractTokenFromHeader('token123')).toBeNull();
      
      // 错误的前缀
      expect(extractTokenFromHeader('Basic token123')).toBeNull();
      
      // 多余的部分
      expect(extractTokenFromHeader('Bearer token123 extra')).toBeNull();
      
      // 只有Bearer没有token
      expect(extractTokenFromHeader('Bearer')).toBeNull();
    });

    it('应该处理包含空格的令牌', () => {
      const authHeader = 'Bearer token123';
      const extracted = extractTokenFromHeader(authHeader);
      expect(extracted).toBe('token123');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空的payload', () => {
      const token = generateToken({});
      expect(token).toBeDefined();
      
      const decoded = verifyToken(token);
      expect(typeof decoded).toBe('object');
    });

    it('应该处理包含特殊字符的payload', () => {
      const specialPayload = {
        userId: 123,
        username: 'test@user.com',
        role: 'admin/teacher',
        metadata: { 'special-key': 'special-value' }
      };
      
      const token = generateToken(specialPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.username).toBe('test@user.com');
      expect(decoded.role).toBe('admin/teacher');
      expect(decoded.metadata['special-key']).toBe('special-value');
    });

    it('应该处理大型payload', () => {
      const largePayload = {
        userId: 123,
        data: 'x'.repeat(1000) // 1000个字符的字符串
      };
      
      const token = generateToken(largePayload);
      const decoded = verifyToken(token);
      
      expect(decoded.data).toBe('x'.repeat(1000));
    });
  });
});
