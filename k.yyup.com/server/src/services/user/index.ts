/**
 * 用户服务层索引文件
 * 用于导出所有用户管理相关服务
 */

// 导入实现的服务实例
import UserService from './user.service';
import UserProfileService from './user-profile.service';

// 导出已实现的服务实例
export { UserService, UserProfileService };

/**
 * 导出所有用户服务
 * @description 随着服务实现，将依次取消注释
 */
export default {
  UserService,
  UserProfileService,
  // UserLogService,
  // UserSettingsService,
  // UserNotificationService,
};

/**
 * 开发计划:
 * 1. 用户管理服务 (user.service.ts) ✓
 * 2. 用户资料服务 (user-profile.service.ts) ✓
 * 3. 用户日志服务 (user-log.service.ts)
 * 4. 用户设置服务 (user-settings.service.ts)
 * 5. 用户通知服务 (user-notification.service.ts)
 */ 