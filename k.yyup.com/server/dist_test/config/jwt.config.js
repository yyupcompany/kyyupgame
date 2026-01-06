"use strict";
/**
 * JWT配置文件
 * 集中管理所有JWT相关配置
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.TOKEN_TYPES = exports.TOKEN_EXPIRE = exports.getDynamicTokenExpire = exports.REFRESH_TOKEN_EXPIRE = exports.DEFAULT_TOKEN_EXPIRE = exports.JWT_SECRET = void 0;
// JWT密钥 - 从环境变量获取，如果未设置则使用默认值
exports.JWT_SECRET = process.env.JWT_SECRET || 'kindergarten-enrollment-secret';
// 默认令牌过期时间 - 统一设置为24小时
exports.DEFAULT_TOKEN_EXPIRE = '24h'; // 开发环境和生产环境都使用24小时
exports.REFRESH_TOKEN_EXPIRE = '30d'; // 刷新令牌有效期30天
/**
 * 获取动态会话超时时间
 * @returns 会话超时时间字符串（如 "24h"）
 */
function getDynamicTokenExpire() {
    return __awaiter(this, void 0, void 0, function () {
        var getSystemSetting, sessionTimeout, hours, error_1, timeout, hours;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../scripts/init-system-settings')); })];
                case 1:
                    getSystemSetting = (_a.sent()).getSystemSetting;
                    return [4 /*yield*/, getSystemSetting('security', 'sessionTimeout')];
                case 2:
                    sessionTimeout = _a.sent();
                    if (sessionTimeout && typeof sessionTimeout === 'number' && sessionTimeout > 0) {
                        hours = Math.round(sessionTimeout / 60);
                        console.log("\uD83D\uDD50 \u4F7F\u7528\u6570\u636E\u5E93\u4E2D\u7684\u4F1A\u8BDD\u8D85\u65F6\u8BBE\u7F6E: ".concat(sessionTimeout, " \u5206\u949F (").concat(hours, " \u5C0F\u65F6)"));
                        return [2 /*return*/, "".concat(hours, "h")]; // 转换为小时格式
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.warn('获取动态会话超时设置失败，使用默认值:', error_1);
                    return [3 /*break*/, 4];
                case 4:
                    // 检查全局变量
                    if (typeof global !== 'undefined' && global.sessionTimeoutMinutes) {
                        timeout = global.sessionTimeoutMinutes;
                        hours = Math.round(timeout / 60);
                        console.log("\uD83D\uDD50 \u4F7F\u7528\u5168\u5C40\u53D8\u91CF\u4E2D\u7684\u4F1A\u8BDD\u8D85\u65F6\u8BBE\u7F6E: ".concat(timeout, " \u5206\u949F (").concat(hours, " \u5C0F\u65F6)"));
                        return [2 /*return*/, "".concat(hours, "h")]; // 转换为小时格式
                    }
                    // 返回默认值
                    console.log('🕐 使用默认会话超时设置: 24小时');
                    return [2 /*return*/, exports.DEFAULT_TOKEN_EXPIRE];
            }
        });
    });
}
exports.getDynamicTokenExpire = getDynamicTokenExpire;
// 动态令牌过期时间（保持向后兼容）
exports.TOKEN_EXPIRE = exports.DEFAULT_TOKEN_EXPIRE;
// 令牌类型
exports.TOKEN_TYPES = {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'reset-password'
};
exports["default"] = {
    JWT_SECRET: exports.JWT_SECRET,
    TOKEN_EXPIRE: exports.TOKEN_EXPIRE,
    REFRESH_TOKEN_EXPIRE: exports.REFRESH_TOKEN_EXPIRE,
    TOKEN_TYPES: exports.TOKEN_TYPES
};
