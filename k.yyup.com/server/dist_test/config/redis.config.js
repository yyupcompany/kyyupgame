"use strict";
/**
 * Redis配置文件
 *
 * 支持三种模式：
 * 1. Standalone - 单机模式（开发环境）
 * 2. Sentinel - 哨兵模式（生产环境推荐）
 * 3. Cluster - 集群模式（大规模部署）
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
exports.__esModule = true;
exports.RedisKeyPrefix = exports.RedisTTL = exports.toRedisClientOptions = exports.getRedisConfig = exports.RedisMode = void 0;
// Redis连接模式
var RedisMode;
(function (RedisMode) {
    RedisMode["STANDALONE"] = "standalone";
    RedisMode["SENTINEL"] = "sentinel";
    RedisMode["CLUSTER"] = "cluster";
})(RedisMode = exports.RedisMode || (exports.RedisMode = {}));
/**
 * 获取Redis配置
 */
function getRedisConfig() {
    var _a, _b;
    var mode = (process.env.REDIS_MODE || RedisMode.STANDALONE);
    var config = {
        mode: mode,
        options: {
            connectTimeout: 30000,
            commandTimeout: 10000,
            maxRetriesPerRequest: 5,
            retryStrategy: function (retries) {
                if (retries > 20) { // 增加最大重试次数
                    return new Error('Redis连接重试次数过多');
                }
                return Math.min(retries * 100, 5000); // 更长的重试间隔，最多等待5秒
            }
        }
    };
    // 根据模式配置
    switch (mode) {
        case RedisMode.STANDALONE:
            config.standalone = {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD,
                db: parseInt(process.env.REDIS_DB || '0')
            };
            break;
        case RedisMode.SENTINEL:
            var sentinelHosts = ((_a = process.env.REDIS_SENTINEL_HOSTS) === null || _a === void 0 ? void 0 : _a.split(',')) || [];
            config.sentinel = {
                sentinels: sentinelHosts.map(function (host) {
                    var _a = host.split(':'), h = _a[0], p = _a[1];
                    return { host: h, port: parseInt(p || '26379') };
                }),
                name: process.env.REDIS_SENTINEL_NAME || 'mymaster',
                password: process.env.REDIS_PASSWORD,
                db: parseInt(process.env.REDIS_DB || '0')
            };
            break;
        case RedisMode.CLUSTER:
            var clusterNodes = ((_b = process.env.REDIS_CLUSTER_NODES) === null || _b === void 0 ? void 0 : _b.split(',')) || [];
            config.cluster = {
                nodes: clusterNodes.map(function (node) {
                    var _a = node.split(':'), h = _a[0], p = _a[1];
                    return { host: h, port: parseInt(p || '6379') };
                }),
                password: process.env.REDIS_PASSWORD
            };
            break;
    }
    return config;
}
exports.getRedisConfig = getRedisConfig;
/**
 * 转换为redis客户端配置
 */
function toRedisClientOptions(config) {
    var _a;
    var baseOptions = {
        socket: {
            connectTimeout: (_a = config.options) === null || _a === void 0 ? void 0 : _a.connectTimeout,
            reconnectStrategy: function (retries) {
                if (retries > 20) { // 与上面保持一致
                    return new Error('Redis连接重试次数过多');
                }
                return Math.min(retries * 100, 5000); // 与上面保持一致
            },
            // 添加更多稳定性配置
            keepAlive: true,
            noDelay: true
        },
        // 添加更宽松的配置
        commandsQueueMaxLength: 1000
    };
    // 根据模式配置
    switch (config.mode) {
        case RedisMode.STANDALONE:
            if (config.standalone) {
                return __assign(__assign({}, baseOptions), { socket: __assign(__assign({}, baseOptions.socket), { host: config.standalone.host, port: config.standalone.port }), password: config.standalone.password, database: config.standalone.db });
            }
            break;
        case RedisMode.SENTINEL:
            if (config.sentinel) {
                // Redis v5不直接支持Sentinel，需要使用@redis/client
                // 这里先返回第一个sentinel的配置
                var firstSentinel = config.sentinel.sentinels[0];
                return __assign(__assign({}, baseOptions), { socket: __assign(__assign({}, baseOptions.socket), { host: firstSentinel.host, port: firstSentinel.port }), password: config.sentinel.password, database: config.sentinel.db });
            }
            break;
        case RedisMode.CLUSTER:
            if (config.cluster) {
                // Redis v5的Cluster配置
                var firstNode = config.cluster.nodes[0];
                return __assign(__assign({}, baseOptions), { socket: __assign(__assign({}, baseOptions.socket), { host: firstNode.host, port: firstNode.port }), password: config.cluster.password });
            }
            break;
    }
    throw new Error("\u65E0\u6548\u7684Redis\u914D\u7F6E\u6A21\u5F0F: ".concat(config.mode));
}
exports.toRedisClientOptions = toRedisClientOptions;
/**
 * Redis缓存TTL配置（秒）
 */
