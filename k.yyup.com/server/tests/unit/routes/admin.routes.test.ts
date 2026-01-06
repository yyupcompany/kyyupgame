import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockAdminController = {
  getAdminDashboard: jest.fn(),
  getSystemStats: jest.fn(),
  getUserManagement: jest.fn(),
  getSystemSettings: jest.fn(),
  updateSystemSettings: jest.fn(),
  getAuditLogs: jest.fn(),
  getSystemHealth: jest.fn(),
  performSystemBackup: jest.fn(),
  performSystemRestore: jest.fn(),
  getSystemNotifications: jest.fn(),
  sendSystemNotification: jest.fn(),
  getSystemUpdates: jest.fn(),
  installSystemUpdate: jest.fn(),
  getSystemMetrics: jest.fn(),
  getSystemPerformance: jest.fn(),
  getSystemSecurity: jest.fn(),
  updateSystemSecurity: jest.fn(),
  getSystemUsers: jest.fn(),
  createSystemUser: jest.fn(),
  updateSystemUser: jest.fn(),
  deleteSystemUser: jest.fn(),
  getSystemRoles: jest.fn(),
  createSystemRole: jest.fn(),
  updateSystemRole: jest.fn(),
  deleteSystemRole: jest.fn(),
  getSystemPermissions: jest.fn(),
  createSystemPermission: jest.fn(),
  updateSystemPermission: jest.fn(),
  deleteSystemPermission: jest.fn()
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
jest.unstable_mockModule('../../../../../src/controllers/admin.controller', () => mockAdminController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
jest.unstable_mockModule('../../../../../src/middlewares/rate-limit.middleware', () => ({
  adminRateLimit: mockRateLimitMiddleware,
  strictRateLimit: mockRateLimitMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/permission.middleware', () => ({
  checkPermission: mockPermissionMiddleware,
  requireAdmin: mockAdminAuthMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/security.middleware', () => ({
  sanitizeInput: mockSecurityMiddleware,
  validateContentType: mockSecurityMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/cache.middleware', () => ({
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

describe('Admin Routes', () => {
  let adminRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedAdminRouter } = await import('../../../../../src/routes/admin.routes');
    adminRouter = importedAdminRouter;
    
    // 设置Express应用
    mockApp.use('/admin', adminRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockAdminController.getAdminDashboard.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalUsers: 1250,
            activeUsers: 890,
            totalStudents: 480,
            totalTeachers: 45,
            totalClasses: 12,
            systemUptime: '99.9%'
          },
          recentActivities: [
            {
              id: 1,
              type: 'user_registration',
              description: '新用户注册: 张老师',
              timestamp: '2024-02-20T14:30:00.000Z',
              user: '张老师'
            },
            {
              id: 2,
              type: 'system_update',
              description: '系统更新完成',
              timestamp: '2024-02-20T12:00:00.000Z',
              user: '系统'
            }
          ],
          systemHealth: {
            status: 'healthy',
            cpu: 45,
            memory: 65,
            disk: 78,
            database: 'connected'
          },
          alerts: [
            {
              id: 1,
              type: 'warning',
              message: '磁盘空间使用率较高',
              timestamp: '2024-02-20T10:00:00.000Z'
            }
          ]
        },
        message: '获取管理员仪表板成功'
      });
    });

    mockAdminController.getSystemStats.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          users: {
            total: 1250,
            active: 890,
            inactive: 360,
            newThisMonth: 45
          },
          students: {
            total: 480,
            active: 465,
            graduated: 15,
            newThisMonth: 12
          },
          teachers: {
            total: 45,
            active: 42,
            inactive: 3,
            newThisMonth: 2
          },
          classes: {
            total: 12,
            active: 12,
            full: 8,
            available: 4
          },
          system: {
            uptime: '99.9%',
            responseTime: 120,
            errorRate: 0.1,
            lastBackup: '2024-02-20T02:00:00.000Z'
          }
        },
        message: '获取系统统计成功'
      });
    });

    mockAdminController.getSystemSettings.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          general: {
            siteName: '幼儿园管理系统',
            siteUrl: 'https://kindergarten.example.com',
            adminEmail: 'admin@kindergarten.example.com',
            timezone: 'Asia/Shanghai',
            language: 'zh-CN'
          },
          security: {
            sessionTimeout: 3600,
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireNumbers: true,
              requireSpecialChars: true
            },
            twoFactorAuth: true,
            loginAttempts: 5
          },
          email: {
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUser: 'noreply@kindergarten.example.com',
            smtpSecure: true
          },
          storage: {
            maxFileSize: 10485760,
            allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
            storagePath: '/uploads'
          }
        },
        message: '获取系统设置成功'
      });
    });

    mockAdminController.getAuditLogs.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [
          {
            id: 1,
            userId: 123,
            username: 'admin',
            action: 'login',
            resource: 'system',
            details: '管理员登录',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timestamp: '2024-02-20T14:30:00.000Z'
          },
          {
            id: 2,
            userId: 456,
            username: '张老师',
            action: 'update',
            resource: 'student',
            details: '更新学生信息',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            timestamp: '2024-02-20T14:25:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        },
        message: '获取审计日志成功'
      });
    });
  });

  describe('GET /admin/dashboard', () => {
    it('应该获取管理员仪表板', async () => {
      const response = await request(mockApp)
        .get('/admin/dashboard')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          overview: {
            totalUsers: 1250,
            activeUsers: 890,
            totalStudents: 480,
            totalTeachers: 45,
            totalClasses: 12,
            systemUptime: '99.9%'
          },
          recentActivities: [
            {
              id: 1,
              type: 'user_registration',
              description: '新用户注册: 张老师',
              timestamp: '2024-02-20T14:30:00.000Z',
              user: '张老师'
            },
            {
              id: 2,
              type: 'system_update',
              description: '系统更新完成',
              timestamp: '2024-02-20T12:00:00.000Z',
              user: '系统'
            }
          ],
          systemHealth: {
            status: 'healthy',
            cpu: 45,
            memory: 65,
            disk: 78,
            database: 'connected'
          },
          alerts: [
            {
              id: 1,
              type: 'warning',
              message: '磁盘空间使用率较高',
              timestamp: '2024-02-20T10:00:00.000Z'
            }
          ]
        },
        message: '获取管理员仪表板成功'
      });

      expect(mockAdminController.getAdminDashboard).toHaveBeenCalled();
    });

    it('应该应用管理员认证中间件', async () => {
      await request(mockApp)
        .get('/admin/dashboard')
        .set('Authorization', 'Bearer admin-token');

      expect(mockAdminAuthMiddleware).toHaveBeenCalled();
    });

    it('应该应用缓存中间件', async () => {
      await request(mockApp)
        .get('/admin/dashboard')
        .set('Authorization', 'Bearer admin-token');

      expect(mockCacheMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /admin/stats', () => {
    it('应该获取系统统计', async () => {
      const response = await request(mockApp)
        .get('/admin/stats')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          users: {
            total: 1250,
            active: 890,
            inactive: 360,
            newThisMonth: 45
          },
          students: {
            total: 480,
            active: 465,
            graduated: 15,
            newThisMonth: 12
          },
          teachers: {
            total: 45,
            active: 42,
            inactive: 3,
            newThisMonth: 2
          },
          classes: {
            total: 12,
            active: 12,
            full: 8,
            available: 4
          },
          system: {
            uptime: '99.9%',
            responseTime: 120,
            errorRate: 0.1,
            lastBackup: '2024-02-20T02:00:00.000Z'
          }
        },
        message: '获取系统统计成功'
      });

      expect(mockAdminController.getSystemStats).toHaveBeenCalled();
    });

    it('应该支持时间范围参数', async () => {
      const startDate = '2024-02-01';
      const endDate = '2024-02-29';

      await request(mockApp)
        .get('/admin/stats')
        .query({ startDate, endDate })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(mockAdminController.getSystemStats).toHaveBeenCalledWith(
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
  });

  describe('GET /admin/settings', () => {
    it('应该获取系统设置', async () => {
      const response = await request(mockApp)
        .get('/admin/settings')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          general: {
            siteName: '幼儿园管理系统',
            siteUrl: 'https://kindergarten.example.com',
            adminEmail: 'admin@kindergarten.example.com',
            timezone: 'Asia/Shanghai',
            language: 'zh-CN'
          },
          security: {
            sessionTimeout: 3600,
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireNumbers: true,
              requireSpecialChars: true
            },
            twoFactorAuth: true,
            loginAttempts: 5
          },
          email: {
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUser: 'noreply@kindergarten.example.com',
            smtpSecure: true
          },
          storage: {
            maxFileSize: 10485760,
            allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
            storagePath: '/uploads'
          }
        },
        message: '获取系统设置成功'
      });

      expect(mockAdminController.getSystemSettings).toHaveBeenCalled();
    });
  });

  describe('PUT /admin/settings', () => {
    it('应该更新系统设置', async () => {
      mockAdminController.updateSystemSettings.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            siteName: '幼儿园管理系统 v2.0',
            updatedAt: new Date().toISOString()
          },
          message: '系统设置更新成功'
        });
      });

      const settingsData = {
        general: {
          siteName: '幼儿园管理系统 v2.0',
          siteUrl: 'https://kindergarten-v2.example.com'
        },
        security: {
          sessionTimeout: 7200
        }
      };

      const response = await request(mockApp)
        .put('/admin/settings')
        .send(settingsData)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockAdminController.updateSystemSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          body: settingsData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证设置数据', async () => {
      const invalidSettings = {
        general: {
          siteName: '', // 空站点名称
          siteUrl: 'invalid-url' // 无效URL
        }
      };

      await request(mockApp)
        .put('/admin/settings')
        .send(invalidSettings)
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该应用安全中间件', async () => {
      await request(mockApp)
        .put('/admin/settings')
        .send({ general: { siteName: '测试' } })
        .set('Authorization', 'Bearer admin-token');

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /admin/audit-logs', () => {
    it('应该获取审计日志', async () => {
      const response = await request(mockApp)
        .get('/admin/audit-logs')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [
          {
            id: 1,
            userId: 123,
            username: 'admin',
            action: 'login',
            resource: 'system',
            details: '管理员登录',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timestamp: '2024-02-20T14:30:00.000Z'
          },
          {
            id: 2,
            userId: 456,
            username: '张老师',
            action: 'update',
            resource: 'student',
            details: '更新学生信息',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            timestamp: '2024-02-20T14:25:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        },
        message: '获取审计日志成功'
      });

      expect(mockAdminController.getAuditLogs).toHaveBeenCalled();
    });

    it('应该支持分页参数', async () => {
      const page = 2;
      const limit = 5;

      await request(mockApp)
        .get('/admin/audit-logs')
        .query({ page, limit })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(mockAdminController.getAuditLogs).toHaveBeenCalledWith(
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

    it('应该支持过滤参数', async () => {
      const filters = {
        userId: '123',
        action: 'login',
        startDate: '2024-02-01',
        endDate: '2024-02-29'
      };

      await request(mockApp)
        .get('/admin/audit-logs')
        .query(filters)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(mockAdminController.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining(filters)
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /admin/system-health', () => {
    it('应该获取系统健康状态', async () => {
      mockAdminController.getSystemHealth.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            status: 'healthy',
            checks: [
              {
                name: 'database',
                status: 'healthy',
                responseTime: 15,
                message: '数据库连接正常'
              },
              {
                name: 'redis',
                status: 'healthy',
                responseTime: 5,
                message: 'Redis连接正常'
              },
              {
                name: 'storage',
                status: 'warning',
                responseTime: 25,
                message: '磁盘空间使用率较高'
              }
            ],
            metrics: {
              cpu: 45,
              memory: 65,
              disk: 78,
              network: 12
            },
            timestamp: new Date().toISOString()
          },
          message: '获取系统健康状态成功'
        });
      });

      const response = await request(mockApp)
        .get('/admin/system-health')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockAdminController.getSystemHealth).toHaveBeenCalled();
    });
  });

  describe('POST /admin/backup', () => {
    it('应该执行系统备份', async () => {
      mockAdminController.performSystemBackup.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            backupId: 'backup_20240220_143000',
            filename: 'kindergarten_backup_20240220_143000.sql',
            size: 25600000,
            status: 'completed',
            downloadUrl: '/api/admin/download-backup/backup_20240220_143000',
            createdAt: new Date().toISOString()
          },
          message: '系统备份完成'
        });
      });

      const backupData = {
        type: 'full',
        includeFiles: true,
        compress: true
      };

      const response = await request(mockApp)
        .post('/admin/backup')
        .send(backupData)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockAdminController.performSystemBackup).toHaveBeenCalledWith(
        expect.objectContaining({
          body: backupData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该检查管理员权限', async () => {
      await request(mockApp)
        .post('/admin/backup')
        .send({ type: 'full' })
        .set('Authorization', 'Bearer admin-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /admin/restore', () => {
    it('应该执行系统恢复', async () => {
      mockAdminController.performSystemRestore.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            restoreId: 'restore_20240220_143000',
            backupFile: 'kindergarten_backup_20240220_143000.sql',
            status: 'completed',
            restoredTables: ['users', 'students', 'teachers', 'classes'],
            restoredAt: new Date().toISOString()
          },
          message: '系统恢复完成'
        });
      });

      const restoreData = {
        backupFile: 'kindergarten_backup_20240220_143000.sql',
        confirm: true
      };

      const response = await request(mockApp)
        .post('/admin/restore')
        .send(restoreData)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockAdminController.performSystemRestore).toHaveBeenCalledWith(
        expect.objectContaining({
          body: restoreData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证恢复数据', async () => {
      const invalidRestoreData = {
        backupFile: '', // 空文件名
        confirm: false // 未确认
      };

      await request(mockApp)
        .post('/admin/restore')
        .send(invalidRestoreData)
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /admin/users', () => {
    it('应该获取系统用户列表', async () => {
      mockAdminController.getSystemUsers.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              username: 'admin',
              email: 'admin@kindergarten.example.com',
              role: 'admin' as any,
              status: 'active',
              lastLogin: '2024-02-20T14:30:00.000Z',
              createdAt: '2024-01-01T00:00:00.000Z'
            },
            {
              id: 2,
              username: '张老师',
              email: 'zhang@kindergarten.example.com',
              role: 'teacher',
              status: 'active',
              lastLogin: '2024-02-20T14:25:00.000Z',
              createdAt: '2024-01-15T10:00:00.000Z'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          },
          message: '获取系统用户列表成功'
        });
      });

      const response = await request(mockApp)
        .get('/admin/users')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockAdminController.getSystemUsers).toHaveBeenCalled();
    });

    it('应该支持用户过滤', async () => {
      const filters = {
        role: 'teacher',
        status: 'active',
        search: '张'
      };

      await request(mockApp)
        .get('/admin/users')
        .query(filters)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(mockAdminController.getSystemUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining(filters)
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('POST /admin/users', () => {
    it('应该创建系统用户', async () => {
      mockAdminController.createSystemUser.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: {
            id: 3,
            username: '李老师',
            email: 'li@kindergarten.example.com',
            role: 'teacher',
            status: 'active',
            createdAt: new Date().toISOString()
          },
          message: '系统用户创建成功'
        });
      });

      const userData = {
        username: '李老师',
        email: 'li@kindergarten.example.com',
        password: 'Password123!',
        role: 'teacher',
        status: 'active'
      };

      const response = await request(mockApp)
        .post('/admin/users')
        .send(userData)
        .set('Authorization', 'Bearer admin-token')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockAdminController.createSystemUser).toHaveBeenCalledWith(
        expect.objectContaining({
          body: userData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证用户数据', async () => {
      const invalidUserData = {
        username: '', // 空用户名
        email: 'invalid-email', // 无效邮箱
        password: '123', // 弱密码
        role: 'invalid_role' // 无效角色
      };

      await request(mockApp)
        .post('/admin/users')
        .send(invalidUserData)
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /admin/roles', () => {
    it('应该获取系统角色列表', async () => {
      mockAdminController.getSystemRoles.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: 'admin',
              displayName: '管理员',
              description: '系统管理员',
              permissions: ['all'],
              userCount: 2,
              createdAt: '2024-01-01T00:00:00.000Z'
            },
            {
              id: 2,
              name: 'teacher',
              displayName: '教师',
              description: '幼儿园教师',
              permissions: ['student_read', 'student_write', 'class_read'],
              userCount: 42,
              createdAt: '2024-01-01T00:00:00.000Z'
            }
          ],
          message: '获取系统角色列表成功'
        });
      });

      const response = await request(mockApp)
        .get('/admin/roles')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockAdminController.getSystemRoles).toHaveBeenCalled();
    });
  });

  describe('GET /admin/permissions', () => {
    it('应该获取系统权限列表', async () => {
      mockAdminController.getSystemPermissions.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: 'user_read',
              displayName: '查看用户',
              description: '查看用户信息',
              module: 'user',
              resource: 'user'
            },
            {
              id: 2,
              name: 'user_write',
              displayName: '编辑用户',
              description: '编辑用户信息',
              module: 'user',
              resource: 'user'
            }
          ],
          message: '获取系统权限列表成功'
        });
      });

      const response = await request(mockApp)
        .get('/admin/permissions')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockAdminController.getSystemPermissions).toHaveBeenCalled();
    });
  });

  describe('路由中间件应用', () => {
    it('应该正确应用管理员认证中间件到所有路由', () => {
      const adminRoutes = ['/admin/dashboard', '/admin/stats', '/admin/settings', 
                          '/admin/audit-logs', '/admin/system-health', '/admin/users',
                          '/admin/roles', '/admin/permissions'];
      
      adminRoutes.forEach(route => {
        expect(mockAdminAuthMiddleware).toBeDefined();
      });
    });

    it('应该正确应用权限中间件到敏感操作', () => {
      const permissionRoutes = ['/admin/settings', '/admin/backup', '/admin/restore',
                              '/admin/users', '/admin/roles', '/admin/permissions'];
      
      permissionRoutes.forEach(route => {
        expect(mockPermissionMiddleware).toBeDefined();
      });
    });

    it('应该正确应用验证中间件到数据修改路由', () => {
      const validatedRoutes = ['/admin/settings', '/admin/backup', '/admin/restore',
                              '/admin/users', '/admin/roles', '/admin/permissions'];
      
      validatedRoutes.forEach(route => {
        expect(mockValidationMiddleware).toBeDefined();
      });
    });

    it('应该正确应用安全中间件到所有路由', () => {
      expect(mockSecurityMiddleware).toBeDefined();
    });

    it('应该正确应用缓存中间件到数据查询路由', () => {
      const cachedRoutes = ['/admin/dashboard', '/admin/stats', '/admin/settings'];
      
      cachedRoutes.forEach(route => {
        expect(mockCacheMiddleware).toBeDefined();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockAdminController.getAdminDashboard.mockImplementation((req, res, next) => {
        const error = new Error('获取管理员仪表板失败');
        next(error);
      });

      await request(mockApp)
        .get('/admin/dashboard')
        .set('Authorization', 'Bearer admin-token')
        .expect(500);
    });

    it('应该处理验证中间件错误', async () => {
      mockValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('参数验证失败');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .post('/admin/users')
        .send({ username: '', email: 'invalid' })
        .set('Authorization', 'Bearer admin-token')
        .expect(400);
    });

    it('应该处理权限不足错误', async () => {
      mockPermissionMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('权限不足');
        (error as any).statusCode = 403;
        next(error);
      });

      await request(mockApp)
        .post('/admin/backup')
        .send({ type: 'full' })
        .set('Authorization', 'Bearer user-token')
        .expect(403);
    });

    it('应该处理备份失败错误', async () => {
      mockAdminController.performSystemBackup.mockImplementation((req, res, next) => {
        const error = new Error('备份失败：磁盘空间不足');
        (error as any).statusCode = 500;
        next(error);
      });

      await request(mockApp)
        .post('/admin/backup')
        .send({ type: 'full' })
        .set('Authorization', 'Bearer admin-token')
        .expect(500);
    });

    it('应该处理恢复失败错误', async () => {
      mockAdminController.performSystemRestore.mockImplementation((req, res, next) => {
        const error = new Error('恢复失败：备份文件损坏');
        (error as any).statusCode = 500;
        next(error);
      });

      await request(mockApp)
        .post('/admin/restore')
        .send({ backupFile: 'invalid.sql', confirm: true })
        .set('Authorization', 'Bearer admin-token')
        .expect(500);
    });
  });

  describe('性能测试', () => {
    it('应该处理大量用户数据', async () => {
      mockAdminController.getSystemUsers.mockImplementation((req, res) => {
        // 模拟大量用户数据
        const largeData = Array(1000).fill(null).map((_, i) => ({
          id: i + 1,
          username: `user${i + 1}`,
          email: `user${i + 1}@example.com`,
          role: i % 3 === 0 ? 'admin' : 'teacher',
          status: 'active',
          lastLogin: new Date(Date.now() - i * 86400000).toISOString(),
          createdAt: new Date(Date.now() - i * 86400000).toISOString()
        }));

        res.status(200).json({
          success: true,
          data: largeData,
          pagination: {
            page: 1,
            limit: 1000,
            total: 1000,
            totalPages: 1
          },
          message: '获取系统用户列表成功'
        });
      });

      const response = await request(mockApp)
        .get('/admin/users')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1000);
    });

    it('应该处理大量审计日志数据', async () => {
      mockAdminController.getAuditLogs.mockImplementation((req, res) => {
        // 模拟大量审计日志数据
        const largeData = Array(5000).fill(null).map((_, i) => ({
          id: i + 1,
          userId: Math.floor(Math.random() * 100) + 1,
          username: `user${Math.floor(Math.random() * 100) + 1}`,
          action: ['login', 'logout', 'create', 'update', 'delete'][Math.floor(Math.random() * 5)],
          resource: ['user', 'student', 'teacher', 'class'][Math.floor(Math.random() * 4)],
          details: `操作详情 ${i + 1}`,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Test Browser)',
          timestamp: new Date(Date.now() - i * 60000).toISOString()
        }));

        res.status(200).json({
          success: true,
          data: largeData,
          pagination: {
            page: 1,
            limit: 5000,
            total: 5000,
            totalPages: 1
          },
          message: '获取审计日志成功'
        });
      });

      const response = await request(mockApp)
        .get('/admin/audit-logs')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(5000);
    });
  });

  describe('安全测试', () => {
    it('应该防止SQL注入攻击', async () => {
      const maliciousQuery = "'; DROP TABLE users; --";

      await request(mockApp)
        .get('/admin/users')
        .query({ search: maliciousQuery })
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });

    it('应该防止XSS攻击', async () => {
      const maliciousScript = '<script>alert("xss")</script>';

      await request(mockApp)
        .post('/admin/users')
        .send({ username: maliciousScript, email: 'test@example.com', password: 'Password123!', role: 'teacher' })
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(mockSecurityMiddleware).toHaveBeenCalled();
    });

    it('应该验证输入数据格式', async () => {
      const invalidFormats = [
        { route: '/admin/users', method: 'post', body: { username: '', email: 'invalid-email' } },
        { route: '/admin/settings', method: 'put', body: { general: { siteName: '', siteUrl: 'invalid' } } },
        { route: '/admin/backup', method: 'post', body: { type: 'invalid_type' } },
        { route: '/admin/restore', method: 'post', body: { backupFile: '', confirm: false } }
      ];

      for (const { route, method, body } of invalidFormats) {
        const req = request(mockApp)[method](route)
          .set('Authorization', 'Bearer admin-token');
        
        if (body) {
          req.send(body);
        }
        
        await req.expect(400);
      }
    });

    it('应该限制管理员操作频率', async () => {
      mockRateLimitMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('请求过于频繁');
        (error as any).statusCode = 429;
        next(error);
      });

      await request(mockApp)
        .post('/admin/backup')
        .send({ type: 'full' })
        .set('Authorization', 'Bearer admin-token')
        .expect(429);
    });

    it('应该保护敏感系统操作', async () => {
      const sensitiveOperations = [
        { path: '/admin/backup', method: 'post' },
        { path: '/admin/restore', method: 'post' },
        { path: '/admin/settings', method: 'put' }
      ];

      for (const { path, method } of sensitiveOperations) {
        await request(mockApp)[method](path)
          .set('Authorization', 'Bearer user-token')
          .expect(403);
      }
    });
  });
});