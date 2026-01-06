/**
 * PromptBuilderService 单元测试
 * 测试提示词构建服务的核心功能
 */

import { PromptBuilderService, PromptContext } from '../../../../../src/services/ai-operator/core/prompt-builder.service';
import { vi } from 'vitest'

// 控制台错误检测变量
let consoleSpy: any

describe('PromptBuilderService', () => {
  let service: PromptBuilderService;

  beforeEach(() => {
    service = PromptBuilderService.getInstance();
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
      const instance1 = PromptBuilderService.getInstance();
      const instance2 = PromptBuilderService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('buildSystemPrompt', () => {
    it('应该构建基础系统提示词', () => {
      const context: PromptContext = {};
      const prompt = service.buildSystemPrompt(context);

      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain('幼儿园管理系统');
    });

    it('应该包含用户角色信息', () => {
      const context: PromptContext = {
        userRole: 'ADMIN'
      };
      const prompt = service.buildSystemPrompt(context);

      expect(prompt).toContain('管理员');
    });

    it('应该包含工具信息', () => {
      const context: PromptContext = {
        tools: [
          { name: 'query_students', description: '查询学生信息' },
          { name: 'add_student', description: '添加学生' }
        ]
      };
      const prompt = service.buildSystemPrompt(context);

      expect(prompt).toContain('query_students');
      expect(prompt).toContain('add_student');
    });

    it('应该包含页面上下文', () => {
      const context: PromptContext = {
        pageContext: {
          pageName: 'student-management',
          pageTitle: '学生管理'
        }
      };
      const prompt = service.buildSystemPrompt(context);

      expect(prompt).toContain('学生管理');
    });
  });

  describe('buildUserPrompt', () => {
    it('应该构建用户提示词', () => {
      const query = '查询所有学生';
      const context: PromptContext = {};
      const prompt = service.buildUserPrompt(query, context);

      expect(prompt).toBeDefined();
      expect(prompt).toContain('查询所有学生');
    });

    it('应该包含记忆上下文', () => {
      const query = '继续上次的操作';
      const context: PromptContext = {
        memoryContext: [
          { content: '上次查询了学生信息', timestamp: Date.now() }
        ]
      };
      const prompt = service.buildUserPrompt(query, context);

      expect(prompt).toContain('上次查询了学生信息');
    });

    it('应该包含对话历史', () => {
      const query = '那他的成绩呢？';
      const context: PromptContext = {
        conversationHistory: [
          { role: 'user', content: '查询张三的信息' },
          { role: 'assistant', content: '张三是一年级学生' }
        ]
      };
      const prompt = service.buildUserPrompt(query, context);

      expect(prompt).toContain('张三');
    });

    it('应该包含工具执行结果', () => {
      const query = '分析这些数据';
      const context: PromptContext = {
        toolResults: [
          { toolName: 'query_students', result: { count: 100 } }
        ]
      };
      const prompt = service.buildUserPrompt(query, context);

      expect(prompt).toContain('query_students');
    });
  });

  describe('buildMessages', () => {
    it('应该构建完整的消息数组', () => {
      const query = '查询学生信息';
      const context: PromptContext = {
        userRole: 'TEACHER'
      };
      const messages = service.buildMessages(query, context);

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThanOrEqual(2);
      expect(messages[0].role).toBe('system');
      expect(messages[messages.length - 1].role).toBe('user');
    });

    it('应该包含对话历史', () => {
      const query = '继续';
      const context: PromptContext = {
        conversationHistory: [
          { role: 'user', content: '查询学生' },
          { role: 'assistant', content: '找到100个学生' }
        ]
      };
      const messages = service.buildMessages(query, context);

      expect(messages.length).toBeGreaterThan(3);
      expect(messages.some(m => m.content.includes('查询学生'))).toBe(true);
    });
  });

  describe('formatToolsForPrompt', () => {
    it('应该格式化工具列表', () => {
      const tools = [
        { name: 'query_students', description: '查询学生', parameters: {} },
        { name: 'add_student', description: '添加学生', parameters: {} }
      ];
      const formatted = service.formatToolsForPrompt(tools);

      expect(formatted).toBeDefined();
      expect(formatted).toContain('query_students');
      expect(formatted).toContain('add_student');
    });

    it('应该处理空工具列表', () => {
      const tools: any[] = [];
      const formatted = service.formatToolsForPrompt(tools);

      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('formatMemoryContext', () => {
    it('应该格式化记忆上下文', () => {
      const memories = [
        { content: '用户喜欢查看学生信息', timestamp: Date.now() },
        { content: '用户经常使用导出功能', timestamp: Date.now() }
      ];
      const formatted = service.formatMemoryContext(memories);

      expect(formatted).toBeDefined();
      expect(formatted).toContain('学生信息');
      expect(formatted).toContain('导出功能');
    });

    it('应该处理空记忆', () => {
      const memories: any[] = [];
      const formatted = service.formatMemoryContext(memories);

      expect(formatted).toBeDefined();
    });
  });

  describe('formatConversationHistory', () => {
    it('应该格式化对话历史', () => {
      const history = [
        { role: 'user', content: '你好' },
        { role: 'assistant', content: '你好，有什么可以帮助你的？' },
        { role: 'user', content: '查询学生' }
      ];
      const formatted = service.formatConversationHistory(history);

      expect(formatted).toBeDefined();
      expect(formatted).toContain('你好');
      expect(formatted).toContain('查询学生');
    });

    it('应该限制历史长度', () => {
      const history = Array(20).fill(null).map((_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `消息${i}`
      }));
      const formatted = service.formatConversationHistory(history, 5);

      expect(formatted).toBeDefined();
      // 应该只包含最近的5条消息
      const messageCount = (formatted.match(/消息/g) || []).length;
      expect(messageCount).toBeLessThanOrEqual(5);
    });
  });

  describe('优化提示词长度', () => {
    it('应该控制提示词总长度', () => {
      const query = '查询学生信息';
      const context: PromptContext = {
        userRole: 'ADMIN',
        tools: Array(50).fill(null).map((_, i) => ({
          name: `tool_${i}`,
          description: `工具${i}的描述`.repeat(10)
        })),
        memoryContext: Array(100).fill(null).map((_, i) => ({
          content: `记忆${i}`.repeat(20),
          timestamp: Date.now()
        })),
        conversationHistory: Array(50).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `消息${i}`.repeat(10)
        }))
      };

      const messages = service.buildMessages(query, context);
      const totalLength = messages.reduce((sum, m) => sum + m.content.length, 0);

      // 总长度应该在合理范围内（例如不超过10000字符）
      expect(totalLength).toBeLessThan(10000);
    });
  });

  describe('特殊字符处理', () => {
    it('应该正确处理特殊字符', () => {
      const query = '查询"张三"的信息';
      const context: PromptContext = {};
      const prompt = service.buildUserPrompt(query, context);

      expect(prompt).toContain('张三');
    });

    it('应该处理换行符', () => {
      const query = '查询学生\n并生成报告';
      const context: PromptContext = {};
      const prompt = service.buildUserPrompt(query, context);

      expect(prompt).toBeDefined();
    });

    it('应该处理HTML标签', () => {
      const query = '查询<script>alert("test")</script>学生';
      const context: PromptContext = {};
      const prompt = service.buildUserPrompt(query, context);

      expect(prompt).toBeDefined();
      // 应该转义或移除HTML标签
    });
  });

  describe('性能测试', () => {
    it('应该快速构建提示词', () => {
      const query = '查询学生信息';
      const context: PromptContext = {
        userRole: 'TEACHER',
        tools: [{ name: 'query', description: '查询' }]
      };

      const startTime = Date.now();
      service.buildMessages(query, context);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50); // 应该在50ms内完成
    });

    it('应该能处理并发构建', async () => {
      const queries = Array(10).fill(null).map((_, i) => `查询${i}`);
      const context: PromptContext = { userRole: 'ADMIN' };

      const promises = queries.map(query => 
        Promise.resolve(service.buildMessages(query, context))
      );
      const results = await Promise.all(promises);

      expect(results.length).toBe(10);
      results.forEach(messages => {
        expect(Array.isArray(messages)).toBe(true);
        expect(messages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('边界情况', () => {
    it('应该处理空查询', () => {
      const query = '';
      const context: PromptContext = {};
      const prompt = service.buildUserPrompt(query, context);

      expect(prompt).toBeDefined();
    });

    it('应该处理undefined上下文', () => {
      const query = '查询学生';
      const messages = service.buildMessages(query, undefined as any);

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThan(0);
    });

    it('应该处理null值', () => {
      const query = '查询学生';
      const context: PromptContext = {
        userRole: null as any,
        tools: null as any,
        memoryContext: null as any
      };
      const messages = service.buildMessages(query, context);

      expect(Array.isArray(messages)).toBe(true);
    });
  });
});

