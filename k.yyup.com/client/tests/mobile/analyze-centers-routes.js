#!/usr/bin/env node

/**
 * Centers 路由分析脚本
 * 分析 routes 配置并检查缺失的组件文件
 */

const fs = require('fs')
const path = require('path')

// 项目根目录
const PROJECT_ROOT = path.join(__dirname, '../../..')
const MOBILE_PAGES_ROOT = path.join(PROJECT_ROOT, 'client/src/pages/mobile/centers')

// 路由文件路径
const ROUTES_FILE = path.join(PROJECT_ROOT, 'client/src/router/mobile/centers-routes.ts')

// 分析结果
const analysis = {
  totalRoutes: 0,
  missingComponents: [],
  missingIndexes: [],
  dynamicRoutes: [],
  routesWithErrorBoundaries: [],
  errors: [],
  timestamp: new Date().toISOString()
}

/**
 * 从路由文件提取组件导入路径
 */
function extractComponentPaths() {
  console.log('📄 正在分析路由文件:', ROUTES_FILE)

  if (!fs.existsSync(ROUTES_FILE)) {
    throw new Error(`路由文件不存在: ${ROUTES_FILE}`)
  }

  const routesContent = fs.readFileSync(ROUTES_FILE, 'utf-8')
  const componentRegex = /component:\s*\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)/g
  const matches = [...routesContent.matchAll(componentRegex)]

  console.log(`找到 ${matches.length} 个组件导入`)

  const components = []
  for (const match of matches) {
    const importPath = match[1]
    // 转换 @/pages/mobile/centers/* 到实际文件路径
    if (importPath.startsWith('@/pages/mobile/centers/')) {
      const relativePath = importPath.replace('@/pages/mobile/centers/', '')
      const fullPath = path.join(MOBILE_PAGES_ROOT, relativePath)
      components.push({
        importPath,
        relativePath,
        fullPath: fullPath.replace('.vue', '') + '.vue',
        exists: false
      })
    }
  }

  return components
}

/**
 * 检查组件文件是否存在
 */
function checkComponentFiles(components) {
  console.log('\n🔍 正在检查组件文件...')

  for (const component of components) {
    component.exists = fs.existsSync(component.fullPath)

    if (!component.exists) {
      analysis.missingComponents.push(component)
      console.log(`  ❌ 缺失: ${component.relativePath}`)
    } else {
      console.log(`  ✅ 存在: ${component.relativePath}`)
    }
  }

  return components
}

/**
 * 提取所有路由配置
 */
function extractRoutes() {
  const routesContent = fs.readFileSync(ROUTES_FILE, 'utf-8')
  const routes = []

  // 提取 path 和 name 信息，使用简单的正则表达式避免多行问题
  const pathRegex = /path:\s*['"]([^'"]+)['"]/g
  const nameRegex = /name:\s*['"]([^'"]+)['"]/g

  const paths = [...routesContent.matchAll(pathRegex)].map(m => m[1])
  const names = [...routesContent.matchAll(nameRegex)].map(m => m[1])

  for (let i = 0; i < Math.min(paths.length, names.length); i++) {
    routes.push({ path: paths[i], name: names[i] })
  }

  return routes
}

/**
 * 识别动态路由
 */
function identifyDynamicRoutes(routes) {
  const dynamicRouteRegex = /:[a-zA-Z_]+\??/

  for (const route of routes) {
    if (dynamicRouteRegex.test(route.path)) {
      analysis.dynamicRoutes.push(route)
    }
  }

  console.log(`\n🔄 识别到 ${analysis.dynamicRoutes.length} 个动态路由:`)
  analysis.dynamicRoutes.forEach(route => {
    console.log(`  - ${route.path} (name: ${route.name})`)
  })
}

/**
 * 检查 index.vue 文件
 */
