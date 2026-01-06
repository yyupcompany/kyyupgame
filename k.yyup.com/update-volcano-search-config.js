/**
 * 更新火山引擎搜索配置
 * 使用用户提供的API Key
 */

import { Sequelize } from 'sequelize';

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

// 用户提供的API Key
const USER_API_KEY = 'hm5kClSuyUUDXONV9z9A4lXrGUaBZw2R';

async function updateVolcanoSearchConfig() {
  try {
    console.log('🔧 开始更新火山引擎搜索配置...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 查看当前配置
    console.log('\n📋 查看当前火山引擎搜索配置...');
    const [currentConfig] = await sequelize.query(`
      SELECT id, name, display_name, endpoint_url, api_key, status, model_parameters
      FROM ai_model_config 
      WHERE name LIKE '%volcano%' OR name LIKE '%search%'
    `);
    
    console.log('📊 当前搜索相关配置:');
    console.table(currentConfig);
    
    // 检查是否存在volcano-fusion-search配置
    const [existingConfig] = await sequelize.query(`
      SELECT id FROM ai_model_config WHERE name = 'volcano-fusion-search'
    `);
    
    if (existingConfig.length > 0) {
      // 更新现有配置
      console.log('\n🔄 更新现有volcano-fusion-search配置...');
      await sequelize.query(`
        UPDATE ai_model_config 
        SET 
          api_key = '${USER_API_KEY}',
          endpoint_url = 'https://open.feedcoopapi.com/search_api/web_search',
          model_parameters = JSON_OBJECT(
            'searchEngine', 'volcano',
            'maxResults', 10,
            'enableAISummary', true,
            'language', 'zh-CN',
            'searchType', 'web_summary'
          ),
          status = 'active',
          updated_at = NOW()
        WHERE name = 'volcano-fusion-search'
      `);
      console.log('✅ 配置更新完成');
    } else {
      // 创建新配置
      console.log('\n➕ 创建新的volcano-fusion-search配置...');
      await sequelize.query(`
        INSERT INTO ai_model_config (
          name,
          display_name,
          provider,
          model_type,
          api_version,
          endpoint_url,
          api_key,
          model_parameters,
          is_default,
          status,
          description,
          capabilities,
          max_tokens,
          creator_id,
          created_at,
          updated_at
        ) VALUES (
          'volcano-fusion-search',
          '火山引擎融合搜索',
          'ByteDance',
          'search',
          'v1',
          'https://open.feedcoopapi.com/search_api/web_search',
          '${USER_API_KEY}',
          JSON_OBJECT(
            'searchEngine', 'volcano',
            'maxResults', 10,
            'enableAISummary', true,
            'language', 'zh-CN',
            'searchType', 'web_summary'
          ),
          false,
          'active',
          '火山引擎融合信息搜索服务',
          JSON_ARRAY('fusion_search', 'web_search', 'ai_search'),
          null,
          1,
          NOW(),
          NOW()
        )
      `);
      console.log('✅ 新配置创建完成');
    }
    
    // 验证配置
    console.log('\n🔍 验证更新后的配置...');
    const [updatedConfig] = await sequelize.query(`
      SELECT id, name, display_name, endpoint_url, api_key, status, model_parameters
      FROM ai_model_config 
      WHERE name = 'volcano-fusion-search'
    `);
    
    console.log('📊 更新后的配置:');
    console.table(updatedConfig);
    
    // 测试配置是否正确
    console.log('\n🧪 测试搜索配置...');
    await testSearchConfig(updatedConfig[0]);
    
  } catch (error) {
    console.error('❌ 更新配置失败:', error);
  } finally {
    await sequelize.close();
  }
}

/**
 * 测试搜索配置
 */
async function testSearchConfig(config) {
  try {
    const axios = (await import('axios')).default;
    
    const testRequestBody = {
      Query: "测试搜索",
      SearchType: "web_summary",
      Count: 3,
      NeedSummary: true,
      Filter: {
        NeedContent: false,
        NeedUrl: true
      }
    };
    
    console.log('📝 测试请求体:', JSON.stringify(testRequestBody, null, 2));
    console.log('🌐 测试端点:', config.endpoint_url);
    console.log('🔑 API Key:', config.api_key.substring(0, 10) + '...');
    
    const response = await axios.post(config.endpoint_url, testRequestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_key}`,
        'User-Agent': 'YY-AI-Assistant/1.0'
      },
      timeout: 30000,
      validateStatus: (status) => status < 500
    });
    
    console.log('✅ 搜索API测试成功!');
    console.log('📊 响应状态:', response.status);
    console.log('📄 响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ 搜索API测试失败:');
    console.log('错误状态:', error.response?.status);
    console.log('错误信息:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔐 认证失败，API Key可能不正确');
    } else if (error.response?.status === 403) {
      console.log('🚫 权限不足，请检查API Key权限');
    }
  }
}

// 运行更新
updateVolcanoSearchConfig().catch(console.error);
