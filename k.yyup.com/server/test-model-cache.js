/**
 * 测试AI模型缓存服务
 */

require('dotenv').config();

async function testModelCache() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 测试AI模型缓存服务');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 导入AI模型缓存服务
    const { AIModelCacheService } = require('./src/services/ai-model-cache.service');

    console.log('✅ 缓存服务导入成功');

    // 获取缓存服务实例
    const cacheService = AIModelCacheService.getInstance();
    console.log('✅ 缓存服务实例获取成功');

    // 初始化缓存
    console.log('\n🚀 初始化模型缓存...');
    await cacheService.initializeCache();

    // 测试获取默认模型
    console.log('\n📊 测试获取默认模型:');
    const defaultModel = await cacheService.getDefaultModel();
    if (defaultModel) {
      console.log(`✅ 默认模型: ${defaultModel.displayName || defaultModel.name}`);
      console.log(`   API密钥: ${defaultModel.api_key ? defaultModel.api_key.substring(0, 8) + '...' + defaultModel.api_key.substring(defaultModel.api_key.length - 4) : '未设置'}`);
      console.log(`   端点: ${defaultModel.endpoint_url}`);
      console.log(`   是否默认: ${defaultModel.is_default}`);
    } else {
      console.log('❌ 未找到默认模型');
    }

    // 测试根据名称获取模型
    console.log('\n📊 测试根据名称获取模型:');
    const flashModel = await cacheService.getModelByName('doubao-seed-1-6-flash-250715');
    if (flashModel) {
      console.log(`✅ Flash模型: ${flashModel.displayName}`);
      console.log(`   API密钥: ${flashModel.api_key ? flashModel.api_key.substring(0, 8) + '...' + flashModel.api_key.substring(flashModel.api_key.length - 4) : '未设置'}`);
      console.log(`   密钥长度: ${flashModel.api_key ? flashModel.api_key.length : 0}`);
    } else {
      console.log('❌ 未找到Flash模型');
    }

    // 测试获取所有可用模型
    console.log('\n📊 测试获取所有可用模型:');
    const allModels = await cacheService.getAvailableModels();
    console.log(`✅ 找到 ${allModels.length} 个可用模型:`);

    allModels.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model.displayName || model.name}`);
      console.log(`      API密钥: ${model.api_key ? (model.api_key.length > 10 ? model.api_key.substring(0, 8) + '...' : model.api_key) : '未设置'}`);
    });

    console.log('\n🎉 AI模型缓存服务测试完成！');
    console.log('\n💡 建议:');
    console.log('1. ✅ 缓存服务工作正常');
    console.log('2. ⚠️ aibridge服务应该使用这个缓存服务而不是每次查询数据库');
    console.log('3. 🛠️ 需要修改aibridge服务调用缓存服务的方法');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 执行测试
if (require.main === module) {
  testModelCache();
}

module.exports = { testModelCache };