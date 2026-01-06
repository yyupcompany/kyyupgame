/**
 * MemoryIntegrationService 单元测试
 * 测试记忆集成服务的核心功能
 */

import { MemoryIntegrationService } from '../../../../../src/services/ai-operator/core/memory-integration.service';
import { vi } from 'vitest'

// 控制台错误检测变量
let consoleSpy: any

describe('MemoryIntegrationService', () => {
  let service: MemoryIntegrationService;

  beforeEach(() => {
    service = MemoryIntegrationService.getInstance();
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
      const instance1 = MemoryIntegrationService.getInstance();
      const instance2 = MemoryIntegrationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('retrieveRelevantMemories', () => {
    it('应该检索相关记忆', async () => {
      const query = '查询学生信息';
      const userId = 'user123';

      const memories = await service.retrieveRelevantMemories(query, userId);

      expect(Array.isArray(memories)).toBe(true);
    });

    it('应该限制返回数量', async () => {
      const query = '测试查询';
      const userId = 'user123';
      const limit = 5;

      const memories = await service.retrieveRelevantMemories(query, userId, limit);

      expect(memories.length).toBeLessThanOrEqual(limit);
    });

    it('应该按相关性排序', async () => {
      const query = '学生管理';
      const userId = 'user123';

      const memories = await service.retrieveRelevantMemories(query, userId);

      // 验证记忆按相关性分数降序排列
      for (let i = 1; i < memories.length; i++) {
        expect(memories[i - 1].score).toBeGreaterThanOrEqual(memories[i].score);
      }
    });

    it('应该处理空查询', async () => {
      const memories = await service.retrieveRelevantMemories('', 'user123');

      expect(Array.isArray(memories)).toBe(true);
    });

    it('应该处理不存在的用户', async () => {
      const memories = await service.retrieveRelevantMemories('测试', 'non-existent-user');

      expect(Array.isArray(memories)).toBe(true);
      expect(memories.length).toBe(0);
    });
  });

  describe('retrieveByDimension', () => {
    it('应该按维度检索记忆', async () => {
      const dimensions = ['episodic', 'semantic', 'procedural'];

      for (const dimension of dimensions) {
        const memories = await service.retrieveByDimension(
          dimension,
          '测试查询',
          'user123'
        );

        expect(Array.isArray(memories)).toBe(true);
      }
    });

    it('应该只返回指定维度的记忆', async () => {
      const memories = await service.retrieveByDimension(
        'episodic',
        '查询',
        'user123'
      );

      memories.forEach(memory => {
        expect(memory.dimension).toBe('episodic');
      });
    });

    it('应该处理无效维度', async () => {
      await expect(
        service.retrieveByDimension('invalid_dimension' as any, '查询', 'user123')
      ).rejects.toThrow();
    });
  });

  describe('storeMemory', () => {
    it('应该存储新记忆', async () => {
      const memory = {
        content: '用户查询了学生信息',
        dimension: 'episodic' as const,
        userId: 'user123',
        metadata: { action: 'query', target: 'students' }
      };

      const memoryId = await service.storeMemory(memory);

      expect(memoryId).toBeDefined();
      expect(typeof memoryId).toBe('string');
    });

    it('应该存储不同维度的记忆', async () => {
      const dimensions = ['episodic', 'semantic', 'procedural', 'emotional', 'contextual', 'social'];

      for (const dimension of dimensions) {
        const memory = {
          content: `${dimension}记忆测试`,
          dimension: dimension as any,
          userId: 'user123'
        };

        const memoryId = await service.storeMemory(memory);
        expect(memoryId).toBeDefined();
      }
    });

    it('应该包含时间戳', async () => {
      const memory = {
        content: '测试记忆',
        dimension: 'episodic' as const,
        userId: 'user123'
      };

      const memoryId = await service.storeMemory(memory);
      const stored = await service.getMemory(memoryId);

      expect(stored.timestamp).toBeDefined();
      expect(stored.timestamp).toBeInstanceOf(Date);
    });

    it('应该验证必需字段', async () => {
      const invalidMemory = {
        content: '测试'
        // 缺少 dimension 和 userId
      } as any;

      await expect(service.storeMemory(invalidMemory)).rejects.toThrow();
    });
  });

  describe('updateMemory', () => {
    it('应该更新记忆内容', async () => {
      const memoryId = await service.storeMemory({
        content: '原始内容',
        dimension: 'semantic',
        userId: 'user123'
      });

      await service.updateMemory(memoryId, {
        content: '更新后的内容'
      });

      const updated = await service.getMemory(memoryId);
      expect(updated.content).toBe('更新后的内容');
    });

    it('应该更新元数据', async () => {
      const memoryId = await service.storeMemory({
        content: '测试',
        dimension: 'episodic',
        userId: 'user123',
        metadata: { key: 'value1' }
      });

      await service.updateMemory(memoryId, {
        metadata: { key: 'value2', newKey: 'newValue' }
      });

      const updated = await service.getMemory(memoryId);
      expect(updated.metadata.key).toBe('value2');
      expect(updated.metadata.newKey).toBe('newValue');
    });

    it('应该处理不存在的记忆', async () => {
      await expect(
        service.updateMemory('non-existent-id', { content: '更新' })
      ).rejects.toThrow();
    });
  });

  describe('deleteMemory', () => {
    it('应该删除记忆', async () => {
      const memoryId = await service.storeMemory({
        content: '待删除',
        dimension: 'episodic',
        userId: 'user123'
      });

      await service.deleteMemory(memoryId);

      await expect(service.getMemory(memoryId)).rejects.toThrow();
    });

    it('应该处理不存在的记忆', async () => {
      await expect(service.deleteMemory('non-existent-id')).rejects.toThrow();
    });
  });

  describe('getMemory', () => {
    it('应该获取记忆详情', async () => {
      const memoryId = await service.storeMemory({
        content: '测试记忆',
        dimension: 'semantic',
        userId: 'user123',
        metadata: { test: true }
      });

      const memory = await service.getMemory(memoryId);

      expect(memory.id).toBe(memoryId);
      expect(memory.content).toBe('测试记忆');
      expect(memory.dimension).toBe('semantic');
      expect(memory.userId).toBe('user123');
      expect(memory.metadata.test).toBe(true);
    });

    it('应该处理不存在的记忆', async () => {
      await expect(service.getMemory('non-existent-id')).rejects.toThrow();
    });
  });

  describe('getUserMemories', () => {
    it('应该获取用户所有记忆', async () => {
      const userId = 'user123';

      await service.storeMemory({ content: '记忆1', dimension: 'episodic', userId });
      await service.storeMemory({ content: '记忆2', dimension: 'semantic', userId });
      await service.storeMemory({ content: '记忆3', dimension: 'procedural', userId });

      const memories = await service.getUserMemories(userId);

      expect(memories.length).toBeGreaterThanOrEqual(3);
      memories.forEach(memory => {
        expect(memory.userId).toBe(userId);
      });
    });

    it('应该支持分页', async () => {
      const userId = 'user456';

      for (let i = 0; i < 20; i++) {
        await service.storeMemory({
          content: `记忆${i}`,
          dimension: 'episodic',
          userId
        });
      }

      const page1 = await service.getUserMemories(userId, { page: 1, pageSize: 10 });
      const page2 = await service.getUserMemories(userId, { page: 2, pageSize: 10 });

      expect(page1.length).toBe(10);
      expect(page2.length).toBe(10);
      expect(page1[0].id).not.toBe(page2[0].id);
    });
  });

  describe('searchMemories', () => {
    it('应该搜索记忆', async () => {
      await service.storeMemory({
        content: '用户查询了学生信息',
        dimension: 'episodic',
        userId: 'user123'
      });

      const results = await service.searchMemories('学生', 'user123');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toContain('学生');
    });

    it('应该支持模糊搜索', async () => {
      await service.storeMemory({
        content: '学生管理系统',
        dimension: 'semantic',
        userId: 'user123'
      });

      const results = await service.searchMemories('学生', 'user123');

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('性能测试', () => {
    it('应该快速检索记忆', async () => {
      const startTime = Date.now();
      
      await service.retrieveRelevantMemories('测试查询', 'user123');
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该高效存储大量记忆', async () => {
      const startTime = Date.now();
      
      const promises = Array(50).fill(null).map((_, i) =>
        service.storeMemory({
          content: `记忆${i}`,
          dimension: 'episodic',
          userId: 'user123'
        })
      );

      await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });
  });

  describe('边界情况', () => {
    it('应该处理空内容', async () => {
      await expect(
        service.storeMemory({
          content: '',
          dimension: 'episodic',
          userId: 'user123'
        })
      ).rejects.toThrow();
    });

    it('应该处理超长内容', async () => {
      const longContent = 'A'.repeat(10000);
      
      const memoryId = await service.storeMemory({
        content: longContent,
        dimension: 'semantic',
        userId: 'user123'
      });

      const memory = await service.getMemory(memoryId);
      expect(memory.content.length).toBe(10000);
    });

    it('应该处理特殊字符', async () => {
      const specialContent = '特殊字符: \n\r\t"\'<>{}[]';
      
      const memoryId = await service.storeMemory({
        content: specialContent,
        dimension: 'episodic',
        userId: 'user123'
      });

      const memory = await service.getMemory(memoryId);
      expect(memory.content).toBe(specialContent);
    });

    it('应该处理复杂元数据', async () => {
      const complexMetadata = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' }
        },
        date: new Date().toISOString(),
        number: 123.456
      };

      const memoryId = await service.storeMemory({
        content: '测试',
        dimension: 'contextual',
        userId: 'user123',
        metadata: complexMetadata
      });

      const memory = await service.getMemory(memoryId);
      expect(memory.metadata).toEqual(complexMetadata);
    });
  });

  describe('记忆过期', () => {
    it('应该支持设置过期时间', async () => {
      const memoryId = await service.storeMemory({
        content: '临时记忆',
        dimension: 'episodic',
        userId: 'user123',
        expiresAt: new Date(Date.now() + 1000) // 1秒后过期
      });

      const memory = await service.getMemory(memoryId);
      expect(memory.expiresAt).toBeDefined();
    });

    it('应该自动清理过期记忆', async () => {
      const memoryId = await service.storeMemory({
        content: '已过期',
        dimension: 'episodic',
        userId: 'user123',
        expiresAt: new Date(Date.now() - 1000) // 已过期
      });

      await service.cleanupExpiredMemories();

      await expect(service.getMemory(memoryId)).rejects.toThrow();
    });
  });
});

