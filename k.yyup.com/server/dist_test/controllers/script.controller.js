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
exports.ScriptController = void 0;
var sequelize_1 = require("sequelize");
var script_model_1 = require("../models/script.model");
var user_model_1 = require("../models/user.model");
var apiResponse_1 = require("../utils/apiResponse");
var apiError_1 = require("../utils/apiError");
/**
 * 话术控制器
 */
var ScriptController = /** @class */ (function () {
    function ScriptController() {
    }
    /**
     * 获取话术列表
     */
    ScriptController.prototype.getScripts = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, limit, categoryId, type, _d, status_1, keyword, _e, sortBy, _f, sortOrder, offset, where, _g, scripts, count, error_1;
            var _h, _j, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        _l.trys.push([0, 2, , 3]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 20 : _c, categoryId = _a.categoryId, type = _a.type, _d = _a.status, status_1 = _d === void 0 ? script_model_1.ScriptStatus.ACTIVE : _d, keyword = _a.keyword, _e = _a.sortBy, sortBy = _e === void 0 ? 'createdAt' : _e, _f = _a.sortOrder, sortOrder = _f === void 0 ? 'DESC' : _f;
                        offset = (Number(page) - 1) * Number(limit);
                        where = {};
                        if (categoryId) {
                            where.categoryId = categoryId;
                        }
                        if (type) {
                            where.type = type;
                        }
                        if (status_1) {
                            where.status = status_1;
                        }
                        if (keyword) {
                            where[sequelize_1.Op.or] = [
                                { title: (_h = {}, _h[sequelize_1.Op.like] = "%".concat(keyword, "%"), _h) },
                                { content: (_j = {}, _j[sequelize_1.Op.like] = "%".concat(keyword, "%"), _j) },
                                { description: (_k = {}, _k[sequelize_1.Op.like] = "%".concat(keyword, "%"), _k) }
                            ];
                        }
                        return [4 /*yield*/, script_model_1.Script.findAndCountAll({
                                where: where,
                                include: [
                                    {
                                        model: script_model_1.ScriptCategory,
                                        as: 'category',
                                        attributes: ['id', 'name', 'type', 'color', 'icon']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'creator',
                                        attributes: ['id', 'username', 'realName']
                                    }
                                ],
                                order: [[sortBy, sortOrder]],
                                limit: Number(limit),
                                offset: offset
                            })];
                    case 1:
                        _g = _l.sent(), scripts = _g.rows, count = _g.count;
                        res.status(200).json({
                            success: true,
                            data: {
                                scripts: scripts,
                                pagination: {
                                    total: count,
                                    page: Number(page),
                                    limit: Number(limit),
                                    totalPages: Math.ceil(count / Number(limit))
                                }
                            },
                            message: '获取话术列表成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _l.sent();
                        next(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取话术详情
     */
    ScriptController.prototype.getScriptById = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, script, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, script_model_1.Script.findByPk(id, {
                                include: [
                                    {
                                        model: script_model_1.ScriptCategory,
                                        as: 'category',
                                        attributes: ['id', 'name', 'type', 'color', 'icon']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'creator',
                                        attributes: ['id', 'username', 'realName']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'updater',
                                        attributes: ['id', 'username', 'realName']
                                    }
                                ]
                            })];
                    case 1:
                        script = _a.sent();
                        if (!script) {
                            res.status(404).json({
                                success: false,
                                message: '话术不存在'
                            });
                            return [2 /*return*/];
                        }
                        res.status(200).json({
                            success: true,
                            data: script,
                            message: '获取话术详情成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        next(error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建话术
     */
    ScriptController.prototype.createScript = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, _b, title, content, categoryId, type, _c, tags, _d, keywords, description, _e, isTemplate, variables, category, script, fullScript, error_3;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 4, , 5]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            res.status(401).json({
                                success: false,
                                message: '未登录或登录已过期'
                            });
                            return [2 /*return*/];
                        }
                        _b = req.body, title = _b.title, content = _b.content, categoryId = _b.categoryId, type = _b.type, _c = _b.tags, tags = _c === void 0 ? [] : _c, _d = _b.keywords, keywords = _d === void 0 ? [] : _d, description = _b.description, _e = _b.isTemplate, isTemplate = _e === void 0 ? false : _e, variables = _b.variables;
                        return [4 /*yield*/, script_model_1.ScriptCategory.findByPk(categoryId)];
                    case 1:
                        category = _f.sent();
                        if (!category) {
                            res.status(400).json({
                                success: false,
                                message: '话术分类不存在'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, script_model_1.Script.create({
                                title: title,
                                content: content,
                                categoryId: categoryId,
                                type: type,
                                tags: tags,
                                keywords: keywords,
                                description: description,
                                isTemplate: isTemplate,
                                variables: variables,
                                creatorId: userId,
                                updaterId: userId
                            })];
                    case 2:
                        script = _f.sent();
                        return [4 /*yield*/, script_model_1.Script.findByPk(script.id, {
                                include: [
                                    {
                                        model: script_model_1.ScriptCategory,
                                        as: 'category',
                                        attributes: ['id', 'name', 'type', 'color', 'icon']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'creator',
                                        attributes: ['id', 'username', 'realName']
                                    }
                                ]
                            })];
                    case 3:
                        fullScript = _f.sent();
                        res.status(201).json({
                            success: true,
                            data: fullScript,
                            message: '创建话术成功'
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _f.sent();
                        next(error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新话术
     */
    ScriptController.prototype.updateScript = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, id, _b, title, content, categoryId, type, tags, keywords, description, status_2, isTemplate, variables, script, category, updatedScript, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
                        }
                        id = req.params.id;
                        _b = req.body, title = _b.title, content = _b.content, categoryId = _b.categoryId, type = _b.type, tags = _b.tags, keywords = _b.keywords, description = _b.description, status_2 = _b.status, isTemplate = _b.isTemplate, variables = _b.variables;
                        return [4 /*yield*/, script_model_1.Script.findByPk(id)];
                    case 1:
                        script = _c.sent();
                        if (!script) {
                            throw apiError_1.ApiError.notFound('话术不存在');
                        }
                        if (!(categoryId && categoryId !== script.categoryId)) return [3 /*break*/, 3];
                        return [4 /*yield*/, script_model_1.ScriptCategory.findByPk(categoryId)];
                    case 2:
                        category = _c.sent();
                        if (!category) {
                            throw apiError_1.ApiError.badRequest('话术分类不存在');
                        }
                        _c.label = 3;
                    case 3: return [4 /*yield*/, script.update({
                            title: title,
                            content: content,
                            categoryId: categoryId,
                            type: type,
                            tags: tags,
                            keywords: keywords,
                            description: description,
                            status: status_2,
                            isTemplate: isTemplate,
                            variables: variables,
                            updaterId: userId
                        })];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, script_model_1.Script.findByPk(id, {
                                include: [
                                    {
                                        model: script_model_1.ScriptCategory,
                                        as: 'category',
                                        attributes: ['id', 'name', 'type', 'color', 'icon']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'creator',
                                        attributes: ['id', 'username', 'realName']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'updater',
                                        attributes: ['id', 'username', 'realName']
                                    }
                                ]
                            })];
                    case 5:
                        updatedScript = _c.sent();
                        apiResponse_1.ApiResponse.success(res, updatedScript, '更新话术成功');
                        return [3 /*break*/, 7];
                    case 6:
                        error_4 = _c.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_4, '更新话术失败');
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除话术
     */
    ScriptController.prototype.deleteScript = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, script, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        return [4 /*yield*/, script_model_1.Script.findByPk(id)];
                    case 1:
                        script = _a.sent();
                        if (!script) {
                            throw apiError_1.ApiError.notFound('话术不存在');
                        }
                        return [4 /*yield*/, script.destroy()];
                    case 2:
                        _a.sent();
                        apiResponse_1.ApiResponse.success(res, null, '删除话术成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_5, '删除话术失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 使用话术（记录使用次数）
     */
    ScriptController.prototype.useScript = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, id, _b, usageContext, effectiveRating, feedback, script, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
                        }
                        id = req.params.id;
                        _b = req.body, usageContext = _b.usageContext, effectiveRating = _b.effectiveRating, feedback = _b.feedback;
                        return [4 /*yield*/, script_model_1.Script.findByPk(id)];
                    case 1:
                        script = _c.sent();
                        if (!script) {
                            throw apiError_1.ApiError.notFound('话术不存在');
                        }
                        // 增加使用次数
                        return [4 /*yield*/, script.increment('usageCount')];
                    case 2:
                        // 增加使用次数
                        _c.sent();
                        // 记录使用记录
                        return [4 /*yield*/, script_model_1.ScriptUsage.create({
                                scriptId: Number(id),
                                userId: userId,
                                usageContext: usageContext,
                                effectiveRating: effectiveRating,
                                feedback: feedback
                            })];
                    case 3:
                        // 记录使用记录
                        _c.sent();
                        apiResponse_1.ApiResponse.success(res, null, '话术使用记录成功');
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _c.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_6, '记录话术使用失败');
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取话术使用统计
     */
    ScriptController.prototype.getScriptStats = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, timeRange, days, startDate, totalScripts, totalUsages, scriptsByType, popularScripts, usageTrend, error_7;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 6, , 7]);
                        _a = req.query.timeRange, timeRange = _a === void 0 ? '30' : _a;
                        days = Number(timeRange);
                        startDate = new Date();
                        startDate.setDate(startDate.getDate() - days);
                        return [4 /*yield*/, script_model_1.Script.count({
                                where: { status: script_model_1.ScriptStatus.ACTIVE }
                            })];
                    case 1:
                        totalScripts = _d.sent();
                        return [4 /*yield*/, script_model_1.ScriptUsage.count({
                                where: {
                                    usageDate: (_b = {},
                                        _b[sequelize_1.Op.gte] = startDate,
                                        _b)
                                }
                            })];
                    case 2:
                        totalUsages = _d.sent();
                        return [4 /*yield*/, script_model_1.Script.findAll({
                                attributes: [
                                    'type',
                                    [script_model_1.Script.sequelize.fn('COUNT', script_model_1.Script.sequelize.col('id')), 'count']
                                ],
                                where: { status: script_model_1.ScriptStatus.ACTIVE },
                                group: ['type'],
                                raw: true
                            })];
                    case 3:
                        scriptsByType = _d.sent();
                        return [4 /*yield*/, script_model_1.Script.findAll({
                                attributes: ['id', 'title', 'usageCount', 'effectiveScore'],
                                where: { status: script_model_1.ScriptStatus.ACTIVE },
                                order: [['usageCount', 'DESC']],
                                limit: 10
                            })];
                    case 4:
                        popularScripts = _d.sent();
                        return [4 /*yield*/, script_model_1.ScriptUsage.findAll({
                                attributes: [
                                    [script_model_1.Script.sequelize.fn('DATE', script_model_1.Script.sequelize.col('usage_date')), 'date'],
                                    [script_model_1.Script.sequelize.fn('COUNT', script_model_1.Script.sequelize.col('id')), 'count']
                                ],
                                where: {
                                    usageDate: (_c = {},
                                        _c[sequelize_1.Op.gte] = startDate,
                                        _c)
                                },
                                group: [script_model_1.Script.sequelize.fn('DATE', script_model_1.Script.sequelize.col('usage_date'))],
                                order: [[script_model_1.Script.sequelize.fn('DATE', script_model_1.Script.sequelize.col('usage_date')), 'ASC']],
                                raw: true
                            })];
                    case 5:
                        usageTrend = _d.sent();
                        apiResponse_1.ApiResponse.success(res, {
                            totalScripts: totalScripts,
                            totalUsages: totalUsages,
                            scriptsByType: scriptsByType,
                            popularScripts: popularScripts,
                            usageTrend: usageTrend
                        }, '获取话术统计成功');
                        return [3 /*break*/, 7];
                    case 6:
                        error_7 = _d.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_7, '获取话术统计失败');
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return ScriptController;
}());
exports.ScriptController = ScriptController;
exports["default"] = new ScriptController();
