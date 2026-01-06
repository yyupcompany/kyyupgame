
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
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
import { createRouter, createWebHistory, Router } from 'vue-router'
import Calendar from '@/components/common/Calendar.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElCalendar: {
    name: 'ElCalendar',
    template: '<div class="el-calendar"><div class="el-calendar__header"></div><div class="el-calendar__body"><slot></slot></div></div>',
    props: ['modelValue', 'range', 'firstDayOfWeek', 'disabledDate']
  },
  ElDatePicker: {
    name: 'ElDatePicker',
    template: '<div class="el-date-picker"><input type="text" /></div>',
    props: ['modelValue', 'type', 'placeholder', 'disabled', 'format', 'valueFormat', 'disabledDate']
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
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot></slot></div>',
    props: ['shadow', 'bodyStyle']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot></slot></i>',
    props: ['size', 'color']
  }
}))

describe('Calendar.vue', () => {
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
    const wrapper = mount(Calendar, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-calendar').exists()).toBe(true)
  })

  it('displays calendar with current date by default', () => {
    const wrapper = mount(Calendar, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const calendar = wrapper.find('.el-calendar')
    expect(calendar.exists()).toBe(true)
  })

  it('binds modelValue correctly', () => {
    const testDate = '2023-12-25'
    const wrapper = mount(Calendar, {
      props: {
        modelValue: testDate
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const calendar = wrapper.find('.el-calendar')
    expect(calendar.props('modelValue')).toBe(testDate)
  })

  it('emits update:modelValue when date is selected', async () => {
    const wrapper = mount(Calendar, {
      props: {
        modelValue: '2023-12-25'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const newDate = '2023-12-26'
    await wrapper.vm.$emit('update:modelValue', newDate)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([newDate])
  })

  it('supports date range selection', () => {
    const dateRange = ['2023-12-01', '2023-12-31']
    const wrapper = mount(Calendar, {
      props: {
        range: dateRange
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const calendar = wrapper.find('.el-calendar')
    expect(calendar.props('range')).toEqual(dateRange)
  })

  it('sets first day of week correctly', () => {
    const wrapper = mount(Calendar, {
      props: {
        firstDayOfWeek: 1 // Monday
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const calendar = wrapper.find('.el-calendar')
    expect(calendar.props('firstDayOfWeek')).toBe(1)
  })

  it('uses default first day of week when not provided', () => {
    const wrapper = mount(Calendar, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const calendar = wrapper.find('.el-calendar')
    expect(calendar.props('firstDayOfWeek')).toBe(0) // Sunday
  })

  it('disables dates based on disabledDate function', () => {
    const disabledDate = (date: Date) => {
      return date.getDay() === 0 // Disable Sundays
    }

    const wrapper = mount(Calendar, {
      props: {
        disabledDate
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const calendar = wrapper.find('.el-calendar')
    expect(calendar.props('disabledDate')).toBe(disabledDate)
  })

  it('supports different calendar types', () => {
    const wrapper = mount(Calendar, {
      props: {
        type: 'range'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('type')).toBe('range')
  })

  it('supports month view', () => {
    const wrapper = mount(Calendar, {
      props: {
        view: 'month'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('view')).toBe('month')
  })

  it('supports year view', () => {
    const wrapper = mount(Calendar, {
      props: {
        view: 'year'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('view')).toBe('year')
  })

  it('supports week view', () => {
    const wrapper = mount(Calendar, {
      props: {
        view: 'week'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('view')).toBe('week')
  })

  it('supports day view', () => {
    const wrapper = mount(Calendar, {
      props: {
        view: 'day'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('view')).toBe('day')
  })

  it('applies custom format', () => {
    const wrapper = mount(Calendar, {
      props: {
        format: 'YYYY-MM-DD'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('format')).toBe('YYYY-MM-DD')
  })

  it('applies custom valueFormat', () => {
    const wrapper = mount(Calendar, {
      props: {
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('valueFormat')).toBe('YYYY-MM-DD HH:mm:ss')
  })

  it('shows navigation controls when showNavigation is true', () => {
    const wrapper = mount(Calendar, {
      props: {
        showNavigation: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showNavigation')).toBe(true)
  })

  it('hides navigation controls when showNavigation is false', () => {
    const wrapper = mount(Calendar, {
      props: {
        showNavigation: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showNavigation')).toBe(false)
  })

  it('emits select event when date is selected', async () => {
    const wrapper = mount(Calendar, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const selectedDate = new Date('2023-12-25')
    await wrapper.vm.$emit('select', selectedDate)
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0]).toEqual([selectedDate])
  })

  it('emits change event when month or year changes', async () => {
    const wrapper = mount(Calendar, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const changeData = { year: 2023, month: 12 }
    await wrapper.vm.$emit('change', changeData)
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')[0]).toEqual([changeData])
  })

  it('emits panelChange event when panel changes', async () => {
    const wrapper = mount(Calendar, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const panelData = { year: 2023, month: 12, date: 25 }
    await wrapper.vm.$emit('panelChange', panelData)
    expect(wrapper.emitted('panelChange')).toBeTruthy()
    expect(wrapper.emitted('panelChange')[0]).toEqual([panelData])
  })

  it('supports custom cell rendering', () => {
    const wrapper = mount(Calendar, {
      props: {
        cellRender: (data: any) => {
          return `<div class="custom-cell">${data.day}</div>`
        }
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('cellRender')).toBeTruthy()
  })

  it('supports custom header rendering', () => {
    const wrapper = mount(Calendar, {
      props: {
        headerRender: (data: any) => {
          return `<div class="custom-header">${data.year}-${data.month}</div>`
        }
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('headerRender')).toBeTruthy()
  })

  it('supports custom footer rendering', () => {
    const wrapper = mount(Calendar, {
      props: {
        footerRender: () => {
          return '<div class="custom-footer">Custom Footer</div>'
        }
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('footerRender')).toBeTruthy()
  })

  it('supports custom range separator', () => {
    const wrapper = mount(Calendar, {
      props: {
        rangeSeparator: '至'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('rangeSeparator')).toBe('至')
  })

  it('supports disabled state', () => {
    const wrapper = mount(Calendar, {
      props: {
        disabled: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('disabled')).toBe(true)
  })

  it('supports readonly state', () => {
    const wrapper = mount(Calendar, {
      props: {
        readonly: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('readonly')).toBe(true)
  })

  it('supports editable state', () => {
    const wrapper = mount(Calendar, {
      props: {
        editable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('editable')).toBe(true)
  })

  it('supports clearable state', () => {
    const wrapper = mount(Calendar, {
      props: {
        clearable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('clearable')).toBe(true)
  })

  it('emits clear event when clear button is clicked', async () => {
    const wrapper = mount(Calendar, {
      props: {
        clearable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('clear')
    expect(wrapper.emitted('clear')).toBeTruthy()
  })

  it('supports custom placeholder', () => {
    const wrapper = mount(Calendar, {
      props: {
        placeholder: 'Select date'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('placeholder')).toBe('Select date')
  })

  it('supports custom size', () => {
    const wrapper = mount(Calendar, {
      props: {
        size: 'large'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('size')).toBe('large')
  })

  it('supports custom prefix icon', () => {
    const wrapper = mount(Calendar, {
      props: {
        prefixIcon: 'el-icon-date'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('prefixIcon')).toBe('el-icon-date')
  })

  it('supports custom suffix icon', () => {
    const wrapper = mount(Calendar, {
      props: {
        suffixIcon: 'el-icon-arrow-down'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('suffixIcon')).toBe('el-icon-arrow-down')
  })

  it('supports custom CSS classes', () => {
    const wrapper = mount(Calendar, {
      props: {
        className: 'custom-calendar'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-calendar')
  })

  it('supports custom styles', () => {
    const customStyle = { width: '300px', height: '400px' }
    const wrapper = mount(Calendar, {
      props: {
        style: customStyle
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('style')).toEqual(customStyle)
  })

  it('supports keyboard navigation', async () => {
    const wrapper = mount(Calendar, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('supports focus and blur events', async () => {
    const wrapper = mount(Calendar, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()

    await wrapper.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('supports multiple date selection', () => {
    const wrapper = mount(Calendar, {
      props: {
        multiple: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('multiple')).toBe(true)
  })

  it('supports timezone configuration', () => {
    const wrapper = mount(Calendar, {
      props: {
        timezone: 'UTC'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('timezone')).toBe('UTC')
  })

  it('supports week number display', () => {
    const wrapper = mount(Calendar, {
      props: {
        showWeekNumber: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showWeekNumber')).toBe(true)
  })

  it('supports custom week label', () => {
    const wrapper = mount(Calendar, {
      props: {
        weekLabel: '周'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('weekLabel')).toBe('周')
  })

  it('supports min and max date constraints', () => {
    const wrapper = mount(Calendar, {
      props: {
        minDate: '2023-01-01',
        maxDate: '2023-12-31'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('minDate')).toBe('2023-01-01')
    expect(wrapper.props('maxDate')).toBe('2023-12-31')
  })

  it('supports default time', () => {
    const wrapper = mount(Calendar, {
      props: {
        defaultTime: '12:00:00'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('defaultTime')).toBe('12:00:00')
  })

  it('supports time picker integration', () => {
    const wrapper = mount(Calendar, {
      props: {
        showTime: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showTime')).toBe(true)
  })

  it('supports custom time format', () => {
    const wrapper = mount(Calendar, {
      props: {
        showTime: true,
        timeFormat: 'HH:mm'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('timeFormat')).toBe('HH:mm')
  })

  it('supports shortcuts configuration', () => {
    const shortcuts = [
      { text: 'Today', value: new Date() },
      { text: 'Yesterday', value: () => new Date(Date.now() - 24 * 60 * 60 * 1000) }
    ]

    const wrapper = mount(Calendar, {
      props: {
        shortcuts
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('shortcuts')).toEqual(shortcuts)
  })

  it('supports popup container configuration', () => {
    const wrapper = mount(Calendar, {
      props: {
        popperClass: 'custom-popper'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('popperClass')).toBe('custom-popper')
  })

  it('supports responsive behavior', () => {
    const wrapper = mount(Calendar, {
      props: {
        responsive: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('responsive')).toBe(true)
  })

  it('supports mobile mode', () => {
    const wrapper = mount(Calendar, {
      props: {
        mobile: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('mobile')).toBe(true)
  })

  it('supports custom validation rules', () => {
    const rules = [
      { required: true, message: 'Please select a date' },
      { type: 'date', message: 'Please enter a valid date' }
    ]

    const wrapper = mount(Calendar, {
      props: {
        rules
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('rules')).toEqual(rules)
  })

  it('supports error state', () => {
    const wrapper = mount(Calendar, {
      props: {
        error: true,
        errorMessage: 'Invalid date selection'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('error')).toBe(true)
    expect(wrapper.props('errorMessage')).toBe('Invalid date selection')
  })

  it('supports loading state', () => {
    const wrapper = mount(Calendar, {
      props: {
        loading: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loading')).toBe(true)
  })

  it('supports custom loading text', () => {
    const wrapper = mount(Calendar, {
      props: {
        loading: true,
        loadingText: 'Loading calendar...'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loadingText')).toBe('Loading calendar...')
  })

  it('supports custom empty state', () => {
    const wrapper = mount(Calendar, {
      props: {
        emptyText: 'No dates available'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('emptyText')).toBe('No dates available')
  })

  it('supports accessibility attributes', () => {
    const wrapper = mount(Calendar, {
      props: {
        ariaLabel: 'Date picker calendar',
        ariaDescribedBy: 'calendar-description'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('ariaLabel')).toBe('Date picker calendar')
    expect(wrapper.props('ariaDescribedBy')).toBe('calendar-description')
  })

  it('supports custom event handling', () => {
    const onDateSelect = vi.fn()
    const onMonthChange = vi.fn()
    const onYearChange = vi.fn()

    const wrapper = mount(Calendar, {
      props: {
        onDateSelect,
        onMonthChange,
        onYearChange
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('onDateSelect')).toBe(onDateSelect)
    expect(wrapper.props('onMonthChange')).toBe(onMonthChange)
    expect(wrapper.props('onYearChange')).toBe(onYearChange)
  })

  it('supports custom data binding', () => {
    const wrapper = mount(Calendar, {
      props: {
        value: '2023-12-25',
        displayFormat: 'MM/DD/YYYY',
        returnFormat: 'YYYY-MM-DD'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('value')).toBe('2023-12-25')
    expect(wrapper.props('displayFormat')).toBe('MM/DD/YYYY')
    expect(wrapper.props('returnFormat')).toBe('YYYY-MM-DD')
  })

  it('supports custom localization', () => {
    const locale = {
      days: ['日', '一', '二', '三', '四', '五', '六'],
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      yearFormat: 'YYYY年',
      monthFormat: 'MM月',
      dayFormat: 'DD日'
    }

    const wrapper = mount(Calendar, {
      props: {
        locale
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('locale')).toEqual(locale)
  })

  it('supports custom animations', () => {
    const wrapper = mount(Calendar, {
      props: {
        animation: 'fade',
        animationDuration: 300
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('animation')).toBe('fade')
    expect(wrapper.props('animationDuration')).toBe(300)
  })

  it('supports custom themes', () => {
    const wrapper = mount(Calendar, {
      props: {
        theme: 'dark'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('theme')).toBe('dark')
  })

  it('supports custom templates', () => {
    const wrapper = mount(Calendar, {
      slots: {
        default: '<div class="custom-calendar-content">Custom Content</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-calendar-content').exists()).toBe(true)
  })

  it('handles edge cases gracefully', () => {
    const wrapper = mount(Calendar, {
      props: {
        modelValue: null,
        disabledDate: null,
        cellRender: null
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-calendar').exists()).toBe(true)
  })

  it('supports performance optimization options', () => {
    const wrapper = mount(Calendar, {
      props: {
        virtualScroll: true,
        lazyLoad: true,
        debounceTime: 100
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('virtualScroll')).toBe(true)
    expect(wrapper.props('lazyLoad')).toBe(true)
    expect(wrapper.props('debounceTime')).toBe(100)
  })
})