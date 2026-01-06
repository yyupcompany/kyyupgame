
vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(() => ({
    global: {
      t: vi.fn((key) => key),
      locale: 'zh-CN'
    }
  })),
  useI18n: vi.fn(() => ({
    t: vi.fn((key) => key),
    locale: ref('zh-CN')
  }))
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import ChartContainer from '@/components/centers/ChartContainer.vue'
import { Refresh, MoreFilled, Download, FullScreen, Setting, TrendCharts } from '@element-plus/icons-vue'

// 模拟EmptyState组件
vi.mock('@/components/common/EmptyState.vue', () => ({
  name: 'EmptyState',
  template: '<div class="empty-state"><slot name="icon"></slot><slot></slot></div>'
}))

// 模拟Element Plus图标
vi.mock('@element-plus/icons-vue', () => ({
  Refresh: vi.fn(),
  MoreFilled: vi.fn(),
  Download: vi.fn(),
  FullScreen: vi.fn(),
  Setting: vi.fn(),
  TrendCharts: vi.fn()
}))

// 模拟ECharts
const mockECharts = {
  init: vi.fn().mockReturnValue({
    setOption: vi.fn(),
    on: vi.fn(),
    dispose: vi.fn(),
    resize: vi.fn(),
    getDataURL: vi.fn().mockReturnValue('data:image/png;
import { vi } from 'vitest'base64,test')
  })
}

vi.mock('echarts', () => ({
  default: mockECharts
}))

// 模拟Element Plus组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    },
    ElTooltip: {
      name: 'ElTooltip',
      template: '<div><slot></slot><slot name="content"></slot></div>'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button @click="$emit(\'click\')"><slot></slot></button>'
    },
    ElDropdown: {
      name: 'ElDropdown',
      template: '<div><slot></slot><slot name="dropdown"></slot></div>'
    },
    ElDropdownMenu: {
      name: 'ElDropdownMenu',
      template: '<div><slot></slot></div>'
    },
    ElDropdownItem: {
      name: 'ElDropdownItem',
      template: '<div @click="$emit(\'click\')"><slot></slot></div>'
    },
    ElSkeleton: {
      name: 'ElSkeleton',
      template: '<div><slot></slot><slot name="template"></slot></div>'
    },
    ElLoading: {
      name: 'ElLoading',
      template: '<div class="loading">加载中...</div>'
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div><slot></slot></div>'
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<span><slot></slot></span>'
    }
  }
})

const mockChartOptions = {
  title: {
    text: '测试图表'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [150, 230, 224, 218, 135, 147, 260],
    type: 'line'
  }]
}

// 控制台错误检测变量
let consoleSpy: any

