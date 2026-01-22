/**
* game管理路由文件
* 提供game的基础CRUD操作
*
* 功能包括：
* - 获取game列表
* - 创建新game
* - 获取game详情
* - 更新game信息
* - 删除game
*
* 权限要求：需要有效的JWT Token认证
*/

import express from 'express';
import { gameController } from '../controllers/game.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

// 获取游戏列表
router.get('/list', verifyToken, gameController.getGameList);

// 获取游戏详情
router.get('/:gameKey', verifyToken, gameController.getGameDetail);

// 获取游戏关卡列表
router.get('/:gameKey/levels', verifyToken, gameController.getGameLevels);

// 保存游戏记录
router.post('/record', verifyToken, gameController.saveGameRecord);

// 获取用户游戏设置
router.get('/settings/user', verifyToken, gameController.getUserSettings);

// 更新用户游戏设置
router.put('/settings/user', verifyToken, gameController.updateUserSettings);

// 获取用户游戏统计
router.get('/statistics/user', verifyToken, gameController.getGameStatistics);

// 获取游戏排行榜
router.get('/:gameKey/leaderboard', verifyToken, gameController.getLeaderboard);

export default router;
