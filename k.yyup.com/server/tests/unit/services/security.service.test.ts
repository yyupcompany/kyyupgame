import { vi } from 'vitest'
/**
 * Security Service Test
 * 安全服务测试
 * 
 * 测试覆盖范围：
 * - 安全概览获取功能
 * - 威胁列表查询
 * - 威胁处理功能
 * - 安全扫描执行
 * - 漏洞列表查询
 * - 安全建议生成
 * - AI安全建议生成
 * - 安全配置管理
 * - 安全评分计算
 * - 威胁等级判断
 * - 风险等级计算
 * - 错误处理机制
 */

import { SecurityService } from '../../../src/services/security.service'
import { SecurityThreat } from '../../../src/models/SecurityThreat'
import { SecurityVulnerability } from '../../../src/models/SecurityVulnerability'
import { SecurityConfig } from '../../../src/models/SecurityConfig'
import { SecurityScanLog } from '../../../src/models/SecurityScanLog'
import { SystemMonitorService } from '../../../src/services/system-monitor.service'

// Mock dependencies
jest.mock('../../../src/models/SecurityThreat')
jest.mock('../../../src/models/SecurityVulnerability')
jest.mock('../../../src/models/SecurityConfig')
jest.mock('../../../src/models/SecurityScanLog')
jest.mock('../../../src/services/system-monitor.service')


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

