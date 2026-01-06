const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function checkDatabaseRelations() {
  let connection;
  
  try {
    console.log('正在连接到远程MySQL数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功！');
    
    // 1. 获取所有表
    console.log('\n=== 1. 数据库表结构概览 ===');
    const [tables] = await connection.execute(
      'SELECT TABLE_NAME, TABLE_ROWS, ENGINE, TABLE_COMMENT ' +
      'FROM information_schema.TABLES ' +
      'WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
      [dbConfig.database]
    );
    
    console.log(`找到 ${tables.length} 张表：`);
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME} (${table.TABLE_ROWS}行) [${table.ENGINE}] ${table.TABLE_COMMENT ? '- ' + table.TABLE_COMMENT : ''}`);
    });
    
    // 2. 检查外键约束
    console.log('\n=== 2. 外键约束检查 ===');
    const [foreignKeys] = await connection.execute(
      'SELECT ' +
      'TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME ' +
      'FROM information_schema.KEY_COLUMN_USAGE ' +
      'WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL ' +
      'ORDER BY TABLE_NAME, COLUMN_NAME',
      [dbConfig.database]
    );
    
    console.log(`找到 ${foreignKeys.length} 个外键约束：`);
    foreignKeys.forEach(fk => {
      console.log(`  - ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME} (${fk.CONSTRAINT_NAME})`);
    });
    
    // 3. 检查索引
    console.log('\n=== 3. 索引检查 ===');
    const [indexes] = await connection.execute(
      'SELECT ' +
      'TABLE_NAME, INDEX_NAME, COLUMN_NAME, NON_UNIQUE, INDEX_TYPE ' +
      'FROM information_schema.STATISTICS ' +
      'WHERE TABLE_SCHEMA = ? AND INDEX_NAME != "PRIMARY" ' +
      'ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX',
      [dbConfig.database]
    );
    
    console.log(`找到 ${indexes.length} 个索引：`);
    const indexMap = {};
    indexes.forEach(idx => {
      const key = `${idx.TABLE_NAME}.${idx.INDEX_NAME}`;
      if (!indexMap[key]) {
        indexMap[key] = {
          table: idx.TABLE_NAME,
          index: idx.INDEX_NAME,
          columns: [],
          unique: !idx.NON_UNIQUE,
          type: idx.INDEX_TYPE
        };
      }
      indexMap[key].columns.push(idx.COLUMN_NAME);
    });
    
    Object.values(indexMap).forEach(idx => {
      console.log(`  - ${idx.table}: ${idx.index} (${idx.columns.join(', ')}) [${idx.unique ? 'UNIQUE' : 'NON_UNIQUE'}] ${idx.type}`);
    });
    
    // 4. 检查没有外键的表
    console.log('\n=== 4. 孤立的表（没有外键关联）===');
    const [tablesNoFK] = await connection.execute(
      'SELECT DISTINCT TABLE_NAME ' +
      'FROM information_schema.TABLES ' +
      'WHERE TABLE_SCHEMA = ? AND TABLE_NAME NOT IN (' +
      '  SELECT DISTINCT TABLE_NAME ' +
      '  FROM information_schema.KEY_COLUMN_USAGE ' +
      '  WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL' +
      ') ORDER BY TABLE_NAME',
      [dbConfig.database, dbConfig.database]
    );
    
    if (tablesNoFK.length > 0) {
      console.log(`发现 ${tablesNoFK.length} 张孤立的表：`);
      tablesNoFK.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    } else {
      console.log('所有表都有外键关联，结构良好！');
    }
    
    // 5. 检查潜在问题
    console.log('\n=== 5. 潜在问题检查 ===');
    
    // 5.1 检查没有主键的表
    const [noPKTables] = await connection.execute(
      'SELECT TABLE_NAME ' +
      'FROM information_schema.TABLES ' +
      'WHERE TABLE_SCHEMA = ? AND TABLE_NAME NOT IN (' +
      '  SELECT DISTINCT TABLE_NAME ' +
      '  FROM information_schema.KEY_COLUMN_USAGE ' +
      '  WHERE TABLE_SCHEMA = ? AND CONSTRAINT_NAME = "PRIMARY"' +
      ') ORDER BY TABLE_NAME',
      [dbConfig.database, dbConfig.database]
    );
    
    if (noPKTables.length > 0) {
      console.log('⚠️  发现没有主键的表：');
      noPKTables.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    }
    
    // 5.2 检查外键字段类型不匹配
    console.log('\n--- 外键字段类型一致性检查 ---');
    const [typeMismatch] = await connection.execute(
      'SELECT ' +
      'kcu.TABLE_NAME, kcu.COLUMN_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME, ' +
      'cols1.DATA_TYPE as source_type, cols1.CHARACTER_MAXIMUM_LENGTH as source_length, ' +
      'cols2.DATA_TYPE as ref_type, cols2.CHARACTER_MAXIMUM_LENGTH as ref_length ' +
      'FROM information_schema.KEY_COLUMN_USAGE kcu ' +
      'JOIN information_schema.COLUMNS cols1 ON kcu.TABLE_SCHEMA = cols1.TABLE_SCHEMA ' +
      '  AND kcu.TABLE_NAME = cols1.TABLE_NAME AND kcu.COLUMN_NAME = cols1.COLUMN_NAME ' +
      'JOIN information_schema.COLUMNS cols2 ON kcu.TABLE_SCHEMA = cols2.TABLE_SCHEMA ' +
      '  AND kcu.REFERENCED_TABLE_NAME = cols2.TABLE_NAME AND kcu.REFERENCED_COLUMN_NAME = cols2.COLUMN_NAME ' +
      'WHERE kcu.TABLE_SCHEMA = ? AND kcu.REFERENCED_TABLE_NAME IS NOT NULL ' +
      '  AND (cols1.DATA_TYPE != cols2.DATA_TYPE OR ' +
      '       (cols1.CHARACTER_MAXIMUM_LENGTH != cols2.CHARACTER_MAXIMUM_LENGTH AND ' +
      '        cols1.CHARACTER_MAXIMUM_LENGTH IS NOT NULL AND cols2.CHARACTER_MAXIMUM_LENGTH IS NOT NULL))',
      [dbConfig.database]
    );
    
    if (typeMismatch.length > 0) {
      console.log('⚠️  发现外键字段类型不匹配：');
      typeMismatch.forEach(row => {
        console.log(`  - ${row.TABLE_NAME}.${row.COLUMN_NAME} (${row.source_type}${row.source_length ? '(' + row.source_length + ')' : ''}) ` +
                   `-> ${row.REFERENCED_TABLE_NAME}.${row.REFERENCED_COLUMN_NAME} (${row.ref_type}${row.ref_length ? '(' + row.ref_length + ')' : ''})`);
      });
    } else {
      console.log('✅ 所有外键字段类型匹配！');
    }
    
    // 6. 检查循环引用
    console.log('\n=== 6. 循环引用检查 ===');
    // 这需要更复杂的图算法，这里简单检查直接的循环引用
    const [circularRefs] = await connection.execute(
      'SELECT DISTINCT ' +
      'a.TABLE_NAME as table1, a.REFERENCED_TABLE_NAME as table2, ' +
      'b.TABLE_NAME as table2_check, b.REFERENCED_TABLE_NAME as table1_check ' +
      'FROM information_schema.KEY_COLUMN_USAGE a ' +
      'JOIN information_schema.KEY_COLUMN_USAGE b ' +
      '  ON a.REFERENCED_TABLE_NAME = b.TABLE_NAME ' +
      '  AND b.REFERENCED_TABLE_NAME = a.TABLE_NAME ' +
      'WHERE a.TABLE_SCHEMA = ? AND b.TABLE_SCHEMA = ? ' +
      '  AND a.TABLE_NAME < b.TABLE_NAME',  // 避免重复
      [dbConfig.database, dbConfig.database]
    );
    
    if (circularRefs.length > 0) {
      console.log('🔄 发现循环引用：');
      circularRefs.forEach(ref => {
        console.log(`  - ${ref.table1} <-> ${ref.table2}`);
      });
    } else {
      console.log('✅ 没有发现循环引用！');
    }
    
    // 7. 生成关联关系图（简化版）
    console.log('\n=== 7. 数据库关联关系图 ===');
    console.log('核心实体关系：');
    
    // 核心关系
    const coreRelations = [
      'users -> roles (通过user_roles)',
      'users -> teachers (一对一)',
      'users -> parents (一对多)',
      'kindergartens -> students (一对多)',
      'kindergartens -> classes (一对多)',
      'classes -> students (一对多)',
      'students -> parent_student_relations (一对多)',
      'students -> activity_registrations (一对多)',
      'teachers -> classes (通过class_teachers)',
      'enrollment_plans -> enrollment_applications (一对多)'
    ];
    
    coreRelations.forEach(rel => {
      console.log(`  - ${rel}`);
    });
    
    console.log('\n=== 检查完成 ===');
    
  } catch (error) {
    console.error('❌ 数据库检查失败：', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('无法连接到数据库服务器，请检查：');
      console.log('- 数据库服务器地址和端口是否正确');
      console.log('- 网络连接是否正常');
      console.log('- 数据库服务器是否正在运行');
      console.log('- 防火墙设置是否允许连接');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('数据库访问被拒绝，请检查：');
      console.log('- 用户名和密码是否正确');
      console.log('- 用户是否有远程访问权限');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 运行检查
checkDatabaseRelations();