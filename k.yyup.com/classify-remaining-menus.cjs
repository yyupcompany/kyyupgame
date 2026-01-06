const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 第三步：手动归类剩余菜单 ===');
  
  // 分类ID映射
  const categoryIds = {
    'enrollment-management': 2008,  // 招生管理
    'activity-management': 2009,    // 活动管理
    'student-management': 2010,     // 学生管理
    'teacher-management': 2011,     // 教师管理
    'class-management': 2012,       // 班级管理
    'system-management': 2013       // 系统管理
  };
  
  // 手动指定剩余菜单的分类
  const manualClassification = [
    // 系统管理相关
    { id: 1086, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // 403
    { id: 1087, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // 404
    { id: 1088, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // ExamplePage
    { id: 1089, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // Login
    { id: 1090, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // StandardTemplate
    { id: 1091, categoryId: categoryIds['enrollment-management'], categoryName: '招生管理' }, // Application
    { id: 1092, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // GlobalStyleTest
    { id: 1093, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // ImageUploaderDemo
    { id: 1094, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // TemplateDemo
    
    // 活动管理相关
    { id: 1112, categoryId: categoryIds['activity-management'], categoryName: '活动管理' }, // 广告投放
    
    // 系统管理相关 - AI功能
    { id: 1114, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // AI助手
    { id: 1115, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // ChatInterface
    { id: 1116, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // ExpertConsultationPage
    { id: 1117, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // MemoryManagementPage
    { id: 1118, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // ModelManagementPage
    { id: 1119, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // Nlp-analytics
    { id: 1120, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // Prediction-engine
    { id: 1121, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // Maintenance-optimizer
    { id: 1122, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // 3d-analytics
    
    // 系统管理相关 - 报表分析
    { id: 1124, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // 报表构建
    { id: 1125, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // 数据概览
    
    // 招生管理相关
    { id: 1127, categoryId: categoryIds['enrollment-management'], categoryName: '招生管理' }, // 申请详情
    { id: 1128, categoryId: categoryIds['enrollment-management'], categoryName: '招生管理' }, // 申请列表
    { id: 1129, categoryId: categoryIds['enrollment-management'], categoryName: '招生管理' }, // ApplicationInterview
    { id: 1130, categoryId: categoryIds['enrollment-management'], categoryName: '招生管理' }, // ApplicationReview
    
    // 系统管理相关
    { id: 1132, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // 聊天
    { id: 1151, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // 数据分析
    { id: 1152, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // CampusOverview
    { id: 1156, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // CustomLayout
    { id: 1157, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // DataStatistics
    { id: 1158, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // ImportantNotices
    { id: 1162, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // FinancialAnalysis
    { id: 1164, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // 仪表板
    { id: 1205, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // 园长仪表板
    { id: 1212, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // 智能决策支持
    { id: 1214, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // 统计报表
    { id: 1254, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // 首页
    { id: 1352, categoryId: categoryIds['system-management'], categoryName: '系统管理' }, // 基本资料
  ];
  
  let classifiedCount = 0;
  
  // 执行手动分类
  for (const item of manualClassification) {
    try {
      // 更新菜单的parent_id
      await connection.execute(
        'UPDATE permissions SET parent_id = ?, updated_at = NOW() WHERE id = ?',
        [item.categoryId, item.id]
      );
      
      console.log('✅ [' + item.id + '] 手动归类到 -> ' + item.categoryName);
      classifiedCount++;
    } catch (error) {
      console.error('❌ 手动归类失败 [' + item.id + ']: ' + error.message);
    }
  }
  
  console.log('');
  console.log('📊 手动归类统计:');
  console.log('✅ 手动归类: ' + classifiedCount + ' 个菜单');
  
  // 检查是否还有未归类的菜单
  const [remainingMenus] = await connection.execute(`
    SELECT id, name, chinese_name, path
    FROM permissions 
    WHERE parent_id IS NULL AND type = 'menu' AND status = 1
    ORDER BY id
  `);
  
  console.log('⚠️ 剩余未归类: ' + remainingMenus.length + ' 个菜单');
  
  if (remainingMenus.length > 0) {
    console.log('');
    console.log('📋 剩余未归类的菜单:');
    remainingMenus.forEach(menu => {
      console.log('   [' + menu.id + '] ' + (menu.chinese_name || menu.name) + ' -> ' + menu.path);
    });
  }
  
  await connection.end();
})().catch(console.error);
