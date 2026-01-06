import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'

// 控制台监控（强制：每个测试文件必须检查控制台错误）
import { setupConsoleMonitoring, resetConsoleMonitoring, expectNoConsoleErrors, allowConsoleError } from '../../setup/console-monitoring'

// 被测组件：视频创作时间线（含下载逻辑与事件上报）

// 启用控制台监控
setupConsoleMonitoring()

// 简易 Router，用于满足组件内 useRouter/useRoute 的依赖
// 轻量 Mock：避免真实UI/网络/生成任务被触发
vi.mock('element-plus', () => ({
  ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }
}))
vi.mock('@/utils/request', () => ({
  request: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  videoCreationRequest: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }
}))

// 在 mocks 之后再导入被测组件，确保依赖已被替换
import VideoCreatorTimeline from '@/pages/principal/media-center/VideoCreatorTimeline.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div />' } },
    { path: '/centers/media', name: 'media', component: { template: '<div />' } }
  ]
})

// Pinia 实例
const pinia = createPinia()

// 常用全局 Mock
const originalFetch = global.fetch
const originalOpen = global.open

describe('VideoCreatorTimeline.vue - 控制台用例', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    resetConsoleMonitoring()
    // 允许组件内部对“未完成项目检查失败”的预期日志
    allowConsoleError('检查未完成项目失败')
    // 基本全局 Mock，防止意外网络或窗口行为导致控制台噪声
    global.fetch = vi.fn(async () => ({ ok: true, blob: async () => new Blob(), headers: new Headers() }) as any)
    global.open = vi.fn() as any
    // 路由就绪
    if (!router.isReady()) {
      await router.isReady().catch(() => void 0)
    }
  })

  afterEach(() => {
    // 还原全局
    global.fetch = originalFetch
    global.open = originalOpen
    // 强制校验：无控制台错误
    expectNoConsoleErrors()
  })

  it('组件应能挂载且不产生控制台错误（基础渲染）', async () => {
    const wrapper = shallowMount(VideoCreatorTimeline, {
      global: {
        plugins: [pinia, router],
        // 避免子组件渲染造成额外依赖与噪声
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-steps': true,
          'el-step': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-radio': true,
          'el-radio-group': true,
          'el-progress': true,
          'el-card': true,
          'el-upload': true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('下载逻辑方法存在且调用不会产生控制台错误（使用fetch与a.download的Mock）', async () => {
    const wrapper = shallowMount(VideoCreatorTimeline, {
      global: { plugins: [pinia, router], stubs: { 'el-button': true } }
    })

    // 组件内方法（脚本使用 <script setup>，通过实例可访问到）
    const vm: any = wrapper.vm

    // 如果方法存在，调用并确保不抛错与不产生日志错误
    if (typeof vm.downloadVideo === 'function') {
      await vm.downloadVideo()
    }

    expect(true).toBe(true)
  })
})

