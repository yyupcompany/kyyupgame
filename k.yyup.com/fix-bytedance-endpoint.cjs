#!/usr/bin/env node

/**
 * 修复ByteDance AI模型的endpoint_url配置
 * 将错误的域名 ark-api.volcengine.com 替换为正确的 ark.cn-beijing.volces.com
 */

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, 'server/.env') });

// 数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'yyup.cc',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false
  }
);

async function fixByteDanceEndpoint() {
  try {
    console.log('🔧 开始修复ByteDance AI模型端点配置...\n');
    
    // 1. 查询当前配置
    console.log('📋 查询当前ByteDance模型配置...');
    const [currentConfigs] = await sequelize.query(`
      SELECT id, name, display_name, endpoint_url, status
      FROM ai_model_config
      WHERE provider = 'ByteDance'
      ORDER BY id
    `);
    
    if (currentConfigs.length === 0) {
      console.log('❌ 未找到ByteDance模型配置');
      return;
    }
    
    console.log(`✅ 找到 ${currentConfigs.length} 个ByteDance模型配置:\n`);
    currentConfigs.forEach((config, index) => {
      console.log(`${index + 1}. ${config.display_name || config.name}`);
      console.log(`   当前端点: ${config.endpoint_url}`);
      console.log(`   状态: ${config.status}`);
      console.log('');
    });
    
    // 2. 更新端点URL
    console.log('🔄 更新端点URL...');
    const oldDomain = 'ark-api.volcengine.com';
    const newDomain = 'ark.cn-beijing.volces.com';
    
    const [updateResult] = await sequelize.query(`
      UPDATE ai_model_config
      SET endpoint_url = REPLACE(endpoint_url, '${oldDomain}', '${newDomain}')
      WHERE provider = 'ByteDance'
        AND endpoint_url LIKE '%${oldDomain}%'
    `);
    
    console.log(`✅ 更新了 ${updateResult.affectedRows || 0} 条记录\n`);
    
    // 3. 验证更新结果
    console.log('🔍 验证更新结果...');
    const [updatedConfigs] = await sequelize.query(`
      SELECT id, name, display_name, endpoint_url, status
      FROM ai_model_config
      WHERE provider = 'ByteDance'
      ORDER BY id
    `);
    
    console.log(`\n✅ 更新后的配置:\n`);
    updatedConfigs.forEach((config, index) => {
      console.log(`${index + 1}. ${config.display_name || config.name}`);
      console.log(`   新端点: ${config.endpoint_url}`);
      console.log(`   状态: ${config.status}`);
      console.log('');
    });
    
    // 4. 测试DNS解析
    console.log('🌐 测试新端点DNS解析...\n');
    const dns = require('dns').promises;
    
    const uniqueEndpoints = [...new Set(updatedConfigs.map(c => c.endpoint_url))];
    
    for (const endpoint of uniqueEndpoints) {
      try {
        const url = new URL(endpoint);
        const hostname = url.hostname;
        const addresses = await dns.resolve4(hostname);
        console.log(`✅ ${hostname}: ${addresses.join(', ')}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: DNS解析失败 - ${error.message}`);
      }
    }
    
    console.log('\n🎉 ByteDance端点配置修复完成！');
    console.log('💡 请重启后端服务以重新加载AI模型配置缓存');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

fixByteDanceEndpoint();

