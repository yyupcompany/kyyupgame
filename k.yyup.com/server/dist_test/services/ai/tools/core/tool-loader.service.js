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
exports.ToolLoaderService = void 0;
/**
 * 工具加载器 - 动态加载工具定义，支持缓存
 */
var ToolLoaderService = /** @class */ (function () {
    function ToolLoaderService() {
        this.toolCache = new Map();
        this.loadingPromises = new Map();
    }
    /**
     * 加载指定的工具列表
     */
    ToolLoaderService.prototype.loadTools = function (toolNames) {
        return __awaiter(this, void 0, void 0, function () {
            var tools, loadPromises, _i, toolNames_1, toolName, loadedTools, _a, loadedTools_1, tool;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('🔧 [工具加载器] 开始加载工具:', toolNames);
                        tools = [];
                        loadPromises = [];
                        for (_i = 0, toolNames_1 = toolNames; _i < toolNames_1.length; _i++) {
                            toolName = toolNames_1[_i];
                            loadPromises.push(this.loadSingleTool(toolName));
                        }
                        return [4 /*yield*/, Promise.all(loadPromises)];
                    case 1:
                        loadedTools = _b.sent();
                        for (_a = 0, loadedTools_1 = loadedTools; _a < loadedTools_1.length; _a++) {
                            tool = loadedTools_1[_a];
                            if (tool) {
                                tools.push(tool);
                            }
                        }
                        console.log('✅ [工具加载器] 成功加载工具数量:', tools.length);
                        return [2 /*return*/, tools];
                }
            });
        });
    };
    /**
     * 加载单个工具
     */
    ToolLoaderService.prototype.loadSingleTool = function (toolName) {
        return __awaiter(this, void 0, void 0, function () {
            var loadPromise, tool;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 1. 尝试从缓存获取
                        if (this.toolCache.has(toolName)) {
                            console.log("\uD83D\uDCE6 [\u7F13\u5B58\u547D\u4E2D] \u5DE5\u5177 ".concat(toolName, " \u4ECE\u7F13\u5B58\u52A0\u8F7D"));
                            return [2 /*return*/, this.toolCache.get(toolName)];
                        }
                        if (!this.loadingPromises.has(toolName)) return [3 /*break*/, 2];
                        console.log("\u23F3 [\u7B49\u5F85\u52A0\u8F7D] \u5DE5\u5177 ".concat(toolName, " \u6B63\u5728\u52A0\u8F7D\u4E2D"));
                        return [4 /*yield*/, this.loadingPromises.get(toolName)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        loadPromise = this.loadToolDefinition(toolName);
                        this.loadingPromises.set(toolName, loadPromise);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, , 5, 6]);
                        return [4 /*yield*/, loadPromise];
                    case 4:
                        tool = _a.sent();
                        if (tool) {
                            // 缓存成功加载的工具
                            this.toolCache.set(toolName, tool);
                            console.log("\u2705 [\u52A0\u8F7D\u6210\u529F] \u5DE5\u5177 ".concat(toolName, " \u52A0\u8F7D\u5B8C\u6210"));
                        }
                        else {
                            console.warn("\u26A0\uFE0F [\u52A0\u8F7D\u5931\u8D25] \u5DE5\u5177 ".concat(toolName, " \u52A0\u8F7D\u5931\u8D25"));
                        }
                        return [2 /*return*/, tool];
                    case 5:
                        // 清理加载状态
                        this.loadingPromises["delete"](toolName);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 动态加载工具定义
     */
    ToolLoaderService.prototype.loadToolDefinition = function (toolName) {
        return __awaiter(this, void 0, void 0, function () {
            var toolPath, toolModule, importError_1, error_1;
            return __generator(this, function (_a) {
                var _b;
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        toolPath = this.getToolPath(toolName);
                        if (!toolPath) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (_b = "../".concat(toolPath), Promise.resolve().then(function () { return __importStar(require(_b)); }))];
                    case 2:
                        toolModule = _a.sent();
                        return [2 /*return*/, toolModule["default"] || toolModule[toolName]];
                    case 3:
                        importError_1 = _a.sent();
                        console.log("\uD83D\uDCC1 [\u65B0\u8DEF\u5F84\u5931\u8D25] \u5DE5\u5177 ".concat(toolName, " \u5728\u65B0\u8DEF\u5F84\u52A0\u8F7D\u5931\u8D25\uFF0C\u5C1D\u8BD5\u65E7\u8DEF\u5F84"));
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, this.loadFromLegacyServices(toolName)];
                    case 5: 
                    // 如果新路径失败，尝试从旧的服务加载
                    return [2 /*return*/, _a.sent()];
                    case 6:
                        error_1 = _a.sent();
                        console.error("\u274C [\u52A0\u8F7D\u9519\u8BEF] \u5DE5\u5177 ".concat(toolName, " \u52A0\u8F7D\u5931\u8D25:"), error_1);
                        return [2 /*return*/, null];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取工具的文件路径
     */
    ToolLoaderService.prototype.getToolPath = function (toolName) {
        var pathMap = {
            // UI展示工具
            'render_component': 'ui-display/render-component.tool',
            'generate_html_preview': 'ui-display/generate-html-preview.tool',
            'create_task_list': 'ui-display/create-task-list.tool',
            'display_data': 'ui-display/display-data.tool',
            // 网页操作工具
            // 注意：navigate_to_page 已移除
            'capture_screen': 'web-operation/capture-screen.tool',
            'fill_form': 'web-operation/fill-form.tool',
            'submit_form': 'web-operation/submit-form.tool',
            'click_element': 'web-operation/click-element.tool',
            'get_page_structure': 'web-operation/get-page-structure.tool',
            'validate_page_state': 'web-operation/validate-page-state.tool',
            'wait_for_element': 'web-operation/wait-for-element.tool',
            'web_search': 'web-operation/web-search.tool',
            // 新增的网页操作工具
            'type_text': 'web-operation/type-text.tool',
            'navigate_back': 'web-operation/navigate-back.tool',
            'select_option': 'web-operation/select-option.tool',
            'wait_for_condition': 'web-operation/wait-for-condition.tool',
            'console_monitor': 'web-operation/console-monitor.tool',
            // 数据库查询工具
            'read_data_record': 'database-query/read-data-record.tool',
            'any_query': 'database-query/any-query.tool',
            // 数据库CRUD工具
            'create_data_record': 'database-crud/create-data-record.tool',
            'update_data_record': 'database-crud/update-data-record.tool',
            'delete_data_record': 'database-crud/delete-data-record.tool',
            'batch_import_data': 'database-crud/batch-import-data.tool',
            // 数据导入工作流工具
            'import_parent_data': 'workflow/data-import-workflow/import-parent-data.tool',
            'import_teacher_data': 'workflow/data-import-workflow/import-teacher-data.tool',
            // 文档生成工具
            'generate_pdf_report': 'document-generation/generate-pdf-report.tool',
            'generate_word_document': 'document-generation/generate-word-document.tool',
            'generate_excel_report': 'document-generation/generate-excel-report.tool',
            'generate_ppt_presentation': 'document-generation/generate-ppt-presentation.tool',
            // 工作流工具
            'create_workflow': 'workflow/create-workflow.tool',
            'execute_workflow': 'workflow/execute-workflow.tool',
            'plan_workflow': 'workflow/plan-workflow.tool',
            'task_management': 'workflow/task-management.tool',
            'smart_workflow': 'workflow/smart-workflow.tool',
            'create_todo_list': 'workflow/create-todo-list.tool',
            'update_todo_task': 'workflow/update-todo-task.tool',
            'analyze_task_complexity': 'workflow/analyze-task-complexity.tool',
            // 活动工作流工具
            'generate_complete_activity_plan': 'workflow/activity-workflow/generate-complete-activity-plan.tool',
            'create_activity_record': 'workflow/activity-workflow/create-activity-record.tool',
            'execute_activity_workflow': 'workflow/activity-workflow/execute-activity-workflow.tool',
            'generate_activity_poster': 'workflow/activity-workflow/generate-activity-poster.tool',
            'setup_marketing_strategy': 'workflow/activity-workflow/setup-marketing-strategy.tool',
            'create_mobile_poster': 'workflow/activity-workflow/create-mobile-poster.tool',
            'workflow_progress_tracker': 'workflow/activity-workflow/workflow-progress-tracker.tool',
            // 业务操作工具
            'create_activity': 'business-operation/create-activity.tool',
            'create_activity_complete': 'business-operation/create-activity-complete.tool',
            'generate_poster': 'business-operation/generate-poster.tool',
            'expert_consultation': 'business-operation/expert-consultation.tool'
        };
        return pathMap[toolName] || null;
    };
    /**
     * 从旧的服务中加载工具（兼容性支持）
     */
    ToolLoaderService.prototype.loadFromLegacyServices = function (toolName) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        console.log("\uD83D\uDD04 [\u517C\u5BB9\u6A21\u5F0F] \u5C1D\u8BD5\u4ECE\u65E7\u670D\u52A1\u52A0\u8F7D\u5DE5\u5177 ".concat(toolName));
                        if (!this.isLegacyFunctionTool(toolName)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createLegacyFunctionToolDefinition(toolName)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        if (!this.isLegacyUITool(toolName)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.createLegacyUIToolDefinition(toolName)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        console.warn("\u26A0\uFE0F [\u672A\u77E5\u5DE5\u5177] \u5DE5\u5177 ".concat(toolName, " \u5728\u6240\u6709\u670D\u52A1\u4E2D\u90FD\u672A\u627E\u5230"));
                        return [2 /*return*/, null];
                    case 5:
                        error_2 = _a.sent();
                        console.error("\u274C [\u517C\u5BB9\u6A21\u5F0F\u9519\u8BEF] \u4ECE\u65E7\u670D\u52A1\u52A0\u8F7D\u5DE5\u5177 ".concat(toolName, " \u5931\u8D25:"), error_2);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查是否为旧的功能工具
     */
    ToolLoaderService.prototype.isLegacyFunctionTool = function (toolName) {
        var legacyFunctionTools = [
            'navigate_to_page', 'capture_screen', 'fill_form',
            'submit_form', 'click_element', 'create_activity', 'generate_poster', 'any_query',
            'create_todo_list', 'update_todo_task', 'plan_workflow', 'execute_workflow',
            'create_data_record', 'update_data_record', 'delete_data_record', 'batch_import_data'
        ];
        return legacyFunctionTools.includes(toolName);
    };
    /**
     * 检查是否为旧的UI工具
     */
    ToolLoaderService.prototype.isLegacyUITool = function (toolName) {
        var legacyUITools = ['render_component', 'create_task_list'];
        return legacyUITools.includes(toolName);
    };
    /**
     * 创建旧功能工具的定义（临时兼容）
     */
    ToolLoaderService.prototype.createLegacyFunctionToolDefinition = function (toolName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里暂时返回一个基本的工具定义，后续会被具体的工具文件替换
                return [2 /*return*/, {
                        name: toolName,
                        description: "Legacy function tool: ".concat(toolName),
                        category: 'legacy',
                        weight: 1,
                        parameters: {
                            type: 'object',
                            properties: {},
                            required: []
                        }
                    }];
            });
        });
    };
    /**
     * 创建旧UI工具的定义（临时兼容）
     */
    ToolLoaderService.prototype.createLegacyUIToolDefinition = function (toolName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里暂时返回一个基本的工具定义，后续会被具体的工具文件替换
                return [2 /*return*/, {
                        name: toolName,
                        description: "Legacy UI tool: ".concat(toolName),
                        category: 'legacy',
                        weight: 1,
                        parameters: {
                            type: 'object',
                            properties: {},
                            required: []
                        }
                    }];
            });
        });
    };
    /**
     * 清理缓存
     */
    ToolLoaderService.prototype.clearCache = function () {
        this.toolCache.clear();
        console.log('🧹 [缓存清理] 工具缓存已清理');
    };
    /**
     * 获取缓存统计
     */
    ToolLoaderService.prototype.getCacheStats = function () {
        return {
            size: this.toolCache.size,
            tools: Array.from(this.toolCache.keys())
        };
    };
    return ToolLoaderService;
}());
exports.ToolLoaderService = ToolLoaderService;
