"use strict";
/**
 * 用户认证服务层索引文件
 * 用于导出所有认证相关服务
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.AuthService = void 0;
// 导入实现的服务实例
var auth_service_1 = __importDefault(require("./auth.service"));
exports.AuthService = auth_service_1["default"];
/**
 * 导出所有认证服务
 * @description 随着服务实现，将依次取消注释
 */
exports["default"] = {
    AuthService: auth_service_1["default"]
};
/**
 * 开发计划:
 * 1. 认证服务 (auth.service.ts) ✓
 * 2. OAuth认证服务 (oauth.service.ts)
 * 3. 多因素认证服务 (mfa.service.ts)
 * 4. JWT令牌服务 (jwt.service.ts)
 * 5. 令牌黑名单服务 (token-blacklist.service.ts)
 */ 