describe('ChartContainer.vue', () => {
  let wrapper: any
  let i18n: any

  beforeEach(() => {
    i18n = createI18n({
      legacy: false,
      locale: 'zh-CN',
      messages: {
        'zh-CN': {}
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 清理所有模拟函数
    vi.clearAllMocks()

    wrapper = mount(ChartContainer, {
      props: {
        title: '测试图表',
        options: mockChartOptions,
        loading: false,
        isEmpty: false,
        error: '',
        height: '400px',
        showTools: true,
        theme: 'default',
        autoResize: true
      },
      global: {
        plugins: [i18n],
        stubs: {
          'empty-state': true,
          'el-tooltip': true,
          'el-button': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-skeleton': true,
          'el-loading': true,
          'el-dialog': true,
          'el-icon': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  it('正确渲染组件', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.chart-container').exists()).toBe(true)
  })

  it('显示图表头部', () => {
    const header = wrapper.find('.chart-header')
    expect(header.exists()).toBe(true)
    expect(header.find('.chart-title').text()).toBe('测试图表')
  })

  it('显示图表内容区域', () => {
    const content = wrapper.find('.chart-content')
    expect(content.exists()).toBe(true)
    expect(content.attributes('style')).toContain('height: 400px')
  })

  it('显示图表工具栏', () => {
    const tools = wrapper.find('.chart-tools')
    expect(tools.exists()).toBe(true)
  })

  it('显示加载状态', () => {
    const loadingWrapper = mount(ChartContainer, {
      props: {
        title: '测试图表',
        options: mockChartOptions,
        loading: true
      },
      global: {
        plugins: [i18n],
        stubs: {
          'empty-state': true,
          'el-tooltip': true,
          'el-button': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-skeleton': true,
          'el-loading': true,
          'el-dialog': true,
          'el-icon': true
        }
      }
    })

    expect(loadingWrapper.find('.chart-loading').exists()).toBe(true)
    loadingWrapper.unmount()
  })

  it('显示空数据状态', () => {
    const emptyWrapper = mount(ChartContainer, {
      props: {
        title: '测试图表',
        options: mockChartOptions,
        isEmpty: true
      },
      global: {
        plugins: [i18n],
        stubs: {
          'empty-state': true,
          'el-tooltip': true,
          'el-button': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-skeleton': true,
          'el-loading': true,
          'el-dialog': true,
          'el-icon': true
        }
      }
    })

    expect(emptyWrapper.find('.chart-empty').exists()).toBe(true)
    emptyWrapper.unmount()
  })

  it('显示错误状态', () => {
    const errorWrapper = mount(ChartContainer, {
      props: {
        title: '测试图表',
        options: mockChartOptions,
        error: '图表加载失败'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'empty-state': true,
          'el-tooltip': true,
          'el-button': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-skeleton': true,
          'el-loading': true,
          'el-dialog': true,
          'el-icon': true
        }
      }
    })

    expect(errorWrapper.find('.chart-error').exists()).toBe(true)
    errorWrapper.unmount()
  })

  it('检查图表配置有效性', () => {
    const component = wrapper.vm
    expect(component.isValidOptions(mockChartOptions)).toBe(true)
    expect(component.isValidOptions(null)).toBe(false)
    expect(component.isValidOptions({})).toBe(false)
    expect(component.isValidOptions({ series: [] })).toBe(true)
  })

  it('初始化图表实例', async () => {
    await wrapper.vm.$nextTick()
    await wrapper.vm.initChart()
    
    expect(mockECharts.init).toHaveBeenCalled()
    expect(wrapper.vm.chartInstance).toBeTruthy()
  })

  it('更新图表配置', async () => {
    await wrapper.vm.$nextTick()
    await wrapper.vm.initChart()
    
    const newOptions = {
      ...mockChartOptions,
      title: { text: '更新后的图表' }
    }
    
    await wrapper.setProps({ options: newOptions })
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.chartInstance.setOption).toHaveBeenCalledWith(newOptions, true)
  })

  it('处理刷新事件', async () => {
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('refresh')).toBeTruthy()
  })

  it('处理重试事件', () => {
    wrapper.vm.$emit('retry')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('处理图表点击事件', async () => {
    await wrapper.vm.$nextTick()
    await wrapper.vm.initChart()
    
    const mockClickHandler = wrapper.vm.chartInstance.on.mock.calls[0][1]
    const mockParams = { name: '测试数据', value: 100 }
    mockClickHandler(mockParams)
    
    expect(wrapper.emitted('chart-click')).toBeTruthy()
    expect(wrapper.emitted('chart-click')[0]).toEqual([mockParams])
  })

  it('处理图表刷选事件', async () => {
    await wrapper.vm.$nextTick()
    await wrapper.vm.initChart()
    
    const mockBrushHandler = wrapper.vm.chartInstance.on.mock.calls[1][1]
    const mockParams = { areas: [] }
    mockBrushHandler(mockParams)
    
    expect(wrapper.emitted('chart-brush')).toBeTruthy()
    expect(wrapper.emitted('chart-brush')[0]).toEqual([mockParams])
  })

  it('处理工具栏命令', () => {
    wrapper.vm.handleToolCommand('download')
    expect(wrapper.emitted('download')).toBeFalsy() // 下载是内部处理
    
    wrapper.vm.handleToolCommand('fullscreen')
    expect(wrapper.vm.fullscreenVisible).toBe(true)
    
    wrapper.vm.handleToolCommand('settings')
    expect(ElMessage.info).toHaveBeenCalledWith('图表设置功能开发中...')
  })

  it('下载图表', () => {
    const mockWindowOpen = vi.fn()
    window.open = mockWindowOpen
    
    wrapper.vm.downloadChart()
    
    expect(wrapper.vm.chartInstance.getDataURL).toHaveBeenCalledWith({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: 'var(--bg-card)'
    })
    expect(ElMessage.success).toHaveBeenCalledWith('图表下载成功')
  })

  it('调整图表大小', () => {
    wrapper.vm.resizeChart()
    expect(wrapper.vm.chartInstance.resize).toHaveBeenCalled()
  })

  it('监听窗口大小变化', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    wrapper.vm.setupAutoResize()
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', wrapper.vm.resizeChart)
  })

  it('清理资源', () => {
    wrapper.vm.cleanup()
    expect(wrapper.vm.chartInstance.dispose).toHaveBeenCalled()
    expect(wrapper.vm.chartInstance).toBe(null)
  })

  it('监听高度变化', async () => {
    await wrapper.setProps({ height: '500px' })
    expect(wrapper.vm.chartHeight).toBe('500px')
  })

  it('监听加载状态变化', async () => {
    await wrapper.setProps({ loading: true })
    // 验证加载状态处理逻辑
    expect(wrapper.vm.loading).toBe(true)
  })

  it('监听配置变化', async () => {
    const newOptions = {
      ...mockChartOptions,
      series: [{
        data: [100, 200, 300],
        type: 'bar'
      }]
    }
    
    await wrapper.setProps({ options: newOptions })
    expect(wrapper.vm.chartInstance.setOption).toHaveBeenCalledWith(newOptions, true)
  })

  it('处理图表容器尺寸为0的情况', async () => {
    const mockGetBoundingClientRect = vi.fn().mockReturnValue({ width: 0, height: 0 })
    const mockElement = { getBoundingClientRect: mockGetBoundingClientRect, isConnected: true }
    
    wrapper.vm.chartRef = { value: mockElement }
    
    await wrapper.vm.initChart()
    
    // 应该尝试使用默认尺寸
    expect(mockElement.style.width).toBe('100%')
    expect(mockElement.style.height).toBe('400px')
  })

  it('处理图表容器未连接到DOM的情况', async () => {
    const mockElement = { isConnected: false }
    wrapper.vm.chartRef = { value: mockElement }
    
    await wrapper.vm.initChart()
    
    // 应该延迟初始化
    expect(setTimeout).toHaveBeenCalled()
  })

  it('处理图表初始化失败', async () => {
    mockECharts.init.mockImplementationOnce(() => {
      throw new Error('初始化失败')
    })
    
    wrapper.vm.chartRef = { value: document.createElement('div') }
    
    expect(() => {
      wrapper.vm.initChart()
    }).not.toThrow()
  })

  it('暴露公共方法', () => {
    expect(wrapper.vm.getChartInstance).toBeDefined()
    expect(wrapper.vm.resize).toBeDefined()
    expect(wrapper.vm.refresh).toBeDefined()
    expect(wrapper.vm.download).toBeDefined()
  })

  it('全屏图表初始化', async () => {
    wrapper.vm.fullscreenVisible = true
    await wrapper.vm.$nextTick()
    await wrapper.vm.initFullscreenChart()
    
    expect(mockECharts.init).toHaveBeenCalled()
  })

  it('清理全屏图表实例', () => {
    wrapper.vm.fullscreenChartInstance = { dispose: vi.fn() }
    wrapper.vm.cleanup()
    
    expect(wrapper.vm.fullscreenChartInstance.dispose).toHaveBeenCalled()
    expect(wrapper.vm.fullscreenChartInstance).toBe(null)
  })

  it('处理图表渲染遮罩', () => {
    const chartLoadingWrapper = mount(ChartContainer, {
      props: {
        title: '测试图表',
        options: mockChartOptions,
        chartLoading: true
      },
      global: {
        plugins: [i18n],
        stubs: {
          'empty-state': true,
          'el-tooltip': true,
          'el-button': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-skeleton': true,
          'el-loading': true,
          'el-dialog': true,
          'el-icon': true
        }
      }
    })

    expect(chartLoadingWrapper.find('.chart-mask').exists()).toBe(true)
    chartLoadingWrapper.unmount()
  })

  it('显示图表底部插槽', () => {
    const footerWrapper = mount(ChartContainer, {
      props: {
        title: '测试图表',
        options: mockChartOptions
      },
      slots: {
        footer: '<div class="chart-footer-content">底部内容</div>'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'empty-state': true,
          'el-tooltip': true,
          'el-button': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-skeleton': true,
          'el-loading': true,
          'el-dialog': true,
          'el-icon': true
        }
      }
    })

    expect(footerWrapper.find('.chart-footer').exists()).toBe(true)
    expect(footerWrapper.find('.chart-footer-content').exists()).toBe(true)
    footerWrapper.unmount()
  })

  it('处理隐藏工具栏', () => {
    const noToolsWrapper = mount(ChartContainer, {
      props: {
        title: '测试图表',
        options: mockChartOptions,
        showTools: false
      },
      global: {
        plugins: [i18n],
        stubs: {
          'empty-state': true,
          'el-tooltip': true,
          'el-button': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-skeleton': true,
          'el-loading': true,
          'el-dialog': true,
          'el-icon': true
        }
      }
    })

    expect(noToolsWrapper.find('.chart-tools').exists()).toBe(false)
    noToolsWrapper.unmount()
  })
})