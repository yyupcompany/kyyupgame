import { Sequelize } from 'sequelize';
import { User, UserStatus, UserRole } from './user.model';
import { Role } from './role.model';
import { Permission, PermissionType, PermissionStatus } from './permission.model';
import { UserRole as UserRoleModel } from './user-role.model';
import { RolePermission } from './role-permission.model';
import { Kindergarten, initKindergarten } from './kindergarten.model';
import { Teacher, initTeacher, initTeacherAssociations } from './teacher.model';
import { Student, initStudent, initStudentAssociations } from './student.model';
import { Parent } from './parent.model';
import { Class, initClass, initClassAssociations } from './class.model';
import { ClassTeacher, initClassTeacher, initClassTeacherAssociations } from './class-teacher.model';
import { EnrollmentPlan } from './enrollment-plan.model';
import { EnrollmentApplication } from './enrollment-application.model';
import { EnrollmentPlanAssignee } from './enrollment-plan-assignee.model';
import { EnrollmentConsultation } from './enrollment-consultation.model';
import { EnrollmentConsultationFollowup } from './enrollment-consultation-followup.model';
import { EnrollmentPlanTracking } from './enrollment-plan-tracking.model';
import { Activity, ActivityStatus } from './activity.model';
import { ActivityTemplate } from './activity-template.model';
import { ActivityRegistration } from './activity-registration.model';
import { ActivityEvaluation } from './activity-evaluation.model';
import { Todo, TodoStatus, TodoCreationAttributes } from './todo.model';
import { Notification, NotificationStatus, NotificationType } from './notification.model';
import { Schedule, ScheduleCreationAttributes, ScheduleStatus, RepeatType } from './schedule.model';
import { PerformanceRule, initPerformanceRule, initPerformanceRuleAssociations } from './PerformanceRule';
import { SystemLog } from './system-log.model';
import { AIMessage } from './ai-message.model';
import { AIConversation, initAIConversation, initAIConversationAssociations } from './ai-conversation.model';
// AIMemory model removed - replaced by six-dimensional memory system
import { AIFeedback } from './ai-feedback.model';
// 🚀 AI模型已迁移到统一租户中心
// import { AIModelUsage } from './ai-model-usage.model';
// import { AIModelConfig } from './ai-model-config.model';
// import { AIModelBilling } from './ai-model-billing.model';
import { AIBillingRecord, initAIBillingRecord, initAIBillingRecordAssociations } from './ai-billing-record.model';
import { AIUserRelation } from './ai-user-relation.model';
import { AIUserPermission } from './ai-user-permission.model';
import AIQueryHistory from './AIQueryHistory';
import { ParentFollowup } from './parent-followup.model';
import { ChannelTracking } from './channel-tracking.model';
import { ConversionTracking } from './conversion-tracking.model';
import { EnrollmentTask } from './enrollment-task.model';
import { Approval, ApprovalType, ApprovalStatus, ApprovalUrgency } from './approval.model';
import { PageGuide, PageGuideSection } from './page-guide.model';
import { PosterCategory } from './poster-category.model';
// 教学中心模型
import { BrainScienceCourse, initBrainScienceCourseModel } from './brain-science-course.model';
import { CoursePlan, initCoursePlanModel } from './course-plan.model';
import { CourseProgress, initCourseProgressModel } from './course-progress.model';
import { TeachingMediaRecord, initTeachingMediaRecordModel } from './teaching-media-record.model';
import { OutdoorTrainingRecord, initOutdoorTrainingRecordModel } from './outdoor-training-record.model';
import { ExternalDisplayRecord, initExternalDisplayRecordModel } from './external-display-record.model';
import { ChampionshipRecord, initChampionshipRecordModel } from './championship-record.model';
import { TeacherClassCourse, initTeacherClassCourseModel } from './teacher-class-course.model';
import { TeacherCourseRecord, initTeacherCourseRecordModel } from './teacher-course-record.model';
// 客户跟进增强版模型
import { CustomerFollowStage } from './customer-follow-stage.model';
import { CustomerFollowRecordEnhanced } from './customer-follow-record-enhanced.model';
import { CustomerFollowMedia } from './customer-follow-media.model';
// 客户申请模型
import { CustomerApplication, CustomerApplicationStatus } from './customer-application.model';
// 任务附件模型
import { TaskAttachment } from './task-attachment.model';
// 视频制作模型
import VideoProject, { initVideoProjectModel } from './video-project.model';
// 媒体中心模型
import { MediaContent, initMediaContent, defineMediaContentAssociations } from './media-content.model';
// 考勤相关模型
import { Attendance, AttendanceStatus, HealthStatus, initAttendanceModel, associateAttendance } from './attendance.model';
import { AttendanceChangeLog, ChangeType, initAttendanceChangeLogModel } from './attendance-change-log.model';
import { TeacherAttendance, TeacherAttendanceStatus, LeaveType, initTeacherAttendanceModel } from './teacher-attendance.model';
import { AttendanceStatistics, initAttendanceStatisticsModel } from './attendance-statistics.model';
import { Task } from './task.model';
// 检查中心模型
import InspectionType from './inspection-type.model';
import InspectionPlan from './inspection-plan.model';
import DocumentTemplate from './document-template.model';
import DocumentInstance from './document-instance.model';
import InspectionTask from './inspection-task.model';
import { initInspectionModels, setupInspectionAssociations } from './inspection-center-init';
// 机构现状模型
import { OrganizationStatus, initOrganizationStatus, initOrganizationStatusAssociations } from './organization-status.model';
// 字段模板模型
import FieldTemplate, { initFieldTemplate } from './field-template.model';
// 营销活动模型
import { GroupBuy, initGroupBuy, initGroupBuyAssociations } from './marketing/group-buy.model';
import { GroupBuyMember, initGroupBuyMember, initGroupBuyMemberAssociations } from './marketing/group-buy-member.model';
import { CollectActivity, initCollectActivity, initCollectActivityAssociations } from './marketing/collect-activity.model';
import { CollectRecord, initCollectRecord, initCollectRecordAssociations } from './marketing/collect-record.model';
import { TieredReward, initTieredReward, initTieredRewardAssociations } from './marketing/tiered-reward.model';
import { TieredRewardRecord, initTieredRewardRecord, initTieredRewardRecordAssociations } from './marketing/tiered-reward-record.model';
// 订单和支付模型
import { Order } from './order.model';
// import { AutomationTask, AutomationTemplate, ExecutionHistory } from './automationModels';
// import { AIQueryLog } from './ai-query-log.model';
// import { AIQueryTemplate } from './ai-query-template.model';
// import { AIQueryCache } from './ai-query-cache.model';
// import { AIQueryFeedback } from './ai-query-feedback.model';
// 训练中心模型
import { TrainingActivity } from './training-activity.model';
import { TrainingPlan } from './training-plan.model';
import { TrainingRecord } from './training-record.model';
import { TrainingAchievement } from './training-achievement.model';
// 测评系统模型
import { AssessmentConfig } from './assessment-config.model';
import { AssessmentQuestion } from './assessment-question.model';
import { PhysicalTrainingItem } from './physical-training-item.model';
import { AssessmentRecord } from './assessment-record.model';
// 成长记录模型
import { GrowthRecord, GrowthRecordType, MeasurementType, initGrowthRecord, initGrowthRecordAssociations } from './growth-record.model';

