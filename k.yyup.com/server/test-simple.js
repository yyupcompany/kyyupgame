// 简单快速测试
async function test() {
  console.log('=== 快速测试 api_search ===\n');
  
  try {
    const { apiGroupMappingService } = require('./dist/services/ai/api-group-mapping.service');
    
    console.log('1️⃣ 初始化ApiGroupMappingService...');
    await apiGroupMappingService.initialize();
    
    const entities = await apiGroupMappingService.getSupportedEntities();
    console.log(`2️⃣ 找到 ${entities.length} 个实体`);
    console.log('   实体列表:', entities.join(', '));
    
    if (entities.length > 0) {
      console.log('\n3️⃣ 测试api_search工具...');
      const apiSearchModule = require('./dist/services/ai/tools/database-query/api-search.tool');
      const apiSearchTool = apiSearchModule.default;
      
      const result = await apiSearchTool.execute({ keywords: ["班级", "class"] });
      console.log('   状态:', result.status);
      console.log('   找到:', result.result?.totalFound || 0, '个API');
      console.log('   返回:', result.result?.returned || 0, '个结果');
      
      if (result.result?.results?.length > 0) {
        console.log('\n✅ 成功! api_search 正常工作');
        console.log('   第一个结果:', result.result.results[0].displayName, '-', result.result.results[0].endpoint);
      } else {
        console.log('\n❌ api_search 返回空结果');
      }
    } else {
      console.log('\n❌ 没有找到任何实体,Swagger文档可能未正确加载');
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  }
}

test();
