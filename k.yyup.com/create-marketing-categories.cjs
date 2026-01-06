const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 创建营销管理和海报管理一级分类 ===');
  
  // 创建营销管理分类
  let marketingCategoryId = null;
  try {
    const [existing1] = await connection.execute(
      'SELECT id FROM permissions WHERE code = ? AND type = "category"',
      ['marketing-management']
    );
    
    if (existing1.length === 0) {
      const [result1] = await connection.execute(`
        INSERT INTO permissions (
          name, chinese_name, code, type, parent_id, path, 
          icon, sort, status, created_at, updated_at
        ) VALUES (?, ?, ?, 'category', NULL, ?, ?, ?, 1, NOW(), NOW())
      `, [
        '营销管理',
        '营销管理', 
        'marketing-management',
        '#marketing',
        'Megaphone',
        60
      ]);
      
      marketingCategoryId = result1.insertId;
      console.log(`✅ 创建营销管理分类: ID ${marketingCategoryId}`);
    } else {
      marketingCategoryId = existing1[0].id;
      console.log(`⚠️ 营销管理分类已存在: ID ${marketingCategoryId}`);
    }
  } catch (error) {
    console.error(`❌ 创建营销管理分类失败: ${error.message}`);
  }
  
  // 创建海报管理分类
  let posterCategoryId = null;
  try {
    const [existing2] = await connection.execute(
      'SELECT id FROM permissions WHERE code = ? AND type = "category"',
      ['poster-management']
    );
    
    if (existing2.length === 0) {
      const [result2] = await connection.execute(`
        INSERT INTO permissions (
          name, chinese_name, code, type, parent_id, path, 
          icon, sort, status, created_at, updated_at
        ) VALUES (?, ?, ?, 'category', NULL, ?, ?, ?, 1, NOW(), NOW())
      `, [
        '海报管理',
        '海报管理', 
        'poster-management',
        '#poster',
        'FileImage',
        70
      ]);
      
      posterCategoryId = result2.insertId;
      console.log(`✅ 创建海报管理分类: ID ${posterCategoryId}`);
    } else {
      posterCategoryId = existing2[0].id;
      console.log(`⚠️ 海报管理分类已存在: ID ${posterCategoryId}`);
    }
  } catch (error) {
    console.error(`❌ 创建海报管理分类失败: ${error.message}`);
  }
  
  console.log('\n=== 重新归类营销相关菜单 ===');
  
  // 营销管理相关菜单
  const marketingMenus = [
    1112, // 广告投放
    1096, // 营销管理
    1187, // 营销管理 (principal)
    // 从活动管理中移过来的营销相关菜单
    1102, // 活动列表 (营销活动)
    1203, // 园长活动 (营销活动)
    1258, // 活动管理 (principal)
  ];
  
  // 海报管理相关菜单 (重新启用之前禁用的海报相关菜单)
  const posterMenus = [
    1209, // 海报编辑器
    1210, // 海报生成器
    1211, // 海报模板
  ];
  
  // 将营销相关菜单归类到营销管理
  if (marketingCategoryId) {
    for (const menuId of marketingMenus) {
      try {
        await connection.execute(
          'UPDATE permissions SET parent_id = ?, updated_at = NOW() WHERE id = ? AND status = 1',
          [marketingCategoryId, menuId]
        );
        
        const [menuInfo] = await connection.execute(
          'SELECT chinese_name, name FROM permissions WHERE id = ?',
          [menuId]
        );
        
        if (menuInfo.length > 0) {
          console.log(`✅ [${menuId}] ${menuInfo[0].chinese_name || menuInfo[0].name} -> 营销管理`);
        }
      } catch (error) {
        console.error(`❌ 归类菜单失败 [${menuId}]: ${error.message}`);
      }
    }
  }
  
  // 重新启用海报相关菜单并归类到海报管理
  if (posterCategoryId) {
    for (const menuId of posterMenus) {
      try {
        // 重新启用菜单
        await connection.execute(
          'UPDATE permissions SET status = 1, parent_id = ?, updated_at = NOW() WHERE id = ?',
          [posterCategoryId, menuId]
        );
        
        const [menuInfo] = await connection.execute(
          'SELECT chinese_name, name FROM permissions WHERE id = ?',
          [menuId]
        );
        
        if (menuInfo.length > 0) {
          console.log(`✅ [${menuId}] ${menuInfo[0].chinese_name || menuInfo[0].name} -> 海报管理 (重新启用)`);
        }
      } catch (error) {
        console.error(`❌ 归类菜单失败 [${menuId}]: ${error.message}`);
      }
    }
  }
  
  console.log('\n=== 更新后的分类统计 ===');
  
  // 查看所有一级分类及其菜单数量
  const [categories] = await connection.execute(`
    SELECT id, name, chinese_name, code, sort
    FROM permissions 
    WHERE parent_id IS NULL AND type = 'category' AND status = 1
    ORDER BY sort, id
  `);
  
  let totalMenus = 0;
  
  for (const category of categories) {
    const [menuCount] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM permissions 
      WHERE parent_id = ? AND type = 'menu' AND status = 1
    `, [category.id]);
    
    const count = menuCount[0].count;
    totalMenus += count;
    
    console.log(`📁 [${category.id}] ${category.chinese_name || category.name}: ${count} 个菜单`);
  }
  
  console.log(`\n📊 总计: ${categories.length} 个一级分类，${totalMenus} 个功能菜单`);
  
  await connection.end();
})().catch(console.error);
