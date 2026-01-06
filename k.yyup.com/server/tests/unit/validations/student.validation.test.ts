import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Joi
const mockJoi = {
  object: jest.fn(),
  string: jest.fn(),
  number: jest.fn(),
  boolean: jest.fn(),
  array: jest.fn(),
  date: jest.fn(),
  any: jest.fn(),
  valid: jest.fn(),
  required: jest.fn(),
  optional: jest.fn(),
  min: jest.fn(),
  max: jest.fn(),
  email: jest.fn(),
  pattern: jest.fn(),
  validate: jest.fn()
};

// Mock chain methods
const mockChain = {
  required: jest.fn().mockReturnThis(),
  optional: jest.fn().mockReturnThis(),
  min: jest.fn().mockReturnThis(),
  max: jest.fn().mockReturnThis(),
  email: jest.fn().mockReturnThis(),
  pattern: jest.fn().mockReturnThis(),
  valid: jest.fn().mockReturnThis(),
  messages: jest.fn().mockReturnThis(),
  iso: jest.fn().mockReturnThis(),
  items: jest.fn().mockReturnThis()
};

// Setup mock chain for all Joi methods
Object.keys(mockJoi).forEach(key => {
  if (typeof mockJoi[key] === 'function') {
    mockJoi[key].mockReturnValue(mockChain);
  }
});

// Mock imports
jest.unstable_mockModule('joi', () => mockJoi);

