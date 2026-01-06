/**
 * 字段映射和命名规范配置
 * 确保数据库、模型、API、前端之间的字段映射一致性
 */

// 数据库字段到API字段的标准映射
export const DATABASE_TO_API_MAPPING: Record<string, string> = {
  // 通用时间戳字段
  'created_at': 'createdAt',
  'updated_at': 'updatedAt',
  'deleted_at': 'deletedAt',
  
  // 通用ID字段
  'user_id': 'userId',
  'student_id': 'studentId',
  'teacher_id': 'teacherId',
  'parent_id': 'parentId',
  'class_id': 'classId',
  'activity_id': 'activityId',
  'enrollment_plan_id': 'enrollmentPlanId',
  'enrollment_application_id': 'enrollmentApplicationId',
  'marketing_campaign_id': 'marketingCampaignId',
  'advertisement_id': 'advertisementId',
  'kindergarten_id': 'kindergartenId',
  
  // 用户相关字段
  'full_name': 'fullName',
  'first_name': 'firstName',
  'last_name': 'lastName',
  'phone_number': 'phoneNumber',
  'email_address': 'emailAddress',
  'birth_date': 'birthDate',
  'hire_date': 'hireDate',
  'enrollment_date': 'enrollmentDate',
  
  // 状态和标识字段
  'is_active': 'isActive',
  'is_deleted': 'isDeleted',
  'is_verified': 'isVerified',
  'is_approved': 'isApproved',
  'status_code': 'statusCode',
  'display_order': 'displayOrder',
  'sort_order': 'sortOrder',
  
  // 活动相关字段
  'start_date': 'startDate',
  'end_date': 'endDate',
  'start_time': 'startTime',
  'end_time': 'endTime',
  'registration_start': 'registrationStart',
  'registration_end': 'registrationEnd',
  'max_participants': 'maxParticipants',
  'current_participants': 'currentParticipants',
  
  // 招生相关字段
  'application_date': 'applicationDate',
  'interview_date': 'interviewDate',
  'admission_date': 'admissionDate',
  'plan_year': 'planYear',
  'total_quota': 'totalQuota',
  'used_quota': 'usedQuota',
  'available_quota': 'availableQuota',
  
  // AI相关字段
  'conversation_id': 'conversationId',
  'message_content': 'messageContent',
  'model_name': 'modelName',
  'token_count': 'tokenCount',
  'response_time': 'responseTime',
  'memory_content': 'memoryContent',
  'similarity_score': 'similarityScore',
  
  // 营销相关字段
  'campaign_name': 'campaignName',
  'campaign_type': 'campaignType',
  'target_audience': 'targetAudience',
  'budget_amount': 'budgetAmount',
  'spent_amount': 'spentAmount',
  'click_count': 'clickCount',
  'conversion_rate': 'conversionRate',
  
  // 系统相关字段
  'config_key': 'configKey',
  'config_value': 'configValue',
  'log_level': 'logLevel',
  'error_message': 'errorMessage',
  'file_path': 'filePath',
  'file_size': 'fileSize',
  'file_type': 'fileType',
  'mime_type': 'mimeType'
};

// API字段到前端显示字段的映射
export const API_TO_FRONTEND_MAPPING: Record<string, string> = {
  // 时间字段的前端显示
  'createdAt': 'createTime',
  'updatedAt': 'updateTime',
  'deletedAt': 'deleteTime',
  
  // ID字段的前端显示
  'studentId': 'id',
  'teacherId': 'id', 
  'parentId': 'id',
  'classId': 'id',
  'activityId': 'id',
  'userId': 'id',
  
  // 名称字段的前端显示
  'fullName': 'name',
  'firstName': 'firstName',
  'lastName': 'lastName',
  
  // 联系方式的前端显示
  'phoneNumber': 'phone',
  'emailAddress': 'email',
  
  // 日期字段的前端显示
  'birthDate': 'birthday',
  'hireDate': 'joinDate',
  'enrollmentDate': 'enrollDate',
  'startDate': 'startTime',
  'endDate': 'endTime',
  
  // 状态字段的前端显示
  'isActive': 'status',
  'isDeleted': 'deleted',
  'isVerified': 'verified',
  'isApproved': 'approved'
};

