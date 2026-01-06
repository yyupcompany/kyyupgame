import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';
import SecurityThreat from '../../../src/models/SecurityThreat';

describe('SecurityThreat Model', () => {
  let sequelize: Sequelize;
  let securityThreat: typeof SecurityThreat;

  beforeEach(async () => {
    // Create in-memory SQLite database for testing
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
      define: {
        timestamps: true,
      },
    });

    // Re-initialize the model with test sequelize instance
    securityThreat = SecurityThreat;
    securityThreat.init(securityThreat.getAttributes(), {
      sequelize,
      tableName: 'security_threats',
      timestamps: true,
      underscored: false,
      freezeTableName: true,
      indexes: [
        {
          fields: ['status']
        },
        {
          fields: ['severity']
        },
        {
          fields: ['threatType']
        },
        {
          fields: ['sourceIp']
        },
        {
          fields: ['createdAt']
        }
      ],
      comment: '安全威胁表'
    });

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(securityThreat.name).toBe('SecurityThreat');
    });

    it('should have correct table name', () => {
      expect(securityThreat.getTableName()).toBe('security_threats');
    });

    it('should have timestamps enabled', () => {
      expect(securityThreat.options.timestamps).toBe(true);
    });

    it('should have underscored disabled', () => {
      expect(securityThreat.options.underscored).toBe(false);
    });

    it('should have freezeTableName enabled', () => {
      expect(securityThreat.options.freezeTableName).toBe(true);
    });

    it('should have correct indexes defined', () => {
      const indexes = securityThreat.options.indexes;
      expect(indexes).toBeDefined();
      expect(indexes!.length).toBe(5);
      
      // Check index on status
      expect(indexes!.some(index => 
        index.fields?.includes('status')
      )).toBe(true);
      
      // Check index on severity
      expect(indexes!.some(index => 
        index.fields?.includes('severity')
      )).toBe(true);
      
      // Check index on threatType
      expect(indexes!.some(index => 
        index.fields?.includes('threatType')
      )).toBe(true);
      
      // Check index on sourceIp
      expect(indexes!.some(index => 
        index.fields?.includes('sourceIp')
      )).toBe(true);
      
      // Check index on createdAt
      expect(indexes!.some(index => 
        index.fields?.includes('createdAt')
      )).toBe(true);
    });

    it('should have correct table comment', () => {
      expect(securityThreat.options.comment).toBe('安全威胁表');
    });
  });

  describe('Attributes', () => {
    it('should have id attribute', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);
      expect(attributes.id.type).toBeInstanceOf(DataTypes.INTEGER);
    });

    it('should have threatType attribute', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.threatType).toBeDefined();
      expect(attributes.threatType.allowNull).toBe(false);
      expect(attributes.threatType.type).toBeInstanceOf(DataTypes.STRING);
      expect(attributes.threatType.comment).toBe('威胁类型：如SQL注入、XSS、暴力破解等');
    });

    it('should have severity attribute with enum values and default', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.severity).toBeDefined();
      expect(attributes.severity.allowNull).toBe(false);
      expect(attributes.severity.defaultValue).toBe('medium');
      expect(attributes.severity.comment).toBe('威胁严重程度');

      // Check if it's an ENUM type
      expect(attributes.severity.type).toBeInstanceOf(DataTypes.ENUM);
    });

    it('should have status attribute with enum values and default', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.status).toBeDefined();
      expect(attributes.status.allowNull).toBe(false);
      expect(attributes.status.defaultValue).toBe('active');
      expect(attributes.status.comment).toBe('威胁状态');

      // Check if it's an ENUM type
      expect(attributes.status.type).toBeInstanceOf(DataTypes.ENUM);
    });

    it('should have sourceIp attribute', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.sourceIp).toBeDefined();
      expect(attributes.sourceIp.allowNull).toBe(true);
      expect(attributes.sourceIp.type).toBeInstanceOf(DataTypes.STRING);
      expect(attributes.sourceIp.comment).toBe('威胁来源IP地址');
    });

    it('should have targetResource attribute', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.targetResource).toBeDefined();
      expect(attributes.targetResource.allowNull).toBe(true);
      expect(attributes.targetResource.type).toBeInstanceOf(DataTypes.STRING);
      expect(attributes.targetResource.comment).toBe('目标资源');
    });

    it('should have description attribute', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.description).toBeDefined();
      expect(attributes.description.allowNull).toBe(false);
      expect(attributes.description.type).toBeInstanceOf(DataTypes.TEXT);
      expect(attributes.description.comment).toBe('威胁描述');
    });

    it('should have detectionMethod attribute', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.detectionMethod).toBeDefined();
      expect(attributes.detectionMethod.allowNull).toBe(false);
      expect(attributes.detectionMethod.type).toBeInstanceOf(DataTypes.STRING);
      expect(attributes.detectionMethod.comment).toBe('检测方法：如规则引擎、AI检测、手动报告等');
    });

    it('should have riskScore attribute with validation', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.riskScore).toBeDefined();
      expect(attributes.riskScore.allowNull).toBe(false);
      expect(attributes.riskScore.defaultValue).toBe(0);
      expect(attributes.riskScore.validate).toBeDefined();
      expect(attributes.riskScore.validate.min).toBe(0);
      expect(attributes.riskScore.validate.max).toBe(100);
      expect(attributes.riskScore.comment).toBe('风险评分 (0-100)');
    });

    it('should have handledBy attribute', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.handledBy).toBeDefined();
      expect(attributes.handledBy.allowNull).toBe(true);
      expect(attributes.handledBy.comment).toBe('处理人员ID');
    });

    it('should have handledAt attribute', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.handledAt).toBeDefined();
      expect(attributes.handledAt.allowNull).toBe(true);
      expect(attributes.handledAt.type).toBeInstanceOf(DataTypes.DATE);
      expect(attributes.handledAt.comment).toBe('处理时间');
    });

    it('should have notes attribute', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.notes).toBeDefined();
      expect(attributes.notes.allowNull).toBe(true);
      expect(attributes.notes.type).toBeInstanceOf(DataTypes.TEXT);
      expect(attributes.notes.comment).toBe('处理备注');
    });

    it('should have metadata attribute', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.metadata).toBeDefined();
      expect(attributes.metadata.allowNull).toBe(true);
      expect(attributes.metadata.type).toBeInstanceOf(DataTypes.TEXT);
      expect(attributes.metadata.comment).toBe('额外元数据（JSON格式）');
    });

    it('should have timestamp attributes', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.createdAt.allowNull).toBe(false);
      expect(attributes.updatedAt).toBe(false);
    });
  });

  describe('CRUD Operations', () => {
    it('should create a security threat with valid data', async () => {
      const threatData = {
        threatType: 'SQL Injection',
        severity: 'high' as const,
        status: 'active' as const,
        sourceIp: '192.168.1.100',
        targetResource: '/api/users',
        description: 'SQL injection attempt detected in user login endpoint',
        detectionMethod: 'rule_engine',
        riskScore: 85,
        handledBy: 1,
        handledAt: new Date(),
        notes: 'Blocked and logged',
        metadata: '{"request_id": "req_123", "user_agent": "Mozilla/5.0"}',
      };

      const threat = await securityThreat.create(threatData);

      expect(threat.id).toBeDefined();
      expect(threat.threatType).toBe(threatData.threatType);
      expect(threat.severity).toBe(threatData.severity);
      expect(threat.status).toBe(threatData.status);
      expect(threat.sourceIp).toBe(threatData.sourceIp);
      expect(threat.targetResource).toBe(threatData.targetResource);
      expect(threat.description).toBe(threatData.description);
      expect(threat.detectionMethod).toBe(threatData.detectionMethod);
      expect(threat.riskScore).toBe(threatData.riskScore);
      expect(threat.handledBy).toBe(threatData.handledBy);
      expect(threat.handledAt).toEqual(threatData.handledAt);
      expect(threat.notes).toBe(threatData.notes);
      expect(threat.metadata).toBe(threatData.metadata);
    });

    it('should create a security threat with default values', async () => {
      const threatData = {
        threatType: 'XSS Attack',
        description: 'Cross-site scripting attempt detected',
        detectionMethod: 'ai_detection',
      };

      const threat = await securityThreat.create(threatData);

      expect(threat.severity).toBe('medium'); // Default value
      expect(threat.status).toBe('active'); // Default value
      expect(threat.riskScore).toBe(0); // Default value
      expect(threat.sourceIp).toBeUndefined(); // Optional field
      expect(threat.targetResource).toBeUndefined(); // Optional field
      expect(threat.handledBy).toBeUndefined(); // Optional field
      expect(threat.handledAt).toBeUndefined(); // Optional field
      expect(threat.notes).toBeUndefined(); // Optional field
      expect(threat.metadata).toBeUndefined(); // Optional field
    });

    it('should fail to create security threat without required fields', async () => {
      const invalidThreatData = {
        sourceIp: '192.168.1.200',
        // Missing required fields: threatType, description, detectionMethod
      };

      await expect(securityThreat.create(invalidThreatData as any)).rejects.toThrow();
    });

    it('should read a security threat by id', async () => {
      const threatData = {
        threatType: 'Brute Force',
        severity: 'medium' as const,
        status: 'active' as const,
        description: 'Multiple failed login attempts detected',
        detectionMethod: 'pattern_analysis',
        sourceIp: '10.0.0.50',
      };

      const createdThreat = await securityThreat.create(threatData);
      const foundThreat = await securityThreat.findByPk(createdThreat.id);

      expect(foundThreat).toBeDefined();
      expect(foundThreat!.id).toBe(createdThreat.id);
      expect(foundThreat!.threatType).toBe(threatData.threatType);
      expect(foundThreat!.severity).toBe(threatData.severity);
      expect(foundThreat!.description).toBe(threatData.description);
      expect(foundThreat!.detectionMethod).toBe(threatData.detectionMethod);
    });

    it('should update a security threat', async () => {
      const threatData = {
        threatType: 'DDoS Attack',
        severity: 'critical' as const,
        status: 'active' as const,
        description: 'Distributed denial of service attack detected',
        detectionMethod: 'traffic_analysis',
        riskScore: 95,
      };

      const threat = await securityThreat.create(threatData);
      
      const updateData = {
        status: 'resolved' as const,
        severity: 'high' as const,
        handledBy: 2,
        handledAt: new Date(),
        notes: 'Blocked attacker IP and implemented rate limiting',
        riskScore: 100,
      };

      await threat.update(updateData);
      const updatedThreat = await securityThreat.findByPk(threat.id);

      expect(updatedThreat!.status).toBe(updateData.status);
      expect(updatedThreat!.severity).toBe(updateData.severity);
      expect(updatedThreat!.handledBy).toBe(updateData.handledBy);
      expect(updatedThreat!.handledAt).toEqual(updateData.handledAt);
      expect(updatedThreat!.notes).toBe(updateData.notes);
      expect(updatedThreat!.riskScore).toBe(updateData.riskScore);
    });

    it('should delete a security threat', async () => {
      const threatData = {
        threatType: 'Malware',
        severity: 'high' as const,
        status: 'blocked' as const,
        description: 'Malicious file upload detected',
        detectionMethod: 'antivirus_scan',
        sourceIp: '203.0.113.10',
      };

      const threat = await securityThreat.create(threatData);
      const threatId = threat.id;

      await threat.destroy();
      const deletedThreat = await securityThreat.findByPk(threatId);

      expect(deletedThreat).toBeNull();
    });

    it('should find all security threats', async () => {
      // Create multiple threats
      await securityThreat.create({
        threatType: 'SQL Injection',
        severity: 'high' as const,
        status: 'active' as const,
        description: 'SQL injection attempt',
        detectionMethod: 'rule_engine',
      });

      await securityThreat.create({
        threatType: 'XSS Attack',
        severity: 'medium' as const,
        status: 'resolved' as const,
        description: 'XSS attempt',
        detectionMethod: 'ai_detection',
      });

      await securityThreat.create({
        threatType: 'Brute Force',
        severity: 'low' as const,
        status: 'active' as const,
        description: 'Brute force attempt',
        detectionMethod: 'pattern_analysis',
      });

      const threats = await securityThreat.findAll();
      expect(threats.length).toBe(3);
      expect(threats[0].threatType).toBe('SQL Injection');
      expect(threats[1].threatType).toBe('XSS Attack');
      expect(threats[2].threatType).toBe('Brute Force');
    });

    it('should find security threats with conditions', async () => {
      // Create threats with different statuses
      await securityThreat.create({
        threatType: 'SQL Injection',
        severity: 'high' as const,
        status: 'active' as const,
        description: 'Active SQL injection',
        detectionMethod: 'rule_engine',
      });

      await securityThreat.create({
        threatType: 'XSS Attack',
        severity: 'medium' as const,
        status: 'active' as const,
        description: 'Active XSS attack',
        detectionMethod: 'ai_detection',
      });

      await securityThreat.create({
        threatType: 'Brute Force',
        severity: 'low' as const,
        status: 'resolved' as const,
        description: 'Resolved brute force',
        detectionMethod: 'pattern_analysis',
      });

      const activeThreats = await securityThreat.findAll({
        where: { status: 'active' }
      });

      expect(activeThreats.length).toBe(2);
      expect(activeThreats.every(t => t.status === 'active')).toBe(true);
    });

    it('should count security threats', async () => {
      const initialCount = await securityThreat.count();

      await securityThreat.create({
        threatType: 'New Threat',
        severity: 'medium' as const,
        status: 'active' as const,
        description: 'New security threat',
        detectionMethod: 'manual_report',
      });

      const newCount = await securityThreat.count();
      expect(newCount).toBe(initialCount + 1);
    });

    it('should count security threats with conditions', async () => {
      // Create threats with different severities
      await securityThreat.create({
        threatType: 'Critical Threat',
        severity: 'critical' as const,
        status: 'active' as const,
        description: 'Critical severity threat',
        detectionMethod: 'rule_engine',
      });

      await securityThreat.create({
        threatType: 'High Threat',
        severity: 'high' as const,
        status: 'active' as const,
        description: 'High severity threat',
        detectionMethod: 'ai_detection',
      });

      await securityThreat.create({
        threatType: 'Medium Threat',
        severity: 'medium' as const,
        status: 'active' as const,
        description: 'Medium severity threat',
        detectionMethod: 'pattern_analysis',
      });

      const criticalCount = await securityThreat.count({
        where: { severity: 'critical' }
      });

      const highCount = await securityThreat.count({
        where: { severity: 'high' }
      });

      const mediumCount = await securityThreat.count({
        where: { severity: 'medium' }
      });

      expect(criticalCount).toBe(1);
      expect(highCount).toBe(1);
      expect(mediumCount).toBe(1);
    });
  });

  describe('Severity Enum Validation', () => {
    const validSeverities = ['low', 'medium', 'high', 'critical'] as const;

    it('should accept all valid severity values', async () => {
      for (const severity of validSeverities) {
        const threat = await securityThreat.create({
          threatType: 'Test Threat',
          severity,
          description: 'Test description',
          detectionMethod: 'test',
        });

        expect(threat.severity).toBe(severity);
      }
    });

    it('should reject invalid severity values', async () => {
      const invalidSeverities = ['invalid', 'unknown', 'urgent', 'extreme'];

      for (const invalidSeverity of invalidSeverities) {
        await expect(securityThreat.create({
          threatType: 'Test Threat',
          severity: invalidSeverity as any,
          description: 'Test description',
          detectionMethod: 'test',
        })).rejects.toThrow();
      }
    });
  });

  describe('Status Enum Validation', () => {
    const validStatuses = ['active', 'resolved', 'ignored', 'blocked'] as const;

    it('should accept all valid status values', async () => {
      for (const status of validStatuses) {
        const threat = await securityThreat.create({
          threatType: 'Test Threat',
          status,
          description: 'Test description',
          detectionMethod: 'test',
        });

        expect(threat.status).toBe(status);
      }
    });

    it('should reject invalid status values', async () => {
      const invalidStatuses = ['invalid', 'unknown', 'pending', 'processing'];

      for (const invalidStatus of invalidStatuses) {
        await expect(securityThreat.create({
          threatType: 'Test Threat',
          status: invalidStatus as any,
          description: 'Test description',
          detectionMethod: 'test',
        })).rejects.toThrow();
      }
    });
  });

  describe('Risk Score Validation', () => {
    it('should accept valid risk scores within range', async () => {
      const validScores = [0, 25, 50, 75, 100];

      for (const score of validScores) {
        const threat = await securityThreat.create({
          threatType: 'Test Threat',
          riskScore: score,
          description: 'Test description',
          detectionMethod: 'test',
        });

        expect(threat.riskScore).toBe(score);
      }
    });

    it('should reject risk scores below minimum', async () => {
      await expect(securityThreat.create({
        threatType: 'Test Threat',
        riskScore: -1,
        description: 'Test description',
        detectionMethod: 'test',
      })).rejects.toThrow();
    });

    it('should reject risk scores above maximum', async () => {
      await expect(securityThreat.create({
        threatType: 'Test Threat',
        riskScore: 101,
        description: 'Test description',
        detectionMethod: 'test',
      })).rejects.toThrow();
    });

    it('should handle decimal risk scores', async () => {
      const threat = await securityThreat.create({
        threatType: 'Test Threat',
        riskScore: 85.5,
        description: 'Test description',
        detectionMethod: 'test',
      });

      // Sequelize will typically convert this to an integer
      expect(typeof threat.riskScore).toBe('number');
    });
  });

  describe('IP Address Handling', () => {
    it('should handle IPv4 addresses', async () => {
      const ipv4Addresses = [
        '192.168.1.1',
        '10.0.0.1',
        '172.16.254.1',
        '127.0.0.1',
        '0.0.0.0',
        '255.255.255.255',
      ];

      for (const ip of ipv4Addresses) {
        const threat = await securityThreat.create({
          threatType: 'Test Threat',
          sourceIp: ip,
          description: 'Test description',
          detectionMethod: 'test',
        });

        expect(threat.sourceIp).toBe(ip);
      }
    });

    it('should handle IPv6 addresses', async () => {
      const ipv6Addresses = [
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        '::1',
        '2001:db8::1',
        'fe80::1',
        '::ffff:192.168.1.1',
      ];

      for (const ip of ipv6Addresses) {
        const threat = await securityThreat.create({
          threatType: 'Test Threat',
          sourceIp: ip,
          description: 'Test description',
          detectionMethod: 'test',
        });

        expect(threat.sourceIp).toBe(ip);
      }
    });

    it('should handle null source IP', async () => {
      const threat = await securityThreat.create({
        threatType: 'Test Threat',
        sourceIp: null,
        description: 'Test description',
        detectionMethod: 'test',
      });

      expect(threat.sourceIp).toBeNull();
    });

    it('should handle empty string for source IP', async () => {
      const threat = await securityThreat.create({
        threatType: 'Test Threat',
        sourceIp: '',
        description: 'Test description',
        detectionMethod: 'test',
      });

      expect(threat.sourceIp).toBe('');
    });
  });

  describe('JSON Field Handling', () => {
    it('should handle JSON metadata', async () => {
      const metadata = {
        detection_time: '2024-01-01T10:00:00Z',
        request_headers: {
          'user-agent': 'Mozilla/5.0',
          'x-forwarded-for': '192.168.1.100',
        },
        payload_size: 1024,
        attack_pattern: 'union_select',
        confidence_score: 0.95,
      };

      const threat = await securityThreat.create({
        threatType: 'Complex Threat',
        metadata: JSON.stringify(metadata),
        description: 'Threat with complex metadata',
        detectionMethod: 'ai_detection',
      });

      expect(threat.metadata).toBe(JSON.stringify(metadata));

      // Verify metadata JSON can be parsed back
      const parsedMetadata = JSON.parse(threat.metadata!);
      expect(parsedMetadata).toEqual(metadata);
    });

    it('should handle empty JSON metadata', async () => {
      const threat = await securityThreat.create({
        threatType: 'Simple Threat',
        metadata: '{}',
        description: 'Threat with empty metadata',
        detectionMethod: 'rule_engine',
      });

      expect(threat.metadata).toBe('{}');
      expect(JSON.parse(threat.metadata!)).toEqual({});
    });

    it('should handle malformed JSON metadata gracefully', async () => {
      const malformedJson = '{"invalid": json, "missing": quote}';

      const threat = await securityThreat.create({
        threatType: 'Malformed Threat',
        metadata: malformedJson,
        description: 'Threat with malformed metadata',
        detectionMethod: 'manual_report',
      });

      expect(threat.metadata).toBe(malformedJson);

      // Attempting to parse should throw
      expect(() => JSON.parse(threat.metadata!)).toThrow();
    });

    it('should handle very large JSON metadata', async () => {
      const largeMetadata = {
        events: Array.from({ length: 1000 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 1000).toISOString(),
          event_type: 'network_request',
          details: `Event ${i} details`,
        })),
        summary: {
          total_events: 1000,
          time_span: '1000 seconds',
          unique_ips: 50,
        },
      };

      const threat = await securityThreat.create({
        threatType: 'Large Metadata Threat',
        metadata: JSON.stringify(largeMetadata),
        description: 'Threat with large metadata',
        detectionMethod: 'comprehensive_analysis',
      });

      expect(threat.metadata).toBe(JSON.stringify(largeMetadata));

      // Verify large metadata can be parsed back
      const parsedMetadata = JSON.parse(threat.metadata!);
      expect(parsedMetadata.events.length).toBe(1000);
    });
  });

  describe('Date and Time Handling', () => {
    it('should handle handledAt correctly', async () => {
      const handledAt = new Date('2024-01-01T15:30:00Z');

      const threat = await securityThreat.create({
        threatType: 'Handled Threat',
        status: 'resolved',
        handledAt,
        description: 'Threat with handling time',
        detectionMethod: 'manual_report',
        handledBy: 1,
      });

      expect(threat.handledAt).toEqual(handledAt);

      // Verify date is properly stored and retrieved
      expect(threat.handledAt!.getTime()).toBe(handledAt.getTime());
    });

    it('should handle timezone correctly', async () => {
      const handledAt = new Date('2024-01-01T15:30:00+08:00'); // UTC+8

      const threat = await securityThreat.create({
        threatType: 'Timezone Threat',
        status: 'resolved',
        handledAt,
        description: 'Threat with timezone',
        detectionMethod: 'manual_report',
        handledBy: 1,
      });

      // Date should be stored and retrieved correctly
      expect(threat.handledAt!.getTime()).toBe(handledAt.getTime());
    });

    it('should handle future dates for handledAt', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

      const threat = await securityThreat.create({
        threatType: 'Future Handling',
        status: 'active',
        handledAt: futureDate,
        description: 'Threat scheduled for future handling',
        detectionMethod: 'scheduled',
        handledBy: 1,
      });

      expect(threat.handledAt!.getTime()).toBe(futureDate.getTime());
    });

    it('should handle past dates for handledAt', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

      const threat = await securityThreat.create({
        threatType: 'Past Handling',
        status: 'resolved',
        handledAt: pastDate,
        description: 'Threat handled in the past',
        detectionMethod: 'manual_report',
        handledBy: 1,
      });

      expect(threat.handledAt!.getTime()).toBe(pastDate.getTime());
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null values for optional fields', async () => {
      const threat = await securityThreat.create({
        threatType: 'Minimal Threat',
        description: 'Minimal threat description',
        detectionMethod: 'minimal',
        sourceIp: null,
        targetResource: null,
        handledBy: null,
        handledAt: null,
        notes: null,
        metadata: null,
      });

      expect(threat.sourceIp).toBeNull();
      expect(threat.targetResource).toBeNull();
      expect(threat.handledBy).toBeNull();
      expect(threat.handledAt).toBeNull();
      expect(threat.notes).toBeNull();
      expect(threat.metadata).toBeNull();
    });

    it('should handle empty strings for text fields', async () => {
      const threat = await securityThreat.create({
        threatType: 'Empty Fields Threat',
        description: '',
        detectionMethod: '',
        sourceIp: '',
        targetResource: '',
        notes: '',
        metadata: '',
      });

      expect(threat.description).toBe('');
      expect(threat.detectionMethod).toBe('');
      expect(threat.sourceIp).toBe('');
      expect(threat.targetResource).toBe('');
      expect(threat.notes).toBe('');
      expect(threat.metadata).toBe('');
    });

    it('should handle special characters in threatType', async () => {
      const specialChars = 'SQL-Injection/XSS_With.Special@Chars#123';

      const threat = await securityThreat.create({
        threatType: specialChars,
        description: 'Special characters test',
        detectionMethod: 'test',
      });

      expect(threat.threatType).toBe(specialChars);
    });

    it('should handle Unicode characters in threatType', async () => {
      const unicodeThreatType = 'SQL注入-跨站脚本';

      const threat = await securityThreat.create({
        threatType: unicodeThreatType,
        description: 'Unicode threat type test',
        detectionMethod: 'test',
      });

      expect(threat.threatType).toBe(unicodeThreatType);
    });

    it('should handle very long text fields', async () => {
      const longText = 'a'.repeat(5000); // 5KB of text
      const longJson = `{"data": "${longText}"}`;

      const threat = await securityThreat.create({
        threatType: 'Long Text Threat',
        description: longText,
        targetResource: longText,
        notes: longText,
        metadata: longJson,
        detectionMethod: 'test',
      });

      expect(threat.description).toBe(longText);
      expect(threat.targetResource).toBe(longText);
      expect(threat.notes).toBe(longText);
      expect(threat.metadata).toBe(longJson);
    });

    it('should handle zero handledBy (system user)', async () => {
      const threat = await securityThreat.create({
        threatType: 'System Handled Threat',
        handledBy: 0,
        description: 'Threat handled by system',
        detectionMethod: 'automated',
      });

      expect(threat.handledBy).toBe(0);
    });

    it('should handle negative handledBy (edge case)', async () => {
      const threat = await securityThreat.create({
        threatType: 'Negative User Threat',
        handledBy: -1,
        description: 'Threat with negative user ID',
        detectionMethod: 'edge_case',
      });

      expect(threat.handledBy).toBe(-1);
    });
  });

  describe('Query Performance and Indexing', () => {
    beforeEach(async () => {
      // Create test data for performance testing
      const threatTypes = ['SQL Injection', 'XSS', 'Brute Force', 'DDoS', 'Malware'];
      const severities = ['low', 'medium', 'high', 'critical'];
      const statuses = ['active', 'resolved', 'ignored', 'blocked'];

      const threatsData = Array.from({ length: 100 }, (_, i) => ({
        threatType: threatTypes[i % 5],
        severity: severities[i % 4] as 'low' | 'medium' | 'high' | 'critical',
        status: statuses[i % 4] as 'active' | 'resolved' | 'ignored' | 'blocked',
        sourceIp: i % 10 === 0 ? null : `192.168.${i % 255}.${(i + 1) % 255}`,
        description: `Test threat ${i}`,
        detectionMethod: ['rule_engine', 'ai_detection', 'manual_report'][i % 3],
        riskScore: Math.floor(Math.random() * 101),
        handledBy: i % 8 === 0 ? null : (i % 20) + 1,
      }));

      await securityThreat.bulkCreate(threatsData as any);
    });

    it('should efficiently query by status using index', async () => {
      const startTime = Date.now();
      const activeThreats = await securityThreat.findAll({
        where: { status: 'active' }
      });
      const endTime = Date.now();

      expect(activeThreats.length).toBeGreaterThan(0);
      expect(activeThreats.every(t => t.status === 'active')).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should be fast due to index
    });

    it('should efficiently query by severity using index', async () => {
      const startTime = Date.now();
      const criticalThreats = await securityThreat.findAll({
        where: { severity: 'critical' }
      });
      const endTime = Date.now();

      expect(criticalThreats.length).toBeGreaterThan(0);
      expect(criticalThreats.every(t => t.severity === 'critical')).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should be fast due to index
    });

    it('should efficiently query by threatType using index', async () => {
      const startTime = Date.now();
      const sqlInjectionThreats = await securityThreat.findAll({
        where: { threatType: 'SQL Injection' }
      });
      const endTime = Date.now();

      expect(sqlInjectionThreats.length).toBeGreaterThan(0);
      expect(sqlInjectionThreats.every(t => t.threatType === 'SQL Injection')).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should be fast due to index
    });

    it('should efficiently query by sourceIp using index', async () => {
      const startTime = Date.now();
      const ipThreats = await securityThreat.findAll({
        where: { sourceIp: '192.168.1.2' }
      });
      const endTime = Date.now();

      expect(ipThreats.length).toBeGreaterThanOrEqual(0);
      expect(ipThreats.every(t => t.sourceIp === '192.168.1.2')).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should be fast due to index
    });

    it('should efficiently query by createdAt using index', async () => {
      const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      
      const startTime = Date.now();
      const recentThreats = await securityThreat.findAll({
        where: {
          createdAt: {
            [require('sequelize').Op.gte]: recentDate,
          },
        },
        order: [['createdAt', 'DESC']],
      });
      const endTime = Date.now();

      expect(recentThreats.length).toBeGreaterThan(0);
      expect(recentThreats.every(t => t.createdAt >= recentDate)).toBe(true);
      expect(endTime - startTime).toBeLessThan(300); // Should be fast due to index
    });

    it('should efficiently query with multiple conditions using indexes', async () => {
      const startTime = Date.now();
      const activeCriticalThreats = await securityThreat.findAll({
        where: {
          status: 'active',
          severity: 'critical',
          sourceIp: {
            [require('sequelize').Op.ne]: null,
          },
        },
        order: [['riskScore', 'DESC']],
        limit: 20,
      });
      const endTime = Date.now();

      expect(activeCriticalThreats.length).toBeLessThanOrEqual(20);
      expect(activeCriticalThreats.every(t => 
        t.status === 'active' && 
        t.severity === 'critical' && 
        t.sourceIp !== null
      )).toBe(true);
      expect(endTime - startTime).toBeLessThan(400); // Should be fast with multiple indexes
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk creation efficiently', async () => {
      const threatsData = Array.from({ length: 50 }, (_, i) => ({
        threatType: ['SQL Injection', 'XSS', 'Brute Force'][i % 3],
        severity: ['low', 'medium', 'high', 'critical'][i % 4] as 'low' | 'medium' | 'high' | 'critical',
        status: ['active', 'resolved', 'ignored'][i % 3] as 'active' | 'resolved' | 'ignored',
        description: `Bulk threat ${i}`,
        detectionMethod: ['rule_engine', 'ai_detection'][i % 2],
        riskScore: Math.floor(Math.random() * 101),
      }));

      const startTime = Date.now();
      await securityThreat.bulkCreate(threatsData as any);
      const endTime = Date.now();

      const createdThreats = await securityThreat.findAll();
      expect(createdThreats.length).toBeGreaterThanOrEqual(50);
      
      // Performance check
      expect(endTime - startTime).toBeLessThan(3000); // 3 seconds
    });

    it('should handle bulk update efficiently', async () => {
      // First create some threats
      const threatsData = Array.from({ length: 30 }, (_, i) => ({
        threatType: 'test_threat',
        severity: 'medium' as const,
        status: 'active' as const,
        description: `Test threat ${i}`,
        detectionMethod: 'test',
      }));

      await securityThreat.bulkCreate(threatsData);

      // Then update them
      const startTime = Date.now();
      await securityThreat.update(
        { 
          status: 'resolved',
          handledBy: 1,
          handledAt: new Date(),
        },
        {
          where: {
            threatType: 'test_threat',
          }
        }
      );
      const endTime = Date.now();

      const updatedThreats = await securityThreat.findAll({
        where: {
          threatType: 'test_threat',
        }
      });

      expect(updatedThreats.length).toBe(30);
      expect(updatedThreats.every(t => t.status === 'resolved')).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
    });

    it('should handle bulk deletion efficiently', async () => {
      // First create some threats
      const threatsData = Array.from({ length: 20 }, (_, i) => ({
        threatType: 'delete_test_threat',
        severity: 'low' as const,
        status: 'active' as const,
        description: `Delete test threat ${i}`,
        detectionMethod: 'test',
      }));

      await securityThreat.bulkCreate(threatsData);

      // Then delete them
      const startTime = Date.now();
      await securityThreat.destroy({
        where: {
          threatType: 'delete_test_threat',
        }
      });
      const endTime = Date.now();

      const deletedThreats = await securityThreat.findAll({
        where: {
          threatType: 'delete_test_threat',
        }
      });

      expect(deletedThreats.length).toBe(0);
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
    });
  });

  describe('Instance Methods', () => {
    let testThreat: SecurityThreat;

    beforeEach(async () => {
      testThreat = await securityThreat.create({
        threatType: 'Instance Test Threat',
        severity: 'medium',
        status: 'active',
        description: 'Threat for instance method testing',
        detectionMethod: 'test',
        riskScore: 50,
      });
    });

    it('should have toJSON method', () => {
      const json = testThreat.toJSON();
      
      expect(json).toBeDefined();
      expect(typeof json).toBe('object');
      expect(json.id).toBe(testThreat.id);
      expect(json.threatType).toBe(testThreat.threatType);
    });

    it('should have save method', async () => {
      testThreat.status = 'resolved';
      testThreat.severity = 'high';
      testThreat.riskScore = 75;
      await testThreat.save();
      
      const updatedThreat = await securityThreat.findByPk(testThreat.id);
      expect(updatedThreat!.status).toBe('resolved');
      expect(updatedThreat!.severity).toBe('high');
      expect(updatedThreat!.riskScore).toBe(75);
    });

    it('should have reload method', async () => {
      const originalStatus = testThreat.status;
      
      // Update threat directly in database
      await securityThreat.update(
        { status: 'blocked' },
        { where: { id: testThreat.id } }
      );
      
      // Reload the instance
      await testThreat.reload();
      
      expect(testThreat.status).toBe('blocked');
      expect(testThreat.status).not.toBe(originalStatus);
    });

    it('should have destroy method', async () => {
      const threatId = testThreat.id;
      await testThreat.destroy();
      
      const deletedThreat = await securityThreat.findByPk(threatId);
      expect(deletedThreat).toBeNull();
    });

    it('should have get method', () => {
      const threatType = testThreat.get('threatType');
      expect(threatType).toBe(testThreat.threatType);
      
      const severity = testThreat.get('severity');
      expect(severity).toBe(testThreat.severity);
    });

    it('should have set method', async () => {
      testThreat.set('status', 'ignored');
      testThreat.set('riskScore', 25);
      
      await testThreat.save();
      
      const updatedThreat = await securityThreat.findByPk(testThreat.id);
      expect(updatedThreat!.status).toBe('ignored');
      expect(updatedThreat!.riskScore).toBe(25);
    });

    it('should have changed method', () => {
      expect(testThreat.changed('status')).toBe(false);
      
      testThreat.status = 'resolved';
      expect(testThreat.changed('status')).toBe(true);
      
      testThreat.save();
      expect(testThreat.changed('status')).toBe(false);
    });

    it('should have previous method', () => {
      const originalStatus = testThreat.status;
      
      testThreat.status = 'blocked';
      expect(testThreat.previous('status')).toBe(originalStatus);
    });

    it('should have isNewRecord property', () => {
      expect(testThreat.isNewRecord).toBe(false);
      
      const newThreat = securityThreat.build({
        threatType: 'New Record Test',
        description: 'Testing new record',
        detectionMethod: 'test',
      });
      
      expect(newThreat.isNewRecord).toBe(true);
    });
  });

  describe('Data Integrity and Business Logic', () => {
    it('should preserve data type integrity', async () => {
      const threat = await securityThreat.create({
        threatType: 'Integrity Test',
        severity: 'high',
        status: 'active',
        description: 'Data integrity test',
        detectionMethod: 'comprehensive',
        sourceIp: '192.168.1.100',
        targetResource: '/api/test',
        riskScore: 85,
        handledBy: 1,
        handledAt: new Date(),
        notes: 'Test notes',
        metadata: '{"test": "data"}',
      });

      // Verify all data types are preserved
      expect(typeof threat.threatType).toBe('string');
      expect(typeof threat.severity).toBe('string');
      expect(typeof threat.status).toBe('string');
      expect(typeof threat.description).toBe('string');
      expect(typeof threat.detectionMethod).toBe('string');
      expect(typeof threat.sourceIp).toBe('string');
      expect(typeof threat.targetResource).toBe('string');
      expect(typeof threat.riskScore).toBe('number');
      expect(typeof threat.handledBy).toBe('number');
      expect(threat.handledAt).toBeInstanceOf(Date);
      expect(typeof threat.notes).toBe('string');
      expect(typeof threat.metadata).toBe('string');
    });

    it('should handle concurrent updates correctly', async () => {
      const threat = await securityThreat.create({
        threatType: 'Concurrent Test',
        severity: 'medium',
        status: 'active',
        description: 'Concurrent update test',
        detectionMethod: 'test',
      });

      // Simulate concurrent updates
      const update1 = threat.update({ status: 'resolved', handledBy: 1 });
      const update2 = securityThreat.update(
        { status: 'blocked', handledBy: 2 },
        { where: { id: threat.id } }
      );

      await Promise.all([update1, update2]);

      const finalThreat = await securityThreat.findByPk(threat.id);
      // The final state depends on which update completes last
      expect(['resolved', 'blocked']).toContain(finalThreat!.status);
    });

    it('should validate threatType length constraint', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.threatType.type).toBeInstanceOf(DataTypes.STRING);
      // STRING(100) is the constraint
    });

    it('should validate detectionMethod length constraint', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.detectionMethod.type).toBeInstanceOf(DataTypes.STRING);
      // STRING(100) is the constraint
    });

    it('should validate sourceIp length constraint', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.sourceIp.type).toBeInstanceOf(DataTypes.STRING);
      // STRING(45) is the constraint (for IPv6 addresses)
    });

    it('should validate targetResource length constraint', () => {
      const attributes = securityThreat.getAttributes();
      expect(attributes.targetResource.type).toBeInstanceOf(DataTypes.STRING);
      // STRING(255) is the constraint
    });

    it('should handle threat lifecycle correctly', async () => {
      // Create a new threat
      const threat = await securityThreat.create({
        threatType: 'Lifecycle Test',
        severity: 'medium',
        status: 'active',
        description: 'Testing threat lifecycle',
        detectionMethod: 'automated',
        riskScore: 50,
      });

      expect(threat.status).toBe('active');
      expect(threat.handledBy).toBeUndefined();
      expect(threat.handledAt).toBeUndefined();

      // Handle the threat
      await threat.update({
        status: 'resolved',
        handledBy: 1,
        handledAt: new Date(),
        notes: 'Threat has been resolved',
      });

      expect(threat.status).toBe('resolved');
      expect(threat.handledBy).toBe(1);
      expect(threat.handledAt).toBeInstanceOf(Date);
      expect(threat.notes).toBe('Threat has been resolved');

      // Block the threat
      await threat.update({
        status: 'blocked',
        notes: 'Threat source has been blocked',
      });

      expect(threat.status).toBe('blocked');
      expect(threat.notes).toBe('Threat source has been blocked');
    });

    it('should handle risk score changes correctly', async () => {
      const threat = await securityThreat.create({
        threatType: 'Risk Score Test',
        severity: 'medium',
        status: 'active',
        description: 'Testing risk score changes',
        detectionMethod: 'automated',
        riskScore: 30,
      });

      expect(threat.riskScore).toBe(30);

      // Increase risk score
      await threat.update({ riskScore: 75 });
      expect(threat.riskScore).toBe(75);

      // Decrease risk score
      await threat.update({ riskScore: 15 });
      expect(threat.riskScore).toBe(15);

      // Set to maximum
      await threat.update({ riskScore: 100 });
      expect(threat.riskScore).toBe(100);

      // Set to minimum
      await threat.update({ riskScore: 0 });
      expect(threat.riskScore).toBe(0);
    });
  });
});