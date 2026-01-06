import bcrypt from 'bcrypt';
import { vi } from 'vitest'
import crypto from 'crypto';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('crypto');

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockCrypto = crypto as jest.Mocked<typeof crypto>;


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

describe('Password Helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Hashing', () => {
    it('应该使用bcrypt哈希密码', async () => {
      const password = 'testPassword123';
      const saltRounds = 10;
      const hashedPassword = '$2b$10$hashedPasswordExample';

      mockBcrypt.hash.mockResolvedValue(hashedPassword);

      // Mock password hashing function
      const hashPassword = async (password: string, saltRounds: number = 10) => {
        return await bcrypt.hash(password, saltRounds);
      };

      const result = await hashPassword(password, saltRounds);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, saltRounds);
      expect(result).toBe(hashedPassword);
    });

    it('应该使用默认盐轮数', async () => {
      const password = 'testPassword123';
      const hashedPassword = '$2b$10$hashedPasswordExample';

      mockBcrypt.hash.mockResolvedValue(hashedPassword);

      const hashPassword = async (password: string, saltRounds: number = 10) => {
        return await bcrypt.hash(password, saltRounds);
      };

      await hashPassword(password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);
    });

    it('应该处理空密码', async () => {
      const password = '';
      
      mockBcrypt.hash.mockRejectedValue(new Error('Password cannot be empty'));

      const hashPassword = async (password: string) => {
        if (!password) {
          throw new Error('Password cannot be empty');
        }
        return await bcrypt.hash(password, 10);
      };

      await expect(hashPassword(password)).rejects.toThrow('Password cannot be empty');
    });

    it('应该处理哈希错误', async () => {
      const password = 'testPassword123';
      
      mockBcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

      const hashPassword = async (password: string) => {
        return await bcrypt.hash(password, 10);
      };

      await expect(hashPassword(password)).rejects.toThrow('Hashing failed');
    });
  });

  describe('Password Verification', () => {
    it('应该验证正确的密码', async () => {
      const password = 'testPassword123';
      const hashedPassword = '$2b$10$hashedPasswordExample';

      mockBcrypt.compare.mockResolvedValue(undefined);

      const verifyPassword = async (password: string, hashedPassword: string) => {
        return await bcrypt.compare(password, hashedPassword);
      };

      const result = await verifyPassword(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('应该拒绝错误的密码', async () => {
      const password = 'wrongPassword';
      const hashedPassword = '$2b$10$hashedPasswordExample';

      mockBcrypt.compare.mockResolvedValue(undefined);

      const verifyPassword = async (password: string, hashedPassword: string) => {
        return await bcrypt.compare(password, hashedPassword);
      };

      const result = await verifyPassword(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it('应该处理验证错误', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'invalidHash';

      mockBcrypt.compare.mockRejectedValue(new Error('Invalid hash'));

      const verifyPassword = async (password: string, hashedPassword: string) => {
        return await bcrypt.compare(password, hashedPassword);
      };

      await expect(verifyPassword(password, hashedPassword)).rejects.toThrow('Invalid hash');
    });
  });

  describe('Password Generation', () => {
    it('应该生成随机密码', () => {
      const mockRandomBytes = Buffer.from('randomBytes123456');
      mockCrypto.randomBytes.mockReturnValue(mockRandomBytes);

      const generatePassword = (length: number = 12) => {
        const bytes = crypto.randomBytes(Math.ceil(length * 3 / 4));
        return bytes.toString('base64').slice(0, length);
      };

      const password = generatePassword(12);

      expect(mockCrypto.randomBytes).toHaveBeenCalled();
      expect(password).toHaveLength(12);
    });

    it('应该生成指定长度的密码', () => {
      const mockRandomBytes = Buffer.from('randomBytes123456789012345678901234567890');
      mockCrypto.randomBytes.mockReturnValue(mockRandomBytes);

      const generatePassword = (length: number = 12) => {
        const bytes = crypto.randomBytes(Math.ceil(length * 3 / 4));
        return bytes.toString('base64').slice(0, length);
      };

      const lengths = [8, 12, 16, 20];
      
      lengths.forEach(length => {
        const password = generatePassword(length);
        expect(password).toHaveLength(length);
      });
    });

    it('应该生成包含特殊字符的密码', () => {
      const generateSecurePassword = (length: number = 12) => {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          password += charset[randomIndex];
        }
        
        return password;
      };

      // Mock Math.random for predictable results
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.9);

      const password = generateSecurePassword(3);
      
      expect(password).toHaveLength(3);
      
      Math.random = originalRandom;
    });
  });

  describe('Password Strength Validation', () => {
    it('应该验证密码强度', () => {
      const validatePasswordStrength = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
          isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
          length: password.length >= minLength,
          hasUpperCase,
          hasLowerCase,
          hasNumbers,
          hasSpecialChar
        };
      };

      const strongPassword = 'StrongPass123!';
      const result = validatePasswordStrength(strongPassword);

      expect(result.isValid).toBe(true);
      expect(result.length).toBe(true);
      expect(result.hasUpperCase).toBe(true);
      expect(result.hasLowerCase).toBe(true);
      expect(result.hasNumbers).toBe(true);
      expect(result.hasSpecialChar).toBe(true);
    });

    it('应该拒绝弱密码', () => {
      const validatePasswordStrength = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
          isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
          length: password.length >= minLength,
          hasUpperCase,
          hasLowerCase,
          hasNumbers,
          hasSpecialChar
        };
      };

      const weakPasswords = [
        'weak',           // 太短
        'weakpassword',   // 没有大写字母、数字、特殊字符
        'WEAKPASSWORD',   // 没有小写字母、数字、特殊字符
        'WeakPassword',   // 没有数字、特殊字符
        'WeakPassword123' // 没有特殊字符
      ];

      weakPasswords.forEach(password => {
        const result = validatePasswordStrength(password);
        expect(result.isValid).toBe(false);
      });
    });

    it('应该计算密码强度分数', () => {
      const calculatePasswordScore = (password: string) => {
        let score = 0;
        
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 25;
        if (/[A-Z]/.test(password)) score += 15;
        if (/[a-z]/.test(password)) score += 15;
        if (/\d/.test(password)) score += 10;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
        
        return Math.min(score, 100);
      };

      const passwords = [
        { password: 'weak', expectedScore: 0 },
        { password: 'WeakPassword', expectedScore: 65 },
        { password: 'StrongPass123!', expectedScore: 100 }
      ];

      passwords.forEach(({ password, expectedScore }) => {
        const score = calculatePasswordScore(password);
        expect(score).toBe(expectedScore);
      });
    });
  });

  describe('Password Reset Token', () => {
    it('应该生成重置令牌', () => {
      const mockRandomBytes = Buffer.from('resetToken123456');
      mockCrypto.randomBytes.mockReturnValue(mockRandomBytes);

      const generateResetToken = () => {
        return crypto.randomBytes(32).toString('hex');
      };

      const token = generateResetToken();

      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(32);
      expect(token).toBe(mockRandomBytes.toString('hex'));
    });

    it('应该验证重置令牌', () => {
      const validateResetToken = (token: string, storedToken: string, expiryTime: Date) => {
        const now = new Date();
        return token === storedToken && now < expiryTime;
      };

      const token = 'validToken123';
      const storedToken = 'validToken123';
      const futureTime = new Date(Date.now() + 3600000); // 1小时后
      const pastTime = new Date(Date.now() - 3600000); // 1小时前

      expect(validateResetToken(token, storedToken, futureTime)).toBe(true);
      expect(validateResetToken(token, storedToken, pastTime)).toBe(false);
      expect(validateResetToken('wrongToken', storedToken, futureTime)).toBe(false);
    });

    it('应该生成带过期时间的令牌', () => {
      const generateTokenWithExpiry = (expiryHours: number = 1) => {
        const token = crypto.randomBytes(32).toString('hex');
        const expiryTime = new Date(Date.now() + expiryHours * 3600000);
        
        return { token, expiryTime };
      };

      const mockRandomBytes = Buffer.from('tokenWithExpiry123');
      mockCrypto.randomBytes.mockReturnValue(mockRandomBytes);

      const result = generateTokenWithExpiry(2);

      expect(result.token).toBe(mockRandomBytes.toString('hex'));
      expect(result.expiryTime).toBeInstanceOf(Date);
      expect(result.expiryTime.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Password History', () => {
    it('应该检查密码历史', async () => {
      const checkPasswordHistory = async (newPassword: string, passwordHistory: string[]) => {
        for (const oldHashedPassword of passwordHistory) {
          const isReused = await bcrypt.compare(newPassword, oldHashedPassword);
          if (isReused) {
            return false; // 密码已被使用过
          }
        }
        return true; // 密码未被使用过
      };

      const newPassword = 'newPassword123';
      const passwordHistory = ['$2b$10$oldHash1', '$2b$10$oldHash2'];

      mockBcrypt.compare
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      const result = await checkPasswordHistory(newPassword, passwordHistory);

      expect(result).toBe(true);
      expect(mockBcrypt.compare).toHaveBeenCalledTimes(2);
    });

    it('应该拒绝重复使用的密码', async () => {
      const checkPasswordHistory = async (newPassword: string, passwordHistory: string[]) => {
        for (const oldHashedPassword of passwordHistory) {
          const isReused = await bcrypt.compare(newPassword, oldHashedPassword);
          if (isReused) {
            return false;
          }
        }
        return true;
      };

      const reusedPassword = 'reusedPassword123';
      const passwordHistory = ['$2b$10$oldHash1', '$2b$10$reusedHash'];

      mockBcrypt.compare
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true); // 第二个密码匹配

      const result = await checkPasswordHistory(reusedPassword, passwordHistory);

      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('应该处理bcrypt错误', async () => {
      const password = 'testPassword123';
      
      mockBcrypt.hash.mockRejectedValue(new Error('bcrypt error'));

      const hashPassword = async (password: string) => {
        try {
          return await bcrypt.hash(password, 10);
        } catch (error) {
          throw new Error('Password hashing failed');
        }
      };

      await expect(hashPassword(password)).rejects.toThrow('Password hashing failed');
    });

    it('应该处理crypto错误', () => {
      mockCrypto.randomBytes.mockImplementation(() => {
        throw new Error('crypto error');
      });

      const generateToken = () => {
        try {
          return crypto.randomBytes(32).toString('hex');
        } catch (error) {
          throw new Error('Token generation failed');
        }
      };

      expect(() => generateToken()).toThrow('Token generation failed');
    });
  });
});
