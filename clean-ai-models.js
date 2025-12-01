const mysql = require('mysql2/promise');

async function cleanAIModels() {
  let connection = null;

  try {
    // 连接到目标数据库 (admin_tenant_management)
    console.log('🎯 连接到 admin_tenant_management 数据库...');
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'admin_tenant_management'
    });

    console.log('✅ 数据库连接成功');

    // 查看当前所有模型
    console.log('\n📋 查看当前所有模型...');
    const [allModels] = await connection.execute('SELECT id, name, provider, model_type, status FROM ai_model_config ORDER BY id ASC');

    console.log('\n🎯 当前所有模型:');
    allModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name} (${model.provider} - ${model.model_type}) - ${model.status}`);
    });

    // 找出需要删除的非豆包模型
    const nonDoubaoModels = allModels.filter(model => {
      // 检查provider是否包含豆包相关关键词
      const isDoubaoRelated = model.provider && (
        model.provider.toLowerCase().includes('bytedance') ||
        model.provider.toLowerCase().includes('doubao') ||
        model.provider.toLowerCase().includes('volcengine') || // 火山引擎也属于豆包生态
        model.provider === 'ByteDance' // 保留ByteDance
      );
      return !isDoubaoRelated;
    });

    console.log(`\n🗑️ 需要删除的非豆包模型 (${nonDoubaoModels.length}个):`);
    nonDoubaoModels.forEach(model => {
      console.log(`  - ${model.name} (${model.provider})`);
    });

    // 保留豆包相关模型
    const doubaoModels = allModels.filter(model => {
      const isDoubaoRelated = model.provider && (
        model.provider.toLowerCase().includes('bytedance') ||
        model.provider.toLowerCase().includes('doubao') ||
        model.provider.toLowerCase().includes('volcengine') ||
        model.provider === 'ByteDance'
      );
      return isDoubaoRelated;
    });

    console.log(`\n✅ 保留的豆包相关模型 (${doubaoModels.length}个):`);
    doubaoModels.forEach(model => {
      console.log(`  - ${model.name} (${model.provider} - ${model.model_type})`);
    });

    if (nonDoubaoModels.length === 0) {
      console.log('\n✅ 没有需要删除的模型');
      return;
    }

    // 删除非豆包模型
    console.log('\n🗑️ 开始删除非豆包模型...');

    let deletedCount = 0;
    for (const model of nonDoubaoModels) {
      try {
        const [result] = await connection.execute(
          'DELETE FROM ai_model_config WHERE id = ?',
          [model.id]
        );

        if (result.affectedRows > 0) {
          console.log(`✅ 已删除: ${model.name} (${model.provider})`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`❌ 删除模型 ${model.name} 时出错:`, error);
      }
    }

    // 重新查询确认结果
    console.log('\n📋 删除后的模型列表:');
    const [remainingModels] = await connection.execute('SELECT id, name, provider, model_type, status, is_default FROM ai_model_config ORDER BY id ASC');

    console.log(`\n🎯 剩余模型 (${remainingModels.length}个):`);
    remainingModels.forEach((model, index) => {
      const defaultFlag = model.is_default ? ' ⭐默认' : '';
      console.log(`${index + 1}. ${model.name} (${model.provider} - ${model.model_type}) - ${model.status}${defaultFlag}`);
    });

    // 检查默认模型
    const defaultModels = remainingModels.filter(model => model.is_default === 1);
    console.log(`\n🎯 默认模型 (${defaultModels.length}个):`);
    defaultModels.forEach(model => {
      console.log(`  - ${model.name} (${model.model_type})`);
    });

    // 按类型统计
    console.log('\n📊 删除后统计:');
    const typeStats = {};
    remainingModels.forEach(model => {
      typeStats[model.model_type] = (typeStats[model.model_type] || 0) + 1;
    });

    console.log('按类型统计:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}个`);
    });

    console.log(`\n✅ 清理完成！删除了 ${deletedCount} 个非豆包模型，保留了 ${remainingModels.length} 个豆包相关模型`);

  } catch (error) {
    console.error('❌ 清理过程中出错:', error);
  } finally {
    // 关闭数据库连接
    if (connection) {
      await connection.end();
    }
  }
}

cleanAIModels();