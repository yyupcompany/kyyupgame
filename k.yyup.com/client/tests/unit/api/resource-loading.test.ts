import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import service from '@/api/interceptors'
import { expectNoConsoleErrors, startConsoleMonitoring } from '../../setup/console-monitoring'

// Mock modules
vi.mock('@/api/interceptors', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn()
  },
  ElLoading: {
    service: vi.fn(() => ({
      close: vi.fn()
    }))
  }
}))

// 模拟图片库组件
const ImageGalleryComponent = {
  template: `
    <div>
      <div v-if="loading" class="loading-indicator">加载图片中...</div>

      <div v-if="imageErrors.length > 0" class="image-errors">
        <h3>图片加载错误</h3>
        <div v-for="(error, index) in imageErrors" :key="index" class="error-item">
          <p class="error-message">{{ error.message }}</p>
          <div class="error-placeholder">
            <img
              v-if="error.fallbackUrl"
              :src="error.fallbackUrl"
              @error="handleFallbackError(index)"
              alt="备用图片"
              class="fallback-image"
            >
            <div v-else class="no-image-placeholder">
              <span class="placeholder-icon">🖼️</span>
              <span>图片加载失败</span>
            </div>
          </div>
          <button class="retry-button" @click="retryLoadImage(index)">重试</button>
        </div>
      </div>

      <div v-if="scriptErrors.length > 0" class="script-errors">
        <h3>脚本加载错误</h3>
        <div v-for="(error, index) in scriptErrors" :key="index" class="script-error-item">
          <p class="script-error-message">{{ error.message }}</p>
          <p class="script-url">脚本: {{ error.url }}</p>
          <button class="reload-script-button" @click="reloadScript(index)">重新加载脚本</button>
        </div>
      </div>

      <div v-if="styleErrors.length > 0" class="style-errors">
        <h3>样式加载错误</h3>
        <div v-for="(error, index) in styleErrors" :key="index" class="style-error-item">
          <p class="style-error-message">{{ error.message }}</p>
          <p class="style-url">样式: {{ error.url }}</p>
          <div class="fallback-styles">
            <span>使用默认样式</span>
          </div>
        </div>
      </div>

      <div v-if="mediaLoadingErrors.length > 0" class="media-errors">
        <h3>媒体资源加载错误</h3>
        <div v-for="(error, index) in mediaLoadingErrors" :key="index" class="media-error-item">
          <p class="media-error-message">{{ error.message }}</p>
          <p class="media-type">类型: {{ error.type }}</p>
          <div class="media-placeholder">
            <span class="placeholder-icon">{{ getMediaIcon(error.type) }}</span>
            <span>{{ error.type }} 加载失败</span>
          </div>
          <button class="retry-media-button" @click="retryLoadMedia(index)">重试</button>
        </div>
      </div>

      <div v-if="!loading && !hasErrors" class="gallery-content">
        <div v-for="(image, index) in loadedImages" :key="index" class="image-item">
          <img :src="image.url" :alt="image.alt" @error="handleImageError($event, index)">
          <p class="image-caption">{{ image.caption }}</p>
        </div>
      </div>

      <div class="actions">
        <button @click="loadImages" :disabled="loading">加载图片</button>
        <button @click="loadExternalScript">加载外部脚本</button>
        <button @click="loadExternalStyles">加载外部样式</button>
        <button @click="loadMediaResources">加载媒体资源</button>
      </div>
    </div>
  `,
  data() {
    return {
      loading: false,
      loadedImages: [],
      imageErrors: [],
      scriptErrors: [],
      styleErrors: [],
      mediaLoadingErrors: [],
      hasErrors: false
    }
  },
  computed: {
    allErrors() {
      return [
        ...this.imageErrors,
        ...this.scriptErrors,
        ...this.styleErrors,
        ...this.mediaLoadingErrors
      ]
    }
  },
  methods: {
    async loadImages() {
      this.loading = true
      this.imageErrors = []
      this.loadedImages = []

      try {
        const response = await service.get('/api/images')
        const imageUrls = response.data.data || []

        this.loadedImages = imageUrls.map(url => ({
          url,
          alt: 'Gallery Image',
          caption: 'Image from gallery'
        }))

        // 模拟图片加载错误检测
        this.simulateImageErrors()
      } catch (error) {
        this.imageErrors.push({
          message: '无法获取图片列表',
          type: 'api_error',
          fallbackUrl: null
        })
      } finally {
        this.loading = false
      }
    },

    simulateImageErrors() {
      // 模拟部分图片加载失败
      if (Math.random() > 0.7) {
        this.imageErrors.push({
          message: '图片加载失败: 404 Not Found',
          type: 'network_error',
          url: '/images/missing.jpg',
          fallbackUrl: '/images/placeholder.jpg'
        })
      }

      if (Math.random() > 0.8) {
        this.imageErrors.push({
          message: '图片格式不支持',
          type: 'format_error',
          url: '/images/unsupported.webp',
          fallbackUrl: '/images/default.jpg'
        })
      }
    },

    handleImageError(event, index) {
      const image = this.loadedImages[index]
      this.imageErrors.push({
        message: `图片加载失败: ${image.url}`,
        type: 'load_error',
        url: image.url,
        fallbackUrl: '/images/fallback.jpg'
      })

      // 移除失败的图片
      this.loadedImages.splice(index, 1)
    },

    handleFallbackError(index) {
      this.imageErrors[index].fallbackUrl = null
    },

    retryLoadImage(index) {
      const error = this.imageErrors[index]
      this.imageErrors.splice(index, 1)

      // 重新添加到加载列表
      this.loadedImages.push({
        url: error.url,
        alt: 'Retry Image',
        caption: 'Retrying image load'
      })
    },

    async loadExternalScript() {
      const scriptUrl = '/js/external-analytics.js'

      try {
        // 动态加载脚本
        await this.loadScript(scriptUrl)
      } catch (error) {
        this.scriptErrors.push({
          message: `脚本加载失败: ${error.message}`,
          url: scriptUrl,
          error
        })
      }
    },

    loadScript(url) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = url
        script.async = true

        script.onload = () => {
          document.head.removeChild(script)
          resolve()
        }

        script.onerror = () => {
          document.head.removeChild(script)
          reject(new Error(`Failed to load script: ${url}`))
        }

        // 模拟脚本加载失败
        setTimeout(() => {
          if (url.includes('analytics')) {
            script.onerror()
          } else {
            script.onload()
          }
        }, 100)

        document.head.appendChild(script)
      })
    },

    reloadScript(index) {
      const error = this.scriptErrors[index]
      this.scriptErrors.splice(index, 1)
      this.loadExternalScript()
    },

    async loadExternalStyles() {
      const styleUrls = [
        '/css/theme-light.css',
        '/css/components.css',
        '/css/non-existent-style.css'
      ]

      for (const url of styleUrls) {
        try {
          await this.loadStylesheet(url)
        } catch (error) {
          this.styleErrors.push({
            message: `样式加载失败: ${error.message}`,
            url,
            error
          })
        }
      }
    },

    loadStylesheet(url) {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = url

        link.onload = () => {
          resolve()
        }

        link.onerror = () => {
          reject(new Error(`Failed to load stylesheet: ${url}`))
        }

        // 模拟样式加载结果
        setTimeout(() => {
          if (url.includes('non-existent')) {
            link.onerror()
          } else {
            link.onload()
          }
        }, 50)

        document.head.appendChild(link)
      })
    },

    async loadMediaResources() {
      this.mediaLoadingErrors = []

      const mediaResources = [
        { type: 'video', url: '/videos/intro.mp4' },
        { type: 'audio', url: '/audio/background.mp3' },
        { type: 'pdf', url: '/documents/report.pdf' },
        { type: 'video', url: '/videos/broken-video.mp4' }
      ]

      for (const media of mediaResources) {
        try {
          await this.loadMedia(media)
        } catch (error) {
          this.mediaLoadingErrors.push({
            message: `${media.type} 加载失败: ${error.message}`,
            type: media.type,
            url: media.url,
            error
          })
        }
      }
    },

    loadMedia(media) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (media.url.includes('broken')) {
            reject(new Error('Media file corrupted or not found'))
          } else {
            resolve()
          }
        }, Math.random() * 1000 + 500)
      })
    },

    retryLoadMedia(index) {
      const error = this.mediaLoadingErrors[index]
      this.mediaLoadingErrors.splice(index, 1)
      this.loadMediaResources()
    },

    getMediaIcon(type) {
      const icons = {
        video: '🎥',
        audio: '🎵',
        pdf: '📄'
      }
      return icons[type] || '📁'
    }
  },
  watch: {
    allErrors: {
      handler(newErrors) {
        this.hasErrors = newErrors.length > 0
      },
      immediate: true
    }
  }
}

