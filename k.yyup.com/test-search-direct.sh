#!/bin/bash

# search_apis 工具直接测试脚本
# 通过 Node.js 直接调用工具实现

echo "========================================="
echo "🔍 search_apis 工具直接测试"
echo "========================================="
echo ""

# 创建临时测试文件
cat > /tmp/test-search-apis.js << 'EOF'
// 直接测试 search_apis 工具
const path = require('path');

// 动态导入工具
async function testSearchApis() {
  try {
    console.log('📦 加载工具模块...');
    
    // 导入工具
    const toolPath = path.join(__dirname, '../server/src/services/ai/tools/api-discovery/search-apis.tool.ts');
    const tool = require(toolPath).default;
    
    console.log('✅ 工具已加载:', tool.name);
    console.log('');
    
    // 测试用例
    const testCases = [
      { name: '删除学生', keywords: ['删除', '学生'], method: 'DELETE' },
      { name: '查询班级', keywords: ['查询', '班级'], method: 'GET' },
      { name: '创建活动', keywords: ['创建', '活动'], method: 'POST' },
      { name: '更新教师', keywords: ['更新', '教师'], method: 'PUT' },
      { name: '学生列表', keywords: ['学生', '列表'], method: 'GET' },
    ];
    
    for (const testCase of testCases) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📝 测试用例: ${testCase.name}`);
      console.log(`🔑 关键词: ${JSON.stringify(testCase.keywords)}`);
      console.log(`🌐 方法: ${testCase.method}`);
      console.log('');
      
      try {
        const result = await tool.implementation({
          keywords: testCase.keywords,
          method: testCase.method,
          limit: 5
        });
        
        if (result.status === 'success') {
          console.log('✅ 搜索成功！');
          console.log('');
          console.log(`📊 找到: ${result.result.totalFound} 个API，返回: ${result.result.returned} 个`);
          console.log('');
          console.log('🏆 Top 3 结果:');
          result.result.results.slice(0, 3).forEach(api => {
            console.log(`   ${api.relevanceScore}分 - ${api.method} ${api.path}`);
            console.log(`   📝 ${api.summary}`);
            console.log(`   🏷️  ${api.tags.join(', ')}`);
            console.log('');
          });
        } else {
          console.log('❌ 搜索失败:', result.error);
        }
      } catch (error) {
        console.log('❌ 执行错误:', error.message);
      }
      
      console.log('');
    }
    
    console.log('=========================================');
    console.log('✅ 所有测试完成！');
    console.log('=========================================');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testSearchApis();
EOF

# 执行测试
echo "开始执行测试..."
echo ""

cd /home/zhgue/kyyupgame/k.yyup.com && npx ts-node /tmp/test-search-apis.js
