/**
 * 显示API密钥详细信息（仅前6位和后6位）
 * 用于调试和验证配置
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    ssl: {
      rejectUnauthorized: false
    }
  }
);

// AI模型配置表定义
const AIModelConfig = sequelize.define('AIModelConfig', {
  id: DataTypes.INTEGER,
  name: DataTypes.STRING(100),
  displayName: DataTypes.STRING(200),
  provider: DataTypes.STRING(50),
  endpointUrl: DataTypes.STRING(500),
  apiKey: DataTypes.TEXT,
  isDefault: DataTypes.BOOLEAN,
  status: DataTypes.STRING(20)
}, {
  tableName: 'ai_model_configs',
  timestamps: false
});

async function showApiKeyDetails() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 API密钥详细信息（脱敏显示）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await sequelize.authenticate();

    const models = await AIModelConfig.findAll({
      where: { status: 'active' },
      attributes: ['name', 'displayName', 'provider', 'apiKey', 'isDefault'],
      order: [['isDefault', 'DESC']]
    });

    console.log(`找到 ${models.length} 个活跃模型:`);

    models.forEach(model => {
      console.log('\n───────────────────────────────────────────────────');
      console.log(`🤖 ${model.displayName}`);
      console.log(`   模型名: ${model.name}`);
      console.log(`   提供商: ${model.provider}`);
      console.log(`   是否默认: ${model.isDefault ? '✅' : '❌'}`);

      if (model.apiKey) {
        const keyLength = model.apiKey.length;
        const startsWithArk = model.apiKey.startsWith('ark-');
        const preview = keyLength > 20 ?
          model.apiKey.substring(0, 6) + '...' + model.apiKey.substring(keyLength - 6) :
          model.apiKey;

        console.log(`   密钥长度: ${keyLength} 字符`);
        console.log(`   密钥格式: ${startsWithArk ? '✅ ark-开头' : '❌ 非ark开头'}`);
        console.log(`   密钥预览: ${preview}`);

        // 有效性评估
        let isValid = false;
        let assessment = '';

        if (startsWithArk && keyLength >= 30) {
          isValid = true;
          assessment = '✅ 格式正确';
        } else if (startsWithArk && keyLength < 30) {
          assessment = '⚠️ 长度不足，可能不完整';
        } else if (model.apiKey === 'your-doubao-api-key-here') {
          assessment = '❌ 未配置，还是占位符';
        } else {
          assessment = '❌ 格式错误，应为ark-开头';
        }

        console.log(`   有效性: ${assessment}`);
      } else {
        console.log('   密钥状态: ❌ 未配置');
      }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 豆包API密钥格式要求:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. 必须以 "ark-" 开头');
    console.log('2. 总长度通常在 30-50 字符');
    console.log('3. 示例格式: ark-xxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('4. 需要从火山引擎控制台获取有效密钥');

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

// 执行显示
if (require.main === module) {
  showApiKeyDetails();
}