import AIQueryHistory from '../../../src/models/AIQueryHistory';
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

describe('AIQueryHistory Model', () => {
  beforeAll(async () => {
    // The model is already initialized in the model file
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(AIQueryHistory.tableName).toBe('ai_query_histories');
    });

    it('should have correct attributes', () => {
      const attributes = AIQueryHistory.getAttributes();
      
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);
      
      expect(attributes.userId).toBeDefined();
      expect(attributes.userId.allowNull).toBe(false);
      
      expect(attributes.queryText).toBeDefined();
      expect(attributes.queryText.allowNull).toBe(false);
      
      expect(attributes.queryHash).toBeDefined();
      expect(attributes.queryHash.allowNull).toBe(false);
      
      expect(attributes.queryType).toBeDefined();
      expect(attributes.queryType.allowNull).toBe(false);
      
      expect(attributes.responseData).toBeDefined();
      expect(attributes.responseData.allowNull).toBe(true);
      
      expect(attributes.responseText).toBeDefined();
      expect(attributes.responseText.allowNull).toBe(true);
      
      expect(attributes.generatedSQL).toBeDefined();
      expect(attributes.generatedSQL.allowNull).toBe(true);
      
      expect(attributes.executionTime).toBeDefined();
      expect(attributes.executionTime.allowNull).toBe(true);
      
      expect(attributes.modelUsed).toBeDefined();
      expect(attributes.modelUsed.allowNull).toBe(true);
      
      expect(attributes.sessionId).toBeDefined();
      expect(attributes.sessionId.allowNull).toBe(true);
      
      expect(attributes.cacheHit).toBeDefined();
      expect(attributes.cacheHit.allowNull).toBe(false);
      expect(attributes.cacheHit.defaultValue).toBe(false);
      
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.createdAt.allowNull).toBe(false);
      
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.updatedAt.allowNull).toBe(false);
    });
  });

  describe('Model Options', () => {
    it('should have correct table configuration', () => {
      expect(AIQueryHistory.options.tableName).toBe('ai_query_histories');
      expect(AIQueryHistory.options.timestamps).toBe(true);
      expect(AIQueryHistory.options.paranoid).toBe(false);
      expect(AIQueryHistory.options.underscored).toBe(true);
    });

    it('should have correct indexes', () => {
      expect(AIQueryHistory.options.indexes).toEqual(
        expect.arrayContaining([
          { fields: ['userId'] },
          { fields: ['queryHash'] },
          { fields: ['userId', 'queryHash'] },
          { fields: ['createdAt'] },
          { fields: ['queryType'] },
        ])
      );
    });
  });

  describe('Model Validation', () => {
    it('should create instance with all attributes', () => {
      const queryData = {
        userId: 1,
        queryText: 'Show me all students',
        queryHash: 'a1b2c3d4e5f6g7h8i9j0',
        queryType: 'data_query' as const,
        responseData: { students: [{ id: 1, name: 'John' }] },
        responseText: 'Found 1 student',
        generatedSQL: 'SELECT * FROM students',
        executionTime: 150,
        modelUsed: 'gpt-4',
        sessionId: 'session123',
        cacheHit: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const query = AIQueryHistory.build(queryData);

      expect(query.id).toBeDefined();
      expect(query.userId).toBe(1);
      expect(query.queryText).toBe('Show me all students');
      expect(query.queryHash).toBe('a1b2c3d4e5f6g7h8i9j0');
      expect(query.queryType).toBe('data_query');
      expect(query.responseData).toEqual({ students: [{ id: 1, name: 'John' }] });
      expect(query.responseText).toBe('Found 1 student');
      expect(query.generatedSQL).toBe('SELECT * FROM students');
      expect(query.executionTime).toBe(150);
      expect(query.modelUsed).toBe('gpt-4');
      expect(query.sessionId).toBe('session123');
      expect(query.cacheHit).toBe(false);
      expect(query.createdAt).toBeInstanceOf(Date);
      expect(query.updatedAt).toBeInstanceOf(Date);
    });

    it('should create instance with minimal required fields', () => {
      const queryData = {
        userId: 1,
        queryText: 'Test query',
        queryHash: 'testhash123',
        queryType: 'ai_response' as const,
      };

      const query = AIQueryHistory.build(queryData);

      expect(query.id).toBeDefined();
      expect(query.userId).toBe(1);
      expect(query.queryText).toBe('Test query');
      expect(query.queryHash).toBe('testhash123');
      expect(query.queryType).toBe('ai_response');
      expect(query.cacheHit).toBe(false); // default value
    });

    it('should allow null values for optional fields', () => {
      const queryData = {
        userId: 1,
        queryText: 'Test query',
        queryHash: 'testhash123',
        queryType: 'data_query' as const,
        responseData: null,
        responseText: null,
        generatedSQL: null,
        executionTime: null,
        modelUsed: null,
        sessionId: null,
      };

      const query = AIQueryHistory.build(queryData);

      expect(query.responseData).toBeNull();
      expect(query.responseText).toBeNull();
      expect(query.generatedSQL).toBeNull();
      expect(query.executionTime).toBeNull();
      expect(query.modelUsed).toBeNull();
      expect(query.sessionId).toBeNull();
    });
  });

  describe('QueryType Enum', () => {
    it('should accept valid queryType values', () => {
      const validTypes = ['data_query', 'ai_response'] as const;
      
      validTypes.forEach(queryType => {
        const query = AIQueryHistory.build({
          userId: 1,
          queryText: 'Test query',
          queryHash: 'testhash123',
          queryType,
        });

        expect(query.queryType).toBe(queryType);
      });
    });

    it('should have correct queryType field configuration', () => {
      const attributes = AIQueryHistory.getAttributes();
      expect(attributes.queryType.type.values).toEqual(['data_query', 'ai_response']);
    });
  });

  describe('Field Types', () => {
    it('should have correct field types', () => {
      const attributes = AIQueryHistory.getAttributes();
      
      expect(attributes.id.type.constructor.name).toContain('INTEGER');
      expect(attributes.userId.type.constructor.name).toContain('INTEGER');
      expect(attributes.queryText.type.constructor.name).toContain('TEXT');
      expect(attributes.queryHash.type.constructor.name).toContain('STRING');
      expect(attributes.responseData.type.constructor.name).toContain('JSON');
      expect(attributes.responseText.type.constructor.name).toContain('TEXT');
      expect(attributes.generatedSQL.type.constructor.name).toContain('TEXT');
      expect(attributes.executionTime.type.constructor.name).toContain('INTEGER');
      expect(attributes.modelUsed.type.constructor.name).toContain('STRING');
      expect(attributes.sessionId.type.constructor.name).toContain('STRING');
      expect(attributes.cacheHit.type.constructor.name).toContain('BOOLEAN');
      expect(attributes.createdAt.type.constructor.name).toContain('DATE');
      expect(attributes.updatedAt.type.constructor.name).toContain('DATE');
    });
  });

  describe('Field Constraints', () => {
    it('should have unsigned integer for id', () => {
      const attributes = AIQueryHistory.getAttributes();
      expect(attributes.id.type.constructor.name).toContain('UNSIGNED');
    });

    it('should have correct length for queryHash', () => {
      const attributes = AIQueryHistory.getAttributes();
      expect(attributes.queryHash.type._length).toBe(64);
    });

    it('should have correct length for modelUsed', () => {
      const attributes = AIQueryHistory.getAttributes();
      expect(attributes.modelUsed.type._length).toBe(100);
    });

    it('should have correct length for sessionId', () => {
      const attributes = AIQueryHistory.getAttributes();
      expect(attributes.sessionId.type._length).toBe(100);
    });
  });

  describe('Default Values', () => {
    it('should have default value for cacheHit', () => {
      const attributes = AIQueryHistory.getAttributes();
      expect(attributes.cacheHit.defaultValue).toBe(false);
    });

    it('should have default value for createdAt', () => {
      const attributes = AIQueryHistory.getAttributes();
      expect(attributes.createdAt.defaultValue).toBeDefined();
    });

    it('should have default value for updatedAt', () => {
      const attributes = AIQueryHistory.getAttributes();
      expect(attributes.updatedAt.defaultValue).toBeDefined();
    });
  });

  describe('Field Comments', () => {
    it('should have proper field comments', () => {
      const attributes = AIQueryHistory.getAttributes();
      
      expect(attributes.userId.comment).toBe('用户ID');
      expect(attributes.queryText.comment).toBe('查询内容');
      expect(attributes.queryHash.comment).toBe('查询内容的MD5哈希值，用于快速匹配重复查询');
      expect(attributes.queryType.comment).toBe('查询类型：数据查询或AI问答');
      expect(attributes.responseData.comment).toBe('查询结果数据（JSON格式）');
      expect(attributes.responseText.comment).toBe('AI回答文本（用于非数据查询）');
      expect(attributes.generatedSQL.comment).toBe('生成的SQL语句');
      expect(attributes.executionTime.comment).toBe('执行时间（毫秒）');
      expect(attributes.modelUsed.comment).toBe('使用的AI模型名称');
      expect(attributes.sessionId.comment).toBe('会话ID');
      expect(attributes.cacheHit.comment).toBe('是否命中缓存');
    });
  });

  describe('Model Interface', () => {
    it('should implement AIQueryHistoryAttributes interface', () => {
      const queryData = {
        id: 1,
        userId: 1,
        queryText: 'Test query',
        queryHash: 'testhash123',
        queryType: 'data_query' as const,
        responseData: { result: 'test' },
        responseText: 'Test response',
        generatedSQL: 'SELECT * FROM test',
        executionTime: 100,
        modelUsed: 'gpt-4',
        sessionId: 'session123',
        cacheHit: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const query = AIQueryHistory.build(queryData);

      expect(query.id).toBe(queryData.id);
      expect(query.userId).toBe(queryData.userId);
      expect(query.queryText).toBe(queryData.queryText);
      expect(query.queryHash).toBe(queryData.queryHash);
      expect(query.queryType).toBe(queryData.queryType);
      expect(query.responseData).toEqual(queryData.responseData);
      expect(query.responseText).toBe(queryData.responseText);
      expect(query.generatedSQL).toBe(queryData.generatedSQL);
      expect(query.executionTime).toBe(queryData.executionTime);
      expect(query.modelUsed).toBe(queryData.modelUsed);
      expect(query.sessionId).toBe(queryData.sessionId);
      expect(query.cacheHit).toBe(queryData.cacheHit);
      expect(query.createdAt).toBe(queryData.createdAt);
      expect(query.updatedAt).toBe(queryData.updatedAt);
    });
  });

  describe('JSON Fields', () => {
    it('should handle JSON data in responseData', () => {
      const responseData = {
        students: [
          { id: 1, name: 'John', age: 5 },
          { id: 2, name: 'Jane', age: 6 },
        ],
        total: 2,
      };

      const query = AIQueryHistory.build({
        userId: 1,
        queryText: 'Show me students',
        queryHash: 'hash123',
        queryType: 'data_query',
        responseData,
      });

      expect(query.responseData).toEqual(responseData);
      expect(query.responseData.students).toHaveLength(2);
      expect(query.responseData.total).toBe(2);
    });

    it('should handle null JSON data', () => {
      const query = AIQueryHistory.build({
        userId: 1,
        queryText: 'Test query',
        queryHash: 'hash123',
        queryType: 'ai_response',
        responseData: null,
      });

      expect(query.responseData).toBeNull();
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const query = AIQueryHistory.build({
        userId: 1,
        queryText: 'Test query',
        queryHash: 'testhash123',
        queryType: 'data_query',
      });

      const validationErrors = await query.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should fail validation without required fields', async () => {
      const query = AIQueryHistory.build({});

      await expect(query.validate()).rejects.toThrow();
    });

    it('should validate queryHash length', () => {
      const validHash = 'a'.repeat(64); // 64 characters
      const query = AIQueryHistory.build({
        userId: 1,
        queryText: 'Test query',
        queryHash: validHash,
        queryType: 'data_query',
      });

      expect(query.queryHash).toBe(validHash);
    });

    it('should validate executionTime as positive number', () => {
      const validExecutionTimes = [0, 100, 1000, 5000];
      
      validExecutionTimes.forEach(executionTime => {
        const query = AIQueryHistory.build({
          userId: 1,
          queryText: 'Test query',
          queryHash: 'hash123',
          queryType: 'data_query',
          executionTime,
        });

        expect(query.executionTime).toBe(executionTime);
      });
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt timestamps', () => {
      const query = AIQueryHistory.build({
        userId: 1,
        queryText: 'Test query',
        queryHash: 'hash123',
        queryType: 'data_query',
      });

      expect(query.createdAt).toBeDefined();
      expect(query.updatedAt).toBeDefined();
      expect(query.createdAt).toBeInstanceOf(Date);
      expect(query.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Database Constraints', () => {
    it('should have primary key constraint on id', () => {
      const attributes = AIQueryHistory.getAttributes();
      expect(attributes.id.primaryKey).toBe(true);
    });

    it('should have auto increment on id', () => {
      const attributes = AIQueryHistory.getAttributes();
      expect(attributes.id.autoIncrement).toBe(true);
    });
  });
});