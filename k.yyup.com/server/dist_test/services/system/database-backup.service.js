"use strict";
/**
 * 数据库备份服务
 * 提供真正的数据库备份和恢复功能
 */
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
exports.DatabaseBackupService = void 0;
var sequelize_1 = require("sequelize");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var init_1 = require("../../init");
var database_unified_1 = require("../../config/database-unified");
var DatabaseBackupService = /** @class */ (function () {
    function DatabaseBackupService() {
        this.sequelize = init_1.sequelize;
        this.backupDir = path.join(process.cwd(), 'backups');
        this.ensureBackupDirectory();
    }
    /**
     * 确保备份目录存在
     */
    DatabaseBackupService.prototype.ensureBackupDirectory = function () {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    };
    /**
     * 格式化文件大小
     */
    DatabaseBackupService.prototype.formatFileSize = function (bytes) {
        if (bytes === 0)
            return '0 B';
        var k = 1024;
        var sizes = ['B', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    /**
     * 获取所有表名
     */
    DatabaseBackupService.prototype.getAllTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dbConfig, query, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dbConfig = (0, database_unified_1.getDatabaseConfig)();
                        query = "\n      SELECT TABLE_NAME \n      FROM INFORMATION_SCHEMA.TABLES \n      WHERE TABLE_SCHEMA = :database \n      AND TABLE_TYPE = 'BASE TABLE'\n      ORDER BY TABLE_NAME\n    ";
                        return [4 /*yield*/, this.sequelize.query(query, {
                                replacements: { database: dbConfig.database },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.map(function (row) { return row.TABLE_NAME; })];
                }
            });
        });
    };
    /**
     * 获取表结构
     */
    DatabaseBackupService.prototype.getTableStructure = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var query, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "SHOW CREATE TABLE `".concat(tableName, "`");
                        return [4 /*yield*/, this.sequelize.query(query, {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        result = _a.sent();
                        if (result.length > 0) {
                            return [2 /*return*/, result[0]['Create Table']];
                        }
                        throw new Error("\u65E0\u6CD5\u83B7\u53D6\u8868 ".concat(tableName, " \u7684\u7ED3\u6784"));
                }
            });
        });
    };
    /**
     * 获取表数据
     */
    DatabaseBackupService.prototype.getTableData = function (tableName) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var countQuery, countResult, recordCount, dataQuery, rows, columns, insertStatements, _loop_1, _i, rows_1, row;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        countQuery = "SELECT COUNT(*) as count FROM `".concat(tableName, "`");
                        return [4 /*yield*/, this.sequelize.query(countQuery, {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        countResult = _b.sent();
                        recordCount = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                        if (recordCount === 0) {
                            return [2 /*return*/, { sql: '', count: 0 }];
                        }
                        dataQuery = "SELECT * FROM `".concat(tableName, "`");
                        return [4 /*yield*/, this.sequelize.query(dataQuery, {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        rows = _b.sent();
                        if (rows.length === 0) {
                            return [2 /*return*/, { sql: '', count: 0 }];
                        }
                        columns = Object.keys(rows[0]);
                        insertStatements = [];
                        _loop_1 = function (row) {
                            var values = columns.map(function (col) {
                                var value = row[col];
                                if (value === null)
                                    return 'NULL';
                                if (typeof value === 'string') {
                                    return "'".concat(value.replace(/'/g, "''"), "'");
                                }
                                if (value instanceof Date) {
                                    return "'".concat(value.toISOString().slice(0, 19).replace('T', ' '), "'");
                                }
                                return String(value);
                            });
                            insertStatements.push("INSERT INTO `".concat(tableName, "` (`").concat(columns.join('`, `'), "`) VALUES (").concat(values.join(', '), ");"));
                        };
                        for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                            row = rows_1[_i];
                            _loop_1(row);
                        }
                        return [2 /*return*/, {
                                sql: insertStatements.join('\n'),
                                count: recordCount
                            }];
                }
            });
        });
    };
    /**
     * 创建数据库备份
     */
    DatabaseBackupService.prototype.createBackup = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var name, description, _a, includeData, includeTables, _b, excludeTables, timestamp, filename, filePath, tables, dbConfig, sqlContent, totalRecords, _i, tables_1, tableName, createTableSql, _c, insertSql, count, error_1, finalSql, stats;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        name = options.name, description = options.description, _a = options.includeData, includeData = _a === void 0 ? true : _a, includeTables = options.includeTables, _b = options.excludeTables, excludeTables = _b === void 0 ? [] : _b;
                        timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                        filename = name ? "".concat(name, "-").concat(timestamp, ".sql") : "backup-".concat(timestamp, ".sql");
                        filePath = path.join(this.backupDir, filename);
                        return [4 /*yield*/, this.getAllTables()];
                    case 1:
                        tables = _d.sent();
                        if (includeTables && includeTables.length > 0) {
                            tables = tables.filter(function (table) { return includeTables.includes(table); });
                        }
                        if (excludeTables.length > 0) {
                            tables = tables.filter(function (table) { return !excludeTables.includes(table); });
                        }
                        dbConfig = (0, database_unified_1.getDatabaseConfig)();
                        sqlContent = [];
                        totalRecords = 0;
                        // 添加备份头部信息
                        sqlContent.push('-- ========================================');
                        sqlContent.push("-- \u6570\u636E\u5E93\u5907\u4EFD\u6587\u4EF6");
                        sqlContent.push("-- \u751F\u6210\u65F6\u95F4: ".concat(new Date().toISOString()));
                        sqlContent.push("-- \u6570\u636E\u5E93: ".concat(dbConfig.database));
                        sqlContent.push("-- \u63CF\u8FF0: ".concat(description || '无描述'));
                        sqlContent.push('-- ========================================');
                        sqlContent.push('');
                        sqlContent.push('SET FOREIGN_KEY_CHECKS = 0;');
                        sqlContent.push('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";');
                        sqlContent.push('SET AUTOCOMMIT = 0;');
                        sqlContent.push('START TRANSACTION;');
                        sqlContent.push('');
                        _i = 0, tables_1 = tables;
                        _d.label = 2;
                    case 2:
                        if (!(_i < tables_1.length)) return [3 /*break*/, 9];
                        tableName = tables_1[_i];
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 7, , 8]);
                        sqlContent.push("-- ========================================");
                        sqlContent.push("-- \u8868: ".concat(tableName));
                        sqlContent.push("-- ========================================");
                        return [4 /*yield*/, this.getTableStructure(tableName)];
                    case 4:
                        createTableSql = _d.sent();
                        sqlContent.push("DROP TABLE IF EXISTS `".concat(tableName, "`;"));
                        sqlContent.push(createTableSql + ';');
                        sqlContent.push('');
                        if (!includeData) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getTableData(tableName)];
                    case 5:
                        _c = _d.sent(), insertSql = _c.sql, count = _c.count;
                        if (insertSql) {
                            sqlContent.push("-- \u6570\u636E\u63D2\u5165: ".concat(tableName, " (").concat(count, " \u6761\u8BB0\u5F55)"));
                            sqlContent.push(insertSql);
                            sqlContent.push('');
                            totalRecords += count;
                        }
                        _d.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _d.sent();
                        console.error("\u5907\u4EFD\u8868 ".concat(tableName, " \u65F6\u51FA\u9519:"), error_1);
                        sqlContent.push("-- \u9519\u8BEF: \u65E0\u6CD5\u5907\u4EFD\u8868 ".concat(tableName, ": ").concat(error_1));
                        sqlContent.push('');
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9:
                        // 添加备份尾部
                        sqlContent.push('COMMIT;');
                        sqlContent.push('SET FOREIGN_KEY_CHECKS = 1;');
                        sqlContent.push('');
                        sqlContent.push('-- ========================================');
                        sqlContent.push("-- \u5907\u4EFD\u5B8C\u6210");
                        sqlContent.push("-- \u8868\u6570\u91CF: ".concat(tables.length));
                        sqlContent.push("-- \u8BB0\u5F55\u6570\u91CF: ".concat(totalRecords));
                        sqlContent.push("-- \u5B8C\u6210\u65F6\u95F4: ".concat(new Date().toISOString()));
                        sqlContent.push('-- ========================================');
                        finalSql = sqlContent.join('\n');
                        fs.writeFileSync(filePath, finalSql, 'utf8');
                        stats = fs.statSync(filePath);
                        return [2 /*return*/, {
                                filename: filename,
                                size: stats.size,
                                sizeFormatted: this.formatFileSize(stats.size),
                                createdAt: stats.birthtime,
                                description: description,
                                tableCount: tables.length,
                                recordCount: totalRecords
                            }];
                }
            });
        });
    };
    /**
     * 恢复数据库备份
     */
    DatabaseBackupService.prototype.restoreBackup = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var filename, _a, dropExisting, _b, ignoreErrors, filePath, sqlContent, statements, tablesRestored, transaction, _i, statements_1, statement, trimmedStmt, error_2, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        filename = options.filename, _a = options.dropExisting, dropExisting = _a === void 0 ? true : _a, _b = options.ignoreErrors, ignoreErrors = _b === void 0 ? false : _b;
                        filePath = path.join(this.backupDir, filename);
                        if (!fs.existsSync(filePath)) {
                            throw new Error("\u5907\u4EFD\u6587\u4EF6\u4E0D\u5B58\u5728: ".concat(filename));
                        }
                        sqlContent = fs.readFileSync(filePath, 'utf8');
                        statements = sqlContent
                            .split('\n')
                            .filter(function (line) { return line.trim() && !line.trim().startsWith('--'); })
                            .join('\n')
                            .split(';')
                            .filter(function (stmt) { return stmt.trim(); });
                        tablesRestored = 0;
                        return [4 /*yield*/, this.sequelize.transaction()];
                    case 1:
                        transaction = _c.sent();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 10, , 12]);
                        _i = 0, statements_1 = statements;
                        _c.label = 3;
                    case 3:
                        if (!(_i < statements_1.length)) return [3 /*break*/, 8];
                        statement = statements_1[_i];
                        trimmedStmt = statement.trim();
                        if (!trimmedStmt)
                            return [3 /*break*/, 7];
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.sequelize.query(trimmedStmt, { transaction: transaction })];
                    case 5:
                        _c.sent();
                        if (trimmedStmt.toUpperCase().startsWith('CREATE TABLE')) {
                            tablesRestored++;
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _c.sent();
                        if (!ignoreErrors) {
                            throw error_2;
                        }
                        console.warn("\u5FFD\u7565SQL\u6267\u884C\u9519\u8BEF: ".concat(error_2));
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8: return [4 /*yield*/, transaction.commit()];
                    case 9:
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: '数据库恢复成功',
                                tablesRestored: tablesRestored
                            }];
                    case 10:
                        error_3 = _c.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 11:
                        _c.sent();
                        throw new Error("\u6570\u636E\u5E93\u6062\u590D\u5931\u8D25: ".concat(error_3));
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取备份文件列表
     */
    DatabaseBackupService.prototype.getBackupList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files;
            var _this = this;
            return __generator(this, function (_a) {
                files = fs.readdirSync(this.backupDir)
                    .filter(function (file) { return file.endsWith('.sql'); })
                    .map(function (file) {
                    var filePath = path.join(_this.backupDir, file);
                    var stats = fs.statSync(filePath);
                    return {
                        filename: file,
                        size: stats.size,
                        sizeFormatted: _this.formatFileSize(stats.size),
                        createdAt: stats.birthtime,
                        type: 'database'
                    };
                })
                    .sort(function (a, b) { return b.createdAt.getTime() - a.createdAt.getTime(); });
                return [2 /*return*/, files];
            });
        });
    };
    /**
     * 删除备份文件
     */
    DatabaseBackupService.prototype.deleteBackup = function (filename) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath;
            return __generator(this, function (_a) {
                filePath = path.join(this.backupDir, filename);
                if (!fs.existsSync(filePath)) {
                    throw new Error("\u5907\u4EFD\u6587\u4EF6\u4E0D\u5B58\u5728: ".concat(filename));
                }
                fs.unlinkSync(filePath);
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取备份统计信息
     */
    DatabaseBackupService.prototype.getBackupStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var backups, totalSize, dates;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBackupList()];
                    case 1:
                        backups = _a.sent();
                        if (backups.length === 0) {
                            return [2 /*return*/, {
                                    totalBackups: 0,
                                    totalSize: 0,
                                    totalSizeFormatted: '0 B',
                                    latestBackup: null,
                                    oldestBackup: null
                                }];
                        }
                        totalSize = backups.reduce(function (sum, backup) { return sum + backup.size; }, 0);
                        dates = backups.map(function (backup) { return backup.createdAt; }).sort(function (a, b) { return a.getTime() - b.getTime(); });
                        return [2 /*return*/, {
                                totalBackups: backups.length,
                                totalSize: totalSize,
                                totalSizeFormatted: this.formatFileSize(totalSize),
                                latestBackup: dates[dates.length - 1],
                                oldestBackup: dates[0]
                            }];
                }
            });
        });
    };
    /**
     * 清理旧备份
     */
    DatabaseBackupService.prototype.cleanupOldBackups = function (retentionDays) {
        if (retentionDays === void 0) { retentionDays = 7; }
        return __awaiter(this, void 0, void 0, function () {
            var backups, cutoffDate, deletedCount, freedSpace, _i, backups_1, backup, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBackupList()];
                    case 1:
                        backups = _a.sent();
                        cutoffDate = new Date();
                        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
                        deletedCount = 0;
                        freedSpace = 0;
                        _i = 0, backups_1 = backups;
                        _a.label = 2;
                    case 2:
                        if (!(_i < backups_1.length)) return [3 /*break*/, 7];
                        backup = backups_1[_i];
                        if (!(backup.createdAt < cutoffDate)) return [3 /*break*/, 6];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.deleteBackup(backup.filename)];
                    case 4:
                        _a.sent();
                        deletedCount++;
                        freedSpace += backup.size;
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        console.error("\u5220\u9664\u5907\u4EFD\u6587\u4EF6\u5931\u8D25: ".concat(backup.filename), error_4);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, { deletedCount: deletedCount, freedSpace: freedSpace }];
                }
            });
        });
    };
    /**
     * 验证备份文件
     */
    DatabaseBackupService.prototype.validateBackup = function (filename) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, errors, content, statements, _i, statements_2, stmt, trimmed;
            return __generator(this, function (_a) {
                filePath = path.join(this.backupDir, filename);
                errors = [];
                if (!fs.existsSync(filePath)) {
                    errors.push('备份文件不存在');
                    return [2 /*return*/, { valid: false, errors: errors }];
                }
                try {
                    content = fs.readFileSync(filePath, 'utf8');
                    // 基本格式检查
                    if (!content.includes('CREATE TABLE')) {
                        errors.push('备份文件中未找到表结构定义');
                    }
                    if (!content.includes('SET FOREIGN_KEY_CHECKS')) {
                        errors.push('备份文件缺少外键检查设置');
                    }
                    statements = content.split(';').filter(function (stmt) { return stmt.trim(); });
                    for (_i = 0, statements_2 = statements; _i < statements_2.length; _i++) {
                        stmt = statements_2[_i];
                        trimmed = stmt.trim();
                        if (trimmed && !trimmed.startsWith('--') && !trimmed.match(/^(CREATE|INSERT|DROP|SET|START|COMMIT)/i)) {
                            errors.push("\u53EF\u80FD\u5B58\u5728\u65E0\u6548\u7684SQL\u8BED\u53E5: ".concat(trimmed.substring(0, 50), "..."));
                            break;
                        }
                    }
                }
                catch (error) {
                    errors.push("\u8BFB\u53D6\u5907\u4EFD\u6587\u4EF6\u5931\u8D25: ".concat(error));
                }
                return [2 /*return*/, {
                        valid: errors.length === 0,
                        errors: errors
                    }];
            });
        });
    };
    return DatabaseBackupService;
}());
exports.DatabaseBackupService = DatabaseBackupService;
// 导出服务实例
exports["default"] = new DatabaseBackupService();
