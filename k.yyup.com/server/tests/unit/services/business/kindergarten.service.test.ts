import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockKindergarten = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findAndCountAll: jest.fn()
};

const mockUser = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};

const mockClass = {
  findAll: jest.fn(),
  count: jest.fn(),
  create: jest.fn()
};

const mockStudent = {
  findAll: jest.fn(),
  count: jest.fn()
};

const mockTeacher = {
  findAll: jest.fn(),
  count: jest.fn()
};

// Mock Sequelize transaction
const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn().mockResolvedValue(mockTransaction)
};

// Mock logger
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock cache
const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn()
};

// Mock file service
const mockFileService = {
  uploadImage: jest.fn(),
  deleteFile: jest.fn()
};

// Mock notification service
const mockNotificationService = {
  sendNotification: jest.fn(),
  sendBulkNotification: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({
  default: mockKindergarten
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  default: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/class.model', () => ({
  default: mockClass
}));

jest.unstable_mockModule('../../../../../src/models/student.model', () => ({
  default: mockStudent
}));

jest.unstable_mockModule('../../../../../src/models/teacher.model', () => ({
  default: mockTeacher
}));

jest.unstable_mockModule('../../../../../src/config/database', () => ({
  default: mockSequelize
}));

jest.unstable_mockModule('../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('../../../../../src/utils/cache', () => ({
  default: mockCache
}));

jest.unstable_mockModule('../../../../../src/services/file/file.service', () => ({
  default: mockFileService
}));

