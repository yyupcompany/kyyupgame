const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function add3CentersFinal() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('\n' + '='.repeat(70));
    console.log('🔧 添加园长角色的3个中心权限');
    console.log('='.repeat(70) + '\n');

    // 需要添加的权限ID
    const permissionsToAdd = [
      { id: 5235, name: '业务中心', path: '/centers/business' },
      { id: 5001, name: '督查中心', path: '/centers/inspection' },
      { id: 5221, name: '通知中心', path: '/teacher-center/notifications' }
    ];

    console.log('准备添加以下权限给园长角色(ID: 2):\n');
    permissionsToAdd.forEach((perm, index) => {
      console.log(`${index + 1}. ${perm.name} (ID: ${perm.id})`);
      console.log(`   路径: ${perm.path}\n`);
    });

    console.log('=' .repeat(70));
    console.log('开始添加权限...\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const perm of permissionsToAdd) {
      // 检查是否已存在
      const [existing] = await connection.execute(`
        SELECT id FROM role_permissions 
        WHERE role_id = 2 AND permission_id = ?
      `, [perm.id]);

      if (existing.length > 0) {
        console.log(`⏭️  跳过: ${perm.name} (已存在)`);
        skippedCount++;
      } else {
        // 添加权限
        await connection.execute(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (2, ?, NOW(), NOW())
        `, [perm.id]);
        
        console.log(`✅ 添加: ${perm.name}`);
        addedCount++;
      }
    }

    console.log('\n' + '=' .repeat(70));
    console.log('📊 添加结果:\n');
    console.log(`  成功添加: ${addedCount}个`);
    console.log(`  已存在跳过: ${skippedCount}个`);
    console.log(`  总计: ${permissionsToAdd.length}个\n`);

    // 验证最终结果
    const [finalCount] = await connection.execute(`
      SELECT COUNT(*) AS count
      FROM role_permissions
      WHERE role_id = 2
    `);

    console.log(`✅ 园长角色当前总权限数: ${finalCount[0].count}个\n`);

    // 统计 /centers/* 权限
    const [centersCount] = await connection.execute(`
      SELECT COUNT(*) AS count
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 2
      AND p.path LIKE '/centers/%'
      AND p.type = 'category'
    `);

    console.log(`✅ 园长角色 /centers/* 中心数: ${centersCount[0].count}个\n`);
    console.log('=' .repeat(70));

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

add3CentersFinal();
