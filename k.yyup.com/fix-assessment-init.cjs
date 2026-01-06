/**
 * 在 init.ts 中添加测评模型初始化
 */

const fs = require('fs');

console.log('🔧 在 init.ts 中添加测评模型初始化...');

const initPath = '/home/zhgue/kyyupgame/k.yyup.com/server/src/init.ts';
let content = fs.readFileSync(initPath, 'utf8');

// 检查是否已经包含测评模型
if (content.includes('AssessmentConfig.initModel')) {
  console.log('✅ 测评模型已经存在于 init.ts 中');
  process.exit(0);
}

// 1. 在导入部分添加测评模型导入
const importInsertPosition = content.indexOf('// 游戏系统模型');
if (importInsertPosition === -1) {
  console.log('❌ 无法找到合适的导入插入位置');
  process.exit(1);
}

const assessmentImports = `// 测评系统模型
import { AssessmentConfig } from './models/assessment-config.model';
import { AssessmentQuestion } from './models/assessment-question.model';
import { AssessmentRecord, AssessmentStatus } from './models/assessment-record.model';
import { AssessmentAnswer } from './models/assessment-answer.model';
import { AssessmentReport } from './models/assessment-report.model';
import { AssessmentGrowthTracking } from './models/assessment-growth-tracking.model';
import { PhysicalAssessmentRecord } from './models/physical-assessment-record.model';
`;

content = content.slice(0, importInsertPosition) + assessmentImports + content.slice(importInsertPosition);

// 2. 在模型初始化部分添加测评模型初始化
const initInsertPosition = content.indexOf('GameConfig.initModel(sequelize);');
if (initInsertPosition === -1) {
  console.log('❌ 无法找到合适的初始化插入位置');
  process.exit(1);
}

const gameInitEnd = content.indexOf('GameUserSettings.initModel(sequelize);', initInsertPosition) + 'GameUserSettings.initModel(sequelize);'.length;

const assessmentInit = `
✅ 游戏系统模型初始化完成
=== 游戏系统模型初始化完成 ===
=== 开始初始化测评系统模型 ===
🔍 初始化测评系统模型...
AssessmentConfig.initModel(sequelize);
AssessmentQuestion.initModel(sequelize);
AssessmentRecord.initModel(sequelize);
AssessmentAnswer.initModel(sequelize);
AssessmentReport.initModel(sequelize);
AssessmentGrowthTracking.initModel(sequelize);
PhysicalAssessmentRecord.initModel(sequelize);
✅ 测评系统模型初始化完成
=== 测评系统模型初始化完成 ===`;

// 找到该行的结束位置
const gameSectionEnd = content.indexOf('=== 游戏系统模型初始化完成 ===', gameInitEnd) + '=== 游戏系统模型初始化完成 ==='.length;

content = content.slice(0, gameSectionEnd) + assessmentInit + content.slice(gameSectionEnd);

// 3. 在导出列表中添加测评模型
const exportStartIndex = content.indexOf('export const allModels = {');
const exportEndIndex = content.indexOf('};', exportStartIndex) + 2;

if (exportStartIndex === -1 || exportEndIndex === -1) {
  console.log('❌ 无法找到导出对象');
  process.exit(1);
}

const currentExports = content.slice(exportStartIndex, exportEndIndex);
const newExports = currentExports.replace(
  '  OutdoorTrainingRecord\n};',
  `  OutdoorTrainingRecord,
  // 测评系统模型
  AssessmentConfig,
  AssessmentQuestion,
  AssessmentRecord,
  AssessmentAnswer,
  AssessmentReport,
  AssessmentGrowthTracking,
  PhysicalAssessmentRecord
};`
);

content = content.slice(0, exportStartIndex) + newExports + content.slice(exportEndIndex);

// 写入修复后的文件
fs.writeFileSync(initPath, content, 'utf8');

console.log('✅ init.ts 中的测评模型初始化修复完成');
console.log('🔄 请重启服务器以使更改生效');