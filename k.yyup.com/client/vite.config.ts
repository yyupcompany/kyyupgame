import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { VantResolver } from '@vant/auto-import-resolver'
import { resolve } from 'path'
import { createLogger } from './vite-plugin-logger.js'
import { createFileLogger } from './vite-plugin-file-logger.js'
// import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => {
  // 加载环境变量 - 修复：从client目录加载.env文件
  const env = loadEnv(mode, __dirname, '');

  // 调试环境变量
  console.log('🔧 Vite环境变量调试:');
  console.log('  VITE_API_PROXY_TARGET:', env.VITE_API_PROXY_TARGET);
  console.log('  VITE_DEV_PORT:', env.VITE_DEV_PORT);
  console.log('  VITE_DEV_HOST:', env.VITE_DEV_HOST);

  // 动态配置
  const config = {
    // 开发服务器配置 - 修复为Vite格式
    server: {
      port: Number(env.VITE_DEV_PORT) || 5173,
      host: env.VITE_DEV_HOST || '0.0.0.0',
      hmr: {
        // 🔧 修复：HMR端口跟随服务器端口，避免WebSocket连接错误
        clientPort: Number(env.VITE_DEV_PORT) || 5173,
      },
    },
    // API代理配置 - 🔧 修复：强制使用IPv4地址
    apiProxy: {
      target: env.VITE_API_PROXY_TARGET?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:3000',
      changeOrigin: true,
      secure: false,
      // 不需要rewrite，直接转发到后端的/api路径
    }
  };

  console.log('🔧 最终代理配置:', config.apiProxy);

  return {
  root: process.cwd(), // 确保root指向client目录
  plugins: [
    createLogger(), // 控制台日志插件
    createFileLogger(), // 文件日志插件
    vue({
      template: {
        compilerOptions: {
          whitespace: 'preserve',
        }
      }
    }),
    vueJsx(),
    AutoImport({
      resolvers: [
        ElementPlusResolver(),
        VantResolver()
      ],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: './src/auto-imports.d.ts',
      eslintrc: {
        enabled: false
      }
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: false,
          exclude: ['ElCodeBlock'] // 排除不存在的组件
        }),
        VantResolver({
          exclude: ['DatetimePicker', 'ButtonGroup'] // Vant 4.x 已移除这些组件
        }),
        // 自动导入Element Plus图标组件
        (componentName) => {
          // Element Plus图标组件
          if (componentName.match(/^(Loading|CircleCheck|CircleClose|Tools|Close|Clock)$/)) {
            return {
              name: componentName,
              from: '@element-plus/icons-vue'
            }
          }
        }
      ],
      dts: './src/components.d.ts',
      // 排除命名冲突的组件，改为手动导入
      exclude: [
        // 排除AI目录下的冲突组件
        /src\/components\/ai\/(DataTable|DetailPanel|OperationPanel)\.vue$/,
        // 排除centers目录下的冲突组件
        /src\/components\/centers\/(DataTable|DetailPanel|StatCard)\.vue$/,
        // 排除common目录下的冲突组件
        /src\/components\/common\/(PageLoadingGuard|StatCard|UnifiedIcon)\.vue$/,
        // 排除dialogs目录下的冲突组件
        /src\/components\/dialogs\/(StudentEditDialog)\.vue$/,
      ]
    }),
    // Bundle分析插件 - 仅在分析模式下启用
    // ...(process.env.ANALYZE ? [visualizer({
    //   filename: 'dist/stats.html',
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true,
    //   template: 'treemap' // 可选: 'treemap', 'sunburst', 'network'
    // })] : [])
  ],
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    __VITE_IS_MODERN__: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  server: {
    port: config.server.port,
    host: config.server.host,
    // strictPort: true,  // 🔧 暂时禁用，允许端口自动切换以避免端口冲突
    cors: true,
    hmr: {
      ...config.server.hmr,
      // 🔧 强制HMR端口跟随服务器端口
      protocol: 'ws',
      host: 'localhost',
    },
    // 允许通过自定义域名访问本地开发服务器
    allowedHosts: true,
    // 🔧 禁用HTTP缓存（开发环境）
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    },
    proxy: {
      '/api': {
        ...config.apiProxy,
        // 🔧 修复：不移除/api前缀，直接转发到后端
        // rewrite: (path) => path.replace(/^\/api/, ''), // 注释掉这行
        // 🔧 SSE流式支持：禁用响应缓冲，确保SSE事件立即转发
        ws: true,
        // 🔧 修复：禁用http-proxy的缓冲，确保SSE流式数据立即转发
        proxyTimeout: 0,
        timeout: 0,
        // 🔧 修复：禁用响应压缩，确保SSE事件格式正确
        headers: {
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
        },
        // 🔧 修复：处理SSE流的响应
        onProxyRes: (proxyRes: any, req: any, res: any) => {
          // 对于SSE流，禁用缓冲
          if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
            proxyRes.setEncoding('utf8');
            // 禁用响应缓冲
            res.setHeader('X-Accel-Buffering', 'no');
          }
        }
      },
      // 代理静态文件（音频、视频、图片等） - 🔧 修复：强制使用IPv4地址
      '/uploads': {
        target: env.VITE_API_PROXY_TARGET?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      }
    },
    // 性能优化配置
    fs: {
      strict: false
    },
    // 预热常用文件
    warmup: {
      clientFiles: ['./src/main.ts', './src/App.vue', './src/router/index.ts']
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  // 🔧 开发环境禁用依赖预构建缓存
  optimizeDeps: {
    force: true, // 强制重新预构建依赖
    exclude: [] // 可以排除不需要预构建的依赖
  },
  esbuild: {
    target: 'es2020'
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    // 添加性能优化配置
    target: 'es2020',
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      // 忽略不存在的 Vant 组件样式导入
      onwarn(warning, warn) {
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.message?.includes('vant/es/')) {
          return
        }
        warn(warning)
      },
      output: {
        // 优化代码分割，改善LCP
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // UI框架按需分割
            if (id.includes('element-plus')) return 'element-plus'
            if (id.includes('vue')) return 'vue-vendor'
            if (id.includes('echarts')) return 'charts'
            if (id.includes('@element-plus/icons-vue')) return 'element-icons'
            if (id.includes('vant')) return 'vant-ui'
            if (id.includes('@vant')) return 'vant-ui'
            // 其他大型依赖
            if (id.includes('lodash')) return 'utils'
            if (id.includes('axios')) return 'utils'
            return 'vendor'
          }
          // 业务模块按页面分割
          if (id.includes('src/pages/enrollment')) return 'enrollment-pages'
          if (id.includes('src/pages/dashboard')) return 'dashboard-pages'
          if (id.includes('src/pages/ai')) return 'ai-pages'
          if (id.includes('src/pages/centers')) return 'centers-pages'
          if (id.includes('src/pages/teacher')) return 'teacher-pages'
          if (id.includes('src/pages/parent')) return 'parent-pages'
          if (id.includes('src/pages/student')) return 'student-pages'
          if (id.includes('src/pages/activity')) return 'activity-pages'
          if (id.includes('src/pages/finance')) return 'finance-pages'
          if (id.includes('src/pages/statistics')) return 'statistics-pages'
          if (id.includes('src/pages/principal')) return 'principal-pages'
          if (id.includes('src/pages/system')) return 'system-pages'
          if (id.includes('src/pages/customer')) return 'customer-pages'
          if (id.includes('src/pages/')) return 'other-pages'
          // 路由模块单独分割
          if (id.includes('/router/routes/')) return 'routes-modules'
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        // 优化块分割策略
        compact: true,
        generatedCode: {
          constBindings: true,
          objectShorthand: true
        }
      }
    }
  }
  };
})