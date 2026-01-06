import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { promises as fs } from 'fs';
import path from 'path';

// Mock dependencies
const mockSequelize = {
  query: jest.fn(),
  authenticate: jest.fn(),
  close: jest.fn(),
  getDialect: jest.fn(),
  getDatabaseName: jest.fn(),
  config: {
    host: 'localhost',
    port: 5432,
    username: 'test_user',
    password: 'test_password',
    database: 'test_db'
  }
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockChildProcess = {
  spawn: jest.fn(),
  exec: jest.fn()
};

const mockCronJob = jest.fn();

const mockS3Client = {
  upload: jest.fn(),
  download: jest.fn(),
  deleteObject: jest.fn(),
  listObjects: jest.fn(),
  headObject: jest.fn()
};

const mockCompressionService = {
  compress: jest.fn(),
  decompress: jest.fn(),
  getCompressionRatio: jest.fn()
};

const mockEncryptionService = {
  encrypt: jest.fn(),
  decrypt: jest.fn(),
  generateKey: jest.fn()
};

const mockNotificationService = {
  sendBackupNotification: jest.fn(),
  sendBackupFailureAlert: jest.fn()
};

const mockSystemConfigService = {
  getBackupConfig: jest.fn(),
  updateBackupConfig: jest.fn()
};

// Mock file system
jest.unstable_mockModule('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
    unlink: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    copyFile: jest.fn()
  },
  createReadStream: jest.fn(),
  createWriteStream: jest.fn()
}));

