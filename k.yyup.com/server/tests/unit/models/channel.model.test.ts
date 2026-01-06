import { Channel } from '../../../src/models/channel.model';
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

describe('Channel Model', () => {
  beforeAll(async () => {
    // The model is already initialized in the model file
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(Channel.tableName).toBe('channels');
    });

    it('should have correct attributes', () => {
      const attributes = Channel.getAttributes();
      
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);
      
      expect(attributes.name).toBeDefined();
      expect(attributes.name.allowNull).toBe(true);
      
      expect(attributes.type).toBeDefined();
      expect(attributes.type.allowNull).toBe(true);
      
      expect(attributes.description).toBeDefined();
      expect(attributes.description.allowNull).toBe(true);
      
      expect(attributes.created_at).toBeDefined();
      expect(attributes.created_at.allowNull).toBe(true);
      
      expect(attributes.updated_at).toBeDefined();
      expect(attributes.updated_at.allowNull).toBe(true);
      
      expect(attributes.deleted_at).toBeDefined();
      expect(attributes.deleted_at.allowNull).toBe(true);
    });
  });

  describe('Model Options', () => {
    it('should have correct table configuration', () => {
      expect(Channel.options.tableName).toBe('channels');
      expect(Channel.options.modelName).toBe('Channel');
      expect(Channel.options.timestamps).toBe(true);
      expect(Channel.options.paranoid).toBe(true);
      expect(Channel.options.underscored).toBe(true);
    });
  });

  describe('Model Validation', () => {
    it('should create instance with all attributes', () => {
      const channelData = {
        name: 'Test Channel',
        type: 'social_media',
        description: 'Test channel description',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: new Date(),
        deleted_at: '2024-12-31T23:59:59.000Z',
      };

      const channel = Channel.build(channelData);

      expect(channel.id).toBeDefined();
      expect(channel.name).toBe('Test Channel');
      expect(channel.type).toBe('social_media');
      expect(channel.description).toBe('Test channel description');
      expect(channel.created_at).toBe('2024-01-01T00:00:00.000Z');
      expect(channel.updated_at).toBeInstanceOf(Date);
      expect(channel.deleted_at).toBe('2024-12-31T23:59:59.000Z');
    });

    it('should create instance with minimal data', () => {
      const channel = Channel.build({});

      expect(channel.id).toBeDefined();
      expect(channel.name).toBeUndefined();
      expect(channel.type).toBeUndefined();
      expect(channel.description).toBeUndefined();
    });

    it('should allow null values for all fields', () => {
      const channelData = {
        name: null,
        type: null,
        description: null,
        created_at: null,
        updated_at: null,
        deleted_at: null,
      };

      const channel = Channel.build(channelData);

      expect(channel.name).toBeNull();
      expect(channel.type).toBeNull();
      expect(channel.description).toBeNull();
      expect(channel.created_at).toBeNull();
      expect(channel.updated_at).toBeNull();
      expect(channel.deleted_at).toBeNull();
    });
  });

  describe('Field Types', () => {
    it('should have correct field types', () => {
      const attributes = Channel.getAttributes();
      
      expect(attributes.id.type.constructor.name).toContain('INTEGER');
      expect(attributes.name.type.constructor.name).toContain('STRING');
      expect(attributes.type.type.constructor.name).toContain('STRING');
      expect(attributes.description.type.constructor.name).toContain('STRING');
      expect(attributes.created_at.type.constructor.name).toContain('DATE');
      expect(attributes.updated_at.type.constructor.name).toContain('DATE');
      expect(attributes.deleted_at.type.constructor.name).toContain('DATE');
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt timestamps', () => {
      const channel = Channel.build({
        name: 'Test Channel',
      });

      expect(channel.createdAt).toBeDefined();
      expect(channel.updatedAt).toBeDefined();
      expect(channel.createdAt).toBeInstanceOf(Date);
      expect(channel.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete functionality', () => {
      const channel = Channel.build({
        name: 'Test Channel',
      });

      expect(channel.options.paranoid).toBe(true);
      expect(channel.deletedAt).toBeDefined();
    });
  });

  describe('Model Interface', () => {
    it('should implement ChannelAttributes interface', () => {
      const channelData = {
        id: 1,
        name: 'Test Channel',
        type: 'social_media',
        description: 'Test channel description',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: new Date(),
        deleted_at: '2024-12-31T23:59:59.000Z',
      };

      const channel = Channel.build(channelData);

      expect(channel.id).toBe(channelData.id);
      expect(channel.name).toBe(channelData.name);
      expect(channel.type).toBe(channelData.type);
      expect(channel.description).toBe(channelData.description);
      expect(channel.created_at).toBe(channelData.created_at);
      expect(channel.updated_at).toBe(channelData.updated_at);
      expect(channel.deleted_at).toBe(channelData.deleted_at);
    });
  });

  describe('Creation Attributes', () => {
    it('should handle creation with optional attributes', () => {
      const creationData = {
        name: 'Test Channel',
        type: 'email',
        description: 'Test channel description',
      };

      const channel = Channel.build(creationData);

      expect(channel.name).toBe(creationData.name);
      expect(channel.type).toBe(creationData.type);
      expect(channel.description).toBe(creationData.description);
      expect(channel.id).toBeDefined();
    });
  });

  describe('Database Constraints', () => {
    it('should have primary key constraint on id', () => {
      const attributes = Channel.getAttributes();
      expect(attributes.id.primaryKey).toBe(true);
    });

    it('should have auto increment on id', () => {
      const attributes = Channel.getAttributes();
      expect(attributes.id.autoIncrement).toBe(true);
    });
  });

  describe('String Fields', () => {
    it('should handle string fields correctly', () => {
      const channel = Channel.build({
        name: 'Google Ads Channel',
        type: 'search_engine',
        description: 'Google search engine advertising channel for kindergarten promotion',
      });

      expect(channel.name).toBe('Google Ads Channel');
      expect(channel.type).toBe('search_engine');
      expect(channel.description).toBe('Google search engine advertising channel for kindergarten promotion');
    });

    it('should handle empty strings', () => {
      const channel = Channel.build({
        name: '',
        type: '',
        description: '',
      });

      expect(channel.name).toBe('');
      expect(channel.type).toBe('');
      expect(channel.description).toBe('');
    });

    it('should handle long strings', () => {
      const longDescription = 'a'.repeat(1000);
      const channel = Channel.build({
        name: 'Test Channel',
        type: 'test',
        description: longDescription,
      });

      expect(channel.description).toBe(longDescription);
      expect(channel.description.length).toBe(1000);
    });
  });

  describe('Date Fields', () => {
    it('should handle date fields correctly', () => {
      const createdDate = new Date('2024-01-01T00:00:00.000Z');
      const updatedDate = new Date('2024-01-02T12:00:00.000Z');
      const deletedDate = new Date('2024-12-31T23:59:59.000Z');

      const channel = Channel.build({
        name: 'Test Channel',
        created_at: createdDate.toISOString(),
        updated_at: updatedDate,
        deleted_at: deletedDate.toISOString(),
      });

      expect(channel.created_at).toBe(createdDate.toISOString());
      expect(channel.updated_at).toEqual(updatedDate);
      expect(channel.deleted_at).toBe(deletedDate.toISOString());
    });

    it('should handle null date values', () => {
      const channel = Channel.build({
        name: 'Test Channel',
        created_at: null,
        updated_at: null,
        deleted_at: null,
      });

      expect(channel.created_at).toBeNull();
      expect(channel.updated_at).toBeNull();
      expect(channel.deleted_at).toBeNull();
    });
  });

  describe('Field Values', () => {
    it('should accept various channel types', () => {
      const channelTypes = [
        'search_engine',
        'social_media',
        'email',
        'sms',
        'offline_event',
        'referral',
        'partner',
        'direct_access',
        'other',
      ];

      channelTypes.forEach(type => {
        const channel = Channel.build({
          name: 'Test Channel',
          type,
        });

        expect(channel.type).toBe(type);
      });
    });

    it('should accept various channel names', () => {
      const channelNames = [
        'Google Ads',
        'Facebook',
        'Email Marketing',
        'SMS Campaign',
        'Offline Event',
        'Referral Program',
        'Partner Channel',
        'Direct Access',
        'Other Channel',
      ];

      channelNames.forEach(name => {
        const channel = Channel.build({
          name,
          type: 'other',
        });

        expect(channel.name).toBe(name);
      });
    });

    it('should accept various descriptions', () => {
      const descriptions = [
        'Short description',
        'This is a longer description for the channel that provides more details about its purpose and functionality',
        'Channel description with special characters: @#$%^&*()_+-=[]{}|;:,.<>?',
        'Multi-line description\nwith line breaks\nand special formatting',
        '',
      ];

      descriptions.forEach(description => {
        const channel = Channel.build({
          name: 'Test Channel',
          type: 'test',
          description,
        });

        expect(channel.description).toBe(description);
      });
    });
  });

  describe('Model Instance', () => {
    it('should create instance with default values', () => {
      const channel = Channel.build({});

      expect(channel.id).toBeDefined();
      expect(channel.name).toBeUndefined();
      expect(channel.type).toBeUndefined();
      expect(channel.description).toBeUndefined();
      expect(channel.created_at).toBeUndefined();
      expect(channel.updated_at).toBeUndefined();
      expect(channel.deleted_at).toBeUndefined();
    });

    it('should allow partial data initialization', () => {
      const channel = Channel.build({
        name: 'Partial Channel',
      });

      expect(channel.name).toBe('Partial Channel');
      expect(channel.type).toBeUndefined();
      expect(channel.description).toBeUndefined();
    });

    it('should maintain data integrity', () => {
      const originalData = {
        name: 'Integrity Test Channel',
        type: 'integrity_test',
        description: 'Testing data integrity',
      };

      const channel = Channel.build(originalData);

      expect(channel.name).toBe(originalData.name);
      expect(channel.type).toBe(originalData.type);
      expect(channel.description).toBe(originalData.description);

      // Verify that the data hasn't been modified
      expect(channel.name).not.toBe('Modified Channel');
      expect(channel.type).not.toBe('modified_type');
      expect(channel.description).not.toBe('Modified description');
    });
  });

  describe('Validation Behavior', () => {
    it('should not throw validation errors for valid data', async () => {
      const channel = Channel.build({
        name: 'Valid Channel',
        type: 'valid_type',
        description: 'Valid description',
      });

      let validationError;
      try {
        await channel.validate();
      } catch (error) {
        validationError = error;
      }

      expect(validationError).toBeUndefined();
    });

    it('should handle empty object validation', async () => {
      const channel = Channel.build({});

      let validationError;
      try {
        await channel.validate();
      } catch (error) {
        validationError = error;
      }

      // Since all fields are nullable, validation should pass
      expect(validationError).toBeUndefined();
    });

    it('should handle null values validation', async () => {
      const channel = Channel.build({
        name: null,
        type: null,
        description: null,
        created_at: null,
        updated_at: null,
        deleted_at: null,
      });

      let validationError;
      try {
        await channel.validate();
      } catch (error) {
        validationError = error;
      }

      // Since all fields are nullable, validation should pass
      expect(validationError).toBeUndefined();
    });
  });
});