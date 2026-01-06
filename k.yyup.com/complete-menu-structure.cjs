const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 完整详细的菜单层级结构 ===');
  
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
    
    console.log(`\n📁 ${category.chinese_name || category.name} (${count}个菜单)`);
    
    if (count > 0) {
      menus.forEach((menu, index) => {
        const menuName = menu.chinese_name || menu.name;
        const menuPath = menu.path || 'N/A';
        
        console.log(`   ✅ [${menu.id}] ${menuName} -> ${menuPath}`);
      });
    } else {
      console.log('   (暂无菜单)');
    }
  }
  
  console.log(`\n📊 完整统计:`);
  console.log(`✅ 一级分类总数: ${categories.length} 个`);
  console.log(`✅ 功能菜单总数: ${totalMenus} 个`);
  
  // 按分类详细统计
  console.log(`\n📋 各分类详细统计:`);
  for (const category of categories) {
    const [menus] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM permissions 
      WHERE parent_id = ? AND type = 'menu' AND status = 1
    `, [category.id]);
    
    console.log(`   📁 ${category.chinese_name || category.name}: ${menus[0].count} 个菜单`);
  }
  
  await connection.end();
})().catch(console.error);
