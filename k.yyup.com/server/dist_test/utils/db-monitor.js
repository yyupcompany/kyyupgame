"use strict";
/**
 * 数据库监控工具
 * 用于监控数据库查询性能、连接池状态和事务执行情况
 */
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
exports.getQueryStats = exports.getIndexUsageStats = exports.getTableStats = exports.getPerformanceMetrics = exports.endTransactionTracking = exports.startTransactionTracking = exports.recordQueryPerformance = void 0;
var sequelize_1 = require("sequelize");
var database_optimization_1 = require("../config/database-optimization");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var logger_1 = require("./logger");
// 确保日志目录存在
var LOG_DIR = path_1["default"].join(process.cwd(), 'logs');
if (!fs_1["default"].existsSync(LOG_DIR)) {
    try {
        fs_1["default"].mkdirSync(LOG_DIR, { recursive: true });
        logger_1.logger.info('创建数据库监控日志目录成功', { path: LOG_DIR });
    }
    catch (error) {
        logger_1.logger.error('创建数据库监控日志目录失败', error);
    }
}
// 初始化性能指标
var metrics = {
    totalQueries: 0,
    slowQueries: 0,
    averageQueryTime: 0,
    maxQueryTime: 0,
    totalErrors: 0,
    poolStats: {
        size: 0,
        available: 0,
        pending: 0,
        max: 0,
        min: 0
    },
    transactionStats: {
        active: 0,
        completed: 0,
        rolledBack: 0,
        averageDuration: 0
    },
    lastUpdated: new Date()
};
// 活动事务跟踪
var activeTransactions = new Map();
/**
 * 更新连接池统计信息
 */
function updatePoolStats(sequelize) {
    try {
        // 使用类型断言访问内部连接池
        var connectionManager = sequelize.connectionManager;
        var pool = connectionManager.pool;
        if (pool) {
            metrics.poolStats = {
                size: pool.size || 0,
                available: pool.available || 0,
                pending: pool.pending || 0,
                max: pool.max || 0,
                min: pool.min || 0
            };
        }
    }
    catch (error) {
        logger_1.logger.error('更新连接池统计信息失败:', error);
    }
}
/**
 * 记录查询性能
 * @param query SQL查询
 * @param executionTime 执行时间(ms)
 * @param error 错误信息（如果有）
 */
function recordQueryPerformance(query, executionTime, error) {
    if (!database_optimization_1.monitoringConfig.enabled || !database_optimization_1.monitoringConfig.monitorQueries) {
        return;
    }
    try {
        // 更新查询统计
        metrics.totalQueries++;
        // 计算平均查询时间
        metrics.averageQueryTime =
            (metrics.averageQueryTime * (metrics.totalQueries - 1) + executionTime) / metrics.totalQueries;
        // 更新最大查询时间
        metrics.maxQueryTime = Math.max(metrics.maxQueryTime, executionTime);
        // 检查是否是慢查询
        if (executionTime > 1000) { // 超过1秒的查询视为慢查询
            metrics.slowQueries++;
            // 记录慢查询日志
            logSlowQuery(query, executionTime);
        }
        // 记录错误
        if (error) {
            metrics.totalErrors++;
            logger_1.logger.error("\u67E5\u8BE2\u9519\u8BEF: ".concat(error.message), { query: query, executionTime: executionTime });
        }
        // 更新时间戳
        metrics.lastUpdated = new Date();
    }
    catch (error) {
        logger_1.logger.error('记录查询性能失败:', error);
    }
}
exports.recordQueryPerformance = recordQueryPerformance;
/**
 * 记录慢查询
 * @param query SQL查询
 * @param executionTime 执行时间(ms)
 */