// 表名到路由路径的映射规则
export const TABLE_TO_ROUTE_MAPPING: Record<string, string> = {
  // 核心用户表
  'users': '/users',
  'roles': '/roles', 
  'permissions': '/permissions',
  'user_roles': '/user-roles',
  'role_permissions': '/role-permissions',
  'user_profiles': '/user-profiles',
  
  // 教育管理表
  'students': '/students',
  'teachers': '/teachers',
  'parents': '/parents',
  'classes': '/classes',
  'parent_student_relations': '/parent-student-relations',
  'class_teachers': '/class-teachers',
  
  // 招生管理表
  'enrollment_plans': '/enrollment-plans',
  'enrollment_applications': '/enrollment-applications',
  'enrollment_consultations': '/enrollment-consultations',
  'enrollment_interviews': '/enrollment-interviews',
  'enrollment_quotas': '/enrollment-quotas',
  'enrollment_tasks': '/enrollment-tasks',
  'admission_results': '/admission-results',
  'admission_notifications': '/admission-notifications',
  
  // 活动管理表
  'activities': '/activities',
  'activity_plans': '/activity-plans',
  'activity_registrations': '/activity-registrations',
  'activity_evaluations': '/activity-evaluations',
  'activity_arrangements': '/activity-arrangements',
  'activity_resources': '/activity-resources',
  'activity_staffs': '/activity-staffs',
  
  // 营销管理表
  'marketing_campaigns': '/marketing-campaigns',
  'advertisements': '/advertisements',
  'channels': '/channels',
  'channel_trackings': '/channel-trackings',
  'conversion_trackings': '/conversion-trackings',
  
  // AI服务表
  'ai_conversations': '/ai-conversations',
  'ai_messages': '/ai-messages',
  'ai_feedbacks': '/ai-feedbacks',
  'ai_model_config': '/ai-model-config',
  'ai_model_usage': '/ai-model-usage',
  'ai_model_billing': '/ai-model-billing',
  'ai_user_permissions': '/ai-user-permissions',
  'ai_user_relations': '/ai-user-relations',
  
  // 系统管理表
  'system_configs': '/system-configs',
  'system_logs': '/system-logs',
  'operation_logs': '/operation-logs',
  'notifications': '/notifications',
  'schedules': '/schedules',
  'todos': '/todos',
  'file_storages': '/file-storages',
  
  // 海报模板表
  'poster_templates': '/poster-templates',
  'poster_elements': '/poster-elements',
  'poster_generations': '/poster-generations',
  'personal_posters': '/personal-posters',
  
  // 消息模板表
  'message_templates': '/message-templates',
  'message_records': '/message-records',
  
  // 绩效管理表
  'performance_rules': '/performance-rules',
  
  // 推荐系统表
  'referral_codes': '/referral-codes',
  'referral_relationships': '/referral-relationships',
  'referral_rewards': '/referral-rewards',
  'referral_statistics': '/referral-statistics',
  
  // 其他功能表
  'kindergartens': '/kindergartens',
  'coupons': '/coupons',
  'like_collect_config': '/like-collect-config',
  'like_collect_records': '/like-collect-records',
  'parent_followups': '/parent-followups',
  'token_blacklist': '/token-blacklist',
  'change_log': '/change-log',
  'base': '/base'
};

