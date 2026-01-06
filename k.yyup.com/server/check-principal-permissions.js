const mysql = require('mysql2/promise');

async function checkPrincipalPermissions() {
  let connection;

  try {
    console.log('🔌 正在连接数据库...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: parseInt(process.env.DB_PORT || '43906'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Yyup@2024',
      database: process.env.DB_NAME || 'kindergarten_management'
    });

    console.\n');

    // 查询园长角色
....\n');
    const [roles] = await connection.query(`
      SELECT id, name, chinese_name, code, status
      FROM roles
      WHERE code = 'principal' OR chinese_name LIKE '%园长%'
      LIMIT 5
    `);

    if (roles && roles.length > 0) {
      console.log(`✅ 找到 ${roles.length} 个园长相关角色:\n`);
      roles.forEach((role, index) => {
        console.log(`${index + 1}. ${role.chinese_name || role.name} (${role.code})`);
        console.log(`   ID: ${role.id}`);
        console.log(`   Status: ${role.status === 1 ? '启用' : '禁用'}`);
        console.log('');
      });

      // 查询园长角色的权限
      const principalRoleId = roles[0].id;
      console.log(`🔍 查询园长角色 (ID: ${principalRoleId}) 的权限...\n`);
      
      const [permissions] = await connection.query(`
        SELECT p.id, p.name, p.chinese_name, p.code, p.type, p.path, p.status
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
        ORDER BY p.type, p.sort
      `, [principalRoleId]);

      if (permissions && permissions.length > 0) {
        console.log(`✅ 园长角色 ${permissions.length} 个权限:\n`);
        
        // 检查是否有呼叫中心权限
        const hasCallCenter = permissions.some(p => p.code === 'CALL_CENTER' || p.path === '/centers/call-center');
        console.log(`呼叫中心权限: ${hasCallCenter ? '✅ 有' : '❌ 没有'}\n`);
        
        // 显示所有权限
        permissions.forEach((perm, index) => {
          if (index < 20) {  // 只显示前20个
            console.log(`${index + 1}. ${perm.chinese_name || perm.name}`);
            console.log(`   Code: ${perm.code}`);
            console.log(`   Type: ${perm.type}`);
            console.log(`   Path: ${perm.path || 'N/A'}`);
            console.log('');
          }
        });
        
        if (permissions.length > 20) {
          console.log(`... 还有 ${permissions.length - 20} 个权限\n`);
        }
      } else {
        console.log('❌ 园长角色没有分配任何权限\n');
      }
    } else {
      console.log('❌ 没有找到园长角色\n');
    }

    console.log('🎉 检查完成！\n');

  } catch (error) {
    console.error('\n❌ 检查失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

checkPrincipalPermissions();
