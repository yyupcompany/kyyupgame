const mysql = require('mysql2/promise');

// 从 kargerdensales 数据库读取AI模型配置并插入到 admin_tenant_management 数据库

async function copyAIModelsToAdminDB() {
  let sourceConnection = null;
  let targetConnection = null;

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

    // 连接到目标数据库 (admin_tenant_management)
    console.log('🎯 连接到目标数据库 admin_tenant_management...');
    targetConnection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'admin_tenant_management'
    });

    console.log('✅ 数据库连接成功');

    // 读取源数据库中的AI模型配置
    console.log('📋 从 kargerdensales 读取 AI 模型配置...');
    const [rows] = await sourceConnection.execute('SELECT * FROM ai_model_config ORDER BY created_at ASC');

    if (rows.length === 0) {
      console.log('❌ 源数据库中没有找到 AI 模型配置');
      return;
    }

    console.log(`📋 读取到 ${rows.length} 个 AI 模型配置`);

    // 先清空目标数据库中的AI模型配置（避免重复）
    console.log('🗑️ 清空目标数据库中的现有配置...');
    await targetConnection.execute('DELETE FROM ai_model_config');
    console.log('✅ 目标数据库已清空');

    // 插入所有模型配置到目标数据库
    console.log('📤 开始插入模型配置到目标数据库...');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const row of rows) {
      try {
        // 检查是否已存在
        const [existing] = await targetConnection.execute(
          'SELECT id FROM ai_model_config WHERE name = ?',
          [row.name]
        );

        if (existing.length > 0) {
          // 更新现有记录
          const params = row.model_parameters ? JSON.stringify(row.model_parameters).replace(/'/g, "''") : null;
          const capabilities = row.capabilities ? JSON.stringify(row.capabilities).replace(/'/g, "''") : null;

          await targetConnection.execute(
            `UPDATE ai_model_config SET
              display_name = ?, provider = ?, model_type = ?, api_version = ?, endpoint_url = ?, api_key = ?,
              model_parameters = ?, is_default = ?, status = ?, description = ?, capabilities = ?, max_tokens = ?,
              updated_at = ?
            WHERE name = ?`,
            [
              row.display_name,
              row.provider,
              row.model_type,
              row.api_version,
              row.endpoint_url,
              row.api_key,
              params,
              row.is_default,
              row.status,
              row.description ? row.description.replace(/'/g, "''") : null,
              capabilities,
              row.max_tokens,
              new Date(),
              row.name
            ]
          );
          updatedCount++;
          console.log(`🔄 更新模型: ${row.name}`);
        } else {
          // 插入新记录
          const params = row.model_parameters ? JSON.stringify(row.model_parameters).replace(/'/g, "''") : null;
          const capabilities = row.capabilities ? JSON.stringify(row.capabilities).replace(/'/g, "''") : null;

          await targetConnection.execute(
            `INSERT INTO ai_model_config (
              name, display_name, provider, model_type, api_version, endpoint_url, api_key,
              model_parameters, is_default, status, description, capabilities, max_tokens,
              creator_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              row.name,
              row.display_name,
              row.provider,
              row.model_type,
              row.api_version,
              row.endpoint_url,
              row.api_key,
              params,
              row.is_default,
              row.status,
              row.description ? row.description.replace(/'/g, "''") : null,
              capabilities,
              row.max_tokens,
              row.creator_id,
              row.created_at,
              row.updated_at
            ]
          );
          insertedCount++;
          console.log(`➕ 插入模型: ${row.name}`);
        }
      } catch (error) {
        console.error(`❌ 处理模型 ${row.name} 时出错:`, error);
      }
    }

    // 查询插入结果
    const [targetRows] = await targetConnection.execute('SELECT * FROM ai_model_config ORDER BY created_at ASC');

    console.log(`\n📊 迁移结果统计:`);
    console.log(`- 总插入: ${insertedCount} 个`);
    console.log(`- 总更新: ${updatedCount} 个`);
    console.log(`- 目标数据库总计: ${targetRows.length} 个`);

    // 显示迁移后的模型列表
    console.log('\n📋 迁移后的AI模型列表:');
    targetRows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} (${row.provider}) - ${row.status}`);
    });

    console.log('\n✅ AI模型配置迁移完成！');

    // 检查是否有默认模型
    const [defaultModel] = await targetConnection.execute(
      'SELECT * FROM ai_model_config WHERE is_default = 1 AND status = "active"'
    );

    if (defaultModel.length > 0) {
      console.log(`✅ 发现默认模型: ${defaultModel[0].name} (${defaultModel[0].display_name})`);
    } else {
      console.log('⚠️  警告: 没有找到默认模型，建议设置一个为默认模型');

      // 设置第一个活跃模型为默认模型
      const [firstActive] = await targetConnection.execute(
        'SELECT * FROM ai_model_config WHERE status = "active" ORDER BY created_at ASC LIMIT 1'
      );

      if (firstActive.length > 0) {
        await targetConnection.execute(
          'UPDATE ai_model_config SET is_default = 1 WHERE id = ?',
          [firstActive[0].id]
        );
        console.log(`🎯 设置默认模型: ${firstActive[0].name}`);
      }
    }

  } catch (error) {
    console.error('❌ 迁移过程中出错:', error);
  } finally {
    // 关闭数据库连接
    if (sourceConnection) {
      await sourceConnection.end();
    }
    if (targetConnection) {
      await targetConnection.end();
    }
  }
}

// 执行迁移
copyAIModelsToAdminDB().then(() => {
  console.log('🎉 AI模型配置迁移任务完成！');
}).catch((error) => {
  console.error('❌ 迁移任务失败:', error);
});