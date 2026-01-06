import fs from 'fs';
import path from 'path';

// 从路由文件中提取菜单链接
function extractMenuLinksFromRoutes() {
  const routeFile = fs.readFileSync('client/src/router/optimized-routes.ts', 'utf8');
  
  // 提取所有路由定义
  const routes = [];
  
  // 匹配路由对象的正则表达式
  const routePattern = /{\s*path:\s*['"`]([^'"`]+)['"`][^}]*name:\s*['"`]([^'"`]+)['"`][^}]*meta:\s*{[^}]*title:\s*['"`]([^'"`]+)['"`][^}]*icon:\s*['"`]([^'"`]+)['"`][^}]*}/g;
  
  let match;
  while ((match = routePattern.exec(routeFile)) !== null) {
    const [, path, name, title, icon] = match;
    if (!path.includes(':') && !title.includes('详情') && !title.includes('编辑')) {
      routes.push({
        path: path.startsWith('/') ? path : `/${path}`,
        name,
        title,
        icon,
        type: 'route'
      });
    }
  }
  
  // 手动提取主要菜单项（基于实际观察）
  const mainMenuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      title: '仪表板',
      icon: 'Dashboard',
      type: 'main',
      children: [
        { path: '/dashboard/campus-overview', title: '校园概览' },
        { path: '/dashboard/data-statistics', title: '数据统计' },
        { path: '/dashboard/important-notices', title: '重要通知' },
        { path: '/dashboard/schedule', title: '日程安排' },
        { path: '/dashboard/analytics', title: '仪表板分析' },
        { path: '/dashboard/performance', title: '仪表板绩效' }
      ]
    },
    {
      path: '/class',
      name: 'ClassManagement',
      title: '班级管理',
      icon: 'School',
      type: 'main',
      children: [
        { path: '/class/detail/:id', title: '班级详情' },
        { path: '/class/smart-management/:id', title: '班级智能管理' },
        { path: '/class/analytics/class-analytics', title: '班级分析' },
        { path: '/class/optimization/class-optimization', title: '班级优化' }
      ]
    },
    {
      path: '/student',
      name: 'StudentManagement',
      title: '学生管理',
      icon: 'User',
      type: 'main',
      children: [
        { path: '/student/detail/:id', title: '学生详情' },
        { path: '/student/analytics/:id', title: '学生分析' },
        { path: '/student/:id/growth', title: '学生成长' },
        { path: '/student/assessment/student-assessment', title: '学生评估' }
      ]
    },
    {
      path: '/teacher',
      name: 'TeacherManagement',
      title: '教师管理',
      icon: 'UserFilled',
      type: 'main',
      children: [
        { path: '/teacher', title: '教师列表' },
        { path: '/teacher/detail/:id', title: '教师详情' },
        { path: '/teacher/performance/:id', title: '教师绩效' },
        { path: '/teacher/development/teacher-development', title: '教师发展' },
        { path: '/teacher/evaluation/teacher-evaluation', title: '教师评估' }
      ]
    },
    {
      path: '/parent',
      name: 'ParentManagement',
      title: '家长管理',
      icon: 'Avatar',
      type: 'main',
      children: [
        { path: '/parent', title: '家长列表' },
        { path: '/parent/detail/:id', title: '家长详情' },
        { path: '/parent/FollowUp', title: '家长跟进' },
        { path: '/parent/communication/smart-hub', title: '家长沟通中心' },
        { path: '/parent/ChildGrowth', title: '儿童成长' },
        { path: '/parent/feedback/parent-feedback', title: '家长反馈' }
      ]
    },
    {
      path: '/enrollment-plan',
      name: 'EnrollmentPlan',
      title: '招生计划',
      icon: 'Calendar',
      type: 'main',
      children: [
        { path: '/enrollment-plan', title: '计划列表' },
        { path: '/enrollment-plan/create', title: '创建计划' },
        { path: '/enrollment-plan/quota-manage', title: '配额管理' },
        { path: '/enrollment-plan/statistics', title: '招生统计' },
        { path: '/enrollment-plan/smart-planning/smart-planning', title: '智能规划' },
        { path: '/enrollment-plan/forecast/enrollment-forecast', title: '招生预测' },
        { path: '/enrollment-plan/strategy/enrollment-strategy', title: '招生策略' }
      ]
    },
    {
      path: '/enrollment',
      name: 'EnrollmentManagement',
      title: '招生管理',
      icon: 'DocumentAdd',
      type: 'main',
      children: [
        { path: '/enrollment', title: '招生活动' },
        { path: '/enrollment/consultation', title: '咨询管理' },
        { path: '/enrollment/interview', title: '面试管理' },
        { path: '/enrollment/notification', title: '通知管理' }
      ]
    },
    {
      path: '/activity',
      name: 'ActivityManagement',
      title: '活动管理',
      icon: 'Calendar',
      type: 'main',
      children: [
        { path: '/activity', title: '活动列表' },
        { path: '/activity/create', title: '创建活动' },
        { path: '/activity/detail/:id', title: '活动详情' },
        { path: '/activity/registration', title: '活动报名' },
        { path: '/activity/evaluation', title: '活动评估' }
      ]
    },
    {
      path: '/application',
      name: 'ApplicationManagement',
      title: '申请管理',
      icon: 'Document',
      type: 'main',
      children: [
        { path: '/application', title: '申请列表' },
        { path: '/application/detail/:id', title: '申请详情' }
      ]
    },
    {
      path: '/customer',
      name: 'CustomerManagement',
      title: '客户管理',
      icon: 'User',
      type: 'main',
      children: [
        { path: '/customer', title: '客户列表' },
        { path: '/customer/pool', title: '客户池' }
      ]
    },
    {
      path: '/ai',
      name: 'AIAssistant',
      title: 'AI助手',
      icon: 'Robot',
      type: 'main',
      children: [
        { path: '/ai/assistant', title: 'AI助手' },
        { path: '/ai/model-management', title: '模型管理' },
        { path: '/ai/expert-consultation', title: '专家咨询' },
        { path: '/ai/memory-management', title: '记忆管理' },
        { path: '/ai/predictive/maintenance-optimizer', title: '维护优化器' }
      ]
    },
    {
      path: '/principal',
      name: 'PrincipalDashboard',
      title: '园长功能',
      icon: 'Crown',
      type: 'main',
      children: [
        { path: '/principal/dashboard', title: '园长仪表板' },
        { path: '/principal/activities', title: '园长活动' },
        { path: '/principal/customer-pool', title: '客户池' },
        { path: '/principal/marketing-analysis', title: '营销分析' },
        { path: '/principal/performance', title: '绩效管理' },
        { path: '/principal/poster-editor', title: '海报编辑器' },
        { path: '/principal/poster-generator', title: '海报生成器' }
      ]
    },
    {
      path: '/marketing',
      name: 'MarketingManagement',
      title: '营销管理',
      icon: 'TrendCharts',
      type: 'main',
      children: [
        { path: '/marketing/campaigns', title: '营销活动' },
        { path: '/marketing/advertisements', title: '广告管理' },
        { path: '/marketing/coupons', title: '优惠券管理' },
        { path: '/marketing/referrals', title: '推荐管理' }
      ]
    },
    {
      path: '/analytics',
      name: 'AnalyticsManagement',
      title: '分析报告',
      icon: 'DataAnalysis',
      type: 'main',
      children: [
        { path: '/analytics/enrollment', title: '招生分析' },
        { path: '/analytics/financial', title: '财务分析' },
        { path: '/analytics/performance', title: '绩效分析' },
        { path: '/analytics/predictive', title: '预测分析' }
      ]
    },
    {
      path: '/system',
      name: 'SystemManagement',
      title: '系统管理',
      icon: 'Setting',
      type: 'main',
      children: [
        { path: '/system/users', title: '用户管理' },
        { path: '/system/roles', title: '角色管理' },
        { path: '/system/permissions', title: '权限管理' },
        { path: '/system/logs', title: '日志管理' },
        { path: '/system/backup', title: '备份管理' },
        { path: '/system/settings', title: '系统设置' },
        { path: '/system/ai-model-config', title: 'AI模型配置' }
      ]
    }
  ];
  
  return {
    totalMainMenus: mainMenuItems.length,
    totalSubMenus: mainMenuItems.reduce((acc, item) => acc + (item.children?.length || 0), 0),
    menuItems: mainMenuItems,
    extractedRoutes: routes
  };
}

