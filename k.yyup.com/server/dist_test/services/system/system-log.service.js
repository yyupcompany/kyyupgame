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
exports.SystemLogService = void 0;
var system_log_model_1 = require("../../models/system-log.model");
var sequelize_1 = require("sequelize");
var SystemLogService = /** @class */ (function () {
    function SystemLogService() {
    }
    /**
     * 创建日志
     * @param data 日志数据
     * @returns 创建的日志
     */
    SystemLogService.prototype.createLog = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, system_log_model_1.SystemLog.create(data)];
            });
        });
    };
    /**
     * 批量创建日志
     * @param data 日志数据数组
     * @returns 创建的日志数组
     */
    SystemLogService.prototype.createLogBatch = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, system_log_model_1.SystemLog.bulkCreate(data)];
            });
        });
    };
    /**
     * 获取日志列表
     * @param options 分页和排序选项
     * @param filters 过滤条件
     * @returns 日志列表和总数
     */
    SystemLogService.prototype.getLogs = function (options, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, _c, sortBy, _d, sortOrder, offset, where;
            var _e, _f, _g, _h;
            return __generator(this, function (_j) {
                _a = options.page, page = _a === void 0 ? 1 : _a, _b = options.pageSize, pageSize = _b === void 0 ? 10 : _b, _c = options.sortBy, sortBy = _c === void 0 ? 'createdAt' : _c, _d = options.sortOrder, sortOrder = _d === void 0 ? 'DESC' : _d;
                offset = (page - 1) * pageSize;
                where = {};
                if (filters.level)
                    where.level = filters.level;
                if (filters.type)
                    where.type = filters.type;
                if (filters.status)
                    where.status = filters.status;
                if (filters.userId)
                    where.userId = filters.userId;
                if (filters.moduleName)
                    where.moduleName = (_e = {}, _e[sequelize_1.Op.like] = "%".concat(filters.moduleName, "%"), _e);
                if (filters.startDate || filters.endDate) {
                    where.createdAt = {};
                    if (filters.startDate)
                        where.createdAt[sequelize_1.Op.gte] = filters.startDate;
                    if (filters.endDate)
                        where.createdAt[sequelize_1.Op.lte] = filters.endDate;
                }
                if (filters.keyword) {
                    where[sequelize_1.Op.or] = [
                        { message: (_f = {}, _f[sequelize_1.Op.like] = "%".concat(filters.keyword, "%"), _f) },
                        { username: (_g = {}, _g[sequelize_1.Op.like] = "%".concat(filters.keyword, "%"), _g) },
                        { ipAddress: (_h = {}, _h[sequelize_1.Op.like] = "%".concat(filters.keyword, "%"), _h) },
                    ];
                }
                return [2 /*return*/, system_log_model_1.SystemLog.findAndCountAll({
                        where: where,
                        limit: pageSize,
                        offset: offset,
                        order: [[sortBy, sortOrder]]
                    })];
            });
        });
    };
    /**
     * 获取日志详情
     * @param id 日志ID
     * @returns 日志详情
     */
    SystemLogService.prototype.getLogById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var log;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, system_log_model_1.SystemLog.findByPk(id)];
                    case 1:
                        log = _a.sent();
                        if (!log) {
                            throw new Error('日志不存在'); // 或者使用自定义的ApiError
                        }
                        return [2 /*return*/, log];
                }
            });
        });
    };
    /**
     * 删除日志
     * @param id 日志ID
     * @returns 是否成功
     */
    SystemLogService.prototype.deleteLog = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, system_log_model_1.SystemLog.destroy({ where: { id: id } })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result > 0];
                }
            });
        });
    };
    /**
     * 批量删除日志
     * @param ids 日志ID数组
     * @returns 删除数量
     */
    SystemLogService.prototype.batchDeleteLogs = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                return [2 /*return*/, system_log_model_1.SystemLog.destroy({
                        where: { id: (_a = {}, _a[sequelize_1.Op["in"]] = ids, _a) }
                    })];
            });
        });
    };
    /**
     * 清空日志
     * @param type 可选的日志类型
     * @returns 删除数量
     */
    SystemLogService.prototype.clearLogs = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var where;
            return __generator(this, function (_a) {
                where = {};
                if (type) {
                    where.type = type;
                }
                return [2 /*return*/, system_log_model_1.SystemLog.destroy({ where: where })];
            });
        });
    };
    /**
     * 导出日志
     * @param filters 过滤条件
     * @returns 日志列表（用于导出）
     */
    SystemLogService.prototype.exportLogs = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var options, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { sortBy: 'createdAt', sortOrder: 'DESC' };
                        return [4 /*yield*/, this.getLogs(__assign(__assign({}, options), { page: 1, pageSize: 99999 }), filters)];
                    case 1:
                        rows = (_a.sent()).rows;
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    return SystemLogService;
}());
exports.SystemLogService = SystemLogService;
// 导出服务实例
exports["default"] = new SystemLogService();
