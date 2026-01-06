/**
 * 服务层索引文件
 * 用于导出所有服务模块
 */

// 导入服务模块
import MarketingServices from './marketing';
import AuthServices from './auth';
import UserServices from './user';
import StudentServices from './student';
import * as ParentServices from './parent';
import * as EnrollmentServices from './enrollment';
import * as AIServices from './ai';

// 导出各个模块服务
export { 
  MarketingServices, 
  AuthServices, 
  UserServices, 
  StudentServices, 
  ParentServices, 
  EnrollmentServices,
  AIServices
};

// 从各模块导出具体服务
export { CouponService, MarketingCampaignService, ChannelTrackingService, AdvertisementService, ConversionTrackingService } from './marketing';
export { AuthService } from './auth';
export { UserService, UserProfileService } from './user';
export { StudentService } from './student';
export { ParentService, ParentFollowupService } from './parent';
export { EnrollmentPlanService, EnrollmentQuotaService } from './enrollment';

// 从AI模块导出具体服务（使用适配器名称）
export {
  aiConversationService,
  aiMessageService,
  modelService as aiModelService
} from './ai';

// 占位符导出
export const aiMemoryService = { get: async () => null, set: async () => {} };
export const aiCleanupService = { cleanup: async () => {} };
export const aiCleanupScheduler = { start: () => {}, stop: () => {} };
export class AICleanupScheduler { start() {} stop() {} }

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
export default {
  MarketingServices,
  AuthServices,
  UserServices,
  StudentServices,
  ParentServices,
  EnrollmentServices,
  AIServices
}; 