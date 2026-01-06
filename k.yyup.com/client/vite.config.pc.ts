/**
 * PC端生产环境构建配置
 * 为桌面端部署优化的Vite配置
 */

import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  mode: 'production',

  // 插件配置
  plugins: [
    vue(),
  ],

  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@api': resolve(__dirname, 'src/api'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@assets': resolve(__dirname, 'src/assets'),
    }
  },

  // 构建优化
  build: {
    // 输出目录
    outDir: 'dist-pc',

    // 静态资源目录
    assetsDir: 'static',

    // 生成 source map
    sourcemap: false,

    // 构建报告
    reportCompressedSize: true,

    // 代码压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      mangle: {
        safari10: true
      }
    },

    // 分包策略
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: {
          // Vue生态系统
          'vue-vendor': ['vue', 'vue-router', 'pinia'],

          // UI组件库
          'ui-vendor': ['element-plus', '@element-plus/icons-vue', 'antd'],

          // 工具库
          'utils-vendor': ['axios', 'date-fns', 'dayjs', 'lodash-es'],

          // 图表库
          'chart-vendor': ['echarts'],

          // 业务模块
          'modules-pages': [
            './src/pages/dashboard/index.vue',
            './src/pages/user-management/index.vue',
            './src/pages/enrollment-management/index.vue'
          ],
          'modules-centers': [
            './src/pages/centers/CustomerPoolCenter.vue',
            './src/pages/centers/MarketingCenter.vue',
            './src/pages/centers/DocumentCenter.vue'
          ],
          'modules-ai': [
            './src/components/ai-assistant/AIAssistantFullPage.vue',
            './src/components/ai/AIChatContainer.vue'
          ]
        },

        // 文件命名
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'vue-vendor') return 'static/js/vue.[hash].js'
          if (chunkInfo.name === 'ui-vendor') return 'static/js/ui.[hash].js'
          if (chunkInfo.name === 'utils-vendor') return 'static/js/utils.[hash].js'
          if (chunkInfo.name === 'chart-vendor') return 'static/js/charts.[hash].js'
          if (chunkInfo.name?.startsWith('modules-')) return 'static/js/modules/[name].[hash].js'
          return 'static/js/[name].[hash].js'
        },

        entryFileNames: 'static/js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'static/css/[name].[hash][extname]'
          if (assetInfo.name?.match(/\.(png|jpe?g|gif|svg|webp|ico)$/)) return 'static/images/[name].[hash][extname]'
          if (assetInfo.name?.match(/\.(woff2?|eot|ttf|otf)$/)) return 'static/fonts/[name].[hash][extname]'
          return 'static/assets/[name].[hash][extname]'
        }
      }
    },

    // 代码分割
    target: 'es2015',

    // 块大小限制
    chunkSizeWarningLimit: 1000,

    // 构建性能
    maxParallelFileOps: 5,

    // 内存限制
    commonjsOptions: {
      include: [/node_modules/]
    }
  },

  // 环境变量
  define: {
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
  },

  // CSS配置
  css: {
    // CSS代码分割
    devSourcemap: false,

    // PostCSS配置
    postcss: {
      plugins: [
        // 可以添加移动端适配等插件
      ]
    },

    // CSS预处理器配置
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },

  // 服务器配置（预览）
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,

    // 代理配置（预览时使用）
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },

  // 预览服务器
  preview: {
    host: '0.0.0.0',
    port: 5175,
    strictPort: true,

    // 静态文件处理
    cors: true
  },

  // 依赖优化
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      'axios',
      'date-fns'
    ],
    exclude: []
  },

  // ESBuild配置
  esbuild: {
    target: 'es2015',
    drop: ['console', 'debugger'],
    legalComments: 'none'
  }
})