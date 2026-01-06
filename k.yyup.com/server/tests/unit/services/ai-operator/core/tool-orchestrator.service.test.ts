/**
 * ToolOrchestratorService 单元测试
 * 测试工具编排服务的核心功能
 */

import { ToolOrchestratorService } from '../../../../../src/services/ai-operator/core/tool-orchestrator.service';
import { vi } from 'vitest'

// 控制台错误检测变量
let consoleSpy: any

describe('ToolOrchestratorService', () => {
  let service: ToolOrchestratorService;

  beforeEach(() => {
    service = ToolOrchestratorService.getInstance();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('getInstance', () => {
    it('应该返回单例实例', () => {
      const instance1 = ToolOrchestratorService.getInstance();
      const instance2 = ToolOrchestratorService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('registerTool', () => {
    it('应该成功注册工具', () => {
      const tool = {
        name: 'test_tool',
        description: '测试工具',
        execute: jest.fn().mockResolvedValue({ success: true })
      };

      service.registerTool(tool);
      const tools = service.getAvailableTools();
      
      expect(tools).toContainEqual(expect.objectContaining({
        name: 'test_tool'
      }));
    });

    it('应该防止重复注册', () => {
      const tool = {
        name: 'duplicate_tool',
        description: '重复工具',
        execute: jest.fn()
      };

      service.registerTool(tool);
      service.registerTool(tool);
      
      const tools = service.getAvailableTools();
      const duplicates = tools.filter(t => t.name === 'duplicate_tool');
      
      expect(duplicates.length).toBe(1);
    });

    it('应该验证工具必需字段', () => {
      const invalidTool = {
        name: 'invalid_tool'
        // 缺少 description 和 execute
      } as any;

      expect(() => service.registerTool(invalidTool)).toThrow();
    });
  });

  describe('selectTools', () => {
    beforeEach(() => {
      // 注册测试工具
      service.registerTool({
        name: 'query_students',
        description: '查询学生信息',
        capabilities: ['database_query'],
        execute: jest.fn()
      })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.registerTool({
        name: 'analyze_data',
        description: '分析数据',
        capabilities: ['data_analysis'],
        execute: jest.fn()
      });

      service.registerTool({
        name: 'send_notification',
        description: '发送通知',
        capabilities: ['notification'],
        execute: jest.fn()
      });
    });

    it('应该根据能力选择工具', async () => {
      const requiredCapabilities = ['database_query'];
      const selectedTools = await service.selectTools(requiredCapabilities);

      expect(selectedTools.length).toBeGreaterThan(0);
      expect(selectedTools[0].name).toBe('query_students');
    });

    it('应该选择多个工具', async () => {
      const requiredCapabilities = ['database_query', 'data_analysis'];
      const selectedTools = await service.selectTools(requiredCapabilities);

      expect(selectedTools.length).toBe(2);
      expect(selectedTools.map(t => t.name)).toContain('query_students');
      expect(selectedTools.map(t => t.name)).toContain('analyze_data');
    });

    it('应该处理没有匹配工具的情况', async () => {
      const requiredCapabilities = ['non_existent_capability'];
      const selectedTools = await service.selectTools(requiredCapabilities);

      expect(selectedTools.length).toBe(0);
    });

    it('应该处理空能力列表', async () => {
      const selectedTools = await service.selectTools([]);

      expect(selectedTools.length).toBe(0);
    });
  });

  describe('executeTools', () => {
    it('应该成功执行单个工具', async () => {
      const mockExecute = jest.fn().mockResolvedValue({ data: 'test result' });
      const tool = {
        name: 'test_tool',
        description: '测试工具',
        execute: mockExecute
      };

      service.registerTool(tool);
      const results = await service.executeTools([tool], { query: 'test' });

      expect(results.length).toBe(1);
      expect(results[0].toolName).toBe('test_tool');
      expect(results[0].success).toBe(true);
      expect(results[0].result).toEqual({ data: 'test result' });
      expect(mockExecute).toHaveBeenCalledWith({ query: 'test' });
    });

    it('应该并行执行多个工具', async () => {
      const tool1 = {
        name: 'tool1',
        description: '工具1',
        execute: jest.fn().mockResolvedValue({ data: 'result1' })
      };

      const tool2 = {
        name: 'tool2',
        description: '工具2',
        execute: jest.fn().mockResolvedValue({ data: 'result2' })
      };

      service.registerTool(tool1);
      service.registerTool(tool2);

      const startTime = Date.now();
      const results = await service.executeTools([tool1, tool2], {});
      const duration = Date.now() - startTime;

      expect(results.length).toBe(2);
      expect(duration).toBeLessThan(100); // 并行执行应该很快
    });

    it('应该处理工具执行失败', async () => {
      const failingTool = {
        name: 'failing_tool',
        description: '失败工具',
        execute: jest.fn().mockRejectedValue(new Error('执行失败'))
      };

      service.registerTool(failingTool);
      const results = await service.executeTools([failingTool], {});

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBeDefined();
      expect(results[0].error?.message).toContain('执行失败');
    });

    it('应该处理部分工具失败', async () => {
      const successTool = {
        name: 'success_tool',
        description: '成功工具',
        execute: jest.fn().mockResolvedValue({ data: 'success' })
      };

      const failingTool = {
        name: 'failing_tool',
        description: '失败工具',
        execute: jest.fn().mockRejectedValue(new Error('失败'))
      };

      service.registerTool(successTool);
      service.registerTool(failingTool);

      const results = await service.executeTools([successTool, failingTool], {});

      expect(results.length).toBe(2);
      expect(results.find(r => r.toolName === 'success_tool')?.success).toBe(true);
      expect(results.find(r => r.toolName === 'failing_tool')?.success).toBe(false);
    });

    it('应该记录执行时间', async () => {
      const tool = {
        name: 'timed_tool',
        description: '计时工具',
        execute: jest.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          return { data: 'result' };
        })
      };

      service.registerTool(tool);
      const results = await service.executeTools([tool], {});

      expect(results[0].executionTime).toBeGreaterThan(40);
      expect(results[0].executionTime).toBeLessThan(100);
    });
  });

  describe('getAvailableTools', () => {
    it('应该返回所有已注册工具', () => {
      service.registerTool({
        name: 'tool1',
        description: '工具1',
        execute: jest.fn()
      });

      service.registerTool({
        name: 'tool2',
        description: '工具2',
        execute: jest.fn()
      });

      const tools = service.getAvailableTools();

      expect(tools.length).toBeGreaterThanOrEqual(2);
      expect(tools.map(t => t.name)).toContain('tool1');
      expect(tools.map(t => t.name)).toContain('tool2');
    });

    it('应该返回工具的元数据', () => {
      service.registerTool({
        name: 'metadata_tool',
        description: '元数据工具',
        capabilities: ['test_capability'],
        parameters: { param1: 'string' },
        execute: jest.fn()
      });

      const tools = service.getAvailableTools();
      const tool = tools.find(t => t.name === 'metadata_tool');

      expect(tool).toBeDefined();
      expect(tool?.description).toBe('元数据工具');
      expect(tool?.capabilities).toContain('test_capability');
      expect(tool?.parameters).toEqual({ param1: 'string' });
    });
  });

  describe('工具优先级', () => {
    it('应该按优先级排序工具', async () => {
      service.registerTool({
        name: 'low_priority',
        description: '低优先级',
        priority: 1,
        capabilities: ['test'],
        execute: jest.fn()
      });

      service.registerTool({
        name: 'high_priority',
        description: '高优先级',
        priority: 10,
        capabilities: ['test'],
        execute: jest.fn()
      });

      const tools = await service.selectTools(['test']);

      expect(tools[0].name).toBe('high_priority');
      expect(tools[1].name).toBe('low_priority');
    });
  });

  describe('工具依赖', () => {
    it('应该处理工具依赖关系', async () => {
      const baseTool = {
        name: 'base_tool',
        description: '基础工具',
        execute: jest.fn().mockResolvedValue({ data: 'base' })
      };

      const dependentTool = {
        name: 'dependent_tool',
        description: '依赖工具',
        dependencies: ['base_tool'],
        execute: jest.fn().mockResolvedValue({ data: 'dependent' })
      };

      service.registerTool(baseTool);
      service.registerTool(dependentTool);

      const results = await service.executeTools([dependentTool], {});

      expect(results.length).toBeGreaterThan(0);
      // 应该先执行基础工具
    });
  });

  describe('性能测试', () => {
    it('应该快速选择工具', async () => {
      // 注册多个工具
      for (let i = 0; i < 50; i++) {
        service.registerTool({
          name: `tool_${i}`,
          description: `工具${i}`,
          capabilities: [`capability_${i % 10}`],
          execute: jest.fn()
        });
      }

      const startTime = Date.now();
      await service.selectTools(['capability_5']);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(50); // 应该在50ms内完成
    });

    it('应该能处理大量并发工具执行', async () => {
      const tools = Array(20).fill(null).map((_, i) => ({
        name: `concurrent_tool_${i}`,
        description: `并发工具${i}`,
        execute: jest.fn().mockResolvedValue({ data: `result_${i}` })
      }));

      tools.forEach(tool => service.registerTool(tool));

      const startTime = Date.now();
      const results = await service.executeTools(tools, {});
      const duration = Date.now() - startTime;

      expect(results.length).toBe(20);
      expect(duration).toBeLessThan(200); // 并行执行应该很快
    });
  });

  describe('边界情况', () => {
    it('应该处理空工具列表', async () => {
      const results = await service.executeTools([], {});
      expect(results.length).toBe(0);
    });

    it('应该处理undefined参数', async () => {
      const tool = {
        name: 'test_tool',
        description: '测试工具',
        execute: jest.fn().mockResolvedValue({ data: 'result' })
      };

      service.registerTool(tool);
      const results = await service.executeTools([tool], undefined as any);

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(true);
    });

    it('应该处理工具执行超时', async () => {
      const slowTool = {
        name: 'slow_tool',
        description: '慢工具',
        timeout: 100,
        execute: jest.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          return { data: 'result' };
        })
      };

      service.registerTool(slowTool);
      const results = await service.executeTools([slowTool], {});

      expect(results[0].success).toBe(false);
      expect(results[0].error?.message).toContain('超时');
    });
  });
});

