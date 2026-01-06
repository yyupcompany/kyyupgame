"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.DatabaseService = void 0;
var promise_1 = __importDefault(require("mysql2/promise"));
var database_unified_1 = require("../config/database-unified");
var DatabaseService = /** @class */ (function () {
    function DatabaseService() {
        var dbConfig = (0, database_unified_1.getDatabaseConfig)();
        this.pool = promise_1["default"].createPool({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.username,
            password: dbConfig.password,
            database: dbConfig.database,
            charset: 'utf8mb4',
            connectionLimit: 10
        });
    }
    /**
     * 执行查询
     */
    DatabaseService.prototype.query = function (sql, params) {
        if (params === void 0) { params = []; }
        return __awaiter(this, void 0, void 0, function () {
            var rows, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pool.execute(sql, params)];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Database query error:', error_1);
                        console.error('SQL:', sql);
                        console.error('Params:', params);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行事务
     */
    DatabaseService.prototype.transaction = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pool.getConnection()];
                    case 1:
                        connection = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, 8, 9]);
                        return [4 /*yield*/, connection.beginTransaction()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, callback(connection)];
                    case 4:
                        result = _a.sent();
                        return [4 /*yield*/, connection.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6:
                        error_2 = _a.sent();
                        return [4 /*yield*/, connection.rollback()];
                    case 7:
                        _a.sent();
                        throw error_2;
                    case 8:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取单条记录
     */
    DatabaseService.prototype.findOne = function (sql, params) {
        if (params === void 0) { params = []; }
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query(sql, params)];
                    case 1:
                        rows = _a.sent();
                        return [2 /*return*/, Array.isArray(rows) && rows.length > 0 ? rows[0] : null];
                }
            });
        });
    };
    /**
     * 获取多条记录
     */
    DatabaseService.prototype.findMany = function (sql, params) {
        if (params === void 0) { params = []; }
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query(sql, params)];
                    case 1:
                        rows = _a.sent();
                        return [2 /*return*/, Array.isArray(rows) ? rows : []];
                }
            });
        });
    };
    /**
     * 插入记录
     */
    DatabaseService.prototype.insert = function (table, data) {
        return __awaiter(this, void 0, void 0, function () {
            var fields, values, placeholders, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fields = Object.keys(data);
                        values = Object.values(data);
                        placeholders = fields.map(function () { return '?'; }).join(', ');
                        sql = "INSERT INTO ".concat(table, " (").concat(fields.join(', '), ") VALUES (").concat(placeholders, ")");
                        return [4 /*yield*/, this.query(sql, values)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 更新记录
     */
    DatabaseService.prototype.update = function (table, data, where, whereParams) {
        if (whereParams === void 0) { whereParams = []; }
        return __awaiter(this, void 0, void 0, function () {
            var fields, values, setClause, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fields = Object.keys(data);
                        values = Object.values(data);
                        setClause = fields.map(function (field) { return "".concat(field, " = ?"); }).join(', ');
                        sql = "UPDATE ".concat(table, " SET ").concat(setClause, " WHERE ").concat(where);
                        return [4 /*yield*/, this.query(sql, __spreadArray(__spreadArray([], values, true), whereParams, true))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 删除记录
     */
    DatabaseService.prototype["delete"] = function (table, where, whereParams) {
        if (whereParams === void 0) { whereParams = []; }
        return __awaiter(this, void 0, void 0, function () {
            var sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "DELETE FROM ".concat(table, " WHERE ").concat(where);
                        return [4 /*yield*/, this.query(sql, whereParams)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 检查连接
     */
    DatabaseService.prototype.checkConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.query('SELECT 1')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Database connection check failed:', error_3);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 关闭连接池
     */
    DatabaseService.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pool.end()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取连接池状态
     */
    DatabaseService.prototype.getPoolStatus = function () {
        return {
            connectionLimit: 10,
            status: 'active'
        };
    };
    return DatabaseService;
}());
exports.DatabaseService = DatabaseService;
