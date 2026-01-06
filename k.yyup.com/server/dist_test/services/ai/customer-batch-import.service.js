"use strict";
/**
 * 客户批量导入服务
 *
 * 功能：
 * 1. 解析Excel文件
 * 2. 调用AI识别字段映射
 * 3. 生成预览数据
 * 4. 执行批量导入
 */
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
exports.customerBatchImportService = void 0;
var XLSX = __importStar(require("xlsx"));
var ai_bridge_service_1 = require("./bridge/ai-bridge.service");
/**
 * 客户批量导入服务
 */
var CustomerBatchImportService = /** @class */ (function () {
    function CustomerBatchImportService() {
    }
    /**
     * 获取客户池字段定义
     */
    CustomerBatchImportService.prototype.getCustomerPoolFields = function () {
        return [
            { name: 'name', label: '客户姓名', type: 'string', required: true, autoFill: false },
            { name: 'phone', label: '联系电话', type: 'string', required: true, autoFill: false },
            { name: 'email', label: '邮箱', type: 'string', required: false, autoFill: false },
            { name: 'idCardNo', label: '身份证号', type: 'string', required: false, autoFill: false },
            { name: 'workUnit', label: '工作单位', type: 'string', required: false, autoFill: false },
            { name: 'occupation', label: '职业', type: 'string', required: false, autoFill: false },
            { name: 'education', label: '学历', type: 'string', required: false, autoFill: false },
            { name: 'address', label: '家庭住址', type: 'string', required: false, autoFill: false },
            { name: 'remark', label: '备注', type: 'string', required: false, autoFill: false },
            { name: 'followStatus', label: '跟进状态', type: 'enum', required: false, autoFill: false, values: ['待跟进', '跟进中', '已转化', '已放弃'] },
            { name: 'priority', label: '优先级', type: 'number', required: false, autoFill: false, values: [1, 2, 3] },
            // 以下字段无法自动映射
            { name: 'userId', label: '用户ID', type: 'number', required: true, autoFill: true, reason: '需要关联用户，无法自动映射' },
            { name: 'studentId', label: '学生ID', type: 'number', required: true, autoFill: true, reason: '需要关联学生，无法自动映射' },
            { name: 'assignedTeacherId', label: '分配教师', type: 'number', required: false, autoFill: false, reason: '需要手动分配教师' }
        ];
    };
    /**
     * 解析Excel文件
     */
    CustomerBatchImportService.prototype.parseExcelFile = function (buffer) {
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
     * 调用AI识别字段映射
     */
    CustomerBatchImportService.prototype.identifyFieldMappings = function (excelColumns) {
        return __awaiter(this, void 0, void 0, function () {
            var customerPoolFields, systemPrompt, userPrompt, response, content, jsonMatch, aiResult, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('🧠 [AI字段识别] 开始调用AI识别字段映射...');
                        customerPoolFields = this.getCustomerPoolFields();
                        systemPrompt = "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u6570\u636E\u6620\u5C04\u5206\u6790\u4E13\u5BB6\u3002\n\u4F60\u7684\u4EFB\u52A1\u662F\u5206\u6790\u7528\u6237\u4E0A\u4F20\u7684Excel\u6587\u4EF6\u5217\u540D\uFF0C\u4E0E\u5E7C\u513F\u56ED\u5BA2\u6237\u6C60\u6570\u636E\u5E93\u5B57\u6BB5\u8FDB\u884C\u667A\u80FD\u5339\u914D\u3002\n\n\u8981\u6C42\uFF1A\n1. \u8BC6\u522B\u6BCF\u4E2AExcel\u5217\u4E0E\u6570\u636E\u5E93\u5B57\u6BB5\u7684\u5BF9\u5E94\u5173\u7CFB\n2. \u7ED9\u51FA\u5339\u914D\u7F6E\u4FE1\u5EA6\uFF080-1\uFF09\n3. \u6807\u8BB0\u54EA\u4E9B\u5B57\u6BB5\u53EF\u4EE5\u5BFC\u5165\uFF0C\u54EA\u4E9B\u4E0D\u80FD\n4. \u89E3\u91CA\u4E0D\u80FD\u5BFC\u5165\u7684\u539F\u56E0\n\n\u8FD4\u56DEJSON\u683C\u5F0F\u7684\u7ED3\u679C\uFF0C\u5305\u542Bmappings\u6570\u7EC4\u3002";
                        userPrompt = "\nExcel\u6587\u4EF6\u5305\u542B\u4EE5\u4E0B\u5217\uFF1A\n".concat(excelColumns.map(function (col, idx) { return "".concat(idx + 1, ". ").concat(col); }).join('\n'), "\n\n\u5BA2\u6237\u6C60\u6570\u636E\u5E93\u5B57\u6BB5\u5B9A\u4E49\uFF1A\n").concat(JSON.stringify(customerPoolFields, null, 2), "\n\n\u8BF7\u5206\u6790\u8FD9\u4E9B\u5217\u4E0E\u6570\u636E\u5E93\u5B57\u6BB5\u7684\u5BF9\u5E94\u5173\u7CFB\uFF0C\u5E76\u8FD4\u56DEJSON\u683C\u5F0F\u7684\u6620\u5C04\u7ED3\u679C\u3002\n\u8FD4\u56DE\u683C\u5F0F\uFF1A\n{\n  \"mappings\": [\n    {\n      \"excelColumn\": \"Excel\u5217\u540D\",\n      \"dbField\": \"\u6570\u636E\u5E93\u5B57\u6BB5\u540D\",\n      \"confidence\": 0.95,\n      \"willImport\": true,\n      \"reason\": \"\u53EF\u9009\u7684\u8BF4\u660E\"\n    }\n  ]\n}");
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateThinkingChatCompletion({
                                model: 'thinking',
                                messages: [
                                    { role: 'system', content: systemPrompt },
                                    { role: 'user', content: userPrompt }
                                ],
                                temperature: 0.3,
                                max_tokens: 2000
                            })];
                    case 1:
                        response = _a.sent();
                        content = response.choices[0].message.content;
                        jsonMatch = content.match(/\{[\s\S]*\}/);
                        if (!jsonMatch) {
                            throw new Error('AI返回的结果不是有效的JSON格式');
                        }
                        aiResult = JSON.parse(jsonMatch[0]);
                        console.log("\u2705 [AI\u5B57\u6BB5\u8BC6\u522B] \u8BC6\u522B\u5B8C\u6210\uFF0C\u5171 ".concat(aiResult.mappings.length, " \u4E2A\u5B57\u6BB5\u6620\u5C04"));
                        return [2 /*return*/, aiResult.mappings];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ [AI字段识别] 识别失败:', error_1);
                        throw new Error("\u5B57\u6BB5\u8BC6\u522B\u5931\u8D25: ".concat(error_1.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成预览数据
     */
    CustomerBatchImportService.prototype.generatePreview = function (buffer, filename) {
        return __awaiter(this, void 0, void 0, function () {
            var data, excelColumns, fieldMappings, customerPoolFields, importedFields_1, skippedFields, requiredFields, validRows, invalidRows, warnings, _loop_1, _i, data_1, row, preview, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('📋 [预览生成] 开始生成预览数据...');
                        data = this.parseExcelFile(buffer);
                        excelColumns = Object.keys(data[0] || {});
                        return [4 /*yield*/, this.identifyFieldMappings(excelColumns)];
                    case 1:
                        fieldMappings = _a.sent();
                        customerPoolFields = this.getCustomerPoolFields();
                        importedFields_1 = fieldMappings
                            .filter(function (m) { return m.willImport; })
                            .map(function (m) { return m.dbField; });
                        skippedFields = customerPoolFields
                            .filter(function (f) { return !importedFields_1.includes(f.name) && f.autoFill; })
                            .map(function (f) { return ({ field: f.name, reason: f.reason || '无法自动映射' }); });
                        requiredFields = customerPoolFields.filter(function (f) { return f.required && !f.autoFill; });
                        validRows = 0;
                        invalidRows = 0;
                        warnings = [];
                        _loop_1 = function (row) {
                            var hasAllRequired = requiredFields.every(function (f) { return row[f.label] || row[f.name]; });
                            if (hasAllRequired) {
                                validRows++;
                            }
                            else {
                                invalidRows++;
                            }
                        };
                        for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                            row = data_1[_i];
                            _loop_1(row);
                        }
                        preview = data.slice(0, 5);
                        result = {
                            totalRows: data.length,
                            validRows: validRows,
                            invalidRows: invalidRows,
                            fieldMappings: fieldMappings,
                            importedFields: importedFields_1,
                            skippedFields: skippedFields,
                            preview: preview,
                            warnings: warnings
                        };
                        console.log("\u2705 [\u9884\u89C8\u751F\u6210] \u5B8C\u6210 - \u603B\u8BA1".concat(result.totalRows, "\u6761\uFF0C\u6709\u6548").concat(result.validRows, "\u6761\uFF0C\u65E0\u6548").concat(result.invalidRows, "\u6761"));
                        return [2 /*return*/, result];
                    case 2:
                        error_2 = _a.sent();
                        console.error('❌ [预览生成] 失败:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CustomerBatchImportService;
}());
exports.customerBatchImportService = new CustomerBatchImportService();
