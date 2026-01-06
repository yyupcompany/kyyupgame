/**
 * 执行1:1路由文件映射修复
 * 自动修复路由组件引用，创建缺失文件和路由
 */

const fs = require('fs')
const path = require('path')
const { Perfect1To1RouteMappingChecker } = require('./perfect-1to1-route-mapping-checker.cjs')

class MappingFixer {
  constructor() {
    this.projectRoot = '/home/devbox/project/client'
    this.routesFile = path.join(this.projectRoot, 'src/router/optimized-routes.ts')
    this.pagesDir = path.join(this.projectRoot, 'src/pages')
    this.backupFile = this.routesFile + '.backup-' + Date.now()
  }

  async executeFixes() {
    console.log('🔧 开始执行1:1映射修复')
    console.log('='.repeat(50))
    
    // 创建备份
    console.log('📦 创建路由文件备份...')
    fs.copyFileSync(this.routesFile, this.backupFile)
    console.log(`   ✅ 备份创建: ${path.basename(this.backupFile)}`)
    
    // 获取分析结果
    console.log('\n🔍 重新分析映射状态...')
    const checker = new Perfect1To1RouteMappingChecker()
    const analysis = await checker.runPerfectMappingCheck()
    
    if (analysis.fixPlan.totalActions === 0) {
      console.log('\n🎉 无需修复，已经是完美1:1映射！')
      return
    }
    
    let fixedCount = 0
    
    // 修复路由组件引用
    console.log('\n🔧 修复路由组件引用...')
    for (const fix of analysis.fixPlan.routeComponentFixes) {
      try {
        if (this.fixRouteComponent(fix)) {
          console.log(`   ✅ ${fix.description}`)
          fixedCount++
        } else {
          console.log(`   ❌ 修复失败: ${fix.description}`)
        }
      } catch (error) {
        console.log(`   ❌ 修复错误: ${fix.description} - ${error.message}`)
      }
    }
    
    // 创建缺失文件
    console.log('\n📄 创建缺失文件...')
    for (const create of analysis.fixPlan.missingFilesToCreate) {
      try {
        if (this.createMissingFile(create)) {
          console.log(`   ✅ ${create.description}`)
          fixedCount++
        } else {
          console.log(`   ❌ 创建失败: ${create.description}`)
        }
      } catch (error) {
        console.log(`   ❌ 创建错误: ${create.description} - ${error.message}`)
      }
    }
    
    // 创建缺失路由
    console.log('\n🚏 创建缺失路由...')
    for (const create of analysis.fixPlan.missingRoutesToCreate) {
      try {
        if (this.createMissingRoute(create)) {
          console.log(`   ✅ ${create.description}`)
          fixedCount++
        } else {
          console.log(`   ❌ 创建失败: ${create.description}`)
        }
      } catch (error) {
        console.log(`   ❌ 创建错误: ${create.description} - ${error.message}`)
      }
    }
    
    console.log(`\n📊 修复完成统计:`)
    console.log(`   ✅ 成功修复: ${fixedCount}`)
    console.log(`   ❌ 修复失败: ${analysis.fixPlan.totalActions - fixedCount}`)
    console.log(`   📦 备份文件: ${path.basename(this.backupFile)}`)
    
    // 验证修复效果
    console.log('\n🔍 验证修复效果...')
    const verifyChecker = new Perfect1To1RouteMappingChecker()
    const verifyResult = await verifyChecker.runPerfectMappingCheck()
    
    const improvedRoutes = verifyResult.mappingAnalysis.stats.mappedRoutes
    const improvedFiles = verifyResult.mappingAnalysis.stats.mappedFiles
    const newOverallRate = ((improvedRoutes + improvedFiles) / 
                           (verifyResult.mappingAnalysis.stats.totalRoutes + verifyResult.mappingAnalysis.stats.totalFiles) * 100).toFixed(1)
    
    console.log(`\n📈 修复效果:`)
    console.log(`   🎯 新路由映射率: ${(improvedRoutes / verifyResult.mappingAnalysis.stats.totalRoutes * 100).toFixed(1)}%`)
    console.log(`   🎯 新文件映射率: ${(improvedFiles / verifyResult.mappingAnalysis.stats.totalFiles * 100).toFixed(1)}%`)
    console.log(`   🎯 新整体映射率: ${newOverallRate}%`)
    
    if (verifyResult.fixPlan.totalActions === 0) {
      console.log(`\n🎉 恭喜！已实现完美的1:1路由文件映射！`)
    } else {
      console.log(`\n📋 还需要 ${verifyResult.fixPlan.totalActions} 个修复操作`)
    }
  }

