import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Sequelize
const mockSequelize = {
  transaction: jest.fn(),
  query: jest.fn(),
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
  finished: 'pending'
};

// Mock models
const mockUser = {
  findAll: jest.fn(),
  count: jest.fn(),
  findOne: jest.fn()
};

const mockActivity = {
  findAll: jest.fn(),
  count: jest.fn()
};

const mockEnrollmentApplication = {
  findAll: jest.fn(),
  count: jest.fn()
};

const mockKindergarten = {
  findAll: jest.fn(),
  count: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/init', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../src/services/dashboard/dashboard.service', () => ({
  DashboardService: jest.fn().mockImplementation(() => ({
    getOverviewStats: jest.fn(),
    getUserStats: jest.fn(),
    getActivityStats: jest.fn(),
    getEnrollmentStats: jest.fn(),
    getRecentActivities: jest.fn(),
    getSystemHealth: jest.fn()
  }))
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/activity.model', () => ({
  Activity: mockActivity
}));

jest.unstable_mockModule('../../../../../src/models/enrollment-application.model', () => ({
  EnrollmentApplication: mockEnrollmentApplication
}));

jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({
  Kindergarten: mockKindergarten
}));

jest.unstable_mockModule('../../../../../src/utils/apiError', () => ({
  ApiError: jest.fn().mockImplementation((message, statusCode) => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  })
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

describe('Dashboard Service', () => {
  let dashboardService: any;
  let DashboardService: any;

  beforeAll(async () => {
    const { DashboardService: ImportedDashboardService } = await import('../../../../../src/services/dashboard/dashboard.service');
    DashboardService = ImportedDashboardService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    dashboardService = new DashboardService();
  });

  describe('getOverviewStats', () => {
    it('应该成功获取概览统计数据', async () => {
      // Mock数据
      mockUser.count.mockResolvedValue(150);
      mockActivity.count.mockResolvedValue(25);
      mockEnrollmentApplication.count.mockResolvedValue(80);
      mockKindergarten.count.mockResolvedValue(5);

      const result = await dashboardService.getOverviewStats();

      expect(result).toEqual({
        totalUsers: 150,
        totalActivities: 25,
        totalApplications: 80,
        totalKindergartens: 5
      });

      expect(mockUser.count).toHaveBeenCalled();
      expect(mockActivity.count).toHaveBeenCalled();
      expect(mockEnrollmentApplication.count).toHaveBeenCalled();
      expect(mockKindergarten.count).toHaveBeenCalled();
    });

    it('应该处理数据库查询错误', async () => {
      mockUser.count.mockRejectedValue(new Error('Database error'));

      await expect(dashboardService.getOverviewStats()).rejects.toThrow('Database error');
    });
  });

  describe('getUserStats', () => {
    it('应该成功获取用户统计数据', async () => {
      const mockUserStats = [
        { status: 'active', count: 120 },
        { status: 'inactive', count: 30 }
      ];

      mockSequelize.query.mockResolvedValue([mockUserStats, null]);

      const result = await dashboardService.getUserStats();

      expect(result).toEqual(mockUserStats);
      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT status, COUNT(*) as count FROM users'),
        expect.objectContaining({
          type: 'SELECT'
        })
      );
    });

    it('应该处理空结果', async () => {
      mockSequelize.query.mockResolvedValue([[], null]);

      const result = await dashboardService.getUserStats();

      expect(result).toEqual([]);
    });
  });

  describe('getActivityStats', () => {
    it('应该成功获取活动统计数据', async () => {
      const mockActivityStats = [
        { status: 'ongoing', count: 10 },
        { status: 'completed', count: 15 }
      ];

      mockSequelize.query.mockResolvedValue([mockActivityStats, null]);

      const result = await dashboardService.getActivityStats();

      expect(result).toEqual(mockActivityStats);
      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT status, COUNT(*) as count FROM activities'),
        expect.objectContaining({
          type: 'SELECT'
        })
      );
    });
  });

  describe('getEnrollmentStats', () => {
    it('应该成功获取招生统计数据', async () => {
      const mockEnrollmentStats = [
        { status: 'pending', count: 20 },
        { status: 'approved', count: 40 },
        { status: 'rejected', count: 20 }
      ];

      mockSequelize.query.mockResolvedValue([mockEnrollmentStats, null]);

      const result = await dashboardService.getEnrollmentStats();

      expect(result).toEqual(mockEnrollmentStats);
      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT status, COUNT(*) as count FROM enrollment_applications'),
        expect.objectContaining({
          type: 'SELECT'
        })
      );
    });
  });

  describe('getRecentActivities', () => {
    it('应该成功获取最近活动', async () => {
      const mockRecentActivities = [
        {
          id: 1,
          title: '春游活动',
          status: 'ongoing',
          createdAt: new Date('2024-01-15'),
          kindergarten: { name: '阳光幼儿园' }
        },
        {
          id: 2,
          title: '亲子运动会',
          status: 'completed',
          createdAt: new Date('2024-01-10'),
          kindergarten: { name: '快乐幼儿园' }
        }
      ];

      mockActivity.findAll.mockResolvedValue(mockRecentActivities);

      const limit = 10;
      const result = await dashboardService.getRecentActivities(limit);

      expect(result).toEqual(mockRecentActivities);
      expect(mockActivity.findAll).toHaveBeenCalledWith({
        limit,
        order: [['createdAt', 'DESC']],
        include: expect.arrayContaining([
          expect.objectContaining({
            model: expect.anything(),
            attributes: ['name']
          })
        ])
      });
    });

    it('应该使用默认限制数量', async () => {
      mockActivity.findAll.mockResolvedValue([]);

      await dashboardService.getRecentActivities();

      expect(mockActivity.findAll).toHaveBeenCalledWith({
        limit: 20, // 默认值
        order: [['createdAt', 'DESC']],
        include: expect.any(Array)
      });
    });
  });

  describe('getSystemHealth', () => {
    it('应该成功获取系统健康状态', async () => {
      // Mock数据库连接正常
      mockSequelize.authenticate.mockResolvedValue(undefined);

      const result = await dashboardService.getSystemHealth();

      expect(result).toEqual({
        database: 'healthy',
        uptime: expect.any(Number),
        memory: expect.objectContaining({
          used: expect.any(Number),
          total: expect.any(Number),
          percentage: expect.any(Number)
        }),
        timestamp: expect.any(Date)
      });

      expect(mockSequelize.authenticate).toHaveBeenCalled();
    });

    it('应该处理数据库连接失败', async () => {
      mockSequelize.authenticate.mockRejectedValue(new Error('Connection failed'));

      const result = await dashboardService.getSystemHealth();

      expect(result.database).toBe('unhealthy');
      expect(result.error).toBe('Connection failed');
    });
  });
});
