"use strict";
/**
 * 调试日志中间件
 * 用于记录API请求和令牌信息，帮助诊断问题
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.apiDebugLogger = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var jwt_config_1 = require("../config/jwt.config");
/**
 * API请求调试日志中间件
 */
var apiDebugLogger = function (req, res, next) {
    // 记录请求信息
    console.log("[API\u8C03\u8BD5] ".concat(new Date().toISOString(), " - ").concat(req.method, " ").concat(req.url));
    // 记录请求头
    console.log('[API调试] 请求头:', JSON.stringify({
        'content-type': req.headers['content-type'],
        'authorization': req.headers.authorization ? '**存在**' : '**不存在**'
    }));
    // 如果有认证令牌，记录令牌信息（不包含具体令牌内容）
    var authHeader = req.headers.authorization;
    if (authHeader) {
        var token = authHeader.split(' ')[1];
        if (token) {
            try {
                // 解析令牌但不验证签名，只是为了查看内容
                var decodedToken = jsonwebtoken_1["default"].decode(token);
                if (decodedToken) {
                    var expDate = decodedToken.exp
                        ? new Date(decodedToken.exp * 1000).toISOString()
                        : null;
                    console.log('[API调试] 令牌负载:', JSON.stringify({
                        userId: decodedToken.userId,
                        username: decodedToken.username,
                        type: decodedToken.type,
                        exp: expDate
                    }));
                }
                // 尝试验证令牌，看是否有效
                try {
                    jsonwebtoken_1["default"].verify(token, jwt_config_1.JWT_SECRET);
                    console.log('[API调试] 令牌验证: 有效');
                }
                catch (error) {
                    console.log('[API调试] 令牌验证: 无效', error.message || '未知错误');
                }
            }
            catch (error) {
                console.log('[API调试] 无法解析令牌:', error.message || '未知错误');
            }
        }
    }
    // 继续处理请求
    next();
};
exports.apiDebugLogger = apiDebugLogger;
exports["default"] = exports.apiDebugLogger;
