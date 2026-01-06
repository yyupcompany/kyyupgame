
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

describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import QuotaStatistics from '@/components/enrollment/QuotaStatistics.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElRow: {
    name: 'ElRow',
    template: '<div class="el-row"><slot /></div>'
  },
  ElCol: {
    name: 'ElCol',
    template: '<div class="el-col"><slot /></div>'
  },
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot /></div>'
  }
}))

// Mock API and utilities
vi.mock('@/api/endpoints', () => ({
  ENROLLMENT_QUOTA_ENDPOINTS: {
    STATISTICS: (planId: number) => `/api/enrollment/quota/statistics/${planId}`
  }
}))

vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn()
  }
}))

describe('QuotaStatistics.vue', () => {
  let wrapper: any
  const mockPlanId = 123
  const mockStatisticsData = {
    totalQuota: 100,
    usedQuota: 75,
    remainingQuota: 25
  }

  const createWrapper = (props = {}) => {
    return mount(QuotaStatistics, {
      props: {
        planId: mockPlanId,
        ...props
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-row': true,
          'el-col': true,
          'el-card': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with required props', () => {
    wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts planId prop', () => {
    wrapper = createWrapper({ planId: 456 })
    expect(wrapper.props('planId')).toBe(456)
  })

  it('initializes statistics with default values', () => {
    wrapper = createWrapper()
    expect(wrapper.vm.statistics).toEqual({
      totalQuota: 0,
      usedQuota: 0,
      remainingQuota: 0
    })
  })

  it('computes usage rate correctly', () => {
    wrapper = createWrapper()
    
    // Test with zero total quota
    expect(wrapper.vm.usageRate).toBe('0.00')
    
    // Test with actual data
    wrapper.vm.statistics = mockStatisticsData
    expect(wrapper.vm.usageRate).toBe('75.00')
  })

  it('computes usage rate with decimal precision', () => {
    wrapper = createWrapper()
    wrapper.vm.statistics = {
      totalQuota: 3,
      usedQuota: 1
    }
    expect(wrapper.vm.usageRate).toBe('33.33')
  })

  it('calls fetchStatistics on mount', async () => {
    const { request } = require('@/utils/request')
    request.get.mockResolvedValue({
      data: mockStatisticsData
    })

    wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    expect(request.get).toHaveBeenCalledWith(
      `/api/enrollment/quota/statistics/${mockPlanId}`
    )
  })

  it('updates statistics when API call succeeds', async () => {
    const { request } = require('@/utils/request')
    request.get.mockResolvedValue({
      data: mockStatisticsData
    })

    wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.statistics).toEqual(mockStatisticsData)
  })

  it('handles API call error gracefully', async () => {
    const { request } = require('@/utils/request')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    request.get.mockRejectedValue(new Error('API Error'))

    wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    expect(consoleSpy).toHaveBeenCalledWith(
      '获取名额统计失败:',
      expect.any(Error)
    )
    consoleSpy.mockRestore()
  })

  it('does not update statistics when API response has no data', async () => {
    const { request } = require('@/utils/request')
    request.get.mockResolvedValue({})

    wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.statistics).toEqual({
      totalQuota: 0,
      usedQuota: 0,
      remainingQuota: 0
    })
  })

  it('renders four statistic cards', () => {
    wrapper = createWrapper()
    const cards = wrapper.findAllComponents({ name: 'ElCard' })
    expect(cards).toHaveLength(4)
  })

  it('displays total quota correctly', () => {
    wrapper = createWrapper()
    wrapper.vm.statistics = mockStatisticsData
    
    const totalQuotaCard = wrapper.findAllComponents({ name: 'ElCard' })[0]
    expect(totalQuotaCard.text()).toContain('总名额')
    expect(totalQuotaCard.text()).toContain('100')
  })

  it('displays used quota correctly', () => {
    wrapper = createWrapper()
    wrapper.vm.statistics = mockStatisticsData
    
    const usedQuotaCard = wrapper.findAllComponents({ name: 'ElCard' })[1]
    expect(usedQuotaCard.text()).toContain('已分配')
    expect(usedQuotaCard.text()).toContain('75')
  })

  it('displays remaining quota correctly', () => {
    wrapper = createWrapper()
    wrapper.vm.statistics = mockStatisticsData
    
    const remainingQuotaCard = wrapper.findAllComponents({ name: 'ElCard' })[2]
    expect(remainingQuotaCard.text()).toContain('剩余名额')
    expect(remainingQuotaCard.text()).toContain('25')
  })

  it('displays usage rate correctly', () => {
    wrapper = createWrapper()
    wrapper.vm.statistics = mockStatisticsData
    
    const usageRateCard = wrapper.findAllComponents({ name: 'ElCard' })[3]
    expect(usageRateCard.text()).toContain('使用率')
    expect(usageRateCard.text()).toContain('75%')
  })

  it('has correct grid layout', () => {
    wrapper = createWrapper()
    const cols = wrapper.findAllComponents({ name: 'ElCol' })
    expect(cols).toHaveLength(4)
    
    cols.forEach((col, index) => {
      expect(col.attributes('span')).toBe('6')
    })
  })

  it('calls fetchStatistics method correctly', async () => {
    const { request } = require('@/utils/request')
    request.get.mockResolvedValue({
      data: mockStatisticsData
    })

    wrapper = createWrapper()
    await wrapper.vm.fetchStatistics()

    expect(request.get).toHaveBeenCalledWith(
      `/api/enrollment/quota/statistics/${mockPlanId}`
    )
  })

  it('reacts to planId prop changes', async () => {
    const { request } = require('@/utils/request')
    request.get.mockResolvedValue({
      data: mockStatisticsData
    })

    wrapper = createWrapper({ planId: 123 })
    await wrapper.vm.$nextTick()

    await wrapper.setProps({ planId: 456 })
    await wrapper.vm.$nextTick()

    expect(request.get).toHaveBeenCalledWith(
      `/api/enrollment/quota/statistics/${456}`
    )
  })
})