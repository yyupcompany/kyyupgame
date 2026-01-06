import SOPStage from '../models/sop-stage.model';
import SOPTask from '../models/sop-task.model';
import CustomerSOPProgress from '../models/customer-sop-progress.model';
import ConversationRecord from '../models/conversation-record.model';
import ConversationScreenshot from '../models/conversation-screenshot.model';
import AISuggestionHistory from '../models/ai-suggestion-history.model';

export class TeacherSOPService {
  /**
   * 获取所有SOP阶段
   */
  static async getAllStages() {
    return await SOPStage.findAll({
      where: { isActive: true },
      order: [['orderNum', 'ASC']]
    });
  }

  /**
   * 获取阶段详情
   */
  static async getStageById(stageId: number) {
    return await SOPStage.findByPk(stageId);
  }

  /**
   * 获取阶段的所有任务
   */
  static async getTasksByStage(stageId: number) {
    return await SOPTask.findAll({
      where: { 
        stageId,
        isActive: true 
      },
      order: [['orderNum', 'ASC']]
    });
  }

  /**
   * 获取客户的SOP进度
   */
  static async getCustomerProgress(customerId: number, teacherId: number) {
    let progress = await CustomerSOPProgress.findOne({
      where: { customerId, teacherId }
    });

    // 如果没有进度记录，创建一个
    if (!progress) {
      const firstStage = await SOPStage.findOne({
        where: { isActive: true },
        order: [['orderNum', 'ASC']]
      });

      if (!firstStage) {
        throw new Error('没有可用的SOP阶段');
      }

      progress = await CustomerSOPProgress.create({
        customerId,
        teacherId,
        currentStageId: firstStage.id,
        stageProgress: 0,
        completedTasks: [],
        successProbability: 50
      });
    }

    return progress;
  }

  /**
   * 更新客户SOP进度
   */
  static async updateCustomerProgress(
    customerId: number,
    teacherId: number,
    data: {
      currentStageId?: number;
      stageProgress?: number;
      completedTasks?: number[];
      estimatedCloseDate?: Date;
      successProbability?: number;
    }
  ) {
    const progress = await this.getCustomerProgress(customerId, teacherId);
    
    await progress.update(data);
    
    return progress;
  }

  /**
   * 完成任务
   */
  static async completeTask(
    customerId: number,
    teacherId: number,
    taskId: number
  ) {
    const progress = await this.getCustomerProgress(customerId, teacherId);
    
    const completedTasks = progress.completedTasks || [];
    
    if (!completedTasks.includes(taskId)) {
      completedTasks.push(taskId);
      
      // 计算阶段进度
      const stageTasks = await this.getTasksByStage(progress.currentStageId);
      const stageProgress = (completedTasks.filter(id => 
        stageTasks.some(task => task.id === id)
      ).length / stageTasks.length) * 100;
      
      await progress.update({
        completedTasks,
        stageProgress
      });
    }
    
    return progress;
  }

  /**
   * 推进到下一阶段
   */
  static async advanceToNextStage(customerId: number, teacherId: number) {
    const progress = await this.getCustomerProgress(customerId, teacherId);
    
    const currentStage = await SOPStage.findByPk(progress.currentStageId);
    if (!currentStage) {
      throw new Error('当前阶段不存在');
    }
    
    const nextStage = await SOPStage.findOne({
      where: { 
        isActive: true,
        orderNum: currentStage.orderNum + 1
      }
    });
    
    if (!nextStage) {
      throw new Error('已经是最后一个阶段');
    }
    
    await progress.update({
      currentStageId: nextStage.id,
      stageProgress: 0,
      completedTasks: []
    });
    
    return progress;
  }

