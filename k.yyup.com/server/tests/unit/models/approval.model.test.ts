import { Approval, ApprovalType, ApprovalStatus, ApprovalUrgency } from '../../../src/models/approval.model';
import { vi } from 'vitest'
import { Sequelize } from 'sequelize';


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

describe('Approval Model', () => {
  let mockSequelize: jest.Mocked<Sequelize>;

  beforeEach(() => {
    mockSequelize = {
      define: jest.fn(),
      models: {},
    } as any;
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('should have correct model attributes', () => {
      expect(Approval).toBeDefined();
      expect(Approval).toBeInstanceOf(Function);
    });

    it('should initialize model correctly', () => {
      const mockDefine = jest.fn().mockReturnValue(Approval);
      mockSequelize.define = mockDefine;

      const modelInstance = (Approval as any)(mockSequelize);
      expect(modelInstance).toBeDefined();
    });
  });

  describe('Enums', () => {
    describe('ApprovalType', () => {
      it('should have correct enum values', () => {
        expect(ApprovalType.LEAVE).toBe('LEAVE');
        expect(ApprovalType.EXPENSE).toBe('EXPENSE');
        expect(ApprovalType.EVENT).toBe('EVENT');
        expect(ApprovalType.PURCHASE).toBe('PURCHASE');
        expect(ApprovalType.OTHER).toBe('OTHER');
      });

      it('should have all required approval types', () => {
        const approvalTypes = Object.values(ApprovalType);
        expect(approvalTypes).toHaveLength(5);
        expect(approvalTypes).toContain('LEAVE');
        expect(approvalTypes).toContain('EXPENSE');
        expect(approvalTypes).toContain('EVENT');
        expect(approvalTypes).toContain('PURCHASE');
        expect(approvalTypes).toContain('OTHER');
      });
    });

    describe('ApprovalStatus', () => {
      it('should have correct enum values', () => {
        expect(ApprovalStatus.PENDING).toBe('PENDING');
        expect(ApprovalStatus.APPROVED).toBe('APPROVED');
        expect(ApprovalStatus.REJECTED).toBe('REJECTED');
        expect(ApprovalStatus.WITHDRAWN).toBe('WITHDRAWN');
      });

      it('should have all required approval statuses', () => {
        const approvalStatuses = Object.values(ApprovalStatus);
        expect(approvalStatuses).toHaveLength(4);
        expect(approvalStatuses).toContain('PENDING');
        expect(approvalStatuses).toContain('APPROVED');
        expect(approvalStatuses).toContain('REJECTED');
        expect(approvalStatuses).toContain('WITHDRAWN');
      });
    });

    describe('ApprovalUrgency', () => {
      it('should have correct enum values', () => {
        expect(ApprovalUrgency.LOW).toBe('LOW');
        expect(ApprovalUrgency.MEDIUM).toBe('MEDIUM');
        expect(ApprovalUrgency.HIGH).toBe('HIGH');
        expect(ApprovalUrgency.URGENT).toBe('URGENT');
      });

      it('should have all required urgency levels', () => {
        const urgencyLevels = Object.values(ApprovalUrgency);
        expect(urgencyLevels).toHaveLength(4);
        expect(urgencyLevels).toContain('LOW');
        expect(urgencyLevels).toContain('MEDIUM');
        expect(urgencyLevels).toContain('HIGH');
        expect(urgencyLevels).toContain('URGENT');
      });
    });
  });

  describe('Model Attributes', () => {
    let modelInstance: Approval;

    beforeEach(() => {
      modelInstance = new Approval();
    });

    it('should have all required attributes', () => {
      expect(modelInstance).toHaveProperty('id');
      expect(modelInstance).toHaveProperty('title');
      expect(modelInstance).toHaveProperty('type');
      expect(modelInstance).toHaveProperty('status');
      expect(modelInstance).toHaveProperty('urgency');
      expect(modelInstance).toHaveProperty('requestedBy');
      expect(modelInstance).toHaveProperty('requestedAt');
      expect(modelInstance).toHaveProperty('createdAt');
      expect(modelInstance).toHaveProperty('updatedAt');
    });

    it('should have optional attributes', () => {
      expect(modelInstance).toHaveProperty('description');
      expect(modelInstance).toHaveProperty('requestAmount');
      expect(modelInstance).toHaveProperty('requestData');
      expect(modelInstance).toHaveProperty('attachments');
      expect(modelInstance).toHaveProperty('approvedBy');
      expect(modelInstance).toHaveProperty('kindergartenId');
      expect(modelInstance).toHaveProperty('comment');
      expect(modelInstance).toHaveProperty('approvedAt');
      expect(modelInstance).toHaveProperty('deadline');
      expect(modelInstance).toHaveProperty('relatedType');
      expect(modelInstance).toHaveProperty('relatedId');
      expect(modelInstance).toHaveProperty('workflow');
      expect(modelInstance).toHaveProperty('metadata');
    });

    it('should have correct default values', () => {
      expect(modelInstance.status).toBeUndefined();
      expect(modelInstance.urgency).toBeUndefined();
      expect(modelInstance.requestedAt).toBeUndefined();
    });

    it('should have association properties', () => {
      expect(modelInstance).toHaveProperty('requester');
      expect(modelInstance).toHaveProperty('approver');
      expect(modelInstance).toHaveProperty('kindergarten');
    });
  });

  describe('Model Initialization', () => {
    it('should initialize with correct configuration', () => {
      const mockDefine = jest.fn().mockReturnValue(Approval);
      mockSequelize.define = mockDefine;

      (Approval as any)(mockSequelize);

      expect(mockDefine).toHaveBeenCalledWith(
        'approvals',
        expect.objectContaining({
          id: expect.objectContaining({
            type: expect.any(Object),
            autoIncrement: true,
            primaryKey: true,
          }),
          title: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            comment: '审批标题',
          }),
          description: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            comment: '申请描述',
          }),
          type: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            comment: '审批类型',
          }),
          status: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: ApprovalStatus.PENDING,
            comment: '审批状态',
          }),
          urgency: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: ApprovalUrgency.MEDIUM,
            comment: '紧急程度',
          }),
          requestAmount: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            comment: '申请金额',
          }),
          requestData: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            comment: '申请数据',
          }),
          attachments: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            comment: '附件列表',
          }),
          requestedBy: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            references: expect.objectContaining({
              model: 'users',
              key: 'id',
            }),
            comment: '申请人ID',
          }),
          approvedBy: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            references: expect.objectContaining({
              model: 'users',
              key: 'id',
            }),
            comment: '审批人ID',
          }),
          kindergartenId: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            references: expect.objectContaining({
              model: 'kindergartens',
              key: 'id',
            }),
            comment: '幼儿园ID',
          }),
          comment: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            comment: '审批意见',
          }),
          approvedAt: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            comment: '审批时间',
          }),
          requestedAt: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: expect.any(Function),
            comment: '申请时间',
          }),
          deadline: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            comment: '处理截止时间',
          }),
          relatedType: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            comment: '关联对象类型',
          }),
          relatedId: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            comment: '关联对象ID',
          }),
          workflow: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            comment: '审批流程数据',
          }),
          metadata: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            comment: '扩展数据',
          }),
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          modelName: 'approvals',
          tableName: 'approvals',
          timestamps: true,
          indexes: expect.arrayContaining([
            { fields: ['requestedBy'] },
            { fields: ['approvedBy'] },
            { fields: ['kindergartenId'] },
            { fields: ['status'] },
            { fields: ['type'] },
            { fields: ['urgency'] },
            { fields: ['requestedAt'] },
            { fields: ['deadline'] },
            { fields: ['relatedType', 'relatedId'] },
          ]),
        })
      );
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', () => {
      const modelInstance = new Approval();
      
      expect(modelInstance).toHaveProperty('title');
      expect(modelInstance).toHaveProperty('type');
      expect(modelInstance).toHaveProperty('status');
      expect(modelInstance).toHaveProperty('urgency');
      expect(modelInstance).toHaveProperty('requestedBy');
      expect(modelInstance).toHaveProperty('requestedAt');
    });

    it('should validate enum values for type', () => {
      const modelInstance = new Approval();
      
      // Test valid type values
      modelInstance.type = ApprovalType.LEAVE;
      expect(modelInstance.type).toBe(ApprovalType.LEAVE);
      
      modelInstance.type = ApprovalType.EXPENSE;
      expect(modelInstance.type).toBe(ApprovalType.EXPENSE);
      
      modelInstance.type = ApprovalType.EVENT;
      expect(modelInstance.type).toBe(ApprovalType.EVENT);
      
      modelInstance.type = ApprovalType.PURCHASE;
      expect(modelInstance.type).toBe(ApprovalType.PURCHASE);
      
      modelInstance.type = ApprovalType.OTHER;
      expect(modelInstance.type).toBe(ApprovalType.OTHER);
    });

    it('should validate enum values for status', () => {
      const modelInstance = new Approval();
      
      // Test valid status values
      modelInstance.status = ApprovalStatus.PENDING;
      expect(modelInstance.status).toBe(ApprovalStatus.PENDING);
      
      modelInstance.status = ApprovalStatus.APPROVED;
      expect(modelInstance.status).toBe(ApprovalStatus.APPROVED);
      
      modelInstance.status = ApprovalStatus.REJECTED;
      expect(modelInstance.status).toBe(ApprovalStatus.REJECTED);
      
      modelInstance.status = ApprovalStatus.WITHDRAWN;
      expect(modelInstance.status).toBe(ApprovalStatus.WITHDRAWN);
    });

    it('should validate enum values for urgency', () => {
      const modelInstance = new Approval();
      
      // Test valid urgency values
      modelInstance.urgency = ApprovalUrgency.LOW;
      expect(modelInstance.urgency).toBe(ApprovalUrgency.LOW);
      
      modelInstance.urgency = ApprovalUrgency.MEDIUM;
      expect(modelInstance.urgency).toBe(ApprovalUrgency.MEDIUM);
      
      modelInstance.urgency = ApprovalUrgency.HIGH;
      expect(modelInstance.urgency).toBe(ApprovalUrgency.HIGH);
      
      modelInstance.urgency = ApprovalUrgency.URGENT;
      expect(modelInstance.urgency).toBe(ApprovalUrgency.URGENT);
    });

    it('should validate numeric values', () => {
      const modelInstance = new Approval();
      
      modelInstance.requestAmount = 1000.50;
      expect(modelInstance.requestAmount).toBe(1000.50);
      
      modelInstance.requestedBy = 1;
      expect(modelInstance.requestedBy).toBe(1);
      
      modelInstance.approvedBy = 2;
      expect(modelInstance.approvedBy).toBe(2);
      
      modelInstance.kindergartenId = 1;
      expect(modelInstance.kindergartenId).toBe(1);
      
      modelInstance.relatedId = 123;
      expect(modelInstance.relatedId).toBe(123);
    });

    it('should validate string values', () => {
      const modelInstance = new Approval();
      
      modelInstance.title = 'Test Approval';
      expect(modelInstance.title).toBe('Test Approval');
      
      modelInstance.description = 'This is a test approval';
      expect(modelInstance.description).toBe('This is a test approval');
      
      modelInstance.comment = 'Approved';
      expect(modelInstance.comment).toBe('Approved');
      
      modelInstance.relatedType = 'Expense';
      expect(modelInstance.relatedType).toBe('Expense');
    });

    it('should validate date values', () => {
      const modelInstance = new Approval();
      const testDate = new Date();
      
      modelInstance.requestedAt = testDate;
      expect(modelInstance.requestedAt).toBe(testDate);
      
      modelInstance.approvedAt = testDate;
      expect(modelInstance.approvedAt).toBe(testDate);
      
      modelInstance.deadline = testDate;
      expect(modelInstance.deadline).toBe(testDate);
    });

    it('should validate JSON values', () => {
      const modelInstance = new Approval();
      
      const requestData = { key1: 'value1', key2: 123 };
      modelInstance.requestData = requestData;
      expect(modelInstance.requestData).toEqual(requestData);
      
      const attachments = [{ name: 'file1.pdf', size: 1024 }];
      modelInstance.attachments = attachments;
      expect(modelInstance.attachments).toEqual(attachments);
      
      const workflow = { steps: ['step1', 'step2'] };
      modelInstance.workflow = workflow;
      expect(modelInstance.workflow).toEqual(workflow);
      
      const metadata = { customField: 'customValue' };
      modelInstance.metadata = metadata;
      expect(modelInstance.metadata).toEqual(metadata);
    });
  });

  describe('Model Instances', () => {
    it('should create a valid model instance with minimal data', () => {
      const modelInstance = new Approval({
        title: 'Test Approval',
        type: ApprovalType.LEAVE,
        status: ApprovalStatus.PENDING,
        urgency: ApprovalUrgency.MEDIUM,
        requestedBy: 1,
        requestedAt: new Date(),
      });

      expect(modelInstance.title).toBe('Test Approval');
      expect(modelInstance.type).toBe(ApprovalType.LEAVE);
      expect(modelInstance.status).toBe(ApprovalStatus.PENDING);
      expect(modelInstance.urgency).toBe(ApprovalUrgency.MEDIUM);
      expect(modelInstance.requestedBy).toBe(1);
      expect(modelInstance.requestedAt).toBeInstanceOf(Date);
    });

    it('should create a valid model instance with full data', () => {
      const requestData = { startDate: '2024-01-01', endDate: '2024-01-05', reason: 'Vacation' };
      const attachments = [{ name: 'leave_form.pdf', size: 2048, type: 'application/pdf' }];
      const workflow = { 
        currentStep: 1, 
        steps: [
          { name: 'Manager Review', status: 'completed' },
          { name: 'HR Review', status: 'pending' }
        ] 
      };
      const metadata = { department: 'Engineering', priority: 'normal' };

      const modelInstance = new Approval({
        title: 'Leave Request',
        description: 'Annual leave request for 5 days',
        type: ApprovalType.LEAVE,
        status: ApprovalStatus.PENDING,
        urgency: ApprovalUrgency.MEDIUM,
        requestAmount: 0,
        requestData,
        attachments,
        requestedBy: 1,
        approvedBy: 2,
        kindergartenId: 1,
        comment: 'Pending review',
        approvedAt: null,
        requestedAt: new Date(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        relatedType: 'LeaveRequest',
        relatedId: 123,
        workflow,
        metadata,
      });

      expect(modelInstance.title).toBe('Leave Request');
      expect(modelInstance.description).toBe('Annual leave request for 5 days');
      expect(modelInstance.type).toBe(ApprovalType.LEAVE);
      expect(modelInstance.status).toBe(ApprovalStatus.PENDING);
      expect(modelInstance.urgency).toBe(ApprovalUrgency.MEDIUM);
      expect(modelInstance.requestAmount).toBe(0);
      expect(modelInstance.requestData).toEqual(requestData);
      expect(modelInstance.attachments).toEqual(attachments);
      expect(modelInstance.requestedBy).toBe(1);
      expect(modelInstance.approvedBy).toBe(2);
      expect(modelInstance.kindergartenId).toBe(1);
      expect(modelInstance.comment).toBe('Pending review');
      expect(modelInstance.approvedAt).toBeNull();
      expect(modelInstance.requestedAt).toBeInstanceOf(Date);
      expect(modelInstance.deadline).toBeInstanceOf(Date);
      expect(modelInstance.relatedType).toBe('LeaveRequest');
      expect(modelInstance.relatedId).toBe(123);
      expect(modelInstance.workflow).toEqual(workflow);
      expect(modelInstance.metadata).toEqual(metadata);
    });

    it('should handle expense approval instance', () => {
      const modelInstance = new Approval({
        title: 'Office Supplies Purchase',
        type: ApprovalType.EXPENSE,
        status: ApprovalStatus.APPROVED,
        urgency: ApprovalUrgency.HIGH,
        requestAmount: 500.75,
        requestedBy: 1,
        approvedBy: 2,
        approvedAt: new Date(),
        requestedAt: new Date(),
      });

      expect(modelInstance.title).toBe('Office Supplies Purchase');
      expect(modelInstance.type).toBe(ApprovalType.EXPENSE);
      expect(modelInstance.status).toBe(ApprovalStatus.APPROVED);
      expect(modelInstance.urgency).toBe(ApprovalUrgency.HIGH);
      expect(modelInstance.requestAmount).toBe(500.75);
      expect(modelInstance.requestedBy).toBe(1);
      expect(modelInstance.approvedBy).toBe(2);
      expect(modelInstance.approvedAt).toBeInstanceOf(Date);
      expect(modelInstance.requestedAt).toBeInstanceOf(Date);
    });

    it('should handle event approval instance', () => {
      const modelInstance = new Approval({
        title: 'Company Annual Party',
        type: ApprovalType.EVENT,
        status: ApprovalStatus.PENDING,
        urgency: ApprovalUrgency.URGENT,
        requestedBy: 1,
        requestedAt: new Date(),
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      });

      expect(modelInstance.title).toBe('Company Annual Party');
      expect(modelInstance.type).toBe(ApprovalType.EVENT);
      expect(modelInstance.status).toBe(ApprovalStatus.PENDING);
      expect(modelInstance.urgency).toBe(ApprovalUrgency.URGENT);
      expect(modelInstance.requestedBy).toBe(1);
      expect(modelInstance.requestedAt).toBeInstanceOf(Date);
      expect(modelInstance.deadline).toBeInstanceOf(Date);
    });

    it('should handle rejected approval instance', () => {
      const modelInstance = new Approval({
        title: 'Software License Purchase',
        type: ApprovalType.PURCHASE,
        status: ApprovalStatus.REJECTED,
        urgency: ApprovalUrgency.LOW,
        requestAmount: 2000,
        requestedBy: 1,
        approvedBy: 2,
        comment: 'Budget exceeded',
        approvedAt: new Date(),
        requestedAt: new Date(),
      });

      expect(modelInstance.title).toBe('Software License Purchase');
      expect(modelInstance.type).toBe(ApprovalType.PURCHASE);
      expect(modelInstance.status).toBe(ApprovalStatus.REJECTED);
      expect(modelInstance.urgency).toBe(ApprovalUrgency.LOW);
      expect(modelInstance.requestAmount).toBe(2000);
      expect(modelInstance.requestedBy).toBe(1);
      expect(modelInstance.approvedBy).toBe(2);
      expect(modelInstance.comment).toBe('Budget exceeded');
      expect(modelInstance.approvedAt).toBeInstanceOf(Date);
      expect(modelInstance.requestedAt).toBeInstanceOf(Date);
    });

    it('should handle withdrawn approval instance', () => {
      const modelInstance = new Approval({
        title: 'Training Request',
        type: ApprovalType.OTHER,
        status: ApprovalStatus.WITHDRAWN,
        urgency: ApprovalUrgency.MEDIUM,
        requestedBy: 1,
        requestedAt: new Date(),
      });

      expect(modelInstance.title).toBe('Training Request');
      expect(modelInstance.type).toBe(ApprovalType.OTHER);
      expect(modelInstance.status).toBe(ApprovalStatus.WITHDRAWN);
      expect(modelInstance.urgency).toBe(ApprovalUrgency.MEDIUM);
      expect(modelInstance.requestedBy).toBe(1);
      expect(modelInstance.requestedAt).toBeInstanceOf(Date);
    });
  });

  describe('Database Constraints and Indexes', () => {
    it('should have foreign key constraints', () => {
      const mockDefine = jest.fn().mockReturnValue(Approval);
      mockSequelize.define = mockDefine;

      (Approval as any)(mockSequelize);

      expect(mockDefine).toHaveBeenCalledWith(
        'approvals',
        expect.any(Object),
        expect.objectContaining({
          requestedBy: expect.objectContaining({
            references: expect.objectContaining({
              model: 'users',
              key: 'id',
            }),
          }),
          approvedBy: expect.objectContaining({
            references: expect.objectContaining({
              model: 'users',
              key: 'id',
            }),
          }),
          kindergartenId: expect.objectContaining({
            references: expect.objectContaining({
              model: 'kindergartens',
              key: 'id',
            }),
          }),
        })
      );
    });

    it('should have correct indexes defined', () => {
      const mockDefine = jest.fn().mockReturnValue(Approval);
      mockSequelize.define = mockDefine;

      (Approval as any)(mockSequelize);

      expect(mockDefine).toHaveBeenCalledWith(
        'approvals',
        expect.any(Object),
        expect.objectContaining({
          indexes: expect.arrayContaining([
            { fields: ['requestedBy'] },
            { fields: ['approvedBy'] },
            { fields: ['kindergartenId'] },
            { fields: ['status'] },
            { fields: ['type'] },
            { fields: ['urgency'] },
            { fields: ['requestedAt'] },
            { fields: ['deadline'] },
            { fields: ['relatedType', 'relatedId'] },
          ]),
        })
      );
    });
  });

  describe('Table Configuration', () => {
    it('should have correct table name', () => {
      const mockDefine = jest.fn().mockReturnValue(Approval);
      mockSequelize.define = mockDefine;

      (Approval as any)(mockSequelize);

      expect(mockDefine).toHaveBeenCalledWith(
        'approvals',
        expect.any(Object),
        expect.objectContaining({
          tableName: 'approvals',
        })
      );
    });

    it('should have timestamps enabled', () => {
      const mockDefine = jest.fn().mockReturnValue(Approval);
      mockSequelize.define = mockDefine;

      (Approval as any)(mockSequelize);

      expect(mockDefine).toHaveBeenCalledWith(
        'approvals',
        expect.any(Object),
        expect.objectContaining({
          timestamps: true,
        })
      );
    });
  });
});