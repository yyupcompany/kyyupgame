const mysql = require('mysql2/promise');
require('dotenv').config();

async function assignAttendanceCenterRoles() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: process.env.DB_PORT || 43906,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'kargerdensales'
  });

  try {
    console.log('🔍 查看考勤中心相关权限...\n');

    // 获取考勤中心相关权限ID
    const [attendancePermissions] = await connection.execute(`
      SELECT id, name, code FROM permissions
      WHERE code = 'ATTENDANCE_CENTER' OR parent_id IN (
        SELECT id FROM permissions WHERE code = 'ATTENDANCE_CENTER'
      )
      ORDER BY id
    `);

    console.log('📋 考勤中心权限列表:');
    console.table(attendancePermissions);

    console.log('\n🔍 查看系统角色...\n');

    // 查看所有角色
    const [roles] = await connection.execute(`
      SELECT id, name, code FROM roles WHERE status = 1 ORDER BY id
    `);

    console.log('📋 系统角色:');
    console.table(roles);

    // 需要分配权限的角色代码
    const targetRoles = ['admin', 'principal', 'teacher'];

    for (const roleCode of targetRoles) {
      const [roleRows] = await connection.execute(
        'SELECT id, name FROM roles WHERE code = ? AND status = 1',
        [roleCode]
      );

      if (roleRows.length === 0) {
        console.log(`⚠️  角色 ${roleCode} 不存在或已禁用`);
        continue;
      }

      const role = roleRows[0];
      console.log(`\n📝 为角色 ${role.name}(${roleCode}) 分配考勤中心权限...`);

      for (const permission of attendancePermissions) {
        // 检查是否已存在权限分配
        const [existing] = await connection.execute(`
          SELECT id FROM role_permissions
          WHERE role_id = ? AND permission_id = ?
        `, [role.id, permission.id]);

        if (existing.length === 0) {
          // 分配权限
          await connection.execute(`
            INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
            VALUES (?, ?, NOW(), NOW())
          `, [role.id, permission.id]);

          console.log(`  ✅ 分配权限: ${permission.name} (${permission.code})`);
        } else {
          console.log(`  ⚠️  权限已存在: ${permission.name} (${permission.code})`);
        }
      }
    }

    // 验证分配结果
    console.log('\n🔍 验证权限分配结果...');

    const [verifyResult] = await connection.execute(`
      SELECT
        r.name as role_name,
        r.code as role_code,
        p.name as permission_name,
        p.code as permission_code,
        p.chinese_name as permission_chinese_name
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE p.code = 'ATTENDANCE_CENTER' OR p.parent_id IN (
        SELECT id FROM permissions WHERE code = 'ATTENDANCE_CENTER'
      )
      ORDER BY r.code, p.id
    `);

    console.log('📋 考勤中心权限分配结果:');
    console.table(verifyResult);

    console.log('\n🎉 考勤中心权限分配完成！');

  } catch (error) {
    console.error('❌ 操作失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 运行脚本
assignAttendanceCenterRoles().catch(console.error);