import { jest } from '@jest/globals';
import { vi } from 'vitest'
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

// Mock dependencies
const mockFs = {
  access: jest.fn(),
  mkdir: jest.fn(),
  readdir: jest.fn(),
  stat: jest.fn(),
  unlink: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
  copyFile: jest.fn()
};

const mockPath = {
  join: jest.fn((...args) => args.join('/')),
  dirname: jest.fn(),
  basename: jest.fn(),
  extname: jest.fn()
};

const mockSpawn = jest.fn();

const mockSequelize = {
  query: jest.fn(),
  authenticate: jest.fn(),
  close: jest.fn(),
  transaction: jest.fn()
};

const mockConfigService = {
  get: jest.fn(),
  set: jest.fn()
};

const mockLoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

const mockNotificationService = {
  sendNotification: jest.fn(),
  sendEmail: jest.fn()
};

const mockStorageService = {
  upload: jest.fn(),
  download: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn()
};

const mockCompressionService = {
  compress: jest.fn(),
  decompress: jest.fn(),
  createArchive: jest.fn(),
  extractArchive: jest.fn()
};

// Mock imports
jest.unstable_mockModule('fs/promises', () => mockFs);
jest.unstable_mockModule('path', () => mockPath);
jest.unstable_mockModule('child_process', () => ({ spawn: mockSpawn }));
jest.unstable_mockModule('../../../../../src/config/database', () => ({ sequelize: mockSequelize }));
jest.unstable_mockModule('../../../../../src/services/config.service', () => mockConfigService);
jest.unstable_mockModule('../../../../../src/services/logger.service', () => mockLoggerService);
jest.unstable_mockModule('../../../../../src/services/notification.service', () => mockNotificationService);
jest.unstable_mockModule('../../../../../src/services/storage.service', () => mockStorageService);
jest.unstable_mockModule('../../../../../src/services/compression.service', () => mockCompressionService);


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

