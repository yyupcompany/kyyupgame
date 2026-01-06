import { ActivitieBackup1751799168 } from '../../../src/models/activitiebackup1751799168.model';
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

describe('ActivitieBackup1751799168 Model', () => {
  beforeAll(async () => {
    // The model is already initialized in the model file
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(ActivitieBackup1751799168.tableName).toBe('activities_backup_1751799168');
    });

    it('should have correct attributes', () => {
      const attributes = ActivitieBackup1751799168.getAttributes();
      
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);
      
      expect(attributes.kindergarten_id).toBeDefined();
      expect(attributes.kindergarten_id.allowNull).toBe(true);
      
      expect(attributes.plan_id).toBeDefined();
      expect(attributes.plan_id.allowNull).toBe(true);
      
      expect(attributes.title).toBeDefined();
      expect(attributes.title.allowNull).toBe(true);
      
      expect(attributes.activity_type).toBeDefined();
      expect(attributes.activity_type.allowNull).toBe(true);
      
      expect(attributes.cover_image).toBeDefined();
      expect(attributes.cover_image.allowNull).toBe(true);
      
      expect(attributes.start_time).toBeDefined();
      expect(attributes.start_time.allowNull).toBe(true);
      
      expect(attributes.end_time).toBeDefined();
      expect(attributes.end_time.allowNull).toBe(true);
      
      expect(attributes.location).toBeDefined();
      expect(attributes.location.allowNull).toBe(true);
      
      expect(attributes.capacity).toBeDefined();
      expect(attributes.capacity.allowNull).toBe(true);
      
      expect(attributes.registered_count).toBeDefined();
      expect(attributes.registered_count.allowNull).toBe(true);
      
      expect(attributes.checked_in_count).toBeDefined();
      expect(attributes.checked_in_count.allowNull).toBe(true);
      
      expect(attributes.fee).toBeDefined();
      expect(attributes.fee.allowNull).toBe(true);
      
      expect(attributes.description).toBeDefined();
      expect(attributes.description.allowNull).toBe(true);
      
      expect(attributes.agenda).toBeDefined();
      expect(attributes.agenda.allowNull).toBe(true);
      
      expect(attributes.registration_start_time).toBeDefined();
      expect(attributes.registration_start_time.allowNull).toBe(true);
      
      expect(attributes.registration_end_time).toBeDefined();
      expect(attributes.registration_end_time.allowNull).toBe(true);
      
      expect(attributes.needs_approval).toBeDefined();
      expect(attributes.needs_approval.allowNull).toBe(true);
      
      expect(attributes.status).toBeDefined();
      expect(attributes.status.allowNull).toBe(true);
      
      expect(attributes.remark).toBeDefined();
      expect(attributes.remark.allowNull).toBe(true);
      
      expect(attributes.creator_id).toBeDefined();
      expect(attributes.creator_id.allowNull).toBe(true);
      
      expect(attributes.updater_id).toBeDefined();
      expect(attributes.updater_id.allowNull).toBe(true);
      
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
      expect(ActivitieBackup1751799168.options.tableName).toBe('activities_backup_1751799168');
      expect(ActivitieBackup1751799168.options.modelName).toBe('ActivitieBackup1751799168');
      expect(ActivitieBackup1751799168.options.timestamps).toBe(true);
      expect(ActivitieBackup1751799168.options.paranoid).toBe(true);
      expect(ActivitieBackup1751799168.options.underscored).toBe(true);
    });
  });

  describe('Model Validation', () => {
    it('should create instance with all attributes', () => {
      const activityData = {
        kindergarten_id: 1,
        plan_id: 1,
        title: 'Test Activity',
        activity_type: 'educational',
        cover_image: 'https://example.com/image.jpg',
        start_time: new Date('2024-01-01T10:00:00'),
        end_time: new Date('2024-01-01T12:00:00'),
        location: 'Test Location',
        capacity: '50',
        registered_count: '25',
        checked_in_count: '20',
        fee: '100.00',
        description: 'Test activity description',
        agenda: 'Test agenda',
        registration_start_time: new Date('2023-12-01T00:00:00'),
        registration_end_time: new Date('2023-12-31T23:59:59'),
        needs_approval: 'true',
        status: 'active',
        remark: 'Test remark',
        creator_id: 1,
        updater_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: new Date(),
        deleted_at: '2024-12-31T23:59:59.000Z',
      };

      const activity = ActivitieBackup1751799168.build(activityData);

      expect(activity.id).toBeDefined();
      expect(activity.kindergarten_id).toBe(1);
      expect(activity.plan_id).toBe(1);
      expect(activity.title).toBe('Test Activity');
      expect(activity.activity_type).toBe('educational');
      expect(activity.cover_image).toBe('https://example.com/image.jpg');
      expect(activity.start_time).toEqual(new Date('2024-01-01T10:00:00'));
      expect(activity.end_time).toEqual(new Date('2024-01-01T12:00:00'));
      expect(activity.location).toBe('Test Location');
      expect(activity.capacity).toBe('50');
      expect(activity.registered_count).toBe('25');
      expect(activity.checked_in_count).toBe('20');
      expect(activity.fee).toBe('100.00');
      expect(activity.description).toBe('Test activity description');
      expect(activity.agenda).toBe('Test agenda');
      expect(activity.registration_start_time).toEqual(new Date('2023-12-01T00:00:00'));
      expect(activity.registration_end_time).toEqual(new Date('2023-12-31T23:59:59'));
      expect(activity.needs_approval).toBe('true');
      expect(activity.status).toBe('active');
      expect(activity.remark).toBe('Test remark');
      expect(activity.creator_id).toBe(1);
      expect(activity.updater_id).toBe(1);
      expect(activity.created_at).toBe('2024-01-01T00:00:00.000Z');
      expect(activity.updated_at).toBeInstanceOf(Date);
      expect(activity.deleted_at).toBe('2024-12-31T23:59:59.000Z');
    });

    it('should create instance with minimal data', () => {
      const activity = ActivitieBackup1751799168.build({});

      expect(activity.id).toBeDefined();
      expect(activity.kindergarten_id).toBeUndefined();
      expect(activity.title).toBeUndefined();
      expect(activity.activity_type).toBeUndefined();
    });

    it('should allow null values for all fields', () => {
      const activityData = {
        kindergarten_id: null,
        plan_id: null,
        title: null,
        activity_type: null,
        cover_image: null,
        start_time: null,
        end_time: null,
        location: null,
        capacity: null,
        registered_count: null,
        checked_in_count: null,
        fee: null,
        description: null,
        agenda: null,
        registration_start_time: null,
        registration_end_time: null,
        needs_approval: null,
        status: null,
        remark: null,
        creator_id: null,
        updater_id: null,
        created_at: null,
        updated_at: null,
        deleted_at: null,
      };

      const activity = ActivitieBackup1751799168.build(activityData);

      expect(activity.kindergarten_id).toBeNull();
      expect(activity.plan_id).toBeNull();
      expect(activity.title).toBeNull();
      expect(activity.activity_type).toBeNull();
      expect(activity.cover_image).toBeNull();
      expect(activity.start_time).toBeNull();
      expect(activity.end_time).toBeNull();
      expect(activity.location).toBeNull();
      expect(activity.capacity).toBeNull();
      expect(activity.registered_count).toBeNull();
      expect(activity.checked_in_count).toBeNull();
      expect(activity.fee).toBeNull();
      expect(activity.description).toBeNull();
      expect(activity.agenda).toBeNull();
      expect(activity.registration_start_time).toBeNull();
      expect(activity.registration_end_time).toBeNull();
      expect(activity.needs_approval).toBeNull();
      expect(activity.status).toBeNull();
      expect(activity.remark).toBeNull();
      expect(activity.creator_id).toBeNull();
      expect(activity.updater_id).toBeNull();
      expect(activity.created_at).toBeNull();
      expect(activity.updated_at).toBeNull();
      expect(activity.deleted_at).toBeNull();
    });
  });

  describe('Field Types', () => {
    it('should have correct field types', () => {
      const attributes = ActivitieBackup1751799168.getAttributes();
      
      expect(attributes.id.type.constructor.name).toContain('INTEGER');
      expect(attributes.kindergarten_id.type.constructor.name).toContain('INTEGER');
      expect(attributes.plan_id.type.constructor.name).toContain('INTEGER');
      expect(attributes.title.type.constructor.name).toContain('STRING');
      expect(attributes.activity_type.type.constructor.name).toContain('STRING');
      expect(attributes.cover_image.type.constructor.name).toContain('STRING');
      expect(attributes.start_time.type.constructor.name).toContain('DATE');
      expect(attributes.end_time.type.constructor.name).toContain('DATE');
      expect(attributes.location.type.constructor.name).toContain('STRING');
      expect(attributes.capacity.type.constructor.name).toContain('STRING');
      expect(attributes.registered_count.type.constructor.name).toContain('STRING');
      expect(attributes.checked_in_count.type.constructor.name).toContain('STRING');
      expect(attributes.fee.type.constructor.name).toContain('STRING');
      expect(attributes.description.type.constructor.name).toContain('STRING');
      expect(attributes.agenda.type.constructor.name).toContain('STRING');
      expect(attributes.registration_start_time.type.constructor.name).toContain('DATE');
      expect(attributes.registration_end_time.type.constructor.name).toContain('DATE');
      expect(attributes.needs_approval.type.constructor.name).toContain('STRING');
      expect(attributes.status.type.constructor.name).toContain('STRING');
      expect(attributes.remark.type.constructor.name).toContain('STRING');
      expect(attributes.creator_id.type.constructor.name).toContain('INTEGER');
      expect(attributes.updater_id.type.constructor.name).toContain('INTEGER');
      expect(attributes.created_at.type.constructor.name).toContain('DATE');
      expect(attributes.updated_at.type.constructor.name).toContain('DATE');
      expect(attributes.deleted_at.type.constructor.name).toContain('DATE');
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt timestamps', () => {
      const activity = ActivitieBackup1751799168.build({
        title: 'Test Activity',
      });

      expect(activity.createdAt).toBeDefined();
      expect(activity.updatedAt).toBeDefined();
      expect(activity.createdAt).toBeInstanceOf(Date);
      expect(activity.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete functionality', () => {
      const activity = ActivitieBackup1751799168.build({
        title: 'Test Activity',
      });

      expect(activity.options.paranoid).toBe(true);
    });
  });

  describe('Model Interface', () => {
    it('should implement ActivitieBackup1751799168Attributes interface', () => {
      const activityData = {
        id: 1,
        kindergarten_id: 1,
        plan_id: 1,
        title: 'Test Activity',
        activity_type: 'educational',
        cover_image: 'https://example.com/image.jpg',
        start_time: new Date('2024-01-01T10:00:00'),
        end_time: new Date('2024-01-01T12:00:00'),
        location: 'Test Location',
        capacity: '50',
        registered_count: '25',
        checked_in_count: '20',
        fee: '100.00',
        description: 'Test activity description',
        agenda: 'Test agenda',
        registration_start_time: new Date('2023-12-01T00:00:00'),
        registration_end_time: new Date('2023-12-31T23:59:59'),
        needs_approval: 'true',
        status: 'active',
        remark: 'Test remark',
        creator_id: 1,
        updater_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: new Date(),
        deleted_at: '2024-12-31T23:59:59.000Z',
      };

      const activity = ActivitieBackup1751799168.build(activityData);

      expect(activity.id).toBe(activityData.id);
      expect(activity.kindergarten_id).toBe(activityData.kindergarten_id);
      expect(activity.plan_id).toBe(activityData.plan_id);
      expect(activity.title).toBe(activityData.title);
      expect(activity.activity_type).toBe(activityData.activity_type);
      expect(activity.cover_image).toBe(activityData.cover_image);
      expect(activity.start_time).toEqual(activityData.start_time);
      expect(activity.end_time).toEqual(activityData.end_time);
      expect(activity.location).toBe(activityData.location);
      expect(activity.capacity).toBe(activityData.capacity);
      expect(activity.registered_count).toBe(activityData.registered_count);
      expect(activity.checked_in_count).toBe(activityData.checked_in_count);
      expect(activity.fee).toBe(activityData.fee);
      expect(activity.description).toBe(activityData.description);
      expect(activity.agenda).toBe(activityData.agenda);
      expect(activity.registration_start_time).toEqual(activityData.registration_start_time);
      expect(activity.registration_end_time).toEqual(activityData.registration_end_time);
      expect(activity.needs_approval).toBe(activityData.needs_approval);
      expect(activity.status).toBe(activityData.status);
      expect(activity.remark).toBe(activityData.remark);
      expect(activity.creator_id).toBe(activityData.creator_id);
      expect(activity.updater_id).toBe(activityData.updater_id);
      expect(activity.created_at).toBe(activityData.created_at);
      expect(activity.updated_at).toBe(activityData.updated_at);
      expect(activity.deleted_at).toBe(activityData.deleted_at);
    });
  });

  describe('Creation Attributes', () => {
    it('should handle creation with optional attributes', () => {
      const creationData = {
        title: 'Test Activity',
        activity_type: 'educational',
        location: 'Test Location',
      };

      const activity = ActivitieBackup1751799168.build(creationData);

      expect(activity.title).toBe(creationData.title);
      expect(activity.activity_type).toBe(creationData.activity_type);
      expect(activity.location).toBe(creationData.location);
      expect(activity.id).toBeDefined();
    });
  });

  describe('Database Constraints', () => {
    it('should have primary key constraint on id', () => {
      const attributes = ActivitieBackup1751799168.getAttributes();
      expect(attributes.id.primaryKey).toBe(true);
    });

    it('should have auto increment on id', () => {
      const attributes = ActivitieBackup1751799168.getAttributes();
      expect(attributes.id.autoIncrement).toBe(true);
    });
  });

  describe('Date Fields', () => {
    it('should handle date fields correctly', () => {
      const startDate = new Date('2024-01-01T10:00:00');
      const endDate = new Date('2024-01-01T12:00:00');
      const regStartDate = new Date('2023-12-01T00:00:00');
      const regEndDate = new Date('2023-12-31T23:59:59');

      const activity = ActivitieBackup1751799168.build({
        title: 'Test Activity',
        start_time: startDate,
        end_time: endDate,
        registration_start_time: regStartDate,
        registration_end_time: regEndDate,
      });

      expect(activity.start_time).toEqual(startDate);
      expect(activity.end_time).toEqual(endDate);
      expect(activity.registration_start_time).toEqual(regStartDate);
      expect(activity.registration_end_time).toEqual(regEndDate);
    });
  });

  describe('String Fields', () => {
    it('should handle string fields correctly', () => {
      const activity = ActivitieBackup1751799168.build({
        title: 'Test Activity Title',
        activity_type: 'educational',
        location: 'Test Location Address',
        capacity: '50',
        registered_count: '25',
        checked_in_count: '20',
        fee: '100.00',
        needs_approval: 'true',
        status: 'active',
        remark: 'Test remark text',
      });

      expect(activity.title).toBe('Test Activity Title');
      expect(activity.activity_type).toBe('educational');
      expect(activity.location).toBe('Test Location Address');
      expect(activity.capacity).toBe('50');
      expect(activity.registered_count).toBe('25');
      expect(activity.checked_in_count).toBe('20');
      expect(activity.fee).toBe('100.00');
      expect(activity.needs_approval).toBe('true');
      expect(activity.status).toBe('active');
      expect(activity.remark).toBe('Test remark text');
    });
  });
});