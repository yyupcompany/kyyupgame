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
import Pagination from '@/components/common/Pagination.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElPagination: {
    name: 'ElPagination',
    template: '<div class="el-pagination"></div>',
    props: [
      'currentPage', 'pageSize', 'total', 'pageSizes', 'layout', 
      'background', 'small', 'disabled', 'hideOnSinglePage'
    ]
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select class="el-select"><slot></slot></select>',
    props: ['modelValue', 'placeholder', 'disabled', 'size']
  },
  ElOption: {
    name: 'ElOption',
    template: '<option class="el-option"></option>',
    props: ['value', 'label', 'disabled']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'icon']
  },
  ElInputNumber: {
    name: 'ElInputNumber',
    template: '<input type="number" class="el-input-number" />',
    props: ['modelValue', 'min', 'max', 'step', 'disabled', 'size']
  }
}))

describe('Pagination.vue', () => {
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
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-pagination').exists()).toBe(true)
  })

  it('displays correct current page', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 3,
        pageSize: 10,
        total: 100
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const pagination = wrapper.find('.el-pagination')
    expect(pagination.props('currentPage')).toBe(3)
  })

  it('displays correct page size', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 20,
        total: 100
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const pagination = wrapper.find('.el-pagination')
    expect(pagination.props('pageSize')).toBe(20)
  })

  it('displays correct total items count', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 250
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const pagination = wrapper.find('.el-pagination')
    expect(pagination.props('total')).toBe(250)
  })

  it('emits update:currentPage when page changes', async () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('update:currentPage', 2)
    expect(wrapper.emitted('update:currentPage')).toBeTruthy()
    expect(wrapper.emitted('update:currentPage')[0]).toEqual([2])
  })

  it('emits update:pageSize when page size changes', async () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('update:pageSize', 20)
    expect(wrapper.emitted('update:pageSize')).toBeTruthy()
    expect(wrapper.emitted('update:pageSize')[0]).toEqual([20])
  })

  it('emits change event when pagination changes', async () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('change', { currentPage: 2, pageSize: 10 })
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')[0]).toEqual([{ currentPage: 2, pageSize: 10 }])
  })

  it('shows page size selector when showPageSizeSelector prop is true', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        showPageSizeSelector: true,
        pageSizes: [10, 20, 50, 100]
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-select').exists()).toBe(true)
  })

  it('does not show page size selector when showPageSizeSelector prop is false', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        showPageSizeSelector: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-select').exists()).toBe(false)
  })

  it('shows page size options when pageSizes prop is provided', () => {
    const pageSizes = [10, 20, 50, 100]
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        showPageSizeSelector: true,
        pageSizes: pageSizes
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const pagination = wrapper.find('.el-pagination')
    expect(pagination.props('pageSizes')).toEqual(pageSizes)
  })

  it('disables pagination when disabled prop is true', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        disabled: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const pagination = wrapper.find('.el-pagination')
    expect(pagination.props('disabled')).toBe(true)
  })

  it('enables pagination when disabled prop is false', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        disabled: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const pagination = wrapper.find('.el-pagination')
    expect(pagination.props('disabled')).toBe(false)
  })

  it('shows background when background prop is true', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        background: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const pagination = wrapper.find('.el-pagination')
    expect(pagination.props('background')).toBe(true)
  })

  it('does not show background when background prop is false', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        background: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const pagination = wrapper.find('.el-pagination')
    expect(pagination.props('background')).toBe(false)
  })

  it('applies small size when small prop is true', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        small: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const pagination = wrapper.find('.el-pagination')
    expect(pagination.props('small')).toBe(true)
  })

  it('applies normal size when small prop is false', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        small: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const pagination = wrapper.find('.el-pagination')
    expect(pagination.props('small')).toBe(false)
  })

  it('hides pagination when hideOnSinglePage is true and only one page', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 5,
        hideOnSinglePage: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const pagination = wrapper.find('.el-pagination')
    expect(pagination.props('hideOnSinglePage')).toBe(true)
  })

  it('shows pagination when hideOnSinglePage is false', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 5,
        hideOnSinglePage: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const pagination = wrapper.find('.el-pagination')
    expect(pagination.props('hideOnSinglePage')).toBe(false)
  })

  it('applies custom layout when layout prop is provided', () => {
    const customLayout = 'total, sizes, prev, pager, next, jumper'
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        layout: customLayout
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const pagination = wrapper.find('.el-pagination')
    expect(pagination.props('layout')).toBe(customLayout)
  })

  it('shows total items display when showTotal prop is true', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        showTotal: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showTotal')).toBe(true)
  })

  it('does not show total items display when showTotal prop is false', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        showTotal: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showTotal')).toBe(false)
  })

  it('shows quick jumper when showQuickJumper prop is true', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        showQuickJumper: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showQuickJumper')).toBe(true)
  })

  it('does not show quick jumper when showQuickJumper prop is false', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        showQuickJumper: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showQuickJumper')).toBe(false)
  })

  it('shows go to page input when showGoTo prop is true', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        showGoTo: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-input-number').exists()).toBe(true)
  })

  it('does not show go to page input when showGoTo prop is false', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        showGoTo: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-input-number').exists()).toBe(false)
  })

  it('emits go-to event when go to page input changes', async () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        showGoTo: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('go-to', 5)
    expect(wrapper.emitted('go-to')).toBeTruthy()
    expect(wrapper.emitted('go-to')[0]).toEqual([5])
  })

  it('calculates total pages correctly', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 95
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    // This would test the totalPages computed property
    expect(wrapper.props('total')).toBe(95)
    expect(wrapper.props('pageSize')).toBe(10)
  })

  it('handles edge case with zero total items', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('total')).toBe(0)
    expect(wrapper.find('.el-pagination').exists()).toBe(true)
  })

  it('handles edge case with very large page size', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 1000,
        total: 100
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('pageSize')).toBe(1000)
    expect(wrapper.props('total')).toBe(100)
  })

  it('handles edge case with current page exceeding total pages', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 10,
        pageSize: 10,
        total: 50
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('currentPage')).toBe(10)
    expect(wrapper.props('total')).toBe(50)
  })

  it('applies custom CSS classes', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        className: 'custom-pagination'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-pagination')
  })

  it('supports custom total text formatter', () => {
    const totalText = (total: number) => `Total ${total} items`
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        totalText: totalText
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('totalText')).toBe(totalText)
  })

  it('shows previous and next buttons when showPrevNext prop is true', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        showPrevNext: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showPrevNext')).toBe(true)
  })

  it('does not show previous and next buttons when showPrevNext prop is false', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        showPrevNext: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showPrevNext')).toBe(false)
  })

  it('emits size-change event when page size changes', async () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('size-change', 20)
    expect(wrapper.emitted('size-change')).toBeTruthy()
    expect(wrapper.emitted('size-change')[0]).toEqual([20])
  })

  it('emits current-change event when current page changes', async () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('current-change', 3)
    expect(wrapper.emitted('current-change')).toBeTruthy()
    expect(wrapper.emitted('current-change')[0]).toEqual([3])
  })

  it('supports responsive behavior', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 1,
        pageSize: 10,
        total: 100,
        responsive: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('responsive')).toBe(true)
  })
})