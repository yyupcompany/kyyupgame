const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkPermissions() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: process.env.DB_PORT || 43906,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'kargerdensales'
  });

  try {
    console.log('🔍 查看现有菜单权限配置...\n');

    const [menuRows] = await connection.execute(`
      SELECT id, name, chinese_name, code, type, parent_id, path, icon, sort, status
      FROM permissions
      WHERE type='menu'
      ORDER BY sort, id
    `);

    console.log('📋 现有菜单权限:');
    console.table(menuRows);

    console.log('\n🔍 查看权限最高的父级菜单...\n');

    const [parentRows] = await connection.execute(`
      SELECT id, name, chinese_name, code, path, icon, sort, status
      FROM permissions
      WHERE type='menu' AND (parent_id IS NULL OR parent_id = 0)
      ORDER BY sort, id
    `);

    console.log('📋 父级菜单:');
    console.table(parentRows);

    console.log('\n🔍 查看中心相关菜单...\n');

    const [centerRows] = await connection.execute(`
      SELECT id, name, chinese_name, code, path, parent_id, icon, sort, status
      FROM permissions
      WHERE type='menu' AND (name LIKE '%center%' OR chinese_name LIKE '%中心%')
      ORDER BY sort, id
    `);

    console.log('📋 中心相关菜单:');
    console.table(centerRows);

    console.log('\n🔍 查看最大ID和排序值...\n');

    const [maxRows] = await connection.execute(`
      SELECT
        MAX(id) as max_id,
        MAX(sort) as max_sort
      FROM permissions
    `);

    console.log('📊 最大ID和排序值:');
    console.table(maxRows);

  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await connection.end();
  }
}

checkPermissions();