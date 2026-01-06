import { Request, Response } from 'express';
import gameService from '../services/games/game.service';
import { ApiError } from '../utils/apiError';

/**
 * 游戏控制器
 */
export class GameController {
  /**
   * 获取游戏列表
   */
  async getGameList(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const games = await gameService.getGameList(userId);

      res.json({
        success: true,
        data: games
      });
    } catch (error: any) {
      throw ApiError.badRequest(error.message);
    }
  }

  /**
   * 获取游戏详情
   */
  async getGameDetail(req: Request, res: Response) {
    try {
      const { gameKey } = req.params;
      const game = await gameService.getGameDetail(gameKey);

      res.json({
        success: true,
        data: game
      });
    } catch (error: any) {
      throw ApiError.notFound(error.message);
    }
  }

  /**
   * 获取游戏关卡
   */
  async getGameLevels(req: Request, res: Response) {
    try {
      const { gameKey } = req.params;
      const userId = req.user?.id;
      const levels = await gameService.getGameLevels(gameKey, userId);

      res.json({
        success: true,
        data: levels
      });
    } catch (error: any) {
      throw ApiError.badRequest(error.message);
    }
  }

  /**
   * 保存游戏记录
   */
  async saveGameRecord(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        childId,
        gameKey,
        levelNumber,
        score,
        timeSpent,
        accuracy,
        mistakes,
        comboMax,
        gameData
      } = req.body;

      const record = await gameService.saveGameRecord({
        userId,
        childId,
        gameKey,
        levelNumber,
        score,
        timeSpent,
        accuracy,
        mistakes,
        comboMax,
        gameData
      });

      res.json({
        success: true,
        data: record,
        message: '游戏记录保存成功'
      });
    } catch (error: any) {
      throw ApiError.badRequest(error.message);
    }
  }

  /**
   * 获取用户设置
   */
  async getUserSettings(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { childId } = req.query;

      const settings = await gameService.getUserSettings(
        userId,
        childId ? parseInt(childId as string) : undefined
      );

      res.json({
        success: true,
        data: settings
      });
    } catch (error: any) {
      throw ApiError.badRequest(error.message);
    }
  }

  /**
   * 更新用户设置
   */
  async updateUserSettings(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { childId, ...updates } = req.body;

      const settings = await gameService.updateUserSettings(userId, updates, childId);

      res.json({
        success: true,
        data: settings,
        message: '设置保存成功'
      });
    } catch (error: any) {
      throw ApiError.badRequest(error.message);
    }
  }

  /**
   * 获取游戏统计
   */
  async getGameStatistics(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { gameKey } = req.query;

      const stats = await gameService.getGameStatistics(userId, gameKey as string);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      throw ApiError.badRequest(error.message);
    }
  }

  /**
   * 获取排行榜
   */
  async getLeaderboard(req: Request, res: Response) {
    try {
      const { gameKey } = req.params;
      const { levelNumber, limit } = req.query;

      const leaderboard = await gameService.getLeaderboard(
        gameKey,
        levelNumber ? parseInt(levelNumber as string) : undefined,
        limit ? parseInt(limit as string) : 10
      );

      res.json({
        success: true,
        data: leaderboard
      });
    } catch (error: any) {
      throw ApiError.badRequest(error.message);
    }
  }
}

export const gameController = new GameController();