function checkIndexFiles() {
  const centers = fs.readdirSync(MOBILE_PAGES_ROOT, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  console.log(`\n📁 检查目录下的 index.vue 文件 (共 ${centers.length} 个中心):`)

  for (const center of centers) {
    const indexPath = path.join(MOBILE_PAGES_ROOT, center, 'index.vue')
    const exists = fs.existsSync(indexPath)

    if (exists) {
      console.log(`  ✅ ${center}/index.vue`)
    } else {
      analysis.missingIndexes.push(center)
      console.log(`  ❌ ${center}/index.vue 缺失`)
    }
  }
}

/**
 * 生成错误边界建议
 */
function generateErrorBoundarySuggestions() {
  console.log('\n🔧 生成错误边界建议...')

  // 生成路由配置建议
  for (const missing of analysis.missingComponents) {
    const routePath = missing.relativePath.replace('/index.vue', '')
    const routeConfig = `{
  path: '${routePath}',
  component: () => import('${missing.importPath}')
    .catch(() => import('@/pages/mobile/centers/Placeholder.vue')),
  meta: {
    title: '${path.basename(routePath).replace(/-/g, ' ')}',
    roles: ['admin', 'principal', 'teacher']
  }
}`

    const suggestion = {
      route: routePath,
      suggestion: routeConfig,
      missingFile: missing.fullPath
    }
    analysis.routesWithErrorBoundaries.push(suggestion)
  }
}

/**
 * 生成修复脚本
 */
function generateFixScript() {
  const scriptContent = `#!/bin/bash
# Centers 缺失组件修复脚本
# 生成时间: ${analysis.timestamp}

cd ${MOBILE_PAGES_ROOT}

# 创建占位组件
if [ ! -f "Placeholder.vue" ]; then
cat > Placeholder.vue << 'EOF'
<template>
  <div class="mobile-placeholder">
    <div class="header">
      <van-nav-bar
        :title="$route.meta.title || '页面'"
        left-arrow
        @click-left="$router.back()"
      />
    </div>
    <div class="content">
      <van-empty description="功能开发中，敬请期待" />
      <div style="padding: 20px;">
        <van-button type="primary" @click="$router.back()" block>
          返回
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.mobile-placeholder {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  padding: 20px 0;
}
</style>
EOF
echo "✅ 创建 Placeholder.vue"
fi

# 创建缺失的 index.vue 文件
create_missing_files() {
  local dir=$1
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    echo "✅ 创建目录: $dir"
  fi

  if [ ! -f "$dir/index.vue" ]; then
    cat > "$dir/index.vue" << 'EOF'
<template>
  <div class="mobile-center">
    <div class="header">
      <van-nav-bar
        :title="$route.meta.title || '中心页面'"
        left-arrow
        @click-left="$router.back()"
      />
    </div>
    <div class="content">
      <van-empty description="功能开发中，敬请期待" />
      <div style="padding: 20px;">
        <van-button type="primary" @click="$router.back()" block>
          返回
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.mobile-center {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  padding: 20px 0;
}
</style>
EOF
    echo "✅ 创建 $dir/index.vue"
  fi
}

# 根据分析结果创建缺失文件
$([[ ${analysis.missingIndexes.join(' ')} ]] && echo "# 缺失的 centers:")
${analysis.missingIndexes.map(center => `create_missing_files "${center}"`).join('\n')}

echo "\n🎉 修复完成！"
echo "请运行测试验证: npx playwright test mcp-centers-debug.spec.ts"
`

  const scriptPath = path.join(__dirname, 'fix-centers-missing-files.sh')
  fs.writeFileSync(scriptPath, scriptContent)
  fs.chmodSync(scriptPath, '755')

  console.log(`\n📄 修复脚本已生成: ${scriptPath}`)
}

/**
 * 主执行函数
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('   Centers 路由和组件分析工具')
  console.log('═══════════════════════════════════════════════════════════\n')

  try {
    // 1. 提取组件路径
    const components = extractComponentPaths()
    analysis.totalRoutes = components.length

    // 2. 检查组件文件
    checkComponentFiles(components)

    // 3. 提取并检查路由
    const routes = extractRoutes()
    identifyDynamicRoutes(routes)

    // 4. 检查 index 文件
    checkIndexFiles()

    // 5. 生成错误边界建议
    generateErrorBoundarySuggestions()

    // 6. 生成修复脚本
    if (analysis.missingComponents.length > 0 || analysis.missingIndexes.length > 0) {
      generateFixScript()
    }

    // 7. 输出总结
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('   分析完成')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`总路由数: ${analysis.totalRoutes}`)
    console.log(`缺失组件: ${analysis.missingComponents.length}`)
    console.log(`缺失索引: ${analysis.missingIndexes.length}`)
    console.log(`动态路由: ${analysis.dynamicRoutes.length}`)
    console.log('═══════════════════════════════════════════════════════════')

    // 8. 保存分析报告
    const reportPath = path.join(__dirname, '../../playwright-report/complete/CENTERS_ROUTE_ANALYSIS.json')
    const reportDir = path.dirname(reportPath)

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2))
    console.log(`\n📊 分析报告已保存: ${reportPath}`)

  } catch (error) {
    console.error('❌ 分析失败:', error.message)
    analysis.errors.push(error.message)
  }
}

// 执行
main().catch(console.error)
