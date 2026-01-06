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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.InspectionTypeController = void 0;
var inspection_type_model_1 = __importDefault(require("../models/inspection-type.model"));
var sequelize_1 = require("sequelize");
/**
 * 检查类型控制器
 */
var InspectionTypeController = /** @class */ (function () {
    function InspectionTypeController() {
    }
    /**
     * 获取检查类型列表
     */
    InspectionTypeController.prototype.getList = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, category, cityLevel, isActive, keyword, where, offset, limit, _d, count, rows, error_1;
            var _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 2, , 3]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, category = _a.category, cityLevel = _a.cityLevel, isActive = _a.isActive, keyword = _a.keyword;
                        where = {};
                        // 筛选条件
                        if (category) {
                            where.category = category;
                        }
                        if (cityLevel) {
                            where.cityLevel = cityLevel;
                        }
                        if (isActive !== undefined) {
                            where.isActive = isActive === 'true';
                        }
                        if (keyword) {
                            where[sequelize_1.Op.or] = [
                                { name: (_e = {}, _e[sequelize_1.Op.like] = "%".concat(keyword, "%"), _e) },
                                { description: (_f = {}, _f[sequelize_1.Op.like] = "%".concat(keyword, "%"), _f) },
                                { department: (_g = {}, _g[sequelize_1.Op.like] = "%".concat(keyword, "%"), _g) },
                            ];
                        }
                        offset = (Number(page) - 1) * Number(pageSize);
                        limit = Number(pageSize);
                        return [4 /*yield*/, inspection_type_model_1["default"].findAndCountAll({
                                where: where,
                                offset: offset,
                                limit: limit,
                                order: [['createdAt', 'DESC']]
                            })];
                    case 1:
                        _d = _h.sent(), count = _d.count, rows = _d.rows;
                        res.json({
                            success: true,
                            data: {
                                items: rows,
                                total: count,
                                page: Number(page),
                                pageSize: Number(pageSize)
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _h.sent();
                        console.error('获取检查类型列表失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: '获取检查类型列表失败',
                            error: error_1.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取检查类型详情
     */
    InspectionTypeController.prototype.getDetail = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, inspectionType, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, inspection_type_model_1["default"].findByPk(id)];
                    case 1:
                        inspectionType = _a.sent();
                        if (!inspectionType) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '检查类型不存在'
                                })];
                        }
                        res.json({
                            success: true,
                            data: inspectionType
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('获取检查类型详情失败:', error_2);
                        res.status(500).json({
                            success: false,
                            message: '获取检查类型详情失败',
                            error: error_2.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建检查类型
     */
    InspectionTypeController.prototype.create = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var inspectionType, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, inspection_type_model_1["default"].create(req.body)];
                    case 1:
                        inspectionType = _a.sent();
                        res.json({
                            success: true,
                            message: '创建成功',
                            data: inspectionType
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('创建检查类型失败:', error_3);
                        res.status(500).json({
                            success: false,
                            message: '创建检查类型失败',
                            error: error_3.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新检查类型
     */
    InspectionTypeController.prototype.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, inspectionType, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        return [4 /*yield*/, inspection_type_model_1["default"].findByPk(id)];
                    case 1:
                        inspectionType = _a.sent();
                        if (!inspectionType) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '检查类型不存在'
                                })];
                        }
                        return [4 /*yield*/, inspectionType.update(req.body)];
                    case 2:
                        _a.sent();
                        res.json({
                            success: true,
                            message: '更新成功',
                            data: inspectionType
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error('更新检查类型失败:', error_4);
                        res.status(500).json({
                            success: false,
                            message: '更新检查类型失败',
                            error: error_4.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除检查类型
     */
    InspectionTypeController.prototype["delete"] = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, inspectionType, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        return [4 /*yield*/, inspection_type_model_1["default"].findByPk(id)];
                    case 1:
                        inspectionType = _a.sent();
                        if (!inspectionType) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '检查类型不存在'
                                })];
                        }
                        return [4 /*yield*/, inspectionType.destroy()];
                    case 2:
                        _a.sent();
                        res.json({
                            success: true,
                            message: '删除成功'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error('删除检查类型失败:', error_5);
                        res.status(500).json({
                            success: false,
                            message: '删除检查类型失败',
                            error: error_5.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量删除检查类型
     */
    InspectionTypeController.prototype.batchDelete = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var ids, error_6;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        ids = req.body.ids;
                        if (!Array.isArray(ids) || ids.length === 0) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: 'ids必须是非空数组'
                                })];
                        }
                        return [4 /*yield*/, inspection_type_model_1["default"].destroy({
                                where: {
                                    id: (_a = {},
                                        _a[sequelize_1.Op["in"]] = ids,
                                        _a)
                                }
                            })];
                    case 1:
                        _b.sent();
                        res.json({
                            success: true,
                            message: '批量删除成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _b.sent();
                        console.error('批量删除检查类型失败:', error_6);
                        res.status(500).json({
                            success: false,
                            message: '批量删除检查类型失败',
                            error: error_6.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取所有启用的检查类型(用于下拉选择)
     */
    InspectionTypeController.prototype.getActiveList = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, category, cityLevel, where, inspectionTypes, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, category = _a.category, cityLevel = _a.cityLevel;
                        where = {
                            isActive: true
                        };
                        if (category) {
                            where.category = category;
                        }
                        if (cityLevel) {
                            where.cityLevel = cityLevel;
                        }
                        return [4 /*yield*/, inspection_type_model_1["default"].findAll({
                                where: where,
                                attributes: ['id', 'name', 'category', 'frequency', 'duration'],
                                order: [['name', 'ASC']]
                            })];
                    case 1:
                        inspectionTypes = _b.sent();
                        res.json({
                            success: true,
                            data: inspectionTypes
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _b.sent();
                        console.error('获取启用的检查类型失败:', error_7);
                        res.status(500).json({
                            success: false,
                            message: '获取启用的检查类型失败',
                            error: error_7.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return InspectionTypeController;
}());
exports.InspectionTypeController = InspectionTypeController;
exports["default"] = new InspectionTypeController();
