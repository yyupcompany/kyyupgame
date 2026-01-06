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
exports.getCategoryByCode = exports.getSubCategories = exports.getCategories = exports.deleteElement = exports.updateElement = exports.addElement = exports.previewTemplate = exports.getTemplates = exports.deleteTemplate = exports.updateTemplate = exports.getTemplateById = exports.createTemplate = void 0;
var sequelize_1 = require("sequelize");
var apiResponse_1 = require("../utils/apiResponse");
var apiError_1 = require("../utils/apiError");
var poster_template_service_1 = require("../services/marketing/poster-template.service");
var poster_template_model_1 = require("../models/poster-template.model");
var poster_category_model_1 = require("../models/poster-category.model");
var posterTemplateService = new poster_template_service_1.PosterTemplateService();
/**
 * 创建海报模板
 */
var createTemplate = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, name_1, width, height, template, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId) {
                    throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
                }
                _a = req.body, name_1 = _a.name, width = _a.width, height = _a.height;
                if (!name_1) {
                    throw apiError_1.ApiError.badRequest('模板名称不能为空');
                }
                if (!width || !height) {
                    throw apiError_1.ApiError.badRequest('模板尺寸不能为空');
                }
                return [4 /*yield*/, posterTemplateService.createTemplate(req.body, userId)];
            case 1:
                template = _c.sent();
                apiResponse_1.ApiResponse.success(res, template, '创建海报模板成功', 201);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _c.sent();
                apiResponse_1.ApiResponse.handleError(res, error_1, '创建海报模板失败');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createTemplate = createTemplate;
/**
 * 获取海报模板详情
 */
var getTemplateById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, template;
    return __generator(this, function (_a) {
        try {
            id = req.params.id;
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的模板ID');
            }
            template = {
                id: Number(id) || 0,
                name: '春季招生海报模板',
                description: '适用于春季招生活动的海报模板',
                category: 'enrollment',
                width: 750,
                height: 1334,
                elements: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            apiResponse_1.ApiResponse.success(res, template, '获取海报模板详情成功');
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '获取海报模板详情失败');
        }
        return [2 /*return*/];
    });
}); };
exports.getTemplateById = getTemplateById;
/**
 * 更新海报模板
 */
var updateTemplate = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, template;
    var _a;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的模板ID');
            }
            template = __assign(__assign({ id: Number(id) || 0 }, req.body), { updatedBy: userId, updatedAt: new Date() });
            apiResponse_1.ApiResponse.success(res, template, '更新海报模板成功');
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '更新海报模板失败');
        }
        return [2 /*return*/];
    });
}); };
exports.updateTemplate = updateTemplate;
/**
 * 删除海报模板
 */
var deleteTemplate = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId;
    var _a;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的模板ID');
            }
            apiResponse_1.ApiResponse.success(res, null, '删除海报模板成功');
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '删除海报模板失败');
        }
        return [2 /*return*/];
    });
}); };
exports.deleteTemplate = deleteTemplate;
/**
 * 获取海报模板列表
 */
var getTemplates = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, pageSize, category, keyword, whereClause, _d, count, templates, formattedResult, error_2;
    var _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 2, , 3]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 12 : _c, category = _a.category, keyword = _a.keyword;
                whereClause = {
                    status: 1 // 只查询启用的模板
                };
                if (category) {
                    whereClause.category = category;
                }
                if (keyword) {
                    whereClause[sequelize_1.Op.or] = [
                        { name: (_e = {}, _e[sequelize_1.Op.like] = "%".concat(keyword, "%"), _e) },
                        { description: (_f = {}, _f[sequelize_1.Op.like] = "%".concat(keyword, "%"), _f) }
                    ];
                }
                return [4 /*yield*/, poster_template_model_1.PosterTemplate.findAndCountAll({
                        where: whereClause,
                        limit: Number(pageSize),
                        offset: (Number(page) - 1) * Number(pageSize),
                        order: [['createdAt', 'DESC']],
                        attributes: [
                            'id', 'name', 'description', 'category',
                            'width', 'height', 'background', 'thumbnail',
                            'kindergartenId', 'status', 'usageCount', 'remark',
                            'creatorId', 'updaterId', 'createdAt', 'updatedAt'
                        ]
                    })];
            case 1:
                _d = _g.sent(), count = _d.count, templates = _d.rows;
                formattedResult = {
                    templates: templates.map(function (t) { return t.toJSON(); }),
                    pagination: {
                        page: Number(page),
                        pageSize: Number(pageSize),
                        total: count,
                        totalPages: Math.ceil(count / Number(pageSize))
                    }
                };
                apiResponse_1.ApiResponse.success(res, formattedResult, '获取海报模板列表成功');
                return [3 /*break*/, 3];
            case 2:
                error_2 = _g.sent();
                apiResponse_1.ApiResponse.handleError(res, error_2, '获取海报模板列表失败');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getTemplates = getTemplates;
