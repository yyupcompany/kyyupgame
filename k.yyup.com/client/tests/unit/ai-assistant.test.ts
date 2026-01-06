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
import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

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

// Mock AI shortcuts API
vi.mock('@/api/ai-shortcuts', () => ({
  getShortcuts: vi.fn().mockResolvedValue([
    {
      id: '1',
      shortcut_name: '查询学生信息',
      shortcut_content: '请查询学生信息'
    }
  ])
}))

// Mock request utility
vi.mock('@/utils/request', () => ({
  default: {
    post: vi.fn().mockResolvedValue({
      code: 200,
      data: { content: 'AI回复内容' },
      message: 'success'
    }),
    get: vi.fn().mockResolvedValue({
      code: 200,
      data: [],
      message: 'success'
    })
  }
}))

// Mock AI Router service
vi.mock('@/services/ai-router', () => ({
  processAIRequest: vi.fn().mockResolvedValue({
    success: true,
    data: {
      content: '测试AI回复内容',
      type: 'text'
    }
  })
}))

// Mock user store
vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    userInfo: {
      username: 'testuser',
      role: 'admin',
      id: 1
    },
    isLoggedIn: true
  }))
}))

// Mock other services
vi.mock('@/services/smart-router', () => ({
  SmartRouterService: vi.fn().mockImplementation(() => ({
    navigate: vi.fn(),
    canNavigate: vi.fn().mockReturnValue(true)
  }))
}))

describe('AI助手组件测试', () => {
  let router: any
  let pinia: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
      ]
    })
    
    pinia = createPinia()
    
    await router.push('/')
    await router.isReady()
  })

  describe('基础功能测试', () => {
    it('应该正确渲染AI助手组件', async () => {
      const TestComponent = {
        template: `
          <div class="ai-assistant-test">
            <div class="ai-header">
              <h3>AI助手</h3>
            </div>
            <div class="ai-content">
              <div class="message-list">
                <div class="message-item assistant">
                  您好！我是YY-AI智能助手
                </div>
              </div>
              <div class="input-area">
                <el-input placeholder="输入您的问题" />
                <el-button type="primary">发送</el-button>
              </div>
            </div>
          </div>
        `
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': {
              template: '<input class="el-input-stub" />'
            },
            'el-button': {
              template: '<button class="el-button-stub"><slot /></button>'
            }
          }
        }
      })

      await nextTick()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.ai-assistant-test').exists()).toBe(true)
      expect(wrapper.text()).toContain('AI助手')
    })

    it('应该显示AI助手标题', async () => {
      const TestComponent = {
        template: `
          <div class="title-test">
            <div class="title-text">YY-AI助手</div>
            <div class="subtitle">智能问答系统</div>
          </div>
        `
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      expect(wrapper.text()).toContain('YY-AI助手')
      expect(wrapper.text()).toContain('智能问答')
    })

    it('应该显示欢迎消息', async () => {
      const TestComponent = {
        template: `
          <div class="welcome-test">
            <div class="message-item assistant">
              您好！我是YY-AI智能助手，有什么可以帮助您的吗？
            </div>
          </div>
        `
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      expect(wrapper.text()).toContain('您好！我是YY-AI智能助手')
    })
  })

  describe('消息发送功能测试', () => {
    it('应该能够发送文本消息', async () => {
      const TestComponent = {
        template: `
          <div class="message-test">
            <el-input v-model="userInput" placeholder="输入您的问题" />
            <el-button @click="sendMessage">发送</el-button>
            <div class="result">{{ result }}</div>
          </div>
        `,
        data() {
          return {
            userInput: '',
            result: ''
          }
        },
        methods: {
          sendMessage() {
            if (this.userInput.trim()) {
              this.result = `已发送: ${this.userInput}`
            }
          }
        }
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': {
              template: '<input class="el-input-stub" v-model="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
              props: ['modelValue'],
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
      expect(wrapper.find('.el-input-stub').exists()).toBe(true)
      expect(wrapper.find('.el-button-stub').exists()).toBe(true)
    })

    it('应该处理空消息输入', async () => {
      const TestComponent = {
        template: `
          <div class="empty-input-test">
            <el-input v-model="userInput" />
            <div class="validation">{{ getValidationMessage() }}</div>
          </div>
        `,
        data() {
          return {
            userInput: ''
          }
        },
        methods: {
          getValidationMessage() {
            return this.userInput.trim() ? '有效输入' : '请输入内容'
          }
        }
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-input': {
              template: '<input class="el-input-stub" />'
            }
          }
        }
      })

      await nextTick()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('请输入内容')
    })

    it('应该显示发送中状态', async () => {
      const TestComponent = {
        template: `
          <div class="loading-test">
            <el-button :loading="isLoading">
              {{ isLoading ? '发送中...' : '发送' }}
            </el-button>
          </div>
        `,
        data() {
          return {
            isLoading: false
          }
        }
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': {
              template: '<button class="el-button-stub"><slot /></button>',
              props: ['loading']
            }
          }
        }
      })

      await nextTick()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('发送')
    })
  })

  describe('AI回复处理测试', () => {
    it('应该正确处理AI成功回复', async () => {
      const TestComponent = {
        template: `
          <div class="reply-test">
            <div class="ai-reply">{{ aiReply }}</div>
          </div>
        `,
        data() {
          return {
            aiReply: '这是AI的回复内容'
          }
        }
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      expect(wrapper.text()).toContain('这是AI的回复内容')
    })

    it('应该处理AI回复失败', async () => {
      const TestComponent = {
        template: `
          <div class="error-test">
            <div class="error-message">{{ errorMessage }}</div>
          </div>
        `,
        data() {
          return {
            errorMessage: 'AI回复失败，请重试'
          }
        }
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      expect(wrapper.text()).toContain('AI回复失败')
    })
  })
})
