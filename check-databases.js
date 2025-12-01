const mysql = require('mysql2/promise');

async function checkAllDatabases() {
  let connection;

  try {
    console.log('🔍 连接MySQL服务器查看所有数据库...');

    // 不指定数据库，连接服务器
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j'
    });

    console.log('✅ MySQL服务器连接成功');

    // 查看所有数据库
    console.log('\n🗄️ 所有数据库:');
    const [databases] = await connection.execute('SHOW DATABASES');

    const relevantDbs = [];
    databases.forEach(db => {
      const dbName = db.Database;
      if (dbName !== 'information_schema' &&
          dbName !== 'mysql' &&
          dbName !== 'performance_schema' &&
          dbName !== 'sys') {
        relevantDbs.push(dbName);
        console.log('  -', dbName);
      }
    });

    // 检查每个相关数据库的表结构
    for (const dbName of relevantDbs) {
      console.log(`\n📊 检查数据库 ${dbName}:`);

      try {
        await connection.execute(`USE \`${dbName}\``);
        const [tables] = await connection.execute('SHOW TABLES');

        const hasTenants = tables.some(table =>
          Object.values(table)[0].toLowerCase().includes('tenant')
        );

        const hasGlobalUsers = tables.some(table =>
          Object.values(table)[0].toLowerCase().includes('global_user')
        );

        console.log(`  表数量: ${tables.length}`);
        if (hasTenants) console.log('  ✅ 包含租户相关表');
        if (hasGlobalUsers) console.log('  ✅ 包含全局用户相关表');

        // 如果可能包含租户管理表，详细检查
        if (hasTenants || hasGlobalUsers || dbName.includes('tenant') || dbName.includes('admin') || dbName.includes('unified')) {
          console.log('  🔍 详细表列表:');
          tables.forEach(table => {
            const tableName = Object.values(table)[0];
            if (tableName.includes('tenant') || tableName.includes('global') || tableName.includes('user')) {
              console.log(`    - ${tableName}`);
            }
          });

          // 检查global_users表是否存在
          const [globalUsersExists] = await connection.execute(
            `SHOW TABLES LIKE 'global_users'`
          );

          if (globalUsersExists.length > 0) {
            console.log('  ✅ 找到global_users表');

            // 检查global_users表数据
            try {
              const [globalUsers] = await connection.execute(
                'SELECT id, phone, real_name FROM global_users WHERE phone = ? LIMIT 1',
                ['18611141133']
              );

              if (globalUsers.length > 0) {
                const user = globalUsers[0];
                console.log('  ✅ 找到测试用户:');
                console.log('    ID:', user.id);
                console.log('    手机:', user.phone);
                console.log('    姓名:', user.real_name);
              }
            } catch (userError) {
              console.log('  ❌ 查询global_users失败:', userError.message);
            }
          }
        }

      } catch (dbError) {
        console.log(`  ❌ 无法访问数据库: ${dbError.message}`);
      }
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAllDatabases();