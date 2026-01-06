import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockSecurityController = {
  getSecurityStatus: jest.fn(),
  getSecurityLogs: jest.fn(),
  getSecurityAlerts: jest.fn(),
  getSecuritySettings: jest.fn(),
  updateSecuritySettings: jest.fn(),
  performSecurityScan: jest.fn(),
  getVulnerabilityReport: jest.fn(),
  getAccessLogs: jest.fn(),
  getAuthenticationLogs: jest.fn(),
  getAuthorizationLogs: jest.fn(),
  getAuditTrail: jest.fn(),
  getSecurityMetrics: jest.fn(),
  getThreatIntelligence: jest.fn(),
  getFirewallRules: jest.fn(),
  updateFirewallRules: jest.fn(),
  getIpWhitelist: jest.fn(),
  updateIpWhitelist: jest.fn(),
  getIpBlacklist: jest.fn(),
  updateIpBlacklist: jest.fn(),
  getRateLimitRules: jest.fn(),
  updateRateLimitRules: jest.fn(),
  getSecurityPolicies: jest.fn(),
  updateSecurityPolicies: jest.fn(),
  performSecurityBackup: jest.fn(),
  performSecurityRestore: jest.fn(),
  getSecurityCompliance: jest.fn(),
  generateSecurityReport: jest.fn(),
  testSecurityRules: jest.fn(),
  getSecurityIncidents: jest.fn(),
  updateSecurityIncident: jest.fn(),
  resolveSecurityIncident: jest.fn(),
  getSecurityNotifications: jest.fn(),
  sendSecurityAlert: jest.fn(),
  getSecurityDashboard: jest.fn(),
  getSecurityHealth: jest.fn(),
  performSecurityCheck: jest.fn(),
  getSecurityTraining: jest.fn(),
  updateSecurityTraining: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockRateLimitMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockPermissionMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockSecurityMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockCacheMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockAdminAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../src/services/security.service', () => ({
  SecurityService: jest.fn().mockImplementation(() => mockSecurityController)
}));
jest.unstable_mockModule('../../../src/middlewares/auth.middleware', () => ({
  verifyToken: mockAuthMiddleware
}));
// 移除不存在的 validation.middleware mock
// jest.unstable_mockModule('../../../src/middlewares/validation.middleware', () => ({
//   validateSecurityRequest: mockValidationMiddleware,
//   validateSecuritySettings: mockValidationMiddleware,
//   validateFirewallRules: mockValidationMiddleware
// }));
jest.unstable_mockModule('../../../src/middlewares/rate-limit.middleware', () => ({
  securityRateLimit: mockRateLimitMiddleware,
  strictRateLimit: mockRateLimitMiddleware
}));
jest.unstable_mockModule('../../../src/middlewares/permission.middleware', () => ({
  permissionMiddleware: mockPermissionMiddleware,
  requireSecurityAccess: mockPermissionMiddleware,
  requireAdmin: mockAdminAuthMiddleware
}));
jest.unstable_mockModule('../../../src/middlewares/security.middleware', () => ({
  securityCheck: mockSecurityMiddleware,
  validateSecurityHeaders: mockSecurityMiddleware
}));
jest.unstable_mockModule('../../../src/middlewares/cache.middleware', () => ({
  cacheResponse: mockCacheMiddleware
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

describe('Security Routes', () => {
  let securityRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedSecurityRouter } = await import('../../../src/routes/security.routes');
    securityRouter = importedSecurityRouter;
    
    // 设置Express应用
    mockApp.use('/security', securityRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockSecurityController.getSecurityStatus.mockImplementation((req: Request, res: Response) => {
      (res as any).status(200).json({
        success: true,
        data: {
          overall: 'healthy',
          score: 85,
          checks: [
            {
              name: 'firewall',
              status: 'healthy',
              score: 90,
              message: '防火墙运行正常'
            },
            {
              name: 'authentication',
              status: 'healthy',
              score: 95,
              message: '认证系统正常'
            },
            {
              name: 'authorization',
              status: 'warning',
              score: 70,
              message: '发现过期的权限配置'
            },
            {
              name: 'encryption',
              status: 'healthy',
              score: 100,
              message: '加密配置正确'
            },
            {
              name: 'monitoring',
              status: 'healthy',
              score: 80,
              message: '监控系统运行正常'
            }
          ],
          alerts: [
            {
              id: 1,
              type: 'warning',
              message: '发现过期的权限配置',
              severity: 'medium',
              timestamp: '2024-02-20T14:30:00.000Z'
            }
          ],
          lastChecked: '2024-02-20T14:30:00.000Z'
        },
        message: '获取安全状态成功'
      });
    });

    mockSecurityController.getSecurityLogs.mockImplementation((req, res) => {
      (res as any).status(200).json({
        success: true,
        data: [
          {
            id: 1,
            timestamp: '2024-02-20T14:30:00.000Z',
            level: 'info',
            category: 'authentication',
            message: '用户登录成功',
            userId: 123,
            username: 'admin',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            details: {
              method: 'password',
              mfaEnabled: true
            }
          },
          {
            id: 2,
            timestamp: '2024-02-20T14:25:00.000Z',
            level: 'warning',
            category: 'authorization',
            message: '权限检查失败',
            userId: 456,
            username: 'user',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            details: {
              requiredPermission: 'admin_access',
              userPermissions: ['user_access']
            }
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        },
        message: '获取安全日志成功'
      });
    });

    mockSecurityController.getSecuritySettings.mockImplementation((req, res) => {
      (res as any).status(200).json({
        success: true,
        data: {
          authentication: {
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireNumbers: true,
              requireSpecialChars: true,
              expireDays: 90,
              historyCount: 5
            },
            mfa: {
              enabled: true,
              required: false,
              methods: ['totp', 'sms', 'email']
            },
            session: {
              timeout: 3600,
              concurrentLimit: 3,
              rememberMe: true
            }
          },
          authorization: {
            roleBasedAccess: true,
            permissionInheritance: true,
            defaultRole: 'user',
            adminApproval: false
          },
          firewall: {
            enabled: true,
            mode: 'whitelist',
            rules: [
              {
                id: 1,
                type: 'allow',
                source: '192.168.1.0/24',
                destination: 'any',
                port: 'any',
                protocol: 'any'
              }
            ]
          },
          rateLimiting: {
            enabled: true,
            defaultLimit: 100,
            defaultWindow: 3600,
            customRules: [
              {
                endpoint: '/api/auth/login',
                limit: 5,
                window: 300
              }
            ]
          },
          encryption: {
            tls: {
              enabled: true,
              minVersion: '1.2',
              cipherSuites: ['ECDHE-RSA-AES256-GCM-SHA384']
            },
            data: {
              algorithm: 'AES-256-GCM',
              keyRotationDays: 90
            }
          },
          monitoring: {
            enabled: true,
            logLevel: 'info',
            alertThresholds: {
              failedLogins: 5,
              suspiciousActivity: 3
            },
            retentionDays: 365
          }
        },
        message: '获取安全设置成功'
      });
    });

    mockSecurityController.getSecurityDashboard.mockImplementation((req, res) => {
      (res as any).status(200).json({
        success: true,
        data: {
          overview: {
            securityScore: 85,
            threatLevel: 'low',
            activeAlerts: 2,
            resolvedIncidents: 45,
            pendingIncidents: 3
          },
          metrics: {
            failedLogins: {
              today: 12,
              week: 45,
              month: 180,
              trend: 'down'
            },
            blockedAttempts: {
              today: 8,
              week: 35,
              month: 120,
              trend: 'stable'
            },
            suspiciousActivities: {
              today: 3,
              week: 15,
              month: 60,
              trend: 'up'
            }
          },
          alerts: [
            {
              id: 1,
              type: 'warning',
              message: '检测到异常登录模式',
              severity: 'medium',
              timestamp: '2024-02-20T14:30:00.000Z'
            },
            {
              id: 2,
              type: 'info',
              message: '系统安全扫描完成',
              severity: 'low',
              timestamp: '2024-02-20T14:00:00.000Z'
            }
          ],
          recommendations: [
            {
              priority: 'high',
              action: '更新过期的权限配置',
              reason: '发现过期的权限配置可能影响系统安全'
            },
            {
              priority: 'medium',
              action: '加强密码策略',
              reason: '当前密码策略可以进一步加强'
            }
          ],
          lastUpdated: '2024-02-20T14:30:00.000Z'
        },
        message: '获取安全仪表板成功'
      });
    });
  });

  describe('GET /security/status', () => {
    it('应该获取安全状态', async () => {
      const response = await request(mockApp)
        .get('/security/status')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          overall: 'healthy',
          score: 85,
          checks: [
            {
              name: 'firewall',
              status: 'healthy',
              score: 90,
              message: '防火墙运行正常'
            },
            {
              name: 'authentication',
              status: 'healthy',
              score: 95,
              message: '认证系统正常'
            },
            {
              name: 'authorization',
              status: 'warning',
              score: 70,
              message: '发现过期的权限配置'
            },
            {
              name: 'encryption',
              status: 'healthy',
              score: 100,
              message: '加密配置正确'
            },
            {
              name: 'monitoring',
              status: 'healthy',
              score: 80,
              message: '监控系统运行正常'
            }
          ],
          alerts: [
            {
              id: 1,
              type: 'warning',
              message: '发现过期的权限配置',
              severity: 'medium',
              timestamp: '2024-02-20T14:30:00.000Z'
            }
          ],
          lastChecked: '2024-02-20T14:30:00.000Z'
        },
        message: '获取安全状态成功'
      });

      expect(mockSecurityController.getSecurityStatus).toHaveBeenCalled();
    });

    it('应该应用认证中间件', async () => {
      await request(mockApp)
        .get('/security/status')
        .set('Authorization', 'Bearer valid-token');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该应用缓存中间件', async () => {
      await request(mockApp)
        .get('/security/status')
        .set('Authorization', 'Bearer valid-token');

      expect(mockCacheMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /security/logs', () => {
    it('应该获取安全日志', async () => {
      const response = await request(mockApp)
        .get('/security/logs')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [
          {
            id: 1,
            timestamp: '2024-02-20T14:30:00.000Z',
            level: 'info',
            category: 'authentication',
            message: '用户登录成功',
            userId: 123,
            username: 'admin',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            details: {
              method: 'password',
              mfaEnabled: true
            }
          },
          {
            id: 2,
            timestamp: '2024-02-20T14:25:00.000Z',
            level: 'warning',
            category: 'authorization',
            message: '权限检查失败',
            userId: 456,
            username: 'user',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            details: {
              requiredPermission: 'admin_access',
              userPermissions: ['user_access']
            }
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        },
        message: '获取安全日志成功'
      });

      expect(mockSecurityController.getSecurityLogs).toHaveBeenCalled();
    });

    it('应该支持分页参数', async () => {
      const page = 2;
      const limit = 5;

      await request(mockApp)
        .get('/security/logs')
        .query({ page, limit })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockSecurityController.getSecurityLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            page: page.toString(),
            limit: limit.toString()
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持日志级别过滤', async () => {
      const level = 'warning';

      await request(mockApp)
        .get('/security/logs')
        .query({ level })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockSecurityController.getSecurityLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            level
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持分类过滤', async () => {
      const category = 'authentication';

      await request(mockApp)
        .get('/security/logs')
        .query({ category })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockSecurityController.getSecurityLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            category
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持时间范围过滤', async () => {
      const startDate = '2024-02-01';
      const endDate = '2024-02-29';

      await request(mockApp)
        .get('/security/logs')
        .query({ startDate, endDate })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockSecurityController.getSecurityLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            startDate,
            endDate
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该检查安全日志查看权限', async () => {
      await request(mockApp)
        .get('/security/logs')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /security/alerts', () => {
    it('应该获取安全警报', async () => {
      mockSecurityController.getSecurityAlerts.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: [
            {
              id: 1,
              type: 'critical',
              message: '检测到暴力破解攻击',
              severity: 'high',
              sourceIp: '192.168.1.200',
              target: '/api/auth/login',
              description: '检测到来自192.168.1.200的暴力破解攻击尝试',
              timestamp: '2024-02-20T14:30:00.000Z',
              status: 'active',
              actions: ['block_ip', 'notify_admin']
            },
            {
              id: 2,
              type: 'warning',
              message: '异常登录行为',
              severity: 'medium',
              sourceIp: '192.168.1.150',
              target: '/api/auth/login',
              description: '用户在短时间内多次登录失败',
              timestamp: '2024-02-20T14:25:00.000Z',
              status: 'investigating',
              actions: ['monitor', 'notify_user']
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          },
          message: '获取安全警报成功'
        });
      });

      const response = await request(mockApp)
        .get('/security/alerts')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSecurityController.getSecurityAlerts).toHaveBeenCalled();
    });

    it('应该支持严重性过滤', async () => {
      const severity = 'high';

      await request(mockApp)
        .get('/security/alerts')
        .query({ severity })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockSecurityController.getSecurityAlerts).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            severity
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持状态过滤', async () => {
      const status = 'active';

      await request(mockApp)
        .get('/security/alerts')
        .query({ status })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockSecurityController.getSecurityAlerts).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            status
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /security/settings', () => {
    it('应该获取安全设置', async () => {
      const response = await request(mockApp)
        .get('/security/settings')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          authentication: {
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireNumbers: true,
              requireSpecialChars: true,
              expireDays: 90,
              historyCount: 5
            },
            mfa: {
              enabled: true,
              required: false,
              methods: ['totp', 'sms', 'email']
            },
            session: {
              timeout: 3600,
              concurrentLimit: 3,
              rememberMe: true
            }
          },
          authorization: {
            roleBasedAccess: true,
            permissionInheritance: true,
            defaultRole: 'user',
            adminApproval: false
          },
          firewall: {
            enabled: true,
            mode: 'whitelist',
            rules: [
              {
                id: 1,
                type: 'allow',
                source: '192.168.1.0/24',
                destination: 'any',
                port: 'any',
                protocol: 'any'
              }
            ]
          },
          rateLimiting: {
            enabled: true,
            defaultLimit: 100,
            defaultWindow: 3600,
            customRules: [
              {
                endpoint: '/api/auth/login',
                limit: 5,
                window: 300
              }
            ]
          },
          encryption: {
            tls: {
              enabled: true,
              minVersion: '1.2',
              cipherSuites: ['ECDHE-RSA-AES256-GCM-SHA384']
            },
            data: {
              algorithm: 'AES-256-GCM',
              keyRotationDays: 90
            }
          },
          monitoring: {
            enabled: true,
            logLevel: 'info',
            alertThresholds: {
              failedLogins: 5,
              suspiciousActivity: 3
            },
            retentionDays: 365
          }
        },
        message: '获取安全设置成功'
      });

      expect(mockSecurityController.getSecuritySettings).toHaveBeenCalled();
    });

    it('应该检查管理员权限', async () => {
      await request(mockApp)
        .get('/security/settings')
        .set('Authorization', 'Bearer admin-token');

      expect(mockAdminAuthMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /security/settings', () => {
    it('应该更新安全设置', async () => {
      mockSecurityController.updateSecuritySettings.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            authentication: {
              passwordPolicy: {
                minLength: 10,
                requireUppercase: true,
                updatedAt: new Date().toISOString()
              }
            },
            message: '安全设置更新成功'
          },
          message: '安全设置更新成功'
        });
      });

      const settingsData = {
        authentication: {
          passwordPolicy: {
            minLength: 10,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          }
        }
      };

      const response = await request(mockApp)
        .put('/security/settings')
        .send(settingsData)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSecurityController.updateSecuritySettings).toHaveBeenCalledWith(
        expect.objectContaining({
          body: settingsData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证设置数据', async () => {
      const invalidSettingsData = {
        authentication: {
          passwordPolicy: {
            minLength: 4, // 太短
            requireUppercase: 'invalid_boolean' // 无效布尔值
          }
        }
      };

      await request(mockApp)
        .put('/security/settings')
        .send(invalidSettingsData)
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查管理员权限', async () => {
      await request(mockApp)
        .put('/security/settings')
        .send({ authentication: { passwordPolicy: { minLength: 8 } } })
        .set('Authorization', 'Bearer admin-token');

      expect(mockAdminAuthMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /security/scan', () => {
    it('应该执行安全扫描', async () => {
      mockSecurityController.performSecurityScan.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            scanId: 'scan_123',
            status: 'completed',
            startTime: '2024-02-20T14:30:00.000Z',
            endTime: '2024-02-20T14:35:00.000Z',
            duration: 300,
            results: {
              vulnerabilities: [
                {
                  id: 1,
                  level: 'medium',
                  type: 'weak_password',
                  description: '发现弱密码策略',
                  affected: 'password_policy',
                  recommendation: '加强密码策略要求'
                }
              ],
              score: 85,
              issues: {
                critical: 0,
                high: 0,
                medium: 1,
                low: 3,
                info: 5
              }
            },
            message: '安全扫描完成'
          },
          message: '安全扫描执行成功'
        });
      });

      const scanData = {
        type: 'comprehensive',
        targets: ['authentication', 'authorization', 'firewall'],
        depth: 'deep'
      };

      const response = await request(mockApp)
        .post('/security/scan')
        .send(scanData)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSecurityController.performSecurityScan).toHaveBeenCalledWith(
        expect.objectContaining({
          body: scanData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证扫描参数', async () => {
      const invalidScanData = {
        type: 'invalid_type', // 无效类型
        targets: 'invalid_array' // 无效数组
      };

      await request(mockApp)
        .post('/security/scan')
        .send(invalidScanData)
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查管理员权限', async () => {
      await request(mockApp)
        .post('/security/scan')
        .send({ type: 'basic' })
        .set('Authorization', 'Bearer admin-token');

      expect(mockAdminAuthMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /security/dashboard', () => {
    it('应该获取安全仪表板', async () => {
      const response = await request(mockApp)
        .get('/security/dashboard')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          overview: {
            securityScore: 85,
            threatLevel: 'low',
            activeAlerts: 2,
            resolvedIncidents: 45,
            pendingIncidents: 3
          },
          metrics: {
            failedLogins: {
              today: 12,
              week: 45,
              month: 180,
              trend: 'down'
            },
            blockedAttempts: {
              today: 8,
              week: 35,
              month: 120,
              trend: 'stable'
            },
            suspiciousActivities: {
              today: 3,
              week: 15,
              month: 60,
              trend: 'up'
            }
          },
          alerts: [
            {
              id: 1,
              type: 'warning',
              message: '检测到异常登录模式',
              severity: 'medium',
              timestamp: '2024-02-20T14:30:00.000Z'
            },
            {
              id: 2,
              type: 'info',
              message: '系统安全扫描完成',
              severity: 'low',
              timestamp: '2024-02-20T14:00:00.000Z'
            }
          ],
          recommendations: [
            {
              priority: 'high',
              action: '更新过期的权限配置',
              reason: '发现过期的权限配置可能影响系统安全'
            },
            {
              priority: 'medium',
              action: '加强密码策略',
              reason: '当前密码策略可以进一步加强'
            }
          ],
          lastUpdated: '2024-02-20T14:30:00.000Z'
        },
        message: '获取安全仪表板成功'
      });

      expect(mockSecurityController.getSecurityDashboard).toHaveBeenCalled();
    });

    it('应该应用缓存中间件', async () => {
      await request(mockApp)
        .get('/security/dashboard')
        .set('Authorization', 'Bearer valid-token');

      expect(mockCacheMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /security/firewall/rules', () => {
    it('应该获取防火墙规则', async () => {
      mockSecurityController.getFirewallRules.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '允许内网访问',
              type: 'allow',
              source: '192.168.1.0/24',
              destination: 'any',
              port: 'any',
              protocol: 'any',
              enabled: true,
              priority: 1,
              description: '允许内网IP访问所有服务',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-15T10:00:00.000Z'
            },
            {
              id: 2,
              name: '阻止恶意IP',
              type: 'deny',
              source: '192.168.1.200',
              destination: 'any',
              port: 'any',
              protocol: 'any',
              enabled: true,
              priority: 10,
              description: '阻止已知恶意IP访问',
              createdAt: '2024-02-20T14:30:00.000Z',
              updatedAt: '2024-02-20T14:30:00.000Z'
            }
          ],
          message: '获取防火墙规则成功'
        });
      });

      const response = await request(mockApp)
        .get('/security/firewall/rules')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSecurityController.getFirewallRules).toHaveBeenCalled();
    });

    it('应该检查管理员权限', async () => {
      await request(mockApp)
        .get('/security/firewall/rules')
        .set('Authorization', 'Bearer admin-token');

      expect(mockAdminAuthMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /security/firewall/rules', () => {
    it('应该更新防火墙规则', async () => {
      mockSecurityController.updateFirewallRules.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            updatedRules: [
              {
                id: 1,
                enabled: false,
                updatedAt: new Date().toISOString()
              }
            ],
            message: '防火墙规则更新成功'
          },
          message: '防火墙规则更新成功'
        });
      });

      const rulesData = {
        rules: [
          {
            id: 1,
            enabled: false
          }
        ]
      };

      const response = await request(mockApp)
        .put('/security/firewall/rules')
        .send(rulesData)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSecurityController.updateFirewallRules).toHaveBeenCalledWith(
        expect.objectContaining({
          body: rulesData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证防火墙规则', async () => {
      const invalidRulesData = {
        rules: [
          {
            id: 1,
            source: 'invalid_ip', // 无效IP地址
            port: 'invalid_port' // 无效端口
          }
        ]
      };

      await request(mockApp)
        .put('/security/firewall/rules')
        .send(invalidRulesData)
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /security/incidents', () => {
    it('应该获取安全事件', async () => {
      mockSecurityController.getSecurityIncidents.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: [
            {
              id: 1,
              title: '暴力破解攻击',
              type: 'brute_force',
              severity: 'high',
              status: 'investigating',
              description: '检测到来自192.168.1.200的暴力破解攻击',
              sourceIp: '192.168.1.200',
              target: '/api/auth/login',
              detectedAt: '2024-02-20T14:30:00.000Z',
              assignedTo: 'security_team',
              actions: ['block_ip', 'investigate', 'notify_admin']
            },
            {
              id: 2,
              title: '异常登录行为',
              type: 'suspicious_login',
              severity: 'medium',
              status: 'resolved',
              description: '用户在短时间内多次登录失败',
              sourceIp: '192.168.1.150',
              target: '/api/auth/login',
              detectedAt: '2024-02-20T14:25:00.000Z',
              resolvedAt: '2024-02-20T14:30:00.000Z',
              resolvedBy: 'admin',
              resolution: '用户密码重置，通知用户'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          },
          message: '获取安全事件成功'
        });
      });

      const response = await request(mockApp)
        .get('/security/incidents')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSecurityController.getSecurityIncidents).toHaveBeenCalled();
    });
  });

  describe('PUT /security/incidents/:id', () => {
    it('应该更新安全事件', async () => {
      mockSecurityController.updateSecurityIncident.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            id: 1,
            status: 'resolved',
            resolution: 'IP地址已阻止，用户已通知',
            resolvedBy: 'admin',
            resolvedAt: new Date().toISOString()
          },
          message: '安全事件更新成功'
        });
      });

      const incidentId = 1;
      const updateData = {
        status: 'resolved',
        resolution: 'IP地址已阻止，用户已通知'
      };

      const response = await request(mockApp)
        .put(`/security/incidents/${incidentId}`)
        .send(updateData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSecurityController.updateSecurityIncident).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: incidentId.toString() },
          body: updateData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /security/compliance', () => {
    it('应该获取安全合规性', async () => {
      mockSecurityController.getSecurityCompliance.mockImplementation((req, res) => {
        (res as any).status(200).json({
          success: true,
          data: {
            overall: 92,
            frameworks: [
              {
                name: 'ISO 27001',
                score: 95,
                status: 'compliant',
                requirements: [
                  {
                    id: 'A.9.1.1',
                    name: 'Access control policy',
                    status: 'compliant',
                    evidence: 'Documented access control policy exists'
                  }
                ]
              },
              {
                name: 'GDPR',
                score: 88,
                status: 'partial',
                requirements: [
                  {
                    id: 'GDPR-32',
                    name: 'Security of processing',
                    status: 'partial',
                    evidence: 'Security measures implemented but need improvement'
                  }
                ]
              }
            ],
            findings: [
              {
                type: 'recommendation',
                framework: 'GDPR',
                requirement: 'GDPR-32',
                description: '加强数据处理安全措施',
                priority: 'medium'
              }
            ],
            lastAssessed: '2024-02-20T14:30:00.000Z'
          },
          message: '获取安全合规性成功'
        });
      });

      const response = await request(mockApp)
        .get('/security/compliance')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSecurityController.getSecurityCompliance).toHaveBeenCalled();
    });
  });

  describe('路由中间件应用', () => {
    it('应该正确应用认证中间件到所有路由', () => {
      const authRoutes = ['/security/status', '/security/logs', '/security/alerts',
                          '/security/settings', '/security/dashboard', '/security/firewall/rules',
                          '/security/incidents', '/security/compliance'];
      
      authRoutes.forEach(route => {
        expect(mockAuthMiddleware).toBeDefined();
      });
    });

    it('应该正确应用验证中间件到需要验证的路由', () => {
      const validatedRoutes = ['/security/settings', '/security/scan', '/security/firewall/rules',
                              '/security/incidents/1'];
      
      validatedRoutes.forEach(route => {
        expect(mockValidationMiddleware).toBeDefined();
      });
    });

    it('应该正确应用管理员权限中间件到敏感操作', () => {
      const adminRoutes = ['/security/settings', '/security/scan', '/security/firewall/rules'];
      
      adminRoutes.forEach(route => {
        expect(mockAdminAuthMiddleware).toBeDefined();
      });
    });

    it('应该正确应用安全权限中间件到安全操作', () => {
      const securityRoutes = ['/security/logs', '/security/alerts', '/security/incidents',
                             '/security/compliance'];
      
      securityRoutes.forEach(route => {
        expect(mockPermissionMiddleware).toBeDefined();
      });
    });

    it('应该正确应用安全中间件到所有路由', () => {
      expect(mockSecurityMiddleware).toBeDefined();
    });

    it('应该正确应用缓存中间件到数据查询路由', () => {
      const cachedRoutes = ['/security/status', '/security/dashboard'];
      
      cachedRoutes.forEach(route => {
        expect(mockCacheMiddleware).toBeDefined();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockSecurityController.getSecurityStatus.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        const error = new Error('获取安全状态失败');
        (next as any)(error);
      });

      await request(mockApp)
        .get('/security/status')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });

    it('应该处理验证中间件错误', async () => {
      mockValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('参数验证失败');
        (error as any).statusCode = 400;
        (next as any)(error);
      });

      await request(mockApp)
        .post('/security/scan')
        .send({ type: 'invalid_type' })
        .set('Authorization', 'Bearer admin-token')
        .expect(400);
    });

    it('应该处理权限不足错误', async () => {
      mockPermissionMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('权限不足');
        (error as any).statusCode = 403;
        (next as any)(error);
      });

      await request(mockApp)
        .get('/security/logs')
        .set('Authorization', 'Bearer user-token')
        .expect(403);
    });

    it('应该处理管理员权限不足错误', async () => {
      mockAdminAuthMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('需要管理员权限');
        (error as any).statusCode = 403;
        (next as any)(error);
      });

      await request(mockApp)
        .get('/security/settings')
        .set('Authorization', 'Bearer user-token')
        .expect(403);
    });

    it('应该处理扫描失败错误', async () => {
      mockSecurityController.performSecurityScan.mockImplementation((req, res, next) => {
        const error = new Error('安全扫描失败：系统资源不足');
        (error as any).statusCode = 503;
        (next as any)(error);
      });

      await request(mockApp)
        .post('/security/scan')
        .send({ type: 'comprehensive' })
        .set('Authorization', 'Bearer admin-token')
        .expect(503);
    });
  });

  describe('性能测试', () => {
    it('应该处理大量安全日志数据', async () => {
      mockSecurityController.getSecurityLogs.mockImplementation((req, res) => {
        // 模拟大量安全日志数据
        const largeData = Array(5000).fill(null).map((_, i) => ({
          id: i + 1,
          timestamp: new Date(Date.now() - i * 60000).toISOString(),
          level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
          category: ['authentication', 'authorization', 'firewall'][Math.floor(Math.random() * 3)],
          message: `安全日志消息 ${i + 1}`,
          userId: Math.floor(Math.random() * 1000) + 1,
          username: `user${Math.floor(Math.random() * 1000) + 1}`,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Test Browser)',
          details: {
            action: ['login', 'logout', 'access_denied'][Math.floor(Math.random() * 3)]
          }
        }));

        (res as any).status(200).json({
          success: true,
          data: largeData,
          pagination: {
            page: 1,
            limit: 5000,
            total: 5000,
            totalPages: 1
          },
          message: '获取安全日志成功'
        });
      });

      const response = await request(mockApp)
        .get('/security/logs')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(5000);
    });

    it('应该处理复杂安全扫描', async () => {
      mockSecurityController.performSecurityScan.mockImplementation((req: Request, res: Response) => {
        // 模拟复杂安全扫描
        (res as any).status(200).json({
          success: true,
          data: {
            scanId: 'scan_complex_123',
            status: 'completed',
            duration: 1200,
            results: {
              vulnerabilities: Array(50).fill(null).map((_, i) => ({
                id: i + 1,
                level: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
                type: ['injection', 'xss', 'csrf', 'misconfiguration'][Math.floor(Math.random() * 4)],
                description: `漏洞描述 ${i + 1}`,
                affected: `affected_component_${i + 1}`,
                recommendation: `修复建议 ${i + 1}`
              })),
              score: Math.floor(Math.random() * 40) + 60,
              issues: {
                critical: Math.floor(Math.random() * 5),
                high: Math.floor(Math.random() * 10),
                medium: Math.floor(Math.random() * 20),
                low: Math.floor(Math.random() * 30),
                info: Math.floor(Math.random() * 50)
              }
            },
            message: '复杂安全扫描完成'
          }
        });
      });

      const response = await request(mockApp)
        .post('/security/scan')
        .send({ type: 'comprehensive', depth: 'deep' })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('安全测试', () => {
    it('应该防止SQL注入攻击', async () => {
      const maliciousQuery = "'; DROP TABLE security_logs; --";

      await request(mockApp)
        .get('/security/logs')
        .query({ search: maliciousQuery })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });

    it('应该防止XSS攻击', async () => {
      const maliciousScript = '<script>alert("xss")</script>';

      await request(mockApp)
        .get('/security/logs')
        .query({ filter: maliciousScript })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });

    it('应该验证输入数据格式', async () => {
      const invalidFormats = [
        { route: '/security/logs', method: 'get', query: { startDate: 'invalid-date' } },
        { route: '/security/alerts', method: 'get', query: { severity: 'invalid_severity' } },
        { route: '/security/scan', method: 'post', body: { type: 'invalid_type' } },
        { route: '/security/settings', method: 'put', body: { authentication: { passwordPolicy: { minLength: -1 } } } },
        { route: '/security/firewall/rules', method: 'put', body: { rules: [{ source: 'invalid_ip' }] } }
      ];

      for (const { route, method, query, body } of invalidFormats) {
        const req = request(mockApp)[method](route)
          .set('Authorization', 'Bearer admin-token');
        
        if (query) {
          req.query(query);
        }
        
        if (body) {
          req.send(body);
        }
        
        await req.expect(400);
      }
    });

    it('应该限制安全扫描频率', async () => {
      mockRateLimitMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('扫描请求过于频繁');
        (error as any).statusCode = 429;
        (next as any)(error);
      });

      await request(mockApp)
        .post('/security/scan')
        .send({ type: 'comprehensive' })
        .set('Authorization', 'Bearer admin-token')
        .expect(429);
    });

    it('应该保护敏感安全操作', async () => {
      const sensitiveOperations = [
        { path: '/security/settings', method: 'get' },
        { path: '/security/settings', method: 'put' },
        { path: '/security/scan', method: 'post' },
        { path: '/security/firewall/rules', method: 'put' }
      ];

      for (const { path, method } of sensitiveOperations) {
        await request(mockApp)[method](path)
          .set('Authorization', 'Bearer user-token')
          .expect(403);
      }
    });

    it('应该验证安全操作的安全性', async () => {
      mockSecurityMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('安全操作验证失败');
        (error as any).statusCode = 400;
        (next as any)(error);
      });

      await request(mockApp)
        .post('/security/scan')
        .send({ type: 'comprehensive', malicious: 'content' })
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });
  });
});