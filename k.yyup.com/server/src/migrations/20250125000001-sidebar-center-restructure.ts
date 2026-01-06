/**
 * 侧边栏中心化改造迁移脚本
 * 目标：将业务功能重新组织为7个核心中心，提升为一级分类
 * 原则：不删除任何数据，只修改层级关系
 */

import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  console.log('🚀 开始侧边栏中心化改造...');
  
  try {
    // 获取新分类的起始ID（避免ID冲突）
    const maxIdResult = await queryInterface.sequelize!.query(
      'SELECT MAX(id) as maxId FROM permissions',
      { type: require('sequelize').QueryTypes.SELECT }
    ) as any[];
    
    let nextId = (maxIdResult[0]?.maxId || 2100) + 1;
    
    // 第一步：创建7个新的中心化分类
    const centerCategories = [
      {
        id: nextId++,
        name: 'Dashboard Center',
        chinese_name: '仪表板中心',
        code: 'DASHBOARD_CENTER',
        type: 'category',
        parent_id: null,
        path: '#dashboard-center',
        icon: 'Dashboard',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: nextId++,
        name: 'Personnel Center', 
        chinese_name: '人员中心',
        code: 'PERSONNEL_CENTER',
        type: 'category',
        parent_id: null,
        path: '#personnel-center',
        icon: 'Users',
        sort: 2,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: nextId++,
        name: 'Activity Center',
        chinese_name: '活动中心', 
        code: 'ACTIVITY_CENTER',
        type: 'category',
        parent_id: null,
        path: '#activity-center',
        icon: 'Calendar',
        sort: 3,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: nextId++,
        name: 'Enrollment Center',
        chinese_name: '招生中心',
        code: 'ENROLLMENT_CENTER', 
        type: 'category',
        parent_id: null,
        path: '#enrollment-center',
        icon: 'School',
        sort: 4,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: nextId++,
        name: 'Marketing Center',
        chinese_name: '营销中心',
        code: 'MARKETING_CENTER',
        type: 'category', 
        parent_id: null,
        path: '#marketing-center',
        icon: 'TrendingUp',
        sort: 5,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: nextId++,
        name: 'AI Center',
        chinese_name: 'AI中心',
        code: 'AI_CENTER',
        type: 'category',
        parent_id: null, 
        path: '#ai-center',
        icon: 'Brain',
        sort: 6,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // 插入新的中心分类
    for (const category of centerCategories) {
      await queryInterface.bulkInsert('permissions', [category]);
      console.log(`✅ 创建分类: ${category.chinese_name} (ID: ${category.id})`);
    }
    
    // 获取新创建的分类ID
    const dashboardCenterId = centerCategories[0].id;
    const personnelCenterId = centerCategories[1].id;
    const activityCenterId = centerCategories[2].id;
    const enrollmentCenterId = centerCategories[3].id;
    const marketingCenterId = centerCategories[4].id;
    const aiCenterId = centerCategories[5].id;
    
    // 第二步：重新分配现有菜单项到对应中心
    
    // 1. 仪表板中心 - 数据概览与园区管理
    await queryInterface.sequelize!.query(`
      UPDATE permissions 
      SET parent_id = ${dashboardCenterId}
      WHERE id IN (
        1164, -- 主仪表板
        1152, -- 园区概览  
        1156, -- 自定义布局
        1157, -- 数据统计
        1158, -- 重要通知
        1125, -- 数据分析
        1124, -- 报表构建器
        1214, -- 统计分析
        1162, -- 财务分析
        1205  -- 园长仪表板
      ) AND status = 1
    `);
    console.log('✅ 已分配功能到仪表板中心');
    
    // 2. 人员中心 - 教师、学生、家长管理
    await queryInterface.sequelize!.query(`
      UPDATE permissions 
      SET parent_id = ${personnelCenterId}
      WHERE (
        path LIKE '/teacher%' OR 
        path LIKE '/student%' OR 
        path LIKE '/parent%' OR 
        path LIKE '/class%' OR
        code LIKE '%TEACHER%' OR
        code LIKE '%STUDENT%' OR 
        code LIKE '%PARENT%' OR
        code LIKE '%CLASS%'
      ) AND status = 1 AND type = 'menu'
    `);
    console.log('✅ 已分配功能到人员中心');
    
    // 3. 活动中心 - 活动策划与管理
    await queryInterface.sequelize!.query(`
      UPDATE permissions
      SET parent_id = ${activityCenterId}
      WHERE (
        path LIKE '/activity%' OR
        code LIKE '%ACTIVITY%'
      ) AND status = 1 AND type = 'menu'
    `);
    console.log('✅ 已分配功能到活动中心');
    
    // 4. 招生中心 - 招生计划与申请管理
    await queryInterface.sequelize!.query(`
      UPDATE permissions
      SET parent_id = ${enrollmentCenterId} 
      WHERE (
        path LIKE '/enrollment%' OR
        path LIKE '/application%' OR
        code LIKE '%ENROLLMENT%' OR
        code LIKE '%APPLICATION%' OR
        id IN (1095) -- 招生计划
      ) AND status = 1 AND type = 'menu'
    `);
    console.log('✅ 已分配功能到招生中心');
    
    // 5. 营销中心 - 营销推广与广告
    await queryInterface.sequelize!.query(`
      UPDATE permissions
      SET parent_id = ${marketingCenterId}
      WHERE (
        path LIKE '/marketing%' OR
        path LIKE '/advertisement%' OR 
        path LIKE '/principal/Poster%' OR
        parent_id = 1268 OR -- 海报管理分类下的项目
        code LIKE '%MARKETING%' OR
        code LIKE '%ADVERTISEMENT%' OR
        code LIKE '%POSTER%' OR
        id IN (1096, 1112, 1209, 1210, 1211) -- 营销管理、广告管理、海报相关
      ) AND status = 1
    `);
    console.log('✅ 已分配功能到营销中心');
    
    // 6. AI中心 - 智能决策与自动化  
    await queryInterface.sequelize!.query(`
      UPDATE permissions
      SET parent_id = ${aiCenterId}
      WHERE (
        path LIKE '/ai%' OR
        path LIKE '%intelligent%' OR
        path LIKE '/chat%' OR
        code LIKE '%AI%' OR
        code LIKE '%INTELLIGENT%' OR
        code LIKE '%CHAT%' OR
        id IN (1121, 1212, 1132, 2036) -- AI相关功能
      ) AND status = 1 AND type = 'menu'
    `);
    console.log('✅ 已分配功能到AI中心');
    
    // 第三步：更新系统中心
    await queryInterface.sequelize!.query(`
      UPDATE permissions 
      SET chinese_name = '系统中心', sort = 7
      WHERE id = 2013
    `);
    console.log('✅ 已更新系统管理为系统中心');
    
    // 第四步：隐藏不需要的旧分类（不删除数据）
    await queryInterface.sequelize!.query(`
      UPDATE permissions 
      SET status = 0, sort = 99
      WHERE id IN (1202, 1268, 2033) -- 园长功能、海报管理、智能规划
    `);
    console.log('✅ 已隐藏旧分类');
    
    // 第五步：添加中心化页面路由（如果不存在）
    const centerRoutes = [
      {
        id: nextId++,
        name: 'Dashboard Center Page',
        chinese_name: '仪表板中心页面',
        code: 'DASHBOARD_CENTER_PAGE',
        type: 'menu',
        parent_id: dashboardCenterId,
        path: '/centers/dashboard',
        component: 'pages/centers/DashboardCenter.vue',
        icon: 'Dashboard',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: nextId++,
        name: 'Personnel Center Page',
        chinese_name: '人员中心页面', 
        code: 'PERSONNEL_CENTER_PAGE',
        type: 'menu',
        parent_id: personnelCenterId,
        path: '/centers/personnel',
        component: 'pages/centers/PersonnelCenter.vue',
        icon: 'Users',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: nextId++,
        name: 'Activity Center Page',
        chinese_name: '活动中心页面',
        code: 'ACTIVITY_CENTER_PAGE', 
        type: 'menu',
        parent_id: activityCenterId,
        path: '/centers/activity',
        component: 'pages/centers/ActivityCenter.vue',
        icon: 'Calendar',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: nextId++,
        name: 'Enrollment Center Page',
        chinese_name: '招生中心页面',
        code: 'ENROLLMENT_CENTER_PAGE',
        type: 'menu', 
        parent_id: enrollmentCenterId,
        path: '/centers/enrollment',
        component: 'pages/centers/EnrollmentCenter.vue',
        icon: 'School',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: nextId++,
        name: 'Marketing Center Page',
        chinese_name: '营销中心页面',
        code: 'MARKETING_CENTER_PAGE',
        type: 'menu',
        parent_id: marketingCenterId, 
        path: '/centers/marketing',
        component: 'pages/centers/MarketingCenter.vue',
        icon: 'TrendingUp',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: nextId++,
        name: 'AI Center Page',
        chinese_name: 'AI中心页面',
        code: 'AI_CENTER_PAGE',
        type: 'menu',
        parent_id: aiCenterId,
        path: '/centers/ai',
        component: 'pages/centers/AICenter.vue', 
        icon: 'Brain',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: nextId++,
        name: 'System Center Page',
        chinese_name: '系统中心页面',
        code: 'SYSTEM_CENTER_PAGE',
        type: 'menu',
        parent_id: 2013, // 系统管理分类
        path: '/centers/system',
        component: 'pages/centers/SystemCenter.vue',
        icon: 'Settings',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // 插入中心化页面路由
    for (const route of centerRoutes) {
      await queryInterface.bulkInsert('permissions', [route]);
      console.log(`✅ 创建中心页面: ${route.chinese_name}`);
    }
    
    console.log('🎉 侧边栏中心化改造完成！');
    console.log('📋 新的侧边栏结构：');
    console.log('  1. 仪表板中心 - 数据概览与园区管理');
    console.log('  2. 人员中心 - 教师学生家长管理');
    console.log('  3. 活动中心 - 活动策划与执行');
    console.log('  4. 招生中心 - 招生计划与申请管理');
    console.log('  5. 营销中心 - 营销推广与广告');
    console.log('  6. AI中心 - 智能决策与自动化');
    console.log('  7. 系统中心 - 系统配置与权限管理');
    
  } catch (error) {
    console.error('❌ 侧边栏中心化改造失败:', error);
    throw error;
  }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  console.log('🔄 回滚侧边栏中心化改造...');
  
  try {
    // 恢复旧分类状态
    await queryInterface.sequelize!.query(`
      UPDATE permissions 
      SET status = 1, sort = CASE 
        WHEN id = 1202 THEN 1  -- 园长功能
        WHEN id = 1268 THEN 2  -- 海报管理  
        WHEN id = 2033 THEN 3  -- 智能规划
        ELSE sort 
      END
      WHERE id IN (1202, 1268, 2033)
    `);
    
    // 恢复系统管理原名
    await queryInterface.sequelize!.query(`
      UPDATE permissions 
      SET chinese_name = '系统管理', sort = 4
      WHERE id = 2013
    `);
    
    // 将菜单项重新分配回系统管理分类
    await queryInterface.sequelize!.query(`
      UPDATE permissions 
      SET parent_id = 2013
      WHERE parent_id IN (
        SELECT id FROM permissions 
        WHERE code IN (
          'DASHBOARD_CENTER', 'PERSONNEL_CENTER', 'ACTIVITY_CENTER',
          'ENROLLMENT_CENTER', 'MARKETING_CENTER', 'AI_CENTER'
        )
      )
    `);
    
    // 删除新创建的中心分类和页面
    await queryInterface.sequelize!.query(`
      DELETE FROM permissions 
      WHERE code IN (
        'DASHBOARD_CENTER', 'PERSONNEL_CENTER', 'ACTIVITY_CENTER',
        'ENROLLMENT_CENTER', 'MARKETING_CENTER', 'AI_CENTER',
        'DASHBOARD_CENTER_PAGE', 'PERSONNEL_CENTER_PAGE', 'ACTIVITY_CENTER_PAGE',
        'ENROLLMENT_CENTER_PAGE', 'MARKETING_CENTER_PAGE', 'AI_CENTER_PAGE',
        'SYSTEM_CENTER_PAGE'
      )
    `);
    
    console.log('✅ 侧边栏中心化改造已回滚');
    
  } catch (error) {
    console.error('❌ 回滚失败:', error);
    throw error;
  }
};