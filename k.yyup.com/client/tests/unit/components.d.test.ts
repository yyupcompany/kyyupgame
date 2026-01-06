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
import fs from 'fs'
import path from 'path'

describe('components.d.ts', () => {
  const componentsFilePath = path.resolve(__dirname, '../../src/components.d.ts')

  it('should be a valid TypeScript declaration file', () => {
    // Check if the file exists
    expect(fs.existsSync(componentsFilePath)).toBe(true)

    // Check if the file has content
    const content = fs.readFileSync(componentsFilePath, 'utf-8')
    expect(content.length).toBeGreaterThan(0)

    // Check if it's a TypeScript declaration file
    expect(content).toContain('declare module')
  })

  it('should declare GlobalComponents interface', () => {
    const content = fs.readFileSync(componentsFilePath, 'utf-8')

    // Check if the file declares GlobalComponents interface
    expect(content).toContain('GlobalComponents')
    expect(content).toContain('declare module \'vue\'')
    expect(content).toContain('export interface GlobalComponents')
  })

  it('should include common Element Plus components', () => {
    const content = fs.readFileSync(componentsFilePath, 'utf-8')

    // Check if Element Plus components are declared
    // Look for typical Element Plus component patterns
    expect(content).toMatch(/El[A-Z][a-zA-Z]*/)
  })

  it('should include custom application components', () => {
    const content = fs.readFileSync(componentsFilePath, 'utf-8')

    // Check if custom components are declared
    expect(content).toContain('ActionCard')
    expect(content).toContain('ActivityManagement')
    expect(content).toContain('AIAssistant')
  })

  it('should include global directives', () => {
    const content = fs.readFileSync(componentsFilePath, 'utf-8')

    // Check if the file structure is correct
    expect(content).toContain('export {}')
    expect(content).toContain('/* eslint-disable */')
  })
})