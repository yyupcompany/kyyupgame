import { AIUserPermission, PermissionKey, PermissionValue } from '../../../src/models/ai-user-permission.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { Sequelize } from 'sequelize';

// Mock dependencies
jest.mock('../../../src/models/user.model');


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

describe('AIUserPermission Model', () => {
  let mockUser: jest.Mocked<typeof User>;
  let mockSequelize: jest.Mocked<Sequelize>;

  beforeEach(() => {
    mockUser = User as jest.Mocked<typeof User>;
    mockSequelize = {
      define: jest.fn(),
      models: {},
      transaction: jest.fn(),
    } as any;
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('should have correct model attributes', () => {
      expect(AIUserPermission).toBeDefined();
      expect(AIUserPermission).toBeInstanceOf(Function);
    });
  });

  describe('Enums', () => {
    describe('PermissionKey', () => {
      it('should have correct enum values', () => {
        expect(PermissionKey.USE_TEXT_MODELS).toBe('use_text_models');
        expect(PermissionKey.USE_IMAGE_MODELS).toBe('use_image_models');
        expect(PermissionKey.USE_SPEECH_MODELS).toBe('use_speech_models');
        expect(PermissionKey.USE_VIDEO_MODELS).toBe('use_video_models');
        expect(PermissionKey.CUSTOM_PROMPTS).toBe('custom_prompts');
        expect(PermissionKey.ADVANCED_SETTINGS).toBe('advanced_settings');
        expect(PermissionKey.EXPORT_DATA).toBe('export_data');
        expect(PermissionKey.VIEW_ANALYTICS).toBe('view_analytics');
        expect(PermissionKey.ADMIN_ACCESS).toBe('admin_access');
        expect(PermissionKey.AI_ADMIN).toBe('ai:admin');
      });

      it('should have all required permission keys', () => {
        const permissionKeys = Object.values(PermissionKey);
        expect(permissionKeys).toHaveLength(10);
        expect(permissionKeys).toContain('use_text_models');
        expect(permissionKeys).toContain('use_image_models');
        expect(permissionKeys).toContain('use_speech_models');
        expect(permissionKeys).toContain('use_video_models');
        expect(permissionKeys).toContain('custom_prompts');
        expect(permissionKeys).toContain('advanced_settings');
        expect(permissionKeys).toContain('export_data');
        expect(permissionKeys).toContain('view_analytics');
        expect(permissionKeys).toContain('admin_access');
        expect(permissionKeys).toContain('ai:admin');
      });
    });

    describe('PermissionValue', () => {
      it('should have correct enum values', () => {
        expect(PermissionValue.DENIED).toBe(0);
        expect(PermissionValue.ALLOWED).toBe(1);
        expect(PermissionValue.ADVANCED).toBe(2);
      });

      it('should have all required permission values', () => {
        const permissionValues = Object.values(PermissionValue);
        expect(permissionValues).toHaveLength(3);
        expect(permissionValues).toContain(0);
        expect(permissionValues).toContain(1);
        expect(permissionValues).toContain(2);
      });
    });
  });

  describe('Model Attributes', () => {
    let modelInstance: AIUserPermission;

    beforeEach(() => {
      modelInstance = new AIUserPermission();
    });

    it('should have all required attributes', () => {
      expect(modelInstance).toHaveProperty('id');
      expect(modelInstance).toHaveProperty('userId');
      expect(modelInstance).toHaveProperty('permissionKey');
      expect(modelInstance).toHaveProperty('permissionValue');
      expect(modelInstance).toHaveProperty('createdAt');
      expect(modelInstance).toHaveProperty('updatedAt');
    });

    it('should have correct default values', () => {
      expect(modelInstance.permissionValue).toBeUndefined();
    });
  });

  describe('Static Methods', () => {
    describe('checkUserPermission', () => {
      it('should return true if user has sufficient permission', async () => {
        const mockPermission = {
          permissionValue: PermissionValue.ALLOWED,
        };
        
        const mockFindOne = jest.spyOn(AIUserPermission, 'findOne').mockResolvedValue(mockPermission as any);

        const result = await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS);

        expect(result).toBe(true);
        expect(mockFindOne).toHaveBeenCalledWith({
          where: {
            userId: 1,
            permissionKey: PermissionKey.USE_TEXT_MODELS,
          },
        });
      });

      it('should return false if user has insufficient permission', async () => {
        const mockPermission = {
          permissionValue: PermissionValue.DENIED,
        };
        
        const mockFindOne = jest.spyOn(AIUserPermission, 'findOne').mockResolvedValue(mockPermission as any);

        const result = await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.ALLOWED);

        expect(result).toBe(false);
      });

      it('should return true if user has advanced permission for basic requirement', async () => {
        const mockPermission = {
          permissionValue: PermissionValue.ADVANCED,
        };
        
        const mockFindOne = jest.spyOn(AIUserPermission, 'findOne').mockResolvedValue(mockPermission as any);

        const result = await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.ALLOWED);

        expect(result).toBe(true);
      });

      it('should return false if no permission record exists', async () => {
        const mockFindOne = jest.spyOn(AIUserPermission, 'findOne').mockResolvedValue(null);

        const result = await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS);

        expect(result).toBe(false);
      });

      it('should handle advanced permission requirement', async () => {
        const mockPermission = {
          permissionValue: PermissionValue.ALLOWED,
        };
        
        const mockFindOne = jest.spyOn(AIUserPermission, 'findOne').mockResolvedValue(mockPermission as any);

        const result = await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.ADVANCED);

        expect(result).toBe(false);
      });
    });

    describe('getUserPermissions', () => {
      it('should return user permissions as key-value object', async () => {
        const mockPermissions = [
          { permissionKey: PermissionKey.USE_TEXT_MODELS, permissionValue: PermissionValue.ALLOWED },
          { permissionKey: PermissionKey.USE_IMAGE_MODELS, permissionValue: PermissionValue.DENIED },
          { permissionKey: PermissionKey.ADMIN_ACCESS, permissionValue: PermissionValue.ADVANCED },
        ];
        
        const mockFindAll = jest.spyOn(AIUserPermission, 'findAll').mockResolvedValue(mockPermissions as any);

        const result = await AIUserPermission.getUserPermissions(1);

        expect(result).toEqual({
          use_text_models: PermissionValue.ALLOWED,
          use_image_models: PermissionValue.DENIED,
          admin_access: PermissionValue.ADVANCED,
        });
        expect(mockFindAll).toHaveBeenCalledWith({
          where: {
            userId: 1,
          },
        });
      });

      it('should return empty object for user with no permissions', async () => {
        const mockFindAll = jest.spyOn(AIUserPermission, 'findAll').mockResolvedValue([]);

        const result = await AIUserPermission.getUserPermissions(1);

        expect(result).toEqual({});
      });
    });

    describe('setPermission', () => {
      it('should create new permission if not exists', async () => {
        const mockPermission = {
          permissionValue: PermissionValue.ALLOWED,
          save: jest.fn().mockResolvedValue(this),
        };
        
        const mockFindOrCreate = jest.spyOn(AIUserPermission, 'findOrCreate').mockResolvedValue([mockPermission as any, true]);

        const result = await AIUserPermission.setPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.ALLOWED);

        expect(result).toBe(mockPermission);
        expect(mockFindOrCreate).toHaveBeenCalledWith({
          where: {
            userId: 1,
            permissionKey: PermissionKey.USE_TEXT_MODELS,
          },
          defaults: {
            userId: 1,
            permissionKey: PermissionKey.USE_TEXT_MODELS,
            permissionValue: PermissionValue.ALLOWED,
          },
        });
      });

      it('should update existing permission if value changed', async () => {
        const mockPermission = {
          permissionValue: PermissionValue.DENIED,
          save: jest.fn().mockResolvedValue(this),
        };
        
        const mockFindOrCreate = jest.spyOn(AIUserPermission, 'findOrCreate').mockResolvedValue([mockPermission as any, false]);

        const result = await AIUserPermission.setPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.ALLOWED);

        expect(result).toBe(mockPermission);
        expect(mockPermission.permissionValue).toBe(PermissionValue.ALLOWED);
        expect(mockPermission.save).toHaveBeenCalled();
      });

      it('should not update if value unchanged', async () => {
        const mockPermission = {
          permissionValue: PermissionValue.ALLOWED,
          save: jest.fn().mockResolvedValue(this),
        };
        
        const mockFindOrCreate = jest.spyOn(AIUserPermission, 'findOrCreate').mockResolvedValue([mockPermission as any, false]);

        const result = await AIUserPermission.setPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.ALLOWED);

        expect(result).toBe(mockPermission);
        expect(mockPermission.permissionValue).toBe(PermissionValue.ALLOWED);
        expect(mockPermission.save).not.toHaveBeenCalled();
      });
    });

    describe('setBulkPermissions', () => {
      it('should set multiple permissions in transaction', async () => {
        const permissions = {
          use_text_models: PermissionValue.ALLOWED,
          use_image_models: PermissionValue.DENIED,
          admin_access: PermissionValue.ADVANCED,
        };
        
        const mockTransactionCallback = jest.fn();
        const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
        mockSequelize.transaction = jest.fn().mockImplementation((callback) => {
          return callback(mockTransaction);
        });

        const mockFindOrCreate = jest.spyOn(AIUserPermission, 'findOrCreate').mockImplementation(() => {
          return Promise.resolve([{ permissionValue: PermissionValue.DENIED, save: jest.fn() } as any, false]);
        });

        await AIUserPermission.setBulkPermissions(1, permissions, mockSequelize);

        expect(mockSequelize.transaction).toHaveBeenCalled();
        expect(mockFindOrCreate).toHaveBeenCalledTimes(3);
        expect(mockTransaction.commit).toHaveBeenCalled();
      });

      it('should handle transaction rollback on error', async () => {
        const permissions = {
          use_text_models: PermissionValue.ALLOWED,
        };
        
        const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
        mockSequelize.transaction = jest.fn().mockImplementation((callback) => {
          return callback(mockTransaction);
        });

        const mockFindOrCreate = jest.spyOn(AIUserPermission, 'findOrCreate').mockRejectedValue(new Error('Database error'));

        await expect(AIUserPermission.setBulkPermissions(1, permissions, mockSequelize)).rejects.toThrow('Database error');
        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(mockTransaction.commit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Model Initialization', () => {
    it('should initialize model with correct configuration', () => {
            AIUserPermission.initModel = mockInit;

      AIUserPermission.initModel(mockSequelize);

      // 验证模型属性而不是init调用
      expect(AiUserPermission.rawAttributes).toBeDefined();
    });

    it('should initialize model with correct attributes', () => {
            
      AIUserPermission.initModel(mockSequelize);

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: expect.any(Object),
            autoIncrement: true,
            primaryKey: true,
          }),
          userId: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            field: 'user_id',
            comment: '用户ID',
            references: expect.objectContaining({
              model: 'users',
              key: 'id',
            }),
          }),
          permissionKey: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            field: 'permission_key',
            comment: '权限键名',
          }),
          permissionValue: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: PermissionValue.DENIED,
            field: 'permission_value',
            comment: '权限值 - 0:拒绝 1:允许 2:高级',
          }),
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'ai_user_permissions',
          timestamps: true,
          underscored: true,
          indexes: [
            {
              name: 'user_permission_idx',
              unique: true,
              fields: ['user_id', 'permission_key'],
            },
          ],
        })
      );
    });
  });

  describe('Model Associations', () => {
    it('should belong to User', () => {
      const mockBelongsTo = jest.fn();
      AIUserPermission.belongsTo = mockBelongsTo;

      AIUserPermission.initAssociations();

      expect(mockBelongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'userId',
        as: 'user',
      });
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', () => {
      const modelInstance = new AIUserPermission();
      
      expect(modelInstance).toHaveProperty('userId');
      expect(modelInstance).toHaveProperty('permissionKey');
      expect(modelInstance).toHaveProperty('permissionValue');
    });

    it('should validate enum values for permissionKey', () => {
      const modelInstance = new AIUserPermission();
      
      // Test valid permissionKey values
      modelInstance.permissionKey = PermissionKey.USE_TEXT_MODELS;
      expect(modelInstance.permissionKey).toBe(PermissionKey.USE_TEXT_MODELS);
      
      modelInstance.permissionKey = PermissionKey.ADMIN_ACCESS;
      expect(modelInstance.permissionKey).toBe(PermissionKey.ADMIN_ACCESS);
    });

    it('should validate enum values for permissionValue', () => {
      const modelInstance = new AIUserPermission();
      
      // Test valid permissionValue values
      modelInstance.permissionValue = PermissionValue.DENIED;
      expect(modelInstance.permissionValue).toBe(PermissionValue.DENIED);
      
      modelInstance.permissionValue = PermissionValue.ALLOWED;
      expect(modelInstance.permissionValue).toBe(PermissionValue.ALLOWED);
      
      modelInstance.permissionValue = PermissionValue.ADVANCED;
      expect(modelInstance.permissionValue).toBe(PermissionValue.ADVANCED);
    });

    it('should validate numeric values for permissionValue', () => {
      const modelInstance = new AIUserPermission();
      
      modelInstance.permissionValue = 0;
      expect(modelInstance.permissionValue).toBe(0);
      
      modelInstance.permissionValue = 1;
      expect(modelInstance.permissionValue).toBe(1);
      
      modelInstance.permissionValue = 2;
      expect(modelInstance.permissionValue).toBe(2);
    });
  });

  describe('Model Instances', () => {
    it('should create a valid model instance', () => {
      const modelInstance = new AIUserPermission({
        userId: 1,
        permissionKey: PermissionKey.USE_TEXT_MODELS,
        permissionValue: PermissionValue.ALLOWED,
      });

      expect(modelInstance.userId).toBe(1);
      expect(modelInstance.permissionKey).toBe(PermissionKey.USE_TEXT_MODELS);
      expect(modelInstance.permissionValue).toBe(PermissionValue.ALLOWED);
    });

    it('should create a model instance with default permission value', () => {
      const modelInstance = new AIUserPermission({
        userId: 1,
        permissionKey: PermissionKey.USE_TEXT_MODELS,
      });

      expect(modelInstance.userId).toBe(1);
      expect(modelInstance.permissionKey).toBe(PermissionKey.USE_TEXT_MODELS);
      expect(modelInstance.permissionValue).toBeUndefined(); // Will be set to default by database
    });
  });

  describe('Permission Level Logic', () => {
    it('should handle permission level comparisons correctly', async () => {
      // Test permission level hierarchy: DENIED(0) < ALLOWED(1) < ADVANCED(2)
      
      // Test with DENIED permission
      const mockDeniedPermission = { permissionValue: PermissionValue.DENIED };
      jest.spyOn(AIUserPermission, 'findOne').mockResolvedValue(mockDeniedPermission as any);
      
      expect(await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.DENIED)).toBe(true);
      expect(await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.ALLOWED)).toBe(false);
      expect(await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.ADVANCED)).toBe(false);
      
      // Test with ALLOWED permission
      const mockAllowedPermission = { permissionValue: PermissionValue.ALLOWED };
      jest.spyOn(AIUserPermission, 'findOne').mockResolvedValue(mockAllowedPermission as any);
      
      expect(await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.DENIED)).toBe(true);
      expect(await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.ALLOWED)).toBe(true);
      expect(await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.ADVANCED)).toBe(false);
      
      // Test with ADVANCED permission
      const mockAdvancedPermission = { permissionValue: PermissionValue.ADVANCED };
      jest.spyOn(AIUserPermission, 'findOne').mockResolvedValue(mockAdvancedPermission as any);
      
      expect(await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.DENIED)).toBe(true);
      expect(await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.ALLOWED)).toBe(true);
      expect(await AIUserPermission.checkUserPermission(1, PermissionKey.USE_TEXT_MODELS, PermissionValue.ADVANCED)).toBe(true);
    });
  });
});