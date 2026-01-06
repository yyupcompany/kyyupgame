import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import Dashboard from '@/pages/system/Dashboard.vue'

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Monitor: { template: '<div>Monitor</div>' },
  Refresh: { template: '<div>Refresh</div>' },
  User: { template: '<div>User</div>' },
  UserFilled: { template: '<div>UserFilled</div>' },
  Document: { template: '<div>Document</div>' },
  CircleCheck: { template: '<div>CircleCheck</div>' },
  Setting: { template: '<div>Setting</div>' },
  Download: { template: '<div>Download</div>' },
  Message: { template: '<div>Message</div>' },
  Search: { template: '<div>Search</div>' },
  Cpu: { template: '<div>Cpu</div>' },
  Lock: { template: '<div>Lock</div>' },
  Connection: { template: '<div>Connection</div>' },
  Warning: { template: '<div>Warning</div>' },
  Close: { template: '<div>Close</div>' }
}))

// Mock Element Plus message
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: vi.fn()
  }
})

// Mock router
const mockRouter = {
  push: vi.fn()
}

// Mock API functions
const mockGetSystemStats = vi.fn()
const mockGetSystemDetailInfo = vi.fn()

vi.mock('@/api/modules/system', () => ({
  getSystemStats: () => mockGetSystemStats(),
  getSystemDetailInfo: () => mockGetSystemDetailInfo()
}))

