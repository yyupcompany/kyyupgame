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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.ToolSelectorService = void 0;
var tool_groups_config_1 = require("../config/tool-groups.config");
var function_mapping_config_1 = require("../config/function-mapping.config");
/**
 * 智能工具选择器 - 基于查询内容和功能意图选择最相关的工具
 */
var ToolSelectorService = /** @class */ (function () {
    function ToolSelectorService() {
    }
    /**
     * 基于功能意图智能选择工具
     */
    ToolSelectorService.prototype.selectToolsByFunction = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var query, userRole, _a, maxTools, queryFeatures, functionIntents, specialMode, selectedGroups, selectedTools, enhancedTools, finalTools;
            return __generator(this, function (_b) {
                query = context.query, userRole = context.userRole, _a = context.maxTools, maxTools = _a === void 0 ? tool_groups_config_1.TOOL_SELECTION_CONFIG.maxToolsPerRequest : _a;
                console.log('🎯 [工具选择器] 开始智能选择工具', { query: query, userRole: userRole, maxTools: maxTools });
                queryFeatures = this.analyzeQueryFeatures(query);
                console.log('🔍 [查询特征分析]', {
                    hasFilters: queryFeatures.hasFilters,
                    hasSorting: queryFeatures.hasSorting,
                    hasStatistics: queryFeatures.hasStatistics,
                    hasJoin: queryFeatures.hasJoin,
                    isComplex: queryFeatures.isComplex
                });
                functionIntents = this.identifyFunctionIntents(query);
                console.log('🧠 [功能识别] 识别到的意图:', functionIntents);
                specialMode = this.detectSpecialMode(query);
                if (specialMode) {
                    console.log('⚡ [特殊模式] 检测到特殊模式:', specialMode);
                    return [2 /*return*/, this.handleSpecialMode(specialMode, functionIntents, userRole)];
                }
                // 🔍 新增：基于查询特征调整工具选择（第二步）
                if (queryFeatures.isComplex) {
                    console.log('⚠️ [复杂查询检测] 查询包含过滤、排序、统计或关联，优先使用any_query');
                    return [2 /*return*/, this.selectComplexQueryTools(userRole, maxTools)];
                }
                selectedGroups = this.selectToolGroups(functionIntents, userRole);
                console.log('📦 [工具组选择] 选中的工具组:', selectedGroups);
                selectedTools = this.selectToolsFromGroups(selectedGroups, query);
                console.log('🔧 [工具选择] 初步选择的工具:', selectedTools);
                enhancedTools = this.applyCombinatioRules(selectedTools, selectedGroups);
                finalTools = this.limitAndPrioritizeTools(enhancedTools, maxTools);
                console.log('✅ [最终选择] 最终选择的工具:', finalTools);
                return [2 /*return*/, finalTools];
            });
        });
    };
    /**
     * 识别查询的功能意图
     */
    ToolSelectorService.prototype.identifyFunctionIntents = function (query) {
        var intents = [];
        for (var _i = 0, _a = Object.entries(function_mapping_config_1.FUNCTION_MAPPING.intentMapping); _i < _a.length; _i++) {
            var _b = _a[_i], intentName = _b[0], config = _b[1];
            var confidence = 0;
            var matchedKeywords = [];
            // 🔍 特殊处理：网络搜索意图需要检查排除模式
            if (intentName === 'web_search' && config.excludePatterns) {
                var shouldExclude = false;
                // 检查是否匹配排除模式
                for (var _c = 0, _d = config.excludePatterns; _c < _d.length; _c++) {
                    var excludePattern = _d[_c];
                    if (excludePattern.test(query)) {
                        console.log("\uD83D\uDEAB [\u641C\u7D22\u610F\u56FE] \u5339\u914D\u6392\u9664\u6A21\u5F0F\uFF0C\u4E0D\u4F7F\u7528\u7F51\u7EDC\u641C\u7D22:", excludePattern);
                        shouldExclude = true;
                        break;
                    }
                }
                // 如果匹配排除模式，跳过此意图
                if (shouldExclude) {
                    console.log("\uD83D\uDCCA [\u641C\u7D22\u610F\u56FE] \u5224\u65AD\u4E3A\u672C\u5730\u6570\u636E\u5E93\u67E5\u8BE2\uFF0C\u4E0D\u4F7F\u7528web_search\u5DE5\u5177");
                    continue;
                }
            }
            // 检查每个模式
            for (var _e = 0, _f = config.patterns; _e < _f.length; _e++) {
                var pattern = _f[_e];
                var matches = query.match(pattern);
                if (matches) {
                    confidence += config.weight;
                    matchedKeywords.push.apply(matchedKeywords, matches);
                }
            }
            if (confidence > 0) {
                // 🔍 特殊处理：网络搜索意图需要额外验证
                if (intentName === 'web_search') {
                    console.log("\uD83D\uDD0D [\u641C\u7D22\u610F\u56FE] \u68C0\u6D4B\u5230\u7F51\u7EDC\u641C\u7D22\u610F\u56FE\uFF0C\u7F6E\u4FE1\u5EA6: ".concat(confidence));
                    console.log("\uD83D\uDD0D [\u641C\u7D22\u610F\u56FE] \u5339\u914D\u7684\u5173\u952E\u8BCD:", matchedKeywords);
                }
                intents.push({
                    category: intentName,
                    confidence: confidence,
                    keywords: matchedKeywords,
                    toolGroups: [config.toolGroup]
                });
            }
        }
        // 按置信度排序
        intents.sort(function (a, b) { return b.confidence - a.confidence; });
        // 如果没有识别到任何意图，默认返回UI展示
        if (intents.length === 0) {
            intents.push({
                category: 'ui_display',
                confidence: 5,
                keywords: [],
                toolGroups: ['uiDisplay']
            });
        }
        return intents;
    };
    /**
     * 检测特殊查询模式
     */
    ToolSelectorService.prototype.detectSpecialMode = function (query) {
        for (var _i = 0, _a = Object.entries(function_mapping_config_1.FUNCTION_MAPPING.specialPatterns); _i < _a.length; _i++) {
            var _b = _a[_i], mode = _b[0], config = _b[1];
            for (var _c = 0, _d = config.patterns; _c < _d.length; _c++) {
                var pattern = _d[_c];
                if (pattern.test(query)) {
                    return mode;
                }
            }
        }
        return null;
    };
    /**
     * 处理特殊模式
     */
    ToolSelectorService.prototype.handleSpecialMode = function (mode, intents, userRole) {
        var config = function_mapping_config_1.FUNCTION_MAPPING.specialPatterns[mode];
        if (config.forceTools) {
            return config.forceTools;
        }
        if (config.preferGroups) {
            var tools = [];
            for (var _i = 0, _a = config.preferGroups; _i < _a.length; _i++) {
                var groupName = _a[_i];
                var group = tool_groups_config_1.FUNCTION_TOOL_GROUPS[groupName];
                if (group && this.hasPermission(groupName, userRole)) {
                    tools.push.apply(tools, group.tools.slice(0, 2)); // 每组最多2个工具
                }
            }
            return tools.slice(0, config.maxTools);
        }
        return [];
    };
    /**
     * 基于功能意图选择工具组
     */
    ToolSelectorService.prototype.selectToolGroups = function (intents, userRole) {
        var allowedGroups = function_mapping_config_1.FUNCTION_MAPPING.rolePermissions[userRole] || ['uiDisplay'];
        var selectedGroups = [];
        for (var _i = 0, intents_1 = intents; _i < intents_1.length; _i++) {
            var intent = intents_1[_i];
            for (var _a = 0, _b = intent.toolGroups; _a < _b.length; _a++) {
                var toolGroup = _b[_a];
                if (allowedGroups.includes(toolGroup) && !selectedGroups.includes(toolGroup)) {
                    selectedGroups.push(toolGroup);
                }
            }
        }
        // 确保至少有一个工具组
        if (selectedGroups.length === 0) {
            selectedGroups.push('uiDisplay');
        }
        return selectedGroups;
    };
    /**
     * 从工具组中选择具体工具
     */
    ToolSelectorService.prototype.selectToolsFromGroups = function (groups, query) {
        var selectedTools = [];
        // 总是包含默认工具
        selectedTools.push.apply(selectedTools, tool_groups_config_1.TOOL_SELECTION_CONFIG.defaultTools);
        for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
            var groupName = groups_1[_i];
            var group = tool_groups_config_1.FUNCTION_TOOL_GROUPS[groupName];
            if (!group)
                continue;
            // 基于查询内容和关键词匹配选择工具
            var relevantTools = this.selectRelevantTools(group, query);
            // 限制每个组的工具数量
            var limitedTools = relevantTools.slice(0, group.maxTools);
            // 避免重复添加
            for (var _a = 0, limitedTools_1 = limitedTools; _a < limitedTools_1.length; _a++) {
                var tool = limitedTools_1[_a];
                if (!selectedTools.includes(tool)) {
                    selectedTools.push(tool);
                }
            }
        }
        return selectedTools;
    };
    /**
     * 选择与查询最相关的工具
     */
    ToolSelectorService.prototype.selectRelevantTools = function (group, query) {
        var _this = this;
        // 计算每个工具与查询的相关性得分
        var toolScores = group.tools.map(function (tool) { return ({
            tool: tool,
            score: _this.calculateRelevanceScore(tool, query, group.keywords)
        }); });
        // 按得分排序并返回
        return toolScores
            .sort(function (a, b) { return b.score - a.score; })
            .map(function (item) { return item.tool; });
    };
    /**
     * 计算工具与查询的相关性得分
     */
    ToolSelectorService.prototype.calculateRelevanceScore = function (tool, query, keywords) {
        var score = 0;
        var lowerQuery = query.toLowerCase();
        // 基于关键词匹配计算得分
        for (var _i = 0, keywords_1 = keywords; _i < keywords_1.length; _i++) {
            var keyword = keywords_1[_i];
            if (lowerQuery.includes(keyword.toLowerCase())) {
                score += 2;
            }
        }
        // 基于工具名称匹配计算得分
        var toolKeywords = tool.split('_');
        for (var _a = 0, toolKeywords_1 = toolKeywords; _a < toolKeywords_1.length; _a++) {
            var keyword = toolKeywords_1[_a];
            if (lowerQuery.includes(keyword.toLowerCase())) {
                score += 3;
            }
        }
        // 基于工具权重
        var toolWeight = tool_groups_config_1.TOOL_SELECTION_CONFIG.toolWeights[tool] || 1;
        score += toolWeight;
        return score;
    };
    /**
     * 应用工具组合规则
     */
    ToolSelectorService.prototype.applyCombinatioRules = function (tools, groups) {
        var enhancedTools = __spreadArray([], tools, true);
        for (var _i = 0, groups_2 = groups; _i < groups_2.length; _i++) {
            var group = groups_2[_i];
            var suggestedGroups = function_mapping_config_1.FUNCTION_MAPPING.combinationRules[group];
            if (suggestedGroups) {
                for (var _a = 0, suggestedGroups_1 = suggestedGroups; _a < suggestedGroups_1.length; _a++) {
                    var suggestedGroup = suggestedGroups_1[_a];
                    var groupConfig = tool_groups_config_1.FUNCTION_TOOL_GROUPS[suggestedGroup];
                    if (groupConfig && groupConfig.tools.length > 0) {
                        var suggestedTool = groupConfig.tools[0];
                        if (!enhancedTools.includes(suggestedTool)) {
                            enhancedTools.push(suggestedTool);
                        }
                    }
                }
            }
        }
        return enhancedTools;
    };
    /**
     * 限制工具数量并按优先级排序
     */
    ToolSelectorService.prototype.limitAndPrioritizeTools = function (tools, maxTools) {
        // 按权重排序
        var sortedTools = tools.sort(function (a, b) {
            var weightA = tool_groups_config_1.TOOL_SELECTION_CONFIG.toolWeights[a] || 0;
            var weightB = tool_groups_config_1.TOOL_SELECTION_CONFIG.toolWeights[b] || 0;
            return weightB - weightA;
        });
        // 限制数量
        return sortedTools.slice(0, maxTools);
    };
    /**
     * 检查用户权限
     */
    ToolSelectorService.prototype.hasPermission = function (groupName, userRole) {
        var allowedGroups = function_mapping_config_1.FUNCTION_MAPPING.rolePermissions[userRole] || [];
        return allowedGroups.includes(groupName);
    };
    /**
     * 🔍 新增：分析查询特征（根本性修复）
     * 判断查询是否包含过滤、排序、统计、关联等复杂条件
     */
    ToolSelectorService.prototype.analyzeQueryFeatures = function (query) {
        // 检测过滤条件
        var filterPatterns = [
            /过滤|筛选|条件/,
            /性别.*[男女]/,
            /年龄.*\d+/,
            /班级.*[大中小]/,
            /状态.*[在职|请假|离职]/,
            /[男女]生/,
            /大班|中班|小班/,
            /在职|请假|离职/
        ];
        var hasFilters = filterPatterns.some(function (pattern) { return pattern.test(query); });
        // 检测排序要求
        var sortingPatterns = [
            /排序|从高到低|从低到高|升序|降序/,
            /按.*排序/,
            /按.*从/,
            /最新|最旧|最多|最少/
        ];
        var hasSorting = sortingPatterns.some(function (pattern) { return pattern.test(query); });
        // 检测统计计算
        var statsPatterns = [
            /统计|求和|平均|最大|最小|总数|数量/,
            /有多少|多少个|共.*个/,
            /占比|百分比|比例/
        ];
        var hasStatistics = statsPatterns.some(function (pattern) { return pattern.test(query); });
        // 检测多表关联
        var joinPatterns = [
            /及其|和|关联|对应|对应的/,
            /学生.*班级|班级.*学生/,
            /教师.*课程|课程.*教师/
        ];
        var hasJoin = joinPatterns.some(function (pattern) { return pattern.test(query); });
        // 判断是否为复杂查询
        var isComplex = hasFilters || hasSorting || hasStatistics || hasJoin;
        return {
            hasFilters: hasFilters,
            hasSorting: hasSorting,
            hasStatistics: hasStatistics,
            hasJoin: hasJoin,
            isComplex: isComplex
        };
    };
    /**
     * 🔍 新增：复杂查询工具选择
     * 对于包含过滤、排序、统计等复杂条件的查询，优先使用any_query
     */
    ToolSelectorService.prototype.selectComplexQueryTools = function (userRole, maxTools) {
        console.log('🎯 [复杂查询工具选择] 优先使用any_query工具');
        var tools = [];
        // 总是包含render_component用于展示结果
        tools.push('render_component');
        // 优先添加any_query（复杂查询工具）
        tools.push('any_query');
        // 可选：添加其他辅助工具
        if (tools.length < maxTools) {
            tools.push('query_past_activities');
        }
        if (tools.length < maxTools) {
            tools.push('get_activity_statistics');
        }
        console.log('✅ [复杂查询工具选择] 最终选择:', tools.slice(0, maxTools));
        return tools.slice(0, maxTools);
    };
    return ToolSelectorService;
}());
exports.ToolSelectorService = ToolSelectorService;
