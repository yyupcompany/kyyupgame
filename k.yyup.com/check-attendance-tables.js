import { Sequelize } from 'sequelize';

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false,
});

async function checkAttendanceTables() {
  try {
    console.log('🔍 正在连接数据库...\n');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 查询所有包含attendance的表
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE '%attendance%'
    `);
    
    console.log('📊 考勤相关的表:');
    console.log('='.repeat(80));
    
    if (tables.length === 0) {
      console.log('❌ 未找到任何考勤相关的表！\n');
    } else {
      console.log(`✅ 找到 ${tables.length} 个考勤相关的表:\n`);
      
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        console.log(`\n📋 表名: ${tableName}`);
        console.log('-'.repeat(80));
        
        // 获取表结构
        const [columns] = await sequelize.query(`DESCRIBE ${tableName}`);
        
        console.log('字段列表:');
        columns.forEach((col, index) => {
          console.log(`  ${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // 获取索引信息
        const [indexes] = await sequelize.query(`SHOW INDEX FROM ${tableName}`);
        if (indexes.length > 0) {
          console.log('\n索引:');
          const indexMap = new Map();
          indexes.forEach(idx => {
            if (!indexMap.has(idx.Key_name)) {
              indexMap.set(idx.Key_name, {
                name: idx.Key_name,
                unique: idx.Non_unique === 0,
                columns: []
              });
            }
            indexMap.get(idx.Key_name).columns.push(idx.Column_name);
          });
          
          indexMap.forEach((idx, name) => {
            const type = idx.unique ? 'UNIQUE' : 'INDEX';
            console.log(`  - ${name} (${type}): ${idx.columns.join(', ')}`);
          });
        }
        
        // 获取记录数
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`\n记录数: ${count[0].count}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    
    // 检查特定的表是否存在
    console.log('\n🔍 检查必需的考勤表:');
    console.log('='.repeat(80));
    
    const requiredTables = [
      'attendances',              // 学生考勤记录表
      'teacher_attendances',      // 教师考勤记录表
      'attendance_change_logs'    // 考勤修改日志表
    ];
    
    for (const tableName of requiredTables) {
      const [result] = await sequelize.query(`
        SHOW TABLES LIKE '${tableName}'
      `);
      
      if (result.length > 0) {
        console.log(`✅ ${tableName} - 存在`);
      } else {
        console.log(`❌ ${tableName} - 不存在`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n✅ 数据库连接已关闭');
  }
}

checkAttendanceTables();