// 导出所有模型
export {
  User, UserStatus, UserRole, Role, Permission, PermissionType, PermissionStatus, UserRoleModel, RolePermission,
  Kindergarten, Teacher, Student, Parent, Class, ClassTeacher,
  EnrollmentPlan, EnrollmentApplication, EnrollmentPlanAssignee, EnrollmentConsultation, EnrollmentConsultationFollowup, EnrollmentPlanTracking,
  Activity, ActivityStatus, ActivityTemplate, ActivityRegistration, ActivityEvaluation,
  Todo, TodoStatus, TodoCreationAttributes, Notification, NotificationStatus, NotificationType, Schedule, ScheduleCreationAttributes, ScheduleStatus, RepeatType, SystemLog,
  AIMessage, AIConversation, AIFeedback, /* AIModelUsage, AIModelConfig, AIModelBilling, */ AIBillingRecord, AIUserRelation, AIUserPermission, AIQueryHistory, ParentFollowup,
  ChannelTracking, ConversionTracking, EnrollmentTask, PerformanceRule, Approval, ApprovalType, ApprovalStatus, ApprovalUrgency,
  PageGuide, PageGuideSection, PosterCategory,
  // 教学中心模型
  BrainScienceCourse, CoursePlan, CourseProgress, TeachingMediaRecord,
  OutdoorTrainingRecord, ExternalDisplayRecord, ChampionshipRecord,
  TeacherClassCourse, TeacherCourseRecord,
  // 客户申请模型
  CustomerApplication, CustomerApplicationStatus,
  // 任务附件模型
  TaskAttachment,
  // 视频制作模型
  VideoProject,
  // 媒体中心模型
  MediaContent,
  // 考勤相关模型
  Attendance, AttendanceStatus, HealthStatus, AttendanceChangeLog, ChangeType,
  TeacherAttendance, TeacherAttendanceStatus, LeaveType, AttendanceStatistics, Task,
  // 检查中心模型
  InspectionType, InspectionPlan, DocumentTemplate, DocumentInstance, InspectionTask,
  // 训练中心模型
  TrainingActivity, TrainingPlan, TrainingRecord, TrainingAchievement,
  // 测评系统模型
  AssessmentConfig, AssessmentQuestion, PhysicalTrainingItem, AssessmentRecord,
  // 成长记录模型
  GrowthRecord, GrowthRecordType, MeasurementType,
  // 机构现状模型
  OrganizationStatus,
  // 字段模板模型
  FieldTemplate,
  // 营销活动模型
  GroupBuy, GroupBuyMember, CollectActivity, CollectRecord, TieredReward, TieredRewardRecord,
  // 订单和支付模型
  Order
  // AIQueryLog, AIQueryTemplate, AIQueryCache, AIQueryFeedback
};

