/**
 * 回滚所有测评模型相关的修改，恢复到原始状态
 */

const fs = require('fs');

console.log('🔄 回滚测评模型相关修改...');

const initPath = '/home/zhgue/kyyupgame/k.yyup.com/server/src/init.ts';
let content = fs.readFileSync(initPath, 'utf8');

// 完全移除所有测评相关的修改
const rollbackChanges = (text) => {
  // 移除导入
  text = text.replace(/\/\/ 添加测评系统模型[\s\S]*?import \{ PhysicalAssessmentRecord \} from '.\/models\/physical-assessment-record\.model';\n\n/g, '');

  // 移除初始化代码
  text = text.replace(/console\.log\('=== 开始初始化测评系统模型 ==='\);[\s\S]*?console\.log\('✅ 测评系统模型初始化完成'\);[\s\S]*?console\.log\('=== 测评系统模型初始化完成 ==='\);/g, '');

  // 移除所有导出中的测评模型
  text = text.replace(/, \/\/ 测评系统模型[\s\S]*?PhysicalAssessmentRecord/g, '');

  // 移除任何剩余的测评相关代码
  text = text.replace(/AssessmentConfig|AssessmentQuestion|AssessmentRecord|AssessmentAnswer|AssessmentReport|AssessmentGrowthTracking|PhysicalAssessmentRecord/g, '');

  return text;
};

content = rollbackChanges(content);

// 写入回滚后的文件
fs.writeFileSync(initPath, content, 'utf8');

console.log('✅ 已回滚所有测评模型修改，恢复到原始状态');

// 同时回滚 models/index.ts 的修改
const modelsIndexPath = '/home/zhgue/kyyupgame/k.yyup.com/server/src/models/index.ts';
if (fs.existsSync(modelsIndexPath)) {
  let modelsContent = fs.readFileSync(modelsIndexPath, 'utf8');

  // 移除测评模型的导入和导出
  modelsContent = modelsContent.replace(/\/\/ 测评系统模型[\s\S]*?PhysicalAssessmentRecord\n/g, '');
  modelsContent = modelsContent.replace(/  AssessmentConfig.*?PhysicalAssessmentRecord/g, '');
  modelsContent = modelsContent.replace(/AssessmentConfig\.initModel\(sequelize\);[\s\S]*?PhysicalAssessmentRecord\.initModel\(sequelize\);/g, '');

  fs.writeFileSync(modelsIndexPath, modelsContent, 'utf8');
  console.log('✅ 已回滚 models/index.ts 中的修改');
}

console.log('🔄 请重启服务器以使更改生效');