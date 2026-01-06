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
exports.__esModule = true;
exports.ToolManagerService = void 0;
var tool_selector_service_1 = require("./tool-selector.service");
var tool_loader_service_1 = require("./tool-loader.service");
/**
 * 工具管理器 - 主入口，协调工具选择、加载和执行
 */
var ToolManagerService = /** @class */ (function () {
    function ToolManagerService() {
        this.toolSelector = new tool_selector_service_1.ToolSelectorService();
        this.toolLoader = new tool_loader_service_1.ToolLoaderService();
    }
    /**
     * 为查询获取最适合的工具列表
     */
    ToolManagerService.prototype.getToolsForQuery = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var queryStr, selectedToolNames, toolDefinitions, formattedTools, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryStr = String(context.query || '');
                        console.log('🎯 [工具管理器] 开始为查询获取工具', {
                            query: queryStr.substring(0, 100),
                            userRole: context.userRole,
                            maxTools: context.maxTools
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.toolSelector.selectToolsByFunction(context)];
                    case 2:
                        selectedToolNames = _a.sent();
                        console.log('📋 [工具选择] 选择的工具名称:', selectedToolNames);
                        return [4 /*yield*/, this.toolLoader.loadTools(selectedToolNames)];
                    case 3:
                        toolDefinitions = _a.sent();
                        console.log('🔧 [工具加载] 成功加载的工具数量:', toolDefinitions.length);
                        formattedTools = this.formatToolsForAPI(toolDefinitions);
                        console.log('✅ [工具管理器] 工具获取完成', {
                            requestedTools: selectedToolNames.length,
                            loadedTools: toolDefinitions.length,
                            formattedTools: formattedTools.length
                        });
                        return [2 /*return*/, formattedTools];
                    case 4:
                        error_1 = _a.sent();
                        console.error('❌ [工具管理器] 获取工具失败:', error_1);
                        // 降级处理：返回基础工具
                        return [2 /*return*/, this.getFallbackTools()];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行工具调用（暂时保持兼容性，后续可扩展）
     */
    ToolManagerService.prototype.executeTools = function (functionCalls) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, functionCalls_1, functionCall, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('⚡ [工具执行] 开始执行工具调用', {
                            toolCount: functionCalls.length,
                            tools: functionCalls.map(function (fc) { return fc.name; })
                        });
                        results = [];
                        _i = 0, functionCalls_1 = functionCalls;
                        _a.label = 1;
                    case 1:
                        if (!(_i < functionCalls_1.length)) return [3 /*break*/, 6];
                        functionCall = functionCalls_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.executeSingleTool(functionCall)];
                    case 3:
                        result = _a.sent();
                        results.push(result);
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error("\u274C [\u5DE5\u5177\u6267\u884C] \u5DE5\u5177 ".concat(functionCall.name, " \u6267\u884C\u5931\u8D25:"), error_2);
                        results.push({
                            name: functionCall.name,
                            status: 'error',
                            result: null,
                            error: error_2.message
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        console.log('✅ [工具执行] 工具执行完成', {
                            totalTools: functionCalls.length,
                            successfulTools: results.filter(function (r) { return r.status === 'success'; }).length,
                            failedTools: results.filter(function (r) { return r.status === 'error'; }).length
                        });
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * 执行单个工具
     */
    ToolManagerService.prototype.executeSingleTool = function (functionCall) {
        return __awaiter(this, void 0, void 0, function () {
            var name, argsStr, args, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = functionCall.name, argsStr = functionCall.arguments;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        args = JSON.parse(argsStr);
                        return [4 /*yield*/, this.executeLegacyTool(name, args)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, {
                                name: name,
                                status: 'success',
                                result: result,
                                metadata: {
                                    executionTime: Date.now(),
                                    toolVersion: 'legacy'
                                }
                            }];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                name: name,
                                status: 'error',
                                result: null,
                                error: error_3.message
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行旧版工具（兼容性支持）
     */
    ToolManagerService.prototype.executeLegacyTool = function (toolName, args) {
        return __awaiter(this, void 0, void 0, function () {
            var ToolLoaderService_1, loader, toolDefs, toolDef, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDD04 [\u517C\u5BB9\u6267\u884C] \u5C1D\u8BD5\u4F7F\u7528\u65B0\u5DE5\u5177\u7CFB\u7EDF\u6267\u884C ".concat(toolName), args);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./tool-loader.service')); })];
                    case 2:
                        ToolLoaderService_1 = (_a.sent()).ToolLoaderService;
                        loader = new ToolLoaderService_1();
                        return [4 /*yield*/, loader.loadTools([toolName])];
                    case 3:
                        toolDefs = _a.sent();
                        toolDef = toolDefs[0];
                        if (!(toolDef && typeof toolDef.implementation === 'function')) return [3 /*break*/, 5];
                        console.log("\u2705 [\u517C\u5BB9\u6267\u884C] \u901A\u8FC7\u65B0\u5DE5\u5177\u7CFB\u7EDF\u627E\u5230\u5DE5\u5177: ".concat(toolName));
                        return [4 /*yield*/, toolDef.implementation(args)];
                    case 4:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 5:
                        console.warn("\u26A0\uFE0F [\u517C\u5BB9\u6267\u884C] \u65B0\u5DE5\u5177\u7CFB\u7EDF\u4E2D\u672A\u627E\u5230\u5DE5\u5177: ".concat(toolName, "\uFF0C\u8FD4\u56DE\u6A21\u62DF\u7ED3\u679C"));
                        // 返回基本的成功结果
                        return [2 /*return*/, {
                                success: true,
                                message: "\u5DE5\u5177 ".concat(toolName, " \u6267\u884C\u5B8C\u6210\uFF08\u517C\u5BB9\u6A21\u5F0F\uFF09"),
                                data: args
                            }];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_4 = _a.sent();
                        console.error("\u274C [\u517C\u5BB9\u6267\u884C] \u65B0\u5DE5\u5177\u7CFB\u7EDF\u6267\u884C\u5931\u8D25: ".concat(toolName), error_4);
                        // 返回基本的成功结果
                        return [2 /*return*/, {
                                success: true,
                                message: "\u5DE5\u5177 ".concat(toolName, " \u6267\u884C\u5B8C\u6210\uFF08\u517C\u5BB9\u6A21\u5F0F\uFF09"),
                                data: args
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 将工具定义转换为豆包API格式（符合OpenAI Function Calling标准）
     */
    ToolManagerService.prototype.formatToolsForAPI = function (tools) {
        return tools.map(function (tool) { return ({
            type: 'function',
            "function": {
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: tool.parameters.type,
                    properties: tool.parameters.properties,
                    required: tool.parameters.required || []
                }
            }
        }); });
    };
    /**
     * 获取降级工具（当主要流程失败时使用）
     */
    ToolManagerService.prototype.getFallbackTools = function () {
        console.log('🆘 [降级处理] 使用基础工具集');
        return [
            {
                name: 'render_component',
                description: '渲染UI组件，用于数据展示',
                category: 'ui',
                weight: 10,
                parameters: {
                    type: 'object',
                    properties: {
                        component_type: {
                            type: 'string',
                            "enum": ['data-table', 'chart', 'todo-list', 'stat-card']
                        },
                        title: { type: 'string' },
                        data: { type: 'object' }
                    },
                    required: ['component_type', 'title']
                }
            },
            {
                name: 'query_data',
                description: '查询系统数据',
                category: 'data',
                weight: 9,
                parameters: {
                    type: 'object',
                    properties: {
                        data_type: {
                            type: 'string',
                            "enum": ['students', 'enrollment', 'activities', 'teachers']
                        },
                        filters: { type: 'object' }
                    },
                    required: ['data_type']
                }
            }
        ];
    };
    /**
     * 获取工具统计信息
     */
    ToolManagerService.prototype.getToolStats = function () {
        return {
            cacheStats: this.toolLoader.getCacheStats(),
            timestamp: new Date().toISOString()
        };
    };
    /**
     * 清理资源
     */
    ToolManagerService.prototype.cleanup = function () {
        this.toolLoader.clearCache();
        console.log('🧹 [工具管理器] 资源清理完成');
    };
    return ToolManagerService;
}());
exports.ToolManagerService = ToolManagerService;
