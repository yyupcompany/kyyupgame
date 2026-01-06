import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock dependencies
const mockActivityCheckinModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findAndCountAll: jest.fn(),
  bulkCreate: jest.fn()
};

const mockActivityModel = {
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn()
};

const mockStudentModel = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockTeacherModel = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockActivityRegistrationModel = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockNotificationService = {
  sendCheckinNotification: jest.fn(),
  sendAbsenceAlert: jest.fn(),
  sendLateArrivalNotification: jest.fn()
};

const mockQRCodeService = {
  generateQRCode: jest.fn(),
  verifyQRCode: jest.fn(),
  createCheckinQR: jest.fn()
};

const mockLocationService = {
  verifyLocation: jest.fn(),
  calculateDistance: jest.fn(),
  isWithinGeofence: jest.fn()
};

const mockStatisticsService = {
  updateAttendanceStats: jest.fn(),
  generateAttendanceReport: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn(),
  Op: {
    and: Symbol('and'),
    or: Symbol('or'),
    in: Symbol('in'),
    between: Symbol('between'),
    gte: Symbol('gte'),
    lte: Symbol('lte')
  }
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/models/activity-checkin.model', () => ({
  default: mockActivityCheckinModel
}));

jest.unstable_mockModule('../../../../../../src/models/activity.model', () => ({
  default: mockActivityModel
}));

jest.unstable_mockModule('../../../../../../src/models/student.model', () => ({
  default: mockStudentModel
}));

jest.unstable_mockModule('../../../../../../src/models/teacher.model', () => ({
  default: mockTeacherModel
}));

