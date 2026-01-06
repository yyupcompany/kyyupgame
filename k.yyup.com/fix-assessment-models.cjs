/**
 * 修复测评模型导入问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复测评模型导入问题...');

const modelsIndexPath = '/home/zhgue/kyyupgame/k.yyup.com/server/src/models/index.ts';

// 读取当前的模型文件内容
let content = fs.readFileSync(modelsIndexPath, 'utf8');

// 检查是否已经包含测评模型
if (content.includes('AssessmentConfig')) {
  console.log('✅ 测评模型已经存在于主模型文件中');
  process.exit(0);
}

// 找到导入语句的位置（在其他模型导入之后）
// 我们将在其他模型导入后添加测评模型导入
const importInsertPosition = content.indexOf('// 导入财务模型');
if (importInsertPosition === -1) {
  console.log('❌ 无法找到合适的插入位置');
  process.exit(1);
}

// 测评模型导入语句
const assessmentImports = `// 测评系统模型
import { AssessmentConfig } from './assessment-config.model';
import { AssessmentQuestion } from './assessment-question.model';
import { AssessmentRecord, AssessmentStatus } from './assessment-record.model';
import { AssessmentAnswer } from './assessment-answer.model';
import { AssessmentReport } from './assessment-report.model';
import { AssessmentGrowthTracking } from './assessment-growth-tracking.model';
import { PhysicalAssessmentRecord } from './physical-assessment-record.model';
`;

// 在找到的位置插入测评模型导入
content = content.slice(0, importInsertPosition) + assessmentImports + content.slice(importInsertPosition);

// 找到导出对象的位置，添加测评模型导出
const exportStartIndex = content.indexOf('export {');
const exportEndIndex = content.indexOf('};', exportStartIndex) + 2;

if (exportStartIndex === -1 || exportEndIndex === -1) {
  console.log('❌ 无法找到导出对象');
  process.exit(1);
}

const currentExports = content.slice(exportStartIndex, exportEndIndex);
const newExports = currentExports.replace(
  '  FieldTemplate\n};',
  `  FieldTemplate,
  // 测评系统模型
  AssessmentConfig, AssessmentQuestion, AssessmentRecord, AssessmentStatus,
  AssessmentAnswer, AssessmentReport, AssessmentGrowthTracking,
  PhysicalAssessmentRecord
};`
);

content = content.slice(0, exportStartIndex) + newExports + content.slice(exportEndIndex);

// 找到初始化函数的位置，添加测评模型初始化
const initFuncIndex = content.indexOf('export const initModels = (sequelize: Sequelize): void => {');
const initFuncEndIndex = content.indexOf('}', content.indexOf('第二步: 使用专门的方法进行模型关联', initFuncIndex)) + 1;

if (initFuncIndex === -1 || initFuncEndIndex === -1) {
  console.log('❌ 无法找到初始化函数');
  process.exit(1);
}

const initFuncStart = content.slice(0, initFuncIndex);
const initFuncContent = content.slice(initFuncIndex, initFuncEndIndex);
const initFuncEnd = content.slice(initFuncEndIndex);

// 在初始化函数中添加测评模型初始化
const newInitContent = initFuncContent.replace(
  '  // 第二步: 使用专门的方法进行模型关联',
  `  // 初始化测评系统模型
  console.log('初始化测评系统模型...');
  AssessmentConfig.initModel(sequelize);
  AssessmentQuestion.initModel(sequelize);
  AssessmentRecord.initModel(sequelize);
  AssessmentAnswer.initModel(sequelize);
  AssessmentReport.initModel(sequelize);
  AssessmentGrowthTracking.initModel(sequelize);
  PhysicalAssessmentRecord.initModel(sequelize);

  // 第二步: 使用专门的方法进行模型关联`
);

content = initFuncStart + newInitContent + initFuncEnd;

// 找到关联设置函数，添加测评模型关联
const associationFuncIndex = content.indexOf('function setupAssociations(): void {');
const associationFuncEndIndex = content.indexOf('}', associationFuncIndex) + 1;

if (associationFuncIndex === -1 || associationFuncEndIndex === -1) {
  console.log('❌ 无法找到关联设置函数');
  process.exit(1);
}

const associationFuncStart = content.slice(0, associationFuncIndex);
const associationFuncContent = content.slice(associationFuncIndex, associationFuncEndIndex);
const associationFuncEnd = content.slice(associationFuncEndIndex);

// 在关联设置函数中添加测评模型关联
const newAssociationContent = associationFuncContent.replace(
  '  console.log(\'✅ 任务附件模型关联设置成功\');',
  `  console.log('✅ 任务附件模型关联设置成功');

  // 测评系统模型关联
  console.log('📊 设置测评系统模型关联...');
  try {
    // AssessmentConfig 和 AssessmentQuestion 的关联
    AssessmentConfig.hasMany(AssessmentQuestion, {
      foreignKey: 'configId',
      as: 'questions'
    });
    AssessmentQuestion.belongsTo(AssessmentConfig, {
      foreignKey: 'configId',
      as: 'config'
    });

    // AssessmentRecord 和其他模型的关联
    AssessmentRecord.hasMany(AssessmentAnswer, {
      foreignKey: 'recordId',
      as: 'answers'
    });
    AssessmentAnswer.belongsTo(AssessmentRecord, {
      foreignKey: 'recordId',
      as: 'record'
    });

    AssessmentRecord.hasOne(AssessmentReport, {
      foreignKey: 'recordId',
      as: 'report'
    });
    AssessmentReport.belongsTo(AssessmentRecord, {
      foreignKey: 'recordId',
      as: 'record'
    });

    // User 和 AssessmentRecord 的关联
    User.hasMany(AssessmentRecord, {
      foreignKey: 'userId',
      as: 'assessmentRecords'
    });
    AssessmentRecord.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user'
    });

    console.log('✅ 测评系统模型关联设置成功');
  } catch (error) {
    console.error('❌ 测评系统模型关联设置失败:', error);
    throw error;
  }`
);

content = associationFuncStart + newAssociationContent + associationFuncEnd;

// 写入修复后的文件
fs.writeFileSync(modelsIndexPath, content, 'utf8');

console.log('✅ 测评模型导入修复完成');
console.log('📝 已添加以下测评模型:');
console.log('  - AssessmentConfig (测评配置)');
console.log('  - AssessmentQuestion (测评题目)');
console.log('  - AssessmentRecord (测评记录)');
console.log('  - AssessmentAnswer (测评答案)');
console.log('  - AssessmentReport (测评报告)');
console.log('  - AssessmentGrowthTracking (成长轨迹)');
console.log('  - PhysicalAssessmentRecord (体能测评记录)');
console.log('');
console.log('🔄 请重启服务器以使更改生效');