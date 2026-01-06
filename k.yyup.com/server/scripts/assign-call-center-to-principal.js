const mysql = require('mysql2/promise');

async function assignCallCenterToPrincipal() {
  let connection;

  try {
    console.log('\n' + '='.repeat(70));
    console.log('🔧 为园长角色分配呼叫中心权限');
    console.log('='.repeat(70) + '\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: parseInt(process.env.DB_PORT || '43906'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Yyup@2024',
      database: process.env.DB_NAME || 'kindergarten_management'
    });

    console.log('✅ 数据库连接成功\n');

    // 1. 查找园长角色
    console.log('🔍 查找园长角色...');
    const [principalRoles] = await connection.query(`
      SELECT id, name, code FROM roles WHERE code = 'principal' LIMIT 1
    `);

    if (!principalRoles || principalRoles.length === 0) {
      console.error('❌ 未找到园长角色');
      return;
    }

    const principalRole = principalRoles[0];
    console.log(`✅ 找到园长角色: ID=${principalRole.id}, Name=${principalRole.name}\n`);

    // 2. 查找所有呼叫中心权限
    console.log('🔍 查找呼叫中心权限...');
    const [callCenterPermissions] = await connection.query(`
      SELECT id, name, chinese_name, code, type, parent_id
      FROM permissions
      WHERE code = 'CALL_CENTER' OR code LIKE 'call_center_%'
      ORDER BY id
    `);

    if (!callCenterPermissions || callCenterPermissions.length === 0) {
      console.error('❌ 未找到呼叫中心权限');
      return;
    }

    console.log(`✅ 找到 ${callCenterPermissions.length} 个呼叫中心权限\n`);

    // 3. 为园长角色分配权限
    console.log('📝 为园长角色分配权限...\n');
    let addedCount = 0;
    let skippedCount = 0;

    for (const permission of callCenterPermissions) {
      // 检查是否已存在
      const [existing] = await connection.query(`
        SELECT id FROM role_permissions 
        WHERE role_id = ? AND permission_id = ?
      `, [principalRole.id, permission.id]);

      if (existing.length > 0) {
        console.log(`⏭️  跳过: ${permission.chinese_name || permission.name} (已存在)`);
        skippedCount++;
      } else {
        // 添加权限
        await connection.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, [principalRole.id, permission.id]);
        
        console.log(`✅ 添加: ${permission.chinese_name || permission.name}`);
        addedCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`📊 结果: 新增 ${addedCount} 个权限，跳过 ${skippedCount} 个权限`);
    console.log('='.repeat(70) + '\n');

    // 4. 验证权限分配
    console.log('🔍 验证权限分配...\n');
    const [verifyPermissions] = await connection.query(`
      SELECT p.id, p.name, p.chinese_name, p.code, p.type, p.path
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND (p.code = 'CALL_CENTER' OR p.code LIKE 'call_center_%')
      ORDER BY p.id
    `, [principalRole.id]);

    if (verifyPermissions && verifyPermissions.length > 0) {
      console.log(`✅ 园长角色现在有 ${verifyPermissions.length} 个呼叫中心权限:\n`);
      verifyPermissions.forEach((perm, index) => {
        console.log(`${index + 1}. ${perm.chinese_name || perm.name}`);
        console.log(`   Code: ${perm.code}`);
        console.log(`   Type: ${perm.type}`);
        console.log(`   Path: ${perm.path || 'N/A'}\n`);
      });
    } else {
      console.log('❌ 权限分配失败\n');
    }

    console.log('🎉 完成！\n');

  } catch (error) {
    console.error('\n❌ 操作失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

assignCallCenterToPrincipal();

