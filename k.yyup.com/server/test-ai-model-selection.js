const { Sequelize, DataTypes } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('admin_tenant_management', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

// AI模型配置模型
const AIModelConfig = sequelize.define('AIModelConfig', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  displayName: { type: DataTypes.STRING(100), allowNull: false },
  provider: { type: DataTypes.STRING(50), allowNull: false },
  modelType: {
    type: DataTypes.ENUM('text', 'speech', 'image', 'video', 'multimodal', 'embedding', 'search', 'vod'),
    allowNull: false
  },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'testing'),
    defaultValue: 'inactive'
  },
  endpointUrl: { type: DataTypes.STRING(255), allowNull: false },
  apiKey: { type: DataTypes.STRING(255), allowNull: false }
}, {
  tableName: 'ai_model_config',
  timestamps: true,
  underscored: true
});

async function testAIModelSelection() {
  try {
    console.log('🔍 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 模拟AI bridge的查询逻辑 - 查找默认文本模型
    console.log('\n📋 测试AI bridge模型选择逻辑...');

    console.log('\n🔍 步骤1: 查找默认的文本类型模型');
    const defaultTextModel = await AIModelConfig.findOne({
      where: {
        isDefault: true,
        status: 'active',
        modelType: 'text'
      },
      order: [['id', 'ASC']]
    });

    if (defaultTextModel) {
      console.log('✅ 找到默认文本模型:');
      console.log(`  - 名称: ${defaultTextModel.name}`);
      console.log(`  - 提供商: ${defaultTextModel.provider}`);
      console.log(`  - 类型: ${defaultTextModel.modelType}`);
      console.log(`  - 端点: ${defaultTextModel.endpointUrl}`);
      console.log(`  - API密钥: ${defaultTextModel.apiKey.substring(0, 20)}...`);
    } else {
      console.log('❌ 没有找到默认文本模型');

      console.log('\n🔍 步骤2: 尝试查找任何活跃的文本模型');
      const anyTextModel = await AIModelConfig.findOne({
        where: {
          modelType: 'text',
          status: 'active'
        },
        order: [['id', 'ASC']]
      });

      if (anyTextModel) {
        console.log('✅ 找到备选文本模型:');
        console.log(`  - 名称: ${anyTextModel.name}`);
        console.log(`  - 提供商: ${anyTextModel.provider}`);
        console.log(`  - 类型: ${anyTextModel.modelType}`);
        console.log(`  - 端点: ${anyTextModel.endpointUrl}`);
        console.log(`  - API密钥: ${anyTextModel.apiKey.substring(0, 20)}...`);
      } else {
        console.log('❌ 没有找到任何活跃的文本模型');
      }
    }

    console.log('\n🔍 步骤3: 查看所有默认模型');
    const allDefaultModels = await AIModelConfig.findAll({
      where: {
        isDefault: true,
        status: 'active'
      },
      order: [['id', 'ASC']]
    });

    console.log(`📊 找到 ${allDefaultModels.length} 个默认模型:`);
    allDefaultModels.forEach((model, index) => {
      console.log(`  ${index + 1}. ${model.name} (${model.modelType}) - ${model.provider}`);
    });

    console.log('\n🔍 步骤4: 测试实际API调用');
    const selectedModel = defaultTextModel || (await AIModelConfig.findOne({
      where: { modelType: 'text', status: 'active' }
    }));

    if (selectedModel) {
      console.log(`🎯 选择的模型: ${selectedModel.name}`);

      // 构造测试请求
      const testRequest = {
        model: selectedModel.name,
        messages: [
          { role: "user", content: "你好" }
        ],
        max_tokens: 10,
        temperature: 0.1,
        stream: false
      };

      console.log('📤 发送测试请求到:', selectedModel.endpointUrl);
      console.log('📤 请求内容:', JSON.stringify(testRequest, null, 2));

      // 这里可以添加实际的API调用测试
      console.log('\n💡 提示: 可以使用以下信息进行API测试:');
      console.log(`  - 模型名称: ${selectedModel.name}`);
      console.log(`  - API端点: ${selectedModel.endpointUrl}`);
      console.log(`  - API密钥: ${selectedModel.apiKey}`);

    } else {
      console.log('❌ 无法选择文本模型进行测试');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await sequelize.close();
  }
}

testAIModelSelection();