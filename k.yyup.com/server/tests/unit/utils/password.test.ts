/**
 * 密码工具函数测试
 */
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { hashPassword, verifyPassword, generateRandomToken } from '../../../src/utils/password';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('Password Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 清除console.log的输出
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('hashPassword', () => {
    it('应该对密码进行哈希处理', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashedPassword123';
      
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      
      const result = await hashPassword(password);
      
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    it('应该处理空密码', async () => {
      const password = '';
      const hashedPassword = 'hashedEmptyPassword';
      
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      
      const result = await hashPassword(password);
      
      expect(mockBcrypt.hash).toHaveBeenCalledWith('', 10);
      expect(result).toBe(hashedPassword);
    });

    it('应该处理包含特殊字符的密码', async () => {
      const password = 'test@#$%^&*()_+密码123';
      const hashedPassword = 'hashedSpecialPassword';
      
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      
      const result = await hashPassword(password);
      
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    it('应该处理bcrypt错误', async () => {
      const password = 'testPassword123';
      const error = new Error('Bcrypt error');
      
      (mockBcrypt.hash as jest.Mock).mockRejectedValue(error);
      
      await expect(hashPassword(password)).rejects.toThrow('Bcrypt error');
    });
  });

  describe('verifyPassword', () => {
    describe('MD5哈希验证', () => {
      it('应该验证MD5哈希密码（默认编码）', async () => {
        const password = 'testPassword123';
        const md5Hash = crypto.createHash('md5').update(password).digest('hex');
        
        const result = await verifyPassword(password, md5Hash);
        
        expect(result).toBe(true);
      });

      it('应该验证MD5哈希密码（UTF8编码）', async () => {
        const password = 'testPassword123';
        const md5Hash = crypto.createHash('md5').update(password, 'utf8').digest('hex');
        
        const result = await verifyPassword(password, md5Hash);
        
        expect(result).toBe(true);
      });

      it('应该验证MD5哈希密码（ASCII编码）', async () => {
        const password = 'testPassword123';
        const md5Hash = crypto.createHash('md5').update(password, 'ascii').digest('hex');
        
        const result = await verifyPassword(password, md5Hash);
        
        expect(result).toBe(true);
      });

      it('应该验证MD5哈希密码（Binary编码）', async () => {
        const password = 'testPassword123';
        const md5Hash = crypto.createHash('md5').update(Buffer.from(password, 'binary')).digest('hex');
        
        const result = await verifyPassword(password, md5Hash);
        
        expect(result).toBe(true);
      });

      it('应该拒绝错误的MD5哈希', async () => {
        const password = 'testPassword123';
        const wrongHash = 'a1b2c3d4e5f67890123456789012345'; // 错误的32位哈希

        // Mock bcrypt.compare for fallback
        mockBcrypt.compare.mockResolvedValue(false as never);

        const result = await verifyPassword(password, wrongHash);

        expect(result).toBe(false);
      });

      it('应该处理包含中文的密码MD5验证', async () => {
        const password = '测试密码123';
        const md5Hash = crypto.createHash('md5').update(password, 'utf8').digest('hex');
        
        const result = await verifyPassword(password, md5Hash);
        
        expect(result).toBe(true);
      });

      it('应该识别有效的MD5格式', async () => {
        const validMd5 = '5d41402abc4b2a76b9719d911017c592'; // "hello"的MD5
        const password = 'hello';
        
        const result = await verifyPassword(password, validMd5);
        
        expect(result).toBe(true);
      });

      it('应该拒绝无效的MD5格式', async () => {
        // 不是32位的哈希
        const invalidHash1 = '5d41402abc4b2a76b9719d911017c59'; // 31位
        const invalidHash2 = '5d41402abc4b2a76b9719d911017c5922'; // 33位
        
        mockBcrypt.compare.mockResolvedValue(false as never);
        
        const result1 = await verifyPassword('hello', invalidHash1);
        const result2 = await verifyPassword('hello', invalidHash2);
        
        expect(result1).toBe(false);
        expect(result2).toBe(false);
        expect(mockBcrypt.compare).toHaveBeenCalledTimes(2);
      });
    });

    describe('Bcrypt哈希验证', () => {
      it('应该验证bcrypt哈希密码', async () => {
        const password = 'testPassword123';
        const bcryptHash = '$2b$10$N9qo8uLOickgx2ZMRZoMye';
        
        mockBcrypt.compare.mockResolvedValue(true as never);
        
        const result = await verifyPassword(password, bcryptHash);
        
        expect(mockBcrypt.compare).toHaveBeenCalledWith(password, bcryptHash);
        expect(result).toBe(true);
      });

      it('应该拒绝错误的bcrypt密码', async () => {
        const password = 'testPassword123';
        const bcryptHash = '$2b$10$N9qo8uLOickgx2ZMRZoMye';
        
        mockBcrypt.compare.mockResolvedValue(false as never);
        
        const result = await verifyPassword(password, bcryptHash);
        
        expect(mockBcrypt.compare).toHaveBeenCalledWith(password, bcryptHash);
        expect(result).toBe(false);
      });

      it('应该处理bcrypt验证错误', async () => {
        const password = 'testPassword123';
        const bcryptHash = '$2b$10$N9qo8uLOickgx2ZMRZoMye';
        const error = new Error('Bcrypt compare error');
        
        (mockBcrypt.compare as jest.Mock).mockRejectedValue(error);
        
        const result = await verifyPassword(password, bcryptHash);
        
        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledWith('密码验证错误:', error);
      });
    });

    describe('边界情况', () => {
      it('应该处理空密码', async () => {
        const password = '';
        const hash = '';

        const result = await verifyPassword(password, hash);

        expect(result).toBe(false);
      });

      it('应该处理空哈希', async () => {
        const password = 'testPassword123';
        const hash = '';
        
        mockBcrypt.compare.mockResolvedValue(false as never);
        
        const result = await verifyPassword(password, hash);
        
        expect(result).toBe(false);
      });

      it('应该处理非常长的密码', async () => {
        const longPassword = 'a'.repeat(1000);
        const md5Hash = crypto.createHash('md5').update(longPassword).digest('hex');
        
        const result = await verifyPassword(longPassword, md5Hash);
        
        expect(result).toBe(true);
      });
    });
  });

  describe('generateRandomToken', () => {
    it('应该生成默认长度的随机令牌', () => {
      const token = generateRandomToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32字节 * 2 (hex编码)
      expect(/^[a-f0-9]+$/i.test(token)).toBe(true);
    });

    it('应该生成指定长度的随机令牌', () => {
      const length = 16;
      const token = generateRandomToken(length);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(32); // 16字节 * 2 (hex编码)
      expect(/^[a-f0-9]+$/i.test(token)).toBe(true);
    });

    it('应该生成不同的随机令牌', () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();
      
      expect(token1).not.toBe(token2);
    });

    it('应该处理零长度', () => {
      const token = generateRandomToken(0);
      
      expect(token).toBe('');
    });

    it('应该处理负数长度', () => {
      expect(() => generateRandomToken(-5)).toThrow('Token length must be non-negative');
    });

    it('应该处理大长度值', () => {
      const length = 1000;
      const token = generateRandomToken(length);
      
      expect(token.length).toBe(2000); // 1000字节 * 2 (hex编码)
      expect(/^[a-f0-9]+$/i.test(token)).toBe(true);
    });
  });
});