describe('SecurityService', () => {
  let securityService: SecurityService
  let mockSecurityThreat: jest.Mocked<typeof SecurityThreat>
  let mockSecurityVulnerability: jest.Mocked<typeof SecurityVulnerability>
  let mockSecurityConfig: jest.Mocked<typeof SecurityConfig>
  let mockSecurityScanLog: jest.Mocked<typeof SecurityScanLog>
  let mockSystemMonitorService: jest.Mocked<typeof SystemMonitorService>

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Setup mock implementations
    mockSecurityThreat = SecurityThreat as jest.Mocked<typeof SecurityThreat>
    mockSecurityVulnerability = SecurityVulnerability as jest.Mocked<typeof SecurityVulnerability>
    mockSecurityConfig = SecurityConfig as jest.Mocked<typeof SecurityConfig>
    mockSecurityScanLog = SecurityScanLog as jest.Mocked<typeof SecurityScanLog>
    mockSystemMonitorService = SystemMonitorService as jest.Mocked<typeof SystemMonitorService>

    // Create service instance
    securityService = new SecurityService()
  })

  describe('getSecurityOverview', () => {
    it('应该成功获取安全概览', async () => {
      // Mock database responses
      mockSecurityThreat.count.mockResolvedValue(2)
      mockSecurityVulnerability.count.mockResolvedValue(5)
      mockSecurityScanLog.findOne.mockResolvedValue({
        createdAt: new Date('2023-01-01T12:00:00Z')
      } as any)

      const overview = await securityService.getSecurityOverview()

      expect(overview).toEqual({
        securityScore: 70, // 100 - (2 * 10) - (5 * 2) = 70
        threatLevel: 'medium',
        activeThreats: 2,
        vulnerabilities: 5,
        riskLevel: 30,
        lastScanTime: '2023-01-01T12:00:00.000Z',
        connectionStatus: 'connected'
      })

      expect(mockSecurityThreat.count).toHaveBeenCalledWith({ where: { status: 'active' } })
      expect(mockSecurityVulnerability.count).toHaveBeenCalledWith({
        where: { status: { in: ['open', 'confirmed'] } }
      })
    })

    it('应该处理临界威胁等级', async () => {
      mockSecurityThreat.count.mockResolvedValue(5) // Critical threshold
      mockSecurityVulnerability.count.mockResolvedValue(20) // Critical threshold
      mockSecurityScanLog.findOne.mockResolvedValue(null)

      const overview = await securityService.getSecurityOverview()

      expect(overview.threatLevel).toBe('critical')
      expect(overview.securityScore).toBe(10) // 100 - (5 * 10) - (20 * 2) = 10
    })

    it('应该处理高威胁等级', async () => {
      mockSecurityThreat.count.mockResolvedValue(3)
      mockSecurityVulnerability.count.mockResolvedValue(10)
      mockSecurityScanLog.findOne.mockResolvedValue(null)

      const overview = await securityService.getSecurityOverview()

      expect(overview.threatLevel).toBe('high')
    })

    it('应该处理低威胁等级', async () => {
      mockSecurityThreat.count.mockResolvedValue(0)
      mockSecurityVulnerability.count.mockResolvedValue(0)
      mockSecurityScanLog.findOne.mockResolvedValue(null)

      const overview = await securityService.getSecurityOverview()

      expect(overview.threatLevel).toBe('low')
      expect(overview.securityScore).toBe(100)
      expect(overview.riskLevel).toBe(0)
    })

    it('数据库查询失败时应该抛出错误', async () => {
      mockSecurityThreat.count.mockRejectedValue(new Error('Database connection failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(securityService.getSecurityOverview()).rejects.toThrow('Database connection failed')
      expect(consoleSpy).toHaveBeenCalledWith('获取安全概览失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('getThreats', () => {
    it('应该成功获取威胁列表', async () => {
      const mockThreats = [
        {
          id: '1',
          threatType: 'malware',
          severity: 'high',
          status: 'active',
          sourceIp: '192.168.1.1',
          targetResource: '/api/users',
          description: '恶意软件检测',
          detectionMethod: 'signature',
          riskScore: 85,
          handledBy: null,
          handledAt: null,
          notes: null,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockSecurityThreat.findAndCountAll.mockResolvedValue({
        rows: mockThreats as any,
        count: 1
      })

      const query = { page: 1, pageSize: 10, severity: 'high', status: 'active' }
      const result = await securityService.getThreats(query)

      expect(result).toEqual({
        threats: mockThreats,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      })

      expect(mockSecurityThreat.findAndCountAll).toHaveBeenCalledWith({
        where: { status: 'active', severity: 'high' },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
        attributes: [
          'id', 'threatType', 'severity', 'status', 'sourceIp',
          'targetResource', 'description', 'detectionMethod', 'riskScore',
          'handledBy', 'handledAt', 'notes', 'metadata', 'createdAt', 'updatedAt'
        ]
      })
    })

    it('应该使用默认状态值', async () => {
      mockSecurityThreat.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 0
      })

      const query = { page: 1, pageSize: 10 }
      await securityService.getThreats(query)

      expect(mockSecurityThreat.findAndCountAll).toHaveBeenCalledWith({
        where: { status: 'active' },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
        attributes: expect.any(Array)
      })
    })

    it('应该正确处理分页', async () => {
      mockSecurityThreat.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 25
      })

      const query = { page: 2, pageSize: 10 }
      const result = await securityService.getThreats(query)

      expect(result.totalPages).toBe(3)
      expect(mockSecurityThreat.findAndCountAll).toHaveBeenCalledWith({
        where: { status: 'active' },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 10,
        attributes: expect.any(Array)
      })
    })

    it('数据库查询失败时应该抛出错误', async () => {
      mockSecurityThreat.findAndCountAll.mockRejectedValue(new Error('Query failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(securityService.getThreats({ page: 1, pageSize: 10 })).rejects.toThrow('Query failed')
      expect(consoleSpy).toHaveBeenCalledWith('获取威胁列表失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('handleThreat', () => {
    it('应该成功处理威胁为resolved状态', async () => {
      const mockThreat = {
        id: '1',
        update: jest.fn().mockResolvedValue(undefined)
      }

      mockSecurityThreat.findByPk.mockResolvedValue(mockThreat as any)

      const result = await securityService.handleThreat('1', 'resolve', '处理说明', 1)

      expect(result).toEqual({ success: true, message: '威胁处理成功' })
      expect(mockThreat.update).toHaveBeenCalledWith({
        status: 'resolved',
        handledBy: 1,
        handledAt: expect.any(Date),
        notes: '处理说明'
      })
    })

    it('应该成功处理威胁为ignored状态', async () => {
      const mockThreat = {
        id: '1',
        update: jest.fn().mockResolvedValue(undefined)
      }

      mockSecurityThreat.findByPk.mockResolvedValue(mockThreat as any)

      const result = await securityService.handleThreat('1', 'ignore', '忽略原因')

      expect(result).toEqual({ success: true, message: '威胁处理成功' })
      expect(mockThreat.update).toHaveBeenCalledWith({
        status: 'ignored',
        handledBy: undefined,
        handledAt: expect.any(Date),
        notes: '忽略原因'
      })
    })

    it('应该成功处理威胁为blocked状态', async () => {
      const mockThreat = {
        id: '1',
        update: jest.fn().mockResolvedValue(undefined)
      }

      mockSecurityThreat.findByPk.mockResolvedValue(mockThreat as any)

      const result = await securityService.handleThreat('1', 'block', '阻止说明')

      expect(result).toEqual({ success: true, message: '威胁处理成功' })
      expect(mockThreat.update).toHaveBeenCalledWith({
        status: 'blocked',
        handledBy: undefined,
        handledAt: expect.any(Date),
        notes: '阻止说明'
      })
    })

    it('威胁不存在时应该抛出错误', async () => {
      mockSecurityThreat.findByPk.mockResolvedValue(null)

      await expect(securityService.handleThreat('999', 'resolve')).rejects.toThrow('威胁不存在')
    })

    it('无效的处理动作应该抛出错误', async () => {
      const mockThreat = {
        id: '1',
        update: jest.fn()
      }

      mockSecurityThreat.findByPk.mockResolvedValue(mockThreat as any)

      await expect(securityService.handleThreat('1', 'invalid' as any)).rejects.toThrow('无效的处理动作')
    })

    it('处理失败时应该抛出错误', async () => {
      const mockThreat = {
        id: '1',
        update: jest.fn().mockRejectedValue(new Error('Update failed'))
      }

      mockSecurityThreat.findByPk.mockResolvedValue(mockThreat as any)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(securityService.handleThreat('1', 'resolve')).rejects.toThrow('Update failed')
      expect(consoleSpy).toHaveBeenCalledWith('处理威胁失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('performSecurityScan', () => {
    it('应该成功启动安全扫描', async () => {
      const mockScanLog = {
        id: 1,
        scanType: 'vulnerability',
        targets: '["target1", "target2"]',
        status: 'running',
        startedBy: 1,
        startedAt: new Date()
      }

      mockSecurityScanLog.create.mockResolvedValue(mockScanLog as any)

      const result = await securityService.performSecurityScan('vulnerability', ['target1', 'target2'], 1)

      expect(result).toEqual({
        scanId: 1,
        status: 'started',
        message: '安全扫描已启动'
      })

      expect(mockSecurityScanLog.create).toHaveBeenCalledWith({
        scanType: 'vulnerability',
        targets: JSON.stringify(['target1', 'target2']),
        status: 'running',
        startedBy: 1,
        startedAt: expect.any(Date)
      })
    })

    it('扫描启动失败时应该抛出错误', async () => {
      mockSecurityScanLog.create.mockRejectedValue(new Error('Failed to create scan log'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(securityService.performSecurityScan('vulnerability', ['target1'], 1))
        .rejects.toThrow('Failed to create scan log')
      expect(consoleSpy).toHaveBeenCalledWith('启动安全扫描失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('getVulnerabilities', () => {
    it('应该成功获取漏洞列表', async () => {
      const mockVulnerabilities = [
        {
          id: 1,
          severity: 'high',
          status: 'open',
          description: 'SQL注入漏洞',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockSecurityVulnerability.findAndCountAll.mockResolvedValue({
        rows: mockVulnerabilities as any,
        count: 1
      })

      const query = { page: 1, pageSize: 10, severity: 'high', status: 'open' }
      const result = await securityService.getVulnerabilities(query)

      expect(result).toEqual({
        vulnerabilities: mockVulnerabilities,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      })

      expect(mockSecurityVulnerability.findAndCountAll).toHaveBeenCalledWith({
        where: { severity: 'high', status: 'open' },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0
      })
    })

    it('应该处理可选的查询参数', async () => {
      mockSecurityVulnerability.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 0
      })

      const query = { page: 1, pageSize: 10 }
      await securityService.getVulnerabilities(query)

      expect(mockSecurityVulnerability.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0
      })
    })

    it('数据库查询失败时应该抛出错误', async () => {
      mockSecurityVulnerability.findAndCountAll.mockRejectedValue(new Error('Query failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(securityService.getVulnerabilities({ page: 1, pageSize: 10 }))
        .rejects.toThrow('Query failed')
      expect(consoleSpy).toHaveBeenCalledWith('获取漏洞列表失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('getSecurityRecommendations', () => {
    it('应该为活跃威胁生成关键建议', async () => {
      const mockOverview = {
        securityScore: 70,
        threatLevel: 'medium' as const,
        activeThreats: 3,
        vulnerabilities: 2,
        riskLevel: 30,
        connectionStatus: 'connected'
      }

      jest.spyOn(securityService, 'getSecurityOverview').mockResolvedValue(mockOverview)

      const recommendations = await securityService.getSecurityRecommendations()

      expect(recommendations).toHaveLength(4) // 3 specific + 2 general
      expect(recommendations[0]).toEqual({
        id: 'threat-handling',
        title: '处理活跃威胁',
        description: '系统检测到 3 个活跃威胁，建议立即处理',
        priority: 'critical',
        expectedImprovement: '消除当前安全威胁，提升系统安全性',
        effortLevel: 2
      })
    })

    it('应该为大量漏洞生成高优先级建议', async () => {
      const mockOverview = {
        securityScore: 60,
        threatLevel: 'high' as const,
        activeThreats: 1,
        vulnerabilities: 8,
        riskLevel: 40,
        connectionStatus: 'connected'
      }

      jest.spyOn(securityService, 'getSecurityOverview').mockResolvedValue(mockOverview)

      const recommendations = await securityService.getSecurityRecommendations()

      expect(recommendations).toHaveLength(4)
      expect(recommendations[1]).toEqual({
        id: 'vulnerability-patching',
        title: '修复系统漏洞',
        description: '发现 8 个安全漏洞，建议及时修复',
        priority: 'high',
        expectedImprovement: '修复已知漏洞，减少攻击面',
        effortLevel: 3
      })
    })

    it('应该为低安全评分生成建议', async () => {
      const mockOverview = {
        securityScore: 50,
        threatLevel: 'high' as const,
        activeThreats: 0,
        vulnerabilities: 0,
        riskLevel: 50,
        connectionStatus: 'connected'
      }

      jest.spyOn(securityService, 'getSecurityOverview').mockResolvedValue(mockOverview)

      const recommendations = await securityService.getSecurityRecommendations()

      expect(recommendations).toHaveLength(3) // 1 specific + 2 general
      expect(recommendations[0]).toEqual({
        id: 'security-hardening',
        title: '加强安全配置',
        description: '当前安全评分较低，建议加强系统安全配置',
        priority: 'medium',
        expectedImprovement: '提升整体安全防护能力',
        effortLevel: 4
      })
    })

    it('应该始终包含常规安全建议', async () => {
      const mockOverview = {
        securityScore: 100,
        threatLevel: 'low' as const,
        activeThreats: 0,
        vulnerabilities: 0,
        riskLevel: 0,
        connectionStatus: 'connected'
      }

      jest.spyOn(securityService, 'getSecurityOverview').mockResolvedValue(mockOverview)

      const recommendations = await securityService.getSecurityRecommendations()

      expect(recommendations).toHaveLength(2)
      expect(recommendations[0]).toEqual({
        id: 'mfa-enable',
        title: '启用多因素认证',
        description: '为管理员账户启用多因素认证，提高账户安全性',
        priority: 'high',
        expectedImprovement: '账户安全性提升80%，降低密码攻击风险',
        effortLevel: 3
      })
      expect(recommendations[1]).toEqual({
        id: 'password-policy',
        title: '加强密码策略',
        description: '实施更严格的密码复杂度要求和定期更换策略',
        priority: 'medium',
        expectedImprovement: '密码强度提升60%，降低暴力破解风险',
        effortLevel: 2
      })
    })

    it('获取安全概览失败时应该抛出错误', async () => {
      jest.spyOn(securityService, 'getSecurityOverview').mockRejectedValue(new Error('Failed to get overview'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(securityService.getSecurityRecommendations()).rejects.toThrow('Failed to get overview')
      expect(consoleSpy).toHaveBeenCalledWith('获取安全建议失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('generateAIRecommendations', () => {
    it('应该生成AI安全建议（当前实现为基础建议）', async () => {
      const mockRecommendations = [
        {
          id: 'mfa-enable',
          title: '启用多因素认证',
          description: '为管理员账户启用多因素认证，提高账户安全性',
          priority: 'high',
          expectedImprovement: '账户安全性提升80%，降低密码攻击风险',
          effortLevel: 3
        }
      ]

      jest.spyOn(securityService, 'getSecurityRecommendations').mockResolvedValue(mockRecommendations)

      const result = await securityService.generateAIRecommendations(1)

      expect(result).toEqual(mockRecommendations)
    })

    it('生成失败时应该抛出错误', async () => {
      jest.spyOn(securityService, 'getSecurityRecommendations').mockRejectedValue(new Error('AI generation failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(securityService.generateAIRecommendations(1)).rejects.toThrow('AI generation failed')
      expect(consoleSpy).toHaveBeenCalledWith('生成AI安全建议失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('getSecurityConfig', () => {
    it('应该成功获取安全配置', async () => {
      const mockConfigs = [
        {
          configKey: 'password_policy',
          configValue: '{"minLength": 8}',
          description: '密码策略配置',
          updatedAt: new Date()
        },
        {
          configKey: 'mfa_enabled',
          configValue: 'true',
          description: '多因素认证开关',
          updatedAt: new Date()
        }
      ]

      mockSecurityConfig.findAll.mockResolvedValue(mockConfigs as any)

      const config = await securityService.getSecurityConfig()

      expect(config).toEqual({
        password_policy: {
          value: '{"minLength": 8}',
          description: '密码策略配置',
          lastUpdated: expect.any(Date)
        },
        mfa_enabled: {
          value: 'true',
          description: '多因素认证开关',
          lastUpdated: expect.any(Date)
        }
      })
    })

    it('应该处理空配置', async () => {
      mockSecurityConfig.findAll.mockResolvedValue([])

      const config = await securityService.getSecurityConfig()

      expect(config).toEqual({})
    })

    it('获取配置失败时应该抛出错误', async () => {
      mockSecurityConfig.findAll.mockRejectedValue(new Error('Failed to get config'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(securityService.getSecurityConfig()).rejects.toThrow('Failed to get config')
      expect(consoleSpy).toHaveBeenCalledWith('获取安全配置失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('updateSecurityConfig', () => {
    it('应该成功更新安全配置', async () => {
      const mockConfig = {
        configKey: 'password_policy',
        configValue: '{"minLength": 12}',
        description: '密码策略配置',
        update: jest.fn().mockResolvedValue(undefined)
      }

      mockSecurityConfig.findOrCreate.mockResolvedValue([mockConfig as any, false])

      const configData = {
        password_policy: { minLength: 12 },
        mfa_enabled: true
      }

      const result = await securityService.updateSecurityConfig(configData, 1)

      expect(result).toEqual({
        success: true,
        updates: [
          { key: 'password_policy', value: { minLength: 12 } },
          { key: 'mfa_enabled', value: true }
        ]
      })

      expect(mockSecurityConfig.findOrCreate).toHaveBeenCalledWith({
        where: { configKey: 'password_policy' },
        defaults: {
          configKey: 'password_policy',
          configValue: JSON.stringify({ minLength: 12 }),
          updatedBy: 1
        }
      })

      expect(mockConfig.update).toHaveBeenCalledWith({
        configValue: JSON.stringify({ minLength: 12 }),
        updatedBy: 1
      })
    })

    it('应该创建新配置（当不存在时）', async () => {
      const mockConfig = {
        configKey: 'new_config',
        configValue: '{"enabled": true}',
        description: '新配置',
        update: jest.fn().mockResolvedValue(undefined)
      }

      mockSecurityConfig.findOrCreate.mockResolvedValue([mockConfig as any, true])

      const configData = { new_config: { enabled: true } }

      await securityService.updateSecurityConfig(configData)

      expect(mockSecurityConfig.findOrCreate).toHaveBeenCalledWith({
        where: { configKey: 'new_config' },
        defaults: {
          configKey: 'new_config',
          configValue: JSON.stringify({ enabled: true }),
          updatedBy: undefined
        }
      })
    })

    it('更新失败时应该抛出错误', async () => {
      mockSecurityConfig.findOrCreate.mockRejectedValue(new Error('Update failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(securityService.updateSecurityConfig({ test: 'value' }))
        .rejects.toThrow('Update failed')
      expect(consoleSpy).toHaveBeenCalledWith('更新安全配置失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('私有方法测试', () => {
    describe('calculateSecurityScore', () => {
      it('应该正确计算安全评分', () => {
        const service = securityService as any

        expect(service.calculateSecurityScore(0, 0)).toBe(100)
        expect(service.calculateSecurityScore(1, 0)).toBe(90)
        expect(service.calculateSecurityScore(0, 1)).toBe(98)
        expect(service.calculateSecurityScore(5, 10)).toBe(30)
        expect(service.calculateSecurityScore(15, 50)).toBe(0) // Should not go below 0
        expect(service.calculateSecurityScore(-1, -1)).toBe(100) // Should not go above 100
      })
    })

    describe('determineThreatLevel', () => {
      it('应该正确判断威胁等级', () => {
        const service = securityService as any

        expect(service.determineThreatLevel(5, 0)).toBe('critical')
        expect(service.determineThreatLevel(0, 20)).toBe('critical')
        expect(service.determineThreatLevel(3, 0)).toBe('high')
        expect(service.determineThreatLevel(0, 10)).toBe('high')
        expect(service.determineThreatLevel(1, 0)).toBe('medium')
        expect(service.determineThreatLevel(0, 5)).toBe('medium')
        expect(service.determineThreatLevel(0, 0)).toBe('low')
      })
    })

    describe('calculateRiskLevel', () => {
      it('应该正确计算风险等级', () => {
        const service = securityService as any

        expect(service.calculateRiskLevel(100)).toBe(0)
        expect(service.calculateRiskLevel(80)).toBe(20)
        expect(service.calculateRiskLevel(50)).toBe(50)
        expect(service.calculateRiskLevel(0)).toBe(100)
        expect(service.calculateRiskLevel(120)).toBe(0) // Should not go below 0
      })
    })

    describe('executeScan', () => {
      it('应该成功执行扫描并更新日志', async () => {
        jest.useFakeTimers()

        const service = securityService as any

        mockSecurityScanLog.update.mockResolvedValue([1])

        const scanPromise = service.executeScan(1, 'vulnerability', ['target1'])

        // Fast-forward time
        jest.advanceTimersByTime(5000)

        await scanPromise

        expect(mockSecurityScanLog.update).toHaveBeenCalledWith({
          status: 'completed',
          completedAt: expect.any(Date),
          threatsFound: expect.any(Number),
          vulnerabilitiesFound: expect.any(Number),
          results: expect.any(String)
        }, {
          where: { id: 1 }
        })

        jest.useRealTimers()
      })

      it('扫描失败时应该更新日志为失败状态', async () => {
        jest.useFakeTimers()

        const service = securityService as any

        mockSecurityScanLog.update.mockResolvedValue([1])

        // Make the scan fail
        jest.spyOn(service, 'executeScan').mockImplementationOnce(async () => {
          throw new Error('Scan execution failed')
        })

        try {
          await service.executeScan(1, 'vulnerability', ['target1'])
        } catch (error) {
          // Expected to fail
        }

        jest.advanceTimersByTime(5000)

        expect(mockSecurityScanLog.update).toHaveBeenCalledWith({
          status: 'failed',
          completedAt: expect.any(Date),
          results: expect.stringContaining('Scan execution failed')
        }, {
          where: { id: 1 }
        })

        jest.useRealTimers()
      })
    })
  })
})