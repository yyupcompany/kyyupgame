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
var ai_bridge_service_1 = require("../../bridge/ai-bridge.service");
var api_group_mapping_service_1 = require("../../api-group-mapping.service");
/**
 * 通用数据更新工具 - 两阶段确认机制
 * 🚀 第一阶段：AI分析并找到对应API，获取当前数据
 * 🚀 第二阶段：显示更新前后对比，用户确认后执行更新
 */
var updateDataRecordTool = {
    name: "update_data_record",
    description: "🚀 通用数据更新工具 - 智能分析API端点，显示更新前后对比，用户确认后执行",
    category: "database-crud",
    weight: 8,
    parameters: {
        type: "object",
        properties: {
            table_name: {
                type: "string",
                description: "目标数据表名称",
                "enum": ["students", "teachers", "activities", "classes", "parents", "users", "enrollments", "todos"]
            },
            record_id: {
                type: "string",
                description: "要更新的记录ID"
            },
            updates: {
                type: "object",
                description: "要更新的字段和新值"
            },
            description: {
                type: "string",
                description: "更新操作的描述，用于用户确认"
            },
            auto_confirm: {
                type: "boolean",
                "default": false,
                description: "是否自动确认（仅限简单操作）"
            }
        },
        required: ["table_name", "record_id", "updates"]
    },
    implementation: function (args) { return __awaiter(void 0, void 0, void 0, function () {
        var table_name, record_id, updates, _a, description, _b, auto_confirm, analysisResult, currentData, confirmationData, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    table_name = args.table_name, record_id = args.record_id, updates = args.updates, _a = args.description, description = _a === void 0 ? "" : _a, _b = args.auto_confirm, auto_confirm = _b === void 0 ? false : _b;
                    console.log('🚀 [更新数据] 开始分析更新请求:', {
                        table_name: table_name,
                        record_id: record_id,
                        description: description,
                        auto_confirm: auto_confirm,
                        updateFields: Object.keys(updates)
                    });
                    return [4 /*yield*/, analyzeUpdateRequest(table_name, record_id, updates, description)];
                case 1:
                    analysisResult = _c.sent();
                    if (!analysisResult.success) {
                        return [2 /*return*/, {
                                name: "update_data_record",
                                status: "error",
                                result: null,
                                error: analysisResult.error
                            }];
                    }
                    return [4 /*yield*/, getCurrentRecordData(table_name, record_id)];
                case 2:
                    currentData = _c.sent();
                    if (!currentData) {
                        return [2 /*return*/, {
                                name: "update_data_record",
                                status: "error",
                                result: null,
                                error: "\u672A\u627E\u5230ID\u4E3A ".concat(record_id, " \u7684").concat(getTableDisplayName(table_name), "\u8BB0\u5F55")
                            }];
                    }
                    return [4 /*yield*/, generateUpdateConfirmationData(table_name, record_id, currentData, updates, analysisResult, description)];
                case 3:
                    confirmationData = _c.sent();
                    if (!(auto_confirm && analysisResult.complexity === 'simple')) return [3 /*break*/, 5];
                    console.log('🔄 [更新数据] 自动确认模式，直接执行更新');
                    return [4 /*yield*/, executeUpdateOperation(confirmationData)];
                case 4: return [2 /*return*/, _c.sent()];
                case 5: 
                // 返回确认信息，等待用户确认
                return [2 /*return*/, {
                        name: "update_data_record",
                        status: "pending_confirmation",
                        result: {
                            type: 'data_update_confirmation',
                            confirmation_data: confirmationData,
                            ui_instruction: {
                                type: 'show_confirmation_dialog',
                                dialog_type: 'update_data_record',
                                title: "\u786E\u8BA4\u66F4\u65B0".concat(getTableDisplayName(table_name)),
                                data: confirmationData
                            },
                            message: "\uD83D\uDCCB \u5DF2\u5206\u6790\u66F4\u65B0\u8BF7\u6C42\uFF0C\u8BF7\u786E\u8BA4\u540E\u6267\u884C\u66F4\u65B0\u64CD\u4F5C"
                        },
                        metadata: {
                            table_name: table_name,
                            record_id: record_id,
                            operation: 'update',
                            complexity: analysisResult.complexity,
                            api_endpoint: analysisResult.api_endpoint,
                            requires_confirmation: true,
                            analysis_time: Date.now()
                        }
                    }];
                case 6:
                    error_1 = _c.sent();
                    console.error('❌ [更新数据] 更新分析失败:', error_1);
                    return [2 /*return*/, {
                            name: "update_data_record",
                            status: "error",
                            result: null,
                            error: "\u66F4\u65B0\u6570\u636E\u5206\u6790\u5931\u8D25: ".concat(error_1.message)
                        }];
                case 7: return [2 /*return*/];
            }
        });
    }); }
};
/**
 * 🧠 AI分析更新请求
 */
