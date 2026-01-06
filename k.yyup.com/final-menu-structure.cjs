const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 最终菜单层级结构 ===');
  
  // 查看所有一级分类
  const [categories] = await connection.execute(`
    SELECT id, name, chinese_name, code, sort
    FROM permissions 
    WHERE parent_id IS NULL AND type = 'category' AND status = 1
    ORDER BY sort, id
  `);
  
  let totalMenus = 0;
  
  for (const category of categories) {
    // 获取该分类下的所有菜单
    const [menus] = await connection.execute(`
      SELECT id, name, chinese_name, path, sort
      FROM permissions 
      WHERE parent_id = ? AND type = 'menu' AND status = 1
      ORDER BY sort, chinese_name, name
    `, [category.id]);
    
    const count = menus.length;
    totalMenus += count;
    
    console.log(`\n📁 [${category.id}] ${category.chinese_name || category.name} (${count} 个菜单)`);
    
    if (count > 0) {
      menus.forEach((menu, index) => {
        const isLast = index === menus.length - 1;
        const prefix = isLast ? '└──' : '├──';
        const menuName = menu.chinese_name || menu.name;
        const menuPath = menu.path || 'N/A';
        
        console.log(`   ${prefix} [${menu.id}] ${menuName} -> ${menuPath}`);
      });
    }
  }
  
  console.log(`\n📊 最终统计:`);
  console.log(`✅ 一级分类: ${categories.length} 个`);
  console.log(`✅ 功能菜单: ${totalMenus} 个`);
  console.log(`✅ 平均每个分类: ${Math.round(totalMenus/categories.length)} 个菜单`);
  
  // 统计原始数据
  const [originalTotal] = await connection.execute(`
    SELECT COUNT(*) as count
    FROM permissions 
    WHERE type = 'menu'
  `);
  
  const [disabledCount] = await connection.execute(`
    SELECT COUNT(*) as count
    FROM permissions 
    WHERE type = 'menu' AND status = 0
  `);
  
  console.log(`\n📈 清理效果:`);
  console.log(`📋 原始菜单总数: ${originalTotal[0].count} 个`);
  console.log(`❌ 已禁用组件页面: ${disabledCount[0].count} 个`);
  console.log(`✅ 保留功能菜单: ${totalMenus} 个`);
  console.log(`📊 功能菜单占比: ${Math.round(totalMenus/originalTotal[0].count*100)}%`);
  console.log(`📊 组件页面占比: ${Math.round(disabledCount[0].count/originalTotal[0].count*100)}%`);
  
  await connection.end();
})().catch(console.error);
