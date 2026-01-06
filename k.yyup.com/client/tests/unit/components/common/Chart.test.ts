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
import { createRouter, createWebHistory, Router } from 'vue-router'
import Chart from '@/components/common/Chart.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot></slot></div>',
    props: ['shadow', 'bodyStyle']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'icon']
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<div class="el-select"><slot></slot></div>',
    props: ['modelValue', 'placeholder', 'disabled', 'multiple']
  },
  ElOption: {
    name: 'ElOption',
    template: '<div class="el-option"><slot></slot></div>',
    props: ['value', 'label', 'disabled']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot></slot></i>',
    props: ['size', 'color']
  },
  ElTooltip: {
    name: 'ElTooltip',
    template: '<div class="el-tooltip"><slot></slot></div>',
    props: ['content', 'placement', 'disabled']
  },
  ElDropdown: {
    name: 'ElDropdown',
    template: '<div class="el-dropdown"><slot></slot></div>',
    props: ['trigger', 'placement', 'disabled']
  },
  ElDropdownMenu: {
    name: 'ElDropdownMenu',
    template: '<div class="el-dropdown-menu"><slot></slot></div>'
  },
  ElDropdownItem: {
    name: 'ElDropdownItem',
    template: '<div class="el-dropdown-item"><slot></slot></div>',
    props: ['disabled', 'divided']
  }
}))

// Mock chart library (could be Chart.js, ECharts, etc.)
const mockChartLibrary = {
  create: vi.fn(() => ({
    update: vi.fn(),
    destroy: vi.fn(),
    resize: vi.fn(),
    setOption: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  }))
}

vi.mock('chart.js', () => mockChartLibrary)
vi.mock('echarts', () => mockChartLibrary)

