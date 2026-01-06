/**
 * 控制台错误检测测试配置
 * 
 * 提供页面组件映射、测试策略配置、错误过滤规则等
 */

export interface PageConfig {
  name: string;
  path: string;
  skipTest?: boolean;
  skipReason?: string;
  expectedErrors?: string[];
  mockRequirements?: string[];
}

export interface ModuleConfig {
  name: string;
  description: string;
  pages: PageConfig[];
  globalMocks?: Record<string, any>;
  setupHooks?: () => void;
  teardownHooks?: () => void;
}

/**
 * 完整的页面组件配置
 * 基于项目实际文件结构动态生成
 */
export const CONSOLE_TEST_CONFIG: Record<string, ModuleConfig> = {
  // 🔐 用户认证模块
  auth: {
    name: '用户认证模块',
    description: '登录、注册、错误页面等认证相关页面',
    pages: [
      { name: 'Login', path: 'Login/index.vue' },
      { name: '403', path: '403.vue' },
      { name: '404', path: '404.vue' },
      { name: 'Register', path: 'Register.vue' },
      { name: 'NotFound', path: 'NotFound.vue' },
      { name: 'Error', path: 'Error.vue' }
    ]
  },

  // 📊 仪表板模块
  dashboard: {
    name: '仪表板模块',
    description: '主仪表板、数据统计、日程安排等核心功能页面',
    pages: [
      { name: 'Dashboard', path: 'dashboard/index.vue' },
      { name: 'Schedule', path: 'dashboard/Schedule.vue' },
      { name: 'DataStatistics', path: 'dashboard/DataStatistics.vue' },
      { name: 'ImportantNotices', path: 'dashboard/ImportantNotices.vue' },
      { name: 'CampusOverview', path: 'dashboard/CampusOverview.vue' },
      { name: 'Analytics', path: 'dashboard/Analytics.vue' },
      { name: 'Performance', path: 'dashboard/Performance.vue' },
      { name: 'CustomLayout', path: 'dashboard/CustomLayout.vue' },
      { name: 'ClassCreate', path: 'dashboard/ClassCreate.vue' },
      { name: 'ClassDetail', path: 'dashboard/ClassDetail.vue' },
      { name: 'ClassList', path: 'dashboard/ClassList.vue' }
    ],
    mockRequirements: ['dashboardApi', 'statisticsApi', 'scheduleApi']
  },

  // 🎯 活动管理模块
  activity: {
    name: '活动管理模块',
    description: 'AI活动规划、活动分析、活动优化等智能化功能',
    pages: [
      { name: 'ActivityList', path: 'activity/ActivityList.vue' },
      { name: 'ActivityDetail', path: 'activity/ActivityDetail.vue' },
      { name: 'ActivityCreate', path: 'activity/ActivityCreate.vue' },
      { name: 'ActivityEdit', path: 'activity/ActivityEdit.vue' },
      { name: 'ActivityForm', path: 'activity/ActivityForm.vue' },
      { name: 'ActivityTemplate', path: 'activity/ActivityTemplate.vue' },
      { name: 'ActivityIndex', path: 'activity/index.vue' }
    ],
    mockRequirements: ['activityApi', 'aiPlannerApi']
  },

  // 🤖 AI智能模块
  ai: {
    name: 'AI智能模块',
    description: 'AI助手、专家咨询、记忆管理、模型管理等AI功能',
    pages: [
      { name: 'AIAssistantPage', path: 'ai/AIAssistantPage.vue' },
      { name: 'ChatInterface', path: 'ai/ChatInterface.vue' },
      { name: 'ExpertConsultationPage', path: 'ai/ExpertConsultationPage.vue' },
      { name: 'MemoryManagementPage', path: 'ai/MemoryManagementPage.vue' },
      { name: 'ModelManagementPage', path: 'ai/ModelManagementPage.vue' },
      { name: 'AIQueryInterface', path: 'ai/AIQueryInterface.vue' },
      { name: 'DocumentImportPage', path: 'ai/DocumentImportPage.vue' }
    ],
    mockRequirements: ['aiApi', 'chatApi', 'modelApi'],
    expectedErrors: ['WebSocket connection failed'] // AI功能可能的预期错误
  },

  // 🏫 教育管理模块
  education: {
    name: '教育管理模块',
    description: '学生、教师、家长、班级管理等教育核心功能',
    pages: [
      { name: 'StudentIndex', path: 'student/index.vue' },
      { name: 'StudentSearch', path: 'student/StudentSearch.vue' },
      { name: 'StudentStatistics', path: 'student/StudentStatistics.vue' },
      { name: 'TeacherIndex', path: 'teacher/index.vue' },
      { name: 'TeacherList', path: 'teacher/TeacherList.vue' },
      { name: 'TeacherDetail', path: 'teacher/TeacherDetail.vue' },
      { name: 'TeacherEdit', path: 'teacher/TeacherEdit.vue' },
      { name: 'TeacherStatistics', path: 'teacher/TeacherStatistics.vue' },
      { name: 'TeacherAdd', path: 'teacher/add.vue' },
      { name: 'TeacherCustomers', path: 'teacher/customers.vue' },
      { name: 'ClassIndex', path: 'class/index.vue' },
      { name: 'ClassStatistics', path: 'class/ClassStatistics.vue' },
      { name: 'ParentIndex', path: 'parent/index.vue' },
      { name: 'ParentList', path: 'parent/ParentList.vue' },
      { name: 'ParentDetail', path: 'parent/ParentDetail.vue' },
      { name: 'ParentEdit', path: 'parent/ParentEdit.vue' },
      { name: 'ParentProfile', path: 'parent/ParentProfile.vue' },
      { name: 'ParentSearch', path: 'parent/ParentSearch.vue' },
      { name: 'ParentStatistics', path: 'parent/ParentStatistics.vue' },
      { name: 'AssignActivity', path: 'parent/AssignActivity.vue' },
      { name: 'ChildGrowth', path: 'parent/ChildGrowth.vue' },
      { name: 'ChildrenList', path: 'parent/ChildrenList.vue' },
      { name: 'FollowUp', path: 'parent/FollowUp.vue' }
    ],
    mockRequirements: ['studentApi', 'teacherApi', 'parentApi', 'classApi']
  },

  // 📝 招生管理模块
  enrollment: {
    name: '招生管理模块',
    description: '招生计划、申请管理、智能规划等招生相关功能',
    pages: [
      { name: 'EnrollmentIndex', path: 'enrollment/index.vue' },
      { name: 'EnrollmentCreate', path: 'enrollment/EnrollmentCreate.vue' },
      { name: 'EnrollmentDetail', path: 'enrollment/EnrollmentDetail.vue' },
      { name: 'AutomatedFollowUp', path: 'enrollment/automated-follow-up.vue' },
      { name: 'FunnelAnalytics', path: 'enrollment/funnel-analytics.vue' },
      { name: 'PersonalizedStrategy', path: 'enrollment/personalized-strategy.vue' },
      { name: 'ApplicationList', path: 'application/ApplicationList.vue' },
      { name: 'ApplicationDetail', path: 'application/ApplicationDetail.vue' },
      { name: 'Application', path: 'application.vue' },
      { name: 'EnrollmentPlan', path: 'enrollment-plan.vue' },
      { name: 'EnrollmentPlanCreate', path: 'enrollment-plan/EnrollmentCreate.vue' },
      { name: 'EnrollmentStrategy', path: 'enrollment-plan/EnrollmentStrategy.vue' },
      { name: 'PlanList', path: 'enrollment-plan/PlanList.vue' },
      { name: 'PlanDetail', path: 'enrollment-plan/PlanDetail.vue' },
      { name: 'PlanEdit', path: 'enrollment-plan/PlanEdit.vue' },
      { name: 'PlanForm', path: 'enrollment-plan/PlanForm.vue' },
      { name: 'QuotaManage', path: 'enrollment-plan/QuotaManage.vue' },
      { name: 'QuotaManagement', path: 'enrollment-plan/QuotaManagement.vue' },
      { name: 'SmartPlanning', path: 'enrollment-plan/SmartPlanning.vue' },
      { name: 'Statistics', path: 'enrollment-plan/Statistics.vue' },
      { name: 'AIForecasting', path: 'enrollment-plan/ai-forecasting.vue' }
    ],
    mockRequirements: ['enrollmentApi', 'applicationApi', 'planningApi']
  },

  // 🏢 中心页面模块
  centers: {
    name: '中心页面模块',
    description: '各功能中心的集成页面，提供统一的业务入口',
    pages: [
      { name: 'AICenter', path: 'centers/AICenter.vue' },
      { name: 'ActivityCenter', path: 'centers/ActivityCenter.vue' },
      { name: 'AnalyticsCenter', path: 'centers/AnalyticsCenter.vue' },
      { name: 'AnalyticsCenterEnhanced', path: 'centers/AnalyticsCenter-Enhanced.vue' },
      { name: 'AnalyticsCenterOriginal', path: 'centers/AnalyticsCenter-Original.vue' },
      { name: 'BusinessCenter', path: 'centers/BusinessCenter.vue' },
      { name: 'CustomerPoolCenter', path: 'centers/CustomerPoolCenter.vue' },
      { name: 'EnrollmentCenter', path: 'centers/EnrollmentCenter.vue' },
      { name: 'FinanceCenter', path: 'centers/FinanceCenter.vue' },
      { name: 'FinanceCenterOriginal', path: 'centers/FinanceCenter-Original.vue' },
      { name: 'MarketingCenter', path: 'centers/MarketingCenter.vue' },
      { name: 'MarketingCenterEnhanced', path: 'centers/MarketingCenter-Enhanced.vue' },
      { name: 'MarketingCenterOriginal', path: 'centers/MarketingCenter-Original.vue' },
      { name: 'PersonnelCenter', path: 'centers/PersonnelCenter.vue' },
      { name: 'ScriptCenter', path: 'centers/ScriptCenter.vue' },
      { name: 'SystemCenter', path: 'centers/SystemCenter.vue' },
      { name: 'SystemCenterEnhanced', path: 'centers/SystemCenter-Enhanced.vue' },
      { name: 'SystemCenterOriginal', path: 'centers/SystemCenter-Original.vue' },
      { name: 'TaskCenter', path: 'centers/TaskCenter.vue' },
      { name: 'TaskForm', path: 'centers/TaskForm.vue' },
      { name: 'TeachingCenter', path: 'centers/TeachingCenter.vue' }
    ],
    mockRequirements: ['centerApi', 'integrationApi']
  },

  // ⚙️ 系统管理模块
  system: {
    name: '系统管理模块',
    description: '用户管理、角色权限、系统配置等管理功能',
    pages: [
      { name: 'SystemUser', path: 'system/User.vue' },
      { name: 'SystemRole', path: 'system/Role.vue' },
      { name: 'SystemPermission', path: 'system/Permission.vue' },
      { name: 'SystemPermissions', path: 'system/permissions.vue' },
      { name: 'SystemDashboard', path: 'system/Dashboard.vue' },
      { name: 'SystemBackup', path: 'system/Backup.vue' },
      { name: 'SystemLog', path: 'system/Log.vue' },
      { name: 'SystemSecurity', path: 'system/Security.vue' },
      { name: 'AIModelConfig', path: 'system/AIModelConfig.vue' },
      { name: 'MessageTemplate', path: 'system/MessageTemplate.vue' },
      { name: 'EnhancedExample', path: 'system/EnhancedExample.vue' }
    ],
    mockRequirements: ['systemApi', 'userApi', 'roleApi', 'permissionApi']
  },

  // 💰 财务管理模块
  finance: {
    name: '财务管理模块',
    description: '费用管理、支付管理、财务配置等财务功能',
    pages: [
      { name: 'Finance', path: 'Finance.vue' },
      { name: 'FeeManagement', path: 'finance/FeeManagement.vue' },
      { name: 'PaymentManagement', path: 'finance/PaymentManagement.vue' },
      { name: 'FeeConfig', path: 'finance/FeeConfig.vue' },
      { name: 'EnrollmentFinanceLinkage', path: 'finance/EnrollmentFinanceLinkage.vue' }
    ],
    mockRequirements: ['financeApi', 'paymentApi']
  },

  // 📈 营销管理模块
  marketing: {
    name: '营销管理模块',
    description: '营销活动、广告管理等营销功能',
    pages: [
      { name: 'Marketing', path: 'marketing.vue' },
      { name: 'Advertisement', path: 'advertisement/index.vue' }
    ],
    mockRequirements: ['marketingApi', 'advertisementApi']
  },

  // 👥 客户管理模块
  customer: {
    name: '客户管理模块',
    description: '客户信息、客户搜索、客户统计等客户管理功能',
    pages: [
      { name: 'CustomerIndex', path: 'customer/index.vue' },
      { name: 'CustomerSearch', path: 'customer/CustomerSearch.vue' },
      { name: 'CustomerStatistics', path: 'customer/CustomerStatistics.vue' }
    ],
    mockRequirements: ['customerApi']
  },

  // 📊 统计分析模块
  analytics: {
    name: '统计分析模块',
    description: '数据分析、报表构建、统计图表等分析功能',
    pages: [
      { name: 'AnalyticsIndex', path: 'analytics/index.vue' },
      { name: 'ReportBuilder', path: 'analytics/ReportBuilder.vue' },
      { name: 'StatisticsIndex', path: 'statistics/index.vue' }
    ],
    mockRequirements: ['analyticsApi', 'reportApi']
  },

  // 🎨 演示测试模块
  demo: {
    name: '演示测试模块',
    description: '功能演示、样式测试、模板展示等开发辅助页面',
    pages: [
      { name: 'DemoIndex', path: 'demo/index.vue' },
      { name: 'GlobalStyleTest', path: 'demo/GlobalStyleTest.vue' },
      { name: 'ImageUploaderDemo', path: 'demo/ImageUploaderDemo.vue' },
      { name: 'TemplateDemo', path: 'demo/TemplateDemo.vue' },
      { name: 'ExpertTeamDemo', path: 'demo/ExpertTeamDemo.vue' },
      { name: 'KindergartenAIDemo', path: 'demo/KindergartenAIDemo.vue' },
      { name: 'LoginSplitDemo', path: 'demo/LoginSplitDemo.vue' },
      { name: 'MarkdownDemo', path: 'demo/MarkdownDemo.vue' },
      { name: 'SmartExpertDemo', path: 'demo/SmartExpertDemo.vue' },
      { name: 'ThemeTest', path: 'ThemeTest.vue' },
      { name: 'StandardTemplate', path: 'StandardTemplate.vue' },
      { name: 'ExamplePage', path: 'ExamplePage.vue' }
    ]
  },

  // 🏫 校长管理模块
  principal: {
    name: '校长管理模块',
    description: '校长专用的管理功能和决策支持页面',
    pages: [
      { name: 'PrincipalDashboard', path: 'principal/Dashboard.vue' },
      { name: 'PrincipalActivities', path: 'principal/Activities.vue' },
      { name: 'PrincipalBasicInfo', path: 'principal/BasicInfo.vue' },
      { name: 'PrincipalBasicInfoVue', path: 'principal/basic-info.vue' },
      { name: 'PrincipalCustomerPool', path: 'principal/CustomerPool.vue' },
      { name: 'PrincipalMarketingAnalysis', path: 'principal/MarketingAnalysis.vue' },
      { name: 'PrincipalMediaCenter', path: 'principal/MediaCenter.vue' },
      { name: 'PrincipalPerformance', path: 'principal/Performance.vue' },
      { name: 'PrincipalPerformanceRules', path: 'principal/PerformanceRules.vue' },
      { name: 'PrincipalPosterEditor', path: 'principal/PosterEditor.vue' },
      { name: 'PrincipalPosterEditorSimple', path: 'principal/PosterEditorSimple.vue' },
      { name: 'PrincipalPosterGenerator', path: 'principal/PosterGenerator.vue' },
      { name: 'PrincipalPosterTemplates', path: 'principal/PosterTemplates.vue' },
      { name: 'PrincipalReports', path: 'principal/PrincipalReports.vue' }
    ],
    mockRequirements: ['principalApi', 'reportApi']
  },

  // 🔧 测试工具模块
  test: {
    name: '测试工具模块',
    description: '开发测试用的工具页面和功能验证页面',
    pages: [
      { name: 'DataImportTest', path: 'test/DataImportTest.vue' },
      { name: 'FormModalTest', path: 'test/FormModalTest.vue' },
      { name: 'SimpleFormModalTest', path: 'test/SimpleFormModalTest.vue' },
      { name: 'TestPreview', path: 'test-preview.vue' },
      { name: 'PermissionTest', path: 'permission-test.vue' }
    ]
  },

  // 📄 其他页面模块
  others: {
    name: '其他页面模块',
    description: '通用功能页面和辅助页面',
    pages: [
      { name: 'About', path: 'About.vue' },
      { name: 'Contact', path: 'Contact.vue' },
      { name: 'Help', path: 'Help.vue' },
      { name: 'Messages', path: 'Messages.vue' },
      { name: 'Notifications', path: 'Notifications.vue' },
      { name: 'Profile', path: 'Profile.vue' },
      { name: 'ProfileSettings', path: 'ProfileSettings.vue' },
      { name: 'Search', path: 'Search.vue' },
      { name: 'ExperienceSchedule', path: 'experience/ExperienceSchedule.vue' },
      { name: 'AsyncLoadingDemo', path: 'examples/AsyncLoadingDemo.vue' },
      { name: 'ImageReplacementManager', path: 'admin/ImageReplacementManager.vue' },
      { name: 'ImageReplacement', path: 'admin/image-replacement.vue' },
      { name: 'AIFunctionTools', path: 'ai-center/function-tools.vue' },
      { name: 'MobileLogin', path: 'mobile/Login.vue' }
    ]
  }
};

