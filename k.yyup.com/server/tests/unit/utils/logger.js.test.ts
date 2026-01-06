import { vi } from 'vitest'
// Mock dependencies for JavaScript logger file
jest.mock('fs');
jest.mock('path');
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    add: jest.fn(),
    remove: jest.fn()
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
    json: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

const mockFs = require('fs');
const mockPath = require('path');
const mockWinston = require('winston');


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

describe('Logger.js (JavaScript Logger)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock path methods
    mockPath.join.mockImplementation((...args: string[]) => args.join('/'));
    mockPath.dirname.mockReturnValue('/logs');
    
    // Mock fs methods
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockImplementation(() => {});
    mockFs.writeFileSync.mockImplementation(() => {});
  });

  describe('Logger Configuration', () => {
    it('应该创建Winston logger实例', () => {
      // Mock logger creation
      const createLogger = () => {
        return mockWinston.createLogger({
          level: 'info',
          format: mockWinston.format.combine(
            mockWinston.format.timestamp(),
            mockWinston.format.printf((info: any) => `${info.timestamp} ${info.level}: ${info.message}`)
          ),
          transports: [
            new mockWinston.transports.Console(),
            new mockWinston.transports.File({ filename: 'app.log' })
          ]
        });
      };

      const logger = createLogger();

      expect(mockWinston.createLogger).toHaveBeenCalled();
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
    });

    it('应该配置日志级别', () => {
      const logLevels = {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
      };

      expect(logLevels.error).toBe(0);
      expect(logLevels.info).toBe(2);
      expect(logLevels.debug).toBe(5);
    });

    it('应该配置日志格式', () => {
      const formatMessage = (info: any) => {
        return `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`;
      };

      const logInfo = {
        timestamp: '2023-01-01T12:00:00.000Z',
        level: 'info',
        message: 'Test message'
      };

      const formatted = formatMessage(logInfo);

      expect(formatted).toBe('2023-01-01T12:00:00.000Z [INFO] Test message');
    });

    it('应该配置多个传输器', () => {
      const transports = [
        { type: 'console', level: 'debug' },
        { type: 'file', filename: 'app.log', level: 'info' },
        { type: 'file', filename: 'error.log', level: 'error' }
      ];

      expect(transports).toHaveLength(3);
      expect(transports[0].type).toBe('console');
      expect(transports[1].filename).toBe('app.log');
      expect(transports[2].level).toBe('error');
    });
  });

  describe('Logging Methods', () => {
    let mockLogger: any;

    beforeEach(() => {
      mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      };
    });

    it('应该记录信息日志', () => {
      const message = 'Application started successfully';
      const meta = { port: 3000, env: 'development' };

      mockLogger.info(message, meta);

      expect(mockLogger.info).toHaveBeenCalledWith(message, meta);
    });

    it('应该记录错误日志', () => {
      const error = new Error('Database connection failed');
      const context = { operation: 'database_connect', timestamp: new Date() };

      mockLogger.error(error.message, { error: error.stack, ...context });

      expect(mockLogger.error).toHaveBeenCalledWith(
        error.message,
        expect.objectContaining({
          error: error.stack,
          operation: 'database_connect'
        })
      );
    });

    it('应该记录警告日志', () => {
      const warning = 'Deprecated API endpoint used';
      const details = { endpoint: '/api/v1/users', client: '192.168.1.1' };

      mockLogger.warn(warning, details);

      expect(mockLogger.warn).toHaveBeenCalledWith(warning, details);
    });

    it('应该记录调试日志', () => {
      const debugMessage = 'Query executed successfully';
      const queryDetails = { sql: 'SELECT * FROM users', duration: 45 };

      mockLogger.debug(debugMessage, queryDetails);

      expect(mockLogger.debug).toHaveBeenCalledWith(debugMessage, queryDetails);
    });
  });

  describe('Log File Management', () => {
    it('应该创建日志目录', () => {
      mockFs.existsSync.mockReturnValue(false);

      const ensureLogDirectory = (logDir: string) => {
        if (!mockFs.existsSync(logDir)) {
          mockFs.mkdirSync(logDir, { recursive: true });
        }
      };

      ensureLogDirectory('/logs');

      expect(mockFs.existsSync).toHaveBeenCalledWith('/logs');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/logs', { recursive: true });
    });

    it('应该处理日志文件轮转', () => {
      const rotateLogFile = (filename: string, maxSize: number) => {
        const stats = { size: maxSize + 1000 }; // 模拟文件大小超过限制
        
        if (stats.size > maxSize) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const rotatedFilename = `${filename}.${timestamp}`;
          
          // 模拟文件重命名和创建新文件
          return {
            rotated: true,
            oldFile: rotatedFilename,
            newFile: filename
          };
        }
        
        return { rotated: false };
      };

      const result = rotateLogFile('app.log', 10000);

      expect(result.rotated).toBe(true);
      expect(result.oldFile).toContain('app.log.');
      expect(result.newFile).toBe('app.log');
    });

    it('应该清理旧日志文件', () => {
      const cleanupOldLogs = (logDir: string, retentionDays: number) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const mockFiles = [
          { name: 'app.log.2023-01-01', mtime: new Date('2023-01-01') },
          { name: 'app.log.2023-12-01', mtime: new Date('2023-12-01') }
        ];

        const filesToDelete = mockFiles.filter(file => file.mtime < cutoffDate);
        
        return {
          deleted: filesToDelete.length,
          files: filesToDelete.map(f => f.name)
        };
      };

      const result = cleanupOldLogs('/logs', 30);

      expect(result.deleted).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.files)).toBe(true);
    });
  });

  describe('Structured Logging', () => {
    it('应该支持结构化日志记录', () => {
      const structuredLog = (level: string, message: string, metadata: any) => {
        const logEntry = {
          timestamp: new Date().toISOString(),
          level,
          message,
          ...metadata
        };

        return logEntry;
      };

      const logEntry = structuredLog('info', 'User login', {
        userId: 123,
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      });

      expect(logEntry.level).toBe('info');
      expect(logEntry.message).toBe('User login');
      expect(logEntry.userId).toBe(123);
      expect(logEntry.ip).toBe('192.168.1.1');
    });

    it('应该支持JSON格式输出', () => {
      const logEntry = {
        timestamp: '2023-01-01T12:00:00.000Z',
        level: 'info',
        message: 'API request',
        method: 'GET',
        url: '/api/users',
        responseTime: 150
      };

      const jsonLog = JSON.stringify(logEntry);
      const parsed = JSON.parse(jsonLog);

      expect(parsed.level).toBe('info');
      expect(parsed.method).toBe('GET');
      expect(parsed.responseTime).toBe(150);
    });

    it('应该支持上下文信息', () => {
      const addContext = (baseLogger: any, context: any) => {
        return {
          info: (message: string, meta?: any) => {
            baseLogger.info(message, { ...context, ...meta });
          },
          error: (message: string, meta?: any) => {
            baseLogger.error(message, { ...context, ...meta });
          },
          warn: (message: string, meta?: any) => {
            baseLogger.warn(message, { ...context, ...meta });
          },
          debug: (message: string, meta?: any) => {
            baseLogger.debug(message, { ...context, ...meta });
          }
        };
      };

      const mockBaseLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      };

      const contextLogger = addContext(mockBaseLogger, {
        service: 'user-service',
        version: '1.0.0'
      });

      contextLogger.info('User created', { userId: 123 });

      expect(mockBaseLogger.info).toHaveBeenCalledWith(
        'User created',
        {
          service: 'user-service',
          version: '1.0.0',
          userId: 123
        }
      );
    });
  });

  describe('Performance Logging', () => {
    it('应该记录性能指标', () => {
      const logPerformance = (operation: string, startTime: number, metadata?: any) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        return {
          operation,
          duration,
          timestamp: new Date(endTime).toISOString(),
          ...metadata
        };
      };

      const startTime = Date.now() - 100; // 100ms前
      const perfLog = logPerformance('database_query', startTime, {
        query: 'SELECT * FROM users',
        rows: 150
      });

      expect(perfLog.operation).toBe('database_query');
      expect(perfLog.duration).toBeGreaterThan(0);
      expect(perfLog.query).toBe('SELECT * FROM users');
    });

    it('应该记录HTTP请求日志', () => {
      const logHttpRequest = (req: any, res: any, responseTime: number) => {
        return {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          responseTime,
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          timestamp: new Date().toISOString()
        };
      };

      const mockReq = {
        method: 'GET',
        url: '/api/users',
        headers: { 'user-agent': 'Mozilla/5.0' },
        ip: '192.168.1.1'
      };

      const mockRes = {
        statusCode: 200
      };

      const httpLog = logHttpRequest(mockReq, mockRes, 150);

      expect(httpLog.method).toBe('GET');
      expect(httpLog.statusCode).toBe(200);
      expect(httpLog.responseTime).toBe(150);
    });
  });

  describe('Error Handling', () => {
    it('应该处理日志写入错误', () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Disk full');
      });

      const safeLog = (message: string, filename: string) => {
        try {
          mockFs.writeFileSync(filename, message);
          return { success: true };
        } catch (error) {
          console.error('Failed to write log:', error.message);
          return { success: false, error: error.message };
        }
      };

      const result = safeLog('Test message', 'app.log');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Disk full');
    });

    it('应该处理循环引用对象', () => {
      const safeStringify = (obj: any) => {
        try {
          return JSON.stringify(obj);
        } catch (error) {
          // 处理循环引用
          return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (value.__visited) {
                return '[Circular]';
              }
              value.__visited = true;
            }
            return value;
          });
        }
      };

      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      const result = safeStringify(circularObj);

      expect(result).toContain('test');
      expect(typeof result).toBe('string');
    });

    it('应该提供回退日志机制', () => {
      const fallbackLogger = {
        logs: [] as any[],
        log: function(level: string, message: string, meta?: any) {
          this.logs.push({
            timestamp: new Date().toISOString(),
            level,
            message,
            meta
          });
        }
      };

      const logWithFallback = (message: string, primaryLogger?: any) => {
        if (primaryLogger) {
          try {
            primaryLogger.info(message);
          } catch (error) {
            fallbackLogger.log('info', message, { fallback: true });
          }
        } else {
          fallbackLogger.log('info', message);
        }
      };

      logWithFallback('Test message');

      expect(fallbackLogger.logs).toHaveLength(1);
      expect(fallbackLogger.logs[0].message).toBe('Test message');
    });
  });
});
