/**
 * 检查远端数据库中的aibridge配置
 * 验证API密钥和模型配置是否正确存储在数据库中
 */

require('dotenv').config();
const { Sequelize, DataTypes, Op } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // 减少日志输出
    ssl: {
      rejectUnauthorized: false // 忽略SSL证书验证
    }
  }
);

// AI模型配置表定义
const AIModelConfig = sequelize.define('AIModelConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING(100),
  displayName: DataTypes.STRING(200),
  provider: DataTypes.STRING(50),
  modelType: DataTypes.STRING(20),
  endpointUrl: DataTypes.STRING(500),
  apiKey: DataTypes.TEXT,
  modelParameters: DataTypes.JSON,
  isDefault: DataTypes.BOOLEAN,
  status: DataTypes.ENUM('active', 'inactive', 'deprecated'),
  description: DataTypes.TEXT,
  capabilities: DataTypes.JSON,
  maxTokens: DataTypes.INTEGER,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  tableName: 'ai_model_configs',
  timestamps: true,
  paranoid: true
});

async function checkAIBridgeConfig() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 检查远端数据库中的aibridge配置');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 查询所有活跃的模型配置
    const allModels = await AIModelConfig.findAll({
      where: {
        status: 'active'
      },
      attributes: ['id', 'name', 'displayName', 'provider', 'endpointUrl', 'apiKey', 'isDefault', 'status', 'maxTokens'],
      order: [['isDefault', 'DESC'], ['createdAt', 'ASC']]
    });

    console.log(`📊 找到 ${allModels.length} 个活跃的AI模型配置:`);

    allModels.forEach(model => {
      console.log('\n───────────────────────────────────────────────────');
      console.log(`🤖 模型: ${model.displayName} (${model.name})`);
      console.log(`🏢 提供商: ${model.provider}`);
      console.log(`🔗 端点: ${model.endpointUrl}`);
      console.log(`🔑 API密钥: ${model.apiKey ?
        (model.apiKey.startsWith('ark-') ? '✅ 有效格式(ark开头)' : '⚠️ 格式可能不正确') +
        ` [长度:${model.apiKey.length}]` : '❌ 未配置'}`);
      console.log(`⭐ 默认模型: ${model.isDefault ? '✅ 是' : '❌ 否'}`);
      console.log(`📏 最大令牌: ${model.maxTokens || '未设置'}`);
      console.log(`📊 状态: ${model.status}`);
    });

    // 特别检查doubao相关模型
    const doubaoModels = allModels.filter(model =>
      model.provider === 'doubao' ||
      model.name.includes('doubao') ||
      model.name.includes('flash')
    );

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 Doubao/Flash模型专项检查:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (doubaoModels.length === 0) {
      console.log('❌ 未找到任何doubao或flash模型配置');
    } else {
      doubaoModels.forEach(model => {
        console.log('\n🔍 模型详情:');
        console.log(`  - 名称: ${model.name}`);
        console.log(`  - 显示名: ${model.displayName}`);
        console.log(`  - API密钥: ${model.apiKey ?
          (model.apiKey.length > 20 ? '✅ 已配置[长度:' + model.apiKey.length + ']' : '⚠️ 密钥过短') : '❌ 缺失'}`);
        console.log(`  - 端点URL: ${model.endpointUrl}`);
        console.log(`  - 是否默认: ${model.isDefault ? '✅' : '❌'}`);
      });
    }

    // 检查默认模型
    const defaultModel = allModels.find(model => model.isDefault);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 默认模型检查:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!defaultModel) {
      console.log('⚠️ 未设置默认模型');
      console.log('💡 建议: 将doubao flash模型设为默认模型');
    } else {
      console.log(`✅ 默认模型: ${defaultModel.displayName} (${defaultModel.name})`);
      console.log(`   API密钥: ${defaultModel.apiKey ?
        (defaultModel.apiKey.startsWith('ark-') ? '✅ 格式正确' : '⚠️ 格式检查') : '❌ 缺失'}`);
    }

    // 配置建议
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 配置建议:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (doubaoModels.length === 0) {
      console.log('1. 需要添加doubao flash模型配置到数据库');
      console.log('2. 模型名称: doubao-seed-1-6-flash-250715');
      console.log('3. 端点URL: https://ark.cn-beijing.volces.com/api/v3');
      console.log('4. API密钥: ark-开头的有效密钥');
    } else {
      const invalidApiKey = doubaoModels.find(m => !m.apiKey || !m.apiKey.startsWith('ark-'));
      if (invalidApiKey) {
        console.log('1. 需要更新API密钥格式，应以ark-开头');
      }

      const noDefault = doubaoModels.filter(m => !m.isDefault);
      if (noDefault.length > 0 && !defaultModel) {
        console.log('2. 建议将doubao flash模型设为默认模型');
      }
    }

    console.log('\n🎉 配置检查完成！');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);

    if (error.message.includes('SSL')) {
      console.log('💡 SSL错误解决: 数据库连接需要SSL配置调整');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('💡 连接错误: 检查数据库主机和端口配置');
    } else {
      console.log('💡 其他错误: 检查数据库凭据和权限');
    }

    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行检查
if (require.main === module) {
  checkAIBridgeConfig();
}

module.exports = { checkAIBridgeConfig };