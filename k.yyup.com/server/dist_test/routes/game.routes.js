"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var game_controller_1 = require("../controllers/game.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1["default"].Router();
// 游戏列表和详情
router.get('/list', auth_middleware_1.verifyToken, game_controller_1.gameController.getGameList);
router.get('/:gameKey', auth_middleware_1.verifyToken, game_controller_1.gameController.getGameDetail);
router.get('/:gameKey/levels', auth_middleware_1.verifyToken, game_controller_1.gameController.getGameLevels);
// 游戏记录
router.post('/record', auth_middleware_1.verifyToken, game_controller_1.gameController.saveGameRecord);
// 用户设置
router.get('/settings/user', auth_middleware_1.verifyToken, game_controller_1.gameController.getUserSettings);
router.put('/settings/user', auth_middleware_1.verifyToken, game_controller_1.gameController.updateUserSettings);
// 统计和排行榜
router.get('/statistics/user', auth_middleware_1.verifyToken, game_controller_1.gameController.getGameStatistics);
router.get('/:gameKey/leaderboard', auth_middleware_1.verifyToken, game_controller_1.gameController.getLeaderboard);
exports["default"] = router;
