"use strict";
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
exports.ApprovalUrgency = exports.ApprovalStatus = exports.ApprovalType = exports.Approval = exports.PerformanceRule = exports.EnrollmentTask = exports.ConversionTracking = exports.ChannelTracking = exports.ParentFollowup = exports.AIUserPermission = exports.AIUserRelation = exports.AIModelConfig = exports.AIModelUsage = exports.AIFeedback = exports.AIMessage = exports.SystemLog = exports.RepeatType = exports.ScheduleStatus = exports.Schedule = exports.NotificationType = exports.NotificationStatus = exports.Notification = exports.TodoStatus = exports.Todo = exports.ActivityEvaluation = exports.ActivityRegistration = exports.ActivityTemplate = exports.ActivityStatus = exports.Activity = exports.EnrollmentPlanTracking = exports.EnrollmentConsultationFollowup = exports.EnrollmentConsultation = exports.EnrollmentPlanAssignee = exports.EnrollmentApplication = exports.EnrollmentPlan = exports.ClassTeacher = exports.Class = exports.Parent = exports.Student = exports.Teacher = exports.Kindergarten = exports.RolePermission = exports.UserRoleModel = exports.PermissionStatus = exports.PermissionType = exports.Permission = exports.Role = exports.UserRole = exports.UserStatus = exports.User = void 0;
exports.initModels = exports.FinancialReport = exports.PaymentRecord = exports.PaymentBill = exports.FeePackageTemplate = exports.FeeItem = exports.FieldTemplate = exports.OrganizationStatus = exports.InspectionTask = exports.DocumentTemplate = exports.InspectionPlan = exports.InspectionType = exports.Task = exports.LeaveType = exports.TeacherAttendanceStatus = exports.TeacherAttendance = exports.ChangeType = exports.AttendanceChangeLog = exports.HealthStatus = exports.AttendanceStatus = exports.Attendance = exports.VideoProject = exports.TaskAttachment = exports.CustomerApplicationStatus = exports.CustomerApplication = exports.ChampionshipRecord = exports.ExternalDisplayRecord = exports.OutdoorTrainingRecord = exports.TeachingMediaRecord = exports.CourseProgress = exports.CoursePlan = exports.BrainScienceCourse = exports.PosterCategory = exports.PageGuideSection = exports.PageGuide = void 0;
var user_model_1 = require("./user.model");
exports.User = user_model_1.User;
exports.UserStatus = user_model_1.UserStatus;
exports.UserRole = user_model_1.UserRole;
var role_model_1 = require("./role.model");
exports.Role = role_model_1.Role;
var permission_model_1 = require("./permission.model");
exports.Permission = permission_model_1.Permission;
exports.PermissionType = permission_model_1.PermissionType;
exports.PermissionStatus = permission_model_1.PermissionStatus;
var user_role_model_1 = require("./user-role.model");
exports.UserRoleModel = user_role_model_1.UserRole;
var role_permission_model_1 = require("./role-permission.model");
exports.RolePermission = role_permission_model_1.RolePermission;
var kindergarten_model_1 = require("./kindergarten.model");
exports.Kindergarten = kindergarten_model_1.Kindergarten;
var teacher_model_1 = require("./teacher.model");
exports.Teacher = teacher_model_1.Teacher;
var student_model_1 = require("./student.model");
exports.Student = student_model_1.Student;
var parent_model_1 = require("./parent.model");
exports.Parent = parent_model_1.Parent;
var class_model_1 = require("./class.model");
exports.Class = class_model_1.Class;
var class_teacher_model_1 = require("./class-teacher.model");
exports.ClassTeacher = class_teacher_model_1.ClassTeacher;
var enrollment_plan_model_1 = require("./enrollment-plan.model");
exports.EnrollmentPlan = enrollment_plan_model_1.EnrollmentPlan;
var enrollment_application_model_1 = require("./enrollment-application.model");
exports.EnrollmentApplication = enrollment_application_model_1.EnrollmentApplication;
var enrollment_plan_assignee_model_1 = require("./enrollment-plan-assignee.model");
exports.EnrollmentPlanAssignee = enrollment_plan_assignee_model_1.EnrollmentPlanAssignee;
var enrollment_consultation_model_1 = require("./enrollment-consultation.model");
exports.EnrollmentConsultation = enrollment_consultation_model_1.EnrollmentConsultation;
var enrollment_consultation_followup_model_1 = require("./enrollment-consultation-followup.model");
exports.EnrollmentConsultationFollowup = enrollment_consultation_followup_model_1.EnrollmentConsultationFollowup;
var enrollment_plan_tracking_model_1 = require("./enrollment-plan-tracking.model");
exports.EnrollmentPlanTracking = enrollment_plan_tracking_model_1.EnrollmentPlanTracking;
var activity_model_1 = require("./activity.model");
exports.Activity = activity_model_1.Activity;
exports.ActivityStatus = activity_model_1.ActivityStatus;
var activity_template_model_1 = require("./activity-template.model");
exports.ActivityTemplate = activity_template_model_1.ActivityTemplate;
var activity_registration_model_1 = require("./activity-registration.model");
exports.ActivityRegistration = activity_registration_model_1.ActivityRegistration;
var activity_evaluation_model_1 = require("./activity-evaluation.model");
exports.ActivityEvaluation = activity_evaluation_model_1.ActivityEvaluation;
var todo_model_1 = require("./todo.model");
exports.Todo = todo_model_1.Todo;
exports.TodoStatus = todo_model_1.TodoStatus;
var notification_model_1 = require("./notification.model");
exports.Notification = notification_model_1.Notification;
exports.NotificationStatus = notification_model_1.NotificationStatus;
exports.NotificationType = notification_model_1.NotificationType;
var schedule_model_1 = require("./schedule.model");
exports.Schedule = schedule_model_1.Schedule;
exports.ScheduleStatus = schedule_model_1.ScheduleStatus;
exports.RepeatType = schedule_model_1.RepeatType;
var PerformanceRule_1 = require("./PerformanceRule");
exports.PerformanceRule = PerformanceRule_1.PerformanceRule;
var system_log_model_1 = require("./system-log.model");
exports.SystemLog = system_log_model_1.SystemLog;
var ai_message_model_1 = require("./ai-message.model");
exports.AIMessage = ai_message_model_1.AIMessage;
// AIMemory model removed - replaced by six-dimensional memory system
var ai_feedback_model_1 = require("./ai-feedback.model");
exports.AIFeedback = ai_feedback_model_1.AIFeedback;
var ai_model_usage_model_1 = require("./ai-model-usage.model");
exports.AIModelUsage = ai_model_usage_model_1.AIModelUsage;
var ai_model_config_model_1 = require("./ai-model-config.model");
exports.AIModelConfig = ai_model_config_model_1.AIModelConfig;
var ai_user_relation_model_1 = require("./ai-user-relation.model");
exports.AIUserRelation = ai_user_relation_model_1.AIUserRelation;
var ai_user_permission_model_1 = require("./ai-user-permission.model");
exports.AIUserPermission = ai_user_permission_model_1.AIUserPermission;
var parent_followup_model_1 = require("./parent-followup.model");
exports.ParentFollowup = parent_followup_model_1.ParentFollowup;
var channel_tracking_model_1 = require("./channel-tracking.model");
exports.ChannelTracking = channel_tracking_model_1.ChannelTracking;
var conversion_tracking_model_1 = require("./conversion-tracking.model");
exports.ConversionTracking = conversion_tracking_model_1.ConversionTracking;
var enrollment_task_model_1 = require("./enrollment-task.model");
exports.EnrollmentTask = enrollment_task_model_1.EnrollmentTask;
var approval_model_1 = require("./approval.model");
exports.Approval = approval_model_1.Approval;
exports.ApprovalType = approval_model_1.ApprovalType;
exports.ApprovalStatus = approval_model_1.ApprovalStatus;
exports.ApprovalUrgency = approval_model_1.ApprovalUrgency;
var page_guide_model_1 = require("./page-guide.model");
exports.PageGuide = page_guide_model_1.PageGuide;
exports.PageGuideSection = page_guide_model_1.PageGuideSection;
var poster_category_model_1 = require("./poster-category.model");
exports.PosterCategory = poster_category_model_1.PosterCategory;
// 教学中心模型
var brain_science_course_model_1 = require("./brain-science-course.model");
exports.BrainScienceCourse = brain_science_course_model_1.BrainScienceCourse;
var course_plan_model_1 = require("./course-plan.model");
exports.CoursePlan = course_plan_model_1.CoursePlan;
var course_progress_model_1 = require("./course-progress.model");
exports.CourseProgress = course_progress_model_1.CourseProgress;
var teaching_media_record_model_1 = require("./teaching-media-record.model");
exports.TeachingMediaRecord = teaching_media_record_model_1.TeachingMediaRecord;
var outdoor_training_record_model_1 = require("./outdoor-training-record.model");
exports.OutdoorTrainingRecord = outdoor_training_record_model_1.OutdoorTrainingRecord;
var external_display_record_model_1 = require("./external-display-record.model");
exports.ExternalDisplayRecord = external_display_record_model_1.ExternalDisplayRecord;
var championship_record_model_1 = require("./championship-record.model");
exports.ChampionshipRecord = championship_record_model_1.ChampionshipRecord;
// 客户跟进增强版模型
var customer_follow_stage_model_1 = require("./customer-follow-stage.model");
var customer_follow_record_enhanced_model_1 = require("./customer-follow-record-enhanced.model");
var customer_follow_media_model_1 = require("./customer-follow-media.model");
// 客户申请模型
var customer_application_model_1 = require("./customer-application.model");
exports.CustomerApplication = customer_application_model_1.CustomerApplication;
exports.CustomerApplicationStatus = customer_application_model_1.CustomerApplicationStatus;
// 任务附件模型
var task_attachment_model_1 = require("./task-attachment.model");
exports.TaskAttachment = task_attachment_model_1.TaskAttachment;
// 视频制作模型
var video_project_model_1 = __importStar(require("./video-project.model"));
exports.VideoProject = video_project_model_1["default"];
// 考勤相关模型
var attendance_model_1 = require("./attendance.model");
exports.Attendance = attendance_model_1.Attendance;
exports.AttendanceStatus = attendance_model_1.AttendanceStatus;
exports.HealthStatus = attendance_model_1.HealthStatus;
var attendance_change_log_model_1 = require("./attendance-change-log.model");
exports.AttendanceChangeLog = attendance_change_log_model_1.AttendanceChangeLog;
exports.ChangeType = attendance_change_log_model_1.ChangeType;
var teacher_attendance_model_1 = require("./teacher-attendance.model");
exports.TeacherAttendance = teacher_attendance_model_1.TeacherAttendance;
exports.TeacherAttendanceStatus = teacher_attendance_model_1.TeacherAttendanceStatus;
exports.LeaveType = teacher_attendance_model_1.LeaveType;
var task_model_1 = require("./task.model");
exports.Task = task_model_1.Task;
// 检查中心模型
var inspection_type_model_1 = __importDefault(require("./inspection-type.model"));
exports.InspectionType = inspection_type_model_1["default"];
var inspection_plan_model_1 = __importDefault(require("./inspection-plan.model"));
exports.InspectionPlan = inspection_plan_model_1["default"];
var document_template_model_1 = __importDefault(require("./document-template.model"));
exports.DocumentTemplate = document_template_model_1["default"];
var inspection_task_model_1 = __importDefault(require("./inspection-task.model"));
exports.InspectionTask = inspection_task_model_1["default"];
// 机构现状模型
var organization_status_model_1 = require("./organization-status.model");
exports.OrganizationStatus = organization_status_model_1.OrganizationStatus;
// 字段模板模型
var field_template_model_1 = __importStar(require("./field-template.model"));
exports.FieldTemplate = field_template_model_1["default"];
// 导入财务模型
var finance_model_1 = require("./finance.model");
var finance_model_2 = require("./finance.model");
__createBinding(exports, finance_model_2, "FeeItem");
__createBinding(exports, finance_model_2, "FeePackageTemplate");
__createBinding(exports, finance_model_2, "PaymentBill");
__createBinding(exports, finance_model_2, "PaymentRecord");
__createBinding(exports, finance_model_2, "FinancialReport");
/**
 * 初始化所有模型
 * @param sequelize Sequelize实例
 */
