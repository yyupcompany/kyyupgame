/**
 * 检查已禁用中心的状态和关联
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDisabledCenters() {
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

    // 查询已禁用的中心
    console.log('📋 查询已禁用的中心（status=0）：\n');
    const [disabledCenters] = await connection.execute(`
      SELECT id, name, chinese_name, code, type, status 
      FROM permissions 
      WHERE type='category' AND parent_id IS NULL AND status=0
      ORDER BY id
    `);

    if (disabledCenters.length > 0) {
      console.log(`找到 ${disabledCenters.length} 个已禁用的中心：\n`);
      console.table(disabledCenters);
    } else {
      console.log('✅ 没有找到已禁用的中心\n');
      return;
    }

    // 检查这些中心是否还有角色权限关联
    console.log('\n🔍 检查角色权限关联：\n');
    
    for (const center of disabledCenters) {
      const [rolePerms] = await connection.execute(`
        SELECT rp.id, r.name as role_name, r.code as role_code
        FROM role_permissions rp
        JOIN roles r ON rp.role_id = r.id
        WHERE rp.permission_id = ?
      `, [center.id]);

      if (rolePerms.length > 0) {
        console.log(`⚠️  中心 "${center.chinese_name || center.name}" (ID: ${center.id}) 仍有 ${rolePerms.length} 个角色权限关联：`);
        console.table(rolePerms);
        console.log('');
      } else {
        console.log(`✅ 中心 "${center.chinese_name || center.name}" (ID: ${center.id}) 没有角色权限关联\n`);
      }
    }

    // 检查是否有用户仍然能看到这些中心
    console.log('\n🔍 检查用户权限：\n');
    
    const centerIds = disabledCenters.map(c => c.id).join(',');
    
    const [userPerms] = await connection.execute(`
      SELECT DISTINCT u.id, u.username, u.role, p.name as permission_name, p.chinese_name
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE p.id IN (${centerIds})
      ORDER BY u.username
    `);

    if (userPerms.length > 0) {
      console.log(`⚠️  发现 ${userPerms.length} 个用户仍有这些中心的权限：\n`);
      console.table(userPerms);
      
      console.log('\n💡 建议：删除这些角色权限关联');
    } else {
      console.log('✅ 没有用户拥有这些已禁用中心的权限\n');
    }

    // 提供修复建议
    if (disabledCenters.length > 0) {
      console.log('\n📝 修复建议：\n');
      console.log('1. 删除角色权限关联：');
      console.log(`   DELETE FROM role_permissions WHERE permission_id IN (${centerIds});`);
      console.log('');
      console.log('2. 或者永久删除这些中心（如果确定不再需要）：');
      console.log(`   DELETE FROM permissions WHERE id IN (${centerIds});`);
      console.log('');
      console.log('3. 清除浏览器缓存并刷新页面');
    }

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

// 执行检查
checkDisabledCenters().catch(console.error);

