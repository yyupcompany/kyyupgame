/**
 * 快速修复init.ts语法错误
 */

const fs = require('fs');

console.log('🔧 快速修复init.ts语法错误...');

const initPath = '/home/zhgue/kyyupgame/k.yyup.com/server/src/init.ts';
let content = fs.readFileSync(initPath, 'utf8');

// 移除错误添加的所有测评相关代码
const removeAssessmentCode = (text) => {
  // 移除导入
  text = text.replace(/\/\/ 添加测评系统模型[\s\S]*?import \{ PhysicalAssessmentRecord \} from '.\/models\/physical-assessment-record\.model';\n\n/g, '');

  // 移除初始化代码
  text = text.replace(/console\.log\('=== 开始初始化测评系统模型 ==='\);[\s\S]*?console\.log\('=== 测评系统模型初始化完成 ==='\);/g, '');

  // 移除错误的导出代码
  text = text.replace(/, \/\/ 测评系统模型[\s\S]*?PhysicalAssessmentRecord/g, '');

  // 移除错误的关联代码
  text = text.replace(/if \(OutdoorTrainingRecord && typeof OutdoorTrainingRecord\.associate === 'function'\) \{[\s\S]*?\}/g, '');

  return text;
};

content = removeAssessmentCode(content);

// 写入修复后的文件
fs.writeFileSync(initPath, content, 'utf8');

console.log('✅ 快速修复完成');
console.log('🔄 请重启服务器');