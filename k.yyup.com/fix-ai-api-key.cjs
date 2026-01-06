#!/usr/bin/env node

/**
 * 修复AI模型配置的API密钥
 * 将错误的sk-OMDg69Y...格式替换为正确的豆包API密钥
 */

const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

// 正确的豆包API密钥 (UUID格式)
const CORRECT_API_KEY = '1c155dc7-0cec-441b-9b00-0fb8ccc16089';

async function fixAPIKey() {
  try {
    console.log('🔍 检查当前API密钥配置...\n');
    
    // 查看当前默认模型配置
    const [currentConfig] = await sequelize.query(`
      SELECT id, name, display_name, LEFT(api_key, 20) as api_key_prefix, status, is_default
      FROM ai_model_config 
      WHERE is_default = true AND status = 'active'
      LIMIT 1
    `);
    
    if (currentConfig.length === 0) {
      console.log('❌ 未找到默认激活模型配置');
      return;
    }
    
    const model = currentConfig[0];
    console.log(`📋 当前默认模型:`, model);
    console.log(`📌 API密钥前缀: ${model.api_key_prefix}...\n`);
    
    // 修复API密钥
    console.log('🔧 更新API密钥为正确的豆包API密钥...\n');
    
    const [updateResult] = await sequelize.query(`
      UPDATE ai_model_config 
      SET api_key = '${CORRECT_API_KEY}',
          updated_at = NOW()
      WHERE id = ${model.id}
    `);
    
    console.log(`✅ API密钥更新成功，影响行数: ${updateResult.affectedRows || 1}\n`);
    
    // 验证更新结果
    console.log('🔍 验证更新结果...\n');
    const [verifyResult] = await sequelize.query(`
      SELECT id, name, display_name, LEFT(api_key, 30) as api_key_prefix, status, is_default
      FROM ai_model_config 
      WHERE id = ${model.id}
    `);
    
    if (verifyResult.length > 0) {
      console.log('📊 更新后的配置:');
      console.table(verifyResult);
      console.log('✅ API密钥修复完成！');
      console.log('💡 新API密钥前缀:', verifyResult[0].api_key_prefix, '...');
      console.log('\n🎉 请重启后端服务以重新加载配置');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

fixAPIKey();