var initModels = function (sequelize) {
    console.log('初始化模型...');
    // 第一步: 初始化所有模型
    // 核心认证模型
    user_model_1.User.initModel(sequelize);
    role_model_1.Role.initModel(sequelize);
    permission_model_1.Permission.initModel(sequelize);
    user_role_model_1.UserRole.initModel(sequelize);
    role_permission_model_1.RolePermission.initModel(sequelize);
    // 基础业务模型
    (0, kindergarten_model_1.initKindergarten)(sequelize);
    (0, class_teacher_model_1.initClassTeacher)(sequelize);
    // 招生管理模型
    enrollment_consultation_model_1.EnrollmentConsultation.initModel(sequelize);
    enrollment_consultation_followup_model_1.EnrollmentConsultationFollowup.initModel(sequelize);
    // 客户跟进增强版模型
    customer_follow_stage_model_1.CustomerFollowStage.initModel(sequelize);
    customer_follow_record_enhanced_model_1.CustomerFollowRecordEnhanced.initModel(sequelize);
    customer_follow_media_model_1.CustomerFollowMedia.initModel(sequelize);
    // 客户申请模型
    console.log('📝 初始化客户申请模型...');
    try {
        customer_application_model_1.CustomerApplication.initModel(sequelize);
        console.log('✅ 客户申请模型初始化成功');
    }
    catch (error) {
        console.error('❌ 客户申请模型初始化失败:', error);
        throw error;
    }
    // 添加必要的业务模型初始化
    todo_model_1.Todo.initModel(sequelize);
    schedule_model_1.Schedule.initModel(sequelize);
    notification_model_1.Notification.initModel(sequelize);
    (0, PerformanceRule_1.initPerformanceRule)(sequelize);
    // 任务附件模型
    console.log('📎 初始化任务附件模型...');
    try {
        task_attachment_model_1.TaskAttachment.initModel(sequelize);
        console.log('✅ 任务附件模型初始化成功');
    }
    catch (error) {
        console.error('❌ 任务附件模型初始化失败:', error);
        throw error;
    }
    // AI相关模型 - 传统AIMemory已移除，使用六维记忆系统
    // 海报相关模型
    console.log('🔍 准备调用 PosterCategory.initModel...');
    poster_category_model_1.PosterCategory.initModel(sequelize);
    console.log('✅ PosterCategory.initModel 调用成功');
    // 教学中心模型
    console.log('🔍 准备初始化教学中心模型...');
    try {
        (0, brain_science_course_model_1.initBrainScienceCourseModel)(sequelize);
        (0, course_plan_model_1.initCoursePlanModel)(sequelize);
        (0, course_progress_model_1.initCourseProgressModel)(sequelize);
        (0, teaching_media_record_model_1.initTeachingMediaRecordModel)(sequelize);
        (0, outdoor_training_record_model_1.initOutdoorTrainingRecordModel)(sequelize);
        (0, external_display_record_model_1.initExternalDisplayRecordModel)(sequelize);
        (0, championship_record_model_1.initChampionshipRecordModel)(sequelize);
        console.log('✅ 教学中心模型初始化成功');
    }
    catch (error) {
        console.error('❌ 教学中心模型初始化失败:', error);
        throw error;
    }
    // 财务相关模型
    console.log('🔍 准备调用 initFinanceModels...');
    try {
        (0, finance_model_1.initFinanceModels)(sequelize);
        console.log('✅ initFinanceModels 调用成功');
    }
    catch (error) {
        console.error('❌ initFinanceModels 调用失败:', error);
        throw error;
    }
    // 视频制作模型
    console.log('🎬 初始化视频制作模型...');
    try {
        (0, video_project_model_1.initVideoProjectModel)(sequelize);
        console.log('✅ 视频制作模型初始化成功');
    }
    catch (error) {
        console.error('❌ 视频制作模型初始化失败:', error);
        throw error;
    }
    // 检查中心模型
    console.log('📋 初始化检查中心模型...');
    try {
        inspection_type_model_1["default"].initModel(sequelize);
        inspection_plan_model_1["default"].initModel(sequelize);
        document_template_model_1["default"].initModel(sequelize);
        inspection_task_model_1["default"].initModel(sequelize);
        console.log('✅ 检查中心模型初始化成功');
    }
    catch (error) {
        console.error('❌ 检查中心模型初始化失败:', error);
        throw error;
    }
    // 机构现状模型
    console.log('🏢 初始化机构现状模型...');
    try {
        (0, organization_status_model_1.initOrganizationStatus)(sequelize);
        console.log('✅ 机构现状模型初始化成功');
    }
    catch (error) {
        console.error('❌ 机构现状模型初始化失败:', error);
        throw error;
    }
    // 字段模板模型
    console.log('📋 初始化字段模板模型...');
    try {
        (0, field_template_model_1.initFieldTemplate)(sequelize);
        console.log('✅ 字段模板模型初始化成功');
    }
    catch (error) {
        console.error('❌ 字段模板模型初始化失败:', error);
        throw error;
    }
    // 第二步: 使用专门的方法进行模型关联
    setupAssociations();
};
exports.initModels = initModels;
/**
 * 设置模型之间的关联关系
 */
