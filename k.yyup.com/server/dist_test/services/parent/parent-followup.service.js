"use strict";
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
exports.__esModule = true;
exports.ParentFollowupService = void 0;
/**
 * 家长跟进记录服务
 * 处理与家长跟进记录相关的业务逻辑
 */
var parent_followup_model_1 = require("../../models/parent-followup.model");
var parent_student_relation_model_1 = require("../../models/parent-student-relation.model");
var user_model_1 = require("../../models/user.model");
var apiError_1 = require("../../utils/apiError");
var sequelize_1 = require("sequelize");
var ParentFollowupService = /** @class */ (function () {
    function ParentFollowupService() {
    }
    /**
     * 创建家长跟进记录
     * @param data 跟进记录数据
     * @param userId 当前用户ID
     * @returns 创建的跟进记录
     */
    ParentFollowupService.prototype.create = function (data, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var parentRelation, followup, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.findByPk(data.parentId)];
                    case 1:
                        parentRelation = _a.sent();
                        if (!parentRelation) {
                            throw apiError_1.ApiError.badRequest('家长学生关系不存在', 'PARENT_RELATION_NOT_FOUND');
                        }
                        return [4 /*yield*/, parent_followup_model_1.ParentFollowup.create(__assign(__assign({}, data), { createdBy: userId }))];
                    case 2:
                        followup = _a.sent();
                        return [2 /*return*/, followup];
                    case 3:
                        error_1 = _a.sent();
                        if (error_1 instanceof apiError_1.ApiError) {
                            throw error_1;
                        }
                        throw apiError_1.ApiError.serverError('创建家长跟进记录失败', 'PARENT_FOLLOWUP_CREATE_ERROR');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取家长跟进记录列表
     * @param filters 过滤参数
     * @returns 跟进记录列表和分页信息
     */
    ParentFollowupService.prototype.list = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, parentId, followupType, startDate, endDate, _c, sortBy, _d, sortOrder, offset, limit, where;
            var _e, _f;
            return __generator(this, function (_g) {
                _a = filters.page, page = _a === void 0 ? 1 : _a, _b = filters.pageSize, pageSize = _b === void 0 ? 10 : _b, parentId = filters.parentId, followupType = filters.followupType, startDate = filters.startDate, endDate = filters.endDate, _c = filters.sortBy, sortBy = _c === void 0 ? 'followupDate' : _c, _d = filters.sortOrder, sortOrder = _d === void 0 ? 'DESC' : _d;
                offset = (Number(page) - 1) * Number(pageSize);
                limit = Number(pageSize);
                where = {
                    parentId: parentId
                };
                if (followupType) {
                    where.followupType = followupType;
                }
                if (startDate || endDate) {
                    where.followupDate = __assign(__assign({}, (startDate && (_e = {}, _e[sequelize_1.Op.gte] = new Date(startDate), _e))), (endDate && (_f = {}, _f[sequelize_1.Op.lte] = new Date(endDate), _f)));
                }
                return [2 /*return*/, parent_followup_model_1.ParentFollowup.findAndCountAll({
                        where: where,
                        include: [
                            {
                                model: user_model_1.User,
                                as: 'creator',
                                attributes: ['id', 'realName']
                            }
                        ],
                        offset: offset,
                        limit: limit,
                        order: [[sortBy, sortOrder]]
                    })];
            });
        });
    };
    /**
     * 获取家长跟进记录详情
     * @param id 跟进记录ID
     * @returns 跟进记录详情
     */
    ParentFollowupService.prototype.detail = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var followup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parent_followup_model_1.ParentFollowup.findByPk(id, {
                            include: [
                                {
                                    model: user_model_1.User,
                                    as: 'creator',
                                    attributes: ['id', 'realName']
                                }
                            ]
                        })];
                    case 1:
                        followup = _a.sent();
                        if (!followup) {
                            throw apiError_1.ApiError.notFound('跟进记录不存在', 'PARENT_FOLLOWUP_NOT_FOUND');
                        }
                        return [2 /*return*/, followup];
                }
            });
        });
    };
    /**
     * 更新家长跟进记录
     * @param id 跟进记录ID
     * @param data 更新数据
     * @returns 更新后的跟进记录
     */
    ParentFollowupService.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var followup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parent_followup_model_1.ParentFollowup.findByPk(id)];
                    case 1:
                        followup = _a.sent();
                        if (!followup) {
                            throw apiError_1.ApiError.notFound('跟进记录不存在', 'PARENT_FOLLOWUP_NOT_FOUND');
                        }
                        return [4 /*yield*/, followup.update(data)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.detail(id)]; // 返回更新后的完整记录
                }
            });
        });
    };
    /**
     * 删除家长跟进记录
     * @param id 跟进记录ID
     * @returns 是否删除成功
     */
    ParentFollowupService.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var followup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parent_followup_model_1.ParentFollowup.findByPk(id)];
                    case 1:
                        followup = _a.sent();
                        if (!followup) {
                            throw apiError_1.ApiError.notFound('跟进记录不存在', 'PARENT_FOLLOWUP_NOT_FOUND');
                        }
                        return [4 /*yield*/, followup.destroy()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    return ParentFollowupService;
}());
exports.ParentFollowupService = ParentFollowupService;
