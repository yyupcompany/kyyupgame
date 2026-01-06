const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 执行菜单清理：移除组件页面 ===');
  
  // 需要移除的菜单ID列表（组件页面）
  const itemsToRemove = [
    1090, // StandardTemplate
    1103, // 活动分析
    1104, // 智能分析
    1106, // 活动评估
    1108, // 活动优化
    1109, // 活动规划
    1110, // 报名管理
    1115, // ChatInterface
    1116, // ExpertConsultationPage
    1117, // MemoryManagementPage
    1118, // ModelManagementPage
    1119, // Nlp-analytics
    1120, // Prediction-engine
    1121, // Maintenance-optimizer
    1122, // 3d-analytics
    1124, // 报表构建
    1125, // 数据概览
    1134, // 班级分析
    1140, // 班级优化
    1141, // 智能管理
    1143, // Id
    1144, // Id
    1146, // 客户分析
    1149, // 智能管理
    1151, // 数据分析
    1161, // EnrollmentTrends
    1162, // FinancialAnalysis
    1163, // TeacherEffectiveness
    1175, // QuotaManagement
    1176, // 统计报表
    1178, // 招生分析
    1179, // Plan-evaluation
    1180, // Enrollment-forecast
    1181, // PlanManagement
    1182, // Capacity-optimization
    1183, // Enrollment-simulation
    1184, // Smart-planning
    1185, // Enrollment-strategy
    1186, // Trend-analysis
    1188, // 智能引擎
    1190, // AssignActivity
    1191, // 儿童成长
    1192, // 儿童列表
    1193, // 跟进记录
    1197, // SmartHub
    1198, // Smart-hub
    1200, // 家长反馈
    1206, // 全园数据分析
    1208, // 绩效规则设置
    1209, // 海报编辑器
    1210, // 海报生成器
    1211, // 海报模板
    1214, // 统计报表
    1216, // 学生分析
    1218, // 学生评估
    1221, // 学生成长
    1229, // MessageTemplate
    1234, // BackupManagement
    1235, // SystemLogs
    1236, // MaintenanceScheduler
    1237, // NotificationSettings
    1240, // RoleManagement
    1249, // 教师发展
    1250, // 教师评估
    1252, // 教师绩效
    1346, // 我的绩效
    1347, // 绩效排行榜
    1348, // 我的招生任务
    1349, // 家长跟进记录
    2004, // 绩效规则
  ];
  
  console.log(`准备移除 ${itemsToRemove.length} 个组件页面`);
  
  let removedCount = 0;
  let errorCount = 0;
  
  for (const id of itemsToRemove) {
    try {
      // 首先查看这个项目的信息
      const [itemInfo] = await connection.execute(
        'SELECT id, name, chinese_name, path, type FROM permissions WHERE id = ?',
        [id]
      );
      
      if (itemInfo.length > 0) {
        const item = itemInfo[0];
        
        // 将其状态设置为0（禁用）而不是删除，以保持数据完整性
        await connection.execute(
          'UPDATE permissions SET status = 0, updated_at = NOW() WHERE id = ?',
          [id]
        );
        
        console.log(`✅ 已禁用: [${id}] ${item.chinese_name || item.name} -> ${item.path}`);
        removedCount++;
      } else {
        console.log(`⚠️ 未找到: [${id}]`);
      }
    } catch (error) {
      console.error(`❌ 处理失败 [${id}]: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('');
  console.log('📊 清理统计:');
  console.log(`✅ 成功禁用: ${removedCount} 个组件页面`);
  console.log(`❌ 处理失败: ${errorCount} 个项目`);
  
  // 检查清理后的菜单结构
  console.log('');
  console.log('=== 清理后的菜单统计 ===');
  
  const [categories] = await connection.execute(`
    SELECT id, name, chinese_name, code, sort
    FROM permissions 
    WHERE parent_id IS NULL AND type = 'category' AND status = 1
    ORDER BY sort, id
  `);
  
  let totalActiveMenus = 0;
  
  for (const category of categories) {
    const [menuCount] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM permissions 
      WHERE parent_id = ? AND type = 'menu' AND status = 1
    `, [category.id]);
    
    const count = menuCount[0].count;
    totalActiveMenus += count;
    
    console.log(`📁 [${category.id}] ${category.chinese_name || category.name}: ${count} 个菜单`);
  }
  
  // 检查角色模块
  const [roleModules] = await connection.execute(`
    SELECT id, name, chinese_name, code, sort
    FROM permissions 
    WHERE parent_id IS NULL AND type = 'menu' AND status = 1
    AND (chinese_name LIKE '%工作台%' OR chinese_name LIKE '%中心%')
    ORDER BY sort, id
  `);
  
  if (roleModules.length > 0) {
    console.log('');
    console.log('🎭 角色模块:');
    for (const module of roleModules) {
      const [subCount] = await connection.execute(`
        SELECT COUNT(*) as count
        FROM permissions 
        WHERE parent_id = ? AND status = 1
      `, [module.id]);
      
      console.log(`  🎯 [${module.id}] ${module.chinese_name || module.name} (${subCount[0].count} 个子项)`);
    }
  }
  
  console.log(`\n📊 最终统计: ${categories.length} 个业务分类 + ${roleModules.length} 个角色模块，共 ${totalActiveMenus} 个功能菜单`);
  
  // 检查是否还有根级菜单
  const [rootMenus] = await connection.execute(`
    SELECT COUNT(*) as count
    FROM permissions 
    WHERE parent_id IS NULL AND type = 'menu' AND status = 1
  `);
  
  console.log(`⚠️ 剩余根级菜单: ${rootMenus[0].count} 个`);
  
  await connection.end();
})().catch(console.error);
