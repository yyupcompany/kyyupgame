/**
 * AI专家咨询控制器
 * 处理专家咨询相关的API请求
 */

import { Request, Response } from 'express';
import expertConsultationService from '../../services/ai/expert-consultation.service';
import { ConsultationRequest } from '../../services/ai/interfaces/expert-consultation.interface';

/**
 * AI专家咨询控制器类
 */
class ExpertConsultationController {

  /**
   * 启动专家咨询
   */
  async startConsultation(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || req.body.userId;
      const { query, context, preferences } = req.body;

      // 验证必要参数
      if (!userId) {
        res.status(401).json({
          code: 401,
          message: '用户未认证',
          data: null
        });
        return;
      }

      if (!query || !query.trim()) {
        res.status(400).json({
          code: 400,
          message: '请提供咨询问题',
          data: null
        });
        return;
      }

      // 验证问题长度
      if (query.trim().length < 10) {
        res.status(400).json({
          code: 400,
          message: '咨询问题至少需要10个字符',
          data: null
        });
        return;
      }

      if (query.trim().length > 2000) {
        res.status(400).json({
          code: 400,
          message: '咨询问题不能超过2000个字符',
          data: null
        });
        return;
      }

      const request: ConsultationRequest = {
        userId,
        query: query.trim(),
        context,
        preferences
      };

      const session = await expertConsultationService.startConsultation(request);

      res.json({
        code: 200,
        message: '专家咨询会话已创建，即将开始多智能体专家分析',
        data: session
      });
    } catch (error) {
      console.error('启动专家咨询失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '启动咨询失败',
        data: null
      });
    }
  }

  /**
   * 获取下一个专家发言
   */
  async getNextExpertSpeech(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          code: 400,
          message: '缺少会话ID',
          data: null
        });
        return;
      }

      const speech = await expertConsultationService.getNextExpertSpeech(sessionId);

      res.json({
        code: 200,
        message: '获取专家发言成功',
        data: speech
      });
    } catch (error) {
      console.error('获取专家发言失败:', error);

      // 处理特定错误
      if (error instanceof Error) {
        if (error.message === 'All experts have spoken') {
          res.status(400).json({
            code: 400,
            message: '所有专家已发言完毕',
            data: null
          });
          return;
        }
        if (error.message === 'Session not found') {
          res.status(404).json({
            code: 404,
            message: '会话不存在',
            data: null
          });
          return;
        }
      }

      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '获取专家发言失败',
        data: null
      });
    }
  }

  /**
   * 流式获取专家发言
   */
  async getExpertSpeechStream(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { expertIndex } = req.query;

      if (!sessionId) {
        res.status(400).json({
          code: 400,
          message: '缺少会话ID',
          data: null
        });
        return;
      }

      if (expertIndex === undefined || expertIndex === null) {
        res.status(400).json({
          code: 400,
          message: '缺少专家索引',
          data: null
        });
        return;
      }

      // 设置SSE响应头
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // 发送连接确认
      res.write(`data: ${JSON.stringify({
        type: 'connected',
        message: '专家发言流式连接已建立'
      })}\n\n`);

      // 调用服务获取流式专家发言
      await expertConsultationService.getExpertSpeechStream(sessionId);

      // 发送完成信号
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        message: '专家发言完成'
      })}\n\n`);

      res.end();

    } catch (error) {
      console.error('流式获取专家发言失败:', error);

      // 发送错误信息
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: error instanceof Error ? error.message : '流式获取专家发言失败'
      })}\n\n`);

      res.end();
    }
  }

  /**
   * 获取咨询进度
   */
  async getConsultationProgress(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          code: 400,
          message: '缺少会话ID',
          data: null
        });
        return;
      }

      const progress = await expertConsultationService.getConsultationProgress(sessionId);

      res.json({
        code: 200,
        message: '获取咨询进度成功',
        data: progress
      });
    } catch (error) {
      console.error('获取咨询进度失败:', error);
      
      if (error instanceof Error && error.message === 'Session not found') {
        res.status(404).json({
          code: 404,
          message: '会话不存在',
          data: null
        });
        return;
      }

      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '获取咨询进度失败',
        data: null
      });
    }
  }

  /**
   * 获取咨询汇总
   */
  async getConsultationSummary(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          code: 400,
          message: '缺少会话ID',
          data: null
        });
        return;
      }

      const summary = await expertConsultationService.getConsultationSummary(sessionId);

      res.json({
        code: 200,
        message: '获取咨询汇总成功',
        data: summary
      });
    } catch (error) {
      console.error('获取咨询汇总失败:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Session not found') {
          res.status(404).json({
            code: 404,
            message: '会话不存在',
            data: null
          });
          return;
        }
        if (error.message === 'Consultation not completed') {
          res.status(400).json({
            code: 400,
            message: '咨询尚未完成',
            data: null
          });
          return;
        }
      }

      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '获取咨询汇总失败',
        data: null
      });
    }
  }

  /**
   * 生成行动计划
   */
  async generateActionPlan(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          code: 400,
          message: '缺少会话ID',
          data: null
        });
        return;
      }

      const actionPlan = await expertConsultationService.generateActionPlan(sessionId);

      res.json({
        code: 200,
        message: '生成行动计划成功',
        data: actionPlan
      });
    } catch (error) {
      console.error('生成行动计划失败:', error);
      
      if (error instanceof Error && error.message === 'Session not found') {
        res.status(404).json({
          code: 404,
          message: '会话不存在',
          data: null
        });
        return;
      }

      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '生成行动计划失败',
        data: null
      });
    }
  }

  /**
   * 获取咨询会话详情
   */
  async getConsultationSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          code: 400,
          message: '缺少会话ID',
          data: null
        });
        return;
      }

      const session = await expertConsultationService.getConsultationSession(sessionId);

      if (!session) {
        res.status(404).json({
          code: 404,
          message: '会话不存在',
          data: null
        });
        return;
      }

      res.json({
        code: 200,
        message: '获取会话详情成功',
        data: session
      });
    } catch (error) {
      console.error('获取会话详情失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '获取会话详情失败',
        data: null
      });
    }
  }

  /**
   * 获取用户咨询历史
   */
  async getUserConsultations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        res.status(401).json({
          code: 401,
          message: '用户未认证',
          data: null
        });
        return;
      }

      const consultations = await expertConsultationService.getUserConsultations(userId);

      res.json({
        code: 200,
        message: '获取咨询历史成功',
        data: {
          consultations,
          total: consultations.length
        }
      });
    } catch (error) {
      console.error('获取咨询历史失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '获取咨询历史失败',
        data: null
      });
    }
  }

  /**
   * 获取专家类型列表
   */
  async getExpertTypes(req: Request, res: Response): Promise<void> {
    try {
      const expertTypes = [
        { type: 'planner', name: '招生策划专家', description: '擅长活动策划和品牌营销' },
        { type: 'psychologist', name: '心理学专家', description: '专注儿童心理发展和家长需求分析' },
        { type: 'investor', name: '投资分析专家', description: '精通财务规划和成本控制' },
        { type: 'director', name: '园长管理专家', description: '拥有丰富的园所运营管理经验' },
        { type: 'teacher', name: '执行教师专家', description: '熟悉一线教学和活动执行' },
        { type: 'parent', name: '家长体验专家', description: '从用户角度评估活动吸引力' }
      ];

      res.json({
        code: 200,
        message: '获取专家类型成功',
        data: expertTypes
      });
    } catch (error) {
      console.error('获取专家类型失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '获取专家类型失败',
        data: null
      });
    }
  }
}

// 导出控制器实例
export default new ExpertConsultationController();