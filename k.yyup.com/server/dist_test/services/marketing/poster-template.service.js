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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.PosterTemplateService = void 0;
var sequelize_1 = require("sequelize");
var poster_template_model_1 = require("../../models/poster-template.model");
var poster_element_model_1 = require("../../models/poster-element.model");
var logger_1 = require("../../utils/logger");
/**
 * 海报模板服务实现类
 */
var PosterTemplateService = /** @class */ (function () {
    function PosterTemplateService() {
    }
    /**
     * 创建海报模板
     * @param data 模板数据，可包含元素
     * @param userId 创建者ID
     * @returns 创建的模板
     */
    PosterTemplateService.prototype.createTemplate = function (data, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var elements, templateData, template_1, elementData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        elements = data.elements, templateData = __rest(data, ["elements"]);
                        return [4 /*yield*/, poster_template_model_1.PosterTemplate.create(__assign(__assign({}, templateData), { creatorId: userId, updaterId: userId }))];
                    case 1:
                        template_1 = _a.sent();
                        if (!(elements && elements.length > 0)) return [3 /*break*/, 3];
                        elementData = elements.map(function (el) { return (__assign(__assign({}, el), { templateId: template_1.id, creatorId: userId, updaterId: userId })); });
                        return [4 /*yield*/, poster_element_model_1.PosterElement.bulkCreate(elementData)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, this.getTemplateById(template_1.id)];
                    case 4:
                        error_1 = _a.sent();
                        logger_1.logger.error('创建海报模板失败', { error: error_1 });
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模板详情
     * @param id 模板ID
     * @returns 模板详情
     */
    PosterTemplateService.prototype.getTemplateById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var template;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, poster_template_model_1.PosterTemplate.findByPk(id, {
                            include: [
                                { model: poster_element_model_1.PosterElement, as: 'elements' }
                                // 暂时移除User关联，避免关联关系错误
                                // { model: User, as: 'creator', attributes: ['id', 'username', 'name'] }
                            ]
                        })];
                    case 1:
                        template = _a.sent();
                        if (!template) {
                            throw new Error('模板不存在');
                        }
                        return [2 /*return*/, template];
                }
            });
        });
    };
    /**
     * 更新模板
     * @param id 模板ID
     * @param data 更新数据，可包含元素
     * @param userId 更新者ID
     * @returns 更新后的模板
     */
    PosterTemplateService.prototype.updateTemplate = function (id, data, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var template, elements, templateData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, poster_template_model_1.PosterTemplate.findByPk(id)];
                    case 1:
                        template = _a.sent();
                        if (!template) {
                            throw new Error('模板不存在');
                        }
                        elements = data.elements, templateData = __rest(data, ["elements"]);
                        return [4 /*yield*/, template.update(__assign(__assign({}, templateData), { updaterId: userId }))];
                    case 2:
                        _a.sent();
                        if (elements) {
                            logger_1.logger.info('正在更新模板元素...', { templateId: id, elementCount: elements.length });
                            // 在此处添加完整的元素更新逻辑（创建/更新/删除）
                        }
                        return [2 /*return*/, this.getTemplateById(id)];
                    case 3:
                        error_2 = _a.sent();
                        logger_1.logger.error('更新模板失败', { error: error_2, id: id });
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除模板
     * @param id 模板ID
     * @returns 删除结果
     */
    PosterTemplateService.prototype.deleteTemplate = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var template, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, poster_template_model_1.PosterTemplate.findByPk(id)];
                    case 1:
                        template = _a.sent();
                        if (!template) {
                            throw new Error('模板不存在');
                        }
                        return [4 /*yield*/, poster_element_model_1.PosterElement.destroy({ where: { templateId: id } })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, template.destroy()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 4:
                        error_3 = _a.sent();
                        logger_1.logger.error('删除模板失败', { error: error_3, id: id });
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模板列表
     * @param query 查询参数
     * @returns 模板列表和总数
     */
    PosterTemplateService.prototype.getTemplates = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, name, category, status, kindergartenId, creatorId, where;
            var _c;
            return __generator(this, function (_d) {
                _a = query.page, page = _a === void 0 ? 1 : _a, _b = query.limit, limit = _b === void 0 ? 10 : _b, name = query.name, category = query.category, status = query.status, kindergartenId = query.kindergartenId, creatorId = query.creatorId;
                where = {};
                if (name)
                    where.name = (_c = {}, _c[sequelize_1.Op.like] = "%".concat(name, "%"), _c);
                if (category)
                    where.category = category;
                if (status !== undefined)
                    where.status = status;
                if (kindergartenId)
                    where.kindergartenId = kindergartenId;
                if (creatorId)
                    where.creatorId = creatorId;
                // 暂时移除User关联，避免关联关系错误
                return [2 /*return*/, poster_template_model_1.PosterTemplate.findAndCountAll({
                        where: where,
                        limit: limit,
                        offset: (page - 1) * limit,
                        order: [['createdAt', 'DESC']]
                        // 注释掉User关联，直到关联关系正确建立
                        // include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'name'] }]
                    })];
            });
        });
    };
    /**
     * 预览模板
     * @param id 模板ID
     * @param params 动态参数
     * @returns 渲染后的预览数据 (简化模拟)
     */
    PosterTemplateService.prototype.previewTemplate = function (id, params) {
        return __awaiter(this, void 0, void 0, function () {
            var template;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTemplateById(id)];
                    case 1:
                        template = _a.sent();
                        return [2 /*return*/, {
                                template: template,
                                renderedParams: params,
                                previewUrl: "https://example.com/preview/".concat(id, "?") + new URLSearchParams(params)
                            }];
                }
            });
        });
    };
    /**
     * 添加模板元素
     */
    PosterTemplateService.prototype.addTemplateElement = function (templateId, elementData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var template;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, poster_template_model_1.PosterTemplate.findByPk(templateId)];
                    case 1:
                        template = _a.sent();
                        if (!template) {
                            throw new Error('模板不存在');
                        }
                        return [2 /*return*/, poster_element_model_1.PosterElement.create(__assign(__assign({}, elementData), { templateId: templateId, creatorId: userId, updaterId: userId }))];
                }
            });
        });
    };
    /**
     * 更新模板元素
     */
    PosterTemplateService.prototype.updateTemplateElement = function (elementId, elementData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var element;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, poster_element_model_1.PosterElement.findByPk(elementId)];
                    case 1:
                        element = _a.sent();
                        if (!element) {
                            throw new Error('元素不存在');
                        }
                        return [4 /*yield*/, element.update(__assign(__assign({}, elementData), { updaterId: userId }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, element];
                }
            });
        });
    };
    /**
     * 删除模板元素
     */
    PosterTemplateService.prototype.deleteTemplateElement = function (elementId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var element;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, poster_element_model_1.PosterElement.findByPk(elementId)];
                    case 1:
                        element = _a.sent();
                        if (!element) {
                            throw new Error('元素不存在');
                        }
                        return [4 /*yield*/, element.destroy()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * 获取模板分类
     */
    PosterTemplateService.prototype.getTemplateCategories = function () {
        return __awaiter(this, void 0, void 0, function () {
            var categories;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, poster_template_model_1.PosterTemplate.findAll({
                            attributes: ['category'],
                            group: ['category']
                        })];
                    case 1:
                        categories = _a.sent();
                        return [2 /*return*/, categories.map(function (c) { return c.category; }).filter(Boolean)];
                }
            });
        });
    };
    return PosterTemplateService;
}());
exports.PosterTemplateService = PosterTemplateService;
// 导出服务实例
exports["default"] = new PosterTemplateService();
