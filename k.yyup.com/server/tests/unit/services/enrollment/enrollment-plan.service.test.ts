import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockEnrollmentPlan = {
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockKindergarten = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockEnrollmentQuota = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};

// Mock Sequelize transaction
const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn().mockResolvedValue(mockTransaction),
  Op: {
    gte: Symbol('gte'),
    lte: Symbol('lte'),
    between: Symbol('between'),
    in: Symbol('in'),
    like: Symbol('like'),
    overlap: Symbol('overlap')
  },
  fn: jest.fn(),
  col: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/enrollment-plan.model', () => ({
  EnrollmentPlan: mockEnrollmentPlan,
  PlanStatus: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  }
}));

jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({
  Kindergarten: mockKindergarten
}));

jest.unstable_mockModule('../../../../../src/models/enrollment-quota.model', () => ({
  EnrollmentQuota: mockEnrollmentQuota
}));

jest.unstable_mockModule('../../../../../src/config/database', () => ({
  sequelize: mockSequelize
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

describe('Enrollment Plan Service', () => {
  let EnrollmentPlanService: any;
  let enrollmentPlanService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/enrollment/enrollment-plan.service');
    EnrollmentPlanService = imported.EnrollmentPlanService;
    enrollmentPlanService = new EnrollmentPlanService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('createEnrollmentPlan', () => {
    it('应该成功创建招生计划', async () => {
      const planData = {
        kindergartenId: 1,
        academicYear: '2024-2025',
        planName: '2024年秋季招生计划',
        description: '面向3-6岁儿童的招生计划',
        enrollmentPeriod: {
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-06-30')
        },
        targetStudents: 120,
        ageGroups: [
          { name: '小班', ageRange: '3-4岁', quota: 40 },
          { name: '中班', ageRange: '4-5岁', quota: 40 },
          { name: '大班', ageRange: '5-6岁', quota: 40 }
        ],
        requirements: {
          documents: ['户口本', '疫苗接种证', '体检报告'],
          ageRequirement: '满3周岁',
          healthRequirement: '身体健康，无传染病'
        },
        fees: {
          registrationFee: 200,
          tuitionFee: 2000,
          materialFee: 300
        }
      };

      const mockCreatedPlan = {
        id: 1,
        ...planData,
        status: 'draft',
        planNumber: 'EP_2024_001',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockKindergarten.findByPk.mockResolvedValue({ id: 1, name: '阳光幼儿园' });
      mockEnrollmentPlan.create.mockResolvedValue(mockCreatedPlan);

      const result = await enrollmentPlanService.createEnrollmentPlan(planData);

      expect(mockKindergarten.findByPk).toHaveBeenCalledWith(1);
      expect(mockEnrollmentPlan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          kindergartenId: 1,
          academicYear: '2024-2025',
          planName: '2024年秋季招生计划',
          status: 'draft',
          planNumber: expect.any(String),
          targetStudents: 120
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedPlan);
    });

    it('应该在幼儿园不存在时抛出错误', async () => {
      const planData = {
        kindergartenId: 999,
        academicYear: '2024-2025',
        planName: '测试计划'
      };

      mockKindergarten.findByPk.mockResolvedValue(null);

      await expect(enrollmentPlanService.createEnrollmentPlan(planData))
        .rejects
        .toThrow('幼儿园不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该验证招生时间段', async () => {
      const planData = {
        kindergartenId: 1,
        academicYear: '2024-2025',
        planName: '测试计划',
        enrollmentPeriod: {
          startDate: new Date('2024-06-30'),
          endDate: new Date('2024-03-01') // 结束时间早于开始时间
        }
      };

      mockKindergarten.findByPk.mockResolvedValue({ id: 1 });

      await expect(enrollmentPlanService.createEnrollmentPlan(planData))
        .rejects
        .toThrow('招生结束时间不能早于开始时间');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该验证年龄组配额总和', async () => {
      const planData = {
        kindergartenId: 1,
        academicYear: '2024-2025',
        planName: '测试计划',
        targetStudents: 100,
        ageGroups: [
          { name: '小班', quota: 60 },
          { name: '中班', quota: 60 } // 总和120 > 目标学生数100
        ]
      };

      mockKindergarten.findByPk.mockResolvedValue({ id: 1 });

      await expect(enrollmentPlanService.createEnrollmentPlan(planData))
        .rejects
        .toThrow('年龄组配额总和不能超过目标学生数');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getPlanById', () => {
    it('应该成功获取招生计划详情', async () => {
      const planId = 1;
      const mockPlan = {
        id: 1,
        kindergartenId: 1,
        academicYear: '2024-2025',
        planName: '2024年秋季招生计划',
        status: 'active',
        targetStudents: 120,
        currentApplications: 85,
        kindergarten: { id: 1, name: '阳光幼儿园' },
        quotas: [
          { ageGroup: '小班', quota: 40, applied: 28, confirmed: 25 },
          { ageGroup: '中班', quota: 40, applied: 32, confirmed: 30 },
          { ageGroup: '大班', quota: 40, applied: 25, confirmed: 20 }
        ]
      };

      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);

      const result = await enrollmentPlanService.getPlanById(planId);

      expect(mockEnrollmentPlan.findByPk).toHaveBeenCalledWith(planId, {
        include: [
          {
            model: mockKindergarten,
            as: 'kindergarten',
            attributes: ['id', 'name', 'address', 'phone']
          },
          {
            model: mockEnrollmentQuota,
            as: 'quotas'
          }
        ]
      });
      expect(result).toEqual(mockPlan);
    });

    it('应该在计划不存在时抛出错误', async () => {
      const planId = 999;

      mockEnrollmentPlan.findByPk.mockResolvedValue(null);

      await expect(enrollmentPlanService.getPlanById(planId))
        .rejects
        .toThrow('招生计划不存在');
    });
  });

  describe('getPlanList', () => {
    it('应该成功获取招生计划列表', async () => {
      const options = {
        page: 1,
        pageSize: 10,
        kindergartenId: 1,
        academicYear: '2024-2025',
        status: 'active'
      };

      const mockPlans = [
        {
          id: 1,
          planName: '2024年秋季招生计划',
          academicYear: '2024-2025',
          status: 'active',
          targetStudents: 120,
          currentApplications: 85
        },
        {
          id: 2,
          planName: '2024年春季招生计划',
          academicYear: '2023-2024',
          status: 'completed',
          targetStudents: 100,
          currentApplications: 100
        }
      ];

      mockEnrollmentPlan.findAll.mockResolvedValue(mockPlans);
      mockEnrollmentPlan.count.mockResolvedValue(2);

      const result = await enrollmentPlanService.getPlanList(options);

      expect(mockEnrollmentPlan.findAll).toHaveBeenCalledWith({
        where: {
          kindergartenId: 1,
          academicYear: '2024-2025',
          status: 'active'
        },
        include: [
          {
            model: mockKindergarten,
            as: 'kindergarten',
            attributes: ['id', 'name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0
      });

      expect(result).toEqual({
        plans: mockPlans,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });

    it('应该支持搜索功能', async () => {
      const options = {
        search: '秋季'
      };

      await enrollmentPlanService.getPlanList(options);

      expect(mockEnrollmentPlan.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [mockSequelize.Op.or]: [
              { planName: { [mockSequelize.Op.like]: '%秋季%' } },
              { description: { [mockSequelize.Op.like]: '%秋季%' } }
            ]
          })
        })
      );
    });

    it('应该支持时间范围筛选', async () => {
      const options = {
        enrollmentStartDate: new Date('2024-03-01'),
        enrollmentEndDate: new Date('2024-06-30')
      };

      await enrollmentPlanService.getPlanList(options);

      expect(mockEnrollmentPlan.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            enrollmentPeriod: {
              [mockSequelize.Op.overlap]: [options.enrollmentStartDate, options.enrollmentEndDate]
            }
          })
        })
      );
    });
  });

  describe('updatePlan', () => {
    it('应该成功更新招生计划', async () => {
      const planId = 1;
      const updateData = {
        planName: '2024年秋季招生计划（更新）',
        targetStudents: 130,
        description: '更新后的招生计划描述'
      };

      const mockPlan = {
        id: 1,
        status: 'draft',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);

      const result = await enrollmentPlanService.updatePlan(planId, updateData);

      expect(mockEnrollmentPlan.findByPk).toHaveBeenCalledWith(planId);
      expect(mockPlan.update).toHaveBeenCalledWith(updateData);
      expect(result).toBe(true);
    });

    it('应该在计划不存在时抛出错误', async () => {
      const planId = 999;
      const updateData = { planName: '新名称' };

      mockEnrollmentPlan.findByPk.mockResolvedValue(null);

      await expect(enrollmentPlanService.updatePlan(planId, updateData))
        .rejects
        .toThrow('招生计划不存在');
    });

    it('应该在计划已激活时限制更新', async () => {
      const planId = 1;
      const updateData = { targetStudents: 200 };

      const mockPlan = {
        id: 1,
        status: 'active', // 已激活的计划
        currentApplications: 50
      };

      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);

      await expect(enrollmentPlanService.updatePlan(planId, updateData))
        .rejects
        .toThrow('已激活的计划不能修改关键参数');
    });
  });

  describe('activatePlan', () => {
    it('应该成功激活招生计划', async () => {
      const planId = 1;

      const mockPlan = {
        id: 1,
        status: 'draft',
        enrollmentPeriod: {
          startDate: new Date(Date.now() + 86400000), // 明天开始
          endDate: new Date(Date.now() + 30 * 86400000) // 30天后结束
        },
        ageGroups: [
          { name: '小班', quota: 40 },
          { name: '中班', quota: 40 }
        ],
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);

      const result = await enrollmentPlanService.activatePlan(planId);

      expect(mockEnrollmentPlan.findByPk).toHaveBeenCalledWith(planId);
      expect(mockPlan.update).toHaveBeenCalledWith({
        status: 'active',
        activatedAt: expect.any(Date)
      });
      expect(result).toBe(true);
    });

    it('应该在计划不存在时抛出错误', async () => {
      const planId = 999;

      mockEnrollmentPlan.findByPk.mockResolvedValue(null);

      await expect(enrollmentPlanService.activatePlan(planId))
        .rejects
        .toThrow('招生计划不存在');
    });

    it('应该在计划已激活时抛出错误', async () => {
      const planId = 1;

      const mockPlan = {
        id: 1,
        status: 'active' // 已经激活
      };

      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);

      await expect(enrollmentPlanService.activatePlan(planId))
        .rejects
        .toThrow('计划已经激活');
    });

    it('应该在招生时间已过期时抛出错误', async () => {
      const planId = 1;

      const mockPlan = {
        id: 1,
        status: 'draft',
        enrollmentPeriod: {
          startDate: new Date(Date.now() - 30 * 86400000), // 30天前开始
          endDate: new Date(Date.now() - 86400000) // 昨天结束
        }
      };

      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);

      await expect(enrollmentPlanService.activatePlan(planId))
        .rejects
        .toThrow('招生时间已过期');
    });
  });

  describe('getPlanStats', () => {
    it('应该成功获取计划统计信息', async () => {
      const planId = 1;

      const mockPlan = {
        id: 1,
        targetStudents: 120,
        currentApplications: 85,
        confirmedStudents: 70,
        quotas: [
          { ageGroup: '小班', quota: 40, applied: 28, confirmed: 25 },
          { ageGroup: '中班', quota: 40, applied: 32, confirmed: 30 },
          { ageGroup: '大班', quota: 40, applied: 25, confirmed: 15 }
        ]
      };

      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);

      const result = await enrollmentPlanService.getPlanStats(planId);

      expect(mockEnrollmentPlan.findByPk).toHaveBeenCalledWith(planId, {
        include: [
          {
            model: mockEnrollmentQuota,
            as: 'quotas'
          }
        ]
      });

      expect(result).toEqual({
        planId: planId,
        targetStudents: 120,
        currentApplications: 85,
        confirmedStudents: 70,
        applicationRate: 70.83, // 85/120 * 100
        confirmationRate: 82.35, // 70/85 * 100
        completionRate: 58.33, // 70/120 * 100
        ageGroupStats: expect.arrayContaining([
          expect.objectContaining({
            ageGroup: expect.any(String),
            quota: expect.any(Number),
            applied: expect.any(Number),
            confirmed: expect.any(Number),
            applicationRate: expect.any(Number),
            confirmationRate: expect.any(Number)
          })
        ]),
        summary: expect.objectContaining({
          totalQuota: 120,
          totalApplied: 85,
          totalConfirmed: 70,
          remainingQuota: 50
        })
      });
    });

    it('应该在计划不存在时抛出错误', async () => {
      const planId = 999;

      mockEnrollmentPlan.findByPk.mockResolvedValue(null);

      await expect(enrollmentPlanService.getPlanStats(planId))
        .rejects
        .toThrow('招生计划不存在');
    });
  });

  describe('completePlan', () => {
    it('应该成功完成招生计划', async () => {
      const planId = 1;
      const completionNotes = '招生计划顺利完成';

      const mockPlan = {
        id: 1,
        status: 'active',
        enrollmentPeriod: {
          endDate: new Date(Date.now() - 86400000) // 昨天结束
        },
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);

      const result = await enrollmentPlanService.completePlan(planId, completionNotes);

      expect(mockEnrollmentPlan.findByPk).toHaveBeenCalledWith(planId);
      expect(mockPlan.update).toHaveBeenCalledWith({
        status: 'completed',
        completedAt: expect.any(Date),
        completionNotes: '招生计划顺利完成'
      });
      expect(result).toBe(true);
    });

    it('应该在计划不存在时抛出错误', async () => {
      const planId = 999;

      mockEnrollmentPlan.findByPk.mockResolvedValue(null);

      await expect(enrollmentPlanService.completePlan(planId))
        .rejects
        .toThrow('招生计划不存在');
    });

    it('应该在计划未激活时抛出错误', async () => {
      const planId = 1;

      const mockPlan = {
        id: 1,
        status: 'draft'
      };

      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);

      await expect(enrollmentPlanService.completePlan(planId))
        .rejects
        .toThrow('只能完成已激活的计划');
    });
  });

  describe('cancelPlan', () => {
    it('应该成功取消招生计划', async () => {
      const planId = 1;
      const cancelReason = '政策调整';

      const mockPlan = {
        id: 1,
        status: 'draft',
        currentApplications: 0,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);

      const result = await enrollmentPlanService.cancelPlan(planId, cancelReason);

      expect(mockEnrollmentPlan.findByPk).toHaveBeenCalledWith(planId);
      expect(mockPlan.update).toHaveBeenCalledWith({
        status: 'cancelled',
        cancelledAt: expect.any(Date),
        cancelReason: '政策调整'
      });
      expect(result).toBe(true);
    });

    it('应该在计划不存在时抛出错误', async () => {
      const planId = 999;

      mockEnrollmentPlan.findByPk.mockResolvedValue(null);

      await expect(enrollmentPlanService.cancelPlan(planId))
        .rejects
        .toThrow('招生计划不存在');
    });

    it('应该在有申请时拒绝取消', async () => {
      const planId = 1;
      const cancelReason = '政策调整';

      const mockPlan = {
        id: 1,
        status: 'active',
        currentApplications: 10 // 有申请
      };

      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);

      await expect(enrollmentPlanService.cancelPlan(planId, cancelReason))
        .rejects
        .toThrow('有申请的计划不能取消');
    });
  });

  describe('generatePlanReport', () => {
    it('应该成功生成计划报告', async () => {
      const planId = 1;
      const reportOptions = {
        includeDetails: true,
        format: 'comprehensive'
      };

      const mockPlan = {
        id: 1,
        planName: '2024年秋季招生计划',
        academicYear: '2024-2025',
        status: 'completed',
        targetStudents: 120,
        currentApplications: 115,
        confirmedStudents: 110
      };

      const mockReport = {
        reportId: 'plan_report_1',
        planId: planId,
        generatedAt: new Date(),
        planInfo: mockPlan,
        statistics: {
          applicationRate: 95.83,
          confirmationRate: 95.65,
          completionRate: 91.67
        },
        ageGroupBreakdown: [
          { ageGroup: '小班', quota: 40, applied: 38, confirmed: 36 },
          { ageGroup: '中班', quota: 40, applied: 39, confirmed: 37 },
          { ageGroup: '大班', quota: 40, applied: 38, confirmed: 37 }
        ],
        timeline: [
          { date: '2024-01-15', event: '计划创建' },
          { date: '2024-03-01', event: '计划激活' },
          { date: '2024-06-30', event: '招生结束' },
          { date: '2024-07-15', event: '计划完成' }
        ],
        insights: [
          '招生目标完成率达到91.67%',
          '各年龄组招生均衡',
          '申请确认率较高，达到95.65%'
        ],
        recommendations: [
          '继续保持高质量的招生服务',
          '可适当增加招生名额',
          '加强与家长的沟通'
        ]
      };

      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);
      enrollmentPlanService.getPlanStats = jest.fn().mockResolvedValue({
        applicationRate: 95.83,
        confirmationRate: 95.65,
        completionRate: 91.67,
        ageGroupStats: mockReport.ageGroupBreakdown
      });

      const result = await enrollmentPlanService.generatePlanReport(planId, reportOptions);

      expect(result).toEqual(expect.objectContaining({
        reportId: expect.any(String),
        planId: planId,
        generatedAt: expect.any(Date),
        planInfo: expect.any(Object),
        statistics: expect.any(Object),
        insights: expect.any(Array),
        recommendations: expect.any(Array)
      }));

      if (reportOptions.includeDetails) {
        expect(result.ageGroupBreakdown).toBeDefined();
        expect(result.timeline).toBeDefined();
      }
    });

    it('应该在计划不存在时抛出错误', async () => {
      const planId = 999;

      mockEnrollmentPlan.findByPk.mockResolvedValue(null);

      await expect(enrollmentPlanService.generatePlanReport(planId))
        .rejects
        .toThrow('招生计划不存在');
    });
  });

  describe('clonePlan', () => {
    it('应该成功克隆招生计划', async () => {
      const sourcePlanId = 1;
      const cloneOptions = {
        academicYear: '2025-2026',
        planName: '2025年秋季招生计划',
        adjustments: {
          targetStudents: 130,
          enrollmentPeriod: {
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-06-30')
          }
        }
      };

      const mockSourcePlan = {
        id: 1,
        kindergartenId: 1,
        planName: '2024年秋季招生计划',
        academicYear: '2024-2025',
        targetStudents: 120,
        ageGroups: [
          { name: '小班', quota: 40 },
          { name: '中班', quota: 40 },
          { name: '大班', quota: 40 }
        ],
        requirements: { documents: ['户口本'] },
        fees: { registrationFee: 200 }
      };

      const mockClonedPlan = {
        id: 2,
        ...mockSourcePlan,
        planName: '2025年秋季招生计划',
        academicYear: '2025-2026',
        targetStudents: 130,
        status: 'draft',
        planNumber: 'EP_2025_001'
      };

      mockEnrollmentPlan.findByPk.mockResolvedValue(mockSourcePlan);
      mockEnrollmentPlan.create.mockResolvedValue(mockClonedPlan);

      const result = await enrollmentPlanService.clonePlan(sourcePlanId, cloneOptions);

      expect(mockEnrollmentPlan.findByPk).toHaveBeenCalledWith(sourcePlanId);
      expect(mockEnrollmentPlan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          kindergartenId: 1,
          planName: '2025年秋季招生计划',
          academicYear: '2025-2026',
          targetStudents: 130,
          status: 'draft',
          planNumber: expect.any(String)
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockClonedPlan);
    });

    it('应该在源计划不存在时抛出错误', async () => {
      const sourcePlanId = 999;
      const cloneOptions = { academicYear: '2025-2026' };

      mockEnrollmentPlan.findByPk.mockResolvedValue(null);

      await expect(enrollmentPlanService.clonePlan(sourcePlanId, cloneOptions))
        .rejects
        .toThrow('源招生计划不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