// 生成API集成测试脚本
function generateAPIIntegrationTests(menuData) {
  const testScript = `
// API集成测试脚本
const API_BASE_URL = 'http://localhost:3000/api';

// 主要菜单项对应的API端点
const menuAPIMapping = {
  '/dashboard': {
    apis: [
      'GET /dashboard/stats',
      'GET /dashboard/recent-activities',
      'GET /dashboard/notifications'
    ]
  },
  '/class': {
    apis: [
      'GET /classes',
      'POST /classes',
      'GET /classes/:id',
      'PUT /classes/:id',
      'DELETE /classes/:id',
      'GET /classes/:id/students',
      'GET /classes/:id/teachers'
    ]
  },
  '/student': {
    apis: [
      'GET /students',
      'POST /students',
      'GET /students/:id',
      'PUT /students/:id',
      'DELETE /students/:id',
      'GET /students/:id/growth',
      'GET /students/:id/assessments'
    ]
  },
  '/teacher': {
    apis: [
      'GET /teachers',
      'POST /teachers',
      'GET /teachers/:id',
      'PUT /teachers/:id',
      'DELETE /teachers/:id',
      'GET /teachers/:id/performance',
      'GET /teachers/:id/classes'
    ]
  },
  '/parent': {
    apis: [
      'GET /parents',
      'POST /parents',
      'GET /parents/:id',
      'PUT /parents/:id',
      'DELETE /parents/:id',
      'GET /parents/:id/children',
      'GET /parents/:id/followups'
    ]
  },
  '/enrollment-plan': {
    apis: [
      'GET /enrollment-plans',
      'POST /enrollment-plans',
      'GET /enrollment-plans/:id',
      'PUT /enrollment-plans/:id',
      'DELETE /enrollment-plans/:id',
      'GET /enrollment-plans/:id/statistics'
    ]
  },
  '/enrollment': {
    apis: [
      'GET /enrollment/applications',
      'POST /enrollment/applications',
      'GET /enrollment/consultations',
      'GET /enrollment/interviews'
    ]
  },
  '/activity': {
    apis: [
      'GET /activities',
      'POST /activities',
      'GET /activities/:id',
      'PUT /activities/:id',
      'DELETE /activities/:id',
      'GET /activities/:id/registrations'
    ]
  },
  '/application': {
    apis: [
      'GET /applications',
      'POST /applications',
      'GET /applications/:id',
      'PUT /applications/:id'
    ]
  },
  '/ai': {
    apis: [
      'GET /ai/conversations',
      'POST /ai/conversations',
      'GET /ai/models',
      'POST /ai/chat'
    ]
  },
  '/system': {
    apis: [
      'GET /system/users',
      'GET /system/roles',
      'GET /system/permissions',
      'GET /system/logs'
    ]
  }
};

// 测试函数
async function testMenuAPIIntegration() {
  console.log('🚀 开始测试菜单与API集成...');
  
  for (const [menuPath, config] of Object.entries(menuAPIMapping)) {
    console.log(\`\\n📋 测试菜单: \${menuPath}\`);
    
    for (const api of config.apis) {
      const [method, endpoint] = api.split(' ');
      const url = \`\${API_BASE_URL}\${endpoint.replace(':id', '1')}\`;
      
      try {
        const response = await fetch(url, { method });
        const status = response.status;
        console.log(\`  \${status >= 200 && status < 300 ? '✅' : '❌'} \${api} - \${status}\`);
      } catch (error) {
        console.log(\`  ❌ \${api} - 连接失败\`);
      }
    }
  }
}

export { menuAPIMapping, testMenuAPIIntegration };
`;

  return testScript;
}

