/**
 * Route Fix Implementation
 * 路由修复实施工具 - 批量激活存在组件的路由
 */

const fs = require('fs')
const path = require('path')

class RouteFixer {
  constructor() {
    this.projectRoot = '/home/devbox/project/client'
    this.routesFile = path.join(this.projectRoot, 'src/router/optimized-routes.ts')
    this.pagesDir = path.join(this.projectRoot, 'src/pages')
    this.backupFile = this.routesFile + '.backup-before-fix-' + Date.now()
    this.existingComponents = new Map()
  }

  async fixAllRoutes() {
    console.log('🔧 开始修复路由配置...')
    console.log('📋 目标：激活所有存在组件的路由\n')
    
    // 1. 备份原文件
    console.log('📋 Step 1: 备份原路由文件...')
    await this.backupOriginalFile()
    
    // 2. 扫描现有组件
    console.log('\n📋 Step 2: 扫描现有页面组件...')
    await this.scanExistingComponents()
    
    // 3. 生成完整的路由配置
    console.log('\n📋 Step 3: 生成完整的路由配置...')
    const newRoutes = await this.generateCompleteRoutes()
    
    // 4. 写入新的路由配置
    console.log('\n📋 Step 4: 写入新的路由配置...')
    await this.writeNewRoutes(newRoutes)
    
    // 5. 验证修复结果
    console.log('\n📋 Step 5: 验证修复结果...')
    await this.validateFix()
    
    console.log('\n✅ 路由修复完成！')
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

  async scanExistingComponents() {
    const scanDir = (dir, prefix = '') => {
      try {
        const items = fs.readdirSync(dir)
        
        for (const item of items) {
          const fullPath = path.join(dir, item)
          const stat = fs.statSync(fullPath)
          
          if (stat.isDirectory()) {
            scanDir(fullPath, prefix + item + '/')
          } else if (item.endsWith('.vue') && !item.includes('.backup') && !item.includes('.incomplete')) {
            const componentPath = prefix + item
            const routePath = this.componentPathToRoute(componentPath)
            this.existingComponents.set(routePath, {
              componentPath: `@/pages/${componentPath}`,
              name: this.generateRouteName(routePath)
            })
          }
        }
      } catch (error) {
        // 忽略访问错误
      }
    }
    
    scanDir(this.pagesDir)
    console.log(`   ✅ 扫描到 ${this.existingComponents.size} 个页面组件`)
    
    // 显示前20个组件
    console.log('\n🔗 扫描到的组件 (前20个):')
    let count = 0
    for (const [route, info] of this.existingComponents) {
      if (count < 20) {
        console.log(`   ${(count + 1).toString().padStart(2)}: ${route} -> ${info.componentPath}`)
        count++
      }
    }
    if (this.existingComponents.size > 20) {
      console.log(`   ... 还有 ${this.existingComponents.size - 20} 个组件`)
    }
  }

  componentPathToRoute(componentPath) {
    // 转换组件路径为路由路径
    let route = '/' + componentPath.replace('.vue', '').replace(/\\/g, '/')
    
    // 处理特殊路径映射
    const mappings = {
      '/Login/index': '/login',
      '/dashboard/index': '/dashboard',
      '/404': '/404',
      '/403': '/403'
    }
    
    if (mappings[route]) {
      return mappings[route]
    }
    
    // 处理动态路由
    route = route.replace(/\[([^\]]+)\]/g, ':$1')
    
    // 处理index文件
    if (route.endsWith('/index')) {
      route = route.replace('/index', '')
      if (route === '') route = '/'
    }
    
    return route
  }

