
vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
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

describe, it, expect, vi, beforeEach } from 'vitest';
import securityApi, {
  type SecurityOverview,
  type SecurityThreat,
  type SecurityVulnerability,
  type SecurityRecommendation,
  type ThreatQuery,
  type VulnerabilityQuery,
  type ScanRequest,
  type ThreatHandleRequest
} from '@/api/security';

// Mock request utility
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock request已在全局设置中配置

describe('Security API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOverview', () => {
    it('should call get with correct endpoint', async () => {
      const mockOverview: SecurityOverview = {
        securityScore: 85,
        threatLevel: 'medium',
        activeThreats: 3,
        vulnerabilities: 5,
        riskLevel: 2,
        lastScanTime: '2024-01-15T10:00:00Z',
        connectionStatus: 'connected'
      };
      
      mockRequest.get.mockResolvedValue({ data: mockOverview });
      
      const result = await securityApi.getOverview();
      
      expect(mockRequest.get).toHaveBeenCalledWith('/security/overview');
      expect(result).toEqual(mockOverview);
    });

    it('should handle overview API errors', async () => {
      const mockError = new Error('Failed to fetch security overview');
      
      mockRequest.get.mockRejectedValue(mockError);
      
      await expect(securityApi.getOverview()).rejects.toThrow('Failed to fetch security overview');
    });
  });

  describe('getThreats', () => {
    it('should call get with correct endpoint and query params', async () => {
      const mockQuery: ThreatQuery = {
        page: 1,
        pageSize: 10,
        severity: 'high',
        status: 'active'
      };
      const mockThreats: SecurityThreat[] = [
        {
          id: 1,
          threatType: 'malware',
          severity: 'high',
          status: 'active',
          sourceIp: '192.168.1.100',
          targetResource: '/api/users',
          description: 'Suspicious activity detected',
          detectionMethod: 'signature',
          riskScore: 8,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
      ];
      
      mockRequest.get.mockResolvedValue({ data: mockThreats });
      
      const result = await securityApi.getThreats(mockQuery);
      
      expect(mockRequest.get).toHaveBeenCalledWith('/security/threats', { params: mockQuery });
      expect(result).toEqual(mockThreats);
    });

    it('should handle empty threat list with default query', async () => {
      const mockThreats: SecurityThreat[] = [];
      
      mockRequest.get.mockResolvedValue({ data: mockThreats });
      
      const result = await securityApi.getThreats();
      
      expect(mockRequest.get).toHaveBeenCalledWith('/security/threats', { params: {} });
      expect(result).toEqual(mockThreats);
    });

    it('should handle threats API errors', async () => {
      const mockQuery: ThreatQuery = { page: 1 };
      const mockError = new Error('Failed to fetch threats');
      
      mockRequest.get.mockRejectedValue(mockError);
      
      await expect(securityApi.getThreats(mockQuery)).rejects.toThrow('Failed to fetch threats');
    });
  });

  describe('handleThreat', () => {
    it('should call post with correct endpoint and data', async () => {
      const threatId = '1';
      const mockHandleData: ThreatHandleRequest = {
        action: 'resolve',
        notes: 'Threat resolved by security team'
      };
      const mockResponse = { success: true, message: 'Threat handled successfully' };
      
      mockRequest.post.mockResolvedValue({ data: mockResponse });
      
      const result = await securityApi.handleThreat(threatId, mockHandleData);
      
      expect(mockRequest.post).toHaveBeenCalledWith(`/security/threats/${threatId}/handle`, mockHandleData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle different threat actions', async () => {
      const threatId = '2';
      const mockHandleData: ThreatHandleRequest = {
        action: 'block',
        notes: 'Blocking malicious IP'
      };
      
      mockRequest.post.mockResolvedValue({ data: { success: true } });
      
      await securityApi.handleThreat(threatId, mockHandleData);
      
      expect(mockRequest.post).toHaveBeenCalledWith(`/security/threats/${threatId}/handle`, mockHandleData);
    });

    it('should handle threat handling errors', async () => {
      const threatId = '999';
      const mockHandleData: ThreatHandleRequest = { action: 'resolve' };
      const mockError = new Error('Threat not found');
      
      mockRequest.post.mockRejectedValue(mockError);
      
      await expect(securityApi.handleThreat(threatId, mockHandleData)).rejects.toThrow('Threat not found');
    });
  });

  describe('performScan', () => {
    it('should call post with correct endpoint and scan data', async () => {
      const mockScanData: ScanRequest = {
        scanType: 'full',
        targets: ['192.168.1.0/24', '10.0.0.0/8']
      };
      const mockResponse = {
        scanId: 'scan-123',
        status: 'started',
        estimatedDuration: 300
      };
      
      mockRequest.post.mockResolvedValue({ data: mockResponse });
      
      const result = await securityApi.performScan(mockScanData);
      
      expect(mockRequest.post).toHaveBeenCalledWith('/security/scan', mockScanData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle scan with default parameters', async () => {
      const mockResponse = { scanId: 'scan-456', status: 'started' };
      
      mockRequest.post.mockResolvedValue({ data: mockResponse });
      
      const result = await securityApi.performScan();
      
      expect(mockRequest.post).toHaveBeenCalledWith('/security/scan', {});
      expect(result).toEqual(mockResponse);
    });

    it('should handle scan execution errors', async () => {
      const mockScanData: ScanRequest = { scanType: 'quick' };
      const mockError = new Error('Scan failed to start');
      
      mockRequest.post.mockRejectedValue(mockError);
      
      await expect(securityApi.performScan(mockScanData)).rejects.toThrow('Scan failed to start');
    });
  });

  describe('getVulnerabilities', () => {
    it('should call get with correct endpoint and query params', async () => {
      const mockQuery: VulnerabilityQuery = {
        page: 1,
        pageSize: 20,
        severity: 'critical',
        status: 'open'
      };
      const mockVulnerabilities: SecurityVulnerability[] = [
        {
          id: 1,
          cveId: 'CVE-2024-1234',
          title: 'Critical SQL Injection Vulnerability',
          description: 'SQL injection vulnerability in user authentication module',
          severity: 'critical',
          status: 'open',
          category: 'injection',
          affectedComponent: 'auth-service',
          discoveryMethod: 'automated',
          cvssScore: 9.8,
          exploitability: 'high',
          impact: 'high',
          solution: 'Update to latest version',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
      ];
      
      mockRequest.get.mockResolvedValue({ data: mockVulnerabilities });
      
      const result = await securityApi.getVulnerabilities(mockQuery);
      
      expect(mockRequest.get).toHaveBeenCalledWith('/security/vulnerabilities', { params: mockQuery });
      expect(result).toEqual(mockVulnerabilities);
    });

    it('should handle empty vulnerability list with default query', async () => {
      const mockVulnerabilities: SecurityVulnerability[] = [];
      
      mockRequest.get.mockResolvedValue({ data: mockVulnerabilities });
      
      const result = await securityApi.getVulnerabilities();
      
      expect(mockRequest.get).toHaveBeenCalledWith('/security/vulnerabilities', { params: {} });
      expect(result).toEqual(mockVulnerabilities);
    });

    it('should handle vulnerabilities API errors', async () => {
      const mockQuery: VulnerabilityQuery = { page: 1 };
      const mockError = new Error('Failed to fetch vulnerabilities');
      
      mockRequest.get.mockRejectedValue(mockError);
      
      await expect(securityApi.getVulnerabilities(mockQuery)).rejects.toThrow('Failed to fetch vulnerabilities');
    });
  });

  describe('getRecommendations', () => {
    it('should call get with correct endpoint', async () => {
      const mockRecommendations: SecurityRecommendation[] = [
        {
          id: 'rec-1',
          title: 'Enable Two-Factor Authentication',
          description: 'Implement 2FA for all user accounts to enhance security',
          priority: 'high',
          expectedImprovement: 'Reduce unauthorized access by 99%',
          effortLevel: 3,
          implementing: false
        },
        {
          id: 'rec-2',
          title: 'Update SSL/TLS Certificates',
          description: 'Renew expired SSL certificates to ensure secure communications',
          priority: 'medium',
          expectedImprovement: 'Maintain secure data transmission',
          effortLevel: 2,
          implementing: false
        }
      ];
      
      mockRequest.get.mockResolvedValue({ data: mockRecommendations });
      
      const result = await securityApi.getRecommendations();
      
      expect(mockRequest.get).toHaveBeenCalledWith('/security/recommendations');
      expect(result).toEqual(mockRecommendations);
    });

    it('should handle empty recommendations list', async () => {
      const mockRecommendations: SecurityRecommendation[] = [];
      
      mockRequest.get.mockResolvedValue({ data: mockRecommendations });
      
      const result = await securityApi.getRecommendations();
      
      expect(result).toEqual(mockRecommendations);
    });

    it('should handle recommendations API errors', async () => {
      const mockError = new Error('Failed to fetch recommendations');
      
      mockRequest.get.mockRejectedValue(mockError);
      
      await expect(securityApi.getRecommendations()).rejects.toThrow('Failed to fetch recommendations');
    });
  });

  describe('generateAIRecommendations', () => {
    it('should call post with correct endpoint', async () => {
      const mockRecommendations: SecurityRecommendation[] = [
        {
          id: 'ai-rec-1',
          title: 'AI-Generated Security Enhancement',
          description: 'AI-recommended security improvement based on current threat landscape',
          priority: 'critical',
          expectedImprovement: 'Significant security posture improvement',
          effortLevel: 5,
          implementing: false
        }
      ];
      
      mockRequest.post.mockResolvedValue({ data: mockRecommendations });
      
      const result = await securityApi.generateAIRecommendations();
      
      expect(mockRequest.post).toHaveBeenCalledWith('/security/recommendations/generate');
      expect(result).toEqual(mockRecommendations);
    });

    it('should handle AI generation errors', async () => {
      const mockError = new Error('AI service unavailable');
      
      mockRequest.post.mockRejectedValue(mockError);
      
      await expect(securityApi.generateAIRecommendations()).rejects.toThrow('AI service unavailable');
    });
  });

  describe('getConfig', () => {
    it('should call get with correct endpoint', async () => {
      const mockConfig = {
        firewallEnabled: true,
        intrusionDetection: true,
        autoUpdates: true,
        logRetentionDays: 90,
        alertThresholds: {
          critical: 1,
          high: 3,
          medium: 5
        }
      };
      
      mockRequest.get.mockResolvedValue({ data: mockConfig });
      
      const result = await securityApi.getConfig();
      
      expect(mockRequest.get).toHaveBeenCalledWith('/security/config');
      expect(result).toEqual(mockConfig);
    });

    it('should handle config API errors', async () => {
      const mockError = new Error('Failed to fetch security config');
      
      mockRequest.get.mockRejectedValue(mockError);
      
      await expect(securityApi.getConfig()).rejects.toThrow('Failed to fetch security config');
    });
  });

  describe('updateConfig', () => {
    it('should call put with correct endpoint and config data', async () => {
      const mockConfig = {
        firewallEnabled: false,
        intrusionDetection: true,
        autoUpdates: false,
        logRetentionDays: 30
      };
      const mockResponse = { success: true, message: 'Configuration updated successfully' };
      
      mockRequest.put.mockResolvedValue({ data: mockResponse });
      
      const result = await securityApi.updateConfig(mockConfig);
      
      expect(mockRequest.put).toHaveBeenCalledWith('/security/config', mockConfig);
      expect(result).toEqual(mockResponse);
    });

    it('should handle partial config updates', async () => {
      const partialConfig = {
        firewallEnabled: true
      };
      
      mockRequest.put.mockResolvedValue({ data: { success: true } });
      
      await securityApi.updateConfig(partialConfig);
      
      expect(mockRequest.put).toHaveBeenCalledWith('/security/config', partialConfig);
    });

    it('should handle config update errors', async () => {
      const mockConfig = { firewallEnabled: true };
      const mockError = new Error('Invalid configuration');
      
      mockRequest.put.mockRejectedValue(mockError);
      
      await expect(securityApi.updateConfig(mockConfig)).rejects.toThrow('Invalid configuration');
    });
  });

  describe('Type Safety', () => {
    it('should handle all severity levels correctly', async () => {
      const severities = ['low', 'medium', 'high', 'critical'] as const;
      
      for (const severity of severities) {
        const mockThreat: SecurityThreat = {
          id: 1,
          threatType: 'test',
          severity,
          status: 'active',
          description: 'Test threat',
          detectionMethod: 'test',
          riskScore: 5,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        };
        
        mockRequest.get.mockResolvedValue({ data: [mockThreat] });
        
        const result = await securityApi.getThreats({ severity });
        expect(result[0].severity).toBe(severity);
      }
    });

    it('should handle all threat statuses correctly', async () => {
      const statuses = ['active', 'resolved', 'ignored', 'blocked'] as const;
      
      for (const status of statuses) {
        const mockThreat: SecurityThreat = {
          id: 1,
          threatType: 'test',
          severity: 'medium',
          status,
          description: 'Test threat',
          detectionMethod: 'test',
          riskScore: 5,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        };
        
        mockRequest.get.mockResolvedValue({ data: [mockThreat] });
        
        const result = await securityApi.getThreats({ status });
        expect(result[0].status).toBe(status);
      }
    });

    it('should handle all vulnerability statuses correctly', async () => {
      const statuses = ['open', 'confirmed', 'fixed', 'ignored', 'false_positive'] as const;
      
      for (const status of statuses) {
        const mockVulnerability: SecurityVulnerability = {
          id: 1,
          title: 'Test vulnerability',
          description: 'Test description',
          severity: 'medium',
          status,
          category: 'test',
          affectedComponent: 'test',
          discoveryMethod: 'test',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        };
        
        mockRequest.get.mockResolvedValue({ data: [mockVulnerability] });
        
        const result = await securityApi.getVulnerabilities({ status });
        expect(result[0].status).toBe(status);
      }
    });

    it('should handle all recommendation priorities correctly', async () => {
      const priorities = ['low', 'medium', 'high', 'critical'] as const;
      
      for (const priority of priorities) {
        const mockRecommendation: SecurityRecommendation = {
          id: `rec-${priority}`,
          title: 'Test recommendation',
          description: 'Test description',
          priority,
          expectedImprovement: 'Test improvement',
          effortLevel: 3,
          implementing: false
        };
        
        mockRequest.get.mockResolvedValue({ data: [mockRecommendation] });
        
        const result = await securityApi.getRecommendations();
        expect(result[0].priority).toBe(priority);
      }
    });
  });
});