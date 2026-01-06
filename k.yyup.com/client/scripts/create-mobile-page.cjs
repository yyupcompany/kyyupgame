#!/usr/bin/env node

/**
 * 移动端页面快速生成工具
 * 自动创建移动端页面模板和路由配置
 */

const fs = require('fs')
const path = require('path')

// 配置
const MOBILE_PAGES_DIR = path.resolve(__dirname, '../src/pages/mobile')
const ROUTES_FILE = path.resolve(__dirname, '../src/router/mobile-routes.ts')

// 页面模板
const PAGE_TEMPLATE = `<template>
  <MobilePage
    title="{{TITLE}}"
    :show-nav-bar="true"
    :show-back="true"
  >
    <!-- 页面内容 -->
    <div class="{{KEBAB_NAME}}-page">
      <van-notice-bar left-icon="volume-o" text="这是{{TITLE}}页面，正在开发中..." />
    </div>

    <!-- 悬浮操作按钮 -->
    <van-back-top right="20" bottom="80" />
  </MobilePage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MobilePage from '../../components/common/MobilePage.vue'
import { showToast } from 'vant'

// 组件逻辑将在此处添加

onMounted(() => {
  console.log('{{TITLE}}页面已加载')
})
</script>

<style lang="scss" scoped>
.{{KEBAB_NAME}}-page {
  padding: 12px;
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
`

// 路由配置模板
const ROUTE_TEMPLATE = `  {
    path: '{{ROUTE_PATH}}',
    name: '{{ROUTE_NAME}}',
    component: () => import('../pages/mobile{{PAGE_PATH}}'),
    meta: {
      title: '{{TITLE}}',
      requiresAuth: true,
      role: {{ROLES}}
    }
  },`

// 解析命令行参数
const args = process.argv.slice(2)
const moduleName = args[0] // centers/teacher-center/parent-center
const pageName = args[1]   // 页面名称（如：ai-billing-center）
const title = args[2] || pageName // 页面标题
const roles = args[3] || "['admin', 'principal', 'teacher']" // 权限角色

if (!moduleName || !pageName) {
  console.log(`
使用方法:
  node create-mobile-page.js <模块名> <页面名> [页面标题] [权限角色]

参数说明:
  模块名: centers | teacher-center | parent-center | activity | enrollment | finance | marketing | system | ai
  页面名: 使用kebab-case命名 (如: ai-billing-center)
  页面标题: 可选，默认为页面名
  权限角色: 可选，默认为['admin', 'principal', 'teacher']

示例:
  node create-mobile-page.js centers ai-billing-center "AI计费中心" "['admin', 'principal']"
  node create-mobile-page.js parent-center communication "家园沟通" "['parent']"
  node create-mobile-page.js teacher-center creative-curriculum "创意课程"
  `)
  process.exit(1)
}

// 验证模块名
const validModules = [
  'centers',
  'teacher-center',
  'parent-center',
  'activity',
  'enrollment',
  'finance',
  'marketing',
  'system',
  'ai'
]

if (!validModules.includes(moduleName)) {
  console.error(`错误: 无效的模块名 "${moduleName}"`)
  console.log(`支持的模块: ${validModules.join(', ')}`)
  process.exit(1)
}

// 生成kebab-case名称
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

// 生成PascalCase名称（用于类名）
function toPascalCase(str) {
  return str
    .replace(/^./, char => char.toUpperCase())
    .replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
}

// 转换为标题格式
function toTitleCase(str) {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

// 验证页面名称格式
if (!pageName.includes('-')) {
  console.error(`错误: 页面名应使用kebab-case命名 (如: ai-billing-center)`)
  process.exit(1)
}

const kebabName = toKebabCase(pageName)
const titleName = title || toTitleCase(kebabName)
const routePath = `/mobile/${moduleName}/${kebabName}`
const routeName = `Mobile${moduleName.split('-').map(toPascalCase).join('')}${toPascalCase(kebabName)}`
const pagePath = `/${moduleName}/${kebabName}/index.vue`
const dirPath = path.join(MOBILE_PAGES_DIR, moduleName, kebabName)

// 检查目录是否已存在
if (fs.existsSync(dirPath)) {
  console.error(`错误: 页面目录已存在: ${dirPath}`)
  process.exit(1)
}

// 创建页面目录
fs.mkdirSync(dirPath, { recursive: true })

// 生成页面文件内容
const pageContent = PAGE_TEMPLATE
  .replace(/{{TITLE}}/g, titleName)
  .replace(/{{KEBAB_NAME}}/g, kebabName)

// 写入页面文件
const indexFilePath = path.join(dirPath, 'index.vue')
fs.writeFileSync(indexFilePath, pageContent, 'utf-8')
console.log(`✅ 已创建页面文件: ${indexFilePath}`)

// 生成路由配置
const routeContent = ROUTE_TEMPLATE
  .replace(/{{ROUTE_PATH}}/g, routePath)
  .replace(/{{ROUTE_NAME}}/g, routeName)
  .replace(/{{PAGE_PATH}}/g, pagePath)
  .replace(/{{TITLE}}/g, titleName)
  .replace(/{{ROLES}}/g, roles)

console.log(`\n📝 路由配置已生成，请添加到 ${ROUTES_FILE}:`)
console.log(routeContent)

// 创建README文件
const readmeContent = `# ${titleName}

## 功能说明
这是${titleName}页面，目前正在开发中。

## 开发任务
- [ ] 实现页面基础布局
- [ ] 添加业务功能
- [ ] 集成API接口
- [ ] 添加单元测试

## 技术栈
- Vue 3 + Composition API
- TypeScript
- Vant 4
- SCSS

## 页面路径
\`${routePath}\`

## 权限要求
${roles}
`

const readmePath = path.join(dirPath, 'README.md')
fs.writeFileSync(readmePath, readmeContent, 'utf-8')
console.log(`✅ 已创建说明文件: ${readmePath}`)

// 更新路由配置文件提示
console.log(`\n📋 后续步骤:`)
console.log(`1. 将路由配置添加到 ${ROUTES_FILE}`)
console.log(`2. 运行 'npm run dev' 启动开发服务器`)
console.log(`3. 访问 http://localhost:5173${routePath} 查看页面`)
console.log(`\n🎉 页面创建完成！`)

/**
 * 输出统计信息
 */
const stats = {
  totalPages: fs.readdirSync(MOBILE_PAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .reduce((acc, dirent) => {
      const modulePath = path.join(MOBILE_PAGES_DIR, dirent.name)
      const pages = fs.readdirSync(modulePath, { withFileTypes: true })
        .filter(d => d.isDirectory()).length
      acc[dirent.name] = pages
      return acc
    }, {})
}

console.log(`\n📊 当前移动端页面统计:`)
Object.entries(stats.totalPages).forEach(([module, count]) => {
  console.log(`  ${module}: ${count}个页面`)
})
