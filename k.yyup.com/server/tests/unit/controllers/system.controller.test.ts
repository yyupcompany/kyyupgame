import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Request and Response objects
const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { id: 1, role: 'admin' },
  file: null,
  files: null,
  ...overrides
});

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    download: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis()
  };
  return res;
};

const mockNext = jest.fn();

// Mock services
const mockSystemService = {
  getSystemInfo: jest.fn(),
  getSystemHealth: jest.fn(),
  getSystemMetrics: jest.fn(),
  getSystemLogs: jest.fn(),
  clearSystemLogs: jest.fn(),
  exportSystemLogs: jest.fn(),
  getSystemConfig: jest.fn(),
  updateSystemConfig: jest.fn(),
  resetSystemConfig: jest.fn(),
  backupSystem: jest.fn(),
  restoreSystem: jest.fn(),
  getBackupList: jest.fn(),
  deleteBackup: jest.fn(),
  getSystemUsers: jest.fn(),
  getSystemSessions: jest.fn(),
  terminateSession: jest.fn(),
  getSystemNotifications: jest.fn(),
  createSystemNotification: jest.fn(),
  updateSystemNotification: jest.fn(),
  deleteSystemNotification: jest.fn(),
  getSystemTasks: jest.fn(),
  createSystemTask: jest.fn(),
  updateSystemTask: jest.fn(),
  deleteSystemTask: jest.fn(),
  executeSystemTask: jest.fn(),
  getSystemSchedules: jest.fn(),
  createSystemSchedule: jest.fn(),
  updateSystemSchedule: jest.fn(),
  deleteSystemSchedule: jest.fn(),
  getSystemAlerts: jest.fn(),
  acknowledgeSystemAlert: jest.fn(),
  getSystemAuditLogs: jest.fn(),
  exportSystemAuditLogs: jest.fn()
};

const mockLoggerService = {
  getLogLevel: jest.fn(),
  setLogLevel: jest.fn(),
  getLogs: jest.fn(),
  clearLogs: jest.fn()
};

const mockMonitoringService = {
  getMetrics: jest.fn(),
  getAlerts: jest.fn(),
  createAlert: jest.fn(),
  updateAlert: jest.fn(),
  deleteAlert: jest.fn()
};

const mockBackupService = {
  createBackup: jest.fn(),
  restoreBackup: jest.fn(),
  listBackups: jest.fn(),
  deleteBackup: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/services/system/system.service', () => ({
  SystemService: mockSystemService
}));

jest.unstable_mockModule('../../../../../src/services/logger.service', () => mockLoggerService);
jest.unstable_mockModule('../../../../../src/services/monitoring.service', () => mockMonitoringService);
jest.unstable_mockModule('../../../../../src/services/backup.service', () => mockBackupService);


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

