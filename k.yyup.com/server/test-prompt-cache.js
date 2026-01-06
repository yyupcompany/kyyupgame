/**
 * 测试提示词缓存功能
 */

const { PromptCacheService } = require('./src/services/ai-operator/core/prompt-cache.service');

async function testPromptCache() {
  console.log('🚀 开始测试提示词缓存功能...');

  try {
    // 获取缓存服务实例
    const promptCache = PromptCacheService.getInstance();
    console.log('✅ 缓存服务实例获取成功');

    // 测试机构数据缓存
    console.log('\n📊 测试机构数据缓存...');
    const context = { kindergartenId: 1 };

    const startTime1 = Date.now();
    const orgData1 = await promptCache.getCachedOrganizationData(context);
    const time1 = Date.now() - startTime1;

    console.log(`第一次获取机构数据耗时: ${time1}ms`);
    console.log('机构数据:', {
      totalClasses: orgData1.totalClasses,
      totalStudents: orgData1.totalStudents,
      totalTeachers: orgData1.totalTeachers
    });

    const startTime2 = Date.now();
    const orgData2 = await promptCache.getCachedOrganizationData(context);
    const time2 = Date.now() - startTime2;

    console.log(`第二次获取机构数据耗时: ${time2}ms`);
    console.log(`缓存效果: ${time1 > time2 ? '✅ 命中缓存' : '❌ 未命中缓存'}`);

    // 测试提示词缓存
    console.log('\n💬 测试提示词缓存...');
    const userRole = 'admin';

    const promptStartTime1 = Date.now();
    const cachedPrompt1 = await promptCache.getCachedPrompt(userRole, context);
    const promptTime1 = Date.now() - promptStartTime1;

    console.log(`第一次获取提示词缓存结果: ${cachedPrompt1 ? '✅ 命中' : '❌ 未命中'}, 耗时: ${promptTime1}ms`);

    if (!cachedPrompt1) {
      // 模拟缓存提示词
      const testPrompt = '这是一个测试提示词，用于验证缓存功能是否正常工作。';
      await promptCache.cachePrompt(userRole, testPrompt, context);
      console.log('✅ 测试提示词已缓存');

      const promptStartTime2 = Date.now();
      const cachedPrompt2 = await promptCache.getCachedPrompt(userRole, context);
      const promptTime2 = Date.now() - promptStartTime2;

      console.log(`第二次获取提示词缓存结果: ${cachedPrompt2 ? '✅ 命中' : '❌ 未命中'}, 耗时: ${promptTime2}ms`);
      console.log(`缓存提示词长度: ${cachedPrompt2?.length} 字符`);
    }

    // 测试缓存统计
    console.log('\n📈 缓存统计信息:');
    const cacheStats = promptCache.getCacheStats();
    console.log(JSON.stringify(cacheStats, null, 2));

    console.log('\n✅ 缓存功能测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testPromptCache().catch(console.error);