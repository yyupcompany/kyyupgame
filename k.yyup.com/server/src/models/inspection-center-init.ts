/**
 * 检查中心模型初始化
 * 统一初始化检查中心相关的所有模型
 */

import { Sequelize } from 'sequelize';
import InspectionType from './inspection-type.model';
import InspectionPlan from './inspection-plan.model';
import DocumentTemplate from './document-template.model';
import DocumentInstance from './document-instance.model';
import InspectionTask from './inspection-task.model';
import InspectionRecord, { InspectionRecordItem } from './inspection-record.model';
import InspectionRectification, { RectificationProgressLog } from './inspection-rectification.model';
import { DocumentAIScore } from './document-ai-score.model';

/**
 * 初始化检查中心模型
 */
export function initInspectionModels(sequelize: Sequelize): void {
  console.log('🔧 开始初始化检查中心模型...');
  
  // 初始化检查类型模型
  console.log('  - 初始化 InspectionType 模型...');
  InspectionType.initModel(sequelize);
  
  // 初始化检查计划模型
  console.log('  - 初始化 InspectionPlan 模型...');
  InspectionPlan.initModel(sequelize);
  
  // 初始化文档模板模型
  console.log('  - 初始化 DocumentTemplate 模型...');
  DocumentTemplate.initModel(sequelize);

  // 初始化文档实例模型
  console.log('  - 初始化 DocumentInstance 模型...');
  DocumentInstance.initModel(sequelize);

  // 初始化检查任务模型
  console.log('  - 初始化 InspectionTask 模型...');
  InspectionTask.initModel(sequelize);

  // 初始化检查记录模型
  console.log('  - 初始化 InspectionRecord 模型...');
  InspectionRecord.initModel(sequelize);

  // 初始化检查记录项模型
  console.log('  - 初始化 InspectionRecordItem 模型...');
  InspectionRecordItem.initModel(sequelize);

  // 初始化整改任务模型
  console.log('  - 初始化 InspectionRectification 模型...');
  InspectionRectification.initModel(sequelize);

  // 初始化整改进度日志模型
  console.log('  - 初始化 RectificationProgressLog 模型...');
  RectificationProgressLog.initModel(sequelize);

  // 初始化文档AI评分模型
  console.log('  - 初始化 DocumentAIScore 模型...');
  DocumentAIScore.initModel(sequelize);

  console.log('✅ 检查中心模型初始化完成');
}

/**
 * 设置检查中心模型关联
 */
export function setupInspectionAssociations(): void {
  console.log('🔗 开始设置检查中心模型关联...');

  // DocumentTemplate 和 DocumentInstance 的关联
  DocumentTemplate.hasMany(DocumentInstance, {
    foreignKey: 'templateId',
    as: 'instances'
  });

  DocumentInstance.belongsTo(DocumentTemplate, {
    foreignKey: 'templateId',
    as: 'template'
  });
  console.log('  - DocumentTemplate <-> DocumentInstance 关联已设置');

  // InspectionTask 和 DocumentInstance 的关联
  InspectionTask.hasMany(DocumentInstance, {
    foreignKey: 'inspectionTaskId',
    as: 'documents'
  });

  DocumentInstance.belongsTo(InspectionTask, {
    foreignKey: 'inspectionTaskId',
    as: 'task'
  });
  console.log('  - InspectionTask <-> DocumentInstance 关联已设置');

  // InspectionType 和 InspectionPlan 的关联
  InspectionType.hasMany(InspectionPlan, {
    foreignKey: 'inspectionTypeId',
    as: 'plans'
  });

  InspectionPlan.belongsTo(InspectionType, {
    foreignKey: 'inspectionTypeId',
    as: 'type'
  });
  console.log('  - InspectionType <-> InspectionPlan 关联已设置');

  // InspectionPlan 和 InspectionTask 的关联
  InspectionPlan.hasMany(InspectionTask, {
    foreignKey: 'planId',
    as: 'tasks'
  });

  InspectionTask.belongsTo(InspectionPlan, {
    foreignKey: 'planId',
    as: 'plan'
  });
  console.log('  - InspectionPlan <-> InspectionTask 关联已设置');

  // InspectionPlan 和 InspectionRecord 的关联
  InspectionPlan.hasMany(InspectionRecord, {
    foreignKey: 'inspectionPlanId',
    as: 'records'
  });

  InspectionRecord.belongsTo(InspectionPlan, {
    foreignKey: 'inspectionPlanId',
    as: 'inspectionPlan'
  });
  console.log('  - InspectionPlan <-> InspectionRecord 关联已设置');

  // InspectionRecord 和 InspectionRecordItem 的关联
  InspectionRecord.hasMany(InspectionRecordItem, {
    foreignKey: 'recordId',
    as: 'items'
  });

  InspectionRecordItem.belongsTo(InspectionRecord, {
    foreignKey: 'recordId',
    as: 'record'
  });
  console.log('  - InspectionRecord <-> InspectionRecordItem 关联已设置');

  // InspectionPlan 和 InspectionRectification 的关联
  InspectionPlan.hasMany(InspectionRectification, {
    foreignKey: 'inspectionPlanId',
    as: 'rectifications'
  });

  InspectionRectification.belongsTo(InspectionPlan, {
    foreignKey: 'inspectionPlanId',
    as: 'inspectionPlan'
  });
  console.log('  - InspectionPlan <-> InspectionRectification 关联已设置');

  // InspectionRecord 和 InspectionRectification 的关联
  InspectionRecord.hasMany(InspectionRectification, {
    foreignKey: 'recordId',
    as: 'rectifications'
  });

  InspectionRectification.belongsTo(InspectionRecord, {
    foreignKey: 'recordId',
    as: 'record'
  });
  console.log('  - InspectionRecord <-> InspectionRectification 关联已设置');

  // InspectionRecordItem 和 InspectionRectification 的关联
  InspectionRecordItem.hasMany(InspectionRectification, {
    foreignKey: 'recordItemId',
    as: 'rectifications'
  });

  InspectionRectification.belongsTo(InspectionRecordItem, {
    foreignKey: 'recordItemId',
    as: 'recordItem'
  });
  console.log('  - InspectionRecordItem <-> InspectionRectification 关联已设置');

  // InspectionRectification 和 RectificationProgressLog 的关联
  InspectionRectification.hasMany(RectificationProgressLog, {
    foreignKey: 'rectificationId',
    as: 'progressLogs'
  });

  RectificationProgressLog.belongsTo(InspectionRectification, {
    foreignKey: 'rectificationId',
    as: 'rectification'
  });
  console.log('  - InspectionRectification <-> RectificationProgressLog 关联已设置');

  // DocumentInstance 和 DocumentAIScore 的关联
  DocumentInstance.hasMany(DocumentAIScore, {
    foreignKey: 'documentInstanceId',
    as: 'aiScores'
  });

  DocumentAIScore.belongsTo(DocumentInstance, {
    foreignKey: 'documentInstanceId',
    as: 'documentInstance'
  });
  console.log('  - DocumentInstance <-> DocumentAIScore 关联已设置');

  console.log('✅ 检查中心模型关联设置完成');
}
