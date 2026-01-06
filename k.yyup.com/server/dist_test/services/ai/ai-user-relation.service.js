"use strict";
/**
 * AI用户关系服务
 * 此服务用于管理外部系统用户与AI系统的关联关系
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
var ai_user_relation_model_1 = require("../../models/ai-user-relation.model");
/**
 * AI用户关系服务类
 * 管理外部系统用户与AI系统之间的关联
 */
var AIUserRelationService = /** @class */ (function () {
    function AIUserRelationService() {
    }
    /**
     * 获取用户关系信息
     * @param userId 外部系统用户ID
     * @returns 用户关系对象
     */
    AIUserRelationService.prototype.getUserRelation = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var relation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_user_relation_model_1.AIUserRelation.findOne({
                            where: { externalUserId: userId }
                        })];
                    case 1:
                        relation = _a.sent();
                        if (!relation)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                id: relation.id,
                                externalUserId: relation.externalUserId,
                                settings: relation.aiSettings,
                                lastActivity: relation.lastActivity,
                                createdAt: relation.createdAt,
                                updatedAt: relation.updatedAt
                            }];
                }
            });
        });
    };
    /**
     * 创建或获取用户关系
     * @param userId 外部系统用户ID
     * @param defaultSettings 默认设置
     * @returns 用户关系对象
     */
    AIUserRelationService.prototype.getOrCreateUserRelation = function (userId, defaultSettings) {
        if (defaultSettings === void 0) { defaultSettings = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var relation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_user_relation_model_1.AIUserRelation.findOne({
                            where: { externalUserId: userId }
                        })];
                    case 1:
                        relation = _a.sent();
                        if (!!relation) return [3 /*break*/, 3];
                        return [4 /*yield*/, ai_user_relation_model_1.AIUserRelation.create({
                                externalUserId: userId,
                                aiSettings: defaultSettings,
                                lastActivity: new Date()
                            })];
                    case 2:
                        relation = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, {
                            id: relation.id,
                            externalUserId: relation.externalUserId,
                            settings: relation.aiSettings,
                            lastActivity: relation.lastActivity,
                            createdAt: relation.createdAt,
                            updatedAt: relation.updatedAt
                        }];
                }
            });
        });
    };
    /**
     * 更新用户设置
     * @param userId 外部系统用户ID
     * @param settings 用户设置
     * @returns 更新后的用户关系对象
     */
    AIUserRelationService.prototype.updateUserSettings = function (userId, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var relation, updatedSettings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_user_relation_model_1.AIUserRelation.findOne({
                            where: { externalUserId: userId }
                        })];
                    case 1:
                        relation = _a.sent();
                        if (!relation)
                            return [2 /*return*/, null];
                        updatedSettings = __assign(__assign({}, relation.aiSettings), settings);
                        return [4 /*yield*/, relation.update({
                                aiSettings: updatedSettings
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                id: relation.id,
                                externalUserId: relation.externalUserId,
                                settings: relation.aiSettings,
                                lastActivity: relation.lastActivity,
                                createdAt: relation.createdAt,
                                updatedAt: relation.updatedAt
                            }];
                }
            });
        });
    };
    /**
     * 更新用户最后活动时间
     * @param userId 外部系统用户ID
     * @returns 是否更新成功
     */
    AIUserRelationService.prototype.updateLastActivity = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var relation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_user_relation_model_1.AIUserRelation.findOne({
                            where: { externalUserId: userId }
                        })];
                    case 1:
                        relation = _a.sent();
                        if (!relation)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, relation.update({
                                lastActivity: new Date()
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * 获取最近活动用户
     * @param limit 限制数量
     * @returns 用户关系列表
     */
    AIUserRelationService.prototype.getRecentActiveUsers = function (limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var relations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_user_relation_model_1.AIUserRelation.findAll({
                            order: [['lastActivity', 'DESC']],
                            limit: limit
                        })];
                    case 1:
                        relations = _a.sent();
                        return [2 /*return*/, relations.map(function (relation) { return ({
                                id: relation.id,
                                externalUserId: relation.externalUserId,
                                settings: relation.aiSettings,
                                lastActivity: relation.lastActivity,
                                createdAt: relation.createdAt,
                                updatedAt: relation.updatedAt
                            }); })];
                }
            });
        });
    };
    /**
     * 删除用户关系
     * @param userId 外部系统用户ID
     * @returns 是否删除成功
     */
    AIUserRelationService.prototype.deleteUserRelation = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var deleteCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_user_relation_model_1.AIUserRelation.destroy({
                            where: { externalUserId: userId }
                        })];
                    case 1:
                        deleteCount = _a.sent();
                        return [2 /*return*/, deleteCount > 0];
                }
            });
        });
    };
    return AIUserRelationService;
}());
exports["default"] = new AIUserRelationService();