describe('System Controller', () => {
  let systemController: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/controllers/system.controller');
    systemController = imported.SystemController;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSystemInfo', () => {
    it('应该获取系统信息', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      const mockSystemInfo = {
        version: '1.0.0',
        environment: 'production',
        uptime: 86400,
        nodeVersion: '18.17.0',
        platform: 'linux',
        architecture: 'x64',
        memory: {
          total: 8589934592,
          used: 2147483648,
          free: 6442450944,
          usage: 0.25
        },
        cpu: {
          model: 'Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz',
          cores: 8,
          usage: 0.15
        },
        disk: {
          total: 1099511627776,
          used: 549755813888,
          free: 549755813888,
          usage: 0.5
        },
        database: {
          status: 'connected',
          version: '14.9',
          connections: 5,
          maxConnections: 100
        },
        redis: {
          status: 'connected',
          version: '7.0.12',
          memory: 1048576,
          keys: 150
        }
      };

      mockSystemService.getSystemInfo.mockResolvedValue(mockSystemInfo);

      await systemController.getSystemInfo(req, res, mockNext);

      expect(mockSystemService.getSystemInfo).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSystemInfo
      });
    });

    it('应该处理获取系统信息失败的情况', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      const error = new Error('系统信息获取失败');
      mockSystemService.getSystemInfo.mockRejectedValue(error);

      await systemController.getSystemInfo(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getSystemHealth', () => {
    it('应该获取系统健康状态', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      const mockHealthStatus = {
        status: 'healthy',
        timestamp: new Date(),
        checks: {
          database: {
            status: 'healthy',
            responseTime: 5,
            lastCheck: new Date()
          },
          redis: {
            status: 'healthy',
            responseTime: 2,
            lastCheck: new Date()
          },
          fileSystem: {
            status: 'healthy',
            diskUsage: 0.5,
            lastCheck: new Date()
          },
          memory: {
            status: 'warning',
            usage: 0.85,
            lastCheck: new Date()
          },
          externalServices: {
            status: 'healthy',
            services: {
              emailService: 'healthy',
              smsService: 'healthy',
              aiService: 'healthy'
            }
          }
        },
        overallScore: 85,
        recommendations: [
          {
            type: 'warning',
            message: '内存使用率较高，建议监控',
            priority: 'medium'
          }
        ]
      };

      mockSystemService.getSystemHealth.mockResolvedValue(mockHealthStatus);

      await systemController.getSystemHealth(req, res, mockNext);

      expect(mockSystemService.getSystemHealth).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockHealthStatus
      });
    });
  });

  describe('getSystemMetrics', () => {
    it('应该获取系统指标', async () => {
      const req = createMockRequest({
        query: {
          period: '24h',
          metrics: 'cpu,memory,disk'
        }
      });
      const res = createMockResponse();

      const mockMetrics = {
        period: '24h',
        timestamp: new Date(),
        metrics: {
          cpu: {
            current: 0.15,
            average: 0.12,
            peak: 0.45,
            history: [0.1, 0.12, 0.15, 0.18, 0.16, 0.14, 0.13]
          },
          memory: {
            current: 0.25,
            average: 0.23,
            peak: 0.35,
            history: [0.22, 0.24, 0.25, 0.28, 0.26, 0.24, 0.23]
          },
          disk: {
            current: 0.5,
            average: 0.49,
            peak: 0.52,
            history: [0.48, 0.49, 0.5, 0.51, 0.5, 0.49, 0.5]
          },
          network: {
            inbound: 1024000,
            outbound: 2048000,
            connections: 150
          },
          requests: {
            total: 50000,
            successful: 49500,
            failed: 500,
            averageResponseTime: 120
          }
        },
        alerts: [
          {
            type: 'warning',
            metric: 'memory',
            threshold: 0.8,
            current: 0.85,
            message: '内存使用率超过阈值'
          }
        ]
      };

      mockSystemService.getSystemMetrics.mockResolvedValue(mockMetrics);

      await systemController.getSystemMetrics(req, res, mockNext);

      expect(mockSystemService.getSystemMetrics).toHaveBeenCalledWith({
        period: '24h',
        metrics: 'cpu,memory,disk'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMetrics
      });
    });
  });

  describe('getSystemLogs', () => {
    it('应该获取系统日志', async () => {
      const req = createMockRequest({
        query: {
          level: 'error',
          startDate: '2024-04-01',
          endDate: '2024-04-02',
          page: '1',
          pageSize: '50'
        }
      });
      const res = createMockResponse();

      const mockLogs = {
        logs: [
          {
            id: 1,
            level: 'error',
            message: '数据库连接失败',
            timestamp: new Date('2024-04-01T10:00:00Z'),
            source: 'database',
            details: {
              error: 'Connection timeout',
              stack: 'Error: Connection timeout...'
            }
          },
          {
            id: 2,
            level: 'error',
            message: '用户认证失败',
            timestamp: new Date('2024-04-01T11:00:00Z'),
            source: 'auth',
            details: {
              userId: 123,
              ip: '192.168.1.100'
            }
          }
        ],
        total: 2,
        page: 1,
        pageSize: 50,
        summary: {
          error: 2,
          warning: 0,
          info: 0,
          debug: 0
        }
      };

      mockSystemService.getSystemLogs.mockResolvedValue(mockLogs);

      await systemController.getSystemLogs(req, res, mockNext);

      expect(mockSystemService.getSystemLogs).toHaveBeenCalledWith({
        level: 'error',
        startDate: '2024-04-01',
        endDate: '2024-04-02',
        page: 1,
        pageSize: 50
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockLogs
      });
    });
  });

  describe('clearSystemLogs', () => {
    it('应该清理系统日志', async () => {
      const req = createMockRequest({
        body: {
          olderThan: '30d',
          level: 'debug'
        }
      });
      const res = createMockResponse();

      const mockResult = {
        deletedCount: 1500,
        remainingCount: 500,
        clearedAt: new Date()
      };

      mockSystemService.clearSystemLogs.mockResolvedValue(mockResult);

      await systemController.clearSystemLogs(req, res, mockNext);

      expect(mockSystemService.clearSystemLogs).toHaveBeenCalledWith({
        olderThan: '30d',
        level: 'debug'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: '系统日志清理成功'
      });
    });
  });

  describe('exportSystemLogs', () => {
    it('应该导出系统日志', async () => {
      const req = createMockRequest({
        query: {
          format: 'csv',
          startDate: '2024-04-01',
          endDate: '2024-04-02',
          level: 'error'
        }
      });
      const res = createMockResponse();

      const mockExportResult = {
        filename: 'system_logs_20240401_20240402.csv',
        downloadUrl: '/downloads/system_logs_20240401_20240402.csv',
        size: 1024000,
        recordCount: 150,
        generatedAt: new Date()
      };

      mockSystemService.exportSystemLogs.mockResolvedValue(mockExportResult);

      await systemController.exportSystemLogs(req, res, mockNext);

      expect(mockSystemService.exportSystemLogs).toHaveBeenCalledWith({
        format: 'csv',
        startDate: '2024-04-01',
        endDate: '2024-04-02',
        level: 'error'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockExportResult,
        message: '日志导出成功'
      });
    });
  });

  describe('getSystemConfig', () => {
    it('应该获取系统配置', async () => {
      const req = createMockRequest({
        query: { category: 'email' }
      });
      const res = createMockResponse();

      const mockConfig = {
        email: {
          smtp: {
            host: 'smtp.example.com',
            port: 587,
            secure: false,
            auth: {
              user: 'noreply@example.com',
              pass: '***'
            }
          },
          templates: {
            welcome: 'welcome_template.html',
            notification: 'notification_template.html'
          },
          limits: {
            dailyLimit: 1000,
            hourlyLimit: 100
          }
        }
      };

      mockSystemService.getSystemConfig.mockResolvedValue(mockConfig);

      await systemController.getSystemConfig(req, res, mockNext);

      expect(mockSystemService.getSystemConfig).toHaveBeenCalledWith('email');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockConfig
      });
    });
  });

  describe('updateSystemConfig', () => {
    it('应该更新系统配置', async () => {
      const req = createMockRequest({
        body: {
          category: 'email',
          config: {
            smtp: {
              host: 'smtp.newprovider.com',
              port: 465,
              secure: true
            },
            limits: {
              dailyLimit: 2000,
              hourlyLimit: 200
            }
          }
        }
      });
      const res = createMockResponse();

      const mockUpdatedConfig = {
        category: 'email',
        config: req.body.config,
        updatedAt: new Date(),
        updatedBy: 1
      };

      mockSystemService.updateSystemConfig.mockResolvedValue(mockUpdatedConfig);

      await systemController.updateSystemConfig(req, res, mockNext);

      expect(mockSystemService.updateSystemConfig).toHaveBeenCalledWith(
        'email',
        req.body.config,
        req.user.id
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedConfig,
        message: '系统配置更新成功'
      });
    });
  });

  describe('backupSystem', () => {
    it('应该创建系统备份', async () => {
      const req = createMockRequest({
        body: {
          type: 'full',
          description: '定期全量备份',
          includeFiles: true,
          includeDatabase: true
        }
      });
      const res = createMockResponse();

      const mockBackupResult = {
        id: 1,
        filename: 'backup_20240401_120000.tar.gz',
        type: 'full',
        size: 1073741824,
        description: '定期全量备份',
        createdAt: new Date(),
        createdBy: 1,
        status: 'completed',
        downloadUrl: '/downloads/backup_20240401_120000.tar.gz'
      };

      mockSystemService.backupSystem.mockResolvedValue(mockBackupResult);

      await systemController.backupSystem(req, res, mockNext);

      expect(mockSystemService.backupSystem).toHaveBeenCalledWith({
        ...req.body,
        createdBy: req.user.id
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockBackupResult,
        message: '系统备份创建成功'
      });
    });
  });

  describe('restoreSystem', () => {
    it('应该恢复系统备份', async () => {
      const req = createMockRequest({
        params: { backupId: '1' },
        body: {
          restoreDatabase: true,
          restoreFiles: true,
          restoreConfig: false
        }
      });
      const res = createMockResponse();

      const mockRestoreResult = {
        backupId: 1,
        status: 'completed',
        restoredAt: new Date(),
        restoredBy: 1,
        details: {
          database: 'restored',
          files: 'restored',
          config: 'skipped'
        }
      };

      mockSystemService.restoreSystem.mockResolvedValue(mockRestoreResult);

      await systemController.restoreSystem(req, res, mockNext);

      expect(mockSystemService.restoreSystem).toHaveBeenCalledWith(1, {
        ...req.body,
        restoredBy: req.user.id
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRestoreResult,
        message: '系统恢复成功'
      });
    });
  });

  describe('getBackupList', () => {
    it('应该获取备份列表', async () => {
      const req = createMockRequest({
        query: {
          page: '1',
          pageSize: '10',
          type: 'full'
        }
      });
      const res = createMockResponse();

      const mockBackups = {
        backups: [
          {
            id: 1,
            filename: 'backup_20240401_120000.tar.gz',
            type: 'full',
            size: 1073741824,
            description: '定期全量备份',
            createdAt: new Date('2024-04-01T12:00:00Z'),
            status: 'completed'
          },
          {
            id: 2,
            filename: 'backup_20240331_120000.tar.gz',
            type: 'full',
            size: 1048576000,
            description: '定期全量备份',
            createdAt: new Date('2024-03-31T12:00:00Z'),
            status: 'completed'
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalSize: 2122317824
      };

      mockSystemService.getBackupList.mockResolvedValue(mockBackups);

      await systemController.getBackupList(req, res, mockNext);

      expect(mockSystemService.getBackupList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        type: 'full'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockBackups
      });
    });
  });

  describe('deleteBackup', () => {
    it('应该删除备份', async () => {
      const req = createMockRequest({
        params: { backupId: '1' }
      });
      const res = createMockResponse();

      mockSystemService.deleteBackup.mockResolvedValue(undefined);

      await systemController.deleteBackup(req, res, mockNext);

      expect(mockSystemService.deleteBackup).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '备份删除成功'
      });
    });

    it('应该处理删除不存在的备份', async () => {
      const req = createMockRequest({
        params: { backupId: '999' }
      });
      const res = createMockResponse();

      mockSystemService.deleteBackup.mockResolvedValue(undefined);

      await systemController.deleteBackup(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '备份不存在'
      });
    });
  });

  describe('getSystemSessions', () => {
    it('应该获取系统会话列表', async () => {
      const req = createMockRequest({
        query: {
          status: 'active',
          page: '1',
          pageSize: '20'
        }
      });
      const res = createMockResponse();

      const mockSessions = {
        sessions: [
          {
            id: 'session_123',
            userId: 1,
            userName: '管理员',
            ip: '192.168.1.100',
            userAgent: 'Mozilla/5.0...',
            status: 'active',
            loginAt: new Date('2024-04-01T09:00:00Z'),
            lastActivity: new Date('2024-04-01T15:30:00Z'),
            duration: 23400
          },
          {
            id: 'session_124',
            userId: 2,
            userName: '张老师',
            ip: '192.168.1.101',
            userAgent: 'Mozilla/5.0...',
            status: 'active',
            loginAt: new Date('2024-04-01T08:30:00Z'),
            lastActivity: new Date('2024-04-01T15:25:00Z'),
            duration: 24900
          }
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        summary: {
          active: 2,
          expired: 0,
          total: 2
        }
      };

      mockSystemService.getSystemSessions.mockResolvedValue(mockSessions);

      await systemController.getSystemSessions(req, res, mockNext);

      expect(mockSystemService.getSystemSessions).toHaveBeenCalledWith({
        status: 'active',
        page: 1,
        pageSize: 20
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSessions
      });
    });
  });

  describe('terminateSession', () => {
    it('应该终止指定会话', async () => {
      const req = createMockRequest({
        params: { sessionId: 'session_123' }
      });
      const res = createMockResponse();

      const mockResult = {
        sessionId: 'session_123',
        terminatedAt: new Date(),
        terminatedBy: 1
      };

      mockSystemService.terminateSession.mockResolvedValue(mockResult);

      await systemController.terminateSession(req, res, mockNext);

      expect(mockSystemService.terminateSession).toHaveBeenCalledWith('session_123', req.user.id);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: '会话终止成功'
      });
    });
  });

  describe('getSystemAuditLogs', () => {
    it('应该获取系统审计日志', async () => {
      const req = createMockRequest({
        query: {
          action: 'login',
          userId: '1',
          startDate: '2024-04-01',
          endDate: '2024-04-02',
          page: '1',
          pageSize: '50'
        }
      });
      const res = createMockResponse();

      const mockAuditLogs = {
        logs: [
          {
            id: 1,
            userId: 1,
            userName: '管理员',
            action: 'login',
            resource: 'system',
            details: {
              ip: '192.168.1.100',
              userAgent: 'Mozilla/5.0...'
            },
            timestamp: new Date('2024-04-01T09:00:00Z'),
            result: 'success'
          },
          {
            id: 2,
            userId: 1,
            userName: '管理员',
            action: 'update_config',
            resource: 'system_config',
            details: {
              category: 'email',
              changes: ['smtp.host', 'limits.dailyLimit']
            },
            timestamp: new Date('2024-04-01T10:30:00Z'),
            result: 'success'
          }
        ],
        total: 2,
        page: 1,
        pageSize: 50,
        summary: {
          success: 2,
          failed: 0,
          total: 2
        }
      };

      mockSystemService.getSystemAuditLogs.mockResolvedValue(mockAuditLogs);

      await systemController.getSystemAuditLogs(req, res, mockNext);

      expect(mockSystemService.getSystemAuditLogs).toHaveBeenCalledWith({
        action: 'login',
        userId: 1,
        startDate: '2024-04-01',
        endDate: '2024-04-02',
        page: 1,
        pageSize: 50
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAuditLogs
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理服务层错误', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      const error = new Error('系统服务不可用');
      mockSystemService.getSystemInfo.mockRejectedValue(error);

      await systemController.getSystemInfo(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('应该处理权限不足的情况', async () => {
      const req = createMockRequest({
        user: { id: 2, role: 'teacher' } // 非管理员用户
      });
      const res = createMockResponse();

      const error = new Error('权限不足');
      mockSystemService.getSystemConfig.mockRejectedValue(error);

      await systemController.getSystemConfig(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('应该处理无效参数', async () => {
      const req = createMockRequest({
        params: { backupId: 'invalid' }
      });
      const res = createMockResponse();

      const error = new Error('无效的备份ID');
      mockSystemService.deleteBackup.mockRejectedValue(error);

      await systemController.deleteBackup(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