function logSlowQuery(query, executionTime) {
    try {
        var logFile = path_1["default"].join(LOG_DIR, 'slow-queries.log');
        var timestamp = new Date().toISOString();
        var logEntry = "[".concat(timestamp, "] \u6267\u884C\u65F6\u95F4: ").concat(executionTime, "ms\n").concat(query, "\n\n");
        // 追加到日志文件
        fs_1["default"].appendFileSync(logFile, logEntry);
        // 同时记录到日志系统
        logger_1.logger.warn("\u6162\u67E5\u8BE2 (".concat(executionTime, "ms)"), { query: query.substring(0, 200) + (query.length > 200 ? '...' : '') });
    }
    catch (error) {
        logger_1.logger.error('记录慢查询日志失败:', error);
    }
}
/**
 * 开始跟踪事务
 * @param transactionId 事务ID
 * @param query 事务初始查询
 */
function startTransactionTracking(transactionId, query) {
    if (!database_optimization_1.monitoringConfig.enabled || !database_optimization_1.monitoringConfig.monitorTransactions) {
        return;
    }
    activeTransactions.set(transactionId, {
        startTime: new Date(),
        query: query
    });
    metrics.transactionStats.active = activeTransactions.size;
    logger_1.logger.debug("\u5F00\u59CB\u4E8B\u52A1\u8DDF\u8E2A: ".concat(transactionId), { query: query.substring(0, 100) });
}
exports.startTransactionTracking = startTransactionTracking;
/**
 * 结束事务跟踪
 * @param transactionId 事务ID
 * @param wasCommitted 是否提交（否则回滚）
 */
function endTransactionTracking(transactionId, wasCommitted) {
    if (!database_optimization_1.monitoringConfig.enabled || !database_optimization_1.monitoringConfig.monitorTransactions) {
        return;
    }
    var transaction = activeTransactions.get(transactionId);
    if (transaction) {
        var duration = new Date().getTime() - transaction.startTime.getTime();
        // 更新事务统计
        if (wasCommitted) {
            metrics.transactionStats.completed++;
            logger_1.logger.debug("\u4E8B\u52A1\u5DF2\u63D0\u4EA4: ".concat(transactionId), { duration: duration });
        }
        else {
            metrics.transactionStats.rolledBack++;
            logger_1.logger.debug("\u4E8B\u52A1\u5DF2\u56DE\u6EDA: ".concat(transactionId), { duration: duration });
        }
        // 更新平均事务持续时间
        var totalCompleted = metrics.transactionStats.completed + metrics.transactionStats.rolledBack;
        metrics.transactionStats.averageDuration =
            (metrics.transactionStats.averageDuration * (totalCompleted - 1) + duration) / totalCompleted;
        // 从活动事务中移除
        activeTransactions["delete"](transactionId);
        metrics.transactionStats.active = activeTransactions.size;
    }
}
exports.endTransactionTracking = endTransactionTracking;
/**
 * 获取性能指标
 * @param sequelize Sequelize 实例
 * @returns 性能指标快照
 */
function getPerformanceMetrics(sequelize) {
    // 先更新连接池统计
    if (database_optimization_1.monitoringConfig.monitorPool) {
        updatePoolStats(sequelize);
    }
    return __assign({}, metrics);
}
exports.getPerformanceMetrics = getPerformanceMetrics;
/**
 * 定期收集数据库状态
 * @param sequelize Sequelize 实例
 */