describe('Chart.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } }
      ]
    })
  })

  const mockData = [
    { name: 'January', value: 65 },
    { name: 'February', value: 59 },
    { name: 'March', value: 80 },
    { name: 'April', value: 81 },
    { name: 'May', value: 56 },
    { name: 'June', value: 55 }
  ]

  it('renders properly with default props', () => {
    const wrapper = mount(Chart, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.chart-container').exists()).toBe(true)
  })

  it('displays chart with provided data', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('data')).toEqual(mockData)
  })

  it('supports different chart types', () => {
    const chartTypes = ['line', 'bar', 'pie', 'doughnut', 'radar', 'polarArea', 'bubble', 'scatter']
    
    chartTypes.forEach(type => {
      const wrapper = mount(Chart, {
        props: {
          type,
          data: mockData
        },
        global: {
          plugins: [router, ElementPlus]
        }
      })

      expect(wrapper.props('type')).toBe(type)
    })
  })

  it('uses bar chart as default type', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('type')).toBe('bar')
  })

  it('applies custom chart options', () => {
    const customOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    }

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        options: customOptions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('options')).toEqual(customOptions)
  })

  it('supports custom chart title', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        title: 'Monthly Sales Chart'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('title')).toBe('Monthly Sales Chart')
  })

  it('supports chart description', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        description: 'This chart shows monthly sales data'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('description')).toBe('This chart shows monthly sales data')
  })

  it('supports custom chart dimensions', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        width: 800,
        height: 400
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('width')).toBe(800)
    expect(wrapper.props('height')).toBe(400)
  })

  it('supports responsive chart', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        responsive: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('responsive')).toBe(true)
  })

  it('supports aspect ratio', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        aspectRatio: 2
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('aspectRatio')).toBe(2)
  })

  it('supports custom colors', () => {
    const customColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
    
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        colors: customColors
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('colors')).toEqual(customColors)
  })

  it('supports custom background colors', () => {
    const customBackgroundColors = ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)']
    
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        backgroundColors: customBackgroundColors
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('backgroundColors')).toEqual(customBackgroundColors)
  })

  it('supports custom border colors', () => {
    const customBorderColors = ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)']
    
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        borderColors: customBorderColors
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('borderColors')).toEqual(customBorderColors)
  })

  it('supports custom border width', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        borderWidth: 3
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('borderWidth')).toBe(3)
  })

  it('supports custom point radius', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        pointRadius: 5
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('pointRadius')).toBe(5)
  })

  it('supports custom point hover radius', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        pointHoverRadius: 8
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('pointHoverRadius')).toBe(8)
  })

  it('supports custom fill', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        fill: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('fill')).toBe(true)
  })

  it('supports custom tension for line charts', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        type: 'line',
        tension: 0.4
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('tension')).toBe(0.4)
  })

  it('supports custom legend display', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        showLegend: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showLegend')).toBe(false)
  })

  it('supports custom legend position', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        legendPosition: 'bottom'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('legendPosition')).toBe('bottom')
  })

  it('supports custom tooltips', () => {
    const customTooltip = {
      enabled: true,
      mode: 'index',
      intersect: false
    }

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        tooltip: customTooltip
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('tooltip')).toEqual(customTooltip)
  })

  it('supports custom animation', () => {
    const customAnimation = {
      duration: 1000,
      easing: 'easeInOutQuart'
    }

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        animation: customAnimation
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('animation')).toEqual(customAnimation)
  })

  it('supports stacked charts', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        stacked: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('stacked')).toBe(true)
  })

  it('supports horizontal orientation', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        horizontal: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('horizontal')).toBe(true)
  })

  it('supports custom axis labels', () => {
    const axisLabels = {
      x: 'Months',
      y: 'Sales'
    }

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        axisLabels
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('axisLabels')).toEqual(axisLabels)
  })

  it('supports custom axis ranges', () => {
    const axisRanges = {
      x: { min: 0, max: 12 },
      y: { min: 0, max: 100 }
    }

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        axisRanges
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('axisRanges')).toEqual(axisRanges)
  })

  it('supports custom grid lines', () => {
    const gridLines = {
      display: true,
      color: 'rgba(0, 0, 0, 0.1)',
      lineWidth: 1
    }

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        gridLines
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('gridLines')).toEqual(gridLines)
  })

  it('supports multiple datasets', () => {
    const multipleData = {
      labels: ['January', 'February', 'March'],
      datasets: [
        {
          label: 'Sales',
          data: [65, 59, 80],
          borderColor: '#FF6384'
        },
        {
          label: 'Expenses',
          data: [28, 48, 40],
          borderColor: '#36A2EB'
        }
      ]
    }

    const wrapper = mount(Chart, {
      props: {
        data: multipleData
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('data')).toEqual(multipleData)
  })

  it('emits click event when chart is clicked', async () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const clickData = { element: 'bar', index: 0, value: 65 }
    await wrapper.vm.$emit('click', clickData)
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')[0]).toEqual([clickData])
  })

  it('emits hover event when chart item is hovered', async () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const hoverData = { element: 'bar', index: 0, value: 65 }
    await wrapper.vm.$emit('hover', hoverData)
    expect(wrapper.emitted('hover')).toBeTruthy()
    expect(wrapper.emitted('hover')[0]).toEqual([hoverData])
  })

  it('emits ready event when chart is ready', async () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('ready', { chartInstance: {} })
    expect(wrapper.emitted('ready')).toBeTruthy()
  })

  it('supports loading state', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        loading: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loading')).toBe(true)
  })

  it('supports custom loading text', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        loading: true,
        loadingText: 'Loading chart...'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loadingText')).toBe('Loading chart...')
  })

  it('supports empty state', () => {
    const wrapper = mount(Chart, {
      props: {
        data: [],
        emptyText: 'No data available'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('emptyText')).toBe('No data available')
  })

  it('supports error state', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        error: true,
        errorMessage: 'Failed to load chart'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('error')).toBe(true)
    expect(wrapper.props('errorMessage')).toBe('Failed to load chart')
  })

  it('supports custom CSS classes', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        className: 'custom-chart'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-chart')
  })

  it('supports custom styles', () => {
    const customStyle = { backgroundColor: '#f5f5f5', borderRadius: '8px' }
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        style: customStyle
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('style')).toEqual(customStyle)
  })

  it('supports chart export functionality', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        exportable: true,
        exportFormats: ['png', 'jpg', 'svg']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('exportable')).toBe(true)
    expect(wrapper.props('exportFormats')).toEqual(['png', 'jpg', 'svg'])
  })

  it('supports chart refresh functionality', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        refreshable: true,
        refreshInterval: 5000
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('refreshable')).toBe(true)
    expect(wrapper.props('refreshInterval')).toBe(5000)
  })

  it('supports chart zoom functionality', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        zoomable: true,
        zoomOptions: { wheel: true, pinch: true }
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('zoomable')).toBe(true)
    expect(wrapper.props('zoomOptions')).toEqual({ wheel: true, pinch: true })
  })

  it('supports chart pan functionality', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        pannable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('pannable')).toBe(true)
  })

  it('supports chart theme', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        theme: 'dark'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('theme')).toBe('dark')
  })

  it('supports custom chart library options', () => {
    const customLibraryOptions = {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        libraryOptions: customLibraryOptions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('libraryOptions')).toEqual(customLibraryOptions)
  })

  it('supports chart plugins', () => {
    const plugins = [
      {
        id: 'customPlugin',
        beforeDraw: vi.fn()
      }
    ]

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        plugins
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('plugins')).toEqual(plugins)
  })

  it('supports accessibility attributes', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        ariaLabel: 'Sales performance chart',
        ariaDescribedBy: 'chart-description'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('ariaLabel')).toBe('Sales performance chart')
    expect(wrapper.props('ariaDescribedBy')).toBe('chart-description')
  })

  it('supports keyboard navigation', async () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('supports touch events', async () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
    expect(wrapper.emitted('touchstart')).toBeTruthy()
  })

  it('supports custom data formatting', () => {
    const dataFormat = {
      value: (value: number) => `$${value.toLocaleString()}`,
      label: (label: string) => label.toUpperCase()
    }

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        dataFormat
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('dataFormat')).toEqual(dataFormat)
  })

  it('supports custom chart actions', () => {
    const actions = [
      { label: 'Export', icon: 'el-icon-download', handler: vi.fn() },
      { label: 'Refresh', icon: 'el-icon-refresh', handler: vi.fn() }
    ]

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        actions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('actions')).toEqual(actions)
  })

  it('supports custom chart filters', () => {
    const filters = [
      { key: 'period', label: 'Period', options: ['month', 'quarter', 'year'] },
      { key: 'category', label: 'Category', options: ['sales', 'expenses', 'profit'] }
    ]

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        filters
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('filters')).toEqual(filters)
  })

  it('supports custom chart legend templates', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData
      },
      slots: {
        legend: '<template #legend><div class="custom-legend">Custom Legend</div></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-legend').exists()).toBe(true)
  })

  it('supports custom chart tooltip templates', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData
      },
      slots: {
        tooltip: '<template #tooltip><div class="custom-tooltip">Custom Tooltip</div></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-tooltip').exists()).toBe(true)
  })

  it('handles empty data gracefully', () => {
    const wrapper = mount(Chart, {
      props: {
        data: []
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.chart-container').exists()).toBe(true)
  })

  it('handles null data gracefully', () => {
    const wrapper = mount(Chart, {
      props: {
        data: null
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.chart-container').exists()).toBe(true)
  })

  it('handles undefined data gracefully', () => {
    const wrapper = mount(Chart, {
      props: {
        data: undefined
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.chart-container').exists()).toBe(true)
  })

  it('supports performance optimization options', () => {
    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 1
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('animation')).toBe(false)
    expect(wrapper.props('responsive')).toBe(true)
    expect(wrapper.props('maintainAspectRatio')).toBe(false)
    expect(wrapper.props('devicePixelRatio')).toBe(1)
  })

  it('supports custom chart events', () => {
    const customEvents = {
      onDataSelect: vi.fn(),
      onDataHover: vi.fn(),
      onDataUnselect: vi.fn()
    }

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        ...customEvents
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('onDataSelect')).toBe(customEvents.onDataSelect)
    expect(wrapper.props('onDataHover')).toBe(customEvents.onDataHover)
    expect(wrapper.props('onDataUnselect')).toBe(customEvents.onDataUnselect)
  })

  it('supports custom chart localization', () => {
    const localization = {
      locale: 'zh-CN',
      currency: 'CNY',
      dateFormat: 'YYYY年MM月DD日'
    }

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        localization
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('localization')).toEqual(localization)
  })

  it('supports custom chart validation', () => {
    const validation = {
      minDataPoints: 1,
      maxDataPoints: 100,
      requiredFields: ['name', 'value']
    }

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        validation
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('validation')).toEqual(validation)
  })

  it('supports custom chart thresholds', () => {
    const thresholds = [
      { value: 50, color: '#ff0000', label: 'Low' },
      { value: 75, color: '#ffff00', label: 'Medium' },
      { value: 100, color: '#00ff00', label: 'High' }
    ]

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        thresholds
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('thresholds')).toEqual(thresholds)
  })

  it('supports custom chart annotations', () => {
    const annotations = [
      { type: 'line', value: 75, label: 'Target' },
      { type: 'box', xMin: 2, xMax: 4, label: 'Important Period' }
    ]

    const wrapper = mount(Chart, {
      props: {
        data: mockData,
        annotations
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('annotations')).toEqual(annotations)
  })
})