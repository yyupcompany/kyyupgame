"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.AIQueryCacheService = void 0;
var crypto_1 = __importDefault(require("crypto"));
var AIQueryHistory_1 = __importDefault(require("../models/AIQueryHistory"));
var sequelize_1 = require("sequelize");
/**
 * AI查询缓存服务
 * 实现1小时内重复查询的缓存机制
 */
var AIQueryCacheService = /** @class */ (function () {
    function AIQueryCacheService() {
        this.CACHE_DURATION = 60 * 60 * 1000; // 1小时缓存时间
    }
    AIQueryCacheService.getInstance = function () {
        if (!AIQueryCacheService.instance) {
            AIQueryCacheService.instance = new AIQueryCacheService();
        }
        return AIQueryCacheService.instance;
    };
    /**
     * 生成查询内容的哈希值
     */
    AIQueryCacheService.prototype.generateQueryHash = function (queryText, userId) {
        var content = "".concat(userId, ":").concat(queryText.trim().toLowerCase());
        return crypto_1["default"].createHash('md5').update(content, 'utf8').digest('hex');
    };
    /**
     * 检查是否有1小时内的缓存记录
     */
    AIQueryCacheService.prototype.getCachedResult = function (queryText, userId) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var queryHash, oneHourAgo, cachedRecord, error_1;
            var _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 2, , 3]);
                        queryHash = this.generateQueryHash(queryText, userId);
                        oneHourAgo = new Date(Date.now() - this.CACHE_DURATION);
                        console.log("\uD83D\uDD0D \u68C0\u67E5\u7F13\u5B58: \u7528\u6237".concat(userId, ", \u54C8\u5E0C").concat(queryHash.substring(0, 8), "..."));
                        return [4 /*yield*/, AIQueryHistory_1["default"].findOne({
                                where: {
                                    userId: userId,
                                    queryHash: queryHash,
                                    createdAt: (_g = {},
                                        _g[sequelize_1.Op.gte] = oneHourAgo,
                                        _g)
                                },
                                order: [['createdAt', 'DESC']]
                            })];
                    case 1:
                        cachedRecord = _h.sent();
                        if (cachedRecord) {
                            console.log("\u2705 \u547D\u4E2D\u7F13\u5B58: ".concat(cachedRecord.queryType, ", \u521B\u5EFA\u65F6\u95F4").concat(cachedRecord.createdAt));
                            // 构造缓存响应
                            if (cachedRecord.queryType === 'data_query') {
                                return [2 /*return*/, {
                                        success: true,
                                        type: 'data_query',
                                        data: ((_a = cachedRecord.responseData) === null || _a === void 0 ? void 0 : _a.data) || [],
                                        metadata: {
                                            totalRows: ((_c = (_b = cachedRecord.responseData) === null || _b === void 0 ? void 0 : _b.metadata) === null || _c === void 0 ? void 0 : _c.totalRows) || 0,
                                            executionTime: cachedRecord.executionTime || 0,
                                            generatedSQL: cachedRecord.generatedSQL,
                                            usedModel: cachedRecord.modelUsed,
                                            cacheHit: true,
                                            cachedAt: cachedRecord.createdAt,
                                            columns: ((_e = (_d = cachedRecord.responseData) === null || _d === void 0 ? void 0 : _d.metadata) === null || _e === void 0 ? void 0 : _e.columns) || []
                                        },
                                        visualization: (_f = cachedRecord.responseData) === null || _f === void 0 ? void 0 : _f.visualization,
                                        sessionId: cachedRecord.sessionId,
                                        queryLogId: cachedRecord.id
                                    }];
                            }
                            else {
                                return [2 /*return*/, {
                                        type: 'ai_response',
                                        response: cachedRecord.responseText,
                                        isDataQuery: false,
                                        sessionId: cachedRecord.sessionId,
                                        cacheHit: true,
                                        cachedAt: cachedRecord.createdAt
                                    }];
                            }
                        }
                        console.log("\u274C \u672A\u547D\u4E2D\u7F13\u5B58: 1\u5C0F\u65F6\u5185\u65E0\u76F8\u540C\u67E5\u8BE2\u8BB0\u5F55");
                        return [2 /*return*/, null];
                    case 2:
                        error_1 = _h.sent();
                        console.error('❌ 缓存检查失败:', error_1);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 保存查询结果到历史记录
     */
    AIQueryCacheService.prototype.saveQueryResult = function (queryText, userId, queryType, result, sessionId, modelUsed, executionTime) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var queryHash, historyData, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        queryHash = this.generateQueryHash(queryText, userId);
                        console.log("\uD83D\uDCBE \u4FDD\u5B58\u67E5\u8BE2\u8BB0\u5F55: \u7528\u6237".concat(userId, ", \u7C7B\u578B").concat(queryType, ", \u54C8\u5E0C").concat(queryHash.substring(0, 8), "..."));
                        historyData = {
                            userId: userId,
                            queryText: queryText,
                            queryHash: queryHash,
                            queryType: queryType,
                            sessionId: sessionId,
                            modelUsed: modelUsed,
                            executionTime: executionTime,
                            cacheHit: false
                        };
                        if (queryType === 'data_query') {
                            historyData.responseData = {
                                data: result.data,
                                metadata: result.metadata,
                                visualization: result.visualization
                            };
                            historyData.generatedSQL = (_a = result.metadata) === null || _a === void 0 ? void 0 : _a.generatedSQL;
                        }
                        else {
                            historyData.responseText = result.response;
                        }
                        return [4 /*yield*/, AIQueryHistory_1["default"].create(historyData)];
                    case 1:
                        _b.sent();
                        console.log("\u2705 \u67E5\u8BE2\u8BB0\u5F55\u4FDD\u5B58\u6210\u529F");
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        console.error('❌ 保存查询记录失败:', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户的查询历史记录
     */
    AIQueryCacheService.prototype.getUserQueryHistory = function (userId, page, pageSize, queryType) {
        if (page === void 0) { page = 1; }
        if (pageSize === void 0) { pageSize = 20; }
        return __awaiter(this, void 0, void 0, function () {
            var offset, whereCondition, _a, count, rows, totalPages, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        offset = (page - 1) * pageSize;
                        whereCondition = { userId: userId };
                        if (queryType) {
                            whereCondition.queryType = queryType;
                        }
                        return [4 /*yield*/, AIQueryHistory_1["default"].findAndCountAll({
                                where: whereCondition,
                                order: [['createdAt', 'DESC']],
                                limit: pageSize,
                                offset: offset,
                                attributes: [
                                    'id',
                                    'queryText',
                                    'queryType',
                                    'generatedSQL',
                                    'executionTime',
                                    'modelUsed',
                                    'sessionId',
                                    'cacheHit',
                                    'createdAt'
                                ]
                            })];
                    case 1:
                        _a = _b.sent(), count = _a.count, rows = _a.rows;
                        totalPages = Math.ceil(count / pageSize);
                        return [2 /*return*/, {
                                data: rows.map(function (row) { return ({
                                    id: row.id,
                                    naturalQuery: row.queryText,
                                    queryType: row.queryType,
                                    generatedSQL: row.generatedSQL,
                                    executionTime: row.executionTime,
                                    modelUsed: row.modelUsed,
                                    sessionId: row.sessionId,
                                    cacheHit: row.cacheHit,
                                    createdAt: row.createdAt,
                                    // 为了兼容前端接口
                                    executionStatus: 'success',
                                    resultCount: row.queryType === 'data_query' ? 1 : 0
                                }); }),
                                total: count,
                                page: page,
                                pageSize: pageSize,
                                totalPages: totalPages
                            }];
                    case 2:
                        error_3 = _b.sent();
                        console.error('❌ 获取查询历史失败:', error_3);
                        return [2 /*return*/, {
                                data: [],
                                total: 0,
                                page: page,
                                pageSize: pageSize,
                                totalPages: 0
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取查询详情
     */
    AIQueryCacheService.prototype.getQueryDetail = function (queryId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var record, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, AIQueryHistory_1["default"].findOne({
                                where: {
                                    id: queryId,
                                    userId: userId
                                }
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                id: record.id,
                                naturalQuery: record.queryText,
                                queryType: record.queryType,
                                responseData: record.responseData,
                                responseText: record.responseText,
                                generatedSQL: record.generatedSQL,
                                executionTime: record.executionTime,
                                modelUsed: record.modelUsed,
                                sessionId: record.sessionId,
                                cacheHit: record.cacheHit,
                                createdAt: record.createdAt,
                                updatedAt: record.updatedAt
                            }];
                    case 2:
                        error_4 = _a.sent();
                        console.error('❌ 获取查询详情失败:', error_4);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清理过期的缓存记录（可以定期调用）
     */
    AIQueryCacheService.prototype.cleanupExpiredCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sevenDaysAgo, deletedCount, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, AIQueryHistory_1["default"].destroy({
                                where: {
                                    createdAt: (_a = {},
                                        _a[sequelize_1.Op.lt] = sevenDaysAgo,
                                        _a)
                                }
                            })];
                    case 1:
                        deletedCount = _b.sent();
                        console.log("\uD83E\uDDF9 \u6E05\u7406\u8FC7\u671F\u7F13\u5B58\u8BB0\u5F55: ".concat(deletedCount, " \u6761"));
                        return [2 /*return*/, deletedCount];
                    case 2:
                        error_5 = _b.sent();
                        console.error('❌ 清理缓存失败:', error_5);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取缓存统计信息
     */
    AIQueryCacheService.prototype.getCacheStats = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var whereCondition, oneHourAgo, _a, totalCount, recentCount, cacheHitCount, error_6;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        whereCondition = userId ? { userId: userId } : {};
                        oneHourAgo = new Date(Date.now() - this.CACHE_DURATION);
                        return [4 /*yield*/, Promise.all([
                                AIQueryHistory_1["default"].count({ where: whereCondition }),
                                AIQueryHistory_1["default"].count({
                                    where: __assign(__assign({}, whereCondition), { createdAt: (_b = {}, _b[sequelize_1.Op.gte] = oneHourAgo, _b) })
                                }),
                                AIQueryHistory_1["default"].count({
                                    where: __assign(__assign({}, whereCondition), { cacheHit: true })
                                })
                            ])];
                    case 1:
                        _a = _c.sent(), totalCount = _a[0], recentCount = _a[1], cacheHitCount = _a[2];
                        return [2 /*return*/, {
                                totalQueries: totalCount,
                                recentQueries: recentCount,
                                cacheHits: cacheHitCount,
                                cacheHitRate: totalCount > 0 ? ((cacheHitCount / totalCount) * 100).toFixed(2) + '%' : '0%'
                            }];
                    case 2:
                        error_6 = _c.sent();
                        console.error('❌ 获取缓存统计失败:', error_6);
                        return [2 /*return*/, {
                                totalQueries: 0,
                                recentQueries: 0,
                                cacheHits: 0,
                                cacheHitRate: '0%'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AIQueryCacheService;
}());
exports.AIQueryCacheService = AIQueryCacheService;
exports["default"] = AIQueryCacheService.getInstance();
