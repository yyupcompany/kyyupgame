"use strict";
/**
 * 动态上下文管理服务
 * 根据查询复杂度动态调整上下文大小和内容
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
exports.__esModule = true;
exports.dynamicContextService = exports.DynamicContextService = void 0;
var logger_1 = require("../../utils/logger");
/**
 * 动态上下文管理服务
 */
var DynamicContextService = /** @class */ (function () {
    function DynamicContextService() {
        this.contextTemplates = new Map();
        this.contextCache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
        this.initializeContextTemplates();
    }
    /**
     * 初始化上下文模板
     */
    DynamicContextService.prototype.initializeContextTemplates = function () {
        // 最小上下文模板
        this.contextTemplates.set('minimal', "\n\u4F60\u662F\u5E7C\u513F\u56ED\u7BA1\u7406\u7CFB\u7EDF\u7684AI\u52A9\u624B\u3002\u8BF7\u7B80\u6D01\u56DE\u7B54\u7528\u6237\u95EE\u9898\u3002\n\u5F53\u524D\u529F\u80FD\uFF1A\u5B66\u751F\u7BA1\u7406\u3001\u6559\u5E08\u7BA1\u7406\u3001\u6D3B\u52A8\u7BA1\u7406\u3001\u8003\u52E4\u7BA1\u7406\u3001\u8D39\u7528\u7BA1\u7406\u3002\n");
        // 轻量上下文模板
        this.contextTemplates.set('light', "\n\u4F60\u662F\u5E7C\u513F\u56ED\u7BA1\u7406\u7CFB\u7EDF\u7684AI\u52A9\u624B\uFF0C\u4E13\u95E8\u534F\u52A9\u7BA1\u7406\u5E7C\u513F\u56ED\u7684\u65E5\u5E38\u8FD0\u8425\u3002\n\n\u6838\u5FC3\u529F\u80FD\u6A21\u5757\uFF1A\n- \u5B66\u751F\u7BA1\u7406\uFF1A\u5B66\u751F\u4FE1\u606F\u3001\u73ED\u7EA7\u5206\u914D\u3001\u6210\u957F\u8BB0\u5F55\n- \u6559\u5E08\u7BA1\u7406\uFF1A\u6559\u5E08\u4FE1\u606F\u3001\u8BFE\u7A0B\u5B89\u6392\u3001\u5DE5\u4F5C\u8BC4\u4F30\n- \u6D3B\u52A8\u7BA1\u7406\uFF1A\u6D3B\u52A8\u7B56\u5212\u3001\u62A5\u540D\u7BA1\u7406\u3001\u6548\u679C\u8BC4\u4F30\n- \u8003\u52E4\u7BA1\u7406\uFF1A\u5B66\u751F\u8003\u52E4\u3001\u6559\u5E08\u8003\u52E4\u3001\u7EDF\u8BA1\u5206\u6790\n- \u8D39\u7528\u7BA1\u7406\uFF1A\u5B66\u8D39\u6536\u7F34\u3001\u8D39\u7528\u7EDF\u8BA1\u3001\u8D22\u52A1\u62A5\u8868\n\n\u8BF7\u6839\u636E\u7528\u6237\u67E5\u8BE2\u63D0\u4F9B\u51C6\u786E\u3001\u6709\u7528\u7684\u56DE\u7B54\u3002\u5982\u9700\u8DF3\u8F6C\u9875\u9762\uFF0C\u8BF7\u660E\u786E\u8BF4\u660E\u3002\n");
        // 中等上下文模板
        this.contextTemplates.set('moderate', "\n\u4F60\u662F\u5E7C\u513F\u56ED\u7BA1\u7406\u7CFB\u7EDF\u7684\u4E13\u4E1AAI\u52A9\u624B\uFF0C\u5177\u5907\u6DF1\u5EA6\u7684\u5E7C\u513F\u6559\u80B2\u548C\u7BA1\u7406\u77E5\u8BC6\u3002\n\n## \uD83C\uDFAF \u6838\u5FC3\u80FD\u529B\n- \u6570\u636E\u67E5\u8BE2\u4E0E\u5206\u6790\uFF1A\u51C6\u786E\u67E5\u8BE2\u5B66\u751F\u3001\u6559\u5E08\u3001\u6D3B\u52A8\u7B49\u6570\u636E\n- \u667A\u80FD\u5EFA\u8BAE\uFF1A\u57FA\u4E8E\u6570\u636E\u63D0\u4F9B\u4E13\u4E1A\u7684\u7BA1\u7406\u5EFA\u8BAE\n- \u5DE5\u5177\u8C03\u7528\uFF1A\u667A\u80FD\u9009\u62E9\u548C\u4F7F\u7528\u7CFB\u7EDF\u5DE5\u5177\u5B8C\u6210\u590D\u6742\u4EFB\u52A1\n\n## \uD83D\uDCCA \u7CFB\u7EDF\u529F\u80FD\u6A21\u5757\n1. **\u5B66\u751F\u7BA1\u7406**\uFF1A\u6863\u6848\u7BA1\u7406\u3001\u73ED\u7EA7\u5206\u914D\u3001\u6210\u957F\u8BB0\u5F55\n2. **\u6559\u5E08\u7BA1\u7406**\uFF1A\u6559\u5E08\u6863\u6848\u3001\u8BFE\u7A0B\u5B89\u6392\u3001\u7EE9\u6548\u8BC4\u4F30\n3. **\u6D3B\u52A8\u7BA1\u7406**\uFF1A\u6D3B\u52A8\u7B56\u5212\u3001\u62A5\u540D\u7BA1\u7406\u3001\u6548\u679C\u8BC4\u4F30\n4. **\u8003\u52E4\u7BA1\u7406**\uFF1A\u667A\u80FD\u8003\u52E4\u3001\u7EDF\u8BA1\u5206\u6790\u3001\u9884\u8B66\u673A\u5236\n5. **\u8D39\u7528\u7BA1\u7406**\uFF1A\u6536\u8D39\u7BA1\u7406\u3001\u8D22\u52A1\u7EDF\u8BA1\u3001\u5229\u6DA6\u8BC4\u4F30\n\n## \uD83D\uDD27 \u5DE5\u5177\u4F7F\u7528\u539F\u5219\n- \u6570\u636E\u67E5\u8BE2\u7C7B\u95EE\u9898\uFF1A\u4F18\u5148\u4F7F\u7528 query_data \u5DE5\u5177\u83B7\u53D6\u51C6\u786E\u6570\u636E\n- \u754C\u9762\u5C55\u793A\u9700\u6C42\uFF1A\u4F7F\u7528 render_component \u5DE5\u5177\u751F\u6210\u53EF\u89C6\u5316\u7EC4\u4EF6\n- \u590D\u6742\u64CD\u4F5C\u9700\u6C42\uFF1A\u4F7F\u7528\u76F8\u5E94\u7684\u64CD\u4F5C\u5DE5\u5177\u5B8C\u6210\u4EFB\u52A1\n- \u59CB\u7EC8\u57FA\u4E8E\u771F\u5B9E\u6570\u636E\u63D0\u4F9B\u5EFA\u8BAE\uFF0C\u907F\u514D\u4F7F\u7528\u6A21\u62DF\u6570\u636E\n\n## \uD83D\uDCDD \u56DE\u590D\u683C\u5F0F\u8981\u6C42\n- \u4F7F\u7528Markdown\u683C\u5F0F\u7EC4\u7EC7\u5185\u5BB9\n- \u6570\u636E\u5206\u6790\u8981\u6709\u5177\u4F53\u6570\u5B57\u652F\u6491\n- \u63D0\u4F9B\u53EF\u64CD\u4F5C\u7684\u5EFA\u8BAE\u548C\u89E3\u51B3\u65B9\u6848\n- \u5FC5\u8981\u65F6\u8C03\u7528\u5DE5\u5177\u83B7\u53D6\u6700\u65B0\u6570\u636E\n\n\u8BF7\u7ED3\u5408\u5E7C\u513F\u6559\u80B2\u4E13\u4E1A\u77E5\u8BC6\u548C\u7CFB\u7EDF\u5DE5\u5177\uFF0C\u4E3A\u7528\u6237\u63D0\u4F9B\u51C6\u786E\u3001\u4E13\u4E1A\u3001\u5B9E\u7528\u7684\u670D\u52A1\u3002\n");
        // 完整上下文模板
        this.contextTemplates.set('full', "\n\u4F60\u662F\u5E7C\u513F\u56ED\u7BA1\u7406\u7CFB\u7EDF\u7684\u9AD8\u7EA7AI\u52A9\u624B\uFF0C\u62E5\u6709\u4E30\u5BCC\u7684\u5E7C\u513F\u6559\u80B2\u3001\u7BA1\u7406\u5B66\u3001\u5FC3\u7406\u5B66\u77E5\u8BC6\u3002\n\n\u7CFB\u7EDF\u67B6\u6784\u4E0E\u529F\u80FD\uFF1A\n[\u8BE6\u7EC6\u7684\u7CFB\u7EDF\u529F\u80FD\u63CF\u8FF0...]\n\n\u6559\u80B2\u7406\u5FF5\u4E0E\u65B9\u6CD5\uFF1A\n- \u4EE5\u513F\u7AE5\u4E3A\u4E2D\u5FC3\u7684\u6559\u80B2\u7406\u5FF5\n- \u591A\u5143\u667A\u80FD\u7406\u8BBA\u7684\u5E94\u7528\n- \u6E38\u620F\u5316\u5B66\u4E60\u65B9\u6CD5\n- \u5BB6\u56ED\u5171\u80B2\u6A21\u5F0F\n\n\u7BA1\u7406\u6700\u4F73\u5B9E\u8DF5\uFF1A\n- \u6570\u636E\u9A71\u52A8\u7684\u51B3\u7B56\u5236\u5B9A\n- \u6301\u7EED\u6539\u8FDB\u7684\u8D28\u91CF\u7BA1\u7406\n- \u98CE\u9669\u9884\u9632\u4E0E\u5E94\u6025\u5904\u7406\n- \u5BB6\u957F\u6C9F\u901A\u4E0E\u6EE1\u610F\u5EA6\u63D0\u5347\n\n\u8BF7\u8FD0\u7528\u4E13\u4E1A\u77E5\u8BC6\uFF0C\u4E3A\u7528\u6237\u63D0\u4F9B\u6DF1\u5EA6\u5206\u6790\u3001\u6218\u7565\u5EFA\u8BAE\u548C\u521B\u65B0\u89E3\u51B3\u65B9\u6848\u3002\n");
        logger_1.logger.info('📝 [动态上下文] 上下文模板初始化完成', {
            templateCount: this.contextTemplates.size
        });
    };
    /**
     * 构建动态上下文
     */
    DynamicContextService.prototype.buildDynamicContext = function (config, query, userId, conversationHistory, pageContext, userMemory) {
        var startTime = Date.now();
        var cacheKey = this.generateCacheKey(config, query, userId);
        // 检查缓存
        var cached = this.contextCache.get(cacheKey);
        if (cached && this.isCacheValid(cached)) {
            logger_1.logger.info('⚡ [动态上下文] 缓存命中', { cacheKey: cacheKey });
            return cached;
        }
        logger_1.logger.info('🔧 [动态上下文] 开始构建上下文', {
            size: config.size,
            maxTokens: config.maxTokens
        });
        // 获取基础系统提示词
        var baseSystemPrompt = this.contextTemplates.get(config.size) ||
            this.contextTemplates.get('minimal');
        // 构建上下文组件
        var components = [];
        // 1. 系统提示词组件
        components.push({
            name: 'system_prompt',
            content: baseSystemPrompt,
            tokens: this.estimateTokens(baseSystemPrompt),
            priority: 10,
            category: 'system'
        });
        // 2. 历史对话组件
        if (config.includeHistory && conversationHistory && conversationHistory.length > 0) {
            var historyContent = this.buildHistoryContext(conversationHistory, config.size);
            if (historyContent) {
                components.push({
                    name: 'conversation_history',
                    content: historyContent,
                    tokens: this.estimateTokens(historyContent),
                    priority: 7,
                    category: 'history'
                });
            }
        }
        // 3. 用户记忆组件
        if (config.includeMemory && userMemory && userMemory.length > 0) {
            var memoryContent = this.buildMemoryContext(userMemory, config.size);
            if (memoryContent) {
                components.push({
                    name: 'user_memory',
                    content: memoryContent,
                    tokens: this.estimateTokens(memoryContent),
                    priority: 6,
                    category: 'memory'
                });
            }
        }
        // 4. 页面上下文组件
        if (config.includePageContext && pageContext) {
            var pageContent = this.buildPageContext(pageContext, config.size);
            if (pageContent) {
                components.push({
                    name: 'page_context',
                    content: pageContent,
                    tokens: this.estimateTokens(pageContent),
                    priority: 5,
                    category: 'page'
                });
            }
        }
        // 5. 用户档案组件
        if (config.includeUserProfile && userId) {
            var profileContent = this.buildUserProfileContext(userId, config.size);
            if (profileContent) {
                components.push({
                    name: 'user_profile',
                    content: profileContent,
                    tokens: this.estimateTokens(profileContent),
                    priority: 4,
                    category: 'user'
                });
            }
        }
        // 优化和截断上下文
        var optimizedComponents = this.optimizeContext(components, config.maxTokens);
        // 构建最终系统提示词
        var finalSystemPrompt = this.assembleFinalPrompt(optimizedComponents);
        var totalTokens = optimizedComponents.reduce(function (sum, comp) { return sum + comp.tokens; }, 0);
        var truncated = components.length > optimizedComponents.length;
        var builtContext = {
            systemPrompt: finalSystemPrompt,
            components: optimizedComponents,
            totalTokens: totalTokens,
            truncated: truncated,
            config: config
        };
        // 缓存结果
        this.contextCache.set(cacheKey, builtContext);
        var buildTime = Date.now() - startTime;
        logger_1.logger.info('✅ [动态上下文] 上下文构建完成', {
            totalTokens: totalTokens,
            componentCount: optimizedComponents.length,
            truncated: truncated,
            buildTime: buildTime
        });
        return builtContext;
    };
    /**
     * 构建历史对话上下文
     */
    DynamicContextService.prototype.buildHistoryContext = function (history, size) {
        var maxMessages = size === 'minimal' ? 2 : size === 'light' ? 5 : size === 'moderate' ? 10 : 20;
        var recentHistory = history.slice(-maxMessages);
        if (recentHistory.length === 0)
            return '';
        var historyText = recentHistory.map(function (msg) {
            return "".concat(msg.role === 'user' ? '用户' : 'AI', ": ").concat(msg.content);
        }).join('\n');
        return "\n\u6700\u8FD1\u5BF9\u8BDD\u5386\u53F2\uFF1A\n".concat(historyText, "\n");
    };
    /**
     * 构建记忆上下文
     */
    DynamicContextService.prototype.buildMemoryContext = function (memory, size) {
        var maxMemories = size === 'minimal' ? 3 : size === 'light' ? 5 : size === 'moderate' ? 8 : 15;
        var relevantMemories = memory.slice(0, maxMemories);
        if (relevantMemories.length === 0)
            return '';
        var memoryText = relevantMemories.map(function (mem) {
            return "- ".concat(mem.content);
        }).join('\n');
        return "\n\u7528\u6237\u76F8\u5173\u4FE1\u606F\uFF1A\n".concat(memoryText, "\n");
    };
    /**
     * 构建页面上下文
     */
    DynamicContextService.prototype.buildPageContext = function (pageContext, size) {
        if (!pageContext.currentPage)
            return '';
        var context = "\n\u5F53\u524D\u9875\u9762\uFF1A".concat(pageContext.currentPage);
        if (size !== 'minimal' && pageContext.pageData) {
            context += "\n\u9875\u9762\u6570\u636E\uFF1A".concat(JSON.stringify(pageContext.pageData).substring(0, 200));
        }
        return context + '\n';
    };
    /**
     * 构建用户档案上下文
     */
    DynamicContextService.prototype.buildUserProfileContext = function (userId, size) {
        // 这里应该从数据库获取用户信息
        // 简化实现
        return size === 'minimal' ? '' : "\n\u7528\u6237ID\uFF1A".concat(userId, "\n");
    };
    /**
     * 优化上下文组件
     */
    DynamicContextService.prototype.optimizeContext = function (components, maxTokens) {
        // 按优先级排序
        var sortedComponents = components.sort(function (a, b) { return b.priority - a.priority; });
        var optimized = [];
        var currentTokens = 0;
        for (var _i = 0, sortedComponents_1 = sortedComponents; _i < sortedComponents_1.length; _i++) {
            var component = sortedComponents_1[_i];
            if (currentTokens + component.tokens <= maxTokens) {
                optimized.push(component);
                currentTokens += component.tokens;
            }
            else if (component.priority >= 8) {
                // 高优先级组件强制包含，可能需要截断
                var availableTokens = maxTokens - currentTokens;
                if (availableTokens > 50) { // 至少保留50个token
                    var truncatedContent = this.truncateContent(component.content, availableTokens);
                    optimized.push(__assign(__assign({}, component), { content: truncatedContent, tokens: availableTokens }));
                    break;
                }
            }
        }
        return optimized.sort(function (a, b) { return b.priority - a.priority; });
    };
    /**
     * 组装最终提示词
     */
    DynamicContextService.prototype.assembleFinalPrompt = function (components) {
        return components.map(function (comp) { return comp.content; }).join('\n');
    };
    /**
     * 估算Token数量
     */
    DynamicContextService.prototype.estimateTokens = function (text) {
        // 简化的Token估算：中文字符约1.5个token，英文单词约1个token
        var chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
        var englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
        return Math.ceil(chineseChars * 1.5 + englishWords);
    };
    /**
     * 截断内容
     */
    DynamicContextService.prototype.truncateContent = function (content, maxTokens) {
        var estimatedLength = Math.floor(maxTokens / 1.5); // 保守估算
        return content.length > estimatedLength ?
            content.substring(0, estimatedLength) + '...' :
            content;
    };
    /**
     * 生成缓存键
     */
    DynamicContextService.prototype.generateCacheKey = function (config, query, userId) {
        return "".concat(config.size, "_").concat(config.maxTokens, "_").concat(userId || 'anonymous', "_").concat(query.substring(0, 20));
    };
    /**
     * 检查缓存是否有效
     */
    DynamicContextService.prototype.isCacheValid = function (cached) {
        // 简化实现：这里应该检查缓存时间
        return true;
    };
    /**
     * 获取上下文统计
     */
    DynamicContextService.prototype.getContextStats = function () {
        var contexts = Array.from(this.contextCache.values());
        var averageTokens = contexts.length > 0 ?
            contexts.reduce(function (sum, ctx) { return sum + ctx.totalTokens; }, 0) / contexts.length : 0;
        return {
            cacheSize: this.contextCache.size,
            templateCount: this.contextTemplates.size,
            averageTokens: Math.round(averageTokens)
        };
    };
    return DynamicContextService;
}());
exports.DynamicContextService = DynamicContextService;
// 导出服务实例
exports.dynamicContextService = new DynamicContextService();
