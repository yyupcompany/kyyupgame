/**
 * Gradual Route Fix
 * 渐进式路由修复 - 安全地添加缺失的核心路由
 */

const fs = require('fs')
const path = require('path')

class GradualRouteFixer {
  constructor() {
    this.projectRoot = '/home/devbox/project/client'
    this.routesFile = path.join(this.projectRoot, 'src/router/optimized-routes.ts')
    this.pagesDir = path.join(this.projectRoot, 'src/pages')
  }

  async addMissingCoreRoutes() {
    console.log('🔧 开始渐进式路由修复...')
    console.log('📋 安全地添加缺失的核心路由...\n')
    
    // 1. 读取当前路由配置
    console.log('📋 Step 1: 读取当前路由配置...')
    const currentContent = fs.readFileSync(this.routesFile, 'utf8')
    
    // 2. 检查缺失的核心路由
    console.log('\n📋 Step 2: 检查缺失的核心路由...')
    const missingRoutes = this.findMissingCoreRoutes(currentContent)
    
    if (missingRoutes.length === 0) {
      console.log('   ✅ 所有核心路由都已配置!')
      return
    }
    
    console.log(`   ⚠️ 发现 ${missingRoutes.length} 个缺失的核心路由:`)
    missingRoutes.forEach(route => {
      console.log(`     - ${route.path} (${route.title})`)
    })
    
    // 3. 添加缺失的路由
    console.log('\n📋 Step 3: 添加缺失的路由...')
    const updatedContent = this.addRoutesToConfig(currentContent, missingRoutes)
    
    // 4. 备份并写入新配置
    console.log('\n📋 Step 4: 备份并写入新配置...')
    const backupFile = this.routesFile + '.backup-gradual-' + Date.now()
    fs.writeFileSync(backupFile, currentContent)
    console.log(`   ✅ 原文件已备份到: ${backupFile}`)
    
    fs.writeFileSync(this.routesFile, updatedContent)
    console.log(`   ✅ 新的路由配置已写入`)
    
    // 5. 验证修复结果
    console.log('\n📋 Step 5: 验证修复结果...')
    this.validateFix()
  }

  findMissingCoreRoutes(content) {
    const coreRoutes = [
      {
        path: 'student',
        name: 'StudentIndex',
        component: '@/pages/student/index.vue',
        title: '学生管理',
        icon: 'User',
        permission: 'STUDENT_VIEW',
        priority: 'high'
      },
      {
        path: 'teacher/index',
        name: 'TeacherIndex', 
        component: '@/pages/teacher/index.vue',
        title: '教师首页',
        permission: 'TEACHER_VIEW',
        hideInMenu: true
      },
      {
        path: 'parent/index',
        name: 'ParentIndex',
        component: '@/pages/parent/index.vue', 
        title: '家长首页',
        permission: 'PARENT_VIEW',
        hideInMenu: true
      },
      {
        path: 'activity/index',
        name: 'ActivityIndex',
        component: '@/pages/activity/index.vue',
        title: '活动首页', 
        permission: 'ACTIVITY_VIEW',
        hideInMenu: true
      },
      {
        path: 'ai',
        name: 'AIIndex',
        component: '@/pages/ai.vue',
        title: 'AI助手首页',
        icon: 'Robot',
        permission: 'AI_ASSISTANT_USE',
        priority: 'medium'
      }
    ]
    
    const missing = []
    
    for (const route of coreRoutes) {
      // 检查路由是否已存在
      const pathExists = content.includes(`path: '${route.path}'`)
      
      // 检查组件文件是否存在
      const componentPath = path.join(this.projectRoot, 'src', route.component.replace('@/', ''))
      const componentExists = fs.existsSync(componentPath)
      
      if (!pathExists && componentExists) {
        missing.push(route)
      }
    }
    
    return missing
  }

  addRoutesToConfig(content, missingRoutes) {
    // 找到children数组的最后一个路由
    const childrenEndPattern = /(\s+}.*?\n\s+]\s*\n\s+})/
    const match = content.match(childrenEndPattern)
    
    if (!match) {
      console.log('   ❌ 无法找到children数组结束位置')
      return content
    }
    
    // 生成新路由配置
    const newRoutes = missingRoutes.map(route => {
      const routeConfig = `      // ${route.title}
      {
        path: '${route.path}',
        name: '${route.name}',
        component: () => import('${route.component}'),
        meta: {
          title: '${route.title}',${route.icon ? `\n          icon: '${route.icon}',` : ''}
          requiresAuth: true,${route.permission ? `\n          permission: '${route.permission}',` : ''}${route.hideInMenu ? `\n          hideInMenu: true,` : ''}${route.priority ? `\n          priority: '${route.priority}'` : ''}
        }
      },`
      return routeConfig
    }).join('\n\n')
    
    // 在最后一个路由后插入新路由
    const insertPosition = content.lastIndexOf('      }') + 8 // 8 = length of '      }'
    const beforeInsert = content.substring(0, insertPosition)
    const afterInsert = content.substring(insertPosition)
    
    const updatedContent = beforeInsert + ',\n\n' + newRoutes + afterInsert
    
    console.log(`   ✅ 已添加 ${missingRoutes.length} 个新路由`)
    
    return updatedContent
  }

  validateFix() {
    try {
      const content = fs.readFileSync(this.routesFile, 'utf8')
      
      // 检查语法
      const hasImport = content.includes('import { RouteRecordRaw }')
      const hasExport = content.includes('export const optimizedRoutes')
      const hasChildren = content.includes('children: [')
      
      if (hasImport && hasExport && hasChildren) {
        console.log('   ✅ 路由文件语法检查通过')
      } else {
        console.log('   ⚠️ 路由文件语法检查发现问题')
      }
      
      // 统计路由数量
      const routeBlocks = content.match(/{\s*path\s*:/g) || []
      console.log(`   📊 当前路由数量: ${routeBlocks.length}`)
      
      // 检查核心路由
      const coreRoutePaths = ['dashboard', 'class', 'student', 'teacher', 'activity', 'parent', 'ai']
      const foundPaths = coreRoutePaths.filter(path => content.includes(`path: '${path}'`))
      console.log(`   🎯 核心路由覆盖: ${foundPaths.length}/${coreRoutePaths.length}`)
      
    } catch (error) {
      console.log(`   ❌ 验证失败: ${error.message}`)
    }
  }
}

// 运行渐进式修复
if (require.main === module) {
  const fixer = new GradualRouteFixer()
  fixer.addMissingCoreRoutes().catch(console.error)
}

module.exports = { GradualRouteFixer }