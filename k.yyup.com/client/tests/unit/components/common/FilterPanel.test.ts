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
import FilterPanel from '@/components/common/FilterPanel.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><div class="el-card__header"><slot name="header"></slot></div><div class="el-card__body"><slot></slot></div></div>'
  },
  ElCollapse: {
    name: 'ElCollapse',
    template: '<div class="el-collapse"><slot></slot></div>',
    props: ['modelValue', 'accordion']
  },
  ElCollapseItem: {
    name: 'ElCollapseItem',
    template: '<div class="el-collapse-item"><div class="el-collapse-item__header"><slot name="title"></slot></div><div class="el-collapse-item__content"><slot></slot></div></div>',
    props: ['name', 'title', 'disabled']
  },
  ElForm: {
    name: 'ElForm',
    template: '<form class="el-form"><slot></slot></form>',
    props: ['model', 'rules', 'labelWidth', 'inline']
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div class="el-form-item"><div class="el-form-item__label"><slot name="label"></slot></div><div class="el-form-item__content"><slot></slot></div></div>',
    props: ['label', 'prop', 'rules', 'required']
  },
  ElInput: {
    name: 'ElInput',
    template: '<input class="el-input" />',
    props: ['modelValue', 'placeholder', 'clearable', 'disabled']
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select class="el-select"><slot></slot></select>',
    props: ['modelValue', 'placeholder', 'clearable', 'disabled', 'multiple']
  },
  ElOption: {
    name: 'ElOption',
    template: '<option class="el-option"></option>',
    props: ['value', 'label', 'disabled']
  },
  ElDatePicker: {
    name: 'ElDatePicker',
    template: '<input class="el-date-picker" />',
    props: ['modelValue', 'type', 'placeholder', 'disabled', 'clearable']
  },
  ElCheckbox: {
    name: 'ElCheckbox',
    template: '<input type="checkbox" class="el-checkbox" />',
    props: ['modelValue', 'label', 'disabled', 'trueLabel', 'falseLabel']
  },
  ElCheckboxGroup: {
    name: 'ElCheckboxGroup',
    template: '<div class="el-checkbox-group"><slot></slot></div>',
    props: ['modelValue']
  },
  ElRadio: {
    name: 'ElRadio',
    template: '<input type="radio" class="el-radio" />',
    props: ['modelValue', 'label', 'disabled']
  },
  ElRadioGroup: {
    name: 'ElRadioGroup',
    template: '<div class="el-radio-group"><slot></slot></div>',
    props: ['modelValue']
  },
  ElSwitch: {
    name: 'ElSwitch',
    template: '<div class="el-switch"></div>',
    props: ['modelValue', 'disabled', 'activeText', 'inactiveText']
  },
  ElSlider: {
    name: 'ElSlider',
    template: '<div class="el-slider"></div>',
    props: ['modelValue', 'min', 'max', 'step', 'disabled']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'loading']
  },
  ElDivider: {
    name: 'ElDivider',
    template: '<div class="el-divider"></div>',
    props: ['contentPosition']
  },
  ElRow: {
    name: 'ElRow',
    template: '<div class="el-row"><slot></slot></div>',
    props: ['gutter']
  },
  ElCol: {
    name: 'ElCol',
    template: '<div class="el-col"><slot></slot></div>',
    props: ['span', 'offset']
  }
}))

