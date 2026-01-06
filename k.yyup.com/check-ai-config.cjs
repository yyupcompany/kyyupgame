#!/usr/bin/env node

const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'yyup.cc', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function checkAIConfig() {
  try {
    console.log('🔍 查询ByteDance AI模型配置...\n');
    
    const [results] = await sequelize.query(`
      SELECT id, name, display_name, provider, endpoint_url, status
      FROM ai_model_config
      WHERE provider = 'ByteDance' AND status = 'active'
      ORDER BY is_default DESC
      LIMIT 5
    `);
    
    if (results.length === 0) {
      console.log('❌ 未找到ByteDance模型配置');
      return;
    }
    
    console.log(`✅ 找到 ${results.length} 个ByteDance模型配置:\n`);
    
    results.forEach((config, index) => {
      console.log(`${index + 1}. ${config.display_name || config.name}`);
      console.log(`   端点: ${config.endpoint_url}`);
      console.log(`   状态: ${config.status}`);
      console.log('');
    });
    
    // 测试DNS解析
    console.log('🌐 测试端点DNS解析...\n');
    const dns = require('dns').promises;
    
    for (const config of results) {
      const url = new URL(config.endpoint_url);
      const hostname = url.hostname;
      
      try {
        const addresses = await dns.resolve4(hostname);
        console.log(`✅ ${hostname}: ${addresses.join(', ')}`);
      } catch (error) {
        console.log(`❌ ${hostname}: DNS解析失败 - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkAIConfig();

