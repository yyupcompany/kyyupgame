import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Joi
const mockJoi = {
  object: jest.fn().mockReturnThis(),
  string: jest.fn().mockReturnThis(),
  number: jest.fn().mockReturnThis(),
  boolean: jest.fn().mockReturnThis(),
  date: jest.fn().mockReturnThis(),
  array: jest.fn().mockReturnThis(),
  valid: jest.fn().mockReturnThis(),
  required: jest.fn().mockReturnThis(),
  optional: jest.fn().mockReturnThis(),
  min: jest.fn().mockReturnThis(),
  max: jest.fn().mockReturnThis(),
  email: jest.fn().mockReturnThis(),
  pattern: jest.fn().mockReturnThis(),
  items: jest.fn().mockReturnThis(),
  messages: jest.fn().mockReturnThis(),
  validate: jest.fn(),
  allow: jest.fn().mockReturnThis(),
  when: jest.fn().mockReturnThis(),
  alternatives: jest.fn().mockReturnThis(),
  custom: jest.fn().mockReturnThis()
};

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

describe('Teacher Validation', () => {
  let teacherValidation: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/teacher.validation');
    teacherValidation = imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的Joi行为
    mockJoi.validate.mockImplementation((data, schema) => {
      // 模拟验证成功
      return { error: null, value: data };
    });
  });

  describe('validateCreateTeacher', () => {
    it('应该验证有效的教师创建数据', () => {
      const validData = {
        name: '张老师',
        email: 'zhang@example.com',
        phone: '13800138000',
        gender: 'female',
        birthDate: '1990-05-15',
        idCard: '110101199005151234',
        address: '北京市朝阳区',
        education: 'bachelor',
        major: '学前教育',
        graduationYear: 2012,
        teachingExperience: 8,
        specialties: ['音乐', '美术'],
        certifications: [
          {
            name: '教师资格证',
            number: 'CERT123456',
            issueDate: '2012-07-01',
            expiryDate: '2025-07-01'
          }
        ],
        emergencyContact: {
          name: '张父',
          phone: '13800138001',
          relationship: 'father'
        },
        kindergartenId: 1
      };

      const result = teacherValidation.validateCreateTeacher(validData);

      expect(mockJoi.validate).toHaveBeenCalledWith(validData, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该拒绝缺少必填字段的数据', () => {
      const invalidData = {
        email: 'zhang@example.com',
        phone: '13800138000'
        // 缺少name字段
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"name" is required',
              path: ['name'],
              type: 'any.required'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateCreateTeacher(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"name" is required');
    });

    it('应该验证邮箱格式', () => {
      const invalidData = {
        name: '张老师',
        email: 'invalid-email',
        phone: '13800138000'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"email" must be a valid email',
              path: ['email'],
              type: 'string.email'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateCreateTeacher(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"email" must be a valid email');
    });

    it('应该验证手机号格式', () => {
      const invalidData = {
        name: '张老师',
        email: 'zhang@example.com',
        phone: '123' // 无效手机号
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"phone" must match the required pattern',
              path: ['phone'],
              type: 'string.pattern.base'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateCreateTeacher(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"phone" must match the required pattern');
    });

    it('应该验证性别枚举值', () => {
      const invalidData = {
        name: '张老师',
        email: 'zhang@example.com',
        phone: '13800138000',
        gender: 'unknown' // 无效性别
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"gender" must be one of [male, female]',
              path: ['gender'],
              type: 'any.only'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateCreateTeacher(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"gender" must be one of [male, female]');
    });

    it('应该验证身份证号格式', () => {
      const invalidData = {
        name: '张老师',
        email: 'zhang@example.com',
        phone: '13800138000',
        idCard: '123456' // 无效身份证号
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"idCard" must match the required pattern',
              path: ['idCard'],
              type: 'string.pattern.base'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateCreateTeacher(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"idCard" must match the required pattern');
    });

    it('应该验证教学经验年限范围', () => {
      const invalidData = {
        name: '张老师',
        email: 'zhang@example.com',
        phone: '13800138000',
        teachingExperience: -1 // 无效经验年限
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"teachingExperience" must be greater than or equal to 0',
              path: ['teachingExperience'],
              type: 'number.min'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateCreateTeacher(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"teachingExperience" must be greater than or equal to 0');
    });

    it('应该验证专业特长数组', () => {
      const invalidData = {
        name: '张老师',
        email: 'zhang@example.com',
        phone: '13800138000',
        specialties: 'music' // 应该是数组
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"specialties" must be an array',
              path: ['specialties'],
              type: 'array.base'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateCreateTeacher(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"specialties" must be an array');
    });

    it('应该验证证书信息结构', () => {
      const invalidData = {
        name: '张老师',
        email: 'zhang@example.com',
        phone: '13800138000',
        certifications: [
          {
            name: '教师资格证'
            // 缺少number字段
          }
        ]
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"certifications[0].number" is required',
              path: ['certifications', 0, 'number'],
              type: 'any.required'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateCreateTeacher(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"certifications[0].number" is required');
    });

    it('应该验证紧急联系人信息', () => {
      const invalidData = {
        name: '张老师',
        email: 'zhang@example.com',
        phone: '13800138000',
        emergencyContact: {
          name: '张父'
          // 缺少phone字段
        }
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"emergencyContact.phone" is required',
              path: ['emergencyContact', 'phone'],
              type: 'any.required'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateCreateTeacher(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"emergencyContact.phone" is required');
    });
  });

  describe('validateUpdateTeacher', () => {
    it('应该验证有效的教师更新数据', () => {
      const validData = {
        name: '张老师（更新）',
        phone: '13800138001',
        address: '北京市海淀区',
        teachingExperience: 9,
        specialties: ['音乐', '美术', '体育']
      };

      const result = teacherValidation.validateUpdateTeacher(validData);

      expect(mockJoi.validate).toHaveBeenCalledWith(validData, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该允许部分字段更新', () => {
      const validData = {
        phone: '13800138002'
      };

      const result = teacherValidation.validateUpdateTeacher(validData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该拒绝更新不可变字段', () => {
      const invalidData = {
        idCard: '110101199005151235' // 身份证号不应该被更新
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"idCard" is not allowed',
              path: ['idCard'],
              type: 'object.unknown'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateUpdateTeacher(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"idCard" is not allowed');
    });
  });

  describe('validateAssignToClass', () => {
    it('应该验证有效的班级分配数据', () => {
      const validData = {
        classId: 1,
        role: 'main',
        subject: '综合',
        startDate: '2024-09-01',
        endDate: '2025-06-30'
      };

      const result = teacherValidation.validateAssignToClass(validData);

      expect(mockJoi.validate).toHaveBeenCalledWith(validData, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该验证角色枚举值', () => {
      const invalidData = {
        classId: 1,
        role: 'invalid_role' // 无效角色
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"role" must be one of [main, assistant, substitute]',
              path: ['role'],
              type: 'any.only'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateAssignToClass(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"role" must be one of [main, assistant, substitute]');
    });

    it('应该验证日期格式', () => {
      const invalidData = {
        classId: 1,
        role: 'main',
        startDate: 'invalid-date'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"startDate" must be a valid date',
              path: ['startDate'],
              type: 'date.base'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateAssignToClass(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"startDate" must be a valid date');
    });
  });

  describe('validateUpdateStatus', () => {
    it('应该验证有效的状态更新数据', () => {
      const validData = {
        status: 'inactive',
        reason: '请假'
      };

      const result = teacherValidation.validateUpdateStatus(validData);

      expect(mockJoi.validate).toHaveBeenCalledWith(validData, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该验证状态枚举值', () => {
      const invalidData = {
        status: 'unknown_status'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"status" must be one of [active, inactive, suspended, terminated]',
              path: ['status'],
              type: 'any.only'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateUpdateStatus(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"status" must be one of [active, inactive, suspended, terminated]');
    });

    it('应该在某些状态下要求原因', () => {
      const invalidData = {
        status: 'suspended'
        // 缺少reason字段
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"reason" is required when status is suspended',
              path: ['reason'],
              type: 'any.required'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateUpdateStatus(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"reason" is required when status is suspended');
    });
  });

  describe('validateTeacherQuery', () => {
    it('应该验证有效的查询参数', () => {
      const validQuery = {
        page: 1,
        pageSize: 10,
        status: 'active',
        gender: 'female',
        kindergartenId: 1,
        classId: 2,
        search: '张老师',
        sortBy: 'name',
        sortOrder: 'asc'
      };

      const result = teacherValidation.validateTeacherQuery(validQuery);

      expect(mockJoi.validate).toHaveBeenCalledWith(validQuery, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validQuery);
    });

    it('应该验证分页参数范围', () => {
      const invalidQuery = {
        page: 0, // 无效页码
        pageSize: 101 // 超出最大限制
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"page" must be greater than or equal to 1',
              path: ['page'],
              type: 'number.min'
            }
          ]
        },
        value: invalidQuery
      });

      const result = teacherValidation.validateTeacherQuery(invalidQuery);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"page" must be greater than or equal to 1');
    });

    it('应该验证排序字段', () => {
      const invalidQuery = {
        sortBy: 'invalid_field'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"sortBy" must be one of [name, email, phone, createdAt, updatedAt]',
              path: ['sortBy'],
              type: 'any.only'
            }
          ]
        },
        value: invalidQuery
      });

      const result = teacherValidation.validateTeacherQuery(invalidQuery);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"sortBy" must be one of [name, email, phone, createdAt, updatedAt]');
    });

    it('应该验证排序顺序', () => {
      const invalidQuery = {
        sortOrder: 'invalid_order'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"sortOrder" must be one of [asc, desc]',
              path: ['sortOrder'],
              type: 'any.only'
            }
          ]
        },
        value: invalidQuery
      });

      const result = teacherValidation.validateTeacherQuery(invalidQuery);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"sortOrder" must be one of [asc, desc]');
    });
  });

  describe('validateAddCertification', () => {
    it('应该验证有效的证书添加数据', () => {
      const validData = {
        name: '普通话等级证书',
        number: 'PTH123456',
        issueDate: '2020-06-15',
        expiryDate: '2025-06-15',
        issuingAuthority: '教育部',
        level: '二级甲等'
      };

      const result = teacherValidation.validateAddCertification(validData);

      expect(mockJoi.validate).toHaveBeenCalledWith(validData, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该验证证书编号唯一性', () => {
      const invalidData = {
        name: '教师资格证',
        number: '' // 空编号
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"number" is not allowed to be empty',
              path: ['number'],
              type: 'string.empty'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateAddCertification(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"number" is not allowed to be empty');
    });

    it('应该验证日期逻辑关系', () => {
      const invalidData = {
        name: '教师资格证',
        number: 'CERT123456',
        issueDate: '2025-01-01',
        expiryDate: '2024-01-01' // 过期日期早于颁发日期
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"expiryDate" must be greater than "issueDate"',
              path: ['expiryDate'],
              type: 'date.greater'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateAddCertification(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"expiryDate" must be greater than "issueDate"');
    });
  });

  describe('validateTeacherId', () => {
    it('应该验证有效的教师ID', () => {
      const validId = '123';

      const result = teacherValidation.validateTeacherId(validId);

      expect(mockJoi.validate).toHaveBeenCalledWith(validId, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toBe(validId);
    });

    it('应该拒绝无效的教师ID', () => {
      const invalidId = 'abc';

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"value" must be a number',
              path: [],
              type: 'number.base'
            }
          ]
        },
        value: invalidId
      });

      const result = teacherValidation.validateTeacherId(invalidId);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"value" must be a number');
    });
  });

  describe('自定义验证规则', () => {
    it('应该验证年龄计算', () => {
      const validData = {
        name: '张老师',
        email: 'zhang@example.com',
        phone: '13800138000',
        birthDate: '1990-05-15' // 应该计算出合理的年龄
      };

      // 模拟自定义验证通过
      mockJoi.validate.mockImplementation((data, schema) => {
        const age = new Date().getFullYear() - new Date(data.birthDate).getFullYear();
        if (age < 18 || age > 65) {
          return {
            error: {
              details: [
                {
                  message: 'Teacher age must be between 18 and 65',
                  path: ['birthDate'],
                  type: 'custom.ageRange'
                }
              ]
            },
            value: data
          };
        }
        return { error: null, value: data };
      });

      const result = teacherValidation.validateCreateTeacher(validData);

      expect((result as any).error).toBeNull();
    });

    it('应该验证毕业年份合理性', () => {
      const invalidData = {
        name: '张老师',
        email: 'zhang@example.com',
        phone: '13800138000',
        birthDate: '1990-05-15',
        graduationYear: 2030 // 未来年份
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: 'Graduation year cannot be in the future',
              path: ['graduationYear'],
              type: 'custom.futureYear'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateCreateTeacher(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('Graduation year cannot be in the future');
    });

    it('应该验证教学经验与毕业年份的一致性', () => {
      const invalidData = {
        name: '张老师',
        email: 'zhang@example.com',
        phone: '13800138000',
        graduationYear: 2020,
        teachingExperience: 10 // 经验年限超过毕业年限
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: 'Teaching experience cannot exceed years since graduation',
              path: ['teachingExperience'],
              type: 'custom.experienceConsistency'
            }
          ]
        },
        value: invalidData
      });

      const result = teacherValidation.validateCreateTeacher(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('Teaching experience cannot exceed years since graduation');
    });
  });
});
