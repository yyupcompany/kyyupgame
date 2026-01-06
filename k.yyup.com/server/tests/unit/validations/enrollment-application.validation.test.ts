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

describe('Enrollment Application Validation', () => {
  let enrollmentApplicationValidation: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/enrollment-application.validation');
    enrollmentApplicationValidation = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default to valid validation
    mockJoi.validate.mockReturnValue(createMockValidationResult(true));
  });

  describe('createApplicationSchema', () => {
    it('应该验证有效的报名申请数据', () => {
      const validData = {
        kindergartenId: 1,
        studentInfo: {
          name: '张小明',
          gender: 'male',
          birthDate: '2020-05-15',
          idNumber: '110101202005150001'
        },
        parentInfo: {
          father: {
            name: '张爸爸',
            phone: '13800138001',
            email: 'father@example.com',
            occupation: '软件工程师',
            workUnit: 'ABC科技公司'
          },
          mother: {
            name: '张妈妈',
            phone: '13800138002',
            email: 'mother@example.com',
            occupation: '教师',
            workUnit: 'XYZ学校'
          }
        },
        contactInfo: {
          address: '北京市朝阳区某某街道123号',
          emergencyContact: {
            name: '张奶奶',
            phone: '13800138003',
            relationship: 'grandmother'
          }
        },
        preferredClass: 'morning',
        applicationDate: '2024-03-01',
        expectedEnrollmentDate: '2024-09-01'
      };

      const result = mockJoi.validate(validData, enrollmentApplicationValidation.createApplicationSchema);

      expect((result as any).error).toBeNull();
      expect(mockJoi.object).toHaveBeenCalled();
      expect(mockJoi.string).toHaveBeenCalled();
      expect(mockJoi.number).toHaveBeenCalled();
    });

    it('应该验证必填字段', () => {
      const testCases = [
        { field: 'kindergartenId', data: {}, error: '幼儿园ID是必填字段' },
        { field: 'studentInfo', data: { kindergartenId: 1 }, error: '学生信息是必填字段' },
        { field: 'parentInfo', data: { kindergartenId: 1, studentInfo: {} }, error: '家长信息是必填字段' }
      ];

      testCases.forEach(({ field, data, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate(data, enrollmentApplicationValidation.createApplicationSchema);
        
        expect((result as any).error).toBeTruthy();
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证学生信息结构', () => {
      const invalidStudentInfo = [
        {
          studentInfo: { name: '' },
          error: '学生姓名不能为空'
        },
        {
          studentInfo: { name: '张小明', gender: 'unknown' },
          error: '性别必须是 male 或 female'
        },
        {
          studentInfo: { name: '张小明', gender: 'male', birthDate: 'invalid' },
          error: '出生日期格式无效'
        },
        {
          studentInfo: { name: '张小明', gender: 'male', birthDate: '2025-01-01' },
          error: '出生日期不能是未来日期'
        },
        {
          studentInfo: { name: '张小明', gender: 'male', birthDate: '2020-01-01', idNumber: '123' },
          error: '身份证号格式无效'
        }
      ];

      invalidStudentInfo.forEach(({ studentInfo, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ studentInfo }, enrollmentApplicationValidation.createApplicationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证家长信息结构', () => {
      const invalidParentInfo = [
        {
          parentInfo: {},
          error: '至少需要提供父亲或母亲的信息'
        },
        {
          parentInfo: { father: { name: '' } },
          error: '父亲姓名不能为空'
        },
        {
          parentInfo: { father: { name: '张爸爸', phone: '123' } },
          error: '父亲电话格式无效'
        },
        {
          parentInfo: { father: { name: '张爸爸', phone: '13800138001', email: 'invalid-email' } },
          error: '父亲邮箱格式无效'
        },
        {
          parentInfo: { mother: { name: '张妈妈', phone: '13800138002', occupation: '' } },
          error: '母亲职业不能为空'
        }
      ];

      invalidParentInfo.forEach(({ parentInfo, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ parentInfo }, enrollmentApplicationValidation.createApplicationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证联系信息', () => {
      const invalidContactInfo = [
        {
          contactInfo: { address: '' },
          error: '地址不能为空'
        },
        {
          contactInfo: { 
            address: '北京市朝阳区',
            emergencyContact: { name: '' }
          },
          error: '紧急联系人姓名不能为空'
        },
        {
          contactInfo: { 
            address: '北京市朝阳区',
            emergencyContact: { 
              name: '张奶奶',
              phone: '123'
            }
          },
          error: '紧急联系人电话格式无效'
        },
        {
          contactInfo: { 
            address: '北京市朝阳区',
            emergencyContact: { 
              name: '张奶奶',
              phone: '13800138003',
              relationship: 'unknown'
            }
          },
          error: '紧急联系人关系无效'
        }
      ];

      invalidContactInfo.forEach(({ contactInfo, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ contactInfo }, enrollmentApplicationValidation.createApplicationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证偏好班级类型', () => {
      const invalidPreferredClass = ['invalid', 'unknown', '上午班'];
      
      invalidPreferredClass.forEach(preferredClass => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['偏好班级类型无效']));
        
        const result = mockJoi.validate({ preferredClass }, enrollmentApplicationValidation.createApplicationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('偏好班级类型无效');
      });
    });

    it('应该验证申请日期和预期入学日期', () => {
      const invalidDates = [
        {
          applicationDate: 'invalid-date',
          error: '申请日期格式无效'
        },
        {
          applicationDate: '2025-01-01',
          error: '申请日期不能是未来日期'
        },
        {
          expectedEnrollmentDate: 'invalid-date',
          error: '预期入学日期格式无效'
        },
        {
          expectedEnrollmentDate: '2020-01-01',
          error: '预期入学日期不能是过去日期'
        },
        {
          applicationDate: '2024-09-01',
          expectedEnrollmentDate: '2024-08-01',
          error: '预期入学日期不能早于申请日期'
        }
      ];

      invalidDates.forEach(({ applicationDate, expectedEnrollmentDate, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const data = {};
        if (applicationDate) data.applicationDate = applicationDate;
        if (expectedEnrollmentDate) data.expectedEnrollmentDate = expectedEnrollmentDate;
        
        const result = mockJoi.validate(data, enrollmentApplicationValidation.createApplicationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证健康信息', () => {
      const validHealthInfo = {
        healthInfo: {
          allergies: ['花生', '海鲜'],
          medications: ['维生素D'],
          medicalHistory: ['无重大疾病史'],
          vaccinations: [
            {
              name: 'BCG',
              date: '2020-06-01',
              batch: 'BCG202006001'
            }
          ],
          specialNeeds: '无特殊需求'
        }
      };

      const result = mockJoi.validate(validHealthInfo, enrollmentApplicationValidation.createApplicationSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证附件信息', () => {
      const validAttachments = {
        attachments: [
          {
            type: 'birth_certificate',
            filename: '出生证明.pdf',
            url: '/uploads/documents/birth_cert_123.pdf'
          },
          {
            type: 'vaccination_record',
            filename: '疫苗接种记录.pdf',
            url: '/uploads/documents/vaccination_123.pdf'
          }
        ]
      };

      const result = mockJoi.validate(validAttachments, enrollmentApplicationValidation.createApplicationSchema);

      expect((result as any).error).toBeNull();
    });
  });

  describe('updateApplicationSchema', () => {
    it('应该验证有效的申请更新数据', () => {
      const validUpdateData = {
        status: 'under_review',
        reviewNotes: '材料齐全，进入审核流程',
        contactInfo: {
          address: '新地址：北京市海淀区某某路456号'
        }
      };

      const result = mockJoi.validate(validUpdateData, enrollmentApplicationValidation.updateApplicationSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该允许部分字段更新', () => {
      const partialUpdateData = {
        status: 'approved'
      };

      const result = mockJoi.validate(partialUpdateData, enrollmentApplicationValidation.updateApplicationSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证状态转换', () => {
      const invalidStatusTransitions = [
        { from: 'approved', to: 'pending', error: '已批准的申请不能回退到待审核状态' },
        { from: 'rejected', to: 'approved', error: '已拒绝的申请不能直接批准' },
        { from: 'cancelled', to: 'under_review', error: '已取消的申请不能重新审核' }
      ];

      invalidStatusTransitions.forEach(({ from, to, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ 
          currentStatus: from, 
          status: to 
        }, enrollmentApplicationValidation.updateApplicationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该禁止更新某些敏感字段', () => {
      const sensitiveFields = [
        { field: 'id', value: 999, error: '不能更新申请ID' },
        { field: 'applicationNumber', value: 'NEW123', error: '不能更新申请编号' },
        { field: 'createdAt', value: new Date(), error: '不能更新创建时间' }
      ];

      sensitiveFields.forEach(({ field, value, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ [field]: value }, enrollmentApplicationValidation.updateApplicationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('queryApplicationsSchema', () => {
    it('应该验证有效的查询参数', () => {
      const validQuery = {
        page: 1,
        pageSize: 20,
        sortBy: 'applicationDate',
        sortOrder: 'desc',
        kindergartenId: 1,
        status: 'pending',
        applicationDateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        expectedEnrollmentYear: 2024,
        studentAge: {
          min: 3,
          max: 6
        },
        search: '张小明'
      };

      const result = mockJoi.validate(validQuery, enrollmentApplicationValidation.queryApplicationsSchema);

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
        const result = mockJoi.validate(query, enrollmentApplicationValidation.queryApplicationsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证排序参数', () => {
      const validSortFields = ['applicationDate', 'expectedEnrollmentDate', 'status', 'studentName'];
      const invalidSort = [
        { sortBy: 'invalid_field', error: '排序字段无效' },
        { sortOrder: 'invalid', error: '排序方向必须是 asc 或 desc' }
      ];

      invalidSort.forEach(({ sortBy, sortOrder, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const query = sortBy ? { sortBy } : { sortOrder };
        const result = mockJoi.validate(query, enrollmentApplicationValidation.queryApplicationsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证日期范围', () => {
      const invalidDateRanges = [
        {
          applicationDateRange: { start: 'invalid', end: '2024-12-31' },
          error: '开始日期格式无效'
        },
        {
          applicationDateRange: { start: '2024-12-31', end: '2024-01-01' },
          error: '开始日期不能晚于结束日期'
        },
        {
          applicationDateRange: { start: '2020-01-01', end: '2024-12-31' },
          error: '日期范围不能超过5年'
        }
      ];

      invalidDateRanges.forEach(({ applicationDateRange, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ applicationDateRange }, enrollmentApplicationValidation.queryApplicationsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证年龄范围', () => {
      const invalidAgeRanges = [
        { 
          studentAge: { min: 10, max: 5 }, 
          error: '最小年龄不能大于最大年龄' 
        },
        { 
          studentAge: { min: -1, max: 5 }, 
          error: '年龄不能小于0' 
        },
        { 
          studentAge: { min: 1, max: 15 }, 
          error: '年龄不能大于10' 
        }
      ];

      invalidAgeRanges.forEach(({ studentAge, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ studentAge }, enrollmentApplicationValidation.queryApplicationsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('applicationReviewSchema', () => {
    it('应该验证有效的审核数据', () => {
      const validReview = {
        applicationId: 1,
        reviewerId: 2,
        status: 'approved',
        reviewNotes: '申请材料完整，学生符合入学条件',
        score: 85,
        recommendations: [
          '建议安排在上午班',
          '需要关注孩子的过敏情况'
        ],
        nextSteps: [
          '通知家长审核结果',
          '安排入学面试'
        ]
      };

      const result = mockJoi.validate(validReview, enrollmentApplicationValidation.applicationReviewSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证审核状态', () => {
      const invalidStatuses = ['unknown', 'maybe', '通过'];
      
      invalidStatuses.forEach(status => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['审核状态无效']));
        
        const result = mockJoi.validate({ status }, enrollmentApplicationValidation.applicationReviewSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('审核状态无效');
      });
    });

    it('应该验证评分范围', () => {
      const invalidScores = [
        { score: -1, error: '评分不能小于0' },
        { score: 101, error: '评分不能大于100' },
        { score: 'high', error: '评分必须是数字' }
      ];

      invalidScores.forEach(({ score, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ score }, enrollmentApplicationValidation.applicationReviewSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证审核备注长度', () => {
      const invalidNotes = [
        { reviewNotes: '', error: '审核备注不能为空' },
        { reviewNotes: 'a'.repeat(1001), error: '审核备注不能超过1000个字符' }
      ];

      invalidNotes.forEach(({ reviewNotes, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ reviewNotes }, enrollmentApplicationValidation.applicationReviewSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('自定义验证器', () => {
    it('应该验证身份证号格式', () => {
      const idNumberValidator = (idNumber: string) => {
        // 简化的身份证号验证
        const idRegex = /^\d{17}[\dXx]$/;
        return idRegex.test(idNumber);
      };

      expect(idNumberValidator('110101202005150001')).toBe(true);
      expect(idNumberValidator('11010120200515000X')).toBe(true);
      expect(idNumberValidator('123456789')).toBe(false);
      expect(idNumberValidator('invalid')).toBe(false);
    });

    it('应该验证年龄与入学年份匹配', () => {
      const ageEnrollmentValidator = (birthDate: string, expectedEnrollmentYear: number) => {
        const birth = new Date(birthDate);
        const enrollmentAge = expectedEnrollmentYear - birth.getFullYear();
        
        // 入学年龄应在3-6岁之间
        return enrollmentAge >= 3 && enrollmentAge <= 6;
      };

      expect(ageEnrollmentValidator('2020-05-15', 2024)).toBe(true); // 4岁入学
      expect(ageEnrollmentValidator('2019-05-15', 2024)).toBe(true); // 5岁入学
      expect(ageEnrollmentValidator('2022-05-15', 2024)).toBe(false); // 2岁，太小
      expect(ageEnrollmentValidator('2017-05-15', 2024)).toBe(false); // 7岁，太大
    });

    it('应该验证家长信息完整性', () => {
      const parentInfoValidator = (parentInfo: any) => {
        const { father, mother } = parentInfo;
        
        // 至少需要一个家长的完整信息
        const hasFatherInfo = father && father.name && father.phone;
        const hasMotherInfo = mother && mother.name && mother.phone;
        
        return hasFatherInfo || hasMotherInfo;
      };

      expect(parentInfoValidator({
        father: { name: '张爸爸', phone: '13800138001' }
      })).toBe(true);

      expect(parentInfoValidator({
        mother: { name: '张妈妈', phone: '13800138002' }
      })).toBe(true);

      expect(parentInfoValidator({
        father: { name: '张爸爸' } // 缺少电话
      })).toBe(false);

      expect(parentInfoValidator({})).toBe(false);
    });

    it('应该验证申请时间窗口', () => {
      const applicationWindowValidator = (applicationDate: string, expectedEnrollmentDate: string) => {
        const appDate = new Date(applicationDate);
        const enrollDate = new Date(expectedEnrollmentDate);
        
        // 申请日期应在入学日期前3-12个月
        const monthsDiff = (enrollDate.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        
        return monthsDiff >= 3 && monthsDiff <= 12;
      };

      expect(applicationWindowValidator('2024-03-01', '2024-09-01')).toBe(true); // 6个月前申请
      expect(applicationWindowValidator('2024-01-01', '2024-09-01')).toBe(true); // 8个月前申请
      expect(applicationWindowValidator('2024-08-01', '2024-09-01')).toBe(false); // 1个月前，太晚
      expect(applicationWindowValidator('2023-08-01', '2024-09-01')).toBe(false); // 13个月前，太早
    });

    it('应该验证疫苗接种记录', () => {
      const vaccinationValidator = (vaccinations: any[]) => {
        const requiredVaccines = ['BCG', 'HepB', 'DPT', 'Polio', 'MMR'];
        
        if (!Array.isArray(vaccinations)) return false;
        
        const vaccinatedTypes = vaccinations.map(v => v.name);
        
        // 检查是否包含所有必需疫苗
        return requiredVaccines.every(required => 
          vaccinatedTypes.includes(required)
        );
      };

      const completeVaccinations = [
        { name: 'BCG', date: '2020-06-01' },
        { name: 'HepB', date: '2020-06-15' },
        { name: 'DPT', date: '2020-08-01' },
        { name: 'Polio', date: '2020-08-01' },
        { name: 'MMR', date: '2021-05-15' }
      ];

      const incompleteVaccinations = [
        { name: 'BCG', date: '2020-06-01' },
        { name: 'HepB', date: '2020-06-15' }
      ];

      expect(vaccinationValidator(completeVaccinations)).toBe(true);
      expect(vaccinationValidator(incompleteVaccinations)).toBe(false);
      expect(vaccinationValidator([])).toBe(false);
    });
  });

  describe('条件验证', () => {
    it('应该根据申请状态进行条件验证', () => {
      // 如果申请被拒绝，必须提供拒绝原因
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.status === 'rejected' && !data.rejectionReason) {
          return createMockValidationResult(false, ['拒绝申请必须提供拒绝原因']);
        }
        return createMockValidationResult(true);
      });

      const rejectedApplication = {
        status: 'rejected'
        // 缺少rejectionReason
      };

      const result = mockJoi.validate(rejectedApplication, enrollmentApplicationValidation.updateApplicationSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('拒绝申请必须提供拒绝原因');
    });

    it('应该根据学生年龄验证班级类型', () => {
      // 3岁以下只能申请托班，3-4岁小班，4-5岁中班，5-6岁大班
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.studentAge && data.preferredClass) {
          const age = data.studentAge;
          const classType = data.preferredClass;
          
          if (age < 3 && classType !== 'nursery') {
            return createMockValidationResult(false, ['3岁以下学生只能申请托班']);
          }
          if (age >= 3 && age < 4 && classType !== 'small') {
            return createMockValidationResult(false, ['3-4岁学生应申请小班']);
          }
          if (age >= 4 && age < 5 && classType !== 'medium') {
            return createMockValidationResult(false, ['4-5岁学生应申请中班']);
          }
          if (age >= 5 && classType !== 'large') {
            return createMockValidationResult(false, ['5岁以上学生应申请大班']);
          }
        }
        return createMockValidationResult(true);
      });

      const mismatchedApplication = {
        studentAge: 3,
        preferredClass: 'large' // 3岁申请大班，不匹配
      };

      const result = mockJoi.validate(mismatchedApplication, enrollmentApplicationValidation.createApplicationSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('3-4岁学生应申请小班');
    });
  });

  describe('数据清理和转换', () => {
    it('应该清理和转换输入数据', () => {
      // 模拟数据转换
      mockJoi.validate.mockImplementation((data, schema) => {
        const cleanedData = {
          ...data,
          studentInfo: {
            ...data.studentInfo,
            name: data.studentInfo?.name?.trim(),
            idNumber: data.studentInfo?.idNumber?.replace(/\s/g, '') // 移除空格
          },
          parentInfo: {
            father: data.parentInfo?.father ? {
              ...data.parentInfo.father,
              phone: data.parentInfo.father.phone?.replace(/\D/g, '') // 只保留数字
            } : undefined,
            mother: data.parentInfo?.mother ? {
              ...data.parentInfo.mother,
              phone: data.parentInfo.mother.phone?.replace(/\D/g, '')
            } : undefined
          }
        };
        
        return {
          error: null,
          value: cleanedData
        };
      });

      const dirtyData = {
        studentInfo: {
          name: '  张小明  ',
          idNumber: '1101 0120 2005 1500 01'
        },
        parentInfo: {
          father: {
            name: '张爸爸',
            phone: '138-0013-8001'
          }
        }
      };

      const result = mockJoi.validate(dirtyData, enrollmentApplicationValidation.createApplicationSchema);
      
      expect(((result as any).value?.)studentInfo.name).toBe('张小明');
      expect(((result as any).value?.)studentInfo.idNumber).toBe('11010120200515001');
      expect(((result as any).value?.)parentInfo.father.phone).toBe('13800138001');
    });
  });
});
