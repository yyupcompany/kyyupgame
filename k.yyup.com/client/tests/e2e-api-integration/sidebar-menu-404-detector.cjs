/**
 * Sidebar Menu 404 Detection Tool
 * 侧边栏菜单404检测工具 (检测跳转到404.vue的页面)
 */

const http = require('http')
const https = require('https')

class SidebarMenu404Detector {
  constructor() {
    this.frontendURL = 'http://k.yyup.cc'
    this.backendURL = 'http://localhost:3000'
    this.results = []
    this.menuLinks = []
    this.authToken = null
    this.initMenuLinks()
  }

  initMenuLinks() {
    // 基于侧边栏分析的完整菜单链接
    this.menuLinks = [
      // 1. 工作台 (Dashboard)
      { section: '工作台', name: '数据概览', path: '/dashboard', priority: 'high' },
      { section: '工作台', name: '校园概览', path: '/dashboard/campus-overview', priority: 'high' },
      { section: '工作台', name: '日程管理', path: '/dashboard/schedule', priority: 'high' },
      { section: '工作台', name: '重要通知', path: '/dashboard/important-notices', priority: 'medium' },
      { section: '工作台', name: '数据统计', path: '/dashboard/data-statistics', priority: 'high' },
      { section: '工作台', name: '通知中心', path: '/dashboard/notification-center', priority: 'medium' },
      { section: '工作台', name: '智能分析', path: '/dashboard/analytics', priority: 'medium' },
      { section: '工作台', name: '绩效管理', path: '/dashboard/performance', priority: 'medium' },

      // 2. 招生管理 (Enrollment)
      { section: '招生管理', name: '招生计划', path: '/enrollment-plan', priority: 'high' },
      { section: '招生管理', name: '创建计划', path: '/enrollment-plan/create', priority: 'high' },
      { section: '招生管理', name: '计划统计', path: '/enrollment-plan/statistics', priority: 'high' },
      { section: '招生管理', name: '名额管理', path: '/enrollment-plan/quota-manage', priority: 'high' },
      { section: '招生管理', name: '智能规划', path: '/enrollment-plan/smart-planning/smart-planning', priority: 'medium' },
      { section: '招生管理', name: '招生分析', path: '/enrollment-plan/analytics/enrollment-analytics', priority: 'medium' },
      { section: '招生管理', name: '招生预测', path: '/enrollment-plan/forecast/enrollment-forecast', priority: 'medium' },
      { section: '招生管理', name: '招生策略', path: '/enrollment-plan/strategy/enrollment-strategy', priority: 'medium' },
      { section: '招生管理', name: '容量优化', path: '/enrollment-plan/optimization/capacity-optimization', priority: 'medium' },
      { section: '招生管理', name: '趋势分析', path: '/enrollment-plan/trends/trend-analysis', priority: 'medium' },
      { section: '招生管理', name: '招生仿真', path: '/enrollment-plan/simulation/enrollment-simulation', priority: 'medium' },
      { section: '招生管理', name: '计划管理', path: '/enrollment-plan/management/plan-management', priority: 'medium' },
      { section: '招生管理', name: '计划评估', path: '/enrollment-plan/evaluation/plan-evaluation', priority: 'medium' },
      { section: '招生管理', name: '招生活动', path: '/enrollment', priority: 'high' },

      // 3. 入学申请 (Application)
      { section: '入学申请', name: '申请列表', path: '/application', priority: 'high' },
      { section: '入学申请', name: '申请详情', path: '/application/detail/1', priority: 'high' },
      { section: '入学申请', name: '申请审核', path: '/application/review', priority: 'high' },
      { section: '入学申请', name: '面试安排', path: '/application/interview', priority: 'medium' },

      // 4. 客户管理 (Customer)
      { section: '客户管理', name: '客户列表', path: '/customer', priority: 'high' },
      { section: '客户管理', name: '客户详情', path: '/customer/1', priority: 'high' },
      { section: '客户管理', name: '客户分析', path: '/customer/analytics/customer-analytics', priority: 'medium' },
      { section: '客户管理', name: '客户池', path: '/principal/customer-pool', priority: 'high' },

      // 5. 教师管理 (Teacher)
      { section: '教师管理', name: '教师列表', path: '/teacher', priority: 'high' },
      { section: '教师管理', name: '教师详情', path: '/teacher/detail/1', priority: 'high' },
      { section: '教师管理', name: '编辑教师', path: '/teacher/edit/1', priority: 'high' },
      { section: '教师管理', name: '教师绩效', path: '/teacher/performance/1', priority: 'medium' },
      { section: '教师管理', name: '教师发展', path: '/teacher/development/teacher-development', priority: 'medium' },
      { section: '教师管理', name: '教师评估', path: '/teacher/evaluation/teacher-evaluation', priority: 'medium' },

      // 6. 学生管理 (Student)
      { section: '学生管理', name: '学生列表', path: '/student', priority: 'high' },
      { section: '学生管理', name: '学生详情', path: '/student/detail/1', priority: 'high' },
      { section: '学生管理', name: '学生分析', path: '/student/analytics/1', priority: 'medium' },
      { section: '学生管理', name: '成长记录', path: '/student/1/growth', priority: 'medium' },
      { section: '学生管理', name: '学生评估', path: '/student/assessment/student-assessment', priority: 'medium' },

      // 7. 班级管理 (Class)
      { section: '班级管理', name: '班级列表', path: '/class', priority: 'high' },
      { section: '班级管理', name: '班级详情', path: '/class/detail/1', priority: 'high' },
      { section: '班级管理', name: '学生管理', path: '/class/students/id', priority: 'high' },
      { section: '班级管理', name: '教师分配', path: '/class/teachers/id', priority: 'high' },
      { section: '班级管理', name: '智能管理', path: '/class/smart-management/1', priority: 'medium' },
      { section: '班级管理', name: '班级分析', path: '/class/analytics/class-analytics', priority: 'medium' },
      { section: '班级管理', name: '班级优化', path: '/class/optimization/class-optimization', priority: 'medium' },

      // 8. 家长管理 (Parent)
      { section: '家长管理', name: '家长列表', path: '/parent', priority: 'high' },
      { section: '家长管理', name: '家长详情', path: '/parent/detail/1', priority: 'high' },
      { section: '家长管理', name: '编辑家长', path: '/parent/edit/1', priority: 'high' },
      { section: '家长管理', name: '儿童列表', path: '/parent/children', priority: 'medium' },
      { section: '家长管理', name: '跟进管理', path: '/parent/FollowUp', priority: 'medium' },
      { section: '家长管理', name: '沟通中心', path: '/parent/communication/smart-hub', priority: 'medium' },
      { section: '家长管理', name: '成长记录', path: '/parent/ChildGrowth', priority: 'medium' },
      { section: '家长管理', name: '分配活动', path: '/parent/AssignActivity', priority: 'medium' },
      { section: '家长管理', name: '家长反馈', path: '/parent/feedback/parent-feedback', priority: 'medium' },

      // 9. 活动管理 (Activity)
      { section: '活动管理', name: '活动列表', path: '/activity', priority: 'high' },
      { section: '活动管理', name: '活动详情', path: '/activity/detail/1', priority: 'high' },
      { section: '活动管理', name: '创建活动', path: '/activity/create', priority: 'high' },
      { section: '活动管理', name: '编辑活动', path: '/activity/activity-edit', priority: 'high' },
      { section: '活动管理', name: 'AI活动规划器', path: '/activity/plan/activity-planner', priority: 'medium' },
      { section: '活动管理', name: '活动分析', path: '/activity/analytics/activity-analytics', priority: 'medium' },
      { section: '活动管理', name: '活动优化器', path: '/activity/optimization/activity-optimizer', priority: 'medium' },
      { section: '活动管理', name: '报名仪表板', path: '/activity/registration/registration-dashboard', priority: 'medium' },
      { section: '活动管理', name: '活动评估', path: '/activity/evaluation/activity-evaluation', priority: 'medium' },

      // 10. AI功能 (AI)
      { section: 'AI功能', name: 'AI助手', path: '/ai', priority: 'high' },
      { section: 'AI功能', name: 'AI对话界面', path: '/ai/chat-interface', priority: 'high' },
      { section: 'AI功能', name: 'AI模型管理', path: '/ai/ModelManagementPage', priority: 'medium' },
      { section: 'AI功能', name: '专家咨询', path: '/ai/ExpertConsultationPage', priority: 'medium' },
      { section: 'AI功能', name: '记忆管理', path: '/ai/MemoryManagementPage', priority: 'medium' },
      { section: 'AI功能', name: 'AI数据分析', path: '/ai/conversation/nlp-analytics', priority: 'low' },
      { section: 'AI功能', name: '预测引擎', path: '/ai/deep-learning/prediction-engine', priority: 'low' },
      { section: 'AI功能', name: '维护优化', path: '/ai/predictive/maintenance-optimizer', priority: 'low' },
      { section: 'AI功能', name: '3D可视化', path: '/ai/visualization/3d-analytics', priority: 'low' },

      // 11. 系统管理 (System)
      { section: '系统管理', name: '用户管理', path: '/system/users', priority: 'high' },
      { section: '系统管理', name: '角色管理', path: '/system/roles', priority: 'high' },
      { section: '系统管理', name: '权限管理', path: '/system/permissions', priority: 'high' },
      { section: '系统管理', name: '系统日志', path: '/system/logs/system-logs', priority: 'medium' },
      { section: '系统管理', name: '备份管理', path: '/system/backup/backup-management', priority: 'medium' },
      { section: '系统管理', name: '系统监控', path: '/system/monitoring/system-monitoring', priority: 'medium' },
      { section: '系统管理', name: '安全设置', path: '/system/security/security-settings', priority: 'medium' },
      { section: '系统管理', name: '集成中心', path: '/system/integration/integration-hub', priority: 'low' },
      { section: '系统管理', name: '通知设置', path: '/system/notifications/notification-settings', priority: 'medium' },
      { section: '系统管理', name: '维护调度器', path: '/system/maintenance/maintenance-scheduler', priority: 'low' },
      { section: '系统管理', name: '数据库管理', path: '/system/database/database-manager', priority: 'low' },
      { section: '系统管理', name: 'API管理', path: '/system/api/api-management', priority: 'low' },
      { section: '系统管理', name: '系统设置', path: '/system/settings', priority: 'high' },

      // 12. 园长工作台 (Principal)
      { section: '园长工作台', name: '园长仪表盘', path: '/principal/dashboard', priority: 'high' },
      { section: '园长工作台', name: '活动管理', path: '/principal/activities', priority: 'high' },
      { section: '园长工作台', name: '绩效管理', path: '/principal/performance', priority: 'high' },
      { section: '园长工作台', name: '绩效规则', path: '/principal/PerformanceRules', priority: 'medium' },
      { section: '园长工作台', name: '营销分析', path: '/principal/marketing-analysis', priority: 'medium' },
      { section: '园长工作台', name: '海报管理', path: '/principal/PosterTemplates', priority: 'medium' },
      { section: '园长工作台', name: '海报编辑器', path: '/principal/PosterEditor', priority: 'medium' },
      { section: '园长工作台', name: '海报生成器', path: '/principal/PosterGenerator', priority: 'medium' },
      { section: '园长工作台', name: '决策支持', path: '/principal/decision-support/intelligent-dashboard', priority: 'medium' },

      // 13. 其他功能
      { section: '广告管理', name: '广告列表', path: '/advertisement', priority: 'medium' },
      { section: '统计分析', name: '统计概览', path: '/statistics', priority: 'high' },
      { section: '统计分析', name: '报表构建器', path: '/analytics/ReportBuilder', priority: 'medium' },
      { section: '沟通中心', name: '消息中心', path: '/chat', priority: 'medium' },
      { section: '营销管理', name: '营销活动', path: '/marketing', priority: 'medium' },
      { section: '营销管理', name: '智能营销引擎', path: '/marketing/intelligent-engine/marketing-engine', priority: 'low' },

      // 14. 基础页面
      { section: '基础页面', name: '首页', path: '/', priority: 'high' },
      { section: '基础页面', name: '登录页', path: '/login', priority: 'high' }
    ]
  }