  /**
   * 获取客户的对话记录
   */
  static async getConversations(customerId: number, teacherId: number) {
    return await ConversationRecord.findAll({
      where: { customerId, teacherId },
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * 添加对话记录
   */
  static async addConversation(data: {
    customerId: number;
    teacherId: number;
    followRecordId?: number;
    speakerType: 'teacher' | 'customer';
    content: string;
    messageType?: 'text' | 'image' | 'voice' | 'video';
    mediaUrl?: string;
    sentiment?: string;
    aiAnalysis?: any;
  }) {
    return await ConversationRecord.create(data);
  }

  /**
   * 批量添加对话记录
   */
  static async addConversationsBatch(conversations: Array<{
    customerId: number;
    teacherId: number;
    speakerType: 'teacher' | 'customer';
    content: string;
    messageType?: 'text' | 'image' | 'voice' | 'video';
  }>) {
    return await ConversationRecord.bulkCreate(conversations);
  }

  /**
   * 上传截图
   */
  static async uploadScreenshot(data: {
    conversationId?: number;
    customerId: number;
    imageUrl: string;
    uploadedBy: number;
  }) {
    return await ConversationScreenshot.create(data);
  }

  /**
   * 获取客户的截图列表
   */
  static async getScreenshots(customerId: number) {
    return await ConversationScreenshot.findAll({
      where: { customerId },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * 更新截图分析结果
   */
  static async updateScreenshotAnalysis(
    screenshotId: number,
    analysis: {
      recognizedText?: string;
      aiAnalysis?: any;
    }
  ) {
    const screenshot = await ConversationScreenshot.findByPk(screenshotId);
    if (!screenshot) {
      throw new Error('截图不存在');
    }
    
    await screenshot.update(analysis);
    
    return screenshot;
  }

  /**
   * 保存AI建议历史
   */
  static async saveAISuggestion(data: {
    customerId: number;
    teacherId: number;
    taskId?: number;
    suggestionType?: string;
    inputContext?: any;
    aiResponse?: any;
  }) {
    return await AISuggestionHistory.create(data);
  }

  /**
   * 获取AI建议历史
   */
  static async getAISuggestionHistory(
    customerId: number,
    teacherId: number,
    limit: number = 10
  ) {
    return await AISuggestionHistory.findAll({
      where: { customerId, teacherId },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * 标记AI建议为已应用
   */
  static async markSuggestionAsApplied(suggestionId: number) {
    const suggestion = await AISuggestionHistory.findByPk(suggestionId);
    if (!suggestion) {
      throw new Error('AI建议不存在');
    }
    
    await suggestion.update({ isApplied: true });
    
    return suggestion;
  }

  /**
   * 提交AI建议反馈
   */
  static async submitSuggestionFeedback(
    suggestionId: number,
    feedbackScore: number
  ) {
    const suggestion = await AISuggestionHistory.findByPk(suggestionId);
    if (!suggestion) {
      throw new Error('AI建议不存在');
    }
    
    await suggestion.update({ feedbackScore });
    
    return suggestion;
  }

  /**
   * 计算成功概率
   */
  static async calculateSuccessProbability(
    customerId: number,
    teacherId: number
  ): Promise<number> {
    const progress = await this.getCustomerProgress(customerId, teacherId);
    const conversations = await this.getConversations(customerId, teacherId);
    
    // 基础分数
    let score = 50;
    
    // 根据阶段进度加分
    const currentStage = await SOPStage.findByPk(progress.currentStageId);
    if (currentStage) {
      score += (currentStage.orderNum / 7) * 20; // 最多加20分
    }
    
    // 根据任务完成度加分
    if (progress.stageProgress) {
      score += (progress.stageProgress / 100) * 15; // 最多加15分
    }
    
    // 根据沟通频率加分
    if (conversations.length > 5) {
      score += 10;
    }
    
    // 根据情感分析加分
    const positiveConversations = conversations.filter(
      c => (c as any).sentiment === 'positive'
    );
    if (positiveConversations.length > conversations.length / 2) {
      score += 5;
    }
    
    return Math.min(Math.round(score), 100);
  }
}

