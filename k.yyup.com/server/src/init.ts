/**
 * 数据库和模型初始化脚本
 * 按特定顺序初始化各个模块，避免循环依赖问题
 */

import { Sequelize } from 'sequelize';
import { getDatabaseConfig } from './config/database-unified';

// 获取统一的数据库配置
const dbConfig = getDatabaseConfig();

// 首先初始化 Sequelize 实例
console.log('=== 开始初始化数据库连接 ===');
console.log(`数据库连接信息: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

// 确保在后端启动时创建必要的表
async function ensureTablesExist() {
  try {
    const createAIBillingTableSQL = `
      CREATE TABLE IF NOT EXISTS ai_billing_records (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '计费记录ID',
        user_id INT NOT NULL COMMENT '用户ID',
        model_id INT NOT NULL COMMENT '模型ID',
        usage_id INT NOT NULL COMMENT '关联的使用记录ID',
        billing_type ENUM('token', 'second', 'count', 'character') NOT NULL COMMENT '计费类型',
        quantity DECIMAL(12, 2) NOT NULL DEFAULT 0 COMMENT '计量数量',
        unit VARCHAR(20) NOT NULL COMMENT '计量单位',
        input_tokens INT DEFAULT 0 COMMENT '输入Token数',
        output_tokens INT DEFAULT 0 COMMENT '输出Token数',
        duration_seconds DECIMAL(10, 2) DEFAULT 0 COMMENT '时长(秒)',
        image_count INT DEFAULT 0 COMMENT '图片数量',
        character_count INT DEFAULT 0 COMMENT '字符数',
        input_price DECIMAL(12, 8) DEFAULT 0 COMMENT '输入单价',
        output_price DECIMAL(12, 8) DEFAULT 0 COMMENT '输出单价',
        unit_price DECIMAL(12, 8) NOT NULL COMMENT '统一单价',
        total_cost DECIMAL(10, 6) NOT NULL COMMENT '总费用',
        currency VARCHAR(10) DEFAULT 'USD' COMMENT '货币单位',
        billing_status ENUM('pending', 'calculated', 'billed', 'paid', 'failed', 'refunded') DEFAULT 'pending' COMMENT '计费状态',
        billing_time DATETIME COMMENT '计费时间',
        payment_time DATETIME COMMENT '支付时间',
        billing_cycle VARCHAR(20) COMMENT '计费周期',
        remark TEXT COMMENT '备注信息',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (model_id) REFERENCES ai_model_config(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        FOREIGN KEY (usage_id) REFERENCES ai_model_usage(id) ON UPDATE CASCADE ON DELETE CASCADE,
        UNIQUE KEY idx_billing_usage_id (usage_id),
        KEY idx_billing_user_id (user_id),
        KEY idx_billing_model_id (model_id),
        KEY idx_billing_status (billing_status),
        KEY idx_billing_time (billing_time),
        KEY idx_billing_cycle (billing_cycle),
        KEY idx_billing_created_at (created_at),
        KEY idx_billing_user_cycle (user_id, billing_cycle),
        KEY idx_billing_user_status (user_id, billing_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI计费记录表'
    `;
    
    // 不在这里执行，而是延迟到数据库连接后执行
    (global as any).__ensureTablesSQL = createAIBillingTableSQL;
  } catch (error) {
    console.error('❌ 准备表创建SQL失败:', error);
  }
}

ensureTablesExist();

// 创建 Sequelize 实例
const sequelizeOptions: any = {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  define: dbConfig.define,
  logging: process.env.NODE_ENV === 'production' ? false : console.log
};

// SQLite不支持时区设置
if (dbConfig.dialect !== 'sqlite' && dbConfig.timezone) {
  sequelizeOptions.timezone = dbConfig.timezone;
}

// 添加其他配置
if (dbConfig.storage) {
  sequelizeOptions.storage = dbConfig.storage;
}
if (dbConfig.pool) {
  sequelizeOptions.pool = dbConfig.pool;
}

const sequelize = new Sequelize(
  dbConfig.database || '',
  dbConfig.username || '',
  dbConfig.password || '',
  sequelizeOptions
);

console.log('=== 数据库连接初始化完成 ===');

// 然后手动初始化核心模型
console.log('=== 开始初始化核心模型 ===');

// 从这里开始手动导入和初始化模型，避免循环依赖
import { User } from './models/user.model';
import { Role } from './models/role.model';
import { Permission } from './models/permission.model';
import { UserRole } from './models/user-role.model';
import { RolePermission } from './models/role-permission.model';
import { UserProfile } from './models/user-profile.model';
import { Kindergarten } from './models/kindergarten.model';
import { Parent } from './models/parent.model';
import { Student } from './models/student.model';
import { ParentStudentRelation } from './models/parent-student-relation.model';
import { Class } from './models/class.model';
import { ClassTeacher, initClassTeacher, initClassTeacherAssociations } from './models/class-teacher.model';
import { initKindergarten } from './models/kindergarten.model';
import { initStudent } from './models/student.model';
import { initClass } from './models/class.model';
import { initParentStudentRelation, initParentStudentRelationAssociations } from './models/parent-student-relation.model';
import { EnrollmentPlan } from './models/enrollment-plan.model';
import { Activity } from './models/activity.model';
import { ActivityTemplate, initActivityTemplate } from './models/activity-template.model';
import { EnrollmentApplication } from './models/enrollment-application.model';
import { AdmissionResult } from './models/admission-result.model';
import { ActivityRegistration } from './models/activity-registration.model';
import { initEnrollmentPlan, initEnrollmentPlanAssociations } from './models/enrollment-plan.model';
import { initActivity } from './models/activity.model';
import { initEnrollmentApplication, initEnrollmentApplicationAssociations } from './models/enrollment-application.model';
import { initAdmissionResult } from './models/admission-result.model';
import { AdmissionNotification, initAdmissionNotification } from './models/admission-notification.model';
import { initActivityRegistration } from './models/activity-registration.model';
import { ActivityParticipant } from './models/activity-participant.model';
import { Teacher } from './models/teacher.model';
import { ActivityEvaluation } from './models/activity-evaluation.model';
import { EnrollmentConsultation } from './models/enrollment-consultation.model';
import { EnrollmentConsultationFollowup } from './models/enrollment-consultation-followup.model';
import { EnrollmentTask } from './models/enrollment-task.model';
import { CustomerApplication } from './models/customer-application.model';
import { CustomerFollowStage } from './models/customer-follow-stage.model';
import { CustomerFollowRecordEnhanced } from './models/customer-follow-record-enhanced.model';
import { CustomerFollowMedia } from './models/customer-follow-media.model';
import { initTeacher } from './models/teacher.model';
import { initActivityEvaluation } from './models/activity-evaluation.model';
import { initEnrollmentTask } from './models/enrollment-task.model';
import { MarketingCampaign } from './models/marketing-campaign.model';
import { Advertisement } from './models/advertisement.model';
import { PosterTemplate } from './models/poster-template.model';
import { PosterElement } from './models/poster-element.model';
import { PosterGeneration } from './models/poster-generation.model';
import { MessageTemplate } from './models/message-template.model';
import { initMarketingCampaign } from './models/marketing-campaign.model';
import { initAdvertisement } from './models/advertisement.model';
import { initMessageTemplate } from './models/message-template.model';
// 🚀 AI模型已迁移到统一租户中心
// import { AIModelConfig, initAIModelConfig } from './models/ai-model-config.model';
// import { AIModelUsage, initAIModelUsage } from './models/ai-model-usage.model';
import { AIBillingRecord, initAIBillingRecord, initAIBillingRecordAssociations } from './models/ai-billing-record.model';
import { AIConversation, initAIConversation } from './models/ai-conversation.model';
import { AIMessage, initAIMessage } from './models/ai-message.model';
import { AIFeedback, initAIFeedback } from './models/ai-feedback.model';
import { AIUserPermission } from './models/ai-user-permission.model';
import AIQueryHistory from './models/AIQueryHistory';
import { initExpertConsultationModels, setupExpertConsultationAssociations, ExpertConsultation, ExpertSpeech, ActionPlan, ConsultationSummary } from './models/expert-consultation.model';
// 相册库模型
import { Photo } from './models/photo.model';
import { PhotoStudent } from './models/photo-student.model';
import { StudentFaceLibrary } from './models/student-face-library.model';
import { PhotoAlbum } from './models/photo-album.model';
import { PhotoAlbumItem } from './models/photo-album-item.model';
import { PhotoVideo } from './models/photo-video.model';
import { Notification } from './models/notification.model';
import { SystemLog } from './models/system-log.model';
import { GameConfig } from './models/game-config.model';
import { GameLevel } from './models/game-level.model';
import { GameRecord } from './models/game-record.model';
import { GameAchievement } from './models/game-achievement.model';
import { UserAchievement } from './models/user-achievement.model';
import { GameUserSettings } from './models/game-user-settings.model';
import { SystemConfig, initSystemConfig } from './models/system-config.model';
import { Schedule } from './models/schedule.model';
import { Todo } from './models/todo.model';
import { FileStorage, initFileStorage } from './models/file-storage.model';
import { OperationLog, initOperationLog } from './models/operation-log.model';
import { PerformanceRule, initPerformanceRule, initPerformanceRuleAssociations } from './models/PerformanceRule';
// 话术中心已删除，移除 script.model 相关引用
import { FeeItem, FeePackageTemplate, PaymentBill, PaymentRecord, FinancialReport } from './models/finance.model';
import VideoProject, { initVideoProjectModel } from './models/video-project.model';
// 媒体中心模型
import { MediaContent, initMediaContent, defineMediaContentAssociations } from './models/media-content.model';
// 检查中心模型
import InspectionType from './models/inspection-type.model';
import InspectionPlan from './models/inspection-plan.model';
import DocumentTemplate from './models/document-template.model';
import InspectionTask from './models/inspection-task.model';

// 教学中心模型
import { initCoursePlanModel } from './models/course-plan.model';
import { initBrainScienceCourseModel } from './models/brain-science-course.model';
import { initCourseProgressModel } from './models/course-progress.model';
import TeachingMediaRecord, { initTeachingMediaRecordModel } from './models/teaching-media-record.model';

// 考勤中心模型
import { Attendance, initAttendanceModel } from './models/attendance.model';
import { AttendanceStatistics, initAttendanceStatisticsModel } from './models/attendance-statistics.model';
import { AttendanceChangeLog, initAttendanceChangeLogModel } from './models/attendance-change-log.model';
import { initOutdoorTrainingRecordModel } from './models/outdoor-training-record.model';
import OutdoorTrainingRecord from './models/outdoor-training-record.model';

// 训练中心模型
import { initTrainingActivityModel } from './models/training-activity.model';
import { initTrainingPlanModel } from './models/training-plan.model';
import { initTrainingRecordModel } from './models/training-record.model';
import { initTrainingAchievementModel } from './models/training-achievement.model';
import { TrainingActivity } from './models/training-activity.model';
import { TrainingPlan } from './models/training-plan.model';
import { TrainingRecord } from './models/training-record.model';
import { TrainingAchievement } from './models/training-achievement.model';

// 测评系统模型
import { AssessmentConfig } from './models/assessment-config.model';
import { AssessmentQuestion } from './models/assessment-question.model';
import { PhysicalTrainingItem } from './models/physical-training-item.model';
import { AssessmentRecord } from './models/assessment-record.model';

// 初始化核心模型
console.log('初始化 User 模型...');
User.initModel(sequelize);

console.log('初始化 Role 模型...');
Role.initModel(sequelize);

console.log('初始化 Permission 模型...');
Permission.initModel(sequelize);

console.log('初始化 UserRole 模型...');
UserRole.initModel(sequelize);

console.log('初始化 RolePermission 模型...');
RolePermission.initModel(sequelize);

console.log('初始化 UserProfile 模型...');
UserProfile.initModel(sequelize);

// 添加第一批模型
console.log('=== 开始初始化第一批扩展模型 ===');

console.log('初始化 Kindergarten 模型...');
initKindergarten(sequelize);

console.log('初始化 Parent 模型...');
Parent.initModel(sequelize);

console.log('初始化 Student 模型...');
initStudent(sequelize);

console.log('初始化 ParentStudentRelation 模型...');
initParentStudentRelation(sequelize);

console.log('初始化 Class 模型...');
initClass(sequelize);

console.log('初始化 ClassTeacher 模型...');
initClassTeacher(sequelize);

console.log('=== 扩展模型初始化完成 ===');

// 添加第二批模型
console.log('=== 开始初始化第二批扩展模型 ===');

console.log('初始化 EnrollmentPlan 模型...');
initEnrollmentPlan(sequelize);

console.log('初始化 Activity 模型...');
initActivity(sequelize);

console.log('初始化 ActivityTemplate 模型...');
initActivityTemplate(sequelize);

console.log('初始化 EnrollmentApplication 模型...');
initEnrollmentApplication(sequelize);

console.log('初始化 AdmissionResult 模型...');
initAdmissionResult(sequelize);

console.log('初始化 AdmissionNotification 模型...');
initAdmissionNotification(sequelize);

console.log('初始化 ActivityRegistration 模型...');
initActivityRegistration(sequelize);

console.log('初始化 ActivityParticipant 模型...');
ActivityParticipant.initModel(sequelize);

// 添加第二批模型的关联
// 活动和活动报名关联
Activity.hasMany(ActivityRegistration, { foreignKey: 'activityId', as: 'registrations' });
ActivityRegistration.belongsTo(Activity, { foreignKey: 'activityId', as: 'activity' });

// 活动和活动参与者关联
Activity.hasMany(ActivityParticipant, { foreignKey: 'activityId', as: 'participants' });
ActivityParticipant.belongsTo(Activity, { foreignKey: 'activityId', as: 'activity' });

// 用户（教师）和活动参与者关联
User.hasMany(ActivityParticipant, { foreignKey: 'teacherId', as: 'activityParticipations' });
ActivityParticipant.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// 分配人和活动参与者关联
User.hasMany(ActivityParticipant, { foreignKey: 'assignedBy', as: 'assignedParticipations' });
ActivityParticipant.belongsTo(User, { foreignKey: 'assignedBy', as: 'assigner' });

// 活动报名和学生关联（只设置belongsTo，hasMany在initStudentAssociations中设置）
ActivityRegistration.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// 活动报名和家长学生关系关联
ActivityRegistration.belongsTo(ParentStudentRelation, { foreignKey: 'parentId', as: 'parent' });

// 招生计划和幼儿园关联 - 已在各自模型文件中定义，此处注释掉避免重复
// Kindergarten.hasMany(EnrollmentPlan, { foreignKey: 'kindergartenId', as: 'enrollmentPlans' });
// EnrollmentPlan.belongsTo(Kindergarten, { foreignKey: 'kindergartenId', as: 'kindergarten' });

// 招生计划和招生申请关联
EnrollmentPlan.hasMany(EnrollmentApplication, { foreignKey: 'planId', as: 'applications' });
EnrollmentApplication.belongsTo(EnrollmentPlan, { foreignKey: 'planId', as: 'plan' });

// 招生申请和录取结果关联
EnrollmentApplication.hasOne(AdmissionResult, { foreignKey: 'applicationId', as: 'admissionResult' });
AdmissionResult.belongsTo(EnrollmentApplication, { foreignKey: 'applicationId', as: 'application' });

// 录取结果和录取通知关联
AdmissionResult.hasMany(AdmissionNotification, { foreignKey: 'admissionId', as: 'notifications' });
AdmissionNotification.belongsTo(AdmissionResult, { foreignKey: 'admissionId', as: 'admission' });

// 家长学生关系和录取通知关联（在ParentStudentRelation关联初始化中定义）
// ParentStudentRelation.hasMany(AdmissionNotification, { foreignKey: 'parentId', as: 'admissionNotifications' });
// AdmissionNotification.belongsTo(ParentStudentRelation, { foreignKey: 'parentId', as: 'parent' });

console.log('=== 第二批扩展模型初始化完成 ===');

// 添加第三批模型
console.log('=== 开始初始化第三批扩展模型 ===');

console.log('初始化 Teacher 模型...');
initTeacher(sequelize);

console.log('初始化 ActivityEvaluation 模型...');
initActivityEvaluation(sequelize);

console.log('初始化 EnrollmentConsultation 模型...');
EnrollmentConsultation.initModel(sequelize);

console.log('初始化 EnrollmentConsultationFollowup 模型...');
EnrollmentConsultationFollowup.initModel(sequelize);

console.log('初始化 EnrollmentTask 模型...');
initEnrollmentTask(sequelize);

console.log('初始化 CustomerApplication 模型...');
CustomerApplication.initModel(sequelize);

console.log('初始化 CustomerFollowStage 模型...');
CustomerFollowStage.initModel(sequelize);

console.log('初始化 CustomerFollowRecordEnhanced 模型...');
CustomerFollowRecordEnhanced.initModel(sequelize);

console.log('初始化 CustomerFollowMedia 模型...');
CustomerFollowMedia.initModel(sequelize);

console.log('=== 第三批扩展模型初始化完成 ===');

// 添加第四批模型
console.log('=== 开始初始化第四批扩展模型 ===');

console.log('初始化 MarketingCampaign 模型...');
initMarketingCampaign(sequelize);

console.log('初始化 Advertisement 模型...');
initAdvertisement(sequelize);

console.log('初始化 PosterTemplate 模型...');
PosterTemplate.initModel(sequelize);

console.log('初始化 PosterElement 模型...');
PosterElement.initModel(sequelize);

console.log('初始化 PosterGeneration 模型...');
PosterGeneration.initModel(sequelize);

console.log('初始化 MessageTemplate 模型...');
initMessageTemplate(sequelize);

console.log('=== 第四批扩展模型初始化完成 ===');

// 添加第五批模型
console.log('=== 开始初始化第五批扩展模型 ===');

// 🚀 AI模型已迁移到统一租户中心
// console.log('初始化 AIModelConfig 模型...');
// initAIModelConfig(sequelize);

// console.log('初始化 AIModelUsage 模型...');
// initAIModelUsage(sequelize);

console.log('初始化 AIBillingRecord 模型...');
initAIBillingRecord(sequelize);

console.log('初始化 AIConversation 模型...');
initAIConversation(sequelize);

console.log('初始化 AIMessage 模型...');
initAIMessage(sequelize);

console.log('初始化 AIMemory 模型...');
// AIMemory 模型已被六维记忆系统替代
console.log('✅ AIMemory 模型已被六维记忆系统替代');

console.log('初始化六维记忆系统模型...');
// 导入并初始化六维记忆系统模型
const { initializeMemoryModels } = require('./models/memory/six-dimension-memory.model');
initializeMemoryModels(sequelize);
console.log('✅ 六维记忆系统模型初始化完成');

console.log('初始化 AIFeedback 模型...');
initAIFeedback(sequelize);

console.log('初始化 AIUserPermission 模型...');
AIUserPermission.initModel(sequelize);

console.log('🤖 初始化AI查询历史模型...');
// AIQueryHistory模型已在自身文件中初始化，这里只需要确认即可
console.log('✅ AI查询历史模型初始化成功');

console.log('初始化 ExpertConsultation 模型...');
initExpertConsultationModels(sequelize);

console.log('=== 第五批扩展模型初始化完成 ===');

// 添加第六批模型
console.log('=== 开始初始化第六批扩展模型 ===');

console.log('初始化 Notification 模型...');
Notification.initModel(sequelize);

console.log('初始化 SystemLog 模型...');
SystemLog.initModel(sequelize);

console.log('初始化 SystemConfig 模型...');
initSystemConfig(sequelize);

console.log('初始化 Schedule 模型...');
Schedule.initModel(sequelize);

console.log('初始化 Todo 模型...');
Todo.initModel(sequelize);

console.log('初始化 FileStorage 模型...');
initFileStorage(sequelize);

console.log('初始化 OperationLog 模型...');
initOperationLog(sequelize);

console.log('初始化 PerformanceRule 模型...');
initPerformanceRule(sequelize);

// 话术中心已删除，移除 Script 相关初始化
console.log('初始化 PageGuide 模型...');
const { initPageGuide, initPageGuideSection } = require('./models/page-guide.model');
initPageGuide(sequelize);
initPageGuideSection(sequelize);

// 初始化安全相关模型
console.log('初始化 SecurityThreat 模型...');
require('./models/SecurityThreat');

console.log('初始化 SecurityVulnerability 模型...');
require('./models/SecurityVulnerability');

console.log('初始化 SecurityConfig 模型...');
require('./models/SecurityConfig');

console.log('初始化 SecurityScanLog 模型...');
require('./models/SecurityScanLog');

console.log('=== 第六批扩展模型初始化完成 ===');

// 添加财务模型
console.log('=== 开始初始化财务模型 ===');

console.log('🏦 开始初始化财务模型...');
const { initFinanceModels } = require('./models/finance.model');
initFinanceModels(sequelize);
console.log('✅ 财务模型初始化完成');

console.log('=== 财务模型初始化完成 ===');

// 添加视频制作模型
console.log('=== 开始初始化视频制作模型 ===');

console.log('🎬 初始化 VideoProject 模型...');
initVideoProjectModel(sequelize);
console.log('✅ VideoProject 模型初始化成功');

console.log('=== 视频制作模型初始化完成 ===');

// 添加媒体中心模型
console.log('=== 开始初始化媒体中心模型 ===');

console.log('📱 初始化 MediaContent 模型...');
initMediaContent(sequelize);
console.log('✅ MediaContent 模型初始化成功');

console.log('=== 媒体中心模型初始化完成 ===');

// 添加相册库模型
console.log('=== 开始初始化相册库模型 ===');

console.log('  - 初始化 Photo 模型...');
Photo.initModel(sequelize);

console.log('  - 初始化 PhotoStudent 模型...');
PhotoStudent.initModel(sequelize);

console.log('  - 初始化 StudentFaceLibrary 模型...');
StudentFaceLibrary.initModel(sequelize);

console.log('  - 初始化 PhotoAlbum 模型...');
PhotoAlbum.initModel(sequelize);

console.log('  - 初始化 PhotoAlbumItem 模型...');
PhotoAlbumItem.initModel(sequelize);

console.log('  - 初始化 PhotoVideo 模型...');
PhotoVideo.initModel(sequelize);

console.log('✅ 相册库模型初始化完成');
console.log('=== 相册库模型初始化完成 ===');

// 添加检查中心模型
console.log('=== 开始初始化检查中心模型 ===');

console.log('📋 初始化检查中心模型...');
const { initInspectionModels } = require('./models/inspection-center-init');
initInspectionModels(sequelize);
console.log('✅ 检查中心模型初始化完成');

// 注意：关联已在后面的"设置检查中心模型关联"部分设置，无需重复调用

console.log('=== 检查中心模型初始化完成 ===');

// 添加教学中心模型
console.log('=== 开始初始化教学中心模型 ===');

console.log('📚 初始化教学中心模型...');
console.log('  - 初始化 BrainScienceCourse 模型...');
initBrainScienceCourseModel(sequelize);

console.log('  - 初始化 CoursePlan 模型...');
initCoursePlanModel(sequelize);

console.log('  - 初始化 CourseProgress 模型...');
initCourseProgressModel(sequelize);

console.log('  - 初始化 TeachingMediaRecord 模型...');
initTeachingMediaRecordModel(sequelize);

console.log('  - 初始化 OutdoorTrainingRecord 模型...');
initOutdoorTrainingRecordModel(sequelize);

console.log('✅ 教学中心模型初始化完成');
console.log('=== 教学中心模型初始化完成 ===');

// 初始化考勤中心模型
console.log('=== 开始初始化考勤中心模型 ===');
console.log('📋 初始化考勤中心模型...');

console.log('  - 初始化 Attendance 模型...');
initAttendanceModel(sequelize);

console.log('  - 初始化 AttendanceStatistics 模型...');
initAttendanceStatisticsModel(sequelize);

console.log('  - 初始化 AttendanceChangeLog 模型...');
initAttendanceChangeLogModel(sequelize);

console.log('✅ 考勤中心模型初始化完成');
console.log('=== 考勤中心模型初始化完成 ===');

// 初始化训练中心模型
console.log('=== 开始初始化训练中心模型 ===');
console.log('🎯 初始化训练中心模型...');

console.log('  - 初始化 TrainingActivity 模型...');
initTrainingActivityModel(sequelize);

console.log('  - 初始化 TrainingPlan 模型...');
initTrainingPlanModel(sequelize);

console.log('  - 初始化 TrainingRecord 模型...');
initTrainingRecordModel(sequelize);

console.log('  - 初始化 TrainingAchievement 模型...');
initTrainingAchievementModel(sequelize);

console.log('✅ 训练中心模型初始化完成');
console.log('=== 训练中心模型初始化完成 ===');

// 初始化测评系统模型
console.log('=== 开始初始化测评系统模型 ===');
console.log('📊 初始化测评系统模型...');

console.log('  - 初始化 AssessmentConfig 模型...');
AssessmentConfig.initModel(sequelize);

console.log('  - 初始化 AssessmentQuestion 模型...');
AssessmentQuestion.initModel(sequelize);

console.log('  - 初始化 PhysicalTrainingItem 模型...');
PhysicalTrainingItem.initModel(sequelize);

console.log('  - 初始化 AssessmentRecord 模型...');
AssessmentRecord.initModel(sequelize);

console.log('✅ 测评系统模型初始化完成');
console.log('=== 测评系统模型初始化完成 ===');

// 添加游戏系统模型
console.log('=== 开始初始化游戏系统模型 ===');
console.log('🎮 初始化游戏模型...');

console.log('  - 初始化 GameConfig 模型...');
GameConfig.initModel(sequelize);

console.log('  - 初始化 GameLevel 模型...');
GameLevel.initModel(sequelize);

console.log('  - 初始化 GameRecord 模型...');
GameRecord.initModel(sequelize);

console.log('  - 初始化 GameAchievement 模型...');
GameAchievement.initModel(sequelize);

console.log('  - 初始化 UserAchievement 模型...');
UserAchievement.initModel(sequelize);

console.log('  - 初始化 GameUserSettings 模型...');
GameUserSettings.initModel(sequelize);

console.log('✅ 游戏系统模型初始化完成');
console.log('=== 游戏系统模型初始化完成 ===');

// 设置模型关联
console.log('=== 开始设置模型关联 ===');

// 首先初始化基础模型的关联
console.log('设置 UserRole 关联...');
UserRole.initAssociations();

console.log('设置 RolePermission 关联...');
RolePermission.initAssociations();

console.log('设置 User 关联...');
User.initAssociations();

console.log('设置 Parent 关联...');
// Parent.initAssociations(); // 已在models/index.ts中调用，此处注释掉避免重复

// 招生相关模型关联已经在上面的关联设置中定义了，不需要重复调用
// console.log('设置 EnrollmentPlan 关联...');
// initEnrollmentPlanAssociations();

// console.log('设置 EnrollmentApplication 关联...');
// initEnrollmentApplicationAssociations();

// 用户和角色多对多关联
User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', otherKey: 'roleId' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', otherKey: 'userId' });

// 角色和权限多对多关联
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', otherKey: 'permissionId' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', otherKey: 'roleId' });

// 用户和用户资料一对一关联
User.hasOne(UserProfile, { foreignKey: 'userId', as: 'profile' });
UserProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 用户和录取通知关联（创建者）
User.hasMany(AdmissionNotification, { foreignKey: 'createdBy', as: 'createdNotifications' });
AdmissionNotification.belongsTo(User, { foreignKey: 'createdBy', as: 'sender' });

// 消息模板和录取通知关联
MessageTemplate.hasMany(AdmissionNotification, { foreignKey: 'templateId', as: 'notifications' });
AdmissionNotification.belongsTo(MessageTemplate, { foreignKey: 'templateId', as: 'template' });

// 添加第三批模型的关联
// 教师和幼儿园关联 - 已在各自模型文件中定义，此处注释掉避免重复
// Kindergarten.hasMany(Teacher, { foreignKey: 'kindergartenId', as: 'teachers' });
// Teacher.belongsTo(Kindergarten, { foreignKey: 'kindergartenId', as: 'kindergarten' });

// 教师和班级关联
Teacher.belongsToMany(Class, { through: 'class_teachers', foreignKey: 'teacherId', otherKey: 'classId' });
Class.belongsToMany(Teacher, { through: 'class_teachers', foreignKey: 'classId', otherKey: 'teacherId' });

// 活动和评价关联
Activity.hasMany(ActivityEvaluation, { foreignKey: 'activityId', as: 'evaluations' });
ActivityEvaluation.belongsTo(Activity, { foreignKey: 'activityId', as: 'activity' });

// 教师和咨询关联已移除 - 咨询记录通过 consultantId 关联到 User 表，而不是 Teacher 表

// 咨询和任务关联
EnrollmentConsultation.hasMany(EnrollmentTask, { foreignKey: 'consultationId', as: 'tasks' });
EnrollmentTask.belongsTo(EnrollmentConsultation, { foreignKey: 'consultationId', as: 'consultation' });

// 添加第四批模型的关联
// 营销活动关联 - 已在各自模型文件中定义，此处注释掉避免重复
// Kindergarten.hasMany(MarketingCampaign, { foreignKey: 'kindergartenId', as: 'marketingCampaigns' });
// MarketingCampaign.belongsTo(Kindergarten, { foreignKey: 'kindergartenId', as: 'kindergarten' });

// 广告关联
MarketingCampaign.hasMany(Advertisement, { foreignKey: 'campaignId', as: 'advertisements' });
Advertisement.belongsTo(MarketingCampaign, { foreignKey: 'campaignId', as: 'campaign' });

// 海报模板关联
PosterTemplate.hasMany(PosterElement, { foreignKey: 'templateId', as: 'elements' });
PosterElement.belongsTo(PosterTemplate, { foreignKey: 'templateId', as: 'template' });

// 海报生成关联
PosterTemplate.hasMany(PosterGeneration, { foreignKey: 'templateId', as: 'generations' });
PosterGeneration.belongsTo(PosterTemplate, { foreignKey: 'templateId', as: 'template' });

// 用户和海报生成关联
User.hasMany(PosterGeneration, { foreignKey: 'userId', as: 'posters' });
PosterGeneration.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 添加第五批模型的关联
// 🚀 AI模型已迁移到统一租户中心
// // AI模型配置关联
// User.hasMany(AIModelConfig, { foreignKey: 'creatorId', as: 'aiModelConfigs' });
// AIModelConfig.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

// AI会话关联
User.hasMany(AIConversation, { foreignKey: 'userId', as: 'aiConversations' });
AIConversation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// AI消息关联
AIConversation.hasMany(AIMessage, { foreignKey: 'conversationId', as: 'messages' });
AIMessage.belongsTo(AIConversation, { foreignKey: 'conversationId', as: 'conversation' });

// AI反馈关联
AIMessage.hasMany(AIFeedback, { foreignKey: 'messageId', as: 'feedback' });
AIFeedback.belongsTo(AIMessage, { foreignKey: 'messageId', as: 'message' });

// AI使用权限关联
User.hasMany(AIUserPermission, { foreignKey: 'userId', as: 'aiPermissions' });
AIUserPermission.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 专家咨询关联
console.log('设置 ExpertConsultation 关联...');
setupExpertConsultationAssociations();

// 添加第六批模型的关联
// 通知关联
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 待办事项关联
User.hasMany(Todo, { foreignKey: 'userId', as: 'todos' });
Todo.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 待办事项分配关联
User.hasMany(Todo, { foreignKey: 'assignedTo', as: 'assignedTodos' });
Todo.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

// 文件存储关联
User.hasMany(FileStorage, { foreignKey: 'uploaderId', as: 'uploadedFiles' });
FileStorage.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' });

// 操作日志关联
User.hasMany(OperationLog, { foreignKey: 'operatorId', as: 'operationLogs' });
OperationLog.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

// 日程关联
User.hasMany(Schedule, { foreignKey: 'user_id', as: 'createdSchedules' });
Schedule.belongsTo(User, { foreignKey: 'user_id', as: 'creator' });

// PerformanceRule关联
console.log('设置 PerformanceRule 关联...');
initPerformanceRuleAssociations();

console.log('设置 EnrollmentConsultation 关联...');
EnrollmentConsultation.initAssociations();

console.log('设置 EnrollmentConsultationFollowup 关联...');
EnrollmentConsultationFollowup.initAssociations();

// 班级和学生关联 - 直接设置核心关联，避免循环依赖问题
console.log('设置 Class 和 Student 核心关联...');
// 设置Student.belongsTo(Class) - 用于学生查询时include班级
Student.belongsTo(Class, {
  foreignKey: 'classId',
  as: 'class',
});
// 设置Class.hasMany(Student) - 用于班级查询时include学生
Class.hasMany(Student, {
  foreignKey: 'classId',
  as: 'students',
});
// 设置Student与其他模型的关联
Student.belongsTo(Kindergarten, {
  foreignKey: 'kindergartenId',
  as: 'kindergarten',
});
Student.belongsTo(User, {
  foreignKey: 'creatorId',
  as: 'creator',
});
Student.belongsTo(User, {
  foreignKey: 'updaterId',
  as: 'updater',
});
console.log('✅ Class 和 Student 核心关联设置完成');

// 设置考勤中心模型关联
console.log('设置 Attendance 关联...');
const { associateAttendance } = require('./models/attendance.model');
associateAttendance();
console.log('✅ Attendance 关联设置完成');

// 家长和学生多对多关联
Parent.belongsToMany(Student, { through: ParentStudentRelation, foreignKey: 'userId', otherKey: 'studentId', as: 'Students' });
Student.belongsToMany(Parent, { through: ParentStudentRelation, foreignKey: 'studentId', otherKey: 'userId', as: 'Parents' });

// 调用家长学生关系模型的关联初始化函数
initParentStudentRelationAssociations();

// 幼儿园和班级一对多关联 - 已在各自模型文件中定义，此处注释掉避免重复
// Kindergarten.hasMany(Class, { foreignKey: 'kindergartenId', as: 'classes' });
// Class.belongsTo(Kindergarten, { foreignKey: 'kindergartenId', as: 'kindergarten' });

// 页面说明文档关联
console.log('设置 PageGuide 关联...');
const { initPageGuideAssociations } = require('./models/page-guide.model');
initPageGuideAssociations();

// 话术中心已删除，移除 Script 关联
// 视频制作模型关联
console.log('设置 VideoProject 关联...');
VideoProject.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(VideoProject, { foreignKey: 'userId', as: 'videoProjects' });

// 媒体中心模型关联
console.log('设置 MediaContent 关联...');
defineMediaContentAssociations();

// 相册库模型关联
console.log('设置相册库关联...');
Photo.hasMany(PhotoStudent, {
  foreignKey: 'photoId',
  as: 'photoStudents'
});
PhotoStudent.belongsTo(Photo, {
  foreignKey: 'photoId',
  as: 'photo'
});

// PhotoStudent到Student的关联
PhotoStudent.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student'
});
Student.hasMany(PhotoStudent, {
  foreignKey: 'studentId',
  as: 'photoStudents'
});

PhotoAlbum.hasMany(PhotoAlbumItem, {
  foreignKey: 'albumId',
  as: 'items'
});
PhotoAlbumItem.belongsTo(PhotoAlbum, {
  foreignKey: 'albumId',
  as: 'album'
});

PhotoAlbumItem.belongsTo(Photo, {
  foreignKey: 'photoId',
  as: 'photo'
});

console.log('✅ 相册库关联设置完成');

// 检查中心模型关联
console.log('设置检查中心模型关联...');
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

// InspectionTask -> User (assignee)
InspectionTask.belongsTo(User, {
  foreignKey: 'assigneeId',
  as: 'assignee'
});

console.log('✅ 检查中心模型关联设置完成');

// 教学中心模型关联
console.log('设置教学中心模型关联...');
// 需要先导入模型类
const { default: BrainScienceCourse } = require('./models/brain-science-course.model');
const { default: CoursePlan } = require('./models/course-plan.model');
const { default: CourseProgress } = require('./models/course-progress.model');

// BrainScienceCourse -> CoursePlan (一对多)
BrainScienceCourse.hasMany(CoursePlan, {
  foreignKey: 'course_id',
  as: 'coursePlans'
});
CoursePlan.belongsTo(BrainScienceCourse, {
  foreignKey: 'course_id',
  as: 'course'
});

// CoursePlan -> Class (多对一)
CoursePlan.belongsTo(Class, {
  foreignKey: 'class_id',
  as: 'class'
});
Class.hasMany(CoursePlan, {
  foreignKey: 'class_id',
  as: 'coursePlans'
});

// CoursePlan -> User (创建者)
CoursePlan.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});
User.hasMany(CoursePlan, {
  foreignKey: 'created_by',
  as: 'createdCoursePlans'
});

// CourseProgress -> CoursePlan (多对一)
CourseProgress.belongsTo(CoursePlan, {
  foreignKey: 'course_plan_id',
  as: 'coursePlan'
});
CoursePlan.hasMany(CourseProgress, {
  foreignKey: 'course_plan_id',
  as: 'progressRecords'
});

// CourseProgress -> Class (多对一)
CourseProgress.belongsTo(Class, {
  foreignKey: 'class_id',
  as: 'class'
});
Class.hasMany(CourseProgress, {
  foreignKey: 'class_id',
  as: 'courseProgress'
});

// CourseProgress -> Teacher (多对一)
CourseProgress.belongsTo(Teacher, {
  foreignKey: 'teacher_id',
  as: 'teacher'
});
Teacher.hasMany(CourseProgress, {
  foreignKey: 'teacher_id',
  as: 'courseProgress'
});

// TeachingMediaRecord 关联
if (TeachingMediaRecord && typeof TeachingMediaRecord.associate === 'function') {
  TeachingMediaRecord.associate();
}

// OutdoorTrainingRecord 关联
if (OutdoorTrainingRecord && typeof OutdoorTrainingRecord.associate === 'function') {
  OutdoorTrainingRecord.associate();
}

console.log('✅ 教学中心模型关联设置完成');

// 训练中心模型关联设置
console.log('=== 设置训练中心模型关联 ===');

// 训练中心模型关联
// 注意：训练模型暂时没有定义关联关系，所以不调用 associate 方法
// if (TrainingActivity && typeof TrainingActivity.associate === 'function') {
//   TrainingActivity.associate();
// }

// if (TrainingPlan && typeof TrainingPlan.associate === 'function') {
//   TrainingPlan.associate();
// }

// if (TrainingRecord && typeof TrainingRecord.associate === 'function') {
//   TrainingRecord.associate();
// }

// if (TrainingAchievement && typeof TrainingAchievement.associate === 'function') {
//   TrainingAchievement.associate();
// }

console.log('✅ 训练中心模型关联设置完成');

// 测评系统模型关联设置
console.log('=== 设置测评系统模型关联 ===');

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

console.log('✅ 测评系统模型关联设置完成');

console.log('=== 模型关联设置完成 ===');

// 立即创建必要的表
(async () => {
  try {
    if ((global as any).__ensureTablesSQL) {
      await sequelize.query((global as any).__ensureTablesSQL, { logging: false });
      console.log('✅ AI计费表已确保存在');
    }
  } catch (error) {
    if ((error as any).message?.includes('already exists')) {
      console.log('✅ AI计费表已存在');
    } else {
      console.warn('⚠️ 创建AI计费表可能失败:', (error as any).message);
    }
  }
})();

// 导出初始化好的sequelize实例
export { sequelize };

// 导出 Sequelize 操作符
export { Op } from 'sequelize';

// 导出已初始化的模型
export {
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  UserProfile,
  Kindergarten,
  Parent,
  Student,
  ParentStudentRelation,
  Class,
  EnrollmentPlan,
  Activity,
  EnrollmentApplication,
  AdmissionResult,
  AdmissionNotification,
  ActivityRegistration,
  ActivityParticipant,
  Teacher,
  ActivityEvaluation,
  EnrollmentConsultation,
  EnrollmentTask,
  MarketingCampaign,
  Advertisement,
  PosterTemplate,
  PosterElement,
  PosterGeneration,
  MessageTemplate,
  // 🚀 AI模型已迁移到统一租户中心
  // AIModelConfig,
  // AIModelUsage,
  AIBillingRecord,
  AIConversation,
  AIMessage,
  AIFeedback,
  AIUserPermission,
  AIQueryHistory,
  ExpertConsultation,
  ExpertSpeech,
  ActionPlan,
  ConsultationSummary,
  Notification,
  SystemLog,
  SystemConfig,
  Schedule,
  Todo,
  FileStorage,
  OperationLog,
  PerformanceRule,
  // 话术中心已删除，移除 Script 相关导出
  // 财务模型
  FeeItem,
  FeePackageTemplate,
  PaymentBill,
  PaymentRecord,
  FinancialReport,
  // 视频制作模型
  VideoProject,
  // 教学中心模型
  BrainScienceCourse,
  CoursePlan,
  CourseProgress,
  TeachingMediaRecord,
  OutdoorTrainingRecord,
  // 训练中心模型
  TrainingActivity,
  TrainingPlan,
  TrainingRecord,
  TrainingAchievement,
  // 测评系统模型
  AssessmentConfig,
  AssessmentQuestion,
  PhysicalTrainingItem,
  AssessmentRecord
};

// 导出六维记忆模型
export { MemoryModels } from './models/memory/six-dimension-memory.model';

console.log('=== 初始化脚本执行完毕 ==='); 