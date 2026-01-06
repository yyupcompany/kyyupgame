"use strict";
/**
 * 批量数据导入服务
 *
 * 功能：
 * 1. 解析CSV/Excel文件
 * 2. 批量检测缺失字段
 * 3. 批量创建数据记录
 * 4. 生成导入模板
 */
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.batchImportService = void 0;
var XLSX = __importStar(require("xlsx"));
var sync_1 = require("csv-parse/sync");
var entity_field_config_service_1 = require("./entity-field-config.service");
var user_context_provider_service_1 = require("./user-context-provider.service");
var field_recommendation_service_1 = require("./field-recommendation.service");
var models_1 = require("../../models");
/**
 * 批量数据导入服务类
 */
var BatchImportService = /** @class */ (function () {
    function BatchImportService() {
    }
    /**
     * 解析Excel文件
     */
    BatchImportService.prototype.parseExcelFile = function (buffer) {
        try {
            var workbook = XLSX.read(buffer, { type: 'buffer' });
            var sheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[sheetName];
            var data = XLSX.utils.sheet_to_json(worksheet);
            console.log("\uD83D\uDCCA [Excel\u89E3\u6790] \u6210\u529F\u89E3\u6790 ".concat(data.length, " \u884C\u6570\u636E"));
            return data;
        }
        catch (error) {
            console.error('❌ [Excel解析] 解析失败:', error);
            throw new Error("Excel\u6587\u4EF6\u89E3\u6790\u5931\u8D25: ".concat(error.message));
        }
    };
    /**
     * 解析CSV文件
     */
    BatchImportService.prototype.parseCSVFile = function (buffer) {
        try {
            var content = buffer.toString('utf-8');
            var data = (0, sync_1.parse)(content, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            });
            console.log("\uD83D\uDCCA [CSV\u89E3\u6790] \u6210\u529F\u89E3\u6790 ".concat(data.length, " \u884C\u6570\u636E"));
            return data;
        }
        catch (error) {
            console.error('❌ [CSV解析] 解析失败:', error);
            throw new Error("CSV\u6587\u4EF6\u89E3\u6790\u5931\u8D25: ".concat(error.message));
        }
    };
    /**
     * 解析文件（自动识别格式）
     */
    BatchImportService.prototype.parseFile = function (buffer, filename) {
        var ext = filename.toLowerCase().split('.').pop();
        if (ext === 'xlsx' || ext === 'xls') {
            return this.parseExcelFile(buffer);
        }
        else if (ext === 'csv') {
            return this.parseCSVFile(buffer);
        }
        else {
            throw new Error("\u4E0D\u652F\u6301\u7684\u6587\u4EF6\u683C\u5F0F: ".concat(ext, "\u3002\u4EC5\u652F\u6301 .xlsx, .xls, .csv"));
        }
    };
    /**
     * 批量预览导入数据
     */
    BatchImportService.prototype.previewImport = function (entityType, data, userContext) {
        return __awaiter(this, void 0, void 0, function () {
            var preview, entityConfig, allMissingFieldsSet, i, rowData, rowNumber, mergedData, missingFields, missingFieldNames, errors, recommendations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDD0D [\u6279\u91CF\u9884\u89C8] \u5F00\u59CB\u9884\u89C8 ".concat(entityType, " \u7684 ").concat(data.length, " \u6761\u6570\u636E"));
                        preview = {
                            entityType: entityType,
                            totalRows: data.length,
                            validRows: 0,
                            invalidRows: 0,
                            missingFields: [],
                            data: []
                        };
                        entityConfig = entity_field_config_service_1.entityFieldConfigService.getEntityConfig(entityType);
                        if (!entityConfig) {
                            throw new Error("\u672A\u627E\u5230\u5B9E\u4F53\u914D\u7F6E: ".concat(entityType));
                        }
                        allMissingFieldsSet = new Set();
                        // 逐行检查数据
                        for (i = 0; i < data.length; i++) {
                            rowData = data[i];
                            rowNumber = i + 1;
                            mergedData = userContext
                                ? __assign(__assign({}, rowData), user_context_provider_service_1.userContextProviderService.getAutoFillFields(userContext, entityType)) : rowData;
                            missingFields = entity_field_config_service_1.entityFieldConfigService.getMissingRequiredFields(entityType, mergedData);
                            missingFieldNames = missingFields.map(function (f) { return f.name; });
                            // 收集缺失字段
                            missingFieldNames.forEach(function (field) { return allMissingFieldsSet.add(field); });
                            errors = [];
                            if (missingFields.length > 0) {
                                errors.push("\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5: ".concat(missingFields.map(function (f) { return f.label; }).join('、')));
                            }
                            // 添加到预览数据
                            preview.data.push({
                                row: rowNumber,
                                data: mergedData,
                                missingFields: missingFieldNames,
                                errors: errors
                            });
                            // 统计有效/无效行
                            if (errors.length === 0) {
                                preview.validRows++;
                            }
                            else {
                                preview.invalidRows++;
                            }
                        }
                        // 设置缺失字段列表
                        preview.missingFields = Array.from(allMissingFieldsSet);
                        if (!(preview.missingFields.length > 0)) return [3 /*break*/, 2];
                        console.log("\uD83D\uDD0D [\u5B57\u6BB5\u63A8\u8350] \u83B7\u53D6 ".concat(preview.missingFields.length, " \u4E2A\u7F3A\u5931\u5B57\u6BB5\u7684\u63A8\u8350\u503C"));
                        return [4 /*yield*/, field_recommendation_service_1.fieldRecommendationService.getBatchFieldRecommendations(entityType, preview.missingFields, 3, 30)];
                    case 1:
                        recommendations = _a.sent();
                        preview.recommendations = recommendations;
                        _a.label = 2;
                    case 2:
                        console.log("\u2705 [\u6279\u91CF\u9884\u89C8] \u9884\u89C8\u5B8C\u6210: \u603B\u8BA1 ".concat(preview.totalRows, " \u884C, \u6709\u6548 ").concat(preview.validRows, " \u884C, \u65E0\u6548 ").concat(preview.invalidRows, " \u884C"));
                        return [2 /*return*/, preview];
                }
            });
        });
    };
    /**
     * 批量导入数据
     */
    BatchImportService.prototype.batchImport = function (entityType, data, userContext) {
        return __awaiter(this, void 0, void 0, function () {
            var result, model, i, rowData, rowNumber, mergedData, missingFields, created, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDCE5 [\u6279\u91CF\u5BFC\u5165] \u5F00\u59CB\u5BFC\u5165 ".concat(entityType, " \u7684 ").concat(data.length, " \u6761\u6570\u636E"));
                        result = {
                            success: true,
                            total: data.length,
                            succeeded: 0,
                            failed: 0,
                            errors: [],
                            created: []
                        };
                        model = this.getModel(entityType);
                        if (!model) {
                            throw new Error("\u672A\u627E\u5230\u6A21\u578B: ".concat(entityType));
                        }
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < data.length)) return [3 /*break*/, 6];
                        rowData = data[i];
                        rowNumber = i + 1;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        mergedData = userContext
                            ? __assign(__assign({}, rowData), user_context_provider_service_1.userContextProviderService.getAutoFillFields(userContext, entityType)) : rowData;
                        missingFields = entity_field_config_service_1.entityFieldConfigService.getMissingRequiredFields(entityType, mergedData);
                        if (missingFields.length > 0) {
                            throw new Error("\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5: ".concat(missingFields.map(function (f) { return f.label; }).join('、')));
                        }
                        return [4 /*yield*/, model.create(mergedData)];
                    case 3:
                        created = _a.sent();
                        result.created.push(created);
                        result.succeeded++;
                        console.log("\u2705 [\u6279\u91CF\u5BFC\u5165] \u7B2C ".concat(rowNumber, " \u884C\u5BFC\u5165\u6210\u529F"));
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        result.failed++;
                        result.errors.push({
                            row: rowNumber,
                            data: rowData,
                            error: error_1.message
                        });
                        console.error("\u274C [\u6279\u91CF\u5BFC\u5165] \u7B2C ".concat(rowNumber, " \u884C\u5BFC\u5165\u5931\u8D25:"), error_1.message);
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        result.success = result.failed === 0;
                        console.log("\u2705 [\u6279\u91CF\u5BFC\u5165] \u5BFC\u5165\u5B8C\u6210: \u6210\u529F ".concat(result.succeeded, " \u6761, \u5931\u8D25 ").concat(result.failed, " \u6761"));
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * 生成导入模板
     */
    BatchImportService.prototype.generateTemplate = function (entityType) {
        console.log("\uD83D\uDCC4 [\u751F\u6210\u6A21\u677F] \u751F\u6210 ".concat(entityType, " \u7684\u5BFC\u5165\u6A21\u677F"));
        // 获取实体配置
        var entityConfig = entity_field_config_service_1.entityFieldConfigService.getEntityConfig(entityType);
        if (!entityConfig) {
            throw new Error("\u672A\u627E\u5230\u5B9E\u4F53\u914D\u7F6E: ".concat(entityType));
        }
        // 获取所有字段（排除自动填充字段）
        var fields = entityConfig.fields.filter(function (f) { return !f.autoFill; });
        // 创建表头
        var headers = fields.map(function (f) { return f.label; });
        var fieldNames = fields.map(function (f) { return f.name; });
        // 创建示例数据行
        var exampleRow = fields.map(function (f) {
            if (f.placeholder)
                return f.placeholder;
            if (f.enumValues && f.enumValues.length > 0)
                return f.enumValues[0].label;
            if (f.type === 'number')
                return '0';
            if (f.type === 'boolean')
                return 'true';
            if (f.type === 'date')
                return '2024-01-01';
            return '示例数据';
        });
        // 创建工作簿
        var worksheet = XLSX.utils.aoa_to_sheet([
            headers,
            exampleRow
        ]);
        // 设置列宽
        worksheet['!cols'] = fields.map(function () { return ({ wch: 15 }); });
        var workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, entityConfig.displayName);
        // 生成Excel文件
        var buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        console.log("\u2705 [\u751F\u6210\u6A21\u677F] \u6A21\u677F\u751F\u6210\u6210\u529F\uFF0C\u5305\u542B ".concat(fields.length, " \u4E2A\u5B57\u6BB5"));
        return buffer;
    };
    /**
     * 获取模型
     */
    BatchImportService.prototype.getModel = function (entityType) {
        var modelMap = {
            students: models_1.Student,
            teachers: models_1.Teacher,
            classes: models_1.Class,
            activities: models_1.Activity,
            todos: models_1.Todo,
            users: models_1.User,
            parents: models_1.Parent,
            enrollments: models_1.EnrollmentApplication,
            kindergartens: models_1.Kindergarten
        };
        return modelMap[entityType];
    };
    return BatchImportService;
}());
// 导出单例
exports.batchImportService = new BatchImportService();
