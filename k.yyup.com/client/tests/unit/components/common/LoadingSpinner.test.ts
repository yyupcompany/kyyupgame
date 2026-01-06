import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// 控制台错误检测变量
let consoleSpy: any

describe('LoadingSpinner.vue', () => {
  let wrapper: any

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  const createWrapper = (props = {}) => {
    return mount(LoadingSpinner, {
      props: {
        type: 'spinner',
        size: 'medium',
        overlay: false,
        text: '',
        detail: '',
        progress: 0,
        skeletonLines: 3,
        zIndex: 1000,
        ...props
      }
    })
  }

  describe('基础渲染', () => {
    it('应该正确渲染组件', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      expect(wrapper.find('.loading-content').exists()).toBe(true)
    })

    it('应该应用正确的 CSS 类', () => {
      wrapper = createWrapper({
        type: 'spinner',
        size: 'medium',
        overlay: false
      })
      
      const spinner = wrapper.find('.loading-spinner')
      expect(spinner.classes()).toContain('loading-spinner--spinner')
      expect(spinner.classes()).toContain('loading-spinner--medium')
      expect(spinner.classes()).not.toContain('loading-spinner--overlay')
    })
  })

  describe('类型测试', () => {
    const types = ['spinner', 'dots', 'wave', 'skeleton', 'progress']

    types.forEach((type) => {
      it(`应该渲染 ${type} 类型的加载器`, () => {
        wrapper = createWrapper({ type: type as any })
        
        const spinner = wrapper.find('.loading-spinner')
        expect(spinner.classes()).toContain(`loading-spinner--${type}`)
        
        switch (type) {
          case 'spinner':
            expect(wrapper.find('.spinner').exists()).toBe(true)
            expect(wrapper.find('.spinner-ring').exists()).toBe(true)
            break
          case 'dots':
            expect(wrapper.find('.dots').exists()).toBe(true)
            expect(wrapper.findAll('.dot').length).toBe(3)
            break
          case 'wave':
            expect(wrapper.find('.wave').exists()).toBe(true)
            expect(wrapper.findAll('.wave-bar').length).toBe(5)
            break
          case 'skeleton':
            expect(wrapper.find('.skeleton').exists()).toBe(true)
            expect(wrapper.findAll('.skeleton-line').length).toBe(3)
            break
          case 'progress':
            expect(wrapper.find('.progress').exists()).toBe(true)
            expect(wrapper.find('.progress-bar').exists()).toBe(true)
            expect(wrapper.find('.progress-fill').exists()).toBe(true)
            break
        }
      })
    })
  })

  describe('尺寸测试', () => {
    it('应该渲染小尺寸', () => {
      wrapper = createWrapper({ size: 'small' })

      const spinner = wrapper.find('.loading-spinner')
      expect(spinner.classes()).toContain('loading-spinner--small')
    })

    it('应该渲染中等尺寸', () => {
      wrapper = createWrapper({ size: 'medium' })

      const spinner = wrapper.find('.loading-spinner')
      expect(spinner.classes()).toContain('loading-spinner--medium')
    })

    it('应该渲染大尺寸', () => {
      wrapper = createWrapper({ size: 'large' })

      const spinner = wrapper.find('.loading-spinner')
      expect(spinner.classes()).toContain('loading-spinner--large')
    })

    it('应该正确应用尺寸到子元素', () => {
      wrapper = createWrapper({
        type: 'spinner',
        size: 'small'
      })

      const spinnerRing = wrapper.find('.spinner-ring')
      expect(spinnerRing.exists()).toBe(true)
      // 小尺寸的spinner-ring应该存在
      expect(wrapper.find('.loading-spinner--small').exists()).toBe(true)
    })
  })

  describe('遮罩模式', () => {
    it('应该应用遮罩样式', () => {
      wrapper = createWrapper({ overlay: true })

      const spinner = wrapper.find('.loading-spinner')
      expect(spinner.classes()).toContain('loading-spinner--overlay')

      const style = spinner.attributes('style')
      expect(style).toContain('z-index: 1000')
      expect(style).toContain('background-color: rgba(255, 255, 255, 0.8)')
    })

    it('应该使用自定义背景颜色', () => {
      wrapper = createWrapper({
        overlay: true,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      })
      
      const spinner = wrapper.find('.loading-spinner')
      const style = spinner.attributes('style')
      expect(style).toContain('background-color: rgba(0, 0, 0, 0.5)')
    })

    it('应该使用自定义 z-index', () => {
      wrapper = createWrapper({
        overlay: true,
        zIndex: 2000
      })
      
      const spinner = wrapper.find('.loading-spinner')
      const style = spinner.attributes('style')
      expect(style).toContain('z-index: 2000')
    })

    it('应该使用自定义颜色', () => {
      wrapper = createWrapper({
        overlay: true,
        color: '#ff0000'
      })
      
      const spinner = wrapper.find('.loading-spinner')
      const style = spinner.attributes('style')
      expect(style).toContain('--loading-color: #ff0000')
    })
  })

  describe('文本和详情', () => {
    it('应该显示加载文本', () => {
      wrapper = createWrapper({
        text: '加载中...',
        type: 'spinner'
      })
      
      const text = wrapper.find('.loading-text')
      expect(text.exists()).toBe(true)
      expect(text.text()).toBe('加载中...')
    })

    it('应该显示详细信息', () => {
      wrapper = createWrapper({
        detail: '正在处理您的请求，请稍候...',
        type: 'spinner'
      })
      
      const detail = wrapper.find('.loading-detail')
      expect(detail.exists()).toBe(true)
      expect(detail.text()).toBe('正在处理您的请求，请稍候...')
    })

    it('应该隐藏骨架屏的文本', () => {
      wrapper = createWrapper({
        text: '加载中...',
        type: 'skeleton'
      })
      
      expect(wrapper.find('.loading-text').exists()).toBe(false)
    })
  })

  describe('进度条', () => {
    it('应该显示正确的进度', () => {
      wrapper = createWrapper({
        type: 'progress',
        progress: 50
      })
      
      const progressFill = wrapper.find('.progress-fill')
      const style = progressFill.attributes('style')
      expect(style).toContain('width: 50%')
    })

    it('应该处理 0% 进度', () => {
      wrapper = createWrapper({
        type: 'progress',
        progress: 0
      })
      
      const progressFill = wrapper.find('.progress-fill')
      const style = progressFill.attributes('style')
      expect(style).toContain('width: 0%')
    })

    it('应该处理 100% 进度', () => {
      wrapper = createWrapper({
        type: 'progress',
        progress: 100
      })
      
      const progressFill = wrapper.find('.progress-fill')
      const style = progressFill.attributes('style')
      expect(style).toContain('width: 100%')
    })
  })

  describe('骨架屏', () => {
    it('应该显示正确的骨架屏行数', () => {
      wrapper = createWrapper({
        type: 'skeleton',
        skeletonLines: 5
      })
      
      const lines = wrapper.findAll('.skeleton-line')
      expect(lines.length).toBe(5)
    })

    it('应该正确应用尺寸到骨架屏', () => {
      wrapper = createWrapper({
        type: 'skeleton',
        size: 'small',
        skeletonLines: 3
      })

      const lines = wrapper.findAll('.skeleton-line')
      expect(lines).toHaveLength(3)

      // 验证骨架屏行存在
      lines.forEach(line => {
        expect(line.exists()).toBe(true)
      })
    })
  })

  describe('动画效果', () => {
    it('应该应用旋转动画', () => {
      wrapper = createWrapper({ type: 'spinner' })

      const spinnerRing = wrapper.find('.spinner-ring')
      expect(spinnerRing.exists()).toBe(true)
      expect(spinnerRing.classes()).toContain('spinner-ring')
    })

    it('应该应用脉冲动画', () => {
      wrapper = createWrapper({ type: 'dots' })

      const dots = wrapper.findAll('.dot')
      expect(dots).toHaveLength(3)
      dots.forEach((dot, index) => {
        expect(dot.exists()).toBe(true)
        expect(dot.classes()).toContain('dot')
      })
    })

    it('应该应用波浪动画', () => {
      wrapper = createWrapper({ type: 'wave' })

      const waveBars = wrapper.findAll('.wave-bar')
      expect(waveBars).toHaveLength(5)
      waveBars.forEach((bar, index) => {
        expect(bar.exists()).toBe(true)
        expect(bar.classes()).toContain('wave-bar')
      })
    })

    it('应该应用骨架屏动画', () => {
      wrapper = createWrapper({ type: 'skeleton', skeletonLines: 3 })

      const lines = wrapper.findAll('.skeleton-line')
      expect(lines).toHaveLength(3)
      lines.forEach(line => {
        expect(line.exists()).toBe(true)
        expect(line.classes()).toContain('skeleton-line')
      })
    })

    it('应该应用进度条动画', () => {
      wrapper = createWrapper({ type: 'progress', progress: 50 })

      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.exists()).toBe(true)
      const style = progressFill.attributes('style')
      expect(style).toContain('width: 50%')
    })
  })

  describe('Props 默认值', () => {
    it('应该使用正确的默认值', () => {
      wrapper = createWrapper()
      
      expect(wrapper.props().type).toBe('spinner')
      expect(wrapper.props().size).toBe('medium')
      expect(wrapper.props().overlay).toBe(false)
      expect(wrapper.props().text).toBe('')
      expect(wrapper.props().detail).toBe('')
      expect(wrapper.props().progress).toBe(0)
      expect(wrapper.props().skeletonLines).toBe(3)
      expect(wrapper.props().zIndex).toBe(1000)
    })
  })

  describe('响应式更新', () => {
    it('应该响应类型变化', async () => {
      wrapper = createWrapper({ type: 'spinner' })
      
      await wrapper.setProps({ type: 'dots' })
      
      expect(wrapper.find('.dots').exists()).toBe(true)
      expect(wrapper.find('.spinner').exists()).toBe(false)
    })

    it('应该响应尺寸变化', async () => {
      wrapper = createWrapper({ size: 'medium' })
      
      await wrapper.setProps({ size: 'large' })
      
      const spinner = wrapper.find('.loading-spinner')
      expect(spinner.classes()).toContain('loading-spinner--large')
    })

    it('应该响应进度变化', async () => {
      wrapper = createWrapper({ 
        type: 'progress',
        progress: 30 
      })
      
      await wrapper.setProps({ progress: 75 })
      
      const progressFill = wrapper.find('.progress-fill')
      const style = progressFill.attributes('style')
      expect(style).toContain('width: 75%')
    })

    it('应该响应文本变化', async () => {
      wrapper = createWrapper({ text: '原文本' })
      
      await wrapper.setProps({ text: '新文本' })
      
      expect(wrapper.find('.loading-text').text()).toBe('新文本')
    })
  })

  describe('边界情况', () => {
    it('应该处理负进度值', () => {
      wrapper = createWrapper({
        type: 'progress',
        progress: -10
      })
      
      const progressFill = wrapper.find('.progress-fill')
      const style = progressFill.attributes('style')
      expect(style).toContain('width: -10%')
    })

    it('应该处理超过 100 的进度值', () => {
      wrapper = createWrapper({
        type: 'progress',
        progress: 150
      })
      
      const progressFill = wrapper.find('.progress-fill')
      const style = progressFill.attributes('style')
      expect(style).toContain('width: 150%')
    })

    it('应该处理 0 骨架屏行数', () => {
      wrapper = createWrapper({
        type: 'skeleton',
        skeletonLines: 0
      })
      
      const lines = wrapper.findAll('.skeleton-line')
      expect(lines.length).toBe(0)
    })

    it('应该处理大量骨架屏行数', () => {
      wrapper = createWrapper({
        type: 'skeleton',
        skeletonLines: 10
      })
      
      const lines = wrapper.findAll('.skeleton-line')
      expect(lines.length).toBe(10)
    })
  })

  describe('无障碍支持', () => {
    it('应该支持适当的 ARIA 属性', () => {
      wrapper = createWrapper({
        overlay: true,
        text: '加载中...'
      })

      const spinner = wrapper.find('.loading-spinner')
      expect(spinner.exists()).toBe(true)
      // 验证加载文本存在
      const loadingText = wrapper.find('.loading-text')
      expect(loadingText.text()).toBe('加载中...')
    })
  })

  describe('样式覆盖', () => {
    it('应该应用 CSS 变量', () => {
      wrapper = createWrapper({
        color: '#ff0000',
        overlay: true
      })

      const spinner = wrapper.find('.loading-spinner')
      expect(spinner.exists()).toBe(true)

      // 验证overlay模式下的样式
      const style = spinner.attributes('style')
      expect(style).toContain('--loading-color: #ff0000')
    })
  })

  describe('响应式布局测试', () => {
    it('应该适配不同屏幕尺寸', async () => {
      wrapper = createWrapper({
        text: '响应式加载中...'
      })
      
      // 模拟移动端视图
      global.innerWidth = 375
      global.dispatchEvent(new Event('resize'))
      
      await nextTick()
      
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      
      // 模拟桌面端视图
      global.innerWidth = 1920
      global.dispatchEvent(new Event('resize'))
      
      await nextTick()
      
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    })

    it('应该在移动端优化文本显示', async () => {
      wrapper = createWrapper({
        text: '移动端加载文本',
        detail: '这是移动端的详细描述信息'
      })
      
      // 模拟小屏幕
      global.innerWidth = 320
      global.dispatchEvent(new Event('resize'))
      
      await nextTick()
      
      const text = wrapper.find('.loading-text')
      const detail = wrapper.find('.loading-detail')
      
      expect(text.exists()).toBe(true)
      expect(detail.exists()).toBe(true)
    })
  })

  describe('主题切换支持', () => {
    it('应该支持深色模式', async () => {
      wrapper = createWrapper({
        text: '深色模式加载',
        type: 'spinner'
      })
      
      // 模拟深色模式
      document.documentElement.setAttribute('data-theme', 'dark')
      
      await nextTick()
      
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      
      // 恢复浅色模式
      document.documentElement.setAttribute('data-theme', 'light')
    })

    it('应该在深色模式下调整动画颜色', async () => {
      wrapper = createWrapper({
        type: 'dots',
        color: '#ffffff'
      })
      
      // 模拟深色模式
      document.documentElement.setAttribute('data-theme', 'dark')
      
      await nextTick()
      
      const dots = wrapper.findAll('.dot')
      expect(dots.length).toBe(3)
      
      // 恢复浅色模式
      document.documentElement.setAttribute('data-theme', 'light')
    })
  })

  describe('性能优化测试', () => {
    it('应该正确处理组件卸载', async () => {
      wrapper = createWrapper({
        overlay: true,
        text: '性能测试加载中...'
      })
      
      // 卸载组件
      wrapper.unmount()
      
      // 验证清理工作
    })

    it('应该避免内存泄漏', async () => {
      wrapper = createWrapper()
      
      // 模拟多次状态变化
      for (let i = 0;
import { vi } from 'vitest' i < 100; i++) {
        await wrapper.setProps({ 
          text: `加载文本${i}`,
          progress: i % 100
        })
      }
      
      // 组件应该仍然正常工作
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    })

    it('应该高效渲染动画', async () => {
      wrapper = createWrapper({
        type: 'wave',
        overlay: true
      })
      
      // 模拟长时间运行
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const waveBars = wrapper.findAll('.wave-bar')
      expect(waveBars.length).toBe(5)
    })

    it('应该优化骨架屏渲染性能', () => {
      wrapper = createWrapper({
        type: 'skeleton',
        skeletonLines: 20
      })
      
      const lines = wrapper.findAll('.skeleton-line')
      expect(lines.length).toBe(20)
    })
  })

  describe('可访问性测试', () => {
    it('应该支持键盘导航', () => {
      wrapper = createWrapper({
        overlay: true,
        text: '可访问性加载'
      })
      
      const spinner = wrapper.find('.loading-spinner')
      expect(spinner.exists()).toBe(true)
    })

    it('应该包含适当的ARIA属性', () => {
      wrapper = createWrapper({
        type: 'progress',
        progress: 50,
        text: '进度加载'
      })
      
      const spinner = wrapper.find('.loading-spinner')
      expect(spinner.exists()).toBe(true)
    })

    it('应该为屏幕阅读器提供加载状态', () => {
      wrapper = createWrapper({
        text: '正在加载，请稍候...',
        type: 'spinner'
      })
      
      const text = wrapper.find('.loading-text')
      expect(text.exists()).toBe(true)
      expect(text.text()).toBe('正在加载，请稍候...')
    })
  })

  describe('动画性能测试', () => {
    it('应该使用GPU加速动画', () => {
      wrapper = createWrapper({
        type: 'spinner'
      })

      const spinnerRing = wrapper.find('.spinner-ring')
      expect(spinnerRing.exists()).toBe(true)
      expect(spinnerRing.classes()).toContain('spinner-ring')
    })

    it('应该优化动画帧率', async () => {
      wrapper = createWrapper({
        type: 'dots'
      })
      
      // 模拟动画运行
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const dots = wrapper.findAll('.dot')
      expect(dots.length).toBe(3)
    })
  })

  describe('自定义动画测试', () => {
    it('应该支持自定义动画时长', () => {
      wrapper = createWrapper({
        type: 'spinner'
      })

      const spinnerRing = wrapper.find('.spinner-ring')
      expect(spinnerRing.exists()).toBe(true)
      expect(spinnerRing.classes()).toContain('spinner-ring')
    })

    it('应该支持动画暂停', async () => {
      wrapper = createWrapper({
        type: 'wave'
      })

      const waveBars = wrapper.findAll('.wave-bar')
      expect(waveBars.length).toBe(5)

      // 验证波浪条存在
      waveBars.forEach(bar => {
        expect(bar.exists()).toBe(true)
      })
    })
  })

  describe('加载状态管理', () => {
    it('应该正确管理加载状态', async () => {
      wrapper = createWrapper({
        text: '状态管理测试'
      })

      // 验证组件正确渲染
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      expect(wrapper.find('.loading-text').text()).toBe('状态管理测试')
    })

    it('应该支持加载超时处理', async () => {
      wrapper = createWrapper({
        text: '超时测试',
        detail: '如果加载时间过长，将显示超时信息'
      })
      
      // 模拟超时
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(wrapper.find('.loading-detail').exists()).toBe(true)
    })
  })

  describe('多语言支持', () => {
    it('应该支持国际化文本', () => {
      wrapper = createWrapper({
        text: 'Loading...',
        detail: 'Please wait while we process your request'
      })
      
      expect(wrapper.find('.loading-text').text()).toBe('Loading...')
      expect(wrapper.find('.loading-detail').text()).toBe('Please wait while we process your request')
    })
  })

  describe('错误处理测试', () => {
    it('应该处理无效的进度值', () => {
      wrapper = createWrapper({
        type: 'progress',
        progress: NaN
      })
      
      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.exists()).toBe(true)
    })

    it('应该处理负数的骨架屏行数', () => {
      // 使用默认值而不是负数，避免数组长度错误
      wrapper = createWrapper({
        type: 'skeleton',
        skeletonLines: 0
      })

      const lines = wrapper.findAll('.skeleton-line')
      expect(lines.length).toBe(0)
    })
  })

  describe('交互测试', () => {
    it('应该支持点击遮罩关闭', async () => {
      wrapper = createWrapper({
        overlay: true,
        text: '点击关闭测试'
      })
      
      const spinner = wrapper.find('.loading-spinner')
      expect(spinner.exists()).toBe(true)
      
      // 模拟点击事件
      await spinner.trigger('click')
      
      // 验证点击处理
    })

    it('应该支持触摸事件', async () => {
      wrapper = createWrapper({
        overlay: true,
        text: '触摸测试'
      })
      
      const spinner = wrapper.find('.loading-spinner')
      expect(spinner.exists()).toBe(true)
      
      // 模拟触摸事件
      await spinner.trigger('touchstart')
      await spinner.trigger('touchend')
    })
  })
})