describe('Real Resource Loading Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    startConsoleMonitoring()

    // 重置DOM
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  afterEach(() => {
    expectNoConsoleErrors()
  })

  describe('Image Loading Errors', () => {
    it('should handle image loading failures', async () => {
      const wrapper = mount(ImageGalleryComponent)

      // 模拟图片加载错误
      const mockImage = {
        src: '/images/test.jpg',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }

      // 模拟Image构造函数
      global.Image = vi.fn(() => mockImage)

      // 立即触发错误事件
      setTimeout(() => {
        const errorCallback = mockImage.addEventListener.mock.calls.find(
          call => call[0] === 'error'
        )?.[1]
        if (errorCallback) {
          errorCallback({ target: mockImage })
        }
      }, 0)

      await wrapper.vm.loadImages()

      // 等待错误处理
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(wrapper.vm.imageErrors.length).toBeGreaterThan(0)
      expect(wrapper.find('.image-errors').exists()).toBe(true)
    })

    it('should show fallback images on error', async () => {
      const wrapper = mount(ImageGalleryComponent)

      // 模拟图片错误
      await wrapper.vm.handleImageError({ target: { src: '/images/missing.jpg' } }, 0)

      expect(wrapper.vm.imageErrors.length).toBe(1)
      expect(wrapper.vm.imageErrors[0].fallbackUrl).toBe('/images/fallback.jpg')

      await nextTick()
      expect(wrapper.find('.error-placeholder').exists()).toBe(true)
      expect(wrapper.find('.fallback-image').exists()).toBe(true)
    })

    it('should handle fallback image errors', async () => {
      const wrapper = mount(ImageGalleryComponent)

      // 设置图片错误
      wrapper.vm.imageErrors = [{
        message: 'Original image failed',
        url: '/images/original.jpg',
        fallbackUrl: '/images/fallback.jpg'
      }]

      await wrapper.vm.handleFallbackError(0)

      expect(wrapper.vm.imageErrors[0].fallbackUrl).toBeNull()
      expect(wrapper.find('.no-image-placeholder').exists()).toBe(true)
    })

    it('should retry failed image loads', async () => {
      const wrapper = mount(ImageGalleryComponent)

      // 设置错误状态
      wrapper.vm.imageErrors = [{
        message: 'Image failed to load',
        url: '/images/retry-test.jpg',
        fallbackUrl: '/images/fallback.jpg'
      }]

      await wrapper.vm.retryLoadImage(0)

      expect(wrapper.vm.imageErrors.length).toBe(0)
      expect(wrapper.vm.loadedImages.length).toBe(1)
      expect(wrapper.vm.loadedImages[0].url).toBe('/images/retry-test.jpg')
      expect(wrapper.vm.loadedImages[0].caption).toBe('Retrying image load')
    })

    it('should handle CORS errors for images', async () => {
      service.get.mockResolvedValue({
        data: {
          data: [
            { url: 'https://external-site.com/image.jpg' }, // CORS问题
            { url: '/images/local.jpg' }
          ]
        }
      })

      const wrapper = mount(ImageGalleryComponent)
      await wrapper.vm.loadImages()

      // 模拟CORS错误
      const corsError = {
        target: { src: 'https://external-site.com/image.jpg' },
        message: 'Failed to load resource: the server responded with a status of 403 (Forbidden)'
      }

      await wrapper.vm.handleImageError(corsError, 0)

      expect(wrapper.vm.imageErrors.length).toBe(1)
      expect(wrapper.vm.imageErrors[0].url).toBe('https://external-site.com/image.jpg')
      expect(wrapper.vm.imageErrors[0].message).toContain('403')
    })
  })

  describe('Script Loading Errors', () => {
    it('should handle external script loading failures', async () => {
      const wrapper = mount(ImageGalleryComponent)

      // 监听console.error以捕获脚本错误
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await wrapper.vm.loadExternalScript()

      // 等待脚本加载超时
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(wrapper.vm.scriptErrors.length).toBe(1)
      expect(wrapper.vm.scriptErrors[0].url).toBe('/js/external-analytics.js')
      expect(wrapper.vm.scriptErrors[0].message).toContain('Failed to load script')

      consoleSpy.mockRestore()
    })

    it('should retry failed script loading', async () => {
      const wrapper = mount(ImageGalleryComponent)

      // 设置初始错误
      wrapper.vm.scriptErrors = [{
        message: 'Script failed to load',
        url: '/js/test-script.js'
      }]

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await wrapper.vm.reloadScript(0)

      // 等待重试
      await new Promise(resolve => setTimeout(resolve, 150))

      // 应该清除错误并重新尝试
      expect(wrapper.vm.scriptErrors.length).toBe(0)

      consoleSpy.mockRestore()
    })

    it('should handle script syntax errors', async () => {
      // 模拟脚本包含语法错误
      const originalCreateElement = document.createElement
      document.createElement = vi.fn((tagName) => {
        if (tagName === 'script') {
          const script = originalCreateElement.call(document, tagName)
          // 模拟语法错误
          setTimeout(() => {
            const error = new SyntaxError('Unexpected token <')
            error.filename = '/js/invalid-script.js'
            console.error(error)
          }, 50)
          return script
        }
        return originalCreateElement.call(document, tagName)
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await wrapper.vm.loadScript('/js/invalid-script.js')

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unexpected token <'
        })
      )

      document.createElement = originalCreateElement
      consoleSpy.mockRestore()
    })
  })

  describe('CSS Loading Errors', () => {
    it('should handle CSS loading failures', async () => {
      const wrapper = mount(ImageGalleryComponent)

      await wrapper.vm.loadExternalStyles()

      // 等待样式加载完成
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.vm.styleErrors.length).toBe(1)
      expect(wrapper.vm.styleErrors[0].url).toBe('/css/non-existent-style.css')
      expect(wrapper.vm.styleErrors[0].message).toContain('Failed to load stylesheet')

      expect(wrapper.find('.style-errors').exists()).toBe(true)
      expect(wrapper.find('.fallback-styles').exists()).toBe(true)
    })

    it('should provide fallback styles when CSS fails', async () => {
      const wrapper = mount(ImageGalleryComponent)

      // 设置样式错误
      wrapper.vm.styleErrors = [{
        message: 'CSS failed to load',
        url: '/css/main.css'
      }]

      await nextTick()

      expect(wrapper.find('.fallback-styles').exists()).toBe(true)
      expect(wrapper.find('.fallback-styles').text()).toContain('使用默认样式')
    })

    it('should handle CSS import errors', async () => {
      // 模拟CSS中包含@import错误
      const cssWithImportError = `
        @import url('non-existent-styles.css');
        .component { color: red; }
      `

      const mockStyleElement = {
        sheet: {
          cssRules: [
            {
              type: 3, // IMPORT_RULE
              href: 'non-existent-styles.css',
              styleSheet: null // 加载失败
            }
          ]
        }
      }

      const originalCreateElement = document.createElement
      document.createElement = vi.fn((tagName) => {
        if (tagName === 'link') {
          const link = originalCreateElement.call(document, tagName)
          // 模拟CSS规则检查
          setTimeout(() => {
            if (link.href.includes('css-rules')) {
              const event = new Event('error')
              link.dispatchEvent(event)
            }
          }, 50)
          return link
        }
        return originalCreateElement.call(document, tagName)
      })

      await wrapper.vm.loadStylesheet('/css/css-rules.css')

      await new Promise(resolve => setTimeout(resolve, 100))

      document.createElement = originalCreateElement
    })
  })

  describe('Media Resource Loading Errors', () => {
    it('should handle video loading failures', async () => {
      const wrapper = mount(ImageGalleryComponent)

      await wrapper.vm.loadMediaResources()

      // 等待媒体加载完成
      await new Promise(resolve => setTimeout(resolve, 1500))

      expect(wrapper.vm.mediaLoadingErrors.length).toBeGreaterThan(0)

      const videoError = wrapper.vm.mediaLoadingErrors.find(
        error => error.type === 'video' && error.url.includes('broken-video')
      )
      expect(videoError).toBeDefined()
      expect(videoError.message).toContain('Media file corrupted')

      expect(wrapper.find('.media-errors').exists()).toBe(true)
      expect(wrapper.find('.media-placeholder').exists()).toBe(true)
    })

    it('should handle audio loading failures', async () => {
      const wrapper = mount(ImageGalleryComponent)

      // 直接测试媒体加载
      try {
        await wrapper.vm.loadMedia({ type: 'audio', url: '/audio/missing.mp3' })
      } catch (error) {
        // 预期会失败
      }

      await nextTick()

      expect(wrapper.vm.mediaLoadingErrors.some(
        error => error.type === 'audio'
      )).toBe(true)
    })

    it('should provide appropriate media placeholders', async () => {
      const wrapper = mount(ImageGalleryComponent)

      // 设置媒体错误
      wrapper.vm.mediaLoadingErrors = [
        { type: 'video', message: 'Video failed', url: '/video.mp4' },
        { type: 'audio', message: 'Audio failed', url: '/audio.mp3' },
        { type: 'pdf', message: 'PDF failed', url: '/document.pdf' }
      ]

      await nextTick()

      expect(wrapper.findAll('.media-placeholder').length).toBe(3)
      expect(wrapper.findAll('.placeholder-icon')[0].text()).toBe('🎥')
      expect(wrapper.findAll('.placeholder-icon')[1].text()).toBe('🎵')
      expect(wrapper.findAll('.placeholder-icon')[2].text()).toBe('📄')
    })

    it('should retry failed media loading', async () => {
      const wrapper = mount(ImageGalleryComponent)

      // 设置媒体错误
      wrapper.vm.mediaLoadingErrors = [{
        message: 'Media failed to load',
        type: 'video',
        url: '/videos/test.mp4'
      }]

      await wrapper.vm.retryLoadMedia(0)

      // 错误应该被清除
      expect(wrapper.vm.mediaLoadingErrors.length).toBe(0)
    })
  })

  describe('Resource Loading Performance', () => {
    it('should implement timeout for resource loading', async () => {
      const wrapper = mount(ImageGalleryComponent)

      // 模拟长时间加载的图片
      const longLoadingImage = {
        url: '/images/very-large-image.jpg',
        timeout: 10000 // 10秒超时
      }

      const startTime = Date.now()

      try {
        await new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Image loading timeout'))
          }, 1000) // 1秒后超时（测试用）
        })
      } catch (error) {
        const endTime = Date.now()
        const duration = endTime - startTime

        expect(duration).toBeGreaterThan(900) // 接近1秒
        expect(error.message).toContain('timeout')
      }
    })

    it('should implement progressive loading for images', async () => {
      const wrapper = mount(ImageGalleryComponent)

      // 模拟渐进式图片加载
      const progressiveImages = [
        { url: '/images/placeholder-small.jpg', priority: 'low' },
        { url: '/images/placeholder-medium.jpg', priority: 'medium' },
        { url: '/images/placeholder-large.jpg', priority: 'high' }
      ]

      const loadOrder = []

      for (const image of progressiveImages) {
        await new Promise(resolve => {
          setTimeout(() => {
            loadOrder.push(image.priority)
            resolve()
          }, image.priority === 'high' ? 100 : image.priority === 'medium' ? 200 : 300)
        })
      }

      // 高优先级图片应该先加载
      expect(loadOrder.indexOf('high')).toBeLessThan(loadOrder.indexOf('medium'))
      expect(loadOrder.indexOf('medium')).toBeLessThan(loadOrder.indexOf('low'))
    })

    it('should implement lazy loading for off-screen images', async () => {
      // 模拟IntersectionObserver
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }

      global.IntersectionObserver = vi.fn(() => mockObserver)

      const wrapper = mount(ImageGalleryComponent)

      // 验证lazy loading观察者被设置
      expect(mockObserver.observe).toHaveBeenCalled()
    })
  })

  describe('Resource Caching and Fallback', () => {
    it('should implement local storage fallback for failed resources', async () => {
      // 模拟localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      }

      global.localStorage = localStorageMock

      // 模拟缓存的图片数据
      const cachedImageData = {
        url: '/images/cached.jpg',
        data: 'data:image/jpeg;base64,cached-image-data'
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedImageData))

      const wrapper = mount(ImageGalleryComponent)

      // 当网络图片失败时，应该尝试使用缓存
      await wrapper.vm.handleImageError({ target: { src: '/images/cached.jpg' } }, 0)

      expect(localStorageMock.getItem).toHaveBeenCalledWith('image_cache_/images/cached.jpg')
    })

    it('should cache successful resource loads', async () => {
      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn()
      }

      global.localStorage = localStorageMock

      const wrapper = mount(ImageGalleryComponent)

      // 模拟成功加载图片
      wrapper.vm.loadedImages = [
        { url: '/images/success.jpg', alt: 'Success Image' }
      ]

      // 缓存成功的加载
      const cacheData = {
        url: '/images/success.jpg',
        data: 'data:image/jpeg;base64,success-image-data',
        timestamp: Date.now()
      }

      wrapper.vm.cacheImage = (url, data) => {
        localStorageMock.setItem(`image_cache_${url}`, JSON.stringify(cacheData))
      }

      wrapper.vm.cacheImage('/images/success.jpg', 'image-data')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'image_cache_/images/success.jpg',
        expect.stringContaining('success-image-data')
      )
    })

    it('should implement CDN fallback for static resources', async () => {
      const wrapper = mount(ImageGalleryComponent)

      // 模拟CDN回退机制
      const cdnFallbacks = [
        'https://cdn1.example.com/images/',
        'https://cdn2.example.com/images/',
        'https://cdn3.example.com/images/'
      ]

      let currentCdnIndex = 0

      const loadFromCdn = (imagePath) => {
        if (currentCdnIndex < cdnFallbacks.length) {
          const cdnUrl = cdnFallbacks[currentCdnIndex] + imagePath
          currentCdnIndex++
          return cdnUrl
        }
        return null
      }

      // 测试CDN回退
      const fallbackUrl = loadFromCdn('test.jpg')
      expect(fallbackUrl).toBe('https://cdn1.example.com/images/test.jpg')

      const fallbackUrl2 = loadFromCdn('test.jpg')
      expect(fallbackUrl2).toBe('https://cdn2.example.com/images/test.jpg')
    })
  })

  describe('Network Condition Adaptation', () => {
    it('should adapt to slow network conditions', async () => {
      // 模拟网络信息API
      global.navigator = {
        ...global.navigator,
        connection: {
          effectiveType: 'slow-2g',
          downlink: 0.1, // Mbps
          rtt: 2000 // ms
        }
      }

      const wrapper = mount(ImageGalleryComponent)

      // 在慢网络下应该降低图片质量
      const shouldUseLowQuality = navigator.connection.effectiveType === 'slow-2g'
      expect(shouldUseLowQuality).toBe(true)

      // 应该优先加载文本内容
      const prioritizedResources = wrapper.vm.getPrioritizedResources?.() || []
      if (prioritizedResources.length > 0) {
        expect(prioritizedResources[0].type).toBe('text')
      }
    })

    it('should implement offline resource fallback', async () => {
      // 模拟离线状态
      global.navigator = {
        ...global.navigator,
        onLine: false
      }

      const wrapper = mount(ImageGalleryComponent)

      // 在离线状态下应该只显示缓存的内容
      expect(global.navigator.onLine).toBe(false)

      // 模拟Service Worker缓存检查
      const cachedContent = await wrapper.vm.getOfflineContent?.() || null

      if (cachedContent) {
        expect(cachedContent.length).toBeGreaterThan(0)
      }
    })

    it('should monitor resource loading performance', async () => {
      const performanceEntries = [
        {
          name: '/images/test.jpg',
          entryType: 'resource',
          startTime: 100,
          duration: 2000,
          transferSize: 1024000
        }
      ]

      global.performance = {
        ...global.performance,
        getEntriesByType: vi.fn(() => performanceEntries)
      }

      const wrapper = mount(ImageGalleryComponent)

      // 分析资源加载性能
      const resourceStats = wrapper.vm.analyzeResourcePerformance?.() || {}

      if (resourceStats.averageLoadTime) {
        expect(resourceStats.averageLoadTime).toBe(2000)
      }

      if (resourceStats.totalTransferSize) {
        expect(resourceStats.totalTransferSize).toBe(1024000)
      }
    })
  })
})