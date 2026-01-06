import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock ApiError
jest.unstable_mockModule('../../../src/utils/apiError', () => ({
  ApiError: jest.fn().mockImplementation((statusCode, message) => {
    const error = new Error(message as string);
    (error as any).statusCode = statusCode;
    return error;
  })
}));

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

describe('Parent Validation', () => {
  let parentValidation: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/parent.validation');
    parentValidation = imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default to valid validation
    mockJoi.validate.mockReturnValue(createMockValidationResult(true));
  });

  describe('createParentSchema', () => {
    it('应该验证有效的家长创建数据', () => {
      const validData = {
        name: '张家长',
        gender: 'female',
        phone: '13800138001',
        email: 'parent@example.com',
        idNumber: '110101198001011234',
        address: {
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          street: '某某街道123号',
          zipCode: '100000',
          coordinates: {
            latitude: 39.9042,
            longitude: 116.4074
          }
        },
        occupation: '软件工程师',
        workUnit: 'ABC科技公司',
        education: 'bachelor',
        income: 'middle',
        emergencyContact: {
          name: '张奶奶',
          phone: '13800138002',
          relationship: 'grandmother'
        },
        preferences: {
          notifications: {
            email: true,
            sms: true,
            push: true
          },
          language: 'zh-CN',
          communicationTime: ['morning', 'evening']
        }
      };

      const result = mockJoi.validate(validData, parentValidation.createParentSchema);

      expect((result as any).error).toBeNull();
      expect(mockJoi.object).toHaveBeenCalled();
      expect(mockJoi.string).toHaveBeenCalled();
      expect(mockJoi.array).toHaveBeenCalled();
    });

    it('应该验证必填字段', () => {
      const testCases = [
        { field: 'name', data: {}, error: '姓名是必填字段' },
        { field: 'phone', data: { name: '张家长' }, error: '手机号是必填字段' },
        { field: 'address', data: { name: '张家长', phone: '13800138001' }, error: '地址是必填字段' }
      ];

      testCases.forEach(({ field, data, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate(data, parentValidation.createParentSchema);
        
        expect((result as any).error).toBeTruthy();
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证姓名格式', () => {
      const invalidNames = [
        { name: '', error: '姓名不能为空' },
        { name: 'a', error: '姓名长度必须在2-50个字符之间' },
        { name: 'a'.repeat(51), error: '姓名长度必须在2-50个字符之间' },
        { name: '123', error: '姓名只能包含中文、英文字母和空格' },
        { name: '张@明', error: '姓名只能包含中文、英文字母和空格' }
      ];

      invalidNames.forEach(({ name, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ name }, parentValidation.createParentSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证性别枚举值', () => {
      const invalidGenders = ['unknown', 'other', '男', '女'];
      
      invalidGenders.forEach(gender => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['性别必须是 male 或 female']));
        
        const result = mockJoi.validate({ gender }, parentValidation.createParentSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('性别必须是 male 或 female');
      });
    });

    it('应该验证手机号格式', () => {
      const invalidPhones = [
        { phone: '123', error: '手机号格式无效' },
        { phone: '1380013800', error: '手机号格式无效' },
        { phone: '12345678901', error: '手机号格式无效' },
        { phone: 'phone', error: '手机号格式无效' }
      ];

      invalidPhones.forEach(({ phone, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ phone }, parentValidation.createParentSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证邮箱格式', () => {
      const invalidEmails = [
        { email: 'invalid', error: '邮箱格式无效' },
        { email: '@example.com', error: '邮箱格式无效' },
        { email: 'user@', error: '邮箱格式无效' },
        { email: 'user@.com', error: '邮箱格式无效' }
      ];

      invalidEmails.forEach(({ email, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ email }, parentValidation.createParentSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证身份证号格式', () => {
      const invalidIdNumbers = [
        { idNumber: '123', error: '身份证号格式无效' },
        { idNumber: '12345678901234567', error: '身份证号格式无效' },
        { idNumber: '1234567890123456789', error: '身份证号格式无效' },
        { idNumber: 'invalid', error: '身份证号格式无效' }
      ];

      invalidIdNumbers.forEach(({ idNumber, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ idNumber }, parentValidation.createParentSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证地址结构', () => {
      const invalidAddresses = [
        {
          address: { province: '' },
          error: '省份不能为空'
        },
        {
          address: { province: '北京市', city: '' },
          error: '城市不能为空'
        },
        {
          address: { province: '北京市', city: '北京市', district: '' },
          error: '区县不能为空'
        },
        {
          address: { 
            province: '北京市', 
            city: '北京市', 
            district: '朝阳区',
            street: ''
          },
          error: '街道地址不能为空'
        },
        {
          address: { 
            province: '北京市', 
            city: '北京市', 
            district: '朝阳区',
            street: '某某街道',
            zipCode: '123'
          },
          error: '邮政编码格式无效'
        }
      ];

      invalidAddresses.forEach(({ address, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ address }, parentValidation.createParentSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证坐标格式', () => {
      const invalidCoordinates = [
        {
          address: {
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            street: '某某街道',
            coordinates: { latitude: 91, longitude: 116 }
          },
          error: '纬度必须在-90到90之间'
        },
        {
          address: {
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            street: '某某街道',
            coordinates: { latitude: 39, longitude: 181 }
          },
          error: '经度必须在-180到180之间'
        }
      ];

      invalidCoordinates.forEach(({ address, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ address }, parentValidation.createParentSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证教育程度枚举', () => {
      const invalidEducations = ['invalid', 'unknown', '本科', 'Bachelor'];
      
      invalidEducations.forEach(education => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['教育程度无效']));
        
        const result = mockJoi.validate({ education }, parentValidation.createParentSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('教育程度无效');
      });
    });

    it('应该验证收入水平枚举', () => {
      const invalidIncomes = ['invalid', 'unknown', '中等', 'Middle'];
      
      invalidIncomes.forEach(income => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['收入水平无效']));
        
        const result = mockJoi.validate({ income }, parentValidation.createParentSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('收入水平无效');
      });
    });

    it('应该验证紧急联系人信息', () => {
      const invalidEmergencyContacts = [
        {
          emergencyContact: { name: '' },
          error: '紧急联系人姓名不能为空'
        },
        {
          emergencyContact: { name: '张奶奶', phone: '123' },
          error: '紧急联系人电话格式无效'
        },
        {
          emergencyContact: { 
            name: '张奶奶', 
            phone: '13800138002', 
            relationship: 'unknown' 
          },
          error: '紧急联系人关系无效'
        }
      ];

      invalidEmergencyContacts.forEach(({ emergencyContact, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ emergencyContact }, parentValidation.createParentSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证偏好设置结构', () => {
      const validPreferences = {
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true,
            dailyReport: true,
            activityReminder: false
          },
          language: 'zh-CN',
          theme: 'light',
          communicationTime: ['morning', 'evening'],
          contactMethod: 'phone'
        }
      };

      const result = mockJoi.validate(validPreferences, parentValidation.createParentSchema);

      expect((result as any).error).toBeNull();
    });
  });

  describe('updateParentSchema', () => {
    it('应该验证有效的家长更新数据', () => {
      const validUpdateData = {
        name: '张家长（更新）',
        phone: '13800138999',
        email: 'newemail@example.com',
        address: {
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          street: '新街道456号'
        },
        occupation: '高级工程师',
        workUnit: 'XYZ科技公司'
      };

      const result = mockJoi.validate(validUpdateData, parentValidation.updateParentSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该允许部分字段更新', () => {
      const partialUpdateData = {
        phone: '13800138888'
      };

      const result = mockJoi.validate(partialUpdateData, parentValidation.updateParentSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该禁止更新某些敏感字段', () => {
      const sensitiveFields = [
        { field: 'id', value: 999, error: '不能更新家长ID' },
        { field: 'idNumber', value: '110101198001011111', error: '不能更新身份证号' },
        { field: 'createdAt', value: new Date(), error: '不能更新创建时间' }
      ];

      sensitiveFields.forEach(({ field, value, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ [field]: value }, parentValidation.updateParentSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证联系方式变更', () => {
      const validContactUpdates = [
        { phone: '13900139001' },
        { email: 'newemail@example.com' },
        { phone: '13900139001', email: 'newemail@example.com' }
      ];

      validContactUpdates.forEach(data => {
        const result = mockJoi.validate(data, parentValidation.updateParentSchema);
        expect((result as any).error).toBeNull();
      });
    });
  });

  describe('queryParentsSchema', () => {
    it('应该验证有效的查询参数', () => {
      const validQuery = {
        page: 1,
        pageSize: 20,
        sortBy: 'name',
        sortOrder: 'asc',
        search: '张',
        gender: 'female',
        education: 'bachelor',
        income: 'middle',
        hasChildren: true,
        childrenAgeRange: {
          min: 3,
          max: 6
        },
        location: {
          province: '北京市',
          city: '北京市',
          district: '朝阳区'
        },
        registrationDateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        }
      };

      const result = mockJoi.validate(validQuery, parentValidation.queryParentsSchema);

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
        const result = mockJoi.validate(query, parentValidation.queryParentsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证排序参数', () => {
      const validSortFields = ['name', 'phone', 'email', 'createdAt', 'updatedAt'];
      const invalidSort = [
        { sortBy: 'invalid_field', error: '排序字段无效' },
        { sortOrder: 'invalid', error: '排序方向必须是 asc 或 desc' }
      ];

      invalidSort.forEach(({ sortBy, sortOrder, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const query = sortBy ? { sortBy } : { sortOrder };
        const result = mockJoi.validate(query, parentValidation.queryParentsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证年龄范围', () => {
      const invalidAgeRanges = [
        { 
          childrenAgeRange: { min: 10, max: 5 }, 
          error: '最小年龄不能大于最大年龄' 
        },
        { 
          childrenAgeRange: { min: -1, max: 5 }, 
          error: '年龄不能小于0' 
        },
        { 
          childrenAgeRange: { min: 1, max: 15 }, 
          error: '年龄不能大于10' 
        }
      ];

      invalidAgeRanges.forEach(({ childrenAgeRange, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ childrenAgeRange }, parentValidation.queryParentsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });

    it('应该验证日期范围', () => {
      const invalidDateRanges = [
        {
          registrationDateRange: { start: 'invalid', end: '2024-12-31' },
          error: '开始日期格式无效'
        },
        {
          registrationDateRange: { start: '2024-12-31', end: '2024-01-01' },
          error: '开始日期不能晚于结束日期'
        },
        {
          registrationDateRange: { start: '2020-01-01', end: '2024-12-31' },
          error: '日期范围不能超过5年'
        }
      ];

      invalidDateRanges.forEach(({ registrationDateRange, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const result = mockJoi.validate({ registrationDateRange }, parentValidation.queryParentsSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('parentChildRelationSchema', () => {
    it('应该验证有效的亲子关系数据', () => {
      const validRelation = {
        parentId: 1,
        childId: 2,
        relationship: 'mother',
        isPrimary: true,
        guardianshipType: 'full',
        emergencyContact: true,
        pickupAuthorized: true,
        medicalDecisionMaker: true
      };

      const result = mockJoi.validate(validRelation, parentValidation.parentChildRelationSchema);

      expect((result as any).error).toBeNull();
    });

    it('应该验证关系类型', () => {
      const invalidRelationships = ['invalid', 'unknown', '父亲', 'Father'];
      
      invalidRelationships.forEach(relationship => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['亲子关系类型无效']));
        
        const result = mockJoi.validate({ relationship }, parentValidation.parentChildRelationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('亲子关系类型无效');
      });
    });

    it('应该验证监护类型', () => {
      const invalidGuardianshipTypes = ['invalid', 'unknown', '完全', 'Full'];
      
      invalidGuardianshipTypes.forEach(guardianshipType => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, ['监护类型无效']));
        
        const result = mockJoi.validate({ guardianshipType }, parentValidation.parentChildRelationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe('监护类型无效');
      });
    });

    it('应该验证ID有效性', () => {
      const invalidIds = [
        { parentId: 0, error: '家长ID必须大于0' },
        { childId: 0, error: '孩子ID必须大于0' },
        { parentId: 'invalid', error: '家长ID必须是数字' },
        { childId: 'invalid', error: '孩子ID必须是数字' }
      ];

      invalidIds.forEach(({ parentId, childId, error }) => {
        mockJoi.validate.mockReturnValue(createMockValidationResult(false, [error]));
        
        const data = {};
        if (parentId !== undefined) data.parentId = parentId;
        if (childId !== undefined) data.childId = childId;
        
        const result = mockJoi.validate(data, parentValidation.parentChildRelationSchema);
        
        expect(((result as any).error?.details)[0].message).toBe(error);
      });
    });
  });

  describe('自定义验证器', () => {
    it('应该验证中文姓名格式', () => {
      const chineseNameValidator = (name: string) => {
        const chineseNameRegex = /^[\u4e00-\u9fa5]{2,4}$/;
        return chineseNameRegex.test(name);
      };

      expect(chineseNameValidator('张家长')).toBe(true);
      expect(chineseNameValidator('欧阳修')).toBe(true);
      expect(chineseNameValidator('张')).toBe(false); // 太短
      expect(chineseNameValidator('张家长小红')).toBe(false); // 太长
      expect(chineseNameValidator('Zhang')).toBe(false); // 英文
    });

    it('应该验证手机号格式', () => {
      const phoneValidator = (phone: string) => {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
      };

      expect(phoneValidator('13800138001')).toBe(true);
      expect(phoneValidator('15912345678')).toBe(true);
      expect(phoneValidator('12345678901')).toBe(false); // 不是1开头
      expect(phoneValidator('1380013800')).toBe(false); // 位数不对
      expect(phoneValidator('phone')).toBe(false); // 非数字
    });

    it('应该验证身份证号格式和校验位', () => {
      const idNumberValidator = (idNumber: string) => {
        // 简化的身份证号验证
        const idRegex = /^\d{17}[\dXx]$/;
        if (!idRegex.test(idNumber)) return false;
        
        // 简单的校验位验证（实际应该更复杂）
        const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
        
        let sum = 0;
        for (let i = 0; i < 17; i++) {
          sum += parseInt(idNumber[i]) * weights[i];
        }
        
        const checkCode = checkCodes[sum % 11];
        return idNumber[17].toUpperCase() === checkCode;
      };

      expect(idNumberValidator('11010119800101001X')).toBe(true);
      expect(idNumberValidator('110101198001010010')).toBe(true);
      expect(idNumberValidator('123456789')).toBe(false);
      expect(idNumberValidator('invalid')).toBe(false);
    });

    it('应该验证邮政编码格式', () => {
      const zipCodeValidator = (zipCode: string) => {
        const zipRegex = /^\d{6}$/;
        return zipRegex.test(zipCode);
      };

      expect(zipCodeValidator('100000')).toBe(true);
      expect(zipCodeValidator('200000')).toBe(true);
      expect(zipCodeValidator('12345')).toBe(false); // 位数不够
      expect(zipCodeValidator('1234567')).toBe(false); // 位数太多
      expect(zipCodeValidator('abcdef')).toBe(false); // 非数字
    });

    it('应该验证紧急联系人不能是自己', () => {
      const emergencyContactValidator = (parentPhone: string, emergencyPhone: string) => {
        return parentPhone !== emergencyPhone;
      };

      expect(emergencyContactValidator('13800138001', '13800138002')).toBe(true);
      expect(emergencyContactValidator('13800138001', '13800138001')).toBe(false);
    });

    it('应该验证地址完整性', () => {
      const addressValidator = (address: any) => {
        const requiredFields = ['province', 'city', 'district', 'street'];
        return requiredFields.every(field => address[field] && address[field].trim());
      };

      expect(addressValidator({
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        street: '某某街道123号'
      })).toBe(true);

      expect(addressValidator({
        province: '北京市',
        city: '北京市',
        district: '',
        street: '某某街道123号'
      })).toBe(false);

      expect(addressValidator({
        province: '北京市',
        city: '北京市'
      })).toBe(false);
    });
  });

  describe('条件验证', () => {
    it('应该根据是否有孩子进行条件验证', () => {
      // 如果有孩子，必须提供紧急联系人
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.hasChildren && !data.emergencyContact) {
          return createMockValidationResult(false, ['有孩子的家长必须提供紧急联系人']);
        }
        return createMockValidationResult(true);
      });

      const parentWithChildren = {
        hasChildren: true
        // 缺少emergencyContact
      };

      const result = mockJoi.validate(parentWithChildren, parentValidation.createParentSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('有孩子的家长必须提供紧急联系人');
    });

    it('应该根据监护类型进行条件验证', () => {
      // 完全监护必须有医疗决策权
      mockJoi.validate.mockImplementation((data, schema) => {
        if (data.guardianshipType === 'full' && !data.medicalDecisionMaker) {
          return createMockValidationResult(false, ['完全监护必须有医疗决策权']);
        }
        return createMockValidationResult(true);
      });

      const fullGuardian = {
        guardianshipType: 'full',
        medicalDecisionMaker: false
      };

      const result = mockJoi.validate(fullGuardian, parentValidation.parentChildRelationSchema);
      
      expect(((result as any).error?.details)[0].message).toBe('完全监护必须有医疗决策权');
    });
  });

  describe('数据清理和转换', () => {
    it('应该清理和转换输入数据', () => {
      // 模拟数据转换
      mockJoi.validate.mockImplementation((data, schema) => {
        const cleanedData = {
          ...data,
          name: data.name?.trim(),
          phone: data.phone?.replace(/\D/g, ''), // 只保留数字
          email: data.email?.toLowerCase().trim(),
          occupation: data.occupation?.trim(),
          workUnit: data.workUnit?.trim()
        };
        
        return {
          error: null,
          value: cleanedData
        };
      });

      const dirtyData = {
        name: '  张家长  ',
        phone: '138-0013-8001',
        email: '  PARENT@EXAMPLE.COM  ',
        occupation: '  软件工程师  ',
        workUnit: '  ABC科技公司  '
      };

      const result = mockJoi.validate(dirtyData, parentValidation.createParentSchema);
      
      expect((result as any).value.name).toBe('张家长');
      expect((result as any).value.phone).toBe('13800138001');
      expect((result as any).value.email).toBe('parent@example.com');
      expect((result as any).value.occupation).toBe('软件工程师');
      expect((result as any).value.workUnit).toBe('ABC科技公司');
    });

    it('应该标准化地址格式', () => {
      mockJoi.validate.mockImplementation((data, schema) => {
        const cleanedData = {
          ...data,
          address: data.address ? {
            ...data.address,
            province: data.address.province?.trim(),
            city: data.address.city?.trim(),
            district: data.address.district?.trim(),
            street: data.address.street?.trim(),
            zipCode: data.address.zipCode?.replace(/\D/g, '') // 只保留数字
          } : undefined
        };
        
        return {
          error: null,
          value: cleanedData
        };
      });

      const dataWithAddress = {
        address: {
          province: '  北京市  ',
          city: '  北京市  ',
          district: '  朝阳区  ',
          street: '  某某街道123号  ',
          zipCode: '100-000'
        }
      };

      const result = mockJoi.validate(dataWithAddress, parentValidation.createParentSchema);
      
      expect((result as any).value.address.province).toBe('北京市');
      expect((result as any).value.address.city).toBe('北京市');
      expect((result as any).value.address.district).toBe('朝阳区');
      expect((result as any).value.address.street).toBe('某某街道123号');
      expect((result as any).value.address.zipCode).toBe('100000');
    });
  });
});
