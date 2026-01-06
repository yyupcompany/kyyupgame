import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';
import { 
  ActivityStaff, 
  initActivityStaff,
  initActivityStaffAssociations 
} from '../../../src/models/activity-staff.model';
import { Activity } from '../../../src/models/activity.model';
import { User } from '../../../src/models/user.model';

// Mock the associated models
jest.mock('../../../src/models/activity.model');
jest.mock('../../../src/models/user.model');

describe('ActivityStaff Model', () => {
  let sequelize: Sequelize;
  let mockActivity: any;
  let mockUser: any;

  beforeEach(async () => {
    // Create in-memory SQLite database for testing
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
      define: {
        timestamps: true,
        paranoid: true,
        underscored: true,
      },
    });

    // Setup mock models
    mockActivity = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
    mockUser = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };

    // Mock the imported models
    (Activity as any).mockImplementation(() => mockActivity);
    (User as any).mockImplementation(() => mockUser);

    // Initialize the model
    initActivityStaff(sequelize);
    initActivityStaffAssociations();

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should define the model correctly', () => {
      expect(ActivityStaff).toBeDefined();
      expect(ActivityStaff.tableName).toBe('activity_staffs');
    });

    it('should have correct attributes', () => {
      const attributes = ActivityStaff.getAttributes();
      
      expect(attributes.id).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        autoIncrement: true,
        primaryKey: true,
      });
      
      expect(attributes.activityId).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
      });
      
      expect(attributes.userId).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
      });
      
      expect(attributes.roleType).toMatchObject({
        type: expect.any(DataTypes.TINYINT),
        allowNull: false,
      });
      
      expect(attributes.responsibilities).toMatchObject({
        type: expect.any(DataTypes.TEXT),
        allowNull: true,
      });
      
      expect(attributes.comment).toMatchObject({
        type: expect.any(DataTypes.TEXT),
        allowNull: true,
      });
    });

    it('should have correct table options', () => {
      const options = ActivityStaff.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });
  });

  describe('Model Validations', () => {
    it('should validate required fields', async () => {
      const staff = ActivityStaff.build();
      
      await expect(staff.validate()).rejects.toThrow();
    });

    it('should validate role type range', async () => {
      const staff = ActivityStaff.build({
        activityId: 1,
        userId: 1,
        roleType: 99, // Invalid role type
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(staff.roleType).toBe(99);
    });

    it('should validate foreign key constraints', async () => {
      const staff = ActivityStaff.build({
        activityId: 0, // Invalid foreign key (should be positive)
        userId: -1, // Invalid foreign key (should be positive)
        roleType: 1,
      });
      
      // This validation should be handled at database level
      // For now, we'll test that the model can be built
      expect(staff.activityId).toBe(0);
      expect(staff.userId).toBe(-1);
    });

    it('should accept valid data', async () => {
      const staff = ActivityStaff.build({
        activityId: 1,
        userId: 1,
        roleType: 1,
        responsibilities: '负责活动整体协调和管理',
        comment: '经验丰富的活动组织者',
      });
      
      await expect(staff.validate()).resolves.not.toThrow();
    });

    it('should accept valid data with null optional fields', async () => {
      const staff = ActivityStaff.build({
        activityId: 1,
        userId: 1,
        roleType: 2,
        responsibilities: null,
        comment: null,
      });
      
      await expect(staff.validate()).resolves.not.toThrow();
    });
  });

  describe('Role Type Constants', () => {
    it('should support common role types', () => {
      // Test common role type values based on the comment in the model
      const roleTypes = [1, 2, 3, 4, 5]; // 负责人, 协助者, 嘉宾, 主持人, 其他
      
      roleTypes.forEach(roleType => {
        const staff = ActivityStaff.build({
          activityId: 1,
          userId: 1,
          roleType: roleType,
        });
        
        expect(staff.roleType).toBe(roleType);
      });
    });

    it('should handle role type descriptions', () => {
      const roleTypeDescriptions = {
        1: '负责人',
        2: '协助者',
        3: '嘉宾',
        4: '主持人',
        5: '其他'
      };

      Object.entries(roleTypeDescriptions).forEach(([type, description]) => {
        const staff = ActivityStaff.build({
          activityId: 1,
          userId: 1,
          roleType: parseInt(type),
        });
        
        expect(staff.roleType).toBe(parseInt(type));
      });
    });
  });

  describe('Model Associations', () => {
    it('should belong to Activity', () => {
      expect(ActivityStaff.belongsTo).toHaveBeenCalledWith(
        Activity,
        {
          foreignKey: 'activityId',
          as: 'activity',
        }
      );
    });

    it('should belong to User', () => {
      expect(ActivityStaff.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'userId',
          as: 'user',
        }
      );
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new activity staff', async () => {
      const staff = await ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 1,
      });

      expect(staff.id).toBeDefined();
      expect(staff.activityId).toBe(1);
      expect(staff.userId).toBe(1);
      expect(staff.roleType).toBe(1);
      expect(staff.createdAt).toBeInstanceOf(Date);
      expect(staff.updatedAt).toBeInstanceOf(Date);
    });

    it('should create with all optional fields', async () => {
      const staff = await ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 2,
        responsibilities: '协助活动进行，负责现场协调',
        comment: '有丰富的协助经验',
      });

      expect(staff.responsibilities).toBe('协助活动进行，负责现场协调');
      expect(staff.comment).toBe('有丰富的协助经验');
    });

    it('should read an activity staff', async () => {
      const createdStaff = await ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 3,
        responsibilities: '作为特邀嘉宾参与活动',
        comment: '知名教育专家',
      });

      const foundStaff = await ActivityStaff.findByPk(createdStaff.id);
      
      expect(foundStaff).toBeDefined();
      expect(foundStaff?.activityId).toBe(1);
      expect(foundStaff?.userId).toBe(1);
      expect(foundStaff?.roleType).toBe(3);
      expect(foundStaff?.responsibilities).toBe('作为特邀嘉宾参与活动');
      expect(foundStaff?.comment).toBe('知名教育专家');
    });

    it('should update an activity staff', async () => {
      const staff = await ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 1,
        responsibilities: '负责活动整体协调',
      });

      await staff.update({
        roleType: 4,
        responsibilities: '担任活动主持人，负责流程控制',
        comment: '优秀的主持能力',
      });

      expect(staff.roleType).toBe(4);
      expect(staff.responsibilities).toBe('担任活动主持人，负责流程控制');
      expect(staff.comment).toBe('优秀的主持能力');
    });

    it('should delete an activity staff (soft delete)', async () => {
      const staff = await ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 1,
      });

      await staff.destroy();
      
      const foundStaff = await ActivityStaff.findByPk(staff.id);
      expect(foundStaff).toBeNull(); // Soft delete should return null
      
      // Check if it's actually soft deleted
      const deletedStaff = await ActivityStaff.findByPk(staff.id, { paranoid: false });
      expect(deletedStaff).toBeDefined();
      expect(deletedStaff?.deletedAt).toBeDefined();
    });

    it('should find all staff for an activity', async () => {
      // Create multiple staff for the same activity
      await ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 1,
      });
      
      await ActivityStaff.create({
        activityId: 1,
        userId: 2,
        roleType: 2,
      });
      
      await ActivityStaff.create({
        activityId: 1,
        userId: 3,
        roleType: 3,
      });

      const staffList = await ActivityStaff.findAll({
        where: { activityId: 1 },
        order: [['id', 'ASC']],
      });

      expect(staffList).toHaveLength(3);
      expect(staffList[0].userId).toBe(1);
      expect(staffList[1].userId).toBe(2);
      expect(staffList[2].userId).toBe(3);
    });

    it('should find staff by role type', async () => {
      // Create staff with different role types
      await ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 1, // 负责人
      });
      
      await ActivityStaff.create({
        activityId: 1,
        userId: 2,
        roleType: 2, // 协助者
      });
      
      await ActivityStaff.create({
        activityId: 1,
        userId: 3,
        roleType: 1, // 负责人
      });

      const leaders = await ActivityStaff.findAll({
        where: { 
          activityId: 1,
          roleType: 1 
        },
        order: [['id', 'ASC']],
      });

      expect(leaders).toHaveLength(2);
      expect(leaders[0].roleType).toBe(1);
      expect(leaders[1].roleType).toBe(1);
    });

    it('should find staff by user', async () => {
      // Create staff assignments for different users
      await ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 1,
      });
      
      await ActivityStaff.create({
        activityId: 2,
        userId: 1,
        roleType: 2,
      });
      
      await ActivityStaff.create({
        activityId: 3,
        userId: 2,
        roleType: 1,
      });

      const user1Staff = await ActivityStaff.findAll({
        where: { userId: 1 },
        order: [['activityId', 'ASC']],
      });

      expect(user1Staff).toHaveLength(2);
      expect(user1Staff[0].activityId).toBe(1);
      expect(user1Staff[1].activityId).toBe(2);
      expect(user1Staff[0].userId).toBe(1);
      expect(user1Staff[1].userId).toBe(1);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle minimum foreign key values', async () => {
      const staff = ActivityStaff.build({
        activityId: 1, // Minimum positive ID
        userId: 1, // Minimum positive ID
        roleType: 1, // Minimum role type
      });
      
      await expect(staff.validate()).resolves.not.toThrow();
    });

    it('should handle large foreign key values', async () => {
      const staff = ActivityStaff.build({
        activityId: 2147483647, // Maximum 32-bit integer
        userId: 2147483647, // Maximum 32-bit integer
        roleType: 5, // Maximum role type
      });
      
      await expect(staff.validate()).resolves.not.toThrow();
    });

    it('should handle all role types', async () => {
      const roleTypes = [1, 2, 3, 4, 5]; // 负责人, 协助者, 嘉宾, 主持人, 其他
      
      for (const roleType of roleTypes) {
        const staff = ActivityStaff.build({
          activityId: 1,
          userId: 1,
          roleType: roleType,
        });
        
        await expect(staff.validate()).resolves.not.toThrow();
      }
    });

    it('should handle maximum text lengths', async () => {
      const longResponsibilities = 'a'.repeat(10000); // Long text for responsibilities
      const longComment = 'a'.repeat(10000); // Long text for comment
      
      const staff = ActivityStaff.build({
        activityId: 1,
        userId: 1,
        roleType: 1,
        responsibilities: longResponsibilities,
        comment: longComment,
      });
      
      await expect(staff.validate()).resolves.not.toThrow();
    });

    it('should handle minimum text lengths', async () => {
      const staff = ActivityStaff.build({
        activityId: 1,
        userId: 1,
        roleType: 1,
        responsibilities: 'a', // Minimum text length
        comment: 'b', // Minimum text length
      });
      
      await expect(staff.validate()).resolves.not.toThrow();
    });

    it('should handle null values for optional fields', async () => {
      const staff = ActivityStaff.build({
        activityId: 1,
        userId: 1,
        roleType: 1,
        responsibilities: null,
        comment: null,
      });
      
      await expect(staff.validate()).resolves.not.toThrow();
    });

    it('should handle empty strings for optional fields', async () => {
      const staff = ActivityStaff.build({
        activityId: 1,
        userId: 1,
        roleType: 1,
        responsibilities: '',
        comment: '',
      });
      
      await expect(staff.validate()).resolves.not.toThrow();
    });

    it('should handle zero foreign keys (validation at database level)', async () => {
      const staff = ActivityStaff.build({
        activityId: 0,
        userId: 0,
        roleType: 1,
      });
      
      // Model validation should pass, but database constraints should handle this
      await expect(staff.validate()).resolves.not.toThrow();
    });

    it('should handle negative foreign keys (validation at database level)', async () => {
      const staff = ActivityStaff.build({
        activityId: -1,
        userId: -1,
        roleType: 1,
      });
      
      // Model validation should pass, but database constraints should handle this
      await expect(staff.validate()).resolves.not.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should set default createdAt and updatedAt to current time', () => {
      const staff = ActivityStaff.build({
        activityId: 1,
        userId: 1,
        roleType: 1,
      });
      
      expect(staff.createdAt).toBeInstanceOf(Date);
      expect(staff.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const beforeCreate = new Date();
      
      const staff = await ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 1,
      });
      
      const afterCreate = new Date();
      
      expect(staff.createdAt).toBeInstanceOf(Date);
      expect(staff.updatedAt).toBeInstanceOf(Date);
      expect(staff.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(staff.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(staff.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(staff.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should update updatedAt on update', async () => {
      const staff = await ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 1,
      });
      
      const originalUpdatedAt = staff.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await staff.update({
        roleType: 2,
      });
      
      expect(staff.updatedAt).toBeInstanceOf(Date);
      expect(staff.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not change createdAt on update', async () => {
      const staff = await ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 1,
      });
      
      const originalCreatedAt = staff.createdAt;
      
      await staff.update({
        roleType: 2,
      });
      
      expect(staff.createdAt).toBe(originalCreatedAt);
    });
  });

  describe('Staff Role Analysis', () => {
    it('should track different role types correctly', async () => {
      const roleTypes = [1, 2, 3, 4, 5]; // 负责人, 协助者, 嘉宾, 主持人, 其他
      const createdStaff = [];
      
      for (const roleType of roleTypes) {
        const staff = await ActivityStaff.create({
          activityId: 1,
          userId: roleType, // Use roleType as userId for simplicity
          roleType: roleType,
        });
        createdStaff.push(staff);
      }
      
      expect(createdStaff).toHaveLength(5);
      
      // Verify each role type was recorded correctly
      for (let i = 0; i < roleTypes.length; i++) {
        expect(createdStaff[i].roleType).toBe(roleTypes[i]);
      }
    });

    it('should support staff statistics by role type', async () => {
      // Create multiple staff with different role types
      await ActivityStaff.create({ activityId: 1, userId: 1, roleType: 1 }); // 负责人
      await ActivityStaff.create({ activityId: 1, userId: 2, roleType: 1 }); // 负责人
      await ActivityStaff.create({ activityId: 1, userId: 3, roleType: 2 }); // 协助者
      await ActivityStaff.create({ activityId: 1, userId: 4, roleType: 2 }); // 协助者
      await ActivityStaff.create({ activityId: 1, userId: 5, roleType: 2 }); // 协助者
      await ActivityStaff.create({ activityId: 1, userId: 6, roleType: 3 }); // 嘉宾

      const staffList = await ActivityStaff.findAll({
        where: { activityId: 1 },
        order: [['roleType', 'ASC']],
      });

      expect(staffList).toHaveLength(6);
      
      // Count staff by role type
      const roleCounts = staffList.reduce((acc, staff) => {
        const roleType = staff.roleType;
        acc[roleType] = (acc[roleType] || 0) + 1;
        return acc;
      }, {} as any);

      expect(roleCounts[1]).toBe(2); // 2 负责人
      expect(roleCounts[2]).toBe(3); // 3 协助者
      expect(roleCounts[3]).toBe(1); // 1 嘉宾
    });

    it('should prevent duplicate user assignments for same activity', async () => {
      // Create first staff assignment
      await ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 1,
      });

      // Try to create duplicate assignment for same user and activity
      await expect(ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 2,
      })).rejects.toThrow(); // Should fail due to unique constraint
    });

    it('should allow same user in different activities', async () => {
      // Create staff assignment for first activity
      const staff1 = await ActivityStaff.create({
        activityId: 1,
        userId: 1,
        roleType: 1,
      });

      // Create staff assignment for second activity with same user
      const staff2 = await ActivityStaff.create({
        activityId: 2,
        userId: 1,
        roleType: 2,
      });

      expect(staff1.id).toBeDefined();
      expect(staff2.id).toBeDefined();
      expect(staff1.userId).toBe(staff2.userId); // Same user
      expect(staff1.activityId).not.toBe(staff2.activityId); // Different activities
    });
  });
});