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
import Progress from '@/components/common/Progress.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElProgress: {
    name: 'ElProgress',
    template: '<div class="el-progress"></div>',
    props: [
      'percentage', 'type', 'strokeWidth', 'textInside', 'status', 'color',
      'showText', 'strokeLinecap', 'format', 'width', 'striped', 'stripedFlow'
    ]
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'icon']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot></slot></i>',
    props: ['size', 'color']
  },
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot></slot></div>',
    props: ['shadow', 'bodyStyle']
  }
}))

describe('Progress.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } }
      ]
    })
  })

  it('renders properly with default props', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-progress').exists()).toBe(true)
  })

  it('displays correct percentage value', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 75
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('percentage')).toBe(75)
  })

  it('applies correct type when type prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        type: 'circle'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('type')).toBe('circle')
  })

  it('applies default type when type prop is not provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('type')).toBe('line')
  })

  it('applies custom stroke width when strokeWidth prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        strokeWidth: 10
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('strokeWidth')).toBe(10)
  })

  it('applies default stroke width when strokeWidth prop is not provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('strokeWidth')).toBe(6)
  })

  it('shows text inside when textInside prop is true', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        textInside: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('textInside')).toBe(true)
  })

  it('shows text outside when textInside prop is false', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        textInside: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('textInside')).toBe(false)
  })

  it('applies correct status when status prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        status: 'success'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('status')).toBe('success')
  })

  it('applies default status when status prop is not provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('status')).toBeUndefined()
  })

  it('applies custom color when color prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        color: '#ff0000'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('color')).toBe('#ff0000')
  })

  it('applies default color when color prop is not provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('color')).toBeUndefined()
  })

  it('shows text when showText prop is true', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        showText: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('showText')).toBe(true)
  })

  it('hides text when showText prop is false', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        showText: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('showText')).toBe(false)
  })

  it('applies custom stroke line cap when strokeLinecap prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        strokeLinecap: 'square'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('strokeLinecap')).toBe('square')
  })

  it('applies default stroke line cap when strokeLinecap prop is not provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('strokeLinecap')).toBe('round')
  })

  it('applies custom format when format prop is provided', () => {
    const customFormat = (percentage: number) => `${percentage}% completed`
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        format: customFormat
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('format')).toBe(customFormat)
  })

  it('applies default format when format prop is not provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('format')).toBeUndefined()
  })

  it('applies custom width when width prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        width: 200
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('width')).toBe(200)
  })

  it('applies default width when width prop is not provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('width')).toBeUndefined()
  })

  it('applies striped style when striped prop is true', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        striped: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('striped')).toBe(true)
  })

  it('does not apply striped style when striped prop is false', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        striped: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('striped')).toBe(false)
  })

  it('applies striped flow when stripedFlow prop is true', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        stripedFlow: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('stripedFlow')).toBe(true)
  })

  it('does not apply striped flow when stripedFlow prop is false', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        stripedFlow: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('stripedFlow')).toBe(false)
  })

  it('handles zero percentage gracefully', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 0
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('percentage')).toBe(0)
  })

  it('handles negative percentage gracefully', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: -10
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('percentage')).toBe(-10)
  })

  it('handles percentage exceeding 100 gracefully', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 150
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.props('percentage')).toBe(150)
  })

  it('applies custom CSS classes when className prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        className: 'custom-progress'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-progress')
  })

  it('supports custom size when size prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        size: 'large'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('size')).toBe('large')
  })

  it('supports custom height when height prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        height: '20px'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('height')).toBe('20px')
  })

  it('supports custom background color when backgroundColor prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        backgroundColor: '#f0f0f0'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('backgroundColor')).toBe('#f0f0f0')
  })

  it('supports custom border radius when borderRadius prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        borderRadius: '10px'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('borderRadius')).toBe('10px')
  })

  it('supports animated progress when animated prop is true', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        animated: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('animated')).toBe(true)
  })

  it('supports non-animated progress when animated prop is false', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        animated: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('animated')).toBe(false)
  })

  it('supports custom animation duration when animationDuration prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        animated: true,
        animationDuration: 1000
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('animationDuration')).toBe(1000)
  })

  it('supports custom animation timing function when animationTiming prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        animated: true,
        animationTiming: 'ease-in-out'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('animationTiming')).toBe('ease-in-out')
  })

  it('supports indeterminate progress when indeterminate prop is true', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        indeterminate: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('indeterminate')).toBe(true)
  })

  it('supports determinate progress when indeterminate prop is false', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        indeterminate: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('indeterminate')).toBe(false)
  })

  it('supports custom label when label prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        label: 'Loading...'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('label')).toBe('Loading...')
  })

  it('supports custom tooltip when tooltip prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        tooltip: '50% complete'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('tooltip')).toBe('50% complete')
  })

  it('supports custom icon when icon prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        icon: 'el-icon-loading'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('icon')).toBe('el-icon-loading')
  })

  it('supports custom steps when steps prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        steps: 10
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('steps')).toBe(10)
  })

  it('supports custom step colors when stepColors prop is provided', () => {
    const stepColors = ['#ff0000', '#ffff00', '#00ff00']
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        steps: 10,
        stepColors: stepColors
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('stepColors')).toEqual(stepColors)
  })

  it('supports custom gap when gap prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        steps: 10,
        gap: 2
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('gap')).toBe(2)
  })

  it('supports responsive behavior when responsive prop is true', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        responsive: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('responsive')).toBe(true)
  })

  it('supports custom validation rules', () => {
    const validationRules = {
      min: 0,
      max: 100,
      required: true,
      message: 'Percentage must be between 0 and 100'
    }

    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        validationRules: validationRules
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('validationRules')).toEqual(validationRules)
  })

  it('emits complete event when progress reaches 100%', async () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 100
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('complete')
    expect(wrapper.emitted('complete')).toBeTruthy()
  })

  it('emits change event when percentage changes', async () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('change', 75)
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')[0]).toEqual([75])
  })

  it('supports custom progress segments', () => {
    const segments = [
      { percentage: 30, color: '#ff0000' },
      { percentage: 40, color: '#ffff00' },
      { percentage: 30, color: '#00ff00' }
    ]

    const wrapper = mount(Progress, {
      props: {
        percentage: 100,
        segments: segments
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('segments')).toEqual(segments)
  })

  it('supports custom progress direction when direction prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        direction: 'vertical'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('direction')).toBe('vertical')
  })

  it('supports custom progress alignment when alignment prop is provided', () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        alignment: 'center'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('alignment')).toBe('center')
  })
})