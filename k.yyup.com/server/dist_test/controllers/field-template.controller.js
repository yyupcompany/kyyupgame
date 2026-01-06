"use strict";
/**
 * 字段模板控制器
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
exports.fieldTemplateController = void 0;
var field_template_service_1 = require("../services/ai/field-template.service");
/**
 * 字段模板控制器类
 */
var FieldTemplateController = /** @class */ (function () {
    function FieldTemplateController() {
    }
    /**
     * 创建字段模板
     * POST /api/field-templates
     */
    FieldTemplateController.prototype.createTemplate = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, name_1, description, entityType, fieldValues, isPublic, userId, template, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = req.body, name_1 = _b.name, description = _b.description, entityType = _b.entityType, fieldValues = _b.fieldValues, isPublic = _b.isPublic;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '未授权'
                                })];
                        }
                        if (!name_1 || !entityType || !fieldValues) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '缺少必填参数：name, entityType, fieldValues'
                                })];
                        }
                        return [4 /*yield*/, field_template_service_1.fieldTemplateService.createTemplate({
                                name: name_1,
                                description: description,
                                entityType: entityType,
                                fieldValues: fieldValues,
                                userId: userId,
                                isPublic: isPublic
                            })];
                    case 1:
                        template = _c.sent();
                        res.status(201).json({
                            success: true,
                            message: '模板创建成功',
                            data: template
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        console.error('❌ [字段模板] 创建失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: error_1.message || '创建模板失败'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模板列表
     * GET /api/field-templates
     */
    FieldTemplateController.prototype.getTemplateList = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, _b, entityType, isPublic, page, pageSize, keyword, result, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        _b = req.query, entityType = _b.entityType, isPublic = _b.isPublic, page = _b.page, pageSize = _b.pageSize, keyword = _b.keyword;
                        return [4 /*yield*/, field_template_service_1.fieldTemplateService.getTemplateList({
                                userId: userId,
                                entityType: entityType,
                                isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
                                page: page ? parseInt(page) : undefined,
                                pageSize: pageSize ? parseInt(pageSize) : undefined,
                                keyword: keyword
                            })];
                    case 1:
                        result = _c.sent();
                        res.json({
                            success: true,
                            data: result
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _c.sent();
                        console.error('❌ [字段模板] 获取列表失败:', error_2);
                        res.status(500).json({
                            success: false,
                            message: error_2.message || '获取模板列表失败'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模板详情
     * GET /api/field-templates/:id
     */
    FieldTemplateController.prototype.getTemplateById = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, template, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        return [4 /*yield*/, field_template_service_1.fieldTemplateService.getTemplateById(parseInt(id), userId)];
                    case 1:
                        template = _b.sent();
                        res.json({
                            success: true,
                            data: template
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        console.error('❌ [字段模板] 获取详情失败:', error_3);
                        res.status(error_3.message === '模板不存在' ? 404 : 500).json({
                            success: false,
                            message: error_3.message || '获取模板详情失败'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 应用模板
     * POST /api/field-templates/:id/apply
     */
    FieldTemplateController.prototype.applyTemplate = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, fieldValues, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        return [4 /*yield*/, field_template_service_1.fieldTemplateService.applyTemplate(parseInt(id), userId)];
                    case 1:
                        fieldValues = _b.sent();
                        res.json({
                            success: true,
                            message: '模板应用成功',
                            data: fieldValues
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        console.error('❌ [字段模板] 应用失败:', error_4);
                        res.status(500).json({
                            success: false,
                            message: error_4.message || '应用模板失败'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新模板
     * PUT /api/field-templates/:id
     */
    FieldTemplateController.prototype.updateTemplate = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, _b, name_2, description, fieldValues, isPublic, template, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        _b = req.body, name_2 = _b.name, description = _b.description, fieldValues = _b.fieldValues, isPublic = _b.isPublic;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '未授权'
                                })];
                        }
                        return [4 /*yield*/, field_template_service_1.fieldTemplateService.updateTemplate(parseInt(id), userId, { name: name_2, description: description, fieldValues: fieldValues, isPublic: isPublic })];
                    case 1:
                        template = _c.sent();
                        res.json({
                            success: true,
                            message: '模板更新成功',
                            data: template
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _c.sent();
                        console.error('❌ [字段模板] 更新失败:', error_5);
                        res.status(error_5.message === '模板不存在' ? 404 : 500).json({
                            success: false,
                            message: error_5.message || '更新模板失败'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除模板
     * DELETE /api/field-templates/:id
     */
    FieldTemplateController.prototype.deleteTemplate = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '未授权'
                                })];
                        }
                        return [4 /*yield*/, field_template_service_1.fieldTemplateService.deleteTemplate(parseInt(id), userId)];
                    case 1:
                        _b.sent();
                        res.json({
                            success: true,
                            message: '模板删除成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _b.sent();
                        console.error('❌ [字段模板] 删除失败:', error_6);
                        res.status(error_6.message === '模板不存在' ? 404 : 500).json({
                            success: false,
                            message: error_6.message || '删除模板失败'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取热门模板
     * GET /api/field-templates/popular/:entityType
     */
    FieldTemplateController.prototype.getPopularTemplates = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var entityType, limit, templates, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        entityType = req.params.entityType;
                        limit = req.query.limit;
                        return [4 /*yield*/, field_template_service_1.fieldTemplateService.getPopularTemplates(entityType, limit ? parseInt(limit) : undefined)];
                    case 1:
                        templates = _a.sent();
                        res.json({
                            success: true,
                            data: templates
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('❌ [字段模板] 获取热门模板失败:', error_7);
                        res.status(500).json({
                            success: false,
                            message: error_7.message || '获取热门模板失败'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取最近使用的模板
     * GET /api/field-templates/recent
     */
    FieldTemplateController.prototype.getRecentTemplates = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, _b, entityType, limit, templates, error_8;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        _b = req.query, entityType = _b.entityType, limit = _b.limit;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '未授权'
                                })];
                        }
                        return [4 /*yield*/, field_template_service_1.fieldTemplateService.getRecentTemplates(userId, entityType, limit ? parseInt(limit) : undefined)];
                    case 1:
                        templates = _c.sent();
                        res.json({
                            success: true,
                            data: templates
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _c.sent();
                        console.error('❌ [字段模板] 获取最近模板失败:', error_8);
                        res.status(500).json({
                            success: false,
                            message: error_8.message || '获取最近模板失败'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return FieldTemplateController;
}());
// 导出单例
exports.fieldTemplateController = new FieldTemplateController();
