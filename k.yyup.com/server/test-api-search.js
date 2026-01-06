/**
 * 测试 api_search 工具和 Swagger 文档加载
 */

const path = require('path');

// 直接测试Swagger配置
async function testSwaggerConfig() {
  console.log('\n=== 📖 测试 1: Swagger 配置文件加载 ===\n');
  
  try {
    // 加载编译后的swagger配置
    const swaggerConfig = require('./dist/config/swagger.config');
    const specs = swaggerConfig.specs;
    
    console.log('✅ Swagger配置加载成功');
    console.log('📊 Swagger文档信息:');
    console.log(`  - 标题: ${specs.info?.title || '未定义'}`);
    console.log(`  - 版本: ${specs.info?.version || '未定义'}`);
    
    if (specs.paths) {
      const pathCount = Object.keys(specs.paths).length;
      console.log(`  - API路径数量: ${pathCount}`);
      
      if (pathCount > 0) {
        console.log('  - 前5个API路径示例:');
        Object.keys(specs.paths).slice(0, 5).forEach((path, index) => {
          const methods = Object.keys(specs.paths[path]).filter(m => 
            ['get', 'post', 'put', 'delete', 'patch'].includes(m.toLowerCase())
          );
          console.log(`    ${index + 1}. ${path} [${methods.join(', ')}]`);
        });
      } else {
        console.log('  ❌ 警告: 没有找到任何API路径!');
      }
    } else {
      console.log('  ❌ 错误: specs.paths 不存在!');
    }
    
    return specs;
  } catch (error) {
    console.error('❌ Swagger配置加载失败:', error.message);
    console.error('  错误详情:', error.stack);
    return null;
  }
}

// 测试 ApiGroupMappingService 初始化
async function testApiGroupMapping() {
  console.log('\n=== 🗂️ 测试 2: ApiGroupMappingService 初始化 ===\n');
  
  try {
    const { apiGroupMappingService } = require('./dist/services/ai/api-group-mapping.service');
    
    console.log('🔄 开始初始化 ApiGroupMappingService...');
    await apiGroupMappingService.initialize();
    
    console.log('✅ ApiGroupMappingService 初始化成功');
    
    // 获取支持的实体列表
    const entities = await apiGroupMappingService.getSupportedEntities();
    console.log(`📋 支持的实体数量: ${entities.length}`);
    
    if (entities.length > 0) {
      console.log('📝 支持的实体列表:');
      entities.forEach((entity, index) => {
        console.log(`  ${index + 1}. ${entity}`);
      });
    } else {
      console.log('  ❌ 警告: 没有找到任何实体!');
      console.log('  💡 可能原因: Swagger文档中没有符合 /api/[entity] 格式的路径');
    }
    
    // 测试获取具体实体的API详情
    if (entities.length > 0) {
      const testEntity = entities.includes('classes') ? 'classes' : entities[0];
      console.log(`\n🔍 测试获取 "${testEntity}" 的API详情:`);
      const details = await apiGroupMappingService.getApiDetailsByEntity(testEntity);
      console.log('  返回结果:', JSON.stringify(details, null, 2));
    }
    
    return apiGroupMappingService;
  } catch (error) {
    console.error('❌ ApiGroupMappingService 初始化失败:', error.message);
    console.error('  错误详情:', error.stack);
    return null;
  }
}

// 测试 api_search 工具
async function testApiSearchTool() {
  console.log('\n=== 🔍 测试 3: api_search 工具执行 ===\n');
  
  try {
    const apiSearchModule = require('./dist/services/ai/tools/database-query/api-search.tool');
    const apiSearchTool = apiSearchModule.default;
    
    console.log('✅ api_search 工具模块加载成功');
    console.log('🔧 工具信息:');
    console.log(`  - 名称: ${apiSearchTool.name}`);
    console.log(`  - 描述: ${apiSearchTool.description.substring(0, 50)}...`);
    
    // 测试调用
    console.log('\n🚀 测试调用 api_search 工具:');
    console.log('  参数: { keywords: ["班级", "class"] }');
    
    const result = await apiSearchTool.execute({ keywords: ["班级", "class"] });
    
    console.log('\n📦 返回结果:');
    console.log(`  - 状态: ${result.status}`);
    console.log(`  - 工具名: ${result.name}`);
    
    if (result.status === 'success' && result.result) {
      console.log(`  - 查询: ${JSON.stringify(result.result.query)}`);
      console.log(`  - 找到: ${result.result.totalFound} 个结果`);
      console.log(`  - 返回: ${result.result.returned} 个结果`);
      console.log(`  - 摘要: ${result.result.summary}`);
      
      if (result.result.results && result.result.results.length > 0) {
        console.log('\n📋 搜索结果详情:');
        result.result.results.forEach((r, index) => {
          console.log(`\n  结果 ${index + 1}:`);
          console.log(`    - 实体: ${r.entity}`);
          console.log(`    - 显示名: ${r.displayName}`);
          console.log(`    - 端点: ${r.endpoint}`);
          console.log(`    - 方法: ${r.method}`);
          console.log(`    - 相关度: ${r.relevanceScore}`);
        });
      }
    } else if (result.status === 'error') {
      console.log(`  ❌ 错误: ${result.error}`);
    } else {
      console.log('  ⚠️ 返回了空结果');
      console.log('  完整结果:', JSON.stringify(result, null, 2));
    }
    
    return result;
  } catch (error) {
    console.error('❌ api_search 工具测试失败:', error.message);
    console.error('  错误详情:', error.stack);
    return null;
  }
}

// 主测试函数
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     api_search 工具完整测试 - 问题诊断              ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  // 测试1: Swagger配置
  const specs = await testSwaggerConfig();
  if (!specs || !specs.paths || Object.keys(specs.paths).length === 0) {
    console.log('\n❌ 致命错误: Swagger文档为空或未正确加载');
    console.log('💡 原因可能是:');
    console.log('  1. swagger.config.ts 中的 apis 路径配置不正确');
    console.log('  2. 路由文件中没有正确的 @swagger 注释');
    console.log('  3. swaggerJsdoc 无法找到匹配的文件');
    process.exit(1);
  }
  
  // 测试2: ApiGroupMappingService
  const apiGroupMapping = await testApiGroupMapping();
  if (!apiGroupMapping) {
    console.log('\n❌ 致命错误: ApiGroupMappingService 初始化失败');
    process.exit(1);
  }
  
  // 测试3: api_search工具
  const searchResult = await testApiSearchTool();
  if (!searchResult) {
    console.log('\n❌ 致命错误: api_search 工具执行失败');
    process.exit(1);
  }
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                  测试完成总结                          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  if (searchResult.status === 'success' && searchResult.result?.returned > 0) {
    console.log('✅ 所有测试通过! api_search 工具工作正常');
    console.log(`✅ 成功找到 ${searchResult.result.returned} 个API接口`);
  } else {
    console.log('⚠️ 测试完成,但存在问题:');
    if (searchResult.status === 'error') {
      console.log(`  - api_search 返回错误: ${searchResult.error}`);
    } else if (!searchResult.result || searchResult.result.returned === 0) {
      console.log('  - api_search 没有返回任何结果');
      console.log('  - 这表明 Swagger 文档中没有匹配的API路径');
    }
  }
}

// 运行测试
runTests().catch(error => {
  console.error('\n💥 测试执行过程中发生未捕获的错误:', error);
  process.exit(1);
});
