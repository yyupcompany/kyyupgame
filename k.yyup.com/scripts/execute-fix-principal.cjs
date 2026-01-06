const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function fixPrincipalPermissions() {
  console.log('\n' + '='.repeat(70));
  console.log('🔧 修复园长角色权限 - 移除系统中心');
  console.log('='.repeat(70) + '\n');

  let connection;

  try {
    // 连接数据库
    console.log('📍 步骤1: 连接数据库');
    console.log(`   主机: ${process.env.DB_HOST}`);
    console.log(`   端口: ${process.env.DB_PORT}`);
    console.log(`   数据库: ${process.env.DB_NAME}\n`);

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ 数据库连接成功\n');

    // 步骤2: 查看当前园长的系统中心权限
    console.log('📍 步骤2: 查看当前园长的系统中心权限');
    
    const [beforeRows] = await connection.execute(`
      SELECT 
        rp.id AS role_permission_id,
        r.id AS role_id,
        r.name AS role_name,
        p.id AS permission_id,
        p.name AS permission_name,
        p.code AS permission_code,
        p.path AS permission_path
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE r.name = 'principal'
      AND (
        p.name LIKE '%System Center%' 
        OR p.name LIKE '%系统中心%'
        OR p.code LIKE '%SYSTEM_CENTER%'
        OR p.code LIKE '%system_center%'
        OR p.path LIKE '%/centers/system%'
      )
    `);

    if (beforeRows.length === 0) {
      console.log('✅ 园长角色已经没有系统中心权限了！\n');
      await connection.end();
      return;
    }

    console.log(`找到 ${beforeRows.length} 个系统中心权限:\n`);
    beforeRows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.permission_name}`);
      console.log(`   权限ID: ${row.permission_id}`);
      console.log(`   权限代码: ${row.permission_code}`);
      console.log(`   路径: ${row.permission_path}`);
      console.log(`   关联ID: ${row.role_permission_id}\n`);
    });

    // 步骤3: 删除权限
    console.log('📍 步骤3: 删除园长的系统中心权限');
    
    const [deleteResult] = await connection.execute(`
      DELETE FROM role_permissions 
      WHERE permission_id = 2013 
      AND role_id = (SELECT id FROM roles WHERE name = 'principal')
    `);

    console.log(`✅ 删除成功！影响行数: ${deleteResult.affectedRows}\n`);

    // 步骤4: 验证删除结果
    console.log('📍 步骤4: 验证删除结果');
    
    const [afterRows] = await connection.execute(`
      SELECT COUNT(*) AS system_center_count
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE r.name = 'principal'
      AND p.id = 2013
    `);

    const count = afterRows[0].system_center_count;
    
    if (count === 0) {
      console.log('✅ 验证成功！园长角色已无系统中心权限\n');
    } else {
      console.log(`⚠️  验证失败！仍有 ${count} 个系统中心权限\n`);
    }

    // 步骤5: 查看园长剩余权限数量
    console.log('📍 步骤5: 查看园长剩余权限数量');
    
    const [countRows] = await connection.execute(`
      SELECT 
        r.name AS role_name,
        COUNT(rp.id) AS permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      WHERE r.name = 'principal'
      GROUP BY r.id, r.name
    `);

    if (countRows.length > 0) {
      console.log(`✅ 园长角色权限数量: ${countRows[0].permission_count}个\n`);
    }

    // 步骤6: 确认管理员仍有系统中心权限
    console.log('📍 步骤6: 确认管理员仍有系统中心权限');
    
    const [adminRows] = await connection.execute(`
      SELECT 
        r.name AS role_name,
        p.name AS permission_name,
        p.code AS permission_code
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE r.name = 'admin'
      AND p.id = 2013
    `);

    if (adminRows.length > 0) {
      console.log('✅ 管理员仍有系统中心权限\n');
    } else {
      console.log('⚠️  警告：管理员也没有系统中心权限了！\n');
    }

    console.log('=' .repeat(70));
    console.log('✅ 修复完成！\n');
    console.log('📝 修复总结:');
    console.log(`   - 删除了 ${deleteResult.affectedRows} 个权限关联`);
    console.log(`   - 园长剩余权限: ${countRows[0]?.permission_count || 0}个`);
    console.log(`   - 管理员系统中心权限: ${adminRows.length > 0 ? '保留' : '丢失'}\n`);
    console.log('🔍 请运行以下命令验证:');
    console.log('   node scripts/compare-principal-admin.cjs\n');
    console.log('=' .repeat(70));

  } catch (error) {
    console.error('\n❌ 操作失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭\n');
    }
  }
}

// 执行修复
fixPrincipalPermissions();