// 表名到模型名的映射规则
export const TABLE_TO_MODEL_MAPPING: Record<string, string> = {
  // 核心用户模型
  'users': 'User',
  'roles': 'Role',
  'permissions': 'Permission',
  'user_roles': 'UserRole',
  'role_permissions': 'RolePermission',
  'user_profiles': 'UserProfile',
  
  // 教育管理模型
  'students': 'Student',
  'teachers': 'Teacher',
  'parents': 'Parent',
  'classes': 'Class',
  'parent_student_relations': 'ParentStudentRelation',
  'class_teachers': 'ClassTeacher',
  
  // 招生管理模型
  'enrollment_plans': 'EnrollmentPlan',
  'enrollment_applications': 'EnrollmentApplication',
  'enrollment_consultations': 'EnrollmentConsultation',
  'enrollment_interviews': 'EnrollmentInterview',
  'enrollment_quotas': 'EnrollmentQuota',
  'enrollment_tasks': 'EnrollmentTask',
  'admission_results': 'AdmissionResult',
  'admission_notifications': 'AdmissionNotification',
  
  // 活动管理模型
  'activities': 'Activity',
  'activity_plans': 'ActivityPlan',
  'activity_registrations': 'ActivityRegistration',
  'activity_evaluations': 'ActivityEvaluation',
  'activity_arrangements': 'ActivityArrangement',
  'activity_resources': 'ActivityResource',
  'activity_staffs': 'ActivityStaff',
  
  // 营销管理模型
  'marketing_campaigns': 'MarketingCampaign',
  'advertisements': 'Advertisement',
  'channels': 'Channel',
  'channel_trackings': 'ChannelTracking',
  'conversion_trackings': 'ConversionTracking',
  
  // AI服务模型
  'ai_conversations': 'AIConversation',
  'ai_messages': 'AIMessage',
  'ai_memories': 'AIMemory',
  'ai_feedbacks': 'AIFeedback',
  'ai_model_config': 'AIModelConfig',
  'ai_model_usage': 'AIModelUsage',
  'ai_model_billing': 'AIModelBilling',
  'ai_user_permissions': 'AIUserPermission',
  'ai_user_relations': 'AIUserRelation',
  
  // 系统管理模型
  'system_configs': 'SystemConfig',
  'system_logs': 'SystemLog',
  'operation_logs': 'OperationLog',
  'notifications': 'Notification',
  'schedules': 'Schedule',
  'todos': 'Todo',
  'file_storages': 'FileStorage',
  
  // 海报模板模型
  'poster_templates': 'PosterTemplate',
  'poster_elements': 'PosterElement',
  'poster_generations': 'PosterGeneration',
  'personal_posters': 'PersonalPoster',
  
  // 消息模板模型
  'message_templates': 'MessageTemplate',
  'message_records': 'MessageRecord',
  
  // 绩效管理模型
  'performance_rules': 'PerformanceRule',
  
  // 推荐系统模型
  'referral_codes': 'ReferralCode',
  'referral_relationships': 'ReferralRelationship',
  'referral_rewards': 'ReferralReward',
  'referral_statistics': 'ReferralStatistic',
  
  // 其他功能模型
  'kindergartens': 'Kindergarten',
  'coupons': 'Coupon',
  'like_collect_config': 'LikeCollectConfig',
  'like_collect_records': 'LikeCollectRecord',
  'parent_followups': 'ParentFollowup',
  'token_blacklist': 'TokenBlacklist',
  'change_log': 'ChangeLog',
  'base': 'Base'
};

// 不需要生成路由的系统表
export const SYSTEM_TABLES_TO_SKIP = [
  'SequelizeMeta',
  'sequelize_meta',
  'activities_backup_1751799168', // 临时备份表
  'permissions_backup',
  'roles_backup'
];

