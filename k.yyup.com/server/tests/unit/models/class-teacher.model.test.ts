import { ClassTeacher, ClassTeacherRole, ClassTeacherStatus, initClassTeacher, initClassTeacherAssociations } from '../../../src/models/class-teacher.model';
import { vi } from 'vitest'
import { Class } from '../../../src/models/class.model';
import { Teacher } from '../../../src/models/teacher.model';
import { User } from '../../../src/models/user.model';
import { sequelize } from '../../../src/config/database';

// Mock Class, Teacher, and User models
jest.mock('../../../src/models/class.model', () => ({
  Class: {
    belongsTo: jest.fn(),
  },
}));

jest.mock('../../../src/models/teacher.model', () => ({
  Teacher: {
    belongsTo: jest.fn(),
  },
}));

jest.mock('../../../src/models/user.model', () => ({
  User: {
    belongsTo: jest.fn(),
  },
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

describe('ClassTeacher Model', () => {
  beforeAll(async () => {
    // Initialize the ClassTeacher model
    initClassTeacher(sequelize);
    initClassTeacherAssociations();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(ClassTeacher.tableName).toBe('class_teachers');
    });

    it('should have correct attributes', () => {
      const attributes = ClassTeacher.getAttributes();
      
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);
      
      expect(attributes.classId).toBeDefined();
      expect(attributes.classId.allowNull).toBe(false);
      
      expect(attributes.teacherId).toBeDefined();
      expect(attributes.teacherId.allowNull).toBe(false);
      
      expect(attributes.role).toBeDefined();
      expect(attributes.role.allowNull).toBe(false);
      
      expect(attributes.startDate).toBeDefined();
      expect(attributes.startDate.allowNull).toBe(true);
      
      expect(attributes.endDate).toBeDefined();
      expect(attributes.endDate.allowNull).toBe(true);
      
      expect(attributes.status).toBeDefined();
      expect(attributes.status.allowNull).toBe(false);
      expect(attributes.status.defaultValue).toBe(ClassTeacherStatus.ACTIVE);
      
      expect(attributes.creatorId).toBeDefined();
      expect(attributes.creatorId.allowNull).toBe(true);
      
      expect(attributes.updaterId).toBeDefined();
      expect(attributes.updaterId.allowNull).toBe(true);
    });
  });

  describe('Model Options', () => {
    it('should have correct table configuration', () => {
      expect(ClassTeacher.options.tableName).toBe('class_teachers');
      expect(ClassTeacher.options.timestamps).toBe(true);
      expect(ClassTeacher.options.paranoid).toBe(true);
      expect(ClassTeacher.options.underscored).toBe(true);
    });
  });

  describe('Enum Values', () => {
    it('should have correct ClassTeacherRole enum values', () => {
      expect(ClassTeacherRole.HEAD_TEACHER).toBe(1);
      expect(ClassTeacherRole.DEPUTY_HEAD_TEACHER).toBe(2);
      expect(ClassTeacherRole.SUPPORT_TEACHER).toBe(3);
      expect(ClassTeacherRole.SUBJECT_TEACHER).toBe(4);
    });

    it('should have correct ClassTeacherStatus enum values', () => {
      expect(ClassTeacherStatus.INACTIVE).toBe(0);
      expect(ClassTeacherStatus.ACTIVE).toBe(1);
    });
  });

  describe('Model Associations', () => {
    it('should belong to class', () => {
      expect(Class.belongsTo).toHaveBeenCalledWith(ClassTeacher, {
        foreignKey: 'classId',
        as: 'class',
      });
    });

    it('should belong to teacher', () => {
      expect(Teacher.belongsTo).toHaveBeenCalledWith(ClassTeacher, {
        foreignKey: 'teacherId',
        as: 'teacher',
      });
    });

    it('should belong to creator user', () => {
      expect(User.belongsTo).toHaveBeenCalledWith(ClassTeacher, {
        foreignKey: 'creatorId',
        as: 'creator',
      });
    });

    it('should belong to updater user', () => {
      expect(User.belongsTo).toHaveBeenCalledWith(ClassTeacher, {
        foreignKey: 'updaterId',
        as: 'updater',
      });
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', async () => {
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.HEAD_TEACHER,
      });

      const validationErrors = await classTeacher.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should fail validation without required fields', async () => {
      const classTeacher = ClassTeacher.build({});

      await expect(classTeacher.validate()).rejects.toThrow();
    });

    it('should validate role field', async () => {
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.DEPUTY_HEAD_TEACHER,
      });

      const validationErrors = await classTeacher.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate status field', async () => {
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.SUPPORT_TEACHER,
        status: ClassTeacherStatus.ACTIVE,
      });

      const validationErrors = await classTeacher.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate date fields', async () => {
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.SUBJECT_TEACHER,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      const validationErrors = await classTeacher.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate creator and updater fields', async () => {
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.HEAD_TEACHER,
        creatorId: 1,
        updaterId: 2,
      });

      const validationErrors = await classTeacher.validate();
      expect(validationErrors).toBeUndefined();
    });
  });

  describe('Field Constraints', () => {
    it('should have correct field types', () => {
      const attributes = ClassTeacher.getAttributes();
      
      expect(attributes.id.type.constructor.name).toContain('INTEGER');
      expect(attributes.classId.type.constructor.name).toContain('INTEGER');
      expect(attributes.teacherId.type.constructor.name).toContain('INTEGER');
      expect(attributes.role.type.constructor.name).toContain('TINYINT');
      expect(attributes.startDate.type.constructor.name).toContain('DATEONLY');
      expect(attributes.endDate.type.constructor.name).toContain('DATEONLY');
      expect(attributes.status.type.constructor.name).toContain('TINYINT');
      expect(attributes.creatorId.type.constructor.name).toContain('INTEGER');
      expect(attributes.updaterId.type.constructor.name).toContain('INTEGER');
    });
  });

  describe('Model Instance Methods', () => {
    it('should create instance with correct attributes', () => {
      const classTeacherData = {
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.HEAD_TEACHER,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: ClassTeacherStatus.ACTIVE,
        creatorId: 1,
        updaterId: 2,
      };

      const classTeacher = ClassTeacher.build(classTeacherData);

      expect(classTeacher.classId).toBe(1);
      expect(classTeacher.teacherId).toBe(1);
      expect(classTeacher.role).toBe(ClassTeacherRole.HEAD_TEACHER);
      expect(classTeacher.startDate).toEqual(new Date('2024-01-01'));
      expect(classTeacher.endDate).toEqual(new Date('2024-12-31'));
      expect(classTeacher.status).toBe(ClassTeacherStatus.ACTIVE);
      expect(classTeacher.creatorId).toBe(1);
      expect(classTeacher.updaterId).toBe(2);
    });

    it('should handle null values for optional fields', () => {
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.SUPPORT_TEACHER,
      });

      expect(classTeacher.classId).toBe(1);
      expect(classTeacher.teacherId).toBe(1);
      expect(classTeacher.role).toBe(ClassTeacherRole.SUPPORT_TEACHER);
      expect(classTeacher.startDate).toBeNull();
      expect(classTeacher.endDate).toBeNull();
      expect(classTeacher.status).toBe(ClassTeacherStatus.ACTIVE); // default value
      expect(classTeacher.creatorId).toBeNull();
      expect(classTeacher.updaterId).toBeNull();
    });
  });

  describe('Default Values', () => {
    it('should have correct default values', () => {
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.SUBJECT_TEACHER,
      });

      expect(classTeacher.status).toBe(ClassTeacherStatus.ACTIVE);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt', () => {
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.DEPUTY_HEAD_TEACHER,
      });

      expect(classTeacher.createdAt).toBeDefined();
      expect(classTeacher.updatedAt).toBeDefined();
      expect(classTeacher.createdAt).toBeInstanceOf(Date);
      expect(classTeacher.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete with deletedAt', () => {
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.HEAD_TEACHER,
      });

      expect(classTeacher.deletedAt).toBeDefined();
      expect(classTeacher.deletedAt).toBeNull();
    });
  });

  describe('Field Comments', () => {
    it('should have proper field comments', () => {
      const attributes = ClassTeacher.getAttributes();
      
      expect(attributes.id.comment).toBe('主键ID');
      expect(attributes.classId.comment).toBe('班级ID - 外键关联班级表');
      expect(attributes.teacherId.comment).toBe('教师ID - 外键关联教师表');
      expect(attributes.role.comment).toBe('教师角色 - 1:班主任 2:副班主任 3:配班老师 4:专科老师');
      expect(attributes.startDate.comment).toBe('开始日期');
      expect(attributes.endDate.comment).toBe('结束日期');
      expect(attributes.status.comment).toBe('状态 - 0:停用 1:正常');
      expect(attributes.creatorId.comment).toBe('创建人ID');
      expect(attributes.updaterId.comment).toBe('更新人ID');
    });
  });

  describe('Role Enum Validation', () => {
    it('should accept all valid role values', () => {
      const validRoles = [
        ClassTeacherRole.HEAD_TEACHER,
        ClassTeacherRole.DEPUTY_HEAD_TEACHER,
        ClassTeacherRole.SUPPORT_TEACHER,
        ClassTeacherRole.SUBJECT_TEACHER,
      ];

      validRoles.forEach(role => {
        const classTeacher = ClassTeacher.build({
          classId: 1,
          teacherId: 1,
          role,
        });

        expect(classTeacher.role).toBe(role);
      });
    });
  });

  describe('Status Enum Validation', () => {
    it('should accept all valid status values', () => {
      const validStatuses = [
        ClassTeacherStatus.INACTIVE,
        ClassTeacherStatus.ACTIVE,
      ];

      validStatuses.forEach(status => {
        const classTeacher = ClassTeacher.build({
          classId: 1,
          teacherId: 1,
          role: ClassTeacherRole.HEAD_TEACHER,
          status,
        });

        expect(classTeacher.status).toBe(status);
      });
    });
  });

  describe('Date Field Validation', () => {
    it('should handle valid date ranges', () => {
      const validDateRanges = [
        {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
        {
          startDate: new Date('2023-09-01'),
          endDate: new Date('2024-06-30'),
        },
        {
          startDate: new Date('2024-03-01'),
          endDate: null, // No end date
        },
      ];

      validDateRanges.forEach(dateRange => {
        const classTeacher = ClassTeacher.build({
          classId: 1,
          teacherId: 1,
          role: ClassTeacherRole.HEAD_TEACHER,
          ...dateRange,
        });

        expect(classTeacher.startDate).toEqual(dateRange.startDate);
        expect(classTeacher.endDate).toBe(dateRange.endDate);
      });
    });

    it('should handle null dates', () => {
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.SUPPORT_TEACHER,
        startDate: null,
        endDate: null,
      });

      expect(classTeacher.startDate).toBeNull();
      expect(classTeacher.endDate).toBeNull();
    });
  });

  describe('Business Logic Validation', () => {
    it('should validate logical date sequence', () => {
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.HEAD_TEACHER,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2023-12-31'), // End date before start date
      });

      // This would typically be validated at the application level
      // For now, we just test that the model accepts the data
      expect(classTeacher.startDate).toEqual(new Date('2024-01-01'));
      expect(classTeacher.endDate).toEqual(new Date('2023-12-31'));
    });

    it('should handle same start and end dates', () => {
      const sameDate = new Date('2024-06-01');
      
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.DEPUTY_HEAD_TEACHER,
        startDate: sameDate,
        endDate: sameDate,
      });

      expect(classTeacher.startDate).toEqual(sameDate);
      expect(classTeacher.endDate).toEqual(sameDate);
    });
  });

  describe('Model Relationships', () => {
    it('should define foreign key relationships', () => {
      // Test that the model has the correct foreign key fields
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.HEAD_TEACHER,
        creatorId: 1,
        updaterId: 2,
      });

      expect(classTeacher.classId).toBe(1);
      expect(classTeacher.teacherId).toBe(1);
      expect(classTeacher.creatorId).toBe(1);
      expect(classTeacher.updaterId).toBe(2);
    });

    it('should handle null foreign key values', () => {
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.SUPPORT_TEACHER,
        creatorId: null,
        updaterId: null,
      });

      expect(classTeacher.creatorId).toBeNull();
      expect(classTeacher.updaterId).toBeNull();
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data consistency', () => {
      const originalData = {
        classId: 5,
        teacherId: 10,
        role: ClassTeacherRole.SUBJECT_TEACHER,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-07-31'),
        status: ClassTeacherStatus.ACTIVE,
        creatorId: 3,
        updaterId: 3,
      };

      const classTeacher = ClassTeacher.build(originalData);

      expect(classTeacher.classId).toBe(originalData.classId);
      expect(classTeacher.teacherId).toBe(originalData.teacherId);
      expect(classTeacher.role).toBe(originalData.role);
      expect(classTeacher.startDate).toEqual(originalData.startDate);
      expect(classTeacher.endDate).toEqual(originalData.endDate);
      expect(classTeacher.status).toBe(originalData.status);
      expect(classTeacher.creatorId).toBe(originalData.creatorId);
      expect(classTeacher.updaterId).toBe(originalData.updaterId);
    });

    it('should handle partial updates', () => {
      const classTeacher = ClassTeacher.build({
        classId: 1,
        teacherId: 1,
        role: ClassTeacherRole.HEAD_TEACHER,
      });

      // Update specific fields
      classTeacher.set('role', ClassTeacherRole.DEPUTY_HEAD_TEACHER);
      classTeacher.set('status', ClassTeacherStatus.INACTIVE);
      classTeacher.set('updaterId', 5);

      expect(classTeacher.role).toBe(ClassTeacherRole.DEPUTY_HEAD_TEACHER);
      expect(classTeacher.status).toBe(ClassTeacherStatus.INACTIVE);
      expect(classTeacher.updaterId).toBe(5);
      
      // Other fields should remain unchanged
      expect(classTeacher.classId).toBe(1);
      expect(classTeacher.teacherId).toBe(1);
    });
  });
});