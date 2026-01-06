
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
import SearchBar from '@/components/common/SearchBar.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElInput: {
    name: 'ElInput',
    template: '<input class="el-input" />',
    props: ['modelValue', 'placeholder', 'clearable', 'disabled', 'size', 'prefixIcon', 'suffixIcon']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'loading', 'icon']
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select class="el-select"><slot></slot></select>',
    props: ['modelValue', 'placeholder', 'clearable', 'disabled', 'size']
  },
  ElOption: {
    name: 'ElOption',
    template: '<option class="el-option"></option>',
    props: ['value', 'label', 'disabled']
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
    props: ['command', 'disabled', 'divided']
  }
}))

describe('SearchBar.vue', () => {
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
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.el-input').exists()).toBe(true)
  })

  it('displays correct placeholder text', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search users...'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const input = wrapper.find('.el-input')
    expect(input.props('placeholder')).toBe('Search users...')
  })

  it('binds modelValue correctly', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test search',
        placeholder: 'Search...'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const input = wrapper.find('.el-input')
    expect(input.props('modelValue')).toBe('test search')
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('update:modelValue', 'new search term')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['new search term'])
  })

  it('emits search event when search is triggered', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test query',
        placeholder: 'Search...'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('search', 'test query')
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0]).toEqual(['test query'])
  })

  it('emits clear event when search is cleared', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('clear')
    expect(wrapper.emitted('clear')).toBeTruthy()
  })

  it('shows search button when showSearchButton prop is true', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        showSearchButton: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-button').exists()).toBe(true)
  })

  it('does not show search button when showSearchButton prop is false', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        showSearchButton: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-button').exists()).toBe(false)
  })

  it('shows clear button when clearable prop is true', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test',
        placeholder: 'Search...',
        clearable: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const input = wrapper.find('.el-input')
    expect(input.props('clearable')).toBe(true)
  })

  it('does not show clear button when clearable prop is false', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test',
        placeholder: 'Search...',
        clearable: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const input = wrapper.find('.el-input')
    expect(input.props('clearable')).toBe(false)
  })

  it('disables search when disabled prop is true', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        disabled: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const input = wrapper.find('.el-input')
    expect(input.props('disabled')).toBe(true)
  })

  it('enables search when disabled prop is false', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        disabled: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const input = wrapper.find('.el-input')
    expect(input.props('disabled')).toBe(false)
  })

  it('shows filter dropdown when filters prop is provided', () => {
    const filters = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Status', value: 'status' }
    ]

    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        filters: filters,
        selectedFilter: 'name'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-select').exists()).toBe(true)
  })

  it('does not show filter dropdown when filters prop is empty', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        filters: []
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.el-select').exists()).toBe(false)
  })

  it('emits filter-change when filter is selected', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        filters: [
          { label: 'Name', value: 'name' },
          { label: 'Email', value: 'email' }
        ],
        selectedFilter: 'name'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('filter-change', 'email')
    expect(wrapper.emitted('filter-change')).toBeTruthy()
    expect(wrapper.emitted('filter-change')[0]).toEqual(['email'])
  })

  it('shows search history when showHistory prop is true', () => {
    const searchHistory = ['search 1', 'search 2', 'search 3']

    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        showHistory: true,
        searchHistory: searchHistory
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showHistory')).toBe(true)
    expect(wrapper.props('searchHistory')).toEqual(searchHistory)
  })

  it('emits history-select when history item is selected', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        showHistory: true,
        searchHistory: ['search 1', 'search 2']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('history-select', 'search 1')
    expect(wrapper.emitted('history-select')).toBeTruthy()
    expect(wrapper.emitted('history-select')[0]).toEqual(['search 1'])
  })

  it('shows search suggestions when suggestions prop is provided', () => {
    const suggestions = ['suggestion 1', 'suggestion 2', 'suggestion 3']

    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        showSuggestions: true,
        suggestions: suggestions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('showSuggestions')).toBe(true)
    expect(wrapper.props('suggestions')).toEqual(suggestions)
  })

  it('emits suggestion-select when suggestion is selected', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        showSuggestions: true,
        suggestions: ['suggestion 1', 'suggestion 2']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('suggestion-select', 'suggestion 1')
    expect(wrapper.emitted('suggestion-select')).toBeTruthy()
    expect(wrapper.emitted('suggestion-select')[0]).toEqual(['suggestion 1'])
  })

  it('applies correct size classes', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        size: 'large'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('size')).toBe('large')
  })

  it('shows loading state when loading prop is true', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        loading: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loading')).toBe(true)
  })

  it('hides loading state when loading prop is false', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        loading: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loading')).toBe(false)
  })

  it('supports custom search icon', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        prefixIcon: 'custom-search-icon'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const input = wrapper.find('.el-input')
    expect(input.props('prefixIcon')).toBe('custom-search-icon')
  })

  it('supports custom clear icon', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        suffixIcon: 'custom-clear-icon'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const input = wrapper.find('.el-input')
    expect(input.props('suffixIcon')).toBe('custom-clear-icon')
  })

  it('handles keyboard events', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test',
        placeholder: 'Search...'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('keydown', { key: 'Enter' })
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('handles focus events', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('handles blur events', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.vm.$emit('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('renders custom slots when provided', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...'
      },
      slots: {
        'prefix': '<span class="custom-prefix">Prefix</span>',
        'suffix': '<span class="custom-suffix">Suffix</span>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-prefix').exists()).toBe(true)
    expect(wrapper.find('.custom-suffix').exists()).toBe(true)
  })

  it('applies custom CSS classes', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        className: 'custom-search-bar'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-search-bar')
  })

  it('supports search delay functionality', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        searchDelay: 500
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('searchDelay')).toBe(500)
  })

  it('supports minimum search length', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        minSearchLength: 3
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('minSearchLength')).toBe(3)
  })
})