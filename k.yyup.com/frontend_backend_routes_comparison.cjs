const fs = require('fs');
const path = require('path');

// 从后端API获取的路由信息（从curl结果中提取的简化版本）
const backendRoutes = {
  // 核心功能模块
  activities: ['/activities', '/activities/:id', '/activities/statistics', '/activities/:id/registrations'],
  auth: ['/auth/login', '/auth/logout', '/auth/register', '/auth/verify'],
  classes: ['/classes', '/classes/:id', '/classes/statistics', '/classes/:id/students'],
  dashboard: ['/dashboard/overview', '/dashboard/statistics', '/dashboard/real-time/system-status', '/dashboard/charts'],
  users: ['/users', '/users/:id', '/system/users'],
  students: ['/students', '/students/:id', '/students/statistics'],
  teachers: ['/teachers', '/teachers/:id', '/teachers/statistics'],
  parents: ['/parents', '/parents/:id', '/parent/communications/:id'],
  'enrollment-plans': ['/enrollment-plans', '/enrollment-plans/:id', '/enrollment-plans/statistics'],
  'enrollment-applications': ['/enrollment-applications', '/enrollment-applications/:id'],
  'ai': ['/ai/conversations', '/ai/models', '/ai/memory'],
  'ai-query': ['/ai-query/chat', '/ai-query/execute'],
  'system-settings': ['/system/settings', '/system/backup', '/system/permissions'],
  
  // 高级功能（部分实现）
  'activity-registration': ['/activity-registrations', '/activity-registrations/by-activity/:activityId'],
  'customer-pool': ['/customer-pool', '/customer-pool/stats'],
  'enrollment-consultation': ['/enrollment-consultations', '/enrollment-consultations/statistics'],
  'performance-evaluations': ['/performance-evaluations'],
  'marketing-campaigns': ['/marketing-campaigns'],
  'notifications': ['/notifications'],
  
  // 缺失的高级功能
  missing: []
};

// 前端路由（从权限表和路由配置中提取的主要页面）
const frontendPages = {
  // 基础功能页面 - 后端有对应API
  implemented: {
    '/dashboard': '仪表板 - 后端API完整',
    '/dashboard/campus-overview': '校园概览 - 后端API完整',
    '/dashboard/data-statistics': '数据统计 - 后端API完整',
    '/system/settings': '系统设置 - 后端API完整',
    '/user': '用户管理 - 后端API完整',
    '/student': '学生管理 - 后端API完整',
    '/teacher': '教师管理 - 后端API完整',
    '/parent': '家长管理 - 后端API完整',
    '/class': '班级管理 - 后端API完整',
    '/activity': '活动管理 - 后端API完整',
    '/enrollment-plan': '招生计划 - 后端API完整',
    '/application': '招生申请 - 后端API完整',
    '/ai': 'AI助手 - 后端API完整'
  },
  
  // 部分实现 - 前端页面存在，后端API部分缺失
  partial: {
    '/student/statistics': '学生统计 - 后端有基础统计API，缺少专门的学生统计页面API',
    '/teacher/schedule': '教师排程 - 后端有schedule API，但缺少教师专用排程API',
    '/parent/communication/smart-hub': '家长智能沟通 - 后端有基础沟通API，缺少智能化功能API',
    '/ai/memory': 'AI记忆管理 - 后端有基础memory API，缺少统计和管理API',
    '/activity/analytics': '活动分析 - 后端有活动数据，缺少专门的分析API',
    '/class/analytics': '班级分析 - 后端有班级数据，缺少专门的分析API'
  },
  
  // 前端已开发但后端缺失的高级功能
  missing_backend: {
    // 招生管理高级功能
    '/enrollment-plan/ai-forecasting': 'AI招生预测 - 前端完整，后端API缺失',
    '/enrollment-plan/evaluation/plan-evaluation': '招生计划评估 - 前端完整，后端API缺失',
    '/enrollment-plan/optimization/capacity-optimization': '容量优化 - 前端完整，后端API缺失',
    '/enrollment-plan/simulation/enrollment-simulation': '招生仿真 - 前端完整，后端API缺失',
    '/enrollment-plan/smart-planning/smart-planning': '智能规划 - 前端完整，后端API缺失',
    '/enrollment-plan/strategy/enrollment-strategy': '招生策略 - 前端完整，后端API缺失',
    '/enrollment-plan/trends/trend-analysis': '趋势分析 - 前端完整，后端API缺失',
    
    // 活动管理高级功能
    '/activity/analytics/intelligent-analysis': '智能活动分析 - 前端完整，后端AI分析API缺失',
    '/activity/evaluation/ActivityEvaluation': '活动评估 - 前端完整，后端评估API部分缺失',
    '/activity/optimization/ActivityOptimizer': '活动优化 - 前端完整，后端优化API缺失',
    '/activity/plan/ActivityPlanner': '活动规划 - 前端完整，后端规划API缺失',
    
    // 学生管理高级功能
    '/student/analytics/StudentAnalytics': '学生分析 - 前端完整，后端深度分析API缺失',
    '/student/assessment/StudentAssessment': '学生评估 - 前端完整，后端评估系统API缺失',
    '/student/growth/StudentGrowth': '学生成长档案 - 前端完整，后端成长追踪API缺失',
    
    // 教师管理高级功能
    '/teacher/development/TeacherDevelopment': '教师发展 - 前端完整，后端发展规划API缺失',
    '/teacher/performance/TeacherPerformance': '教师绩效 - 前端完整，后端绩效分析API部分缺失',
    '/teacher/performance/ranking': '绩效排行榜 - 前端页面缺失，后端API也缺失',
    '/teacher/customers': '教师客户管理 - 前端完整，后端API缺失',
    
    // 班级管理高级功能
    '/class/smart-management': '智能班级管理 - 前端完整，后端智能化API缺失',
    '/class/optimization': '班级优化 - 前端完整，后端优化算法API缺失',
    
    // 家长管理高级功能
    '/parent/feedback/ParentFeedback': '家长反馈 - 前端完整，后端反馈系统API缺失',
    '/parent/communication/SmartHub': '智能家长沟通 - 前端功能完整，后端AI功能API缺失',
    
    // 客户管理高级功能
    '/customer/analytics/CustomerAnalytics': '客户分析 - 前端完整，后端深度分析API缺失',
    '/customer/lifecycle/intelligent-management': '智能客户管理 - 前端完整，后端智能化API缺失',
    
    // AI功能高级特性
    '/ai/conversation/nlp-analytics': 'NLP分析 - 前端完整，后端NLP处理API缺失',
    '/ai/deep-learning/prediction-engine': '预测引擎 - 前端完整，后端机器学习API缺失',
    '/ai/visualization/3d-analytics': '3D分析 - 前端完整，后端3D数据处理API缺失',
    '/ai/predictive/maintenance-optimizer': '维护优化 - 前端完整，后端预测性维护API缺失',
    
    // 营销管理高级功能
    '/marketing/automation/intelligent-engine': '智能营销引擎 - 前端完整，后端自动化API缺失',
    '/principal/marketing-analysis': '营销分析 - 前端完整，后端深度分析API缺失',
    
    // 系统管理高级功能
    '/system/backup/BackupManagement': '备份管理 - 前端完整，后端自动化备份API部分缺失',
    '/system/logs/SystemLogs': '系统日志 - 前端完整，后端日志分析API缺失',
    '/system/notifications/NotificationSettings': '通知设置 - 前端完整，后端通知系统API缺失',
    '/system/roles/RoleManagement': '角色管理 - 前端完整，后端高级权限管理API缺失'
  },
  
  // 前端缺失但后端已实现的功能
  missing_frontend: {
    '/enrollment-ai': '招生AI功能 - 后端API完整，前端页面缺失',
    '/advertisement': '广告管理 - 后端API完整，前端功能简单',
    '/coupons': '优惠券管理 - 后端API完整，前端页面缺失',
    '/channels': '渠道管理 - 后端API完整，前端页面缺失',
    '/conversion-tracking': '转化追踪 - 后端API完整，前端页面缺失'
  }
};

