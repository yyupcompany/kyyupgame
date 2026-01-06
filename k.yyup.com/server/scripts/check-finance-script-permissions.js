const mysql = require('mysql2/promise');

async function checkFinanceScriptPermissions() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    console.log('🔍 检查财务中心和话术中心的权限配置...\n');

    // 检查权限表中的相关记录
    const [permissionRows] = await connection.execute(`
      SELECT id, name, description, category, created_at, updated_at
      FROM permissions
      WHERE name LIKE '%FINANCE%'
         OR name LIKE '%SCRIPT%'
         OR name LIKE '%CENTER%'
         OR description LIKE '%财务%'
         OR description LIKE '%话术%'
      ORDER BY category, name
    `);

    console.log('📋 权限表中的相关记录:');
    if (permissionRows.length === 0) {
      console.log('❌ 未找到财务中心和话术中心的权限记录');
    } else {
      console.table(permissionRows);
    }

    // 检查所有中心类型的权限
    const [centerRows] = await connection.execute(`
      SELECT id, name, description, category, created_at, updated_at
      FROM permissions
      WHERE name LIKE '%CENTER%'
      ORDER BY category, name
    `);

    console.log('\n📋 所有中心类型的权限:');
    console.table(centerRows);

    // 检查权限表中是否有对应的权限定义
    const [permissionRows] = await connection.execute(`
      SELECT * FROM permissions 
      WHERE name IN ('FINANCE_CENTER_VIEW', 'SCRIPT_CENTER_VIEW')
    `);

    console.log('\n🔐 权限表中的相关权限:');
    if (permissionRows.length === 0) {
      console.log('❌ 未找到 FINANCE_CENTER_VIEW 和 SCRIPT_CENTER_VIEW 权限');
    } else {
      console.table(permissionRows);
    }

    // 建议添加缺失的菜单权限
    const missingMenus = [];
    const existingPaths = menuRows.map(row => row.path);
    
    if (!existingPaths.includes('/centers/finance')) {
      missingMenus.push({
        name: 'Finance Center',
        chinese_name: '财务中心',
        path: '/centers/finance',
        type: 'category',
        sort: 9
      });
    }
    
    if (!existingPaths.includes('/centers/script')) {
      missingMenus.push({
        name: 'Script Center', 
        chinese_name: '话术中心',
        path: '/centers/script',
        type: 'category',
        sort: 8
      });
    }

    if (missingMenus.length > 0) {
      console.log('\n💡 建议添加以下菜单权限:');
      console.table(missingMenus);
      
      console.log('\n📝 SQL语句:');
      for (const menu of missingMenus) {
        console.log(`INSERT INTO menu_permissions (name, chinese_name, path, type, sort, status, created_at, updated_at) VALUES ('${menu.name}', '${menu.chinese_name}', '${menu.path}', '${menu.type}', ${menu.sort}, 'active', NOW(), NOW());`);
      }
    }

  } catch (error) {
    console.error('❌ 检查权限配置失败:', error);
  } finally {
    await connection.end();
  }
}

checkFinanceScriptPermissions();
