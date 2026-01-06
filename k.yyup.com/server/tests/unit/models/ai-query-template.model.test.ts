import { AIQueryTemplate, initAIQueryTemplate } from '../../../src/models/ai-query-template.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';

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

describe('AIQueryTemplate Model', () => {
  let mockUser: jest.Mocked<typeof User>;
  let mockSequelize: any;

  beforeEach(() => {
    mockUser = User as jest.Mocked<typeof User>;
    mockSequelize = {
      define: jest.fn(),
      models: {},
    };
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('should have correct model attributes', () => {
      expect(AIQueryTemplate).toBeDefined();
      expect(AIQueryTemplate).toBeInstanceOf(Function);
    });

    it('should initialize model correctly', () => {
      const mockDefine = jest.fn().mockReturnValue(AIQueryTemplate);
      mockSequelize.define = mockDefine;

      const modelInstance = initAIQueryTemplate(mockSequelize);
      expect(modelInstance).toBeDefined();
      expect(modelInstance).toBe(AIQueryTemplate);
    });
  });

  describe('Model Attributes', () => {
    let modelInstance: AIQueryTemplate;

    beforeEach(() => {
      modelInstance = new AIQueryTemplate();
    });

    it('should have all required attributes', () => {
      expect(modelInstance).toHaveProperty('id');
      expect(modelInstance).toHaveProperty('name');
      expect(modelInstance).toHaveProperty('displayName');
      expect(modelInstance).toHaveProperty('templateSql');
      expect(modelInstance).toHaveProperty('exampleQueries');
      expect(modelInstance).toHaveProperty('keywords');
      expect(modelInstance).toHaveProperty('allowedRoles');
      expect(modelInstance).toHaveProperty('difficulty');
      expect(modelInstance).toHaveProperty('usageCount');
      expect(modelInstance).toHaveProperty('successRate');
      expect(modelInstance).toHaveProperty('avgExecutionTime');
      expect(modelInstance).toHaveProperty('isActive');
      expect(modelInstance).toHaveProperty('createdAt');
      expect(modelInstance).toHaveProperty('updatedAt');
    });

    it('should have optional attributes', () => {
      expect(modelInstance).toHaveProperty('description');
      expect(modelInstance).toHaveProperty('category');
      expect(modelInstance).toHaveProperty('parameters');
      expect(modelInstance).toHaveProperty('businessDomain');
      expect(modelInstance).toHaveProperty('creatorId');
    });

    it('should have correct default values', () => {
      expect(modelInstance.usageCount).toBeUndefined();
      expect(modelInstance.successRate).toBeUndefined();
      expect(modelInstance.avgExecutionTime).toBeUndefined();
      expect(modelInstance.isActive).toBeUndefined();
    });
  });

  describe('Instance Methods', () => {
    let modelInstance: AIQueryTemplate;

    beforeEach(() => {
      modelInstance = new AIQueryTemplate({
        name: 'user_list',
        displayName: 'User List',
        templateSql: 'SELECT * FROM users',
        exampleQueries: ['list all users', 'show users'],
        keywords: ['user', 'list', 'all'],
        allowedRoles: ['admin', 'manager'],
        difficulty: 'easy',
        usageCount: 10,
        successRate: 0.9,
        avgExecutionTime: 100,
        isActive: true,
      });
    });

    describe('canUseByRole', () => {
      it('should return true for allowed roles', () => {
        expect(modelInstance.canUseByRole('admin')).toBe(true);
        expect(modelInstance.canUseByRole('manager')).toBe(true);
      });

      it('should return false for disallowed roles', () => {
        expect(modelInstance.canUseByRole('user')).toBe(false);
        expect(modelInstance.canUseByRole('guest')).toBe(false);
      });

      it('should return true when all roles are allowed', () => {
        modelInstance.allowedRoles = ['all'];
        expect(modelInstance.canUseByRole('admin')).toBe(true);
        expect(modelInstance.canUseByRole('user')).toBe(true);
        expect(modelInstance.canUseByRole('guest')).toBe(true);
      });

      it('should return true when role is in allowed list with all', () => {
        modelInstance.allowedRoles = ['admin', 'all'];
        expect(modelInstance.canUseByRole('user')).toBe(true);
      });
    });

    describe('matchesKeywords', () => {
      it('should return correct match score for matching keywords', () => {
        modelInstance.keywords = ['user', 'list', 'all'];
        
        expect(modelInstance.matchesKeywords('show all users')).toBe(1); // 3/3 matches
        expect(modelInstance.matchesKeywords('list users')).toBe(2/3); // 2/3 matches
        expect(modelInstance.matchesKeywords('user data')).toBe(1/3); // 1/3 matches
      });

      it('should return 0 for no matches', () => {
        modelInstance.keywords = ['user', 'list'];
        expect(modelInstance.matchesKeywords('show products')).toBe(0);
      });

      it('should handle empty keywords array', () => {
        modelInstance.keywords = [];
        expect(modelInstance.matchesKeywords('any query')).toBe(0);
      });

      it('should be case insensitive', () => {
        modelInstance.keywords = ['user', 'list'];
        expect(modelInstance.matchesKeywords('USER LIST')).toBe(1);
        expect(modelInstance.matchesKeywords('User List')).toBe(1);
      });
    });

    describe('getDifficultyText', () => {
      it('should return correct text for easy difficulty', () => {
        modelInstance.difficulty = 'easy';
        expect(modelInstance.getDifficultyText()).toBe('简单');
      });

      it('should return correct text for medium difficulty', () => {
        modelInstance.difficulty = 'medium';
        expect(modelInstance.getDifficultyText()).toBe('中等');
      });

      it('should return correct text for hard difficulty', () => {
        modelInstance.difficulty = 'hard';
        expect(modelInstance.getDifficultyText()).toBe('困难');
      });

      it('should return unknown for invalid difficulty', () => {
        modelInstance.difficulty = 'invalid' as any;
        expect(modelInstance.getDifficultyText()).toBe('未知');
      });
    });

    describe('getSuccessRateLevel', () => {
      it('should return excellent for success rate >= 0.9', () => {
        modelInstance.successRate = 0.9;
        expect(modelInstance.getSuccessRateLevel()).toBe('优秀');
        
        modelInstance.successRate = 0.95;
        expect(modelInstance.getSuccessRateLevel()).toBe('优秀');
      });

      it('should return good for success rate >= 0.7', () => {
        modelInstance.successRate = 0.7;
        expect(modelInstance.getSuccessRateLevel()).toBe('良好');
        
        modelInstance.successRate = 0.8;
        expect(modelInstance.getSuccessRateLevel()).toBe('良好');
      });

      it('should return average for success rate >= 0.5', () => {
        modelInstance.successRate = 0.5;
        expect(modelInstance.getSuccessRateLevel()).toBe('一般');
        
        modelInstance.successRate = 0.6;
        expect(modelInstance.getSuccessRateLevel()).toBe('一般');
      });

      it('should return low for success rate < 0.5', () => {
        modelInstance.successRate = 0.4;
        expect(modelInstance.getSuccessRateLevel()).toBe('较低');
        
        modelInstance.successRate = 0.1;
        expect(modelInstance.getSuccessRateLevel()).toBe('较低');
      });
    });

    describe('incrementUsage', () => {
      it('should increment usage count', async () => {
        const mockSave = jest.spyOn(modelInstance, 'save').mockResolvedValue(modelInstance);
        const initialCount = modelInstance.usageCount;

        await modelInstance.incrementUsage();

        expect(modelInstance.usageCount).toBe(initialCount + 1);
        expect(mockSave).toHaveBeenCalled();
      });
    });

    describe('updateSuccessRate', () => {
      it('should update success rate for successful execution', async () => {
        const mockSave = jest.spyOn(modelInstance, 'save').mockResolvedValue(modelInstance);
        modelInstance.usageCount = 10;
        modelInstance.successRate = 0.8; // 8 successes out of 10

        await modelInstance.updateSuccessRate(true);

        expect(modelInstance.successRate).toBe(0.9); // 9 successes out of 10
        expect(mockSave).toHaveBeenCalled();
      });

      it('should update success rate for failed execution', async () => {
        const mockSave = jest.spyOn(modelInstance, 'save').mockResolvedValue(modelInstance);
        modelInstance.usageCount = 10;
        modelInstance.successRate = 0.8; // 8 successes out of 10

        await modelInstance.updateSuccessRate(false);

        expect(modelInstance.successRate).toBe(0.8); // 8 successes out of 11
        expect(mockSave).toHaveBeenCalled();
      });

      it('should handle first usage', async () => {
        const mockSave = jest.spyOn(modelInstance, 'save').mockResolvedValue(modelInstance);
        modelInstance.usageCount = 1;
        modelInstance.successRate = 0;

        await modelInstance.updateSuccessRate(true);

        expect(modelInstance.successRate).toBe(1);
        expect(mockSave).toHaveBeenCalled();
      });
    });

    describe('updateAvgExecutionTime', () => {
      it('should update average execution time for first usage', async () => {
        const mockSave = jest.spyOn(modelInstance, 'save').mockResolvedValue(modelInstance);
        modelInstance.usageCount = 1;
        const executionTime = 100;

        await modelInstance.updateAvgExecutionTime(executionTime);

        expect(modelInstance.avgExecutionTime).toBe(100);
        expect(mockSave).toHaveBeenCalled();
      });

      it('should update average execution time for subsequent usage', async () => {
        const mockSave = jest.spyOn(modelInstance, 'save').mockResolvedValue(modelInstance);
        modelInstance.usageCount = 10;
        modelInstance.avgExecutionTime = 100; // Current average
        const executionTime = 200; // New execution time

        await modelInstance.updateAvgExecutionTime(executionTime);

        // Expected: (100 * 9 + 200) / 10 = 110
        expect(modelInstance.avgExecutionTime).toBe(110);
        expect(mockSave).toHaveBeenCalled();
      });
    });

    describe('fillTemplate', () => {
      it('should fill template with string parameters', () => {
        modelInstance.templateSql = 'SELECT * FROM users WHERE name = {{name}} AND status = {{status}}';
        const params = { name: 'John', status: 'active' };

        const result = modelInstance.fillTemplate(params);

        expect(result).toBe("SELECT * FROM users WHERE name = 'John' AND status = 'active'");
      });

      it('should fill template with numeric parameters', () => {
        modelInstance.templateSql = 'SELECT * FROM users WHERE age > {{minAge}} AND department_id = {{deptId}}';
        const params = { minAge: 25, deptId: 1 };

        const result = modelInstance.fillTemplate(params);

        expect(result).toBe('SELECT * FROM users WHERE age > 25 AND department_id = 1');
      });

      it('should handle missing parameters', () => {
        modelInstance.templateSql = 'SELECT * FROM users WHERE name = {{name}} AND age = {{age}}';
        const params = { name: 'John' }; // Missing age

        const result = modelInstance.fillTemplate(params);

        expect(result).toBe("SELECT * FROM users WHERE name = 'John' AND age = {{age}}");
      });

      it('should handle empty parameters', () => {
        modelInstance.templateSql = 'SELECT * FROM users';
        const params = {};

        const result = modelInstance.fillTemplate(params);

        expect(result).toBe('SELECT * FROM users');
      });

      it('should replace all occurrences of the same parameter', () => {
        modelInstance.templateSql = 'SELECT * FROM {{table}} WHERE {{table}}.id = {{id}}';
        const params = { table: 'users', id: 1 };

        const result = modelInstance.fillTemplate(params);

        expect(result).toBe('SELECT * FROM users WHERE users.id = 1');
      });
    });
  });

  describe('Model Initialization', () => {
    it('should initialize with correct configuration', () => {
      const mockDefine = jest.fn().mockReturnValue(AIQueryTemplate);
      mockSequelize.define = mockDefine;

      initAIQueryTemplate(mockSequelize);

      expect(mockDefine).toHaveBeenCalledWith(
        'AIQueryTemplate',
        expect.objectContaining({
          id: expect.objectContaining({
            type: expect.any(Object),
            autoIncrement: true,
            primaryKey: true,
          }),
          name: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            unique: true,
          }),
          displayName: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            field: 'display_name',
          }),
          description: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
          category: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
          templateSql: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            field: 'template_sql',
          }),
          parameters: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
          }),
          exampleQueries: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: [],
            field: 'example_queries',
          }),
          keywords: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: [],
          }),
          businessDomain: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            field: 'business_domain',
          }),
          allowedRoles: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: ['all'],
            field: 'allowed_roles',
          }),
          difficulty: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 'medium',
          }),
          usageCount: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 0,
            field: 'usage_count',
          }),
          successRate: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 0,
            field: 'success_rate',
          }),
          avgExecutionTime: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 0,
            field: 'avg_execution_time',
          }),
          isActive: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: true,
            field: 'is_active',
          }),
          creatorId: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            field: 'creator_id',
          }),
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          modelName: 'AIQueryTemplate',
          tableName: 'ai_query_templates',
          timestamps: true,
          underscored: true,
          indexes: expect.arrayContaining([
            { fields: ['name'] },
            { fields: ['category'] },
            { fields: ['business_domain'] },
            { fields: ['difficulty'] },
            { fields: ['usage_count'] },
            { fields: ['success_rate'] },
            { fields: ['is_active'] },
            { fields: ['creator_id'] },
          ]),
        })
      );
    });
  });

  describe('Model Associations', () => {
    it('should belong to User as creator', () => {
      const mockBelongsTo = jest.fn();
      AIQueryTemplate.belongsTo = mockBelongsTo;

      const mockDefine = jest.fn().mockReturnValue(AIQueryTemplate);
      mockSequelize.define = mockDefine;

      initAIQueryTemplate(mockSequelize);

      expect(mockBelongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'creatorId',
        as: 'creator',
      });
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', () => {
      const modelInstance = new AIQueryTemplate();
      
      expect(modelInstance).toHaveProperty('name');
      expect(modelInstance).toHaveProperty('displayName');
      expect(modelInstance).toHaveProperty('templateSql');
      expect(modelInstance).toHaveProperty('exampleQueries');
      expect(modelInstance).toHaveProperty('keywords');
      expect(modelInstance).toHaveProperty('allowedRoles');
      expect(modelInstance).toHaveProperty('difficulty');
      expect(modelInstance).toHaveProperty('usageCount');
      expect(modelInstance).toHaveProperty('successRate');
      expect(modelInstance).toHaveProperty('avgExecutionTime');
      expect(modelInstance).toHaveProperty('isActive');
    });

    it('should validate unique constraint on name', () => {
      const modelInstance = new AIQueryTemplate();
      modelInstance.name = 'unique-template-name';
      
      expect(modelInstance.name).toBe('unique-template-name');
    });

    it('should validate enum values for difficulty', () => {
      const modelInstance = new AIQueryTemplate();
      
      // Test valid difficulty values
      modelInstance.difficulty = 'easy';
      expect(modelInstance.difficulty).toBe('easy');
      
      modelInstance.difficulty = 'medium';
      expect(modelInstance.difficulty).toBe('medium');
      
      modelInstance.difficulty = 'hard';
      expect(modelInstance.difficulty).toBe('hard');
    });

    it('should validate boolean value for isActive', () => {
      const modelInstance = new AIQueryTemplate();
      
      modelInstance.isActive = true;
      expect(modelInstance.isActive).toBe(true);
      
      modelInstance.isActive = false;
      expect(modelInstance.isActive).toBe(false);
    });

    it('should validate numeric values', () => {
      const modelInstance = new AIQueryTemplate();
      
      modelInstance.usageCount = 100;
      expect(modelInstance.usageCount).toBe(100);
      
      modelInstance.successRate = 0.85;
      expect(modelInstance.successRate).toBe(0.85);
      
      modelInstance.avgExecutionTime = 150;
      expect(modelInstance.avgExecutionTime).toBe(150);
    });
  });

  describe('Model Instances', () => {
    it('should create a valid model instance with minimal data', () => {
      const modelInstance = new AIQueryTemplate({
        name: 'simple_query',
        displayName: 'Simple Query',
        templateSql: 'SELECT * FROM test',
        exampleQueries: ['simple test'],
        keywords: ['test'],
        allowedRoles: ['all'],
        difficulty: 'easy',
        usageCount: 0,
        successRate: 0,
        avgExecutionTime: 0,
        isActive: true,
      });

      expect(modelInstance.name).toBe('simple_query');
      expect(modelInstance.displayName).toBe('Simple Query');
      expect(modelInstance.templateSql).toBe('SELECT * FROM test');
      expect(modelInstance.exampleQueries).toEqual(['simple test']);
      expect(modelInstance.keywords).toEqual(['test']);
      expect(modelInstance.allowedRoles).toEqual(['all']);
      expect(modelInstance.difficulty).toBe('easy');
      expect(modelInstance.usageCount).toBe(0);
      expect(modelInstance.successRate).toBe(0);
      expect(modelInstance.avgExecutionTime).toBe(0);
      expect(modelInstance.isActive).toBe(true);
    });

    it('should create a valid model instance with full data', () => {
      const parameters = {
        userId: {
          type: 'integer',
          required: true,
          description: 'User ID',
        },
        status: {
          type: 'string',
          required: false,
          description: 'User status',
          defaultValue: 'active',
          options: ['active', 'inactive', 'pending'],
        },
      };

      const modelInstance = new AIQueryTemplate({
        name: 'user_by_id',
        displayName: 'User by ID',
        description: 'Get user information by ID',
        category: 'user_management',
        templateSql: 'SELECT * FROM users WHERE id = {{userId}} AND status = {{status}}',
        parameters,
        exampleQueries: ['get user with id 1', 'show user 1', 'find user 1'],
        keywords: ['user', 'id', 'find', 'get'],
        businessDomain: 'user_management',
        allowedRoles: ['admin', 'manager', 'user'],
        difficulty: 'easy',
        usageCount: 150,
        successRate: 0.95,
        avgExecutionTime: 50,
        isActive: true,
        creatorId: 1,
      });

      expect(modelInstance.name).toBe('user_by_id');
      expect(modelInstance.displayName).toBe('User by ID');
      expect(modelInstance.description).toBe('Get user information by ID');
      expect(modelInstance.category).toBe('user_management');
      expect(modelInstance.templateSql).toBe('SELECT * FROM users WHERE id = {{userId}} AND status = {{status}}');
      expect(modelInstance.parameters).toEqual(parameters);
      expect(modelInstance.exampleQueries).toEqual(['get user with id 1', 'show user 1', 'find user 1']);
      expect(modelInstance.keywords).toEqual(['user', 'id', 'find', 'get']);
      expect(modelInstance.businessDomain).toBe('user_management');
      expect(modelInstance.allowedRoles).toEqual(['admin', 'manager', 'user']);
      expect(modelInstance.difficulty).toBe('easy');
      expect(modelInstance.usageCount).toBe(150);
      expect(modelInstance.successRate).toBe(0.95);
      expect(modelInstance.avgExecutionTime).toBe(50);
      expect(modelInstance.isActive).toBe(true);
      expect(modelInstance.creatorId).toBe(1);
    });
  });
});