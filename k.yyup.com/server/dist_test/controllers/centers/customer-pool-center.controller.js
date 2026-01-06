"use strict";
/**
 * 客户池中心聚合API控制器
 * 提供客户池中心首页所需的所有数据，减少并发API请求提升性能
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
exports.CustomerPoolCenterController = void 0;
var apiResponse_1 = require("../../utils/apiResponse");
var init_1 = require("../../init");
var sequelize_1 = require("sequelize");
var logger_1 = require("../../utils/logger");
var CustomerPoolCenterController = /** @class */ (function () {
    function CustomerPoolCenterController() {
    }
    /**
     * 客户池中心仪表板聚合API
     * 一次请求获取客户池中心首页所有数据
     */
    CustomerPoolCenterController.getDashboard = function (req, res) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var startTime, userId, userRole, _d, poolStatistics, customerPools, recentCustomers, conversionAnalysis, channelAnalysis, responseTime, error_1, responseTime;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        startTime = Date.now();
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                        console.log('🏊 获取客户池中心仪表板数据', { userId: userId, userRole: userRole });
                        return [4 /*yield*/, Promise.all([
                                // 1. 客户池统计数据
                                CustomerPoolCenterController.getPoolStatistics(),
                                // 2. 客户池列表数据
                                CustomerPoolCenterController.getCustomerPools(),
                                // 3. 最近客户数据
                                CustomerPoolCenterController.getRecentCustomers(),
                                // 4. 转化分析数据
                                CustomerPoolCenterController.getConversionAnalysis(),
                                // 5. 渠道分析数据
                                CustomerPoolCenterController.getChannelAnalysis()
                            ])];
                    case 2:
                        _d = _e.sent(), poolStatistics = _d[0], customerPools = _d[1], recentCustomers = _d[2], conversionAnalysis = _d[3], channelAnalysis = _d[4];
                        responseTime = Date.now() - startTime;
                        console.log("\u2705 \u5BA2\u6237\u6C60\u4E2D\u5FC3\u4EEA\u8868\u677F\u6570\u636E\u83B7\u53D6\u5B8C\u6210\uFF0C\u8017\u65F6: ".concat(responseTime, "ms"));
                        // 返回聚合数据
                        apiResponse_1.ApiResponse.success(res, {
                            poolStatistics: poolStatistics,
                            customerPools: customerPools,
                            recentCustomers: recentCustomers,
                            conversionAnalysis: conversionAnalysis,
                            channelAnalysis: channelAnalysis,
                            meta: {
                                userId: userId,
                                userRole: userRole,
                                responseTime: responseTime,
                                dataCount: {
                                    pools: ((_c = customerPools === null || customerPools === void 0 ? void 0 : customerPools.data) === null || _c === void 0 ? void 0 : _c.length) || 0,
                                    customers: (recentCustomers === null || recentCustomers === void 0 ? void 0 : recentCustomers.length) || 0,
                                    channels: (channelAnalysis === null || channelAnalysis === void 0 ? void 0 : channelAnalysis.length) || 0
                                }
                            }
                        }, '客户池中心仪表板数据获取成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _e.sent();
                        responseTime = Date.now() - startTime;
                        console.error('❌ 客户池中心仪表板数据获取失败:', error_1);
                        logger_1.logger.error('客户池中心仪表板数据获取失败', { error: error_1, responseTime: responseTime });
                        apiResponse_1.ApiResponse.handleError(res, error_1, '客户池中心仪表板数据获取失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取客户池统计数据
     */
    CustomerPoolCenterController.getPoolStatistics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalCustomers, activeCustomers, potentialCustomers, convertedCustomers, conversionRate, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(*) as total FROM customers WHERE deleted_at IS NULL\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        totalCustomers = (_a.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(*) as total FROM customers \n        WHERE deleted_at IS NULL AND status = 'active'\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 2:
                        activeCustomers = (_a.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(*) as total FROM customers \n        WHERE deleted_at IS NULL AND status = 'potential'\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 3:
                        potentialCustomers = (_a.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(*) as total FROM customers \n        WHERE deleted_at IS NULL AND status = 'converted'\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 4:
                        convertedCustomers = (_a.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          ROUND(\n            COUNT(CASE WHEN status = 'converted' THEN 1 END) * 100.0 / \n            NULLIF(COUNT(*), 0), 2\n          ) as rate\n        FROM customers WHERE deleted_at IS NULL\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 5:
                        conversionRate = (_a.sent())[0];
                        return [2 /*return*/, {
                                totalCustomers: (totalCustomers === null || totalCustomers === void 0 ? void 0 : totalCustomers.total) || 0,
                                activeCustomers: (activeCustomers === null || activeCustomers === void 0 ? void 0 : activeCustomers.total) || 0,
                                potentialCustomers: (potentialCustomers === null || potentialCustomers === void 0 ? void 0 : potentialCustomers.total) || 0,
                                convertedCustomers: (convertedCustomers === null || convertedCustomers === void 0 ? void 0 : convertedCustomers.total) || 0,
                                conversionRate: (conversionRate === null || conversionRate === void 0 ? void 0 : conversionRate.rate) || 0
                            }];
                    case 6:
                        error_2 = _a.sent();
                        console.warn('⚠️ 客户池统计数据查询失败，使用默认值:', error_2);
                        return [2 /*return*/, {
                                totalCustomers: 0,
                                activeCustomers: 0,
                                potentialCustomers: 0,
                                convertedCustomers: 0,
                                conversionRate: 0
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取客户池列表数据
     */
    CustomerPoolCenterController.getCustomerPools = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pools, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          cp.id, cp.name, cp.description, cp.status,\n          cp.created_at, cp.updated_at,\n          COUNT(c.id) as customer_count\n        FROM customer_pools cp\n        LEFT JOIN customers c ON cp.id = c.pool_id AND c.deleted_at IS NULL\n        WHERE cp.deleted_at IS NULL\n        GROUP BY cp.id, cp.name, cp.description, cp.status, cp.created_at, cp.updated_at\n        ORDER BY cp.created_at DESC\n        LIMIT 10\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        pools = _a.sent();
                        return [2 /*return*/, {
                                data: pools || [],
                                pagination: {
                                    page: 1,
                                    pageSize: 10,
                                    total: (pools === null || pools === void 0 ? void 0 : pools.length) || 0
                                }
                            }];
                    case 2:
                        error_3 = _a.sent();
                        console.warn('⚠️ 客户池列表数据查询失败:', error_3);
                        return [2 /*return*/, { data: [], pagination: { page: 1, pageSize: 10, total: 0 } }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取最近客户数据
     */
    CustomerPoolCenterController.getRecentCustomers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var customers, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          c.id, c.name, c.phone, c.email, c.status,\n          c.source, c.created_at, c.updated_at,\n          cp.name as pool_name\n        FROM customers c\n        LEFT JOIN customer_pools cp ON c.pool_id = cp.id\n        WHERE c.deleted_at IS NULL\n        ORDER BY c.created_at DESC\n        LIMIT 10\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        customers = _a.sent();
                        return [2 /*return*/, customers || []];
                    case 2:
                        error_4 = _a.sent();
                        console.warn('⚠️ 最近客户数据查询失败:', error_4);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取转化分析数据
     */
    CustomerPoolCenterController.getConversionAnalysis = function () {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          status,\n          COUNT(*) as count,\n          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage\n        FROM customers \n        WHERE deleted_at IS NULL\n        GROUP BY status\n        ORDER BY count DESC\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        analysis = _a.sent();
                        return [2 /*return*/, analysis || []];
                    case 2:
                        error_5 = _a.sent();
                        console.warn('⚠️ 转化分析数据查询失败:', error_5);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取渠道分析数据
     */
    CustomerPoolCenterController.getChannelAnalysis = function () {
        return __awaiter(this, void 0, void 0, function () {
            var channels, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          source as channel,\n          COUNT(*) as customer_count,\n          COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_count,\n          ROUND(\n            COUNT(CASE WHEN status = 'converted' THEN 1 END) * 100.0 / \n            NULLIF(COUNT(*), 0), 2\n          ) as conversion_rate\n        FROM customers \n        WHERE deleted_at IS NULL AND source IS NOT NULL\n        GROUP BY source\n        ORDER BY customer_count DESC\n        LIMIT 10\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        channels = _a.sent();
                        return [2 /*return*/, channels || []];
                    case 2:
                        error_6 = _a.sent();
                        console.warn('⚠️ 渠道分析数据查询失败:', error_6);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CustomerPoolCenterController;
}());
exports.CustomerPoolCenterController = CustomerPoolCenterController;
