/**
 * 排行榜服务
 * 
 * 使用Redis Sorted Set实现各种排行榜功能
 */

import RedisService from './redis.service';
import { logger } from '../utils/logger';

/**
 * 排行榜项
 */
export interface RankingItem {
  id: string;
  score: number;
  rank: number;
  data?: any;
}

/**
 * 排行榜配置
 */
export interface RankingConfig {
  key: string;
  ttl?: number;  // 过期时间（秒）
  maxSize?: number;  // 最大保留数量
}

/**
 * 排行榜服务类
 */
class RankingService {
  /**
   * 更新排行榜分数
   */
  async updateScore(key: string, member: string, score: number): Promise<void> {
    try {
      await RedisService.zadd(key, score, member);
      logger.info(`✅ 排行榜分数已更新 [${key}] ${member}: ${score}`);
    } catch (error) {
      logger.error(`更新排行榜分数失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 增加排行榜分数
   */
  async incrementScore(key: string, member: string, increment: number = 1): Promise<number> {
    try {
      const newScore = await RedisService.zincrby(key, increment, member);
      logger.info(`✅ 排行榜分数已增加 [${key}] ${member}: +${increment} = ${newScore}`);
      return newScore;
    } catch (error) {
      logger.error(`增加排行榜分数失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 获取排行榜（从高到低）
   */
  async getTopRanking(
    key: string,
    start: number = 0,
    end: number = 9,
    withScores: boolean = true
  ): Promise<RankingItem[]> {
    try {
      const results = await RedisService.zrevrange(key, start, end, withScores);
      
      const rankings: RankingItem[] = [];
      
      if (withScores) {
        // 结果格式: [member1, score1, member2, score2, ...]
        for (let i = 0; i < results.length; i += 2) {
          rankings.push({
            id: results[i],
            score: parseFloat(results[i + 1]),
            rank: start + rankings.length + 1
          });
        }
      } else {
        // 结果格式: [member1, member2, ...]
        results.forEach((member, index) => {
          rankings.push({
            id: member,
            score: 0,
            rank: start + index + 1
          });
        });
      }

      return rankings;
    } catch (error) {
      logger.error(`获取排行榜失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 获取排行榜（从低到高）
   */
  async getBottomRanking(
    key: string,
    start: number = 0,
    end: number = 9,
    withScores: boolean = true
  ): Promise<RankingItem[]> {
    try {
      const results = await RedisService.zrange(key, start, end, withScores);

      const rankings: RankingItem[] = [];

      if (withScores) {
        // zrange with scores returns array of objects: [{value, score}, ...]
        if (results.length > 0 && typeof results[0] === 'object' && 'value' in results[0]) {
          results.forEach((item: any, index: number) => {
            rankings.push({
              id: item.value,
              score: item.score,
              rank: start + index + 1
            });
          });
        } else {
          // Fallback: flat array format [member, score, member, score, ...]
          for (let i = 0; i < results.length; i += 2) {
            rankings.push({
              id: results[i],
              score: parseFloat(results[i + 1]),
              rank: start + rankings.length + 1
            });
          }
        }
      } else {
        results.forEach((member, index) => {
          rankings.push({
            id: typeof member === 'object' ? (member as any).value : member,
            score: 0,
            rank: start + index + 1
          });
        });
      }

      return rankings;
    } catch (error) {
      logger.error(`获取排行榜失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 获取成员排名（从高到低，排名从1开始）
   */
  async getRank(key: string, member: string): Promise<number | null> {
    try {
      const rank = await RedisService.zrevrank(key, member);
      return rank !== null ? rank + 1 : null;
    } catch (error) {
      logger.error(`获取排名失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 获取成员分数
   */
  async getScore(key: string, member: string): Promise<number | null> {
    try {
      const score = await RedisService.zscore(key, member);
      return score;
    } catch (error) {
      logger.error(`获取分数失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 获取排行榜总数
   */
  async getCount(key: string): Promise<number> {
    try {
      return await RedisService.zcard(key);
    } catch (error) {
      logger.error(`获取排行榜总数失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 删除成员
   */
  async removeMember(key: string, member: string): Promise<void> {
    try {
      await RedisService.zrem(key, member);
      logger.info(`✅ 已从排行榜删除 [${key}] ${member}`);
    } catch (error) {
      logger.error(`删除排行榜成员失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 清空排行榜
   */
  async clear(key: string): Promise<void> {
    try {
      await RedisService.del(key);
      logger.info(`✅ 排行榜已清空 [${key}]`);
    } catch (error) {
      logger.error(`清空排行榜失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 获取分数范围内的成员
   */
  async getRangeByScore(
    key: string,
    minScore: number,
    maxScore: number,
    withScores: boolean = true
  ): Promise<RankingItem[]> {
    try {
      const results = await RedisService.zrangebyscore(key, minScore, maxScore, withScores);
      
      const rankings: RankingItem[] = [];
      
      if (withScores) {
        for (let i = 0; i < results.length; i += 2) {
          rankings.push({
            id: results[i],
            score: parseFloat(results[i + 1]),
            rank: 0  // 按分数范围查询时不计算排名
          });
        }
      } else {
        results.forEach(member => {
          rankings.push({
            id: member,
            score: 0,
            rank: 0
          });
        });
      }

      return rankings;
    } catch (error) {
      logger.error(`按分数范围获取排行榜失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 保留排行榜前N名
   */
  async keepTopN(key: string, n: number): Promise<void> {
    try {
      // 删除排名在n之后的所有成员
      await RedisService.zremrangebyrank(key, 0, -(n + 1));
      logger.info(`✅ 排行榜已保留前${n}名 [${key}]`);
    } catch (error) {
      logger.error(`保留排行榜前N名失败 [${key}]:`, error);
      throw error;
    }
  }

  // ==================== 业务排行榜 ====================

  /**
   * 更新活动报名排行
   */
  async updateActivityRegistrationRanking(activityId: number, studentId: number): Promise<void> {
    const key = `ranking:activity:registrations:${activityId}`;
    const score = Date.now();  // 使用时间戳作为分数，越早报名分数越低
    await this.updateScore(key, `student:${studentId}`, score);
  }

  /**
   * 获取活动报名排行榜
   */
  async getActivityRegistrationRanking(activityId: number, limit: number = 10): Promise<RankingItem[]> {
    const key = `ranking:activity:registrations:${activityId}`;
    return this.getBottomRanking(key, 0, limit - 1);  // 从低到高，越早报名排名越前
  }

  /**
   * 更新学生积分排行
   */
  async updateStudentPointsRanking(studentId: number, points: number): Promise<void> {
    const key = 'ranking:students:points';
    await this.updateScore(key, `student:${studentId}`, points);
  }

  /**
   * 获取学生积分排行榜
   */
  async getStudentPointsRanking(limit: number = 10): Promise<RankingItem[]> {
    const key = 'ranking:students:points';
    return this.getTopRanking(key, 0, limit - 1);
  }

  /**
   * 更新教师评分排行
   */
  async updateTeacherRatingRanking(teacherId: number, rating: number): Promise<void> {
    const key = 'ranking:teachers:rating';
    await this.updateScore(key, `teacher:${teacherId}`, rating);
  }

  /**
   * 获取教师评分排行榜
   */
  async getTeacherRatingRanking(limit: number = 10): Promise<RankingItem[]> {
    const key = 'ranking:teachers:rating';
    return this.getTopRanking(key, 0, limit - 1);
  }

  /**
   * 更新班级活跃度排行
   */
  async updateClassActivityRanking(classId: number, activityCount: number): Promise<void> {
    const key = 'ranking:classes:activity';
    await this.updateScore(key, `class:${classId}`, activityCount);
  }

  /**
   * 获取班级活跃度排行榜
   */
  async getClassActivityRanking(limit: number = 10): Promise<RankingItem[]> {
    const key = 'ranking:classes:activity';
    return this.getTopRanking(key, 0, limit - 1);
  }
}

/**
 * 预定义的排行榜key
 */
export const RankingKeys = {
  // 活动报名排行
  ACTIVITY_REGISTRATION: (activityId: number) => `ranking:activity:registrations:${activityId}`,
  
  // 学生积分排行
  STUDENT_POINTS: 'ranking:students:points',
  
  // 教师评分排行
  TEACHER_RATING: 'ranking:teachers:rating',
  
  // 班级活跃度排行
  CLASS_ACTIVITY: 'ranking:classes:activity',
  
  // 每日活跃用户排行
  DAILY_ACTIVE_USERS: (date: string) => `ranking:users:active:${date}`,
  
  // 每周活跃用户排行
  WEEKLY_ACTIVE_USERS: (week: string) => `ranking:users:active:week:${week}`,
  
  // 每月活跃用户排行
  MONTHLY_ACTIVE_USERS: (month: string) => `ranking:users:active:month:${month}`
};

// 导出单例
export default new RankingService();

