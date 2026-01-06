const mysql = require('mysql2/promise');

async function assignReferralToBusinessRoles() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    console.log('🔐 为业务角色分配推广中心权限...');

    // 获取推广中心权限ID
    const [referralResult] = await connection.execute(
      `SELECT id FROM permissions WHERE code = 'REFERRAL_CENTER'`
    );

    if (referralResult.length === 0) {
      throw new Error('未找到推广中心权限');
    }

    const referralId = referralResult[0].id;
    console.log(`推广中心权限ID: ${referralId}`);

    // 为业务角色分配权限
    const businessRoles = [
      { id: 2, name: '园长' },
      { id: 3, name: '教师' },
      { id: 4, name: '家长' },
      { id: 1, name: 'Updated Test Role' } // 可能是管理员角色
    ];

    for (const role of businessRoles) {
      const [rolePermissionExists] = await connection.execute(
        'SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [role.id, referralId]
      );

      if (rolePermissionExists.length === 0) {
        await connection.execute(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, [role.id, referralId]);

        console.log(`✅ 为角色 ${role.name} (ID: ${role.id}) 分配推广中心权限`);
      } else {
        console.log(`⚠️ 角色 ${role.name} (ID: ${role.id}) 已有推广中心权限`);
      }
    }

    // 验证分配结果
    const [verifyResult] = await connection.execute(`
      SELECT r.name as role_name, r.id as role_id, p.chinese_name as permission_name, p.path
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE p.code = 'REFERRAL_CENTER'
      ORDER BY r.id
    `);

    console.log('\n📋 推广中心权限分配结果:');
    console.table(verifyResult);

    console.log('\n🎉 推广中心权限分配完成！');
    console.log('建议重启前端服务以刷新权限缓存。');

  } catch (error) {
    console.error('❌ 分配权限失败:', error);
  } finally {
    await connection.end();
  }
}

assignReferralToBusinessRoles();