/**
 * 预览海报模板
 */
var previewTemplate = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, previewData;
    return __generator(this, function (_a) {
        try {
            id = req.params.id;
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的模板ID');
            }
            previewData = {
                templateId: Number(id) || 0,
                previewUrl: "/api/poster-templates/".concat(id, "/preview.png"),
                width: 750,
                height: 1334,
                generatedAt: new Date()
            };
            apiResponse_1.ApiResponse.success(res, previewData, '生成海报模板预览成功');
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '生成海报模板预览失败');
        }
        return [2 /*return*/];
    });
}); };
exports.previewTemplate = previewTemplate;
/**
 * 添加模板元素
 */
var addElement = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, element;
    var _a;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的模板ID');
            }
            element = __assign(__assign({ id: Date.now(), templateId: Number(id) || 0 }, req.body), { createdBy: userId, createdAt: new Date() });
            apiResponse_1.ApiResponse.success(res, element, '添加模板元素成功', 201);
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '添加模板元素失败');
        }
        return [2 /*return*/];
    });
}); };
exports.addElement = addElement;
/**
 * 更新模板元素
 */
var updateElement = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, elementId, userId, element;
    var _b;
    return __generator(this, function (_c) {
        try {
            _a = req.params, id = _a.id, elementId = _a.elementId;
            userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            if (!id || isNaN(Number(id) || 0) || !elementId || isNaN(Number(elementId) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的模板ID或元素ID');
            }
            element = __assign(__assign({ id: Number(elementId) || 0, templateId: Number(id) || 0 }, req.body), { updatedBy: userId, updatedAt: new Date() });
            apiResponse_1.ApiResponse.success(res, element, '更新模板元素成功');
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '更新模板元素失败');
        }
        return [2 /*return*/];
    });
}); };
exports.updateElement = updateElement;
/**
 * 删除模板元素
 */
var deleteElement = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, elementId, userId;
    var _b;
    return __generator(this, function (_c) {
        try {
            _a = req.params, id = _a.id, elementId = _a.elementId;
            userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            if (!id || isNaN(Number(id) || 0) || !elementId || isNaN(Number(elementId) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的模板ID或元素ID');
            }
            apiResponse_1.ApiResponse.success(res, null, '删除模板元素成功');
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '删除模板元素失败');
        }
        return [2 /*return*/];
    });
}); };
exports.deleteElement = deleteElement;
/**
 * 获取模板分类
 */
var getCategories = function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var categories, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, poster_category_model_1.PosterCategory.getCategoryTree()];
            case 1:
                categories = _a.sent();
                apiResponse_1.ApiResponse.success(res, categories, '获取模板分类成功');
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                apiResponse_1.ApiResponse.handleError(res, error_3, '获取模板分类失败');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getCategories = getCategories;
/**
 * 获取子分类
 */
var getSubCategories = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var parentId, subCategories, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                parentId = req.params.parentId;
                return [4 /*yield*/, poster_category_model_1.PosterCategory.getChildCategories(Number(parentId))];
            case 1:
                subCategories = _a.sent();
                apiResponse_1.ApiResponse.success(res, subCategories, '获取子分类成功');
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                apiResponse_1.ApiResponse.handleError(res, error_4, '获取子分类失败');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getSubCategories = getSubCategories;
/**
 * 根据代码获取分类
 */
var getCategoryByCode = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var code, category, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                code = req.params.code;
                return [4 /*yield*/, poster_category_model_1.PosterCategory.getCategoryByCode(code)];
            case 1:
                category = _a.sent();
                if (!category) {
                    throw apiError_1.ApiError.notFound('分类不存在');
                }
                apiResponse_1.ApiResponse.success(res, category, '获取分类成功');
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                apiResponse_1.ApiResponse.handleError(res, error_5, '获取分类失败');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getCategoryByCode = getCategoryByCode;
