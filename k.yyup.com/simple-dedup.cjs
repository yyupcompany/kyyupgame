const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

async function executeSimpleDedup() {
  console.log('=== 执行简单去重方案 ===\n');
  
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'kargerdensales'
    });

    console.log('✅ 数据库连接成功\n');

    // 1. 删除所有[已清理]标记的记录
    console.log('📋 步骤1: 删除[已清理]标记的记录...');
    
    // 先删除role_permissions中的引用
    const [delRolePerms] = await connection.execute(`
      DELETE FROM role_permissions 
      WHERE permission_id IN (
        SELECT id FROM permissions 
        WHERE name LIKE '[已清理]%' OR name LIKE '[已清理-空]%'
      )
    `);
    console.log(`   删除了 ${delRolePerms.affectedRows} 条角色权限关联`);
    
    // 删除[已清理]记录
    const [delPerms] = await connection.execute(`
      DELETE FROM permissions 
      WHERE name LIKE '[已清理]%' OR name LIKE '[已清理-空]%'
    `);
    console.log(`   删除了 ${delPerms.affectedRows} 条[已清理]权限记录\n`);

    // 2. 处理路径重复 - 保留ID较小的
    console.log('📋 步骤2: 处理路径重复...');
    
    // 查找路径重复的记录
    const [duplicatePaths] = await connection.execute(`
      SELECT path, COUNT(*) as cnt, GROUP_CONCAT(id ORDER BY id) as ids
      FROM permissions 
      WHERE path IS NOT NULL AND path != ''
      GROUP BY path 
      HAVING COUNT(*) > 1
    `);
    
    console.log(`   发现 ${duplicatePaths.length} 个重复路径`);
    
    for (const dup of duplicatePaths) {
      const ids = dup.ids.split(',').map(id => parseInt(id));
      const keepId = ids[0]; // 保留最小ID
      const deleteIds = ids.slice(1);
      
      console.log(`   路径 "${dup.path}": 保留ID=${keepId}, 删除ID=[${deleteIds.join(',')}]`);
      
      // 更新role_permissions引用
      for (const delId of deleteIds) {
        await connection.execute(
          'UPDATE role_permissions SET permission_id = ? WHERE permission_id = ?',
          [keepId, delId]
        );
      }
      
      // 更新子权限的parent_id
      for (const delId of deleteIds) {
        await connection.execute(
          'UPDATE permissions SET parent_id = ? WHERE parent_id = ?',
          [keepId, delId]
        );
      }
      
      // 删除重复记录
      await connection.execute(
        `DELETE FROM permissions WHERE id IN (${deleteIds.join(',')})`
      );
    }
    
    // 3. 清理role_permissions中的重复记录
    console.log('\n📋 步骤3: 清理角色权限重复...');
    const [delDupRolePerms] = await connection.execute(`
      DELETE t1 FROM role_permissions t1
      INNER JOIN role_permissions t2 
      WHERE t1.role_id = t2.role_id 
        AND t1.permission_id = t2.permission_id 
        AND t1.id > t2.id
    `);
    console.log(`   删除了 ${delDupRolePerms.affectedRows} 条重复的角色权限关联\n`);

    // 4. 显示最终结果
    console.log('📊 去重结果统计:');
    
    const [finalPermCount] = await connection.execute('SELECT COUNT(*) as count FROM permissions');
    console.log(`   当前权限总数: ${finalPermCount[0].count} (原213条)`);
    
    const [finalRolePermCount] = await connection.execute('SELECT COUNT(*) as count FROM role_permissions');
    console.log(`   角色权限关联数: ${finalRolePermCount[0].count}`);
    
    // 检查是否还有重复
    const [pathCheck] = await connection.execute(`
      SELECT COUNT(*) as cnt FROM (
        SELECT path FROM permissions 
        WHERE path IS NOT NULL AND path != '' 
        GROUP BY path HAVING COUNT(*) > 1
      ) t
    `);
    console.log(`   路径重复检查: ${pathCheck[0].cnt} 个`);
    
    const [cleanedCheck] = await connection.execute(`
      SELECT COUNT(*) as cnt FROM permissions 
      WHERE name LIKE '[已清理]%' OR name LIKE '[已清理-空]%'
    `);
    console.log(`   [已清理]记录检查: ${cleanedCheck[0].cnt} 个`);

    console.log('\n✅ 去重完成！');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

// 运行去重
executeSimpleDedup();