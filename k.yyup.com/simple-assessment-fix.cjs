/**
 * 简单的测评模型修复 - 只添加必要的初始化代码
 */

const fs = require('fs');

console.log('🔧 修复测评模型初始化...');

const initPath = '/home/zhgue/kyyupgame/k.yyup.com/server/src/init.ts';
let content = fs.readFileSync(initPath, 'utf8');

// 1. 在游戏系统模型之前添加测评系统模型导入
const gameModelImport = '// 添加游戏系统模型';
const assessmentImport = `// 添加测评系统模型
import { AssessmentConfig } from './models/assessment-config.model';
import { AssessmentQuestion } from './models/assessment-question.model';
import { AssessmentRecord, AssessmentStatus } from './models/assessment-record.model';
import { AssessmentAnswer } from './models/assessment-answer.model';
import { AssessmentReport } from './models/assessment-report.model';
import { AssessmentGrowthTracking } from './models/assessment-growth-tracking.model';
import { PhysicalAssessmentRecord } from './models/physical-assessment-record.model';

${gameModelImport}`;

content = content.replace(gameModelImport, assessmentImport);

// 2. 在游戏系统模型初始化之后添加测评模型初始化
const gameInitEnd = "GameUserSettings.initModel(sequelize);";
const assessmentInit = `${gameInitEnd}

console.log('✅ 游戏系统模型初始化完成');
console.log('=== 游戏系统模型初始化完成 ===');
console.log('=== 开始初始化测评系统模型 ===');
console.log('🔍 初始化测评系统模型...');
AssessmentConfig.initModel(sequelize);
AssessmentQuestion.initModel(sequelize);
AssessmentRecord.initModel(sequelize);
AssessmentAnswer.initModel(sequelize);
AssessmentReport.initModel(sequelize);
AssessmentGrowthTracking.initModel(sequelize);
PhysicalAssessmentRecord.initModel(sequelize);
console.log('✅ 测评系统模型初始化完成');
console.log('=== 测评系统模型初始化完成 ===');`;

content = content.replace(gameInitEnd, assessmentInit);

// 3. 在导出列表中添加测评模型（在 OutdoorTrainingRecord 之后）
const exportEnd = "  OutdoorTrainingRecord";
const assessmentExport = `${exportEnd},
  // 测评系统模型
  AssessmentConfig,
  AssessmentQuestion,
  AssessmentRecord,
  AssessmentAnswer,
  AssessmentReport,
  AssessmentGrowthTracking,
  PhysicalAssessmentRecord`;

content = content.replace(exportEnd, assessmentExport);

// 写入修复后的文件
fs.writeFileSync(initPath, content, 'utf8');

console.log('✅ 测评模型初始化修复完成');
console.log('🔄 请重启服务器以使更改生效');