/**
 * 简单脚本：为教师角色添加AI权限
 */

const mysql = require('mysql2/promise');

async function addTeacherAIPermission() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    console.log('🚀 开始为教师角色添加AI权限...\n');

    // 1. 查找或创建 '/ai' 权限
    console.log('1️⃣ 检查 /ai 权限...');
    const [permissions] = await connection.execute(
      'SELECT id, name, code FROM permissions WHERE code = ?',
      ['/ai']
    );

    let aiPermissionId;
    if (permissions.length > 0) {
      aiPermissionId = permissions[0].id;
      console.log(`✅ /ai 权限已存在，ID: ${aiPermissionId}`);
    } else {
      console.log('⚠️  /ai 权限不存在，正在创建...');
      const [result] = await connection.execute(
        `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
         VALUES (?, ?, ?, NULL, ?, NULL, NULL, ?, ?, ?, NOW(), NOW())`,
        ['AI中心访问', '/ai', 'menu', '/api/ai', 'ChatDotRound', 40, 1]
      );
      aiPermissionId = result.insertId;
      console.log(`✅ /ai 权限创建成功，ID: ${aiPermissionId}`);
    }

    // 2. 查找教师角色
    console.log('\n2️⃣ 查找教师角色...');
    const [roles] = await connection.execute(
      'SELECT id, name, code FROM roles WHERE code = ?',
      ['teacher']
    );

    if (roles.length === 0) {
      throw new Error('❌ 未找到教师角色');
    }

    const teacherRoleId = roles[0].id;
    console.log(`✅ 教师角色找到，ID: ${teacherRoleId}, 名称: ${roles[0].name}`);

    // 3. 检查并添加权限
    console.log('\n3️⃣ 检查权限分配...');
    const [existing] = await connection.execute(
      'SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?',
      [teacherRoleId, aiPermissionId]
    );

    if (existing.length > 0) {
      console.log('ℹ️  教师角色已有 /ai 权限');
    } else {
      console.log('⚠️  正在添加权限...');
      await connection.execute(
        'INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [teacherRoleId, aiPermissionId]
      );
      console.log('✅ /ai 权限已成功分配给教师角色');
    }

    // 4. 验证
    console.log('\n4️⃣ 验证权限...');
    const [verification] = await connection.execute(
      `SELECT r.name AS role_name, p.name AS permission_name, p.code AS permission_code, p.path AS permission_path
       FROM role_permissions rp
       INNER JOIN roles r ON rp.role_id = r.id
       INNER JOIN permissions p ON rp.permission_id = p.id
       WHERE r.code = 'teacher' AND p.code = '/ai'`
    );

    if (verification.length > 0) {
      console.log('✅ 验证成功！');
      console.log('   角色:', verification[0].role_name);
      console.log('   权限:', verification[0].permission_name);
      console.log('   代码:', verification[0].permission_code);
      console.log('   路径:', verification[0].permission_path);
    } else {
      console.log('❌ 验证失败');
    }

    // 5. 显示所有AI相关权限
    console.log('\n5️⃣ 教师角色的AI相关权限:');
    const [aiPerms] = await connection.execute(
      `SELECT p.code, p.name, p.path
       FROM role_permissions rp
       INNER JOIN roles r ON rp.role_id = r.id
       INNER JOIN permissions p ON rp.permission_id = p.id
       WHERE r.code = 'teacher' AND (p.code LIKE '%ai%' OR p.code LIKE '%AI%' OR p.path LIKE '%/ai%')
       ORDER BY p.code`
    );

    if (aiPerms.length > 0) {
      console.log(`找到 ${aiPerms.length} 个AI相关权限:`);
      aiPerms.forEach((perm, index) => {
        console.log(`   ${index + 1}. ${perm.code} - ${perm.name}`);
      });
    }

    console.log('\n✅ 权限添加完成！');
    console.log('📝 现在可以移除临时代码并重启服务器了。');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

addTeacherAIPermission()
  .then(() => {
    console.log('\n🎉 脚本执行成功');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 脚本执行失败:', error);
    process.exit(1);
  });

