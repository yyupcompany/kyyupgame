const { Sequelize } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function checkPerformanceTables() {
  try {
    console.log('🔍 查找绩效相关数据库表...\n');

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 获取所有表
    const [tables] = await sequelize.query('SHOW TABLES');
    const tableList = tables.map(row => Object.values(row)[0]);

    // 查找绩效相关的表
    const performanceTables = tableList.filter(table =>
      table.toLowerCase().includes('performance') ||
      table.toLowerCase().includes('reward') ||
      table.toLowerCase().includes('assessment')
    );

    console.log('📋 找到的绩效相关表:');
    performanceTables.forEach(table => console.log(`  - ${table}`));

    // 检查每个表的结构和数据
    for (const tableName of performanceTables) {
      console.log(`\n🔍 表 ${tableName} 详细信息:`);

      try {
        // 获取表结构
        const [columns] = await sequelize.query(`DESCRIBE ${tableName}`);
        console.log('  字段:');
        columns.forEach(col => {
          const field = col.Field || col.field;
          const type = col.Type || col.type;
          const nullable = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
          console.log(`    - ${field}: ${type} (${nullable})`);
        });

        // 获取数据量
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const recordCount = count[0].count || count[0]?.count || 0;
        console.log(`  📊 数据量: ${recordCount} 条`);

        // 如果有数据，显示前几条
        if (recordCount > 0) {
          const [sampleData] = await sequelize.query(`SELECT * FROM ${tableName} LIMIT 3`);
          console.log('  📄 示例数据:');
          sampleData.forEach((row, index) => {
            console.log(`    ${index + 1}:`, JSON.stringify(row, null, 2));
          });
        }

      } catch (error) {
        console.error(`  ❌ 检查表 ${tableName} 失败:`, error.message);
      }
    }

    // 检查绩效相关的API路由
    console.log('\n🔍 查找绩效相关的API路由...');
    const fs = require('fs');
    const path = require('path');

    const routesDir = path.join(__dirname, 'src/routes');
    if (fs.existsSync(routesDir)) {
      const routeFiles = fs.readdirSync(routesDir);
      const performanceRoutes = routeFiles.filter(file =>
        file.toLowerCase().includes('performance') ||
        file.toLowerCase().includes('reward') ||
        file.toLowerCase().includes('assessment')
      );

      console.log('📋 找到的绩效相关路由文件:');
      performanceRoutes.forEach(route => console.log(`  - ${route}`));
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// 运行检查
checkPerformanceTables();