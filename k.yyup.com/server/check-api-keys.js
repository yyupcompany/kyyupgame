/**
 * 检查数据库中的API密钥配置
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkApiKeys() {
  let connection;

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 检查数据库中的API密钥配置');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 数据库连接
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

    // 查询AI模型配置
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
        maxTokens
      FROM ai_model_configs
      WHERE status = 'active' AND deletedAt IS NULL
      ORDER BY isDefault DESC, createdAt ASC
    `);

    console.log(`📊 找到 ${rows.length} 个活跃的AI模型配置:`);

    rows.forEach(model => {
      console.log('\n───────────────────────────────────────────────────');
      console.log(`🤖 ${model.displayName} (${model.name})`);
      console.log(`🏢 提供商: ${model.provider}`);
      console.log(`🔗 端点: ${model.endpointUrl}`);
      console.log(`⭐ 默认模型: ${model.isDefault ? '✅ 是' : '❌ 否'}`);
      console.log(`📏 最大令牌: ${model.maxTokens || '未设置'}`);

      if (model.apiKey) {
        const keyLength = model.apiKey.length;
        const startsWithArk = model.apiKey.startsWith('ark-');
        const isPlaceholder = model.apiKey.includes('your-doubao-api-key-here');

        // 脱敏显示
        const maskedKey = keyLength > 12 ?
          model.apiKey.substring(0, 6) + '...' + model.apiKey.substring(keyLength - 6) :
          model.apiKey;

        console.log(`🔑 API密钥: ${maskedKey}`);
        console.log(`   长度: ${keyLength} 字符`);
        console.log(`   格式: ${startsWithArk ? '✅ ark-开头' : '❌ 非ark开头'}`);
        console.log(`   状态: ${isPlaceholder ? '❌ 占位符' : '✅ 已配置'}`);

        // 评估有效性
        let validity = '❌ 无效';
        if (isPlaceholder) {
          validity = '❌ 需要配置真实API密钥';
        } else if (startsWithArk && keyLength >= 25) {
          validity = '✅ 格式正确';
        } else if (startsWithArk && keyLength < 25) {
          validity = '⚠️ 长度不足，可能不完整';
        } else {
          validity = '❌ 格式错误，应为ark-开头';
        }
        console.log(`   有效性: ${validity}`);
      } else {
        console.log('🔑 API密钥: ❌ 未配置');
      }
    });

    // 检查默认模型
    const defaultModel = rows.find(model => model.isDefault);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 默认模型检查:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!defaultModel) {
      console.log('⚠️ 未设置默认模型');
    } else {
      console.log(`✅ 默认模型: ${defaultModel.displayName}`);
      console.log(`   模型名: ${defaultModel.name}`);
      console.log(`   端点: ${defaultModel.endpointUrl}`);

      if (defaultModel.apiKey) {
        const isValid = defaultModel.apiKey.startsWith('ark-') &&
                       defaultModel.apiKey.length >= 25 &&
                       !defaultModel.apiKey.includes('your-doubao-api-key-here');
        console.log(`   API密钥: ${isValid ? '✅ 有效' : '❌ 需要检查'}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 配置建议:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (rows.some(model => model.apiKey && model.apiKey.includes('your-doubao-api-key-here'))) {
      console.log('1. ❌ 需要将占位符API密钥替换为真实的豆包API密钥');
      console.log('2. 真实API密钥格式应为: ark-xxxxxxxxxxxxxxxxxxxxxxxxxx');
      console.log('3. 需要从火山引擎控制台获取有效的API密钥');
    } else if (rows.some(model => model.apiKey && !model.apiKey.startsWith('ark-'))) {
      console.log('1. ⚠️ API密钥格式需要修正，应以ark-开头');
    } else {
      console.log('1. ✅ API密钥格式看起来正确');
      console.log('2. 可以尝试重新测试AI调用功能');
    }

    console.log('\n🎉 配置检查完成！');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('💡 数据库连接失败，请检查:');
      console.log('   - 数据库服务是否运行');
      console.log('   - 连接参数是否正确');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 访问被拒绝，请检查:');
      console.log('   - 数据库用户名和密码');
      console.log('   - 用户是否有访问权限');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行检查
if (require.main === module) {
  checkApiKeys();
}

module.exports = { checkApiKeys };