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
var user_context_provider_service_1 = require("../../user-context-provider.service");
var entity_field_config_service_1 = require("../../entity-field-config.service");
var field_recommendation_service_1 = require("../../field-recommendation.service");
/**
 * 通用数据创建工具 - 两阶段确认机制
 * 🚀 第一阶段：AI分析并找到对应API
 * 🚀 第二阶段：用户确认后执行创建
 */
var createDataRecordTool = {
    name: "create_data_record",
    description: "🚀 通用数据创建工具 - 智能分析API端点，生成创建预览，用户确认后执行",
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
            data: {
                type: "object",
                description: "要创建的数据对象"
            },
            description: {
                type: "string",
                description: "创建操作的描述，用于用户确认"
            },
            auto_confirm: {
                type: "boolean",
                "default": false,
                description: "是否自动确认（仅限简单操作）"
            }
        },
        required: ["table_name", "data"]
    },
    implementation: function (args) { return __awaiter(void 0, void 0, void 0, function () {
        var table_name, data, _a, description, _b, auto_confirm, __userContext, mergedData, userContextData, missingFields, fieldNames, recommendations_1, userPreferences_1, _i, fieldNames_1, fieldName, pref, analysisResult, confirmationData, error_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 11, , 12]);
                    table_name = args.table_name, data = args.data, _a = args.description, description = _a === void 0 ? "" : _a, _b = args.auto_confirm, auto_confirm = _b === void 0 ? false : _b, __userContext = args.__userContext;
                    console.log('🚀 [创建数据] 开始分析创建请求:', {
                        table_name: table_name,
                        description: description,
                        auto_confirm: auto_confirm,
                        dataKeys: Object.keys(data),
                        hasUserContext: !!__userContext
                    });
                    mergedData = __assign({}, data);
                    userContextData = null;
                    if (__userContext && __userContext.userId) {
                        // 从__userContext构建UserContextData
                        userContextData = {
                            userId: parseInt(__userContext.userId),
                            username: 'system',
                            kindergartenId: 1,
                            role: 'admin',
                            isAdmin: true
                        };
                        console.log('✅ [用户上下文] 提取成功:', userContextData);
                        // 自动填充字段
                        mergedData = user_context_provider_service_1.userContextProviderService.mergeWithAutoFillFields(userContextData, table_name, data);
                        console.log('✅ [自动填充] 字段合并完成:', {
                            original: Object.keys(data),
                            merged: Object.keys(mergedData)
                        });
                    }
                    else {
                        console.warn('⚠️ [用户上下文] 未找到用户上下文，跳过自动填充');
                    }
                    missingFields = entity_field_config_service_1.entityFieldConfigService.getMissingRequiredFields(table_name, mergedData);
                    if (!(missingFields.length > 0)) return [3 /*break*/, 6];
                    console.log('⚠️ [缺失字段] 检测到缺失的必填字段:', missingFields.map(function (f) { return f.name; }));
                    // 🎯 步骤2.1：获取字段推荐值
                    console.log('🔍 [字段推荐] 开始获取字段推荐值...');
                    fieldNames = missingFields.map(function (f) { return f.name; });
                    return [4 /*yield*/, field_recommendation_service_1.fieldRecommendationService.getBatchFieldRecommendations(table_name, fieldNames, 3, // 每个字段推荐3个值
                        30 // 回溯30天
                        )];
                case 1:
                    recommendations_1 = _d.sent();
                    userPreferences_1 = {};
                    if (!(userContextData && userContextData.userId)) return [3 /*break*/, 5];
                    console.log('🔍 [用户偏好] 获取用户个人偏好...');
                    _i = 0, fieldNames_1 = fieldNames;
                    _d.label = 2;
                case 2:
                    if (!(_i < fieldNames_1.length)) return [3 /*break*/, 5];
                    fieldName = fieldNames_1[_i];
                    return [4 /*yield*/, field_recommendation_service_1.fieldRecommendationService.getUserFieldPreferences(table_name, fieldName, userContextData.userId, 2 // 用户偏好推荐2个
                        )];
                case 3:
                    pref = _d.sent();
                    if (pref.recommendations.length > 0) {
                        userPreferences_1[fieldName] = pref;
                    }
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: 
                // 返回缺失字段状态，前端将显示表单让用户补充
                return [2 /*return*/, {
                        name: "create_data_record",
                        status: "error",
                        result: {
                            type: 'missing_fields',
                            table_name: table_name,
                            current_data: mergedData,
                            missing_fields: missingFields.map(function (f) {
                                var _a, _b;
                                return ({
                                    name: f.name,
                                    label: f.label,
                                    type: f.type,
                                    required: f.required,
                                    description: f.description,
                                    placeholder: f.placeholder,
                                    enumValues: f.enumValues,
                                    // 🎯 添加推荐值
                                    recommendations: ((_a = recommendations_1[f.name]) === null || _a === void 0 ? void 0 : _a.recommendations) || [],
                                    userPreferences: ((_b = userPreferences_1[f.name]) === null || _b === void 0 ? void 0 : _b.recommendations) || []
                                });
                            }),
                            ui_instruction: {
                                type: 'show_missing_fields_dialog',
                                title: "\u8865\u5145".concat(((_c = entity_field_config_service_1.entityFieldConfigService.getEntityConfig(table_name)) === null || _c === void 0 ? void 0 : _c.displayName) || table_name, "\u4FE1\u606F"),
                                message: "\u8BF7\u8865\u5145\u4EE5\u4E0B\u5FC5\u586B\u5B57\u6BB5\uFF1A".concat(missingFields.map(function (f) { return f.label; }).join('、'))
                            },
                            // 🚨 关键修复：暂停多轮调用，等待用户补充字段
                            needsContinue: false,
                            isComplete: false
                        },
                        error: "\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5: ".concat(missingFields.map(function (f) { return f.label; }).join('、')),
                        metadata: {
                            table_name: table_name,
                            operation: 'create',
                            missing_field_count: missingFields.length,
                            has_recommendations: Object.keys(recommendations_1).some(function (k) { return recommendations_1[k].recommendations.length > 0; }),
                            has_user_preferences: Object.keys(userPreferences_1).length > 0,
                            // 🚨 关键修复：在metadata中也添加暂停标志
                            needsContinue: false,
                            isComplete: false
                        }
                    }];
                case 6: return [4 /*yield*/, analyzeCreateRequest(table_name, mergedData, description)];
                case 7:
                    analysisResult = _d.sent();
                    if (!analysisResult.success) {
                        return [2 /*return*/, {
                                name: "create_data_record",
                                status: "error",
                                result: null,
                                error: analysisResult.error
                            }];
                    }
                    return [4 /*yield*/, generateConfirmationData(table_name, mergedData, analysisResult, description)];
                case 8:
                    confirmationData = _d.sent();
                    if (!(auto_confirm && analysisResult.complexity === 'simple')) return [3 /*break*/, 10];
                    console.log('🔄 [创建数据] 自动确认模式，直接执行创建');
                    return [4 /*yield*/, executeCreateOperation(confirmationData)];
                case 9: return [2 /*return*/, _d.sent()];
                case 10: 
                // 返回确认信息，等待用户确认
                return [2 /*return*/, {
                        name: "create_data_record",
                        status: "pending_confirmation",
                        result: {
                            type: 'data_create_confirmation',
                            confirmation_data: confirmationData,
                            ui_instruction: {
                                type: 'show_confirmation_dialog',
                                dialog_type: 'create_data_record',
                                title: "\u786E\u8BA4\u521B\u5EFA".concat(getTableDisplayName(table_name)),
                                data: confirmationData
                            },
                            message: "\uD83D\uDCCB \u5DF2\u5206\u6790\u521B\u5EFA\u8BF7\u6C42\uFF0C\u8BF7\u786E\u8BA4\u540E\u6267\u884C\u521B\u5EFA\u64CD\u4F5C"
                        },
                        metadata: {
                            table_name: table_name,
                            operation: 'create',
                            complexity: analysisResult.complexity,
                            api_endpoint: analysisResult.api_endpoint,
                            requires_confirmation: true,
                            analysis_time: Date.now()
                        }
                    }];
                case 11:
                    error_1 = _d.sent();
                    console.error('❌ [创建数据] 创建分析失败:', error_1);
                    return [2 /*return*/, {
                            name: "create_data_record",
                            status: "error",
                            result: null,
                            error: "\u521B\u5EFA\u6570\u636E\u5206\u6790\u5931\u8D25: ".concat(error_1.message)
                        }];
                case 12: return [2 /*return*/];
            }
        });
    }); }
};
/**
 * 🧠 AI分析创建请求 - 基于Swagger API映射
 */
