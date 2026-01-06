const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 完整菜单树形结构 ===');
  
  // 查看所有一级分类
  const [categories] = await connection.execute(`
    SELECT id, name, chinese_name, code, sort
    FROM permissions 
    WHERE parent_id IS NULL AND type IN ('category', 'menu') AND status = 1
    ORDER BY sort, id
  `);
  
  for (const category of categories) {
    // 统计该分类下的菜单数量
    const [menuCount] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM permissions 
      WHERE parent_id = ? AND status = 1
    `, [category.id]);
    
    const count = menuCount[0].count;
    
    console.log(`📁 [${category.id}] ${category.chinese_name || category.name} (${count} 个子项)`);
    
    if (count > 0) {
      // 获取所有子菜单
      const [subMenus] = await connection.execute(`
        SELECT id, name, chinese_name, path, type, sort
        FROM permissions 
        WHERE parent_id = ? AND status = 1
        ORDER BY sort, id
      `, [category.id]);
      
      subMenus.forEach((menu, index) => {
        const isLast = index === subMenus.length - 1;
        const prefix = isLast ? '└──' : '├──';
        const menuName = menu.chinese_name || menu.name;
        const menuPath = menu.path || 'N/A';
        
        console.log(`   ${prefix} [${menu.id}] ${menuName} -> ${menuPath}`);
        
        // 如果是category类型，查看其子菜单
        if (menu.type === 'category') {
          // 这里可以添加三级菜单的显示逻辑
        }
      });
    }
    console.log('');
  }
  
  await connection.end();
})().catch(console.error);
