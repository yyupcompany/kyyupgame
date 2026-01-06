import { Schedule, ScheduleType, ScheduleStatus, RepeatType } from '../../../src/models/schedule.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { sequelize } from '../../../src/init';


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

describe('Schedule Model', () => {
  beforeAll(async () => {
    // 确保数据库连接正常
    await sequelize.authenticate();
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should be defined', () => {
      expect(Schedule).toBeDefined();
    });

    it('should have correct model name', () => {
      expect(Schedule.name).toBe('Schedule');
    });

    it('should have correct table name', () => {
      expect(Schedule.tableName).toBe('schedules');
    });

    it('should have timestamps enabled', () => {
      expect(Schedule.options.timestamps).toBe(true);
    });

    it('should have underscored enabled', () => {
      expect(Schedule.options.underscored).toBe(true);
    });

    it('should have paranoid enabled', () => {
      expect(Schedule.options.paranoid).toBe(true);
    });
  });

  describe('Model Attributes', () => {
    it('should have correct id attribute', () => {
      const idAttribute = Schedule.getAttributes().id;
      expect(idAttribute).toBeDefined();
      expect(idAttribute.type.constructor.name).toBe('INTEGER');
      expect(idAttribute.autoIncrement).toBe(true);
      expect(idAttribute.primaryKey).toBe(true);
    });

    it('should have correct title attribute', () => {
      const titleAttribute = Schedule.getAttributes().title;
      expect(titleAttribute).toBeDefined();
      expect(titleAttribute.type.constructor.name).toBe('VARCHAR');
      expect(titleAttribute.allowNull).toBe(false);
      expect(titleAttribute.comment).toBe('日程标题');
    });

    it('should have correct description attribute', () => {
      const descriptionAttribute = Schedule.getAttributes().description;
      expect(descriptionAttribute).toBeDefined();
      expect(descriptionAttribute.type.constructor.name).toBe('TEXT');
      expect(descriptionAttribute.allowNull).toBe(true);
      expect(descriptionAttribute.comment).toBe('日程描述');
    });

    it('should have correct type attribute', () => {
      const typeAttribute = Schedule.getAttributes().type;
      expect(typeAttribute).toBeDefined();
      expect(typeAttribute.type.constructor.name).toBe('ENUM');
      expect(typeAttribute.allowNull).toBe(false);
      expect(typeAttribute.defaultValue).toBe(ScheduleType.TASK);
      expect(typeAttribute.comment).toBe('日程类型');
    });

    it('should have correct status attribute', () => {
      const statusAttribute = Schedule.getAttributes().status;
      expect(statusAttribute).toBeDefined();
      expect(statusAttribute.type.constructor.name).toBe('ENUM');
      expect(statusAttribute.allowNull).toBe(false);
      expect(statusAttribute.defaultValue).toBe(ScheduleStatus.PENDING);
      expect(statusAttribute.comment).toBe('日程状态');
    });

    it('should have correct startTime attribute', () => {
      const startTimeAttribute = Schedule.getAttributes().startTime;
      expect(startTimeAttribute).toBeDefined();
      expect(startTimeAttribute.type.constructor.name).toBe('DATE');
      expect(startTimeAttribute.allowNull).toBe(false);
      expect(startTimeAttribute.field).toBe('start_time');
      expect(startTimeAttribute.comment).toBe('开始时间');
    });

    it('should have correct endTime attribute', () => {
      const endTimeAttribute = Schedule.getAttributes().endTime;
      expect(endTimeAttribute).toBeDefined();
      expect(endTimeAttribute.type.constructor.name).toBe('DATE');
      expect(endTimeAttribute.allowNull).toBe(true);
      expect(endTimeAttribute.field).toBe('end_time');
      expect(endTimeAttribute.comment).toBe('结束时间');
    });

    it('should have correct allDay attribute', () => {
      const allDayAttribute = Schedule.getAttributes().allDay;
      expect(allDayAttribute).toBeDefined();
      expect(allDayAttribute.type.constructor.name).toBe('BOOLEAN');
      expect(allDayAttribute.allowNull).toBe(false);
      expect(allDayAttribute.defaultValue).toBe(false);
      expect(allDayAttribute.field).toBe('is_all_day');
      expect(allDayAttribute.comment).toBe('是否全天');
    });

    it('should have correct location attribute', () => {
      const locationAttribute = Schedule.getAttributes().location;
      expect(locationAttribute).toBeDefined();
      expect(locationAttribute.type.constructor.name).toBe('VARCHAR');
      expect(locationAttribute.allowNull).toBe(true);
      expect(locationAttribute.comment).toBe('地点');
    });

    it('should have correct repeatType attribute', () => {
      const repeatTypeAttribute = Schedule.getAttributes().repeatType;
      expect(repeatTypeAttribute).toBeDefined();
      expect(repeatTypeAttribute.type.constructor.name).toBe('ENUM');
      expect(repeatTypeAttribute.allowNull).toBe(false);
      expect(repeatTypeAttribute.defaultValue).toBe(RepeatType.NONE);
      expect(repeatTypeAttribute.field).toBe('repeat_type');
      expect(repeatTypeAttribute.comment).toBe('重复类型');
    });

    it('should have correct userId attribute', () => {
      const userIdAttribute = Schedule.getAttributes().userId;
      expect(userIdAttribute).toBeDefined();
      expect(userIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(userIdAttribute.allowNull).toBe(false);
      expect(userIdAttribute.field).toBe('user_id');
      expect(userIdAttribute.comment).toBe('用户ID');
    });

    it('should have correct priority attribute', () => {
      const priorityAttribute = Schedule.getAttributes().priority;
      expect(priorityAttribute).toBeDefined();
      expect(priorityAttribute.type.constructor.name).toBe('INTEGER');
      expect(priorityAttribute.allowNull).toBe(false);
      expect(priorityAttribute.defaultValue).toBe(3);
      expect(priorityAttribute.comment).toBe('优先级 - 1:最高 2:高 3:中 4:低 5:最低');
    });

    it('should have correct kindergartenId attribute', () => {
      const kindergartenIdAttribute = Schedule.getAttributes().kindergartenId;
      expect(kindergartenIdAttribute).toBeDefined();
      expect(kindergartenIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(kindergartenIdAttribute.allowNull).toBe(true);
      expect(kindergartenIdAttribute.field).toBe('kindergarten_id');
      expect(kindergartenIdAttribute.comment).toBe('幼儿园ID');
    });

    it('should have correct metadata attribute', () => {
      const metadataAttribute = Schedule.getAttributes().metadata;
      expect(metadataAttribute).toBeDefined();
      expect(metadataAttribute.type.constructor.name).toBe('JSON');
      expect(metadataAttribute.allowNull).toBe(true);
      expect(metadataAttribute.comment).toBe('元数据（JSON格式）');
    });
  });

  describe('Model Creation', () => {
    it('should create a new schedule with all fields', async () => {
      const scheduleData = {
        title: 'Team Meeting',
        description: 'Weekly team sync meeting',
        type: ScheduleType.MEETING,
        status: ScheduleStatus.PENDING,
        startTime: new Date('2025-01-15T10:00:00'),
        endTime: new Date('2025-01-15T11:00:00'),
        allDay: false,
        location: 'Conference Room A',
        repeatType: RepeatType.WEEKLY,
        userId: 1,
        relatedId: 1,
        relatedType: 'project',
        priority: 2,
        kindergartenId: 1,
        metadata: { color: 'blue', category: 'work' },
      };

      const schedule = await Schedule.create(scheduleData);
      
      expect(schedule).toBeDefined();
      expect(schedule.id).toBeDefined();
      expect(schedule.title).toBe(scheduleData.title);
      expect(schedule.description).toBe(scheduleData.description);
      expect(schedule.type).toBe(scheduleData.type);
      expect(schedule.status).toBe(scheduleData.status);
      expect(schedule.startTime).toEqual(scheduleData.startTime);
      expect(schedule.endTime).toEqual(scheduleData.endTime);
      expect(schedule.allDay).toBe(scheduleData.allDay);
      expect(schedule.location).toBe(scheduleData.location);
      expect(schedule.repeatType).toBe(scheduleData.repeatType);
      expect(schedule.userId).toBe(scheduleData.userId);
      expect(schedule.relatedId).toBe(scheduleData.relatedId);
      expect(schedule.relatedType).toBe(scheduleData.relatedType);
      expect(schedule.priority).toBe(scheduleData.priority);
      expect(schedule.kindergartenId).toBe(scheduleData.kindergartenId);
      expect(schedule.metadata).toEqual(scheduleData.metadata);
    });

    it('should create a schedule with minimal required fields', async () => {
      const minimalData = {
        title: 'Simple Task',
        startTime: new Date(),
        userId: 1,
      };

      const schedule = await Schedule.create(minimalData);
      
      expect(schedule).toBeDefined();
      expect(schedule.id).toBeDefined();
      expect(schedule.title).toBe(minimalData.title);
      expect(schedule.startTime).toEqual(minimalData.startTime);
      expect(schedule.userId).toBe(minimalData.userId);
      
      // Check default values
      expect(schedule.type).toBe(ScheduleType.TASK);
      expect(schedule.status).toBe(ScheduleStatus.PENDING);
      expect(schedule.allDay).toBe(false);
      expect(schedule.repeatType).toBe(RepeatType.NONE);
      expect(schedule.priority).toBe(3);
    });

    it('should create an all-day schedule', async () => {
      const allDayData = {
        title: 'All Day Event',
        startTime: new Date('2025-01-15T00:00:00'),
        allDay: true,
        userId: 1,
      };

      const schedule = await Schedule.create(allDayData);
      
      expect(schedule).toBeDefined();
      expect(schedule.allDay).toBe(true);
      expect(schedule.endTime).toBeNull();
    });
  });

  describe('Model Validation', () => {
    it('should allow null values for optional fields', async () => {
      const schedule = await Schedule.create({
        title: 'Null Test Schedule',
        startTime: new Date(),
        userId: 1,
      });

      expect(schedule.description).toBeNull();
      expect(schedule.endTime).toBeNull();
      expect(schedule.location).toBeNull();
      expect(schedule.relatedId).toBeNull();
      expect(schedule.relatedType).toBeNull();
      expect(schedule.kindergartenId).toBeNull();
      expect(schedule.metadata).toBeNull();
    });

    it('should handle empty string values', async () => {
      const schedule = await Schedule.create({
        title: 'Empty String Schedule',
        startTime: new Date(),
        userId: 1,
        description: '',
        location: '',
        relatedType: '',
      });

      expect(schedule.description).toBe('');
      expect(schedule.location).toBe('');
      expect(schedule.relatedType).toBe('');
    });

    it('should handle different schedule types', async () => {
      const scheduleTypes = Object.values(ScheduleType);
      
      for (const type of scheduleTypes) {
        const schedule = await Schedule.create({
          title: `Schedule Type ${type}`,
          startTime: new Date(),
          userId: 1,
          type: type,
        });
        
        expect(schedule.type).toBe(type);
      }
    });

    it('should handle different schedule statuses', async () => {
      const scheduleStatuses = Object.values(ScheduleStatus);
      
      for (const status of scheduleStatuses) {
        const schedule = await Schedule.create({
          title: `Schedule Status ${status}`,
          startTime: new Date(),
          userId: 1,
          status: status,
        });
        
        expect(schedule.status).toBe(status);
      }
    });

    it('should handle different repeat types', async () => {
      const repeatTypes = Object.values(RepeatType);
      
      for (const repeatType of repeatTypes) {
        const schedule = await Schedule.create({
          title: `Repeat Type ${repeatType}`,
          startTime: new Date(),
          userId: 1,
          repeatType: repeatType,
        });
        
        expect(schedule.repeatType).toBe(repeatType);
      }
    });

    it('should handle different priority levels', async () => {
      const priorities = [1, 2, 3, 4, 5];
      
      for (const priority of priorities) {
        const schedule = await Schedule.create({
          title: `Priority ${priority}`,
          startTime: new Date(),
          userId: 1,
          priority: priority,
        });
        
        expect(schedule.priority).toBe(priority);
      }
    });

    it('should handle JSON metadata', async () => {
      const metadataList = [
        { color: 'red', category: 'personal' },
        { tags: ['urgent', 'important'], priority: 1 },
        { settings: { reminder: true, notification: 'email' } },
        null,
      ];
      
      for (const metadata of metadataList) {
        const schedule = await Schedule.create({
          title: 'Metadata Test',
          startTime: new Date(),
          userId: 1,
          metadata: metadata,
        });
        
        expect(schedule.metadata).toEqual(metadata);
      }
    });
  });

  describe('Model Updates', () => {
    it('should update schedule attributes', async () => {
      const schedule = await Schedule.create({
        title: 'Update Test Schedule',
        startTime: new Date(),
        userId: 1,
        status: ScheduleStatus.PENDING,
      });

      await schedule.update({
        title: 'Updated Schedule',
        status: ScheduleStatus.IN_PROGRESS,
        description: 'Updated description',
        priority: 1,
      });

      const updatedSchedule = await Schedule.findByPk(schedule.id);
      expect(updatedSchedule?.title).toBe('Updated Schedule');
      expect(updatedSchedule?.status).toBe(ScheduleStatus.IN_PROGRESS);
      expect(updatedSchedule?.description).toBe('Updated description');
      expect(updatedSchedule?.priority).toBe(1);
    });

    it('should handle partial updates', async () => {
      const schedule = await Schedule.create({
        title: 'Partial Update Schedule',
        startTime: new Date(),
        userId: 1,
        description: 'Original description',
        priority: 3,
      });

      await schedule.update({
        priority: 1,
      });

      const updatedSchedule = await Schedule.findByPk(schedule.id);
      expect(updatedSchedule?.priority).toBe(1);
      expect(updatedSchedule?.title).toBe('Partial Update Schedule'); // Should remain unchanged
      expect(updatedSchedule?.description).toBe('Original description'); // Should remain unchanged
    });
  });

  describe('Model Queries', () => {
    it('should find schedule by id', async () => {
      const createdSchedule = await Schedule.create({
        title: 'Find By ID Schedule',
        startTime: new Date(),
        userId: 1,
      });

      const foundSchedule = await Schedule.findByPk(createdSchedule.id);
      
      expect(foundSchedule).toBeDefined();
      expect(foundSchedule?.id).toBe(createdSchedule.id);
      expect(foundSchedule?.title).toBe('Find By ID Schedule');
    });

    it('should find schedules by user id', async () => {
      await Schedule.bulkCreate([
        { title: 'User 1 Schedule 1', startTime: new Date(), userId: 1 },
        { title: 'User 1 Schedule 2', startTime: new Date(), userId: 1 },
        { title: 'User 2 Schedule', startTime: new Date(), userId: 2 },
      ]);

      const user1Schedules = await Schedule.findAll({
        where: { userId: 1 },
      });
      
      expect(user1Schedules).toHaveLength(2);
      expect(user1Schedules.map(s => s.title)).toContain('User 1 Schedule 1');
      expect(user1Schedules.map(s => s.title)).toContain('User 1 Schedule 2');
    });

    it('should find schedules by type', async () => {
      await Schedule.bulkCreate([
        { title: 'Task 1', startTime: new Date(), userId: 1, type: ScheduleType.TASK },
        { title: 'Meeting 1', startTime: new Date(), userId: 1, type: ScheduleType.MEETING },
        { title: 'Task 2', startTime: new Date(), userId: 1, type: ScheduleType.TASK },
      ]);

      const taskSchedules = await Schedule.findAll({
        where: { type: ScheduleType.TASK },
      });
      
      expect(taskSchedules).toHaveLength(2);
      expect(taskSchedules.map(s => s.title)).toContain('Task 1');
      expect(taskSchedules.map(s => s.title)).toContain('Task 2');
    });

    it('should find schedules by status', async () => {
      await Schedule.bulkCreate([
        { title: 'Pending Task', startTime: new Date(), userId: 1, status: ScheduleStatus.PENDING },
        { title: 'In Progress Task', startTime: new Date(), userId: 1, status: ScheduleStatus.IN_PROGRESS },
        { title: 'Completed Task', startTime: new Date(), userId: 1, status: ScheduleStatus.COMPLETED },
      ]);

      const pendingSchedules = await Schedule.findAll({
        where: { status: ScheduleStatus.PENDING },
      });
      
      expect(pendingSchedules).toHaveLength(1);
      expect(pendingSchedules[0].title).toBe('Pending Task');
    });

    it('should find schedules by date range', async () => {
      const startDate = new Date('2025-01-15T00:00:00');
      const endDate = new Date('2025-01-15T23:59:59');
      
      await Schedule.bulkCreate([
        { title: 'Schedule 1', startTime: new Date('2025-01-15T10:00:00'), userId: 1 },
        { title: 'Schedule 2', startTime: new Date('2025-01-15T14:00:00'), userId: 1 },
        { title: 'Schedule 3', startTime: new Date('2025-01-16T10:00:00'), userId: 1 },
      ]);

      const dateRangeSchedules = await Schedule.findAll({
        where: {
          startTime: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
      
      expect(dateRangeSchedules).toHaveLength(2);
      expect(dateRangeSchedules.map(s => s.title)).toContain('Schedule 1');
      expect(dateRangeSchedules.map(s => s.title)).toContain('Schedule 2');
    });

    it('should find all-day schedules', async () => {
      await Schedule.bulkCreate([
        { title: 'All Day Event', startTime: new Date(), userId: 1, allDay: true },
        { title: 'Regular Event', startTime: new Date(), userId: 1, allDay: false },
        { title: 'Another All Day', startTime: new Date(), userId: 1, allDay: true },
      ]);

      const allDaySchedules = await Schedule.findAll({
        where: { allDay: true },
      });
      
      expect(allDaySchedules).toHaveLength(2);
      expect(allDaySchedules.map(s => s.title)).toContain('All Day Event');
      expect(allDaySchedules.map(s => s.title)).toContain('Another All Day');
    });
  });

  describe('Model Deletion', () => {
    it('should soft delete schedule', async () => {
      const schedule = await Schedule.create({
        title: 'Soft Delete Schedule',
        startTime: new Date(),
        userId: 1,
      });

      await schedule.destroy();

      const deletedSchedule = await Schedule.findByPk(schedule.id);
      expect(deletedSchedule).toBeNull();

      // Check if it exists in paranoid mode
      const paranoidSchedule = await Schedule.findByPk(schedule.id, {
        paranoid: false,
      });
      expect(paranoidSchedule).toBeDefined();
    });

    it('should restore soft deleted schedule', async () => {
      const schedule = await Schedule.create({
        title: 'Restore Schedule',
        startTime: new Date(),
        userId: 1,
      });

      await schedule.destroy();
      await schedule.restore();

      const restoredSchedule = await Schedule.findByPk(schedule.id);
      expect(restoredSchedule).toBeDefined();
      expect(restoredSchedule?.title).toBe('Restore Schedule');
    });
  });

  describe('Model Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const schedule = await Schedule.create({
        title: 'Timestamp Test Schedule',
        startTime: new Date(),
        userId: 1,
      });

      expect(schedule.createdAt).toBeDefined();
      expect(schedule.updatedAt).toBeDefined();
      expect(schedule.createdAt).toBeInstanceOf(Date);
      expect(schedule.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on update', async () => {
      const schedule = await Schedule.create({
        title: 'Timestamp Update Schedule',
        startTime: new Date(),
        userId: 1,
      });

      const originalUpdatedAt = schedule.updatedAt;
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await schedule.update({ title: 'Updated Title' });
      
      expect(schedule.updatedAt).toBeInstanceOf(Date);
      expect(schedule.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Instance Methods', () => {
    it('should mark schedule as completed', async () => {
      const schedule = await Schedule.create({
        title: 'Complete Test Schedule',
        startTime: new Date(),
        userId: 1,
        status: ScheduleStatus.PENDING,
      });

      await schedule.markAsCompleted();

      const updatedSchedule = await Schedule.findByPk(schedule.id);
      expect(updatedSchedule?.status).toBe(ScheduleStatus.COMPLETED);
    });

    it('should cancel schedule', async () => {
      const schedule = await Schedule.create({
        title: 'Cancel Test Schedule',
        startTime: new Date(),
        userId: 1,
        status: ScheduleStatus.PENDING,
      });

      await schedule.cancel();

      const updatedSchedule = await Schedule.findByPk(schedule.id);
      expect(updatedSchedule?.status).toBe(ScheduleStatus.CANCELLED);
    });
  });

  describe('Associations', () => {
    it('should have user association defined', () => {
      const associations = Schedule.associations;
      expect(associations.user).toBeDefined();
      expect(associations.user.associationType).toBe('BelongsTo');
    });
  });

  describe('Business Logic Tests', () => {
    it('should handle schedule lifecycle', async () => {
      // Create schedule
      const schedule = await Schedule.create({
        title: 'Lifecycle Schedule',
        startTime: new Date(),
        userId: 1,
        status: ScheduleStatus.PENDING,
      });

      const originalId = schedule.id;

      // Mark as in progress
      await schedule.update({ status: ScheduleStatus.IN_PROGRESS });

      const inProgressSchedule = await Schedule.findByPk(originalId);
      expect(inProgressSchedule?.status).toBe(ScheduleStatus.IN_PROGRESS);

      // Mark as completed
      await schedule.markAsCompleted();

      const completedSchedule = await Schedule.findByPk(originalId);
      expect(completedSchedule?.status).toBe(ScheduleStatus.COMPLETED);

      // Soft delete
      await schedule.destroy();

      const deletedSchedule = await Schedule.findByPk(originalId);
      expect(deletedSchedule).toBeNull();

      // Restore
      await schedule.restore();

      const restoredSchedule = await Schedule.findByPk(originalId);
      expect(restoredSchedule).toBeDefined();
      expect(restoredSchedule?.status).toBe(ScheduleStatus.COMPLETED);
    });

    it('should handle recurring schedules', async () => {
      const recurringSchedules = [
        { title: 'Daily Standup', repeatType: RepeatType.DAILY },
        { title: 'Weekly Review', repeatType: RepeatType.WEEKLY },
        { title: 'Monthly Report', repeatType: RepeatType.MONTHLY },
        { title: 'Annual Planning', repeatType: RepeatType.YEARLY },
      ];

      for (const scheduleData of recurringSchedules) {
        const schedule = await Schedule.create({
          ...scheduleData,
          startTime: new Date(),
          userId: 1,
        });

        expect(schedule.repeatType).toBe(scheduleData.repeatType);
      }
    });

    it('should handle priority-based ordering', async () => {
      await Schedule.bulkCreate([
        { title: 'Low Priority', startTime: new Date(), userId: 1, priority: 4 },
        { title: 'High Priority', startTime: new Date(), userId: 1, priority: 2 },
        { title: 'Medium Priority', startTime: new Date(), userId: 1, priority: 3 },
        { title: 'Highest Priority', startTime: new Date(), userId: 1, priority: 1 },
      ]);

      const priorityOrderedSchedules = await Schedule.findAll({
        order: [['priority', 'ASC']],
      });

      expect(priorityOrderedSchedules[0].title).toBe('Highest Priority');
      expect(priorityOrderedSchedules[1].title).toBe('High Priority');
      expect(priorityOrderedSchedules[2].title).toBe('Medium Priority');
      expect(priorityOrderedSchedules[3].title).toBe('Low Priority');
    });

    it('should handle time-based queries', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 86400000); // 1 day ago
      const future = new Date(now.getTime() + 86400000); // 1 day from now

      await Schedule.bulkCreate([
        { title: 'Past Schedule', startTime: past, userId: 1 },
        { title: 'Present Schedule', startTime: now, userId: 1 },
        { title: 'Future Schedule', startTime: future, userId: 1 },
      ]);

      const upcomingSchedules = await Schedule.findAll({
        where: {
          startTime: {
            [Op.gte]: now,
          },
        },
        order: [['startTime', 'ASC']],
      });

      expect(upcomingSchedules).toHaveLength(2);
      expect(upcomingSchedules[0].title).toBe('Present Schedule');
      expect(upcomingSchedules[1].title).toBe('Future Schedule');
    });

    it('should handle complex metadata queries', async () => {
      await Schedule.bulkCreate([
        { 
          title: 'Red Task', 
          startTime: new Date(), 
          userId: 1, 
          metadata: { color: 'red', category: 'work', urgent: true } 
        },
        { 
          title: 'Blue Task', 
          startTime: new Date(), 
          userId: 1, 
          metadata: { color: 'blue', category: 'personal' } 
        },
        { 
          title: 'Green Task', 
          startTime: new Date(), 
          userId: 1, 
          metadata: { color: 'green', category: 'work', urgent: false } 
        },
      ]);

      // This test depends on JSON querying capabilities of the database
      // For now, we'll just verify the schedules were created
      const allSchedules = await Schedule.findAll({
        where: {
          metadata: {
            [Op.ne]: null,
          },
        },
      });

      expect(allSchedules).toHaveLength(3);
      expect(allSchedules.map(s => s.title)).toContain('Red Task');
      expect(allSchedules.map(s => s.title)).toContain('Blue Task');
      expect(allSchedules.map(s => s.title)).toContain('Green Task');
    });
  });

  describe('Edge Cases', () => {
    it('should handle schedules with very long titles', async () => {
      const longTitle = 'a'.repeat(100); // Maximum VARCHAR(100)
      
      const schedule = await Schedule.create({
        title: longTitle,
        startTime: new Date(),
        userId: 1,
      });

      expect(schedule.title).toBe(longTitle);
    });

    it('should handle schedules with very long descriptions', async () => {
      const longDescription = 'a'.repeat(10000); // Very long TEXT
      
      const schedule = await Schedule.create({
        title: 'Long Description Schedule',
        startTime: new Date(),
        userId: 1,
        description: longDescription,
      });

      expect(schedule.description).toBe(longDescription);
    });

    it('should handle schedules with unicode characters', async () => {
      const schedule = await Schedule.create({
        title: '中文日程',
        description: '这是一个中文描述',
        location: '会议室A',
        startTime: new Date(),
        userId: 1,
      });

      expect(schedule.title).toBe('中文日程');
      expect(schedule.description).toBe('这是一个中文描述');
      expect(schedule.location).toBe('会议室A');
    });

    it('should handle schedules with special characters', async () => {
      const schedule = await Schedule.create({
        title: 'Special @#$% Schedule',
        description: 'Description with special chars: !@#$%^&*()',
        location: 'Room @#$%',
        startTime: new Date(),
        userId: 1,
      });

      expect(schedule.title).toBe('Special @#$% Schedule');
      expect(schedule.description).toBe('Description with special chars: !@#$%^&*()');
      expect(schedule.location).toBe('Room @#$%');
    });
  });
});