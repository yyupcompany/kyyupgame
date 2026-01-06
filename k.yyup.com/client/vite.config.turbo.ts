import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      vue(),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: false, // 禁用类型声明生成以加快构建
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),  // 移除/api前缀
        },
      },
      hmr: {
        overlay: false, // 禁用错误覆盖层以提升性能
      },
    },
    // 激进的依赖优化
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'element-plus',
        'axios',
        'echarts',
        'dayjs',
        '@element-plus/icons-vue',
        'lodash-es',
        'qrcode'
      ],
      esbuildOptions: {
        target: 'es2020',
        supported: {
          'top-level-await': true
        },
        // 使用所有CPU核心
        logLevel: 'error',
      },
      // 强制优化
      force: false,
    },
    esbuild: {
      target: 'es2020',
      treeShaking: true,
      legalComments: 'none',
      // 禁用所有日志以加快速度
      logLevel: 'error',
      // 最小化输出
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
    },
    build: {
      target: 'es2020',
      // 完全禁用压缩大小报告
      reportCompressedSize: false,
      // 增加chunk大小警告阈值
      chunkSizeWarningLimit: 3000,
      // CSS代码分割
      cssCodeSplit: true,
      // 使用esbuild压缩（比terser快20倍）
      minify: 'esbuild',
      // 完全禁用sourcemap
      sourcemap: false,
      // 禁用CSS sourcemap
      cssMinify: 'esbuild',
      rollupOptions: {
        // 最大并行文件操作数（使用所有核心）
        maxParallelFileOps: 50,
        output: {
          // 激进的代码分割策略
          manualChunks(id) {
            // 将node_modules按包分割
            if (id.includes('node_modules')) {
              // Element Plus单独打包
              if (id.includes('element-plus')) {
                return 'element-plus'
              }
              // Vue生态单独打包
              if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
                return 'vue-vendor'
              }
              // 图表库单独打包
              if (id.includes('echarts')) {
                return 'charts'
              }
              // 图标库单独打包
              if (id.includes('@element-plus/icons-vue')) {
                return 'element-icons'
              }
              // 工具库单独打包
              if (id.includes('lodash') || id.includes('dayjs') || id.includes('axios')) {
                return 'utils'
              }
              // 其他第三方库
              return 'vendor'
            }
          },
          // 优化chunk命名
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
        },
        // Rollup性能优化
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
      // 关闭brotli压缩以加快构建
      brotliSize: false,
    },
    // 日志级别设置为error以减少输出
    logLevel: 'error',
    // 清除控制台
    clearScreen: false,
  }
})

