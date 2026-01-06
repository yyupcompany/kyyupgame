const { Sequelize, DataTypes } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kindergarten_management', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

// 定义AIModelConfig模型
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
    field: 'display_name'
  },
  provider: DataTypes.STRING,
  modelType: {
    type: DataTypes.STRING,
    field: 'model_type'
  },
  apiVersion: {
    type: DataTypes.STRING,
    field: 'api_version'
  },
  endpointUrl: {
    type: DataTypes.STRING,
    field: 'endpoint_url'
  },
  apiKey: {
    type: DataTypes.TEXT,
    field: 'api_key'
  },
  modelParameters: {
    type: DataTypes.JSON,
    field: 'model_parameters'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    field: 'is_default'
  },
  status: DataTypes.STRING,
  description: DataTypes.TEXT,
  capabilities: DataTypes.JSON,
  maxTokens: {
    type: DataTypes.INTEGER,
    field: 'max_tokens'
  },
  creatorId: {
    type: DataTypes.INTEGER,
    field: 'creator_id'
  }
}, {
  tableName: 'ai_model_config',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

async function checkApiKey() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    const searchModel = await AIModelConfig.findOne({
      where: {
        name: 'volcano-fusion-search',
        status: 'active'
      }
    });

    if (searchModel) {
      console.log('🔍 找到搜索模型配置:');
      console.log('名称:', searchModel.name);
      console.log('端点URL:', searchModel.endpointUrl);
      console.log('API密钥:', searchModel.apiKey);
      console.log('状态:', searchModel.status);
    } else {
      console.log('❌ 未找到volcano-fusion-search配置');
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

checkApiKey();
