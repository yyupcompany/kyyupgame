const { Sequelize } = require('sequelize');
const path = require('path');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_management',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Zhu@1234',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: false
  }
);

async function checkVolcengineConfig() {
  try {
    console.log('🔍 正在查询火山引擎配置...\n');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 查询AI模型配置中的火山引擎相关配置
    console.log('📋 查询AI模型配置表...');
    const [aiModels] = await sequelize.query(`
      SELECT 
        id,
        name,
        display_name,
        model_type,
        provider,
        status,
        endpoint_url,
        SUBSTRING(api_key, 1, 20) as api_key_preview
      FROM ai_model_config
      WHERE provider LIKE '%volc%' OR provider LIKE '%火山%' OR provider LIKE '%bytedance%'
      ORDER BY created_at DESC
    `);

    if (aiModels.length > 0) {
      console.log(`✅ 找到 ${aiModels.length} 个火山引擎相关配置:\n`);
      aiModels.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
        console.log(`   显示名称: ${model.display_name}`);
        console.log(`   类型: ${model.model_type}`);
        console.log(`   提供商: ${model.provider}`);
        console.log(`   状态: ${model.status}`);
        console.log(`   端点: ${model.endpoint_url}`);
        console.log(`   API密钥: ${model.api_key_preview}...`);
        console.log('');
      });
    } else {
      console.log('❌ 未找到火山引擎相关配置\n');
    }

    // 2. 查询系统配置表
    console.log('📋 查询系统配置表...');
    const [systemConfigs] = await sequelize.query(`
      SELECT 
        config_key,
        config_value,
        description
      FROM system_configs
      WHERE config_key LIKE '%volc%' OR config_key LIKE '%vod%'
      ORDER BY config_key
    `);

    if (systemConfigs.length > 0) {
      console.log(`✅ 找到 ${systemConfigs.length} 个系统配置:\n`);
      systemConfigs.forEach((config) => {
        console.log(`- ${config.config_key}: ${config.config_value}`);
        console.log(`  说明: ${config.description || '无'}`);
        console.log('');
      });
    } else {
      console.log('❌ 未找到VOD相关系统配置\n');
    }

    // 3. 检查环境变量
    console.log('📋 检查环境变量...');
    const volcEnvVars = [
      'VOLCENGINE_ACCESS_KEY_ID',
      'VOLCENGINE_SECRET_ACCESS_KEY',
      'VOLCENGINE_REGION',
      'VOLCANO_API_KEY',
      'VOLCANO_SEARCH_ENDPOINT',
      'VOD_ACCESS_KEY',
      'VOD_SECRET_KEY',
      'VOD_REGION'
    ];

    let foundEnvVars = false;
    volcEnvVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`✅ ${varName}: ${process.env[varName].substring(0, 20)}...`);
        foundEnvVars = true;
      }
    });

    if (!foundEnvVars) {
      console.log('❌ 未找到火山引擎相关环境变量\n');
    } else {
      console.log('');
    }

    // 4. 总结
    console.log('📊 配置总结');
    console.log('═════════════════════════════════════');
    console.log(`AI模型配置: ${aiModels.length > 0 ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`系统配置: ${systemConfigs.length > 0 ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`环境变量: ${foundEnvVars ? '✅ 已配置' : '❌ 未配置'}`);
    console.log('');

    if (aiModels.length === 0 && systemConfigs.length === 0 && !foundEnvVars) {
      console.log('⚠️  建议：需要配置火山引擎VOD服务');
      console.log('');
      console.log('配置步骤：');
      console.log('1. 在 server/.env 文件中添加：');
      console.log('   VOLCENGINE_ACCESS_KEY_ID=your_access_key');
      console.log('   VOLCENGINE_SECRET_ACCESS_KEY=your_secret_key');
      console.log('   VOLCENGINE_REGION=cn-beijing');
      console.log('');
      console.log('2. 或者在数据库 ai_model_config 表中添加VOD配置');
      console.log('3. 或者在数据库 system_configs 表中添加VOD配置');
    }

    await sequelize.close();
    console.log('✅ 查询完成');

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkVolcengineConfig();

