import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacy from '@vitejs/plugin-legacy'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

// 生产环境配置 - 禁用 HMR 和 WebSocket
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
    // ✅ 生产环境旧浏览器兼容：输出 nomodule 降级包，避免部分内置浏览器“白屏/一直加载”
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
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
  // 确保生产环境不会包含 HMR 相关代码
  define: {
    'import.meta.hot': 'undefined',
    'import.meta.env.DEV': 'false',
    'import.meta.env.PROD': 'true',
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
  // 生产环境不需要 server 配置
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios', 'element-plus', '@element-plus/icons-vue', 'echarts'],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  esbuild: {
    target: 'es2020'
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    // 禁用内联样式，避免 CSP 问题
    cssCodeSplit: true,
    // 优化构建输出
    rollupOptions: {
      output: {
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