jest.unstable_mockModule('../../../../../src/services/notification/notification.service', () => ({
  default: mockNotificationService
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

describe('Kindergarten Service', () => {
  let kindergartenService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/business/kindergarten.service');
    kindergartenService = imported.default || imported.KindergartenService || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('创建幼儿园', () => {
    it('应该成功创建幼儿园', async () => {
      const kindergartenData = {
        name: '阳光幼儿园',
        address: '北京市朝阳区xxx街道',
        phone: '010-12345678',
        email: 'sunshine@kindergarten.com',
        capacity: 300,
        principalId: 1
      };

      const createdKindergarten = {
        id: 1,
        ...kindergartenData,
        status: 'active',
        createdAt: new Date()
      };

      mockKindergarten.create.mockResolvedValue(createdKindergarten);
      mockUser.findByPk.mockResolvedValue({
        id: 1,
        name: '张校长',
        role: 'principal'
      });

      const result = await kindergartenService.createKindergarten(kindergartenData);

      expect(mockKindergarten.create).toHaveBeenCalledWith(kindergartenData);
      expect(result).toEqual(createdKindergarten);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Kindergarten created'),
        expect.objectContaining({
          kindergartenId: 1,
          name: '阳光幼儿园'
        })
      );
    });

    it('应该验证必填字段', async () => {
      const invalidData = {
        name: '',
        address: '北京市朝阳区xxx街道'
      };

      await expect(kindergartenService.createKindergarten(invalidData))
        .rejects.toThrow('Name is required');
    });

    it('应该检查重复的幼儿园名称', async () => {
      const kindergartenData = {
        name: '阳光幼儿园',
        address: '北京市朝阳区xxx街道'
      };

      mockKindergarten.findOne.mockResolvedValue({
        id: 1,
        name: '阳光幼儿园'
      });

      await expect(kindergartenService.createKindergarten(kindergartenData))
        .rejects.toThrow('Kindergarten with this name already exists');
    });

    it('应该处理校长分配', async () => {
      const kindergartenData = {
        name: '阳光幼儿园',
        address: '北京市朝阳区xxx街道',
        principalId: 1
      };

      mockUser.findByPk.mockResolvedValue({
        id: 1,
        name: '张校长',
        role: 'teacher' // 不是校长角色
      });

      await expect(kindergartenService.createKindergarten(kindergartenData))
        .rejects.toThrow('User is not eligible to be a principal');
    });
  });

  describe('获取幼儿园信息', () => {
    it('应该获取幼儿园详细信息', async () => {
      const kindergartenId = 1;
      const kindergartenData = {
        id: 1,
        name: '阳光幼儿园',
        address: '北京市朝阳区xxx街道',
        phone: '010-12345678',
        capacity: 300,
        principal: {
          id: 1,
          name: '张校长'
        },
        classes: [
          { id: 1, name: '小班A', studentCount: 25 },
          { id: 2, name: '中班B', studentCount: 30 }
        ],
        statistics: {
          totalStudents: 55,
          totalTeachers: 8,
          totalClasses: 2
        }
      };

      mockKindergarten.findByPk.mockResolvedValue(kindergartenData);

      const result = await kindergartenService.getKindergartenById(kindergartenId);

      expect(mockKindergarten.findByPk).toHaveBeenCalledWith(kindergartenId, {
        include: expect.any(Array)
      });
      expect(result).toEqual(kindergartenData);
    });

    it('应该处理不存在的幼儿园', async () => {
      const kindergartenId = 999;

      mockKindergarten.findByPk.mockResolvedValue(null);

      await expect(kindergartenService.getKindergartenById(kindergartenId))
        .rejects.toThrow('Kindergarten not found');
    });

    it('应该获取幼儿园列表', async () => {
      const filters = {
        status: 'active',
        city: '北京',
        page: 1,
        pageSize: 10
      };

      const kindergartens = [
        { id: 1, name: '阳光幼儿园', city: '北京' },
        { id: 2, name: '星星幼儿园', city: '北京' }
      ];

      mockKindergarten.findAndCountAll.mockResolvedValue({
        rows: kindergartens,
        count: 2
      });

      const result = await kindergartenService.getKindergartens(filters);

      expect(result).toEqual({
        data: kindergartens,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1
        }
      });
    });

    it('应该使用缓存获取幼儿园信息', async () => {
      const kindergartenId = 1;
      const cachedData = {
        id: 1,
        name: '阳光幼儿园'
      };

      mockCache.get.mockResolvedValue(cachedData);

      const result = await kindergartenService.getKindergartenById(kindergartenId);

      expect(mockCache.get).toHaveBeenCalledWith(`kindergarten:${kindergartenId}`);
      expect(result).toEqual(cachedData);
      expect(mockKindergarten.findByPk).not.toHaveBeenCalled();
    });
  });

  describe('更新幼儿园信息', () => {
    it('应该成功更新幼儿园信息', async () => {
      const kindergartenId = 1;
      const updateData = {
        name: '阳光幼儿园（更新）',
        phone: '010-87654321',
        capacity: 350
      };

      const existingKindergarten = {
        id: 1,
        name: '阳光幼儿园',
        phone: '010-12345678',
        capacity: 300,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockKindergarten.findByPk.mockResolvedValue(existingKindergarten);

      const result = await kindergartenService.updateKindergarten(kindergartenId, updateData);

      expect(existingKindergarten.update).toHaveBeenCalledWith(updateData);
      expect(mockCache.del).toHaveBeenCalledWith(`kindergarten:${kindergartenId}`);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Kindergarten updated'),
        expect.objectContaining({
          kindergartenId: 1
        })
      );
    });

    it('应该处理校长变更', async () => {
      const kindergartenId = 1;
      const updateData = {
        principalId: 2
      };

      const existingKindergarten = {
        id: 1,
        principalId: 1,
        update: jest.fn().mockResolvedValue(undefined)
      };

      const newPrincipal = {
        id: 2,
        name: '李校长',
        role: 'principal'
      };

      mockKindergarten.findByPk.mockResolvedValue(existingKindergarten);
      mockUser.findByPk.mockResolvedValue(newPrincipal);

      await kindergartenService.updateKindergarten(kindergartenId, updateData);

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        2,
        expect.objectContaining({
          type: 'principal_assignment',
          kindergartenId: 1
        })
      );
    });

    it('应该验证容量不能小于当前学生数', async () => {
      const kindergartenId = 1;
      const updateData = {
        capacity: 50
      };

      const existingKindergarten = {
        id: 1,
        capacity: 300
      };

      mockKindergarten.findByPk.mockResolvedValue(existingKindergarten);
      mockStudent.count.mockResolvedValue(80); // 当前有80个学生

      await expect(kindergartenService.updateKindergarten(kindergartenId, updateData))
        .rejects.toThrow('Capacity cannot be less than current student count');
    });
  });

  describe('删除幼儿园', () => {
    it('应该软删除幼儿园', async () => {
      const kindergartenId = 1;

      const existingKindergarten = {
        id: 1,
        name: '阳光幼儿园',
        status: 'active',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockKindergarten.findByPk.mockResolvedValue(existingKindergarten);
      mockStudent.count.mockResolvedValue(0); // 没有学生
      mockTeacher.count.mockResolvedValue(0); // 没有教师

      await kindergartenService.deleteKindergarten(kindergartenId);

      expect(existingKindergarten.update).toHaveBeenCalledWith({
        status: 'deleted',
        deletedAt: expect.any(Date)
      });
      expect(mockCache.del).toHaveBeenCalledWith(`kindergarten:${kindergartenId}`);
    });

    it('应该拒绝删除有学生的幼儿园', async () => {
      const kindergartenId = 1;

      const existingKindergarten = {
        id: 1,
        name: '阳光幼儿园'
      };

      mockKindergarten.findByPk.mockResolvedValue(existingKindergarten);
      mockStudent.count.mockResolvedValue(50); // 有学生

      await expect(kindergartenService.deleteKindergarten(kindergartenId))
        .rejects.toThrow('Cannot delete kindergarten with enrolled students');
    });

    it('应该处理级联删除相关数据', async () => {
      const kindergartenId = 1;
      const forceDelete = true;

      const existingKindergarten = {
        id: 1,
        name: '阳光幼儿园',
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockKindergarten.findByPk.mockResolvedValue(existingKindergarten);

      await kindergartenService.deleteKindergarten(kindergartenId, forceDelete);

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(existingKindergarten.destroy).toHaveBeenCalledWith({
        transaction: mockTransaction
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('班级管理', () => {
    it('应该为幼儿园创建班级', async () => {
      const kindergartenId = 1;
      const classData = {
        name: '小班A',
        ageGroup: '3-4',
        capacity: 25,
        teacherId: 1
      };

      const kindergarten = {
        id: 1,
        name: '阳光幼儿园',
        capacity: 300
      };

      const createdClass = {
        id: 1,
        ...classData,
        kindergartenId: 1
      };

      mockKindergarten.findByPk.mockResolvedValue(kindergarten);
      mockClass.count.mockResolvedValue(5); // 当前有5个班级
      mockClass.create.mockResolvedValue(createdClass);

      const result = await kindergartenService.createClass(kindergartenId, classData);

      expect(mockClass.create).toHaveBeenCalledWith({
        ...classData,
        kindergartenId: 1
      });
      expect(result).toEqual(createdClass);
    });

    it('应该获取幼儿园的所有班级', async () => {
      const kindergartenId = 1;

      const classes = [
        { id: 1, name: '小班A', studentCount: 20 },
        { id: 2, name: '中班B', studentCount: 25 }
      ];

      mockClass.findAll.mockResolvedValue(classes);

      const result = await kindergartenService.getKindergartenClasses(kindergartenId);

      expect(mockClass.findAll).toHaveBeenCalledWith({
        where: { kindergartenId: 1 },
        include: expect.any(Array)
      });
      expect(result).toEqual(classes);
    });

    it('应该检查班级容量限制', async () => {
      const kindergartenId = 1;
      const classData = {
        name: '大班C',
        capacity: 100 // 超大容量
      };

      const kindergarten = {
        id: 1,
        maxClassCapacity: 30
      };

      mockKindergarten.findByPk.mockResolvedValue(kindergarten);

      await expect(kindergartenService.createClass(kindergartenId, classData))
        .rejects.toThrow('Class capacity exceeds kindergarten limit');
    });
  });

  describe('统计信息', () => {
    it('应该获取幼儿园统计信息', async () => {
      const kindergartenId = 1;

      mockStudent.count.mockResolvedValue(120);
      mockTeacher.count.mockResolvedValue(15);
      mockClass.count.mockResolvedValue(6);

      const stats = await kindergartenService.getKindergartenStatistics(kindergartenId);

      expect(stats).toEqual({
        totalStudents: 120,
        totalTeachers: 15,
        totalClasses: 6,
        averageStudentsPerClass: 20,
        teacherStudentRatio: '1:8',
        occupancyRate: expect.any(Number)
      });
    });

    it('应该获取年龄分布统计', async () => {
      const kindergartenId = 1;

      mockStudent.findAll.mockResolvedValue([
        { age: 3, count: 30 },
        { age: 4, count: 45 },
        { age: 5, count: 35 },
        { age: 6, count: 10 }
      ]);

      const ageDistribution = await kindergartenService.getAgeDistribution(kindergartenId);

      expect(ageDistribution).toEqual([
        { age: 3, count: 30, percentage: 25 },
        { age: 4, count: 45, percentage: 37.5 },
        { age: 5, count: 35, percentage: 29.2 },
        { age: 6, count: 10, percentage: 8.3 }
      ]);
    });

    it('应该获取入学趋势分析', async () => {
      const kindergartenId = 1;
      const months = 12;

      const enrollmentData = [
        { month: '2024-01', enrollments: 15 },
        { month: '2024-02', enrollments: 20 },
        { month: '2024-03', enrollments: 25 }
      ];

      mockStudent.findAll.mockResolvedValue(enrollmentData);

      const trend = await kindergartenService.getEnrollmentTrend(kindergartenId, months);

      expect(trend).toEqual({
        data: enrollmentData,
        totalEnrollments: 60,
        averagePerMonth: 20,
        trend: 'increasing'
      });
    });
  });

  describe('文件管理', () => {
    it('应该上传幼儿园图片', async () => {
      const kindergartenId = 1;
      const file = {
        originalname: 'kindergarten.jpg',
        buffer: Buffer.from('image data'),
        mimetype: 'image/jpeg'
      };

      const uploadedFile = {
        id: 1,
        filename: 'kindergarten_123.jpg',
        url: 'https://cdn.example.com/kindergarten_123.jpg'
      };

      mockFileService.uploadImage.mockResolvedValue(uploadedFile);
      mockKindergarten.findByPk.mockResolvedValue({
        id: 1,
        update: jest.fn().mockResolvedValue(undefined)
      });

      const result = await kindergartenService.uploadKindergartenImage(kindergartenId, file);

      expect(mockFileService.uploadImage).toHaveBeenCalledWith(file, {
        folder: 'kindergartens',
        maxSize: 5 * 1024 * 1024 // 5MB
      });
      expect(result).toEqual(uploadedFile);
    });

    it('应该删除旧图片', async () => {
      const kindergartenId = 1;
      const file = {
        originalname: 'new-image.jpg',
        buffer: Buffer.from('image data'),
        mimetype: 'image/jpeg'
      };

      const existingKindergarten = {
        id: 1,
        imageUrl: 'https://cdn.example.com/old_image.jpg',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockKindergarten.findByPk.mockResolvedValue(existingKindergarten);
      mockFileService.uploadImage.mockResolvedValue({
        url: 'https://cdn.example.com/new_image.jpg'
      });

      await kindergartenService.uploadKindergartenImage(kindergartenId, file);

      expect(mockFileService.deleteFile).toHaveBeenCalledWith('old_image.jpg');
    });
  });

  describe('搜索和筛选', () => {
    it('应该按名称搜索幼儿园', async () => {
      const searchTerm = '阳光';

      const searchResults = [
        { id: 1, name: '阳光幼儿园', score: 0.9 },
        { id: 2, name: '阳光宝贝幼儿园', score: 0.8 }
      ];

      mockKindergarten.findAll.mockResolvedValue(searchResults);

      const result = await kindergartenService.searchKindergartens(searchTerm);

      expect(mockKindergarten.findAll).toHaveBeenCalledWith({
        where: {
          name: {
            [Symbol.for('iLike')]: `%${searchTerm}%`
          }
        },
        order: expect.any(Array)
      });
      expect(result).toEqual(searchResults);
    });

    it('应该按地理位置筛选幼儿园', async () => {
      const location = {
        latitude: 39.9042,
        longitude: 116.4074,
        radius: 5000 // 5km
      };

      const nearbyKindergartens = [
        { id: 1, name: '附近幼儿园1', distance: 1200 },
        { id: 2, name: '附近幼儿园2', distance: 3500 }
      ];

      mockKindergarten.findAll.mockResolvedValue(nearbyKindergartens);

      const result = await kindergartenService.findNearbyKindergartens(location);

      expect(result).toEqual(nearbyKindergartens);
    });

    it('应该按多个条件筛选幼儿园', async () => {
      const filters = {
        city: '北京',
        district: '朝阳区',
        ageGroup: '3-6',
        hasVacancy: true,
        rating: { min: 4.0 }
      };

      const filteredResults = [
        { id: 1, name: '符合条件的幼儿园1' },
        { id: 2, name: '符合条件的幼儿园2' }
      ];

      mockKindergarten.findAll.mockResolvedValue(filteredResults);

      const result = await kindergartenService.filterKindergartens(filters);

      expect(result).toEqual(filteredResults);
    });
  });

  describe('错误处理', () => {
    it('应该处理数据库连接错误', async () => {
      const dbError = new Error('Database connection failed');
      mockKindergarten.findAll.mockRejectedValue(dbError);

      await expect(kindergartenService.getKindergartens({}))
        .rejects.toThrow('Failed to retrieve kindergartens');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Database error in kindergarten service'),
        expect.objectContaining({
          error: dbError.message
        })
      );
    });

    it('应该处理事务回滚', async () => {
      const kindergartenId = 1;
      const error = new Error('Transaction failed');

      mockSequelize.transaction.mockResolvedValue(mockTransaction);
      mockKindergarten.findByPk.mockRejectedValue(error);

      await expect(kindergartenService.deleteKindergarten(kindergartenId, true))
        .rejects.toThrow('Failed to delete kindergarten');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理缓存服务错误', async () => {
      const kindergartenId = 1;
      const cacheError = new Error('Cache service unavailable');

      mockCache.get.mockRejectedValue(cacheError);
      mockKindergarten.findByPk.mockResolvedValue({
        id: 1,
        name: '阳光幼儿园'
      });

      const result = await kindergartenService.getKindergartenById(kindergartenId);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Cache error'),
        expect.objectContaining({
          error: cacheError.message
        })
      );
      expect(result.id).toBe(1);
    });
  });

  describe('批量操作', () => {
    it('应该批量创建幼儿园', async () => {
      const kindergartensData = [
        { name: '幼儿园1', address: '地址1' },
        { name: '幼儿园2', address: '地址2' }
      ];

      const createdKindergartens = kindergartensData.map((data, index) => ({
        id: index + 1,
        ...data
      }));

      mockKindergarten.create.mockImplementation((data) => 
        Promise.resolve({ id: Math.random(), ...data })
      );

      const result = await kindergartenService.bulkCreateKindergartens(kindergartensData);

      expect(mockKindergarten.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('应该批量更新幼儿园状态', async () => {
      const kindergartenIds = [1, 2, 3];
      const updateData = { status: 'inactive' };

      mockKindergarten.update.mockResolvedValue([3]); // 3 rows affected

      const result = await kindergartenService.bulkUpdateStatus(kindergartenIds, updateData);

      expect(mockKindergarten.update).toHaveBeenCalledWith(updateData, {
        where: {
          id: {
            [Symbol.for('in')]: kindergartenIds
          }
        }
      });
      expect(result.affectedRows).toBe(3);
    });
  });
});
