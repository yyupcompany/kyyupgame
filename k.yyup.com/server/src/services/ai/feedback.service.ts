/**
 * AI反馈服务
 * 管理用户对AI响应的反馈
 */

import { AIFeedback } from '../../models';
import { FeedbackType, FeedbackStatus } from '../../models/ai-feedback.model';

export interface FeedbackData {
  userId: number;
  messageId?: number;
  conversationId?: string;
  rating?: number;
  content?: string;
  feedbackType?: FeedbackType;
  status?: FeedbackStatus;
}

export class FeedbackService {
  /**
   * 创建反馈
   */
  async createFeedback(data: FeedbackData): Promise<any> {
    try {
      const feedback = await AIFeedback.create({
        userId: data.userId,
        messageId: data.messageId,
        conversationId: data.conversationId,
        rating: data.rating,
        content: data.content,
        feedbackType: data.feedbackType || FeedbackType.GENERAL
      });
      return feedback;
    } catch (error) {
      console.error('创建反馈失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户反馈列表
   */
  async getUserFeedback(userId: number): Promise<any[]> {
    try {
      const feedbacks = await AIFeedback.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });
      return feedbacks;
    } catch (error) {
      console.error('获取反馈列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取消息反馈
   */
  async getMessageFeedback(messageId: number): Promise<any[]> {
    try {
      const feedbacks = await AIFeedback.findAll({
        where: { messageId }
      });
      return feedbacks;
    } catch (error) {
      console.error('获取消息反馈失败:', error);
      throw error;
    }
  }

  /**
   * 更新反馈
   */
  async updateFeedback(feedbackId: number, data: Partial<FeedbackData>): Promise<any> {
    try {
      const feedback = await AIFeedback.findByPk(feedbackId);
      if (!feedback) throw new Error('反馈不存在');
      await feedback.update(data);
      return feedback;
    } catch (error) {
      console.error('更新反馈失败:', error);
      throw error;
    }
  }

  /**
   * 获取反馈统计
   */
  async getFeedbackStats(): Promise<any> {
    try {
      const allFeedback = await AIFeedback.findAll();
      const total = allFeedback.length;
      const avgRating = total > 0 
        ? allFeedback.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / total 
        : 0;

      return {
        total,
        averageRating: avgRating,
        positive: allFeedback.filter((f: any) => f.rating && f.rating >= 4).length,
        negative: allFeedback.filter((f: any) => f.rating && f.rating <= 2).length
      };
    } catch (error) {
      console.error('获取反馈统计失败:', error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();
export default feedbackService;

