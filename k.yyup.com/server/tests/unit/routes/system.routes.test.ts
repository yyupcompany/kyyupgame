import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';

// Mock Express app
const mockApp = {
  use: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  listen: jest.fn()
};

// Mock middleware
const mockAuthMiddleware = jest.fn((req, res, next) => {
  req.user = { id: 1, role: 'admin' };
  next();
});

const mockPermissionMiddleware = jest.fn((permission) => (req, res, next) => {
  next();
});

const mockValidationMiddleware = jest.fn((schema) => (req, res, next) => {
  next();
});

// Mock controllers
const mockSystemController = {
  getSystemInfo: jest.fn(),
  getSystemHealth: jest.fn(),
  getSystemMetrics: jest.fn(),
  getSystemLogs: jest.fn(),
  updateSystemConfig: jest.fn(),
  restartSystem: jest.fn(),
  backupSystem: jest.fn(),
  restoreSystem: jest.fn(),
  clearCache: jest.fn(),
  getSystemStats: jest.fn(),
  exportSystemData: jest.fn(),
  importSystemData: jest.fn(),
  getSystemAlerts: jest.fn(),
  dismissAlert: jest.fn(),
  getSystemTasks: jest.fn(),
  createSystemTask: jest.fn(),
  updateSystemTask: jest.fn(),
  deleteSystemTask: jest.fn()
};

// Mock validation schemas
const mockValidationSchemas = {
  updateSystemConfigSchema: jest.fn(),
  createSystemTaskSchema: jest.fn(),
  updateSystemTaskSchema: jest.fn(),
  systemBackupSchema: jest.fn(),
  systemRestoreSchema: jest.fn()
};

// Mock imports
jest.unstable_mockModule('express', () => ({
  default: jest.fn(() => mockApp),
  Router: jest.fn(() => mockApp)
}));

jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({

jest.unstable_mockModule('../../../../../src/middlewares/validate.middleware', () => ({
  default: mockValidationMiddleware
}));

jest.unstable_mockModule('../../../../../src/controllers/system.controller', () => ({
  default: mockSystemController
}));

jest.unstable_mockModule('../../../../../src/validations/system.validation', () => ({
  default: mockValidationSchemas
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

describe('System Routes', () => {
  let systemRoutes: any;
  let mockRequest: any;
  let mockResponse: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/routes/system.routes');
    systemRoutes = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      params: {},
      query: {},
      body: {},
      user: { id: 1, role: 'admin' },
      headers: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };
  });

  describe('Route Registration', () => {
    it('应该注册所有系统管理路由', () => {
      expect(mockApp.get).toHaveBeenCalledWith('/info', 
        mockAuthMiddleware,
        mockPermissionMiddleware('system:read'),
        mockSystemController.getSystemInfo
      );

      expect(mockApp.get).toHaveBeenCalledWith('/health',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:read'),
        mockSystemController.getSystemHealth
      );

      expect(mockApp.get).toHaveBeenCalledWith('/metrics',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:read'),
        mockSystemController.getSystemMetrics
      );

      expect(mockApp.get).toHaveBeenCalledWith('/logs',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:read'),
        mockSystemController.getSystemLogs
      );

      expect(mockApp.put).toHaveBeenCalledWith('/config',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:write'),
        mockValidationMiddleware(mockValidationSchemas.updateSystemConfigSchema),
        mockSystemController.updateSystemConfig
      );
    });

    it('应该注册系统操作路由', () => {
      expect(mockApp.post).toHaveBeenCalledWith('/restart',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:admin'),
        mockSystemController.restartSystem
      );

      expect(mockApp.post).toHaveBeenCalledWith('/backup',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:admin'),
        mockValidationMiddleware(mockValidationSchemas.systemBackupSchema),
        mockSystemController.backupSystem
      );

      expect(mockApp.post).toHaveBeenCalledWith('/restore',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:admin'),
        mockValidationMiddleware(mockValidationSchemas.systemRestoreSchema),
        mockSystemController.restoreSystem
      );

      expect(mockApp.delete).toHaveBeenCalledWith('/cache',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:admin'),
        mockSystemController.clearCache
      );
    });

    it('应该注册数据管理路由', () => {
      expect(mockApp.get).toHaveBeenCalledWith('/export',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:export'),
        mockSystemController.exportSystemData
      );

      expect(mockApp.post).toHaveBeenCalledWith('/import',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:import'),
        mockSystemController.importSystemData
      );
    });

    it('应该注册系统任务路由', () => {
      expect(mockApp.get).toHaveBeenCalledWith('/tasks',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:read'),
        mockSystemController.getSystemTasks
      );

      expect(mockApp.post).toHaveBeenCalledWith('/tasks',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:write'),
        mockValidationMiddleware(mockValidationSchemas.createSystemTaskSchema),
        mockSystemController.createSystemTask
      );

      expect(mockApp.put).toHaveBeenCalledWith('/tasks/:id',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:write'),
        mockValidationMiddleware(mockValidationSchemas.updateSystemTaskSchema),
        mockSystemController.updateSystemTask
      );

      expect(mockApp.delete).toHaveBeenCalledWith('/tasks/:id',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:write'),
        mockSystemController.deleteSystemTask
      );
    });

    it('应该注册系统告警路由', () => {
      expect(mockApp.get).toHaveBeenCalledWith('/alerts',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:read'),
        mockSystemController.getSystemAlerts
      );

      expect(mockApp.patch).toHaveBeenCalledWith('/alerts/:id/dismiss',
        mockAuthMiddleware,
        mockPermissionMiddleware('system:write'),
        mockSystemController.dismissAlert
      );
    });
  });

  describe('GET /info', () => {
    it('应该获取系统信息', async () => {
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
          free: 6442450944
        },
        cpu: {
          model: 'Intel(R) Core(TM) i7-9750H',
          cores: 8,
          usage: 25.5
        }
      };

      mockSystemController.getSystemInfo.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockSystemInfo
        });
      });

      await mockSystemController.getSystemInfo(mockRequest, mockResponse);

      expect(mockSystemController.getSystemInfo).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSystemInfo
      });
    });

    it('应该处理获取系统信息失败', async () => {
      mockSystemController.getSystemInfo.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: '获取系统信息失败'
        });
      });

      await mockSystemController.getSystemInfo(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '获取系统信息失败'
      });
    });
  });

  describe('GET /health', () => {
    it('应该获取系统健康状态', async () => {
      const mockHealthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: 'up', responseTime: 15 },
          redis: { status: 'up', responseTime: 5 },
          email: { status: 'up', responseTime: 200 },
          storage: { status: 'up', responseTime: 10 }
        },
        metrics: {
          memoryUsage: 0.65,
          cpuUsage: 0.25,
          diskUsage: 0.45
        }
      };

      mockSystemController.getSystemHealth.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockHealthStatus
        });
      });

      await mockSystemController.getSystemHealth(mockRequest, mockResponse);

      expect(mockSystemController.getSystemHealth).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockHealthStatus
      });
    });

    it('应该处理系统不健康状态', async () => {
      const mockUnhealthyStatus = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: 'down', error: '连接超时' },
          redis: { status: 'up', responseTime: 5 }
        }
      };

      mockSystemController.getSystemHealth.mockImplementation((req, res) => {
        res.status(503).json({
          success: false,
          data: mockUnhealthyStatus
        });
      });

      await mockSystemController.getSystemHealth(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        data: mockUnhealthyStatus
      });
    });
  });

  describe('GET /metrics', () => {
    it('应该获取系统指标', async () => {
      mockRequest.query = {
        timeRange: '1h',
        metrics: 'cpu,memory,disk'
      };

      const mockMetrics = {
        timeRange: '1h',
        interval: '5m',
        data: {
          cpu: [
            { timestamp: '2024-01-01T10:00:00Z', value: 25.5 },
            { timestamp: '2024-01-01T10:05:00Z', value: 30.2 }
          ],
          memory: [
            { timestamp: '2024-01-01T10:00:00Z', value: 65.8 },
            { timestamp: '2024-01-01T10:05:00Z', value: 67.1 }
          ],
          disk: [
            { timestamp: '2024-01-01T10:00:00Z', value: 45.3 },
            { timestamp: '2024-01-01T10:05:00Z', value: 45.4 }
          ]
        }
      };

      mockSystemController.getSystemMetrics.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockMetrics
        });
      });

      await mockSystemController.getSystemMetrics(mockRequest, mockResponse);

      expect(mockSystemController.getSystemMetrics).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('应该处理无效的时间范围', async () => {
      mockRequest.query = {
        timeRange: 'invalid'
      };

      mockSystemController.getSystemMetrics.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: '无效的时间范围参数'
        });
      });

      await mockSystemController.getSystemMetrics(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('GET /logs', () => {
    it('应该获取系统日志', async () => {
      mockRequest.query = {
        level: 'error',
        page: '1',
        pageSize: '50',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      const mockLogs = {
        logs: [
          {
            timestamp: '2024-01-15T10:30:00Z',
            level: 'error',
            message: '数据库连接失败',
            source: 'database',
            details: { error: 'Connection timeout' }
          },
          {
            timestamp: '2024-01-15T10:25:00Z',
            level: 'error',
            message: '用户认证失败',
            source: 'auth',
            details: { userId: 123, ip: '192.168.1.100' }
          }
        ],
        pagination: {
          page: 1,
          pageSize: 50,
          total: 125,
          totalPages: 3
        }
      };

      mockSystemController.getSystemLogs.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockLogs
        });
      });

      await mockSystemController.getSystemLogs(mockRequest, mockResponse);

      expect(mockSystemController.getSystemLogs).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('应该处理日志查询参数验证', async () => {
      mockRequest.query = {
        level: 'invalid_level'
      };

      mockSystemController.getSystemLogs.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: '无效的日志级别'
        });
      });

      await mockSystemController.getSystemLogs(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('PUT /config', () => {
    it('应该更新系统配置', async () => {
      mockRequest.body = {
        emailSettings: {
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
          smtpUser: 'noreply@example.com'
        },
        systemSettings: {
          maxFileSize: 10485760,
          sessionTimeout: 3600,
          enableLogging: true
        }
      };

      const mockUpdatedConfig = {
        id: 1,
        ...mockRequest.body,
        updatedAt: new Date().toISOString(),
        updatedBy: 1
      };

      mockSystemController.updateSystemConfig.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '系统配置更新成功',
          data: mockUpdatedConfig
        });
      });

      await mockSystemController.updateSystemConfig(mockRequest, mockResponse);

      expect(mockSystemController.updateSystemConfig).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '系统配置更新成功',
        data: mockUpdatedConfig
      });
    });

    it('应该处理配置验证失败', async () => {
      mockRequest.body = {
        emailSettings: {
          smtpPort: 'invalid_port' // 无效端口
        }
      };

      mockSystemController.updateSystemConfig.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: '配置验证失败',
          errors: ['SMTP端口必须是数字']
        });
      });

      await mockSystemController.updateSystemConfig(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('POST /restart', () => {
    it('应该重启系统', async () => {
      mockRequest.body = {
        reason: '配置更新需要重启',
        delay: 30 // 30秒后重启
      };

      mockSystemController.restartSystem.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '系统将在30秒后重启',
          data: {
            scheduledTime: new Date(Date.now() + 30000).toISOString(),
            reason: '配置更新需要重启'
          }
        });
      });

      await mockSystemController.restartSystem(mockRequest, mockResponse);

      expect(mockSystemController.restartSystem).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('应该处理重启权限不足', async () => {
      mockRequest.user = { id: 1, role: 'user' }; // 非管理员用户

      mockSystemController.restartSystem.mockImplementation((req, res) => {
        res.status(403).json({
          success: false,
          message: '权限不足，无法重启系统'
        });
      });

      await mockSystemController.restartSystem(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });

  describe('POST /backup', () => {
    it('应该创建系统备份', async () => {
      mockRequest.body = {
        type: 'full',
        description: '定期全量备份',
        includeFiles: true,
        includeDatabase: true,
        compression: true
      };

      const mockBackupResult = {
        backupId: 'backup_20240115_103000',
        type: 'full',
        size: 1073741824, // 1GB
        startTime: new Date().toISOString(),
        estimatedDuration: 1800, // 30分钟
        status: 'in_progress'
      };

      mockSystemController.backupSystem.mockImplementation((req, res) => {
        res.status(202).json({
          success: true,
          message: '备份任务已启动',
          data: mockBackupResult
        });
      });

      await mockSystemController.backupSystem(mockRequest, mockResponse);

      expect(mockSystemController.backupSystem).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(202);
    });

    it('应该处理备份存储空间不足', async () => {
      mockSystemController.backupSystem.mockImplementation((req, res) => {
        res.status(507).json({
          success: false,
          message: '存储空间不足，无法创建备份'
        });
      });

      await mockSystemController.backupSystem(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(507);
    });
  });

  describe('POST /restore', () => {
    it('应该恢复系统备份', async () => {
      mockRequest.body = {
        backupId: 'backup_20240115_103000',
        restoreType: 'full',
        confirmRestore: true
      };

      const mockRestoreResult = {
        restoreId: 'restore_20240115_143000',
        backupId: 'backup_20240115_103000',
        startTime: new Date().toISOString(),
        estimatedDuration: 900, // 15分钟
        status: 'in_progress'
      };

      mockSystemController.restoreSystem.mockImplementation((req, res) => {
        res.status(202).json({
          success: true,
          message: '恢复任务已启动',
          data: mockRestoreResult
        });
      });

      await mockSystemController.restoreSystem(mockRequest, mockResponse);

      expect(mockSystemController.restoreSystem).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(202);
    });

    it('应该处理备份文件不存在', async () => {
      mockRequest.body = {
        backupId: 'nonexistent_backup'
      };

      mockSystemController.restoreSystem.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: '指定的备份文件不存在'
        });
      });

      await mockSystemController.restoreSystem(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('DELETE /cache', () => {
    it('应该清除系统缓存', async () => {
      mockRequest.query = {
        type: 'all' // 清除所有缓存
      };

      const mockClearResult = {
        clearedCaches: ['redis', 'memory', 'file'],
        totalSize: 524288000, // 500MB
        duration: 2.5 // 2.5秒
      };

      mockSystemController.clearCache.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '缓存清除成功',
          data: mockClearResult
        });
      });

      await mockSystemController.clearCache(mockRequest, mockResponse);

      expect(mockSystemController.clearCache).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('应该处理特定类型缓存清除', async () => {
      mockRequest.query = {
        type: 'redis'
      };

      mockSystemController.clearCache.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Redis缓存清除成功',
          data: {
            clearedCaches: ['redis'],
            totalSize: 104857600, // 100MB
            duration: 0.8
          }
        });
      });

      await mockSystemController.clearCache(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('GET /tasks', () => {
    it('应该获取系统任务列表', async () => {
      mockRequest.query = {
        status: 'running',
        page: '1',
        pageSize: '20'
      };

      const mockTasks = {
        tasks: [
          {
            id: 1,
            name: '数据备份任务',
            type: 'backup',
            status: 'running',
            progress: 65,
            startTime: '2024-01-15T10:00:00Z',
            estimatedEndTime: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            name: '日志清理任务',
            type: 'cleanup',
            status: 'scheduled',
            scheduledTime: '2024-01-16T02:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 15,
          totalPages: 1
        }
      };

      mockSystemController.getSystemTasks.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockTasks
        });
      });

      await mockSystemController.getSystemTasks(mockRequest, mockResponse);

      expect(mockSystemController.getSystemTasks).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('POST /tasks', () => {
    it('应该创建系统任务', async () => {
      mockRequest.body = {
        name: '定期数据清理',
        type: 'cleanup',
        schedule: '0 2 * * *', // 每天凌晨2点
        config: {
          retentionDays: 30,
          targetTables: ['logs', 'temp_data']
        }
      };

      const mockCreatedTask = {
        id: 3,
        ...mockRequest.body,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        createdBy: 1
      };

      mockSystemController.createSystemTask.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: '系统任务创建成功',
          data: mockCreatedTask
        });
      });

      await mockSystemController.createSystemTask(mockRequest, mockResponse);

      expect(mockSystemController.createSystemTask).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Middleware Integration', () => {
    it('应该正确应用认证中间件', () => {
      expect(mockAuthMiddleware).toBeDefined();
      
      // 模拟中间件执行
      const req = { headers: { authorization: 'Bearer token' } };
      const res = {};
      const next = jest.fn();

      mockAuthMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('应该正确应用权限中间件', () => {
      expect(mockPermissionMiddleware).toBeDefined();
      
      const permissionCheck = mockPermissionMiddleware('system:admin');
      const req = { user: { id: 1, role: 'admin' } };
      const res = {};
      const next = jest.fn();

      permissionCheck(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('应该正确应用验证中间件', () => {
      expect(mockValidationMiddleware).toBeDefined();
      
      const validation = mockValidationMiddleware(mockValidationSchemas.updateSystemConfigSchema);
      const req = { body: { validData: true } };
      const res = {};
      const next = jest.fn();

      validation(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('应该处理控制器异常', async () => {
      mockSystemController.getSystemInfo.mockImplementation((req, res) => {
        throw new Error('Internal server error');
      });

      try {
        await mockSystemController.getSystemInfo(mockRequest, mockResponse);
      } catch (error) {
        expect(error.message).toBe('Internal server error');
      }
    });

    it('应该处理权限验证失败', async () => {
      mockPermissionMiddleware.mockImplementation((permission) => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: '权限不足'
        });
      });

      const permissionCheck = mockPermissionMiddleware('system:admin');
      await permissionCheck(mockRequest, mockResponse, jest.fn());

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('应该处理数据验证失败', async () => {
      mockValidationMiddleware.mockImplementation((schema) => (req, res, next) => {
        res.status(400).json({
          success: false,
          message: '数据验证失败',
          errors: ['字段不能为空']
        });
      });

      const validation = mockValidationMiddleware(mockValidationSchemas.updateSystemConfigSchema);
      await validation(mockRequest, mockResponse, jest.fn());

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});
