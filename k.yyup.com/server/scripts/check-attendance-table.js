const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false,
});

async function checkAttendanceTable() {
  try {
    console.log('🔍 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 检查表是否存在
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'attendances'");
    console.log('📋 检查 attendances 表是否存在:');
    console.log(tables);
    console.log('');

    if (tables.length === 0) {
      console.log('❌ attendances 表不存在！');
      return;
    }

    // 查看表结构
    const [columns] = await sequelize.query("DESCRIBE attendances");
    console.log('📊 attendances 表结构:');
    console.table(columns);
    console.log('');

    // 查看表中的数据量
    const [count] = await sequelize.query("SELECT COUNT(*) as count FROM attendances");
    console.log('📈 attendances 表数据量:', count[0].count);
    console.log('');

    // 查看示例数据
    const [sample] = await sequelize.query("SELECT * FROM attendances LIMIT 3");
    console.log('📝 示例数据:');
    console.table(sample);

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkAttendanceTable();

