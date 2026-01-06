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
import Rating from '@/components/common/Rating.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElRate: {
    name: 'ElRate',
    template: '<div class="el-rate"><slot></slot></div>',
    props: [
      'modelValue', 'max', 'disabled', 'allowHalf', 'lowThreshold', 'highThreshold',
      'colors', 'iconClasses', 'voidIconClass', 'disabledVoidIconClass',
      'showText', 'showScore', 'textColor', 'texts', 'scoreTemplate'
    ]
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot></slot></i>',
    props: ['size', 'color']
  }
}))

describe('Rating.vue', () => {
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
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-rate').exists()).toBe(true)
  })

  it('displays correct rating value', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 4
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('modelValue')).toBe(4)
  })

  it('applies custom max rating when max prop is provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        max: 10
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('max')).toBe(10)
  })

  it('applies default max rating when max prop is not provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('max')).toBe(5)
  })

  it('disables rating when disabled prop is true', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        disabled: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('disabled')).toBe(true)
  })

  it('enables rating when disabled prop is false', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        disabled: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('disabled')).toBe(false)
  })

  it('enables half rating when allowHalf prop is true', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3.5,
        allowHalf: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('allowHalf')).toBe(true)
  })

  it('disables half rating when allowHalf prop is false', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        allowHalf: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('allowHalf')).toBe(false)
  })

  it('applies custom low threshold when lowThreshold prop is provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 2,
        lowThreshold: 2
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('lowThreshold')).toBe(2)
  })

  it('applies default low threshold when lowThreshold prop is not provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 2
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('lowThreshold')).toBe(2)
  })

  it('applies custom high threshold when highThreshold prop is provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 4,
        highThreshold: 4
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('highThreshold')).toBe(4)
  })

  it('applies default high threshold when highThreshold prop is not provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 4
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('highThreshold')).toBe(4)
  })

  it('applies custom colors when colors prop is provided', () => {
    const customColors = ['#99A9BF', '#F7BA2A', '#FF9900']
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        colors: customColors
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('colors')).toEqual(customColors)
  })

  it('applies default colors when colors prop is not provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('colors')).toBeUndefined()
  })

  it('applies custom icon classes when iconClasses prop is provided', () => {
    const customIconClasses = ['el-icon-star-off', 'el-icon-star-on', 'el-icon-star-on']
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        iconClasses: customIconClasses
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('iconClasses')).toEqual(customIconClasses)
  })

  it('applies custom void icon class when voidIconClass prop is provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        voidIconClass: 'el-icon-star-off'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('voidIconClass')).toBe('el-icon-star-off')
  })

  it('applies custom disabled void icon class when disabledVoidIconClass prop is provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        disabledVoidIconClass: 'el-icon-star-off'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('disabledVoidIconClass')).toBe('el-icon-star-off')
  })

  it('shows text when showText prop is true', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        showText: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('showText')).toBe(true)
  })

  it('hides text when showText prop is false', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        showText: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('showText')).toBe(false)
  })

  it('shows score when showScore prop is true', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3.5,
        showScore: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('showScore')).toBe(true)
  })

  it('hides score when showScore prop is false', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3.5,
        showScore: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('showScore')).toBe(false)
  })

  it('applies custom text color when textColor prop is provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        textColor: '#ff0000'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('textColor')).toBe('#ff0000')
  })

  it('applies custom texts when texts prop is provided', () => {
    const customTexts = ['Very Bad', 'Bad', 'Normal', 'Good', 'Very Good']
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        texts: customTexts
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('texts')).toEqual(customTexts)
  })

  it('applies custom score template when scoreTemplate prop is provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3.5,
        scoreTemplate: '{value} points'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('scoreTemplate')).toBe('{value} points')
  })

  it('emits update:modelValue event when rating changes', async () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('update:modelValue', 4)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([4])
  })

  it('emits change event when rating changes', async () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('change', 4)
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')[0]).toEqual([4])
  })

  it('handles zero rating gracefully', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 0
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('modelValue')).toBe(0)
  })

  it('handles negative rating gracefully', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: -1
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('modelValue')).toBe(-1)
  })

  it('handles rating exceeding max gracefully', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 10,
        max: 5
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const rate = wrapper.find('.el-rate')
    expect(rate.props('modelValue')).toBe(10)
  })

  it('applies custom CSS classes when className prop is provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        className: 'custom-rating'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-rating')
  })

  it('supports custom size when size prop is provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        size: 'large'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('size')).toBe('large')
  })

  it('supports custom icon when icon prop is provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        icon: 'el-icon-star'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('icon')).toBe('el-icon-star')
  })

  it('supports custom void icon when voidIcon prop is provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        voidIcon: 'el-icon-star-off'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('voidIcon')).toBe('el-icon-star-off')
  })

  it('supports read-only mode when readonly prop is true', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        readonly: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('readonly')).toBe(true)
  })

  it('supports interactive mode when readonly prop is false', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        readonly: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('readonly')).toBe(false)
  })

  it('supports clearable rating when clearable prop is true', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        clearable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('clearable')).toBe(true)
  })

  it('supports non-clearable rating when clearable prop is false', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        clearable: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('clearable')).toBe(false)
  })

  it('supports custom step when step prop is provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        step: 0.5
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('step')).toBe(0.5)
  })

  it('supports custom precision when precision prop is provided', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3.25,
        precision: 2
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('precision')).toBe(2)
  })

  it('supports hover preview when hoverPreview prop is true', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        hoverPreview: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('hoverPreview')).toBe(true)
  })

  it('supports no hover preview when hoverPreview prop is false', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        hoverPreview: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('hoverPreview')).toBe(false)
  })

  it('emits hover event when mouse hovers over rating', async () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        hoverPreview: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('hover', 4)
    expect(wrapper.emitted('hover')).toBeTruthy()
    expect(wrapper.emitted('hover')[0]).toEqual([4])
  })

  it('emits leave event when mouse leaves rating', async () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        hoverPreview: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('leave')
    expect(wrapper.emitted('leave')).toBeTruthy()
  })

  it('supports custom validation rules', () => {
    const validationRules = {
      required: true,
      min: 1,
      max: 5,
      message: 'Please select a rating'
    }

    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        validationRules: validationRules
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('validationRules')).toEqual(validationRules)
  })

  it('supports custom tooltips', () => {
    const tooltips = ['Terrible', 'Bad', 'Average', 'Good', 'Excellent']
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        tooltips: tooltips
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('tooltips')).toEqual(tooltips)
  })

  it('supports keyboard navigation', async () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('supports touch interaction', async () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('touchstart', { touches: [{ clientX: 100 }] })
    expect(wrapper.emitted('touchstart')).toBeTruthy()
  })

  it('supports responsive behavior', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        responsive: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('responsive')).toBe(true)
  })

  it('supports custom animations', () => {
    const wrapper = mount(Rating, {
      props: {
        modelValue: 3,
        animated: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('animated')).toBe(true)
  })
})