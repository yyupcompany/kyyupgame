const mysql = require('mysql2/promise');

async function checkAllTenantDatabases() {
  try {
    console.log('🔍 连接到数据库检查所有租户数据库的班级数据...\n');

    const connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j'
    });

    console.log('✅ 数据库连接成功\n');

    // 查看所有租户数据库
    const [databases] = await connection.execute('SHOW DATABASES LIKE \'tenant%\';');
    console.log('📋 所有租户数据库:');
    
    const tenantDbs = databases.map(db => db[Object.keys(db)[0]]);
    tenantDbs.forEach(dbName => {
      console.log(`  - ${dbName}`);
    });
    console.log('');

    // 检查每个租户数据库的班级数据
    for (const dbName of tenantDbs) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📊 数据库: ${dbName}`);
      console.log('='.repeat(80));
      
      await connection.changeUser({ database: dbName });
      
      // 检查classes表是否存在
      const [tables] = await connection.execute('SHOW TABLES LIKE \'classes\';');
      
      if (tables.length === 0) {
        console.log('⚠️  classes表不存在');
        continue;
      }
      
      // 查询班级数据
      const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM classes WHERE deleted_at IS NULL;');
      const total = countResult[0].total;
      
      console.log(`📈 班级数据总数: ${total}`);
      
      if (total > 0) {
        // 查询前5条班级数据
        const [classes] = await connection.execute(`
          SELECT 
            id, 
            name, 
            code, 
            grade, 
            kindergarten_id,
            created_at
          FROM classes 
          WHERE deleted_at IS NULL
          ORDER BY created_at DESC
          LIMIT 5
        `);
        
        console.log('\n📝 班级数据样例（前5条）:');
        console.log('─'.repeat(100));
        console.log(
          'ID'.padEnd(8) + 
          '班级名称'.padEnd(20) + 
          '班级编号'.padEnd(15) + 
          '年级'.padEnd(15) + 
          '幼儿园ID'.padEnd(12) +
          '创建时间'
        );
        console.log('─'.repeat(100));
        
        classes.forEach(cls => {
          console.log(
            String(cls.id).padEnd(8) +
            (cls.name || '').padEnd(20) +
            (cls.code || '').padEnd(15) +
            (cls.grade || '').padEnd(15) +
            String(cls.kindergarten_id || 0).padEnd(12) +
            (cls.created_at ? new Date(cls.created_at).toLocaleString('zh-CN') : '')
          );
        });
        console.log('─'.repeat(100));
      }
    }

    await connection.end();
    console.log('\n\n✅ 所有租户数据库检查完成\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkAllTenantDatabases();
