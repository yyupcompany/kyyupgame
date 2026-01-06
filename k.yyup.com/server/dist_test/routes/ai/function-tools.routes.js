"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
// FunctionToolsService removed - replaced by six-dimensional memory system
var auth_middleware_1 = require("../../middlewares/auth.middleware");
var express_validator_1 = require("express-validator");
var axios_1 = __importDefault(require("axios"));
var router = (0, express_1.Router)();
// 验证中间件
var validateFunctionCall = [
    (0, express_validator_1.body)('function_calls').isArray().withMessage('function_calls必须是数组'),
    (0, express_validator_1.body)('function_calls.*.name').isString().notEmpty().withMessage('函数名称不能为空'),
    (0, express_validator_1.body)('function_calls.*.arguments').isObject().withMessage('函数参数必须是对象'),
    (0, express_validator_1.body)('conversation_id').optional().isInt().withMessage('conversation_id必须是整数'),
    (0, express_validator_1.body)('user_id').optional().isInt().withMessage('user_id必须是整数')
];
// 执行Function Calls
router.post('/execute', auth_middleware_1.authMiddleware, validateFunctionCall, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var errors, _a, function_calls, conversation_id, user_id, userId, results;
    return __generator(this, function (_b) {
        try {
            errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        errors: errors.array()
                    })];
            }
            _a = req.body, function_calls = _a.function_calls, conversation_id = _a.conversation_id, user_id = _a.user_id;
            userId = user_id || req.user.id;
            results = { status: 'error', error: 'FunctionToolsService已被六维记忆系统替代' };
            res.json({
                success: true,
                data: results,
                metadata: {
                    executed_at: new Date().toISOString(),
                    function_count: function_calls.length
                }
            });
        }
        catch (error) {
            console.error('执行Function Calls失败:', error);
            res.status(500).json({
                success: false,
                error: error.message || '执行失败'
            });
        }
        return [2 /*return*/];
    });
}); });
// 获取可用工具列表
router.get('/available-tools', auth_middleware_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userRole_1, tools, filteredTools;
    return __generator(this, function (_a) {
        try {
            userRole_1 = req.user.role;
            tools = {
                database_query: [
                    {
                        name: 'any_query',
                        description: '智能自然语言查询 - 支持所有数据查询',
                        category: 'database'
                    }
                ],
                database_crud: [
                    {
                        name: 'create_data_record',
                        description: '创建数据记录',
                        category: 'database'
                    },
                    {
                        name: 'update_data_record',
                        description: '更新数据记录',
                        category: 'database'
                    },
                    {
                        name: 'delete_data_record',
                        description: '删除数据记录',
                        category: 'database'
                    },
                    {
                        name: 'batch_import_data',
                        description: '批量导入数据',
                        category: 'database'
                    }
                ],
                page_operation: [
                    {
                        name: 'navigate_to_page',
                        description: '导航到指定页面',
                        category: 'page_operation'
                    },
                    {
                        name: 'capture_screen',
                        description: '截取页面截图',
                        category: 'page_operation'
                    },
                    {
                        name: 'fill_form',
                        description: '自动填写表单',
                        category: 'page_operation'
                    },
                    {
                        name: 'submit_form',
                        description: '提交表单',
                        category: 'page_operation'
                    },
                    {
                        name: 'click_element',
                        description: '点击页面元素',
                        category: 'page_operation'
                    },
                    {
                        name: 'type_text',
                        description: '在输入框中输入文本',
                        category: 'page_operation'
                    },
                    {
                        name: 'navigate_back',
                        description: '返回到上一个页面',
                        category: 'page_operation'
                    },
                    {
                        name: 'select_option',
                        description: '在下拉框中选择选项',
                        category: 'page_operation'
                    },
                    {
                        name: 'wait_for_condition',
                        description: '等待指定条件满足',
                        category: 'page_operation'
                    },
                    {
                        name: 'console_monitor',
                        description: '监控浏览器控制台消息',
                        category: 'page_operation'
                    },
                    {
                        name: 'execute_workflow',
                        description: '执行复杂工作流程',
                        category: 'page_operation'
                    }
                ],
                business_operation: [
                    {
                        name: 'generate_poster',
                        description: '生成活动海报',
                        category: 'business',
                        requiredRole: ['admin', 'principal', 'teacher']
                    }
                ],
                activity_workflow: [
                    {
                        name: 'generate_complete_activity_plan',
                        description: '🎯 智能生成完整活动方案（含海报设计和营销策略）',
                        category: 'workflow',
                        requiredRole: ['admin', 'principal', 'teacher'],
                        features: ['AI智能分析', 'Markdown编辑', '一键生成']
                    },
                    {
                        name: 'execute_activity_workflow',
                        description: '🚀 执行完整活动创建工作流（自动化全流程）',
                        category: 'workflow',
                        requiredRole: ['admin', 'principal', 'teacher'],
                        features: ['自动创建活动', '生成海报', '配置营销', '手机海报']
                    }
                ],
                data_import_workflow: [
                    {
                        name: 'import_teacher_data',
                        description: '👨‍🏫 智能导入老师数据（支持Excel、CSV、PDF、Word）',
                        category: 'data-import',
                        requiredRole: ['admin', 'principal'],
                        features: ['智能字段映射', '数据验证', '批量导入', '错误处理']
                    },
                    {
                        name: 'import_parent_data',
                        description: '👨‍👩‍👧‍👦 智能导入家长数据（支持多种格式）',
                        category: 'data-import',
                        requiredRole: ['admin', 'principal', 'teacher'],
                        features: ['自动解析', '字段匹配', '数据清洗', '安全导入']
                    }
                ]
            };
            filteredTools = {
                database_query: tools.database_query,
                page_operation: tools.page_operation,
                business_operation: tools.business_operation.filter(function (tool) {
                    if (!tool.requiredRole)
                        return true;
                    return tool.requiredRole.includes(userRole_1);
                }),
                activity_workflow: tools.activity_workflow.filter(function (tool) {
                    if (!tool.requiredRole)
                        return true;
                    return tool.requiredRole.includes(userRole_1);
                })
            };
            res.json({
                success: true,
                data: filteredTools,
                metadata: {
                    user_role: userRole_1,
                    total_tools: Object.values(filteredTools).flat().length
                }
            });
        }
        catch (error) {
            console.error('获取工具列表失败:', error);
            res.status(500).json({
                success: false,
                error: error.message || '获取失败'
            });
        }
        return [2 /*return*/];
    });
}); });
// 执行单个工具函数（用于测试）
router.post('/execute-single', auth_middleware_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, function_name, args, result;
    return __generator(this, function (_b) {
        try {
            _a = req.body, function_name = _a.function_name, args = _a.arguments;
            if (!function_name || !args) {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        error: '缺少必要参数'
                    })];
            }
            result = { status: 'error', error: 'FunctionToolsService已被六维记忆系统替代' };
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('执行单个工具失败:', error);
            res.status(500).json({
                success: false,
                error: error.message || '执行失败'
            });
        }
        return [2 /*return*/];
    });
}); });
// 查询历史活动（直接API端点）
router.post('/query/past-activities', auth_middleware_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        try {
            result = { status: 'error', error: 'FunctionToolsService已被六维记忆系统替代' };
            res.json(result);
        }
        catch (error) {
            console.error('查询历史活动失败:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
        return [2 /*return*/];
    });
}); });
// 获取活动统计（直接API端点）
router.post('/query/activity-statistics', auth_middleware_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        try {
            result = { status: 'error', error: 'FunctionToolsService已被六维记忆系统替代' };
            res.json(result);
        }
        catch (error) {
            console.error('获取活动统计失败:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
        return [2 /*return*/];
    });
}); });
// 查询招生历史（直接API端点）
router.post('/query/enrollment-history', auth_middleware_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        try {
            result = { status: 'error', error: 'FunctionToolsService已被六维记忆系统替代' };
            res.json(result);
        }
        catch (error) {
            console.error('查询招生历史失败:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
        return [2 /*return*/];
    });
}); });
// 分析业务趋势（直接API端点）
router.post('/query/business-trends', auth_middleware_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        try {
            result = { status: 'error', error: 'FunctionToolsService已被六维记忆系统替代' };
            res.json(result);
        }
        catch (error) {
            console.error('分析业务趋势失败:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
        return [2 /*return*/];
    });
}); });
// Function-tools工具定义 - 简化版本，只保留核心CRUD和查询工具
var FUNCTION_TOOLS = [
    {
        type: 'function',
        "function": {
            name: 'any_query',
            description: '智能自然语言查询 - 支持所有数据查询需求。系统会根据用户角色提供相关数据表结构，让AI生成精确的SQL查询',
            parameters: {
                type: 'object',
                properties: {
                    userQuery: {
                        type: 'string',
                        description: '用户的原始查询需求'
                    },
                    queryType: {
                        type: 'string',
                        description: '查询类型：statistical（统计分析）、detailed（详细数据）、comparison（对比分析）、trend（趋势分析）',
                        "default": 'detailed'
                    },
                    expectedFormat: {
                        type: 'string',
                        description: '期望的返回格式：table（表格）、chart（图表）、summary（摘要）、mixed（混合）',
                        "default": 'mixed'
                    }
                },
                required: ['userQuery']
            }
        }
    },
    // 注意：navigate_to_page 已移除
    {
        type: 'function',
        "function": {
            name: 'capture_screen',
            description: '截取页面截图查看当前状态',
            parameters: {
                type: 'object',
                properties: {
                    element: {
                        type: 'string',
                        description: '要截取的元素选择器，留空表示整个页面'
                    }
                }
            }
        }
    }
];
// Function-tools工具执行函数
function executeFunctionTool(toolName, args) {
    return __awaiter(this, void 0, void 0, function () {
        var ToolLoaderService, loader, toolDefs, toolDef, result, result, loadError_1, errorMessage, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\uD83D\uDD27 \u5F00\u59CB\u6267\u884CFunction\u5DE5\u5177: ".concat(toolName, "\uFF0C\u53C2\u6570:"), args);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    // 尝试使用新的工具加载器系统
                    console.log("\uD83D\uDD04 [FunctionTools] \u5C1D\u8BD5\u4F7F\u7528\u65B0\u5DE5\u5177\u7CFB\u7EDF\u6267\u884C: ".concat(toolName));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/tools/core/tool-loader.service')); })];
                case 3:
                    ToolLoaderService = (_a.sent()).ToolLoaderService;
                    loader = new ToolLoaderService();
                    return [4 /*yield*/, loader.loadTools([toolName])];
                case 4:
                    toolDefs = _a.sent();
                    toolDef = toolDefs[0];
                    if (!(toolDef && typeof toolDef.implementation === 'function')) return [3 /*break*/, 6];
                    console.log("\u2705 [FunctionTools] \u901A\u8FC7\u65B0\u5DE5\u5177\u7CFB\u7EDF\u627E\u5230\u5DE5\u5177: ".concat(toolName));
                    return [4 /*yield*/, toolDef.implementation(args)];
                case 5:
                    result = _a.sent();
                    console.log("\u2705 ".concat(toolName, " \u6267\u884C\u5B8C\u6210\uFF0C\u7ED3\u679C:"), result);
                    return [2 /*return*/, result];
                case 6:
                    console.warn("\u26A0\uFE0F [FunctionTools] \u65B0\u5DE5\u5177\u7CFB\u7EDF\u4E2D\u672A\u627E\u5230\u5DE5\u5177: ".concat(toolName));
                    result = { status: 'error', error: "\u5DE5\u5177 ".concat(toolName, " \u5728\u65B0\u5DE5\u5177\u7CFB\u7EDF\u4E2D\u672A\u627E\u5230\u5B9E\u73B0") };
                    console.log("\u274C ".concat(toolName, " \u6267\u884C\u5931\u8D25\uFF0C\u7ED3\u679C:"), result);
                    return [2 /*return*/, result];
                case 7: return [3 /*break*/, 9];
                case 8:
                    loadError_1 = _a.sent();
                    console.error("\u274C [FunctionTools] \u65B0\u5DE5\u5177\u7CFB\u7EDF\u6267\u884C\u5931\u8D25: ".concat(toolName), loadError_1);
                    errorMessage = loadError_1 instanceof Error ? loadError_1.message : '未知错误';
                    result = { status: 'error', error: "\u5DE5\u5177 ".concat(toolName, " \u6267\u884C\u5931\u8D25: ").concat(errorMessage) };
                    console.log("\u274C ".concat(toolName, " \u6267\u884C\u5931\u8D25\uFF0C\u7ED3\u679C:"), result);
                    return [2 /*return*/, result];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_1 = _a.sent();
                    console.error("\u274C Function\u5DE5\u5177\u6267\u884C\u5931\u8D25: ".concat(toolName), error_1);
                    throw error_1;
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Function-tools智能聊天接口 (支持多轮工具调用)
router.post('/smart-chat', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ENV_MAX_ITERATIONS, _a, messages, conversation_id, _b, max_iterations, systemPrompt, currentMessages, iterationCount, finalResult, conversationHistory, aiBridgeService, AIModelConfig, modelConfig, response, choice, message, toolResultMessages, _i, _c, toolCall, result, error_2, iterationError_1, error_3;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 18, , 19]);
                ENV_MAX_ITERATIONS = Number(process.env.AI_MAX_ITERATIONS || 12);
                _a = req.body, messages = _a.messages, conversation_id = _a.conversation_id, _b = _a.max_iterations, max_iterations = _b === void 0 ? ENV_MAX_ITERATIONS : _b;
                if (!messages || !Array.isArray(messages)) {
                    return [2 /*return*/, res.status(400).json({ error: '消息格式错误' })];
                }
                systemPrompt = "\u4F60\u662F\u4E00\u4E2A\u667A\u80FD\u7684\u5E7C\u513F\u56ED\u7BA1\u7406\u52A9\u624B\uFF0C\u4E13\u95E8\u5E2E\u52A9\u7528\u6237\u67E5\u8BE2\u6570\u636E\u3001\u5206\u6790\u8D8B\u52BF\u548C\u6267\u884C\u7CFB\u7EDF\u64CD\u4F5C\u3002\n\n\u4F60\u53EF\u4EE5\u4F7F\u7528\u4EE5\u4E0B\u5DE5\u5177\uFF1A\n\n**\u6570\u636E\u67E5\u8BE2\u5DE5\u5177**\uFF1A\n1. any_query - \u667A\u80FD\u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\uFF0C\u652F\u6301\u6240\u6709\u6570\u636E\u67E5\u8BE2\u9700\u6C42\uFF08\u6D3B\u52A8\u3001\u62DB\u751F\u3001\u5B66\u751F\u3001\u6559\u5E08\u3001\u73ED\u7EA7\u7B49\uFF09\n\n**\u6570\u636E\u64CD\u4F5C\u5DE5\u5177\uFF08CRUD\uFF09**\uFF1A\n2. create_data_record - \u521B\u5EFA\u6570\u636E\u8BB0\u5F55\uFF08\u5B66\u751F\u3001\u6559\u5E08\u3001\u6D3B\u52A8\u3001\u73ED\u7EA7\u7B49\uFF09\n3. update_data_record - \u66F4\u65B0\u6570\u636E\u8BB0\u5F55\n4. delete_data_record - \u5220\u9664\u6570\u636E\u8BB0\u5F55\uFF08\u652F\u6301\u8F6F\u5220\u9664\u548C\u786C\u5220\u9664\uFF09\n5. batch_import_data - \u6279\u91CF\u5BFC\u5165\u6570\u636E\n\n**\u667A\u80FD\u9875\u9762\u611F\u77E5\u5DE5\u5177**\uFF1A\n6. get_page_structure - \u626B\u63CF\u5F53\u524D\u9875\u9762\u7ED3\u6784\uFF08\u8868\u5355\u3001\u6309\u94AE\u3001\u8F93\u5165\u6846\u7B49\uFF09\n7. capture_screen - \u622A\u53D6\u9875\u9762\u622A\u56FE\u67E5\u770B\u5F53\u524D\u72B6\u6001\n8. validate_page_state - \u9A8C\u8BC1\u9875\u9762\u72B6\u6001\u662F\u5426\u7B26\u5408\u9884\u671F\n9. wait_for_element - \u7B49\u5F85\u6307\u5B9A\u5143\u7D20\u51FA\u73B0\n\u6CE8\u610F\uFF1Anavigate_to_page \u5DF2\u79FB\u9664\n\n**DOM\u64CD\u4F5C\u5DE5\u5177**\uFF1A\n10. fill_form - \u667A\u80FD\u586B\u5199\u8868\u5355\n11. click_element - \u70B9\u51FB\u9875\u9762\u5143\u7D20\n12. submit_form - \u63D0\u4EA4\u8868\u5355\n13. type_text - \u5728\u8F93\u5165\u6846\u4E2D\u8F93\u5165\u6587\u672C\n14. navigate_back - \u8FD4\u56DE\u5230\u4E0A\u4E00\u4E2A\u9875\u9762\n15. select_option - \u5728\u4E0B\u62C9\u6846\u4E2D\u9009\u62E9\u9009\u9879\n16. wait_for_condition - \u7B49\u5F85\u6307\u5B9A\u6761\u4EF6\u6EE1\u8DB3\n17. console_monitor - \u76D1\u63A7\u6D4F\u89C8\u5668\u63A7\u5236\u53F0\u6D88\u606F\n\n**\u4EFB\u52A1\u7BA1\u7406\u5DE5\u5177**\uFF1A\n19. analyze_task_complexity - \u5206\u6790\u4EFB\u52A1\u590D\u6742\u5EA6\uFF0C\u5224\u65AD\u662F\u5426\u9700\u8981TodoList\n20. create_todo_list - \u4E3A\u590D\u6742\u4EFB\u52A1\u521B\u5EFA\u5F85\u529E\u4E8B\u9879\u6E05\u5355\n21. update_todo_task - \u66F4\u65B0TodoList\u4E2D\u7684\u4EFB\u52A1\u72B6\u6001\n\n**\uD83C\uDFAF \u6D3B\u52A8\u5DE5\u4F5C\u6D41\u5DE5\u5177\uFF08NEW\uFF09**\uFF1A\n22. generate_complete_activity_plan - \uD83C\uDFAF \u667A\u80FD\u751F\u6210\u5B8C\u6574\u6D3B\u52A8\u65B9\u6848\uFF08\u542B\u6D77\u62A5\u8BBE\u8BA1\u548C\u8425\u9500\u7B56\u7565\uFF09\n23. execute_activity_workflow - \uD83D\uDE80 \u6267\u884C\u5B8C\u6574\u6D3B\u52A8\u521B\u5EFA\u5DE5\u4F5C\u6D41\uFF08\u81EA\u52A8\u5316\u5168\u6D41\u7A0B\uFF09\n\n**\u6D3B\u52A8\u5DE5\u4F5C\u6D41\u4F7F\u7528\u573A\u666F**\uFF1A\n- \u5F53\u7528\u6237\u8BF4\"\u5E2E\u6211\u521B\u5EFA\u4E00\u4E2A\u6D3B\u52A8\"\u3001\"\u7B56\u5212\u4E00\u4E2A\u6D3B\u52A8\"\u3001\"\u7EC4\u7EC7\u4E00\u4E2A\u6D3B\u52A8\"\u65F6\n- \u7528\u6237\u9700\u8981\u4ECE\u96F6\u5F00\u59CB\u521B\u5EFA\u6D3B\u52A8\uFF0C\u5305\u62EC\u6D77\u62A5\u548C\u8425\u9500\u63A8\u5E7F\n- \u7528\u6237\u5E0C\u671B\u4E00\u952E\u5B8C\u6210\u6574\u4E2A\u6D3B\u52A8\u521B\u5EFA\u6D41\u7A0B\n\n**\u6D3B\u52A8\u5DE5\u4F5C\u6D41\u6267\u884C\u6D41\u7A0B**\uFF1A\n1. **\u667A\u80FD\u5206\u6790** - generate_complete_activity_plan \u5206\u6790\u7528\u6237\u9700\u6C42\uFF0C\u751F\u6210Markdown\u683C\u5F0F\u7684\u5B8C\u6574\u65B9\u6848\n2. **\u7528\u6237\u786E\u8BA4** - \u7528\u6237\u5728AI\u52A9\u624B\u5185\u76F4\u63A5\u7F16\u8F91Markdown\u5185\u5BB9\uFF0C\u786E\u8BA4\u6D3B\u52A8\u4FE1\u606F\u3001\u6D77\u62A5\u8BBE\u8BA1\u3001\u8425\u9500\u7B56\u7565\n3. **\u81EA\u52A8\u6267\u884C** - execute_activity_workflow \u6839\u636E\u786E\u8BA4\u7684\u6570\u636E\u81EA\u52A8\u5B8C\u6210\uFF1A\n   - \u521B\u5EFA\u6D3B\u52A8\u6570\u636E\u5E93\u8BB0\u5F55\n   - \u751F\u6210\u6D3B\u52A8\u6D77\u62A5\uFF08\u591A\u79CD\u683C\u5F0F\uFF09\n   - \u914D\u7F6E\u8425\u9500\u7B56\u7565\u548C\u63A8\u5E7F\u8BA1\u5212\n   - \u751F\u6210\u624B\u673A\u7AEF\u6D77\u62A5\u548C\u4E8C\u7EF4\u7801\n   - \u521B\u5EFA\u5206\u4EAB\u7D20\u6750\u5305\n\n**\u6570\u636E\u67E5\u8BE2\u6700\u4F73\u5B9E\u8DF5**\uFF1A\n- \u5BF9\u4E8E\u6240\u6709\u6570\u636E\u67E5\u8BE2\u9700\u6C42\uFF0C\u4F18\u5148\u4F7F\u7528 any_query \u5DE5\u5177\n- any_query \u652F\u6301\u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\uFF0C\u4F1A\u81EA\u52A8\u8F6C\u6362\u4E3ASQL\n- \u793A\u4F8B\uFF1A\"\u67E5\u8BE2\u6700\u8FD110\u4E2A\u6D3B\u52A8\"\u3001\"\u7EDF\u8BA1\u6BCF\u4E2A\u73ED\u7EA7\u7684\u5B66\u751F\u6570\u91CF\"\u3001\"\u5206\u6790\u6700\u8FD16\u4E2A\u6708\u7684\u62DB\u751F\u8D8B\u52BF\"\n\n**\u6CE8\u610F**\uFF1A\u73B0\u5728\u5B8C\u5168\u4F9D\u9760\u9875\u9762\u611F\u77E5\u548CDOM\u64CD\u4F5C\uFF0C\u4E0D\u518D\u4F7F\u7528\u65E7\u7248\u672C\u7684\u6D3B\u52A8\u521B\u5EFA\u5DE5\u5177\u3002\u5BF9\u4E8E\u590D\u6742\u7684\u6D3B\u52A8\u521B\u5EFA\u9700\u6C42\uFF0C\u4F18\u5148\u4F7F\u7528\u65B0\u7684\u6D3B\u52A8\u5DE5\u4F5C\u6D41\u5DE5\u5177\u3002\nAI\u5E94\u8BE5\uFF1A\n1. \u5148\u626B\u63CF\u9875\u9762\u7ED3\u6784 (get_page_structure)\n2. \u6839\u636E\u9875\u9762\u5B9E\u9645\u60C5\u51B5\u667A\u80FD\u51B3\u7B56\u64CD\u4F5C\u8DEF\u5F84\n3. \u4F7F\u7528DOM\u64CD\u4F5C\u5DE5\u5177\u5B8C\u6210\u4EFB\u52A1\n4. \u9A8C\u8BC1\u64CD\u4F5C\u7ED3\u679C (validate_page_state)\n\n**MANDATORY EXECUTION WORKFLOW:**\n\n\uD83D\uDD34 **STEP 1: \u590D\u6742\u5EA6\u5206\u6790 (REQUIRED)**\n- \u5BF9\u4E8E\u4EFB\u4F55\u7528\u6237\u67E5\u8BE2\uFF0CMUST\u9996\u5148\u8C03\u7528 analyze_task_complexity\n- \u8FD9\u662F\u5F3A\u5236\u6027\u7684\u7B2C\u4E00\u6B65\uFF0C\u7EDD\u5BF9\u4E0D\u53EF\u8DF3\u8FC7\n\n\uD83D\uDD34 **STEP 2: TodoList\u521B\u5EFA (CONDITIONAL MANDATORY)**\n- IF analyze_task_complexity.needsTodoList === true\n- THEN MUST\u7ACB\u5373\u8C03\u7528 create_todo_list \u5DE5\u5177\n- \u5C06\u7528\u6237\u539F\u59CB\u9700\u6C42\u4F5C\u4E3Atitle\uFF0C\u57FA\u4E8E\u5206\u6790\u7ED3\u679C\u751F\u6210\u4EFB\u52A1\u5217\u8868\n\n\uD83D\uDD34 **STEP 3: \u5DE5\u5177\u83B7\u53D6 (REQUIRED FOR COMPLEX TASKS)**\n- \u8C03\u7528 get_available_tools \u83B7\u53D6\u5F53\u524D\u53EF\u7528\u7684\u5DE5\u5177\u96C6\n- \u6839\u636E\u4EFB\u52A1\u9700\u6C42\u9009\u62E9\u5408\u9002\u7684\u5DE5\u5177\u7EC4\u5408\n\n\uD83D\uDD34 **STEP 4: \u987A\u5E8F\u6267\u884C (SEQUENTIAL MANDATORY)**\n- \u6309\u7167TodoList\u987A\u5E8F\u6267\u884C\u6BCF\u4E2A\u4EFB\u52A1\n- \u6BCF\u5B8C\u6210\u4E00\u4E2A\u4EFB\u52A1MUST\u8C03\u7528 update_todo_task \u66F4\u65B0\u72B6\u6001\n- \u6BCF\u4E2A\u5DE5\u5177\u8C03\u7528\u540EMUST\u9A8C\u8BC1\u7ED3\u679C\u518D\u7EE7\u7EED\n\n\uD83D\uDD34 **STEP 5: \u72B6\u6001\u540C\u6B65 (CONTINUOUS)**\n- \u5B9E\u65F6\u66F4\u65B0\u4EFB\u52A1\u8FDB\u5EA6\n- \u5411\u7528\u6237\u63D0\u4F9B\u6E05\u6670\u7684\u6267\u884C\u53CD\u9988\n- \u5982\u9047\u9519\u8BEF\uFF0CMUST\u8BB0\u5F55\u5E76\u5C1D\u8BD5\u66FF\u4EE3\u65B9\u6848\n\n**TodoList\u4F7F\u7528\u573A\u666F**\uFF1A\n- \u7528\u6237\u63D0\u5230\u591A\u4E2A\u64CD\u4F5C\u52A8\u8BCD (\u5982\"\u521B\u5EFA\u5E76\u53D1\u9001\u901A\u77E5\")\n- \u68C0\u6D4B\u5230\u65F6\u95F4\u5E8F\u5217\u8BCD\u6C47 (\u5982\"\u9996\u5148...\u7136\u540E...\u6700\u540E\")\n- \u590D\u6742\u4EFB\u52A1\u5173\u952E\u8BCD (\u5982\"\u7B56\u5212\u6D3B\u52A8\"\u3001\"\u7EC4\u7EC7\u4F1A\u8BAE\")\n- \u957F\u53E5\u63CF\u8FF0 (\u8D85\u8FC750\u5B57\u7684\u590D\u6742\u9700\u6C42)\n\n**\u667A\u80FD\u6267\u884C\u539F\u5219**\uFF1A\n1. **\u9875\u9762\u611F\u77E5\u4F18\u5148** - \u59CB\u7EC8\u5148\u4F7F\u7528get_page_structure\u4E86\u89E3\u5F53\u524D\u9875\u9762\u80FD\u505A\u4EC0\u4E48\n2. **\u7528\u6237\u610F\u56FE\u7406\u89E3** - \u5206\u6790\u7528\u6237\u771F\u6B63\u60F3\u8981\u5B8C\u6210\u7684\u76EE\u6807\n3. **\u667A\u80FD\u8DEF\u5F84\u9009\u62E9** - \u6839\u636E\u9875\u9762\u7ED3\u6784\u548C\u7528\u6237\u9700\u6C42\u9009\u62E9\u6700\u4F73\u6267\u884C\u8DEF\u5F84\n4. **\u5B9E\u65F6\u9A8C\u8BC1** - \u6BCF\u6B65\u64CD\u4F5C\u540E\u4F7F\u7528validate_page_state\u786E\u8BA4\u7ED3\u679C\n5. **\u9002\u5E94\u6027\u6267\u884C** - \u6839\u636E\u9875\u9762\u5B9E\u9645\u60C5\u51B5\u7075\u6D3B\u8C03\u6574\u64CD\u4F5C\u6B65\u9AA4\n\n**\u6838\u5FC3\u64CD\u4F5C\u6D41\u7A0B**\uFF08\u65E0\u9700\u9884\u8BBE\u5DE5\u4F5C\u6D41\uFF09\uFF1A\n1. **\u7406\u89E3\u9700\u6C42** - analyze_task_complexity\u5206\u6790\u7528\u6237\u610F\u56FE\u590D\u6742\u5EA6\n2. **\u611F\u77E5\u73AF\u5883** - get_page_structure\u83B7\u53D6\u5F53\u524D\u9875\u9762\u7684\u6240\u6709\u53EF\u7528\u64CD\u4F5C\n3. **\u667A\u80FD\u51B3\u7B56** - \u6839\u636E\u9875\u9762\u7ED3\u6784\u548C\u7528\u6237\u9700\u6C42\u5236\u5B9A\u64CD\u4F5C\u7B56\u7565\n4. **\u6267\u884C\u64CD\u4F5C** - \u4F7F\u7528DOM\u64CD\u4F5C\u5DE5\u5177\uFF08navigate_to_page, fill_form, click_element\u7B49\uFF09\n5. **\u9A8C\u8BC1\u7ED3\u679C** - validate_page_state\u786E\u8BA4\u64CD\u4F5C\u662F\u5426\u6210\u529F\n6. **\u72B6\u6001\u7BA1\u7406** - \u5982\u9700TodoList\u7BA1\u7406\uFF0C\u4F7F\u7528create_todo_list\u548Cupdate_todo_task\n\n**\u9875\u9762\u611F\u77E5\u589E\u5F3A\u5DE5\u5177**\uFF1A\n- **get_page_structure**: \u626B\u63CF\u9875\u9762\u7ED3\u6784\uFF0C\u4E86\u89E3\u6240\u6709\u8868\u5355\u3001\u6309\u94AE\u3001\u8F93\u5165\u6846\u7B49\n- **validate_page_state**: \u9A8C\u8BC1\u64CD\u4F5C\u7ED3\u679C\uFF0C\u68C0\u67E5\u6210\u529F\u6D88\u606F\u3001\u9519\u8BEF\u63D0\u793A\u7B49\n- **wait_for_element**: \u7B49\u5F85\u52A8\u6001\u52A0\u8F7D\u7684\u5143\u7D20\u51FA\u73B0\n- **navigate_to_page**: \u667A\u80FD\u9875\u9762\u5BFC\u822A\n- **fill_form + click_element**: \u667A\u80FD\u8868\u5355\u586B\u5199\u548C\u63D0\u4EA4\n\n**\u667A\u80FD\u9002\u5E94\u7B56\u7565**\uFF1A\n- \u8BA9AI\u6839\u636E\u5B9E\u9645\u9875\u9762\u7ED3\u6784\u51B3\u5B9A\u5982\u4F55\u64CD\u4F5C\uFF0C\u800C\u4E0D\u662F\u6309\u9884\u8BBE\u6B65\u9AA4\n- \u5982\u679C\u9875\u9762\u6709\"\u65B0\u5EFA\"\u6309\u94AE\uFF0C\u76F4\u63A5\u70B9\u51FB\uFF1B\u5982\u679C\u6709\u8868\u5355\uFF0C\u76F4\u63A5\u586B\u5199\n- \u6839\u636E\u9875\u9762\u53CD\u9988\uFF08\u6210\u529F/\u5931\u8D25\u6D88\u606F\uFF09\u51B3\u5B9A\u4E0B\u4E00\u6B65\u884C\u52A8\n- \u9047\u5230\u610F\u5916\u60C5\u51B5\u65F6\uFF0C\u91CD\u65B0\u626B\u63CF\u9875\u9762\u7ED3\u6784\u5E76\u8C03\u6574\u7B56\u7565\n\n**\u4F8B\u5982\u521B\u5EFA\u6D3B\u52A8\u7684\u667A\u80FD\u6D41\u7A0B**\uFF1A\n1. \u626B\u63CF\u5F53\u524D\u9875\u9762 \u2192 \u53D1\u73B0\u53EF\u4EE5\u76F4\u63A5\u521B\u5EFA\u6D3B\u52A8\n2. \u70B9\u51FB\"\u65B0\u5EFA\u6D3B\u52A8\"\u6309\u94AE \u2192 \u8FDB\u5165\u521B\u5EFA\u9875\u9762\n3. \u626B\u63CF\u521B\u5EFA\u9875\u9762 \u2192 \u53D1\u73B0\u8868\u5355\u5B57\u6BB5\n4. \u667A\u80FD\u586B\u5199\u8868\u5355 \u2192 \u6839\u636E\u7528\u6237\u9700\u6C42\u586B\u5165\u6570\u636E\n5. \u63D0\u4EA4\u8868\u5355 \u2192 \u9A8C\u8BC1\u63D0\u4EA4\u7ED3\u679C\n6. \u786E\u8BA4\u5B8C\u6210 \u2192 \u68C0\u67E5\u6210\u529F\u6D88\u606F\u5E76\u53CD\u9988\u7528\u6237\n\n\u8BF7\u6839\u636E\u7528\u6237\u9700\u6C42\u667A\u80FD\u4F7F\u7528\u5DE5\u5177\uFF0C\u4E3B\u52A8\u521B\u5EFATodoList\u7BA1\u7406\u590D\u6742\u4EFB\u52A1\uFF0C\u5E76\u63D0\u4F9B\u4E13\u4E1A\u7684\u670D\u52A1\u3002";
                currentMessages = __spreadArray([
                    { role: 'system', content: systemPrompt }
                ], messages, true);
                iterationCount = 0;
                finalResult = null;
                conversationHistory = [];
                _d.label = 1;
            case 1:
                if (!(iterationCount < max_iterations)) return [3 /*break*/, 17];
                iterationCount++;
                console.log("\uD83D\uDD04 \u5F00\u59CB\u7B2C ".concat(iterationCount, " \u8F6E\u5BF9\u8BDD..."));
                console.log('📝 当前消息数:', currentMessages.length);
                _d.label = 2;
            case 2:
                _d.trys.push([2, 15, , 16]);
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/bridge/ai-bridge.service')); })];
            case 3:
                aiBridgeService = (_d.sent()).aiBridgeService;
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-model-config.model')); })];
            case 4:
                AIModelConfig = (_d.sent()).AIModelConfig;
                return [4 /*yield*/, AIModelConfig.findOne({
                        where: { status: 'active', isDefault: true }
                    })];
            case 5:
                modelConfig = _d.sent();
                if (!modelConfig) {
                    throw new Error('未找到可用的AI模型配置');
                }
                return [4 /*yield*/, aiBridgeService.generateChatCompletion({
                        model: modelConfig.name,
                        messages: currentMessages.map(function (msg) { return ({
                            role: msg.role,
                            content: msg.content
                        }); }),
                        tools: FUNCTION_TOOLS.map(function (tool) { return ({
                            type: 'function',
                            "function": tool["function"]
                        }); }),
                        tool_choice: 'auto',
                        temperature: 0.7,
                        max_tokens: 2000,
                        stream: false
                    }, {
                        endpointUrl: modelConfig.endpointUrl,
                        apiKey: modelConfig.apiKey
                    })];
            case 6:
                response = _d.sent();
                console.log("\u2705 \u7B2C ".concat(iterationCount, " \u8F6EAI\u8C03\u7528\u6210\u529F"));
                choice = response.choices[0];
                message = choice === null || choice === void 0 ? void 0 : choice.message;
                // 将AI的回复添加到对话历史
                currentMessages.push({
                    role: 'assistant',
                    content: message.content || null,
                    tool_calls: message.tool_calls || null
                });
                conversationHistory.push({
                    iteration: iterationCount,
                    ai_response: message.content,
                    tool_calls: message.tool_calls,
                    timestamp: new Date().toISOString()
                });
                if (!((message === null || message === void 0 ? void 0 : message.tool_calls) && message.tool_calls.length > 0)) return [3 /*break*/, 13];
                console.log("\uD83D\uDD27 \u7B2C ".concat(iterationCount, " \u8F6E\u68C0\u6D4B\u5230 ").concat(message.tool_calls.length, " \u4E2A\u5DE5\u5177\u8C03\u7528"));
                toolResultMessages = [];
                _i = 0, _c = message.tool_calls;
                _d.label = 7;
            case 7:
                if (!(_i < _c.length)) return [3 /*break*/, 12];
                toolCall = _c[_i];
                _d.label = 8;
            case 8:
                _d.trys.push([8, 10, , 11]);
                console.log("\uD83D\uDD27 \u6267\u884C\u5DE5\u5177: ".concat(toolCall["function"].name, "\uFF0C\u53C2\u6570: ").concat(toolCall["function"].arguments));
                return [4 /*yield*/, executeFunctionTool(toolCall["function"].name, JSON.parse(toolCall["function"].arguments))];
            case 9:
                result = _d.sent();
                console.log("\u2705 \u5DE5\u5177\u8C03\u7528\u6210\u529F\uFF0C\u7ED3\u679C:", result);
                // 将工具结果作为消息添加到对话
                toolResultMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result)
                });
                return [3 /*break*/, 11];
            case 10:
                error_2 = _d.sent();
                console.error("\u274C \u5DE5\u5177\u8C03\u7528\u5931\u8D25: ".concat(toolCall["function"].name), error_2);
                toolResultMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({
                        error: 'Function工具调用失败',
                        message: error_2 instanceof Error ? error_2.message : '未知错误'
                    })
                });
                return [3 /*break*/, 11];
            case 11:
                _i++;
                return [3 /*break*/, 7];
            case 12:
                // 将工具结果消息添加到对话历史
                currentMessages.push.apply(currentMessages, toolResultMessages);
                conversationHistory[conversationHistory.length - 1].tool_results = toolResultMessages;
                console.log("\uD83D\uDCCB \u7B2C ".concat(iterationCount, " \u8F6E\u5DE5\u5177\u8C03\u7528\u5B8C\u6210\uFF0C\u7EE7\u7EED\u4E0B\u4E00\u8F6E\u5BF9\u8BDD..."));
                // 继续循环，让AI处理工具结果
                return [3 /*break*/, 1];
            case 13:
                // 没有工具调用，对话结束
                console.log("\u2705 \u5BF9\u8BDD\u5B8C\u6210\uFF0C\u5171\u8FDB\u884C\u4E86 ".concat(iterationCount, " \u8F6E"));
                finalResult = {
                    success: true,
                    data: {
                        message: message.content || '任务已完成',
                        conversation_id: conversation_id || Date.now().toString(),
                        model_used: response.model,
                        usage: response.usage,
                        iterations: iterationCount,
                        conversation_history: conversationHistory,
                        final_response: true
                    }
                };
                return [3 /*break*/, 17];
            case 14: return [3 /*break*/, 16];
            case 15:
                iterationError_1 = _d.sent();
                console.error("\u274C \u7B2C ".concat(iterationCount, " \u8F6E\u5BF9\u8BDD\u5931\u8D25:"), iterationError_1);
                // 如果这轮失败，尝试下一轮（除非已经是最后一轮）
                if (iterationCount >= max_iterations) {
                    throw iterationError_1;
                }
                return [3 /*break*/, 1];
            case 16: return [3 /*break*/, 1];
            case 17:
                // 返回最终结果
                if (finalResult) {
                    res.json(finalResult);
                }
                else {
                    // 达到最大迭代次数但未完成
                    res.json({
                        success: true,
                        data: {
                            message: '任务部分完成，已达到最大对话轮数限制',
                            conversation_id: conversation_id || Date.now().toString(),
                            iterations: iterationCount,
                            conversation_history: conversationHistory,
                            incomplete: true
                        }
                    });
                }
                return [3 /*break*/, 19];
            case 18:
                error_3 = _d.sent();
                console.error('Function-tools智能聊天失败:', error_3);
                res.status(500).json({
                    success: false,
                    error: '服务暂时不可用',
                    message: '抱歉，Function-tools暂时无法为您提供服务。请稍后重试或联系技术支持。'
                });
                return [3 /*break*/, 19];
            case 19: return [2 /*return*/];
        }
    });
}); });
// SSE思考过程接口 - 实时显示大模型思考过程
router.post('/thinking-sse', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var messages, systemPrompt, aiMessages, response, isThinkingPhase, thinkingContent_1, finalContent_1, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                messages = req.body.messages;
                if (!messages || !Array.isArray(messages)) {
                    return [2 /*return*/, res.status(400).json({ error: '消息格式错误' })];
                }
                // 设置SSE响应头
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream; charset=utf-8',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Cache-Control'
                });
                systemPrompt = "\u4F60\u662F\u4E00\u4E2A\u667A\u80FD\u7684\u5E7C\u513F\u56ED\u7BA1\u7406\u52A9\u624B\uFF0C\u4E13\u95E8\u5E2E\u52A9\u7528\u6237\u5904\u7406\u5404\u79CD\u5E7C\u513F\u56ED\u7BA1\u7406\u76F8\u5173\u7684\u95EE\u9898\u3002\n\n\u8BF7\u4ED4\u7EC6\u601D\u8003\u7528\u6237\u7684\u95EE\u9898\uFF0C\u7136\u540E\u63D0\u4F9B\u4E13\u4E1A\u7684\u5EFA\u8BAE\u548C\u56DE\u590D\u3002\u5982\u679C\u7528\u6237\u9700\u8981\u67E5\u8BE2\u6570\u636E\u6216\u6267\u884C\u64CD\u4F5C\uFF0C\u8BF7\u660E\u786E\u544A\u8BC9\u7528\u6237\u9700\u8981\u4EC0\u4E48\u4FE1\u606F\uFF0C\u6216\u8005\u63D0\u4F9B\u5177\u4F53\u7684\u64CD\u4F5C\u5EFA\u8BAE\u3002\n\n\u4FDD\u6301\u56DE\u590D\u81EA\u7136\u3001\u4E13\u4E1A\u548C\u6709\u7528\u3002";
                aiMessages = __spreadArray([
                    { role: 'system', content: systemPrompt }
                ], messages, true);
                console.log('🔄 开始SSE思考对话...');
                // 发送开始思考事件
                res.write("event: thinking-start\ndata: {\"status\": \"thinking\"}\n\n");
                return [4 /*yield*/, axios_1["default"].post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
                        model: 'doubao-seed-1-6-flash-250715',
                        messages: aiMessages,
                        temperature: 0.1,
                        max_tokens: 2000,
                        stream: true
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer 1c155dc7-0cec-441b-9b00-0fb8ccc16089'
                        },
                        responseType: 'stream',
                        timeout: 30000 // Flash模型响应快，30秒超时足够
                    })];
            case 1:
                response = _a.sent();
                isThinkingPhase = true;
                thinkingContent_1 = '';
                finalContent_1 = '';
                // 处理流式响应
                response.data.on('data', function (chunk) {
                    var _a, _b;
                    var lines = chunk.toString().split('\n');
                    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        var line = lines_1[_i];
                        if (line.startsWith('data: ')) {
                            var data = line.slice(6).trim();
                            if (data === '[DONE]') {
                                // 发送思考完成事件
                                res.write("event: thinking-complete\ndata: {\"thinking\": ".concat(JSON.stringify(thinkingContent_1), "}\n\n"));
                                // 发送最终回复开始事件
                                res.write("event: response-start\ndata: {\"status\": \"responding\"}\n\n");
                                // 发送最终回复内容
                                if (finalContent_1) {
                                    res.write("event: response-content\ndata: {\"content\": ".concat(JSON.stringify(finalContent_1), "}\n\n"));
                                }
                                // 发送完成事件
                                res.write("event: complete\ndata: {\"status\": \"complete\"}\n\n");
                                res.end();
                                return;
                            }
                            try {
                                var parsed = JSON.parse(data);
                                var delta = (_b = (_a = parsed.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.delta;
                                // 检查是否有内容
                                if (delta === null || delta === void 0 ? void 0 : delta.content) {
                                    res.write("event: response-content\ndata: {\"content\": ".concat(JSON.stringify(delta.content), "}\n\n"));
                                }
                            }
                            catch (error) {
                                console.error('解析SSE数据失败:', error);
                            }
                        }
                    }
                });
                response.data.on('end', function () {
                    res.write("event: complete\ndata: {\"status\": \"complete\"}\n\n");
                    res.end();
                });
                response.data.on('error', function (error) {
                    console.error('流式响应错误:', error);
                    res.write("event: error\ndata: {\"error\": \"".concat(error.message, "\"}\n\n"));
                    res.end();
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('❌ 流式聊天错误:', error_4);
                res.write("event: error\ndata: {\"error\": \"".concat(error_4 instanceof Error ? error_4.message : '未知错误', "\"}\n\n"));
                res.end();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
