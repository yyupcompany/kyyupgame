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
exports.__esModule = true;
exports.DatabaseMetadataController = void 0;
var database_1 = require("../config/database");
var sequelize_1 = require("sequelize");
/**
 * 数据库元数据控制器
 * 🎯 提供数据库表结构、索引、关联关系的查询API
 * 🔒 仅供AI工具内部调用，需要权限验证
 */
var DatabaseMetadataController = /** @class */ (function () {
    function DatabaseMetadataController() {
    }
    /**
     * 获取所有数据库表列表
     * GET /api/database/tables
     */
    DatabaseMetadataController.prototype.getAllTables = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var sequelize, dbName, query, tables, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sequelize = (0, database_1.getSequelize)();
                        dbName = sequelize.getDatabaseName();
                        console.log('📋 [数据库元数据] 查询所有表');
                        query = "\n        SELECT \n          TABLE_NAME as tableName,\n          TABLE_COMMENT as tableComment,\n          TABLE_ROWS as estimatedRows,\n          CREATE_TIME as createTime,\n          UPDATE_TIME as updateTime\n        FROM information_schema.TABLES\n        WHERE TABLE_SCHEMA = :dbName\n          AND TABLE_TYPE = 'BASE TABLE'\n        ORDER BY TABLE_NAME\n      ";
                        return [4 /*yield*/, sequelize.query(query, {
                                replacements: { dbName: dbName },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        tables = _a.sent();
                        console.log("\u2705 [\u6570\u636E\u5E93\u5143\u6570\u636E] \u627E\u5230 ".concat(tables.length, " \u4E2A\u8868"));
                        res.json({
                            success: true,
                            data: {
                                database: dbName,
                                tableCount: tables.length,
                                tables: tables
                            },
                            message: "\u6210\u529F\u83B7\u53D6 ".concat(tables.length, " \u4E2A\u6570\u636E\u8868\u4FE1\u606F")
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ [数据库元数据] 查询表列表失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: '查询数据库表列表失败',
                            error: error_1.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取单个表的详细结构
     * GET /api/database/tables/:tableName
     */
    DatabaseMetadataController.prototype.getTableStructure = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tableName, sequelize, dbName, columnsQuery, columns, tableInfoQuery, tableInfo, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        tableName = req.params.tableName;
                        sequelize = (0, database_1.getSequelize)();
                        dbName = sequelize.getDatabaseName();
                        console.log("\uD83D\uDCCB [\u6570\u636E\u5E93\u5143\u6570\u636E] \u67E5\u8BE2\u8868\u7ED3\u6784: ".concat(tableName));
                        columnsQuery = "\n        SELECT \n          COLUMN_NAME as columnName,\n          DATA_TYPE as dataType,\n          COLUMN_TYPE as columnType,\n          IS_NULLABLE as isNullable,\n          COLUMN_KEY as columnKey,\n          COLUMN_DEFAULT as columnDefault,\n          EXTRA as extra,\n          COLUMN_COMMENT as columnComment,\n          ORDINAL_POSITION as position\n        FROM information_schema.COLUMNS\n        WHERE TABLE_SCHEMA = :dbName\n          AND TABLE_NAME = :tableName\n        ORDER BY ORDINAL_POSITION\n      ";
                        return [4 /*yield*/, sequelize.query(columnsQuery, {
                                replacements: { dbName: dbName, tableName: tableName },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        columns = _a.sent();
                        if (columns.length === 0) {
                            res.status(404).json({
                                success: false,
                                message: "\u8868 ".concat(tableName, " \u4E0D\u5B58\u5728")
                            });
                            return [2 /*return*/];
                        }
                        tableInfoQuery = "\n        SELECT \n          TABLE_NAME as tableName,\n          TABLE_COMMENT as tableComment,\n          TABLE_ROWS as estimatedRows,\n          AVG_ROW_LENGTH as avgRowLength,\n          DATA_LENGTH as dataLength,\n          CREATE_TIME as createTime,\n          UPDATE_TIME as updateTime\n        FROM information_schema.TABLES\n        WHERE TABLE_SCHEMA = :dbName\n          AND TABLE_NAME = :tableName\n      ";
                        return [4 /*yield*/, sequelize.query(tableInfoQuery, {
                                replacements: { dbName: dbName, tableName: tableName },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        tableInfo = _a.sent();
                        console.log("\u2705 [\u6570\u636E\u5E93\u5143\u6570\u636E] \u8868 ".concat(tableName, " \u6709 ").concat(columns.length, " \u4E2A\u5B57\u6BB5"));
                        res.json({
                            success: true,
                            data: {
                                table: tableInfo[0],
                                columns: columns,
                                columnCount: columns.length
                            },
                            message: "\u6210\u529F\u83B7\u53D6\u8868 ".concat(tableName, " \u7684\u7ED3\u6784\u4FE1\u606F")
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('❌ [数据库元数据] 查询表结构失败:', error_2);
                        res.status(500).json({
                            success: false,
                            message: '查询表结构失败',
                            error: error_2.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取表的索引信息
     * GET /api/database/tables/:tableName/indexes
     */
    DatabaseMetadataController.prototype.getTableIndexes = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tableName, sequelize, dbName, indexesQuery, indexes, groupedIndexes_1, indexList, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        tableName = req.params.tableName;
                        sequelize = (0, database_1.getSequelize)();
                        dbName = sequelize.getDatabaseName();
                        console.log("\uD83D\uDCCB [\u6570\u636E\u5E93\u5143\u6570\u636E] \u67E5\u8BE2\u8868\u7D22\u5F15: ".concat(tableName));
                        indexesQuery = "\n        SELECT \n          INDEX_NAME as indexName,\n          COLUMN_NAME as columnName,\n          NON_UNIQUE as nonUnique,\n          SEQ_IN_INDEX as seqInIndex,\n          INDEX_TYPE as indexType,\n          COMMENT as comment\n        FROM information_schema.STATISTICS\n        WHERE TABLE_SCHEMA = :dbName\n          AND TABLE_NAME = :tableName\n        ORDER BY INDEX_NAME, SEQ_IN_INDEX\n      ";
                        return [4 /*yield*/, sequelize.query(indexesQuery, {
                                replacements: { dbName: dbName, tableName: tableName },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        indexes = _a.sent();
                        groupedIndexes_1 = {};
                        indexes.forEach(function (idx) {
                            if (!groupedIndexes_1[idx.indexName]) {
                                groupedIndexes_1[idx.indexName] = {
                                    indexName: idx.indexName,
                                    unique: idx.nonUnique === 0,
                                    indexType: idx.indexType,
                                    columns: [],
                                    comment: idx.comment
                                };
                            }
                            groupedIndexes_1[idx.indexName].columns.push(idx.columnName);
                        });
                        indexList = Object.values(groupedIndexes_1);
                        console.log("\u2705 [\u6570\u636E\u5E93\u5143\u6570\u636E] \u8868 ".concat(tableName, " \u6709 ").concat(indexList.length, " \u4E2A\u7D22\u5F15"));
                        res.json({
                            success: true,
                            data: {
                                tableName: tableName,
                                indexCount: indexList.length,
                                indexes: indexList
                            },
                            message: "\u6210\u529F\u83B7\u53D6\u8868 ".concat(tableName, " \u7684\u7D22\u5F15\u4FE1\u606F")
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('❌ [数据库元数据] 查询索引失败:', error_3);
                        res.status(500).json({
                            success: false,
                            message: '查询表索引失败',
                            error: error_3.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取表的关联关系（外键）
     * GET /api/database/tables/:tableName/relations
     */
    DatabaseMetadataController.prototype.getTableRelations = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tableName, sequelize, dbName, relationsQuery, relations, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        tableName = req.params.tableName;
                        sequelize = (0, database_1.getSequelize)();
                        dbName = sequelize.getDatabaseName();
                        console.log("\uD83D\uDCCB [\u6570\u636E\u5E93\u5143\u6570\u636E] \u67E5\u8BE2\u8868\u5173\u8054: ".concat(tableName));
                        relationsQuery = "\n        SELECT \n          kcu.CONSTRAINT_NAME as constraintName,\n          kcu.COLUMN_NAME as columnName,\n          kcu.REFERENCED_TABLE_NAME as referencedTable,\n          kcu.REFERENCED_COLUMN_NAME as referencedColumn,\n          rc.UPDATE_RULE as updateRule,\n          rc.DELETE_RULE as deleteRule\n        FROM information_schema.KEY_COLUMN_USAGE kcu\n        LEFT JOIN information_schema.REFERENTIAL_CONSTRAINTS rc\n          ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME\n          AND kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA\n        WHERE kcu.TABLE_SCHEMA = :dbName\n          AND kcu.TABLE_NAME = :tableName\n          AND kcu.REFERENCED_TABLE_NAME IS NOT NULL\n        ORDER BY kcu.ORDINAL_POSITION\n      ";
                        return [4 /*yield*/, sequelize.query(relationsQuery, {
                                replacements: { dbName: dbName, tableName: tableName },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        relations = _a.sent();
                        console.log("\u2705 [\u6570\u636E\u5E93\u5143\u6570\u636E] \u8868 ".concat(tableName, " \u6709 ").concat(relations.length, " \u4E2A\u5916\u952E\u5173\u8054"));
                        res.json({
                            success: true,
                            data: {
                                tableName: tableName,
                                relationCount: relations.length,
                                relations: relations
                            },
                            message: "\u6210\u529F\u83B7\u53D6\u8868 ".concat(tableName, " \u7684\u5173\u8054\u5173\u7CFB")
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('❌ [数据库元数据] 查询关联关系失败:', error_4);
                        res.status(500).json({
                            success: false,
                            message: '查询表关联关系失败',
                            error: error_4.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return DatabaseMetadataController;
}());
exports.DatabaseMetadataController = DatabaseMetadataController;
exports["default"] = new DatabaseMetadataController();
