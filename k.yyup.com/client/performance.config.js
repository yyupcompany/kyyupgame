/**
 * 性能优化配置文件
 * 用于配置各种性能优化策略
 */

export const performanceConfig = {
  // 代码分割配置
  codeSplitting: {
    // 第三方库分割
    vendor: {
      'vue-vendor': ['vue', 'vue-router', 'pinia'],
      'element-plus': ['element-plus', '@element-plus/icons-vue'],
      'charts': ['echarts', 'chart.js'],
      'utils': ['lodash-es', 'dayjs', 'axios'],
    },
    // 页面级分割
    pages: {
      'enrollment-plan': 'src/pages/enrollment-plan',
      'ai-business': 'src/pages/ai-business',
      'center': 'src/pages/center',
      'expert-team': 'src/pages/expert-team',
    },
    // 组件级分割
    components: {
      'charts-components': 'src/components/charts',
      'form-components': 'src/components/form',
      'table-components': 'src/components/table',
    }
  },

  // 预加载配置
  preload: {
    // 关键资源预加载
    critical: [
      'src/main.ts',
      'src/App.vue',
      'src/router/index.ts',
      'src/stores/index.ts'
    ],
    // 路由预加载
    routes: [
      'src/pages/center/index.vue',
      'src/pages/enrollment-plan/index.vue'
    ]
  },

  // 缓存配置
  cache: {
    // 长期缓存的资源
    longTerm: [
      'vendor',
      'vue-vendor',
      'element-plus',
      'charts'
    ],
    // 短期缓存的资源
    shortTerm: [
      'pages',
      'components'
    ]
  },

  // 压缩配置
  compression: {
    // 启用gzip压缩
    gzip: true,
    // 启用brotli压缩
    brotli: true,
    // 压缩阈值（字节）
    threshold: 1024,
    // 压缩级别
    level: 6
  },

  // 图片优化配置
  images: {
    // 支持的格式
    formats: ['webp', 'avif', 'jpg', 'png'],
    // 质量设置
    quality: {
      webp: 80,
      avif: 75,
      jpg: 85,
      png: 90
    },
    // 尺寸优化
    sizes: [320, 640, 768, 1024, 1280, 1920],
    // 懒加载
    lazyLoading: true
  },

  // CSS优化配置
  css: {
    // 启用CSS代码分割
    codeSplit: true,
    // 移除未使用的CSS
    purge: true,
    // 压缩CSS
    minify: true,
    // 内联关键CSS
    inlineCritical: true
  },

  // JavaScript优化配置
  javascript: {
    // 启用Tree Shaking
    treeShaking: true,
    // 代码压缩
    minify: 'esbuild',
    // 移除console
    removeConsole: process.env.NODE_ENV === 'production',
    // 移除debugger
    removeDebugger: process.env.NODE_ENV === 'production'
  },

  // 网络优化配置
  network: {
    // HTTP/2 Server Push
    http2Push: true,
    // 资源预连接
    preconnect: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ],
    // DNS预解析
    dnsPrefetch: [
      'https://api.example.com'
    ]
  },

  // 监控配置
  monitoring: {
    // 性能监控
    performance: true,
    // 错误监控
    errors: true,
    // 用户体验监控
    userExperience: true,
    // 核心Web指标
    coreWebVitals: {
      LCP: 2.5, // Largest Contentful Paint (秒)
      FID: 100, // First Input Delay (毫秒)
      CLS: 0.1  // Cumulative Layout Shift
    }
  },

  // 开发环境优化
  development: {
    // 热更新优化
    hmr: {
      port: 24678,
      overlay: true
    },
    // 构建缓存
    cache: true,
    // 源码映射
    sourcemap: true
  },

  // 生产环境优化
  production: {
    // 构建缓存
    cache: true,
    // 源码映射
    sourcemap: false,
    // 文件名哈希
    hash: true,
    // 资源内联阈值
    inlineThreshold: 4096
  }
}

// 获取当前环境的配置
export function getPerformanceConfig(env = 'development') {
  const baseConfig = performanceConfig
  const envConfig = baseConfig[env] || {}
  
  return {
    ...baseConfig,
    ...envConfig
  }
}

// 性能预算配置
export const performanceBudget = {
  // 资源大小限制
  assets: {
    // JavaScript包大小限制（KB）
    javascript: {
      initial: 200,    // 初始包
      async: 100,      // 异步包
      vendor: 500      // 第三方库
    },
    // CSS文件大小限制（KB）
    css: {
      initial: 50,     // 初始CSS
      async: 30        // 异步CSS
    },
    // 图片大小限制（KB）
    images: {
      critical: 100,   // 关键图片
      lazy: 200        // 懒加载图片
    }
  },
  
  // 性能指标限制
  metrics: {
    // 首屏加载时间（秒）
    firstContentfulPaint: 1.5,
    // 最大内容绘制时间（秒）
    largestContentfulPaint: 2.5,
    // 首次输入延迟（毫秒）
    firstInputDelay: 100,
    // 累积布局偏移
    cumulativeLayoutShift: 0.1
  },
  
  // 网络条件
  network: {
    // 3G网络下的加载时间限制（秒）
    slow3G: 5,
    // 4G网络下的加载时间限制（秒）
    fast4G: 3
  }
}

export default performanceConfig
