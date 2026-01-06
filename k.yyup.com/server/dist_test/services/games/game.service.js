"use strict";
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
exports.GameService = void 0;
var game_config_model_1 = require("../../models/game-config.model");
var game_level_model_1 = require("../../models/game-level.model");
var game_record_model_1 = require("../../models/game-record.model");
var game_achievement_model_1 = require("../../models/game-achievement.model");
var user_achievement_model_1 = require("../../models/user-achievement.model");
var game_user_settings_model_1 = require("../../models/game-user-settings.model");
var sequelize_1 = require("sequelize");
/**
 * 游戏服务
 */
var GameService = /** @class */ (function () {
    function GameService() {
    }
    /**
     * 获取所有游戏列表
     */
    GameService.prototype.getGameList = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var games, gamesWithProgress;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, game_config_model_1.GameConfig.findAll({
                            where: { status: 'active' },
                            order: [['sortOrder', 'ASC']]
                        })];
                    case 1:
                        games = _a.sent();
                        if (!userId) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.all(games.map(function (game) { return __awaiter(_this, void 0, void 0, function () {
                                var records, totalStars, playCount;
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0: return [4 /*yield*/, game_record_model_1.GameRecord.findAll({
                                                where: { userId: userId, gameId: game.id },
                                                order: [['completedAt', 'DESC']],
                                                limit: 1
                                            })];
                                        case 1:
                                            records = _c.sent();
                                            return [4 /*yield*/, game_record_model_1.GameRecord.sum('stars', {
                                                    where: { userId: userId, gameId: game.id }
                                                })];
                                        case 2:
                                            totalStars = _c.sent();
                                            return [4 /*yield*/, game_record_model_1.GameRecord.count({
                                                    where: { userId: userId, gameId: game.id }
                                                })];
                                        case 3:
                                            playCount = _c.sent();
                                            return [2 /*return*/, __assign(__assign({}, game.toJSON()), { userProgress: {
                                                        lastPlayed: ((_a = records[0]) === null || _a === void 0 ? void 0 : _a.completedAt) || null,
                                                        totalStars: totalStars || 0,
                                                        playCount: playCount || 0,
                                                        bestScore: ((_b = records[0]) === null || _b === void 0 ? void 0 : _b.score) || 0
                                                    } })];
                                    }
                                });
                            }); }))];
                    case 2:
                        gamesWithProgress = _a.sent();
                        return [2 /*return*/, gamesWithProgress];
                    case 3: return [2 /*return*/, games.map(function (g) { return g.toJSON(); })];
                }
            });
        });
    };
    /**
     * 获取游戏详情
     */
    GameService.prototype.getGameDetail = function (gameKey) {
        return __awaiter(this, void 0, void 0, function () {
            var game;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, game_config_model_1.GameConfig.findOne({
                            where: { gameKey: gameKey, status: 'active' }
                        })];
                    case 1:
                        game = _a.sent();
                        if (!game) {
                            throw new Error('游戏不存在');
                        }
                        return [2 /*return*/, game.toJSON()];
                }
            });
        });
    };
    /**
     * 获取游戏关卡列表
     */
    GameService.prototype.getGameLevels = function (gameKey, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var game, levels, levelsWithProgress;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, game_config_model_1.GameConfig.findOne({
                            where: { gameKey: gameKey }
                        })];
                    case 1:
                        game = _a.sent();
                        if (!game) {
                            throw new Error('游戏不存在');
                        }
                        return [4 /*yield*/, game_level_model_1.GameLevel.findAll({
                                where: { gameId: game.id },
                                order: [['levelNumber', 'ASC']]
                            })];
                    case 2:
                        levels = _a.sent();
                        if (!userId) return [3 /*break*/, 4];
                        return [4 /*yield*/, Promise.all(levels.map(function (level) { return __awaiter(_this, void 0, void 0, function () {
                                var records, bestRecord, isUnlocked, _a;
                                var _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0: return [4 /*yield*/, game_record_model_1.GameRecord.findAll({
                                                where: { userId: userId, levelId: level.id },
                                                order: [['stars', 'DESC'], ['score', 'DESC']],
                                                limit: 1
                                            })];
                                        case 1:
                                            records = _c.sent();
                                            bestRecord = records[0];
                                            return [4 /*yield*/, this.checkLevelUnlocked(userId, level.id)];
                                        case 2:
                                            isUnlocked = _c.sent();
                                            _a = [__assign({}, level.toJSON())];
                                            _b = { isUnlocked: isUnlocked, bestStars: (bestRecord === null || bestRecord === void 0 ? void 0 : bestRecord.stars) || 0, bestScore: (bestRecord === null || bestRecord === void 0 ? void 0 : bestRecord.score) || 0 };
                                            return [4 /*yield*/, game_record_model_1.GameRecord.count({
                                                    where: { userId: userId, levelId: level.id }
                                                })];
                                        case 3: return [2 /*return*/, __assign.apply(void 0, _a.concat([(_b.playCount = _c.sent(), _b)]))];
                                    }
                                });
                            }); }))];
                    case 3:
                        levelsWithProgress = _a.sent();
                        return [2 /*return*/, levelsWithProgress];
                    case 4: return [2 /*return*/, levels.map(function (l) { return l.toJSON(); })];
                }
            });
        });
    };
    /**
     * 检查关卡是否解锁
     */
    GameService.prototype.checkLevelUnlocked = function (userId, levelId) {
        return __awaiter(this, void 0, void 0, function () {
            var level, previousLevel, previousRecord;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, game_level_model_1.GameLevel.findByPk(levelId)];
                    case 1:
                        level = _b.sent();
                        if (!level)
                            return [2 /*return*/, false];
                        // 第一关默认解锁
                        if (level.levelNumber === 1)
                            return [2 /*return*/, true];
                        return [4 /*yield*/, game_level_model_1.GameLevel.findOne({
                                where: {
                                    gameId: level.gameId,
                                    levelNumber: level.levelNumber - 1
                                }
                            })];
                    case 2:
                        previousLevel = _b.sent();
                        if (!previousLevel)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, game_record_model_1.GameRecord.findOne({
                                where: {
                                    userId: userId,
                                    levelId: previousLevel.id,
                                    stars: (_a = {}, _a[sequelize_1.Op.gte] = 1, _a)
                                }
                            })];
                    case 3:
                        previousRecord = _b.sent();
                        return [2 /*return*/, !!previousRecord];
                }
            });
        });
    };
    /**
     * 保存游戏记录
     */
    GameService.prototype.saveGameRecord = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var game, level, stars, record, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, game_config_model_1.GameConfig.findOne({
                            where: { gameKey: data.gameKey }
                        })];
                    case 1:
                        game = _c.sent();
                        if (!game) {
                            throw new Error('游戏不存在');
                        }
                        return [4 /*yield*/, game_level_model_1.GameLevel.findOne({
                                where: {
                                    gameId: game.id,
                                    levelNumber: data.levelNumber
                                }
                            })];
                    case 2:
                        level = _c.sent();
                        if (!level) {
                            throw new Error('关卡不存在');
                        }
                        stars = this.calculateStars(level, {
                            timeSpent: data.timeSpent,
                            accuracy: data.accuracy,
                            mistakes: data.mistakes
                        });
                        return [4 /*yield*/, game_record_model_1.GameRecord.create({
                                userId: data.userId,
                                childId: data.childId || null,
                                gameId: game.id,
                                levelId: level.id,
                                score: data.score,
                                stars: stars,
                                timeSpent: data.timeSpent,
                                accuracy: data.accuracy || null,
                                mistakes: data.mistakes || 0,
                                comboMax: data.comboMax || 0,
                                gameData: data.gameData || null
                            })];
                    case 3:
                        record = _c.sent();
                        // 检查是否解锁成就
                        return [4 /*yield*/, this.checkAndUnlockAchievements(data.userId, data.childId)];
                    case 4:
                        // 检查是否解锁成就
                        _c.sent();
                        _a = [__assign({}, record.toJSON())];
                        _b = { stars: stars };
                        return [4 /*yield*/, this.isNewBestScore(data.userId, level.id, data.score)];
                    case 5: return [2 /*return*/, __assign.apply(void 0, _a.concat([(_b.isNewBest = _c.sent(), _b)]))];
                }
            });
        });
    };
    /**
     * 计算星级
     */
    GameService.prototype.calculateStars = function (level, performance) {
        if (!level.starRequirements)
            return 1;
        var _a = level.starRequirements, threeStars = _a.threeStars, twoStars = _a.twoStars, oneStar = _a.oneStar;
        // 检查三星
        if (threeStars) {
            if (this.meetsRequirement(performance, threeStars)) {
                return 3;
            }
        }
        // 检查二星
        if (twoStars) {
            if (this.meetsRequirement(performance, twoStars)) {
                return 2;
            }
        }
        // 检查一星
        if (oneStar) {
            if (this.meetsRequirement(performance, oneStar)) {
                return 1;
            }
        }
        return 0;
    };
    /**
     * 检查是否满足星级要求
     */
    GameService.prototype.meetsRequirement = function (performance, requirement) {
        if (requirement.timeLimit && performance.timeSpent > requirement.timeLimit) {
            return false;
        }
        if (requirement.minAccuracy && (!performance.accuracy || performance.accuracy < requirement.minAccuracy)) {
            return false;
        }
        if (requirement.maxMistakes && performance.mistakes > requirement.maxMistakes) {
            return false;
        }
        return true;
    };
    /**
     * 检查是否是新最佳成绩
     */
    GameService.prototype.isNewBestScore = function (userId, levelId, score) {
        return __awaiter(this, void 0, void 0, function () {
            var bestRecord;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, game_record_model_1.GameRecord.findOne({
                            where: { userId: userId, levelId: levelId },
                            order: [['score', 'DESC']],
                            limit: 1
                        })];
                    case 1:
                        bestRecord = _a.sent();
                        return [2 /*return*/, !bestRecord || score > bestRecord.score];
                }
            });
        });
    };
    /**
     * 获取用户设置
     */
    GameService.prototype.getUserSettings = function (userId, childId) {
        return __awaiter(this, void 0, void 0, function () {
            var settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, game_user_settings_model_1.GameUserSettings.findOne({
                            where: {
                                userId: userId,
                                childId: childId || null
                            }
                        })];
                    case 1:
                        settings = _a.sent();
                        if (!!settings) return [3 /*break*/, 3];
                        return [4 /*yield*/, game_user_settings_model_1.GameUserSettings.create({
                                userId: userId,
                                childId: childId || null
                            })];
                    case 2:
                        settings = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, settings.toJSON()];
                }
            });
        });
    };
    /**
     * 更新用户设置
     */
    GameService.prototype.updateUserSettings = function (userId, updates, childId) {
        return __awaiter(this, void 0, void 0, function () {
            var settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, game_user_settings_model_1.GameUserSettings.findOne({
                            where: {
                                userId: userId,
                                childId: childId || null
                            }
                        })];
                    case 1:
                        settings = _a.sent();
                        if (!!settings) return [3 /*break*/, 3];
                        return [4 /*yield*/, game_user_settings_model_1.GameUserSettings.create(__assign({ userId: userId, childId: childId || null }, updates))];
                    case 2:
                        settings = _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, settings.update(updates)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, settings.toJSON()];
                }
            });
        });
    };
    /**
     * 获取游戏统计数据
     */
    GameService.prototype.getGameStatistics = function (userId, gameKey) {
        return __awaiter(this, void 0, void 0, function () {
            var whereCondition, game, totalGames, totalStars, totalScore, totalTime, avgAccuracy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        whereCondition = { userId: userId };
                        if (!gameKey) return [3 /*break*/, 2];
                        return [4 /*yield*/, game_config_model_1.GameConfig.findOne({ where: { gameKey: gameKey } })];
                    case 1:
                        game = _a.sent();
                        if (game) {
                            whereCondition.gameId = game.id;
                        }
                        _a.label = 2;
                    case 2: return [4 /*yield*/, game_record_model_1.GameRecord.count({ where: whereCondition })];
                    case 3:
                        totalGames = _a.sent();
                        return [4 /*yield*/, game_record_model_1.GameRecord.sum('stars', { where: whereCondition })];
                    case 4:
                        totalStars = (_a.sent()) || 0;
                        return [4 /*yield*/, game_record_model_1.GameRecord.sum('score', { where: whereCondition })];
                    case 5:
                        totalScore = (_a.sent()) || 0;
                        return [4 /*yield*/, game_record_model_1.GameRecord.sum('timeSpent', { where: whereCondition })];
                    case 6:
                        totalTime = (_a.sent()) || 0;
                        return [4 /*yield*/, game_record_model_1.GameRecord.findOne({
                                where: whereCondition,
                                attributes: [
                                    [game_record_model_1.GameRecord.sequelize.fn('AVG', game_record_model_1.GameRecord.sequelize.col('accuracy')), 'avgAccuracy']
                                ],
                                raw: true
                            })];
                    case 7:
                        avgAccuracy = _a.sent();
                        return [2 /*return*/, {
                                totalGames: totalGames,
                                totalStars: totalStars,
                                totalScore: totalScore,
                                totalTime: totalTime,
                                avgAccuracy: (avgAccuracy === null || avgAccuracy === void 0 ? void 0 : avgAccuracy.avgAccuracy) || 0,
                                avgTimePerGame: totalGames > 0 ? Math.round(totalTime / totalGames) : 0
                            }];
                }
            });
        });
    };
    /**
     * 检查并解锁成就
     */
    GameService.prototype.checkAndUnlockAchievements = function (userId, childId) {
        return __awaiter(this, void 0, void 0, function () {
            var achievements, unlockedAchievements, _i, achievements_1, achievement, existing, meets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, game_achievement_model_1.GameAchievement.findAll()];
                    case 1:
                        achievements = _a.sent();
                        unlockedAchievements = [];
                        _i = 0, achievements_1 = achievements;
                        _a.label = 2;
                    case 2:
                        if (!(_i < achievements_1.length)) return [3 /*break*/, 7];
                        achievement = achievements_1[_i];
                        return [4 /*yield*/, user_achievement_model_1.UserAchievement.findOne({
                                where: {
                                    userId: userId,
                                    childId: childId || null,
                                    achievementId: achievement.id
                                }
                            })];
                    case 3:
                        existing = _a.sent();
                        if (existing)
                            return [3 /*break*/, 6];
                        return [4 /*yield*/, this.meetsAchievementCondition(userId, childId, achievement.condition)];
                    case 4:
                        meets = _a.sent();
                        if (!meets) return [3 /*break*/, 6];
                        return [4 /*yield*/, user_achievement_model_1.UserAchievement.create({
                                userId: userId,
                                childId: childId || null,
                                achievementId: achievement.id,
                                progress: 100
                            })];
                    case 5:
                        _a.sent();
                        unlockedAchievements.push(achievement.toJSON());
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, unlockedAchievements];
                }
            });
        });
    };
    /**
     * 检查是否满足成就条件
     */
    GameService.prototype.meetsAchievementCondition = function (userId, childId, condition) {
        return __awaiter(this, void 0, void 0, function () {
            var whereCondition, count, stars, perfect, speed;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        whereCondition = { userId: userId };
                        if (childId)
                            whereCondition.childId = childId;
                        if (!(condition.type === 'totalGames')) return [3 /*break*/, 2];
                        return [4 /*yield*/, game_record_model_1.GameRecord.count({ where: whereCondition })];
                    case 1:
                        count = _b.sent();
                        return [2 /*return*/, count >= condition.value];
                    case 2:
                        if (!(condition.type === 'totalStars')) return [3 /*break*/, 4];
                        return [4 /*yield*/, game_record_model_1.GameRecord.sum('stars', { where: whereCondition })];
                    case 3:
                        stars = (_b.sent()) || 0;
                        return [2 /*return*/, stars >= condition.value];
                    case 4:
                        if (!(condition.type === 'perfectGame')) return [3 /*break*/, 6];
                        return [4 /*yield*/, game_record_model_1.GameRecord.findOne({
                                where: __assign(__assign({}, whereCondition), { stars: 3, mistakes: 0 })
                            })];
                    case 5:
                        perfect = _b.sent();
                        return [2 /*return*/, !!perfect];
                    case 6:
                        if (!(condition.type === 'speedRecord')) return [3 /*break*/, 8];
                        return [4 /*yield*/, game_record_model_1.GameRecord.findOne({
                                where: __assign(__assign({}, whereCondition), { timeSpent: (_a = {}, _a[sequelize_1.Op.lte] = condition.value, _a) })
                            })];
                    case 7:
                        speed = _b.sent();
                        return [2 /*return*/, !!speed];
                    case 8: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * 获取排行榜
     */
    GameService.prototype.getLeaderboard = function (gameKey, levelNumber, limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var game, whereCondition, level, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, game_config_model_1.GameConfig.findOne({ where: { gameKey: gameKey } })];
                    case 1:
                        game = _a.sent();
                        if (!game)
                            return [2 /*return*/, []];
                        whereCondition = { gameId: game.id };
                        if (!levelNumber) return [3 /*break*/, 3];
                        return [4 /*yield*/, game_level_model_1.GameLevel.findOne({
                                where: { gameId: game.id, levelNumber: levelNumber }
                            })];
                    case 2:
                        level = _a.sent();
                        if (level) {
                            whereCondition.levelId = level.id;
                        }
                        _a.label = 3;
                    case 3: return [4 /*yield*/, game_record_model_1.GameRecord.findAll({
                            where: whereCondition,
                            order: [
                                ['stars', 'DESC'],
                                ['score', 'DESC'],
                                ['timeSpent', 'ASC']
                            ],
                            limit: limit,
                            attributes: [
                                'userId',
                                [game_record_model_1.GameRecord.sequelize.fn('MAX', game_record_model_1.GameRecord.sequelize.col('stars')), 'stars'],
                                [game_record_model_1.GameRecord.sequelize.fn('MAX', game_record_model_1.GameRecord.sequelize.col('score')), 'score'],
                                [game_record_model_1.GameRecord.sequelize.fn('MIN', game_record_model_1.GameRecord.sequelize.col('timeSpent')), 'timeSpent']
                            ],
                            group: ['userId']
                        })];
                    case 4:
                        records = _a.sent();
                        return [2 /*return*/, records.map(function (r) { return r.toJSON(); })];
                }
            });
        });
    };
    return GameService;
}());
exports.GameService = GameService;
exports["default"] = new GameService();