jest.unstable_mockModule('../../../src/utils/apiError', () => ({
  ApiError: jest.fn().mockImplementation((statusCode, message) => {
    const error = new Error(message as string);
    (error as any).statusCode = statusCode;
    return error;
  })
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

describe('Student Validation', () => {
  let studentValidation: any;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/student.validation');
    studentValidation = imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      params: {},
      query: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });

  describe('validateCreateStudent', () => {
    it('应该验证有效的学生创建数据', async () => {
      const validStudentData = {
        name: '小明',
        gender: 'male',
        birthDate: '2019-05-15',
        kindergartenId: 1,
        classId: 1,
        parentIds: [1, 2],
        allergies: ['花生', '海鲜'],
        medicalConditions: [],
        emergencyContact: '张三',
        emergencyPhone: '13800138000',
        address: '北京市朝阳区学生家园123号',
        notes: '活泼好动的孩子'
      };

      mockReq.body = validStudentData;
      
      // Mock successful validation
      mockJoi.validate.mockReturnValue({
        error: null,
        value: validStudentData
      });

      await studentValidation.validateCreateStudent(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validStudentData, expect.any(Object));
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝缺少必填字段的数据', async () => {
      const invalidStudentData = {
        gender: 'male',
        birthDate: '2019-05-15'
        // 缺少 name, kindergartenId
      };

      mockReq.body = invalidStudentData;
      
      // Mock validation error
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"name" is required',
              path: ['name'],
              type: 'any.required'
            },
            {
              message: '"kindergartenId" is required',
              path: ['kindergartenId'],
              type: 'any.required'
            }
          ]
        },
        value: invalidStudentData
      });

      await studentValidation.validateCreateStudent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('name'),
          statusCode: 400
        })
      );
    });

    it('应该验证学生姓名格式', async () => {
      const invalidStudentData = {
        name: 'A', // 太短
        gender: 'male',
        birthDate: '2019-05-15',
        kindergartenId: 1
      };

      mockReq.body = invalidStudentData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"name" length must be at least 2 characters long',
              path: ['name'],
              type: 'string.min'
            }
          ]
        },
        value: invalidStudentData
      });

      await studentValidation.validateCreateStudent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('name'),
          statusCode: 400
        })
      );
    });

    it('应该验证性别枚举值', async () => {
      const invalidStudentData = {
        name: '小明',
        gender: 'invalid', // 无效性别
        birthDate: '2019-05-15',
        kindergartenId: 1
      };

      mockReq.body = invalidStudentData;
      
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
        value: invalidStudentData
      });

      await studentValidation.validateCreateStudent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('gender'),
          statusCode: 400
        })
      );
    });

    it('应该验证出生日期格式', async () => {
      const invalidStudentData = {
        name: '小明',
        gender: 'male',
        birthDate: 'invalid-date', // 无效日期
        kindergartenId: 1
      };

      mockReq.body = invalidStudentData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"birthDate" must be a valid ISO 8601 date',
              path: ['birthDate'],
              type: 'date.format'
            }
          ]
        },
        value: invalidStudentData
      });

      await studentValidation.validateCreateStudent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('birthDate'),
          statusCode: 400
        })
      );
    });

    it('应该验证年龄范围', async () => {
      const invalidStudentData = {
        name: '小明',
        gender: 'male',
        birthDate: '2010-05-15', // 年龄过大
        kindergartenId: 1
      };

      mockReq.body = invalidStudentData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"birthDate" must be greater than "2017-01-01"',
              path: ['birthDate'],
              type: 'date.greater'
            }
          ]
        },
        value: invalidStudentData
      });

      await studentValidation.validateCreateStudent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('年龄不符合入园要求'),
          statusCode: 400
        })
      );
    });

    it('应该验证紧急联系电话格式', async () => {
      const invalidStudentData = {
        name: '小明',
        gender: 'male',
        birthDate: '2019-05-15',
        kindergartenId: 1,
        emergencyPhone: '123' // 无效电话号码
      };

      mockReq.body = invalidStudentData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"emergencyPhone" with value "123" fails to match the required pattern',
              path: ['emergencyPhone'],
              type: 'string.pattern.base'
            }
          ]
        },
        value: invalidStudentData
      });

      await studentValidation.validateCreateStudent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('emergencyPhone'),
          statusCode: 400
        })
      );
    });

    it('应该验证过敏信息数组', async () => {
      const invalidStudentData = {
        name: '小明',
        gender: 'male',
        birthDate: '2019-05-15',
        kindergartenId: 1,
        allergies: 'not an array' // 应该是数组
      };

      mockReq.body = invalidStudentData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"allergies" must be an array',
              path: ['allergies'],
              type: 'array.base'
            }
          ]
        },
        value: invalidStudentData
      });

      await studentValidation.validateCreateStudent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('allergies'),
          statusCode: 400
        })
      );
    });

    it('应该验证家长ID数组', async () => {
      const invalidStudentData = {
        name: '小明',
        gender: 'male',
        birthDate: '2019-05-15',
        kindergartenId: 1,
        parentIds: ['invalid', 'ids'] // 应该是数字数组
      };

      mockReq.body = invalidStudentData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"parentIds[0]" must be a number',
              path: ['parentIds', 0],
              type: 'number.base'
            }
          ]
        },
        value: invalidStudentData
      });

      await studentValidation.validateCreateStudent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('parentIds'),
          statusCode: 400
        })
      );
    });
  });

  describe('validateUpdateStudent', () => {
    it('应该验证有效的学生更新数据', async () => {
      const validUpdateData = {
        name: '小明明',
        allergies: ['花生', '海鲜', '牛奶'],
        medicalConditions: ['轻微哮喘'],
        emergencyContact: '张四',
        emergencyPhone: '13800138001',
        notes: '更新后的备注信息'
      };

      mockReq.body = validUpdateData;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: validUpdateData
      });

      await studentValidation.validateUpdateStudent(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validUpdateData, expect.any(Object));
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该允许部分字段更新', async () => {
      const partialUpdateData = {
        name: '新名称',
        notes: '更新备注'
      };

      mockReq.body = partialUpdateData;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: partialUpdateData
      });

      await studentValidation.validateUpdateStudent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝更新不可变字段', async () => {
      const invalidUpdateData = {
        birthDate: '2020-01-01', // 不允许更新出生日期
        kindergartenId: 2 // 不允许直接更新幼儿园ID
      };

      mockReq.body = invalidUpdateData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"birthDate" is not allowed',
              path: ['birthDate'],
              type: 'object.unknown'
            }
          ]
        },
        value: invalidUpdateData
      });

      await studentValidation.validateUpdateStudent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('birthDate'),
          statusCode: 400
        })
      );
    });
  });

  describe('validateAssignToClass', () => {
    it('应该验证有效的班级分配数据', async () => {
      const validAssignData = {
        classId: 2,
        startDate: '2024-09-01',
        notes: '转班原因：年龄适合'
      };

      mockReq.body = validAssignData;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: validAssignData
      });

      await studentValidation.validateAssignToClass(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validAssignData, expect.any(Object));
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该要求班级ID', async () => {
      const invalidAssignData = {
        startDate: '2024-09-01'
        // 缺少 classId
      };

      mockReq.body = invalidAssignData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"classId" is required',
              path: ['classId'],
              type: 'any.required'
            }
          ]
        },
        value: invalidAssignData
      });

      await studentValidation.validateAssignToClass(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('classId'),
          statusCode: 400
        })
      );
    });

    it('应该验证开始日期格式', async () => {
      const invalidAssignData = {
        classId: 2,
        startDate: 'invalid-date'
      };

      mockReq.body = invalidAssignData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"startDate" must be a valid ISO 8601 date',
              path: ['startDate'],
              type: 'date.format'
            }
          ]
        },
        value: invalidAssignData
      });

      await studentValidation.validateAssignToClass(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('startDate'),
          statusCode: 400
        })
      );
    });
  });

  describe('validateAddParentRelation', () => {
    it('应该验证有效的家长关系数据', async () => {
      const validRelationData = {
        parentId: 3,
        relationship: 'guardian',
        isPrimary: false,
        notes: '监护人关系'
      };

      mockReq.body = validRelationData;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: validRelationData
      });

      await studentValidation.validateAddParentRelation(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validRelationData, expect.any(Object));
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该要求家长ID和关系类型', async () => {
      const invalidRelationData = {
        notes: '备注'
        // 缺少 parentId 和 relationship
      };

      mockReq.body = invalidRelationData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"parentId" is required',
              path: ['parentId'],
              type: 'any.required'
            },
            {
              message: '"relationship" is required',
              path: ['relationship'],
              type: 'any.required'
            }
          ]
        },
        value: invalidRelationData
      });

      await studentValidation.validateAddParentRelation(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('parentId'),
          statusCode: 400
        })
      );
    });

    it('应该验证关系类型枚举值', async () => {
      const invalidRelationData = {
        parentId: 3,
        relationship: 'invalid_relation' // 无效关系类型
      };

      mockReq.body = invalidRelationData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"relationship" must be one of [father, mother, guardian, grandparent, other]',
              path: ['relationship'],
              type: 'any.only'
            }
          ]
        },
        value: invalidRelationData
      });

      await studentValidation.validateAddParentRelation(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('relationship'),
          statusCode: 400
        })
      );
    });
  });

  describe('validateStudentQuery', () => {
    it('应该验证有效的查询参数', async () => {
      const validQuery = {
        page: '1',
        pageSize: '10',
        search: '小明',
        classId: '1',
        status: 'active',
        gender: 'male',
        ageFrom: '3',
        ageTo: '6',
        sortBy: 'name',
        sortOrder: 'asc'
      };

      mockReq.query = validQuery;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: {
          page: 1,
          pageSize: 10,
          search: '小明',
          classId: 1,
          status: 'active',
          gender: 'male',
          ageFrom: 3,
          ageTo: 6,
          sortBy: 'name',
          sortOrder: 'asc'
        }
      });

      await studentValidation.validateStudentQuery(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validQuery, expect.any(Object));
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该设置默认查询参数', async () => {
      const emptyQuery = {};

      mockReq.query = emptyQuery;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: {
          page: 1,
          pageSize: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });

      await studentValidation.validateStudentQuery(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该验证年龄范围', async () => {
      const invalidQuery = {
        ageFrom: '10', // 年龄过大
        ageTo: '2' // 年龄范围错误
      };

      mockReq.query = invalidQuery;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"ageFrom" must be less than or equal to 7',
              path: ['ageFrom'],
              type: 'number.max'
            },
            {
              message: '"ageTo" must be greater than or equal to ref:ageFrom',
              path: ['ageTo'],
              type: 'number.greater'
            }
          ]
        },
        value: invalidQuery
      });

      await studentValidation.validateStudentQuery(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('ageFrom'),
          statusCode: 400
        })
      );
    });

    it('应该验证排序字段', async () => {
      const invalidQuery = {
        sortBy: 'invalidField'
      };

      mockReq.query = invalidQuery;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"sortBy" must be one of [id, name, birthDate, gender, status, createdAt, updatedAt]',
              path: ['sortBy'],
              type: 'any.only'
            }
          ]
        },
        value: invalidQuery
      });

      await studentValidation.validateStudentQuery(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('sortBy'),
          statusCode: 400
        })
      );
    });
  });

  describe('validateStudentId', () => {
    it('应该验证有效的学生ID', async () => {
      mockReq.params = { id: '123' };
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: { id: 123 }
      });

      await studentValidation.validateStudentId(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith({ id: '123' }, expect.any(Object));
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该拒绝无效的学生ID', async () => {
      mockReq.params = { id: 'invalid' };
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"id" must be a number',
              path: ['id'],
              type: 'number.base'
            }
          ]
        },
        value: { id: 'invalid' }
      });

      await studentValidation.validateStudentId(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('id'),
          statusCode: 400
        })
      );
    });

    it('应该要求学生ID为正整数', async () => {
      mockReq.params = { id: '-1' };
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"id" must be a positive number',
              path: ['id'],
              type: 'number.positive'
            }
          ]
        },
        value: { id: -1 }
      });

      await studentValidation.validateStudentId(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('id'),
          statusCode: 400
        })
      );
    });
  });

  describe('validateUpdateStudentStatus', () => {
    it('应该验证有效的状态更新数据', async () => {
      const validStatusData = {
        status: 'graduated',
        reason: '正常毕业',
        effectiveDate: '2024-07-01'
      };

      mockReq.body = validStatusData;
      
      mockJoi.validate.mockReturnValue({
        error: null,
        value: validStatusData
      });

      await studentValidation.validateUpdateStudentStatus(mockReq, mockRes, mockNext);

      expect(mockJoi.validate).toHaveBeenCalledWith(validStatusData, expect.any(Object));
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该要求状态字段', async () => {
      const invalidStatusData = {
        reason: '原因'
        // 缺少 status
      };

      mockReq.body = invalidStatusData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"status" is required',
              path: ['status'],
              type: 'any.required'
            }
          ]
        },
        value: invalidStatusData
      });

      await studentValidation.validateUpdateStudentStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('status'),
          statusCode: 400
        })
      );
    });

    it('应该验证状态枚举值', async () => {
      const invalidStatusData = {
        status: 'invalid_status'
      };

      mockReq.body = invalidStatusData;
      
      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"status" must be one of [active, inactive, graduated, transferred, suspended]',
              path: ['status'],
              type: 'any.only'
            }
          ]
        },
        value: invalidStatusData
      });

      await studentValidation.validateUpdateStudentStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('status'),
          statusCode: 400
        })
      );
    });
  });
});
