import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Security from '@/pages/system/Security.vue'
import * as echarts from 'echarts'
import { securityApi } from '@/api/security'

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Warning: { template: '<div>Warning</div>' },
  CircleCheck: { template: '<div>CircleCheck</div>' },
  Search: { template: '<div>Search</div>' },
  Refresh: { template: '<div>Refresh</div>' },
  Close: { template: '<div>Close</div>' },
  Document: { template: '<div>Document</div>' },
  User: { template: '<div>User</div>' },
  Monitor: { template: '<div>Monitor</div>' },
  Key: { template: '<div>Key</div>' },
  MagicStick: { template: '<div>MagicStick</div>' },
  Check: { template: '<div>Check</div>' },
  InfoFilled: { template: '<div>InfoFilled</div>' }
}))

// Mock Element Plus message and messagebox
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: vi.fn(),
    ElMessageBox: {
      confirm: vi.fn(),
      alert: vi.fn()
    }
  }
})

// Mock ECharts
vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    dispose: vi.fn()
  }))
}))

// Mock security API
vi.mock('@/api/security', () => ({
  securityApi: {
    getOverview: vi.fn(),
    getThreats: vi.fn(),
    handleThreat: vi.fn(),
    performScan: vi.fn(),
    getRecommendations: vi.fn(),
    generateAIRecommendations: vi.fn()
  }
}))

