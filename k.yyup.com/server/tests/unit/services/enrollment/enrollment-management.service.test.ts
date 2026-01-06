import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock dependencies
const mockSequelize = {
  transaction: jest.fn(),
  query: jest.fn(),
  QueryTypes: { SELECT: 'SELECT' }
};

const mockEnrollmentApplication = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockStudent = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};

const mockClass = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn()
};

const mockKindergarten = {
  findByPk: jest.fn()
};

const mockParent = {
  findByPk: jest.fn(),
  create: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockEmailService = {
  sendEnrollmentConfirmation: jest.fn(),
  sendEnrollmentRejection: jest.fn(),
  sendEnrollmentReminder: jest.fn()
};

const mockSMSService = {
  sendEnrollmentNotification: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

// Mock imports
jest.unstable_mockModule('sequelize', () => ({ Sequelize: jest.fn(() => mockSequelize) }));
jest.unstable_mockModule('../../../../../src/models/enrollment-application.model', () => ({ default: mockEnrollmentApplication }));
jest.unstable_mockModule('../../../../../src/models/student.model', () => ({ default: mockStudent }));
jest.unstable_mockModule('../../../../../src/models/class.model', () => ({ default: mockClass }));
jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({ default: mockKindergarten }));
jest.unstable_mockModule('../../../../../src/models/parent.model', () => ({ default: mockParent }));
jest.unstable_mockModule('../../../../../src/utils/logger', () => ({ default: mockLogger }));
jest.unstable_mockModule('../../../../../src/services/email/email.service', () => ({ default: mockEmailService }));
jest.unstable_mockModule('../../../../../src/services/sms/sms.service', () => ({ default: mockSMSService }));


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

describe('Enrollment Management Service', () => {
  let enrollmentManagementService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/enrollment/enrollment-management.service');
    enrollmentManagementService = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('submitApplication', () => {
    it('应该成功提交报名申请', async () => {
      const applicationData = {
        kindergartenId: 1,
        studentInfo: {
          name: '张小明',
          gender: 'male',
          birthDate: '2020-05-15',
          idNumber: '110101202005151234'
        },
        parentInfo: {
          father: {
            name: '张爸爸',
            phone: '13800138001',
            email: 'father@example.com'
          },
          mother: {
            name: '张妈妈',
            phone: '13800138002',
            email: 'mother@example.com'
          }
        },
        contactInfo: {
          primaryContact: 'father',
          address: {
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            street: '某某街道123号'
          }
        },
        preferences: {
          classType: 'regular',
          startDate: '2024-09-01',
          specialRequests: '希望安排在上午班'
        }
      };

      const mockKindergarten = {
        id: 1,
        name: '阳光幼儿园',
        enrollmentOpen: true,
        availableSlots: 50
      };

      const mockApplication = {
        id: 1,
        applicationNumber: 'APP202400001',
        status: 'submitted',
        ...applicationData
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);
      mockEnrollmentApplication.create.mockResolvedValue(mockApplication);
      mockEmailService.sendEnrollmentConfirmation.mockResolvedValue(undefined);

      const result = await enrollmentManagementService.submitApplication(applicationData);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('applicationNumber', 'APP202400001');
      expect(result).toHaveProperty('status', 'submitted');
      expect(mockKindergarten.findByPk).toHaveBeenCalledWith(1);
      expect(mockEnrollmentApplication.create).toHaveBeenCalledWith(
        expect.objectContaining(applicationData),
        expect.objectContaining({ transaction: mockTransaction })
      );
      expect(mockEmailService.sendEnrollmentConfirmation).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该验证幼儿园是否开放报名', async () => {
      const applicationData = { kindergartenId: 1 };
      const mockKindergarten = {
        id: 1,
        name: '测试幼儿园',
        enrollmentOpen: false
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);

      await expect(enrollmentManagementService.submitApplication(applicationData))
        .rejects.toThrow('该幼儿园当前未开放报名');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该检查报名名额是否充足', async () => {
      const applicationData = { kindergartenId: 1 };
      const mockKindergarten = {
        id: 1,
        enrollmentOpen: true,
        totalSlots: 100,
        availableSlots: 0
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);

      await expect(enrollmentManagementService.submitApplication(applicationData))
        .rejects.toThrow('报名名额已满');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该检查重复报名', async () => {
      const applicationData = {
        kindergartenId: 1,
        studentInfo: { idNumber: '110101202005151234' }
      };

      const mockKindergarten = { id: 1, enrollmentOpen: true, availableSlots: 50 };
      const existingApplication = { id: 1, status: 'submitted' };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);
      mockEnrollmentApplication.findAll.mockResolvedValue([existingApplication]);

      await expect(enrollmentManagementService.submitApplication(applicationData))
        .rejects.toThrow('该学生已有报名申请');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理提交失败的情况', async () => {
      const applicationData = { kindergartenId: 1 };
      const mockKindergarten = { id: 1, enrollmentOpen: true, availableSlots: 50 };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);
      mockEnrollmentApplication.create.mockRejectedValue(new Error('数据库错误'));

      await expect(enrollmentManagementService.submitApplication(applicationData))
        .rejects.toThrow('数据库错误');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('应该生成唯一的申请编号', async () => {
      const applicationNumber1 = await enrollmentManagementService.generateApplicationNumber();
      const applicationNumber2 = await enrollmentManagementService.generateApplicationNumber();

      expect(applicationNumber1).toMatch(/^APP\d{9}$/);
      expect(applicationNumber2).toMatch(/^APP\d{9}$/);
      expect(applicationNumber1).not.toBe(applicationNumber2);
    });
  });

  describe('reviewApplication', () => {
    it('应该成功审核通过申请', async () => {
      const applicationId = 1;
      const reviewData = {
        status: 'approved',
        reviewerId: 2,
        reviewNotes: '符合入学条件，同意录取',
        assignedClassId: 3,
        enrollmentDate: '2024-09-01'
      };

      const mockApplication = {
        id: 1,
        status: 'submitted',
        studentInfo: { name: '张小明' },
        parentInfo: { father: { email: 'father@example.com' } },
        update: jest.fn().mockResolvedValue(undefined)
      };

      const mockClass = {
        id: 3,
        name: '大班A',
        currentEnrollment: 20,
        maxCapacity: 25,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockApplication);
      mockClass.findByPk.mockResolvedValue(mockClass);
      mockEmailService.sendEnrollmentConfirmation.mockResolvedValue(undefined);

      const result = await enrollmentManagementService.reviewApplication(applicationId, reviewData);

      expect(result).toHaveProperty('status', 'approved');
      expect(mockApplication.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'approved',
          reviewerId: 2,
          reviewNotes: '符合入学条件，同意录取',
          assignedClassId: 3,
          reviewedAt: expect.any(Date)
        }),
        expect.objectContaining({ transaction: mockTransaction })
      );
      expect(mockClass.update).toHaveBeenCalledWith(
        { currentEnrollment: 21 },
        expect.objectContaining({ transaction: mockTransaction })
      );
      expect(mockEmailService.sendEnrollmentConfirmation).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该成功审核拒绝申请', async () => {
      const applicationId = 1;
      const reviewData = {
        status: 'rejected',
        reviewerId: 2,
        reviewNotes: '年龄不符合要求',
        rejectionReason: 'age_requirement'
      };

      const mockApplication = {
        id: 1,
        status: 'submitted',
        parentInfo: { father: { email: 'father@example.com' } },
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockApplication);
      mockEmailService.sendEnrollmentRejection.mockResolvedValue(undefined);

      const result = await enrollmentManagementService.reviewApplication(applicationId, reviewData);

      expect(result).toHaveProperty('status', 'rejected');
      expect(mockApplication.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'rejected',
          reviewerId: 2,
          rejectionReason: 'age_requirement'
        }),
        expect.objectContaining({ transaction: mockTransaction })
      );
      expect(mockEmailService.sendEnrollmentRejection).toHaveBeenCalled();
    });

    it('应该验证申请状态', async () => {
      const applicationId = 1;
      const reviewData = { status: 'approved' };
      const mockApplication = {
        id: 1,
        status: 'approved' // 已经审核过
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockApplication);

      await expect(enrollmentManagementService.reviewApplication(applicationId, reviewData))
        .rejects.toThrow('申请已经审核过，无法重复审核');
    });

    it('应该检查班级容量', async () => {
      const applicationId = 1;
      const reviewData = {
        status: 'approved',
        assignedClassId: 3
      };

      const mockApplication = { id: 1, status: 'submitted' };
      const mockClass = {
        id: 3,
        currentEnrollment: 25,
        maxCapacity: 25 // 已满
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockApplication);
      mockClass.findByPk.mockResolvedValue(mockClass);

      await expect(enrollmentManagementService.reviewApplication(applicationId, reviewData))
        .rejects.toThrow('指定班级已满员');
    });
  });

  describe('createStudentRecord', () => {
    it('应该为通过审核的申请创建学生记录', async () => {
      const applicationId = 1;
      const mockApplication = {
        id: 1,
        status: 'approved',
        studentInfo: {
          name: '张小明',
          gender: 'male',
          birthDate: '2020-05-15',
          idNumber: '110101202005151234'
        },
        parentInfo: {
          father: {
            name: '张爸爸',
            phone: '13800138001',
            email: 'father@example.com'
          }
        },
        assignedClassId: 3,
        kindergartenId: 1
      };

      const mockStudent = {
        id: 1,
        studentNumber: 'STU202400001',
        ...mockApplication.studentInfo,
        classId: 3,
        kindergartenId: 1
      };

      const mockParent = {
        id: 1,
        ...mockApplication.parentInfo.father
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockApplication);
      mockStudent.create.mockResolvedValue(mockStudent);
      mockParent.create.mockResolvedValue(mockParent);

      const result = await enrollmentManagementService.createStudentRecord(applicationId);

      expect(result).toHaveProperty('student');
      expect(result).toHaveProperty('parent');
      expect(result.student).toHaveProperty('studentNumber', 'STU202400001');
      expect(mockStudent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '张小明',
          classId: 3,
          kindergartenId: 1
        }),
        expect.objectContaining({ transaction: mockTransaction })
      );
    });

    it('应该验证申请状态为已通过', async () => {
      const applicationId = 1;
      const mockApplication = {
        id: 1,
        status: 'submitted' // 未通过审核
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockApplication);

      await expect(enrollmentManagementService.createStudentRecord(applicationId))
        .rejects.toThrow('只能为已通过审核的申请创建学生记录');
    });

    it('应该检查是否已创建学生记录', async () => {
      const applicationId = 1;
      const mockApplication = {
        id: 1,
        status: 'approved',
        studentId: 1 // 已有学生记录
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockApplication);

      await expect(enrollmentManagementService.createStudentRecord(applicationId))
        .rejects.toThrow('该申请已创建学生记录');
    });

    it('应该生成唯一的学生编号', async () => {
      const studentNumber1 = await enrollmentManagementService.generateStudentNumber();
      const studentNumber2 = await enrollmentManagementService.generateStudentNumber();

      expect(studentNumber1).toMatch(/^STU\d{9}$/);
      expect(studentNumber2).toMatch(/^STU\d{9}$/);
      expect(studentNumber1).not.toBe(studentNumber2);
    });
  });

  describe('getApplications', () => {
    it('应该获取申请列表', async () => {
      const filters = {
        kindergartenId: 1,
        status: 'submitted',
        page: 1,
        pageSize: 10
      };

      const mockApplications = [
        {
          id: 1,
          applicationNumber: 'APP202400001',
          status: 'submitted',
          studentInfo: { name: '张小明' }
        },
        {
          id: 2,
          applicationNumber: 'APP202400002',
          status: 'submitted',
          studentInfo: { name: '李小红' }
        }
      ];

      mockEnrollmentApplication.findAll.mockResolvedValue(mockApplications);
      mockEnrollmentApplication.count.mockResolvedValue(25);

      const result = await enrollmentManagementService.getApplications(filters);

      expect(result).toHaveProperty('applications');
      expect(result).toHaveProperty('pagination');
      expect(result.applications).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 10,
        total: 25,
        totalPages: 3
      });
    });

    it('应该支持多种筛选条件', async () => {
      const filters = {
        kindergartenId: 1,
        status: ['submitted', 'under_review'],
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        studentName: '张',
        parentPhone: '138'
      };

      await enrollmentManagementService.getApplications(filters);

      expect(mockEnrollmentApplication.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            kindergartenId: 1,
            status: { [expect.any(Symbol)]: ['submitted', 'under_review'] }
          })
        })
      );
    });

    it('应该支持排序', async () => {
      const filters = {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      await enrollmentManagementService.getApplications(filters);

      expect(mockEnrollmentApplication.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['createdAt', 'DESC']]
        })
      );
    });
  });

  describe('getApplicationStatistics', () => {
    it('应该获取申请统计信息', async () => {
      const kindergartenId = 1;
      const timeRange = {
        start: '2024-01-01',
        end: '2024-12-31'
      };

      const mockStats = [
        { status: 'submitted', count: 50 },
        { status: 'under_review', count: 20 },
        { status: 'approved', count: 80 },
        { status: 'rejected', count: 15 }
      ];

      mockSequelize.query.mockResolvedValue([mockStats]);

      const result = await enrollmentManagementService.getApplicationStatistics(kindergartenId, timeRange);

      expect(result).toHaveProperty('totalApplications', 165);
      expect(result).toHaveProperty('statusBreakdown');
      expect(result).toHaveProperty('approvalRate');
      expect(result.statusBreakdown).toEqual({
        submitted: 50,
        under_review: 20,
        approved: 80,
        rejected: 15
      });
      expect(result.approvalRate).toBeCloseTo(0.842, 3); // 80/(80+15)
    });

    it('应该计算月度趋势', async () => {
      const kindergartenId = 1;
      const mockMonthlyData = [
        { month: '2024-01', applications: 20, approvals: 15 },
        { month: '2024-02', applications: 25, approvals: 20 },
        { month: '2024-03', applications: 30, approvals: 25 }
      ];

      mockSequelize.query.mockResolvedValue([mockMonthlyData]);

      const result = await enrollmentManagementService.getMonthlyTrends(kindergartenId);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        month: '2024-01',
        applications: 20,
        approvals: 15,
        approvalRate: 0.75
      });
    });
  });

  describe('sendNotifications', () => {
    it('应该发送报名确认通知', async () => {
      const application = {
        id: 1,
        applicationNumber: 'APP202400001',
        studentInfo: { name: '张小明' },
        parentInfo: {
          father: {
            name: '张爸爸',
            email: 'father@example.com',
            phone: '13800138001'
          }
        }
      };

      mockEmailService.sendEnrollmentConfirmation.mockResolvedValue(undefined);
      mockSMSService.sendEnrollmentNotification.mockResolvedValue(undefined);

      await enrollmentManagementService.sendEnrollmentConfirmation(application);

      expect(mockEmailService.sendEnrollmentConfirmation).toHaveBeenCalledWith(
        'father@example.com',
        expect.objectContaining({
          studentName: '张小明',
          applicationNumber: 'APP202400001'
        })
      );
      expect(mockSMSService.sendEnrollmentNotification).toHaveBeenCalledWith(
        '13800138001',
        expect.stringContaining('报名申请已提交成功')
      );
    });

    it('应该发送审核结果通知', async () => {
      const application = {
        id: 1,
        status: 'approved',
        studentInfo: { name: '张小明' },
        parentInfo: { father: { email: 'father@example.com' } },
        reviewNotes: '恭喜您的孩子被录取'
      };

      await enrollmentManagementService.sendReviewResultNotification(application);

      expect(mockEmailService.sendEnrollmentConfirmation).toHaveBeenCalled();
    });

    it('应该批量发送提醒通知', async () => {
      const applications = [
        { id: 1, parentInfo: { father: { email: 'parent1@example.com' } } },
        { id: 2, parentInfo: { mother: { email: 'parent2@example.com' } } }
      ];

      mockEnrollmentApplication.findAll.mockResolvedValue(applications);
      mockEmailService.sendEnrollmentReminder.mockResolvedValue(undefined);

      const result = await enrollmentManagementService.sendBatchReminders({
        status: 'submitted',
        daysOverdue: 7
      });

      expect(result).toHaveProperty('sent', 2);
      expect(result).toHaveProperty('failed', 0);
      expect(mockEmailService.sendEnrollmentReminder).toHaveBeenCalledTimes(2);
    });
  });

  describe('validation and business rules', () => {
    it('应该验证学生年龄要求', async () => {
      const birthDate = '2022-01-01'; // 太小
      const kindergartenId = 1;

      const isValid = await enrollmentManagementService.validateStudentAge(birthDate, kindergartenId);

      expect(isValid).toBe(false);
    });

    it('应该验证报名时间窗口', async () => {
      const kindergartenId = 1;
      const mockKindergarten = {
        id: 1,
        enrollmentPeriod: {
          start: '2024-03-01',
          end: '2024-05-31'
        }
      };

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);

      // 在报名期内
      const validDate = new Date('2024-04-15');
      const isValidTime = await enrollmentManagementService.validateEnrollmentPeriod(kindergartenId, validDate);
      expect(isValidTime).toBe(true);

      // 在报名期外
      const invalidDate = new Date('2024-06-15');
      const isInvalidTime = await enrollmentManagementService.validateEnrollmentPeriod(kindergartenId, invalidDate);
      expect(isInvalidTime).toBe(false);
    });

    it('应该验证必需文件上传', async () => {
      const applicationData = {
        documents: {
          birthCertificate: 'file1.pdf',
          vaccinationRecord: 'file2.pdf',
          parentId: 'file3.pdf'
        }
      };

      const requiredDocuments = ['birthCertificate', 'vaccinationRecord', 'parentId'];
      const isValid = await enrollmentManagementService.validateRequiredDocuments(
        applicationData.documents,
        requiredDocuments
      );

      expect(isValid).toBe(true);

      // 缺少文件
      const incompleteDocuments = {
        birthCertificate: 'file1.pdf'
        // 缺少其他文件
      };

      const isIncomplete = await enrollmentManagementService.validateRequiredDocuments(
        incompleteDocuments,
        requiredDocuments
      );

      expect(isIncomplete).toBe(false);
    });
  });

  describe('error handling', () => {
    it('应该处理数据库连接错误', async () => {
      const applicationData = { kindergartenId: 1 };
      
      mockKindergarten.findByPk.mockRejectedValue(new Error('数据库连接失败'));

      await expect(enrollmentManagementService.submitApplication(applicationData))
        .rejects.toThrow('数据库连接失败');

      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理邮件发送失败', async () => {
      const application = {
        parentInfo: { father: { email: 'invalid@email' } }
      };

      mockEmailService.sendEnrollmentConfirmation.mockRejectedValue(new Error('邮件发送失败'));

      // 邮件发送失败不应该影响主流程
      await expect(enrollmentManagementService.sendEnrollmentConfirmation(application))
        .resolves.not.toThrow();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('邮件发送失败'),
        expect.any(Object)
      );
    });

    it('应该处理并发申请冲突', async () => {
      const applicationData = {
        kindergartenId: 1,
        studentInfo: { idNumber: '110101202005151234' }
      };

      // 模拟并发情况下的唯一约束冲突
      const uniqueConstraintError = new Error('Unique constraint violation');
      uniqueConstraintError.name = 'SequelizeUniqueConstraintError';

      mockKindergarten.findByPk.mockResolvedValue({ id: 1, enrollmentOpen: true, availableSlots: 50 });
      mockEnrollmentApplication.findAll.mockResolvedValue([]); // 检查时没有重复
      mockEnrollmentApplication.create.mockRejectedValue(uniqueConstraintError); // 创建时冲突

      await expect(enrollmentManagementService.submitApplication(applicationData))
        .rejects.toThrow('该学生已有报名申请，请勿重复提交');
    });
  });

  describe('performance and optimization', () => {
    it('应该支持批量操作', async () => {
      const applications = [
        { id: 1, status: 'submitted' },
        { id: 2, status: 'submitted' },
        { id: 3, status: 'submitted' }
      ];

      const batchReviewData = {
        status: 'under_review',
        reviewerId: 1,
        reviewNotes: '批量转入审核'
      };

      mockEnrollmentApplication.findAll.mockResolvedValue(applications);
      mockEnrollmentApplication.update.mockResolvedValue([3]); // 影响3行

      const result = await enrollmentManagementService.batchUpdateApplications(
        [1, 2, 3],
        batchReviewData
      );

      expect(result).toHaveProperty('updated', 3);
      expect(mockEnrollmentApplication.update).toHaveBeenCalledWith(
        expect.objectContaining(batchReviewData),
        expect.objectContaining({
          where: { id: { [expect.any(Symbol)]: [1, 2, 3] } }
        })
      );
    });

    it('应该使用缓存优化查询', async () => {
      const kindergartenId = 1;
      
      // 第一次调用
      const stats1 = await enrollmentManagementService.getApplicationStatistics(kindergartenId);
      
      // 第二次调用应该使用缓存
      const stats2 = await enrollmentManagementService.getApplicationStatistics(kindergartenId);

      // 验证数据库只查询了一次
      expect(mockSequelize.query).toHaveBeenCalledTimes(1);
    });

    it('应该支持分页和流式处理大量数据', async () => {
      const largeDatasetSize = 10000;
      const batchSize = 100;

      // 模拟大量数据
      const mockLargeDataset = Array.from({ length: largeDatasetSize }, (_, i) => ({
        id: i + 1,
        applicationNumber: `APP${String(i + 1).padStart(9, '0')}`
      }));

      let processedCount = 0;
      const processor = (batch: any[]) => {
        processedCount += batch.length;
        return Promise.resolve();
      };

      await enrollmentManagementService.processApplicationsInBatches(
        { kindergartenId: 1 },
        processor,
        batchSize
      );

      // 验证批量处理逻辑
      expect(processedCount).toBeGreaterThan(0);
    });
  });
});
