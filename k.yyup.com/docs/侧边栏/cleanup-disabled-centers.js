/**
 * 清理已禁用中心的角色权限关联
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanupDisabledCenters() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ 数据库连接成功\n');

    // 查询所有已禁用的中心
    const [disabledCenters] = await connection.execute(`
      SELECT id, name, chinese_name, code 
      FROM permissions 
      WHERE type='category' AND parent_id IS NULL AND status=0
    `);

    if (disabledCenters.length === 0) {
      console.log('✅ 没有找到已禁用的中心');
      return;
    }

    console.log(`📋 找到 ${disabledCenters.length} 个已禁用的中心：\n`);
    disabledCenters.forEach((center, index) => {
      console.log(`${index + 1}. ${center.chinese_name || center.name} (ID: ${center.id}, Code: ${center.code})`);
    });

    const centerIds = disabledCenters.map(c => c.id);

    // 查询这些中心的角色权限关联数量
    const [rolePermCount] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM role_permissions 
      WHERE permission_id IN (${centerIds.join(',')})
    `);

    const count = rolePermCount[0].count;

    if (count === 0) {
      console.log('\n✅ 这些中心没有角色权限关联，无需清理');
      return;
    }

    console.log(`\n⚠️  这些中心共有 ${count} 个角色权限关联需要删除\n`);

    // 删除角色权限关联
    console.log('🗑️  开始删除角色权限关联...\n');
    
    const [deleteResult] = await connection.execute(`
      DELETE FROM role_permissions 
      WHERE permission_id IN (${centerIds.join(',')})
    `);

    console.log(`✅ 已删除 ${deleteResult.affectedRows} 条角色权限关联记录\n`);

    // 验证删除结果
    const [verifyCount] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM role_permissions 
      WHERE permission_id IN (${centerIds.join(',')})
    `);

    if (verifyCount[0].count === 0) {
      console.log('✅ 验证成功：所有角色权限关联已清除\n');
    } else {
      console.log(`⚠️  仍有 ${verifyCount[0].count} 条关联记录未删除\n`);
    }

    // 显示清理后的状态
    console.log('📊 清理后的状态：\n');
    console.log('已禁用的中心：');
    disabledCenters.forEach((center, index) => {
      console.log(`  ${index + 1}. ${center.chinese_name || center.name} - 状态: 已禁用, 权限关联: 已清除`);
    });

    console.log('\n💡 后续步骤：');
    console.log('  1. 重启后端服务器');
    console.log('  2. 清除浏览器缓存');
    console.log('  3. 刷新页面验证');
    console.log('  4. 如果问题仍然存在，运行: node clear-permission-cache.js');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

// 执行清理
cleanupDisabledCenters().catch(console.error);

