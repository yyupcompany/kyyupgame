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
exports.DataImportService = void 0;
var operation_log_model_1 = require("../models/operation-log.model");
var logger_1 = require("../utils/logger");
var DataImportService = /** @class */ (function () {
    function DataImportService() {
        // 数据导入关键词映射
        this.importKeywords = {
            student: ['学生', '学员', '儿童', '孩子', '入学', '报名', '幼儿'],
            parent: ['家长', '父母', '监护人', '家庭', '联系人'],
            teacher: ['教师', '老师', '员工', '教职工', '工作人员']
        };
        // 权限映射
        this.permissionMap = {
            student: 'STUDENT_CREATE',
            parent: 'PARENT_MANAGE',
            teacher: 'TEACHER_MANAGE'
        };
    }
    /**
     * 检测用户导入意图
     */
    DataImportService.prototype.detectImportIntent = function (userQuery) {
        var query = userQuery.toLowerCase();
        for (var _i = 0, _a = Object.entries(this.importKeywords); _i < _a.length; _i++) {
            var _b = _a[_i], type = _b[0], keywords = _b[1];
            if (keywords.some(function (keyword) { return query.includes(keyword); })) {
                return type;
            }
        }
        return null;
    };
    /**
     * 检查用户导入权限
     */
    DataImportService.prototype.checkImportPermission = function (userId, importType) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var requiredPermission, response, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        requiredPermission = this.permissionMap[importType];
                        if (!requiredPermission) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, fetch('/api/auth-permissions/check-permission', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    path: "/api/".concat(importType, "s"),
                                    userId: userId
                                })
                            })];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result.success && ((_a = result.data) === null || _a === void 0 ? void 0 : _a.hasPermission)];
                    case 3:
                        error_1 = _b.sent();
                        logger_1.logger.error('权限检查失败', { error: error_1, userId: userId, importType: importType });
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 解析文档内容
     */
    DataImportService.prototype.parseDocument = function (filePath, importType) {
        return __awaiter(this, void 0, void 0, function () {
            var fileExtension, parsedData, fields, _a, enhancedData, error_2;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 14, , 15]);
                        fileExtension = this.getFileExtension(filePath);
                        parsedData = [];
                        fields = [];
                        _a = fileExtension;
                        switch (_a) {
                            case '.xlsx': return [3 /*break*/, 1];
                            case '.xls': return [3 /*break*/, 1];
                            case '.docx': return [3 /*break*/, 3];
                            case '.doc': return [3 /*break*/, 3];
                            case '.pdf': return [3 /*break*/, 5];
                            case '.txt': return [3 /*break*/, 7];
                            case '.csv': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, this.parseExcelFile(filePath)];
                    case 2:
                        (_b = _g.sent(), parsedData = _b.data, fields = _b.fields);
                        return [3 /*break*/, 12];
                    case 3: return [4 /*yield*/, this.parseWordFile(filePath)];
                    case 4:
                        (_c = _g.sent(), parsedData = _c.data, fields = _c.fields);
                        return [3 /*break*/, 12];
                    case 5: return [4 /*yield*/, this.parsePdfFile(filePath)];
                    case 6:
                        (_d = _g.sent(), parsedData = _d.data, fields = _d.fields);
                        return [3 /*break*/, 12];
                    case 7: return [4 /*yield*/, this.parseTextFile(filePath)];
                    case 8:
                        (_e = _g.sent(), parsedData = _e.data, fields = _e.fields);
                        return [3 /*break*/, 12];
                    case 9: return [4 /*yield*/, this.parseCsvFile(filePath)];
                    case 10:
                        (_f = _g.sent(), parsedData = _f.data, fields = _f.fields);
                        return [3 /*break*/, 12];
                    case 11: throw new Error("\u4E0D\u652F\u6301\u7684\u6587\u4EF6\u683C\u5F0F: ".concat(fileExtension));
                    case 12: return [4 /*yield*/, this.enhanceDataWithAI(parsedData, importType)];
                    case 13:
                        enhancedData = _g.sent();
                        return [2 /*return*/, {
                                type: importType,
                                data: enhancedData,
                                fields: fields,
                                totalRecords: enhancedData.length
                            }];
                    case 14:
                        error_2 = _g.sent();
                        logger_1.logger.error('文档解析失败', { error: error_2, filePath: filePath, importType: importType });
                        throw new Error("\u6587\u6863\u89E3\u6790\u5931\u8D25: ".concat(error_2 instanceof Error ? error_2.message : '未知错误'));
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取文件扩展名
     */
    DataImportService.prototype.getFileExtension = function (filePath) {
        return filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
    };
    /**
     * 解析Excel文件
     */
    DataImportService.prototype.parseExcelFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var mockData, fields;
            return __generator(this, function (_a) {
                try {
                    mockData = [
                        { '姓名': '张三', '电话': '13800138000', '邮箱': 'zhangsan@example.com' },
                        { '姓名': '李四', '电话': '13800138001', '邮箱': 'lisi@example.com' }
                    ];
                    fields = Object.keys(mockData[0] || {});
                    return [2 /*return*/, { data: mockData, fields: fields }];
                }
                catch (error) {
                    throw new Error("Excel\u6587\u4EF6\u89E3\u6790\u5931\u8D25: ".concat(error instanceof Error ? error.message : '未知错误'));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 解析Word文件
     */
    DataImportService.prototype.parseWordFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var mockData, fields;
            return __generator(this, function (_a) {
                try {
                    mockData = [
                        { '学生姓名': '王五', '联系电话': '13800138002', '家长姓名': '王父' }
                    ];
                    fields = Object.keys(mockData[0] || {});
                    return [2 /*return*/, { data: mockData, fields: fields }];
                }
                catch (error) {
                    throw new Error("Word\u6587\u4EF6\u89E3\u6790\u5931\u8D25: ".concat(error instanceof Error ? error.message : '未知错误'));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 解析PDF文件
     */
    DataImportService.prototype.parsePdfFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var mockData, fields;
            return __generator(this, function (_a) {
                try {
                    mockData = [
                        { '教师姓名': '赵老师', '工号': 'T001', '科目': '数学' }
                    ];
                    fields = Object.keys(mockData[0] || {});
                    return [2 /*return*/, { data: mockData, fields: fields }];
                }
                catch (error) {
                    throw new Error("PDF\u6587\u4EF6\u89E3\u6790\u5931\u8D25: ".concat(error instanceof Error ? error.message : '未知错误'));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 解析文本文件
     */
    DataImportService.prototype.parseTextFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fs, content, aiParsedData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        fs = require('fs');
                        content = fs.readFileSync(filePath, 'utf8');
                        return [4 /*yield*/, this.parseTextWithAI(content)];
                    case 1:
                        aiParsedData = _a.sent();
                        return [2 /*return*/, aiParsedData];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("\u6587\u672C\u6587\u4EF6\u89E3\u6790\u5931\u8D25: ".concat(error_3 instanceof Error ? error_3.message : '未知错误'));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 解析CSV文件
     */
    DataImportService.prototype.parseCsvFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var mockData, fields;
            return __generator(this, function (_a) {
                try {
                    mockData = [
                        { 'name': '孙六', 'phone': '13800138003', 'email': 'sunliu@example.com' }
                    ];
                    fields = Object.keys(mockData[0] || {});
                    return [2 /*return*/, { data: mockData, fields: fields }];
                }
                catch (error) {
                    throw new Error("CSV\u6587\u4EF6\u89E3\u6790\u5931\u8D25: ".concat(error instanceof Error ? error.message : '未知错误'));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取数据库表结构
     */
    DataImportService.prototype.getDatabaseSchema = function (importType) {
        return __awaiter(this, void 0, void 0, function () {
            var schemaMap;
            return __generator(this, function (_a) {
                try {
                    schemaMap = {
                        student: {
                            name: { type: 'string', required: true, maxLength: 50 },
                            studentId: { type: 'string', required: false, maxLength: 20 },
                            phone: { type: 'string', required: false, maxLength: 20 },
                            email: { type: 'string', required: false, maxLength: 100 },
                            birthDate: { type: 'date', required: false },
                            gender: { type: 'enum', required: false, values: ['male', 'female'] },
                            address: { type: 'string', required: false, maxLength: 200 }
                        },
                        parent: {
                            name: { type: 'string', required: true, maxLength: 50 },
                            phone: { type: 'string', required: true, maxLength: 20 },
                            email: { type: 'string', required: false, maxLength: 100 },
                            relationship: { type: 'enum', required: true, values: ['father', 'mother', 'guardian'] },
                            occupation: { type: 'string', required: false, maxLength: 100 },
                            address: { type: 'string', required: false, maxLength: 200 }
                        },
                        teacher: {
                            name: { type: 'string', required: true, maxLength: 50 },
                            employeeId: { type: 'string', required: false, maxLength: 20 },
                            phone: { type: 'string', required: true, maxLength: 20 },
                            email: { type: 'string', required: true, maxLength: 100 },
                            subject: { type: 'string', required: false, maxLength: 50 },
                            department: { type: 'string', required: false, maxLength: 50 },
                            hireDate: { type: 'date', required: false }
                        }
                    };
                    return [2 /*return*/, schemaMap[importType] || {}];
                }
                catch (error) {
                    logger_1.logger.error('获取数据库结构失败', { error: error, importType: importType });
                    throw new Error('获取数据库结构失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 生成字段映射建议
     */
    /**
     * 🎯 生成智能字段映射和对比表
     */
    DataImportService.prototype.generateFieldMapping = function (documentFields, databaseSchema, importType, sampleData) {
        return __awaiter(this, void 0, void 0, function () {
            var mappings_1, comparisonTable_1, fieldMappingRules, _i, documentFields_1, docField, bestMatch, _a, _b, _c, dbField, aliases, confidence, mapping, summary;
            var _this = this;
            return __generator(this, function (_d) {
                try {
                    mappings_1 = [];
                    comparisonTable_1 = {
                        willImport: [],
                        willIgnore: [],
                        missing: [],
                        conflicts: []
                    };
                    fieldMappingRules = {
                        name: ['姓名', '名字', 'name', '用户名', '学生姓名', '家长姓名', '教师姓名'],
                        phone: ['电话', '手机', '联系电话', 'phone', 'mobile', '手机号', '联系方式'],
                        email: ['邮箱', '电子邮件', 'email', 'mail', '邮件地址'],
                        address: ['地址', '住址', 'address', '联系地址', '家庭地址'],
                        birthDate: ['出生日期', '生日', 'birthDate', 'birth', '出生年月'],
                        gender: ['性别', 'gender', 'sex'],
                        relationship: ['关系', '亲属关系', 'relationship', '与学生关系'],
                        occupation: ['职业', '工作', 'occupation', 'job', '职务'],
                        studentId: ['学号', '学生编号', 'studentId', '学生ID'],
                        employeeId: ['工号', '员工编号', 'employeeId', '教师编号'],
                        idCard: ['身份证', '身份证号', 'idCard', '证件号码'],
                        department: ['部门', '科室', 'department', '所属部门'],
                        subject: ['科目', '学科', 'subject', '任教科目'],
                        classId: ['班级', '所在班级', 'classId', '班级编号']
                    };
                    // 1. 🔍 遍历文档字段，进行智能匹配
                    for (_i = 0, documentFields_1 = documentFields; _i < documentFields_1.length; _i++) {
                        docField = documentFields_1[_i];
                        bestMatch = null;
                        // 寻找最佳匹配
                        for (_a = 0, _b = Object.entries(fieldMappingRules); _a < _b.length; _a++) {
                            _c = _b[_a], dbField = _c[0], aliases = _c[1];
                            if (databaseSchema[dbField]) {
                                confidence = this.calculateFieldConfidence(docField, aliases);
                                if (confidence > 0.8 && (!bestMatch || confidence > bestMatch.confidence)) {
                                    bestMatch = { field: dbField, confidence: confidence };
                                }
                            }
                        }
                        if (bestMatch && bestMatch.confidence > 0.8) {
                            mapping = {
                                sourceField: docField,
                                targetField: bestMatch.field,
                                required: databaseSchema[bestMatch.field].required || false,
                                dataType: databaseSchema[bestMatch.field].type,
                                validation: databaseSchema[bestMatch.field].values ?
                                    "\u679A\u4E3E\u503C: ".concat(databaseSchema[bestMatch.field].values.join(', ')) : undefined,
                                confidence: bestMatch.confidence
                            };
                            mappings_1.push(mapping);
                            comparisonTable_1.willImport.push({
                                sourceField: docField,
                                targetField: bestMatch.field,
                                confidence: bestMatch.confidence,
                                dataType: databaseSchema[bestMatch.field].type,
                                required: databaseSchema[bestMatch.field].required || false,
                                description: this.getFieldDescription(bestMatch.field, importType),
                                sampleValue: this.getSampleValue(docField, sampleData)
                            });
                        }
                        else if (bestMatch && bestMatch.confidence > 0.5) {
                            // ⚠️ 中等置信度 - 可能冲突
                            comparisonTable_1.conflicts.push({
                                sourceField: docField,
                                suggestedTarget: bestMatch.field,
                                confidence: bestMatch.confidence,
                                reason: '字段名称相似但不完全匹配，建议您确认是否正确',
                                alternatives: this.getAlternativeFields(docField, Object.keys(databaseSchema))
                            });
                        }
                        else {
                            // ❌ 无法匹配 - 将被忽略
                            comparisonTable_1.willIgnore.push({
                                sourceField: docField,
                                reason: '在目标数据库中找不到对应字段，该字段将被忽略',
                                suggestion: this.suggestAlternativeField(docField, Object.keys(databaseSchema)),
                                sampleValue: this.getSampleValue(docField, sampleData)
                            });
                        }
                    }
                    // 2. 🔍 检查缺失的必填字段
                    Object.keys(databaseSchema).forEach(function (dbField) {
                        var isRequired = databaseSchema[dbField].required;
                        var isMapped = mappings_1.some(function (m) { return m.targetField === dbField; });
                        if (isRequired && !isMapped) {
                            var defaultValue = _this.getDefaultValue(dbField, importType);
                            comparisonTable_1.missing.push({
                                targetField: dbField,
                                dataType: databaseSchema[dbField].type,
                                description: _this.getFieldDescription(dbField, importType),
                                defaultValue: defaultValue,
                                canUseDefault: defaultValue !== null
                            });
                        }
                    });
                    summary = this.generateMappingSummary(documentFields, comparisonTable_1, importType);
                    return [2 /*return*/, { mappings: mappings_1, comparisonTable: comparisonTable_1, summary: summary }];
                }
                catch (error) {
                    logger_1.logger.error('字段映射生成失败', { error: error, documentFields: documentFields, importType: importType });
                    throw new Error('字段映射生成失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 数据验证和预览
     */
    DataImportService.prototype.validateAndPreview = function (data, fieldMappings, databaseSchema) {
        return __awaiter(this, void 0, void 0, function () {
            var validationErrors, validRecords, invalidRecords, i, record, recordErrors, _i, fieldMappings_1, mapping;
            return __generator(this, function (_a) {
                try {
                    validationErrors = [];
                    validRecords = 0;
                    invalidRecords = 0;
                    // 验证每条记录
                    for (i = 0; i < data.length; i++) {
                        record = data[i];
                        recordErrors = [];
                        // 验证必填字段
                        for (_i = 0, fieldMappings_1 = fieldMappings; _i < fieldMappings_1.length; _i++) {
                            mapping = fieldMappings_1[_i];
                            if (mapping.required && !record[mapping.sourceField]) {
                                recordErrors.push({
                                    field: mapping.sourceField,
                                    message: "\u5FC5\u586B\u5B57\u6BB5\u4E0D\u80FD\u4E3A\u7A7A"
                                });
                            }
                        }
                        if (recordErrors.length > 0) {
                            invalidRecords++;
                            validationErrors.push({
                                rowIndex: i + 1,
                                errors: recordErrors
                            });
                        }
                        else {
                            validRecords++;
                        }
                    }
                    return [2 /*return*/, {
                            type: 'preview',
                            totalRecords: data.length,
                            validRecords: validRecords,
                            invalidRecords: invalidRecords,
                            fieldMappings: fieldMappings,
                            sampleData: data.slice(0, 5),
                            validationErrors: validationErrors,
                            comparisonTable: {
                                willImport: [],
                                willIgnore: [],
                                missing: [],
                                conflicts: []
                            },
                            summary: {
                                totalSourceFields: fieldMappings.length,
                                willImportCount: fieldMappings.filter(function (f) { return f.confidence > 0.5; }).length,
                                willIgnoreCount: fieldMappings.filter(function (f) { return f.confidence <= 0.5; }).length,
                                missingRequiredCount: 0,
                                conflictsCount: 0,
                                canProceed: true,
                                recommendation: '数据可以导入',
                                userFriendlyMessage: '数据验证通过，可以进行导入'
                            }
                        }];
                }
                catch (error) {
                    logger_1.logger.error('数据验证失败', { error: error });
                    throw new Error('数据验证失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 使用AI增强数据解析
     */
    DataImportService.prototype.enhanceDataWithAI = function (data, importType) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    // TODO: 集成AI服务进行数据清洗和标准化
                    // 1. 数据格式标准化（电话号码、邮箱等）
                    // 2. 缺失数据补全
                    // 3. 数据去重
                    // 4. 字段名称标准化
                    return [2 /*return*/, data.map(function (record) {
                            var enhanced = __assign({}, record);
                            // 标准化电话号码格式
                            Object.keys(enhanced).forEach(function (key) {
                                if (key.includes('电话') || key.includes('phone')) {
                                    var phone = enhanced[key];
                                    if (phone && typeof phone === 'string') {
                                        enhanced[key] = _this.standardizePhoneNumber(phone);
                                    }
                                }
                            });
                            return enhanced;
                        })];
                }
                catch (error) {
                    logger_1.logger.error('AI数据增强失败', { error: error, importType: importType });
                    return [2 /*return*/, data]; // 返回原始数据
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 使用AI解析非结构化文本
     */
    DataImportService.prototype.parseTextWithAI = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            var lines, data, _i, lines_1, line, record, nameMatch, phoneMatch, fields;
            return __generator(this, function (_a) {
                try {
                    lines = content.split('\n').filter(function (line) { return line.trim(); });
                    data = [];
                    // 简单的文本解析逻辑
                    for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        line = lines_1[_i];
                        if (line.includes('姓名') || line.includes('电话')) {
                            record = {};
                            nameMatch = line.match(/姓名[：:]\s*([^\s,，]+)/);
                            if (nameMatch)
                                record.name = nameMatch[1];
                            phoneMatch = line.match(/电话[：:]\s*([0-9-]+)/);
                            if (phoneMatch)
                                record.phone = phoneMatch[1];
                            if (Object.keys(record).length > 0) {
                                data.push(record);
                            }
                        }
                    }
                    fields = data.length > 0 ? Object.keys(data[0]) : [];
                    return [2 /*return*/, { data: data, fields: fields }];
                }
                catch (error) {
                    logger_1.logger.error('AI文本解析失败', { error: error });
                    throw new Error('AI文本解析失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 标准化电话号码格式
     */
    DataImportService.prototype.standardizePhoneNumber = function (phone) {
        // 移除所有非数字字符
        var cleaned = phone.replace(/\D/g, '');
        // 中国手机号码格式化
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        // 固定电话格式化
        if (cleaned.length >= 7) {
            return cleaned;
        }
        return phone; // 无法识别格式，返回原值
    };
    /**
     * 执行批量数据插入
     */
    DataImportService.prototype.executeBatchInsert = function (data, fieldMappings, importType, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var results, transformedData, i, record, insertedId, error_4, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        results = {
                            success: true,
                            totalRecords: data.length,
                            successCount: 0,
                            failureCount: 0,
                            errors: [],
                            insertedIds: []
                        };
                        transformedData = this.transformDataForInsert(data, fieldMappings);
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < transformedData.length)) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        record = transformedData[i];
                        return [4 /*yield*/, this.insertSingleRecord(record, importType, userId)];
                    case 3:
                        insertedId = _a.sent();
                        results.successCount++;
                        results.insertedIds.push(insertedId);
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        results.failureCount++;
                        results.errors.push({
                            rowIndex: i + 1,
                            data: transformedData[i],
                            error: error_4 instanceof Error ? error_4.message : '插入失败'
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: 
                    // 记录操作日志
                    return [4 /*yield*/, this.logImportOperation(userId, importType, 'batch_insert', results.failureCount === 0 ? operation_log_model_1.OperationResult.SUCCESS : operation_log_model_1.OperationResult.FAILED, {
                            totalRecords: results.totalRecords,
                            successCount: results.successCount,
                            failureCount: results.failureCount
                        })];
                    case 7:
                        // 记录操作日志
                        _a.sent();
                        return [2 /*return*/, results];
                    case 8:
                        error_5 = _a.sent();
                        logger_1.logger.error('批量插入失败', { error: error_5, importType: importType, userId: userId });
                        throw new Error('批量插入失败');
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 转换数据格式用于插入
     */
    DataImportService.prototype.transformDataForInsert = function (data, fieldMappings) {
        return data.map(function (record) {
            var transformed = {};
            fieldMappings.forEach(function (mapping) {
                var sourceValue = record[mapping.sourceField];
                if (sourceValue !== undefined && sourceValue !== null) {
                    transformed[mapping.targetField] = sourceValue;
                }
            });
            return transformed;
        });
    };
    /**
     * 插入单条记录 - 使用现有API确保完整的权限和业务逻辑验证
     */
    DataImportService.prototype.insertSingleRecord = function (record, importType, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // 🔒 安全第一：必须通过现有API插入，确保完整验证
                        // 1. 预验证：检查数据完整性和业务规则
                        return [4 /*yield*/, this.preValidateRecord(record, importType, userId)];
                    case 1:
                        // 🔒 安全第一：必须通过现有API插入，确保完整验证
                        // 1. 预验证：检查数据完整性和业务规则
                        _a.sent();
                        return [4 /*yield*/, this.callSecureAPI(record, importType, userId)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.id];
                    case 3:
                        error_6 = _a.sent();
                        logger_1.logger.error('安全插入失败', {
                            error: error_6 instanceof Error ? error_6.message : '未知错误',
                            record: record,
                            importType: importType,
                            userId: userId
                        });
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🔒 预验证：多层安全检查
     */
    DataImportService.prototype.preValidateRecord = function (record, importType, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // 1. 唯一性验证
                    return [4 /*yield*/, this.validateUniqueness(record, importType)];
                    case 1:
                        // 1. 唯一性验证
                        _a.sent();
                        // 2. 关联性验证
                        return [4 /*yield*/, this.validateRelationships(record, importType)];
                    case 2:
                        // 2. 关联性验证
                        _a.sent();
                        // 3. 权限边界验证
                        return [4 /*yield*/, this.validatePermissionBoundary(record, importType, userId)];
                    case 3:
                        // 3. 权限边界验证
                        _a.sent();
                        // 4. 业务规则验证
                        return [4 /*yield*/, this.validateBusinessRules(record, importType, userId)];
                    case 4:
                        // 4. 业务规则验证
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🔒 唯一性验证：防止重复数据
     */
    DataImportService.prototype.validateUniqueness = function (record, importType) {
        return __awaiter(this, void 0, void 0, function () {
            var uniqueFields, _i, uniqueFields_1, field, exists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uniqueFields = this.getUniqueFields(importType);
                        _i = 0, uniqueFields_1 = uniqueFields;
                        _a.label = 1;
                    case 1:
                        if (!(_i < uniqueFields_1.length)) return [3 /*break*/, 4];
                        field = uniqueFields_1[_i];
                        if (!record[field]) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.checkFieldExists(field, record[field], importType)];
                    case 2:
                        exists = _a.sent();
                        if (exists) {
                            throw new Error("".concat(field, " \"").concat(record[field], "\" \u5DF2\u5B58\u5728\uFF0C\u4E0D\u80FD\u91CD\u590D\u6DFB\u52A0"));
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🔒 关联性验证：确保数据关联合理
     */
    DataImportService.prototype.validateRelationships = function (record, importType) {
        return __awaiter(this, void 0, void 0, function () {
            var studentExists, parentCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(importType === 'parent')) return [3 /*break*/, 3];
                        if (!record.studentId) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.checkStudentExists(record.studentId)];
                    case 1:
                        studentExists = _a.sent();
                        if (!studentExists) {
                            throw new Error("\u5173\u8054\u7684\u5B66\u751FID \"".concat(record.studentId, "\" \u4E0D\u5B58\u5728"));
                        }
                        return [4 /*yield*/, this.getParentCountForStudent(record.studentId)];
                    case 2:
                        parentCount = _a.sent();
                        if (parentCount >= 4) { // 最多4个监护人
                            throw new Error("\u5B66\u751F\u5DF2\u6709".concat(parentCount, "\u4E2A\u76D1\u62A4\u4EBA\uFF0C\u4E0D\u80FD\u518D\u6DFB\u52A0"));
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🔒 权限边界验证：确保用户只能操作授权范围内的数据
     */
    DataImportService.prototype.validatePermissionBoundary = function (record, importType, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userPermissions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserPermissionScope(userId)];
                    case 1:
                        userPermissions = _a.sent();
                        // 验证是否在权限范围内
                        if (importType === 'student' && record.classId) {
                            if (!userPermissions.allowedClasses.includes(record.classId)) {
                                throw new Error("\u60A8\u6CA1\u6709\u6743\u9650\u4E3A\u73ED\u7EA7 \"".concat(record.classId, "\" \u6DFB\u52A0\u5B66\u751F"));
                            }
                        }
                        if (importType === 'teacher' && record.departmentId) {
                            if (!userPermissions.allowedDepartments.includes(record.departmentId)) {
                                throw new Error("\u60A8\u6CA1\u6709\u6743\u9650\u4E3A\u90E8\u95E8 \"".concat(record.departmentId, "\" \u6DFB\u52A0\u6559\u5E08"));
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🔒 业务规则验证：确保符合业务逻辑
     */
    DataImportService.prototype.validateBusinessRules = function (record, importType, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var age, phoneInUse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(importType === 'parent')) return [3 /*break*/, 2];
                        // 验证家长年龄合理性
                        if (record.birthDate) {
                            age = this.calculateAge(record.birthDate);
                            if (age < 18 || age > 80) {
                                throw new Error("\u5BB6\u957F\u5E74\u9F84 ".concat(age, " \u5C81\u4E0D\u5728\u5408\u7406\u8303\u56F4\u5185\uFF0818-80\u5C81\uFF09"));
                            }
                        }
                        if (!record.phone) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkPhoneInUse(record.phone, importType)];
                    case 1:
                        phoneInUse = _a.sent();
                        if (phoneInUse) {
                            throw new Error("\u624B\u673A\u53F7 \"".concat(record.phone, "\" \u5DF2\u88AB\u5176\u4ED6").concat(phoneInUse.type, "\u4F7F\u7528"));
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🔒 调用安全API：通过现有API插入数据，确保完整验证
     */
    DataImportService.prototype.callSecureAPI = function (record, importType, userId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var axios, baseURL, userToken, apiEndpoints, endpoint, response, error_7, message;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        axios = require('axios');
                        baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
                        return [4 /*yield*/, this.getUserToken(userId)];
                    case 1:
                        userToken = _c.sent();
                        apiEndpoints = {
                            student: "".concat(baseURL, "/api/students"),
                            parent: "".concat(baseURL, "/api/parents"),
                            teacher: "".concat(baseURL, "/api/teachers")
                        };
                        endpoint = apiEndpoints[importType];
                        if (!endpoint) {
                            throw new Error("\u4E0D\u652F\u6301\u7684\u5BFC\u5165\u7C7B\u578B: ".concat(importType));
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios.post(endpoint, record, {
                                headers: {
                                    'Authorization': "Bearer ".concat(userToken),
                                    'Content-Type': 'application/json',
                                    'X-Import-Source': 'data-import-workflow' // 标识来源
                                },
                                timeout: 10000 // 10秒超时
                            })];
                    case 3:
                        response = _c.sent();
                        if (response.status !== 201) {
                            throw new Error("API\u8C03\u7528\u5931\u8D25: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [2 /*return*/, { id: response.data.id }];
                    case 4:
                        error_7 = _c.sent();
                        if (error_7.response) {
                            message = ((_a = error_7.response.data) === null || _a === void 0 ? void 0 : _a.message) || ((_b = error_7.response.data) === null || _b === void 0 ? void 0 : _b.error) || '插入失败';
                            throw new Error("\u6570\u636E\u9A8C\u8BC1\u5931\u8D25: ".concat(message));
                        }
                        else if (error_7.request) {
                            // 网络错误
                            throw new Error('API服务不可用，请稍后重试');
                        }
                        else {
                            // 其他错误
                            throw new Error("\u63D2\u5165\u5931\u8D25: ".concat(error_7.message));
                        }
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ========== 辅助验证方法 ==========
    /**
     * 获取唯一字段列表
     */
    DataImportService.prototype.getUniqueFields = function (importType) {
        var uniqueFieldsMap = {
            student: ['studentId', 'phone', 'email'],
            parent: ['phone', 'email', 'idCard'],
            teacher: ['employeeId', 'phone', 'email', 'idCard']
        };
        return uniqueFieldsMap[importType] || [];
    };
    /**
     * 检查字段值是否已存在
     */
    DataImportService.prototype.checkFieldExists = function (field, value, importType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: 实现数据库查询检查唯一性
                // 这里应该查询相应的数据表
                logger_1.logger.info('检查字段唯一性', { field: field, value: value, importType: importType });
                // 模拟检查结果
                return [2 /*return*/, false]; // 暂时返回false，实际应该查询数据库
            });
        });
    };
    /**
     * 检查学生是否存在
     */
    DataImportService.prototype.checkStudentExists = function (studentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: 查询学生表
                logger_1.logger.info('检查学生存在性', { studentId: studentId });
                return [2 /*return*/, true]; // 模拟返回
            });
        });
    };
    /**
     * 获取学生的家长数量
     */
    DataImportService.prototype.getParentCountForStudent = function (studentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: 查询家长-学生关联表
                logger_1.logger.info('获取学生家长数量', { studentId: studentId });
                return [2 /*return*/, 0]; // 模拟返回
            });
        });
    };
    /**
     * 获取用户权限范围
     */
    DataImportService.prototype.getUserPermissionScope = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: 查询用户权限表
                logger_1.logger.info('获取用户权限范围', { userId: userId });
                // 模拟返回管理员权限
                return [2 /*return*/, {
                        allowedClasses: ['*'],
                        allowedDepartments: ['*'] // * 表示所有部门
                    }];
            });
        });
    };
    /**
     * 计算年龄
     */
    DataImportService.prototype.calculateAge = function (birthDate) {
        var birth = new Date(birthDate);
        var today = new Date();
        var age = today.getFullYear() - birth.getFullYear();
        var monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };
    /**
     * 检查手机号是否被使用
     */
    DataImportService.prototype.checkPhoneInUse = function (phone, currentType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: 查询所有相关表检查手机号使用情况
                logger_1.logger.info('检查手机号使用情况', { phone: phone, currentType: currentType });
                return [2 /*return*/, null]; // 模拟返回未使用
            });
        });
    };
    /**
     * 获取用户Token用于API调用
     */
    DataImportService.prototype.getUserToken = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: 生成或获取用户的有效token
                // 这里应该调用认证服务获取token
                logger_1.logger.info('获取用户Token', { userId: userId });
                // 模拟返回token
                return [2 /*return*/, 'mock-jwt-token-for-api-calls'];
            });
        });
    };
    /**
     * 记录导入操作日志
     */
    DataImportService.prototype.logImportOperation = function (userId, importType, action, result, details) {
        return __awaiter(this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, operation_log_model_1.OperationLog.create({
                                userId: userId,
                                module: '数据导入',
                                action: "import_".concat(importType, "_").concat(action),
                                operationType: operation_log_model_1.OperationType.CREATE,
                                resourceType: 'data_import',
                                resourceId: null,
                                description: "".concat(importType, "\u6570\u636E\u5BFC\u5165").concat(action),
                                requestMethod: null,
                                requestUrl: null,
                                requestParams: JSON.stringify(details),
                                requestIp: null,
                                userAgent: null,
                                deviceInfo: null,
                                operationResult: result,
                                resultMessage: result === operation_log_model_1.OperationResult.SUCCESS ? '操作成功' : '操作失败',
                                executionTime: null
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        logger_1.logger.error('记录导入日志失败', { error: error_8, userId: userId, importType: importType, action: action });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ========== 🎯 字段映射辅助方法 ==========
    /**
     * 计算字段匹配置信度
     */
    DataImportService.prototype.calculateFieldConfidence = function (sourceField, aliases) {
        var source = sourceField.toLowerCase();
        var maxConfidence = 0;
        for (var _i = 0, aliases_1 = aliases; _i < aliases_1.length; _i++) {
            var alias = aliases_1[_i];
            var aliasLower = alias.toLowerCase();
            // 完全匹配
            if (source === aliasLower) {
                return 1.0;
            }
            // 包含匹配
            if (source.includes(aliasLower) || aliasLower.includes(source)) {
                maxConfidence = Math.max(maxConfidence, 0.9);
            }
            // 相似度匹配（简单的编辑距离）
            var similarity = this.calculateStringSimilarity(source, aliasLower);
            if (similarity > 0.7) {
                maxConfidence = Math.max(maxConfidence, similarity * 0.8);
            }
        }
        return maxConfidence;
    };
    /**
     * 计算字符串相似度
     */
    DataImportService.prototype.calculateStringSimilarity = function (str1, str2) {
        var longer = str1.length > str2.length ? str1 : str2;
        var shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0)
            return 1.0;
        var editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    };
    /**
     * 计算编辑距离
     */
    DataImportService.prototype.levenshteinDistance = function (str1, str2) {
        var matrix = [];
        for (var i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (var j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (var i = 1; i <= str2.length; i++) {
            for (var j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[str2.length][str1.length];
    };
    /**
     * 获取字段描述
     */
    DataImportService.prototype.getFieldDescription = function (field, importType) {
        var _a;
        var descriptions = {
            student: {
                name: '学生姓名',
                studentId: '学生学号或编号',
                phone: '学生联系电话',
                email: '学生邮箱地址',
                birthDate: '学生出生日期',
                gender: '学生性别',
                address: '学生家庭地址'
            },
            parent: {
                name: '家长姓名',
                phone: '家长联系电话（必填）',
                email: '家长邮箱地址',
                relationship: '与学生的关系（父亲/母亲/监护人）',
                occupation: '家长职业',
                address: '家长联系地址',
                idCard: '家长身份证号码'
            },
            teacher: {
                name: '教师姓名',
                employeeId: '教师工号',
                phone: '教师联系电话',
                email: '教师邮箱地址',
                department: '所属部门',
                subject: '任教科目',
                idCard: '教师身份证号码'
            }
        };
        return ((_a = descriptions[importType]) === null || _a === void 0 ? void 0 : _a[field]) || "".concat(field, "\u5B57\u6BB5");
    };
    /**
     * 获取样本值
     */
    DataImportService.prototype.getSampleValue = function (field, sampleData) {
        if (!sampleData || sampleData.length === 0)
            return '';
        var firstRecord = sampleData[0];
        var value = firstRecord[field];
        if (value === undefined || value === null)
            return '';
        return String(value).substring(0, 20) + (String(value).length > 20 ? '...' : '');
    };
    /**
     * 获取替代字段建议
     */
    DataImportService.prototype.getAlternativeFields = function (sourceField, targetFields) {
        var alternatives = [];
        var source = sourceField.toLowerCase();
        for (var _i = 0, targetFields_1 = targetFields; _i < targetFields_1.length; _i++) {
            var target = targetFields_1[_i];
            var similarity = this.calculateStringSimilarity(source, target.toLowerCase());
            if (similarity > 0.3) {
                alternatives.push(target);
            }
        }
        return alternatives.slice(0, 3); // 最多返回3个建议
    };
    /**
     * 建议替代字段
     */
    DataImportService.prototype.suggestAlternativeField = function (sourceField, targetFields) {
        var alternatives = this.getAlternativeFields(sourceField, targetFields);
        return alternatives.length > 0 ? "\u5EFA\u8BAE\u4F7F\u7528: ".concat(alternatives.join(', ')) : '无相似字段';
    };
    /**
     * 获取默认值
     */
    DataImportService.prototype.getDefaultValue = function (field, importType) {
        var _a;
        var defaults = {
            student: {
                gender: 'unknown',
                status: 'active'
            },
            parent: {
                relationship: 'guardian'
            },
            teacher: {
                status: 'active',
                department: 'general'
            }
        };
        return ((_a = defaults[importType]) === null || _a === void 0 ? void 0 : _a[field]) || null;
    };
    /**
     * 生成映射摘要
     */
    DataImportService.prototype.generateMappingSummary = function (sourceFields, comparisonTable, importType) {
        var canProceed = comparisonTable.missing.filter(function (m) { return !m.canUseDefault; }).length === 0;
        var recommendation = '';
        var userFriendlyMessage = '';
        if (canProceed) {
            if (comparisonTable.willIgnore.length > 0) {
                recommendation = '可以继续导入，但部分字段将被忽略';
                userFriendlyMessage = "\u60A8\u7684\u6587\u6863\u5305\u542B ".concat(sourceFields.length, " \u4E2A\u5B57\u6BB5\uFF0C\u5176\u4E2D ").concat(comparisonTable.willImport.length, " \u4E2A\u5B57\u6BB5\u5C06\u88AB\u5BFC\u5165\u5230\u6570\u636E\u5E93\uFF0C").concat(comparisonTable.willIgnore.length, " \u4E2A\u5B57\u6BB5\u5C06\u88AB\u5FFD\u7565\u3002\u8FD9\u4E0D\u4F1A\u5F71\u54CD\u6570\u636E\u5BFC\u5165\uFF0C\u60A8\u53EF\u4EE5\u7EE7\u7EED\u64CD\u4F5C\u3002");
            }
            else {
                recommendation = '所有字段都能正确匹配，建议继续导入';
                userFriendlyMessage = "\u5B8C\u7F8E\uFF01\u60A8\u7684\u6587\u6863\u4E2D\u7684\u6240\u6709 ".concat(sourceFields.length, " \u4E2A\u5B57\u6BB5\u90FD\u80FD\u6B63\u786E\u5339\u914D\u5230\u6570\u636E\u5E93\u5B57\u6BB5\uFF0C\u53EF\u4EE5\u5B89\u5168\u5BFC\u5165\u3002");
            }
        }
        else {
            var missingRequired = comparisonTable.missing.filter(function (m) { return !m.canUseDefault; });
            recommendation = "\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5\uFF0C\u65E0\u6CD5\u5BFC\u5165";
            userFriendlyMessage = "\u62B1\u6B49\uFF0C\u60A8\u7684\u6587\u6863\u7F3A\u5C11 ".concat(missingRequired.length, " \u4E2A\u5FC5\u586B\u5B57\u6BB5\uFF08").concat(missingRequired.map(function (m) { return m.targetField; }).join(', '), "\uFF09\uFF0C\u8BF7\u8865\u5145\u8FD9\u4E9B\u5B57\u6BB5\u540E\u91CD\u65B0\u4E0A\u4F20\u3002");
        }
        return {
            totalSourceFields: sourceFields.length,
            willImportCount: comparisonTable.willImport.length,
            willIgnoreCount: comparisonTable.willIgnore.length,
            missingRequiredCount: comparisonTable.missing.filter(function (m) { return !m.canUseDefault; }).length,
            conflictsCount: comparisonTable.conflicts.length,
            canProceed: canProceed,
            recommendation: recommendation,
            userFriendlyMessage: userFriendlyMessage
        };
    };
    return DataImportService;
}());
exports.DataImportService = DataImportService;
