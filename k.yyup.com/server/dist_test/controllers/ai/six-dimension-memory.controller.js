"use strict";
/**
 * 六维记忆系统控制器
 * 提供RESTful API接口
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
var six_dimension_memory_service_1 = require("../../services/memory/six-dimension-memory.service");
var logger_1 = require("../../utils/logger");
var apiResponse_1 = require("../../utils/apiResponse");
var SixDimensionMemoryController = /** @class */ (function () {
    function SixDimensionMemoryController() {
        this.memorySystem = (0, six_dimension_memory_service_1.getMemorySystem)();
    }
    /**
     * 主动检索记忆
     * POST /api/ai/memory/retrieve
     */
    SixDimensionMemoryController.prototype.activeRetrieval = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, query, context, limit, userId, results, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = req.body, query = _b.query, context = _b.context, limit = _b.limit;
                        userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'default';
                        return [4 /*yield*/, this.memorySystem.activeRetrieval(query, __assign(__assign({}, context), { userId: userId }))];
                    case 1:
                        results = _c.sent();
                        apiResponse_1.ApiResponse.success(res, results, '记忆检索成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        logger_1.logger.error('记忆检索失败:', error_1);
                        next(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录对话
     * POST /api/ai/memory/conversation
     */
    SixDimensionMemoryController.prototype.recordConversation = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, actor, message, context, userId, event_1, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = req.body, actor = _b.actor, message = _b.message, context = _b.context;
                        userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'default';
                        return [4 /*yield*/, this.memorySystem.recordConversation(actor, message, __assign(__assign({}, context), { userId: userId }))];
                    case 1:
                        event_1 = _c.sent();
                        apiResponse_1.ApiResponse.success(res, event_1, '对话记录成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _c.sent();
                        logger_1.logger.error('记录对话失败:', error_2);
                        next(error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取核心记忆
     * GET /api/ai/memory/core/:userId
     */
    SixDimensionMemoryController.prototype.getCoreMemory = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, coreMemory, newCore, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        userId = req.params.userId || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'default';
                        return [4 /*yield*/, this.memorySystem.getCore().search(userId.toString(), 1)];
                    case 1:
                        coreMemory = _b.sent();
                        if (!(coreMemory.length === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.memorySystem.getCore().create({
                                persona: {
                                    id: '',
                                    label: 'persona',
                                    value: '我是YY-AI智能助手，专业的幼儿园管理顾问。我具备丰富的教育管理知识和AI技术能力。',
                                    limit: 2000,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                },
                                human: {
                                    id: '',
                                    label: 'human',
                                    value: "\u7528\u6237ID: ".concat(userId),
                                    limit: 2000,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                },
                                metadata: { userId: userId }
                            })];
                    case 2:
                        newCore = _b.sent();
                        apiResponse_1.ApiResponse.success(res, newCore, '核心记忆初始化成功');
                        return [3 /*break*/, 4];
                    case 3:
                        apiResponse_1.ApiResponse.success(res, coreMemory[0], '获取核心记忆成功');
                        _b.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_3 = _b.sent();
                        logger_1.logger.error('获取核心记忆失败:', error_3);
                        next(error_3);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新核心记忆
     * PUT /api/ai/memory/core/:userId
     */
    SixDimensionMemoryController.prototype.updateCoreMemory = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, _b, blockLabel, content, append, coreMemory, updated, error_4;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 6, , 7]);
                        userId = req.params.userId || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'default';
                        _b = req.body, blockLabel = _b.blockLabel, content = _b.content, append = _b.append;
                        return [4 /*yield*/, this.memorySystem.getCore().search(userId.toString(), 1)];
                    case 1:
                        coreMemory = _d.sent();
                        if (coreMemory.length === 0) {
                            return [2 /*return*/, next(new Error('核心记忆不存在'))];
                        }
                        if (!append) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.memorySystem.getCore().appendToBlock(coreMemory[0].id, blockLabel, content)];
                    case 2:
                        _d.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.memorySystem.getCore().update(coreMemory[0].id, (_c = {},
                            _c[blockLabel] = __assign(__assign({}, coreMemory[0][blockLabel]), { value: content, updated_at: new Date() }),
                            _c))];
                    case 4:
                        updated = _d.sent();
                        apiResponse_1.ApiResponse.success(res, updated, '核心记忆更新成功');
                        _d.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_4 = _d.sent();
                        logger_1.logger.error('更新核心记忆失败:', error_4);
                        next(error_4);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取情节记忆
     * GET /api/ai/memory/episodic
     */
    SixDimensionMemoryController.prototype.getEpisodicMemory = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, userId, startDate, endDate, eventType_1, _c, limit, userIdStr, events, start_1, end_1, error_5;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _b = req.query, userId = _b.userId, startDate = _b.startDate, endDate = _b.endDate, eventType_1 = _b.eventType, _c = _b.limit, limit = _c === void 0 ? 20 : _c;
                        userIdStr = userId || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'default';
                        return [4 /*yield*/, this.memorySystem.getEpisodic().getAll()];
                    case 1:
                        events = _d.sent();
                        // 过滤
                        if (eventType_1) {
                            events = events.filter(function (e) { return e.event_type === eventType_1; });
                        }
                        if (startDate) {
                            start_1 = new Date(startDate);
                            events = events.filter(function (e) { return e.occurred_at >= start_1; });
                        }
                        if (endDate) {
                            end_1 = new Date(endDate);
                            events = events.filter(function (e) { return e.occurred_at <= end_1; });
                        }
                        // 排序并限制数量
                        events = events
                            .sort(function (a, b) { return b.occurred_at.getTime() - a.occurred_at.getTime(); })
                            .slice(0, parseInt(limit));
                        apiResponse_1.ApiResponse.success(res, events, '获取情节记忆成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _d.sent();
                        logger_1.logger.error('获取情节记忆失败:', error_5);
                        next(error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建情节记忆
     * POST /api/ai/memory/episodic
     */
    SixDimensionMemoryController.prototype.createEpisodicMemory = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, eventData, event_2, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'default';
                        eventData = __assign(__assign({}, req.body), { metadata: __assign(__assign({}, req.body.metadata), { userId: userId }) });
                        return [4 /*yield*/, this.memorySystem.getEpisodic().create(eventData)];
                    case 1:
                        event_2 = _b.sent();
                        apiResponse_1.ApiResponse.success(res, event_2, '创建情节记忆成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _b.sent();
                        logger_1.logger.error('创建情节记忆失败:', error_6);
                        next(error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 搜索语义记忆
     * GET /api/ai/memory/semantic/search
     */
    SixDimensionMemoryController.prototype.searchSemanticMemory = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, query, _b, limit, concepts, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = req.query, query = _a.query, _b = _a.limit, limit = _b === void 0 ? 10 : _b;
                        if (!query) {
                            return [2 /*return*/, next(new Error('查询参数不能为空'))];
                        }
                        return [4 /*yield*/, this.memorySystem.getSemantic().search(query, parseInt(limit))];
                    case 1:
                        concepts = _c.sent();
                        apiResponse_1.ApiResponse.success(res, concepts, '搜索语义记忆成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _c.sent();
                        logger_1.logger.error('搜索语义记忆失败:', error_7);
                        next(error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建语义概念
     * POST /api/ai/memory/semantic
     */
    SixDimensionMemoryController.prototype.createSemanticConcept = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, conceptData, concept, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'default';
                        conceptData = __assign(__assign({}, req.body), { metadata: __assign(__assign({}, req.body.metadata), { userId: userId }) });
                        return [4 /*yield*/, this.memorySystem.getSemantic().create(conceptData)];
                    case 1:
                        concept = _b.sent();
                        apiResponse_1.ApiResponse.success(res, concept, '创建语义概念成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _b.sent();
                        logger_1.logger.error('创建语义概念失败:', error_8);
                        next(error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取相关概念
     * GET /api/ai/memory/semantic/:conceptId/related
     */
    SixDimensionMemoryController.prototype.getRelatedConcepts = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var conceptId, _a, depth, related, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        conceptId = req.params.conceptId;
                        _a = req.query.depth, depth = _a === void 0 ? 2 : _a;
                        return [4 /*yield*/, this.memorySystem.getSemantic().findRelated(conceptId, parseInt(depth))];
                    case 1:
                        related = _b.sent();
                        apiResponse_1.ApiResponse.success(res, related, '获取相关概念成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _b.sent();
                        logger_1.logger.error('获取相关概念失败:', error_9);
                        next(error_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取过程步骤
     * GET /api/ai/memory/procedural/:procedureName
     */
    SixDimensionMemoryController.prototype.getProcedureSteps = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var procedureName, steps, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        procedureName = req.params.procedureName;
                        return [4 /*yield*/, this.memorySystem.getProcedural().getProcedure(procedureName)];
                    case 1:
                        steps = _a.sent();
                        apiResponse_1.ApiResponse.success(res, steps, '获取过程步骤成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        logger_1.logger.error('获取过程步骤失败:', error_10);
                        next(error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录过程
     * POST /api/ai/memory/procedural
     */
    SixDimensionMemoryController.prototype.recordProcedure = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, procedureName, steps, userId_1, createdSteps, error_11;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = req.body, procedureName = _b.procedureName, steps = _b.steps;
                        userId_1 = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'default';
                        return [4 /*yield*/, this.memorySystem.recordProcedure(procedureName, steps.map(function (s) { return (__assign(__assign({}, s), { metadata: __assign(__assign({}, s.metadata), { userId: userId_1 }) })); }))];
                    case 1:
                        createdSteps = _c.sent();
                        apiResponse_1.ApiResponse.success(res, createdSteps, '记录过程成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _c.sent();
                        logger_1.logger.error('记录过程失败:', error_11);
                        next(error_11);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 搜索资源
     * GET /api/ai/memory/resource/search
     */
    SixDimensionMemoryController.prototype.searchResources = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, query, tag, _b, limit, resources, error_12;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        _a = req.query, query = _a.query, tag = _a.tag, _b = _a.limit, limit = _b === void 0 ? 10 : _b;
                        resources = void 0;
                        if (!tag) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.memorySystem.getResource().findByTag(tag)];
                    case 1:
                        resources = _c.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!query) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.memorySystem.getResource().search(query, parseInt(limit))];
                    case 3:
                        resources = _c.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.memorySystem.getResource().getAll()];
                    case 5:
                        resources = _c.sent();
                        _c.label = 6;
                    case 6:
                        apiResponse_1.ApiResponse.success(res, resources, '搜索资源成功');
                        return [3 /*break*/, 8];
                    case 7:
                        error_12 = _c.sent();
                        logger_1.logger.error('搜索资源失败:', error_12);
                        next(error_12);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 保存资源
     * POST /api/ai/memory/resource
     */
    SixDimensionMemoryController.prototype.saveResource = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, resourceType, name_1, location_1, summary, tags, userId, resource, error_13;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = req.body, resourceType = _b.resourceType, name_1 = _b.name, location_1 = _b.location, summary = _b.summary, tags = _b.tags;
                        userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'default';
                        return [4 /*yield*/, this.memorySystem.saveResource(resourceType, name_1, location_1, summary, tags)];
                    case 1:
                        resource = _c.sent();
                        apiResponse_1.ApiResponse.success(res, resource, '保存资源成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _c.sent();
                        logger_1.logger.error('保存资源失败:', error_13);
                        next(error_13);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 标记资源已访问
     * PUT /api/ai/memory/resource/:resourceId/access
     */
    SixDimensionMemoryController.prototype.markResourceAccessed = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var resourceId, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        resourceId = req.params.resourceId;
                        return [4 /*yield*/, this.memorySystem.getResource().markAccessed(resourceId)];
                    case 1:
                        _a.sent();
                        apiResponse_1.ApiResponse.success(res, null, '标记访问成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_14 = _a.sent();
                        logger_1.logger.error('标记资源访问失败:', error_14);
                        next(error_14);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 搜索知识库
     * GET /api/ai/memory/knowledge/search
     */
    SixDimensionMemoryController.prototype.searchKnowledge = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, query, domain, _b, limit, entries, error_15;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        _a = req.query, query = _a.query, domain = _a.domain, _b = _a.limit, limit = _b === void 0 ? 10 : _b;
                        entries = void 0;
                        if (!domain) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.memorySystem.getKnowledge().findByDomain(domain)];
                    case 1:
                        entries = _c.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!query) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.memorySystem.getKnowledge().search(query, parseInt(limit))];
                    case 3:
                        entries = _c.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.memorySystem.getKnowledge().getAll()];
                    case 5:
                        entries = _c.sent();
                        _c.label = 6;
                    case 6:
                        apiResponse_1.ApiResponse.success(res, entries, '搜索知识库成功');
                        return [3 /*break*/, 8];
                    case 7:
                        error_15 = _c.sent();
                        logger_1.logger.error('搜索知识库失败:', error_15);
                        next(error_15);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 学习新知识
     * POST /api/ai/memory/knowledge
     */
    SixDimensionMemoryController.prototype.learnKnowledge = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, domain, topic, content, source, confidence, userId, entry, error_16;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = req.body, domain = _b.domain, topic = _b.topic, content = _b.content, source = _b.source, confidence = _b.confidence;
                        userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'default';
                        return [4 /*yield*/, this.memorySystem.learnKnowledge(domain, topic, content, source || userId, confidence)];
                    case 1:
                        entry = _c.sent();
                        apiResponse_1.ApiResponse.success(res, entry, '学习知识成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_16 = _c.sent();
                        logger_1.logger.error('学习知识失败:', error_16);
                        next(error_16);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 验证知识
     * PUT /api/ai/memory/knowledge/:entryId/validate
     */
    SixDimensionMemoryController.prototype.validateKnowledge = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var entryId, confidence, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        entryId = req.params.entryId;
                        confidence = req.body.confidence;
                        return [4 /*yield*/, this.memorySystem.getKnowledge().validate(entryId, confidence)];
                    case 1:
                        _a.sent();
                        apiResponse_1.ApiResponse.success(res, null, '验证知识成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_17 = _a.sent();
                        logger_1.logger.error('验证知识失败:', error_17);
                        next(error_17);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取记忆上下文
     * GET /api/ai/memory/context
     */
    SixDimensionMemoryController.prototype.getMemoryContext = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, limit, context, error_18;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query.limit, limit = _a === void 0 ? 1000 : _a;
                        return [4 /*yield*/, this.memorySystem.getMemoryContext(parseInt(limit))];
                    case 1:
                        context = _b.sent();
                        apiResponse_1.ApiResponse.success(res, context, '获取记忆上下文成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_18 = _b.sent();
                        logger_1.logger.error('获取记忆上下文失败:', error_18);
                        next(error_18);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 压缩历史记忆
     * POST /api/ai/memory/compress
     */
    SixDimensionMemoryController.prototype.compressMemories = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var beforeDate, error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        beforeDate = req.body.beforeDate;
                        if (!beforeDate) {
                            return [2 /*return*/, next(new Error('请提供压缩日期'))];
                        }
                        return [4 /*yield*/, this.memorySystem.compressMemories(new Date(beforeDate))];
                    case 1:
                        _a.sent();
                        apiResponse_1.ApiResponse.success(res, null, '记忆压缩成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_19 = _a.sent();
                        logger_1.logger.error('压缩记忆失败:', error_19);
                        next(error_19);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取记忆统计
     * GET /api/ai/memory/stats
     */
    SixDimensionMemoryController.prototype.getMemoryStats = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var stats, error_20;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        _a = {};
                        return [4 /*yield*/, this.memorySystem.getCore().getAll()];
                    case 1:
                        _a.core = (_b.sent()).length;
                        return [4 /*yield*/, this.memorySystem.getEpisodic().getAll()];
                    case 2:
                        _a.episodic = (_b.sent()).length;
                        return [4 /*yield*/, this.memorySystem.getSemantic().getAll()];
                    case 3:
                        _a.semantic = (_b.sent()).length;
                        return [4 /*yield*/, this.memorySystem.getProcedural().getAll()];
                    case 4:
                        _a.procedural = (_b.sent()).length;
                        return [4 /*yield*/, this.memorySystem.getResource().getAll()];
                    case 5:
                        _a.resource = (_b.sent()).length;
                        return [4 /*yield*/, this.memorySystem.getKnowledge().getAll()];
                    case 6:
                        stats = (_a.knowledge = (_b.sent()).length,
                            _a);
                        apiResponse_1.ApiResponse.success(res, stats, '获取记忆统计成功');
                        return [3 /*break*/, 8];
                    case 7:
                        error_20 = _b.sent();
                        logger_1.logger.error('获取记忆统计失败:', error_20);
                        next(error_20);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return SixDimensionMemoryController;
}());
exports["default"] = new SixDimensionMemoryController();