  fixRouteComponent(fix) {
    const routeContent = fs.readFileSync(this.routesFile, 'utf8')
    
    // 查找路由配置块
    const routePattern = new RegExp(`path:\\s*['"\`]${fix.route.path.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}['"\`]`, 'g')
    const matches = [...routeContent.matchAll(routePattern)]
    
    if (matches.length === 0) {
      return false
    }
    
    // 找到路由块的位置
    const match = matches[0]
    const startIndex = match.index
    
    // 找到完整的路由块
    const lines = routeContent.split('\n')
    let targetLine = -1
    let currentPos = 0
    
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = currentPos + lines[i].length + 1
      if (startIndex >= currentPos && startIndex < lineEnd) {
        targetLine = i
        break
      }
      currentPos = lineEnd
    }
    
    if (targetLine === -1) {
      return false
    }
    
    // 查找组件引用行
    let componentLine = -1
    for (let i = targetLine; i < Math.min(targetLine + 20, lines.length); i++) {
      if (lines[i].includes('component:')) {
        componentLine = i
        break
      }
    }
    
    if (componentLine === -1) {
      return false
    }
    
    // 替换组件引用
    const oldLine = lines[componentLine]
    const newLine = oldLine.replace(
      /component:\s*([^,}\n]+)/,
      `component: () => import('${fix.newComponent}')`
    )
    
    if (oldLine === newLine) {
      return false
    }
    
    lines[componentLine] = newLine
    const newContent = lines.join('\n')
    
    fs.writeFileSync(this.routesFile, newContent)
    return true
  }

  createMissingFile(create) {
    const targetDir = path.dirname(create.targetFile)
    
    // 确保目录存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    
    // 生成文件内容
    const componentName = path.basename(create.targetFile, '.vue')
    const content = this.generateVueFileContent(componentName, create.route)
    
    // 创建文件
    fs.writeFileSync(create.targetFile, content)
    
    return fs.existsSync(create.targetFile)
  }

  createMissingRoute(create) {
    const routeContent = fs.readFileSync(this.routesFile, 'utf8')
    
    // 生成路由配置
    const routeConfig = `
      {
        path: '${create.suggestedRoute.path}',
        name: '${create.suggestedRoute.name}',
        component: ${create.suggestedRoute.component},
        meta: {
          title: '${create.suggestedRoute.meta.title}',
          requiresAuth: ${create.suggestedRoute.meta.requiresAuth},
          priority: '${create.suggestedRoute.meta.priority}'
        }
      },`
    
    // 找到合适的插入位置（在最后一个路由后面）
    const lastRouteIndex = routeContent.lastIndexOf('}')
    const beforeLastBrace = routeContent.substring(0, lastRouteIndex)
    const afterLastBrace = routeContent.substring(lastRouteIndex)
    
    // 找到合适的插入点
    const insertIndex = beforeLastBrace.lastIndexOf('},')
    if (insertIndex === -1) {
      return false
    }
    
    const newContent = beforeLastBrace.substring(0, insertIndex + 2) + 
                      routeConfig + 
                      beforeLastBrace.substring(insertIndex + 2) + 
                      afterLastBrace
    
    fs.writeFileSync(this.routesFile, newContent)
    return true
  }

  generateVueFileContent(componentName, route) {
    return `<template>
  <div class="${componentName.toLowerCase()}-container">
    <div class="page-header">
      <h1>${route.name || componentName}</h1>
      <p>页面路径: ${route.path}</p>
    </div>
    
    <div class="page-content">
      <el-card>
        <template #header>
          <span>${componentName} 功能</span>
        </template>
        
        <div class="content-placeholder">
          <el-empty description="页面内容开发中...">
            <el-button type="primary" @click="handleDevelopment">
              开始开发
            </el-button>
          </el-empty>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 页面标题
const pageTitle = '${route.name || componentName}'

// 处理开发按钮点击
const handleDevelopment = () => {
  ElMessage.info('请在此处添加页面具体功能...')
}

// 页面数据
const pageData = ref({
  loading: false,
  data: []
})

// 页面方法
const loadData = async () => {
  pageData.value.loading = true
  try {
    // TODO: 添加数据加载逻辑
    console.log('加载${componentName}数据...')
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    pageData.value.loading = false
  }
}

// 页面初始化
const init = () => {
  loadData()
}

// 页面挂载时初始化
init()
</script>

<style scoped>
.${componentName.toLowerCase()}-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.page-content {
  min-height: 400px;
}

.content-placeholder {
  padding: 40px;
  text-align: center;
}
</style>`
  }
}

// 运行修复
if (require.main === module) {
  const fixer = new MappingFixer()
  fixer.executeFixes()
    .then(() => {
      console.log('\n✅ 1:1映射修复完成!')
    })
    .catch(console.error)
}

module.exports = { MappingFixer }