import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { initAdmissionResult, initAdmissionResultAssociations, AdmissionResult, AdmissionStatus, AdmissionType, ResultType, PaymentStatus } from '../../../src/models/admission-result.model';
import { User } from '../../../src/models/user.model';
import { EnrollmentApplication } from '../../../src/models/enrollment-application.model';
import { Student } from '../../../src/models/student.model';
import { Kindergarten } from '../../../src/models/kindergarten.model';
import { Class } from '../../../src/models/class.model';
import { EnrollmentPlan } from '../../../src/models/enrollment-plan.model';
import { ParentStudentRelation } from '../../../src/models/parent-student-relation.model';

// Mock 模型
jest.mock('../../../src/models/user.model', () => ({
  User: {
    belongsTo: jest.fn(),
  }
}));

jest.mock('../../../src/models/enrollment-application.model', () => ({
  EnrollmentApplication: {
    belongsTo: jest.fn(),
  }
}));

jest.mock('../../../src/models/student.model', () => ({
  Student: {
    belongsTo: jest.fn(),
  }
}));

jest.mock('../../../src/models/kindergarten.model', () => ({
  Kindergarten: {
    belongsTo: jest.fn(),
  }
}));

jest.mock('../../../src/models/class.model', () => ({
  Class: {
    belongsTo: jest.fn(),
  }
}));

jest.mock('../../../src/models/enrollment-plan.model', () => ({
  EnrollmentPlan: {
    belongsTo: jest.fn(),
  }
}));