describe('Security.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('安全评分和威胁等级显示', () => {
    it('should display security score and threat level correctly', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 85,
        threatLevel: 'medium',
        activeThreats: 3,
        vulnerabilities: 5,
        riskLevel: 60,
        connectionStatus: '实时监控中'
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick() // Wait for async operations

      // Assert
      expect(wrapper.text()).toContain('安全监控中心')
      expect(wrapper.text()).toContain('85')
      expect(wrapper.text()).toContain('中风险')
      expect(wrapper.text()).toContain('活跃威胁')
      expect(wrapper.text()).toContain('3')
      expect(wrapper.text()).toContain('漏洞数量')
      expect(wrapper.text()).toContain('5')
    })

    it('should display different security score classes based on score value', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 95,
        threatLevel: 'low',
        activeThreats: 0,
        vulnerabilities: 2,
        riskLevel: 20,
        connectionStatus: '实时监控中'
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Assert
      const scoreCircle = wrapper.find('.score-circle')
      expect(scoreCircle.classes()).toContain('excellent')
    })

    it('should show error message when failed to load security overview', async () => {
      // Arrange
      securityApi.getOverview.mockRejectedValue(new Error('Network error'))
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '刷新数据失败',
        type: 'error'
      }))
    })
  })

  describe('实时威胁检测功能', () => {
    it('should display threats correctly when loaded', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 80,
        threatLevel: 'medium',
        activeThreats: 2,
        vulnerabilities: 4,
        riskLevel: 55,
        connectionStatus: '实时监控中'
      }

      const mockThreats = {
        threats: [
          {
            id: 1,
            threatType: '可疑登录尝试',
            description: '检测到来自异常IP地址的多次登录失败',
            severity: 'medium',
            status: 'active',
            sourceIp: '192.168.1.100',
            createdAt: '2024-01-01T10:00:00Z'
          },
          {
            id: 2,
            threatType: 'SQL注入攻击',
            description: '检测到恶意SQL查询尝试',
            severity: 'high',
            status: 'active',
            sourceIp: '10.0.0.50',
            createdAt: '2024-01-01T09:30:00Z'
          }
        ]
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue(mockThreats)
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.text()).toContain('可疑登录尝试')
      expect(wrapper.text()).toContain('检测到来自异常IP地址的多次登录失败')
      expect(wrapper.text()).toContain('SQL注入攻击')
      expect(wrapper.text()).toContain('检测到恶意SQL查询尝试')
    })

    it('should handle threat correctly', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 80,
        threatLevel: 'medium',
        activeThreats: 1,
        vulnerabilities: 4,
        riskLevel: 55,
        connectionStatus: '实时监控中'
      }

      const mockThreats = {
        threats: [
          {
            id: 1,
            threatType: '可疑登录尝试',
            description: '检测到来自异常IP地址的多次登录失败',
            severity: 'medium',
            status: 'active',
            sourceIp: '192.168.1.100',
            createdAt: '2024-01-01T10:00:00Z'
          }
        ]
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue(mockThreats)
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])
      securityApi.handleThreat.mockResolvedValue({ success: true })

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const handleButton = wrapper.find('button:contains("处理")')
      await handleButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(securityApi.handleThreat).toHaveBeenCalledWith(1, {
        action: 'resolve',
        notes: '通过安全监控中心处理'
      })
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '威胁 "检测到来自异常IP地址的多次登录失败" 已处理',
        type: 'success'
      }))
    })

    it('should show error message when handling threat fails', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 80,
        threatLevel: 'medium',
        activeThreats: 1,
        vulnerabilities: 4,
        riskLevel: 55,
        connectionStatus: '实时监控中'
      }

      const mockThreats = {
        threats: [
          {
            id: 1,
            threatType: '可疑登录尝试',
            description: '检测到来自异常IP地址的多次登录失败',
            severity: 'medium',
            status: 'active',
            sourceIp: '192.168.1.100',
            createdAt: '2024-01-01T10:00:00Z'
          }
        ]
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue(mockThreats)
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])
      securityApi.handleThreat.mockRejectedValue(new Error('API error'))

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const handleButton = wrapper.find('button:contains("处理")')
      await handleButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '处理威胁失败',
        type: 'error'
      }))
    })
  })

  describe('用户行为分析展示', () => {
    it('should display behavior metrics correctly', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 85,
        threatLevel: 'medium',
        activeThreats: 2,
        vulnerabilities: 3,
        riskLevel: 50,
        connectionStatus: '实时监控中'
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.text()).toContain('用户行为分析')
      expect(wrapper.text()).toContain('总登录次数')
      expect(wrapper.text()).toContain('活跃用户')
      expect(wrapper.text()).toContain('访问尝试')
    })

    it('should update behavior analysis when time range changes', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 85,
        threatLevel: 'medium',
        activeThreats: 2,
        vulnerabilities: 3,
        riskLevel: 50,
        connectionStatus: '实时监控中'
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const select = wrapper.find('select')
      await select.setValue('7d')
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '已切换到7d的行为分析数据',
        type: 'info'
      }))
    })

    it('should generate behavior report successfully', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 85,
        threatLevel: 'medium',
        activeThreats: 2,
        vulnerabilities: 3,
        riskLevel: 50,
        connectionStatus: '实时监控中'
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const reportButton = wrapper.find('button:contains("生成报告")')
      await reportButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 2100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('行为分析报告生成完成'),
        type: 'success'
      }))
    })
  })

  describe('异常行为处理功能', () => {
    it('should display anomalous activities when detected', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 75,
        threatLevel: 'high',
        activeThreats: 5,
        vulnerabilities: 8,
        riskLevel: 75,
        connectionStatus: '实时监控中'
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])

      // Simulate generating anomalous activities
      vi.useFakeTimers()

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Fast-forward timer to trigger anomalous activity generation
      vi.advanceTimersByTime(100)

      // Wait for DOM update
      await wrapper.vm.$nextTick()

      // Assert
      // Since we're using mock data, we check if the section exists
      const anomalySection = wrapper.find('.anomalous-activities')
      expect(anomalySection.exists()).toBe(true)
    })

    it('should investigate anomaly successfully', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 75,
        threatLevel: 'high',
        activeThreats: 5,
        vulnerabilities: 8,
        riskLevel: 75,
        connectionStatus: '实时监控中'
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])

      ElMessageBox.confirm.mockResolvedValue(true)

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const investigateButton = wrapper.find('button:contains("调查")')
      await investigateButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 2100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('调查完成'),
        type: 'success'
      }))
    })

    it('should block user successfully', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 75,
        threatLevel: 'high',
        activeThreats: 5,
        vulnerabilities: 8,
        riskLevel: 75,
        connectionStatus: '实时监控中'
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])

      ElMessageBox.confirm.mockResolvedValue(true)

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const blockButton = wrapper.find('button:contains("封禁用户")')
      await blockButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 1100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('用户'),
        type: 'success'
      }))
    })
  })

  describe('安全建议生成功能', () => {
    it('should generate security recommendations successfully', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 80,
        threatLevel: 'medium',
        activeThreats: 3,
        vulnerabilities: 5,
        riskLevel: 60,
        connectionStatus: '实时监控中'
      }

      const mockRecommendations = [
        {
          id: 'rec-1',
          title: '加强密码策略',
          description: '建议实施更严格的密码复杂度要求',
          priority: 'high',
          expectedImprovement: '降低密码破解风险约60%',
          effortLevel: 2
        }
      ]

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue(mockRecommendations)

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const generateButton = wrapper.find('button:contains("生成AI建议")')
      await generateButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(securityApi.generateAIRecommendations).toHaveBeenCalled()
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '生成了 1 条AI安全建议',
        type: 'success'
      }))
    })

    it('should implement recommendation successfully', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 80,
        threatLevel: 'medium',
        activeThreats: 3,
        vulnerabilities: 5,
        riskLevel: 60,
        connectionStatus: '实时监控中'
      }

      const mockRecommendations = [
        {
          id: 'rec-1',
          title: '加强密码策略',
          description: '建议实施更严格的密码复杂度要求',
          priority: 'high',
          expectedImprovement: '降低密码破解风险约60%',
          effortLevel: 2
        }
      ]

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue(mockRecommendations)

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Wait for recommendations to load
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      const implementButton = wrapper.find('button:contains("立即实施")')
      await implementButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 2100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('已实施安全建议'),
        type: 'success'
      }))
    })

    it('should show error when generating recommendations fails', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 80,
        threatLevel: 'medium',
        activeThreats: 3,
        vulnerabilities: 5,
        riskLevel: 60,
        connectionStatus: '实时监控中'
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockRejectedValue(new Error('API error'))

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const generateButton = wrapper.find('button:contains("生成AI建议")')
      await generateButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '生成安全建议失败',
        type: 'error'
      }))
    })
  })

  describe('安全扫描功能', () => {
    it('should perform security scan successfully', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 80,
        threatLevel: 'medium',
        activeThreats: 3,
        vulnerabilities: 5,
        riskLevel: 60,
        connectionStatus: '实时监控中'
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])
      securityApi.performScan.mockResolvedValue({ scanId: 'scan-123' })

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const scanButton = wrapper.find('button:contains("执行安全扫描")')
      await scanButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 4100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(securityApi.performScan).toHaveBeenCalledWith({
        scanType: 'quick',
        targets: []
      })
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '安全扫描完成！',
        type: 'success'
      }))
    })

    it('should show error when security scan fails', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 80,
        threatLevel: 'medium',
        activeThreats: 3,
        vulnerabilities: 5,
        riskLevel: 60,
        connectionStatus: '实时监控中'
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])
      securityApi.performScan.mockRejectedValue(new Error('API error'))

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const scanButton = wrapper.find('button:contains("执行安全扫描")')
      await scanButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '安全扫描失败',
        type: 'error'
      }))
    })
  })

  describe('数据刷新功能', () => {
    it('should refresh security data successfully', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 85,
        threatLevel: 'medium',
        activeThreats: 2,
        vulnerabilities: 3,
        riskLevel: 50,
        connectionStatus: '实时监控中'
      }

      securityApi.getOverview.mockResolvedValue(mockOverview)
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const refreshButton = wrapper.find('button:contains("刷新数据")')
      await refreshButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(securityApi.getOverview).toHaveBeenCalledTimes(2) // Initial load + refresh
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '安全数据刷新完成',
        type: 'success'
      }))
    })

    it('should show error when refreshing data fails', async () => {
      // Arrange
      const mockOverview = {
        securityScore: 85,
        threatLevel: 'medium',
        activeThreats: 2,
        vulnerabilities: 3,
        riskLevel: 50,
        connectionStatus: '实时监控中'
      }

      securityApi.getOverview.mockResolvedValueOnce(mockOverview)
      securityApi.getOverview.mockRejectedValueOnce(new Error('API error'))
      securityApi.getThreats.mockResolvedValue({ threats: [] })
      securityApi.getRecommendations.mockResolvedValue([])
      securityApi.generateAIRecommendations.mockResolvedValue([])

      // Act
      wrapper = mount(Security)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const refreshButton = wrapper.find('button:contains("刷新数据")')
      await refreshButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '刷新数据失败',
        type: 'error'
      }))
    })
  })
})