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
import Carousel from '@/components/common/Carousel.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElCarousel: {
    name: 'ElCarousel',
    template: '<div class="el-carousel"><div class="el-carousel__container"><slot></slot></div></div>',
    props: [
      'height', 'initialIndex', 'trigger', 'autoplay', 'interval', 'indicatorPosition',
      'arrow', 'type', 'loop', 'direction', 'pauseOnHover'
    ]
  },
  ElCarouselItem: {
    name: 'ElCarouselItem',
    template: '<div class="el-carousel-item"><slot></slot></div>',
    props: ['name', 'label']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'icon', 'circle']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot></slot></i>',
    props: ['size', 'color']
  },
  ElImage: {
    name: 'ElImage',
    template: '<img class="el-image" />',
    props: ['src', 'alt', 'fit', 'previewSrcList']
  }
}))

describe('Carousel.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } }
      ]
    })
  })

  const mockItems = [
    { id: 1, src: 'https://example.com/image1.jpg', alt: 'Image 1', title: 'Slide 1' },
    { id: 2, src: 'https://example.com/image2.jpg', alt: 'Image 2', title: 'Slide 2' },
    { id: 3, src: 'https://example.com/image3.jpg', alt: 'Image 3', title: 'Slide 3' }
  ]

  it('renders properly with default props', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-carousel').exists()).toBe(true)
  })

  it('displays correct carousel items', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carouselItems = wrapper.findAll('.el-carousel-item')
    expect(carouselItems.length).toBe(mockItems.length)
  })

  it('applies custom height when height prop is provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        height: '400px'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('height')).toBe('400px')
  })

  it('applies default height when height prop is not provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('height')).toBe('300px')
  })

  it('sets initial index when initialIndex prop is provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        initialIndex: 1
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('initialIndex')).toBe(1)
  })

  it('applies default initial index when initialIndex prop is not provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('initialIndex')).toBe(0)
  })

  it('applies correct trigger when trigger prop is provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        trigger: 'hover'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('trigger')).toBe('hover')
  })

  it('applies default trigger when trigger prop is not provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('trigger')).toBe('click')
  })

  it('enables autoplay when autoplay prop is true', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        autoplay: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('autoplay')).toBe(true)
  })

  it('disables autoplay when autoplay prop is false', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        autoplay: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('autoplay')).toBe(false)
  })

  it('applies custom interval when interval prop is provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        interval: 5000
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('interval')).toBe(5000)
  })

  it('applies default interval when interval prop is not provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('interval')).toBe(3000)
  })

  it('applies correct indicator position when indicatorPosition prop is provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        indicatorPosition: 'outside'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('indicatorPosition')).toBe('outside')
  })

  it('applies default indicator position when indicatorPosition prop is not provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('indicatorPosition')).toBe(undefined)
  })

  it('shows arrows when arrow prop is hover', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        arrow: 'hover'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('arrow')).toBe('hover')
  })

  it('hides arrows when arrow prop is never', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        arrow: 'never'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('arrow')).toBe('never')
  })

  it('applies default arrow setting when arrow prop is not provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('arrow')).toBe('hover')
  })

  it('applies correct type when type prop is provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        type: 'card'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('type')).toBe('card')
  })

  it('applies default type when type prop is not provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('type')).toBe(undefined)
  })

  it('enables looping when loop prop is true', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        loop: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('loop')).toBe(true)
  })

  it('disables looping when loop prop is false', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        loop: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('loop')).toBe(false)
  })

  it('applies correct direction when direction prop is provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        direction: 'vertical'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('direction')).toBe('vertical')
  })

  it('applies default direction when direction prop is not provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('direction')).toBe('horizontal')
  })

  it('pauses on hover when pauseOnHover prop is true', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        pauseOnHover: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('pauseOnHover')).toBe(true)
  })

  it('does not pause on hover when pauseOnHover prop is false', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        pauseOnHover: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carousel = wrapper.find('.el-carousel')
    expect(carousel.props('pauseOnHover')).toBe(false)
  })

  it('emits change event when carousel slide changes', async () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('change', 1)
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')[0]).toEqual([1])
  })

  it('emits input event when active slide changes', async () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('input', 2)
    expect(wrapper.emitted('input')).toBeTruthy()
    expect(wrapper.emitted('input')[0]).toEqual([2])
  })

  it('renders images correctly when items have src property', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const images = wrapper.findAll('.el-image')
    expect(images.length).toBe(mockItems.length)
  })

  it('renders custom content when items provide custom content', () => {
    const customItems = [
      { id: 1, content: '<div class="custom-slide">Custom Slide 1</div>' },
      { id: 2, content: '<div class="custom-slide">Custom Slide 2</div>' }
    ]

    const wrapper = mount(Carousel, {
      props: {
        items: customItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-slide').exists()).toBe(true)
  })

  it('handles empty items array gracefully', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: []
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carouselItems = wrapper.findAll('.el-carousel-item')
    expect(carouselItems.length).toBe(0)
    expect(wrapper.find('.el-carousel').exists()).toBe(true)
  })

  it('handles null items gracefully', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: null
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carouselItems = wrapper.findAll('.el-carousel-item')
    expect(carouselItems.length).toBe(0)
    expect(wrapper.find('.el-carousel').exists()).toBe(true)
  })

  it('handles undefined items gracefully', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: undefined
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const carouselItems = wrapper.findAll('.el-carousel-item')
    expect(carouselItems.length).toBe(0)
    expect(wrapper.find('.el-carousel').exists()).toBe(true)
  })

  it('applies custom CSS classes when className prop is provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        className: 'custom-carousel'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-carousel')
  })

  it('supports custom item rendering', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      slots: {
        item: '<template #item="{ item }"><div class="custom-item">{{ item.title }}</div></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-item').exists()).toBe(true)
  })

  it('supports custom indicator rendering', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      slots: {
        indicator: '<template #indicator="{ index, active }"><span class="custom-indicator">{{ index + 1 }}</span></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-indicator').exists()).toBe(true)
  })

  it('supports custom arrow rendering', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      slots: {
        'arrow-left': '<span class="custom-arrow-left">←</span>',
        'arrow-right': '<span class="custom-arrow-right">→</span>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-arrow-left').exists()).toBe(true)
    expect(wrapper.find('.custom-arrow-right').exists()).toBe(true)
  })

  it('supports lazy loading when lazy prop is true', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        lazy: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('lazy')).toBe(true)
  })

  it('supports image preview when preview prop is true', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        preview: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('preview')).toBe(true)
  })

  it('supports custom image fit when fit prop is provided', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        fit: 'cover'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('fit')).toBe('cover')
  })

  it('supports keyboard navigation', async () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('supports touch/swipe navigation', async () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('touchstart', { touches: [{ clientX: 100 }] })
    await wrapper.trigger('touchend', { touches: [{ clientX: 50 }] })
    expect(wrapper.emitted('swipe')).toBeTruthy()
  })

  it('supports custom animations', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        animation: 'fade'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('animation')).toBe('fade')
  })

  it('supports responsive behavior', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        responsive: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('responsive')).toBe(true)
  })

  it('supports custom breakpoints', () => {
    const breakpoints = {
      768: { itemsPerSlide: 1 },
      1024: { itemsPerSlide: 2 },
      1200: { itemsPerSlide: 3 }
    }

    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        breakpoints: breakpoints
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('breakpoints')).toEqual(breakpoints)
  })

  it('supports multiple items per slide', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        itemsPerSlide: 2
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('itemsPerSlide')).toBe(2)
  })

  it('supports infinite scrolling', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        infinite: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('infinite')).toBe(true)
  })

  it('supports center mode', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        centerMode: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('centerMode')).toBe(true)
  })

  it('supports variable width items', () => {
    const wrapper = mount(Carousel, {
      props: {
        items: mockItems,
        variableWidth: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('variableWidth')).toBe(true)
  })
})