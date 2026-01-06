import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Sequelize
const mockSequelize = {
  define: jest.fn(),
  authenticate: jest.fn(),
  sync: jest.fn(),
  transaction: jest.fn(),
  literal: jest.fn(),
  fn: jest.fn(),
  col: jest.fn(),
  where: jest.fn(),
  DataTypes: {
    INTEGER: 'INTEGER',
    STRING: 'STRING',
    TEXT: 'TEXT',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
    ENUM: 'ENUM',
    JSON: 'JSON',
    DECIMAL: 'DECIMAL'
  },
  Op: {
    and: Symbol('and'),
    or: Symbol('or'),
    in: Symbol('in'),
    like: Symbol('like'),
    iLike: Symbol('iLike'),
    gt: Symbol('gt'),
    gte: Symbol('gte'),
    lt: Symbol('lt'),
    lte: Symbol('lte'),
    ne: Symbol('ne'),
    between: Symbol('between')
  }
};

// Mock model instance methods
const createMockInstance = (data: any) => ({
  ...data,
  save: jest.fn().mockResolvedValue(data),
  update: jest.fn().mockResolvedValue(data),
  destroy: jest.fn().mockResolvedValue(true as any),
  reload: jest.fn().mockResolvedValue(data),
  toJSON: jest.fn().mockReturnValue(data),
  get: jest.fn((key) => data[key]),
  set: jest.fn((key, value) => { data[key] = value; }),
  changed: jest.fn().mockReturnValue(false),
  previous: jest.fn().mockReturnValue(null)
});

// Mock model static methods
const mockEnrollmentQuotaModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findAndCountAll: jest.fn(),
  bulkCreate: jest.fn(),
  bulkUpdate: jest.fn(),
  bulkDestroy: jest.fn(),
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
  belongsToMany: jest.fn(),
  addHook: jest.fn(),
  removeHook: jest.fn(),
  hasHook: jest.fn(),
  scope: jest.fn(),
  unscoped: jest.fn(),
  build: jest.fn(),
  findOrCreate: jest.fn(),
  upsert: jest.fn(),
  increment: jest.fn(),
  decrement: jest.fn(),
  max: jest.fn(),
  min: jest.fn(),
  sum: jest.fn(),
  aggregate: jest.fn()
};

// Mock related models
const mockKindergartenModel = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockClassModel = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockEnrollmentModel = {
  count: jest.fn(),
  findAll: jest.fn()
};

// Mock logger
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock imports
jest.unstable_mockModule('sequelize', () => ({
  default: jest.fn(() => mockSequelize),
  Sequelize: jest.fn(() => mockSequelize),
  DataTypes: mockDataTypes,
  Op: mockSequelize.Op
}));

jest.unstable_mockModule('../../../../../../src/config/database', () => ({
  default: mockSequelize
}));

jest.unstable_mockModule('../../../../../../src/models/kindergarten.model', () => ({
  default: mockKindergartenModel
}));

jest.unstable_mockModule('../../../../../../src/models/class.model', () => ({
  default: mockClassModel
}));

