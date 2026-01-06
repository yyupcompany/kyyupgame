/**
 * 检查呼叫中心权限配置
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkCallCenterPermissions() {
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

    console.log('✅ 数据库连接成功\n');

    // 查询呼叫中心相关权限
    console.log('🔍 查询呼叫中心相关权限...\n');
    const [permissions] = await connection.query(`
      SELECT id, name, chinese_name, code, type, parent_id, path, component, icon, sort, status
      FROM permissions
      WHERE name LIKE '%call%' OR chinese_name LIKE '%呼叫%'
      ORDER BY id
    `);

    if (permissions && permissions.length > 0) {
      console.log(`✅ 找到 ${permissions.length} 个呼叫中心相关权限:\n`);
      permissions.forEach((perm, index) => {
        console.log(`${index + 1}. ${perm.chinese_name || perm.name}`);
        console.log(`   ID: ${perm.id}`);
        console.log(`   Code: ${perm.code}`);
        console.log(`   Type: ${perm.type}`);
        console.log(`   Path: ${perm.path || 'N/A'}`);
        console.log(`   Component: ${perm.component || 'N/A'}`);
        console.log(`   Parent ID: ${perm.parent_id || 'N/A'}`);
        console.log(`   Status: ${perm.status === 1 ? '启用' : '禁用'}`);
        console.log('');
      });
    } else {
      console.log('❌ 没有找到呼叫中心相关权限\n');
      console.log('💡 需要添加呼叫中心权限到数据库\n');
    }

    // 查询所有一级菜单（category类型）
    console.log('📋 查询所有一级菜单（中心）...\n');
    const [categories] = await connection.query(`
      SELECT id, name, chinese_name, code, type, path, icon, sort, status
      FROM permissions
      WHERE type = 'category' AND parent_id IS NULL
      ORDER BY sort, id
    `);

    if (categories && categories.length > 0) {
      console.log(`✅ 找到 ${categories.length} 个一级菜单:\n`);
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.chinese_name || cat.name} (${cat.code})`);
      });
      console.log('');
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

checkCallCenterPermissions();

