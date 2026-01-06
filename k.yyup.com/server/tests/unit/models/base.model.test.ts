import { Base, BaseAttributes, BaseCreationAttributes } from '../../../src/models/base.model';
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

describe('Base Model', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('should have correct model attributes', () => {
      expect(Base).toBeDefined();
      expect(Base).toBeInstanceOf(Function);
    });

    it('should be a Sequelize Model', () => {
      const modelInstance = new Base();
      expect(modelInstance).toBeDefined();
      expect(modelInstance).toBeInstanceOf(Base);
    });
  });

  describe('Interface Definitions', () => {
    describe('BaseAttributes', () => {
      it('should define all required attributes', () => {
        const attributes: BaseAttributes = {
          id: 1,
          creator_id: 1,
          updater_id: 1,
          created_at: '2024-01-01',
          updated_at: new Date(),
          deleted_at: '2024-01-02',
          is_system: 'true',
        };

        expect(attributes.id).toBe(1);
        expect(attributes.creator_id).toBe(1);
        expect(attributes.updater_id).toBe(1);
        expect(attributes.created_at).toBe('2024-01-01');
        expect(attributes.updated_at).toBeInstanceOf(Date);
        expect(attributes.deleted_at).toBe('2024-01-02');
        expect(attributes.is_system).toBe('true');
      });
    });

    describe('BaseCreationAttributes', () => {
      it('should extend Optional with correct exclusions', () => {
        // This test verifies that BaseCreationAttributes correctly extends Optional
        // We can't directly test the TypeScript interface, but we can verify the behavior
        const creationAttributes: BaseCreationAttributes = {
          creator_id: 1,
          updater_id: 1,
          created_at: '2024-01-01',
          deleted_at: '2024-01-02',
          is_system: 'true',
        };

        // id, created_at, and updated_at should be optional
        expect(creationAttributes.id).toBeUndefined();
        expect(creationAttributes.creator_id).toBe(1);
        expect(creationAttributes.updater_id).toBe(1);
        expect(creationAttributes.created_at).toBe('2024-01-01');
        expect(creationAttributes.deleted_at).toBe('2024-01-02');
        expect(creationAttributes.is_system).toBe('true');
      });
    });
  });

  describe('Model Attributes', () => {
    let modelInstance: Base;

    beforeEach(() => {
      modelInstance = new Base();
    });

    it('should have all required attributes', () => {
      expect(modelInstance).toHaveProperty('id');
      expect(modelInstance).toHaveProperty('creator_id');
      expect(modelInstance).toHaveProperty('updater_id');
      expect(modelInstance).toHaveProperty('created_at');
      expect(modelInstance).toHaveProperty('updated_at');
      expect(modelInstance).toHaveProperty('deleted_at');
      expect(modelInstance).toHaveProperty('is_system');
    });

    it('should have timestamp attributes', () => {
      expect(modelInstance).toHaveProperty('createdAt');
      expect(modelInstance).toHaveProperty('updatedAt');
    });

    it('should have correct attribute types', () => {
      // Test that attributes are properly defined
      expect(typeof modelInstance.id).toBe('number');
      expect(typeof modelInstance.creator_id).toBe('number');
      expect(typeof modelInstance.updater_id).toBe('number');
      expect(typeof modelInstance.created_at).toBe('string');
      expect(typeof modelInstance.updated_at).toBe('object'); // Date object
      expect(typeof modelInstance.deleted_at).toBe('string');
      expect(typeof modelInstance.is_system).toBe('string');
    });

    it('should have readonly timestamp attributes', () => {
      expect(modelInstance.createdAt).toBeInstanceOf(Date);
      expect(modelInstance.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Model Initialization', () => {
    it('should initialize with correct configuration', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/base.model');

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
          }),
          creator_id: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
          updater_id: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
          created_at: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
          updated_at: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
          deleted_at: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
          is_system: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
        }),
        expect.objectContaining({
          sequelize,
          tableName: 'base',
          modelName: 'Base',
          timestamps: true,
          underscored: true,
          paranoid: true,
        })
      );
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', () => {
      const modelInstance = new Base();
      
      expect(modelInstance).toHaveProperty('id');
      expect(modelInstance).toHaveProperty('creator_id');
      expect(modelInstance).toHaveProperty('updater_id');
      expect(modelInstance).toHaveProperty('created_at');
      expect(modelInstance).toHaveProperty('updated_at');
      expect(modelInstance).toHaveProperty('deleted_at');
      expect(modelInstance).toHaveProperty('is_system');
    });

    it('should validate numeric fields', () => {
      const modelInstance = new Base();
      
      modelInstance.id = 1;
      expect(modelInstance.id).toBe(1);
      
      modelInstance.creator_id = 100;
      expect(modelInstance.creator_id).toBe(100);
      
      modelInstance.updater_id = 200;
      expect(modelInstance.updater_id).toBe(200);
    });

    it('should validate string fields', () => {
      const modelInstance = new Base();
      
      modelInstance.created_at = '2024-01-01T00:00:00Z';
      expect(modelInstance.created_at).toBe('2024-01-01T00:00:00Z');
      
      modelInstance.deleted_at = '2024-01-02T00:00:00Z';
      expect(modelInstance.deleted_at).toBe('2024-01-02T00:00:00Z');
      
      modelInstance.is_system = 'true';
      expect(modelInstance.is_system).toBe('true');
      
      modelInstance.is_system = 'false';
      expect(modelInstance.is_system).toBe('false');
    });

    it('should validate date fields', () => {
      const modelInstance = new Base();
      const testDate = new Date();
      
      modelInstance.updated_at = testDate;
      expect(modelInstance.updated_at).toBe(testDate);
    });

    it('should handle null values for optional fields', () => {
      const modelInstance = new Base();
      
      modelInstance.creator_id = null as any;
      expect(modelInstance.creator_id).toBeNull();
      
      modelInstance.updater_id = null as any;
      expect(modelInstance.updater_id).toBeNull();
      
      modelInstance.created_at = null as any;
      expect(modelInstance.created_at).toBeNull();
      
      modelInstance.updated_at = null as any;
      expect(modelInstance.updated_at).toBeNull();
      
      modelInstance.deleted_at = null as any;
      expect(modelInstance.deleted_at).toBeNull();
      
      modelInstance.is_system = null as any;
      expect(modelInstance.is_system).toBeNull();
    });
  });

  describe('Model Instances', () => {
    it('should create a valid model instance with minimal data', () => {
      const modelInstance = new Base({
        id: 1,
        creator_id: 1,
        updater_id: 1,
        created_at: '2024-01-01',
        updated_at: new Date(),
        deleted_at: '2024-01-02',
        is_system: 'false',
      });

      expect(modelInstance.id).toBe(1);
      expect(modelInstance.creator_id).toBe(1);
      expect(modelInstance.updater_id).toBe(1);
      expect(modelInstance.created_at).toBe('2024-01-01');
      expect(modelInstance.updated_at).toBeInstanceOf(Date);
      expect(modelInstance.deleted_at).toBe('2024-01-02');
      expect(modelInstance.is_system).toBe('false');
    });

    it('should create a valid model instance with null values', () => {
      const modelInstance = new Base({
        id: 2,
        creator_id: null,
        updater_id: null,
        created_at: null,
        updated_at: null,
        deleted_at: null,
        is_system: null,
      });

      expect(modelInstance.id).toBe(2);
      expect(modelInstance.creator_id).toBeNull();
      expect(modelInstance.updater_id).toBeNull();
      expect(modelInstance.created_at).toBeNull();
      expect(modelInstance.updated_at).toBeNull();
      expect(modelInstance.deleted_at).toBeNull();
      expect(modelInstance.is_system).toBeNull();
    });

    it('should handle different is_system values', () => {
      const modelInstance1 = new Base({
        id: 1,
        creator_id: 1,
        updater_id: 1,
        created_at: '2024-01-01',
        updated_at: new Date(),
        deleted_at: '2024-01-02',
        is_system: 'true',
      });

      const modelInstance2 = new Base({
        id: 2,
        creator_id: 2,
        updater_id: 2,
        created_at: '2024-01-02',
        updated_at: new Date(),
        deleted_at: '2024-01-03',
        is_system: 'false',
      });

      const modelInstance3 = new Base({
        id: 3,
        creator_id: 3,
        updater_id: 3,
        created_at: '2024-01-03',
        updated_at: new Date(),
        deleted_at: '2024-01-04',
        is_system: '1',
      });

      const modelInstance4 = new Base({
        id: 4,
        creator_id: 4,
        updater_id: 4,
        created_at: '2024-01-04',
        updated_at: new Date(),
        deleted_at: '2024-01-05',
        is_system: '0',
      });

      expect(modelInstance1.is_system).toBe('true');
      expect(modelInstance2.is_system).toBe('false');
      expect(modelInstance3.is_system).toBe('1');
      expect(modelInstance4.is_system).toBe('0');
    });

    it('should handle different date formats for created_at', () => {
      const modelInstance1 = new Base({
        id: 1,
        creator_id: 1,
        updater_id: 1,
        created_at: '2024-01-01',
        updated_at: new Date(),
        deleted_at: '2024-01-02',
        is_system: 'false',
      });

      const modelInstance2 = new Base({
        id: 2,
        creator_id: 2,
        updater_id: 2,
        created_at: '2024-01-01T10:30:00Z',
        updated_at: new Date(),
        deleted_at: '2024-01-02',
        is_system: 'false',
      });

      const modelInstance3 = new Base({
        id: 3,
        creator_id: 3,
        updater_id: 3,
        created_at: 'January 1, 2024',
        updated_at: new Date(),
        deleted_at: '2024-01-02',
        is_system: 'false',
      });

      expect(modelInstance1.created_at).toBe('2024-01-01');
      expect(modelInstance2.created_at).toBe('2024-01-01T10:30:00Z');
      expect(modelInstance3.created_at).toBe('January 1, 2024');
    });

    it('should handle different date formats for deleted_at', () => {
      const modelInstance1 = new Base({
        id: 1,
        creator_id: 1,
        updater_id: 1,
        created_at: '2024-01-01',
        updated_at: new Date(),
        deleted_at: '2024-01-02',
        is_system: 'false',
      });

      const modelInstance2 = new Base({
        id: 2,
        creator_id: 2,
        updater_id: 2,
        created_at: '2024-01-01',
        updated_at: new Date(),
        deleted_at: '2024-01-02T15:45:30Z',
        is_system: 'false',
      });

      const modelInstance3 = new Base({
        id: 3,
        creator_id: 3,
        updater_id: 3,
        created_at: '2024-01-01',
        updated_at: new Date(),
        deleted_at: '2024-12-31',
        is_system: 'false',
      });

      expect(modelInstance1.deleted_at).toBe('2024-01-02');
      expect(modelInstance2.deleted_at).toBe('2024-01-02T15:45:30Z');
      expect(modelInstance3.deleted_at).toBe('2024-12-31');
    });
  });

  describe('Database Configuration', () => {
    it('should use correct table name', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/base.model');

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          tableName: 'base',
        })
      );
    });

    it('should use correct model name', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/base.model');

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          modelName: 'Base',
        })
      );
    });

    it('should have timestamps enabled', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/base.model');

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          timestamps: true,
        })
      );
    });

    it('should use underscored naming', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/base.model');

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          underscored: true,
        })
      );
    });

    it('should have paranoid mode enabled for soft delete', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/base.model');

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
      const modelInstance = new Base({
        id: 1,
        creator_id: 1,
        updater_id: 1,
        created_at: '2024-01-01',
        updated_at: new Date(),
        deleted_at: '2024-01-02',
        is_system: 'false',
      });

      expect(modelInstance.createdAt).toBeInstanceOf(Date);
      expect(modelInstance.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle custom timestamp values', () => {
      const customDate = new Date('2024-01-01T00:00:00Z');
      const modelInstance = new Base({
        id: 1,
        creator_id: 1,
        updater_id: 1,
        created_at: '2024-01-01',
        updated_at: customDate,
        deleted_at: '2024-01-02',
        is_system: 'false',
      });

      expect(modelInstance.updatedAt).toBe(customDate);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values for numeric fields', () => {
      const modelInstance = new Base({
        id: 0,
        creator_id: 0,
        updater_id: 0,
        created_at: '2024-01-01',
        updated_at: new Date(),
        deleted_at: '2024-01-02',
        is_system: 'false',
      });

      expect(modelInstance.id).toBe(0);
      expect(modelInstance.creator_id).toBe(0);
      expect(modelInstance.updater_id).toBe(0);
    });

    it('should handle empty string values', () => {
      const modelInstance = new Base({
        id: 1,
        creator_id: 1,
        updater_id: 1,
        created_at: '',
        updated_at: new Date(),
        deleted_at: '',
        is_system: '',
      });

      expect(modelInstance.created_at).toBe('');
      expect(modelInstance.deleted_at).toBe('');
      expect(modelInstance.is_system).toBe('');
    });

    it('should handle large numeric values', () => {
      const modelInstance = new Base({
        id: 999999999,
        creator_id: 999999999,
        updater_id: 999999999,
        created_at: '2024-01-01',
        updated_at: new Date(),
        deleted_at: '2024-01-02',
        is_system: 'false',
      });

      expect(modelInstance.id).toBe(999999999);
      expect(modelInstance.creator_id).toBe(999999999);
      expect(modelInstance.updater_id).toBe(999999999);
    });
  });
});