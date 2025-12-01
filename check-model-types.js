const mysql = require('mysql2/promise');

async function checkModelTypes() {
  let sourceConnection = null;

  try {
    // 连接到源数据库 (kargerdensales)
    console.log('🔗 连接到源数据库 kargerdensales...');
    sourceConnection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });

    console.log('✅ 数据库连接成功');

    // 检查源数据库中实际使用的 model_type 值
    console.log('\n📋 源数据库中实际使用的 model_type 值:');
    const [modelTypes] = await sourceConnection.execute('SELECT DISTINCT model_type FROM ai_model_config');
    console.log('实际值:', modelTypes.map(row => row.model_type));

    // 检查是否有 'vod' 类型
    console.log('\n🔍 检查是否有 "vod" 类型的模型:');
    const [vodModels] = await sourceConnection.execute('SELECT name, display_name, model_type FROM ai_model_config WHERE model_type = "vod"');
    if (vodModels.length > 0) {
      console.log('发现 "vod" 类型模型:');
      vodModels.forEach(model => {
        console.log(`  - ${model.name} (${model.display_name})`);
      });
    } else {
      console.log('没有发现 "vod" 类型模型');
    }

    // 列出所有模型的类型
    console.log('\n📊 所有模型的类型分布:');
    const [typeDistribution] = await sourceConnection.execute(`
      SELECT model_type, COUNT(*) as count
      FROM ai_model_config
      GROUP BY model_type
    `);
    typeDistribution.forEach(row => {
      console.log(`  ${row.model_type}: ${row.count} 个`);
    });

  } catch (error) {
    console.error('❌ 检查过程中出错:', error);
  } finally {
    // 关闭数据库连接
    if (sourceConnection) {
      await sourceConnection.end();
    }
  }
}

checkModelTypes();