#!/usr/bin/env node

/**
 * Mock配置验证脚本
 * 验证aiService导出是否正确配置
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证Mock配置中的aiService导出...\n');

// 检查主要Mock配置文件
const mockConfigPath = 'client/tests/mocks/request.mock.ts';
console.log(`📁 检查文件: ${mockConfigPath}`);

if (fs.existsSync(mockConfigPath)) {
  const content = fs.readFileSync(mockConfigPath, 'utf8');

  // 检查aiService相关配置
  const hasAIServiceExport = content.includes('aiService:');
  const hasAIServiceGeneration = content.includes('generateImage');
  const hasCompleteAIService = content.includes('createMockAIService');
  const hasNamedExport = content.includes('export const {\n') && content.includes('aiService');

  console.log('  ✅ aiService导出:', hasAIServiceExport ? '✓' : '✗');
  console.log('  ✅ generateImage方法:', hasAIServiceGeneration ? '✓' : '✗');
  console.log('  ✅ 完整AI服务Mock:', hasCompleteAIService ? '✓' : '✗');
  console.log('  ✅ 命名导出包含aiService:', hasNamedExport ? '✓' : '✗');

  if (hasAIServiceExport && hasAIServiceGeneration && hasCompleteAIService && hasNamedExport) {
    console.log('\n✅ 主要Mock配置文件正确!\n');
  } else {
    console.log('\n❌ 主要Mock配置文件存在问题!\n');
  }
} else {
  console.log(`❌ 文件不存在: ${mockConfigPath}\n`);
}

// 检查测试文件中的Mock配置
const testFiles = [
  'client/tests/unit/api/enhanced-ai-validation.test.ts',
  'client/tests/unit/api/auto-image.test.ts',
  'client/tests/unit/api/ai-error-scenarios.test.ts',
  'client/tests/unit/api/ai-dynamic-processing.test.ts',
  'client/tests/unit/components/ai-assistant/AIAssistant.test.ts',
  'client/tests/unit/api/endpoints/function-tools.test.ts'
];

console.log('📋 检查测试文件的Mock配置...\n');

let correctFiles = 0;
let incorrectFiles = 0;

testFiles.forEach(filePath => {
  console.log(`📄 检查: ${filePath}`);

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');

    // 检查是否使用统一Mock配置
    const usesUnifiedMock = content.includes('setupRequestMock()');
    const hasOldMock = content.includes('vi.mock(\'@/utils/request\', () => ({');

    console.log(`  ${usesUnifiedMock ? '✅' : '❌'} 使用统一Mock配置`);
    console.log(`  ${hasOldMock ? '❌' : '✅'} 存在旧的Mock配置`);

    if (usesUnifiedMock && !hasOldMock) {
      correctFiles++;
      console.log('  ✅ 配置正确\n');
    } else {
      incorrectFiles++;
      console.log('  ⚠️  需要修复\n');
    }
  } else {
    console.log('  ❌ 文件不存在\n');
    incorrectFiles++;
  }
});

console.log(`\n📊 统计结果:`);
console.log(`  ✅ 正确配置的文件: ${correctFiles}`);
console.log(`  ⚠️  需要修复的文件: ${incorrectFiles}`);
console.log(`  📈 成功率: ${((correctFiles / (correctFiles + incorrectFiles)) * 100).toFixed(1)}%`);

// 检查Vitest配置
console.log('\n🔧 检查Vitest配置...');

const vitestConfigPath = 'client/tests/setup.ts';
if (fs.existsSync(vitestConfigPath)) {
  const setupContent = fs.readFileSync(vitestConfigPath, 'utf8');
  const hasSetupMock = setupContent.includes('setupRequestMock()');
  const hasImportMock = setupContent.includes('import { setupRequestMock }');

  console.log(`  ✅ 导入setupRequestMock: ${hasImportMock ? '✓' : '✗'}`);
  console.log(`  ✅ 调用setupRequestMock: ${hasSetupMock ? '✓' : '✗'}`);

  if (hasImportMock && hasSetupMock) {
    console.log('  ✅ Vitest配置正确\n');
  } else {
    console.log('  ❌ Vitest配置需要检查\n');
  }
} else {
  console.log('  ❌ setup.ts文件不存在\n');
}

// 生成修复建议
if (incorrectFiles > 0) {
  console.log('🔧 修复建议:');
  console.log('1. 确保所有AI相关测试使用统一的Mock配置');
  console.log('2. 将旧的vi.mock配置替换为 setupRequestMock()');
  console.log('3. 检查aiService相关方法是否正确导出');
  console.log('\n修复命令:');
  console.log('  npm run test:frontend  # 运行前端测试验证修复');
}

console.log('\n🎉 Mock配置验证完成!');

// 退出码
process.exit(incorrectFiles > 0 ? 1 : 0);