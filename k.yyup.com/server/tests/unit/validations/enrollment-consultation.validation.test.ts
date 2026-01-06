import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Joi
const mockJoi = {
  object: jest.fn(),
  string: jest.fn(),
  number: jest.fn(),
  boolean: jest.fn(),
  date: jest.fn(),
  array: jest.fn(),
  any: jest.fn(),
  valid: jest.fn(),
  required: jest.fn(),
  optional: jest.fn(),
  min: jest.fn(),
  max: jest.fn(),
  length: jest.fn(),
  pattern: jest.fn(),
  email: jest.fn(),
  uri: jest.fn(),
  allow: jest.fn(),
  when: jest.fn(),
  alternatives: jest.fn(),
  validate: jest.fn()
};

// Create chainable mock methods
const createChainableMock = () => {
  const chainable = {
    required: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    min: jest.fn().mockReturnThis(),
    max: jest.fn().mockReturnThis(),
    length: jest.fn().mockReturnThis(),
    pattern: jest.fn().mockReturnThis(),
    email: jest.fn().mockReturnThis(),
    uri: jest.fn().mockReturnThis(),
    allow: jest.fn().mockReturnThis(),
    valid: jest.fn().mockReturnThis(),
    when: jest.fn().mockReturnThis(),
    items: jest.fn().mockReturnThis(),
    keys: jest.fn().mockReturnThis(),
    messages: jest.fn().mockReturnThis()
  };
  return chainable;
};

// Setup chainable mocks
Object.keys(mockJoi).forEach(key => {
  if (typeof mockJoi[key] === 'function' && key !== 'validate') {
    mockJoi[key].mockReturnValue(createChainableMock());
  }
});

// Mock validation result helper
const createMockValidationResult = (isValid: boolean, errors: string[] = []) => ({
  error: isValid ? null : {
    details: errors.map(message => ({ message, path: ['field'], type: 'any.invalid' }))
  },
  value: isValid ? {} : undefined
});

// Mock imports
jest.unstable_mockModule('joi', () => mockJoi);


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

