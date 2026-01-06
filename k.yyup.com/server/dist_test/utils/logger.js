"use strict";
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
exports.logger = void 0;
/**
 * 日志工具
 * 提供统一的日志记录接口，支持控制台和文件日志
 */
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var date_fns_1 = require("date-fns");
// 创建日志目录
var LOG_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}
// 获取当前日期格式化字符串
var getCurrentDate = function () { return (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd'); };
// 错误日志文件路径
var ERROR_LOG_FILE = path.join(LOG_DIR, "error-".concat(getCurrentDate(), ".log"));
// 访问日志文件路径
var ACCESS_LOG_FILE = path.join(LOG_DIR, "access-".concat(getCurrentDate(), ".log"));
/**
 * 将日志写入文件
 * @param filePath 文件路径
 * @param message 日志消息
 */
var writeLog = function (filePath, message) {
    var timestamp = (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd HH:mm:ss');
    var logEntry = "[".concat(timestamp, "] ").concat(message, "\n");
    fs.appendFile(filePath, logEntry, function (err) {
        if (err) {
            console.error("\u5199\u5165\u65E5\u5FD7\u6587\u4EF6\u5931\u8D25: ".concat(err.message));
        }
    });
};
// 增强的日志记录器实现
exports.logger = {
    /**
     * 记录信息日志
     * @param message 日志消息
     * @param data 附加数据
     */
    info: function (message, data) {
        var logMessage = "[INFO] ".concat(message).concat(data ? ' ' + JSON.stringify(data) : '');
        console.log(logMessage);
        writeLog(ACCESS_LOG_FILE, logMessage);
    },
    /**
     * 记录警告日志
     * @param message 日志消息
     * @param data 附加数据
     */
    warn: function (message, data) {
        var logMessage = "[WARN] ".concat(message).concat(data ? ' ' + JSON.stringify(data) : '');
        console.warn(logMessage);
        writeLog(ACCESS_LOG_FILE, logMessage);
    },
    /**
     * 记录错误日志
     * @param message 日志消息
     * @param error 错误对象
     */
    error: function (message, error) {
        var errorDetails = '';
        if (error) {
            if (error instanceof Error) {
                errorDetails = "".concat(error.name, ": ").concat(error.message, "\nStack: ").concat(error.stack);
            }
            else {
                errorDetails = JSON.stringify(error);
            }
        }
        var logMessage = "[ERROR] ".concat(message).concat(errorDetails ? '\n' + errorDetails : '');
        console.error(logMessage);
        writeLog(ERROR_LOG_FILE, logMessage);
    },
    /**
     * 记录调试日志
     * @param message 日志消息
     * @param data 附加数据
     */
    debug: function (message, data) {
        if (process.env.NODE_ENV !== 'production') {
            var logMessage = "[DEBUG] ".concat(message).concat(data ? ' ' + JSON.stringify(data) : '');
            console.debug(logMessage);
            writeLog(ACCESS_LOG_FILE, logMessage);
        }
    },
    /**
     * 记录API请求日志
     * @param req 请求对象
     * @param res 响应对象
     * @param duration 请求处理时间(ms)
     */
    api: function (req, res, duration) {
        var method = req.method, originalUrl = req.originalUrl, ip = req.ip, headers = req.headers;
        var userAgent = headers['user-agent'] || 'Unknown';
        var statusCode = res.statusCode;
        var logMessage = "[API] ".concat(method, " ").concat(originalUrl, " - ").concat(statusCode, " - ").concat(duration, "ms - ").concat(ip, " - ").concat(userAgent);
        console.log(logMessage);
        writeLog(ACCESS_LOG_FILE, logMessage);
    },
    /**
     * 获取当前的错误日志文件路径
     * @returns 错误日志文件路径
     */
    getErrorLogFilePath: function () {
        return ERROR_LOG_FILE;
    },
    /**
     * 获取当前的访问日志文件路径
     * @returns 访问日志文件路径
     */
    getAccessLogFilePath: function () {
        return ACCESS_LOG_FILE;
    }
};
exports["default"] = exports.logger;
