const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkPrincipalSystemCenter() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 检查园长角色的系统中心权限');
  console.log('='.repeat(70) + '\n');

  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ 数据库连接成功\n');

    // 1. 查找所有系统中心相关的权限
    console.log('📍 步骤1: 查找所有系统中心相关的权限\n');
    
    const [allSystemPerms] = await connection.execute(`
      SELECT 
        id,
        name,
        code,
        path,
        type
      FROM permissions
      WHERE name LIKE '%System Center%' 
        OR name LIKE '%系统中心%'
        OR code LIKE '%SYSTEM_CENTER%'
        OR code LIKE '%system_center%'
        OR path LIKE '%/centers/system%'
      ORDER BY id
    `);

    console.log(`找到 ${allSystemPerms.length} 个系统中心相关权限:\n`);
    allSystemPerms.forEach((perm, index) => {
      console.log(`${index + 1}. ID: ${perm.id}`);
      console.log(`   名称: ${perm.name}`);
      console.log(`   代码: ${perm.code}`);
      console.log(`   路径: ${perm.path || '-'}`);
      console.log(`   类型: ${perm.type}\n`);
    });

    // 2. 查找园长角色ID
    console.log('📍 步骤2: 查找园长角色ID\n');
    
    const [principalRole] = await connection.execute(`
      SELECT id, name FROM roles WHERE name = 'principal'
    `);

    if (principalRole.length === 0) {
      console.log('❌ 未找到园长角色\n');
      await connection.end();
      return;
    }

    const principalRoleId = principalRole[0].id;
    console.log(`✅ 园长角色ID: ${principalRoleId}\n`);

    // 3. 查找园长的所有系统中心权限
    console.log('📍 步骤3: 查找园长的所有系统中心权限\n');
    
    const [principalSystemPerms] = await connection.execute(`
      SELECT 
        rp.id AS role_permission_id,
        p.id AS permission_id,
        p.name AS permission_name,
        p.code AS permission_code,
        p.path AS permission_path,
        p.type AS permission_type
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ?
      AND (
        p.name LIKE '%System Center%' 
        OR p.name LIKE '%系统中心%'
        OR p.code LIKE '%SYSTEM_CENTER%'
        OR p.code LIKE '%system_center%'
        OR p.path LIKE '%/centers/system%'
      )
    `, [principalRoleId]);

    if (principalSystemPerms.length === 0) {
      console.log('✅ 园长角色没有系统中心权限（数据库层面）\n');
    } else {
      console.log(`⚠️  园长角色有 ${principalSystemPerms.length} 个系统中心权限:\n`);
      principalSystemPerms.forEach((perm, index) => {
        console.log(`${index + 1}. 权限ID: ${perm.permission_id}`);
        console.log(`   名称: ${perm.permission_name}`);
        console.log(`   代码: ${perm.permission_code}`);
        console.log(`   路径: ${perm.permission_path || '-'}`);
        console.log(`   类型: ${perm.permission_type}`);
        console.log(`   关联ID: ${perm.role_permission_id}\n`);
      });
    }

    // 4. 查找管理员角色ID
    console.log('📍 步骤4: 查找管理员的系统中心权限\n');
    
    const [adminRole] = await connection.execute(`
      SELECT id, name FROM roles WHERE name = 'admin'
    `);

    if (adminRole.length > 0) {
      const adminRoleId = adminRole[0].id;
      
      const [adminSystemPerms] = await connection.execute(`
        SELECT 
          rp.id AS role_permission_id,
          p.id AS permission_id,
          p.name AS permission_name,
          p.code AS permission_code
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
        AND (
          p.name LIKE '%System Center%' 
          OR p.name LIKE '%系统中心%'
          OR p.code LIKE '%SYSTEM_CENTER%'
          OR p.code LIKE '%system_center%'
        )
      `, [adminRoleId]);

      if (adminSystemPerms.length > 0) {
        console.log(`✅ 管理员有 ${adminSystemPerms.length} 个系统中心权限\n`);
      } else {
        console.log('⚠️  管理员也没有系统中心权限\n');
      }
    }

    // 5. 查找用户principal的直接权限
    console.log('📍 步骤5: 查找用户principal的直接权限（通过user_permissions表）\n');
    
    const [userPerms] = await connection.execute(`
      SELECT 
        up.id AS user_permission_id,
        p.id AS permission_id,
        p.name AS permission_name,
        p.code AS permission_code
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      JOIN users u ON up.user_id = u.id
      WHERE u.username = 'principal'
      AND (
        p.name LIKE '%System Center%' 
        OR p.name LIKE '%系统中心%'
        OR p.code LIKE '%SYSTEM_CENTER%'
        OR p.code LIKE '%system_center%'
      )
    `);

    if (userPerms.length > 0) {
      console.log(`⚠️  用户principal有 ${userPerms.length} 个直接分配的系统中心权限:\n`);
      userPerms.forEach((perm, index) => {
        console.log(`${index + 1}. 权限ID: ${perm.permission_id}`);
        console.log(`   名称: ${perm.permission_name}`);
        console.log(`   代码: ${perm.permission_code}\n`);
      });
    } else {
      console.log('✅ 用户principal没有直接分配的系统中心权限\n');
    }

    console.log('=' .repeat(70));
    console.log('📝 检查总结:\n');
    console.log(`   - 系统中心权限总数: ${allSystemPerms.length}个`);
    console.log(`   - 园长角色系统中心权限: ${principalSystemPerms.length}个`);
    console.log(`   - 用户直接系统中心权限: ${userPerms.length}个\n`);
    console.log('=' .repeat(70));

  } catch (error) {
    console.error('\n❌ 操作失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkPrincipalSystemCenter();