exports.RedisTTL = {
    // 权限相关
    USER_PERMISSIONS: 30 * 60,
    ROLE_PERMISSIONS: 30 * 60,
    DYNAMIC_ROUTES: 30 * 60,
    PERMISSION_CHECK: 15 * 60,
    PATH_PERMISSION: 15 * 60,
    USER_PERMISSION_INFO: 30 * 60,
    // 会话管理相关
    TOKEN_BLACKLIST: 24 * 60 * 60,
    USER_SESSION: 24 * 60 * 60,
    REFRESH_TOKEN: 7 * 24 * 60 * 60,
    SESSION: 24 * 60 * 60,
    ONLINE_USER: 30 * 60,
    // 中心页面缓存
    DASHBOARD_CENTER: 5 * 60,
    DASHBOARD: 5 * 60,
    TASK_CENTER: 5 * 60,
    ACTIVITY_CENTER: 10 * 60,
    ENROLLMENT_CENTER: 10 * 60,
    PERSONNEL_CENTER: 15 * 60,
    MARKETING_CENTER: 15 * 60,
    SYSTEM_CENTER: 60 * 60,
    CUSTOMER_POOL: 10 * 60,
    CUSTOMER_POOL_CENTER: 10 * 60,
    ANALYTICS_CENTER: 30 * 60,
    FINANCE_CENTER: 15 * 60,
    SCRIPT_CENTER: 60 * 60,
    TEACHING_CENTER: 15 * 60,
    MEDIA_CENTER: 15 * 60,
    BUSINESS_CENTER: 10 * 60,
    DEFAULT_CENTER: 15 * 60,
    // 数据缓存
    USER_DETAIL: 15 * 60,
    STUDENT_DETAIL: 15 * 60,
    TEACHER_DETAIL: 15 * 60,
    CLASS_DETAIL: 15 * 60,
    ACTIVITY_DETAIL: 10 * 60,
    // 列表缓存
    LIST_SHORT: 5 * 60,
    LIST_MEDIUM: 15 * 60,
    LIST_LONG: 60 * 60,
    // 统计数据
    STATS_REALTIME: 1 * 60,
    STATS_HOURLY: 60 * 60,
    STATS_DAILY: 24 * 60 * 60,
    // 限流
    RATE_LIMIT_MINUTE: 60,
    RATE_LIMIT_HOUR: 60 * 60,
    RATE_LIMIT_DAY: 24 * 60 * 60,
    // 分布式锁
    LOCK_SHORT: 10,
    LOCK_MEDIUM: 30,
    LOCK_LONG: 5 * 60
};
/**
 * Redis Key前缀
 */
exports.RedisKeyPrefix = {
    // 权限
    USER_PERMISSIONS: 'user:permissions:',
    ROLE_PERMISSIONS: 'role:permissions:',
    DYNAMIC_ROUTES: 'user:routes:',
    PERMISSION_CHECK: 'permission:check:',
    PATH_PERMISSION: 'permission:path:',
    USER_PERMISSION_INFO: 'user:permission:info:',
    // 会话
    SESSION: 'session:',
    TOKEN_BLACKLIST: 'token:blacklist:',
    ONLINE_USER: 'online:user:',
    ONLINE_USERS_SET: 'online:users',
    // 中心页面
    CENTER: 'center:',
    TEACHER_CENTER: 'teacher-center:',
    // 数据缓存
    USER: 'user:',
    STUDENT: 'student:',
    TEACHER: 'teacher:',
    CLASS: 'class:',
    ACTIVITY: 'activity:',
    // 限流
    RATE_LIMIT: 'ratelimit:',
    // 分布式锁
    LOCK: 'lock:',
    // 排行榜
    RANKING: 'ranking:',
    // 计数器
    COUNTER: 'counter:'
};
exports["default"] = {
    getRedisConfig: getRedisConfig,
    toRedisClientOptions: toRedisClientOptions,
    RedisTTL: exports.RedisTTL,
    RedisKeyPrefix: exports.RedisKeyPrefix,
    RedisMode: RedisMode
};
