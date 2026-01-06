/**
 * 安全监控API
 * 提供系统安全监控、威胁检测、漏洞管理等功能
 */

import { request } from '@/utils/request';

export interface SecurityOverview {
  securityScore: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
  vulnerabilities: number;
  riskLevel: number;
  lastScanTime?: string;
  connectionStatus: string;
}

export interface SecurityThreat {
  id: number;
  threatType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'ignored' | 'blocked';
  sourceIp?: string;
  targetResource?: string;
  description: string;
  detectionMethod: string;
  riskScore: number;
  handledBy?: number;
  handledAt?: string;
  notes?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityVulnerability {
  id: number;
  cveId?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'confirmed' | 'fixed' | 'ignored' | 'false_positive';
  category: string;
  affectedComponent: string;
  discoveryMethod: string;
  cvssScore?: number;
  exploitability: 'none' | 'low' | 'medium' | 'high';
  impact: 'none' | 'low' | 'medium' | 'high';
  solution?: string;
  references?: string;
  discoveredBy?: number;
  assignedTo?: number;
  fixedBy?: number;
  fixedAt?: string;
  verifiedAt?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expectedImprovement: string;
  effortLevel: number;
  implementing?: boolean;
}

export interface ThreatQuery {
  page?: number;
  pageSize?: number;
  severity?: string;
  status?: string;
}

export interface VulnerabilityQuery {
  page?: number;
  pageSize?: number;
  severity?: string;
  status?: string;
}

export interface ScanRequest {
  scanType?: 'quick' | 'full' | 'custom';
  targets?: string[];
}

export interface ThreatHandleRequest {
  action: 'resolve' | 'ignore' | 'block';
  notes?: string;
}

export const securityApi = {
  /**
   * 获取安全概览
   */
  async getOverview(): Promise<SecurityOverview> {
    const response = await request.get('/api/security/overview');
    return response.data;
  },

  /**
   * 获取威胁列表
   */
  async getThreats(query: ThreatQuery = {}) {
    const response = await request.get('/api/security/threats', { params: query });
    return response.data;
  },

  /**
   * 处理威胁
   */
  async handleThreat(threatId: string | number, data: ThreatHandleRequest) {
    const response = await request.post(`/security/threats/${threatId}/handle`, data);
    return response.data;
  },

  /**
   * 执行安全扫描
   */
  async performScan(data: ScanRequest = {}) {
    const response = await request.post('/api/security/scan', data);
    return response.data;
  },

  /**
   * 获取漏洞列表
   */
  async getVulnerabilities(query: VulnerabilityQuery = {}) {
    const response = await request.get('/api/security/vulnerabilities', { params: query });
    return response.data;
  },

  /**
   * 获取安全建议
   */
  async getRecommendations(): Promise<SecurityRecommendation[]> {
    const response = await request.get('/api/security/recommendations');
    return response.data;
  },

  /**
   * 生成AI安全建议
   */
  async generateAIRecommendations(): Promise<SecurityRecommendation[]> {
    const response = await request.post('/api/security/recommendations/generate');
    return response.data;
  },

  /**
   * 获取安全配置
   */
  async getConfig() {
    const response = await request.get('/api/security/config');
    return response.data;
  },

  /**
   * 更新安全配置
   */
  async updateConfig(config: any) {
    const response = await request.put('/api/security/config', config);
    return response.data;
  }
};

export default securityApi;
