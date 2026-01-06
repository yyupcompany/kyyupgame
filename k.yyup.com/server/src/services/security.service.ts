/**
 * 安全服务类
 * 提供系统安全监控、威胁检测、漏洞扫描等功能
 */

import { Op } from 'sequelize';
import { SecurityThreat } from '../models/SecurityThreat';
import { SecurityVulnerability } from '../models/SecurityVulnerability';
import { SecurityConfig } from '../models/SecurityConfig';
import { SecurityScanLog } from '../models/SecurityScanLog';
import { SystemMonitorService } from './system-monitor.service';

export interface SecurityOverview {
  securityScore: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
  vulnerabilities: number;
  riskLevel: number;
  lastScanTime?: string;
  connectionStatus: string;
}

export interface ThreatQuery {
  page: number;
  pageSize: number;
  severity?: string;
  status?: string;
}

export interface VulnerabilityQuery {
  page: number;
  pageSize: number;
  severity?: string;
  status?: string;
}

export class SecurityService {
  private systemMonitor = SystemMonitorService.getInstance();

  /**
   * 获取安全概览
   */
  async getSecurityOverview(): Promise<SecurityOverview> {
    try {
      // 获取活跃威胁数量
      const activeThreats = await SecurityThreat.count({
        where: { status: 'active' }
      });

      // 获取未修复漏洞数量
      const vulnerabilities = await SecurityVulnerability.count({
        where: { status: { [Op.in]: ['open', 'confirmed'] } }
      });

      // 计算安全评分
      const securityScore = this.calculateSecurityScore(activeThreats, vulnerabilities);

      // 确定威胁等级
      const threatLevel = this.determineThreatLevel(activeThreats, vulnerabilities);

      // 计算风险等级
      const riskLevel = this.calculateRiskLevel(securityScore);

      // 获取最后扫描时间
      const lastScan = await SecurityScanLog.findOne({
        order: [['createdAt', 'DESC']]
      });

      return {
        securityScore,
        threatLevel,
        activeThreats,
        vulnerabilities,
        riskLevel,
        lastScanTime: lastScan?.createdAt?.toISOString(),
        connectionStatus: 'connected'
      };
    } catch (error) {
      console.error('获取安全概览失败:', error);
      throw error;
    }
  }

  /**
   * 获取威胁列表
   */
  async getThreats(query: ThreatQuery) {
    try {
      const { page, pageSize, severity, status = 'active' } = query;
      const offset = (page - 1) * pageSize;

      const whereClause: any = { status };
      if (severity) {
        whereClause.severity = severity;
      }

      const { rows: threats, count: total } = await SecurityThreat.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset,
        attributes: [
          'id', 'threatType', 'severity', 'status', 'sourceIp',
          'targetResource', 'description', 'detectionMethod', 'riskScore',
          'handledBy', 'handledAt', 'notes', 'metadata', 'createdAt', 'updatedAt'
        ]
      });

