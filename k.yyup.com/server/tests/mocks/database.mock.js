/**
 * 数据库模拟模块
 * 用于测试环境，提供内存数据库实例
 */

const { Sequelize } = require('sequelize');

// 创建内存SQLite数据库实例用于测试
const sequelize = new Sequelize('sqlite::memory:', {
  logging: false, // 关闭SQL日志
  define: {
    timestamps: true,
    underscored: true
  }
});

// 模拟查询结果
const mockQueryResults = {
  ai_model_config: [
    {
      id: 45,
      name: 'doubao-seed-1-6-thinking-250615',
      display_name: 'Doubao 1.6 Thinking (推理增强版)',
      provider: 'bytedance_doubao',
      model_type: 'text',
      endpoint_url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      api_key: '1c155dc7-0cec-441b-9b00-0fb8ccc16089',
      model_parameters: '{"temperature": 0.7, "maxTokens": 4096, "topP": 0.9}',
      status: 'active',
      is_default: true
    },
    {
      id: 46,
      name: 'doubao-seedream-3-0-t2i-250415',
      display_name: 'Doubao SeedDream 3.0 (文生图)',
      provider: 'bytedance_doubao',
      model_type: 'image',
      endpoint_url: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
      api_key: 'ffb6e528-e8a3-4d2b-9c7f-1a2b3c4d5e6f',
      model_parameters: '{"size": "1024x768", "quality": "standard"}',
      status: 'active',
      is_default: false
    }
  ]
};

// 重写query方法以返回模拟数据
const originalQuery = sequelize.query.bind(sequelize);
sequelize.query = jest.fn().mockImplementation((sql, options) => {
  // 根据SQL查询返回相应的模拟数据
  if (sql.includes('ai_model_config')) {
    return Promise.resolve([mockQueryResults.ai_model_config]);
  }
  
  // 对于其他查询，返回空结果
  return Promise.resolve([[]]);
});

// 模拟数据库连接方法
sequelize.authenticate = jest.fn().mockResolvedValue(true);
sequelize.sync = jest.fn().mockResolvedValue(true);
sequelize.close = jest.fn().mockResolvedValue(true);

// 导出模拟的sequelize实例
module.exports = {
  sequelize,
  mockQueryResults
};