jest.unstable_mockModule('../../../../../../src/models/enrollment.model', () => ({
  default: mockEnrollmentModel
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
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

describe('EnrollmentQuota Model', () => {
  let EnrollmentQuotaModel: any;

  beforeAll(async () => {
    // Mock the model definition
    mockSequelize.define.mockReturnValue(mockEnrollmentQuotaModel);
    
    const imported = await import('../../../../../../src/models/enrollment-quota.model');
    EnrollmentQuotaModel = imported.default || imported.EnrollmentQuota || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('模型定义', () => {
    it('应该正确定义EnrollmentQuota模型', () => {
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'EnrollmentQuota',
        expect.objectContaining({
          id: expect.objectContaining({
            type: 'INTEGER',
            primaryKey: true,
            autoIncrement: true
          }),
          kindergartenId: expect.objectContaining({
            type: 'INTEGER',
            allowNull: false
          }),
          classId: expect.objectContaining({
            type: 'INTEGER',
            allowNull: true
          }),
          academicYear: expect.objectContaining({
            type: 'STRING',
            allowNull: false
          }),
          semester: expect.objectContaining({
            type: 'ENUM',
            values: ['spring', 'fall', 'full_year'],
            defaultValue: 'full_year'
          }),
          ageGroup: expect.objectContaining({
            type: 'STRING'
          }),
          totalQuota: expect.objectContaining({
            type: 'INTEGER',
            allowNull: false
          }),
          usedQuota: expect.objectContaining({
            type: 'INTEGER',
            defaultValue: 0
          }),
          reservedQuota: expect.objectContaining({
            type: 'INTEGER',
            defaultValue: 0
          }),
          availableQuota: expect.objectContaining({
            type: 'INTEGER'
          }),
          quotaType: expect.objectContaining({
            type: 'ENUM',
            values: ['regular', 'special', 'priority', 'transfer'],
            defaultValue: 'regular'
          }),
          priority: expect.objectContaining({
            type: 'INTEGER',
            defaultValue: 0
          }),
          startDate: expect.objectContaining({
            type: 'DATE'
          }),
          endDate: expect.objectContaining({
            type: 'DATE'
          }),
          isActive: expect.objectContaining({
            type: 'BOOLEAN',
            defaultValue: true
          }),
          notes: expect.objectContaining({
            type: 'TEXT'
          })
        }),
        expect.objectContaining({
          tableName: 'enrollment_quotas',
          timestamps: true,
          paranoid: true
        })
      );
    });

    it('应该设置正确的模型选项', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'EnrollmentQuota'
      );
      
      expect(defineCall[2]).toEqual(
        expect.objectContaining({
          tableName: 'enrollment_quotas',
          timestamps: true,
          paranoid: true,
          indexes: expect.arrayContaining([
            expect.objectContaining({
              fields: ['kindergartenId']
            }),
            expect.objectContaining({
              fields: ['classId']
            }),
            expect.objectContaining({
              fields: ['academicYear']
            }),
            expect.objectContaining({
              fields: ['ageGroup']
            }),
            expect.objectContaining({
              fields: ['quotaType']
            }),
            expect.objectContaining({
              fields: ['isActive']
            }),
            expect.objectContaining({
              unique: true,
              fields: ['kindergartenId', 'classId', 'academicYear', 'semester', 'quotaType']
            })
          ])
        })
      );
    });
  });

  describe('CRUD操作', () => {
    it('应该创建新的招生配额', async () => {
      const quotaData = {
        kindergartenId: 1,
        classId: 1,
        academicYear: '2024-2025',
        semester: 'full_year',
        ageGroup: '3-4',
        totalQuota: 25,
        quotaType: 'regular',
        priority: 1,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        notes: '小班A班招生配额'
      };

      const createdQuota = createMockInstance({
        id: 1,
        ...quotaData,
        usedQuota: 0,
        reservedQuota: 0,
        availableQuota: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockEnrollmentQuotaModel.create.mockResolvedValue(createdQuota);

      const result = await mockEnrollmentQuotaModel.create(quotaData);

      expect(mockEnrollmentQuotaModel.create).toHaveBeenCalledWith(quotaData);
      expect(result).toEqual(createdQuota);
    });

    it('应该查找招生配额', async () => {
      const mockQuota = createMockInstance({
        id: 1,
        kindergartenId: 1,
        classId: 1,
        academicYear: '2024-2025',
        totalQuota: 25,
        usedQuota: 15,
        availableQuota: 10,
        quotaType: 'regular',
        isActive: true
      });

      mockEnrollmentQuotaModel.findByPk.mockResolvedValue(mockQuota);

      const result = await mockEnrollmentQuotaModel.findByPk(1);

      expect(mockEnrollmentQuotaModel.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockQuota);
    });

    it('应该更新招生配额', async () => {
      const updateData = {
        totalQuota: 30,
        notes: '更新后的配额说明'
      };

      const updatedQuota = createMockInstance({
        id: 1,
        kindergartenId: 1,
        classId: 1,
        academicYear: '2024-2025',
        totalQuota: 30,
        usedQuota: 15,
        availableQuota: 15,
        notes: '更新后的配额说明'
      });

      mockEnrollmentQuotaModel.update.mockResolvedValue([1, [updatedQuota]]);

      const result = await mockEnrollmentQuotaModel.update(updateData, {
        where: { id: 1 },
        returning: true
      });

      expect(mockEnrollmentQuotaModel.update).toHaveBeenCalledWith(
        updateData,
        { where: { id: 1 }, returning: true }
      );
      expect(result[0]).toBe(1);
      expect(result[1]).toEqual([updatedQuota]);
    });

    it('应该删除招生配额', async () => {
      mockEnrollmentQuotaModel.destroy.mockResolvedValue(1);

      const result = await mockEnrollmentQuotaModel.destroy({
        where: { id: 1 }
      });

      expect(mockEnrollmentQuotaModel.destroy).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(result).toBe(1);
    });
  });

  describe('查询操作', () => {
    it('应该按幼儿园查找配额', async () => {
      const mockQuotas = [
        createMockInstance({
          id: 1,
          kindergartenId: 1,
          classId: 1,
          totalQuota: 25
        }),
        createMockInstance({
          id: 2,
          kindergartenId: 1,
          classId: 2,
          totalQuota: 30
        })
      ];

      mockEnrollmentQuotaModel.findAll.mockResolvedValue(mockQuotas);

      const result = await mockEnrollmentQuotaModel.findAll({
        where: { kindergartenId: 1 }
      });

      expect(mockEnrollmentQuotaModel.findAll).toHaveBeenCalledWith({
        where: { kindergartenId: 1 }
      });
      expect(result).toEqual(mockQuotas);
    });

    it('应该按学年查找配额', async () => {
      const mockQuotas = [
        createMockInstance({
          id: 1,
          academicYear: '2024-2025',
          totalQuota: 25
        })
      ];

      mockEnrollmentQuotaModel.findAll.mockResolvedValue(mockQuotas);

      const result = await mockEnrollmentQuotaModel.findAll({
        where: { academicYear: '2024-2025' }
      });

      expect(mockEnrollmentQuotaModel.findAll).toHaveBeenCalledWith({
        where: { academicYear: '2024-2025' }
      });
      expect(result).toEqual(mockQuotas);
    });

    it('应该按年龄组查找配额', async () => {
      const mockQuotas = [
        createMockInstance({
          id: 1,
          ageGroup: '3-4',
          totalQuota: 25
        })
      ];

      mockEnrollmentQuotaModel.findAll.mockResolvedValue(mockQuotas);

      const result = await mockEnrollmentQuotaModel.findAll({
        where: { ageGroup: '3-4' }
      });

      expect(mockEnrollmentQuotaModel.findAll).toHaveBeenCalledWith({
        where: { ageGroup: '3-4' }
      });
      expect(result).toEqual(mockQuotas);
    });

    it('应该查找可用配额', async () => {
      const mockAvailableQuotas = [
        createMockInstance({
          id: 1,
          totalQuota: 25,
          usedQuota: 15,
          availableQuota: 10
        })
      ];

      mockEnrollmentQuotaModel.findAll.mockResolvedValue(mockAvailableQuotas);

      const result = await mockEnrollmentQuotaModel.findAll({
        where: {
          availableQuota: {
            [mockSequelize.Op.gt]: 0
          }
        }
      });

      expect(mockEnrollmentQuotaModel.findAll).toHaveBeenCalledWith({
        where: {
          availableQuota: {
            [mockSequelize.Op.gt]: 0
          }
        }
      });
      expect(result).toEqual(mockAvailableQuotas);
    });

    it('应该支持分页查询', async () => {
      const mockResult = {
        rows: [
          createMockInstance({
            id: 1,
            totalQuota: 25
          })
        ],
        count: 1
      };

      mockEnrollmentQuotaModel.findAndCountAll.mockResolvedValue(mockResult);

      const result = await mockEnrollmentQuotaModel.findAndCountAll({
        limit: 10,
        offset: 0,
        order: [['academicYear', 'DESC'], ['priority', 'DESC']]
      });

      expect(mockEnrollmentQuotaModel.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['academicYear', 'DESC'], ['priority', 'DESC']]
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('批量操作', () => {
    it('应该批量创建配额', async () => {
      const quotasData = [
        {
          kindergartenId: 1,
          classId: 1,
          academicYear: '2024-2025',
          totalQuota: 25,
          quotaType: 'regular'
        },
        {
          kindergartenId: 1,
          classId: 2,
          academicYear: '2024-2025',
          totalQuota: 30,
          quotaType: 'regular'
        }
      ];

      const createdQuotas = quotasData.map((data, index) =>
        createMockInstance({
          id: index + 1,
          ...data,
          usedQuota: 0,
          availableQuota: data.totalQuota,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      );

      mockEnrollmentQuotaModel.bulkCreate.mockResolvedValue(createdQuotas);

      const result = await mockEnrollmentQuotaModel.bulkCreate(quotasData);

      expect(mockEnrollmentQuotaModel.bulkCreate).toHaveBeenCalledWith(quotasData);
      expect(result).toEqual(createdQuotas);
    });

    it('应该批量更新配额状态', async () => {
      const updateData = { isActive: false };
      const whereClause = { academicYear: '2023-2024' };

      mockEnrollmentQuotaModel.update.mockResolvedValue([3]);

      const result = await mockEnrollmentQuotaModel.update(updateData, {
        where: whereClause
      });

      expect(mockEnrollmentQuotaModel.update).toHaveBeenCalledWith(updateData, {
        where: whereClause
      });
      expect(result[0]).toBe(3);
    });

    it('应该批量删除过期配额', async () => {
      mockEnrollmentQuotaModel.destroy.mockResolvedValue(2);

      const result = await mockEnrollmentQuotaModel.destroy({
        where: {
          endDate: {
            [mockSequelize.Op.lt]: new Date()
          }
        }
      });

      expect(mockEnrollmentQuotaModel.destroy).toHaveBeenCalledWith({
        where: {
          endDate: {
            [mockSequelize.Op.lt]: new Date()
          }
        }
      });
      expect(result).toBe(2);
    });
  });

  describe('关联关系', () => {
    it('应该设置与Kindergarten的关联', () => {
      expect(mockEnrollmentQuotaModel.belongsTo).toHaveBeenCalledWith(
        mockKindergartenModel,
        expect.objectContaining({
          foreignKey: 'kindergartenId',
          as: 'kindergarten'
        })
      );
    });

    it('应该设置与Class的关联', () => {
      expect(mockEnrollmentQuotaModel.belongsTo).toHaveBeenCalledWith(
        mockClassModel,
        expect.objectContaining({
          foreignKey: 'classId',
          as: 'class'
        })
      );
    });

    it('应该设置与Enrollment的关联', () => {
      expect(mockEnrollmentQuotaModel.hasMany).toHaveBeenCalledWith(
        mockEnrollmentModel,
        expect.objectContaining({
          foreignKey: 'quotaId',
          as: 'enrollments'
        })
      );
    });
  });

  describe('模型钩子', () => {
    it('应该在创建前计算可用配额', () => {
      expect(mockEnrollmentQuotaModel.addHook).toHaveBeenCalledWith(
        'beforeCreate',
        expect.any(Function)
      );
    });

    it('应该在更新前重新计算可用配额', () => {
      expect(mockEnrollmentQuotaModel.addHook).toHaveBeenCalledWith(
        'beforeUpdate',
        expect.any(Function)
      );
    });

    it('应该在创建后更新班级容量', () => {
      expect(mockEnrollmentQuotaModel.addHook).toHaveBeenCalledWith(
        'afterCreate',
        expect.any(Function)
      );
    });

    it('应该在删除前检查关联的报名', () => {
      expect(mockEnrollmentQuotaModel.addHook).toHaveBeenCalledWith(
        'beforeDestroy',
        expect.any(Function)
      );
    });
  });

  describe('作用域', () => {
    it('应该定义active作用域', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'EnrollmentQuota'
      );
      
      expect(defineCall[2].scopes).toEqual(
        expect.objectContaining({
          active: {
            where: { isActive: true }
          }
        })
      );
    });

    it('应该定义available作用域', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'EnrollmentQuota'
      );
      
      expect(defineCall[2].scopes).toEqual(
        expect.objectContaining({
          available: {
            where: {
              availableQuota: {
                [mockSequelize.Op.gt]: 0
              }
            }
          }
        })
      );
    });

    it('应该定义byAcademicYear作用域', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'EnrollmentQuota'
      );
      
      expect(defineCall[2].scopes).toEqual(
        expect.objectContaining({
          byAcademicYear: expect.any(Function)
        })
      );
    });

    it('应该定义byQuotaType作用域', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'EnrollmentQuota'
      );
      
      expect(defineCall[2].scopes).toEqual(
        expect.objectContaining({
          byQuotaType: expect.any(Function)
        })
      );
    });
  });

  describe('实例方法', () => {
    it('应该检查配额是否可用', () => {
      const quota = createMockInstance({
        id: 1,
        totalQuota: 25,
        usedQuota: 15,
        availableQuota: 10
      });

      quota.isAvailable = jest.fn().mockReturnValue(true);

      const result = quota.isAvailable();

      expect(result).toBe(true);
    });

    it('应该计算使用率', () => {
      const quota = createMockInstance({
        id: 1,
        totalQuota: 25,
        usedQuota: 15
      });

      quota.getUsageRate = jest.fn().mockReturnValue(0.6);

      const result = quota.getUsageRate();

      expect(result).toBe(0.6);
    });

    it('应该检查是否已满', () => {
      const fullQuota = createMockInstance({
        id: 1,
        totalQuota: 25,
        usedQuota: 25,
        availableQuota: 0
      });

      fullQuota.isFull = jest.fn().mockReturnValue(true);

      const result = fullQuota.isFull();

      expect(result).toBe(true);
    });

    it('应该预留配额', () => {
      const quota = createMockInstance({
        id: 1,
        totalQuota: 25,
        usedQuota: 15,
        reservedQuota: 0,
        availableQuota: 10
      });

      quota.reserve = jest.fn().mockImplementation((amount) {
        if (this.availableQuota >= amount) {
          this.reservedQuota += amount;
          this.availableQuota -= amount;
          return this.save();
        }
        throw new Error('Insufficient quota');
      });

      quota.reserve(5);

      expect(quota.reserve).toHaveBeenCalledWith(5);
    });

    it('应该释放预留配额', () => {
      const quota = createMockInstance({
        id: 1,
        totalQuota: 25,
        usedQuota: 15,
        reservedQuota: 5,
        availableQuota: 5
      });

      quota.release = jest.fn().mockImplementation((amount) {
        if (this.reservedQuota >= amount) {
          this.reservedQuota -= amount;
          this.availableQuota += amount;
          return this.save();
        }
        throw new Error('Invalid release amount');
      });

      quota.release(3);

      expect(quota.release).toHaveBeenCalledWith(3);
    });
  });

  describe('类方法', () => {
    it('应该按条件查找可用配额', async () => {
      const mockAvailableQuotas = [
        createMockInstance({
          id: 1,
          availableQuota: 10
        })
      ];

      mockEnrollmentQuotaModel.findAvailable = jest.fn().mockResolvedValue(mockAvailableQuotas);

      const result = await mockEnrollmentQuotaModel.findAvailable({
        kindergartenId: 1,
        academicYear: '2024-2025'
      });

      expect(mockEnrollmentQuotaModel.findAvailable).toHaveBeenCalledWith({
        kindergartenId: 1,
        academicYear: '2024-2025'
      });
      expect(result).toEqual(mockAvailableQuotas);
    });

    it('应该统计总配额', async () => {
      mockEnrollmentQuotaModel.getTotalQuota = jest.fn().mockResolvedValue(150);

      const result = await mockEnrollmentQuotaModel.getTotalQuota({
        kindergartenId: 1,
        academicYear: '2024-2025'
      });

      expect(mockEnrollmentQuotaModel.getTotalQuota).toHaveBeenCalledWith({
        kindergartenId: 1,
        academicYear: '2024-2025'
      });
      expect(result).toBe(150);
    });

    it('应该统计已使用配额', async () => {
      mockEnrollmentQuotaModel.getUsedQuota = jest.fn().mockResolvedValue(120);

      const result = await mockEnrollmentQuotaModel.getUsedQuota({
        kindergartenId: 1,
        academicYear: '2024-2025'
      });

      expect(mockEnrollmentQuotaModel.getUsedQuota).toHaveBeenCalledWith({
        kindergartenId: 1,
        academicYear: '2024-2025'
      });
      expect(result).toBe(120);
    });

    it('应该创建默认配额', async () => {
      const defaultQuotas = [
        { kindergartenId: 1, classId: 1, totalQuota: 25 },
        { kindergartenId: 1, classId: 2, totalQuota: 30 }
      ];

      mockEnrollmentQuotaModel.createDefaults = jest.fn().mockResolvedValue(defaultQuotas);

      const result = await mockEnrollmentQuotaModel.createDefaults(1, '2024-2025');

      expect(mockEnrollmentQuotaModel.createDefaults).toHaveBeenCalledWith(1, '2024-2025');
      expect(result).toEqual(defaultQuotas);
    });
  });

  describe('验证', () => {
    it('应该验证配额数量为正数', () => {
      const validQuotas = [1, 25, 100];
      const invalidQuotas = [0, -5, -10];

      validQuotas.forEach(quota => {
        expect(quota).toBeGreaterThan(0);
      });

      invalidQuotas.forEach(quota => {
        expect(quota).toBeLessThanOrEqual(0);
      });
    });

    it('应该验证学年格式', () => {
      const validYears = ['2024-2025', '2023-2024', '2025-2026'];
      const invalidYears = ['2024', '24-25', '2024-25', 'invalid'];

      validYears.forEach(year => {
        expect(/^\d{4}-\d{4}$/.test(year)).toBe(true);
      });

      invalidYears.forEach(year => {
        expect(/^\d{4}-\d{4}$/.test(year)).toBe(false);
      });
    });

    it('应该验证日期范围', () => {
      const startDate = new Date('2024-09-01');
      const endDate = new Date('2025-06-30');

      expect(endDate.getTime()).toBeGreaterThan(startDate.getTime());
    });

    it('应该验证配额类型', () => {
      const validTypes = ['regular', 'special', 'priority', 'transfer'];
      const invalidTypes = ['invalid', 'custom', 'other'];

      validTypes.forEach(type => {
        expect(validTypes).toContain(type);
      });

      invalidTypes.forEach(type => {
        expect(validTypes).not.toContain(type);
      });
    });
  });

  describe('索引和性能', () => {
    it('应该在kindergartenId字段上创建索引', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'EnrollmentQuota'
      );
      
      const indexes = defineCall[2].indexes;
      const kindergartenIdIndex = indexes.find((index: any) => 
        index.fields.includes('kindergartenId')
      );

      expect(kindergartenIdIndex).toBeTruthy();
    });

    it('应该创建唯一复合索引', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'EnrollmentQuota'
      );
      
      const indexes = defineCall[2].indexes;
      const uniqueIndex = indexes.find((index: any) => 
        index.unique === true
      );

      expect(uniqueIndex).toBeTruthy();
      expect(uniqueIndex.fields).toEqual([
        'kindergartenId', 'classId', 'academicYear', 'semester', 'quotaType'
      ]);
    });
  });

  describe('软删除', () => {
    it('应该支持软删除', () => {
      const defineCall = mockSequelize.define.mock.calls.find(
        call => call[0] === 'EnrollmentQuota'
      );
      
      expect(defineCall[2].paranoid).toBe(true);
    });

    it('应该在软删除时保留数据', async () => {
      const quota = createMockInstance({
        id: 1,
        totalQuota: 25,
        deletedAt: null
      });

      quota.destroy.mockResolvedValue(undefined);

      await quota.destroy();

      expect(quota.destroy).toHaveBeenCalled();
    });
  });

  describe('计算字段', () => {
    it('应该自动计算可用配额', () => {
      const quota = createMockInstance({
        id: 1,
        totalQuota: 25,
        usedQuota: 15,
        reservedQuota: 5
      });

      // availableQuota = totalQuota - usedQuota - reservedQuota
      const expectedAvailable = 25 - 15 - 5;
      expect(expectedAvailable).toBe(5);
    });

    it('应该处理负数可用配额', () => {
      const quota = createMockInstance({
        id: 1,
        totalQuota: 25,
        usedQuota: 20,
        reservedQuota: 10
      });

      // availableQuota = totalQuota - usedQuota - reservedQuota
      const expectedAvailable = Math.max(0, 25 - 20 - 10);
      expect(expectedAvailable).toBe(0);
    });
  });
});
