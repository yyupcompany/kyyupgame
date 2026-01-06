/**
 * 修复测评模型导出和初始化
 */

const fs = require('fs');

console.log('🔧 修复测评模型导出和初始化...');

const modelsIndexPath = '/home/zhgue/kyyupgame/k.yyup.com/server/src/models/index.ts';
let content = fs.readFileSync(modelsIndexPath, 'utf8');

// 1. 修复导出列表 - 在 FieldTemplate 后添加测评模型
const exportFix = content.replace(
  '  // 字段模板模型\n  FieldTemplate\n  // AIQueryLog, AIQueryTemplate, AIQueryCache, AIQueryFeedback\n};',
  '  // 字段模板模型\n  FieldTemplate,\n  // 测评系统模型\n  AssessmentConfig, AssessmentQuestion, AssessmentRecord, AssessmentStatus,\n  AssessmentAnswer, AssessmentReport, AssessmentGrowthTracking, PhysicalAssessmentRecord\n  // AIQueryLog, AIQueryTemplate, AIQueryCache, AIQueryFeedback\n};'
);

if (exportFix !== content) {
  content = exportFix;
  console.log('✅ 修复了导出列表');
}

// 2. 修复初始化函数 - 在第一个模型初始化后添加测评模型初始化
const initFix = content.replace(
  '  // User 模型\n  User.initModel(sequelize);',
  '  // User 模型\n  User.initModel(sequelize);\n\n  // 初始化测评系统模型\n  console.log(\'初始化测评系统模型...\');\n  AssessmentConfig.initModel(sequelize);\n  AssessmentQuestion.initModel(sequelize);\n  AssessmentRecord.initModel(sequelize);\n  AssessmentAnswer.initModel(sequelize);\n  AssessmentReport.initModel(sequelize);\n  AssessmentGrowthTracking.initModel(sequelize);\n  PhysicalAssessmentRecord.initModel(sequelize);'
);

if (initFix !== content) {
  content = initFix;
  console.log('✅ 修复了初始化函数');
}

// 3. 修复关联设置 - 在 setupAssociations 函数中添加测评模型关联
const associationFix = content.replace(
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

if (associationFix !== content) {
  content = associationFix;
  console.log('✅ 修复了关联设置');
}

// 写入修复后的文件
fs.writeFileSync(modelsIndexPath, content, 'utf8');

console.log('✅ 测评模型修复完成');
console.log('🔄 请重启服务器以使更改生效');