// 字段类型推断规则
export const FIELD_TYPE_INFERENCE: Record<string, string> = {
  // ID字段
  'id': 'DataTypes.INTEGER.UNSIGNED',
  '_id$': 'DataTypes.INTEGER.UNSIGNED',
  
  // 时间字段
  'created_at': 'DataTypes.DATE',
  'updated_at': 'DataTypes.DATE', 
  'deleted_at': 'DataTypes.DATE',
  'date$': 'DataTypes.DATE',
  'time$': 'DataTypes.DATE',
  '_at$': 'DataTypes.DATE',
  
  // 布尔字段
  'is_': 'DataTypes.BOOLEAN',
  'has_': 'DataTypes.BOOLEAN',
  'can_': 'DataTypes.BOOLEAN',
  
  // 数值字段
  'count': 'DataTypes.INTEGER',
  'amount': 'DataTypes.DECIMAL(10,2)',
  'price': 'DataTypes.DECIMAL(10,2)',
  'rate': 'DataTypes.DECIMAL(5,4)',
  'score': 'DataTypes.DECIMAL(3,2)',
  'quota': 'DataTypes.INTEGER',
  'size': 'DataTypes.INTEGER',
  
  // 枚举字段
  'status': 'DataTypes.ENUM',
  'type': 'DataTypes.ENUM',
  'role': 'DataTypes.ENUM',
  'level': 'DataTypes.ENUM',
  'grade': 'DataTypes.ENUM',
  
  // 文本字段
  'description': 'DataTypes.TEXT',
  'content': 'DataTypes.TEXT',
  'remark': 'DataTypes.TEXT',
  'comment': 'DataTypes.TEXT',
  'note': 'DataTypes.TEXT',
  
  // JSON字段
  'config': 'DataTypes.JSON',
  'metadata': 'DataTypes.JSON',
  'options': 'DataTypes.JSON',
  'settings': 'DataTypes.JSON'
};

/**
 * 自动转换snake_case到camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * 自动转换camelCase到snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * 根据表名获取路由路径
 */
export function getRoutePathByTable(tableName: string): string {
  return TABLE_TO_ROUTE_MAPPING[tableName] || `/${tableName.replace(/_/g, '-')}`;
}

/**
 * 根据表名获取模型名
 */
export function getModelNameByTable(tableName: string): string {
  return TABLE_TO_MODEL_MAPPING[tableName] || 
    tableName.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
}

/**
 * 根据数据库字段获取API字段名
 */
export function getAPIFieldName(dbFieldName: string): string {
  return DATABASE_TO_API_MAPPING[dbFieldName] || snakeToCamel(dbFieldName);
}

/**
 * 根据API字段获取前端显示字段名
 */
export function getFrontendFieldName(apiFieldName: string): string {
  return API_TO_FRONTEND_MAPPING[apiFieldName] || apiFieldName;
}

/**
 * 根据字段名推断数据类型
 */
export function inferFieldType(fieldName: string): string {
  // 精确匹配
  if (FIELD_TYPE_INFERENCE[fieldName]) {
    return FIELD_TYPE_INFERENCE[fieldName];
  }
  
  // 模式匹配
  for (const [pattern, type] of Object.entries(FIELD_TYPE_INFERENCE)) {
    if (pattern.endsWith('$')) {
      const regex = new RegExp(pattern);
      if (regex.test(fieldName)) {
        return type;
      }
    } else if (fieldName.includes(pattern)) {
      return type;
    }
  }
  
  // 默认字符串类型
  return 'DataTypes.STRING';
}

/**
 * 检查表是否应该跳过路由生成
 */
export function shouldSkipTable(tableName: string): boolean {
  return SYSTEM_TABLES_TO_SKIP.includes(tableName);
}

export default {
  DATABASE_TO_API_MAPPING,
  API_TO_FRONTEND_MAPPING,
  TABLE_TO_ROUTE_MAPPING,
  TABLE_TO_MODEL_MAPPING,
  SYSTEM_TABLES_TO_SKIP,
  FIELD_TYPE_INFERENCE,
  snakeToCamel,
  camelToSnake,
  getRoutePathByTable,
  getModelNameByTable,
  getAPIFieldName,
  getFrontendFieldName,
  inferFieldType,
  shouldSkipTable
};