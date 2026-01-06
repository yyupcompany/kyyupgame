"use strict";
/**
 * AI工具调用服务
 * 支持豆包Seed-1.6模型的工具调用功能
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var logger_1 = require("../../utils/logger");
var expert_consultation_service_1 = __importDefault(require("./expert-consultation.service"));
var expert_consultation_interface_1 = require("./interfaces/expert-consultation.interface");
var api_group_mapping_service_1 = require("./api-group-mapping.service");
var create_data_record_tool_1 = __importDefault(require("./tools/database-crud/create-data-record.tool"));
var update_data_record_tool_1 = __importDefault(require("./tools/database-crud/update-data-record.tool"));
var delete_data_record_tool_1 = __importDefault(require("./tools/database-crud/delete-data-record.tool"));
var ToolCallingService = /** @class */ (function () {
    function ToolCallingService() {
        // 使用导入的单例服务
    }
    /**
     * 获取可用的工具列表（使用统一工具注册中心）
     */
    ToolCallingService.prototype.getAvailableTools = function () {
        // 🚀 使用统一工具注册中心
        var _a = require('./tools/core/tool-registry.service'), toolRegistry = _a.toolRegistry, ToolScenario = _a.ToolScenario;
        var tools = toolRegistry.getToolsForScenario(ToolScenario.TOOL_CALLING);
        console.log("\u2705 [ToolCallingService] \u4ECE\u5DE5\u5177\u6CE8\u518C\u4E2D\u5FC3\u83B7\u53D6 ".concat(tools.length, " \u4E2A\u5DE5\u5177"));
        // 转换为ToolFunction格式
        return tools.map(function (tool) { return ({
            name: tool["function"].name,
            description: tool["function"].description,
            parameters: tool["function"].parameters
        }); });
        // 🔴 旧的硬编码工具定义已废弃，保留注释供参考
        /*
        return [
          {
            name: "render_component",
            description: "渲染UI组件，用于数据展示、图表显示、待办事项等",
            parameters: {
              type: "object",
              properties: {
                component_type: {
                  type: "string",
                  description: "组件类型",
                  enum: ["data-table", "chart", "todo-list", "stat-card"]
                },
                title: {
                  type: "string",
                  description: "组件标题"
                },
                data: {
                  type: "object",
                  description: "组件数据内容"
                },
                chart_type: {
                  type: "string",
                  description: "图表类型（当component_type为chart时使用）",
                  enum: ["bar", "line", "pie", "area"]
                }
              },
              required: ["component_type", "title"]
            }
          },
          {
            name: "query_data",
            description: "查询系统数据，如学生信息、招生统计、活动数据等",
            parameters: {
              type: "object",
              properties: {
                data_type: {
                  type: "string",
                  description: "数据类型",
                  enum: ["students", "enrollment", "activities", "teachers", "classes"]
                },
                filters: {
                  type: "object",
                  description: "查询过滤条件"
                },
                time_range: {
                  type: "string",
                  description: "时间范围",
                  enum: ["today", "week", "month", "year", "all"]
                }
              },
              required: ["data_type"]
            }
          },
          {
            name: "create_task_list",
            description: "创建任务清单或待办事项",
            parameters: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "任务清单标题"
                },
                tasks: {
                  type: "array",
                  description: "任务列表"
                },
                category: {
                  type: "string",
                  description: "任务分类",
                  enum: ["enrollment", "teaching", "management", "activity"]
                }
              },
              required: ["title", "tasks"]
            }
          },
          // 🎯 专家咨询工具 - 招生策划专家
          {
            name: "consult_recruitment_planner",
            description: "咨询招生策划专家，获取招生趋势分析、营销策略和专业指导意见",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "咨询问题，如招生趋势分析、营销策略等"
                },
                context: {
                  type: "string",
                  description: "相关背景信息，如数据库查询结果、当前招生情况等"
                }
              },
              required: ["query"]
            }
          },
          // 🧠 通用专家调用工具
          {
            name: "call_expert",
            description: "调用特定专家进行专业分析和建议，支持多个专业领域",
            parameters: {
              type: "object",
              properties: {
                expert_id: {
                  type: "string",
                  description: "专家ID，支持专家咨询系统和通用工具专家",
                  enum: [
                    // 🎯 专家咨询系统中的专家类型
                    "investor", "director", "planner", "teacher", "parent", "psychologist",
                    // 🔧 通用工具专家类型
                    "activity_planner", "marketing_expert", "education_expert", "cost_analyst", "risk_assessor", "creative_designer", "curriculum_expert"
                  ]
                },
                task: {
                  type: "string",
                  description: "具体任务描述，详细说明需要专家分析的问题"
                },
                context: {
                  type: "string",
                  description: "相关上下文信息，包括用户需求、已有信息、数据等"
                }
              },
              required: ["expert_id", "task"]
            }
          },
          // 📋 获取专家列表工具
          {
            name: "get_expert_list",
            description: "获取可用的专家列表及其能力描述，用于了解有哪些专家可以协助解决问题",
            parameters: {
              type: "object",
              properties: {
                domain: {
                  type: "string",
                  description: "专家领域筛选（可选）",
                  enum: ["activity", "marketing", "education", "analysis", "all"]
                }
              },
              required: []
            }
          }
        ];
        */
    };
    /**
     * 执行工具调用
     */
    ToolCallingService.prototype.executeTool = function (functionCall) {
        return __awaiter(this, void 0, void 0, function () {
            var name, argsStr, args, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        name = functionCall.name, argsStr = functionCall.arguments;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 22, , 23]);
                        args = JSON.parse(argsStr);
                        logger_1.logger.info('执行工具调用', { toolName: name, arguments: args });
                        _a = name;
                        switch (_a) {
                            case 'render_component': return [3 /*break*/, 2];
                            case 'query_data': return [3 /*break*/, 4];
                            case 'create_task_list': return [3 /*break*/, 6];
                            case 'consult_recruitment_planner': return [3 /*break*/, 8];
                            case 'call_expert': return [3 /*break*/, 10];
                            case 'get_expert_list': return [3 /*break*/, 12];
                            case 'create_data_record': return [3 /*break*/, 14];
                            case 'update_data_record': return [3 /*break*/, 16];
                            case 'delete_data_record': return [3 /*break*/, 18];
                        }
                        return [3 /*break*/, 20];
                    case 2: return [4 /*yield*/, this.renderComponent(args)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4: return [4 /*yield*/, this.queryData(args)];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6: return [4 /*yield*/, this.createTaskList(args)];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [4 /*yield*/, this.consultRecruitmentPlanner(args)];
                    case 9: return [2 /*return*/, _b.sent()];
                    case 10: return [4 /*yield*/, this.callExpert(args)];
                    case 11: return [2 /*return*/, _b.sent()];
                    case 12: return [4 /*yield*/, this.getExpertList(args)];
                    case 13: return [2 /*return*/, _b.sent()];
                    case 14: return [4 /*yield*/, this.createDataRecord(args)];
                    case 15: return [2 /*return*/, _b.sent()];
                    case 16: return [4 /*yield*/, this.updateDataRecord(args)];
                    case 17: return [2 /*return*/, _b.sent()];
                    case 18: return [4 /*yield*/, this.deleteDataRecord(args)];
                    case 19: return [2 /*return*/, _b.sent()];
                    case 20: return [2 /*return*/, {
                            name: name,
                            status: "error",
                            result: null,
                            error: "\u672A\u77E5\u5DE5\u5177: ".concat(name)
                        }];
                    case 21: return [3 /*break*/, 23];
                    case 22:
                        error_1 = _b.sent();
                        logger_1.logger.error('工具调用执行失败', { toolName: name, error: error_1.message });
                        return [2 /*return*/, {
                                name: name,
                                status: "error",
                                result: null,
                                error: error_1.message
                            }];
                    case 23: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 渲染组件工具
     */
    ToolCallingService.prototype.renderComponent = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var component_type, title, data, chart_type, componentData;
            return __generator(this, function (_a) {
                component_type = args.component_type, title = args.title, data = args.data, chart_type = args.chart_type;
                componentData = {
                    type: component_type,
                    title: title || '数据展示'
                };
                switch (component_type) {
                    case 'chart':
                        componentData = __assign(__assign({}, componentData), { chartType: chart_type || 'bar', data: data || this.generateMockChartData(), height: 400, showToolbar: true, showLegend: true });
                        break;
                    case 'data-table':
                        componentData = __assign(__assign({}, componentData), { columns: (data === null || data === void 0 ? void 0 : data.columns) || this.generateMockTableColumns(), data: (data === null || data === void 0 ? void 0 : data.rows) || this.generateMockTableData(), searchable: true, pagination: true, exportable: true });
                        break;
                    case 'todo-list':
                        componentData = __assign(__assign({}, componentData), { data: (data === null || data === void 0 ? void 0 : data.tasks) || this.generateMockTodoData(), editable: true, showProgress: true });
                        break;
                    case 'stat-card':
                        componentData = __assign(__assign({}, componentData), { value: (data === null || data === void 0 ? void 0 : data.value) || '0', unit: (data === null || data === void 0 ? void 0 : data.unit) || '', trend: (data === null || data === void 0 ? void 0 : data.trend) || 'up', trendValue: (data === null || data === void 0 ? void 0 : data.trendValue) || '0%' });
                        break;
                }
                return [2 /*return*/, {
                        name: 'render_component',
                        status: 'success',
                        result: componentData
                    }];
            });
        });
    };
    /**
     * 🛡️ 查询数据工具 - 基于API分组模式 (v3.0)
     */
    ToolCallingService.prototype.queryData = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var data_type, filters, time_range, query_description, queryDescription, identifiedGroups, primaryGroup, groupDetails, mockData;
            return __generator(this, function (_a) {
                data_type = args.data_type, filters = args.filters, time_range = args.time_range, query_description = args.query_description;
                try {
                    queryDescription = query_description || this.buildQueryDescription(data_type, filters, time_range);
                    console.log('🔍 [查询数据] 开始API分组识别:', queryDescription);
                    identifiedGroups = api_group_mapping_service_1.apiGroupMappingService.identifyApiGroups(queryDescription);
                    console.log('📊 [查询数据] API分组识别结果:', identifiedGroups);
                    // ⚡ 如果识别到多个分组，返回多步骤计划
                    if (identifiedGroups.length > 1) {
                        return [2 /*return*/, {
                                name: 'query_data',
                                status: 'success',
                                result: {
                                    type: 'multi_step_api_query',
                                    message: '🧠 识别到多个API分组，已规划多步骤查询',
                                    groups: identifiedGroups,
                                    steps: identifiedGroups.map(function (group, index) { return ({
                                        step: index + 1,
                                        group: group,
                                        description: "\u8C03\u7528".concat(group, "\u76F8\u5173API\u83B7\u53D6\u6570\u636E"),
                                        apis: api_group_mapping_service_1.apiGroupMappingService.getGroupApiDetails(group).apis.slice(0, 2)
                                    }); }),
                                    ui_instruction: {
                                        type: 'show_multi_step_plan',
                                        title: 'API调用执行计划',
                                        data: {
                                            originalQuery: queryDescription,
                                            groups: identifiedGroups,
                                            totalSteps: identifiedGroups.length
                                        }
                                    },
                                    next_action: 'execute_api_calls'
                                }
                            }];
                    }
                    // ✅ 单分组查询，直接执行
                    console.log('✅ [查询数据] 单分组查询，直接执行:', identifiedGroups[0]);
                    primaryGroup = identifiedGroups[0];
                    groupDetails = api_group_mapping_service_1.apiGroupMappingService.getGroupApiDetails(primaryGroup);
                    mockData = {};
                    switch (data_type) {
                        case 'students':
                            mockData = this.generateMockStudentData();
                            break;
                        case 'enrollment':
                            mockData = this.generateMockEnrollmentData();
                            break;
                        case 'activities':
                            mockData = this.generateMockActivityData();
                            break;
                        default:
                            mockData = { message: '暂无数据' };
                    }
                    return [2 /*return*/, {
                            name: 'query_data',
                            status: 'success',
                            result: {
                                type: 'single_api_group_result',
                                group: primaryGroup,
                                data: mockData,
                                api_info: {
                                    group: primaryGroup,
                                    availableApis: groupDetails.apis.length,
                                    executionMode: 'direct_api_call'
                                }
                            }
                        }];
                }
                catch (error) {
                    console.error('❌ [查询数据] 查询失败:', error);
                    return [2 /*return*/, {
                            name: 'query_data',
                            status: 'error',
                            result: null,
                            error: "\u67E5\u8BE2\u5931\u8D25: ".concat(error.message)
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 🔧 构建查询描述
     */
    ToolCallingService.prototype.buildQueryDescription = function (dataType, filters, timeRange) {
        var description = "\u67E5\u8BE2".concat(dataType, "\u6570\u636E");
        if (filters && Object.keys(filters).length > 0) {
            var filterDesc = Object.entries(filters)
                .map(function (_a) {
                var key = _a[0], value = _a[1];
                return "".concat(key, "=").concat(value);
            })
                .join('，');
            description += "\uFF0C\u7B5B\u9009\u6761\u4EF6\uFF1A".concat(filterDesc);
        }
        if (timeRange) {
            description += "\uFF0C\u65F6\u95F4\u8303\u56F4\uFF1A".concat(timeRange.start || '开始', " \u5230 ").concat(timeRange.end || '结束');
        }
        return description;
    };
    /**
     * 创建任务清单工具
     */
    ToolCallingService.prototype.createTaskList = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var title, tasks, category, taskListData;
            return __generator(this, function (_a) {
                title = args.title, tasks = args.tasks, category = args.category;
                taskListData = {
                    title: title,
                    category: category || 'general',
                    data: tasks.map(function (task, index) { return ({
                        id: index + 1,
                        text: typeof task === 'string' ? task : task.text,
                        completed: false,
                        priority: task.priority || 'medium',
                        dueDate: task.dueDate || null
                    }); })
                };
                return [2 /*return*/, {
                        name: 'create_task_list',
                        status: 'success',
                        result: taskListData
                    }];
            });
        });
    };
    // 生成模拟数据的辅助方法
    ToolCallingService.prototype.generateMockChartData = function () {
        return {
            xAxis: ['1月', '2月', '3月', '4月', '5月'],
            series: [{
                    name: '招生人数',
                    data: [12, 19, 15, 25, 22]
                }]
        };
    };
    ToolCallingService.prototype.generateMockTableColumns = function () {
        return [
            { key: 'name', title: '姓名', sortable: true },
            { key: 'age', title: '年龄', sortable: true },
            { key: 'class', title: '班级' },
            { key: 'status', title: '状态' }
        ];
    };
    ToolCallingService.prototype.generateMockTableData = function () {
        return [
            { name: '张小明', age: 5, "class": '大班A', status: '在读' },
            { name: '李小红', age: 4, "class": '中班B', status: '在读' },
            { name: '王小华', age: 6, "class": '大班C', status: '毕业' }
        ];
    };
    ToolCallingService.prototype.generateMockTodoData = function () {
        return [
            { text: '准备招生宣传材料', completed: false, priority: 'high' },
            { text: '安排家长会', completed: true, priority: 'medium' },
            { text: '更新学生档案', completed: false, priority: 'low' }
        ];
    };
    ToolCallingService.prototype.generateMockStudentData = function () {
        return {
            total: 156,
            byAge: { '3岁': 45, '4岁': 52, '5岁': 59 },
            byClass: { '小班': 45, '中班': 52, '大班': 59 }
        };
    };
    ToolCallingService.prototype.generateMockEnrollmentData = function () {
        return {
            thisMonth: 25,
            lastMonth: 18,
            growth: '+38.9%',
            bySource: { '线上报名': 15, '推荐入学': 8, '现场咨询': 2 }
        };
    };
    ToolCallingService.prototype.generateMockActivityData = function () {
        return {
            upcoming: 3,
            thisWeek: 2,
            participants: 89,
            activities: [
                { name: '春游活动', date: '2025-03-15', participants: 45 },
                { name: '家长开放日', date: '2025-03-20', participants: 32 }
            ]
        };
    };
    // 🎯 专家咨询工具实现方法
    /**
     * 咨询招生策划专家
     */
    ToolCallingService.prototype.consultRecruitmentPlanner = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, context, consultationQuery, session, expertSpeech, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = args.query, _a = args.context, context = _a === void 0 ? '' : _a;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        logger_1.logger.info('🎯 [招生专家] 开始咨询招生策划专家', { query: query, context: context });
                        consultationQuery = context
                            ? "".concat(query, "\n\n\u80CC\u666F\u4FE1\u606F\uFF1A").concat(context)
                            : query;
                        return [4 /*yield*/, expert_consultation_service_1["default"].startConsultation({
                                userId: 1,
                                query: consultationQuery,
                                preferences: {
                                    expertOrder: [expert_consultation_interface_1.ExpertType.PLANNER],
                                    urgency: 'high'
                                }
                            })];
                    case 2:
                        session = _b.sent();
                        return [4 /*yield*/, expert_consultation_service_1["default"].getNextExpertSpeech(session.sessionId)];
                    case 3:
                        expertSpeech = _b.sent();
                        logger_1.logger.info('✅ [招生专家] 专家咨询完成', {
                            expertType: expertSpeech.expertType,
                            expertName: expertSpeech.expertName
                        });
                        return [2 /*return*/, {
                                name: 'consult_recruitment_planner',
                                status: 'success',
                                result: {
                                    expertType: expertSpeech.expertType,
                                    expertName: expertSpeech.expertName,
                                    analysis: expertSpeech.content,
                                    recommendations: expertSpeech.recommendations,
                                    keyPoints: expertSpeech.keyPoints
                                }
                            }];
                    case 4:
                        error_2 = _b.sent();
                        logger_1.logger.error('❌ [招生专家] 咨询失败', { error: error_2.message });
                        return [2 /*return*/, {
                                name: 'consult_recruitment_planner',
                                status: 'error',
                                result: null,
                                error: "\u62DB\u751F\u4E13\u5BB6\u54A8\u8BE2\u5931\u8D25: ".concat(error_2.message)
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 调用专家（支持专家咨询系统和通用工具专家）
     */
    ToolCallingService.prototype.callExpert = function (args) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var expert_id, task, _c, context, consultationExperts, consultationQuery, expertType, session, expertSpeech, aiBridgeService, AIModelConfig, modelConfig, response, expertResponse, error_3;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        expert_id = args.expert_id, task = args.task, _c = args.context, context = _c === void 0 ? '' : _c;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 10, , 11]);
                        logger_1.logger.info('🧠 [专家调用] 开始调用专家', { expert_id: expert_id, task: task });
                        consultationExperts = ['investor', 'director', 'planner', 'teacher', 'parent', 'psychologist'];
                        if (!consultationExperts.includes(expert_id)) return [3 /*break*/, 4];
                        consultationQuery = "".concat(task).concat(context ? "\n\n\u4E0A\u4E0B\u6587\u4FE1\u606F\uFF1A".concat(context) : '');
                        expertType = expert_id;
                        return [4 /*yield*/, expert_consultation_service_1["default"].startConsultation({
                                userId: 1,
                                query: consultationQuery,
                                preferences: {
                                    expertOrder: [expertType],
                                    urgency: 'high'
                                }
                            })];
                    case 2:
                        session = _d.sent();
                        return [4 /*yield*/, expert_consultation_service_1["default"].getNextExpertSpeech(session.sessionId)];
                    case 3:
                        expertSpeech = _d.sent();
                        logger_1.logger.info('✅ [专家咨询] 专家调用完成', {
                            expertType: expertSpeech.expertType,
                            expertName: expertSpeech.expertName
                        });
                        return [2 /*return*/, {
                                name: 'call_expert',
                                status: 'success',
                                result: {
                                    expertId: expert_id,
                                    expertName: expertSpeech.expertName,
                                    analysis: expertSpeech.content,
                                    recommendations: expertSpeech.recommendations,
                                    keyPoints: expertSpeech.keyPoints
                                }
                            }];
                    case 4: return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./bridge/ai-bridge.service')); })];
                    case 5:
                        aiBridgeService = (_d.sent()).aiBridgeService;
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-model-config.model')); })];
                    case 6:
                        AIModelConfig = (_d.sent()).AIModelConfig;
                        return [4 /*yield*/, AIModelConfig.findOne({
                                where: { status: 'active', isDefault: true }
                            })];
                    case 7:
                        modelConfig = _d.sent();
                        if (!modelConfig) {
                            throw new Error('未找到可用的AI模型配置');
                        }
                        return [4 /*yield*/, aiBridgeService.generateChatCompletion({
                                model: modelConfig.name,
                                messages: [
                                    {
                                        role: 'system',
                                        content: "\u4F60\u662F".concat(this.getExpertNameById(expert_id), "\uFF0C\u8BF7\u6839\u636E\u4EFB\u52A1\u8981\u6C42\u63D0\u4F9B\u4E13\u4E1A\u5EFA\u8BAE\u3002")
                                    },
                                    {
                                        role: 'user',
                                        content: "\u4EFB\u52A1\uFF1A".concat(task, "\n\u4E0A\u4E0B\u6587\uFF1A").concat(JSON.stringify(context))
                                    }
                                ],
                                temperature: 0.7,
                                max_tokens: 1500
                            }, {
                                endpointUrl: modelConfig.endpointUrl,
                                apiKey: modelConfig.apiKey
                            })];
                    case 8:
                        response = _d.sent();
                        expertResponse = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '专家暂时无法提供建议';
                        logger_1.logger.info('✅ [通用专家] 专家调用完成', { expert_id: expert_id });
                        return [2 /*return*/, {
                                name: 'call_expert',
                                status: 'success',
                                result: {
                                    expertId: expert_id,
                                    expertName: this.getExpertNameById(expert_id),
                                    analysis: expertResponse,
                                    recommendations: this.extractRecommendations(expertResponse),
                                    keyPoints: this.extractKeyPoints(expertResponse)
                                }
                            }];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_3 = _d.sent();
                        logger_1.logger.error('❌ [专家调用] 调用失败', { expert_id: expert_id, error: error_3.message });
                        return [2 /*return*/, {
                                name: 'call_expert',
                                status: 'error',
                                result: null,
                                error: "\u4E13\u5BB6\u8C03\u7528\u5931\u8D25: ".concat(error_3.message)
                            }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取专家列表
     */
    ToolCallingService.prototype.getExpertList = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, domain, allExperts, filteredExperts;
            return __generator(this, function (_b) {
                _a = args.domain, domain = _a === void 0 ? 'all' : _a;
                try {
                    logger_1.logger.info('📋 [专家列表] 获取专家列表', { domain: domain });
                    allExperts = [
                        {
                            id: 'activity_planner',
                            name: '活动策划专家',
                            domain: 'activity',
                            expertise: ['活动策划', '流程设计', '资源协调'],
                            description: '专业的活动策划和执行专家，擅长各类教育活动的设计与实施'
                        },
                        {
                            id: 'marketing_expert',
                            name: '营销推广专家',
                            domain: 'marketing',
                            expertise: ['品牌营销', '招生策略', '市场分析'],
                            description: '资深营销专家，专注于教育行业的品牌建设和招生推广'
                        },
                        {
                            id: 'education_expert',
                            name: '教育评估专家',
                            domain: 'education',
                            expertise: ['课程设计', '教学评估', '儿童发展'],
                            description: '教育领域专家，专业评估教学质量和儿童发展情况'
                        },
                        {
                            id: 'cost_analyst',
                            name: '成本分析专家',
                            domain: 'analysis',
                            expertise: ['成本控制', '预算规划', '财务分析'],
                            description: '财务分析专家，提供成本控制和预算规划建议'
                        },
                        {
                            id: 'risk_assessor',
                            name: '风险评估专家',
                            domain: 'analysis',
                            expertise: ['风险识别', '安全评估', '应急预案'],
                            description: '风险管理专家，识别潜在风险并提供防范措施'
                        },
                        {
                            id: 'creative_designer',
                            name: '创意设计专家',
                            domain: 'activity',
                            expertise: ['创意设计', '视觉呈现', '用户体验'],
                            description: '创意设计专家，提供视觉设计和用户体验优化建议'
                        },
                        {
                            id: 'curriculum_expert',
                            name: '课程教学专家',
                            domain: 'education',
                            expertise: ['课程开发', '教学方法', '学习评估'],
                            description: '课程教学专家，专注于课程开发和教学方法优化'
                        }
                    ];
                    filteredExperts = domain === 'all'
                        ? allExperts
                        : allExperts.filter(function (expert) { return expert.domain === domain; });
                    logger_1.logger.info('✅ [专家列表] 专家列表获取完成', {
                        domain: domain,
                        totalExperts: filteredExperts.length
                    });
                    return [2 /*return*/, {
                            name: 'get_expert_list',
                            status: 'success',
                            result: {
                                domain: domain,
                                experts: filteredExperts,
                                totalCount: filteredExperts.length
                            }
                        }];
                }
                catch (error) {
                    logger_1.logger.error('❌ [专家列表] 获取失败', { error: error.message });
                    return [2 /*return*/, {
                            name: 'get_expert_list',
                            status: 'error',
                            result: null,
                            error: "\u83B7\u53D6\u4E13\u5BB6\u5217\u8868\u5931\u8D25: ".concat(error.message)
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    // 🔧 专家工具辅助方法
    /**
     * 根据专家ID获取专家名称
     */
    ToolCallingService.prototype.getExpertNameById = function (expertId) {
        var expertNames = {
            // 🎯 专家咨询系统中的专家类型
            'investor': '投资分析专家',
            'director': '园长管理专家',
            'planner': '招生策划专家',
            'teacher': '执行教师专家',
            'parent': '家长体验专家',
            'psychologist': '心理学专家',
            // 🔧 通用工具专家类型
            'activity_planner': '活动策划专家',
            'marketing_expert': '营销推广专家',
            'education_expert': '教育评估专家',
            'cost_analyst': '成本分析专家',
            'risk_assessor': '风险评估专家',
            'creative_designer': '创意设计专家',
            'curriculum_expert': '课程教学专家'
        };
        return expertNames[expertId] || '专家';
    };
    /**
     * 从专家回复中提取关键点
     */
    ToolCallingService.prototype.extractKeyPoints = function (content) {
        var keyPoints = [];
        // 简单的关键点提取逻辑
        var lines = content.split('\n');
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var trimmed = line.trim();
            if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
                keyPoints.push(trimmed.substring(1).trim());
            }
            else if (trimmed.match(/^\d+\./)) {
                keyPoints.push(trimmed.replace(/^\d+\./, '').trim());
            }
        }
        return keyPoints.slice(0, 5); // 最多返回5个关键点
    };
    /**
     * 从专家回复中提取建议
     */
    ToolCallingService.prototype.extractRecommendations = function (content) {
        var recommendations = [];
        // 查找包含"建议"、"推荐"、"应该"等关键词的句子
        var sentences = content.split(/[。！？.!?]/);
        for (var _i = 0, sentences_1 = sentences; _i < sentences_1.length; _i++) {
            var sentence = sentences_1[_i];
            var trimmed = sentence.trim();
            if (trimmed.includes('建议') || trimmed.includes('推荐') ||
                trimmed.includes('应该') || trimmed.includes('可以考虑')) {
                recommendations.push(trimmed);
            }
        }
        return recommendations.slice(0, 3); // 最多返回3个建议
    };
    /**
     * 🚀 创建数据记录工具
     */
    ToolCallingService.prototype.createDataRecord = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('🚀 [CRUD工具] 执行创建数据记录:', args);
                        return [4 /*yield*/, create_data_record_tool_1["default"].implementation(args)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        console.error('❌ [CRUD工具] 创建数据记录失败:', error_4);
                        return [2 /*return*/, {
                                name: 'create_data_record',
                                status: 'error',
                                result: null,
                                error: "\u521B\u5EFA\u6570\u636E\u8BB0\u5F55\u5931\u8D25: ".concat(error_4.message)
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ✏️ 更新数据记录工具
     */
    ToolCallingService.prototype.updateDataRecord = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('✏️ [CRUD工具] 执行更新数据记录:', args);
                        return [4 /*yield*/, update_data_record_tool_1["default"].implementation(args)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_5 = _a.sent();
                        console.error('❌ [CRUD工具] 更新数据记录失败:', error_5);
                        return [2 /*return*/, {
                                name: 'update_data_record',
                                status: 'error',
                                result: null,
                                error: "\u66F4\u65B0\u6570\u636E\u8BB0\u5F55\u5931\u8D25: ".concat(error_5.message)
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🗑️ 删除数据记录工具
     */
    ToolCallingService.prototype.deleteDataRecord = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('🗑️ [CRUD工具] 执行删除数据记录:', args);
                        return [4 /*yield*/, delete_data_record_tool_1["default"].implementation(args)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_6 = _a.sent();
                        console.error('❌ [CRUD工具] 删除数据记录失败:', error_6);
                        return [2 /*return*/, {
                                name: 'delete_data_record',
                                status: 'error',
                                result: null,
                                error: "\u5220\u9664\u6570\u636E\u8BB0\u5F55\u5931\u8D25: ".concat(error_6.message)
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ToolCallingService;
}());
exports["default"] = new ToolCallingService();
