/**
 * 检查admin开头的数据库并更新其中的aimodel配置
 */

const { Sequelize } = require('sequelize');

// 主数据库连接配置
const mainSequelize = new Sequelize('mysql', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function checkAndUpdateAdminDatabases() {
  try {
    console.log('🔍 检查admin开头的数据库...\n');

    // 连接主数据库
    await mainSequelize.authenticate();
    console.log('✅ 主数据库连接成功\n');

    // 获取所有数据库列表
    const [databases] = await mainSequelize.query('SHOW DATABASES');

    console.log('📋 数据库列表:');
    const dbList = databases.map(row => Object.values(row)[0]);
    dbList.forEach(db => console.log(`  - ${db}`));

    // 查找admin开头的数据库
    const adminDatabases = dbList.filter(db => db.toLowerCase().startsWith('admin'));

    console.log(`\n🎯 找到 ${adminDatabases.length} 个admin开头的数据库:`);
    adminDatabases.forEach(db => console.log(`  - ${db}`));

    if (adminDatabases.length === 0) {
      console.log('❌ 未找到admin开头的数据库');
      return;
    }

    // 遍历每个admin数据库
    for (const dbName of adminDatabases) {
      console.log(`\n🔧 处理数据库: ${dbName}`);

      try {
        // 连接到admin数据库
        const adminSequelize = new Sequelize(dbName, 'root', 'pwk5ls7j', {
          host: 'dbconn.sealoshzh.site',
          port: 43906,
          dialect: 'mysql',
          logging: false // 减少日志输出
        });

        await adminSequelize.authenticate();
        console.log(`  ✅ 成功连接到 ${dbName}`);

        // 检查是否有ai_model_config表
        const [tables] = await adminSequelize.query("SHOW TABLES LIKE '%model%'");
        const tableList = tables.map(row => Object.values(row)[0]);

        console.log(`  📋 相关表: ${tableList.join(', ')}`);

        if (tableList.includes('ai_model_config')) {
          console.log(`  🎯 找到 ai_model_config 表，开始更新...`);

          // 检查现有的文生图模型
          const [models] = await adminSequelize.query(`
            SELECT name, display_name, provider, model_type, is_default, model_parameters
            FROM ai_model_config
            WHERE model_type = 'image' AND provider LIKE '%doubao%'
            ORDER BY is_default DESC, name
          `);

          console.log(`  📋 ${dbName} 中的豆包文生图模型:`);

          let hasNewModel = false;
          models.forEach((model, index) => {
            console.log(`    模型 ${index + 1}: ${model.name} (${model.display_name}) - 默认: ${model.is_default ? '是' : '否'}`);

            if (model.name === 'doubao-seedream-4-5-251128') {
              hasNewModel = true;
            }
          });

          if (!hasNewModel) {
            console.log(`  ➕ 添加新模型 doubao-seedream-4-5-251128 到 ${dbName}...`);

            // 添加新模型配置
            const [insertResult] = await adminSequelize.query(`
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
                  'styles', JSON_ARRAY('natural', 'cartoon', 'realistic', 'artistic'),
                  'sizes', JSON_ARRAY('1920x1920', '2048x2048', '1024x2048', '2048x1024')
                ),
                14400,
                NOW(),
                NOW()
              )
            `);

            console.log(`    ✅ 成功添加新模型到 ${dbName}`);
          } else {
            console.log(`  ✅ ${dbName} 中已存在新模型`);
          }

          // 更新旧模型为非默认
          await adminSequelize.query(`
            UPDATE ai_model_config
            SET is_default = 0, updated_at = NOW()
            WHERE name = 'doubao-seedream-3-0-t2i-250415'
          `);

          // 确保新模型为默认
          await adminSequelize.query(`
            UPDATE ai_model_config
            SET is_default = 1, updated_at = NOW()
            WHERE name = 'doubao-seedream-4-5-251128'
          `);

          console.log(`  ✅ 已更新 ${dbName} 中的模型默认设置`);
        } else {
          console.log(`  ⚠️  ${dbName} 中未找到 ai_model_config 表`);
        }

        await adminSequelize.close();
        console.log(`  ✅ 已断开 ${dbName} 连接`);

      } catch (error) {
        console.error(`  ❌ 处理 ${dbName} 失败:`, error.message);
      }
    }

    console.log('\n🎉 所有admin数据库检查和更新完成！');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await mainSequelize.close();
    process.exit(0);
  }
}

// 运行检查和更新
checkAndUpdateAdminDatabases();