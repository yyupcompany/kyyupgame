const mysql = require('mysql2/promise');

async function checkClassData() {
  try {
    console.log('🔍 连接到数据库检查班级数据...\n');

    // 连接到数据库服务器
    const connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j'
    });

    console.log('✅ 数据库连接成功\n');

    // 查看所有租户数据库
    const [databases] = await connection.execute('SHOW DATABASES LIKE \'tenant%\';');
    console.log('📋 租户数据库列表:');
    if (databases.length === 0) {
      console.log('❌ 没有找到任何tenant开头的数据库\n');
    } else {
      databases.forEach(db => {
        const dbName = db[Object.keys(db)[0]];
        console.log(`  - ${dbName}`);
      });
      console.log('');
    }

    // 检查tenant_001数据库
    const [tenant001Check] = await connection.execute('SHOW DATABASES LIKE \'tenant_001\';');
    if (tenant001Check.length > 0) {
      console.log('✅ 找到tenant_001数据库\n');
      
      // 切换到tenant_001数据库
      await connection.changeUser({ database: 'tenant_001' });
      
      // 检查classes表是否存在
      try {
        const [tables] = await connection.execute('SHOW TABLES LIKE \'classes\';');
        if (tables.length === 0) {
          console.log('❌ classes表不存在\n');
        } else {
          console.log('✅ classes表存在\n');
          
          // 查询班级数据总数
          const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM classes WHERE deleted_at IS NULL;');
          const total = countResult[0].total;
          console.log(`📊 班级数据总数: ${total}\n`);
          
          if (total > 0) {
            // 查询前10条班级数据
            const [classes] = await connection.execute(`
              SELECT 
                id, 
                name, 
                code, 
                grade, 
                capacity,
                current_student_count,
                status,
                created_at
              FROM classes 
              WHERE deleted_at IS NULL
              ORDER BY created_at DESC
              LIMIT 10
            `);
            
            console.log('📝 班级数据（前10条）:');
            console.log('─'.repeat(120));
            console.log(
              'ID'.padEnd(8) + 
              '班级名称'.padEnd(20) + 
              '班级编号'.padEnd(15) + 
              '年级'.padEnd(15) + 
              '容量'.padEnd(8) + 
              '当前人数'.padEnd(10) + 
              '状态'.padEnd(8) + 
              '创建时间'
            );
            console.log('─'.repeat(120));
            
            classes.forEach(cls => {
              console.log(
                String(cls.id).padEnd(8) +
                (cls.name || '').padEnd(20) +
                (cls.code || '').padEnd(15) +
                (cls.grade || '').padEnd(15) +
                String(cls.capacity || 0).padEnd(8) +
                String(cls.current_student_count || 0).padEnd(10) +
                String(cls.status || 0).padEnd(8) +
                (cls.created_at ? new Date(cls.created_at).toLocaleString('zh-CN') : '')
              );
            });
            console.log('─'.repeat(120));
          } else {
            console.log('⚠️ classes表中没有数据');
          }
        }
      } catch (err) {
        console.error('❌ 查询classes表失败:', err.message);
      }
    } else {
      console.log('❌ 没有找到tenant_001数据库\n');
    }

    await connection.end();
    console.log('\n✅ 检查完成');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkClassData();
