/**
 * 修复菜单权限 - 为所有中心添加完整的子菜单
 */

import { Sequelize } from 'sequelize';
import { Permission } from '../models';
import { sequelize } from '../config/database';

// 使用已有的数据库连接

// 中心配置
const centerMenus = {
  // 1. 人员中心 (Personnel Center) - ID: 3002
  3002: [
    { name: 'Student Management', chinese_name: '学生管理', code: 'PERSONNEL_STUDENT', path: '/student', component: 'pages/student/index.vue', icon: 'user', sort: 1 },
    { name: 'Teacher Management', chinese_name: '教师管理', code: 'PERSONNEL_TEACHER', path: '/teacher', component: 'pages/teacher/index.vue', icon: 'user-tie', sort: 2 },
    { name: 'Parent Management', chinese_name: '家长管理', code: 'PERSONNEL_PARENT', path: '/parent', component: 'pages/parent/index.vue', icon: 'users', sort: 3 },
    { name: 'Class Management', chinese_name: '班级管理', code: 'PERSONNEL_CLASS', path: '/class', component: 'pages/class/index.vue', icon: 'school', sort: 4 }
  ],
  
  // 2. 活动中心 (Activity Center) - ID: 3003
  3003: [
    { name: 'Activity List', chinese_name: '活动列表', code: 'ACTIVITY_LIST', path: '/activity', component: 'pages/activity/index.vue', icon: 'calendar', sort: 1 },
    { name: 'Activity Create', chinese_name: '创建活动', code: 'ACTIVITY_CREATE', path: '/activity/create', component: 'pages/activity/ActivityCreate.vue', icon: 'plus', sort: 2 },
    { name: 'Activity Analytics', chinese_name: '活动分析', code: 'ACTIVITY_ANALYTICS', path: '/activity/analytics', component: 'pages/activity/analytics/ActivityAnalytics.vue', icon: 'chart-line', sort: 3 },
    { name: 'Activity Evaluation', chinese_name: '活动评估', code: 'ACTIVITY_EVALUATION', path: '/activity/evaluation', component: 'pages/activity/evaluation/ActivityEvaluation.vue', icon: 'star', sort: 4 },
    { name: 'Activity Registration', chinese_name: '活动报名', code: 'ACTIVITY_REGISTRATION', path: '/activity/registration', component: 'pages/activity/registration/RegistrationDashboard.vue', icon: 'user-check', sort: 5 }
  ],
  
  // 3. 招生中心 (Enrollment Center) - ID: 3004
  3004: [
    { name: 'Enrollment List', chinese_name: '招生列表', code: 'ENROLLMENT_LIST', path: '/enrollment', component: 'pages/enrollment/index.vue', icon: 'list', sort: 1 },
    { name: 'Enrollment Plan', chinese_name: '招生计划', code: 'ENROLLMENT_PLAN', path: '/enrollment-plan', component: 'pages/enrollment-plan/PlanList.vue', icon: 'clipboard-list', sort: 2 },
    { name: 'Enrollment Strategy', chinese_name: '招生策略', code: 'ENROLLMENT_STRATEGY', path: '/enrollment-plan/strategy', component: 'pages/enrollment-plan/EnrollmentStrategy.vue', icon: 'lightbulb', sort: 3 },
    { name: 'Enrollment Analytics', chinese_name: '招生分析', code: 'ENROLLMENT_ANALYTICS', path: '/enrollment-plan/analytics', component: 'pages/enrollment-plan/analytics/enrollment-analytics.vue', icon: 'chart-bar', sort: 4 },
    { name: 'Quota Management', chinese_name: '名额管理', code: 'ENROLLMENT_QUOTA', path: '/enrollment-plan/quota', component: 'pages/enrollment-plan/QuotaManagement.vue', icon: 'users-cog', sort: 5 }
  ],
  
  // 4. 营销中心 (Marketing Center) - ID: 3005
  3005: [
    { name: 'Marketing Channels', chinese_name: '营销渠道', code: 'MARKETING_CHANNELS', path: '/marketing/channels', component: 'pages/marketing/channels/index.vue', icon: 'share-2', sort: 1 },
    { name: 'Marketing Funnel', chinese_name: '营销漏斗', code: 'MARKETING_FUNNEL', path: '/marketing/funnel', component: 'pages/marketing/funnel/index.vue', icon: 'filter', sort: 2 },
    { name: 'Conversion Analysis', chinese_name: '转化分析', code: 'MARKETING_CONVERSIONS', path: '/marketing/conversions', component: 'pages/marketing/conversions/index.vue', icon: 'trending-up', sort: 3 },
    { name: 'Referral Program', chinese_name: '推荐计划', code: 'MARKETING_REFERRALS', path: '/marketing/referrals', component: 'pages/marketing/referrals/index.vue', icon: 'users', sort: 4 }
  ],
  
  // 5. 系统中心 (System Center) - ID: 2013
  2013: [
    { name: 'User Management', chinese_name: '用户管理', code: 'SYSTEM_USER', path: '/system/users', component: 'pages/system/users/index.vue', icon: 'user', sort: 1 },
    { name: 'Role Management', chinese_name: '角色管理', code: 'SYSTEM_ROLE', path: '/system/roles', component: 'pages/system/roles/index.vue', icon: 'shield', sort: 2 },
    { name: 'Permission Management', chinese_name: '权限管理', code: 'SYSTEM_PERMISSION', path: '/system/permissions', component: 'pages/system/permissions/index.vue', icon: 'key', sort: 3 },
    { name: 'System Settings', chinese_name: '系统设置', code: 'SYSTEM_SETTINGS', path: '/system/settings', component: 'pages/system/settings/index.vue', icon: 'settings', sort: 4 },
    { name: 'Backup Management', chinese_name: '备份管理', code: 'SYSTEM_BACKUP', path: '/system/backup', component: 'pages/system/backup/BackupManagement.vue', icon: 'database', sort: 5 },
    { name: 'AI Model Config', chinese_name: 'AI模型配置', code: 'SYSTEM_AI_MODEL', path: '/system/ai-model', component: 'pages/system/AIModelConfig.vue', icon: 'cpu', sort: 6 }
  ],
  
  // 6. 财务中心 (Finance Center) - ID: 3074
  3074: [
    { name: 'Fee Management', chinese_name: '收费管理', code: 'FINANCE_FEE', path: '/finance/fee', component: 'pages/finance/FeeManagement.vue', icon: 'dollar-sign', sort: 1 },
    { name: 'Payment Management', chinese_name: '缴费管理', code: 'FINANCE_PAYMENT', path: '/finance/payment', component: 'pages/finance/PaymentManagement.vue', icon: 'credit-card', sort: 2 },
    { name: 'Fee Configuration', chinese_name: '收费配置', code: 'FINANCE_CONFIG', path: '/finance/config', component: 'pages/finance/FeeConfig.vue', icon: 'sliders', sort: 3 },
    { name: 'Finance Workbench', chinese_name: '财务工作台', code: 'FINANCE_WORKBENCH', path: '/finance/workbench', component: 'pages/finance/workbench/UniversalFinanceWorkbench.vue', icon: 'briefcase', sort: 4 }
  ],
  
  // 7. AI中心 (AI Center) - ID: 3006
  3006: [
    { name: 'AI Assistant', chinese_name: 'AI助手', code: 'AI_ASSISTANT', path: '/ai-center/assistant', component: 'pages/ai-center/AIAssistant.vue', icon: 'bot', sort: 1 },
    { name: 'AI Analytics', chinese_name: 'AI分析', code: 'AI_ANALYTICS', path: '/ai-center/analytics', component: 'pages/ai-center/AIAnalytics.vue', icon: 'brain', sort: 2 }
  ],
  
  // 8. 客户池中心 (Customer Pool Center) - ID: 3054
  3054: [
    { name: 'Customer Pool', chinese_name: '客户池', code: 'CUSTOMER_POOL', path: '/customer/pool', component: 'pages/customer/pool/index.vue', icon: 'users', sort: 1 },
    { name: 'Customer Follow-up', chinese_name: '客户跟进', code: 'CUSTOMER_FOLLOWUP', path: '/customer/followup', component: 'pages/customer/followup/index.vue', icon: 'user-check', sort: 2 },
    { name: 'Customer Analytics', chinese_name: '客户分析', code: 'CUSTOMER_ANALYTICS', path: '/customer/analytics', component: 'pages/customer/analytics/index.vue', icon: 'chart-pie', sort: 3 }
  ],
  
  // 9. 任务中心 (Task Center) - ID: 3035
  3035: [
    { name: 'Task List', chinese_name: '任务列表', code: 'TASK_LIST', path: '/task/list', component: 'pages/task/TaskList.vue', icon: 'check-square', sort: 1 },
    { name: 'Task Calendar', chinese_name: '任务日历', code: 'TASK_CALENDAR', path: '/task/calendar', component: 'pages/task/TaskCalendar.vue', icon: 'calendar', sort: 2 }
  ],
  
  // 10. 教学中心 (Teaching Center) - ID: 4059
  4059: [
    { name: 'Teaching Plan', chinese_name: '教学计划', code: 'TEACHING_PLAN', path: '/teaching/plan', component: 'pages/teaching/TeachingPlan.vue', icon: 'book-open', sort: 1 },
    { name: 'Course Management', chinese_name: '课程管理', code: 'TEACHING_COURSE', path: '/teaching/course', component: 'pages/teaching/CourseManagement.vue', icon: 'book', sort: 2 }
  ]
};

