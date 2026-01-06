const mysql = require('mysql2/promise');

async function assignReferralRoles() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    console.log('🔐 开始为更多角色分配推广中心权限...');

    // 获取推广中心权限ID
    const [referralResult] = await connection.execute(
      "SELECT id FROM permissions WHERE code = 'REFERRAL_CENTER'"
    );

    if (referralResult.length === 0) {
      throw new Error('未找到推广中心权限');
    }

    const referralId = referralResult[0].id;
    console.log(`推广中心权限ID: ${referralId}`);

    // 获取所有需要分配权限的角色
    const [rolesResult] = await connection.execute(`
      SELECT id, name FROM roles
      WHERE name IN ('admin', 'principal', 'marketing_manager', 'teacher', 'parent')
    `);

    console.log('需要分配权限的角色:');
    console.table(rolesResult);

    for (const role of rolesResult) {
      const [rolePermissionExists] = await connection.execute(
        'SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [role.id, referralId]
      );

      if (rolePermissionExists.length === 0) {
        await connection.execute(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, [role.id, referralId]);

        console.log(`✅ 为角色 ${role.name} 分配推广中心权限`);
      } else {
        console.log(`⚠️ 角色 ${role.name} 已有推广中心权限`);
      }
    }

    // 验证所有角色权限分配
    console.log('\\n📋 验证角色权限分配结果:');
    const [verifyResult] = await connection.execute(`
      SELECT r.name as role_name, p.chinese_name as permission_name, p.path, p.permission
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE p.code = 'REFERRAL_CENTER'
      ORDER BY r.name
    `);

    console.table(verifyResult);

    // 检查用户权限缓存（如果有的话）
    console.log('\\n🔄 权限已分配，建议重启前端服务以清除权限缓存:');
    console.log('   - 停止前端服务: Ctrl+C');
    console.log('   - 重新启动: npm run start:frontend');
    console.log('   - 或者重启所有服务: npm run stop && npm run start:all');

    console.log('\\n🎉 推广中心权限分配完成！');
    console.log('用户现在应该能够通过头部推广按钮访问推广页面了。');

  } catch (error) {
    console.error('❌ 分配推广中心权限失败:', error);
  } finally {
    await connection.end();
  }
}

assignReferralRoles();