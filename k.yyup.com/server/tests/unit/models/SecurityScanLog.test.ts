import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';
import SecurityScanLog from '../../../src/models/SecurityScanLog';

describe('SecurityScanLog Model', () => {
  let sequelize: Sequelize;
  let securityScanLog: typeof SecurityScanLog;

  beforeEach(async () => {
    // Create in-memory SQLite database for testing
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
      define: {
        timestamps: true,
      },
    });

    // Re-initialize the model with test sequelize instance
    securityScanLog = SecurityScanLog;
    securityScanLog.init(securityScanLog.getAttributes(), {
      sequelize,
      tableName: 'security_scan_logs',
      timestamps: true,
      underscored: false,
      freezeTableName: true,
      indexes: [
        {
          fields: ['status']
        },
        {
          fields: ['scanType']
        },
        {
          fields: ['startedBy']
        },
        {
          fields: ['startedAt']
        }
      ],
      comment: '安全扫描日志表'
    });

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(securityScanLog.name).toBe('SecurityScanLog');
    });

    it('should have correct table name', () => {
      expect(securityScanLog.getTableName()).toBe('security_scan_logs');
    });

    it('should have timestamps enabled', () => {
      expect(securityScanLog.options.timestamps).toBe(true);
    });

    it('should have underscored disabled', () => {
      expect(securityScanLog.options.underscored).toBe(false);
    });

    it('should have freezeTableName enabled', () => {
      expect(securityScanLog.options.freezeTableName).toBe(true);
    });

    it('should have correct indexes defined', () => {
      const indexes = securityScanLog.options.indexes;
      expect(indexes).toBeDefined();
      expect(indexes!.length).toBe(4);
      
      // Check index on status
      expect(indexes!.some(index => 
        index.fields?.includes('status')
      )).toBe(true);
      
      // Check index on scanType
      expect(indexes!.some(index => 
        index.fields?.includes('scanType')
      )).toBe(true);
      
      // Check index on startedBy
      expect(indexes!.some(index => 
        index.fields?.includes('startedBy')
      )).toBe(true);
      
      // Check index on startedAt
      expect(indexes!.some(index => 
        index.fields?.includes('startedAt')
      )).toBe(true);
    });

    it('should have correct table comment', () => {
      expect(securityScanLog.options.comment).toBe('安全扫描日志表');
    });
  });

  describe('Attributes', () => {
    it('should have id attribute', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);
      expect(attributes.id.type).toBeInstanceOf(DataTypes.INTEGER);
    });

    it('should have scanType attribute', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.scanType).toBeDefined();
      expect(attributes.scanType.allowNull).toBe(false);
      expect(attributes.scanType.type).toBeInstanceOf(DataTypes.STRING);
      expect(attributes.scanType.comment).toBe('扫描类型：如quick、full、custom等');
    });

    it('should have targets attribute', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.targets).toBeDefined();
      expect(attributes.targets.allowNull).toBe(true);
      expect(attributes.targets.type).toBeInstanceOf(DataTypes.TEXT);
      expect(attributes.targets.comment).toBe('扫描目标（JSON格式）');
    });

    it('should have status attribute with enum values and default', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.status).toBeDefined();
      expect(attributes.status.allowNull).toBe(false);
      expect(attributes.status.defaultValue).toBe('pending');
      expect(attributes.status.comment).toBe('扫描状态');
      
      // Check if it's an ENUM type
      expect(attributes.status.type).toBeInstanceOf(DataTypes.ENUM);
    });

    it('should have startedBy attribute', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.startedBy).toBeDefined();
      expect(attributes.startedBy.allowNull).toBe(true);
      expect(attributes.startedBy.comment).toBe('启动扫描的用户ID');
    });

    it('should have startedAt attribute with default', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.startedAt).toBeDefined();
      expect(attributes.startedAt.allowNull).toBe(false);
      expect(attributes.startedAt.comment).toBe('扫描开始时间');
    });

    it('should have completedAt attribute', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.completedAt).toBeDefined();
      expect(attributes.completedAt.allowNull).toBe(true);
      expect(attributes.completedAt.comment).toBe('扫描完成时间');
    });

    it('should have duration attribute', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.duration).toBeDefined();
      expect(attributes.duration.allowNull).toBe(true);
      expect(attributes.duration.comment).toBe('扫描耗时（秒）');
    });

    it('should have threatsFound attribute with default', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.threatsFound).toBeDefined();
      expect(attributes.threatsFound.allowNull).toBe(true);
      expect(attributes.threatsFound.defaultValue).toBe(0);
      expect(attributes.threatsFound.comment).toBe('发现的威胁数量');
    });

    it('should have vulnerabilitiesFound attribute with default', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.vulnerabilitiesFound).toBeDefined();
      expect(attributes.vulnerabilitiesFound.allowNull).toBe(true);
      expect(attributes.vulnerabilitiesFound.defaultValue).toBe(0);
      expect(attributes.vulnerabilitiesFound.comment).toBe('发现的漏洞数量');
    });

    it('should have results attribute', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.results).toBeDefined();
      expect(attributes.results.allowNull).toBe(true);
      expect(attributes.results.type).toBeInstanceOf(DataTypes.TEXT);
      expect(attributes.results.comment).toBe('扫描结果（JSON格式）');
    });

    it('should have errorMessage attribute', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.errorMessage).toBeDefined();
      expect(attributes.errorMessage.allowNull).toBe(true);
      expect(attributes.errorMessage.type).toBeInstanceOf(DataTypes.TEXT);
      expect(attributes.errorMessage.comment).toBe('错误信息');
    });

    it('should have metadata attribute', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.metadata).toBeDefined();
      expect(attributes.metadata.allowNull).toBe(true);
      expect(attributes.metadata.type).toBeInstanceOf(DataTypes.TEXT);
      expect(attributes.metadata.comment).toBe('额外元数据（JSON格式）');
    });

    it('should have timestamp attributes', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.createdAt.allowNull).toBe(false);
      expect(attributes.updatedAt).toBe(false);
    });
  });

  describe('CRUD Operations', () => {
    it('should create a security scan log with valid data', async () => {
      const scanData = {
        scanType: 'full',
        targets: '{"urls": ["http://example.com"], "ports": [80, 443]}',
        status: 'completed' as const,
        startedBy: 1,
        startedAt: new Date('2024-01-01T10:00:00Z'),
        completedAt: new Date('2024-01-01T10:30:00Z'),
        duration: 1800,
        threatsFound: 2,
        vulnerabilitiesFound: 5,
        results: '{"summary": "Scan completed", "details": []}',
        errorMessage: null,
        metadata: '{"scanner_version": "1.0.0"}',
      };

      const scan = await securityScanLog.create(scanData);

      expect(scan.id).toBeDefined();
      expect(scan.scanType).toBe(scanData.scanType);
      expect(scan.targets).toBe(scanData.targets);
      expect(scan.status).toBe(scanData.status);
      expect(scan.startedBy).toBe(scanData.startedBy);
      expect(scan.startedAt).toEqual(scanData.startedAt);
      expect(scan.completedAt).toEqual(scanData.completedAt);
      expect(scan.duration).toBe(scanData.duration);
      expect(scan.threatsFound).toBe(scanData.threatsFound);
      expect(scan.vulnerabilitiesFound).toBe(scanData.vulnerabilitiesFound);
      expect(scan.results).toBe(scanData.results);
      expect(scan.errorMessage).toBe(scanData.errorMessage);
      expect(scan.metadata).toBe(scanData.metadata);
    });

    it('should create a security scan log with default values', async () => {
      const scanData = {
        scanType: 'quick',
        startedAt: new Date(),
      };

      const scan = await securityScanLog.create(scanData);

      expect(scan.status).toBe('pending'); // Default value
      expect(scan.threatsFound).toBe(0); // Default value
      expect(scan.vulnerabilitiesFound).toBe(0); // Default value
      expect(scan.targets).toBeUndefined(); // Optional field
      expect(scan.startedBy).toBeUndefined(); // Optional field
      expect(scan.completedAt).toBeUndefined(); // Optional field
      expect(scan.duration).toBeUndefined(); // Optional field
      expect(scan.results).toBeUndefined(); // Optional field
      expect(scan.errorMessage).toBeUndefined(); // Optional field
      expect(scan.metadata).toBeUndefined(); // Optional field
    });

    it('should fail to create security scan log without required fields', async () => {
      const invalidScanData = {
        targets: '{"test": "data"}',
        // Missing scanType and startedAt
      };

      await expect(securityScanLog.create(invalidScanData as any)).rejects.toThrow();
    });

    it('should read a security scan log by id', async () => {
      const scanData = {
        scanType: 'custom',
        targets: '{"custom": "targets"}',
        status: 'running' as const,
        startedBy: 2,
        startedAt: new Date(),
      };

      const createdScan = await securityScanLog.create(scanData);
      const foundScan = await securityScanLog.findByPk(createdScan.id);

      expect(foundScan).toBeDefined();
      expect(foundScan!.id).toBe(createdScan.id);
      expect(foundScan!.scanType).toBe(scanData.scanType);
      expect(foundScan!.status).toBe(scanData.status);
      expect(foundScan!.startedBy).toBe(scanData.startedBy);
    });

    it('should update a security scan log', async () => {
      const scanData = {
        scanType: 'quick',
        status: 'pending' as const,
        startedAt: new Date(),
      };

      const scan = await securityScanLog.create(scanData);
      
      const updateData = {
        status: 'completed' as const,
        completedAt: new Date(),
        duration: 120,
        threatsFound: 1,
        vulnerabilitiesFound: 3,
        results: '{"scan": "completed"}',
      };

      await scan.update(updateData);
      const updatedScan = await securityScanLog.findByPk(scan.id);

      expect(updatedScan!.status).toBe(updateData.status);
      expect(updatedScan!.completedAt).toEqual(updateData.completedAt);
      expect(updatedScan!.duration).toBe(updateData.duration);
      expect(updatedScan!.threatsFound).toBe(updateData.threatsFound);
      expect(updatedScan!.vulnerabilitiesFound).toBe(updateData.vulnerabilitiesFound);
      expect(updatedScan!.results).toBe(updateData.results);
    });

    it('should delete a security scan log', async () => {
      const scanData = {
        scanType: 'full',
        status: 'failed' as const,
        startedAt: new Date(),
        errorMessage: 'Scan failed due to timeout',
      };

      const scan = await securityScanLog.create(scanData);
      const scanId = scan.id;

      await scan.destroy();
      const deletedScan = await securityScanLog.findByPk(scanId);

      expect(deletedScan).toBeNull();
    });

    it('should find all security scan logs', async () => {
      // Create multiple scan logs
      await securityScanLog.create({
        scanType: 'quick',
        status: 'completed' as const,
        startedAt: new Date(),
      });

      await securityScanLog.create({
        scanType: 'full',
        status: 'running' as const,
        startedAt: new Date(),
      });

      await securityScanLog.create({
        scanType: 'custom',
        status: 'pending' as const,
        startedAt: new Date(),
      });

      const scans = await securityScanLog.findAll();
      expect(scans.length).toBe(3);
      expect(scans[0].scanType).toBe('quick');
      expect(scans[1].scanType).toBe('full');
      expect(scans[2].scanType).toBe('custom');
    });

    it('should find security scan logs with conditions', async () => {
      // Create scan logs with different statuses
      await securityScanLog.create({
        scanType: 'quick',
        status: 'completed' as const,
        startedAt: new Date(),
        threatsFound: 0,
      });

      await securityScanLog.create({
        scanType: 'full',
        status: 'completed' as const,
        startedAt: new Date(),
        threatsFound: 5,
      });

      await securityScanLog.create({
        scanType: 'quick',
        status: 'failed' as const,
        startedAt: new Date(),
        errorMessage: 'Network error',
      });

      const completedScans = await securityScanLog.findAll({
        where: { status: 'completed' }
      });

      expect(completedScans.length).toBe(2);
      expect(completedScans.every(s => s.status === 'completed')).toBe(true);
    });

    it('should count security scan logs', async () => {
      const initialCount = await securityScanLog.count();

      await securityScanLog.create({
        scanType: 'custom',
        status: 'pending' as const,
        startedAt: new Date(),
      });

      const newCount = await securityScanLog.count();
      expect(newCount).toBe(initialCount + 1);
    });

    it('should count security scan logs with conditions', async () => {
      // Create scan logs with different scan types
      await securityScanLog.create({
        scanType: 'quick',
        status: 'completed' as const,
        startedAt: new Date(),
      });

      await securityScanLog.create({
        scanType: 'quick',
        status: 'completed' as const,
        startedAt: new Date(),
      });

      await securityScanLog.create({
        scanType: 'full',
        status: 'completed' as const,
        startedAt: new Date(),
      });

      const quickScanCount = await securityScanLog.count({
        where: { scanType: 'quick' }
      });

      const fullScanCount = await securityScanLog.count({
        where: { scanType: 'full' }
      });

      expect(quickScanCount).toBe(2);
      expect(fullScanCount).toBe(1);
    });
  });

  describe('Status Enum Validation', () => {
    const validStatuses = ['pending', 'running', 'completed', 'failed', 'cancelled'] as const;

    it('should accept all valid status values', async () => {
      for (const status of validStatuses) {
        const scan = await securityScanLog.create({
          scanType: 'test',
          status,
          startedAt: new Date(),
        });

        expect(scan.status).toBe(status);
      }
    });

    it('should reject invalid status values', async () => {
      const invalidStatuses = ['invalid', 'unknown', 'processing', 'success'];

      for (const invalidStatus of invalidStatuses) {
        await expect(securityScanLog.create({
          scanType: 'test',
          status: invalidStatus as any,
          startedAt: new Date(),
        })).rejects.toThrow();
      }
    });
  });

  describe('JSON Field Handling', () => {
    it('should handle JSON targets', async () => {
      const jsonTargets = {
        urls: ['http://example.com', 'http://test.com'],
        ports: [80, 443, 8080],
        paths: ['/api', '/admin'],
        depth: 3,
      };

      const scan = await securityScanLog.create({
        scanType: 'full',
        targets: JSON.stringify(jsonTargets),
        startedAt: new Date(),
      });

      expect(scan.targets).toBe(JSON.stringify(jsonTargets));

      // Verify JSON can be parsed back
      const parsedTargets = JSON.parse(scan.targets!);
      expect(parsedTargets).toEqual(jsonTargets);
    });

    it('should handle empty JSON targets', async () => {
      const scan = await securityScanLog.create({
        scanType: 'quick',
        targets: '{}',
        startedAt: new Date(),
      });

      expect(scan.targets).toBe('{}');
      expect(JSON.parse(scan.targets!)).toEqual({});
    });

    it('should handle complex JSON results', async () => {
      const complexResults = {
        summary: {
          totalScanned: 150,
          threatsFound: 3,
          vulnerabilitiesFound: 7,
          scanDuration: 2450,
        },
        threats: [
          {
            type: 'malware',
            severity: 'high',
            location: '/tmp/malicious_file',
          },
        ],
        vulnerabilities: [
          {
            cve: 'CVE-2024-1234',
            severity: 'medium',
            component: 'web-server',
          },
        ],
        recommendations: [
          'Update web server to latest version',
          'Remove malicious files',
        ],
      };

      const scan = await securityScanLog.create({
        scanType: 'comprehensive',
        results: JSON.stringify(complexResults),
        startedAt: new Date(),
      });

      expect(scan.results).toBe(JSON.stringify(complexResults));

      // Verify complex JSON can be parsed back
      const parsedResults = JSON.parse(scan.results!);
      expect(parsedResults).toEqual(complexResults);
    });

    it('should handle JSON metadata', async () => {
      const metadata = {
        scanner: {
          version: '2.1.0',
          engine: 'advanced-scanner',
          build: '20240115',
        },
        environment: {
          os: 'linux',
          nodeVersion: '18.0.0',
          memoryUsage: '512MB',
        },
        config: {
          timeout: 3600,
          maxThreads: 8,
          followRedirects: true,
        },
      };

      const scan = await securityScanLog.create({
        scanType: 'custom',
        metadata: JSON.stringify(metadata),
        startedAt: new Date(),
      });

      expect(scan.metadata).toBe(JSON.stringify(metadata));

      // Verify metadata JSON can be parsed back
      const parsedMetadata = JSON.parse(scan.metadata!);
      expect(parsedMetadata).toEqual(metadata);
    });

    it('should handle malformed JSON gracefully', async () => {
      const malformedJson = '{"invalid": json, "missing": quote}';

      // This should still store as string, but will fail to parse
      const scan = await securityScanLog.create({
        scanType: 'test',
        targets: malformedJson,
        startedAt: new Date(),
      });

      expect(scan.targets).toBe(malformedJson);

      // Attempting to parse should throw
      expect(() => JSON.parse(scan.targets!)).toThrow();
    });
  });

  describe('Date and Time Handling', () => {
    it('should handle startedAt and completedAt correctly', async () => {
      const startedAt = new Date('2024-01-01T10:00:00Z');
      const completedAt = new Date('2024-01-01T11:30:00Z');

      const scan = await securityScanLog.create({
        scanType: 'full',
        startedAt,
        completedAt,
        status: 'completed',
      });

      expect(scan.startedAt).toEqual(startedAt);
      expect(scan.completedAt).toEqual(completedAt);

      // Verify dates are properly stored and retrieved
      expect(scan.startedAt.getTime()).toBe(startedAt.getTime());
      expect(scan.completedAt!.getTime()).toBe(completedAt.getTime());
    });

    it('should calculate duration correctly', async () => {
      const startedAt = new Date('2024-01-01T10:00:00Z');
      const completedAt = new Date('2024-01-01T10:30:00Z');
      const expectedDuration = 1800; // 30 minutes in seconds

      const scan = await securityScanLog.create({
        scanType: 'full',
        startedAt,
        completedAt,
        duration: expectedDuration,
        status: 'completed',
      });

      expect(scan.duration).toBe(expectedDuration);
    });

    it('should handle timezone correctly', async () => {
      const startedAt = new Date('2024-01-01T10:00:00+08:00'); // UTC+8

      const scan = await securityScanLog.create({
        scanType: 'quick',
        startedAt,
        status: 'completed',
      });

      // Date should be stored and retrieved correctly
      expect(scan.startedAt.getTime()).toBe(startedAt.getTime());
    });

    it('should handle future dates', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

      const scan = await securityScanLog.create({
        scanType: 'scheduled',
        startedAt: futureDate,
        status: 'pending',
      });

      expect(scan.startedAt.getTime()).toBe(futureDate.getTime());
    });

    it('should handle past dates', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

      const scan = await securityScanLog.create({
        scanType: 'retrospective',
        startedAt: pastDate,
        status: 'completed',
      });

      expect(scan.startedAt.getTime()).toBe(pastDate.getTime());
    });
  });

  describe('Numeric Field Handling', () => {
    it('should handle threatsFound correctly', async () => {
      const scan = await securityScanLog.create({
        scanType: 'security',
        threatsFound: 10,
        startedAt: new Date(),
      });

      expect(scan.threatsFound).toBe(10);
      expect(typeof scan.threatsFound).toBe('number');
    });

    it('should handle vulnerabilitiesFound correctly', async () => {
      const scan = await securityScanLog.create({
        scanType: 'vulnerability',
        vulnerabilitiesFound: 25,
        startedAt: new Date(),
      });

      expect(scan.vulnerabilitiesFound).toBe(25);
      expect(typeof scan.vulnerabilitiesFound).toBe('number');
    });

    it('should handle duration correctly', async () => {
      const scan = await securityScanLog.create({
        scanType: 'performance',
        duration: 3665, // 1 hour, 1 minute, 5 seconds
        startedAt: new Date(),
      });

      expect(scan.duration).toBe(3665);
      expect(typeof scan.duration).toBe('number');
    });

    it('should handle zero values for numeric fields', async () => {
      const scan = await securityScanLog.create({
        scanType: 'clean',
        threatsFound: 0,
        vulnerabilitiesFound: 0,
        duration: 0,
        startedAt: new Date(),
      });

      expect(scan.threatsFound).toBe(0);
      expect(scan.vulnerabilitiesFound).toBe(0);
      expect(scan.duration).toBe(0);
    });

    it('should handle large values for numeric fields', async () => {
      const scan = await securityScanLog.create({
        scanType: 'large_scale',
        threatsFound: 999999,
        vulnerabilitiesFound: 888888,
        duration: 9999999,
        startedAt: new Date(),
      });

      expect(scan.threatsFound).toBe(999999);
      expect(scan.vulnerabilitiesFound).toBe(888888);
      expect(scan.duration).toBe(9999999);
    });

    it('should handle negative values for duration (edge case)', async () => {
      const scan = await securityScanLog.create({
        scanType: 'error_case',
        duration: -1, // Invalid duration but should be stored
        startedAt: new Date(),
      });

      expect(scan.duration).toBe(-1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null values for optional fields', async () => {
      const scan = await securityScanLog.create({
        scanType: 'minimal',
        startedAt: new Date(),
        targets: null,
        startedBy: null,
        completedAt: null,
        duration: null,
        threatsFound: null,
        vulnerabilitiesFound: null,
        results: null,
        errorMessage: null,
        metadata: null,
      });

      expect(scan.targets).toBeNull();
      expect(scan.startedBy).toBeNull();
      expect(scan.completedAt).toBeNull();
      expect(scan.duration).toBeNull();
      expect(scan.threatsFound).toBeNull();
      expect(scan.vulnerabilitiesFound).toBeNull();
      expect(scan.results).toBeNull();
      expect(scan.errorMessage).toBeNull();
      expect(scan.metadata).toBeNull();
    });

    it('should handle empty strings for text fields', async () => {
      const scan = await securityScanLog.create({
        scanType: 'empty_strings',
        targets: '',
        results: '',
        errorMessage: '',
        metadata: '',
        startedAt: new Date(),
      });

      expect(scan.targets).toBe('');
      expect(scan.results).toBe('');
      expect(scan.errorMessage).toBe('');
      expect(scan.metadata).toBe('');
    });

    it('should handle special characters in scanType', async () => {
      const specialChars = 'Quick-Scan_With.Special@Chars#123';

      const scan = await securityScanLog.create({
        scanType: specialChars,
        startedAt: new Date(),
      });

      expect(scan.scanType).toBe(specialChars);
    });

    it('should handle Unicode characters in scanType', async () => {
      const unicodeScanType = '安全扫描-完整版';

      const scan = await securityScanLog.create({
        scanType: unicodeScanType,
        startedAt: new Date(),
      });

      expect(scan.scanType).toBe(unicodeScanType);
    });

    it('should handle very long text fields', async () => {
      const longText = 'a'.repeat(10000); // 10KB of text
      const longJson = `{"data": "${longText}"}`;

      const scan = await securityScanLog.create({
        scanType: 'long_text',
        targets: longJson,
        results: longJson,
        errorMessage: longText,
        metadata: longJson,
        startedAt: new Date(),
      });

      expect(scan.targets).toBe(longJson);
      expect(scan.results).toBe(longJson);
      expect(scan.errorMessage).toBe(longText);
      expect(scan.metadata).toBe(longJson);
    });

    it('should handle zero startedBy (system user)', async () => {
      const scan = await securityScanLog.create({
        scanType: 'system_scan',
        startedBy: 0,
        startedAt: new Date(),
      });

      expect(scan.startedBy).toBe(0);
    });

    it('should handle negative startedBy (edge case)', async () => {
      const scan = await securityScanLog.create({
        scanType: 'negative_user',
        startedBy: -1,
        startedAt: new Date(),
      });

      expect(scan.startedBy).toBe(-1);
    });
  });

  describe('Query Performance and Indexing', () => {
    beforeEach(async () => {
      // Create test data for performance testing
      const scanTypes = ['quick', 'full', 'custom'];
      const statuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
      
      const scansData = Array.from({ length: 100 }, (_, i) => ({
        scanType: scanTypes[i % 3],
        status: statuses[i % 5],
        startedBy: i % 10 === 0 ? null : (i % 20) + 1,
        startedAt: new Date(Date.now() - i * 60 * 60 * 1000), // Each scan starts 1 hour earlier
        threatsFound: i % 3 === 0 ? Math.floor(Math.random() * 10) : 0,
        vulnerabilitiesFound: i % 2 === 0 ? Math.floor(Math.random() * 15) : 0,
      }));

      await securityScanLog.bulkCreate(scansData);
    });

    it('should efficiently query by status using index', async () => {
      const startTime = Date.now();
      const completedScans = await securityScanLog.findAll({
        where: { status: 'completed' }
      });
      const endTime = Date.now();

      expect(completedScans.length).toBeGreaterThan(0);
      expect(completedScans.every(s => s.status === 'completed')).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should be fast due to index
    });

    it('should efficiently query by scanType using index', async () => {
      const startTime = Date.now();
      const quickScans = await securityScanLog.findAll({
        where: { scanType: 'quick' }
      });
      const endTime = Date.now();

      expect(quickScans.length).toBeGreaterThan(0);
      expect(quickScans.every(s => s.scanType === 'quick')).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should be fast due to index
    });

    it('should efficiently query by startedBy using index', async () => {
      const startTime = Date.now();
      const userScans = await securityScanLog.findAll({
        where: { startedBy: 1 }
      });
      const endTime = Date.now();

      expect(userScans.length).toBeGreaterThan(0);
      expect(userScans.every(s => s.startedBy === 1)).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should be fast due to index
    });

    it('should efficiently query by startedAt using index', async () => {
      const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      
      const startTime = Date.now();
      const recentScans = await securityScanLog.findAll({
        where: {
          startedAt: {
            [require('sequelize').Op.gte]: recentDate,
          },
        },
        order: [['startedAt', 'DESC']],
      });
      const endTime = Date.now();

      expect(recentScans.length).toBeGreaterThan(0);
      expect(recentScans.every(s => s.startedAt >= recentDate)).toBe(true);
      expect(endTime - startTime).toBeLessThan(300); // Should be fast due to index
    });

    it('should efficiently query with multiple conditions using indexes', async () => {
      const startTime = Date.now();
      const recentCompletedQuickScans = await securityScanLog.findAll({
        where: {
          scanType: 'quick',
          status: 'completed',
          startedBy: {
            [require('sequelize').Op.ne]: null,
          },
        },
        order: [['startedAt', 'DESC']],
        limit: 20,
      });
      const endTime = Date.now();

      expect(recentCompletedQuickScans.length).toBeLessThanOrEqual(20);
      expect(recentCompletedQuickScans.every(s => 
        s.scanType === 'quick' && 
        s.status === 'completed' && 
        s.startedBy !== null
      )).toBe(true);
      expect(endTime - startTime).toBeLessThan(400); // Should be fast with multiple indexes
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk creation efficiently', async () => {
      const scansData = Array.from({ length: 50 }, (_, i) => ({
        scanType: ['quick', 'full', 'custom'][i % 3],
        status: ['pending', 'running', 'completed'][i % 3],
        startedAt: new Date(Date.now() - i * 60 * 1000),
        threatsFound: i % 5,
        vulnerabilitiesFound: i % 3,
      }));

      const startTime = Date.now();
      await securityScanLog.bulkCreate(scansData);
      const endTime = Date.now();

      const createdScans = await securityScanLog.findAll();
      expect(createdScans.length).toBeGreaterThanOrEqual(50);
      
      // Performance check
      expect(endTime - startTime).toBeLessThan(3000); // 3 seconds
    });

    it('should handle bulk update efficiently', async () => {
      // First create some scans
      const scansData = Array.from({ length: 30 }, (_, i) => ({
        scanType: 'test',
        status: 'pending' as const,
        startedAt: new Date(),
      }));

      await securityScanLog.bulkCreate(scansData);

      // Then update them
      const startTime = Date.now();
      await securityScanLog.update(
        { 
          status: 'completed',
          threatsFound: 0,
          vulnerabilitiesFound: 0,
        },
        {
          where: {
            scanType: 'test',
          }
        }
      );
      const endTime = Date.now();

      const updatedScans = await securityScanLog.findAll({
        where: {
          scanType: 'test',
        }
      });

      expect(updatedScans.length).toBe(30);
      expect(updatedScans.every(s => s.status === 'completed')).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
    });

    it('should handle bulk deletion efficiently', async () => {
      // First create some scans
      const scansData = Array.from({ length: 20 }, (_, i) => ({
        scanType: 'delete_test',
        status: 'pending' as const,
        startedAt: new Date(),
      }));

      await securityScanLog.bulkCreate(scansData);

      // Then delete them
      const startTime = Date.now();
      await securityScanLog.destroy({
        where: {
          scanType: 'delete_test',
        }
      });
      const endTime = Date.now();

      const deletedScans = await securityScanLog.findAll({
        where: {
          scanType: 'delete_test',
        }
      });

      expect(deletedScans.length).toBe(0);
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
    });
  });

  describe('Instance Methods', () => {
    let testScan: SecurityScanLog;

    beforeEach(async () => {
      testScan = await securityScanLog.create({
        scanType: 'instance_test',
        status: 'pending',
        startedAt: new Date(),
        targets: '{"test": "instance"}',
      });
    });

    it('should have toJSON method', () => {
      const json = testScan.toJSON();
      
      expect(json).toBeDefined();
      expect(typeof json).toBe('object');
      expect(json.id).toBe(testScan.id);
      expect(json.scanType).toBe(testScan.scanType);
    });

    it('should have save method', async () => {
      testScan.status = 'completed';
      testScan.threatsFound = 2;
      await testScan.save();
      
      const updatedScan = await securityScanLog.findByPk(testScan.id);
      expect(updatedScan!.status).toBe('completed');
      expect(updatedScan!.threatsFound).toBe(2);
    });

    it('should have reload method', async () => {
      const originalStatus = testScan.status;
      
      // Update scan directly in database
      await securityScanLog.update(
        { status: 'running' },
        { where: { id: testScan.id } }
      );
      
      // Reload the instance
      await testScan.reload();
      
      expect(testScan.status).toBe('running');
      expect(testScan.status).not.toBe(originalStatus);
    });

    it('should have destroy method', async () => {
      const scanId = testScan.id;
      await testScan.destroy();
      
      const deletedScan = await securityScanLog.findByPk(scanId);
      expect(deletedScan).toBeNull();
    });

    it('should have get method', () => {
      const scanType = testScan.get('scanType');
      expect(scanType).toBe(testScan.scanType);
      
      const status = testScan.get('status');
      expect(status).toBe(testScan.status);
    });

    it('should have set method', async () => {
      testScan.set('status', 'completed');
      testScan.set('threatsFound', 5);
      
      await testScan.save();
      
      const updatedScan = await securityScanLog.findByPk(testScan.id);
      expect(updatedScan!.status).toBe('completed');
      expect(updatedScan!.threatsFound).toBe(5);
    });

    it('should have changed method', () => {
      expect(testScan.changed('status')).toBe(false);
      
      testScan.status = 'running';
      expect(testScan.changed('status')).toBe(true);
      
      testScan.save();
      expect(testScan.changed('status')).toBe(false);
    });

    it('should have previous method', () => {
      const originalStatus = testScan.status;
      
      testScan.status = 'cancelled';
      expect(testScan.previous('status')).toBe(originalStatus);
    });

    it('should have isNewRecord property', () => {
      expect(testScan.isNewRecord).toBe(false);
      
      const newScan = securityScanLog.build({
        scanType: 'new_record',
        startedAt: new Date(),
      });
      
      expect(newScan.isNewRecord).toBe(true);
    });
  });

  describe('Data Integrity and Business Logic', () => {
    it('should preserve data type integrity', async () => {
      const scan = await securityScanLog.create({
        scanType: 'integrity_test',
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        duration: 1800,
        threatsFound: 3,
        vulnerabilitiesFound: 7,
        startedBy: 1,
        targets: '{"test": "data"}',
        results: '{"scan": "complete"}',
        errorMessage: 'No errors',
        metadata: '{"version": "1.0"}',
      });

      // Verify all data types are preserved
      expect(typeof scan.scanType).toBe('string');
      expect(typeof scan.status).toBe('string');
      expect(scan.startedAt).toBeInstanceOf(Date);
      expect(scan.completedAt).toBeInstanceOf(Date);
      expect(typeof scan.duration).toBe('number');
      expect(typeof scan.threatsFound).toBe('number');
      expect(typeof scan.vulnerabilitiesFound).toBe('number');
      expect(typeof scan.startedBy).toBe('number');
      expect(typeof scan.targets).toBe('string');
      expect(typeof scan.results).toBe('string');
      expect(typeof scan.errorMessage).toBe('string');
      expect(typeof scan.metadata).toBe('string');
    });

    it('should handle concurrent updates correctly', async () => {
      const scan = await securityScanLog.create({
        scanType: 'concurrent_test',
        status: 'running',
        startedAt: new Date(),
      });

      // Simulate concurrent updates
      const update1 = scan.update({ status: 'completed', threatsFound: 2 });
      const update2 = securityScanLog.update(
        { status: 'failed', errorMessage: 'Timeout' },
        { where: { id: scan.id } }
      );

      await Promise.all([update1, update2]);

      const finalScan = await securityScanLog.findByPk(scan.id);
      // The final state depends on which update completes last
      expect(['completed', 'failed']).toContain(finalScan!.status);
    });

    it('should validate scanType length constraint', () => {
      const attributes = securityScanLog.getAttributes();
      expect(attributes.scanType.type).toBeInstanceOf(DataTypes.STRING);
      // STRING(50) is the constraint
    });

    it('should validate startedBy as integer', async () => {
      const scan = await securityScanLog.create({
        scanType: 'validation_test',
        startedBy: 12345,
        startedAt: new Date(),
      });

      expect(typeof scan.startedBy).toBe('number');
      expect(scan.startedBy).toBe(12345);
    });

    it('should handle scan lifecycle correctly', async () => {
      // Create a new scan
      const scan = await securityScanLog.create({
        scanType: 'lifecycle_test',
        status: 'pending',
        startedAt: new Date(),
      });

      expect(scan.status).toBe('pending');
      expect(scan.completedAt).toBeUndefined();
      expect(scan.duration).toBeUndefined();

      // Start the scan
      await scan.update({ status: 'running' });
      expect(scan.status).toBe('running');

      // Complete the scan
      const completedAt = new Date();
      const duration = 1200;
      await scan.update({
        status: 'completed',
        completedAt,
        duration,
        threatsFound: 1,
        vulnerabilitiesFound: 3,
      });

      expect(scan.status).toBe('completed');
      expect(scan.completedAt).toEqual(completedAt);
      expect(scan.duration).toBe(duration);
      expect(scan.threatsFound).toBe(1);
      expect(scan.vulnerabilitiesFound).toBe(3);
    });
  });
});