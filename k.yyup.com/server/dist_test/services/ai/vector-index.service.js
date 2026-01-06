"use strict";
/**
 * 向量索引管理服务
 * 管理实体向量索引的构建、更新和优化
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
exports.vectorIndexService = exports.VectorIndexService = void 0;
var logger_1 = require("../../utils/logger");
var student_model_1 = require("../../models/student.model");
var teacher_model_1 = require("../../models/teacher.model");
var activity_model_1 = require("../../models/activity.model");
/**
 * 向量索引管理服务
 */
var VectorIndexService = /** @class */ (function () {
    function VectorIndexService() {
        this.vectorIndex = new Map();
        this.updateTimer = null;
        this.isBuilding = false;
        this.config = {
            vectorDimension: 128,
            updateInterval: 60 * 60 * 1000,
            maxIndexSize: 10000,
            enableAutoUpdate: true
        };
        this.initializeIndex();
    }
    /**
     * 初始化索引
     */
    VectorIndexService.prototype.initializeIndex = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.info('🔧 [向量索引] 开始初始化索引');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.buildFullIndex()];
                    case 2:
                        _a.sent();
                        if (this.config.enableAutoUpdate) {
                            this.startAutoUpdate();
                        }
                        logger_1.logger.info('✅ [向量索引] 索引初始化完成', {
                            indexSize: this.vectorIndex.size,
                            autoUpdate: this.config.enableAutoUpdate
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        logger_1.logger.error('❌ [向量索引] 索引初始化失败', {
                            error: error_1 instanceof Error ? error_1.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 构建完整索引
     */
    VectorIndexService.prototype.buildFullIndex = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, buildTime, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isBuilding) {
                            logger_1.logger.warn('⚠️ [向量索引] 索引构建中，跳过重复构建');
                            return [2 /*return*/];
                        }
                        this.isBuilding = true;
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        logger_1.logger.info('🔨 [向量索引] 开始构建完整索引');
                        // 清空现有索引
                        this.vectorIndex.clear();
                        // 构建学生索引
                        return [4 /*yield*/, this.buildStudentIndex()];
                    case 2:
                        // 构建学生索引
                        _a.sent();
                        // 构建教师索引
                        return [4 /*yield*/, this.buildTeacherIndex()];
                    case 3:
                        // 构建教师索引
                        _a.sent();
                        // 构建活动索引
                        return [4 /*yield*/, this.buildActivityIndex()];
                    case 4:
                        // 构建活动索引
                        _a.sent();
                        buildTime = Date.now() - startTime;
                        logger_1.logger.info('✅ [向量索引] 完整索引构建完成', {
                            indexSize: this.vectorIndex.size,
                            buildTime: "".concat(buildTime, "ms")
                        });
                        return [3 /*break*/, 7];
                    case 5:
                        error_2 = _a.sent();
                        logger_1.logger.error('❌ [向量索引] 索引构建失败', {
                            error: error_2 instanceof Error ? error_2.message : '未知错误'
                        });
                        throw error_2;
                    case 6:
                        this.isBuilding = false;
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 构建学生索引
     */
    VectorIndexService.prototype.buildStudentIndex = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var students, _i, students_1, student, indexItem, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, student_model_1.Student.findAll({
                                where: { status: 'active' },
                                limit: 1000 // 限制数量避免内存问题
                            })];
                    case 1:
                        students = _b.sent();
                        for (_i = 0, students_1 = students; _i < students_1.length; _i++) {
                            student = students_1[_i];
                            indexItem = {
                                id: "student_".concat(student.id),
                                type: 'student',
                                name: student.name,
                                description: "\u5B66\u751F ".concat(student.name, "\uFF0C\u5E74\u9F84 ").concat(student.age || '未知', "\u5C81"),
                                vector: this.generateEntityVector(student.name, ((_a = student.age) === null || _a === void 0 ? void 0 : _a.toString()) || '', student.className || ''),
                                metadata: {
                                    id: student.id,
                                    age: student.age,
                                    className: student.className,
                                    gender: student.gender
                                },
                                lastUpdated: new Date(),
                                searchCount: 0
                            };
                            this.vectorIndex.set(indexItem.id, indexItem);
                        }
                        logger_1.logger.info('📚 [向量索引] 学生索引构建完成', { count: students.length });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        logger_1.logger.error('❌ [向量索引] 学生索引构建失败', {
                            error: error_3 instanceof Error ? error_3.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 构建教师索引
     */
    VectorIndexService.prototype.buildTeacherIndex = function () {
        return __awaiter(this, void 0, void 0, function () {
            var teachers, _i, teachers_1, teacher, indexItem, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, teacher_model_1.Teacher.findAll({
                                where: { status: 'active' },
                                limit: 500
                            })];
                    case 1:
                        teachers = _a.sent();
                        for (_i = 0, teachers_1 = teachers; _i < teachers_1.length; _i++) {
                            teacher = teachers_1[_i];
                            indexItem = {
                                id: "teacher_".concat(teacher.id),
                                type: 'teacher',
                                name: teacher.name,
                                description: "\u6559\u5E08 ".concat(teacher.name, "\uFF0C").concat(teacher.subject || ''),
                                vector: this.generateEntityVector(teacher.name, teacher.subject || '', teacher.department || ''),
                                metadata: {
                                    id: teacher.id,
                                    subject: teacher.subject,
                                    department: teacher.department,
                                    phone: teacher.phone
                                },
                                lastUpdated: new Date(),
                                searchCount: 0
                            };
                            this.vectorIndex.set(indexItem.id, indexItem);
                        }
                        logger_1.logger.info('👩‍🏫 [向量索引] 教师索引构建完成', { count: teachers.length });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        logger_1.logger.error('❌ [向量索引] 教师索引构建失败', {
                            error: error_4 instanceof Error ? error_4.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 构建活动索引
     */
    VectorIndexService.prototype.buildActivityIndex = function () {
        return __awaiter(this, void 0, void 0, function () {
            var activities, _i, activities_1, activity, indexItem, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, activity_model_1.Activity.findAll({
                                where: { status: 'active' },
                                limit: 1000
                            })];
                    case 1:
                        activities = _a.sent();
                        for (_i = 0, activities_1 = activities; _i < activities_1.length; _i++) {
                            activity = activities_1[_i];
                            indexItem = {
                                id: "activity_".concat(activity.id),
                                type: 'activity',
                                name: activity.name,
                                description: "\u6D3B\u52A8 ".concat(activity.name, "\uFF0C").concat(activity.description || ''),
                                vector: this.generateEntityVector(activity.name, activity.description || '', activity.category || ''),
                                metadata: {
                                    id: activity.id,
                                    category: activity.category,
                                    startTime: activity.startTime,
                                    endTime: activity.endTime,
                                    location: activity.location
                                },
                                lastUpdated: new Date(),
                                searchCount: 0
                            };
                            this.vectorIndex.set(indexItem.id, indexItem);
                        }
                        logger_1.logger.info('🎯 [向量索引] 活动索引构建完成', { count: activities.length });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        logger_1.logger.error('❌ [向量索引] 活动索引构建失败', {
                            error: error_5 instanceof Error ? error_5.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成实体向量
     */
    VectorIndexService.prototype.generateEntityVector = function (name, description, category) {
        var text = "".concat(name, " ").concat(description, " ").concat(category).toLowerCase();
        var vector = new Array(this.config.vectorDimension).fill(0);
        // 基于文本内容生成向量
        for (var i = 0; i < text.length; i++) {
            var charCode = text.charCodeAt(i);
            var index = charCode % this.config.vectorDimension;
            vector[index] += 1;
        }
        // 归一化
        var magnitude = Math.sqrt(vector.reduce(function (sum, val) { return sum + val * val; }, 0));
        return magnitude > 0 ? vector.map(function (val) { return val / magnitude; }) : vector;
    };
    /**
     * 搜索相似实体
     */
    VectorIndexService.prototype.searchSimilarEntities = function (query, type, limit) {
        if (limit === void 0) { limit = 10; }
        var queryVector = this.generateEntityVector(query, '', '');
        var results = [];
        for (var _i = 0, _a = this.vectorIndex.values(); _i < _a.length; _i++) {
            var item = _a[_i];
            // 类型过滤
            if (type && item.type !== type)
                continue;
            // 计算相似度
            var similarity = this.calculateCosineSimilarity(queryVector, item.vector);
            if (similarity > 0.1) {
                results.push({ item: item, similarity: similarity });
                // 更新搜索计数
                item.searchCount++;
            }
        }
        // 排序并返回结果
        return results
            .sort(function (a, b) { return b.similarity - a.similarity; })
            .slice(0, limit)
            .map(function (result) { return result.item; });
    };
    /**
     * 计算余弦相似度
     */
    VectorIndexService.prototype.calculateCosineSimilarity = function (vectorA, vectorB) {
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
     * 更新单个实体索引
     */
    VectorIndexService.prototype.updateEntityIndex = function (type, id, data) {
        var indexId = "".concat(type, "_").concat(id);
        var existingItem = this.vectorIndex.get(indexId);
        var indexItem = {
            id: indexId,
            type: type,
            name: data.name || '',
            description: data.description || '',
            vector: this.generateEntityVector(data.name || '', data.description || '', data.category || ''),
            metadata: data,
            lastUpdated: new Date(),
            searchCount: (existingItem === null || existingItem === void 0 ? void 0 : existingItem.searchCount) || 0
        };
        this.vectorIndex.set(indexId, indexItem);
        logger_1.logger.info('🔄 [向量索引] 实体索引已更新', { type: type, id: id, name: data.name });
    };
    /**
     * 删除实体索引
     */
    VectorIndexService.prototype.removeEntityIndex = function (type, id) {
        var indexId = "".concat(type, "_").concat(id);
        var removed = this.vectorIndex["delete"](indexId);
        if (removed) {
            logger_1.logger.info('🗑️ [向量索引] 实体索引已删除', { type: type, id: id });
        }
    };
    /**
     * 启动自动更新
     */
    VectorIndexService.prototype.startAutoUpdate = function () {
        var _this = this;
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        this.updateTimer = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.info('🔄 [向量索引] 开始自动更新索引');
                        return [4 /*yield*/, this.buildFullIndex()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, this.config.updateInterval);
        logger_1.logger.info('⏰ [向量索引] 自动更新已启动', {
            interval: "".concat(this.config.updateInterval / 1000, "\u79D2")
        });
    };
    /**
     * 停止自动更新
     */
    VectorIndexService.prototype.stopAutoUpdate = function () {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
            logger_1.logger.info('⏹️ [向量索引] 自动更新已停止');
        }
    };
    /**
     * 获取索引统计信息
     */
    VectorIndexService.prototype.getIndexStats = function () {
        var typeDistribution = {};
        var totalSearchCount = 0;
        for (var _i = 0, _a = this.vectorIndex.values(); _i < _a.length; _i++) {
            var item = _a[_i];
            typeDistribution[item.type] = (typeDistribution[item.type] || 0) + 1;
            totalSearchCount += item.searchCount;
        }
        return {
            totalItems: this.vectorIndex.size,
            typeDistribution: typeDistribution,
            averageSearchCount: this.vectorIndex.size > 0 ? totalSearchCount / this.vectorIndex.size : 0,
            lastBuildTime: new Date().toISOString(),
            isBuilding: this.isBuilding
        };
    };
    /**
     * 获取热门搜索实体
     */
    VectorIndexService.prototype.getPopularEntities = function (limit) {
        if (limit === void 0) { limit = 10; }
        return Array.from(this.vectorIndex.values())
            .sort(function (a, b) { return b.searchCount - a.searchCount; })
            .slice(0, limit);
    };
    return VectorIndexService;
}());
exports.VectorIndexService = VectorIndexService;
// 导出服务实例
exports.vectorIndexService = new VectorIndexService();
