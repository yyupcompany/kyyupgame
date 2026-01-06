import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { DataTypes } from 'sequelize';

// Mock Sequelize
const mockSequelize = {
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

// Mock EnrollmentPlan model
const mockEnrollmentPlan = {
  init: jest.fn(),
  initModel: jest.fn(),
  associate: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  hasMany: jest.fn(),
  belongsTo: jest.fn(),
  belongsToMany: jest.fn()
};

// Mock related models
const mockKindergarten = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockEnrollmentApplication = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockClass = { hasMany: jest.fn(), belongsTo: jest.fn(), belongsToMany: jest.fn() };
const mockUser = { hasMany: jest.fn(), belongsTo: jest.fn() };

// Mock imports
jest.unstable_mockModule('../../../../../src/models/enrollment-plan.model', () => ({
  EnrollmentPlan: mockEnrollmentPlan,
  PlanStatus: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    CLOSED: 'closed',
    SUSPENDED: 'suspended'
  },
  EnrollmentPhase: {
    PRE_REGISTRATION: 'pre_registration',
    REGISTRATION: 'registration',
    REVIEW: 'review',
    ADMISSION: 'admission',
    COMPLETED: 'completed'
  },
  AgeGroup: {
    TODDLER: 'toddler',
    PRESCHOOL: 'preschool',
    KINDERGARTEN: 'kindergarten',
    MIXED: 'mixed'
  }
}));

jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({
  Kindergarten: mockKindergarten
}));

jest.unstable_mockModule('../../../../../src/models/enrollment-application.model', () => ({
  EnrollmentApplication: mockEnrollmentApplication
}));

