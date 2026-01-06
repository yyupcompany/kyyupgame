/**
 * 检查教学中心在权限菜单中的配置
 */
const mysql = require('mysql2/promise');

async function main() {
  const cfg = {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'pwk5ls7j',
    database: process.env.DB_NAME || 'kargerdensales',
    charset: 'utf8mb4'
  };

  let conn;
  try {
    conn = await mysql.createConnection(cfg);
    console.log('✅ DB connected');

    const [perms] = await conn.query(
      "SELECT id, name, chinese_name, code, type, path, sort, status, parent_id FROM permissions WHERE code IN ('TEACHING_CENTER','TEACHING_CENTER_MAIN') ORDER BY type DESC, id ASC"
    );
    console.log('\n📋 permissions for teaching center:');
    console.table(perms);

    const [adminRole] = await conn.query(
      "SELECT id, code, name FROM roles WHERE code IN ('admin','administrator') ORDER BY id ASC LIMIT 1"
    );
    console.log('\n👤 adminRole:');
    console.table(adminRole);

    if (adminRole.length) {
      const adminId = adminRole[0].id;
      const [rp] = await conn.query(
        "SELECT rp.role_id, rp.permission_id FROM role_permissions rp WHERE rp.role_id = ? AND rp.permission_id IN (SELECT id FROM permissions WHERE code IN ('TEACHING_CENTER','TEACHING_CENTER_MAIN'))",
        [adminId]
      );
      console.log('\n🔐 role_permissions (admin -> teaching center):');
      console.table(rp);
    }

    const [centers] = await conn.query(
      "SELECT id, code, name, chinese_name, type FROM permissions WHERE code IN ('PERSONNEL_CENTER','ACTIVITY_CENTER','ENROLLMENT_CENTER','MARKETING_CENTER','AI_CENTER','CUSTOMER_POOL_CENTER','TASK_CENTER_CATEGORY','SYSTEM_CENTER','FINANCE_CENTER','ANALYTICS_CENTER','TEACHING_CENTER') ORDER BY id ASC"
    );
    console.log('\n🏢 center codes presence:');
    console.table(centers);
  } catch (e) {
    console.error('❌ DB check failed:', e.message);
  } finally {
    if (conn) await conn.end();
  }
}

if (require.main === module) {
  main();
}

