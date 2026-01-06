const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 数据库菜单路径和组件信息 ===');
  
  // 查看所有一级分类
  const [categories] = await connection.execute(`
    SELECT id, name, chinese_name, code, sort
    FROM permissions 
    WHERE parent_id IS NULL AND type = 'category' AND status = 1
    ORDER BY sort, id
  `);
  
  for (const category of categories) {
    // 获取该分类下的所有菜单
    const [menus] = await connection.execute(`
      SELECT id, name, chinese_name, path, component, sort
      FROM permissions 
      WHERE parent_id = ? AND type = 'menu' AND status = 1
      ORDER BY sort, chinese_name, name
    `, [category.id]);
    
    const count = menus.length;
    
    console.log(`\n📁 ${category.chinese_name || category.name} (${count}个菜单)`);
    
    if (count > 0) {
      menus.forEach((menu, index) => {
        const menuName = menu.chinese_name || menu.name;
        const menuPath = menu.path || 'N/A';
        const component = menu.component || 'NULL';
        
        console.log(`   ✅ [${menu.id}] ${menuName} -> ${menuPath} [${component}]`);
      });
    } else {
      console.log('   (暂无菜单)');
    }
  }
  
  await connection.end();
})();
