require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

async function checkMenuPermissions() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查看permissions表结构
    const [columns] = await sequelize.query('DESCRIBE permissions');
    console.log('📋 permissions表结构：');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    console.log('');

    // 查询集团中心、用量中心、推广相关的权限
    const [results] = await sequelize.query(`
      SELECT
        id,
        name,
        code,
        type,
        path,
        parent_id,
        icon,
        sort
      FROM permissions
      WHERE name LIKE '%集团%'
         OR name LIKE '%用量%'
         OR name LIKE '%推广%'
         OR code LIKE '%GROUP%'
         OR code LIKE '%USAGE%'
         OR code LIKE '%MARKETING%'
      ORDER BY parent_id, sort, id
    `);

    console.log('📋 找到的权限记录：\n');
    console.log('ID\t名称\t\t\t代码\t\t\t类型\t路径\t\t\t父ID\t图标\t\t排序');
    console.log('─'.repeat(150));

    results.forEach(row => {
      console.log(
        `${row.id}\t${row.name.padEnd(20)}\t${(row.code || '').padEnd(25)}\t${row.type}\t${(row.path || '').padEnd(25)}\t${row.parent_id || 'NULL'}\t${(row.icon || '').padEnd(15)}\t${row.sort}`
      );
    });

    console.log('\n总计:', results.length, '条记录\n');

    // 检查一级菜单（type = 'MENU' 且 parent_id IS NULL）
    const [level1] = await sequelize.query(`
      SELECT id, name, code, type, path, icon, sort
      FROM permissions
      WHERE type = 'MENU' AND parent_id IS NULL
      ORDER BY sort, id
    `);

    console.log('📌 所有一级菜单：\n');
    console.log('ID\t名称\t\t\t代码\t\t\t路径\t\t\t图标\t\t排序');
    console.log('─'.repeat(120));
    level1.forEach(row => {
      console.log(
        `${row.id}\t${row.name.padEnd(20)}\t${(row.code || '').padEnd(25)}\t${(row.path || '').padEnd(25)}\t${(row.icon || '').padEnd(15)}\t${row.sort}`
      );
    });

    console.log('\n总计:', level1.length, '个一级菜单\n');

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkMenuPermissions();