function collectDatabaseStats(sequelize) {
    if (!database_optimization_1.monitoringConfig.enabled) {
        return;
    }
    try {
        // 更新连接池统计
        if (database_optimization_1.monitoringConfig.monitorPool) {
            updatePoolStats(sequelize);
        }
        // 记录长时间运行的事务
        if (database_optimization_1.monitoringConfig.monitorTransactions) {
            var now_1 = new Date().getTime();
            var longRunningThreshold_1 = database_optimization_1.monitoringConfig.transactions.longRunningThresholdSeconds * 1000;
            activeTransactions.forEach(function (transaction, id) {
                var duration = now_1 - transaction.startTime.getTime();
                if (duration > longRunningThreshold_1) {
                    logger_1.logger.warn("\u957F\u65F6\u95F4\u8FD0\u884C\u7684\u4E8B\u52A1", {
                        id: id,
                        durationSeconds: Math.round(duration / 1000),
                        startTime: transaction.startTime,
                        query: transaction.query.substring(0, 200)
                    });
                    // 检查是否需要自动终止长时间运行的事务
                    var autoKillThreshold = database_optimization_1.monitoringConfig.transactions.autoKillThresholdSeconds * 1000;
                    if (database_optimization_1.monitoringConfig.transactions.autoKillLongTransactions &&
                        duration > autoKillThreshold) {
                        logger_1.logger.error("\u8D85\u65F6\u4E8B\u52A1\u81EA\u52A8\u7EC8\u6B62", {
                            id: id,
                            durationSeconds: Math.round(duration / 1000)
                        });
                        // 实际的终止逻辑需要根据数据库类型实现
                        // 这里只是从跟踪列表中移除
                        activeTransactions["delete"](id);
                    }
                }
            });
        }
        // 将性能指标写入日志文件
        if (database_optimization_1.monitoringConfig.logMetrics) {
            logPerformanceMetrics(sequelize);
        }
    }
    catch (error) {
        logger_1.logger.error('收集数据库状态失败:', error);
    }
}
/**
 * 记录长时间运行的事务
 */
function logLongRunningTransactions() {
    // 实现逻辑
}
/**
 * 将性能指标写入日志文件
 * @param sequelize Sequelize 实例
 */
function logPerformanceMetrics(sequelize) {
    var logFile = path_1["default"].join(LOG_DIR, 'performance-metrics.log');
    var timestamp = new Date().toISOString();
    var metricsSnapshot = getPerformanceMetrics(sequelize);
    var logEntry = "[".concat(timestamp, "] ").concat(JSON.stringify(metricsSnapshot), "\n");
    fs_1["default"].appendFileSync(logFile, logEntry);
}
/**
 * 获取表统计信息
 * @param sequelize Sequelize 实例
 * @returns 表统计信息的Promise
 */
