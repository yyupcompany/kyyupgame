import { jest } from '@jest/globals';
import { vi } from 'vitest'
import os from 'os';
import fs from 'fs/promises';

// Mock OS module
const mockOs = {
  cpus: jest.fn(),
  totalmem: jest.fn(),
  freemem: jest.fn(),
  loadavg: jest.fn(),
  uptime: jest.fn(),
  platform: jest.fn(),
  arch: jest.fn(),
  hostname: jest.fn(),
  networkInterfaces: jest.fn()
};

// Mock FS module
const mockFs = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  stat: jest.fn(),
  readdir: jest.fn()
};

// Mock process
const mockProcess = {
  memoryUsage: jest.fn(),
  cpuUsage: jest.fn(),
  uptime: jest.fn(),
  pid: 12345,
  version: 'v18.17.0',
  versions: {
    node: '18.17.0',
    v8: '10.2.154.26'
  }
};

// Mock child process
const mockChildProcess = {
  exec: jest.fn()
};

// Mock models
const mockSystemMetric = {
  create: jest.fn(),
  findAll: jest.fn(),
  destroy: jest.fn()
};

const mockSystemAlert = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn()
};

const mockSystemConfig = {
  findOne: jest.fn(),
  update: jest.fn()
};

// Mock services
const mockEmailService = {
  sendAlert: jest.fn(),
  sendNotification: jest.fn()
};

const mockRedisService = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  ping: jest.fn()
};

const mockDatabaseService = {
  testConnection: jest.fn(),
  getConnectionInfo: jest.fn(),
  getSlowQueries: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Mock imports
jest.unstable_mockModule('os', () => mockOs);
jest.unstable_mockModule('fs/promises', () => mockFs);
jest.unstable_mockModule('child_process', () => mockChildProcess);

jest.unstable_mockModule('../../../../../src/models/system-metric.model', () => ({
  default: mockSystemMetric
}));

jest.unstable_mockModule('../../../../../src/models/system-alert.model', () => ({
  default: mockSystemAlert
}));

jest.unstable_mockModule('../../../../../src/models/system-config.model', () => ({
  default: mockSystemConfig
}));

jest.unstable_mockModule('../../../../../src/services/email/email.service', () => ({
  default: mockEmailService
}));

jest.unstable_mockModule('../../../../../src/services/redis/redis.service', () => ({
  default: mockRedisService
}));

jest.unstable_mockModule('../../../../../src/services/database.service', () => ({
  default: mockDatabaseService
}));

jest.unstable_mockModule('../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

// Mock global process
global.process = mockProcess as any;


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

describe('System Monitor Service', () => {
  let systemMonitorService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/system-monitor.service');
    systemMonitorService = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockOs.cpus.mockReturnValue([
      { model: 'Intel Core i7', speed: 2800, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } },
      { model: 'Intel Core i7', speed: 2800, times: { user: 1200, nice: 0, sys: 600, idle: 8200, irq: 0 } }
    ]);
    mockOs.totalmem.mockReturnValue(16 * 1024 * 1024 * 1024); // 16GB
    mockOs.freemem.mockReturnValue(8 * 1024 * 1024 * 1024);   // 8GB
    mockOs.loadavg.mockReturnValue([1.5, 1.2, 1.0]);
    mockOs.uptime.mockReturnValue(86400); // 1 day
    mockOs.platform.mockReturnValue('linux');
    mockOs.arch.mockReturnValue('x64');
    mockOs.hostname.mockReturnValue('server-01');

    mockProcess.memoryUsage.mockReturnValue({
      rss: 100 * 1024 * 1024,      // 100MB
      heapTotal: 80 * 1024 * 1024,  // 80MB
      heapUsed: 60 * 1024 * 1024,   // 60MB
      external: 10 * 1024 * 1024    // 10MB
    });
    mockProcess.cpuUsage.mockReturnValue({ user: 1000000, system: 500000 });
    mockProcess.uptime.mockReturnValue(3600); // 1 hour

    mockRedisService.ping.mockResolvedValue('PONG');
    mockDatabaseService.testConnection.mockResolvedValue(undefined);
  });

  describe('getSystemMetrics', () => {
    it('应该获取系统指标', async () => {
      const result = await systemMonitorService.getSystemMetrics();

      expect(result.cpu).toBeDefined();
      expect(result.cpu.usage).toBeGreaterThanOrEqual(0);
      expect(result.cpu.loadAverage).toEqual([1.5, 1.2, 1.0]);
      expect(result.cpu.cores).toBe(2);

      expect(result.memory).toBeDefined();
      expect(result.memory.total).toBe(16 * 1024 * 1024 * 1024);
      expect(result.memory.free).toBe(8 * 1024 * 1024 * 1024);
      expect(result.memory.used).toBe(8 * 1024 * 1024 * 1024);
      expect(result.memory.usagePercent).toBe(50);

      expect(result.process).toBeDefined();
      expect(result.process.pid).toBe(12345);
      expect(result.process.uptime).toBe(3600);
      expect(result.process.memory.rss).toBe(100 * 1024 * 1024);

      expect(result.system).toBeDefined();
      expect(result.system.platform).toBe('linux');
      expect(result.system.arch).toBe('x64');
      expect(result.system.hostname).toBe('server-01');
      expect(result.system.uptime).toBe(86400);
    });

    it('应该计算CPU使用率', async () => {
      // 模拟两次CPU使用情况测量
      mockProcess.cpuUsage
        .mockReturnValueOnce({ user: 1000000, system: 500000 })
        .mockReturnValueOnce({ user: 1100000, system: 550000 });

      const result = await systemMonitorService.getSystemMetrics();

      expect(result.cpu.usage).toBeGreaterThan(0);
      expect(result.cpu.usage).toBeLessThanOrEqual(100);
    });

    it('应该处理获取指标失败', async () => {
      mockOs.cpus.mockImplementation(() => {
        throw new Error('无法获取CPU信息');
      });

      await expect(systemMonitorService.getSystemMetrics())
        .rejects.toThrow('无法获取CPU信息');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('获取系统指标失败'),
        expect.objectContaining({
          error: '无法获取CPU信息'
        })
      );
    });
  });

  describe('getDiskUsage', () => {
    it('应该获取磁盘使用情况', async () => {
      const mockDiskInfo = `
Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1       20971520 10485760  10485760  50% /
/dev/sda2       52428800 15728640  36700160  30% /var
tmpfs            8388608        0   8388608   0% /tmp
      `.trim();

      mockChildProcess.exec.mockImplementation((command, callback) => {
        callback(null, { stdout: mockDiskInfo });
      });

      const result = await systemMonitorService.getDiskUsage();

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        filesystem: '/dev/sda1',
        size: 20971520 * 1024,
        used: 10485760 * 1024,
        available: 10485760 * 1024,
        usagePercent: 50,
        mountPoint: '/'
      });
    });

    it('应该处理Windows磁盘信息', async () => {
      mockOs.platform.mockReturnValue('win32');

      const mockWinDiskInfo = `
C:  20.0 GB  10.0 GB  10.0 GB   50%
D:  50.0 GB  15.0 GB  35.0 GB   30%
      `.trim();

      mockChildProcess.exec.mockImplementation((command, callback) => {
        callback(null, { stdout: mockWinDiskInfo });
      });

      const result = await systemMonitorService.getDiskUsage();

      expect(result).toHaveLength(2);
      expect(result[0].filesystem).toBe('C:');
      expect(result[0].usagePercent).toBe(50);
    });

    it('应该处理磁盘信息获取失败', async () => {
      mockChildProcess.exec.mockImplementation((command, callback) => {
        callback(new Error('命令执行失败'));
      });

      await expect(systemMonitorService.getDiskUsage())
        .rejects.toThrow('命令执行失败');
    });
  });

  describe('getNetworkStats', () => {
    it('应该获取网络统计信息', async () => {
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [
          {
            address: '192.168.1.100',
            netmask: '255.255.255.0',
            family: 'IPv4',
            mac: '00:11:22:33:44:55',
            internal: false
          }
        ],
        lo: [
          {
            address: '127.0.0.1',
            netmask: '255.0.0.0',
            family: 'IPv4',
            mac: '00:00:00:00:00:00',
            internal: true
          }
        ]
      });

      const mockNetStats = `
Inter-|   Receive                                                |  Transmit
 face |bytes    packets errs drop fifo frame compressed multicast|bytes    packets errs drop fifo colls carrier compressed
  eth0: 1048576    1000    0    0    0     0          0         0  2097152    1500    0    0    0     0       0          0
    lo:  524288     500    0    0    0     0          0         0   524288     500    0    0    0     0       0          0
      `.trim();

      mockFs.readFile.mockResolvedValue(mockNetStats);

      const result = await systemMonitorService.getNetworkStats();

      expect(result.interfaces).toBeDefined();
      expect(result.interfaces.eth0).toBeDefined();
      expect(result.interfaces.eth0.address).toBe('192.168.1.100');
      expect(result.interfaces.eth0.bytesReceived).toBe(1048576);
      expect(result.interfaces.eth0.bytesSent).toBe(2097152);

      expect(result.total).toBeDefined();
      expect(result.total.bytesReceived).toBe(1572864); // eth0 + lo
      expect(result.total.bytesSent).toBe(2621440);
    });

    it('应该处理网络接口信息获取失败', async () => {
      mockOs.networkInterfaces.mockImplementation(() => {
        throw new Error('无法获取网络接口');
      });

      await expect(systemMonitorService.getNetworkStats())
        .rejects.toThrow('无法获取网络接口');
    });
  });

  describe('checkServiceHealth', () => {
    it('应该检查所有服务健康状态', async () => {
      mockRedisService.ping.mockResolvedValue('PONG');
      mockDatabaseService.testConnection.mockResolvedValue(undefined);

      const result = await systemMonitorService.checkServiceHealth();

      expect(result.redis).toEqual({
        status: 'healthy',
        responseTime: expect.any(Number),
        lastCheck: expect.any(Date)
      });

      expect(result.database).toEqual({
        status: 'healthy',
        responseTime: expect.any(Number),
        lastCheck: expect.any(Date)
      });

      expect(result.overall).toBe('healthy');
    });

    it('应该检测Redis服务异常', async () => {
      mockRedisService.ping.mockRejectedValue(new Error('Redis连接失败'));

      const result = await systemMonitorService.checkServiceHealth();

      expect(result.redis.status).toBe('unhealthy');
      expect(result.redis.error).toBe('Redis连接失败');
      expect(result.overall).toBe('degraded');
    });

    it('应该检测数据库服务异常', async () => {
      mockDatabaseService.testConnection.mockResolvedValue(undefined);

      const result = await systemMonitorService.checkServiceHealth();

      expect(result.database.status).toBe('unhealthy');
      expect(result.overall).toBe('degraded');
    });

    it('应该检测多个服务异常', async () => {
      mockRedisService.ping.mockRejectedValue(new Error('Redis故障'));
      mockDatabaseService.testConnection.mockResolvedValue(undefined);

      const result = await systemMonitorService.checkServiceHealth();

      expect(result.redis.status).toBe('unhealthy');
      expect(result.database.status).toBe('unhealthy');
      expect(result.overall).toBe('critical');
    });
  });

  describe('monitorThresholds', () => {
    it('应该检测CPU使用率超限', async () => {
      const thresholds = {
        cpu: { warning: 70, critical: 90 },
        memory: { warning: 80, critical: 95 },
        disk: { warning: 85, critical: 95 }
      };

      // 模拟高CPU使用率
      mockProcess.cpuUsage
        .mockReturnValueOnce({ user: 1000000, system: 500000 })
        .mockReturnValueOnce({ user: 9000000, system: 4500000 }); // 95% usage

      const result = await systemMonitorService.monitorThresholds(thresholds);

      expect(result.alerts).toContainEqual(
        expect.objectContaining({
          type: 'cpu',
          level: 'critical',
          message: expect.stringContaining('CPU使用率过高')
        })
      );
    });

    it('应该检测内存使用率超限', async () => {
      const thresholds = {
        memory: { warning: 50, critical: 80 }
      };

      // 模拟高内存使用率
      mockOs.totalmem.mockReturnValue(16 * 1024 * 1024 * 1024); // 16GB
      mockOs.freemem.mockReturnValue(2 * 1024 * 1024 * 1024);   // 2GB (87.5% used)

      const result = await systemMonitorService.monitorThresholds(thresholds);

      expect(result.alerts).toContainEqual(
        expect.objectContaining({
          type: 'memory',
          level: 'critical',
          message: expect.stringContaining('内存使用率过高')
        })
      );
    });

    it('应该检测磁盘使用率超限', async () => {
      const thresholds = {
        disk: { warning: 80, critical: 90 }
      };

      const mockDiskInfo = `
/dev/sda1       20971520 19922944   1048576  95% /
      `.trim();

      mockChildProcess.exec.mockImplementation((command, callback) => {
        callback(null, { stdout: mockDiskInfo });
      });

      const result = await systemMonitorService.monitorThresholds(thresholds);

      expect(result.alerts).toContainEqual(
        expect.objectContaining({
          type: 'disk',
          level: 'critical',
          message: expect.stringContaining('磁盘使用率过高')
        })
      );
    });

    it('应该发送告警通知', async () => {
      const thresholds = {
        cpu: { warning: 50, critical: 80 },
        sendAlerts: true,
        alertEmails: ['admin@example.com']
      };

      // 模拟CPU超限
      mockProcess.cpuUsage
        .mockReturnValueOnce({ user: 1000000, system: 500000 })
        .mockReturnValueOnce({ user: 8500000, system: 4000000 }); // 85% usage

      await systemMonitorService.monitorThresholds(thresholds);

      expect(mockEmailService.sendAlert).toHaveBeenCalledWith({
        to: ['admin@example.com'],
        subject: expect.stringContaining('系统告警'),
        template: 'system-alert',
        data: expect.objectContaining({
          alertType: 'cpu',
          level: 'critical'
        })
      });
    });
  });

  describe('collectMetrics', () => {
    it('应该收集并存储指标', async () => {
      const collectOptions = {
        interval: 60000, // 1分钟
        retention: 7 * 24 * 60 * 60 * 1000, // 7天
        storeInDatabase: true
      };

      await systemMonitorService.collectMetrics(collectOptions);

      expect(mockSystemMetric.create).toHaveBeenCalledWith({
        timestamp: expect.any(Date),
        type: 'system',
        metrics: expect.objectContaining({
          cpu: expect.any(Object),
          memory: expect.any(Object),
          process: expect.any(Object)
        })
      });
    });

    it('应该清理过期指标', async () => {
      const collectOptions = {
        retention: 24 * 60 * 60 * 1000, // 1天
        cleanupOldMetrics: true
      };

      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      await systemMonitorService.collectMetrics(collectOptions);

      expect(mockSystemMetric.destroy).toHaveBeenCalledWith({
        where: {
          timestamp: {
            [Symbol.for('lt')]: cutoffDate
          }
        }
      });
    });

    it('应该处理指标收集失败', async () => {
      mockSystemMetric.create.mockRejectedValue(new Error('数据库写入失败'));

      const collectOptions = {
        storeInDatabase: true,
        continueOnError: true
      };

      const result = await systemMonitorService.collectMetrics(collectOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('数据库写入失败');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('generateReport', () => {
    it('应该生成系统监控报告', async () => {
      const reportOptions = {
        timeRange: {
          start: new Date('2024-03-01T00:00:00Z'),
          end: new Date('2024-03-31T23:59:59Z')
        },
        includeCharts: true,
        format: 'json'
      };

      const mockMetrics = [
        {
          timestamp: new Date('2024-03-15T10:00:00Z'),
          metrics: {
            cpu: { usage: 45 },
            memory: { usagePercent: 60 },
            disk: { usagePercent: 70 }
          }
        },
        {
          timestamp: new Date('2024-03-15T11:00:00Z'),
          metrics: {
            cpu: { usage: 55 },
            memory: { usagePercent: 65 },
            disk: { usagePercent: 72 }
          }
        }
      ];

      mockSystemMetric.findAll.mockResolvedValue(mockMetrics);

      const result = await systemMonitorService.generateReport(reportOptions);

      expect(result.summary).toBeDefined();
      expect(result.summary.averageCpuUsage).toBe(50);
      expect(result.summary.averageMemoryUsage).toBe(62.5);
      expect(result.summary.peakCpuUsage).toBe(55);
      expect(result.summary.peakMemoryUsage).toBe(65);

      expect(result.trends).toBeDefined();
      expect(result.trends.cpu).toHaveLength(2);
      expect(result.trends.memory).toHaveLength(2);
    });

    it('应该生成PDF格式报告', async () => {
      const reportOptions = {
        timeRange: {
          start: new Date('2024-03-01'),
          end: new Date('2024-03-31')
        },
        format: 'pdf',
        outputPath: '/tmp/system-report.pdf'
      };

      mockSystemMetric.findAll.mockResolvedValue([]);

      const result = await systemMonitorService.generateReport(reportOptions);

      expect(result.format).toBe('pdf');
      expect(result.filePath).toBe('/tmp/system-report.pdf');
      expect(result.generated).toBe(true);
    });

    it('应该处理空数据', async () => {
      const reportOptions = {
        timeRange: {
          start: new Date('2024-03-01'),
          end: new Date('2024-03-31')
        }
      };

      mockSystemMetric.findAll.mockResolvedValue([]);

      const result = await systemMonitorService.generateReport(reportOptions);

      expect(result.summary.dataPoints).toBe(0);
      expect(result.message).toContain('指定时间范围内无监控数据');
    });
  });

  describe('startMonitoring', () => {
    it('应该启动监控服务', async () => {
      const monitoringConfig = {
        interval: 30000, // 30秒
        thresholds: {
          cpu: { warning: 70, critical: 90 },
          memory: { warning: 80, critical: 95 }
        },
        alerts: {
          enabled: true,
          emails: ['admin@example.com']
        }
      };

      jest.useFakeTimers();

      const result = await systemMonitorService.startMonitoring(monitoringConfig);

      expect(result.started).toBe(true);
      expect(result.interval).toBe(30000);
      expect(result.monitoringId).toBeDefined();

      // 模拟定时器触发
      jest.advanceTimersByTime(30000);

      expect(mockSystemMetric.create).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('应该停止监控服务', async () => {
      const monitoringId = 'monitoring-123';

      const result = await systemMonitorService.stopMonitoring(monitoringId);

      expect(result.stopped).toBe(true);
      expect(result.monitoringId).toBe(monitoringId);
    });

    it('应该处理监控服务启动失败', async () => {
      const invalidConfig = {
        interval: -1000 // 无效间隔
      };

      await expect(systemMonitorService.startMonitoring(invalidConfig))
        .rejects.toThrow('无效的监控配置');
    });
  });

  describe('getHistoricalData', () => {
    it('应该获取历史监控数据', async () => {
      const queryOptions = {
        timeRange: {
          start: new Date('2024-03-01'),
          end: new Date('2024-03-31')
        },
        metrics: ['cpu', 'memory'],
        aggregation: 'hourly'
      };

      const mockHistoricalData = [
        {
          timestamp: new Date('2024-03-15T10:00:00Z'),
          cpu: { avg: 45, max: 60, min: 30 },
          memory: { avg: 65, max: 80, min: 50 }
        },
        {
          timestamp: new Date('2024-03-15T11:00:00Z'),
          cpu: { avg: 50, max: 65, min: 35 },
          memory: { avg: 70, max: 85, min: 55 }
        }
      ];

      mockSystemMetric.findAll.mockResolvedValue(mockHistoricalData);

      const result = await systemMonitorService.getHistoricalData(queryOptions);

      expect(result.data).toEqual(mockHistoricalData);
      expect(result.aggregation).toBe('hourly');
      expect(result.metrics).toEqual(['cpu', 'memory']);
    });

    it('应该支持不同聚合级别', async () => {
      const queryOptions = {
        timeRange: {
          start: new Date('2024-03-01'),
          end: new Date('2024-03-31')
        },
        aggregation: 'daily'
      };

      await systemMonitorService.getHistoricalData(queryOptions);

      expect(mockSystemMetric.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.arrayContaining([
            expect.objectContaining({
              fn: 'DATE_TRUNC',
              args: ['day', expect.any(Object)]
            })
          ])
        })
      );
    });
  });

  describe('Performance Optimization', () => {
    it('应该缓存系统指标', async () => {
      const cacheKey = 'system_metrics';
      const cachedMetrics = {
        cpu: { usage: 45 },
        memory: { usagePercent: 60 },
        timestamp: new Date()
      };

      // 第一次调用 - 从缓存获取
      mockRedisService.get.mockResolvedValueOnce(JSON.stringify(cachedMetrics));

      const result = await systemMonitorService.getSystemMetrics({ useCache: true });

      expect(mockRedisService.get).toHaveBeenCalledWith(cacheKey);
      expect(result.cpu.usage).toBe(45);
      expect(mockOs.cpus).not.toHaveBeenCalled(); // 没有调用系统API
    });

    it('应该批量存储指标', async () => {
      const metrics = Array.from({ length: 100 }, (_, i) => ({
        timestamp: new Date(Date.now() + i * 60000),
        type: 'system',
        metrics: { cpu: { usage: 50 + i } }
      }));

      await systemMonitorService.batchStoreMetrics(metrics);

      expect(mockSystemMetric.create).toHaveBeenCalledWith(
        expect.arrayContaining(metrics),
        { batch: true }
      );
    });

    it('应该压缩历史数据', async () => {
      const compressionOptions = {
        olderThan: 30 * 24 * 60 * 60 * 1000, // 30天
        aggregateBy: 'hour',
        keepRaw: false
      };

      const result = await systemMonitorService.compressHistoricalData(compressionOptions);

      expect(result.compressed).toBe(true);
      expect(result.originalRecords).toBeGreaterThan(0);
      expect(result.compressedRecords).toBeLessThan(result.originalRecords);
    });
  });

  describe('Error Handling', () => {
    it('应该处理系统API调用失败', async () => {
      mockOs.cpus.mockImplementation(() => {
        throw new Error('系统API不可用');
      });

      const result = await systemMonitorService.getSystemMetrics({ fallbackMode: true });

      expect(result.error).toBe('系统API不可用');
      expect(result.fallback).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('使用降级模式')
      );
    });

    it('应该处理存储失败', async () => {
      mockSystemMetric.create.mockRejectedValue(new Error('存储服务不可用'));

      const result = await systemMonitorService.collectMetrics({
        storeInDatabase: true,
        fallbackToFile: true
      });

      expect(result.storedToFile).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('应该处理告警发送失败', async () => {
      mockEmailService.sendAlert.mockRejectedValue(new Error('邮件服务不可用'));

      const thresholds = {
        cpu: { warning: 50, critical: 80 },
        sendAlerts: true,
        alertEmails: ['admin@example.com']
      };

      // 模拟CPU超限
      mockProcess.cpuUsage
        .mockReturnValueOnce({ user: 1000000, system: 500000 })
        .mockReturnValueOnce({ user: 8500000, system: 4000000 });

      const result = await systemMonitorService.monitorThresholds(thresholds);

      expect(result.alertsSent).toBe(false);
      expect(result.alertErrors).toContain('邮件服务不可用');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('告警发送失败')
      );
    });
  });

  describe('Integration Tests', () => {
    it('应该集成监控和告警', async () => {
      const config = {
        interval: 5000,
        thresholds: {
          cpu: { critical: 50 }
        },
        alerts: {
          enabled: true,
          emails: ['admin@example.com']
        }
      };

      // 模拟高CPU使用率
      mockProcess.cpuUsage
        .mockReturnValue({ user: 8000000, system: 4000000 });

      jest.useFakeTimers();

      await systemMonitorService.startMonitoring(config);

      // 触发监控检查
      jest.advanceTimersByTime(5000);

      expect(mockSystemMetric.create).toHaveBeenCalled();
      expect(mockEmailService.sendAlert).toHaveBeenCalled();
      expect(mockSystemAlert.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cpu',
          level: 'critical'
        })
      );

      jest.useRealTimers();
    });

    it('应该集成健康检查和服务恢复', async () => {
      // 模拟Redis服务故障
      mockRedisService.ping.mockRejectedValueOnce(new Error('Redis连接失败'));

      const healthCheck = await systemMonitorService.checkServiceHealth();

      expect(healthCheck.redis.status).toBe('unhealthy');

      // 模拟服务恢复
      mockRedisService.ping.mockResolvedValueOnce('PONG');

      const recoveryCheck = await systemMonitorService.checkServiceHealth();

      expect(recoveryCheck.redis.status).toBe('healthy');
      expect(mockSystemAlert.update).toHaveBeenCalledWith(
        { status: 'resolved' },
        { where: { type: 'redis', status: 'active' } }
      );
    });
  });
});
