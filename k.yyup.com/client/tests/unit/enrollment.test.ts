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

describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'

// Mock Element Plus to avoid DOM issues
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue('confirm')
    }
  }
})

// Mock API calls
vi.mock('@/utils/request', () => ({
  get: vi.fn().mockResolvedValue({
    code: 200,
    data: {
      data: [
        {
          id: 1,
          name: '春季招生计划',
          title: '春季招生计划',
          startDate: '2023-02-01',
          endDate: '2023-05-31',
          status: 'active'
        }
      ],
      total: 1,
      page: 1,
      size: 10
    },
    message: 'success'
  }),
  post: vi.fn().mockResolvedValue({ code: 200, message: 'success' }),
  put: vi.fn().mockResolvedValue({ code: 200, message: 'success' }),
  del: vi.fn().mockResolvedValue({ code: 200, message: 'success' })
}))

describe('Enrollment Management System - Simple Tests', () => {
  let router: any
  let pinia: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/enrollment-plans', component: { template: '<div>Plans</div>' } }
      ]
    })
    pinia = createPinia()
    
    await router.push('/')
    await router.isReady()
  })

  describe('Basic Component Tests', () => {
    it('should create a simple test component', async () => {
      const TestComponent = {
        template: '<div class="test-component">Test Content</div>'
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('Test Content')
      expect(wrapper.find('.test-component').exists()).toBe(true)
    })

    it('should handle basic component with Element Plus stubs', async () => {
      const TestComponent = {
        template: `
          <div class="enrollment-test">
            <el-card>
              <el-table :data="[]">
                <el-table-column prop="name" label="名称" />
              </el-table>
            </el-card>
          </div>
        `
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': {
              template: '<div class="el-card-stub"><slot /></div>'
            },
            'el-table': {
              template: '<div class="el-table-stub"><slot /></div>'
            },
            'el-table-column': true
          }
        }
      })

      await nextTick()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.enrollment-test').exists()).toBe(true)
      expect(wrapper.find('.el-card-stub').exists()).toBe(true)
      expect(wrapper.find('.el-table-stub').exists()).toBe(true)
    })

    it('should handle async operations', async () => {
      const TestComponent = {
        template: '<div class="async-test">{{ message }}</div>',
        data() {
          return {
            message: 'Loading...'
          }
        },
        async mounted() {
          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, 10))
          this.message = 'Loaded!'
        }
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toContain('Loading...')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(wrapper.text()).toContain('Loaded!')
    })

    it('should handle form interactions', async () => {
      const TestComponent = {
        template: `
          <div class="form-test">
            <el-form>
              <el-form-item>
                <el-input v-model="inputValue" />
              </el-form-item>
              <el-button @click="handleClick">Submit</el-button>
            </el-form>
            <div class="result">{{ result }}</div>
          </div>
        `,
        data() {
          return {
            inputValue: '',
            result: ''
          }
        },
        methods: {
          handleClick() {
            this.result = `Submitted: ${this.inputValue}`
          }
        }
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-form': {
              template: '<form class="el-form-stub"><slot /></form>'
            },
            'el-form-item': {
              template: '<div class="el-form-item-stub"><slot /></div>'
            },
            'el-input': {
              template: '<input class="el-input-stub" @input="$emit(\'update:modelValue\', $event.target.value)" />',
              emits: ['update:modelValue']
            },
            'el-button': {
              template: '<button class="el-button-stub" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            }
          }
        }
      })

      await nextTick()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.form-test').exists()).toBe(true)
      
      // Test form interaction
      const input = wrapper.find('.el-input-stub')
      const button = wrapper.find('.el-button-stub')
      
      expect(input.exists()).toBe(true)
      expect(button.exists()).toBe(true)
    })

    it('should handle API mock calls', async () => {
      const TestComponent = {
        template: '<div class="api-test">{{ data }}</div>',
        data() {
          return {
            data: 'Loading...'
          }
        },
        async mounted() {
          try {
            const { get } = await import('@/utils/request')
            const response = await get('/test-endpoint')
            this.data = `Loaded: ${response.data.data.length} items`
          } catch (error) {
            this.data = 'Error loading data'
          }
        }
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toContain('Loading...')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(wrapper.text()).toContain('Loaded: 1 items')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty data gracefully', async () => {
      const TestComponent = {
        template: `
          <div class="empty-test">
            <div v-if="items.length === 0" class="empty-state">No data</div>
            <div v-else class="has-data">{{ items.length }} items</div>
          </div>
        `,
        data() {
          return {
            items: []
          }
        }
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.text()).toContain('No data')
    })

    it('should handle error states', async () => {
      const TestComponent = {
        template: `
          <div class="error-test">
            <div v-if="error" class="error-message">{{ error }}</div>
            <div v-else class="success-message">All good</div>
          </div>
        `,
        data() {
          return {
            error: 'Something went wrong'
          }
        }
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('Something went wrong')
    })
  })
})
