import { GameConfig } from '../../models/game-config.model';
import { GameLevel } from '../../models/game-level.model';
import { GameRecord } from '../../models/game-record.model';
import { GameAchievement } from '../../models/game-achievement.model';
import { UserAchievement } from '../../models/user-achievement.model';
import { GameUserSettings } from '../../models/game-user-settings.model';
import { Op } from 'sequelize';

/**
 * 游戏服务
 */
export class GameService {
  /**
   * 获取所有游戏列表
   */
  async getGameList(userId?: number): Promise<any[]> {
    const games = await GameConfig.findAll({
      where: { status: 'active' },
      order: [['sortOrder', 'ASC']]
    });

    // 如果提供了userId，附加用户进度信息
    if (userId) {
      const gamesWithProgress = await Promise.all(
        games.map(async (game) => {
          const records = await GameRecord.findAll({
            where: { userId, gameId: game.id },
            order: [['completedAt', 'DESC']],
            limit: 1
          });

          const totalStars = await GameRecord.sum('stars', {
            where: { userId, gameId: game.id }
          });

          const playCount = await GameRecord.count({
            where: { userId, gameId: game.id }
          });

          return {
            ...game.toJSON(),
            userProgress: {
              lastPlayed: records[0]?.completedAt || null,
              totalStars: totalStars || 0,
              playCount: playCount || 0,
              bestScore: records[0]?.score || 0
            }
          };
        })
      );

      return gamesWithProgress;
    }

    return games.map(g => g.toJSON());
  }

  /**
   * 获取游戏详情
   */
  async getGameDetail(gameKey: string): Promise<any> {
    const game = await GameConfig.findOne({
      where: { gameKey, status: 'active' }
    });

    if (!game) {
      throw new Error('游戏不存在');
    }

    return game.toJSON();
  }

  /**
   * 获取游戏关卡列表
   */
  async getGameLevels(gameKey: string, userId?: number): Promise<any[]> {
    const game = await GameConfig.findOne({
      where: { gameKey }
    });

    if (!game) {
      throw new Error('游戏不存在');
    }

    const levels = await GameLevel.findAll({
      where: { gameId: game.id },
      order: [['levelNumber', 'ASC']]
    });

    // 如果提供了userId，附加用户进度
    if (userId) {
      const levelsWithProgress = await Promise.all(
        levels.map(async (level) => {
          const records = await GameRecord.findAll({
            where: { userId, levelId: level.id },
            order: [['stars', 'DESC'], ['score', 'DESC']],
            limit: 1
          });

          const bestRecord = records[0];
          const isUnlocked = await this.checkLevelUnlocked(userId, level.id);

          return {
            ...level.toJSON(),
            isUnlocked,
            bestStars: bestRecord?.stars || 0,
            bestScore: bestRecord?.score || 0,
            playCount: await GameRecord.count({
              where: { userId, levelId: level.id }
            })
          };
        })
      );

      return levelsWithProgress;
    }

    return levels.map(l => l.toJSON());
  }

  /**
   * 检查关卡是否解锁
   */
  async checkLevelUnlocked(userId: number, levelId: number): Promise<boolean> {
    const level = await GameLevel.findByPk(levelId);
    if (!level) return false;

    // 第一关默认解锁
    if (level.levelNumber === 1) return true;

    // 检查前一关是否完成
    const previousLevel = await GameLevel.findOne({
      where: {
        gameId: level.gameId,
        levelNumber: level.levelNumber - 1
      }
    });

    if (!previousLevel) return false;

    // 检查前一关是否至少获得1星
    const previousRecord = await GameRecord.findOne({
      where: {
        userId,
        levelId: previousLevel.id,
        stars: { [Op.gte]: 1 }
      }
    });

    return !!previousRecord;
  }

  /**
   * 保存游戏记录
   */
  async saveGameRecord(data: {
    userId: number;
    childId?: number;
    gameKey: string;
    levelNumber: number;
    score: number;
    timeSpent: number;
    accuracy?: number;
    mistakes?: number;
    comboMax?: number;
    gameData?: any;
  }): Promise<any> {
    const game = await GameConfig.findOne({
      where: { gameKey: data.gameKey }
    });

    if (!game) {
      throw new Error('游戏不存在');
    }

    const level = await GameLevel.findOne({
      where: {
        gameId: game.id,
        levelNumber: data.levelNumber
      }
    });

    if (!level) {
      throw new Error('关卡不存在');
    }

    // 计算星级
    const stars = this.calculateStars(level, {
      timeSpent: data.timeSpent,
      accuracy: data.accuracy,
      mistakes: data.mistakes
    });

    // 保存记录
    const record = await GameRecord.create({
      userId: data.userId,
      childId: data.childId || null,
      gameId: game.id,
      levelId: level.id,
      score: data.score,
      stars,
      timeSpent: data.timeSpent,
      accuracy: data.accuracy || null,
      mistakes: data.mistakes || 0,
      comboMax: data.comboMax || 0,
      gameData: data.gameData || null
    });

    // 检查是否解锁成就
    await this.checkAndUnlockAchievements(data.userId, data.childId);

    return {
      ...record.toJSON(),
      stars,
      isNewBest: await this.isNewBestScore(data.userId, level.id, data.score)
    };
  }

  /**
   * 计算星级
   */
  private calculateStars(level: GameLevel, performance: {
    timeSpent: number;
    accuracy?: number;
    mistakes?: number;
  }): number {
    if (!level.starRequirements) return 1;

    const { threeStars, twoStars, oneStar } = level.starRequirements;

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
  }

  /**
   * 检查是否满足星级要求
   */
  private meetsRequirement(performance: any, requirement: any): boolean {
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
  }