  async runAllTests() {
    console.log('🚀 Starting Sidebar Menu 404 Detection...')
    console.log(`🔍 Checking ${this.menuLinks.length} menu links for 404 pages...\n`)
    
    // 1. 首先获取真实的JWT令牌
    console.log('🔑 Authenticating with real JWT token...')
    await this.authenticate()
    
    if (!this.authToken) {
      console.log('❌ Authentication failed. Cannot proceed with testing.')
      return
    }
    
    console.log('✅ Authentication successful. Token obtained.')
    
    // 按优先级分组测试
    const highPriorityLinks = this.menuLinks.filter(link => link.priority === 'high')
    const mediumPriorityLinks = this.menuLinks.filter(link => link.priority === 'medium')
    const lowPriorityLinks = this.menuLinks.filter(link => link.priority === 'low')
    
    console.log('🔥 High Priority Links:')
    await this.testLinks(highPriorityLinks)
    
    console.log('\n📋 Medium Priority Links:')
    await this.testLinks(mediumPriorityLinks)
    
    console.log('\n📝 Low Priority Links:')
    await this.testLinks(lowPriorityLinks)
    
    // 生成详细的404分析报告
    this.generate404Report()
  }

  async authenticate() {
    try {
      const loginData = {
        username: 'admin',
        password: 'admin123'
      }
      
      const response = await this.makeBackendRequest(`${this.backendURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })
      
      if (response.status === 200) {
        const data = JSON.parse(response.data)
        if (data.success && data.data && data.data.token) {
          this.authToken = data.data.token
          console.log('🔑 JWT Token obtained:', this.authToken.substring(0, 50) + '...')
          return true
        }
      }
      
      console.log('❌ Authentication failed:', response.status, response.data)
      return false
    } catch (error) {
      console.log('❌ Authentication error:', error.message)
      return false
    }
  }

  async testLinks(links) {
    for (const link of links) {
      await this.testLink(link)
      // 短暂延迟避免过快请求
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }

  async testLink(link) {
    try {
      const startTime = Date.now()
      const url = `${this.frontendURL}${link.path}`
      
      const response = await this.makeRequest(url)
      const loadTime = Date.now() - startTime
      
      // 检查是否跳转到404页面
      const is404Page = this.detect404Page(response.data, link.path)
      
      const result = {
        section: link.section,
        name: link.name,
        path: link.path,
        url,
        priority: link.priority,
        success: response.status === 200 && !is404Page,
        status: response.status,
        loadTime,
        contentLength: response.data ? response.data.length : 0,
        is404Page: is404Page,
        analysis: this.analyzePageContent(response.data, link.path)
      }
      
      this.results.push(result)
      this.logResult(result)
      
    } catch (error) {
      const result = {
        section: link.section,
        name: link.name,
        path: link.path,
        url: `${this.frontendURL}${link.path}`,
        priority: link.priority,
        success: false,
        error: error.message,
        status: 0,
        loadTime: 0,
        is404Page: false
      }
      
      this.results.push(result)
      this.logResult(result)
    }
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https')
      const httpModule = isHttps ? https : http
      
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Connection': 'keep-alive'
      }
      
      // 如果有JWT令牌，添加Authorization头
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`
      }
      
      const req = httpModule.request(url, {
        method: 'GET',
        timeout: 10000,
        headers
      }, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          resolve({ 
            status: res.statusCode, 
            data, 
            headers: res.headers 
          })
        })
      })
      
      req.on('error', reject)
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })
      
      req.end()
    })
  }

  async makeBackendRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https')
      const httpModule = isHttps ? https : http
      
      const requestOptions = {
        method: options.method || 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Connection': 'keep-alive',
          ...options.headers
        }
      }
      
      const req = httpModule.request(url, requestOptions, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          resolve({ 
            status: res.statusCode, 
            data, 
            headers: res.headers 
          })
        })
      })
      
      req.on('error', reject)
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })
      
      if (options.body) {
        req.write(options.body)
      }
      
      req.end()
    })
  }

  detect404Page(content, path) {
    if (!content) return false
    
    // 检查是否包含404页面的特征
    const indicators404 = [
      'Page Not Found',
      '页面未找到',
      '404',
      'Not Found',
      '找不到页面',
      'page-not-found',
      'error-404',
      '该页面不存在',
      '页面不存在',
      'router-view.*404',
      'NotFound',
      '抱歉，你访问的页面不存在'
    ]
    
    // 检查Vue Router的404重定向
    const vueRouterPatterns = [
      /router\.replace.*404/,
      /router\.push.*404/,
      /$route\.name.*404/,
      /NotFoundComponent/,
      /PageNotFound/
    ]
    
    // 检查内容是否包含404指示器
    const hasTextIndicator = indicators404.some(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    )
    
    // 检查是否有Vue Router重定向到404的模式
    const hasVueRouterRedirect = vueRouterPatterns.some(pattern => 
      pattern.test(content)
    )
    
    // 检查页面标题是否包含404
    const titleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i)
    const hasTitle404 = titleMatch && titleMatch[1].toLowerCase().includes('404')
    
    // 检查是否是空白页面但实际路径不匹配
    const isVeryShortContent = content.length < 500
    const hasMinimalVueStructure = content.includes('<div id="app">') && content.includes('</div>')
    const isProbablyEmpty404 = isVeryShortContent && hasMinimalVueStructure && !this.hasActualPageContent(content)
    
    return hasTextIndicator || hasVueRouterRedirect || hasTitle404 || isProbablyEmpty404
  }

  hasActualPageContent(content) {
    // 检查是否包含实际的页面内容指示器
    const contentIndicators = [
      'el-table',
      'el-form',
      'el-button',
      'el-input',
      'el-card',
      'el-menu',
      'data-table',
      'form-item',
      'page-header',
      'content-wrapper',
      'dashboard',
      'management',
      'list-container',
      'detail-container'
    ]
    
    return contentIndicators.some(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    )
  }

  analyzePageContent(content, path) {
    if (!content) return { type: 'empty', hasData: false, hasError: false }
    
    const analysis = {
      type: 'html',
      hasData: false,
      hasError: false,
      hasVue: false,
      hasAPI: false,
      hasTable: false,
      hasForm: false,
      hasChart: false,
      isEmpty: false,
      hasRealContent: false
    }
    
    // 检查是否有Vue应用
    if (content.includes('vue') || content.includes('Vue')) {
      analysis.hasVue = true
    }
    
    // 检查是否有实际内容
    analysis.hasRealContent = this.hasActualPageContent(content)
    
    // 检查是否有数据表格
    if (content.includes('el-table') || content.includes('table') || content.includes('Table')) {
      analysis.hasTable = true
      analysis.hasData = true
    }
    
    // 检查是否有表单
    if (content.includes('el-form') || content.includes('form') || content.includes('Form')) {
      analysis.hasForm = true
    }
    
    // 检查是否有图表
    if (content.includes('chart') || content.includes('Chart') || content.includes('echarts')) {
      analysis.hasChart = true
      analysis.hasData = true
    }
    
    // 检查是否有API调用
    if (content.includes('api/') || content.includes('API') || content.includes('axios')) {
      analysis.hasAPI = true
    }
    
    // 检查是否有错误
    if (content.includes('error') || content.includes('Error') || content.includes('404') || content.includes('500')) {
      analysis.hasError = true
    }
    
    // 检查是否为空状态
    if (content.includes('empty') || content.includes('Empty') || content.includes('暂无数据') || content.includes('No data')) {
      analysis.isEmpty = true
    }
    
    return analysis
  }

  logResult(result) {
    const icon = result.success ? '✅' : (result.is404Page ? '🔄' : '❌')
    const section = result.section.padEnd(8)
    const name = result.name.padEnd(20)
    const status = result.status ? `[${result.status}]` : '[ERR]'
    const time = result.loadTime ? `${result.loadTime}ms` : '0ms'
    
    let statusInfo = ''
    if (result.is404Page) {
      statusInfo = '🔄404页面'
    } else if (result.success && result.analysis && result.analysis.hasRealContent) {
      statusInfo = '📊有内容'
    } else if (result.success) {
      statusInfo = '📄空框架'
    } else {
      statusInfo = '❌错误'
    }
    
    console.log(`${icon} ${section} ${name} ${status} ${time.padEnd(8)} ${statusInfo}`)
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`)
    }
  }

  generate404Report() {
    console.log('\n' + '='.repeat(80))
    console.log('📊 SIDEBAR MENU 404 DETECTION REPORT')
    console.log('='.repeat(80))
    
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const is404Pages = this.results.filter(r => r.is404Page).length
    const errors = this.results.filter(r => !r.success && !r.is404Page).length
    const withContent = this.results.filter(r => r.success && r.analysis && r.analysis.hasRealContent).length
    const emptyFrames = this.results.filter(r => r.success && r.analysis && !r.analysis.hasRealContent).length
    
    console.log('\n📈 Overall Results:')
    console.log(`   Total Menu Links: ${total}`)
    console.log(`   ✅ Working Pages: ${successful} (${((successful/total)*100).toFixed(1)}%)`)
    console.log(`   🔄 404 Pages: ${is404Pages} (${((is404Pages/total)*100).toFixed(1)}%)`)
    console.log(`   ❌ Network Errors: ${errors} (${((errors/total)*100).toFixed(1)}%)`)
    console.log(`   📊 Pages with Content: ${withContent} (${((withContent/total)*100).toFixed(1)}%)`)
    console.log(`   📄 Empty Frames: ${emptyFrames} (${((emptyFrames/total)*100).toFixed(1)}%)`)
    
    // 按模块分析404情况
    console.log('\n📊 Module 404 Analysis:')
    const sectionResults = this.groupBySection()
    
    Object.entries(sectionResults).forEach(([section, results]) => {
      const section404 = results.filter(r => r.is404Page).length
      const sectionSuccess = results.filter(r => r.success).length
      const sectionTotal = results.length
      
      if (section404 > 0) {
        console.log(`   ⚠️ ${section.padEnd(12)}: ${section404}/${sectionTotal} pages redirect to 404`)
      } else {
        console.log(`   ✅ ${section.padEnd(12)}: ${sectionSuccess}/${sectionTotal} pages working`)
      }
    })
    
    // 优先级分析
    console.log('\n🔍 Priority 404 Analysis:')
    const priorities = ['high', 'medium', 'low']
    priorities.forEach(priority => {
      const priorityResults = this.results.filter(r => r.priority === priority)
      const priority404 = priorityResults.filter(r => r.is404Page).length
      const prioritySuccess = priorityResults.filter(r => r.success).length
      
      console.log(`   ${priority.toUpperCase().padEnd(6)}: ${prioritySuccess}/${priorityResults.length} working, ${priority404} redirect to 404`)
    })
    
    // 详细的404页面列表
    const problem404Pages = this.results.filter(r => r.is404Page)
    if (problem404Pages.length > 0) {
      console.log('\n❌ PROBLEMATIC PAGES (Redirect to 404):')
      console.log(`   Found ${problem404Pages.length} pages that redirect to 404.vue`)
      
      // 按模块分组404页面
      const problem404BySection = {}
      problem404Pages.forEach(result => {
        if (!problem404BySection[result.section]) {
          problem404BySection[result.section] = []
        }
        problem404BySection[result.section].push(result)
      })
      
      Object.entries(problem404BySection).forEach(([section, results]) => {
        console.log(`\n   🔧 ${section} (${results.length} problematic):`)
        results.forEach((result, index) => {
          const priorityFlag = result.priority === 'high' ? '🔥' : result.priority === 'medium' ? '📋' : '📝'
          console.log(`     ${index + 1}. ${priorityFlag} ${result.name}: ${result.path}`)
        })
      })
    }
    
    // 修复建议
    console.log('\n💡 Fix Recommendations:')
    this.generateFixRecommendations(problem404Pages)
    
    // 最终评估
    const finalAssessment = this.getFinalAssessment(successful, is404Pages, total)
    console.log('\n🏆 Final Assessment:')
    console.log(`   Menu System Status: ${finalAssessment.status}`)
    console.log(`   ${finalAssessment.message}`)
    
    console.log('\n' + '='.repeat(80))
  }

  groupBySection() {
    const sectionResults = {}
    this.results.forEach(result => {
      if (!sectionResults[result.section]) {
        sectionResults[result.section] = []
      }
      sectionResults[result.section].push(result)
    })
    return sectionResults
  }

  generateFixRecommendations(problem404Pages) {
    const highPriority404 = problem404Pages.filter(r => r.priority === 'high')
    const mediumPriority404 = problem404Pages.filter(r => r.priority === 'medium')
    
    if (highPriority404.length > 0) {
      console.log('   🚨 HIGH PRIORITY: Fix these core pages immediately')
      console.log(`     ${highPriority404.length} high-priority pages redirect to 404`)
      highPriority404.slice(0, 5).forEach(result => {
        console.log(`     - Create component: ${result.path}`)
      })
    }
    
    if (mediumPriority404.length > 0) {
      console.log('   ⚠️ MEDIUM PRIORITY: Consider implementing these features')
      console.log(`     ${mediumPriority404.length} medium-priority pages redirect to 404`)
    }
    
    console.log('   📝 Specific Actions:')
    if (problem404Pages.length > 0) {
      console.log('     1. Check router configuration in src/router/optimized-routes.ts')
      console.log('     2. Create missing page components in src/pages/')
      console.log('     3. Ensure proper route-to-component mapping')
      console.log('     4. Test dynamic routes with correct parameters')
    } else {
      console.log('     ✅ All menu links are working correctly!')
    }
  }

  getFinalAssessment(successful, is404Pages, total) {
    const successRate = (successful / total) * 100
    const problemRate = (is404Pages / total) * 100
    
    if (problemRate === 0) {
      return {
        status: 'PERFECT',
        message: '🎉 Perfect! No pages redirect to 404. All menu links work correctly!'
      }
    } else if (problemRate < 10) {
      return {
        status: 'EXCELLENT',
        message: `👍 Excellent! Only ${problemRate.toFixed(1)}% of pages redirect to 404. Minor fixes needed.`
      }
    } else if (problemRate < 25) {
      return {
        status: 'GOOD',
        message: `⚠️ Good overall. ${problemRate.toFixed(1)}% of pages redirect to 404. Moderate fixes needed.`
      }
    } else if (problemRate < 50) {
      return {
        status: 'FAIR',
        message: `🔧 Fair condition. ${problemRate.toFixed(1)}% of pages redirect to 404. Significant fixes needed.`
      }
    } else {
      return {
        status: 'POOR',
        message: `🚨 Poor condition. ${problemRate.toFixed(1)}% of pages redirect to 404. Major fixes required.`
      }
    }
  }
}

// 运行测试
if (require.main === module) {
  const detector = new SidebarMenu404Detector()
  detector.runAllTests().catch(console.error)
}

module.exports = { SidebarMenu404Detector }