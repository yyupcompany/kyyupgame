/**
 * 查看数据库AI模型配置
 */

const { Sequelize } = require('sequelize');

async function checkConfig() {
  // 从环境变量读取数据库配置
  const sequelize = new Sequelize({
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT) || 43906,
    database: process.env.DB_NAME || 'kargerdensales',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'pw5ls7j',
    dialect: 'mysql',
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 查询ai_model_configs表
    const [results] = await sequelize.query(`
      SELECT
        id,
        name,
        displayName,
        provider,
        modelType,
        endpointUrl,
        status,
        isDefault
      FROM ai_model_configs
      WHERE status = 'active'
      ORDER BY isDefault DESC, name ASC
    `);

    console.log('\n📋 数据库中的AI模型配置:');
    console.log('='.repeat(100));
    console.log(sprintf('%-5s %-40s %-20s %-15s %-10s %-10s', 'ID', 'Name', 'Provider', 'Type', 'Default', 'Status'));
    console.log('='.repeat(100));

    results.forEach(model => {
      console.log(sprintf(
        '%-5s %-40s %-20s %-15s %-10s %-10s',
        model.id,
        model.name.substring(0, 38),
        model.provider,
        model.modelType || 'N/A',
        model.isDefault ? '✅' : '❌',
        model.status
      ));
      console.log(sprintf('     DisplayName: %s', model.displayName || 'N/A'));
      console.log(sprintf('     Endpoint: %s', model.endpointUrl || 'N/A'));
      console.log('-'.repeat(100));
    });

    console.log(`\n总计: ${results.length} 个活跃模型`);

    // 检查是否有OpenAI配置
    const openaiModels = results.filter(m => m.provider === 'openai');
    const doubaoModels = results.filter(m => m.provider === 'doubao');

    console.log(`\n📊 提供商分布:`);
    console.log(`   - OpenAI: ${openaiModels.length} 个`);
    console.log(`   - 豆包 (Doubao): ${doubaoModels.length} 个`);

    if (openaiModels.length > 0) {
      console.log('\n⚠️  发现OpenAI配置，这可能导致API调用失败');
      console.log('OpenAI模型列表:');
      openaiModels.forEach(m => {
        console.log(`   - ${m.name} (${m.displayName})`);
      });
    }

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

function sprintf(format, ...args) {
  return format.replace(/%(-?\d+)?s/g, (match, width) => {
    const value = String(args.shift());
    if (width) {
      const w = parseInt(width);
      if (width.startsWith('-')) {
        return value.padEnd(Math.abs(w));
      } else {
        return value.padStart(w);
      }
    }
    return value;
  });
}

checkConfig();
