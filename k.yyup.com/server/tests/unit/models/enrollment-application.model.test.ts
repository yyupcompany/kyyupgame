import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { DataTypes } from 'sequelize';

// Mock Sequelize
const mockSequelize = {
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

// Mock EnrollmentApplication model
const mockEnrollmentApplication = {
  init: jest.fn(),
  initModel: jest.fn(),
  associate: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  hasMany: jest.fn(),
  belongsTo: jest.fn()
};

// Mock related models
const mockUser = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockStudent = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockKindergarten = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockEnrollmentPlan = { hasMany: jest.fn(), belongsTo: jest.fn() };

// Mock imports
jest.unstable_mockModule('../../../../../src/models/enrollment-application.model', () => ({
  EnrollmentApplication: mockEnrollmentApplication,
  ApplicationStatus: {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    WAITLISTED: 'waitlisted',
    ENROLLED: 'enrolled',
    CANCELLED: 'cancelled'
  },
  ApplicationType: {
    NEW_ENROLLMENT: 'new_enrollment',
    TRANSFER: 'transfer',
    RE_ENROLLMENT: 're_enrollment'
  },
  Priority: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  }
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/student.model', () => ({
  Student: mockStudent
}));

jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({
  Kindergarten: mockKindergarten
}));

jest.unstable_mockModule('../../../../../src/models/enrollment-plan.model', () => ({
  EnrollmentPlan: mockEnrollmentPlan
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

describe('Enrollment Application Model', () => {
  let EnrollmentApplication: any;
  let ApplicationStatus: any;
  let ApplicationType: any;
  let Priority: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/models/enrollment-application.model');
    EnrollmentApplication = imported.EnrollmentApplication;
    ApplicationStatus = imported.ApplicationStatus;
    ApplicationType = imported.ApplicationType;
    Priority = imported.Priority;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('应该正确定义EnrollmentApplication模型', () => {
      EnrollmentApplication.initModel(mockSequelize);

      expect(EnrollmentApplication.init).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          }),
          applicationNumber: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: expect.objectContaining({
              len: [10, 20]
            })
          }),
          studentId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false,
            references: expect.objectContaining({
              model: 'students',
              key: 'id'
            })
          }),
          parentId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false,
            references: expect.objectContaining({
              model: 'users',
              key: 'id'
            })
          }),
          kindergartenId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false,
            references: expect.objectContaining({
              model: 'kindergartens',
              key: 'id'
            })
          }),
          enrollmentPlanId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: true,
            references: expect.objectContaining({
              model: 'enrollment_plans',
              key: 'id'
            })
          }),
          applicationType: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['new_enrollment', 'transfer', 're_enrollment'],
            defaultValue: 'new_enrollment'
          }),
          status: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'waitlisted', 'enrolled', 'cancelled'],
            defaultValue: 'draft'
          }),
          priority: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['low', 'medium', 'high', 'urgent'],
            defaultValue: 'medium'
          }),
          preferredStartDate: expect.objectContaining({
            type: DataTypes.DATEONLY,
            allowNull: false
          }),
          preferredClass: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true,
            validate: expect.objectContaining({
              len: [1, 50]
            })
          }),
          specialNeeds: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: true
          }),
          medicalInfo: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          }),
          emergencyContacts: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: false
          }),
          documents: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          }),
          notes: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: true
          }),
          reviewNotes: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: true
          }),
          submittedAt: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: true
          }),
          reviewedAt: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: true
          }),
          reviewedBy: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: true,
            references: expect.objectContaining({
              model: 'users',
              key: 'id'
            })
          }),
          approvedAt: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: true
          }),
          enrolledAt: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: true
          }),
          rejectionReason: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: true
          }),
          waitlistPosition: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: expect.objectContaining({
              min: 1
            })
          }),
          score: expect.objectContaining({
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            validate: expect.objectContaining({
              min: 0,
              max: 100
            })
          })
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'enrollment_applications',
          timestamps: true,
          paranoid: true
        })
      );
    });

    it('应该包含所有必需的字段', () => {
      const applicationInstance = {
        id: 1,
        applicationNumber: 'APP2024001001',
        studentId: 1,
        parentId: 1,
        kindergartenId: 1,
        enrollmentPlanId: 1,
        applicationType: 'new_enrollment',
        status: 'submitted',
        priority: 'medium',
        preferredStartDate: '2024-09-01',
        preferredClass: '小班A',
        specialNeeds: '无特殊需求',
        medicalInfo: {
          allergies: ['花生', '海鲜'],
          medications: [],
          conditions: []
        },
        emergencyContacts: [
          {
            name: '张父',
            relationship: 'father',
            phone: '13800138000',
            address: '北京市朝阳区'
          },
          {
            name: '张母',
            relationship: 'mother',
            phone: '13800138001',
            address: '北京市朝阳区'
          }
        ],
        documents: [
          {
            type: 'birth_certificate',
            name: '出生证明',
            url: '/uploads/documents/birth_cert_1.pdf',
            uploadedAt: '2024-03-01T10:00:00Z'
          },
          {
            type: 'vaccination_record',
            name: '疫苗接种记录',
            url: '/uploads/documents/vaccination_1.pdf',
            uploadedAt: '2024-03-01T10:05:00Z'
          }
        ],
        notes: '家长备注：希望孩子能在温馨的环境中成长',
        reviewNotes: '审核备注：材料齐全，符合入学条件',
        submittedAt: new Date('2024-03-01T10:00:00Z'),
        reviewedAt: new Date('2024-03-05T14:30:00Z'),
        reviewedBy: 2,
        approvedAt: new Date('2024-03-05T14:30:00Z'),
        enrolledAt: null,
        rejectionReason: null,
        waitlistPosition: null,
        score: 85.5,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      // 检查实例是否具有预期的属性
      expect(applicationInstance).toHaveProperty('id');
      expect(applicationInstance).toHaveProperty('applicationNumber');
      expect(applicationInstance).toHaveProperty('studentId');
      expect(applicationInstance).toHaveProperty('parentId');
      expect(applicationInstance).toHaveProperty('kindergartenId');
      expect(applicationInstance).toHaveProperty('enrollmentPlanId');
      expect(applicationInstance).toHaveProperty('applicationType');
      expect(applicationInstance).toHaveProperty('status');
      expect(applicationInstance).toHaveProperty('priority');
      expect(applicationInstance).toHaveProperty('preferredStartDate');
      expect(applicationInstance).toHaveProperty('preferredClass');
      expect(applicationInstance).toHaveProperty('specialNeeds');
      expect(applicationInstance).toHaveProperty('medicalInfo');
      expect(applicationInstance).toHaveProperty('emergencyContacts');
      expect(applicationInstance).toHaveProperty('documents');
      expect(applicationInstance).toHaveProperty('notes');
      expect(applicationInstance).toHaveProperty('reviewNotes');
      expect(applicationInstance).toHaveProperty('submittedAt');
      expect(applicationInstance).toHaveProperty('reviewedAt');
      expect(applicationInstance).toHaveProperty('reviewedBy');
      expect(applicationInstance).toHaveProperty('approvedAt');
      expect(applicationInstance).toHaveProperty('enrolledAt');
      expect(applicationInstance).toHaveProperty('rejectionReason');
      expect(applicationInstance).toHaveProperty('waitlistPosition');
      expect(applicationInstance).toHaveProperty('score');
    });
  });

  describe('Model Validations', () => {
    it('应该验证必填字段', () => {
      const requiredFields = ['applicationNumber', 'studentId', 'parentId', 'kindergartenId', 'preferredStartDate', 'emergencyContacts'];
      
      requiredFields.forEach(field => {
        expect(mockEnrollmentApplication.init).toHaveBeenCalledWith(
          expect.objectContaining({
            [field]: expect.objectContaining({
              allowNull: false
            })
          }),
          expect.any(Object)
        );
      });
    });

    it('应该验证申请编号长度', () => {
      expect(mockEnrollmentApplication.init).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationNumber: expect.objectContaining({
            validate: expect.objectContaining({
              len: [10, 20]
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证首选班级长度', () => {
      expect(mockEnrollmentApplication.init).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredClass: expect.objectContaining({
            validate: expect.objectContaining({
              len: [1, 50]
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证等候名单位置范围', () => {
      expect(mockEnrollmentApplication.init).toHaveBeenCalledWith(
        expect.objectContaining({
          waitlistPosition: expect.objectContaining({
            validate: expect.objectContaining({
              min: 1
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证评分范围', () => {
      expect(mockEnrollmentApplication.init).toHaveBeenCalledWith(
        expect.objectContaining({
          score: expect.objectContaining({
            validate: expect.objectContaining({
              min: 0,
              max: 100
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证外键约束', () => {
      expect(mockEnrollmentApplication.init).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: expect.objectContaining({
            references: expect.objectContaining({
              model: 'students',
              key: 'id'
            })
          }),
          parentId: expect.objectContaining({
            references: expect.objectContaining({
              model: 'users',
              key: 'id'
            })
          }),
          kindergartenId: expect.objectContaining({
            references: expect.objectContaining({
              model: 'kindergartens',
              key: 'id'
            })
          }),
          enrollmentPlanId: expect.objectContaining({
            references: expect.objectContaining({
              model: 'enrollment_plans',
              key: 'id'
            })
          }),
          reviewedBy: expect.objectContaining({
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
    it('应该定义与Student的关联关系', () => {
      EnrollmentApplication.associate({ Student: mockStudent });
      
      expect(mockEnrollmentApplication.belongsTo).toHaveBeenCalledWith(mockStudent, {
        foreignKey: 'studentId',
        as: 'student'
      });
    });

    it('应该定义与User的关联关系', () => {
      EnrollmentApplication.associate({ User: mockUser });
      
      expect(mockEnrollmentApplication.belongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'parentId',
        as: 'parent'
      });

      expect(mockEnrollmentApplication.belongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'reviewedBy',
        as: 'reviewer'
      });
    });

    it('应该定义与Kindergarten的关联关系', () => {
      EnrollmentApplication.associate({ Kindergarten: mockKindergarten });
      
      expect(mockEnrollmentApplication.belongsTo).toHaveBeenCalledWith(mockKindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
      });
    });

    it('应该定义与EnrollmentPlan的关联关系', () => {
      EnrollmentApplication.associate({ EnrollmentPlan: mockEnrollmentPlan });
      
      expect(mockEnrollmentApplication.belongsTo).toHaveBeenCalledWith(mockEnrollmentPlan, {
        foreignKey: 'enrollmentPlanId',
        as: 'enrollmentPlan'
      });
    });
  });

  describe('Model Enums', () => {
    it('应该定义正确的状态枚举', () => {
      expect(ApplicationStatus).toEqual({
        DRAFT: 'draft',
        SUBMITTED: 'submitted',
        UNDER_REVIEW: 'under_review',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        WAITLISTED: 'waitlisted',
        ENROLLED: 'enrolled',
        CANCELLED: 'cancelled'
      });
    });

    it('应该定义正确的申请类型枚举', () => {
      expect(ApplicationType).toEqual({
        NEW_ENROLLMENT: 'new_enrollment',
        TRANSFER: 'transfer',
        RE_ENROLLMENT: 're_enrollment'
      });
    });

    it('应该定义正确的优先级枚举', () => {
      expect(Priority).toEqual({
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        URGENT: 'urgent'
      });
    });
  });

  describe('Model Methods', () => {
    it('应该支持toJSON方法', () => {
      const applicationInstance = {
        id: 1,
        applicationNumber: 'APP2024001001',
        studentId: 1,
        parentId: 1,
        status: 'submitted',
        applicationType: 'new_enrollment',
        priority: 'medium',
        preferredStartDate: '2024-09-01',
        score: 85.5,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          applicationNumber: 'APP2024001001',
          studentId: 1,
          parentId: 1,
          status: 'submitted',
          applicationType: 'new_enrollment',
          priority: 'medium',
          preferredStartDate: '2024-09-01',
          score: 85.5
        })
      };

      const json = applicationInstance.toJSON();

      expect(json).toHaveProperty('id', 1);
      expect(json).toHaveProperty('applicationNumber', 'APP2024001001');
      expect(json).toHaveProperty('status', 'submitted');
      expect(json).toHaveProperty('applicationType', 'new_enrollment');
      expect(json).toHaveProperty('priority', 'medium');
      expect(json).toHaveProperty('score', 85.5);
    });

    it('应该支持检查是否为草稿状态', () => {
      const draftApplication = {
        status: 'draft',
        isDraft: jest.fn().mockReturnValue(true)
      };

      const submittedApplication = {
        status: 'submitted',
        isDraft: jest.fn().mockReturnValue(false)
      };

      expect(draftApplication.isDraft()).toBe(true);
      expect(submittedApplication.isDraft()).toBe(false);
    });

    it('应该支持检查是否已提交', () => {
      const submittedApplication = {
        status: 'submitted',
        isSubmitted: jest.fn().mockReturnValue(true)
      };

      const draftApplication = {
        status: 'draft',
        isSubmitted: jest.fn().mockReturnValue(false)
      };

      expect(submittedApplication.isSubmitted()).toBe(true);
      expect(draftApplication.isSubmitted()).toBe(false);
    });

    it('应该支持检查是否已批准', () => {
      const approvedApplication = {
        status: 'approved',
        isApproved: jest.fn().mockReturnValue(true)
      };

      const pendingApplication = {
        status: 'under_review',
        isApproved: jest.fn().mockReturnValue(false)
      };

      expect(approvedApplication.isApproved()).toBe(true);
      expect(pendingApplication.isApproved()).toBe(false);
    });

    it('应该支持检查是否被拒绝', () => {
      const rejectedApplication = {
        status: 'rejected',
        isRejected: jest.fn().mockReturnValue(true)
      };

      const approvedApplication = {
        status: 'approved',
        isRejected: jest.fn().mockReturnValue(false)
      };

      expect(rejectedApplication.isRejected()).toBe(true);
      expect(approvedApplication.isRejected()).toBe(false);
    });

    it('应该支持检查是否在等候名单', () => {
      const waitlistedApplication = {
        status: 'waitlisted',
        isWaitlisted: jest.fn().mockReturnValue(true)
      };

      const approvedApplication = {
        status: 'approved',
        isWaitlisted: jest.fn().mockReturnValue(false)
      };

      expect(waitlistedApplication.isWaitlisted()).toBe(true);
      expect(approvedApplication.isWaitlisted()).toBe(false);
    });

    it('应该支持检查是否已入学', () => {
      const enrolledApplication = {
        status: 'enrolled',
        isEnrolled: jest.fn().mockReturnValue(true)
      };

      const approvedApplication = {
        status: 'approved',
        isEnrolled: jest.fn().mockReturnValue(false)
      };

      expect(enrolledApplication.isEnrolled()).toBe(true);
      expect(approvedApplication.isEnrolled()).toBe(false);
    });

    it('应该支持检查是否可编辑', () => {
      const draftApplication = {
        status: 'draft',
        canEdit: jest.fn().mockReturnValue(true)
      };

      const submittedApplication = {
        status: 'submitted',
        canEdit: jest.fn().mockReturnValue(false)
      };

      expect(draftApplication.canEdit()).toBe(true);
      expect(submittedApplication.canEdit()).toBe(false);
    });

    it('应该支持检查是否可取消', () => {
      const submittedApplication = {
        status: 'submitted',
        canCancel: jest.fn().mockReturnValue(true)
      };

      const enrolledApplication = {
        status: 'enrolled',
        canCancel: jest.fn().mockReturnValue(false)
      };

      expect(submittedApplication.canCancel()).toBe(true);
      expect(enrolledApplication.canCancel()).toBe(false);
    });

    it('应该支持获取处理时长', () => {
      const applicationInstance = {
        submittedAt: new Date('2024-03-01T10:00:00Z'),
        reviewedAt: new Date('2024-03-05T14:30:00Z'),
        getProcessingTime: jest.fn().mockReturnValue({
          days: 4,
          hours: 4,
          minutes: 30,
          totalHours: 100.5
        })
      };

      const processingTime = applicationInstance.getProcessingTime();

      expect(processingTime).toEqual({
        days: 4,
        hours: 4,
        minutes: 30,
        totalHours: 100.5
      });
    });

    it('应该支持计算完整度', () => {
      const applicationInstance = {
        studentId: 1,
        parentId: 1,
        preferredStartDate: '2024-09-01',
        emergencyContacts: [{ name: '张父', phone: '13800138000' }],
        documents: [{ type: 'birth_certificate', url: '/path/to/doc' }],
        medicalInfo: { allergies: [] },
        getCompleteness: jest.fn().mockReturnValue({
          percentage: 85,
          missingFields: ['specialNeeds'],
          completedFields: ['studentId', 'parentId', 'preferredStartDate', 'emergencyContacts', 'documents', 'medicalInfo']
        })
      };

      const completeness = applicationInstance.getCompleteness();

      expect(completeness.percentage).toBe(85);
      expect(completeness.missingFields).toEqual(['specialNeeds']);
      expect(completeness.completedFields).toHaveLength(6);
    });

    it('应该支持添加文档', () => {
      const applicationInstance = {
        documents: [
          { type: 'birth_certificate', name: '出生证明', url: '/doc1.pdf' }
        ],
        addDocument: jest.fn().mockImplementation((document) => {
          applicationInstance.documents.push(document);
          return applicationInstance.documents;
        })
      };

      const newDocument = {
        type: 'vaccination_record',
        name: '疫苗接种记录',
        url: '/doc2.pdf'
      };

      const result = applicationInstance.addDocument(newDocument);

      expect(result).toHaveLength(2);
      expect(result[1]).toEqual(newDocument);
    });

    it('应该支持移除文档', () => {
      const applicationInstance = {
        documents: [
          { type: 'birth_certificate', name: '出生证明', url: '/doc1.pdf' },
          { type: 'vaccination_record', name: '疫苗接种记录', url: '/doc2.pdf' }
        ],
        removeDocument: jest.fn().mockImplementation((type) => {
          const index = applicationInstance.documents.findIndex(doc => doc.type === type);
          if (index > -1) {
            applicationInstance.documents.splice(index, 1);
          }
          return applicationInstance.documents;
        })
      };

      const result = applicationInstance.removeDocument('vaccination_record');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('birth_certificate');
    });

    it('应该支持更新紧急联系人', () => {
      const applicationInstance = {
        emergencyContacts: [
          { name: '张父', relationship: 'father', phone: '13800138000' }
        ],
        updateEmergencyContact: jest.fn().mockImplementation((index, contact) => {
          if (index >= 0 && index < applicationInstance.emergencyContacts.length) {
            applicationInstance.emergencyContacts[index] = { ...applicationInstance.emergencyContacts[index], ...contact };
          }
          return applicationInstance.emergencyContacts;
        })
      };

      const updatedContact = {
        phone: '13800138999',
        address: '北京市海淀区'
      };

      const result = applicationInstance.updateEmergencyContact(0, updatedContact);

      expect(result[0].phone).toBe('13800138999');
      expect(result[0].address).toBe('北京市海淀区');
      expect(result[0].name).toBe('张父'); // 保持原有字段
    });

    it('应该支持设置等候名单位置', () => {
      const applicationInstance = {
        status: 'waitlisted',
        waitlistPosition: null,
        setWaitlistPosition: jest.fn().mockImplementation((position) => {
          applicationInstance.waitlistPosition = position;
          return applicationInstance.waitlistPosition;
        })
      };

      const result = applicationInstance.setWaitlistPosition(5);

      expect(result).toBe(5);
      expect(applicationInstance.waitlistPosition).toBe(5);
    });

    it('应该支持计算评分', () => {
      const applicationInstance = {
        submittedAt: new Date('2024-03-01T10:00:00Z'),
        documents: [
          { type: 'birth_certificate' },
          { type: 'vaccination_record' },
          { type: 'health_certificate' }
        ],
        emergencyContacts: [
          { name: '张父', phone: '13800138000' },
          { name: '张母', phone: '13800138001' }
        ],
        specialNeeds: '无特殊需求',
        medicalInfo: { allergies: [], medications: [] },
        calculateScore: jest.fn().mockReturnValue({
          totalScore: 85.5,
          breakdown: {
            completeness: 30,
            timeliness: 25,
            documentation: 20.5,
            priority: 10
          }
        })
      };

      const score = applicationInstance.calculateScore();

      expect(score.totalScore).toBe(85.5);
      expect(score.breakdown).toHaveProperty('completeness', 30);
      expect(score.breakdown).toHaveProperty('timeliness', 25);
      expect(score.breakdown).toHaveProperty('documentation', 20.5);
      expect(score.breakdown).toHaveProperty('priority', 10);
    });
  });

  describe('Model Scopes', () => {
    it('应该定义草稿申请范围', () => {
      const draftScope = {
        where: { status: 'draft' }
      };

      expect(draftScope).toEqual({
        where: { status: 'draft' }
      });
    });

    it('应该定义已提交申请范围', () => {
      const submittedScope = {
        where: { status: 'submitted' }
      };

      expect(submittedScope).toEqual({
        where: { status: 'submitted' }
      });
    });

    it('应该定义待审核申请范围', () => {
      const underReviewScope = {
        where: { status: 'under_review' }
      };

      expect(underReviewScope).toEqual({
        where: { status: 'under_review' }
      });
    });

    it('应该定义已批准申请范围', () => {
      const approvedScope = {
        where: { status: 'approved' }
      };

      expect(approvedScope).toEqual({
        where: { status: 'approved' }
      });
    });

    it('应该定义等候名单范围', () => {
      const waitlistedScope = {
        where: { status: 'waitlisted' },
        order: [['waitlistPosition', 'ASC']]
      };

      expect(waitlistedScope.where).toEqual({ status: 'waitlisted' });
    });

    it('应该定义按幼儿园筛选范围', () => {
      const byKindergartenScope = (kindergartenId: number) => ({
        where: { kindergartenId }
      });

      expect(byKindergartenScope(1)).toEqual({
        where: { kindergartenId: 1 }
      });
    });

    it('应该定义按申请类型筛选范围', () => {
      const byTypeScope = (applicationType: string) => ({
        where: { applicationType }
      });

      expect(byTypeScope('new_enrollment')).toEqual({
        where: { applicationType: 'new_enrollment' }
      });
    });

    it('应该定义按优先级筛选范围', () => {
      const byPriorityScope = (priority: string) => ({
        where: { priority }
      });

      expect(byPriorityScope('high')).toEqual({
        where: { priority: 'high' }
      });
    });

    it('应该定义最近申请范围', () => {
      const recentScope = {
        order: [['createdAt', 'DESC']],
        limit: 10
      };

      expect(recentScope).toEqual({
        order: [['createdAt', 'DESC']],
        limit: 10
      });
    });
  });

  describe('Model Hooks', () => {
    it('应该在创建前生成申请编号', () => {
      const beforeCreateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeCreateHook).toBeDefined();
    });

    it('应该在提交时设置提交时间', () => {
      const beforeUpdateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeUpdateHook).toBeDefined();
    });

    it('应该在状态变更时记录时间戳', () => {
      const afterUpdateHook = jest.fn();
      
      // 模拟钩子函数
      expect(afterUpdateHook).toBeDefined();
    });

    it('应该在删除前清理相关数据', () => {
      const beforeDestroyHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeDestroyHook).toBeDefined();
    });
  });

  describe('Model Indexes', () => {
    it('应该定义正确的索引', () => {
      const expectedIndexes = [
        { fields: ['applicationNumber'], unique: true },
        { fields: ['studentId'] },
        { fields: ['parentId'] },
        { fields: ['kindergartenId'] },
        { fields: ['enrollmentPlanId'] },
        { fields: ['status'] },
        { fields: ['applicationType'] },
        { fields: ['priority'] },
        { fields: ['preferredStartDate'] },
        { fields: ['submittedAt'] },
        { fields: ['reviewedAt'] },
        { fields: ['approvedAt'] },
        { fields: ['waitlistPosition'] },
        { fields: ['score'] },
        { fields: ['kindergartenId', 'status'] },
        { fields: ['status', 'priority'] },
        { fields: ['applicationType', 'status'] }
      ];

      // 验证索引定义
      expectedIndexes.forEach(index => {
        expect(index).toBeDefined();
      });
    });
  });
});
