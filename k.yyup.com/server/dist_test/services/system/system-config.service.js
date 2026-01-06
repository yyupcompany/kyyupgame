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
exports.__esModule = true;
exports.SystemConfigService = void 0;
var apiError_1 = require("../../utils/apiError");
var sequelize_1 = require("sequelize");
var init_1 = require("../../init");
var SystemConfigService = /** @class */ (function () {
    function SystemConfigService() {
    }
    /**
     * 创建系统配置
     */
    SystemConfigService.prototype.createSystemConfig = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, existingConfig, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 9]);
                        return [4 /*yield*/, init_1.sequelize.query("SELECT id FROM system_configs \n         WHERE category = :category AND `key` = :key", {
                                replacements: { category: data.groupKey, key: data.configKey },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 3:
                        existingConfig = _a.sent();
                        if (existingConfig.length > 0) {
                            throw apiError_1.ApiError.badRequest('配置键已存在');
                        }
                        return [4 /*yield*/, init_1.sequelize.query("INSERT INTO system_configs \n         (category, `key`, value, description, is_system, created_at, updated_at)\n         VALUES (:category, :key, :value, :description, :isSystem, NOW(), NOW())", {
                                replacements: {
                                    category: data.groupKey,
                                    key: data.configKey,
                                    value: data.configValue,
                                    description: data.description,
                                    isSystem: data.isSystem || false
                                },
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 4:
                        result = (_a.sent())[0];
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.getSystemConfigById(result)];
                    case 6: 
                    // 返回创建的配置
                    return [2 /*return*/, _a.sent()];
                    case 7:
                        error_1 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _a.sent();
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取系统配置列表
     */
    SystemConfigService.prototype.getSystemConfigs = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var groupKey, keyword, isSystem, isReadonly, _a, page, _b, pageSize, _c, sortBy, _d, sortOrder, conditions, replacements, whereClause, countQuery, offset, dataQuery, _e, countResult, dataResult, countList, count, dataList, rows;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        groupKey = params.groupKey, keyword = params.keyword, isSystem = params.isSystem, isReadonly = params.isReadonly, _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.pageSize, pageSize = _b === void 0 ? 10 : _b, _c = params.sortBy, sortBy = _c === void 0 ? 'updated_at' : _c, _d = params.sortOrder, sortOrder = _d === void 0 ? 'DESC' : _d;
                        conditions = [];
                        replacements = {};
                        if (groupKey) {
                            conditions.push('sc.category = :category');
                            replacements.category = groupKey;
                        }
                        if (keyword) {
                            conditions.push('(sc.key LIKE :keyword OR sc.description LIKE :keyword)');
                            replacements.keyword = "%".concat(keyword, "%");
                        }
                        if (isSystem !== undefined) {
                            conditions.push('sc.is_system = :isSystem');
                            replacements.isSystem = isSystem;
                        }
                        whereClause = conditions.length > 0 ? "WHERE ".concat(conditions.join(' AND ')) : '';
                        countQuery = "\n      SELECT COUNT(*) as total\n      FROM system_configs sc\n      ".concat(whereClause, "\n    ");
                        offset = (page - 1) * pageSize;
                        dataQuery = "\n      SELECT \n        sc.id,\n        sc.category as groupKey,\n        sc.key as configKey,\n        sc.value as configValue,\n        sc.description,\n        sc.is_system as isSystem,\n        sc.created_at,\n        sc.updated_at\n      FROM system_configs sc\n      ".concat(whereClause, "\n      ORDER BY sc.").concat(sortBy, " ").concat(sortOrder, "\n      LIMIT :limit OFFSET :offset\n    ");
                        replacements.limit = pageSize;
                        replacements.offset = offset;
                        return [4 /*yield*/, Promise.all([
                                init_1.sequelize.query(countQuery, {
                                    replacements: replacements,
                                    type: sequelize_1.QueryTypes.SELECT
                                }),
                                init_1.sequelize.query(dataQuery, {
                                    replacements: replacements,
                                    type: sequelize_1.QueryTypes.SELECT
                                })
                            ])];
                    case 1:
                        _e = _f.sent(), countResult = _e[0], dataResult = _e[1];
                        countList = Array.isArray(countResult) ? countResult : [];
                        count = countList.length > 0 ? countList[0].total : 0;
                        dataList = Array.isArray(dataResult) ? dataResult : [];
                        rows = dataList.map(function (item) { return (__assign({}, item)); });
                        return [2 /*return*/, { rows: rows, count: Number(count) }];
                }
            });
        });
    };
    /**
     * 获取系统配置详情
     */
    SystemConfigService.prototype.getSystemConfigById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var query, results, resultList, configData, config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      SELECT \n        sc.id,\n        sc.category as groupKey,\n        sc.key as configKey,\n        sc.value as configValue,\n        sc.description,\n        sc.is_system as isSystem,\n        sc.created_at,\n        sc.updated_at\n      FROM system_configs sc\n      WHERE sc.id = :id\n    ";
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: { id: id },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        results = _a.sent();
                        resultList = Array.isArray(results) ? results : [];
                        configData = resultList.length > 0 ? resultList[0] : null;
                        if (!configData) {
                            throw apiError_1.ApiError.notFound('系统配置不存在');
                        }
                        config = __assign({}, configData);
                        return [2 /*return*/, config];
                }
            });
        });
    };
    /**
     * 更新系统配置
     */
    SystemConfigService.prototype.updateSystemConfig = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, existingConfig, category, key, conflictConfig, updateFields, replacements, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 9, , 11]);
                        return [4 /*yield*/, this.getSystemConfigById(id)];
                    case 3:
                        existingConfig = _a.sent();
                        if (!(data.groupKey || data.configKey)) return [3 /*break*/, 5];
                        category = data.groupKey || existingConfig.groupKey;
                        key = data.configKey || existingConfig.configKey;
                        return [4 /*yield*/, init_1.sequelize.query("SELECT id FROM system_configs \n           WHERE category = :category AND `key` = :key \n           AND id != :id", {
                                replacements: { category: category, key: key, id: id },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 4:
                        conflictConfig = _a.sent();
                        if (conflictConfig.length > 0) {
                            throw apiError_1.ApiError.badRequest('配置键已存在');
                        }
                        _a.label = 5;
                    case 5:
                        updateFields = [];
                        replacements = { id: id };
                        if (data.groupKey !== undefined) {
                            updateFields.push('category = :category');
                            replacements.category = data.groupKey;
                        }
                        if (data.configKey !== undefined) {
                            updateFields.push('`key` = :key');
                            replacements.key = data.configKey;
                        }
                        if (data.configValue !== undefined) {
                            updateFields.push('value = :value');
                            replacements.value = data.configValue;
                        }
                        if (data.description !== undefined) {
                            updateFields.push('description = :description');
                            replacements.description = data.description;
                        }
                        if (data.isSystem !== undefined) {
                            updateFields.push('is_system = :isSystem');
                            replacements.isSystem = data.isSystem;
                        }
                        updateFields.push('updated_at = NOW()');
                        // 执行更新
                        return [4 /*yield*/, init_1.sequelize.query("UPDATE system_configs SET ".concat(updateFields.join(', '), " WHERE id = :id"), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 6:
                        // 执行更新
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.getSystemConfigById(id)];
                    case 8: 
                    // 返回更新后的配置
                    return [2 /*return*/, _a.sent()];
                    case 9:
                        error_2 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 10:
                        _a.sent();
                        throw error_2;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除系统配置
     */
    SystemConfigService.prototype.deleteSystemConfig = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, existingConfig, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, this.getSystemConfigById(id)];
                    case 3:
                        existingConfig = _a.sent();
                        // 检查是否为系统配置
                        if (existingConfig.isSystem) {
                            throw apiError_1.ApiError.badRequest('系统配置不能删除');
                        }
                        // 硬删除（因为表中没有deleted_at字段）
                        return [4 /*yield*/, init_1.sequelize.query("DELETE FROM system_configs WHERE id = :id", {
                                replacements: { id: id },
                                type: sequelize_1.QueryTypes.DELETE,
                                transaction: transaction
                            })];
                    case 4:
                        // 硬删除（因为表中没有deleted_at字段）
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        error_3 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_3;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据配置键获取配置值
     */
    SystemConfigService.prototype.getConfigValue = function (groupKey, configKey) {
        return __awaiter(this, void 0, void 0, function () {
            var query, results, resultList, configData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      SELECT value \n      FROM system_configs \n      WHERE category = :category AND `key` = :key\n    ";
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: { category: groupKey, key: configKey },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        results = _a.sent();
                        resultList = Array.isArray(results) ? results : [];
                        configData = resultList.length > 0 ? resultList[0] : null;
                        return [2 /*return*/, configData ? configData.value : null];
                }
            });
        });
    };
    return SystemConfigService;
}());
exports.SystemConfigService = SystemConfigService;
// 导出服务实例
exports["default"] = new SystemConfigService();
