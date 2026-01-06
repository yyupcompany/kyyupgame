const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function cleanEmptyCategories() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 1. 找出空的分类（没有子菜单或子菜单都被禁用的分类）
    const emptyCategoryQuery = `
      SELECT p.id, p.name, p.chinese_name,
             COUNT(child.id) as total_children,
             COUNT(CASE WHEN child.status = 1 THEN 1 END) as active_children
      FROM permissions p
      LEFT JOIN permissions child ON child.parent_id = p.id AND child.status = 1
      WHERE p.type = 'category' AND p.status = 1
      GROUP BY p.id, p.name, p.chinese_name
      HAVING active_children = 0
      ORDER BY p.sort;
    `;
    
    const [emptyCategories] = await connection.execute(emptyCategoryQuery);
    console.log(`🔍 找到 ${emptyCategories.length} 个空的分类需要清理`);

    // 2. 找出调试分类
    const debugCategoryQuery = `
      SELECT id, name, chinese_name
      FROM permissions 
      WHERE type = 'category' 
      AND status = 1
      AND (
        name LIKE '%(调试)%' OR
        name LIKE '%debug%' OR
        name LIKE '%test%' OR
        name = 'AI助手(调试)' OR
        name = '班级管理(调试)' OR
        name = '仪表板(调试)' OR
        name = '招生管理(调试)' OR
        name = '家长管理(调试)' OR
        name = '系统管理(调试)'
      )
      ORDER BY id;
    `;
    
    const [debugCategories] = await connection.execute(debugCategoryQuery);
    console.log(`🔍 找到 ${debugCategories.length} 个调试分类需要清理`);

    // 3. 显示将要清理的分类
    console.log('\n📋 空分类清单:');
    emptyCategories.forEach((category, index) => {
      console.log(`${index + 1}. [ID:${category.id}] ${category.name} (子菜单: ${category.total_children}, 活跃: ${category.active_children})`);
    });

    console.log('\n📋 调试分类清单:');
    debugCategories.forEach((category, index) => {
      console.log(`${index + 1}. [ID:${category.id}] ${category.name}`);
    });

    // 4. 禁用空分类
    if (emptyCategories.length > 0) {
      const categoryIds = emptyCategories.map(cat => cat.id);
      const updateQuery = `
        UPDATE permissions 
        SET status = 0,
            name = CONCAT('[已清理-空] ', name),
            updated_at = NOW()
        WHERE id IN (${categoryIds.join(',')});
      `;
      
      await connection.execute(updateQuery);
      console.log(`✅ 已禁用 ${emptyCategories.length} 个空分类`);
    }

    // 5. 禁用调试分类
    if (debugCategories.length > 0) {
      const debugIds = debugCategories.map(cat => cat.id);
      const updateDebugQuery = `
        UPDATE permissions 
        SET status = 0,
            name = CONCAT('[已清理-调试] ', name),
            updated_at = NOW()
        WHERE id IN (${debugIds.join(',')});
      `;
      
      await connection.execute(updateDebugQuery);
      console.log(`✅ 已禁用 ${debugCategories.length} 个调试分类`);
    }

    // 6. 显示清理后的活跃分类结构
    const [cleanCategories] = await connection.execute(`
      SELECT p.id, p.name, p.chinese_name,
             COUNT(child.id) as active_children
      FROM permissions p
      LEFT JOIN permissions child ON child.parent_id = p.id AND child.status = 1
      WHERE p.type = 'category' AND p.status = 1
      AND p.name NOT LIKE '[已清理%'
      GROUP BY p.id, p.name, p.chinese_name
      HAVING active_children > 0
      ORDER BY p.sort;
    `);
    
    console.log(`\n✨ 清理后的活跃分类 (${cleanCategories.length} 个):`);
    cleanCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.active_children} 个子菜单)`);
    });

    // 7. 最终统计
    const [finalStats] = await connection.execute(`
      SELECT 
        COUNT(CASE WHEN type = 'category' AND status = 1 THEN 1 END) as active_categories,
        COUNT(CASE WHEN type = 'menu' AND status = 1 THEN 1 END) as active_menus,
        COUNT(CASE WHEN status = 0 THEN 1 END) as disabled_total
      FROM permissions
    `);
    
    console.log('\n📊 最终统计:');
    console.log(`活跃分类: ${finalStats[0].active_categories}`);
    console.log(`活跃菜单: ${finalStats[0].active_menus}`);
    console.log(`已禁用项: ${finalStats[0].disabled_total}`);

  } catch (error) {
    console.error('❌ 处理失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔚 数据库连接已关闭');
    }
  }
}

cleanEmptyCategories();