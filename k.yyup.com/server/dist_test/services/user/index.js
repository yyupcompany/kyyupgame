"use strict";
/**
 * 用户服务层索引文件
 * 用于导出所有用户管理相关服务
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.UserProfileService = exports.UserService = void 0;
// 导入实现的服务实例
var user_service_1 = __importDefault(require("./user.service"));
exports.UserService = user_service_1["default"];
var user_profile_service_1 = __importDefault(require("./user-profile.service"));
exports.UserProfileService = user_profile_service_1["default"];
/**
 * 导出所有用户服务
 * @description 随着服务实现，将依次取消注释
 */
exports["default"] = {
    UserService: user_service_1["default"],
    UserProfileService: user_profile_service_1["default"]
};
/**
 * 开发计划:
 * 1. 用户管理服务 (user.service.ts) ✓
 * 2. 用户资料服务 (user-profile.service.ts) ✓
 * 3. 用户日志服务 (user-log.service.ts)
 * 4. 用户设置服务 (user-settings.service.ts)
 * 5. 用户通知服务 (user-notification.service.ts)
 */ 
