#!/usr/bin/env ts-node
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

async function createRoleBasedPermissions() {
  try {
    console.log('🔄 开始创建基于角色的二级菜单权限系统...');
    
    // 基于扫描结果的完整页面结构，按角色分配（纯二级菜单）
    const roleBasedMenus = {
      // 管理员 - 拥有所有权限
      admin: {
        // 系统管理
        '系统管理': {
          type: 'category',
          icon: 'Setting',
          sort: 10,
          menus: {
            '用户管理': { path: '/system/User', component: 'pages/system/User.vue' },
            '角色管理': { path: '/system/Role', component: 'pages/system/Role.vue' },
            '权限管理': { path: '/system/Permission', component: 'pages/system/Permission.vue' },
            '系统设置': { path: '/system/settings', component: 'pages/system/settings/index.vue' },
            '系统日志': { path: '/system/Log', component: 'pages/system/Log.vue' },
            '数据备份': { path: '/system/Backup', component: 'pages/system/Backup.vue' },
            'AI模型配置': { path: '/system/AIModelConfig', component: 'pages/system/AIModelConfig.vue' },
            '消息模板': { path: '/system/MessageTemplate', component: 'pages/system/MessageTemplate.vue' }
          }
        },
        // 仪表板
        '仪表板': {
          type: 'category',
          icon: 'Monitor',
          sort: 20,
          menus: {
            '总览': { path: '/dashboard', component: 'pages/dashboard/index.vue' },
            '校园概览': { path: '/dashboard/campus-overview', component: 'pages/dashboard/CampusOverview.vue' },
            '数据统计': { path: '/dashboard/data-statistics', component: 'pages/dashboard/DataStatistics.vue' },
            '分析报告': { path: '/dashboard/Analytics', component: 'pages/dashboard/Analytics.vue' },
            '绩效监控': { path: '/dashboard/Performance', component: 'pages/dashboard/Performance.vue' }
          }
        },
        // 用户管理
        '用户管理': {
          type: 'category',
          icon: 'User',
          sort: 30,
          menus: {
            '学生管理': { path: '/student', component: 'pages/student/index.vue' },
            '教师管理': { path: '/teacher', component: 'pages/teacher/index.vue' },
            '家长管理': { path: '/parent', component: 'pages/parent/index.vue' },
            '班级管理': { path: '/class', component: 'pages/class/index.vue' },
            '客户管理': { path: '/customer', component: 'pages/customer/index.vue' }
          }
        },
        // 招生管理
        '招生管理': {
          type: 'category',
          icon: 'School',
          sort: 40,
          menus: {
            '招生概览': { path: '/enrollment', component: 'pages/enrollment/index.vue' },
            '招生计划': { path: '/enrollment-plan', component: 'pages/enrollment-plan/PlanList.vue' },
            '申请管理': { path: '/application', component: 'pages/application/ApplicationList.vue' },
            '申请审核': { path: '/application/review', component: 'pages/application/review/ApplicationReview.vue' },
            '面试管理': { path: '/application/interview', component: 'pages/application/interview/ApplicationInterview.vue' },
            '招生预测': { path: '/enrollment-plan/forecast', component: 'pages/enrollment-plan/forecast/enrollment-forecast.vue' },
            '招生策略': { path: '/enrollment-plan/strategy', component: 'pages/enrollment-plan/strategy/enrollment-strategy.vue' },
            '招生分析': { path: '/enrollment-plan/analytics', component: 'pages/enrollment-plan/analytics/enrollment-analytics.vue' }
          }
        },
        // 活动管理
        '活动管理': {
          type: 'category',
          icon: 'Calendar',
          sort: 50,
          menus: {
            '活动列表': { path: '/activity', component: 'pages/activity/index.vue' },
            '创建活动': { path: '/activity/create', component: 'pages/activity/ActivityCreate.vue' },
            '活动策划': { path: '/activity/plan', component: 'pages/activity/plan/ActivityPlanner.vue' },
            '活动分析': { path: '/activity/analytics', component: 'pages/activity/analytics/ActivityAnalytics.vue' },
            '活动评估': { path: '/activity/evaluation', component: 'pages/activity/evaluation/ActivityEvaluation.vue' },
            '报名管理': { path: '/activity/registration', component: 'pages/activity/registration/RegistrationDashboard.vue' }
          }
        },
        // AI助手
        'AI助手': {
          type: 'category',
          icon: 'ChatDotRound',
          sort: 60,
          menus: {
            'AI对话': { path: '/ai/chat-interface', component: 'pages/ai/ChatInterface.vue' },
            'AI助手': { path: '/ai/assistant', component: 'pages/ai/AIAssistantPage.vue' },
            'AI模型管理': { path: '/ai/model-management', component: 'pages/ai/ModelManagementPage.vue' },
            'AI记忆管理': { path: '/ai/memory-management', component: 'pages/ai/MemoryManagementPage.vue' },
            '专家咨询': { path: '/ai/expert-consultation', component: 'pages/ai/ExpertConsultationPage.vue' }
          }
        },
        // 海报管理
        '海报管理': {
          type: 'category',
          icon: 'Picture',
          sort: 70,
          menus: {
            '海报模板': { path: '/poster/templates', component: 'pages/principal/PosterTemplates.vue' },
            '海报编辑': { path: '/poster/editor', component: 'pages/principal/PosterEditor.vue' },
            '海报生成': { path: '/poster/generator', component: 'pages/principal/PosterGenerator.vue' }
          }
        },
        // 营销管理
        '营销管理': {
          type: 'category',
          icon: 'Promotion',
          sort: 80,
          menus: {
            '营销分析': { path: '/marketing/analysis', component: 'pages/principal/MarketingAnalysis.vue' },
            '营销活动': { path: '/marketing/campaigns', component: 'pages/marketing.vue' },
            '广告管理': { path: '/advertisement', component: 'pages/advertisement/index.vue' }
          }
        },
        // 统计分析
        '统计分析': {
          type: 'category',
          icon: 'DataAnalysis',
          sort: 90,
          menus: {
            '数据统计': { path: '/statistics', component: 'pages/statistics/index.vue' },
            '报表构建': { path: '/analytics/report', component: 'pages/analytics/ReportBuilder.vue' },
            '分析首页': { path: '/analytics', component: 'pages/analytics/index.vue' }
          }
        }
      },

      // 园长 - 园务管理权限
      principal: {
        // 园长仪表板
        '园长工作台': {
          type: 'category',
          icon: 'Monitor',
          sort: 10,
          menus: {
            '园长总览': { path: '/principal/dashboard', component: 'pages/principal/Dashboard.vue' },
            '绩效管理': { path: '/principal/performance', component: 'pages/principal/Performance.vue' }
          }
        },
        // 招生管理
        '招生管理': {
          type: 'category',
          icon: 'School',
          sort: 20,
          menus: {
            '招生概览': { path: '/enrollment', component: 'pages/enrollment/index.vue' },
            '招生计划': { path: '/enrollment-plan', component: 'pages/enrollment-plan/PlanList.vue' },
            '申请管理': { path: '/application', component: 'pages/application/ApplicationList.vue' },
            '招生预测': { path: '/enrollment-plan/forecast', component: 'pages/enrollment-plan/forecast/enrollment-forecast.vue' },
            '招生策略': { path: '/enrollment-plan/strategy', component: 'pages/enrollment-plan/strategy/enrollment-strategy.vue' },
            '招生分析': { path: '/enrollment-plan/analytics', component: 'pages/enrollment-plan/analytics/enrollment-analytics.vue' }
          }
        },
        // 教学管理
        '教学管理': {
          type: 'category',
          icon: 'User',
          sort: 30,
          menus: {
            '教师管理': { path: '/teacher', component: 'pages/teacher/index.vue' },
            '学生管理': { path: '/student', component: 'pages/student/index.vue' },
            '班级管理': { path: '/class', component: 'pages/class/index.vue' },
            '家长管理': { path: '/parent', component: 'pages/parent/index.vue' },
            '教师评估': { path: '/teacher/evaluation', component: 'pages/teacher/evaluation/TeacherEvaluation.vue' }
          }
        },
        // 活动管理
        '活动管理': {
          type: 'category',
          icon: 'Calendar',
          sort: 40,
          menus: {
            '活动列表': { path: '/activity', component: 'pages/activity/index.vue' },
            '园长活动': { path: '/principal/activities', component: 'pages/principal/Activities.vue' },
            '活动策划': { path: '/activity/plan', component: 'pages/activity/plan/ActivityPlanner.vue' },
            '活动分析': { path: '/activity/analytics', component: 'pages/activity/analytics/ActivityAnalytics.vue' }
          }
        },
        // 营销管理
        '营销管理': {
          type: 'category',
          icon: 'Promotion',
          sort: 50,
          menus: {
            '营销分析': { path: '/marketing/analysis', component: 'pages/principal/MarketingAnalysis.vue' },
            '客户池管理': { path: '/principal/customer-pool', component: 'pages/principal/CustomerPool.vue' },
            '海报管理': { path: '/poster/templates', component: 'pages/principal/PosterTemplates.vue' }
          }
        },
        // AI助手
        'AI助手': {
          type: 'category',
          icon: 'ChatDotRound',
          sort: 60,
          menus: {
            'AI对话': { path: '/ai/chat-interface', component: 'pages/ai/ChatInterface.vue' },
            'AI助手': { path: '/ai/assistant', component: 'pages/ai/AIAssistantPage.vue' },
            '专家咨询': { path: '/ai/expert-consultation', component: 'pages/ai/ExpertConsultationPage.vue' }
          }
        },
        // 统计分析
        '统计分析': {
          type: 'category',
          icon: 'DataAnalysis',
          sort: 70,
          menus: {
            '数据统计': { path: '/statistics', component: 'pages/statistics/index.vue' },
            '分析报告': { path: '/dashboard/Analytics', component: 'pages/dashboard/Analytics.vue' }
          }
        }
      },

      // 教师 - 教学相关权限
      teacher: {
        // 教师工作台
        '教师工作台': {
          type: 'category',
          icon: 'Monitor',
          sort: 10,
          menus: {
            '我的工作台': { path: '/dashboard', component: 'pages/dashboard/index.vue' },
            '日程安排': { path: '/dashboard/schedule', component: 'pages/dashboard/Schedule.vue' }
          }
        },
        // 班级管理
        '班级管理': {
          type: 'category',
          icon: 'School',
          sort: 20,
          menus: {
            '我的班级': { path: '/class', component: 'pages/class/index.vue' },
            '智能管理': { path: '/class/smart-management', component: 'pages/class/smart-management/SmartManagement.vue' },
            '班级分析': { path: '/class/analytics', component: 'pages/class/analytics/ClassAnalytics.vue' }
          }
        },
        // 学生管理
        '学生管理': {
          type: 'category',
          icon: 'User',
          sort: 30,
          menus: {
            '学生列表': { path: '/student', component: 'pages/student/index.vue' },
            '学生评估': { path: '/student/assessment', component: 'pages/student/assessment/StudentAssessment.vue' },
            '学生成长': { path: '/student/growth', component: 'pages/student/growth/StudentGrowth.vue' }
          }
        },
        // 家长沟通
        '家长沟通': {
          type: 'category',
          icon: 'Message',
          sort: 40,
          menus: {
            '家长列表': { path: '/parent', component: 'pages/parent/index.vue' },
            '智能沟通': { path: '/parent/communication/smart-hub', component: 'pages/parent/communication/smart-hub.vue' },
            '家长反馈': { path: '/parent/feedback', component: 'pages/parent/feedback/ParentFeedback.vue' }
          }
        },
        // 活动管理
        '活动管理': {
          type: 'category',
          icon: 'Calendar',
          sort: 50,
          menus: {
            '活动列表': { path: '/activity', component: 'pages/activity/index.vue' },
            '创建活动': { path: '/activity/create', component: 'pages/activity/ActivityCreate.vue' },
            '活动策划': { path: '/activity/plan', component: 'pages/activity/plan/ActivityPlanner.vue' },
            '报名管理': { path: '/activity/registration', component: 'pages/activity/registration/RegistrationDashboard.vue' }
          }
        },
        // AI助手
        'AI助手': {
          type: 'category',
          icon: 'ChatDotRound',
          sort: 60,
          menus: {
            'AI对话': { path: '/ai/chat-interface', component: 'pages/ai/ChatInterface.vue' },
            'AI助手': { path: '/ai/assistant', component: 'pages/ai/AIAssistantPage.vue' },
            '专家咨询': { path: '/ai/expert-consultation', component: 'pages/ai/ExpertConsultationPage.vue' }
          }
        }
      },

      // 家长 - 查看权限
      parent: {
        // 家长中心
        '家长中心': {
          type: 'category',
          icon: 'User',
          sort: 10,
          menus: {
            '我的首页': { path: '/parent-center/dashboard', component: 'pages/dashboard/index.vue' },
            '我的信息': { path: '/parent-center/profile', component: 'pages/parent/ParentDetail.vue' }
          }
        },
        // 孩子管理
        '孩子管理': {
          type: 'category',
          icon: 'School',
          sort: 20,
          menus: {
            '我的孩子': { path: '/parent-center/children', component: 'pages/parent/ChildrenList.vue' },
            '孩子成长': { path: '/parent-center/child-growth', component: 'pages/parent/ChildGrowth.vue' },
            '跟进记录': { path: '/parent-center/follow-up', component: 'pages/parent/FollowUp.vue' }
          }
        },
        // 发育测评
        '发育测评': {
          type: 'category',
          icon: 'DataAnalysis',
          sort: 25,
          menus: {
            '测评首页': { path: '/parent-center/assessment/start', component: 'pages/parent-center/assessment/Start.vue' },
            '历史记录': { path: '/parent-center/assessment', component: 'pages/parent-center/assessment/index.vue' },
            '成长轨迹': { path: '/parent-center/assessment/growth-trajectory', component: 'pages/parent-center/assessment/GrowthTrajectory.vue' },
            'AI育儿助手': { path: '/parent-center/ai-assistant', component: 'pages/parent-center/ai-assistant/index.vue' }
          }
        },
        // 脑开发游戏
        '脑开发游戏': {
          type: 'category',
          icon: 'TrophyBase',
          sort: 26,
          menus: {
            '游戏大厅': { path: '/parent-center/games', component: 'pages/parent-center/games/index.vue' },
            '我的成就': { path: '/parent-center/games/achievements', component: 'pages/parent-center/games/achievements.vue' },
            '游戏记录': { path: '/parent-center/games/records', component: 'pages/parent-center/games/records.vue' }
          }
        },
        // 活动与通知
        '活动与通知': {
          type: 'category',
          icon: 'Calendar',
          sort: 30,
          menus: {
            '活动列表': { path: '/parent-center/activities', component: 'pages/activity/index.vue' },
            '活动报名': { path: '/parent-center/activity-registration', component: 'pages/activity/registration/RegistrationDashboard.vue' },
            '通知公告': { path: '/parent-center/notifications', component: 'pages/notifications/index.vue' }
          }
        },
        // 互动沟通
        '互动沟通': {
          type: 'category',
          icon: 'Message',
          sort: 40,
          menus: {
            '在线聊天': { path: '/parent-center/chat', component: 'pages/chat/index.vue' },
            '智能沟通': { path: '/parent-center/smart-communication', component: 'pages/parent/communication/smart-hub.vue' },
            '意见反馈': { path: '/parent-center/feedback', component: 'pages/parent/feedback/ParentFeedback.vue' }
          }
        }
      }
    };

    // 清理现有权限
    console.log('🧹 清理现有权限...');
    await sequelize.query(`DELETE FROM role_permissions WHERE 1=1`);
    await sequelize.query(`DELETE FROM permissions WHERE 1=1`);

    // 创建权限
    console.log('🏗️  创建权限结构...');
    let sortOrder = 1;
    let globalCodeCounter = 1; // 全局计数器确保code唯一
    
    for (const [roleName, categories] of Object.entries(roleBasedMenus)) {
      console.log(`\n👤 处理角色: ${roleName}`);
      
      for (const [categoryName, categoryData] of Object.entries(categories)) {
        console.log(`  📁 创建分类: ${categoryName}`);
        
        // 创建分类权限 (不可点击)
        const categoryCode = `${roleName.toUpperCase()}_CAT_${globalCodeCounter++}`;
        const categoryPath = `#${categoryName}`;
        const categoryIcon = categoryData.icon;
        const categorySortOrder = sortOrder++;
        
        const [categoryResult] = await sequelize.query(
          `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
           VALUES (?, ?, 'category', NULL, ?, NULL, NULL, ?, ?, 1, NOW(), NOW())`,
          {
            replacements: [
              categoryName,
              categoryCode,
              categoryPath,
              categoryIcon,
              categorySortOrder
            ],
            type: QueryTypes.INSERT
          }
        );
        
        const categoryId = categoryResult as number;
        
        // 创建二级菜单权限 (可点击)
        for (const [menuName, menuData] of Object.entries(categoryData.menus)) {
          console.log(`    📄 创建菜单: ${menuName}`);
          
          const menu = menuData as any;
          const menuCode = `${roleName.toUpperCase()}_MENU_${globalCodeCounter++}`;
          const menuSortOrder = sortOrder++;
          
          await sequelize.query(
            `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
             VALUES (?, ?, 'menu', ?, ?, ?, ?, 'Document', ?, 1, NOW(), NOW())`,
            {
              replacements: [
                menuName,
                menuCode,
                categoryId,
                menu.path,
                menu.component,
                menuCode,
                menuSortOrder
              ],
              type: QueryTypes.INSERT
            }
          );
        }
      }
    }

    // 为角色分配权限
    console.log('\n🔐 分配角色权限...');
    
    // 获取所有角色
    const [roles] = await sequelize.query(`SELECT * FROM roles`);
    const roleMap = new Map();
    for (const role of roles as any[]) {
      roleMap.set(role.code, role.id);
    }

    // 获取所有权限
    const [permissions] = await sequelize.query(`SELECT * FROM permissions`);
    
    // 为每个角色分配对应的权限
    for (const permission of permissions as any[]) {
      const permissionCode = permission.code;
      
      // 根据权限代码前缀判断属于哪个角色
      for (const [roleName, roleId] of roleMap.entries()) {
        if (permissionCode.startsWith(roleName.toUpperCase() + '_')) {
          await sequelize.query(
            `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
             VALUES (?, ?, NOW(), NOW())`,
            {
              replacements: [roleId, permission.id],
              type: QueryTypes.INSERT
            }
          );
        }
      }
    }

    // 统计结果
    const [finalStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_permissions,
        SUM(CASE WHEN type = 'category' THEN 1 ELSE 0 END) as categories,
        SUM(CASE WHEN type = 'menu' THEN 1 ELSE 0 END) as menus
      FROM permissions
    `);
    
    const [roleStats] = await sequelize.query(`
      SELECT r.name as role_name, COUNT(rp.id) as permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id, r.name
    `);

    console.log('\n📊 权限创建完成统计:');
    console.table(finalStats);
    console.log('\n👤 各角色权限统计:');
    console.table(roleStats);

    console.log('\n✅ 基于角色的二级菜单权限系统创建完成！');
    
  } catch (error) {
    console.error('❌ 创建权限失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

createRoleBasedPermissions();