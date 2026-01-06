/**
 * 端口工具测试
 * 测试端口检查和管理功能
 */

import { execSync } from 'child_process';
import { vi } from 'vitest'
import {
  isPortInUse,
  getProcessesOnPort,
  killProcessesOnPort,
  ensurePortAvailable
} from '../../../src/utils/port-utils';

// Mock外部依赖
jest.mock('child_process');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;


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

describe('Port Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isPortInUse', () => {
    it('应该检测到端口被占用', () => {
      mockExecSync.mockReturnValue('12345\n');
      
      const result = isPortInUse(3000);
      
      expect(result).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith('lsof -i:3000 -t', { encoding: 'utf-8' });
    });

    it('应该检测到端口未被占用', () => {
      mockExecSync.mockReturnValue('');
      
      const result = isPortInUse(3000);
      
      expect(result).toBe(false);
      expect(mockExecSync).toHaveBeenCalledWith('lsof -i:3000 -t', { encoding: 'utf-8' });
    });

    it('应该处理命令执行失败的情况', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });
      
      const result = isPortInUse(3000);
      
      expect(result).toBe(false);
    });

    it('应该处理空白输出', () => {
      mockExecSync.mockReturnValue('   \n  \n  ');
      
      const result = isPortInUse(3000);
      
      expect(result).toBe(false);
    });

    it('应该处理多个进程ID', () => {
      mockExecSync.mockReturnValue('12345\n67890\n');
      
      const result = isPortInUse(8080);
      
      expect(result).toBe(true);
    });
  });

  describe('getProcessesOnPort', () => {
    it('应该返回占用端口的进程ID列表', () => {
      mockExecSync.mockReturnValue('12345\n67890\n');
      
      const result = getProcessesOnPort(3000);
      
      expect(result).toEqual([12345, 67890]);
      expect(mockExecSync).toHaveBeenCalledWith('lsof -i:3000 -t', { encoding: 'utf-8' });
    });

    it('应该返回空数组当没有进程占用端口时', () => {
      mockExecSync.mockReturnValue('');
      
      const result = getProcessesOnPort(3000);
      
      expect(result).toEqual([]);
    });

    it('应该处理命令执行失败', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });
      
      const result = getProcessesOnPort(3000);
      
      expect(result).toEqual([]);
    });

    it('应该过滤空行', () => {
      mockExecSync.mockReturnValue('12345\n\n67890\n  \n');
      
      const result = getProcessesOnPort(3000);
      
      expect(result).toEqual([12345, 67890]);
    });

    it('应该处理单个进程ID', () => {
      mockExecSync.mockReturnValue('12345\n');
      
      const result = getProcessesOnPort(3000);
      
      expect(result).toEqual([12345]);
    });

    it('应该处理包含空格的输出', () => {
      mockExecSync.mockReturnValue('  12345  \n  67890  \n');
      
      const result = getProcessesOnPort(3000);
      
      expect(result).toEqual([12345, 67890]);
    });
  });

  describe('killProcessesOnPort', () => {
    it('应该杀死占用端口的进程', () => {
      // 第一次调用返回进程ID列表
      mockExecSync
        .mockReturnValueOnce('12345\n67890\n')  // getProcessesOnPort
        .mockReturnValueOnce('')                // kill -9 12345
        .mockReturnValueOnce('')                // kill -9 67890
        .mockReturnValueOnce('');               // 验证进程是否被杀死

      const result = killProcessesOnPort(3000);
      
      expect(result).toEqual([12345, 67890]);
      expect(mockExecSync).toHaveBeenCalledWith('lsof -i:3000 -t', { encoding: 'utf-8' });
      expect(mockExecSync).toHaveBeenCalledWith('kill -9 12345', { encoding: 'utf-8' });
      expect(mockExecSync).toHaveBeenCalledWith('kill -9 67890', { encoding: 'utf-8' });
    });

    it('应该处理没有进程占用端口的情况', () => {
      mockExecSync.mockReturnValue('');
      
      const result = killProcessesOnPort(3000);
      
      expect(result).toEqual([]);
      expect(mockExecSync).toHaveBeenCalledTimes(1); // 只调用getProcessesOnPort
    });

    it('应该处理杀死进程失败的情况', () => {
      mockExecSync
        .mockReturnValueOnce('12345\n')         // getProcessesOnPort
        .mockImplementationOnce(() => {         // kill -9 12345 失败
          throw new Error('Kill failed');
        })
        .mockReturnValueOnce('12345\n');        // 验证进程仍然存在

      const result = killProcessesOnPort(3000);
      
      expect(result).toEqual([]); // 没有成功杀死的进程
    });

    it('应该处理部分进程杀死失败的情况', () => {
      mockExecSync
        .mockReturnValueOnce('12345\n67890\n')  // getProcessesOnPort
        .mockReturnValueOnce('')                // kill -9 12345 成功
        .mockImplementationOnce(() => {         // kill -9 67890 失败
          throw new Error('Kill failed');
        })
        .mockReturnValueOnce('67890\n');        // 验证67890仍然存在

      const result = killProcessesOnPort(3000);
      
      expect(result).toEqual([12345]); // 只有12345被成功杀死
    });

    it('应该处理获取进程列表失败的情况', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });
      
      const result = killProcessesOnPort(3000);
      
      expect(result).toEqual([]);
    });
  });

  describe('ensurePortAvailable', () => {
    it('应该返回true当端口未被占用时', () => {
      mockExecSync.mockReturnValue(''); // 端口未被占用
      
      const result = ensurePortAvailable(3000);
      
      expect(result).toBe(true);
    });

    it('应该成功释放被占用的端口', () => {
      mockExecSync
        .mockReturnValueOnce('12345\n')         // 第一次检查：端口被占用
        .mockReturnValueOnce('12345\n')         // getProcessesOnPort
        .mockReturnValueOnce('')                // kill -9 12345
        .mockReturnValueOnce('')                // 验证进程被杀死
        .mockReturnValueOnce('');               // 最终检查：端口可用

      const result = ensurePortAvailable(3000);
      
      expect(result).toBe(true);
    });

    it('应该返回false当无法释放端口时', () => {
      mockExecSync
        .mockReturnValueOnce('12345\n')         // 第一次检查：端口被占用
        .mockReturnValueOnce('12345\n')         // getProcessesOnPort
        .mockReturnValueOnce('')                // kill -9 12345
        .mockReturnValueOnce('12345\n')         // 验证进程仍然存在
        .mockReturnValueOnce('12345\n');        // 最终检查：端口仍被占用

      const result = ensurePortAvailable(3000);
      
      expect(result).toBe(false);
    });

    it('应该处理杀死进程过程中的错误', () => {
      mockExecSync
        .mockReturnValueOnce('12345\n')         // 第一次检查：端口被占用
        .mockImplementationOnce(() => {         // getProcessesOnPort失败
          throw new Error('Command failed');
        })
        .mockReturnValueOnce('12345\n');        // 最终检查：端口仍被占用

      const result = ensurePortAvailable(3000);
      
      expect(result).toBe(false);
    });
  });

  describe('边界情况测试', () => {
    it('应该处理无效端口号', () => {
      expect(() => isPortInUse(-1)).not.toThrow();
      expect(() => isPortInUse(0)).not.toThrow();
      expect(() => isPortInUse(65536)).not.toThrow();
    });

    it('应该处理非常大的进程ID', () => {
      mockExecSync.mockReturnValue('999999999\n');
      
      const result = getProcessesOnPort(3000);
      
      expect(result).toEqual([999999999]);
    });

    it('应该处理包含非数字字符的输出', () => {
      mockExecSync.mockReturnValue('12345\nabc\n67890\n');
      
      const result = getProcessesOnPort(3000);
      
      expect(result).toEqual([12345, NaN, 67890]);
    });

    it('应该处理多次连续调用', () => {
      mockExecSync.mockReturnValue('12345\n');
      
      const result1 = isPortInUse(3000);
      const result2 = isPortInUse(3001);
      const result3 = isPortInUse(3002);
      
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
      expect(mockExecSync).toHaveBeenCalledTimes(3);
    });

    it('应该处理系统命令超时', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command timeout');
      });
      
      expect(() => isPortInUse(3000)).not.toThrow();
      expect(() => getProcessesOnPort(3000)).not.toThrow();
      expect(() => killProcessesOnPort(3000)).not.toThrow();
      expect(() => ensurePortAvailable(3000)).not.toThrow();
    });
  });
});
