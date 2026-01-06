"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.__esModule = true;
exports.Sequelize = exports.sequelize = void 0;
var sequelize_1 = require("sequelize");
exports.Sequelize = sequelize_1.Sequelize;
var database_unified_1 = require("../config/database-unified");
var models = __importStar(require("../models"));
var ai_usage_logs_1 = require("../models/ai_usage_logs");
// 获取数据库配置
var dbConfig = (0, database_unified_1.getDatabaseConfig)();
// 创建Sequelize实例
var sequelizeOptions = {
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
var sequelize = new sequelize_1.Sequelize(dbConfig.database || '', dbConfig.username || '', dbConfig.password || '', __assign(__assign({}, sequelizeOptions), { logging: dbConfig.logging }));
exports.sequelize = sequelize;
// 创建一个类似之前的db对象
var db = {
    sequelize: sequelize,
    Sequelize: __assign(__assign({}, sequelize_1.Sequelize), { Op: sequelize_1.Op }),
    // 模型的小写复数形式映射
    users: models.User,
    roles: models.Role,
    permissions: models.Permission,
    userRoles: models.UserRoleModel,
    user_roles: models.UserRoleModel,
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
    // AI相关
    aiMessages: models.AIMessage,
    aiFeedbacks: models.AIFeedback,
    aiModelUsages: models.AIModelUsage,
    aiModelConfigs: models.AIModelConfig,
    ai_usage_logs: ai_usage_logs_1.AIUsageLog,
    ai_models: models.AIModelConfig,
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
    financialReports: models.FinancialReport
};
exports["default"] = db;
