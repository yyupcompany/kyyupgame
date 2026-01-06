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
exports.DataImportController = void 0;
var data_import_service_1 = require("../services/data-import.service");
var data_validation_service_1 = require("../services/data-validation.service");
var apiError_1 = require("../utils/apiError");
var logger_1 = require("../utils/logger");
/**
 * 数据导入控制器
 * 处理数据导入工作流的所有HTTP请求
 */
var DataImportController = /** @class */ (function () {
    function DataImportController() {
        var _this = this;
        /**
         * 检查用户导入权限
         */
        this.checkPermission = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var importType, userId, hasPermission, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        importType = req.body.importType;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        if (!importType) {
                            throw apiError_1.ApiError.badRequest('导入类型不能为空');
                        }
                        return [4 /*yield*/, this.dataImportService.checkImportPermission(userId, importType)];
                    case 1:
                        hasPermission = _b.sent();
                        res.json({
                            success: true,
                            data: {
                                hasPermission: hasPermission,
                                importType: importType,
                                userId: userId
                            },
                            message: hasPermission ? '权限验证通过' : '权限不足'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        next(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 解析上传的文档
         */
        this.parseDocument = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, filePath, importType, userId, hasPermission, parsedData, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        _a = req.body, filePath = _a.filePath, importType = _a.importType;
                        userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        if (!filePath || !importType) {
                            throw apiError_1.ApiError.badRequest('文件路径和导入类型不能为空');
                        }
                        return [4 /*yield*/, this.dataImportService.checkImportPermission(userId, importType)];
                    case 1:
                        hasPermission = _c.sent();
                        if (!hasPermission) {
                            throw apiError_1.ApiError.forbidden('没有数据导入权限');
                        }
                        return [4 /*yield*/, this.dataImportService.parseDocument(filePath, importType)];
                    case 2:
                        parsedData = _c.sent();
                        res.json({
                            success: true,
                            data: parsedData,
                            message: '文档解析成功'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _c.sent();
                        next(error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取数据库表结构
         */
        this.getSchema = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var type, userId, hasPermission, schema, validationRules, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        type = req.params.type;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        if (!type) {
                            throw apiError_1.ApiError.badRequest('类型参数不能为空');
                        }
                        return [4 /*yield*/, this.dataImportService.checkImportPermission(userId, type)];
                    case 1:
                        hasPermission = _b.sent();
                        if (!hasPermission) {
                            throw apiError_1.ApiError.forbidden('没有数据导入权限');
                        }
                        return [4 /*yield*/, this.dataImportService.getDatabaseSchema(type)];
                    case 2:
                        schema = _b.sent();
                        validationRules = this.dataValidationService.getValidationRules(type);
                        res.json({
                            success: true,
                            data: {
                                schema: schema,
                                validationRules: validationRules,
                                type: type
                            },
                            message: '获取数据库结构成功'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _b.sent();
                        next(error_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 🎯 生成智能字段映射和对比表
         */
        this.generateMapping = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, documentFields, importType, sampleData, userId, hasPermission, databaseSchema, result, error_4;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        _a = req.body, documentFields = _a.documentFields, importType = _a.importType, sampleData = _a.sampleData;
                        userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        if (!documentFields || !importType) {
                            throw apiError_1.ApiError.badRequest('文档字段和导入类型不能为空');
                        }
                        return [4 /*yield*/, this.dataImportService.checkImportPermission(userId, importType)];
                    case 1:
                        hasPermission = _d.sent();
                        if (!hasPermission) {
                            throw apiError_1.ApiError.forbidden('没有数据导入权限');
                        }
                        return [4 /*yield*/, this.dataImportService.getDatabaseSchema(importType)];
                    case 2:
                        databaseSchema = _d.sent();
                        return [4 /*yield*/, this.dataImportService.generateFieldMapping(documentFields, databaseSchema, importType, sampleData)];
                    case 3:
                        result = _d.sent();
                        // 记录操作日志
                        logger_1.logger.info('字段映射生成成功', {
                            userId: userId,
                            importType: importType,
                            documentFieldsCount: documentFields.length,
                            willImportCount: result.summary.willImportCount,
                            willIgnoreCount: result.summary.willIgnoreCount,
                            canProceed: result.summary.canProceed
                        });
                        res.json({
                            success: true,
                            data: {
                                mappings: result.mappings,
                                comparisonTable: result.comparisonTable,
                                summary: result.summary,
                                databaseSchema: databaseSchema,
                                documentFields: documentFields
                            },
                            message: '字段映射分析完成'
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _d.sent();
                        logger_1.logger.error('字段映射生成失败', { error: error_4, userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id, importType: req.body.importType });
                        next(error_4);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 数据预览和验证
         */
        this.previewData = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, data, fieldMappings, importType, userId, hasPermission, databaseSchema, preview, error_5;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        _a = req.body, data = _a.data, fieldMappings = _a.fieldMappings, importType = _a.importType;
                        userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        if (!data || !fieldMappings || !importType) {
                            throw apiError_1.ApiError.badRequest('数据、字段映射和导入类型不能为空');
                        }
                        return [4 /*yield*/, this.dataImportService.checkImportPermission(userId, importType)];
                    case 1:
                        hasPermission = _c.sent();
                        if (!hasPermission) {
                            throw apiError_1.ApiError.forbidden('没有数据导入权限');
                        }
                        return [4 /*yield*/, this.dataImportService.getDatabaseSchema(importType)];
                    case 2:
                        databaseSchema = _c.sent();
                        return [4 /*yield*/, this.dataImportService.validateAndPreview(data, fieldMappings, databaseSchema)];
                    case 3:
                        preview = _c.sent();
                        res.json({
                            success: true,
                            data: preview,
                            message: '数据预览生成成功'
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _c.sent();
                        next(error_5);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 执行数据导入
         */
        this.executeImport = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, data, fieldMappings, importType, userId, hasPermission, validation, importResult, error_6;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        _a = req.body, data = _a.data, fieldMappings = _a.fieldMappings, importType = _a.importType;
                        userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        if (!data || !fieldMappings || !importType) {
                            throw apiError_1.ApiError.badRequest('数据、字段映射和导入类型不能为空');
                        }
                        return [4 /*yield*/, this.dataImportService.checkImportPermission(userId, importType)];
                    case 1:
                        hasPermission = _c.sent();
                        if (!hasPermission) {
                            throw apiError_1.ApiError.forbidden('没有数据导入权限');
                        }
                        validation = this.dataValidationService.validateBatch(data, importType);
                        if (validation.invalidRecords.length > 0) {
                            res.status(400).json({
                                success: false,
                                message: '数据验证失败',
                                data: {
                                    validRecords: validation.validRecords.length,
                                    invalidRecords: validation.invalidRecords.length,
                                    errors: validation.invalidRecords
                                }
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.dataImportService.executeBatchInsert(validation.validRecords, fieldMappings, importType, userId)];
                    case 2:
                        importResult = _c.sent();
                        res.json({
                            success: importResult.success,
                            data: importResult,
                            message: importResult.success ? '数据导入成功' : '数据导入部分成功'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _c.sent();
                        next(error_6);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取导入历史记录
         */
        this.getImportHistory = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId, _a, _b, page, _c, pageSize, importType;
            var _d;
            return __generator(this, function (_e) {
                try {
                    userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.id;
                    _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, importType = _a.importType;
                    if (!userId) {
                        throw apiError_1.ApiError.unauthorized('用户未登录');
                    }
                    // TODO: 实现导入历史查询逻辑
                    // 从操作日志中查询用户的导入记录    // const mockHistory = {
                    //         total: 0,
                    //         page: parseInt(page as string),
                    //         pageSize: parseInt(pageSize as string),
                    //         items: []
                    //       };
                    res.json({
                        success: true,
                        data: [],
                        message: '获取导入历史成功'
                    });
                }
                catch (error) {
                    next(error);
                }
                return [2 /*return*/];
            });
        }); };
        /**
         * 获取支持的导入类型
         */
        this.getSupportedTypes = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId_1, types, permissions, error_7;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId_1 = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId_1) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        types = ['student', 'parent', 'teacher'];
                        return [4 /*yield*/, Promise.all(types.map(function (type) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = {
                                                type: type
                                            };
                                            return [4 /*yield*/, this.dataImportService.checkImportPermission(userId_1, type)];
                                        case 1: return [2 /*return*/, (_a.hasPermission = _b.sent(),
                                                _a.displayName = this.getDisplayName(type),
                                                _a)];
                                    }
                                });
                            }); }))];
                    case 1:
                        permissions = _b.sent();
                        res.json({
                            success: true,
                            data: {
                                supportedTypes: permissions.filter(function (p) { return p.hasPermission; }),
                                allTypes: permissions
                            },
                            message: '获取支持的导入类型成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _b.sent();
                        next(error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.dataImportService = new data_import_service_1.DataImportService();
        this.dataValidationService = new data_validation_service_1.DataValidationService();
    }
    /**
     * 获取类型显示名称
     */
    DataImportController.prototype.getDisplayName = function (type) {
        var displayNames = {
            student: '学生',
            parent: '家长',
            teacher: '教师'
        };
        return displayNames[type] || type;
    };
    return DataImportController;
}());
exports.DataImportController = DataImportController;
