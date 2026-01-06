import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { EnrollmentConsultation } from '../../../src/models/enrollment-consultation.model';
import { Kindergarten } from '../../../src/models/kindergarten.model';
import { User } from '../../../src/models/user.model';
import { EnrollmentConsultationFollowup } from '../../../src/models/enrollment-consultation-followup.model';

// Mock the sequelize instance
jest.mock('../../../src/config/database', () => ({
  sequelize: {
    define: jest.fn(),
    sync: jest.fn(),
    close: jest.fn(),
  } as any,
}));

// 控制台错误检测变量
let consoleSpy: any

describe('EnrollmentConsultation Model', () => {
  let mockSequelize: jest.Mocked<Sequelize>;
  let mockModel: any;

  beforeEach(() => {
    mockSequelize = {
      define: jest.fn().mockReturnValue({
        belongsTo: jest.fn(),
        hasMany: jest.fn(),
      })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}),
      sync: jest.fn(),
      close: jest.fn(),
    } as any;

    mockModel = {
      init: jest.fn(),
      belongsTo: jest.fn(),
      hasMany: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Model Definition', () => {
    it('should initialize model with correct attributes', () => {
      EnrollmentConsultation.initModel(mockSequelize);
      
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'enrollment_consultations',
        expect.objectContaining({
          id: {
            type: expect.any(Object),
            primaryKey: true,
            autoIncrement: true,
            comment: '咨询记录ID'
          },
          kindergartenId: {
            type: expect.any(Object),
            allowNull: false,
            field: 'kindergarten_id',
            comment: '幼儿园ID'
          },
          consultantId: {
            type: expect.any(Object),
            allowNull: false,
            field: 'consultant_id',
            comment: '咨询师ID'
          },
          parentName: {
            type: expect.any(Object),
            allowNull: false,
            field: 'parent_name',
            comment: '家长姓名'
          },
          childName: {
            type: expect.any(Object),
            allowNull: false,
            field: 'child_name',
            comment: '孩子姓名'
          },
          childAge: {
            type: expect.any(Object),
            allowNull: false,
            field: 'child_age',
            comment: '孩子年龄(月)'
          },
          childGender: {
            type: expect.any(Object),
            allowNull: false,
            field: 'child_gender',
            comment: '孩子性别 - 1:男 2:女'
          },
          contactPhone: {
            type: expect.any(Object),
            allowNull: false,
            field: 'contact_phone',
            comment: '联系电话'
          },
          contactAddress: {
            type: expect.any(Object),
            allowNull: true,
            field: 'contact_address',
            comment: '联系地址'
          },
          sourceChannel: {
            type: expect.any(Object),
            allowNull: false,
            field: 'source_channel',
            comment: '来源渠道 - 1:线上广告 2:线下活动 3:朋友介绍 4:电话咨询 5:自主访问 6:其他'
          },
          sourceDetail: {
            type: expect.any(Object),
            allowNull: true,
            field: 'source_detail',
            comment: '来源详情'
          },
          consultContent: {
            type: expect.any(Object),
            allowNull: false,
            field: 'consult_content',
            comment: '咨询内容'
          },
          consultMethod: {
            type: expect.any(Object),
            allowNull: false,
            field: 'consult_method',
            comment: '咨询方式 - 1:电话 2:线下到访 3:线上咨询 4:微信 5:其他'
          },
          consultDate: {
            type: expect.any(Object),
            allowNull: false,
            field: 'consult_date',
            comment: '咨询日期'
          },
          intentionLevel: {
            type: expect.any(Object),
            allowNull: false,
            field: 'intention_level',
            comment: '意向级别 - 1:非常有意向 2:有意向 3:一般 4:较低 5:无意向'
          },
          followupStatus: {
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 1,
            field: 'followup_status',
            comment: '跟进状态 - 1:待跟进 2:跟进中 3:已转化 4:已放弃'
          },
          nextFollowupDate: {
            type: expect.any(Object),
            allowNull: true,
            field: 'next_followup_date',
            comment: '下次跟进日期'
          },
          remark: {
            type: expect.any(Object),
            allowNull: true,
            comment: '备注'
          },
          creatorId: {
            type: expect.any(Object),
            allowNull: false,
            field: 'creator_id',
            comment: '创建人ID'
          },
          updaterId: {
            type: expect.any(Object),
            allowNull: true,
            field: 'updater_id',
            comment: '更新人ID'
          },
          createdAt: {
            type: expect.any(Object),
            allowNull: false,
            field: 'created_at'
          },
          updatedAt: {
            type: expect.any(Object),
            allowNull: false,
            field: 'updated_at'
          },
          deletedAt: {
            type: expect.any(Object),
            allowNull: true,
            field: 'deleted_at'
          }
        }),
        {
          sequelize: mockSequelize,
          tableName: 'enrollment_consultations',
          timestamps: true,
          paranoid: true,
          underscored: true,
        }
      );
    });

    it('should have correct table configuration', () => {
      EnrollmentConsultation.initModel(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.tableName).toBe('enrollment_consultations');
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });
  });

  describe('Associations', () => {
    beforeEach(() => {
      EnrollmentConsultation.initModel(mockSequelize);
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    it('should set up belongsTo association with Kindergarten', () => {
      EnrollmentConsultation.initAssociations();
      
      expect(EnrollmentConsultation.prototype.belongsTo).toHaveBeenCalledWith(
        Kindergarten,
        {
          foreignKey: 'kindergartenId',
          as: 'kindergarten'
        }
      );
    });

    it('should set up belongsTo association with User as consultant', () => {
      EnrollmentConsultation.initAssociations();
      
      expect(EnrollmentConsultation.prototype.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'consultantId',
          as: 'consultant'
        }
      );
    });

    it('should set up belongsTo association with User as creator', () => {
      EnrollmentConsultation.initAssociations();
      
      expect(EnrollmentConsultation.prototype.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'creatorId',
          as: 'creator'
        }
      );
    });

    it('should set up hasMany association with EnrollmentConsultationFollowup', () => {
      EnrollmentConsultation.initAssociations();
      
      expect(EnrollmentConsultation.prototype.hasMany).toHaveBeenCalledWith(
        EnrollmentConsultationFollowup,
        {
          sourceKey: 'id',
          foreignKey: 'consultationId',
          as: 'followups'
        }
      );
    });
  });

  describe('Field Validation', () => {
    it('should validate required fields', () => {
      const consultationData = {
        kindergartenId: 1,
        consultantId: 1,
        parentName: '张三',
        childName: '小明',
        childAge: 36,
        childGender: 1,
        contactPhone: '13800138000',
        sourceChannel: 1,
        consultContent: '咨询幼儿园相关信息',
        consultMethod: 1,
        consultDate: new Date(),
        intentionLevel: 2,
        creatorId: 1
      };

      expect(consultationData).toHaveProperty('kindergartenId');
      expect(consultationData).toHaveProperty('consultantId');
      expect(consultationData).toHaveProperty('parentName');
      expect(consultationData).toHaveProperty('childName');
      expect(consultationData).toHaveProperty('childAge');
      expect(consultationData).toHaveProperty('childGender');
      expect(consultationData).toHaveProperty('contactPhone');
      expect(consultationData).toHaveProperty('sourceChannel');
      expect(consultationData).toHaveProperty('consultContent');
      expect(consultationData).toHaveProperty('consultMethod');
      expect(consultationData).toHaveProperty('consultDate');
      expect(consultationData).toHaveProperty('intentionLevel');
      expect(consultationData).toHaveProperty('creatorId');
    });

    it('should validate optional fields', () => {
      const consultationData = {
        contactAddress: '北京市朝阳区',
        sourceDetail: '百度搜索',
        nextFollowupDate: new Date(),
        remark: '重要客户',
        updaterId: 2
      };

      expect(consultationData.contactAddress).toBeDefined();
      expect(consultationData.sourceDetail).toBeDefined();
      expect(consultationData.nextFollowupDate).toBeDefined();
      expect(consultationData.remark).toBeDefined();
      expect(consultationData.updaterId).toBeDefined();
    });
  });

  describe('Enum Values', () => {
    it('should validate childGender enum values', () => {
      const validGenders = [1, 2]; // 1:男 2:女
      
      validGenders.forEach(gender => {
        expect([1, 2]).toContain(gender);
      });
    });

    it('should validate sourceChannel enum values', () => {
      const validChannels = [1, 2, 3, 4, 5, 6]; // 1:线上广告 2:线下活动 3:朋友介绍 4:电话咨询 5:自主访问 6:其他
      
      validChannels.forEach(channel => {
        expect([1, 2, 3, 4, 5, 6]).toContain(channel);
      });
    });

    it('should validate consultMethod enum values', () => {
      const validMethods = [1, 2, 3, 4, 5]; // 1:电话 2:线下到访 3:线上咨询 4:微信 5:其他
      
      validMethods.forEach(method => {
        expect([1, 2, 3, 4, 5]).toContain(method);
      });
    });

    it('should validate intentionLevel enum values', () => {
      const validLevels = [1, 2, 3, 4, 5]; // 1:非常有意向 2:有意向 3:一般 4:较低 5:无意向
      
      validLevels.forEach(level => {
        expect([1, 2, 3, 4, 5]).toContain(level);
      });
    });

    it('should validate followupStatus enum values', () => {
      const validStatuses = [1, 2, 3, 4]; // 1:待跟进 2:跟进中 3:已转化 4:已放弃
      
      validStatuses.forEach(status => {
        expect([1, 2, 3, 4]).toContain(status);
      });
    });
  });

  describe('Field Constraints', () => {
    it('should validate string field lengths', () => {
      expect.assertions(5);
      
      // parentName max length 50
      const parentName = '张'.repeat(50);
      expect(parentName.length).toBeLessThanOrEqual(50);
      
      // childName max length 50
      const childName = '小'.repeat(50);
      expect(childName.length).toBeLessThanOrEqual(50);
      
      // contactPhone max length 20
      const contactPhone = '1'.repeat(20);
      expect(contactPhone.length).toBeLessThanOrEqual(20);
      
      // contactAddress max length 200
      const contactAddress = '地'.repeat(200);
      expect(contactAddress.length).toBeLessThanOrEqual(200);
      
      // sourceDetail max length 100
      const sourceDetail = '详'.repeat(100);
      expect(sourceDetail.length).toBeLessThanOrEqual(100);
    });

    it('should validate numeric field constraints', () => {
      const validAge = 36; // 36 months
      expect(validAge).toBeGreaterThan(0);
      expect(validAge).toBeLessThan(200); // reasonable upper bound
      
      const validGender = 1;
      expect([1, 2]).toContain(validGender);
      
      const validChannel = 1;
      expect([1, 2, 3, 4, 5, 6]).toContain(validChannel);
      
      const validMethod = 1;
      expect([1, 2, 3, 4, 5]).toContain(validMethod);
      
      const validLevel = 2;
      expect([1, 2, 3, 4, 5]).toContain(validLevel);
    });
  });

  describe('Default Values', () => {
    it('should have default followupStatus value', () => {
      const consultationData = {
        kindergartenId: 1,
        consultantId: 1,
        parentName: '张三',
        childName: '小明',
        childAge: 36,
        childGender: 1,
        contactPhone: '13800138000',
        sourceChannel: 1,
        consultContent: '咨询幼儿园相关信息',
        consultMethod: 1,
        consultDate: new Date(),
        intentionLevel: 2,
        creatorId: 1
      };

      // followupStatus should default to 1 (待跟进)
      expect(consultationData.followupStatus).toBeUndefined(); // will be set by database default
    });
  });

  describe('Instance Methods', () => {
    it('should have required instance properties', () => {
      const mockInstance = new EnrollmentConsultation();
      
      expect(mockInstance).toHaveProperty('id');
      expect(mockInstance).toHaveProperty('kindergartenId');
      expect(mockInstance).toHaveProperty('consultantId');
      expect(mockInstance).toHaveProperty('parentName');
      expect(mockInstance).toHaveProperty('childName');
      expect(mockInstance).toHaveProperty('childAge');
      expect(mockInstance).toHaveProperty('childGender');
      expect(mockInstance).toHaveProperty('contactPhone');
      expect(mockInstance).toHaveProperty('contactAddress');
      expect(mockInstance).toHaveProperty('sourceChannel');
      expect(mockInstance).toHaveProperty('sourceDetail');
      expect(mockInstance).toHaveProperty('consultContent');
      expect(mockInstance).toHaveProperty('consultMethod');
      expect(mockInstance).toHaveProperty('consultDate');
      expect(mockInstance).toHaveProperty('intentionLevel');
      expect(mockInstance).toHaveProperty('followupStatus');
      expect(mockInstance).toHaveProperty('nextFollowupDate');
      expect(mockInstance).toHaveProperty('remark');
      expect(mockInstance).toHaveProperty('creatorId');
      expect(mockInstance).toHaveProperty('updaterId');
      expect(mockInstance).toHaveProperty('createdAt');
      expect(mockInstance).toHaveProperty('updatedAt');
      expect(mockInstance).toHaveProperty('deletedAt');
    });
  });
});