// 导入财务模型
import { initFinanceModels } from './finance.model';
export { FeeItem, FeePackageTemplate, PaymentBill, PaymentRecord, FinancialReport } from './finance.model';

/**
 * 初始化所有模型
 * @param sequelize Sequelize实例
 */
export const initModels = (sequelize: Sequelize): void => {
  console.log('初始化模型...');
  
  // 第一步: 初始化所有模型
  // 核心认证模型
  User.initModel(sequelize);
  Role.initModel(sequelize);
  Permission.initModel(sequelize);
  UserRoleModel.initModel(sequelize);
  RolePermission.initModel(sequelize);

  // 基础业务模型
  initKindergarten(sequelize);
  initClass(sequelize);       // 班级模型
  initTeacher(sequelize);     // 教师模型
  initStudent(sequelize);     // 学生模型
  Parent.initModel(sequelize); // 家长模型
  initClassTeacher(sequelize);

  // 招生管理模型
  EnrollmentConsultation.initModel(sequelize);
  EnrollmentConsultationFollowup.initModel(sequelize);

  // 客户跟进增强版模型
  CustomerFollowStage.initModel(sequelize);
  CustomerFollowRecordEnhanced.initModel(sequelize);
  CustomerFollowMedia.initModel(sequelize);

  // 客户申请模型
  console.log('📝 初始化客户申请模型...');
  try {
    CustomerApplication.initModel(sequelize);
    console.log('✅ 客户申请模型初始化成功');
  } catch (error) {
    console.error('❌ 客户申请模型初始化失败:', error);
    throw error;
  }

  // 添加必要的业务模型初始化
  Todo.initModel(sequelize);
  Task.initModel(sequelize);
  Schedule.initModel(sequelize);
  Notification.initModel(sequelize);
  initPerformanceRule(sequelize);

  // 任务附件模型
  console.log('📎 初始化任务附件模型...');
  try {
    TaskAttachment.initModel(sequelize);
    console.log('✅ 任务附件模型初始化成功');
  } catch (error) {
    console.error('❌ 任务附件模型初始化失败:', error);
    throw error;
  }

  // AI相关模型 - 传统AIMemory已移除，使用六维记忆系统
  console.log('🤖 AI查询历史模型已在自身文件中初始化');
  console.log('✅ AI查询历史模型初始化成功');

  // 海报相关模型
  console.log('🔍 准备调用 PosterCategory.initModel...');
  PosterCategory.initModel(sequelize);
  console.log('✅ PosterCategory.initModel 调用成功');

  // 教学中心模型
  console.log('🔍 准备初始化教学中心模型...');
  try {
    initBrainScienceCourseModel(sequelize);
    initCoursePlanModel(sequelize);
    initCourseProgressModel(sequelize);
    initTeachingMediaRecordModel(sequelize);
    initOutdoorTrainingRecordModel(sequelize);
    initExternalDisplayRecordModel(sequelize);
    initChampionshipRecordModel(sequelize);
    initTeacherClassCourseModel(sequelize);
    initTeacherCourseRecordModel(sequelize);
    console.log('✅ 教学中心模型初始化成功');
  } catch (error) {
    console.error('❌ 教学中心模型初始化失败:', error);
    throw error;
  }

  // 媒体中心模型
  console.log('🔍 准备初始化媒体中心模型...');
  try {
    initMediaContent(sequelize);
    console.log('✅ 媒体中心模型初始化成功');
  } catch (error) {
    console.error('❌ 媒体中心模型初始化失败:', error);
    throw error;
  }

  // 财务相关模型
  console.log('🔍 准备调用 initFinanceModels...');
  try {
    initFinanceModels(sequelize);
    console.log('✅ initFinanceModels 调用成功');
  } catch (error) {
    console.error('❌ initFinanceModels 调用失败:', error);
    throw error;
  }

  // 营销活动模型
  console.log('🔍 准备初始化营销活动模型...');
  try {
    initGroupBuy(sequelize);
    initGroupBuyMember(sequelize);
    initCollectActivity(sequelize);
    initCollectRecord(sequelize);
    initTieredReward(sequelize);
    initTieredRewardRecord(sequelize);
    console.log('✅ 营销活动模型初始化成功');
  } catch (error) {
    console.error('❌ 营销活动模型初始化失败:', error);
    throw error;
  }

  // 订单和支付模型
  console.log('💰 准备初始化订单和支付模型...');
  try {
    Order.initModel(sequelize);
    console.log('✅ 订单和支付模型初始化成功');
  } catch (error) {
    console.error('❌ 订单和支付模型初始化失败:', error);
    throw error;
  }

  // 训练中心模型
  console.log('🎯 准备初始化训练中心模型...');
  try {
    TrainingActivity.initModel(sequelize);
    TrainingPlan.initModel(sequelize);
    TrainingRecord.initModel(sequelize);
    TrainingAchievement.initModel(sequelize);
    console.log('✅ 训练中心模型初始化成功');
  } catch (error) {
    console.error('❌ 训练中心模型初始化失败:', error);
    throw error;
  }

  // 测评系统模型
  console.log('📊 准备初始化测评系统模型...');
  try {
    AssessmentConfig.initModel(sequelize);
    AssessmentQuestion.initModel(sequelize);
    PhysicalTrainingItem.initModel(sequelize);
    AssessmentRecord.initModel(sequelize);
    console.log('✅ 测评系统模型初始化成功');
  } catch (error) {
    console.error('❌ 测评系统模型初始化失败:', error);
    throw error;
  }

  // 成长记录模型
  console.log('📈 准备初始化成长记录模型...');
  try {
    initGrowthRecord(sequelize);
    console.log('✅ 成长记录模型初始化成功');
  } catch (error) {
    console.error('❌ 成长记录模型初始化失败:', error);
    throw error;
  }

  // 视频制作模型
  console.log('🎬 初始化视频制作模型...');
  try {
    initVideoProjectModel(sequelize);
    console.log('✅ 视频制作模型初始化成功');
  } catch (error) {
    console.error('❌ 视频制作模型初始化失败:', error);
    throw error;
  }

  // 检查中心模型
  console.log('📋 初始化检查中心模型...');
  try {
    InspectionType.initModel(sequelize);
    InspectionPlan.initModel(sequelize);
    DocumentTemplate.initModel(sequelize);
    InspectionTask.initModel(sequelize);
    console.log('✅ 检查中心模型初始化成功');
  } catch (error) {
    console.error('❌ 检查中心模型初始化失败:', error);
    throw error;
  }

  // 机构现状模型
  console.log('🏢 初始化机构现状模型...');
  try {
    initOrganizationStatus(sequelize);
    console.log('✅ 机构现状模型初始化成功');
  } catch (error) {
    console.error('❌ 机构现状模型初始化失败:', error);
    throw error;
  }

  // AI会话和消息模型
  console.log('🤖 初始化AI会话和消息模型...');
  try {
    initAIConversation(sequelize);
    AIMessage.initModel(sequelize);
    console.log('✅ AI会话和消息模型初始化成功');
  } catch (error) {
    console.error('❌ AI会话和消息模型初始化失败:', error);
    throw error;
  }

  // AI计费记录模型
  console.log('💰 初始化AI计费记录模型...');
  try {
    initAIBillingRecord(sequelize);
    console.log('✅ AI计费记录模型初始化成功');
  } catch (error) {
    console.error('❌ AI计费记录模型初始化失败:', error);
    throw error;
  }

  // 字段模板模型
  console.log('📋 初始化字段模板模型...');
  try {
    initFieldTemplate(sequelize);
    console.log('✅ 字段模板模型初始化成功');
  } catch (error) {
    console.error('❌ 字段模板模型初始化失败:', error);
    throw error;
  }

  // 考勤中心模型
  console.log('📅 初始化考勤中心模型...');
  try {
    initAttendanceModel(sequelize);
    initAttendanceChangeLogModel(sequelize);
    initTeacherAttendanceModel(sequelize);
    initAttendanceStatisticsModel(sequelize);
    console.log('✅ 考勤中心模型初始化成功');
  } catch (error) {
    console.error('❌ 考勤中心模型初始化失败:', error);
    throw error;
  }

  // 检查中心模型
  console.log('🔧 初始化检查中心模型...');
  try {
    initInspectionModels(sequelize);
    console.log('✅ 检查中心模型初始化成功');
  } catch (error) {
    console.error('❌ 检查中心模型初始化失败:', error);
    throw error;
  }

  // 第二步: 使用专门的方法进行模型关联
  setupAssociations();
};

