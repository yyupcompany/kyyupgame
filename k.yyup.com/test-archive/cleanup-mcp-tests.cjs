const fs = require('fs');
const path = require('path');

function cleanupMCPTests() {
  console.log('🧹 开始清理MCP测试文件...');
  
  // 创建测试文件归档目录
  const archiveDir = 'test-archive';
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
    console.log(`📁 创建归档目录: ${archiveDir}`);
  }
  
  // 需要保留的重要文件
  const keepFiles = [
    'enhanced-mcp-test.cjs',           // 最终的MCP测试
    'ai-assistant-specific-test.cjs',   // AI助手专项测试
    'playwright_mcp_server.cjs',       // MCP服务器
    'MCP_BROWSER_VERIFICATION_FINAL_REPORT.md'  // 最终报告
  ];
  
  // 需要归档的测试文件模式
  const testFilePatterns = [
    /.*test.*\.cjs$/,
    /.*mcp.*\.cjs$/,
    /.*login.*\.cjs$/
  ];
  
  // 获取当前目录下的所有文件
  const files = fs.readdirSync('.');
  
  let archivedCount = 0;
  let keptCount = 0;
  
  files.forEach(file => {
    // 检查是否是测试文件
    const isTestFile = testFilePatterns.some(pattern => pattern.test(file));
    
    if (isTestFile) {
      if (keepFiles.includes(file)) {
        console.log(`✅ 保留重要文件: ${file}`);
        keptCount++;
      } else {
        // 移动到归档目录
        const sourcePath = path.join('.', file);
        const targetPath = path.join(archiveDir, file);
        
        try {
          fs.renameSync(sourcePath, targetPath);
          console.log(`📦 归档文件: ${file}`);
          archivedCount++;
        } catch (error) {
          console.log(`⚠️ 归档失败: ${file} - ${error.message}`);
        }
      }
    }
  });
  
  console.log('\n📊 清理统计:');
  console.log(`  - 归档文件: ${archivedCount}个`);
  console.log(`  - 保留文件: ${keptCount}个`);
  
  // 创建清理报告
  const cleanupReport = `# MCP测试文件清理报告

## 清理时间
${new Date().toISOString()}

## 保留的重要文件
${keepFiles.map(file => `- ${file}`).join('\n')}

## 归档统计
- 归档文件数量: ${archivedCount}
- 保留文件数量: ${keptCount}
- 归档目录: ${archiveDir}/

## 使用说明
- 保留的文件是最终版本的MCP测试工具
- 归档的文件是开发过程中的测试版本
- 如需查看历史版本，请查看归档目录

## 重要文件说明
- \`enhanced-mcp-test.cjs\`: 完整的系统验证测试
- \`ai-assistant-specific-test.cjs\`: AI助手专项功能测试
- \`playwright_mcp_server.cjs\`: MCP浏览器服务器
- \`MCP_BROWSER_VERIFICATION_FINAL_REPORT.md\`: 验证报告
`;
  
  fs.writeFileSync('MCP_TEST_CLEANUP_REPORT.md', cleanupReport);
  console.log('\n📋 生成清理报告: MCP_TEST_CLEANUP_REPORT.md');
  
  console.log('\n✅ MCP测试文件清理完成！');
}

cleanupMCPTests();
