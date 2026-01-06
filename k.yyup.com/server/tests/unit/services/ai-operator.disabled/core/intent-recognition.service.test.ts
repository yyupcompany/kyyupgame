/**
 * IntentRecognitionService 单元测试
 * 测试意图识别服务的核心功能
 */

import { IntentRecognitionService } from '../../../../../src/services/ai-operator/core/intent-recognition.service';
import { vi } from 'vitest'
import { IntentType, ComplexityLevel } from '../../../../../src/services/ai-operator/core/intent-recognition.service';

// 控制台错误检测变量
let consoleSpy: any

describe('IntentRecognitionService', () => {
  let service: IntentRecognitionService;

  beforeEach(() => {
    service = IntentRecognitionService.getInstance();
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
      const instance1 = IntentRecognitionService.getInstance();
      const instance2 = IntentRecognitionService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('recognizeIntent', () => {
    it('应该识别导航意图', async () => {
      const query = '打开学生管理页面';
      const result = await service.recognizeIntent(query);

      expect(result.intent).toBe(IntentType.NAVIGATION);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.keywords).toContain('打开');
    });

    it('应该识别查询意图', async () => {
      const query = '查询所有学生信息';
      const result = await service.recognizeIntent(query);

      expect(result.intent).toBe(IntentType.QUERY);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.keywords).toContain('查询');
    });

    it('应该识别操作意图', async () => {
      const query = '添加一个新学生';
      const result = await service.recognizeIntent(query);

      expect(result.intent).toBe(IntentType.OPERATION);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.keywords).toContain('添加');
    });

    it('应该识别分析意图', async () => {
      const query = '分析学生成绩趋势';
      const result = await service.recognizeIntent(query);

      expect(result.intent).toBe(IntentType.ANALYSIS);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.keywords).toContain('分析');
    });

    it('应该识别创建意图', async () => {
      const query = '创建一个新班级';
      const result = await service.recognizeIntent(query);

      expect(result.intent).toBe(IntentType.CREATION);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.keywords).toContain('创建');
    });

    it('应该识别修改意图', async () => {
      const query = '修改学生的姓名';
      const result = await service.recognizeIntent(query);

      expect(result.intent).toBe(IntentType.MODIFICATION);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.keywords).toContain('修改');
    });

    it('应该识别删除意图', async () => {
      const query = '删除这个学生';
      const result = await service.recognizeIntent(query);

      expect(result.intent).toBe(IntentType.DELETION);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.keywords).toContain('删除');
    });

    it('应该识别对话意图', async () => {
      const query = '你好，今天天气怎么样';
      const result = await service.recognizeIntent(query);

      expect(result.intent).toBe(IntentType.CONVERSATION);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.keywords).toContain('你好');
    });

    it('应该识别未知意图', async () => {
      const query = 'asdfghjkl';
      const result = await service.recognizeIntent(query);

      expect(result.intent).toBe(IntentType.UNKNOWN);
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('evaluateComplexity', () => {
    it('应该评估简单复杂度', async () => {
      const query = '查询学生';
      const result = await service.recognizeIntent(query);

      expect(result.complexity).toBe(ComplexityLevel.SIMPLE);
    });

    it('应该评估中等复杂度', async () => {
      const query = '查询所有班级的学生信息并按成绩排序';
      const result = await service.recognizeIntent(query);

      expect(result.complexity).toBe(ComplexityLevel.MODERATE);
    });

    it('应该评估复杂复杂度', async () => {
      const query = '分析过去三个月的学生成绩趋势，生成报告，并发送给所有老师';
      const result = await service.recognizeIntent(query);

      expect(result.complexity).toBe(ComplexityLevel.COMPLEX);
    });
  });

  describe('identifyRequiredCapabilities', () => {
    it('应该识别数据库查询能力', async () => {
      const query = '查询学生信息';
      const result = await service.recognizeIntent(query);

      expect(result.requiredCapabilities).toContain('database_query');
    });

    it('应该识别数据分析能力', async () => {
      const query = '分析学生成绩';
      const result = await service.recognizeIntent(query);

      expect(result.requiredCapabilities).toContain('data_analysis');
    });

    it('应该识别文件操作能力', async () => {
      const query = '导出学生名单到Excel';
      const result = await service.recognizeIntent(query);

      expect(result.requiredCapabilities).toContain('file_operation');
    });

    it('应该识别通知发送能力', async () => {
      const query = '发送通知给所有家长';
      const result = await service.recognizeIntent(query);

      expect(result.requiredCapabilities).toContain('notification');
    });

    it('应该识别报告生成能力', async () => {
      const query = '生成月度报告';
      const result = await service.recognizeIntent(query);

      expect(result.requiredCapabilities).toContain('report_generation');
    });

    it('应该识别多个能力', async () => {
      const query = '查询学生信息并生成报告发送给老师';
      const result = await service.recognizeIntent(query);

      expect(result.requiredCapabilities.length).toBeGreaterThan(1);
      expect(result.requiredCapabilities).toContain('database_query');
      expect(result.requiredCapabilities).toContain('report_generation');
      expect(result.requiredCapabilities).toContain('notification');
    });
  });

  describe('extractEntities', () => {
    it('应该提取实体信息', async () => {
      const query = '查询张三的成绩';
      const result = await service.recognizeIntent(query);

      expect(result.entities).toBeDefined();
      expect(result.entities.length).toBeGreaterThan(0);
    });

    it('应该提取多个实体', async () => {
      const query = '查询一年级三班的所有学生';
      const result = await service.recognizeIntent(query);

      expect(result.entities).toBeDefined();
      expect(result.entities.length).toBeGreaterThan(0);
    });
  });

  describe('带上下文的意图识别', () => {
    it('应该使用上下文提高识别准确度', async () => {
      const query = '查看详情';
      const context = {
        previousIntent: IntentType.QUERY,
        currentPage: 'student-list'
      };

      const result = await service.recognizeIntent(query, context);

      expect(result.intent).toBe(IntentType.QUERY);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('应该从上下文中提取实体', async () => {
      const query = '修改他的姓名';
      const context = {
        selectedStudent: { id: '123', name: '张三' }
      };

      const result = await service.recognizeIntent(query, context);

      expect(result.intent).toBe(IntentType.MODIFICATION);
      expect(result.entities).toBeDefined();
    });
  });

  describe('边界情况', () => {
    it('应该处理空查询', async () => {
      const query = '';
      const result = await service.recognizeIntent(query);

      expect(result.intent).toBe(IntentType.UNKNOWN);
      expect(result.confidence).toBe(0);
    });

    it('应该处理特殊字符', async () => {
      const query = '!@#$%^&*()';
      const result = await service.recognizeIntent(query);

      expect(result.intent).toBe(IntentType.UNKNOWN);
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('应该处理超长查询', async () => {
      const query = '查询'.repeat(100);
      const result = await service.recognizeIntent(query);

      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
    });

    it('应该处理混合语言', async () => {
      const query = 'query student information 查询学生信息';
      const result = await service.recognizeIntent(query);

      expect(result.intent).toBe(IntentType.QUERY);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内完成识别', async () => {
      const query = '查询学生信息';
      const startTime = Date.now();
      
      await service.recognizeIntent(query);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该能处理并发请求', async () => {
      const queries = [
        '查询学生',
        '添加班级',
        '删除老师',
        '分析成绩',
        '生成报告'
      ];

      const promises = queries.map(query => service.recognizeIntent(query));
      const results = await Promise.all(promises);

      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.intent).toBeDefined();
      });
    });
  });
});

