"use strict";
/**
 * Redis服务封装
 *
 * 提供统一的Redis操作接口，支持：
 * - 基础操作（get, set, del, exists, expire）
 * - Hash操作（hset, hget, hgetall, hdel）
 * - Set操作（sadd, smembers, sismember, srem）
 * - 分布式锁（acquireLock, releaseLock）
 * - 计数器（incr, decr）
 * - 批量操作（mget, mset, del）
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
var redis_1 = require("redis");
var redis_config_1 = require("../config/redis.config");
var RedisService = /** @class */ (function () {
    function RedisService() {
        this.client = null;
        this.isConnected = false;
        this.connectionPromise = null;
    }
    /**
     * 获取单例实例
     */
    RedisService.getInstance = function () {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    };
    /**
     * 检查Redis是否已连接
     */
    RedisService.prototype.getIsConnected = function () {
        return this.isConnected;
    };
    /**
     * 连接Redis
     */
    RedisService.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isConnected && this.client) {
                    return [2 /*return*/];
                }
                // 如果正在连接，等待连接完成
                if (this.connectionPromise) {
                    return [2 /*return*/, this.connectionPromise];
                }
                this.connectionPromise = this._connect();
                return [2 /*return*/, this.connectionPromise];
            });
        });
    };
    RedisService.prototype._connect = function () {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var config, options, connectError_1, error_1;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 5, , 6]);
                        config = (0, redis_config_1.getRedisConfig)();
                        options = (0, redis_config_1.toRedisClientOptions)(config);
                        console.log('🔌 正在连接Redis...', {
                            mode: config.mode,
                            host: ((_a = config.standalone) === null || _a === void 0 ? void 0 : _a.host) || 'N/A',
                            port: ((_b = config.standalone) === null || _b === void 0 ? void 0 : _b.port) || 'N/A',
                            hasPassword: !!((_c = config.standalone) === null || _c === void 0 ? void 0 : _c.password)
                        });
                        console.log('🔑 Redis配置:', {
                            password: ((_d = config.standalone) === null || _d === void 0 ? void 0 : _d.password) ? '***已设置***' : '未设置',
                            db: (_e = config.standalone) === null || _e === void 0 ? void 0 : _e.db
                        });
                        this.client = (0, redis_1.createClient)(options);
                        // 错误处理 - 更宽松的错误处理
                        this.client.on('error', function (err) {
                            console.warn('⚠️ Redis错误 (将继续尝试重连):', err.message);
                            // 不要立即设置 isConnected = false，让重连机制处理
                        });
                        // 连接成功
                        this.client.on('connect', function () {
                            console.log('✅ Redis连接成功');
                            _this.isConnected = true;
                        });
                        // 准备就绪
                        this.client.on('ready', function () {
                            console.log('🎯 Redis准备就绪');
                            _this.isConnected = true;
                        });
                        // 重连
                        this.client.on('reconnecting', function () {
                            console.log('🔄 Redis重新连接中...');
                            _this.isConnected = false;
                        });
                        // 断开连接
                        this.client.on('end', function () {
                            console.log('🔌 Redis连接已断开');
                            _this.isConnected = false;
                        });
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.connect()];
                    case 2:
                        _f.sent();
                        this.isConnected = true;
                        this.connectionPromise = null;
                        console.log('🎉 Redis服务初始化完成');
                        return [3 /*break*/, 4];
                    case 3:
                        connectError_1 = _f.sent();
                        this.connectionPromise = null;
                        console.warn('⚠️ Redis初始连接失败，但服务将继续运行:', connectError_1.message);
                        console.log('💡 Redis将在需要时自动重连');
                        // 不抛出错误，让应用继续运行
                        this.isConnected = false;
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _f.sent();
                        this.connectionPromise = null;
                        console.error('❌ Redis配置错误:', error_1);
                        // 只有配置错误才抛出异常
                        if (error_1.message.includes('配置') || error_1.message.includes('config')) {
                            throw error_1;
                        }
                        // 连接错误不阻止应用启动
                        console.log('💡 应用将在无Redis缓存模式下运行');
                        this.isConnected = false;
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 断开连接
     */
    RedisService.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.client && this.isConnected)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.quit()];
                    case 1:
                        _a.sent();
                        this.isConnected = false;
                        this.client = null;
                        console.log('👋 Redis连接已关闭');
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 确保已连接 - 优化版本，更好的错误处理
     */
    RedisService.prototype.ensureConnected = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.isConnected || !this.client)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.connect()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.warn('⚠️ Redis连接失败，某些功能可能不可用:', error_2);
                        throw new Error('Redis服务不可用');
                    case 4:
                        if (!this.client) {
                            throw new Error('Redis客户端未初始化');
                        }
                        return [2 /*return*/, this.client];
                }
            });
        });
    };
    // ==================== 健康检查 ====================
    /**
     * Redis健康检查
     */
    RedisService.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var start, client, result, latency, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        start = Date.now();
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.ping()];
                    case 2:
                        result = _a.sent();
                        latency = Date.now() - start;
                        if (result === 'PONG') {
                            return [2 /*return*/, {
                                    status: 'up',
                                    message: 'Redis连接正常',
                                    latency: latency
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    status: 'down',
                                    message: 'Redis ping响应异常'
                                }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                status: 'down',
                                message: "Redis\u8FDE\u63A5\u5931\u8D25: ".concat(error_3)
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取Redis信息
     */
    RedisService.prototype.getInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, info, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.info()];
                    case 2:
                        info = _a.sent();
                        return [2 /*return*/, info];
                    case 3:
                        error_4 = _a.sent();
                        console.error('获取Redis信息失败:', error_4);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 基础操作 ====================
    /**
     * 获取值
     */
    RedisService.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client, value, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.get(key)];
                    case 2:
                        value = _a.sent();
                        if (value === null) {
                            return [2 /*return*/, null];
                        }
                        // 尝试解析JSON
                        try {
                            return [2 /*return*/, JSON.parse(value)];
                        }
                        catch (_b) {
                            return [2 /*return*/, value];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error("Redis GET\u9519\u8BEF [".concat(key, "]:"), error_5);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 设置值
     */
    RedisService.prototype.set = function (key, value, ttl) {
        return __awaiter(this, void 0, void 0, function () {
            var client, stringValue, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                        if (!ttl) return [3 /*break*/, 3];
                        return [4 /*yield*/, client.setEx(key, ttl, stringValue)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, client.set(key, stringValue)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, true];
                    case 6:
                        error_6 = _a.sent();
                        console.error("Redis SET\u9519\u8BEF [".concat(key, "]:"), error_6);
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除键
     */
    RedisService.prototype.del = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client, keys, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        keys = Array.isArray(key) ? key : [key];
                        return [4 /*yield*/, client.del(keys)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_7 = _a.sent();
                        console.error("Redis DEL\u9519\u8BEF:", error_7);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查键是否存在
     */
    RedisService.prototype.exists = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client, result, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.exists(key)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result === 1];
                    case 3:
                        error_8 = _a.sent();
                        console.error("Redis EXISTS\u9519\u8BEF [".concat(key, "]:"), error_8);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 设置过期时间
     */
    RedisService.prototype.expire = function (key, seconds) {
        return __awaiter(this, void 0, void 0, function () {
            var client, result, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.expire(key, seconds)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result === 1];
                    case 3:
                        error_9 = _a.sent();
                        console.error("Redis EXPIRE\u9519\u8BEF [".concat(key, "]:"), error_9);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取剩余过期时间
     */
    RedisService.prototype.ttl = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.ttl(key)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_10 = _a.sent();
                        console.error("Redis TTL\u9519\u8BEF [".concat(key, "]:"), error_10);
                        return [2 /*return*/, -2];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== Hash操作 ====================
    /**
     * 设置Hash字段
     */
    RedisService.prototype.hset = function (key, field, value) {
        return __awaiter(this, void 0, void 0, function () {
            var client, stringValue, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                        return [4 /*yield*/, client.hSet(key, field, stringValue)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_11 = _a.sent();
                        console.error("Redis HSET\u9519\u8BEF [".concat(key, ".").concat(field, "]:"), error_11);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取Hash字段
     */
    RedisService.prototype.hget = function (key, field) {
        return __awaiter(this, void 0, void 0, function () {
            var client, value, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.hGet(key, field)];
                    case 2:
                        value = _a.sent();
                        if (value === undefined || value === null) {
                            return [2 /*return*/, null];
                        }
                        try {
                            return [2 /*return*/, JSON.parse(value)];
                        }
                        catch (_b) {
                            return [2 /*return*/, value];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_12 = _a.sent();
                        console.error("Redis HGET\u9519\u8BEF [".concat(key, ".").concat(field, "]:"), error_12);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取Hash所有字段
     */
    RedisService.prototype.hgetall = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client, data, result, _i, _a, _b, field, value, error_13;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _c.sent();
                        return [4 /*yield*/, client.hGetAll(key)];
                    case 2:
                        data = _c.sent();
                        if (!data || Object.keys(data).length === 0) {
                            return [2 /*return*/, null];
                        }
                        result = {};
                        for (_i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
                            _b = _a[_i], field = _b[0], value = _b[1];
                            try {
                                result[field] = JSON.parse(value);
                            }
                            catch (_d) {
                                result[field] = value;
                            }
                        }
                        return [2 /*return*/, result];
                    case 3:
                        error_13 = _c.sent();
                        console.error("Redis HGETALL\u9519\u8BEF [".concat(key, "]:"), error_13);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除Hash字段
     */
    RedisService.prototype.hdel = function (key, field) {
        return __awaiter(this, void 0, void 0, function () {
            var client, fields, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        fields = Array.isArray(field) ? field : [field];
                        return [4 /*yield*/, client.hDel(key, fields)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_14 = _a.sent();
                        console.error("Redis HDEL\u9519\u8BEF [".concat(key, "]:"), error_14);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== Set操作 ====================
    /**
     * 添加Set成员
     */
    RedisService.prototype.sadd = function (key) {
        var members = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            members[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var client, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.sAdd(key, members)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_15 = _a.sent();
                        console.error("Redis SADD\u9519\u8BEF [".concat(key, "]:"), error_15);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取Set所有成员
     */
    RedisService.prototype.smembers = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.sMembers(key)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_16 = _a.sent();
                        console.error("Redis SMEMBERS\u9519\u8BEF [".concat(key, "]:"), error_16);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查Set成员是否存在
     */
    RedisService.prototype.sismember = function (key, member) {
        return __awaiter(this, void 0, void 0, function () {
            var client, result, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.sIsMember(key, member)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, Boolean(result)];
                    case 3:
                        error_17 = _a.sent();
                        console.error("Redis SISMEMBER\u9519\u8BEF [".concat(key, "]:"), error_17);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除Set成员
     */
    RedisService.prototype.srem = function (key) {
        var members = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            members[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var client, error_18;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.sRem(key, members)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_18 = _a.sent();
                        console.error("Redis SREM\u9519\u8BEF [".concat(key, "]:"), error_18);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取Set成员数量
     */
    RedisService.prototype.scard = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.sCard(key)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_19 = _a.sent();
                        console.error("Redis SCARD\u9519\u8BEF [".concat(key, "]:"), error_19);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 计数器操作 ====================
    /**
     * 递增
     */
    RedisService.prototype.incr = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_20;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.incr(key)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_20 = _a.sent();
                        console.error("Redis INCR\u9519\u8BEF [".concat(key, "]:"), error_20);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 递减
     */
    RedisService.prototype.decr = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_21;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.decr(key)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_21 = _a.sent();
                        console.error("Redis DECR\u9519\u8BEF [".concat(key, "]:"), error_21);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 增加指定值
     */
    RedisService.prototype.incrby = function (key, increment) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_22;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.incrBy(key, increment)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_22 = _a.sent();
                        console.error("Redis INCRBY\u9519\u8BEF [".concat(key, "]:"), error_22);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 分布式锁操作 ====================
    /**
     * 获取分布式锁
     * @param key 锁的键名
     * @param ttl 锁的过期时间（秒）
     * @param retryTimes 重试次数
     * @param retryDelay 重试延迟（毫秒）
     */
    RedisService.prototype.acquireLock = function (key, ttl, retryTimes, retryDelay) {
        if (ttl === void 0) { ttl = 30; }
        if (retryTimes === void 0) { retryTimes = 3; }
        if (retryDelay === void 0) { retryDelay = 100; }
        return __awaiter(this, void 0, void 0, function () {
            var client, lockKey, lockValue, i, result, error_23;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        lockKey = "lock:".concat(key);
                        lockValue = "".concat(Date.now(), "-").concat(Math.random());
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < retryTimes)) return [3 /*break*/, 6];
                        return [4 /*yield*/, client.set(lockKey, lockValue, {
                                NX: true,
                                EX: ttl
                            })];
                    case 3:
                        result = _a.sent();
                        if (result === 'OK') {
                            console.log("\uD83D\uDD12 \u83B7\u53D6\u9501\u6210\u529F [".concat(key, "]"));
                            return [2 /*return*/, true];
                        }
                        if (!(i < retryTimes - 1)) return [3 /*break*/, 5];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, retryDelay); })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 2];
                    case 6:
                        console.log("\u274C \u83B7\u53D6\u9501\u5931\u8D25 [".concat(key, "]\uFF0C\u5DF2\u91CD\u8BD5").concat(retryTimes, "\u6B21"));
                        return [2 /*return*/, false];
                    case 7:
                        error_23 = _a.sent();
                        console.error("Redis LOCK\u9519\u8BEF [".concat(key, "]:"), error_23);
                        return [2 /*return*/, false];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 释放分布式锁
     */
    RedisService.prototype.releaseLock = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client, lockKey, result, error_24;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        lockKey = "lock:".concat(key);
                        return [4 /*yield*/, client.del(lockKey)];
                    case 2:
                        result = _a.sent();
                        if (result > 0) {
                            console.log("\uD83D\uDD13 \u91CA\u653E\u9501\u6210\u529F [".concat(key, "]"));
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                    case 3:
                        error_24 = _a.sent();
                        console.error("Redis UNLOCK\u9519\u8BEF [".concat(key, "]:"), error_24);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 批量操作 ====================
    /**
     * 批量获取
     */
    RedisService.prototype.mget = function (keys) {
        return __awaiter(this, void 0, void 0, function () {
            var client, values, error_25;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.mGet(keys)];
                    case 2:
                        values = _a.sent();
                        return [2 /*return*/, values.map(function (value) {
                                if (value === null || value === undefined) {
                                    return null;
                                }
                                try {
                                    return JSON.parse(value);
                                }
                                catch (_a) {
                                    return value;
                                }
                            })];
                    case 3:
                        error_25 = _a.sent();
                        console.error("Redis MGET\u9519\u8BEF:", error_25);
                        return [2 /*return*/, keys.map(function () { return null; })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量设置
     */
    RedisService.prototype.mset = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var client, pairs, error_26;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        pairs = Object.entries(data).map(function (_a) {
                            var key = _a[0], value = _a[1];
                            return [
                                key,
                                typeof value === 'string' ? value : JSON.stringify(value)
                            ];
                        });
                        return [4 /*yield*/, client.mSet(pairs)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_26 = _a.sent();
                        console.error("Redis MSET\u9519\u8BEF:", error_26);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 按模式删除键
     */
    RedisService.prototype.delPattern = function (pattern) {
        return __awaiter(this, void 0, void 0, function () {
            var client, keys, error_27;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.keys(pattern)];
                    case 2:
                        keys = _a.sent();
                        if (keys.length === 0) {
                            return [2 /*return*/, 0];
                        }
                        return [4 /*yield*/, client.del(keys)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_27 = _a.sent();
                        console.error("Redis DEL PATTERN\u9519\u8BEF [".concat(pattern, "]:"), error_27);
                        return [2 /*return*/, 0];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== Sorted Set操作 ====================
    /**
     * 添加Sorted Set成员
     */
    RedisService.prototype.zadd = function (key, score, member) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_28;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.zAdd(key, { score: score, value: member })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_28 = _a.sent();
                        console.error("Redis ZADD\u9519\u8BEF [".concat(key, "]:"), error_28);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取Sorted Set范围
     */
    RedisService.prototype.zrange = function (key, start, stop, withScores) {
        if (withScores === void 0) { withScores = false; }
        return __awaiter(this, void 0, void 0, function () {
            var client, error_29;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        if (!withScores) return [3 /*break*/, 3];
                        return [4 /*yield*/, client.zRangeWithScores(key, start, stop)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [4 /*yield*/, client.zRange(key, start, stop)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_29 = _a.sent();
                        console.error("Redis ZRANGE\u9519\u8BEF [".concat(key, "]:"), error_29);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除Sorted Set成员
     */
    RedisService.prototype.zrem = function (key) {
        var members = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            members[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var client, error_30;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.zRem(key, members)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_30 = _a.sent();
                        console.error("Redis ZREM\u9519\u8BEF [".concat(key, "]:"), error_30);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 增加Sorted Set成员分数
     */
    RedisService.prototype.zincrby = function (key, increment, member) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_31;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.zIncrBy(key, increment, member)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_31 = _a.sent();
                        console.error("Redis ZINCRBY\u9519\u8BEF [".concat(key, "]:"), error_31);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取Sorted Set范围（从高到低）
     */
    RedisService.prototype.zrevrange = function (key, start, stop, withScores) {
        if (withScores === void 0) { withScores = false; }
        return __awaiter(this, void 0, void 0, function () {
            var client, results, flattened_1, error_32;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        if (!withScores) return [3 /*break*/, 3];
                        return [4 /*yield*/, client.zRangeWithScores(key, start, stop, { REV: true })];
                    case 2:
                        results = _a.sent();
                        flattened_1 = [];
                        results.forEach(function (item) {
                            flattened_1.push(item.value, item.score.toString());
                        });
                        return [2 /*return*/, flattened_1];
                    case 3: return [4 /*yield*/, client.zRange(key, start, stop, { REV: true })];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_32 = _a.sent();
                        console.error("Redis ZREVRANGE\u9519\u8BEF [".concat(key, "]:"), error_32);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取成员排名（从高到低）
     */
    RedisService.prototype.zrevrank = function (key, member) {
        return __awaiter(this, void 0, void 0, function () {
            var client, result, error_33;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.zRevRank(key, member)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result !== null ? Number(result) : null];
                    case 3:
                        error_33 = _a.sent();
                        console.error("Redis ZREVRANK\u9519\u8BEF [".concat(key, "]:"), error_33);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取成员分数
     */
    RedisService.prototype.zscore = function (key, member) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_34;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.zScore(key, member)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_34 = _a.sent();
                        console.error("Redis ZSCORE\u9519\u8BEF [".concat(key, "]:"), error_34);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取Sorted Set成员数量
     */
    RedisService.prototype.zcard = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_35;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.zCard(key)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_35 = _a.sent();
                        console.error("Redis ZCARD\u9519\u8BEF [".concat(key, "]:"), error_35);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 按分数范围获取成员
     */
    RedisService.prototype.zrangebyscore = function (key, min, max, withScores) {
        if (withScores === void 0) { withScores = false; }
        return __awaiter(this, void 0, void 0, function () {
            var client, results, flattened_2, error_36;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        if (!withScores) return [3 /*break*/, 3];
                        return [4 /*yield*/, client.zRangeByScoreWithScores(key, min, max)];
                    case 2:
                        results = _a.sent();
                        flattened_2 = [];
                        results.forEach(function (item) {
                            flattened_2.push(item.value, item.score.toString());
                        });
                        return [2 /*return*/, flattened_2];
                    case 3: return [4 /*yield*/, client.zRangeByScore(key, min, max)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_36 = _a.sent();
                        console.error("Redis ZRANGEBYSCORE\u9519\u8BEF [".concat(key, "]:"), error_36);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 按排名范围删除成员
     */
    RedisService.prototype.zremrangebyrank = function (key, start, stop) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_37;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.zRemRangeByRank(key, start, stop)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_37 = _a.sent();
                        console.error("Redis ZREMRANGEBYRANK\u9519\u8BEF [".concat(key, "]:"), error_37);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 工具方法 ====================
    /**
     * 获取所有匹配的键
     */
    RedisService.prototype.keys = function (pattern) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_38;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.keys(pattern)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_38 = _a.sent();
                        console.error("Redis KEYS\u9519\u8BEF [".concat(pattern, "]:"), error_38);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清空当前数据库
     */
    RedisService.prototype.flushdb = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_39;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.flushDb()];
                    case 2:
                        _a.sent();
                        console.log('🗑️  Redis数据库已清空');
                        return [2 /*return*/, true];
                    case 3:
                        error_39 = _a.sent();
                        console.error("Redis FLUSHDB\u9519\u8BEF:", error_39);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取Redis信息
     */
    RedisService.prototype.info = function (section) {
        return __awaiter(this, void 0, void 0, function () {
            var client, error_40;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.info(section)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_40 = _a.sent();
                        console.error("Redis INFO\u9519\u8BEF:", error_40);
                        return [2 /*return*/, ''];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Ping测试
     */
    RedisService.prototype.ping = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, result, error_41;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.ping()];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result === 'PONG'];
                    case 3:
                        error_41 = _a.sent();
                        console.error("Redis PING\u9519\u8BEF:", error_41);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除key（别名方法）
     */
    RedisService.prototype["delete"] = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.del(key)];
            });
        });
    };
    /**
     * 扫描所有匹配的key
     * 注意：这是一个便捷方法，会自动处理SCAN迭代
     */
    RedisService.prototype.scanAllKeys = function (pattern, batchSize) {
        if (pattern === void 0) { pattern = '*'; }
        if (batchSize === void 0) { batchSize = 100; }
        return __awaiter(this, void 0, void 0, function () {
            var client, keys, cursor, result, error_42;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        client = _a.sent();
                        keys = [];
                        cursor = 0;
                        _a.label = 2;
                    case 2: return [4 /*yield*/, client.scan(cursor, {
                            MATCH: pattern,
                            COUNT: batchSize
                        })];
                    case 3:
                        result = _a.sent();
                        cursor = Number(result.cursor);
                        keys.push.apply(keys, result.keys);
                        _a.label = 4;
                    case 4:
                        if (cursor !== 0) return [3 /*break*/, 2];
                        _a.label = 5;
                    case 5: return [2 /*return*/, keys];
                    case 6:
                        error_42 = _a.sent();
                        console.error("\u626B\u63CFkeys\u9519\u8BEF [pattern=".concat(pattern, "]:"), error_42);
                        throw error_42;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return RedisService;
}());
// 导出单例实例
exports["default"] = RedisService.getInstance();
