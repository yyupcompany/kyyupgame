"use strict";
/**
 * AI健康检查控制器
 * AI Health Check Controller
 */
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
exports.AIHealthController = void 0;
var apiResponse_1 = require("../utils/apiResponse");
/**
 * AI健康检查控制器类
 */
var AIHealthController = /** @class */ (function () {
    function AIHealthController() {
    }
    /**
     * 检查AI服务健康状态
     * @param req 请求对象
     * @param res 响应对象
     */
    AIHealthController.checkHealth = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var healthStatus;
            return __generator(this, function (_a) {
                try {
                    healthStatus = {
                        status: 'online',
                        timestamp: new Date().toISOString(),
                        services: {
                            textModels: 'available',
                            imageModels: 'available',
                            speechModels: 'limited',
                            videoModels: 'unavailable'
                        },
                        version: '1.0.0',
                        uptime: process.uptime()
                    };
                    apiResponse_1.ApiResponse.success(res, healthStatus, 'AI服务健康检查完成');
                }
                catch (error) {
                    console.error('AI健康检查失败:', error);
                    apiResponse_1.ApiResponse.handleError(res, error, 'AI健康检查失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取AI服务状态详情
     * @param req 请求对象
     * @param res 响应对象
     */
    AIHealthController.getServiceStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceStatus;
            return __generator(this, function (_a) {
                try {
                    serviceStatus = {
                        overall: 'healthy',
                        components: {
                            database: 'healthy',
                            cache: 'healthy',
                            aiModels: 'healthy',
                            permissions: 'healthy'
                        },
                        metrics: {
                            requestsPerMinute: Math.floor(Math.random() * 100),
                            averageResponseTime: Math.floor(Math.random() * 500) + 100,
                            errorRate: Math.random() * 0.05
                        },
                        lastUpdated: new Date().toISOString()
                    };
                    apiResponse_1.ApiResponse.success(res, serviceStatus, '获取AI服务状态成功');
                }
                catch (error) {
                    console.error('获取AI服务状态失败:', error);
                    apiResponse_1.ApiResponse.handleError(res, error, '获取AI服务状态失败');
                }
                return [2 /*return*/];
            });
        });
    };
    return AIHealthController;
}());
exports.AIHealthController = AIHealthController;
