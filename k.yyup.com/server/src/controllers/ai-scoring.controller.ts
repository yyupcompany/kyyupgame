import { Request, Response } from 'express';
import { DocumentAIScore } from '../models/document-ai-score.model';
import { unifiedAIBridge } from '../services/unified-ai-bridge.service';
import { aiPromptService } from '../services/ai-prompt.service';
import { createClient } from 'redis';

// Redis客户端（用于存储评分时间限制）
let redisClient: any = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    await redisClient.connect();
  }
  return redisClient;
}

export class AIScoringController {
  /**
   * 检查是否可以开始评分（每周一次限制）
   */
  async checkAvailability(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const kindergartenId = user.kindergartenId || user.id;
      
      const redis = await getRedisClient();
      const key = `ai-scoring:last:${kindergartenId}`;
      const lastTime = await redis.get(key);
      
      if (!lastTime) {
        return res.json({
          canStart: true,
          lastScoringTime: null,
          nextAvailableTime: null,
          remainingDays: 0
        });
      }
      
      const lastDate = new Date(parseInt(lastTime));
      const now = new Date();
      const weekInMs = 7 * 24 * 60 * 60 * 1000;
      const timeSince = now.getTime() - lastDate.getTime();
      
      if (timeSince < weekInMs) {
        const nextDate = new Date(lastDate.getTime() + weekInMs);
        const remainingMs = nextDate.getTime() - now.getTime();
        const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
        
        return res.json({
          canStart: false,
          lastScoringTime: lastDate.toISOString(),
          nextAvailableTime: nextDate.toISOString(),
          remainingDays
        });
      }
      
      res.json({
        canStart: true,
        lastScoringTime: lastDate.toISOString(),
        nextAvailableTime: null,
        remainingDays: 0
      });
      
    } catch (error: any) {
      console.error('检查评分权限失败:', error);
      res.status(500).json({ 
        message: '检查评分权限失败', 
        error: error.message 
      });
    }
  }

  /**
   * 分析单个文档
   */
  async analyzeDocument(req: Request, res: Response) {
    const startTime = Date.now();
    
    try {
      const user = (req as any).user;
      const {
        documentInstanceId,
        documentTemplateId,
        templateType,
        templateName,
        content
      } = req.body;

      if (!documentInstanceId || !content) {
        return res.status(400).json({ 
          message: '缺少必要参数' 
        });
      }

      // 1. 获取提示词模板
      const promptTemplate = aiPromptService.getTemplate(templateType || 'default');
      
      // 2. 构建完整提示词
      const prompt = aiPromptService.buildPrompt(promptTemplate, content);
      
      // 3. 调用AI分析
      console.log(`开始分析文档: ${documentInstanceId} - ${templateName}`);
      const chatResponse = await unifiedAIBridge.chat({
        model: 'doubao-seed-1-6-flash-250715',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      });

      // 4. 解析AI结果
      const aiResult = chatResponse.data?.content || '';
      const scoreData = this.parseAIResult(aiResult);
      const processingTime = Date.now() - startTime;
      
      console.log(`文档分析完成: ${documentInstanceId} - 评分: ${scoreData.score}分`);
      
      // 5. 保存到数据库
      await DocumentAIScore.create({
        documentInstanceId,
        documentTemplateId: documentTemplateId || 0,
        templateType: templateType || 'default',
        templateName: templateName || '',
        promptVersion: promptTemplate.version,
        aiModel: 'doubao-1.6-flash',
        score: scoreData.score,
        grade: scoreData.grade,
        analysisResult: scoreData,
        categoryScores: scoreData.categoryScores,
        suggestions: scoreData.suggestions,
        risks: scoreData.risks,
        highlights: scoreData.highlights,
        processingTime,
        status: 'completed',
        createdBy: user.id
      });
      
      res.json({
        success: true,
        data: scoreData
      });
      
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      console.error('AI分析失败:', error);
      
      // 记录失败
      try {
        const user = (req as any).user;
        await DocumentAIScore.create({
          documentInstanceId: req.body.documentInstanceId,
          documentTemplateId: req.body.documentTemplateId || 0,
          templateType: req.body.templateType || 'default',
          templateName: req.body.templateName || '',
          promptVersion: 'v1.0',
          aiModel: 'doubao-1.6-flash',
          analysisResult: {},
          processingTime,
          status: 'failed',
          errorMessage: error.message,
          createdBy: user.id
        });
      } catch (dbError) {
        console.error('保存失败记录失败:', dbError);
      }
      
      res.status(500).json({ 
        success: false,
        message: 'AI分析失败', 
        error: error.message 
      });
    }
  }

  /**
   * 记录本次评分时间
   */
  async recordScoringTime(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const kindergartenId = user.kindergartenId || user.id;
      const now = Date.now().toString();
      
      const redis = await getRedisClient();
      const key = `ai-scoring:last:${kindergartenId}`;
      
      // 保存到Redis，30天过期
      await redis.setEx(key, 30 * 24 * 60 * 60, now);
      
      res.json({ success: true });
      
    } catch (error: any) {
      console.error('记录评分时间失败:', error);
      res.status(500).json({ 
        message: '记录评分时间失败', 
        error: error.message 
      });
    }
  }

  /**
   * 获取历史评分记录
   */
  async getHistory(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { page = 1, pageSize = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(pageSize);

      const { count, rows } = await DocumentAIScore.findAndCountAll({
        where: {
          createdBy: user.id,
          status: 'completed'
        },
        order: [['createdAt', 'DESC']],
        limit: Number(pageSize),
        offset
      });

      res.json({
        total: count,
        list: rows,
        page: Number(page),
        pageSize: Number(pageSize)
      });

    } catch (error: any) {
      console.error('获取历史记录失败:', error);
      res.status(500).json({
        message: '获取历史记录失败',
        error: error.message
      });
    }
  }

  /**
   * 解析AI返回的JSON结果
   */
  private parseAIResult(aiOutput: string): any {
    try {
      return JSON.parse(aiOutput);
    } catch (error) {
      try {
        // 尝试移除markdown代码块标记
        let fixed = aiOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        fixed = fixed.trim();
        return JSON.parse(fixed);
      } catch (error2) {
        console.error('AI结果解析失败:', aiOutput);
        throw new Error('AI返回的结果格式不正确');
      }
    }
  }
}

export const aiScoringController = new AIScoringController();

