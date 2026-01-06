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
const mockKindergarten = {
  create: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockUser = {
  findByPk: jest.fn()
};

const mockStudent = {
  findAll: jest.fn(),
  count: jest.fn()
};

const mockTeacher = {
  findAll: jest.fn(),
  count: jest.fn()
};

const mockClass = {
  findAll: jest.fn(),
  count: jest.fn()
};

const mockActivity = {
  findAll: jest.fn(),
  count: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/init', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../../src/services/kindergarten/kindergarten.service', () => ({
  KindergartenService: jest.fn().mockImplementation(() => ({
    createKindergarten: jest.fn(),
    getKindergartenById: jest.fn(),
    getKindergartens: jest.fn(),
    updateKindergarten: jest.fn(),
    deleteKindergarten: jest.fn(),
    getKindergartenStats: jest.fn(),
    getKindergartenStudents: jest.fn(),
    getKindergartenTeachers: jest.fn(),
    getKindergartenClasses: jest.fn(),
    getKindergartenActivities: jest.fn(),
    updateKindergartenStatus: jest.fn(),
    calculateEnrollmentRate: jest.fn(),
    checkCapacity: jest.fn()
  }))
}));

jest.unstable_mockModule('../../../../../../src/models/kindergarten.model', () => ({
  Kindergarten: mockKindergarten
}));

jest.unstable_mockModule('../../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../../src/models/student.model', () => ({
  Student: mockStudent
}));

jest.unstable_mockModule('../../../../../../src/models/teacher.model', () => ({
  Teacher: mockTeacher
}));

jest.unstable_mockModule('../../../../../../src/models/class.model', () => ({
  Class: mockClass
}));

jest.unstable_mockModule('../../../../../../src/models/activity.model', () => ({
  Activity: mockActivity
}));

jest.unstable_mockModule('../../../../../../src/utils/apiError', () => ({
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

describe('Kindergarten Service', () => {
  let kindergartenService: any;
  let KindergartenService: any;

  beforeAll(async () => {
    const { KindergartenService: ImportedKindergartenService } = await import('../../../../../../src/services/kindergarten/kindergarten.service');
    KindergartenService = ImportedKindergartenService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    kindergartenService = new KindergartenService();
  });

  describe('createKindergarten', () => {
    it('应该成功创建幼儿园', async () => {
      const kindergartenData = {
        name: '阳光幼儿园',
        address: '北京市朝阳区阳光街123号',
        phone: '010-12345678',
        email: 'sunshine@kindergarten.com',
        capacity: 300,
        establishedDate: '2020-01-15',
        description: '专业的幼儿教育机构',
        principalId: 1
      };

      const mockCreatedKindergarten = {
        id: 1,
        ...kindergartenData,
        status: 'active',
        currentEnrollment: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUser.findByPk.mockResolvedValue({ id: 1, realName: '张校长' });
      mockKindergarten.create.mockResolvedValue(mockCreatedKindergarten);

      const result = await kindergartenService.createKindergarten(kindergartenData);

      expect(result).toEqual(mockCreatedKindergarten);
      expect(mockUser.findByPk).toHaveBeenCalledWith(1, { transaction: mockTransaction });
      expect(mockKindergarten.create).toHaveBeenCalledWith(kindergartenData, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理校长不存在的情况', async () => {
      const kindergartenData = {
        name: '测试幼儿园',
        principalId: 999
      };

      mockUser.findByPk.mockResolvedValue(null);

      await expect(kindergartenService.createKindergarten(kindergartenData)).rejects.toThrow('校长不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理重复名称的情况', async () => {
      const kindergartenData = {
        name: '已存在的幼儿园',
        principalId: 1
      };

      mockUser.findByPk.mockResolvedValue({ id: 1 });
      mockKindergarten.findOne.mockResolvedValue({ id: 1, name: '已存在的幼儿园' });

      await expect(kindergartenService.createKindergarten(kindergartenData)).rejects.toThrow('幼儿园名称已存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getKindergartenById', () => {
    it('应该成功获取幼儿园信息', async () => {
      const kindergartenId = 1;
      const mockKindergartenData = {
        id: 1,
        name: '阳光幼儿园',
        address: '北京市朝阳区阳光街123号',
        phone: '010-12345678',
        email: 'sunshine@kindergarten.com',
        status: 'active',
        capacity: 300,
        currentEnrollment: 250,
        principal: {
          id: 1,
          realName: '张校长'
        }
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergartenData);

      const result = await kindergartenService.getKindergartenById(kindergartenId);

      expect(result).toEqual(mockKindergartenData);
      expect(mockKindergarten.findByPk).toHaveBeenCalledWith(kindergartenId, {
        include: expect.arrayContaining([
          expect.objectContaining({
            model: expect.anything(),
            as: 'principal'
          })
        ])
      });
    });

    it('应该处理幼儿园不存在的情况', async () => {
      const kindergartenId = 999;
      mockKindergarten.findByPk.mockResolvedValue(null);

      await expect(kindergartenService.getKindergartenById(kindergartenId)).rejects.toThrow('幼儿园不存在');
    });
  });

  describe('getKindergartens', () => {
    it('应该成功获取幼儿园列表', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10,
        status: 'active',
        search: '阳光'
      };

      const mockKindergartens = [
        {
          id: 1,
          name: '阳光幼儿园',
          address: '北京市朝阳区阳光街123号',
          status: 'active',
          capacity: 300,
          currentEnrollment: 250
        },
        {
          id: 2,
          name: '阳光分园',
          address: '北京市朝阳区阳光街456号',
          status: 'active',
          capacity: 200,
          currentEnrollment: 180
        }
      ];

      mockKindergarten.findAll.mockResolvedValue(mockKindergartens);
      mockKindergarten.count.mockResolvedValue(2);

      const result = await kindergartenService.getKindergartens(queryParams);

      expect(result).toEqual({
        kindergartens: mockKindergartens,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });

      expect(mockKindergarten.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'active',
          [expect.any(Symbol)]: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({
                [expect.any(Symbol)]: '%阳光%'
              })
            })
          ])
        }),
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        include: expect.any(Array)
      });
    });

    it('应该支持无搜索条件的查询', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10
      };

      mockKindergarten.findAll.mockResolvedValue([]);
      mockKindergarten.count.mockResolvedValue(0);

      await kindergartenService.getKindergartens(queryParams);

      expect(mockKindergarten.findAll).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        include: expect.any(Array)
      });
    });
  });

  describe('getKindergartenStats', () => {
    it('应该成功获取幼儿园统计信息', async () => {
      const kindergartenId = 1;

      mockStudent.count.mockResolvedValue(250);
      mockTeacher.count.mockResolvedValue(25);
      mockClass.count.mockResolvedValue(12);
      mockActivity.count.mockResolvedValue(5);

      const mockKindergarten = {
        id: 1,
        capacity: 300,
        currentEnrollment: 250
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);

      const result = await kindergartenService.getKindergartenStats(kindergartenId);

      expect(result).toEqual({
        totalStudents: 250,
        totalTeachers: 25,
        totalClasses: 12,
        totalActivities: 5,
        capacity: 300,
        currentEnrollment: 250,
        enrollmentRate: 83.33,
        availableSpots: 50
      });

      expect(mockStudent.count).toHaveBeenCalledWith({
        where: { kindergartenId, status: 'active' }
      });
      expect(mockTeacher.count).toHaveBeenCalledWith({
        where: { kindergartenId, status: 'active' }
      });
      expect(mockClass.count).toHaveBeenCalledWith({
        where: { kindergartenId, status: 'active' }
      });
      expect(mockActivity.count).toHaveBeenCalledWith({
        where: { kindergartenId, status: 'active' }
      });
    });

    it('应该处理幼儿园不存在的情况', async () => {
      const kindergartenId = 999;
      mockKindergarten.findByPk.mockResolvedValue(null);

      await expect(kindergartenService.getKindergartenStats(kindergartenId)).rejects.toThrow('幼儿园不存在');
    });
  });

  describe('updateKindergartenStatus', () => {
    it('应该成功更新幼儿园状态', async () => {
      const kindergartenId = 1;
      const newStatus = 'inactive';

      const mockKindergarten = {
        id: 1,
        name: '阳光幼儿园',
        status: 'active',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);

      const result = await kindergartenService.updateKindergartenStatus(kindergartenId, newStatus);

      expect(result).toBe(true);
      expect(mockKindergarten.findByPk).toHaveBeenCalledWith(kindergartenId, { transaction: mockTransaction });
      expect(mockKindergarten.update).toHaveBeenCalledWith({
        status: newStatus,
        updatedAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理无效状态的情况', async () => {
      const kindergartenId = 1;
      const invalidStatus = 'invalid_status';

      await expect(kindergartenService.updateKindergartenStatus(kindergartenId, invalidStatus))
        .rejects.toThrow('无效的状态值');
    });
  });

  describe('calculateEnrollmentRate', () => {
    it('应该正确计算入学率', async () => {
      const kindergartenId = 1;

      const mockKindergarten = {
        id: 1,
        capacity: 300,
        currentEnrollment: 250
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);

      const result = await kindergartenService.calculateEnrollmentRate(kindergartenId);

      expect(result).toBe(83.33);
    });

    it('应该处理容量为0的情况', async () => {
      const kindergartenId = 1;

      const mockKindergarten = {
        id: 1,
        capacity: 0,
        currentEnrollment: 0
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);

      const result = await kindergartenService.calculateEnrollmentRate(kindergartenId);

      expect(result).toBe(0);
    });
  });

  describe('checkCapacity', () => {
    it('应该检查容量是否充足', async () => {
      const kindergartenId = 1;
      const requestedSpots = 30;

      const mockKindergarten = {
        id: 1,
        capacity: 300,
        currentEnrollment: 250
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);

      const result = await kindergartenService.checkCapacity(kindergartenId, requestedSpots);

      expect(result).toEqual({
        hasCapacity: true,
        availableSpots: 50,
        requestedSpots: 30,
        remainingSpots: 20
      });
    });

    it('应该检查容量不足的情况', async () => {
      const kindergartenId = 1;
      const requestedSpots = 80;

      const mockKindergarten = {
        id: 1,
        capacity: 300,
        currentEnrollment: 250
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);

      const result = await kindergartenService.checkCapacity(kindergartenId, requestedSpots);

      expect(result).toEqual({
        hasCapacity: false,
        availableSpots: 50,
        requestedSpots: 80,
        shortage: 30
      });
    });
  });

  describe('deleteKindergarten', () => {
    it('应该成功删除幼儿园', async () => {
      const kindergartenId = 1;

      const mockKindergarten = {
        id: 1,
        name: '测试幼儿园',
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);
      mockStudent.count.mockResolvedValue(0);
      mockTeacher.count.mockResolvedValue(0);

      const result = await kindergartenService.deleteKindergarten(kindergartenId);

      expect(result).toBe(true);
      expect(mockKindergarten.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理有学生时不能删除的情况', async () => {
      const kindergartenId = 1;

      const mockKindergarten = {
        id: 1,
        name: '测试幼儿园'
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);
      mockStudent.count.mockResolvedValue(10);

      await expect(kindergartenService.deleteKindergarten(kindergartenId))
        .rejects.toThrow('幼儿园还有学生，无法删除');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理有教师时不能删除的情况', async () => {
      const kindergartenId = 1;

      const mockKindergarten = {
        id: 1,
        name: '测试幼儿园'
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);
      mockStudent.count.mockResolvedValue(0);
      mockTeacher.count.mockResolvedValue(5);

      await expect(kindergartenService.deleteKindergarten(kindergartenId))
        .rejects.toThrow('幼儿园还有教师，无法删除');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
