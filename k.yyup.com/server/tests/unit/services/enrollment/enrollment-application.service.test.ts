// Mock dependencies
jest.mock('../../../../../src/init');
jest.mock('../../../../../src/models/enrollment-application.model');
jest.mock('../../../../../src/models/enrollment-application-material.model');
jest.mock('../../../../../src/models/file-storage.model');
jest.mock('../../../../../src/models/parent-student-relation.model');
jest.mock('../../../../../src/models/user.model');
jest.mock('../../../../../src/models/enrollment-plan.model');
jest.mock('../../../../../src/utils/apiError');

import { Transaction, Op, InferCreationAttributes } from 'sequelize';
import { vi } from 'vitest'
import { sequelize } from '../../../../../src/init';
import { EnrollmentApplicationService } from '../../../../../src/services/enrollment/enrollment-application.service';
import { EnrollmentApplication, ApplicationStatus } from '../../../../../src/models/enrollment-application.model';
import { EnrollmentApplicationMaterial, MaterialStatus } from '../../../../../src/models/enrollment-application-material.model';
import { FileStorage } from '../../../../../src/models/file-storage.model';
import { ParentStudentRelation } from '../../../../../src/models/parent-student-relation.model';
import { User } from '../../../../../src/models/user.model';
import { EnrollmentPlan, Semester } from '../../../../../src/models/enrollment-plan.model';
import { ApiError } from '../../../../../src/utils/apiError';

