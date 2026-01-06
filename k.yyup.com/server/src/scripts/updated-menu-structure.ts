/**
 * 更新的菜单结构配置
 * 基于实际页面扫描结果，包含所有已开发的功能
 */

export const updatedMenuStructure = [
  // 一级分类：工作台 (Dashboard)
  {
    name: '工作台',
    code: 'DASHBOARD_CATEGORY',
    type: 'category',
    path: '#dashboard',
    icon: 'dashboard',
    sort: 10,
    children: [
      {
        name: '仪表板',
        code: 'DASHBOARD',
        type: 'menu',
        path: '/dashboard',
        component: 'dashboard/index.vue',
        icon: 'dashboard',
        sort: 10,
        roles: ['admin', 'principal', 'teacher'],
        children: [
          { name: '校园概览', code: 'DASHBOARD_CAMPUS_OVERVIEW', type: 'menu', path: '/dashboard/campus-overview', component: 'dashboard/CampusOverview.vue', icon: 'dashboard', sort: 10, roles: ['admin', 'principal'] },
          { name: '数据统计', code: 'DASHBOARD_DATA_STATISTICS', type: 'menu', path: '/dashboard/data-statistics', component: 'dashboard/DataStatistics.vue', icon: 'chart-line', sort: 20, roles: ['admin', 'principal'] },
          { name: '重要通知', code: 'DASHBOARD_IMPORTANT_NOTICES', type: 'menu', path: '/dashboard/important-notices', component: 'dashboard/ImportantNotices.vue', icon: 'bell', sort: 30, roles: ['admin', 'principal', 'teacher'] },
          { name: '日程安排', code: 'DASHBOARD_SCHEDULE', type: 'menu', path: '/dashboard/schedule', component: 'dashboard/Schedule.vue', icon: 'calendar', sort: 40, roles: ['admin', 'principal', 'teacher'] },
          { name: '自定义布局', code: 'DASHBOARD_CUSTOM_LAYOUT', type: 'menu', path: '/dashboard/custom-layout', component: 'dashboard/CustomLayout.vue', icon: 'layout', sort: 50, roles: ['admin', 'principal'] },
          { name: '新版仪表板', code: 'DASHBOARD_NEW', type: 'menu', path: '/dashboard/new-dashboard', component: 'dashboard/NewDashboard.vue', icon: 'dashboard', sort: 60, roles: ['admin', 'principal'] }
        ]
      },
      {
        name: '分析报告',
        code: 'DASHBOARD_ANALYTICS',
        type: 'menu',
        path: '/dashboard/analytics',
        component: 'dashboard/analytics/index.vue',
        icon: 'chart-bar',
        sort: 20,
        roles: ['admin', 'principal'],
        children: [
          { name: '招生趋势分析', code: 'DASHBOARD_ENROLLMENT_TRENDS', type: 'menu', path: '/dashboard/analytics/enrollment-trends', component: 'dashboard/analytics/EnrollmentTrends.vue', icon: 'trending-up', sort: 10, roles: ['admin', 'principal'] },
          { name: '财务分析', code: 'DASHBOARD_FINANCIAL_ANALYSIS', type: 'menu', path: '/dashboard/analytics/financial-analysis', component: 'dashboard/analytics/FinancialAnalysis.vue', icon: 'dollar-sign', sort: 20, roles: ['admin', 'principal'] },
          { name: '教师效能分析', code: 'DASHBOARD_TEACHER_EFFECTIVENESS', type: 'menu', path: '/dashboard/analytics/teacher-effectiveness', component: 'dashboard/analytics/TeacherEffectiveness.vue', icon: 'users', sort: 30, roles: ['admin', 'principal'] }
        ]
      }
    ]
  },

  // 一级分类：教育管理 (Education)
  {
    name: '教育管理',
    code: 'EDUCATION_CATEGORY',
    type: 'category',
    path: '#education',
    icon: 'graduation-cap',
    sort: 20,
    children: [
      {
        name: '学生管理',
        code: 'STUDENTS',
        type: 'menu',
        path: '/student',
        component: 'student/index.vue',
        icon: 'user-graduate',
        sort: 10,
        roles: ['admin', 'principal', 'teacher'],
        children: [
          { name: '学生详情', code: 'STUDENT_DETAIL', type: 'menu', path: '/student/detail/:id', component: 'student/detail/[id].vue', icon: 'user', sort: 10, roles: ['admin', 'principal', 'teacher'] },
          { name: '学生分析', code: 'STUDENT_ANALYTICS', type: 'menu', path: '/student/analytics/:id', component: 'student/analytics/[id].vue', icon: 'chart-bar', sort: 20, roles: ['admin', 'principal', 'teacher'] }
        ]
      },
      {
        name: '教师管理',
        code: 'TEACHERS',
        type: 'menu',
        path: '/teacher',
        component: 'teacher/index.vue',
        icon: 'chalkboard-teacher',
        sort: 20,
        roles: ['admin', 'principal'],
        children: [
          { name: '教师列表', code: 'TEACHER_LIST', type: 'menu', path: '/teacher/list', component: 'teacher/TeacherList.vue', icon: 'list', sort: 10, roles: ['admin', 'principal'] },
          { name: '教师详情', code: 'TEACHER_DETAIL', type: 'menu', path: '/teacher/detail/:id', component: 'teacher/TeacherDetail.vue', icon: 'user', sort: 20, roles: ['admin', 'principal'] },
          { name: '教师编辑', code: 'TEACHER_EDIT', type: 'menu', path: '/teacher/edit/:id', component: 'teacher/TeacherEdit.vue', icon: 'edit', sort: 30, roles: ['admin', 'principal'] },
          { name: '教师绩效', code: 'TEACHER_PERFORMANCE', type: 'menu', path: '/teacher/performance/:id', component: 'teacher/performance/[id].vue', icon: 'chart-line', sort: 40, roles: ['admin', 'principal'] }
        ]
      },
      {
        name: '班级管理',
        code: 'CLASSES',
        type: 'menu',
        path: '/class',
        component: 'class/index.vue',
        icon: 'users-class',
        sort: 30,
        roles: ['admin', 'principal', 'teacher'],
        children: [
          { name: '班级详情', code: 'CLASS_DETAIL', type: 'menu', path: '/class/detail/:id', component: 'class/detail/[id].vue', icon: 'info-circle', sort: 10, roles: ['admin', 'principal', 'teacher'] },
          { name: '班级学生', code: 'CLASS_STUDENTS', type: 'menu', path: '/class/students/:id', component: 'class/students/id.vue', icon: 'users', sort: 20, roles: ['admin', 'principal', 'teacher'] },
          { name: '班级教师', code: 'CLASS_TEACHERS', type: 'menu', path: '/class/teachers/:id', component: 'class/teachers/id.vue', icon: 'chalkboard-teacher', sort: 30, roles: ['admin', 'principal', 'teacher'] },
          { name: '智能班级管理', code: 'CLASS_SMART_MANAGEMENT', type: 'menu', path: '/class/smart-management/:id', component: 'class/smart-management/[id].vue', icon: 'robot', sort: 40, roles: ['admin', 'principal'] },
          { name: '班级分析', code: 'CLASS_ANALYTICS', type: 'menu', path: '/class/analytics/class-analytics', component: 'class/analytics/ClassAnalytics.vue', icon: 'chart-bar', sort: 50, roles: ['admin', 'principal'] },
          { name: '班级优化', code: 'CLASS_OPTIMIZATION', type: 'menu', path: '/class/optimization/class-optimization', component: 'class/optimization/ClassOptimization.vue', icon: 'cog', sort: 60, roles: ['admin', 'principal'] }
        ]
      },
      {
        name: '家长管理',
        code: 'PARENTS',
        type: 'menu',
        path: '/parent',
        component: 'parent/index.vue',
        icon: 'user-friends',
        sort: 40,
        roles: ['admin', 'principal', 'teacher'],
        children: [
          { name: '家长列表', code: 'PARENT_LIST', type: 'menu', path: '/parent/list', component: 'parent/ParentList.vue', icon: 'list', sort: 10, roles: ['admin', 'principal', 'teacher'] },
          { name: '家长详情', code: 'PARENT_DETAIL', type: 'menu', path: '/parent/detail/:id', component: 'parent/ParentDetail.vue', icon: 'user', sort: 20, roles: ['admin', 'principal', 'teacher'] },
          { name: '家长编辑', code: 'PARENT_EDIT', type: 'menu', path: '/parent/edit/:id', component: 'parent/ParentEdit.vue', icon: 'edit', sort: 30, roles: ['admin', 'principal', 'teacher'] },
          { name: '子女列表', code: 'PARENT_CHILDREN', type: 'menu', path: '/parent/children', component: 'parent/ChildrenList.vue', icon: 'baby', sort: 40, roles: ['admin', 'principal', 'teacher'] },
          { name: '儿童成长', code: 'PARENT_CHILD_GROWTH', type: 'menu', path: '/parent/child-growth', component: 'parent/ChildGrowth.vue', icon: 'chart-line', sort: 50, roles: ['admin', 'principal', 'teacher'] },
          { name: '活动分配', code: 'PARENT_ASSIGN_ACTIVITY', type: 'menu', path: '/parent/assign-activity', component: 'parent/AssignActivity.vue', icon: 'tasks', sort: 60, roles: ['admin', 'principal', 'teacher'] },
          { name: '跟进记录', code: 'PARENT_FOLLOW_UP', type: 'menu', path: '/parent/follow-up', component: 'parent/FollowUp.vue', icon: 'comments', sort: 70, roles: ['admin', 'principal', 'teacher'] },
          { name: '智能沟通中心', code: 'PARENT_SMART_HUB', type: 'menu', path: '/parent/communication/smart-hub', component: 'parent/communication/smart-hub.vue', icon: 'comments', sort: 80, roles: ['admin', 'principal', 'teacher'] }
        ]
      }
    ]
  },

  // 一级分类：招生管理 (Enrollment)
  {
    name: '招生管理',
    code: 'ENROLLMENT_CATEGORY',
    type: 'category',
    path: '#enrollment',
    icon: 'user-plus',
    sort: 30,
    children: [
      {
        name: '招生概览',
        code: 'ENROLLMENT_OVERVIEW',
        type: 'menu',
        path: '/enrollment',
        component: 'enrollment/index.vue',
        icon: 'chart-pie',
        sort: 10,
        roles: ['admin', 'principal'],
        children: [
          { name: '自动化跟进', code: 'ENROLLMENT_AUTOMATED_FOLLOW_UP', type: 'menu', path: '/enrollment/automated-follow-up', component: 'enrollment/automated-follow-up.vue', icon: 'robot', sort: 10, roles: ['admin', 'principal'] },
          { name: '漏斗分析', code: 'ENROLLMENT_FUNNEL_ANALYTICS', type: 'menu', path: '/enrollment/funnel-analytics', component: 'enrollment/funnel-analytics.vue', icon: 'filter', sort: 20, roles: ['admin', 'principal'] },
          { name: '个性化策略', code: 'ENROLLMENT_PERSONALIZED_STRATEGY', type: 'menu', path: '/enrollment/personalized-strategy', component: 'enrollment/personalized-strategy.vue', icon: 'user-cog', sort: 30, roles: ['admin', 'principal'] }
        ]
      },
      {
        name: '招生计划',
        code: 'ENROLLMENT_PLANS',
        type: 'menu',
        path: '/enrollment-plan',
        component: 'enrollment-plan.vue',
        icon: 'calendar-alt',
        sort: 20,
        roles: ['admin', 'principal'],
        children: [
          { name: '计划列表', code: 'ENROLLMENT_PLAN_LIST', type: 'menu', path: '/enrollment-plan/list', component: 'enrollment-plan/PlanList.vue', icon: 'list', sort: 10, roles: ['admin', 'principal'] },
          { name: '计划详情', code: 'ENROLLMENT_PLAN_DETAIL', type: 'menu', path: '/enrollment-plan/detail/:id', component: 'enrollment-plan/PlanDetail.vue', icon: 'info-circle', sort: 20, roles: ['admin', 'principal'] },
          { name: '计划编辑', code: 'ENROLLMENT_PLAN_EDIT', type: 'menu', path: '/enrollment-plan/edit/:id', component: 'enrollment-plan/PlanEdit.vue', icon: 'edit', sort: 30, roles: ['admin', 'principal'] },
          { name: '名额管理', code: 'ENROLLMENT_QUOTA_MANAGEMENT', type: 'menu', path: '/enrollment-plan/quota-management', component: 'enrollment-plan/QuotaManagement.vue', icon: 'users', sort: 40, roles: ['admin', 'principal'] },
          { name: '招生统计', code: 'ENROLLMENT_PLAN_STATISTICS', type: 'menu', path: '/enrollment-plan/statistics', component: 'enrollment-plan/Statistics.vue', icon: 'chart-bar', sort: 50, roles: ['admin', 'principal'] },
          { name: 'AI智能规划', code: 'ENROLLMENT_SMART_PLANNING', type: 'menu', path: '/enrollment-plan/smart-planning/smart-planning', component: 'enrollment-plan/smart-planning/smart-planning.vue', icon: 'robot', sort: 60, roles: ['admin', 'principal'] },
          { name: 'AI预测', code: 'ENROLLMENT_AI_FORECASTING', type: 'menu', path: '/enrollment-plan/ai-forecasting', component: 'enrollment-plan/ai-forecasting.vue', icon: 'crystal-ball', sort: 70, roles: ['admin', 'principal'] }
        ]
      },
      {
        name: '招生分析',
        code: 'ENROLLMENT_ANALYTICS',
        type: 'menu',
        path: '/enrollment/analytics',
        component: 'enrollment/analytics/index.vue',
        icon: 'chart-line',
        sort: 30,
        roles: ['admin', 'principal'],
        children: [
          { name: '招生分析报告', code: 'ENROLLMENT_ANALYTICS_REPORT', type: 'menu', path: '/enrollment-plan/analytics/enrollment-analytics', component: 'enrollment-plan/analytics/enrollment-analytics.vue', icon: 'file-chart', sort: 10, roles: ['admin', 'principal'] },
          { name: '计划评估', code: 'ENROLLMENT_PLAN_EVALUATION', type: 'menu', path: '/enrollment-plan/evaluation/plan-evaluation', component: 'enrollment-plan/evaluation/plan-evaluation.vue', icon: 'clipboard-check', sort: 20, roles: ['admin', 'principal'] },
          { name: '招生预测', code: 'ENROLLMENT_FORECAST', type: 'menu', path: '/enrollment-plan/forecast/enrollment-forecast', component: 'enrollment-plan/forecast/enrollment-forecast.vue', icon: 'chart-line', sort: 30, roles: ['admin', 'principal'] },
          { name: '容量优化', code: 'ENROLLMENT_CAPACITY_OPTIMIZATION', type: 'menu', path: '/enrollment-plan/optimization/capacity-optimization', component: 'enrollment-plan/optimization/capacity-optimization.vue', icon: 'cogs', sort: 40, roles: ['admin', 'principal'] },
          { name: '招生仿真', code: 'ENROLLMENT_SIMULATION', type: 'menu', path: '/enrollment-plan/simulation/enrollment-simulation', component: 'enrollment-plan/simulation/enrollment-simulation.vue', icon: 'play-circle', sort: 50, roles: ['admin', 'principal'] },
          { name: '招生策略', code: 'ENROLLMENT_STRATEGY', type: 'menu', path: '/enrollment-plan/strategy/enrollment-strategy', component: 'enrollment-plan/strategy/enrollment-strategy.vue', icon: 'chess', sort: 60, roles: ['admin', 'principal'] },
          { name: '趋势分析', code: 'ENROLLMENT_TREND_ANALYSIS', type: 'menu', path: '/enrollment-plan/trends/trend-analysis', component: 'enrollment-plan/trends/trend-analysis.vue', icon: 'trending-up', sort: 70, roles: ['admin', 'principal'] }
        ]
      },
      {
        name: '申请管理',
        code: 'APPLICATIONS',
        type: 'menu',
        path: '/application',
        component: 'application.vue',
        icon: 'file-text',
        sort: 40,
        roles: ['admin', 'principal'],
        children: [
          { name: '申请列表', code: 'APPLICATION_LIST', type: 'menu', path: '/application/list', component: 'application/ApplicationList.vue', icon: 'list', sort: 10, roles: ['admin', 'principal'] },
          { name: '申请详情', code: 'APPLICATION_DETAIL', type: 'menu', path: '/application/detail/:id', component: 'application/ApplicationDetail.vue', icon: 'info-circle', sort: 20, roles: ['admin', 'principal'] }
        ]
      },
      {
        name: '客户管理',
        code: 'CUSTOMERS',
        type: 'menu',
        path: '/customer',
        component: 'customer/index.vue',
        icon: 'user-tie',
        sort: 50,
        roles: ['admin', 'principal'],
        children: [
          { name: '客户生命周期', code: 'CUSTOMER_LIFECYCLE', type: 'menu', path: '/customer/lifecycle/intelligent-management', component: 'customer/lifecycle/intelligent-management.vue', icon: 'cycle', sort: 10, roles: ['admin', 'principal'] }
        ]
      }
    ]
  },

  // 一级分类：活动管理 (Activities)
  {
    name: '活动管理',
    code: 'ACTIVITIES_CATEGORY',
    type: 'category',
    path: '#activities',
    icon: 'calendar-plus',
    sort: 40,
    children: [
      {
        name: '活动列表',
        code: 'ACTIVITIES',
        type: 'menu',
        path: '/activity',
        component: 'activity/index.vue',
        icon: 'calendar-alt',
        sort: 10,
        roles: ['admin', 'principal', 'teacher'],
        children: [
          { name: '创建活动', code: 'ACTIVITY_CREATE', type: 'menu', path: '/activity/create', component: 'activity/ActivityCreate.vue', icon: 'plus', sort: 10, roles: ['admin', 'principal', 'teacher'] },
          { name: '活动详情', code: 'ACTIVITY_DETAIL', type: 'menu', path: '/activity/detail/:id', component: 'activity/ActivityDetail.vue', icon: 'info-circle', sort: 20, roles: ['admin', 'principal', 'teacher'] },
          { name: '编辑活动', code: 'ACTIVITY_EDIT', type: 'menu', path: '/activity/activity-edit', component: 'activity/ActivityEdit.vue', icon: 'edit', sort: 30, roles: ['admin', 'principal', 'teacher'] }
        ]
      },
      {
        name: '活动策划',
        code: 'ACTIVITY_PLANNING',
        type: 'menu',
        path: '/activity/plan/activity-planner',
        component: 'activity/plan/ActivityPlanner.vue',
        icon: 'lightbulb',
        sort: 20,
        roles: ['admin', 'principal', 'teacher']
      },
      {
        name: '活动分析',
        code: 'ACTIVITY_ANALYTICS',
        type: 'menu',
        path: '/activity/analytics/activity-analytics',
        component: 'activity/analytics/ActivityAnalytics.vue',
        icon: 'chart-bar',
        sort: 30,
        roles: ['admin', 'principal']
      },
      {
        name: '活动优化',
        code: 'ACTIVITY_OPTIMIZATION',
        type: 'menu',
        path: '/activity/optimization/activity-optimizer',
        component: 'activity/optimization/ActivityOptimizer.vue',
        icon: 'cogs',
        sort: 40,
        roles: ['admin', 'principal']
      },
      {
        name: '报名仪表板',
        code: 'ACTIVITY_REGISTRATION_DASHBOARD',
        type: 'menu',
        path: '/activity/registration/registration-dashboard',
        component: 'activity/registration/RegistrationDashboard.vue',
        icon: 'clipboard-list',
        sort: 50,
        roles: ['admin', 'principal', 'teacher']
      },
      {
        name: '活动评估',
        code: 'ACTIVITY_EVALUATION',
        type: 'menu',
        path: '/activity/evaluation/activity-evaluation',
        component: 'activity/evaluation/ActivityEvaluation.vue',
        icon: 'star',
        sort: 60,
        roles: ['admin', 'principal']
      }
    ]
  },

  // 一级分类：园长功能 (Principal Functions)
  {
    name: '园长功能',
    code: 'PRINCIPAL_CATEGORY',
    type: 'category',
    path: '#principal',
    icon: 'user-crown',
    sort: 50,
    children: [
      {
        name: '园长仪表板',
        code: 'PRINCIPAL_DASHBOARD',
        type: 'menu',
        path: '/principal/dashboard',
        component: 'principal/Dashboard.vue',
        icon: 'tachometer-alt',
        sort: 10,
        roles: ['admin', 'principal'],
        children: [
          { name: '智能决策仪表板', code: 'PRINCIPAL_INTELLIGENT_DASHBOARD', type: 'menu', path: '/principal/decision-support/intelligent-dashboard', component: 'principal/decision-support/intelligent-dashboard.vue', icon: 'brain', sort: 10, roles: ['admin', 'principal'] }
        ]
      },
      {
        name: '绩效管理',
        code: 'PRINCIPAL_PERFORMANCE',
        type: 'menu',
        path: '/principal/performance',
        component: 'principal/Performance.vue',
        icon: 'chart-line',
        sort: 20,
        roles: ['admin', 'principal'],
        children: [
          { name: '绩效规则', code: 'PRINCIPAL_PERFORMANCE_RULES', type: 'menu', path: '/principal/performance-rules', component: 'principal/PerformanceRules.vue', icon: 'ruler', sort: 10, roles: ['admin', 'principal'] }
        ]
      },
      {
        name: '客户池管理',
        code: 'PRINCIPAL_CUSTOMER_POOL',
        type: 'menu',
        path: '/principal/customer-pool',
        component: 'principal/CustomerPool.vue',
        icon: 'users',
        sort: 30,
        roles: ['admin', 'principal'],
        children: []
      },
      {
        name: '营销分析',
        code: 'PRINCIPAL_MARKETING_ANALYSIS',
        type: 'menu',
        path: '/principal/marketing-analysis',
        component: 'principal/MarketingAnalysis.vue',
        icon: 'chart-pie',
        sort: 40,
        roles: ['admin', 'principal'],
        children: []
      },
      {
        name: '活动管理',
        code: 'PRINCIPAL_ACTIVITIES',
        type: 'menu',
        path: '/principal/activities',
        component: 'principal/Activities.vue',
        icon: 'calendar-alt',
        sort: 50,
        roles: ['admin', 'principal'],
        children: []
      },
      {
        name: '海报管理',
        code: 'PRINCIPAL_POSTER',
        type: 'menu',
        path: '/principal/poster',
        component: 'principal/poster/index.vue',
        icon: 'image',
        sort: 60,
        roles: ['admin', 'principal'],
        children: [
          { name: '海报编辑器', code: 'PRINCIPAL_POSTER_EDITOR', type: 'menu', path: '/principal/poster-editor', component: 'principal/PosterEditor.vue', icon: 'edit', sort: 10, roles: ['admin', 'principal'] },
          { name: '海报生成器', code: 'PRINCIPAL_POSTER_GENERATOR', type: 'menu', path: '/principal/poster-generator', component: 'principal/PosterGenerator.vue', icon: 'magic', sort: 20, roles: ['admin', 'principal'] },
          { name: '海报模板', code: 'PRINCIPAL_POSTER_TEMPLATES', type: 'menu', path: '/principal/poster-templates', component: 'principal/PosterTemplates.vue', icon: 'copy', sort: 30, roles: ['admin', 'principal'] }
        ]
      }
    ]
  },

  // 一级分类：AI系统 (AI System)
  {
    name: 'AI系统',
    code: 'AI_SYSTEM_CATEGORY',
    type: 'category',
    path: '#ai-system',
    icon: 'robot',
    sort: 60,
    children: [
      {
        name: 'AI助手',
        code: 'AI_ASSISTANT',
        type: 'menu',
        path: '/ai',
        component: 'ai.vue',
        icon: 'robot',
        sort: 10,
        roles: ['admin', 'principal', 'teacher'],
        children: [
          { name: 'AI智能助手', code: 'AI_ASSISTANT_PAGE', type: 'menu', path: '/ai/assistant', component: 'ai/AIAssistantPage.vue', icon: 'robot', sort: 10, roles: ['admin', 'principal', 'teacher'] },
          { name: 'AI聊天界面', code: 'AI_CHAT_INTERFACE', type: 'menu', path: '/ai/chat-interface', component: 'ai/ChatInterface.vue', icon: 'comments', sort: 20, roles: ['admin', 'principal', 'teacher'] },
          { name: 'AI专家咨询', code: 'AI_EXPERT_CONSULTATION', type: 'menu', path: '/ai/expert-consultation', component: 'ai/ExpertConsultationPage.vue', icon: 'user-md', sort: 30, roles: ['admin', 'principal', 'teacher'] }
        ]
      },
      {
        name: 'AI管理',
        code: 'AI_MANAGEMENT',
        type: 'menu',
        path: '/ai/management',
        component: 'ai/management/index.vue',
        icon: 'cog',
        sort: 20,
        roles: ['admin', 'principal'],
        children: [
          { name: 'AI记忆管理', code: 'AI_MEMORY_MANAGEMENT', type: 'menu', path: '/ai/memory-management', component: 'ai/MemoryManagementPage.vue', icon: 'brain', sort: 10, roles: ['admin', 'principal'] },
          { name: 'AI模型管理', code: 'AI_MODEL_MANAGEMENT', type: 'menu', path: '/ai/model-management', component: 'ai/ModelManagementPage.vue', icon: 'database', sort: 20, roles: ['admin', 'principal'] }
        ]
      },
      {
        name: 'AI高级功能',
        code: 'AI_ADVANCED',
        type: 'menu',
        path: '/ai/advanced',
        component: 'ai/advanced/index.vue',
        icon: 'magic',
        sort: 30,
        roles: ['admin'],
        children: [
          { name: 'NLP分析', code: 'AI_NLP_ANALYTICS', type: 'menu', path: '/ai/conversation/nlp-analytics', component: 'ai/conversation/nlp-analytics.vue', icon: 'language', sort: 10, roles: ['admin'] },
          { name: '深度学习预测', code: 'AI_DEEP_LEARNING_PREDICTION', type: 'menu', path: '/ai/deep-learning/prediction-engine', component: 'ai/deep-learning/prediction-engine.vue', icon: 'brain', sort: 20, roles: ['admin'] },
          { name: '预测维护优化', code: 'AI_PREDICTIVE_MAINTENANCE', type: 'menu', path: '/ai/predictive/maintenance-optimizer', component: 'ai/predictive/maintenance-optimizer.vue', icon: 'wrench', sort: 30, roles: ['admin'] },
          { name: '3D可视化分析', code: 'AI_3D_VISUALIZATION', type: 'menu', path: '/ai/visualization/3d-analytics', component: 'ai/visualization/3d-analytics.vue', icon: 'cube', sort: 40, roles: ['admin'] }
        ]
      },
      {
        name: '聊天功能',
        code: 'CHAT',
        type: 'menu',
        path: '/chat',
        component: 'chat/index.vue',
        icon: 'comments',
        sort: 40,
        roles: ['admin', 'principal', 'teacher'],
        children: []
      }
    ]
  },

  // 一级分类：营销管理 (Marketing)
  {
    name: '营销管理',
    code: 'MARKETING_CATEGORY',
    type: 'category',
    path: '#marketing',
    icon: 'bullhorn',
    sort: 70,
    children: [
      {
        name: '营销概览',
        code: 'MARKETING_OVERVIEW',
        type: 'menu',
        path: '/marketing',
        component: 'marketing.vue',
        icon: 'chart-pie',
        sort: 10,
        roles: ['admin', 'principal'],
        children: [
          { name: '智能营销引擎', code: 'MARKETING_INTELLIGENT_ENGINE', type: 'menu', path: '/marketing/automation/intelligent-engine', component: 'marketing/automation/intelligent-engine.vue', icon: 'robot', sort: 10, roles: ['admin', 'principal'] }
        ]
      },
      {
        name: '广告管理',
        code: 'ADVERTISEMENTS',
        type: 'menu',
        path: '/advertisement',
        component: 'advertisement/index.vue',
        icon: 'ad',
        sort: 20,
        roles: ['admin', 'principal'],
        children: []
      }
    ]
  },

  // 一级分类：统计分析 (Statistics)
  {
    name: '统计分析',
    code: 'STATISTICS_CATEGORY',
    type: 'category',
    path: '#statistics',
    icon: 'chart-bar',
    sort: 80,
    children: [
      {
        name: '统计概览',
        code: 'STATISTICS_OVERVIEW',
        type: 'menu',
        path: '/statistics',
        component: 'statistics/index.vue',
        icon: 'chart-line',
        sort: 10,
        roles: ['admin', 'principal'],
        children: []
      },
      {
        name: '报告构建器',
        code: 'REPORT_BUILDER',
        type: 'menu',
        path: '/analytics/report-builder',
        component: 'analytics/ReportBuilder.vue',
        icon: 'file-chart',
        sort: 20,
        roles: ['admin', 'principal'],
        children: []
      }
    ]
  },

  // 一级分类：系统管理 (System Management)
  {
    name: '系统管理',
    code: 'SYSTEM_CATEGORY',
    type: 'category',
    path: '#system',
    icon: 'cog',
    sort: 90,
    children: [
      {
        name: '用户管理',
        code: 'USERS',
        type: 'menu',
        path: '/system/users',
        component: 'system/users/index.vue',
        icon: 'users',
        sort: 10,
        roles: ['admin'],
        children: []
      },
      {
        name: '角色管理',
        code: 'ROLES',
        type: 'menu',
        path: '/system/roles',
        component: 'system/roles/index.vue',
        icon: 'user-tag',
        sort: 20,
        roles: ['admin'],
        children: []
      },
      {
        name: '权限管理',
        code: 'PERMISSIONS',
        type: 'menu',
        path: '/system/permissions',
        component: 'system/permissions.vue',
        icon: 'key',
        sort: 30,
        roles: ['admin'],
        children: []
      },
      {
        name: '系统设置',
        code: 'SYSTEM_SETTINGS',
        type: 'menu',
        path: '/system/settings',
        component: 'system/settings/index.vue',
        icon: 'cog',
        sort: 40,
        roles: ['admin'],
        children: []
      },
      {
        name: '系统日志',
        code: 'SYSTEM_LOGS',
        type: 'menu',
        path: '/system/logs',
        component: 'system/Log.vue',
        icon: 'file-text',
        sort: 50,
        roles: ['admin'],
        children: []
      },
      {
        name: '数据备份',
        code: 'SYSTEM_BACKUP',
        type: 'menu',
        path: '/system/backup',
        component: 'system/Backup.vue',
        icon: 'database',
        sort: 60,
        roles: ['admin'],
        children: []
      },
      {
        name: '安全设置',
        code: 'SYSTEM_SECURITY',
        type: 'menu',
        path: '/system/security',
        component: 'system/Security.vue',
        icon: 'shield-alt',
        sort: 70,
        roles: ['admin'],
        children: []
      },
      {
        name: 'AI模型配置',
        code: 'AI_MODEL_CONFIG',
        type: 'menu',
        path: '/system/ai-model-config',
        component: 'system/AIModelConfig.vue',
        icon: 'robot',
        sort: 80,
        roles: ['admin'],
        children: []
      },
      {
        name: '消息模板',
        code: 'MESSAGE_TEMPLATE',
        type: 'menu',
        path: '/system/message-template',
        component: 'system/MessageTemplate.vue',
        icon: 'envelope',
        sort: 90,
        roles: ['admin'],
        children: []
      },
      {
        name: '系统仪表板',
        code: 'SYSTEM_DASHBOARD',
        type: 'menu',
        path: '/system/dashboard',
        component: 'system/Dashboard.vue',
        icon: 'tachometer-alt',
        sort: 100,
        roles: ['admin'],
        children: []
      }
    ]
  }
];

// 需要删除的无效菜单项
export const invalidMenuItems = [
  // 演示和测试页面
  '/example',
  '/standard-template',
  '/demo/global-style-test',
  '/demo/image-uploader-demo',
  '/demo/template-demo',
  '/system/enhanced-example',
  
  // 不存在的功能页面
  '/student/enrollment-status',
  '/teacher/class-assignment',
  '/parent/payment-history',
  '/class/attendance-report',
  '/activity/budget-management',
  '/enrollment/conversion-funnel',
  '/system/backup-restore',
  '/ai/training-data',
  
  // 404错误的API路径
  '/api/students/bulk-import',
  '/api/teachers/performance',
  '/api/classes/optimization',
  '/api/activities/analytics',
  '/api/enrollment/predictions',
  '/api/system/maintenance'
];

// 需要修复路径的菜单项
export const pathFixMapping = {
  '/teacher/management': '/teacher',
  '/student/management': '/student',
  '/class/management': '/class',
  '/parent/management': '/parent',
  '/activity/management': '/activity',
  '/enrollment/management': '/enrollment',
  '/system/user-management': '/system/users',
  '/system/role-management': '/system/roles'
};