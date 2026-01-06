const mysql = require('mysql2/promise');

async function addReferralPermission() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    console.log('🎁 开始添加推广中心权限...');

    // 获取当前最大ID
    const [maxIdResult] = await connection.execute(
      'SELECT MAX(id) as maxId FROM permissions'
    );
    const maxId = maxIdResult[0].maxId || 0;
    console.log(`当前最大权限ID: ${maxId}`);

    // 获取营销中心的ID作为父级权限
    const [marketingResult] = await connection.execute(
      "SELECT id FROM permissions WHERE code = 'MARKETING_CENTER'"
    );

    if (marketingResult.length === 0) {
      throw new Error('未找到营销中心权限，请先创建营销中心权限');
    }

    const marketingId = marketingResult[0].id;
    console.log(`找到营销中心权限ID: ${marketingId}`);

    // 获取营销中心下的最大排序值
    const [maxSortResult] = await connection.execute(
      'SELECT MAX(sort) as maxSort FROM permissions WHERE parent_id = ?',
      [marketingId]
    );
    const maxSort = maxSortResult[0].maxSort || 0;
    console.log(`营销中心下最大排序值: ${maxSort}`);

    // 插入推广中心权限
    const newPermissionId = maxId + 1;
    const [insertResult] = await connection.execute(`
      INSERT INTO permissions (
        id, name, chinese_name, code, type, parent_id, path, component,
        permission, icon, sort, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      newPermissionId,
      'Referral Center',
      '推广中心',
      'REFERRAL_CENTER',
      'menu',
      marketingId,
      '/marketing/referrals',
      'pages/marketing/referrals/index.vue',
      'referral:center:view',
      'Gift',
      maxSort + 1,
      1
    ]);

    console.log('✅ 推广中心权限创建成功:', {
      id: newPermissionId,
      name: 'Referral Center',
      chinese_name: '推广中心',
      path: '/marketing/referrals'
    });

    // 为角色分配推广中心权限
    console.log('\\n🔐 开始为角色分配推广中心权限...');

    // 获取需要分配权限的角色
    const [rolesResult] = await connection.execute(`
      SELECT id, name FROM roles
      WHERE name IN ('admin', 'principal', 'marketing_manager', 'teacher')
    `);

    console.log('找到的角色:');
    console.table(rolesResult);

    for (const role of rolesResult) {
      const [rolePermissionExists] = await connection.execute(
        'SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [role.id, newPermissionId]
      );

      if (rolePermissionExists.length === 0) {
        await connection.execute(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, [role.id, newPermissionId]);

        console.log(`✅ 为角色 ${role.name} 分配推广中心权限`);
      } else {
        console.log(`⚠️ 角色 ${role.name} 已有推广中心权限`);
      }
    }

    // 验证权限创建结果
    const [verifyResult] = await connection.execute(`
      SELECT p.*, rp.role_id
      FROM permissions p
      LEFT JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE p.id = ?
    `, [newPermissionId]);

    console.log('\\n📋 权限创建验证结果:');
    console.table(verifyResult);

    // 检查权限路由路径是否正确
    const componentPath = '/home/zhgue/k.yyup.cc/client/src/pages/marketing/referrals/index.vue';
    const fs = require('fs');
    if (fs.existsSync(componentPath)) {
      console.log(`✅ 组件文件存在: ${componentPath}`);
    } else {
      console.log(`❌ 组件文件不存在: ${componentPath}`);
      console.log('需要确保组件文件路径正确');
    }

    console.log('\\n🎉 推广中心权限配置完成！');
    console.log('用户现在应该能够访问推广中心页面了。');

  } catch (error) {
    console.error('❌ 添加推广中心权限失败:', error);
  } finally {
    await connection.end();
  }
}

addReferralPermission();