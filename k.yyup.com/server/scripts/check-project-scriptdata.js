const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function checkProjectScriptData() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    const [results] = await sequelize.query(`
      SELECT 
        id, 
        title, 
        status, 
        progress,
        progressMessage,
        scriptData IS NOT NULL as has_script,
        LENGTH(scriptData) as script_length,
        createdAt,
        updatedAt
      FROM video_projects 
      WHERE id = 2
    `);

    console.log('\n📊 项目ID=2的数据:');
    console.log(JSON.stringify(results[0], null, 2));

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkProjectScriptData();