jest.mock('../../../src/models/parent-student-relation.model', () => ({
  ParentStudentRelation: {
    belongsTo: jest.fn(),
  }
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

describe('AdmissionResult Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
    
    // 初始化模型
    initAdmissionResult(sequelize);
    
    // 同步数据库
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await AdmissionResult.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have the correct model name', () => {
      expect(AdmissionResult.tableName).toBe('admission_results');
    });

    it('should have all required attributes', () => {
      const attributes = Object.keys(AdmissionResult.getAttributes());
      const requiredAttributes = [
        'id', 'applicationId', 'studentId', 'kindergartenId', 'parentId', 
        'planId', 'classId', 'resultType', 'type', 'status', 'admissionDate',
        'confirmationDate', 'notificationDate', 'notificationMethod', 
        'tuitionFee', 'tuitionStatus', 'comments', 'createdBy', 'updatedBy',
        'createdAt', 'updatedAt', 'deletedAt'
      ];
      
      requiredAttributes.forEach(attr => {
        expect(attributes).toContain(attr);
      });
    });

    it('should have correct field configurations', () => {
      const model = AdmissionResult.getAttributes();
      
      // 检查主键
      expect(model.id.primaryKey).toBe(true);
      expect(model.id.autoIncrement).toBe(true);
      
      // 检查外键字段
      expect(model.applicationId.allowNull).toBe(false);
      expect(model.studentId.allowNull).toBe(false);
      expect(model.kindergartenId.allowNull).toBe(false);
      expect(model.parentId.allowNull).toBe(false);
      expect(model.planId.allowNull).toBe(false);
      
      // 检查可选字段
      expect(model.classId.allowNull).toBe(true);
      expect(model.admissionDate.allowNull).toBe(true);
      expect(model.confirmationDate.allowNull).toBe(true);
      expect(model.notificationDate.allowNull).toBe(true);
      expect(model.notificationMethod.allowNull).toBe(true);
      expect(model.tuitionFee.allowNull).toBe(true);
      expect(model.tuitionStatus.allowNull).toBe(true);
      expect(model.comments.allowNull).toBe(true);
    });
  });

  describe('Model Options', () => {
    it('should have correct table options', () => {
      const options = AdmissionResult.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });

    it('should have correct timestamps', () => {
      const attributes = AdmissionResult.getAttributes();
      
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.deletedAt).toBeDefined();
    });
  });

  describe('Enum Values', () => {
    it('should have correct AdmissionStatus enum values', () => {
      expect(AdmissionStatus.PENDING).toBe('pending');
      expect(AdmissionStatus.ADMITTED).toBe('admitted');
      expect(AdmissionStatus.REJECTED).toBe('rejected');
      expect(AdmissionStatus.WAITLISTED).toBe('waitlisted');
      expect(AdmissionStatus.CONFIRMED).toBe('confirmed');
      expect(AdmissionStatus.CANCELED).toBe('canceled');
    });

    it('should have correct AdmissionType enum values', () => {
      expect(AdmissionType.REGULAR).toBe('regular');
      expect(AdmissionType.SPECIAL).toBe('special');
      expect(AdmissionType.PRIORITY).toBe('priority');
      expect(AdmissionType.TRANSFER).toBe('transfer');
    });

    it('should have correct ResultType enum values', () => {
      expect(ResultType.ADMITTED).toBe(1);
      expect(ResultType.WAITLISTED).toBe(2);
      expect(ResultType.REJECTED).toBe(3);
    });

    it('should have correct PaymentStatus enum values', () => {
      expect(PaymentStatus.UNPAID).toBe(0);
      expect(PaymentStatus.PARTIAL).toBe(1);
      expect(PaymentStatus.PAID).toBe(2);
    });
  });

  describe('Model Creation', () => {
    it('should create a new admission result with valid data', async () => {
      const admissionResultData = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        parentId: 1,
        planId: 1,
        classId: 1,
        resultType: ResultType.ADMITTED,
        type: AdmissionType.REGULAR,
        status: AdmissionStatus.PENDING,
        admissionDate: new Date(),
        confirmationDate: new Date(),
        notificationDate: new Date(),
        notificationMethod: 'email',
        tuitionFee: 5000.00,
        tuitionStatus: PaymentStatus.UNPAID,
        comments: 'Test admission result',
        createdBy: 1,
        updatedBy: 1,
      };

      const admissionResult = await AdmissionResult.create(admissionResultData);

      expect(admissionResult.id).toBeDefined();
      expect(admissionResult.applicationId).toBe(admissionResultData.applicationId);
      expect(admissionResult.studentId).toBe(admissionResultData.studentId);
      expect(admissionResult.kindergartenId).toBe(admissionResultData.kindergartenId);
      expect(admissionResult.parentId).toBe(admissionResultData.parentId);
      expect(admissionResult.planId).toBe(admissionResultData.planId);
      expect(admissionResult.classId).toBe(admissionResultData.classId);
      expect(admissionResult.resultType).toBe(admissionResultData.resultType);
      expect(admissionResult.type).toBe(admissionResultData.type);
      expect(admissionResult.status).toBe(admissionResultData.status);
      expect(admissionResult.admissionDate).toEqual(admissionResultData.admissionDate);
      expect(admissionResult.confirmationDate).toEqual(admissionResultData.confirmationDate);
      expect(admissionResult.notificationDate).toEqual(admissionResultData.notificationDate);
      expect(admissionResult.notificationMethod).toBe(admissionResultData.notificationMethod);
      expect(admissionResult.tuitionFee).toBe(admissionResultData.tuitionFee);
      expect(admissionResult.tuitionStatus).toBe(admissionResultData.tuitionStatus);
      expect(admissionResult.comments).toBe(admissionResultData.comments);
      expect(admissionResult.createdBy).toBe(admissionResultData.createdBy);
      expect(admissionResult.updatedBy).toBe(admissionResultData.updatedBy);
      expect(admissionResult.createdAt).toBeDefined();
      expect(admissionResult.updatedAt).toBeDefined();
    });

    it('should create admission result with default values', async () => {
      const admissionResultData = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        parentId: 1,
        planId: 1,
        resultType: ResultType.ADMITTED,
        createdBy: 1,
        updatedBy: 1,
      };

      const admissionResult = await AdmissionResult.create(admissionResultData);

      expect(admissionResult.type).toBe(AdmissionType.REGULAR);
      expect(admissionResult.status).toBe(AdmissionStatus.PENDING);
      expect(admissionResult.classId).toBeNull();
      expect(admissionResult.admissionDate).toBeNull();
      expect(admissionResult.confirmationDate).toBeNull();
      expect(admissionResult.notificationDate).toBeNull();
      expect(admissionResult.notificationMethod).toBeNull();
      expect(admissionResult.tuitionFee).toBeNull();
      expect(admissionResult.tuitionStatus).toBeNull();
      expect(admissionResult.comments).toBeNull();
    });

    it('should fail to create admission result without required fields', async () => {
      const invalidData = {
        // 缺少必需字段
        applicationId: 1,
        studentId: 1,
        // 缺少 kindergartenId, parentId, planId, resultType, createdBy, updatedBy
      };

      await expect(AdmissionResult.create(invalidData as any)).rejects.toThrow();
    });
  });

  describe('Field Validation', () => {
    it('should validate resultType field', async () => {
      const validData = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        parentId: 1,
        planId: 1,
        resultType: ResultType.ADMITTED,
        createdBy: 1,
        updatedBy: 1,
      };

      // 测试有效值
      await expect(AdmissionResult.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, resultType: 99 };
      await expect(AdmissionResult.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate admissionType field', async () => {
      const validData = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        parentId: 1,
        planId: 1,
        resultType: ResultType.ADMITTED,
        type: AdmissionType.REGULAR,
        createdBy: 1,
        updatedBy: 1,
      };

      // 测试有效值
      await expect(AdmissionResult.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, type: 'invalid_type' };
      await expect(AdmissionResult.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate status field', async () => {
      const validData = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        parentId: 1,
        planId: 1,
        resultType: ResultType.ADMITTED,
        status: AdmissionStatus.PENDING,
        createdBy: 1,
        updatedBy: 1,
      };

      // 测试有效值
      await expect(AdmissionResult.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, status: 'invalid_status' };
      await expect(AdmissionResult.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate tuitionFee field', async () => {
      const validData = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        parentId: 1,
        planId: 1,
        resultType: ResultType.ADMITTED,
        tuitionFee: 5000.00,
        createdBy: 1,
        updatedBy: 1,
      };

      // 测试有效值
      await expect(AdmissionResult.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, tuitionFee: 'invalid_fee' };
      await expect(AdmissionResult.create(invalidData as any)).rejects.toThrow();
    });
  });

  describe('Model Associations', () => {
    beforeEach(() => {
      // 清理 mock 调用记录
      jest.clearAllMocks();
    });

    it('should define associations correctly', () => {
      initAdmissionResultAssociations();

      // 验证关联关系是否正确定义
      expect(AdmissionResult.belongsTo).toHaveBeenCalledWith(EnrollmentApplication, { 
        foreignKey: 'applicationId', 
        as: 'application' 
      });
      expect(AdmissionResult.belongsTo).toHaveBeenCalledWith(Student, { 
        foreignKey: 'studentId', 
        as: 'student' 
      });
      expect(AdmissionResult.belongsTo).toHaveBeenCalledWith(Kindergarten, { 
        foreignKey: 'kindergartenId', 
        as: 'kindergarten' 
      });
      expect(AdmissionResult.belongsTo).toHaveBeenCalledWith(Class, { 
        foreignKey: 'classId', 
        as: 'class' 
      });
      expect(AdmissionResult.belongsTo).toHaveBeenCalledWith(User, { 
        foreignKey: 'createdBy', 
        as: 'creator' 
      });
      expect(AdmissionResult.belongsTo).toHaveBeenCalledWith(User, { 
        foreignKey: 'updatedBy', 
        as: 'updater' 
      });
      expect(AdmissionResult.belongsTo).toHaveBeenCalledWith(EnrollmentPlan, { 
        foreignKey: 'planId', 
        as: 'plan' 
      });
      expect(AdmissionResult.belongsTo).toHaveBeenCalledWith(ParentStudentRelation, { 
        foreignKey: 'parentId', 
        as: 'parent' 
      });
    });

    it('should have correct association configurations', () => {
      // 验证关联关系的配置
      const associations = AdmissionResult.associations;
      
      expect(associations.application).toBeDefined();
      expect(associations.student).toBeDefined();
      expect(associations.kindergarten).toBeDefined();
      expect(associations.class).toBeDefined();
      expect(associations.creator).toBeDefined();
      expect(associations.updater).toBeDefined();
      expect(associations.plan).toBeDefined();
      expect(associations.parent).toBeDefined();
    });
  });

  describe('Model Operations', () => {
    it('should find admission result by id', async () => {
      const admissionResultData = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        parentId: 1,
        planId: 1,
        resultType: ResultType.ADMITTED,
        createdBy: 1,
        updatedBy: 1,
      };

      const created = await AdmissionResult.create(admissionResultData);
      const found = await AdmissionResult.findByPk(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.applicationId).toBe(admissionResultData.applicationId);
    });

    it('should update admission result', async () => {
      const admissionResultData = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        parentId: 1,
        planId: 1,
        resultType: ResultType.ADMITTED,
        status: AdmissionStatus.PENDING,
        createdBy: 1,
        updatedBy: 1,
      };

      const admissionResult = await AdmissionResult.create(admissionResultData);
      
      await admissionResult.update({
        status: AdmissionStatus.ADMITTED,
        admissionDate: new Date(),
        comments: 'Updated admission result'
      });

      const updated = await AdmissionResult.findByPk(admissionResult.id);
      
      expect(updated?.status).toBe(AdmissionStatus.ADMITTED);
      expect(updated?.admissionDate).toBeDefined();
      expect(updated?.comments).toBe('Updated admission result');
    });

    it('should delete admission result (soft delete)', async () => {
      const admissionResultData = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        parentId: 1,
        planId: 1,
        resultType: ResultType.ADMITTED,
        createdBy: 1,
        updatedBy: 1,
      };

      const admissionResult = await AdmissionResult.create(admissionResultData);
      
      await admissionResult.destroy();

      const deleted = await AdmissionResult.findByPk(admissionResult.id);
      expect(deleted).toBeNull();

      // 检查软删除记录
      const paranoidDeleted = await AdmissionResult.findByPk(admissionResult.id, { paranoid: false });
      expect(paranoidDeleted).toBeDefined();
      expect(paranoidDeleted?.deletedAt).toBeDefined();
    });

    it('should list all admission results', async () => {
      const admissionResultData1 = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        parentId: 1,
        planId: 1,
        resultType: ResultType.ADMITTED,
        createdBy: 1,
        updatedBy: 1,
      };

      const admissionResultData2 = {
        applicationId: 2,
        studentId: 2,
        kindergartenId: 1,
        parentId: 2,
        planId: 1,
        resultType: ResultType.WAITLISTED,
        createdBy: 1,
        updatedBy: 1,
      };

      await AdmissionResult.create(admissionResultData1);
      await AdmissionResult.create(admissionResultData2);

      const admissionResults = await AdmissionResult.findAll();
      
      expect(admissionResults).toHaveLength(2);
      expect(admissionResults[0].resultType).toBe(ResultType.ADMITTED);
      expect(admissionResults[1].resultType).toBe(ResultType.WAITLISTED);
    });
  });

  describe('Query Operations', () => {
    it('should filter admission results by status', async () => {
      const admissionResultData1 = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        parentId: 1,
        planId: 1,
        resultType: ResultType.ADMITTED,
        status: AdmissionStatus.PENDING,
        createdBy: 1,
        updatedBy: 1,
      };

      const admissionResultData2 = {
        applicationId: 2,
        studentId: 2,
        kindergartenId: 1,
        parentId: 2,
        planId: 1,
        resultType: ResultType.ADMITTED,
        status: AdmissionStatus.ADMITTED,
        createdBy: 1,
        updatedBy: 1,
      };

      await AdmissionResult.create(admissionResultData1);
      await AdmissionResult.create(admissionResultData2);

      const pendingResults = await AdmissionResult.findAll({
        where: { status: AdmissionStatus.PENDING }
      });
      
      expect(pendingResults).toHaveLength(1);
      expect(pendingResults[0].status).toBe(AdmissionStatus.PENDING);

      const admittedResults = await AdmissionResult.findAll({
        where: { status: AdmissionStatus.ADMITTED }
      });
      
      expect(admittedResults).toHaveLength(1);
      expect(admittedResults[0].status).toBe(AdmissionStatus.ADMITTED);
    });

    it('should filter admission results by resultType', async () => {
      const admissionResultData1 = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        parentId: 1,
        planId: 1,
        resultType: ResultType.ADMITTED,
        createdBy: 1,
        updatedBy: 1,
      };

      const admissionResultData2 = {
        applicationId: 2,
        studentId: 2,
        kindergartenId: 1,
        parentId: 2,
        planId: 1,
        resultType: ResultType.WAITLISTED,
        createdBy: 1,
        updatedBy: 1,
      };

      await AdmissionResult.create(admissionResultData1);
      await AdmissionResult.create(admissionResultData2);

      const admittedResults = await AdmissionResult.findAll({
        where: { resultType: ResultType.ADMITTED }
      });
      
      expect(admittedResults).toHaveLength(1);
      expect(admittedResults[0].resultType).toBe(ResultType.ADMITTED);

      const waitlistedResults = await AdmissionResult.findAll({
        where: { resultType: ResultType.WAITLISTED }
      });
      
      expect(waitlistedResults).toHaveLength(1);
      expect(waitlistedResults[0].resultType).toBe(ResultType.WAITLISTED);
    });

    it('should filter admission results by kindergarten', async () => {
      const admissionResultData1 = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        parentId: 1,
        planId: 1,
        resultType: ResultType.ADMITTED,
        createdBy: 1,
        updatedBy: 1,
      };

      const admissionResultData2 = {
        applicationId: 2,
        studentId: 2,
        kindergartenId: 2,
        parentId: 2,
        planId: 2,
        resultType: ResultType.ADMITTED,
        createdBy: 1,
        updatedBy: 1,
      };

      await AdmissionResult.create(admissionResultData1);
      await AdmissionResult.create(admissionResultData2);

      const kindergarten1Results = await AdmissionResult.findAll({
        where: { kindergartenId: 1 }
      });
      
      expect(kindergarten1Results).toHaveLength(1);
      expect(kindergarten1Results[0].kindergartenId).toBe(1);

      const kindergarten2Results = await AdmissionResult.findAll({
        where: { kindergartenId: 2 }
      });
      
      expect(kindergarten2Results).toHaveLength(1);
      expect(kindergarten2Results[0].kindergartenId).toBe(2);
    });
  });
});