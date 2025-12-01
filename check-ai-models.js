const { Sequelize, DataTypes } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log,
  pool: {
    acquire: 30000,
    idle: 10000,
  }
});

// AI模型配置模型
const AIModelConfig = sequelize.define('ai_model_config', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  display_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  provider: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  model_type: {
    type: DataTypes.ENUM('text', 'speech', 'image', 'video', 'multimodal', 'embedding', 'search'),
    allowNull: false
  },
  api_version: {
    type: DataTypes.STRING(20),
    defaultValue: 'v1'
  },
  endpoint_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  api_key: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  model_parameters: {
    type: DataTypes.JSON
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'testing'),
    defaultValue: 'inactive'
  },
  description: {
    type: DataTypes.TEXT
  },
  capabilities: {
    type: DataTypes.JSON
  },
  max_tokens: {
    type: DataTypes.INTEGER
  },
  creator_id: {
    type: DataTypes.INTEGER
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ai_model_config',
  timestamps: false,
  underscored: true
});

async function checkAIModels() {
  try {
    console.log('🔍 连接到 kargerdensales 数据库...');

    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    console.log('\n📋 查询 AI 模型配置...\n');

    const models = await AIModelConfig.findAll({
      order: [['created_at', 'ASC']]
    });

    if (models.length === 0) {
      console.log('❌ 没有找到 AI 模型配置');
      return;
    }

    console.log(`🎯 找到 ${models.length} 个 AI 模型配置:\n`);

    models.forEach((model, index) => {
      console.log(`\n${index + 1}. 模型详情:`);
      console.log(`   ID: ${model.id}`);
      console.log(`   名称: ${model.name}`);
      console.log(`   显示名称: ${model.display_name}`);
      console.log(`   提供商: ${model.provider}`);
      console.log(`   模型类型: ${model.model_type}`);
      console.log(`   API版本: ${model.api_version}`);
      console.log(`   端点URL: ${model.endpoint_url}`);
      console.log(`   API密钥前缀: ${model.api_key.substring(0, 20)}...`);
      console.log(`   是否默认: ${model.is_default}`);
      console.log(`   状态: ${model.status}`);
      console.log(`   最大令牌数: ${model.max_tokens}`);
      console.log(`   模型参数: ${JSON.stringify(model.model_parameters, null, 2)}`);
      console.log(`   能力: ${JSON.stringify(model.capabilities, null, 2)}`);
      console.log(`   创建时间: ${model.created_at}`);
      console.log(`   更新时间: ${model.updated_at}`);
    });

    console.log('\n🔧 生成 SQL 插入语句...\n');

    console.log('-- 插入到 admin_tenant_management 数据库的 SQL 语句:');
    console.log('-- =====================================');

    models.forEach((model) => {
      const params = model.model_parameters ? JSON.stringify(model.model_parameters).replace(/'/g, "''") : null;
      const capabilities = model.capabilities ? JSON.stringify(model.capabilities).replace(/'/g, "''") : null;

      const sql = `INSERT INTO admin_tenant_management.ai_model_config (
        name, display_name, provider, model_type, api_version, endpoint_url, api_key,
        model_parameters, is_default, status, description, capabilities, max_tokens,
        creator_id, created_at, updated_at
      ) VALUES (
        '${model.name}',
        '${model.display_name}',
        '${model.provider}',
        '${model.model_type}',
        '${model.api_version}',
        '${model.endpoint_url}',
        '${model.api_key}',
        ${params ? `'${params}'` : 'NULL'},
        ${model.is_default},
        '${model.status}',
        ${model.description ? `'${model.description.replace(/'/g, "''")}'` : 'NULL'},
        ${capabilities ? `'${capabilities}'` : 'NULL'},
        ${model.max_tokens ? model.max_tokens : 'NULL'},
        ${model.creator_id ? model.creator_id : 'NULL'},
        '${model.created_at.toISOString().slice(0, 19).replace('T', ' ')}',
        '${model.updated_at.toISOString().slice(0, 19).replace('T', ' ')}'
      );`;

      console.log(sql);
      console.log('');
    });

    console.log(`📊 总计 ${models.length} 个模型配置已转换为 SQL`);

  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await sequelize.close();
  }
}

checkAIModels();