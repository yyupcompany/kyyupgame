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
  
  // 先显示系统中所有的一级分类和菜单结构
  console.log('\n📋 系统菜单结构:');
  
  const [categories] = await connection.execute(`
    SELECT id, name, chinese_name, code, sort
    FROM permissions 
    WHERE parent_id IS NULL AND type = 'category' AND status = 1
    ORDER BY sort, id
  `);
  
  for (const category of categories) {
    const [menus] = await connection.execute(`
      SELECT id, name, chinese_name, path, sort
      FROM permissions 
      WHERE parent_id = ? AND type = 'menu' AND status = 1
      ORDER BY sort, chinese_name
    `, [category.id]);
    
    console.log(`\n📁 ${category.chinese_name || category.name} (${menus.length}个菜单)`);
    
    menus.forEach((menu, index) => {
      const isLast = index === menus.length - 1;
      const prefix = isLast ? '   └──' : '   ├──';
      console.log(`${prefix} ${menu.chinese_name || menu.name} -> ${menu.path || 'N/A'}`);
    });
  }
  
  // 获取主要角色的权限分布
  console.log('\n\n=== 主要角色权限分布 ===');
  
  const [mainRoles] = await connection.execute(`
    SELECT id, name, code
    FROM roles 
    WHERE code IN ('admin', 'principal', 'teacher', 'parent')
    ORDER BY 
      CASE code 
        WHEN 'admin' THEN 1
        WHEN 'principal' THEN 2  
        WHEN 'teacher' THEN 3
        WHEN 'parent' THEN 4
        ELSE 5
      END
  `);
  
  for (const role of mainRoles) {
    console.log(`\n🎭 ${role.name} (${role.code})`);
    
    // 获取该角色的分类权限
    const [roleCategories] = await connection.execute(`
      SELECT DISTINCT p.id, p.chinese_name, p.name
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND p.type = 'category' AND p.status = 1
      ORDER BY p.chinese_name
    `, [role.id]);
    
    if (roleCategories.length === 0) {
      console.log('   (暂无分类权限)');
      continue;
    }
    
    for (const category of roleCategories) {
      // 获取该角色在此分类下的菜单权限
      const [roleMenus] = await connection.execute(`
        SELECT p.id, p.chinese_name, p.name, p.path
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ? AND p.parent_id = ? AND p.type = 'menu' AND p.status = 1
        ORDER BY p.chinese_name
      `, [role.id, category.id]);
      
      console.log(`   📁 ${category.chinese_name || category.name} (${roleMenus.length}个菜单)`);
      
      roleMenus.forEach((menu, index) => {
        const isLast = index === roleMenus.length - 1;
        const prefix = isLast ? '      └──' : '      ├──';
        console.log(`${prefix} ${menu.chinese_name || menu.name}`);
      });
    }
  }
  
  // 统计信息
  console.log('\n\n=== 统计信息 ===');
  
  const [totalCategories] = await connection.execute(`
    SELECT COUNT(*) as count
    FROM permissions 
    WHERE type = 'category' AND status = 1
  `);
  
  const [totalMenus] = await connection.execute(`
    SELECT COUNT(*) as count
    FROM permissions 
    WHERE type = 'menu' AND status = 1
  `);
  
  const [totalRoles] = await connection.execute(`
    SELECT COUNT(*) as count
    FROM roles 
    WHERE status = 1
  `);
  
  console.log(`📊 系统总计:`);
  console.log(`   🎭 角色数量: ${totalRoles[0].count} 个`);
  console.log(`   📁 一级分类: ${totalCategories[0].count} 个`);
  console.log(`   📋 功能菜单: ${totalMenus[0].count} 个`);
  
  await connection.end();
})().catch(console.error);
