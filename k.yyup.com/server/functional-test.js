const fs = require('fs');
const path = require('path');

console.log('🔍 开始功能验证...');

try {
  // 1. 检查重构后服务的关键结构
  const refactoredFile = 'server/src/services/ai-operator/unified-intelligence.service.refactored.ts';
  const content = fs.readFileSync(refactoredFile, 'utf8');
  
  console.log('📄 验证重构后服务结构...');
  
  // 检查关键功能方法
  const criticalMethods = [
    'processUserRequestStream',
    'processUserRequestStreamSingleRound', 
    'routeRequest',
    'executeComplexWorkflow',
    'executeTool',
    'healthCheck'
  ];
  
  let missingMethods = [];
  for (const method of criticalMethods) {
    if (!content.includes(`async ${method}`) && !content.includes(`${method}(`)) {
      missingMethods.push(method);
    }
  }
  
  if (missingMethods.length === 0) {
    console.log('✅ 所有关键方法都存在');
  } else {
    console.log(`❌ 缺失方法: ${missingMethods.join(', ')}`);
  }
  
  // 2. 检查模块导出
  const indexFile = 'server/src/services/ai-operator/index.ts';
  const indexContent = fs.readFileSync(indexFile, 'utf8');
  
  console.log('📦 验证模块导出...');
  const moduleExports = ['types', 'core', 'tools', 'streaming', 'router', 'execution', 'utils'];
  
  let missingExports = [];
  for (const module of moduleExports) {
    if (!indexContent.includes(`export * from './${module}`)) {
      missingExports.push(module);
    }
  }
  
  if (missingExports.length === 0) {
    console.log('✅ 所有模块都正确导出');
  } else {
    console.log(`❌ 缺失导出: ${missingExports.join(', ')}`);
  }
  
  // 3. 验证服务统计信息
  if (content.includes('getServiceStatistics') && content.includes('healthCheck')) {
    console.log('✅ 新增的服务管理功能已实现');
  } else {
    console.log('❌ 服务管理功能缺失');
  }
  
  console.log('🎯 功能验证完成');
  
} catch (error) {
  console.log('❌ 验证失败:', error.message);
}