async function fixMenuPermissions() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    let totalAdded = 0;
    let totalDeleted = 0;
    
    for (const [centerId, menus] of Object.entries(centerMenus)) {
      const centerIdNum = parseInt(centerId);
      
      // 获取中心信息
      const center = await Permission.findByPk(centerIdNum);
      if (!center) {
        console.log(`⚠️ 中心 ID ${centerIdNum} 不存在，跳过`);
        continue;
      }
      
      console.log(`\n🏢 处理中心: ${center.chinese_name || center.name} (ID: ${centerIdNum})`);
      
      // 删除旧的子菜单
      const deleted = await Permission.destroy({
        where: {
          parentId: centerIdNum,
          type: 'menu'
        }
      });
      totalDeleted += deleted;
      console.log(`   🗑️  删除旧子菜单: ${deleted} 条`);
      
      // 添加新的子菜单
      for (const menu of menus) {
        await Permission.create({
          name: menu.name,
          chinese_name: menu.chinese_name,
          code: menu.code,
          type: 'menu' as any,
          parentId: centerIdNum,
          path: menu.path,
          component: menu.component,
          icon: menu.icon,
          sort: menu.sort,
          status: 1
        });
        totalAdded++;
        console.log(`   ✅ 添加子菜单: ${menu.chinese_name}`);
      }
    }
    
    console.log(`\n📊 统计:`);
    console.log(`   删除: ${totalDeleted} 条`);
    console.log(`   添加: ${totalAdded} 条`);
    
    // 验证结果
    console.log(`\n📋 验证结果:`);
    const [results] = await sequelize.query(`
      SELECT 
        c.id as category_id,
        c.chinese_name as category_name,
        COUNT(m.id) as menu_count
      FROM permissions c
      LEFT JOIN permissions m ON m.parent_id = c.id AND m.type = 'menu' AND m.status = 1
      WHERE c.type = 'category' AND c.status = 1
      GROUP BY c.id, c.chinese_name
      ORDER BY c.sort
    `);
    
    console.table(results);
    
    console.log(`\n✅ 菜单权限修复完成!`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

fixMenuPermissions();

