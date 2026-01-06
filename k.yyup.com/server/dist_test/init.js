"use strict";
/**
 * 数据库和模型初始化脚本
 * 按特定顺序初始化各个模块，避免循环依赖问题
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ScriptUsage = exports.Script = exports.ScriptCategory = exports.PerformanceRule = exports.OperationLog = exports.FileStorage = exports.Todo = exports.Schedule = exports.SystemConfig = exports.SystemLog = exports.Notification = exports.ConsultationSummary = exports.ActionPlan = exports.ExpertSpeech = exports.ExpertConsultation = exports.AIUserPermission = exports.AIFeedback = exports.AIMessage = exports.AIConversation = exports.AIModelUsage = exports.AIModelConfig = exports.MessageTemplate = exports.PosterGeneration = exports.PosterElement = exports.PosterTemplate = exports.Advertisement = exports.MarketingCampaign = exports.EnrollmentTask = exports.EnrollmentConsultation = exports.ActivityEvaluation = exports.Teacher = exports.ActivityParticipant = exports.ActivityRegistration = exports.AdmissionNotification = exports.AdmissionResult = exports.EnrollmentApplication = exports.Activity = exports.EnrollmentPlan = exports.Class = exports.ParentStudentRelation = exports.Student = exports.Parent = exports.Kindergarten = exports.UserProfile = exports.RolePermission = exports.UserRole = exports.Permission = exports.Role = exports.User = exports.sequelize = void 0;
exports.MemoryModels = exports.VideoProject = exports.FinancialReport = exports.PaymentRecord = exports.PaymentBill = exports.FeePackageTemplate = exports.FeeItem = void 0;
var sequelize_1 = require("sequelize");
var database_unified_1 = require("./config/database-unified");
// 获取统一的数据库配置
var dbConfig = (0, database_unified_1.getDatabaseConfig)();
// 首先初始化 Sequelize 实例
console.log('=== 开始初始化数据库连接 ===');
console.log("\u6570\u636E\u5E93\u8FDE\u63A5\u4FE1\u606F: ".concat(dbConfig.host, ":").concat(dbConfig.port, "/").concat(dbConfig.database));
// 创建 Sequelize 实例
var sequelizeOptions = {
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
var sequelize = new sequelize_1.Sequelize(dbConfig.database || '', dbConfig.username || '', dbConfig.password || '', sequelizeOptions);
exports.sequelize = sequelize;
console.log('=== 数据库连接初始化完成 ===');
// 然后手动初始化核心模型
console.log('=== 开始初始化核心模型 ===');
// 从这里开始手动导入和初始化模型，避免循环依赖
var user_model_1 = require("./models/user.model");
exports.User = user_model_1.User;
var role_model_1 = require("./models/role.model");
exports.Role = role_model_1.Role;
var permission_model_1 = require("./models/permission.model");
exports.Permission = permission_model_1.Permission;
var user_role_model_1 = require("./models/user-role.model");
exports.UserRole = user_role_model_1.UserRole;
var role_permission_model_1 = require("./models/role-permission.model");
exports.RolePermission = role_permission_model_1.RolePermission;
var user_profile_model_1 = require("./models/user-profile.model");
exports.UserProfile = user_profile_model_1.UserProfile;
var kindergarten_model_1 = require("./models/kindergarten.model");
exports.Kindergarten = kindergarten_model_1.Kindergarten;
var parent_model_1 = require("./models/parent.model");
exports.Parent = parent_model_1.Parent;
var student_model_1 = require("./models/student.model");
exports.Student = student_model_1.Student;
var parent_student_relation_model_1 = require("./models/parent-student-relation.model");
exports.ParentStudentRelation = parent_student_relation_model_1.ParentStudentRelation;
var class_model_1 = require("./models/class.model");
exports.Class = class_model_1.Class;
var class_teacher_model_1 = require("./models/class-teacher.model");
var kindergarten_model_2 = require("./models/kindergarten.model");
var student_model_2 = require("./models/student.model");
var class_model_2 = require("./models/class.model");
var parent_student_relation_model_2 = require("./models/parent-student-relation.model");
var enrollment_plan_model_1 = require("./models/enrollment-plan.model");
exports.EnrollmentPlan = enrollment_plan_model_1.EnrollmentPlan;
var activity_model_1 = require("./models/activity.model");
exports.Activity = activity_model_1.Activity;
var activity_template_model_1 = require("./models/activity-template.model");
var enrollment_application_model_1 = require("./models/enrollment-application.model");
exports.EnrollmentApplication = enrollment_application_model_1.EnrollmentApplication;
var admission_result_model_1 = require("./models/admission-result.model");
exports.AdmissionResult = admission_result_model_1.AdmissionResult;
var activity_registration_model_1 = require("./models/activity-registration.model");
exports.ActivityRegistration = activity_registration_model_1.ActivityRegistration;
var enrollment_plan_model_2 = require("./models/enrollment-plan.model");
var activity_model_2 = require("./models/activity.model");
var enrollment_application_model_2 = require("./models/enrollment-application.model");
var admission_result_model_2 = require("./models/admission-result.model");
var admission_notification_model_1 = require("./models/admission-notification.model");
exports.AdmissionNotification = admission_notification_model_1.AdmissionNotification;
var activity_registration_model_2 = require("./models/activity-registration.model");
var activity_participant_model_1 = require("./models/activity-participant.model");
exports.ActivityParticipant = activity_participant_model_1.ActivityParticipant;
var teacher_model_1 = require("./models/teacher.model");
exports.Teacher = teacher_model_1.Teacher;
var activity_evaluation_model_1 = require("./models/activity-evaluation.model");
exports.ActivityEvaluation = activity_evaluation_model_1.ActivityEvaluation;
var enrollment_consultation_model_1 = require("./models/enrollment-consultation.model");
exports.EnrollmentConsultation = enrollment_consultation_model_1.EnrollmentConsultation;
var enrollment_consultation_followup_model_1 = require("./models/enrollment-consultation-followup.model");
var enrollment_task_model_1 = require("./models/enrollment-task.model");
exports.EnrollmentTask = enrollment_task_model_1.EnrollmentTask;
var teacher_model_2 = require("./models/teacher.model");
var activity_evaluation_model_2 = require("./models/activity-evaluation.model");
var enrollment_task_model_2 = require("./models/enrollment-task.model");
var marketing_campaign_model_1 = require("./models/marketing-campaign.model");
exports.MarketingCampaign = marketing_campaign_model_1.MarketingCampaign;
var advertisement_model_1 = require("./models/advertisement.model");
exports.Advertisement = advertisement_model_1.Advertisement;
var poster_template_model_1 = require("./models/poster-template.model");
exports.PosterTemplate = poster_template_model_1.PosterTemplate;
var poster_element_model_1 = require("./models/poster-element.model");
exports.PosterElement = poster_element_model_1.PosterElement;
var poster_generation_model_1 = require("./models/poster-generation.model");
exports.PosterGeneration = poster_generation_model_1.PosterGeneration;
var message_template_model_1 = require("./models/message-template.model");
exports.MessageTemplate = message_template_model_1.MessageTemplate;
var marketing_campaign_model_2 = require("./models/marketing-campaign.model");
var advertisement_model_2 = require("./models/advertisement.model");
var message_template_model_2 = require("./models/message-template.model");
var ai_model_config_model_1 = require("./models/ai-model-config.model");
exports.AIModelConfig = ai_model_config_model_1.AIModelConfig;
var ai_model_usage_model_1 = require("./models/ai-model-usage.model");
exports.AIModelUsage = ai_model_usage_model_1.AIModelUsage;
var ai_conversation_model_1 = require("./models/ai-conversation.model");
exports.AIConversation = ai_conversation_model_1.AIConversation;
var ai_message_model_1 = require("./models/ai-message.model");
exports.AIMessage = ai_message_model_1.AIMessage;
var ai_feedback_model_1 = require("./models/ai-feedback.model");
exports.AIFeedback = ai_feedback_model_1.AIFeedback;
var ai_user_permission_model_1 = require("./models/ai-user-permission.model");
exports.AIUserPermission = ai_user_permission_model_1.AIUserPermission;
var expert_consultation_model_1 = require("./models/expert-consultation.model");
exports.ExpertConsultation = expert_consultation_model_1.ExpertConsultation;
exports.ExpertSpeech = expert_consultation_model_1.ExpertSpeech;
exports.ActionPlan = expert_consultation_model_1.ActionPlan;
exports.ConsultationSummary = expert_consultation_model_1.ConsultationSummary;
var notification_model_1 = require("./models/notification.model");
exports.Notification = notification_model_1.Notification;
var system_log_model_1 = require("./models/system-log.model");
exports.SystemLog = system_log_model_1.SystemLog;
var game_config_model_1 = require("./models/game-config.model");
var game_level_model_1 = require("./models/game-level.model");
var game_record_model_1 = require("./models/game-record.model");
var game_achievement_model_1 = require("./models/game-achievement.model");
var user_achievement_model_1 = require("./models/user-achievement.model");
var game_user_settings_model_1 = require("./models/game-user-settings.model");
var system_config_model_1 = require("./models/system-config.model");
exports.SystemConfig = system_config_model_1.SystemConfig;
var schedule_model_1 = require("./models/schedule.model");
exports.Schedule = schedule_model_1.Schedule;
var todo_model_1 = require("./models/todo.model");
exports.Todo = todo_model_1.Todo;
var file_storage_model_1 = require("./models/file-storage.model");
exports.FileStorage = file_storage_model_1.FileStorage;
var operation_log_model_1 = require("./models/operation-log.model");
exports.OperationLog = operation_log_model_1.OperationLog;
var PerformanceRule_1 = require("./models/PerformanceRule");
exports.PerformanceRule = PerformanceRule_1.PerformanceRule;
var script_model_1 = require("./models/script.model");
exports.ScriptCategory = script_model_1.ScriptCategory;
exports.Script = script_model_1.Script;
exports.ScriptUsage = script_model_1.ScriptUsage;
var finance_model_1 = require("./models/finance.model");
exports.FeeItem = finance_model_1.FeeItem;
exports.FeePackageTemplate = finance_model_1.FeePackageTemplate;
exports.PaymentBill = finance_model_1.PaymentBill;
exports.PaymentRecord = finance_model_1.PaymentRecord;
exports.FinancialReport = finance_model_1.FinancialReport;
var video_project_model_1 = __importStar(require("./models/video-project.model"));
exports.VideoProject = video_project_model_1["default"];
// 检查中心模型
var inspection_type_model_1 = __importDefault(require("./models/inspection-type.model"));
var inspection_plan_model_1 = __importDefault(require("./models/inspection-plan.model"));
var document_template_model_1 = __importDefault(require("./models/document-template.model"));
var inspection_task_model_1 = __importDefault(require("./models/inspection-task.model"));
// 初始化核心模型
console.log('初始化 User 模型...');
user_model_1.User.initModel(sequelize);
console.log('初始化 Role 模型...');
role_model_1.Role.initModel(sequelize);
console.log('初始化 Permission 模型...');
permission_model_1.Permission.initModel(sequelize);
console.log('初始化 UserRole 模型...');
user_role_model_1.UserRole.initModel(sequelize);
console.log('初始化 RolePermission 模型...');
role_permission_model_1.RolePermission.initModel(sequelize);
console.log('初始化 UserProfile 模型...');
user_profile_model_1.UserProfile.initModel(sequelize);
// 添加第一批模型
console.log('=== 开始初始化第一批扩展模型 ===');
console.log('初始化 Kindergarten 模型...');
(0, kindergarten_model_2.initKindergarten)(sequelize);
console.log('初始化 Parent 模型...');
parent_model_1.Parent.initModel(sequelize);
console.log('初始化 Student 模型...');
(0, student_model_2.initStudent)(sequelize);
console.log('初始化 ParentStudentRelation 模型...');
(0, parent_student_relation_model_2.initParentStudentRelation)(sequelize);
console.log('初始化 Class 模型...');
(0, class_model_2.initClass)(sequelize);
console.log('初始化 ClassTeacher 模型...');
(0, class_teacher_model_1.initClassTeacher)(sequelize);
console.log('=== 扩展模型初始化完成 ===');
// 添加第二批模型
console.log('=== 开始初始化第二批扩展模型 ===');
console.log('初始化 EnrollmentPlan 模型...');
(0, enrollment_plan_model_2.initEnrollmentPlan)(sequelize);
console.log('初始化 Activity 模型...');
(0, activity_model_2.initActivity)(sequelize);
console.log('初始化 ActivityTemplate 模型...');
(0, activity_template_model_1.initActivityTemplate)(sequelize);
console.log('初始化 EnrollmentApplication 模型...');
(0, enrollment_application_model_2.initEnrollmentApplication)(sequelize);
console.log('初始化 AdmissionResult 模型...');
(0, admission_result_model_2.initAdmissionResult)(sequelize);
console.log('初始化 AdmissionNotification 模型...');
(0, admission_notification_model_1.initAdmissionNotification)(sequelize);
console.log('初始化 ActivityRegistration 模型...');
(0, activity_registration_model_2.initActivityRegistration)(sequelize);
console.log('初始化 ActivityParticipant 模型...');
activity_participant_model_1.ActivityParticipant.initModel(sequelize);
// 添加第二批模型的关联
// 活动和活动报名关联
activity_model_1.Activity.hasMany(activity_registration_model_1.ActivityRegistration, { foreignKey: 'activityId', as: 'registrations' });
activity_registration_model_1.ActivityRegistration.belongsTo(activity_model_1.Activity, { foreignKey: 'activityId', as: 'activity' });
// 活动和活动参与者关联
activity_model_1.Activity.hasMany(activity_participant_model_1.ActivityParticipant, { foreignKey: 'activityId', as: 'participants' });
activity_participant_model_1.ActivityParticipant.belongsTo(activity_model_1.Activity, { foreignKey: 'activityId', as: 'activity' });
// 用户（教师）和活动参与者关联
user_model_1.User.hasMany(activity_participant_model_1.ActivityParticipant, { foreignKey: 'teacherId', as: 'activityParticipations' });
activity_participant_model_1.ActivityParticipant.belongsTo(user_model_1.User, { foreignKey: 'teacherId', as: 'teacher' });
// 分配人和活动参与者关联
user_model_1.User.hasMany(activity_participant_model_1.ActivityParticipant, { foreignKey: 'assignedBy', as: 'assignedParticipations' });
activity_participant_model_1.ActivityParticipant.belongsTo(user_model_1.User, { foreignKey: 'assignedBy', as: 'assigner' });
// 活动报名和学生关联（只设置belongsTo，hasMany在initStudentAssociations中设置）
activity_registration_model_1.ActivityRegistration.belongsTo(student_model_1.Student, { foreignKey: 'studentId', as: 'student' });
// 活动报名和家长学生关系关联
activity_registration_model_1.ActivityRegistration.belongsTo(parent_student_relation_model_1.ParentStudentRelation, { foreignKey: 'parentId', as: 'parent' });
// 招生计划和幼儿园关联 - 已在各自模型文件中定义，此处注释掉避免重复
// Kindergarten.hasMany(EnrollmentPlan, { foreignKey: 'kindergartenId', as: 'enrollmentPlans' });
// EnrollmentPlan.belongsTo(Kindergarten, { foreignKey: 'kindergartenId', as: 'kindergarten' });
// 招生计划和招生申请关联
enrollment_plan_model_1.EnrollmentPlan.hasMany(enrollment_application_model_1.EnrollmentApplication, { foreignKey: 'planId', as: 'applications' });
enrollment_application_model_1.EnrollmentApplication.belongsTo(enrollment_plan_model_1.EnrollmentPlan, { foreignKey: 'planId', as: 'plan' });
// 招生申请和录取结果关联
enrollment_application_model_1.EnrollmentApplication.hasOne(admission_result_model_1.AdmissionResult, { foreignKey: 'applicationId', as: 'admissionResult' });
admission_result_model_1.AdmissionResult.belongsTo(enrollment_application_model_1.EnrollmentApplication, { foreignKey: 'applicationId', as: 'application' });
// 录取结果和录取通知关联
admission_result_model_1.AdmissionResult.hasMany(admission_notification_model_1.AdmissionNotification, { foreignKey: 'admissionId', as: 'notifications' });
admission_notification_model_1.AdmissionNotification.belongsTo(admission_result_model_1.AdmissionResult, { foreignKey: 'admissionId', as: 'admission' });
// 家长学生关系和录取通知关联（在ParentStudentRelation关联初始化中定义）
// ParentStudentRelation.hasMany(AdmissionNotification, { foreignKey: 'parentId', as: 'admissionNotifications' });
// AdmissionNotification.belongsTo(ParentStudentRelation, { foreignKey: 'parentId', as: 'parent' });
console.log('=== 第二批扩展模型初始化完成 ===');
// 添加第三批模型
console.log('=== 开始初始化第三批扩展模型 ===');
console.log('初始化 Teacher 模型...');
(0, teacher_model_2.initTeacher)(sequelize);
console.log('初始化 ActivityEvaluation 模型...');
(0, activity_evaluation_model_2.initActivityEvaluation)(sequelize);
console.log('初始化 EnrollmentConsultation 模型...');
enrollment_consultation_model_1.EnrollmentConsultation.initModel(sequelize);
console.log('初始化 EnrollmentConsultationFollowup 模型...');
enrollment_consultation_followup_model_1.EnrollmentConsultationFollowup.initModel(sequelize);
console.log('初始化 EnrollmentTask 模型...');
(0, enrollment_task_model_2.initEnrollmentTask)(sequelize);
console.log('=== 第三批扩展模型初始化完成 ===');
// 添加第四批模型
console.log('=== 开始初始化第四批扩展模型 ===');
console.log('初始化 MarketingCampaign 模型...');
(0, marketing_campaign_model_2.initMarketingCampaign)(sequelize);
console.log('初始化 Advertisement 模型...');
(0, advertisement_model_2.initAdvertisement)(sequelize);
console.log('初始化 PosterTemplate 模型...');
poster_template_model_1.PosterTemplate.initModel(sequelize);
console.log('初始化 PosterElement 模型...');
poster_element_model_1.PosterElement.initModel(sequelize);
console.log('初始化 PosterGeneration 模型...');
poster_generation_model_1.PosterGeneration.initModel(sequelize);
console.log('初始化 MessageTemplate 模型...');
(0, message_template_model_2.initMessageTemplate)(sequelize);
console.log('=== 第四批扩展模型初始化完成 ===');
// 添加第五批模型
console.log('=== 开始初始化第五批扩展模型 ===');
console.log('初始化 AIModelConfig 模型...');
(0, ai_model_config_model_1.initAIModelConfig)(sequelize);
console.log('初始化 AIModelUsage 模型...');
(0, ai_model_usage_model_1.initAIModelUsage)(sequelize);
console.log('初始化 AIConversation 模型...');
(0, ai_conversation_model_1.initAIConversation)(sequelize);
console.log('初始化 AIMessage 模型...');
(0, ai_message_model_1.initAIMessage)(sequelize);
console.log('初始化 AIMemory 模型...');
// AIMemory 模型已被六维记忆系统替代
console.log('✅ AIMemory 模型已被六维记忆系统替代');
console.log('初始化六维记忆系统模型...');
// 导入并初始化六维记忆系统模型
var initializeMemoryModels = require('./models/memory/six-dimension-memory.model').initializeMemoryModels;
initializeMemoryModels(sequelize);
console.log('✅ 六维记忆系统模型初始化完成');
console.log('初始化 AIFeedback 模型...');
(0, ai_feedback_model_1.initAIFeedback)(sequelize);
console.log('初始化 AIUserPermission 模型...');
ai_user_permission_model_1.AIUserPermission.initModel(sequelize);
console.log('初始化 ExpertConsultation 模型...');
(0, expert_consultation_model_1.initExpertConsultationModels)(sequelize);
console.log('=== 第五批扩展模型初始化完成 ===');
// 添加第六批模型
console.log('=== 开始初始化第六批扩展模型 ===');
console.log('初始化 Notification 模型...');
notification_model_1.Notification.initModel(sequelize);
console.log('初始化 SystemLog 模型...');
system_log_model_1.SystemLog.initModel(sequelize);
console.log('初始化 SystemConfig 模型...');
(0, system_config_model_1.initSystemConfig)(sequelize);
console.log('初始化 Schedule 模型...');
schedule_model_1.Schedule.initModel(sequelize);
console.log('初始化 Todo 模型...');
todo_model_1.Todo.initModel(sequelize);
console.log('初始化 FileStorage 模型...');
(0, file_storage_model_1.initFileStorage)(sequelize);
console.log('初始化 OperationLog 模型...');
(0, operation_log_model_1.initOperationLog)(sequelize);
console.log('初始化 PerformanceRule 模型...');
(0, PerformanceRule_1.initPerformanceRule)(sequelize);
console.log('初始化 ScriptCategory 模型...');
(0, script_model_1.initScriptCategory)(sequelize);
console.log('初始化 Script 模型...');
(0, script_model_1.initScript)(sequelize);
console.log('初始化 ScriptUsage 模型...');
(0, script_model_1.initScriptUsage)(sequelize);
console.log('初始化 PageGuide 模型...');
var _a = require('./models/page-guide.model'), initPageGuide = _a.initPageGuide, initPageGuideSection = _a.initPageGuideSection;
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
var initFinanceModels = require('./models/finance.model').initFinanceModels;
initFinanceModels(sequelize);
console.log('✅ 财务模型初始化完成');
console.log('=== 财务模型初始化完成 ===');
// 添加视频制作模型
console.log('=== 开始初始化视频制作模型 ===');
console.log('🎬 初始化 VideoProject 模型...');
(0, video_project_model_1.initVideoProjectModel)(sequelize);
console.log('✅ VideoProject 模型初始化成功');
console.log('=== 视频制作模型初始化完成 ===');
// 添加检查中心模型
console.log('=== 开始初始化检查中心模型 ===');
console.log('📋 初始化检查中心模型...');
var initInspectionModels = require('./models/inspection-center-init').initInspectionModels;
initInspectionModels(sequelize);
console.log('✅ 检查中心模型初始化完成');
console.log('=== 检查中心模型初始化完成 ===');
// 添加游戏系统模型
console.log('=== 开始初始化游戏系统模型 ===');
console.log('🎮 初始化游戏模型...');
console.log('  - 初始化 GameConfig 模型...');
game_config_model_1.GameConfig.initModel(sequelize);
console.log('  - 初始化 GameLevel 模型...');
game_level_model_1.GameLevel.initModel(sequelize);
console.log('  - 初始化 GameRecord 模型...');
game_record_model_1.GameRecord.initModel(sequelize);
console.log('  - 初始化 GameAchievement 模型...');
game_achievement_model_1.GameAchievement.initModel(sequelize);
console.log('  - 初始化 UserAchievement 模型...');
user_achievement_model_1.UserAchievement.initModel(sequelize);
console.log('  - 初始化 GameUserSettings 模型...');
game_user_settings_model_1.GameUserSettings.initModel(sequelize);
console.log('✅ 游戏系统模型初始化完成');
console.log('=== 游戏系统模型初始化完成 ===');
// 设置模型关联
console.log('=== 开始设置模型关联 ===');
// 首先初始化基础模型的关联
console.log('设置 UserRole 关联...');
user_role_model_1.UserRole.initAssociations();
console.log('设置 RolePermission 关联...');
role_permission_model_1.RolePermission.initAssociations();
console.log('设置 User 关联...');
user_model_1.User.initAssociations();
console.log('设置 Parent 关联...');
// Parent.initAssociations(); // 已在models/index.ts中调用，此处注释掉避免重复
// 招生相关模型关联已经在上面的关联设置中定义了，不需要重复调用
// console.log('设置 EnrollmentPlan 关联...');
// initEnrollmentPlanAssociations();
// console.log('设置 EnrollmentApplication 关联...');
// initEnrollmentApplicationAssociations();
// 用户和角色多对多关联
user_model_1.User.belongsToMany(role_model_1.Role, { through: user_role_model_1.UserRole, foreignKey: 'userId', otherKey: 'roleId' });
role_model_1.Role.belongsToMany(user_model_1.User, { through: user_role_model_1.UserRole, foreignKey: 'roleId', otherKey: 'userId' });
// 角色和权限多对多关联
role_model_1.Role.belongsToMany(permission_model_1.Permission, { through: role_permission_model_1.RolePermission, foreignKey: 'roleId', otherKey: 'permissionId' });
permission_model_1.Permission.belongsToMany(role_model_1.Role, { through: role_permission_model_1.RolePermission, foreignKey: 'permissionId', otherKey: 'roleId' });
// 用户和用户资料一对一关联
user_model_1.User.hasOne(user_profile_model_1.UserProfile, { foreignKey: 'userId', as: 'profile' });
user_profile_model_1.UserProfile.belongsTo(user_model_1.User, { foreignKey: 'userId', as: 'user' });
// 用户和录取通知关联（创建者）
user_model_1.User.hasMany(admission_notification_model_1.AdmissionNotification, { foreignKey: 'createdBy', as: 'createdNotifications' });
admission_notification_model_1.AdmissionNotification.belongsTo(user_model_1.User, { foreignKey: 'createdBy', as: 'sender' });
// 消息模板和录取通知关联
message_template_model_1.MessageTemplate.hasMany(admission_notification_model_1.AdmissionNotification, { foreignKey: 'templateId', as: 'notifications' });
admission_notification_model_1.AdmissionNotification.belongsTo(message_template_model_1.MessageTemplate, { foreignKey: 'templateId', as: 'template' });
// 添加第三批模型的关联
// 教师和幼儿园关联 - 已在各自模型文件中定义，此处注释掉避免重复
// Kindergarten.hasMany(Teacher, { foreignKey: 'kindergartenId', as: 'teachers' });
// Teacher.belongsTo(Kindergarten, { foreignKey: 'kindergartenId', as: 'kindergarten' });
// 教师和班级关联
teacher_model_1.Teacher.belongsToMany(class_model_1.Class, { through: 'class_teachers', foreignKey: 'teacherId', otherKey: 'classId' });
class_model_1.Class.belongsToMany(teacher_model_1.Teacher, { through: 'class_teachers', foreignKey: 'classId', otherKey: 'teacherId' });
// 活动和评价关联
activity_model_1.Activity.hasMany(activity_evaluation_model_1.ActivityEvaluation, { foreignKey: 'activityId', as: 'evaluations' });
activity_evaluation_model_1.ActivityEvaluation.belongsTo(activity_model_1.Activity, { foreignKey: 'activityId', as: 'activity' });
// 教师和咨询关联已移除 - 咨询记录通过 consultantId 关联到 User 表，而不是 Teacher 表
// 咨询和任务关联
enrollment_consultation_model_1.EnrollmentConsultation.hasMany(enrollment_task_model_1.EnrollmentTask, { foreignKey: 'consultationId', as: 'tasks' });
enrollment_task_model_1.EnrollmentTask.belongsTo(enrollment_consultation_model_1.EnrollmentConsultation, { foreignKey: 'consultationId', as: 'consultation' });
// 添加第四批模型的关联
// 营销活动关联 - 已在各自模型文件中定义，此处注释掉避免重复
// Kindergarten.hasMany(MarketingCampaign, { foreignKey: 'kindergartenId', as: 'marketingCampaigns' });
// MarketingCampaign.belongsTo(Kindergarten, { foreignKey: 'kindergartenId', as: 'kindergarten' });
// 广告关联
marketing_campaign_model_1.MarketingCampaign.hasMany(advertisement_model_1.Advertisement, { foreignKey: 'campaignId', as: 'advertisements' });
advertisement_model_1.Advertisement.belongsTo(marketing_campaign_model_1.MarketingCampaign, { foreignKey: 'campaignId', as: 'campaign' });
// 海报模板关联
poster_template_model_1.PosterTemplate.hasMany(poster_element_model_1.PosterElement, { foreignKey: 'templateId', as: 'elements' });
poster_element_model_1.PosterElement.belongsTo(poster_template_model_1.PosterTemplate, { foreignKey: 'templateId', as: 'template' });
// 海报生成关联
poster_template_model_1.PosterTemplate.hasMany(poster_generation_model_1.PosterGeneration, { foreignKey: 'templateId', as: 'generations' });
poster_generation_model_1.PosterGeneration.belongsTo(poster_template_model_1.PosterTemplate, { foreignKey: 'templateId', as: 'template' });
// 用户和海报生成关联
user_model_1.User.hasMany(poster_generation_model_1.PosterGeneration, { foreignKey: 'userId', as: 'posters' });
poster_generation_model_1.PosterGeneration.belongsTo(user_model_1.User, { foreignKey: 'userId', as: 'user' });
// 添加第五批模型的关联
// AI模型配置关联
user_model_1.User.hasMany(ai_model_config_model_1.AIModelConfig, { foreignKey: 'creatorId', as: 'aiModelConfigs' });
ai_model_config_model_1.AIModelConfig.belongsTo(user_model_1.User, { foreignKey: 'creatorId', as: 'creator' });
// AI会话关联
user_model_1.User.hasMany(ai_conversation_model_1.AIConversation, { foreignKey: 'userId', as: 'aiConversations' });
ai_conversation_model_1.AIConversation.belongsTo(user_model_1.User, { foreignKey: 'userId', as: 'user' });
// AI消息关联
ai_conversation_model_1.AIConversation.hasMany(ai_message_model_1.AIMessage, { foreignKey: 'conversationId', as: 'messages' });
ai_message_model_1.AIMessage.belongsTo(ai_conversation_model_1.AIConversation, { foreignKey: 'conversationId', as: 'conversation' });
// AI反馈关联
ai_message_model_1.AIMessage.hasMany(ai_feedback_model_1.AIFeedback, { foreignKey: 'messageId', as: 'feedback' });
ai_feedback_model_1.AIFeedback.belongsTo(ai_message_model_1.AIMessage, { foreignKey: 'messageId', as: 'message' });
// AI使用权限关联
user_model_1.User.hasMany(ai_user_permission_model_1.AIUserPermission, { foreignKey: 'userId', as: 'aiPermissions' });
ai_user_permission_model_1.AIUserPermission.belongsTo(user_model_1.User, { foreignKey: 'userId', as: 'user' });
// 专家咨询关联
console.log('设置 ExpertConsultation 关联...');
(0, expert_consultation_model_1.setupExpertConsultationAssociations)();
// 添加第六批模型的关联
// 通知关联
user_model_1.User.hasMany(notification_model_1.Notification, { foreignKey: 'userId', as: 'notifications' });
notification_model_1.Notification.belongsTo(user_model_1.User, { foreignKey: 'userId', as: 'user' });
// 待办事项关联
user_model_1.User.hasMany(todo_model_1.Todo, { foreignKey: 'userId', as: 'todos' });
todo_model_1.Todo.belongsTo(user_model_1.User, { foreignKey: 'userId', as: 'user' });
// 待办事项分配关联
user_model_1.User.hasMany(todo_model_1.Todo, { foreignKey: 'assignedTo', as: 'assignedTodos' });
todo_model_1.Todo.belongsTo(user_model_1.User, { foreignKey: 'assignedTo', as: 'assignee' });
// 文件存储关联
user_model_1.User.hasMany(file_storage_model_1.FileStorage, { foreignKey: 'uploaderId', as: 'uploadedFiles' });
file_storage_model_1.FileStorage.belongsTo(user_model_1.User, { foreignKey: 'uploaderId', as: 'uploader' });
// 操作日志关联
user_model_1.User.hasMany(operation_log_model_1.OperationLog, { foreignKey: 'operatorId', as: 'operationLogs' });
operation_log_model_1.OperationLog.belongsTo(user_model_1.User, { foreignKey: 'operatorId', as: 'operator' });
// 日程关联
user_model_1.User.hasMany(schedule_model_1.Schedule, { foreignKey: 'user_id', as: 'createdSchedules' });
schedule_model_1.Schedule.belongsTo(user_model_1.User, { foreignKey: 'user_id', as: 'creator' });
// PerformanceRule关联
console.log('设置 PerformanceRule 关联...');
(0, PerformanceRule_1.initPerformanceRuleAssociations)();
console.log('设置 EnrollmentConsultation 关联...');
enrollment_consultation_model_1.EnrollmentConsultation.initAssociations();
console.log('设置 EnrollmentConsultationFollowup 关联...');
enrollment_consultation_followup_model_1.EnrollmentConsultationFollowup.initAssociations();
// 班级和学生一对多关联 - 已在Class.initClassAssociations中定义，此处注释掉避免重复
// Class.hasMany(Student, { foreignKey: 'classId', as: 'students' });
// 幼儿园和学生一对多关联 - 已在各自模型文件中定义，此处注释掉避免重复
// Kindergarten.hasMany(Student, { foreignKey: 'kindergartenId', as: 'students' });
// 家长和学生多对多关联
parent_model_1.Parent.belongsToMany(student_model_1.Student, { through: parent_student_relation_model_1.ParentStudentRelation, foreignKey: 'userId', otherKey: 'studentId', as: 'Students' });
student_model_1.Student.belongsToMany(parent_model_1.Parent, { through: parent_student_relation_model_1.ParentStudentRelation, foreignKey: 'studentId', otherKey: 'userId', as: 'Parents' });
// 调用学生模型的关联初始化函数 - 已在models/index.ts中调用，此处注释掉避免重复
// initStudentAssociations();
// 调用家长学生关系模型的关联初始化函数
(0, parent_student_relation_model_2.initParentStudentRelationAssociations)();
// 幼儿园和班级一对多关联 - 已在各自模型文件中定义，此处注释掉避免重复
// Kindergarten.hasMany(Class, { foreignKey: 'kindergartenId', as: 'classes' });
// Class.belongsTo(Kindergarten, { foreignKey: 'kindergartenId', as: 'kindergarten' });
// 页面说明文档关联
console.log('设置 PageGuide 关联...');
var initPageGuideAssociations = require('./models/page-guide.model').initPageGuideAssociations;
initPageGuideAssociations();
// 话术模型关联
console.log('设置 Script 关联...');
(0, script_model_1.defineScriptAssociations)();
// 视频制作模型关联
console.log('设置 VideoProject 关联...');
video_project_model_1["default"].belongsTo(user_model_1.User, { foreignKey: 'userId', as: 'user' });
user_model_1.User.hasMany(video_project_model_1["default"], { foreignKey: 'userId', as: 'videoProjects' });
// 检查中心模型关联
console.log('设置检查中心模型关联...');
// InspectionPlan -> InspectionType
inspection_plan_model_1["default"].belongsTo(inspection_type_model_1["default"], {
    foreignKey: 'inspectionTypeId',
    as: 'inspectionType'
});
inspection_type_model_1["default"].hasMany(inspection_plan_model_1["default"], {
    foreignKey: 'inspectionTypeId',
    as: 'plans'
});
// InspectionPlan -> Kindergarten
inspection_plan_model_1["default"].belongsTo(kindergarten_model_1.Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten'
});
kindergarten_model_1.Kindergarten.hasMany(inspection_plan_model_1["default"], {
    foreignKey: 'kindergartenId',
    as: 'inspectionPlans'
});
// InspectionPlan -> User (responsible)
inspection_plan_model_1["default"].belongsTo(user_model_1.User, {
    foreignKey: 'responsibleUserId',
    as: 'responsibleUser'
});
// DocumentTemplate -> InspectionType
document_template_model_1["default"].belongsTo(inspection_type_model_1["default"], {
    foreignKey: 'inspectionTypeId',
    as: 'inspectionType'
});
inspection_type_model_1["default"].hasMany(document_template_model_1["default"], {
    foreignKey: 'inspectionTypeId',
    as: 'templates'
});
// InspectionTask -> InspectionPlan
inspection_task_model_1["default"].belongsTo(inspection_plan_model_1["default"], {
    foreignKey: 'inspectionPlanId',
    as: 'inspectionPlan'
});
inspection_plan_model_1["default"].hasMany(inspection_task_model_1["default"], {
    foreignKey: 'inspectionPlanId',
    as: 'tasks'
});
// InspectionTask -> User (assignee)
inspection_task_model_1["default"].belongsTo(user_model_1.User, {
    foreignKey: 'assigneeId',
    as: 'assignee'
});
console.log('✅ 检查中心模型关联设置完成');
console.log('=== 模型关联设置完成 ===');
// 导出六维记忆模型
var six_dimension_memory_model_1 = require("./models/memory/six-dimension-memory.model");
__createBinding(exports, six_dimension_memory_model_1, "MemoryModels");
console.log('=== 初始化脚本执行完毕 ===');
