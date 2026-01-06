"use strict";
/**
 * 语义检索服务
 * 实现向量检索和语义匹配算法，提升AI助手的理解能力
 */
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
exports.semanticSearchService = exports.SemanticSearchService = void 0;
var logger_1 = require("../../utils/logger");
/**
 * 语义检索服务
 */
var SemanticSearchService = /** @class */ (function () {
    function SemanticSearchService() {
        this.entityVectors = new Map();
        this.queryCache = new Map();
        this.CACHE_TTL = 30 * 60 * 1000; // 30分钟缓存
        this.MAX_CACHE_SIZE = 1000;
        this.initializeEntityVectors();
        this.startCacheCleanup();
    }
    /**
     * 初始化实体向量索引
     */
    SemanticSearchService.prototype.initializeEntityVectors = function () {
        // 学生相关实体
        this.addEntityVector('student_info', '学生', 'student', ['学生', '小朋友', '孩子', '幼儿', '儿童', '姓名', '信息'], 0.9);
        this.addEntityVector('student_count', '学生数量', 'student', ['总数', '数量', '多少', '统计', '人数'], 0.8);
        this.addEntityVector('student_age', '学生年龄', 'student', ['年龄', '岁', '大班', '中班', '小班'], 0.7);
        // 教师相关实体
        this.addEntityVector('teacher_info', '教师', 'teacher', ['教师', '老师', '班主任', '教职工', '员工'], 0.9);
        this.addEntityVector('teacher_schedule', '教师课表', 'teacher', ['课表', '排课', '时间表', '安排'], 0.8);
        // 活动相关实体
        this.addEntityVector('activity_list', '活动列表', 'activity', ['活动', '课程', '游戏', '项目', '课堂'], 0.9);
        this.addEntityVector('activity_today', '今日活动', 'activity', ['今天', '今日', '当天', '现在'], 0.8);
        this.addEntityVector('activity_registration', '活动报名', 'activity', ['报名', '参加', '注册', '登记'], 0.7);
        // 考勤相关实体
        this.addEntityVector('attendance_stats', '考勤统计', 'attendance', ['考勤', '出勤', '签到', '到校', '缺勤'], 0.9);
        this.addEntityVector('attendance_today', '今日考勤', 'attendance', ['今天', '今日', '当天'], 0.8);
        // 费用相关实体
        this.addEntityVector('fee_stats', '费用统计', 'fee', ['费用', '学费', '收费', '缴费', '账单'], 0.9);
        this.addEntityVector('fee_payment', '缴费管理', 'fee', ['缴费', '付款', '支付', '收款'], 0.8);
        logger_1.logger.info('🔍 [语义检索] 实体向量索引初始化完成', {
            entityCount: this.entityVectors.size
        });
    };
    /**
     * 添加实体向量
     */
    SemanticSearchService.prototype.addEntityVector = function (id, entity, category, keywords, weight) {
        // 简化的向量化：基于关键词生成向量
        var vector = this.generateSimpleVector(keywords);
        this.entityVectors.set(id, {
            id: id,
            entity: entity,
            category: category,
            vector: vector,
            keywords: keywords,
            weight: weight,
            lastUpdated: new Date()
        });
    };
    /**
     * 生成简化向量（基于关键词）
     */
    SemanticSearchService.prototype.generateSimpleVector = function (keywords) {
        // 创建100维向量
        var vector = new Array(100).fill(0);
        keywords.forEach(function (keyword, index) {
            // 基于关键词的字符编码生成向量值
            for (var i = 0; i < keyword.length; i++) {
                var charCode = keyword.charCodeAt(i);
                var vectorIndex = (charCode + index * 7) % 100;
                vector[vectorIndex] += 0.1;
            }
        });
        // 归一化向量
        var magnitude = Math.sqrt(vector.reduce(function (sum, val) { return sum + val * val; }, 0));
        return magnitude > 0 ? vector.map(function (val) { return val / magnitude; }) : vector;
    };
    /**
     * 执行语义检索
     */
    SemanticSearchService.prototype.performSemanticSearch = function (query, limit) {
        if (limit === void 0) { limit = 5; }
        return __awaiter(this, void 0, void 0, function () {
            var startTime, cached, queryVector, matches, _i, _a, _b, id, entityVector, similarity, matchedKeywords, keywordBonus, finalSimilarity, sortedMatches, processingTime;
            return __generator(this, function (_c) {
                startTime = Date.now();
                logger_1.logger.info('🔍 [语义检索] 开始检索', { query: query, limit: limit });
                cached = this.getFromCache(query);
                if (cached) {
                    logger_1.logger.info('⚡ [语义检索] 缓存命中', {
                        query: query,
                        resultCount: cached.length,
                        processingTime: Date.now() - startTime
                    });
                    return [2 /*return*/, cached];
                }
                queryVector = this.generateQueryVector(query);
                matches = [];
                // 计算与所有实体的相似度
                for (_i = 0, _a = this.entityVectors; _i < _a.length; _i++) {
                    _b = _a[_i], id = _b[0], entityVector = _b[1];
                    similarity = this.calculateCosineSimilarity(queryVector, entityVector.vector);
                    matchedKeywords = this.findMatchedKeywords(query, entityVector.keywords);
                    if (similarity > 0.1 || matchedKeywords.length > 0) {
                        keywordBonus = matchedKeywords.length * 0.2;
                        finalSimilarity = Math.min(similarity + keywordBonus, 1.0);
                        matches.push({
                            entity: entityVector.entity,
                            category: entityVector.category,
                            similarity: finalSimilarity,
                            confidence: finalSimilarity * entityVector.weight,
                            matchedKeywords: matchedKeywords,
                            suggestedAction: this.getSuggestedAction(entityVector.category, entityVector.id)
                        });
                    }
                }
                sortedMatches = matches
                    .sort(function (a, b) { return b.confidence - a.confidence; })
                    .slice(0, limit);
                // 缓存结果
                this.addToCache(query, sortedMatches);
                processingTime = Date.now() - startTime;
                logger_1.logger.info('✅ [语义检索] 检索完成', {
                    query: query,
                    resultCount: sortedMatches.length,
                    processingTime: processingTime
                });
                return [2 /*return*/, sortedMatches];
            });
        });
    };
    /**
     * 生成查询向量
     */
    SemanticSearchService.prototype.generateQueryVector = function (query) {
        var words = query.toLowerCase().split(/\s+/);
        return this.generateSimpleVector(words);
    };
    /**
     * 计算余弦相似度
     */
    SemanticSearchService.prototype.calculateCosineSimilarity = function (vectorA, vectorB) {
        if (vectorA.length !== vectorB.length)
            return 0;
        var dotProduct = 0;
        var magnitudeA = 0;
        var magnitudeB = 0;
        for (var i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            magnitudeA += vectorA[i] * vectorA[i];
            magnitudeB += vectorB[i] * vectorB[i];
        }
        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);
        if (magnitudeA === 0 || magnitudeB === 0)
            return 0;
        return dotProduct / (magnitudeA * magnitudeB);
    };
    /**
     * 查找匹配的关键词
     */
    SemanticSearchService.prototype.findMatchedKeywords = function (query, keywords) {
        var queryLower = query.toLowerCase();
        return keywords.filter(function (keyword) {
            return queryLower.includes(keyword.toLowerCase()) ||
                keyword.toLowerCase().includes(queryLower);
        });
    };
    /**
     * 获取建议动作
     */
    SemanticSearchService.prototype.getSuggestedAction = function (category, entityId) {
        var actionMap = {
            'student_count': 'count_students',
            'teacher_info': 'count_teachers',
            'activity_today': 'get_today_activities',
            'attendance_stats': 'get_attendance_stats',
            'fee_stats': 'get_fee_stats'
        };
        return actionMap[entityId] || "search_".concat(category);
    };
    /**
     * 从缓存获取结果
     */
    SemanticSearchService.prototype.getFromCache = function (query) {
        var cached = this.queryCache.get(query.toLowerCase());
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            cached.hitCount++;
            return cached.results;
        }
        if (cached) {
            this.queryCache["delete"](query.toLowerCase());
        }
        return null;
    };
    /**
     * 添加到缓存
     */
    SemanticSearchService.prototype.addToCache = function (query, results) {
        // 如果缓存已满，删除最旧的项
        if (this.queryCache.size >= this.MAX_CACHE_SIZE) {
            var oldestKey = Array.from(this.queryCache.entries())
                .sort(function (a, b) { return a[1].timestamp - b[1].timestamp; })[0][0];
            this.queryCache["delete"](oldestKey);
        }
        this.queryCache.set(query.toLowerCase(), {
            query: query,
            results: results,
            timestamp: Date.now(),
            hitCount: 0
        });
    };
    /**
     * 启动缓存清理
     */
    SemanticSearchService.prototype.startCacheCleanup = function () {
        var _this = this;
        setInterval(function () {
            var now = Date.now();
            var expiredKeys = [];
            for (var _i = 0, _a = _this.queryCache; _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], item = _b[1];
                if (now - item.timestamp > _this.CACHE_TTL) {
                    expiredKeys.push(key);
                }
            }
            expiredKeys.forEach(function (key) { return _this.queryCache["delete"](key); });
            if (expiredKeys.length > 0) {
                logger_1.logger.info('🧹 [语义检索] 缓存清理完成', {
                    expiredCount: expiredKeys.length,
                    remainingCount: _this.queryCache.size
                });
            }
        }, 5 * 60 * 1000); // 每5分钟清理一次
    };
    /**
     * 获取缓存统计
     */
    SemanticSearchService.prototype.getCacheStats = function () {
        var totalQueries = 0;
        var totalHits = 0;
        for (var _i = 0, _a = this.queryCache.values(); _i < _a.length; _i++) {
            var item = _a[_i];
            totalQueries++;
            totalHits += item.hitCount;
        }
        return {
            size: this.queryCache.size,
            hitRate: totalQueries > 0 ? (totalHits / totalQueries) * 100 : 0,
            totalQueries: totalQueries,
            totalHits: totalHits
        };
    };
    /**
     * 获取实体统计
     */
    SemanticSearchService.prototype.getEntityStats = function () {
        var categoryCounts = {};
        for (var _i = 0, _a = this.entityVectors.values(); _i < _a.length; _i++) {
            var entity = _a[_i];
            categoryCounts[entity.category] = (categoryCounts[entity.category] || 0) + 1;
        }
        return {
            totalEntities: this.entityVectors.size,
            categoryCounts: categoryCounts
        };
    };
    return SemanticSearchService;
}());
exports.SemanticSearchService = SemanticSearchService;
// 导出服务实例
exports.semanticSearchService = new SemanticSearchService();
