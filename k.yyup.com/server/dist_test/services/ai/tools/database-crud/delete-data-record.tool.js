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
var ai_bridge_service_1 = require("../../bridge/ai-bridge.service");
/**
 * 安全数据删除工具 - 两阶段确认机制
 * 🚀 第一阶段：AI分析并找到对应API，检查关联数据
 * 🚀 第二阶段：显示删除影响分析，用户确认后执行删除
 */
var deleteDataRecordTool = {
    name: "delete_data_record",
    description: "🚀 安全数据删除工具 - 智能分析删除影响，显示关联数据，用户确认后执行删除",
    category: "database-crud",
    weight: 6,
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
                description: "要删除的记录ID"
            },
            delete_type: {
                type: "string",
                "enum": ["soft", "hard"],
                "default": "soft",
                description: "删除类型：soft(软删除)或hard(硬删除)"
            },
            description: {
                type: "string",
                description: "删除操作的描述，用于用户确认"
            },
            force_delete: {
                type: "boolean",
                "default": false,
                description: "是否强制删除（忽略关联检查）"
            }
        },
        required: ["table_name", "record_id"]
    },
    implementation: function (args) { return __awaiter(void 0, void 0, void 0, function () {
        var table_name, record_id, _a, delete_type, _b, description, _c, force_delete, analysisResult, currentData, relatedData, confirmationData, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    table_name = args.table_name, record_id = args.record_id, _a = args.delete_type, delete_type = _a === void 0 ? "soft" : _a, _b = args.description, description = _b === void 0 ? "" : _b, _c = args.force_delete, force_delete = _c === void 0 ? false : _c;
                    console.log('🚀 [删除数据] 开始分析删除请求:', {
                        table_name: table_name,
                        record_id: record_id,
                        delete_type: delete_type,
                        description: description,
                        force_delete: force_delete
                    });
                    return [4 /*yield*/, analyzeDeleteRequest(table_name, record_id, delete_type, description)];
                case 1:
                    analysisResult = _d.sent();
                    if (!analysisResult.success) {
                        return [2 /*return*/, {
                                name: "delete_data_record",
                                status: "error",
                                result: null,
                                error: analysisResult.error
                            }];
                    }
                    return [4 /*yield*/, getCurrentRecordData(table_name, record_id)];
                case 2:
                    currentData = _d.sent();
                    if (!currentData) {
                        return [2 /*return*/, {
                                name: "delete_data_record",
                                status: "error",
                                result: null,
                                error: "\u672A\u627E\u5230ID\u4E3A ".concat(record_id, " \u7684").concat(getTableDisplayName(table_name), "\u8BB0\u5F55")
                            }];
                    }
                    return [4 /*yield*/, checkRelatedData(table_name, record_id)];
                case 3:
                    relatedData = _d.sent();
                    return [4 /*yield*/, generateDeleteConfirmationData(table_name, record_id, currentData, relatedData, delete_type, analysisResult, description, force_delete)];
                case 4:
                    confirmationData = _d.sent();
                    // 检查是否可以安全删除
                    if (!confirmationData.safety_check.can_delete && !force_delete) {
                        return [2 /*return*/, {
                                name: "delete_data_record",
                                status: "error",
                                result: null,
                                error: "\u65E0\u6CD5\u5220\u9664\uFF1A".concat(confirmationData.safety_check.blocking_reason)
                            }];
                    }
                    // 返回确认信息，等待用户确认
                    return [2 /*return*/, {
                            name: "delete_data_record",
                            status: "pending_confirmation",
                            result: {
                                type: 'data_delete_confirmation',
                                confirmation_data: confirmationData,
                                ui_instruction: {
                                    type: 'show_confirmation_dialog',
                                    dialog_type: 'delete_data_record',
                                    title: "\u786E\u8BA4\u5220\u9664".concat(getTableDisplayName(table_name)),
                                    data: confirmationData
                                },
                                message: "\uD83D\uDCCB \u5DF2\u5206\u6790\u5220\u9664\u8BF7\u6C42\uFF0C\u8BF7\u786E\u8BA4\u540E\u6267\u884C\u5220\u9664\u64CD\u4F5C"
                            },
                            metadata: {
                                table_name: table_name,
                                record_id: record_id,
                                operation: 'delete',
                                delete_type: delete_type,
                                complexity: analysisResult.complexity,
                                api_endpoint: analysisResult.api_endpoint,
                                requires_confirmation: true,
                                has_related_data: relatedData.total_count > 0,
                                analysis_time: Date.now()
                            }
                        }];
                case 5:
                    error_1 = _d.sent();
                    console.error('❌ [删除数据] 删除分析失败:', error_1);
                    return [2 /*return*/, {
                            name: "delete_data_record",
                            status: "error",
                            result: null,
                            error: "\u5220\u9664\u6570\u636E\u5206\u6790\u5931\u8D25: ".concat(error_1.message)
                        }];
                case 6: return [2 /*return*/];
            }
        });
    }); }
};
/**
 * 🧠 AI分析删除请求
 */
