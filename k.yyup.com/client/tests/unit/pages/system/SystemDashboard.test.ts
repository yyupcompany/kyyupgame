import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage } from 'element-plus'
import SystemDashboard from '@/pages/system/Dashboard.vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn()
    }
  }
})

// Mock system API
vi.mock('@/api/modules/system', () => ({
  getSystemStats: vi.fn(),
  getSystemHealth: vi.fn(),
  getSystemDetailInfo: vi.fn()
}))

// Import mocked functions
import { getSystemStats, getSystemDetailInfo } from '@/api/modules/system'

describe('SystemDashboard Page', () => {
  let router: Router
  let wrapper: any

  const mockStats = {
    userCount: 150,
    activeUsers: 45,
    roleCount: 8,
    permissionCount: 120,
    todayLogCount: 1250,
    errorLogCount: 15,
    uptime: '15天8小时',
    cpuUsage: 35
  }

  const mockSystemInfo = {
    version: 'v2.1.0',
    lastUpdate: '2024-01-15',
    os: 'Ubuntu 20.04 LTS',
    database: 'MySQL 8.0.35',
    memoryUsage: '4.2GB / 16GB',
    diskSpace: '128GB / 500GB'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 创建路由
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/system/user', component: { template: '<div>User Management</div>' } },
        { path: '/system/role', component: { template: '<div>Role Management</div>' } },
        { path: '/system/log', component: { template: '<div>Log Management</div>' } },
        { path: '/system/settings', component: { template: '<div>System Settings</div>' } },
        { path: '/system/backup', component: { template: '<div>Backup</div>' } },
        { path: '/system/message-template', component: { template: '<div>Message Template</div>' } }
      ]
    })

    // 创建 Pinia
    const pinia = createPinia()
    setActivePinia(pinia)

    // Mock successful API responses
    
    vi.mocked(getSystemStats).mockResolvedValue({
      success: true,
      data: mockStats
    })
    
    vi.mocked(getSystemDetailInfo).mockResolvedValue({
      success: true,
      data: mockSystemInfo
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = () => {
    return mount(SystemDashboard, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'el-icon': true,
          'el-button': true,
          'el-card': true,
          'el-tag': true,
          'el-descriptions': true,
          'el-descriptions-item': true,
          'el-progress': true,
          'app-card': true,
          'app-card-header': true,
          'app-card-content': true,
          'app-card-title': true
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render the system dashboard page correctly', async () => {
      wrapper = createWrapper()
      
      // Wait for async operations
      await vi.waitFor(() => {
        expect(wrapper.find('.page-container').exists()).toBe(true)
      })
      
      expect(wrapper.find('.stats-section').exists()).toBe(true)
      expect(wrapper.find('.ai-monitoring-section').exists()).toBe(true)
      expect(wrapper.find('.info-section').exists()).toBe(true)
      expect(wrapper.find('.actions-section').exists()).toBe(true)
    })

    it('should display statistics cards with correct data', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.stats.userCount).toBe(150)
      })
      
      const statsCards = wrapper.findAll('.stats-card')
      expect(statsCards.length).toBe(4)
      
      expect(statsCards[0].find('.stats-value').text()).toBe('150')
      expect(statsCards[1].find('.stats-value').text()).toBe('8')
      expect(statsCards[2].find('.stats-value').text()).toBe('1250')
      expect(statsCards[3].find('.stats-value').text()).toBe('15天8小时')
    })

    it('should display system information correctly', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.systemInfo.version).toBe('v2.1.0')
      })
      
      expect(wrapper.text()).toContain('v2.1.0')
      expect(wrapper.text()).toContain('Ubuntu 20.04 LTS')
      expect(wrapper.text()).toContain('MySQL 8.0.35')
    })
  })

  describe('Statistics Display', () => {
    it('should show correct user statistics', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.stats.userCount).toBe(150)
      })
      
      expect(wrapper.vm.stats.userCount).toBe(150)
      expect(wrapper.vm.stats.activeUsers).toBe(45)
      expect(wrapper.vm.stats.roleCount).toBe(8)
      expect(wrapper.vm.stats.permissionCount).toBe(120)
    })

    it('should show correct system logs statistics', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.stats.todayLogCount).toBe(1250)
      })
      
      expect(wrapper.vm.stats.todayLogCount).toBe(1250)
      expect(wrapper.vm.stats.errorLogCount).toBe(15)
    })

    it('should show correct system status', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.stats.uptime).toBe('15天8小时')
      })
      
      expect(wrapper.vm.stats.uptime).toBe('15天8小时')
      expect(wrapper.vm.stats.cpuUsage).toBe(35)
    })
  })

  describe('AI Monitoring Features', () => {
    it('should display system health score', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.metrics.performance.cpuUsage).toBeGreaterThan(0)
      })
      
      const healthScore = wrapper.vm.systemHealthScore
      expect(typeof healthScore).toBe('number')
      expect(healthScore).toBeGreaterThanOrEqual(0)
      expect(healthScore).toBeLessThanOrEqual(100)
    })

    it('should calculate performance score correctly', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.metrics.performance.cpuUsage).toBeGreaterThan(0)
      })
      
      const performanceScore = wrapper.vm.calculatePerformanceScore()
      expect(typeof performanceScore).toBe('number')
      expect(performanceScore).toBeGreaterThanOrEqual(0)
      expect(performanceScore).toBeLessThanOrEqual(100)
    })

    it('should display monitoring metrics correctly', async () => {
      wrapper = createWrapper()
      
      await vi.waitFor(() => {
        expect(wrapper.vm.metrics.performance.cpuUsage).toBeGreaterThan(0)
      })
      
      const metrics = wrapper.vm.metrics
      expect(metrics.performance.cpuUsage).toBeGreaterThan(0)
      expect(metrics.performance.memoryUsage).toBeGreaterThan(0)
      expect(metrics.performance.diskUsage).toBeGreaterThan(0)
      expect(metrics.security.securityScore).toBeGreaterThan(0)
      expect(metrics.availability.serviceHealth).toBeGreaterThan(0)
    })
  })

  describe('Alert Management', () => {
    it('should handle anomaly detection', async () => {
      wrapper = createWrapper()
      
      // Set high CPU usage to trigger alert
      await wrapper.setData({
        'metrics.performance.cpuUsage': 85
      })
      
      await wrapper.vm.detectAnomalies()
      
      expect(wrapper.vm.alerts.length).toBeGreaterThan(0)
      expect(wrapper.vm.alerts[0].title).toContain('CPU')
    })

    it('should handle alert processing', async () => {
      wrapper = createWrapper()
      
      // Add a test alert
      const testAlert = {
        id: 'test-alert',
        title: 'Test Alert',
        description: 'Test Description',
        severity: 'high',
        timestamp: new Date().toISOString(),
        type: 'test'
      }
      
      await wrapper.setData({
        alerts: [testAlert]
      })
      
      await wrapper.vm.handleAlert(testAlert)
      
      expect(ElMessage.success).toHaveBeenCalledWith('已处理告警: Test Alert')
      expect(wrapper.vm.alerts.length).toBe(0)
    })

    it('should handle alert ignoring', async () => {
      wrapper = createWrapper()
      
      // Add a test alert
      const testAlert = {
        id: 'test-alert',
        title: 'Test Alert',
        description: 'Test Description',
        severity: 'medium',
        timestamp: new Date().toISOString(),
        type: 'test'
      }
      
      await wrapper.setData({
        alerts: [testAlert]
      })
      
      await wrapper.vm.ignoreAlert(testAlert)
      
      expect(ElMessage.info).toHaveBeenCalledWith('已忽略告警: Test Alert')
      expect(wrapper.vm.alerts.length).toBe(0)
    })

    it('should clear all alerts', async () => {
      wrapper = createWrapper()
      
      // Add test alerts
      const testAlerts = [
        {
          id: 'alert-1',
          title: 'Alert 1',
          description: 'Description 1',
          severity: 'low',
          timestamp: new Date().toISOString(),
          type: 'test'
        },
        {
          id: 'alert-2',
          title: 'Alert 2',
          description: 'Description 2',
          severity: 'medium',
          timestamp: new Date().toISOString(),
          type: 'test'
        }
      ]
      
      await wrapper.setData({
        alerts: testAlerts
      })
      
      await wrapper.vm.clearAlerts()
      
      expect(ElMessage.info).toHaveBeenCalledWith('已清除所有告警')
      expect(wrapper.vm.alerts.length).toBe(0)
    })
  })

  describe('Recommendation Management', () => {
    it('should generate optimization suggestions', async () => {
      wrapper = createWrapper()
      
      // Set high memory usage to trigger recommendation
      await wrapper.setData({
        'metrics.performance.memoryUsage': 85
      })
      
      await wrapper.vm.generateOptimizationSuggestions()
      
      expect(wrapper.vm.recommendations.length).toBeGreaterThan(0)
      expect(wrapper.vm.recommendations[0].title).toContain('内存')
    })

    it('should handle recommendation application', async () => {
      wrapper = createWrapper()
      
      // Add a test recommendation
      const testRecommendation = {
        id: 'test-recommendation',
        title: 'Test Recommendation',
        description: 'Test Description',
        priority: 'high',
        expectedImprovement: 'Test Improvement',
        type: 'performance',
        action: 'test'
      }
      
      await wrapper.setData({
        recommendations: [testRecommendation]
      })
      
      await wrapper.vm.applyRecommendation(testRecommendation)
      
      expect(ElMessage.success).toHaveBeenCalledWith('已应用优化建议: Test Recommendation')
      expect(wrapper.vm.recommendations.length).toBe(0)
    })

    it('should handle recommendation scheduling', async () => {
      wrapper = createWrapper()
      
      // Add a test recommendation
      const testRecommendation = {
        id: 'test-recommendation',
        title: 'Test Recommendation',
        description: 'Test Description',
        priority: 'medium',
        expectedImprovement: 'Test Improvement',
        type: 'performance',
        action: 'test'
      }
      
      await wrapper.setData({
        recommendations: [testRecommendation]
      })
      
      await wrapper.vm.scheduleRecommendation(testRecommendation)
      
      expect(ElMessage.success).toHaveBeenCalledWith('已计划应用优化建议: Test Recommendation')
      expect(wrapper.vm.recommendations.length).toBe(0)
    })
  })

  describe('Navigation Functions', () => {
    it('should navigate to user management', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.goToUserManagement()
      
      expect(router.currentRoute.value.path).toBe('/system/user')
    })

    it('should navigate to role management', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.goToRoleManagement()
      
      expect(router.currentRoute.value.path).toBe('/system/role')
    })

    it('should navigate to log management', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.goToLogManagement()
      
      expect(router.currentRoute.value.path).toBe('/system/log')
    })

    it('should navigate to system settings', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.goToSystemSettings()
      
      expect(router.currentRoute.value.path).toBe('/system/settings')
    })

    it('should navigate to backup', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.goToBackup()
      
      expect(router.currentRoute.value.path).toBe('/system/backup')
    })

    it('should navigate to message template', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.goToMessageTemplate()
      
      expect(router.currentRoute.value.path).toBe('/system/message-template')
    })

    it('should navigate to system log', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.goToSystemLog()
      
      expect(router.currentRoute.value.path).toBe('/system/log')
    })
  })

  describe('Data Refresh', () => {
    it('should refresh statistics successfully', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.refreshStats()
      
      
      expect(getSystemStats).toHaveBeenCalled()
      expect(getSystemDetailInfo).toHaveBeenCalled()
      expect(ElMessage.success).toHaveBeenCalledWith('数据刷新成功')
    })

    it('should handle refresh errors gracefully', async () => {
      wrapper = createWrapper()
      
      // Mock API error
      
      vi.mocked(getSystemStats).mockRejectedValueOnce(new Error('API Error'))
      
      await wrapper.vm.refreshStats()
      
      expect(ElMessage.error).toHaveBeenCalledWith('刷新数据失败')
    })
  })

  describe('Utility Functions', () => {
    it('should return correct health score type', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getHealthScoreType(95)).toBe('success')
      expect(wrapper.vm.getHealthScoreType(80)).toBe('warning')
      expect(wrapper.vm.getHealthScoreType(60)).toBe('danger')
    })

    it('should return correct progress color', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getProgressColor(85)).toBe('#f56c6c')
      expect(wrapper.vm.getProgressColor(70)).toBe('#e6a23c')
      expect(wrapper.vm.getProgressColor(50)).toBe('#67c23a')
    })

    it('should return correct threat level type', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getThreatLevelType('low')).toBe('success')
      expect(wrapper.vm.getThreatLevelType('medium')).toBe('warning')
      expect(wrapper.vm.getThreatLevelType('high')).toBe('danger')
      expect(wrapper.vm.getThreatLevelType('critical')).toBe('danger')
    })

    it('should return correct threat level text', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getThreatLevelText('low')).toBe('低风险')
      expect(wrapper.vm.getThreatLevelText('medium')).toBe('中风险')
      expect(wrapper.vm.getThreatLevelText('high')).toBe('高风险')
      expect(wrapper.vm.getThreatLevelText('critical')).toBe('极高风险')
    })

    it('should return correct priority text', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getPriorityText('low')).toBe('低优先级')
      expect(wrapper.vm.getPriorityText('medium')).toBe('中优先级')
      expect(wrapper.vm.getPriorityText('high')).toBe('高优先级')
    })

    it('should format time correctly', () => {
      wrapper = createWrapper()
      
      const timestamp = '2024-01-15T10:30:00Z'
      const formattedTime = wrapper.vm.formatTime(timestamp)
      
      expect(formattedTime).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{1,2}:\d{1,2}/)
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should load data on mount', async () => {
      const refreshStatsSpy = vi.spyOn(SystemDashboard.methods, 'refreshStats')
      const loadSystemMetricsSpy = vi.spyOn(SystemDashboard.methods, 'loadSystemMetrics')
      
      wrapper = createWrapper()
      
      expect(refreshStatsSpy).toHaveBeenCalled()
      expect(loadSystemMetricsSpy).toHaveBeenCalled()
    })

    it('should set up refresh interval on mount', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.refreshInterval).not.toBeNull()
    })

    it('should clear refresh interval on unmount', () => {
      wrapper = createWrapper()
      
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      wrapper.unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalledWith(wrapper.vm.refreshInterval)
    })
  })

  describe('Error Handling', () => {
    it('should handle system stats loading error', async () => {
      wrapper = createWrapper()
      
      // Mock API error
      
      vi.mocked(getSystemStats).mockRejectedValueOnce(new Error('API Error'))
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await wrapper.vm.loadSystemStats()
      
      expect(ElMessage.error).toHaveBeenCalledWith('获取系统统计失败')
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should handle system info loading error', async () => {
      wrapper = createWrapper()
      
      // Mock API error
      
      vi.mocked(getSystemDetailInfo).mockRejectedValueOnce(new Error('API Error'))
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await wrapper.vm.loadSystemInfo()
      
      expect(ElMessage.error).toHaveBeenCalledWith('获取系统信息失败')
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should handle anomaly detection error', async () => {
      wrapper = createWrapper()
      
      // Mock error in anomaly detection
      const originalDetectAnomalies = wrapper.vm.detectAnomalies
      wrapper.vm.detectAnomalies = vi.fn().mockRejectedValueOnce(new Error('Detection Error'))
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await wrapper.vm.detectAnomalies()
      
      expect(ElMessage.error).toHaveBeenCalledWith('AI异常棃测失败')
      expect(consoleSpy).toHaveBeenCalled()
      
      // Restore original method
      wrapper.vm.detectAnomalies = originalDetectAnomalies
      consoleSpy.mockRestore()
    })

    it('should handle recommendation generation error', async () => {
      wrapper = createWrapper()
      
      // Mock error in recommendation generation
      const originalGenerateRecommendations = wrapper.vm.generateOptimizationSuggestions
      wrapper.vm.generateOptimizationSuggestions = vi.fn().mockRejectedValueOnce(new Error('Generation Error'))
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await wrapper.vm.generateOptimizationSuggestions()
      
      expect(ElMessage.error).toHaveBeenCalledWith('生成优化建议失败')
      expect(consoleSpy).toHaveBeenCalled()
      
      // Restore original method
      wrapper.vm.generateOptimizationSuggestions = originalGenerateRecommendations
      consoleSpy.mockRestore()
    })
  })

  describe('Loading States', () => {
    it('should show loading state during refresh', async () => {
      wrapper = createWrapper()
      
      // Mock slow API response
      
      vi.mocked(getSystemStats).mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ success: true, data: mockStats })
          }, 100)
        })
      })
      
      await wrapper.vm.refreshStats()
      
      expect(wrapper.vm.loading).toBe(true)
      
      // Wait for async operation to complete
      await vi.waitFor(() => {
        expect(wrapper.vm.loading).toBe(false)
      })
    })

    it('should show loading state during anomaly detection', async () => {
      wrapper = createWrapper()
      
      // Mock slow anomaly detection
      const originalDetectAnomalies = wrapper.vm.detectAnomalies
      wrapper.vm.detectAnomalies = vi.fn().mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            wrapper.vm.alerts = []
            resolve()
          }, 100)
        })
      })
      
      await wrapper.vm.detectAnomalies()
      
      expect(wrapper.vm.detectingAnomalies).toBe(true)
      
      // Wait for async operation to complete
      await vi.waitFor(() => {
        expect(wrapper.vm.detectingAnomalies).toBe(false)
      })
      
      // Restore original method
      wrapper.vm.detectAnomalies = originalDetectAnomalies
    })

    it('should show loading state during recommendation generation', async () => {
      wrapper = createWrapper()
      
      // Mock slow recommendation generation
      const originalGenerateRecommendations = wrapper.vm.generateOptimizationSuggestions
      wrapper.vm.generateOptimizationSuggestions = vi.fn().mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            wrapper.vm.recommendations = []
            resolve()
          }, 100)
        })
      })
      
      await wrapper.vm.generateOptimizationSuggestions()
      
      expect(wrapper.vm.generatingRecommendations).toBe(true)
      
      // Wait for async operation to complete
      await vi.waitFor(() => {
        expect(wrapper.vm.generatingRecommendations).toBe(false)
      })
      
      // Restore original method
      wrapper.vm.generateOptimizationSuggestions = originalGenerateRecommendations
    })
  })

  describe('Responsive Design', () => {
    it('should render correctly on different screen sizes', () => {
      wrapper = createWrapper()
      
      // Test desktop layout
      expect(wrapper.find('.stats-cards').exists()).toBe(true)
      expect(wrapper.find('.monitoring-metrics').exists()).toBe(true)
      expect(wrapper.find('.action-buttons').exists()).toBe(true)
    })
  })
})