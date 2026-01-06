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

async function checkVideoModels() {
  try {
    console.log('🔍 正在查询视频生成模型配置...\n');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询视频模型
    const [videoModels] = await sequelize.query(`
      SELECT 
        id,
        name,
        display_name,
        model_type,
        provider,
        status,
        is_default,
        endpoint_url,
        SUBSTRING(api_key, 1, 20) as api_key_preview,
        model_parameters,
        created_at,
        updated_at
      FROM ai_model_config
      WHERE model_type = 'video'
      ORDER BY is_default DESC, created_at DESC
    `);

    if (videoModels.length === 0) {
      console.log('❌ 没有找到视频生成模型配置\n');
      console.log('建议：需要在数据库中添加视频生成模型配置');
    } else {
      console.log(`✅ 找到 ${videoModels.length} 个视频生成模型配置:\n`);
      
      videoModels.forEach((model, index) => {
        console.log(`📹 模型 ${index + 1}:`);
        console.log(`   ID: ${model.id}`);
        console.log(`   名称: ${model.name}`);
        console.log(`   显示名称: ${model.display_name}`);
        console.log(`   类型: ${model.model_type}`);
        console.log(`   提供商: ${model.provider}`);
        console.log(`   状态: ${model.status}`);
        console.log(`   默认模型: ${model.is_default ? '是' : '否'}`);
        console.log(`   端点URL: ${model.endpoint_url}`);
        console.log(`   API密钥预览: ${model.api_key_preview}...`);
        console.log(`   模型参数: ${model.model_parameters || '无'}`);
        console.log(`   创建时间: ${model.created_at}`);
        console.log(`   更新时间: ${model.updated_at}`);
        console.log('');
      });
    }

    // 查询所有AI模型统计
    const [allModels] = await sequelize.query(`
      SELECT 
        model_type,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN is_default = 1 THEN 1 ELSE 0 END) as default_count
      FROM ai_model_config
      GROUP BY model_type
      ORDER BY model_type
    `);

    console.log('📊 所有AI模型统计:\n');
    allModels.forEach(stat => {
      console.log(`   ${stat.model_type}: 总数=${stat.count}, 激活=${stat.active_count}, 默认=${stat.default_count}`);
    });

    await sequelize.close();
    console.log('\n✅ 查询完成');

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkVideoModels();

