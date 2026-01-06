"use strict";
/**
 * 复杂度评估服务
 * 智能评估查询复杂度，动态调整处理策略
 */
exports.__esModule = true;
exports.complexityEvaluatorService = exports.ComplexityEvaluatorService = void 0;
var logger_1 = require("../../utils/logger");
/**
 * 复杂度评估服务
 */
var ComplexityEvaluatorService = /** @class */ (function () {
    function ComplexityEvaluatorService() {
        this.queryPatterns = [];
        this.evaluationHistory = new Map();
        this.HISTORY_LIMIT = 1000;
        this.initializeQueryPatterns();
    }
    /**
     * 初始化查询模式
     */
    ComplexityEvaluatorService.prototype.initializeQueryPatterns = function () {
        this.queryPatterns = [
            // 简单查询模式
            {
                pattern: /^(学生|教师|活动|班级)(总数|数量|多少)$/,
                complexity: 0.1,
                category: 'count',
                description: '简单统计查询'
            },
            {
                pattern: /^(添加|新增|创建)(学生|教师|活动|班级)$/,
                complexity: 0.1,
                category: 'navigation',
                description: '页面导航'
            },
            {
                pattern: /^(今天|今日|当天)(活动|课程|安排)$/,
                complexity: 0.2,
                category: 'daily_query',
                description: '日常查询'
            },
            // 中等复杂度模式
            {
                pattern: /找.*的(学生|教师|老师)/,
                complexity: 0.4,
                category: 'search',
                description: '条件搜索'
            },
            {
                pattern: /(统计|汇总|报表).*数据/,
                complexity: 0.5,
                category: 'statistics',
                description: '数据统计'
            },
            {
                pattern: /(\d+岁|小班|中班|大班).*适合.*活动/,
                complexity: 0.4,
                category: 'recommendation',
                description: '推荐查询'
            },
            // 复杂查询模式
            {
                pattern: /(分析|评估|报告).*并.*(建议|推荐|意见)/,
                complexity: 0.8,
                category: 'analysis',
                description: '分析和建议'
            },
            {
                pattern: /(比较|对比).*趋势/,
                complexity: 0.7,
                category: 'comparison',
                description: '比较分析'
            },
            {
                pattern: /(为什么|如何|怎么).*提高/,
                complexity: 0.9,
                category: 'consultation',
                description: '咨询建议'
            },
            // 专家级查询模式
            {
                pattern: /制定.*计划.*考虑.*因素/,
                complexity: 0.95,
                category: 'planning',
                description: '复杂规划'
            },
            {
                pattern: /预测.*未来.*基于.*历史/,
                complexity: 0.9,
                category: 'prediction',
                description: '预测分析'
            }
        ];
        logger_1.logger.info('🧠 [复杂度评估] 查询模式初始化完成', {
            patternCount: this.queryPatterns.length
        });
    };
    /**
     * 评估查询复杂度
     */
    ComplexityEvaluatorService.prototype.evaluateComplexity = function (query, context) {
        var startTime = Date.now();
        logger_1.logger.info('🔍 [复杂度评估] 开始评估', { query: query });
        // 检查缓存
        var cached = this.evaluationHistory.get(query.toLowerCase());
        if (cached && Date.now() - startTime < 60000) { // 1分钟缓存
            logger_1.logger.info('⚡ [复杂度评估] 缓存命中', { query: query, score: cached.score });
            return cached;
        }
        // 计算各种复杂度因子
        var factors = this.calculateComplexityFactors(query, context);
        // 计算总体复杂度分数
        var score = this.calculateOverallScore(factors);
        console.log("[\u590D\u6742\u5EA6\u8BC4\u4F30] \u6700\u7EC8\u5206\u6570: ".concat(score.toFixed(3)));
        console.log("[\u590D\u6742\u5EA6\u8BC4\u4F30] \u5404\u56E0\u5B50\u8BE6\u60C5:", factors.map(function (f) { return "".concat(f.name, ": ").concat(f.score.toFixed(3), " * ").concat(f.weight, " = ").concat((f.score * f.weight).toFixed(3)); }));
        // 确定复杂度级别
        var level = this.determineComplexityLevel(score);
        // 推荐处理策略
        var recommendedStrategy = this.recommendProcessingStrategy(score, level, factors);
        // 估算资源消耗
        var _a = this.estimateResourceUsage(score, level), estimatedTokens = _a.estimatedTokens, estimatedTime = _a.estimatedTime;
        // 计算置信度
        var confidence = this.calculateConfidence(factors, query);
        var evaluation = {
            score: score,
            level: level,
            factors: factors,
            recommendedStrategy: recommendedStrategy,
            estimatedTokens: estimatedTokens,
            estimatedTime: estimatedTime,
            confidence: confidence
        };
        // 缓存结果
        this.cacheEvaluation(query, evaluation);
        var processingTime = Date.now() - startTime;
        logger_1.logger.info('✅ [复杂度评估] 评估完成', {
            query: query,
            score: score.toFixed(3),
            level: level,
            estimatedTokens: estimatedTokens,
            processingTime: processingTime
        });
        return evaluation;
    };
    /**
     * 计算复杂度因子
     */
    ComplexityEvaluatorService.prototype.calculateComplexityFactors = function (query, context) {
        var factors = [];
        // 1. 查询长度因子
        var lengthScore = Math.min(query.length / 100, 1);
        factors.push({
            name: 'query_length',
            weight: 0.1,
            score: lengthScore,
            description: "\u67E5\u8BE2\u957F\u5EA6: ".concat(query.length, "\u5B57\u7B26")
        });
        // 2. 模式匹配因子
        var patternComplexity = 0.5; // 默认中等复杂度
        var matchedPattern = null;
        for (var _i = 0, _a = this.queryPatterns; _i < _a.length; _i++) {
            var pattern = _a[_i];
            if (pattern.pattern.test(query)) {
                patternComplexity = pattern.complexity;
                matchedPattern = pattern;
                break;
            }
        }
        factors.push({
            name: 'pattern_match',
            weight: 0.3,
            score: patternComplexity,
            description: matchedPattern ?
                "\u5339\u914D\u6A21\u5F0F: ".concat(matchedPattern.description) :
                '未匹配已知模式'
        });
        // 3. 关键词复杂度因子
        var complexKeywords = ['分析', '比较', '预测', '建议', '优化', '评估', '趋势', '为什么', '如何'];
        var toolKeywords = [
            // 原有关键词
            '导航', '跳转', '打开', '截图', '创建', '填写', '操作', '页面',
            // 数据查询关键词
            '查询', '数据库', '报告', '生成', '分析', '统计', '列表', '详细',
            '帮我', '获取', '显示', '展示', '搜索', '筛选', '导出', '所有',
            '信息', '数据', '记录', '内容', '结果', '汇总', '整理', '提取'
        ];
        // 🔍 调试：添加详细的关键词检测日志
        console.log("[\u590D\u6742\u5EA6\u8BC4\u4F30] \uD83D\uDD0D \u8C03\u8BD5\u4FE1\u606F:");
        console.log("[\u590D\u6742\u5EA6\u8BC4\u4F30] \u67E5\u8BE2\u5185\u5BB9: \"".concat(query, "\""));
        console.log("[\u590D\u6742\u5EA6\u8BC4\u4F30] \u67E5\u8BE2\u957F\u5EA6: ".concat(query.length));
        console.log("[\u590D\u6742\u5EA6\u8BC4\u4F30] \u5DE5\u5177\u5173\u952E\u8BCD\u5217\u8868: [".concat(toolKeywords.join(', '), "]"));
        // 检查工具调用关键词（给予更高权重）
        var toolMatches = toolKeywords.filter(function (keyword) {
            var matches = query.includes(keyword);
            console.log("[\u590D\u6742\u5EA6\u8BC4\u4F30] \u68C0\u67E5\u5173\u952E\u8BCD \"".concat(keyword, "\": ").concat(matches ? '✅匹配' : '❌不匹配'));
            return matches;
        });
        var complexMatches = complexKeywords.filter(function (keyword) { return query.includes(keyword); });
        console.log("[\u590D\u6742\u5EA6\u8BC4\u4F30] \uD83C\uDFAF \u5DE5\u5177\u5173\u952E\u8BCD\u5339\u914D\u7ED3\u679C: [".concat(toolMatches.join(', '), "] (\u5171").concat(toolMatches.length, "\u4E2A)"));
        console.log("[\u590D\u6742\u5EA6\u8BC4\u4F30] \uD83C\uDFAF \u590D\u6742\u5173\u952E\u8BCD\u5339\u914D\u7ED3\u679C: [".concat(complexMatches.join(', '), "] (\u5171").concat(complexMatches.length, "\u4E2A)"));
        // 如果包含工具调用关键词，直接设置为高分确保路由到复杂分析
        var keywordScore = 0;
        if (toolMatches.length > 0) {
            keywordScore = 1.0; // 直接设置为最高分
            console.log("[\u590D\u6742\u5EA6\u8BC4\u4F30] \u2705 \u68C0\u6D4B\u5230\u5DE5\u5177\u8C03\u7528\u5173\u952E\u8BCD: ".concat(toolMatches.join(', '), ", \u8BBE\u7F6EkeywordScore=1.0"));
        }
        else {
            keywordScore = Math.min(complexMatches.length * 0.2, 1);
            console.log("[\u590D\u6742\u5EA6\u8BC4\u4F30] \u274C \u672A\u68C0\u6D4B\u5230\u5DE5\u5177\u8C03\u7528\u5173\u952E\u8BCD, keywordScore=".concat(keywordScore));
        }
        factors.push({
            name: 'complex_keywords',
            weight: 0.25,
            score: keywordScore,
            description: "\u5173\u952E\u8BCD\u5339\u914D: \u5DE5\u5177[".concat(toolMatches.join(', ') || '无', "] \u590D\u6742[").concat(complexMatches.join(', ') || '无', "]")
        });
        // 4. 实体数量因子
        var entities = ['学生', '教师', '活动', '班级', '家长', '费用'];
        var entityMatches = entities.filter(function (entity) { return query.includes(entity); });
        var entityScore = Math.min(entityMatches.length * 0.3, 1);
        factors.push({
            name: 'entity_count',
            weight: 0.15,
            score: entityScore,
            description: "\u6D89\u53CA\u5B9E\u4F53: ".concat(entityMatches.join(', ') || '无')
        });
        // 5. 时间复杂度因子
        var timeKeywords = ['历史', '趋势', '变化', '对比', '过去', '未来'];
        var timeMatches = timeKeywords.filter(function (keyword) { return query.includes(keyword); });
        var timeScore = Math.min(timeMatches.length * 0.4, 1);
        factors.push({
            name: 'temporal_complexity',
            weight: 0.2,
            score: timeScore,
            description: "\u65F6\u95F4\u590D\u6742\u5EA6: ".concat(timeMatches.join(', ') || '无时间维度')
        });
        return factors;
    };
    /**
     * 计算总体复杂度分数
     */
    ComplexityEvaluatorService.prototype.calculateOverallScore = function (factors) {
        var weightedSum = 0;
        var totalWeight = 0;
        for (var _i = 0, factors_1 = factors; _i < factors_1.length; _i++) {
            var factor = factors_1[_i];
            weightedSum += factor.score * factor.weight;
            totalWeight += factor.weight;
        }
        return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
    };
    /**
     * 确定复杂度级别
     */
    ComplexityEvaluatorService.prototype.determineComplexityLevel = function (score) {
        if (score < 0.3)
            return 'simple';
        if (score < 0.6)
            return 'moderate';
        if (score < 0.8)
            return 'complex';
        return 'expert';
    };
    /**
     * 推荐处理策略
     */
    ComplexityEvaluatorService.prototype.recommendProcessingStrategy = function (score, level, factors) {
        if (score < 0.2) {
            return {
                level: 'direct',
                contextSize: 'minimal',
                useHistory: false,
                useMemory: false,
                maxTokens: 50
            };
        }
        if (score < 0.3) {
            return {
                level: 'semantic',
                contextSize: 'light',
                useHistory: false,
                useMemory: true,
                maxTokens: 300
            };
        }
        if (score < 0.8) {
            return {
                level: 'ai_light',
                contextSize: 'moderate',
                useHistory: true,
                useMemory: true,
                maxTokens: 1000
            };
        }
        return {
            level: 'ai_full',
            contextSize: 'full',
            useHistory: true,
            useMemory: true,
            maxTokens: 2500
        };
    };
    /**
     * 估算资源消耗
     */
    ComplexityEvaluatorService.prototype.estimateResourceUsage = function (score, level) {
        var baseTokens = 50;
        var baseTime = 100; // 毫秒
        var tokenMultiplier = 1 + score * 40; // 1-41倍
        var timeMultiplier = 1 + score * 50; // 1-51倍
        return {
            estimatedTokens: Math.round(baseTokens * tokenMultiplier),
            estimatedTime: Math.round(baseTime * timeMultiplier)
        };
    };
    /**
     * 计算置信度
     */
    ComplexityEvaluatorService.prototype.calculateConfidence = function (factors, query) {
        // 基于因子的一致性计算置信度
        var scores = factors.map(function (f) { return f.score; });
        var mean = scores.reduce(function (sum, score) { return sum + score; }, 0) / scores.length;
        var variance = scores.reduce(function (sum, score) { return sum + Math.pow(score - mean, 2); }, 0) / scores.length;
        // 方差越小，置信度越高
        var consistencyScore = Math.max(0, 1 - variance);
        // 查询长度也影响置信度
        var lengthConfidence = Math.min(query.length / 20, 1);
        return (consistencyScore * 0.7 + lengthConfidence * 0.3);
    };
    /**
     * 缓存评估结果
     */
    ComplexityEvaluatorService.prototype.cacheEvaluation = function (query, evaluation) {
        if (this.evaluationHistory.size >= this.HISTORY_LIMIT) {
            // 删除最旧的记录
            var firstKey = this.evaluationHistory.keys().next().value;
            this.evaluationHistory["delete"](firstKey);
        }
        this.evaluationHistory.set(query.toLowerCase(), evaluation);
    };
    /**
     * 获取评估统计
     */
    ComplexityEvaluatorService.prototype.getEvaluationStats = function () {
        var evaluations = Array.from(this.evaluationHistory.values());
        var levelDistribution = {};
        var totalScore = 0;
        var totalConfidence = 0;
        for (var _i = 0, evaluations_1 = evaluations; _i < evaluations_1.length; _i++) {
            var evaluation = evaluations_1[_i];
            levelDistribution[evaluation.level] = (levelDistribution[evaluation.level] || 0) + 1;
            totalScore += evaluation.score;
            totalConfidence += evaluation.confidence;
        }
        return {
            totalEvaluations: evaluations.length,
            levelDistribution: levelDistribution,
            averageScore: evaluations.length > 0 ? totalScore / evaluations.length : 0,
            averageConfidence: evaluations.length > 0 ? totalConfidence / evaluations.length : 0
        };
    };
    return ComplexityEvaluatorService;
}());
exports.ComplexityEvaluatorService = ComplexityEvaluatorService;
// 导出服务实例
exports.complexityEvaluatorService = new ComplexityEvaluatorService();
