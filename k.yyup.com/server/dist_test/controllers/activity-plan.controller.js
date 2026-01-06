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
exports.getActivityStatistics = exports.cancelActivity = exports.updateActivityStatus = exports.getActivityPlans = exports.deleteActivityPlan = exports.updateActivityPlan = exports.getActivityPlanById = exports.createActivityPlan = void 0;
var init_1 = require("../init");
var apiError_1 = require("../utils/apiError");
var apiResponse_1 = require("../utils/apiResponse");
// 获取数据库实例
var getSequelizeInstance = function () {
    return init_1.sequelize;
};
/**
 * 创建活动计划
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var createActivityPlan = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId;
    var _a;
    return __generator(this, function (_b) {
        try {
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            // 模拟创建活动计划    // const mockActivity = {
            //       id: Math.floor(Math.random() * 1000) + 1,
            //       title: req.body.title || '新活动计划',
            //       description: req.body.description || '活动描述',
            //       status: ActivityStatus.PLANNED,
            //       createdAt: new Date(),
            //       creatorId: userId
            //     };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, [], '创建活动计划成功')];
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.createActivityPlan = createActivityPlan;
/**
 * 获取活动计划详情
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getActivityPlanById = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, db, activities, activitiesList, dbError_1, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query('SELECT * FROM activities WHERE id = ? AND deleted_at IS NULL', {
                        replacements: [Number(id) || 0],
                        type: 'SELECT'
                    })];
            case 2:
                activities = _a.sent();
                activitiesList = Array.isArray(activities) ? activities : [];
                if (activitiesList.length > 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.success(res, activitiesList[0], '获取活动计划详情成功')];
                }
                return [3 /*break*/, 4];
            case 3:
                dbError_1 = _a.sent();
                console.log('数据库查询失败，使用模拟数据:', dbError_1);
                return [3 /*break*/, 4];
            case 4: 
            // 如果数据库查询失败，返回模拟数据    // const mockActivity = {
            //       id: Number(id) || 0,
            //       title: '示例活动计划',
            //       description: '这是一个示例活动计划',
            //       status: ActivityStatus.REGISTRATION_OPEN,
            //       createdAt: new Date()
            //     };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, [], '获取活动计划详情成功')];
            case 5:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.getActivityPlanById = getActivityPlanById;
/**
 * 更新活动计划
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var updateActivityPlan = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId;
    var _a;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            // 模拟更新活动计划    // const mockActivity = {
            //       id: Number(id) || 0,
            //       title: req.body.title || '更新的活动计划',
            //       description: req.body.description || '更新的活动描述',
            //       status: req.body.status || ActivityStatus.REGISTRATION_OPEN,
            //       updatedAt: new Date(),
            //       updaterId: userId
            //     };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, [], '更新活动计划成功')];
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.updateActivityPlan = updateActivityPlan;
/**
 * 删除活动计划
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var deleteActivityPlan = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id;
    return __generator(this, function (_a) {
        try {
            id = req.params.id;
            // 模拟删除操作
            console.log("\u5220\u9664\u6D3B\u52A8\u8BA1\u5212 ID: ".concat(id));
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, '删除活动计划成功')];
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.deleteActivityPlan = deleteActivityPlan;
/**
 * 获取活动计划列表
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getActivityPlans = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, size, offset, db, activities, countResult, activitiesList, countList, total, result, dbError_2, emptyResult, error_2;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 6, , 7]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.size, size = _c === void 0 ? 10 : _c;
                _e.label = 1;
            case 1:
                _e.trys.push([1, 4, , 5]);
                offset = ((Number(page) - 1) || 0) * Number(size) || 0;
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query('SELECT * FROM activities WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?', {
                        replacements: [Number(size) || 0, offset],
                        type: 'SELECT'
                    })];
            case 2:
                activities = _e.sent();
                return [4 /*yield*/, db.query('SELECT COUNT(*) as total FROM activities WHERE deleted_at IS NULL', { type: 'SELECT' })];
            case 3:
                countResult = _e.sent();
                activitiesList = Array.isArray(activities) ? activities : [];
                countList = Array.isArray(countResult) ? countResult : [];
                total = countList.length > 0 ? ((_d = countList[0]) === null || _d === void 0 ? void 0 : _d.total) || 0 : 0;
                result = {
                    data: activitiesList,
                    pagination: {
                        page: Number(page) || 0,
                        size: Number(size) || 0,
                        total: Number(total) || 0,
                        totalPages: Math.ceil(Number(total) || 0 / Number(size) || 0)
                    }
                };
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, result, '获取活动计划列表成功')];
            case 4:
                dbError_2 = _e.sent();
                console.error('数据库查询失败:', dbError_2);
                emptyResult = {
                    data: [],
                    pagination: {
                        page: Number(page) || 1,
                        size: Number(size) || 10,
                        total: 0,
                        totalPages: 0
                    }
                };
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, emptyResult, '获取活动计划列表成功（数据库暂时不可用）')];
            case 5: return [3 /*break*/, 7];
            case 6:
                error_2 = _e.sent();
                next(error_2);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.getActivityPlans = getActivityPlans;
/**
 * 更新活动状态
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var updateActivityStatus = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, status_1;
    var _a;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            status_1 = req.body.status;
            // 模拟更新状态    // const mockActivity = {
            //       id: Number(id) || 0,
            //       status: status,
            //       updatedAt: new Date(),
            //       updaterId: userId
            //     };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, [], '更新活动状态成功')];
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.updateActivityStatus = updateActivityStatus;
/**
 * 取消活动
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var cancelActivity = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, cancelReason;
    var _a;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            cancelReason = req.body.cancelReason;
            if (!cancelReason) {
                throw apiError_1.ApiError.badRequest('取消原因不能为空');
            }
            // 模拟取消活动    // const mockActivity = {
            //       id: Number(id) || 0,
            //       status: ActivityStatus.CANCELLED,
            //       cancelReason: cancelReason,
            //       updatedAt: new Date(),
            //       updaterId: userId
            //     };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, [], '取消活动成功')];
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.cancelActivity = cancelActivity;
/**
 * 获取活动统计数据
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getActivityStatistics = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id;
    return __generator(this, function (_a) {
        try {
            id = req.params.id;
            // 模拟统计数据    // const mockStats = {
            //       activityId: Number(id) || 0,
            //       totalRegistrations: 25,
            //       confirmedRegistrations: 20,
            //       pendingRegistrations: 3,
            //       cancelledRegistrations: 2,
            //       checkInCount: 18,
            //       conversionRate: 0.72
            //     };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, [], '获取活动统计数据成功')];
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.getActivityStatistics = getActivityStatistics;