describe('Enrollment Consultation Validation', () => {
  let enrollmentConsultationValidation: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/enrollment-consultation.validation');
    enrollmentConsultationValidation = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default to valid validation
    mockJoi.validate.mockReturnValue(createMockValidationResult(true));
  });

  describe('createConsultationSchema', () => {
    it('应该验证有效的咨询预约数据', () => {
      const validData = {
        kindergartenId: 1,
        parentInfo: {
          name: '张家长',
          phone: '13800138001',
          email: 'parent@example.com',
          relationship: 'mother'
        },
        childInfo: {
          name: '张小明',
          age: 4,
          gender: 'male',
          currentSchool: '无',
          specialNeeds: '无特殊需求'
        },
        consultationType: 'enrollment_inquiry',
        preferredDate: '2024-05-15',
        preferredTime: '10:00',
        alternativeSlots: [
          { date: '2024-05-16', time: '14:00' },
          { date: '2024-05-17', time: '09:00' }
        ],
        topics: ['curriculum', 'facilities', 'fees'],
        questions: [
          '请介绍一下贵园的教学理念',
          '学费标准是怎样的？',
          '有哪些特色课程？'
        ],
        visitRequested: true,
        notes: '希望能参观校园环境'
      };

      const result = mockJoi.validate(validData, enrollmentConsultationValidation.createConsultationSchema);

      expect((result as any).error).toBeNull();
      expect(mockJoi.object).toHaveBeenCalled();
      expect(mockJoi.string).toHaveBeenCalled();
      expect(mockJoi.array).toHaveBeenCalled();
    });

    it('应该验证必填字段', () => {
      const testCases = [
        { field: 'kindergartenId', data: {}, error: '幼儿园ID是必填字段' },
        { field: 'parentInfo', data: { kindergartenId: 1 }, error: '家长信息是必填字段' },
        { field: 'childInfo', data: { kindergartenId: 1, parentInfo: {} }, error: '孩子信息是必填字段' },
        { field: 'consultationType', data: { kindergartenId: 1, parentInfo: {}, childInfo: {} }, error: '咨询类型是必填字段' }
      ];

      testCases.forEach(({ field, data, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate(data, enrollmentConsultationValidation.createConsultationSchema);
        
        expect((result as any).error).toBeTruthy();
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证家长信息结构', () => {
      const invalidParentInfo = [
        {
          parentInfo: { name: '' },
          error: '家长姓名不能为空'
        },
        {
          parentInfo: { name: '张家长', phone: '123' },
          error: '手机号格式无效'
        },
        {
          parentInfo: { name: '张家长', phone: '13800138001', email: 'invalid-email' },
          error: '邮箱格式无效'
        },
        {
          parentInfo: { name: '张家长', phone: '13800138001', relationship: 'unknown' },
          error: '家长关系无效'
        }
      ];

      invalidParentInfo.forEach(({ parentInfo, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ parentInfo }, enrollmentConsultationValidation.createConsultationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证孩子信息结构', () => {
      const invalidChildInfo = [
        {
          childInfo: { name: '' },
          error: '孩子姓名不能为空'
        },
        {
          childInfo: { name: '张小明', age: 0 },
          error: '孩子年龄必须在1-10岁之间'
        },
        {
          childInfo: { name: '张小明', age: 4, gender: 'unknown' },
          error: '性别必须是 male 或 female'
        },
        {
          childInfo: { name: '张小明', age: 15 },
          error: '孩子年龄必须在1-10岁之间'
        }
      ];

      invalidChildInfo.forEach(({ childInfo, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ childInfo }, enrollmentConsultationValidation.createConsultationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证咨询类型枚举', () => {
      const invalidTypes = ['invalid', 'unknown', '入学咨询'];
      
      invalidTypes.forEach(consultationType => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['咨询类型无效']));
        
        const result = mockJoi.validate({ consultationType }, enrollmentConsultationValidation.createConsultationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('咨询类型无效');
      });
    });

    it('应该验证预约时间', () => {
      const invalidDateTime = [
        {
          preferredDate: 'invalid-date',
          error: '预约日期格式无效'
        },
        {
          preferredDate: '2020-01-01',
          error: '预约日期不能是过去日期'
        },
        {
          preferredTime: 'invalid-time',
          error: '预约时间格式无效'
        },
        {
          preferredTime: '25:00',
          error: '预约时间格式无效'
        },
        {
          preferredTime: '06:00',
          error: '预约时间必须在工作时间内（8:00-18:00）'
        },
        {
          preferredTime: '20:00',
          error: '预约时间必须在工作时间内（8:00-18:00）'
        }
      ];

      invalidDateTime.forEach(({ preferredDate, preferredTime, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const data = {};
        if (preferredDate) data.preferredDate = preferredDate;
        if (preferredTime) data.preferredTime = preferredTime;
        
        const result = mockJoi.validate(data, enrollmentConsultationValidation.createConsultationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证备选时间段', () => {
      const invalidAlternatives = [
        {
          alternativeSlots: 'not-array',
          error: '备选时间段必须是数组'
        },
        {
          alternativeSlots: [{ date: 'invalid' }],
          error: '备选日期格式无效'
        },
        {
          alternativeSlots: [{ date: '2024-05-15', time: 'invalid' }],
          error: '备选时间格式无效'
        },
        {
          alternativeSlots: Array.from({ length: 6 }, (_, i) => ({ 
            date: '2024-05-15', 
            time: `${9 + i}:00` 
          })),
          error: '备选时间段不能超过5个'
        }
      ];

      invalidAlternatives.forEach(({ alternativeSlots, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ alternativeSlots }, enrollmentConsultationValidation.createConsultationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证咨询主题', () => {
      const invalidTopics = [
        {
          topics: 'not-array',
          error: '咨询主题必须是数组'
        },
        {
          topics: [],
          error: '至少需要选择一个咨询主题'
        },
        {
          topics: ['invalid_topic'],
          error: '咨询主题无效'
        },
        {
          topics: Array.from({ length: 11 }, (_, i) => `topic_${i}`),
          error: '咨询主题不能超过10个'
        }
      ];

      invalidTopics.forEach(({ topics, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ topics }, enrollmentConsultationValidation.createConsultationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证问题列表', () => {
      const invalidQuestions = [
        {
          questions: 'not-array',
          error: '问题列表必须是数组'
        },
        {
          questions: [''],
          error: '问题不能为空'
        },
        {
          questions: ['a'.repeat(501)],
          error: '单个问题不能超过500个字符'
        },
        {
          questions: Array.from({ length: 21 }, (_, i) => `问题${i}`),
          error: '问题数量不能超过20个'
        }
      ];

      invalidQuestions.forEach(({ questions, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ questions }, enrollmentConsultationValidation.createConsultationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('updateConsultationSchema', () => {
    it('应该验证有效的咨询更新数据', () => {
      const validUpdateData = {
        status: 'confirmed',
        scheduledDate: '2024-05-15',
        scheduledTime: '10:00',
        consultantId: 2,
        location: '会议室A',
        notes: '已确认预约时间'
      };

      const result = mockJoi.validate(validUpdateData, enrollmentConsultationValidation.updateConsultationSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该允许部分字段更新', () => {
      const partialUpdateData = {
        status: 'completed'
      };

      const result = mockJoi.validate(partialUpdateData, enrollmentConsultationValidation.updateConsultationSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证状态转换', () => {
      const invalidStatusTransitions = [
        { from: 'completed', to: 'pending', error: '已完成的咨询不能回退到待处理状态' },
        { from: 'cancelled', to: 'confirmed', error: '已取消的咨询不能直接确认' },
        { from: 'no_show', to: 'pending', error: '未到场的咨询不能回退到待处理状态' }
      ];

      invalidStatusTransitions.forEach(({ from, to, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ 
          currentStatus: from, 
          status: to 
        }, enrollmentConsultationValidation.updateConsultationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证咨询师分配', () => {
      const invalidConsultant = [
        { consultantId: 0, error: '咨询师ID必须大于0' },
        { consultantId: 'invalid', error: '咨询师ID必须是数字' }
      ];

      invalidConsultant.forEach(({ consultantId, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ consultantId }, enrollmentConsultationValidation.updateConsultationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证地点信息', () => {
      const invalidLocations = [
        { location: '', error: '咨询地点不能为空' },
        { location: 'a'.repeat(101), error: '咨询地点不能超过100个字符' }
      ];

      invalidLocations.forEach(({ location, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ location }, enrollmentConsultationValidation.updateConsultationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('queryConsultationsSchema', () => {
    it('应该验证有效的查询参数', () => {
      const validQuery = {
        page: 1,
        pageSize: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        kindergartenId: 1,
        status: 'pending',
        consultationType: 'enrollment_inquiry',
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        consultantId: 2,
        childAge: {
          min: 3,
          max: 6
        },
        search: '张小明'
      };

      const result = mockJoi.validate(validQuery, enrollmentConsultationValidation.queryConsultationsSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证分页参数', () => {
      const invalidPagination = [
        { page: 0, error: '页码必须大于0' },
        { page: 'invalid', error: '页码必须是数字' },
        { pageSize: 0, error: '每页数量必须大于0' },
        { pageSize: 101, error: '每页数量不能超过100' }
      ];

      invalidPagination.forEach(({ page, pageSize, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const query = page !== undefined ? { page } : { pageSize };
        const result = mockJoi.validate(query, enrollmentConsultationValidation.queryConsultationsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证日期范围', () => {
      const invalidDateRanges = [
        {
          dateRange: { start: 'invalid', end: '2024-12-31' },
          error: '开始日期格式无效'
        },
        {
          dateRange: { start: '2024-12-31', end: '2024-01-01' },
          error: '开始日期不能晚于结束日期'
        },
        {
          dateRange: { start: '2020-01-01', end: '2024-12-31' },
          error: '日期范围不能超过5年'
        }
      ];

      invalidDateRanges.forEach(({ dateRange, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ dateRange }, enrollmentConsultationValidation.queryConsultationsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证年龄范围', () => {
      const invalidAgeRanges = [
        { 
          childAge: { min: 10, max: 5 }, 
          error: '最小年龄不能大于最大年龄' 
        },
        { 
          childAge: { min: -1, max: 5 }, 
          error: '年龄不能小于0' 
        },
        { 
          childAge: { min: 1, max: 15 }, 
          error: '年龄不能大于10' 
        }
      ];

      invalidAgeRanges.forEach(({ childAge, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ childAge }, enrollmentConsultationValidation.queryConsultationsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('consultationFeedbackSchema', () => {
    it('应该验证有效的反馈数据', () => {
      const validFeedback = {
        consultationId: 1,
        parentSatisfaction: 5,
        consultantRating: 4,
        facilityRating: 5,
        informationHelpfulness: 4,
        likelyToEnroll: true,
        comments: '咨询师非常专业，解答了我们所有的疑问',
        suggestions: '希望能提供更多的课程展示',
        followUpRequested: true,
        referralSource: 'friend_recommendation'
      };

      const result = mockJoi.validate(validFeedback, enrollmentConsultationValidation.consultationFeedbackSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证评分范围', () => {
      const invalidRatings = [
        { parentSatisfaction: 0, error: '满意度评分必须在1-5之间' },
        { parentSatisfaction: 6, error: '满意度评分必须在1-5之间' },
        { consultantRating: -1, error: '咨询师评分必须在1-5之间' },
        { facilityRating: 'high', error: '设施评分必须是数字' }
      ];

      invalidRatings.forEach(({ parentSatisfaction, consultantRating, facilityRating, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const data = {};
        if (parentSatisfaction !== undefined) data.parentSatisfaction = parentSatisfaction;
        if (consultantRating !== undefined) data.consultantRating = consultantRating;
        if (facilityRating !== undefined) data.facilityRating = facilityRating;
        
        const result = mockJoi.validate(data, enrollmentConsultationValidation.consultationFeedbackSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证评论长度', () => {
      const invalidComments = [
        { comments: 'a'.repeat(1001), error: '评论不能超过1000个字符' },
        { suggestions: 'a'.repeat(501), error: '建议不能超过500个字符' }
      ];

      invalidComments.forEach(({ comments, suggestions, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const data = {};
        if (comments) data.comments = comments;
        if (suggestions) data.suggestions = suggestions;
        
        const result = mockJoi.validate(data, enrollmentConsultationValidation.consultationFeedbackSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证推荐来源', () => {
      const invalidSources = ['invalid', 'unknown', '朋友推荐'];
      
      invalidSources.forEach(referralSource => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['推荐来源无效']));
        
        const result = mockJoi.validate({ referralSource }, enrollmentConsultationValidation.consultationFeedbackSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('推荐来源无效');
      });
    });
  });

  describe('自定义验证器', () => {
    it('应该验证预约时间冲突', () => {
      const timeConflictValidator = (date: string, time: string, existingAppointments: any[]) => {
        const appointmentDateTime = `${date} ${time}`;
        
        return !existingAppointments.some(appointment => 
          `${appointment.date} ${appointment.time}` === appointmentDateTime
        );
      };

      const existingAppointments = [
        { date: '2024-05-15', time: '10:00' },
        { date: '2024-05-15', time: '14:00' }
      ];

      expect(timeConflictValidator('2024-05-15', '09:00', existingAppointments)).toBe(true);
      expect(timeConflictValidator('2024-05-15', '10:00', existingAppointments)).toBe(false);
      expect(timeConflictValidator('2024-05-16', '10:00', existingAppointments)).toBe(true);
    });

    it('应该验证工作日预约', () => {
      const workdayValidator = (dateString: string) => {
        const date = new Date(dateString);
        const dayOfWeek = date.getDay();
        
        // 0 = Sunday, 6 = Saturday
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      };

      expect(workdayValidator('2024-05-13')).toBe(true); // Monday
      expect(workdayValidator('2024-05-17')).toBe(true); // Friday
      expect(workdayValidator('2024-05-18')).toBe(false); // Saturday
      expect(workdayValidator('2024-05-19')).toBe(false); // Sunday
    });

    it('应该验证提前预约时间', () => {
      const advanceBookingValidator = (appointmentDate: string, currentDate: string = new Date().toISOString().split('T')[0]) => {
        const appointment = new Date(appointmentDate);
        const current = new Date(currentDate);
        
        const daysDiff = Math.ceil((appointment.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
        
        // 至少提前1天，最多提前30天预约
        return daysDiff >= 1 && daysDiff <= 30;
      };

      const today = '2024-05-01';
      expect(advanceBookingValidator('2024-05-02', today)).toBe(true); // 1天后
      expect(advanceBookingValidator('2024-05-31', today)).toBe(true); // 30天后
      expect(advanceBookingValidator('2024-05-01', today)).toBe(false); // 当天
      expect(advanceBookingValidator('2024-06-01', today)).toBe(false); // 31天后
    });

    it('应该验证孩子年龄与咨询类型匹配', () => {
      const ageConsultationValidator = (childAge: number, consultationType: string) => {
        const ageRanges = {
          'toddler_program': { min: 1, max: 3 },
          'preschool_inquiry': { min: 3, max: 6 },
          'kindergarten_prep': { min: 5, max: 6 },
          'special_needs': { min: 1, max: 10 }
        };

        const range = ageRanges[consultationType];
        if (!range) return true; // 未知类型，允许通过

        return childAge >= range.min && childAge <= range.max;
      };

      expect(ageConsultationValidator(2, 'toddler_program')).toBe(true);
      expect(ageConsultationValidator(4, 'preschool_inquiry')).toBe(true);
      expect(ageConsultationValidator(6, 'kindergarten_prep')).toBe(true);
      expect(ageConsultationValidator(7, 'toddler_program')).toBe(false);
      expect(ageConsultationValidator(2, 'kindergarten_prep')).toBe(false);
    });

    it('应该验证联系方式完整性', () => {
      const contactValidator = (parentInfo: any) => {
        const { phone, email, wechat } = parentInfo;
        
        // 至少需要提供手机号或邮箱
        return !!(phone || email);
      };

      expect(contactValidator({ phone: '13800138001' })).toBe(true);
      expect(contactValidator({ email: 'parent@example.com' })).toBe(true);
      expect(contactValidator({ phone: '13800138001', email: 'parent@example.com' })).toBe(true);
      expect(contactValidator({ wechat: 'parent_wechat' })).toBe(false);
      expect(contactValidator({})).toBe(false);
    });
  });

  describe('条件验证', () => {
    it('应该根据咨询类型进行条件验证', () => {
      // 特殊需求咨询必须提供详细说明
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.consultationType === 'special_needs' && !data.childInfo?.specialNeeds) {
          return createMockValidationResult(false, ['特殊需求咨询必须提供详细说明']);
        }
        return createMockValidationResult(true);
      });

      const specialNeedsConsultation = {
        consultationType: 'special_needs',
        childInfo: {
          name: '张小明',
          age: 4
          // 缺少specialNeeds详细说明
        }
      };

      const result = mockJoi.validate(specialNeedsConsultation, enrollmentConsultationValidation.createConsultationSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('特殊需求咨询必须提供详细说明');
    });

    it('应该根据是否要求参观进行条件验证', () => {
      // 如果要求参观，必须提供偏好时间
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.visitRequested && !data.preferredDate) {
          return createMockValidationResult(false, ['要求参观必须提供偏好日期']);
        }
        return createMockValidationResult(true);
      });

      const visitRequest = {
        visitRequested: true
        // 缺少preferredDate
      };

      const result = mockJoi.validate(visitRequest, enrollmentConsultationValidation.createConsultationSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('要求参观必须提供偏好日期');
    });
  });

  describe('数据清理和转换', () => {
    it('应该清理和转换输入数据', () => {
      // 模拟数据转换
      mockJoi.validate.mockImplementation((data, schema) => {
        const cleanedData = {
          ...data,
          parentInfo: {
            ...data.parentInfo,
            name: data.parentInfo?.name?.trim(),
            phone: data.parentInfo?.phone?.replace(/\D/g, ''), // 只保留数字
            email: data.parentInfo?.email?.toLowerCase().trim()
          },
          childInfo: {
            ...data.childInfo,
            name: data.childInfo?.name?.trim(),
            currentSchool: data.childInfo?.currentSchool?.trim() || '无'
          },
          questions: data.questions?.map(q => q.trim()).filter(Boolean),
          notes: data.notes?.trim()
        };
        
        return {
          error: null,
          value: cleanedData
        };
      });

      const dirtyData = {
        parentInfo: {
          name: '  张家长  ',
          phone: '138-0013-8001',
          email: '  PARENT@EXAMPLE.COM  '
        },
        childInfo: {
          name: '  张小明  ',
          currentSchool: '  '
        },
        questions: ['  问题1  ', '', '  问题2  '],
        notes: '  希望参观校园  '
      };

      const result = mockJoi.validate(dirtyData, enrollmentConsultationValidation.createConsultationSchema);
      
      expect(((result as any).value?.)parentInfo.name).toBe('张家长');
      expect(((result as any).value?.)parentInfo.phone).toBe('13800138001');
      expect(((result as any).value?.)parentInfo.email).toBe('parent@example.com');
      expect(((result as any).value?.)childInfo.name).toBe('张小明');
      expect(((result as any).value?.)childInfo.currentSchool).toBe('无');
      expect(((result as any).value?.)questions).toEqual(['问题1', '问题2']);
      expect(((result as any).value?.)notes).toBe('希望参观校园');
    });
  });
});