  /**
   * 检查是否是新最佳成绩
   */
  private async isNewBestScore(userId: number, levelId: number, score: number): Promise<boolean> {
    const bestRecord = await GameRecord.findOne({
      where: { userId, levelId },
      order: [['score', 'DESC']],
      limit: 1
    });

    return !bestRecord || score > bestRecord.score;
  }

  /**
   * 获取用户设置
   */
  async getUserSettings(userId: number, childId?: number): Promise<any> {
    let settings = await GameUserSettings.findOne({
      where: {
        userId,
        childId: childId || null
      }
    });

    // 如果不存在，创建默认设置
    if (!settings) {
      settings = await GameUserSettings.create({
        userId,
        childId: childId || null
      });
    }

    return settings.toJSON();
  }

  /**
   * 更新用户设置
   */
  async updateUserSettings(
    userId: number,
    updates: Partial<{
      bgmVolume: number;
      sfxVolume: number;
      voiceVolume: number;
      difficultyPreference: 'auto' | 'easy' | 'medium' | 'hard';
      animationSpeed: number;
      showHints: number;
      vibrationEnabled: number;
      settings: any;
    }>,
    childId?: number
  ): Promise<any> {
    let settings = await GameUserSettings.findOne({
      where: {
        userId,
        childId: childId || null
      }
    });

    if (!settings) {
      settings = await GameUserSettings.create({
        userId,
        childId: childId || null,
        ...updates
      });
    } else {
      await settings.update(updates);
    }

    return settings.toJSON();
  }

  /**
   * 获取游戏统计数据
   */
  async getGameStatistics(userId: number, gameKey?: string): Promise<any> {
    const whereCondition: any = { userId };

    if (gameKey) {
      const game = await GameConfig.findOne({ where: { gameKey } });
      if (game) {
        whereCondition.gameId = game.id;
      }
    }

    const totalGames = await GameRecord.count({ where: whereCondition });
    const totalStars = await GameRecord.sum('stars', { where: whereCondition }) || 0;
    const totalScore = await GameRecord.sum('score', { where: whereCondition }) || 0;
    const totalTime = await GameRecord.sum('timeSpent', { where: whereCondition }) || 0;

    const avgAccuracy = await GameRecord.findOne({
      where: whereCondition,
      attributes: [
        [GameRecord.sequelize!.fn('AVG', GameRecord.sequelize!.col('accuracy')), 'avgAccuracy']
      ],
      raw: true
    }) as any;

    return {
      totalGames,
      totalStars,
      totalScore,
      totalTime,
      avgAccuracy: avgAccuracy?.avgAccuracy || 0,
      avgTimePerGame: totalGames > 0 ? Math.round(totalTime / totalGames) : 0
    };
  }

  /**
   * 检查并解锁成就
   */
  async checkAndUnlockAchievements(userId: number, childId?: number): Promise<any[]> {
    const achievements = await GameAchievement.findAll();
    const unlockedAchievements: any[] = [];

    for (const achievement of achievements) {
      // 检查是否已解锁
      const existing = await UserAchievement.findOne({
        where: {
          userId,
          childId: childId || null,
          achievementId: achievement.id
        }
      });

      if (existing) continue;

      // 检查是否满足解锁条件
      const meets = await this.meetsAchievementCondition(userId, childId, achievement.condition);

      if (meets) {
        await UserAchievement.create({
          userId,
          childId: childId || null,
          achievementId: achievement.id,
          progress: 100
        });

        unlockedAchievements.push(achievement.toJSON());
      }
    }

    return unlockedAchievements;
  }

  /**
   * 检查是否满足成就条件
   */
  private async meetsAchievementCondition(
    userId: number,
    childId: number | undefined,
    condition: any
  ): Promise<boolean> {
    const whereCondition: any = { userId };
    if (childId) whereCondition.childId = childId;

    if (condition.type === 'totalGames') {
      const count = await GameRecord.count({ where: whereCondition });
      return count >= condition.value;
    }

    if (condition.type === 'totalStars') {
      const stars = await GameRecord.sum('stars', { where: whereCondition }) || 0;
      return stars >= condition.value;
    }

    if (condition.type === 'perfectGame') {
      const perfect = await GameRecord.findOne({
        where: {
          ...whereCondition,
          stars: 3,
          mistakes: 0
        }
      });
      return !!perfect;
    }

    if (condition.type === 'speedRecord') {
      const speed = await GameRecord.findOne({
        where: {
          ...whereCondition,
          timeSpent: { [Op.lte]: condition.value }
        }
      });
      return !!speed;
    }

    return false;
  }

  /**
   * 获取排行榜
   */
  async getLeaderboard(gameKey: string, levelNumber?: number, limit = 10): Promise<any[]> {
    const game = await GameConfig.findOne({ where: { gameKey } });
    if (!game) return [];

    const whereCondition: any = { gameId: game.id };

    if (levelNumber) {
      const level = await GameLevel.findOne({
        where: { gameId: game.id, levelNumber }
      });
      if (level) {
        whereCondition.levelId = level.id;
      }
    }

    const records = await GameRecord.findAll({
      where: whereCondition,
      order: [
        ['stars', 'DESC'],
        ['score', 'DESC'],
        ['timeSpent', 'ASC']
      ],
      limit,
      attributes: [
        'userId',
        [GameRecord.sequelize!.fn('MAX', GameRecord.sequelize!.col('stars')), 'stars'],
        [GameRecord.sequelize!.fn('MAX', GameRecord.sequelize!.col('score')), 'score'],
        [GameRecord.sequelize!.fn('MIN', GameRecord.sequelize!.col('timeSpent')), 'timeSpent']
      ],
      group: ['userId']
    });

    return records.map(r => r.toJSON());
  }
}

export default new GameService();

