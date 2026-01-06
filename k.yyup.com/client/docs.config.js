/**
 * 文档生成配置文件
 * 用于自动生成组件和API文档
 */

export const docsConfig = {
  // 输出目录
  outputDir: 'docs',
  
  // 组件文档配置
  components: {
    // 扫描目录
    scanDirs: [
      'src/components',
      'src/layouts',
      'src/pages'
    ],
    // 输出文件
    outputFile: 'docs/components.md',
    // 包含的文件类型
    include: ['*.vue', '*.ts', '*.js'],
    // 排除的文件
    exclude: [
      '**/*.test.*',
      '**/*.spec.*',
      '**/node_modules/**'
    ],
    // 文档模板
    template: {
      header: '# 组件文档\n\n本文档自动生成，包含所有可复用组件的详细说明。\n\n',
      componentTemplate: `
## {name}

**文件路径**: \`{path}\`

**描述**: {description}

### Props

{props}

### Events

{events}

### Slots

{slots}

### 使用示例

\`\`\`vue
{example}
\`\`\`

---
`
    }
  },

  // API文档配置
  api: {
    // 扫描目录
    scanDirs: [
      'src/api',
      'src/services'
    ],
    // 输出文件
    outputFile: 'docs/api.md',
    // 包含的文件类型
    include: ['*.ts', '*.js'],
    // 排除的文件
    exclude: [
      '**/*.test.*',
      '**/*.spec.*'
    ],
    // 文档模板
    template: {
      header: '# API文档\n\n本文档自动生成，包含所有API接口的详细说明。\n\n',
      apiTemplate: `
## {name}

**文件路径**: \`{path}\`

**描述**: {description}

### 接口列表

{endpoints}

### 类型定义

{types}

### 使用示例

\`\`\`typescript
{example}
\`\`\`

---
`
    }
  },

  // Composables文档配置
  composables: {
    // 扫描目录
    scanDirs: [
      'src/composables'
    ],
    // 输出文件
    outputFile: 'docs/composables.md',
    // 包含的文件类型
    include: ['*.ts', '*.js'],
    // 文档模板
    template: {
      header: '# Composables文档\n\n本文档自动生成，包含所有可复用逻辑的详细说明。\n\n',
      composableTemplate: `
## {name}

**文件路径**: \`{path}\`

**描述**: {description}

### 参数

{parameters}

### 返回值

{returns}

### 使用示例

\`\`\`typescript
{example}
\`\`\`

---
`
    }
  },

  // 工具函数文档配置
  utils: {
    // 扫描目录
    scanDirs: [
      'src/utils'
    ],
    // 输出文件
    outputFile: 'docs/utils.md',
    // 包含的文件类型
    include: ['*.ts', '*.js'],
    // 文档模板
    template: {
      header: '# 工具函数文档\n\n本文档自动生成，包含所有工具函数的详细说明。\n\n',
      utilTemplate: `
## {name}

**文件路径**: \`{path}\`

**描述**: {description}

### 参数

{parameters}

### 返回值

{returns}

### 使用示例

\`\`\`typescript
{example}
\`\`\`

---
`
    }
  },

  // 类型定义文档配置
  types: {
    // 扫描目录
    scanDirs: [
      'src/types'
    ],
    // 输出文件
    outputFile: 'docs/types.md',
    // 包含的文件类型
    include: ['*.ts', '*.d.ts'],
    // 文档模板
    template: {
      header: '# 类型定义文档\n\n本文档自动生成，包含所有TypeScript类型定义。\n\n',
      typeTemplate: `
## {name}

**文件路径**: \`{path}\`

**描述**: {description}

### 定义

\`\`\`typescript
{definition}
\`\`\`

### 使用示例

\`\`\`typescript
{example}
\`\`\`

---
`
    }
  },

  // 解析配置
  parser: {
    // JSDoc标签
    jsdocTags: [
      '@description',
      '@param',
      '@returns',
      '@example',
      '@since',
      '@deprecated',
      '@see',
      '@author'
    ],
    // Vue组件解析
    vue: {
      // 解析Props
      parseProps: true,
      // 解析Events
      parseEvents: true,
      // 解析Slots
      parseSlots: true,
      // 解析Methods
      parseMethods: true,
      // 解析Computed
      parseComputed: true
    },
    // TypeScript解析
    typescript: {
      // 解析接口
      parseInterfaces: true,
      // 解析类型别名
      parseTypes: true,
      // 解析枚举
      parseEnums: true,
      // 解析类
      parseClasses: true,
      // 解析函数
      parseFunctions: true
    }
  },

  // 生成配置
  generation: {
    // 是否生成目录
    generateToc: true,
    // 是否生成索引
    generateIndex: true,
    // 是否生成搜索
    generateSearch: true,
    // 输出格式
    formats: ['markdown', 'html'],
    // 主题
    theme: 'default'
  }
}

// 文档生成器类
export class DocumentationGenerator {
  constructor(config = docsConfig) {
    this.config = config
  }

  // 生成所有文档
  async generateAll() {
    console.log('🚀 开始生成文档...')
    
    await this.generateComponents()
    await this.generateAPI()
    await this.generateComposables()
    await this.generateUtils()
    await this.generateTypes()
    await this.generateIndex()
    
    console.log('✅ 文档生成完成!')
  }

  // 生成组件文档
  async generateComponents() {
    console.log('📦 生成组件文档...')
    // 实现组件文档生成逻辑
  }

  // 生成API文档
  async generateAPI() {
    console.log('🌐 生成API文档...')
    // 实现API文档生成逻辑
  }

  // 生成Composables文档
  async generateComposables() {
    console.log('🔧 生成Composables文档...')
    // 实现Composables文档生成逻辑
  }

  // 生成工具函数文档
  async generateUtils() {
    console.log('🛠️ 生成工具函数文档...')
    // 实现工具函数文档生成逻辑
  }

  // 生成类型定义文档
  async generateTypes() {
    console.log('📝 生成类型定义文档...')
    // 实现类型定义文档生成逻辑
  }

  // 生成索引文档
  async generateIndex() {
    console.log('📚 生成索引文档...')
    // 实现索引文档生成逻辑
  }
}

export default docsConfig
