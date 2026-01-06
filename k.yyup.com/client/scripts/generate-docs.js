#!/usr/bin/env node

/**
 * 文档生成脚本
 * 自动扫描项目文件并生成文档
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

// 确保docs目录存在
const docsDir = path.join(projectRoot, 'docs')
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true })
}

/**
 * 扫描目录获取文件列表
 */
function scanDirectory(dir, extensions = ['.vue', '.ts', '.js']) {
  const files = []
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir)
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath)
      } else if (stat.isFile()) {
        const ext = path.extname(item)
        if (extensions.includes(ext)) {
          files.push({
            name: path.basename(item, ext),
            path: fullPath,
            relativePath: path.relative(projectRoot, fullPath),
            extension: ext
          })
        }
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    scan(dir)
  }
  
  return files
}

/**
 * 解析Vue组件
 */
function parseVueComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const component = {
    name: path.basename(filePath, '.vue'),
    path: filePath,
    description: '',
    props: [],
    events: [],
    slots: []
  }
  
  // 简单的正则解析（实际项目中应该使用AST解析）
  const propsMatch = content.match(/props:\s*{([^}]+)}/s)
  if (propsMatch) {
    const propsContent = propsMatch[1]
    const propMatches = propsContent.match(/(\w+):\s*{[^}]*}/g)
    if (propMatches) {
      component.props = propMatches.map(prop => {
        const nameMatch = prop.match(/(\w+):/)
        return nameMatch ? nameMatch[1] : ''
      }).filter(Boolean)
    }
  }
  
  // 解析注释中的描述
  const descMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n\s*\*\//)
  if (descMatch) {
    component.description = descMatch[1]
  }
  
  return component
}

/**
 * 解析TypeScript文件
 */
function parseTypeScriptFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const file = {
    name: path.basename(filePath, path.extname(filePath)),
    path: filePath,
    description: '',
    exports: [],
    types: []
  }
  
  // 解析导出函数
  const exportMatches = content.match(/export\s+(function|const|class)\s+(\w+)/g)
  if (exportMatches) {
    file.exports = exportMatches.map(match => {
      const nameMatch = match.match(/export\s+(?:function|const|class)\s+(\w+)/)
      return nameMatch ? nameMatch[1] : ''
    }).filter(Boolean)
  }
  
  // 解析类型定义
  const typeMatches = content.match(/export\s+(interface|type)\s+(\w+)/g)
  if (typeMatches) {
    file.types = typeMatches.map(match => {
      const nameMatch = match.match(/export\s+(?:interface|type)\s+(\w+)/)
      return nameMatch ? nameMatch[1] : ''
    }).filter(Boolean)
  }
  
  // 解析注释中的描述
  const descMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n\s*\*\//)
  if (descMatch) {
    file.description = descMatch[1]
  }
  
  return file
}

/**
 * 生成组件文档
 */
function generateComponentsDocs() {
  console.log('📦 生成组件文档...')
  
  const componentsDir = path.join(projectRoot, 'src/components')
  const files = scanDirectory(componentsDir, ['.vue'])
  
  let markdown = '# 组件文档\n\n本文档自动生成，包含所有可复用组件的详细说明。\n\n'
  markdown += '## 目录\n\n'
  
  // 生成目录
  files.forEach(file => {
    markdown += `- [${file.name}](#${file.name.toLowerCase()})\n`
  })
  
  markdown += '\n---\n\n'
  
  // 生成组件详情
  files.forEach(file => {
    const component = parseVueComponent(file.path)
    markdown += `## ${component.name}\n\n`
    markdown += `**文件路径**: \`${component.path.replace(projectRoot, '.')}\`\n\n`
    
    if (component.description) {
      markdown += `**描述**: ${component.description}\n\n`
    }
    
    if (component.props.length > 0) {
      markdown += '### Props\n\n'
      component.props.forEach(prop => {
        markdown += `- \`${prop}\`\n`
      })
      markdown += '\n'
    }
    
    markdown += '---\n\n'
  })
  
  fs.writeFileSync(path.join(docsDir, 'components.md'), markdown)
  console.log('✅ 组件文档生成完成')
}

/**
 * 生成API文档
 */
