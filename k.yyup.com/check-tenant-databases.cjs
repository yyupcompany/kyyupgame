const mysql = require('mysql2/promise');

async function checkTenantDatabases() {
  try {
    console.log('🔍 连接到MySQL服务器检查租户数据库...');

    // 连接到MySQL服务器（不指定数据库）
    const connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: '123456'
    });

    console.log('✅ MySQL服务器连接成功');

    // 查看所有数据库
    const [databases] = await connection.execute('SHOW DATABASES LIKE \'tenant%\';');
    console.log('\n📋 租户数据库列表:');
    if (databases.length === 0) {
      console.log('❌ 没有找到任何tenant开头的数据库');
    } else {
      databases.forEach(db => {
        console.log(`  - ${db.Database}`);
      });
    }

    // 检查是否有tenant_001数据库
    const [tenant001Check] = await connection.execute('SHOW DATABASES LIKE \'tenant_001\';');
    if (tenant001Check.length > 0) {
      console.log('\n✅ 找到tenant_001数据库');

      // 连接到tenant_001数据库并检查表
      await connection.changeUser({ database: 'tenant_001' });
      const [tables] = await connection.execute('SHOW TABLES;');
      console.log('\n📊 tenant_001数据库中的表:');
      if (tables.length === 0) {
        console.log('  - 数据库为空，没有表');
      } else {
        tables.forEach(table => {
          const tableName = table[`Tables_in_tenant_001`];
          console.log(`  - ${tableName}`);
        });
      }

      // 检查用户表是否有数据
      try {
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM Users;');
        console.log(`\n👥 Users表记录数: ${userCount[0].count}`);

        if (userCount[0].count > 0) {
          const [users] = await connection.execute('SELECT id, username, realName, role, status, createdAt FROM Users LIMIT 5;');
          console.log('\n📝 用户列表前5条:');
          users.forEach(user => {
            console.log(`  - ID: ${user.id}, 用户名: ${user.username}, 姓名: ${user.realName}, 角色: ${user.role}, 状态: ${user.status}`);
          });
        }
      } catch (err) {
        console.log('  - Users表不存在或查询失败:', err.message);
      }

    } else {
      console.log('\n❌ 没有找到tenant_001数据库');
    }

    // 检查主数据库kargerdensales中的租户相关表
    await connection.changeUser({ database: 'kargerdensales' });
    try {
      const [tenants] = await connection.execute('SELECT * FROM tenants LIMIT 10;');
      console.log('\n🏢 kargerdensales数据库中的租户列表:');
      if (tenants.length === 0) {
        console.log('  - 租户表为空');
      } else {
        tenants.forEach(tenant => {
          console.log(`  - 代码: ${tenant.code}, 名称: ${tenant.name}, 状态: ${tenant.status}, 数据库: ${tenant.databaseName}`);
        });
      }
    } catch (err) {
      console.log('  - 租户表查询失败:', err.message);
    }

    await connection.end();
    console.log('\n🔌 数据库连接已关闭');

  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message);
  }
}

checkTenantDatabases();