      return {
        threats,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      console.error('获取威胁列表失败:', error);
      throw error;
    }
  }

  /**
   * 处理威胁
   */
  async handleThreat(threatId: string, action: string, notes?: string, userId?: number) {
    try {
      const threat = await SecurityThreat.findByPk(threatId);
      if (!threat) {
        throw new Error('威胁不存在');
      }

      let newStatus: 'active' | 'resolved' | 'ignored' | 'blocked' = 'active';
      switch (action) {
        case 'resolve':
          newStatus = 'resolved';
          break;
        case 'ignore':
          newStatus = 'ignored';
          break;
        case 'block':
          newStatus = 'blocked';
          // 这里可以添加实际的阻止逻辑，比如添加到防火墙黑名单
          break;
        default:
          throw new Error('无效的处理动作');
      }

      await threat.update({
        status: newStatus,
        handledBy: userId,
        handledAt: new Date(),
        notes
      });

      return { success: true, message: '威胁处理成功' };
    } catch (error) {
      console.error('处理威胁失败:', error);
      throw error;
    }
  }

  /**
   * 执行安全扫描
   */
  async performSecurityScan(scanType: string, targets: string[], userId?: number) {
    try {
      // 创建扫描日志
      const scanLog = await SecurityScanLog.create({
        scanType,
        targets: JSON.stringify(targets),
        status: 'running',
        startedBy: userId,
        startedAt: new Date()
      });

      // 异步执行扫描
      this.executeScan(scanLog.id, scanType, targets).catch(error => {
        console.error('扫描执行失败:', error);
      });

      return {
        scanId: scanLog.id,
        status: 'started',
        message: '安全扫描已启动'
      };
    } catch (error) {
      console.error('启动安全扫描失败:', error);
      throw error;
    }
  }

  /**
   * 获取漏洞列表
   */
  async getVulnerabilities(query: VulnerabilityQuery) {
    try {
      const { page, pageSize, severity, status } = query;
      const offset = (page - 1) * pageSize;

      const whereClause: any = {};
      if (severity) {
        whereClause.severity = severity;
      }
      if (status) {
        whereClause.status = status;
      }

      const { rows: vulnerabilities, count: total } = await SecurityVulnerability.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset
      });

      return {
        vulnerabilities,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      console.error('获取漏洞列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取安全建议
   */
  async getSecurityRecommendations() {
    try {
      // 基于当前安全状态生成建议
      const overview = await this.getSecurityOverview();
      const recommendations = [];

      if (overview.activeThreats > 0) {
        recommendations.push({
          id: 'threat-handling',
          title: '处理活跃威胁',
          description: `系统检测到 ${overview.activeThreats} 个活跃威胁，建议立即处理`,
          priority: 'critical',
          expectedImprovement: '消除当前安全威胁，提升系统安全性',
          effortLevel: 2
        });
      }

      if (overview.vulnerabilities > 5) {
        recommendations.push({
          id: 'vulnerability-patching',
          title: '修复系统漏洞',
          description: `发现 ${overview.vulnerabilities} 个安全漏洞，建议及时修复`,
          priority: 'high',
          expectedImprovement: '修复已知漏洞，减少攻击面',
          effortLevel: 3
        });
      }

      if (overview.securityScore < 80) {
        recommendations.push({
          id: 'security-hardening',
          title: '加强安全配置',
          description: '当前安全评分较低，建议加强系统安全配置',
          priority: 'medium',
          expectedImprovement: '提升整体安全防护能力',
          effortLevel: 4
        });
      }

      // 添加常规安全建议
      recommendations.push(
        {
          id: 'mfa-enable',
          title: '启用多因素认证',
          description: '为管理员账户启用多因素认证，提高账户安全性',
          priority: 'high',
          expectedImprovement: '账户安全性提升80%，降低密码攻击风险',
          effortLevel: 3
        },
        {
          id: 'password-policy',
          title: '加强密码策略',
          description: '实施更严格的密码复杂度要求和定期更换策略',
          priority: 'medium',
          expectedImprovement: '密码强度提升60%，降低暴力破解风险',
          effortLevel: 2
        }
      );

      return recommendations;
    } catch (error) {
      console.error('获取安全建议失败:', error);
      throw error;
    }
  }

  /**
   * 生成AI安全建议
   */
  async generateAIRecommendations(userId?: number) {
    try {
      // 这里可以集成AI服务来生成个性化建议
      // 目前返回基础建议
      return await this.getSecurityRecommendations();
    } catch (error) {
      console.error('生成AI安全建议失败:', error);
      throw error;
    }
  }

  /**
   * 获取安全配置
   */
  async getSecurityConfig() {
    try {
      const configs = await SecurityConfig.findAll();
      const configMap: any = {};
      
      configs.forEach(config => {
        configMap[config.configKey] = {
          value: config.configValue,
          description: config.description,
          lastUpdated: config.updatedAt
        };
      });

      return configMap;
    } catch (error) {
      console.error('获取安全配置失败:', error);
      throw error;
    }
  }

  /**
   * 更新安全配置
   */
  async updateSecurityConfig(configData: any, userId?: number) {
    try {
      const updates = [];
      
      for (const [key, value] of Object.entries(configData)) {
        const [config] = await SecurityConfig.findOrCreate({
          where: { configKey: key },
          defaults: {
            configKey: key,
            configValue: JSON.stringify(value),
            updatedBy: userId
          }
        });

        if (config) {
          await config.update({
            configValue: JSON.stringify(value),
            updatedBy: userId
          });
        }
        
        updates.push({ key, value });
      }

      return { success: true, updates };
    } catch (error) {
      console.error('更新安全配置失败:', error);
      throw error;
    }
  }

  /**
   * 计算安全评分
   */
  private calculateSecurityScore(threats: number, vulnerabilities: number): number {
    let score = 100;
    score -= threats * 10; // 每个威胁扣10分
    score -= vulnerabilities * 2; // 每个漏洞扣2分
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 确定威胁等级
   */
  private determineThreatLevel(threats: number, vulnerabilities: number): 'low' | 'medium' | 'high' | 'critical' {
    if (threats >= 5 || vulnerabilities >= 20) return 'critical';
    if (threats >= 3 || vulnerabilities >= 10) return 'high';
    if (threats >= 1 || vulnerabilities >= 5) return 'medium';
    return 'low';
  }

  /**
   * 计算风险等级
   */
  private calculateRiskLevel(securityScore: number): number {
    return Math.max(0, 100 - securityScore);
  }

  /**
   * 执行扫描（异步）
   */
  private async executeScan(scanId: number, scanType: string, targets: string[]) {
    try {
      // 模拟扫描过程
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 模拟发现威胁和漏洞
      const foundThreats = Math.floor(Math.random() * 3);
      const foundVulnerabilities = Math.floor(Math.random() * 5);

      // 更新扫描日志
      await SecurityScanLog.update({
        status: 'completed',
        completedAt: new Date(),
        threatsFound: foundThreats,
        vulnerabilitiesFound: foundVulnerabilities,
        results: JSON.stringify({
          summary: `扫描完成，发现 ${foundThreats} 个威胁，${foundVulnerabilities} 个漏洞`,
          details: {
            scanType,
            targets,
            duration: '5秒'
          }
        })
      }, {
        where: { id: scanId }
      });

    } catch (error) {
      console.error('扫描执行失败:', error);
      await SecurityScanLog.update({
        status: 'failed',
        completedAt: new Date(),
        results: JSON.stringify({ error: (error as Error).message || '未知错误' })
      }, {
        where: { id: scanId }
      });
    }
  }
}