function setupAssociations() {
    console.log('设置模型关联关系...');
    // User 和 Role 之间的多对多关系
    user_model_1.User.belongsToMany(role_model_1.Role, {
        through: user_role_model_1.UserRole,
        foreignKey: 'userId',
        otherKey: 'roleId',
        as: 'roles'
    });
    role_model_1.Role.belongsToMany(user_model_1.User, {
        through: user_role_model_1.UserRole,
        foreignKey: 'roleId',
        otherKey: 'userId',
        as: 'users'
    });
    // Role 和 Permission 之间的多对多关系
    role_model_1.Role.belongsToMany(permission_model_1.Permission, {
        through: role_permission_model_1.RolePermission,
        foreignKey: 'roleId',
        otherKey: 'permissionId',
        as: 'permissions'
    });
    permission_model_1.Permission.belongsToMany(role_model_1.Role, {
        through: role_permission_model_1.RolePermission,
        foreignKey: 'permissionId',
        otherKey: 'roleId',
        as: 'permissionRoles' // ✅ 修改别名避免与User.roles冲突
    });
    // ✅ 修复：添加User模型关联初始化（包括User.hasOne(Teacher)）
    user_model_1.User.initAssociations();
    // UserRoleModel关联
    user_role_model_1.UserRole.initAssociations();
    // RolePermission关联 - 修复缓存初始化失败问题
    role_permission_model_1.RolePermission.initAssociations();
    // 人员管理模型关联
    (0, teacher_model_1.initTeacherAssociations)();
    (0, student_model_1.initStudentAssociations)();
    parent_model_1.Parent.initAssociations();
    (0, class_model_1.initClassAssociations)();
    (0, class_teacher_model_1.initClassTeacherAssociations)();
    // Todo模型关联
    todo_model_1.Todo.initAssociations();
    // Schedule模型关联
    schedule_model_1.Schedule.initAssociations();
    // Notification模型关联
    notification_model_1.Notification.initAssociations();
    // PerformanceRule模型关联
    (0, PerformanceRule_1.initPerformanceRuleAssociations)();
    // 旧的AIMemory模型关联已移除，使用六维记忆系统
    // 招生管理模型关联
    enrollment_consultation_model_1.EnrollmentConsultation.initAssociations();
    enrollment_consultation_followup_model_1.EnrollmentConsultationFollowup.initAssociations();
    // 客户跟进增强版模型关联
    customer_follow_record_enhanced_model_1.CustomerFollowRecordEnhanced.initAssociations();
    customer_follow_media_model_1.CustomerFollowMedia.initAssociations();
    // 客户申请模型关联
    console.log('📝 设置客户申请模型关联...');
    try {
        customer_application_model_1.CustomerApplication.associate({
            User: user_model_1.User,
            Parent: parent_model_1.Parent,
            Kindergarten: kindergarten_model_1.Kindergarten
        });
        console.log('✅ 客户申请模型关联设置成功');
    }
    catch (error) {
        console.error('❌ 客户申请模型关联设置失败:', error);
        throw error;
    }
    // 任务附件模型关联
    console.log('📎 设置任务附件模型关联...');
    try {
        task_attachment_model_1.TaskAttachment.associate({
            Todo: todo_model_1.Todo,
            User: user_model_1.User
        });
        console.log('✅ 任务附件模型关联设置成功');
    }
    catch (error) {
        console.error('❌ 任务附件模型关联设置失败:', error);
        throw error;
    }
    // 海报分类模型关联
    poster_category_model_1.PosterCategory.initAssociations();
    // 教学中心模型关联
    brain_science_course_model_1.BrainScienceCourse.associate();
    course_plan_model_1.CoursePlan.associate();
    course_progress_model_1.CourseProgress.associate();
    // 视频制作模型关联
    video_project_model_1["default"].belongsTo(user_model_1.User, {
        foreignKey: 'userId',
        as: 'user'
    });
    user_model_1.User.hasMany(video_project_model_1["default"], {
        foreignKey: 'userId',
        as: 'videoProjects'
    });
    teaching_media_record_model_1.TeachingMediaRecord.associate();
    // 检查中心模型关联
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
    // InspectionTask -> InspectionTask (parent-child)
    inspection_task_model_1["default"].belongsTo(inspection_task_model_1["default"], {
        foreignKey: 'parentTaskId',
        as: 'parentTask'
    });
    inspection_task_model_1["default"].hasMany(inspection_task_model_1["default"], {
        foreignKey: 'parentTaskId',
        as: 'subtasks'
    });
    // InspectionTask -> User (assigned)
    inspection_task_model_1["default"].belongsTo(user_model_1.User, {
        foreignKey: 'assignedTo',
        as: 'assignedUser'
    });
    // 机构现状关联
    (0, organization_status_model_1.initOrganizationStatusAssociations)();
    // 字段模板关联
    field_template_model_1["default"].belongsTo(user_model_1.User, {
        foreignKey: 'user_id',
        as: 'creator'
    });
    user_model_1.User.hasMany(field_template_model_1["default"], {
        foreignKey: 'user_id',
        as: 'fieldTemplates'
    });
    console.log('模型关联设置完成');
}
