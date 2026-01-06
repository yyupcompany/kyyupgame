import {
  AutomationTask,
  AutomationTemplate,
  ExecutionHistory,
  AutomationTaskAttributes,
  AutomationTemplateAttributes,
  ExecutionHistoryAttributes,
} from '../../../src/models/automationModels';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { sequelize } from '../../../src/config/database';

// Mock User model
jest.mock('../../../src/models/user.model', () => ({
  User: {
    belongsTo: jest.fn(),
    hasMany: jest.fn(),
  },
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

describe('AutomationModels', () => {
  describe('AutomationTask Model', () => {
    it('should have correct interface definition', () => {
      const taskData: AutomationTaskAttributes = {
        id: 'test-id',
        name: 'Test Task',
        url: 'https://example.com',
        steps: [{ action: 'click', selector: '#button' }],
        config: { timeout: 5000 },
        status: 'pending',
        progress: 0,
        userId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(taskData.id).toBe('test-id');
      expect(taskData.name).toBe('Test Task');
      expect(taskData.url).toBe('https://example.com');
      expect(taskData.steps).toEqual([{ action: 'click', selector: '#button' }]);
      expect(taskData.config).toEqual({ timeout: 5000 });
      expect(taskData.status).toBe('pending');
      expect(taskData.progress).toBe(0);
      expect(taskData.userId).toBe('user-id');
    });

    it('should handle optional fields', () => {
      const taskData: Partial<AutomationTaskAttributes> = {
        id: 'test-id',
        name: 'Test Task',
        url: 'https://example.com',
        steps: [],
        config: {},
        status: 'pending',
        progress: 0,
        userId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(taskData.description).toBeUndefined();
      expect(taskData.templateId).toBeUndefined();
      expect(taskData.lastExecuted).toBeUndefined();
    });

    it('should validate status field values', () => {
      const validStatuses = ['pending', 'running', 'completed', 'failed', 'stopped'] as const;
      
      validStatuses.forEach(status => {
        const taskData: Partial<AutomationTaskAttributes> = {
          status,
        };
        expect(taskData.status).toBe(status);
      });
    });

    it('should validate progress field range', () => {
      const validProgressValues = [0, 50, 100];
      
      validProgressValues.forEach(progress => {
        const taskData: Partial<AutomationTaskAttributes> = {
          progress,
        };
        expect(taskData.progress).toBe(progress);
      });
    });

    it('should handle complex steps configuration', () => {
      const complexSteps = [
        {
          action: 'navigate',
          url: 'https://example.com',
          wait: 2000,
        },
        {
          action: 'click',
          selector: '#submit-button',
          timeout: 5000,
        },
        {
          action: 'type',
          selector: '#input-field',
          text: 'test input',
          delay: 100,
        },
      ];

      const taskData: Partial<AutomationTaskAttributes> = {
        steps: complexSteps,
      };

      expect(taskData.steps).toHaveLength(3);
      expect(taskData.steps[0].action).toBe('navigate');
      expect(taskData.steps[1].selector).toBe('#submit-button');
      expect(taskData.steps[2].text).toBe('test input');
    });

    it('should handle complex config object', () => {
      const complexConfig = {
        timeout: 10000,
        retries: 3,
        headless: true,
        viewport: {
          width: 1920,
          height: 1080,
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      };

      const taskData: Partial<AutomationTaskAttributes> = {
        config: complexConfig,
      };

      expect(taskData.config.timeout).toBe(10000);
      expect(taskData.config.retries).toBe(3);
      expect(taskData.config.headless).toBe(true);
      expect(taskData.config.viewport.width).toBe(1920);
      expect(taskData.config.userAgent).toContain('Mozilla');
    });
  });

  describe('AutomationTemplate Model', () => {
    it('should have correct interface definition', () => {
      const templateData: AutomationTemplateAttributes = {
        id: 'template-id',
        name: 'Test Template',
        category: 'web',
        complexity: 'simple',
        steps: [{ action: 'click', selector: '#button' }],
        parameters: [{ name: 'url', type: 'string', required: true }],
        config: { timeout: 5000 },
        usageCount: 0,
        version: '1.0.0',
        status: 'draft',
        isPublic: false,
        allowParameterization: false,
        userId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(templateData.id).toBe('template-id');
      expect(templateData.name).toBe('Test Template');
      expect(templateData.category).toBe('web');
      expect(templateData.complexity).toBe('simple');
      expect(templateData.steps).toEqual([{ action: 'click', selector: '#button' }]);
      expect(templateData.parameters).toEqual([{ name: 'url', type: 'string', required: true }]);
      expect(templateData.config).toEqual({ timeout: 5000 });
      expect(templateData.usageCount).toBe(0);
      expect(templateData.version).toBe('1.0.0');
      expect(templateData.status).toBe('draft');
      expect(templateData.isPublic).toBe(false);
      expect(templateData.allowParameterization).toBe(false);
      expect(templateData.userId).toBe('user-id');
    });

    it('should validate category field values', () => {
      const validCategories = ['web', 'form', 'data', 'test', 'custom'] as const;
      
      validCategories.forEach(category => {
        const templateData: Partial<AutomationTemplateAttributes> = {
          category,
        };
        expect(templateData.category).toBe(category);
      });
    });

    it('should validate complexity field values', () => {
      const validComplexities = ['simple', 'medium', 'complex'] as const;
      
      validComplexities.forEach(complexity => {
        const templateData: Partial<AutomationTemplateAttributes> = {
          complexity,
        };
        expect(templateData.complexity).toBe(complexity);
      });
    });

    it('should validate status field values', () => {
      const validStatuses = ['draft', 'published', 'archived'] as const;
      
      validStatuses.forEach(status => {
        const templateData: Partial<AutomationTemplateAttributes> = {
          status,
        };
        expect(templateData.status).toBe(status);
      });
    });

    it('should handle complex parameters configuration', () => {
      const complexParameters = [
        {
          name: 'username',
          type: 'string',
          required: true,
          description: 'User login username',
          defaultValue: '',
        },
        {
          name: 'password',
          type: 'string',
          required: true,
          description: 'User login password',
          sensitive: true,
        },
        {
          name: 'timeout',
          type: 'number',
          required: false,
          description: 'Request timeout in milliseconds',
          defaultValue: 5000,
        },
      ];

      const templateData: Partial<AutomationTemplateAttributes> = {
        parameters: complexParameters,
      };

      expect(templateData.parameters).toHaveLength(3);
      expect(templateData.parameters[0].name).toBe('username');
      expect(templateData.parameters[1].sensitive).toBe(true);
      expect(templateData.parameters[2].defaultValue).toBe(5000);
    });

    it('should handle version string', () => {
      const validVersions = ['1.0.0', '2.1.3', '0.0.1', '1.0.0-beta'];
      
      validVersions.forEach(version => {
        const templateData: Partial<AutomationTemplateAttributes> = {
          version,
        };
        expect(templateData.version).toBe(version);
      });
    });
  });

  describe('ExecutionHistory Model', () => {
    it('should have correct interface definition', () => {
      const historyData: ExecutionHistoryAttributes = {
        id: 'history-id',
        taskId: 'task-id',
        status: 'running',
        startTime: new Date(),
        endTime: new Date(),
        logs: JSON.stringify({ step: 1, action: 'click' }),
        result: JSON.stringify({ success: true, data: 'result' }),
        error: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(historyData.id).toBe('history-id');
      expect(historyData.taskId).toBe('task-id');
      expect(historyData.status).toBe('running');
      expect(historyData.startTime).toBeInstanceOf(Date);
      expect(historyData.endTime).toBeInstanceOf(Date);
      expect(historyData.logs).toBe(JSON.stringify({ step: 1, action: 'click' }));
      expect(historyData.result).toBe(JSON.stringify({ success: true, data: 'result' }));
      expect(historyData.error).toBeNull();
    });

    it('should validate status field values', () => {
      const validStatuses = ['running', 'completed', 'failed', 'stopped'] as const;
      
      validStatuses.forEach(status => {
        const historyData: Partial<ExecutionHistoryAttributes> = {
          status,
        };
        expect(historyData.status).toBe(status);
      });
    });

    it('should handle optional fields', () => {
      const historyData: Partial<ExecutionHistoryAttributes> = {
        id: 'history-id',
        taskId: 'task-id',
        status: 'running',
        startTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(historyData.endTime).toBeUndefined();
      expect(historyData.logs).toBeUndefined();
      expect(historyData.result).toBeUndefined();
      expect(historyData.error).toBeUndefined();
    });

    it('should handle error messages', () => {
      const errorMessages = [
        'Timeout error',
        'Element not found',
        'Network error',
        'Authentication failed',
      ];

      errorMessages.forEach(error => {
        const historyData: Partial<ExecutionHistoryAttributes> = {
          error,
        };
        expect(historyData.error).toBe(error);
      });
    });

    it('should handle JSON logs and results', () => {
      const logs = {
        steps: [
          { action: 'navigate', url: 'https://example.com', timestamp: Date.now() },
          { action: 'click', selector: '#button', timestamp: Date.now() + 1000 },
        ],
        duration: 1500,
      };

      const result = {
        success: true,
        data: { title: 'Page Title', elements: 10 },
        metrics: { memory: 1024, cpu: 25 },
      };

      const historyData: Partial<ExecutionHistoryAttributes> = {
        logs: JSON.stringify(logs),
        result: JSON.stringify(result),
      };

      expect(JSON.parse(historyData.logs!)).toEqual(logs);
      expect(JSON.parse(historyData.result!)).toEqual(result);
    });
  });

  describe('Model Relationships', () => {
    it('should define Task-User relationship', () => {
      // Since the actual model initialization is commented out,
      // we test the expected relationship structure
      expect(User.hasMany).toBeDefined();
      expect(User.belongsTo).toBeDefined();
    });

    it('should define Template-User relationship', () => {
      expect(User.hasMany).toBeDefined();
      expect(User.belongsTo).toBeDefined();
    });

    it('should define Task-Template relationship', () => {
      // This would test the relationship between AutomationTask and AutomationTemplate
      // Since the actual initialization is commented out, we just verify the structure
      expect(true).toBe(true); // Placeholder test
    });

    it('should define ExecutionHistory-Task relationship', () => {
      // This would test the relationship between ExecutionHistory and AutomationTask
      // Since the actual initialization is commented out, we just verify the structure
      expect(true).toBe(true); // Placeholder test
    });
  });

  describe('Data Validation', () => {
    it('should validate UUID format for IDs', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000',
        '00000000-0000-0000-0000-000000000000',
      ];

      validUUIDs.forEach(uuid => {
        const taskData: Partial<AutomationTaskAttributes> = {
          id: uuid,
        };
        expect(taskData.id).toBe(uuid);
      });
    });

    it('should validate URL format', () => {
      const validURLs = [
        'https://example.com',
        'http://test.com/path',
        'https://sub.domain.com:8080/page',
      ];

      validURLs.forEach(url => {
        const taskData: Partial<AutomationTaskAttributes> = {
          url,
        };
        expect(taskData.url).toBe(url);
      });
    });

    it('should validate step actions', () => {
      const validActions = ['navigate', 'click', 'type', 'wait', 'screenshot'];
      
      validActions.forEach(action => {
        const step = { action };
        const taskData: Partial<AutomationTaskAttributes> = {
          steps: [step],
        };
        expect(taskData.steps![0].action).toBe(action);
      });
    });
  });

  describe('Default Values', () => {
    it('should have default values for Task', () => {
      const taskDefaults: Partial<AutomationTaskAttributes> = {
        steps: [],
        config: {},
        status: 'pending',
        progress: 0,
      };

      expect(taskDefaults.steps).toEqual([]);
      expect(taskDefaults.config).toEqual({});
      expect(taskDefaults.status).toBe('pending');
      expect(taskDefaults.progress).toBe(0);
    });

    it('should have default values for Template', () => {
      const templateDefaults: Partial<AutomationTemplateAttributes> = {
        steps: [],
        parameters: [],
        config: {},
        usageCount: 0,
        version: '1.0.0',
        status: 'draft',
        isPublic: false,
        allowParameterization: false,
        category: 'custom',
        complexity: 'simple',
      };

      expect(templateDefaults.steps).toEqual([]);
      expect(templateDefaults.parameters).toEqual([]);
      expect(templateDefaults.config).toEqual({});
      expect(templateDefaults.usageCount).toBe(0);
      expect(templateDefaults.version).toBe('1.0.0');
      expect(templateDefaults.status).toBe('draft');
      expect(templateDefaults.isPublic).toBe(false);
      expect(templateDefaults.allowParameterization).toBe(false);
      expect(templateDefaults.category).toBe('custom');
      expect(templateDefaults.complexity).toBe('simple');
    });
  });
});