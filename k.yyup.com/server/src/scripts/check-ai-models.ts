/**
 * 检查AI模型配置
 */

import { sequelize } from '../init';
import AIModelConfig from '../models/ai-model-config.model';

async function checkAIModels() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 查询所有AI模型
    const models = await AIModelConfig.findAll({
      attributes: ['id', 'name', 'displayName', 'provider', 'status', 'isDefault', 'endpointUrl', 'apiKey'],
      raw: true
    });

    console.log('\n📊 AI模型配置列表:');
    console.log('='.repeat(100));

    for (const model of models as any[]) {
      console.log(`\n模型: ${model.name}`);
      console.log(`  显示名称: ${model.displayName}`);
      console.log(`  提供商: ${model.provider}`);
      console.log(`  状态: ${model.status}`);
      console.log(`  默认: ${model.isDefault}`);
      console.log(`  端点: ${model.endpointUrl}`);
      console.log(`  API密钥: ${model.apiKey ? model.apiKey.substring(0, 20) + '...' : '❌ 未设置!'}`);
    }

    console.log('\n' + '='.repeat(100));

    // 检查特定模型
    const thinkingModel = await AIModelConfig.findOne({
      where: { name: 'doubao-seed-1-6-thinking-250615' },
      attributes: ['id', 'name', 'displayName', 'apiKey', 'endpointUrl', 'status'],
      raw: true
    });

    if (thinkingModel) {
      console.log('\n🔍 深度思考模型配置:');
      console.log('  名称:', (thinkingModel as any).name);
      console.log('  状态:', (thinkingModel as any).status);
      console.log('  API密钥:', (thinkingModel as any).apiKey ? '✅ 已设置' : '❌ 未设置!');
      console.log('  密钥预览:', (thinkingModel as any).apiKey ? (thinkingModel as any).apiKey.substring(0, 30) + '...' : 'N/A');
      console.log('  端点:', (thinkingModel as any).endpointUrl);
    } else {
      console.log('\n❌ 未找到 doubao-seed-1-6-thinking-250615 模型配置!');
    }

    // 检查默认模型
    const defaultModel = await AIModelConfig.findOne({
      where: { isDefault: true, status: 'active' },
      attributes: ['id', 'name', 'displayName', 'apiKey', 'endpointUrl'],
      raw: true
    });

    if (defaultModel) {
      console.log('\n⭐ 默认模型配置:');
      console.log('  名称:', (defaultModel as any).name);
      console.log('  API密钥:', (defaultModel as any).apiKey ? '✅ 已设置' : '❌ 未设置!');
    } else {
      console.log('\n⚠️  未设置默认模型!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

checkAIModels();
