"use strict";
/**
 * 服务层索引文件
 * 用于导出所有服务模块
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
exports.analyticsService = exports.feedbackService = exports.conversationService = exports.messageService = exports.modelService = exports.aiAnalyticsService = exports.aiFeedbackService = exports.aiUserRelationService = exports.aiModelBillingService = exports.aiModelConfigService = exports.aiUserPermissionService = exports.aiModelUsageService = exports.aiConversationService = exports.EnrollmentQuotaService = exports.EnrollmentPlanService = exports.ParentFollowupService = exports.ParentService = exports.StudentService = exports.UserProfileService = exports.UserService = exports.AuthService = exports.ConversionTrackingService = exports.AdvertisementService = exports.ChannelTrackingService = exports.MarketingCampaignService = exports.CouponService = exports.AIServices = exports.EnrollmentServices = exports.ParentServices = exports.StudentServices = exports.UserServices = exports.AuthServices = exports.MarketingServices = void 0;
// 导入服务模块
var marketing_1 = __importDefault(require("./marketing"));
exports.MarketingServices = marketing_1["default"];
var auth_1 = __importDefault(require("./auth"));
exports.AuthServices = auth_1["default"];
var user_1 = __importDefault(require("./user"));
exports.UserServices = user_1["default"];
var student_1 = __importDefault(require("./student"));
exports.StudentServices = student_1["default"];
var ParentServices = __importStar(require("./parent"));
exports.ParentServices = ParentServices;
var EnrollmentServices = __importStar(require("./enrollment"));
exports.EnrollmentServices = EnrollmentServices;
var AIServices = __importStar(require("./ai"));
exports.AIServices = AIServices;
// 从各模块导出具体服务
var marketing_2 = require("./marketing");
__createBinding(exports, marketing_2, "CouponService");
__createBinding(exports, marketing_2, "MarketingCampaignService");
__createBinding(exports, marketing_2, "ChannelTrackingService");
__createBinding(exports, marketing_2, "AdvertisementService");
__createBinding(exports, marketing_2, "ConversionTrackingService");
var auth_2 = require("./auth");
__createBinding(exports, auth_2, "AuthService");
var user_2 = require("./user");
__createBinding(exports, user_2, "UserService");
__createBinding(exports, user_2, "UserProfileService");
var student_2 = require("./student");
__createBinding(exports, student_2, "StudentService");
var parent_1 = require("./parent");
__createBinding(exports, parent_1, "ParentService");
__createBinding(exports, parent_1, "ParentFollowupService");
var enrollment_1 = require("./enrollment");
__createBinding(exports, enrollment_1, "EnrollmentPlanService");
__createBinding(exports, enrollment_1, "EnrollmentQuotaService");
// export { FileService } from './file.service'; // 已删除
var ai_1 = require("./ai");
// aiMessageService, // 已被 messageService 替代
__createBinding(exports, ai_1, "aiConversationService");
// aiMemoryService, // removed - replaced by six-dimensional memory system
__createBinding(exports, ai_1, "aiModelUsageService");
__createBinding(exports, ai_1, "aiUserPermissionService");
__createBinding(exports, ai_1, "aiModelConfigService");
__createBinding(exports, ai_1, "aiModelBillingService");
__createBinding(exports, ai_1, "aiUserRelationService");
__createBinding(exports, ai_1, "aiFeedbackService");
__createBinding(exports, ai_1, "aiAnalyticsService");
__createBinding(exports, ai_1, "modelService");
__createBinding(exports, ai_1, "messageService");
__createBinding(exports, ai_1, "conversationService");
__createBinding(exports, ai_1, "feedbackService");
__createBinding(exports, ai_1, "analyticsService");
/**
 * 服务模块开发进度:
 * 1. 用户认证服务 - 完成 (基础认证服务已实现)
 * 2. 用户管理服务 - 部分完成 (基础用户管理服务、用户资料服务已实现)
 * 3. 角色权限服务 - 规划中
 * 4. 幼儿园管理服务 - 规划中
 * 5. 班级管理服务 - 规划中
 * 6. 教师管理服务 - 规划中
 * 7. 学生管理服务 - 已完成 (学生管理基础服务已实现)
 * 8. 家长管理服务 - 已完成 (家长管理基础服务、家长跟进记录服务已实现)
 * 9. 招生计划服务 - 部分完成 (招生计划基础服务已实现)
 * 10. 招生名额服务 - 已完成 (招生名额基础服务已实现)
 * 11. 招生任务服务 - 规划中
 * 12. 活动管理服务 - 规划中
 * 13. 营销组件服务 - 已完成 (优惠券服务、营销活动服务、渠道跟踪服务、广告投放服务和转化跟踪服务已实现)
 * 14. AI功能服务 - 已完成 (AI消息服务、AI会话服务、AI记忆服务、AI模型使用统计服务、AI用户权限服务、AI模型配置服务、AI模型计费服务、AI用户关系服务、AI反馈服务和AI分析服务已实现)
 * 15. 文件管理服务 - 已完成 (文件上传、下载、管理等基础服务已实现)
 */
// 导出所有服务
exports["default"] = {
    MarketingServices: marketing_1["default"],
    AuthServices: auth_1["default"],
    UserServices: user_1["default"],
    StudentServices: student_1["default"],
    ParentServices: ParentServices,
    EnrollmentServices: EnrollmentServices,
    AIServices: AIServices
};
