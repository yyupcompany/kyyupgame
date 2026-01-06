/**
 * 检查数据库中所有API密钥，寻找已配置的有效密钥
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkAllApiKeys() {
  let connection;

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 检查数据库中所有API密钥');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kargerdensales',
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ 数据库连接成功');

    // 查询所有模型配置（包括非doubao的）
    const [rows] = await connection.execute(`
      SELECT
        id,
        name,
        displayName,
        provider,
        endpointUrl,
        apiKey,
        isDefault,
        status,
        CASE
          WHEN apiKey IS NULL OR apiKey = '' THEN '未配置'
          WHEN apiKey LIKE 'your-%-here' THEN '占位符'
          WHEN LENGTH(apiKey) >= 30 THEN '完整配置'
          ELSE '配置中'
        END as configStatus
      FROM ai_model_configs
      WHERE deletedAt IS NULL
      ORDER BY
        CASE
          WHEN apiKey IS NOT NULL AND apiKey NOT LIKE 'your-%-here' AND LENGTH(apiKey) >= 30 THEN 1
          ELSE 2
        END,
        isDefault DESC,
        createdAt ASC
    `);

    console.log(`📊 找到 ${rows.length} 个模型配置:`);

    let validKeysFound = 0;
    let availableKeys = [];

    rows.forEach(model => {
      console.log('\n───────────────────────────────────────────────────');
      console.log(`🤖 ${model.displayName} (${model.name})`);
      console.log(`🏢 提供商: ${model.provider}`);
      console.log(`🔗 端点: ${model.endpointUrl}`);
      console.log(`⭐ 默认模型: ${model.isDefault ? '✅ 是' : '❌ 否'}`);
      console.log(`📊 状态: ${model.status}`);
      console.log(`⚙️ 配置状态: ${model.configStatus}`);

      if (model.apiKey && model.apiKey !== 'your-doubao-api-key-here') {
        const keyLength = model.apiKey.length;
        const startsWithArk = model.apiKey.startsWith('ark-');
        const isUuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(model.apiKey);
        const isCustomFormat = model.apiKey.length >= 30 && !model.apiKey.includes('your-');

        // 脱敏显示
        const maskedKey = keyLength > 12 ?
          model.apiKey.substring(0, 8) + '...' + model.apiKey.substring(keyLength - 8) :
          model.apiKey;

        console.log(`🔑 API密钥: ${maskedKey}`);
        console.log(`   长度: ${keyLength} 字符`);

        if (startsWithArk) {
          console.log(`   格式: ✅ ark-开头`);
        } else if (isUuidFormat) {
          console.log(`   格式: ✅ UUID格式`);
        } else if (isCustomFormat) {
          console.log(`   格式: ✅ 自定义格式`);
        } else {
          console.log(`   格式: ⚠️ 需要检查`);
        }

        // 评估是否为可用密钥
        let isUsable = false;
        if (model.provider === 'doubao' && (isUuidFormat || isCustomFormat) && keyLength >= 20) {
          isUsable = true;
          validKeysFound++;
          availableKeys.push({
            name: model.name,
            displayName: model.displayName,
            apiKey: model.apiKey,
            endpointUrl: model.endpointUrl
          });
          console.log(`   可用性: ✅ 可用`);
        } else if (model.provider === 'doubao' && startsWithArk && keyLength >= 25) {
          isUsable = true;
          validKeysFound++;
          availableKeys.push({
            name: model.name,
            displayName: model.displayName,
            apiKey: model.apiKey,
            endpointUrl: model.endpointUrl
          });
          console.log(`   可用性: ✅ 可用`);
        } else {
          console.log(`   可用性: ❌ 需要检查`);
        }
      } else {
        console.log(`🔑 API密钥: ${model.apiKey ? '❌ 占位符' : '❌ 未配置'}`);
      }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 密钥统计:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ 找到 ${validKeysFound} 个可用的API密钥`);

    if (validKeysFound > 0) {
      console.log('\n💡 建议操作:');
      console.log('1. 可以使用现有可用的API密钥');
      console.log('2. 将可用密钥复制到doubao flash模型配置');

      // 显示可用的密钥选项
      console.log('\n🔑 可用的API密钥选项:');
      availableKeys.forEach((key, index) => {
        console.log(`\n${index + 1}. ${key.displayName}`);
        console.log(`   模型名: ${key.name}`);
        console.log(`   密钥预览: ${key.apiKey.substring(0, 12)}...${key.apiKey.substring(key.apiKey.length - 8)}`);
        console.log(`   端点: ${key.endpointUrl}`);
      });

      // 提供SQL更新语句
      if (availableKeys.length > 0) {
        const firstAvailableKey = availableKeys[0];
        console.log('\n📝 更新doubao flash模型API密钥的SQL:');
        console.log(`UPDATE ai_model_configs`);
        console.log(`SET apiKey = '${firstAvailableKey.apiKey}'`);
        console.log(`WHERE name = 'doubao-seed-1-6-flash-250715';`);
      }
    } else {
      console.log('\n❌ 未找到可用的API密钥');
      console.log('💡 建议:');
      console.log('1. 需要添加有效的豆包API密钥');
      console.log('2. 密钥格式可以是UUID格式或ark-开头');
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行检查
if (require.main === module) {
  checkAllApiKeys();
}

module.exports = { checkAllApiKeys };