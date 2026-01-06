/**
 * StreamingService 单元测试
 * 测试流式响应服务的核心功能
 */

import { StreamingService } from '../../../../../src/services/ai-operator/core/streaming.service';
import { vi } from 'vitest'
import { Response } from 'express';

// 控制台错误检测变量
let consoleSpy: any

describe('StreamingService', () => {
  let service: StreamingService;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    service = StreamingService.getInstance();
    
    // Mock Express Response对象
    mockResponse = {
      write: jest.fn(),
      end: jest.fn(),
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      emit: jest.fn()
    };
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
      const instance1 = StreamingService.getInstance();
      const instance2 = StreamingService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initializeStream', () => {
    it('应该初始化SSE流', () => {
      service.initializeStream(mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
    });

    it('应该设置正确的响应头', () => {
      service.initializeStream(mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledTimes(3);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      );
    });
  });

  describe('sendSSE', () => {
    it('应该发送SSE消息', () => {
      const data = { message: 'test message' };
      service.sendSSE(mockResponse as Response, 'message', data);

      expect(mockResponse.write).toHaveBeenCalled();
      const writtenData = (mockResponse.write as jest.Mock).mock.calls[0][0];
      expect(writtenData).toContain('event: message');
      expect(writtenData).toContain('test message');
    });

    it('应该正确格式化SSE数据', () => {
      const data = { text: 'Hello', timestamp: 123456 };
      service.sendSSE(mockResponse as Response, 'data', data);

      const writtenData = (mockResponse.write as jest.Mock).mock.calls[0][0];
      expect(writtenData).toContain('event: data');
      expect(writtenData).toContain('data: ');
      expect(writtenData).toContain('Hello');
    });

    it('应该处理复杂对象', () => {
      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' }
        }
      };

      service.sendSSE(mockResponse as Response, 'complex', complexData);

      expect(mockResponse.write).toHaveBeenCalled();
      const writtenData = (mockResponse.write as jest.Mock).mock.calls[0][0];
      expect(writtenData).toContain('event: complex');
    });

    it('应该添加换行符', () => {
      service.sendSSE(mockResponse as Response, 'test', { data: 'test' });

      const writtenData = (mockResponse.write as jest.Mock).mock.calls[0][0];
      expect(writtenData).toMatch(/\n\n$/); // 应该以两个换行符结束
    });
  });

  describe('streamResponse', () => {
    it('应该流式发送文本响应', async () => {
      const text = 'This is a test response';
      
      await service.streamResponse(mockResponse as Response, text);

      expect(mockResponse.write).toHaveBeenCalled();
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('应该分块发送长文本', async () => {
      const longText = 'A'.repeat(1000);
      
      await service.streamResponse(mockResponse as Response, longText, {
        chunkSize: 100
      });

      expect(mockResponse.write).toHaveBeenCalledTimes(10); // 1000/100 = 10块
    });

    it('应该支持自定义延迟', async () => {
      const text = 'Test';
      const startTime = Date.now();
      
      await service.streamResponse(mockResponse as Response, text, {
        delay: 50
      });
      
      const duration = Date.now() - startTime;
      expect(duration).toBeGreaterThanOrEqual(40); // 考虑误差
    });

    it('应该在完成时发送done事件', async () => {
      await service.streamResponse(mockResponse as Response, 'test');

      const calls = (mockResponse.write as jest.Mock).mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall).toContain('event: done');
    });
  });

  describe('streamChunks', () => {
    it('应该流式发送数据块', async () => {
      const chunks = ['chunk1', 'chunk2', 'chunk3'];
      
      await service.streamChunks(mockResponse as Response, chunks);

      expect(mockResponse.write).toHaveBeenCalledTimes(4); // 3个块 + 1个done
    });

    it('应该为每个块发送事件', async () => {
      const chunks = ['a', 'b', 'c'];
      
      await service.streamChunks(mockResponse as Response, chunks);

      const calls = (mockResponse.write as jest.Mock).mock.calls;
      expect(calls.length).toBe(4);
      expect(calls[0][0]).toContain('a');
      expect(calls[1][0]).toContain('b');
      expect(calls[2][0]).toContain('c');
    });

    it('应该处理空数组', async () => {
      await service.streamChunks(mockResponse as Response, []);

      expect(mockResponse.write).toHaveBeenCalledTimes(1); // 只有done事件
      const call = (mockResponse.write as jest.Mock).mock.calls[0][0];
      expect(call).toContain('event: done');
    });
  });

  describe('sendError', () => {
    it('应该发送错误事件', () => {
      const error = new Error('Test error');
      
      service.sendError(mockResponse as Response, error);

      expect(mockResponse.write).toHaveBeenCalled();
      const writtenData = (mockResponse.write as jest.Mock).mock.calls[0][0];
      expect(writtenData).toContain('event: error');
      expect(writtenData).toContain('Test error');
    });

    it('应该包含错误详情', () => {
      const error = new Error('Detailed error');
      error.stack = 'Error stack trace';
      
      service.sendError(mockResponse as Response, error);

      const writtenData = (mockResponse.write as jest.Mock).mock.calls[0][0];
      expect(writtenData).toContain('Detailed error');
    });

    it('应该处理非Error对象', () => {
      service.sendError(mockResponse as Response, 'String error' as any);

      expect(mockResponse.write).toHaveBeenCalled();
      const writtenData = (mockResponse.write as jest.Mock).mock.calls[0][0];
      expect(writtenData).toContain('String error');
    });
  });

  describe('closeStream', () => {
    it('应该关闭流', () => {
      service.closeStream(mockResponse as Response);

      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('应该发送完成消息', () => {
      service.closeStream(mockResponse as Response, 'Stream completed');

      expect(mockResponse.write).toHaveBeenCalled();
      expect(mockResponse.end).toHaveBeenCalled();
    });
  });

  describe('心跳机制', () => {
    it('应该发送心跳消息', () => {
      service.sendHeartbeat(mockResponse as Response);

      expect(mockResponse.write).toHaveBeenCalled();
      const writtenData = (mockResponse.write as jest.Mock).mock.calls[0][0];
      expect(writtenData).toContain(':heartbeat');
    });

    it('应该定期发送心跳', async () => {
      jest.useFakeTimers();
      
      service.startHeartbeat(mockResponse as Response, 1000);
      
      jest.advanceTimersByTime(3000);
      
      expect(mockResponse.write).toHaveBeenCalledTimes(3);
      
      service.stopHeartbeat();
      jest.useRealTimers();
    });
  });

  describe('错误处理', () => {
    it('应该处理写入错误', async () => {
      (mockResponse.write as jest.Mock).mockImplementation(() => {
        throw new Error('Write error');
      });

      await expect(
        service.streamResponse(mockResponse as Response, 'test')
      ).rejects.toThrow();
    });

    it('应该处理响应已关闭', () => {
      (mockResponse.write as jest.Mock).mockReturnValue(false);

      expect(() => {
        service.sendSSE(mockResponse as Response, 'test', {});
      }).not.toThrow();
    });
  });

  describe('性能测试', () => {
    it('应该快速发送小消息', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        service.sendSSE(mockResponse as Response, 'test', { data: i });
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该高效处理大量数据块', async () => {
      const chunks = Array(1000).fill('test chunk');
      
      const startTime = Date.now();
      await service.streamChunks(mockResponse as Response, chunks, { delay: 0 });
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });
  });

  describe('边界情况', () => {
    it('应该处理空字符串', async () => {
      await service.streamResponse(mockResponse as Response, '');

      expect(mockResponse.write).toHaveBeenCalled();
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('应该处理null数据', () => {
      service.sendSSE(mockResponse as Response, 'test', null as any);

      expect(mockResponse.write).toHaveBeenCalled();
    });

    it('应该处理undefined数据', () => {
      service.sendSSE(mockResponse as Response, 'test', undefined as any);

      expect(mockResponse.write).toHaveBeenCalled();
    });

    it('应该处理特殊字符', () => {
      const specialData = {
        text: 'Line1\nLine2\rLine3\r\nLine4',
        emoji: '😀🎉'
      };

      service.sendSSE(mockResponse as Response, 'special', specialData);

      expect(mockResponse.write).toHaveBeenCalled();
    });

    it('应该处理超大对象', () => {
      const largeObject = {
        data: 'x'.repeat(10000),
        nested: Array(100).fill({ key: 'value' })
      };

      expect(() => {
        service.sendSSE(mockResponse as Response, 'large', largeObject);
      }).not.toThrow();
    });
  });

  describe('流控制', () => {
    it('应该支持暂停和恢复', async () => {
      const chunks = ['a', 'b', 'c', 'd', 'e'];
      
      let pauseCount = 0;
      (mockResponse.write as jest.Mock).mockImplementation(() => {
        pauseCount++;
        return pauseCount !== 3; // 第3次返回false表示需要暂停
      });

      await service.streamChunks(mockResponse as Response, chunks);

      expect(mockResponse.write).toHaveBeenCalled();
    });
  });
});

