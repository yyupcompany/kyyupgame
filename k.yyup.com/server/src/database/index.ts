import { Sequelize, Op } from 'sequelize';
import { getDatabaseConfig } from '../config/database-unified';
import * as models from '../models';
import { AIUsageLog } from '../models/ai_usage_logs';

// 获取数据库配置
const dbConfig = getDatabaseConfig();

// 创建Sequelize实例
const sequelizeOptions: any = {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  define: dbConfig.define,
  pool: dbConfig.pool,
  dialectOptions: {
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
  }
};

// SQLite不支持时区设置
if (dbConfig.dialect !== 'sqlite' && dbConfig.timezone) {
  sequelizeOptions.timezone = dbConfig.timezone;
}

// 添加其他配置
if (dbConfig.storage) {
  sequelizeOptions.storage = dbConfig.storage;
}

const sequelize = new Sequelize(
  dbConfig.database || '',
  dbConfig.username || '',
  dbConfig.password || '',
  {
    ...sequelizeOptions,
    logging: dbConfig.logging
  }
);

// 创建一个类似之前的db对象
const db = {
  sequelize,
  Sequelize: { ...Sequelize, Op },
  // 模型的小写复数形式映射
  users: models.User,
  roles: models.Role,
  permissions: models.Permission,
  userRoles: models.UserRoleModel,
  user_roles: models.UserRoleModel, // 添加别名
  rolePermissions: models.RolePermission,
  
  // 幼儿园相关
  kindergartens: models.Kindergarten,
  classes: models.Class,
  classTeachers: models.ClassTeacher,
  
  // 人员相关
  teachers: models.Teacher,
  students: models.Student,
  parents: models.Parent,
  
  // 活动相关
  activities: models.Activity,
  activityRegistrations: models.ActivityRegistration,
  activityEvaluations: models.ActivityEvaluation,
  
  // 招生相关
  enrollmentPlans: models.EnrollmentPlan,
  enrollmentApplications: models.EnrollmentApplication,
  enrollmentConsultations: models.EnrollmentConsultation,
  enrollmentTasks: models.EnrollmentTask,
  
  // 系统相关
  todos: models.Todo,
  notifications: models.Notification,
  schedules: models.Schedule,
  systemLogs: models.SystemLog,
  
  // AI相关 - 🚀 AI模型已迁移到统一租户中心
  aiMessages: models.AIMessage,
  aiFeedbacks: models.AIFeedback,
  // aiModelUsages: models.AIModelUsage,
  // aiModelConfigs: models.AIModelConfig,
  ai_usage_logs: AIUsageLog, // 添加 AI 使用日志
  // ai_models: models.AIModelConfig, // 暂时使用 AIModelConfig 作为 ai_models
  
  // 审批相关
  approvals: models.Approval,
  
  // 其他
  channelTrackings: models.ChannelTracking,
  conversionTrackings: models.ConversionTracking,
  performanceRules: models.PerformanceRule,

  // 财务相关
  feeItems: models.FeeItem,
  feePackageTemplates: models.FeePackageTemplate,
  paymentBills: models.PaymentBill,
  paymentRecords: models.PaymentRecord,
  financialReports: models.FinancialReport,
};

export default db;
export { sequelize, Sequelize };