/**
 * 配置doubao 1.6 flash模型到数据库
 * 运行方式: node scripts/configure-doubao-model.js
 */

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// 数据库连接配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log
  }
);

// AI模型配置表结构
const AIModelConfig = sequelize.define('AIModelConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  displayName: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  provider: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'doubao'
  },
  modelType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'text'
  },
  endpointUrl: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  apiKey: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  modelParameters: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'deprecated'),
    defaultValue: 'active'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  capabilities: {
    type: DataTypes.JSON,
    allowNull: true
  },
  maxTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 8000
  },
  creatorId: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'ai_model_configs',
  timestamps: true,
  paranoid: true
});

async function configureDoubaoModels() {
  try {
    console.log('🚀 开始配置doubao模型...');

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 同步表结构
    await AIModelConfig.sync({ alter: true });
    console.log('✅ AI模型配置表同步完成');

    // 配置doubao 1.6 flash模型
    const flashModel = {
      name: 'doubao-seed-1-6-flash-250715',
      displayName: 'Doubao 1.6 Flash (高速推理)',
      provider: 'doubao',
      modelType: 'text',
      endpointUrl: process.env.AIBRIDGE_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
      apiKey: process.env.AIBRIDGE_API_KEY || '',
      modelParameters: {
        temperature: 0.3,
        maxTokens: 8000,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0
      },
      isDefault: true, // 设为默认模型
      status: 'active',
      description: '豆包1.6 Flash版本，高速推理模型，适合实时对话和快速响应场景',
      capabilities: ['text', 'chat', 'function-calling', 'streaming'],
      maxTokens: 8000
    };

    // 查找是否已存在
    const existingModel = await AIModelConfig.findOne({
      where: { name: flashModel.name }
    });

    if (existingModel) {
      // 更新现有配置
      await existingModel.update(flashModel);
      console.log(`✅ 更新模型配置: ${flashModel.displayName}`);
    } else {
      // 创建新配置
      await AIModelConfig.create(flashModel);
      console.log(`✅ 创建模型配置: ${flashModel.displayName}`);
    }

    // 配置doubao 1.6 thinking模型（如果需要）
    const thinkingModel = {
      name: 'doubao-seed-1-6-thinking-250615',
      displayName: 'Doubao 1.6 Thinking (深度思考)',
      provider: 'doubao',
      modelType: 'text',
      endpointUrl: process.env.AIBRIDGE_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
      apiKey: process.env.AIBRIDGE_API_KEY || '',
      modelParameters: {
        temperature: 0.7,
        maxTokens: 16000,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0
      },
      isDefault: false,
      status: 'active',
      description: '豆包1.6 Thinking版本，深度思考模型，适合复杂推理和分析场景',
      capabilities: ['text', 'chat', 'reasoning', 'function-calling', 'analysis'],
      maxTokens: 16000
    };

    const existingThinkingModel = await AIModelConfig.findOne({
      where: { name: thinkingModel.name }
    });

    if (existingThinkingModel) {
      await existingThinkingModel.update(thinkingModel);
      console.log(`✅ 更新模型配置: ${thinkingModel.displayName}`);
    } else {
      await AIModelConfig.create(thinkingModel);
      console.log(`✅ 创建模型配置: ${thinkingModel.displayName}`);
    }

    // 验证配置
    const totalModels = await AIModelConfig.count({ where: { status: 'active' } });
    const defaultModel = await AIModelConfig.findOne({ where: { isDefault: true, status: 'active' } });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 配置完成统计:');
    console.log(`  - 活跃模型总数: ${totalModels}`);
    console.log(`  - 默认模型: ${defaultModel ? defaultModel.displayName : '未设置'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('🎉 doubao模型配置完成！');
    console.log('');
    console.log('📝 下一步操作:');
    console.log('1. 确保AIBRIDGE_API_KEY环境变量已正确设置');
    console.log('2. 重启服务器以应用新配置');
    console.log('3. 测试AI调用功能');

  } catch (error) {
    console.error('❌ 配置失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行配置
if (require.main === module) {
  configureDoubaoModels();
}

module.exports = { configureDoubaoModels, AIModelConfig };