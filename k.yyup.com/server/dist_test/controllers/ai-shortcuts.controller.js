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
exports.AIShortcutsController = void 0;
var express_validator_1 = require("express-validator");
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
/**
 * AI快捷操作配置控制器
 */
var AIShortcutsController = /** @class */ (function () {
    function AIShortcutsController() {
        // 不需要初始化，直接使用sequelize
    }
    /**
     * 获取AI快捷操作列表（支持角色过滤）
     */
    AIShortcutsController.prototype.getShortcuts = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, role, category, is_active, _c, page, _d, pageSize, search, whereClause, params, searchTerm, countQuery, countResult, total, offset, dataQuery, shortcuts, response, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        _b = req.query, role = _b.role, category = _b.category, is_active = _b.is_active, _c = _b.page, page = _c === void 0 ? 1 : _c, _d = _b.pageSize, pageSize = _d === void 0 ? 20 : _d, search = _b.search;
                        whereClause = 'WHERE 1=1';
                        params = [];
                        // 角色过滤
                        if (role && role !== 'all') {
                            whereClause += ' AND (role = ? OR role = "all")';
                            params.push(role);
                        }
                        // 类别过滤
                        if (category) {
                            whereClause += ' AND category = ?';
                            params.push(category);
                        }
                        // 状态过滤
                        if (is_active !== undefined) {
                            whereClause += ' AND is_active = ?';
                            params.push(is_active === 'true' ? 1 : 0);
                        }
                        // 搜索过滤
                        if (search) {
                            whereClause += ' AND (shortcut_name LIKE ? OR prompt_name LIKE ? OR system_prompt LIKE ?)';
                            searchTerm = "%".concat(search, "%");
                            params.push(searchTerm, searchTerm, searchTerm);
                        }
                        countQuery = "SELECT COUNT(*) as total FROM ai_shortcuts ".concat(whereClause);
                        return [4 /*yield*/, init_1.sequelize.query(countQuery, {
                                replacements: params,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        countResult = _e.sent();
                        total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
                        offset = (Number(page) - 1) * Number(pageSize);
                        dataQuery = "\n        SELECT id, shortcut_name, prompt_name, category, role, api_endpoint, \n               is_active, sort_order, created_at, updated_at\n        FROM ai_shortcuts \n        ".concat(whereClause, "\n        ORDER BY sort_order ASC, created_at DESC\n        LIMIT ? OFFSET ?\n      ");
                        params.push(Number(pageSize), offset);
                        return [4 /*yield*/, init_1.sequelize.query(dataQuery, {
                                replacements: params,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        shortcuts = _e.sent();
                        response = {
                            success: true,
                            code: 200,
                            message: '获取AI快捷操作列表成功',
                            data: {
                                list: shortcuts,
                                pagination: {
                                    page: Number(page),
                                    pageSize: Number(pageSize),
                                    total: total,
                                    totalPages: Math.ceil(total / Number(pageSize))
                                }
                            }
                        };
                        res.json(response);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _e.sent();
                        console.error('获取AI快捷操作列表失败:', error_1);
                        res.status(500).json({
                            success: false,
                            code: 500,
                            message: '获取AI快捷操作列表失败',
                            error: error_1 instanceof Error ? error_1.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据ID获取AI快捷操作详情
     */
    AIShortcutsController.prototype.getShortcutById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, query, shortcuts, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        query = "\n        SELECT * FROM ai_shortcuts WHERE id = ?\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: [id],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        shortcuts = _a.sent();
                        if (shortcuts.length === 0) {
                            res.status(404).json({
                                success: false,
                                code: 404,
                                message: 'AI快捷操作不存在'
                            });
                            return [2 /*return*/];
                        }
                        response = {
                            success: true,
                            code: 200,
                            message: '获取AI快捷操作详情成功',
                            data: shortcuts[0]
                        };
                        res.json(response);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('获取AI快捷操作详情失败:', error_2);
                        res.status(500).json({
                            success: false,
                            code: 500,
                            message: '获取AI快捷操作详情失败',
                            error: error_2 instanceof Error ? error_2.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建AI快捷操作
     */
    AIShortcutsController.prototype.createShortcut = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, _a, shortcut_name, prompt_name, category, _b, role, system_prompt, api_endpoint, _c, is_active, _d, sort_order, existQuery, existResult, insertQuery, result, response, error_3;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        errors = (0, express_validator_1.validationResult)(req);
                        if (!errors.isEmpty()) {
                            res.status(400).json({
                                success: false,
                                code: 400,
                                message: '参数验证失败',
                                errors: errors.array()
                            });
                            return [2 /*return*/];
                        }
                        _a = req.body, shortcut_name = _a.shortcut_name, prompt_name = _a.prompt_name, category = _a.category, _b = _a.role, role = _b === void 0 ? 'all' : _b, system_prompt = _a.system_prompt, api_endpoint = _a.api_endpoint, _c = _a.is_active, is_active = _c === void 0 ? true : _c, _d = _a.sort_order, sort_order = _d === void 0 ? 0 : _d;
                        existQuery = 'SELECT id FROM ai_shortcuts WHERE prompt_name = ?';
                        return [4 /*yield*/, init_1.sequelize.query(existQuery, {
                                replacements: [prompt_name],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        existResult = _e.sent();
                        if (existResult.length > 0) {
                            res.status(400).json({
                                success: false,
                                code: 400,
                                message: '提示词名称已存在'
                            });
                            return [2 /*return*/];
                        }
                        insertQuery = "\n        INSERT INTO ai_shortcuts \n        (shortcut_name, prompt_name, category, role, system_prompt, api_endpoint, is_active, sort_order)\n        VALUES (?, ?, ?, ?, ?, ?, ?, ?)\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(insertQuery, {
                                replacements: [
                                    shortcut_name,
                                    prompt_name,
                                    category,
                                    role,
                                    system_prompt,
                                    api_endpoint,
                                    is_active,
                                    sort_order
                                ],
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 2:
                        result = _e.sent();
                        response = {
                            success: true,
                            code: 201,
                            message: '创建AI快捷操作成功',
                            data: {
                                id: result[0],
                                shortcut_name: shortcut_name,
                                prompt_name: prompt_name,
                                category: category,
                                role: role,
                                api_endpoint: api_endpoint,
                                is_active: is_active,
                                sort_order: sort_order
                            }
                        };
                        res.status(201).json(response);
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _e.sent();
                        console.error('创建AI快捷操作失败:', error_3);
                        res.status(500).json({
                            success: false,
                            code: 500,
                            message: '创建AI快捷操作失败',
                            error: error_3 instanceof Error ? error_3.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新AI快捷操作
     */
    AIShortcutsController.prototype.updateShortcut = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, errors, existQuery, existResult, _a, shortcut_name, prompt_name, category, role, system_prompt, api_endpoint, is_active, sort_order, conflictQuery, conflictResult, updateFields, updateValues, updateQuery, response, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        id = req.params.id;
                        errors = (0, express_validator_1.validationResult)(req);
                        if (!errors.isEmpty()) {
                            res.status(400).json({
                                success: false,
                                code: 400,
                                message: '参数验证失败',
                                errors: errors.array()
                            });
                            return [2 /*return*/];
                        }
                        existQuery = 'SELECT id FROM ai_shortcuts WHERE id = ?';
                        return [4 /*yield*/, init_1.sequelize.query(existQuery, {
                                replacements: [id],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        existResult = _b.sent();
                        if (existResult.length === 0) {
                            res.status(404).json({
                                success: false,
                                code: 404,
                                message: 'AI快捷操作不存在'
                            });
                            return [2 /*return*/];
                        }
                        _a = req.body, shortcut_name = _a.shortcut_name, prompt_name = _a.prompt_name, category = _a.category, role = _a.role, system_prompt = _a.system_prompt, api_endpoint = _a.api_endpoint, is_active = _a.is_active, sort_order = _a.sort_order;
                        if (!prompt_name) return [3 /*break*/, 3];
                        conflictQuery = 'SELECT id FROM ai_shortcuts WHERE prompt_name = ? AND id != ?';
                        return [4 /*yield*/, init_1.sequelize.query(conflictQuery, {
                                replacements: [prompt_name, id],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        conflictResult = _b.sent();
                        if (conflictResult.length > 0) {
                            res.status(400).json({
                                success: false,
                                code: 400,
                                message: '提示词名称已存在'
                            });
                            return [2 /*return*/];
                        }
                        _b.label = 3;
                    case 3:
                        updateFields = [];
                        updateValues = [];
                        if (shortcut_name !== undefined) {
                            updateFields.push('shortcut_name = ?');
                            updateValues.push(shortcut_name);
                        }
                        if (prompt_name !== undefined) {
                            updateFields.push('prompt_name = ?');
                            updateValues.push(prompt_name);
                        }
                        if (category !== undefined) {
                            updateFields.push('category = ?');
                            updateValues.push(category);
                        }
                        if (role !== undefined) {
                            updateFields.push('role = ?');
                            updateValues.push(role);
                        }
                        if (system_prompt !== undefined) {
                            updateFields.push('system_prompt = ?');
                            updateValues.push(system_prompt);
                        }
                        if (api_endpoint !== undefined) {
                            updateFields.push('api_endpoint = ?');
                            updateValues.push(api_endpoint);
                        }
                        if (is_active !== undefined) {
                            updateFields.push('is_active = ?');
                            updateValues.push(is_active);
                        }
                        if (sort_order !== undefined) {
                            updateFields.push('sort_order = ?');
                            updateValues.push(sort_order);
                        }
                        if (updateFields.length === 0) {
                            res.status(400).json({
                                success: false,
                                code: 400,
                                message: '没有提供要更新的字段'
                            });
                            return [2 /*return*/];
                        }
                        updateValues.push(id);
                        updateQuery = "\n        UPDATE ai_shortcuts \n        SET ".concat(updateFields.join(', '), ", updated_at = CURRENT_TIMESTAMP\n        WHERE id = ?\n      ");
                        return [4 /*yield*/, init_1.sequelize.query(updateQuery, {
                                replacements: updateValues,
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 4:
                        _b.sent();
                        response = {
                            success: true,
                            code: 200,
                            message: '更新AI快捷操作成功'
                        };
                        res.json(response);
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _b.sent();
                        console.error('更新AI快捷操作失败:', error_4);
                        res.status(500).json({
                            success: false,
                            code: 500,
                            message: '更新AI快捷操作失败',
                            error: error_4 instanceof Error ? error_4.message : '未知错误'
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除AI快捷操作（软删除）
     */
    AIShortcutsController.prototype.deleteShortcut = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, existQuery, existResult, deleteQuery, response, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        existQuery = 'SELECT id FROM ai_shortcuts WHERE id = ?';
                        return [4 /*yield*/, init_1.sequelize.query(existQuery, {
                                replacements: [id],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        existResult = _a.sent();
                        if (existResult.length === 0) {
                            res.status(404).json({
                                success: false,
                                code: 404,
                                message: 'AI快捷操作不存在'
                            });
                            return [2 /*return*/];
                        }
                        deleteQuery = "\n        UPDATE ai_shortcuts\n        SET is_active = false, updated_at = CURRENT_TIMESTAMP\n        WHERE id = ?\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(deleteQuery, {
                                replacements: [id],
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 2:
                        _a.sent();
                        response = {
                            success: true,
                            code: 200,
                            message: '删除AI快捷操作成功'
                        };
                        res.json(response);
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error('删除AI快捷操作失败:', error_5);
                        res.status(500).json({
                            success: false,
                            code: 500,
                            message: '删除AI快捷操作失败',
                            error: error_5 instanceof Error ? error_5.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量删除AI快捷操作
     */
    AIShortcutsController.prototype.batchDeleteShortcuts = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var ids, placeholders, deleteQuery, result, response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        ids = req.body.ids;
                        if (!Array.isArray(ids) || ids.length === 0) {
                            res.status(400).json({
                                success: false,
                                code: 400,
                                message: '请提供要删除的ID列表'
                            });
                            return [2 /*return*/];
                        }
                        placeholders = ids.map(function () { return '?'; }).join(',');
                        deleteQuery = "\n        UPDATE ai_shortcuts\n        SET is_active = false, updated_at = CURRENT_TIMESTAMP\n        WHERE id IN (".concat(placeholders, ")\n      ");
                        return [4 /*yield*/, init_1.sequelize.query(deleteQuery, {
                                replacements: ids,
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 1:
                        result = _a.sent();
                        response = {
                            success: true,
                            code: 200,
                            message: "\u6279\u91CF\u5220\u9664AI\u5FEB\u6377\u64CD\u4F5C\u6210\u529F\uFF0C\u5171\u5220\u9664".concat(result[1], "\u6761\u8BB0\u5F55")
                        };
                        res.json(response);
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('批量删除AI快捷操作失败:', error_6);
                        res.status(500).json({
                            success: false,
                            code: 500,
                            message: '批量删除AI快捷操作失败',
                            error: error_6 instanceof Error ? error_6.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新排序顺序
     */
    AIShortcutsController.prototype.updateSortOrder = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var sortData, updatePromises, response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sortData = req.body.sortData;
                        if (!Array.isArray(sortData) || sortData.length === 0) {
                            res.status(400).json({
                                success: false,
                                code: 400,
                                message: '请提供排序数据'
                            });
                            return [2 /*return*/];
                        }
                        updatePromises = sortData.map(function (item) {
                            var updateQuery = 'UPDATE ai_shortcuts SET sort_order = ? WHERE id = ?';
                            return init_1.sequelize.query(updateQuery, {
                                replacements: [item.sort_order, item.id],
                                type: sequelize_1.QueryTypes.UPDATE
                            });
                        });
                        return [4 /*yield*/, Promise.all(updatePromises)];
                    case 1:
                        _a.sent();
                        response = {
                            success: true,
                            code: 200,
                            message: '更新排序成功'
                        };
                        res.json(response);
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('更新排序失败:', error_7);
                        res.status(500).json({
                            success: false,
                            code: 500,
                            message: '更新排序失败',
                            error: error_7 instanceof Error ? error_7.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户可用的快捷操作（前端调用）
     */
    AIShortcutsController.prototype.getUserShortcuts = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userRole, query, shortcuts, response, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || 'all';
                        query = "\n        SELECT id, shortcut_name, prompt_name, category, api_endpoint, sort_order\n        FROM ai_shortcuts\n        WHERE is_active = true\n        AND (role = ? OR role = 'all' OR ? = 'admin')\n        ORDER BY sort_order ASC, created_at DESC\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: [userRole, userRole],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        shortcuts = _b.sent();
                        response = {
                            success: true,
                            code: 200,
                            message: '获取用户快捷操作成功',
                            data: shortcuts
                        };
                        res.json(response);
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _b.sent();
                        console.error('获取用户快捷操作失败:', error_8);
                        res.status(500).json({
                            success: false,
                            code: 500,
                            message: '获取用户快捷操作失败',
                            error: error_8 instanceof Error ? error_8.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据ID获取快捷操作配置（用于AI调用）
     */
    AIShortcutsController.prototype.getShortcutConfig = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, userRole, query, shortcuts, response, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || 'all';
                        query = "\n        SELECT id, shortcut_name, prompt_name, category, role, system_prompt, api_endpoint\n        FROM ai_shortcuts\n        WHERE id = ? AND is_active = true\n        AND (role = ? OR role = 'all' OR ? = 'admin')\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: [id, userRole, userRole],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        shortcuts = _b.sent();
                        if (shortcuts.length === 0) {
                            res.status(404).json({
                                success: false,
                                code: 404,
                                message: 'AI快捷操作不存在或无权限访问'
                            });
                            return [2 /*return*/];
                        }
                        response = {
                            success: true,
                            code: 200,
                            message: '获取快捷操作配置成功',
                            data: shortcuts[0]
                        };
                        res.json(response);
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _b.sent();
                        console.error('获取快捷操作配置失败:', error_9);
                        res.status(500).json({
                            success: false,
                            code: 500,
                            message: '获取快捷操作配置失败',
                            error: error_9 instanceof Error ? error_9.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AIShortcutsController;
}());
exports.AIShortcutsController = AIShortcutsController;
exports["default"] = new AIShortcutsController();
