const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

async function fixPrincipalPermissions() {
  console.log('========== 修复园长权限 ==========\n');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'kargerdensales'
    });

    // 1. 获取系统管理相关的所有权限ID
    const [systemCategory] = await connection.execute(
      `SELECT id FROM permissions WHERE name = '系统管理' AND type = 'category' AND status = 1`
    );
    
    if (systemCategory.length === 0) {
      console.log('⚠️ 未找到系统管理分类');
      return;
    }

    const systemCategoryId = systemCategory[0].id;
    
    const [systemChildren] = await connection.execute(
      `SELECT id FROM permissions WHERE parent_id = ? AND status = 1`,
      [systemCategoryId]
    );
    
    const systemPermissionIds = [systemCategoryId, ...systemChildren.map(p => p.id)];
    console.log(`📌 系统管理权限ID (${systemPermissionIds.length}个):`, systemPermissionIds.join(', '));

    // 2. 获取admin的所有权限（排除TEACHER_和PARENT_）
    const [adminPerms] = await connection.execute(
      `SELECT DISTINCT p.id
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = 1 
         AND p.status = 1
         AND p.code NOT LIKE 'TEACHER_%'
         AND p.code NOT LIKE 'PARENT_%'
       ORDER BY p.id`
    );

    const adminPermIds = adminPerms.map(p => p.id);
    console.log(`📊 Admin中心权限总数: ${adminPermIds.length}`);

    // 3. 计算园长应该拥有的权限（admin的权限 - 系统管理）
    const targetPrincipalIds = adminPermIds.filter(id => !systemPermissionIds.includes(id));
    console.log(`✅ 园长应该拥有的权限数量: ${targetPrincipalIds.length}\n`);

    // 4. 删除园长现有的所有权限
    console.log('🔧 清除园长现有权限...');
    await connection.execute(`DELETE FROM role_permissions WHERE role_id = 2`);
    console.log('✅ 已清除\n');

    // 4.5 查找有效的admin用户ID
    const [adminUser] = await connection.execute(
      `SELECT u.id FROM users u 
       JOIN user_roles ur ON u.id = ur.user_id 
       JOIN roles r ON ur.role_id = r.id 
       WHERE r.code = 'admin' LIMIT 1`
    );
    
    const grantorId = adminUser.length > 0 ? adminUser[0].id : null;
    console.log(`📝 授权人ID: ${grantorId || 'NULL (系统)'}\n`);

    // 5. 为园长添加新权限
    console.log('🔧 为园长添加新权限...');
    let addedCount = 0;
    for (const permId of targetPrincipalIds) {
      await connection.execute(
        `INSERT INTO role_permissions (role_id, permission_id, grantor_id, created_at, updated_at) 
         VALUES (2, ?, ?, NOW(), NOW())`,
        [permId, grantorId]
      );
      addedCount++;
      if (addedCount % 10 === 0) {
        process.stdout.write(`  添加中... ${addedCount}/${targetPrincipalIds.length}\r`);
      }
    }
    console.log(`\n✅ 成功为园长添加 ${addedCount} 个权限\n`);

    // 6. 验证结果
    const [finalCount] = await connection.execute(
      `SELECT COUNT(*) as count FROM role_permissions WHERE role_id = 2`
    );
    console.log(`📊 验证：园长现在有 ${finalCount[0].count} 个权限`);

    // 7. 显示园长拥有的中心分类
    const [principalCategories] = await connection.execute(
      `SELECT DISTINCT p.name, p.code
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = 2 
         AND p.status = 1
         AND p.type = 'category'
         AND p.code NOT LIKE 'TEACHER_%'
         AND p.code NOT LIKE 'PARENT_%'
       ORDER BY p.name`
    );

    console.log(`\n📋 园长可访问的中心 (${principalCategories.length}个):`);
    principalCategories.forEach(cat => {
      console.log(`  ✅ ${cat.name}`);
    });

    console.log('\n========== 修复完成！==========');

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixPrincipalPermissions();

