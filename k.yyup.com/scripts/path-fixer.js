#!/usr/bin/env node

/**
 * 智能路径修复工具
 * 自动修复测试文件中的导入路径问题
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

class PathFixer {
  constructor() {
    this.clientDir = path.join(__dirname, '../client/src')
    this.generatedTestsDir = path.join(__dirname, '../generated-tests')
    this.vueComponentMap = new Map()
    this.fileIndex = new Map()
  }

  /**
   * 索引所有Vue组件和文件
   */
  indexFiles() {
    console.log('📁 索引Vue组件和文件...')

    // 索引Vue组件
    const vueFiles = glob.sync('**/*.vue', {
      cwd: this.clientDir,
      absolute: true
    })

    vueFiles.forEach(file => {
      const relativePath = path.relative(this.clientDir, file)
      const componentName = path.basename(file, '.vue')

      // 存储多个可能的路径
      if (!this.vueComponentMap.has(componentName)) {
        this.vueComponentMap.set(componentName, [])
      }
      this.vueComponentMap.get(componentName).push(relativePath)

      // 按路径前缀索引
      const pathParts = relativePath.split('/')
      for (let i = 0; i < pathParts.length - 1; i++) {
        const partialPath = pathParts.slice(i).join('/')
        if (partialPath.endsWith(`${componentName}.vue`)) {
          if (!this.vueComponentMap.has(partialPath)) {
            this.vueComponentMap.set(partialPath, [])
          }
          this.vueComponentMap.get(partialPath).push(relativePath)
        }
      }
    })

    // 索引其他文件
    const allFiles = glob.sync('**/*.{ts,js,tsx,jsx}', {
      cwd: this.clientDir,
      absolute: true
    })

    allFiles.forEach(file => {
      const relativePath = path.relative(this.clientDir, file)
      const fileName = path.basename(file, path.extname(file))

      this.fileIndex.set(fileName, relativePath)
      this.fileIndex.set(relativePath, relativePath)
    })

    console.log(`✅ 索引完成: ${this.vueComponentMap.size} 个Vue组件, ${this.fileIndex.size} 个其他文件`)
  }

  /**
   * 查找最佳匹配的文件路径
   */
  findBestMatch(targetPath) {
    const componentName = path.basename(targetPath, '.vue')

    // 直接匹配
    if (this.vueComponentMap.has(targetPath)) {
      const matches = this.vueComponentMap.get(targetPath)
      return matches.length > 0 ? matches[0] : null
    }

    // 组件名匹配
    if (this.vueComponentMap.has(componentName)) {
      const matches = this.vueComponentMap.get(componentName)
      if (matches.length === 1) {
        return matches[0]
      }

      // 多个匹配时，选择最合适的
      if (matches.length > 1) {
        // 优先选择components目录下的
        const componentMatch = matches.find(match => match.includes('components/'))
        if (componentMatch) return componentMatch

        // 其次选择pages目录下的
        const pageMatch = matches.find(match => match.includes('pages/'))
        if (pageMatch) return pageMatch

        // 否则返回第一个
        return matches[0]
      }
    }

    // 模糊匹配
    for (const [key, matches] of this.vueComponentMap.entries()) {
      if (key.toLowerCase().includes(componentName.toLowerCase()) ||
          componentName.toLowerCase().includes(key.toLowerCase())) {
        if (matches.length > 0) {
          return matches[0]
        }
      }
    }

    return null
  }

  /**
   * 修复单个测试文件
   */
  fixTestFile(testFile) {
    let content = fs.readFileSync(testFile, 'utf8')
    let hasChanges = false

    // 修复导入路径
    const importRegex = /import\s+\w+\s+from\s+['"]@\/([^'"]+)['"]/g
    let match

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1]
      let fixedPath = null

      // 检查是否是Vue组件
      if (importPath.endsWith('.vue')) {
        fixedPath = this.findBestMatch(importPath)
      } else {
        // 检查是否是其他文件
        if (this.fileIndex.has(importPath)) {
          fixedPath = this.fileIndex.get(importPath)
        } else {
          // 尝试文件名匹配
          const fileName = path.basename(importPath)
          if (this.fileIndex.has(fileName)) {
            fixedPath = this.fileIndex.get(fileName)
          }
        }
      }

      if (fixedPath) {
        // 移除文件扩展名
        const importPathWithoutExt = fixedPath.replace(/\.(vue|ts|js|tsx|jsx)$/, '')
        content = content.replace(
          new RegExp(`from '@/${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g'),
          `from '@/${importPathWithoutExt}'`
        )
        hasChanges = true
        console.log(`  修复: ${importPath} -> ${importPathWithoutExt}`)
      }
    }

    // 修复Mock路径
    const mockPathRegex = /vi\.mock\(['"]@\/([^'"]+)['"]/g
    while ((match = mockPathRegex.exec(content)) !== null) {
      const mockPath = match[1]
      let fixedPath = null

      if (this.fileIndex.has(mockPath)) {
        fixedPath = this.fileIndex.get(mockPath)
      } else {
        const fileName = path.basename(mockPath)
        if (this.fileIndex.has(fileName)) {
          fixedPath = this.fileIndex.get(fileName)
        }
      }

      if (fixedPath) {
        const mockPathWithoutExt = fixedPath.replace(/\.(vue|ts|js|tsx|jsx)$/, '')
        content = content.replace(
          new RegExp(`vi\\.mock\\(['"@/${mockPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']\\)`, 'g'),
          `vi.mock('@/stores/user')`
        )
        hasChanges = true
        console.log(`  修复Mock: ${mockPath} -> user store`)
      }
    }

    // 修复常见的选择器
    content = this.fixSelectors(content)

    // 修复组件挂载
    content = this.fixComponentMount(content)

    // 添加缺失的导入
    if (!content.includes('import { expectNoConsoleErrors }')) {
      content = content.replace(
        /^/,
        "import { expectNoConsoleErrors } from '@/tests/utils/strict-test-validation'\n"
      )
      hasChanges = true
    }

    if (hasChanges) {
      fs.writeFileSync(testFile, content, 'utf8')
      return true
    }

    return false
  }

  /**
   * 修复CSS选择器
   */
  fixSelectors(content) {
    // 替换通用选择器
    const selectorReplacements = [
      {
        from: /wrapper\.find\('\.test-component'\)/g,
        to: 'wrapper.find(\'[data-test-component]\')'
      },
      {
        from: /wrapper\.find\('\.ComponentName'\)/g,
        to: 'wrapper.find(\'[data-test-component]\')'
      },
      {
        from: /wrapper\.find\('\.componentname'\)/g,
        to: 'wrapper.find(\'[data-test-component]\')'
      }
    ]

    let hasChanges = false
    selectorReplacements.forEach(replacement => {
      if (replacement.from.test(content)) {
        content = content.replace(replacement.from, replacement.to)
        hasChanges = true
      }
    })

    return content
  }

  /**
   * 修复组件挂载
   */
  fixComponentMount(content) {
    let hasChanges = false

    // 修复常见的挂载选项问题
    if (content.includes('stubs:') && !content.includes('el-button: true')) {
      content = content.replace(
        /stubs:\s*\{[^}]*\}/,
        `stubs: {
          'el-button': true,
          'el-input': true,
          'el-form': true,
          'el-form-item': true,
          'el-dialog': true,
          'el-table': true,
          'el-table-column': true
        }`
      )
      hasChanges = true
    }

    // 添加缺失的stubs
    if (!content.includes('stubs:') && content.includes('mount(')) {
      content = content.replace(
        /mount\(([^,]+),\s*\{[^}]*\}/,
        'mount($1, { global: { plugins: [ElementPlus], stubs: { \'el-button\': true, \'el-input\': true, \'el-form\': true, \'el-form-item\': true, \'el-dialog\': true, \'el-table\': true, \'el-table-column\': true } } }'
      )
      hasChanges = true
    }

    return content
  }

  /**
   * 修复所有测试文件
   */
  async fixAllTests() {
    console.log('🔧 开始修复所有测试文件...')

    if (!fs.existsSync(this.generatedTestsDir)) {
      console.log('❌ 未找到生成的测试目录')
      return
    }

    const testFiles = glob.sync('**/*.test.ts', {
      cwd: this.generatedTestsDir,
      absolute: true
    })

    console.log(`📝 找到 ${testFiles.length} 个测试文件`)

    let fixedCount = 0
    let failedCount = 0

    for (const testFile of testFiles) {
      try {
        const relativePath = path.relative(process.cwd(), testFile)
        console.log(`\n🔍 修复: ${relativePath}`)

        if (this.fixTestFile(testFile)) {
          fixedCount++
          console.log(`✅ 已修复: ${path.basename(testFile)}`)
        } else {
          console.log(`ℹ️  无需修复: ${path.basename(testFile)}`)
        }
      } catch (error) {
        failedCount++
        console.log(`❌ 修复失败: ${path.basename(testFile)} - ${error.message}`)
      }
    }

    console.log(`\n📊 修复完成:`)
    console.log(`已修复: ${fixedCount} 个文件`)
    console.log(`修复失败: ${failedCount} 个文件`)

    return { fixedCount, failedCount }
  }

  /**
   * 验证修复结果
   */
  async verifyFixes() {
    console.log('\n🔍 验证修复结果...')

    const testValidator = require('./test-validator')
    const validator = new testValidator()

    const result = await validator.validateTests()

    console.log(`\n📋 验证结果:`)
    console.log(`有效测试: ${result.valid}`)
    console.log(`无效测试: ${result.invalid}`)

    if (result.invalid === 0) {
      console.log('🎉 所有测试文件修复成功!')
    } else {
      console.log('⚠️  仍有部分文件需要手动修复')
    }

    return result
  }

  /**
   * 运行完整修复流程
   */
  async run() {
    console.log('🚀 开始智能路径修复...\n')

    // 索引文件
    this.indexFiles()

    // 修复测试文件
    await this.fixAllTests()

    // 验证修复结果
    await this.verifyFixes()

    console.log('\n✨ 路径修复完成!')
  }
}

// CLI入口
if (require.main === module) {
  const fixer = new PathFixer()

  fixer.run().then(() => {
    console.log('\n🎉 修复流程完成!')
    process.exit(0)
  }).catch(error => {
    console.error('❌ 修复失败:', error)
    process.exit(1)
  })
}

module.exports = PathFixer