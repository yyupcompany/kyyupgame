/**
 * 验证AI模型配置数据库连接
 */

const { Sequelize, DataTypes } = require('sequelize');

// 创建数据库连接
const sequelize = new Sequelize({
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'kargerdensales',
  username: 'root',
  password: 'pwk5ls7j',
  dialect: 'mysql',
  logging: false
});

// 定义AI模型配置模型（修复后的版本）
const AIModelConfig = sequelize.define('AIModelConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'display_name'
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'doubao'
  },
  modelType: {
    type: DataTypes.STRING,
    defaultValue: 'text',
    field: 'model_type'
  },
  endpointUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'endpoint_url'
  },
  apiKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'api_key'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'deprecated'),
    defaultValue: 'active',
    field: 'status'
  }
}, {
  tableName: 'ai_model_config',
  timestamps: true,
  underscored: true
});

async function verifyDatabaseConfig() {
  try {
    console.log('🔗 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    console.log('📋 查询活跃的AI模型配置...');
    const models = await AIModelConfig.findAll({
      where: {
        status: 'active'
      },
      order: [
        ['isDefault', 'DESC'],
        ['name', 'ASC']
      ]
    });

    console.log(`📦 找到 ${models.length} 个活跃模型:\n`);

    if (models.length === 0) {
      console.log('⚠️  警告: 没有找到活跃的AI模型配置！');
      console.log('💡 建议: 运行种子数据脚本添加豆包模型配置');
      return;
    }

    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.displayName || model.name}`);
      console.log(`   模型名称: ${model.name}`);
      console.log(`   提供商: ${model.provider}`);
      console.log(`   类型: ${model.modelType || 'N/A'}`);
      console.log(`   端点: ${model.endpointUrl || 'N/A'}`);
      console.log(`   默认: ${model.isDefault ? '✅ 是' : '❌ 否'}`);
      console.log('');
    });

    // 统计提供商分布
    const providers = {};
    models.forEach(m => {
      providers[m.provider] = (providers[m.provider] || 0) + 1;
    });

    console.log('📊 提供商分布:');
    Object.entries(providers).forEach(([provider, count]) => {
      console.log(`   ${provider}: ${count} 个`);
    });

    // 检查默认模型
    const defaultModel = models.find(m => m.isDefault);
    if (defaultModel) {
      console.log(`\n✅ 默认模型: ${defaultModel.name} (${defaultModel.displayName})`);
    } else {
      console.log('\n⚠️  警告: 没有设置默认模型！');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error('\n详细信息:');
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// 执行验证
verifyDatabaseConfig()
  .then(() => {
    console.log('\n✅ 验证完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 验证失败:', error);
    process.exit(1);
  });
