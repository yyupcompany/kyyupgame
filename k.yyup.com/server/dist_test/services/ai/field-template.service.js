"use strict";
/**
 * 字段模板服务
 *
 * 功能：
 * 1. 创建字段模板
 * 2. 获取用户模板列表
 * 3. 获取公开模板列表
 * 4. 应用模板
 * 5. 更新模板
 * 6. 删除模板
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
exports.fieldTemplateService = void 0;
var field_template_model_1 = __importDefault(require("../../models/field-template.model"));
var sequelize_1 = require("sequelize");
/**
 * 字段模板服务类
 */
var FieldTemplateService = /** @class */ (function () {
    function FieldTemplateService() {
    }
    /**
     * 创建字段模板
     */
    FieldTemplateService.prototype.createTemplate = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var template, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDCDD [\u5B57\u6BB5\u6A21\u677F] \u521B\u5EFA\u6A21\u677F: ".concat(data.name));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, field_template_model_1["default"].create({
                                name: data.name,
                                description: data.description,
                                entity_type: data.entityType,
                                field_values: data.fieldValues,
                                user_id: data.userId,
                                is_public: data.isPublic || false,
                                usage_count: 0
                            })];
                    case 2:
                        template = _a.sent();
                        console.log("\u2705 [\u5B57\u6BB5\u6A21\u677F] \u6A21\u677F\u521B\u5EFA\u6210\u529F: ID ".concat(template.id));
                        return [2 /*return*/, template];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ [字段模板] 创建失败:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模板列表
     */
    FieldTemplateService.prototype.getTemplateList = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, entityType, isPublic, _a, page, _b, pageSize, keyword, where, _c, count, rows, error_2;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        userId = params.userId, entityType = params.entityType, isPublic = params.isPublic, _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.pageSize, pageSize = _b === void 0 ? 20 : _b, keyword = params.keyword;
                        console.log("\uD83D\uDD0D [\u5B57\u6BB5\u6A21\u677F] \u83B7\u53D6\u6A21\u677F\u5217\u8868:", params);
                        where = {};
                        // 实体类型过滤
                        if (entityType) {
                            where.entity_type = entityType;
                        }
                        // 公开/私有过滤
                        if (isPublic !== undefined) {
                            if (isPublic) {
                                // 公开模板
                                where.is_public = true;
                            }
                            else if (userId) {
                                // 用户私有模板
                                where[sequelize_1.Op.and] = [
                                    { user_id: userId },
                                    { is_public: false }
                                ];
                            }
                        }
                        else if (userId) {
                            // 用户可见的所有模板（自己的私有模板 + 所有公开模板）
                            where[sequelize_1.Op.or] = [
                                { user_id: userId },
                                { is_public: true }
                            ];
                        }
                        // 关键词搜索
                        if (keyword) {
                            where[sequelize_1.Op.or] = [
                                { name: (_d = {}, _d[sequelize_1.Op.like] = "%".concat(keyword, "%"), _d) },
                                { description: (_e = {}, _e[sequelize_1.Op.like] = "%".concat(keyword, "%"), _e) }
                            ];
                        }
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, field_template_model_1["default"].findAndCountAll({
                                where: where,
                                limit: pageSize,
                                offset: (page - 1) * pageSize,
                                order: [
                                    ['usage_count', 'DESC'],
                                    ['created_at', 'DESC']
                                ]
                            })];
                    case 2:
                        _c = _f.sent(), count = _c.count, rows = _c.rows;
                        console.log("\u2705 [\u5B57\u6BB5\u6A21\u677F] \u83B7\u53D6\u6A21\u677F\u5217\u8868\u6210\u529F: \u5171 ".concat(count, " \u6761"));
                        return [2 /*return*/, {
                                items: rows,
                                total: count,
                                page: page,
                                pageSize: pageSize
                            }];
                    case 3:
                        error_2 = _f.sent();
                        console.error('❌ [字段模板] 获取列表失败:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模板详情
     */
    FieldTemplateService.prototype.getTemplateById = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var template, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDD0D [\u5B57\u6BB5\u6A21\u677F] \u83B7\u53D6\u6A21\u677F\u8BE6\u60C5: ID ".concat(id));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, field_template_model_1["default"].findByPk(id)];
                    case 2:
                        template = _a.sent();
                        if (!template) {
                            throw new Error('模板不存在');
                        }
                        // 权限检查：只有创建者或公开模板可以查看
                        if (!template.is_public && userId && template.user_id !== userId) {
                            throw new Error('无权访问此模板');
                        }
                        console.log("\u2705 [\u5B57\u6BB5\u6A21\u677F] \u83B7\u53D6\u6A21\u677F\u8BE6\u60C5\u6210\u529F");
                        return [2 /*return*/, template];
                    case 3:
                        error_3 = _a.sent();
                        console.error('❌ [字段模板] 获取详情失败:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 应用模板（增加使用次数）
     */
    FieldTemplateService.prototype.applyTemplate = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var template, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83C\uDFAF [\u5B57\u6BB5\u6A21\u677F] \u5E94\u7528\u6A21\u677F: ID ".concat(id));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getTemplateById(id, userId)];
                    case 2:
                        template = _a.sent();
                        // 增加使用次数
                        return [4 /*yield*/, template.increment('usage_count')];
                    case 3:
                        // 增加使用次数
                        _a.sent();
                        console.log("\u2705 [\u5B57\u6BB5\u6A21\u677F] \u6A21\u677F\u5E94\u7528\u6210\u529F\uFF0C\u4F7F\u7528\u6B21\u6570: ".concat(template.usage_count + 1));
                        return [2 /*return*/, template.field_values];
                    case 4:
                        error_4 = _a.sent();
                        console.error('❌ [字段模板] 应用失败:', error_4);
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新模板
     */
    FieldTemplateService.prototype.updateTemplate = function (id, userId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var template, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDCDD [\u5B57\u6BB5\u6A21\u677F] \u66F4\u65B0\u6A21\u677F: ID ".concat(id));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, field_template_model_1["default"].findByPk(id)];
                    case 2:
                        template = _a.sent();
                        if (!template) {
                            throw new Error('模板不存在');
                        }
                        // 权限检查：只有创建者可以更新
                        if (template.user_id !== userId) {
                            throw new Error('无权修改此模板');
                        }
                        // 更新字段
                        if (data.name !== undefined)
                            template.name = data.name;
                        if (data.description !== undefined)
                            template.description = data.description;
                        if (data.fieldValues !== undefined)
                            template.field_values = data.fieldValues;
                        if (data.isPublic !== undefined)
                            template.is_public = data.isPublic;
                        return [4 /*yield*/, template.save()];
                    case 3:
                        _a.sent();
                        console.log("\u2705 [\u5B57\u6BB5\u6A21\u677F] \u6A21\u677F\u66F4\u65B0\u6210\u529F");
                        return [2 /*return*/, template];
                    case 4:
                        error_5 = _a.sent();
                        console.error('❌ [字段模板] 更新失败:', error_5);
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除模板
     */
    FieldTemplateService.prototype.deleteTemplate = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var template, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDDD1\uFE0F [\u5B57\u6BB5\u6A21\u677F] \u5220\u9664\u6A21\u677F: ID ".concat(id));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, field_template_model_1["default"].findByPk(id)];
                    case 2:
                        template = _a.sent();
                        if (!template) {
                            throw new Error('模板不存在');
                        }
                        // 权限检查：只有创建者可以删除
                        if (template.user_id !== userId) {
                            throw new Error('无权删除此模板');
                        }
                        return [4 /*yield*/, template.destroy()];
                    case 3:
                        _a.sent();
                        console.log("\u2705 [\u5B57\u6BB5\u6A21\u677F] \u6A21\u677F\u5220\u9664\u6210\u529F");
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _a.sent();
                        console.error('❌ [字段模板] 删除失败:', error_6);
                        throw error_6;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取热门模板（按使用次数排序）
     */
    FieldTemplateService.prototype.getPopularTemplates = function (entityType, limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var templates, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDD25 [\u5B57\u6BB5\u6A21\u677F] \u83B7\u53D6\u70ED\u95E8\u6A21\u677F: ".concat(entityType));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, field_template_model_1["default"].findAll({
                                where: {
                                    entity_type: entityType,
                                    is_public: true
                                },
                                order: [['usage_count', 'DESC']],
                                limit: limit
                            })];
                    case 2:
                        templates = _a.sent();
                        console.log("\u2705 [\u5B57\u6BB5\u6A21\u677F] \u83B7\u53D6\u70ED\u95E8\u6A21\u677F\u6210\u529F: ".concat(templates.length, " \u6761"));
                        return [2 /*return*/, templates];
                    case 3:
                        error_7 = _a.sent();
                        console.error('❌ [字段模板] 获取热门模板失败:', error_7);
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户最近使用的模板
     */
    FieldTemplateService.prototype.getRecentTemplates = function (userId, entityType, limit) {
        if (limit === void 0) { limit = 5; }
        return __awaiter(this, void 0, void 0, function () {
            var where, templates, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\u23F0 [\u5B57\u6BB5\u6A21\u677F] \u83B7\u53D6\u6700\u8FD1\u4F7F\u7528\u7684\u6A21\u677F: \u7528\u6237 ".concat(userId));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        where = {
                            user_id: userId
                        };
                        if (entityType) {
                            where.entity_type = entityType;
                        }
                        return [4 /*yield*/, field_template_model_1["default"].findAll({
                                where: where,
                                order: [['updated_at', 'DESC']],
                                limit: limit
                            })];
                    case 2:
                        templates = _a.sent();
                        console.log("\u2705 [\u5B57\u6BB5\u6A21\u677F] \u83B7\u53D6\u6700\u8FD1\u6A21\u677F\u6210\u529F: ".concat(templates.length, " \u6761"));
                        return [2 /*return*/, templates];
                    case 3:
                        error_8 = _a.sent();
                        console.error('❌ [字段模板] 获取最近模板失败:', error_8);
                        throw error_8;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return FieldTemplateService;
}());
// 导出单例
exports.fieldTemplateService = new FieldTemplateService();
