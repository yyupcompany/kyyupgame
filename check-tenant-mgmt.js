const mysql = require('mysql2/promise');

async function checkTenantManagement() {
  let connection;

  try {
    console.log('🔍 检查admin_tenant_management数据库...');

    // 直接连接租户管理数据库
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'admin_tenant_management'
    });

    console.log('✅ admin_tenant_management连接成功');

    // 查看所有表
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n📊 表数量: ${tables.length}`);

    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log('  -', tableName);
    });

    // 检查global_users表
    console.log('\n👤 检查global_users表:');
    try {
      const [globalUsers] = await connection.execute(
        'SELECT id, phone, real_name FROM global_users WHERE phone = ? LIMIT 1',
        ['18611141133']
      );

      if (globalUsers.length > 0) {
        const user = globalUsers[0];
        console.log('✅ 找到测试用户:');
        console.log('  ID:', user.id);
        console.log('  手机:', user.phone);
        console.log('  姓名:', user.real_name);
      } else {
        console.log('❌ 没有找到测试用户');
      }
    } catch (error) {
      console.log('❌ 查询global_users失败:', error.message);
    }

    // 检查tenants表
    console.log('\n🏢 检查tenants表:');
    try {
      const [tenants] = await connection.execute('SELECT * FROM tenants LIMIT 10');
      console.log(`找到 ${tenants.length} 个租户:`);

      tenants.forEach(tenant => {
        console.log(`  - ${tenant.tenant_id}: ${tenant.name} (${tenant.domain}) - ${tenant.status}`);
      });
    } catch (error) {
      console.log('❌ 查询tenants失败:', error.message);
    }

    // 检查global_user_tenant_relations表
    console.log('\n🔗 检查global_user_tenant_relations表:');
    try {
      const [relations] = await connection.execute(
        'SELECT * FROM global_user_tenant_relations WHERE global_user_id = 1'
      );

      if (relations.length > 0) {
        console.log('✅ 用户1的租户关系:');
        relations.forEach(rel => {
          console.log(`  - ${rel.tenant_code}: ${rel.role_in_tenant}`);
        });
      } else {
        console.log('❌ 用户1没有租户关系');
      }
    } catch (error) {
      console.log('❌ 查询租户关系失败:', error.message);
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function checkK004Database() {
  let connection;

  try {
    console.log('\n🔍 检查tenant_k004数据库...');

    // 连接k004租户数据库
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'tenant_k004'
    });

    console.log('✅ tenant_k004连接成功');

    // 查看所有表
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n📊 表数量: ${tables.length}`);

    // 只显示关键表
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      if (tableName.includes('user') || tableName.includes('ai') || tableName.includes('teacher') || tableName.includes('student')) {
        console.log('  -', tableName);
      }
    });

    // 检查是否有用户表数据
    try {
      const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`\n👥 用户表记录数: ${userCount[0].count}`);

      const [teacherCount] = await connection.execute('SELECT COUNT(*) as count FROM teachers');
      console.log(`👨‍🏫 教师表记录数: ${teacherCount[0].count}`);

      const [studentCount] = await connection.execute('SELECT COUNT(*) as count FROM students');
      console.log(`👶 学生表记录数: ${studentCount[0].count}`);

    } catch (error) {
      console.log('❌ 查询业务数据失败:', error.message);
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function main() {
  await checkTenantManagement();
  await checkK004Database();
}

main();