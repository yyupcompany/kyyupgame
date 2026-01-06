import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'
import { createLogger } from './vite-plugin-logger.js'
import { createFileLogger } from './vite-plugin-file-logger.js'

// 专门为localhost域名优化的配置
export default defineConfig({
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
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: './src/auto-imports.d.ts',
      eslintrc: {
        enabled: false
      }
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: './src/components.d.ts'
    })
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
    port: 5173,
    strictPort: false,
    host: '0.0.0.0', // 监听所有网络接口
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true
    },
    hmr: {
      port: 24678,
      host: '0.0.0.0',
      clientPort: 24678,
      protocol: 'ws',
      overlay: true,
      timeout: 60000,
      // 专门处理localhost域名的HMR连接
      forceReload: true
    },
    watch: {
      usePolling: true, // 在 WSL 中启用轮询
      interval: 100
    },
    fs: {
      strict: false,
      allow: ['..'] // 允许访问上级目录
    },
    // 开发环境代理API请求到后端
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ''),  // 移除/api前缀
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxy request:', req.method, req.url, '->', proxyReq.getHeader('host') + proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      }
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
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios', 'element-plus'],
    esbuildOptions: {
      target: 'es2020'
    },
    // 强制重新构建依赖
    force: true,
    entries: ['src/main.ts']
  },
  esbuild: {
    target: 'es2020'
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    target: 'es2020',
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // 优化代码分割
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus')) return 'element-plus'
            if (id.includes('vue')) return 'vue-vendor'
            if (id.includes('echarts')) return 'charts'
            if (id.includes('@element-plus/icons-vue')) return 'element-icons'
            return 'vendor'
          }
          if (id.includes('src/pages/enrollment-plan')) return 'enrollment-plan'
          if (id.includes('src/pages/')) return 'pages'
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    }
  }
})