/**
 * 设置模型之间的关联关系
 */
function setupAssociations(): void {
  console.log('设置模型关联关系...');
  
  // User 和 Role 之间的多对多关系
  User.belongsToMany(Role, {
    through: UserRoleModel,
    foreignKey: 'userId',
    otherKey: 'roleId',
    as: 'roles'
  });
  
  Role.belongsToMany(User, {
    through: UserRoleModel,
    foreignKey: 'roleId',
    otherKey: 'userId',
    as: 'users'
  });
  
  // Role 和 Permission 之间的多对多关系
  Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: 'roleId',
    otherKey: 'permissionId',
    as: 'permissions'
  });

  Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: 'permissionId',
    otherKey: 'roleId',
    as: 'permissionRoles'  // ✅ 修改别名避免与User.roles冲突
  });
  
  // ✅ 修复：添加User模型关联初始化（包括User.hasOne(Teacher)）
  User.initAssociations();

  // UserRoleModel关联
  UserRoleModel.initAssociations();

  // RolePermission关联 - 修复缓存初始化失败问题
  RolePermission.initAssociations();

  // 人员管理模型关联
  initTeacherAssociations();
  initStudentAssociations();
  Parent.initAssociations();
  initClassAssociations();
  initClassTeacherAssociations();
  
  // Todo模型关联
  Todo.initAssociations();
  
  // Schedule模型关联
  Schedule.initAssociations();
  
  // Notification模型关联
  Notification.initAssociations();
  
  // PerformanceRule模型关联
  initPerformanceRuleAssociations();
  
  // 旧的AIMemory模型关联已移除，使用六维记忆系统
  
  // 招生管理模型关联
  EnrollmentConsultation.initAssociations();
  EnrollmentConsultationFollowup.initAssociations();

  // 客户跟进增强版模型关联
  CustomerFollowRecordEnhanced.initAssociations();
  CustomerFollowMedia.initAssociations();

  // 客户申请模型关联
  console.log('📝 设置客户申请模型关联...');
  try {
    CustomerApplication.associate({
      User,
      Parent,
      Kindergarten
    });
    console.log('✅ 客户申请模型关联设置成功');
  } catch (error) {
    console.error('❌ 客户申请模型关联设置失败:', error);
    throw error;
  }

  // 任务附件模型关联
  console.log('📎 设置任务附件模型关联...');
  try {
    TaskAttachment.associate({
      Todo,
      User
    });
    console.log('✅ 任务附件模型关联设置成功');
  } catch (error) {
    console.error('❌ 任务附件模型关联设置失败:', error);
    throw error;
  }

  // 海报分类模型关联
  PosterCategory.initAssociations();

  // 教学中心模型关联
  BrainScienceCourse.associate();
  CoursePlan.associate();
  TeacherClassCourse.associate();
  TeacherCourseRecord.associate();

  // 媒体中心模型关联
  console.log('📱 设置媒体中心模型关联...');
  try {
    defineMediaContentAssociations();
    console.log('✅ 媒体中心模型关联设置成功');
  } catch (error) {
    console.error('❌ 媒体中心模型关联设置失败:', error);
    throw error;
  }
  CourseProgress.associate();

  // 视频制作模型关联
  VideoProject.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });
  User.hasMany(VideoProject, {
    foreignKey: 'userId',
    as: 'videoProjects'
  });
  TeachingMediaRecord.associate();

  // 教学中心模型关联
  OutdoorTrainingRecord.associate();
  ExternalDisplayRecord.associate();
  ChampionshipRecord.associate();

  // 注释：Class与教学中心记录的关联已在class.model.ts的initAssociations中定义，此处移除重复定义

  // 检查中心模型关联已移至 inspection-center-init.ts，由 setupInspectionAssociations() 调用
  // 此处注释掉避免重复定义导致别名冲突
  /*
  // InspectionPlan -> InspectionType
  InspectionPlan.belongsTo(InspectionType, {
    foreignKey: 'inspectionTypeId',
    as: 'inspectionType'
  });
  InspectionType.hasMany(InspectionPlan, {
    foreignKey: 'inspectionTypeId',
    as: 'plans'
  });

  // InspectionPlan -> Kindergarten
  InspectionPlan.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten'
  });
  Kindergarten.hasMany(InspectionPlan, {
    foreignKey: 'kindergartenId',
    as: 'inspectionPlans'
  });

  // InspectionPlan -> User (responsible)
  InspectionPlan.belongsTo(User, {
    foreignKey: 'responsibleUserId',
    as: 'responsibleUser'
  });

  // DocumentTemplate -> InspectionType
  DocumentTemplate.belongsTo(InspectionType, {
    foreignKey: 'inspectionTypeId',
    as: 'inspectionType'
  });
  InspectionType.hasMany(DocumentTemplate, {
    foreignKey: 'inspectionTypeId',
    as: 'templates'
  });

  // InspectionTask -> InspectionPlan
  InspectionTask.belongsTo(InspectionPlan, {
    foreignKey: 'inspectionPlanId',
    as: 'inspectionPlan'
  });
  InspectionPlan.hasMany(InspectionTask, {
    foreignKey: 'inspectionPlanId',
    as: 'tasks'
  });

  // InspectionTask -> InspectionTask (parent-child)
  InspectionTask.belongsTo(InspectionTask, {
    foreignKey: 'parentTaskId',
    as: 'parentTask'
  });
  InspectionTask.hasMany(InspectionTask, {
    foreignKey: 'parentTaskId',
    as: 'subtasks'
  });

  // InspectionTask -> User (assigned)
  InspectionTask.belongsTo(User, {
    foreignKey: 'assignedTo',
    as: 'assignedUser'
  });
  */

  // 机构现状关联
  initOrganizationStatusAssociations();

  // AI会话和消息模型关联
  console.log('🤖 设置AI会话和消息模型关联...');
  try {
    // 设置会话与消息的关联
    AIConversation.hasMany(AIMessage, {
      foreignKey: 'conversationId',
      as: 'messages',
      constraints: false
    });

    AIMessage.belongsTo(AIConversation, {
      foreignKey: 'conversationId',
      as: 'conversation',
      constraints: false
    });

    console.log('✅ AI会话和消息模型关联设置成功');
  } catch (error) {
    console.error('❌ AI会话和消息模型关联设置失败:', error);
    throw error;
  }

  // AI计费记录模型关联
  console.log('💰 设置AI计费记录模型关联...');
  try {
    initAIBillingRecordAssociations();
    console.log('✅ AI计费记录模型关联设置成功');
  } catch (error) {
    console.error('❌ AI计费记录模型关联设置失败:', error);
    throw error;
  }

  // 字段模板关联
  FieldTemplate.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'creator'
  });
  User.hasMany(FieldTemplate, {
    foreignKey: 'user_id',
    as: 'fieldTemplates'
  });

  // Task模型关联
  console.log('🐛 设置Task模型关联...');
  try {
    Task.associate({ User });
    console.log('✅ Task模型关联设置成功');
  } catch (error) {
    console.error('❌ Task模型关联设置失败:', error);
  }

  // Task模型的关联（修复constructor错误）
  try {
    // Task -> User (creator)
    Task.belongsTo(User, {
      foreignKey: 'creator_id',
      as: 'creator',
    });

    // Task -> User (assignee)
    Task.belongsTo(User, {
      foreignKey: 'assignee_id',
      as: 'assignee',
    });
    console.log('✅ Task模型与User的关联已正确设置');
  } catch (error) {
    console.error('❌ Task模型关联设置失败:', error);
  }

  // 考勤中心模型关联
  console.log('📅 设置考勤中心模型关联...');
  try {
    associateAttendance();
    console.log('✅ 考勤中心模型关联设置成功');
  } catch (error) {
    console.error('❌ 考勤中心模型关联设置失败:', error);
  }

  // 设置检查中心模型关联
  setupInspectionAssociations();

  // 营销活动模型关联
  console.log('🎯 设置营销活动模型关联...');
  try {
    initGroupBuyAssociations();
    initGroupBuyMemberAssociations();
    initCollectActivityAssociations();
    initCollectRecordAssociations();
    initTieredRewardAssociations();
    initTieredRewardRecordAssociations();
    console.log('✅ 营销活动模型关联设置成功');
  } catch (error) {
    console.error('❌ 营销活动模型关联设置失败:', error);
    throw error;
  }

  // 订单和支付模型关联
  console.log('💰 设置订单和支付模型关联...');
  try {
    // initOrderAssociations();
    console.log('✅ 订单和支付模型关联设置成功');
  } catch (error) {
    console.error('❌ 订单和支付模型关联设置失败:', error);
    throw error;
  }

  // 训练中心模型关联
  console.log('🎯 设置训练中心模型关联...');
  try {
    // TrainingPlan -> User
    TrainingPlan.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user'
    });
    User.hasMany(TrainingPlan, {
      foreignKey: 'userId',
      as: 'trainingPlans'
    });

    // TrainingPlan -> Student (childId)
    TrainingPlan.belongsTo(Student, {
      foreignKey: 'childId',
      as: 'child'
    });
    Student.hasMany(TrainingPlan, {
      foreignKey: 'childId',
      as: 'trainingPlans'
    });

    // TrainingPlan -> AssessmentReport
    if (typeof require !== 'undefined') {
      try {
        const AssessmentReport = require('./assessment-report.model').AssessmentReport;
        if (AssessmentReport) {
          TrainingPlan.belongsTo(AssessmentReport, {
            foreignKey: 'assessmentReportId',
            as: 'assessmentReport'
          });
        }
      } catch (error) {
        // AssessmentReport模型可能不存在，忽略错误
      }
    }

    // TrainingRecord -> TrainingPlan
    TrainingRecord.belongsTo(TrainingPlan, {
      foreignKey: 'planId',
      as: 'plan'
    });
    TrainingPlan.hasMany(TrainingRecord, {
      foreignKey: 'planId',
      as: 'records'
    });

    // TrainingRecord -> TrainingActivity
    TrainingRecord.belongsTo(TrainingActivity, {
      foreignKey: 'activityId',
      as: 'activity'
    });
    TrainingActivity.hasMany(TrainingRecord, {
      foreignKey: 'activityId',
      as: 'records'
    });

    // TrainingRecord -> Student (childId)
    TrainingRecord.belongsTo(Student, {
      foreignKey: 'childId',
      as: 'child'
    });
    Student.hasMany(TrainingRecord, {
      foreignKey: 'childId',
      as: 'trainingRecords'
    });

    // TrainingAchievement -> Student (childId)
    TrainingAchievement.belongsTo(Student, {
      foreignKey: 'childId',
      as: 'child'
    });
    Student.hasMany(TrainingAchievement, {
      foreignKey: 'childId',
      as: 'achievements'
    });

    // TrainingAchievement -> TrainingRecord
    TrainingAchievement.belongsTo(TrainingRecord, {
      foreignKey: 'relatedRecordId',
      as: 'trainingRecord'
    });
    TrainingRecord.hasOne(TrainingAchievement, {
      foreignKey: 'relatedRecordId',
      as: 'achievement'
    });

    console.log('✅ 训练中心模型关联设置成功');
  } catch (error) {
    console.error('❌ 训练中心模型关联设置失败:', error);
    throw error;
  }

  // 测评系统模型关联
  console.log('📊 设置测评系统模型关联...');
  try {
    // AssessmentConfig -> User (creator)
    AssessmentConfig.belongsTo(User, {
      foreignKey: 'creatorId',
      as: 'creator'
    });
    User.hasMany(AssessmentConfig, {
      foreignKey: 'creatorId',
      as: 'assessmentConfigs'
    });

    // AssessmentQuestion -> AssessmentConfig
    AssessmentQuestion.belongsTo(AssessmentConfig, {
      foreignKey: 'configId',
      as: 'config'
    });
    AssessmentConfig.hasMany(AssessmentQuestion, {
      foreignKey: 'configId',
      as: 'questions'
    });

    // AssessmentQuestion -> User (creator)
    AssessmentQuestion.belongsTo(User, {
      foreignKey: 'creatorId',
      as: 'creator'
    });
    User.hasMany(AssessmentQuestion, {
      foreignKey: 'creatorId',
      as: 'assessmentQuestions'
    });

    // AssessmentRecord -> Student
    AssessmentRecord.belongsTo(Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
    Student.hasMany(AssessmentRecord, {
      foreignKey: 'studentId',
      as: 'assessmentRecords'
    });

    // AssessmentRecord -> AssessmentConfig
    AssessmentRecord.belongsTo(AssessmentConfig, {
      foreignKey: 'configId',
      as: 'config'
    });
    AssessmentConfig.hasMany(AssessmentRecord, {
      foreignKey: 'configId',
      as: 'records'
    });

    // AssessmentRecord -> User (teacher)
    AssessmentRecord.belongsTo(User, {
      foreignKey: 'teacherId',
      as: 'teacher'
    });
    User.hasMany(AssessmentRecord, {
      foreignKey: 'teacherId',
      as: 'teacherAssessmentRecords'
    });

    console.log('✅ 测评系统模型关联设置成功');
  } catch (error) {
    console.error('❌ 测评系统模型关联设置失败:', error);
    throw error;
  }

  // 成长记录模型关联
  console.log('📈 设置成长记录模型关联...');
  try {
    initGrowthRecordAssociations();
    console.log('✅ 成长记录模型关联设置成功');
  } catch (error) {
    console.error('❌ 成长记录模型关联设置失败:', error);
    throw error;
  }

  console.log('模型关联设置完成');
}