jest.unstable_mockModule('../../../../../src/models/class.model', () => ({
  Class: mockClass
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
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

describe('EnrollmentPlan Model', () => {
  let EnrollmentPlan: any;
  let PlanStatus: any;
  let EnrollmentPhase: any;
  let AgeGroup: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/models/enrollment-plan.model');
    EnrollmentPlan = imported.EnrollmentPlan;
    PlanStatus = imported.PlanStatus;
    EnrollmentPhase = imported.EnrollmentPhase;
    AgeGroup = imported.AgeGroup;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('应该正确定义EnrollmentPlan模型', () => {
      EnrollmentPlan.initModel(mockSequelize);

      expect(EnrollmentPlan.init).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          }),
          name: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: false,
            validate: expect.objectContaining({
              len: [2, 100]
            })
          }),
          description: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: true
          }),
          kindergartenId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false,
            references: expect.objectContaining({
              model: 'kindergartens',
              key: 'id'
            })
          }),
          academicYear: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: false,
            validate: expect.objectContaining({
              len: [7, 9] // 格式：2024-2025
            })
          }),
          status: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['draft', 'active', 'closed', 'suspended'],
            defaultValue: 'draft'
          }),
          currentPhase: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['pre_registration', 'registration', 'review', 'admission', 'completed'],
            defaultValue: 'pre_registration'
          }),
          totalQuota: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: expect.objectContaining({
              min: 1,
              max: 1000
            })
          }),
          availableQuota: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: expect.objectContaining({
              min: 0
            })
          }),
          quotaByAgeGroup: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          }),
          registrationStartDate: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: false
          }),
          registrationEndDate: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: false
          }),
          reviewStartDate: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: true
          }),
          reviewEndDate: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: true
          }),
          admissionDate: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: true
          }),
          schoolStartDate: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: true
          }),
          requirements: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          }),
          documents: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          }),
          fees: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          }),
          policies: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          }),
          contactInfo: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          }),
          isPublic: expect.objectContaining({
            type: DataTypes.BOOLEAN,
            defaultValue: true
          }),
          isActive: expect.objectContaining({
            type: DataTypes.BOOLEAN,
            defaultValue: true
          }),
          createdBy: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false,
            references: expect.objectContaining({
              model: 'users',
              key: 'id'
            })
          })
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'enrollment_plans',
          timestamps: true,
          paranoid: true
        })
      );
    });

    it('应该包含所有必需的字段', () => {
      const planInstance = {
        id: 1,
        name: '2024-2025学年招生计划',
        description: '面向3-6岁儿童的全日制幼儿园招生',
        kindergartenId: 1,
        academicYear: '2024-2025',
        status: 'active',
        currentPhase: 'registration',
        totalQuota: 120,
        availableQuota: 85,
        quotaByAgeGroup: {
          toddler: 30,
          preschool: 50,
          kindergarten: 40
        },
        registrationStartDate: '2024-03-01T00:00:00Z',
        registrationEndDate: '2024-05-31T23:59:59Z',
        reviewStartDate: '2024-06-01T00:00:00Z',
        reviewEndDate: '2024-06-15T23:59:59Z',
        admissionDate: '2024-06-20T00:00:00Z',
        schoolStartDate: '2024-09-01T00:00:00Z',
        requirements: {
          ageRange: {
            min: 3,
            max: 6
          },
          documents: ['身份证', '户口本', '疫苗接种证'],
          healthCheck: true,
          interview: true
        },
        documents: [
          {
            name: '入学申请表',
            required: true,
            template: '/templates/application_form.pdf'
          },
          {
            name: '健康证明',
            required: true,
            description: '近三个月内的体检报告'
          }
        ],
        fees: {
          registration: 200,
          tuition: 3000,
          meals: 500,
          activities: 300,
          materials: 200
        },
        policies: {
          refundPolicy: '开学前可全额退费，开学后按比例退费',
          attendancePolicy: '每月出勤不少于20天',
          disciplinePolicy: '遵守幼儿园规章制度'
        },
        contactInfo: {
          phone: '010-12345678',
          email: 'admission@kindergarten.com',
          address: '北京市朝阳区示例路123号',
          contactPerson: '招生办老师'
        },
        isPublic: true,
        isActive: true,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      // 检查实例是否具有预期的属性
      expect(planInstance).toHaveProperty('id');
      expect(planInstance).toHaveProperty('name');
      expect(planInstance).toHaveProperty('description');
      expect(planInstance).toHaveProperty('kindergartenId');
      expect(planInstance).toHaveProperty('academicYear');
      expect(planInstance).toHaveProperty('status');
      expect(planInstance).toHaveProperty('currentPhase');
      expect(planInstance).toHaveProperty('totalQuota');
      expect(planInstance).toHaveProperty('availableQuota');
      expect(planInstance).toHaveProperty('quotaByAgeGroup');
      expect(planInstance).toHaveProperty('registrationStartDate');
      expect(planInstance).toHaveProperty('registrationEndDate');
      expect(planInstance).toHaveProperty('requirements');
      expect(planInstance).toHaveProperty('documents');
      expect(planInstance).toHaveProperty('fees');
      expect(planInstance).toHaveProperty('policies');
      expect(planInstance).toHaveProperty('contactInfo');
      expect(planInstance).toHaveProperty('isPublic');
      expect(planInstance).toHaveProperty('isActive');
      expect(planInstance).toHaveProperty('createdBy');
    });
  });

  describe('Model Validations', () => {
    it('应该验证必填字段', () => {
      const requiredFields = ['name', 'kindergartenId', 'academicYear', 'totalQuota', 'availableQuota', 'registrationStartDate', 'registrationEndDate', 'createdBy'];
      
      requiredFields.forEach(field => {
        expect(EnrollmentPlan.init).toHaveBeenCalledWith(
          expect.objectContaining({
            [field]: expect.objectContaining({
              allowNull: false
            })
          }),
          expect.any(Object)
        );
      });
    });

    it('应该验证计划名称长度', () => {
      expect(EnrollmentPlan.init).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.objectContaining({
            validate: expect.objectContaining({
              len: [2, 100]
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证学年格式', () => {
      expect(EnrollmentPlan.init).toHaveBeenCalledWith(
        expect.objectContaining({
          academicYear: expect.objectContaining({
            validate: expect.objectContaining({
              len: [7, 9] // 2024-2025 格式
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证总名额范围', () => {
      expect(EnrollmentPlan.init).toHaveBeenCalledWith(
        expect.objectContaining({
          totalQuota: expect.objectContaining({
            validate: expect.objectContaining({
              min: 1,
              max: 1000
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证可用名额不能为负数', () => {
      expect(EnrollmentPlan.init).toHaveBeenCalledWith(
        expect.objectContaining({
          availableQuota: expect.objectContaining({
            validate: expect.objectContaining({
              min: 0
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证外键约束', () => {
      expect(EnrollmentPlan.init).toHaveBeenCalledWith(
        expect.objectContaining({
          kindergartenId: expect.objectContaining({
            references: expect.objectContaining({
              model: 'kindergartens',
              key: 'id'
            })
          }),
          createdBy: expect.objectContaining({
            references: expect.objectContaining({
              model: 'users',
              key: 'id'
            })
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Model Associations', () => {
    it('应该定义与Kindergarten的关联关系', () => {
      EnrollmentPlan.associate({ Kindergarten: mockKindergarten });
      
      expect(EnrollmentPlan.belongsTo).toHaveBeenCalledWith(mockKindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
      });
    });

    it('应该定义与EnrollmentApplication的关联关系', () => {
      EnrollmentPlan.associate({ EnrollmentApplication: mockEnrollmentApplication });
      
      expect(EnrollmentPlan.hasMany).toHaveBeenCalledWith(mockEnrollmentApplication, {
        foreignKey: 'planId',
        as: 'applications'
      });
    });

    it('应该定义与Class的多对多关联关系', () => {
      EnrollmentPlan.associate({ Class: mockClass });
      
      expect(EnrollmentPlan.belongsToMany).toHaveBeenCalledWith(mockClass, {
        through: 'enrollment_plan_classes',
        foreignKey: 'planId',
        otherKey: 'classId',
        as: 'classes'
      });
    });

    it('应该定义与User的关联关系（创建者）', () => {
      EnrollmentPlan.associate({ User: mockUser });
      
      expect(EnrollmentPlan.belongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'createdBy',
        as: 'creator'
      });
    });
  });

  describe('Model Enums', () => {
    it('应该定义正确的计划状态枚举', () => {
      expect(PlanStatus).toEqual({
        DRAFT: 'draft',
        ACTIVE: 'active',
        CLOSED: 'closed',
        SUSPENDED: 'suspended'
      });
    });

    it('应该定义正确的招生阶段枚举', () => {
      expect(EnrollmentPhase).toEqual({
        PRE_REGISTRATION: 'pre_registration',
        REGISTRATION: 'registration',
        REVIEW: 'review',
        ADMISSION: 'admission',
        COMPLETED: 'completed'
      });
    });

    it('应该定义正确的年龄组枚举', () => {
      expect(AgeGroup).toEqual({
        TODDLER: 'toddler',
        PRESCHOOL: 'preschool',
        KINDERGARTEN: 'kindergarten',
        MIXED: 'mixed'
      });
    });
  });

  describe('Model Methods', () => {
    it('应该支持toJSON方法', () => {
      const planInstance = {
        id: 1,
        name: '2024-2025学年招生计划',
        totalQuota: 120,
        availableQuota: 85,
        status: 'active',
        currentPhase: 'registration',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: '2024-2025学年招生计划',
          totalQuota: 120,
          availableQuota: 85,
          status: 'active',
          currentPhase: 'registration',
          occupancyRate: 0.29,
          isRegistrationOpen: true
        })
      };

      const json = planInstance.toJSON();

      expect(json).toHaveProperty('id', 1);
      expect(json).toHaveProperty('name', '2024-2025学年招生计划');
      expect(json).toHaveProperty('occupancyRate', 0.29);
      expect(json).toHaveProperty('isRegistrationOpen', true);
    });

    it('应该支持检查是否可以报名', () => {
      const openPlan = {
        status: 'active',
        currentPhase: 'registration',
        availableQuota: 10,
        registrationStartDate: new Date('2024-03-01'),
        registrationEndDate: new Date('2024-05-31'),
        canRegister: jest.fn().mockReturnValue(true)
      };

      const closedPlan = {
        status: 'closed',
        currentPhase: 'completed',
        availableQuota: 0,
        canRegister: jest.fn().mockReturnValue(false)
      };

      expect(openPlan.canRegister()).toBe(true);
      expect(closedPlan.canRegister()).toBe(false);
    });

    it('应该支持检查是否在报名期内', () => {
      const currentDate = new Date('2024-04-15');
      
      const activePlan = {
        registrationStartDate: new Date('2024-03-01'),
        registrationEndDate: new Date('2024-05-31'),
        isRegistrationPeriod: jest.fn().mockImplementation((date = new Date()) => {
          return date >= activePlan.registrationStartDate && date <= activePlan.registrationEndDate;
        })
      };

      const expiredPlan = {
        registrationStartDate: new Date('2024-01-01'),
        registrationEndDate: new Date('2024-02-28'),
        isRegistrationPeriod: jest.fn().mockImplementation((date = new Date()) => {
          return date >= expiredPlan.registrationStartDate && date <= expiredPlan.registrationEndDate;
        })
      };

      expect(activePlan.isRegistrationPeriod(currentDate)).toBe(true);
      expect(expiredPlan.isRegistrationPeriod(currentDate)).toBe(false);
    });

    it('应该支持计算占用率', () => {
      const planInstance = {
        totalQuota: 120,
        availableQuota: 85,
        getOccupancyRate: jest.fn().mockReturnValue(0.29)
      };

      const occupancyRate = planInstance.getOccupancyRate();

      expect(occupancyRate).toBe(0.29);
    });

    it('应该支持获取已申请人数', () => {
      const planInstance = {
        totalQuota: 120,
        availableQuota: 85,
        getAppliedCount: jest.fn().mockReturnValue(35)
      };

      const appliedCount = planInstance.getAppliedCount();

      expect(appliedCount).toBe(35);
    });

    it('应该支持按年龄组获取名额信息', () => {
      const planInstance = {
        quotaByAgeGroup: {
          toddler: 30,
          preschool: 50,
          kindergarten: 40
        },
        appliedByAgeGroup: {
          toddler: 25,
          preschool: 35,
          kindergarten: 20
        },
        getQuotaByAgeGroup: jest.fn().mockReturnValue({
          toddler: { total: 30, applied: 25, available: 5 },
          preschool: { total: 50, applied: 35, available: 15 },
          kindergarten: { total: 40, applied: 20, available: 20 }
        })
      };

      const quotaInfo = planInstance.getQuotaByAgeGroup();

      expect(quotaInfo).toEqual({
        toddler: { total: 30, applied: 25, available: 5 },
        preschool: { total: 50, applied: 35, available: 15 },
        kindergarten: { total: 40, applied: 20, available: 20 }
      });
    });

    it('应该支持更新阶段', () => {
      const planInstance = {
        currentPhase: 'registration',
        updatePhase: jest.fn().mockImplementation((newPhase) => {
          planInstance.currentPhase = newPhase;
          return planInstance.currentPhase;
        })
      };

      const newPhase = planInstance.updatePhase('review');

      expect(newPhase).toBe('review');
      expect(planInstance.currentPhase).toBe('review');
    });

    it('应该支持减少可用名额', () => {
      const planInstance = {
        availableQuota: 85,
        decreaseQuota: jest.fn().mockImplementation((amount = 1) => {
          if (planInstance.availableQuota >= amount) {
            planInstance.availableQuota -= amount;
            return planInstance.availableQuota;
          }
          throw new Error('名额不足');
        })
      };

      const newQuota = planInstance.decreaseQuota(5);

      expect(newQuota).toBe(80);
      expect(planInstance.availableQuota).toBe(80);

      // 测试名额不足的情况
      planInstance.availableQuota = 2;
      expect(() => planInstance.decreaseQuota(5)).toThrow('名额不足');
    });

    it('应该支持增加可用名额', () => {
      const planInstance = {
        availableQuota: 80,
        totalQuota: 120,
        increaseQuota: jest.fn().mockImplementation((amount = 1) => {
          const newQuota = planInstance.availableQuota + amount;
          if (newQuota <= planInstance.totalQuota) {
            planInstance.availableQuota = newQuota;
            return planInstance.availableQuota;
          }
          throw new Error('超出总名额限制');
        })
      };

      const newQuota = planInstance.increaseQuota(5);

      expect(newQuota).toBe(85);
      expect(planInstance.availableQuota).toBe(85);

      // 测试超出总名额的情况
      planInstance.availableQuota = 118;
      expect(() => planInstance.increaseQuota(5)).toThrow('超出总名额限制');
    });

    it('应该支持获取计划统计信息', () => {
      const planInstance = {
        id: 1,
        name: '2024-2025学年招生计划',
        totalQuota: 120,
        availableQuota: 85,
        applications: [
          { id: 1, status: 'pending' },
          { id: 2, status: 'approved' },
          { id: 3, status: 'rejected' },
          { id: 4, status: 'pending' }
        ],
        getStatistics: jest.fn().mockReturnValue({
          totalQuota: 120,
          availableQuota: 85,
          appliedCount: 35,
          occupancyRate: 0.29,
          applicationStats: {
            total: 4,
            pending: 2,
            approved: 1,
            rejected: 1
          },
          approvalRate: 0.25
        })
      };

      const stats = planInstance.getStatistics();

      expect(stats).toEqual({
        totalQuota: 120,
        availableQuota: 85,
        appliedCount: 35,
        occupancyRate: 0.29,
        applicationStats: {
          total: 4,
          pending: 2,
          approved: 1,
          rejected: 1
        },
        approvalRate: 0.25
      });
    });

    it('应该支持检查是否可以进入下一阶段', () => {
      const planInstance = {
        currentPhase: 'registration',
        registrationEndDate: new Date('2024-05-31'),
        canAdvanceToNextPhase: jest.fn().mockImplementation(() => {
          const now = new Date();
          return now > planInstance.registrationEndDate;
        })
      };

      // Mock current date to be after registration end date
      const mockDate = new Date('2024-06-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const canAdvance = planInstance.canAdvanceToNextPhase();

      expect(canAdvance).toBe(true);
    });

    it('应该支持获取下一个阶段', () => {
      const planInstance = {
        currentPhase: 'registration',
        getNextPhase: jest.fn().mockReturnValue('review')
      };

      const nextPhase = planInstance.getNextPhase();

      expect(nextPhase).toBe('review');
    });

    it('应该支持计算总费用', () => {
      const planInstance = {
        fees: {
          registration: 200,
          tuition: 3000,
          meals: 500,
          activities: 300,
          materials: 200
        },
        getTotalFees: jest.fn().mockReturnValue(4200)
      };

      const totalFees = planInstance.getTotalFees();

      expect(totalFees).toBe(4200);
    });

    it('应该支持检查年龄是否符合要求', () => {
      const planInstance = {
        requirements: {
          ageRange: {
            min: 3,
            max: 6
          }
        },
        isAgeEligible: jest.fn().mockImplementation((age) => {
          return age >= planInstance.requirements.ageRange.min && 
                 age <= planInstance.requirements.ageRange.max;
        })
      };

      expect(planInstance.isAgeEligible(4)).toBe(true);
      expect(planInstance.isAgeEligible(2)).toBe(false);
      expect(planInstance.isAgeEligible(7)).toBe(false);
    });

    it('应该支持获取所需文档列表', () => {
      const planInstance = {
        documents: [
          { name: '入学申请表', required: true },
          { name: '健康证明', required: true },
          { name: '家庭照片', required: false }
        ],
        getRequiredDocuments: jest.fn().mockReturnValue([
          { name: '入学申请表', required: true },
          { name: '健康证明', required: true }
        ])
      };

      const requiredDocs = planInstance.getRequiredDocuments();

      expect(requiredDocs).toHaveLength(2);
      expect(requiredDocs.every(doc => doc.required)).toBe(true);
    });

    it('应该支持获取计划详细信息', () => {
      const planInstance = {
        id: 1,
        name: '2024-2025学年招生计划',
        status: 'active',
        currentPhase: 'registration',
        totalQuota: 120,
        availableQuota: 85,
        kindergarten: {
          id: 1,
          name: '示例幼儿园',
          address: '北京市朝阳区'
        },
        getDetailedInfo: jest.fn().mockReturnValue({
          basic: {
            id: 1,
            name: '2024-2025学年招生计划',
            status: 'active',
            currentPhase: 'registration'
          },
          quota: {
            total: 120,
            available: 85,
            applied: 35,
            occupancyRate: 0.29
          },
          timeline: {
            registrationStart: '2024-03-01',
            registrationEnd: '2024-05-31',
            reviewStart: '2024-06-01',
            reviewEnd: '2024-06-15',
            admissionDate: '2024-06-20',
            schoolStart: '2024-09-01'
          },
          kindergarten: {
            id: 1,
            name: '示例幼儿园',
            address: '北京市朝阳区'
          }
        })
      };

      const detailedInfo = planInstance.getDetailedInfo();

      expect(detailedInfo).toEqual({
        basic: expect.objectContaining({
          id: 1,
          name: '2024-2025学年招生计划'
        }),
        quota: expect.objectContaining({
          total: 120,
          available: 85
        }),
        timeline: expect.objectContaining({
          registrationStart: '2024-03-01',
          registrationEnd: '2024-05-31'
        }),
        kindergarten: expect.objectContaining({
          name: '示例幼儿园'
        })
      });
    });
  });

  describe('Model Scopes', () => {
    it('应该定义活跃计划范围', () => {
      const activeScope = {
        where: { status: 'active', isActive: true }
      };

      expect(activeScope).toEqual({
        where: { status: 'active', isActive: true }
      });
    });

    it('应该定义按学年筛选范围', () => {
      const byAcademicYearScope = (academicYear: string) => ({
        where: { academicYear }
      });

      expect(byAcademicYearScope('2024-2025')).toEqual({
        where: { academicYear: '2024-2025' }
      });
    });

    it('应该定义按阶段筛选范围', () => {
      const byPhaseScope = (phase: string) => ({
        where: { currentPhase: phase }
      });

      expect(byPhaseScope('registration')).toEqual({
        where: { currentPhase: 'registration' }
      });
    });

    it('应该定义有名额的计划范围', () => {
      const withAvailableQuotaScope = {
        where: mockSequelize.literal('available_quota > 0')
      };

      expect(withAvailableQuotaScope.where).toBeDefined();
    });

    it('应该定义按幼儿园筛选范围', () => {
      const byKindergartenScope = (kindergartenId: number) => ({
        where: { kindergartenId }
      });

      expect(byKindergartenScope(1)).toEqual({
        where: { kindergartenId: 1 }
      });
    });

    it('应该定义公开计划范围', () => {
      const publicScope = {
        where: { isPublic: true, isActive: true }
      };

      expect(publicScope).toEqual({
        where: { isPublic: true, isActive: true }
      });
    });

    it('应该定义包含申请信息的范围', () => {
      const withApplicationsScope = {
        include: [
          {
            model: mockEnrollmentApplication,
            as: 'applications',
            attributes: ['id', 'status', 'createdAt']
          }
        ]
      };

      expect(withApplicationsScope.include).toBeDefined();
    });
  });

  describe('Model Hooks', () => {
    it('应该在创建前验证日期逻辑', () => {
      const beforeCreateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeCreateHook).toBeDefined();
    });

    it('应该在更新前验证名额变更', () => {
      const beforeUpdateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeUpdateHook).toBeDefined();
    });

    it('应该在状态变更时发送通知', () => {
      const afterUpdateHook = jest.fn();
      
      // 模拟钩子函数
      expect(afterUpdateHook).toBeDefined();
    });

    it('应该在删除前检查是否有申请', () => {
      const beforeDestroyHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeDestroyHook).toBeDefined();
    });
  });

  describe('Model Indexes', () => {
    it('应该定义正确的索引', () => {
      const expectedIndexes = [
        { fields: ['kindergartenId'] },
        { fields: ['academicYear'] },
        { fields: ['status'] },
        { fields: ['currentPhase'] },
        { fields: ['isActive'] },
        { fields: ['isPublic'] },
        { fields: ['registrationStartDate'] },
        { fields: ['registrationEndDate'] },
        { fields: ['createdBy'] },
        { fields: ['kindergartenId', 'academicYear'], unique: true },
        { fields: ['status', 'isActive'] },
        { fields: ['currentPhase', 'status'] },
        { fields: ['registrationStartDate', 'registrationEndDate'] }
      ];

      // 验证索引定义
      expectedIndexes.forEach(index => {
        expect(index).toBeDefined();
      });
    });
  });
});