function generateAPIDocs() {
  console.log('🌐 生成API文档...')
  
  const apiDir = path.join(projectRoot, 'src/api')
  const files = scanDirectory(apiDir, ['.ts', '.js'])
  
  let markdown = '# API文档\n\n本文档自动生成，包含所有API接口的详细说明。\n\n'
  markdown += '## 目录\n\n'
  
  // 生成目录
  files.forEach(file => {
    markdown += `- [${file.name}](#${file.name.toLowerCase()})\n`
  })
  
  markdown += '\n---\n\n'
  
  // 生成API详情
  files.forEach(file => {
    const apiFile = parseTypeScriptFile(file.path)
    markdown += `## ${apiFile.name}\n\n`
    markdown += `**文件路径**: \`${apiFile.path.replace(projectRoot, '.')}\`\n\n`
    
    if (apiFile.description) {
      markdown += `**描述**: ${apiFile.description}\n\n`
    }
    
    if (apiFile.exports.length > 0) {
      markdown += '### 导出函数\n\n'
      apiFile.exports.forEach(exp => {
        markdown += `- \`${exp}\`\n`
      })
      markdown += '\n'
    }
    
    if (apiFile.types.length > 0) {
      markdown += '### 类型定义\n\n'
      apiFile.types.forEach(type => {
        markdown += `- \`${type}\`\n`
      })
      markdown += '\n'
    }
    
    markdown += '---\n\n'
  })
  
  fs.writeFileSync(path.join(docsDir, 'api.md'), markdown)
  console.log('✅ API文档生成完成')
}

/**
 * 生成Composables文档
 */
function generateComposablesDocs() {
  console.log('🔧 生成Composables文档...')
  
  const composablesDir = path.join(projectRoot, 'src/composables')
  const files = scanDirectory(composablesDir, ['.ts', '.js'])
  
  let markdown = '# Composables文档\n\n本文档自动生成，包含所有可复用逻辑的详细说明。\n\n'
  markdown += '## 目录\n\n'
  
  // 生成目录
  files.forEach(file => {
    markdown += `- [${file.name}](#${file.name.toLowerCase()})\n`
  })
  
  markdown += '\n---\n\n'
  
  // 生成Composables详情
  files.forEach(file => {
    const composable = parseTypeScriptFile(file.path)
    markdown += `## ${composable.name}\n\n`
    markdown += `**文件路径**: \`${composable.path.replace(projectRoot, '.')}\`\n\n`
    
    if (composable.description) {
      markdown += `**描述**: ${composable.description}\n\n`
    }
    
    if (composable.exports.length > 0) {
      markdown += '### 导出函数\n\n'
      composable.exports.forEach(exp => {
        markdown += `- \`${exp}\`\n`
      })
      markdown += '\n'
    }
    
    markdown += '---\n\n'
  })
  
  fs.writeFileSync(path.join(docsDir, 'composables.md'), markdown)
  console.log('✅ Composables文档生成完成')
}

/**
 * 生成主索引文档
 */
function generateIndexDocs() {
  console.log('📚 生成索引文档...')
  
  const indexMarkdown = `# 项目文档

欢迎来到项目文档！本文档自动生成，包含项目的所有技术文档。

## 文档导航

- [组件文档](./components.md) - 所有可复用组件的详细说明
- [API文档](./api.md) - 所有API接口的详细说明  
- [Composables文档](./composables.md) - 所有可复用逻辑的详细说明

## 项目结构

\`\`\`
src/
├── components/     # 可复用组件
├── composables/    # 可复用逻辑
├── api/           # API接口
├── pages/         # 页面组件
├── utils/         # 工具函数
├── types/         # 类型定义
└── styles/        # 样式文件
\`\`\`

## 开发指南

### 组件开发

1. 所有组件应该放在 \`src/components\` 目录下
2. 组件应该有清晰的Props定义和文档注释
3. 组件应该是可复用的

### API开发

1. 所有API接口应该放在 \`src/api\` 目录下
2. API函数应该有清晰的类型定义
3. API函数应该有错误处理

### Composables开发

1. 所有可复用逻辑应该放在 \`src/composables\` 目录下
2. Composables应该有清晰的参数和返回值类型
3. Composables应该是纯函数或响应式的

---

*文档最后更新时间: ${new Date().toLocaleString()}*
`
  
  fs.writeFileSync(path.join(docsDir, 'README.md'), indexMarkdown)
  console.log('✅ 索引文档生成完成')
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始生成项目文档...\n')
  
  generateComponentsDocs()
  generateAPIDocs()
  generateComposablesDocs()
  generateIndexDocs()
  
  console.log('\n🎉 所有文档生成完成!')
  console.log(`📁 文档位置: ${docsDir}`)
}

// 运行脚本
main()
