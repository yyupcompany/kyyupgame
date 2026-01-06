import { UserProfile, Gender } from '../../../src/models/user-profile.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { sequelize } from '../../../src/config/database';

// Mock User model
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

describe('UserProfile Model', () => {
  beforeAll(async () => {
    // Initialize the UserProfile model
    UserProfile.initModel(sequelize);
    UserProfile.initAssociations();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(UserProfile.tableName).toBe('user_profiles');
    });

    it('should have correct attributes', () => {
      const attributes = UserProfile.getAttributes();
      
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);
      
      expect(attributes.userId).toBeDefined();
      expect(attributes.userId.allowNull).toBe(false);
      expect(attributes.userId.unique).toBe(true);
      
      expect(attributes.avatar).toBeDefined();
      expect(attributes.avatar.allowNull).toBe(true);
      
      expect(attributes.gender).toBeDefined();
      expect(attributes.gender.allowNull).toBe(true);
      
      expect(attributes.birthday).toBeDefined();
      expect(attributes.birthday.allowNull).toBe(true);
      
      expect(attributes.address).toBeDefined();
      expect(attributes.address.allowNull).toBe(true);
      
      expect(attributes.education).toBeDefined();
      expect(attributes.education.allowNull).toBe(true);
      
      expect(attributes.introduction).toBeDefined();
      expect(attributes.introduction.allowNull).toBe(true);
      
      expect(attributes.tags).toBeDefined();
      expect(attributes.tags.allowNull).toBe(true);
      
      expect(attributes.contactInfo).toBeDefined();
      expect(attributes.contactInfo.allowNull).toBe(true);
      
      expect(attributes.extendedInfo).toBeDefined();
      expect(attributes.extendedInfo.allowNull).toBe(true);
    });
  });

  describe('Model Options', () => {
    it('should have correct table configuration', () => {
      expect(UserProfile.options.tableName).toBe('user_profiles');
      expect(UserProfile.options.timestamps).toBe(true);
      expect(UserProfile.options.paranoid).toBe(true);
      expect(UserProfile.options.underscored).toBe(true);
    });
  });

  describe('Enum Values', () => {
    it('should have correct Gender enum values', () => {
      expect(Gender.UNKNOWN).toBe(0);
      expect(Gender.MALE).toBe(1);
      expect(Gender.FEMALE).toBe(2);
    });
  });

  describe('Model Associations', () => {
    it('should belong to user', () => {
      expect(User.belongsTo).toHaveBeenCalledWith(UserProfile, {
        foreignKey: 'userId',
        as: 'user',
      });
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', async () => {
      const userProfile = UserProfile.build({
        userId: 1,
      });

      const validationErrors = await userProfile.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should fail validation without userId', async () => {
      const userProfile = UserProfile.build({});

      await expect(userProfile.validate()).rejects.toThrow();
    });

    it('should validate gender field', async () => {
      const userProfile = UserProfile.build({
        userId: 1,
        gender: Gender.MALE,
      });

      const validationErrors = await userProfile.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate birthday field', async () => {
      const userProfile = UserProfile.build({
        userId: 1,
        birthday: new Date('1990-01-01'),
      });

      const validationErrors = await userProfile.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate string fields', async () => {
      const userProfile = UserProfile.build({
        userId: 1,
        avatar: 'https://example.com/avatar.jpg',
        address: '123 Test Street',
        education: 'Bachelor',
        introduction: 'Test introduction',
        tags: JSON.stringify(['tag1', 'tag2']),
        contactInfo: JSON.stringify({ phone: '1234567890' }),
        extendedInfo: JSON.stringify({ custom: 'info' }),
      });

      const validationErrors = await userProfile.validate();
      expect(validationErrors).toBeUndefined();
    });
  });

  describe('Field Constraints', () => {
    it('should have unique constraint on userId', () => {
      const attributes = UserProfile.getAttributes();
      expect(attributes.userId.unique).toBe(true);
    });

    it('should have foreign key reference to users table', () => {
      const attributes = UserProfile.getAttributes();
      expect(attributes.userId.references).toEqual({
        model: 'users',
        key: 'id',
      });
    });

    it('should have correct field lengths', () => {
      const attributes = UserProfile.getAttributes();
      
      expect(attributes.avatar.type.constructor.name).toContain('STRING');
      expect(attributes.address.type.constructor.name).toContain('STRING');
      expect(attributes.education.type.constructor.name).toContain('STRING');
      expect(attributes.introduction.type.constructor.name).toContain('TEXT');
      expect(attributes.tags.type.constructor.name).toContain('TEXT');
      expect(attributes.contactInfo.type.constructor.name).toContain('TEXT');
      expect(attributes.extendedInfo.type.constructor.name).toContain('TEXT');
    });
  });

  describe('Model Instance Methods', () => {
    it('should create instance with correct attributes', () => {
      const userProfileData = {
        userId: 1,
        avatar: 'https://example.com/avatar.jpg',
        gender: Gender.MALE,
        birthday: new Date('1990-01-01'),
        address: '123 Test Street',
        education: 'Bachelor',
        introduction: 'Test introduction',
        tags: JSON.stringify(['tag1', 'tag2']),
        contactInfo: JSON.stringify({ phone: '1234567890' }),
        extendedInfo: JSON.stringify({ custom: 'info' }),
      };

      const userProfile = UserProfile.build(userProfileData);

      expect(userProfile.userId).toBe(1);
      expect(userProfile.avatar).toBe('https://example.com/avatar.jpg');
      expect(userProfile.gender).toBe(Gender.MALE);
      expect(userProfile.birthday).toEqual(new Date('1990-01-01'));
      expect(userProfile.address).toBe('123 Test Street');
      expect(userProfile.education).toBe('Bachelor');
      expect(userProfile.introduction).toBe('Test introduction');
      expect(userProfile.tags).toBe(JSON.stringify(['tag1', 'tag2']));
      expect(userProfile.contactInfo).toBe(JSON.stringify({ phone: '1234567890' }));
      expect(userProfile.extendedInfo).toBe(JSON.stringify({ custom: 'info' }));
    });

    it('should handle null values for optional fields', () => {
      const userProfile = UserProfile.build({
        userId: 1,
      });

      expect(userProfile.userId).toBe(1);
      expect(userProfile.avatar).toBeNull();
      expect(userProfile.gender).toBeNull();
      expect(userProfile.birthday).toBeNull();
      expect(userProfile.address).toBeNull();
      expect(userProfile.education).toBeNull();
      expect(userProfile.introduction).toBeNull();
      expect(userProfile.tags).toBeNull();
      expect(userProfile.contactInfo).toBeNull();
      expect(userProfile.extendedInfo).toBeNull();
    });
  });

  describe('JSON Fields', () => {
    it('should store tags as JSON string', () => {
      const tags = ['urgent', 'important', 'personal'];
      const tagsJson = JSON.stringify(tags);
      
      const userProfile = UserProfile.build({
        userId: 1,
        tags: tagsJson,
      });

      expect(userProfile.tags).toBe(tagsJson);
      expect(JSON.parse(userProfile.tags)).toEqual(tags);
    });

    it('should store contactInfo as JSON string', () => {
      const contactInfo = { phone: '1234567890', email: 'test@example.com' };
      const contactInfoJson = JSON.stringify(contactInfo);
      
      const userProfile = UserProfile.build({
        userId: 1,
        contactInfo: contactInfoJson,
      });

      expect(userProfile.contactInfo).toBe(contactInfoJson);
      expect(JSON.parse(userProfile.contactInfo)).toEqual(contactInfo);
    });

    it('should store extendedInfo as JSON string', () => {
      const extendedInfo = { preferences: { theme: 'dark', language: 'zh' } };
      const extendedInfoJson = JSON.stringify(extendedInfo);
      
      const userProfile = UserProfile.build({
        userId: 1,
        extendedInfo: extendedInfoJson,
      });

      expect(userProfile.extendedInfo).toBe(extendedInfoJson);
      expect(JSON.parse(userProfile.extendedInfo)).toEqual(extendedInfo);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt', () => {
      const userProfile = UserProfile.build({
        userId: 1,
      });

      expect(userProfile.createdAt).toBeDefined();
      expect(userProfile.updatedAt).toBeDefined();
      expect(userProfile.createdAt).toBeInstanceOf(Date);
      expect(userProfile.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete with deletedAt', () => {
      const userProfile = UserProfile.build({
        userId: 1,
      });

      expect(userProfile.deletedAt).toBeDefined();
      expect(userProfile.deletedAt).toBeNull();
    });
  });

  describe('Field Comments', () => {
    it('should have proper field comments', () => {
      const attributes = UserProfile.getAttributes();
      
      expect(attributes.id.comment).toBe('用户资料ID');
      expect(attributes.userId.comment).toBe('用户ID');
      expect(attributes.avatar.comment).toBe('用户头像URL');
      expect(attributes.gender.comment).toBe('性别 0:未知 1:男 2:女');
      expect(attributes.birthday.comment).toBe('生日');
      expect(attributes.address.comment).toBe('地址');
      expect(attributes.education.comment).toBe('学历');
      expect(attributes.introduction.comment).toBe('个人介绍');
      expect(attributes.tags.comment).toBe('用户标签，JSON字符串存储');
      expect(attributes.contactInfo.comment).toBe('联系信息，JSON字符串存储');
      expect(attributes.extendedInfo.comment).toBe('扩展信息，JSON字符串存储');
    });
  });
});