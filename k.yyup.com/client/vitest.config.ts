import { defineConfig } from 'vitest/config'
import { baseConfig } from '../test-config/vitest.config.base'
import { resolve } from 'path'

export default defineConfig({
  ...baseConfig,

  // 客户端特定配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@test': resolve(__dirname, 'tests'),
      '@shared': resolve(__dirname, '../shared')
    }
  },

  test: {
    ...baseConfig.test,

    // 客户端特定的测试超时（保持原有的长超时）
    testTimeout: 600000, // 10分钟超时，适用于复杂的前端测试

    // 客户端特定的覆盖率配置
    coverage: {
      ...baseConfig.test?.coverage,
      include: [
        'src/**/*.{vue,ts,js}',
        '!src/**/*.d.ts',
        '!src/**/*.test.{ts,js}',
        '!src/**/*.spec.{ts,js}'
      ],
      exclude: [
        'src/main.ts',
        'src/types/**',
        'src/mock/**',
        'src/**/*.stories.{ts,js}',
        'src/**/*.config.{ts,js}',
        'node_modules/**',
        'dist/**',
        'build/**'
      ]
    }
  }
})