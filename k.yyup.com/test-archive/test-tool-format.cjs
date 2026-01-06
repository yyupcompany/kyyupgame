#!/usr/bin/env node

/**
 * 测试工具格式问题
 */

async function testToolManager() {
  try {
    console.log('🔍 测试工具管理器返回的格式...');

    // 导入工具管理器
    const { ToolManagerService } = require('./server/src/services/ai/tools/core/tool-manager.service');
    const toolManager = new ToolManagerService();

    // 测试获取工具
    const tools = await toolManager.getToolsForQuery({
      query: '我的现状你用报表显示',
      userRole: 'admin',
      userId: 121,
      conversationId: 'test-debug',
      maxTools: 3
    });

    console.log('📊 工具管理器返回的工具数量:', tools.length);

    if (tools.length > 0) {
      console.log('🔍 第一个工具的格式:');
      console.log(JSON.stringify(tools[0], null, 2));

      console.log('🔍 所有工具的名称:');
      tools.forEach((tool, index) => {
        console.log(`  ${index}: ${tool.name || tool.function?.name || '未知'}`);
      });
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

// 测试工具注册中心
async function testToolRegistry() {
  try {
    console.log('\n🔍 测试工具注册中心...');
    
    const { toolRegistry, ToolScenario } = require('./server/src/services/ai/tools/core/tool-registry.service.ts');
    const tools = toolRegistry.getToolsForScenario(ToolScenario.FUNCTION_TOOLS);
    
    console.log('📊 工具注册中心返回的工具数量:', tools.length);
    
    if (tools.length > 0) {
      console.log('🔍 第一个工具的格式:');
      console.log(JSON.stringify(tools[0], null, 2));
      
      // 查找get_organization_status工具
      const orgStatusTool = tools.find(t => t.function?.name === 'get_organization_status');
      if (orgStatusTool) {
        console.log('✅ 找到get_organization_status工具:');
        console.log(JSON.stringify(orgStatusTool, null, 2));
      } else {
        console.log('❌ 未找到get_organization_status工具');
        console.log('可用工具:', tools.map(t => t.function?.name).slice(0, 10));
      }
    }
    
  } catch (error) {
    console.error('❌ 工具注册中心测试失败:', error.message);
  }
}

// 测试FunctionToolsService
async function testFunctionToolsService() {
  try {
    console.log('\n🔍 测试FunctionToolsService...');
    
    const { FunctionToolsService } = require('./server/src/services/ai-operator/function-tools.service.ts');
    const tools = FunctionToolsService.getAvailableTools();
    
    console.log('📊 FunctionToolsService返回的工具数量:', tools.length);
    
    if (tools.length > 0) {
      console.log('🔍 第一个工具的格式:');
      console.log(JSON.stringify(tools[0], null, 2));
      
      // 查找get_organization_status工具
      const orgStatusTool = tools.find(t => t.name === 'get_organization_status');
      if (orgStatusTool) {
        console.log('✅ 找到get_organization_status工具:');
        console.log(JSON.stringify(orgStatusTool, null, 2));
      } else {
        console.log('❌ 未找到get_organization_status工具');
        console.log('可用工具:', tools.map(t => t.name).slice(0, 10));
      }
    }
    
  } catch (error) {
    console.error('❌ FunctionToolsService测试失败:', error.message);
  }
}

async function main() {
  console.log('🚀 开始工具格式测试...\n');
  
  await testToolRegistry();
  await testFunctionToolsService();
  await testToolManager();
  
  console.log('\n✅ 测试完成');
}

if (require.main === module) {
  main().catch(console.error);
}
