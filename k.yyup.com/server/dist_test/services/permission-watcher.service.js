"use strict";
/**
 * 权限变更监听服务 - 自动缓存更新
 * Permission Watcher Service - Automatic Cache Updates
 *
 * 功能：
 * 1. 监听权限表的增删改操作
 * 2. 自动触发路由缓存刷新
 * 3. 防止频繁刷新的延迟机制
 * 4. 提供变更日志和监控
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.PermissionWatcherService = void 0;
var route_cache_service_1 = require("./route-cache.service");
var permission_model_1 = require("../models/permission.model");
var role_model_1 = require("../models/role.model");
var role_permission_model_1 = require("../models/role-permission.model");
var sequelize_1 = __importDefault(require("../config/sequelize"));
var PermissionWatcherService = /** @class */ (function () {
    function PermissionWatcherService() {
    }
    /**
     * 启动权限变更监听
     */
    PermissionWatcherService.startWatching = function () {
        if (this.isWatching) {
            console.log('⚠️ 权限监听服务已在运行');
            return;
        }
        console.log('👀 启动权限变更监听服务...');
        try {
            // 监听权限表变更
            this.listenToPermissionChanges();
            // 监听角色表变更
            this.listenToRoleChanges();
            // 监听角色权限关系表变更
            this.listenToRolePermissionChanges();
            // 启动定期检查 (兜底机制)
            this.startPeriodicCheck();
            this.isWatching = true;
            console.log('✅ 权限变更监听服务已启动');
            // 添加启动成功的事件记录
            this.recordChangeEvent({
                type: 'create',
                model: 'PermissionWatcher',
                instanceId: 'service',
                timestamp: Date.now(),
                details: { message: '权限变更监听服务启动成功' }
            });
        }
        catch (error) {
            console.error('❌ 启动权限监听服务失败:', error);
            this.isWatching = false;
            throw error;
        }
    };
    /**
     * 停止权限变更监听
     */
    PermissionWatcherService.stopWatching = function () {
        if (!this.isWatching)
            return;
        console.log('🛑 停止权限变更监听服务...');
        // 清除延迟刷新
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
            this.refreshTimeout = null;
        }
        this.isWatching = false;
        console.log('✅ 权限变更监听服务已停止');
    };
    /**
     * 监听权限表变更
     */
    PermissionWatcherService.listenToPermissionChanges = function () {
        var _this = this;
        console.log('🔗 设置权限表变更监听...');
        // 权限创建
        permission_model_1.Permission.addHook('afterCreate', function (instance, options) {
            _this.onPermissionChanged('create', 'Permission', instance.id, {
                name: instance.name,
                code: instance.code,
                path: instance.path,
                type: instance.type
            });
        });
        // 权限更新
        permission_model_1.Permission.addHook('afterUpdate', function (instance, options) {
            _this.onPermissionChanged('update', 'Permission', instance.id, {
                name: instance.name,
                code: instance.code,
                path: instance.path,
                type: instance.type,
                changed: options.fields || []
            });
        });
        // 权限删除
        permission_model_1.Permission.addHook('afterDestroy', function (instance, options) {
            _this.onPermissionChanged('destroy', 'Permission', instance.id, {
                name: instance.name,
                code: instance.code
            });
        });
        // 批量操作监听
        permission_model_1.Permission.addHook('afterBulkCreate', function (instances, options) {
            console.log("\uD83D\uDCDD \u6279\u91CF\u521B\u5EFA\u6743\u9650: ".concat(instances.length, " \u6761"));
            _this.scheduleRefresh();
        });
        permission_model_1.Permission.addHook('afterBulkUpdate', function (options) {
            console.log('📝 批量更新权限');
            _this.scheduleRefresh();
        });
        permission_model_1.Permission.addHook('afterBulkDestroy', function (options) {
            console.log('📝 批量删除权限');
            _this.scheduleRefresh();
        });
    };
    /**
     * 监听角色表变更
     */
    PermissionWatcherService.listenToRoleChanges = function () {
        var _this = this;
        console.log('🔗 设置角色表变更监听...');
        role_model_1.Role.addHook('afterCreate', function (instance) {
            _this.onPermissionChanged('create', 'Role', instance.id, {
                name: instance.name,
                code: instance.code
            });
        });
        role_model_1.Role.addHook('afterUpdate', function (instance) {
            _this.onPermissionChanged('update', 'Role', instance.id, {
                name: instance.name,
                code: instance.code
            });
        });
        role_model_1.Role.addHook('afterDestroy', function (instance) {
            _this.onPermissionChanged('destroy', 'Role', instance.id, {
                name: instance.name,
                code: instance.code
            });
        });
    };
    /**
     * 监听角色权限关系表变更
     */
    PermissionWatcherService.listenToRolePermissionChanges = function () {
        var _this = this;
        console.log('🔗 设置角色权限关系表变更监听...');
        role_permission_model_1.RolePermission.addHook('afterCreate', function (instance) {
            _this.onPermissionChanged('create', 'RolePermission', instance.id, {
                roleId: instance.roleId,
                permissionId: instance.permissionId
            });
        });
        role_permission_model_1.RolePermission.addHook('afterDestroy', function (instance) {
            _this.onPermissionChanged('destroy', 'RolePermission', instance.id, {
                roleId: instance.roleId,
                permissionId: instance.permissionId
            });
        });
    };
    /**
     * 权限变更回调处理
     */
    PermissionWatcherService.onPermissionChanged = function (type, model, instanceId, details) {
        console.log("\uD83D\uDCDD \u68C0\u6D4B\u5230".concat(model, "\u53D8\u66F4: ").concat(type, " - ID: ").concat(instanceId));
        // 记录变更事件
        this.recordChangeEvent({
            type: type,
            model: model,
            instanceId: instanceId,
            timestamp: Date.now(),
            details: details
        });
        // 延迟刷新缓存
        this.scheduleRefresh();
    };
    /**
     * 记录变更事件
     */
    PermissionWatcherService.recordChangeEvent = function (event) {
        this.changeEvents.push(event);
        // 保持事件列表大小
        if (this.changeEvents.length > this.MAX_EVENTS) {
            this.changeEvents = this.changeEvents.slice(-this.MAX_EVENTS);
        }
    };
    /**
     * 延迟调度缓存刷新
     */
    PermissionWatcherService.scheduleRefresh = function () {
        var _this = this;
        // 清除之前的延迟刷新
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
        }
        // 设置新的延迟刷新
        this.refreshTimeout = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        console.log('🔄 权限变更触发，开始刷新路由缓存...');
                        return [4 /*yield*/, route_cache_service_1.RouteCacheService.refreshCache()];
                    case 1:
                        _a.sent();
                        console.log('✅ 权限变更响应完成，路由缓存已更新');
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ 权限变更响应失败:', error_1);
                        return [3 /*break*/, 4];
                    case 3:
                        this.refreshTimeout = null;
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); }, this.REFRESH_DELAY);
        console.log("\u23F1\uFE0F \u5DF2\u8C03\u5EA6\u7F13\u5B58\u5237\u65B0\uFF0C\u5C06\u5728 ".concat(this.REFRESH_DELAY, "ms \u540E\u6267\u884C"));
    };
    /**
     * 立即刷新缓存 (紧急情况使用)
     */
    PermissionWatcherService.forceRefresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('⚡ 强制立即刷新路由缓存...');
                        // 清除延迟刷新
                        if (this.refreshTimeout) {
                            clearTimeout(this.refreshTimeout);
                            this.refreshTimeout = null;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, route_cache_service_1.RouteCacheService.refreshCache()];
                    case 2:
                        _a.sent();
                        console.log('✅ 强制刷新完成');
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('❌ 强制刷新失败:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 启动定期检查 (兜底机制)
     */
    PermissionWatcherService.startPeriodicCheck = function () {
        var _this = this;
        // 每5分钟检查一次权限表更新时间
        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var lastModified, cacheTime, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getPermissionLastModified()];
                    case 1:
                        lastModified = _a.sent();
                        cacheTime = route_cache_service_1.RouteCacheService.getLastLoadTime();
                        if (!(lastModified > cacheTime + 60000)) return [3 /*break*/, 3];
                        console.log('🔄 定期检查发现权限数据变更，触发缓存刷新...');
                        return [4 /*yield*/, route_cache_service_1.RouteCacheService.refreshCache()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        console.warn('⚠️ 定期权限检查失败:', error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); }, 5 * 60 * 1000); // 5分钟
    };
    /**
     * 获取权限表最后修改时间
     */
    PermissionWatcherService.getPermissionLastModified = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var result, lastModified, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        // 检查sequelize是否可用
                        if (!sequelize_1["default"] || typeof sequelize_1["default"].query !== 'function') {
                            console.warn('⚠️ Sequelize未正确初始化，跳过权限表检查');
                            return [2 /*return*/, 0];
                        }
                        return [4 /*yield*/, sequelize_1["default"].query("\n        SELECT MAX(updated_at) as lastModified\n        FROM permissions\n        WHERE status = 1\n      ")];
                    case 1:
                        result = _b.sent();
                        lastModified = (_a = result[0][0]) === null || _a === void 0 ? void 0 : _a.lastModified;
                        return [2 /*return*/, lastModified ? new Date(lastModified).getTime() : 0];
                    case 2:
                        error_4 = _b.sent();
                        console.warn('⚠️ 获取权限表更新时间失败:', error_4);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取变更事件列表
     */
    PermissionWatcherService.getChangeEvents = function (limit) {
        if (limit === void 0) { limit = 20; }
        return this.changeEvents.slice(-limit).reverse(); // 最新的在前面
    };
    /**
     * 获取监听状态
     */
    PermissionWatcherService.getWatcherStatus = function () {
        var lastEvent = this.changeEvents[this.changeEvents.length - 1];
        return {
            isWatching: this.isWatching,
            eventCount: this.changeEvents.length,
            lastEventTime: (lastEvent === null || lastEvent === void 0 ? void 0 : lastEvent.timestamp) || null,
            refreshScheduled: this.refreshTimeout !== null
        };
    };
    /**
     * 清空变更事件记录
     */
    PermissionWatcherService.clearChangeEvents = function () {
        this.changeEvents = [];
        console.log('🗑️ 已清空权限变更事件记录');
    };
    PermissionWatcherService.isWatching = false;
    PermissionWatcherService.refreshTimeout = null;
    PermissionWatcherService.changeEvents = [];
    PermissionWatcherService.REFRESH_DELAY = 2000; // 2秒延迟，避免频繁刷新
    PermissionWatcherService.MAX_EVENTS = 100; // 最多保留100个变更事件
    return PermissionWatcherService;
}());
exports.PermissionWatcherService = PermissionWatcherService;