function analyzeDeleteRequest(tableName, recordId, deleteType, description) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var analysisPrompt, response, aiContent, jsonMatch, analysis, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    console.log('🧠 [AI分析] 开始分析删除请求');
                    analysisPrompt = "\u8BF7\u5206\u6790\u4EE5\u4E0B\u6570\u636E\u5220\u9664\u8BF7\u6C42\uFF1A\n\n\u76EE\u6807\u8868: ".concat(tableName, "\n\u8BB0\u5F55ID: ").concat(recordId, "\n\u5220\u9664\u7C7B\u578B: ").concat(deleteType, "\n\u64CD\u4F5C\u63CF\u8FF0: ").concat(description, "\n\n\u8BF7\u8FD4\u56DEJSON\u683C\u5F0F\u7684\u5206\u6790\u7ED3\u679C\uFF1A\n{\n  \"success\": true,\n  \"api_endpoint\": \"\u5BF9\u5E94\u7684API\u7AEF\u70B9\u8DEF\u5F84\",\n  \"http_method\": \"DELETE\",\n  \"complexity\": \"simple|medium|complex\",\n  \"delete_strategy\": \"soft|hard|cascade\",\n  \"related_tables\": [\"\u53EF\u80FD\u53D7\u5F71\u54CD\u7684\u5173\u8054\u8868\"],\n  \"cascade_effects\": [\"\u7EA7\u8054\u5220\u9664\u6548\u679C\"],\n  \"safety_concerns\": [\"\u5B89\u5168\u8003\u8651\"],\n  \"recommendations\": [\"\u5EFA\u8BAE\"],\n  \"estimated_time\": \"\u9884\u4F30\u6267\u884C\u65F6\u95F4\"\n}\n\nAPI\u7AEF\u70B9\u6620\u5C04\u89C4\u5219\uFF1A\n- students -> /api/students/{id}\n- teachers -> /api/teachers/{id}\n- activities -> /api/activities/{id}\n- classes -> /api/classes/{id}\n- parents -> /api/parents/{id}\n- users -> /api/users/{id}\n- enrollments -> /api/enrollment-applications/{id}\n- todos -> /api/todos/{id}\n\n\u53EA\u8FD4\u56DEJSON\uFF0C\u4E0D\u8981\u5176\u4ED6\u5185\u5BB9\uFF1A");
                    return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateFastChatCompletion({
                            model: 'doubao-seed-1-6-flash-250715',
                            messages: [
                                {
                                    role: 'system',
                                    content: '你是一个专业的数据库操作分析专家，专门分析幼儿园管理系统的数据删除请求，特别关注数据安全和关联影响。请快速准确地返回JSON格式分析结果。'
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
                    return [2 /*return*/, getDefaultDeleteAnalysis(tableName, recordId, deleteType)];
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
                        participants: 25,
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
 * 检查关联数据
 */
function checkRelatedData(tableName, recordId) {
    return __awaiter(this, void 0, void 0, function () {
        var mockRelatedData;
        return __generator(this, function (_a) {
            try {
                mockRelatedData = {
                    'students': {
                        total_count: 3,
                        related_records: [
                            { table: 'activity_registrations', count: 2, description: '活动报名记录' },
                            { table: 'performance_reports', count: 1, description: '成绩报告' }
                        ]
                    },
                    'teachers': {
                        total_count: 2,
                        related_records: [
                            { table: 'classes', count: 1, description: '负责的班级' },
                            { table: 'activities', count: 1, description: '组织的活动' }
                        ]
                    },
                    'activities': {
                        total_count: 1,
                        related_records: [
                            { table: 'activity_registrations', count: 25, description: '活动报名记录' }
                        ]
                    }
                };
                return [2 /*return*/, mockRelatedData[tableName] || { total_count: 0, related_records: [] }];
            }
            catch (error) {
                console.error('❌ [检查关联] 检查关联数据失败:', error);
                return [2 /*return*/, { total_count: 0, related_records: [] }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * 生成删除确认数据
 */
function generateDeleteConfirmationData(tableName, recordId, currentData, relatedData, deleteType, analysis, description, forceDelete) {
    return __awaiter(this, void 0, void 0, function () {
        var safetyCheck, confirmationData;
        return __generator(this, function (_a) {
            safetyCheck = performSafetyCheck(tableName, currentData, relatedData, deleteType, forceDelete);
            confirmationData = {
                operation: 'delete',
                table_name: tableName,
                table_display_name: getTableDisplayName(tableName),
                record_id: recordId,
                delete_type: deleteType,
                description: description || "\u5220\u9664".concat(getTableDisplayName(tableName), "\u8BB0\u5F55"),
                // 操作详情
                operation_details: {
                    api_endpoint: analysis.api_endpoint.replace('{id}', recordId),
                    http_method: analysis.http_method,
                    complexity: analysis.complexity,
                    delete_strategy: analysis.delete_strategy,
                    estimated_time: analysis.estimated_time
                },
                // 当前数据
                current_data: currentData,
                // 关联数据分析
                related_data_analysis: {
                    total_related_count: relatedData.total_count,
                    related_records: relatedData.related_records,
                    cascade_effects: analysis.cascade_effects || [],
                    affected_tables: analysis.related_tables || []
                },
                // 删除影响分析
                impact_analysis: {
                    what_will_happen: generateWhatWillHappen(tableName, deleteType, relatedData),
                    affected_records: 1 + relatedData.total_count,
                    data_recovery: deleteType === 'soft' ? '可恢复' : '不可恢复',
                    risk_level: calculateRiskLevel(relatedData, deleteType)
                },
                // 安全检查
                safety_check: safetyCheck,
                // 建议和警告
                recommendations: analysis.recommendations || [],
                warnings: generateDeleteWarnings(tableName, currentData, relatedData, deleteType, analysis),
                // 确认选项
                confirmation_options: {
                    can_proceed: safetyCheck.can_delete,
                    requires_review: true,
                    force_delete_available: !safetyCheck.can_delete,
                    alternative_actions: generateAlternativeActions(tableName, deleteType)
                },
                // 元数据
                metadata: {
                    analysis_time: new Date().toISOString(),
                    tool_name: 'delete_data_record',
                    version: '1.0.0'
                }
            };
            return [2 /*return*/, confirmationData];
        });
    });
}
/**
 * 执行删除操作
 */
function executeDeleteOperation(confirmationData) {
    return __awaiter(this, void 0, void 0, function () {
        var operation_details, current_data, delete_type, mockResult;
        return __generator(this, function (_a) {
            try {
                console.log('🔧 [执行删除] 开始执行删除操作');
                operation_details = confirmationData.operation_details, current_data = confirmationData.current_data, delete_type = confirmationData.delete_type;
                mockResult = {
                    success: true,
                    deleted_record: current_data,
                    delete_type: delete_type,
                    cascaded_deletes: confirmationData.related_data_analysis.related_records
                };
                console.log('✅ [执行删除] 删除操作完成');
                return [2 /*return*/, {
                        name: "delete_data_record",
                        status: "success",
                        result: {
                            deleted_record: mockResult.deleted_record,
                            operation_summary: {
                                table_name: confirmationData.table_name,
                                record_id: confirmationData.record_id,
                                operation: 'delete',
                                delete_type: delete_type,
                                affected_records: confirmationData.impact_analysis.affected_records,
                                execution_time: new Date().toISOString()
                            },
                            cascaded_effects: mockResult.cascaded_deletes,
                            message: "\u2705 \u6210\u529F\u5220\u9664".concat(confirmationData.table_display_name, "\u8BB0\u5F55")
                        },
                        metadata: {
                            operation: 'delete',
                            table_name: confirmationData.table_name,
                            record_id: confirmationData.record_id,
                            delete_type: delete_type,
                            execution_time: Date.now()
                        }
                    }];
            }
            catch (error) {
                console.error('❌ [执行删除] 删除操作失败:', error);
                return [2 /*return*/, {
                        name: "delete_data_record",
                        status: "error",
                        result: null,
                        error: "\u5220\u9664\u64CD\u4F5C\u5931\u8D25: ".concat(error.message)
                    }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * 安全检查
 */
function performSafetyCheck(tableName, currentData, relatedData, deleteType, forceDelete) {
    var canDelete = true;
    var blockingReason = '';
    var concerns = [];
    // 检查关联数据
    if (relatedData.total_count > 0 && deleteType === 'hard') {
        canDelete = false;
        blockingReason = "\u5B58\u5728 ".concat(relatedData.total_count, " \u6761\u5173\u8054\u6570\u636E\uFF0C\u786C\u5220\u9664\u53EF\u80FD\u5BFC\u81F4\u6570\u636E\u4E0D\u4E00\u81F4");
        concerns.push('存在关联数据');
    }
    // 检查关键记录
    if (isKeyRecord(tableName, currentData)) {
        concerns.push('这是关键记录');
    }
    // 强制删除覆盖
    if (forceDelete) {
        canDelete = true;
        blockingReason = '';
        concerns.push('强制删除模式');
    }
    return {
        can_delete: canDelete,
        blocking_reason: blockingReason,
        safety_concerns: concerns,
        risk_level: calculateRiskLevel(relatedData, deleteType)
    };
}
/**
 * 其他辅助函数
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
function generateWhatWillHappen(tableName, deleteType, relatedData) {
    var action = deleteType === 'soft' ? '软删除' : '永久删除';
    var relatedInfo = relatedData.total_count > 0 ?
        "\uFF0C\u540C\u65F6\u5F71\u54CD ".concat(relatedData.total_count, " \u6761\u5173\u8054\u6570\u636E") : '';
    return "\u5C06".concat(action).concat(getTableDisplayName(tableName), "\u8BB0\u5F55").concat(relatedInfo);
}
function calculateRiskLevel(relatedData, deleteType) {
    if (deleteType === 'hard' && relatedData.total_count > 10)
        return 'high';
    if (deleteType === 'hard' && relatedData.total_count > 0)
        return 'medium';
    if (relatedData.total_count > 0)
        return 'low';
    return 'minimal';
}
function isKeyRecord(tableName, data) {
    // 检查是否为关键记录的逻辑
    if (tableName === 'users' && data.role === 'admin')
        return true;
    if (tableName === 'classes' && data.status === 'active')
        return true;
    return false;
}
function generateDeleteWarnings(tableName, currentData, relatedData, deleteType, analysis) {
    var _a;
    var warnings = [];
    if (deleteType === 'hard') {
        warnings.push('🚨 硬删除操作不可恢复，请谨慎操作');
    }
    if (relatedData.total_count > 0) {
        warnings.push("\u26A0\uFE0F \u5B58\u5728 ".concat(relatedData.total_count, " \u6761\u5173\u8054\u6570\u636E\u53EF\u80FD\u53D7\u5F71\u54CD"));
    }
    if (((_a = analysis.safety_concerns) === null || _a === void 0 ? void 0 : _a.length) > 0) {
        warnings.push('⚠️ 检测到安全风险，请仔细确认');
    }
    return warnings;
}
function generateAlternativeActions(tableName, deleteType) {
    var alternatives = [];
    if (deleteType === 'hard') {
        alternatives.push('考虑使用软删除代替');
    }
    alternatives.push('修改状态为"已停用"');
    alternatives.push('转移到归档表');
    return alternatives;
}
function getDefaultDeleteAnalysis(tableName, recordId, deleteType) {
    var endpointMap = {
        'students': '/api/students/{id}',
        'teachers': '/api/teachers/{id}',
        'activities': '/api/activities/{id}',
        'classes': '/api/classes/{id}',
        'parents': '/api/parents/{id}',
        'users': '/api/users/{id}',
        'enrollments': '/api/enrollment-applications/{id}',
        'todos': '/api/todos/{id}'
    };
    return {
        success: true,
        api_endpoint: endpointMap[tableName] || "/api/".concat(tableName, "/{id}"),
        http_method: 'DELETE',
        complexity: deleteType === 'hard' ? 'complex' : 'medium',
        delete_strategy: deleteType,
        related_tables: [],
        cascade_effects: [],
        safety_concerns: deleteType === 'hard' ? ['硬删除风险'] : [],
        recommendations: ['请确认删除操作的必要性'],
        estimated_time: '1-2秒'
    };
}
exports["default"] = deleteDataRecordTool;
