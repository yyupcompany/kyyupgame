
vi.mock('@/components/security/DataProtection.vue', () => ({
  default: {
    name: 'DataProtection',
    template: '<div>Mocked security/DataProtection</div>'
  }
}))

import { 
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

describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import DataProtection from '@/components/security/DataProtection.vue';
import { useDataProtectionStore } from '@/stores/dataProtection';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

// Mock crypto module
vi.mock('crypto', () => ({
  createCipheriv: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnValue(Buffer.from('encrypted')),
    final: vi.fn().mockReturnValue(Buffer.from('data'))
  }),
  createDecipheriv: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnValue(Buffer.from('decrypted')),
    final: vi.fn().mockReturnValue(Buffer.from('data'))
  }),
  randomBytes: vi.fn().mockReturnValue(Buffer.from('random123456789012')),
  createHash: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('hashed-data')
  })
}));

describe('DataProtection', () => {
  let wrapper: any;
  let dataProtectionStore: any;
  let authStore: any;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    dataProtectionStore = useDataProtectionStore();
    authStore = useAuthStore();

    // Mock auth store with admin user
    authStore.user = {
      id: 1,
      username: 'admin',
      role: 'admin',
      permissions: ['data-protection:read', 'data-protection:write', 'data-protection:manage']
    };

    // Mock data protection store
    dataProtectionStore.encryptionKeys = [];
    dataProtectionStore.backupLogs = [];
    dataProtectionStore.auditLogs = [];

    wrapper = mount(DataProtection, {
      global: {
        stubs: ['el-card', 'el-table', 'el-button', 'el-tag', 'el-dialog', 'el-form', 'el-form-item', 'el-input', 'el-select', 'el-option', 'el-upload', 'el-progress'],
        plugins: []
      }
    });
  });

  describe('Data Encryption and Decryption', () => {
    it('should encrypt sensitive data using AES-256', async () => {
      const sensitiveData = {
        name: '张三',
        idCard: '110101199001011234',
        phone: '13800138000',
        email: 'zhangsan@example.com'
      };

      const encryptionKey = 'secure-encryption-key-123';
      const encrypted = await wrapper.vm.encryptData(sensitiveData, encryptionKey);

      expect(encrypted).toBeDefined();
      expect(encrypted.encryptedData).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.encryptedData).not.toContain('张三');
      expect(encrypted.encryptedData).not.toContain('110101199001011234');
    });

    it('should decrypt encrypted data correctly', async () => {
      const encryptedData = {
        encryptedData: 'base64-encoded-encrypted-data',
        iv: 'base64-encoded-iv',
        algorithm: 'aes-256-cbc'
      };

      const encryptionKey = 'secure-encryption-key-123';
      const decrypted = await wrapper.vm.decryptData(encryptedData, encryptionKey);

      expect(decrypted).toBeDefined();
      expect(decrypted.name).toBe('张三');
      expect(decrypted.idCard).toBe('110101199001011234');
    });

    it('should handle encryption failures gracefully', async () => {
      const sensitiveData = { name: '测试' };
      const invalidKey = '';

      await expect(wrapper.vm.encryptData(sensitiveData, invalidKey)).rejects.toThrow('Invalid encryption key');
    });

    it('should validate encryption key strength', async () => {
      const weakKeys = [
        '123',
        'password',
        'weak',
        'short'
      ];

      const strongKeys = [
        'secure-encryption-key-123',
        'MyStr0ngP@ssw0rd!2023',
        'A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6'
      ];

      for (const key of weakKeys) {
        const isValid = await wrapper.vm.validateEncryptionKey(key);
        expect(isValid).toBe(false);
      }

      for (const key of strongKeys) {
        const isValid = await wrapper.vm.validateEncryptionKey(key);
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Data Masking and Anonymization', () => {
    it('should mask sensitive personal information', async () => {
      const personalData = {
        name: '张三',
        idCard: '110101199001011234',
        phone: '13800138000',
        email: 'zhangsan@example.com',
        bankAccount: '6225880212345678'
      };

      const masked = await wrapper.vm.maskPersonalData(personalData);

      expect(masked.name).toBe('张*');
      expect(masked.idCard).toBe('110101********1234');
      expect(masked.phone).toBe('138****8000');
      expect(masked.email).toBe('z***n@example.com');
      expect(masked.bankAccount).toBe('622588********5678');
    });

    it('should anonymize data for statistical analysis', async () => {
      const studentData = [
        { name: '张三', age: 5, class: 'A班', score: 95 },
        { name: '李四', age: 6, class: 'B班', score: 88 },
        { name: '王五', age: 5, class: 'A班', score: 92 }
      ];

      const anonymized = await wrapper.vm.anonymizeData(studentData);

      expect(anonymized[0].name).not.toBe('张三');
      expect(anonymized[0].name).toMatch(/^student_\d+$/);
      expect(anonymized[0].age).toBe(5);
      expect(anonymized[0].class).toBe('A班');
      expect(anonymized[0].score).toBe(95);
    });

    it('should preserve data utility while protecting privacy', async () => {
      const originalData = {
        students: [
          { name: '张三', age: 5, gender: '男', score: 95 },
          { name: '李四', age: 6, gender: '女', score: 88 }
        ]
      };

      const anonymized = await wrapper.vm.anonymizeWithUtility(originalData);

      // Statistical properties should be preserved
      expect(anonymized.students.length).toBe(2);
      expect(anonymized.students[0].age).toBe(5);
      expect(anonymized.students[1].age).toBe(6);
      
      // But personal identifiers should be anonymized
      expect(anonymized.students[0].name).not.toBe('张三');
      expect(anonymized.students[1].name).not.toBe('李四');
    });
  });

  describe('Data Backup and Recovery', () => {
    it('should create encrypted data backups', async () => {
      const backupConfig = {
        dataTypes: ['students', 'teachers', 'finance'],
        encryption: true,
        compression: true,
        destination: 's3://backups/kindergarten'
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          backupId: 'backup_20250913_001',
          size: '2.5GB',
          checksum: 'sha256:abcdef123456'
        }
      });

      const result = await wrapper.vm.createBackup(backupConfig);
      expect(result.success).toBe(true);
      expect(result.backupId).toBeDefined();
      expect(result.size).toBeDefined();
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/backups', backupConfig);
    });

    it('should restore data from encrypted backups', async () => {
      const backupId = 'backup_20250913_001';
      const restoreConfig = {
        backupId,
        decryptionKey: 'secure-restore-key',
        validateIntegrity: true
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          restoredRecords: 1250,
          validationPassed: true
        }
      });

      const result = await wrapper.vm.restoreBackup(restoreConfig);
      expect(result.success).toBe(true);
      expect(result.restoredRecords).toBe(1250);
      expect(result.validationPassed).toBe(true);
    });

    it('should validate backup integrity', async () => {
      const backupId = 'backup_20250913_001';
      const expectedChecksum = 'sha256:abcdef123456';

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          checksum: expectedChecksum,
          isValid: true
        }
      });

      const result = await wrapper.vm.validateBackupIntegrity(backupId, expectedChecksum);
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(true);
    });

    it('should handle backup failures gracefully', async () => {
      const backupConfig = {
        dataTypes: ['students'],
        encryption: true
      };

      mockedAxios.post.mockRejectedValue(new Error('Backup storage unavailable'));

      const result = await wrapper.vm.createBackup(backupConfig);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Data Retention and Deletion', () => {
    it('should enforce data retention policies', async () => {
      const retentionPolicies = [
        {
          dataType: 'student_records',
          retentionPeriod: 365, // days
          action: 'archive'
        },
        {
          dataType: 'application_logs',
          retentionPeriod: 90,
          action: 'delete'
        },
        {
          dataType: 'temporary_files',
          retentionPeriod: 30,
          action: 'delete'
        }
      ];

      const expiredData = await wrapper.vm.identifyExpiredData(retentionPolicies);
      expect(expiredData.length).toBeGreaterThan(0);
      expect(expiredData[0].dataType).toBeDefined();
      expect(expiredData[0].expiredDate).toBeDefined();
    });

    it('should securely delete sensitive data', async () => {
      const dataToDelete = {
        type: 'student_personal_info',
        records: [1, 2, 3, 4, 5],
        method: 'secure_erase'
      };

      mockedAxios.delete.mockResolvedValue({
        data: {
          success: true,
          deletedRecords: 5,
          verificationPassed: true
        }
      });

      const result = await wrapper.vm.secureDeleteData(dataToDelete);
      expect(result.success).toBe(true);
      expect(result.deletedRecords).toBe(5);
      expect(result.verificationPassed).toBe(true);
    });

    it('should verify data deletion completion', async () => {
      const deletionRequest = {
        requestId: 'del_20250913_001',
        recordsToDelete: [1, 2, 3]
      };

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          status: 'completed',
          deletedRecords: 3,
          remainingRecords: 0
        }
      });

      const result = await wrapper.vm.verifyDataDeletion(deletionRequest);
      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
      expect(result.remainingRecords).toBe(0);
    });
  });

  describe('Data Access Control and Auditing', () => {
    it('should log all data access attempts', async () => {
      const accessEvent = {
        userId: 1,
        action: 'read',
        resourceType: 'student_records',
        resourceId: 123,
        timestamp: Date.now(),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0'
      };

      await wrapper.vm.logDataAccess(accessEvent);
      expect(dataProtectionStore.auditLogs.length).toBeGreaterThan(0);
      expect(dataProtectionStore.auditLogs[0].action).toBe('read');
    });

    it('should detect suspicious data access patterns', async () => {
      const accessPatterns = [
        { userId: 1, resourceType: 'student_records', count: 100, timeWindow: 3600 },
        { userId: 2, resourceType: 'financial_data', count: 50, timeWindow: 1800 },
        { userId: 3, resourceType: 'student_records', count: 200, timeWindow: 3600 }
      ];

      const suspiciousPatterns = await wrapper.vm.detectSuspiciousAccess(accessPatterns);
      expect(suspiciousPatterns.length).toBeGreaterThan(0);
      expect(suspiciousPatterns[0].isSuspicious).toBe(true);
    });

    it('should implement data access approval workflow', async () => {
      const accessRequest = {
        userId: 1,
        requestedResource: 'student_personal_info',
        reason: 'Academic research',
        requestedBy: 'teacher_zhang',
        approvalRequired: true
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          requestId: 'access_req_20250913_001',
          status: 'pending_approval'
        }
      });

      const result = await wrapper.vm.requestDataAccess(accessRequest);
      expect(result.success).toBe(true);
      expect(result.requestId).toBeDefined();
      expect(result.status).toBe('pending_approval');
    });
  });

  describe('Data Privacy Compliance', () => {
    it('should generate data privacy reports', async () => {
      const reportConfig = {
        reportType: 'data_inventory',
        dateRange: {
          start: '2025-01-01',
          end: '2025-09-13'
        },
        includeSensitiveData: true
      };

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          report: {
            totalRecords: 5000,
            sensitiveRecords: 1200,
            dataCategories: ['personal', 'financial', 'academic'],
            complianceScore: 95
          }
        }
      });

      const result = await wrapper.vm.generatePrivacyReport(reportConfig);
      expect(result.success).toBe(true);
      expect(result.report.totalRecords).toBe(5000);
      expect(result.report.complianceScore).toBe(95);
    });

    it('should handle data subject access requests (DSAR)', async () => {
      const dsarRequest = {
        subjectId: 'student_123',
        requestType: 'access',
        requestedData: ['personal', 'academic', 'financial'],
        identityVerified: true
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          requestData: {
            personalInfo: { name: '张三', age: 5 },
            academicInfo: { class: 'A班', scores: [95, 88, 92] },
            financialInfo: { tuitionPaid: true, balance: 0 }
          }
        }
      });

      const result = await wrapper.vm.handleDSAR(dsarRequest);
      expect(result.success).toBe(true);
      expect(result.requestData.personalInfo).toBeDefined();
      expect(result.requestData.academicInfo).toBeDefined();
      expect(result.requestData.financialInfo).toBeDefined();
    });

    it('should process data erasure requests', async () => {
      const erasureRequest = {
        subjectId: 'student_456',
        reason: 'withdrawal',
        legalBasis: 'gdpr_right_to_erasure',
        confirmationReceived: true
      };

      mockedAxios.delete.mockResolvedValue({
        data: {
          success: true,
          erasedRecords: 25,
          retentionBackup: 'backup_erasure_20250913_001'
        }
      });

      const result = await wrapper.vm.processErasureRequest(erasureRequest);
      expect(result.success).toBe(true);
      expect(result.erasedRecords).toBe(25);
    });
  });

  describe('Data Breach Response', () => {
    it('should detect potential data breaches', async () => {
      const systemEvents = [
        { type: 'unauthorized_access', severity: 'high', count: 5 },
        { type: 'data_export', severity: 'medium', count: 100 },
        { type: 'failed_login', severity: 'low', count: 50 }
      ];

      const breachAlerts = await wrapper.vm.detectDataBreaches(systemEvents);
      expect(breachAlerts.length).toBeGreaterThan(0);
      expect(breachAlerts[0].severity).toBe('high');
    });

    it('should initiate breach response protocol', async () => {
      const breachIncident = {
        id: 'breach_20250913_001',
        type: 'unauthorized_access',
        affectedRecords: 150,
        dataTypes: ['personal', 'contact'],
        severity: 'high'
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          responseId: 'response_20250913_001',
          actions: ['contain', 'notify', 'investigate'],
          estimatedResolution: '2025-09-14T18:00:00Z'
        }
      });

      const result = await wrapper.vm.initiateBreachResponse(breachIncident);
      expect(result.success).toBe(true);
      expect(result.responseId).toBeDefined();
      expect(result.actions).toContain('contain');
    });

    it('should generate breach notification reports', async () => {
      const breachData = {
        breachId: 'breach_20250913_001',
        affectedUsers: 150,
        dataTypes: ['personal_info', 'contact_details'],
        breachDate: '2025-09-13',
        mitigationSteps: ['password_reset', 'system_audit']
      };

      const notificationReport = await wrapper.vm.generateBreachNotification(breachData);
      expect(notificationReport.title).toBe('Data Breach Notification');
      expect(notificationReport.affectedUsers).toBe(150);
      expect(notificationReport.mitigationSteps.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle bulk data encryption efficiently', async () => {
      const largeDataset = Array(1000).fill(0).map((_, i) => ({
        id: i + 1,
        name: `Student ${i + 1}`,
        sensitiveData: `Sensitive info ${i + 1}`
      }));

      const startTime = Date.now();
      const encryptedData = await wrapper.vm.bulkEncryptData(largeDataset, 'secure-key-123');
      const endTime = Date.now();

      expect(encryptedData.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should maintain encryption performance with increasing data volume', async () => {
      const dataSizes = [100, 500, 1000, 2000];
      const performanceResults = [];

      for (const size of dataSizes) {
        const dataset = Array(size).fill(0).map((_, i) => ({
          id: i + 1,
          data: `Test data ${i + 1}`
        }));

        const startTime = Date.now();
        await wrapper.vm.bulkEncryptData(dataset, 'test-key');
        const endTime = Date.now();

        performanceResults.push({
          size,
          duration: endTime - startTime
        });
      }

      // Performance should not degrade exponentially
      expect(performanceResults[3].duration).toBeLessThan(performanceResults[0].duration * 10);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle encryption key corruption', async () => {
      const corruptedKey = 'corrupted-key-with-invalid-characters';
      const testData = { sensitive: 'data' };

      await expect(wrapper.vm.encryptData(testData, corruptedKey)).rejects.toThrow();
    });

    it('should recover from backup restoration failures', async () => {
      const restoreConfig = {
        backupId: 'corrupted_backup',
        retryAttempts: 3
      };

      mockedAxios.post.mockRejectedValue(new Error('Backup corrupted'));

      const result = await wrapper.vm.restoreBackupWithRetry(restoreConfig);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.retryAttempts).toBe(3);
    });

    it('should validate data integrity after operations', async () => {
      const originalData = { name: '张三', id: 123 };
      const encrypted = await wrapper.vm.encryptData(originalData, 'test-key');
      const decrypted = await wrapper.vm.decryptData(encrypted, 'test-key');

      const integrityCheck = await wrapper.vm.validateDataIntegrity(originalData, decrypted);
      expect(integrityCheck.isValid).toBe(true);
    });
  });
});