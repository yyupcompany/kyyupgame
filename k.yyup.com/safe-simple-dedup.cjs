const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

async function executeSafeDedup() {
  console.log('=== 执行安全去重方案 ===\n');
  
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

    // 开始事务
    await connection.beginTransaction();

    try {
      // 1. 查看当前状态
      console.log('📊 当前数据状态:');
      const [beforeStats] = await connection.execute('SELECT COUNT(*) as count FROM permissions');
      console.log(`   权限总数: ${beforeStats[0].count}`);
      
      const [cleanedCount] = await connection.execute(`
        SELECT COUNT(*) as count FROM permissions 
        WHERE name LIKE '[已清理]%' OR name LIKE '[已清理-空]%'
      `);
      console.log(`   [已清理]记录数: ${cleanedCount[0].count}\n`);

      // 2. 处理路径重复
      console.log('📋 处理路径重复...');
      
      // 查找路径重复的记录（排除已删除的）
      const [duplicatePaths] = await connection.execute(`
        SELECT path, COUNT(*) as cnt, GROUP_CONCAT(id ORDER BY id) as ids
        FROM permissions 
        WHERE path IS NOT NULL AND path != ''
          AND name NOT LIKE '[已清理]%' 
          AND name NOT LIKE '[已清理-空]%'
        GROUP BY path 
        HAVING COUNT(*) > 1
      `);
      
      console.log(`   发现 ${duplicatePaths.length} 个重复路径（排除[已清理]后）\n`);
      
      for (const dup of duplicatePaths) {
        const ids = dup.ids.split(',').map(id => parseInt(id));
        const keepId = ids[0]; // 保留最小ID
        const deleteIds = ids.slice(1);
        
        console.log(`   处理路径 "${dup.path}":`);
        console.log(`     保留: ID=${keepId}`);
        console.log(`     删除: ID=[${deleteIds.join(',')}]`);
        
        // 对每个要删除的ID进行处理
        for (const delId of deleteIds) {
          // 检查是否有相同的role_id和permission_id组合
          const [existingRolePerms] = await connection.execute(`
            SELECT DISTINCT rp1.role_id
            FROM role_permissions rp1
            WHERE rp1.permission_id = ?
              AND EXISTS (
                SELECT 1 FROM role_permissions rp2 
                WHERE rp2.role_id = rp1.role_id 
                  AND rp2.permission_id = ?
              )
          `, [delId, keepId]);
          
          if (existingRolePerms.length > 0) {
            console.log(`     跳过更新role_permissions (${existingRolePerms.length}个角色已有权限${keepId})`);
            // 直接删除重复的引用
            await connection.execute(
              'DELETE FROM role_permissions WHERE permission_id = ?',
              [delId]
            );
          } else {
            // 更新不重复的引用
            const [updateResult] = await connection.execute(
              'UPDATE role_permissions SET permission_id = ? WHERE permission_id = ?',
              [keepId, delId]
            );
            console.log(`     更新了 ${updateResult.affectedRows} 条角色权限引用`);
          }
          
          // 更新子权限的parent_id
          const [updateParent] = await connection.execute(
            'UPDATE permissions SET parent_id = ? WHERE parent_id = ?',
            [keepId, delId]
          );
          if (updateParent.affectedRows > 0) {
            console.log(`     更新了 ${updateParent.affectedRows} 个子权限`);
          }
        }
        
        // 删除重复记录
        const [delResult] = await connection.execute(
          `DELETE FROM permissions WHERE id IN (${deleteIds.map(() => '?').join(',')})`,
          deleteIds
        );
        console.log(`     删除了 ${delResult.affectedRows} 条重复权限\n`);
      }

      // 3. 清理角色权限重复
      console.log('📋 清理角色权限重复...');
      const [delDupRolePerms] = await connection.execute(`
        DELETE t1 FROM role_permissions t1
        INNER JOIN role_permissions t2 
        WHERE t1.role_id = t2.role_id 
          AND t1.permission_id = t2.permission_id 
          AND t1.id > t2.id
      `);
      console.log(`   删除了 ${delDupRolePerms.affectedRows} 条重复的角色权限关联\n`);

      // 4. 最终统计
      console.log('📊 去重后统计:');
      
      const [afterPermCount] = await connection.execute('SELECT COUNT(*) as count FROM permissions');
      console.log(`   权限总数: ${afterPermCount[0].count} (减少了${beforeStats[0].count - afterPermCount[0].count}条)`);
      
      const [afterRolePermCount] = await connection.execute('SELECT COUNT(*) as count FROM role_permissions');
      console.log(`   角色权限关联数: ${afterRolePermCount[0].count}`);
      
      // 检查是否还有重复
      const [pathCheck] = await connection.execute(`
        SELECT path, COUNT(*) as cnt 
        FROM permissions 
        WHERE path IS NOT NULL AND path != '' 
        GROUP BY path 
        HAVING COUNT(*) > 1
      `);
      console.log(`   路径重复检查: ${pathCheck.length} 个`);
      if (pathCheck.length > 0) {
        pathCheck.forEach(p => {
          console.log(`     - "${p.path}" 仍有 ${p.cnt} 条`);
        });
      }

      // 提交事务
      await connection.commit();
      console.log('\n✅ 去重完成，事务已提交！');

    } catch (error) {
      // 回滚事务
      await connection.rollback();
      console.log('\n❌ 出错，事务已回滚');
      throw error;
    }

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
executeSafeDedup();