function analyzeCreateRequest(tableName, data, description) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var apiEndpoint, supportedEntities, apiDetails, requiredFields, autoFillFields, entityConfig, allFields, requiredFieldNames_1, autoFillFieldNames_1, optionalFields, apiMapping, analysisPrompt, response, aiContent, jsonMatch, analysis, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    console.log('🧠 [AI分析] 开始分析创建请求');
                    apiEndpoint = api_group_mapping_service_1.apiGroupMappingService.getApiEndpointByEntity(tableName);
                    if (!apiEndpoint) {
                        supportedEntities = api_group_mapping_service_1.apiGroupMappingService.getSupportedEntities();
                        return [2 /*return*/, {
                                success: false,
                                error: "\u4E0D\u652F\u6301\u7684\u6570\u636E\u8868: ".concat(tableName, "\u3002\u652F\u6301\u7684\u7C7B\u578B: ").concat(supportedEntities.join(', '))
                            }];
                    }
                    apiDetails = api_group_mapping_service_1.apiGroupMappingService.getApiDetailsByEntity(tableName);
                    requiredFields = entity_field_config_service_1.entityFieldConfigService.getRequiredFields(tableName);
                    autoFillFields = entity_field_config_service_1.entityFieldConfigService.getAutoFillFields(tableName);
                    entityConfig = entity_field_config_service_1.entityFieldConfigService.getEntityConfig(tableName);
                    allFields = (entityConfig === null || entityConfig === void 0 ? void 0 : entityConfig.fields) || [];
                    requiredFieldNames_1 = requiredFields.map(function (f) { return f.name; });
                    autoFillFieldNames_1 = autoFillFields.map(function (f) { return f.name; });
                    optionalFields = allFields
                        .filter(function (f) { return !requiredFieldNames_1.includes(f.name) && !autoFillFieldNames_1.includes(f.name); })
                        .map(function (f) { return f.name; });
                    apiMapping = {
                        endpoint: apiEndpoint,
                        method: 'POST',
                        center: (apiDetails === null || apiDetails === void 0 ? void 0 : apiDetails.group) || '未分组',
                        requiredFields: requiredFieldNames_1,
                        optionalFields: optionalFields
                    };
                    analysisPrompt = "\u8BF7\u5206\u6790\u4EE5\u4E0B\u6570\u636E\u521B\u5EFA\u8BF7\u6C42\uFF1A\n\n\u76EE\u6807\u8868: ".concat(tableName, "\n\u4E1A\u52A1\u4E2D\u5FC3: ").concat(apiMapping.center, "\nAPI\u7AEF\u70B9: ").concat(apiMapping.endpoint, "\n\u521B\u5EFA\u6570\u636E: ").concat(JSON.stringify(data, null, 2), "\n\u64CD\u4F5C\u63CF\u8FF0: ").concat(description, "\n\n\u5DF2\u77E5\u7684API\u4FE1\u606F\uFF1A\n- HTTP\u65B9\u6CD5: ").concat(apiMapping.method, "\n- \u5FC5\u586B\u5B57\u6BB5: ").concat(apiMapping.requiredFields.join(', '), "\n- \u53EF\u9009\u5B57\u6BB5: ").concat(apiMapping.optionalFields.join(', '), "\n\n\u8BF7\u8FD4\u56DEJSON\u683C\u5F0F\u7684\u5206\u6790\u7ED3\u679C\uFF1A\n{\n  \"success\": true,\n  \"api_endpoint\": \"").concat(apiMapping.endpoint, "\",\n  \"http_method\": \"").concat(apiMapping.method, "\",\n  \"business_center\": \"").concat(apiMapping.center, "\",\n  \"complexity\": \"simple|medium|complex\",\n  \"field_validation\": {\n    \"missing_required\": [\"\u7F3A\u5931\u7684\u5FC5\u586B\u5B57\u6BB5\"],\n    \"invalid_fields\": [\"\u65E0\u6548\u7684\u5B57\u6BB5\"],\n    \"field_suggestions\": [\"\u5B57\u6BB5\u5EFA\u8BAE\"]\n  },\n  \"validation_rules\": [\"\u9A8C\u8BC1\u89C4\u5219\"],\n  \"potential_conflicts\": [\"\u53EF\u80FD\u7684\u51B2\u7A81\"],\n  \"recommendations\": [\"\u5EFA\u8BAE\"],\n  \"estimated_time\": \"\u9884\u4F30\u6267\u884C\u65F6\u95F4\"\n}\n\n\u53EA\u8FD4\u56DEJSON\uFF0C\u4E0D\u8981\u5176\u4ED6\u5185\u5BB9\uFF1A");
                    return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateFastChatCompletion({
                            model: 'doubao-seed-1-6-flash-250715',
                            messages: [
                                {
                                    role: 'system',
                                    content: '你是一个专业的数据库操作分析专家，专门分析幼儿园管理系统的数据创建请求。请快速准确地返回JSON格式分析结果。'
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
                    return [2 /*return*/, getDefaultAnalysis(tableName, data)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * 生成确认数据
 */
function generateConfirmationData(tableName, data, analysis, description) {
    return __awaiter(this, void 0, void 0, function () {
        var confirmationData;
        return __generator(this, function (_a) {
            confirmationData = {
                operation: 'create',
                table_name: tableName,
                table_display_name: getTableDisplayName(tableName),
                description: description || "\u521B\u5EFA\u65B0\u7684".concat(getTableDisplayName(tableName), "\u8BB0\u5F55"),
                // 操作详情
                operation_details: {
                    api_endpoint: analysis.api_endpoint,
                    http_method: analysis.http_method,
                    complexity: analysis.complexity,
                    estimated_time: analysis.estimated_time
                },
                // 数据预览
                data_preview: {
                    original_data: data,
                    processed_data: processDataForCreation(tableName, data),
                    required_fields: analysis.required_fields || [],
                    optional_fields: analysis.optional_fields || []
                },
                // 影响分析
                impact_analysis: {
                    what_will_happen: "\u5C06\u5728".concat(getTableDisplayName(tableName), "\u8868\u4E2D\u521B\u5EFA\u4E00\u6761\u65B0\u8BB0\u5F55"),
                    affected_records: 1,
                    potential_conflicts: analysis.potential_conflicts || [],
                    validation_rules: analysis.validation_rules || []
                },
                // 建议和警告
                recommendations: analysis.recommendations || [],
                warnings: generateWarnings(tableName, data, analysis),
                // 确认选项
                confirmation_options: {
                    can_proceed: true,
                    requires_review: analysis.complexity !== 'simple',
                    auto_confirm_available: analysis.complexity === 'simple'
                },
                // 元数据
                metadata: {
                    analysis_time: new Date().toISOString(),
                    tool_name: 'create_data_record',
                    version: '1.0.0'
                }
            };
            return [2 /*return*/, confirmationData];
        });
    });
}
/**
 * 🔧 执行创建操作 - 真实API调用
 */
function executeCreateOperation(confirmationData) {
    return __awaiter(this, void 0, void 0, function () {
        var operation_details, data_preview, table_name, apiEndpoint, apiDetails, apiMapping, apiUrl, response, errorText, apiResult, createdRecord, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    console.log('🔧 [执行创建] 开始执行创建操作');
                    operation_details = confirmationData.operation_details, data_preview = confirmationData.data_preview, table_name = confirmationData.table_name;
                    apiEndpoint = api_group_mapping_service_1.apiGroupMappingService.getApiEndpointByEntity(table_name);
                    apiDetails = api_group_mapping_service_1.apiGroupMappingService.getApiDetailsByEntity(table_name);
                    if (!apiEndpoint) {
                        throw new Error("\u4E0D\u652F\u6301\u7684\u6570\u636E\u8868: ".concat(table_name));
                    }
                    apiMapping = {
                        endpoint: apiEndpoint,
                        method: 'POST',
                        center: (apiDetails === null || apiDetails === void 0 ? void 0 : apiDetails.group) || '未分组'
                    };
                    apiUrl = "".concat(process.env.API_BASE_URL || 'http://localhost:3000').concat(apiMapping.endpoint);
                    console.log('🌐 [API调用] 调用端点:', apiUrl);
                    console.log('📤 [API调用] 发送数据:', data_preview.processed_data);
                    return [4 /*yield*/, fetch(apiUrl, {
                            method: apiMapping.method,
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(getAuthToken()),
                                'User-Agent': 'AI-Assistant-CRUD-Tool/1.0'
                            },
                            body: JSON.stringify(data_preview.processed_data)
                        })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.text()];
                case 2:
                    errorText = _a.sent();
                    throw new Error("API\u8C03\u7528\u5931\u8D25: ".concat(response.status, " ").concat(response.statusText, " - ").concat(errorText));
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    apiResult = _a.sent();
                    console.log('📥 [API调用] 响应结果:', apiResult);
                    createdRecord = apiResult.data || apiResult;
                    console.log('✅ [执行创建] 创建操作完成');
                    return [2 /*return*/, {
                            name: "create_data_record",
                            status: "success",
                            result: {
                                created_record: createdRecord,
                                operation_summary: {
                                    table_name: confirmationData.table_name,
                                    business_center: apiMapping.center,
                                    api_endpoint: apiMapping.endpoint,
                                    operation: 'create',
                                    affected_records: 1,
                                    execution_time: new Date().toISOString()
                                },
                                api_response: {
                                    status: response.status,
                                    success: apiResult.success !== false,
                                    message: apiResult.message || '创建成功'
                                },
                                message: "\u2705 \u6210\u529F\u521B\u5EFA".concat(confirmationData.table_display_name, "\u8BB0\u5F55")
                            },
                            metadata: {
                                operation: 'create',
                                table_name: confirmationData.table_name,
                                business_center: apiMapping.center,
                                record_id: createdRecord.id,
                                api_endpoint: apiMapping.endpoint,
                                execution_time: Date.now(),
                                api_call_success: true
                            }
                        }];
                case 5:
                    error_3 = _a.sent();
                    console.error('❌ [执行创建] 创建操作失败:', error_3);
                    return [2 /*return*/, {
                            name: "create_data_record",
                            status: "error",
                            result: null,
                            error: "\u521B\u5EFA\u64CD\u4F5C\u5931\u8D25: ".concat(error_3.message),
                            metadata: {
                                operation: 'create',
                                table_name: confirmationData.table_name,
                                execution_time: Date.now(),
                                api_call_success: false,
                                error_details: error_3.message
                            }
                        }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * 获取认证Token
 */
function getAuthToken() {
    // 这里应该从请求上下文或配置中获取token
    // 暂时返回空字符串，实际使用时需要实现
    return process.env.AI_TOOL_AUTH_TOKEN || '';
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
 * 处理创建数据
 */
function processDataForCreation(tableName, data) {
    // 添加通用字段
    var processedData = __assign(__assign({}, data), { created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    // 根据表类型进行特殊处理
    switch (tableName) {
        case 'students':
            if (!processedData.student_no) {
                processedData.student_no = generateStudentNo();
            }
            break;
        case 'teachers':
            if (!processedData.teacher_no) {
                processedData.teacher_no = generateTeacherNo();
            }
            break;
        case 'activities':
            if (!processedData.status) {
                processedData.status = 'draft';
            }
            break;
    }
    return processedData;
}
/**
 * 生成警告信息
 */
function generateWarnings(_tableName, data, analysis) {
    var _a;
    var warnings = [];
    if (analysis.complexity === 'complex') {
        warnings.push('⚠️ 这是一个复杂操作，请仔细检查数据');
    }
    if (((_a = analysis.potential_conflicts) === null || _a === void 0 ? void 0 : _a.length) > 0) {
        warnings.push('⚠️ 检测到潜在冲突，请确认数据正确性');
    }
    // 检查必填字段
    var requiredFields = analysis.required_fields || [];
    var missingFields = requiredFields.filter(function (field) { return !data[field]; });
    if (missingFields.length > 0) {
        warnings.push("\u26A0\uFE0F \u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5: ".concat(missingFields.join(', ')));
    }
    return warnings;
}
/**
 * 🗺️ 获取字段配置 - 基于表名的默认配置
 * 注意：此函数已废弃，现在完全使用 EntityFieldConfigService 来获取字段配置
 * 保留此函数仅用于向后兼容，但不再使用
 *
 * @deprecated 使用 entityFieldConfigService.getRequiredFields() 和 entityFieldConfigService.getAutoFillFields() 代替
 */
function getFieldConfiguration(tableName) {
    // 🚨 此函数已废弃，不再使用
    // 所有字段配置现在都从 EntityFieldConfigService 获取
    console.warn("\u26A0\uFE0F [getFieldConfiguration] \u6B64\u51FD\u6570\u5DF2\u5E9F\u5F03\uFF0C\u8BF7\u4F7F\u7528 EntityFieldConfigService");
    return {
        requiredFields: ['name'],
        optionalFields: ['description', 'status', 'remark']
    };
}
/**
 * 获取默认分析结果
 */
function getDefaultAnalysis(tableName, data) {
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
    // 🚨 使用 EntityFieldConfigService 获取正确的字段配置
    var requiredFields = entity_field_config_service_1.entityFieldConfigService.getRequiredFields(tableName);
    var autoFillFields = entity_field_config_service_1.entityFieldConfigService.getAutoFillFields(tableName);
    var entityConfig = entity_field_config_service_1.entityFieldConfigService.getEntityConfig(tableName);
    // 计算可选字段（所有字段 - 必填字段 - 自动填充字段）
    var allFields = (entityConfig === null || entityConfig === void 0 ? void 0 : entityConfig.fields) || [];
    var requiredFieldNames = requiredFields.map(function (f) { return f.name; });
    var autoFillFieldNames = autoFillFields.map(function (f) { return f.name; });
    var optionalFieldNames = allFields
        .filter(function (f) { return !requiredFieldNames.includes(f.name) && !autoFillFieldNames.includes(f.name); })
        .map(function (f) { return f.name; });
    return {
        success: true,
        api_endpoint: apiEndpoint,
        http_method: 'POST',
        business_center: (apiDetails === null || apiDetails === void 0 ? void 0 : apiDetails.group) || '未分组',
        complexity: 'medium',
        field_validation: {
            missing_required: requiredFieldNames.filter(function (field) { return !data[field]; }),
            invalid_fields: [],
            field_suggestions: []
        },
        required_fields: requiredFieldNames,
        optional_fields: optionalFieldNames,
        validation_rules: ['数据格式验证', '必填字段检查'],
        potential_conflicts: [],
        recommendations: ['请确认数据准确性'],
        estimated_time: '1-2秒'
    };
}
/**
 * 生成学号
 */
function generateStudentNo() {
    var year = new Date().getFullYear();
    var random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return "S".concat(year).concat(random);
}
/**
 * 生成教师编号
 */
function generateTeacherNo() {
    var year = new Date().getFullYear();
    var random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    return "T".concat(year).concat(random);
}
exports["default"] = createDataRecordTool;
