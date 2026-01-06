/**
 * 修复TypeScript语法错误
 */

const fs = require('fs');

console.log('🔧 修复TypeScript语法错误...');

const initPath = '/home/zhgue/kyyupgame/k.yyup.com/server/src/init.ts';
let content = fs.readFileSync(initPath, 'utf8');

// 1. 移除错误添加的测评模型（在错误位置的）
const errorPattern = /  OutdoorTrainingRecord,\n  \/\/ 测评系统模型[\s\S]*?  PhysicalAssessmentRecord\n/g;
content = content.replace(errorPattern, '  OutdoorTrainingRecord');

// 2. 在正确的导出位置添加测评模型（在 TeachingMediaRecord 之后）
const teachingMediaExport = '  TeachingMediaRecord,';
const correctAssessmentExport = `${teachingMediaExport}
  // 测评系统模型
  AssessmentConfig,
  AssessmentQuestion,
  AssessmentRecord,
  AssessmentAnswer,
  AssessmentReport,
  AssessmentGrowthTracking,
  PhysicalAssessmentRecord,`;

content = content.replace(teachingMediaExport, correctAssessmentExport);

// 3. 移除错误的OutdoorTrainingRecord关联代码（如果有）
const wrongAssociatePattern = /if \(OutdoorTrainingRecord && typeof OutdoorTrainingRecord\.associate === 'function'\) \{\n  OutdoorTrainingRecord,\n.*?\n\}/g;
content = content.replace(wrongAssociatePattern, '// OutdoorTrainingRecord 关联 - 已在各自模型文件中定义');

// 写入修复后的文件
fs.writeFileSync(initPath, content, 'utf8');

console.log('✅ TypeScript语法错误修复完成');
console.log('🔄 请重启服务器以使更改生效');