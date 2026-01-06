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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.gameController = exports.GameController = void 0;
var game_service_1 = __importDefault(require("../services/games/game.service"));
var apiError_1 = require("../utils/apiError");
/**
 * 游戏控制器
 */
var GameController = /** @class */ (function () {
    function GameController() {
    }
    /**
     * 获取游戏列表
     */
    GameController.prototype.getGameList = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, games, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        return [4 /*yield*/, game_service_1["default"].getGameList(userId)];
                    case 1:
                        games = _b.sent();
                        res.json({
                            success: true,
                            data: games
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        throw apiError_1.ApiError.badRequest(error_1.message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取游戏详情
     */
    GameController.prototype.getGameDetail = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var gameKey, game, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        gameKey = req.params.gameKey;
                        return [4 /*yield*/, game_service_1["default"].getGameDetail(gameKey)];
                    case 1:
                        game = _a.sent();
                        res.json({
                            success: true,
                            data: game
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        throw apiError_1.ApiError.notFound(error_2.message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取游戏关卡
     */
    GameController.prototype.getGameLevels = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var gameKey, userId, levels, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        gameKey = req.params.gameKey;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        return [4 /*yield*/, game_service_1["default"].getGameLevels(gameKey, userId)];
                    case 1:
                        levels = _b.sent();
                        res.json({
                            success: true,
                            data: levels
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        throw apiError_1.ApiError.badRequest(error_3.message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 保存游戏记录
     */
    GameController.prototype.saveGameRecord = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, _a, childId, gameKey, levelNumber, score, timeSpent, accuracy, mistakes, comboMax, gameData, record, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = req.user.id;
                        _a = req.body, childId = _a.childId, gameKey = _a.gameKey, levelNumber = _a.levelNumber, score = _a.score, timeSpent = _a.timeSpent, accuracy = _a.accuracy, mistakes = _a.mistakes, comboMax = _a.comboMax, gameData = _a.gameData;
                        return [4 /*yield*/, game_service_1["default"].saveGameRecord({
                                userId: userId,
                                childId: childId,
                                gameKey: gameKey,
                                levelNumber: levelNumber,
                                score: score,
                                timeSpent: timeSpent,
                                accuracy: accuracy,
                                mistakes: mistakes,
                                comboMax: comboMax,
                                gameData: gameData
                            })];
                    case 1:
                        record = _b.sent();
                        res.json({
                            success: true,
                            data: record,
                            message: '游戏记录保存成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        throw apiError_1.ApiError.badRequest(error_4.message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户设置
     */
    GameController.prototype.getUserSettings = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, childId, settings, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        userId = req.user.id;
                        childId = req.query.childId;
                        return [4 /*yield*/, game_service_1["default"].getUserSettings(userId, childId ? parseInt(childId) : undefined)];
                    case 1:
                        settings = _a.sent();
                        res.json({
                            success: true,
                            data: settings
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        throw apiError_1.ApiError.badRequest(error_5.message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新用户设置
     */
    GameController.prototype.updateUserSettings = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, _a, childId, updates, settings, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = req.user.id;
                        _a = req.body, childId = _a.childId, updates = __rest(_a, ["childId"]);
                        return [4 /*yield*/, game_service_1["default"].updateUserSettings(userId, updates, childId)];
                    case 1:
                        settings = _b.sent();
                        res.json({
                            success: true,
                            data: settings,
                            message: '设置保存成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _b.sent();
                        throw apiError_1.ApiError.badRequest(error_6.message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取游戏统计
     */
    GameController.prototype.getGameStatistics = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, gameKey, stats, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        userId = req.user.id;
                        gameKey = req.query.gameKey;
                        return [4 /*yield*/, game_service_1["default"].getGameStatistics(userId, gameKey)];
                    case 1:
                        stats = _a.sent();
                        res.json({
                            success: true,
                            data: stats
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        throw apiError_1.ApiError.badRequest(error_7.message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取排行榜
     */
    GameController.prototype.getLeaderboard = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var gameKey, _a, levelNumber, limit, leaderboard, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        gameKey = req.params.gameKey;
                        _a = req.query, levelNumber = _a.levelNumber, limit = _a.limit;
                        return [4 /*yield*/, game_service_1["default"].getLeaderboard(gameKey, levelNumber ? parseInt(levelNumber) : undefined, limit ? parseInt(limit) : 10)];
                    case 1:
                        leaderboard = _b.sent();
                        res.json({
                            success: true,
                            data: leaderboard
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _b.sent();
                        throw apiError_1.ApiError.badRequest(error_8.message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return GameController;
}());
exports.GameController = GameController;
exports.gameController = new GameController();
