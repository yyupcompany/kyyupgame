/**
 * Sidebar Menu Links Tester
 * 侧边栏菜单链接测试器
 */

const http = require('http')
const https = require('https')

class SidebarMenuTester {
  constructor() {
    this.frontendURL = 'http://k.yyup.cc'
    this.results = []
    this.menuLinks = []
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
      { section: '基础页面', name: '登录页', path: '/login', priority: 'high' },
      { section: '基础页面', name: '403页面', path: '/403', priority: 'low' },
      { section: '基础页面', name: '404页面', path: '/404', priority: 'low' }
    ]
  }

  async runAllTests() {
    console.log('🚀 Starting Sidebar Menu Links Test...')
    console.log(`📊 Testing ${this.menuLinks.length} menu links...\n`)
    
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
    
    // 生成详细报告
    this.generateDetailedReport()
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
      
      const result = {
        section: link.section,
        name: link.name,
        path: link.path,
        url,
        priority: link.priority,
        success: response.status === 200,
        status: response.status,
        loadTime,
        contentLength: response.data ? response.data.length : 0,
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
        loadTime: 0
      }
      
      this.results.push(result)
      this.logResult(result)
    }
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https')
      const httpModule = isHttps ? https : http
      
      const req = httpModule.request(url, {
        method: 'GET',
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Connection': 'keep-alive'
        }
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
      isEmpty: false
    }
    
    // 检查是否有Vue应用
    if (content.includes('vue') || content.includes('Vue')) {
      analysis.hasVue = true
    }
    
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
    
    // 检查是否有实际数据内容
    if (content.includes('data') || content.includes('list') || content.includes('items') || analysis.hasTable || analysis.hasChart) {
      analysis.hasData = true
    }
    
    return analysis
  }

  logResult(result) {
    const icon = result.success ? '✅' : '❌'
    const section = result.section.padEnd(8)
    const name = result.name.padEnd(20)
    const status = result.status ? `[${result.status}]` : '[ERR]'
    const time = result.loadTime ? `${result.loadTime}ms` : '0ms'
    
    let features = []
    if (result.analysis) {
      if (result.analysis.hasData) features.push('📊数据')
      if (result.analysis.hasTable) features.push('📋表格')
      if (result.analysis.hasForm) features.push('📝表单')
      if (result.analysis.hasChart) features.push('📈图表')
      if (result.analysis.hasAPI) features.push('🔗API')
      if (result.analysis.isEmpty) features.push('🗑️空')
      if (result.analysis.hasError) features.push('❌错误')
    }
    
    console.log(`${icon} ${section} ${name} ${status} ${time.padEnd(8)} ${features.join('')}`)
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`)
    }
  }

  generateDetailedReport() {
    console.log('\n' + '='.repeat(80))
    console.log('📊 SIDEBAR MENU LINKS DETAILED ANALYSIS REPORT')
    console.log('='.repeat(80))
    
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const failed = total - successful
    const successRate = total > 0 ? (successful / total) * 100 : 0
    
    console.log('\n📈 Overall Results:')
    console.log(`   Total Menu Links: ${total}`)
    console.log(`   Successful: ${successful}`)
    console.log(`   Failed (404/Error): ${failed}`)
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`)
    
    // 按模块分析
    console.log('\n📊 Module Analysis:')
    const sectionResults = this.groupBySection()
    
    Object.entries(sectionResults).forEach(([section, results]) => {
      const sectionSuccess = results.filter(r => r.success).length
      const sectionTotal = results.length
      const sectionRate = sectionTotal > 0 ? (sectionSuccess / sectionTotal) * 100 : 0
      
      console.log(`   ${section.padEnd(12)}: ${sectionSuccess}/${sectionTotal} (${sectionRate.toFixed(1)}%)`)
    })
    
    // 优先级分析
    console.log('\n🔍 Priority Analysis:')
    const priorities = ['high', 'medium', 'low']
    priorities.forEach(priority => {
      const priorityResults = this.results.filter(r => r.priority === priority)
      const prioritySuccess = priorityResults.filter(r => r.success).length
      const priorityRate = priorityResults.length > 0 ? (prioritySuccess / priorityResults.length) * 100 : 0
      
      console.log(`   ${priority.toUpperCase().padEnd(6)}: ${prioritySuccess}/${priorityResults.length} (${priorityRate.toFixed(1)}%)`)
    })
    
    // 404错误分析
    const failedResults = this.results.filter(r => !r.success)
    if (failedResults.length > 0) {
      console.log('\n❌ 404/Error Pages Analysis:')
      console.log(`   Total Failed Links: ${failedResults.length}`)
      
      // 按模块分组失败链接
      const failedBySection = {}
      failedResults.forEach(result => {
        if (!failedBySection[result.section]) {
          failedBySection[result.section] = []
        }
        failedBySection[result.section].push(result)
      })
      
      Object.entries(failedBySection).forEach(([section, results]) => {
        console.log(`\n   🔧 ${section} (${results.length} failed):`)
        results.forEach(result => {
          const errorInfo = result.error ? ` (${result.error})` : result.status ? ` (${result.status})` : ''
          console.log(`     - ${result.name}: ${result.path}${errorInfo}`)
        })
      })
    }
    
    // 数据丰富度分析
    const successfulResults = this.results.filter(r => r.success)
    if (successfulResults.length > 0) {
      console.log('\n📊 Data Richness Analysis:')
      const withData = successfulResults.filter(r => r.analysis && r.analysis.hasData).length
      const withTable = successfulResults.filter(r => r.analysis && r.analysis.hasTable).length
      const withForm = successfulResults.filter(r => r.analysis && r.analysis.hasForm).length
      const withChart = successfulResults.filter(r => r.analysis && r.analysis.hasChart).length
      const withAPI = successfulResults.filter(r => r.analysis && r.analysis.hasAPI).length
      const isEmpty = successfulResults.filter(r => r.analysis && r.analysis.isEmpty).length
      
      console.log(`   📊 Pages with Data: ${withData}/${successfulResults.length} (${((withData/successfulResults.length)*100).toFixed(1)}%)`)
      console.log(`   📋 Pages with Tables: ${withTable}/${successfulResults.length} (${((withTable/successfulResults.length)*100).toFixed(1)}%)`)
      console.log(`   📝 Pages with Forms: ${withForm}/${successfulResults.length} (${((withForm/successfulResults.length)*100).toFixed(1)}%)`)
      console.log(`   📈 Pages with Charts: ${withChart}/${successfulResults.length} (${((withChart/successfulResults.length)*100).toFixed(1)}%)`)
      console.log(`   🔗 Pages with API: ${withAPI}/${successfulResults.length} (${((withAPI/successfulResults.length)*100).toFixed(1)}%)`)
      console.log(`   🗑️ Empty/Placeholder Pages: ${isEmpty}/${successfulResults.length} (${((isEmpty/successfulResults.length)*100).toFixed(1)}%)`)
    }
    
    // 修复建议
    console.log('\n💡 Fix Recommendations:')
    this.generateFixRecommendations(failedResults)
    
    // 最终评估
    const finalAssessment = this.getFinalAssessment(successRate, failedResults.length)
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

  generateFixRecommendations(failedResults) {
    const highPriorityFailed = failedResults.filter(r => r.priority === 'high')
    const mediumPriorityFailed = failedResults.filter(r => r.priority === 'medium')
    
    if (highPriorityFailed.length > 0) {
      console.log('   🚨 HIGH PRIORITY: Fix these core menu links immediately')
      highPriorityFailed.slice(0, 5).forEach(result => {
        console.log(`     - ${result.section}: ${result.name} (${result.path})`)
      })
    }
    
    if (mediumPriorityFailed.length > 0) {
      console.log('   ⚠️ MEDIUM PRIORITY: Consider implementing these features')
      mediumPriorityFailed.slice(0, 5).forEach(result => {
        console.log(`     - ${result.section}: ${result.name} (${result.path})`)
      })
    }
    
    console.log('   📝 General Recommendations:')
    if (failedResults.length > 20) {
      console.log('     - Review route configuration in router/optimized-routes.ts')
      console.log('     - Check for missing page components in src/pages/')
      console.log('     - Consider implementing placeholder pages for unfinished features')
    } else if (failedResults.length > 10) {
      console.log('     - Focus on high-priority menu items first')
      console.log('     - Implement core business functionality pages')
    } else {
      console.log('     - Minor fixes needed for remaining menu items')
      console.log('     - Consider feature prioritization for remaining items')
    }
  }

  getFinalAssessment(successRate, failedCount) {
    if (successRate >= 90) {
      return {
        status: 'EXCELLENT',
        message: '🎉 Sidebar menu system is highly functional! Most links work perfectly.'
      }
    } else if (successRate >= 80) {
      return {
        status: 'GOOD',
        message: '👍 Sidebar menu system is mostly functional. Minor fixes needed.'
      }
    } else if (successRate >= 70) {
      return {
        status: 'FAIR',
        message: '⚠️ Sidebar menu system needs moderate improvements.'
      }
    } else if (successRate >= 60) {
      return {
        status: 'POOR',
        message: '🔧 Sidebar menu system needs significant fixes.'
      }
    } else {
      return {
        status: 'CRITICAL',
        message: '🚨 Sidebar menu system has major issues. Immediate attention required.'
      }
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new SidebarMenuTester()
  tester.runAllTests().catch(console.error)
}

module.exports = { SidebarMenuTester }