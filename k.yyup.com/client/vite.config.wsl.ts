import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

// WSL专用优化配置
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          whitespace: 'preserve',
        }
      },
      script: {
        defineModel: true,
        propsDestructure: true
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
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
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
    host: '0.0.0.0',
    cors: true,
    hmr: {
      port: 24678,
      host: 'localhost'
    },
    // WSL专用文件监听优化
    watch: {
      usePolling: true,
      interval: 300, // 增加间隔以减少CPU使用
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/coverage/**',
        '**/.nuxt/**',
        '**/.next/**',
        '**/.vuepress/**'
      ]
    },
    fs: {
      strict: false,
      allow: ['..']
    }
  },
  // WSL高性能优化 (12核 + 16GB配置)
  optimizeDeps: {
    include: [
      'vue', 
      'vue-router', 
      'pinia', 
      'axios', 
      'element-plus', 
      '@element-plus/icons-vue', 
      'echarts',
      '@vueuse/core'
    ],
    exclude: ['@types/node'],
    esbuildOptions: {
      target: 'es2020',
      loader: { '.js': 'jsx' },
      minify: false,
      keepNames: true
    },
    force: process.env.NODE_ENV === 'development'
  },
  esbuild: {
    target: 'es2020',
    // 开发时跳过压缩以提高速度
    minify: false,
    keepNames: true,
    // 减少转换工作
    jsx: 'preserve'
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    // WSL构建优化
    rollupOptions: {
      output: {
        // 手动分包以提高构建效率
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-vendor': ['element-plus', '@element-plus/icons-vue'],
          'chart-vendor': ['echarts'],
          'utils-vendor': ['axios', '@vueuse/core']
        }
      }
    },
    // 并行构建
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // 缓存配置
  cacheDir: 'node_modules/.vite',
  
  // 实验性功能 - 减少重复工作
  experimental: {
    renderBuiltUrl(filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) {
      if (hostType === 'js') {
        return { js: filename }
      }
      return filename
    }
  }
})