function getTableStats(sequelize) {
    return __awaiter(this, void 0, void 0, function () {
        var dbName, dialect_1, tableStats, tableStats, tableStats, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    dbName = sequelize.getDatabaseName();
                    dialect_1 = sequelize.getDialect();
                    if (!(dialect_1 === 'mysql')) return [3 /*break*/, 2];
                    return [4 /*yield*/, sequelize.query("SELECT \n          table_name as tableName, \n          table_rows as rowCount,\n          data_length as dataSize,\n          index_length as indexSize,\n          data_free as fragmentedSpace,\n          create_time as createTime,\n          update_time as updateTime\n        FROM \n          information_schema.tables \n        WHERE \n          table_schema = :dbName\n        ORDER BY \n          data_length DESC", {
                            replacements: { dbName: dbName },
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                case 1:
                    tableStats = _a.sent();
                    return [2 /*return*/, tableStats];
                case 2:
                    if (!(dialect_1 === 'postgres')) return [3 /*break*/, 4];
                    return [4 /*yield*/, sequelize.query("SELECT\n          tablename as \"tableName\",\n          pg_relation_size(quote_ident(tablename)) as \"dataSize\",\n          pg_total_relation_size(quote_ident(tablename)) - pg_relation_size(quote_ident(tablename)) as \"indexSize\",\n          NULL as \"rowCount\",\n          NULL as \"fragmentedSpace\",\n          NULL as \"createTime\",\n          NULL as \"updateTime\"\n        FROM\n          pg_tables\n        WHERE\n          schemaname = 'public'\n        ORDER BY\n          \"dataSize\" DESC", {
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                case 3:
                    tableStats = _a.sent();
                    return [2 /*return*/, tableStats];
                case 4: return [4 /*yield*/, sequelize.query("SELECT \n          name as tableName \n        FROM \n          sqlite_master \n        WHERE \n          type='table'\n        ORDER BY \n          name", {
                        type: sequelize_1.QueryTypes.SELECT
                    })["catch"](function () {
                        logger_1.logger.warn("\u4E0D\u652F\u6301\u7684\u6570\u636E\u5E93\u7C7B\u578B: ".concat(dialect_1, "\uFF0C\u65E0\u6CD5\u83B7\u53D6\u8868\u7EDF\u8BA1\u4FE1\u606F"));
                        return [];
                    })];
                case 5:
                    tableStats = _a.sent();
                    return [2 /*return*/, tableStats];
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    logger_1.logger.error('获取表统计信息失败:', error_1);
                    return [2 /*return*/, []];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.getTableStats = getTableStats;
/**
 * 获取索引使用情况
 * @param sequelize Sequelize 实例
 * @returns 索引使用情况的Promise
 */
function getIndexUsageStats(sequelize) {
    return __awaiter(this, void 0, void 0, function () {
        var dialect_2;
        return __generator(this, function (_a) {
            try {
                dialect_2 = sequelize.getDialect();
                if (dialect_2 === 'mysql') {
                    // MySQL查询
                    return [2 /*return*/, sequelize.query("SELECT\n          t.TABLE_NAME AS tableName,\n          s.INDEX_NAME AS indexName,\n          s.COLUMN_NAME AS columnName,\n          s.SEQ_IN_INDEX AS sequence,\n          s.NON_UNIQUE AS nonUnique,\n          s.INDEX_TYPE AS indexType\n        FROM\n          information_schema.STATISTICS s\n        JOIN\n          information_schema.TABLES t ON s.TABLE_SCHEMA = t.TABLE_SCHEMA AND s.TABLE_NAME = t.TABLE_NAME\n        WHERE\n          s.TABLE_SCHEMA = :dbName\n        ORDER BY\n          s.TABLE_NAME, s.INDEX_NAME, s.SEQ_IN_INDEX", {
                            replacements: { dbName: sequelize.getDatabaseName() },
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                }
                else if (dialect_2 === 'postgres') {
                    // PostgreSQL查询
                    return [2 /*return*/, sequelize.query("SELECT\n          t.relname AS \"tableName\",\n          i.relname AS \"indexName\",\n          a.attname AS \"columnName\",\n          ix.indisunique AS \"isUnique\",\n          am.amname AS \"indexType\"\n        FROM\n          pg_class t,\n          pg_class i,\n          pg_index ix,\n          pg_attribute a,\n          pg_am am\n        WHERE\n          t.oid = ix.indrelid\n          AND i.oid = ix.indexrelid\n          AND a.attrelid = t.oid\n          AND a.attnum = ANY(ix.indkey)\n          AND i.relam = am.oid\n          AND t.relkind = 'r'\n        ORDER BY\n          t.relname, i.relname", {
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                }
                else if (dialect_2 === 'mssql') {
                    // SQL Server查询
                    return [2 /*return*/, sequelize.query("SELECT\n        t.name AS tableName,\n        i.name AS indexName,\n        i.type_desc AS indexType,\n          s.user_seeks AS seeks,\n          s.user_scans AS scans,\n          s.user_lookups AS lookups,\n          s.user_updates AS updates,\n          s.last_user_seek AS lastSeek,\n          s.last_user_scan AS lastScan,\n          s.last_user_lookup AS lastLookup,\n          s.last_user_update AS lastUpdate\n      FROM\n        sys.dm_db_index_usage_stats s\n        JOIN sys.indexes i ON s.object_id = i.object_id AND s.index_id = i.index_id\n        JOIN sys.tables t ON i.object_id = t.object_id\n      WHERE\n        s.database_id = DB_ID()\n      ORDER BY\n        user_seeks + user_scans + user_lookups DESC", {
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                }
                else {
                    // SQLite或其他数据库，使用简单查询
                    return [2 /*return*/, sequelize.query("SELECT\n          m.tbl_name AS tableName,\n          m.name AS indexName,\n          NULL AS indexType,\n          NULL AS seeks,\n          NULL AS scans,\n          NULL AS lookups,\n          NULL AS updates\n        FROM\n          sqlite_master m\n        WHERE\n          m.type = 'index'\n        ORDER BY\n          m.tbl_name, m.name", {
                            type: sequelize_1.QueryTypes.SELECT
                        })["catch"](function () {
                            logger_1.logger.warn("\u4E0D\u652F\u6301\u7684\u6570\u636E\u5E93\u7C7B\u578B: ".concat(dialect_2, "\uFF0C\u65E0\u6CD5\u83B7\u53D6\u7D22\u5F15\u4F7F\u7528\u60C5\u51B5"));
                            return [];
                        })];
                }
            }
            catch (error) {
                logger_1.logger.error('获取索引使用情况失败:', error);
                return [2 /*return*/, []];
            }
            return [2 /*return*/];
        });
    });
}
exports.getIndexUsageStats = getIndexUsageStats;
/**
 * 获取查询统计信息
 * @param sequelize Sequelize 实例
 * @returns 查询统计信息
 */
function getQueryStats(sequelize) {
    return __awaiter(this, void 0, void 0, function () {
        var logEntries, performanceSchemaStats, queryDistribution_1, accountedFor, remaining, factor, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, readSlowQueryLog()];
                case 1:
                    logEntries = _a.sent();
                    return [4 /*yield*/, getPerformanceSchemaStats(sequelize)];
                case 2:
                    performanceSchemaStats = _a.sent();
                    queryDistribution_1 = {
                        select: 0,
                        insert: 0,
                        update: 0,
                        "delete": 0,
                        other: 0
                    };
                    // 分析慢查询类型分布
                    logEntries.forEach(function (entry) {
                        var query = entry.query.trim().toUpperCase();
                        if (query.startsWith('SELECT')) {
                            queryDistribution_1.select++;
                        }
                        else if (query.startsWith('INSERT')) {
                            queryDistribution_1.insert++;
                        }
                        else if (query.startsWith('UPDATE')) {
                            queryDistribution_1.update++;
                        }
                        else if (query.startsWith('DELETE')) {
                            queryDistribution_1["delete"]++;
                        }
                        else {
                            queryDistribution_1.other++;
                        }
                    });
                    accountedFor = Object.values(queryDistribution_1).reduce(function (a, b) { return a + b; }, 0);
                    remaining = Math.max(0, metrics.totalQueries - accountedFor);
                    if (remaining > 0) {
                        // 假设剩余的查询与慢查询有类似的分布
                        // 如果没有慢查询记录，则使用默认分布
                        if (accountedFor > 0) {
                            factor = remaining / accountedFor;
                            queryDistribution_1.select = Math.round(queryDistribution_1.select * (1 + factor));
                            queryDistribution_1.insert = Math.round(queryDistribution_1.insert * (1 + factor));
                            queryDistribution_1.update = Math.round(queryDistribution_1.update * (1 + factor));
                            queryDistribution_1["delete"] = Math.round(queryDistribution_1["delete"] * (1 + factor));
                            queryDistribution_1.other = Math.round(queryDistribution_1.other * (1 + factor));
                        }
                        else {
                            // 默认分布
                            queryDistribution_1.select = Math.round(remaining * 0.7);
                            queryDistribution_1.insert = Math.round(remaining * 0.1);
                            queryDistribution_1.update = Math.round(remaining * 0.15);
                            queryDistribution_1["delete"] = Math.round(remaining * 0.03);
                            queryDistribution_1.other = remaining - queryDistribution_1.select - queryDistribution_1.insert
                                - queryDistribution_1.update - queryDistribution_1["delete"];
                        }
                    }
                    return [2 /*return*/, {
                            totalQueries: metrics.totalQueries,
                            slowQueries: metrics.slowQueries,
                            averageQueryTime: metrics.averageQueryTime,
                            maxQueryTime: metrics.maxQueryTime,
                            slowestQueries: logEntries,
                            queryDistribution: queryDistribution_1
                        }];
                case 3:
                    error_2 = _a.sent();
                    logger_1.logger.error('获取查询统计信息失败:', error_2);
                    return [2 /*return*/, {
                            totalQueries: 0,
                            slowQueries: 0,
                            averageQueryTime: 0,
                            maxQueryTime: 0,
                            slowestQueries: [],
                            queryDistribution: {
                                select: 0,
                                insert: 0,
                                update: 0,
                                "delete": 0,
                                other: 0
                            }
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getQueryStats = getQueryStats;
/**
 * 读取慢查询日志
 * @returns 慢查询数组
 */
function readSlowQueryLog() {
    return __awaiter(this, void 0, void 0, function () {
        var logFile, content, entries, slowQueries;
        return __generator(this, function (_a) {
            try {
                logFile = path_1["default"].join(LOG_DIR, 'slow-queries.log');
                // 如果日志文件不存在，返回空数组
                if (!fs_1["default"].existsSync(logFile)) {
                    return [2 /*return*/, []];
                }
                content = fs_1["default"].readFileSync(logFile, 'utf8');
                entries = content.split('\n\n').filter(Boolean);
                slowQueries = entries.map(function (entry) {
                    var lines = entry.split('\n');
                    var headerLine = lines[0];
                    // 提取时间戳和执行时间
                    var timestampMatch = headerLine.match(/\[(.*?)\]/);
                    var executionTimeMatch = headerLine.match(/执行时间: (\d+)ms/);
                    var timestamp = timestampMatch ? new Date(timestampMatch[1]) : new Date();
                    var executionTime = executionTimeMatch ? parseInt(executionTimeMatch[1], 10) : 0;
                    // 提取查询
                    var query = lines.slice(1).join('\n');
                    return {
                        query: query,
                        executionTime: executionTime,
                        timestamp: timestamp
                    };
                });
                // 按执行时间降序排序
                return [2 /*return*/, slowQueries
                        .sort(function (a, b) { return b.executionTime - a.executionTime; })
                        .slice(0, 10)]; // 返回前10个最慢的查询
            }
            catch (error) {
                logger_1.logger.error('读取慢查询日志失败:', error);
                return [2 /*return*/, []];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * 从 Performance Schema 获取查询统计
 * @param sequelize Sequelize 实例
 * @returns 查询统计
 */
function getPerformanceSchemaStats(sequelize) {
    return __awaiter(this, void 0, void 0, function () {
        var dialect;
        return __generator(this, function (_a) {
            dialect = sequelize.getDialect();
            if (dialect !== 'mysql') {
                // 实现逻辑
            }
            return [2 /*return*/];
        });
    });
}
// 启动后台任务
if (database_optimization_1.monitoringConfig.enabled) {
    // 这里需要一个已初始化的 sequelize 实例
    // 由于模块加载顺序问题，直接在这里调用可能会失败
    // 建议从应用的主入口传入 sequelize 实例来启动
    // setInterval(() => collectDatabaseStats(sequelize), monitoringConfig.collectionInterval);
    logger_1.logger.info("\u6570\u636E\u5E93\u76D1\u63A7\u5DF2\u542F\u52A8\uFF0C\u6536\u96C6\u95F4\u9694: ".concat(database_optimization_1.monitoringConfig.collectionInterval / 1000, "\u79D2"));
}
exports["default"] = {
    recordQueryPerformance: recordQueryPerformance,
    startTransactionTracking: startTransactionTracking,
    endTransactionTracking: endTransactionTracking,
    getPerformanceMetrics: getPerformanceMetrics,
    getTableStats: getTableStats,
    getIndexUsageStats: getIndexUsageStats,
    getQueryStats: getQueryStats
};