/**
 * 获取所有页面配置的统计信息
 */
export function getTestStatistics() {
  const modules = Object.keys(CONSOLE_TEST_CONFIG);
  const totalPages = Object.values(CONSOLE_TEST_CONFIG).reduce(
    (sum, module) => sum + module.pages.length, 
    0
  );
  
  return {
    totalModules: modules.length,
    totalPages,
    moduleBreakdown: Object.entries(CONSOLE_TEST_CONFIG).map(([key, config]) => ({
      name: config.name,
      key,
      pageCount: config.pages.length,
      description: config.description
    }))
  };
}

/**
 * 获取需要跳过的页面列表
 */
export function getSkippedPages() {
  const skipped: Array<{ module: string; page: string; reason: string }> = [];
  
  Object.entries(CONSOLE_TEST_CONFIG).forEach(([moduleKey, module]) => {
    module.pages.forEach(page => {
      if (page.skipTest) {
        skipped.push({
          module: moduleKey,
          page: page.name,
          reason: page.skipReason || 'No reason provided'
        });
      }
    });
  });
  
  return skipped;
}

/**
 * 获取预期错误的页面列表
 */
export function getPagesWithExpectedErrors() {
  const withErrors: Array<{ module: string; page: string; errors: string[] }> = [];
  
  Object.entries(CONSOLE_TEST_CONFIG).forEach(([moduleKey, module]) => {
    module.pages.forEach(page => {
      if (page.expectedErrors && page.expectedErrors.length > 0) {
        withErrors.push({
          module: moduleKey,
          page: page.name,
          errors: page.expectedErrors
        });
      }
    });
  });
  
  return withErrors;
}
