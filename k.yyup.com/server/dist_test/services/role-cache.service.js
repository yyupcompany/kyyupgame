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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.RoleCacheService = void 0;
var redis_service_1 = __importDefault(require("./redis.service"));
/**
 * 角色缓存服务
 * 为教师、admin、园长角色提供Redis缓存功能
 *
 * ⚠️ 注意：权限缓存已统一由 PermissionCacheService 管理
 * 本服务仅负责角色特定的业务数据缓存（教师班级、学生、活动等）
 */
var RoleCacheService = /** @class */ (function () {
    function RoleCacheService() {
    }
    /**
     * 获取教师数据缓存
     */
    RoleCacheService.getTeacherData = function (teacherId, dataType) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.PREFIX.TEACHER).concat(teacherId, ":").concat(dataType);
                        return [4 /*yield*/, redis_service_1["default"].get(key)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 设置教师数据缓存
     */
    RoleCacheService.setTeacherData = function (teacherId, dataType, data, ttl) {
        if (ttl === void 0) { ttl = this.TTL.MEDIUM; }
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.PREFIX.TEACHER).concat(teacherId, ":").concat(dataType);
                        return [4 /*yield*/, redis_service_1["default"].set(key, data, ttl)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取管理员数据缓存
     */
    RoleCacheService.getAdminData = function (dataType, params) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = params
                            ? "".concat(this.PREFIX.ADMIN).concat(dataType, ":").concat(JSON.stringify(params))
                            : "".concat(this.PREFIX.ADMIN).concat(dataType);
                        return [4 /*yield*/, redis_service_1["default"].get(key)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 设置管理员数据缓存
     */
    RoleCacheService.setAdminData = function (dataType, data, ttl, params) {
        if (ttl === void 0) { ttl = this.TTL.MEDIUM; }
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = params
                            ? "".concat(this.PREFIX.ADMIN).concat(dataType, ":").concat(JSON.stringify(params))
                            : "".concat(this.PREFIX.ADMIN).concat(dataType);
                        return [4 /*yield*/, redis_service_1["default"].set(key, data, ttl)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取园长数据缓存
     */
    RoleCacheService.getPrincipalData = function (principalId, dataType) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.PREFIX.PRINCIPAL).concat(principalId, ":").concat(dataType);
                        return [4 /*yield*/, redis_service_1["default"].get(key)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 设置园长数据缓存
     */
    RoleCacheService.setPrincipalData = function (principalId, dataType, data, ttl) {
        if (ttl === void 0) { ttl = this.TTL.MEDIUM; }
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.PREFIX.PRINCIPAL).concat(principalId, ":").concat(dataType);
                        return [4 /*yield*/, redis_service_1["default"].set(key, data, ttl)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // ⚠️ 权限缓存已移至 PermissionCacheService，不再在此处处理
    // 使用 PermissionCacheService.getUserPermissions() 获取权限缓存
    /**
     * 获取仪表板数据缓存
     */
    RoleCacheService.getDashboardData = function (userId, role) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.PREFIX.DASHBOARD_DATA).concat(role, ":").concat(userId);
                        return [4 /*yield*/, redis_service_1["default"].get(key)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 设置仪表板数据缓存
     */
    RoleCacheService.setDashboardData = function (userId, role, data) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.PREFIX.DASHBOARD_DATA).concat(role, ":").concat(userId);
                        return [4 /*yield*/, redis_service_1["default"].set(key, data, this.TTL.DASHBOARD)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取班级数据缓存
     */
    RoleCacheService.getClassData = function (classId) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.PREFIX.CLASS_DATA).concat(classId);
                        return [4 /*yield*/, redis_service_1["default"].get(key)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 设置班级数据缓存
     */
    RoleCacheService.setClassData = function (classId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.PREFIX.CLASS_DATA).concat(classId);
                        return [4 /*yield*/, redis_service_1["default"].set(key, data, this.TTL.MEDIUM)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取学生列表缓存
     */
    RoleCacheService.getStudentList = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.PREFIX.STUDENT_DATA, "list:").concat(JSON.stringify(params));
                        return [4 /*yield*/, redis_service_1["default"].get(key)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 设置学生列表缓存
     */
    RoleCacheService.setStudentList = function (params, data) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.PREFIX.STUDENT_DATA, "list:").concat(JSON.stringify(params));
                        return [4 /*yield*/, redis_service_1["default"].set(key, data, this.TTL.LIST)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动列表缓存
     */
    RoleCacheService.getActivityList = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.PREFIX.ACTIVITY_DATA, "list:").concat(JSON.stringify(params));
                        return [4 /*yield*/, redis_service_1["default"].get(key)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 设置活动列表缓存
     */
    RoleCacheService.setActivityList = function (params, data) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.PREFIX.ACTIVITY_DATA, "list:").concat(JSON.stringify(params));
                        return [4 /*yield*/, redis_service_1["default"].set(key, data, this.TTL.LIST)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清除教师特定用户的所有缓存
     * @param teacherId 教师ID（不是userId）
     */
    RoleCacheService.clearTeacherCache = function (teacherId) {
        return __awaiter(this, void 0, void 0, function () {
            var patterns, _i, patterns_1, pattern, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDDD1\uFE0F \u6E05\u9664\u6559\u5E08\u7F13\u5B58: teacherId=".concat(teacherId));
                        patterns = [
                            "".concat(this.PREFIX.TEACHER).concat(teacherId, ":*"),
                            "".concat(this.PREFIX.TEACHER_CLASS).concat(teacherId, ":*"),
                            "".concat(this.PREFIX.TEACHER_STUDENT).concat(teacherId, ":*"),
                            "".concat(this.PREFIX.TEACHER_ACTIVITY).concat(teacherId, ":*")
                        ];
                        _i = 0, patterns_1 = patterns;
                        _a.label = 1;
                    case 1:
                        if (!(_i < patterns_1.length)) return [3 /*break*/, 6];
                        pattern = patterns_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, redis_service_1["default"].del(pattern)];
                    case 3:
                        _a.sent();
                        console.log("\u2705 \u5DF2\u6E05\u9664\u7F13\u5B58: ".concat(pattern));
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("\u274C \u6E05\u9664\u7F13\u5B58\u5931\u8D25: ".concat(pattern), error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清除园长特定用户的所有缓存
     * @param principalId 园长ID（不是userId）
     */
    RoleCacheService.clearPrincipalCache = function (principalId) {
        return __awaiter(this, void 0, void 0, function () {
            var patterns, _i, patterns_2, pattern, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDDD1\uFE0F \u6E05\u9664\u56ED\u957F\u7F13\u5B58: principalId=".concat(principalId));
                        patterns = [
                            "".concat(this.PREFIX.PRINCIPAL).concat(principalId, ":*"),
                            "".concat(this.PREFIX.DASHBOARD_DATA, "principal:").concat(principalId, ":*")
                        ];
                        _i = 0, patterns_2 = patterns;
                        _a.label = 1;
                    case 1:
                        if (!(_i < patterns_2.length)) return [3 /*break*/, 6];
                        pattern = patterns_2[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, redis_service_1["default"].del(pattern)];
                    case 3:
                        _a.sent();
                        console.log("\u2705 \u5DF2\u6E05\u9664\u7F13\u5B58: ".concat(pattern));
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error("\u274C \u6E05\u9664\u7F13\u5B58\u5931\u8D25: ".concat(pattern), error_2);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清除所有角色相关缓存（清除整个角色的所有缓存）
     * @param role 角色类型: 'teacher' | 'admin' | 'principal'
     */
    RoleCacheService.clearRoleCache = function (role) {
        return __awaiter(this, void 0, void 0, function () {
            var pattern, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        switch (role) {
                            case 'teacher':
                                pattern = "".concat(this.PREFIX.TEACHER, "*");
                                console.log("\uD83D\uDDD1\uFE0F \u6E05\u9664\u6240\u6709\u6559\u5E08\u7F13\u5B58");
                                break;
                            case 'admin':
                                pattern = "".concat(this.PREFIX.ADMIN, "*");
                                console.log("\uD83D\uDDD1\uFE0F \u6E05\u9664\u6240\u6709\u7BA1\u7406\u5458\u7F13\u5B58");
                                break;
                            case 'principal':
                                pattern = "".concat(this.PREFIX.PRINCIPAL, "*");
                                console.log("\uD83D\uDDD1\uFE0F \u6E05\u9664\u6240\u6709\u56ED\u957F\u7F13\u5B58");
                                break;
                            default:
                                console.warn("\u26A0\uFE0F \u672A\u77E5\u7684\u89D2\u8272\u7C7B\u578B: ".concat(role));
                                return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, redis_service_1["default"].del(pattern)];
                    case 2:
                        _a.sent();
                        console.log("\u2705 \u5DF2\u6E05\u9664\u89D2\u8272\u7F13\u5B58: ".concat(role));
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error("\u274C \u6E05\u9664\u89D2\u8272\u7F13\u5B58\u5931\u8D25: ".concat(role), error_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清除班级相关缓存
     */
    RoleCacheService.clearClassCache = function (classId) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.PREFIX.CLASS_DATA).concat(classId);
                        return [4 /*yield*/, redis_service_1["default"].del(key)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清除学生列表缓存
     */
    RoleCacheService.clearStudentListCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pattern;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pattern = "".concat(this.PREFIX.STUDENT_DATA, "list:*");
                        return [4 /*yield*/, redis_service_1["default"].del(pattern)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清除活动列表缓存
     */
    RoleCacheService.clearActivityListCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pattern;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pattern = "".concat(this.PREFIX.ACTIVITY_DATA, "list:*");
                        return [4 /*yield*/, redis_service_1["default"].del(pattern)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量清除缓存
     */
    RoleCacheService.clearMultipleCache = function (patterns) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, patterns_3, pattern;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, patterns_3 = patterns;
                        _a.label = 1;
                    case 1:
                        if (!(_i < patterns_3.length)) return [3 /*break*/, 4];
                        pattern = patterns_3[_i];
                        return [4 /*yield*/, redis_service_1["default"].del(pattern)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取缓存统计信息
     * ⚠️ 权限缓存已移至 PermissionCacheService，此处不再统计
     */
    RoleCacheService.getCacheStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stats;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {};
                        return [4 /*yield*/, redis_service_1["default"].keys("".concat(this.PREFIX.TEACHER, "*"))];
                    case 1:
                        _a.teacher = _b.sent();
                        return [4 /*yield*/, redis_service_1["default"].keys("".concat(this.PREFIX.ADMIN, "*"))];
                    case 2:
                        _a.admin = _b.sent();
                        return [4 /*yield*/, redis_service_1["default"].keys("".concat(this.PREFIX.PRINCIPAL, "*"))];
                    case 3:
                        _a.principal = _b.sent();
                        return [4 /*yield*/, redis_service_1["default"].keys("".concat(this.PREFIX.DASHBOARD_DATA, "*"))];
                    case 4:
                        _a.dashboard = _b.sent();
                        return [4 /*yield*/, redis_service_1["default"].keys("".concat(this.PREFIX.CLASS_DATA, "*"))];
                    case 5:
                        _a["class"] = _b.sent();
                        return [4 /*yield*/, redis_service_1["default"].keys("".concat(this.PREFIX.STUDENT_DATA, "*"))];
                    case 6:
                        _a.student = _b.sent();
                        return [4 /*yield*/, redis_service_1["default"].keys("".concat(this.PREFIX.ACTIVITY_DATA, "*"))];
                    case 7:
                        stats = (_a.activity = _b.sent(),
                            _a);
                        return [2 /*return*/, {
                                teacherCacheCount: stats.teacher.length,
                                adminCacheCount: stats.admin.length,
                                principalCacheCount: stats.principal.length,
                                dashboardCacheCount: stats.dashboard.length,
                                classCacheCount: stats["class"].length,
                                studentCacheCount: stats.student.length,
                                activityCacheCount: stats.activity.length,
                                totalCacheCount: Object.values(stats).reduce(function (sum, arr) { return sum + arr.length; }, 0),
                                note: '权限缓存已由 PermissionCacheService 管理'
                            }];
                }
            });
        });
    };
    // 缓存键前缀 - 仅保留角色特定的业务数据缓存
    RoleCacheService.PREFIX = {
        TEACHER: 'teacher:',
        ADMIN: 'admin:',
        PRINCIPAL: 'principal:',
        TEACHER_CLASS: 'teacher:class:',
        TEACHER_STUDENT: 'teacher:student:',
        TEACHER_ACTIVITY: 'teacher:activity:',
        DASHBOARD_DATA: 'dashboard:',
        CLASS_DATA: 'class:',
        STUDENT_DATA: 'student:',
        ACTIVITY_DATA: 'activity:' // 活动数据
    };
    // 缓存过期时间（秒）
    RoleCacheService.TTL = {
        SHORT: 60,
        MEDIUM: 300,
        LONG: 1800,
        VERY_LONG: 3600,
        DASHBOARD: 300,
        LIST: 180 // 列表数据3分钟
    };
    return RoleCacheService;
}());
exports.RoleCacheService = RoleCacheService;
exports["default"] = RoleCacheService;
