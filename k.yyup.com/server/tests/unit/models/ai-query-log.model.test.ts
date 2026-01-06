import { AIQueryLog, initAIQueryLog, initAIQueryLogAssociations } from '../../../src/models/ai-query-log.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { Sequelize } from 'sequelize';

// Mock dependencies
jest.mock('../../../src/models/user.model');


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

describe('AIQueryLog Model', () => {
  let mockUser: jest.Mocked<typeof User>;
  let mockSequelize: jest.Mocked<Sequelize>;

  beforeEach(() => {
    mockUser = User as jest.Mocked<typeof User>;
    mockSequelize = {
      define: jest.fn(),
      models: {},
    } as any;
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('should have correct model attributes', () => {
      expect(AIQueryLog).toBeDefined();
      expect(AIQueryLog).toBeInstanceOf(Function);
    });

    it('should initialize model correctly', () => {
      const modelInstance = initAIQueryLog(mockSequelize);
      expect(modelInstance).toBeDefined();
      expect(modelInstance).toBe(AIQueryLog);
    });
  });

  describe('Model Attributes', () => {
    let modelInstance: AIQueryLog;

    beforeEach(() => {
      modelInstance = new AIQueryLog();
    });

    it('should have all required attributes', () => {
      expect(modelInstance).toHaveProperty('id');
      expect(modelInstance).toHaveProperty('userId');
      expect(modelInstance).toHaveProperty('naturalQuery');
      expect(modelInstance).toHaveProperty('executionStatus');
      expect(modelInstance).toHaveProperty('executionTime');
      expect(modelInstance).toHaveProperty('aiProcessingTime');
      expect(modelInstance).toHaveProperty('tokensUsed');
      expect(modelInstance).toHaveProperty('cacheHit');
      expect(modelInstance).toHaveProperty('queryComplexity');
      expect(modelInstance).toHaveProperty('createdAt');
      expect(modelInstance).toHaveProperty('updatedAt');
    });

    it('should have optional attributes', () => {
      expect(modelInstance).toHaveProperty('sessionId');
      expect(modelInstance).toHaveProperty('intentAnalysis');
      expect(modelInstance).toHaveProperty('generatedSql');
      expect(modelInstance).toHaveProperty('finalSql');
      expect(modelInstance).toHaveProperty('resultData');
      expect(modelInstance).toHaveProperty('resultMetadata');
      expect(modelInstance).toHaveProperty('errorMessage');
      expect(modelInstance).toHaveProperty('errorType');
      expect(modelInstance).toHaveProperty('modelUsed');
    });

    it('should have correct default values', () => {
      expect(modelInstance.executionTime).toBeUndefined();
      expect(modelInstance.aiProcessingTime).toBeUndefined();
      expect(modelInstance.tokensUsed).toBeUndefined();
      expect(modelInstance.cacheHit).toBeUndefined();
      expect(modelInstance.queryComplexity).toBeUndefined();
    });
  });

  describe('Instance Methods', () => {
    let modelInstance: AIQueryLog;

    beforeEach(() => {
      modelInstance = new AIQueryLog({
        userId: 1,
        naturalQuery: 'test query',
        executionStatus: 'success',
        executionTime: 100,
        aiProcessingTime: 50,
        tokensUsed: 100,
        cacheHit: false,
        queryComplexity: 5,
      });
    });

    describe('getStatusText', () => {
      it('should return correct text for pending status', () => {
        modelInstance.executionStatus = 'pending';
        expect(modelInstance.getStatusText()).toBe('执行中');
      });

      it('should return correct text for success status', () => {
        modelInstance.executionStatus = 'success';
        expect(modelInstance.getStatusText()).toBe('成功');
      });

      it('should return correct text for failed status', () => {
        modelInstance.executionStatus = 'failed';
        expect(modelInstance.getStatusText()).toBe('失败');
      });

      it('should return correct text for cancelled status', () => {
        modelInstance.executionStatus = 'cancelled';
        expect(modelInstance.getStatusText()).toBe('已取消');
      });

      it('should return unknown for invalid status', () => {
        modelInstance.executionStatus = 'invalid' as any;
        expect(modelInstance.getStatusText()).toBe('未知');
      });
    });

    describe('getErrorTypeText', () => {
      it('should return correct text for sql_error', () => {
        modelInstance.errorType = 'sql_error';
        expect(modelInstance.getErrorTypeText()).toBe('SQL语法错误');
      });

      it('should return correct text for permission_error', () => {
        modelInstance.errorType = 'permission_error';
        expect(modelInstance.getErrorTypeText()).toBe('权限不足');
      });

      it('should return correct text for ai_error', () => {
        modelInstance.errorType = 'ai_error';
        expect(modelInstance.getErrorTypeText()).toBe('AI处理错误');
      });

      it('should return correct text for system_error', () => {
        modelInstance.errorType = 'system_error';
        expect(modelInstance.getErrorTypeText()).toBe('系统错误');
      });

      it('should return empty string when errorType is undefined', () => {
        modelInstance.errorType = undefined;
        expect(modelInstance.getErrorTypeText()).toBe('');
      });

      it('should return unknown for invalid error type', () => {
        modelInstance.errorType = 'invalid' as any;
        expect(modelInstance.getErrorTypeText()).toBe('未知错误');
      });
    });

    describe('getComplexityLevel', () => {
      it('should return simple for complexity <= 3', () => {
        modelInstance.queryComplexity = 3;
        expect(modelInstance.getComplexityLevel()).toBe('简单');
        
        modelInstance.queryComplexity = 1;
        expect(modelInstance.getComplexityLevel()).toBe('简单');
      });

      it('should return medium for complexity <= 6', () => {
        modelInstance.queryComplexity = 6;
        expect(modelInstance.getComplexityLevel()).toBe('中等');
        
        modelInstance.queryComplexity = 4;
        expect(modelInstance.getComplexityLevel()).toBe('中等');
      });

      it('should return complex for complexity <= 9', () => {
        modelInstance.queryComplexity = 9;
        expect(modelInstance.getComplexityLevel()).toBe('复杂');
        
        modelInstance.queryComplexity = 7;
        expect(modelInstance.getComplexityLevel()).toBe('复杂');
      });

      it('should return very complex for complexity > 9', () => {
        modelInstance.queryComplexity = 10;
        expect(modelInstance.getComplexityLevel()).toBe('极复杂');
      });
    });

    describe('getPerformanceLevel', () => {
      it('should return excellent for executionTime <= 100ms', () => {
        modelInstance.executionTime = 100;
        expect(modelInstance.getPerformanceLevel()).toBe('优秀');
        
        modelInstance.executionTime = 50;
        expect(modelInstance.getPerformanceLevel()).toBe('优秀');
      });

      it('should return good for executionTime <= 500ms', () => {
        modelInstance.executionTime = 500;
        expect(modelInstance.getPerformanceLevel()).toBe('良好');
        
        modelInstance.executionTime = 200;
        expect(modelInstance.getPerformanceLevel()).toBe('良好');
      });

      it('should return average for executionTime <= 1000ms', () => {
        modelInstance.executionTime = 1000;
        expect(modelInstance.getPerformanceLevel()).toBe('一般');
        
        modelInstance.executionTime = 600;
        expect(modelInstance.getPerformanceLevel()).toBe('一般');
      });

      it('should return slow for executionTime > 1000ms', () => {
        modelInstance.executionTime = 1001;
        expect(modelInstance.getPerformanceLevel()).toBe('较慢');
      });
    });
  });

  describe('Model Initialization', () => {
    it('should initialize with correct configuration', () => {
      const mockDefine = jest.fn().mockReturnValue(AIQueryLog);
      mockSequelize.define = mockDefine;

      initAIQueryLog(mockSequelize);

      expect(mockDefine).toHaveBeenCalledWith(
        'AIQueryLog',
        expect.objectContaining({
          id: expect.objectContaining({
            type: expect.any(Object),
            autoIncrement: true,
            primaryKey: true,
          }),
          userId: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            field: 'user_id',
          }),
          sessionId: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            field: 'session_id',
          }),
          naturalQuery: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            field: 'natural_query',
          }),
          intentAnalysis: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            field: 'intent_analysis',
          }),
          executionStatus: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 'pending',
            field: 'execution_status',
          }),
          executionTime: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 0,
            field: 'execution_time',
          }),
          aiProcessingTime: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 0,
            field: 'ai_processing_time',
          }),
          tokensUsed: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 0,
            field: 'tokens_used',
          }),
          cacheHit: expect.objectContaining({
            type: expect.any(Object),
            defaultValue: false,
            field: 'cache_hit',
          }),
          queryComplexity: expect.objectContaining({
            type: expect.any(Object),
            defaultValue: 0,
            field: 'query_complexity',
          }),
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          modelName: 'AIQueryLog',
          tableName: 'ai_query_logs',
          timestamps: true,
          underscored: true,
          indexes: expect.arrayContaining([
            { fields: ['user_id'] },
            { fields: ['session_id'] },
            { fields: ['execution_status'] },
            { fields: ['created_at'] },
            { fields: ['model_used'] },
            { fields: ['cache_hit'] },
          ]),
        })
      );
    });
  });

  describe('Model Associations', () => {
    it('should belong to User', () => {
      const mockBelongsTo = jest.fn();
      AIQueryLog.belongsTo = mockBelongsTo;

      initAIQueryLogAssociations();

      expect(mockBelongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'userId',
        as: 'user',
      });
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', () => {
      const modelInstance = new AIQueryLog();
      
      expect(modelInstance).toHaveProperty('userId');
      expect(modelInstance).toHaveProperty('naturalQuery');
      expect(modelInstance).toHaveProperty('executionStatus');
      expect(modelInstance).toHaveProperty('executionTime');
      expect(modelInstance).toHaveProperty('aiProcessingTime');
      expect(modelInstance).toHaveProperty('tokensUsed');
      expect(modelInstance).toHaveProperty('cacheHit');
      expect(modelInstance).toHaveProperty('queryComplexity');
    });

    it('should validate enum values for executionStatus', () => {
      const modelInstance = new AIQueryLog();
      
      // Test valid executionStatus values
      modelInstance.executionStatus = 'pending';
      expect(modelInstance.executionStatus).toBe('pending');
      
      modelInstance.executionStatus = 'success';
      expect(modelInstance.executionStatus).toBe('success');
      
      modelInstance.executionStatus = 'failed';
      expect(modelInstance.executionStatus).toBe('failed');
      
      modelInstance.executionStatus = 'cancelled';
      expect(modelInstance.executionStatus).toBe('cancelled');
    });

    it('should validate enum values for errorType', () => {
      const modelInstance = new AIQueryLog();
      
      // Test valid errorType values
      modelInstance.errorType = 'sql_error';
      expect(modelInstance.errorType).toBe('sql_error');
      
      modelInstance.errorType = 'permission_error';
      expect(modelInstance.errorType).toBe('permission_error');
      
      modelInstance.errorType = 'ai_error';
      expect(modelInstance.errorType).toBe('ai_error');
      
      modelInstance.errorType = 'system_error';
      expect(modelInstance.errorType).toBe('system_error');
    });

    it('should validate boolean value for cacheHit', () => {
      const modelInstance = new AIQueryLog();
      
      modelInstance.cacheHit = true;
      expect(modelInstance.cacheHit).toBe(true);
      
      modelInstance.cacheHit = false;
      expect(modelInstance.cacheHit).toBe(false);
    });

    it('should validate numeric values', () => {
      const modelInstance = new AIQueryLog();
      
      modelInstance.executionTime = 100;
      expect(modelInstance.executionTime).toBe(100);
      
      modelInstance.aiProcessingTime = 50;
      expect(modelInstance.aiProcessingTime).toBe(50);
      
      modelInstance.tokensUsed = 1000;
      expect(modelInstance.tokensUsed).toBe(1000);
      
      modelInstance.queryComplexity = 5;
      expect(modelInstance.queryComplexity).toBe(5);
    });
  });

  describe('Model Instances', () => {
    it('should create a valid model instance with minimal data', () => {
      const modelInstance = new AIQueryLog({
        userId: 1,
        naturalQuery: 'test query',
        executionStatus: 'success',
        executionTime: 100,
        aiProcessingTime: 50,
        tokensUsed: 100,
        cacheHit: false,
        queryComplexity: 3,
      });

      expect(modelInstance.userId).toBe(1);
      expect(modelInstance.naturalQuery).toBe('test query');
      expect(modelInstance.executionStatus).toBe('success');
      expect(modelInstance.executionTime).toBe(100);
      expect(modelInstance.aiProcessingTime).toBe(50);
      expect(modelInstance.tokensUsed).toBe(100);
      expect(modelInstance.cacheHit).toBe(false);
      expect(modelInstance.queryComplexity).toBe(3);
    });

    it('should create a valid model instance with full data', () => {
      const intentAnalysis = {
        type: 'SELECT' as const,
        confidence: 0.9,
        entities: [
          {
            type: 'TABLE' as const,
            value: 'users',
            confidence: 0.8,
          },
        ],
        keywords: ['user', 'list'],
        businessDomain: 'user_management',
      };

      const resultMetadata = {
        totalRows: 10,
        columnsInfo: [
          {
            name: 'id',
            type: 'INTEGER',
            description: 'User ID',
          },
        ],
        executionTime: 100,
        warnings: ['Query executed successfully'],
      };

      const modelInstance = new AIQueryLog({
        userId: 1,
        sessionId: 'session-123',
        naturalQuery: 'list all users',
        intentAnalysis,
        generatedSql: 'SELECT * FROM users',
        finalSql: 'SELECT * FROM users WHERE active = true',
        executionStatus: 'success',
        executionTime: 100,
        aiProcessingTime: 50,
        resultData: [{ id: 1, name: 'John' }],
        resultMetadata,
        errorMessage: null,
        errorType: null,
        tokensUsed: 100,
        modelUsed: 'gpt-3.5-turbo',
        cacheHit: false,
        queryComplexity: 3,
      });

      expect(modelInstance.userId).toBe(1);
      expect(modelInstance.sessionId).toBe('session-123');
      expect(modelInstance.naturalQuery).toBe('list all users');
      expect(modelInstance.intentAnalysis).toEqual(intentAnalysis);
      expect(modelInstance.generatedSql).toBe('SELECT * FROM users');
      expect(modelInstance.finalSql).toBe('SELECT * FROM users WHERE active = true');
      expect(modelInstance.executionStatus).toBe('success');
      expect(modelInstance.executionTime).toBe(100);
      expect(modelInstance.aiProcessingTime).toBe(50);
      expect(modelInstance.resultData).toEqual([{ id: 1, name: 'John' }]);
      expect(modelInstance.resultMetadata).toEqual(resultMetadata);
      expect(modelInstance.errorMessage).toBeNull();
      expect(modelInstance.errorType).toBeNull();
      expect(modelInstance.tokensUsed).toBe(100);
      expect(modelInstance.modelUsed).toBe('gpt-3.5-turbo');
      expect(modelInstance.cacheHit).toBe(false);
      expect(modelInstance.queryComplexity).toBe(3);
    });
  });

  describe('Model Methods', () => {
    it('should handle complex intent analysis', () => {
      const modelInstance = new AIQueryLog({
        userId: 1,
        naturalQuery: 'complex query',
        executionStatus: 'success',
        executionTime: 200,
        aiProcessingTime: 100,
        tokensUsed: 500,
        cacheHit: false,
        queryComplexity: 8,
      });

      expect(modelInstance.getComplexityLevel()).toBe('复杂');
      expect(modelInstance.getPerformanceLevel()).toBe('良好');
    });

    it('should handle edge cases for performance levels', () => {
      const modelInstance = new AIQueryLog({
        userId: 1,
        naturalQuery: 'edge case query',
        executionStatus: 'success',
        executionTime: 1000,
        aiProcessingTime: 500,
        tokensUsed: 1000,
        cacheHit: false,
        queryComplexity: 10,
      });

      expect(modelInstance.getComplexityLevel()).toBe('极复杂');
      expect(modelInstance.getPerformanceLevel()).toBe('一般');
    });
  });
});