// 主函数
function main() {
  console.log('🔍 正在提取菜单链接...\n');
  
  const menuData = extractMenuLinksFromRoutes();
  
  console.log('📊 菜单统计:');
  console.log('=' .repeat(50));
  console.log(`🌐 主菜单数量: ${menuData.totalMainMenus}`);
  console.log(`📝 子菜单数量: ${menuData.totalSubMenus}`);
  console.log(`🔗 总链接数量: ${menuData.totalMainMenus + menuData.totalSubMenus}`);
  console.log('=' .repeat(50));
  
  console.log('\n📋 主要菜单项:');
  console.log('-' .repeat(50));
  menuData.menuItems.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title} (${item.path})`);
    if (item.children && item.children.length > 0) {
      item.children.forEach(child => {
        console.log(`   - ${child.title} (${child.path})`);
      });
    }
  });
  
  // 生成API集成测试
  const testScript = generateAPIIntegrationTests(menuData);
  fs.writeFileSync('api-integration-test.js', testScript);
  
  // 保存菜单数据
  fs.writeFileSync('menu-links.json', JSON.stringify(menuData, null, 2));
  
  console.log('\n✅ 菜单链接提取完成!');
  console.log('📄 菜单数据已保存到: menu-links.json');
  console.log('🧪 API集成测试已生成: api-integration-test.js');
  
  return menuData;
}

main();