// 生成分析报告
function generateComparisonReport() {
  console.log('🔍 前后端路由对比分析报告');
  console.log('=' * 80);
  
  console.log('\n📊 统计概要:');
  console.log(`✅ 前后端完全匹配: ${Object.keys(frontendPages.implemented).length} 个功能`);
  console.log(`⚠️ 部分实现: ${Object.keys(frontendPages.partial).length} 个功能`);
  console.log(`❌ 前端已开发，后端缺失: ${Object.keys(frontendPages.missing_backend).length} 个功能`);
  console.log(`🔄 后端已开发，前端缺失: ${Object.keys(frontendPages.missing_frontend).length} 个功能`);
  
  console.log('\n🎯 重点关注：前端已开发但后端缺失的功能');
  console.log('-'.repeat(60));
  
  const categories = {
    '招生管理': [],
    '活动管理': [],
    '学生管理': [],
    '教师管理': [],
    '班级管理': [],
    '家长管理': [],
    'AI功能': [],
    '系统管理': [],
    '其他': []
  };
  
  Object.entries(frontendPages.missing_backend).forEach(([route, description]) => {
    if (route.includes('/enrollment')) categories['招生管理'].push({route, description});
    else if (route.includes('/activity')) categories['活动管理'].push({route, description});
    else if (route.includes('/student')) categories['学生管理'].push({route, description});
    else if (route.includes('/teacher')) categories['教师管理'].push({route, description});
    else if (route.includes('/class')) categories['班级管理'].push({route, description});
    else if (route.includes('/parent')) categories['家长管理'].push({route, description});
    else if (route.includes('/ai')) categories['AI功能'].push({route, description});
    else if (route.includes('/system')) categories['系统管理'].push({route, description});
    else categories['其他'].push({route, description});
  });
  
  Object.entries(categories).forEach(([category, items]) => {
    if (items.length > 0) {
      console.log(`\n📁 ${category} (${items.length} 个缺失功能):`);
      items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.route}`);
        console.log(`     ${item.description}`);
      });
    }
  });
  
  return {
    implemented: Object.keys(frontendPages.implemented).length,
    partial: Object.keys(frontendPages.partial).length,
    missing_backend: Object.keys(frontendPages.missing_backend).length,
    missing_frontend: Object.keys(frontendPages.missing_frontend).length,
    details: frontendPages
  };
}

module.exports = { generateComparisonReport, frontendPages, backendRoutes };

if (require.main === module) {
  generateComparisonReport();
}