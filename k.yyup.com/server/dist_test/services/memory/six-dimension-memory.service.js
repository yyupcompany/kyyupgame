"use strict";
/**
 * 六维记忆系统服务
 * 基于MIRIX架构实现的高级记忆管理系统
 *
 * 六个记忆维度：
 * 1. Core Memory - 核心持久记忆
 * 2. Episodic Memory - 事件情节记忆
 * 3. Semantic Memory - 语义概念记忆
 * 4. Procedural Memory - 过程操作记忆
 * 5. Resource Memory - 资源引用记忆
 * 6. Knowledge Vault - 知识库记忆
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.getMemorySystem = exports.MetaMemoryManager = void 0;
var events_1 = require("events");
var uuid_1 = require("uuid");
var logger_1 = require("../../utils/logger");
var six_dimension_memory_model_1 = require("../../models/memory/six-dimension-memory.model");
// ============= 记忆管理器基类 =============
var MemoryManager = /** @class */ (function (_super) {
    __extends(MemoryManager, _super);
    function MemoryManager(dimension) {
        var _this = _super.call(this) || this;
        _this.dimension = dimension;
        _this.memories = new Map();
        _this.embeddings = new Map();
        return _this;
    }
    MemoryManager.prototype.get = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.memories.get(id) || null];
            });
        });
    };
    MemoryManager.prototype.getAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.memories.values())];
            });
        });
    };
    MemoryManager.prototype.generateId = function () {
        return "".concat(this.dimension, "_").concat((0, uuid_1.v4)());
    };
    return MemoryManager;
}(events_1.EventEmitter));
// ============= 具体记忆管理器实现 =============
// 1. 核心记忆管理器
var CoreMemoryManager = /** @class */ (function (_super) {
    __extends(CoreMemoryManager, _super);
    function CoreMemoryManager() {
        return _super.call(this, 'core') || this;
    }
    CoreMemoryManager.prototype.create = function (data) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var dbRecord, memory, error_1;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.CoreMemory.create({
                                user_id: ((_a = data.metadata) === null || _a === void 0 ? void 0 : _a.userId) || 'default',
                                persona_value: ((_b = data.persona) === null || _b === void 0 ? void 0 : _b.value) || '我是YY-AI智能助手，专业的幼儿园管理顾问。',
                                persona_limit: ((_c = data.persona) === null || _c === void 0 ? void 0 : _c.limit) || 2000,
                                human_value: ((_d = data.human) === null || _d === void 0 ? void 0 : _d.value) || '',
                                human_limit: ((_e = data.human) === null || _e === void 0 ? void 0 : _e.limit) || 2000,
                                metadata: data.metadata || {}
                            })];
                    case 1:
                        dbRecord = _f.sent();
                        memory = {
                            id: dbRecord.id,
                            persona: {
                                id: (0, uuid_1.v4)(),
                                label: 'persona',
                                value: dbRecord.persona_value,
                                limit: dbRecord.persona_limit,
                                created_at: dbRecord.created_at,
                                updated_at: dbRecord.updated_at
                            },
                            human: {
                                id: (0, uuid_1.v4)(),
                                label: 'human',
                                value: dbRecord.human_value,
                                limit: dbRecord.human_limit,
                                created_at: dbRecord.created_at,
                                updated_at: dbRecord.updated_at
                            },
                            metadata: dbRecord.metadata
                        };
                        this.memories.set(memory.id, memory);
                        this.emit('created', memory);
                        return [2 /*return*/, memory];
                    case 2:
                        error_1 = _f.sent();
                        logger_1.logger.error('创建核心记忆失败:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CoreMemoryManager.prototype.update = function (id, data) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var affectedCount, dbRecord, updated, error_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.CoreMemory.update({
                                persona_value: (_a = data.persona) === null || _a === void 0 ? void 0 : _a.value,
                                persona_limit: (_b = data.persona) === null || _b === void 0 ? void 0 : _b.limit,
                                human_value: (_c = data.human) === null || _c === void 0 ? void 0 : _c.value,
                                human_limit: (_d = data.human) === null || _d === void 0 ? void 0 : _d.limit,
                                metadata: data.metadata
                            }, {
                                where: { id: id }
                            })];
                    case 1:
                        affectedCount = (_e.sent())[0];
                        if (affectedCount === 0) {
                            throw new Error("Core memory ".concat(id, " not found"));
                        }
                        return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.CoreMemory.findByPk(id)];
                    case 2:
                        dbRecord = _e.sent();
                        if (!dbRecord)
                            throw new Error("Core memory ".concat(id, " not found after update"));
                        updated = {
                            id: dbRecord.id,
                            persona: {
                                id: (0, uuid_1.v4)(),
                                label: 'persona',
                                value: dbRecord.persona_value,
                                limit: dbRecord.persona_limit,
                                created_at: dbRecord.created_at,
                                updated_at: dbRecord.updated_at
                            },
                            human: {
                                id: (0, uuid_1.v4)(),
                                label: 'human',
                                value: dbRecord.human_value,
                                limit: dbRecord.human_limit,
                                created_at: dbRecord.created_at,
                                updated_at: dbRecord.updated_at
                            },
                            metadata: dbRecord.metadata
                        };
                        this.memories.set(id, updated);
                        this.emit('updated', updated);
                        return [2 /*return*/, updated];
                    case 3:
                        error_2 = _e.sent();
                        logger_1.logger.error('更新核心记忆失败:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CoreMemoryManager.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var affectedCount, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.CoreMemory.destroy({
                                where: { id: id }
                            })];
                    case 1:
                        affectedCount = _a.sent();
                        result = affectedCount > 0;
                        if (result) {
                            this.memories["delete"](id);
                            this.emit('deleted', id);
                        }
                        return [2 /*return*/, result];
                    case 2:
                        error_3 = _a.sent();
                        logger_1.logger.error('删除核心记忆失败:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CoreMemoryManager.prototype.search = function (query, limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var dbRecords, results, error_4;
            var _a, _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.CoreMemory.findAll({
                                where: (_a = {},
                                    _a[require('sequelize').Op.or] = [
                                        { persona_value: (_b = {}, _b[require('sequelize').Op.like] = "%".concat(query, "%"), _b) },
                                        { human_value: (_c = {}, _c[require('sequelize').Op.like] = "%".concat(query, "%"), _c) }
                                    ],
                                    _a),
                                limit: limit
                            })];
                    case 1:
                        dbRecords = _d.sent();
                        results = dbRecords.map(function (dbRecord) { return ({
                            id: dbRecord.id,
                            persona: {
                                id: (0, uuid_1.v4)(),
                                label: 'persona',
                                value: dbRecord.persona_value,
                                limit: dbRecord.persona_limit,
                                created_at: dbRecord.created_at,
                                updated_at: dbRecord.updated_at
                            },
                            human: {
                                id: (0, uuid_1.v4)(),
                                label: 'human',
                                value: dbRecord.human_value,
                                limit: dbRecord.human_limit,
                                created_at: dbRecord.created_at,
                                updated_at: dbRecord.updated_at
                            },
                            metadata: dbRecord.metadata
                        }); });
                        // 更新内存缓存
                        results.forEach(function (memory) {
                            _this.memories.set(memory.id, memory);
                        });
                        return [2 /*return*/, results];
                    case 2:
                        error_4 = _d.sent();
                        logger_1.logger.error('搜索核心记忆失败:', error_4);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // 根据用户ID获取核心记忆
    CoreMemoryManager.prototype.getByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var dbRecords, results, error_5;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.CoreMemory.findAll({
                                where: { user_id: userId }
                            })];
                    case 1:
                        dbRecords = _a.sent();
                        results = dbRecords.map(function (dbRecord) { return ({
                            id: dbRecord.id,
                            persona: {
                                id: (0, uuid_1.v4)(),
                                label: 'persona',
                                value: dbRecord.persona_value,
                                limit: dbRecord.persona_limit,
                                created_at: dbRecord.created_at,
                                updated_at: dbRecord.updated_at
                            },
                            human: {
                                id: (0, uuid_1.v4)(),
                                label: 'human',
                                value: dbRecord.human_value,
                                limit: dbRecord.human_limit,
                                created_at: dbRecord.created_at,
                                updated_at: dbRecord.updated_at
                            },
                            metadata: dbRecord.metadata
                        }); });
                        // 更新内存缓存
                        results.forEach(function (memory) {
                            _this.memories.set(memory.id, memory);
                        });
                        return [2 /*return*/, results];
                    case 2:
                        error_5 = _a.sent();
                        logger_1.logger.error('获取用户核心记忆失败:', error_5);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CoreMemoryManager.prototype.appendToBlock = function (memoryId, blockLabel, content) {
        return __awaiter(this, void 0, void 0, function () {
            var memory, block, newValue;
            return __generator(this, function (_a) {
                memory = this.memories.get(memoryId);
                if (!memory)
                    throw new Error("Core memory ".concat(memoryId, " not found"));
                block = memory[blockLabel];
                newValue = block.value + '\n' + content;
                if (newValue.length > block.limit) {
                    throw new Error("Content exceeds block limit of ".concat(block.limit, " characters"));
                }
                block.value = newValue;
                block.updated_at = new Date();
                this.emit('block_updated', { memoryId: memoryId, blockLabel: blockLabel, block: block });
                return [2 /*return*/];
            });
        });
    };
    return CoreMemoryManager;
}(MemoryManager));
// 2. 情节记忆管理器
var EpisodicMemoryManager = /** @class */ (function (_super) {
    __extends(EpisodicMemoryManager, _super);
    function EpisodicMemoryManager() {
        return _super.call(this, 'episodic') || this;
    }
    EpisodicMemoryManager.prototype.create = function (data) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var summary_embedding, details_embedding, dbRecord, event_1, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        summary_embedding = null;
                        details_embedding = null;
                        if (!data.summary) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.generateEmbedding(data.summary)];
                    case 1:
                        summary_embedding = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!data.details) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.generateEmbedding(data.details)];
                    case 3:
                        details_embedding = _b.sent();
                        _b.label = 4;
                    case 4: return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.EpisodicMemory.create({
                            user_id: ((_a = data.metadata) === null || _a === void 0 ? void 0 : _a.userId) || 'default',
                            event_type: data.event_type || 'general',
                            summary: data.summary || '',
                            details: data.details || '',
                            actor: data.actor || 'system',
                            tree_path: data.tree_path || [],
                            occurred_at: data.occurred_at || new Date(),
                            summary_embedding: summary_embedding,
                            details_embedding: details_embedding,
                            metadata: data.metadata || {}
                        })];
                    case 5:
                        dbRecord = _b.sent();
                        event_1 = {
                            id: dbRecord.id,
                            event_type: dbRecord.event_type,
                            summary: dbRecord.summary,
                            details: dbRecord.details,
                            actor: dbRecord.actor,
                            tree_path: dbRecord.tree_path,
                            occurred_at: dbRecord.occurred_at,
                            created_at: dbRecord.created_at,
                            updated_at: dbRecord.updated_at,
                            summary_embedding: dbRecord.summary_embedding,
                            details_embedding: dbRecord.details_embedding,
                            metadata: dbRecord.metadata
                        };
                        this.memories.set(event_1.id, event_1);
                        this.emit('created', event_1);
                        return [2 /*return*/, event_1];
                    case 6:
                        error_6 = _b.sent();
                        logger_1.logger.error('创建情节记忆失败:', error_6);
                        throw error_6;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    EpisodicMemoryManager.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        existing = this.memories.get(id);
                        if (!existing)
                            throw new Error("Episodic event ".concat(id, " not found"));
                        updated = __assign(__assign(__assign({}, existing), data), { updated_at: new Date() });
                        if (!(data.summary && data.summary !== existing.summary)) return [3 /*break*/, 2];
                        _a = updated;
                        return [4 /*yield*/, this.generateEmbedding(data.summary)];
                    case 1:
                        _a.summary_embedding = _c.sent();
                        _c.label = 2;
                    case 2:
                        if (!(data.details && data.details !== existing.details)) return [3 /*break*/, 4];
                        _b = updated;
                        return [4 /*yield*/, this.generateEmbedding(data.details)];
                    case 3:
                        _b.details_embedding = _c.sent();
                        _c.label = 4;
                    case 4:
                        this.memories.set(id, updated);
                        this.emit('updated', updated);
                        return [2 /*return*/, updated];
                }
            });
        });
    };
    EpisodicMemoryManager.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = this.memories["delete"](id);
                if (result)
                    this.emit('deleted', id);
                return [2 /*return*/, result];
            });
        });
    };
    EpisodicMemoryManager.prototype.search = function (query, limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var dbRecords, results, error_7;
            var _a, _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.EpisodicMemory.findAll({
                                where: (_a = {},
                                    _a[require('sequelize').Op.or] = [
                                        { summary: (_b = {}, _b[require('sequelize').Op.like] = "%".concat(query, "%"), _b) },
                                        { details: (_c = {}, _c[require('sequelize').Op.like] = "%".concat(query, "%"), _c) }
                                    ],
                                    _a),
                                limit: limit,
                                order: [['occurred_at', 'DESC']]
                            })];
                    case 1:
                        dbRecords = _d.sent();
                        results = dbRecords.map(function (dbRecord) { return ({
                            id: dbRecord.id,
                            event_type: dbRecord.event_type,
                            summary: dbRecord.summary,
                            details: dbRecord.details,
                            actor: dbRecord.actor,
                            tree_path: dbRecord.tree_path,
                            occurred_at: dbRecord.occurred_at,
                            created_at: dbRecord.created_at,
                            updated_at: dbRecord.updated_at,
                            summary_embedding: dbRecord.summary_embedding,
                            details_embedding: dbRecord.details_embedding,
                            metadata: dbRecord.metadata
                        }); });
                        // 更新内存缓存
                        results.forEach(function (event) {
                            _this.memories.set(event.id, event);
                        });
                        return [2 /*return*/, results];
                    case 2:
                        error_7 = _d.sent();
                        logger_1.logger.error('搜索情节记忆失败:', error_7);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // 根据用户ID获取情节记忆
    EpisodicMemoryManager.prototype.getByUserId = function (userId, limit) {
        if (limit === void 0) { limit = 50; }
        return __awaiter(this, void 0, void 0, function () {
            var dbRecords, results, error_8;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.EpisodicMemory.findAll({
                                where: { user_id: userId },
                                limit: limit,
                                order: [['occurred_at', 'DESC']]
                            })];
                    case 1:
                        dbRecords = _a.sent();
                        results = dbRecords.map(function (dbRecord) { return ({
                            id: dbRecord.id,
                            event_type: dbRecord.event_type,
                            summary: dbRecord.summary,
                            details: dbRecord.details,
                            actor: dbRecord.actor,
                            tree_path: dbRecord.tree_path,
                            occurred_at: dbRecord.occurred_at,
                            created_at: dbRecord.created_at,
                            updated_at: dbRecord.updated_at,
                            summary_embedding: dbRecord.summary_embedding,
                            details_embedding: dbRecord.details_embedding,
                            metadata: dbRecord.metadata
                        }); });
                        // 更新内存缓存
                        results.forEach(function (event) {
                            _this.memories.set(event.id, event);
                        });
                        return [2 /*return*/, results];
                    case 2:
                        error_8 = _a.sent();
                        logger_1.logger.error('获取用户情节记忆失败:', error_8);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EpisodicMemoryManager.prototype.generateEmbedding = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            return __generator(this, function (_a) {
                hash = text.split('').reduce(function (acc, char) { return acc + char.charCodeAt(0); }, 0);
                return [2 /*return*/, Array(384).fill(0).map(function (_, i) { return Math.sin(hash + i) * 0.1; })];
            });
        });
    };
    EpisodicMemoryManager.prototype.cosineSimilarity = function (a, b) {
        var dotProduct = 0;
        var normA = 0;
        var normB = 0;
        for (var i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };
    return EpisodicMemoryManager;
}(MemoryManager));
// 3. 语义记忆管理器
var SemanticMemoryManager = /** @class */ (function (_super) {
    __extends(SemanticMemoryManager, _super);
    function SemanticMemoryManager() {
        var _this = _super.call(this, 'semantic') || this;
        _this.conceptGraph = new Map();
        return _this;
    }
    SemanticMemoryManager.prototype.create = function (data) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var embedding, dbRecord, concept, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        embedding = null;
                        if (!data.description) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.generateEmbedding(data.description)];
                    case 1:
                        embedding = _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.SemanticMemory.create({
                            user_id: ((_a = data.metadata) === null || _a === void 0 ? void 0 : _a.userId) || 'default',
                            name: data.name || '',
                            description: data.description || '',
                            category: data.category || 'general',
                            embedding: embedding,
                            metadata: data.metadata || {}
                        })];
                    case 3:
                        dbRecord = _b.sent();
                        concept = {
                            id: dbRecord.id,
                            name: dbRecord.name,
                            description: dbRecord.description,
                            category: dbRecord.category,
                            relationships: data.relationships || [],
                            metadata: dbRecord.metadata,
                            embedding: dbRecord.embedding
                        };
                        this.memories.set(concept.id, concept);
                        this.updateGraph(concept);
                        this.emit('created', concept);
                        return [2 /*return*/, concept];
                    case 4:
                        error_9 = _b.sent();
                        logger_1.logger.error('创建语义记忆失败:', error_9);
                        throw error_9;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SemanticMemoryManager.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, embedding, updated, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        existing = this.memories.get(id);
                        if (!existing)
                            throw new Error("Semantic concept ".concat(id, " not found"));
                        embedding = existing.embedding;
                        if (!(data.description && data.description !== existing.description)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.generateEmbedding(data.description)];
                    case 1:
                        embedding = _a.sent();
                        _a.label = 2;
                    case 2: 
                    // 更新数据库记录
                    return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.SemanticMemory.update({
                            name: data.name || existing.name,
                            description: data.description || existing.description,
                            category: data.category || existing.category,
                            embedding: embedding,
                            metadata: data.metadata || existing.metadata
                        }, {
                            where: { id: id }
                        })];
                    case 3:
                        // 更新数据库记录
                        _a.sent();
                        updated = __assign(__assign(__assign({}, existing), data), { embedding: embedding });
                        this.memories.set(id, updated);
                        this.updateGraph(updated);
                        this.emit('updated', updated);
                        return [2 /*return*/, updated];
                    case 4:
                        error_10 = _a.sent();
                        logger_1.logger.error('更新语义记忆失败:', error_10);
                        throw error_10;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SemanticMemoryManager.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var concept, result, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        concept = this.memories.get(id);
                        if (concept) {
                            this.removeFromGraph(concept);
                        }
                        // 从数据库删除
                        return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.SemanticMemory.destroy({
                                where: { id: id }
                            })];
                    case 1:
                        // 从数据库删除
                        _a.sent();
                        result = this.memories["delete"](id);
                        if (result)
                            this.emit('deleted', id);
                        return [2 /*return*/, result];
                    case 2:
                        error_11 = _a.sent();
                        logger_1.logger.error('删除语义记忆失败:', error_11);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SemanticMemoryManager.prototype.search = function (query, limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var dbRecords, results, error_12;
            var _a, _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.SemanticMemory.findAll({
                                where: (_a = {},
                                    _a[require('sequelize').Op.or] = [
                                        { name: (_b = {}, _b[require('sequelize').Op.like] = "%".concat(query, "%"), _b) },
                                        { description: (_c = {}, _c[require('sequelize').Op.like] = "%".concat(query, "%"), _c) }
                                    ],
                                    _a),
                                limit: limit
                            })];
                    case 1:
                        dbRecords = _d.sent();
                        results = dbRecords.map(function (dbRecord) { return ({
                            id: dbRecord.id,
                            name: dbRecord.name,
                            description: dbRecord.description,
                            category: dbRecord.category,
                            relationships: [],
                            metadata: dbRecord.metadata,
                            embedding: dbRecord.embedding
                        }); });
                        results.forEach(function (concept) {
                            _this.memories.set(concept.id, concept);
                        });
                        return [2 /*return*/, results];
                    case 2:
                        error_12 = _d.sent();
                        logger_1.logger.error('搜索语义记忆失败:', error_12);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SemanticMemoryManager.prototype.getByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var dbRecords, results, error_13;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.SemanticMemory.findAll({
                                where: { user_id: userId }
                            })];
                    case 1:
                        dbRecords = _a.sent();
                        results = dbRecords.map(function (dbRecord) { return ({
                            id: dbRecord.id,
                            name: dbRecord.name,
                            description: dbRecord.description,
                            category: dbRecord.category,
                            relationships: [],
                            metadata: dbRecord.metadata,
                            embedding: dbRecord.embedding
                        }); });
                        results.forEach(function (concept) {
                            _this.memories.set(concept.id, concept);
                        });
                        return [2 /*return*/, results];
                    case 2:
                        error_13 = _a.sent();
                        logger_1.logger.error('获取用户语义记忆失败:', error_13);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SemanticMemoryManager.prototype.findRelated = function (conceptId, depth) {
        if (depth === void 0) { depth = 2; }
        return __awaiter(this, void 0, void 0, function () {
            var visited, queue, results, _a, id, level, concept, _i, _b, rel;
            return __generator(this, function (_c) {
                visited = new Set();
                queue = [{ id: conceptId, level: 0 }];
                results = [];
                while (queue.length > 0) {
                    _a = queue.shift(), id = _a.id, level = _a.level;
                    if (visited.has(id) || level > depth)
                        continue;
                    visited.add(id);
                    concept = this.memories.get(id);
                    if (concept && id !== conceptId) {
                        results.push(concept);
                    }
                    if (concept && level < depth) {
                        for (_i = 0, _b = concept.relationships; _i < _b.length; _i++) {
                            rel = _b[_i];
                            queue.push({ id: rel.target_id, level: level + 1 });
                        }
                    }
                }
                return [2 /*return*/, results];
            });
        });
    };
    SemanticMemoryManager.prototype.updateGraph = function (concept) {
        if (!this.conceptGraph.has(concept.id)) {
            this.conceptGraph.set(concept.id, new Set());
        }
        var connections = this.conceptGraph.get(concept.id);
        connections.clear();
        for (var _i = 0, _a = concept.relationships; _i < _a.length; _i++) {
            var rel = _a[_i];
            connections.add(rel.target_id);
            if (!this.conceptGraph.has(rel.target_id)) {
                this.conceptGraph.set(rel.target_id, new Set());
            }
            this.conceptGraph.get(rel.target_id).add(concept.id);
        }
    };
    SemanticMemoryManager.prototype.removeFromGraph = function (concept) {
        this.conceptGraph["delete"](concept.id);
        for (var _i = 0, _a = this.conceptGraph.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], id = _b[0], connections = _b[1];
            connections["delete"](concept.id);
        }
    };
    SemanticMemoryManager.prototype.generateEmbedding = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            return __generator(this, function (_a) {
                hash = text.split('').reduce(function (acc, char) { return acc + char.charCodeAt(0); }, 0);
                return [2 /*return*/, Array(384).fill(0).map(function (_, i) { return Math.sin(hash + i) * 0.1; })];
            });
        });
    };
    return SemanticMemoryManager;
}(MemoryManager));
// 4. 过程记忆管理器
var ProceduralMemoryManager = /** @class */ (function (_super) {
    __extends(ProceduralMemoryManager, _super);
    function ProceduralMemoryManager() {
        var _this = _super.call(this, 'procedural') || this;
        _this.procedures = new Map();
        return _this;
    }
    ProceduralMemoryManager.prototype.create = function (data) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var dbRecord, step, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.ProceduralMemory.create({
                                user_id: ((_a = data.metadata) === null || _a === void 0 ? void 0 : _a.userId) || 'default',
                                procedure_name: data.procedure_name || '',
                                step_number: data.step_number || 1,
                                description: data.description || '',
                                conditions: data.conditions || [],
                                actions: data.actions || [],
                                metadata: data.metadata || {}
                            })];
                    case 1:
                        dbRecord = _b.sent();
                        step = {
                            id: dbRecord.id,
                            procedure_name: dbRecord.procedure_name,
                            step_number: dbRecord.step_number,
                            description: dbRecord.description,
                            conditions: dbRecord.conditions,
                            actions: dbRecord.actions,
                            expected_results: data.expected_results || [],
                            metadata: dbRecord.metadata
                        };
                        this.memories.set(step.id, step);
                        // 组织过程步骤
                        if (!this.procedures.has(step.procedure_name)) {
                            this.procedures.set(step.procedure_name, []);
                        }
                        this.procedures.get(step.procedure_name).push(step);
                        this.procedures.get(step.procedure_name).sort(function (a, b) { return a.step_number - b.step_number; });
                        this.emit('created', step);
                        return [2 /*return*/, step];
                    case 2:
                        error_14 = _b.sent();
                        logger_1.logger.error('创建程序记忆失败:', error_14);
                        throw error_14;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProceduralMemoryManager.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated;
            return __generator(this, function (_a) {
                existing = this.memories.get(id);
                if (!existing)
                    throw new Error("Procedure step ".concat(id, " not found"));
                updated = __assign(__assign({}, existing), data);
                this.memories.set(id, updated);
                // 重新组织过程步骤
                if (data.procedure_name || data.step_number) {
                    this.reorganizeProcedures();
                }
                this.emit('updated', updated);
                return [2 /*return*/, updated];
            });
        });
    };
    ProceduralMemoryManager.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var step, procedure, index, result;
            return __generator(this, function (_a) {
                step = this.memories.get(id);
                if (step) {
                    procedure = this.procedures.get(step.procedure_name);
                    if (procedure) {
                        index = procedure.findIndex(function (s) { return s.id === id; });
                        if (index !== -1) {
                            procedure.splice(index, 1);
                        }
                    }
                }
                result = this.memories["delete"](id);
                if (result)
                    this.emit('deleted', id);
                return [2 /*return*/, result];
            });
        });
    };
    ProceduralMemoryManager.prototype.search = function (query, limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, _a, step;
            return __generator(this, function (_b) {
                results = [];
                for (_i = 0, _a = this.memories.values(); _i < _a.length; _i++) {
                    step = _a[_i];
                    if (step.procedure_name.includes(query) ||
                        step.description.includes(query) ||
                        step.actions.some(function (a) { return a.includes(query); })) {
                        results.push(step);
                        if (results.length >= limit)
                            break;
                    }
                }
                return [2 /*return*/, results];
            });
        });
    };
    ProceduralMemoryManager.prototype.getProcedure = function (procedureName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.procedures.get(procedureName) || []];
            });
        });
    };
    ProceduralMemoryManager.prototype.getAllProcedures = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Map(this.procedures)];
            });
        });
    };
    ProceduralMemoryManager.prototype.reorganizeProcedures = function () {
        this.procedures.clear();
        for (var _i = 0, _a = this.memories.values(); _i < _a.length; _i++) {
            var step = _a[_i];
            if (!this.procedures.has(step.procedure_name)) {
                this.procedures.set(step.procedure_name, []);
            }
            this.procedures.get(step.procedure_name).push(step);
        }
        for (var _b = 0, _c = this.procedures.values(); _b < _c.length; _b++) {
            var steps = _c[_b];
            steps.sort(function (a, b) { return a.step_number - b.step_number; });
        }
    };
    return ProceduralMemoryManager;
}(MemoryManager));
// 5. 资源记忆管理器
var ResourceMemoryManager = /** @class */ (function (_super) {
    __extends(ResourceMemoryManager, _super);
    function ResourceMemoryManager() {
        var _this = _super.call(this, 'resource') || this;
        _this.tagIndex = new Map();
        return _this;
    }
    ResourceMemoryManager.prototype.create = function (data) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var dbRecord, resource, error_15;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.ResourceMemory.create({
                                user_id: ((_a = data.metadata) === null || _a === void 0 ? void 0 : _a.userId) || 'default',
                                resource_type: data.resource_type || 'document',
                                name: data.name || '',
                                location: data.location || '',
                                summary: data.summary || '',
                                tags: data.tags || [],
                                metadata: data.metadata || {}
                            })];
                    case 1:
                        dbRecord = _b.sent();
                        resource = {
                            id: dbRecord.id,
                            resource_type: dbRecord.resource_type,
                            name: dbRecord.name,
                            location: dbRecord.location,
                            summary: dbRecord.summary,
                            tags: dbRecord.tags,
                            created_at: dbRecord.created_at,
                            accessed_at: dbRecord.created_at,
                            metadata: dbRecord.metadata
                        };
                        this.memories.set(resource.id, resource);
                        this.updateTagIndex(resource);
                        this.emit('created', resource);
                        return [2 /*return*/, resource];
                    case 2:
                        error_15 = _b.sent();
                        logger_1.logger.error('创建资源记忆失败:', error_15);
                        throw error_15;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ResourceMemoryManager.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated;
            return __generator(this, function (_a) {
                existing = this.memories.get(id);
                if (!existing)
                    throw new Error("Resource ".concat(id, " not found"));
                updated = __assign(__assign({}, existing), data);
                if (data.tags) {
                    this.removeFromTagIndex(existing);
                    this.updateTagIndex(updated);
                }
                this.memories.set(id, updated);
                this.emit('updated', updated);
                return [2 /*return*/, updated];
            });
        });
    };
    ResourceMemoryManager.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var resource, result;
            return __generator(this, function (_a) {
                resource = this.memories.get(id);
                if (resource) {
                    this.removeFromTagIndex(resource);
                }
                result = this.memories["delete"](id);
                if (result)
                    this.emit('deleted', id);
                return [2 /*return*/, result];
            });
        });
    };
    ResourceMemoryManager.prototype.search = function (query, limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, _a, resource;
            return __generator(this, function (_b) {
                results = [];
                for (_i = 0, _a = this.memories.values(); _i < _a.length; _i++) {
                    resource = _a[_i];
                    if (resource.name.includes(query) ||
                        resource.summary.includes(query) ||
                        resource.tags.some(function (t) { return t.includes(query); })) {
                        results.push(resource);
                        if (results.length >= limit)
                            break;
                    }
                }
                return [2 /*return*/, results];
            });
        });
    };
    ResourceMemoryManager.prototype.findByTag = function (tag) {
        return __awaiter(this, void 0, void 0, function () {
            var resourceIds, resources, _i, resourceIds_1, id, resource;
            return __generator(this, function (_a) {
                resourceIds = this.tagIndex.get(tag);
                if (!resourceIds)
                    return [2 /*return*/, []];
                resources = [];
                for (_i = 0, resourceIds_1 = resourceIds; _i < resourceIds_1.length; _i++) {
                    id = resourceIds_1[_i];
                    resource = this.memories.get(id);
                    if (resource)
                        resources.push(resource);
                }
                return [2 /*return*/, resources];
            });
        });
    };
    ResourceMemoryManager.prototype.markAccessed = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var resource;
            return __generator(this, function (_a) {
                resource = this.memories.get(id);
                if (resource) {
                    resource.accessed_at = new Date();
                    this.emit('accessed', resource);
                }
                return [2 /*return*/];
            });
        });
    };
    ResourceMemoryManager.prototype.updateTagIndex = function (resource) {
        for (var _i = 0, _a = resource.tags; _i < _a.length; _i++) {
            var tag = _a[_i];
            if (!this.tagIndex.has(tag)) {
                this.tagIndex.set(tag, new Set());
            }
            this.tagIndex.get(tag).add(resource.id);
        }
    };
    ResourceMemoryManager.prototype.removeFromTagIndex = function (resource) {
        for (var _i = 0, _a = resource.tags; _i < _a.length; _i++) {
            var tag = _a[_i];
            var ids = this.tagIndex.get(tag);
            if (ids) {
                ids["delete"](resource.id);
                if (ids.size === 0) {
                    this.tagIndex["delete"](tag);
                }
            }
        }
    };
    return ResourceMemoryManager;
}(MemoryManager));
// 6. 知识库管理器
var KnowledgeVaultManager = /** @class */ (function (_super) {
    __extends(KnowledgeVaultManager, _super);
    function KnowledgeVaultManager() {
        var _this = _super.call(this, 'knowledge') || this;
        _this.domainIndex = new Map();
        return _this;
    }
    KnowledgeVaultManager.prototype.create = function (data) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var embedding, dbRecord, entry, error_16;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        embedding = null;
                        if (!data.content) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.generateEmbedding(data.content)];
                    case 1:
                        embedding = _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, six_dimension_memory_model_1.MemoryModels.KnowledgeVault.create({
                            user_id: ((_a = data.metadata) === null || _a === void 0 ? void 0 : _a.userId) || 'default',
                            domain: data.domain || 'general',
                            topic: data.topic || '',
                            content: data.content || '',
                            source: data.source || 'system',
                            confidence: data.confidence || 0.5,
                            embedding: embedding,
                            metadata: data.metadata || {}
                        })];
                    case 3:
                        dbRecord = _b.sent();
                        entry = {
                            id: dbRecord.id,
                            domain: dbRecord.domain,
                            topic: dbRecord.topic,
                            content: dbRecord.content,
                            source: dbRecord.source,
                            confidence: dbRecord.confidence,
                            created_at: dbRecord.created_at,
                            validated_at: dbRecord.created_at,
                            embedding: dbRecord.embedding,
                            metadata: dbRecord.metadata
                        };
                        this.memories.set(entry.id, entry);
                        this.updateDomainIndex(entry);
                        this.emit('created', entry);
                        return [2 /*return*/, entry];
                    case 4:
                        error_16 = _b.sent();
                        logger_1.logger.error('创建知识库记忆失败:', error_16);
                        throw error_16;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    KnowledgeVaultManager.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        existing = this.memories.get(id);
                        if (!existing)
                            throw new Error("Knowledge entry ".concat(id, " not found"));
                        updated = __assign(__assign({}, existing), data);
                        if (!(data.content && data.content !== existing.content)) return [3 /*break*/, 2];
                        _a = updated;
                        return [4 /*yield*/, this.generateEmbedding(data.content)];
                    case 1:
                        _a.embedding = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (data.domain && data.domain !== existing.domain) {
                            this.removeFromDomainIndex(existing);
                            this.updateDomainIndex(updated);
                        }
                        this.memories.set(id, updated);
                        this.emit('updated', updated);
                        return [2 /*return*/, updated];
                }
            });
        });
    };
    KnowledgeVaultManager.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, result;
            return __generator(this, function (_a) {
                entry = this.memories.get(id);
                if (entry) {
                    this.removeFromDomainIndex(entry);
                }
                result = this.memories["delete"](id);
                if (result)
                    this.emit('deleted', id);
                return [2 /*return*/, result];
            });
        });
    };
    KnowledgeVaultManager.prototype.search = function (query, limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var queryEmbedding, results, _i, _a, entry, score;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.generateEmbedding(query)];
                    case 1:
                        queryEmbedding = _b.sent();
                        results = [];
                        for (_i = 0, _a = this.memories.values(); _i < _a.length; _i++) {
                            entry = _a[_i];
                            score = 0;
                            // 文本匹配
                            if (entry.topic.includes(query) || entry.content.includes(query)) {
                                score += 0.5;
                            }
                            // 向量相似度
                            if (queryEmbedding && entry.embedding) {
                                score += this.cosineSimilarity(queryEmbedding, entry.embedding) * entry.confidence;
                            }
                            results.push({ entry: entry, score: score });
                        }
                        return [2 /*return*/, results
                                .sort(function (a, b) { return b.score - a.score; })
                                .slice(0, limit)
                                .map(function (r) { return r.entry; })];
                }
            });
        });
    };
    KnowledgeVaultManager.prototype.findByDomain = function (domain) {
        return __awaiter(this, void 0, void 0, function () {
            var entryIds, entries, _i, entryIds_1, id, entry;
            return __generator(this, function (_a) {
                entryIds = this.domainIndex.get(domain);
                if (!entryIds)
                    return [2 /*return*/, []];
                entries = [];
                for (_i = 0, entryIds_1 = entryIds; _i < entryIds_1.length; _i++) {
                    id = entryIds_1[_i];
                    entry = this.memories.get(id);
                    if (entry)
                        entries.push(entry);
                }
                return [2 /*return*/, entries.sort(function (a, b) { return b.confidence - a.confidence; })];
            });
        });
    };
    KnowledgeVaultManager.prototype.validate = function (id, confidence) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                entry = this.memories.get(id);
                if (entry) {
                    entry.confidence = Math.max(0, Math.min(1, confidence));
                    entry.validated_at = new Date();
                    this.emit('validated', entry);
                }
                return [2 /*return*/];
            });
        });
    };
    KnowledgeVaultManager.prototype.updateDomainIndex = function (entry) {
        if (!this.domainIndex.has(entry.domain)) {
            this.domainIndex.set(entry.domain, new Set());
        }
        this.domainIndex.get(entry.domain).add(entry.id);
    };
    KnowledgeVaultManager.prototype.removeFromDomainIndex = function (entry) {
        var ids = this.domainIndex.get(entry.domain);
        if (ids) {
            ids["delete"](entry.id);
            if (ids.size === 0) {
                this.domainIndex["delete"](entry.domain);
            }
        }
    };
    KnowledgeVaultManager.prototype.generateEmbedding = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            return __generator(this, function (_a) {
                hash = text.split('').reduce(function (acc, char) { return acc + char.charCodeAt(0); }, 0);
                return [2 /*return*/, Array(384).fill(0).map(function (_, i) { return Math.sin(hash + i) * 0.1; })];
            });
        });
    };
    KnowledgeVaultManager.prototype.cosineSimilarity = function (a, b) {
        var dotProduct = 0;
        var normA = 0;
        var normB = 0;
        for (var i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };
    return KnowledgeVaultManager;
}(MemoryManager));
// ============= 元记忆管理器（路由中心）=============
var MetaMemoryManager = /** @class */ (function (_super) {
    __extends(MetaMemoryManager, _super);
    function MetaMemoryManager(config) {
        var _this = _super.call(this) || this;
        _this.config = {
            maxEmbeddingDim: 384,
            memoryWarningThreshold: 0.8,
            contextWindow: 8192,
            enableVectorSearch: true,
            enableFullTextSearch: true
        };
        if (config) {
            _this.config = __assign(__assign({}, _this.config), config);
        }
        // 初始化六个记忆管理器
        _this.coreMemory = new CoreMemoryManager();
        _this.episodicMemory = new EpisodicMemoryManager();
        _this.semanticMemory = new SemanticMemoryManager();
        _this.proceduralMemory = new ProceduralMemoryManager();
        _this.resourceMemory = new ResourceMemoryManager();
        _this.knowledgeVault = new KnowledgeVaultManager();
        _this.setupEventForwarding();
        logger_1.logger.info('六维记忆系统初始化完成');
        return _this;
    }
    // ============= 核心API =============
    /**
     * 主动检索：根据查询自动推断话题并从六个维度检索相关记忆
     */
    MetaMemoryManager.prototype.activeRetrieval = function (query, context) {
        return __awaiter(this, void 0, void 0, function () {
            var topic, results, _a, core, episodic, semantic, procedural, resource, knowledge;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.inferTopic(query, context)];
                    case 1:
                        topic = _b.sent();
                        results = {};
                        return [4 /*yield*/, Promise.all([
                                this.coreMemory.search(topic, 5),
                                this.episodicMemory.search(topic, 10),
                                this.semanticMemory.search(topic, 10),
                                this.proceduralMemory.search(topic, 10),
                                this.resourceMemory.search(topic, 10),
                                this.knowledgeVault.search(topic, 10)
                            ])];
                    case 2:
                        _a = _b.sent(), core = _a[0], episodic = _a[1], semantic = _a[2], procedural = _a[3], resource = _a[4], knowledge = _a[5];
                        results.core = {
                            dimension: 'core',
                            items: core,
                            relevance_scores: core.map(function () { return 1.0; }),
                            total_count: core.length
                        };
                        results.episodic = {
                            dimension: 'episodic',
                            items: episodic,
                            relevance_scores: episodic.map(function () { return 0.9; }),
                            total_count: episodic.length
                        };
                        results.semantic = {
                            dimension: 'semantic',
                            items: semantic,
                            relevance_scores: semantic.map(function () { return 0.85; }),
                            total_count: semantic.length
                        };
                        results.procedural = {
                            dimension: 'procedural',
                            items: procedural,
                            relevance_scores: procedural.map(function () { return 0.8; }),
                            total_count: procedural.length
                        };
                        results.resource = {
                            dimension: 'resource',
                            items: resource,
                            relevance_scores: resource.map(function () { return 0.75; }),
                            total_count: resource.length
                        };
                        results.knowledge = {
                            dimension: 'knowledge',
                            items: knowledge,
                            relevance_scores: knowledge.map(function () { return 0.9; }),
                            total_count: knowledge.length
                        };
                        this.emit('retrieval_completed', { query: query, topic: topic, results: results });
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * 记录对话事件到情节记忆
     */
    MetaMemoryManager.prototype.recordConversation = function (actor, message, context) {
        return __awaiter(this, void 0, void 0, function () {
            var event;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.episodicMemory.create({
                            event_type: 'conversation',
                            summary: message.substring(0, 100),
                            details: message,
                            actor: actor,
                            tree_path: this.generateTreePath(context),
                            occurred_at: new Date(),
                            metadata: context
                        })];
                    case 1:
                        event = _a.sent();
                        // 自动提取概念到语义记忆
                        return [4 /*yield*/, this.extractConcepts(message)];
                    case 2:
                        // 自动提取概念到语义记忆
                        _a.sent();
                        return [2 /*return*/, event];
                }
            });
        });
    };
    /**
     * 学习新知识
     */
    MetaMemoryManager.prototype.learnKnowledge = function (domain, topic, content, source, confidence) {
        if (confidence === void 0) { confidence = 0.7; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.knowledgeVault.create({
                            domain: domain,
                            topic: topic,
                            content: content,
                            source: source,
                            confidence: confidence
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 记录操作流程
     */
    MetaMemoryManager.prototype.recordProcedure = function (procedureName, steps) {
        return __awaiter(this, void 0, void 0, function () {
            var createdSteps, i, step;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createdSteps = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < steps.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.proceduralMemory.create(__assign({ procedure_name: procedureName, step_number: i + 1 }, steps[i]))];
                    case 2:
                        step = _a.sent();
                        createdSteps.push(step);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, createdSteps];
                }
            });
        });
    };
    /**
     * 保存资源引用
     */
    MetaMemoryManager.prototype.saveResource = function (resourceType, name, location, summary, tags) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.resourceMemory.create({
                            resource_type: resourceType,
                            name: name,
                            location: location,
                            summary: summary,
                            tags: tags
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 获取记忆上下文摘要
     */
    MetaMemoryManager.prototype.getMemoryContext = function (limit) {
        if (limit === void 0) { limit = 1000; }
        return __awaiter(this, void 0, void 0, function () {
            var coreMemories, recentEvents, concepts, context, core, sortedEvents, _i, sortedEvents_1, event_2, topConcepts, _a, topConcepts_1, concept;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.coreMemory.getAll()];
                    case 1:
                        coreMemories = _b.sent();
                        return [4 /*yield*/, this.episodicMemory.getAll()];
                    case 2:
                        recentEvents = _b.sent();
                        return [4 /*yield*/, this.semanticMemory.getAll()];
                    case 3:
                        concepts = _b.sent();
                        context = '=== 记忆上下文 ===\n\n';
                        // 核心记忆
                        if (coreMemories.length > 0) {
                            core = coreMemories[0];
                            context += "[\u6838\u5FC3\u8BB0\u5FC6]\n";
                            context += "\u89D2\u8272: ".concat(core.persona.value.substring(0, 200), "\n");
                            context += "\u7528\u6237: ".concat(core.human.value.substring(0, 200), "\n\n");
                        }
                        // 最近事件
                        context += "[\u6700\u8FD1\u4E8B\u4EF6]\n";
                        sortedEvents = recentEvents
                            .sort(function (a, b) { return b.occurred_at.getTime() - a.occurred_at.getTime(); })
                            .slice(0, 5);
                        for (_i = 0, sortedEvents_1 = sortedEvents; _i < sortedEvents_1.length; _i++) {
                            event_2 = sortedEvents_1[_i];
                            context += "- ".concat(event_2.occurred_at.toISOString(), ": ").concat(event_2.summary, "\n");
                        }
                        // 关键概念
                        context += "\n[\u5173\u952E\u6982\u5FF5]\n";
                        topConcepts = concepts.slice(0, 10);
                        for (_a = 0, topConcepts_1 = topConcepts; _a < topConcepts_1.length; _a++) {
                            concept = topConcepts_1[_a];
                            context += "- ".concat(concept.name, ": ").concat(concept.description.substring(0, 100), "\n");
                        }
                        // 限制总长度
                        if (context.length > limit) {
                            context = context.substring(0, limit) + '...';
                        }
                        return [2 /*return*/, context];
                }
            });
        });
    };
    /**
     * 记忆压缩与归档
     */
    MetaMemoryManager.prototype.compressMemories = function (beforeDate) {
        return __awaiter(this, void 0, void 0, function () {
            var events, oldEvents, summary, _i, oldEvents_1, event_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.episodicMemory.getAll()];
                    case 1:
                        events = _a.sent();
                        oldEvents = events.filter(function (e) { return e.occurred_at < beforeDate; });
                        if (oldEvents.length === 0)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.summarizeEvents(oldEvents)];
                    case 2:
                        summary = _a.sent();
                        // 保存到知识库
                        return [4 /*yield*/, this.knowledgeVault.create({
                                domain: 'archive',
                                topic: "\u5386\u53F2\u8BB0\u5FC6\u6458\u8981 ".concat(beforeDate.toISOString()),
                                content: summary,
                                source: 'system_compression',
                                confidence: 0.9
                            })];
                    case 3:
                        // 保存到知识库
                        _a.sent();
                        _i = 0, oldEvents_1 = oldEvents;
                        _a.label = 4;
                    case 4:
                        if (!(_i < oldEvents_1.length)) return [3 /*break*/, 7];
                        event_3 = oldEvents_1[_i];
                        return [4 /*yield*/, this.episodicMemory["delete"](event_3.id)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        logger_1.logger.info("\u538B\u7F29\u4E86 ".concat(oldEvents.length, " \u6761\u5386\u53F2\u8BB0\u5FC6"));
                        return [2 /*return*/];
                }
            });
        });
    };
    // ============= 私有方法 =============
    MetaMemoryManager.prototype.inferTopic = function (query, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: 使用LLM推断话题
                // 这里简单返回查询本身
                return [2 /*return*/, query];
            });
        });
    };
    MetaMemoryManager.prototype.generateTreePath = function (context) {
        if (!context)
            return ['general'];
        var path = [];
        if (context.module)
            path.push(context.module);
        if (context.category)
            path.push(context.category);
        if (context.action)
            path.push(context.action);
        return path.length > 0 ? path : ['general'];
    };
    MetaMemoryManager.prototype.extractConcepts = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var keywords, uniqueKeywords, _i, uniqueKeywords_1, keyword, existing;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keywords = text.match(/[A-Za-z\u4e00-\u9fa5]{2,}/g) || [];
                        uniqueKeywords = __spreadArray([], new Set(keywords), true).slice(0, 5);
                        _i = 0, uniqueKeywords_1 = uniqueKeywords;
                        _a.label = 1;
                    case 1:
                        if (!(_i < uniqueKeywords_1.length)) return [3 /*break*/, 5];
                        keyword = uniqueKeywords_1[_i];
                        return [4 /*yield*/, this.semanticMemory.search(keyword, 1)];
                    case 2:
                        existing = _a.sent();
                        if (!(existing.length === 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.semanticMemory.create({
                                name: keyword,
                                description: "\u81EA\u52A8\u63D0\u53D6\u7684\u6982\u5FF5: ".concat(keyword),
                                category: 'auto_extracted'
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    MetaMemoryManager.prototype.summarizeEvents = function (events) {
        return __awaiter(this, void 0, void 0, function () {
            var summaries;
            return __generator(this, function (_a) {
                summaries = events.map(function (e) { return "".concat(e.occurred_at.toISOString(), ": ").concat(e.summary); });
                return [2 /*return*/, summaries.join('\n')];
            });
        });
    };
    MetaMemoryManager.prototype.setupEventForwarding = function () {
        var _this = this;
        // 转发各个记忆管理器的事件
        var managers = [
            this.coreMemory,
            this.episodicMemory,
            this.semanticMemory,
            this.proceduralMemory,
            this.resourceMemory,
            this.knowledgeVault
        ];
        var _loop_1 = function (manager) {
            manager.on('created', function (data) {
                _this.emit('memory_created', { dimension: manager['dimension'], data: data });
            });
            manager.on('updated', function (data) {
                _this.emit('memory_updated', { dimension: manager['dimension'], data: data });
            });
            manager.on('deleted', function (id) {
                _this.emit('memory_deleted', { dimension: manager['dimension'], id: id });
            });
        };
        for (var _i = 0, managers_1 = managers; _i < managers_1.length; _i++) {
            var manager = managers_1[_i];
            _loop_1(manager);
        }
    };
    // ============= 获取各个管理器的引用 =============
    MetaMemoryManager.prototype.getCore = function () {
        return this.coreMemory;
    };
    MetaMemoryManager.prototype.getEpisodic = function () {
        return this.episodicMemory;
    };
    MetaMemoryManager.prototype.getSemantic = function () {
        return this.semanticMemory;
    };
    MetaMemoryManager.prototype.getProcedural = function () {
        return this.proceduralMemory;
    };
    MetaMemoryManager.prototype.getResource = function () {
        return this.resourceMemory;
    };
    MetaMemoryManager.prototype.getKnowledge = function () {
        return this.knowledgeVault;
    };
    /**
     * 从对话中学习并存储到各个记忆维度
     */
    MetaMemoryManager.prototype.learnFromConversation = function (userId, userMessage, aiMessage, context) {
        return __awaiter(this, void 0, void 0, function () {
            var userEvent, aiEvent, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.recordConversation('user', userMessage, __assign(__assign({}, context), { userId: userId }))];
                    case 1:
                        userEvent = _a.sent();
                        return [4 /*yield*/, this.recordConversation('assistant', aiMessage, __assign(__assign({}, context), { userId: userId }))];
                    case 2:
                        aiEvent = _a.sent();
                        return [2 /*return*/, { userEvent: userEvent, aiEvent: aiEvent }];
                    case 3:
                        error_17 = _a.sent();
                        console.error('从对话中学习失败:', error_17);
                        throw error_17;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return MetaMemoryManager;
}(events_1.EventEmitter));
exports.MetaMemoryManager = MetaMemoryManager;
// 导出单例
var memoryInstance = null;
function getMemorySystem(config) {
    if (!memoryInstance) {
        memoryInstance = new MetaMemoryManager(config);
    }
    return memoryInstance;
}
exports.getMemorySystem = getMemorySystem;
exports["default"] = MetaMemoryManager;
