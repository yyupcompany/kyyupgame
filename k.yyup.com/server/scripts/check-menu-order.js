const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

async function checkMenuOrder() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔍 检查数据库中的菜单相关表...\n');

    // 先查看所有表
    const [menuTables] = await connection.execute(`SHOW TABLES LIKE '%menu%'`);
    const [permTables] = await connection.execute(`SHOW TABLES LIKE '%permission%'`);
    console.log('📋 数据库中的菜单相关表:');
    [...menuTables, ...permTables].forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });

    // 尝试查找可能的菜单表
    const [allTables] = await connection.execute(`SHOW TABLES`);
    console.log('\n🔍 所有数据库表:');
    const tableNames = allTables.map(table => Object.values(table)[0]);
    const relatedTables = tableNames.filter(name =>
      name.includes('menu') ||
      name.includes('permission') ||
      name.includes('navigation') ||
      name.includes('center')
    );

    if (relatedTables.length > 0) {
      console.log('📋 可能的菜单相关表:');
      relatedTables.forEach(table => console.log(`- ${table}`));

      // 检查permissions表结构
      if (relatedTables.includes('permissions')) {
        console.log(`\n🔍 检查表 permissions 的结构:`);
        const [columns] = await connection.execute(`DESCRIBE permissions`);
        columns.forEach(col => {
          console.log(`- ${col.Field} (${col.Type})`);
        });

        // 查看category类型的数据
        console.log(`\n📋 permissions 表中的category数据:`);
        const [categories] = await connection.execute(`SELECT id, name, chinese_name, code, sort, status FROM permissions WHERE type='category' ORDER BY sort ASC`);
        console.log('当前排序:');
        categories.forEach(cat => {
          console.log(`${cat.sort} | ${cat.id} | ${cat.name} | ${cat.chinese_name || 'N/A'} | ${cat.code}`);
        });

        // 显示需要更新的排序
        console.log('\n💡 需要更新数据库排序的SQL语句:');
        const sortUpdates = [
          { name: 'Personnel Center', sort: 2 },
          { name: 'Enrollment Center', sort: 3 },
          { name: 'Marketing Center', sort: 4 },
          { name: 'Activity Center', sort: 5 },
          { name: 'Media Center', sort: 6 },
          { name: 'Task Center', sort: 7 },
          { name: 'Script Center', sort: 8 },
          { name: 'Finance Center', sort: 9 },
          { name: 'AI Center', sort: 10 },
          { name: 'System Center', sort: 11 }
        ];

        for (const update of sortUpdates) {
          const category = categories.find(cat => cat.name === update.name);
          if (category && category.sort !== update.sort) {
            console.log(`UPDATE permissions SET sort=${update.sort} WHERE name='${update.name}' AND type='category';`);
          }
        }
      }
    } else {
      console.log('⚠️ 未找到菜单相关表，可能菜单配置在前端静态定义');
    }

    console.log('\n🎯 用户要求的新排序:');
    console.log('1. 工作台');
    console.log('2. 人员中心');
    console.log('3. 招生中心');
    console.log('4. 营销中心');
    console.log('5. 活动中心');
    console.log('6. 新媒体中心');
    console.log('7. 任务中心');
    console.log('8. 话术中心');
    console.log('9. 财务中心');
    console.log('10. AI中心');
    console.log('11. 系统中心');

  } catch (error) {
    console.error('❌ 检查菜单排序失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkMenuOrder().catch(console.error);
