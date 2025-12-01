const mysql = require('mysql2/promise');

async function debugAIBridge() {
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

    // 查询默认模型的查询条件
    console.log('\n📋 测试查询条件...');

    // 测试当前AI bridge的查询条件
    console.log('\n🔍 当前AI bridge的查询条件:');
    console.log('  isDefault = true AND status = "active"');

    const [currentQuery] = await connection.execute(
      "SELECT id, name, is_default, status FROM ai_model_config WHERE is_default = ? AND status = ?",
      [1, 'active']
    );

    console.log(`查询结果: ${currentQuery.length}个模型`);
    currentQuery.forEach(model => {
      console.log(`  - ${model.name} (is_default=${model.is_default}, status=${model.status})`);
    });

    // 测试可能的修复方案
    console.log('\n🔍 测试修复方案 - 使用数字状态:');
    const [numericStatusQuery] = await connection.execute(
      "SELECT id, name, is_default, status FROM ai_model_config WHERE is_default = ?",
      [1]
    );

    console.log(`查询结果: ${numericStatusQuery.length}个模型`);
    numericStatusQuery.forEach(model => {
      console.log(`  - ${model.name} (is_default=${model.is_default}, status=${model.status})`);
    });

    // 检查status字段的所有值
    console.log('\n📊 status字段的所有值:');
    const [statusValues] = await connection.execute(
      "SELECT DISTINCT status, COUNT(*) as count FROM ai_model_config GROUP BY status"
    );

    statusValues.forEach(row => {
      console.log(`  - ${row.status}: ${row.count}个`);
    });

    // 检查is_default字段的所有值
    console.log('\n📊 is_default字段的所有值:');
    const [defaultValues] = await connection.execute(
      "SELECT DISTINCT is_default, COUNT(*) as count FROM ai_model_config GROUP BY is_default"
    );

    defaultValues.forEach(row => {
      console.log(`  - ${row.is_default}: ${row.count}个`);
    });

    // 模拟AI bridge的查询逻辑
    console.log('\n🧪 模拟AI bridge查询逻辑...');

    const activeModelTypes = ['active', 'Active', 'ACTIVE'];
    let foundModel = null;

    for (const statusValue of activeModelTypes) {
      const [testQuery] = await connection.execute(
        "SELECT id, name, provider, status FROM ai_model_config WHERE is_default = ? AND status = ? LIMIT 1",
        [1, statusValue]
      );

      if (testQuery.length > 0) {
        foundModel = testQuery[0];
        console.log(`✅ 找到匹配模型 (status="${statusValue}"):`, foundModel);
        break;
      } else {
        console.log(`❌ 无匹配结果 (status="${statusValue}")`);
      }
    }

    if (!foundModel) {
      console.log('\n⚠️  没有找到任何匹配的默认模型！');

      // 尝试只按is_default查询
      const [fallbackQuery] = await connection.execute(
        "SELECT id, name, provider, status FROM ai_model_config WHERE is_default = ? LIMIT 1",
        [1]
      );

      if (fallbackQuery.length > 0) {
        console.log('🔄 备选方案 - 只按is_default查询:', fallbackQuery[0]);
      }
    }

  } catch (error) {
    console.error('❌ 调试过程中出错:', error);
  } finally {
    // 关闭数据库连接
    if (connection) {
      await connection.end();
    }
  }
}

debugAIBridge();