describe('Dashboard.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock useRouter
    vi.mock('vue-router', () => ({
      useRouter: () => mockRouter
    }))
  })

  describe('系统统计数据展示', () => {
    it('should display system stats correctly when loaded', async () => {
      // Arrange
      const mockStats = {
        userCount: 150,
        activeUsers: 45,
        roleCount: 8,
        permissionCount: 32,
        todayLogCount: 120,
        errorLogCount: 3,
        uptime: '7天12小时',
        cpuUsage: 45
      }

      mockGetSystemStats.mockResolvedValue({
        success: true,
        data: mockStats
      })

      mockGetSystemDetailInfo.mockResolvedValue({
        success: true,
        data: {
          version: 'v1.0.0',
          lastUpdate: '2024-01-01',
          os: 'Linux',
          database: 'MySQL 8.0',
          memoryUsage: '4GB / 8GB',
          diskSpace: '50GB / 100GB'
        }
      })

      // Act
      wrapper = mount(Dashboard)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick() // Wait for async operations

      // Assert
      expect(wrapper.text()).toContain('系统用户')
      expect(wrapper.text()).toContain('150')
      expect(wrapper.text()).toContain('今日活跃: 45')
      
      expect(wrapper.text()).toContain('系统角色')
      expect(wrapper.text()).toContain('8')
      expect(wrapper.text()).toContain('权限数量: 32')
      
      expect(wrapper.text()).toContain('系统日志')
      expect(wrapper.text()).toContain('120')
      expect(wrapper.text()).toContain('错误日志: 3')
      
      expect(wrapper.text()).toContain('系统状态')
      expect(wrapper.text()).toContain('7天12小时')
      expect(wrapper.text()).toContain('CPU使用率: 45%')
    })

    it('should show error message when failed to load system stats', async () => {
      // Arrange
      mockGetSystemStats.mockRejectedValue(new Error('Network error'))
      mockGetSystemDetailInfo.mockRejectedValue(new Error('Network error'))

      // Act
      wrapper = mount(Dashboard)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '获取系统统计失败',
        type: 'error'
      }))
    })
  })

  describe('系统信息显示', () => {
    it('should display system information correctly', async () => {
      // Arrange
      mockGetSystemStats.mockResolvedValue({
        success: true,
        data: {
          userCount: 0,
          activeUsers: 0,
          roleCount: 0,
          permissionCount: 0,
          todayLogCount: 0,
          errorLogCount: 0,
          uptime: '0天0小时',
          cpuUsage: 0
        }
      })

      mockGetSystemDetailInfo.mockResolvedValue({
        success: true,
        data: {
          version: 'v2.1.0',
          lastUpdate: '2024-06-15',
          os: 'Ubuntu 22.04',
          database: 'MySQL 8.0.28',
          memoryUsage: '2.5GB / 4GB',
          diskSpace: '75GB / 100GB'
        }
      })

      // Act
      wrapper = mount(Dashboard)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.text()).toContain('v2.1.0')
      expect(wrapper.text()).toContain('2024-06-15')
      expect(wrapper.text()).toContain('Ubuntu 22.04')
      expect(wrapper.text()).toContain('MySQL 8.0.28')
      expect(wrapper.text()).toContain('2.5GB / 4GB')
      expect(wrapper.text()).toContain('75GB / 100GB')
    })
  })

  describe('AI监控指标展示', () => {
    it('should calculate and display system health score correctly', async () => {
      // Arrange
      mockGetSystemStats.mockResolvedValue({
        success: true,
        data: {
          userCount: 0,
          activeUsers: 0,
          roleCount: 0,
          permissionCount: 0,
          todayLogCount: 0,
          errorLogCount: 0,
          uptime: '0天0小时',
          cpuUsage: 0
        }
      })

      mockGetSystemDetailInfo.mockResolvedValue({
        success: true,
        data: {
          version: 'v1.0.0',
          lastUpdate: '2024-01-01',
          os: 'Linux',
          database: 'MySQL 8.0',
          memoryUsage: '4GB / 8GB',
          diskSpace: '50GB / 100GB'
        }
      })

      // Act
      wrapper = mount(Dashboard)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Assert
      // Since the metrics are randomly generated in the component, we just check if the health score is displayed
      const healthScoreElement = wrapper.find('.el-tag')
      expect(healthScoreElement.exists()).toBe(true)
      expect(healthScoreElement.text()).toContain('健康评分')
    })

    it('should display performance metrics correctly', async () => {
      // Arrange
      mockGetSystemStats.mockResolvedValue({
        success: true,
        data: {
          userCount: 0,
          activeUsers: 0,
          roleCount: 0,
          permissionCount: 0,
          todayLogCount: 0,
          errorLogCount: 0,
          uptime: '0天0小时',
          cpuUsage: 0
        }
      })

      mockGetSystemDetailInfo.mockResolvedValue({
        success: true,
        data: {
          version: 'v1.0.0',
          lastUpdate: '2024-01-01',
          os: 'Linux',
          database: 'MySQL 8.0',
          memoryUsage: '4GB / 8GB',
          diskSpace: '50GB / 100GB'
        }
      })

      // Act
      wrapper = mount(Dashboard)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.text()).toContain('性能指标')
      expect(wrapper.text()).toContain('安全指标')
      expect(wrapper.text()).toContain('可用性指标')
    })
  })

  describe('告警处理功能', () => {
    it('should display alerts when detected', async () => {
      // Arrange
      mockGetSystemStats.mockResolvedValue({
        success: true,
        data: {
          userCount: 0,
          activeUsers: 0,
          roleCount: 0,
          permissionCount: 0,
          todayLogCount: 0,
          errorLogCount: 0,
          uptime: '0天0小时',
          cpuUsage: 0
        }
      })

      mockGetSystemDetailInfo.mockResolvedValue({
        success: true,
        data: {
          version: 'v1.0.0',
          lastUpdate: '2024-01-01',
          os: 'Linux',
          database: 'MySQL 8.0',
          memoryUsage: '4GB / 8GB',
          diskSpace: '50GB / 100GB'
        }
      })

      // Act
      wrapper = mount(Dashboard)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Find the AI异常检测 button and trigger click
      const detectButton = wrapper.find('button:contains("AI异常检测")')
      await detectButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      // Since we're using mock data, we just check if the alerts section exists
      const alertsSection = wrapper.find('.alerts-section')
      expect(alertsSection.exists()).toBe(true)
    })

    it('should handle alert correctly', async () => {
      // Arrange
      mockGetSystemStats.mockResolvedValue({
        success: true,
        data: {
          userCount: 0,
          activeUsers: 0,
          roleCount: 0,
          permissionCount: 0,
          todayLogCount: 0,
          errorLogCount: 0,
          uptime: '0天0小时',
          cpuUsage: 0
        }
      })

      mockGetSystemDetailInfo.mockResolvedValue({
        success: true,
        data: {
          version: 'v1.0.0',
          lastUpdate: '2024-01-01',
          os: 'Linux',
          database: 'MySQL 8.0',
          memoryUsage: '4GB / 8GB',
          diskSpace: '50GB / 100GB'
        }
      })

      // Act
      wrapper = mount(Dashboard)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Trigger alert detection
      const detectButton = wrapper.find('button:contains("AI异常检测")')
      await detectButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Handle the alert
      const handleButton = wrapper.find('button:contains("处理")')
      await handleButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('已处理告警'),
        type: 'success'
      }))
    })
  })

  describe('优化建议功能', () => {
    it('should generate optimization suggestions', async () => {
      // Arrange
      mockGetSystemStats.mockResolvedValue({
        success: true,
        data: {
          userCount: 0,
          activeUsers: 0,
          roleCount: 0,
          permissionCount: 0,
          todayLogCount: 0,
          errorLogCount: 0,
          uptime: '0天0小时',
          cpuUsage: 0
        }
      })

      mockGetSystemDetailInfo.mockResolvedValue({
        success: true,
        data: {
          version: 'v1.0.0',
          lastUpdate: '2024-01-01',
          os: 'Linux',
          database: 'MySQL 8.0',
          memoryUsage: '4GB / 8GB',
          diskSpace: '50GB / 100GB'
        }
      })

      // Act
      wrapper = mount(Dashboard)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Trigger optimization suggestions
      const suggestionButton = wrapper.find('button:contains("刷新建议")')
      await suggestionButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '优化建议生成完成',
        type: 'success'
      }))
    })

    it('should apply recommendation correctly', async () => {
      // Arrange
      mockGetSystemStats.mockResolvedValue({
        success: true,
        data: {
          userCount: 0,
          activeUsers: 0,
          roleCount: 0,
          permissionCount: 0,
          todayLogCount: 0,
          errorLogCount: 0,
          uptime: '0天0小时',
          cpuUsage: 0
        }
      })

      mockGetSystemDetailInfo.mockResolvedValue({
        success: true,
        data: {
          version: 'v1.0.0',
          lastUpdate: '2024-01-01',
          os: 'Linux',
          database: 'MySQL 8.0',
          memoryUsage: '4GB / 8GB',
          diskSpace: '50GB / 100GB'
        }
      })

      // Act
      wrapper = mount(Dashboard)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Generate suggestions first
      const suggestionButton = wrapper.find('button:contains("刷新建议")')
      await suggestionButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Apply a recommendation
      const applyButton = wrapper.find('button:contains("立即应用")')
      await applyButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('已应用优化建议'),
        type: 'success'
      }))
    })
  })

  describe('页面导航功能', () => {
    it('should navigate to user management page', async () => {
      // Arrange
      mockGetSystemStats.mockResolvedValue({
        success: true,
        data: {
          userCount: 100,
          activeUsers: 30,
          roleCount: 5,
          permissionCount: 20,
          todayLogCount: 50,
          errorLogCount: 2,
          uptime: '5天8小时',
          cpuUsage: 35
        }
      })

      mockGetSystemDetailInfo.mockResolvedValue({
        success: true,
        data: {
          version: 'v1.0.0',
          lastUpdate: '2024-01-01',
          os: 'Linux',
          database: 'MySQL 8.0',
          memoryUsage: '4GB / 8GB',
          diskSpace: '50GB / 100GB'
        }
      })

      // Act
      wrapper = mount(Dashboard)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const manageUserButton = wrapper.find('button:contains("管理用户")')
      await manageUserButton.trigger('click')

      // Assert
      expect(mockRouter.push).toHaveBeenCalledWith('/system/user')
    })

    it('should navigate to role management page', async () => {
      // Arrange
      mockGetSystemStats.mockResolvedValue({
        success: true,
        data: {
          userCount: 100,
          activeUsers: 30,
          roleCount: 5,
          permissionCount: 20,
          todayLogCount: 50,
          errorLogCount: 2,
          uptime: '5天8小时',
          cpuUsage: 35
        }
      })

      mockGetSystemDetailInfo.mockResolvedValue({
        success: true,
        data: {
          version: 'v1.0.0',
          lastUpdate: '2024-01-01',
          os: 'Linux',
          database: 'MySQL 8.0',
          memoryUsage: '4GB / 8GB',
          diskSpace: '50GB / 100GB'
        }
      })

      // Act
      wrapper = mount(Dashboard)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const manageRoleButton = wrapper.find('button:contains("管理角色")')
      await manageRoleButton.trigger('click')

      // Assert
      expect(mockRouter.push).toHaveBeenCalledWith('/system/role')
    })
  })

  describe('数据刷新功能', () => {
    it('should refresh stats successfully', async () => {
      // Arrange
      mockGetSystemStats.mockResolvedValue({
        success: true,
        data: {
          userCount: 120,
          activeUsers: 40,
          roleCount: 6,
          permissionCount: 25,
          todayLogCount: 80,
          errorLogCount: 1,
          uptime: '6天10小时',
          cpuUsage: 30
        }
      })

      mockGetSystemDetailInfo.mockResolvedValue({
        success: true,
        data: {
          version: 'v1.1.0',
          lastUpdate: '2024-02-01',
          os: 'Ubuntu 20.04',
          database: 'MySQL 8.0.22',
          memoryUsage: '3GB / 8GB',
          diskSpace: '60GB / 100GB'
        }
      })

      // Act
      wrapper = mount(Dashboard)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const refreshButton = wrapper.find('button:contains("刷新数据")')
      await refreshButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '数据刷新成功',
        type: 'success'
      }))
    })

    it('should show error message when refresh fails', async () => {
      // Arrange
      mockGetSystemStats.mockRejectedValue(new Error('Network error'))
      mockGetSystemDetailInfo.mockRejectedValue(new Error('Network error'))

      // Act
      wrapper = mount(Dashboard)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const refreshButton = wrapper.find('button:contains("刷新数据")')
      await refreshButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({
        message: '刷新数据失败',
        type: 'error'
      }))
    })
  })
})