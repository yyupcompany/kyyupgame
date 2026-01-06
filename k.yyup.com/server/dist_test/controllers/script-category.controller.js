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
exports.ScriptCategoryController = void 0;
var sequelize_1 = require("sequelize");
var script_model_1 = require("../models/script.model");
var apiResponse_1 = require("../utils/apiResponse");
var apiError_1 = require("../utils/apiError");
/**
 * 话术分类控制器
 */
var ScriptCategoryController = /** @class */ (function () {
    function ScriptCategoryController() {
    }
    /**
     * 获取话术分类列表
     */
    ScriptCategoryController.prototype.getCategories = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, type, _b, status_1, _c, includeCount, where, includeOptions, categories, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = req.query, type = _a.type, _b = _a.status, status_1 = _b === void 0 ? script_model_1.ScriptStatus.ACTIVE : _b, _c = _a.includeCount, includeCount = _c === void 0 ? 'true' : _c;
                        where = {};
                        if (type) {
                            where.type = type;
                        }
                        if (status_1) {
                            where.status = status_1;
                        }
                        includeOptions = [];
                        // 如果需要包含话术数量
                        if (includeCount === 'true') {
                            includeOptions.push({
                                model: script_model_1.Script,
                                as: 'scripts',
                                attributes: [],
                                where: { status: script_model_1.ScriptStatus.ACTIVE },
                                required: false
                            });
                        }
                        return [4 /*yield*/, script_model_1.ScriptCategory.findAll({
                                where: where,
                                include: includeOptions,
                                attributes: includeCount === 'true' ? [
                                    'id',
                                    'name',
                                    'description',
                                    'type',
                                    'color',
                                    'icon',
                                    'sort',
                                    'status',
                                    'createdAt',
                                    'updatedAt',
                                    [script_model_1.ScriptCategory.sequelize.fn('COUNT', script_model_1.ScriptCategory.sequelize.col('scripts.id')), 'scriptCount']
                                ] : undefined,
                                group: includeCount === 'true' ? ['ScriptCategory.id'] : undefined,
                                order: [['sort', 'ASC'], ['createdAt', 'DESC']]
                            })];
                    case 1:
                        categories = _d.sent();
                        apiResponse_1.ApiResponse.success(res, categories, '获取话术分类列表成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _d.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_1, '获取话术分类列表失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取话术分类详情
     */
    ScriptCategoryController.prototype.getCategoryById = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, category, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, script_model_1.ScriptCategory.findByPk(id, {
                                include: [
                                    {
                                        model: script_model_1.Script,
                                        as: 'scripts',
                                        where: { status: script_model_1.ScriptStatus.ACTIVE },
                                        required: false,
                                        attributes: ['id', 'title', 'usageCount', 'effectiveScore', 'createdAt']
                                    }
                                ]
                            })];
                    case 1:
                        category = _a.sent();
                        if (!category) {
                            throw apiError_1.ApiError.notFound('话术分类不存在');
                        }
                        apiResponse_1.ApiResponse.success(res, category, '获取话术分类详情成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_2, '获取话术分类详情失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建话术分类
     */
    ScriptCategoryController.prototype.createCategory = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, _b, name_1, description, type, color, icon, _c, sort, existingCategory, category, error_3;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
                        }
                        _b = req.body, name_1 = _b.name, description = _b.description, type = _b.type, color = _b.color, icon = _b.icon, _c = _b.sort, sort = _c === void 0 ? 0 : _c;
                        return [4 /*yield*/, script_model_1.ScriptCategory.findOne({
                                where: {
                                    name: name_1,
                                    type: type,
                                    status: (_d = {}, _d[sequelize_1.Op.ne] = script_model_1.ScriptStatus.INACTIVE, _d)
                                }
                            })];
                    case 1:
                        existingCategory = _e.sent();
                        if (existingCategory) {
                            throw apiError_1.ApiError.badRequest('该类型下已存在同名分类');
                        }
                        return [4 /*yield*/, script_model_1.ScriptCategory.create({
                                name: name_1,
                                description: description,
                                type: type,
                                color: color,
                                icon: icon,
                                sort: sort,
                                creatorId: userId
                            })];
                    case 2:
                        category = _e.sent();
                        apiResponse_1.ApiResponse.success(res, category, '创建话术分类成功', 201);
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _e.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_3, '创建话术分类失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新话术分类
     */
    ScriptCategoryController.prototype.updateCategory = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, _a, name_2, description, type, color, icon, sort, status_2, category, existingCategory, error_4;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        id = req.params.id;
                        _a = req.body, name_2 = _a.name, description = _a.description, type = _a.type, color = _a.color, icon = _a.icon, sort = _a.sort, status_2 = _a.status;
                        return [4 /*yield*/, script_model_1.ScriptCategory.findByPk(id)];
                    case 1:
                        category = _d.sent();
                        if (!category) {
                            throw apiError_1.ApiError.notFound('话术分类不存在');
                        }
                        if (!(name_2 && name_2 !== category.name)) return [3 /*break*/, 3];
                        return [4 /*yield*/, script_model_1.ScriptCategory.findOne({
                                where: {
                                    name: name_2,
                                    type: type || category.type,
                                    id: (_b = {}, _b[sequelize_1.Op.ne] = id, _b),
                                    status: (_c = {}, _c[sequelize_1.Op.ne] = script_model_1.ScriptStatus.INACTIVE, _c)
                                }
                            })];
                    case 2:
                        existingCategory = _d.sent();
                        if (existingCategory) {
                            throw apiError_1.ApiError.badRequest('该类型下已存在同名分类');
                        }
                        _d.label = 3;
                    case 3: return [4 /*yield*/, category.update({
                            name: name_2,
                            description: description,
                            type: type,
                            color: color,
                            icon: icon,
                            sort: sort,
                            status: status_2
                        })];
                    case 4:
                        _d.sent();
                        apiResponse_1.ApiResponse.success(res, category, '更新话术分类成功');
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _d.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_4, '更新话术分类失败');
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除话术分类
     */
    ScriptCategoryController.prototype.deleteCategory = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, category, scriptCount, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        id = req.params.id;
                        return [4 /*yield*/, script_model_1.ScriptCategory.findByPk(id)];
                    case 1:
                        category = _b.sent();
                        if (!category) {
                            throw apiError_1.ApiError.notFound('话术分类不存在');
                        }
                        return [4 /*yield*/, script_model_1.Script.count({
                                where: {
                                    categoryId: id,
                                    status: (_a = {}, _a[sequelize_1.Op.ne] = script_model_1.ScriptStatus.INACTIVE, _a)
                                }
                            })];
                    case 2:
                        scriptCount = _b.sent();
                        if (scriptCount > 0) {
                            throw apiError_1.ApiError.badRequest('该分类下还有话术，无法删除');
                        }
                        return [4 /*yield*/, category.destroy()];
                    case 3:
                        _b.sent();
                        apiResponse_1.ApiResponse.success(res, null, '删除话术分类成功');
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _b.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_5, '删除话术分类失败');
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量更新分类排序
     */
    ScriptCategoryController.prototype.updateCategoriesSort = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var categories, updatePromises, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        categories = req.body.categories;
                        if (!Array.isArray(categories)) {
                            throw apiError_1.ApiError.badRequest('分类数据格式错误');
                        }
                        updatePromises = categories.map(function (item) {
                            return script_model_1.ScriptCategory.update({ sort: item.sort }, { where: { id: item.id } });
                        });
                        return [4 /*yield*/, Promise.all(updatePromises)];
                    case 1:
                        _a.sent();
                        apiResponse_1.ApiResponse.success(res, null, '更新分类排序成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_6, '更新分类排序失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取分类统计信息
     */
    ScriptCategoryController.prototype.getCategoryStats = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var categoryStats, scriptStats, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, script_model_1.ScriptCategory.findAll({
                                attributes: [
                                    'type',
                                    [script_model_1.ScriptCategory.sequelize.fn('COUNT', script_model_1.ScriptCategory.sequelize.col('id')), 'count']
                                ],
                                where: { status: script_model_1.ScriptStatus.ACTIVE },
                                group: ['type'],
                                raw: true
                            })];
                    case 1:
                        categoryStats = _a.sent();
                        return [4 /*yield*/, script_model_1.ScriptCategory.findAll({
                                attributes: [
                                    'id',
                                    'name',
                                    'type',
                                    [script_model_1.ScriptCategory.sequelize.fn('COUNT', script_model_1.ScriptCategory.sequelize.col('scripts.id')), 'scriptCount']
                                ],
                                include: [
                                    {
                                        model: script_model_1.Script,
                                        as: 'scripts',
                                        attributes: [],
                                        where: { status: script_model_1.ScriptStatus.ACTIVE },
                                        required: false
                                    }
                                ],
                                where: { status: script_model_1.ScriptStatus.ACTIVE },
                                group: ['ScriptCategory.id'],
                                order: [['type', 'ASC'], ['name', 'ASC']]
                            })];
                    case 2:
                        scriptStats = _a.sent();
                        apiResponse_1.ApiResponse.success(res, {
                            categoryStats: categoryStats,
                            scriptStats: scriptStats
                        }, '获取分类统计成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_7, '获取分类统计失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 初始化默认分类
     */
    ScriptCategoryController.prototype.initDefaultCategories = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, defaultCategories, createdCategories, _i, defaultCategories_1, categoryData, existing, category, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
                        }
                        defaultCategories = [
                            {
                                name: '招生话术',
                                description: '招生咨询、介绍、跟进等话术',
                                type: script_model_1.ScriptType.ENROLLMENT,
                                color: '#409EFF',
                                icon: 'School',
                                sort: 1
                            },
                            {
                                name: '电话话术',
                                description: '电话沟通、回访、邀约等话术',
                                type: script_model_1.ScriptType.PHONE,
                                color: '#67C23A',
                                icon: 'Phone',
                                sort: 2
                            },
                            {
                                name: '接待话术',
                                description: '家长接待、参观介绍等话术',
                                type: script_model_1.ScriptType.RECEPTION,
                                color: '#E6A23C',
                                icon: 'User',
                                sort: 3
                            },
                            {
                                name: '跟进话术',
                                description: '客户跟进、维护、转化等话术',
                                type: script_model_1.ScriptType.FOLLOWUP,
                                color: '#F56C6C',
                                icon: 'ChatDotRound',
                                sort: 4
                            },
                            {
                                name: '咨询话术',
                                description: '专业咨询、答疑解惑等话术',
                                type: script_model_1.ScriptType.CONSULTATION,
                                color: '#909399',
                                icon: 'QuestionFilled',
                                sort: 5
                            },
                            {
                                name: '异议处理',
                                description: '处理家长疑虑、异议等话术',
                                type: script_model_1.ScriptType.OBJECTION,
                                color: '#9C27B0',
                                icon: 'Warning',
                                sort: 6
                            }
                        ];
                        createdCategories = [];
                        _i = 0, defaultCategories_1 = defaultCategories;
                        _b.label = 1;
                    case 1:
                        if (!(_i < defaultCategories_1.length)) return [3 /*break*/, 5];
                        categoryData = defaultCategories_1[_i];
                        return [4 /*yield*/, script_model_1.ScriptCategory.findOne({
                                where: {
                                    name: categoryData.name,
                                    type: categoryData.type
                                }
                            })];
                    case 2:
                        existing = _b.sent();
                        if (!!existing) return [3 /*break*/, 4];
                        return [4 /*yield*/, script_model_1.ScriptCategory.create(__assign(__assign({}, categoryData), { creatorId: userId }))];
                    case 3:
                        category = _b.sent();
                        createdCategories.push(category);
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5:
                        apiResponse_1.ApiResponse.success(res, createdCategories, "\u6210\u529F\u521D\u59CB\u5316".concat(createdCategories.length, "\u4E2A\u9ED8\u8BA4\u5206\u7C7B"));
                        return [3 /*break*/, 7];
                    case 6:
                        error_8 = _b.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_8, '初始化默认分类失败');
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return ScriptCategoryController;
}());
exports.ScriptCategoryController = ScriptCategoryController;
exports["default"] = new ScriptCategoryController();
