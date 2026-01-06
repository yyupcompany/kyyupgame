/**
 * Redis Pub/Sub服务
 * 
 * 实现基于Redis的发布订阅功能，用于实时消息推送
 */

import { createClient, RedisClientType } from 'redis';
import { getRedisConfig, toRedisClientOptions } from '../config/redis.config';
import { logger } from '../utils/logger';

/**
 * 消息处理器类型
 */
export type MessageHandler = (message: any, channel: string) => void;

/**
 * 订阅信息
 */
interface Subscription {
  channel: string;
  handler: MessageHandler;
  subscriber: RedisClientType;
}

/**
 * Pub/Sub统计
 */
interface PubSubStats {
  totalPublished: number;
  totalReceived: number;
  activeSubscriptions: number;
  channels: string[];
}

/**
 * Pub/Sub服务类
 */
class PubSubService {
  private publisher: RedisClientType | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private stats: PubSubStats = {
    totalPublished: 0,
    totalReceived: 0,
    activeSubscriptions: 0,
    channels: []
  };

  /**
   * 初始化发布者客户端
   */
  private async ensurePublisher(): Promise<RedisClientType> {
    if (this.publisher && this.publisher.isOpen) {
      return this.publisher;
    }

    const config = getRedisConfig();
    const options = toRedisClientOptions(config);

    this.publisher = createClient(options) as RedisClientType;

    this.publisher.on('error', (err) => {
      logger.error('Pub/Sub发布者错误:', err);
    });

    await this.publisher.connect();
    logger.info('✅ Pub/Sub发布者已连接');

    return this.publisher;
  }

  /**
   * 发布消息
   */
  async publish(channel: string, message: any): Promise<number> {
    try {
      const publisher = await this.ensurePublisher();
      const messageStr = typeof message === 'string' 
        ? message 
        : JSON.stringify(message);

      const receivers = await publisher.publish(channel, messageStr);
      
      this.stats.totalPublished++;
      
      logger.info(`📤 消息已发布到频道 [${channel}], 接收者: ${receivers}`);
      
      return receivers;
    } catch (error) {
      logger.error(`发布消息失败 [channel=${channel}]:`, error);
      throw error;
    }
  }

  /**
   * 订阅频道
   */
  async subscribe(channel: string, handler: MessageHandler): Promise<void> {
    try {
      // 检查是否已订阅
      if (this.subscriptions.has(channel)) {
        logger.warn(`频道 [${channel}] 已被订阅`);
        return;
      }

      // 创建订阅者客户端
      const config = getRedisConfig();
      const options = toRedisClientOptions(config);
      const subscriber = createClient(options) as RedisClientType;

      subscriber.on('error', (err) => {
        logger.error(`订阅者错误 [${channel}]:`, err);
      });

      await subscriber.connect();

      // 订阅频道
      await subscriber.subscribe(channel, (message, ch) => {
        try {
          this.stats.totalReceived++;
          
          // 尝试解析JSON
          let parsedMessage: any;
          try {
            parsedMessage = JSON.parse(message);
          } catch {
            parsedMessage = message;
          }

          logger.info(`📥 收到消息 [${ch}]:`, parsedMessage);
          
          // 调用处理器
          handler(parsedMessage, ch);
        } catch (error) {
          logger.error(`处理消息失败 [${ch}]:`, error);
        }
      });

      // 保存订阅信息
      this.subscriptions.set(channel, {
        channel,
        handler,
        subscriber
      });

      this.stats.activeSubscriptions++;
      if (!this.stats.channels.includes(channel)) {
        this.stats.channels.push(channel);
      }

      logger.info(`✅ 已订阅频道 [${channel}]`);
    } catch (error) {
      logger.error(`订阅频道失败 [${channel}]:`, error);
      throw error;
    }
  }

  /**
   * 取消订阅
   */
  async unsubscribe(channel: string): Promise<void> {
    try {
      const subscription = this.subscriptions.get(channel);
      
      if (!subscription) {
        logger.warn(`频道 [${channel}] 未被订阅`);
        return;
      }

      // 取消订阅
      await subscription.subscriber.unsubscribe(channel);
      
      // 断开订阅者连接
      await subscription.subscriber.quit();

      // 删除订阅信息
      this.subscriptions.delete(channel);

      this.stats.activeSubscriptions--;
      const channelIndex = this.stats.channels.indexOf(channel);
      if (channelIndex > -1) {
        this.stats.channels.splice(channelIndex, 1);
      }

      logger.info(`✅ 已取消订阅频道 [${channel}]`);
    } catch (error) {
      logger.error(`取消订阅失败 [${channel}]:`, error);
      throw error;
    }
  }

  /**
   * 取消所有订阅
   */
  async unsubscribeAll(): Promise<void> {
    const channels = Array.from(this.subscriptions.keys());
    
    for (const channel of channels) {
      await this.unsubscribe(channel);
    }

    logger.info('✅ 已取消所有订阅');
  }

  /**
   * 获取统计信息
   */
  getStats(): PubSubStats {
    return { ...this.stats };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats.totalPublished = 0;
    this.stats.totalReceived = 0;
    // 保留activeSubscriptions和channels
  }

  /**
   * 获取活跃订阅列表
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * 检查频道是否已订阅
   */
  isSubscribed(channel: string): boolean {
    return this.subscriptions.has(channel);
  }

  /**
   * 断开所有连接
   */
  async disconnect(): Promise<void> {
    try {
      // 取消所有订阅
      await this.unsubscribeAll();

      // 断开发布者连接
      if (this.publisher && this.publisher.isOpen) {
        await this.publisher.quit();
        this.publisher = null;
      }

      logger.info('👋 Pub/Sub服务已断开');
    } catch (error) {
      logger.error('断开Pub/Sub服务失败:', error);
      throw error;
    }
  }
}

/**
 * 预定义的频道名称
 */
export const PubSubChannels = {
  // 系统通知
  SYSTEM_NOTIFICATION: 'system:notification',
  
  // 用户通知
  USER_NOTIFICATION: (userId: number) => `user:${userId}:notification`,
  
  // 活动通知
  ACTIVITY_NOTIFICATION: 'activity:notification',
  ACTIVITY_REGISTRATION: (activityId: number) => `activity:${activityId}:registration`,
  
  // 招生通知
  ENROLLMENT_NOTIFICATION: 'enrollment:notification',
  
  // 实时更新
  REALTIME_UPDATE: 'realtime:update',
  
  // 排行榜更新
  RANKING_UPDATE: 'ranking:update'
};

// 导出单例
export default new PubSubService();

