const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function addPrincipal3Centers() {
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

    // 首先查找这3个权限的ID
    const [permissions] = await connection.execute(`
      SELECT id, name, chinese_name, code, path
      FROM permissions
      WHERE (
        code = 'business_center_page' OR
        code = 'INSPECTION_CENTER' OR
        path = '/teacher-center/notifications'
      )
      AND type = 'category'
    `);

    console.log('找到的权限:\n');
    permissions.forEach((perm, index) => {
      console.log(`${index + 1}. ${perm.chinese_name || perm.name}`);
      console.log(`   ID: ${perm.id}`);
      console.log(`   代码: ${perm.code}`);
      console.log(`   路径: ${perm.path}\n`);
    });

    if (permissions.length === 0) {
      console.log('⚠️  未找到权限，尝试手动查找...\n');
      
      // 手动查找业务中心
      const [business] = await connection.execute(`
        SELECT id, name, chinese_name, code, path
        FROM permissions
        WHERE path = '/centers/business' AND type = 'category'
      `);
      
      // 手动查找督查中心
      const [inspection] = await connection.execute(`
        SELECT id, name, chinese_name, code, path
        FROM permissions
        WHERE path = '/centers/inspection' AND type = 'category'
      `);
      
      // 手动查找通知中心
      const [notification] = await connection.execute(`
        SELECT id, name, chinese_name, code, path
        FROM permissions
        WHERE path = '/teacher-center/notifications' AND type = 'category'
      `);
      
      permissions.push(...business, ...inspection, ...notification);
      
      console.log('手动查找结果:\n');
      permissions.forEach((perm, index) => {
        console.log(`${index + 1}. ${perm.chinese_name || perm.name}`);
        console.log(`   ID: ${perm.id}`);
        console.log(`   代码: ${perm.code}`);
        console.log(`   路径: ${perm.path}\n`);
      });
    }

    console.log('=' .repeat(70));
    console.log('开始添加权限给园长角色(ID: 2)...\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const perm of permissions) {
      // 检查是否已存在
      const [existing] = await connection.execute(`
        SELECT id FROM role_permissions 
        WHERE role_id = 2 AND permission_id = ?
      `, [perm.id]);

      if (existing.length > 0) {
        console.log(`⏭️  跳过: ${perm.chinese_name || perm.name} (已存在)`);
        skippedCount++;
      } else {
        // 添加权限
        await connection.execute(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (2, ?, NOW(), NOW())
        `, [perm.id]);
        
        console.log(`✅ 添加: ${perm.chinese_name || perm.name}`);
        addedCount++;
      }
    }

    console.log('\n' + '=' .repeat(70));
    console.log('📊 添加结果:\n');
    console.log(`  成功添加: ${addedCount}个`);
    console.log(`  已存在跳过: ${skippedCount}个`);
    console.log(`  总计: ${permissions.length}个\n`);

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

addPrincipal3Centers();
