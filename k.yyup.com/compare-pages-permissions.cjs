const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

// 前端页面文件列表（从VUE.MD文档中提取的162个页面）
const frontendPages = [
  // 错误页面
  { path: 'pages/403.vue', name: '403错误页面' },
  { path: 'pages/404.vue', name: '404错误页面' },
  { path: 'pages/ExamplePage.vue', name: '示例页面' },
  { path: 'pages/StandardTemplate.vue', name: '标准模板页面' },
  { path: 'pages/application.vue', name: '申请页面' },
  { path: 'pages/enrollment-plan.vue', name: '招生计划页面' },
  { path: 'pages/marketing.vue', name: '营销页面' },
  
  // 登录模块
  { path: 'pages/Login/index.vue', name: '登录页面' },
  
  // 活动管理模块 (18个页面)
  { path: 'pages/activity/ActivityCreate.vue', name: '创建活动' },
  { path: 'pages/activity/ActivityDetail.vue', name: '活动详情' },
  { path: 'pages/activity/ActivityEdit.vue', name: '编辑活动' },
  { path: 'pages/activity/ActivityForm.vue', name: '活动表单' },
  { path: 'pages/activity/ActivityList.vue', name: '活动列表' },
  { path: 'pages/activity/index.vue', name: '活动首页' },
  { path: 'pages/activity/analytics/ActivityAnalytics.vue', name: '活动分析' },
  { path: 'pages/activity/analytics/intelligent-analysis.vue', name: '智能分析' },
  { path: 'pages/activity/detail/_id.vue', name: '动态ID详情' },
  { path: 'pages/activity/evaluation/ActivityEvaluation.vue', name: '活动评估' },
  { path: 'pages/activity/optimization/ActivityOptimizer.vue', name: '活动优化器' },
  { path: 'pages/activity/plan/ActivityPlanner.vue', name: '活动计划器' },
  { path: 'pages/activity/registration/RegistrationDashboard.vue', name: '报名仪表板' },
  
  // 广告模块
  { path: 'pages/advertisement/index.vue', name: '广告首页' },
  
  // AI功能模块 (19个页面)
  { path: 'pages/ai/AIAssistantPage.vue', name: 'AI助手页面' },
  { path: 'pages/ai/AIQueryInterface.vue', name: 'AI查询界面' },
  { path: 'pages/ai/ChatInterface.vue', name: '聊天界面' },
  { path: 'pages/ai/ExpertConsultationPage.vue', name: '专家咨询页面' },
  { path: 'pages/ai/MemoryManagementPage.vue', name: '内存管理页面' },
  { path: 'pages/ai/ModelManagementPage.vue', name: '模型管理页面' },
  { path: 'pages/ai/components/ExampleQueriesDialog.vue', name: '示例查询对话框' },
  { path: 'pages/ai/components/FeedbackDialog.vue', name: '反馈对话框' },
  { path: 'pages/ai/components/QueryHistoryDialog.vue', name: '查询历史对话框' },
  { path: 'pages/ai/components/QueryResultDisplay.vue', name: '查询结果显示' },
  { path: 'pages/ai/components/QueryTemplatesDialog.vue', name: '查询模板对话框' },
  { path: 'pages/ai/conversation/nlp-analytics.vue', name: 'NLP分析' },
  { path: 'pages/ai/deep-learning/prediction-engine.vue', name: '预测引擎' },
  { path: 'pages/ai/predictive/maintenance-optimizer.vue', name: '维护优化器' },
  { path: 'pages/ai/visualization/3d-analytics.vue', name: '3D分析' },
  
  // 分析模块
  { path: 'pages/analytics/ReportBuilder.vue', name: '报告构建器' },
  { path: 'pages/analytics/index.vue', name: '分析首页' },
  
  // 申请管理模块
  { path: 'pages/application/ApplicationDetail.vue', name: '申请详情' },
  { path: 'pages/application/ApplicationList.vue', name: '申请列表' },
  { path: 'pages/application/interview/ApplicationInterview.vue', name: '申请面试' },
  { path: 'pages/application/review/ApplicationReview.vue', name: '申请审核' },
  
  // 聊天模块
  { path: 'pages/chat/index.vue', name: '聊天首页' },
  
  // 班级管理模块 (12个页面)
  { path: 'pages/class/index.vue', name: '班级首页' },
  { path: 'pages/class/analytics/ClassAnalytics.vue', name: '班级分析' },
  { path: 'pages/class/components/ClassDetailDialog.vue', name: '班级详情对话框' },
  { path: 'pages/class/components/ClassFormDialog.vue', name: '班级表单对话框' },
  { path: 'pages/class/detail/ClassDetail.vue', name: '班级详情' },
  { path: 'pages/class/detail/[id].vue', name: '动态ID详情' },
  { path: 'pages/class/optimization/ClassOptimization.vue', name: '班级优化' },
  { path: 'pages/class/smart-management/SmartManagement.vue', name: '智能管理' },
  { path: 'pages/class/smart-management/[id].vue', name: '动态ID管理' },
  { path: 'pages/class/students/id.vue', name: '学生ID页面' },
  { path: 'pages/class/teachers/id.vue', name: '教师ID页面' },
  
  // 客户管理模块
  { path: 'pages/customer/index.vue', name: '客户首页' },
  { path: 'pages/customer/analytics/CustomerAnalytics.vue', name: '客户分析' },
  { path: 'pages/customer/detail/CustomerDetail.vue', name: '客户详情' },
  { path: 'pages/customer/lifecycle/intelligent-management.vue', name: '智能管理' },
  
  // 仪表板模块 (12个页面)
  { path: 'pages/dashboard/Analytics.vue', name: '分析仪表板' },
  { path: 'pages/dashboard/CampusOverview.vue', name: '校园概览' },
  { path: 'pages/dashboard/ClassCreate.vue', name: '创建班级' },
  { path: 'pages/dashboard/ClassDetail.vue', name: '班级详情' },
  { path: 'pages/dashboard/ClassList.vue', name: '班级列表' },
  { path: 'pages/dashboard/CustomLayout.vue', name: '自定义布局' },
  { path: 'pages/dashboard/DataStatistics.vue', name: '数据统计' },
  { path: 'pages/dashboard/ImportantNotices.vue', name: '重要通知' },
  { path: 'pages/dashboard/Performance.vue', name: '性能监控' },
  { path: 'pages/dashboard/Schedule.vue', name: '日程安排' },
  { path: 'pages/dashboard/index.vue', name: '仪表板首页' },
  { path: 'pages/dashboard/analytics/EnrollmentTrends.vue', name: '招生趋势' },
  { path: 'pages/dashboard/analytics/FinancialAnalysis.vue', name: '财务分析' },
  { path: 'pages/dashboard/analytics/TeacherEffectiveness.vue', name: '教师效能' },
  
  // 演示模块
  { path: 'pages/demo/GlobalStyleTest.vue', name: '全局样式测试' },
  { path: 'pages/demo/ImageUploaderDemo.vue', name: '图片上传演示' },
  { path: 'pages/demo/TemplateDemo.vue', name: '模板演示' },
  
  // 招生模块
  { path: 'pages/enrollment/automated-follow-up.vue', name: '自动跟进' },
  { path: 'pages/enrollment/funnel-analytics.vue', name: '漏斗分析' },
  { path: 'pages/enrollment/index.vue', name: '招生首页' },
  { path: 'pages/enrollment/personalized-strategy.vue', name: '个性化策略' },
  
  // 招生计划模块 (19个页面)
  { path: 'pages/enrollment-plan/PlanDetail.vue', name: '计划详情' },
  { path: 'pages/enrollment-plan/PlanEdit.vue', name: '编辑计划' },
  { path: 'pages/enrollment-plan/PlanForm.vue', name: '计划表单' },
  { path: 'pages/enrollment-plan/PlanList.vue', name: '计划列表' },
  { path: 'pages/enrollment-plan/QuotaManage.vue', name: '配额管理' },
  { path: 'pages/enrollment-plan/QuotaManagement.vue', name: '配额管理' },
  { path: 'pages/enrollment-plan/Statistics.vue', name: '统计报表' },
  { path: 'pages/enrollment-plan/ai-forecasting.vue', name: 'AI预测' },
  { path: 'pages/enrollment-plan/analytics/enrollment-analytics.vue', name: '招生分析' },
  { path: 'pages/enrollment-plan/evaluation/plan-evaluation.vue', name: '计划评估' },
  { path: 'pages/enrollment-plan/forecast/enrollment-forecast.vue', name: '招生预测' },
  { path: 'pages/enrollment-plan/management/PlanManagement.vue', name: '计划管理' },
  { path: 'pages/enrollment-plan/optimization/capacity-optimization.vue', name: '容量优化' },
  { path: 'pages/enrollment-plan/simulation/enrollment-simulation.vue', name: '招生仿真' },
  { path: 'pages/enrollment-plan/smart-planning/smart-planning.vue', name: '智能规划' },
  { path: 'pages/enrollment-plan/strategy/enrollment-strategy.vue', name: '招生策略' },
  { path: 'pages/enrollment-plan/trends/trend-analysis.vue', name: '趋势分析' },
  
  // 示例模块
  { path: 'pages/examples/AsyncLoadingDemo.vue', name: '异步加载演示' },
  
  // 营销管理模块
  { path: 'pages/marketing/index.vue', name: '营销首页' },
  { path: 'pages/marketing/automation/intelligent-engine.vue', name: '智能引擎' },
  
  // 家长管理模块 (12个页面)
  { path: 'pages/parent/AssignActivity.vue', name: '分配活动' },
  { path: 'pages/parent/ChildGrowth.vue', name: '儿童成长' },
  { path: 'pages/parent/ChildrenList.vue', name: '儿童列表' },
  { path: 'pages/parent/FollowUp.vue', name: '跟进记录' },
  { path: 'pages/parent/ParentDetail.vue', name: '家长详情' },
  { path: 'pages/parent/ParentEdit.vue', name: '编辑家长' },
  { path: 'pages/parent/ParentList.vue', name: '家长列表' },
  { path: 'pages/parent/index.vue', name: '家长首页' },
  { path: 'pages/parent/communication/SmartHub.vue', name: '智能中心' },
  { path: 'pages/parent/communication/smart-hub.vue', name: '智能中心' },
  { path: 'pages/parent/edit/ParentEdit.vue', name: '编辑家长' },
  { path: 'pages/parent/feedback/ParentFeedback.vue', name: '家长反馈' },
  
  // 园长功能模块 (12个页面)
  { path: 'pages/principal/Activities.vue', name: '活动管理' },
  { path: 'pages/principal/BasicInfo.vue', name: '基本信息' },
  { path: 'pages/principal/CustomerPool.vue', name: '客户池' },
  { path: 'pages/principal/Dashboard.vue', name: '园长仪表板' },
  { path: 'pages/principal/MarketingAnalysis.vue', name: '营销分析' },
  { path: 'pages/principal/Performance.vue', name: '绩效管理' },
  { path: 'pages/principal/PerformanceRules.vue', name: '绩效规则' },
  { path: 'pages/principal/PosterEditor.vue', name: '海报编辑器' },
  { path: 'pages/principal/PosterGenerator.vue', name: '海报生成器' },
  { path: 'pages/principal/PosterTemplates.vue', name: '海报模板' },
  { path: 'pages/principal/basic-info.vue', name: '基本信息' },
  { path: 'pages/principal/decision-support/intelligent-dashboard.vue', name: '智能仪表板' },
  
  // 统计模块
  { path: 'pages/statistics/index.vue', name: '统计首页' },
  
  // 学生管理模块 (7个页面)
  { path: 'pages/student/index.vue', name: '学生首页' },
  { path: 'pages/student/analytics/StudentAnalytics.vue', name: '学生分析' },
  { path: 'pages/student/analytics/[id].vue', name: '动态ID分析' },
  { path: 'pages/student/assessment/StudentAssessment.vue', name: '学生评估' },
  { path: 'pages/student/detail/StudentDetail.vue', name: '学生详情' },
  { path: 'pages/student/detail/[id].vue', name: '动态ID详情' },
  { path: 'pages/student/growth/StudentGrowth.vue', name: '学生成长' },
  
  // 系统管理模块 (21个页面)
  { path: 'pages/system/AIModelConfig.vue', name: 'AI模型配置' },
  { path: 'pages/system/Backup.vue', name: '备份管理' },
  { path: 'pages/system/Dashboard.vue', name: '系统仪表板' },
  { path: 'pages/system/EnhancedExample.vue', name: '增强示例' },
  { path: 'pages/system/Log.vue', name: '日志管理' },
  { path: 'pages/system/MessageTemplate.vue', name: '消息模板' },
  { path: 'pages/system/Permission.vue', name: '权限管理' },
  { path: 'pages/system/Role.vue', name: '角色管理' },
  { path: 'pages/system/Security.vue', name: '安全管理' },
  { path: 'pages/system/User.vue', name: '用户管理' },
  { path: 'pages/system/permissions.vue', name: '权限页面' },
  { path: 'pages/system/backup/BackupManagement.vue', name: '备份管理' },
  { path: 'pages/system/logs/SystemLogs.vue', name: '系统日志' },
  { path: 'pages/system/maintenance/MaintenanceScheduler.vue', name: '维护调度器' },
  { path: 'pages/system/notifications/NotificationSettings.vue', name: '通知设置' },
  { path: 'pages/system/permissions/index.vue', name: '权限首页' },
  { path: 'pages/system/roles/RoleManagement.vue', name: '角色管理' },
  { path: 'pages/system/roles/index.vue', name: '角色首页' },
  { path: 'pages/system/settings/index.vue', name: '设置首页' },
  { path: 'pages/system/users/index.vue', name: '用户首页' },
  
  // 教师管理模块 (10个页面)
  { path: 'pages/teacher/TeacherDetail.vue', name: '教师详情' },
  { path: 'pages/teacher/TeacherEdit.vue', name: '编辑教师' },
  { path: 'pages/teacher/TeacherList.vue', name: '教师列表' },
  { path: 'pages/teacher/add.vue', name: '添加教师' },
  { path: 'pages/teacher/customers.vue', name: '教师客户' },
  { path: 'pages/teacher/index.vue', name: '教师首页' },
  { path: 'pages/teacher/development/TeacherDevelopment.vue', name: '教师发展' },
  { path: 'pages/teacher/evaluation/TeacherEvaluation.vue', name: '教师评估' },
  { path: 'pages/teacher/performance/TeacherPerformance.vue', name: '教师绩效' },
  { path: 'pages/teacher/performance/[id].vue', name: '动态ID绩效' }
];

