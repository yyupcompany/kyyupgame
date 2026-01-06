/**
 * 直接测试火山引擎搜索API
 * 用于诊断搜索功能问题
 */

import '../init';
import { webSearchTool } from '../services/ai/tools/web-operation/web-search.tool';
import modelConfigService from '../services/ai/ai-model-config.service';

async function testWebSearch() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 开始测试网络搜索功能');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 1. 检查搜索模型配置
    console.log('\n📋 步骤1: 检查搜索模型配置');
    const searchModel = await modelConfigService.getDefaultModel('search');
    
    if (!searchModel) {
      console.error('❌ 未找到搜索模型配置');
      console.log('\n💡 解决方案: 需要在数据库中添加搜索模型配置');
      console.log('   能力(capability): search');
      console.log('   端点(api_endpoint): https://open.feedcoopapi.com/search_api/web_search');
      console.log('   API密钥(api_key): 需要配置火山引擎API KEY');
      process.exit(1);
    }

    console.log('✅ 搜索模型配置信息:');
    console.log('   模型:', JSON.stringify(searchModel, null, 2));
    console.log('   端点:', searchModel.apiEndpoint);
    console.log('   是否激活:', searchModel.isActive);
    console.log('   API密钥:', searchModel.apiKey ? '已配置 (***' + searchModel.apiKey.slice(-4) + ')' : '未配置');

    if (!searchModel.isActive) {
      console.error('❌ 搜索模型未激活');
      process.exit(1);
    }

    if (!searchModel.apiKey && !process.env.VOLCANO_API_KEY) {
      console.error('❌ API密钥未配置');
      console.log('\n💡 解决方案: 请配置火山引擎API密钥');
      console.log('   1. 在数据库中设置 api_key 字段');
      console.log('   2. 或设置环境变量 VOLCANO_API_KEY');
      process.exit(1);
    }

    // 2. 执行搜索测试
    console.log('\n📋 步骤2: 执行搜索测试');
    const testQuery = '2025年学前教育法';
    console.log(`🔍 搜索查询: "${testQuery}"`);

    const searchResult = await webSearchTool.search(testQuery, {
      maxResults: 5,
      enableAISummary: true,
      onProgress: (progress, status) => {
        console.log(`   [进度 ${progress}%] ${status}`);
      }
    });

    console.log('\n✅ 搜索完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 搜索结果统计:');
    console.log('   查询词:', searchResult.query);
    console.log('   结果数量:', searchResult.results.length);
    console.log('   总结果数:', searchResult.totalResults);
    console.log('   耗时:', searchResult.searchTime + 'ms');
    console.log('   AI总结长度:', searchResult.aiSummary?.length || 0, '字符');

    if (searchResult.results.length > 0) {
      console.log('\n📋 前3条搜索结果:');
      searchResult.results.slice(0, 3).forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.title}`);
        console.log(`   链接: ${result.url}`);
        console.log(`   摘要: ${result.snippet.substring(0, 100)}...`);
        console.log(`   来源: ${result.source || '未知'}`);
      });
    }

    if (searchResult.aiSummary) {
      console.log('\n🤖 AI智能总结:');
      console.log(searchResult.aiSummary);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 测试完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error: any) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// 运行测试
testWebSearch();