  generateRouteName(routePath) {
    // 生成路由名称
    const parts = routePath.split('/').filter(p => p && !p.startsWith(':'))
    return parts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, '')
    ).join('')
  }

  async generateCompleteRoutes() {
    // 生成完整的路由配置
    const routes = `/**
 * 优化的路由配置 - 实现代码分割和懒加载
 * 目标: 将页面加载时间从3684ms优化到2秒以内
 * 🔧 自动修复: 激活所有存在组件的路由
 */

import { RouteRecordRaw } from 'vue-router'

// 使用动态导入实现代码分割
const Layout = () => import('@/layouts/MainLayout.vue')

// 🔧 自动生成的组件导入
${this.generateComponentImports()}

// 优化的路由配置
export const optimizedRoutes: Array<RouteRecordRaw> = [
  // 登录页面（不需要Layout包裹）
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login/index.vue'),
    meta: {
      title: '用户登录',
      requiresAuth: false,
      hideInMenu: true,
      preload: true
    }
  },

  // 403权限不足页面
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/pages/403.vue'),
    meta: {
      title: '权限不足',
      requiresAuth: false,
      hideInMenu: true
    }
  },
  
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/404.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false,
      hideInMenu: true
    }
  },

  // 主应用路由（使用Layout包裹）
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      preload: true
    },
    children: [
${this.generateChildRoutes()}
    ]
  }
]

// 路由优先级配置
export const routePriorities = {
  critical: ['/login', '/dashboard', '/'],
  high: ['/class', '/teacher', '/enrollment-plan', '/enrollment'],
  medium: ['/parent', '/customer', '/statistics', '/ai', '/chat'],
  low: ['/system', '/advertisement', '/activity', '/principal']
}

// 路由预加载配置
export const preloadConfig = {
  immediate: ['/dashboard', '/class', '/teacher'],
  idle: ['/enrollment-plan', '/enrollment', '/parent'],
  ondemand: ['/system', '/ai', '/statistics']
}
`
    return routes
  }

  generateComponentImports() {
    const imports = []
    for (const [route, info] of this.existingComponents) {
      if (route !== '/login' && route !== '/404' && route !== '/403') {
        const componentName = info.name || this.generateRouteName(route)
        imports.push(`const ${componentName} = () => import('${info.componentPath}')`)
      }
    }
    return imports.join('\\n')
  }

  generateChildRoutes() {
    const routes = []
    const routeGroups = this.groupRoutesByModule()
    
    // 仪表板模块
    if (this.existingComponents.has('/dashboard')) {
      routes.push(`      // 仪表板模块 - 核心页面
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard/index.vue'),
        meta: {
          title: '仪表板',
          icon: 'Dashboard',
          requiresAuth: true,
          preload: true,
          priority: 'high'
        }
      },`)
    }
    
    // 班级管理模块
    if (routeGroups.class && routeGroups.class.length > 0) {
      routes.push(`
      // 班级管理模块
      {
        path: 'class',
        name: 'ClassManagement',
        component: () => import('@/pages/class/index.vue'),
        meta: {
          title: '班级管理',
          icon: 'School',
          requiresAuth: true,
          permission: 'CLASS_VIEW',
          preload: true,
          priority: 'high'
        }
      },`)
      
      // 添加班级子路由
      routeGroups.class.forEach(route => {
        if (route !== '/class') {
          const childPath = route.replace('/class/', '')
          const name = this.generateRouteName(route)
          const component = this.existingComponents.get(route)
          routes.push(`      {
        path: 'class/${childPath}',
        name: '${name}',
        component: () => import('${component.componentPath}'),
        meta: {
          title: '${this.getRouteTitle(route)}',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'CLASS_VIEW'
        }
      },`)
        }
      })
    }
    
    // 学生管理模块
    if (routeGroups.student && routeGroups.student.length > 0) {
      routes.push(`
      // 学生管理模块
      {
        path: 'student',
        name: 'StudentManagement',
        redirect: '/class',
        meta: {
          title: '学生管理',
          icon: 'User',
          requiresAuth: true,
          permission: 'STUDENT_VIEW',
          priority: 'high'
        },
        children: [`)
      
      routeGroups.student.forEach(route => {
        if (route !== '/student') {
          const childPath = route.replace('/student/', '')
          const name = this.generateRouteName(route)
          const component = this.existingComponents.get(route)
          routes.push(`          {
            path: '${childPath}',
            name: '${name}',
            component: () => import('${component.componentPath}'),
            meta: {
              title: '${this.getRouteTitle(route)}',
              requiresAuth: true,
              permission: 'STUDENT_VIEW'
            }
          },`)
        }
      })
      
      routes.push(`        ]
      },`)
    }
    
    // 教师管理模块
    if (routeGroups.teacher && routeGroups.teacher.length > 0) {
      routes.push(`
      // 教师管理模块
      {
        path: 'teacher',
        name: 'TeacherManagement',
        component: () => import('@/pages/teacher/index.vue'),
        meta: {
          title: '教师管理',
          icon: 'UserFilled',
          requiresAuth: true,
          permission: 'TEACHER_VIEW',
          priority: 'high'
        }
      },`)
      
      // 添加教师子路由
      routeGroups.teacher.forEach(route => {
        if (route !== '/teacher') {
          const childPath = route.replace('/teacher/', '')
          const name = this.generateRouteName(route)
          const component = this.existingComponents.get(route)
          routes.push(`      {
        path: 'teacher/${childPath}',
        name: '${name}',
        component: () => import('${component.componentPath}'),
        meta: {
          title: '${this.getRouteTitle(route)}',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'TEACHER_VIEW'
        }
      },`)
        }
      })
    }
    
    // 活动管理模块
    if (routeGroups.activity && routeGroups.activity.length > 0) {
      routes.push(`
      // 活动管理模块
      {
        path: 'activity',
        name: 'ActivityManagement',
        component: () => import('@/pages/activity/index.vue'),
        meta: {
          title: '活动管理',
          icon: 'Trophy',
          requiresAuth: true,
          permission: 'ACTIVITY_VIEW',
          priority: 'medium'
        }
      },`)
      
      // 添加活动子路由
      routeGroups.activity.forEach(route => {
        if (route !== '/activity') {
          const childPath = route.replace('/activity/', '')
          const name = this.generateRouteName(route)
          const component = this.existingComponents.get(route)
          routes.push(`      {
        path: 'activity/${childPath}',
        name: '${name}',
        component: () => import('${component.componentPath}'),
        meta: {
          title: '${this.getRouteTitle(route)}',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'ACTIVITY_VIEW'
        }
      },`)
        }
      })
    }
    
    // 添加其他模块路由
    this.addOtherModuleRoutes(routes, routeGroups)
    
    return routes.join('\\n')
  }

  groupRoutesByModule() {
    const groups = {}
    
    for (const [route, info] of this.existingComponents) {
      if (route === '/login' || route === '/404' || route === '/403') continue
      
      const parts = route.split('/').filter(p => p)
      const module = parts[0] || 'root'
      
      if (!groups[module]) {
        groups[module] = []
      }
      groups[module].push(route)
    }
    
    return groups
  }

  getRouteTitle(route) {
    const titleMap = {
      '/dashboard': '仪表板',
      '/class': '班级管理',
      '/student': '学生管理',
      '/teacher': '教师管理',
      '/activity': '活动管理',
      '/parent': '家长管理',
      '/enrollment': '招生管理',
      '/enrollment-plan': '招生计划',
      '/system': '系统管理',
      '/ai': 'AI助手',
      '/chat': '聊天',
      '/statistics': '统计分析',
      '/customer': '客户管理',
      '/application': '申请管理',
      '/advertisement': '广告管理',
      '/principal': '园长功能'
    }
    
    // 尝试从映射中获取标题
    for (const [path, title] of Object.entries(titleMap)) {
      if (route.startsWith(path)) {
        return title
      }
    }
    
    // 生成默认标题
    const parts = route.split('/').filter(p => p && !p.startsWith(':'))
    return parts[parts.length - 1] || '页面'
  }

  addOtherModuleRoutes(routes, routeGroups) {
    // 添加其他重要模块的路由
    const modules = ['parent', 'enrollment', 'enrollment-plan', 'system', 'ai', 'chat', 'statistics', 'customer', 'application', 'advertisement', 'principal']
    
    modules.forEach(module => {
      if (routeGroups[module] && routeGroups[module].length > 0) {
        const mainRoute = routeGroups[module].find(r => r === `/${module}`)
        if (mainRoute) {
          const component = this.existingComponents.get(mainRoute)
          routes.push(`
      // ${this.getRouteTitle(mainRoute)}模块
      {
        path: '${module}',
        name: '${this.generateRouteName(mainRoute)}',
        component: () => import('${component.componentPath}'),
        meta: {
          title: '${this.getRouteTitle(mainRoute)}',
          requiresAuth: true,
          priority: 'medium'
        }
      },`)
        }
        
        // 添加子路由
        routeGroups[module].forEach(route => {
          if (route !== `/${module}`) {
            const childPath = route.replace(`/${module}/`, '')
            const name = this.generateRouteName(route)
            const component = this.existingComponents.get(route)
            routes.push(`      {
        path: '${route.substring(1)}',
        name: '${name}',
        component: () => import('${component.componentPath}'),
        meta: {
          title: '${this.getRouteTitle(route)}',
          requiresAuth: true,
          hideInMenu: true
        }
      },`)
          }
        })
      }
    })
  }

  async writeNewRoutes(routeContent) {
    try {
      fs.writeFileSync(this.routesFile, routeContent)
      console.log(`   ✅ 新的路由配置已写入: ${this.routesFile}`)
    } catch (error) {
      console.log(`   ❌ 写入失败: ${error.message}`)
      throw error
    }
  }

  async validateFix() {
    try {
      const content = fs.readFileSync(this.routesFile, 'utf8')
      const routeMatches = content.match(/path\s*:\s*['"]([^'"]*)['"]/g)
      
      if (routeMatches) {
        console.log(`   ✅ 验证完成，现在有 ${routeMatches.length} 个路由配置`)
        console.log(`   📈 修复前：4个路由`)
        console.log(`   📈 修复后：${routeMatches.length}个路由`)
        console.log(`   📊 增加了 ${routeMatches.length - 4} 个路由`)
      } else {
        console.log('   ⚠️ 验证警告：未找到路由配置')
      }
    } catch (error) {
      console.log(`   ❌ 验证失败: ${error.message}`)
    }
  }
}

// 运行修复工具
if (require.main === module) {
  const fixer = new RouteFixer()
  fixer.fixAllRoutes().catch(console.error)
}

module.exports = { RouteFixer }