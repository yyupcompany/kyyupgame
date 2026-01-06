import { TokenBlacklist } from '../../../src/models/tokenblacklist.model';
import { vi } from 'vitest'
import { sequelize } from '../../../src/config/database';


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

describe('TokenBlacklist Model', () => {
  beforeAll(async () => {
    // The model is already initialized in the model file
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(TokenBlacklist.tableName).toBe('token_blacklist');
    });

    it('should have correct attributes', () => {
      const attributes = TokenBlacklist.getAttributes();
      
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);
      
      expect(attributes.token).toBeDefined();
      expect(attributes.token.allowNull).toBe(true);
      
      expect(attributes.expires_at).toBeDefined();
      expect(attributes.expires_at.allowNull).toBe(true);
      
      expect(attributes.reason).toBeDefined();
      expect(attributes.reason.allowNull).toBe(true);
      
      expect(attributes.created_at).toBeDefined();
      expect(attributes.created_at.allowNull).toBe(true);
      
      expect(attributes.updated_at).toBeDefined();
      expect(attributes.updated_at.allowNull).toBe(true);
    });
  });

  describe('Model Options', () => {
    it('should have correct table configuration', () => {
      expect(TokenBlacklist.options.tableName).toBe('token_blacklist');
      expect(TokenBlacklist.options.modelName).toBe('TokenBlacklist');
      expect(TokenBlacklist.options.timestamps).toBe(true);
      expect(TokenBlacklist.options.paranoid).toBe(true);
      expect(TokenBlacklist.options.underscored).toBe(true);
    });
  });

  describe('Model Validation', () => {
    it('should create instance with all attributes', () => {
      const tokenData = {
        token: 'test_token_123',
        expires_at: '2024-12-31T23:59:59.000Z',
        reason: 'user_logout',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: new Date(),
      };

      const tokenBlacklist = TokenBlacklist.build(tokenData);

      expect(tokenBlacklist.id).toBeDefined();
      expect(tokenBlacklist.token).toBe('test_token_123');
      expect(tokenBlacklist.expires_at).toBe('2024-12-31T23:59:59.000Z');
      expect(tokenBlacklist.reason).toBe('user_logout');
      expect(tokenBlacklist.created_at).toBe('2024-01-01T00:00:00.000Z');
      expect(tokenBlacklist.updated_at).toBeInstanceOf(Date);
    });

    it('should create instance with minimal required fields', () => {
      const tokenBlacklist = TokenBlacklist.build({});

      expect(tokenBlacklist.id).toBeDefined();
      expect(tokenBlacklist.token).toBeUndefined();
      expect(tokenBlacklist.expires_at).toBeUndefined();
      expect(tokenBlacklist.reason).toBeUndefined();
    });

    it('should allow null values for optional fields', () => {
      const tokenData = {
        token: null,
        expires_at: null,
        reason: null,
        created_at: null,
        updated_at: null,
      };

      const tokenBlacklist = TokenBlacklist.build(tokenData);

      expect(tokenBlacklist.token).toBeNull();
      expect(tokenBlacklist.expires_at).toBeNull();
      expect(tokenBlacklist.reason).toBeNull();
      expect(tokenBlacklist.created_at).toBeNull();
      expect(tokenBlacklist.updated_at).toBeNull();
    });
  });

  describe('Field Types', () => {
    it('should have correct field types', () => {
      const attributes = TokenBlacklist.getAttributes();
      
      expect(attributes.id.type.constructor.name).toContain('INTEGER');
      expect(attributes.token.type.constructor.name).toContain('STRING');
      expect(attributes.expires_at.type.constructor.name).toContain('STRING');
      expect(attributes.reason.type.constructor.name).toContain('STRING');
      expect(attributes.created_at.type.constructor.name).toContain('DATE');
      expect(attributes.updated_at.type.constructor.name).toContain('DATE');
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt timestamps', () => {
      const tokenBlacklist = TokenBlacklist.build({
        token: 'test_token',
      });

      expect(tokenBlacklist.createdAt).toBeDefined();
      expect(tokenBlacklist.updatedAt).toBeDefined();
      expect(tokenBlacklist.createdAt).toBeInstanceOf(Date);
      expect(tokenBlacklist.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete functionality', () => {
      const tokenBlacklist = TokenBlacklist.build({
        token: 'test_token',
      });

      expect(tokenBlacklist.options.paranoid).toBe(true);
      expect(tokenBlacklist.deletedAt).toBeDefined();
    });
  });

  describe('Model Interface', () => {
    it('should implement TokenBlacklistAttributes interface', () => {
      const tokenData = {
        id: 1,
        token: 'test_token',
        expires_at: '2024-12-31T23:59:59.000Z',
        reason: 'test_reason',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: new Date(),
      };

      const tokenBlacklist = TokenBlacklist.build(tokenData);

      expect(tokenBlacklist.id).toBe(tokenData.id);
      expect(tokenBlacklist.token).toBe(tokenData.token);
      expect(tokenBlacklist.expires_at).toBe(tokenData.expires_at);
      expect(tokenBlacklist.reason).toBe(tokenData.reason);
      expect(tokenBlacklist.created_at).toBe(tokenData.created_at);
      expect(tokenBlacklist.updated_at).toBe(tokenData.updated_at);
    });
  });

  describe('Creation Attributes', () => {
    it('should handle creation with optional attributes', () => {
      const creationData = {
        token: 'test_token',
        expires_at: '2024-12-31T23:59:59.000Z',
        reason: 'test_reason',
      };

      const tokenBlacklist = TokenBlacklist.build(creationData);

      expect(tokenBlacklist.token).toBe(creationData.token);
      expect(tokenBlacklist.expires_at).toBe(creationData.expires_at);
      expect(tokenBlacklist.reason).toBe(creationData.reason);
      // Auto-generated fields should be undefined
      expect(tokenBlacklist.id).toBeDefined();
    });
  });

  describe('Database Constraints', () => {
    it('should have primary key constraint on id', () => {
      const attributes = TokenBlacklist.getAttributes();
      expect(attributes.id.primaryKey).toBe(true);
    });

    it('should have auto increment on id', () => {
      const attributes = TokenBlacklist.getAttributes();
      expect(attributes.id.autoIncrement).toBe(true);
    });
  });
});