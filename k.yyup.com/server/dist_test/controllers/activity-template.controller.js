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
exports.ActivityTemplateController = void 0;
var activity_template_model_1 = require("../models/activity-template.model");
var ActivityTemplateController = /** @class */ (function () {
    function ActivityTemplateController() {
    }
    // 获取所有活动模板
    ActivityTemplateController.prototype.getAll = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, category, status_1, _b, page, _c, limit, whereClause, offset, _d, templates, total, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        _a = req.query, category = _a.category, status_1 = _a.status, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c;
                        whereClause = {};
                        if (category) {
                            whereClause.category = category;
                        }
                        if (status_1) {
                            whereClause.status = status_1;
                        }
                        else {
                            whereClause.status = 'active'; // 默认只显示活跃的模板
                        }
                        offset = (Number(page) - 1) * Number(limit);
                        return [4 /*yield*/, activity_template_model_1.ActivityTemplate.findAndCountAll({
                                where: whereClause,
                                order: [['usageCount', 'DESC'], ['createdAt', 'DESC']],
                                limit: Number(limit),
                                offset: offset
                            })];
                    case 1:
                        _d = _e.sent(), templates = _d.rows, total = _d.count;
                        res.json({
                            success: true,
                            data: templates,
                            pagination: {
                                total: total,
                                page: Number(page),
                                limit: Number(limit),
                                totalPages: Math.ceil(total / Number(limit))
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _e.sent();
                        console.error('获取活动模板失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: '获取活动模板失败',
                            error: error_1 instanceof Error ? error_1.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // 根据ID获取单个模板
    ActivityTemplateController.prototype.getById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, template, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, activity_template_model_1.ActivityTemplate.findByPk(id)];
                    case 1:
                        template = _a.sent();
                        if (!template) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '模板不存在'
                                })];
                        }
                        res.json({
                            success: true,
                            data: template
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('获取模板详情失败:', error_2);
                        res.status(500).json({
                            success: false,
                            message: '获取模板详情失败',
                            error: error_2 instanceof Error ? error_2.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // 创建新模板
    ActivityTemplateController.prototype.create = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, name_1, description, category, coverImage, templateData, createdBy, template, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = req.body, name_1 = _b.name, description = _b.description, category = _b.category, coverImage = _b.coverImage, templateData = _b.templateData;
                        createdBy = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 1;
                        return [4 /*yield*/, activity_template_model_1.ActivityTemplate.create({
                                name: name_1,
                                description: description,
                                category: category,
                                coverImage: coverImage,
                                templateData: templateData,
                                createdBy: createdBy
                            })];
                    case 1:
                        template = _c.sent();
                        res.status(201).json({
                            success: true,
                            data: template,
                            message: '模板创建成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _c.sent();
                        console.error('创建模板失败:', error_3);
                        res.status(500).json({
                            success: false,
                            message: '创建模板失败',
                            error: error_3 instanceof Error ? error_3.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // 更新模板
    ActivityTemplateController.prototype.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, _a, name_2, description, category, coverImage, templateData, status_2, template, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        _a = req.body, name_2 = _a.name, description = _a.description, category = _a.category, coverImage = _a.coverImage, templateData = _a.templateData, status_2 = _a.status;
                        return [4 /*yield*/, activity_template_model_1.ActivityTemplate.findByPk(id)];
                    case 1:
                        template = _b.sent();
                        if (!template) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '模板不存在'
                                })];
                        }
                        return [4 /*yield*/, template.update({
                                name: name_2,
                                description: description,
                                category: category,
                                coverImage: coverImage,
                                templateData: templateData,
                                status: status_2
                            })];
                    case 2:
                        _b.sent();
                        res.json({
                            success: true,
                            data: template,
                            message: '模板更新成功'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _b.sent();
                        console.error('更新模板失败:', error_4);
                        res.status(500).json({
                            success: false,
                            message: '更新模板失败',
                            error: error_4 instanceof Error ? error_4.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // 删除模板
    ActivityTemplateController.prototype["delete"] = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, template, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        return [4 /*yield*/, activity_template_model_1.ActivityTemplate.findByPk(id)];
                    case 1:
                        template = _a.sent();
                        if (!template) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '模板不存在'
                                })];
                        }
                        return [4 /*yield*/, template.destroy()];
                    case 2:
                        _a.sent();
                        res.json({
                            success: true,
                            message: '模板删除成功'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error('删除模板失败:', error_5);
                        res.status(500).json({
                            success: false,
                            message: '删除模板失败',
                            error: error_5 instanceof Error ? error_5.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // 使用模板（增加使用次数）
    ActivityTemplateController.prototype.use = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, template, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        return [4 /*yield*/, activity_template_model_1.ActivityTemplate.findByPk(id)];
                    case 1:
                        template = _a.sent();
                        if (!template) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '模板不存在'
                                })];
                        }
                        return [4 /*yield*/, template.increment('usageCount')];
                    case 2:
                        _a.sent();
                        res.json({
                            success: true,
                            data: template,
                            message: '模板使用成功'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        console.error('使用模板失败:', error_6);
                        res.status(500).json({
                            success: false,
                            message: '使用模板失败',
                            error: error_6 instanceof Error ? error_6.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ActivityTemplateController;
}());
exports.ActivityTemplateController = ActivityTemplateController;
exports["default"] = new ActivityTemplateController();