// Mock implementations
const mockSequelize = {
  transaction: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockEnrollmentApplication = {
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockEnrollmentApplicationMaterial = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  bulkCreate: jest.fn()
};

const mockFileStorage = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockParentStudentRelation = {
  findByPk: jest.fn(),
  findOne: jest.fn()
};

const mockUser = {
  findByPk: jest.fn()
};

const mockEnrollmentPlan = {
  findByPk: jest.fn(),
  findOne: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;
(EnrollmentApplication as any) = mockEnrollmentApplication;
(EnrollmentApplicationMaterial as any) = mockEnrollmentApplicationMaterial;
(FileStorage as any) = mockFileStorage;
(ParentStudentRelation as any) = mockParentStudentRelation;
(User as any) = mockUser;
(EnrollmentPlan as any) = mockEnrollmentPlan;


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

describe('Enrollment Application Service', () => {
  let enrollmentApplicationService: EnrollmentApplicationService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    enrollmentApplicationService = new EnrollmentApplicationService();
  });

  describe('createApplication', () => {
    it('应该成功创建报名申请', async () => {
      const applicationData: InferCreationAttributes<EnrollmentApplication> = {
        parentId: 1,
        planId: 1,
        studentName: '张小明',
        studentGender: '男',
        studentBirthDate: new Date('2020-05-15'),
        studentIdCard: '110101202005150001',
        parentName: '张父',
        parentPhone: '13800138000',
        parentEmail: 'parent@example.com',
        homeAddress: '北京市朝阳区',
        emergencyContact: '张母',
        emergencyPhone: '13900139000',
        specialNeeds: '无',
        status: ApplicationStatus.PENDING
      };

      const userId = 1;

      const mockParent = {
        id: 1,
        parentName: '张父',
        phone: '13800138000'
      };

      const mockPlan = {
        id: 1,
        planName: '2024年春季招生',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31')
      };

      const mockCreatedApplication = {
        id: 1,
        ...applicationData,
        applicationNumber: 'APP202401001',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockParentStudentRelation.findByPk.mockResolvedValue(mockParent);
      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);
      mockEnrollmentApplication.create.mockResolvedValue(mockCreatedApplication);

      const result = await enrollmentApplicationService.createApplication(applicationData, userId);

      expect(mockParentStudentRelation.findByPk).toHaveBeenCalledWith(1);
      expect(mockEnrollmentPlan.findByPk).toHaveBeenCalledWith(1);
      expect(mockEnrollmentApplication.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parentId: 1,
          planId: 1,
          studentName: '张小明',
          studentGender: '男',
          parentName: '张父',
          parentPhone: '13800138000'
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedApplication);
    });

    it('应该处理家长不存在', async () => {
      const applicationData: InferCreationAttributes<EnrollmentApplication> = {
        parentId: 999,
        planId: 1,
        studentName: '张小明',
        studentGender: '男',
        studentBirthDate: new Date('2020-05-15'),
        parentName: '张父',
        parentPhone: '13800138000',
        homeAddress: '北京市朝阳区',
        status: ApplicationStatus.PENDING
      };

      const userId = 1;

      mockParentStudentRelation.findByPk.mockResolvedValue(null);

      await expect(enrollmentApplicationService.createApplication(applicationData, userId))
        .rejects.toThrow('家长信息不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockEnrollmentApplication.create).not.toHaveBeenCalled();
    });

    it('应该处理招生计划不存在', async () => {
      const applicationData: InferCreationAttributes<EnrollmentApplication> = {
        parentId: 1,
        planId: 999,
        studentName: '张小明',
        studentGender: '男',
        studentBirthDate: new Date('2020-05-15'),
        parentName: '张父',
        parentPhone: '13800138000',
        homeAddress: '北京市朝阳区',
        status: ApplicationStatus.PENDING
      };

      const userId = 1;

      const mockParent = {
        id: 1,
        parentName: '张父'
      };

      mockParentStudentRelation.findByPk.mockResolvedValue(mockParent);
      mockEnrollmentPlan.findByPk.mockResolvedValue(null);

      await expect(enrollmentApplicationService.createApplication(applicationData, userId))
        .rejects.toThrow('招生计划不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockEnrollmentApplication.create).not.toHaveBeenCalled();
    });

    it('应该处理重复申请', async () => {
      const applicationData: InferCreationAttributes<EnrollmentApplication> = {
        parentId: 1,
        planId: 1,
        studentName: '张小明',
        studentGender: '男',
        studentBirthDate: new Date('2020-05-15'),
        parentName: '张父',
        parentPhone: '13800138000',
        homeAddress: '北京市朝阳区',
        status: ApplicationStatus.PENDING
      };

      const userId = 1;

      const mockParent = {
        id: 1,
        parentName: '张父'
      };

      const mockPlan = {
        id: 1,
        planName: '2024年春季招生',
        status: 'active'
      };

      const existingApplication = {
        id: 1,
        parentId: 1,
        planId: 1,
        studentName: '张小明',
        status: ApplicationStatus.PENDING
      };

      mockParentStudentRelation.findByPk.mockResolvedValue(mockParent);
      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);
      mockEnrollmentApplication.findOne.mockResolvedValue(existingApplication);

      await expect(enrollmentApplicationService.createApplication(applicationData, userId))
        .rejects.toThrow('该学生已存在报名申请');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockEnrollmentApplication.create).not.toHaveBeenCalled();
    });

    it('应该处理数据库创建失败', async () => {
      const applicationData: InferCreationAttributes<EnrollmentApplication> = {
        parentId: 1,
        planId: 1,
        studentName: '张小明',
        studentGender: '男',
        studentBirthDate: new Date('2020-05-15'),
        parentName: '张父',
        parentPhone: '13800138000',
        homeAddress: '北京市朝阳区',
        status: ApplicationStatus.PENDING
      };

      const userId = 1;

      const mockParent = {
        id: 1,
        parentName: '张父'
      };

      const mockPlan = {
        id: 1,
        planName: '2024年春季招生',
        status: 'active'
      };

      mockParentStudentRelation.findByPk.mockResolvedValue(mockParent);
      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);
      mockEnrollmentApplication.findOne.mockResolvedValue(null);
      mockEnrollmentApplication.create.mockRejectedValue(new Error('Database error'));

      await expect(enrollmentApplicationService.createApplication(applicationData, userId))
        .rejects.toThrow('Database error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该生成申请编号', async () => {
      const applicationData: InferCreationAttributes<EnrollmentApplication> = {
        parentId: 1,
        planId: 1,
        studentName: '张小明',
        studentGender: '男',
        studentBirthDate: new Date('2020-05-15'),
        parentName: '张父',
        parentPhone: '13800138000',
        homeAddress: '北京市朝阳区',
        status: ApplicationStatus.PENDING
      };

      const userId = 1;

      const mockParent = {
        id: 1,
        parentName: '张父'
      };

      const mockPlan = {
        id: 1,
        planName: '2024年春季招生',
        status: 'active'
      };

      const mockCreatedApplication = {
        id: 1,
        ...applicationData,
        applicationNumber: expect.stringMatching(/^APP\d{9}$/),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockParentStudentRelation.findByPk.mockResolvedValue(mockParent);
      mockEnrollmentPlan.findByPk.mockResolvedValue(mockPlan);
      mockEnrollmentApplication.findOne.mockResolvedValue(null);
      mockEnrollmentApplication.create.mockResolvedValue(mockCreatedApplication);

      const result = await enrollmentApplicationService.createApplication(applicationData, userId);

      expect(mockEnrollmentApplication.create).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationNumber: expect.stringMatching(/^APP\d{9}$/)
        }),
        { transaction: mockTransaction }
      );
      expect(result.applicationNumber).toMatch(/^APP\d{9}$/);
    });
  });

  describe('getApplicationById', () => {
    it('应该成功获取申请详情', async () => {
      const applicationId = 1;
      const mockApplication = {
        id: 1,
        applicationNumber: 'APP202401001',
        studentName: '张小明',
        studentGender: '男',
        parentName: '张父',
        parentPhone: '13800138000',
        status: ApplicationStatus.PENDING,
        parent: {
          id: 1,
          parentName: '张父',
          phone: '13800138000'
        },
        plan: {
          id: 1,
          planName: '2024年春季招生',
          semester: Semester.SPRING
        },
        materials: [
          {
            id: 1,
            materialType: '身份证',
            status: MaterialStatus.PENDING,
            file: {
              id: 1,
              fileName: 'id_card.jpg',
              filePath: '/uploads/id_card.jpg'
            }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockApplication);

      const result = await enrollmentApplicationService.getApplicationById(applicationId);

      expect(mockEnrollmentApplication.findByPk).toHaveBeenCalledWith(applicationId, {
        include: [
          {
            model: ParentStudentRelation,
            as: 'parent',
            attributes: ['id', 'parentName', 'phone', 'email']
          },
          {
            model: EnrollmentPlan,
            as: 'plan',
            attributes: ['id', 'planName', 'semester', 'startDate', 'endDate']
          },
          {
            model: EnrollmentApplicationMaterial,
            as: 'materials',
            include: [
              {
                model: FileStorage,
                as: 'file',
                attributes: ['id', 'fileName', 'filePath', 'fileSize']
              }
            ]
          }
        ]
      });
      expect(result).toEqual(mockApplication);
    });

    it('应该处理申请不存在', async () => {
      const applicationId = 999;
      mockEnrollmentApplication.findByPk.mockResolvedValue(null);

      const result = await enrollmentApplicationService.getApplicationById(applicationId);

      expect(result).toBeNull();
    });

    it('应该处理数据库查询错误', async () => {
      const applicationId = 1;
      const dbError = new Error('Database query failed');
      mockEnrollmentApplication.findByPk.mockRejectedValue(dbError);

      await expect(enrollmentApplicationService.getApplicationById(applicationId))
        .rejects.toThrow('Database query failed');
    });
  });

  describe('getApplications', () => {
    it('应该成功获取申请列表', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10,
        status: ApplicationStatus.PENDING,
        planId: 1,
        keyword: '张小明'
      };

      const mockApplications = [
        {
          id: 1,
          applicationNumber: 'APP202401001',
          studentName: '张小明',
          parentName: '张父',
          status: ApplicationStatus.PENDING,
          createdAt: new Date()
        },
        {
          id: 2,
          applicationNumber: 'APP202401002',
          studentName: '张小红',
          parentName: '张母',
          status: ApplicationStatus.PENDING,
          createdAt: new Date()
        }
      ];

      const mockResult = {
        rows: mockApplications,
        count: 2
      };

      mockEnrollmentApplication.findAndCountAll.mockResolvedValue(mockResult);

      const result = await enrollmentApplicationService.getApplications(queryParams);

      expect(mockEnrollmentApplication.findAndCountAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: ApplicationStatus.PENDING,
          planId: 1
        }),
        include: expect.any(Array),
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });

      expect(result).toEqual({
        totalItems: 2,
        data: mockApplications,
        totalPages: 1,
        currentPage: 1
      });
    });

    it('应该使用默认查询参数', async () => {
      const mockResult = {
        rows: [],
        count: 0
      };

      mockEnrollmentApplication.findAndCountAll.mockResolvedValue(mockResult);

      const result = await enrollmentApplicationService.getApplications({});

      expect(mockEnrollmentApplication.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Array),
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });

      expect(result).toEqual({
        totalItems: 0,
        data: [],
        totalPages: 0,
        currentPage: 0
      });
    });

    it('应该处理关键词搜索', async () => {
      const queryParams = {
        keyword: '张小明'
      };

      const mockResult = {
        rows: [],
        count: 0
      };

      mockEnrollmentApplication.findAndCountAll.mockResolvedValue(mockResult);

      await enrollmentApplicationService.getApplications(queryParams);

      expect(mockEnrollmentApplication.findAndCountAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          [Op.or]: [
            { studentName: { [Op.like]: '%张小明%' } },
            { parentName: { [Op.like]: '%张小明%' } },
            { applicationNumber: { [Op.like]: '%张小明%' } }
          ]
        }),
        include: expect.any(Array),
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
    });

    it('应该处理数据库查询错误', async () => {
      const queryParams = { page: 1, pageSize: 10 };
      const dbError = new Error('Database query failed');
      mockEnrollmentApplication.findAndCountAll.mockRejectedValue(dbError);

      await expect(enrollmentApplicationService.getApplications(queryParams))
        .rejects.toThrow('Database query failed');
    });
  });

  describe('updateApplicationStatus', () => {
    it('应该成功更新申请状态', async () => {
      const applicationId = 1;
      const newStatus = ApplicationStatus.APPROVED;
      const reviewComment = '申请材料齐全，符合入学条件';
      const userId = 1;

      const mockExistingApplication = {
        id: 1,
        applicationNumber: 'APP202401001',
        studentName: '张小明',
        status: ApplicationStatus.PENDING
      };

      const mockUpdatedApplication = {
        ...mockExistingApplication,
        status: ApplicationStatus.APPROVED,
        reviewComment: '申请材料齐全，符合入学条件',
        reviewedBy: 1,
        reviewedAt: new Date(),
        updatedAt: new Date()
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockExistingApplication);
      mockEnrollmentApplication.update.mockResolvedValue([1]); // 更新成功
      mockEnrollmentApplication.findByPk.mockResolvedValueOnce(mockUpdatedApplication); // 获取更新后的数据

      const result = await enrollmentApplicationService.updateApplicationStatus(
        applicationId,
        newStatus,
        reviewComment,
        userId
      );

      expect(mockEnrollmentApplication.findByPk).toHaveBeenCalledWith(applicationId, { transaction: mockTransaction });
      expect(mockEnrollmentApplication.update).toHaveBeenCalledWith(
        {
          status: ApplicationStatus.APPROVED,
          reviewComment: '申请材料齐全，符合入学条件',
          reviewedBy: 1,
          reviewedAt: expect.any(Date)
        },
        {
          where: { id: applicationId },
          transaction: mockTransaction
        }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedApplication);
    });

    it('应该处理申请不存在', async () => {
      const applicationId = 999;
      const newStatus = ApplicationStatus.APPROVED;
      const userId = 1;

      mockEnrollmentApplication.findByPk.mockResolvedValue(null);

      await expect(enrollmentApplicationService.updateApplicationStatus(applicationId, newStatus, '', userId))
        .rejects.toThrow('申请不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockEnrollmentApplication.update).not.toHaveBeenCalled();
    });

    it('应该处理无效的状态转换', async () => {
      const applicationId = 1;
      const newStatus = ApplicationStatus.PENDING; // 从已审批回到待审批
      const userId = 1;

      const mockApprovedApplication = {
        id: 1,
        applicationNumber: 'APP202401001',
        status: ApplicationStatus.APPROVED
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockApprovedApplication);

      await expect(enrollmentApplicationService.updateApplicationStatus(applicationId, newStatus, '', userId))
        .rejects.toThrow('无效的状态转换');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockEnrollmentApplication.update).not.toHaveBeenCalled();
    });

    it('应该处理数据库更新失败', async () => {
      const applicationId = 1;
      const newStatus = ApplicationStatus.APPROVED;
      const userId = 1;

      const mockExistingApplication = {
        id: 1,
        status: ApplicationStatus.PENDING
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockExistingApplication);
      mockEnrollmentApplication.update.mockRejectedValue(new Error('Database update failed'));

      await expect(enrollmentApplicationService.updateApplicationStatus(applicationId, newStatus, '', userId))
        .rejects.toThrow('Database update failed');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('deleteApplication', () => {
    it('应该成功删除申请', async () => {
      const applicationId = 1;

      const mockExistingApplication = {
        id: 1,
        applicationNumber: 'APP202401001',
        status: ApplicationStatus.DRAFT
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockExistingApplication);
      mockEnrollmentApplicationMaterial.destroy.mockResolvedValue(2); // 删除相关材料
      mockEnrollmentApplication.destroy.mockResolvedValue(1); // 删除申请

      const result = await enrollmentApplicationService.deleteApplication(applicationId);

      expect(mockEnrollmentApplication.findByPk).toHaveBeenCalledWith(applicationId, { transaction: mockTransaction });
      expect(mockEnrollmentApplicationMaterial.destroy).toHaveBeenCalledWith({
        where: { applicationId },
        transaction: mockTransaction
      });
      expect(mockEnrollmentApplication.destroy).toHaveBeenCalledWith({
        where: { id: applicationId },
        transaction: mockTransaction
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('应该处理申请不存在', async () => {
      const applicationId = 999;

      mockEnrollmentApplication.findByPk.mockResolvedValue(null);

      await expect(enrollmentApplicationService.deleteApplication(applicationId))
        .rejects.toThrow('申请不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockEnrollmentApplication.destroy).not.toHaveBeenCalled();
    });

    it('应该阻止删除已审批的申请', async () => {
      const applicationId = 1;

      const mockApprovedApplication = {
        id: 1,
        applicationNumber: 'APP202401001',
        status: ApplicationStatus.APPROVED
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockApprovedApplication);

      await expect(enrollmentApplicationService.deleteApplication(applicationId))
        .rejects.toThrow('已审批的申请无法删除');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockEnrollmentApplication.destroy).not.toHaveBeenCalled();
    });

    it('应该处理数据库删除失败', async () => {
      const applicationId = 1;

      const mockExistingApplication = {
        id: 1,
        status: ApplicationStatus.DRAFT
      };

      mockEnrollmentApplication.findByPk.mockResolvedValue(mockExistingApplication);
      mockEnrollmentApplicationMaterial.destroy.mockResolvedValue(0);
      mockEnrollmentApplication.destroy.mockRejectedValue(new Error('Database delete failed'));

      await expect(enrollmentApplicationService.deleteApplication(applicationId))
        .rejects.toThrow('Database delete failed');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
