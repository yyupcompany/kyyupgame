/**
 * Route Uncomment Tool
 * 路由取消注释工具 - 批量取消注释被注释的路由
 */

const fs = require('fs')
const path = require('path')

class RouteUncommentTool {
  constructor() {
    this.projectRoot = '/home/devbox/project/client'
    this.routesFile = path.join(this.projectRoot, 'src/router/optimized-routes.ts')
    this.pagesDir = path.join(this.projectRoot, 'src/pages')
    this.backupFile = this.routesFile + '.backup-' + Date.now()
  }

  async analyzeAndUncomment() {
    console.log('🔍 开始分析被注释的路由...')
    console.log('📋 准备批量取消注释存在组件的路由...\n')
    
    // 1. 备份原文件
    console.log('📋 Step 1: 备份原文件...')
    await this.backupOriginalFile()
    
    // 2. 分析被注释的路由
    console.log('\n📋 Step 2: 分析被注释的路由...')
    const analysis = await this.analyzeCommentedRoutes()
    
    // 3. 检查组件存在性
    console.log('\n📋 Step 3: 检查组件文件存在性...')
    const componentCheck = await this.checkComponentExistence(analysis)
    
    // 4. 生成取消注释计划
    console.log('\n📋 Step 4: 生成取消注释计划...')
    const plan = await this.generateUncommentPlan(componentCheck)
    
    // 5. 执行取消注释（如果用户确认）
    console.log('\n📋 Step 5: 显示取消注释计划...')
    this.showPlan(plan)
    
    return plan
  }

  async backupOriginalFile() {
    try {
      const content = fs.readFileSync(this.routesFile, 'utf8')
      fs.writeFileSync(this.backupFile, content)
      console.log(`   ✅ 原文件已备份到: ${this.backupFile}`)
    } catch (error) {
      console.log(`   ❌ 备份失败: ${error.message}`)
      throw error
    }
  }

