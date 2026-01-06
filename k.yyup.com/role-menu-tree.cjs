const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 角色->一级分类->二级菜单 树形列表 ===');
  
  // 获取所有角色
  const [roles] = await connection.execute(`
    SELECT id, name, chinese_name, code
    FROM roles 
    WHERE status = 1
    ORDER BY id
  `);
  
  console.log(`\n找到 ${roles.length} 个角色\n`);
  
  for (const role of roles) {
    console.log(`🎭 ${role.chinese_name || role.name} (${role.code})`);
    
    // 获取该角色的所有权限
    const [rolePermissions] = await connection.execute(`
      SELECT p.id, p.name, p.chinese_name, p.type, p.parent_id, p.path, p.sort
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND p.status = 1
      ORDER BY p.type DESC, p.sort, p.chinese_name
    `, [role.id]);
    
    // 分离一级分类和菜单
    const categories = rolePermissions.filter(p => p.type === 'category' && p.parent_id === null);
    const menus = rolePermissions.filter(p => p.type === 'menu');
    
    if (categories.length === 0 && menus.length === 0) {
      console.log('   (暂无权限)\n');
      continue;
    }
    
    // 显示一级分类及其下的菜单
    for (const category of categories) {
      // 找到该分类下的菜单
      const categoryMenus = menus.filter(m => m.parent_id === category.id);
      
      console.log(`   📁 ${category.chinese_name || category.name} (${categoryMenus.length}个菜单)`);
      
      if (categoryMenus.length > 0) {
        // 按排序显示菜单
        categoryMenus.sort((a, b) => (a.sort || 999) - (b.sort || 999));
        
        categoryMenus.forEach((menu, index) => {
          const isLast = index === categoryMenus.length - 1;
          const prefix = isLast ? '      └──' : '      ├──';
          console.log(`${prefix} ${menu.chinese_name || menu.name} -> ${menu.path || 'N/A'}`);
        });
      } else {
        console.log('      (暂无菜单)');
      }
      console.log('');
    }
    
    // 显示没有分类的根级菜单（如果有的话）
    const rootMenus = menus.filter(m => m.parent_id === null || !categories.find(c => c.id === m.parent_id));
    if (rootMenus.length > 0) {
      console.log('   📋 其他菜单:');
      rootMenus.forEach((menu, index) => {
        const isLast = index === rootMenus.length - 1;
        const prefix = isLast ? '      └──' : '      ├──';
        console.log(`${prefix} ${menu.chinese_name || menu.name} -> ${menu.path || 'N/A'}`);
      });
      console.log('');
    }
    
    console.log(`   📊 权限统计: ${categories.length}个分类, ${menus.length}个菜单\n`);
  }
  
  // 总体统计
  console.log('=== 总体统计 ===');
  
  // 获取所有一级分类
  const [allCategories] = await connection.execute(`
    SELECT id, name, chinese_name, code, sort
    FROM permissions 
    WHERE parent_id IS NULL AND type = 'category' AND status = 1
    ORDER BY sort, id
  `);
  
  console.log(`\n📁 系统中的所有一级分类 (${allCategories.length}个):`);
  for (const category of allCategories) {
    // 统计该分类下的菜单数量
    const [menuCount] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM permissions 
      WHERE parent_id = ? AND type = 'menu' AND status = 1
    `, [category.id]);
    
    console.log(`   📁 ${category.chinese_name || category.name}: ${menuCount[0].count}个菜单`);
  }
  
  // 获取所有菜单总数
  const [totalMenus] = await connection.execute(`
    SELECT COUNT(*) as count
    FROM permissions 
    WHERE type = 'menu' AND status = 1
  `);
  
  console.log(`\n📊 系统总计: ${allCategories.length}个一级分类, ${totalMenus[0].count}个功能菜单`);
  
  await connection.end();
})().catch(console.error);
