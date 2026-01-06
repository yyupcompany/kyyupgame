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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.TaskTemplateService = void 0;
var database_service_1 = require("./database.service");
var TaskTemplateService = /** @class */ (function () {
    function TaskTemplateService() {
        this.db = new database_service_1.DatabaseService();
    }
    /**
     * 获取模板列表
     */
    TaskTemplateService.prototype.getTemplates = function (filters) {
        if (filters === void 0) { filters = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, params, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        whereClause = 'WHERE 1=1';
                        params = [];
                        if (filters.type) {
                            whereClause += ' AND type = ?';
                            params.push(filters.type);
                        }
                        if (filters.category) {
                            whereClause += ' AND category = ?';
                            params.push(filters.category);
                        }
                        if (filters.is_active !== undefined) {
                            whereClause += ' AND is_active = ?';
                            params.push(filters.is_active ? 1 : 0);
                        }
                        if (filters.is_public !== undefined) {
                            whereClause += ' AND is_public = ?';
                            params.push(filters.is_public ? 1 : 0);
                        }
                        if (filters.created_by) {
                            whereClause += ' AND created_by = ?';
                            params.push(filters.created_by);
                        }
                        query = "\n      SELECT \n        tt.*,\n        u.name as creator_name\n      FROM task_templates tt\n      LEFT JOIN users u ON tt.created_by = u.id\n      ".concat(whereClause, "\n      ORDER BY tt.usage_count DESC, tt.created_at DESC\n    ");
                        return [4 /*yield*/, this.db.query(query, params)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 根据ID获取模板
     */
    TaskTemplateService.prototype.getTemplateById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var query, template;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      SELECT \n        tt.*,\n        u.name as creator_name\n      FROM task_templates tt\n      LEFT JOIN users u ON tt.created_by = u.id\n      WHERE tt.id = ?\n    ";
                        return [4 /*yield*/, this.db.query(query, [id])];
                    case 1:
                        template = (_a.sent())[0];
                        return [2 /*return*/, template || null];
                }
            });
        });
    };
    /**
     * 创建模板
     */
    TaskTemplateService.prototype.createTemplate = function (templateData) {
        return __awaiter(this, void 0, void 0, function () {
            var name, description, type, category, template_content, _a, default_priority, default_estimated_hours, _b, is_active, _c, is_public, created_by, query, params, result, templateId;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        name = templateData.name, description = templateData.description, type = templateData.type, category = templateData.category, template_content = templateData.template_content, _a = templateData.default_priority, default_priority = _a === void 0 ? 'medium' : _a, default_estimated_hours = templateData.default_estimated_hours, _b = templateData.is_active, is_active = _b === void 0 ? true : _b, _c = templateData.is_public, is_public = _c === void 0 ? true : _c, created_by = templateData.created_by;
                        query = "\n      INSERT INTO task_templates (\n        name, description, type, category, template_content,\n        default_priority, default_estimated_hours, is_active, is_public, created_by\n      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n    ";
                        params = [
                            name,
                            description,
                            type,
                            category,
                            JSON.stringify(template_content),
                            default_priority,
                            default_estimated_hours,
                            is_active ? 1 : 0,
                            is_public ? 1 : 0,
                            created_by
                        ];
                        return [4 /*yield*/, this.db.query(query, params)];
                    case 1:
                        result = _d.sent();
                        templateId = result.insertId;
                        return [2 /*return*/, this.getTemplateById(templateId)];
                }
            });
        });
    };
    /**
     * 更新模板
     */
    TaskTemplateService.prototype.updateTemplate = function (id, updateData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var existingTemplate, updateFields, params, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTemplateById(id)];
                    case 1:
                        existingTemplate = _a.sent();
                        if (!existingTemplate) {
                            throw new Error('模板不存在');
                        }
                        if (existingTemplate.created_by !== userId) {
                            throw new Error('无权限修改此模板');
                        }
                        updateFields = [];
                        params = [];
                        Object.keys(updateData).forEach(function (key) {
                            if (key !== 'id' && updateData[key] !== undefined) {
                                updateFields.push("".concat(key, " = ?"));
                                if (key === 'template_content') {
                                    params.push(JSON.stringify(updateData[key]));
                                }
                                else if (key === 'is_active' || key === 'is_public') {
                                    params.push(updateData[key] ? 1 : 0);
                                }
                                else {
                                    params.push(updateData[key]);
                                }
                            }
                        });
                        if (updateFields.length === 0) {
                            return [2 /*return*/, existingTemplate];
                        }
                        query = "\n      UPDATE task_templates \n      SET ".concat(updateFields.join(', '), ", updated_at = CURRENT_TIMESTAMP\n      WHERE id = ?\n    ");
                        return [4 /*yield*/, this.db.query(query, __spreadArray(__spreadArray([], params, true), [id], false))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.getTemplateById(id)];
                }
            });
        });
    };
    /**
     * 删除模板
     */
    TaskTemplateService.prototype.deleteTemplate = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var existingTemplate, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTemplateById(id)];
                    case 1:
                        existingTemplate = _a.sent();
                        if (!existingTemplate) {
                            throw new Error('模板不存在');
                        }
                        if (existingTemplate.created_by !== userId) {
                            throw new Error('无权限删除此模板');
                        }
                        query = 'UPDATE task_templates SET is_active = 0 WHERE id = ?';
                        return [4 /*yield*/, this.db.query(query, [id])];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模板分类
     */
    TaskTemplateService.prototype.getTemplateCategories = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, params, query, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        whereClause = 'WHERE is_active = 1 AND category IS NOT NULL';
                        params = [];
                        if (type) {
                            whereClause += ' AND type = ?';
                            params.push(type);
                        }
                        query = "\n      SELECT DISTINCT category\n      FROM task_templates\n      ".concat(whereClause, "\n      ORDER BY category\n    ");
                        return [4 /*yield*/, this.db.query(query, params)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.map(function (row) { return row.category; })];
                }
            });
        });
    };
    /**
     * 获取热门模板
     */
    TaskTemplateService.prototype.getPopularTemplates = function (limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      SELECT \n        tt.*,\n        u.name as creator_name\n      FROM task_templates tt\n      LEFT JOIN users u ON tt.created_by = u.id\n      WHERE tt.is_active = 1 AND tt.is_public = 1\n      ORDER BY tt.usage_count DESC, tt.created_at DESC\n      LIMIT ?\n    ";
                        return [4 /*yield*/, this.db.query(query, [limit])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 搜索模板
     */
    TaskTemplateService.prototype.searchTemplates = function (keyword, filters) {
        if (filters === void 0) { filters = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, params, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        whereClause = 'WHERE (tt.name LIKE ? OR tt.description LIKE ?)';
                        params = ["%".concat(keyword, "%"), "%".concat(keyword, "%")];
                        if (filters.type) {
                            whereClause += ' AND tt.type = ?';
                            params.push(filters.type);
                        }
                        if (filters.category) {
                            whereClause += ' AND tt.category = ?';
                            params.push(filters.category);
                        }
                        if (filters.is_active !== undefined) {
                            whereClause += ' AND tt.is_active = ?';
                            params.push(filters.is_active ? 1 : 0);
                        }
                        query = "\n      SELECT \n        tt.*,\n        u.name as creator_name\n      FROM task_templates tt\n      LEFT JOIN users u ON tt.created_by = u.id\n      ".concat(whereClause, "\n      ORDER BY tt.usage_count DESC, tt.created_at DESC\n    ");
                        return [4 /*yield*/, this.db.query(query, params)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 复制模板
     */
    TaskTemplateService.prototype.duplicateTemplate = function (id, userId, newName) {
        return __awaiter(this, void 0, void 0, function () {
            var originalTemplate, templateData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTemplateById(id)];
                    case 1:
                        originalTemplate = _a.sent();
                        if (!originalTemplate) {
                            throw new Error('模板不存在');
                        }
                        templateData = {
                            name: newName || "".concat(originalTemplate.name, " (\u526F\u672C)"),
                            description: originalTemplate.description,
                            type: originalTemplate.type,
                            category: originalTemplate.category,
                            template_content: JSON.parse(originalTemplate.template_content),
                            default_priority: originalTemplate.default_priority,
                            default_estimated_hours: originalTemplate.default_estimated_hours,
                            is_active: true,
                            is_public: false,
                            created_by: userId
                        };
                        return [2 /*return*/, this.createTemplate(templateData)];
                }
            });
        });
    };
    /**
     * 增加模板使用次数
     */
    TaskTemplateService.prototype.incrementUsageCount = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = 'UPDATE task_templates SET usage_count = usage_count + 1 WHERE id = ?';
                        return [4 /*yield*/, this.db.query(query, [id])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模板统计信息
     */
    TaskTemplateService.prototype.getTemplateStats = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, params, query, stats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        whereClause = 'WHERE 1=1';
                        params = [];
                        if (userId) {
                            whereClause += ' AND created_by = ?';
                            params.push(userId);
                        }
                        query = "\n      SELECT \n        COUNT(*) as total_templates,\n        SUM(CASE WHEN type = 'enrollment' THEN 1 ELSE 0 END) as enrollment_templates,\n        SUM(CASE WHEN type = 'activity' THEN 1 ELSE 0 END) as activity_templates,\n        SUM(CASE WHEN type = 'daily' THEN 1 ELSE 0 END) as daily_templates,\n        SUM(CASE WHEN type = 'management' THEN 1 ELSE 0 END) as management_templates,\n        SUM(usage_count) as total_usage,\n        AVG(usage_count) as avg_usage,\n        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_templates,\n        SUM(CASE WHEN is_public = 1 THEN 1 ELSE 0 END) as public_templates\n      FROM task_templates\n      ".concat(whereClause, "\n    ");
                        return [4 /*yield*/, this.db.query(query, params)];
                    case 1:
                        stats = (_a.sent())[0];
                        return [2 /*return*/, stats];
                }
            });
        });
    };
    return TaskTemplateService;
}());
exports.TaskTemplateService = TaskTemplateService;
