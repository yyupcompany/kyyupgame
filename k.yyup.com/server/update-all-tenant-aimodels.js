/**
 * 更新所有租户数据库中的AI模型配置
 */

const { Sequelize } = require('sequelize');

// 主数据库连接配置
const mainSequelize = new Sequelize('mysql', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function updateAllTenantAIModels() {
  try {
    console.log('🔍 更新所有租户数据库中的AI模型配置...\n');

    // 连接主数据库
    await mainSequelize.authenticate();

    // 获取所有数据库列表
    const [databases] = await mainSequelize.query('SHOW DATABASES');
    const dbList = databases.map(row => Object.values(row)[0]);

    // 查找tenant开头的数据库
    const tenantDatabases = dbList.filter(db =>
      db.toLowerCase().startsWith('tenant') ||
      db.toLowerCase().startsWith('rent')
    );

    console.log(`🎯 找到 ${tenantDatabases.length} 个租户数据库`);

    let updatedCount = 0;
    let skipCount = 0;

    // 遍历每个租户数据库
    for (const dbName of tenantDatabases.slice(0, 5)) { // 限制前5个进行测试
      console.log(`\n🔧 处理租户数据库: ${dbName}`);

      try {
        // 连接到租户数据库
        const tenantSequelize = new Sequelize(dbName, 'root', 'pwk5ls7j', {
          host: 'dbconn.sealoshzh.site',
          port: 43906,
          dialect: 'mysql',
          logging: false,
          timeout: 5000
        });

        await tenantSequelize.authenticate();
        console.log(`  ✅ 成功连接到 ${dbName}`);

        // 检查是否有ai_model_config表
        const [tables] = await tenantSequelize.query("SHOW TABLES LIKE '%model%'");
        const tableList = tables.map(row => Object.values(row)[0]);

        if (tableList.includes('ai_model_config')) {
          // 检查现有的文生图模型
          const [models] = await tenantSequelize.query(`
            SELECT name, display_name, provider, model_type, is_default
            FROM ai_model_config
            WHERE model_type = 'image' AND provider LIKE '%doubao%'
            ORDER BY is_default DESC, name
          `);

          console.log(`  📋 ${dbName} 中的豆包文生图模型: ${models.length}个`);

          let hasNewModel = false;
          models.forEach((model, index) => {
            console.log(`    - ${model.name} (${model.is_default ? '默认' : '非默认'})`);
            if (model.name === 'doubao-seedream-4-5-251128') {
              hasNewModel = true;
            }
          });

          if (!hasNewModel) {
            console.log(`  ➕ 添加新模型到 ${dbName}...`);

            // 添加新模型配置
            await tenantSequelize.query(`
              INSERT INTO ai_model_config (
                name, display_name, provider, model_type, api_version,
                endpoint_url, api_key, model_parameters, is_default,
                status, description, capabilities, max_tokens,
                created_at, updated_at
              ) VALUES (
                'doubao-seedream-4-5-251128',
                'Doubao SeedDream 4.5 (文生图升级版)',
                'bytedance_doubao',
                'image',
                'v3',
                'https://ark.cn-beijing.volces.com/api/v3/images/generations',
                'ffb6e528-e998-4ebf-b601-38a8a33c2365',
                JSON_OBJECT(
                  'temperature', 0.7,
                  'max_tokens', 14400,
                  'top_p', 0.9,
                  'frequency_penalty', 0,
                  'presence_penalty', 0,
                  'supports_tools', false,
                  'supports_multimodal', true,
                  'supports_images', true,
                  'model_id', '251128',
                  'quality', 'high',
                  'style', 'natural',
                  'min_pixels', 3686400,
                  'default_size', '1920x1920'
                ),
                1,
                'active',
                '豆包 SeedDream 4.5 文生图模型，升级版图片生成能力',
                JSON_OBJECT(
                  'text_to_image', true,
                  'image_quality', 'ultra_high',
                  'styles', JSON_ARRAY('natural', 'cartoon', 'realistic', 'artistic')
                ),
                14400,
                NOW(),
                NOW()
              )
            `);

            console.log(`    ✅ 成功添加新模型到 ${dbName}`);
            updatedCount++;
          }

          // 更新旧模型为非默认
          await tenantSequelize.query(`
            UPDATE ai_model_config
            SET is_default = 0, updated_at = NOW()
            WHERE name = 'doubao-seedream-3-0-t2i-250415'
          `);

          // 确保新模型为默认
          await tenantSequelize.query(`
            UPDATE ai_model_config
            SET is_default = 1, updated_at = NOW()
            WHERE name = 'doubao-seedream-4-5-251128'
          `);

          console.log(`  ✅ 已更新 ${dbName} 中的模型默认设置`);

        } else {
          console.log(`  ⚠️  ${dbName} 中未找到 ai_model_config 表`);
          skipCount++;
        }

        await tenantSequelize.close();

      } catch (error) {
        console.error(`  ❌ 处理 ${dbName} 失败:`, error.message);
        skipCount++;
      }
    }

    console.log(`\n📊 更新统计:`);
    console.log(`  ✅ 已更新: ${updatedCount} 个租户数据库`);
    console.log(`  ⚠️  跳过: ${skipCount} 个租户数据库`);
    console.log(`  📋 总计: ${Math.min(5, tenantDatabases.length)} 个租户数据库 (限制处理数量)`);

    console.log('\n🎉 租户数据库AI模型更新完成！');

  } catch (error) {
    console.error('❌ 更新失败:', error.message);
  } finally {
    await mainSequelize.close();
    process.exit(0);
  }
}

// 运行更新
updateAllTenantAIModels();