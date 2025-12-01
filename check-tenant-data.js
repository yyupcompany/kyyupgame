const mysql = require('mysql2/promise');

async function findTenantsWithData() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j'
  });

  try {
    console.log('🔍 查找有数据的租户数据库...');

    // 从数据库列表中找租户数据库
    const [databases] = await connection.execute('SHOW DATABASES');
    const tenantDbs = databases
      .filter(db => db.Database.includes('tenant_'))
      .map(db => db.Database);

    console.log(`\n📊 找到 ${tenantDbs.length} 个租户数据库`);

    for (const dbName of tenantDbs.slice(0, 5)) { // 只检查前5个
      try {
        console.log(`\n🔍 检查 ${dbName}:`);

        const [tables] = await connection.execute(`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = '${dbName}'`);
        const tableCount = tables[0].count;

        if (tableCount > 0) {
          console.log(`  ✅ 有 ${tableCount} 个表`);

          // 检查关键表
          const [hasUsers] = await connection.execute(
            `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = '${dbName}' AND table_name = 'users'`
          );

          const [hasTeachers] = await connection.execute(
            `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = '${dbName}' AND table_name = 'teachers'`
          );

          const [hasStudents] = await connection.execute(
            `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = '${dbName}' AND table_name = 'students'`
          );

          if (hasUsers[0].count > 0 || hasTeachers[0].count > 0 || hasStudents[0].count > 0) {
            console.log('  🎯 包含业务表（users/teachers/students）');

            // 如果有users表，检查记录数
            if (hasUsers[0].count > 0) {
              const [userCount] = await connection.execute(`SELECT COUNT(*) as count FROM \`${dbName}\`.users LIMIT 1`);
              try {
                console.log(`  👥 用户记录: ${userCount[0].count} 条`);
              } catch (e) {
                console.log('  👥 用户表存在但无法查询记录数');
              }
            }
          }
        } else {
          console.log('  ❌ 空数据库');
        }
      } catch (error) {
        console.log(`  ❌ 检查失败: ${error.message}`);
      }
    }

  } finally {
    await connection.end();
  }
}

findTenantsWithData();