// Mock imports
jest.unstable_mockModule('../../../../../../src/config/database', () => ({
  default: mockSequelize
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('child_process', () => mockChildProcess);

jest.unstable_mockModule('node-cron', () => ({
  schedule: mockCronJob
}));

jest.unstable_mockModule('../../../../../../src/config/aws-s3', () => ({
  default: mockS3Client
}));

jest.unstable_mockModule('../../../../../../src/services/compression.service', () => ({
  default: mockCompressionService
}));

jest.unstable_mockModule('../../../../../../src/services/encryption.service', () => ({
  default: mockEncryptionService
}));

jest.unstable_mockModule('../../../../../../src/services/notification/notification.service', () => ({
  default: mockNotificationService
}));

jest.unstable_mockModule('../../../../../../src/services/system/system-config.service', () => ({
  default: mockSystemConfigService
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

describe('DatabaseBackupService', () => {
  let databaseBackupService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../../src/services/system/database-backup.service');
    databaseBackupService = imported.default || imported.DatabaseBackupService || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockSystemConfigService.getBackupConfig.mockResolvedValue({
      enabled: true,
      schedule: '0 2 * * *', // 每天凌晨2点
      retention: 30, // 保留30天
      compression: true,
      encryption: true,
      storage: {
        local: true,
        s3: true,
        bucket: 'backup-bucket'
      }
    });
  });

  describe('数据库备份', () => {
    it('应该创建完整的数据库备份', async () => {
      const backupOptions = {
        type: 'full',
        compression: true,
        encryption: true
      };

      const mockSpawn = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 100); // 模拟成功完成
          }
        })
      };

      mockChildProcess.spawn.mockReturnValue(mockSpawn);
      mockCompressionService.compress.mockResolvedValue('compressed-backup.gz');
      mockEncryptionService.encrypt.mockResolvedValue('encrypted-backup.enc');
      (fs.stat as jest.Mock).mockResolvedValue({ size: 1024 * 1024 }); // 1MB

      const result = await databaseBackupService.createBackup(backupOptions);

      expect(mockChildProcess.spawn).toHaveBeenCalledWith('pg_dump', expect.any(Array));
      expect(mockCompressionService.compress).toHaveBeenCalled();
      expect(mockEncryptionService.encrypt).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        backupId: expect.any(String),
        filename: expect.any(String),
        size: 1024 * 1024,
        type: 'full',
        compressed: true,
        encrypted: true,
        timestamp: expect.any(Date)
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Database backup completed successfully',
        expect.any(Object)
      );
    });

    it('应该创建增量备份', async () => {
      const backupOptions = {
        type: 'incremental',
        baseBackupId: 'backup-123',
        compression: true
      };

      const mockSpawn = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 50);
          }
        })
      };

      mockChildProcess.spawn.mockReturnValue(mockSpawn);
      mockCompressionService.compress.mockResolvedValue('incremental-backup.gz');
      (fs.stat as jest.Mock).mockResolvedValue({ size: 512 * 1024 }); // 512KB

      const result = await databaseBackupService.createBackup(backupOptions);

      expect(result.type).toBe('incremental');
      expect(result.size).toBe(512 * 1024);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Incremental backup completed successfully',
        expect.any(Object)
      );
    });

    it('应该处理备份失败', async () => {
      const backupOptions = {
        type: 'full',
        compression: false,
        encryption: false
      };

      const mockSpawn = {
        stdout: { on: jest.fn() },
        stderr: { 
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(Buffer.from('pg_dump: error: connection failed'));
            }
          })
        },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(1), 100); // 模拟失败
          }
        })
      };

      mockChildProcess.spawn.mockReturnValue(mockSpawn);

      const result = await databaseBackupService.createBackup(backupOptions);

      expect(result.success).toBe(false);
      expect(result.error).toContain('pg_dump: error: connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Database backup failed',
        expect.any(Object)
      );
      expect(mockNotificationService.sendBackupFailureAlert).toHaveBeenCalled();
    });

    it('应该验证备份完整性', async () => {
      const backupId = 'backup-456';
      const backupPath = '/backups/backup-456.sql';

      (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('-- PostgreSQL database dump\nCREATE TABLE test;'));
      mockSequelize.query.mockResolvedValue([{ count: '100' }]);

      const result = await databaseBackupService.verifyBackup(backupId);

      expect(fs.readFile).toHaveBeenCalledWith(backupPath);
      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count FROM information_schema.tables')
      );
      expect(result).toEqual({
        valid: true,
        backupId,
        checks: {
          fileExists: true,
          fileSize: expect.any(Number),
          sqlSyntax: true,
          tableCount: 100,
          checksumValid: true
        }
      });
    });

    it('应该检测损坏的备份文件', async () => {
      const backupId = 'backup-corrupted';
      const backupPath = '/backups/backup-corrupted.sql';

      (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('corrupted data'));

      const result = await databaseBackupService.verifyBackup(backupId);

      expect(result.valid).toBe(false);
      expect(result.checks.sqlSyntax).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Backup verification failed',
        expect.any(Object)
      );
    });
  });

  describe('备份存储管理', () => {
    it('应该上传备份到S3', async () => {
      const backupId = 'backup-s3-test';
      const localPath = '/backups/backup-s3-test.sql.gz.enc';

      mockS3Client.upload.mockResolvedValue({
        Location: 's3://backup-bucket/backups/backup-s3-test.sql.gz.enc',
        ETag: '"abc123"',
        Bucket: 'backup-bucket',
        Key: 'backups/backup-s3-test.sql.gz.enc'
      });

      const result = await databaseBackupService.uploadToS3(backupId, localPath);

      expect(mockS3Client.upload).toHaveBeenCalledWith({
        Bucket: 'backup-bucket',
        Key: `backups/${backupId}.sql.gz.enc`,
        Body: expect.any(Object),
        ServerSideEncryption: 'AES256',
        StorageClass: 'STANDARD_IA'
      });
      expect(result.success).toBe(true);
      expect(result.location).toBe('s3://backup-bucket/backups/backup-s3-test.sql.gz.enc');
    });

    it('应该从S3下载备份', async () => {
      const backupId = 'backup-download-test';
      const downloadPath = '/tmp/backup-download-test.sql';

      mockS3Client.download.mockResolvedValue({
        Body: Buffer.from('backup data')
      });

      const result = await databaseBackupService.downloadFromS3(backupId, downloadPath);

      expect(mockS3Client.download).toHaveBeenCalledWith({
        Bucket: 'backup-bucket',
        Key: `backups/${backupId}.sql.gz.enc`
      });
      expect(result.success).toBe(true);
      expect(result.localPath).toBe(downloadPath);
    });

    it('应该列出可用的备份', async () => {
      const mockBackups = [
        {
          Key: 'backups/backup-001.sql.gz.enc',
          LastModified: new Date('2024-01-01'),
          Size: 1024 * 1024
        },
        {
          Key: 'backups/backup-002.sql.gz.enc',
          LastModified: new Date('2024-01-02'),
          Size: 2048 * 1024
        }
      ];

      mockS3Client.listObjects.mockResolvedValue({
        Contents: mockBackups
      });

      const result = await databaseBackupService.listBackups();

      expect(mockS3Client.listObjects).toHaveBeenCalledWith({
        Bucket: 'backup-bucket',
        Prefix: 'backups/'
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'backup-001',
        filename: 'backup-001.sql.gz.enc',
        size: 1024 * 1024,
        lastModified: new Date('2024-01-01'),
        location: 's3'
      });
    });

    it('应该清理过期的备份', async () => {
      const retentionDays = 30;
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      const mockOldBackups = [
        {
          Key: 'backups/old-backup-001.sql.gz.enc',
          LastModified: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) // 35天前
        },
        {
          Key: 'backups/old-backup-002.sql.gz.enc',
          LastModified: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) // 40天前
        }
      ];

      mockS3Client.listObjects.mockResolvedValue({
        Contents: mockOldBackups
      });
      mockS3Client.deleteObject.mockResolvedValue({});

      const result = await databaseBackupService.cleanupOldBackups(retentionDays);

      expect(mockS3Client.deleteObject).toHaveBeenCalledTimes(2);
      expect(result.deletedCount).toBe(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Cleaned up ${result.deletedCount} old backups`
      );
    });
  });

  describe('备份恢复', () => {
    it('应该恢复数据库备份', async () => {
      const backupId = 'backup-restore-test';
      const restoreOptions = {
        targetDatabase: 'test_restore_db',
        dropExisting: true,
        dataOnly: false
      };

      const mockSpawn = {
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 100);
          }
        })
      };

      mockChildProcess.spawn.mockReturnValue(mockSpawn);
      mockEncryptionService.decrypt.mockResolvedValue('decrypted-backup.sql');
      mockCompressionService.decompress.mockResolvedValue('decompressed-backup.sql');
      (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('-- Database backup content'));

      const result = await databaseBackupService.restoreBackup(backupId, restoreOptions);

      expect(mockEncryptionService.decrypt).toHaveBeenCalled();
      expect(mockCompressionService.decompress).toHaveBeenCalled();
      expect(mockChildProcess.spawn).toHaveBeenCalledWith('psql', expect.any(Array));
      expect(result.success).toBe(true);
      expect(result.targetDatabase).toBe('test_restore_db');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Database restore completed successfully',
        expect.any(Object)
      );
    });

    it('应该处理恢复失败', async () => {
      const backupId = 'backup-restore-fail';
      const restoreOptions = {
        targetDatabase: 'test_fail_db'
      };

      const mockSpawn = {
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { 
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(Buffer.from('psql: error: database does not exist'));
            }
          })
        },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(1), 100);
          }
        })
      };

      mockChildProcess.spawn.mockReturnValue(mockSpawn);

      const result = await databaseBackupService.restoreBackup(backupId, restoreOptions);

      expect(result.success).toBe(false);
      expect(result.error).toContain('psql: error: database does not exist');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Database restore failed',
        expect.any(Object)
      );
    });

    it('应该支持部分恢复', async () => {
      const backupId = 'backup-partial-restore';
      const restoreOptions = {
        targetDatabase: 'test_partial_db',
        tables: ['users', 'activities', 'enrollments'],
        dataOnly: true
      };

      const mockSpawn = {
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 100);
          }
        })
      };

      mockChildProcess.spawn.mockReturnValue(mockSpawn);

      const result = await databaseBackupService.restoreBackup(backupId, restoreOptions);

      expect(mockChildProcess.spawn).toHaveBeenCalledWith('pg_restore', 
        expect.arrayContaining([
          '--data-only',
          '--table=users',
          '--table=activities',
          '--table=enrollments'
        ])
      );
      expect(result.success).toBe(true);
      expect(result.restoredTables).toEqual(['users', 'activities', 'enrollments']);
    });
  });

  describe('定时备份', () => {
    it('应该设置定时备份任务', async () => {
      const scheduleConfig = {
        enabled: true,
        cron: '0 2 * * *', // 每天凌晨2点
        type: 'full',
        retention: 30
      };

      await databaseBackupService.setupScheduledBackup(scheduleConfig);

      expect(mockCronJob).toHaveBeenCalledWith(
        '0 2 * * *',
        expect.any(Function),
        null,
        true
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Scheduled backup configured',
        expect.any(Object)
      );
    });

    it('应该执行定时备份', async () => {
      const mockSpawn = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 100);
          }
        })
      };

      mockChildProcess.spawn.mockReturnValue(mockSpawn);
      mockCompressionService.compress.mockResolvedValue('scheduled-backup.gz');
      mockEncryptionService.encrypt.mockResolvedValue('scheduled-backup.enc');
      (fs.stat as jest.Mock).mockResolvedValue({ size: 2048 * 1024 });

      await databaseBackupService.executeScheduledBackup();

      expect(mockChildProcess.spawn).toHaveBeenCalled();
      expect(mockNotificationService.sendBackupNotification).toHaveBeenCalledWith({
        type: 'success',
        backupId: expect.any(String),
        size: 2048 * 1024,
        timestamp: expect.any(Date)
      });
    });

    it('应该处理定时备份失败', async () => {
      const mockSpawn = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(1), 100); // 失败
          }
        })
      };

      mockChildProcess.spawn.mockReturnValue(mockSpawn);

      await databaseBackupService.executeScheduledBackup();

      expect(mockNotificationService.sendBackupFailureAlert).toHaveBeenCalledWith({
        error: expect.any(String),
        timestamp: expect.any(Date),
        scheduledBackup: true
      });
    });
  });

  describe('备份监控和报告', () => {
    it('应该生成备份状态报告', async () => {
      const mockBackupHistory = [
        {
          id: 'backup-001',
          timestamp: new Date('2024-01-01'),
          type: 'full',
          size: 1024 * 1024,
          status: 'success'
        },
        {
          id: 'backup-002',
          timestamp: new Date('2024-01-02'),
          type: 'incremental',
          size: 512 * 1024,
          status: 'success'
        }
      ];

      mockS3Client.listObjects.mockResolvedValue({
        Contents: mockBackupHistory.map(backup => ({
          Key: `backups/${backup.id}.sql.gz.enc`,
          LastModified: backup.timestamp,
          Size: backup.size
        }))
      });

      const report = await databaseBackupService.generateBackupReport();

      expect(report).toEqual({
        totalBackups: 2,
        totalSize: 1536 * 1024,
        lastBackup: expect.any(Date),
        successRate: 1.0,
        averageSize: 768 * 1024,
        backupFrequency: 'daily',
        storageLocations: ['s3'],
        recommendations: expect.any(Array)
      });
    });

    it('应该监控备份健康状态', async () => {
      const healthCheck = await databaseBackupService.checkBackupHealth();

      expect(healthCheck).toEqual({
        status: 'healthy',
        lastBackup: expect.any(Date),
        nextScheduledBackup: expect.any(Date),
        storageAvailable: true,
        encryptionEnabled: true,
        compressionEnabled: true,
        issues: []
      });
    });

    it('应该检测备份问题', async () => {
      // 模拟没有最近备份
      mockS3Client.listObjects.mockResolvedValue({
        Contents: []
      });

      const healthCheck = await databaseBackupService.checkBackupHealth();

      expect(healthCheck.status).toBe('warning');
      expect(healthCheck.issues).toContain('No recent backups found');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Backup health check detected issues',
        expect.any(Object)
      );
    });
  });

  describe('错误处理和恢复', () => {
    it('应该处理存储空间不足', async () => {
      const backupOptions = { type: 'full' };

      (fs.stat as jest.Mock).mockRejectedValue({ code: 'ENOSPC' }); // 磁盘空间不足

      const result = await databaseBackupService.createBackup(backupOptions);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient storage space');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Backup failed due to insufficient storage',
        expect.any(Object)
      );
    });

    it('应该重试失败的备份', async () => {
      const backupOptions = { type: 'full', retryCount: 3 };

      let attemptCount = 0;
      const mockSpawn = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            attemptCount++;
            const exitCode = attemptCount < 3 ? 1 : 0; // 前两次失败，第三次成功
            setTimeout(() => callback(exitCode), 100);
          }
        })
      };

      mockChildProcess.spawn.mockReturnValue(mockSpawn);
      mockCompressionService.compress.mockResolvedValue('retry-backup.gz');
      (fs.stat as jest.Mock).mockResolvedValue({ size: 1024 * 1024 });

      const result = await databaseBackupService.createBackup(backupOptions);

      expect(mockChildProcess.spawn).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
      expect(result.retryCount).toBe(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Backup succeeded after 2 retries'
      );
    });

    it('应该处理网络连接问题', async () => {
      const backupId = 'backup-network-test';
      const localPath = '/backups/backup-network-test.sql';

      mockS3Client.upload.mockRejectedValue(new Error('Network timeout'));

      const result = await databaseBackupService.uploadToS3(backupId, localPath);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network timeout');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'S3 upload failed',
        expect.any(Object)
      );
    });
  });
});
