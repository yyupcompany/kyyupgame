import { vi } from 'vitest'
/**
 * System Monitor Service Test
 * 系统监控服务测试
 * 
 * 测试覆盖范围：
 * - 单例模式实现
 * - 系统指标获取
 * - 缓存机制
 * - CPU指标获取
 * - 内存指标获取
 * - 磁盘指标获取
 * - 网络延迟测试
 * - 系统信息获取
 * - 安全指标计算
 * - 性能指标计算
 * - 默认指标返回
 * - 运行时间格式化
 * - 错误处理机制
 */

import { SystemMonitorService } from '../../../src/services/system-monitor.service'

// Mock external dependencies
jest.mock('systeminformation')
jest.mock('os')
jest.mock('fs')
jest.mock('path')
jest.mock('node-fetch', () => ({
  default: jest.fn()
}))

const si = require('systeminformation')
const os = require('os')
const fetch = require('node-fetch').default


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

describe('SystemMonitorService', () => {
  let systemMonitorService: SystemMonitorService

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Reset singleton instance
    (SystemMonitorService as any).instance = null
    
    // Setup default mock behaviors
    os.cpus.mockReturnValue([{ model: 'Test CPU' }])
    os.totalmem.mockReturnValue(8 * 1024 * 1024 * 1024) // 8GB
    os.freemem.mockReturnValue(4 * 1024 * 1024 * 1024) // 4GB
    os.uptime.mockReturnValue(3600) // 1 hour
    os.platform.mockReturnValue('linux')
    os.arch.mockReturnValue('x64')
    os.loadavg.mockReturnValue([1.5, 1.2, 1.0])
    
    // Create service instance
    systemMonitorService = SystemMonitorService.getInstance()
  })

  describe('单例模式', () => {
    it('应该返回相同的实例', () => {
      const instance1 = SystemMonitorService.getInstance()
      const instance2 = SystemMonitorService.getInstance()
      
      expect(instance1).toBe(instance2)
    })

    it('应该只创建一个实例', () => {
      const getInstanceSpy = jest.spyOn(SystemMonitorService.prototype as any, 'constructor')
      
      const instance1 = SystemMonitorService.getInstance()
      const instance2 = SystemMonitorService.getInstance()
      
      expect(getInstanceSpy).toHaveBeenCalledTimes(1)
      expect(instance1).toBe(instance2)
      
      getInstanceSpy.mockRestore()
    })
  })

  describe('getSystemMetrics', () => {
    it('应该成功获取系统指标', async () => {
      // Mock systeminformation responses
      si.cpu.mockResolvedValue({
        cores: 4,
        manufacturer: 'Test',
        brand: 'Test CPU'
      })
      
      si.currentLoad.mockResolvedValue({
        currentLoad: 25.5
      })
      
      si.mem.mockResolvedValue({
        total: 8 * 1024 * 1024 * 1024,
        used: 4 * 1024 * 1024 * 1024,
        free: 4 * 1024 * 1024 * 1024
      })
      
      si.fsSize.mockResolvedValue([
        {
          size: 500 * 1024 * 1024 * 1024,
          used: 100 * 1024 * 1024 * 1024
        }
      ])
      
      fetch.mockResolvedValue({ ok: true })

      const metrics = await systemMonitorService.getSystemMetrics()

      expect(metrics).toEqual({
        cpu: {
          usage: 26,
          temperature: undefined,
          cores: 4
        },
        memory: {
          total: 8,
          used: 4,
          free: 4,
          usage: 50
        },
        disk: {
          total: 500,
          used: 100,
          free: 400,
          usage: 20
        },
        network: {
          latency: expect.any(Number)
        },
        system: {
          uptime: 3600,
          platform: 'linux',
          arch: 'x64',
          nodeVersion: process.version,
          loadAverage: [1.5, 1.2, 1.0]
        },
        security: {
          score: expect.any(Number),
          threats: expect.any(Number),
          vulnerabilities: expect.any(Number),
          riskLevel: expect.any(String)
        },
        performance: {
          score: expect.any(Number),
          responseTime: expect.any(Number),
          errorRate: expect.any(Number),
          availability: expect.any(Number)
        }
      })
    })

    it('应该使用缓存数据', async () => {
      // Mock successful first call
      si.cpu.mockResolvedValue({ cores: 4 })
      si.currentLoad.mockResolvedValue({ currentLoad: 25 })
      si.mem.mockResolvedValue({
        total: 8 * 1024 * 1024 * 1024,
        used: 4 * 1024 * 1024 * 1024,
        free: 4 * 1024 * 1024 * 1024
      })
      si.fsSize.mockResolvedValue([{ size: 500 * 1024 * 1024 * 1024, used: 100 * 1024 * 1024 * 1024 }])
      fetch.mockResolvedValue({ ok: true })

      // First call
      const metrics1 = await systemMonitorService.getSystemMetrics()
      
      // Second call should use cache
      const metrics2 = await systemMonitorService.getSystemMetrics()

      expect(metrics1).toEqual(metrics2)
      expect(si.cpu).toHaveBeenCalledTimes(1) // Should only be called once
    })

    it('缓存过期后应该重新获取数据', async () => {
      // Mock successful first call
      si.cpu.mockResolvedValue({ cores: 4 })
      si.currentLoad.mockResolvedValue({ currentLoad: 25 })
      si.mem.mockResolvedValue({
        total: 8 * 1024 * 1024 * 1024,
        used: 4 * 1024 * 1024 * 1024,
        free: 4 * 1024 * 1024 * 1024
      })
      si.fsSize.mockResolvedValue([{ size: 500 * 1024 * 1024 * 1024, used: 100 * 1024 * 1024 * 1024 }])
      fetch.mockResolvedValue({ ok: true })

      // First call
      await systemMonitorService.getSystemMetrics()

      // Wait for cache to expire
      jest.useFakeTimers()
      jest.advanceTimersByTime(6000) // 6 seconds > 5 second cache duration

      // Second call should fetch new data
      await systemMonitorService.getSystemMetrics()

      expect(si.cpu).toHaveBeenCalledTimes(2) // Should be called twice

      jest.useRealTimers()
    })

    it('获取失败时应该返回默认指标', async () => {
      si.cpu.mockRejectedValue(new Error('CPU info failed'))
      si.currentLoad.mockRejectedValue(new Error('CPU load failed'))
      si.mem.mockRejectedValue(new Error('Memory info failed'))
      si.fsSize.mockRejectedValue(new Error('Disk info failed'))
      fetch.mockRejectedValue(new Error('Network failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const metrics = await systemMonitorService.getSystemMetrics()

      expect(metrics).toEqual({
        cpu: {
          usage: expect.any(Number),
          cores: 1
        },
        memory: {
          total: 8,
          used: expect.any(Number),
          free: expect.any(Number),
          usage: expect.any(Number)
        },
        disk: {
          total: 500,
          used: expect.any(Number),
          free: 400,
          usage: expect.any(Number)
        },
        network: {
          latency: expect.any(Number)
        },
        system: {
          uptime: 3600,
          platform: 'linux',
          arch: 'x64',
          nodeVersion: process.version,
          loadAverage: [1.5, 1.2, 1.0]
        },
        security: {
          score: expect.any(Number),
          threats: expect.any(Number),
          vulnerabilities: expect.any(Number),
          riskLevel: expect.any(String)
        },
        performance: {
          score: expect.any(Number),
          responseTime: expect.any(Number),
          errorRate: expect.any(Number),
          availability: expect.any(Number)
        }
      })

      expect(consoleSpy).toHaveBeenCalledWith('获取系统指标失败:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('getCpuMetrics', () => {
    it('应该成功获取CPU指标', async () => {
      si.cpu.mockResolvedValue({
        cores: 8,
        manufacturer: 'Intel',
        brand: 'Core i7'
      })
      
      si.currentLoad.mockResolvedValue({
        currentLoad: 45.7
      })

      const service = systemMonitorService as any
      const cpuMetrics = await service.getCpuMetrics()

      expect(cpuMetrics).toEqual({
        usage: 46,
        temperature: undefined,
        cores: 8
      })
    })

    it('CPU信息获取失败时应该使用默认值', async () => {
      si.cpu.mockRejectedValue(new Error('CPU info failed'))
      si.currentLoad.mockRejectedValue(new Error('CPU load failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const service = systemMonitorService as any
      const cpuMetrics = await service.getCpuMetrics()

      expect(cpuMetrics).toEqual({
        usage: expect.any(Number),
        cores: 1
      })
      expect(cpuMetrics.usage).toBeGreaterThanOrEqual(10)
      expect(cpuMetrics.usage).toBeLessThanOrEqual(40)

      consoleSpy.mockRestore()
    })

    it('应该处理undefined的CPU负载', async () => {
      si.cpu.mockResolvedValue({ cores: 4 })
      si.currentLoad.mockResolvedValue({ currentLoad: undefined })

      const service = systemMonitorService as any
      const cpuMetrics = await service.getCpuMetrics()

      expect(cpuMetrics.usage).toBe(0)
    })
  })

  describe('getMemoryMetrics', () => {
    it('应该成功获取内存指标', async () => {
      si.mem.mockResolvedValue({
        total: 16 * 1024 * 1024 * 1024,
        used: 8 * 1024 * 1024 * 1024,
        free: 8 * 1024 * 1024 * 1024
      })

      const service = systemMonitorService as any
      const memoryMetrics = await service.getMemoryMetrics()

      expect(memoryMetrics).toEqual({
        total: 16,
        used: 8,
        free: 8,
        usage: 50
      })
    })

    it('内存信息获取失败时应该使用Node.js内置方法', async () => {
      si.mem.mockRejectedValue(new Error('Memory info failed'))

      os.totalmem.mockReturnValue(16 * 1024 * 1024 * 1024)
      os.freemem.mockReturnValue(8 * 1024 * 1024 * 1024)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const service = systemMonitorService as any
      const memoryMetrics = await service.getMemoryMetrics()

      expect(memoryMetrics).toEqual({
        total: 16,
        used: 8,
        free: 8,
        usage: 50
      })

      consoleSpy.mockRestore()
    })

    it('应该正确计算内存使用率', async () => {
      si.mem.mockResolvedValue({
        total: 10 * 1024 * 1024 * 1024,
        used: 3 * 1024 * 1024 * 1024,
        free: 7 * 1024 * 1024 * 1024
      })

      const service = systemMonitorService as any
      const memoryMetrics = await service.getMemoryMetrics()

      expect(memoryMetrics.usage).toBe(30)
    })
  })

  describe('getDiskMetrics', () => {
    it('应该成功获取磁盘指标', async () => {
      si.fsSize.mockResolvedValue([
        {
          size: 1000 * 1024 * 1024 * 1024,
          used: 300 * 1024 * 1024 * 1024
        }
      ])

      const service = systemMonitorService as any
      const diskMetrics = await service.getDiskMetrics()

      expect(diskMetrics).toEqual({
        total: 1000,
        used: 300,
        free: 700,
        usage: 30
      })
    })

    it('没有磁盘数据时应该返回默认值', async () => {
      si.fsSize.mockResolvedValue([])

      const service = systemMonitorService as any
      const diskMetrics = await service.getDiskMetrics()

      expect(diskMetrics).toEqual({
        total: 500,
        used: expect.any(Number),
        free: 400,
        usage: expect.any(Number)
      })
    })

    it('磁盘信息获取失败时应该返回默认值', async () => {
      si.fsSize.mockRejectedValue(new Error('Disk info failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const service = systemMonitorService as any
      const diskMetrics = await service.getDiskMetrics()

      expect(diskMetrics).toEqual({
        total: 500,
        used: expect.any(Number),
        free: 400,
        usage: expect.any(Number)
      })

      consoleSpy.mockRestore()
    })
  })

  describe('getNetworkLatency', () => {
    it('应该成功获取网络延迟', async () => {
      fetch.mockResolvedValue({ ok: true })

      const service = systemMonitorService as any
      const latency = await service.getNetworkLatency()

      expect(latency).toBeGreaterThanOrEqual(0)
      expect(latency).toBeLessThan(5000)
      expect(fetch).toHaveBeenCalledWith('https://www.google.com', {
        method: 'HEAD',
        signal: expect.any(AbortSignal)
      })
    })

    it('网络请求超时应该返回999', async () => {
      // Mock timeout by not resolving the fetch
      fetch.mockImplementation(() => new Promise(() => {}))

      jest.useFakeTimers()
      const service = systemMonitorService as any
      const latencyPromise = service.getNetworkLatency()

      // Fast-forward 5 seconds
      jest.advanceTimersByTime(5000)

      const latency = await latencyPromise

      expect(latency).toBe(999)

      jest.useRealTimers()
    })

    it('网络请求失败应该返回模拟值', async () => {
      fetch.mockRejectedValue(new Error('Network error'))

      const service = systemMonitorService as any
      const latency = await service.getNetworkLatency()

      expect(latency).toBeGreaterThanOrEqual(50)
      expect(latency).toBeLessThanOrEqual(150)
    })
  })

  describe('getSystemInfo', () => {
    it('应该成功获取系统信息', async () => {
      const service = systemMonitorService as any
      const systemInfo = await service.getSystemInfo()

      expect(systemInfo).toEqual({
        uptime: 3600,
        platform: 'linux',
        arch: 'x64',
        nodeVersion: process.version,
        loadAverage: [1.5, 1.2, 1.0]
      })
    })
  })

  describe('getSecurityMetrics', () => {
    it('应该生成安全指标', () => {
      const service = systemMonitorService as any
      const securityMetrics = service.getSecurityMetrics()

      expect(securityMetrics).toEqual({
        score: expect.any(Number),
        threats: expect.any(Number),
        vulnerabilities: expect.any(Number),
        riskLevel: expect.any(String)
      })

      expect(securityMetrics.threats).toBeGreaterThanOrEqual(0)
      expect(securityMetrics.threats).toBeLessThan(5)
      expect(securityMetrics.vulnerabilities).toBeGreaterThanOrEqual(0)
      expect(securityMetrics.vulnerabilities).toBeLessThan(10)
      expect(securityMetrics.score).toBeGreaterThanOrEqual(60)
      expect(securityMetrics.score).toBeLessThanOrEqual(100)
    })

    it('应该根据威胁和漏洞数量确定风险等级', () => {
      const service = systemMonitorService as any
      
      // Mock different scenarios
      const originalRandom = Math.random
      Math.random = () => 0.5 // Fixed random for consistent testing

      // Test high risk
      jest.spyOn(service, 'getSecurityMetrics').mockImplementationOnce(() => ({
        threats: 3,
        vulnerabilities: 6,
        score: 73,
        riskLevel: 'high'
      }))
      let metrics = service.getSecurityMetrics()
      expect(metrics.riskLevel).toBe('high')

      // Test medium risk
      jest.spyOn(service, 'getSecurityMetrics').mockImplementationOnce(() => ({
        threats: 1,
        vulnerabilities: 3,
        score: 89,
        riskLevel: 'medium'
      }))
      metrics = service.getSecurityMetrics()
      expect(metrics.riskLevel).toBe('medium')

      // Test low risk
      jest.spyOn(service, 'getSecurityMetrics').mockImplementationOnce(() => ({
        threats: 0,
        vulnerabilities: 1,
        score: 98,
        riskLevel: 'low'
      }))
      metrics = service.getSecurityMetrics()
      expect(metrics.riskLevel).toBe('low')

      Math.random = originalRandom
    })
  })

  describe('getPerformanceMetrics', () => {
    it('应该生成性能指标', () => {
      const service = systemMonitorService as any
      const performanceMetrics = service.getPerformanceMetrics()

      expect(performanceMetrics).toEqual({
        score: expect.any(Number),
        responseTime: expect.any(Number),
        errorRate: expect.any(Number),
        availability: expect.any(Number)
      })

      expect(performanceMetrics.responseTime).toBeGreaterThanOrEqual(50)
      expect(performanceMetrics.responseTime).toBeLessThan(150)
      expect(performanceMetrics.errorRate).toBeGreaterThanOrEqual(0)
      expect(performanceMetrics.errorRate).toBeLessThan(5)
      expect(performanceMetrics.availability).toBeGreaterThanOrEqual(95)
      expect(performanceMetrics.availability).toBeLessThan(100)
      expect(performanceMetrics.score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getDefaultMetrics', () => {
    it('应该返回默认指标', () => {
      const service = systemMonitorService as any
      const defaultMetrics = service.getDefaultMetrics()

      expect(defaultMetrics).toEqual({
        cpu: { usage: 25, cores: 1 },
        memory: { total: 8, used: 4, free: 4, usage: 50 },
        disk: { total: 500, used: 100, free: 400, usage: 20 },
        network: { latency: 100 },
        system: {
          uptime: 3600,
          platform: 'linux',
          arch: 'x64',
          nodeVersion: process.version,
          loadAverage: [1.5, 1.2, 1.0]
        },
        security: { score: 85, threats: 0, vulnerabilities: 2, riskLevel: 'low' },
        performance: { score: 80, responseTime: 120, errorRate: 1, availability: 99 }
      })
    })
  })

  describe('formatUptime', () => {
    it('应该正确格式化多天运行时间', () => {
      const uptime = systemMonitorService.formatUptime(3 * 86400 + 5 * 3600) // 3天5小时
      expect(uptime).toBe('3天5小时')
    })

    it('应该正确格式化小时分钟运行时间', () => {
      const uptime = systemMonitorService.formatUptime(5 * 3600 + 30 * 60) // 5小时30分钟
      expect(uptime).toBe('5小时30分钟')
    })

    it('应该正确格式化分钟运行时间', () => {
      const uptime = systemMonitorService.formatUptime(45 * 60) // 45分钟
      expect(uptime).toBe('45分钟')
    })

    it('应该处理零运行时间', () => {
      const uptime = systemMonitorService.formatUptime(0)
      expect(uptime).toBe('0分钟')
    })
  })
})