"use strict";
/**
 * 数据库性能优化配置
 *
 * 该文件集中管理数据库性能优化相关的配置参数，包括：
 * 1. 连接池优化
 * 2. 查询优化设置
 * 3. 性能监控参数
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
exports.__esModule = true;
exports.getDatabaseOptimizationConfig = exports.monitoringConfig = exports.getOptimizedSequelizeConfig = exports.queryOptimizationConfig = exports.poolConfig = void 0;
var dotenv = __importStar(require("dotenv"));
// 加载环境变量
dotenv.config();
/**
 * 连接池配置
 * - max: 最大连接数（建议根据CPU核心数和负载调整）
 * - min: 最小连接数（保持的空闲连接数）
 * - acquire: 连接获取超时时间(ms)
 * - idle: 连接空闲超时时间(ms)，超时后释放连接
 * - evict: 清除空闲连接的检查间隔(ms)
 */
exports.poolConfig = {
    development: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000,
        evict: 30000
    },
    test: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
        evict: 30000
    },
    production: {
        max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 20,
        min: process.env.DB_POOL_MIN ? parseInt(process.env.DB_POOL_MIN) : 5,
        acquire: process.env.DB_POOL_ACQUIRE ? parseInt(process.env.DB_POOL_ACQUIRE) : 60000,
        idle: process.env.DB_POOL_IDLE ? parseInt(process.env.DB_POOL_IDLE) : 10000,
        evict: process.env.DB_POOL_EVICT ? parseInt(process.env.DB_POOL_EVICT) : 30000
    }
};
/**
 * 查询优化设置
 */
exports.queryOptimizationConfig = {
    // 是否记录慢查询
    logSlowQueries: process.env.DB_LOG_SLOW_QUERIES !== 'false',
    // 慢查询阈值(ms)
    slowQueryThreshold: process.env.DB_SLOW_QUERY_THRESHOLD
        ? parseInt(process.env.DB_SLOW_QUERY_THRESHOLD)
        : 1000,
    // 是否启用查询缓存（需要额外的缓存存储，如Redis）
    enableQueryCache: process.env.DB_ENABLE_QUERY_CACHE === 'true',
    // 查询缓存过期时间(秒)
    queryCacheTTL: process.env.DB_QUERY_CACHE_TTL
        ? parseInt(process.env.DB_QUERY_CACHE_TTL)
        : 300,
    // 批量操作大小限制（防止大批量操作阻塞数据库）
    bulkOperationLimit: process.env.DB_BULK_OPERATION_LIMIT
        ? parseInt(process.env.DB_BULK_OPERATION_LIMIT)
        : 1000
};
/**
 * 生成优化后的Sequelize配置
 * @param env 环境名称
 * @returns 优化后的Sequelize配置
 */
function getOptimizedSequelizeConfig(env) {
    return {
        // 连接池优化配置
        pool: exports.poolConfig[env],
        // 自动重连设置
        retry: {
            max: 3,
            match: [/Deadlock/i, /Lock wait timeout/i] // 只在死锁和锁等待超时时重试
        },
        // 查询日志设置
        logging: env === 'production'
            ? function (sql, timing) {
                // 生产环境只记录慢查询
                if (exports.queryOptimizationConfig.logSlowQueries &&
                    timing &&
                    timing > exports.queryOptimizationConfig.slowQueryThreshold) {
                    console.warn("\u6162\u67E5\u8BE2 (".concat(timing, "ms): ").concat(sql));
                }
            }
            : env === 'test'
                ? false
                : true,
        // 设置数据库操作超时时间(ms)
        dialectOptions: {
            connectTimeout: 60000,
            // MySQL特定选项
            options: {
                requestTimeout: 300000 // 请求超时设置为5分钟
            }
        },
        // 事务隔离级别 (MySQL默认为REPEATABLE_READ)
        isolationLevel: 'READ COMMITTED',
        // 定义全局模型选项
        define: {
            // 启用软删除
            paranoid: true,
            // 自动添加时间戳字段
            timestamps: true,
            // 字段使用下划线命名
            underscored: true,
            // 冻结表名（不自动复数化）
            freezeTableName: true
        }
    };
}
exports.getOptimizedSequelizeConfig = getOptimizedSequelizeConfig;
/**
 * 监控配置
 */
exports.monitoringConfig = {
    // 是否启用监控
    enabled: process.env.DB_MONITORING_ENABLED !== 'false',
    // 监控指标收集间隔(ms)
    collectionInterval: process.env.DB_MONITORING_INTERVAL
        ? parseInt(process.env.DB_MONITORING_INTERVAL)
        : 60000,
    // 是否监控查询性能
    monitorQueries: process.env.DB_MONITOR_QUERIES !== 'false',
    // 是否监控连接池状态
    monitorPool: process.env.DB_MONITOR_POOL !== 'false',
    // 是否监控事务
    monitorTransactions: process.env.DB_MONITOR_TRANSACTIONS !== 'false',
    // 是否将性能指标写入日志文件
    logMetrics: process.env.DB_LOG_METRICS === 'true',
    // 事务监控配置
    transactions: {
        // 长时间运行事务阈值（秒）
        longRunningThresholdSeconds: process.env.DB_LONG_TRANSACTION_THRESHOLD
            ? parseInt(process.env.DB_LONG_TRANSACTION_THRESHOLD)
            : 30,
        // 自动终止超时事务
        autoKillLongTransactions: process.env.DB_AUTO_KILL_LONG_TRANSACTIONS === 'true',
        // 超时事务自动终止阈值（秒）
        autoKillThresholdSeconds: process.env.DB_AUTO_KILL_TRANSACTION_THRESHOLD
            ? parseInt(process.env.DB_AUTO_KILL_TRANSACTION_THRESHOLD)
            : 300
    }
};
/**
 * 获取当前环境的数据库优化配置
 */
function getDatabaseOptimizationConfig() {
    var env = (process.env.NODE_ENV || 'development');
    return {
        poolConfig: exports.poolConfig[env],
        queryOptimizationConfig: exports.queryOptimizationConfig,
        monitoringConfig: exports.monitoringConfig,
        sequelizeConfig: getOptimizedSequelizeConfig(env)
    };
}
exports.getDatabaseOptimizationConfig = getDatabaseOptimizationConfig;