async function comparePagePermissions() {
  console.log('=== 对比前端页面与数据库权限记录 ===\n');
  
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'kargerdensales'
    });

    console.log('✅ 数据库连接成功\n');

    // 1. 获取数据库中所有权限记录
    const [permissions] = await connection.execute(`
      SELECT id, name, chinese_name, path, component, parent_id, type
      FROM permissions
      WHERE type = 'menu' OR type IS NULL
      ORDER BY parent_id, id
    `);

    console.log(`📊 数据库权限记录: ${permissions.length} 条\n`);

    // 2. 创建映射关系
    // 将前端路径转换为后端路径格式
    const frontendToBackend = new Map();
    frontendPages.forEach(page => {
      // 转换规则：pages/xxx/yyy.vue -> /xxx/yyy
      const backendPath = '/' + page.path
        .replace('pages/', '')
        .replace('/index.vue', '')
        .replace('.vue', '')
        .replace(/\[id\]/g, ':id');
      
      frontendToBackend.set(page.path, {
        backendPath,
        name: page.name
      });
    });

    // 3. 分析匹配情况
    const dbPaths = new Set(permissions.map(p => p.path).filter(p => p));
    const dbComponents = new Set(permissions.map(p => p.component).filter(c => c));
    
    const matched = [];
    const frontendOnly = [];
    const dbOnly = [];

    // 检查前端页面是否在数据库中
    frontendPages.forEach(page => {
      const mapping = frontendToBackend.get(page.path);
      const backendPath = mapping.backendPath;
      
      // 查找匹配的权限记录
      const matchByPath = permissions.find(p => p.path === backendPath);
      const matchByComponent = permissions.find(p => 
        p.component && (
          p.component.includes(page.path) || 
          p.component.includes(page.path.replace('.vue', ''))
        )
      );
      
      if (matchByPath || matchByComponent) {
        matched.push({
          frontend: page,
          db: matchByPath || matchByComponent,
          matchType: matchByPath ? 'path' : 'component'
        });
      } else {
        frontendOnly.push(page);
      }
    });

    // 检查数据库中没有对应前端页面的权限
    permissions.forEach(perm => {
      if (!perm.path || perm.path === '#') return;
      
      const hasMatch = matched.some(m => 
        m.db.id === perm.id
      );
      
      if (!hasMatch) {
        dbOnly.push(perm);
      }
    });

    // 4. 输出分析结果
    console.log('📋 匹配分析结果:\n');
    console.log(`✅ 匹配的页面: ${matched.length} 个`);
    console.log(`❌ 仅前端存在: ${frontendOnly.length} 个`);
    console.log(`❌ 仅数据库存在: ${dbOnly.length} 个\n`);

    // 5. 显示详细信息
    if (frontendOnly.length > 0) {
      console.log('📄 仅在前端存在的页面（需要添加权限）:');
      console.log('─'.repeat(80));
      frontendOnly.forEach(page => {
        const mapping = frontendToBackend.get(page.path);
        console.log(`路径: ${page.path}`);
        console.log(`名称: ${page.name}`);
        console.log(`建议后端路径: ${mapping.backendPath}`);
        console.log('─'.repeat(80));
      });
      console.log();
    }

    if (dbOnly.length > 0) {
      console.log('🗄️ 仅在数据库存在的权限（可能需要删除）:');
      console.log('─'.repeat(80));
      dbOnly.slice(0, 20).forEach(perm => {
        console.log(`ID: ${perm.id}`);
        console.log(`名称: ${perm.name} (${perm.chinese_name || ''})`);
        console.log(`路径: ${perm.path}`);
        console.log(`组件: ${perm.component || '无'}`);
        console.log('─'.repeat(80));
      });
      if (dbOnly.length > 20) {
        console.log(`... 还有 ${dbOnly.length - 20} 条记录\n`);
      }
    }

    // 6. 生成统计报告
    console.log('\n📊 统计报告:');
    console.log(`前端页面总数: ${frontendPages.length}`);
    console.log(`数据库权限记录: ${permissions.length}`);
    console.log(`成功匹配: ${matched.length} (${(matched.length/frontendPages.length*100).toFixed(1)}%)`);
    console.log(`需要添加权限: ${frontendOnly.length}`);
    console.log(`可能多余权限: ${dbOnly.length}`);

    // 7. 生成建议SQL
    if (frontendOnly.length > 0) {
      console.log('\n💡 建议添加的权限SQL示例:');
      const examplePages = frontendOnly.slice(0, 3);
      examplePages.forEach(page => {
        const mapping = frontendToBackend.get(page.path);
        console.log(`-- ${page.name}`);
        console.log(`INSERT INTO permissions (name, chinese_name, path, component, type, status) VALUES`);
        console.log(`('${page.name}', '${page.name}', '${mapping.backendPath}', '${page.path}', 'menu', 1);`);
        console.log();
      });
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

// 运行对比
comparePagePermissions();