describe('Backup Service', () => {
  let backupService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/backup/backup.service');
    backupService = imported.BackupService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockConfigService.get.mockImplementation((key) => {
      const config = {
        'backup.enabled': true,
        'backup.schedule': '0 2 * * *', // 每天凌晨2点
        'backup.retention.days': 30,
        'backup.compression': true,
        'backup.encryption': true,
        'backup.storage.type': 'local',
        'backup.storage.path': '/backups',
        'backup.database.enabled': true,
        'backup.files.enabled': true,
        'backup.notification.enabled': true,
        'backup.notification.recipients': ['admin@example.com']
      };
      return config[key];
    });

    mockFs.access.mockResolvedValue(undefined);
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.stat.mockResolvedValue({ isDirectory: () => true, size: 1024 });
  });

  describe('createBackup', () => {
    it('应该创建完整备份', async () => {
      const backupOptions = {
        type: 'full',
        includeDatabase: true,
        includeFiles: true,
        includeUploads: true,
        compression: true,
        encryption: true
      };

      const mockBackupResult = {
        id: 'backup_20240415_020000',
        type: 'full',
        status: 'completed',
        startTime: new Date('2024-04-15T02:00:00Z'),
        endTime: new Date('2024-04-15T02:15:00Z'),
        duration: 900000, // 15分钟
        size: 1024 * 1024 * 100, // 100MB
        files: [
          'database_20240415_020000.sql.gz',
          'uploads_20240415_020000.tar.gz',
          'config_20240415_020000.json'
        ],
        checksum: 'sha256:abc123...',
        location: '/backups/backup_20240415_020000.tar.gz'
      };

      // Mock database backup
      mockSequelize.query.mockResolvedValue([[], {}]);
      
      // Mock file operations
      mockFs.writeFile.mockResolvedValue(undefined);
      mockCompressionService.createArchive.mockResolvedValue('/tmp/backup.tar.gz');
      mockStorageService.upload.mockResolvedValue({ url: '/backups/backup.tar.gz' });

      const result = await backupService.createBackup(backupOptions);

      expect(result).toEqual(expect.objectContaining({
        type: 'full',
        status: 'completed',
        files: expect.any(Array),
        size: expect.any(Number)
      }));

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        '开始创建备份',
        expect.objectContaining({ type: 'full' })
      );

      expect(mockNotificationService.sendEmail).toHaveBeenCalledWith({
        to: ['admin@example.com'],
        subject: '备份创建成功',
        template: 'backup-success',
        data: expect.any(Object)
      });
    });

    it('应该创建增量备份', async () => {
      const backupOptions = {
        type: 'incremental',
        baseBackupId: 'backup_20240414_020000',
        includeDatabase: true,
        includeFiles: true
      };

      const mockIncrementalResult = {
        id: 'backup_20240415_020000_inc',
        type: 'incremental',
        baseBackupId: 'backup_20240414_020000',
        status: 'completed',
        startTime: new Date('2024-04-15T02:00:00Z'),
        endTime: new Date('2024-04-15T02:05:00Z'),
        duration: 300000, // 5分钟
        size: 1024 * 1024 * 10, // 10MB
        changedFiles: 25,
        location: '/backups/backup_20240415_020000_inc.tar.gz'
      };

      // Mock incremental backup logic
      mockFs.readdir.mockResolvedValue(['file1.txt', 'file2.txt']);
      mockFs.stat.mockResolvedValue({ 
        mtime: new Date('2024-04-15T01:00:00Z'),
        size: 1024 
      });

      const result = await backupService.createBackup(backupOptions);

      expect(result.type).toBe('incremental');
      expect(result.baseBackupId).toBe('backup_20240414_020000');
      expect(result.changedFiles).toBeGreaterThan(0);
    });

    it('应该处理数据库备份', async () => {
      const backupOptions = {
        type: 'database',
        includeDatabase: true,
        includeFiles: false
      };

      // Mock database dump
      const mockProcess = {
        stdout: { on: jest.fn(), pipe: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 100);
          }
        })
      };

      mockSpawn.mockReturnValue(mockProcess);

      const result = await backupService.createBackup(backupOptions);

      expect(mockSpawn).toHaveBeenCalledWith('pg_dump', expect.any(Array));
      expect(result.type).toBe('database');
      expect(result.files).toContain(expect.stringMatching(/database.*\.sql/));
    });

    it('应该处理文件备份', async () => {
      const backupOptions = {
        type: 'files',
        includeDatabase: false,
        includeFiles: true,
        paths: ['/app/uploads', '/app/config']
      };

      mockFs.readdir.mockResolvedValue(['file1.jpg', 'file2.pdf']);
      mockCompressionService.createArchive.mockResolvedValue('/tmp/files.tar.gz');

      const result = await backupService.createBackup(backupOptions);

      expect(result.type).toBe('files');
      expect(mockCompressionService.createArchive).toHaveBeenCalledWith(
        expect.arrayContaining(['/app/uploads', '/app/config']),
        expect.any(String)
      );
    });

    it('应该处理备份失败', async () => {
      const backupOptions = {
        type: 'full',
        includeDatabase: true
      };

      const error = new Error('数据库连接失败');
      mockSequelize.authenticate.mockRejectedValue(error);

      await expect(backupService.createBackup(backupOptions)).rejects.toThrow('数据库连接失败');

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '备份创建失败',
        expect.objectContaining({
          error: error.message
        })
      );

      expect(mockNotificationService.sendEmail).toHaveBeenCalledWith({
        to: ['admin@example.com'],
        subject: '备份创建失败',
        template: 'backup-failure',
        data: expect.objectContaining({
          error: error.message
        })
      });
    });

    it('应该支持加密备份', async () => {
      const backupOptions = {
        type: 'full',
        encryption: true,
        encryptionKey: 'backup-encryption-key'
      };

      const mockEncryptedResult = {
        id: 'backup_20240415_020000',
        type: 'full',
        encrypted: true,
        location: '/backups/backup_20240415_020000.tar.gz.enc'
      };

      // Mock encryption process
      const mockEncryptProcess = {
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn(), pipe: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 100);
          }
        })
      };

      mockSpawn.mockReturnValue(mockEncryptProcess);

      const result = await backupService.createBackup(backupOptions);

      expect(result.encrypted).toBe(true);
      expect(result.location).toMatch(/\.enc$/);
    });

    it('应该验证备份完整性', async () => {
      const backupOptions = {
        type: 'full',
        verifyIntegrity: true
      };

      const mockBackupResult = {
        id: 'backup_20240415_020000',
        checksum: 'sha256:abc123def456',
        verified: true
      };

      // Mock checksum calculation
      mockFs.readFile.mockResolvedValue(Buffer.from('backup data'));

      const result = await backupService.createBackup(backupOptions);

      expect(result.checksum).toMatch(/^sha256:/);
      expect(result.verified).toBe(true);
    });
  });

  describe('restoreBackup', () => {
    it('应该恢复完整备份', async () => {
      const restoreOptions = {
        backupId: 'backup_20240415_020000',
        restoreDatabase: true,
        restoreFiles: true,
        targetPath: '/app/restore'
      };

      const mockBackupInfo = {
        id: 'backup_20240415_020000',
        type: 'full',
        location: '/backups/backup_20240415_020000.tar.gz',
        files: ['database.sql', 'uploads.tar.gz'],
        encrypted: false
      };

      // Mock backup info retrieval
      backupService.getBackupInfo = jest.fn().mockResolvedValue(mockBackupInfo);

      // Mock extraction
      mockCompressionService.extractArchive.mockResolvedValue('/tmp/extracted');
      mockFs.readdir.mockResolvedValue(['database.sql', 'uploads.tar.gz']);

      // Mock database restore
      const mockRestoreProcess = {
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 100);
          }
        })
      };

      mockSpawn.mockReturnValue(mockRestoreProcess);

      const result = await backupService.restoreBackup(restoreOptions);

      expect(result).toEqual(expect.objectContaining({
        backupId: 'backup_20240415_020000',
        status: 'completed',
        restoredDatabase: true,
        restoredFiles: true
      }));

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        '开始恢复备份',
        expect.objectContaining({ backupId: 'backup_20240415_020000' })
      );
    });

    it('应该处理加密备份的恢复', async () => {
      const restoreOptions = {
        backupId: 'backup_20240415_020000',
        decryptionKey: 'backup-encryption-key'
      };

      const mockEncryptedBackup = {
        id: 'backup_20240415_020000',
        encrypted: true,
        location: '/backups/backup_20240415_020000.tar.gz.enc'
      };

      backupService.getBackupInfo = jest.fn().mockResolvedValue(mockEncryptedBackup);

      // Mock decryption process
      const mockDecryptProcess = {
        stdin: { write: jest.fn(), end: jest.fn() },
        stdout: { on: jest.fn(), pipe: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 100);
          }
        })
      };

      mockSpawn.mockReturnValue(mockDecryptProcess);

      const result = await backupService.restoreBackup(restoreOptions);

      expect(result.decrypted).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith('openssl', expect.arrayContaining(['dec']));
    });

    it('应该处理增量备份的恢复', async () => {
      const restoreOptions = {
        backupId: 'backup_20240415_020000_inc'
      };

      const mockIncrementalBackup = {
        id: 'backup_20240415_020000_inc',
        type: 'incremental',
        baseBackupId: 'backup_20240414_020000'
      };

      const mockBaseBackup = {
        id: 'backup_20240414_020000',
        type: 'full'
      };

      backupService.getBackupInfo = jest.fn()
        .mockResolvedValueOnce(mockIncrementalBackup)
        .mockResolvedValueOnce(mockBaseBackup);

      const result = await backupService.restoreBackup(restoreOptions);

      expect(result.restoredBackups).toEqual([
        'backup_20240414_020000',
        'backup_20240415_020000_inc'
      ]);
    });

    it('应该验证恢复前的备份完整性', async () => {
      const restoreOptions = {
        backupId: 'backup_20240415_020000',
        verifyIntegrity: true
      };

      const mockBackupInfo = {
        id: 'backup_20240415_020000',
        checksum: 'sha256:abc123def456',
        location: '/backups/backup.tar.gz'
      };

      backupService.getBackupInfo = jest.fn().mockResolvedValue(mockBackupInfo);
      mockFs.readFile.mockResolvedValue(Buffer.from('backup data'));

      // Mock checksum verification failure
      const calculatedChecksum = 'sha256:different123';
      
      await expect(backupService.restoreBackup(restoreOptions)).rejects.toThrow('备份文件校验失败');

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '备份完整性验证失败',
        expect.objectContaining({
          expected: 'sha256:abc123def456',
          actual: expect.any(String)
        })
      );
    });
  });

  describe('listBackups', () => {
    it('应该列出所有备份', async () => {
      const mockBackups = [
        {
          id: 'backup_20240415_020000',
          type: 'full',
          status: 'completed',
          size: 1024 * 1024 * 100,
          createdAt: new Date('2024-04-15T02:00:00Z')
        },
        {
          id: 'backup_20240414_020000',
          type: 'full',
          status: 'completed',
          size: 1024 * 1024 * 95,
          createdAt: new Date('2024-04-14T02:00:00Z')
        }
      ];

      mockFs.readdir.mockResolvedValue(['backup_20240415_020000.json', 'backup_20240414_020000.json']);
      mockFs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('20240415')) {
          return Promise.resolve(JSON.stringify(mockBackups[0]));
        } else {
          return Promise.resolve(JSON.stringify(mockBackups[1]));
        }
      });

      const result = await backupService.listBackups();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({
        id: 'backup_20240415_020000',
        type: 'full'
      }));
    });

    it('应该支持筛选备份', async () => {
      const filters = {
        type: 'full',
        status: 'completed',
        startDate: '2024-04-01',
        endDate: '2024-04-30'
      };

      const result = await backupService.listBackups(filters);

      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({
          type: 'full',
          status: 'completed'
        })
      ]));
    });

    it('应该支持分页', async () => {
      const pagination = {
        page: 1,
        pageSize: 10
      };

      const result = await backupService.listBackups({}, pagination);

      expect(result).toEqual(expect.objectContaining({
        backups: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        pageSize: 10
      }));
    });
  });

  describe('deleteBackup', () => {
    it('应该删除指定备份', async () => {
      const backupId = 'backup_20240415_020000';

      const mockBackupInfo = {
        id: backupId,
        location: '/backups/backup_20240415_020000.tar.gz',
        files: ['backup.tar.gz', 'backup.json']
      };

      backupService.getBackupInfo = jest.fn().mockResolvedValue(mockBackupInfo);
      mockFs.unlink.mockResolvedValue(undefined);

      const result = await backupService.deleteBackup(backupId);

      expect(result).toEqual(expect.objectContaining({
        backupId,
        deleted: true,
        deletedFiles: expect.any(Array)
      }));

      expect(mockFs.unlink).toHaveBeenCalledWith('/backups/backup_20240415_020000.tar.gz');
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        '备份删除成功',
        expect.objectContaining({ backupId })
      );
    });

    it('应该处理删除不存在的备份', async () => {
      const backupId = 'nonexistent_backup';

      backupService.getBackupInfo = jest.fn().mockResolvedValue(null);

      await expect(backupService.deleteBackup(backupId)).rejects.toThrow('备份不存在');
    });

    it('应该防止删除正在使用的备份', async () => {
      const backupId = 'backup_20240415_020000';

      const mockBackupInfo = {
        id: backupId,
        status: 'in_use',
        dependentBackups: ['backup_20240416_020000_inc']
      };

      backupService.getBackupInfo = jest.fn().mockResolvedValue(mockBackupInfo);

      await expect(backupService.deleteBackup(backupId)).rejects.toThrow('备份正在使用中，无法删除');
    });
  });

  describe('cleanupOldBackups', () => {
    it('应该清理过期备份', async () => {
      const retentionDays = 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const mockOldBackups = [
        {
          id: 'backup_20240301_020000',
          createdAt: new Date('2024-03-01T02:00:00Z'),
          size: 1024 * 1024 * 50
        },
        {
          id: 'backup_20240302_020000',
          createdAt: new Date('2024-03-02T02:00:00Z'),
          size: 1024 * 1024 * 45
        }
      ];

      backupService.listBackups = jest.fn().mockResolvedValue(mockOldBackups);
      backupService.deleteBackup = jest.fn().mockResolvedValue({ deleted: true });

      const result = await backupService.cleanupOldBackups(retentionDays);

      expect(result).toEqual(expect.objectContaining({
        deletedCount: 2,
        freedSpace: expect.any(Number),
        deletedBackups: expect.arrayContaining([
          'backup_20240301_020000',
          'backup_20240302_020000'
        ])
      }));

      expect(backupService.deleteBackup).toHaveBeenCalledTimes(2);
    });

    it('应该保留最近的备份', async () => {
      const retentionDays = 7;
      const minBackupsToKeep = 3;

      const mockRecentBackups = [
        {
          id: 'backup_20240415_020000',
          createdAt: new Date('2024-04-15T02:00:00Z')
        },
        {
          id: 'backup_20240414_020000',
          createdAt: new Date('2024-04-14T02:00:00Z')
        }
      ];

      backupService.listBackups = jest.fn().mockResolvedValue(mockRecentBackups);

      const result = await backupService.cleanupOldBackups(retentionDays, { minBackupsToKeep });

      expect(result.deletedCount).toBe(0);
      expect(result.keptBackups).toHaveLength(2);
    });
  });

  describe('scheduleBackup', () => {
    it('应该创建备份计划', async () => {
      const scheduleOptions = {
        name: '每日备份',
        type: 'full',
        schedule: '0 2 * * *', // 每天凌晨2点
        enabled: true,
        options: {
          includeDatabase: true,
          includeFiles: true,
          compression: true
        }
      };

      const result = await backupService.scheduleBackup(scheduleOptions);

      expect(result).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: '每日备份',
        schedule: '0 2 * * *',
        enabled: true,
        nextRun: expect.any(Date)
      }));

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        '备份计划创建成功',
        expect.objectContaining({ name: '每日备份' })
      );
    });

    it('应该更新备份计划', async () => {
      const scheduleId = 'schedule_123';
      const updateOptions = {
        schedule: '0 3 * * *', // 改为凌晨3点
        enabled: false
      };

      const result = await backupService.updateSchedule(scheduleId, updateOptions);

      expect(result).toEqual(expect.objectContaining({
        id: scheduleId,
        schedule: '0 3 * * *',
        enabled: false
      }));
    });

    it('应该删除备份计划', async () => {
      const scheduleId = 'schedule_123';

      const result = await backupService.deleteSchedule(scheduleId);

      expect(result).toEqual(expect.objectContaining({
        scheduleId,
        deleted: true
      }));
    });
  });

  describe('getBackupStatistics', () => {
    it('应该获取备份统计信息', async () => {
      const mockStats = {
        totalBackups: 50,
        totalSize: 1024 * 1024 * 1024 * 5, // 5GB
        byType: {
          full: 20,
          incremental: 25,
          database: 5
        },
        byStatus: {
          completed: 45,
          failed: 3,
          in_progress: 2
        },
        averageSize: 1024 * 1024 * 100, // 100MB
        oldestBackup: new Date('2024-03-01T02:00:00Z'),
        newestBackup: new Date('2024-04-15T02:00:00Z'),
        successRate: 0.94,
        storageUsage: {
          used: 1024 * 1024 * 1024 * 5,
          available: 1024 * 1024 * 1024 * 10,
          percentage: 33.3
        }
      };

      backupService.listBackups = jest.fn().mockResolvedValue([
        { type: 'full', status: 'completed', size: 1024 * 1024 * 100 },
        { type: 'incremental', status: 'completed', size: 1024 * 1024 * 50 }
      ]);

      const result = await backupService.getBackupStatistics();

      expect(result).toEqual(expect.objectContaining({
        totalBackups: expect.any(Number),
        totalSize: expect.any(Number),
        byType: expect.any(Object),
        byStatus: expect.any(Object),
        successRate: expect.any(Number)
      }));
    });

    it('应该支持时间范围统计', async () => {
      const dateRange = {
        startDate: '2024-04-01',
        endDate: '2024-04-30'
      };

      const result = await backupService.getBackupStatistics(dateRange);

      expect(result.dateRange).toEqual(dateRange);
    });
  });

  describe('verifyBackup', () => {
    it('应该验证备份完整性', async () => {
      const backupId = 'backup_20240415_020000';

      const mockBackupInfo = {
        id: backupId,
        checksum: 'sha256:abc123def456',
        location: '/backups/backup.tar.gz'
      };

      backupService.getBackupInfo = jest.fn().mockResolvedValue(mockBackupInfo);
      mockFs.readFile.mockResolvedValue(Buffer.from('backup data'));

      const result = await backupService.verifyBackup(backupId);

      expect(result).toEqual(expect.objectContaining({
        backupId,
        verified: true,
        checksum: expect.stringMatching(/^sha256:/),
        size: expect.any(Number)
      }));
    });

    it('应该检测损坏的备份', async () => {
      const backupId = 'backup_20240415_020000';

      const mockBackupInfo = {
        id: backupId,
        checksum: 'sha256:abc123def456',
        location: '/backups/backup.tar.gz'
      };

      backupService.getBackupInfo = jest.fn().mockResolvedValue(mockBackupInfo);
      mockFs.readFile.mockResolvedValue(Buffer.from('corrupted data'));

      const result = await backupService.verifyBackup(backupId);

      expect(result).toEqual(expect.objectContaining({
        backupId,
        verified: false,
        error: '校验和不匹配'
      }));

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '备份验证失败',
        expect.objectContaining({ backupId })
      );
    });
  });

  describe('错误处理', () => {
    it('应该处理磁盘空间不足', async () => {
      const backupOptions = { type: 'full' };

      const error = new Error('ENOSPC: no space left on device');
      mockFs.writeFile.mockRejectedValue(error);

      await expect(backupService.createBackup(backupOptions)).rejects.toThrow('磁盘空间不足');

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '备份失败：磁盘空间不足',
        expect.any(Object)
      );
    });

    it('应该处理权限错误', async () => {
      const backupOptions = { type: 'full' };

      const error = new Error('EACCES: permission denied');
      mockFs.mkdir.mockRejectedValue(error);

      await expect(backupService.createBackup(backupOptions)).rejects.toThrow('权限不足');
    });

    it('应该处理网络存储错误', async () => {
      const backupOptions = { type: 'full' };

      const error = new Error('网络连接超时');
      mockStorageService.upload.mockRejectedValue(error);

      await expect(backupService.createBackup(backupOptions)).rejects.toThrow('上传备份失败');
    });

    it('应该处理数据库连接错误', async () => {
      const backupOptions = { type: 'database' };

      const error = new Error('连接被拒绝');
      mockSequelize.authenticate.mockRejectedValue(error);

      await expect(backupService.createBackup(backupOptions)).rejects.toThrow('数据库连接失败');
    });
  });

  describe('配置管理', () => {
    it('应该读取备份配置', async () => {
      const config = await backupService.getConfig();

      expect(config).toEqual(expect.objectContaining({
        enabled: true,
        schedule: '0 2 * * *',
        retention: { days: 30 },
        compression: true,
        encryption: true
      }));

      expect(mockConfigService.get).toHaveBeenCalledWith('backup.enabled');
    });

    it('应该更新备份配置', async () => {
      const newConfig = {
        schedule: '0 3 * * *',
        retention: { days: 60 },
        compression: false
      };

      const result = await backupService.updateConfig(newConfig);

      expect(result).toEqual(expect.objectContaining(newConfig));
      expect(mockConfigService.set).toHaveBeenCalledWith('backup.schedule', '0 3 * * *');
    });

    it('应该验证配置有效性', async () => {
      const invalidConfig = {
        schedule: 'invalid cron expression',
        retention: { days: -1 }
      };

      await expect(backupService.updateConfig(invalidConfig)).rejects.toThrow('配置无效');
    });
  });
});
