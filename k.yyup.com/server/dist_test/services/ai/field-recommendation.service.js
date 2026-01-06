"use strict";
/**
 * 字段推荐服务
 * 基于历史数据分析，为用户提供智能字段值推荐
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
exports.fieldRecommendationService = void 0;
var sequelize_1 = require("sequelize");
var models_1 = require("../../models");
var FieldRecommendationService = /** @class */ (function () {
    function FieldRecommendationService() {
    }
    /**
     * 获取字段推荐值
     * @param entityType 实体类型（如 'classes', 'students'）
     * @param fieldName 字段名称
     * @param limit 推荐数量限制（默认3个）
     * @param lookbackDays 回溯天数（默认30天）
     */
    FieldRecommendationService.prototype.getFieldRecommendations = function (entityType, fieldName, limit, lookbackDays) {
        if (limit === void 0) { limit = 3; }
        if (lookbackDays === void 0) { lookbackDays = 30; }
        return __awaiter(this, void 0, void 0, function () {
            var model, lookbackDate, records_1, frequencyMap_1, recommendations, error_1;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        model = this.getModel(entityType);
                        if (!model) {
                            console.warn("\u26A0\uFE0F [\u5B57\u6BB5\u63A8\u8350] \u672A\u627E\u5230\u5B9E\u4F53\u6A21\u578B: ".concat(entityType));
                            return [2 /*return*/, {
                                    field: fieldName,
                                    recommendations: [],
                                    totalRecords: 0
                                }];
                        }
                        lookbackDate = new Date();
                        lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);
                        return [4 /*yield*/, model.findAll({
                                attributes: [fieldName, 'created_at'],
                                where: (_a = {},
                                    _a[fieldName] = (_b = {},
                                        _b[sequelize_1.Op.ne] = null,
                                        _b),
                                    _a.created_at = (_c = {},
                                        _c[sequelize_1.Op.gte] = lookbackDate,
                                        _c),
                                    _a),
                                order: [['created_at', 'DESC']],
                                limit: 1000,
                                raw: true
                            })];
                    case 1:
                        records_1 = _d.sent();
                        if (records_1.length === 0) {
                            console.log("\u2139\uFE0F [\u5B57\u6BB5\u63A8\u8350] ".concat(entityType, ".").concat(fieldName, " \u65E0\u5386\u53F2\u6570\u636E"));
                            return [2 /*return*/, {
                                    field: fieldName,
                                    recommendations: [],
                                    totalRecords: 0
                                }];
                        }
                        frequencyMap_1 = new Map();
                        records_1.forEach(function (record) {
                            var value = record[fieldName];
                            if (value !== null && value !== undefined && value !== '') {
                                var existing = frequencyMap_1.get(value);
                                if (existing) {
                                    existing.count++;
                                    // 更新最后使用时间（取最新的）
                                    if (record.created_at > existing.lastUsed) {
                                        existing.lastUsed = record.created_at;
                                    }
                                }
                                else {
                                    frequencyMap_1.set(value, {
                                        count: 1,
                                        lastUsed: record.created_at
                                    });
                                }
                            }
                        });
                        recommendations = Array.from(frequencyMap_1.entries())
                            .map(function (_a) {
                            var value = _a[0], stats = _a[1];
                            return ({
                                value: value,
                                frequency: stats.count,
                                percentage: Math.round((stats.count / records_1.length) * 100),
                                lastUsed: stats.lastUsed
                            });
                        })
                            .sort(function (a, b) {
                            // 首先按频率排序
                            if (b.frequency !== a.frequency) {
                                return b.frequency - a.frequency;
                            }
                            // 频率相同时，按最后使用时间排序
                            return b.lastUsed.getTime() - a.lastUsed.getTime();
                        })
                            .slice(0, limit);
                        console.log("\u2705 [\u5B57\u6BB5\u63A8\u8350] ".concat(entityType, ".").concat(fieldName, " \u63A8\u8350: ").concat(recommendations.length, "\u4E2A"));
                        console.log("\uD83D\uDCCA [\u5B57\u6BB5\u63A8\u8350] Top\u63A8\u8350: ".concat(recommendations.map(function (r) { return "".concat(r.value, "(").concat(r.percentage, "%)"); }).join(', ')));
                        return [2 /*return*/, {
                                field: fieldName,
                                recommendations: recommendations,
                                totalRecords: records_1.length
                            }];
                    case 2:
                        error_1 = _d.sent();
                        console.error("\u274C [\u5B57\u6BB5\u63A8\u8350] \u83B7\u53D6\u63A8\u8350\u5931\u8D25:", error_1);
                        return [2 /*return*/, {
                                field: fieldName,
                                recommendations: [],
                                totalRecords: 0
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量获取多个字段的推荐值
     */
    FieldRecommendationService.prototype.getBatchFieldRecommendations = function (entityType, fieldNames, limit, lookbackDays) {
        if (limit === void 0) { limit = 3; }
        if (lookbackDays === void 0) { lookbackDays = 30; }
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, fieldNames_1, fieldName, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        results = {};
                        _i = 0, fieldNames_1 = fieldNames;
                        _c.label = 1;
                    case 1:
                        if (!(_i < fieldNames_1.length)) return [3 /*break*/, 4];
                        fieldName = fieldNames_1[_i];
                        _a = results;
                        _b = fieldName;
                        return [4 /*yield*/, this.getFieldRecommendations(entityType, fieldName, limit, lookbackDays)];
                    case 2:
                        _a[_b] = _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * 获取用户个人的字段使用偏好
     * @param entityType 实体类型
     * @param fieldName 字段名称
     * @param userId 用户ID
     * @param limit 推荐数量限制
     */
    FieldRecommendationService.prototype.getUserFieldPreferences = function (entityType, fieldName, userId, limit) {
        if (limit === void 0) { limit = 3; }
        return __awaiter(this, void 0, void 0, function () {
            var model, records_2, frequencyMap_2, recommendations, error_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        model = this.getModel(entityType);
                        if (!model) {
                            return [2 /*return*/, {
                                    field: fieldName,
                                    recommendations: [],
                                    totalRecords: 0
                                }];
                        }
                        return [4 /*yield*/, model.findAll({
                                attributes: [fieldName, 'created_at'],
                                where: (_a = {},
                                    _a[fieldName] = (_b = {},
                                        _b[sequelize_1.Op.ne] = null,
                                        _b),
                                    _a.created_by = userId,
                                    _a),
                                order: [['created_at', 'DESC']],
                                limit: 500,
                                raw: true
                            })];
                    case 1:
                        records_2 = _c.sent();
                        if (records_2.length === 0) {
                            return [2 /*return*/, {
                                    field: fieldName,
                                    recommendations: [],
                                    totalRecords: 0
                                }];
                        }
                        frequencyMap_2 = new Map();
                        records_2.forEach(function (record) {
                            var value = record[fieldName];
                            if (value !== null && value !== undefined && value !== '') {
                                var existing = frequencyMap_2.get(value);
                                if (existing) {
                                    existing.count++;
                                    if (record.created_at > existing.lastUsed) {
                                        existing.lastUsed = record.created_at;
                                    }
                                }
                                else {
                                    frequencyMap_2.set(value, {
                                        count: 1,
                                        lastUsed: record.created_at
                                    });
                                }
                            }
                        });
                        recommendations = Array.from(frequencyMap_2.entries())
                            .map(function (_a) {
                            var value = _a[0], stats = _a[1];
                            return ({
                                value: value,
                                frequency: stats.count,
                                percentage: Math.round((stats.count / records_2.length) * 100),
                                lastUsed: stats.lastUsed
                            });
                        })
                            .sort(function (a, b) {
                            if (b.frequency !== a.frequency) {
                                return b.frequency - a.frequency;
                            }
                            return b.lastUsed.getTime() - a.lastUsed.getTime();
                        })
                            .slice(0, limit);
                        console.log("\u2705 [\u7528\u6237\u504F\u597D] \u7528\u6237".concat(userId, " ").concat(entityType, ".").concat(fieldName, " \u63A8\u8350: ").concat(recommendations.length, "\u4E2A"));
                        return [2 /*return*/, {
                                field: fieldName,
                                recommendations: recommendations,
                                totalRecords: records_2.length
                            }];
                    case 2:
                        error_2 = _c.sent();
                        console.error("\u274C [\u7528\u6237\u504F\u597D] \u83B7\u53D6\u5931\u8D25:", error_2);
                        return [2 /*return*/, {
                                field: fieldName,
                                recommendations: [],
                                totalRecords: 0
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模型
     */
    FieldRecommendationService.prototype.getModel = function (entityType) {
        var modelMap = {
            'classes': models_1.Class,
            'students': models_1.Student,
            'teachers': models_1.Teacher,
            'activities': models_1.Activity,
            'todos': models_1.Todo,
            'users': models_1.User,
            'parents': models_1.Parent,
            'enrollments': models_1.EnrollmentApplication,
            'kindergartens': models_1.Kindergarten
        };
        return modelMap[entityType];
    };
    return FieldRecommendationService;
}());
exports.fieldRecommendationService = new FieldRecommendationService();
exports["default"] = exports.fieldRecommendationService;