jest.unstable_mockModule('../../../../../../src/models/activity-registration.model', () => ({
  default: mockActivityRegistrationModel
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('../../../../../../src/services/notification/notification.service', () => ({
  default: mockNotificationService
}));

jest.unstable_mockModule('../../../../../../src/services/qrcode.service', () => ({
  default: mockQRCodeService
}));

jest.unstable_mockModule('../../../../../../src/services/location.service', () => ({
  default: mockLocationService
}));

jest.unstable_mockModule('../../../../../../src/services/statistics.service', () => ({
  default: mockStatisticsService
}));

jest.unstable_mockModule('../../../../../../src/config/database', () => ({
  default: mockSequelize
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

describe('ActivityCheckinService', () => {
  let activityCheckinService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../../src/services/activity/activity-checkin.service');
    activityCheckinService = imported.default || imported.ActivityCheckinService || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup transaction mock
    mockSequelize.transaction.mockImplementation((callback) => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      return callback(transaction);
    });
  });

  describe('签到管理', () => {
    it('应该成功创建学生签到记录', async () => {
      const checkinData = {
        activityId: 1,
        studentId: 101,
        checkinTime: new Date(),
        checkinType: 'manual',
        location: {
          latitude: 39.9042,
          longitude: 116.4074
        },
        notes: '准时到达'
      };

      const mockActivity = {
        id: 1,
        name: '晨间运动',
        startTime: new Date(Date.now() + 30 * 60 * 1000), // 30分钟后开始
        location: '操场',
        status: 'active'
      };

      const mockStudent = {
        id: 101,
        name: '张小明',
        classId: 1,
        status: 'active'
      };

      const mockRegistration = {
        id: 1,
        activityId: 1,
        studentId: 101,
        status: 'registered'
      };

      const mockCheckinRecord = {
        id: 1,
        ...checkinData,
        status: 'present',
        isLate: false,
        createdAt: new Date()
      };

      mockActivityModel.findByPk.mockResolvedValue(mockActivity);
      mockStudentModel.findByPk.mockResolvedValue(mockStudent);
      mockActivityRegistrationModel.findOne.mockResolvedValue(mockRegistration);
      mockActivityCheckinModel.findOne.mockResolvedValue(null); // 未重复签到
      mockLocationService.isWithinGeofence.mockResolvedValue(undefined);
      mockActivityCheckinModel.create.mockResolvedValue(mockCheckinRecord);

      const result = await activityCheckinService.checkinStudent(checkinData);

      expect(mockActivityModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockStudentModel.findByPk).toHaveBeenCalledWith(101);
      expect(mockActivityRegistrationModel.findOne).toHaveBeenCalledWith({
        where: { activityId: 1, studentId: 101 }
      });
      expect(mockLocationService.isWithinGeofence).toHaveBeenCalledWith(
        checkinData.location,
        mockActivity.location
      );
      expect(mockActivityCheckinModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: 1,
          studentId: 101,
          status: 'present',
          isLate: false
        })
      );
      expect(mockNotificationService.sendCheckinNotification).toHaveBeenCalledWith({
        studentId: 101,
        activityId: 1,
        checkinTime: expect.any(Date),
        status: 'present'
      });
      expect(result).toEqual(mockCheckinRecord);
    });

    it('应该检测迟到签到', async () => {
      const checkinData = {
        activityId: 1,
        studentId: 102,
        checkinTime: new Date(),
        checkinType: 'qr_code'
      };

      const mockActivity = {
        id: 1,
        name: '英语课',
        startTime: new Date(Date.now() - 15 * 60 * 1000), // 15分钟前开始
        graceTime: 10, // 10分钟宽限期
        status: 'active'
      };

      const mockStudent = {
        id: 102,
        name: '李小红',
        classId: 1
      };

      const mockRegistration = {
        id: 2,
        activityId: 1,
        studentId: 102,
        status: 'registered'
      };

      const mockLateCheckinRecord = {
        id: 2,
        ...checkinData,
        status: 'late',
        isLate: true,
        lateMinutes: 5
      };

      mockActivityModel.findByPk.mockResolvedValue(mockActivity);
      mockStudentModel.findByPk.mockResolvedValue(mockStudent);
      mockActivityRegistrationModel.findOne.mockResolvedValue(mockRegistration);
      mockActivityCheckinModel.findOne.mockResolvedValue(null);
      mockActivityCheckinModel.create.mockResolvedValue(mockLateCheckinRecord);

      const result = await activityCheckinService.checkinStudent(checkinData);

      expect(result.status).toBe('late');
      expect(result.isLate).toBe(true);
      expect(result.lateMinutes).toBe(5);
      expect(mockNotificationService.sendLateArrivalNotification).toHaveBeenCalledWith({
        studentId: 102,
        activityId: 1,
        lateMinutes: 5
      });
    });

    it('应该拒绝重复签到', async () => {
      const checkinData = {
        activityId: 1,
        studentId: 103,
        checkinTime: new Date(),
        checkinType: 'manual'
      };

      const mockExistingCheckin = {
        id: 3,
        activityId: 1,
        studentId: 103,
        status: 'present',
        checkinTime: new Date(Date.now() - 30 * 60 * 1000)
      };

      mockActivityCheckinModel.findOne.mockResolvedValue(mockExistingCheckin);

      await expect(activityCheckinService.checkinStudent(checkinData))
        .rejects.toThrow('Student has already checked in for this activity');

      expect(mockActivityCheckinModel.create).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Duplicate checkin attempt',
        expect.any(Object)
      );
    });

    it('应该验证QR码签到', async () => {
      const checkinData = {
        activityId: 1,
        studentId: 104,
        checkinType: 'qr_code',
        qrCode: 'activity_1_checkin_token_xyz'
      };

      const mockActivity = {
        id: 1,
        name: '美术课',
        startTime: new Date(Date.now() + 10 * 60 * 1000),
        qrCodeToken: 'token_xyz',
        status: 'active'
      };

      mockQRCodeService.verifyQRCode.mockResolvedValue({
        valid: true,
        activityId: 1,
        token: 'token_xyz'
      });
      mockActivityModel.findByPk.mockResolvedValue(mockActivity);
      mockStudentModel.findByPk.mockResolvedValue({ id: 104, name: '王小强' });
      mockActivityRegistrationModel.findOne.mockResolvedValue({ id: 4, status: 'registered' });
      mockActivityCheckinModel.findOne.mockResolvedValue(null);
      mockActivityCheckinModel.create.mockResolvedValue({
        id: 4,
        ...checkinData,
        status: 'present'
      });

      const result = await activityCheckinService.checkinStudent(checkinData);

      expect(mockQRCodeService.verifyQRCode).toHaveBeenCalledWith(
        'activity_1_checkin_token_xyz',
        { activityId: 1 }
      );
      expect(result.status).toBe('present');
    });

    it('应该拒绝无效的QR码', async () => {
      const checkinData = {
        activityId: 1,
        studentId: 105,
        checkinType: 'qr_code',
        qrCode: 'invalid_qr_code'
      };

      mockQRCodeService.verifyQRCode.mockResolvedValue({
        valid: false,
        error: 'Invalid QR code'
      });

      await expect(activityCheckinService.checkinStudent(checkinData))
        .rejects.toThrow('Invalid QR code');

      expect(mockActivityCheckinModel.create).not.toHaveBeenCalled();
    });
  });

  describe('签退管理', () => {
    it('应该成功处理学生签退', async () => {
      const checkoutData = {
        activityId: 1,
        studentId: 101,
        checkoutTime: new Date(),
        checkoutType: 'manual',
        notes: '正常离开'
      };

      const mockExistingCheckin = {
        id: 1,
        activityId: 1,
        studentId: 101,
        status: 'present',
        checkinTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前签到
        checkoutTime: null
      };

      const mockUpdatedCheckin = {
        ...mockExistingCheckin,
        checkoutTime: checkoutData.checkoutTime,
        duration: 120, // 2小时
        notes: checkoutData.notes
      };

      mockActivityCheckinModel.findOne.mockResolvedValue(mockExistingCheckin);
      mockActivityCheckinModel.update.mockResolvedValue([1]);
      mockActivityCheckinModel.findOne.mockResolvedValueOnce(mockExistingCheckin)
                                      .mockResolvedValueOnce(mockUpdatedCheckin);

      const result = await activityCheckinService.checkoutStudent(checkoutData);

      expect(mockActivityCheckinModel.findOne).toHaveBeenCalledWith({
        where: {
          activityId: 1,
          studentId: 101,
          checkoutTime: null
        }
      });
      expect(mockActivityCheckinModel.update).toHaveBeenCalledWith(
        expect.objectContaining({
          checkoutTime: checkoutData.checkoutTime,
          duration: expect.any(Number)
        }),
        { where: { id: 1 } }
      );
      expect(result.duration).toBe(120);
    });

    it('应该处理未签到直接签退的情况', async () => {
      const checkoutData = {
        activityId: 1,
        studentId: 106,
        checkoutTime: new Date(),
        checkoutType: 'manual'
      };

      mockActivityCheckinModel.findOne.mockResolvedValue(null); // 未找到签到记录

      await expect(activityCheckinService.checkoutStudent(checkoutData))
        .rejects.toThrow('No checkin record found for this student and activity');

      expect(mockActivityCheckinModel.update).not.toHaveBeenCalled();
    });

    it('应该处理重复签退', async () => {
      const checkoutData = {
        activityId: 1,
        studentId: 107,
        checkoutTime: new Date(),
        checkoutType: 'manual'
      };

      const mockExistingCheckin = {
        id: 5,
        activityId: 1,
        studentId: 107,
        status: 'present',
        checkinTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
        checkoutTime: new Date(Date.now() - 30 * 60 * 1000) // 已经签退
      };

      mockActivityCheckinModel.findOne.mockResolvedValue(mockExistingCheckin);

      await expect(activityCheckinService.checkoutStudent(checkoutData))
        .rejects.toThrow('Student has already checked out');

      expect(mockActivityCheckinModel.update).not.toHaveBeenCalled();
    });
  });

  describe('考勤统计', () => {
    it('应该获取活动考勤统计', async () => {
      const activityId = 1;
      const mockCheckinRecords = [
        { id: 1, studentId: 101, status: 'present', isLate: false },
        { id: 2, studentId: 102, status: 'late', isLate: true },
        { id: 3, studentId: 103, status: 'present', isLate: false }
      ];

      const mockRegistrations = [
        { id: 1, studentId: 101 },
        { id: 2, studentId: 102 },
        { id: 3, studentId: 103 },
        { id: 4, studentId: 104 }, // 未签到
        { id: 5, studentId: 105 }  // 未签到
      ];

      mockActivityCheckinModel.findAll.mockResolvedValue(mockCheckinRecords);
      mockActivityRegistrationModel.findAll.mockResolvedValue(mockRegistrations);

      const stats = await activityCheckinService.getActivityAttendanceStats(activityId);

      expect(stats).toEqual({
        activityId: 1,
        totalRegistered: 5,
        totalPresent: 2,
        totalLate: 1,
        totalAbsent: 2,
        attendanceRate: 0.6, // 3/5
        lateRate: 0.2, // 1/5
        absentStudents: [104, 105]
      });
    });

    it('应该获取学生考勤历史', async () => {
      const studentId = 101;
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const mockCheckinHistory = [
        {
          id: 1,
          activityId: 1,
          studentId: 101,
          status: 'present',
          checkinTime: new Date('2024-01-05T09:00:00'),
          activity: { name: '晨间运动', date: '2024-01-05' }
        },
        {
          id: 2,
          activityId: 2,
          studentId: 101,
          status: 'late',
          checkinTime: new Date('2024-01-10T09:15:00'),
          lateMinutes: 15,
          activity: { name: '英语课', date: '2024-01-10' }
        }
      ];

      mockActivityCheckinModel.findAll.mockResolvedValue(mockCheckinHistory);

      const history = await activityCheckinService.getStudentAttendanceHistory(
        studentId,
        dateRange
      );

      expect(mockActivityCheckinModel.findAll).toHaveBeenCalledWith({
        where: {
          studentId: 101,
          checkinTime: {
            [mockSequelize.Op.between]: [dateRange.start, dateRange.end]
          }
        },
        include: expect.any(Array),
        order: [['checkinTime', 'DESC']]
      });
      expect(history).toHaveLength(2);
      expect(history[0].status).toBe('present');
      expect(history[1].status).toBe('late');
    });

    it('应该生成班级考勤报告', async () => {
      const classId = 1;
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const mockClassStudents = [
        { id: 101, name: '张小明' },
        { id: 102, name: '李小红' },
        { id: 103, name: '王小强' }
      ];

      const mockAttendanceData = [
        { studentId: 101, totalActivities: 20, presentCount: 18, lateCount: 2, absentCount: 0 },
        { studentId: 102, totalActivities: 20, presentCount: 15, lateCount: 3, absentCount: 2 },
        { studentId: 103, totalActivities: 20, presentCount: 19, lateCount: 1, absentCount: 0 }
      ];

      mockStudentModel.findAll.mockResolvedValue(mockClassStudents);
      mockActivityCheckinModel.findAll.mockResolvedValue(mockAttendanceData);

      const report = await activityCheckinService.generateClassAttendanceReport(
        classId,
        dateRange
      );

      expect(report).toEqual({
        classId: 1,
        period: dateRange,
        totalStudents: 3,
        averageAttendanceRate: expect.any(Number),
        studentReports: expect.arrayContaining([
          expect.objectContaining({
            studentId: 101,
            name: '张小明',
            attendanceRate: expect.any(Number),
            totalActivities: 20,
            presentCount: 18
          })
        ])
      });
    });
  });

  describe('批量操作', () => {
    it('应该批量签到学生', async () => {
      const bulkCheckinData = {
        activityId: 1,
        studentIds: [101, 102, 103],
        checkinTime: new Date(),
        checkinType: 'bulk_manual',
        teacherId: 1
      };

      const mockActivity = {
        id: 1,
        name: '集体活动',
        startTime: new Date(Date.now() + 30 * 60 * 1000),
        status: 'active'
      };

      const mockRegistrations = [
        { id: 1, activityId: 1, studentId: 101, status: 'registered' },
        { id: 2, activityId: 1, studentId: 102, status: 'registered' },
        { id: 3, activityId: 1, studentId: 103, status: 'registered' }
      ];

      const mockBulkCheckinRecords = [
        { id: 1, activityId: 1, studentId: 101, status: 'present' },
        { id: 2, activityId: 1, studentId: 102, status: 'present' },
        { id: 3, activityId: 1, studentId: 103, status: 'present' }
      ];

      mockActivityModel.findByPk.mockResolvedValue(mockActivity);
      mockActivityRegistrationModel.findAll.mockResolvedValue(mockRegistrations);
      mockActivityCheckinModel.findAll.mockResolvedValue([]); // 无重复签到
      mockActivityCheckinModel.bulkCreate.mockResolvedValue(mockBulkCheckinRecords);

      const result = await activityCheckinService.bulkCheckinStudents(bulkCheckinData);

      expect(mockActivityRegistrationModel.findAll).toHaveBeenCalledWith({
        where: {
          activityId: 1,
          studentId: { [mockSequelize.Op.in]: [101, 102, 103] }
        }
      });
      expect(mockActivityCheckinModel.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ studentId: 101, status: 'present' }),
          expect.objectContaining({ studentId: 102, status: 'present' }),
          expect.objectContaining({ studentId: 103, status: 'present' })
        ])
      );
      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
    });

    it('应该处理批量签到中的部分失败', async () => {
      const bulkCheckinData = {
        activityId: 1,
        studentIds: [101, 102, 103],
        checkinTime: new Date(),
        checkinType: 'bulk_manual'
      };

      const mockRegistrations = [
        { id: 1, activityId: 1, studentId: 101, status: 'registered' },
        { id: 2, activityId: 1, studentId: 102, status: 'registered' }
        // 学生103未注册
      ];

      const mockExistingCheckins = [
        { id: 1, activityId: 1, studentId: 101, status: 'present' } // 学生101已签到
      ];

      mockActivityModel.findByPk.mockResolvedValue({ id: 1, status: 'active' });
      mockActivityRegistrationModel.findAll.mockResolvedValue(mockRegistrations);
      mockActivityCheckinModel.findAll.mockResolvedValue(mockExistingCheckins);
      mockActivityCheckinModel.bulkCreate.mockResolvedValue([
        { id: 2, activityId: 1, studentId: 102, status: 'present' }
      ]);

      const result = await activityCheckinService.bulkCheckinStudents(bulkCheckinData);

      expect(result.successCount).toBe(1); // 只有学生102成功
      expect(result.failureCount).toBe(2); // 学生101重复，学生103未注册
      expect(result.failures).toEqual([
        { studentId: 101, reason: 'Already checked in' },
        { studentId: 103, reason: 'Not registered for this activity' }
      ]);
    });

    it('应该标记缺席学生', async () => {
      const activityId = 1;
      const markTime = new Date();

      const mockRegistrations = [
        { id: 1, activityId: 1, studentId: 101 },
        { id: 2, activityId: 1, studentId: 102 },
        { id: 3, activityId: 1, studentId: 103 },
        { id: 4, activityId: 1, studentId: 104 }
      ];

      const mockExistingCheckins = [
        { id: 1, activityId: 1, studentId: 101, status: 'present' },
        { id: 2, activityId: 1, studentId: 102, status: 'late' }
        // 学生103和104未签到
      ];

      const mockAbsentRecords = [
        { id: 3, activityId: 1, studentId: 103, status: 'absent' },
        { id: 4, activityId: 1, studentId: 104, status: 'absent' }
      ];

      mockActivityRegistrationModel.findAll.mockResolvedValue(mockRegistrations);
      mockActivityCheckinModel.findAll.mockResolvedValue(mockExistingCheckins);
      mockActivityCheckinModel.bulkCreate.mockResolvedValue(mockAbsentRecords);

      const result = await activityCheckinService.markAbsentStudents(activityId, markTime);

      expect(result.absentCount).toBe(2);
      expect(result.absentStudents).toEqual([103, 104]);
      expect(mockNotificationService.sendAbsenceAlert).toHaveBeenCalledTimes(2);
    });
  });

  describe('地理位置验证', () => {
    it('应该验证签到位置', async () => {
      const checkinData = {
        activityId: 1,
        studentId: 101,
        location: {
          latitude: 39.9042,
          longitude: 116.4074
        }
      };

      const mockActivity = {
        id: 1,
        location: {
          latitude: 39.9040,
          longitude: 116.4070,
          radius: 100 // 100米范围内
        }
      };

      mockLocationService.calculateDistance.mockReturnValue(50); // 50米距离
      mockLocationService.isWithinGeofence.mockReturnValue(true);

      const isValid = await activityCheckinService.validateCheckinLocation(
        checkinData.location,
        mockActivity.location
      );

      expect(mockLocationService.calculateDistance).toHaveBeenCalledWith(
        checkinData.location,
        mockActivity.location
      );
      expect(isValid).toBe(true);
    });

    it('应该拒绝超出范围的签到', async () => {
      const checkinData = {
        activityId: 1,
        studentId: 101,
        location: {
          latitude: 39.9100,
          longitude: 116.4200
        }
      };

      const mockActivity = {
        id: 1,
        location: {
          latitude: 39.9040,
          longitude: 116.4070,
          radius: 100
        }
      };

      mockLocationService.calculateDistance.mockReturnValue(500); // 500米距离
      mockLocationService.isWithinGeofence.mockReturnValue(false);

      const isValid = await activityCheckinService.validateCheckinLocation(
        checkinData.location,
        mockActivity.location
      );

      expect(isValid).toBe(false);
    });
  });

  describe('错误处理', () => {
    it('应该处理数据库连接错误', async () => {
      const checkinData = {
        activityId: 1,
        studentId: 101,
        checkinTime: new Date()
      };

      mockActivityModel.findByPk.mockRejectedValue(new Error('Database connection failed'));

      await expect(activityCheckinService.checkinStudent(checkinData))
        .rejects.toThrow('Database connection failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Checkin operation failed',
        expect.any(Object)
      );
    });

    it('应该处理活动不存在的情况', async () => {
      const checkinData = {
        activityId: 999,
        studentId: 101,
        checkinTime: new Date()
      };

      mockActivityModel.findByPk.mockResolvedValue(null);

      await expect(activityCheckinService.checkinStudent(checkinData))
        .rejects.toThrow('Activity not found');

      expect(mockActivityCheckinModel.create).not.toHaveBeenCalled();
    });

    it('应该处理学生未注册活动的情况', async () => {
      const checkinData = {
        activityId: 1,
        studentId: 999,
        checkinTime: new Date()
      };

      mockActivityModel.findByPk.mockResolvedValue({ id: 1, status: 'active' });
      mockStudentModel.findByPk.mockResolvedValue({ id: 999, name: '未注册学生' });
      mockActivityRegistrationModel.findOne.mockResolvedValue(null);

      await expect(activityCheckinService.checkinStudent(checkinData))
        .rejects.toThrow('Student is not registered for this activity');

      expect(mockActivityCheckinModel.create).not.toHaveBeenCalled();
    });

    it('应该处理事务回滚', async () => {
      const checkinData = {
        activityId: 1,
        studentId: 101,
        checkinTime: new Date()
      };

      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
      };

      mockSequelize.transaction.mockImplementation((callback) => {
        return callback(mockTransaction);
      });

      mockActivityModel.findByPk.mockResolvedValue({ id: 1, status: 'active' });
      mockStudentModel.findByPk.mockResolvedValue({ id: 101 });
      mockActivityRegistrationModel.findOne.mockResolvedValue({ id: 1 });
      mockActivityCheckinModel.findOne.mockResolvedValue(null);
      mockActivityCheckinModel.create.mockRejectedValue(new Error('Create failed'));

      await expect(activityCheckinService.checkinStudent(checkinData))
        .rejects.toThrow('Create failed');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe('性能优化', () => {
    it('应该缓存活动信息', async () => {
      const activityId = 1;

      // 第一次调用
      mockActivityModel.findByPk.mockResolvedValue({ id: 1, name: '测试活动' });
      await activityCheckinService.getActivityInfo(activityId);

      // 第二次调用应该使用缓存
      await activityCheckinService.getActivityInfo(activityId);

      expect(mockActivityModel.findByPk).toHaveBeenCalledTimes(1);
    });

    it('应该批量处理通知', async () => {
      const notifications = [
        { studentId: 101, type: 'checkin', activityId: 1 },
        { studentId: 102, type: 'checkin', activityId: 1 },
        { studentId: 103, type: 'checkin', activityId: 1 }
      ];

      await activityCheckinService.sendBatchNotifications(notifications);

      expect(mockNotificationService.sendCheckinNotification).toHaveBeenCalledTimes(3);
    });
  });
});
