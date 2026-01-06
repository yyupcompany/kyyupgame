import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
      '@/components': resolve(__dirname, 'src/renderer/components'),
      '@/pages': resolve(__dirname, 'src/renderer/pages'),
      '@/stores': resolve(__dirname, 'src/renderer/stores'),
      '@/utils': resolve(__dirname, 'src/renderer/utils'),
      '@/api': resolve(__dirname, 'src/renderer/api')
    }
  }
})