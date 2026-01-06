const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
});

console.log('🧹 开始清理测试数据');

async function cleanupTestData() {
  try {
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 清理测试角色
    console.log('\n🗑️  清理测试角色...');
    
    // 查找测试角色
    const testRoles = await new Promise((resolve, reject) => {
      const query = `
        SELECT id, name, code 
        FROM roles 
        WHERE code LIKE 'test_%' 
           OR code LIKE 'ERROR_TEST_%'
           OR code LIKE 'BATCH_TEST_%'
           OR code LIKE 'SEARCH_TEST_%'
           OR code LIKE 'PERMISSION_TEST_%'
           OR code LIKE 'STATUS_TEST_%'
           OR code LIKE 'role_a_%'
           OR code LIKE 'role_b_%'
           OR code LIKE 'role_c_%'
           OR name LIKE 'Test Role%'
           OR name LIKE 'Debug Role%'
           OR name LIKE '%测试%'
           OR name LIKE '%xxxxxxxxx%'
        ORDER BY created_at DESC
      `;
      
      connection.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log(`找到 ${testRoles.length} 个测试角色`);
    
    if (testRoles.length > 0) {
      // 删除角色权限关联
      const roleIds = testRoles.map(role => role.id);
      const deleteRolePermissions = await new Promise((resolve, reject) => {
        const query = `DELETE FROM role_permissions WHERE role_id IN (${roleIds.join(',')})`;
        connection.query(query, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log(`删除了 ${deleteRolePermissions.affectedRows} 个角色权限关联`);
      
      // 删除用户角色关联
      const deleteUserRoles = await new Promise((resolve, reject) => {
        const query = `DELETE FROM user_roles WHERE role_id IN (${roleIds.join(',')})`;
        connection.query(query, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log(`删除了 ${deleteUserRoles.affectedRows} 个用户角色关联`);
      
      // 删除测试角色
      const deleteRoles = await new Promise((resolve, reject) => {
        const query = `DELETE FROM roles WHERE id IN (${roleIds.join(',')})`;
        connection.query(query, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log(`删除了 ${deleteRoles.affectedRows} 个测试角色`);
    }
    
    // 2. 清理测试权限
    console.log('\n🗑️  清理测试权限...');
    
    const testPermissions = await new Promise((resolve, reject) => {
      const query = `
        SELECT id, name, code 
        FROM permissions 
        WHERE code LIKE 'test_%' 
           OR code LIKE 'TEST_%'
           OR code LIKE 'duplicate_%'
           OR code LIKE 'DUPLICATE_%'
           OR name LIKE 'Test%'
           OR name LIKE 'Duplicate%'
           OR name LIKE '%测试%'
           OR name LIKE '%aaaa%'
           OR name LIKE 'Invalid%'
           OR name LIKE '%long_name%'
        ORDER BY created_at DESC
      `;
      
      connection.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log(`找到 ${testPermissions.length} 个测试权限`);
    
    if (testPermissions.length > 0) {
      // 删除角色权限关联
      const permissionIds = testPermissions.map(perm => perm.id);
      const deletePermissionRoles = await new Promise((resolve, reject) => {
        const query = `DELETE FROM role_permissions WHERE permission_id IN (${permissionIds.join(',')})`;
        connection.query(query, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log(`删除了 ${deletePermissionRoles.affectedRows} 个权限角色关联`);
      
      // 删除测试权限
      const deletePermissions = await new Promise((resolve, reject) => {
        const query = `DELETE FROM permissions WHERE id IN (${permissionIds.join(',')})`;
        connection.query(query, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log(`删除了 ${deletePermissions.affectedRows} 个测试权限`);
    }
    
    // 3. 清理测试用户
    console.log('\n🗑️  清理测试用户...');
    
    const testUsers = await new Promise((resolve, reject) => {
      const query = `
        SELECT id, username, real_name 
        FROM users 
        WHERE username LIKE 'test_%'
           OR username LIKE 'update_test_%'
           OR real_name LIKE '%测试%'
           OR real_name LIKE 'Test%'
        AND username NOT IN ('test_admin', 'test_teacher', 'test_parent')
        ORDER BY created_at DESC
      `;
      
      connection.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log(`找到 ${testUsers.length} 个测试用户`);
    
    if (testUsers.length > 0) {
      // 删除用户角色关联
      const userIds = testUsers.map(user => user.id);
      const deleteUserRoleRelations = await new Promise((resolve, reject) => {
        const query = `DELETE FROM user_roles WHERE user_id IN (${userIds.join(',')})`;
        connection.query(query, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log(`删除了 ${deleteUserRoleRelations.affectedRows} 个用户角色关联`);
      
      // 删除测试用户
      const deleteUsers = await new Promise((resolve, reject) => {
        const query = `DELETE FROM users WHERE id IN (${userIds.join(',')})`;
        connection.query(query, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log(`删除了 ${deleteUsers.affectedRows} 个测试用户`);
    }
    
    // 4. 清理重复的权限分配
    console.log('\n🗑️  清理重复的权限分配...');
    
    const duplicateRolePermissions = await new Promise((resolve, reject) => {
      const query = `
        SELECT role_id, permission_id, COUNT(*) as count
        FROM role_permissions
        GROUP BY role_id, permission_id
        HAVING COUNT(*) > 1
      `;
      
      connection.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log(`找到 ${duplicateRolePermissions.length} 个重复的权限分配`);
    
    for (const duplicate of duplicateRolePermissions) {
      // 保留一个，删除其他重复的
      const deleteDuplicates = await new Promise((resolve, reject) => {
        const query = `
          DELETE FROM role_permissions 
          WHERE role_id = ? AND permission_id = ?
          AND id NOT IN (
            SELECT * FROM (
              SELECT MIN(id) FROM role_permissions 
              WHERE role_id = ? AND permission_id = ?
            ) as temp
          )
        `;
        
        connection.query(query, [duplicate.role_id, duplicate.permission_id, duplicate.role_id, duplicate.permission_id], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log(`清理了角色${duplicate.role_id}权限${duplicate.permission_id}的${deleteDuplicates.affectedRows}个重复分配`);
    }
    
    // 5. 统计清理后的数据
    console.log('\n📊 清理后的数据统计:');
    
    const finalCounts = await new Promise((resolve, reject) => {
      const queries = [
        'SELECT COUNT(*) as count FROM users',
        'SELECT COUNT(*) as count FROM roles',
        'SELECT COUNT(*) as count FROM permissions',
        'SELECT COUNT(*) as count FROM user_roles',
        'SELECT COUNT(*) as count FROM role_permissions'
      ];
      
      const results = {};
      let completed = 0;
      
      queries.forEach((query, index) => {
        connection.query(query, (err, result) => {
          if (!err) {
            const tableName = ['users', 'roles', 'permissions', 'user_roles', 'role_permissions'][index];
            results[tableName] = result[0].count;
          }
          completed++;
          if (completed === queries.length) {
            resolve(results);
          }
        });
      });
    });
    
    console.log(`• 用户数据: ${finalCounts.users || 0} 条`);
    console.log(`• 角色数据: ${finalCounts.roles || 0} 条`);
    console.log(`• 权限数据: ${finalCounts.permissions || 0} 条`);
    console.log(`• 用户角色关联: ${finalCounts.user_roles || 0} 条`);
    console.log(`• 角色权限关联: ${finalCounts.role_permissions || 0} 条`);
    
    console.log('\n🎉 数据清理完成！');
    
  } catch (error) {
    console.error('❌ 清理过程中发生错误:', error);
  } finally {
    connection.end();
  }
}

// 如果直接运行脚本，执行清理
if (require.main === module) {
  console.log('⚠️  此脚本将清理测试数据，请确认是否继续...');
  console.log('如果确认清理，请手动运行: node cleanup-test-data.js --confirm');
  
  if (process.argv.includes('--confirm')) {
    cleanupTestData();
  } else {
    console.log('未确认，脚本退出');
  }
}

module.exports = { cleanupTestData };