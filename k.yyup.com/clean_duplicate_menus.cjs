const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function cleanDuplicateMenus() {
  let connection;
  
  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 1. 找出英文菜单项（需要清理的项目）
    const englishMenuQuery = `
      SELECT id, name, chinese_name, path, type, parent_id
      FROM permissions 
      WHERE type = 'menu' 
      AND (
        name REGEXP '[A-Za-z-]+' 
        AND name NOT IN ('AI助手', 'AI查询执行', 'AI预测')
        AND (
          name LIKE '%Dialog%' OR 
          name LIKE '%Form%' OR 
          name LIKE '%Create%' OR 
          name LIKE '%Detail%' OR 
          name LIKE '%List%' OR 
          name LIKE '%Management%' OR
          name LIKE '%Interface%' OR
          name LIKE '%Page%' OR
          name LIKE '%-analytics%' OR
          name LIKE '%-engine%' OR
          name LIKE '%-optimization%' OR
          name LIKE '%-evaluation%' OR
          name LIKE '%-forecast%' OR
          name LIKE '%-planning%' OR
          name LIKE '%-strategy%' OR
          name LIKE '%-analysis%' OR
          name LIKE '%-simulation%' OR
          name LIKE 'Smart-%' OR
          name LIKE 'Application%' OR
          name LIKE 'Enrollment%' OR
          name LIKE 'Plan%' OR
          name LIKE 'Quota%' OR
          name LIKE 'Teacher%' OR
          name LIKE 'Class%' OR
          name LIKE 'Student%' OR
          name LIKE 'Activity%' OR
          name LIKE '%Hub%' OR
          name = 'Id' OR
          name = 'Login' OR
          name = '403' OR
          name = '404'
        )
      )
      ORDER BY id;
    `;
    
    const [englishMenus] = await connection.execute(englishMenuQuery);
    console.log(`🔍 找到 ${englishMenus.length} 个英文/调试菜单项需要处理`);

    // 2. 找出调试分类（需要清理的分类）
    const debugCategoryQuery = `
      SELECT id, name, chinese_name, path, type, parent_id
      FROM permissions 
      WHERE type = 'category' 
      AND (
        name LIKE '%(调试)%' OR
        name LIKE '%debug%' OR
        name LIKE '%test%'
      )
      ORDER BY id;
    `;
    
    const [debugCategories] = await connection.execute(debugCategoryQuery);
    console.log(`🔍 找到 ${debugCategories.length} 个调试分类需要处理`);

    // 3. 显示将要删除的菜单项
    console.log('\n📋 英文/调试菜单项清单:');
    englishMenus.forEach((menu, index) => {
      console.log(`${index + 1}. [ID:${menu.id}] ${menu.name} -> ${menu.path}`);
    });

    console.log('\n📋 调试分类清单:');
    debugCategories.forEach((category, index) => {
      console.log(`${index + 1}. [ID:${category.id}] ${category.name}`);
    });

    // 4. 禁用这些菜单项（而不是删除，以保持数据完整性）
    if (englishMenus.length > 0) {
      const menuIds = englishMenus.map(menu => menu.id);
      const updateMenuQuery = `
        UPDATE permissions 
        SET status = 0, 
            name = CONCAT('[已清理] ', name),
            updated_at = NOW()
        WHERE id IN (${menuIds.join(',')});
      `;
      
      await connection.execute(updateMenuQuery);
      console.log(`✅ 已禁用 ${englishMenus.length} 个英文/调试菜单项`);
    }

    // 5. 禁用调试分类
    if (debugCategories.length > 0) {
      const categoryIds = debugCategories.map(category => category.id);
      const updateCategoryQuery = `
        UPDATE permissions 
        SET status = 0,
            name = CONCAT('[已清理] ', name),
            updated_at = NOW()
        WHERE id IN (${categoryIds.join(',')});
      `;
      
      await connection.execute(updateCategoryQuery);
      console.log(`✅ 已禁用 ${debugCategories.length} 个调试分类`);
    }

    // 6. 统计清理结果
    const [finalCount] = await connection.execute(`
      SELECT 
        COUNT(*) as total_permissions,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_permissions,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as disabled_permissions
      FROM permissions
    `);
    
    console.log('\n📊 清理完成统计:');
    console.log(`总权限数: ${finalCount[0].total_permissions}`);
    console.log(`活跃权限: ${finalCount[0].active_permissions}`);
    console.log(`禁用权限: ${finalCount[0].disabled_permissions}`);

    // 7. 显示清理后的活跃中文菜单
    const [cleanMenus] = await connection.execute(`
      SELECT p.name, p.path, pc.name as category_name
      FROM permissions p
      LEFT JOIN permissions pc ON p.parent_id = pc.id
      WHERE p.type = 'menu' AND p.status = 1
      AND p.name NOT LIKE '[已清理]%'
      ORDER BY pc.sort, p.sort;
    `);
    
    console.log(`\n✨ 清理后活跃中文菜单 (${cleanMenus.length} 个):`);
    let currentCategory = '';
    cleanMenus.forEach((menu, index) => {
      if (menu.category_name !== currentCategory) {
        currentCategory = menu.category_name;
        console.log(`\n📁 ${currentCategory || '未分类'}:`);
      }
      console.log(`  ${index + 1}. ${menu.name} -> ${menu.path}`);
    });

  } catch (error) {
    console.error('❌ 处理失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔚 数据库连接已关闭');
    }
  }
}

// 执行清理
cleanDuplicateMenus();