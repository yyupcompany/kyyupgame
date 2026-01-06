const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 清理不应该作为菜单的项目 ===');
  
  // 需要移除的菜单ID列表
  const itemsToRemove = [
    // UI组件（应移除菜单）
    1101, // ActivityForm
    1135, // ClassDetailDialog
    1136, // ClassFormDialog
    1172, // PlanForm
    
    // 详情/编辑页（应移除菜单）
    1098, // 创建活动
    1099, // 活动详情
    1100, // 编辑活动
    1105, // 活动详情页
    1127, // 申请详情
    1129, // ApplicationInterview
    1130, // ApplicationReview
    1138, // Id详情
    1137, // 班级详情
    1142, // Id详情
    1147, // 客户详情
    1152, // CampusOverview
    1153, // ClassCreate
    1154, // 班级详情
    1170, // 计划详情
    1171, // PlanEdit
    1199, // ParentEdit
    1194, // 家长详情
    1195, // 编辑家长
    1217, // 学生分析详情
    1220, // 学生详情页
    1219, // 学生详情
    1248, // 添加教师
    1253, // 教师绩效详情
    1245, // 教师详情
    1246, // 编辑教师
    
    // 系统/测试页（应移除菜单）
    1086, // 403
    1087, // 404
    1092, // GlobalStyleTest
    1093, // ImageUploaderDemo
    1094, // TemplateDemo
    1088, // ExamplePage
    1089, // Login
    1227, // EnhancedExample
  ];
  
  console.log(`准备移除 ${itemsToRemove.length} 个不应该作为菜单的项目`);
  
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
  console.log(`✅ 成功禁用: ${removedCount} 个项目`);
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
  
  console.log(`📊 总计: ${categories.length} 个分类，${totalActiveMenus} 个活跃菜单`);
  
  // 检查是否还有根级菜单
  const [rootMenus] = await connection.execute(`
    SELECT COUNT(*) as count
    FROM permissions 
    WHERE parent_id IS NULL AND type = 'menu' AND status = 1
  `);
  
  console.log(`⚠️ 剩余根级菜单: ${rootMenus[0].count} 个`);
  
  await connection.end();
})().catch(console.error);
