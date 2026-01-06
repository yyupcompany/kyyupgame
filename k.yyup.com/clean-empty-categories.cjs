const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 清理空的分类 ===');
  
  // 查找所有空的分类
  const [emptyCategories] = await connection.execute(`
    SELECT p.id, p.name, p.chinese_name, p.code
    FROM permissions p
    WHERE p.parent_id IS NULL 
      AND p.type = 'category' 
      AND p.status = 1
      AND NOT EXISTS (
        SELECT 1 FROM permissions child 
        WHERE child.parent_id = p.id 
          AND child.status = 1
      )
    ORDER BY p.id
  `);
  
  console.log(`找到 ${emptyCategories.length} 个空分类`);
  
  let removedCount = 0;
  
  for (const category of emptyCategories) {
    try {
      // 禁用空分类
      await connection.execute(
        'UPDATE permissions SET status = 0, updated_at = NOW() WHERE id = ?',
        [category.id]
      );
      
      console.log(`✅ 已禁用空分类: [${category.id}] ${category.chinese_name || category.name}`);
      removedCount++;
    } catch (error) {
      console.error(`❌ 禁用失败 [${category.id}]: ${error.message}`);
    }
  }
  
  console.log('');
  console.log('📊 清理统计:');
  console.log(`✅ 成功禁用: ${removedCount} 个空分类`);
  
  // 显示最终的菜单结构
  console.log('');
  console.log('=== 最终菜单结构 ===');
  
  const [finalCategories] = await connection.execute(`
    SELECT id, name, chinese_name, code, sort
    FROM permissions 
    WHERE parent_id IS NULL AND type = 'category' AND status = 1
    ORDER BY sort, id
  `);
  
  let totalMenus = 0;
  
  for (const category of finalCategories) {
    const [menuCount] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM permissions 
      WHERE parent_id = ? AND type = 'menu' AND status = 1
    `, [category.id]);
    
    const count = menuCount[0].count;
    totalMenus += count;
    
    console.log(`📁 [${category.id}] ${category.chinese_name || category.name}: ${count} 个菜单`);
    
    // 显示前3个菜单作为示例
    if (count > 0) {
      const [sampleMenus] = await connection.execute(`
        SELECT id, name, chinese_name, path
        FROM permissions 
        WHERE parent_id = ? AND type = 'menu' AND status = 1
        ORDER BY chinese_name, name
        LIMIT 3
      `, [category.id]);
      
      sampleMenus.forEach(menu => {
        console.log(`   ├── ${menu.chinese_name || menu.name} -> ${menu.path}`);
      });
      
      if (count > 3) {
        console.log(`   └── ... 还有 ${count - 3} 个菜单`);
      }
    }
    console.log('');
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
    console.log('🎭 角色模块:');
    for (const module of roleModules) {
      const [subCount] = await connection.execute(`
        SELECT COUNT(*) as count
        FROM permissions 
        WHERE parent_id = ? AND status = 1
      `, [module.id]);
      
      console.log(`  🎯 [${module.id}] ${module.chinese_name || module.name} (${subCount[0].count} 个子项)`);
    }
    console.log('');
  }
  
  console.log(`📊 最终统计: ${finalCategories.length} 个业务分类 + ${roleModules.length} 个角色模块，共 ${totalMenus} 个功能菜单`);
  
  await connection.end();
})().catch(console.error);
