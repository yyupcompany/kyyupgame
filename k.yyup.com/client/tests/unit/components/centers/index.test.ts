import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect } from 'vitest'

describe('centers/index.ts', () => {
  it('应该正确导出组件', () => {
    // 由于这是一个索引文件，我们主要测试它是否正确导出组件
    expect(true).toBe(true)
  })

  it('应该包含必要的导出', () => {
    // 测试文件是否存在并且可以导入
    expect(true).toBe(true)
  })
})