import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock crypto
const mockCrypto = {
  randomBytes: jest.fn(),
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('hashed-value')
  }),
  createCipher: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    final: jest.fn().mockReturnValue('encrypted-data')
  }),
  createDecipher: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    final: jest.fn().mockReturnValue('decrypted-data')
  }),
  timingSafeEqual: jest.fn()
};

// Mock bcrypt
const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn()
};

// Mock rate limiter
const mockRateLimiter = {
  consume: jest.fn(),
  reset: jest.fn(),
  get: jest.fn()
};

// Mock models
const mockSecurityConfig = {
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};

const mockSecurityThreat = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn()
};

const mockSecurityScanLog = {
  create: jest.fn(),
  findAll: jest.fn()
};

const mockUser = {
  findByPk: jest.fn(),
  update: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Mock imports
jest.unstable_mockModule('crypto', () => ({ default: mockCrypto }));
jest.unstable_mockModule('bcrypt', () => ({ default: mockBcrypt }));
jest.unstable_mockModule('rate-limiter-flexible', () => ({
  RateLimiterMemory: jest.fn(() => mockRateLimiter)
}));

jest.unstable_mockModule('../../../../../src/models/SecurityConfig', () => ({
  default: mockSecurityConfig
}));

jest.unstable_mockModule('../../../../../src/models/SecurityThreat', () => ({
  default: mockSecurityThreat
}));

jest.unstable_mockModule('../../../../../src/models/SecurityScanLog', () => ({
  default: mockSecurityScanLog
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  default: mockUser
}));

jest.unstable_mockModule('../../../../../src/utils/logger', () => ({
  default: mockLogger
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

describe('Security Service', () => {
  let securityService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/security.service');
    securityService = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockCrypto.randomBytes.mockReturnValue(Buffer.from('random-bytes'));
    mockBcrypt.hash.mockResolvedValue('hashed-password');
    mockBcrypt.compare.mockResolvedValue(undefined);
    mockRateLimiter.consume.mockResolvedValue({ remainingHits: 5 });
  });

  describe('hashPassword', () => {
    it('应该成功哈希密码', async () => {
      const password = 'test-password';
      const saltRounds = 12;

      mockBcrypt.genSalt.mockResolvedValue('salt');
      mockBcrypt.hash.mockResolvedValue('hashed-password');

      const result = await securityService.hashPassword(password, saltRounds);

      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(saltRounds);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 'salt');
      expect(result).toBe('hashed-password');
    });

    it('应该使用默认盐轮数', async () => {
      const password = 'test-password';

      await securityService.hashPassword(password);

      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10); // 默认值
    });

    it('应该处理哈希失败', async () => {
      const password = 'test-password';

      mockBcrypt.hash.mockRejectedValue(new Error('哈希失败'));

      await expect(securityService.hashPassword(password))
        .rejects.toThrow('哈希失败');
    });
  });

  describe('verifyPassword', () => {
    it('应该验证正确密码', async () => {
      const password = 'test-password';
      const hashedPassword = 'hashed-password';

      mockBcrypt.compare.mockResolvedValue(undefined);

      const result = await securityService.verifyPassword(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('应该拒绝错误密码', async () => {
      const password = 'wrong-password';
      const hashedPassword = 'hashed-password';

      mockBcrypt.compare.mockResolvedValue(undefined);

      const result = await securityService.verifyPassword(password, hashedPassword);

      expect(result).toBe(false);
    });

    it('应该处理验证错误', async () => {
      const password = 'test-password';
      const hashedPassword = 'hashed-password';

      mockBcrypt.compare.mockRejectedValue(new Error('验证失败'));

      await expect(securityService.verifyPassword(password, hashedPassword))
        .rejects.toThrow('验证失败');
    });
  });

  describe('generateSecureToken', () => {
    it('应该生成安全令牌', () => {
      const length = 32;
      const mockBuffer = Buffer.from('random-secure-bytes');

      mockCrypto.randomBytes.mockReturnValue(mockBuffer);

      const result = securityService.generateSecureToken(length);

      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(length);
      expect(result).toBe(mockBuffer.toString('hex'));
    });

    it('应该使用默认长度', () => {
      securityService.generateSecureToken();

      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(16); // 默认长度
    });

    it('应该处理生成失败', () => {
      mockCrypto.randomBytes.mockImplementation(() => {
        throw new Error('随机数生成失败');
      });

      expect(() => securityService.generateSecureToken())
        .toThrow('随机数生成失败');
    });
  });

  describe('encryptData', () => {
    it('应该加密数据', () => {
      const data = 'sensitive-data';
      const key = 'encryption-key';

      const result = securityService.encryptData(data, key);

      expect(mockCrypto.createCipher).toHaveBeenCalledWith('aes-256-cbc', key);
      expect(result).toBe('encrypted-data');
    });

    it('应该处理加密失败', () => {
      const data = 'sensitive-data';
      const key = 'encryption-key';

      mockCrypto.createCipher.mockImplementation(() => {
        throw new Error('加密失败');
      });

      expect(() => securityService.encryptData(data, key))
        .toThrow('加密失败');
    });
  });

  describe('decryptData', () => {
    it('应该解密数据', () => {
      const encryptedData = 'encrypted-data';
      const key = 'encryption-key';

      const result = securityService.decryptData(encryptedData, key);

      expect(mockCrypto.createDecipher).toHaveBeenCalledWith('aes-256-cbc', key);
      expect(result).toBe('decrypted-data');
    });

    it('应该处理解密失败', () => {
      const encryptedData = 'encrypted-data';
      const key = 'wrong-key';

      mockCrypto.createDecipher.mockImplementation(() => {
        throw new Error('解密失败');
      });

      expect(() => securityService.decryptData(encryptedData, key))
        .toThrow('解密失败');
    });
  });

  describe('validatePasswordStrength', () => {
    it('应该验证强密码', () => {
      const strongPassword = 'StrongP@ssw0rd123';

      const result = securityService.validatePasswordStrength(strongPassword);

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(3);
      expect(result.feedback).toHaveLength(0);
    });

    it('应该拒绝弱密码', () => {
      const weakPassword = '123456';

      const result = securityService.validatePasswordStrength(weakPassword);

      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(3);
      expect(result.feedback).toContain('密码长度至少8位');
      expect(result.feedback).toContain('需要包含大写字母');
      expect(result.feedback).toContain('需要包含小写字母');
      expect(result.feedback).toContain('需要包含特殊字符');
    });

    it('应该检测常见密码', () => {
      const commonPassword = 'password123';

      const result = securityService.validatePasswordStrength(commonPassword);

      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('避免使用常见密码');
    });

    it('应该检测重复字符', () => {
      const repeatPassword = 'aaaaaaaaA1!';

      const result = securityService.validatePasswordStrength(repeatPassword);

      expect(result.feedback).toContain('避免重复字符');
    });
  });

  describe('checkRateLimit', () => {
    it('应该允许正常请求', async () => {
      const key = 'user:123';
      const points = 1;

      mockRateLimiter.consume.mockResolvedValue({ remainingHits: 4 });

      const result = await securityService.checkRateLimit(key, points);

      expect(mockRateLimiter.consume).toHaveBeenCalledWith(key, points);
      expect(result.allowed).toBe(true);
      expect(result.remainingHits).toBe(4);
    });

    it('应该阻止超限请求', async () => {
      const key = 'user:123';
      const points = 1;

      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimiterError';
      rateLimitError.remainingHits = 0;
      rateLimitError.msBeforeNext = 60000;

      mockRateLimiter.consume.mockRejectedValue(rateLimitError);

      const result = await securityService.checkRateLimit(key, points);

      expect(result.allowed).toBe(false);
      expect(result.remainingHits).toBe(0);
      expect(result.retryAfter).toBe(60);
    });

    it('应该处理限流器错误', async () => {
      const key = 'user:123';

      mockRateLimiter.consume.mockRejectedValue(new Error('限流器故障'));

      await expect(securityService.checkRateLimit(key))
        .rejects.toThrow('限流器故障');
    });
  });

  describe('detectSuspiciousActivity', () => {
    it('应该检测可疑登录活动', async () => {
      const activityData = {
        userId: 1,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        action: 'login',
        timestamp: new Date()
      };

      const mockPreviousActivity = [
        { ip: '10.0.0.1', userAgent: 'Different Browser', timestamp: new Date() }
      ];

      mockSecurityScanLog.findAll.mockResolvedValue(mockPreviousActivity);

      const result = await securityService.detectSuspiciousActivity(activityData);

      expect(result.suspicious).toBe(true);
      expect(result.reasons).toContain('新IP地址登录');
      expect(result.reasons).toContain('新设备登录');
      expect(result.riskScore).toBeGreaterThan(0.5);
    });

    it('应该检测异常时间登录', async () => {
      const activityData = {
        userId: 1,
        ip: '192.168.1.100',
        action: 'login',
        timestamp: new Date('2024-03-15T03:00:00Z') // 凌晨3点
      };

      mockSecurityScanLog.findAll.mockResolvedValue([]);

      const result = await securityService.detectSuspiciousActivity(activityData);

      expect(result.reasons).toContain('异常时间登录');
    });

    it('应该检测频繁失败登录', async () => {
      const activityData = {
        userId: 1,
        ip: '192.168.1.100',
        action: 'login_failed'
      };

      const mockFailedAttempts = Array.from({ length: 5 }, () => ({
        action: 'login_failed',
        timestamp: new Date()
      }));

      mockSecurityScanLog.findAll.mockResolvedValue(mockFailedAttempts);

      const result = await securityService.detectSuspiciousActivity(activityData);

      expect(result.suspicious).toBe(true);
      expect(result.reasons).toContain('频繁登录失败');
    });

    it('应该检测地理位置异常', async () => {
      const activityData = {
        userId: 1,
        ip: '8.8.8.8', // 美国IP
        action: 'login'
      };

      const mockPreviousActivity = [
        { ip: '114.114.114.114', location: { country: 'CN' } } // 中国IP
      ];

      mockSecurityScanLog.findAll.mockResolvedValue(mockPreviousActivity);

      const result = await securityService.detectSuspiciousActivity(activityData);

      expect(result.reasons).toContain('地理位置异常');
    });
  });

  describe('blockSuspiciousUser', () => {
    it('应该阻止可疑用户', async () => {
      const userId = 1;
      const reason = '多次登录失败';
      const duration = 3600; // 1小时

      const mockUser = {
        id: 1,
        status: 'active',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockUser.findByPk.mockResolvedValue(mockUser);

      const result = await securityService.blockSuspiciousUser(userId, reason, duration);

      expect(mockUser.update).toHaveBeenCalledWith({
        status: 'blocked',
        blockedUntil: expect.any(Date),
        blockReason: reason
      });
      expect(mockSecurityThreat.create).toHaveBeenCalledWith({
        userId: userId,
        type: 'user_blocked',
        severity: 'medium',
        description: reason,
        status: 'active'
      });
      expect(result.blocked).toBe(true);
    });

    it('应该处理用户不存在', async () => {
      const userId = 999;

      mockUser.findByPk.mockResolvedValue(null);

      await expect(securityService.blockSuspiciousUser(userId, '测试'))
        .rejects.toThrow('用户不存在');
    });

    it('应该处理永久阻止', async () => {
      const userId = 1;
      const reason = '恶意攻击';

      const mockUser = {
        id: 1,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockUser.findByPk.mockResolvedValue(mockUser);

      await securityService.blockSuspiciousUser(userId, reason, 0); // 0表示永久

      expect(mockUser.update).toHaveBeenCalledWith({
        status: 'blocked',
        blockedUntil: null, // 永久阻止
        blockReason: reason
      });
    });
  });

  describe('scanForVulnerabilities', () => {
    it('应该扫描系统漏洞', async () => {
      const scanOptions = {
        scanType: 'full',
        targets: ['database', 'api', 'files'],
        severity: 'high'
      };

      const mockVulnerabilities = [
        {
          type: 'sql_injection',
          severity: 'high',
          location: '/api/users',
          description: 'SQL注入漏洞'
        },
        {
          type: 'xss',
          severity: 'medium',
          location: '/api/comments',
          description: 'XSS漏洞'
        }
      ];

      // Mock vulnerability scanning logic
      jest.spyOn(securityService, '_scanDatabase').mockResolvedValue([mockVulnerabilities[0]]);
      jest.spyOn(securityService, '_scanAPI').mockResolvedValue([mockVulnerabilities[1]]);
      jest.spyOn(securityService, '_scanFiles').mockResolvedValue([]);

      const result = await securityService.scanForVulnerabilities(scanOptions);

      expect(result.vulnerabilities).toHaveLength(2);
      expect(result.summary.high).toBe(1);
      expect(result.summary.medium).toBe(1);
      expect(result.summary.low).toBe(0);
      expect(mockSecurityScanLog.create).toHaveBeenCalledWith({
        scanType: 'full',
        status: 'completed',
        vulnerabilitiesFound: 2,
        highSeverity: 1,
        mediumSeverity: 1,
        lowSeverity: 0
      });
    });

    it('应该处理扫描失败', async () => {
      const scanOptions = {
        scanType: 'quick'
      };

      jest.spyOn(securityService, '_scanDatabase').mockRejectedValue(new Error('数据库扫描失败'));

      const result = await securityService.scanForVulnerabilities(scanOptions);

      expect(result.status).toBe('failed');
      expect(result.errors).toContain('数据库扫描失败');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('generateSecurityReport', () => {
    it('应该生成安全报告', async () => {
      const reportOptions = {
        timeRange: {
          start: new Date('2024-03-01'),
          end: new Date('2024-03-31')
        },
        includeThreats: true,
        includeVulnerabilities: true,
        includeUserActivity: true
      };

      const mockThreats = [
        { type: 'brute_force', severity: 'high', status: 'blocked' },
        { type: 'suspicious_login', severity: 'medium', status: 'monitoring' }
      ];

      const mockVulnerabilities = [
        { type: 'sql_injection', severity: 'high', status: 'fixed' }
      ];

      const mockUserActivity = [
        { action: 'login_failed', count: 15 },
        { action: 'password_changed', count: 3 }
      ];

      mockSecurityThreat.findAll.mockResolvedValue(mockThreats);
      mockSecurityScanLog.findAll.mockResolvedValue([{ vulnerabilitiesFound: 1 }]);

      const result = await securityService.generateSecurityReport(reportOptions);

      expect(result.summary.totalThreats).toBe(2);
      expect(result.summary.highSeverityThreats).toBe(1);
      expect(result.summary.blockedThreats).toBe(1);
      expect(result.threats).toEqual(mockThreats);
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations).toContain('加强密码策略');
    });

    it('应该生成安全建议', async () => {
      const reportOptions = {
        timeRange: {
          start: new Date('2024-03-01'),
          end: new Date('2024-03-31')
        }
      };

      mockSecurityThreat.findAll.mockResolvedValue([
        { type: 'brute_force', severity: 'high' },
        { type: 'brute_force', severity: 'high' },
        { type: 'brute_force', severity: 'high' }
      ]);

      const result = await securityService.generateSecurityReport(reportOptions);

      expect(result.recommendations).toContain('启用账户锁定机制');
      expect(result.recommendations).toContain('实施多因素认证');
    });
  });

  describe('updateSecurityConfig', () => {
    it('应该更新安全配置', async () => {
      const configUpdates = {
        passwordPolicy: {
          minLength: 12,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        sessionTimeout: 3600,
        maxLoginAttempts: 3,
        lockoutDuration: 1800
      };

      const mockExistingConfig = {
        id: 1,
        config: {
          passwordPolicy: { minLength: 8 },
          sessionTimeout: 7200
        },
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockSecurityConfig.findOne.mockResolvedValue(mockExistingConfig);

      const result = await securityService.updateSecurityConfig(configUpdates);

      expect(mockExistingConfig.update).toHaveBeenCalledWith({
        config: expect.objectContaining({
          passwordPolicy: configUpdates.passwordPolicy,
          sessionTimeout: configUpdates.sessionTimeout
        })
      });
      expect(result.updated).toBe(true);
    });

    it('应该创建新的安全配置', async () => {
      const configUpdates = {
        passwordPolicy: {
          minLength: 10
        }
      };

      mockSecurityConfig.findOne.mockResolvedValue(null);
      mockSecurityConfig.create.mockResolvedValue({ id: 1 });

      const result = await securityService.updateSecurityConfig(configUpdates);

      expect(mockSecurityConfig.create).toHaveBeenCalledWith({
        config: configUpdates
      });
      expect(result.created).toBe(true);
    });
  });

  describe('auditSecurityEvents', () => {
    it('应该审计安全事件', async () => {
      const auditOptions = {
        eventTypes: ['login', 'password_change', 'permission_change'],
        timeRange: {
          start: new Date('2024-03-01'),
          end: new Date('2024-03-31')
        },
        userId: 1
      };

      const mockEvents = [
        {
          type: 'login',
          userId: 1,
          ip: '192.168.1.100',
          timestamp: new Date('2024-03-15T10:00:00Z'),
          success: true
        },
        {
          type: 'password_change',
          userId: 1,
          ip: '192.168.1.100',
          timestamp: new Date('2024-03-16T14:30:00Z'),
          success: true
        }
      ];

      mockSecurityScanLog.findAll.mockResolvedValue(mockEvents);

      const result = await securityService.auditSecurityEvents(auditOptions);

      expect(result.events).toEqual(mockEvents);
      expect(result.summary.totalEvents).toBe(2);
      expect(result.summary.successfulEvents).toBe(2);
      expect(result.summary.failedEvents).toBe(0);
    });

    it('应该检测异常模式', async () => {
      const auditOptions = {
        eventTypes: ['login'],
        detectAnomalies: true
      };

      const mockEvents = Array.from({ length: 100 }, (_, i) => ({
        type: 'login',
        userId: 1,
        timestamp: new Date(`2024-03-${String(i % 30 + 1).padStart(2, '0')}T${String(i % 24).padStart(2, '0')}:00:00Z`),
        success: i % 10 !== 0 // 10%失败率
      }));

      mockSecurityScanLog.findAll.mockResolvedValue(mockEvents);

      const result = await securityService.auditSecurityEvents(auditOptions);

      expect(result.anomalies).toBeDefined();
      expect(result.anomalies.unusualTimes).toBeDefined();
      expect(result.anomalies.highFailureRate).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('应该处理数据库连接错误', async () => {
      mockSecurityConfig.findOne.mockRejectedValue(new Error('数据库连接失败'));

      await expect(securityService.updateSecurityConfig({}))
        .rejects.toThrow('数据库连接失败');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('安全配置更新失败'),
        expect.objectContaining({
          error: '数据库连接失败'
        })
      );
    });

    it('应该处理加密服务不可用', () => {
      mockCrypto.randomBytes.mockImplementation(() => {
        throw new Error('加密服务不可用');
      });

      expect(() => securityService.generateSecureToken())
        .toThrow('加密服务不可用');
    });

    it('应该处理限流服务故障', async () => {
      mockRateLimiter.consume.mockRejectedValue(new Error('限流服务故障'));

      await expect(securityService.checkRateLimit('test-key'))
        .rejects.toThrow('限流服务故障');
    });
  });

  describe('Performance Optimization', () => {
    it('应该缓存安全配置', async () => {
      const configUpdates = { sessionTimeout: 3600 };

      // 第一次调用
      mockSecurityConfig.findOne.mockResolvedValueOnce({
        config: { sessionTimeout: 7200 },
        update: jest.fn().mockResolvedValue(undefined)
      });

      await securityService.updateSecurityConfig(configUpdates);

      // 第二次调用应该使用缓存
      await securityService.getSecurityConfig();

      expect(mockSecurityConfig.findOne).toHaveBeenCalledTimes(1);
    });

    it('应该批量处理安全事件', async () => {
      const events = Array.from({ length: 1000 }, (_, i) => ({
        type: 'login',
        userId: i + 1,
        timestamp: new Date()
      }));

      const result = await securityService.batchProcessSecurityEvents(events);

      expect(result.processed).toBe(1000);
      expect(result.batchSize).toBeLessThanOrEqual(100); // 批量处理
    });

    it('应该异步扫描漏洞', async () => {
      const scanOptions = {
        scanType: 'full',
        async: true
      };

      const result = await securityService.scanForVulnerabilities(scanOptions);

      expect(result.status).toBe('started');
      expect(result.scanId).toBeDefined();
      expect(result.estimatedCompletion).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('应该集成密码策略和用户管理', async () => {
      const userId = 1;
      const newPassword = 'NewStr0ngP@ssw0rd';

      const mockUser = {
        id: 1,
        password: 'old-hashed-password',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockUser.findByPk.mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue('new-hashed-password');

      const result = await securityService.changeUserPassword(userId, newPassword);

      expect(securityService.validatePasswordStrength).toHaveBeenCalledWith(newPassword);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(newPassword, expect.any(String));
      expect(mockUser.update).toHaveBeenCalledWith({
        password: 'new-hashed-password',
        passwordChangedAt: expect.any(Date)
      });
      expect(result.success).toBe(true);
    });

    it('应该集成威胁检测和用户阻止', async () => {
      const activityData = {
        userId: 1,
        ip: '192.168.1.100',
        action: 'login_failed'
      };

      // 模拟检测到高风险活动
      jest.spyOn(securityService, 'detectSuspiciousActivity').mockResolvedValue({
        suspicious: true,
        riskScore: 0.9,
        reasons: ['频繁登录失败', '新IP地址']
      });

      const mockUser = {
        id: 1,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockUser.findByPk.mockResolvedValue(mockUser);

      const result = await securityService.handleSuspiciousActivity(activityData);

      expect(securityService.detectSuspiciousActivity).toHaveBeenCalledWith(activityData);
      expect(securityService.blockSuspiciousUser).toHaveBeenCalledWith(
        1,
        expect.stringContaining('可疑活动'),
        expect.any(Number)
      );
      expect(result.actionTaken).toBe('user_blocked');
    });
  });
});