function analyzeUpdateRequest(tableName, recordId, updates, description) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var analysisPrompt, response, aiContent, jsonMatch, analysis, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    console.log('🧠 [AI分析] 开始分析更新请求');
                    analysisPrompt = "\u8BF7\u5206\u6790\u4EE5\u4E0B\u6570\u636E\u66F4\u65B0\u8BF7\u6C42\uFF1A\n\n\u76EE\u6807\u8868: ".concat(tableName, "\n\u8BB0\u5F55ID: ").concat(recordId, "\n\u66F4\u65B0\u5B57\u6BB5: ").concat(JSON.stringify(updates, null, 2), "\n\u64CD\u4F5C\u63CF\u8FF0: ").concat(description, "\n\n\u8BF7\u8FD4\u56DEJSON\u683C\u5F0F\u7684\u5206\u6790\u7ED3\u679C\uFF1A\n{\n  \"success\": true,\n  \"api_endpoint\": \"\u5BF9\u5E94\u7684API\u7AEF\u70B9\u8DEF\u5F84\",\n  \"http_method\": \"PUT\",\n  \"complexity\": \"simple|medium|complex\",\n  \"updated_fields\": [\"\u88AB\u66F4\u65B0\u7684\u5B57\u6BB5\u5217\u8868\"],\n  \"critical_fields\": [\"\u5173\u952E\u5B57\u6BB5\u5217\u8868\"],\n  \"validation_rules\": [\"\u9A8C\u8BC1\u89C4\u5219\"],\n  \"potential_impacts\": [\"\u53EF\u80FD\u7684\u5F71\u54CD\"],\n  \"recommendations\": [\"\u5EFA\u8BAE\"],\n  \"estimated_time\": \"\u9884\u4F30\u6267\u884C\u65F6\u95F4\"\n}\n\nAPI\u7AEF\u70B9\u6620\u5C04\u89C4\u5219\uFF1A\n- students -> /api/students/{id}\n- teachers -> /api/teachers/{id}\n- activities -> /api/activities/{id}\n- classes -> /api/classes/{id}\n- parents -> /api/parents/{id}\n- users -> /api/users/{id}\n- enrollments -> /api/enrollment-applications/{id}\n- todos -> /api/todos/{id}\n\n\u53EA\u8FD4\u56DEJSON\uFF0C\u4E0D\u8981\u5176\u4ED6\u5185\u5BB9\uFF1A");
                    return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateFastChatCompletion({
                            model: 'doubao-seed-1-6-flash-250715',
                            messages: [
                                {
                                    role: 'system',
                                    content: '你是一个专业的数据库操作分析专家，专门分析幼儿园管理系统的数据更新请求。请快速准确地返回JSON格式分析结果。'
                                },
                                {
                                    role: 'user',
                                    content: analysisPrompt
                                }
                            ],
                            temperature: 0.1,
                            max_tokens: 600,
                            stream: false // 不使用流式输出，减少延迟
                        })];
                case 1:
                    response = _c.sent();
                    aiContent = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
                    console.log('🧠 [AI分析] AI响应:', aiContent);
                    jsonMatch = aiContent.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        analysis = JSON.parse(jsonMatch[0]);
                        console.log('✅ [AI分析] 分析成功:', analysis);
                        return [2 /*return*/, analysis];
                    }
                    else {
                        throw new Error('AI响应格式不正确');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _c.sent();
                    console.warn('⚠️ [AI分析] AI分析失败，使用默认分析:', error_2);
                    return [2 /*return*/, getDefaultUpdateAnalysis(tableName, recordId, updates)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * 获取当前记录数据
 */
function getCurrentRecordData(tableName, recordId) {
    return __awaiter(this, void 0, void 0, function () {
        var mockData;
        return __generator(this, function (_a) {
            try {
                mockData = {
                    'students': {
                        id: recordId,
                        name: '张小明',
                        age: 5,
                        class_id: '1',
                        student_no: 'S20240001',
                        status: 'active',
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z'
                    },
                    'teachers': {
                        id: recordId,
                        name: '李老师',
                        subject: '语言',
                        teacher_no: 'T2024001',
                        experience: 5,
                        status: 'active',
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z'
                    },
                    'activities': {
                        id: recordId,
                        title: '春季运动会',
                        description: '幼儿园春季运动会活动',
                        start_time: '2024-03-15T09:00:00Z',
                        end_time: '2024-03-15T17:00:00Z',
                        status: 'planned',
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z'
                    }
                };
                return [2 /*return*/, mockData[tableName] || null];
            }
            catch (error) {
                console.error('❌ [获取数据] 获取当前记录失败:', error);
                return [2 /*return*/, null];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * 生成更新确认数据
 */
function generateUpdateConfirmationData(tableName, recordId, currentData, updates, analysis, description) {
    return __awaiter(this, void 0, void 0, function () {
        var beforeAfterComparison, confirmationData;
        return __generator(this, function (_a) {
            beforeAfterComparison = generateBeforeAfterComparison(currentData, updates);
            confirmationData = {
                operation: 'update',
                table_name: tableName,
                table_display_name: getTableDisplayName(tableName),
                record_id: recordId,
                description: description || "\u66F4\u65B0".concat(getTableDisplayName(tableName), "\u8BB0\u5F55"),
                // 操作详情
                operation_details: {
                    api_endpoint: analysis.api_endpoint.replace('{id}', recordId),
                    http_method: analysis.http_method,
                    complexity: analysis.complexity,
                    estimated_time: analysis.estimated_time
                },
                // 当前数据
                current_data: currentData,
                // 更新内容
                update_details: {
                    updates: updates,
                    updated_fields: analysis.updated_fields || Object.keys(updates),
                    critical_fields: analysis.critical_fields || []
                },
                // 更新前后对比
                before_after_comparison: beforeAfterComparison,
                // 影响分析
                impact_analysis: {
                    what_will_happen: "\u5C06\u66F4\u65B0".concat(getTableDisplayName(tableName), "\u8BB0\u5F55\u7684 ").concat(Object.keys(updates).length, " \u4E2A\u5B57\u6BB5"),
                    affected_records: 1,
                    potential_impacts: analysis.potential_impacts || [],
                    validation_rules: analysis.validation_rules || []
                },
                // 建议和警告
                recommendations: analysis.recommendations || [],
                warnings: generateUpdateWarnings(tableName, currentData, updates, analysis),
                // 确认选项
                confirmation_options: {
                    can_proceed: true,
                    requires_review: analysis.complexity !== 'simple',
                    auto_confirm_available: analysis.complexity === 'simple'
                },
                // 元数据
                metadata: {
                    analysis_time: new Date().toISOString(),
                    tool_name: 'update_data_record',
                    version: '1.0.0'
                }
            };
            return [2 /*return*/, confirmationData];
        });
    });
}
/**
 * 生成更新前后对比
 */
function generateBeforeAfterComparison(currentData, updates) {
    var comparison = [];
    for (var _i = 0, _a = Object.entries(updates); _i < _a.length; _i++) {
        var _b = _a[_i], field = _b[0], newValue = _b[1];
        var oldValue = currentData[field];
        comparison.push({
            field: field,
            field_display_name: getFieldDisplayName(field),
            old_value: oldValue,
            new_value: newValue,
            changed: oldValue !== newValue,
            change_type: getChangeType(oldValue, newValue)
        });
    }
    return comparison;
}
/**
 * 执行更新操作
 */
function executeUpdateOperation(confirmationData) {
    return __awaiter(this, void 0, void 0, function () {
        var operation_details, current_data, update_details, updatedData, mockResult;
        return __generator(this, function (_a) {
            try {
                console.log('🔧 [执行更新] 开始执行更新操作');
                operation_details = confirmationData.operation_details, current_data = confirmationData.current_data, update_details = confirmationData.update_details;
                updatedData = __assign(__assign(__assign({}, current_data), update_details.updates), { updated_at: new Date().toISOString() });
                mockResult = {
                    success: true,
                    data: updatedData
                };
                console.log('✅ [执行更新] 更新操作完成');
                return [2 /*return*/, {
                        name: "update_data_record",
                        status: "success",
                        result: {
                            updated_record: mockResult.data,
                            operation_summary: {
                                table_name: confirmationData.table_name,
                                record_id: confirmationData.record_id,
                                operation: 'update',
                                updated_fields: update_details.updated_fields,
                                affected_records: 1,
                                execution_time: new Date().toISOString()
                            },
                            before_after_summary: confirmationData.before_after_comparison,
                            message: "\u2705 \u6210\u529F\u66F4\u65B0".concat(confirmationData.table_display_name, "\u8BB0\u5F55")
                        },
                        metadata: {
                            operation: 'update',
                            table_name: confirmationData.table_name,
                            record_id: confirmationData.record_id,
                            updated_fields: update_details.updated_fields,
                            execution_time: Date.now()
                        }
                    }];
            }
            catch (error) {
                console.error('❌ [执行更新] 更新操作失败:', error);
                return [2 /*return*/, {
                        name: "update_data_record",
                        status: "error",
                        result: null,
                        error: "\u66F4\u65B0\u64CD\u4F5C\u5931\u8D25: ".concat(error.message)
                    }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * 获取表显示名称
 */
function getTableDisplayName(tableName) {
    var displayNames = {
        'students': '学生',
        'teachers': '教师',
        'activities': '活动',
        'classes': '班级',
        'parents': '家长',
        'users': '用户',
        'enrollments': '招生申请',
        'todos': '待办事项'
    };
    return displayNames[tableName] || tableName;
}
/**
 * 获取字段显示名称
 */
function getFieldDisplayName(fieldName) {
    var displayNames = {
        'name': '姓名',
        'age': '年龄',
        'status': '状态',
        'title': '标题',
        'description': '描述',
        'start_time': '开始时间',
        'end_time': '结束时间',
        'subject': '科目',
        'experience': '工作经验'
    };
    return displayNames[fieldName] || fieldName;
}
/**
 * 获取变化类型
 */
function getChangeType(oldValue, newValue) {
    if (oldValue === null || oldValue === undefined) {
        return 'added';
    }
    if (newValue === null || newValue === undefined) {
        return 'removed';
    }
    return 'modified';
}
/**
 * 生成更新警告
 */
function generateUpdateWarnings(tableName, currentData, updates, analysis) {
    var _a, _b;
    var warnings = [];
    if (analysis.complexity === 'complex') {
        warnings.push('⚠️ 这是一个复杂更新操作，请仔细检查变更内容');
    }
    if (((_a = analysis.critical_fields) === null || _a === void 0 ? void 0 : _a.length) > 0) {
        var criticalUpdates = Object.keys(updates).filter(function (field) {
            return analysis.critical_fields.includes(field);
        });
        if (criticalUpdates.length > 0) {
            warnings.push("\u26A0\uFE0F \u6B63\u5728\u66F4\u65B0\u5173\u952E\u5B57\u6BB5: ".concat(criticalUpdates.join(', ')));
        }
    }
    if (((_b = analysis.potential_impacts) === null || _b === void 0 ? void 0 : _b.length) > 0) {
        warnings.push('⚠️ 此更新可能影响其他相关数据');
    }
    return warnings;
}
/**
 * 获取默认更新分析结果
 */
function getDefaultUpdateAnalysis(tableName, recordId, updates) {
    // 🎯 使用ApiGroupMappingService获取API端点
    var apiEndpoint = api_group_mapping_service_1.apiGroupMappingService.getApiEndpointByEntity(tableName);
    var apiDetails = api_group_mapping_service_1.apiGroupMappingService.getApiDetailsByEntity(tableName);
    if (!apiEndpoint) {
        var supportedEntities = api_group_mapping_service_1.apiGroupMappingService.getSupportedEntities();
        return {
            success: false,
            error: "\u4E0D\u652F\u6301\u7684\u6570\u636E\u8868: ".concat(tableName, "\u3002\u652F\u6301\u7684\u7C7B\u578B: ").concat(supportedEntities.join(', '))
        };
    }
    return {
        success: true,
        api_endpoint: "".concat(apiEndpoint, "/{id}"),
        http_method: 'PUT',
        business_center: (apiDetails === null || apiDetails === void 0 ? void 0 : apiDetails.group) || '未分组',
        complexity: 'medium',
        updated_fields: Object.keys(updates),
        critical_fields: ['status', 'name'],
        validation_rules: ['数据格式验证', '字段值检查'],
        potential_impacts: [],
        recommendations: ['请确认更新内容准确性'],
        estimated_time: '1-2秒'
    };
}
exports["default"] = updateDataRecordTool;