  async analyzeCommentedRoutes() {
    try {
      const content = fs.readFileSync(this.routesFile, 'utf8')
      const lines = content.split('\n')
      
      const commentedBlocks = []
      let currentBlock = null
      let inCommentedBlock = false
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const trimmed = line.trim()
        
        // 检测注释块开始
        if (trimmed.startsWith('//') && (trimmed.includes('path:') || trimmed.includes('name:'))) {
          if (!inCommentedBlock) {
            currentBlock = {
              startLine: i,
              endLine: i,
              lines: [line],
              pathMatch: null,
              nameMatch: null,
              componentMatch: null
            }
            inCommentedBlock = true
          } else {
            currentBlock.lines.push(line)
            currentBlock.endLine = i
          }
          
          // 提取路径信息
          const pathMatch = trimmed.match(/path\s*:\s*['"](\/[^'"]*)['"]/);
          if (pathMatch) {
            currentBlock.pathMatch = pathMatch[1]
          }
          
          // 提取名称信息
          const nameMatch = trimmed.match(/name\s*:\s*['"]([^'"]*)['"]/);
          if (nameMatch) {
            currentBlock.nameMatch = nameMatch[1]
          }
          
          // 提取组件信息
          const componentMatch = trimmed.match(/component\s*:\s*(\w+)/);
          if (componentMatch) {
            currentBlock.componentMatch = componentMatch[1]
          }
          
        } else if (inCommentedBlock && (trimmed.startsWith('//') || trimmed === '')) {
          // 继续注释块
          currentBlock.lines.push(line)
          currentBlock.endLine = i
          
          // 检查是否有组件信息
          if (!currentBlock.componentMatch) {
            const componentMatch = trimmed.match(/component\s*:\s*(\w+)/);
            if (componentMatch) {
              currentBlock.componentMatch = componentMatch[1]
            }
          }
          
        } else if (inCommentedBlock) {
          // 注释块结束
          if (currentBlock.pathMatch || currentBlock.nameMatch) {
            commentedBlocks.push(currentBlock)
          }
          currentBlock = null
          inCommentedBlock = false
        }
      }
      
      // 处理文件末尾的注释块
      if (inCommentedBlock && currentBlock && (currentBlock.pathMatch || currentBlock.nameMatch)) {
        commentedBlocks.push(currentBlock)
      }
      
      console.log(`   ✅ 发现 ${commentedBlocks.length} 个被注释的路由块`)
      
      // 显示前10个被注释的路由
      console.log('\n🔗 被注释的路由 (前10个):')
      commentedBlocks.slice(0, 10).forEach((block, index) => {
        console.log(`   ${(index + 1).toString().padStart(2)}: ${block.pathMatch || block.nameMatch || 'Unknown'}`)
      })
      
      if (commentedBlocks.length > 10) {
        console.log(`   ... 还有 ${commentedBlocks.length - 10} 个被注释的路由`)
      }
      
      return commentedBlocks
      
    } catch (error) {
      console.log(`   ❌ 分析失败: ${error.message}`)
      return []
    }
  }

  async checkComponentExistence(commentedBlocks) {
    const results = []
    
    for (const block of commentedBlocks) {
      const result = {
        block: block,
        componentExists: false,
        componentPath: null,
        recommendUncomment: false
      }
      
      if (block.componentMatch) {
        // 查找组件导入路径
        const componentPath = await this.findComponentImportPath(block.componentMatch)
        if (componentPath) {
          result.componentPath = componentPath
          result.componentExists = this.checkComponentFileExists(componentPath)
          result.recommendUncomment = result.componentExists
        }
      }
      
      results.push(result)
    }
    
    const existingComponents = results.filter(r => r.componentExists).length
    const missingComponents = results.filter(r => !r.componentExists && r.componentPath).length
    const noComponentInfo = results.filter(r => !r.componentPath).length
    
    console.log(`   📊 组件检查结果:`)
    console.log(`   ✅ 组件存在: ${existingComponents} 个`)
    console.log(`   ❌ 组件缺失: ${missingComponents} 个`)
    console.log(`   ⚠️ 无组件信息: ${noComponentInfo} 个`)
    
    return results
  }

  async findComponentImportPath(componentName) {
    try {
      const content = fs.readFileSync(this.routesFile, 'utf8')
      
      // 查找组件的导入定义
      const importPattern = new RegExp(`const\\s+${componentName}\\s*=\\s*\\(\\)\\s*=>\\s*import\\s*\\(\\s*['"](.*?)['"]\\s*\\)`)
      const match = content.match(importPattern)
      
      if (match) {
        return match[1]
      }
      
      // 查找被注释的导入定义
      const commentedImportPattern = new RegExp(`//\\s*const\\s+${componentName}\\s*=\\s*\\(\\)\\s*=>\\s*import\\s*\\(\\s*['"](.*?)['"]\\s*\\)`)
      const commentedMatch = content.match(commentedImportPattern)
      
      if (commentedMatch) {
        return commentedMatch[1]
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  checkComponentFileExists(componentPath) {
    if (!componentPath) return false
    
    // 转换相对路径为绝对路径
    const fullPath = componentPath.startsWith('@/') 
      ? path.join(this.projectRoot, 'src', componentPath.slice(2))
      : path.join(this.projectRoot, componentPath)
    
    return fs.existsSync(fullPath)
  }

  async generateUncommentPlan(componentResults) {
    const plan = {
      safe: [], // 安全取消注释（组件存在）
      risky: [], // 风险取消注释（组件不存在但有路径）
      skip: [], // 跳过（无组件信息）
      stats: {}
    }
    
    componentResults.forEach(result => {
      if (result.componentExists) {
        plan.safe.push(result)
      } else if (result.componentPath) {
        plan.risky.push(result)
      } else {
        plan.skip.push(result)
      }
    })
    
    plan.stats = {
      total: componentResults.length,
      safe: plan.safe.length,
      risky: plan.risky.length,
      skip: plan.skip.length
    }
    
    return plan
  }

  showPlan(plan) {
    console.log('\n' + '='.repeat(80))
    console.log('🔧 路由取消注释计划')
    console.log('='.repeat(80))
    
    const { stats } = plan
    
    console.log('\n📈 计划概览:')
    console.log(`   总被注释路由: ${stats.total}`)
    console.log(`   ✅ 安全取消注释: ${stats.safe} (组件存在)`)
    console.log(`   ⚠️ 风险取消注释: ${stats.risky} (组件缺失)`)
    console.log(`   ⏭️ 跳过: ${stats.skip} (无组件信息)`)
    
    if (plan.safe.length > 0) {
      console.log('\n✅ 安全取消注释列表 (组件存在):')
      plan.safe.forEach((item, index) => {
        const path = item.block.pathMatch || item.block.nameMatch
        console.log(`   ${(index + 1).toString().padStart(2)}: ${path}`)
        console.log(`       组件: ${item.componentPath} ✅`)
      })
    }
    
    if (plan.risky.length > 0) {
      console.log('\n⚠️ 风险取消注释列表 (需要创建组件):')
      plan.risky.slice(0, 10).forEach((item, index) => {
        const path = item.block.pathMatch || item.block.nameMatch
        console.log(`   ${(index + 1).toString().padStart(2)}: ${path}`)
        console.log(`       组件: ${item.componentPath} ❌`)
      })
      if (plan.risky.length > 10) {
        console.log(`   ... 还有 ${plan.risky.length - 10} 个风险路由`)
      }
    }
    
    if (plan.skip.length > 0) {
      console.log('\n⏭️ 跳过列表 (无组件信息):')
      plan.skip.slice(0, 5).forEach((item, index) => {
        const path = item.block.pathMatch || item.block.nameMatch
        console.log(`   ${(index + 1).toString().padStart(2)}: ${path}`)
      })
      if (plan.skip.length > 5) {
        console.log(`   ... 还有 ${plan.skip.length - 5} 个跳过的路由`)
      }
    }
    
    console.log('\n💡 建议执行顺序:')
    console.log('   1. 🟢 首先取消注释安全路由 (组件存在)')
    console.log('   2. 🔄 测试应用是否正常工作')
    console.log('   3. 🟡 创建缺失的重要组件')
    console.log('   4. 🟡 取消注释对应的风险路由')
    console.log('   5. 🔄 再次测试应用')
    
    console.log('\n🔧 执行取消注释的方法:')
    console.log('   node route-uncomment-tool.cjs --execute-safe')
    console.log('   (注意: 当前只显示计划，不执行修改)')
    
    console.log('\n' + '='.repeat(80))
  }

  async executeSafeUncomment(plan) {
    if (plan.safe.length === 0) {
      console.log('⚠️ 没有安全的路由可以取消注释')
      return false
    }
    
    console.log(`🔧 开始取消注释 ${plan.safe.length} 个安全路由...`)
    
    try {
      let content = fs.readFileSync(this.routesFile, 'utf8')
      let lines = content.split('\n')
      let modifiedCount = 0
      
      // 从后往前处理，避免行号偏移
      plan.safe.reverse().forEach(item => {
        const { block } = item
        console.log(`   🔧 取消注释: ${block.pathMatch || block.nameMatch}`)
        
        for (let i = block.startLine; i <= block.endLine; i++) {
          if (lines[i] && lines[i].trim().startsWith('//')) {
            // 移除行首的 // 注释
            lines[i] = lines[i].replace(/^\s*\/\/\s?/, '      ')
            modifiedCount++
          }
        }
      })
      
      // 写回文件
      const newContent = lines.join('\n')
      fs.writeFileSync(this.routesFile, newContent)
      
      console.log(`✅ 成功取消注释 ${plan.safe.length} 个路由，修改了 ${modifiedCount} 行`)
      console.log(`📄 修改的文件: ${this.routesFile}`)
      console.log(`💾 备份文件: ${this.backupFile}`)
      
      return true
      
    } catch (error) {
      console.log(`❌ 执行取消注释失败: ${error.message}`)
      return false
    }
  }
}

// 运行工具
if (require.main === module) {
  const tool = new RouteUncommentTool()
  
  const args = process.argv.slice(2)
  const executeSafe = args.includes('--execute-safe')
  
  tool.analyzeAndUncomment()
    .then(plan => {
      if (executeSafe) {
        console.log('\n🚀 执行安全取消注释...')
        return tool.executeSafeUncomment(plan)
      } else {
        console.log('\n💡 添加 --execute-safe 参数来执行安全的取消注释')
      }
    })
    .catch(console.error)
}

module.exports = { RouteUncommentTool }