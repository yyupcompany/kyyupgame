"use strict";
/**
 * 系统管理模块类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = void 0;
// 用户状态枚举
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["LOCKED"] = "LOCKED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