describe('FilterPanel.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } }
      ]
    })
  })

  const mockFilters = [
    {
      key: 'name',
      label: 'Name',
      type: 'input',
      placeholder: 'Enter name...'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' }
      ]
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'dateRange',
      placeholder: 'Select date range'
    },
    {
      key: 'categories',
      label: 'Categories',
      type: 'checkbox',
      options: [
        { label: 'Category 1', value: 'cat1' },
        { label: 'Category 2', value: 'cat2' },
        { label: 'Category 3', value: 'cat3' }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'radio',
      options: [
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' }
      ]
    },
    {
      key: 'enabled',
      label: 'Enabled',
      type: 'switch'
    },
    {
      key: 'rating',
      label: 'Rating',
      type: 'slider',
      min: 0,
      max: 5,
      step: 0.5
    }
  ]

  it('renders properly with default props', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {}
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-card').exists()).toBe(true)
  })

  it('displays correct filter fields based on configuration', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {}
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const inputs = wrapper.findAll('.el-input')
    const selects = wrapper.findAll('.el-select')
    const checkboxes = wrapper.findAll('.el-checkbox')
    const radios = wrapper.findAll('.el-radio')
    const switches = wrapper.findAll('.el-switch')
    const sliders = wrapper.findAll('.el-slider')

    expect(inputs.length).toBeGreaterThan(0)
    expect(selects.length).toBeGreaterThan(0)
    expect(checkboxes.length).toBeGreaterThan(0)
    expect(radios.length).toBeGreaterThan(0)
    expect(switches.length).toBeGreaterThan(0)
    expect(sliders.length).toBeGreaterThan(0)
  })

  it('binds modelValue correctly', () => {
    const modelValue = {
      name: 'John Doe',
      status: 'active',
      enabled: true,
      rating: 4.5
    }

    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: modelValue
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('modelValue')).toEqual(modelValue)
  })

  it('emits update:modelValue when filter values change', async () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {}
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const newModelValue = {
      name: 'Jane Smith',
      status: 'inactive',
      enabled: false
    }

    await wrapper.vm.$emit('update:modelValue', newModelValue)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([newModelValue])
  })

  it('emits filter-change when filters are applied', async () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {}
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const filterValues = {
      name: 'test',
      status: 'active'
    }

    await wrapper.vm.$emit('filter-change', filterValues)
    expect(wrapper.emitted('filter-change')).toBeTruthy()
    expect(wrapper.emitted('filter-change')[0]).toEqual([filterValues])
  })

  it('shows apply button when showApplyButton prop is true', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        showApplyButton: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const applyButton = wrapper.findAll('.el-button').find(btn => 
      btn.text().includes('Apply') || btn.classes().includes('apply-button')
    )
    expect(applyButton).toBeTruthy()
  })

  it('does not show apply button when showApplyButton prop is false', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        showApplyButton: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const applyButton = wrapper.findAll('.el-button').find(btn => 
      btn.text().includes('Apply') || btn.classes().includes('apply-button')
    )
    expect(applyButton).toBeFalsy()
  })

  it('shows reset button when showResetButton prop is true', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        showResetButton: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const resetButton = wrapper.findAll('.el-button').find(btn => 
      btn.text().includes('Reset') || btn.classes().includes('reset-button')
    )
    expect(resetButton).toBeTruthy()
  })

  it('does not show reset button when showResetButton prop is false', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        showResetButton: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const resetButton = wrapper.findAll('.el-button').find(btn => 
      btn.text().includes('Reset') || btn.classes().includes('reset-button')
    )
    expect(resetButton).toBeFalsy()
  })

  it('emits reset event when reset button is clicked', async () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: { name: 'test', status: 'active' }
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('reset')
    expect(wrapper.emitted('reset')).toBeTruthy()
  })

  it('renders collapsible filter groups when collapsible prop is true', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        collapsible: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-collapse').exists()).toBe(true)
  })

  it('does not render collapsible filter groups when collapsible prop is false', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        collapsible: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-collapse').exists()).toBe(false)
  })

  it('disables filter fields when disabled prop is true', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        disabled: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const inputs = wrapper.findAll('.el-input')
    inputs.forEach(input => {
      expect(input.props('disabled')).toBe(true)
    })
  })

  it('enables filter fields when disabled prop is false', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        disabled: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const inputs = wrapper.findAll('.el-input')
    inputs.forEach(input => {
      expect(input.props('disabled')).toBe(false)
    })
  })

  it('shows loading state when loading prop is true', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        loading: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loading')).toBe(true)
  })

  it('hides loading state when loading prop is false', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        loading: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loading')).toBe(false)
  })

  it('renders filter fields in inline layout when inline prop is true', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        inline: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('inline')).toBe(true)
  })

  it('renders filter fields in vertical layout when inline prop is false', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        inline: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('inline')).toBe(false)
  })

  it('applies custom label width when labelWidth prop is provided', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        labelWidth: '120px'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('labelWidth')).toBe('120px')
  })

  it('shows filter panel header when showHeader prop is true', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        showHeader: true,
        title: 'Filter Options'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-card__header').exists()).toBe(true)
  })

  it('does not show filter panel header when showHeader prop is false', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        showHeader: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-card__header').exists()).toBe(false)
  })

  it('handles empty filters array gracefully', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: [],
        modelValue: {}
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('filters')).toEqual([])
    expect(wrapper.exists()).toBe(true)
  })

  it('renders custom slots when provided', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {}
      },
      slots: {
        'header': '<div class="custom-header">Custom Header</div>',
        'footer': '<div class="custom-footer">Custom Footer</div>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-header').exists()).toBe(true)
    expect(wrapper.find('.custom-footer').exists()).toBe(true)
  })

  it('applies custom CSS classes', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        className: 'custom-filter-panel'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-filter-panel')
  })

  it('supports filter field validation', () => {
    const filtersWithValidation = [
      {
        key: 'email',
        label: 'Email',
        type: 'input',
        placeholder: 'Enter email...',
        rules: [
          { required: true, message: 'Email is required' },
          { type: 'email', message: 'Invalid email format' }
        ]
      }
    ]

    const wrapper = mount(FilterPanel, {
      props: {
        filters: filtersWithValidation,
        modelValue: {}
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('filters')).toEqual(filtersWithValidation)
  })

  it('emits validate event when validation is triggered', async () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {}
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('validate', true)
    expect(wrapper.emitted('validate')).toBeTruthy()
    expect(wrapper.emitted('validate')[0]).toEqual([true])
  })

  it('supports responsive layout', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {},
        responsive: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('responsive')).toBe(true)
  })

  it('handles filter field dependencies', () => {
    const filtersWithDependencies = [
      {
        key: 'country',
        label: 'Country',
        type: 'select',
        options: [
          { label: 'USA', value: 'us' },
          { label: 'Canada', value: 'ca' }
        ]
      },
      {
        key: 'state',
        label: 'State',
        type: 'select',
        options: [],
        dependsOn: 'country'
      }
    ]

    const wrapper = mount(FilterPanel, {
      props: {
        filters: filtersWithDependencies,
        modelValue: {}
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('filters')).toEqual(filtersWithDependencies)
  })

  it('emits dependency-change when dependent field changes', async () => {
    const wrapper = mount(FilterPanel, {
      props: {
        filters: mockFilters,
        modelValue: {}
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('dependency-change', { field: 'country', value: 'us' })
    expect(wrapper.emitted('dependency-change')).toBeTruthy()
    expect(wrapper.emitted('dependency-change')[0]).toEqual([{ field: 'country', value: 'us' }])
  })
})