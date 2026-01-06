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
exports.SqlHelper = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
/**
 * SQL辅助工具类
 * 提供常用的数据库操作方法
 */
var SqlHelper = /** @class */ (function () {
    function SqlHelper() {
    }
    /**
     * 检查记录是否存在
     * @param table 表名
     * @param field 字段名
     * @param value 字段值
     * @param options 选项
     * @returns 是否存在
     */
    SqlHelper.recordExists = function (table, field, value, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, whereAddition, transaction, _b, replacements, whereClause, finalReplacements, result, rows;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.whereAddition, whereAddition = _a === void 0 ? '' : _a, transaction = options.transaction, _b = options.replacements, replacements = _b === void 0 ? {} : _b;
                        whereClause = "".concat(field, " = :value ").concat(whereAddition ? 'AND ' + whereAddition : '');
                        finalReplacements = __assign({ value: value }, replacements);
                        return [4 /*yield*/, init_1.sequelize.query("SELECT 1 FROM ".concat(table, " WHERE ").concat(whereClause, " LIMIT 1"), {
                                replacements: finalReplacements,
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        result = _c.sent();
                        rows = result;
                        return [2 /*return*/, rows.length > 0];
                }
            });
        });
    };
    /**
     * 获取单条记录
     * @param table 表名
     * @param field 字段名
     * @param value 字段值
     * @param options 选项
     * @returns 记录对象或null
     */
    SqlHelper.getRecord = function (table, field, value, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, fields, _b, whereAddition, transaction, _c, replacements, whereClause, finalReplacements, result, rows;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = options.fields, fields = _a === void 0 ? ['*'] : _a, _b = options.whereAddition, whereAddition = _b === void 0 ? '' : _b, transaction = options.transaction, _c = options.replacements, replacements = _c === void 0 ? {} : _c;
                        whereClause = "".concat(field, " = :value ").concat(whereAddition ? 'AND ' + whereAddition : '');
                        finalReplacements = __assign({ value: value }, replacements);
                        return [4 /*yield*/, init_1.sequelize.query("SELECT ".concat(fields.join(', '), " FROM ").concat(table, " WHERE ").concat(whereClause, " LIMIT 1"), {
                                replacements: finalReplacements,
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        result = _d.sent();
                        rows = result;
                        return [2 /*return*/, rows.length > 0 ? rows[0] : null];
                }
            });
        });
    };
    /**
     * 获取多条记录
     * @param table 表名
     * @param options 选项
     * @returns 返回记录数组
     */
    SqlHelper.getRecords = function (table, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, fields, _b, where, _c, replacements, _d, orderBy, _e, orderDir, limit, offset, transaction, sql, result;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = options.fields, fields = _a === void 0 ? ['*'] : _a, _b = options.where, where = _b === void 0 ? '' : _b, _c = options.replacements, replacements = _c === void 0 ? {} : _c, _d = options.orderBy, orderBy = _d === void 0 ? 'id' : _d, _e = options.orderDir, orderDir = _e === void 0 ? 'DESC' : _e, limit = options.limit, offset = options.offset, transaction = options.transaction;
                        sql = "SELECT ".concat(fields.join(', '), " FROM ").concat(table);
                        if (where) {
                            sql += " WHERE ".concat(where);
                        }
                        sql += " ORDER BY ".concat(orderBy, " ").concat(orderDir);
                        if (limit !== undefined) {
                            sql += " LIMIT ".concat(limit);
                            if (offset !== undefined) {
                                sql += " OFFSET ".concat(offset);
                            }
                        }
                        return [4 /*yield*/, init_1.sequelize.query(sql, {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        result = _f.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * 获取记录总数
     * @param table 表名
     * @param options 选项
     * @returns 记录总数
     */
    SqlHelper.getCount = function (table, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, where, _b, replacements, transaction, sql, result, rows;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.where, where = _a === void 0 ? '' : _a, _b = options.replacements, replacements = _b === void 0 ? {} : _b, transaction = options.transaction;
                        sql = "SELECT COUNT(*) as total FROM ".concat(table);
                        if (where) {
                            sql += " WHERE ".concat(where);
                        }
                        return [4 /*yield*/, init_1.sequelize.query(sql, {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        result = _c.sent();
                        rows = result;
                        return [2 /*return*/, rows.length > 0 ? Number(rows[0].total) : 0];
                }
            });
        });
    };
    /**
     * 软删除记录
     * @param table 表名
     * @param field 字段名
     * @param value 字段值
     * @param options 选项
     * @returns 影响的行数
     */
    SqlHelper.softDelete = function (table, field, value, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, whereAddition, transaction, _b, replacements, whereClause, finalReplacements, result;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.whereAddition, whereAddition = _a === void 0 ? '' : _a, transaction = options.transaction, _b = options.replacements, replacements = _b === void 0 ? {} : _b;
                        whereClause = "".concat(field, " = :value ").concat(whereAddition ? 'AND ' + whereAddition : '', " AND deleted_at IS NULL");
                        finalReplacements = __assign({ value: value }, replacements);
                        return [4 /*yield*/, init_1.sequelize.query("UPDATE ".concat(table, " SET deleted_at = NOW(), updated_at = NOW() WHERE ").concat(whereClause), {
                                replacements: finalReplacements,
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 1:
                        result = _c.sent();
                        return [2 /*return*/, result[1]];
                }
            });
        });
    };
    /**
     * 物理删除记录
     * @param table 表名
     * @param field 字段名
     * @param value 字段值
     * @param options 选项
     * @returns 影响的行数
     */
    SqlHelper.hardDelete = function (table, field, value, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, whereAddition, transaction, _b, replacements, whereClause, finalReplacements, result;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.whereAddition, whereAddition = _a === void 0 ? '' : _a, transaction = options.transaction, _b = options.replacements, replacements = _b === void 0 ? {} : _b;
                        whereClause = "".concat(field, " = :value ").concat(whereAddition ? 'AND ' + whereAddition : '');
                        finalReplacements = __assign({ value: value }, replacements);
                        return [4 /*yield*/, init_1.sequelize.query("DELETE FROM ".concat(table, " WHERE ").concat(whereClause), {
                                replacements: finalReplacements,
                                type: sequelize_1.QueryTypes.DELETE,
                                transaction: transaction
                            })];
                    case 1:
                        result = _c.sent();
                        return [2 /*return*/, result[1]];
                }
            });
        });
    };
    /**
     * 更新记录
     * @param table 表名
     * @param data 更新的数据
     * @param where 条件子句或对象条件
     * @param options 选项
     * @returns 影响的行数
     */
    SqlHelper.update = function (table, data, where, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, _a, replacements, sets, whereClause, finalReplacements, sql, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = options.transaction, _a = options.replacements, replacements = _a === void 0 ? {} : _a;
                        sets = Object.keys(data).map(function (key) { return "".concat(key, " = :").concat(key); });
                        finalReplacements = __assign(__assign({}, data), replacements);
                        if (typeof where === 'string') {
                            whereClause = where;
                        }
                        else {
                            whereClause = Object.keys(where).map(function (key) { return "".concat(key, " = :where_").concat(key); }).join(' AND ');
                            Object.keys(where).forEach(function (key) {
                                finalReplacements["where_".concat(key)] = where[key];
                            });
                        }
                        sql = "UPDATE ".concat(table, " SET ").concat(sets.join(', '), " WHERE ").concat(whereClause);
                        return [4 /*yield*/, init_1.sequelize.query(sql, {
                                replacements: finalReplacements,
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result[1]];
                }
            });
        });
    };
    /**
     * 插入记录
     * @param table 表名
     * @param data 插入的数据
     * @param options 选项
     * @returns 插入结果
     */
    SqlHelper.insert = function (table, data, options) {
        var _a;
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, fields, values, sql, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = options.transaction;
                        fields = Object.keys(data);
                        values = fields.map(function (field) { return ":".concat(field); });
                        sql = "INSERT INTO ".concat(table, " (").concat(fields.join(', '), ") VALUES (").concat(values.join(', '), ")");
                        return [4 /*yield*/, init_1.sequelize.query(sql, {
                                replacements: data,
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                insertId: ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.insertId) || result[0],
                                affectedRows: result[1]
                            }];
                }
            });
        });
    };
    /**
     * 将驼峰命名转换为下划线命名
     * @param obj 对象
     * @returns 转换后的对象
     */
    SqlHelper.camelToSnake = function (obj) {
        var result = {};
        for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            var snakeKey = key.replace(/[A-Z]/g, function (letter) { return "_".concat(letter.toLowerCase()); });
            result[snakeKey] = value;
        }
        return result;
    };
    /**
     * 将下划线命名转换为驼峰命名
     * @param obj 对象
     * @returns 转换后的对象
     */
    SqlHelper.snakeToCamel = function (obj) {
        var result = {};
        for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            var camelKey = key.replace(/_([a-z])/g, function (_, letter) { return letter.toUpperCase(); });
            result[camelKey] = value;
        }
        return result;
    };
    /**
     * 获取分页参数
     * @param page 页码
     * @param pageSize 每页大小
     * @returns 分页参数
     */
    SqlHelper.getPaginationParams = function (page, pageSize) {
        if (page === void 0) { page = 1; }
        if (pageSize === void 0) { pageSize = 10; }
        var offset = (page - 1) * pageSize;
        return { offset: offset, limit: pageSize };
    };
    /**
     * 批量插入
     * @param table 表名
     * @param fields 字段数组
     * @param values 值数组
     * @param transaction 事务
     * @returns 插入结果
     */
    SqlHelper.batchInsert = function (table, fields, values, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var placeholders, sql, flatValues, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (values.length === 0)
                            return [2 /*return*/, null];
                        placeholders = values.map(function () { return "(".concat(fields.map(function () { return '?'; }).join(', '), ")"); }).join(', ');
                        sql = "INSERT INTO ".concat(table, " (").concat(fields.join(', '), ") VALUES ").concat(placeholders);
                        flatValues = values.flat();
                        return [4 /*yield*/, init_1.sequelize.query(sql, {
                                replacements: flatValues,
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * 执行原生SQL查询
     * @param sql SQL语句
     * @param options 选项
     * @returns 查询结果
     */
    SqlHelper.rawQuery = function (sql, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, replacements, _b, type, transaction, result;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.replacements, replacements = _a === void 0 ? {} : _a, _b = options.type, type = _b === void 0 ? sequelize_1.QueryTypes.SELECT : _b, transaction = options.transaction;
                        return [4 /*yield*/, init_1.sequelize.query(sql, {
                                replacements: replacements,
                                type: type,
                                transaction: transaction
                            })];
                    case 1:
                        result = _c.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * 创建IN子句
     * @param field 字段名
     * @param values 值数组
     * @returns IN子句字符串
     */
    SqlHelper.createInClause = function (field, values) {
        if (values.length === 0)
            return '1=0'; // 空数组返回永假条件
        var placeholders = values.map(function (_, index) { return ":in_".concat(index); }).join(', ');
        return "".concat(field, " IN (").concat(placeholders, ")");
    };
    /**
     * 创建BETWEEN子句
     * @param field 字段名
     * @param start 开始值
     * @param end 结束值
     * @returns BETWEEN子句字符串
     */
    SqlHelper.createBetweenClause = function (field, start, end) {
        return "".concat(field, " BETWEEN :start AND :end");
    };
    /**
     * 创建LIKE搜索子句
     * @param fields 字段数组
     * @param keyword 关键词
     * @returns LIKE子句字符串
     */
    SqlHelper.createLikeClause = function (fields, keyword) {
        if (fields.length === 0)
            return '1=1';
        var conditions = fields.map(function (field) { return "".concat(field, " LIKE :keyword"); });
        return "(".concat(conditions.join(' OR '), ")");
    };
    return SqlHelper;
}());
exports.SqlHelper = SqlHelper;
exports["default"] = SqlHelper;
