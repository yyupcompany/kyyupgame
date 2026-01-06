/**
 * 检查豆包文生图模型的model_id配置
 */

const { Sequelize } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function checkModelIds() {
  try {
    console.log('🔍 检查豆包文生图模型的model_id配置...\n');

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询豆包文生图模型
    console.log('📋 查询豆包文生图模型详情:');
    const [models] = await sequelize.query(`
      SELECT
        name,
        display_name,
        provider,
        model_type,
        is_default,
        model_parameters,
        max_tokens,
        status
      FROM ai_model_config
      WHERE model_type = 'image' AND provider LIKE '%doubao%'
      ORDER BY is_default DESC, name
    `);

    console.log('\n模型列表:');
    models.forEach((model, index) => {
      console.log(`\n模型 ${index + 1}:`);
      console.log(`  名称: ${model.name}`);
      console.log(`  显示: ${model.display_name}`);
      console.log(`  是否默认: ${model.is_default ? '是' : '否'}`);
      console.log(`  状态: ${model.status}`);
      console.log(`  max_tokens: ${model.max_tokens || '未设置'}`);

      // 解析model_parameters JSON
      if (model.model_parameters) {
        try {
          const params = typeof model.model_parameters === 'string'
            ? JSON.parse(model.model_parameters)
            : model.model_parameters;

          console.log(`  model_id: ${params.model_id || '未设置'}`);
          console.log(`  默认尺寸: ${params.default_size || '未设置'}`);
          console.log(`  最小像素: ${params.min_pixels || '未设置'}`);
          console.log(`  质量: ${params.quality || '未设置'}`);
          console.log(`  风格: ${params.style || '未设置'}`);
        } catch (e) {
          console.log(`  配置解析失败: ${e.message}`);
          console.log(`  原始参数: ${model.model_parameters}`);
        }
      } else {
        console.log(`  model_parameters: 未设置`);
      }
    });

    // 检查是否需要更新model_id
    console.log('\n🔧 检查model_id是否需要更新...');

    for (const model of models) {
      if (model.model_parameters) {
        try {
          const params = typeof model.model_parameters === 'string'
            ? JSON.parse(model.model_parameters)
            : model.model_parameters;

          const expectedModelId = model.name.split('-').pop(); // 从名称中提取模型ID

          if (!params.model_id || params.model_id !== expectedModelId) {
            console.log(`\n⚠️  ${model.name} 的model_id需要更新`);
            console.log(`   当前: ${params.model_id || '未设置'}`);
            console.log(`   期望: ${expectedModelId}`);

            // 更新model_id
            params.model_id = expectedModelId;
            const updatedParams = JSON.stringify(params);

            const [updateResult] = await sequelize.query(`
              UPDATE ai_model_config
              SET model_parameters = ?,
                  updated_at = NOW()
              WHERE name = ?
            `, [updatedParams, model.name]);

            console.log(`   ✅ 已更新model_id为: ${expectedModelId}`);
          } else {
            console.log(`✅ ${model.name} 的model_id正确: ${params.model_id}`);
          }
        } catch (e) {
          console.log(`❌ ${model.name} 的配置解析失败: ${e.message}`);
        }
      }
    }

    console.log('\n✅ model_id检查完成！');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// 运行检查
checkModelIds();