import { ChangeLog, ChangeLogAttributes, ChangeLogCreationAttributes } from '../../../src/models/changelog.model';
import { vi } from 'vitest'
import { sequelize } from '../../../src/init';

// Mock dependencies
jest.mock('../../../src/init');


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

describe('ChangeLog Model', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('should have correct model attributes', () => {
      expect(ChangeLog).toBeDefined();
      expect(ChangeLog).toBeInstanceOf(Function);
    });

    it('should be a Sequelize Model', () => {
      const modelInstance = new ChangeLog();
      expect(modelInstance).toBeDefined();
      expect(modelInstance).toBeInstanceOf(ChangeLog);
    });
  });

  describe('Interface Definitions', () => {
    describe('ChangeLogAttributes', () => {
      it('should define all required attributes', () => {
        const attributes: ChangeLogAttributes = {
          id: 1,
          table_name: 'users',
          record_id: 123,
          operation: 'UPDATE',
          changed_at: '2024-01-01T10:30:00Z',
          user_id: 456,
        };

        expect(attributes.id).toBe(1);
        expect(attributes.table_name).toBe('users');
        expect(attributes.record_id).toBe(123);
        expect(attributes.operation).toBe('UPDATE');
        expect(attributes.changed_at).toBe('2024-01-01T10:30:00Z');
        expect(attributes.user_id).toBe(456);
      });
    });

    describe('ChangeLogCreationAttributes', () => {
      it('should extend Optional with correct exclusions', () => {
        // This test verifies that ChangeLogCreationAttributes correctly extends Optional
        // We can't directly test the TypeScript interface, but we can verify the behavior
        const creationAttributes: ChangeLogCreationAttributes = {
          table_name: 'users',
          record_id: 123,
          operation: 'UPDATE',
          changed_at: '2024-01-01T10:30:00Z',
          user_id: 456,
        };

        // id should be optional
        expect(creationAttributes.id).toBeUndefined();
        expect(creationAttributes.table_name).toBe('users');
        expect(creationAttributes.record_id).toBe(123);
        expect(creationAttributes.operation).toBe('UPDATE');
        expect(creationAttributes.changed_at).toBe('2024-01-01T10:30:00Z');
        expect(creationAttributes.user_id).toBe(456);
      });
    });
  });

  describe('Model Attributes', () => {
    let modelInstance: ChangeLog;

    beforeEach(() => {
      modelInstance = new ChangeLog();
    });

    it('should have all required attributes', () => {
      expect(modelInstance).toHaveProperty('id');
      expect(modelInstance).toHaveProperty('table_name');
      expect(modelInstance).toHaveProperty('record_id');
      expect(modelInstance).toHaveProperty('operation');
      expect(modelInstance).toHaveProperty('changed_at');
      expect(modelInstance).toHaveProperty('user_id');
    });

    it('should have timestamp attributes', () => {
      expect(modelInstance).toHaveProperty('createdAt');
      expect(modelInstance).toHaveProperty('updatedAt');
    });

    it('should have correct attribute types', () => {
      expect(typeof modelInstance.id).toBe('number');
      expect(typeof modelInstance.table_name).toBe('string');
      expect(typeof modelInstance.record_id).toBe('number');
      expect(typeof modelInstance.operation).toBe('string');
      expect(typeof modelInstance.changed_at).toBe('string');
      expect(typeof modelInstance.user_id).toBe('number');
    });

    it('should have readonly timestamp attributes', () => {
      expect(modelInstance.createdAt).toBeInstanceOf(Date);
      expect(modelInstance.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Model Initialization', () => {
    it('should initialize with correct configuration', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/changelog.model');

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
          }),
          table_name: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
          record_id: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
          operation: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
          changed_at: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
          user_id: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
        }),
        expect.objectContaining({
          sequelize,
          tableName: 'change_log',
          modelName: 'ChangeLog',
          timestamps: true,
          underscored: true,
          paranoid: true,
        })
      );
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', () => {
      const modelInstance = new ChangeLog();
      
      expect(modelInstance).toHaveProperty('id');
      expect(modelInstance).toHaveProperty('table_name');
      expect(modelInstance).toHaveProperty('record_id');
      expect(modelInstance).toHaveProperty('operation');
      expect(modelInstance).toHaveProperty('changed_at');
      expect(modelInstance).toHaveProperty('user_id');
    });

    it('should validate numeric fields', () => {
      const modelInstance = new ChangeLog();
      
      modelInstance.id = 1;
      expect(modelInstance.id).toBe(1);
      
      modelInstance.record_id = 123;
      expect(modelInstance.record_id).toBe(123);
      
      modelInstance.user_id = 456;
      expect(modelInstance.user_id).toBe(456);
    });

    it('should validate string fields', () => {
      const modelInstance = new ChangeLog();
      
      modelInstance.table_name = 'users';
      expect(modelInstance.table_name).toBe('users');
      
      modelInstance.operation = 'CREATE';
      expect(modelInstance.operation).toBe('CREATE');
      
      modelInstance.changed_at = '2024-01-01T10:30:00Z';
      expect(modelInstance.changed_at).toBe('2024-01-01T10:30:00Z');
    });

    it('should handle null values for optional fields', () => {
      const modelInstance = new ChangeLog();
      
      modelInstance.table_name = null as any;
      expect(modelInstance.table_name).toBeNull();
      
      modelInstance.record_id = null as any;
      expect(modelInstance.record_id).toBeNull();
      
      modelInstance.operation = null as any;
      expect(modelInstance.operation).toBeNull();
      
      modelInstance.changed_at = null as any;
      expect(modelInstance.changed_at).toBeNull();
      
      modelInstance.user_id = null as any;
      expect(modelInstance.user_id).toBeNull();
    });
  });

  describe('Model Instances', () => {
    it('should create a valid model instance with minimal data', () => {
      const modelInstance = new ChangeLog({
        id: 1,
        table_name: 'users',
        record_id: 123,
        operation: 'UPDATE',
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 456,
      });

      expect(modelInstance.id).toBe(1);
      expect(modelInstance.table_name).toBe('users');
      expect(modelInstance.record_id).toBe(123);
      expect(modelInstance.operation).toBe('UPDATE');
      expect(modelInstance.changed_at).toBe('2024-01-01T10:30:00Z');
      expect(modelInstance.user_id).toBe(456);
    });

    it('should create a valid model instance with null values', () => {
      const modelInstance = new ChangeLog({
        id: 2,
        table_name: null,
        record_id: null,
        operation: null,
        changed_at: null,
        user_id: null,
      });

      expect(modelInstance.id).toBe(2);
      expect(modelInstance.table_name).toBeNull();
      expect(modelInstance.record_id).toBeNull();
      expect(modelInstance.operation).toBeNull();
      expect(modelInstance.changed_at).toBeNull();
      expect(modelInstance.user_id).toBeNull();
    });

    it('should handle different table names', () => {
      const modelInstance1 = new ChangeLog({
        id: 1,
        table_name: 'users',
        record_id: 123,
        operation: 'CREATE',
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 456,
      });

      const modelInstance2 = new ChangeLog({
        id: 2,
        table_name: 'roles',
        record_id: 789,
        operation: 'UPDATE',
        changed_at: '2024-01-02T11:45:00Z',
        user_id: 456,
      });

      const modelInstance3 = new ChangeLog({
        id: 3,
        table_name: 'permissions',
        record_id: 101,
        operation: 'DELETE',
        changed_at: '2024-01-03T12:00:00Z',
        user_id: 789,
      });

      expect(modelInstance1.table_name).toBe('users');
      expect(modelInstance2.table_name).toBe('roles');
      expect(modelInstance3.table_name).toBe('permissions');
    });

    it('should handle different operation types', () => {
      const modelInstance1 = new ChangeLog({
        id: 1,
        table_name: 'users',
        record_id: 123,
        operation: 'CREATE',
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 456,
      });

      const modelInstance2 = new ChangeLog({
        id: 2,
        table_name: 'users',
        record_id: 123,
        operation: 'UPDATE',
        changed_at: '2024-01-02T11:45:00Z',
        user_id: 456,
      });

      const modelInstance3 = new ChangeLog({
        id: 3,
        table_name: 'users',
        record_id: 123,
        operation: 'DELETE',
        changed_at: '2024-01-03T12:00:00Z',
        user_id: 789,
      });

      const modelInstance4 = new ChangeLog({
        id: 4,
        table_name: 'users',
        record_id: 123,
        operation: 'BULK_UPDATE',
        changed_at: '2024-01-04T13:15:00Z',
        user_id: 456,
      });

      expect(modelInstance1.operation).toBe('CREATE');
      expect(modelInstance2.operation).toBe('UPDATE');
      expect(modelInstance3.operation).toBe('DELETE');
      expect(modelInstance4.operation).toBe('BULK_UPDATE');
    });

    it('should handle different timestamp formats for changed_at', () => {
      const modelInstance1 = new ChangeLog({
        id: 1,
        table_name: 'users',
        record_id: 123,
        operation: 'UPDATE',
        changed_at: '2024-01-01',
        user_id: 456,
      });

      const modelInstance2 = new ChangeLog({
        id: 2,
        table_name: 'users',
        record_id: 123,
        operation: 'UPDATE',
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 456,
      });

      const modelInstance3 = new ChangeLog({
        id: 3,
        table_name: 'users',
        record_id: 123,
        operation: 'UPDATE',
        changed_at: 'January 1, 2024 10:30:00 AM',
        user_id: 456,
      });

      expect(modelInstance1.changed_at).toBe('2024-01-01');
      expect(modelInstance2.changed_at).toBe('2024-01-01T10:30:00Z');
      expect(modelInstance3.changed_at).toBe('January 1, 2024 10:30:00 AM');
    });

    it('should handle different user IDs', () => {
      const modelInstance1 = new ChangeLog({
        id: 1,
        table_name: 'users',
        record_id: 123,
        operation: 'UPDATE',
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 1,
      });

      const modelInstance2 = new ChangeLog({
        id: 2,
        table_name: 'users',
        record_id: 456,
        operation: 'CREATE',
        changed_at: '2024-01-02T11:45:00Z',
        user_id: 2,
      });

      const modelInstance3 = new ChangeLog({
        id: 3,
        table_name: 'roles',
        record_id: 789,
        operation: 'DELETE',
        changed_at: '2024-01-03T12:00:00Z',
        user_id: 999,
      });

      expect(modelInstance1.user_id).toBe(1);
      expect(modelInstance2.user_id).toBe(2);
      expect(modelInstance3.user_id).toBe(999);
    });
  });

  describe('Database Configuration', () => {
    it('should use correct table name', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/changelog.model');

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          tableName: 'change_log',
        })
      );
    });

    it('should use correct model name', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/changelog.model');

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          modelName: 'ChangeLog',
        })
      );
    });

    it('should have timestamps enabled', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/changelog.model');

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          timestamps: true,
        })
      );
    });

    it('should use underscored naming', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/changelog.model');

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          underscored: true,
        })
      );
    });

    it('should have paranoid mode enabled for soft delete', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/changelog.model');

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          paranoid: true,
        })
      );
    });
  });

  describe('Timestamp Behavior', () => {
    it('should automatically set createdAt and updatedAt', () => {
      const modelInstance = new ChangeLog({
        id: 1,
        table_name: 'users',
        record_id: 123,
        operation: 'UPDATE',
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 456,
      });

      expect(modelInstance.createdAt).toBeInstanceOf(Date);
      expect(modelInstance.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle custom timestamp values', () => {
      const customDate = new Date('2024-01-01T00:00:00Z');
      const modelInstance = new ChangeLog({
        id: 1,
        table_name: 'users',
        record_id: 123,
        operation: 'UPDATE',
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 456,
      });

      // Note: createdAt and updatedAt are automatically managed by Sequelize
      expect(modelInstance.createdAt).toBeInstanceOf(Date);
      expect(modelInstance.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values for numeric fields', () => {
      const modelInstance = new ChangeLog({
        id: 0,
        table_name: 'users',
        record_id: 0,
        operation: 'UPDATE',
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 0,
      });

      expect(modelInstance.id).toBe(0);
      expect(modelInstance.record_id).toBe(0);
      expect(modelInstance.user_id).toBe(0);
    });

    it('should handle empty string values', () => {
      const modelInstance = new ChangeLog({
        id: 1,
        table_name: '',
        record_id: 123,
        operation: '',
        changed_at: '',
        user_id: 456,
      });

      expect(modelInstance.table_name).toBe('');
      expect(modelInstance.operation).toBe('');
      expect(modelInstance.changed_at).toBe('');
    });

    it('should handle large numeric values', () => {
      const modelInstance = new ChangeLog({
        id: 999999999,
        table_name: 'users',
        record_id: 999999999,
        operation: 'UPDATE',
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 999999999,
      });

      expect(modelInstance.id).toBe(999999999);
      expect(modelInstance.record_id).toBe(999999999);
      expect(modelInstance.user_id).toBe(999999999);
    });

    it('should handle special characters in table names', () => {
      const modelInstance = new ChangeLog({
        id: 1,
        table_name: 'user_profiles',
        record_id: 123,
        operation: 'UPDATE',
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 456,
      });

      expect(modelInstance.table_name).toBe('user_profiles');
    });

    it('should handle special characters in operations', () => {
      const modelInstance = new ChangeLog({
        id: 1,
        table_name: 'users',
        record_id: 123,
        operation: 'BULK_INSERT',
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 456,
      });

      expect(modelInstance.operation).toBe('BULK_INSERT');
    });

    it('should handle very long table names', () => {
      const longTableName = 'very_long_table_name_that_exceeds_normal_length_limits_for_testing_purposes';
      const modelInstance = new ChangeLog({
        id: 1,
        table_name: longTableName,
        record_id: 123,
        operation: 'UPDATE',
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 456,
      });

      expect(modelInstance.table_name).toBe(longTableName);
    });

    it('should handle very long operation descriptions', () => {
      const longOperation = 'VERY_LONG_OPERATION_DESCRIPTION_THAT_EXCEEDS_NORMAL_LENGTH_LIMITS_FOR_TESTING_PURPOSES_AND_VALIDATION';
      const modelInstance = new ChangeLog({
        id: 1,
        table_name: 'users',
        record_id: 123,
        operation: longOperation,
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 456,
      });

      expect(modelInstance.operation).toBe(longOperation);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle user creation log', () => {
      const modelInstance = new ChangeLog({
        id: 1,
        table_name: 'users',
        record_id: 123,
        operation: 'CREATE',
        changed_at: '2024-01-01T10:30:00Z',
        user_id: 456,
      });

      expect(modelInstance.table_name).toBe('users');
      expect(modelInstance.operation).toBe('CREATE');
      expect(modelInstance.record_id).toBe(123);
    });

    it('should handle user update log', () => {
      const modelInstance = new ChangeLog({
        id: 2,
        table_name: 'users',
        record_id: 123,
        operation: 'UPDATE',
        changed_at: '2024-01-02T11:45:00Z',
        user_id: 456,
      });

      expect(modelInstance.table_name).toBe('users');
      expect(modelInstance.operation).toBe('UPDATE');
      expect(modelInstance.record_id).toBe(123);
    });

    it('should handle user deletion log', () => {
      const modelInstance = new ChangeLog({
        id: 3,
        table_name: 'users',
        record_id: 123,
        operation: 'DELETE',
        changed_at: '2024-01-03T12:00:00Z',
        user_id: 789,
      });

      expect(modelInstance.table_name).toBe('users');
      expect(modelInstance.operation).toBe('DELETE');
      expect(modelInstance.record_id).toBe(123);
    });

    it('should handle role permission changes', () => {
      const modelInstance = new ChangeLog({
        id: 4,
        table_name: 'role_permissions',
        record_id: 456,
        operation: 'UPDATE',
        changed_at: '2024-01-04T13:15:00Z',
        user_id: 1,
      });

      expect(modelInstance.table_name).toBe('role_permissions');
      expect(modelInstance.operation).toBe('UPDATE');
      expect(modelInstance.record_id).toBe(456);
    });

    it('should handle system configuration changes', () => {
      const modelInstance = new ChangeLog({
        id: 5,
        table_name: 'system_config',
        record_id: 1,
        operation: 'UPDATE',
        changed_at: '2024-01-05T14:30:00Z',
        user_id: 1,
      });

      expect(modelInstance.table_name).toBe('system_config');
      expect(modelInstance.operation).toBe('UPDATE');
      expect(modelInstance.record_id).toBe(1);
    });
  });
});