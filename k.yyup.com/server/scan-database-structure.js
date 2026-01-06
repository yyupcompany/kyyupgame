const mysql = require('mysql2');

// 创建数据库连接
const connection = mysql.createConnection({
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
});

console.log('🔄 开始扫描数据库表结构...');

connection.connect((err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err);
    return;
  }
  
  console.log('✅ 数据库连接成功!');
  
  // 首先获取所有表名
  connection.query('SHOW TABLES', (err, tables) => {
    if (err) {
      console.error('❌ 获取表列表失败:', err);
      connection.end();
      return;
    }
    
    console.log(`\n📊 数据库包含 ${tables.length} 个表:`);
    
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log(tableNames.join(', '));
    
    let completedTables = 0;
    const tableStructures = {};
    
    // 逐个查询每个表的结构
    tableNames.forEach(tableName => {
      connection.query(`DESCRIBE ${tableName}`, (err, results) => {
        if (err) {
          console.error(`❌ 查询${tableName}表结构失败:`, err);
          tableStructures[tableName] = { error: err.message };
        } else {
          console.log(`\n📋 ${tableName} 表结构:`);
          const columns = results.map(col => {
            const info = `${col.Field} (${col.Type}) - ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}${col.Key ? ' - ' + col.Key : ''}${col.Default !== null ? ' - DEFAULT: ' + col.Default : ''}`;
            console.log(`  - ${info}`);
            return {
              field: col.Field,
              type: col.Type,
              null: col.Null,
              key: col.Key,
              default: col.Default,
              extra: col.Extra
            };
          });
          tableStructures[tableName] = { columns };
        }
        
        completedTables++;
        if (completedTables === tableNames.length) {
          // 查询表关系
          queryTableRelations(tableNames, tableStructures);
        }
      });
    });
  });
});

function queryTableRelations(tableNames, tableStructures) {
  console.log('\n🔗 分析表关系...');
  
  const query = `
    SELECT 
      TABLE_NAME,
      COLUMN_NAME,
      CONSTRAINT_NAME,
      REFERENCED_TABLE_NAME,
      REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'kargerdensales' 
    AND REFERENCED_TABLE_NAME IS NOT NULL
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('❌ 查询表关系失败:', err);
    } else {
      console.log('\n📊 外键关系:');
      const relations = {};
      
      results.forEach(row => {
        const relation = `${row.TABLE_NAME}.${row.COLUMN_NAME} -> ${row.REFERENCED_TABLE_NAME}.${row.REFERENCED_COLUMN_NAME}`;
        console.log(`  - ${relation}`);
        
        if (!relations[row.TABLE_NAME]) {
          relations[row.TABLE_NAME] = [];
        }
        relations[row.TABLE_NAME].push({
          column: row.COLUMN_NAME,
          referencedTable: row.REFERENCED_TABLE_NAME,
          referencedColumn: row.REFERENCED_COLUMN_NAME
        });
      });
      
      // 生成结构化报告
      generateReport(tableStructures, relations);
    }
    
    connection.end();
  });
}

function generateReport(tableStructures, relations) {
  console.log('\n📈 数据库结构分析报告:');
  console.log('=====================================');
  
  // 按业务模块分类
  const businessModules = {
    '用户权限模块': ['users', 'roles', 'permissions', 'user_roles', 'role_permissions'],
    '班级管理模块': ['classes', 'class_teachers'],
    '人员管理模块': ['teachers', 'students', 'parents', 'parent_student_relations'],
    '招生管理模块': ['enrollment_plans', 'enrollment_applications', 'enrollment_consultations', 'enrollment_quotas', 'enrollment_tasks'],
    '活动管理模块': ['activities', 'activity_registrations', 'activity_evaluations', 'activity_plans', 'activity_arrangements'],
    '系统管理模块': ['system_configs', 'system_logs', 'notifications', 'message_templates', 'file_storages'],
    '营销管理模块': ['marketing_campaigns', 'advertisements', 'conversion_trackings', 'channel_trackings'],
    'AI功能模块': ['ai_conversations', 'ai_messages', 'ai_models', 'ai_model_configs', 'ai_feedbacks'],
    '其他模块': []
  };
  
  const allTables = Object.keys(tableStructures);
  const categorizedTables = new Set();
  
  // 分类表
  Object.keys(businessModules).forEach(module => {
    const moduleTables = businessModules[module];
    const existingTables = moduleTables.filter(table => allTables.includes(table));
    
    if (existingTables.length > 0) {
      console.log(`\n🏷️  ${module}:`);
      existingTables.forEach(table => {
        categorizedTables.add(table);
        console.log(`  ✅ ${table} (${tableStructures[table].columns ? tableStructures[table].columns.length : 0} 个字段)`);
      });
      
      // 显示缺失的表
      const missingTables = moduleTables.filter(table => !allTables.includes(table));
      if (missingTables.length > 0) {
        console.log(`  ❌ 缺失表: ${missingTables.join(', ')}`);
      }
    }
  });
  
  // 未分类的表
  const uncategorizedTables = allTables.filter(table => !categorizedTables.has(table));
  if (uncategorizedTables.length > 0) {
    console.log(`\n🏷️  其他模块:`);
    uncategorizedTables.forEach(table => {
      console.log(`  ❓ ${table} (${tableStructures[table].columns ? tableStructures[table].columns.length : 0} 个字段)`);
    });
  }
  
  // 显示关系统计
  console.log('\n📊 表关系统计:');
  Object.keys(relations).forEach(table => {
    console.log(`  - ${table}: ${relations[table].length} 个外键关系`);
  });
  
  console.log('\n✅ 数据库结构扫描完成!');
}